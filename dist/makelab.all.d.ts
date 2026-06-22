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
    /** @type {number} Font size (px) of the angle/magnitude label. */
    fontSize: number;
    /** @type {string} Stroke color of the line, arrowhead, and label. */
    strokeColor: string;
    /** @type {boolean} If true, draw the line dashed instead of solid. */
    isDashedLine: boolean;
    /** @type {boolean} If true, draw the text label next to the segment. */
    drawTextLabels: boolean;
    /** @type {boolean} If true (and labels are on), include the magnitude in the label. */
    drawTextMagnitude: boolean;
    /** @type {boolean} If true (and labels are on), include the angle in the label. */
    drawTextAngle: boolean;
    /** @type {number} Stroke width of the line in pixels. */
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
    /**
     * Draws an arrow: a line from `p1` along the offset vector `p2`, with an
     * arrowhead at the tip. Used internally by {@link LineSegment#draw}.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     * @param {Vector} p1 - The arrow's start point (tail).
     * @param {Vector} p2 - The offset from the tail to the tip (i.e. tip = p1 + p2).
     * @param {string} color - The stroke and fill color of the arrow.
     */
    drawArrow(ctx: CanvasRenderingContext2D, p1: Vector, p2: Vector, color: string): void;
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

/**
 * A simple, event-driven wrapper around the Web Serial API for text-based
 * serial communication with microcontrollers.
 *
 * Handles the complexity of stream setup, text encoding/decoding, and
 * line-break parsing so you can focus on the serial interaction itself.
 *
 * @example <caption>Basic usage</caption>
 * const serial = new Serial();
 *
 * serial.on(SerialEvents.CONNECTION_OPENED, async () => {
 *   console.log("Connected!");
 *   await serial.writeLine("Hello Arduino!"); // safe to send once open
 * });
 *
 * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
 *   console.log("Arduino says:", line);
 * });
 *
 * serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
 *   console.error("Error:", error.message);
 * });
 *
 * // Open from a user gesture (the browser requires one). connectAndOpen() stays
 * // pending the whole time the port is open — it runs the read loop internally —
 * // so do follow-up work from the CONNECTION_OPENED event above, not after this
 * // call. For ESP32, pass { baudRate: 115200 }.
 * connectButton.addEventListener("click", () => serial.connectAndOpen());
 *
 * @example <caption>Auto-reconnect to a previously approved port</caption>
 * const serial = new Serial();
 * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
 *   document.getElementById("output").textContent = line;
 * });
 * // No user gesture needed if the port was previously approved
 * await serial.autoConnectAndOpenPreviouslyApprovedPort({ baudRate: 115200 });
 */
declare class Serial {
    /**
     * Returns `true` if the current browser supports the Web Serial API.
     *
     * @returns {boolean}
     *
     * @example
     * if (!Serial.isWebSerialSupported()) {
     *   alert("Please use Chrome, Edge, or Opera to connect to Arduino.");
     * }
     */
    static isWebSerialSupported(): boolean;
    /** @type {?SerialPort} The underlying Web Serial port */
    serialPort: SerialPort | null;
    /** @type {?WritableStreamDefaultWriter} Text writer for outgoing data */
    serialWriter: WritableStreamDefaultWriter | null;
    /** @type {?ReadableStreamDefaultReader} Line-buffered reader for incoming data */
    serialReader: ReadableStreamDefaultReader | null;
    /** @private */
    private keepReading;
    /** @private */
    private readableStreamClosed;
    /** @private */
    private writableStreamClosed;
    /** @private */
    private _state;
    /**
     * Map of event labels to arrays of callback functions.
     * @private
     * @type {Map<string, function[]>}
     */
    private events;
    /**
     * Set of recognized event labels for validation.
     * @private
     * @type {Set<string>}
     */
    private knownEvents;
    /**
     * The navigator-level "disconnect" handler, registered while the port is
     * open and removed on close() so listeners don't accumulate across Serial
     * instances. Null when not open.
     * @private
     * @type {?function}
     */
    private _onDeviceDisconnect;
    /**
     * The current connection state.
     *
     * @returns {string} One of {@link SerialState}: `"closed"`, `"opening"`, `"open"`, or `"closing"`.
     *
     * @example
     * if (serial.state === SerialState.OPEN) {
     *   await serial.writeLine("data");
     * }
     */
    get state(): string;
    /**
     * Registers an event listener for a specific event.
     *
     * @param {string} label - The event type. Must be one of {@link SerialEvents}.
     * @param {function(Serial, *): void} callback - Handler function. Receives
     *   the Serial instance as the first argument and event-specific data as the second.
     *
     * @example
     * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
     *   console.log("Received:", line);
     * });
     *
     * serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
     *   console.error("Serial error:", error.message);
     * });
     */
    on(label: string, callback: (arg0: Serial, arg1: any) => void): void;
    /**
     * Removes a previously registered event listener.
     *
     * @param {string} label - The event type.
     * @param {function} callback - The exact function reference passed to {@link Serial#on}.
     * @returns {boolean} `true` if the listener was found and removed, `false` otherwise.
     *
     * @example
     * function onData(sender, line) { console.log(line); }
     * serial.on(SerialEvents.DATA_RECEIVED, onData);
     * // Later:
     * serial.off(SerialEvents.DATA_RECEIVED, onData);
     */
    off(label: string, callback: Function): boolean;
    /**
     * Triggers an event and calls all registered handlers for it.
     *
     * @param {string} event - The event type to fire.
     * @param {*} [data=null] - Optional data passed to each handler.
     */
    fireEvent(event: string, data?: any): void;
    /**
     * Automatically connects to and opens a previously approved port.
     * If the user has approved multiple ports, the first one in the list is used.
     *
     * This method does **not** require a user gesture (click) because the port
     * was already approved in a prior session. Useful for seamless reconnection
     * on page load.
     *
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     *   Use `{ baudRate: 115200 }` for ESP32.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open#options
     *
     * @example
     * // Reconnect to the last-used Arduino
     * await serial.autoConnectAndOpenPreviouslyApprovedPort();
     *
     * // Reconnect to the last-used ESP32
     * await serial.autoConnectAndOpenPreviouslyApprovedPort({ baudRate: 115200 });
     */
    autoConnectAndOpenPreviouslyApprovedPort(serialOptions?: any): Promise<void>;
    /**
     * Returns `true` if the serial port is open and ready for reading and writing.
     *
     * @returns {boolean}
     *
     * @example
     * if (serial.isOpen()) {
     *   await serial.writeLine("sensor data request");
     * }
     */
    isOpen(): boolean;
    /**
     * Prompts the user to select a serial device and opens the connection.
     * This is the primary method for most use cases.
     *
     * **Must be called from a user gesture** (e.g., a button click) because
     * `navigator.serial.requestPort()` requires user activation.
     *
     * **The returned promise stays pending until the port is closed** — internally
     * this runs the read loop for the whole session. Don't `await` it and expect
     * the next line to run while connected; instead, react to
     * {@link SerialEvents.CONNECTION_OPENED} (and `DATA_RECEIVED`) and call
     * {@link Serial#writeLine} from there.
     *
     * @param {Object[]|null} [portFilters=null] - Optional USB vendor/product ID filters.
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     *   Use `{ baudRate: 115200 }` for ESP32.
     *
     * @example <caption>Default (Arduino Uno at 9600 baud)</caption>
     * document.getElementById("connectBtn").addEventListener("click", async () => {
     *   await serial.connectAndOpen();
     * });
     *
     * @example <caption>ESP32 at 115200 baud</caption>
     * await serial.connectAndOpen(null, { baudRate: 115200 });
     *
     * @example <caption>Filter to only show Arduino devices</caption>
     * const arduinoFilters = [
     *   { usbVendorId: 0x2341 }  // Arduino vendor ID
     * ];
     * await serial.connectAndOpen(arduinoFilters, { baudRate: 9600 });
     */
    connectAndOpen(portFilters?: any[] | null, serialOptions?: any): Promise<void>;
    /**
     * Attempts to connect to an existing port or prompts the user to select one.
     *
     * Most callers should use {@link Serial#connectAndOpen} instead, which
     * calls this method internally and then opens the port.
     *
     * @param {?SerialPort} [existingPort=null] - A previously obtained port to reuse.
     * @param {?Object[]} [portFilters=null] - USB vendor/product ID filters for the port picker.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort
     */
    connect(existingPort?: SerialPort | null, portFilters?: any[] | null): Promise<void>;
    /**
     * Writes a string to the serial port with a newline (`\n`) appended.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.writeLine("LED_ON");
     */
    writeLine(data: string): Promise<void>;
    /**
     * Writes a string to the serial port.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.write("255,128,0");
     */
    write(data: string): Promise<void>;
    /**
     * Opens the serial port and begins listening for incoming data. The returned
     * promise stays pending until the port is closed, since it runs the read loop
     * internally (see {@link Serial#connectAndOpen}).
     *
     * Most callers should use {@link Serial#connectAndOpen} instead. This lower-level
     * method is called internally after a port has been selected via {@link Serial#connect}.
     *
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open
     */
    open(serialOptions?: any): Promise<void>;
    /**
     * Closes the serial port and releases all resources.
     *
     * Safe to call even if the port is already closed or was never opened.
     * Fires {@link SerialEvents.CONNECTION_CLOSED} when cleanup is complete.
     *
     * @example
     * document.getElementById("disconnectBtn").addEventListener("click", async () => {
     *   await serial.close();
     * });
     */
    close(): Promise<void>;
    /**
     * Registers a navigator-level "disconnect" listener that auto-closes this port
     * if the OS reports the device was unplugged. Called from {@link Serial#open};
     * paired with {@link Serial#_removeDisconnectListener} in {@link Serial#close}
     * so listeners don't accumulate across instances.
     * @private
     */
    private _addDisconnectListener;
    /**
     * Removes the "disconnect" listener registered by {@link Serial#_addDisconnectListener}.
     * @private
     */
    private _removeDisconnectListener;
    /**
     * Checks if the Web Serial API is available in this browser.
     * @private
     * @throws {Error} If Web Serial is not supported.
     */
    private _requireWebSerial;
    /**
     * Fires an ERROR_OCCURRED event with consistent logging.
     * @private
     * @param {Error} error
     */
    private _fireError;
}
/**
 * *
 */
type SerialEvents = string;
/**
 * Enum-like object of serial event types. Use these with {@link Serial#on} to
 * subscribe to serial lifecycle and data events.
 *
 * @readonly
 * @enum {string}
 *
 * @example
 * serial.on(SerialEvents.DATA_RECEIVED, (sender, data) => {
 *   console.log("Received:", data);
 * });
 */
declare const SerialEvents: Readonly<{
    /** Fired when the serial port is successfully opened and ready for I/O. */
    CONNECTION_OPENED: "CONNECTION_OPENED";
    /** Fired when the serial port is closed (either programmatically or by disconnect). */
    CONNECTION_CLOSED: "CONNECTION_CLOSED";
    /** Fired for each line of text received from the serial device. */
    DATA_RECEIVED: "DATA_RECEIVED";
    /** Fired when an error occurs during connection, reading, or writing. */
    ERROR_OCCURRED: "ERROR_OCCURRED";
}>;
/**
 * Connection state constants returned by {@link Serial#state}.
 */
type SerialState = string;
/**
 * Connection state constants returned by {@link Serial#state}.
 *
 * @readonly
 * @enum {string}
 */
declare const SerialState: Readonly<{
    CLOSED: "closed";
    OPENING: "opening";
    OPEN: "open";
    CLOSING: "closing";
}>;
/**
 * A TransformStream transformer that buffers incoming text chunks and emits
 * complete lines. Handles `\r\n`, `\n`, and `\r` line endings.
 *
 * Used internally by {@link Serial} to parse serial data into lines.
 *
 * @example <caption>Standalone usage (advanced)</caption>
 * const transformer = new TransformStream(new LineBreakTransformer());
 * const reader = someReadableStream.pipeThrough(transformer).getReader();
 */
declare class LineBreakTransformer {
    /** @private */
    private buffer;
    /**
     * Called by the TransformStream for each incoming chunk. Buffers data
     * and enqueues complete lines.
     *
     * @param {string} chunk - Incoming text chunk.
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    transform(chunk: string, controller: TransformStreamDefaultController): void;
    /**
     * Called when the stream is closed. Flushes any remaining buffered text.
     *
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    flush(controller: TransformStreamDefaultController): void;
}

/**
 * @typedef {Object} MorphPath
 * @property {function(Triangle, MorphPathContext): void} prepare - Per-triangle
 *   one-time setup, called when start/end states are assigned.
 * @property {function(Triangle, number): {x: number, y: number}} position -
 *   Returns the triangle's position at eased progress `t` in [0, 1].
 */
/**
 * @typedef {Object} MorphPathContext
 * @property {number} centroidX - X of the assembled logo's centre.
 * @property {number} centroidY - Y of the assembled logo's centre.
 * @property {number} canvasWidth
 * @property {number} canvasHeight
 * @property {number} index - This triangle's index in the animated pool.
 * @property {number} count - Total number of animated triangles.
 */
/**
 * Straight-line path — the classic reverse-explosion behaviour. Position is a
 * plain lerp from start to destination, so with the default easing this is
 * identical to the morpher's original motion.
 *
 * @returns {MorphPath}
 */
declare function linearPath(): MorphPath;
/**
 * Arc path — each triangle is lobbed into place along a parabola, offset
 * perpendicular to its straight-line route by `sin(π·t)` so it bows out at the
 * midpoint and lands exactly on target. The bow scales with travel distance, so
 * far-flung pieces arc more than nearby ones.
 *
 * @param {Object} [opts]
 * @param {number} [opts.amplitude=0.35] - Peak perpendicular offset as a
 *   fraction of the start→dest distance.
 * @param {boolean} [opts.randomizeSign=true] - If true, each triangle bows left
 *   or right at random; if false, all bow the same way.
 * @returns {MorphPath}
 */
declare function arcPath({ amplitude, randomizeSign }?: {
    amplitude?: number;
    randomizeSign?: boolean;
}): MorphPath;
/**
 * Bézier path — each triangle follows a quadratic Bézier curve through a random
 * control point near the midpoint of its route. Because every triangle gets its
 * own control point, the assembly looks organic with no two pieces alike.
 *
 * @param {Object} [opts]
 * @param {number} [opts.spread=0.4] - How far the control point can stray from
 *   the route midpoint, as a fraction of the start→dest distance.
 * @returns {MorphPath}
 */
declare function bezierPath({ spread }?: {
    spread?: number;
}): MorphPath;
/**
 * Spiral path — triangles swirl inward toward the logo, orbiting its centroid as
 * they converge. Each triangle's polar coordinates (radius, angle) relative to
 * the centroid are interpolated, with `turns` extra revolutions mixed in so the
 * whole field rotates into place like a vortex.
 *
 * @param {Object} [opts]
 * @param {number} [opts.turns=1] - Extra full revolutions added to each
 *   triangle's angular sweep. Higher = more swirl.
 * @returns {MorphPath}
 */
declare function spiralPath({ turns }?: {
    turns?: number;
}): MorphPath;
/**
 * Registry of path factories keyed by short name, for wiring to UI controls.
 * Each value is a factory: call it (optionally with options) to get a MorphPath.
 *
 * @type {Object<string, function(Object=): MorphPath>}
 */
declare const MORPH_PATHS: {
    [x: string]: (arg0?: any | undefined) => MorphPath;
};
type MorphPath = {
    /**
     * - Per-triangle
     * one-time setup, called when start/end states are assigned.
     */
    prepare: (arg0: Triangle, arg1: MorphPathContext) => void;
    /**
     * -
     * Returns the triangle's position at eased progress `t` in [0, 1].
     */
    position: (arg0: Triangle, arg1: number) => {
        x: number;
        y: number;
    };
};
type MorphPathContext = {
    /**
     * - X of the assembled logo's centre.
     */
    centroidX: number;
    /**
     * - Y of the assembled logo's centre.
     */
    centroidY: number;
    canvasWidth: number;
    canvasHeight: number;
    /**
     * - This triangle's index in the animated pool.
     */
    index: number;
    /**
     * - Total number of animated triangles.
     */
    count: number;
};

declare class MakeabilityLabLogo$1 {
    static get DEFAULT_M_OUTLINE_COLOR(): string;
    static get DEFAULT_M_OUTLINE_STROKE_WIDTH(): number;
    static get DEFAULT_L_OUTLINE_COLOR(): string;
    static get DEFAULT_L_OUTLINE_STROKE_WIDTH(): number;
    /**
     * The logo has 6 cols and 4 rows
     */
    static get numRows(): number;
    /**
     * The logo has 6 cols and 4 rows
     */
    static get numCols(): number;
    /**
     * Calculates the width of the MakeabilityLabLogo based on the size of the triangles.
     *
     * @param {number} triangleSize - The size of each triangle.
     * @returns {number} The total width of the MakeabilityLabLogo.
     */
    static getGridWidth(triangleSize: number): number;
    /**
     * Calculates the grid height of the MakeabilityLabLogo (excluding the label)
     * based on the size of the triangles.
     *
     * @param {number} triangleSize - The size of each triangle.
     * @returns {number} The grid height of the logo (numRows × triangleSize).
     */
    static getGridHeight(triangleSize: number): number;
    /**
   * Calculates the X origin for centering the MakeabilityLabLogo on a canvas.
   *
   * The returned value is the logo's grid origin (left edge of cell [0,0]),
   * not the visual center. Pass this directly to the MakeabilityLabLogo
   * constructor as `x`, and as `offsetX` to the Grid constructor.
   *
   * The optional strokePadding shifts the origin inward so the M outline's
   * stroke bleed (half the stroke width on each side) is visually symmetric.
   * Without it, the stroke bleeds further on the right than the left, making
   * the logo appear off-center. Pass MakeabilityLabLogo.DEFAULT_M_OUTLINE_STROKE_WIDTH
   * or the logo instance's mOutlineStrokeWidth.
   *
   * @param {number} triangleSize  - Cell size in pixels.
   * @param {number} canvasWidth   - Canvas width in logical (CSS) pixels.
   * @param {boolean} [alignToGrid=false] - If true, snaps to nearest cell boundary.
   * @param {number} [strokePadding=0] - Total stroke width of the M outline.
   *   The origin is shifted inward by strokePadding/2 (half on each side).
   * @returns {number} The x-coordinate for the logo's grid origin.
   */
    static getGridXCenterPosition(triangleSize: number, canvasWidth: number, alignToGrid?: boolean, strokePadding?: number): number;
    /**
     * Calculates the Y origin for centering the MakeabilityLabLogo on a canvas.
     * Positions the grid only (excludes label). For label-aware centering use
     * the instance method centerLogo().
     *
     * See getGridXCenterPosition() for full documentation on strokePadding.
     *
     * @param {number} triangleSize  - Cell size in pixels.
     * @param {number} canvasHeight  - Canvas height in logical (CSS) pixels.
     * @param {boolean} [alignToGrid=false] - If true, snaps to nearest cell boundary.
     * @param {number} [strokePadding=0] - Total stroke width of the M outline.
     *   The origin is shifted inward by strokePadding/2 (half on each side).
     * @returns {number} The y-coordinate for the logo's grid origin.
     */
    static getGridYCenterPosition(triangleSize: number, canvasHeight: number, alignToGrid?: boolean, strokePadding?: number): number;
    /**
     * Gives each triangle its own random color from the Makeability Lab palette,
     * using that same color for both fill and stroke.
     *
     * @param {Triangle[]} triangles - The triangles to recolor.
     * @param {boolean} [isFillVisible=true] - Whether the fill is drawn.
     * @param {boolean} [isStrokeVisible=true] - Whether the stroke is drawn.
     */
    static setRandomColors(triangles: Triangle$1[], isFillVisible?: boolean, isStrokeVisible?: boolean): void;
    /**
     * Sets the fill and stroke colors (and visibility) for the given triangles.
     * Also seeds startFillColor/endFillColor to the fill color so the triangles
     * are ready for color animation (see {@link MakeabilityLabLogoMorpher}).
     *
     * @param {Triangle[]} triangles - The triangles to recolor.
     * @param {string} fillColor - The fill color.
     * @param {string} strokeColor - The stroke color.
     * @param {boolean} [isFillVisible=true] - Whether the fill is drawn.
     * @param {boolean} [isStrokeVisible=true] - Whether the stroke is drawn.
     */
    static setColors(triangles: Triangle$1[], fillColor: string, strokeColor: string, isFillVisible?: boolean, isStrokeVisible?: boolean): void;
    static createMakeabilityLabLogoCellArray(x: any, y: any, triangleSize: any): any[];
    static createMakeabilityLabTopRow(x: any, y: any, triangleSize: any): any[];
    static createMakeabilityLab2ndRow(x: any, y: any, triangleSize: any): any[];
    static createMakeabilityLab3rdRow(x: any, y: any, triangleSize: any): any[];
    static createMakeabilityLabBottomRow(x: any, y: any, triangleSize: any): any[];
    /**
     * Determines if the given row, column, and triangle number correspond to an M shadow triangle.
     * See getMShadowTriangles() for more information.
     *
     * @param {number} row - The row number to check.
     * @param {number} col - The column number to check.
     * @param {number} triNum - The triangle number to check.
     * @returns {boolean} - Returns true if the specified row, column, and triangle number
     * form an M shadow triangle, otherwise false.
     */
    static isMShadowTriangle(row: number, col: number, triNum: number): boolean;
    /**
     * Determines if the specified row, column, and triangle number correspond to a
     * triangle used in the L in the Makeability Lab logo
     * See getLTriangles() for more information.
     *
     * @param {number} row - The row index.
     * @param {number} col - The column index.
     * @param {number} triNum - The triangle number.
     * @returns {boolean} - Returns true if the specified row, column, and triangle number
     *   correspond to an L-shaped triangle; otherwise, false.
     */
    static isLTriangle(row: number, col: number, triNum: number): boolean;
    constructor(x: any, y: any, triangleSize: any);
    makeLabLogoArray: any[];
    visible: boolean;
    isMOutlineVisible: boolean;
    isLOutlineVisible: boolean;
    mOutlineColor: string;
    mOutlineStrokeWidth: number;
    lOutlineColor: string;
    lOutlineStrokeWidth: number;
    /**
     * Sets the visibility of the strokes for the L outline in the Makeability Lab logo
     *
     * @param {boolean} visible - A boolean indicating whether the strokes should be visible.
     */
    set areLTriangleStrokesVisible(visible: boolean);
    /**
     * Returns true of the L strokes are visible, otherwise false.
     *
     * @returns {boolean} True if all L-shaped triangle strokes are visible, otherwise false.
     */
    get areLTriangleStrokesVisible(): boolean;
    drawBoundingBox: boolean;
    lOutlineOpacity: number;
    mOutlineOpacity: number;
    /** Whether the label is visible and included in the logo's bounding box / height. */
    isLabelVisible: boolean;
    labelText: string;
    labelBoldUntilIndex: number;
    labelFontFamily: string;
    labelColor: string;
    /**
     * Vertical gap in pixels between the bottom of the logo grid and the label.
     * @type {number}
     */
    labelGap: number;
    /**
     * Label font size as a fraction of logo width. Used for bounding-box and
     * height calculations (which don't have access to a canvas context).
     * At draw time the actual font size is computed via measureText so the
     * label spans exactly the logo width; this fraction should approximate
     * that rendered size so centering / layout is accurate.
     * @type {number}
     */
    labelFontSizeFraction: number;
    /**
     * Sets the draw debug information flag for the logo and its components.
     *
     * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
     */
    setDrawDebugInfo(drawDebugInfo: boolean): void;
    /**
     * Calculates the bounding box for the logo dynamically that encompasses all triangles
     * and accounts for stroke widths and label height (if visible).
     *
     * Keeps track of which triangles contribute to the minX, minY, maxX, and maxY values.
     *
     * @returns {Object} An object representing the bounding box with the following properties:
     * - `x` {number}: The minimum x-coordinate of the bounding box.
     * - `y` {number}: The minimum y-coordinate of the bounding box.
     * - `width` {number}: The width of the bounding box.
     * - `height` {number}: The height of the bounding box.
     * - `minXTriangle` {Triangle}: The triangle contributing to the minimum x-coordinate.
     * - `minYTriangle` {Triangle}: The triangle contributing to the minimum y-coordinate.
     * - `maxXTriangle` {Triangle}: The triangle contributing to the maximum x-coordinate.
     * - `maxYTriangle` {Triangle}: The triangle contributing to the maximum y-coordinate.
     */
    getBoundingBox(): any;
    /**
     * Sets the x-coordinate for the logo by adjusting the coordinates
     * of all triangles accordingly
     *
     * @param {number} x - The new x-coordinate to set.
     */
    set x(x: number);
    /**
     * Gets the far left x-coordinate of the Makeability Lab logo
     *
     * @returns {number} The x-coordinate of the first element.
     */
    get x(): number;
    /**
     * Sets the y-coordinate for the logo and adjusts the y-coordinates of all
     * triangles accordingly.
     *
     * @param {number} y - The new y-coordinate to set.
     */
    set y(y: number);
    /**
     * Gets the top y-coordinate of the Makeability Lab logo
     *
     * @returns {number} The y-coordinate of the first element.
     */
    get y(): number;
    /**
     * Gets the size of a cell in the Makeability Lab logo
     * Each cell is composed of two triangles
     *
     * @returns {number} The size of the cell.
     */
    get cellSize(): number;
    /**
     * Gets the width of the Makeability Lab logo
     *
     * @returns {number} The width of the Makeability Lab logo.
     */
    get width(): number;
    /**
     * Gets the height of the logo grid only (4 rows × cellSize), excluding the label.
     * @returns {number}
     */
    get logoGridHeight(): number;
    /**
     * Gets the approximate font size of the label in pixels.
     * Based on labelFontSizeFraction × logo width.
     * @returns {number}
     */
    get labelFontSize(): number;
    /**
     * Gets the vertical space the label occupies (gap + font size), or 0 if hidden.
     * @returns {number}
     */
    get labelHeight(): number;
    /**
     * Gets the total height of the MakeabilityLab logo, including the label if visible.
     * @returns {number}
     */
    get height(): number;
    /**
     * Getter for the default colors state.
     *
     * @returns {boolean} - Returns true if the default colors are on, otherwise false.
     */
    get areDefaultColorsOn(): boolean;
    /**
     * Adjusts the logo size to fit within the given canvas dimensions.
     * Updated to fully account for stroke widths and label visibility.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.
     */
    fitToCanvas(canvasWidth: number, canvasHeight: number, alignToGrid?: boolean): void;
    /**
     * Centers the logo on the canvas.
     *
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @param {boolean} [alignToGrid=false] - Whether to align the logo to the grid.
     */
    centerLogo(canvasWidth: number, canvasHeight: number, alignToGrid?: boolean): void;
    /**
     * Sets the size of the logo based on the given width.
     *
     * @param {number} logoWidth - The width of the logo.
     */
    setLogoSize(logoWidth: number): void;
    /**
     * Sets the size of all triangles to the specified value.
     *
     * @param {number} triangleSize - The new size to set for all triangles.
     */
    setTriangleSize(newSize: any): void;
    /**
     * Sets the position of the logo by adjusting the coordinates of all triangles.
     *
     * @param {number} x - The new x-coordinate for the logo.
     * @param {number} y - The new y-coordinate for the logo.
     */
    setLogoPosition(x: number, y: number): void;
    /**
     * Sets the stroke color for all L-shaped triangles.
     *
     * @param {string} color - The color to set as the stroke color for the triangles.
     */
    setLTriangleStrokeColor(color: string): void;
    /**
     * Sets the fill color for all L-shaped triangles. Accepts any CSS color,
     * including semi-translucent values (e.g. 'rgba(255, 255, 255, 0.5)') to let
     * the colored logo show through the L.
     *
     * @param {string} color - The color to set as the fill color for the triangles.
     */
    setLTriangleFillColor(color: string): void;
    /**
     * Sets the fill color for all MShadow triangles.
     *
     * @param {string} color - The color to set for the fill of the MShadow triangles.
     */
    setMShadowTriangleFillColor(color: string): void;
    /**
     * Sets the stroke visibility for all triangles.
     *
     * @param {boolean} isTransparent - If true, the stroke will be made transparent (invisible).
     * @param {boolean} [includeMShadowTriangles=true] - If true, includes M shadow triangles in the operation.
     */
    setStrokeTransparent(isTransparent: boolean, includeMShadowTriangles?: boolean): void;
    /**
     * Sets the internal triangles to transparent
     * @param {Boolean} isTransparent
     * @param {Boolean} includeMShadowTriangles
     */
    setFillTransparent(isTransparent: boolean, includeMShadowTriangles?: boolean): void;
    /**
     * Sets the fill color for all triangles in the logo.
     *
     * @param {string} color - The color to set as the fill color for the triangles.
     */
    setFillColor(color: string, includeMShadowTriangles?: boolean): void;
    /**
     * Convenience method to set fill and stroke colors
     * @param {*} fillColor
     * @param {*} strokeColor
     */
    setColors(fillColor: any, strokeColor: any, includeMShadowTriangles?: boolean): void;
    /**
     * Retrieves all triangles from the Makeability Lab logo array.
     * The M shadow triangles are the two dark triangles on the bottom left and right
     * side of the logo
     *
     * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles in the result.
     * @returns {Array} An array containing all the triangles from the Makeability Lab logo.
     */
    getAllTriangles(includeMShadowTriangles?: boolean, includeLTriangles?: boolean): any[];
    /**
     * Gets the triangles that are part of the M "shadow". That is, the
     * black/darkened parts of the M logo
     *
     * @returns {Array} An array containing the selected triangles.
     */
    getMShadowTriangles(): any[];
    /**
     * Gets the triangles that compose the L in the Makeability Lab logo
     *
     * @returns {Array} An array containing the selected triangles.
     */
    getLTriangles(): any[];
    /**
     * Gets the triangles that are colored in the ML logo by default
     *
     * @returns {Array} An array containing the default colored triangles.
     */
    getDefaultColoredTriangles(): any[];
    /**
     * Sets the default colors for the logo.
     */
    setFillColorsToDefault(): void;
    _defaultColorsOn: boolean;
    /**
     * Sets the default fill color for the colored triangles.
     *
     * @param {(string|string[])} fillColorOrColorArray - A single color string or an
     * array of color strings to set as the fill color(s) for the triangles.
     */
    setDefaultColoredTrianglesFillColor(fillColorOrColorArray: (string | string[])): void;
    /**
     * Sets the stroke width for all triangles.
     *
     * @param {number} strokeWidth - The width of the stroke to set.
     * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles.
     * @param {boolean} [includeLTriangles=true] - Whether to include L triangles.
     */
    setStrokeWidth(strokeWidth: number, includeMShadowTriangles?: boolean, includeLTriangles?: boolean): void;
    /**
     * Draws the Makeability Lab logo and its outlines if they are visible.
     *
     * This method performs the following actions:
     * 1. Checks if the logo is visible; if not, it returns immediately.
     * 2. Iterates through the `makeLabLogoArray` and calls the `draw` method on each element.
     * 3. If the M outline is visible, it draws the M outline using the specified color and stroke width.
     * 4. If the L outline is visible, it draws the L outline using the specified color and stroke width.
     */
    draw(ctx: any): void;
    /**
     * Draws only the M outline stroke.
     * No-ops when isMOutlineVisible is false or mOutlineOpacity is 0.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawMOutline(ctx: CanvasRenderingContext2D): void;
    /**
     * Draws only the L outline stroke.
     * No-ops when isLOutlineVisible is false or lOutlineOpacity is 0.
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    drawLOutline(ctx: CanvasRenderingContext2D): void;
    /**
     * Draws the "MAKEABILITY LAB" label below the logo grid, with the first
     * `labelBoldUntilIndex` characters rendered in bold. The font is scaled so
     * the full label spans exactly the logo width.
     *
     * Callers can pass optional overrides for animated rendering (e.g. fade-in
     * or slide-up effects) without mutating the logo's own properties.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {Object} [options]
     * @param {number} [options.opacity=1.0] - Label opacity (0–1).
     * @param {number} [options.yOffset=0]  - Additional vertical offset in pixels
     *                                         (positive = downward).
     */
    drawLabel(ctx: CanvasRenderingContext2D, { opacity, yOffset }?: {
        opacity?: number;
        yOffset?: number;
    }): void;
    /**
     *
     * @returns gets the L outline as an array of line segments
     */
    getLOutlineLineSegments(): any[];
    /**
     *
     * @returns Gets the L outline as an array of points (each point is [x, y])
     */
    getLOutlinePoints(): any[];
    /**
     *
     * @returns gets the M outline as an array of line segments
     */
    getMOutlineLineSegments(): any[];
    /**
     *
     * @returns Gets the M outline as an array of points (each point is [x, y])
     */
    getMOutlinePoints(): any[];
}
declare namespace TriangleDir {
    let TopLeft: string;
    let TopRight: string;
    let BottomLeft: string;
    let BottomRight: string;
}
declare class Cell {
    /**
     * Creates an empty cell with two invisible triangles.
     *
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {number} size - The size of the triangles.
     * @param {TriangleDir} [topTriangleDir=TriangleDir.TopLeft] - The direction of the top triangle.
     * @returns {Cell} A new cell containing two invisible triangles.
     */
    static createEmptyCell(x: number, y: number, size: number, topTriangleDir?: {
        TopLeft: string;
        TopRight: string;
        BottomLeft: string;
        BottomRight: string;
    }): Cell;
    /**
     * Creates a cell with only the top triangle visible.
     *
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {number} size - The size of the triangles.
     * @param {string} topTriangleDir - The direction of the top triangle. See TriangleDir for possible values.
     * @returns {Cell} A cell object with the top triangle visible and the bottom triangle hidden.
     */
    static createCellWithTopTriangleOnly(x: number, y: number, size: number, topTriangleDir: string): Cell;
    /**
     * Creates a cell with only the bottom triangle visible.
     *
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {number} size - The size of the triangles.
     * @param {string} botTriangleDir - The direction of the bottom triangle. See TriangleDir for possible values.
     * @returns {Cell} A new cell with the specified bottom triangle.
     */
    static createCellWithBottomTriangleOnly(x: number, y: number, size: number, botTriangleDir: string): Cell;
    /**
     * Creates a cell composed of two triangles.
     *
     * @param {number} x - The x-coordinate of the cell.
     * @param {number} y - The y-coordinate of the cell.
     * @param {number} size - The size of the triangles.
     * @param {string} triangle1Dir - The direction of the first triangle. See TriangleDir for possible values.
     * @param {string} [triangle2Dir] - The direction of the second triangle. If not provided, it will be the opposite of the first triangle's direction.
     * @returns {Cell} A new cell composed of two triangles.
     */
    static createCell(x: number, y: number, size: number, triangle1Dir: string, triangle2Dir?: string): Cell;
    /**
     * Creates an instance of the class with two triangles.
     * @constructor
     * @param {Object} triangle1 - The first triangle object.
     * @param {Object} triangle2 - The second triangle object.
     */
    constructor(triangle1: any, triangle2: any);
    tri1: any;
    tri2: any;
    drawBoundingBox: boolean;
    /**
     * Sets the draw debug information flag for this cell
     *
     * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
     */
    setDrawDebugInfo(drawDebugInfo: boolean): void;
    /**
     * Sets the x-coordinate for the cell
     *
     * @param {number} x - The x-coordinate to set.
     */
    set x(x: number);
    /**
     * Gets the x-coordinate of the cell
     * @returns {number} The x-coordinate of the cell.
     */
    get x(): number;
    /**
     * Sets the y-coordinate for the cell
     *
     * @param {number} y - The y-coordinate to set.
     */
    set y(y: number);
    /**
     * Gets the y-coordinate of the cell
     * @returns {number} The y-coordinate of the cell.
     */
    get y(): number;
    /**
     * Sets the size of the cell.
     *
     * @param {number} size - The size to set for the cell.
     */
    set size(size: number);
    /**
     * Gets the size of the cell. Cells are always square.
     * @type {number}
     */
    get size(): number;
    /**
     * Sets the fill and stroke colors for the cell.
     *
     * @param {string} fillColor - The color to be used for filling.
     * @param {string} [strokeColor] - The color to be used for the stroke.
     *    If not provided, the fillColor will be used as the stroke color.
     */
    setColors(fillColor: string, strokeColor?: string): void;
    /**
     * Sets the fill color for the cell.
     *
     * @param {string} fillColor - The fill color
     */
    setFillColor(fillColor: string): void;
    /**
     * Sets the stroke width for the logo's triangles.
     *
     * @param {number} strokeWidth - The width of the stroke to be applied to the triangles.
     */
    setStrokeWidth(strokeWidth: number): void;
    /**
     * Sets the stroke color for the cell.
     *
     * @param {string} strokeColor - The stroke color
     */
    setStrokeColor(strokeColor: string): void;
    /**
     * Sets the visibility of the cell
     *
     * @param {boolean} isVisible - A boolean indicating whether the cell is visible
     */
    setVisibility(isVisible: boolean): void;
    /**
     * Calculates the bounding box of the cell, encompassing all visible triangles.
     * If both triangles are visible, it returns the union of their bounding boxes.
     * If only one is visible, it returns that triangle's bounding box.
     *
     * @returns {Object} An object containing the {x, y, width, height} of the bounding box.
     * Returns a zero-sized box {x:0, y:0, width:0, height:0} if no triangles are visible.
     */
    getBoundingBox(): any;
    /**
     * Draws the cells on the canvas
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D): void;
}
declare class Triangle$1 {
    /**
     * Returns the opposite direction of the given triangle direction.
     *
     * @param {TriangleDir} triangleDir - The current direction of the triangle.
     * @returns {TriangleDir} - The opposite direction of the given triangle direction.
     */
    static getOppositeDirection(triangleDir: {
        TopLeft: string;
        TopRight: string;
        BottomLeft: string;
        BottomRight: string;
    }): {
        TopLeft: string;
        TopRight: string;
        BottomLeft: string;
        BottomRight: string;
    };
    /**
     * Creates a new Triangle object with the specified properties.
     *
     * @param {Object} tri - An object containing the properties of the triangle.
     * @param {number} tri.x - The x-coordinate of the triangle.
     * @param {number} tri.y - The y-coordinate of the triangle.
     * @param {number} tri.size - The size of the triangle.
     * @param {string} tri.direction - The direction of the triangle.
     * @param {string} tri.fillColor - The fill color of the triangle.
     * @param {string} tri.strokeColor - The stroke color of the triangle.
     * @param {number} tri.strokeWidth - The stroke width of the triangle.
     * @param {boolean} tri.visible - The visibility of the triangle.
     * @returns {Triangle} A new Triangle object.
     */
    static createTriangle(tri: {
        x: number;
        y: number;
        size: number;
        direction: string;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        visible: boolean;
    }): Triangle$1;
    /**
     * Creates an instance of the triangle.
     *
     * @constructor
     * @param {number} x - The x-coordinate of the triangle.
     * @param {number} y - The y-coordinate of the triangle.
     * @param {number} size - The size of the equilateral triangle.
     * @param {string} direction - The direction of the triangle. See TriangleDir for possible values.
     * @param {string} [fillColor='white'] - The fill color of the triangle.
     * @param {string} [strokeColor='black'] - The stroke color of the triangle.
     * @param {number} [strokeWidth=1] - The stroke width of the triangle.
     * @param {boolean} [visible=true] - The visibility of the triangle.
     */
    constructor(x: number, y: number, size: number, direction: string, fillColor?: string, strokeColor?: string, strokeWidth?: number, visible?: boolean);
    x: number;
    y: number;
    size: number;
    direction: string;
    angle: number;
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    visible: boolean;
    isFillVisible: boolean;
    isStrokeVisible: boolean;
    drawCellOutline: boolean;
    drawBoundingBox: boolean;
    /**
     * Sets the draw debug information flag for this triangle
     *
     * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
     */
    setDrawDebugInfo(drawDebugInfo: boolean): void;
    /**
     * Sets the fill and stroke colors for the triangle.
     *
     * @param {string} fillColor - The color to be used for filling.
     * @param {string} [strokeColor] - The color to be used for the stroke. If not provided, the fillColor will be used as the stroke color.
     */
    setColors(fillColor: string, strokeColor?: string): void;
    /**
     * Draws a triangle on the given canvas context based on the object's properties.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Calculates the bounding box of the triangle, taking into account its location,
     * size, and angle
     *
     * @returns {Object} An object containing the coordinates of the bounding box.
     */
    getBoundingBox(): any;
}
declare class Grid$1 {
    /**
     * Creates a 2D array of triangular cells that tile the canvas.
     *
     * The grid is extended by one extra row and column beyond what fits in
     * gridWidth/gridHeight to ensure full coverage when offsetX/offsetY shift
     * the origin away from (0, 0) — otherwise a strip along the top/left edge
     * would be left uncovered.
     *
     * Triangle orientation alternates in a checkerboard pattern so the diagonal
     * cuts form the characteristic diamond/X visual of the Makeability Lab grid.
     * The parity of each cell is determined by its logical row/col index (not its
     * pixel position), so the pattern stays consistent regardless of the offset.
     *
     * @param {number} gridWidth    - Canvas width in logical pixels.
     * @param {number} gridHeight   - Canvas height in logical pixels.
     * @param {number} triangleSize - Cell size in pixels.
     * @param {string} strokeColor  - Stroke color for all cells.
     * @param {string|null} fillColor - Fill color for all cells, or null.
     * @param {number} [offsetX=0]  - X origin offset in pixels.
     * @param {number} [offsetY=0]  - Y origin offset in pixels.
     * @returns {Array<Array<Cell>>} 2D array of Cell objects.
     */
    static createGrid(gridWidth: number, gridHeight: number, triangleSize: number, strokeColor: string, fillColor: string | null, offsetX?: number, offsetY?: number): Array<Array<Cell>>;
    /**
     * Creates a background grid of triangular cells covering a canvas area.
     *
     * By default the grid starts at (0, 0), which is fine when the logo also
     * starts at (0, 0). However, when the logo is centered or offset — for
     * example after calling fitToCanvas(), or when manually centering via
     * getGridXCenterPosition() / getGridYCenterPosition() — the grid origin
     * must match the logo's origin so cell boundaries stay aligned.
     *
     * Pass the logo's x and y as offsetX / offsetY to achieve this:
     *
     * @example
     * // Manually positioned logo
     * const xLogo = MakeabilityLabLogo.getGridXCenterPosition(triangleSize, canvasWidth);
     * const yLogo = MakeabilityLabLogo.getGridYCenterPosition(triangleSize, canvasHeight);
     * const logo  = new MakeabilityLabLogo(xLogo, yLogo, triangleSize);
     * const grid  = new Grid(canvasWidth, canvasHeight, triangleSize,
     *                        undefined, undefined, xLogo, yLogo);
     *
     * @example
     * // fitToCanvas — logo origin is set internally, read it back afterward
     * const logo = new MakeabilityLabLogo(0, 0, triangleSize);
     * logo.fitToCanvas(canvasWidth, canvasHeight);
     * const grid = new Grid(canvasWidth, canvasHeight, logo.cellSize,
     *                       undefined, undefined, logo.x, logo.y);
     *
     * @constructor
     * @param {number} gridWidth   - Canvas width in logical (CSS) pixels.
     * @param {number} gridHeight  - Canvas height in logical (CSS) pixels.
     * @param {number} triangleSize - Cell size in pixels; should match the logo's
     *   cellSize so grid lines fall on logo cell boundaries.
     * @param {string} [strokeColor='rgba(200, 200, 200, 0.5)'] - Grid line color.
     * @param {string|null} [fillColor=null] - Optional fill color for all cells.
     * @param {number} [offsetX=0] - X origin of the grid. Pass the logo's x so the
     *   grid is phase-aligned with the logo's cell columns.
     * @param {number} [offsetY=0] - Y origin of the grid. Pass the logo's y so the
     *   grid is phase-aligned with the logo's cell rows.
     */
    constructor(gridWidth: number, gridHeight: number, triangleSize: number, strokeColor?: string, fillColor?: string | null, offsetX?: number, offsetY?: number);
    gridArray: Cell[][];
    visible: boolean;
    /**
     * Draws the grid onto the provided canvas context.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Sets the stroke color for all triangles in the grid.
     *
     * @param {string} strokeColor - The new stroke color.
     */
    setStrokeColor(strokeColor: string): void;
    /**
     * Sets the fill color for all triangles in the grid.
     *
     * @param {string|null} fillColor - The new fill color, or null for transparent.
     */
    setFillColor(fillColor: string | null): void;
}
declare namespace OriginalColorPaletteRGB {
    let Blue: string;
    let BlueGray: string;
    let Purple: string;
    let Green: string;
    let Orange: string;
    let RedPurple: string;
    let Pink: string;
    let YellowGreen: string;
    let LightGreen: string;
    let BlueGreen: string;
}
declare const ORIGINAL_COLOR_ARRAY: string[];
/**
 * Class representing a colorer for the Makeability Lab logo.
 */
declare class MakeabilityLabLogoColorer {
    /**
     * Gets a random color from the original color palette.
     * @returns {string} A random color in RGB format from the original color palette.
     */
    static getRandomOriginalColor(): string;
    /**
     * Gets a random color from the specified color palette.
     * If no palette is provided, it defaults to the original color palette.
     * @param {Object} [palette] - An optional color palette object where keys are color names and values are RGB strings.
     * @returns {string} A random color in RGB format from the specified or default color palette.
     */
    static getRandomColorFromPalette(palette?: any): string;
}

/**
 * Animates a morph from a start arrangement of triangles into the assembled
 * Makeability Lab logo.
 *
 * The start state can be set in two ways:
 *
 *   reset(canvasWidth, canvasHeight)
 *     Scatters the logo's own triangles randomly across the canvas. Triangle
 *     count matches the logo exactly. Good for the default "explode and
 *     reassemble" effect.
 *
 *   resetFromArt(art, canvasWidth, canvasHeight)
 *     Uses a TriangleArt instance as the start state. Every visible triangle
 *     in the artwork is shown and individually morphs toward the logo, so
 *     artwork of any size is displayed in full. Logo triangles are assigned
 *     as destinations and recycled round-robin when the art has more.
 *
 * In both cases the animation is driven identically:
 *
 *   morpher.update(lerpAmt);  // 0 = start state, 1 = assembled logo
 *   morpher.draw(ctx);
 *
 * @example
 *   // Random explosion
 *   const morpher = new MakeabilityLabLogoMorpher(x, y, triangleSize);
 *   morpher.reset(canvasWidth, canvasHeight);
 *   morpher.update(0);
 *
 * @example
 *   // Holiday art morph
 *   const art = await TriangleArt.fromURL('santa.json', artX, artY, size);
 *   morpher.resetFromArt(art, canvasWidth, canvasHeight);
 *   morpher.update(0);
 */
declare class MakeabilityLabLogoMorpher {
    /**
     * @param {number} x              - X position of the assembled logo.
     * @param {number} y              - Y position of the assembled logo.
     * @param {number} triangleSize   - Cell size for the logo triangles.
     * @param {string} [startFillColor='rgb(255,255,255,0.5)']
     *   Fill color used in random mode, and the fallback fill for any art-mode
     *   triangle whose direction has no matching logo triangle.
     * @param {string} [startStrokeColor='rgba(0,0,0,0.6)']
     *   Stroke color counterpart to startFillColor.
     */
    constructor(x: number, y: number, triangleSize: number, startFillColor?: string, startStrokeColor?: string);
    /**
     * The assembled "target" logo — never drawn directly (visible=false),
     * but its triangles define the end state for every morph.
     * @type {MakeabilityLabLogo}
     */
    makeLabLogo: MakeabilityLabLogo$1;
    /**
     * A second logo instance used solely for the L-outline overlay and label
     * animations. Its triangles are NOT drawn — we draw _animTris instead.
     * Keeping it as a full logo object gives us free access to drawLOutline()
     * and drawLabel() with their built-in opacity/position tracking.
     * @type {MakeabilityLabLogo}
     */
    makeLabLogoAnimated: MakeabilityLabLogo$1;
    /**
     * The active set of Triangle objects rendered each frame.
     * Populated by reset() or resetFromArt(). Each triangle carries:
     *   ._start  — snapshot of start-state properties
     *   ._dest   — snapshot of end-state (logo) properties
     * update() lerps between them; draw() renders them directly.
     * @type {Triangle[]}
     */
    _animTris: Triangle$1[];
    /**
     * Message string from the active TriangleArt (e.g. "Happy Holidays!").
     * Drawn fading out as lerpAmt increases. Null when in random mode.
     * @type {string|null}
     */
    _artMessage: string | null;
    /** @type {boolean} Whether to display the art message. */
    _artMessageVisible: boolean;
    /** @type {string|null} */
    _artMessageColor: string | null;
    /** @type {number|null} Font size used to draw the art message. */
    _artMessageFontSize: number | null;
    explodeX: boolean;
    explodeY: boolean;
    explodeSize: boolean;
    explodeAngle: boolean;
    explodeFillColor: boolean;
    explodeStrokeColor: boolean;
    explodeStrokeWidth: boolean;
    /** Fill color for random-mode start state / art-mode fallback. @type {string} */
    startFillColor: string;
    /** Stroke color for random-mode start state / art-mode fallback. @type {string} */
    startStrokeColor: string;
    /**
     * Applied to spatial properties (x, y, size, angle). Colors always
     * interpolate linearly regardless of this setting.
     * @type {function(number): number}
     */
    easingFunction: (arg0: number) => number;
    /**
     * The trajectory each triangle follows from its scattered start to its
     * logo destination. Defaults to a straight line (original behaviour).
     * Set to any path from morph-paths.js (e.g. arcPath(), spiralPath()) and
     * then call reset()/resetFromArt() so the new path can prepare per-triangle
     * data.
     * @type {import('./morph-paths.js').MorphPath}
     */
    pathFunction: MorphPath;
    /**
     * Per-piece arrival stagger in [0, 1). 0 = every triangle animates in
     * lockstep (original behaviour). Higher values spread out arrival times so
     * the logo assembles from the inside out — triangles nearer the logo centre
     * start (and finish) sooner. Clamped to 0.95 to keep the window non-zero.
     * @type {number}
     */
    stagger: number;
    /**
     * Fraction of overall progress at which the L outline begins fading in.
     * E.g. 0.85 → outline appears at 85% of the morph.
     * @type {number}
     */
    lOutlineAppearThreshold: number;
    /**
     * Fraction of overall progress at which the label begins fading in.
     * @type {number}
     */
    labelAppearThreshold: number;
    /**
     * Vertical slide distance during the label entrance, as a fraction of
     * the label font size. Label slides upward as it fades in.
     * @type {number}
     */
    labelSlideDistanceFraction: number;
    _currentLerpAmt: number;
    /** Final assembled width of the logo.                    @returns {number} */
    get finalWidth(): number;
    /** Final assembled height of the logo (includes label). @returns {number} */
    get finalHeight(): number;
    set artMessageVisible(visible: boolean);
    /** Whether the art message (e.g. "Happy Valentine's Day") is shown. */
    get artMessageVisible(): boolean;
    /** @param {number} w @param {number} h @param {boolean} [alignToGrid=false] */
    fitToCanvas(w: number, h: number, alignToGrid?: boolean): void;
    /** @param {number} logoWidth */
    setLogoSize(logoWidth: number): void;
    /** Sets logo size on the end-state logo only. @param {number} finalWidth */
    setLogoSizeEndState(finalWidth: number): void;
    /** @param {number} x */
    setXPosition(x: number): void;
    /** @param {number} y */
    setYPosition(y: number): void;
    /** @param {number} x @param {number} y */
    setLogoPosition(x: number, y: number): void;
    /** @param {number} w @param {number} h @param {boolean} [alignedToGrid=false] */
    centerLogo(w: number, h: number, alignedToGrid?: boolean): void;
    /**
     * RANDOM MODE — scatters the logo's triangles randomly across the canvas.
     *
     * _animTris is populated from makeLabLogoAnimated's own triangles, so the
     * count always equals the logo triangle count. The explode* flags control
     * which properties are randomized vs. kept at their logo values.
     *
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     */
    reset(canvasWidth: number, canvasHeight: number): void;
    /**
     * ART MODE — uses a TriangleArt instance as the start state.
     *
     * Every visible art triangle gets an animated clone and a destination logo
     * triangle of the same direction (recycled round-robin). This means artwork
     * of any size is shown in full — even if it has far more triangles than the
     * logo. Art triangles whose direction is absent from the logo are sent to a
     * random position within the logo's bounding box so they still "join" the
     * logo visually rather than flying off to a corner.
     *
     * The explode* flags are intentionally ignored — art colors and positions
     * are always used exactly as defined in the JSON.
     *
     * If the new art has the same triangle count as the current _animTris pool,
     * the existing Triangle objects are reused in-place to reduce GC pressure.
     *
     * @param {TriangleArt} art
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     */
    resetFromArt(art: TriangleArt, canvasWidth: number, canvasHeight: number): void;
    /**
     * Prepares per-triangle trajectory and stagger data after start/end states
     * are assigned. Computes the logo centroid, gives each triangle a normalized
     * stagger delay based on how far its destination sits from that centroid
     * (centre pieces arrive first), and lets the active pathFunction stash any
     * per-triangle data it needs. Called automatically by reset()/resetFromArt().
     *
     * @param {number} canvasWidth
     * @param {number} canvasHeight
     * @private
     */
    private _preparePaths;
    _canvasWidth: number;
    _canvasHeight: number;
    /**
     * Swaps the active trajectory and re-prepares per-triangle path data in place,
     * keeping the current scattered start positions (does not re-randomize). Use
     * when changing path style or its parameters mid-morph. If no start state
     * exists yet, just stores the path for the next reset()/resetFromArt().
     *
     * @param {import('./morph-paths.js').MorphPath} path
     */
    setPath(path: MorphPath): void;
    /**
     * Computes a single triangle's raw (pre-easing) progress in [0, 1] for the
     * given global lerpAmt, applying the stagger window. With stagger 0 this is
     * just lerpAmt, so behaviour is unchanged.
     *
     * @param {Triangle} tri
     * @param {number} lerpAmt
     * @returns {number}
     * @private
     */
    private _pieceProgress;
    /**
     * Interpolates all animated triangles from their start state toward the logo.
     *
     * Spatial properties (x, y, size, angle) use the configured easingFunction.
     * Visual properties (colors, strokeWidth) always use linear interpolation
     * for perceptually smooth color transitions.
     *
     * Also drives the L-outline opacity on makeLabLogoAnimated, which draw()
     * uses for the overlay effect regardless of mode.
     *
     * @param {number} lerpAmt - Progress in [0, 1]: 0 = start state, 1 = logo.
     */
    update(lerpAmt: number): void;
    /**
     * Draws the current animation frame.
     *
     * Rendering order:
     *   1. Static target logo (invisible by default; set makeLabLogo.visible=true
     *      to show it as a debug overlay)
     *   2. _animTris — the animated triangle pool (suppressed at lerpAmt >= 1;
     *      the assembled logo renders via makeLabLogo instead)
     *   3. Assembled logo at lerpAmt >= 1 (clean final state, no overdraw)
     *   4. L-outline overlay (fades in near end of morph)
     *   5. Art message (fades out during morph; art mode only)
     *   6. Label (fades in near end of morph)
     *
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Draws the art message centered above the artwork, fading out as the
     * morph progresses. Opacity goes from 1 at lerpAmt=0 to 0 at lerpAmt=0.5,
     * so it disappears well before the logo label appears.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} lerpAmt
     * @private
     */
    private _drawArtMessage;
    /**
     * Draws the "Makeability Lab" label with a fade-in and upward slide entrance.
     * Only active once lerpAmt exceeds labelAppearThreshold.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} lerpAmt
     * @private
     */
    private _drawAnimatedLabel;
}

/**
 * A "grid fade" intro animation: a full-canvas grid of triangles fades in at
 * staggered times, then the Makeability Lab logo fades in over the top.
 *
 * @example
 * import { MakeabilityLabLogo } from './makelab-logo.js';
 * import { MakeabilityLabLogoGridFade } from './makelab-logo-gridfade.js';
 *
 * const logo = new MakeabilityLabLogo(5 * 50, 4 * 50, 50);
 * logo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
 * const anim = new MakeabilityLabLogoGridFade(logo, canvas.width, canvas.height);
 *
 * const start = performance.now();
 * function frame(now) {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   anim.update(now - start);
 *   anim.draw(ctx);
 *   requestAnimationFrame(frame);
 * }
 * requestAnimationFrame(frame);
 */
declare class MakeabilityLabLogoGridFade {
    /**
     * @param {MakeabilityLabLogo} makeLabLogo - The logo to reveal. The caller is
     *   responsible for configuring its colors/position before passing it in.
     * @param {number} canvasWidth - Width of the canvas to fill with the grid (CSS pixels).
     * @param {number} canvasHeight - Height of the canvas to fill with the grid (CSS pixels).
     * @param {Object} [options] - Animation options.
     * @param {number} [options.fadeInDurationMs=1500] - How long each grid triangle
     *   takes to fade from its start color to its end color.
     * @param {number} [options.maxStaggerMs=2000] - Maximum random start delay per
     *   triangle. Each triangle begins fading at a random time in [0, maxStaggerMs).
     * @param {string} [options.startColor='rgb(255, 255, 255)'] - The color every
     *   grid triangle starts at before fading.
     * @param {function(): string} [options.getEndColor] - Returns the target color
     *   for a grid triangle. Defaults to a random color from the ML palette.
     * @param {function(number): number} [options.easingFunction=easeOutCubic] -
     *   Easing applied to each triangle's fade progress (t in [0, 1] → [0, 1]).
     * @param {number} [options.logoRevealStartMs=3000] - Elapsed time at which the
     *   logo begins fading in.
     * @param {number} [options.logoRevealDurationMs=1000] - How long the logo takes
     *   to fade from fully transparent to fully opaque.
     * @param {boolean} [options.matchLogo=true] - If true, every grid cell beneath
     *   the logo is reoriented to match its logo cell (so all triangles — M, L,
     *   shadow, and colored — line up), and the cells under the 12 default-colored
     *   triangles fade in to exactly the logo's colors. This makes the grid a
     *   seamless lead-in to the logo reveal.
     */
    constructor(makeLabLogo: MakeabilityLabLogo, canvasWidth: number, canvasHeight: number, options?: {
        fadeInDurationMs?: number;
        maxStaggerMs?: number;
        startColor?: string;
        getEndColor?: () => string;
        easingFunction?: (arg0: number) => number;
        logoRevealStartMs?: number;
        logoRevealDurationMs?: number;
        matchLogo?: boolean;
    });
    makeLabLogo: MakeabilityLabLogo;
    fadeInDurationMs: number;
    maxStaggerMs: number;
    startColor: string;
    getEndColor: () => string;
    easingFunction: typeof easeOutCubic;
    logoRevealStartMs: number;
    logoRevealDurationMs: number;
    matchLogo: boolean;
    /**
     * Background grid that fills the canvas. Aligned to the logo's origin so its
     * cells line up with the logo's cells.
     * @type {Grid}
     */
    grid: Grid;
    /**
     * Current logo opacity in [0, 1], updated each frame by {@link update}.
     * @type {number}
     */
    logoOpacity: number;
    /**
     * Per-triangle animation state, kept separate from the Triangle objects so
     * the library's data model stays clean.
     * @private
     * @type {{tri: Triangle, startColor: string, endColor: string, delayMs: number, done: boolean}[]}
     */
    private _animTris;
    /**
     * Assigns each grid triangle a start color, a random end color, and a random
     * start delay, and resets it to the start color.
     * @private
     */
    private _initGridAnimation;
    /**
     * Aligns the grid to the logo so the reveal is seamless:
     *   1. Every grid cell beneath the logo is reoriented to match its logo cell,
     *      so all triangles (M, L, shadow, and colored) point the same way.
     *   2. The grid triangles beneath the logo's 12 default-colored triangles are
     *      pinned to fade in to those exact colors.
     *
     * The grid shares the logo's origin and cell size, so each logo triangle has a
     * grid cell at the same position. A logo cell's two triangles always lie on the
     * same diagonal (opposite directions), so matching one triangle's direction
     * orients the whole cell.
     *
     * @private
     * @param {Map<Triangle, Object>} entryByTri - Lookup from grid triangle to its
     *   animation entry (so we can override the fade target color).
     */
    private _matchGridToLogo;
    /**
     * Advances the animation to the given elapsed time. Computes each grid
     * triangle's current fill color and the logo's current opacity. Call once per
     * frame before {@link draw}.
     *
     * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
     */
    update(elapsedMs: number): void;
    /**
     * Draws the grid, then the logo (faded to its current opacity), to the canvas.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Restarts the animation from the beginning (re-randomizes colors and delays).
     * Call this, then reset your elapsed-time clock to 0.
     */
    reset(): void;
}

/**
 * A "falling leaf" intro animation: a full-canvas grid of triangles flutters
 * down from the top and settles into place, then the Makeability Lab logo's
 * pieces (triangles and individual outline segments) fall in to compose the
 * logo on top.
 *
 * @example
 * import { MakeabilityLabLogo } from './makelab-logo.js';
 * import { MakeabilityLabLogoLeafFall } from './makelab-logo-leaffall.js';
 *
 * const logo = new MakeabilityLabLogo(logoX, logoY, 50);
 * const anim = new MakeabilityLabLogoLeafFall(logo, canvas.width, canvas.height);
 *
 * const start = performance.now();
 * function frame(now) {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   anim.update(now - start);
 *   anim.draw(ctx);
 *   requestAnimationFrame(frame);
 * }
 * requestAnimationFrame(frame);
 */
declare class MakeabilityLabLogoLeafFall {
    /**
     * @param {MakeabilityLabLogo} makeLabLogo - The logo to reveal. The caller is
     *   responsible for configuring its colors/position before passing it in.
     * @param {number} canvasWidth - Width of the canvas to fill (CSS pixels).
     * @param {number} canvasHeight - Height of the canvas to fill (CSS pixels).
     * @param {Object} [options] - Animation options.
     * @param {number} [options.totalDurationMs=6000] - Approximate total length of
     *   the animation. Logo pieces start falling at logoRevealStartFraction of this.
     * @param {number} [options.gridStaggerMs=2500] - Grid triangles begin falling
     *   at a random time in [0, gridStaggerMs).
     * @param {number} [options.logoRevealStartFraction=0.2] - Fraction of
     *   totalDurationMs after which the logo's own pieces begin falling.
     * @param {number} [options.logoStaggerMs=1600] - The logo's own pieces begin
     *   falling within a window of this length (starting at logoRevealStartFraction
     *   of totalDurationMs). Kept short so the logo gathers in a burst rather than
     *   trickling in across the whole animation.
     * @param {number} [options.minFallMs=1400] - Shortest per-piece fall duration
     *   (for pieces that have the least distance to fall).
     * @param {number} [options.maxFallMs=2800] - Longest per-piece fall duration
     *   (for pieces that fall the full height of the canvas).
     * @param {number} [options.swayAmplitude=55] - Max horizontal sway, in pixels,
     *   of a leaf as it drifts down (decays to 0 on landing).
     * @param {number} [options.maxRotationDeg=140] - Max tumble rotation, in
     *   degrees, of a leaf as it falls (decays to 0 on landing).
     * @param {number} [options.groundStaggerMs=700] - For {@link dropLeaves}: the
     *   window over which background leaves begin falling to the ground.
     * @param {number} [options.groundFallMinMs=700] - For {@link dropLeaves}:
     *   shortest ground-fall duration (for leaves nearest the bottom).
     * @param {number} [options.groundFallMaxMs=1700] - For {@link dropLeaves}:
     *   longest ground-fall duration (for leaves falling the full height).
     * @param {number} [options.groundPileSpread=70] - For {@link dropLeaves}: how
     *   many pixels of random vertical spread the settled pile has at the bottom.
     * @param {boolean} [options.fadeLeavesOnDrop=true] - For {@link dropLeaves}:
     *   if true, leaves gradually fade toward leafPileOpacity as they fall, so the
     *   settled pile at the bottom is slightly translucent. Set false to keep the
     *   leaves fully opaque. Can also be toggled at runtime via the property.
     * @param {number} [options.leafPileOpacity=0.75] - For {@link dropLeaves}: the
     *   opacity (0–1) leaves reach once fully settled in the pile, when
     *   fadeLeavesOnDrop is true. Default 0.75 (~25% translucent — still largely
     *   opaque).
     * @param {boolean} [options.startAssembled=false] - If true, the grid and logo
     *   are fully assembled from the very first frame (the fall-in intro is
     *   skipped), so nothing animates until you call {@link dropLeaves}. Useful for
     *   showing a finished logo and then dropping the leaves on demand.
     * @param {function(number): number} [options.easingFunction=easeOutCubic] -
     *   Easing for each piece's vertical descent (t in [0,1] → [0,1]).
     * @param {function(): string} [options.getGridColor] - Returns the fill/stroke
     *   color for each background grid triangle. Defaults to a random ML color.
     */
    constructor(makeLabLogo: MakeabilityLabLogo, canvasWidth: number, canvasHeight: number, options?: {
        totalDurationMs?: number;
        gridStaggerMs?: number;
        logoRevealStartFraction?: number;
        logoStaggerMs?: number;
        minFallMs?: number;
        maxFallMs?: number;
        swayAmplitude?: number;
        maxRotationDeg?: number;
        groundStaggerMs?: number;
        groundFallMinMs?: number;
        groundFallMaxMs?: number;
        groundPileSpread?: number;
        fadeLeavesOnDrop?: boolean;
        leafPileOpacity?: number;
        startAssembled?: boolean;
        easingFunction?: (arg0: number) => number;
        getGridColor?: () => string;
    });
    makeLabLogo: MakeabilityLabLogo;
    canvasWidth: number;
    canvasHeight: number;
    totalDurationMs: number;
    gridStaggerMs: number;
    logoRevealStartFraction: number;
    logoStaggerMs: number;
    minFallMs: number;
    maxFallMs: number;
    swayAmplitude: number;
    maxRotationDeg: number;
    groundStaggerMs: number;
    groundFallMinMs: number;
    groundFallMaxMs: number;
    groundPileSpread: number;
    fadeLeavesOnDrop: boolean;
    leafPileOpacity: number;
    startAssembled: boolean;
    easingFunction: typeof easeOutCubic;
    getGridColor: () => string;
    /**
     * Background grid that fills the canvas, aligned to the logo. Exposed so
     * hosts can toggle visibility (e.g. a debug key).
     * @type {Grid}
     */
    grid: Grid;
    /** @private Flat list of animated pieces (grid, then logo, then outline). */
    private _pieces;
    /**
     * Builds the grid, the animated piece pools, and assigns each piece a fall
     * delay, duration, start offset, and randomized sway/tumble parameters.
     * @private
     */
    private _init;
    _dropping: boolean;
    _dropStartMs: number;
    /**
     * Wraps a base piece with leaf-fall animation state and adds it to the pool.
     * @private
     */
    private _addPiece;
    /**
     * Advances the animation to the given elapsed time, computing each piece's
     * current offset and rotation. Call once per frame before {@link draw}.
     *
     * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
     */
    update(elapsedMs: number): void;
    /**
     * Triggers the "leaf drop": every background grid triangle falls to the bottom
     * of the screen and settles into a pile, while the logo stays fixed in place
     * (its colored triangles, black M-shadow, translucent L, and outlines do not
     * move). Idempotent — calling it again while a drop is in progress is a no-op.
     * {@link reset} clears the drop.
     */
    dropLeaves(): void;
    /**
     * Assigns each background grid piece a ground target and randomized fall
     * parameters. Called once, the first update() after dropLeaves().
     * @private
     */
    private _initDrop;
    /**
     * Draws the started pieces in layered order: grid, then logo triangles, then
     * outline segments (on top). Respects grid.visible and makeLabLogo.visible.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Restarts the animation from the beginning (re-randomizes colors, delays, and
     * sway/tumble). Call this, then reset your elapsed-time clock to 0.
     */
    reset(): void;
}

/**
 * A "z-axis zoom" intro animation: triangles fly in toward the viewer from a
 * shared perspective origin (the screen center by default). Each piece starts
 * large and offset out beyond its final position — as if close to the viewer,
 * in front of the screen — then sweeps inward and shrinks to land on the screen
 * plane. Because every piece scales about the *same* point, pieces destined for
 * the edges rush in from off-screen while central pieces barely move, producing
 * the parallax that reads as real 3D depth. The grid flies in first, then the
 * Makeability Lab logo's pieces (triangles and individual outline segments) land
 * to compose the logo on top.
 *
 * @example
 * import { MakeabilityLabLogo } from './makelab-logo.js';
 * import { MakeabilityLabLogoZoomFade } from './makelab-logo-zoomfade.js';
 *
 * const logo = new MakeabilityLabLogo(logoX, logoY, 50);
 * const anim = new MakeabilityLabLogoZoomFade(logo, canvas.width, canvas.height);
 *
 * const start = performance.now();
 * function frame(now) {
 *   ctx.clearRect(0, 0, canvas.width, canvas.height);
 *   anim.update(now - start);
 *   anim.draw(ctx);
 *   requestAnimationFrame(frame);
 * }
 * requestAnimationFrame(frame);
 */
declare class MakeabilityLabLogoZoomFade {
    /**
     * @param {MakeabilityLabLogo} makeLabLogo - The logo to reveal. The caller is
     *   responsible for configuring its colors/position before passing it in.
     * @param {number} canvasWidth - Width of the canvas to fill (CSS pixels).
     * @param {number} canvasHeight - Height of the canvas to fill (CSS pixels).
     * @param {Object} [options] - Animation options.
     * @param {number} [options.totalDurationMs=5000] - Approximate total length of
     *   the animation. Logo pieces start zooming at logoRevealStartFraction of this.
     * @param {number} [options.gridStaggerMs=2500] - Grid triangles begin zooming
     *   at a random time in [0, gridStaggerMs).
     * @param {number} [options.logoRevealStartFraction=0.2] - Fraction of
     *   totalDurationMs after which the logo's own pieces begin zooming in.
     * @param {number} [options.logoStaggerMs=1400] - The logo's own pieces begin
     *   zooming within a window of this length (starting at logoRevealStartFraction
     *   of totalDurationMs). Kept short so the logo gathers in a burst rather than
     *   trickling in across the whole animation.
     * @param {number} [options.pieceDurationMs=1100] - How long each piece takes to
     *   fly in from its start scale to its resting size.
     * @param {number} [options.startScale=6] - Base initial scale of each piece
     *   (>1 = overscaled / "in front of" the screen). Since pieces scale about the
     *   shared perspective origin, this also controls how far out they start: a
     *   piece begins at origin + startScale × (restPosition − origin). Settles to 1.
     * @param {number} [options.depthVariance=0.45] - Per-piece random fraction
     *   applied to startScale, so pieces arrive from a range of depths (start scale
     *   ∈ startScale × [1 − depthVariance, 1 + depthVariance]) rather than one flat
     *   plane. 0 disables the variation.
     * @param {number} [options.startOpacity=0.25] - Opacity of a piece at the
     *   instant it starts flying in (it ramps to 1 as it lands). Keeping it above 0
     *   lets you see pieces travel rather than just materialize in place.
     * @param {number} [options.perspectiveX=canvasWidth/2] - X of the shared
     *   perspective origin (vanishing point) all pieces fly in toward.
     * @param {number} [options.perspectiveY=canvasHeight/2] - Y of the shared
     *   perspective origin.
     * @param {function(number): number} [options.easingFunction=easeOutCubic] -
     *   Easing for each piece's fly-in + fade (t in [0,1] → [0,1]).
     * @param {function(): string} [options.getGridColor] - Returns the fill/stroke
     *   color for each background grid triangle. Defaults to a random ML color.
     */
    constructor(makeLabLogo: MakeabilityLabLogo, canvasWidth: number, canvasHeight: number, options?: {
        totalDurationMs?: number;
        gridStaggerMs?: number;
        logoRevealStartFraction?: number;
        logoStaggerMs?: number;
        pieceDurationMs?: number;
        startScale?: number;
        depthVariance?: number;
        startOpacity?: number;
        perspectiveX?: number;
        perspectiveY?: number;
        easingFunction?: (arg0: number) => number;
        getGridColor?: () => string;
    });
    makeLabLogo: MakeabilityLabLogo;
    canvasWidth: number;
    canvasHeight: number;
    totalDurationMs: number;
    gridStaggerMs: number;
    logoRevealStartFraction: number;
    logoStaggerMs: number;
    pieceDurationMs: number;
    startScale: number;
    depthVariance: number;
    startOpacity: number;
    perspectiveX: number;
    perspectiveY: number;
    easingFunction: typeof easeOutCubic;
    getGridColor: () => string;
    /**
     * Background grid that fills the canvas, aligned to the logo. Exposed so
     * hosts can toggle visibility (e.g. a debug key).
     * @type {Grid}
     */
    grid: Grid;
    /** @private Flat list of animated pieces (grid, then logo, then outline). */
    private _pieces;
    /**
     * Builds the grid, the animated piece pools, and assigns each piece a zoom
     * delay.
     * @private
     */
    private _init;
    /**
     * Wraps a base piece with zoom-fade animation state and adds it to the pool.
     * @private
     */
    private _addPiece;
    /**
     * Advances the animation to the given elapsed time, computing each piece's
     * current scale and opacity. Call once per frame before {@link draw}.
     *
     * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
     */
    update(elapsedMs: number): void;
    /**
     * Draws the started pieces in layered order: grid, then logo triangles, then
     * outline segments (on top). Respects grid.visible and makeLabLogo.visible.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Restarts the animation from the beginning (re-randomizes colors and delays).
     * Call this, then reset your elapsed-time clock to 0.
     */
    reset(): void;
}

declare class TriangleArt$1 {
    /**
     * Returns numCols from a data definition without constructing a TriangleArt.
     * @param {Object} data - Parsed JSON data object.
     * @returns {number}
     */
    static numCols(data: any): number;
    /**
     * Returns numRows from a data definition without constructing a TriangleArt.
     * @param {Object} data - Parsed JSON data object.
     * @returns {number}
     */
    static numRows(data: any): number;
    /**
     * Fetches a JSON file and constructs a TriangleArt instance.
     *
     * @param {string} url - Path to the JSON file.
     * @param {number} x - Top-left x.
     * @param {number} y - Top-left y.
     * @param {number} triangleSize - Cell size in pixels.
     * @returns {Promise<TriangleArt>}
     *
     * @example
     * const santa = await TriangleArt.fromURL('santa.json', 100, 50, 40);
     */
    static fromURL(url: string, x: number, y: number, triangleSize: number): Promise<TriangleArt$1>;
    /**
     * Fetches and parses a JSON file, returning just the data object.
     * Useful when you need dimensions before constructing (e.g. for centering).
     *
     * @param {string} url - Path to the JSON file.
     * @returns {Promise<Object>}
     */
    static loadData(url: string): Promise<any>;
    /**
     * Builds the full Cell[][] grid from a parsed data object.
     *
     * @param {number} startX
     * @param {number} startY
     * @param {number} size - Cell size in pixels.
     * @param {Object} data - The parsed JSON data.
     * @returns {Cell[][]}
     * @private
     */
    private static _buildGrid;
    /**
     * Constructs a single Cell from a cell definition.
     *
     * Cell definition forms:
     *   null            → empty cell (both tris hidden)
     *   "R"             → both tris get palette key "R"
     *   ["W", "R"]      → tri1 = W, tri2 = R; null in either position = hidden
     *   { t1, t2, dir, t1Visible, t2Visible } → full control
     *
     * @private
     */
    /**
     * Constructs a single Cell from a cell definition.
     *
     * Cell definition forms:
     * null            → empty cell (both tris hidden)
     * "R"             → both tris get palette key "R"
     * ["W", "R"]      → tri1 = W, tri2 = R
     * { tHalf, dir }  → Sugar: colors the primary triangle of the dir and hides the other
     * { t1, t2, dir } → Full control
     *
     * @private
     */
    private static _buildCell;
    /**
     * Computes the default tri1 direction for a cell based on the pattern rule.
     *
     * @param {number} row
     * @param {number} col
     * @param {string} pattern - e.g. "alternating"
     * @returns {string} A TriangleDir value.
     * @private
     */
    private static _getDefaultDirection;
    /**
     * Applies palette color (with jitter) and visibility to a triangle.
     *
     * @param {Triangle} tri - The Triangle instance to modify.
     * @param {string|null} colorKey - Palette key, raw hex, or null (hidden).
     * @param {boolean} [visibleOverride] - Explicit visibility override.
     * @param {Object} palette - The palette definitions from the JSON.
     * @private
     */
    private static _applyTriProps;
    /**
     * Resolves a palette key to an actual CSS color string, applying jitter.
     *
     * If the key matches a palette entry with jitter, the color is randomized.
     * If the key is a raw hex/CSS color (not in palette), it's returned as-is.
     *
     * @param {string} key - Palette key or raw color string.
     * @param {Object} palette - Palette definitions.
     * @returns {string} A CSS color string.
     * @private
     */
    private static _resolveColor;
    /**
     * Applies jitter to a base color according to jitter parameters.
     *
     * Supports:
     *   - type: "brightness" with uniform range or gaussian
     *   - type: "saturation+brightness"
     *
     * @param {string} base - Base hex color.
     * @param {Object} jitter - Jitter definition from palette entry.
     * @returns {string} CSS rgba() color string.
     * @private
     */
    private static _applyJitter;
    /**
     * Samples a value from a jitter spec (uniform range or gaussian).
     *
     * For uniform: uses jitter.range = [min, max]
     * For gaussian: uses jitter.mean and jitter.sd
     *
     * @param {Object} jitter
     * @returns {number}
     * @private
     */
    private static _sampleValue;
    /**
     * Samples the brightness component from a compound (saturation+brightness) jitter.
     * Looks for brightnessDistribution/brightnessMean/brightnessSd for gaussian,
     * or falls back to jitter.brightness[0..1] for uniform.
     *
     * @param {Object} jitter
     * @returns {number}
     * @private
     */
    private static _sampleBrightnessFromCompound;
    /**
     * Picks a default message color: the "base" color of the palette's first
     * entry, or black if the data has no palette.
     *
     * @private
     * @param {Object} data - The raw art JSON (may contain a `palette` object).
     * @returns {string} A CSS color string.
     */
    private static _defaultMessageColor;
    /**
     * Creates a triangle-grid artwork from a parsed JSON definition.
     *
     * @param {number} x - Top-left x of the grid in canvas pixels.
     * @param {number} y - Top-left y of the grid in canvas pixels.
     * @param {number} triangleSize - Pixel size of each square cell.
     * @param {Object} data - Parsed JSON data object (see spec).
     */
    constructor(x: number, y: number, triangleSize: number, data: any);
    /** @type {Object} The raw JSON definition. */
    data: any;
    /** @type {number} */
    triangleSize: number;
    /** @type {Cell[][]} 2D array [row][col] of Cell objects. */
    artArray: Cell[][];
    /** @type {boolean} */
    visible: boolean;
    /** @type {boolean} Whether the message text is drawn over the art. */
    showMessage: boolean;
    /** @type {string} CSS color for the message text. Falls back to palette's first entry base, then black. */
    messageColor: string;
    get x(): number;
    get y(): number;
    get cellSize(): number;
    get numRows(): any;
    get numCols(): any;
    get width(): number;
    get height(): number;
    get name(): any;
    get message(): any;
    /**
     * Returns a flat array of all Triangle objects in the artwork.
     *
     * @param {boolean} [onlyVisible=true] If true, only visible triangles.
     * @returns {Triangle[]}
     */
    getAllTriangles(onlyVisible?: boolean): Triangle$1[];
    setStrokeTransparent(isTransparent: any): void;
    setFillTransparent(isTransparent: any): void;
    setColors(fillColor: any, strokeColor: any): void;
    setStrokeColors(strokeColor: any): void;
    /**
     * Draws the artwork onto the given canvas context.
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx: CanvasRenderingContext2D): void;
    /**
     * Draws the message string centered just above the artwork.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} [alpha=1] - Opacity 0–1, modulates messageColor.
     * @param {number|null} [x=null] - Center x override; defaults to grid center.
     * @param {number|null} [y=null] - Baseline y override; defaults to just above grid.
     */
    drawMessage(ctx: CanvasRenderingContext2D, alpha?: number, x?: number | null, y?: number | null): void;
}

/**
 * Array utility functions.
 *
 * By Jon E. Froehlich and the Makeability Lab
 * https://makeabilitylab.io
 */
/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 *
 * @param {Array} array - The array to shuffle.
 * @returns {Array} The same array, shuffled in place.
 *
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * shuffle(arr); // arr is now shuffled in place
 */
declare function shuffle(array: any[]): any[];

export { Cell, Grid$1 as Grid, LineBreakTransformer, LineSegment, MORPH_PATHS, MakeabilityLabLogo$1 as MakeabilityLabLogo, MakeabilityLabLogoColorer, MakeabilityLabLogoGridFade, MakeabilityLabLogoLeafFall, MakeabilityLabLogoMorpher, MakeabilityLabLogoZoomFade, ORIGINAL_COLOR_ARRAY, OriginalColorPaletteRGB, Serial, SerialEvents, SerialState, Triangle$1 as Triangle, TriangleArt$1 as TriangleArt, TriangleDir, Vector, arcPath, bezierPath, changeColorBrightness, changeColorSaturationAndBrightness, clamp, constrain, convertColorStringToObject, convertToDegrees, convertToRadians, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, easeOutQuad, hexStringToRgb, hsvToRgb, lerp, lerpColor, linearPath, map, parseHexString, random, randomGaussian, rgbToHex, rgbToHsv, shuffle, spiralPath };
