import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
      });
      return;
    }
    req[source] = result.data;
    next();
  };
}

export const assignmentSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  grade: z.string().min(1).max(50),
  dueDate: z.string().min(1).refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  questionTypes: z.array(z.object({
    type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false']),
    count: z.number().int().min(1),
    marksPerQuestion: z.number().int().min(1),
  })).min(1),
  additionalInstructions: z.string().max(1000).optional(),
});

export const authSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  schoolName: z.string().max(200).optional(),
  schoolLocation: z.string().max(200).optional(),
});

export const submissionSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.array(z.object({
    questionNumber: z.number(),
    text: z.string(),
  })).min(1),
});
