import logger from '../../shared/utils/logger.js';
import validateGoal from './goal.validator.js';

import Goal from '../../shared/models/goal.model.js';

// TODO: Delete inactive goals
async function getGoals(
  userId,
  options = {
    expandCourse: false,
  }
) {
  logger.debug('Starting goal retrieval process');

  try {
    const query = Goal.find({ userId });

    // If expandCourse is true, populate the courseId field
    if (options.expandCourse) {
      query.populate('courseId');
    }

    const goals = await query.lean().exec();

    // If expandCourse is true, map the courseId to course
    if (options.expandCourse) {
      goals.map((goal) => {
        goal.course = goal.courseId;
        delete goal.courseId;
        return goal;
      });
    }

    logger.info({ goals }, 'Goals retrieved successfully');

    return { success: true, goals };
  } catch (error) {
    logger.error({ error }, 'Error retrieving goals');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function updateGoal(userId, goalId, data) {
  logger.debug(`Updating goal ${goalId} for user ${userId}`);

  const { success, parsedData, errors } = validateGoal({ ...data, userId });

  if (!success) {
    return { success: false, status: 400, errors };
  }

  try {
    const updatedGoal = await Goal.findOneAndUpdate({ _id: goalId, userId }, parsedData, {
      new: true,
    });

    if (!updatedGoal) {
      logger.warn(`Goal with ID ${goalId} not found for user ${userId}`);
      return { success: false, status: 404, errors: ['Goal not found'] };
    }

    logger.info({ updatedGoal }, 'Goal updated successfully');
    return { success: true, goal: updatedGoal };
  } catch (error) {
    logger.error({ error }, 'Error updating goal');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function deleteGoal(userId, goalId) {
  logger.debug(`Deleting goal ${goalId} for user ${userId}`);

  try {
    const deletedGoal = await Goal.findOneAndDelete({ _id: goalId, userId });

    if (!deletedGoal) {
      logger.warn(`Goal with ID ${goalId} not found for user ${userId}`);
      return { success: false, status: 404, errors: ['Goal not found'] };
    }

    logger.info({ deletedGoal }, 'Goal deleted successfully');
    return { success: true, goal: deletedGoal };
  } catch (error) {
    logger.error({ error }, 'Error deleting goal');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function createGoal(userId, data) {
  logger.debug('Starting goal creation process');
  const { success, parsedData, errors } = validateGoal({ ...data, userId });

  if (!success) {
    return { success: false, status: 400, errors };
  }

  try {
    const goal = await Goal.create(parsedData);

    logger.info({ goal }, 'Event created successfully and saved to database');
    return { success: true, goal };
  } catch (error) {
    logger.error({ error }, 'Error creating goal');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getGoals, updateGoal, createGoal, deleteGoal };
