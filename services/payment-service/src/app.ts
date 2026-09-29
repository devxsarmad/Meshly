import express from 'express';
import { errorHandler } from './middlewares/error-handler';
import { paymentController } from './controllers/payment-controller';
import { paymentRouter } from './routes/payment-routes';
import { subscriptionRouter } from './routes/subscription-routes';
import { subscriptionController } from './controllers/subscription-controller';
import { requireInternalService } from './middlewares/internal-auth';
import { prisma } from './repositories/payment-repository';
import { checkEventBus } from './events/payment-events';
export const app = express();
app.disable('x-powered-by');
app.get('/health', async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await checkEventBus();
    response.json({ success: true, message: 'Payment service is healthy', data: { service: 'payment-service', database: 'up', rabbitmq: 'up' } });
  } catch (error) {
    console.error('[payment-service] Health check failed', error);
    response.status(503).json({ success: false, message: 'Payment service dependency unavailable', data: { service: 'payment-service', database: 'unknown', rabbitmq: 'unknown' } });
  }
});
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), paymentController.webhook);
app.use(express.json());
app.get('/internal/subscriptions/:userId', requireInternalService, (request, response, next) => { void subscriptionController.internalMembership(request, response).catch(next); });
app.use('/api/payments', paymentRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use(errorHandler);
