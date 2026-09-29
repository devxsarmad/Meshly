import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middlewares/auth';
import { orderService } from '../services/order-service';
import { env } from '../config/env';
import { AppError } from '../utils/errors';
import { enrichOrderItems } from '../services/order-calculation';

const orderSchema = z.object({ userId: z.string().optional(), items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1) });
const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(10) });
interface ProductResponse { success: boolean; data?: { name: string; price: number }; }
interface MembershipResponse { success: boolean; data?: { status: string } | null; }
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

const fetchMembership = async (userId: string): Promise<{ status: string } | null> => {
  try {
    const response = await fetch(`${env.paymentServiceUrl}/internal/subscriptions/${encodeURIComponent(userId)}`, { headers: { 'x-internal-service-key': env.internalServiceKey } });
    if (!response.ok) throw new AppError(503, 'Payment service unavailable');
    const payload = await response.json() as MembershipResponse;
    return payload.data ?? null;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(503, 'Payment service unavailable');
  }
};

export const orderController = {
  create: async (request: AuthenticatedRequest, response: Response) => {
    const input = orderSchema.parse(request.body);
    // Product name/price must always be fetched from product-service, never trusted from the client, to prevent price tampering and to snapshot accurate historical order data.
    const enrichedItems = await enrichOrderItems(input.items, fetchProduct);
    const order = await orderService.create(userId(request), enrichedItems, await fetchMembership(userId(request)));
    response.status(201).json({ success: true, message: 'Order created', data: order });
  },
  list: async (request: AuthenticatedRequest, response: Response) => { const { page, limit } = paginationSchema.parse(request.query); const result = await orderService.listForUser(userId(request), page, limit); response.json({ success: true, message: 'Orders retrieved', data: { items: result.items, pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } } }); },
  getById: async (request: AuthenticatedRequest, response: Response) => response.json({ success: true, message: 'Order retrieved', data: await orderService.getForUser(userId(request), orderId(request)) }),
};
