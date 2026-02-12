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

import {
  Cell, Triangle, TriangleDir
} from './makelab-logo.js';  // Adjust path as needed

import {
  changeColorBrightness,
  changeColorSaturationAndBrightness
} from '../graphics/color-utils.js';

import { random, randomGaussian } from '../math/math-utils.js';

// ---------------------------------------------------------------------------
// TriangleArt
// ---------------------------------------------------------------------------

export class TriangleArt {

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
    }else{
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