import { z } from 'zod';
import { app } from './app';
import { env } from './config/env';
import { connectEventBus, consumeOrderPlaced } from './events/payment-events';
import { prisma } from './repositories/payment-repository';
import { paymentService } from './services/payment-service';

const orderPlacedSchema = z.object({ eventName: z.literal('OrderPlaced'), occurredAt: z.string(), orderId: z.string(), userId: z.string(), totalAmount: z.number().nonnegative(), items: z.array(z.object({ productId: z.string(), name: z.string(), unitPrice: z.number(), quantity: z.number().int().positive() })) });
console.log(`[payment-service] STRIPE_SECRET_KEY configured: ${Boolean(env.stripeSecretKey)} (length: ${env.stripeSecretKey.length})`);
Promise.all([prisma.$connect(), connectEventBus()]).then(async () => { await consumeOrderPlaced(async (payload) => paymentService.processOrderPlaced(orderPlacedSchema.parse(payload))); app.listen(env.port, () => console.log(`Payment service listening on port ${env.port}`)); }).catch((error: unknown) => { console.error('Payment service startup failed', error); process.exit(1); });
