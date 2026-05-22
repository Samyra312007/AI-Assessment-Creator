import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const generationQueue = new Queue('question-generation', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const pdfQueue = new Queue('pdf-export', {
  connection: redis,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 50,
    removeOnFail: 20,
  },
});
