import { createGenerationWorker } from './generation.worker';
import { createPdfWorker } from './pdf.worker';

console.log('Starting workers...');

const generationWorker = createGenerationWorker();
const pdfWorker = createPdfWorker();

console.log('Workers are running and waiting for jobs');

process.on('SIGTERM', async () => {
  await generationWorker.close();
  await pdfWorker.close();
  process.exit(0);
});
