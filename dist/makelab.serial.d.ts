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
declare class Serial {
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
    static isWebSerialSupported(): boolean;
    /** @type {?SerialPort} The underlying Web Serial port */
    serialPort: SerialPort | null;
    /** @type {?WritableStreamDefaultWriter} Text writer for outgoing data */
    serialWriter: WritableStreamDefaultWriter | null;
    /** @type {?ReadableStreamDefaultReader} Line-buffered reader for incoming data */
    serialReader: ReadableStreamDefaultReader | null;
    /** @private */
    private keepReading;
    /** @private */
    private readableStreamClosed;
    /** @private */
    private writableStreamClosed;
    /** @private */
    private _state;
    /**
     * Map of event labels to arrays of callback functions.
     * @private
     * @type {Map<string, function[]>}
     */
    private events;
    /**
     * Set of recognized event labels for validation.
     * @private
     * @type {Set<string>}
     */
    private knownEvents;
    /**
     * The navigator-level "disconnect" handler, registered while the port is
     * open and removed on close() so listeners don't accumulate across Serial
     * instances. Null when not open.
     * @private
     * @type {?function}
     */
    private _onDeviceDisconnect;
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
    get state(): string;
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
    on(label: string, callback: (arg0: Serial, arg1: any) => void): void;
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
    off(label: string, callback: Function): boolean;
    /**
     * Triggers an event and calls all registered handlers for it.
     *
     * @param {string} event - The event type to fire.
     * @param {*} [data=null] - Optional data passed to each handler.
     */
    fireEvent(event: string, data?: any): void;
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
    autoConnectAndOpenPreviouslyApprovedPort(serialOptions?: any): Promise<void>;
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
    isOpen(): boolean;
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
    connectAndOpen(portFilters?: any[] | null, serialOptions?: any): Promise<void>;
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
    connect(existingPort?: SerialPort | null, portFilters?: any[] | null): Promise<void>;
    /**
     * Writes a string to the serial port with a newline (`\n`) appended.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.writeLine("LED_ON");
     */
    writeLine(data: string): Promise<void>;
    /**
     * Writes a string to the serial port.
     *
     * @param {string} data - The text to send.
     * @throws {Error} If the serial port is not open.
     *
     * @example
     * await serial.write("255,128,0");
     */
    write(data: string): Promise<void>;
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
    open(serialOptions?: any): Promise<void>;
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
    close(): Promise<void>;
    /**
     * Registers a navigator-level "disconnect" listener that auto-closes this port
     * if the OS reports the device was unplugged. Called from {@link Serial#open};
     * paired with {@link Serial#_removeDisconnectListener} in {@link Serial#close}
     * so listeners don't accumulate across instances.
     * @private
     */
    private _addDisconnectListener;
    /**
     * Removes the "disconnect" listener registered by {@link Serial#_addDisconnectListener}.
     * @private
     */
    private _removeDisconnectListener;
    /**
     * Checks if the Web Serial API is available in this browser.
     * @private
     * @throws {Error} If Web Serial is not supported.
     */
    private _requireWebSerial;
    /**
     * Fires an ERROR_OCCURRED event with consistent logging.
     * @private
     * @param {Error} error
     */
    private _fireError;
}
/**
 * *
 */
type SerialEvents = string;
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
declare const SerialEvents: Readonly<{
    /** Fired when the serial port is successfully opened and ready for I/O. */
    CONNECTION_OPENED: "CONNECTION_OPENED";
    /** Fired when the serial port is closed (either programmatically or by disconnect). */
    CONNECTION_CLOSED: "CONNECTION_CLOSED";
    /** Fired for each line of text received from the serial device. */
    DATA_RECEIVED: "DATA_RECEIVED";
    /** Fired when an error occurs during connection, reading, or writing. */
    ERROR_OCCURRED: "ERROR_OCCURRED";
}>;
/**
 * Connection state constants returned by {@link Serial#state}.
 */
type SerialState = string;
/**
 * Connection state constants returned by {@link Serial#state}.
 *
 * @readonly
 * @enum {string}
 */
declare const SerialState: Readonly<{
    CLOSED: "closed";
    OPENING: "opening";
    OPEN: "open";
    CLOSING: "closing";
}>;
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
declare class LineBreakTransformer {
    /** @private */
    private buffer;
    /**
     * Called by the TransformStream for each incoming chunk. Buffers data
     * and enqueues complete lines.
     *
     * @param {string} chunk - Incoming text chunk.
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    transform(chunk: string, controller: TransformStreamDefaultController): void;
    /**
     * Called when the stream is closed. Flushes any remaining buffered text.
     *
     * @param {TransformStreamDefaultController} controller - Stream controller.
     */
    flush(controller: TransformStreamDefaultController): void;
}

export { LineBreakTransformer, Serial, SerialEvents, SerialState };
