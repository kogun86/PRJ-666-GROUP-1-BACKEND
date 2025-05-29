import { z } from 'zod/v4';

import logger from '../logger.js';

const Event = z.object({
  userId: z.string(),
  title: z.string().max(30),
  courseCode: z.string().max(10),
  weight: z.number().min(0).max(100),
  dueDate: z.iso.date(),
  description: z.string().max(200),
  type: z.string().max(20), // TODO: Consider using an enum for event types
});

export default function validateEvent(data) {
  logger.debug('Starting event object validation');
  logger.debug({ data }, 'Event object data received for validation');

  try {
    const parsedData = Event.parse(data);
    logger.info('Event object validation passed');

    return { success: true, parsedData: parsedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((issue) => `${issue.message} at ${issue.path.join('.')}`);
      logger.error({ error }, 'Event object validation failed');

      return { success: false, errors: errors };
    } else {
      logger.error({ error }, 'Unexpected error during event object validation');
      return { success: false, errors: ['Unexpected error occurred'] };
    }
  }
}
