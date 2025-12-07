import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const getCachedLeaderboard = async (cacheKey: string, limit: number) => {
  try {
    await connectRedis();
    const key = `leaderboard:${cacheKey}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
};

export const setCachedLeaderboard = async (cacheKey: string, limit: number, data: any, ttl: number = 300) => {
  try {
    await connectRedis();
    const key = `leaderboard:${cacheKey}`;
    await redisClient.setEx(key, ttl, JSON.stringify(data));
  } catch (error) {
    console.error('Cache set failed:', error);
  }
};

export const invalidateLeaderboardCache = async (timeControl?: string) => {
  try {
    await connectRedis();
    if (timeControl) {
      const pattern = `leaderboard:${timeControl}:*`;
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      const pattern = 'leaderboard:*';
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
};

