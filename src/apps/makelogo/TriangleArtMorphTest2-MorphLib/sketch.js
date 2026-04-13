/**
 * Extensible Shape Morpher — uses MakeabilityLabLogoMorpher
 *
 * The morpher owns all triangle animation state. This sketch just:
 *   1. Loads art JSON on dropdown change (or initializes random explosion)
 *   2. Calls morpher.resetFromArt() or morpher.reset() to set the start state
 *   3. Drives morpher.update(lerpAmt) from mouse position or auto-play timer
 *   4. Calls morpher.draw(ctx) each frame
 *
 * Drive modes:
 *   - Mouse:    lerpAmt tracks horizontal mouse position (original behavior)
 *   - Playback: lerpAmt driven by timer; supports direction, repeat, easing
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
import {
  map,
  easeOutCubic,
  easeOutQuad,
  easeInCubic,
  easeInOutCubic
} from '../../../lib/math/math-utils.js';

// =============================================================================
// Constants
// =============================================================================

const TRIANGLE_SIZE    = 50;
const WIDTH_MARGIN_PCT = 0.1;

/** Lookup table for easing functions selectable from the UI. */
const EASING_FUNCTIONS = {
  easeOutCubic,
  easeOutQuad,
  easeInCubic,
  easeInOutCubic,
  linear: (t) => t,
};

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

// ── Drive mode ──

/** @type {'mouse'|'playback'} */
let driveMode = 'mouse';

// ── Playback state ──

let isPlaying        = false;
let playbackStart    = 0;       // timestamp (ms) when current leg began
let playbackDuration = 3000;    // ms, updated from the duration slider
let playbackReversed = false;   // true when direction is "Logo → Art"

/**
 * In ping-pong repeat mode, tracks which direction the current leg is going.
 * +1 = forward (toward end state), -1 = backward (toward start state).
 */
let pingPongDir = 1;

// ── Dwell (pause at endpoints during ping-pong) ──

let dwellUntil    = 0;     // timestamp (ms) when current pause expires; 0 = not dwelling
let pauseDuration = 1000;  // ms, updated from the pause slider

// =============================================================================
// Setup
// =============================================================================

async function setup() {
  canvas = document.getElementById('myCanvas');
  ctx    = canvas.getContext('2d');

  // ── Shape selector ──
  const selector = document.getElementById('shapeSelect');
  if (selector) {
    selector.addEventListener('change', (e) => loadShape(e.target.value));
    await loadShape(selector.value);
  } else {
    initRandom();
  }

  // ── Drive mode radios ──
  document.querySelectorAll('input[name="driveMode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      driveMode = e.target.value;
      updatePlaybackControlsState();
      if (driveMode === 'mouse') {
        stopPlayback();
      } else {
        // Enter playback mode: freeze at start state until Play is pressed
        currentLerpAmt = 0;
      }
    });
  });
  updatePlaybackControlsState();

  // ── Easing selector ──
  const easingSel = document.getElementById('easingSelect');
  if (easingSel) {
    easingSel.addEventListener('change', () => applyEasing());
  }

  // ── Direction selector ──
  const dirSel = document.getElementById('directionSelect');
  if (dirSel) {
    dirSel.addEventListener('change', () => {
      playbackReversed = (dirSel.value === 'logoToArt');
      // If not currently playing, snap to the new start state
      if (!isPlaying) {
        currentLerpAmt = playbackReversed ? 1 : 0;
      }
    });
  }

  // ── Duration slider ──
  const durRange = document.getElementById('durationRange');
  const durLabel = document.getElementById('durationValue');
  if (durRange) {
    durRange.addEventListener('input', () => {
      playbackDuration = parseFloat(durRange.value) * 1000;
      if (durLabel) durLabel.textContent = `${durRange.value}s`;
    });
    playbackDuration = parseFloat(durRange.value) * 1000;
  }

  // ── Pause slider ──
  const pauseRange = document.getElementById('pauseRange');
  const pauseLabel = document.getElementById('pauseValue');
  if (pauseRange) {
    pauseRange.addEventListener('input', () => {
      pauseDuration = parseFloat(pauseRange.value) * 1000;
      if (pauseLabel) pauseLabel.textContent = `${pauseRange.value}s`;
    });
    pauseDuration = parseFloat(pauseRange.value) * 1000;
  }

  // ── Play button ──
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    playBtn.addEventListener('click', togglePlayback);
  }

  // ── Message toggle ──
  const msgToggle = document.getElementById('showMessage');
  if (msgToggle) {
    msgToggle.addEventListener('change', () => {
      if (morpher) morpher.artMessageVisible = msgToggle.checked;
    });
  }

  // ── Canvas / window events ──
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
  stopPlayback();
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
// Canvas resize
// =============================================================================

/**
 * Resizes the canvas to match its container, with high-DPI support.
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
 */
function initRandom() {
  resizeCanvas();
  currentArt = null;

  const logoX = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);
  morpher     = new MakeabilityLabLogoMorpher(logoX, logoY, TRIANGLE_SIZE);
  morpher.makeLabLogoAnimated.isLabelVisible = true;

  morpher.reset(logicalWidth, logicalHeight);
  applyEasing();
  syncMessageVisibility();
  morpher.update(0);
}

/**
 * Initializes the morpher from a TriangleArt data object.
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
  applyEasing();
  syncMessageVisibility();
  morpher.update(0);
}

// =============================================================================
// UI → morpher sync helpers
// =============================================================================

/** Applies the currently selected easing function to the morpher. */
function applyEasing() {
  if (!morpher) return;
  const sel = document.getElementById('easingSelect');
  const key = sel ? sel.value : 'easeOutCubic';
  morpher.easingFunction = EASING_FUNCTIONS[key] ?? easeOutCubic;
}

/** Syncs the message-visibility checkbox state to the morpher. */
function syncMessageVisibility() {
  if (!morpher) return;
  const cb = document.getElementById('showMessage');
  morpher.artMessageVisible = cb ? cb.checked : true;
}

/** Enables or disables the playback controls based on drive mode. */
function updatePlaybackControlsState() {
  const panel = document.getElementById('playbackControls');
  if (!panel) return;
  panel.classList.toggle('disabled', driveMode === 'mouse');
}

// =============================================================================
// Playback control
// =============================================================================

function togglePlayback() {
  if (driveMode !== 'playback') return;
  if (isPlaying) {
    stopPlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  isPlaying     = true;
  pingPongDir   = 1;
  dwellUntil    = 0;
  playbackStart = performance.now();

  // Start from the correct initial state based on direction
  currentLerpAmt = playbackReversed ? 1 : 0;

  updatePlayButton(true);
}

function stopPlayback() {
  isPlaying  = false;
  dwellUntil = 0;
  updatePlayButton(false);
}

/** Updates the play button label and style. */
function updatePlayButton(playing) {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.textContent = playing ? '\u23F9 Stop' : '\u25B6 Play';
  btn.classList.toggle('playing', playing);
}

// =============================================================================
// Animation loop
// =============================================================================

function drawLoop(timestamp) {
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  if (morpher) {
    if (driveMode === 'playback') {
      if (isPlaying) {
        currentLerpAmt = computePlaybackLerp(timestamp);
      }
      // When not playing in playback mode, currentLerpAmt stays frozen
    } else {
      // Mouse-driven mode
      const smallBuffer    = WIDTH_MARGIN_PCT * logicalWidth;
      const effectiveWidth = logicalWidth - 2 * smallBuffer;
      currentLerpAmt = map(mouseX, smallBuffer, effectiveWidth, 0, 1, true);
    }

    morpher.update(currentLerpAmt);
    morpher.draw(ctx);
  }

  requestAnimationFrame(drawLoop);
}

/**
 * Computes the current lerpAmt for playback mode, handling direction,
 * ping-pong repeat, and dwell pauses at each endpoint.
 *
 * @param {number} timestamp - Current requestAnimationFrame timestamp.
 * @returns {number} lerpAmt in [0, 1].
 */
function computePlaybackLerp(timestamp) {
  const isRepeating = document.getElementById('repeatCheck')?.checked ?? false;

  // ── Currently dwelling at an endpoint ──
  if (dwellUntil > 0) {
    if (timestamp < dwellUntil) {
      // Still pausing — hold at the endpoint
      return currentLerpAmt;
    }
    // Dwell expired — flip direction and start the next leg
    pingPongDir *= -1;
    playbackStart = timestamp;
    dwellUntil = 0;
  }

  // ── Compute progress through the current leg ──
  const elapsed  = timestamp - playbackStart;
  const progress = Math.min(elapsed / playbackDuration, 1);

  // Map progress to lerpAmt based on direction and ping-pong state.
  // pingPongDir: +1 = animating toward the end state, -1 = animating back.
  // playbackReversed: if true, "end state" is art (lerp=0) not logo (lerp=1).
  let lerp;
  if (pingPongDir === 1) {
    lerp = playbackReversed ? 1 - progress : progress;
  } else {
    lerp = playbackReversed ? progress : 1 - progress;
  }

  // ── Handle end-of-leg ──
  if (progress >= 1) {
    if (isRepeating) {
      // Begin dwelling at this endpoint
      dwellUntil = timestamp + pauseDuration;
    } else {
      stopPlayback();
    }
  }

  return lerp;
}

// =============================================================================
// Event handlers
// =============================================================================

function onMouseMove(e) {
  if (driveMode !== 'mouse') return;
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
}

function onTouchMove(e) {
  if (driveMode !== 'mouse') return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseX = e.touches[0].clientX - rect.left;
}

function onResize() {
  stopPlayback();
  if (currentArt) {
    initMorpher(currentArt.data);
  } else {
    initRandom();
  }
}

function onKeyPressed(e) {
  if (!morpher) return;
  if (e.key === 'h') morpher.makeLabLogo.visible = !morpher.makeLabLogo.visible;
  if (e.key === ' ' && driveMode === 'playback') {
    e.preventDefault();
    togglePlayback();
  }
}

setup();