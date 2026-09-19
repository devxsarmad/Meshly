import express from 'express';
import { errorHandler } from './middlewares/error-handler';
export const app = express();
app.disable('x-powered-by');
app.get('/health', (_request, response) => response.json({ success: true, message: 'Payment service is healthy', data: { service: 'payment-service' } }));
app.use(errorHandler);
