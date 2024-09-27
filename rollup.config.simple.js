// Run this config file with the following command:
// npx rollup -c rollup.config.simple.js

import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias'; // Import the alias plugin to support aliases
import terser from '@rollup/plugin-terser'; // Import the terser plugin for minification
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  input: './src/lib/index.js',
  output: [
    {
      // Development Build (Full, Unminified)
      file: 'dist/makelab.bundle.js',
      format: 'es', // Or 'cjs' for CommonJS
      name: 'makelab', // Optional, if you want to use a global variable
      sourcemap: true, // Include source maps for debugging
    },
    {
      // Production Build (Minified)
      file: 'dist/makelab.bundle.min.js',
      format: 'es', // Or adjust based on your needs
      name: 'makelab', // Optional, if you want to a global variable
      sourcemap: false, // Exclude source maps in production
      plugins: [terser()], // Minify the output
    },
  ],
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
