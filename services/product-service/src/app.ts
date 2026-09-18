import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { productRouter } from './routes/product-routes';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());
app.get('/health', (_request, response) => response.json({ success: true, message: 'Product service is healthy', data: { service: 'product-service' } }));
app.use('/api/products', productRouter);
app.use(errorHandler);
