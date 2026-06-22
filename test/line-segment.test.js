/**
 * Tests for the LineSegment class.
 *
 * Geometry/label logic is tested directly. draw() is exercised against a
 * minimal mock 2D context to lock in its save/restore balancing, so that
 * per-segment style — notably the dashed-line pattern — cannot leak onto a
 * shared canvas context and corrupt later draw calls.
 */
import { LineSegment } from '../src/lib/graphics/line-segment.js';
import { Vector } from '../src/lib/math/vector.js';
import { test, assert, assertEquals } from './test-runner.js';

const EPS = 1e-9;

// --- Construction: coordinate form and vector form are equivalent ---
test('LineSegment from coordinates', () => {
  const ls = new LineSegment(0, 0, 3, 4);
  assert(ls.x1 === 0 && ls.y1 === 0 && ls.x2 === 3 && ls.y2 === 4);
});
test('LineSegment from two vectors', () => {
  const ls = new LineSegment(new Vector(0, 0), new Vector(3, 4));
  assert(ls.x1 === 0 && ls.y1 === 0 && ls.x2 === 3 && ls.y2 === 4);
});

// --- Magnitude ---
test('getMagnitude', () =>
  assertEquals(new LineSegment(0, 0, 3, 4).getMagnitude(), 5, EPS));
test('setMagnitude rescales while preserving direction', () => {
  const ls = new LineSegment(0, 0, 3, 4); // length 5, direction (0.6, 0.8)
  ls.setMagnitude(10);
  assertEquals(ls.getMagnitude(), 10, EPS);
  assert(ls.pt2.equals(new Vector(6, 8), EPS));
});

// --- Heading: atan2 normalized to [0, 2π) ---
test('getHeading along +x is 0', () =>
  assertEquals(new LineSegment(0, 0, 5, 0).getHeading(), 0, EPS));
test('getHeading along +y is π/2', () =>
  assertEquals(new LineSegment(0, 0, 0, 5).getHeading(), Math.PI / 2, EPS));
test('getHeading along -y wraps to 3π/2 rather than going negative', () =>
  assertEquals(new LineSegment(0, 0, 0, -5).getHeading(), 3 * Math.PI / 2, EPS));

// --- Vector at origin ---
test('getVectorAtOrigin', () =>
  assert(new LineSegment(1, 1, 4, 5).getVectorAtOrigin().equals(new Vector(3, 4), EPS)));

// --- Normals: perpendicular to the segment, pointing opposite ways ---
test('getNormals are perpendicular to the segment and opposite each other', () => {
  const ls = new LineSegment(0, 0, 2, 0); // along +x
  const [n1, n2] = ls.getNormals();
  assertEquals(n1.dotProduct(ls.getVectorAtOrigin()), 0, EPS); // perpendicular
  assert(n1.add(n2).equals(new Vector(0, 0), EPS));            // opposite
});

// --- Orthogonal projection + distance ---
test('getOrthogonalProjection drops a perpendicular onto the segment', () => {
  const ls = new LineSegment(0, 0, 10, 0);
  assert(ls.getOrthogonalProjection(new Vector(4, 3)).equals(new Vector(4, 0), EPS));
});
test('getOrthogonalProjection clamps to the endpoint when the foot is past the segment', () => {
  const ls = new LineSegment(0, 0, 10, 0);
  assert(ls.getOrthogonalProjection(new Vector(20, 3)).equals(new Vector(10, 0), EPS));
});
test('getDistance is the perpendicular distance to the segment', () =>
  assertEquals(new LineSegment(0, 0, 10, 0).getDistance(new Vector(4, 3)), 3, EPS));

// --- Angles between two segments ---
test('getAnglesBetween returns cw/ccw angles that sum to 2π', () => {
  const a = new LineSegment(0, 0, 1, 0);
  const b = new LineSegment(0, 0, 0, 1);
  const { clockwiseAngle, counterclockwiseAngle } = a.getAnglesBetween(b);
  assertEquals(clockwiseAngle + counterclockwiseAngle, 2 * Math.PI, EPS);
});

// --- Label generation ---
test('generateLabel includes angle and magnitude by default', () =>
  assertEquals(new LineSegment(0, 0, 10, 0).generateLabel(), '0° |10.0|'));
test('generateLabel respects the drawTextAngle toggle', () => {
  const ls = new LineSegment(0, 0, 10, 0);
  ls.drawTextAngle = false;
  assertEquals(ls.generateLabel(), '|10.0|');
});

// --- draw() must not leak per-segment canvas state (dashed-line regression) ---
test('draw() balances save/restore so dashed-line state cannot leak', () => {
  const calls = { save: 0, restore: 0 };
  const ls = new LineSegment(0, 0, 10, 10);
  ls.isDashedLine = true;
  ls.draw(mockCtx(calls));
  assert(calls.save > 0 && calls.save === calls.restore,
    `expected balanced save/restore, got save=${calls.save} restore=${calls.restore}`);
});

/** Minimal CanvasRenderingContext2D stand-in that counts save()/restore(). */
function mockCtx(calls) {
  const noop = () => {};
  return {
    save() { calls.save++; },
    restore() { calls.restore++; },
    measureText: () => ({ width: 0 }),
    beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, fill: noop,
    closePath: noop, translate: noop, rotate: noop, arc: noop,
    setLineDash: noop, fillText: noop,
    strokeStyle: '', fillStyle: '', lineWidth: 1,
    font: '', textAlign: '', textBaseline: '',
  };
}
