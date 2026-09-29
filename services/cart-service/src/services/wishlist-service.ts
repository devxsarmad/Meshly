import { wishlistRepository } from '../repositories/wishlist-repository';
import { WishlistItem } from '../types/wishlist';

export const wishlistService = {
  get: (userId: string) => wishlistRepository.get(userId),
  async add(userId: string, input: Omit<WishlistItem, 'addedAt'>) {
    const items = await wishlistRepository.get(userId);
    if (!items.some((item) => item.productId === input.productId)) items.unshift({ ...input, addedAt: new Date().toISOString() });
    return wishlistRepository.save(userId, items);
  },
  async remove(userId: string, productId: string) {
    const items = await wishlistRepository.get(userId);
    return wishlistRepository.save(userId, items.filter((item) => item.productId !== productId));
  },
};
