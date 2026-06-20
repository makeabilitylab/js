// morph-paths.js — pluggable trajectory shapes for the Makeability Lab logo
// morph / reverse-explosion animations.
//
// By default, MakeabilityLabLogoMorpher moves every triangle along a straight
// line from its scattered start to its destination in the logo (only the
// *timing* is eased). A "path" lets each triangle instead travel a curved
// trajectory — an arc, a random Bézier, or an inward spiral — while the morpher
// still owns timing, easing, colour, and stagger.
//
// A path is a small object with two methods:
//
//   prepare(tri, ctx)   Called once per triangle when the start/end states are
//                       set (in morpher.reset / resetFromArt). May stash
//                       per-triangle data on `tri._path` (e.g. a random control
//                       point) so the trajectory is stable for the whole morph.
//   position(tri, t)    Called every frame with the eased progress `t` in
//                       [0, 1]. Returns {x, y}: the triangle's position at `t`.
//                       Reads `tri._start`, `tri._dest`, and `tri._path`.
//
// `ctx` passed to prepare() is:
//   { centroidX, centroidY, canvasWidth, canvasHeight, index, count }
// where (centroidX, centroidY) is the centre of the assembled logo.
//
// Each path is a factory so callers can tune it, e.g. `arcPath({ amplitude: 0.5 })`.
// The MORPH_PATHS registry maps short names → factories for easy UI wiring.
//
// By Jon E. Froehlich
// https://makeabilitylab.io
//
// Source: https://github.com/makeabilitylab/js

import { lerp, random } from '../math/math-utils.js';

/**
 * @typedef {Object} MorphPath
 * @property {function(Triangle, MorphPathContext): void} prepare - Per-triangle
 *   one-time setup, called when start/end states are assigned.
 * @property {function(Triangle, number): {x: number, y: number}} position -
 *   Returns the triangle's position at eased progress `t` in [0, 1].
 */

/**
 * @typedef {Object} MorphPathContext
 * @property {number} centroidX - X of the assembled logo's centre.
 * @property {number} centroidY - Y of the assembled logo's centre.
 * @property {number} canvasWidth
 * @property {number} canvasHeight
 * @property {number} index - This triangle's index in the animated pool.
 * @property {number} count - Total number of animated triangles.
 */

/**
 * Straight-line path — the classic reverse-explosion behaviour. Position is a
 * plain lerp from start to destination, so with the default easing this is
 * identical to the morpher's original motion.
 *
 * @returns {MorphPath}
 */
export function linearPath() {
  return {
    prepare() {},
    position(tri, t) {
      const s = tri._start, d = tri._dest;
      return { x: lerp(s.x, d.x, t), y: lerp(s.y, d.y, t) };
    },
  };
}

/**
 * Arc path — each triangle is lobbed into place along a parabola, offset
 * perpendicular to its straight-line route by `sin(π·t)` so it bows out at the
 * midpoint and lands exactly on target. The bow scales with travel distance, so
 * far-flung pieces arc more than nearby ones.
 *
 * @param {Object} [opts]
 * @param {number} [opts.amplitude=0.35] - Peak perpendicular offset as a
 *   fraction of the start→dest distance.
 * @param {boolean} [opts.randomizeSign=true] - If true, each triangle bows left
 *   or right at random; if false, all bow the same way.
 * @returns {MorphPath}
 */
export function arcPath({ amplitude = 0.35, randomizeSign = true } = {}) {
  return {
    prepare(tri) {
      const s = tri._start, d = tri._dest;
      const dist = Math.hypot(d.x - s.x, d.y - s.y);
      const sign = randomizeSign ? (random(0, 1) < 0.5 ? -1 : 1) : 1;
      // Jitter the amplitude a little so arcs don't look mechanically uniform.
      tri._path = { amp: sign * amplitude * dist * random(0.6, 1.0) };
    },
    position(tri, t) {
      const s = tri._start, d = tri._dest;
      const x = lerp(s.x, d.x, t);
      const y = lerp(s.y, d.y, t);
      // Unit vector perpendicular to the start→dest direction.
      const dx = d.x - s.x, dy = d.y - s.y;
      const len = Math.hypot(dx, dy) || 1;
      const offset = Math.sin(Math.PI * t) * tri._path.amp;
      return { x: x + (-dy / len) * offset, y: y + (dx / len) * offset };
    },
  };
}

/**
 * Bézier path — each triangle follows a quadratic Bézier curve through a random
 * control point near the midpoint of its route. Because every triangle gets its
 * own control point, the assembly looks organic with no two pieces alike.
 *
 * @param {Object} [opts]
 * @param {number} [opts.spread=0.4] - How far the control point can stray from
 *   the route midpoint, as a fraction of the start→dest distance.
 * @returns {MorphPath}
 */
export function bezierPath({ spread = 0.4 } = {}) {
  return {
    prepare(tri) {
      const s = tri._start, d = tri._dest;
      const dist = Math.hypot(d.x - s.x, d.y - s.y);
      const r = spread * dist;
      tri._path = {
        cx: (s.x + d.x) / 2 + random(-r, r),
        cy: (s.y + d.y) / 2 + random(-r, r),
      };
    },
    position(tri, t) {
      const s = tri._start, d = tri._dest, p = tri._path;
      const u = 1 - t;
      return {
        x: u * u * s.x + 2 * u * t * p.cx + t * t * d.x,
        y: u * u * s.y + 2 * u * t * p.cy + t * t * d.y,
      };
    },
  };
}

/**
 * Spiral path — triangles swirl inward toward the logo, orbiting its centroid as
 * they converge. Each triangle's polar coordinates (radius, angle) relative to
 * the centroid are interpolated, with `turns` extra revolutions mixed in so the
 * whole field rotates into place like a vortex.
 *
 * @param {Object} [opts]
 * @param {number} [opts.turns=1] - Extra full revolutions added to each
 *   triangle's angular sweep. Higher = more swirl.
 * @returns {MorphPath}
 */
export function spiralPath({ turns = 1 } = {}) {
  const TWO_PI = Math.PI * 2;
  return {
    prepare(tri, ctx) {
      const s = tri._start, d = tri._dest;
      const cx = ctx.centroidX, cy = ctx.centroidY;
      const a0 = Math.atan2(s.y - cy, s.x - cx);
      const a1 = Math.atan2(d.y - cy, d.x - cx);
      // Shortest angular delta, then add full turns for a coherent swirl.
      let delta = (a1 - a0) % TWO_PI;
      if (delta > Math.PI) delta -= TWO_PI;
      if (delta < -Math.PI) delta += TWO_PI;
      tri._path = {
        cx, cy,
        a0,
        da: delta + turns * TWO_PI,
        r0: Math.hypot(s.x - cx, s.y - cy),
        r1: Math.hypot(d.x - cx, d.y - cy),
      };
    },
    position(tri, t) {
      const p = tri._path;
      const a = p.a0 + p.da * t;
      const r = lerp(p.r0, p.r1, t);
      return { x: p.cx + r * Math.cos(a), y: p.cy + r * Math.sin(a) };
    },
  };
}

/**
 * Registry of path factories keyed by short name, for wiring to UI controls.
 * Each value is a factory: call it (optionally with options) to get a MorphPath.
 *
 * @type {Object<string, function(Object=): MorphPath>}
 */
export const MORPH_PATHS = {
  linear: linearPath,
  arc:    arcPath,
  bezier: bezierPath,
  spiral: spiralPath,
};
