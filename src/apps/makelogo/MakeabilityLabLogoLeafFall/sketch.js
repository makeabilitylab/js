/**
 * Makeability Lab Logo — Leaf Fall animation demo.
 *
 * A grid of triangles flutters down from the top of the screen like falling
 * leaves — weaving and tumbling — and settles into place. After the grid starts
 * filling in, the Makeability Lab logo's own pieces fall in the same way: each
 * logo triangle and each individual segment of the M and L outlines drifts down
 * and lands to compose the finished logo on top of the aligned grid. Built on
 * the makelab logo library and the raw Canvas 2D API (no p5.js).
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
  MakeabilityLabLogoLeafFall,
} from '../../../lib/logo/index.js';

const TRIANGLE_SIZE = 50;
const BACKGROUND_COLOR = 'rgb(250, 250, 250)';

// Translucent white fill for the L triangles so the colorful grid shows
// through the L (its outline stays solid so the shape is still legible).
const L_TRIANGLE_FILL = 'rgba(255, 255, 255, 0.6)';

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let makeLabLogo;
let leafFall;
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
  const gridVisible = leafFall ? leafFall.grid.visible : true;

  makeLabLogo = new MakeabilityLabLogo(logoX, logoY, TRIANGLE_SIZE);
  makeLabLogo.visible = logoVisible;

  // Let the grid show through the L by making its triangle fills translucent.
  for (const tri of makeLabLogo.getLTriangles()) {
    tri.fillColor = L_TRIANGLE_FILL;
  }

  leafFall = new MakeabilityLabLogoLeafFall(makeLabLogo, w, h);
  leafFall.grid.visible = gridVisible;

  // Expose for console tinkering.
  window.makeLabLogo = makeLabLogo;
  window.leafFall = leafFall;
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

  leafFall.update(elapsedMs);
  leafFall.draw(ctx);

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
  leafFall.reset();
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
      leafFall.grid.visible = !leafFall.grid.visible;
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
