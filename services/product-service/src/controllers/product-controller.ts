import { Request, Response } from 'express';
import { z } from 'zod';
import { productService } from '../services/product-service';

const productSchema = z.object({ name: z.string().min(1).max(200), description: z.string().min(1), price: z.number().nonnegative(), sku: z.string().min(1).max(80), category: z.string().min(1).max(100), inventoryCount: z.number().int().nonnegative(), imageUrl: z.string().url().optional(), isActive: z.boolean().optional() });
const updateSchema = productSchema.partial();
const routeId = (request: Request): string => Array.isArray(request.params.id) ? request.params.id[0] : request.params.id;

export const productController = {
  list: async (request: Request, response: Response) => { const products = await productService.list({ search: typeof request.query.search === 'string' ? request.query.search : undefined, category: typeof request.query.category === 'string' ? request.query.category : undefined, activeOnly: request.query.includeInactive !== 'true' }); response.json({ success: true, message: 'Products retrieved', data: products }); },
  getById: async (request: Request, response: Response) => { response.json({ success: true, message: 'Product retrieved', data: await productService.getById(routeId(request)) }); },
  create: async (request: Request, response: Response) => { response.status(201).json({ success: true, message: 'Product created', data: await productService.create(productSchema.parse(request.body)) }); },
  update: async (request: Request, response: Response) => { response.json({ success: true, message: 'Product updated', data: await productService.update(routeId(request), updateSchema.parse(request.body)) }); },
  remove: async (request: Request, response: Response) => { await productService.remove(routeId(request)); response.json({ success: true, message: 'Product deleted' }); },
};
