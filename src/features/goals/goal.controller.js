import logger from '../../shared/utils/logger.js';
import validateGoal from './goal.validator.js';

import Goal from '../../shared/models/goal.model.js';
import Course from '../../shared/models/course.model.js';
import Event from '../../shared/models/event.model.js';
import { categorizePriority, getCoursesWithGrades, weightedAverage } from '../../shared/lib/class.shared.js';
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

    await Promise.all(goals.map(async (goal) => {

    // If expandCourse is true, map the courseId to course
    const courseDoc = await Course.findById(goal.courseId).lean();
        if (courseDoc) {
          const [courseWithGrade] = await getCoursesWithGrades(
            [courseDoc],
            userId
          );
          goal.course = courseWithGrade;   // full course + its own currentGrade
        }

      })
    );

    logger.info({ goals }, 'Goals retrieved successfully');

    return { success: true, goals };
  } catch (error) {
    logger.error({ error }, 'Error retrieving goals');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function updateGoal(userId, goalId, targetGrade) {
  logger.debug(`Updating goal ${goalId} for user ${userId}`);

  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { targetGrade },
      { new: true }
    );

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

// TODO: You cannot have multiple gaols with the same name for the same course
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
    if (error.code == 11000) {
      logger.warn({ error }, 'Goal for this course already exists');
      return { success: false, status: 400, errors: ['Goal for this course already exists'] };
    }

    logger.error({ error }, 'Error creating goal');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function getGoalReport(userId, goalId) {
  logger.debug('Starting goal report retrieval process');
  const goal = await Goal.findOne({ _id: goalId, userId });
  
  if(!goal){
    logger.warn(`Goal with ID ${goalId} not found for user ${userId}`);
    return { success: false, status: 404, errors: ['Goal not found'] };
  }

  const course = await Course.findById(goal.courseId);
  if (!course) {
    logger.warn(`Course with ID ${goal.courseId} not found for user ${userId}`);
    return { success: false, status: 404, errors: ['Course not found'] };
  }

  const events = await Event.find({courseID: course._id, userId}).lean();

  const past = events.filter(e => e.grade !== null);
  const future = events.filter(e => e.grade === null);

  const {avg: currentGrade, totalWeightSoFar: pastWeight} = weightedAverage(past);
  // Determine if past events met the target grade
  const pastCategories = past.map(e => ({
    ...e,
    contribution: e.grade >= goal.targetGrade ? 'positive' : 'negative',
  }));
  const upcoming = future.map(e => ({
    ...e,
    importance: categorizePriority(e.weight),
  }));
    
  // Calculating Weight
  const remainingWeight = future.reduce((sum, e) => sum + e.weight, 0);   // weight of tasks already in DB
  const totalWeightSoFar = pastWeight + remainingWeight;
  const missingWeight = Math.max(0, 100 - totalWeightSoFar);             // room left to reach 100%
  const futureWeightAdjusted = remainingWeight + missingWeight;          // assume missing work exists

  let requiredAvgForRemaining = null;
  let achievable = true;

  if (futureWeightAdjusted > 0) {
    requiredAvgForRemaining =
      (goal.targetGrade * 100 - currentGrade * pastWeight) / futureWeightAdjusted;

    achievable = requiredAvgForRemaining <= 100;
  } else {
    // No remaining weight to achieve the goal, Achievable only if the current grade is already at or above the target. 
    achievable = currentGrade >= goal.targetGrade;
  }
  logger.info(`Allocated Weight: ${pastWeight}`);
  logger.info(`Remaining Weight: ${remainingWeight}`);
  logger.warn(`Total Weight: ${totalWeightSoFar}`);

  const recommendation = achievable? 'ON_TRACK' : 'CONSIDER_ADJUSTING_GOAL';

  return {
    success: true, 
    report: {
      goalId: goal._id,
      course: {
        _id: course._id,
        code: course.code,
        title: course.title,
      },
      targetGrade: goal.targetGrade,
      currentGrade,
      pastEvents: pastCategories,
      upcomingTasks: upcoming, achievable,
      requiredAvgForRemaining,
      recommendation,
    },
  };
}


export { getGoals, getGoalReport, updateGoal, createGoal, deleteGoal };
