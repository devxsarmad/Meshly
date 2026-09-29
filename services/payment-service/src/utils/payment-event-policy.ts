import { PaymentStatus } from '@prisma/client';

export function shouldProcessPaymentEvent(status: PaymentStatus): boolean {
  return status === PaymentStatus.PENDING;
}

export function paymentStatusForStripeEvent(eventType: string): PaymentStatus {
  if (eventType === 'payment_intent.succeeded') return PaymentStatus.CONFIRMED;
  if (eventType === 'payment_intent.canceled') return PaymentStatus.CANCELED;
  return PaymentStatus.FAILED;
}
