import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import terser from '@rollup/plugin-terser';
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

export default defineConfig([
  // Bundle for makelab.math.js
  {
    input: './src/lib/math/index.js',
    output: [
      {
        file: 'dist/makelab.math.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/makelab.math.min.js',
        format: 'es',
        sourcemap: false,
        plugins: [terser()],
      },
    ],
    plugins: commonPlugins,
  },
  // Bundle for makelab.graphics.js
  {
    input: './src/lib/graphics/index.js',
    output: [
      {
        file: 'dist/makelab.graphics.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/makelab.graphics.min.js',
        format: 'es',
        sourcemap: false,
        plugins: [terser()],
      },
    ],
    plugins: commonPlugins,
  },
  // Bundle for makelab.logo.js
  {
    input: './src/lib/makelab-logo.js',
    output: [
      {
        file: 'dist/makelab.logo.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/makelab.logo.min.js',
        format: 'es',
        sourcemap: false,
        plugins: [terser()],
      },
    ],
    plugins: commonPlugins,
  },
  // Bundle for makelab.all.js
  {
    input: './src/lib/index.js',
    output: [
      {
        file: 'dist/makelab.all.js',
        format: 'es',
        sourcemap: true,
      },
      {
        file: 'dist/makelab.all.min.js',
        format: 'es',
        sourcemap: false,
        plugins: [terser()],
      },
    ],
    plugins: commonPlugins,
  },
]);
