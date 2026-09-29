import assert from 'node:assert/strict';
import test from 'node:test';
import { notificationRoutingKeys } from '../src/events/routing-keys';

test('notification consumer listens to the customer-facing event types', () => {
  assert.deepEqual(notificationRoutingKeys, ['order.placed', 'payment.confirmed', 'payment.failed']);
});
