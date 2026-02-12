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
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z * sd + mean;
}

// --- Easing functions ---
// Each takes a value t in [0, 1] and returns a value in [0, 1].
// See https://easings.net/ for visualizations.

/** @param {number} t @returns {number} */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

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

    let angleBetweenRadians = v1.angleBetween(v2);
    console.log(`angleBetweenDegrees: ${convertToDegrees(angleBetweenRadians).toFixed(1)}`);

    // Ensure the angle is between 0 and 2*PI
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

    console.log(`CW angle ${convertToDegrees(angles.clockwiseAngle).toFixed(1)} CCW angle ${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}`);
    //console.log(`Counterclockwise Angle: ${angles.counterclockwiseAngle} radians (${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}°)`);
    //console.log(`Clockwise Angle: ${angles.clockwiseAngle} radians (${convertToDegrees(angles.clockwiseAngle).toFixed(1)}°)`);
    // console.log(`Old angle Between: ${angleBetweenLineSegmentsInRadians} radians (${convertToDegrees(angleBetweenLineSegmentsInRadians).toFixed(1)}°)`);
    
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

    //this.setColorScheme(ColorScheme.BlackOnWhite);
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

    if(this.isMOutlineVisible){
      ctx.save();
      ctx.globalAlpha = this.mOutlineOpacity;
      ctx.strokeStyle = this.mOutlineColor;
      ctx.lineWidth = this.mOutlineStrokeWidth;
      ctx.beginPath();
      let mPoints = this.getMOutlinePoints();
      for (const [x, y] of mPoints) {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if(this.isLOutlineVisible){
      ctx.save();
      ctx.globalAlpha = this.lOutlineOpacity;
      ctx.strokeStyle = this.lOutlineColor;
      ctx.lineWidth = this.lOutlineStrokeWidth;
      ctx.beginPath();
      let lPoints = this.getLOutlinePoints();
      for (const [x, y] of lPoints) {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    this.drawLabel(ctx);
    
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

  static setRandomColors(triangles, isFillVisible=true, isStrokeVisible=true){
    for(const tri of triangles){
      const fillColor = MakeabilityLabLogoColorer.getRandomOriginalColor();
      tri.fillColor = fillColor;
      tri.startFillColor = fillColor;
      tri.endFillColor = fillColor;
      tri.strokeColor = fillColor;
      tri.isFillVisible = isFillVisible;
      tri.isStrokeVisible = isStrokeVisible;
    }
  }

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
      if (col % 2 != 0) {
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
      if (col % 2 != 0) {
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
   * @param {number} tri.strokeWeight - The stroke weight of the triangle.
   * @param {boolean} tri.visible - The visibility of the triangle.
   * @returns {Triangle} A new Triangle object.
   */
  static createTriangle(tri){
    return new Triangle(tri.x, tri.y, tri.size, tri.direction,
      tri.fillColor, tri.strokeColor, tri.strokeWeight, tri.visible);
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

class MakeabilityLabLogoExploder{
  /**
   * Creates a new MakeabilityLabLogoExploder instance.
   *
   * The exploder manages two internal MakeabilityLabLogo instances: a static "target"
   * logo (makeLabLogo) and an animated logo (makeLabLogoAnimated). Call reset() to
   * randomize particle positions, then update(lerpAmt) to interpolate between the
   * exploded and assembled states.
   *
   * @param {number} x - The x-coordinate for the logo position.
   * @param {number} y - The y-coordinate for the logo position.
   * @param {number} triangleSize - The size of each triangle cell.
   * @param {string} [startFillColor="rgb(255, 255, 255, 0.5)"] - Initial fill color for exploded triangles.
   * @param {string} [startStrokeColor="rgba(0, 0, 0, 0.6)"] - Initial stroke color for exploded triangles.
   */
  constructor(x, y, triangleSize, startFillColor="rgb(255, 255, 255, 0.5)", 
    startStrokeColor="rgba(0, 0, 0, 0.6)"){

    // Static "target" logo — invisible by default, used as the end-state reference
    this.makeLabLogo = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogo.visible = false;

    // Animated logo — the one that moves from exploded → assembled
    this.makeLabLogoAnimated = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogoAnimated.isLOutlineVisible = false;
    this.makeLabLogoAnimated.isMOutlineVisible = false;
    
    this.makeLabLogo.setLTriangleStrokeColor('rgb(240, 240, 240)'); // barely noticeable
    this.makeLabLogoAnimated.areLTriangleStrokesVisible = true;

    // Enable label on both logos so height/centering calculations are consistent.
    // The target logo is invisible so its label won't render; only the animated
    // logo's label is drawn (with animation via _drawAnimatedLabel).
    this.makeLabLogo.isLabelVisible = true;
    this.makeLabLogoAnimated.isLabelVisible = true;

    /** @type {Array<Object>} Snapshot of each triangle's randomized start state */
    this.originalRandomTriLocs = [];

    // --- Explode flags: control which properties are randomized ---
    this.explodeSize = true;
    this.explodeX = true;
    this.explodeY = true;
    this.explodeAngle = true;
    this.explodeStrokeColor = true;
    this.explodeFillColor = true;
    this.explodeStrokeWidth = true;

    this.startFillColor = startFillColor;
    this.startStrokeColor = startStrokeColor;

    // --- Easing ---
    /** 
     * Easing function applied to spatial properties (position, angle, size).
     * Receives a value in [0, 1] and returns a value in [0, 1].
     * Colors always use linear interpolation regardless of this setting.
     * @type {function(number): number} 
     */
    this.easingFunction = easeOutCubic;

    // --- L outline animation ---
    /**
     * Controls when the L outline starts fading in, as a fraction of the
     * overall animation. E.g., 0.85 means it begins at 85% progress.
     * @type {number}
     */
    this.lOutlineAppearThreshold = 0.85;

    // --- Label animation ---
    /** 
     * Controls when the label starts fading in, as a fraction of the overall
     * animation. E.g., 0.7 means the label begins appearing at 70% progress. 
     * @type {number} 
     */
    this.labelAppearThreshold = 0.7;

    /**
     * The vertical slide distance (in label-font-size fractions) the label
     * travels during its entrance animation.
     * @type {number}
     */
    this.labelSlideDistanceFraction = 0.4;
  }

  // --- Getters ---

  /**
   * Gets the final assembled height of the logo (including the label if visible).
   * @returns {number}
   */
  get finalHeight(){ return this.makeLabLogo.height; }

  /**
   * Gets the final assembled width of the logo.
   * @returns {number}
   */
  get finalWidth(){ return this.makeLabLogo.width; }

  
  /**
   * Adjusts the size of the logo to fit within the specified canvas dimensions.
   *
   * @param {number} canvasWidth - The width of the canvas to fit the logo into.
   * @param {number} canvasHeight - The height of the canvas to fit the logo into.
   * @param {boolean} [alignToGrid=false] - Optional parameter to align the logo to a grid.
   */
  fitToCanvas(canvasWidth, canvasHeight, alignToGrid=false){
    this.makeLabLogo.fitToCanvas(canvasWidth, canvasHeight, alignToGrid);
    this.makeLabLogoAnimated.fitToCanvas(canvasWidth, canvasHeight, alignToGrid);
  }

  /**
   * Sets the size of the logo for both the static and animated versions.
   *
   * @param {number} logoWidth - The width to set for the logo.
   */
  setLogoSize(logoWidth){
    this.makeLabLogo.setLogoSize(logoWidth);
    this.makeLabLogoAnimated.setLogoSize(logoWidth);
  }

  /**
   * Sets the final size of the logo at the end state.
   *
   * @param {number} finalWidth - The desired width of the logo.
   */
  setLogoSizeEndState(finalWidth){
    this.makeLabLogo.setLogoSize(finalWidth);
  }

  /**
   * Sets the x position for both the static and animated MakeLab logos.
   *
   * @param {number} x - The x-coordinate to set for the logos.
   */
  setXPosition(x){
    this.makeLabLogo.x = x;
    this.makeLabLogoAnimated.x = x;
  }

  /**
   * Sets the Y position for both static and animated MakeLab logos.
   *
   * @param {number} y - The Y coordinate to set.
   */
  setYPosition(y){
    this.makeLabLogo.y = y;
    this.makeLabLogoAnimated.y = y;
  }

  /**
   * Sets the position of the logo.
   *
   * @param {number} x - The x-coordinate for the logo position.
   * @param {number} y - The y-coordinate for the logo position.
   */
  setLogoPosition(x, y){
    this.makeLabLogo.setLogoPosition(x, y);
    this.makeLabLogoAnimated.setLogoPosition(x, y);
  }

  /**
   * Centers the logo on the canvas.
   *
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.
   */
  centerLogo(canvasWidth, canvasHeight, alignedToGrid=false){
    this.makeLabLogo.centerLogo(canvasWidth, canvasHeight, alignedToGrid);
    this.makeLabLogoAnimated.centerLogo(canvasWidth, canvasHeight, alignedToGrid);
  }

  /**
   * Resets the state of the logo exploder with new dimensions and randomizes the 
   * positions, angles, and sizes of the triangles.
   *
   * @param {number} canvasWidth - The drawing area width.
   * @param {number} canvasHeight - The drawing area height.
   */
  reset(canvasWidth, canvasHeight){

    this.originalRandomTriLocs = [];
    const endStateTriangleSize = this.makeLabLogo.cellSize;
   
    const makeLabLogoTriangles = this.makeLabLogo.getAllTriangles();
    const makeLabLogoAnimatedTriangles = this.makeLabLogoAnimated.getAllTriangles();
    this.makeLabLogoAnimated.setColors(this.startFillColor, this.startStrokeColor);
    for (let i = 0; i < makeLabLogoAnimatedTriangles.length; i++) {
      const tri = makeLabLogoAnimatedTriangles[i];
      let randSize = this.explodeSize ? random(endStateTriangleSize/2, endStateTriangleSize*3) : endStateTriangleSize;
      tri.x = this.explodeX ? random(randSize, canvasWidth - randSize) : makeLabLogoTriangles[i].x;
      tri.y = this.explodeY ? random(randSize, canvasHeight - randSize) : makeLabLogoTriangles[i].y;
      tri.angle = this.explodeAngle ? random(0, 540) : 0;
      tri.strokeColor = this.explodeStrokeColor ? makeLabLogoAnimatedTriangles[i].strokeColor : makeLabLogoTriangles[i].strokeColor;
      tri.fillColor = this.explodeFillColor ? makeLabLogoAnimatedTriangles[i].fillColor : makeLabLogoTriangles[i].fillColor;
      tri.strokeWidth = this.explodeStrokeWidth ? makeLabLogoAnimatedTriangles[i].strokeWidth : makeLabLogoTriangles[i].strokeWidth;
      tri.size = randSize;
      this.originalRandomTriLocs.push(
        { x: tri.x, 
          y: tri.y, 
          angle: tri.angle, 
          size: tri.size,
          strokeColor: tri.strokeColor,
          fillColor: tri.fillColor,
          strokeWidth: tri.strokeWidth
        });
    }
  }

  /**
   * Updates the state of the animated logo based on the provided interpolation amount.
   *
   * @param {number} lerpAmt - The interpolation amount, a value between 0 and 1.
   *
   * This function performs the following operations:
   * 1. Animates the L outline opacity (fades in after lOutlineAppearThreshold).
   * 2. Interpolates the position, angle, and size of each triangle from their
   *    original random locations to their final static positions.
   * 3. Interpolates the color of each triangle from the start colors to their
   *    original colors.
   */
  update(lerpAmt){
    if (this.originalRandomTriLocs.length === 0) return;

    // Apply easing to spatial properties
    const t = this.easingFunction(lerpAmt);

    // --- L outline: fade in after threshold ---
    if (lerpAmt >= this.lOutlineAppearThreshold) {
      this.makeLabLogoAnimated.isLOutlineVisible = true;
      const lOutlineProgress = Math.min(
        (lerpAmt - this.lOutlineAppearThreshold) / (1 - this.lOutlineAppearThreshold),
        1
      );
      this.makeLabLogoAnimated.lOutlineOpacity = this.easingFunction(lOutlineProgress);
    } else {
      this.makeLabLogoAnimated.isLOutlineVisible = false;
      this.makeLabLogoAnimated.lOutlineOpacity = 0;
    }

    const staticTriangles = this.makeLabLogo.getAllTriangles(true);
    const animatedTriangles = this.makeLabLogoAnimated.getAllTriangles(true);

    for (let i = 0; i < this.originalRandomTriLocs.length; i++) {
      const endX = staticTriangles[i].x;
      const endY = staticTriangles[i].y;
      const endAngle = 0;
      const endSize = staticTriangles[i].size;
      const endStrokeColor = staticTriangles[i].strokeColor;
      const endFillColor = staticTriangles[i].fillColor;
      const endStrokeWidth = staticTriangles[i].strokeWidth;
  
      const startX = this.originalRandomTriLocs[i].x;
      const startY = this.originalRandomTriLocs[i].y;
      const startAngle = this.originalRandomTriLocs[i].angle;
      const startSize = this.originalRandomTriLocs[i].size;
      const startStrokeColor = this.originalRandomTriLocs[i].strokeColor;
      const startFillColor = this.originalRandomTriLocs[i].fillColor;
      const startStrokeWidth = this.originalRandomTriLocs[i].strokeWidth;
  
      // Apply easing (t) to spatial properties
      animatedTriangles[i].x = lerp(startX, endX, t);
      animatedTriangles[i].y = lerp(startY, endY, t);
      animatedTriangles[i].angle = lerp(startAngle, endAngle, t);
      animatedTriangles[i].size = lerp(startSize, endSize, t);
      
      // Apply linear interpolation for visual style properties
      animatedTriangles[i].strokeWidth = lerp(startStrokeWidth, endStrokeWidth, lerpAmt);
      animatedTriangles[i].strokeColor = lerpColor(startStrokeColor, endStrokeColor, lerpAmt);
      animatedTriangles[i].fillColor = lerpColor(startFillColor, endFillColor, lerpAmt);
    }

    // Cache the current lerpAmt so draw() can use it for the label
    this._currentLerpAmt = lerpAmt;
  }

  /**
   * Draws the MakeLab logo and its animated version on the provided canvas context.
   * The base class draw() handles triangles and outlines (with opacity).
   * The animated logo's label is drawn separately with fade-in and slide-up effects.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx){
    // Draw the static target logo (invisible by default, but respects .visible)
    this.makeLabLogo.draw(ctx);

    // Draw the animated logo — but suppress its label so we can draw it
    // ourselves with animation effects via _drawAnimatedLabel
    const savedLabelVisible = this.makeLabLogoAnimated.isLabelVisible;
    this.makeLabLogoAnimated.isLabelVisible = false;
    this.makeLabLogoAnimated.draw(ctx);
    this.makeLabLogoAnimated.isLabelVisible = savedLabelVisible;

    // Draw the animated label with fade-in / slide-up
    if (savedLabelVisible) {
      this._drawAnimatedLabel(ctx);
    }
  }

  /**
   * Draws the label with a fade-in and slide-up animation. Delegates the actual
   * text rendering to the base class's drawLabel(), passing animated opacity and
   * yOffset values.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @private
   */
  _drawAnimatedLabel(ctx) {
    const lerpAmt = this._currentLerpAmt ?? 0;
    if (lerpAmt <= this.labelAppearThreshold) return;

    // Compute animation progress within the label's appearance window
    const labelProgress = Math.min(
      (lerpAmt - this.labelAppearThreshold) / (1 - this.labelAppearThreshold),
      1
    );
    const easedProgress = this.easingFunction(labelProgress);

    // Slide-up: starts offset downward, eases to 0
    const fontSize = this.makeLabLogoAnimated.labelFontSize;
    const slideOffset = fontSize * this.labelSlideDistanceFraction * (1 - easedProgress);

    this.makeLabLogoAnimated.drawLabel(ctx, {
      opacity: easedProgress,
      yOffset: slideOffset
    });
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

    this.showMessage = true;

    /** @type {string} CSS color for the message text. Falls back to palette's first entry base, then black. */
    this.messageColor = data.messageColor ?? TriangleArt._defaultMessageColor(data);

    console.log("Initialized TriangleArt with name: ", this.name);
    console.log("Message: ", this.message);
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
      console.log("Drawing message: ", this.message);
    }else {
      console.log("Message hidden or empty, skipping drawMessage.");
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
   * 
   * @param {*} data 
   * @returns 
   */
  static _defaultMessageColor(data) {
    const keys = Object.keys(data.palette ?? {});
    return keys.length > 0 ? data.palette[keys[0]].base : '#000000';
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

export { Cell, Grid, LineSegment, MakeabilityLabLogo, MakeabilityLabLogoColorer, MakeabilityLabLogoExploder, ORIGINAL_COLOR_ARRAY, OriginalColorPaletteRGB, Triangle, TriangleArt, TriangleDir, Vector, convertColorStringToObject, convertToDegrees, convertToRadians, lerp, lerpColor, random, shuffle };
//# sourceMappingURL=makelab.all.js.map
