import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middlewares/error-handler';
import { authRouter } from './routes/auth-routes';
import { prisma } from './repositories/auth-repository';
export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.get('/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    response.json({ success: true, message: 'Auth service is healthy', data: { service: 'auth-service', database: 'up' } });
  } catch (error) {
    console.error('[auth-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Auth service dependency unavailable', data: { service: 'auth-service', database: 'down' } });
  }
});
app.use('/api/auth', authRouter);
app.use(errorHandler);
