import logger from '../../shared/utils/logger.js';
import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';

/**
 * Calculate importance score for an event based on multiple factors
 * @param {Object} event - The event object
 * @param {Object} course - The course object (optional)
 * @returns {Number} - Calculated importance score
 */
const calculateImportanceScore = (event, course = null) => {
  // Initialize base score
  let score = 0;

  // Factor 1: Time left before deadline (sooner = more urgent)
  const now = new Date();
  const deadline = new Date(event.end);
  const timeLeftMs = deadline - now;
  const daysLeft = timeLeftMs / (1000 * 60 * 60 * 24); // Convert to days

  // Score decreases as days increase (more urgent as deadline approaches)
  // Max 50 points for time factor
  const timeFactor = Math.max(0, 50 - Math.min(daysLeft, 10) * 5);
  score += timeFactor;

  // Factor 2: Weight of the task (higher = more important)
  // Max 30 points for weight factor
  const weightFactor = (event.weight / 100) * 30;
  score += weightFactor;

  // Factor 3 & 4: Course grade and goal gap
  if (event.grade !== null && course) {
    // Factor 3: User's current grade (low grade = more urgent)
    // Max 10 points for grade factor
    const gradeFactor = Math.max(0, 10 - event.grade / 10);
    score += gradeFactor;

    // Factor 4: Course goal (100%) vs grade gap
    // The bigger the gap, the more urgent high-weight tasks become
    // Max 10 points for goal gap factor
    const goalGap = 100 - event.grade;
    const goalGapFactor = (goalGap / 100) * (event.weight / 100) * 10;
    score += goalGapFactor;
  } else {
    // If no grade data, add default points to balance scoring
    score += 10;
  }

  // Round to 2 decimal places for cleaner output
  return Math.round(score * 100) / 100;
};

/**
 * Get smart todo list for the authenticated user
 * @param {String} userId - User ID
 * @returns {Object} - Object containing success status and events
 */
export async function getSmartTodo(userId) {
  logger.debug(`Fetching smart todo list for user ${userId}`);

  try {
    // Get all upcoming (not completed) events for the user
    const events = await Event.find({
      userId,
      isCompleted: false,
      end: { $gte: new Date() },
    });

    logger.info(`Found ${events.length} upcoming events for user ${userId}`);

    if (events.length === 0) {
      return { success: true, events: [] };
    }

    // Prepare array to hold events with course data and importance score
    const smartEvents = [];

    // Process each event to add course data and calculate importance score
    for (const event of events) {
      try {
        // Get course data for the event
        const course = await Course.findById(event.courseID);

        // Create a new object with event data, course data, and importance score
        const eventObj = event.toObject();

        // Add course data
        if (course) {
          eventObj.course = course.toObject();
        }

        // Calculate and add importance score
        eventObj.importanceScore = calculateImportanceScore(eventObj, course);

        smartEvents.push(eventObj);
      } catch (error) {
        logger.error({ error }, `Error processing event ${event._id}`);
        // Still include the event but without course data
        const eventObj = event.toObject();
        eventObj.importanceScore = calculateImportanceScore(eventObj);
        smartEvents.push(eventObj);
      }
    }

    // Sort events by importance score (highest first)
    smartEvents.sort((a, b) => b.importanceScore - a.importanceScore);

    logger.debug({ smartEvents }, 'Smart todo list generated and sorted by importance');
    return { success: true, events: smartEvents };
  } catch (error) {
    logger.error({ error }, `Error fetching smart todo list for user ${userId}`);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}
