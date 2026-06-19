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

import { Grid, Triangle, MakeabilityLabLogoColorer } from './makelab-logo.js';
import { lerpColor } from '../graphics/color-utils.js';
import { clamp, easeOutCubic } from '../math/math-utils.js';

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
export class MakeabilityLabLogoGridFade {
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
    this.grid = new Grid(canvasWidth, canvasHeight, makeLabLogo.cellSize,
      undefined, undefined, makeLabLogo.x, makeLabLogo.y);

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
    // Index grid cells by their (rounded) origin for position lookup.
    const cellByPos = new Map();
    for (const row of this.grid.gridArray) {
      for (const cell of row) {
        cellByPos.set(`${Math.round(cell.tri1.x)},${Math.round(cell.tri1.y)}`, cell);
      }
    }

    // 1. Match orientation across the whole logo footprint.
    for (const logoTri of this.makeLabLogo.getAllTriangles()) {
      const cell = cellByPos.get(`${Math.round(logoTri.x)},${Math.round(logoTri.y)}`);
      if (!cell) continue;
      if (cell.tri1.direction !== logoTri.direction &&
          cell.tri2.direction !== logoTri.direction) {
        cell.tri1.direction = logoTri.direction;
        cell.tri2.direction = Triangle.getOppositeDirection(logoTri.direction);
      }
    }

    // 2. Pin the 12 colored triangles' grid counterparts to the logo's colors.
    for (const logoTri of this.makeLabLogo.getDefaultColoredTriangles()) {
      const cell = cellByPos.get(`${Math.round(logoTri.x)},${Math.round(logoTri.y)}`);
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
