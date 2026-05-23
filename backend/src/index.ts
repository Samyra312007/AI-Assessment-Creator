import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { connectDatabase } from './config/database';
import { redis } from './config/redis';
import { setupWebSocket } from './websocket';
import { createGenerationWorker } from './workers/generation.worker';
import { createPdfWorker } from './workers/pdf.worker';
import routes from './routes';
import logger from './utils/logger';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function start(): Promise<void> {
  try {
    await connectDatabase();
    logger.info('Redis ping:', await redis.ping());

    setupWebSocket(server);

    createGenerationWorker();
    createPdfWorker();

    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`WebSocket server ready`);
    });
  } catch (error) {
    logger.error('Startup error:', error);
    process.exit(1);
  }
}

start();
