/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */

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

    // Handle hex string (3-, 6-, or 8-digit, with optional alpha)
    if (colorStr.startsWith('#')) {
      const parsed = parseHexString(colorStr);
      if (parsed) {
        return parsed;
      }
    } else if (colorStr.startsWith('rgb')) {
      // Improved regex to support varied spacing and decimal alpha (e.g., .5 or 0.5)
      const match = colorStr.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?\)/);

      if (match) {
        const [, r, g, b, a] = match;
        return {
          r: clamp(parseInt(r, 10), 0, 255),
          g: clamp(parseInt(g, 10), 0, 255),
          b: clamp(parseInt(b, 10), 0, 255),
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
function parseHexString(hex) {
  if (typeof hex !== 'string') {
    return null;
  }

  let h = hex.startsWith('#') ? hex.slice(1) : hex;

  // Expand 3-digit shorthand (e.g., "f80" -> "ff8800").
  if (/^[0-9a-fA-F]{3}$/.test(h)) {
    h = h.split('').map(c => c + c).join('');
  }

  if (/^[0-9a-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
      a: 1
    };
  }

  if (/^[0-9a-fA-F]{8}$/.test(h)) {
    return {
      r: parseInt(h.substring(0, 2), 16),
      g: parseInt(h.substring(2, 4), 16),
      b: parseInt(h.substring(4, 6), 16),
      a: parseInt(h.substring(6, 8), 16) / 255
    };
  }

  return null;
}

/**
 * Converts a hex color string to an RGB object.
 *
 * @param {string} hex - Hex color string (e.g., "#cc4133" or "cc4133"). Accepts
 *   3-, 6-, or 8-digit hex (the alpha of the 8-digit form is ignored here).
 * @returns {{r: number, g: number, b: number}|null} RGB object or null if invalid.
 */
function hexStringToRgb(hex) {
  const parsed = parseHexString(hex);
  return parsed ? { r: parsed.r, g: parsed.g, b: parsed.b } : null;
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

// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich and the Makeability Lab
// https://makeabilitylab.io
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

    /** @type {number} Font size (px) of the angle/magnitude label. */
    this.fontSize = 10;
    /** @type {string} Stroke color of the line, arrowhead, and label. */
    this.strokeColor = "black";
    /** @type {boolean} If true, draw the line dashed instead of solid. */
    this.isDashedLine = false;
    /** @type {boolean} If true, draw the text label next to the segment. */
    this.drawTextLabels = true;
    /** @type {boolean} If true (and labels are on), include the magnitude in the label. */
    this.drawTextMagnitude = true;
    /** @type {boolean} If true (and labels are on), include the angle in the label. */
    this.drawTextAngle = true;
    /** @type {number} Stroke width of the line in pixels. */
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
    // Save/restore around the whole method so that per-segment style — stroke
    // color/weight and especially the dashed-line pattern — does not leak onto
    // the context and affect later draw calls that share it.
    ctx.save();

    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWeight;

    if (this.isDashedLine) {
      ctx.setLineDash([5, 15]);
    }

    this.drawArrow(ctx, this.pt1, this.pt2.subtract(this.pt1), this.strokeColor);

    // Draw text labels (optional)
    if (this.drawTextLabels) {
      ctx.font = `${this.fontSize}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = this.strokeColor;

      const label = this.generateLabel();
      const labelWidth = ctx.measureText(label).width;

      // BUG FIX: Draw relative to pt1 instead of global origin
      ctx.fillText(label, this.pt1.x - labelWidth - 3, this.pt1.y + 12);
    }

    ctx.restore();
  }

  /**
   * Draws an arrow: a line from `p1` along the offset vector `p2`, with an
   * arrowhead at the tip. Used internally by {@link LineSegment#draw}.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   * @param {Vector} p1 - The arrow's start point (tail).
   * @param {Vector} p2 - The offset from the tail to the tip (i.e. tip = p1 + p2).
   * @param {string} color - The stroke and fill color of the arrow.
   */
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

export { LineSegment, changeColorBrightness, changeColorSaturationAndBrightness, convertColorStringToObject, hexStringToRgb, hsvToRgb, lerpColor, parseHexString, rgbToHex, rgbToHsv };
//# sourceMappingURL=makelab.graphics.js.map
