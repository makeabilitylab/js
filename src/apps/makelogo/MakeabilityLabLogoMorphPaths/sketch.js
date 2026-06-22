/**
 * Morph Paths — non-linear reverse-explosion / morph trajectories.
 *
 * Demonstrates the pluggable path system on MakeabilityLabLogoMorpher: triangles
 * assemble into the logo along a chosen trajectory (linear, arc, Bézier, spiral)
 * instead of a straight line, with selectable easing and per-piece stagger.
 *
 * A floating left sidebar exposes every parameter live. The sketch itself just:
 *   1. Builds the morpher (random explosion or an art shape as the start state)
 *   2. Applies the chosen path / easing / stagger
 *   3. Drives morpher.update(lerpAmt) from the mouse or an auto-play timer
 *   4. Calls morpher.draw(ctx) each frame
 *
 * By Jon E. Froehlich — https://makeabilitylab.io
 */

import {
  MakeabilityLabLogo, Grid, MakeabilityLabLogoMorpher, TriangleArt,
  linearPath, arcPath, bezierPath, spiralPath,
  map, easeOutCubic, easeOutQuad, easeInCubic, easeInOutCubic, easeOutBack,
} from 'makelab';

// =============================================================================
// Constants
// =============================================================================

const WIDTH_MARGIN_PCT = 0.1;

/** Easing functions selectable from the UI. */
const EASING_FUNCTIONS = {
  easeOutCubic,
  easeOutQuad,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
  linear: (t) => t,
};

// =============================================================================
// State
// =============================================================================

let canvas, ctx;
let logicalWidth, logicalHeight;
let mouseX         = 0;
let currentLerpAmt = 0;
let triangleSize   = 50;

/** @type {MakeabilityLabLogoMorpher} */
let morpher = null;

/** @type {TriangleArt|null} — null when in random explosion mode */
let currentArt = null;

/** @type {Grid|null} — faint background grid, drawn when "Show grid" is on */
let bgGrid = null;

/** @type {'mouse'|'playback'} */
let driveMode = 'mouse';

// ── Playback state (mirrors the Shape Morph demo) ──
let isPlaying        = false;
let playbackStart    = 0;
let playbackDuration = 3000;
let playbackReversed = false;
let pingPongDir      = 1;
let dwellUntil       = 0;
let pauseDuration    = 1000;

// =============================================================================
// Setup
// =============================================================================

async function setup() {
  canvas = document.getElementById('myCanvas');
  ctx    = canvas.getContext('2d');

  // ── Source selector ──
  const selector = document.getElementById('shapeSelect');
  selector.addEventListener('change', (e) => loadShape(e.target.value));

  // ── Path style radios + params ──
  document.querySelectorAll('input[name="pathStyle"]').forEach((radio) => {
    radio.addEventListener('change', () => { updatePathParamState(); applyPath(); });
  });
  bindRange('arcRange', 'arcValue', (v) => v.toFixed(2), () => applyPath());
  bindRange('spiralRange', 'spiralValue', (v) => `${v}`, () => applyPath());

  // ── Easing ──
  document.getElementById('easingSelect')
    .addEventListener('change', applyEasing);

  // ── Stagger (read live; no re-scatter needed) ──
  bindRange('staggerRange', 'staggerValue', (v) => v.toFixed(2), applyStagger);

  // ── Triangle size (rebuilds the morpher) ──
  bindRange('sizeRange', 'sizeValue', (v) => `${v}`, (v) => {
    triangleSize = v;
    reinit();
  });

  // ── Layout toggles ──
  document.getElementById('showGrid')
    .addEventListener('change', () => {}); // read live in drawLoop
  document.getElementById('showGhost')
    .addEventListener('change', syncGhost);
  document.getElementById('showMessage')
    .addEventListener('change', syncMessageVisibility);

  // ── Drive mode ──
  document.querySelectorAll('input[name="driveMode"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      driveMode = e.target.value;
      updatePlaybackControlsState();
      if (driveMode === 'mouse') stopPlayback();
      else currentLerpAmt = playbackReversed ? 1 : 0;
    });
  });
  updatePlaybackControlsState();

  // ── Playback controls ──
  document.getElementById('directionSelect').addEventListener('change', (e) => {
    playbackReversed = (e.target.value === 'logoToArt');
    if (!isPlaying) currentLerpAmt = playbackReversed ? 1 : 0;
  });
  bindRange('durationRange', 'durationValue', (v) => `${v}s`, (v) => {
    playbackDuration = v * 1000;
  });
  bindRange('pauseRange', 'pauseValue', (v) => `${v}s`, (v) => {
    pauseDuration = v * 1000;
  });
  document.getElementById('playBtn').addEventListener('click', togglePlayback);

  // ── Re-scatter button ──
  document.getElementById('scatterBtn').addEventListener('click', reinit);

  // ── Sidebar collapse ──
  const toggle = document.getElementById('sidebarToggle');
  toggle.addEventListener('click', () => {
    const open = document.getElementById('sidebar').classList.toggle('collapsed');
    toggle.setAttribute('aria-expanded', String(!open));
  });

  // ── Canvas / window events ──
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('resize', onResize);
  document.addEventListener('keydown', onKeyPressed);

  updatePathParamState();
  await loadShape(selector.value);
  requestAnimationFrame(drawLoop);
}

// =============================================================================
// Small UI helper
// =============================================================================

/**
 * Wires a range input to its value label and a callback. The callback receives
 * the parsed numeric value. Fires once immediately to sync initial state.
 *
 * @param {string} rangeId
 * @param {string} valueId
 * @param {function(number): string} format - Formats the value for the label.
 * @param {function(number): void} onChange
 */
function bindRange(rangeId, valueId, format, onChange) {
  const range = document.getElementById(rangeId);
  const label = document.getElementById(valueId);
  const handle = () => {
    const v = parseFloat(range.value);
    if (label) label.textContent = format(v);
    onChange(v);
  };
  range.addEventListener('input', handle);
  // Sync label only (avoid invoking onChange before the morpher exists).
  if (label) label.textContent = format(parseFloat(range.value));
}

// =============================================================================
// Shape loading + morpher init
// =============================================================================

/**
 * Loads art JSON and initializes the morpher, or random explosion if url is ''.
 * @param {string} url
 */
async function loadShape(url) {
  stopPlayback();
  if (!url) {
    currentArt = null;
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

/** Re-initializes from the current source (used after size/source changes). */
function reinit() {
  stopPlayback();
  if (currentArt) initMorpher(currentArt.data);
  else initRandom();
}

/** Resizes the canvas to its container with high-DPI support. */
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

/** Builds a faint background grid phase-aligned with the logo. */
function buildBackgroundGrid(logoX, logoY) {
  bgGrid = new Grid(logicalWidth, logicalHeight, triangleSize,
    'rgba(200, 200, 200, 0.45)', null, logoX, logoY);
}

/** Initializes the morpher in random explosion mode. */
function initRandom() {
  resizeCanvas();
  currentArt = null;

  const logoX = MakeabilityLabLogo.getGridXCenterPosition(triangleSize, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(triangleSize, logicalHeight);
  morpher     = new MakeabilityLabLogoMorpher(logoX, logoY, triangleSize);
  morpher.makeLabLogoAnimated.isLabelVisible = true;

  morpher.reset(logicalWidth, logicalHeight);
  buildBackgroundGrid(logoX, logoY);
  applyAllSettings();
}

/**
 * Initializes the morpher from a TriangleArt data object.
 * @param {Object} artData - Parsed art JSON.
 */
function initMorpher(artData) {
  if (!artData) return;
  resizeCanvas();

  const artX = (logicalWidth  - artData.numCols * triangleSize) / 2;
  const artY = (logicalHeight - artData.numRows * triangleSize) / 2;
  currentArt = new TriangleArt(artX, artY, triangleSize, artData);

  const logoX = MakeabilityLabLogo.getGridXCenterPosition(triangleSize, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(triangleSize, logicalHeight);
  morpher     = new MakeabilityLabLogoMorpher(logoX, logoY, triangleSize);
  morpher.makeLabLogoAnimated.isLabelVisible = true;

  morpher.resetFromArt(currentArt, logicalWidth, logicalHeight);
  buildBackgroundGrid(logoX, logoY);
  applyAllSettings();
}

// =============================================================================
// UI → morpher sync
// =============================================================================

/** Applies path, easing, stagger, ghost, and message settings to the morpher. */
function applyAllSettings() {
  applyEasing();
  applyStagger(parseFloat(document.getElementById('staggerRange').value));
  applyPath();
  syncGhost();
  syncMessageVisibility();
  morpher.update(0);
}

/** Builds a MorphPath from the current path-style + parameter controls. */
function buildPath() {
  const kind  = document.querySelector('input[name="pathStyle"]:checked').value;
  const amp   = parseFloat(document.getElementById('arcRange').value);
  const turns = parseFloat(document.getElementById('spiralRange').value);
  switch (kind) {
    case 'arc':    return arcPath({ amplitude: amp });
    case 'bezier': return bezierPath();
    case 'spiral': return spiralPath({ turns });
    default:       return linearPath();
  }
}

/** Pushes the current path to the morpher (re-prepares, keeps scatter). */
function applyPath() {
  if (morpher) morpher.setPath(buildPath());
}

function applyEasing() {
  if (!morpher) return;
  const key = document.getElementById('easingSelect').value;
  morpher.easingFunction = EASING_FUNCTIONS[key] ?? easeOutCubic;
}

function applyStagger(value) {
  if (morpher) morpher.stagger = value;
}

function syncGhost() {
  if (morpher) morpher.makeLabLogo.visible = document.getElementById('showGhost').checked;
}

function syncMessageVisibility() {
  if (morpher) morpher.artMessageVisible = document.getElementById('showMessage').checked;
}

/** Shows/hides path params so only the relevant slider is enabled. */
function updatePathParamState() {
  const kind = document.querySelector('input[name="pathStyle"]:checked').value;
  document.getElementById('arcParam').classList.toggle('hidden', kind !== 'arc');
  document.getElementById('spiralParam').classList.toggle('hidden', kind !== 'spiral');
}

function updatePlaybackControlsState() {
  document.getElementById('playbackControls')
    .classList.toggle('disabled', driveMode === 'mouse');
}

// =============================================================================
// Playback control
// =============================================================================

function togglePlayback() {
  if (driveMode !== 'playback') return;
  isPlaying ? stopPlayback() : startPlayback();
}

function startPlayback() {
  isPlaying      = true;
  pingPongDir    = 1;
  dwellUntil     = 0;
  playbackStart  = performance.now();
  currentLerpAmt = playbackReversed ? 1 : 0;
  updatePlayButton(true);
}

function stopPlayback() {
  isPlaying  = false;
  dwellUntil = 0;
  updatePlayButton(false);
}

function updatePlayButton(playing) {
  const btn = document.getElementById('playBtn');
  if (!btn) return;
  btn.textContent = playing ? '⏹ Stop' : '▶ Play';
  btn.classList.toggle('playing', playing);
}

// =============================================================================
// Animation loop
// =============================================================================

function drawLoop(timestamp) {
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  if (bgGrid && document.getElementById('showGrid').checked) {
    bgGrid.draw(ctx);
  }

  if (morpher) {
    if (driveMode === 'playback') {
      if (isPlaying) currentLerpAmt = computePlaybackLerp(timestamp);
    } else {
      const buffer         = WIDTH_MARGIN_PCT * logicalWidth;
      const effectiveWidth = logicalWidth - 2 * buffer;
      currentLerpAmt = map(mouseX, buffer, effectiveWidth, 0, 1, true);
    }
    morpher.update(currentLerpAmt);
    morpher.draw(ctx);
  }

  requestAnimationFrame(drawLoop);
}

/**
 * Computes lerpAmt for playback mode, handling direction, ping-pong, and dwell.
 * @param {number} timestamp
 * @returns {number} lerpAmt in [0, 1].
 */
function computePlaybackLerp(timestamp) {
  const isRepeating = document.getElementById('repeatCheck')?.checked ?? false;

  if (dwellUntil > 0) {
    if (timestamp < dwellUntil) return currentLerpAmt;
    pingPongDir  *= -1;
    playbackStart = timestamp;
    dwellUntil    = 0;
  }

  const elapsed  = timestamp - playbackStart;
  const progress = Math.min(elapsed / playbackDuration, 1);

  let lerp;
  if (pingPongDir === 1) lerp = playbackReversed ? 1 - progress : progress;
  else                   lerp = playbackReversed ? progress : 1 - progress;

  if (progress >= 1) {
    if (isRepeating) dwellUntil = timestamp + pauseDuration;
    else             stopPlayback();
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
  reinit();
}

function onKeyPressed(e) {
  if (!morpher) return;
  if (e.key === 'r') reinit();
  if (e.key === 'g') {
    const cb = document.getElementById('showGhost');
    cb.checked = !cb.checked;
    syncGhost();
  }
  if (e.key === ' ' && driveMode === 'playback') {
    e.preventDefault();
    togglePlayback();
  }
}

setup();
