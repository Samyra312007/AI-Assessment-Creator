import Redis from 'ioredis';
import { config } from './index';

export const redisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
};

export const redis = new Redis(redisConnection);

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  redis.config('SET', 'maxmemory-policy', 'noeviction').catch(() => {});
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});
