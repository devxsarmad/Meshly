import { z } from 'zod';
import { app } from './app';
import { connectConsumer, consumeNotifications } from './events/notification-consumer';
import { env } from './config/env';
import { notificationService } from './services/notification-service';

const eventSchema = z.discriminatedUnion('eventName', [z.object({ eventName: z.literal('OrderPlaced'), occurredAt: z.string(), orderId: z.string(), userId: z.string(), totalAmount: z.number() }), z.object({ eventName: z.literal('PaymentConfirmed'), occurredAt: z.string(), orderId: z.string(), userId: z.string(), paymentId: z.string(), amount: z.number() }), z.object({ eventName: z.literal('PaymentFailed'), occurredAt: z.string(), orderId: z.string(), userId: z.string(), paymentId: z.string(), amount: z.number(), failureReason: z.string() })]);
Promise.all([connectConsumer()]).then(async () => { await consumeNotifications(async (payload) => notificationService.handle(eventSchema.parse(payload))); app.listen(env.port, () => console.log(`Notification service listening on port ${env.port}`)); }).catch((error: unknown) => { console.error('Notification service startup failed', error); process.exit(1); });
