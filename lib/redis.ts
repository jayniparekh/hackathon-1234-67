import { Redis } from "@upstash/redis";

const globalForRedis = globalThis as unknown as { redis: Redis | null };

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (globalForRedis.redis) return globalForRedis.redis;
  globalForRedis.redis = new Redis({ url, token });
  return globalForRedis.redis;
}

const memoryCache = new Map<string, { value: string; expires: number }>();

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(key);
    if (raw != null) return typeof raw === "string" ? (JSON.parse(raw) as T) : (raw as T);
  }
  const entry = memoryCache.get(key);
  if (entry && entry.expires > Date.now()) return JSON.parse(entry.value) as T;
  memoryCache.delete(key);
  return null;
}

export async function setCached(key: string, value: unknown, ttlSec: number): Promise<void> {
  const serialized = JSON.stringify(value);
  const redis = getRedis();
  if (redis) await redis.setex(key, ttlSec, serialized);
  else memoryCache.set(key, { value: serialized, expires: Date.now() + ttlSec * 1000 });
}
