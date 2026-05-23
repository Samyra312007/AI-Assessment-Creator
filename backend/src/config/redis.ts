import Redis from 'ioredis';
import { config } from './index';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  redis.config('SET', 'maxmemory-policy', 'noeviction').catch(() => {});
});

redis.on('error', (err) => {
  if (err.message?.includes('NOAUTH')) return;
  console.error('Redis error:', err);
});
