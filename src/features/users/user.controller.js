import logger from '../../shared/utils/logger.js';

import User from '../../shared/models/user.model.js';
import Event from '../../shared/models/event.model.js';

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

// TODO: Rework this is temporary solution (Not prod)
// TODO: Track event creation dates
// TODO: Change updateProcrastinationIndex to use a more complex algorithm
async function updateProcrastinationIndex(userId, dueDate) {
  logger.debug({ userId, dueDate }, 'Updating procrastination index for user');

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error({ userId }, 'User not found');
      return { success: false, status: 404, errors: ['User not found'] };
    }

    // Simple example: Increase procrastination index based on how close the due date is
    const daysUntilDue = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));

    let indexChange = 0;
    
    if (daysUntilDue == 0) {
      indexChange = 30; // Due today
    }
    else if (daysUntilDue < 3) {
      indexChange = 15; // Due in less than 3 days
    }
    else if (5 <= daysUntilDue) {
      indexChange = -30; // More than 5 days away
    }
    else if (3 <= daysUntilDue) {
      indexChange = -15; // More than 3 days away
    }

    const newIndex = Math.min(100, Math.max(0, user.habits.procrastinationIndex + indexChange));

    user.habits.procrastinationIndex = newIndex;
    await user.save();

    logger.info({ userId, newIndex }, 'Procrastination index updated successfully');
    return { success: true };
  } catch (err) {
    logger.error({ err }, 'Error updating procrastination index');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

// TODO: Rework this is temporary solution (Not prod)
// TODO: Track event creation dates
// TODO: Implement a more complex algorithm for consistency index
async function updateConsistencyIndex(userId) {
  logger.debug({ userId }, 'Updating consistency index for user');

  try {
    const completedEvents = await Event.find({ userId, isCompleted: true })
      .sort({ completionDate: -1 })
      .limit(10); // Limit to last 10 completed events

    
  } catch (err) {
    logger.error({ err }, 'Error updating consistency index');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

// TODO: Rework this is temporary solution (Not prod)
// TODO: Implement a more complex algorithm for consistency index
async function gradeStabilityIndex(userId, grade) {
  logger.debug({ userId }, 'Updating grade stability index for user');

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error({ userId }, 'User not found');
      return { success: false, status: 404, errors: ['User not found'] };
    }

    const completedEvents = await Event.find({ userId, grade: { $ne: null, $exists: true } })
      .limit(10); // Limit to last 10 completed events

    const averageGrade = completedEvents.reduce((sum, event) => sum + event.grade, 0) / completedEvents.length;
    let indexChange = 0;

    logger.debug({ averageGrade }, 'Calculated average grade for user');

    if (grade >= averageGrade + 10) {
      indexChange = 15; // Significantly above average
    } else if (grade >= averageGrade + 5) {
      indexChange = 5; // Slightly above average
    } else if (grade <= averageGrade - 10) {
      indexChange = -15; // Significantly below average
    } else if (grade <= averageGrade - 5) {
      indexChange = -5; // Slightly below average
    } else {
      indexChange = 0; // Average grade
    }
    logger.debug({ indexChange }, 'Calculated index change based on grade');

    const newIndex = Math.min(100, Math.max(0, user.habits.gradeStabilityIndex + indexChange));
    user.habits.gradeStabilityIndex = newIndex;
    await user.save();

    logger.info({ userId, newIndex }, 'Grade stability index updated successfully');
    return { success: true };
  }
  catch (err) {
    logger.error({ err }, 'Error updating grade stability index');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

// TODO: Rework this is temporary solution (Not prod)
// TODO: Implement a more complex algorithm for consistency index
async function completionEfficiencyIndex(userId) {
  logger.debug({ userId }, 'Updating completion efficiency index for user');

  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.error({ userId }, 'User not found');
      return { success: false, status: 404, errors: ['User not found'] };
    }

    const completedEvents = await Event.find({ 
      userId, 
      isCompleted: true,  
      end: { $lte: new Date() } // Only consider past events
    })
      .limit(15); // Limit to last 15 completed events

    logger.debug(`Total completed events for user ${userId}: ${completedEvents.length}`);

    const totalEvents = await Event.countDocuments({ 
      userId, 
      end: { $lte: new Date() } 
    })
      .limit(15);;

    logger.debug(`Total events for user ${userId}: ${totalEvents}`);

    let indexChange = 0;
    if (totalEvents > 0) {
      const completionRate = (completedEvents.length / totalEvents) * 100;

      if (completionRate >= 90) {
        indexChange = 15; // High completion rate
      } else if (completionRate >= 75) {
        indexChange = 5; // Moderate completion rate
      } else if (completionRate <= 50) {
        indexChange = -15; // Low completion rate
      }
    }

    logger.debug(`Index change based on completion rate: ${indexChange}`);

    const newIndex = Math.min(100, Math.max(0, user.habits.completionEfficiencyIndex + indexChange));
    user.habits.completionEfficiencyIndex = newIndex;
    await user.save();

    logger.info({ userId, newIndex }, 'Completion efficiency index updated successfully');
    return { success: true };
  } catch (err) {
    logger.error({ err }, 'Error updating completion efficiency index');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { createUser, updateProcrastinationIndex, gradeStabilityIndex, completionEfficiencyIndex };
