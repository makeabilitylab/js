/**
 * Tests for the color utility functions.
 */
import {
  hexStringToRgb, rgbToHex, hsvToRgb, rgbToHsv,
  convertColorStringToObject, lerpColor,
} from '../src/lib/graphics/color-utils.js';
import { test, assert, assertEquals } from './test-runner.js';

// Hex <-> RGB
test('hexStringToRgb (6-digit)', () => {
  const c = hexStringToRgb('#ff8800');
  assert(c.r === 255 && c.g === 136 && c.b === 0);
});
test('hexStringToRgb (shorthand)', () => {
  const c = hexStringToRgb('#f80');
  assert(c.r === 255 && c.g === 136 && c.b === 0);
});
test('hexStringToRgb (8-digit ignores alpha)', () => {
  const c = hexStringToRgb('#ff000080');
  assert(c.r === 255 && c.g === 0 && c.b === 0);
  assert(c.a === undefined, 'hexStringToRgb should not return an alpha channel');
});
test('hexStringToRgb returns null on invalid input', () =>
  assertEquals(hexStringToRgb('nope'), null));
test('rgbToHex', () => assertEquals(rgbToHex(255, 0, 0), '#FF0000'));
test('rgbToHex rounds and clamps out-of-range values', () =>
  assertEquals(rgbToHex(255.6, -5, 128), '#FF0080'));

// HSV <-> RGB
test('hsvToRgb (pure red)', () => {
  const c = hsvToRgb(0, 1, 1);
  assert(c.r === 255 && c.g === 0 && c.b === 0);
});
test('rgbToHsv (pure red)', () => {
  const c = rgbToHsv(255, 0, 0);
  assertEquals(c.h, 0);
  assertEquals(c.s, 1);
  assertEquals(c.v, 1);
});
test('hsv -> rgb -> hsv round trip', () => {
  const rgb = hsvToRgb(0.33, 0.8, 0.6);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  const rgb2 = hsvToRgb(hsv.h, hsv.s, hsv.v);
  assert(Math.abs(rgb.r - rgb2.r) <= 1 &&
         Math.abs(rgb.g - rgb2.g) <= 1 &&
         Math.abs(rgb.b - rgb2.b) <= 1);
});

// Color string parsing
test('convertColorStringToObject (named color)', () => {
  const c = convertColorStringToObject('red');
  assert(c.r === 255 && c.g === 0 && c.b === 0);
});
test('convertColorStringToObject (rgb string)', () => {
  const c = convertColorStringToObject('rgb(10, 20, 30)');
  assert(c.r === 10 && c.g === 20 && c.b === 30);
});
test('convertColorStringToObject (3-digit hex shorthand)', () => {
  const c = convertColorStringToObject('#f80');
  assert(c.r === 255 && c.g === 136 && c.b === 0, `got ${JSON.stringify(c)}`);
  assert(c.a === 1);
});
test('convertColorStringToObject (8-digit hex with alpha)', () => {
  const c = convertColorStringToObject('#ff000080');
  assert(c.r === 255 && c.g === 0 && c.b === 0);
  assert(Math.abs(c.a - 128 / 255) < 1e-6);
});
test('convertColorStringToObject throws on invalid input', () => {
  let threw = false;
  try { convertColorStringToObject('not-a-color'); } catch (e) { threw = true; }
  assert(threw, 'expected an error for an invalid color string');
});

// Interpolation
test('lerpColor midpoint of black and white is mid-grey', () =>
  assertEquals(lerpColor('#000000', '#ffffff', 0.5), 'rgba(128, 128, 128, 1)'));
