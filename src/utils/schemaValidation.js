import { z } from 'zod';

export const createEventSchema = z.object({
  // OwnerName and Email Omitted as it is not user submitted data.
  // Grade and isCompleted ignored as this focuses on creating new Events.
  title: z.string().min(1, {message: "Title cannot be left empty"}),
  // Course Code cant be more than 6 characters
  courseCode: z.string()
  .max(6, {message: "Course Code must not exceed 6 characters."})
  .regex(/^[A-Za-z]{3}\d{3}$/, {
    message: "Course Code must follow the format: 3 letters followed by 3 numbers (e.g., PRJ666)"}),
  // Grades cant be lower than 0 or higher than 100
  weight: z
  .number({message: "Weight must be a number"})
  .min(0, {message: "Weight must be at least 0"})
  .max(100, {message: "Weight cannot exceed 100"}),
  // Converts to format YYYY-MM-DD, regardless of input
  dueDate: z.coerce
  .date()
  .refine(
    (date) => date >= new Date(new Date().toDateString()),
    { message: "Due date must be today or in the future" }
  ),
  description: z
  .string()
  .min(1, {message: "Description cannot be left empty."}),
  type: z
  .string()
  .min(1, {message: "Type cannot be left empty."})
});

const GradeSchema = z.any().superRefine((grade, ctx) => {
  // Coerce Number like strings into numbers
  const num = typeof grade === 'string' && !isNaN(Number(grade)) ? Number(grade) : grade;
  const numberValid = typeof num === 'number' && num >= 0 && num <= 100;
  const allowedGrades = [
    'A', 'A+', 'A-', 'B', 'B+', 'B-', 'C', 'C+', 'C-',
    'D', 'D+', 'D-', 'F', 'DNC'
  ];
  const letterValid = typeof val === 'string' && allowedGrades.includes(grade);

  if (!numberValid && !letterValid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Grade must be a number between 0–100 or a valid letter grade (A to D, with +/-), or F/DNC.",
    });
  }
});

export const patchGradeCompletedSchema = z.object({
  grade: GradeSchema
});
