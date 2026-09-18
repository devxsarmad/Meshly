import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { proxyRouter } from './routes/proxy';

export const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, limit: env.rateLimitMax, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/health', (_request, response) => response.json({ success: true, message: 'API gateway is healthy', data: { service: 'api-gateway' } }));
app.use('/api', proxyRouter);
app.use(errorHandler);
