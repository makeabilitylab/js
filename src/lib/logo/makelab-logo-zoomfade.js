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

import { MakeabilityLabLogoColorer } from './makelab-logo.js';
import {
  buildAlignedGrid,
  matchGridOrientationToLogo,
  buildIntroPieces,
  drawPieceWithTransform,
} from './makelab-logo-intro-utils.js';
import { clamp, lerp, easeOutCubic } from '../math/math-utils.js';

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
export class MakeabilityLabLogoZoomFade {
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
