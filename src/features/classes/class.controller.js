import logger from '../../shared/utils/logger.js';

import Class from '../../shared/models/class.model.js';

async function getClasses(userId) {
  logger.info(`Fetching classes for user ${userId}`);

  try {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);

    const classes = await Class.find({
      userId,
      startTime: { $gte: today, $lte: endDate },
    }).lean();

    if (!classes || classes.length === 0) {
      logger.info(`No classes found for user ${userId}`);
      return { success: true, classes: [] };
    }

    logger.info(`Fetched ${classes.length} classes for user ${userId}`);
    logger.debug({ classes }, 'Classes fetched from database');
    return { success: true, classes };
  } catch (error) {
    logger.error({ error }, 'Error fetching classes from database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getClasses };
