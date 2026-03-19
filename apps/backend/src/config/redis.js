import { createClient } from 'redis';

let redisClient = null;

export const connectRedis = async () => {
  try {
    // Use Railway Redis environment variables in production, localhost in development
    // Railway automatically provides these environment variables when Redis is linked
    const redisUrl = process.env.REDIS_URL || 
                    (process.env.NODE_ENV === 'production' 
                      ? `redis://:${process.env.REDISPASSWORD}@${process.env.REDISHOST}:${process.env.REDISPORT}`
                      : 'redis://127.0.0.1:6379');

    redisClient = createClient({
      url: redisUrl
    });

    redisClient.on('error', (err) => {
      if (process.env.NODE_ENV === 'production') {
        console.error('Redis Client Error:', err);
      } else {
        console.log('Redis not available locally, skipping Redis features');
        redisClient = null;
        return;
      }
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error('Redis connection error:', error);
    } else {
      console.log('Redis not available locally, skipping Redis features');
    }
    redisClient = null;
    return null;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    return null;
  }
  return redisClient;
};

// Cache utility functions
export const setCache = async (key, value, expireInSeconds = 3600) => {
  try {
    const client = getRedisClient();
    const serializedValue = JSON.stringify(value);
    await client.setEx(key, expireInSeconds, serializedValue);
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const getCache = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const deleteCachePattern = async (pattern) => {
  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache pattern delete error:', error);
  }
};
