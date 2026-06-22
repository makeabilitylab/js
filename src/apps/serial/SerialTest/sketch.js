/**
 * Serial Test — sketch.js
 *
 * A test/demo app for the Makeability Lab serial library.
 * Lets you connect to a serial device, view incoming data, and send text.
 *
 * Usage: open index.html in Chrome/Edge/Opera with a serial device connected.
 * 
 * See: https://makeabilitylab.github.io/physcomp/communication/web-serial.html
 * 
 * Professor Jon E. Froehlich
 * https://makeabilitylab.cs.washington.edu/
 * 
 * Source: https://github.com/makeabilitylab/js 
 */

import { Serial, SerialEvents, SerialState } from 'makelab';

// --- DOM references ---
const connectBtn = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
const baudRateSelect = document.getElementById("baud-rate");
const stateIndicator = document.getElementById("state-indicator");
const portInfo = document.getElementById("port-info");
const browserWarning = document.getElementById("browser-warning");

const serialLog = document.getElementById("serial-log");
const lineCount = document.getElementById("line-count");
const autoScrollCheckbox = document.getElementById("auto-scroll");
const clearLogBtn = document.getElementById("clear-log-btn");

const sendInput = document.getElementById("send-input");
const sendBtn = document.getElementById("send-btn");
const sendNewlineCheckbox = document.getElementById("send-newline");

const errorSection = document.getElementById("error-section");
const errorLog = document.getElementById("error-log");

// --- State ---
const serial = new Serial();
let receivedLineCount = 0;

// --- Browser support check ---
if (!Serial.isWebSerialSupported()) {
  browserWarning.hidden = false;
  connectBtn.disabled = true;
}

// --- Serial event handlers ---

serial.on(SerialEvents.CONNECTION_OPENED, (sender) => {
  updateUI();
  appendToLog("--- Connected ---\n");

  // Show port info if available
  if (sender.serialPort) {
    const info = sender.serialPort.getInfo();
    if (info.usbVendorId) {
      portInfo.textContent = `USB ${info.usbVendorId.toString(16)}:${(info.usbProductId || 0).toString(16)}`;
    }
  }
});

serial.on(SerialEvents.CONNECTION_CLOSED, () => {
  updateUI();
  appendToLog("--- Disconnected ---\n");
  portInfo.textContent = "";
});

serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
  receivedLineCount++;
  appendToLog(line + "\n");
  lineCount.textContent = `${receivedLineCount} line${receivedLineCount === 1 ? "" : "s"}`;
});

serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
  const msg = error instanceof Error ? error.message : String(error);
  appendToError(msg);
});

// --- UI event handlers ---

connectBtn.addEventListener("click", async () => {
  const baudRate = parseInt(baudRateSelect.value, 10);
  await serial.connectAndOpen(null, { baudRate });
});

disconnectBtn.addEventListener("click", async () => {
  await serial.close();
});

clearLogBtn.addEventListener("click", () => {
  serialLog.textContent = "";
  receivedLineCount = 0;
  lineCount.textContent = "0 lines";
});

sendBtn.addEventListener("click", sendMessage);

sendInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

async function sendMessage() {
  const text = sendInput.value;
  if (!text || !serial.isOpen()) return;

  try {
    if (sendNewlineCheckbox.checked) {
      await serial.writeLine(text);
    } else {
      await serial.write(text);
    }
    // Echo sent message in the log
    appendToLog(`> ${text}\n`);
    sendInput.value = "";
  } catch (err) {
    appendToError(err.message);
  }
}

// --- Helpers ---

/**
 * Updates all UI elements to reflect the current serial state.
 */
function updateUI() {
  const state = serial.state;
  const isOpen = state === SerialState.OPEN;
  const isBusy = state === SerialState.OPENING || state === SerialState.CLOSING;

  connectBtn.disabled = isOpen || isBusy;
  disconnectBtn.disabled = !isOpen;
  baudRateSelect.disabled = isOpen || isBusy;
  sendInput.disabled = !isOpen;
  sendBtn.disabled = !isOpen;

  // State indicator
  const labels = {
    [SerialState.CLOSED]: "● Closed",
    [SerialState.OPENING]: "● Opening…",
    [SerialState.OPEN]: "● Connected",
    [SerialState.CLOSING]: "● Closing…",
  };
  stateIndicator.textContent = labels[state] || "● Unknown";
  stateIndicator.className = `state-${state}`;
}

/**
 * Appends text to the serial log, optionally auto-scrolling.
 * @param {string} text
 */
function appendToLog(text) {
  serialLog.textContent += text;

  if (autoScrollCheckbox.checked) {
    serialLog.scrollTop = serialLog.scrollHeight;
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
