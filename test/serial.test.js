/**
 * Tests for the Serial module.
 *
 * Serial wraps the Web Serial API (`navigator.serial`) plus Web Streams. The
 * stream-based parts (line parsing, the event emitter, state checks) are tested
 * directly; the full connect → receive → write → close lifecycle is tested
 * against a fake SerialPort backed by real Web Streams (available in Node and
 * browsers alike).
 *
 * The lifecycle tests mock the global `navigator`, which works in Node but not
 * in a real browser (where `navigator` is read-only). Those tests are therefore
 * registered with skip() when the environment won't allow the mock, so the
 * suite still runs cleanly from test/index.html in a browser.
 */
import { Serial, SerialEvents, SerialState, LineBreakTransformer }
  from '../src/lib/serial/serial.js';
import { test, skip, assert, assertEquals, assertRejects } from './test-runner.js';

// ---------------------------------------------------------------------------
//  LineBreakTransformer — pure stream transform, runs everywhere
// ---------------------------------------------------------------------------

/** Pipes the given string chunks through a LineBreakTransformer and returns the emitted lines. */
async function transformLines(chunks) {
  const out = [];
  const stream = new TransformStream(new LineBreakTransformer());
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  const draining = (async () => {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      out.push(value);
    }
  })();
  for (const c of chunks) await writer.write(c);
  await writer.close();
  await draining;
  return out;
}

test('LineBreakTransformer splits on \\n', async () =>
  assertEquals(JSON.stringify(await transformLines(['a\nb\n'])), JSON.stringify(['a', 'b'])));

test('LineBreakTransformer handles \\r\\n and bare \\r', async () =>
  assertEquals(JSON.stringify(await transformLines(['a\r\nb\rc\n'])), JSON.stringify(['a', 'b', 'c'])));

test('LineBreakTransformer buffers a partial line across chunks', async () =>
  assertEquals(JSON.stringify(await transformLines(['ab', 'cd\nef'])), JSON.stringify(['abcd', 'ef'])));

test('LineBreakTransformer flushes a trailing unterminated line', async () =>
  assertEquals(JSON.stringify(await transformLines(['done'])), JSON.stringify(['done'])));

// ---------------------------------------------------------------------------
//  Event system + state — no Web Serial needed
// ---------------------------------------------------------------------------

test('Serial starts CLOSED and not open', () => {
  const s = new Serial();
  assertEquals(s.state, SerialState.CLOSED);
  assert(!s.isOpen());
});

test('Serial.on/fireEvent delivers (sender, data) to the handler', () => {
  const s = new Serial();
  let got;
  s.on(SerialEvents.DATA_RECEIVED, (sender, data) => { got = { sender, data }; });
  s.fireEvent(SerialEvents.DATA_RECEIVED, 'hello');
  assert(got.sender === s && got.data === 'hello');
});

test('Serial.off removes a handler', () => {
  const s = new Serial();
  let calls = 0;
  const handler = () => { calls++; };
  s.on(SerialEvents.DATA_RECEIVED, handler);
  assert(s.off(SerialEvents.DATA_RECEIVED, handler) === true);
  s.fireEvent(SerialEvents.DATA_RECEIVED, 'x');
  assertEquals(calls, 0);
});

test('Serial.on ignores unknown event labels', () => {
  const s = new Serial();
  let called = false;
  s.on('NOT_AN_EVENT', () => { called = true; });
  s.fireEvent('NOT_AN_EVENT', 'x'); // no registered handlers
  assert(!called);
});

test('one throwing handler does not stop the others', () => {
  const s = new Serial();
  let second = false;
  s.on(SerialEvents.DATA_RECEIVED, () => { throw new Error('boom'); });
  s.on(SerialEvents.DATA_RECEIVED, () => { second = true; });
  s.fireEvent(SerialEvents.DATA_RECEIVED, 'x'); // must not throw
  assert(second);
});

test('write() rejects when the port is not open', async () => {
  const s = new Serial();
  await assertRejects(() => s.write('data'), /not open/i);
});

test('Serial.isWebSerialSupported() reflects whether navigator.serial exists', () => {
  // Environment-agnostic: false in Node (no navigator), true in a browser with
  // Web Serial. The explicit true/false paths are checked below + in lifecycle.
  const expected = typeof navigator !== 'undefined' && 'serial' in navigator;
  assertEquals(Serial.isWebSerialSupported(), expected);
});

// ---------------------------------------------------------------------------
//  Full lifecycle against a fake SerialPort (mocks global navigator)
// ---------------------------------------------------------------------------

/** True if we can install a mock `navigator` (Node), false in a locked-down browser global. */
function navigatorMockable() {
  if (typeof navigator !== 'undefined' && navigator.serial) return false; // real Web Serial — don't clobber
  try {
    const had = 'navigator' in globalThis;
    const prev = globalThis.navigator;
    globalThis.navigator = prev; // no-op assignment probe
    if (!had) delete globalThis.navigator;
    return true;
  } catch {
    return false;
  }
}

/** Concatenate an array of Uint8Array chunks into one. */
function concatBytes(chunks) {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

/** A fake Web Serial port backed by real Web Streams, with test hooks. */
function makeMockPort() {
  let incomingController;
  const incoming = new ReadableStream({ start(c) { incomingController = c; } });
  const writtenChunks = [];
  const outgoing = new WritableStream({ write(chunk) { writtenChunks.push(chunk); } });
  return {
    options: null,
    async open(options) { this.options = options; },
    get readable() { return incoming; },
    get writable() { return outgoing; },
    async close() { try { incomingController.close(); } catch { /* already closed */ } },
    getInfo() { return { usbVendorId: 0x2341 }; },
    // test hooks:
    pushIncoming(str) { incomingController.enqueue(new TextEncoder().encode(str)); },
    written() { return new TextDecoder().decode(concatBytes(writtenChunks)); },
  };
}

/** Install a mock `navigator.serial` that hands out `port`, run `body`, then restore. */
async function withMockSerial(port, body) {
  const had = 'navigator' in globalThis;
  const prev = globalThis.navigator;
  globalThis.navigator = {
    serial: {
      addEventListener() {},
      removeEventListener() {},
      async requestPort() { return port; },
      async getPorts() { return []; },
    },
  };
  try {
    await body();
  } finally {
    if (had) globalThis.navigator = prev; else delete globalThis.navigator;
  }
}

/** Resolve with the data from the next `event` fired on `serial`. */
function nextEvent(serial, event) {
  return new Promise((resolve) => {
    const handler = (sender, data) => { serial.off(event, handler); resolve(data); };
    serial.on(event, handler);
  });
}

/** Reject after `ms` so a stuck await fails the test instead of hanging the suite. */
function timeout(ms, label) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out: ${label}`)), ms));
}

/** Poll `predicate` until true or time out. */
async function waitUntil(predicate, label, ms = 1000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error(`timed out: ${label}`);
    await new Promise((r) => setTimeout(r, 5));
  }
}

const lifecycle = navigatorMockable() ? test : (n) => skip(n, 'requires a mockable navigator (Node)');

lifecycle('Serial: connect → open fires CONNECTION_OPENED and reports OPEN', async () => {
  const port = makeMockPort();
  await withMockSerial(port, async () => {
    const serial = new Serial();
    const opened = nextEvent(serial, SerialEvents.CONNECTION_OPENED);
    // Do NOT await connectAndOpen: open() runs a read loop that only returns on close.
    const loop = serial.connectAndOpen(null, { baudRate: 115200 });
    await Promise.race([opened, timeout(1000, 'CONNECTION_OPENED')]);
    assertEquals(serial.state, SerialState.OPEN);
    assert(serial.isOpen());
    assertEquals(port.options.baudRate, 115200);
    await serial.close();
    await Promise.race([loop, timeout(1000, 'open() to resolve after close')]);
  });
});

lifecycle('Serial: incoming bytes arrive as parsed DATA_RECEIVED lines', async () => {
  const port = makeMockPort();
  await withMockSerial(port, async () => {
    const serial = new Serial();
    const opened = nextEvent(serial, SerialEvents.CONNECTION_OPENED);
    const loop = serial.connectAndOpen();
    await Promise.race([opened, timeout(1000, 'open')]);

    const firstLine = nextEvent(serial, SerialEvents.DATA_RECEIVED);
    port.pushIncoming('72,200\r\n'); // Arduino-style CRLF line
    assertEquals(await Promise.race([firstLine, timeout(1000, 'DATA_RECEIVED')]), '72,200');

    await serial.close();
    await Promise.race([loop, timeout(1000, 'close')]);
  });
});

lifecycle('Serial: writeLine() sends the text with a trailing newline', async () => {
  const port = makeMockPort();
  await withMockSerial(port, async () => {
    const serial = new Serial();
    const opened = nextEvent(serial, SerialEvents.CONNECTION_OPENED);
    const loop = serial.connectAndOpen();
    await Promise.race([opened, timeout(1000, 'open')]);

    await serial.writeLine('LED_ON');
    await waitUntil(() => port.written().includes('\n'), 'writeLine to reach the port');
    assertEquals(port.written(), 'LED_ON\n');

    await serial.close();
    await Promise.race([loop, timeout(1000, 'close')]);
  });
});

lifecycle('Serial: close() fires CONNECTION_CLOSED and returns to CLOSED', async () => {
  const port = makeMockPort();
  await withMockSerial(port, async () => {
    const serial = new Serial();
    const opened = nextEvent(serial, SerialEvents.CONNECTION_OPENED);
    const loop = serial.connectAndOpen();
    await Promise.race([opened, timeout(1000, 'open')]);

    const closed = nextEvent(serial, SerialEvents.CONNECTION_CLOSED);
    await serial.close();
    await Promise.race([closed, timeout(1000, 'CONNECTION_CLOSED')]);
    assertEquals(serial.state, SerialState.CLOSED);
    assert(!serial.isOpen());
    await assertRejects(() => serial.write('x'), /not open/i); // can't write after close
    await Promise.race([loop, timeout(1000, 'open() resolves')]);
  });
});

lifecycle('Serial.isWebSerialSupported() is true when navigator.serial exists', async () => {
  await withMockSerial(makeMockPort(), async () => {
    assertEquals(Serial.isWebSerialSupported(), true);
  });
});
