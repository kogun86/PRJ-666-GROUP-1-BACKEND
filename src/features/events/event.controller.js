import validateEvent from './event.validator.js';
import logger from '../../shared/utils/logger.js';

import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';

async function getEvents(userId, isCompleted = false, expandCourse = false) {
  logger.debug(
    `Fetching events for user ${userId} with isCompleted=${isCompleted}, expandCourse=${expandCourse}`
  );

  try {
    const events = await Event.find({ userId: userId, isCompleted: isCompleted });

    logger.info(`Found ${events.length} events for user ${userId}`);

    // If expandCourse is true, populate the course data for each event
    if (expandCourse) {
      logger.debug('Expanding course data for events');
      const eventsWithCourses = [];

      for (const event of events) {
        try {
          const course = await Course.findById(event.courseID);
          if (course) {
            // Create a new object with the event data and the course data
            const eventObj = event.toObject();
            eventObj.course = course.toObject();
            eventsWithCourses.push(eventObj);
          } else {
            // If the course doesn't exist, just include the event without course data
            logger.warn(`Course with ID ${event.courseID} not found for event ${event._id}`);
            eventsWithCourses.push(event.toObject());
          }
        } catch (courseError) {
          logger.error({ error: courseError }, `Error fetching course for event ${event._id}`);
          eventsWithCourses.push(event.toObject());
        }
      }

      logger.debug({ eventsWithCourses }, 'Events with expanded course data');
      return { success: true, events: eventsWithCourses };
    }

    logger.debug({ events }, 'Events fetched from database');
    return { success: true, events: events };
  } catch (error) {
    logger.error({ error }, `Error fetching events for user ${userId}: `);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function updateCompletionStatus(eventId, userId, isCompleted) {
  logger.debug(
    `Updating completion status for event ${eventId} to ${isCompleted} for user ${userId}`
  );

  try {
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, userId: userId },
      { isCompleted: isCompleted },
      { new: true }
    );

    if (!updatedEvent) {
      logger.warn(`Event with ID ${eventId} not found`);
      return { success: false, status: 404, errors: ['Event not found'] };
    }

    logger.info(`Event ${eventId} completion status updated to ${isCompleted}`);
    logger.debug({ updatedEvent }, 'Updated event details');

    return { success: true, event: updatedEvent };
  } catch (error) {
    logger.error({ error }, `Error updating completion status for event ${eventId}: `);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function updateGrade(eventId, userId, grade) {
  logger.debug(`Updating grade for event ${eventId} to ${grade} for user ${userId}`);

  try {
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        userId: userId,
      },
      { grade: grade },
      { new: true }
    );

    if (!updatedEvent) {
      logger.warn(`Event with ID ${eventId} not found`);
      return { success: false, status: 404, errors: ['Event not found'] };
    }

    logger.info(`Event ${eventId} grade updated to ${grade}`);
    logger.debug({ updatedEvent }, 'Updated event details');

    return { success: true, event: updatedEvent };
  } catch (error) {
    logger.error({ error }, `Error updating grade for event ${eventId}: `);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

async function createEvent(userId, data) {
  logger.debug('Starting event creation process');
  const { success, parsedData, errors } = validateEvent({ ...data, userId });

  if (!success) {
    return { success: false, status: 400, errors };
  }

  try {
    const event = await Event.create(parsedData);
    logger.info({ event }, 'Event created successfully and saved to database');
    return { success: true, event: event };
  } catch (error) {
    logger.error({ error }, 'Error creating event in database');
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getEvents, updateCompletionStatus, updateGrade, createEvent };
