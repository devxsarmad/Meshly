import { redis, wishlistKey } from '../utils/redis';
import { WishlistItem } from '../types/wishlist';

export const wishlistRepository = {
  async get(userId: string): Promise<WishlistItem[]> {
    const value = await redis.get(wishlistKey(userId));
    return value ? JSON.parse(value) as WishlistItem[] : [];
  },
  async save(userId: string, items: WishlistItem[]): Promise<WishlistItem[]> {
    await redis.set(wishlistKey(userId), JSON.stringify(items));
    return items;
  },
  remove: (userId: string) => redis.del(wishlistKey(userId)),
};
