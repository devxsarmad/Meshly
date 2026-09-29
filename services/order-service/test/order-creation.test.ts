import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateOrderTotal, enrichOrderItems } from '../src/services/order-calculation';

test('order creation enriches items from verified product data in parallel', async () => {
  const requested: string[] = [];
  const items = await enrichOrderItems([{ productId: 'p-1', quantity: 2 }, { productId: 'p-2', quantity: 1 }], async (productId) => {
    requested.push(productId);
    return productId === 'p-1' ? { name: 'Server Product', price: 10 } : { name: 'Another Product', price: 25 };
  });
  assert.deepEqual(requested.sort(), ['p-1', 'p-2']);
  assert.deepEqual(items, [
    { productId: 'p-1', name: 'Server Product', unitPrice: 10, quantity: 2 },
    { productId: 'p-2', name: 'Another Product', unitPrice: 25, quantity: 1 },
  ]);
});

test('active Meshly Club membership applies a ten percent order discount', () => {
  assert.deepEqual(calculateOrderTotal([{ productId: 'p-1', name: 'Product', unitPrice: 100, quantity: 2 }], { status: 'ACTIVE' }), { subtotal: 200, clubDiscount: 20, totalAmount: 180 });
});
