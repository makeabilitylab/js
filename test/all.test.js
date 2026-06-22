/**
 * Test entry point. Imports every test file (which registers its tests), then
 * runs them. Used by both Node (`npm test`) and the browser (test/index.html).
 */
import './vector.test.js';
import './math-utils.test.js';
import './color-utils.test.js';
import './line-segment.test.js';
import './array-utils.test.js';
import './serial.test.js';
import { run } from './test-runner.js';

run();
