import assert from 'node:assert/strict';
import test from 'node:test';
import { totalPages } from '../src/utils/pagination';

test('product pagination returns a usable page count', () => {
  assert.equal(totalPages(0, 12), 1);
  assert.equal(totalPages(25, 12), 3);
  assert.equal(totalPages(24, 12), 2);
});
