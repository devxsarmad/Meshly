import { Router } from 'express';
import { notificationController } from '../controllers/notification-controller';
export const notificationRouter = Router();
notificationRouter.get('/logs', notificationController.list);
