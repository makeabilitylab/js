/**
 * Makeability Lab Logo — Grid Fade animation demo.
 *
 * A grid of triangles fades in at staggered times across the whole window, then
 * the Makeability Lab logo smoothly fades in on top. The grid triangles beneath
 * the logo's 12 colored triangles fade in to those same colors and orientation,
 * so the reveal is seamless. This is the non-p5.js port of the original p5
 * sketch, built on the makelab logo library and the raw Canvas 2D API.
 *
 * See all demos: https://makeabilitylab.github.io/js/
 *
 * By Professor Jon E. Froehlich
 * https://makeabilitylab.cs.washington.edu/
 *
 * Source: https://github.com/makeabilitylab/js
 */

import {
  MakeabilityLabLogo,
  MakeabilityLabLogoGridFade,
} from 'makelab';

const TRIANGLE_SIZE = 50;
const BACKGROUND_COLOR = 'rgb(250, 250, 250)';

// Translucent white fill for the L triangles so the colorful grid shows
// through the L (its outline stays solid so the shape is still legible).
const L_TRIANGLE_FILL = 'rgba(255, 255, 255, 0.6)';

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let makeLabLogo;
let gridFade;
let animationStartMs = 0;

/**
 * (Re)builds the canvas, logo, and animation for the current window size.
 * Keeps the running clock so a resize doesn't restart the animation.
 */
function buildScene() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // High-DPI: the backing store is sized in device pixels, the CSS box in CSS
  // pixels, and ctx is scaled by dpr so we can keep drawing in CSS pixels.
  // Setting the CSS size explicitly (instead of via 100vw/100vh) is what keeps
  // the triangles perfectly square on mobile: iOS Safari's 100vh is the larger
  // url-bar-collapsed height, so a 100vh canvas gets stretched vertically and
  // the squares distort. Matching the CSS box to innerWidth/innerHeight keeps
  // the backing-to-CSS ratio uniform. setTransform (not scale) avoids the
  // cumulative-scale bug across rebuilds.
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Center the logo (6×4 cells) in the window.
  const logoX = Math.round((w - MakeabilityLabLogo.numCols * TRIANGLE_SIZE) / 2);
  const logoY = Math.round((h - MakeabilityLabLogo.numRows * TRIANGLE_SIZE) / 2);

  // Preserve toggles across rebuilds.
  const logoVisible = makeLabLogo ? makeLabLogo.visible : true;
  const gridVisible = gridFade ? gridFade.grid.visible : true;

  makeLabLogo = new MakeabilityLabLogo(logoX, logoY, TRIANGLE_SIZE);
  makeLabLogo.visible = logoVisible;

  // Let the grid show through the L by making its triangle fills translucent.
  for (const tri of makeLabLogo.getLTriangles()) {
    tri.fillColor = L_TRIANGLE_FILL;
  }

  gridFade = new MakeabilityLabLogoGridFade(makeLabLogo, w, h);
  gridFade.grid.visible = gridVisible;

  // Expose for console tinkering.
  window.makeLabLogo = makeLabLogo;
  window.gridFade = gridFade;
}

/**
 * One render frame: advance the animation by the elapsed time and draw.
 * @param {number} now - High-resolution timestamp from requestAnimationFrame.
 */
function frame(now) {
  if (animationStartMs === 0) animationStartMs = now;
  const elapsedMs = now - animationStartMs;

  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  gridFade.update(elapsedMs);
  gridFade.draw(ctx);

  requestAnimationFrame(frame);
}

// Rebuild on resize (debounced). The clock keeps running, so an already-revealed
// logo stays revealed rather than replaying.
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildScene, 150);
});

// --- Interaction ---

/** Restart the animation from the beginning. */
function replay() {
  gridFade.reset();
  animationStartMs = 0;
}

// Tap to replay on touch devices (which have no keyboard). Mouse clicks are
// ignored so desktop users aren't surprised — they have the keyboard shortcuts.
canvas.addEventListener('pointerup', (event) => {
  if (event.pointerType === 'mouse') return;
  replay();
});

// Keyboard shortcuts (desktop).
document.addEventListener('keydown', (event) => {
  switch (event.key.toLowerCase()) {
    case 'r': // replay from the beginning
      replay();
      break;
    case 'g': // toggle the background grid
      gridFade.grid.visible = !gridFade.grid.visible;
      break;
    case 'h': // toggle the logo
      makeLabLogo.visible = !makeLabLogo.visible;
      break;
    default:
      return;
  }
});

buildScene();
requestAnimationFrame(frame);
