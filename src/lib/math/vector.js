import { clamp } from './math-utils.js';

/**
 * Class representing a 2D vector.
 */
export class Vector {
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
   * Returns this vector rotated counterclockwise by the given angle, in standard
   * math orientation (+y up). Note: on a typical canvas the y-axis points *down*,
   * so a positive angle appears clockwise on screen.
   *
   * @param {number} angleRadians - The rotation angle in radians.
   * @returns {Vector} A new, rotated vector.
   */
  rotate(angleRadians) {
    const cos = Math.cos(angleRadians);
    const sin = Math.sin(angleRadians);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  /**
   * The heading (direction) of this vector as an angle in radians, measured from
   * the positive x-axis with {@link Math.atan2}, in the range (-π, π].
   *
   * @returns {number} The heading in radians.
   */
  heading() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * The Euclidean distance between this vector's point and another's.
   *
   * @param {Vector} other - The other point/vector.
   * @returns {number} The distance between the two points.
   */
  dist(other) {
    return this.subtract(other).magnitude();
  }

  /**
   * Returns a new vector in the same direction as this one but with its magnitude
   * capped at `max`. Vectors already at or below `max` are returned unchanged (as
   * a copy). Handy for limiting velocity/force in sketches.
   *
   * @param {number} max - The maximum allowed magnitude.
   * @returns {Vector} A new vector with magnitude ≤ max.
   */
  limit(max) {
    if (this.magnitude() > max) {
      return this.normalize().multiply(max);
    }
    return this.clone();
  }

  /**
   * Returns a new vector with the same direction as this one but the given
   * magnitude. Returns (0, 0) if this vector has zero length.
   *
   * @param {number} length - The desired magnitude.
   * @returns {Vector} A new vector of the given magnitude.
   */
  withMagnitude(length) {
    return this.normalize().multiply(length);
  }

  /**
   * Linearly interpolates between this vector and another.
   *
   * @param {Vector} other - The vector to interpolate toward.
   * @param {number} amt - The amount, 0 (this) to 1 (other).
   * @returns {Vector} A new, interpolated vector.
   */
  lerp(other, amt) {
    return new Vector(
      this.x + (other.x - this.x) * amt,
      this.y + (other.y - this.y) * amt
    );
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

  /**
   * Creates a vector pointing in the direction of the given angle, measured from
   * the positive x-axis in standard math orientation (counterclockwise, +y up).
   *
   * @param {number} angleRadians - The direction angle in radians.
   * @param {number} [length=1] - The magnitude of the resulting vector.
   * @returns {Vector} The new vector.
   */
  static fromAngle(angleRadians, length = 1) {
    return new Vector(Math.cos(angleRadians) * length, Math.sin(angleRadians) * length);
  }
}