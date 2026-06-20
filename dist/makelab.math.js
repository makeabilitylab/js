/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */
function convertToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} radians - The angle in radians to be converted.
 * @returns {number} The angle in degrees.
 */
function convertToDegrees(radians) {
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
function lerp(start, end, amt) {
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
function random(min, max) {
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
function map(value, start1, stop1, start2, stop2, withinBounds = false) {
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
function randomGaussian(mean = 0, sd = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
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
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// --- Easing functions ---
// Each takes a value t in [0, 1] and returns a value in [0, 1].
// See https://easings.net/ for visualizations.

/** @param {number} t @returns {number} */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

/** @param {number} t @returns {number} */
function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

/** @param {number} t @returns {number} */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** @param {number} t @returns {number} */
function easeInCubic(t) { return t * t * t; }

/**
 * Overshoots past 1 near the end before settling back, giving a springy "snap"
 * landing. Useful for assembly animations where pieces should slightly overshoot
 * their resting spot. Returns 0 at t=0 and 1 at t=1 but exceeds 1 in between.
 * @param {number} t @returns {number}
 */
function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

/**
 * Class representing a 2D vector.
 */
class Vector {
  /**
   * Create a vector.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector to this vector.
   * @param {Vector} other - The vector to add.
   * @returns {Vector} The resulting vector.
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another vector from this vector.
   * @param {Vector} other - The vector to subtract.
   * @returns {Vector} The resulting vector.
   */
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply this vector by a scalar.
   * @param {number} scalar - The scalar to multiply by.
   * @returns {Vector} The resulting vector.
   */
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide this vector by a scalar.
   * @param {number} scalar - The scalar to divide by.
   * @returns {Vector} The resulting vector.
   */
  divide(scalar) {
    // Guard against division by zero, mirroring normalize().
    if (scalar === 0) {
      return new Vector(0, 0);
    }
    return new Vector(this.x / scalar, this.y / scalar);
  }

  /**
   * Calculate the magnitude (length) of this vector.
   * @returns {number} The magnitude of the vector.
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this vector (make it have a magnitude of 1).
   * @returns {Vector} The normalized vector.
   */
  normalize() {
    const mag = this.magnitude();
    // BUG FIX: Prevent division by zero
    if (mag === 0) {
      return new Vector(0, 0);
    }
    return new Vector(this.x / mag, this.y / mag);
  }

  /**
   * Calculate the dot product of this vector and another vector.
   * @param {Vector} other - The other vector.
   * @returns {number} The dot product.
   */
  dotProduct(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Calculates the unsigned angle between this vector and another, in the
   * range [0, π]. This is the conventional "angle between two vectors" and is
   * symmetric: `a.angleBetween(b)` equals `b.angleBetween(a)`.
   *
   * For a signed/directed angle (e.g., to know which way to rotate from one
   * vector to the other), use {@link Vector#signedAngleTo}.
   *
   * @param {Vector} other - The other vector.
   * @returns {number} The angle in radians, in [0, π]. Returns 0 if either
   *   vector has zero length.
   */
  angleBetween(other) {
    const magnitudeProduct = this.magnitude() * other.magnitude();
    if (magnitudeProduct === 0) {
      return 0;
    }
    // Clamp guards against tiny floating-point overshoot outside acos's [-1, 1] domain.
    const cosTheta = clamp(this.dotProduct(other) / magnitudeProduct, -1, 1);
    return Math.acos(cosTheta);
  }

  /**
   * Calculates the signed angle from this vector to another, in the range
   * (-π, π]. Positive is counterclockwise and negative is clockwise, in
   * standard math orientation (y pointing up). Unlike {@link Vector#angleBetween},
   * this is directional: `a.signedAngleTo(b)` equals `-b.signedAngleTo(a)`.
   *
   * Note: on a typical canvas the y-axis points *down*, so a positive result
   * appears clockwise on screen.
   *
   * @param {Vector} other - The other vector.
   * @returns {number} The signed angle in radians, in (-π, π].
   */
  signedAngleTo(other) {
    const cross = this.x * other.y - this.y * other.x; // z of the 2D cross product
    const dot = this.dotProduct(other);
    return Math.atan2(cross, dot);
  }

  /**
   * Returns a new Vector with the same components.
   * @returns {Vector} A copy of this vector.
   */
  clone() {
    return new Vector(this.x, this.y);
  }

  /**
   * Tests whether this vector equals another, within an optional tolerance.
   * Use a non-zero epsilon to compare results of floating-point math.
   *
   * @param {Vector} other - The vector to compare against.
   * @param {number} [epsilon=0] - Maximum allowed difference per component.
   * @returns {boolean} True if both components are within epsilon of other's.
   */
  equals(other, epsilon = 0) {
    return Math.abs(this.x - other.x) <= epsilon &&
      Math.abs(this.y - other.y) <= epsilon;
  }

  /**
   * Get a string representation of this vector.
   * @returns {string} A string representation of the vector.
   */
  toString() {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Create a vector from two points.
   * @param {Object} p1 - The first point with x and y properties.
   * @param {Object} p2 - The second point with x and y properties.
   * @returns {Vector} The resulting vector.
   */
  static fromPoints(p1, p2) {
    return new Vector(p2.x - p1.x, p2.y - p1.y);
  }
}

export { Vector, clamp, convertToDegrees, convertToRadians, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, easeOutQuad, lerp, map, random, randomGaussian };
//# sourceMappingURL=makelab.math.js.map
