this.Makelab = this.Makelab || {};
(function (exports) {
  'use strict';

  // serial.js — A Web Serial API wrapper for physical computing
  //
  // Provides a simple, event-driven interface for text-based serial communication
  // between a web browser and microcontrollers (Arduino, ESP32, etc.).
  //
  // Web Serial browser support (as of 2026): Chrome, Edge, Opera
  // https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
  //
  // Quick test: open the browser dev console and type `navigator.serial`
  // If it returns a Serial object, your browser supports Web Serial.
  // If it returns `undefined`, it does not.
  //
  // By Jon E. Froehlich
  // https://makeabilitylab.io
  //
  // Source: https://github.com/makeabilitylab/js
  // Textbook: https://makeabilitylab.github.io/physcomp/communication/web-serial.html

  /**
   * Enum-like object of serial event types. Use these with {@link Serial#on} to
   * subscribe to serial lifecycle and data events.
   *
   * @readonly
   * @enum {string}
   *
   * @example
   * serial.on(SerialEvents.DATA_RECEIVED, (sender, data) => {
   *   console.log("Received:", data);
   * });
   */
  const SerialEvents = Object.freeze({
    /** Fired when the serial port is successfully opened and ready for I/O. */
    CONNECTION_OPENED: "CONNECTION_OPENED",

    /** Fired when the serial port is closed (either programmatically or by disconnect). */
    CONNECTION_CLOSED: "CONNECTION_CLOSED",

    /** Fired for each line of text received from the serial device. */
    DATA_RECEIVED: "DATA_RECEIVED",

    /** Fired when an error occurs during connection, reading, or writing. */
    ERROR_OCCURRED: "ERROR_OCCURRED",
  });

  /**
   * Connection state constants returned by {@link Serial#state}.
   *
   * @readonly
   * @enum {string}
   */
  const SerialState = Object.freeze({
    CLOSED: "closed",
    OPENING: "opening",
    OPEN: "open",
    CLOSING: "closing",
  });

  /**
   * A simple, event-driven wrapper around the Web Serial API for text-based
   * serial communication with microcontrollers.
   *
   * Handles the complexity of stream setup, text encoding/decoding, and
   * line-break parsing so you can focus on the serial interaction itself.
   *
   * @example <caption>Basic usage</caption>
   * const serial = new Serial();
   *
   * serial.on(SerialEvents.CONNECTION_OPENED, async () => {
   *   console.log("Connected!");
   *   await serial.writeLine("Hello Arduino!"); // safe to send once open
   * });
   *
   * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
   *   console.log("Arduino says:", line);
   * });
   *
   * serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
   *   console.error("Error:", error.message);
   * });
   *
   * // Open from a user gesture (the browser requires one). connectAndOpen() stays
   * // pending the whole time the port is open — it runs the read loop internally —
   * // so do follow-up work from the CONNECTION_OPENED event above, not after this
   * // call. For ESP32, pass { baudRate: 115200 }.
   * connectButton.addEventListener("click", () => serial.connectAndOpen());
   *
   * @example <caption>Auto-reconnect to a previously approved port</caption>
   * const serial = new Serial();
   * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
   *   document.getElementById("output").textContent = line;
   * });
   * // No user gesture needed if the port was previously approved
   * await serial.autoConnectAndOpenPreviouslyApprovedPort({ baudRate: 115200 });
   */
  class Serial {

    constructor() {
      /** @type {?SerialPort} The underlying Web Serial port */
      this.serialPort = null;

      /** @type {?WritableStreamDefaultWriter} Text writer for outgoing data */
      this.serialWriter = null;

      /** @type {?ReadableStreamDefaultReader} Line-buffered reader for incoming data */
      this.serialReader = null;

      /** @private */
      this.keepReading = false;

      /** @private */
      this.readableStreamClosed = null;

      /** @private */
      this.writableStreamClosed = null;

      /** @private */
      this._state = SerialState.CLOSED;

      /**
       * Map of event labels to arrays of callback functions.
       * @private
       * @type {Map<string, function[]>}
       */
      this.events = new Map();

      /**
       * Set of recognized event labels for validation.
       * @private
       * @type {Set<string>}
       */
      this.knownEvents = new Set([
        SerialEvents.CONNECTION_OPENED,
        SerialEvents.CONNECTION_CLOSED,
        SerialEvents.DATA_RECEIVED,
        SerialEvents.ERROR_OCCURRED,
      ]);

      /**
       * The navigator-level "disconnect" handler, registered while the port is
       * open and removed on close() so listeners don't accumulate across Serial
       * instances. Null when not open.
       * @private
       * @type {?function}
       */
      this._onDeviceDisconnect = null;
    }

    // ---------------------------------------------------------------------------
    //  Properties
    // ---------------------------------------------------------------------------

    /**
     * The current connection state.
     *
     * @returns {string} One of {@link SerialState}: `"closed"`, `"opening"`, `"open"`, or `"closing"`.
     *
     * @example
     * if (serial.state === SerialState.OPEN) {
     *   await serial.writeLine("data");
     * }
     */
    get state() {
      return this._state;
    }

    // ---------------------------------------------------------------------------
    //  Event system
    // ---------------------------------------------------------------------------

    /**
     * Registers an event listener for a specific event.
     *
     * @param {string} label - The event type. Must be one of {@link SerialEvents}.
     * @param {function(Serial, *): void} callback - Handler function. Receives
     *   the Serial instance as the first argument and event-specific data as the second.
     *
     * @example
     * serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => {
     *   console.log("Received:", line);
     * });
     *
     * serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => {
     *   console.error("Serial error:", error.message);
     * });
     */
    on(label, callback) {
      if (!this.knownEvents.has(label)) {
        console.warn(`[Serial] Unknown event "${String(label)}". ` +
          `Known events: ${[...this.knownEvents].join(", ")}`);
        return;
      }
      if (!this.events.has(label)) {
        this.events.set(label, []);
      }
      this.events.get(label).push(callback);
    }

    /**
     * Removes a previously registered event listener.
     *
     * @param {string} label - The event type.
     * @param {function} callback - The exact function reference passed to {@link Serial#on}.
     * @returns {boolean} `true` if the listener was found and removed, `false` otherwise.
     *
     * @example
     * function onData(sender, line) { console.log(line); }
     * serial.on(SerialEvents.DATA_RECEIVED, onData);
     * // Later:
     * serial.off(SerialEvents.DATA_RECEIVED, onData);
     */
    off(label, callback) {
      if (!this.events.has(label)) return false;
      const listeners = this.events.get(label);
      const index = listeners.indexOf(callback);
      if (index === -1) return false;
      listeners.splice(index, 1);
      return true;
    }

    /**
     * Triggers an event and calls all registered handlers for it.
     *
     * @param {string} event - The event type to fire.
     * @param {*} [data=null] - Optional data passed to each handler.
     */
    fireEvent(event, data = null) {
      if (this.events.has(event)) {
        for (const callback of this.events.get(event)) {
          try {
            callback(this, data);
          } catch (err) {
            console.error(`[Serial] Error in ${String(event)} handler:`, err);
          }
        }
      }
    }

    // ---------------------------------------------------------------------------
    //  Connection
    // ---------------------------------------------------------------------------

    /**
     * Automatically connects to and opens a previously approved port.
     * If the user has approved multiple ports, the first one in the list is used.
     *
     * This method does **not** require a user gesture (click) because the port
     * was already approved in a prior session. Useful for seamless reconnection
     * on page load.
     *
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     *   Use `{ baudRate: 115200 }` for ESP32.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open#options
     *
     * @example
     * // Reconnect to the last-used Arduino
     * await serial.autoConnectAndOpenPreviouslyApprovedPort();
     *
     * // Reconnect to the last-used ESP32
     * await serial.autoConnectAndOpenPreviouslyApprovedPort({ baudRate: 115200 });
     */
    async autoConnectAndOpenPreviouslyApprovedPort(serialOptions = { baudRate: 9600 }) {
      this._requireWebSerial();

      const approvedPortList = await navigator.serial.getPorts();
      console.log("[Serial] Previously approved ports:", approvedPortList.length);

      if (approvedPortList.length > 0) {
        const portInfo = approvedPortList[0].getInfo();
        console.log("[Serial] Auto-connecting to:", portInfo);
        await this.connect(approvedPortList[0]);

        if (this.serialPort) {
          console.log("[Serial] Opening port...");
          await this.open(serialOptions);
        }
      } else {
        console.log("[Serial] No previously approved ports found. " +
          "Call connectAndOpen() with a user gesture (e.g., button click) to request access.");
      }
    }

    /**
     * Returns `true` if the serial port is open and ready for reading and writing.
     *
     * @returns {boolean}
     *
     * @example
     * if (serial.isOpen()) {
     *   await serial.writeLine("sensor data request");
     * }
     */
    isOpen() {
      return this._state === SerialState.OPEN &&
        this.serialPort !== null &&
        this.serialReader !== null &&
        this.serialWriter !== null;
    }

    /**
     * Prompts the user to select a serial device and opens the connection.
     * This is the primary method for most use cases.
     *
     * **Must be called from a user gesture** (e.g., a button click) because
     * `navigator.serial.requestPort()` requires user activation.
     *
     * **The returned promise stays pending until the port is closed** — internally
     * this runs the read loop for the whole session. Don't `await` it and expect
     * the next line to run while connected; instead, react to
     * {@link SerialEvents.CONNECTION_OPENED} (and `DATA_RECEIVED`) and call
     * {@link Serial#writeLine} from there.
     *
     * @param {Object[]|null} [portFilters=null] - Optional USB vendor/product ID filters.
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     *   Use `{ baudRate: 115200 }` for ESP32.
     *
     * @example <caption>Default (Arduino Uno at 9600 baud)</caption>
     * document.getElementById("connectBtn").addEventListener("click", async () => {
     *   await serial.connectAndOpen();
     * });
     *
     * @example <caption>ESP32 at 115200 baud</caption>
     * await serial.connectAndOpen(null, { baudRate: 115200 });
     *
     * @example <caption>Filter to only show Arduino devices</caption>
     * const arduinoFilters = [
     *   { usbVendorId: 0x2341 }  // Arduino vendor ID
     * ];
     * await serial.connectAndOpen(arduinoFilters, { baudRate: 9600 });
     */
    async connectAndOpen(portFilters = null, serialOptions = { baudRate: 9600 }) {
      await this.connect(null, portFilters);

      if (this.serialPort) {
        await this.open(serialOptions);
      }
    }

    /**
     * Attempts to connect to an existing port or prompts the user to select one.
     *
     * Most callers should use {@link Serial#connectAndOpen} instead, which
     * calls this method internally and then opens the port.
     *
     * @param {?SerialPort} [existingPort=null] - A previously obtained port to reuse.
     * @param {?Object[]} [portFilters=null] - USB vendor/product ID filters for the port picker.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Serial/requestPort
     */
    async connect(existingPort = null, portFilters = null) {
      this._requireWebSerial();

      try {
        const oldApprovedPortList = await navigator.serial.getPorts();

        if (!existingPort) {
          // Prompt user to select a port (requires user gesture)
          this.serialPort = await navigator.serial.requestPort(
            portFilters ? { filters: portFilters } : {}
          );
        } else if (!oldApprovedPortList.includes(existingPort)) {
          console.log("[Serial] Port not previously approved, prompting user");
          this.serialPort = await navigator.serial.requestPort(
            portFilters ? { filters: portFilters } : {}
          );
        } else {
          console.log("[Serial] Connecting to pre-approved port:", existingPort.getInfo());
          this.serialPort = existingPort;
        }

        const portInfo = this.serialPort.getInfo();
        console.log("[Serial] Selected port:", portInfo);

      } catch (error) {
        if (error.name === "NotFoundError") {
          // User cancelled the port picker dialog — not really an error
          console.log("[Serial] Port selection cancelled by user");
        } else {
          this._fireError(error);
        }
      }
    }

    // ---------------------------------------------------------------------------
    //  Reading & Writing
    // ---------------------------------------------------------------------------

    /**
     * Writes a string to the serial port with a newline (`\n`) appended.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.writeLine("LED_ON");
     */
    async writeLine(data) {
      await this.write(data + "\n");
    }

    /**
     * Writes a string to the serial port.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.write("255,128,0");
     */
    async write(data) {
      if (!this.isOpen()) {
        throw new Error(
          "[Serial] Cannot write: port is not open. " +
          "Call connectAndOpen() first."
        );
      }
      await this.serialWriter.write(data);
    }

    // ---------------------------------------------------------------------------
    //  Open & Close
    // ---------------------------------------------------------------------------

    /**
     * Opens the serial port and begins listening for incoming data. The returned
     * promise stays pending until the port is closed, since it runs the read loop
     * internally (see {@link Serial#connectAndOpen}).
     *
     * Most callers should use {@link Serial#connectAndOpen} instead. This lower-level
     * method is called internally after a port has been selected via {@link Serial#connect}.
     *
     * @param {Object} [serialOptions={ baudRate: 9600 }] - Serial port options.
     * @see https://developer.mozilla.org/en-US/docs/Web/API/SerialPort/open
     */
    async open(serialOptions = { baudRate: 9600 }) {
      if (!this.serialPort) {
        throw new Error(
          "[Serial] No serial port selected. Call connect() or connectAndOpen() first."
        );
      }

      this._state = SerialState.OPENING;

      try {
        await this.serialPort.open(serialOptions);
        console.log("[Serial] Port opened with:", serialOptions);

        // --- Set up the writer (text encoder → serial port) ---
        const textEncoder = new TextEncoderStream();
        this.writableStreamClosed = textEncoder.readable.pipeTo(this.serialPort.writable);
        this.serialWriter = textEncoder.writable.getWriter();

        // --- Set up the reader (serial port → text decoder → line splitter) ---
        const textDecoder = new TextDecoderStream();
        this.keepReading = true;
        this.readableStreamClosed = this.serialPort.readable.pipeTo(textDecoder.writable);
        this.serialReader = textDecoder.readable
          .pipeThrough(new TransformStream(new LineBreakTransformer()))
          .getReader();

        // Auto-close if the OS reports the device unplugged (active while open).
        this._addDisconnectListener();

        this._state = SerialState.OPEN;
        this.fireEvent(SerialEvents.CONNECTION_OPENED);

        // --- Read loop: wait for lines from the device ---
        while (this.serialPort && this.serialPort.readable && this.keepReading) {
          try {
            while (true) {
              const { value, done } = await this.serialReader.read();

              if (done) {
                this.serialReader.releaseLock();
                break;
              }

              if (value) {
                this.fireEvent(SerialEvents.DATA_RECEIVED, value);
              }
            }
          } catch (error) {
            // Non-fatal read error (e.g., device temporarily unresponsive)
            if (this.keepReading) {
              this._fireError(error);
            }
            // If !keepReading, the error is expected from reader.cancel() during close()
          } finally {
            if (this.serialReader) {
              try {
                this.serialReader.releaseLock();
              } catch (e) {
                // Lock may already be released
              }
            }
          }
        }

      } catch (error) {
        this._state = SerialState.CLOSED;

        if (error.name === "InvalidStateError") {
          this._fireError(new Error(
            "[Serial] Port is already open. Is another tab or program using it?"
          ));
        } else if (error.name === "NetworkError") {
          this._fireError(new Error(
            "[Serial] Failed to open port. The device may have been disconnected, " +
            "or another program (like the Arduino Serial Monitor) may be using it."
          ));
        } else {
          this._fireError(error);
        }
      }
    }

    /**
     * Closes the serial port and releases all resources.
     *
     * Safe to call even if the port is already closed or was never opened.
     * Fires {@link SerialEvents.CONNECTION_CLOSED} when cleanup is complete.
     *
     * @example
     * document.getElementById("disconnectBtn").addEventListener("click", async () => {
     *   await serial.close();
     * });
     */
    async close() {
      if (this._state === SerialState.CLOSING || this._state === SerialState.CLOSED) {
        return; // Already closing or closed
      }

      this._state = SerialState.CLOSING;

      // Signal the read loop to stop
      this.keepReading = false;

      // Stop listening for OS-level disconnects (paired with open()).
      this._removeDisconnectListener();

      // --- Close the reader ---
      if (this.serialReader) {
        try {
          await this.serialReader.cancel();
        } catch (e) {
          console.warn("[Serial] Error cancelling reader:", e);
        }

        try {
          await this.readableStreamClosed;
        } catch (e) {
          // Expected: cancelling the reader causes the pipe to reject
        }

        this.serialReader = null;
        this.readableStreamClosed = null;
      }

      // --- Close the writer ---
      if (this.serialWriter) {
        try {
          await this.serialWriter.close();
        } catch (e) {
          console.warn("[Serial] Error closing writer:", e);
        }

        try {
          await this.writableStreamClosed;
        } catch (e) {
          console.warn("[Serial] Error waiting for writable stream:", e);
        }

        this.serialWriter = null;
        this.writableStreamClosed = null;
      }

      // --- Close the port ---
      if (this.serialPort) {
        try {
          await this.serialPort.close();
        } catch (e) {
          console.warn("[Serial] Error closing port:", e);
        }
        this.serialPort = null;
      }

      this._state = SerialState.CLOSED;
      this.fireEvent(SerialEvents.CONNECTION_CLOSED);
    }

    // ---------------------------------------------------------------------------
    //  Private helpers
    // ---------------------------------------------------------------------------

    /**
     * Registers a navigator-level "disconnect" listener that auto-closes this port
     * if the OS reports the device was unplugged. Called from {@link Serial#open};
     * paired with {@link Serial#_removeDisconnectListener} in {@link Serial#close}
     * so listeners don't accumulate across instances.
     * @private
     */
    _addDisconnectListener() {
      if (typeof navigator === "undefined" || !navigator.serial) return;
      this._onDeviceDisconnect = () => {
        console.log("[Serial] Device disconnected from system");
        if (this.serialPort) {
          this.close();
        }
      };
      navigator.serial.addEventListener("disconnect", this._onDeviceDisconnect);
    }

    /**
     * Removes the "disconnect" listener registered by {@link Serial#_addDisconnectListener}.
     * @private
     */
    _removeDisconnectListener() {
      if (this._onDeviceDisconnect && typeof navigator !== "undefined" && navigator.serial) {
        navigator.serial.removeEventListener("disconnect", this._onDeviceDisconnect);
      }
      this._onDeviceDisconnect = null;
    }

    /**
     * Checks if the Web Serial API is available in this browser.
     * @private
     * @throws {Error} If Web Serial is not supported.
     */
    _requireWebSerial() {
      if (typeof navigator === "undefined" || !navigator.serial) {
        throw new Error(
          "[Serial] Web Serial API is not supported in this browser. " +
          "Please use Chrome, Edge, or Opera."
        );
      }
    }

    /**
     * Fires an ERROR_OCCURRED event with consistent logging.
     * @private
     * @param {Error} error
     */
    _fireError(error) {
      console.error("[Serial] Error:", error);
      this.fireEvent(SerialEvents.ERROR_OCCURRED, error);
    }

    // ---------------------------------------------------------------------------
    //  Static utilities
    // ---------------------------------------------------------------------------

    /**
     * Returns `true` if the current browser supports the Web Serial API.
     *
     * @returns {boolean}
     *
     * @example
     * if (!Serial.isWebSerialSupported()) {
     *   alert("Please use Chrome, Edge, or Opera to connect to Arduino.");
     * }
     */
    static isWebSerialSupported() {
      return typeof navigator !== "undefined" && "serial" in navigator;
    }
  }


  /**
   * A TransformStream transformer that buffers incoming text chunks and emits
   * complete lines. Handles `\r\n`, `\n`, and `\r` line endings.
   *
   * Used internally by {@link Serial} to parse serial data into lines.
   *
   * @example <caption>Standalone usage (advanced)</caption>
   * const transformer = new TransformStream(new LineBreakTransformer());
   * const reader = someReadableStream.pipeThrough(transformer).getReader();
   */
  class LineBreakTransformer {
    constructor() {
      /** @private */
      this.buffer = "";
    }

    /**
     * Called by the TransformStream for each incoming chunk. Buffers data
     * and enqueues complete lines.
     *
     * @param {string} chunk - Incoming text chunk.
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    transform(chunk, controller) {
      this.buffer += chunk;

      // Split on any common line ending: \r\n, \r, or \n
      // Regex: split on \r\n first (greedy), then standalone \r or \n
      const lines = this.buffer.split(/\r?\n|\r/);

      // The last element is the incomplete line (or "" if buffer ended with a newline)
      this.buffer = lines.pop();

      for (const line of lines) {
        controller.enqueue(line);
      }
    }

    /**
     * Called when the stream is closed. Flushes any remaining buffered text.
     *
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    flush(controller) {
      if (this.buffer.length > 0) {
        controller.enqueue(this.buffer);
      }
    }
  }

  exports.LineBreakTransformer = LineBreakTransformer;
  exports.Serial = Serial;
  exports.SerialEvents = SerialEvents;
  exports.SerialState = SerialState;

})(this.Makelab.Serial = this.Makelab.Serial || {});
if(typeof window!=="undefined"&&window.Makelab&&window.Makelab.Serial){window.Serial=window.Makelab.Serial.Serial;window.SerialEvents=window.Makelab.Serial.SerialEvents;window.SerialState=window.Makelab.Serial.SerialState;window.LineBreakTransformer=window.Makelab.Serial.LineBreakTransformer;}
//# sourceMappingURL=makelab.serial.iife.js.map
