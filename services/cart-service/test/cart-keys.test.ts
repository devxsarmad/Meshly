import assert from 'node:assert/strict';
import test from 'node:test';
import { cartKey, wishlistKey } from '../src/utils/keys';

test('cart and wishlist data use separate user-scoped Redis keys', () => {
  assert.equal(cartKey('user-1'), 'meshly:cart:user-1');
  assert.equal(wishlistKey('user-1'), 'meshly:wishlist:user-1');
  assert.notEqual(cartKey('user-1'), wishlistKey('user-1'));
});
