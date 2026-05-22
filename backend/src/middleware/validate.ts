import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }
    req[source] = result.data;
    next();
  };
}

export const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required').max(100),
  grade: z.string().min(1, 'Grade is required').max(50),
  dueDate: z.string().min(1, 'Due date is required').refine(
    (val) => !isNaN(Date.parse(val)),
    'Invalid date format'
  ),
  questionTypes: z.array(
    z.object({
      type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']),
      count: z.number().int().min(1, 'At least 1 question required'),
      marksPerQuestion: z.number().int().min(1, 'Marks must be at least 1'),
    })
  ).min(1, 'At least one question type required'),
  additionalInstructions: z.string().max(1000).optional(),
});
