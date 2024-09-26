// https://github.com/rollup/rollup-starter-lib
// import path from 'path';
// import { defineConfig } from 'rollup';

// export default defineConfig({
//   input: './src/lib/makelab-index.js',
//   output: {
//     file: 'dist/makelab.bundle.rollup.js',
//     format: 'es', // Or 'es' for ES modules
//     name: 'makelab', // Optional, if you want to use a global variable
//   },
//   plugins: [
//     // Add plugins as needed, e.g., for transpilation or tree shaking
//   ],
// });

import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// TODO:
// 1. Investigate minification
// 2. Investigate making different bundles for diff things like graphics, math, etc.

export default defineConfig({
  input: './src/lib/makelab-index.js',
  output: {
    file: 'dist/makelab.bundle.rollup.js',
    format: 'es', // Or 'cjs' for CommonJS
    //format: 'iife', // Use 'iife' for browser compatibility
    name: 'makelab', // Optional, if you want to use a global variable
  },
  plugins: [
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
    // Add other plugins as needed
  ],
});
