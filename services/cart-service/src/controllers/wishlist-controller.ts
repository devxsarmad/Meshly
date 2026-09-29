import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { wishlistService } from '../services/wishlist-service';

const wishlistItemSchema = z.object({ productId: z.string().min(1), name: z.string().min(1), price: z.number().nonnegative(), imageUrl: z.string().url().optional() });
const userId = (request: AuthenticatedRequest): string => request.userId as string;
const productId = (request: AuthenticatedRequest): string => Array.isArray(request.params.productId) ? request.params.productId[0] : request.params.productId;

export const wishlistController = {
  get: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Wishlist retrieved', data: await wishlistService.get(userId(request)) }),
  addItem: async (request: AuthenticatedRequest, response: Response) => response.status(201).json({ success: true, message: 'Item added to wishlist', data: await wishlistService.add(userId(request), wishlistItemSchema.parse(request.body)) }),
  removeItem: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Item removed from wishlist', data: await wishlistService.remove(userId(request), productId(request)) }),
};
