import assert from 'node:assert/strict';
import test from 'node:test';
import { createToolHandlers, inputSchemas, requiredConfig, type ToolConfig } from '../src/tools.js';

const config: ToolConfig = {
  productServiceUrl: 'http://product.test', orderServiceUrl: 'http://order.test', paymentServiceUrl: 'http://payment.test',
  jwtAccessSecret: 'unit-test-secret', internalServiceKey: 'unit-test-internal-key',
};
const jsonResponse = (data: unknown, status = 200) => new Response(JSON.stringify({ success: status < 400, data, ...(status >= 400 ? { message: 'Resource not found' } : {}) }), { status, headers: { 'content-type': 'application/json' } });
const resultJson = (result: { content: Array<{ text: string }> }) => JSON.parse(result.content[0].text);

test('product tools return catalog data and categories', async () => {
  const handlers = createToolHandlers(config, async (input) => String(input).includes('/categories')
    ? jsonResponse(['Ceramics', 'Textiles'])
    : jsonResponse({ items: [{ _id: '0123456789abcdef01234567', name: 'Cup', price: 12 }] }));
  assert.deepEqual(resultJson(await handlers.searchProducts({ query: 'cup' })), { query: 'cup', products: [{ id: '0123456789abcdef01234567', name: 'Cup', price: 12 }] });
  assert.deepEqual(resultJson(await handlers.listCategories()), ['Ceramics', 'Textiles']);
});

test('order and membership tools pass required identity and return read-only fields', async () => {
  let calls = 0;
  const handlers = createToolHandlers(config, async (input, init) => {
    calls += 1;
    const url = String(input);
    if (url.includes('/internal/subscriptions/')) {
      assert.equal(new Headers(init?.headers).get('x-internal-service-key'), config.internalServiceKey);
      return jsonResponse({ status: 'ACTIVE', currentPeriodEnd: '2026-11-02T00:00:00.000Z' });
    }
    assert.match(new Headers(init?.headers).get('authorization') ?? '', /^Bearer /);
    return url.endsWith('/api/orders?page=1&limit=50')
      ? jsonResponse({ items: [{ id: 'ord_123', status: 'PAID', totalAmount: 18, createdAt: '2026-10-01T00:00:00.000Z' }], pagination: {} })
      : jsonResponse({ id: 'ord_123', status: 'PAID', totalAmount: 18, createdAt: '2026-10-01T00:00:00.000Z' });
  });
  assert.equal(resultJson(await handlers.getOrderStatus({ orderId: 'ord_123', userId: 'user_1' })).status, 'PAID');
  assert.equal(resultJson(await handlers.getOrderHistory({ userId: 'user_1' }))[0].orderId, 'ord_123');
  assert.deepEqual(resultJson(await handlers.checkClubMembership({ userId: 'user_1' })), { status: 'active', renewalDate: '2026-11-02T00:00:00.000Z' });
  assert.equal(calls, 3);
});

test('invalid identifiers are rejected by input schemas', () => {
  assert.equal(inputSchemas.getProductDetails.safeParse({ productId: 'bad-id' }).success, false);
  assert.equal(inputSchemas.getOrderStatus.safeParse({ orderId: '', userId: 'user_1' }).success, false);
  assert.equal(inputSchemas.getOrderHistory.safeParse({ userId: 'bad id' }).success, false);
});

test('downstream HTTP and network failures become structured tool errors', async () => {
  const notFound = createToolHandlers(config, async () => jsonResponse(null, 404));
  const httpError = await notFound.getProductDetails({ productId: '0123456789abcdef01234567' });
  assert.equal(httpError.isError, true);
  assert.match(resultJson(httpError).error.message, /not found/i);

  const unavailable = createToolHandlers(config, async () => { throw new Error('socket closed'); });
  const serviceError = await unavailable.searchProducts({ query: 'cup' });
  assert.equal(serviceError.isError, true);
  assert.match(resultJson(serviceError).error.message, /Product service is unavailable/);
});

test('startup configuration fails with the missing URL name', () => {
  assert.throws(() => requiredConfig({}), /PRODUCT_SERVICE_URL/);
});
