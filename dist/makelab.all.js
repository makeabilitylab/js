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
function lerpColor(startColor, endColor, amt) {
  startColor = convertColorStringToObject(startColor);
  endColor = convertColorStringToObject(endColor);

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const r = clamp(Math.round(lerp(startColor.r, endColor.r, amt)), 0, 255);
  const g = clamp(Math.round(lerp(startColor.g, endColor.g, amt)), 0, 255);
  const b = clamp(Math.round(lerp(startColor.b, endColor.b, amt)), 0, 255);
  
  // Alpha typically ranges from 0.0 to 1.0
  const a = clamp(lerp(startColor.a ?? 1, endColor.a ?? 1, amt), 0, 1);

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts a color string (hex, rgb, or rgba) to an object with r, g, b, and optionally a properties.
 * If the input is already an object, it returns the input as is.
 *
 * @param {string|Object} colorStr - The color string or object to convert.
 * @returns {Object} An object with properties r, g, b, and optionally a.
 * @throws {Error} If the color string format is invalid.
 */
function convertColorStringToObject(colorStr) {
  if (typeof colorStr === 'string') {
    // Handle HTML color names
    if (HTML_COLOR_NAMES[colorStr.toLowerCase()]) {
      return HTML_COLOR_NAMES[colorStr.toLowerCase()];
    }

    // Handle hexstring, rgb, or rgba string
    const match = colorStr.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})$/);
    if (match) {
      // Hexstring
      const hex = match[1];
      if (hex.length === 8) {
        // 8-digit hex string with alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: parseInt(hex.substring(6, 8), 16) / 255
        };
      } else {
        // 6-digit hex string without alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: 1 // Default to 1 if alpha is not specified
        };
      }
    } else if (colorStr.startsWith('rgb')) {
      // Improved regex to support varied spacing and decimal alpha (e.g., .5 or 0.5)
      const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?\)/);
      
      if (match) {
        const [, r, g, b, a] = match;
        
        // BUG FIX: Helper to clamp values between 0-255
        const clamp = (val) => Math.min(255, Math.max(0, parseInt(val)));

        return {
          r: clamp(r),
          g: clamp(g),
          b: clamp(b),
          a: a !== undefined ? parseFloat(a) : 1 
        };
      }
    }
    throw new Error(`Invalid color string: ${colorStr}`);
  }

  // If it's already an object, return it
  return colorStr;
}

// --- HSV/RGB conversion and color manipulation ---
// Adapted from https://stackoverflow.com/a/17243070 and https://stackoverflow.com/a/5624139

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
function hsvToRgb(h, s, v, returnRounded = true) {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  if (returnRounded) {
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

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
function rgbToHsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h;
  const s = max === 0 ? 0 : d / max;
  const v = max / 255;

  switch (max) {
    case min: h = 0; break;
    case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
    case g: h = (b - r) + d * 2; h /= 6 * d; break;
    case b: h = (r - g) + d * 4; h /= 6 * d; break;
  }

  return { h, s, v };
}

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
function changeColorBrightness(color, newBrightnessPercent) {
  const rgb = convertColorStringToObject(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  hsv.v = newBrightnessPercent / 100;
  const newRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  return `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${rgb.a ?? 1})`;
}

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
function changeColorSaturationAndBrightness(color, newSaturationPercent, newBrightnessPercent) {
  const rgb = convertColorStringToObject(color);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  hsv.s = newSaturationPercent / 100;
  hsv.v = newBrightnessPercent / 100;
  const newRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  return `rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${rgb.a ?? 1})`;
}

/**
 * Converts a hex color string to an RGB object.
 *
 * @param {string} hex - Hex color string (e.g., "#cc4133" or "cc4133").
 * @returns {{r: number, g: number, b: number}|null} RGB object or null if invalid.
 */
function hexStringToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

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
function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

const HTML_COLOR_NAMES = {
  aliceblue: { r: 240, g: 248, b: 255, a: 1 },
  antiquewhite: { r: 250, g: 235, b: 215, a: 1 },
  aqua: { r: 0, g: 255, b: 255, a: 1 },
  aquamarine: { r: 127, g: 255, b: 212, a: 1 },
  azure: { r: 240, g: 255, b: 255, a: 1 },
  beige: { r: 245, g: 245, b: 220, a: 1 },
  bisque: { r: 255, g: 228, b: 196, a: 1 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  blanchedalmond: { r: 255, g: 235, b: 205, a: 1 },
  blue: { r: 0, g: 0, b: 255, a: 1 },
  blueviolet: { r: 138, g: 43, b: 226, a: 1 },
  brown: { r: 165, g: 42, b: 42, a: 1 },
  burlywood: { r: 222, g: 184, b: 135, a: 1 },
  cadetblue: { r: 95, g: 158, b: 160, a: 1 },
  chartreuse: { r: 127, g: 255, b: 0, a: 1 },
  chocolate: { r: 210, g: 105, b: 30, a: 1 },
  coral: { r: 255, g: 127, b: 80, a: 1 },
  cornflowerblue: { r: 100, g: 149, b: 237, a: 1 },
  cornsilk: { r: 255, g: 248, b: 220, a: 1 },
  crimson: { r: 220, g: 20, b: 60, a: 1 },
  cyan: { r: 0, g: 255, b: 255, a: 1 },
  darkblue: { r: 0, g: 0, b: 139, a: 1 },
  darkcyan: { r: 0, g: 139, b: 139, a: 1 },
  darkgoldenrod: { r: 184, g: 134, b: 11, a: 1 },
  darkgray: { r: 169, g: 169, b: 169, a: 1 },
  darkgreen: { r: 0, g: 100, b: 0, a: 1 },
  darkkhaki: { r: 189, g: 183, b: 107, a: 1 },
  darkmagenta: { r: 139, g: 0, b: 139, a: 1 },
  darkolivegreen: { r: 85, g: 107, b: 47, a: 1 },
  darkorange: { r: 255, g: 140, b: 0, a: 1 },
  darkorchid: { r: 153, g: 50, b: 204, a: 1 },
  darkred: { r: 139, g: 0, b: 0, a: 1 },
  darksalmon: { r: 233, g: 150, b: 122, a: 1 },
  darkseagreen: { r: 143, g: 188, b: 143, a: 1 },
  darkslateblue: { r: 72, g: 61, b: 139, a: 1 },
  darkslategray: { r: 47, g: 79, b: 79, a: 1 },
  darkturquoise: { r: 0, g: 206, b: 209, a: 1 },
  darkviolet: { r: 148, g: 0, b: 211, a: 1 },
  deeppink: { r: 255, g: 20, b: 147, a: 1 },
  deepskyblue: { r: 0, g: 191, b: 255, a: 1 },
  dimgray: { r: 105, g: 105, b: 105, a: 1 },
  dodgerblue: { r: 30, g: 144, b: 255, a: 1 },
  firebrick: { r: 178, g: 34, b: 34, a: 1 },
  floralwhite: { r: 255, g: 250, b: 240, a: 1 },
  forestgreen: { r: 34, g: 139, b: 34, a: 1 },
  fuchsia: { r: 255, g: 0, b: 255, a: 1 },
  gainsboro: { r: 220, g: 220, b: 220, a: 1 },
  ghostwhite: { r: 248, g: 248, b: 255, a: 1 },
  gold: { r: 255, g: 215, b: 0, a: 1 },
  goldenrod: { r: 218, g: 165, b: 32, a: 1 },
  gray: { r: 128, g: 128, b: 128, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  greenyellow: { r: 173, g: 255, b: 47, a: 1 },
  honeydew: { r: 240, g: 255, b: 240, a: 1 },
  hotpink: { r: 255, g: 105, b: 180, a: 1 },
  indianred: { r: 205, g: 92, b: 92, a: 1 },
  indigo: { r: 75, g: 0, b: 130, a: 1 },
  ivory: { r: 255, g: 255, b: 240, a: 1 },
  khaki: { r: 240, g: 230, b: 140, a: 1 },
  lavender: { r: 230, g: 230, b: 250, a: 1 },
  lavenderblush: { r: 255, g: 240, b: 245, a: 1 },
  lawngreen: { r: 124, g: 252, b: 0, a: 1 },
  lemonchiffon: { r: 255, g: 250, b: 205, a: 1 },
  lightblue: { r: 173, g: 216, b: 230, a: 1 },
  lightcoral: { r: 240, g: 128, b: 128, a: 1 },
  lightcyan: { r: 224, g: 255, b: 255, a: 1 },
  lightgoldenrodyellow: { r: 250, g: 250, b: 210, a: 1 },
  lightgray: { r: 211, g: 211, b: 211, a: 1 },
  lightgreen: { r: 144, g: 238, b: 144, a: 1 },
  lightpink: { r: 255, g: 182, b: 193, a: 1 },
  lightsalmon: { r: 255, g: 160, b: 122, a: 1 },
  lightseagreen: { r: 32, g: 178, b: 170, a: 1 },
  lightskyblue: { r: 135, g: 206, b: 250, a: 1 },
  lightslategray: { r: 119, g: 136, b: 153, a: 1 },
  lightsteelblue: { r: 176, g: 196, b: 222, a: 1 },
  lightyellow: { r: 255, g: 255, b: 224, a: 1 },
  lime: { r: 0, g: 255, b: 0, a: 1 },
  limegreen: { r: 50, g: 205, b: 50, a: 1 },
  linen: { r: 250, g: 240, b: 230, a: 1 },
  magenta: { r: 255, g: 0, b: 255, a: 1 },
  maroon: { r: 128, g: 0, b: 0, a: 1 },
  mediumaquamarine: { r: 102, g: 205, b: 170, a: 1 },
  mediumblue: { r: 0, g: 0, b: 205, a: 1 },
  mediumorchid: { r: 186, g: 85, b: 211, a: 1 },
  mediumpurple: { r: 147, g: 112, b: 219, a: 1 },
  mediumseagreen: { r: 60, g: 179, b: 113, a: 1 },
  mediumslateblue: { r: 123, g: 104, b: 238, a: 1 },
  mediumspringgreen: { r: 0, g: 250, b: 154, a: 1 },
  mediumturquoise: { r: 72, g: 209, b: 204, a: 1 },
  mediumvioletred: { r: 199, g: 21, b: 133, a: 1 },
  midnightblue: { r: 25, g: 25, b: 112, a: 1 },
  mintcream: { r: 245, g: 255, b: 250, a: 1 },
  mistyrose: { r: 255, g: 228, b: 225, a: 1 },
  moccasin: { r: 255, g: 228, b: 181, a: 1 },
  navajowhite: { r: 255, g: 222, b: 173, a: 1 },
  navy: { r: 0, g: 0, b: 128, a: 1 },
  oldlace: { r: 253, g: 245, b: 230, a: 1 },
  olive: { r: 128, g: 128, b: 0, a: 1 },
  olivedrab: { r: 107, g: 142, b: 35, a: 1 },
  orange: { r: 255, g: 165, b: 0, a: 1 },
  orangered: { r: 255, g: 69, b: 0, a: 1 },
  orchid: { r: 218, g: 112, b: 214, a: 1 },
  palegoldenrod: { r: 238, g: 232, b: 170, a: 1 },
  palegreen: { r: 152, g: 251, b: 152, a: 1 },
  paleturquoise: { r: 175, g: 238, b: 238, a: 1 },
  palevioletred: { r: 219, g: 112, b: 147, a: 1 },
  papayawhip: { r: 255, g: 239, b: 213, a: 1 },
  peachpuff: { r: 255, g: 218, b: 185, a: 1 },
  peru: { r: 205, g: 133, b: 63, a: 1 },
  pink: { r: 255, g: 192, b: 203, a: 1 },
  plum: { r: 221, g: 160, b: 221, a: 1 },
  powderblue: { r: 176, g: 224, b: 230, a: 1 },
  purple: { r: 128, g: 0, b: 128, a: 1 },
  rebeccapurple: { r: 102, g: 51, b: 153, a: 1 },
  red: { r: 255, g: 0, b: 0, a: 1 },
  rosybrown: { r: 188, g: 143, b: 143, a: 1 },
  royalblue: { r: 65, g: 105, b: 225, a: 1 },
  saddlebrown: { r: 139, g: 69, b: 19, a: 1 },
  salmon: { r: 250, g: 128, b: 114, a: 1 },
  sandybrown: { r: 244, g: 164, b: 96, a: 1 },
  seagreen: { r: 46, g: 139, b: 87, a: 1 },
  seashell: { r: 255, g: 245, b: 238, a: 1 },
  sienna: { r: 160, g: 82, b: 45, a: 1 },
  silver: { r: 192, g: 192, b: 192, a: 1 },
  skyblue: { r: 135, g: 206, b: 235, a: 1 },
  slateblue: { r: 106, g: 90, b: 205, a: 1 },
  slategray: { r: 112, g: 128, b: 144, a: 1 },
  snow: { r: 255, g: 250, b: 250, a: 1 },
  springgreen: { r: 0, g: 255, b: 127, a: 1 },
  steelblue: { r: 70, g: 130, b: 180, a: 1 },
  tan: { r: 210, g: 180, b: 140, a: 1 },
  teal: { r: 0, g: 128, b: 128, a: 1 },
  thistle: { r: 216, g: 191, b: 216, a: 1 },
  tomato: { r: 255, g: 99, b: 71, a: 1 },
  turquoise: { r: 64, g: 224, b: 208, a: 1 },
  violet: { r: 238, g: 130, b: 238, a: 1 },
  wheat: { r: 245, g: 222, b: 179, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  whitesmoke: { r: 245, g: 245, b: 245, a: 1 },
  yellow: { r: 255, g: 255, b: 0, a: 1 },
  yellowgreen: { r: 154, g: 205, b: 50, a: 1 }
};

// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.io/
//

class LineSegment {
  /**
   * Creates an instance of a line segment.
   * 
   * @constructor
   * @param {number|object} x1 - The x-coordinate of the first point or a vector object.
   * @param {number|object} y1 - The y-coordinate of the first point or a vector object.
   * @param {number} [x2] - The x-coordinate of the second point (optional if x1 and y1 are vectors).
   * @param {number} [y2] - The y-coordinate of the second point (optional if x1 and y1 are vectors).
   */
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = new Vector(x1, y1);
      this.pt2 = new Vector(x2, y2);
    }

    this.fontSize = 10;
    this.strokeColor = "black";
    this.isDashedLine = false;
    this.drawTextLabels = true;
    this.drawTextMagnitude = true;
    this.drawTextAngle = true;
    this.strokeWeight = 2;
  }

  /**
   * Returns x1
   */
  get x1() {
    return this.pt1.x;
  }

  /**
   * Set x1
   */
  set x1(val) {
    this.pt1.x = val;
  }

  /**
   * Returns y1
   */
  get y1() {
    return this.pt1.y;
  }

  /**
   * Set y1
   */
  set y1(val) {
    this.pt1.y = val;
  }

  /**
   * Returns x2
   */
  get x2() {
    return this.pt2.x;
  }

  /**
   * Set x2
   */
  set x2(val) {
    this.pt2.x = val;
  }

  /**
   * Returns y2
   */
  get y2() {
    return this.pt2.y;
  }

  /**
   * Set y2
   */
  set y2(val) {
    this.pt2.y = val;
  }

  /**
   * Returns the heading of the line segment in radians between 0 and 2*PI.
   */
  getHeading() {
    const diffVector = this.pt2.subtract(this.pt1);
    let heading = Math.atan2(diffVector.y, diffVector.x);

    if (heading < 0) {
      heading += 2 * Math.PI;
    }
    return heading;
  }

  /**
   * Returns the two normals for the line segment (one normal for each direction)
   */
  getNormals() {
    return calculateNormals(this.pt1, this.pt2);
  }

  /**
   * Returns one of the normals for this line segment. To get both
   * normals, call getNormals()
   */
  getNormal() {
    return this.getNormals()[0];
  }

  /**
   * Calculates the vector representing the line segment moved to the origin.
   *
   * @returns {Vector} The vector representing the line segment at the origin.
   */
  getVectorAtOrigin() {
    return this.pt2.subtract(this.pt1);
  }

  /**
   * Gets the angles between this line segment and the given vector or line segment.
   * Returns both the counterclockwise and clockwise angles in radians.
   *
   * @param {Vector|LineSegment} vectorOrLineSegment The other vector or line segment.
   * @returns {Object} An object containing both the counterclockwise and clockwise angles in radians.
   */
  getAnglesBetween(vectorOrLineSegment) {
    const v1 = this.getVectorAtOrigin();
    let v2;

    if (vectorOrLineSegment instanceof LineSegment) {
      v2 = vectorOrLineSegment.getVectorAtOrigin();
    } else {
      v2 = vectorOrLineSegment;
    }

    let angleBetweenRadians = v1.signedAngleTo(v2);

    // Normalize the signed angle (-π, π] to [0, 2π)
    if (angleBetweenRadians < 0) {
      angleBetweenRadians += 2 * Math.PI;
    }

    // Calculate the counterclockwise and clockwise angles
    const clockwiseAngle = angleBetweenRadians;
    const counterclockwiseAngle = 2 * Math.PI - angleBetweenRadians;
    
    return {
      counterclockwiseAngle,
      clockwiseAngle
    };
  }

  /**
   * Calculates the orthogonal projection of vector p onto this line segment.
   * 
   * @param {Vector} p The vector to project onto the line segment.
   * @returns {Vector} The orthogonal projection of p onto the line segment.
   */
  getOrthogonalProjection(p) {
    // http://mathonline.wikidot.com/orthogonal-projections

    const d1 = this.pt2.subtract(this.pt1); // Direction vector of the line segment
    const d2 = p.subtract(this.pt1); // Vector from point p to the first point of the line segment

    const l1 = d1.magnitude(); // Length of the line segment

    const dotProduct = Math.min(Math.max(d2.dotProduct(d1.normalize()), 0), l1); // Constrain dot product between 0 and l1

    return this.pt1.add(d1.normalize().multiply(dotProduct));
  }

  /**
   * Returns the minimum distance between this line segment and the given point p.
   * 
   * @param {Vector} p The point to calculate the distance to.
   * @returns {number} The minimum distance between the line segment and the point.
   */
  getDistance(p) {
    const op = this.getOrthogonalProjection(p);
    return p.subtract(op).magnitude();
  }

  /**
   * Returns the magnitude of this vector as a floating point number.
   * 
   * @returns {number} The magnitude of the line segment.
   */
  getMagnitude() {
    return this.pt2.subtract(this.pt1).magnitude();
  }

  /**
   * Sets the magnitude of the line segment to the given number.
   * 
   * @param {number} len The desired magnitude of the line segment.
   */
  setMagnitude(len) {
    const diffVector = this.pt2.subtract(this.pt1).normalize().multiply(len);
    this.pt2 = this.pt1.add(diffVector);
  }

  /**
   * Draws the line segment on the provided canvas context.
   * 
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWeight;
  
    if (this.isDashedLine) {
      ctx.setLineDash([5, 15]);
    }
  
    this.drawArrow(ctx, this.pt1, this.pt2.subtract(this.pt1), this.strokeColor); 
  
    // Draw text labels (optional)
    if (this.drawTextLabels) {
      ctx.save(); // Save context to prevent affecting other drawing calls
      ctx.font = `${this.fontSize}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = this.strokeColor;

      const label = this.generateLabel();
      const labelWidth = ctx.measureText(label).width;
      
      // BUG FIX: Draw relative to pt1 instead of global origin
      ctx.fillText(label, this.pt1.x - labelWidth - 3, this.pt1.y + 12);
      ctx.restore();
    }
  }

  drawArrow(ctx, p1, p2, color) {
    const headLength = 10; // Length of the arrow head
    const angle = Math.atan2(p2.y, p2.x);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.stroke();

    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle + Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
  
  /**
   * Generates the label to be displayed on the line segment.
   *
   * @returns {string} The label text.
   */
  generateLabel() {
    let label = "";
    if (this.drawTextAngle) {
      const angleDegrees = Math.round(Math.atan2(this.pt2.y - this.pt1.y, this.pt2.x - this.pt1.x) * 180 / Math.PI);
      label += `${angleDegrees}°`;
    }
  
    if (this.drawTextAngle && this.drawTextMagnitude) {
      label += " ";
    }
  
    if (this.drawTextMagnitude) {
      label += `|${this.getMagnitude().toFixed(1)}|`;
    }
  
    return label;
  }

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
  static drawAngleArcs(ctx, lineSegment1, lineSegment2, clockwiseArcColor='blue', 
    counterclockwiseArcColor='red', clockwiseArcRadius = 50, counterclockwiseArcRadius = 30) {
    
    const lineSeg1AngleRadians = lineSegment1.getHeading();
    const angles = lineSegment1.getAnglesBetween(lineSegment2);

    ctx.save();

    // Draw the clockwise arc
    // arc(x, y, radius, startAngle, endAngle, counterclockwise)
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, clockwiseArcRadius, 
      lineSeg1AngleRadians, lineSeg1AngleRadians + angles.clockwiseAngle, false);
    ctx.strokeStyle = clockwiseArcColor;
    //ctx.setLineDash([2, 5]);
    ctx.stroke();

    // Draw the clockwise angle text
    const clockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + clockwiseArcRadius * 1.35 * Math.cos(lineSeg1AngleRadians + angles.clockwiseAngle / 2),
      lineSegment1.pt1.y + clockwiseArcRadius * 1.35 * Math.sin(lineSeg1AngleRadians + angles.clockwiseAngle / 2)
    );
  
    ctx.font = "12px Arial"; // Replace with your desired font and size
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = clockwiseArcColor;
  
    const clockwiseAngleDegrees = convertToDegrees(angles.clockwiseAngle);
    const clockwiseAngleDegreesLabel = `${clockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillText(clockwiseAngleDegreesLabel, clockwiseArcMiddleVector.x, clockwiseArcMiddleVector.y);

    // Draw the counterclockwise arc
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, counterclockwiseArcRadius,
      lineSeg1AngleRadians, lineSeg1AngleRadians - angles.counterclockwiseAngle, true);
    ctx.strokeStyle = counterclockwiseArcColor;
    ctx.stroke();

    // Draw the counterclockwise angle text
    const counterclockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + counterclockwiseArcRadius * 1.5 * Math.cos(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2),
      lineSegment1.pt1.y + counterclockwiseArcRadius * 1.5 * Math.sin(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2)
    );

    const counterclockwiseAngleDegrees = convertToDegrees(angles.counterclockwiseAngle);
    const counterclockwiseAngleDegreesLabel = `${counterclockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillStyle = counterclockwiseArcColor;
    ctx.fillText(counterclockwiseAngleDegreesLabel, counterclockwiseArcMiddleVector.x, counterclockwiseArcMiddleVector.y);
  
    ctx.restore();
  }
}

/**
 * Calculates the two normals for the line segment (one normal for each direction).
 * 
 * @param {Vector} pt1 The first point in the line segment.
 * @param {Vector} pt2 The second point in the line segment.
 * @returns {Vector[]} An array containing two Vector objects representing the normals.
 */
function calculateNormals(pt1, pt2) {
  // From: https://stackoverflow.com/a/1243676  
  // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
  //  V = B - A;
  //  normal1 = [ V(2), -V(1)];
  //  normal2 = [-V(2), V(1)];

  const v = pt2.subtract(pt1);
  return [new Vector(v.y, -v.x), new Vector(-v.y, v.x)];
}

// serial.js — A Web Serial API wrapper for physical computing
//
// Provides a simple, event-driven interface for text-based serial communication
// between a web browser and microcontrollers (Arduino, ESP32, etc.).
//
// Web Serial browser support (as of 2026): Chrome, Edge, Opera
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
//
// Quick test: open the browser dev console and type `navigator.serial`
// If it returns a Serial object, your browser supports Web Serial.
// If it returns `undefined`, it does not.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js
// Textbook: https://makeabilitylab.github.io/physcomp/communication/web-serial.html

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
const SerialEvents = Object.freeze({
  /** Fired when the serial port is successfully opened and ready for I/O. */
  CONNECTION_OPENED: "CONNECTION_OPENED",

  /** Fired when the serial port is closed (either programmatically or by disconnect). */
  CONNECTION_CLOSED: "CONNECTION_CLOSED",

  /** Fired for each line of text received from the serial device. */
  DATA_RECEIVED: "DATA_RECEIVED",

  /** Fired when an error occurs during connection, reading, or writing. */
  ERROR_OCCURRED: "ERROR_OCCURRED",
});

/**
 * Connection state constants returned by {@link Serial#state}.
 *
 * @readonly
 * @enum {string}
 */
const SerialState = Object.freeze({
  CLOSED: "closed",
  OPENING: "opening",
  OPEN: "open",
  CLOSING: "closing",
});

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
 * serial.on(SerialEvents.CONNECTION_OPENED, () => {
 *   console.log("Connected!");
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
 * // Connect with default baud rate (9600)
 * await serial.connectAndOpen();
 *
 * // Or for ESP32, use 115200:
 * // await serial.connectAndOpen(null, { baudRate: 115200 });
 *
 * // Send data to the microcontroller
 * await serial.writeLine("Hello Arduino!");
 *
 * @example <caption>Auto-reconnect to a previously approved port</caption>
 * const serial = new Serial();
 * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
 *   document.getElementById("output").textContent = line;
 * });
 * // No user gesture needed if the port was previously approved
 * await serial.autoConnectAndOpenPreviouslyApprovedPort({ baudRate: 115200 });
 */
class Serial {

  constructor() {
    /** @type {?SerialPort} The underlying Web Serial port */
    this.serialPort = null;

    /** @type {?WritableStreamDefaultWriter} Text writer for outgoing data */
    this.serialWriter = null;

    /** @type {?ReadableStreamDefaultReader} Line-buffered reader for incoming data */
    this.serialReader = null;

    /** @private */
    this.keepReading = false;

    /** @private */
    this.readableStreamClosed = null;

    /** @private */
    this.writableStreamClosed = null;

    /** @private */
    this._state = SerialState.CLOSED;

    /**
     * Map of event labels to arrays of callback functions.
     * @private
     * @type {Map<string, function[]>}
     */
    this.events = new Map();

    /**
     * Set of recognized event labels for validation.
     * @private
     * @type {Set<string>}
     */
    this.knownEvents = new Set([
      SerialEvents.CONNECTION_OPENED,
      SerialEvents.CONNECTION_CLOSED,
      SerialEvents.DATA_RECEIVED,
      SerialEvents.ERROR_OCCURRED,
    ]);

    // Listen for browser-level serial connect/disconnect events
    if (typeof navigator !== "undefined" && navigator.serial) {
      navigator.serial.addEventListener("connect", (event) => {
        console.log("[Serial] Device connected to system");
      });

      navigator.serial.addEventListener("disconnect", (event) => {
        console.log("[Serial] Device disconnected from system");
        // Only auto-close if this instance has an open port
        if (this.serialPort) {
          this.close();
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  //  Properties
  // ---------------------------------------------------------------------------

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
  get state() {
    return this._state;
  }

  // ---------------------------------------------------------------------------
  //  Event system
  // ---------------------------------------------------------------------------

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
  on(label, callback) {
    if (!this.knownEvents.has(label)) {
      console.warn(`[Serial] Unknown event "${String(label)}". ` +
        `Known events: ${[...this.knownEvents].join(", ")}`);
      return;
    }
    if (!this.events.has(label)) {
      this.events.set(label, []);
    }
    this.events.get(label).push(callback);
  }

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
  off(label, callback) {
    if (!this.events.has(label)) return false;
    const listeners = this.events.get(label);
    const index = listeners.indexOf(callback);
    if (index === -1) return false;
    listeners.splice(index, 1);
    return true;
  }

  /**
   * Triggers an event and calls all registered handlers for it.
   *
   * @param {string} event - The event type to fire.
   * @param {*} [data=null] - Optional data passed to each handler.
   */
  fireEvent(event, data = null) {
    if (this.events.has(event)) {
      for (const callback of this.events.get(event)) {
        try {
          callback(this, data);
        } catch (err) {
          console.error(`[Serial] Error in ${String(event)} handler:`, err);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  //  Connection
  // ---------------------------------------------------------------------------

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
  async autoConnectAndOpenPreviouslyApprovedPort(serialOptions = { baudRate: 9600 }) {
    this._requireWebSerial();

    const approvedPortList = await navigator.serial.getPorts();
    console.log("[Serial] Previously approved ports:", approvedPortList.length);

    if (approvedPortList.length > 0) {
      const portInfo = approvedPortList[0].getInfo();
      console.log("[Serial] Auto-connecting to:", portInfo);
      await this.connect(approvedPortList[0]);

      if (this.serialPort) {
        console.log("[Serial] Opening port...");
        await this.open(serialOptions);
      }
    } else {
      console.log("[Serial] No previously approved ports found. " +
        "Call connectAndOpen() with a user gesture (e.g., button click) to request access.");
    }
  }

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
  isOpen() {
    return this._state === SerialState.OPEN &&
      this.serialPort !== null &&
      this.serialReader !== null &&
      this.serialWriter !== null;
  }

  /**
   * Prompts the user to select a serial device and opens the connection.
   * This is the primary method for most use cases.
   *
   * **Must be called from a user gesture** (e.g., a button click) because
   * `navigator.serial.requestPort()` requires user activation.
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
  async connectAndOpen(portFilters = null, serialOptions = { baudRate: 9600 }) {
    await this.connect(null, portFilters);

    if (this.serialPort) {
      await this.open(serialOptions);
    }
  }

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
  async connect(existingPort = null, portFilters = null) {
    this._requireWebSerial();

    try {
      const oldApprovedPortList = await navigator.serial.getPorts();

      if (!existingPort) {
        // Prompt user to select a port (requires user gesture)
        this.serialPort = await navigator.serial.requestPort(
          portFilters ? { filters: portFilters } : {}
        );
      } else if (!oldApprovedPortList.includes(existingPort)) {
        console.log("[Serial] Port not previously approved, prompting user");
        this.serialPort = await navigator.serial.requestPort(
          portFilters ? { filters: portFilters } : {}
        );
      } else {
        console.log("[Serial] Connecting to pre-approved port:", existingPort.getInfo());
        this.serialPort = existingPort;
      }

      const portInfo = this.serialPort.getInfo();
      console.log("[Serial] Selected port:", portInfo);

    } catch (error) {
      if (error.name === "NotFoundError") {
        // User cancelled the port picker dialog — not really an error
        console.log("[Serial] Port selection cancelled by user");
      } else {
        this._fireError(error);
      }
    }
  }

  // ---------------------------------------------------------------------------
  //  Reading & Writing
  // ---------------------------------------------------------------------------

  /**
   * Writes a string to the serial port with a newline (`\n`) appended.
   *
   * @param {string} data - The text to send.
   * @throws {Error} If the serial port is not open.
   *
   * @example
   * await serial.writeLine("LED_ON");
   */
  async writeLine(data) {
    await this.write(data + "\n");
  }

  /**
   * Writes a string to the serial port.
   *
   * @param {string} data - The text to send.
   * @throws {Error} If the serial port is not open.
   *
   * @example
   * await serial.write("255,128,0");
   */
  async write(data) {
    if (!this.isOpen()) {
      throw new Error(
        "[Serial] Cannot write: port is not open. " +
        "Call connectAndOpen() first."
      );
    }
    await this.serialWriter.write(data);
  }

  // ---------------------------------------------------------------------------
  //  Open & Close
  // ---------------------------------------------------------------------------

  /**
   * Opens the serial port and begins listening for incoming data.
   *
   * Most callers should use {@link Serial#connectAndOpen} instead. This lower-level
   * method is called internally after a port has been selected via {@link Serial#connect}.
   *
   * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open
   */
  async open(serialOptions = { baudRate: 9600 }) {
    if (!this.serialPort) {
      throw new Error(
        "[Serial] No serial port selected. Call connect() or connectAndOpen() first."
      );
    }

    this._state = SerialState.OPENING;

    try {
      await this.serialPort.open(serialOptions);
      console.log("[Serial] Port opened with:", serialOptions);

      // --- Set up the writer (text encoder → serial port) ---
      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(this.serialPort.writable);
      this.serialWriter = textEncoder.writable.getWriter();

      // --- Set up the reader (serial port → text decoder → line splitter) ---
      const textDecoder = new TextDecoderStream();
      this.keepReading = true;
      this.readableStreamClosed = this.serialPort.readable.pipeTo(textDecoder.writable);
      this.serialReader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

      this._state = SerialState.OPEN;
      this.fireEvent(SerialEvents.CONNECTION_OPENED);

      // --- Read loop: wait for lines from the device ---
      while (this.serialPort && this.serialPort.readable && this.keepReading) {
        try {
          while (true) {
            const { value, done } = await this.serialReader.read();

            if (done) {
              this.serialReader.releaseLock();
              break;
            }

            if (value) {
              this.fireEvent(SerialEvents.DATA_RECEIVED, value);
            }
          }
        } catch (error) {
          // Non-fatal read error (e.g., device temporarily unresponsive)
          if (this.keepReading) {
            this._fireError(error);
          }
          // If !keepReading, the error is expected from reader.cancel() during close()
        } finally {
          if (this.serialReader) {
            try {
              this.serialReader.releaseLock();
            } catch (e) {
              // Lock may already be released
            }
          }
        }
      }

    } catch (error) {
      this._state = SerialState.CLOSED;

      if (error.name === "InvalidStateError") {
        this._fireError(new Error(
          "[Serial] Port is already open. Is another tab or program using it?"
        ));
      } else if (error.name === "NetworkError") {
        this._fireError(new Error(
          "[Serial] Failed to open port. The device may have been disconnected, " +
          "or another program (like the Arduino Serial Monitor) may be using it."
        ));
      } else {
        this._fireError(error);
      }
    }
  }

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
  async close() {
    if (this._state === SerialState.CLOSING || this._state === SerialState.CLOSED) {
      return; // Already closing or closed
    }

    this._state = SerialState.CLOSING;

    // Signal the read loop to stop
    this.keepReading = false;

    // --- Close the reader ---
    if (this.serialReader) {
      try {
        await this.serialReader.cancel();
      } catch (e) {
        console.warn("[Serial] Error cancelling reader:", e);
      }

      try {
        await this.readableStreamClosed;
      } catch (e) {
        // Expected: cancelling the reader causes the pipe to reject
      }

      this.serialReader = null;
      this.readableStreamClosed = null;
    }

    // --- Close the writer ---
    if (this.serialWriter) {
      try {
        await this.serialWriter.close();
      } catch (e) {
        console.warn("[Serial] Error closing writer:", e);
      }

      try {
        await this.writableStreamClosed;
      } catch (e) {
        console.warn("[Serial] Error waiting for writable stream:", e);
      }

      this.serialWriter = null;
      this.writableStreamClosed = null;
    }

    // --- Close the port ---
    if (this.serialPort) {
      try {
        await this.serialPort.close();
      } catch (e) {
        console.warn("[Serial] Error closing port:", e);
      }
      this.serialPort = null;
    }

    this._state = SerialState.CLOSED;
    this.fireEvent(SerialEvents.CONNECTION_CLOSED);
  }

  // ---------------------------------------------------------------------------
  //  Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Checks if the Web Serial API is available in this browser.
   * @private
   * @throws {Error} If Web Serial is not supported.
   */
  _requireWebSerial() {
    if (typeof navigator === "undefined" || !navigator.serial) {
      throw new Error(
        "[Serial] Web Serial API is not supported in this browser. " +
        "Please use Chrome, Edge, or Opera."
      );
    }
  }

  /**
   * Fires an ERROR_OCCURRED event with consistent logging.
   * @private
   * @param {Error} error
   */
  _fireError(error) {
    console.error("[Serial] Error:", error);
    this.fireEvent(SerialEvents.ERROR_OCCURRED, error);
  }

  // ---------------------------------------------------------------------------
  //  Static utilities
  // ---------------------------------------------------------------------------

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
  static isWebSerialSupported() {
    return typeof navigator !== "undefined" && "serial" in navigator;
  }
}


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
class LineBreakTransformer {
  constructor() {
    /** @private */
    this.buffer = "";
  }

  /**
   * Called by the TransformStream for each incoming chunk. Buffers data
   * and enqueues complete lines.
   *
   * @param {string} chunk - Incoming text chunk.
   * @param {TransformStreamDefaultController} controller - Stream controller.
   */
  transform(chunk, controller) {
    this.buffer += chunk;

    // Split on any common line ending: \r\n, \r, or \n
    // Regex: split on \r\n first (greedy), then standalone \r or \n
    const lines = this.buffer.split(/\r?\n|\r/);

    // The last element is the incomplete line (or "" if buffer ended with a newline)
    this.buffer = lines.pop();

    for (const line of lines) {
      controller.enqueue(line);
    }
  }

  /**
   * Called when the stream is closed. Flushes any remaining buffered text.
   *
   * @param {TransformStreamDefaultController} controller - Stream controller.
   */
  flush(controller) {
    if (this.buffer.length > 0) {
      controller.enqueue(this.buffer);
    }
  }
}

class MakeabilityLabLogo {

  static get DEFAULT_M_OUTLINE_COLOR()  { return 'black'; }
  static get DEFAULT_M_OUTLINE_STROKE_WIDTH() { return 4; }
  static get DEFAULT_L_OUTLINE_COLOR()  { return 'black'; }
  static get DEFAULT_L_OUTLINE_STROKE_WIDTH() { return 4; }

  constructor(x, y, triangleSize) {

    // The Makeability Lab logo is composed of 6 columns and 4 rows of square cells
    // Each cell is composed of two triangles, which can be in different orientations
    this.makeLabLogoArray = MakeabilityLabLogo.createMakeabilityLabLogoCellArray(x, y, triangleSize);

    this.visible = true;
    this.isMOutlineVisible = true;
    this.isLOutlineVisible = true;
    this.mOutlineColor = MakeabilityLabLogo.DEFAULT_M_OUTLINE_COLOR;
    this.mOutlineStrokeWidth = MakeabilityLabLogo.DEFAULT_M_OUTLINE_STROKE_WIDTH;
    this.lOutlineColor = MakeabilityLabLogo.DEFAULT_L_OUTLINE_COLOR;
    this.lOutlineStrokeWidth = MakeabilityLabLogo.DEFAULT_L_OUTLINE_STROKE_WIDTH;
    this.setColors('white', 'black');
    this.setFillColorsToDefault();

    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = tri.strokeColor;
    }

    this.areLTriangleStrokesVisible = false;

    this.drawBoundingBox = false;

    // --- Outline opacity (0–1) for animated fade-in support ---
    this.lOutlineOpacity = 1.0;
    this.mOutlineOpacity = 1.0;

    // --- Label ---
    /** Whether the label is visible and included in the logo's bounding box / height. */
    this.isLabelVisible = false;
    this.labelText = "MAKEABILITY LAB";
    this.labelBoldUntilIndex = 4; // Bolds "MAKE"
    this.labelFontFamily = "Inter, Roboto, system-ui, -apple-system, sans-serif";
    this.labelColor = "black";

    /**
     * Vertical gap in pixels between the bottom of the logo grid and the label.
     * @type {number}
     */
    this.labelGap = 8;

    /**
     * Label font size as a fraction of logo width. Used for bounding-box and
     * height calculations (which don't have access to a canvas context).
     * At draw time the actual font size is computed via measureText so the
     * label spans exactly the logo width; this fraction should approximate
     * that rendered size so centering / layout is accurate.
     * @type {number}
     */
    this.labelFontSizeFraction = 0.09;
  }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numRows() { return 4; }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numCols() { return 6; }

  /**
   * Calculates the width of the MakeabilityLabLogo based on the size of the triangles.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @returns {number} The total width of the MakeabilityLabLogo.
   */
  static getGridWidth(triangleSize){
    return MakeabilityLabLogo.numCols * triangleSize;
  }

  /**
   * Calculates the grid height of the MakeabilityLabLogo (excluding the label)
   * based on the size of the triangles.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @returns {number} The grid height of the logo (numRows × triangleSize).
   */
  static getGridHeight(triangleSize){
    return MakeabilityLabLogo.numRows * triangleSize;
  }

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
static getGridXCenterPosition(triangleSize, canvasWidth, alignToGrid = false, strokePadding = 0) {
  // Subtract the full stroke padding from the available width so that
  // strokePadding/2 of margin remains on each side for the stroke bleed.
  const xCenter = (canvasWidth - MakeabilityLabLogo.getGridWidth(triangleSize) - strokePadding) / 2;

  if (alignToGrid) {
    return Math.round(xCenter / triangleSize) * triangleSize;
  }
  return xCenter;
}

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
static getGridYCenterPosition(triangleSize, canvasHeight, alignToGrid = false, strokePadding = 0) {
  const yCenter = (canvasHeight - MakeabilityLabLogo.getGridHeight(triangleSize) - strokePadding) / 2;

  if (alignToGrid) {
    return Math.round(yCenter / triangleSize) * triangleSize;
  }
  return yCenter;
}

  /**
   * Sets the draw debug information flag for the logo and its components.
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawBoundingBox = drawDebugInfo;
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        this.makeLabLogoArray[row][col].setDrawDebugInfo(drawDebugInfo);
      }
    }
  }

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
  getBoundingBox() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    let minXTriangle = null;
    let minYTriangle = null;
    let maxXTriangle = null;
    let maxYTriangle = null;

    for (const tri of this.getAllTriangles()) {
      if (!tri.visible){ continue; }

      const triBoundingBox = tri.getBoundingBox();
      
      // Update minX and minY
      if (triBoundingBox.x < minX) {
        minX = triBoundingBox.x;
        minXTriangle = tri;
      }
      if (triBoundingBox.y < minY) {
        minY = triBoundingBox.y;
        minYTriangle = tri;
      }
      
      // Update maxX and maxY
      if (triBoundingBox.x + triBoundingBox.width > maxX) {
        maxX = triBoundingBox.x + triBoundingBox.width;
        maxXTriangle = tri;
      }
      if (triBoundingBox.y + triBoundingBox.height > maxY) {
        maxY = triBoundingBox.y + triBoundingBox.height;
        maxYTriangle = tri;
      }
    }

    const padding = Math.max(this.mOutlineStrokeWidth, this.lOutlineStrokeWidth) / 2;

    // Extend bounding box to include the label when visible
    const labelExtra = this.labelHeight; // 0 when label is hidden

    return {
      x: minX - padding,
      y: minY - padding,
      width: (maxX - minX) + 2 * padding,
      height: (maxY - minY) + 2 * padding + labelExtra,
      minXTriangle,
      minYTriangle,
      maxXTriangle,
      maxYTriangle
    };
  }


  /**
   * Gets the far left x-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The x-coordinate of the first element.
   */
  get x(){ return this.makeLabLogoArray[0][0].x }
  
  /**
   * Sets the x-coordinate for the logo by adjusting the coordinates 
   * of all triangles accordingly
   * 
   * @param {number} x - The new x-coordinate to set.
   */
  set x(x){
    const xOffset = x - this.x;
    for(const tri of this.getAllTriangles()){
      tri.x += xOffset;
    }
  }

  /**
   * Gets the top y-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The y-coordinate of the first element.
   */
  get y(){ return this.makeLabLogoArray[0][0].y }

  /**
   * Sets the y-coordinate for the logo and adjusts the y-coordinates of all 
   * triangles accordingly.
   * 
   * @param {number} y - The new y-coordinate to set.
   */
  set y(y){ 
    const yOffset = y - this.y;
    for(const tri of this.getAllTriangles()){
      tri.y += yOffset;
    }
  }

  /**
   * Gets the size of a cell in the Makeability Lab logo
   * Each cell is composed of two triangles
   * 
   * @returns {number} The size of the cell.
   */
  get cellSize(){ return this.makeLabLogoArray[0][0].size }

  /**
   * Gets the width of the Makeability Lab logo
   *
   * @returns {number} The width of the Makeability Lab logo.
   */
  get width(){ return MakeabilityLabLogo.numCols * this.makeLabLogoArray[0][0].size }

  /**
   * Gets the height of the logo grid only (4 rows × cellSize), excluding the label.
   * @returns {number}
   */
  get logoGridHeight(){ return MakeabilityLabLogo.numRows * this.makeLabLogoArray[0][0].size }

  /**
   * Gets the approximate font size of the label in pixels.
   * Based on labelFontSizeFraction × logo width.
   * @returns {number}
   */
  get labelFontSize(){ return this.width * this.labelFontSizeFraction; }

  /**
   * Gets the vertical space the label occupies (gap + font size), or 0 if hidden.
   * @returns {number}
   */
  get labelHeight(){ return this.isLabelVisible ? this.labelGap + this.labelFontSize : 0; }

  /**
   * Gets the total height of the MakeabilityLab logo, including the label if visible.
   * @returns {number}
   */
  get height(){ return this.logoGridHeight + this.labelHeight; }

  /**
   * Getter for the default colors state.
   * 
   * @returns {boolean} - Returns true if the default colors are on, otherwise false.
   */
  get areDefaultColorsOn(){ return this._defaultColorsOn; }

  /**
   * Adjusts the logo size to fit within the given canvas dimensions.
   * Updated to fully account for stroke widths and label visibility.
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.
   */
  fitToCanvas(canvasWidth, canvasHeight, alignToGrid = false) {
    // 1. Calculate the required padding based on the stroke widths.
    // We use the full stroke width as padding (half for each side of the canvas).
    const strokePadding = Math.max(this.mOutlineStrokeWidth, this.lOutlineStrokeWidth);

    // 2. Subtract stroke padding from both dimensions
    let adjustedWidth = canvasWidth - strokePadding;
    let adjustedHeight = canvasHeight - strokePadding;

    // 3. Account for the label if visible
    let effectiveRows = MakeabilityLabLogo.numRows;
    if (this.isLabelVisible) {
      adjustedHeight -= this.labelGap; //
      effectiveRows += MakeabilityLabLogo.numCols * this.labelFontSizeFraction; //
    }

    // 4. Calculate the triangle size based on the most restrictive dimension
    const triangleSize = Math.min(
      adjustedWidth / MakeabilityLabLogo.numCols,
      adjustedHeight / effectiveRows
    );

    // 5. Apply the size and center the logo within the original canvas area
    this.setTriangleSize(triangleSize);
    this.centerLogo(canvasWidth, canvasHeight, alignToGrid);
  }

  /**
   * Centers the logo on the canvas.
   *
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the logo to the grid.
   */
  centerLogo(canvasWidth, canvasHeight, alignToGrid=false){
    const xCenter = MakeabilityLabLogo.getGridXCenterPosition(this.cellSize, canvasWidth, alignToGrid);

    // Center the full height (grid + label) vertically
    let yCenter = (canvasHeight - this.height) / 2;
    if (alignToGrid) {
      yCenter = Math.round(yCenter / this.cellSize) * this.cellSize;
    }
    this.setLogoPosition(xCenter, yCenter);
  }

  /**
   * Sets the size of the logo based on the given width.
   *
   * @param {number} logoWidth - The width of the logo.
   */
  setLogoSize(logoWidth){
    const triangleSize = logoWidth / MakeabilityLabLogo.numCols;
    this.setTriangleSize(triangleSize);
  }

  /**
   * Sets the size of all triangles to the specified value.
   *
   * @param {number} triangleSize - The new size to set for all triangles.
   */
  setTriangleSize(newSize){
    const oldSize = this.cellSize;
    if (oldSize === newSize) return;
    const originX = this.x, originY = this.y;
    for (const tri of this.getAllTriangles()) {
      tri.x = originX + (tri.x - originX) * (newSize / oldSize);
      tri.y = originY + (tri.y - originY) * (newSize / oldSize);
      tri.size = newSize;
    }
  }

  /**
   * Sets the position of the logo by adjusting the coordinates of all triangles.
   *
   * @param {number} x - The new x-coordinate for the logo.
   * @param {number} y - The new y-coordinate for the logo.
   */
  setLogoPosition(x, y){
    const xOffset = x - this.x;
    const yOffset = y - this.y;
    for(const tri of this.getAllTriangles()){
      tri.x += xOffset;
      tri.y += yOffset;
    }
  }

  /**
   * Sets the visibility of the strokes for the L outline in the Makeability Lab logo
   * 
   * @param {boolean} visible - A boolean indicating whether the strokes should be visible.
   */
  set areLTriangleStrokesVisible(visible){ 
    for(const tri of this.getLTriangles()){
      tri.isStrokeVisible = visible;
    }
  }
  
  /**
   * Returns true of the L strokes are visible, otherwise false.
   * 
   * @returns {boolean} True if all L-shaped triangle strokes are visible, otherwise false.
   */
  get areLTriangleStrokesVisible() {
    return this.getLTriangles().every(tri => tri.isStrokeVisible);
  }

  /**
   * Sets the stroke color for all L-shaped triangles.
   *
   * @param {string} color - The color to set as the stroke color for the triangles.
   */
  setLTriangleStrokeColor(color){
    for(const tri of this.getLTriangles()){
      tri.strokeColor = color;
    }
  }

  /**
   * Sets the fill color for all L-shaped triangles. Accepts any CSS color,
   * including semi-translucent values (e.g. 'rgba(255, 255, 255, 0.5)') to let
   * the colored logo show through the L.
   *
   * @param {string} color - The color to set as the fill color for the triangles.
   */
  setLTriangleFillColor(color){
    for(const tri of this.getLTriangles()){
      tri.fillColor = color;
    }
  }

  /**
   * Sets the fill color for all MShadow triangles.
   *
   * @param {string} color - The color to set for the fill of the MShadow triangles.
   */
  setMShadowTriangleFillColor(color){
    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = color;
    }
  }

  /**
   * Sets the stroke visibility for all triangles.
   *
   * @param {boolean} isTransparent - If true, the stroke will be made transparent (invisible).
   * @param {boolean} [includeMShadowTriangles=true] - If true, includes M shadow triangles in the operation.
   */
  setStrokeTransparent(isTransparent, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.isStrokeVisible = !isTransparent;
    }
  }

  /**
   * Sets the internal triangles to transparent
   * @param {Boolean} isTransparent 
   * @param {Boolean} includeMShadowTriangles 
   */
  setFillTransparent(isTransparent, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.isFillVisible = !isTransparent;
    }
  }

  /**
   * Sets the fill color for all triangles in the logo.
   *
   * @param {string} color - The color to set as the fill color for the triangles.
   */
  setFillColor(color, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.fillColor = color;
    }
  }

  /**
   * Convenience method to set fill and stroke colors
   * @param {*} fillColor 
   * @param {*} strokeColor 
   */
  setColors(fillColor, strokeColor, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.fillColor = fillColor;
      tri.strokeColor = strokeColor;
    }
  }

  /**
   * Retrieves all triangles from the Makeability Lab logo array.
   * The M shadow triangles are the two dark triangles on the bottom left and right
   * side of the logo
   * 
   * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles in the result.
   * @returns {Array} An array containing all the triangles from the Makeability Lab logo.
   */
  getAllTriangles(includeMShadowTriangles=true, includeLTriangles=true){
    let allTriangles = new Array();
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        if ((includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 1)) &&
            (includeLTriangles || !MakeabilityLabLogo.isLTriangle(row, col, 1))) {
            allTriangles.push(this.makeLabLogoArray[row][col].tri1);
        }

        if ((includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 2)) &&
            (includeLTriangles || !MakeabilityLabLogo.isLTriangle(row, col, 2))) {
            allTriangles.push(this.makeLabLogoArray[row][col].tri2);
        }
      }
    }  
    return allTriangles;
  }

  /**
   * Gets the triangles that are part of the M "shadow". That is, the 
   * black/darkened parts of the M logo
   *
   * @returns {Array} An array containing the selected triangles.
   */
  getMShadowTriangles(){
    let mShadowTriangles = new Array();
    
    // left side
    mShadowTriangles.push(this.makeLabLogoArray[2][1].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][1].tri1);
    
    // right side
    mShadowTriangles.push(this.makeLabLogoArray[2][4].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][4].tri1);

    return mShadowTriangles;
  }

  /**
   * Gets the triangles that compose the L in the Makeability Lab logo
   *
   * @returns {Array} An array containing the selected triangles.
   */
  getLTriangles(){
    let lTriangles = new Array();
    lTriangles.push(this.makeLabLogoArray[0][0].tri2);
    lTriangles.push(this.makeLabLogoArray[0][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][0].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][2].tri2);
    lTriangles.push(this.makeLabLogoArray[2][1].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri2);
    lTriangles.push(this.makeLabLogoArray[3][2].tri1);
    lTriangles.push(this.makeLabLogoArray[3][3].tri1);

    lTriangles.push(this.makeLabLogoArray[2][3].tri1);
    lTriangles.push(this.makeLabLogoArray[2][3].tri2);

    lTriangles.push(this.makeLabLogoArray[1][3].tri2);
    lTriangles.push(this.makeLabLogoArray[2][4].tri1);
    lTriangles.push(this.makeLabLogoArray[1][4].tri2);
    return lTriangles;
  }

  /**
   * Gets the triangles that are colored in the ML logo by default
   *
   * @returns {Array} An array containing the default colored triangles.
   */
  getDefaultColoredTriangles(){
    let cTriangles = new Array();
    cTriangles.push(this.makeLabLogoArray[0][4].tri2);
    cTriangles.push(this.makeLabLogoArray[0][5].tri2);
    cTriangles.push(this.makeLabLogoArray[1][0].tri2);
    cTriangles.push(this.makeLabLogoArray[1][4].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri2);
    cTriangles.push(this.makeLabLogoArray[2][0].tri1);
    cTriangles.push(this.makeLabLogoArray[2][0].tri2);
    cTriangles.push(this.makeLabLogoArray[2][5].tri1);
    cTriangles.push(this.makeLabLogoArray[2][5].tri2);
    cTriangles.push(this.makeLabLogoArray[3][0].tri1);
    cTriangles.push(this.makeLabLogoArray[3][5].tri1);
    return cTriangles;
  }

  /**
   * Sets the default colors for the logo.
   */
  setFillColorsToDefault(){
    this.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
    this._defaultColorsOn = true;
  }

  /**
   * Sets the default fill color for the colored triangles.
   * 
   * @param {(string|string[])} fillColorOrColorArray - A single color string or an 
   * array of color strings to set as the fill color(s) for the triangles.
   */
  setDefaultColoredTrianglesFillColor(fillColorOrColorArray){
    const cTriangles = this.getDefaultColoredTriangles();
    if(Array.isArray(fillColorOrColorArray)){
      for(let i=0; i<cTriangles.length; i++){
        cTriangles[i].fillColor = fillColorOrColorArray[i];
      }
    }else {
      for(let i=0; i<cTriangles.length; i++){
        cTriangles[i].fillColor = fillColorOrColorArray;
      }
    }
  }

  /**
   * Sets the stroke width for all triangles.
   *
   * @param {number} strokeWidth - The width of the stroke to set.
   * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles.
   * @param {boolean} [includeLTriangles=true] - Whether to include L triangles.
   */
  setStrokeWidth(strokeWidth, includeMShadowTriangles=true, includeLTriangles=true){
    for(const tri of this.getAllTriangles(includeMShadowTriangles, includeLTriangles)){
      tri.strokeWidth = strokeWidth;
    }
  }

  /**
   * Draws the Makeability Lab logo and its outlines if they are visible.
   * 
   * This method performs the following actions:
   * 1. Checks if the logo is visible; if not, it returns immediately.
   * 2. Iterates through the `makeLabLogoArray` and calls the `draw` method on each element.
   * 3. If the M outline is visible, it draws the M outline using the specified color and stroke width.
   * 4. If the L outline is visible, it draws the L outline using the specified color and stroke width.
   */
  draw(ctx) {
    if(!this.visible){ return; }

    if(this.drawBoundingBox){
      // for debugging
      const bBox = this.getBoundingBox();
      ctx.save();
      ctx.setLineDash([4, 8]); // Dots of 3 pixel, gaps of 4 pixels
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.strokeRect(bBox.x, bBox.y, bBox.width, bBox.height);
      ctx.restore();

      bBox.minXTriangle.visible = true;
      bBox.maxXTriangle.visible = true;
      bBox.minYTriangle.visible = true;
      bBox.maxYTriangle.visible = true;

      bBox.minXTriangle.fillColor = 'green';
      bBox.maxXTriangle.fillColor = 'blue';
      bBox.minYTriangle.fillColor = 'red';
      bBox.maxYTriangle.fillColor = 'orange';

      // set text properties
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';

      // show width and height of bounding box
      const boundingBoxDimensionsText = `Bounding Box Dimensions: ${bBox.width.toFixed(1)} x ${bBox.height.toFixed(1)}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(boundingBoxDimensionsText, bBox.x + bBox.width / 2, bBox.y);

      // measure and draw bounding box width centered at the top
      const widthText = `Width: ${bBox.width.toFixed(1)}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(widthText, bBox.x + bBox.width / 2, bBox.y + bBox.height + 2);

      // measure and draw bounding box height rotated 90 degrees and centered vertically
      const heightText = `Height: ${bBox.height.toFixed(1)}`;
      ctx.save();
      ctx.translate(bBox.x - 1, bBox.y + bBox.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(heightText, 0, 0);
      ctx.restore();
    }

    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
          this.makeLabLogoArray[row][col].draw(ctx);
      }
    }

    this.drawMOutline(ctx);
    this.drawLOutline(ctx);

    this.drawLabel(ctx);
    
  }

  // ---------------------------------------------------------------------------
  // Outline drawing — public focused methods
  //
  // These draw only their respective outline stroke, respecting the visibility
  // flag and opacity property. They do not draw triangles, the other outline,
  // or the label.
  //
  // Useful for callers (e.g. MakeabilityLabLogoMorpher) that manage their own
  // triangle rendering and need the outlines as clean overlays without the
  // side-effects of calling the full draw() method.
  // ---------------------------------------------------------------------------

  /**
   * Draws only the M outline stroke.
   * No-ops when isMOutlineVisible is false or mOutlineOpacity is 0.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  drawMOutline(ctx) {
    if (!this.isMOutlineVisible || this.mOutlineOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.mOutlineOpacity;
    ctx.strokeStyle = this.mOutlineColor;
    ctx.lineWidth   = this.mOutlineStrokeWidth;
    ctx.beginPath();
    for (const [x, y] of this.getMOutlinePoints()) {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draws only the L outline stroke.
   * No-ops when isLOutlineVisible is false or lOutlineOpacity is 0.
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  drawLOutline(ctx) {
    if (!this.isLOutlineVisible || this.lOutlineOpacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.lOutlineOpacity;
    ctx.strokeStyle = this.lOutlineColor;
    ctx.lineWidth   = this.lOutlineStrokeWidth;
    ctx.beginPath();
    for (const [x, y] of this.getLOutlinePoints()) {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

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
  drawLabel(ctx, { opacity = 1.0, yOffset = 0 } = {}) {
    if (!this.isLabelVisible || opacity <= 0) return;

    const part1 = this.labelText.substring(0, this.labelBoldUntilIndex);
    const part2 = this.labelText.substring(this.labelBoldUntilIndex);

    // Measure at a reference size and scale to span the logo width exactly
    const testFontSize = 100;
    ctx.save();

    ctx.font = `bold ${testFontSize}px ${this.labelFontFamily}`;
    const widthPart1 = ctx.measureText(part1).width;
    ctx.font = `${testFontSize}px ${this.labelFontFamily}`;
    const widthPart2 = ctx.measureText(part2).width;

    const totalMeasuredWidth = widthPart1 + widthPart2;
    const fontSize = (this.width / totalMeasuredWidth) * testFontSize;

    // Position: below the grid, offset by gap + font size (alphabetic baseline)
    const labelY = this.y + this.logoGridHeight + this.labelGap + fontSize + yOffset;

    ctx.globalAlpha = opacity;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = this.labelColor;

    // Bold part
    ctx.font = `bold ${fontSize}px ${this.labelFontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(part1, this.x, labelY);

    // Regular part
    const part1ActualWidth = ctx.measureText(part1).width;
    ctx.font = `${fontSize}px ${this.labelFontFamily}`;
    ctx.fillText(part2, this.x + part1ActualWidth, labelY);

    ctx.restore();
  }

  /**
   * 
   * @returns gets the L outline as an array of line segments
   */
  getLOutlineLineSegments(){
    let lLineSegments = new Array();
    
    lLineSegments.push(new LineSegment(this.x + this.cellSize, this.y, 
      this.x + 3 * this.cellSize, this.y + 2 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, 
      this.y + 2 * this.cellSize, this.x + 4 * this.cellSize, this.y + this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 4 * this.cellSize, this.y + this.cellSize,
      this.x + 5 * this.cellSize, this.y + 2 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y + 2 * this.cellSize,
      this.x + 3 * this.cellSize, this.y + 4 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 4 * this.cellSize,
      this.x, this.y + 1 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x, this.y + this.cellSize,
      this.x + this.cellSize, this.y));

    return lLineSegments;
  }

  /**
   * 
   * @returns Gets the L outline as an array of points (each point is [x, y])
   */
  getLOutlinePoints(){
    let lPoints = new Array();

    // Top part
    lPoints.push([this.x, this.y + this.cellSize]);
    lPoints.push([this.x + this.cellSize, this.y]);
    lPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);

    // Right side
    lPoints.push([this.x + 5 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    lPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 1 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);

    return lPoints
  }

  /**
   * 
   * @returns gets the M outline as an array of line segments
   */
   getMOutlineLineSegments(){
    let mLineSegments = new Array();
    
    mLineSegments.push(new LineSegment(this.x + this.cellSize, this.y, 
      this.x + 3 * this.cellSize, this.y + 2 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 2 * this.cellSize, 
      this.x + 5 * this.cellSize, this.y));

    mLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y, 
      this.x + 6 * this.cellSize, this.y + this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 6 * this.cellSize, this.y + this.cellSize, 
      this.x + 6 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 6 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + 5 * this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y + 4 * this.cellSize, 
      this.x + 4 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 4 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + 3 * this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 4 * this.cellSize, 
      this.x + 2 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 2 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + this.cellSize, this.y + 4 * this.cellSize, 
      this.x, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x, this.y + 3 * this.cellSize, 
      this.x, this.y + this.cellSize));

    mLineSegments.push(new LineSegment(this.x, this.y + this.cellSize, 
      this.x + this.cellSize, this.y));

    return mLineSegments;
  }

  /**
   * 
   * @returns Gets the M outline as an array of points (each point is [x, y])
   */
  getMOutlinePoints(){
    let mPoints = new Array();

    // Top part
    mPoints.push([this.x, this.y + this.cellSize]);
    mPoints.push([this.x + this.cellSize, this.y]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + this.cellSize]);

    // Right part
    mPoints.push([this.x + 6 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    mPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 1 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 3 * this.cellSize]);

    // Left part
    mPoints.push([this.x + 0 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);
   
    return mPoints;
  }

  /**
   * Gives each triangle its own random color from the Makeability Lab palette,
   * using that same color for both fill and stroke.
   *
   * @param {Triangle[]} triangles - The triangles to recolor.
   * @param {boolean} [isFillVisible=true] - Whether the fill is drawn.
   * @param {boolean} [isStrokeVisible=true] - Whether the stroke is drawn.
   */
  static setRandomColors(triangles, isFillVisible=true, isStrokeVisible=true){
    for(const tri of triangles){
      const fillColor = MakeabilityLabLogoColorer.getRandomOriginalColor();
      MakeabilityLabLogo.setColors([tri], fillColor, fillColor, isFillVisible, isStrokeVisible);
    }
  }

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
  static setColors(triangles, fillColor, strokeColor, isFillVisible=true, isStrokeVisible=true){
    for(const tri of triangles){
      tri.fillColor = fillColor;
      tri.startFillColor = fillColor;
      tri.endFillColor = fillColor;
      tri.strokeColor = strokeColor;
      tri.isFillVisible = isFillVisible;
      tri.isStrokeVisible = isStrokeVisible;
    }
  }

  static createMakeabilityLabLogoCellArray(x, y, triangleSize) {
    let mlLogo = new Array(MakeabilityLabLogo.numRows);

    // Initialize the make lab logo grid
    for (let row = 0; row < mlLogo.length; row++) {
      mlLogo[row] = new Array(MakeabilityLabLogo.numCols);
    }

    mlLogo[0] = MakeabilityLabLogo.createMakeabilityLabTopRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[1] = MakeabilityLabLogo.createMakeabilityLab2ndRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[2] = MakeabilityLabLogo.createMakeabilityLab3rdRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[3] = MakeabilityLabLogo.createMakeabilityLabBottomRow(x, y, triangleSize);

    return mlLogo;
  }

  static createMakeabilityLabTopRow(x, y, triangleSize) {
    let topRow = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize, TriangleDir.TopLeft);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize, TriangleDir.TopRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    return topRow;
  }

  static createMakeabilityLab2ndRow(x, y, triangleSize) {
    let row2 = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    return row2;
  }

  static createMakeabilityLab3rdRow(x, y, triangleSize) {
    let row3 = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < row3.length; col++) {
      let triDir = TriangleDir.TopLeft;
      if (col % 2 !== 0) {
        triDir = TriangleDir.TopRight;
      }
      row3[col] = Cell.createCell(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return row3;
  }

  static createMakeabilityLabBottomRow(x, y, triangleSize) {
    let botRow = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < botRow.length; col++) {
      let triDir = TriangleDir.TopRight;
      if (col % 2 !== 0) {
        triDir = TriangleDir.TopLeft;
      }
      botRow[col] = Cell.createCellWithTopTriangleOnly(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return botRow;
  }

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
  static isMShadowTriangle(row, col, triNum){
    return (row == 2 && col == 1 && triNum == 2) ||
          (row == 3 && col == 1 && triNum == 1) ||
          (row == 2 && col == 4 && triNum == 2) ||
          (row == 3 && col == 4 && triNum == 1);
  }

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
  static isLTriangle(row, col, triNum) {
    return (row == 0 && col == 0 && triNum == 2) ||
           (row == 0 && col == 1 && triNum == 2) ||
           (row == 1 && col == 0 && triNum == 1) ||
           (row == 1 && col == 1 && triNum == 1) ||
           (row == 1 && col == 1 && triNum == 2) ||
           (row == 1 && col == 2 && triNum == 2) ||
           (row == 2 && col == 1 && triNum == 1) ||
           (row == 2 && col == 2 && triNum == 1) ||
           (row == 2 && col == 2 && triNum == 2) ||
           (row == 3 && col == 2 && triNum == 1) ||
           (row == 3 && col == 3 && triNum == 1) ||
           (row == 2 && col == 3 && triNum == 1) ||
           (row == 2 && col == 3 && triNum == 2) ||
           (row == 1 && col == 3 && triNum == 2) ||
           (row == 2 && col == 4 && triNum == 1) ||
           (row == 1 && col == 4 && triNum == 2);
  }

}

const TriangleDir = {
  TopLeft: 'TopLeft',
  TopRight: 'TopRight',
  BottomLeft: 'BottomLeft',
  BottomRight: 'BottomRight'
};

class Cell {
  /**
   * Creates an instance of the class with two triangles.
   * @constructor
   * @param {Object} triangle1 - The first triangle object.
   * @param {Object} triangle2 - The second triangle object.
   */
  constructor(triangle1, triangle2) {
    this.tri1 = triangle1;
    this.tri2 = triangle2;

    this.drawBoundingBox = false; // for debugging
  }

  /**
   * Sets the draw debug information flag for this cell
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawBoundingBox = drawDebugInfo;
    this.tri1.setDrawDebugInfo(drawDebugInfo);
    this.tri2.setDrawDebugInfo(drawDebugInfo);
  }

  /**
   * Gets the x-coordinate of the cell
   * @returns {number} The x-coordinate of the cell.
   */
  get x() {
    return this.tri1.x;
  }

  /**
   * Sets the x-coordinate for the cell
   * 
   * @param {number} x - The x-coordinate to set.
   */
  set x(x){
    this.tri1.x = x;
    this.tri2.x = x;
  }

  /**
   * Gets the y-coordinate of the cell
   * @returns {number} The y-coordinate of the cell.
   */
  get y() {
    return this.tri1.y;
  }

  /**
   * Sets the y-coordinate for the cell
   * 
   * @param {number} y - The y-coordinate to set.
   */
  set y(y){
    this.tri1.y = y;
    this.tri2.y = y;
  }

  /**
   * Gets the size of the cell. Cells are always square.
   * @type {number}
   */
  get size() {
    return this.tri1.size;
  }

  /**
   * Sets the size of the cell.
   * 
   * @param {number} size - The size to set for the cell.
   */
  set size(size){
    this.tri1.size = size;
    this.tri2.size = size;
  }


  /**
   * Sets the fill and stroke colors for the cell.
   *
   * @param {string} fillColor - The color to be used for filling.
   * @param {string} [strokeColor] - The color to be used for the stroke. 
   *    If not provided, the fillColor will be used as the stroke color.
   */
  setColors(fillColor, strokeColor){
    this.setFillColor(fillColor);

    if(strokeColor){
      this.setStrokeColor(strokeColor);
    }else {
      this.setStrokeColor(fillColor);
    }
  }

  /**
   * Sets the fill color for the cell.
   * 
   * @param {string} fillColor - The fill color
   */
  setFillColor(fillColor){
    this.tri1.fillColor = fillColor;
    this.tri2.fillColor = fillColor;
  }

  /**
   * Sets the stroke width for the logo's triangles.
   *
   * @param {number} strokeWidth - The width of the stroke to be applied to the triangles.
   */
  setStrokeWidth(strokeWidth){
    this.tri1.strokeWidth = strokeWidth;
    this.tri2.strokeWidth = strokeWidth;
  }

  /**
   * Sets the stroke color for the cell.
   * 
   * @param {string} strokeColor - The stroke color
   */
  setStrokeColor(strokeColor){
    this.tri1.strokeColor = strokeColor;
    this.tri2.strokeColor = strokeColor;
  }

  /**
   * Sets the visibility of the cell
   *
   * @param {boolean} isVisible - A boolean indicating whether the cell is visible
   */
  setVisibility(isVisible){
    this.tri1.visible = isVisible;
    this.tri2.visible = isVisible;
  }

  /**
   * Calculates the bounding box of the cell, encompassing all visible triangles.
   * If both triangles are visible, it returns the union of their bounding boxes.
   * If only one is visible, it returns that triangle's bounding box.
   *
   * @returns {Object} An object containing the {x, y, width, height} of the bounding box. 
   * Returns a zero-sized box {x:0, y:0, width:0, height:0} if no triangles are visible.
   */
  getBoundingBox() {
    const b1 = this.tri1.visible ? this.tri1.getBoundingBox() : null;
    const b2 = this.tri2.visible ? this.tri2.getBoundingBox() : null;
    if (b1 && b2) {
      const minX = Math.min(b1.x, b2.x);
      const minY = Math.min(b1.y, b2.y);
      const maxX = Math.max(b1.x + b1.width, b2.x + b2.width);
      const maxY = Math.max(b1.y + b1.height, b2.y + b2.height);
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    return b1 || b2 || { x: 0, y: 0, width: 0, height: 0 };
  }

  /**
   * Draws the cells on the canvas
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    if (this.tri1.visible) {
      this.tri1.draw(ctx);
    }

    if (this.tri2.visible) {
      this.tri2.draw(ctx);
    }

    ctx.save();
    if (this.drawBoundingBox){
      const boundingBox = this.getBoundingBox();
      ctx.setLineDash([3, 4]); // Dots of 3 pixel, gaps of 4 pixels
      ctx.strokeStyle = 'rgba(0, 0, 240, 0.5)';
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    }
    ctx.restore();
  }

  /**
   * Creates an empty cell with two invisible triangles.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {TriangleDir} [topTriangleDir=TriangleDir.TopLeft] - The direction of the top triangle.
   * @returns {Cell} A new cell containing two invisible triangles.
   */
  static createEmptyCell(x, y, size, topTriangleDir=TriangleDir.TopLeft) {
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri1.visible = false;
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  /**
   * Creates a cell with only the top triangle visible.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {string} topTriangleDir - The direction of the top triangle. See TriangleDir for possible values.
   * @returns {Cell} A cell object with the top triangle visible and the bottom triangle hidden.
   */
  static createCellWithTopTriangleOnly(x, y, size, topTriangleDir) {
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  /**
   * Creates a cell with only the bottom triangle visible.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {string} botTriangleDir - The direction of the bottom triangle. See TriangleDir for possible values.
   * @returns {Cell} A new cell with the specified bottom triangle.
   */
  static createCellWithBottomTriangleOnly(x, y, size, botTriangleDir) {
    let tri1 = new Triangle(x, y, size, Triangle.getOppositeDirection(botTriangleDir));
    let tri2 = new Triangle(x, y, size, botTriangleDir);
    tri1.visible = false;
    return new Cell(tri1, tri2);
  }

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
  static createCell(x, y, size, triangle1Dir, triangle2Dir) {
    let tri1 = new Triangle(x, y, size, triangle1Dir);

    if (!triangle2Dir) {
      triangle2Dir = Triangle.getOppositeDirection(triangle1Dir);
    }
    let tri2 = new Triangle(x, y, size, triangle2Dir);
    return new Cell(tri1, tri2);
  }
}

class Triangle {
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
  constructor(x, y, size, direction, fillColor = 'white',
    strokeColor = 'black', strokeWidth = 1, visible = true) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = direction;
    this.angle = 0;

    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWidth = strokeWidth;
    this.visible = visible;

    this.isFillVisible = true;
    this.isStrokeVisible = true;

    this.drawCellOutline = false; // for debugging
    this.drawBoundingBox = false; // for debugging
  }

  /**
   * Sets the draw debug information flag for this triangle
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawCellOutline = drawDebugInfo; 
    this.drawBoundingBox = drawDebugInfo;
  }

  /**
   * Sets the fill and stroke colors for the triangle.
   *
   * @param {string} fillColor - The color to be used for filling.
   * @param {string} [strokeColor] - The color to be used for the stroke. If not provided, the fillColor will be used as the stroke color.
   */
  setColors(fillColor, strokeColor){
    this.fillColor = fillColor;

    if(strokeColor){
      this.strokeColor = strokeColor;
    }else {
      this.strokeColor = fillColor;
    }
  }

  /**
   * Draws a triangle on the given canvas context based on the object's properties.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    if (!this.visible) return;

    ctx.save();

    if (this.isFillVisible && this.fillColor) {
      ctx.fillStyle = this.fillColor;
    }

    if (this.isStrokeVisible && this.strokeColor && this.strokeWidth > 0) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;
    } 

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);

    ctx.beginPath();
    switch (this.direction) {
      case TriangleDir.BottomLeft:
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(this.size, this.size);
        break;
      case TriangleDir.BottomRight:
        ctx.moveTo(0, this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(this.size, 0);
        break;
      case TriangleDir.TopRight:
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(this.size, this.size);
        break;
      case TriangleDir.TopLeft:
      default:
        ctx.moveTo(0, this.size);
        ctx.lineTo(0, 0);
        ctx.lineTo(this.size, 0);
        break;
    }
    ctx.closePath();

    if (this.isFillVisible && this.fillColor) {
      ctx.fill();
    }

    if (this.isStrokeVisible && this.strokeColor && this.strokeWidth > 0) {
      ctx.stroke();
    }

    // useful for debugging
    if (this.drawCellOutline) {
      ctx.setLineDash([2, 3]); // Dots of 2 pixel, gaps of 3 pixels
      ctx.strokeStyle = 'rgba(0, 200, 0, 0.5)';
      ctx.strokeRect(0, 0, this.size, this.size);
    }

    ctx.restore();

    ctx.save();
    if (this.drawBoundingBox){
      const boundingBox = this.getBoundingBox();
      ctx.setLineDash([1, 5]); // Dots of 1 pixel, gaps of 5 pixels
      ctx.strokeStyle = 'rgba(200, 0, 30, 0.8)';
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    }
    ctx.restore();
  }

  /**
   * Calculates the bounding box of the triangle, taking into account its location, 
   * size, and angle
   *
   * @returns {Object} An object containing the coordinates of the bounding box.
   */
  getBoundingBox() {
    const rad = this.angle * Math.PI / 180;

    // Calculate the vertices of the triangle based on its direction
    let vertices;
    switch (this.direction) {
      case TriangleDir.BottomLeft:
        vertices = [
          { x: 0, y: 0 },
          { x: 0, y: this.size },
          { x: this.size, y: this.size }
        ];
        break;
      case TriangleDir.BottomRight:
        vertices = [
          { x: 0, y: this.size },
          { x: this.size, y: this.size },
          { x: this.size, y: 0 }
        ];
        break;
      case TriangleDir.TopRight:
        vertices = [
          { x: 0, y: 0 },
          { x: this.size, y: 0 },
          { x: this.size, y: this.size }
        ];
        break;
      case TriangleDir.TopLeft:
      default:
        vertices = [
          { x: 0, y: this.size },
          { x: 0, y: 0 },
          { x: this.size, y: 0 }
        ];
        break;
    }

    // Rotate the vertices around the origin and translate to the triangle's position
    const rotatedVertices = vertices.map(vertex => {
      const rotatedX = vertex.x * Math.cos(rad) - vertex.y * Math.sin(rad);
      const rotatedY = vertex.x * Math.sin(rad) + vertex.y * Math.cos(rad);
      return {
        x: this.x + rotatedX,
        y: this.y + rotatedY
      };
    });

    // Find the min and max x and y values
    const minX = Math.min(...rotatedVertices.map(vertex => vertex.x));
    const maxX = Math.max(...rotatedVertices.map(vertex => vertex.x));
    const minY = Math.min(...rotatedVertices.map(vertex => vertex.y));
    const maxY = Math.max(...rotatedVertices.map(vertex => vertex.y));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Returns the opposite direction of the given triangle direction.
   *
   * @param {TriangleDir} triangleDir - The current direction of the triangle.
   * @returns {TriangleDir} - The opposite direction of the given triangle direction.
   */
  static getOppositeDirection(triangleDir) {
    switch (triangleDir) {
      case TriangleDir.BottomLeft:
        return TriangleDir.TopRight;
      case TriangleDir.BottomRight:
        return TriangleDir.TopLeft;
      case TriangleDir.TopRight:
        return TriangleDir.BottomLeft;
      case TriangleDir.TopLeft:
      default:
        return TriangleDir.BottomRight;
    }
  }

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
  static createTriangle(tri){
    return new Triangle(tri.x, tri.y, tri.size, tri.direction,
      tri.fillColor, tri.strokeColor, tri.strokeWidth, tri.visible);
  }
}

class Grid {

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
  constructor(gridWidth, gridHeight, triangleSize,
              strokeColor = 'rgba(200, 200, 200, 0.5)', fillColor = null,
              offsetX = 0, offsetY = 0) {

    this.gridArray = Grid.createGrid(gridWidth, gridHeight, triangleSize,
                                     strokeColor, fillColor, offsetX, offsetY);
    this.visible = true;

    // setFillColor is a no-op when fillColor is null, but calling it here
    // keeps construction consistent if a subclass overrides it later.
    this.setFillColor(fillColor);
  }

  /**
   * Draws the grid onto the provided canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    if (!this.visible) { return; }

    for (let row = 0; row < this.gridArray.length; row++) {
      for (let col = 0; col < this.gridArray[row].length; col++) {
        this.gridArray[row][col].draw(ctx);
      }
    }
  }

  /**
   * Sets the stroke color for all triangles in the grid.
   *
   * @param {string} strokeColor - The new stroke color.
   */
  setStrokeColor(strokeColor) {
    for (let row = 0; row < this.gridArray.length; row++) {
      for (let col = 0; col < this.gridArray[row].length; col++) {
        this.gridArray[row][col].tri1.strokeColor = strokeColor;
        this.gridArray[row][col].tri2.strokeColor = strokeColor;
      }
    }
  }

  /**
   * Sets the fill color for all triangles in the grid.
   *
   * @param {string|null} fillColor - The new fill color, or null for transparent.
   */
  setFillColor(fillColor) {
    for (let row = 0; row < this.gridArray.length; row++) {
      for (let col = 0; col < this.gridArray[row].length; col++) {
        this.gridArray[row][col].tri1.fillColor = fillColor;
        this.gridArray[row][col].tri2.fillColor = fillColor;
      }
    }
  }

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
  static createGrid(gridWidth, gridHeight, triangleSize,
                  strokeColor, fillColor,
                  offsetX = 0, offsetY = 0) {

    // Backtrack from the offset to find the first cell origin that is <= 0,
    // so the grid covers the full canvas including the top and left edges.
    // e.g. offsetX=50, triangleSize=100 → startX = 50 - 1*100 = -50
    const startX = offsetX - Math.ceil(offsetX / triangleSize) * triangleSize;
    const startY = offsetY - Math.ceil(offsetY / triangleSize) * triangleSize;

    // Size the grid from the adjusted start point to ensure full coverage.
    const numGridColumns = Math.ceil((gridWidth  - startX) / triangleSize);
    const numGridRows    = Math.ceil((gridHeight - startY) / triangleSize);

    let grid = new Array(numGridRows);

    for (let row = 0; row < grid.length; row++) {
      grid[row] = new Array(numGridColumns);

      for (let col = 0; col < grid[row].length; col++) {

        const cellX = startX + col * triangleSize;
        const cellY = startY + row * triangleSize;

        // Checkerboard parity: determine orientation from absolute cell index
        // so the pattern is consistent across the whole canvas regardless of
        // where the grid starts. We use the cell's position relative to the
        // logo origin (offsetX/offsetY) to compute the canonical index.
        const colIndex = Math.round((cellX - offsetX) / triangleSize);
        const rowIndex = Math.round((cellY - offsetY) / triangleSize);
        const isEvenCell = (rowIndex % 2 === 0 && colIndex % 2 === 0) ||
                          (rowIndex % 2 !== 0 && colIndex % 2 !== 0);
        const triDir = isEvenCell ? TriangleDir.TopRight : TriangleDir.TopLeft;

        const cell = Cell.createCell(cellX, cellY, triangleSize, triDir);

        cell.tri1.strokeColor = strokeColor;
        cell.tri2.strokeColor = strokeColor;

        if (fillColor) {
          cell.tri1.fillColor = fillColor;
          cell.tri2.fillColor = fillColor;
        }

        grid[row][col] = cell;
      }
    }

    return grid;
  }
}

const OriginalColorPaletteRGB = {
  Blue: "rgb(135, 202, 228)",
  BlueGray: "rgb(147, 169, 207)",
  Purple: "rgb(171, 147, 197)",
  Green: "rgb(148, 206, 146)",
  Orange: "rgb(235, 185, 130)",
  RedPurple: "rgb(207, 145, 166)",
  Pink: "rgb(237, 162, 163)",
  YellowGreen: "rgb(239, 226, 127)",
  LightGreen: "rgb(209, 226, 133)",
  BlueGreen: "rgb(147, 211, 202)"
};

const ORIGINAL_COLOR_ARRAY = [
  OriginalColorPaletteRGB.Blue, 
  OriginalColorPaletteRGB.BlueGray,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.Purple,
  OriginalColorPaletteRGB.Green,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.LightGreen,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.RedPurple,
  OriginalColorPaletteRGB.BlueGreen,
  OriginalColorPaletteRGB.Pink
];


/**
 * Class representing a colorer for the Makeability Lab logo.
 */
class MakeabilityLabLogoColorer {

  /**
   * Gets a random color from the original color palette.
   * @returns {string} A random color in RGB format from the original color palette.
   */
  static getRandomOriginalColor(){
    return MakeabilityLabLogoColorer.getRandomColorFromPalette(OriginalColorPaletteRGB);
  }

  /**
   * Gets a random color from the specified color palette.
   * If no palette is provided, it defaults to the original color palette.
   * @param {Object} [palette] - An optional color palette object where keys are color names and values are RGB strings.
   * @returns {string} A random color in RGB format from the specified or default color palette.
   */
  static getRandomColorFromPalette(palette){
    if(!palette){
      palette = OriginalColorPaletteRGB;
    }

    const keys = Object.keys(palette);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return palette[randKey];
  }
}

/**
 * Array utility functions.
 * 
 * By Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
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
function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}

// morph-paths.js — pluggable trajectory shapes for the Makeability Lab logo
// morph / reverse-explosion animations.
//
// By default, MakeabilityLabLogoMorpher moves every triangle along a straight
// line from its scattered start to its destination in the logo (only the
// *timing* is eased). A "path" lets each triangle instead travel a curved
// trajectory — an arc, a random Bézier, or an inward spiral — while the morpher
// still owns timing, easing, colour, and stagger.
//
// A path is a small object with two methods:
//
//   prepare(tri, ctx)   Called once per triangle when the start/end states are
//                       set (in morpher.reset / resetFromArt). May stash
//                       per-triangle data on `tri._path` (e.g. a random control
//                       point) so the trajectory is stable for the whole morph.
//   position(tri, t)    Called every frame with the eased progress `t` in
//                       [0, 1]. Returns {x, y}: the triangle's position at `t`.
//                       Reads `tri._start`, `tri._dest`, and `tri._path`.
//
// `ctx` passed to prepare() is:
//   { centroidX, centroidY, canvasWidth, canvasHeight, index, count }
// where (centroidX, centroidY) is the centre of the assembled logo.
//
// Each path is a factory so callers can tune it, e.g. `arcPath({ amplitude: 0.5 })`.
// The MORPH_PATHS registry maps short names → factories for easy UI wiring.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js


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
function linearPath() {
  return {
    prepare() {},
    position(tri, t) {
      const s = tri._start, d = tri._dest;
      return { x: lerp(s.x, d.x, t), y: lerp(s.y, d.y, t) };
    },
  };
}

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
function arcPath({ amplitude = 0.35, randomizeSign = true } = {}) {
  return {
    prepare(tri) {
      const s = tri._start, d = tri._dest;
      const dist = Math.hypot(d.x - s.x, d.y - s.y);
      const sign = randomizeSign ? (random(0, 1) < 0.5 ? -1 : 1) : 1;
      // Jitter the amplitude a little so arcs don't look mechanically uniform.
      tri._path = { amp: sign * amplitude * dist * random(0.6, 1.0) };
    },
    position(tri, t) {
      const s = tri._start, d = tri._dest;
      const x = lerp(s.x, d.x, t);
      const y = lerp(s.y, d.y, t);
      // Unit vector perpendicular to the start→dest direction.
      const dx = d.x - s.x, dy = d.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      const offset = Math.sin(Math.PI * t) * tri._path.amp;
      return { x: x + (-dy / len) * offset, y: y + (dx / len) * offset };
    },
  };
}

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
function bezierPath({ spread = 0.4 } = {}) {
  return {
    prepare(tri) {
      const s = tri._start, d = tri._dest;
      const dist = Math.hypot(d.x - s.x, d.y - s.y);
      const r = spread * dist;
      tri._path = {
        cx: (s.x + d.x) / 2 + random(-r, r),
        cy: (s.y + d.y) / 2 + random(-r, r),
      };
    },
    position(tri, t) {
      const s = tri._start, d = tri._dest, p = tri._path;
      const u = 1 - t;
      return {
        x: u * u * s.x + 2 * u * t * p.cx + t * t * d.x,
        y: u * u * s.y + 2 * u * t * p.cy + t * t * d.y,
      };
    },
  };
}

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
function spiralPath({ turns = 1 } = {}) {
  const TWO_PI = Math.PI * 2;
  return {
    prepare(tri, ctx) {
      const s = tri._start, d = tri._dest;
      const cx = ctx.centroidX, cy = ctx.centroidY;
      const a0 = Math.atan2(s.y - cy, s.x - cx);
      const a1 = Math.atan2(d.y - cy, d.x - cx);
      // Shortest angular delta, then add full turns for a coherent swirl.
      let delta = (a1 - a0) % TWO_PI;
      if (delta > Math.PI) delta -= TWO_PI;
      if (delta < -Math.PI) delta += TWO_PI;
      tri._path = {
        cx, cy,
        a0,
        da: delta + turns * TWO_PI,
        r0: Math.hypot(s.x - cx, s.y - cy),
        r1: Math.hypot(d.x - cx, d.y - cy),
      };
    },
    position(tri, t) {
      const p = tri._path;
      const a = p.a0 + p.da * t;
      const r = lerp(p.r0, p.r1, t);
      return { x: p.cx + r * Math.cos(a), y: p.cy + r * Math.sin(a) };
    },
  };
}

/**
 * Registry of path factories keyed by short name, for wiring to UI controls.
 * Each value is a factory: call it (optionally with options) to get a MorphPath.
 *
 * @type {Object<string, function(Object=): MorphPath>}
 */
const MORPH_PATHS = {
  linear: linearPath,
  arc:    arcPath,
  bezier: bezierPath,
  spiral: spiralPath,
};

// =============================================================================
// MakeabilityLabLogoMorpher
// =============================================================================

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
class MakeabilityLabLogoMorpher {

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
  constructor(x, y, triangleSize,
    startFillColor   = 'rgb(255, 255, 255, 0.5)',
    startStrokeColor = 'rgba(0, 0, 0, 0.6)') {

    // ------------------------------------------------------------------
    // Internal logo instances
    // ------------------------------------------------------------------

    /**
     * The assembled "target" logo — never drawn directly (visible=false),
     * but its triangles define the end state for every morph.
     * @type {MakeabilityLabLogo}
     */
    this.makeLabLogo = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogo.visible = false;

    /**
     * A second logo instance used solely for the L-outline overlay and label
     * animations. Its triangles are NOT drawn — we draw _animTris instead.
     * Keeping it as a full logo object gives us free access to drawLOutline()
     * and drawLabel() with their built-in opacity/position tracking.
     * @type {MakeabilityLabLogo}
     */
    this.makeLabLogoAnimated = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogoAnimated.isLOutlineVisible = false;
    this.makeLabLogoAnimated.isMOutlineVisible = false;
    this.makeLabLogoAnimated.isLabelVisible    = true;

    // Keep the L-triangle strokes subtle on the target logo
    this.makeLabLogo.setLTriangleStrokeColor('rgb(240, 240, 240)');
    this.makeLabLogoAnimated.areLTriangleStrokesVisible = true;

    // Label must be enabled on the target too so height/centering calculations
    // stay consistent between the two internal logos.
    this.makeLabLogo.isLabelVisible = true;

    // ------------------------------------------------------------------
    // Animated triangle pool
    // ------------------------------------------------------------------

    /**
     * The active set of Triangle objects rendered each frame.
     * Populated by reset() or resetFromArt(). Each triangle carries:
     *   ._start  — snapshot of start-state properties
     *   ._dest   — snapshot of end-state (logo) properties
     * update() lerps between them; draw() renders them directly.
     * @type {Triangle[]}
     */
    this._animTris = [];

    // ------------------------------------------------------------------
    // Art-mode message (set by resetFromArt, null otherwise)
    // ------------------------------------------------------------------

    /**
     * Message string from the active TriangleArt (e.g. "Happy Holidays!").
     * Drawn fading out as lerpAmt increases. Null when in random mode.
     * @type {string|null}
     */
    this._artMessage      = null;

    /** @type {boolean} Whether to display the art message. */
    this._artMessageVisible = true;

    /** @type {string|null} */
    this._artMessageColor = null;

    /** @type {number|null} Font size used to draw the art message. */
    this._artMessageFontSize = null;

    // ------------------------------------------------------------------
    // Random-mode explode flags
    // Ignored by resetFromArt() — art positions are always used as-is.
    // ------------------------------------------------------------------

    this.explodeX           = true;
    this.explodeY           = true;
    this.explodeSize        = true;
    this.explodeAngle       = true;
    this.explodeFillColor   = true;
    this.explodeStrokeColor = true;
    this.explodeStrokeWidth = true;

    /** Fill color for random-mode start state / art-mode fallback. @type {string} */
    this.startFillColor = startFillColor;

    /** Stroke color for random-mode start state / art-mode fallback. @type {string} */
    this.startStrokeColor = startStrokeColor;

    // ------------------------------------------------------------------
    // Easing
    // ------------------------------------------------------------------

    /**
     * Applied to spatial properties (x, y, size, angle). Colors always
     * interpolate linearly regardless of this setting.
     * @type {function(number): number}
     */
    this.easingFunction = easeOutCubic;

    // ------------------------------------------------------------------
    // Trajectory (path) + stagger
    // ------------------------------------------------------------------

    /**
     * The trajectory each triangle follows from its scattered start to its
     * logo destination. Defaults to a straight line (original behaviour).
     * Set to any path from morph-paths.js (e.g. arcPath(), spiralPath()) and
     * then call reset()/resetFromArt() so the new path can prepare per-triangle
     * data.
     * @type {import('./morph-paths.js').MorphPath}
     */
    this.pathFunction = linearPath();

    /**
     * Per-piece arrival stagger in [0, 1). 0 = every triangle animates in
     * lockstep (original behaviour). Higher values spread out arrival times so
     * the logo assembles from the inside out — triangles nearer the logo centre
     * start (and finish) sooner. Clamped to 0.95 to keep the window non-zero.
     * @type {number}
     */
    this.stagger = 0;

    // ------------------------------------------------------------------
    // L-outline animation
    // ------------------------------------------------------------------

    /**
     * Fraction of overall progress at which the L outline begins fading in.
     * E.g. 0.85 → outline appears at 85% of the morph.
     * @type {number}
     */
    this.lOutlineAppearThreshold = 0.85;

    // ------------------------------------------------------------------
    // Label animation
    // ------------------------------------------------------------------

    /**
     * Fraction of overall progress at which the label begins fading in.
     * @type {number}
     */
    this.labelAppearThreshold = 0.7;

    /**
     * Vertical slide distance during the label entrance, as a fraction of
     * the label font size. Label slides upward as it fades in.
     * @type {number}
     */
    this.labelSlideDistanceFraction = 0.4;

    // Internal: cached lerpAmt from the most recent update() call,
    // used by the label / message draw helpers.
    this._currentLerpAmt = 0;
  }

  // ===========================================================================
  // Getters
  // ===========================================================================

  /** Final assembled width of the logo.                    @returns {number} */
  get finalWidth()  { return this.makeLabLogo.width;  }

  /** Final assembled height of the logo (includes label). @returns {number} */
  get finalHeight() { return this.makeLabLogo.height; }

  /** Whether the art message (e.g. "Happy Valentine's Day") is shown. */
  get artMessageVisible() { return this._artMessageVisible; }
  set artMessageVisible(visible) { this._artMessageVisible = !!visible; }

  // ===========================================================================
  // Layout helpers — delegate symmetrically to both internal logos
  // ===========================================================================

  /** @param {number} w @param {number} h @param {boolean} [alignToGrid=false] */
  fitToCanvas(w, h, alignToGrid = false) {
    this.makeLabLogo.fitToCanvas(w, h, alignToGrid);
    this.makeLabLogoAnimated.fitToCanvas(w, h, alignToGrid);
  }

  /** @param {number} logoWidth */
  setLogoSize(logoWidth) {
    this.makeLabLogo.setLogoSize(logoWidth);
    this.makeLabLogoAnimated.setLogoSize(logoWidth);
  }

  /** Sets logo size on the end-state logo only. @param {number} finalWidth */
  setLogoSizeEndState(finalWidth) {
    this.makeLabLogo.setLogoSize(finalWidth);
  }

  /** @param {number} x */
  setXPosition(x) {
    this.makeLabLogo.x = x;
    this.makeLabLogoAnimated.x = x;
  }

  /** @param {number} y */
  setYPosition(y) {
    this.makeLabLogo.y = y;
    this.makeLabLogoAnimated.y = y;
  }

  /** @param {number} x @param {number} y */
  setLogoPosition(x, y) {
    this.makeLabLogo.setLogoPosition(x, y);
    this.makeLabLogoAnimated.setLogoPosition(x, y);
  }

  /** @param {number} w @param {number} h @param {boolean} [alignedToGrid=false] */
  centerLogo(w, h, alignedToGrid = false) {
    this.makeLabLogo.centerLogo(w, h, alignedToGrid);
    this.makeLabLogoAnimated.centerLogo(w, h, alignedToGrid);
  }

  // ===========================================================================
  // Start-state initialization
  // ===========================================================================

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
  reset(canvasWidth, canvasHeight) {
    // Clear art-mode message — we're in random mode now
    this._artMessage      = null;
    this._artMessageColor = null;

    // CHANGE: Filter for visible triangles only
    const logoTris = this.makeLabLogo.getAllTriangles().filter(t => t.visible);
    const animTris = this.makeLabLogoAnimated.getAllTriangles().filter(t => t.visible);
    
    const endSize  = this.makeLabLogo.cellSize;

    // Set colors on the filtered pool
    animTris.forEach(tri => tri.setColors(this.startFillColor, this.startStrokeColor));

    this._animTris = animTris.map((tri, i) => {
      const dest     = logoTris[i];
      const randSize = this.explodeSize
        ? random(endSize / 2, endSize * 3)
        : endSize;

      tri.x           = this.explodeX           ? random(randSize, canvasWidth  - randSize) : dest.x;
      tri.y           = this.explodeY           ? random(randSize, canvasHeight - randSize) : dest.y;
      tri.angle       = this.explodeAngle       ? random(0, 540)  : 0;
      tri.size        = randSize;
      tri.fillColor   = this.explodeFillColor   ? tri.fillColor   : dest.fillColor;
      tri.strokeColor = this.explodeStrokeColor ? tri.strokeColor : dest.strokeColor;
      tri.strokeWidth = this.explodeStrokeWidth ? tri.strokeWidth : dest.strokeWidth;

      tri._start = _snapshot(tri);
      tri._dest  = _snapshot(dest, 0);
      return tri;
    });

    this._preparePaths(canvasWidth, canvasHeight);
  }

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
  resetFromArt(art, canvasWidth, canvasHeight) {
    // Store the art message so draw() can fade it out during the morph
    this._artMessage         = art.message      ?? null;
    this._artMessageColor    = art.messageColor ?? '#000000';
    this._artMessageFontSize = art.triangleSize  * 0.7;

    const endSize   = this.makeLabLogo.cellSize;
    const logoBox   = this.makeLabLogo.getBoundingBox();
    const sourceTris = art.getAllTriangles(); // only visible triangles

    // -----------------------------------------------------------------
    // Build direction-grouped destination map from the logo triangles.
    // Shuffle within each group so every call produces a fresh mapping.
    // -----------------------------------------------------------------
    const visibleLogoTris = this.makeLabLogo.getAllTriangles().filter(t => t.visible);
    const destByDir = _groupByDirection(visibleLogoTris);
    for (const group of destByDir.values()) shuffle(group);

    const destIndex = new Map(); // round-robin index per direction

    // -----------------------------------------------------------------
    // Reuse existing Triangle objects if the count matches (reduces GC).
    // Otherwise allocate fresh clones from the art triangles.
    // -----------------------------------------------------------------
    const reusingPool = this._animTris.length === sourceTris.length;

    this._animTris = sourceTris.map((src, i) => {
      // Reuse or clone
      const tri = reusingPool ? this._animTris[i] : Triangle.createTriangle(src);

      // Copy source position / color onto the (possibly reused) triangle
      tri.x           = src.x;
      tri.y           = src.y;
      tri.size        = src.size ?? endSize;
      tri.angle       = 0;  // art is flat — no initial rotation
      tri.fillColor   = src.fillColor;
      tri.strokeColor = src.strokeColor;
      tri.strokeWidth = src.strokeWidth ?? 1;
      tri.direction   = src.direction;
      tri.visible     = true;

      tri._start = _snapshot(tri);

      // Assign destination: matching logo triangle (round-robin), or a
      // random position within the logo bounding box as a graceful fallback.
      const dests = destByDir.get(src.direction);

      if (dests && dests.length > 0) {
        const idx  = (destIndex.get(src.direction) ?? 0) % dests.length;
        destIndex.set(src.direction, idx + 1);
        tri._dest = _snapshot(dests[idx]);
      } else {
        // Fallback: converge to a random point inside the logo bounding box
        // so unmatched triangles still appear to join the logo.
        tri._dest = {
          x:           random(logoBox.x, logoBox.x + logoBox.width),
          y:           random(logoBox.y, logoBox.y + logoBox.height),
          size:        endSize,
          angle:       0,
          fillColor:   this.startFillColor,
          strokeColor: this.startStrokeColor,
          strokeWidth: 1,
        };
      }

      return tri;
    });

    this._preparePaths(canvasWidth, canvasHeight);
  }

  // ===========================================================================
  // Path / stagger preparation
  // ===========================================================================

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
  _preparePaths(canvasWidth, canvasHeight) {
    // Remember canvas dims so setPath() can re-prepare without re-randomizing.
    this._canvasWidth  = canvasWidth;
    this._canvasHeight = canvasHeight;

    const box       = this.makeLabLogo.getBoundingBox();
    const centroidX = box.x + box.width  / 2;
    const centroidY = box.y + box.height / 2;
    const count     = this._animTris.length;

    // Distance of each destination from the centroid → normalized [0, 1] delay.
    let maxDist = 0;
    for (const tri of this._animTris) {
      const d = tri._dest;
      tri._delayDist = Math.hypot(d.x - centroidX, d.y - centroidY);
      if (tri._delayDist > maxDist) maxDist = tri._delayDist;
    }

    this._animTris.forEach((tri, index) => {
      tri._delayNorm = maxDist > 0 ? tri._delayDist / maxDist : 0;
      this.pathFunction.prepare(tri, {
        centroidX, centroidY, canvasWidth, canvasHeight, index, count,
      });
    });
  }

  /**
   * Swaps the active trajectory and re-prepares per-triangle path data in place,
   * keeping the current scattered start positions (does not re-randomize). Use
   * when changing path style or its parameters mid-morph. If no start state
   * exists yet, just stores the path for the next reset()/resetFromArt().
   *
   * @param {import('./morph-paths.js').MorphPath} path
   */
  setPath(path) {
    this.pathFunction = path;
    if (this._animTris.length > 0) {
      this._preparePaths(this._canvasWidth, this._canvasHeight);
    }
  }

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
  _pieceProgress(tri, lerpAmt) {
    const stagger = Math.min(Math.max(this.stagger, 0), 0.95);
    if (stagger <= 0) return lerpAmt;
    const start  = stagger * (tri._delayNorm ?? 0);
    const window = 1 - stagger;
    const local  = (lerpAmt - start) / window;
    return Math.min(Math.max(local, 0), 1);
  }

  // ===========================================================================
  // Animation
  // ===========================================================================

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
  update(lerpAmt) {
    if (this._animTris.length === 0) return;

    this._currentLerpAmt = lerpAmt;

    // L outline: invisible below threshold, fades in above it
    if (lerpAmt >= this.lOutlineAppearThreshold) {
      this.makeLabLogoAnimated.isLOutlineVisible = true;
      const outlineProgress = (lerpAmt - this.lOutlineAppearThreshold)
                            / (1 - this.lOutlineAppearThreshold);
      this.makeLabLogoAnimated.lOutlineOpacity = this.easingFunction(
        Math.min(outlineProgress, 1)
      );
    } else {
      this.makeLabLogoAnimated.isLOutlineVisible = false;
      this.makeLabLogoAnimated.lOutlineOpacity   = 0;
    }

    // Lerp every animated triangle toward its destination.
    // When fully assembled (lerpAmt >= 1), skip interpolation and snap to dest
    // to prevent redundant triangles from visually doubling up at logo positions.
    if (lerpAmt >= 1) {
      for (const tri of this._animTris) {
        tri.visible = false; // suppress redundant art triangles entirely at end state
      }
    } else {
      for (const tri of this._animTris) {
        tri.visible = true;
        const s = tri._start;
        const d = tri._dest;

        // Per-piece progress (raw, then eased) — drives stagger.
        const local = this._pieceProgress(tri, lerpAmt);
        const t     = this.easingFunction(local);

        // Spatial: position follows the pathFunction; size/angle eased.
        const p   = this.pathFunction.position(tri, t);
        tri.x     = p.x;
        tri.y     = p.y;
        tri.size  = lerp(s.size,  d.size,  t);
        tri.angle = lerp(s.angle, d.angle, t);

        // Visual: linear in the piece's own (raw) progress so colour tracks the
        // triangle rather than the global timeline when staggered.
        tri.strokeWidth = lerp(s.strokeWidth,      d.strokeWidth,      local);
        tri.fillColor   = lerpColor(s.fillColor,   d.fillColor,        local);
        tri.strokeColor = lerpColor(s.strokeColor, d.strokeColor,      local);
      }
    }
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

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
  draw(ctx) {
    const lerpAmt = this._currentLerpAmt ?? 0;

    // 1. Optional debug overlay
    this.makeLabLogo.draw(ctx);

    if (lerpAmt >= 1) {
      // 3. Fully assembled — draw the clean target logo directly.
      //    _animTris are hidden (set in update()), so no overdraw.
      const savedVisible = this.makeLabLogo.visible;
      this.makeLabLogo.visible = true;
      this.makeLabLogo.draw(ctx);
      this.makeLabLogo.visible = savedVisible;
    } else {
      // 2. Mid-morph — draw the animated triangle pool
      for (const tri of this._animTris) {
        tri.draw(ctx);
      }
    }

    // 4. L-outline overlay via makeLabLogoAnimated, which tracks lOutlineOpacity.
    //    drawLOutline() is a focused method that draws only the L stroke,
    //    avoiding any interference with triangle colors or label state.
    if (this.makeLabLogoAnimated.isLOutlineVisible) {
      this.makeLabLogoAnimated.drawLOutline(ctx);
    }

    // 5. Art message: fades out as the morph progresses
    if (this._artMessage &&  this._artMessageVisible) {
      this._drawArtMessage(ctx, lerpAmt);
    }

    // 6. Logo label: fades in near the end of the morph
    if (this.makeLabLogoAnimated.isLabelVisible) {
      this._drawAnimatedLabel(ctx, lerpAmt);
    }
  }

  // ===========================================================================
  // Private rendering helpers
  // ===========================================================================

  /**
   * Draws the art message centered above the artwork, fading out as the
   * morph progresses. Opacity goes from 1 at lerpAmt=0 to 0 at lerpAmt=0.5,
   * so it disappears well before the logo label appears.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} lerpAmt
   * @private
   */
  _drawArtMessage(ctx, lerpAmt) {
    const alpha = Math.max(0, 1 - lerpAmt * 1.1); // fades out faster than linear
    if (alpha <= 0) return;

    // 1. Find the current highest point among all triangles in this frame
    let currentMinY = Infinity;

    // Check the animated triangles (the morphing set)
    for (const tri of this._animTris) {
      if (tri.visible) {
        // Subtract half size because (x,y) is the center
        const triTop = tri.y - (tri.size / 2);
        if (triTop < currentMinY) currentMinY = triTop;
      }
    }

    // 2. Also check the target logo's bounds (the destination) 
    // to ensure the label doesn't "dip" into the final logo position.
    const logoBox = this.makeLabLogo.getBoundingBox();
    const absoluteTop = Math.min(currentMinY, logoBox.y);

    // 3. Render the text relative to that dynamic peak
    const margin = this._artMessageFontSize * 0.4;
    const cx = logoBox.x + logoBox.width / 2;
    const cy = absoluteTop - margin;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${this._artMessageFontSize}px sans-serif`;
    ctx.fillStyle = this._artMessageColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this._artMessage, cx, cy);
    ctx.restore();
  }

  

  /**
   * Draws the "Makeability Lab" label with a fade-in and upward slide entrance.
   * Only active once lerpAmt exceeds labelAppearThreshold.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} lerpAmt
   * @private
   */
  _drawAnimatedLabel(ctx, lerpAmt) {
    if (lerpAmt <= this.labelAppearThreshold) return;

    // Map lerpAmt from [threshold, 1] → [0, 1] and apply easing
    const rawProgress   = (lerpAmt - this.labelAppearThreshold)
                        / (1 - this.labelAppearThreshold);
    const easedProgress = this.easingFunction(Math.min(rawProgress, 1));

    // Slide starts below final position and eases to 0 offset
    const slideOffset = this.makeLabLogoAnimated.labelFontSize
                      * this.labelSlideDistanceFraction
                      * (1 - easedProgress);

    this.makeLabLogoAnimated.drawLabel(ctx, {
      opacity: easedProgress,
      yOffset: slideOffset,
    });
  }
}

// =============================================================================
// Module-private helpers
// =============================================================================

/**
 * Creates a plain-object snapshot of the properties update() needs from a
 * Triangle. Passing an explicit angle overrides the triangle's own value,
 * which is useful for forcing the destination angle to 0.
 *
 * @param {Triangle} tri
 * @param {number} [angleOverride] - If provided, used instead of tri.angle.
 * @returns {{x, y, size, angle, fillColor, strokeColor, strokeWidth}}
 */
function _snapshot(tri, angleOverride) {
  return {
    x:           tri.x,
    y:           tri.y,
    size:        tri.size,
    angle:       angleOverride !== undefined ? angleOverride : tri.angle,
    fillColor:   tri.fillColor,
    strokeColor: tri.strokeColor,
    strokeWidth: tri.strokeWidth ?? 1,
  };
}

/**
 * Groups an array of triangles into a Map keyed by direction string.
 *
 * @param {Triangle[]} triangles
 * @returns {Map<string, Triangle[]>}
 */
function _groupByDirection(triangles) {
  const map = new Map();
  for (const tri of triangles) {
    if (!map.has(tri.direction)) map.set(tri.direction, []);
    map.get(tri.direction).push(tri);
  }
  return map;
}

// makelab-logo-intro-utils.js — shared helpers for the Makeability Lab logo
// "intro" animations (grid fade, leaf fall, z-zoom).
//
// These animations all share the same idea: fill the canvas with a triangle
// grid that is phase-aligned to the logo, reorient the cells under the logo's
// footprint so they line up with it, and then reveal the logo on top. The
// movement-based variants (leaf fall, z-zoom) additionally animate individual
// pieces (triangles and outline line segments) into place, each rendered
// through a per-frame canvas transform that pivots about the piece's resting
// center.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js


/**
 * Builds a full-canvas triangle {@link Grid} whose origin and cell size match
 * the logo, so the grid's cell boundaries line up with the logo's cells.
 *
 * @param {MakeabilityLabLogo} logo - The logo to align to (provides cellSize, x, y).
 * @param {number} canvasWidth - Canvas width in CSS pixels.
 * @param {number} canvasHeight - Canvas height in CSS pixels.
 * @returns {Grid} A grid covering the canvas, phase-aligned to the logo.
 */
function buildAlignedGrid(logo, canvasWidth, canvasHeight) {
  return new Grid(canvasWidth, canvasHeight, logo.cellSize,
    undefined, undefined, logo.x, logo.y);
}

/**
 * Indexes a grid's cells by their (rounded) top-left origin so a logo triangle
 * can be matched to the grid cell at the same position.
 *
 * @param {Grid} grid
 * @returns {Map<string, Cell>} Map from "x,y" (rounded) to the cell there.
 */
function indexCellsByPosition(grid) {
  const cellByPos = new Map();
  for (const row of grid.gridArray) {
    for (const cell of row) {
      cellByPos.set(`${Math.round(cell.tri1.x)},${Math.round(cell.tri1.y)}`, cell);
    }
  }
  return cellByPos;
}

/**
 * Finds the grid cell that sits at the same position as the given logo triangle.
 *
 * @param {Map<string, Cell>} cellByPos - Index from {@link indexCellsByPosition}
 *   (also returned by {@link matchGridOrientationToLogo}).
 * @param {Triangle} logoTri - A logo triangle to look up.
 * @returns {Cell|undefined} The cell at that position, or undefined if none.
 */
function findGridCellForTriangle(cellByPos, logoTri) {
  return cellByPos.get(`${Math.round(logoTri.x)},${Math.round(logoTri.y)}`);
}

/**
 * Reorients every grid cell beneath the logo so its two triangles point the
 * same way as the logo's cell at that position. The grid shares the logo's
 * origin and cell size, so each logo triangle has a grid cell at the same
 * position. A logo cell's two triangles always lie on the same diagonal
 * (opposite directions), so matching one triangle's direction orients the
 * whole cell.
 *
 * @param {Grid} grid - The grid to reorient (mutated in place).
 * @param {MakeabilityLabLogo} logo - The logo to align to.
 * @returns {Map<string, Cell>} The position index, so callers can do further
 *   per-cell work (e.g. pinning fade-target colors) without re-indexing.
 */
function matchGridOrientationToLogo(grid, logo) {
  const cellByPos = indexCellsByPosition(grid);

  for (const logoTri of logo.getAllTriangles()) {
    const cell = findGridCellForTriangle(cellByPos, logoTri);
    if (!cell) continue;
    if (cell.tri1.direction !== logoTri.direction &&
        cell.tri2.direction !== logoTri.direction) {
      cell.tri1.direction = logoTri.direction;
      cell.tri2.direction = Triangle.getOppositeDirection(logoTri.direction);
    }
  }

  return cellByPos;
}

/**
 * Decomposes the logo's M and L outlines into their smallest constituent line
 * segments, each tagged with the outline's color and stroke width. Used by the
 * movement animations so the outlines can fall / zoom in piece by piece rather
 * than as two monolithic shapes.
 *
 * @param {MakeabilityLabLogo} logo
 * @returns {{x1:number, y1:number, x2:number, y2:number, color:string, width:number}[]}
 */
function getOutlineSegments(logo) {
  const segments = [];

  for (const seg of logo.getMOutlineLineSegments()) {
    segments.push({
      x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2,
      color: logo.mOutlineColor, width: logo.mOutlineStrokeWidth,
    });
  }

  for (const seg of logo.getLOutlineLineSegments()) {
    segments.push({
      x1: seg.x1, y1: seg.y1, x2: seg.x2, y2: seg.y2,
      color: logo.lOutlineColor, width: logo.lOutlineStrokeWidth,
    });
  }

  return segments;
}

/**
 * Builds the three pools of animatable "pieces" shared by the movement
 * animations (leaf fall, z-zoom): the background grid triangles, the logo's own
 * triangles, and the logo's outline line segments. Each piece records a draw
 * function (which renders the piece at its resting coordinates) and the resting
 * center + height the caller needs to animate it. Timing and per-frame transform
 * are left to the caller, since those differ per animation.
 *
 * Side effect: each grid triangle's fill and stroke are set via getGridColor so
 * the falling/zooming grid is already colored.
 *
 * @param {Grid} grid - The aligned background grid (already orientation-matched).
 * @param {MakeabilityLabLogo} logo - The logo to assemble.
 * @param {Object} [opts]
 * @param {function(): string} opts.getGridColor - Returns a fill/stroke color
 *   for each grid triangle.
 * @returns {{grid: Piece[], logoTris: Piece[], outline: Piece[]}} where each
 *   Piece is {drawFn, pivotX, pivotY, height}. Triangle pieces also carry their
 *   source `tri`, and grid pieces carry `isLogoColor` (true for the cells pinned
 *   to the logo's colors, i.e. the ones that form the colored logo).
 */
function buildIntroPieces(grid, logo, { getGridColor }) {
  const triPiece = (tri) => {
    const bb = tri.getBoundingBox();
    return {
      drawFn: (ctx) => tri.draw(ctx),
      tri,
      pivotX: bb.x + bb.width / 2,
      pivotY: bb.y + bb.height / 2,
      height: bb.height,
    };
  };

  // Background grid triangles — each gets a random palette color.
  const gridPieces = [];
  for (const row of grid.gridArray) {
    for (const cell of row) {
      for (const tri of [cell.tri1, cell.tri2]) {
        const color = getGridColor();
        tri.fillColor = color;
        tri.strokeColor = color;
        gridPieces.push(triPiece(tri));
      }
    }
  }

  // Pin the grid cells beneath the logo's 12 default-colored triangles to those
  // exact colors so the colored logo *emerges from the backing grid* as the grid
  // lands, rather than having a redundant copy fall on top of it. The grid is
  // already orientation-matched to the logo, so the matching-direction triangle
  // in each cell lines up with the logo triangle.
  const cellByPos = indexCellsByPosition(grid);
  const pinnedTris = new Set();
  for (const logoTri of logo.getDefaultColoredTriangles()) {
    const cell = findGridCellForTriangle(cellByPos, logoTri);
    if (!cell) continue;
    const match = cell.tri1.direction === logoTri.direction ? cell.tri1 : cell.tri2;
    match.fillColor = logoTri.fillColor;
    match.strokeColor = logoTri.fillColor;
    pinnedTris.add(match);
  }

  // Tag the pinned grid triangles: these are the grid cells that *are* the
  // colored logo, so callers can treat them as part of the logo (e.g. keep them
  // fixed while the rest of the background grid animates away).
  for (const piece of gridPieces) {
    piece.isLogoColor = pinnedTris.has(piece.tri);
  }

  // Logo pieces that genuinely fall *on top of* the grid: the black M-shadow
  // triangles and the (translucent) L overlay triangles. The 12 colored
  // triangles emerge from the grid (pinned above), so they are deliberately
  // excluded here to avoid a redundant second triangle landing in the same spot.
  const logoTriPieces = [...logo.getMShadowTriangles(), ...logo.getLTriangles()]
    .filter((tri) => tri.visible)
    .map(triPiece);

  // Logo outlines, decomposed into individual line segments.
  const outlinePieces = getOutlineSegments(logo).map((seg) => ({
    drawFn: (ctx) => {
      ctx.save();
      ctx.strokeStyle = seg.color;
      ctx.lineWidth = seg.width;
      // Round caps so adjacent segments overlap at angled joints — each cap
      // extends half the stroke width past the endpoint, filling the corner
      // gap that butt caps (the default) would leave between separate strokes.
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
      ctx.restore();
    },
    pivotX: (seg.x1 + seg.x2) / 2,
    pivotY: (seg.y1 + seg.y2) / 2,
    height: Math.abs(seg.y2 - seg.y1),
  }));

  return { grid: gridPieces, logoTris: logoTriPieces, outline: outlinePieces };
}

/**
 * Renders a piece through a per-frame canvas transform that pivots about the
 * piece's resting center. The piece's own geometry stays at its resting
 * coordinates; this applies a translation, rotation, and uniform scale around
 * (pivotX, pivotY), plus an opacity multiplier. When dx=dy=0, angleRad=0, and
 * scale=1 the piece draws exactly at rest, so animations that converge those
 * values to identity land each piece precisely in place.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} pivotX - Resting-center x to pivot about.
 * @param {number} pivotY - Resting-center y to pivot about.
 * @param {Object} t - Transform for this frame.
 * @param {number} [t.dx=0] - Horizontal translation offset.
 * @param {number} [t.dy=0] - Vertical translation offset.
 * @param {number} [t.angleRad=0] - Rotation in radians about the pivot.
 * @param {number} [t.scale=1] - Uniform scale about the pivot.
 * @param {number} [t.opacity=1] - Opacity multiplier in [0, 1].
 * @param {function(CanvasRenderingContext2D): void} drawFn - Draws the piece at
 *   its resting coordinates (e.g. tri.draw(ctx) or a stroked line).
 */
function drawPieceWithTransform(ctx, pivotX, pivotY,
    { dx = 0, dy = 0, angleRad = 0, scale = 1, opacity = 1 }, drawFn) {
  ctx.save();
  ctx.globalAlpha *= opacity;
  ctx.translate(pivotX + dx, pivotY + dy);
  ctx.rotate(angleRad);
  ctx.scale(scale, scale);
  ctx.translate(-pivotX, -pivotY);
  drawFn(ctx);
  ctx.restore();
}

// makelab-logo-gridfade.js — "grid fade" intro animation for the Makeability Lab logo
//
// Fills the canvas with a grid of triangles that each fade from a start color
// (white by default) to a random color from the Makeability Lab palette, with
// each triangle starting at a slightly different, randomized time. Once the grid
// has filled in, the Makeability Lab logo smoothly fades in on top.
//
// This class is framework-agnostic: it draws to a raw CanvasRenderingContext2D
// and is driven by an elapsed-time value, so the host app owns the animation
// clock and render loop (e.g., requestAnimationFrame). This mirrors the design
// of MakeabilityLabLogoMorpher.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js


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
class MakeabilityLabLogoGridFade {
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
  constructor(makeLabLogo, canvasWidth, canvasHeight, options = {}) {
    this.makeLabLogo = makeLabLogo;

    this.fadeInDurationMs = options.fadeInDurationMs ?? 1500;
    this.maxStaggerMs = options.maxStaggerMs ?? 2000;
    this.startColor = options.startColor ?? 'rgb(255, 255, 255)';
    this.getEndColor = options.getEndColor ??
      (() => MakeabilityLabLogoColorer.getRandomOriginalColor());
    this.easingFunction = options.easingFunction ?? easeOutCubic;
    this.logoRevealStartMs = options.logoRevealStartMs ?? 3000;
    this.logoRevealDurationMs = options.logoRevealDurationMs ?? 1000;
    this.matchLogo = options.matchLogo ?? true;

    /**
     * Background grid that fills the canvas. Aligned to the logo's origin so its
     * cells line up with the logo's cells.
     * @type {Grid}
     */
    this.grid = buildAlignedGrid(makeLabLogo, canvasWidth, canvasHeight);

    /**
     * Current logo opacity in [0, 1], updated each frame by {@link update}.
     * @type {number}
     */
    this.logoOpacity = 0;

    /**
     * Per-triangle animation state, kept separate from the Triangle objects so
     * the library's data model stays clean.
     * @private
     * @type {{tri: Triangle, startColor: string, endColor: string, delayMs: number, done: boolean}[]}
     */
    this._animTris = [];
    this._initGridAnimation();
  }

  /**
   * Assigns each grid triangle a start color, a random end color, and a random
   * start delay, and resets it to the start color.
   * @private
   */
  _initGridAnimation() {
    this._animTris = [];
    const entryByTri = new Map();
    for (const row of this.grid.gridArray) {
      for (const cell of row) {
        for (const tri of [cell.tri1, cell.tri2]) {
          tri.fillColor = this.startColor;
          tri.strokeColor = this.startColor;
          const entry = {
            tri,
            startColor: this.startColor,
            endColor: this.getEndColor(),
            delayMs: Math.random() * this.maxStaggerMs,
            done: false,
          };
          this._animTris.push(entry);
          entryByTri.set(tri, entry);
        }
      }
    }

    if (this.matchLogo) {
      this._matchGridToLogo(entryByTri);
    }
  }

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
  _matchGridToLogo(entryByTri) {
    // 1. Match orientation across the whole logo footprint. Returns the cell
    //    position index so we can reuse it for color pinning below.
    const cellByPos = matchGridOrientationToLogo(this.grid, this.makeLabLogo);

    // 2. Pin the 12 colored triangles' grid counterparts to the logo's colors.
    for (const logoTri of this.makeLabLogo.getDefaultColoredTriangles()) {
      const cell = findGridCellForTriangle(cellByPos, logoTri);
      if (!cell) continue;
      const match = cell.tri1.direction === logoTri.direction ? cell.tri1 : cell.tri2;
      const entry = entryByTri.get(match);
      if (entry) entry.endColor = logoTri.fillColor;
    }
  }

  /**
   * Advances the animation to the given elapsed time. Computes each grid
   * triangle's current fill color and the logo's current opacity. Call once per
   * frame before {@link draw}.
   *
   * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
   */
  update(elapsedMs) {
    for (const entry of this._animTris) {
      if (entry.done) continue;

      const localMs = elapsedMs - entry.delayMs;
      if (localMs <= 0) continue; // not started yet

      const t = clamp(localMs / this.fadeInDurationMs, 0, 1);
      const color = lerpColor(entry.startColor, entry.endColor, this.easingFunction(t));
      entry.tri.fillColor = color;
      entry.tri.strokeColor = color;

      if (t >= 1) entry.done = true; // reached end color; skip from now on
    }

    // Logo fade-in
    const logoT = clamp(
      (elapsedMs - this.logoRevealStartMs) / this.logoRevealDurationMs, 0, 1);
    this.logoOpacity = this.easingFunction(logoT);
  }

  /**
   * Draws the grid, then the logo (faded to its current opacity), to the canvas.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx) {
    if (this.grid.visible) {
      this.grid.draw(ctx);
    }

    if (this.makeLabLogo.visible && this.logoOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = this.logoOpacity;
      this.makeLabLogo.draw(ctx);
      ctx.restore();
    }
  }

  /**
   * Restarts the animation from the beginning (re-randomizes colors and delays).
   * Call this, then reset your elapsed-time clock to 0.
   */
  reset() {
    this.logoOpacity = 0;
    this._initGridAnimation();
  }
}

// makelab-logo-leaffall.js — "falling leaf" intro animation for the
// Makeability Lab logo.
//
// Fills the canvas with a grid of triangles that flutter down from the top of
// the screen like falling leaves — weaving side to side and tumbling as they
// drop — and settle into their grid positions. After the grid has started
// filling in, the Makeability Lab logo's own pieces fall in the same way: each
// logo triangle, and each individual line segment of the M and L outlines (the
// outlines fall as their smallest constituent pieces, randomly sequenced), drift
// down and land to compose the finished logo on top of the aligned grid.
//
// This class is framework-agnostic: it draws to a raw CanvasRenderingContext2D
// and is driven by an elapsed-time value, so the host app owns the animation
// clock and render loop (e.g., requestAnimationFrame). This mirrors the design
// of MakeabilityLabLogoGridFade.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js


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
class MakeabilityLabLogoLeafFall {
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
   * @param {boolean} [options.startAssembled=false] - If true, the grid and logo
   *   are fully assembled from the very first frame (the fall-in intro is
   *   skipped), so nothing animates until you call {@link dropLeaves}. Useful for
   *   showing a finished logo and then dropping the leaves on demand.
   * @param {function(number): number} [options.easingFunction=easeOutCubic] -
   *   Easing for each piece's vertical descent (t in [0,1] → [0,1]).
   * @param {function(): string} [options.getGridColor] - Returns the fill/stroke
   *   color for each background grid triangle. Defaults to a random ML color.
   */
  constructor(makeLabLogo, canvasWidth, canvasHeight, options = {}) {
    this.makeLabLogo = makeLabLogo;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.totalDurationMs = options.totalDurationMs ?? 6000;
    this.gridStaggerMs = options.gridStaggerMs ?? 2500;
    this.logoRevealStartFraction = options.logoRevealStartFraction ?? 0.2;
    this.logoStaggerMs = options.logoStaggerMs ?? 1600;
    this.minFallMs = options.minFallMs ?? 1400;
    this.maxFallMs = options.maxFallMs ?? 2800;
    this.swayAmplitude = options.swayAmplitude ?? 55;
    this.maxRotationDeg = options.maxRotationDeg ?? 140;

    // --- "Leaf drop" (dropLeaves) tuning: background leaves fall to the ground ---
    this.groundStaggerMs = options.groundStaggerMs ?? 700;
    this.groundFallMinMs = options.groundFallMinMs ?? 700;
    this.groundFallMaxMs = options.groundFallMaxMs ?? 1700;
    this.groundPileSpread = options.groundPileSpread ?? 70;
    this.startAssembled = options.startAssembled ?? false;

    this.easingFunction = options.easingFunction ?? easeOutCubic;
    this.getGridColor = options.getGridColor ??
      (() => MakeabilityLabLogoColorer.getRandomOriginalColor());

    /**
     * Background grid that fills the canvas, aligned to the logo. Exposed so
     * hosts can toggle visibility (e.g. a debug key).
     * @type {Grid}
     */
    this.grid = buildAlignedGrid(makeLabLogo, canvasWidth, canvasHeight);

    /** @private Flat list of animated pieces (grid, then logo, then outline). */
    this._pieces = [];

    this._init();
  }

  /**
   * Builds the grid, the animated piece pools, and assigns each piece a fall
   * delay, duration, start offset, and randomized sway/tumble parameters.
   * @private
   */
  _init() {
    matchGridOrientationToLogo(this.grid, this.makeLabLogo);

    const pools = buildIntroPieces(this.grid, this.makeLabLogo,
      { getGridColor: this.getGridColor });

    const logoStartMs = this.totalDurationMs * this.logoRevealStartFraction;

    this._pieces = [];
    // Grid pieces begin near t=0; logo + outline pieces begin after the reveal
    // fraction has elapsed and gather within logoStaggerMs.
    for (const p of pools.grid) {
      this._addPiece(p, 'grid', Math.random() * this.gridStaggerMs);
    }
    const logoDelay = () =>
      logoStartMs + Math.random() * this.logoStaggerMs;
    for (const p of pools.logoTris) this._addPiece(p, 'logo', logoDelay());
    for (const p of pools.outline) this._addPiece(p, 'outline', logoDelay());

    // "Leaf drop" state (see dropLeaves()): not active until triggered.
    this._dropping = false;
    this._dropStartMs = null;
  }

  /**
   * Wraps a base piece with leaf-fall animation state and adds it to the pool.
   * @private
   */
  _addPiece(base, group, delayMs) {
    // Start fully above the top edge; a random extra margin staggers the
    // heights pieces enter from so they don't all cross the top edge in a line.
    const startDy = -(base.pivotY + base.height / 2 +
      Math.random() * this.canvasHeight * 0.3);

    // Fall speed is roughly constant: duration scales with distance to fall.
    const distanceFraction = clamp(Math.abs(startDy) / this.canvasHeight, 0, 1);
    const durationMs = lerp(this.minFallMs, this.maxFallMs, distanceFraction);

    const sign = Math.random() < 0.5 ? -1 : 1;
    this._pieces.push({
      ...base,
      group,
      delayMs,
      durationMs,
      startDy,
      sway: {
        amp: this.swayAmplitude * (0.5 + Math.random() * 0.5),
        freq: 1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
      },
      rot: {
        amp: sign * (this.maxRotationDeg * Math.PI / 180) * (0.5 + Math.random() * 0.5),
        freq: 1 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2,
      },
      // Per-frame state, filled in by update():
      started: false,
      dx: 0,
      dy: startDy,
      angleRad: 0,
    });
  }

  /**
   * Advances the animation to the given elapsed time, computing each piece's
   * current offset and rotation. Call once per frame before {@link draw}.
   *
   * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
   */
  update(elapsedMs) {
    for (const p of this._pieces) {
      // Skip the fall-in intro: every piece sits at rest from the first frame,
      // so only dropLeaves() animates anything.
      if (this.startAssembled) {
        p.started = true;
        p.dx = 0;
        p.dy = 0;
        p.angleRad = 0;
        continue;
      }

      if (elapsedMs < p.delayMs) {
        p.started = false;
        continue;
      }
      p.started = true;

      const t = clamp((elapsedMs - p.delayMs) / p.durationMs, 0, 1);
      const e = this.easingFunction(t);
      const decay = 1 - t; // sway/tumble fade out so the piece lands exactly

      p.dy = lerp(p.startDy, 0, e);
      p.dx = p.sway.amp * Math.sin(t * p.sway.freq * Math.PI * 2 + p.sway.phase) * decay;
      p.angleRad = p.rot.amp * Math.sin(t * p.rot.freq * Math.PI * 2 + p.rot.phase) * decay;
    }

    // Leaf drop: once triggered, background grid leaves fall to the ground and
    // pile up, overriding their resting transform. Logo pieces and the pinned
    // colored grid cells have no `drop` params, so the logo stays fixed.
    if (this._dropping) {
      if (this._dropStartMs === null) {
        this._dropStartMs = elapsedMs;
        this._initDrop();
      }
      const dropMs = elapsedMs - this._dropStartMs;
      for (const p of this._pieces) {
        if (!p.drop) continue;
        const t = clamp((dropMs - p.drop.delayMs) / p.drop.durationMs, 0, 1);
        const decay = 1 - t;
        // Vertical follows gravity (position ∝ t²), accelerating into the ground.
        p.dy = p.drop.groundDy * t * t;
        // Drift sideways with a decaying flutter, like a tumbling leaf.
        p.dx = p.drop.driftX * t +
          p.drop.sway.amp * Math.sin(t * p.drop.sway.freq * Math.PI * 2 + p.drop.sway.phase) * decay;
        // Rotate to a random resting angle (leaves lie every which way).
        p.angleRad = p.drop.finalAngle * this.easingFunction(t);
      }
    }
  }

  /**
   * Triggers the "leaf drop": every background grid triangle falls to the bottom
   * of the screen and settles into a pile, while the logo stays fixed in place
   * (its colored triangles, black M-shadow, translucent L, and outlines do not
   * move). Idempotent — calling it again while a drop is in progress is a no-op.
   * {@link reset} clears the drop.
   */
  dropLeaves() {
    if (this._dropping) return;
    this._dropping = true;
    this._dropStartMs = null; // captured on the next update() so it shares the clock
  }

  /**
   * Assigns each background grid piece a ground target and randomized fall
   * parameters. Called once, the first update() after dropLeaves().
   * @private
   */
  _initDrop() {
    for (const p of this._pieces) {
      // Only the background grid falls; logo pieces and the pinned colored grid
      // cells (isLogoColor) stay put so the logo remains intact.
      if (p.group !== 'grid' || p.isLogoColor) continue;

      const groundY = this.canvasHeight - p.height / 2 - Math.random() * this.groundPileSpread;
      const groundDy = Math.max(0, groundY - p.pivotY); // fall downward only
      const distanceFraction = clamp(groundDy / this.canvasHeight, 0, 1);

      p.drop = {
        delayMs: Math.random() * this.groundStaggerMs,
        durationMs: lerp(this.groundFallMinMs, this.groundFallMaxMs, distanceFraction),
        groundDy,
        driftX: (Math.random() * 2 - 1) * 40,
        finalAngle: (Math.random() * 2 - 1) * Math.PI * 1.5, // up to ~270° tumble
        sway: {
          amp: this.swayAmplitude * 0.5 * (0.5 + Math.random() * 0.5),
          freq: 1 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
        },
      };
    }
  }

  /**
   * Draws the started pieces in layered order: grid, then logo triangles, then
   * outline segments (on top). Respects grid.visible and makeLabLogo.visible.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx) {
    for (const p of this._pieces) {
      if (!p.started) continue;
      if (p.group === 'grid' && !this.grid.visible) continue;
      if ((p.group === 'logo' || p.group === 'outline') && !this.makeLabLogo.visible) continue;
      drawPieceWithTransform(ctx, p.pivotX, p.pivotY,
        { dx: p.dx, dy: p.dy, angleRad: p.angleRad }, p.drawFn);
    }
  }

  /**
   * Restarts the animation from the beginning (re-randomizes colors, delays, and
   * sway/tumble). Call this, then reset your elapsed-time clock to 0.
   */
  reset() {
    this.grid = buildAlignedGrid(this.makeLabLogo, this.canvasWidth, this.canvasHeight);
    this._init();
  }
}

// makelab-logo-zoomfade.js — "z-axis zoom" intro animation for the
// Makeability Lab logo.
//
// Fills the canvas with a grid of triangles that fly in from the front of the
// screen: each piece starts overscaled (as if in front of the viewer) and
// shrinks down to settle onto the screen plane, fading in as it lands. After the
// grid has started filling in, the Makeability Lab logo's own pieces zoom in the
// same way — each logo triangle, and each individual line segment of the M and L
// outlines — until the finished logo is composed on top of the aligned grid.
//
// This is the zoom counterpart to MakeabilityLabLogoGridFade (which only fades)
// and MakeabilityLabLogoLeafFall (which drops pieces from the top). Like those,
// it is framework-agnostic: it draws to a raw CanvasRenderingContext2D and is
// driven by an elapsed-time value, so the host owns the clock and render loop.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js


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
class MakeabilityLabLogoZoomFade {
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
  constructor(makeLabLogo, canvasWidth, canvasHeight, options = {}) {
    this.makeLabLogo = makeLabLogo;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    this.totalDurationMs = options.totalDurationMs ?? 5000;
    this.gridStaggerMs = options.gridStaggerMs ?? 2500;
    this.logoRevealStartFraction = options.logoRevealStartFraction ?? 0.2;
    this.logoStaggerMs = options.logoStaggerMs ?? 1400;
    this.pieceDurationMs = options.pieceDurationMs ?? 1100;
    this.startScale = options.startScale ?? 6;
    this.depthVariance = options.depthVariance ?? 0.45;
    this.startOpacity = options.startOpacity ?? 0.25;
    this.perspectiveX = options.perspectiveX ?? canvasWidth / 2;
    this.perspectiveY = options.perspectiveY ?? canvasHeight / 2;
    this.easingFunction = options.easingFunction ?? easeOutCubic;
    this.getGridColor = options.getGridColor ??
      (() => MakeabilityLabLogoColorer.getRandomOriginalColor());

    /**
     * Background grid that fills the canvas, aligned to the logo. Exposed so
     * hosts can toggle visibility (e.g. a debug key).
     * @type {Grid}
     */
    this.grid = buildAlignedGrid(makeLabLogo, canvasWidth, canvasHeight);

    /** @private Flat list of animated pieces (grid, then logo, then outline). */
    this._pieces = [];

    this._init();
  }

  /**
   * Builds the grid, the animated piece pools, and assigns each piece a zoom
   * delay.
   * @private
   */
  _init() {
    matchGridOrientationToLogo(this.grid, this.makeLabLogo);

    const pools = buildIntroPieces(this.grid, this.makeLabLogo,
      { getGridColor: this.getGridColor });

    const logoStartMs = this.totalDurationMs * this.logoRevealStartFraction;

    this._pieces = [];
    for (const p of pools.grid) {
      this._addPiece(p, 'grid', Math.random() * this.gridStaggerMs);
    }
    const logoDelay = () =>
      logoStartMs + Math.random() * this.logoStaggerMs;
    for (const p of pools.logoTris) this._addPiece(p, 'logo', logoDelay());
    for (const p of pools.outline) this._addPiece(p, 'outline', logoDelay());
  }

  /**
   * Wraps a base piece with zoom-fade animation state and adds it to the pool.
   * @private
   */
  _addPiece(base, group, delayMs) {
    // Vary each piece's start scale so they arrive from a range of depths
    // rather than a single flat plane.
    const startScale = this.startScale *
      (1 + (Math.random() * 2 - 1) * this.depthVariance);
    this._pieces.push({
      ...base,
      group,
      delayMs,
      startScale,
      // Per-frame state, filled in by update():
      started: false,
      scale: startScale,
      opacity: 0,
    });
  }

  /**
   * Advances the animation to the given elapsed time, computing each piece's
   * current scale and opacity. Call once per frame before {@link draw}.
   *
   * @param {number} elapsedMs - Milliseconds elapsed since the animation started.
   */
  update(elapsedMs) {
    for (const p of this._pieces) {
      if (elapsedMs < p.delayMs) {
        p.started = false;
        continue;
      }
      p.started = true;

      const t = clamp((elapsedMs - p.delayMs) / this.pieceDurationMs, 0, 1);
      const e = this.easingFunction(t);
      p.scale = lerp(p.startScale, 1, e);
      p.opacity = lerp(this.startOpacity, 1, e);
    }
  }

  /**
   * Draws the started pieces in layered order: grid, then logo triangles, then
   * outline segments (on top). Respects grid.visible and makeLabLogo.visible.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx) {
    for (const p of this._pieces) {
      if (!p.started) continue;
      if (p.group === 'grid' && !this.grid.visible) continue;
      if ((p.group === 'logo' || p.group === 'outline') && !this.makeLabLogo.visible) continue;
      // Pivot the scale about the shared perspective origin (not the piece's own
      // center): at scale s a piece is drawn at origin + s × (rest − origin), so
      // it both grows and flies outward/inward along a ray through that origin —
      // the parallax that sells the 3D "flying in toward the viewer" effect.
      drawPieceWithTransform(ctx, this.perspectiveX, this.perspectiveY,
        { scale: p.scale, opacity: p.opacity }, p.drawFn);
    }
  }

  /**
   * Restarts the animation from the beginning (re-randomizes colors and delays).
   * Call this, then reset your elapsed-time clock to 0.
   */
  reset() {
    this.grid = buildAlignedGrid(this.makeLabLogo, this.canvasWidth, this.canvasHeight);
    this._init();
  }
}

/**
 * A generic, data-driven triangle-grid artwork loader.
 *
 * Reads a JSON definition (palette, direction pattern, grid) and constructs
 * a Cell[][] grid compatible with the Makeability Lab logo animation system.
 * Designed as a drop-in replacement for bespoke classes like TriangleSanta.
 *
 * JSON format overview:
 *   - palette: single-char keys → { base, jitter } color definitions
 *   - directionPattern: "alternating" (checkerboard tri1 dirs)
 *   - grid: array of row objects, each containing a "cells" array where
 *     each cell is null | "key" | ["t1key","t2key"] | {t1,t2,dir,...}
 *
 * See triangle-art-proposal.md for the full spec.
 *
 * @module TriangleArt
 * @author Jon E. Froehlich (spec), Jon and Claude (implementation)
 */


// ---------------------------------------------------------------------------
// TriangleArt
// ---------------------------------------------------------------------------

class TriangleArt {

  /**
   * Creates a triangle-grid artwork from a parsed JSON definition.
   *
   * @param {number} x - Top-left x of the grid in canvas pixels.
   * @param {number} y - Top-left y of the grid in canvas pixels.
   * @param {number} triangleSize - Pixel size of each square cell.
   * @param {Object} data - Parsed JSON data object (see spec).
   */
  constructor(x, y, triangleSize, data) {
    /** @type {Object} The raw JSON definition. */
    this.data = data;

    /** @type {number} */
    this.triangleSize = triangleSize;

    /** @type {Cell[][]} 2D array [row][col] of Cell objects. */
    this.artArray = TriangleArt._buildGrid(x, y, triangleSize, data);

    /** @type {boolean} */
    this.visible = true;

    /** @type {boolean} Whether the message text is drawn over the art. */
    this.showMessage = true;

    /** @type {string} CSS color for the message text. Falls back to palette's first entry base, then black. */
    this.messageColor = data.messageColor ?? TriangleArt._defaultMessageColor(data);
  }

  // -----------------------------------------------------------------------
  // Static grid-dimension helpers (parallel to TriangleSanta.numRows etc.)
  // These read from the JSON data, but callers also need them *before*
  // instantiation (e.g. to center the grid). So we accept the data object.
  // -----------------------------------------------------------------------

  /**
   * Returns numCols from a data definition without constructing a TriangleArt.
   * @param {Object} data - Parsed JSON data object.
   * @returns {number}
   */
  static numCols(data) { return data.numCols; }

  /**
   * Returns numRows from a data definition without constructing a TriangleArt.
   * @param {Object} data - Parsed JSON data object.
   * @returns {number}
   */
  static numRows(data) { return data.numRows; }

  // -----------------------------------------------------------------------
  // Instance getters (matching TriangleSanta interface)
  // -----------------------------------------------------------------------

  get x() { return this.artArray[0][0].x; }
  get y() { return this.artArray[0][0].y; }
  get cellSize() { return this.artArray[0][0].size; }
  get numRows() { return this.data.numRows; }
  get numCols() { return this.data.numCols; }
  get width() { return this.numCols * this.triangleSize; }
  get height() { return this.numRows * this.triangleSize; }
  get name() { return this.data.name ?? ''; }
  get message() { return this.data.message ?? ''; }

  // -----------------------------------------------------------------------
  // Triangle access
  // -----------------------------------------------------------------------

  /**
   * Returns a flat array of all Triangle objects in the artwork.
   *
   * @param {boolean} [onlyVisible=true] If true, only visible triangles.
   * @returns {Triangle[]}
   */
  getAllTriangles(onlyVisible = true) {
    const out = [];
    for (const row of this.artArray) {
      for (const cell of row) {
        if (!onlyVisible || cell.tri1.visible) out.push(cell.tri1);
        if (!onlyVisible || cell.tri2.visible) out.push(cell.tri2);
      }
    }
    return out;
  }

  // -----------------------------------------------------------------------
  // Bulk setters (matching TriangleSanta interface)
  // -----------------------------------------------------------------------

  setStrokeTransparent(isTransparent) {
    for (const tri of this.getAllTriangles()) {
      tri.isStrokeVisible = !isTransparent;
    }
  }

  setFillTransparent(isTransparent) {
    for (const tri of this.getAllTriangles()) {
      tri.isFillVisible = !isTransparent;
    }
  }

  setColors(fillColor, strokeColor) {
    for (const row of this.artArray) {
      for (const cell of row) {
        cell.setFillColor(fillColor);
        cell.setStrokeColor(strokeColor);
      }
    }
  }

  setStrokeColors(strokeColor) {
    for (const row of this.artArray) {
      for (const cell of row) {
        cell.setStrokeColor(strokeColor);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Drawing
  // -----------------------------------------------------------------------

  /**
   * Draws the artwork onto the given canvas context.
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.visible) return;

    if (this.showMessage && this.message){
      this.drawMessage(ctx);
    }

    for (const row of this.artArray) {
      for (const cell of row) {
        cell.draw(ctx);
      }
    }
  }

  /**
   * Draws the message string centered just above the artwork.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} [alpha=1] - Opacity 0–1, modulates messageColor.
   * @param {number|null} [x=null] - Center x override; defaults to grid center.
   * @param {number|null} [y=null] - Baseline y override; defaults to just above grid.
   */
  drawMessage(ctx, alpha = 1, x = null, y = null) {
    if (!this.message) return;
    const fontSize = Math.round(this.triangleSize * 0.7);
    const cx = x ?? (this.x + this.width / 2);
    const cy = y ?? (this.y - fontSize);

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = this.messageColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(this.message, cx, cy);
    ctx.restore();
  }

  // -----------------------------------------------------------------------
  // Static factory: load from URL
  // -----------------------------------------------------------------------

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
  static async fromURL(url, x, y, triangleSize) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    const data = await resp.json();
    return new TriangleArt(x, y, triangleSize, data);
  }

  /**
   * Fetches and parses a JSON file, returning just the data object.
   * Useful when you need dimensions before constructing (e.g. for centering).
   *
   * @param {string} url - Path to the JSON file.
   * @returns {Promise<Object>}
   */
  static async loadData(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Failed to load ${url}: ${resp.status}`);
    return resp.json();
  }

  // =====================================================================
  // PRIVATE: Grid construction
  // =====================================================================

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
  static _buildGrid(startX, startY, size, data) {
    const { palette, grid, directionPattern } = data;
    const result = [];
    let y = startY;

    for (let r = 0; r < grid.length; r++) {
      const rowDef = grid[r];
      // Support both bare arrays and { _comment, cells } objects
      const cells = Array.isArray(rowDef) ? rowDef : rowDef.cells;
      const row = [];
      let x = startX;

      for (let c = 0; c < cells.length; c++) {
        const cellDef = cells[c];
        row.push(
          TriangleArt._buildCell(x, y, size, r, c, cellDef, palette, directionPattern)
        );
        x += size;
      }

      result.push(row);
      y += size;
    }

    return result;
  }

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
  static _buildCell(x, y, size, row, col, def, palette, directionPattern) {
    if (def === null || def === undefined) {
      return Cell.createEmptyCell(x, y, size);
    }

    // Normalize to spec object
    let spec;
    if (typeof def === 'string') {
      spec = { t1: def, t2: def };
    } else if (Array.isArray(def)) {
      spec = { t1: def[0], t2: def[1] };
    } else {
      spec = { ...def }; // Shallow copy to avoid mutating source data
    }

    // NEW SUGAR: If tHalf is defined, it becomes the primary triangle (t1)
    // and we explicitly hide the secondary triangle (t2).
    if (spec.tHalf) {
      spec.t1 = spec.tHalf;
      spec.t2 = null;
    }

    // Determine tri1 direction
    let tri1Dir;
    if (spec.dir) {
      tri1Dir = TriangleDir[spec.dir];
      if (!tri1Dir) {
        throw new Error(`Unknown direction "${spec.dir}" at row ${row}, col ${col}`);
      }
    } else {
      tri1Dir = TriangleArt._getDefaultDirection(row, col, directionPattern);
    }

    // Create cell - tri1 direction defines the geometry
    const cell = Cell.createCell(x, y, size, tri1Dir);

    // Apply colors and visibility
    TriangleArt._applyTriProps(cell.tri1, spec.t1, spec.t1Visible, palette);
    TriangleArt._applyTriProps(cell.tri2, spec.t2, spec.t2Visible, palette);

    return cell;
  }

  /**
   * Computes the default tri1 direction for a cell based on the pattern rule.
   *
   * @param {number} row
   * @param {number} col
   * @param {string} pattern - e.g. "alternating"
   * @returns {string} A TriangleDir value.
   * @private
   */
  static _getDefaultDirection(row, col, pattern) {
    if (pattern === 'alternating') {
      return (row + col) % 2 === 0 ? TriangleDir.TopLeft : TriangleDir.TopRight;
    }
    // Fallback
    return TriangleDir.TopLeft;
  }

  /**
   * Applies palette color (with jitter) and visibility to a triangle.
   *
   * @param {Triangle} tri - The Triangle instance to modify.
   * @param {string|null} colorKey - Palette key, raw hex, or null (hidden).
   * @param {boolean} [visibleOverride] - Explicit visibility override.
   * @param {Object} palette - The palette definitions from the JSON.
   * @private
   */
  static _applyTriProps(tri, colorKey, visibleOverride, palette) {
    // Visibility: explicit override wins, then null colorKey → hidden
    if (visibleOverride === false) {
      tri.visible = false;
    } else if (colorKey === null || colorKey === undefined) {
      tri.visible = false;
    } else {
      tri.visible = true;
    }

    // Resolve and apply color (even on hidden tris, for morph source data)
    if (colorKey !== null && colorKey !== undefined) {
      const color = TriangleArt._resolveColor(colorKey, palette);
      tri.setColors(color);
    }
  }

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
  static _resolveColor(key, palette) {
    const entry = palette[key];

    // Not in palette → treat as a raw color string
    if (!entry) return key;

    const base = entry.base;

    // No jitter → return base color directly
    if (!entry.jitter) return base;

    return TriangleArt._applyJitter(base, entry.jitter);
  }

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
  static _applyJitter(base, jitter) {
    switch (jitter.type) {
      case 'brightness': {
        const bVal = TriangleArt._sampleValue(jitter);
        return changeColorBrightness(base, bVal);
      }

      case 'saturation+brightness': {
        const sVal = random(jitter.saturation[0], jitter.saturation[1]);
        const bVal = TriangleArt._sampleBrightnessFromCompound(jitter);
        return changeColorSaturationAndBrightness(base, sVal, bVal);
      }

      default:
        console.warn(`Unknown jitter type: "${jitter.type}", using base color`);
        return base;
    }
  }

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
  static _sampleValue(jitter) {
    if (jitter.distribution === 'gaussian') {
      return randomGaussian(jitter.mean, jitter.sd);
    }
    // Default: uniform
    return random(jitter.range[0], jitter.range[1]);
  }

  /**
   * Samples the brightness component from a compound (saturation+brightness) jitter.
   * Looks for brightnessDistribution/brightnessMean/brightnessSd for gaussian,
   * or falls back to jitter.brightness[0..1] for uniform.
   *
   * @param {Object} jitter
   * @returns {number}
   * @private
   */
  static _sampleBrightnessFromCompound(jitter) {
    if (jitter.brightnessDistribution === 'gaussian') {
      return randomGaussian(jitter.brightnessMean ?? 99, jitter.brightnessSd ?? 1);
    }
    return random(jitter.brightness[0], jitter.brightness[1]);
  }

  /**
   * Picks a default message color: the "base" color of the palette's first
   * entry, or black if the data has no palette.
   *
   * @private
   * @param {Object} data - The raw art JSON (may contain a `palette` object).
   * @returns {string} A CSS color string.
   */
  static _defaultMessageColor(data) {
    const keys = Object.keys(data.palette ?? {});
    return keys.length > 0 ? data.palette[keys[0]].base : '#000000';
  }
}

export { Cell, Grid, LineBreakTransformer, LineSegment, MORPH_PATHS, MakeabilityLabLogo, MakeabilityLabLogoColorer, MakeabilityLabLogoGridFade, MakeabilityLabLogoLeafFall, MakeabilityLabLogoMorpher, MakeabilityLabLogoZoomFade, ORIGINAL_COLOR_ARRAY, OriginalColorPaletteRGB, Serial, SerialEvents, SerialState, Triangle, TriangleArt, TriangleDir, Vector, arcPath, bezierPath, changeColorBrightness, changeColorSaturationAndBrightness, clamp, convertColorStringToObject, convertToDegrees, convertToRadians, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, easeOutQuad, hexStringToRgb, hsvToRgb, lerp, lerpColor, linearPath, map, random, randomGaussian, rgbToHex, rgbToHsv, shuffle, spiralPath };
//# sourceMappingURL=makelab.all.js.map
