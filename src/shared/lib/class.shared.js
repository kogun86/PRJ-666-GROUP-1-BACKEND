import logger from '../utils/logger.js';

import Class from '../models/class.model.js';
import Event from '../models/event.model.js';
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

    await Class.insertMany(classes);
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

async function getCoursesWithGrades(courses, userId) {
  await Promise.all(
        courses.map(async (course, index) => {
          const events = await Event.find({
            userId,
            courseID: course._id,
            grade:  { $ne: null },
            weight: { $ne: null },
          });
  
          // Calculate weighted average grade
          const gradeObj = events.length ? weightedAverage(events) : null;

          const ordered = {
            instructor: course.instructor,
            _id:        course._id,
            userId:     course.userId,
            title:      course.title,
            code:       course.code,
            section:    course.section,
            color:      course.color,
            status:     course.status,
            startDate:  course.startDate,
            endDate:    course.endDate,
            // insert currentGrade right here
            currentGrade: gradeObj,
            schedule:   course.schedule,
            __v:        course.__v
          }
          courses[index] = ordered;
        })
      );
      return courses;
}

function weightedAverage(events){
  const {weightedSum, totalWeightSoFar } = events.reduce(
    (acc, ev) => ({
      weightedSum: acc.weightedSum + ev.grade * ev.weight,
      totalWeightSoFar: acc.totalWeightSoFar + ev.weight,
    }),
    {weightedSum: 0, totalWeightSoFar: 0}
  );
  return{
    avg: totalWeightSoFar > 0 ? weightedSum / totalWeightSoFar : null,
    totalWeightSoFar,
    weightRemaining: 100 - totalWeightSoFar,
  }
}

function categorizePriority(weight){
  if(weight >= 20) return 'high';
  if(weight >= 10) return 'medium';
  return 'low';
}


export { createClassesInPeriod, weightedAverage, categorizePriority, getCoursesWithGrades };
