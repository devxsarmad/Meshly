import assert from 'node:assert/strict';
import test from 'node:test';
import { PaymentStatus } from '@prisma/client';
import { paymentStatusForStripeEvent, shouldProcessPaymentEvent } from '../src/utils/payment-event-policy';

test('payment webhook processes a pending payment only once', () => {
  assert.equal(shouldProcessPaymentEvent(PaymentStatus.PENDING), true);
  assert.equal(shouldProcessPaymentEvent(PaymentStatus.CONFIRMED), false);
  assert.equal(shouldProcessPaymentEvent(PaymentStatus.FAILED), false);
});

test('payment webhook maps Stripe outcomes to internal statuses', () => {
  assert.equal(paymentStatusForStripeEvent('payment_intent.succeeded'), PaymentStatus.CONFIRMED);
  assert.equal(paymentStatusForStripeEvent('payment_intent.payment_failed'), PaymentStatus.FAILED);
  assert.equal(paymentStatusForStripeEvent('payment_intent.canceled'), PaymentStatus.CANCELED);
});
