/**
 * Vector class unit tests.
 *
 * Runs basic arithmetic, magnitude, normalization, dot product, and angle
 * tests against the Vector class from makelab.math. Results are logged to
 * the browser dev console (Cmd+Option+I on Mac, Ctrl+Shift+I on Windows).
 */
import { Vector } from '../../../../dist/makelab.math.js';

let passed = 0;
let failed = 0;

/**
 * Asserts that two values are equal and logs PASS/FAIL.
 * Vectors are compared with Vector.equals(); numbers with a small tolerance
 * (to tolerate floating-point rounding); everything else with ===.
 *
 * @param {string} testName - Human-readable name for the test.
 * @param {*} expected - The expected value.
 * @param {*} actual - The actual value produced by the code under test.
 */
function testVector(testName, expected, actual) {
  const EPSILON = 1e-9;
  let isEqual;
  if (expected instanceof Vector && actual instanceof Vector) {
    isEqual = expected.equals(actual, EPSILON);
  } else if (typeof expected === 'number' && typeof actual === 'number') {
    isEqual = Math.abs(expected - actual) <= EPSILON;
  } else {
    isEqual = expected === actual;
  }

  if (isEqual) {
    passed++;
    console.log(`✅ ${testName}: PASSED`);
  } else {
    failed++;
    console.error(`❌ ${testName}: FAILED — expected ${expected}, got ${actual}`);
  }
}

// Basic arithmetic tests
testVector('Vector addition', new Vector(3, 4), new Vector(1, 2).add(new Vector(2, 2)));
testVector('Vector subtraction', new Vector(1, 2), new Vector(3, 4).subtract(new Vector(2, 2)));
testVector('Vector multiplication', new Vector(2, 4), new Vector(1, 2).multiply(2));
testVector('Vector division', new Vector(0.5, 1), new Vector(2, 4).divide(4));

// Magnitude and normalization tests
testVector('Vector magnitude', 5, new Vector(3, 4).magnitude());
testVector('Vector normalization', new Vector(0.6, 0.8), new Vector(3, 4).normalize());

// Dot product and angle between tests
testVector('Vector dot product', 9, new Vector(2, 3).dotProduct(new Vector(3, 1)));
testVector('Vector angle between', Math.PI / 4, new Vector(1, 1).angleBetween(new Vector(0, 1)));
testVector('Vector angle between (parallel)', 0, new Vector(1, 0).angleBetween(new Vector(2, 0)));
testVector('Vector angle between (perpendicular)', Math.PI / 2, new Vector(1, 0).angleBetween(new Vector(0, 1)));

// String representation test
testVector('Vector toString', '(2, 3)', new Vector(2, 3).toString());

// Static method test
testVector('Vector fromPoints', new Vector(2, 3), Vector.fromPoints({ x: 1, y: 2 }, { x: 3, y: 5 }));

console.log(`\n${passed} passed, ${failed} failed (${passed + failed} total)`);
