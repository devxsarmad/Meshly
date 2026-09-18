import Redis from 'ioredis';
import { env } from '../config/env';

export const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 3 });
export const cartKey = (userId: string): string => `meshly:cart:${userId}`;
