import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { Assessment } from '../models/Assessment';
import { Job } from '../models/Job';
import { QuestionBank } from '../models/QuestionBank';
import { generateQuestions } from '../services/llm.service';
import { emitJobProgress, emitJobCompleted, emitJobFailed } from '../websocket';
import { IAssignmentInput } from '../types';
import logger from '../utils/logger';

export function createGenerationWorker(): Worker {
  const worker = new Worker(
    'question-generation',
    async (job) => {
      const { assignmentId } = job.data;

      try {
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'processing' });
        await Job.findOneAndUpdate({ jobId: job.id }, { status: 'active', progress: 10 });

        emitJobProgress({
          assignmentId,
          jobId: job.id || '',
          status: 'processing',
          progress: 10,
        });

        await job.updateProgress(30);
        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) throw new Error('Assignment not found');

        const input: IAssignmentInput = {
          title: assignment.title,
          subject: assignment.subject,
          grade: assignment.grade,
          dueDate: assignment.dueDate.toISOString(),
          questionTypes: assignment.questionTypes,
          additionalInstructions: assignment.additionalInstructions,
        };

        emitJobProgress({ assignmentId, jobId: job.id || '', status: 'processing', progress: 40 });

        const output = await generateQuestions(input);

        emitJobProgress({ assignmentId, jobId: job.id || '', status: 'processing', progress: 80 });

        const assessment = await Assessment.findOneAndUpdate(
          { assignmentId },
          {
            assignmentId,
            title: output.title,
            generalInstructions: output.generalInstructions,
            sections: output.sections,
            metadata: output.metadata,
            status: 'completed',
          },
          { upsert: true, new: true }
        );

        if (assignment.userId) {
          const bankQuestions = output.sections.flatMap(s => s.questions.map(q => ({
            userId: assignment.userId!, subject: assignment.subject, grade: assignment.grade,
            text: q.text, type: q.type, difficulty: q.difficulty, marks: q.marks,
            tags: [assignment.subject, assignment.grade, q.difficulty],
          })));
          await QuestionBank.insertMany(bankQuestions).catch(e => logger.warn('Failed to save to question bank:', e.message));
        }

        await Assignment.findByIdAndUpdate(assignmentId, { status: 'completed' });
        await Job.findOneAndUpdate({ jobId: job.id }, { status: 'completed', progress: 100 });

        emitJobCompleted({
          assignmentId,
          assessmentId: assessment._id.toString(),
        });
      } catch (error: any) {
        await Assignment.findByIdAndUpdate(assignmentId, { status: 'failed' });
        await Job.findOneAndUpdate({ jobId: job.id }, { status: 'failed', error: error.message });

        emitJobFailed({
          assignmentId,
          error: error.message,
        });

        throw error;
      }
    },
    {
      connection: redis,
      concurrency: 3,
    }
  );

  worker.on('completed', (job) => {
    console.log(`Generation job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Generation job ${job?.id} failed:`, err.message);
  });

  return worker;
}
