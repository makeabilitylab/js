/**
 * Class representing a 2D vector.
 */
declare class Vector {
    /**
     * Create a vector from two points.
     * @param {Object} p1 - The first point with x and y properties.
     * @param {Object} p2 - The second point with x and y properties.
     * @returns {Vector} The resulting vector.
     */
    static fromPoints(p1: any, p2: any): Vector;
    /**
     * Creates a vector pointing in the direction of the given angle, measured from
     * the positive x-axis in standard math orientation (counterclockwise, +y up).
     *
     * @param {number} angleRadians - The direction angle in radians.
     * @param {number} [length=1] - The magnitude of the resulting vector.
     * @returns {Vector} The new vector.
     */
    static fromAngle(angleRadians: number, length?: number): Vector;
    /**
     * Create a vector.
     * @param {number} x - The x coordinate.
     * @param {number} y - The y coordinate.
     */
    constructor(x: number, y: number);
    x: number;
    y: number;
    /**
     * Add another vector to this vector.
     * @param {Vector} other - The vector to add.
     * @returns {Vector} The resulting vector.
     */
    add(other: Vector): Vector;
    /**
     * Subtract another vector from this vector.
     * @param {Vector} other - The vector to subtract.
     * @returns {Vector} The resulting vector.
     */
    subtract(other: Vector): Vector;
    /**
     * Multiply this vector by a scalar.
     * @param {number} scalar - The scalar to multiply by.
     * @returns {Vector} The resulting vector.
     */
    multiply(scalar: number): Vector;
    /**
     * Divide this vector by a scalar.
     * @param {number} scalar - The scalar to divide by.
     * @returns {Vector} The resulting vector.
     */
    divide(scalar: number): Vector;
    /**
     * Calculate the magnitude (length) of this vector.
     * @returns {number} The magnitude of the vector.
     */
    magnitude(): number;
    /**
     * Normalize this vector (make it have a magnitude of 1).
     * @returns {Vector} The normalized vector.
     */
    normalize(): Vector;
    /**
     * Calculate the dot product of this vector and another vector.
     * @param {Vector} other - The other vector.
     * @returns {number} The dot product.
     */
    dotProduct(other: Vector): number;
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
    angleBetween(other: Vector): number;
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
    signedAngleTo(other: Vector): number;
    /**
     * Returns this vector rotated counterclockwise by the given angle, in standard
     * math orientation (+y up). Note: on a typical canvas the y-axis points *down*,
     * so a positive angle appears clockwise on screen.
     *
     * @param {number} angleRadians - The rotation angle in radians.
     * @returns {Vector} A new, rotated vector.
     */
    rotate(angleRadians: number): Vector;
    /**
     * The heading (direction) of this vector as an angle in radians, measured from
     * the positive x-axis with {@link Math.atan2}, in the range (-π, π].
     *
     * @returns {number} The heading in radians.
     */
    heading(): number;
    /**
     * The Euclidean distance between this vector's point and another's.
     *
     * @param {Vector} other - The other point/vector.
     * @returns {number} The distance between the two points.
     */
    dist(other: Vector): number;
    /**
     * Returns a new vector in the same direction as this one but with its magnitude
     * capped at `max`. Vectors already at or below `max` are returned unchanged (as
     * a copy). Handy for limiting velocity/force in sketches.
     *
     * @param {number} max - The maximum allowed magnitude.
     * @returns {Vector} A new vector with magnitude ≤ max.
     */
    limit(max: number): Vector;
    /**
     * Returns a new vector with the same direction as this one but the given
     * magnitude. Returns (0, 0) if this vector has zero length.
     *
     * @param {number} length - The desired magnitude.
     * @returns {Vector} A new vector of the given magnitude.
     */
    withMagnitude(length: number): Vector;
    /**
     * Linearly interpolates between this vector and another.
     *
     * @param {Vector} other - The vector to interpolate toward.
     * @param {number} amt - The amount, 0 (this) to 1 (other).
     * @returns {Vector} A new, interpolated vector.
     */
    lerp(other: Vector, amt: number): Vector;
    /**
     * Returns a new Vector with the same components.
     * @returns {Vector} A copy of this vector.
     */
    clone(): Vector;
    /**
     * Tests whether this vector equals another, within an optional tolerance.
     * Use a non-zero epsilon to compare results of floating-point math.
     *
     * @param {Vector} other - The vector to compare against.
     * @param {number} [epsilon=0] - Maximum allowed difference per component.
     * @returns {boolean} True if both components are within epsilon of other's.
     */
    equals(other: Vector, epsilon?: number): boolean;
    /**
     * Get a string representation of this vector.
     * @returns {string} A string representation of the vector.
     */
    toString(): string;
}

/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */
declare function convertToRadians(degrees: number): number;
/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} radians - The angle in radians to be converted.
 * @returns {number} The angle in degrees.
 */
declare function convertToDegrees(radians: number): number;
/**
 * Linearly interpolates between two values.
 *
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} amt - The interpolation amount (0-1).
 * @returns {number} The interpolated value.
 */
declare function lerp(start: number, end: number, amt: number): number;
/**
 * Generates a random number within a specified range (similar to p5js random).
 * If only one argument is provided, it generates a number between 0 and the argument.
 * If two arguments are provided, it generates a number between the two arguments.
 *
 * @param {number} min - The minimum value (inclusive) or the maximum value if only one argument is provided.
 * @param {number} [max] - The maximum value (exclusive).
 * @returns {number} A random number within the specified range.
 */
declare function random(min: number, max?: number): number;
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
declare function map(value: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds?: boolean): number;
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
declare function randomGaussian(mean?: number, sd?: number): number;
/**
 * Clamps a value between a minimum and maximum.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum bound.
 * @param {number} max - The maximum bound.
 * @returns {number} The clamped value.
 */
declare function clamp(value: number, min: number, max: number): number;
/**
 * Constrains a value to a range. Alias for {@link clamp}, named to match
 * p5.js's `constrain()` so p5 users find the familiar name.
 *
 * @param {number} value - The value to constrain.
 * @param {number} min - The minimum bound.
 * @param {number} max - The maximum bound.
 * @returns {number} The constrained value.
 */
declare function constrain(value: number, min: number, max: number): number;
/** @param {number} t @returns {number} */
declare function easeOutCubic(t: number): number;
/** @param {number} t @returns {number} */
declare function easeOutQuad(t: number): number;
/** @param {number} t @returns {number} */
declare function easeInOutCubic(t: number): number;
/** @param {number} t @returns {number} */
declare function easeInCubic(t: number): number;
/**
 * Overshoots past 1 near the end before settling back, giving a springy "snap"
 * landing. Useful for assembly animations where pieces should slightly overshoot
 * their resting spot. Returns 0 at t=0 and 1 at t=1 but exceeds 1 in between.
 * @param {number} t @returns {number}
 */
declare function easeOutBack(t: number): number;

export { Vector, clamp, constrain, convertToDegrees, convertToRadians, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, easeOutQuad, lerp, map, random, randomGaussian };
