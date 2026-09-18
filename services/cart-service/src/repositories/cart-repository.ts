import { env } from '../config/env';
import { Cart } from '../types/cart';
import { cartKey, redis } from '../utils/redis';

export const cartRepository = {
  async get(userId: string): Promise<Cart | null> { const value = await redis.get(cartKey(userId)); return value ? JSON.parse(value) as Cart : null; },
  async save(cart: Cart): Promise<Cart> { await redis.set(cartKey(cart.userId), JSON.stringify(cart), 'EX', env.cartTtlSeconds); return cart; },
  async remove(userId: string): Promise<void> { await redis.del(cartKey(userId)); },
  async ttl(userId: string): Promise<number> { return redis.ttl(cartKey(userId)); },
};
