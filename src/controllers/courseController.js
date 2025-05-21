import logger from '../utils/logger.js';
import validateCourse from '../utils/validation/courseValidation.js';

import courseModel from '../models/courseModel.js';

async function createCourse(userId, data) {
  logger.debug('Starting course creation process');
  const { success, parsedData, errors } = validateCourse({ ...data, userId });

  if (!success) {
    return { success: false, status: 400, errors };
  }

  try {
    const course = await courseModel.create(parsedData);
    logger.info({ course }, 'Course created successfully and saved to database');
  } catch (err) {
    logger.error({ err }, 'Error creating course in database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }

  // TODO: Create classes for the course

  return { success: true };
}

export { createCourse };
