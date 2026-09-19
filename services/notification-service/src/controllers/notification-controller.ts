import { Request, Response } from 'express';
import { notificationService } from '../services/notification-service';
export const notificationController = { list: (_request: Request, response: Response) => response.json({ success: true, message: 'Notification logs retrieved', data: notificationService.list() }) };
