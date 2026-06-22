/**
 * Tests for array utility functions.
 *
 * shuffle() is randomized, so we test its invariants (same array reference,
 * same length, same elements) rather than a specific ordering.
 */
import { shuffle } from '../src/lib/array-utils.js';
import { test, assert, assertEquals } from './test-runner.js';

test('shuffle returns the same array reference (shuffles in place)', () => {
  const arr = [1, 2, 3];
  assert(shuffle(arr) === arr);
});

test('shuffle preserves length', () => {
  const arr = [1, 2, 3, 4, 5];
  shuffle(arr);
  assertEquals(arr.length, 5);
});

test('shuffle preserves the same elements (as a multiset)', () => {
  const arr = [1, 2, 2, 3, 4, 5, 5];
  const before = JSON.stringify([...arr].sort((a, b) => a - b));
  shuffle(arr);
  const after = JSON.stringify([...arr].sort((a, b) => a - b));
  assertEquals(after, before);
});

test('shuffle of an empty array stays empty', () => {
  const arr = [];
  assert(shuffle(arr) === arr && arr.length === 0);
});

test('shuffle of a single element is unchanged', () => {
  const arr = [42];
  shuffle(arr);
  assert(arr.length === 1 && arr[0] === 42);
});
