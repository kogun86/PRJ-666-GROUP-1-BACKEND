import validateEvent from './event.validator.js';
import logger from '../../shared/utils/logger.js';

import Event from '../../shared/models/event.model.js';
import Course from '../../shared/models/course.model.js';

async function getEvents(
  userId,
  isCompleted = false,
  expandCourse = false,
  fromDate = null,
  toDate = null
) {
  logger.debug(
    `Fetching events for user ${userId} with isCompleted=${isCompleted}, expandCourse=${expandCourse}, fromDate=${fromDate}, toDate=${toDate}`
  );

  try {
    // Build the query with required filters
    const query = { userId, isCompleted };

    // Add date range filter if provided
    if (fromDate || toDate) {
      query.$or = [];

      // Events with start and end dates that overlap with the range
      const dateQuery = {};

      if (fromDate) {
        // Events that start after or on the fromDate
        // OR events that end after or on the fromDate
        dateQuery.$or = [
          { start: { $gte: new Date(fromDate) } },
          { end: { $gte: new Date(fromDate) } },
        ];
      }

      if (toDate) {
        // Events that start before or on the toDate
        // OR events that end before or on the toDate
        if (dateQuery.$or) {
          // Add $and condition if we already have fromDate constraints
          query.$and = [
            { $or: dateQuery.$or },
            { $or: [{ start: { $lte: new Date(toDate) } }, { end: { $lte: new Date(toDate) } }] },
          ];
          // Remove the $or we added earlier as it's now in $and
          delete query.$or;
        } else {
          // If we only have toDate, just use $or
          dateQuery.$or = [
            { start: { $lte: new Date(toDate) } },
            { end: { $lte: new Date(toDate) } },
          ];
          query.$or = dateQuery.$or;
        }
      } else if (dateQuery.$or) {
        // If we only have fromDate constraints
        query.$or = dateQuery.$or;
      }
    }

    logger.debug({ query }, 'Database query for events');
    const events = await Event.find(query);

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

async function deleteEvent(eventId, userId) {
  logger.debug(`Deleting event ${eventId} for user ${userId}`);

  try {
    const deletedEvent = await Event.findOneAndDelete({ _id: eventId, userId: userId });

    if (!deletedEvent) {
      logger.warn(`Event with ID ${eventId} not found for user ${userId}`);
      return { success: false, status: 404, errors: ['Event not found'] };
    }

    logger.info(`Event ${eventId} successfully deleted for user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error({ error }, `Error deleting event ${eventId}: `);
    return { success: false, status: 500, errors: ['Internal server error'] };
  }
}

export { getEvents, updateCompletionStatus, updateGrade, createEvent, deleteEvent };
