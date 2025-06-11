import axios from 'axios';
import config from '../../config.js';
import logger from '../../shared/utils/logger.js';

import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';

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

    // Create prompt for AI
    const prompt = createTipsPrompt(eventsWithCourses, options);

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
function createTipsPrompt(events, options) {
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
  return `You are a helpful academic advisor providing personalized study tips to a student.

STUDENT INFORMATION:
- Time available for studying: ${timeAvailable || 'Not specified'} hours
- Preferred study style: ${studyStyle || 'Not specified'}

UPCOMING ASSIGNMENTS/TESTS (sorted by earliest deadline first):
${upcomingEvents || 'No upcoming events'}

RECENTLY COMPLETED ASSIGNMENTS/TESTS:
${completedEvents || 'No completed events'}

Based on the student's upcoming deadlines, completed work, available study time, and preferred study style, provide personalized study tips and a suggested study schedule. Include specific strategies for prioritizing tasks, managing time effectively, and preparing for upcoming assessments. Keep your response concise, practical, and tailored to the student's specific situation.`;
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
