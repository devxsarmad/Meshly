import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { orderService } from '../services/order-service';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const orderSchema = z.object({ userId: z.string().optional(), items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1) });
interface ProductResponse { success: boolean; data?: { name: string; price: number }; }
const userId = (request: AuthenticatedRequest): string => request.userId as string;
const orderId = (request: AuthenticatedRequest): string => Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

const fetchProduct = async (productId: string): Promise<{ name: string; price: number }> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(`${env.productServiceUrl}/api/products/${encodeURIComponent(productId)}`, { signal: controller.signal });
    if (response.status === 404) throw new AppError(404, `Product not found: ${productId}`);
    if (!response.ok) throw new AppError(503, 'Product service unavailable');
    const payload = await response.json() as ProductResponse;
    if (!payload.success || !payload.data || typeof payload.data.name !== 'string' || typeof payload.data.price !== 'number') throw new AppError(503, 'Product service returned invalid product data');
    return payload.data;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(503, 'Product service unavailable');
  } finally {
    clearTimeout(timeout);
  }
};

export const orderController = {
  create: async (request: AuthenticatedRequest, response: Response) => {
    const input = orderSchema.parse(request.body);
    // Product name/price must always be fetched from product-service, never trusted from the client, to prevent price tampering and to snapshot accurate historical order data.
    const enrichedItems = await Promise.all(input.items.map(async (item) => { const product = await fetchProduct(item.productId); return { productId: item.productId, name: product.name, unitPrice: product.price, quantity: item.quantity }; }));
    const order = await orderService.create(userId(request), enrichedItems);
    response.status(201).json({ success: true, message: 'Order created', data: order });
  },
  list: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Orders retrieved', data: await orderService.listForUser(userId(request)) }),
  getById: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Order retrieved', data: await orderService.getForUser(userId(request), orderId(request)) }),
};
