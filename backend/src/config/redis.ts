import Redis from 'ioredis';
import { config } from './index';

function parseRedisUrl(url: string): { host: string; port: number; password?: string } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 6379,
      password: parsed.password || undefined,
    };
  } catch {
    return { host: config.redis.host, port: config.redis.port, password: config.redis.password };
  }
}

function buildRedisOptions(): Record<string, any> {
  const { host, port, password } = config.redis.url
    ? parseRedisUrl(config.redis.url)
    : { host: config.redis.host, port: config.redis.port, password: config.redis.password };
  const opts: Record<string, any> = { host, port, maxRetriesPerRequest: null };
  if (password) opts.password = password;
  return opts;
}

export const redisConnection = buildRedisOptions();

export const redis = new Redis(redisConnection);

redis.on('ready', () => {
  redis.config('SET', 'maxmemory-policy', 'noeviction').catch(() => {});
});

redis.on('error', (err) => {
  if (err.message?.includes('NOAUTH')) return;
  console.error('Redis error:', err.message);
});
