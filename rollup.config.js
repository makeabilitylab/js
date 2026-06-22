// Run this config file with the following command:
// npx rollup -c rollup.config.js
// 
// This will generate the following files in the dist folder:
//
// ESM (ES module) builds — for use with <script type="module"> and import:
//   1. makelab.math.js       / makelab.math.min.js
//   2. makelab.graphics.js   / makelab.graphics.min.js
//   3. makelab.serial.js     / makelab.serial.min.js
//   4. makelab.logo.js       / makelab.logo.min.js
//   5. makelab.all.js        / makelab.all.min.js
//
// IIFE (global variable) builds — for use with plain <script> tags:
//   6. makelab.math.iife.js       / makelab.math.iife.min.js       → window.Makelab.Math
//   7. makelab.graphics.iife.js   / makelab.graphics.iife.min.js   → window.Makelab.Graphics
//   8. makelab.serial.iife.js     / makelab.serial.iife.min.js     → window.Makelab.Serial
//   9. makelab.logo.iife.js       / makelab.logo.iife.min.js       → window.Makelab.Logo
//  10. makelab.all.iife.js        / makelab.all.iife.min.js        → window.Makelab
//
// The IIFE builds are designed for educational contexts (e.g., p5.js sketches)
// where ES module imports add unnecessary complexity. After including an IIFE
// build via a <script> tag, its exports are available as global variables:
//
//   <script src="https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.min.js"></script>
//   <script>
//     // Serial and SerialEvents are now global variables
//     const serial = new Serial();
//     serial.on(SerialEvents.DATA_RECEIVED, (sender, data) => { ... });
//   </script>

import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commonPlugins = [
  resolve(),
  alias({
    entries: [
      { find: '@lib', replacement: path.resolve(__dirname, 'src/lib') },
      { find: '@graphicslib', replacement: path.resolve(__dirname, 'src/lib/graphics') },
      { find: '@mathlib', replacement: path.resolve(__dirname, 'src/lib/math') },
      { find: '@apps', replacement: path.resolve(__dirname, 'src/apps') },
      { find: '@dist', replacement: path.resolve(__dirname, 'dist') }
    ]
  }),
];

/**
 * Helper to generate ESM + IIFE output configs for a single module.
 *
 * @param {string} input        - Entry point path (e.g., './src/lib/serial/index.js')
 * @param {string} baseName     - Output base name (e.g., 'makelab.serial')
 * @param {string} iifeGlobal   - Global variable name for the IIFE build (e.g., 'Makelab.Serial')
 * @param {string} iifeFooter   - Optional JS to run after the IIFE to hoist inner exports to
 *                                 the global scope (e.g., make Serial available as window.Serial)
 * @returns {object[]}          - Array of Rollup config objects
 */
function createModuleConfigs(input, baseName, iifeGlobal, iifeFooter = '') {
  return [
    // ESM builds (existing behavior, unchanged)
    {
      input,
      output: [
        {
          file: `dist/${baseName}.js`,
          format: 'es',
          sourcemap: true,
        },
        {
          file: `dist/${baseName}.min.js`,
          format: 'es',
          sourcemap: false,
          plugins: [terser()],
        },
      ],
      plugins: commonPlugins,
    },
    // IIFE builds (new — for plain <script> tag usage)
    {
      input,
      output: [
        {
          file: `dist/${baseName}.iife.js`,
          format: 'iife',
          name: iifeGlobal,
          sourcemap: true,
          // Extend: if window.Makelab already exists (from another IIFE build
          // loaded earlier), merge into it rather than overwriting
          extend: true,
          footer: iifeFooter,
        },
        {
          file: `dist/${baseName}.iife.min.js`,
          format: 'iife',
          name: iifeGlobal,
          sourcemap: false,
          extend: true,
          footer: iifeFooter,
          plugins: [terser()],
        },
      ],
      plugins: commonPlugins,
    },
  ];
}

/**
 * Bundles the per-file TypeScript declarations that `tsc` emits into `.types/`
 * (see tsconfig.json + the "build" script) down to a single `.d.ts` next to the
 * matching ESM bundle. So `import ... from '.../dist/makelab.math.js'` picks up
 * types from the sibling `dist/makelab.math.d.ts` automatically.
 *
 * @param {string} typesEntry - Emitted declaration entry (e.g. '.types/math/index.d.ts')
 * @param {string} baseName   - Output base name (e.g. 'makelab.math')
 * @returns {object} A Rollup config object.
 */
function createDtsConfig(typesEntry, baseName) {
  return {
    input: typesEntry,
    output: { file: `dist/${baseName}.d.ts`, format: 'es' },
    plugins: [dts()],
  };
}

export default defineConfig([
  // Math module
  ...createModuleConfigs(
    './src/lib/math/index.js',
    'makelab.math',
    'Makelab.Math',
    // Hoist commonly used exports to global scope for convenience
    'if(typeof window!=="undefined"&&window.Makelab&&window.Makelab.Math){' +
    'window.Vector=window.Makelab.Math.Vector;' +
    'window.lerp=window.Makelab.Math.lerp;' +
    '}'
  ),

  // Graphics module
  ...createModuleConfigs(
    './src/lib/graphics/index.js',
    'makelab.graphics',
    'Makelab.Graphics'
  ),

  // Serial module
  ...createModuleConfigs(
    './src/lib/serial/index.js',
    'makelab.serial',
    'Makelab.Serial',
    // Hoist Serial class and events to global scope so students can write:
    //   const serial = new Serial();
    //   serial.on(SerialEvents.DATA_RECEIVED, callback);
    // without any import or namespace prefix
    'if(typeof window!=="undefined"&&window.Makelab&&window.Makelab.Serial){' +
    'window.Serial=window.Makelab.Serial.Serial;' +
    'window.SerialEvents=window.Makelab.Serial.SerialEvents;' +
    'window.SerialState=window.Makelab.Serial.SerialState;' +
    'window.LineBreakTransformer=window.Makelab.Serial.LineBreakTransformer;' +
    '}'
  ),

  // Logo module
  ...createModuleConfigs(
    './src/lib/logo/index.js',
    'makelab.logo',
    'Makelab.Logo'
  ),

  // All-in-one bundle
  ...createModuleConfigs(
    './src/lib/index.js',
    'makelab.all',
    'Makelab',
    // Hoist the most commonly used exports to global scope
    'if(typeof window!=="undefined"&&window.Makelab){' +
    'window.Serial=window.Makelab.Serial;' +
    'window.SerialEvents=window.Makelab.SerialEvents;' +
    'window.SerialState=window.Makelab.SerialState;' +
    'window.Vector=window.Makelab.Vector;' +
    'window.lerp=window.Makelab.lerp;' +
    '}'
  ),

  // TypeScript declarations — one bundled .d.ts per entry point, generated from
  // the library's JSDoc. Reads .types/ produced by `tsc` (run before rollup in
  // the "build" script), so these run last.
  createDtsConfig('.types/math/index.d.ts', 'makelab.math'),
  createDtsConfig('.types/graphics/index.d.ts', 'makelab.graphics'),
  createDtsConfig('.types/serial/index.d.ts', 'makelab.serial'),
  createDtsConfig('.types/logo/index.d.ts', 'makelab.logo'),
  createDtsConfig('.types/index.d.ts', 'makelab.all'),
]);