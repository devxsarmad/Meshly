import { app } from './app';
import { env } from './config/env';
import { connectEventBus, consumePaymentEvents } from './events/order-events';
import { prisma } from './repositories/order-repository';
import { orderService } from './services/order-service';
import { z } from 'zod';

const paymentEventSchema = z.discriminatedUnion('eventName', [
  z.object({ eventName: z.literal('PaymentConfirmed'), occurredAt: z.string(), paymentId: z.string(), orderId: z.string(), userId: z.string(), amount: z.number() }),
  z.object({ eventName: z.literal('PaymentFailed'), occurredAt: z.string(), paymentId: z.string(), orderId: z.string(), userId: z.string(), amount: z.number(), failureReason: z.string() }),
]);

Promise.all([prisma.$connect(), connectEventBus()]).then(async () => { await consumePaymentEvents(async (payload) => orderService.handlePaymentEvent(paymentEventSchema.parse(payload))); console.log('Order service payment event consumer listening for payment.confirmed and payment.failed'); app.listen(env.port, () => console.log(`Order service listening on port ${env.port}`)); }).catch((error: unknown) => { console.error('Order service startup failed', error); process.exit(1); });
