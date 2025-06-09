import validateCourse from './course.validator.js';
import logger from '../../shared/utils/logger.js';
import { createClassesInPeriod } from '../../shared/lib/class.shared.js';

import Course from '../../shared/models/course.model.js';
import Class from '../../shared/models/class.model.js';
import Event from '../../shared/models/event.model.js';

async function getCourses(userId, active = true) {
  logger.info(`Fetching courses for user ${userId} with active status: ${active}`);

  try {
    let courses = await Course.find({ userId, status: active ? 'active' : 'inactive' });

    if (active == true) {
      const today = new Date();
      const courseIdsToUpdate = [];

      logger.info(`Checking ${courses.length} active courses for end dates`);
      courses = courses.filter((course) => {
        logger.debug(`Checking if course ${course._id} is still active`);

        if (course.endDate < today) {
          courseIdsToUpdate.push(course._id);
          logger.debug(`Course ${course._id} marked as inactive due to end date`);
          return false;
        }

        return true;
      });

      try {
        await Course.updateMany({ _id: { $in: courseIdsToUpdate } }, { status: 'inactive' });
        logger.info(`Updated ${courseIdsToUpdate.length} courses to inactive status`);
      } catch (err) {
        logger.error({ err }, 'Error updating courses to inactive status');
        return { success: false, status: 500, errors: ['Internal server error'] };
      }
    }

    logger.info(`Fetched ${courses.length} courses for user ${userId}`);
    logger.debug({ courses }, 'Courses fetched from database');
    return { success: true, courses };
  } catch (err) {
    logger.error({ err }, 'Error fetching courses from database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function createCourse(userId, data) {
  logger.debug('Starting course creation process');
  const { success, parsedData, errors } = validateCourse({ ...data, userId });

  if (!success) {
    return { success: false, status: 400, errors };
  }

  let course = null;

  try {
    course = await Course.create(parsedData);
    logger.info({ course }, 'Course created successfully and saved to database');
  } catch (err) {
    logger.error({ err }, 'Error creating course in database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }

  return await createClassesInPeriod(
    userId,
    course._id,
    course.schedule,
    course.startDate,
    course.endDate
  );
}

async function deleteCourse(courseId, userId) {
  logger.info(`Deleting course ${courseId} for user ${userId}`);

  try {
    // Check if the course exists and belongs to the user
    const course = await Course.findOne({ _id: courseId, userId });

    if (!course) {
      logger.info(`Course ${courseId} not found for user ${userId}`);
      return { success: false, status: 404, errors: ['Course not found'] };
    }

    // Delete all classes associated with this course
    logger.debug(`Deleting classes for course ${courseId}`);
    const deleteClassesResult = await Class.deleteMany({ courseId, userId });
    logger.info(`Deleted ${deleteClassesResult.deletedCount} classes for course ${courseId}`);

    // Delete all events associated with this course
    logger.debug(`Deleting events for course ${courseId}`);
    const deleteEventsResult = await Event.deleteMany({ courseID: courseId, userId });
    logger.info(`Deleted ${deleteEventsResult.deletedCount} events for course ${courseId}`);

    // Delete the course itself
    await Course.deleteOne({ _id: courseId });
    logger.info(`Deleted course ${courseId} for user ${userId}`);

    return {
      success: true,
      deletedClassCount: deleteClassesResult.deletedCount,
      deletedEventCount: deleteEventsResult.deletedCount,
    };
  } catch (error) {
    logger.error({ error }, `Error deleting course ${courseId}`);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getCourses, createCourse, deleteCourse };
