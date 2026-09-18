import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { cartRouter } from './routes/cart-routes';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get('/health', (_request, response) => response.json({ success: true, message: 'Cart service is healthy', data: { service: 'cart-service' } }));
app.use('/api/cart', cartRouter);
app.use(errorHandler);
