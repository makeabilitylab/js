/**
 * BLE HSV Color Controller — sketch.js
 *
 * Sends HSV color values to a microcontroller over BLE and receives
 * them back. Values are transmitted as normalized floats (0.0–1.0) in CSV
 * format: "hue, saturation, value\n"
 *
 * Wire format examples:
 *   "0.000, 1.000, 1.000\n"   → red at full saturation and brightness
 *   "0.333, 0.500, 0.750\n"   → muted green at 75% brightness
 *
 * The UI sliders use human-friendly ranges (H: 0–360°, S: 0–100%, V: 0–100%)
 * and normalize to 0.0–1.0 for the BLE protocol.
 *
 * This demo parallels the SerialColorTest but uses Web Bluetooth instead
 * of Web Serial. It uses separate TX/RX characteristics for bidirectional
 * communication.
 *
 * See: https://makeabilitylab.github.io/physcomp/esp32/ble.html
 *
 * Professor Jon E. Froehlich
 * https://makeabilitylab.cs.washington.edu/
 *
 * Source: https://github.com/makeabilitylab/js
 */

import { BLE, BLEEvents, BLEState } from '../../../lib/ble/index.js';
import { hsvToRgb, rgbToHex } from '../../../lib/graphics/index.js';

// --- DOM references ---
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const stateIndicator = document.getElementById("state-indicator");
const deviceNameSpan = document.getElementById("device-name");
const browserWarning = document.getElementById("browser-warning");

const serviceUUIDInput = document.getElementById("service-uuid");
const rxCharUUIDInput = document.getElementById("rx-char-uuid");
const txCharUUIDInput = document.getElementById("tx-char-uuid");

const hueSlider = document.getElementById("hue-slider");
const satSlider = document.getElementById("sat-slider");
const valSlider = document.getElementById("val-slider");

const hueOutput = document.getElementById("hue-value");
const satOutput = document.getElementById("sat-value");
const valOutput = document.getElementById("val-value");

const colorSwatch = document.getElementById("color-swatch");
const colorValues = document.getElementById("color-values");
const blePreview = document.getElementById("ble-preview");

const satSliderEl = document.querySelector(".slider-sat");
const valSliderEl = document.querySelector(".slider-val");

const dataLog = document.getElementById("data-log");
const clearLogBtn = document.getElementById("clear-log-btn");

// --- State ---
const ble = new BLE();

// Throttle BLE writes so we don't flood the device.
// 50ms = ~20 updates/sec, which is plenty for smooth LED color changes.
const SEND_INTERVAL_MS = 50;
let lastSendTime = 0;
let pendingSend = null;

// --- Browser support check ---
if (!BLE.isWebBluetoothSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- BLE event handlers ---

ble.on(BLEEvents.CONNECTED, () => {
  updateConnectionUI();
  appendToLog("--- Connected ---\n");

  const name = ble.getDeviceName();
  if (name) {
    deviceNameSpan.textContent = name;
  }

  // Send current slider values immediately on connect
  sendColor();
});

ble.on(BLEEvents.DISCONNECTED, () => {
  updateConnectionUI();
  appendToLog("--- Disconnected ---\n");
  deviceNameSpan.textContent = "";
});

ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
  appendToLog(`← ${data.value}\n`);
  parseIncomingHSV(data.value);
});

ble.on(BLEEvents.ERROR_OCCURRED, (sender, error) => {
  const msg = error instanceof Error ? error.message : String(error);
  appendToLog(`[ERROR] ${msg}\n`);
});

// --- Connection UI ---

connectBtn.addEventListener("click", async () => {
  const serviceUUID = serviceUUIDInput.value.trim();
  const rxCharUUID = rxCharUUIDInput.value.trim();

  if (!serviceUUID || !rxCharUUID) {
    appendToLog("[ERROR] Please enter a Service UUID and RX Characteristic UUID.\n");
    return;
  }

  await ble.connectAndSubscribe(
    { filters: [{ services: [serviceUUID] }] },
    serviceUUID,
    rxCharUUID
  );
});

disconnectBtn.addEventListener("click", async () => {
  await ble.disconnect();
});

function updateConnectionUI() {
  const state = ble.state;
  const isConnected = state === BLEState.CONNECTED;
  const isBusy = state === BLEState.CONNECTING || state === BLEState.DISCONNECTING;

  connectBtn.disabled = isConnected || isBusy;
  disconnectBtn.disabled = !isConnected;
  serviceUUIDInput.disabled = isConnected || isBusy;
  rxCharUUIDInput.disabled = isConnected || isBusy;
  txCharUUIDInput.disabled = isConnected || isBusy;

  const labels = {
    [BLEState.DISCONNECTED]: "● Disconnected",
    [BLEState.CONNECTING]: "● Connecting…",
    [BLEState.CONNECTED]: "● Connected",
    [BLEState.DISCONNECTING]: "● Disconnecting…",
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
 * the slider track gradients, and sends the value over BLE (throttled).
 */
function onSliderChange() {
  updateColorDisplay();
  throttledSendColor();
}

/**
 * Updates the color swatch, value labels, slider gradients, and BLE
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

  // Update BLE preview
  const hNorm = (h / 360).toFixed(3);
  const sNorm = (s / 100).toFixed(3);
  const vNorm = (v / 100).toFixed(3);
  blePreview.textContent = `${hNorm}, ${sNorm}, ${vNorm}`;
}

// --- BLE send (throttled) ---

/**
 * Sends the current HSV values over BLE, throttled to avoid flooding.
 */
function throttledSendColor() {
  if (!ble.isConnected()) return;

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
 * Sends the current HSV values as normalized CSV over BLE.
 */
async function sendColor() {
  if (!ble.isConnected()) return;

  const txCharUUID = txCharUUIDInput.value.trim();
  const serviceUUID = serviceUUIDInput.value.trim();

  if (!txCharUUID) return;

  const h = parseInt(hueSlider.value, 10);
  const s = parseInt(satSlider.value, 10);
  const v = parseInt(valSlider.value, 10);

  const line = `${(h / 360).toFixed(3)}, ${(s / 100).toFixed(3)}, ${(v / 100).toFixed(3)}`;

  try {
    await ble.writeWithoutResponse(txCharUUID, line + "\n", serviceUUID);
    appendToLog(`→ ${line}\n`);
  } catch (err) {
    appendToLog(`[ERROR] ${err.message}\n`);
  }
}

// --- BLE receive ---

/**
 * Parses an incoming value in the format "h, s, v" where each value is
 * a normalized float (0.0–1.0). Updates the sliders and color display
 * to reflect the received values.
 *
 * @param {string} text - The received BLE notification value.
 */
function parseIncomingHSV(text) {
  // Split on comma, with optional whitespace
  const parts = text.split(",").map(s => s.trim());
  if (parts.length < 3) return;

  const hNorm = parseFloat(parts[0]);
  const sNorm = parseFloat(parts[1]);
  const vNorm = parseFloat(parts[2]);

  // Validate: all must be finite numbers in [0, 1]
  if ([hNorm, sNorm, vNorm].some(v => !Number.isFinite(v) || v < 0 || v > 1)) {
    return; // Ignore malformed data silently
  }

  // Update sliders (convert normalized → UI ranges)
  hueSlider.value = Math.round(hNorm * 360);
  satSlider.value = Math.round(sNorm * 100);
  valSlider.value = Math.round(vNorm * 100);

  updateColorDisplay();
}

// --- Log ---

clearLogBtn.addEventListener("click", () => {
  dataLog.textContent = "";
});

/**
 * Appends text to the BLE log and auto-scrolls.
 * @param {string} text
 */
function appendToLog(text) {
  dataLog.textContent += text;
  dataLog.scrollTop = dataLog.scrollHeight;
}

// --- Initialize ---
updateColorDisplay();
