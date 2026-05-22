import { Worker } from 'bullmq';
import { redis } from '../config/redis';
import { Assessment } from '../models/Assessment';
import { generateAssessmentPdf } from '../services/pdf.service';
import fs from 'fs';
import path from 'path';

export function createPdfWorker(): Worker {
  const worker = new Worker(
    'pdf-export',
    async (job) => {
      const { assessmentId } = job.data;

      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) throw new Error('Assessment not found');

      const pdfBuffer = await generateAssessmentPdf(assessment);

      const dir = path.join(__dirname, '../../uploads/pdfs');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const filePath = path.join(dir, `${assessmentId}.pdf`);
      fs.writeFileSync(filePath, pdfBuffer);

      return { filePath };
    },
    {
      connection: redis,
      concurrency: 2,
    }
  );

  worker.on('completed', (job) => {
    console.log(`PDF job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`PDF job ${job?.id} failed:`, err.message);
  });

  return worker;
}
