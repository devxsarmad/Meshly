import { ReviewModel } from '../models/review-model';

export const reviewRepository = {
  listForProduct: (productId: string) => ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean(),
  statsForProduct: async (productId: string) => {
    const [stats] = await ReviewModel.aggregate<{ averageRating: number; reviewCount: number }>([
      { $match: { productId } },
      { $group: { _id: '$productId', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);
    return { averageRating: stats?.averageRating ?? 0, reviewCount: stats?.reviewCount ?? 0 };
  },
  upsert: (input: { productId: string; userId: string; userName: string; rating: number; comment: string }) => ReviewModel.findOneAndUpdate(
    { productId: input.productId, userId: input.userId },
    { $set: { userName: input.userName, rating: input.rating, comment: input.comment } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean(),
};
