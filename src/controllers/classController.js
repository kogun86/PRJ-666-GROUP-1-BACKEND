import logger from '../utils/logger.js';

import classModel from '../models/classModel.js';

async function createClassesInPeriod(userId, courseId, schedule, startDate, endDate) {
  try {
    logger.debug('Starting class creation process');

    let classes = getClassesFromSchedule(schedule, startDate, endDate);
    classes = classes.map((classSession) => ({
      userId,
      courseId,
      ...classSession,
      events: [],
      topics: [],
    }));

    logger.debug({ classes }, 'Classes to be created');

    await classModel.insertMany(classes);
    logger.info('Classes created successfully');
  } catch (error) {
    logger.error({ error }, 'Error creating classes');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }

  return { success: true };
}

function getClassesFromSchedule(schedule, startDate, endDate) {
  const classes = [];

  let current = new Date(startDate);
  logger.debug({ current }, 'Course start date received for processing');

  // Loop until we reach endDate
  while (current <= endDate) {
    logger.debug({ current }, 'Current date being processed');

    // Filter class sessions for the current day
    const classesToday = schedule.filter((session) => session.weekday === current.getUTCDay());

    // If there are classes for today, calculate their start and end times
    if (classesToday.length > 0) {
      classesToday.forEach((session) => {
        let startTime = new Date(current.valueOf() + session.startTime * 1000);
        let endTime = new Date(startTime.valueOf() + (session.endTime - session.startTime) * 1000);

        logger.debug({ startTime, endTime }, 'Class time calculated for session');

        classes.push({
          classType: session.classType,
          startTime: startTime,
          endTime: endTime,
        });
      });
    }

    // Move to the next day
    current = new Date(current.valueOf() + 24 * 60 * 60 * 1000);
  }

  return classes;
}

export { createClassesInPeriod };
