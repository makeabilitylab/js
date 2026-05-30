/**
 * Serial Hue + Brightness Test — sketch.js
 *
 * Bidirectional Web Serial demo where each side owns one axis of color:
 *   - The BROWSER  owns HUE        → sends "h\n"  (int 0..360)
 *   - The DEVICE   owns BRIGHTNESS → sends "v\n"  (float 0.0..1.0)
 *
 * The hue wheel (and the linear slider beneath it) push hue updates to
 * the connected device whenever the user interacts. Incoming brightness
 * values update the read-only brightness bar in real time. The color
 * swatch combines the two and previews what the LED should look like.
 *
 * Designed for use with the BluetoothColorMixer ESP32 sketch, but works
 * with any device that speaks this simple text protocol over a serial
 * transport (USB or Bluetooth SPP).
 *
 * Professor Jon E. Froehlich
 * https://makeabilitylab.cs.washington.edu/
 *
 * Source: https://github.com/makeabilitylab/js
 */

import { Serial, SerialEvents, SerialState } from '../../../lib/serial/index.js';
import { hsvToRgb, rgbToHex } from '../../../lib/graphics/index.js';

// --- DOM references -------------------------------------------------------
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const baudRateSelect = document.getElementById("baud-rate");
const stateIndicator = document.getElementById("state-indicator");
const browserWarning = document.getElementById("browser-warning");

const hueSlider = document.getElementById("hue-slider");
const hueOutput = document.getElementById("hue-value");

const brightnessBar = document.getElementById("brightness-bar");
const brightnessValue = document.getElementById("brightness-value");

const colorSwatch = document.getElementById("color-swatch");
const colorValues = document.getElementById("color-values");
const serialOutPreview = document.getElementById("serial-out-preview");
const serialInPreview = document.getElementById("serial-in-preview");

const wheelCanvas = document.getElementById("hue-wheel");
const wheelIndicator = document.getElementById("wheel-indicator");

const serialLog = document.getElementById("serial-log");
const clearLogBtn = document.getElementById("clear-log-btn");

// --- Hue wheel geometry ---------------------------------------------------
const CANVAS_SIZE = 600;
const CENTER = CANVAS_SIZE / 2;
const OUTER_RADIUS = 260;
const INNER_RADIUS = 180;
const MID_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;

// --- State ----------------------------------------------------------------
const serial = new Serial();

// Hue is browser-owned and updated by the wheel/slider.
// Brightness is device-owned and updated by incoming serial data.
let currentHue = 0;            // 0..360, integer degrees
let currentBrightness = 0;     // 0..1; defaults to 0 until first packet arrives
let hasReceivedBrightness = false;

const SEND_INTERVAL_MS = 50;   // throttle outgoing hue sends to ~20 Hz
let lastSendTime = 0;
let pendingSend = null;

let wheelDragging = false;

// --- Browser support check ------------------------------------------------
if (!Serial.isWebSerialSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- Serial event handlers ------------------------------------------------

serial.on(SerialEvents.CONNECTION_OPENED, () => {
  updateConnectionUI();
  appendToLog("--- Connected ---\n");
  // Push our current hue to the device immediately so it knows where to start.
  sendHue();
});

serial.on(SerialEvents.CONNECTION_CLOSED, () => {
  updateConnectionUI();
  appendToLog("--- Disconnected ---\n");
  // Reset the brightness readout — we no longer know what the device is doing.
  hasReceivedBrightness = false;
  currentBrightness = 0;
  brightnessBar.style.width = "0%";
  brightnessValue.textContent = "—";
  serialInPreview.textContent = "—";
  updateColorSwatch();
});

serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
  appendToLog(`← ${line}\n`);
  parseIncomingBrightness(line);
});

serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
  const msg = error instanceof Error ? error.message : String(error);
  appendToLog(`[ERROR] ${msg}\n`);
});

// --- Connection UI --------------------------------------------------------

connectBtn.addEventListener("click", async () => {
  const baudRate = parseInt(baudRateSelect.value, 10);
  await serial.connectAndOpen(null, { baudRate });
});

disconnectBtn.addEventListener("click", async () => {
  await serial.close();
});

function updateConnectionUI() {
  const state = serial.state;
  const isOpen = state === SerialState.OPEN;
  const isBusy = state === SerialState.OPENING || state === SerialState.CLOSING;

  connectBtn.disabled = isOpen || isBusy;
  disconnectBtn.disabled = !isOpen;
  baudRateSelect.disabled = isOpen || isBusy;

  const labels = {
    [SerialState.CLOSED]: "● Closed",
    [SerialState.OPENING]: "● Opening…",
    [SerialState.OPEN]: "● Connected",
    [SerialState.CLOSING]: "● Closing…",
  };
  stateIndicator.textContent = labels[state] || "● Unknown";
  stateIndicator.className = `state-${state}`;
}

// --- Hue wheel (canvas) ---------------------------------------------------

/**
 * Draws the hue ring on the canvas. Each degree gets its own arc segment
 * filled with the corresponding HSL color.
 */
function drawHueWheel() {
  const ctx = wheelCanvas.getContext("2d");
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  for (let deg = 0; deg < 360; deg++) {
    const startAngle = (deg - 91) * Math.PI / 180;
    const endAngle = (deg - 89) * Math.PI / 180;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, OUTER_RADIUS, startAngle, endAngle);
    ctx.arc(CENTER, CENTER, INNER_RADIUS, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = `hsl(${deg}, 100%, 50%)`;
    ctx.fill();
  }

  ctx.font = "500 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#666";

  const labelRadius = INNER_RADIUS - 32;
  const ticks = [0, 60, 120, 180, 240, 300];
  for (const deg of ticks) {
    const angle = (deg - 90) * Math.PI / 180;
    const x = CENTER + labelRadius * Math.cos(angle);
    const y = CENTER + labelRadius * Math.sin(angle);
    ctx.fillText(`${deg}°`, x, y);
  }
}

/**
 * Positions the wheel indicator dot on the ring at the given hue angle.
 * @param {number} hue - Hue in degrees (0..360).
 */
function updateWheelIndicator(hue) {
  const angle = (hue - 90) * Math.PI / 180;
  const x = CENTER + MID_RADIUS * Math.cos(angle);
  const y = CENTER + MID_RADIUS * Math.sin(angle);

  const rect = wheelCanvas.getBoundingClientRect();
  const scale = rect.width / CANVAS_SIZE;
  wheelIndicator.style.left = `${x * scale}px`;
  wheelIndicator.style.top = `${y * scale}px`;
}

/**
 * Given a pointer event on the canvas, returns the hue angle (0..359)
 * or null if the pointer is outside the ring's hit area.
 * @param {PointerEvent} event
 * @returns {number|null}
 */
function hueFromPointerEvent(event) {
  const rect = wheelCanvas.getBoundingClientRect();
  const scale = CANVAS_SIZE / rect.width;
  const px = (event.clientX - rect.left) * scale;
  const py = (event.clientY - rect.top) * scale;

  const dx = px - CENTER;
  const dy = py - CENTER;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < INNER_RADIUS * 0.6 || dist > OUTER_RADIUS * 1.15) {
    return null;
  }

  let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  return Math.round(angle) % 360;
}

wheelCanvas.addEventListener("pointerdown", (e) => {
  const h = hueFromPointerEvent(e);
  if (h !== null) {
    wheelDragging = true;
    wheelCanvas.setPointerCapture(e.pointerId);
    setHue(h);
  }
});

wheelCanvas.addEventListener("pointermove", (e) => {
  if (!wheelDragging) return;
  const h = hueFromPointerEvent(e);
  if (h !== null) setHue(h);
});

wheelCanvas.addEventListener("pointerup", () => { wheelDragging = false; });
wheelCanvas.addEventListener("pointercancel", () => { wheelDragging = false; });

// --- Hue slider -----------------------------------------------------------

hueSlider.addEventListener("input", () => {
  setHue(parseInt(hueSlider.value, 10));
});

// --- Hue setter (browser-owned) ------------------------------------------

/**
 * Sets the current hue from any browser-side input (wheel or slider).
 * Updates the UI and sends the value over serial (throttled).
 * @param {number} hue - Hue in degrees (0..360).
 */
function setHue(hue) {
  currentHue = Math.max(0, Math.min(360, Math.round(hue)));

  hueSlider.value = currentHue;
  hueOutput.textContent = `${currentHue}°`;
  updateWheelIndicator(currentHue);

  serialOutPreview.textContent = `${currentHue}`;
  updateColorSwatch();
  throttledSendHue();
}

// --- Color swatch (combines hue × brightness) -----------------------------

/**
 * Updates the color swatch to reflect hue × brightness. Before any
 * brightness data has arrived from the device, we render at full
 * brightness so the chosen hue is still visible.
 */
function updateColorSwatch() {
  const effectiveValue = hasReceivedBrightness ? currentBrightness : 1;
  const rgb = hsvToRgb(currentHue / 360, 1, effectiveValue);
  colorSwatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const vLine = hasReceivedBrightness
    ? `v = ${currentBrightness.toFixed(3)}`
    : `v = —  (waiting for device)`;
  colorValues.textContent = `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})\n${vLine}`;
}

// --- Serial send (throttled) ----------------------------------------------

function throttledSendHue() {
  if (!serial.isOpen()) return;

  const now = Date.now();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    sendHue();
    lastSendTime = now;
    if (pendingSend !== null) {
      clearTimeout(pendingSend);
      pendingSend = null;
    }
  } else {
    // Schedule a trailing send so the final value isn't lost.
    if (pendingSend !== null) clearTimeout(pendingSend);
    pendingSend = setTimeout(() => {
      sendHue();
      lastSendTime = Date.now();
      pendingSend = null;
    }, SEND_INTERVAL_MS);
  }
}

async function sendHue() {
  if (!serial.isOpen()) return;
  try {
    await serial.writeLine(`${currentHue}`);
    appendToLog(`→ ${currentHue}\n`);
  } catch (err) {
    appendToLog(`[ERROR] ${err.message}\n`);
  }
}

// --- Serial receive -------------------------------------------------------

/**
 * Parses an incoming line containing a single float brightness in [0, 1].
 * Updates the brightness bar, label, and color swatch.
 *
 * @param {string} line - The received serial line.
 */
function parseIncomingBrightness(line) {
  const trimmed = line.trim();
  const v = parseFloat(trimmed);
  if (!Number.isFinite(v) || v < 0 || v > 1) {
    return;  // ignore malformed lines silently
  }

  hasReceivedBrightness = true;
  currentBrightness = v;

  brightnessBar.style.width = `${(v * 100).toFixed(1)}%`;
  brightnessValue.textContent = `${Math.round(v * 100)}%`;
  serialInPreview.textContent = v.toFixed(4);

  updateColorSwatch();
}

// --- Log ------------------------------------------------------------------

clearLogBtn.addEventListener("click", () => {
  serialLog.textContent = "";
});

/**
 * Appends text to the serial log and auto-scrolls.
 * @param {string} text
 */
function appendToLog(text) {
  serialLog.textContent += text;
  serialLog.scrollTop = serialLog.scrollHeight;
}

// --- Initialize -----------------------------------------------------------
drawHueWheel();
setHue(0);
updateColorSwatch();
