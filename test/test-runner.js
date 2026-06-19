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
 *   {@link assert}) to fail.
 */
export function test(name, fn) {
  tests.push({ name, fn });
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
  for (const { name, fn } of tests) {
    try {
      await fn();
      passed++;
      log(`✅ ${name}`);
    } catch (err) {
      failed++;
      log(`❌ ${name} — ${err.message}`, true);
    }
  }
  log(`\n${passed} passed, ${failed} failed (${passed + failed} total)`);

  if (!isBrowser && failed > 0 && typeof process !== 'undefined') {
    process.exitCode = 1;
  }
  return { passed, failed };
}
