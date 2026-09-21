import Stripe from 'stripe';
import { PaymentStatus } from '@prisma/client';
import { paymentRepository } from '../repositories/payment-repository';
import { publishPaymentEvent } from '../events/payment-events';
import { OrderPlacedEvent } from '../types/events';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

const stripe = new Stripe(env.stripeSecretKey);

export const paymentService = {
  async processOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    if (await paymentRepository.findByOrderId(event.orderId)) return;
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(event.totalAmount * 100), currency: env.stripeCurrency, automatic_payment_methods: { enabled: true }, metadata: { orderId: event.orderId, userId: event.userId } }, { idempotencyKey: `meshly-order-${event.orderId}` });
    await paymentRepository.create({ orderId: event.orderId, userId: event.userId, amount: event.totalAmount, status: PaymentStatus.PENDING, paymentIntentId: paymentIntent.id });
    console.log(`[payment-service] PaymentIntent created: ${paymentIntent.id} for order ${event.orderId}`);
  },
  async createIntentForOrder(orderId: string, userId: string) {
    const payment = await paymentRepository.findByOrderId(orderId);
    if (!payment || payment.userId !== userId || !payment.paymentIntentId) throw new AppError(404, 'Payment intent not found for this order');
    const paymentIntent = await stripe.paymentIntents.retrieve(payment.paymentIntentId);
    if (!paymentIntent.client_secret) throw new AppError(500, 'Stripe did not return a payment client secret');
    return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, status: payment.status };
  },
  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    if (event.type !== 'payment_intent.succeeded' && event.type !== 'payment_intent.payment_failed') return;
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const existingEvent = await paymentRepository.findByStripeEventId(event.id);
    if (existingEvent) { console.warn(`[payment-service] Ignoring duplicate Stripe event ${event.id}`); return; }
    const payment = await paymentRepository.findByPaymentIntentId(paymentIntent.id);
    if (!payment) { console.warn(`[payment-service] Stripe event ${event.id} references unknown PaymentIntent ${paymentIntent.id}`); return; }
    if (payment.status !== PaymentStatus.PENDING) { console.warn(`[payment-service] Ignoring Stripe event ${event.id}: payment ${payment.id} is already ${payment.status}`); return; }
    const failed = event.type === 'payment_intent.payment_failed';
    const status = failed ? PaymentStatus.FAILED : PaymentStatus.CONFIRMED;
    const failureReason = failed ? paymentIntent.last_payment_error?.message ?? 'Payment failed' : undefined;
    const result = await paymentRepository.updateFromStripe(payment.id, status, event.id, failureReason);
    if (result.count === 0) { console.warn(`[payment-service] Skipping duplicate Stripe state transition for ${paymentIntent.id}`); return; }
    const orderId = paymentIntent.metadata.orderId || payment.orderId;
    const userId = paymentIntent.metadata.userId || payment.userId;
    publishPaymentEvent(failed ? 'payment.failed' : 'payment.confirmed', { eventName: failed ? 'PaymentFailed' : 'PaymentConfirmed', occurredAt: new Date().toISOString(), paymentId: payment.id, orderId, userId, amount: Number(payment.amount), ...(failureReason ? { failureReason } : {}) });
    console.log(`[payment-service] Stripe webhook processed: ${paymentIntent.id} -> ${status}; published ${failed ? 'payment.failed' : 'payment.confirmed'}`);
  },
};
