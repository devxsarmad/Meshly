import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { orderRouter } from './routes/order-routes';
import { prisma } from './repositories/order-repository';
import { checkEventBus } from './events/order-events';
export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get('/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await checkEventBus();
    response.json({ success: true, message: 'Order service is healthy', data: { service: 'order-service', database: 'up', rabbitmq: 'up' } });
  } catch (error) {
    console.error('[order-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Order service dependency unavailable', data: { service: 'order-service', database: 'unknown', rabbitmq: 'unknown' } });
  }
});
app.use('/api/orders', orderRouter);
app.use(errorHandler);
