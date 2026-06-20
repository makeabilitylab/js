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

import { Grid, Triangle } from './makelab-logo.js';

/**
 * Builds a full-canvas triangle {@link Grid} whose origin and cell size match
 * the logo, so the grid's cell boundaries line up with the logo's cells.
 *
 * @param {MakeabilityLabLogo} logo - The logo to align to (provides cellSize, x, y).
 * @param {number} canvasWidth - Canvas width in CSS pixels.
 * @param {number} canvasHeight - Canvas height in CSS pixels.
 * @returns {Grid} A grid covering the canvas, phase-aligned to the logo.
 */
export function buildAlignedGrid(logo, canvasWidth, canvasHeight) {
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
export function findGridCellForTriangle(cellByPos, logoTri) {
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
export function matchGridOrientationToLogo(grid, logo) {
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
export function getOutlineSegments(logo) {
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
export function buildIntroPieces(grid, logo, { getGridColor }) {
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
export function drawPieceWithTransform(ctx, pivotX, pivotY,
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
