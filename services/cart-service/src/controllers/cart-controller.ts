import { Request, Response } from 'express';
import { z } from 'zod';
import { cartService } from '../services/cart-service';
import { AuthenticatedRequest } from '../middlewares/auth';

const itemSchema = z.object({ productId: z.string().min(1), name: z.string().min(1), price: z.number().nonnegative(), quantity: z.number().int().positive(), imageUrl: z.string().url().optional() });
const quantitySchema = z.object({ quantity: z.number().int().nonnegative() });
const userId = (request: AuthenticatedRequest): string => request.userId as string;
const productId = (request: AuthenticatedRequest): string => Array.isArray(request.params.productId) ? request.params.productId[0] : request.params.productId;

export const cartController = {
  get: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Cart retrieved', data: await cartService.get(userId(request)) }),
  addItem: async (request: AuthenticatedRequest, response: Response) => response.status(201).json({ success: true, message: 'Item added to cart', data: await cartService.addItem(userId(request), itemSchema.parse(request.body)) }),
  updateItem: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Cart item updated', data: await cartService.updateItem(userId(request), productId(request), quantitySchema.parse(request.body).quantity) }),
  removeItem: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Cart item removed', data: await cartService.removeItem(userId(request), productId(request)) }),
  clear: async (request: AuthenticatedRequest, response: Response) => { await cartService.clear(userId(request)); response.json({ success: true, message: 'Cart cleared' }); },
};
