import logger from '../utils/logger.js';

import userModel from '../models/userModel.js';

async function createUser(userId) {
  logger.debug('Starting user creation process');

  try {
    let user = await userModel.findById(userId);

    if (!user) {
      user = await userModel.create({ _id: userId });
      logger.info({ user }, 'User created successfully and saved to database');
    } else {
      logger.error({ user }, 'User already exists in database');
      return { success: false, status: 409, errors: ['User already exists'] };
    }

    return { success: true };
  } catch (err) {
    logger.error({ err }, 'Error creating user in database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { createUser };
