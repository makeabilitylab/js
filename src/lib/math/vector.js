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