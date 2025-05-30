import logger from '../../shared/utils/logger.js';

import User from '../../shared/models/user.model.js';

async function createUser(userId) {
  logger.debug('Starting user creation process');

  try {
    let user = await User.findById(userId);

    if (!user) {
      user = await User.create({ _id: userId });
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
