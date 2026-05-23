import Redis from 'ioredis';
import { config } from './index';

function buildRedisOptions(): Record<string, any> {
  if (config.redis.url) {
    return { url: config.redis.url, maxRetriesPerRequest: null };
  }
  const opts: Record<string, any> = {
    host: config.redis.host,
    port: config.redis.port,
    maxRetriesPerRequest: null,
  };
  if (config.redis.password) opts.password = config.redis.password;
  return opts;
}

export const redisConnection = buildRedisOptions();

export const redis = config.redis.url
  ? new Redis(config.redis.url, { maxRetriesPerRequest: null })
  : new Redis(redisConnection);

redis.on('ready', () => {
  redis.config('SET', 'maxmemory-policy', 'noeviction').catch(() => {});
});

redis.on('error', (err) => {
  if (err.message?.includes('NOAUTH')) return;
  console.error('Redis error:', err.message);
});
