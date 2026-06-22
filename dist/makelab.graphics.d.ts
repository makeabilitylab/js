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

declare class LineSegment {
    /**
     * Draws positive and negative angle arcs between two line segments on a canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {Object} lineSegment1 - The first line segment.
     * @param {Object} lineSegment2 - The second line segment.
     * @param {string} clockwiseArcColor - The color of arc1
     * @param {string} counterclockwiseArcColor - The color of arc2
     * @param {number} [clockwiseArcRadius=50] - The size of the positive angle arc.
     * @param {number} [counterclockwiseArcRadius=30] - The size of the negative angle arc.
     */
    static drawAngleArcs(ctx: CanvasRenderingContext2D, lineSegment1: any, lineSegment2: any, clockwiseArcColor?: string, counterclockwiseArcColor?: string, clockwiseArcRadius?: number, counterclockwiseArcRadius?: number): void;
    /**
     * Creates an instance of a line segment.
     *
     * @constructor
     * @param {number|object} x1 - The x-coordinate of the first point or a vector object.
     * @param {number|object} y1 - The y-coordinate of the first point or a vector object.
     * @param {number} [x2] - The x-coordinate of the second point (optional if x1 and y1 are vectors).
     * @param {number} [y2] - The y-coordinate of the second point (optional if x1 and y1 are vectors).
     */
    constructor(x1: number | object, y1: number | object, x2?: number, y2?: number, ...args: any[]);
    pt1: any;
    pt2: any;
    fontSize: number;
    strokeColor: string;
    isDashedLine: boolean;
    drawTextLabels: boolean;
    drawTextMagnitude: boolean;
    drawTextAngle: boolean;
    strokeWeight: number;
    /**
     * Set x1
     */
    set x1(val: any);
    /**
     * Returns x1
     */
    get x1(): any;
    /**
     * Set y1
     */
    set y1(val: any);
    /**
     * Returns y1
     */
    get y1(): any;
    /**
     * Set x2
     */
    set x2(val: any);
    /**
     * Returns x2
     */
    get x2(): any;
    /**
     * Set y2
     */
    set y2(val: any);
    /**
     * Returns y2
     */
    get y2(): any;
    /**
     * Returns the heading of the line segment in radians between 0 and 2*PI.
     */
    getHeading(): number;
    /**
     * Returns the two normals for the line segment (one normal for each direction)
     */
    getNormals(): Vector[];
    /**
     * Returns one of the normals for this line segment. To get both
     * normals, call getNormals()
     */
    getNormal(): Vector;
    /**
     * Calculates the vector representing the line segment moved to the origin.
     *
     * @returns {Vector} The vector representing the line segment at the origin.
     */
    getVectorAtOrigin(): Vector;
    /**
     * Gets the angles between this line segment and the given vector or line segment.
     * Returns both the counterclockwise and clockwise angles in radians.
     *
     * @param {Vector|LineSegment} vectorOrLineSegment The other vector or line segment.
     * @returns {Object} An object containing both the counterclockwise and clockwise angles in radians.
     */
    getAnglesBetween(vectorOrLineSegment: Vector | LineSegment): any;
    /**
     * Calculates the orthogonal projection of vector p onto this line segment.
     *
     * @param {Vector} p The vector to project onto the line segment.
     * @returns {Vector} The orthogonal projection of p onto the line segment.
     */
    getOrthogonalProjection(p: Vector): Vector;
    /**
     * Returns the minimum distance between this line segment and the given point p.
     *
     * @param {Vector} p The point to calculate the distance to.
     * @returns {number} The minimum distance between the line segment and the point.
     */
    getDistance(p: Vector): number;
    /**
     * Returns the magnitude of this vector as a floating point number.
     *
     * @returns {number} The magnitude of the line segment.
     */
    getMagnitude(): number;
    /**
     * Sets the magnitude of the line segment to the given number.
     *
     * @param {number} len The desired magnitude of the line segment.
     */
    setMagnitude(len: number): void;
    /**
     * Draws the line segment on the provided canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    drawArrow(ctx: any, p1: any, p2: any, color: any): void;
    /**
     * Generates the label to be displayed on the line segment.
     *
     * @returns {string} The label text.
     */
    generateLabel(): string;
}

/**
 * Linearly interpolates between two colors.
 *
 * @param {Object|string} startColor - The starting color. Can be an object with r, g, b, and
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {Object|string} endColor - The ending color. Can be an object with r, g, b, and
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {number} amt - The amount to interpolate between the two colors. Should be a value between 0 and 1.
 * @returns {string} The interpolated color in rgba format.
 */
declare function lerpColor(startColor: any | string, endColor: any | string, amt: number): string;
/**
 * Converts a color string (hex, rgb, or rgba) to an object with r, g, b, and optionally a properties.
 * If the input is already an object, it returns the input as is.
 *
 * @param {string|Object} colorStr - The color string or object to convert.
 * @returns {Object} An object with properties r, g, b, and optionally a.
 * @throws {Error} If the color string format is invalid.
 */
declare function convertColorStringToObject(colorStr: string | any): any;
/**
 * Converts HSV (hue, saturation, value) to RGB (red, green, blue).
 *
 * @param {number} h - Hue value between 0 and 1.
 * @param {number} s - Saturation value between 0 and 1.
 * @param {number} v - Value (brightness) between 0 and 1.
 * @param {boolean} [returnRounded=true] - Whether to round RGB values to integers.
 * @returns {{r: number, g: number, b: number}} RGB object with values 0–255.
 *
 * @example
 * hsvToRgb(0, 1, 1);       // { r: 255, g: 0, b: 0 }  (pure red)
 * hsvToRgb(0.33, 1, 0.5);  // greenish, half brightness
 */
declare function hsvToRgb(h: number, s: number, v: number, returnRounded?: boolean): {
    r: number;
    g: number;
    b: number;
};
/**
 * Converts RGB (red, green, blue) to HSV (hue, saturation, value).
 *
 * @param {number} r - Red value between 0 and 255 (inclusive).
 * @param {number} g - Green value between 0 and 255 (inclusive).
 * @param {number} b - Blue value between 0 and 255 (inclusive).
 * @returns {{h: number, s: number, v: number}} HSV object with values 0–1.
 *
 * @example
 * rgbToHsv(255, 0, 0);  // { h: 0, s: 1, v: 1 }  (pure red)
 */
declare function rgbToHsv(r: number, g: number, b: number): {
    h: number;
    s: number;
    v: number;
};
/**
 * Changes the HSV brightness (value) of a color while preserving hue and saturation.
 *
 * @param {string|Object} color - CSS color string or {r, g, b, a} object.
 * @param {number} newBrightnessPercent - New brightness as a percentage (0–100).
 * @returns {string} The adjusted color as an rgba() string.
 *
 * @example
 * changeColorBrightness("#cc4133", 80);  // darken to 80% brightness
 * changeColorBrightness("rgb(255,255,255)", 50);  // mid-gray
 */
declare function changeColorBrightness(color: string | any, newBrightnessPercent: number): string;
/**
 * Changes both the HSV saturation and brightness (value) of a color
 * while preserving hue.
 *
 * @param {string|Object} color - CSS color string or {r, g, b, a} object.
 * @param {number} newSaturationPercent - New saturation as a percentage (0–100).
 * @param {number} newBrightnessPercent - New brightness as a percentage (0–100).
 * @returns {string} The adjusted color as an rgba() string.
 *
 * @example
 * changeColorSaturationAndBrightness("#fdf2d0", 25, 99);
 */
declare function changeColorSaturationAndBrightness(color: string | any, newSaturationPercent: number, newBrightnessPercent: number): string;
/**
 * Parses a 3-, 6-, or 8-digit hex color string into an {r, g, b, a} object.
 * The leading `#` is optional. The 8-digit form carries alpha in its final two
 * digits (returned as 0–1); otherwise alpha defaults to 1. The 3-digit shorthand
 * is expanded (e.g., `"f80"` → `"ff8800"`).
 *
 * Shared by {@link convertColorStringToObject} and {@link hexStringToRgb} so
 * both accept the same set of hex formats.
 *
 * @param {string} hex - Hex color string (e.g., "#f80", "cc4133", "#ff000080").
 * @returns {{r: number, g: number, b: number, a: number}|null} The parsed color,
 *   or `null` if the string is not a valid 3/6/8-digit hex color.
 */
declare function parseHexString(hex: string): {
    r: number;
    g: number;
    b: number;
    a: number;
} | null;
/**
 * Converts a hex color string to an RGB object.
 *
 * @param {string} hex - Hex color string (e.g., "#cc4133" or "cc4133"). Accepts
 *   3-, 6-, or 8-digit hex (the alpha of the 8-digit form is ignored here).
 * @returns {{r: number, g: number, b: number}|null} RGB object or null if invalid.
 */
declare function hexStringToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
/**
 * Converts RGB values to a hex color string.
 *
 * @param {number} r - Red value between 0 and 255 (inclusive).
 * @param {number} g - Green value between 0 and 255 (inclusive).
 * @param {number} b - Blue value between 0 and 255 (inclusive).
 * @returns {string} Hex color string (e.g., "#CC4133").
 *
 * @example
 * rgbToHex(255, 0, 0);    // "#FF0000"
 * rgbToHex(0, 128, 255);  // "#0080FF"
 */
declare function rgbToHex(r: number, g: number, b: number): string;

export { LineSegment, changeColorBrightness, changeColorSaturationAndBrightness, convertColorStringToObject, hexStringToRgb, hsvToRgb, lerpColor, parseHexString, rgbToHex, rgbToHsv };
