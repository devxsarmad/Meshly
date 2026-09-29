import assert from 'node:assert/strict';
import test from 'node:test';
import { loginCredentialsSchema, normalizeLoginEmail } from '../src/utils/login-credentials';

test('auth login accepts valid credentials and normalizes email', () => {
  const input = loginCredentialsSchema.parse({ email: 'CUSTOMER@EXAMPLE.COM', password: 'correct horse' });
  assert.equal(normalizeLoginEmail(input.email), 'customer@example.com');
});

test('auth login rejects malformed credentials', () => {
  assert.throws(() => loginCredentialsSchema.parse({ email: 'not-an-email', password: 'short' }));
});
