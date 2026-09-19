import { PaymentStatus } from '@prisma/client';
import { paymentRepository } from '../repositories/payment-repository';
import { publishPaymentEvent } from '../events/payment-events';
import { OrderPlacedEvent } from '../types/events';
import { env } from '../config/env';

export const paymentService = {
  async processOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    if (await paymentRepository.findByOrderId(event.orderId)) return;
    const shouldFail = env.failureRate > 0 && Math.random() < env.failureRate;
    const status = shouldFail ? PaymentStatus.FAILED : PaymentStatus.CONFIRMED;
    const failureReason = shouldFail ? 'Mock payment was declined' : undefined;
    const payment = await paymentRepository.create({ orderId: event.orderId, userId: event.userId, amount: event.totalAmount, status, failureReason });
    publishPaymentEvent(shouldFail ? 'payment.failed' : 'payment.confirmed', { eventName: shouldFail ? 'PaymentFailed' : 'PaymentConfirmed', occurredAt: new Date().toISOString(), paymentId: payment.id, orderId: event.orderId, userId: event.userId, amount: event.totalAmount, ...(failureReason ? { failureReason } : {}) });
  },
};
