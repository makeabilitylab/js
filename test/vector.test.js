/**
 * Tests for the Vector class.
 */
import { Vector } from '../src/lib/math/vector.js';
import { test, assert, assertEquals } from './test-runner.js';

const EPS = 1e-9;

// Arithmetic
test('Vector addition', () =>
  assert(new Vector(1, 2).add(new Vector(2, 2)).equals(new Vector(3, 4))));
test('Vector subtraction', () =>
  assert(new Vector(3, 4).subtract(new Vector(2, 2)).equals(new Vector(1, 2))));
test('Vector multiplication', () =>
  assert(new Vector(1, 2).multiply(2).equals(new Vector(2, 4))));
test('Vector division', () =>
  assert(new Vector(2, 4).divide(4).equals(new Vector(0.5, 1))));
test('Vector division by zero returns (0, 0)', () =>
  assert(new Vector(2, 4).divide(0).equals(new Vector(0, 0))));

// Magnitude and normalization
test('Vector magnitude', () =>
  assertEquals(new Vector(3, 4).magnitude(), 5, EPS));
test('Vector normalization', () =>
  assert(new Vector(3, 4).normalize().equals(new Vector(0.6, 0.8), EPS)));
test('Vector normalize of zero vector returns (0, 0)', () =>
  assert(new Vector(0, 0).normalize().equals(new Vector(0, 0))));

// Dot product
test('Vector dot product', () =>
  assertEquals(new Vector(2, 3).dotProduct(new Vector(3, 1)), 9, EPS));

// angleBetween — unsigned [0, π]
test('angleBetween (perpendicular)', () =>
  assertEquals(new Vector(1, 0).angleBetween(new Vector(0, 1)), Math.PI / 2, EPS));
test('angleBetween (parallel)', () =>
  assertEquals(new Vector(1, 0).angleBetween(new Vector(2, 0)), 0, EPS));
test('angleBetween of zero vector returns 0', () =>
  assertEquals(new Vector(0, 0).angleBetween(new Vector(1, 1)), 0, EPS));
test('angleBetween is symmetric', () =>
  assertEquals(
    new Vector(0, 1).angleBetween(new Vector(1, 1)),
    new Vector(1, 1).angleBetween(new Vector(0, 1)), EPS));

// signedAngleTo — directed (-π, π], counterclockwise positive
test('signedAngleTo (counterclockwise is positive)', () =>
  assertEquals(new Vector(1, 0).signedAngleTo(new Vector(0, 1)), Math.PI / 2, EPS));
test('signedAngleTo (clockwise is negative)', () =>
  assertEquals(new Vector(0, 1).signedAngleTo(new Vector(1, 0)), -Math.PI / 2, EPS));
test('signedAngleTo is anti-symmetric', () =>
  assertEquals(
    new Vector(1, 0).signedAngleTo(new Vector(1, 1)),
    -new Vector(1, 1).signedAngleTo(new Vector(1, 0)), EPS));

// Misc
test('Vector clone', () =>
  assert(new Vector(2, 3).clone().equals(new Vector(2, 3))));
test('Vector toString', () =>
  assertEquals(new Vector(2, 3).toString(), '(2, 3)'));
test('Vector fromPoints', () =>
  assert(Vector.fromPoints({ x: 1, y: 2 }, { x: 3, y: 5 }).equals(new Vector(2, 3))));
