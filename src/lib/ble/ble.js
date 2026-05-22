// ble.js — A Web Bluetooth API wrapper for physical computing
//
// Provides a simple, event-driven interface for BLE (Bluetooth Low Energy)
// communication between a web browser and microcontrollers (ESP32, Arduino Nano 33, etc.).
//
// Designed to parallel the serial.js API so students familiar with Web Serial
// can apply the same patterns to BLE — same event system, same connect/read/write
// workflow, different transport.
//
// Web Bluetooth browser support (as of 2026): Chrome, Edge, Opera (desktop + Android)
// NOT supported: Safari, Firefox (behind flag), iOS
// Requires HTTPS or localhost (will not work from file:// URLs)
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
//
// Quick test: open the browser dev console and type `navigator.bluetooth`
// If it returns a Bluetooth object, your browser supports Web Bluetooth.
// If it returns `undefined`, it does not.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js
// Textbook: https://makeabilitylab.github.io/physcomp/esp32/ble.html

/**
 * Enum-like object of BLE event types. Use these with {@link BLE#on} to
 * subscribe to BLE lifecycle and data events.
 *
 * Mirrors the {@link SerialEvents} pattern from serial.js for consistency.
 *
 * @readonly
 * @enum {string}
 *
 * @example
 * ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
 *   console.log("Received:", data.value, "from", data.characteristicUUID);
 * });
 */
const BLEEvents = Object.freeze({
  /** Fired when a GATT connection to the BLE peripheral is established. */
  CONNECTED: "CONNECTED",

  /** Fired when the GATT connection is lost (user-initiated or unexpected). */
  DISCONNECTED: "DISCONNECTED",

  /**
   * Fired when a subscribed characteristic sends a notification.
   * Handler receives `(sender, { characteristicUUID, value, rawValue })` where:
   *   - `characteristicUUID` — which characteristic sent the notification
   *   - `value` — the data decoded as a UTF-8 string
   *   - `rawValue` — the raw DataView for binary processing
   */
  DATA_RECEIVED: "DATA_RECEIVED",

  /** Fired when a BLE operation encounters an error. */
  ERROR_OCCURRED: "ERROR_OCCURRED",
});

/**
 * Connection state constants returned by {@link BLE#state}.
 *
 * @readonly
 * @enum {string}
 */
const BLEState = Object.freeze({
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTING: "disconnecting",
});

/**
 * A simple, event-driven wrapper around the Web Bluetooth API for BLE
 * communication with microcontrollers.
 *
 * Handles the complexity of GATT service/characteristic discovery, notification
 * subscriptions, and data encoding so you can focus on the BLE interaction itself.
 *
 * @example <caption>Basic usage — subscribe to sensor notifications</caption>
 * const ble = new BLE();
 *
 * ble.on(BLEEvents.CONNECTED, () => console.log("Connected!"));
 *
 * ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
 *   console.log("Sensor value:", data.value);
 * });
 *
 * ble.on(BLEEvents.ERROR_OCCURRED, (sender, error) => {
 *   console.error("Error:", error.message);
 * });
 *
 * // Connect and subscribe to a sensor characteristic
 * await ble.connectAndSubscribe(
 *   { filters: [{ services: [SERVICE_UUID] }] },
 *   SERVICE_UUID,
 *   SENSOR_CHAR_UUID
 * );
 *
 * @example <caption>Write data to control an LED</caption>
 * await ble.connect({ filters: [{ services: [SERVICE_UUID] }] });
 * await ble.write(LED_CHAR_UUID, new Uint8Array([255, 0, 128]), SERVICE_UUID);
 *
 * @example <caption>Write a text string</caption>
 * await ble.write(COMMAND_CHAR_UUID, "ON", SERVICE_UUID);
 */
class BLE {

  constructor() {
    /** @type {?BluetoothDevice} The connected Bluetooth device */
    this.device = null;

    /** @type {?BluetoothRemoteGATTServer} The GATT server on the connected device */
    this.server = null;

    /**
     * Cache of discovered services, keyed by lowercase UUID.
     * Avoids redundant `getPrimaryService()` calls after initial discovery.
     * @type {Map<string, BluetoothRemoteGATTService>}
     */
    this.services = new Map();

    /**
     * Cache of discovered characteristics, keyed by lowercase UUID.
     * @type {Map<string, BluetoothRemoteGATTCharacteristic>}
     */
    this.characteristics = new Map();

    /**
     * Set of characteristic UUIDs currently subscribed to notifications.
     * Retained across disconnects so reconnection logic knows what to resubscribe to.
     * @type {Set<string>}
     */
    this.subscribedCharacteristics = new Set();

    /** @private */
    this._state = BLEState.DISCONNECTED;

    /**
     * Map of event labels to arrays of callback functions.
     * @private
     * @type {Map<string, function[]>}
     */
    this._events = new Map();

    /**
     * Set of recognized event labels for validation.
     * @private
     * @type {Set<string>}
     */
    this._knownEvents = new Set([
      BLEEvents.CONNECTED,
      BLEEvents.DISCONNECTED,
      BLEEvents.DATA_RECEIVED,
      BLEEvents.ERROR_OCCURRED,
    ]);

    // Bind the disconnection handler so we can add/remove it as a listener
    /** @private */
    this._onDisconnected = this._handleDisconnection.bind(this);
  }

  // ---------------------------------------------------------------------------
  //  Properties
  // ---------------------------------------------------------------------------

  /**
   * The current connection state.
   *
   * @returns {string} One of {@link BLEState}: `"disconnected"`, `"connecting"`,
   *   `"connected"`, or `"disconnecting"`.
   *
   * @example
   * if (ble.state === BLEState.CONNECTED) {
   *   await ble.write(charUUID, data);
   * }
   */
  get state() {
    return this._state;
  }

  // ---------------------------------------------------------------------------
  //  Event system (mirrors serial.js)
  // ---------------------------------------------------------------------------

  /**
   * Registers an event listener for a specific event.
   *
   * @param {string} label - The event type. Must be one of {@link BLEEvents}.
   * @param {function(BLE, *): void} callback - Handler function. Receives
   *   the BLE instance as the first argument and event-specific data as the second.
   *
   * @example
   * ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
   *   console.log("Characteristic:", data.characteristicUUID);
   *   console.log("Value (string):", data.value);
   *   console.log("Value (raw):", data.rawValue);
   * });
   */
  on(label, callback) {
    if (!this._knownEvents.has(label)) {
      console.warn(`[BLE] Unknown event "${String(label)}". ` +
        `Known events: ${[...this._knownEvents].join(", ")}`);
      return;
    }
    if (!this._events.has(label)) {
      this._events.set(label, []);
    }
    this._events.get(label).push(callback);
  }

  /**
   * Removes a previously registered event listener.
   *
   * @param {string} label - The event type.
   * @param {function} callback - The exact function reference passed to {@link BLE#on}.
   * @returns {boolean} `true` if the listener was found and removed, `false` otherwise.
   *
   * @example
   * function onData(sender, data) { console.log(data.value); }
   * ble.on(BLEEvents.DATA_RECEIVED, onData);
   * // Later:
   * ble.off(BLEEvents.DATA_RECEIVED, onData);
   */
  off(label, callback) {
    if (!this._events.has(label)) return false;
    const listeners = this._events.get(label);
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
    if (this._events.has(event)) {
      for (const callback of this._events.get(event)) {
        try {
          callback(this, data);
        } catch (err) {
          console.error(`[BLE] Error in ${String(event)} handler:`, err);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  //  Connection
  // ---------------------------------------------------------------------------

  /**
   * Returns `true` if currently connected to a BLE device.
   *
   * @returns {boolean}
   *
   * @example
   * if (ble.isConnected()) {
   *   await ble.write(charUUID, data);
   * }
   */
  isConnected() {
    return this._state === BLEState.CONNECTED &&
      this.server !== null &&
      this.server.connected;
  }

  /**
   * Prompts the user to select a BLE device and connects to its GATT server.
   *
   * **Must be called from a user gesture** (e.g., a button click) because
   * `navigator.bluetooth.requestDevice()` requires user activation.
   *
   * @param {RequestDeviceOptions} requestDeviceOptions - Options for device selection.
   *   At minimum, specify `filters` (to match services or device names) or
   *   `acceptAllDevices: true`.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice
   *
   * @example <caption>Connect to a device advertising a specific service</caption>
   * document.getElementById("connectBtn").addEventListener("click", async () => {
   *   await ble.connect({
   *     filters: [{ services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] }]
   *   });
   * });
   *
   * @example <caption>Connect by device name</caption>
   * await ble.connect({
   *   filters: [{ name: 'ESP32-BLE' }],
   *   optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b']
   * });
   */
  async connect(requestDeviceOptions) {
    this._requireWebBluetooth();

    this._state = BLEState.CONNECTING;

    try {
      console.log("[BLE] Requesting device...", requestDeviceOptions);
      this.device = await navigator.bluetooth.requestDevice(requestDeviceOptions);
      console.log("[BLE] Device selected:", this.device.name);

      // Listen for unexpected disconnection
      this.device.addEventListener("gattserverdisconnected", this._onDisconnected);

      console.log("[BLE] Connecting to GATT server...");
      this.server = await this.device.gatt.connect();
      console.log("[BLE] Connected to GATT server.");

      // Clear caches from any prior connection
      this.services.clear();
      this.characteristics.clear();

      this._state = BLEState.CONNECTED;
      this.fireEvent(BLEEvents.CONNECTED);

    } catch (error) {
      this._state = BLEState.DISCONNECTED;

      if (error.name === "NotFoundError") {
        // User cancelled the device picker — not really an error
        console.log("[BLE] Device selection cancelled by user.");
      } else {
        this._fireError(error);
      }
    }
  }

  /**
   * Connects to a BLE device and subscribes to one or more characteristics
   * in a single call. This is the most common usage pattern.
   *
   * **Must be called from a user gesture** (see {@link BLE#connect}).
   *
   * @param {RequestDeviceOptions} requestDeviceOptions - Options for device selection.
   * @param {string} serviceUUID - The UUID of the service containing the characteristics.
   * @param {string|string[]} characteristicUUIDs - One or more characteristic UUIDs
   *   to subscribe to for notifications.
   *
   * @example <caption>Connect and subscribe to a single sensor</caption>
   * await ble.connectAndSubscribe(
   *   { filters: [{ services: [SERVICE_UUID] }] },
   *   SERVICE_UUID,
   *   SENSOR_CHAR_UUID
   * );
   *
   * @example <caption>Connect and subscribe to multiple characteristics</caption>
   * await ble.connectAndSubscribe(
   *   { filters: [{ services: [SERVICE_UUID] }] },
   *   SERVICE_UUID,
   *   [SENSOR_CHAR_UUID, BUTTON_CHAR_UUID]
   * );
   */
  async connectAndSubscribe(requestDeviceOptions, serviceUUID, characteristicUUIDs) {
    await this.connect(requestDeviceOptions);

    if (!this.isConnected()) {
      return; // connect() will have already fired an error event
    }

    // Ensure the service is discovered
    await this.getService(serviceUUID);

    // Normalize to array
    const uuids = Array.isArray(characteristicUUIDs)
      ? characteristicUUIDs
      : [characteristicUUIDs];

    for (const uuid of uuids) {
      await this.subscribe(uuid, serviceUUID);
    }
  }

  /**
   * Disconnects from the BLE device and releases resources.
   *
   * Safe to call even if already disconnected or never connected.
   * Fires {@link BLEEvents.DISCONNECTED} when cleanup is complete.
   *
   * @example
   * document.getElementById("disconnectBtn").addEventListener("click", async () => {
   *   await ble.disconnect();
   * });
   */
  async disconnect() {
    if (this._state === BLEState.DISCONNECTING ||
        this._state === BLEState.DISCONNECTED) {
      return; // Already disconnecting or disconnected
    }

    this._state = BLEState.DISCONNECTING;

    // Remove the listener before intentional disconnect to avoid double-firing
    if (this.device) {
      this.device.removeEventListener("gattserverdisconnected", this._onDisconnected);
    }

    if (this.server && this.server.connected) {
      this.server.disconnect();
    }

    this._cleanup();
    this._state = BLEState.DISCONNECTED;
    this.fireEvent(BLEEvents.DISCONNECTED);
  }

  // ---------------------------------------------------------------------------
  //  Service & Characteristic Discovery
  // ---------------------------------------------------------------------------

  /**
   * Gets a primary service by UUID. Results are cached to avoid redundant
   * GATT lookups on subsequent calls.
   *
   * @param {string} serviceUUID - The UUID of the service to retrieve.
   * @returns {Promise<BluetoothRemoteGATTService>}
   * @throws {Error} If not connected or the service is not found.
   *
   * @example
   * const service = await ble.getService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
   */
  async getService(serviceUUID) {
    if (!this.isConnected()) {
      throw new Error("[BLE] Not connected. Call connect() first.");
    }

    const uuid = serviceUUID.toLowerCase();

    if (!this.services.has(uuid)) {
      console.log(`[BLE] Discovering service ${uuid}...`);
      const service = await this.server.getPrimaryService(uuid);
      this.services.set(uuid, service);
      console.log(`[BLE] Service ${uuid} discovered.`);
    }

    return this.services.get(uuid);
  }

  /**
   * Gets a characteristic by UUID. Automatically discovers the parent service
   * if `serviceUUID` is provided, or searches all cached services otherwise.
   *
   * @param {string} characteristicUUID - The UUID of the characteristic.
   * @param {string} [serviceUUID] - The UUID of the parent service.
   *   If omitted, searches all previously discovered services.
   * @returns {Promise<BluetoothRemoteGATTCharacteristic>}
   * @throws {Error} If not connected or the characteristic is not found.
   *
   * @example
   * const char = await ble.getCharacteristic(SENSOR_UUID, SERVICE_UUID);
   */
  async getCharacteristic(characteristicUUID, serviceUUID = null) {
    if (!this.isConnected()) {
      throw new Error("[BLE] Not connected. Call connect() first.");
    }

    const charUUID = characteristicUUID.toLowerCase();

    if (!this.characteristics.has(charUUID)) {
      let characteristic = null;

      if (serviceUUID) {
        const service = await this.getService(serviceUUID);
        characteristic = await service.getCharacteristic(charUUID);
      } else {
        // Search all cached services
        for (const service of this.services.values()) {
          try {
            characteristic = await service.getCharacteristic(charUUID);
            break;
          } catch (e) {
            // Not in this service, try the next
          }
        }

        if (!characteristic) {
          throw new Error(
            `[BLE] Characteristic ${charUUID} not found. ` +
            `Provide a serviceUUID or call getService() first.`
          );
        }
      }

      this.characteristics.set(charUUID, characteristic);
      console.log(`[BLE] Characteristic ${charUUID} discovered.`);
    }

    return this.characteristics.get(charUUID);
  }

  // ---------------------------------------------------------------------------
  //  Data operations: subscribe, read, write
  // ---------------------------------------------------------------------------

  /**
   * Subscribes to notifications on a characteristic. When the peripheral pushes
   * an update, a {@link BLEEvents.DATA_RECEIVED} event fires.
   *
   * The callback receives `(sender, data)` where `data` is:
   * ```
   * {
   *   characteristicUUID: string,  // which characteristic sent the notification
   *   value: string,               // data decoded as UTF-8
   *   rawValue: DataView           // raw binary data
   * }
   * ```
   *
   * @param {string} characteristicUUID - The UUID of the characteristic.
   * @param {string} [serviceUUID] - The UUID of the parent service (optional if
   *   the service was previously discovered).
   *
   * @example
   * ble.on(BLEEvents.DATA_RECEIVED, (sender, data) => {
   *   console.log(`Sensor: ${data.value}`);
   * });
   * await ble.subscribe(SENSOR_UUID, SERVICE_UUID);
   */
  async subscribe(characteristicUUID, serviceUUID = null) {
    try {
      const characteristic = await this.getCharacteristic(characteristicUUID, serviceUUID);
      const charUUID = characteristicUUID.toLowerCase();

      characteristic.addEventListener("characteristicvaluechanged", (event) => {
        const rawValue = event.target.value;
        const decoder = new TextDecoder();
        const value = decoder.decode(rawValue);

        this.fireEvent(BLEEvents.DATA_RECEIVED, {
          characteristicUUID: charUUID,
          value: value,
          rawValue: rawValue,
        });
      });

      await characteristic.startNotifications();
      this.subscribedCharacteristics.add(charUUID);
      console.log(`[BLE] Subscribed to notifications on ${charUUID}.`);

    } catch (error) {
      console.error(`[BLE] Error subscribing to ${characteristicUUID}:`, error);
      this._fireError(error);
    }
  }

  /**
   * Unsubscribes from notifications on a characteristic.
   *
   * @param {string} characteristicUUID - The UUID of the characteristic.
   */
  async unsubscribe(characteristicUUID) {
    try {
      const charUUID = characteristicUUID.toLowerCase();

      if (this.characteristics.has(charUUID)) {
        const characteristic = this.characteristics.get(charUUID);
        await characteristic.stopNotifications();
        this.subscribedCharacteristics.delete(charUUID);
        console.log(`[BLE] Unsubscribed from ${charUUID}.`);
      }
    } catch (error) {
      console.error(`[BLE] Error unsubscribing from ${characteristicUUID}:`, error);
      this._fireError(error);
    }
  }

  /**
   * Reads the current value of a characteristic.
   *
   * @param {string} characteristicUUID - The UUID of the characteristic to read.
   * @param {string} [serviceUUID] - The UUID of the parent service (optional).
   * @returns {Promise<?{value: string, rawValue: DataView}>}
   *   An object with the decoded string and raw DataView, or `null` on error.
   *
   * @example
   * const result = await ble.read(SENSOR_UUID, SERVICE_UUID);
   * if (result) {
   *   console.log("Greeting:", result.value);
   *   console.log("First byte:", result.rawValue.getUint8(0));
   * }
   */
  async read(characteristicUUID, serviceUUID = null) {
    try {
      const characteristic = await this.getCharacteristic(characteristicUUID, serviceUUID);
      const rawValue = await characteristic.readValue();
      const decoder = new TextDecoder();
      const value = decoder.decode(rawValue);
      return { value, rawValue };
    } catch (error) {
      console.error(`[BLE] Error reading ${characteristicUUID}:`, error);
      this._fireError(error);
      return null;
    }
  }

  /**
   * Writes data to a characteristic (with response — the peripheral acknowledges).
   *
   * Accepts data as a `Uint8Array`, `ArrayBuffer`, `DataView`, or a `string`
   * (which is automatically UTF-8 encoded).
   *
   * @param {string} characteristicUUID - The UUID of the characteristic to write to.
   * @param {Uint8Array|ArrayBuffer|DataView|string} data - The data to write.
   * @param {string} [serviceUUID] - The UUID of the parent service (optional).
   *
   * @example <caption>Write raw bytes (e.g., RGB color)</caption>
   * await ble.write(LED_UUID, new Uint8Array([255, 0, 128]), SERVICE_UUID);
   *
   * @example <caption>Write a text command</caption>
   * await ble.write(COMMAND_UUID, "ON", SERVICE_UUID);
   */
  async write(characteristicUUID, data, serviceUUID = null) {
    try {
      const characteristic = await this.getCharacteristic(characteristicUUID, serviceUUID);
      const writeData = this._encodeData(data);
      await characteristic.writeValue(writeData);
    } catch (error) {
      console.error(`[BLE] Error writing to ${characteristicUUID}:`, error);
      this._fireError(error);
    }
  }

  /**
   * Writes data to a characteristic without waiting for a response.
   *
   * Faster than {@link BLE#write} but provides no confirmation. Use for
   * high-frequency writes (e.g., streaming slider values) where occasional
   * dropped packets are acceptable.
   *
   * @param {string} characteristicUUID - The UUID of the characteristic.
   * @param {Uint8Array|ArrayBuffer|DataView|string} data - The data to write.
   * @param {string} [serviceUUID] - The UUID of the parent service (optional).
   *
   * @example
   * // Rapid color updates from a slider
   * await ble.writeWithoutResponse(LED_UUID, new Uint8Array([r, g, b]));
   */
  async writeWithoutResponse(characteristicUUID, data, serviceUUID = null) {
    try {
      const characteristic = await this.getCharacteristic(characteristicUUID, serviceUUID);
      const writeData = this._encodeData(data);
      await characteristic.writeValueWithoutResponse(writeData);
    } catch (error) {
      console.error(`[BLE] Error writing (no response) to ${characteristicUUID}:`, error);
      this._fireError(error);
    }
  }

  // ---------------------------------------------------------------------------
  //  Convenience
  // ---------------------------------------------------------------------------

  /**
   * Returns the name of the connected device, or `null` if not connected.
   *
   * @returns {?string}
   *
   * @example
   * console.log("Connected to:", ble.getDeviceName());
   */
  getDeviceName() {
    return this.device ? this.device.name : null;
  }

  // ---------------------------------------------------------------------------
  //  Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Handles unexpected disconnection (device out of range, powered off, etc.).
   * @private
   */
  _handleDisconnection() {
    console.log("[BLE] Device disconnected unexpectedly.");
    this._cleanup();
    this._state = BLEState.DISCONNECTED;
    this.fireEvent(BLEEvents.DISCONNECTED);
  }

  /**
   * Resets internal state after disconnection. Retains `subscribedCharacteristics`
   * so reconnection logic can resubscribe.
   * @private
   */
  _cleanup() {
    this.server = null;
    this.services.clear();
    this.characteristics.clear();
  }

  /**
   * Checks if the Web Bluetooth API is available in this browser.
   * @private
   * @throws {Error} If Web Bluetooth is not supported.
   */
  _requireWebBluetooth() {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
      throw new Error(
        "[BLE] Web Bluetooth API is not supported in this browser. " +
        "Use Chrome or Edge on desktop/Android. " +
        "Web Bluetooth is not available on iOS."
      );
    }
  }

  /**
   * Fires an ERROR_OCCURRED event with consistent logging.
   * @private
   * @param {Error} error
   */
  _fireError(error) {
    console.error("[BLE] Error:", error);
    this.fireEvent(BLEEvents.ERROR_OCCURRED, error);
  }

  /**
   * Encodes data for writing. Strings are converted to UTF-8 bytes;
   * all other types are passed through.
   * @private
   * @param {Uint8Array|ArrayBuffer|DataView|string} data
   * @returns {Uint8Array|ArrayBuffer|DataView}
   */
  _encodeData(data) {
    if (typeof data === "string") {
      return new TextEncoder().encode(data);
    }
    return data;
  }

  // ---------------------------------------------------------------------------
  //  Static utilities
  // ---------------------------------------------------------------------------

  /**
   * Returns `true` if the current browser supports the Web Bluetooth API.
   *
   * @returns {boolean}
   *
   * @example
   * if (!BLE.isWebBluetoothSupported()) {
   *   alert("Please use Chrome or Edge to connect to your ESP32 over BLE.");
   * }
   */
  static isWebBluetoothSupported() {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }
}

export { BLE, BLEEvents, BLEState };
