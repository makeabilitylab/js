# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`makelab-lib`: a modular, dependency-free (runtime) vanilla-JS library from the UW Makeability Lab, distributed primarily via the **jsDelivr CDN straight from this GitHub repo** (`https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/...`). It targets educational physical-computing contexts (p5.js + Arduino) and the lab's web demos. There is no npm publish step — the `dist/` folder is committed and served as-is.

## Commands

```bash
npm install                      # install dev deps (rollup + plugins)
npx rollup -c rollup.config.js   # build everything in dist/ (ESM + IIFE, normal + min)
python scripts/build_gallery.py  # regenerate root index.html demo gallery
```

There is no test runner, linter, or dev server. "Tests" are the interactive demo apps under `src/apps/` — open their `index.html` in a browser (many need Web Serial, which requires Chrome/Edge over http(s) or localhost, not `file://`).

## Critical workflow constraints

- **`dist/` is committed and is what users actually load via CDN.** After any change to `src/lib/`, you MUST run `npx rollup -c rollup.config.js` and commit the regenerated `dist/` files, or CDN consumers won't see the change. Source edits alone are not enough.
- **Root `index.html` is auto-generated** by `scripts/build_gallery.py` (run in CI on every push to `main` via `.github/workflows/build-gallery.yml`). Do not hand-edit it. To change the gallery, edit the Python generator. The gallery lists every `src/apps/**/index.html`.
- Releases are GitHub Releases/tags (SemVer), not npm. Bump `version` in `package.json`, rebuild `dist/`, commit, then tag. See README "Versioning and Releases".

## Architecture

Two top-level trees under `src/`:

- `src/lib/` — the library itself, split into four independent modules: `math/`, `graphics/`, `serial/`, `logo/`. Each module has an `index.js` barrel that re-exports its public API. `src/lib/index.js` re-exports all four (plus `array-utils.js`) for the "all" bundle.
- `src/apps/` — example/demo sketches, grouped by category folder (`basic/`, `graphics/`, `math/`, `serial/`, `makelogo/`). Each app is a self-contained folder with its own `index.html` + `sketch.js` (+ optional `style.css`). The category folder name becomes the gallery section heading.

### Build matrix (rollup.config.js)

Each of the 5 entry points (4 modules + `all`) produces **4 files**: `.js`, `.min.js`, `.iife.js`, `.iife.min.js` → 20 dist bundles total.

- **ESM** builds (`.js`/`.min.js`): for `import` / `<script type="module">`.
- **IIFE** builds (`.iife.js`/`.iife.min.js`): for plain `<script>` tags in p5.js / classroom use. Exports land on `window.Makelab.<Module>` (`extend: true` merges modules loaded separately). A `footer` string then **hoists** the most-used names to bare globals (`window.Serial`, `window.SerialEvents`, `window.Vector`, `window.lerp`, …) so students can write `new Serial()` with no import. When adding a commonly-used export, update the relevant footer in `createModuleConfigs(...)` calls if it should be globally available.

### Import-path aliases

Rollup `@rollup/plugin-alias` defines: `@lib` → `src/lib`, `@graphicslib` → `src/lib/graphics`, `@mathlib` → `src/lib/math`, `@apps` → `src/apps`, `@dist` → `dist`. These only resolve through the rollup build; raw browser `import` in apps uses relative paths instead. Demo apps inconsistently import either from built `dist/` (e.g. `../../../../dist/makelab.math.js`) or directly from `src/lib/` source — both patterns exist.

### Module notes

- **serial** (`serial/serial.js`): event-driven Web Serial wrapper. `Serial` extends an event emitter pattern (`serial.on(SerialEvents.DATA_RECEIVED, cb)`), with `SerialState` for connection lifecycle and `LineBreakTransformer` for line-delimited streams.
- **logo** (`logo/`): the animated Makeability Lab logo, built from `Triangle`/`Cell`/`Grid` primitives. `makelab-logo-morpher.js` morphs the logo into shapes defined by JSON in `logo/art_data/` (heart, pumpkin, santa, etc.). `triangle-art.js` is the shared morph-target representation.

## Conventions

- Vanilla ES modules only — no framework, no TypeScript, no runtime dependencies.
- JSDoc on public functions/classes (per the lab's documentation conventions).
- HTML uses 2-space indentation.
