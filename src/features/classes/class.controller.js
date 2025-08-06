import logger from '../../shared/utils/logger.js';

import Class from '../../shared/models/class.model.js';

async function getClasses(userId, options = {}) {
  logger.info(`Fetching classes for user ${userId}`);

  try {
    // Set default date range (one week)
    const today = new Date();
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);


    // Override with provided date range if available
    if (options.from) {
      startDate = new Date(options.from);
    }
    if (options.to) {
      endDate = new Date(options.to);
    }

    // Build query
    let query = {
      userId,
    };

    // Handle past parameter
    if (options.past === 'true') {
      // For past classes, get classes that have ended (endTime < current date)
      query.endTime = { $lt: today };
    } else {
      // For current/future classes, use the date range filter
      query.startTime = { $gte: startDate, $lte: endDate };
    }

    // Filter by courseId
    if (options.courseId) {
        query.courseId = options.courseId;
    }

    // Execute query
    let classQuery = Class.find(query);

    // Populate course data if expand parameter is set
    if (options.expand === 'course') {
      classQuery = classQuery.populate('courseId');
    }

    const classes = await classQuery.lean();
    logger.debug({classes}, `Classes fetched from database`);

    let filteredClasses = classes;
    // Filter by room (schedule location)
    if (options.room) {
      const roomQuery = options.room.toLowerCase().trim();
      console.log(`Filtering by room: '${roomQuery}'`);

      filteredClasses = filteredClasses.filter(cls => {
        const schedule = cls.courseId?.schedule;

        if (!Array.isArray(schedule)) return false;

        // Find the schedule entry matching this class's classType
        const matchedSchedule = schedule.find(s => s.classType === cls.classType);

        const location = matchedSchedule?.location?.toLowerCase() ?? '';
        const match = location.includes(roomQuery);

        console.log(`Checking class location '${location}', match: ${match}`);
        return match;
      });
    }

    // Filter by professor (instructor name)
    if (options.professor) {
      logger.debug(`Options Professor: ${options.professor}`);
      const profQuery = options.professor.toLowerCase();

      filteredClasses = filteredClasses.filter(cls => {
        const instructorName = cls.courseId?.instructor?.name.toLowerCase();
        logger.debug(`Instructor Name: ${instructorName}`);
        return instructorName.includes(profQuery);
      });
    }

    logger.debug({ options }, 'Received options in getClasses');
    logger.debug({ query }, 'Mongo query before execution');

    if (!classes || classes.length === 0) {
      logger.info(`No classes found for user ${userId}`);
      return { success: true, classes: [] };
    }

    logger.info(`Fetched ${classes.length} classes for user ${userId}`);
    logger.debug({ classes }, 'Classes fetched from database');
    return { success: true, classes: filteredClasses };
  } catch (error) {
    logger.error({ error }, 'Error fetching classes from database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function deleteClass(classId, userId) {
  logger.info(`Deleting class ${classId} for user ${userId}`);

  try {
    const classToDelete = await Class.findOne({ _id: classId, userId });

    if (!classToDelete) {
      logger.info(`Class ${classId} not found for user ${userId}`);
      return { success: false, status: 404, errors: ['Class not found'] };
    }

    await Class.deleteOne({ _id: classId });
    logger.info(`Deleted class ${classId} for user ${userId}`);

    return { success: true };
  } catch (error) {
    logger.error({ error }, `Error deleting class ${classId}`);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getClasses, deleteClass };
