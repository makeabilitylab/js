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

import { MakeabilityLabLogoColorer } from './makelab-logo.js';
import {
  buildAlignedGrid,
  matchGridOrientationToLogo,
  buildIntroPieces,
  drawPieceWithTransform,
} from './makelab-logo-intro-utils.js';
import { clamp, lerp, easeOutCubic } from '../math/math-utils.js';

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
export class MakeabilityLabLogoLeafFall {
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
