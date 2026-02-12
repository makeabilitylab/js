import { MakeabilityLabLogo } from './makelab-logo.js';
import { Triangle } from './makelab-logo.js';
import { lerpColor } from '../graphics/color-utils.js';
import { lerp, random, easeOutCubic } from '../math/math-utils.js';
import { shuffle } from '../array-utils.js';

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
export class MakeabilityLabLogoMorpher {

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

    const logoTris = this.makeLabLogo.getAllTriangles();
    const animTris = this.makeLabLogoAnimated.getAllTriangles();
    const endSize  = this.makeLabLogo.cellSize;

    // Set all animated triangles to the neutral start color before scattering
    this.makeLabLogoAnimated.setColors(this.startFillColor, this.startStrokeColor);

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
      tri._dest  = _snapshot(dest, 0 /* angle always 0 at destination */);
      return tri;
    });
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
    const destByDir = _groupByDirection(this.makeLabLogo.getAllTriangles());
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
    const t = this.easingFunction(lerpAmt); // eased value for spatial props

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

        // Spatial: eased
        tri.x     = lerp(s.x,     d.x,     t);
        tri.y     = lerp(s.y,     d.y,     t);
        tri.size  = lerp(s.size,  d.size,  t);
        tri.angle = lerp(s.angle, d.angle, t);

        // Visual: linear
        tri.strokeWidth = lerp(s.strokeWidth,             d.strokeWidth,             lerpAmt);
        tri.fillColor   = lerpColor(s.fillColor,   d.fillColor,   lerpAmt);
        tri.strokeColor = lerpColor(s.strokeColor, d.strokeColor, lerpAmt);
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
    if (this._artMessage) {
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
    // Fade out over the first half of the morph
    const alpha = Math.max(0, 1 - lerpAmt * 2);
    if (alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha   = alpha;
    ctx.font          = `bold ${this._artMessageFontSize}px sans-serif`;
    ctx.fillStyle     = this._artMessageColor;
    ctx.textAlign     = 'center';
    ctx.textBaseline  = 'alphabetic';

    // Center horizontally over the logo; position above it vertically
    const logoBox = this.makeLabLogo.getBoundingBox();
    const cx = logoBox.x + logoBox.width  / 2;
    const cy = logoBox.y - this._artMessageFontSize * 0.3;
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

// =============================================================================
// Backward compatibility alias
// =============================================================================

/**
 * @deprecated Renamed to MakeabilityLabLogoMorpher.
 */
export const MakeabilityLabLogoExploder = MakeabilityLabLogoMorpher;