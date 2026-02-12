/**
 * Extensible Shape Morpher — uses MakeabilityLabLogoMorpher
 *
 * The morpher owns all triangle animation state. This sketch just:
 *   1. Loads art JSON on dropdown change (or initializes random explosion)
 *   2. Calls morpher.resetFromArt() or morpher.reset() to set the start state
 *   3. Drives morpher.update(lerpAmt) from mouse position
 *   4. Calls morpher.draw(ctx) each frame
 *
 * Future art ideas:
 *   4th of July  — star shape, red/white/blue
 *   Thanksgiving — maple leaf in red/orange/yellow
 *   New Year's   — star or firework burst
 *   Spring       — cherry blossom / flower, pink
 */

import { MakeabilityLabLogo } from '../../../lib/logo/makelab-logo.js';
import { MakeabilityLabLogoMorpher } from '../../../lib/logo/makelab-logo-morpher.js';
import { TriangleArt } from '../../../lib/logo/triangle-art.js';
import { map } from '../../../lib/math/math-utils.js';

// =============================================================================
// Constants
// =============================================================================

const TRIANGLE_SIZE    = 50;
const WIDTH_MARGIN_PCT = 0.1; // Dead zone on each side before lerp starts/ends

// =============================================================================
// State
// =============================================================================

let canvas, ctx;
let logicalWidth, logicalHeight;
let mouseX         = 0;
let currentLerpAmt = 0;

/** @type {MakeabilityLabLogoMorpher} */
let morpher = null;

/** @type {TriangleArt|null} — null when in random explosion mode */
let currentArt = null;

// =============================================================================
// Setup
// =============================================================================

async function setup() {
  canvas = document.getElementById('myCanvas');
  ctx    = canvas.getContext('2d');

  const selector = document.getElementById('shapeSelect');
  if (selector) {
    selector.addEventListener('change', (e) => loadShape(e.target.value));
    await loadShape(selector.value);
  } else {
    initRandom();
  }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKeyPressed);

  requestAnimationFrame(drawLoop);
}

// =============================================================================
// Shape loading
// =============================================================================

/**
 * Loads art JSON and initializes the morpher, or initializes random explosion
 * mode if url is empty.
 *
 * @param {string} url - Path to art JSON, or '' for random explosion.
 */
async function loadShape(url) {
  if (!url) {
    initRandom();
    return;
  }
  try {
    const artData = await TriangleArt.loadData(url);
    initMorpher(artData);
  } catch (e) {
    console.error('Could not load shape:', e);
  }
}

// =============================================================================
// Canvas resize (shared by both modes)
// =============================================================================

/**
 * Resizes the canvas to match its container, with high-DPI support.
 * Updates logicalWidth and logicalHeight.
 */
function resizeCanvas() {
  const container = canvas.parentElement;
  logicalWidth    = container.clientWidth;
  logicalHeight   = container.clientHeight;

  const dpr = window.devicePixelRatio || 1;
  canvas.width        = logicalWidth  * dpr;
  canvas.height       = logicalHeight * dpr;
  canvas.style.width  = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
}

// =============================================================================
// Morpher initialization
// =============================================================================

/**
 * Initializes the morpher in random explosion mode.
 * Triangles scatter from random positions and morph into the logo.
 */
function initRandom() {
  resizeCanvas();
  currentArt = null;

  const logoX = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);
  morpher     = new MakeabilityLabLogoMorpher(logoX, logoY, TRIANGLE_SIZE);
  morpher.makeLabLogoAnimated.isLabelVisible = true;

  morpher.reset(logicalWidth, logicalHeight);
  morpher.update(0);
}

/**
 * Initializes the morpher from a TriangleArt data object.
 * Triangles start at the art positions and morph into the logo.
 *
 * @param {Object} artData - Parsed art JSON.
 */
function initMorpher(artData) {
  if (!artData) return;
  resizeCanvas();

  const artX = (logicalWidth  - artData.numCols * TRIANGLE_SIZE) / 2;
  const artY = (logicalHeight - artData.numRows * TRIANGLE_SIZE) / 2;
  currentArt = new TriangleArt(artX, artY, TRIANGLE_SIZE, artData);

  const logoX = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);
  morpher     = new MakeabilityLabLogoMorpher(logoX, logoY, TRIANGLE_SIZE);
  morpher.makeLabLogoAnimated.isLabelVisible = true;

  morpher.resetFromArt(currentArt, logicalWidth, logicalHeight);
  morpher.update(0);
}

// =============================================================================
// Animation loop
// =============================================================================

function drawLoop() {
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  if (morpher) {
    const smallBuffer    = WIDTH_MARGIN_PCT * logicalWidth;
    const effectiveWidth = logicalWidth - 2 * smallBuffer;
    currentLerpAmt = map(mouseX, smallBuffer, effectiveWidth, 0, 1, true);

    morpher.update(currentLerpAmt);
    morpher.draw(ctx);

    // Art message fades out as morph progresses
    if (currentArt?.message) {
      currentArt.drawMessage(ctx, 1 - currentLerpAmt);
    }
  }

  requestAnimationFrame(drawLoop);
}

// =============================================================================
// Event handlers
// =============================================================================

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
}

function onTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseX = e.touches[0].clientX - rect.left;
}

function onResize() {
  if (currentArt) {
    initMorpher(currentArt.data);
  } else {
    initRandom();
  }
}

function onKeyPressed(e) {
  if (!morpher) return;
  // Toggle visibility of the static target logo for debugging
  if (e.key === 'h') morpher.makeLabLogo.visible = !morpher.makeLabLogo.visible;
}

setup();