/**
 * Serial Hue Test — sketch.js
 *
 * Sends a single hue value (0–360°) to a microcontroller over Web Serial
 * and receives hue values back. The value is sent as an integer string
 * followed by a newline: "180\n"
 *
 * Includes an interactive hue wheel (canvas) that reinforces hue as an
 * angle around the color circle. Click or drag the wheel to select a hue.
 * A linear slider is also provided as a secondary control — both stay synced.
 *
 * On the Arduino side, use Serial.parseInt() to read the value, then
 * map to your LED library's range. For example, with Adafruit NeoPixel:
 *   uint16_t hue16 = map(hue, 0, 360, 0, 65535);
 *   strip.setPixelColor(0, strip.ColorHSV(hue16));
 */

import { Serial, SerialEvents, SerialState } from '../../../lib/serial/index.js';
import { hsvToRgb, rgbToHex } from '../../../lib/graphics/index.js';

// --- DOM references ---
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const baudRateSelect = document.getElementById("baud-rate");
const stateIndicator = document.getElementById("state-indicator");
const browserWarning = document.getElementById("browser-warning");

const hueSlider = document.getElementById("hue-slider");
const hueOutput = document.getElementById("hue-value");

const colorSwatch = document.getElementById("color-swatch");
const colorValues = document.getElementById("color-values");
const serialPreview = document.getElementById("serial-preview");

const wheelCanvas = document.getElementById("hue-wheel");
const wheelIndicator = document.getElementById("wheel-indicator");

const serialLog = document.getElementById("serial-log");
const clearLogBtn = document.getElementById("clear-log-btn");

// --- Hue wheel geometry ---
// Canvas is 600×600 (CSS-scaled to ~240×240 via the stylesheet).
// The wheel is drawn as a thick ring with degree labels inside.
const CANVAS_SIZE = 600;
const CENTER = CANVAS_SIZE / 2;
const OUTER_RADIUS = 260;
const INNER_RADIUS = 180;
const MID_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;

// --- State ---
const serial = new Serial();

const SEND_INTERVAL_MS = 50;
let lastSendTime = 0;
let pendingSend = null;

let wheelDragging = false;

// --- Browser support check ---
if (!Serial.isWebSerialSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- Serial event handlers ---

serial.on(SerialEvents.CONNECTION_OPENED, () => {
  updateConnectionUI();
  appendToLog("--- Connected ---\n");
  sendHue();
});

serial.on(SerialEvents.CONNECTION_CLOSED, () => {
  updateConnectionUI();
  appendToLog("--- Disconnected ---\n");
});

serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
  appendToLog(`← ${line}\n`);
  parseIncomingHue(line);
});

serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
  const msg = error instanceof Error ? error.message : String(error);
  appendToLog(`[ERROR] ${msg}\n`);
});

// --- Connection UI ---

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

// --- Hue wheel (canvas) ---

/**
 * Draws the hue wheel ring on the canvas. Each degree gets its own
 * arc segment filled with the corresponding HSL color.
 */
function drawHueWheel() {
  const ctx = wheelCanvas.getContext("2d");
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // Draw color ring — one filled arc segment per degree
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

  // Draw degree tick labels inside the ring
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
 * @param {number} hue - Hue in degrees (0–360).
 */
function updateWheelIndicator(hue) {
  const angle = (hue - 90) * Math.PI / 180;
  const x = CENTER + MID_RADIUS * Math.cos(angle);
  const y = CENTER + MID_RADIUS * Math.sin(angle);

  // Convert from canvas coords (600×600) to CSS coords (container size).
  // The canvas CSS size matches the container, so we scale by CSS/canvas ratio.
  const rect = wheelCanvas.getBoundingClientRect();
  const scale = rect.width / CANVAS_SIZE;

  wheelIndicator.style.left = `${x * scale}px`;
  wheelIndicator.style.top = `${y * scale}px`;
}

/**
 * Given a pointer event on the canvas, returns the hue angle (0–359)
 * or null if the pointer is outside the ring area.
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

  // Allow a generous hit area around the ring
  if (dist < INNER_RADIUS * 0.6 || dist > OUTER_RADIUS * 1.15) {
    return null;
  }

  let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
  if (angle < 0) angle += 360;
  return Math.round(angle) % 360;
}

// Wheel pointer interaction
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

// --- Hue slider ---

hueSlider.addEventListener("input", () => {
  setHue(parseInt(hueSlider.value, 10));
});

// --- Unified hue setter ---

/**
 * Sets the current hue from any input source (wheel, slider, serial).
 * Updates all UI elements and sends the value over serial (throttled).
 * @param {number} hue - Hue in degrees (0–360).
 */
function setHue(hue) {
  hue = Math.max(0, Math.min(360, Math.round(hue)));

  // Sync slider
  hueSlider.value = hue;
  hueOutput.textContent = `${hue}°`;

  // Update swatch
  const rgb = hsvToRgb(hue / 360, 1, 1);
  colorSwatch.style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Show hex + RGB below the swatch
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  colorValues.textContent = `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Update serial preview
  serialPreview.textContent = `${hue}`;

  // Update wheel indicator
  updateWheelIndicator(hue);

  // Send over serial
  throttledSendHue();
}

// --- Serial send (throttled) ---

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
    if (pendingSend !== null) {
      clearTimeout(pendingSend);
    }
    pendingSend = setTimeout(() => {
      sendHue();
      lastSendTime = Date.now();
      pendingSend = null;
    }, SEND_INTERVAL_MS);
  }
}

/**
 * Sends the current hue value as an integer (0–360) over serial.
 */
async function sendHue() {
  if (!serial.isOpen()) return;

  const h = parseInt(hueSlider.value, 10);

  try {
    await serial.writeLine(`${h}`);
    appendToLog(`→ ${h}\n`);
  } catch (err) {
    appendToLog(`[ERROR] ${err.message}\n`);
  }
}

// --- Serial receive ---

/**
 * Parses an incoming line containing a single integer hue value (0–360).
 * Updates the slider, wheel, and color display to reflect the received value.
 *
 * @param {string} line - The received serial line.
 */
function parseIncomingHue(line) {
  const h = parseInt(line.trim(), 10);

  if (!Number.isFinite(h) || h < 0 || h > 360) {
    return;
  }

  setHue(h);
}

// --- Log ---

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

// --- Initialize ---
drawHueWheel();
setHue(0);
