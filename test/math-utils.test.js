/**
 * Tests for the math utility functions.
 */
import {
  convertToRadians, convertToDegrees, lerp, map, random, clamp,
  easeOutCubic, easeInCubic, easeOutQuad, easeInOutCubic,
} from '../src/lib/math/math-utils.js';
import { test, assert, assertEquals } from './test-runner.js';

const EPS = 1e-9;

test('convertToRadians', () => assertEquals(convertToRadians(180), Math.PI, EPS));
test('convertToDegrees', () => assertEquals(convertToDegrees(Math.PI), 180, EPS));

test('lerp midpoint', () => assertEquals(lerp(0, 100, 0.5), 50, EPS));
test('lerp endpoints', () => {
  assertEquals(lerp(10, 20, 0), 10, EPS);
  assertEquals(lerp(10, 20, 1), 20, EPS);
});

test('map basic', () => assertEquals(map(5, 0, 10, 0, 100), 50, EPS));
test('map extrapolates by default', () => assertEquals(map(15, 0, 10, 0, 100), 150, EPS));
test('map clamps when withinBounds is true', () =>
  assertEquals(map(15, 0, 10, 0, 100, true), 100, EPS));

test('clamp below / within / above', () => {
  assertEquals(clamp(-5, 0, 10), 0);
  assertEquals(clamp(5, 0, 10), 5);
  assertEquals(clamp(15, 0, 10), 10);
});

test('random stays within [min, max)', () => {
  for (let i = 0; i < 1000; i++) {
    const r = random(2, 5);
    assert(r >= 2 && r < 5, `random(2,5) returned ${r}`);
  }
});
test('random with one arg stays within [0, max)', () => {
  for (let i = 0; i < 1000; i++) {
    const r = random(5);
    assert(r >= 0 && r < 5, `random(5) returned ${r}`);
  }
});

test('easing functions map 0 to 0 and 1 to 1', () => {
  for (const ease of [easeOutCubic, easeInCubic, easeOutQuad, easeInOutCubic]) {
    assertEquals(ease(0), 0, EPS);
    assertEquals(ease(1), 1, EPS);
  }
});
