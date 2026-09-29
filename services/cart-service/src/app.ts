import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { cartRouter } from './routes/cart-routes';
import { redis } from './utils/redis';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get('/health', async (_request, response) => {
  try {
    await redis.ping();
    response.json({ success: true, message: 'Cart service is healthy', data: { service: 'cart-service', redis: 'up' } });
  } catch (error) {
    console.error('[cart-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Cart service dependency unavailable', data: { service: 'cart-service', redis: 'down' } });
  }
});
app.use('/api/cart', cartRouter);
app.use(errorHandler);
