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
   * Calculate the angle between this vector and another vector.
   * @param {Vector} other - The other vector.
   * @returns {number} The angle in radians.
   */
  angleBetween(other) {
    // const cosTheta = this.dotProduct(other) / (this.magnitude() * other.magnitude());
    // return Math.acos(cosTheta);

    const dotProduct = this.dotProduct(other);
    const magnitudeProduct = this.magnitude() * other.magnitude();

    // Handle parallel vectors (dotProduct ≈ magnitudeProduct)
    if (Math.abs(dotProduct - magnitudeProduct) < Number.EPSILON) {
      return dotProduct >= 0 ? 0 : Math.PI;
    }

    // Handle zero vectors
    if (magnitudeProduct === 0) {
      return 0; // Or return NaN if you prefer
    }

    const cosTheta = dotProduct / magnitudeProduct;
    let angle = Math.acos(cosTheta);

    // Use the cross product to determine the sign of the angle
    const crossProductZ = this.x * other.y - this.y * other.x; // 2D cross product
    if (crossProductZ < 0) {
      angle = 2 * Math.PI - angle;
    }

    return angle;
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

export { Vector, convertToDegrees, convertToRadians, lerp, random };
//# sourceMappingURL=makelab.math.js.map
