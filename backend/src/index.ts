import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { config } from './config';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import { setupWebSocket } from './websocket';
import { createGenerationWorker } from './workers/generation.worker';
import { createPdfWorker } from './workers/pdf.worker';
import routes from './routes';

const app = express();
const server = http.createServer(app);

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start(): Promise<void> {
  try {
    await connectDatabase();
    console.log('Redis ping:', await redis.ping());

    setupWebSocket(server);

    createGenerationWorker();
    createPdfWorker();

    server.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`WebSocket server ready`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
}

start();
