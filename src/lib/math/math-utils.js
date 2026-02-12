/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */
export function convertToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} radians - The angle in radians to be converted.
 * @returns {number} The angle in degrees.
 */
export function convertToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Linearly interpolates between two values.
 *
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} amt - The interpolation amount (0-1).
 * @returns {number} The interpolated value.
 */
export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

/**
 * Generates a random number within a specified range (similar to p5js random).
 * If only one argument is provided, it generates a number between 0 and the argument.
 * If two arguments are provided, it generates a number between the two arguments.
 * 
 * @param {number} min - The minimum value (inclusive) or the maximum value if only one argument is provided.
 * @param {number} [max] - The maximum value (exclusive).
 * @returns {number} A random number within the specified range.
 */
export function random(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.random() * (upper - lower) + lower;
}

/**
 * Re-maps a number from one range to another (similar to p5js map).
 *
 * @param {number} value - The value to re-map.
 * @param {number} start1 - The lower bound of the input range.
 * @param {number} stop1 - The upper bound of the input range.
 * @param {number} start2 - The lower bound of the output range.
 * @param {number} stop2 - The upper bound of the output range.
 * @param {boolean} [withinBounds=false] - If true, clamps the result to [start2, stop2].
 * @returns {number} The re-mapped value.
 * 
 * @example
 * map(5, 0, 10, 0, 100);         // 50
 * map(15, 0, 10, 0, 100, true);  // 100 (clamped)
 */
export function map(value, start1, stop1, start2, stop2, withinBounds = false) {
  const mapped = start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
  if (!withinBounds) return mapped;

  const min = Math.min(start2, stop2);
  const max = Math.max(start2, stop2);
  return Math.max(min, Math.min(max, mapped));
}

/**
 * Generates a random number from a Gaussian (normal) distribution
 * using the Box-Muller transform (similar to p5js randomGaussian).
 *
 * @param {number} [mean=0] - The mean of the distribution.
 * @param {number} [sd=1] - The standard deviation of the distribution.
 * @returns {number} A random number from the Gaussian distribution.
 * 
 * @example
 * randomGaussian(100, 5);  // random number centered around 100, sd=5
 * randomGaussian();         // standard normal (mean=0, sd=1)
 */
export function randomGaussian(mean = 0, sd = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * sd + mean;
}

/**
 * Clamps a value between a minimum and maximum.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum bound.
 * @param {number} max - The maximum bound.
 * @returns {number} The clamped value.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// --- Easing functions ---
// Each takes a value t in [0, 1] and returns a value in [0, 1].
// See https://easings.net/ for visualizations.

/** @param {number} t @returns {number} */
export function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/** @param {number} t @returns {number} */
export function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

/** @param {number} t @returns {number} */
export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** @param {number} t @returns {number} */
export function easeInCubic(t) { return t * t * t; }