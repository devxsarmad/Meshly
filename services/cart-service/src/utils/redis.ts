import Redis from 'ioredis';
import { env } from '../config/env';
import { cartKey, wishlistKey } from './keys';

export const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 3 });
export { cartKey, wishlistKey };
