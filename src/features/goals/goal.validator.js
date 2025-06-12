import { z } from 'zod/v4';

import logger from '../../shared/utils/logger.js';

const Event = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(24).max(24),
  targetGrade: z.number().min(0).max(100),
});

export default function validateGoal(data) {
  logger.debug('Starting goal object validation');
  logger.debug({ data }, 'Goal object data received for validation');

  try {
    const parsedData = Event.parse(data);
    logger.info('Goal object validation passed');

    return { success: true, parsedData: parsedData };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((issue) => `${issue.message} at ${issue.path.join('.')}`);
      logger.error({ err }, 'Goal object validation failed');

      return { success: false, errors: errors };
    } else {
      logger.error({ err }, 'Unexpected error during goal object validation');
      return { success: false, errors: ['Unexpected error occurred'] };
    }
  }
}
