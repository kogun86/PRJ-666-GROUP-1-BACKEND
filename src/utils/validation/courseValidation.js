import { z } from 'zod/v4';

import logger from '../logger.js';

const Instructor = z.object({
  name: z.string().max(30),
  email: z.email().max(50),
  availableTimeSlots: z
    .array(
      z.object({
        dayOfWeek: z.enum([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ]),
        startTime: z.iso.time(),
        endTime: z.iso.time(),
      })
    )
    .optional(),
});

const ClassSession = z.object({
  classType: z.enum(['lecture', 'lab']),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.iso.time(),
  endTime: z.iso.time(),
  location: z.string().max(20).optional(),
});

const Course = z.object({
  userId: z.string().max(30),
  title: z.string().max(30),
  code: z.string().max(10),
  section: z.string().max(10).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  instructor: Instructor,
  classSessions: z.array(ClassSession).min(1),
});

export default function validateCourse(data) {
  logger.debug('Starting course object validation');
  logger.debug({ data }, 'Course object data received for validation');
  try {
    const parsedData = Course.parse(data);
    logger.info('Course object validation passed');

    return { success: true, parsedData: parsedData };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors = err.issues.map((issue) => `${issue.message} at ${issue.path.join('.')}`);
      logger.error({ err }, 'Course object validation failed');

      return { success: false, errors: errors };
    } else {
      logger.error({ err }, 'Unexpected error during course object validation');
      return { success: false, errors: ['Unexpected error occurred'] };
    }
  }
}
