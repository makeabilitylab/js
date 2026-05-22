/**
 * BLE Test — sketch.js
 *
 * A test/demo app for the Makeability Lab BLE library.
 * Connects to a BLE peripheral and displays incoming notifications.
 *
 * Usage: open index.html in Chrome/Edge (desktop or Android) with a
 * BLE-capable microcontroller (ESP32, Arduino Nano 33, etc.) running
 * a compatible sketch.
 *
 * See: https://makeabilitylab.github.io/physcomp/esp32/ble.html
 *
 * Professor Jon E. Froehlich
 * https://makeabilitylab.cs.washington.edu/
 *
 * Source: https://github.com/makeabilitylab/js
 */

import { BLE, BLEEvents, BLEState } from '../../../lib/ble/index.js';

// --- DOM references ---
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const stateIndicator = document.getElementById("state-indicator");
const deviceNameSpan = document.getElementById("device-name");
const browserWarning = document.getElementById("browser-warning");

const serviceUUIDInput = document.getElementById("service-uuid");
const charUUIDInput = document.getElementById("char-uuid");

const dataLog = document.getElementById("data-log");
const lineCount = document.getElementById("line-count");
const autoScrollCheckbox = document.getElementById("auto-scroll");
const clearLogBtn = document.getElementById("clear-log-btn");

const errorSection = document.getElementById("error-section");
const errorLog = document.getElementById("error-log");

// --- State ---
const ble = new BLE();
let notificationCount = 0;

// --- Browser support check ---
if (!BLE.isWebBluetoothSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- BLE event handlers ---

ble.on(BLEEvents.CONNECTED, () => {
  updateUI();
  appendToLog("--- Connected ---\n");

  const name = ble.getDeviceName();
  if (name) {
    deviceNameSpan.textContent = name;
  }
});

ble.on(BLEEvents.DISCONNECTED, () => {
  updateUI();
  appendToLog("--- Disconnected ---\n");
  deviceNameSpan.textContent = "";
});

ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
  notificationCount++;
  appendToLog(data.value + "\n");
  lineCount.textContent =
    `${notificationCount} notification${notificationCount === 1 ? "" : "s"}`;
});

ble.on(BLEEvents.ERROR_OCCURRED, (sender, error) => {
  const msg = error instanceof Error ? error.message : String(error);
  appendToError(msg);
});

// --- UI event handlers ---

connectBtn.addEventListener("click", async () => {
  const serviceUUID = serviceUUIDInput.value.trim();
  const charUUID = charUUIDInput.value.trim();

  if (!serviceUUID || !charUUID) {
    appendToError("Please enter both a Service UUID and a Characteristic UUID.");
    return;
  }

  await ble.connectAndSubscribe(
    { filters: [{ services: [serviceUUID] }] },
    serviceUUID,
    charUUID
  );
});

disconnectBtn.addEventListener("click", async () => {
  await ble.disconnect();
});

clearLogBtn.addEventListener("click", () => {
  dataLog.textContent = "";
  notificationCount = 0;
  lineCount.textContent = "0 notifications";
});

// --- Helpers ---

/**
 * Updates all UI elements to reflect the current BLE state.
 */
function updateUI() {
  const state = ble.state;
  const isConnected = state === BLEState.CONNECTED;
  const isBusy = state === BLEState.CONNECTING || state === BLEState.DISCONNECTING;

  connectBtn.disabled = isConnected || isBusy;
  disconnectBtn.disabled = !isConnected;
  serviceUUIDInput.disabled = isConnected || isBusy;
  charUUIDInput.disabled = isConnected || isBusy;

  // State indicator
  const labels = {
    [BLEState.DISCONNECTED]: "● Disconnected",
    [BLEState.CONNECTING]: "● Connecting…",
    [BLEState.CONNECTED]: "● Connected",
    [BLEState.DISCONNECTING]: "● Disconnecting…",
  };
  stateIndicator.textContent = labels[state] || "● Unknown";
  stateIndicator.className = `state-${state}`;
}

/**
 * Appends text to the data log, optionally auto-scrolling.
 * @param {string} text
 */
function appendToLog(text) {
  dataLog.textContent += text;

  if (autoScrollCheckbox.checked) {
    dataLog.scrollTop = dataLog.scrollHeight;
  }
}

/**
 * Shows an error in the error section.
 * @param {string} msg
 */
function appendToError(msg) {
  errorSection.hidden = false;
  const timestamp = new Date().toLocaleTimeString();
  errorLog.textContent += `[${timestamp}] ${msg}\n`;
}
