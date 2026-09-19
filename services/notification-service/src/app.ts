import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { notificationRouter } from './routes/notification-routes';
export const app = express();
app.disable('x-powered-by');
app.get('/health', (_request, response) => response.json({ success: true, message: 'Notification service is healthy', data: { service: 'notification-service' } }));
app.use('/api/notifications', notificationRouter);
app.use(errorHandler);
