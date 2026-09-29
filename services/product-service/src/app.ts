import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { productRouter } from './routes/product-routes';
import mongoose from 'mongoose';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get('/health', async (_request, response) => {
  try {
    if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) throw new Error('MongoDB is not connected');
    await mongoose.connection.db.admin().ping();
    response.json({ success: true, message: 'Product service is healthy', data: { service: 'product-service', mongodb: 'up' } });
  } catch (error) {
    console.error('[product-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Product service dependency unavailable', data: { service: 'product-service', mongodb: 'down' } });
  }
});
app.use('/api/products', productRouter);
app.use(errorHandler);
