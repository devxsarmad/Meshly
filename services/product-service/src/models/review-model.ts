import { Schema, model } from 'mongoose';

export interface ReviewDocument {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>({
  productId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true });

reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
export const ReviewModel = model<ReviewDocument>('Review', reviewSchema);
