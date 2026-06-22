/**
 * A tiny, zero-dependency test harness that runs the same way in Node and the
 * browser. Register tests with test(); assertions throw on failure; run()
 * executes them and reports a summary.
 *
 *   Node:    npm test   (runs `node test/all.test.js`)
 *   Browser: open test/index.html
 *
 * Kept deliberately small and framework-free so it's easy for students to read.
 */

/** @type {{name: string, fn: function(): void}[]} */
const tests = [];

/**
 * Registers a test case.
 *
 * @param {string} name - Description of what is being tested.
 * @param {function(): (void|Promise<void>)} fn - Test body; throw (e.g. via
 *   {@link assert}) to fail. May be async.
 */
export function test(name, fn) {
  tests.push({ name, fn });
}

/**
 * Registers a test that is intentionally not run (reported separately, counted
 * as neither pass nor fail). Useful when a test only makes sense in one
 * environment — e.g. Serial tests that mock `navigator`, which works in Node but
 * not in a real browser.
 *
 * @param {string} name - Description of the skipped test.
 * @param {string} [reason] - Why it is skipped (shown in the report).
 */
export function skip(name, reason = '') {
  tests.push({ name, fn: null, skipped: true, reason });
}

/**
 * Throws an Error if the condition is falsy.
 *
 * @param {*} condition - The condition that should be truthy.
 * @param {string} [message='assertion failed'] - Message shown on failure.
 */
export function assert(condition, message = 'assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Asserts that two values are equal. Numbers may differ by up to `epsilon` to
 * tolerate floating-point rounding; all other types are compared with `===`.
 *
 * @param {*} actual - The value produced by the code under test.
 * @param {*} expected - The expected value.
 * @param {number} [epsilon=0] - Allowed numeric difference.
 */
export function assertEquals(actual, expected, epsilon = 0) {
  const equal = (typeof actual === 'number' && typeof expected === 'number')
    ? Math.abs(actual - expected) <= epsilon
    : actual === expected;
  if (!equal) {
    throw new Error(`expected ${expected}, but got ${actual}`);
  }
}

/**
 * Asserts that a synchronous function throws. Optionally checks the error
 * message against a substring or RegExp.
 *
 * @param {function(): void} fn - Function expected to throw.
 * @param {string|RegExp} [expected] - Substring or pattern the message must match.
 */
export function assertThrows(fn, expected) {
  let threw = false;
  try {
    fn();
  } catch (err) {
    threw = true;
    checkErrorMatch(err, expected);
  }
  if (!threw) {
    throw new Error('expected the function to throw, but it did not');
  }
}

/**
 * Asserts that a promise (or the promise returned by a function) rejects.
 * Optionally checks the error message against a substring or RegExp.
 *
 * @param {Promise|function(): Promise} promiseOrFn - The promise, or a function returning one.
 * @param {string|RegExp} [expected] - Substring or pattern the message must match.
 * @returns {Promise<void>}
 */
export async function assertRejects(promiseOrFn, expected) {
  const p = typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn;
  let rejected = false;
  try {
    await p;
  } catch (err) {
    rejected = true;
    checkErrorMatch(err, expected);
  }
  if (!rejected) {
    throw new Error('expected the promise to reject, but it resolved');
  }
}

/** @private Verifies an error's message matches a substring or RegExp (if given). */
function checkErrorMatch(err, expected) {
  if (expected === undefined) return;
  const msg = err && err.message ? err.message : String(err);
  const ok = expected instanceof RegExp ? expected.test(msg) : msg.includes(expected);
  if (!ok) {
    throw new Error(`error message ${JSON.stringify(msg)} did not match ${expected}`);
  }
}

/**
 * Runs all registered tests and reports results to the page (in the browser)
 * or the console (in Node). In Node, sets a non-zero exit code if any test
 * fails so CI can detect failures.
 *
 * @returns {Promise<{passed: number, failed: number}>}
 */
export async function run() {
  const isBrowser = typeof document !== 'undefined';
  const output = isBrowser
    ? (document.getElementById('output') ||
       document.body.appendChild(document.createElement('pre')))
    : null;

  const log = (line, isError = false) => {
    if (isBrowser) {
      output.textContent += line + '\n';
    } else if (isError) {
      console.error(line);
    } else {
      console.log(line);
    }
  };

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const t of tests) {
    if (t.skipped) {
      skipped++;
      log(`⏭️  ${t.name}${t.reason ? ` — ${t.reason}` : ''}`);
      continue;
    }
    try {
      await t.fn();
      passed++;
      log(`✅ ${t.name}`);
    } catch (err) {
      failed++;
      log(`❌ ${t.name} — ${err.message}`, true);
    }
  }
  const skipNote = skipped > 0 ? `, ${skipped} skipped` : '';
  log(`\n${passed} passed, ${failed} failed${skipNote} (${tests.length} total)`);

  if (!isBrowser && failed > 0 && typeof process !== 'undefined') {
    process.exitCode = 1;
  }
  return { passed, failed, skipped };
}
