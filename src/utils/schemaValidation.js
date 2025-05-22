import { z } from 'zod';

export const createEventSchema = z.object({
  // OwnerName and Email Omitted as it is not user submitted data.
  // Grade and isCompleted ignored as this focuses on creating new Events.
  title: z.string().min(1),
  // Course Code cant be more than 6 characters
  courseCode: z.string().max(6),
  // Grades cant be lower than 0 or higher than 100
  weight: z.number(0).max(100),
  // DueDates with format YYYY-MM-DD
  dueDate: z.coerce.date(),
  description: z.string().min(1),
  type: z.string().min(1)
});

const GradeSchema =  z.union([
  z.number().min(0).max(100),
  z.enum([
    'A', 'A+', 'A-',
    'B', 'B+', 'B-',
    'C', 'C+', 'C-',
    'D', 'D+', 'D-',
    'F',
    'DNC'
  ])
]);

export const patchGradeCompletedSchema = z.object({
  grade: GradeSchema
});
