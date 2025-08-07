import axios from 'axios';
import config from '../../config.js';
import logger from '../../shared/utils/logger.js';

import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';
import User from '../../shared/models/user.model.js';

/**
 * Get personalized study tips based on user's events
 * @param {String} userId - User ID
 * @param {Object} options - Options for generating tips
 * @param {Number} options.timeAvailable - Time available for studying in hours
 * @param {String} options.studyStyle - User's preferred study style
 * @returns {Object} - Object containing success status and tips
 */
async function getStudyTips(userId, options = {}) {
  logger.debug(`Generating study tips for user ${userId} with options:`, options);

  try {
    // Get upcoming events (not completed)
    const upcomingEvents = await Event.find({
      userId,
      isCompleted: false,
      end: { $gte: new Date() },
    })
      .sort({ end: 1 }) // Sort by earliest deadline first
      .limit(10); // Limit to 10 upcoming events

    // Get recently completed events
    const completedEvents = await Event.find({
      userId,
      isCompleted: true,
    })
      .sort({ end: -1 }) // Sort by most recently completed
      .limit(5); // Limit to 5 recent events

    logger.info(
      `Found ${upcomingEvents.length} upcoming events and ${completedEvents.length} completed events for user ${userId}`
    );

    // Combine all events
    const allEvents = [...upcomingEvents, ...completedEvents];

    if (allEvents.length === 0) {
      return {
        success: true,
        tips: "I don't have any events to analyze. Add some assignments, tests, or projects to get personalized study tips!",
      };
    }

    // Prepare events with course data
    const eventsWithCourses = [];
    for (const event of allEvents) {
      try {
        const course = await Course.findById(event.courseID);
        const eventObj = event.toObject();

        if (course) {
          eventObj.course = course.toObject();
        }

        // Add completion status for clarity
        eventObj.status = event.isCompleted ? 'completed' : 'upcoming';

        eventsWithCourses.push(eventObj);
      } catch (error) {
        logger.error({ error }, `Error fetching course for event ${event._id}`);
        const eventObj = event.toObject();
        eventObj.status = event.isCompleted ? 'completed' : 'upcoming';
        eventsWithCourses.push(eventObj);
      }
    }

    const { habits } = await User.findById(userId, 'habits');
    logger.debug({ habits }, `Fetched habits for user ${userId}`);

    // Create prompt for AI
    const prompt = createTipsPrompt(eventsWithCourses, habits, options);
    logger.debug({ prompt }, 'Generated prompt for AI:');

    // Get tips from OpenRouter API
    const tips = await getAITips(prompt);

    return { success: true, tips };
  } catch (error) {
    logger.error({ error }, `Error generating study tips for user ${userId}`);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

/**
 * Create a prompt for the AI based on events and user preferences
 * @param {Array} events - List of events with course data
 * @param {Object} options - User preferences
 * @returns {String} - Formatted prompt for AI
 */
function createTipsPrompt(events, habits, options) {
  const { timeAvailable, studyStyle } = options;

  // Format upcoming events
  const upcomingEvents = events
    .filter((event) => event.status === 'upcoming')
    .map((event) => {
      const courseInfo = event.course
        ? `for course ${event.course.title} (${event.course.code})`
        : '';

      return `- ${event.title} (${event.type}): Due on ${new Date(event.end).toLocaleDateString()}. Weight: ${event.weight}% ${courseInfo}`;
    })
    .join('\n');

  // Format completed events
  const completedEvents = events
    .filter((event) => event.status === 'completed')
    .map((event) => {
      const grade = event.grade !== null ? `Grade: ${event.grade}%` : 'No grade yet';
      const courseInfo = event.course
        ? `for course ${event.course.title} (${event.course.code})`
        : '';

      return `- ${event.title} (${event.type}): Completed. ${grade} ${courseInfo}`;
    })
    .join('\n');

  // Create the prompt
  return `You are a helpful academic advisor who writes personalized reports for students. Your task is to generate a short performance report in markdown format, using the structure and logic described below. You will be given background information (not to be included in your final output), including the student's habits, tasks, and preferences.

Goal:
- Summarize the student's performance.
- Praise completed work (if any), give practical advice, and suggest improvements.
- Give advice on upcoming tasks based on performance and preferences.
- Provide a personalized tip and study plan using all available data.
- Use bold to highlight the most important ideas in your report.
- You may use bullet points in the sections "Recently Completed Tasks," "Upcoming Tasks," and "Personalized tip for student" for clearer explanation.
- The total response must be at least 300 words.
- Use natural language and do not mention any raw data or index names directly.

Template Format and Instructions:
## Personalized Student Report 
Write a short paragraph summarizing the student's overall academic performance, habits, and progress. Use natural and encouraging language. Consider their performance, consistency, and habits. Do not refer to any raw data or metrics. 
### Recently Completed Tasks 
(Only include this section if there are any completed tasks. If there are none, skip this section entirely.)

Praise the student for their completed tasks. Then give practical suggestions on how they could have approached the tasks more efficiently or improved the outcome. Keep advice actionable and short. 
### Upcoming Tasks
(Only include this section if there are any completed tasks. If there are none, skip this section entirely.)

Give advice on how the student should prepare for their upcoming tasks. Consider: 
- Previous performance 
- Available study time 
- Preferred study style 
- Work habits  

Tailor the advice specifically to their situation.  
### Personalized tip for student 
Give a practical and encouraging piece of advice for the student to improve or maintain good habits. Focus on how to manage time better, avoid bad habits like procrastination, or improve consistency. If the student is doing well, praise them and suggest how to stay on track.  

Create a brief suggested study plan or strategy. Prioritize important tasks, and recommend how to manage time effectively. Use natural language (e.g., “Try studying in short, regular sessions…”), do not mention scores or habit index names directly.

End of Template.

Input Variables You’ll Receive:
(These are for your reasoning only — do not include them in your response.)
- Completed Tasks: ${completedEvents || 'No completed events'}
- Upcoming Tasks: ${upcomingEvents || 'No upcoming events'}
- Time Available: ${timeAvailable || 'Not specified'} hours
- Study Style: ${studyStyle || 'Not specified'}
- Habits:
  - Procrastination Index: ${habits.procrastinationIndex || 'Not specified'} (0-100 scale, lower is better, 0 = no procrastination, 100 = extreme procrastination)
	- Consistency Index: ${habits.consistencyIndex || 'Not specified'} (0-100; higher is better. 0 = cramming, 100 = evenly spaced study sessions)
	- Grade Stability Index: ${habits.gradeStabilityIndex || 'Not specified'} (0-100; higher is better. 0 = grades vary greatly, 100 = grades are consistent)
	- Completion Efficiency Index: ${habits.completionEfficiencyIndex || 'Not specified'} (0-100; higher is better. 0 = many assignments incomplete, 100 = all assignments completed)

Important Guidelines:
- Never include index names (e.g., "Procrastination Index") or numerical scores in the response.
- Use natural phrases like:
  - “You seem to put things off at times…”
  - “Your study patterns suggest strong consistency…”
  - “Your performance shows steady progress…”
- Avoid generic or vague advice - be specific and practical.
- Keep tone supportive, professional, and motivational.`
}

/**
 * Get AI-generated tips using OpenRouter API
 * @param {String} prompt - Prompt for the AI
 * @returns {String} - AI-generated tips
 */
async function getAITips(prompt) {
  logger.debug('Preparing to send request to OpenRouter API for study tips');

  const openRouterApiKey = config.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    logger.error('OpenRouter API key is not defined in environment variables');
    throw new Error('Server configuration error - API key missing');
  }

  try {
    const requestPayload = {
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    };

    logger.debug('Sending request to OpenRouter for study tips');

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'http://localhost:8080',
          'X-Title': 'Seneca PRJ-666 Study Tips Assistant',
        },
      }
    );

    logger.debug('Received response from OpenRouter API');

    // Extract the AI response
    const aiResponse =
      response.data.choices[0]?.message?.content ||
      "Sorry, I couldn't generate study tips at this time. Please try again later.";

    return aiResponse;
  } catch (error) {
    logger.error({ error }, 'Error getting AI tips from OpenRouter');
    throw error;
  }
}

export { getStudyTips };
