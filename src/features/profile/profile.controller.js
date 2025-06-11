import logger from '../../shared/utils/logger.js';
import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';

/**
 * Get the closest upcoming event and completion percentage for the current semester
 * @param {string} userId - The ID of the user
 * @returns {Object} - Object containing success status, upcoming event, and completion percentage
 */
async function getProfileData(userId) {
  logger.debug(`Fetching profile data for user ${userId}`);

  try {
    // Get current date
    const currentDate = new Date();

    // Define current semester (approximate dates)
    // This could be replaced with actual semester dates from a settings or configuration
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Determine semester dates based on current month
    let semesterStartDate, semesterEndDate;

    if (currentMonth >= 0 && currentMonth <= 4) {
      // Winter semester (January - April)
      semesterStartDate = new Date(currentYear, 0, 1); // January 1st
      semesterEndDate = new Date(currentYear, 4, 30); // April 30th
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      // Summer semester (May - August)
      semesterStartDate = new Date(currentYear, 5, 1); // May 1st
      semesterEndDate = new Date(currentYear, 7, 31); // August 31st
    } else {
      // Fall semester (September - December)
      semesterStartDate = new Date(currentYear, 8, 1); // September 1st
      semesterEndDate = new Date(currentYear, 11, 31); // December 31st
    }

    // Find all events for the current semester
    const allSemesterEvents = await Event.find({
      userId,
      end: { $gte: semesterStartDate, $lte: semesterEndDate },
    });

    // Calculate completion percentage
    const totalEvents = allSemesterEvents.length;
    const completedEvents = allSemesterEvents.filter((event) => event.isCompleted).length;

    // Calculate percentage (0 if no events)
    const completionPercentage =
      totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

    // Find the closest upcoming event
    const upcomingEvents = await Event.find({
      userId,
      end: { $gte: currentDate },
    })
      .sort({ end: 1 })
      .limit(1);

    let upcomingEvent = null;

    // If there's an upcoming event, expand it with course details
    if (upcomingEvents.length > 0) {
      upcomingEvent = upcomingEvents[0].toObject();

      try {
        const course = await Course.findById(upcomingEvent.courseID);
        if (course) {
          upcomingEvent.course = course.toObject();
        }
      } catch (courseError) {
        logger.error(
          { error: courseError },
          `Error fetching course for event ${upcomingEvent._id}`
        );
      }
    }

    logger.info(`Successfully fetched profile data for user ${userId}`);

    return {
      success: true,
      upcomingEvent,
      completionPercentage,
      hasEvents: totalEvents > 0,
    };
  } catch (error) {
    logger.error({ error }, `Error fetching profile data for user ${userId}`);
    return {
      success: false,
      status: 500,
      errors: ['Internal server error'],
    };
  }
}

export { getProfileData };
