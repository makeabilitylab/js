/**
 * A Santa Claus figure composed of right triangles from the Makeability Lab 
 * triangle grid system. The Santa is laid out on a 10-column × 9-row grid of
 * {@link Cell} objects, where each cell contains two triangles. Specific cells
 * are colored to form the hat, face, beard, belt, and suit of Santa.
 * 
 * Each triangle gets a slightly randomized color variation (via HSV brightness
 * jitter) to give the figure a hand-crafted, organic feel.
 * 
 * The grid layout (10 cols × 9 rows) with approximate body regions:
 * 
 *   Row 0:       ....HH....    (H = hat tip)
 *   Row 1:       ...HHHH...    (hat brim)
 *   Row 2:       ..WWWWWW..    (W = white trim)
 *   Row 3:       .WFFFFFFW.    (F = face)
 *   Row 4:       SWFFFFFFWS    (S = suit sides)
 *   Row 5:       SSWFMMFWSS    (M = mouth)
 *   Row 6:       BBBWWWWBBB    (B = belt)
 *   Row 7:       BBBBWWBBBB    (belt buckle area)
 *   Row 8:       .SSSSSSSS.    (suit bottom)
 * 
 * Converted from p5js to vanilla Canvas + makelab-all.js
 * 
 * By Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 */

import { Cell, Triangle, TriangleDir } from '../../../lib/logo/makelab-logo.js';
import { changeColorBrightness, changeColorSaturationAndBrightness } from '../../../lib/graphics/color-utils.js';
import { random, randomGaussian } from '../../../lib/math/math-utils.js';

// --- Santa color palette (base hex values) ---
// Each getter method applies random HSV brightness jitter to these base colors
// to give each triangle a slightly unique shade.
const COLOR_SANTA_FACE = "#fdf2d0";
const COLOR_SANTA_SUIT_RED = "#cc4133";
const COLOR_SANTA_SUIT_WHITE = "#ffffff";
const COLOR_SANTA_NOSE = "#f9da78";
const COLOR_SANTA_MOUTH = "#f3af56";
const COLOR_SANTA_BELT = "#272425";

export class TriangleSanta {

  /**
   * Creates a new TriangleSanta at the given position.
   * 
   * @param {number} x - The x-coordinate of the top-left corner of the Santa grid.
   * @param {number} y - The y-coordinate of the top-left corner of the Santa grid.
   * @param {number} triangleSize - The size (width and height) of each square cell
   *   in the grid. Each cell contains two right triangles.
   */
  constructor(x, y, triangleSize) {
    /** 
     * 2D array of Cell objects [row][col] forming the Santa figure.
     * @type {Cell[][]} 
     */
    this.santaArray = TriangleSanta.createTriangleSanta(x, y, triangleSize);

    /** @type {boolean} Whether the Santa is drawn. */
    this.visible = true;
  }

  /** 
   * The Santa grid has 9 rows.
   * @returns {number} 
   */
  static get numRows() { return 9; }

  /**
   * The Santa grid has 10 columns.
   * @returns {number} 
   */
  static get numCols() { return 10; }

  /**
   * Gets the x-coordinate of the top-left corner of the Santa grid.
   * @returns {number}
   */
  get x() { return this.santaArray[0][0].x; }

  /**
   * Gets the y-coordinate of the top-left corner of the Santa grid.
   * @returns {number}
   */
  get y() { return this.santaArray[0][0].y; }

  /**
   * Gets the size of each square cell in the grid.
   * @returns {number}
   */
  get cellSize() { return this.santaArray[0][0].size; }

  /**
   * Gets the total pixel width of the Santa grid (numCols × cellSize).
   * @returns {number}
   */
  get width() { return TriangleSanta.numCols * this.cellSize; }

  /**
   * Gets the total pixel height of the Santa grid (numRows × cellSize).
   * @returns {number}
   */
  get height() { return TriangleSanta.numRows * this.cellSize; }

  /**
   * Sets the stroke visibility for all triangles in the Santa figure.
   * 
   * @param {boolean} isTransparent - If true, hides strokes; if false, shows them.
   */
  setStrokeTransparent(isTransparent) {
    for (const tri of this.getAllTriangles()) {
      tri.isStrokeVisible = !isTransparent;
    }
  }

  /**
   * Sets the fill visibility for all triangles in the Santa figure.
   * 
   * @param {boolean} isTransparent - If true, hides fills; if false, shows them.
   */
  setFillTransparent(isTransparent) {
    for (const tri of this.getAllTriangles()) {
      tri.isFillVisible = !isTransparent;
    }
  }

  /**
   * Sets the fill and stroke colors for all cells in the Santa grid.
   * 
   * @param {string} fillColor - CSS color string for the fill.
   * @param {string} strokeColor - CSS color string for the stroke.
   */
  setColors(fillColor, strokeColor) {
    for (let row = 0; row < this.santaArray.length; row++) {
      for (let col = 0; col < this.santaArray[row].length; col++) {
        this.santaArray[row][col].setFillColor(fillColor);
        this.santaArray[row][col].setStrokeColor(strokeColor);
      }
    }
  }

  /**
   * Sets the stroke color for all cells in the Santa grid.
   * 
   * @param {string} strokeColor - CSS color string for the stroke.
   */
  setStrokeColors(strokeColor) {
    for (let row = 0; row < this.santaArray.length; row++) {
      for (let col = 0; col < this.santaArray[row].length; col++) {
        this.santaArray[row][col].setStrokeColor(strokeColor);
      }
    }
  }

  /**
   * Returns a flat array of all Triangle objects in the Santa figure.
   * 
   * @param {boolean} [onlyVisible=true] - If true, only returns visible triangles;
   *   if false, returns all triangles including hidden ones.
   * @returns {Triangle[]} Array of Triangle objects.
   */
  getAllTriangles(onlyVisible = true) {
    const allTriangles = [];
    for (let row = 0; row < this.santaArray.length; row++) {
      for (let col = 0; col < this.santaArray[row].length; col++) {
        const cell = this.santaArray[row][col];
        if (!onlyVisible || cell.tri1.visible) {
          allTriangles.push(cell.tri1);
        }
        if (!onlyVisible || cell.tri2.visible) {
          allTriangles.push(cell.tri2);
        }
      }
    }
    return allTriangles;
  }

  /**
   * Draws the Santa figure onto the given canvas rendering context.
   * Iterates through all cells in the grid and draws each one.
   * 
   * @param {CanvasRenderingContext2D} ctx - The 2D canvas context to draw on.
   */
  draw(ctx) {
    if (!this.visible) { return; }

    for (let row = 0; row < this.santaArray.length; row++) {
      for (let col = 0; col < this.santaArray[row].length; col++) {
        this.santaArray[row][col].draw(ctx);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Color helper methods
  // -----------------------------------------------------------------------
  // Each method returns a CSS rgba() string with slight random variation
  // applied via HSV brightness (and sometimes saturation) jitter. This gives
  // each triangle a subtly unique shade, creating an organic mosaic look.
  // -----------------------------------------------------------------------

  /**
   * Returns a randomized red suit color (brightness 75–100%).
   * @returns {string} CSS rgba() color string.
   */
  static getSantaSuitColor() {
    return changeColorBrightness(COLOR_SANTA_SUIT_RED, random(75, 100));
  }

  /**
   * Returns a randomized dark belt color (brightness 8–22%).
   * @returns {string} CSS rgba() color string.
   */
  static getSantaBeltColor() {
    return changeColorBrightness(COLOR_SANTA_BELT, random(8, 22));
  }

  /**
   * Returns a randomized near-white color using Gaussian distribution
   * (mean=99%, sd=2%) for subtle variation in the hat trim and beard.
   * @returns {string} CSS rgba() color string.
   */
  static getSantaWhiteColor() {
    return changeColorBrightness(COLOR_SANTA_SUIT_WHITE, randomGaussian(99, 2));
  }

  /**
   * Returns a randomized nose color (brightness 97–100%).
   * @returns {string} CSS rgba() color string.
   */
  static getSantaNoseColor() {
    return changeColorBrightness(COLOR_SANTA_NOSE, random(97, 100));
  }

  /**
   * Returns a randomized mouth color (brightness 94–100%).
   * @returns {string} CSS rgba() color string.
   */
  static getSantaMouthColor() {
    return changeColorBrightness(COLOR_SANTA_MOUTH, random(94, 100));
  }

  /**
   * Returns a randomized skin-tone face color with both saturation (20–30%)
   * and brightness (Gaussian mean=99%, sd=1%) variation.
   * @returns {string} CSS rgba() color string.
   */
  static getSantaFaceColor() {
    return changeColorSaturationAndBrightness(
      COLOR_SANTA_FACE, random(20, 30), randomGaussian(99, 1));
  }

  // -----------------------------------------------------------------------
  // Grid construction
  // -----------------------------------------------------------------------
  // The Santa figure is built row by row. Each static method below constructs
  // one row of the 10-column grid, setting triangle directions, visibility,
  // and colors to form the appropriate body region.
  //
  // TODO: In the future, read from a .csv or JSON pixel grid so arbitrary
  //       triangle art can be created without per-row methods.
  // -----------------------------------------------------------------------

  /**
   * Creates the complete 9-row × 10-column Santa figure as a 2D array of Cells.
   * Each row is built by a dedicated static method that handles the specific
   * triangle layout and coloring for that horizontal slice of the figure.
   * 
   * @param {number} x - The x-coordinate of the top-left corner.
   * @param {number} y - The y-coordinate of the top-left corner.
   * @param {number} triangleSize - The size of each square cell.
   * @returns {Cell[][]} A 2D array [9 rows][10 cols] of Cell objects.
   */
  static createTriangleSanta(x, y, triangleSize) {
    const triSanta = new Array(TriangleSanta.numRows);

    triSanta[0] = TriangleSanta.createSantaTopRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[1] = TriangleSanta.createSanta2ndRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[2] = TriangleSanta.createSanta3rdRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[3] = TriangleSanta.createSanta4thRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[4] = TriangleSanta.createSanta5thRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[5] = TriangleSanta.createSanta6thRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[6] = TriangleSanta.createSanta7thRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[7] = TriangleSanta.createSanta8thRow(x, y, triangleSize);
    y += triangleSize;
    triSanta[8] = TriangleSanta.createSanta9thRow(x, y, triangleSize);

    return triSanta;
  }

  /**
   * Creates Row 0: the tip of Santa's hat.
   * Layout: ....HH.... (only cols 4–5 visible as bottom-pointing triangles).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSantaTopRow(x, y, triangleSize) {
    const topRow = new Array(TriangleSanta.numCols);
    for (let col = 0; col < topRow.length; col++) {
      let cell;
      const suitColor = TriangleSanta.getSantaSuitColor();
      if (col === 4) {
        // Left half of hat tip
        cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);
        cell.setColors(suitColor);
      } else if (col === 5) {
        // Right half of hat tip
        cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);
        cell.setColors(suitColor);
      } else {
        cell = Cell.createEmptyCell(x, y, triangleSize);
      }
      topRow[col] = cell;
      x += triangleSize;
    }
    return topRow;
  }

  /**
   * Creates Row 1: the wider portion of Santa's hat.
   * Layout: ...HHHH... (cols 3–6 visible; cols 3,6 are partial bottom triangles).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta2ndRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      let cell;
      const suitColor1 = TriangleSanta.getSantaSuitColor();
      const suitColor2 = TriangleSanta.getSantaSuitColor();
      if (col === 4) {
        // Full cell, left-center of hat
        cell = Cell.createCell(x, y, triangleSize, TriangleDir.BottomLeft);
        cell.tri1.setColors(suitColor1);
        cell.tri2.setColors(suitColor2);
      } else if (col === 5) {
        // Full cell, right-center of hat
        cell = Cell.createCell(x, y, triangleSize, TriangleDir.BottomRight);
        cell.tri1.setColors(suitColor1);
        cell.tri2.setColors(suitColor2);
      } else if (col === 3) {
        // Left edge of hat (partial triangle)
        cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);
        cell.tri1.setColors(suitColor1);
        cell.tri2.setColors(suitColor2);
      } else if (col === 6) {
        // Right edge of hat (partial triangle)
        cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);
        cell.tri1.setColors(suitColor1);
        cell.tri2.setColors(suitColor2);
      } else {
        cell = Cell.createEmptyCell(x, y, triangleSize);
      }
      row[col] = cell;
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 2: the white trim along the bottom of Santa's hat.
   * Layout: ..WWWWWW.. (cols 2–7 visible; cols 2,7 have top triangle hidden
   * for a tapered edge).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta3rdRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      // Alternate triangle direction across columns for tessellation
      const triDir = col % 2 !== 0 ? TriangleDir.TopRight : TriangleDir.TopLeft;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      // Hide cells outside the hat trim region
      if (col < 2 || col > 7) {
        row[col].setVisibility(false);
      } else if (col === 2 || col === 7) {
        // Edge cells: only bottom triangle visible for tapered shape
        row[col].tri1.visible = false;
      }

      // Color all triangles white (even hidden ones, for animation consistency)
      row[col].tri1.setColors(TriangleSanta.getSantaWhiteColor());
      row[col].tri2.setColors(TriangleSanta.getSantaWhiteColor());
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 3: Santa's face with nose.
   * Layout: .WFFFFFFW. (cols 2–7 face; cols 4–5 tri1 are nose;
   * cols 1,8 partial white trim; cols 0,9 hidden).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta4thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopLeft : TriangleDir.TopRight;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      const whiteColor1 = TriangleSanta.getSantaWhiteColor();
      const whiteColor2 = TriangleSanta.getSantaWhiteColor();

      if (col === 1 || col === 8) {
        // Side trim: only bottom triangle visible
        row[col].tri1.visible = false;
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(whiteColor2);
      } else if (col < 1 || col > 8) {
        // Far edges: completely hidden
        row[col].setVisibility(false);
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(whiteColor2);
      } else {
        // Face region (cols 2–7)
        const faceColor1 = TriangleSanta.getSantaFaceColor();
        const faceColor2 = TriangleSanta.getSantaFaceColor();
        row[col].tri1.setColors(faceColor1);
        row[col].tri2.setColors(faceColor2);

        // Nose at center columns
        if (col === 4 || col === 5) {
          row[col].tri1.setColors(TriangleSanta.getSantaNoseColor());
        }
      }
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 4: lower face transitioning to beard and suit sides.
   * Layout: SWFFFFFFWS (cols 0,9 partial suit; cols 1,8 white-to-suit transition).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta5thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopRight : TriangleDir.TopLeft;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      // Default to white (beard)
      const whiteColor1 = TriangleSanta.getSantaWhiteColor();
      const whiteColor2 = TriangleSanta.getSantaWhiteColor();
      row[col].tri1.setColors(whiteColor1);
      row[col].tri2.setColors(whiteColor2);

      const suitColor1 = TriangleSanta.getSantaSuitColor();
      const suitColor2 = TriangleSanta.getSantaSuitColor();

      if (col === 0 || col === 9) {
        // Far edges: partial suit color, only bottom triangle visible
        row[col].tri1.visible = false;
        row[col].tri1.setColors(suitColor1);
        row[col].tri2.setColors(suitColor2);
      } else if (col === 1 || col === 8) {
        // Transition cells: white on top, suit on bottom
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(suitColor2);
      }
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 5: beard with mouth, flanked by suit.
   * Layout: SSWFMMFWSS (cols 0–1,8–9 suit; cols 2,7 white/suit transition;
   * cols 3–6 white beard; cols 4–5 tri1 are mouth).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta6thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopLeft : TriangleDir.TopRight;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      const whiteColor1 = TriangleSanta.getSantaWhiteColor();
      const whiteColor2 = TriangleSanta.getSantaWhiteColor();
      const suitColor1 = TriangleSanta.getSantaSuitColor();
      const suitColor2 = TriangleSanta.getSantaSuitColor();

      if (col < 2 || col > 7) {
        // Suit sides
        row[col].tri1.setColors(suitColor1);
        row[col].tri2.setColors(suitColor2);
      } else {
        // Beard/face center
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(whiteColor2);
      }

      if (col === 4 || col === 5) {
        // Mouth triangles at center
        row[col].tri1.setColors(TriangleSanta.getSantaMouthColor());
      } else if (col === 2 || col === 7) {
        // Transition: bottom triangle blends into suit
        row[col].tri2.setColors(suitColor2);
      }
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 6: top belt row with white belt buckle center.
   * Layout: BBBWWWWBBB (cols 0–2,7–9 belt; cols 3–6 white buckle;
   * cols 3,6 tri2 is belt for a transitional edge).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta7thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopRight : TriangleDir.TopLeft;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      const whiteColor1 = TriangleSanta.getSantaWhiteColor();
      const whiteColor2 = TriangleSanta.getSantaWhiteColor();
      const beltColor1 = TriangleSanta.getSantaBeltColor();
      const beltColor2 = TriangleSanta.getSantaBeltColor();

      if (col < 3 || col > 6) {
        // Belt region
        row[col].tri1.setColors(beltColor1);
        row[col].tri2.setColors(beltColor2);
      } else {
        // Buckle center (white)
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(whiteColor2);
      }

      // Transition cells at buckle edges
      if (col === 3 || col === 6) {
        row[col].tri2.setColors(beltColor2);
      }
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 7: lower belt row with narrower buckle.
   * Layout: BBBBWWBBBB (cols 0–3,6–9 belt; cols 4–5 white buckle;
   * cols 0,9 tri2 hidden for taper; cols 4–5 tri2 are belt).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta8thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopLeft : TriangleDir.TopRight;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      const whiteColor1 = TriangleSanta.getSantaWhiteColor();
      const whiteColor2 = TriangleSanta.getSantaWhiteColor();
      const beltColor1 = TriangleSanta.getSantaBeltColor();
      const beltColor2 = TriangleSanta.getSantaBeltColor();

      if (col < 4 || col > 5) {
        // Belt region
        row[col].tri1.setColors(beltColor1);
        row[col].tri2.setColors(beltColor2);
      } else {
        // Narrow buckle center
        row[col].tri1.setColors(whiteColor1);
        row[col].tri2.setColors(whiteColor2);
      }

      if (col === 0 || col === 9) {
        // Taper the belt at far edges
        row[col].tri2.visible = false;
      } else if (col === 4 || col === 5) {
        // Buckle detail: bottom triangle is belt color
        row[col].tri2.setColors(beltColor2);
      }
      x += triangleSize;
    }
    return row;
  }

  /**
   * Creates Row 8: the bottom of Santa's suit.
   * Layout: .SSSSSSSS. (cols 1–8 visible suit; cols 0,9 hidden;
   * cols 1,8 tri2 hidden for tapered shape).
   * 
   * @param {number} x - Starting x-coordinate for this row.
   * @param {number} y - The y-coordinate for this row.
   * @param {number} triangleSize - Cell size in pixels.
   * @returns {Cell[]} Array of 10 Cell objects.
   */
  static createSanta9thRow(x, y, triangleSize) {
    const row = new Array(TriangleSanta.numCols);
    for (let col = 0; col < row.length; col++) {
      const triDir = col % 2 !== 0 ? TriangleDir.TopRight : TriangleDir.TopLeft;
      row[col] = Cell.createCell(x, y, triangleSize, triDir);

      const suitColor1 = TriangleSanta.getSantaSuitColor();
      const suitColor2 = TriangleSanta.getSantaSuitColor();

      if (col > 0 && col < 9) {
        // Visible suit region
        row[col].tri1.setColors(suitColor1);
        row[col].tri2.setColors(suitColor2);

        // Taper at edges
        if (col === 1 || col === 8) {
          row[col].tri2.visible = false;
        }
      } else {
        // Far edges hidden
        row[col].setVisibility(false);
      }
      x += triangleSize;
    }
    return row;
  }
}