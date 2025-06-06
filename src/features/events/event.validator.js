import { z } from 'zod/v4';

import logger from '../../shared/utils/logger.js';

const Event = z.object({
  userId: z.string(),
  title: z.string().max(100),
  courseID: z.string(),
  type: z.enum(['assignment', 'exam', 'project', 'quiz', 'test', 'homework']),
  description: z.string().max(500).optional(),
  weight: z.number().min(0).max(100),
  grade: z.number().min(0).max(100).nullable().default(null),
  isCompleted: z.boolean().default(false),
  start: z.string().datetime().optional(),
  end: z.string().datetime(),
  location: z.string().max(100).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
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
