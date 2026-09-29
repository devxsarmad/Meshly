import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { notificationRouter } from './routes/notification-routes';
import { checkEventBus } from './events/notification-consumer';
export const app = express();
app.disable('x-powered-by');
app.get('/health', async (_request, response) => {
  try {
    await checkEventBus();
    response.json({ success: true, message: 'Notification service is healthy', data: { service: 'notification-service', rabbitmq: 'up' } });
  } catch (error) {
    console.error('[notification-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Notification service dependency unavailable', data: { service: 'notification-service', rabbitmq: 'down' } });
  }
});
app.use('/api/notifications', notificationRouter);
app.use(errorHandler);
