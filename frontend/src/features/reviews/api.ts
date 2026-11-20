import { apiFetch } from '../../lib/api-client';

export type Review = { _id: string; productId: string; userId: string; userName: string; rating: number; comment: string; createdAt: string; updatedAt: string };
export type ReviewInput = { rating: number; comment: string };

const reviewsPath = (productId: string) => `/api/products/${encodeURIComponent(productId)}/reviews`;

export const listReviews = (productId: string) => apiFetch<Review[]>(reviewsPath(productId));
export const saveReview = (productId: string, input: ReviewInput) => apiFetch<Review>(reviewsPath(productId), { method: 'POST', body: JSON.stringify(input) });
