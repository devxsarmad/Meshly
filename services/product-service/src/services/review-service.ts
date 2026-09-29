import { reviewRepository } from '../repositories/review-repository';
import { AppError } from '../utils/errors';

export const reviewService = {
  list: (productId: string) => reviewRepository.listForProduct(productId),
  stats: (productId: string) => reviewRepository.statsForProduct(productId),
  async upsert(input: { productId: string; userId: string; userName: string; rating: number; comment: string }) {
    try { return await reviewRepository.upsert(input); } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate')) throw new AppError(409, 'You already reviewed this product. Try updating your existing review.');
      throw error;
    }
  },
};
