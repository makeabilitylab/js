/**
 * @file sketch.js
 * @description Reverse-explosion animation demo for the Makeability Lab logo.
 * 
 * The animation starts with logo triangles scattered across the canvas in random
 * positions, sizes, and angles. As the user moves their mouse from left to right,
 * the triangles interpolate (lerp) toward their correct positions, sizes, and colors
 * in the final assembled logo.
 * 
 * Two logo instances are used:
 *   - makeLabLogo:         The invisible "target" — defines where triangles should end up.
 *   - makeLabLogoAnimated: The visible animated logo whose triangle properties are
 *                          interpolated each frame between the exploded and final states.
 * 
 * Performance note: The background grid is rendered once into an offscreen canvas
 * (gridCache) and composited with a single drawImage() call per frame. This avoids
 * iterating all grid triangles on every mousemove event, which caused choppiness.
 * 
 * See all demos: https://makeabilitylab.github.io/js/
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 */

import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from '/dist/makelab.all.js';
import { lerpColor } from '/dist/makelab.all.js';
import { lerp, random } from '/dist/makelab.all.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRIANGLE_SIZE = 50;
const BACKGROUND_COLOR = "rgb(250, 250, 250)";

// How many pixels short of the right edge the interaction zone ends.
// Prevents the animation from being stuck at lerpAmt < 1 on wide screens.
const INTERACTION_BUFFER_PX = 50;

// ---------------------------------------------------------------------------
// Canvas & context
// ---------------------------------------------------------------------------

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

/** Logical (CSS pixel) canvas dimensions — used for all drawing calculations. */
let logicalWidth, logicalHeight;

/** Background grid object. Toggled via 'g' key. */
let makeLabGrid;

/**
 * Offscreen canvas that holds a pre-rendered snapshot of the grid.
 * Rebuilt whenever the canvas resizes or the grid changes. Composited into
 * the main canvas with a single drawImage() call each frame instead of
 * iterating every grid triangle, which is significantly faster during animation.
 * @type {HTMLCanvasElement|null}
 */
let gridCache = null;

/**
 * The invisible "target" logo. Its triangle positions/sizes define the final
 * assembled state that makeLabLogoAnimated lerps toward.
 * @type {MakeabilityLabLogo|null}
 */
let makeLabLogo = null;

/**
 * The visible animated logo. Its triangle properties are updated each frame
 * by interpolating between originalRandomTriLocs (start) and makeLabLogo (end).
 * @type {MakeabilityLabLogo|null}
 */
let makeLabLogoAnimated = null;

/**
 * Snapshot of the exploded (start) state for each animated triangle.
 * Captured once in resetRandomTriLocs() and read on every mousemove.
 * @type {Array<{x: number, y: number, angle: number, size: number}>}
 */
let originalRandomTriLocs = [];

// ---------------------------------------------------------------------------
// Animation flags — each can be toggled at runtime via keyboard shortcuts
// ---------------------------------------------------------------------------

/** If true, triangles start with randomized sizes. */
let explodeSize = true;

/** If true, triangles start with randomized rotation angles. */
let explodeAngle = true;

/** If true, triangles start at randomized X positions. */
let explodeX = true;

/** If true, triangles start at randomized Y positions. */
let explodeY = true;

// ---------------------------------------------------------------------------
// Core functions
// ---------------------------------------------------------------------------

/**
 * Initializes or re-initializes the canvas for the current window size.
 * 
 * Called once on first load (isResize=false) and again whenever the window
 * is resized (isResize=true). On resize, the existing logo objects are
 * repositioned rather than recreated so the animation state is preserved —
 * the exploded triangles stay where they are while the target logo moves to
 * the new center.
 *
 * High-DPI (Retina) handling: the canvas drawing buffer is scaled by
 * devicePixelRatio so lines are crisp on high-density displays, while all
 * drawing coordinates remain in logical (CSS) pixels.
 *
 * @param {boolean} [isResize=false] - Pass true when called from the resize
 *   listener to preserve animation state.
 */
function setupCanvas(isResize = false) {

  // 1. Read the canvas's CSS size and store as logical dimensions.
  //    All drawing math uses these values; DPR scaling is applied to the
  //    context separately so we never have to think about it again.
  const rect = canvas.getBoundingClientRect();
  logicalWidth  = rect.width;
  logicalHeight = rect.height;

  // 2. Scale the drawing buffer to physical pixels for crisp rendering.
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = logicalWidth  * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width  = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  // Reset any previous transform before applying the new DPR scale.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // 3. Compute the logo's centered position, accounting for the M outline
  //    stroke width. The M outline is painted half inside / half outside the
  //    grid boundary, so we shift the origin inward by half the stroke width
  //    to keep the visual bleed symmetric on all four edges.
  const strokePadding = makeLabLogo
    ? makeLabLogo.mOutlineStrokeWidth                    // use live value if logo exists
    : MakeabilityLabLogo.DEFAULT_M_OUTLINE_STROKE_WIDTH; // fall back to default on first load

  const xLogo = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth,  false, strokePadding);
  const yLogo = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight, false, strokePadding);

  // 4. Rebuild the grid with the logo's origin as its offset so grid lines
  //    fall exactly on logo cell boundaries. Then cache it to an offscreen
  //    canvas so the animation loop can composite it cheaply.
  makeLabGrid = new Grid(logicalWidth, logicalHeight, TRIANGLE_SIZE,
                         undefined, undefined, xLogo, yLogo);
  rebuildGridCache();

  // 5. Handle logo state depending on whether this is a first load or resize.
  if (!makeLabLogo || !isResize) {

    // FIRST LOAD: create both logo instances fresh.
    // makeLabLogo is the invisible target; makeLabLogoAnimated is what the user sees.
    makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
    makeLabLogo.visible = false; // hidden — used only as a reference for end positions

    makeLabLogoAnimated = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
    makeLabLogoAnimated.isLOutlineVisible = false; // outline reveals at lerpAmt === 1
    makeLabLogoAnimated.isMOutlineVisible = false;

    // Scatter triangles to their random starting positions.
    resetRandomTriLocs();

  } else {

    // RESIZE: reposition both logos to the new center without recreating them.
    // This preserves all triangle colors, sizes, and angles mid-animation.
    makeLabLogo.setLogoPosition(xLogo, yLogo);
    makeLabLogoAnimated.setLogoPosition(xLogo, yLogo);

    // Deliberately do NOT call resetRandomTriLocs() — the exploded triangles
    // stay wherever they are on screen while the target snaps to the new center.
  }

  draw(ctx);
}

/**
 * Renders the current grid into an offscreen canvas for fast compositing.
 *
 * The grid is a static layer — it never changes between frames during the
 * animation. Drawing it triangle-by-triangle on every mousemove event is
 * expensive and causes visible choppiness. Instead we pre-render it here
 * into `gridCache` and composite it with a single drawImage() call in draw().
 *
 * Must be called whenever makeLabGrid is recreated (i.e., on every resize).
 */
function rebuildGridCache() {
  gridCache = document.createElement('canvas');
  gridCache.width  = canvas.width;   
  gridCache.height = canvas.height;

  const offCtx = gridCache.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  offCtx.scale(dpr, dpr);

  // Clear to transparent so the main canvas background shows through
  offCtx.clearRect(0, 0, logicalWidth, logicalHeight);

  makeLabGrid.draw(offCtx);
}

/**
 * Scatters the animated logo's triangles to random starting positions.
 *
 * Each triangle in makeLabLogoAnimated is assigned a random position, size,
 * and/or angle depending on the current explode flags. The starting state is
 * also stored in originalRandomTriLocs so mouseMoved() can interpolate between
 * the start (exploded) and end (assembled) states.
 *
 * Only called on first load and when the user presses 'r'. NOT called on
 * resize — the existing explosion stays in place.
 */
function resetRandomTriLocs() {
  originalRandomTriLocs = [];

  // The static logo provides the end-state positions; the animated logo is
  // what we're scattering and will later lerp back into place.
  const staticTriangles   = makeLabLogo.getAllTriangles(true);
  const animatedTriangles = makeLabLogoAnimated.getAllTriangles(true);

  for (let i = 0; i < animatedTriangles.length; i++) {
    const tri = animatedTriangles[i];

    // Randomize each property only if the corresponding flag is enabled.
    // When a flag is off, use the triangle's assembled value so that dimension
    // stays fixed while the others animate.
    const randSize = explodeSize  ? random(TRIANGLE_SIZE / 2, TRIANGLE_SIZE * 3) : TRIANGLE_SIZE;
    const xPos     = explodeX     ? random(randSize, logicalWidth  - randSize)    : staticTriangles[i].x;
    const yPos     = explodeY     ? random(randSize, logicalHeight - randSize)    : staticTriangles[i].y;
    const angle    = explodeAngle ? random(0, 360)                                : 0;

    // Apply the exploded state directly to the triangle so it renders immediately.
    tri.x     = xPos;
    tri.y     = yPos;
    tri.angle = angle;
    tri.size  = randSize;

    // Store a snapshot for interpolation in mouseMoved().
    originalRandomTriLocs.push({ x: xPos, y: yPos, angle, size: randSize });
  }

  console.log(`resetRandomTriLocs: ${originalRandomTriLocs.length} triangles scattered`);
}

/**
 * Updates all animated triangle properties based on mouse X position.
 *
 * The mouse X coordinate is normalized to a lerpAmt in [0, 1] — 0 at the
 * left edge (fully exploded) and 1 near the right edge (fully assembled).
 * Both position/size and fill color are interpolated independently.
 *
 * @param {MouseEvent} event - The DOM mousemove event.
 */
function mouseMoved(event) {
  const rect   = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;

  // Normalize to [0, 1]. The interaction zone ends INTERACTION_BUFFER_PX short
  // of the right edge so the animation can reach lerpAmt=1 before the cursor
  // hits the canvas boundary.
  const interactionWidth = rect.width - INTERACTION_BUFFER_PX;
  const lerpAmt = Math.min(Math.max(mouseX / interactionWidth, 0), 1);

  // Reveal the L outline only when fully assembled so it doesn't float
  // around awkwardly during the animation.
  makeLabLogoAnimated.isLOutlineVisible = (lerpAmt >= 1);

  const staticTriangles   = makeLabLogo.getAllTriangles(true);
  const animatedTriangles = makeLabLogoAnimated.getAllTriangles(true);

  // --- 1. Interpolate position, angle, and size ---
  for (let i = 0; i < originalRandomTriLocs.length; i++) {
    const start = originalRandomTriLocs[i];
    const end   = staticTriangles[i];

    animatedTriangles[i].x     = lerp(start.x,     end.x,    lerpAmt);
    animatedTriangles[i].y     = lerp(start.y,      end.y,    lerpAmt);
    animatedTriangles[i].size  = lerp(start.size,   end.size, lerpAmt);
    // Angle always lerps toward 0 (the assembled, unrotated state).
    animatedTriangles[i].angle = lerp(start.angle,  0,        lerpAmt);
  }

  // --- 2. Interpolate fill color ---
  // The colored accent triangles start white and fade into their brand colors.
  const animatedColoredTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
  for (let i = 0; i < animatedColoredTriangles.length; i++) {
    const startColor = { r: 255, g: 255, b: 255, a: 1 }; // white
    const endColor   = ORIGINAL_COLOR_ARRAY[i];
    animatedColoredTriangles[i].fillColor = lerpColor(startColor, endColor, lerpAmt);
  }

  draw(ctx);
}

/**
 * Clears the canvas and composites all visible layers.
 *
 * Layer order (back to front):
 *   1. Solid background fill
 *   2. Grid (composited from offscreen cache — O(1) regardless of grid size)
 *   3. Static logo (hidden by default, toggled with 'h' for debugging)
 *   4. Animated logo
 *
 * @param {CanvasRenderingContext2D} ctx - The main canvas 2D context.
 */
function draw(ctx) {
  // 1. Clear main canvas to background color
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // 2. Composite the pre-rendered transparent grid from the offscreen cache
  if (makeLabGrid && makeLabGrid.visible && gridCache) {
    ctx.drawImage(gridCache, 0, 0, logicalWidth, logicalHeight);
  }

  // 3. Static logo (target)
  if (makeLabLogo && makeLabLogo.visible) {
    makeLabLogo.draw(ctx);
  }

  // 4. Animated logo
  if (makeLabLogoAnimated) {
    makeLabLogoAnimated.draw(ctx);
  }
}

/**
 * Prints all keyboard shortcuts to the browser console.
 * Called once after setup so the controls are visible on load.
 */
function printMenu() {
  console.log("--- Interactive Menu ---");
  console.log("Move mouse left→right to drive the assembly animation.");
  console.log("Press 'a' to toggle explode angle.  Currently:", explodeAngle);
  console.log("Press 'd' to toggle debug bounding boxes. Currently:", makeLabLogoAnimated.drawBoundingBox);
  console.log("Press 'g' to toggle grid.            Currently:", makeLabGrid?.visible ?? false);
  console.log("Press 'h' to toggle hidden target logo. Currently:", makeLabLogo.visible);
  console.log("Press 'k' to toggle L triangle strokes. Currently:", makeLabLogoAnimated.areLTriangleStrokesVisible);
  console.log("Press 'l' to toggle L outline.       Currently:", makeLabLogoAnimated.isLOutlineVisible);
  console.log("Press 'm' to toggle M outline.       Currently:", makeLabLogoAnimated.isMOutlineVisible);
  console.log("Press 'r' to reset / re-scatter triangles.");
  console.log("Press 's' to toggle explode size.    Currently:", explodeSize);
  console.log("Press 'x' to toggle explode X.       Currently:", explodeX);
  console.log("Press 'y' to toggle explode Y.       Currently:", explodeY);
  console.log("");
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

setupCanvas(false);
printMenu();

// ---------------------------------------------------------------------------
// Event listeners
// ---------------------------------------------------------------------------

// Drive the animation with mouse position.
canvas.addEventListener('mousemove', mouseMoved);

// Re-initialize on window resize, preserving animation state.
window.addEventListener('resize', () => setupCanvas(true));

document.addEventListener('keydown', function(event) {
  const key = event.key;

  switch (key) {

    case 'a':
      // Toggle whether triangles explode with random angles.
      explodeAngle = !explodeAngle;
      console.log("Explode angle:", explodeAngle);
      resetRandomTriLocs();
      draw(ctx);
      break;

    case 'd':
      // Toggle bounding-box debug overlays on the animated logo.
      makeLabLogoAnimated.drawBoundingBox = !makeLabLogoAnimated.drawBoundingBox;
      makeLabLogoAnimated.setDrawDebugInfo(makeLabLogoAnimated.drawBoundingBox);
      console.log("Debug bounding boxes:", makeLabLogoAnimated.drawBoundingBox);
      draw(ctx);
      break;

    case 'g':
      // Toggle grid visibility. The grid cache is still valid — we just skip
      // the drawImage() call in draw() when visible is false.
      makeLabGrid.visible = !makeLabGrid.visible;
      console.log("Grid visible:", makeLabGrid.visible);
      draw(ctx);
      break;

    case 'h':
      // Show/hide the invisible target logo for debugging.
      makeLabLogo.visible = !makeLabLogo.visible;
      console.log("Target logo visible:", makeLabLogo.visible);
      draw(ctx);
      break;

    case 'k':
      makeLabLogoAnimated.areLTriangleStrokesVisible = !makeLabLogoAnimated.areLTriangleStrokesVisible;
      console.log("L triangle strokes:", makeLabLogoAnimated.areLTriangleStrokesVisible);
      draw(ctx);
      break;

    case 'l':
      // Note: lOutlineVisible is also set automatically in mouseMoved()
      // based on lerpAmt, so toggling it here only persists until the next
      // mouse movement.
      makeLabLogoAnimated.isLOutlineVisible = !makeLabLogoAnimated.isLOutlineVisible;
      console.log("L outline visible:", makeLabLogoAnimated.isLOutlineVisible);
      draw(ctx);
      break;

    case 'm':
      makeLabLogoAnimated.isMOutlineVisible = !makeLabLogoAnimated.isMOutlineVisible;
      console.log("M outline visible:", makeLabLogoAnimated.isMOutlineVisible);
      draw(ctx);
      break;

    case 'r':
      // Re-scatter all triangles to new random positions and restart the animation.
      console.log("Resetting triangle positions...");
      resetRandomTriLocs();
      draw(ctx);
      break;

    case 's':
      // Toggle whether triangles explode with random sizes.
      explodeSize = !explodeSize;
      console.log("Explode size:", explodeSize);
      resetRandomTriLocs();
      draw(ctx);
      break;

    case 'x':
      // Toggle whether triangles explode to random X positions.
      explodeX = !explodeX;
      console.log("Explode X:", explodeX);
      resetRandomTriLocs();
      draw(ctx);
      break;

    case 'y':
      // Toggle whether triangles explode to random Y positions.
      explodeY = !explodeY;
      console.log("Explode Y:", explodeY);
      resetRandomTriLocs();
      draw(ctx);
      break;
  }
});