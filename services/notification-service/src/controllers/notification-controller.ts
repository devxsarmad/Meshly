import { Request, Response } from 'express';
import { notificationService } from '../services/notification-service';
import { z } from 'zod';
const paginationSchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20) });
export const notificationController = { list: (request: Request, response: Response) => { const { page, limit } = paginationSchema.parse(request.query); const result = notificationService.list(page, limit); response.json({ success: true, message: 'Notification logs retrieved', data: { items: result.items, pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) } } }); } };
