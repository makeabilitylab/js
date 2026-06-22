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

// p5-parity helpers — all immutable (return new vectors)
test('rotate by π/2 turns (1,0) into (0,1)', () =>
  assert(new Vector(1, 0).rotate(Math.PI / 2).equals(new Vector(0, 1), EPS)));
test('heading of (0,1) is π/2', () =>
  assertEquals(new Vector(0, 1).heading(), Math.PI / 2, EPS));
test('dist between (0,0) and (3,4) is 5', () =>
  assertEquals(new Vector(0, 0).dist(new Vector(3, 4)), 5, EPS));
test('limit caps an over-long vector to the max magnitude', () =>
  assertEquals(new Vector(3, 4).limit(2.5).magnitude(), 2.5, EPS));
test('limit leaves a short-enough vector unchanged', () =>
  assert(new Vector(3, 4).limit(10).equals(new Vector(3, 4), EPS)));
test('withMagnitude sets length while keeping direction', () =>
  assert(new Vector(3, 4).withMagnitude(10).equals(new Vector(6, 8), EPS)));
test('lerp halfway between (0,0) and (10,20)', () =>
  assert(new Vector(0, 0).lerp(new Vector(10, 20), 0.5).equals(new Vector(5, 10), EPS)));
test('static fromAngle(0) is the unit x vector', () =>
  assert(Vector.fromAngle(0).equals(new Vector(1, 0), EPS)));
test('static fromAngle with length', () =>
  assert(Vector.fromAngle(Math.PI / 2, 5).equals(new Vector(0, 5), EPS)));
test('the new helpers do not mutate the original vector', () => {
  const v = new Vector(3, 4);
  v.rotate(1); v.limit(1); v.withMagnitude(1); v.lerp(new Vector(0, 0), 0.5);
  assert(v.equals(new Vector(3, 4)));
});
