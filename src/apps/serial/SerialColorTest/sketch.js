/**
 * Serial HSV Color Controller — sketch.js
 *
 * Sends HSV color values to a microcontroller over Web Serial and receives
 * them back. Values are transmitted as normalized floats (0.0–1.0) in CSV
 * format: "hue, saturation, value\n"
 *
 * Wire format examples:
 *   "0.000, 1.000, 1.000\n"   → red at full saturation and brightness
 *   "0.333, 0.500, 0.750\n"   → muted green at 75% brightness
 *
 * The UI sliders use human-friendly ranges (H: 0–360°, S: 0–100%, V: 0–100%)
 * and normalize to 0.0–1.0 for the serial protocol.
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
const satSlider = document.getElementById("sat-slider");
const valSlider = document.getElementById("val-slider");

const hueOutput = document.getElementById("hue-value");
const satOutput = document.getElementById("sat-value");
const valOutput = document.getElementById("val-value");

const colorSwatch = document.getElementById("color-swatch");
const colorValues = document.getElementById("color-values");
const serialPreview = document.getElementById("serial-preview");

const satSliderEl = document.querySelector(".slider-sat");
const valSliderEl = document.querySelector(".slider-val");

const serialLog = document.getElementById("serial-log");
const clearLogBtn = document.getElementById("clear-log-btn");

// --- State ---
const serial = new Serial();

// Throttle serial writes so we don't flood the device.
// 50ms = ~20 updates/sec, which is plenty for smooth LED color changes.
const SEND_INTERVAL_MS = 50;
let lastSendTime = 0;
let pendingSend = null;

// --- Browser support check ---
if (!Serial.isWebSerialSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- Serial event handlers ---

serial.on(SerialEvents.CONNECTION_OPENED, () => {
  updateConnectionUI();
  appendToLog("--- Connected ---\n");
  // Send current slider values immediately on connect
  sendColor();
});

serial.on(SerialEvents.CONNECTION_CLOSED, () => {
  updateConnectionUI();
  appendToLog("--- Disconnected ---\n");
});

serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
  appendToLog(`← ${line}\n`);
  parseIncomingHSV(line);
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

// --- HSV sliders ---

hueSlider.addEventListener("input", onSliderChange);
satSlider.addEventListener("input", onSliderChange);
valSlider.addEventListener("input", onSliderChange);

/**
 * Called on every slider input event. Updates the color preview,
 * the slider track gradients, and sends the value over serial (throttled).
 */
function onSliderChange() {
  updateColorDisplay();
  throttledSendColor();
}

/**
 * Updates the color swatch, value labels, slider gradients, and serial
 * preview to reflect the current slider positions.
 */
function updateColorDisplay() {
  const h = parseInt(hueSlider.value, 10);
  const s = parseInt(satSlider.value, 10);
  const v = parseInt(valSlider.value, 10);

  // Update labels
  hueOutput.textContent = `${h}°`;
  satOutput.textContent = `${s}%`;
  valOutput.textContent = `${v}%`;

  // Convert HSV to RGB for the swatch
  const rgb = hsvToRgb(h / 360, s / 100, v / 100);
  const cssColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  colorSwatch.style.backgroundColor = cssColor;

  // Show hex + RGB below the swatch
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  colorValues.textContent = `${hex}\nrgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  // Update saturation slider gradient (gray → full-saturation color at current hue)
  const fullSatRgb = hsvToRgb(h / 360, 1, v / 100);
  const desatRgb = hsvToRgb(h / 360, 0, v / 100);
  satSliderEl.style.background = `linear-gradient(to right, ` +
    `rgb(${desatRgb.r}, ${desatRgb.g}, ${desatRgb.b}), ` +
    `rgb(${fullSatRgb.r}, ${fullSatRgb.g}, ${fullSatRgb.b}))`;

  // Update brightness slider gradient (black → full-brightness color at current hue+sat)
  const fullValRgb = hsvToRgb(h / 360, s / 100, 1);
  valSliderEl.style.background = `linear-gradient(to right, ` +
    `rgb(0, 0, 0), ` +
    `rgb(${fullValRgb.r}, ${fullValRgb.g}, ${fullValRgb.b}))`;

  // Update serial preview
  const hNorm = (h / 360).toFixed(3);
  const sNorm = (s / 100).toFixed(3);
  const vNorm = (v / 100).toFixed(3);
  serialPreview.textContent = `${hNorm}, ${sNorm}, ${vNorm}`;
}

// --- Serial send (throttled) ---

/**
 * Sends the current HSV values over serial, throttled to avoid flooding.
 */
function throttledSendColor() {
  if (!serial.isOpen()) return;

  const now = Date.now();
  if (now - lastSendTime >= SEND_INTERVAL_MS) {
    sendColor();
    lastSendTime = now;
    if (pendingSend !== null) {
      clearTimeout(pendingSend);
      pendingSend = null;
    }
  } else {
    // Schedule a trailing send to ensure the final value gets sent
    if (pendingSend !== null) {
      clearTimeout(pendingSend);
    }
    pendingSend = setTimeout(() => {
      sendColor();
      lastSendTime = Date.now();
      pendingSend = null;
    }, SEND_INTERVAL_MS);
  }
}

/**
 * Sends the current HSV values as normalized CSV over serial.
 */
async function sendColor() {
  if (!serial.isOpen()) return;

  const h = parseInt(hueSlider.value, 10);
  const s = parseInt(satSlider.value, 10);
  const v = parseInt(valSlider.value, 10);

  const line = `${(h / 360).toFixed(3)}, ${(s / 100).toFixed(3)}, ${(v / 100).toFixed(3)}`;

  try {
    await serial.writeLine(line);
    appendToLog(`→ ${line}\n`);
  } catch (err) {
    appendToLog(`[ERROR] ${err.message}\n`);
  }
}

// --- Serial receive ---

/**
 * Parses an incoming line in the format "h, s, v" where each value is
 * a normalized float (0.0–1.0). Updates the sliders and color display
 * to reflect the received values.
 *
 * @param {string} line - The received serial line.
 */
function parseIncomingHSV(line) {
  // Split on comma, with optional whitespace
  const parts = line.split(",").map(s => s.trim());
  if (parts.length < 3) return;

  const hNorm = parseFloat(parts[0]);
  const sNorm = parseFloat(parts[1]);
  const vNorm = parseFloat(parts[2]);

  // Validate: all must be finite numbers in [0, 1]
  if ([hNorm, sNorm, vNorm].some(v => !Number.isFinite(v) || v < 0 || v > 1)) {
    return; // Ignore malformed lines silently
  }

  // Update sliders (convert normalized → UI ranges)
  hueSlider.value = Math.round(hNorm * 360);
  satSlider.value = Math.round(sNorm * 100);
  valSlider.value = Math.round(vNorm * 100);

  updateColorDisplay();
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
updateColorDisplay();
