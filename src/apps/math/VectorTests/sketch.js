// vector-tests.js
import { Vector } from '/dist/makelab.math.js';

function testVector(testName, expectedResult, actualResult) {
  const result = expectedResult === actualResult;
  // console.log(`${testName}: ${result ? 'PASSED' : 'FAILED'}`);
 
  console.log(`  Expected: ${expectedResult}`);
  console.log(`  Actual: ${actualResult}`);
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
testVector('Vector dot product', 10, new Vector(2, 3).dotProduct(new Vector(3, 1)));
testVector('Vector angle between', Math.PI / 4, new Vector(1, 1).angleBetween(new Vector(0, 1)));
testVector('Vector angle between (parallel)', 0, new Vector(1, 0).angleBetween(new Vector(2, 0)));
testVector('Vector angle between (perpendicular)', Math.PI / 2, new Vector(1, 0).angleBetween(new Vector(0, 1)));

// String representation test
testVector('Vector toString', '(2, 3)', new Vector(2, 3).toString());

// Static method test
testVector('Vector fromPoints', new Vector(2, 3), Vector.fromPoints({ x: 1, y: 2 }, { x: 3, y: 5 }));