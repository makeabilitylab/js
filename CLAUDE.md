# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`makelab-lib`: a modular, dependency-free (runtime) vanilla-JS library from the UW Makeability Lab, distributed primarily via the **jsDelivr CDN straight from this GitHub repo** (`https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/...`). It targets educational physical-computing contexts (p5.js + Arduino) and the lab's web demos. There is no npm publish step — the `dist/` folder is committed and served as-is.

## Commands

```bash
npm install                      # install dev deps (rollup + plugins + typescript + playwright)
npm run build                    # build everything in dist/: tsc emits .d.ts, then rollup builds ESM + IIFE (normal + min)
node scripts/capture_previews.mjs  # regenerate gallery thumbnails in previews/ (needs ffmpeg)
python scripts/build_gallery.py  # regenerate root index.html demo gallery
```

`capture_previews.mjs` needs `ffmpeg` (with `libwebp_anim`) on PATH and a browser. Locally, set `PW_CHANNEL=chrome` to drive installed Google Chrome (no download); CI uses Playwright's bundled Chromium. Useful flags: `--force` (rebuild all) and `--only <substr>` (one app).

There is no test runner, linter, or dev server. "Tests" are the interactive demo apps under `src/apps/` — open their `index.html` in a browser (many need Web Serial, which requires Chrome/Edge over http(s) or localhost, not `file://`).

## Critical workflow constraints

- **`dist/` is committed and is what users actually load via CDN.** After any change to `src/lib/`, you MUST run `npm run build` (which runs `tsc` then `rollup -c rollup.config.js`) and commit the regenerated `dist/` files — the JS bundles *and* the `.d.ts` declarations — or CDN consumers won't see the change. Source edits alone are not enough.
- **Root `index.html` is auto-generated** by `scripts/build_gallery.py` (run in CI on every push to `main` via `.github/workflows/build-gallery.yml`). Do not hand-edit it. To change the gallery, edit the Python generator. The gallery lists every `src/apps/**/index.html`.
- **`previews/` (gallery thumbnails) is auto-generated and committed**, also by the `build-gallery.yml` job (runs `scripts/capture_previews.mjs` before the gallery step). Each app gets an animated WebP loop + poster PNG (serial/static apps get a poster only). The script content-hashes each app — and the shared `src/lib`/`dist` for apps that import them — and skips unchanged apps, so CI only re-renders what changed. Per-app overrides live in a `preview.json` next to the app's `index.html` (`skip`, `mode: "animated"|"poster"`, `duration`, `fps`, `width`, `quality`). Cards degrade animated WebP → poster → category emoji, and the poster is the `prefers-reduced-motion` fallback.
- Releases are GitHub Releases/tags (SemVer), not npm. Bump `version` in `package.json`, rebuild `dist/`, commit, then tag. See README "Versioning and Releases".

## Architecture

Two top-level trees under `src/`:

- `src/lib/` — the library itself, split into four independent modules: `math/`, `graphics/`, `serial/`, `logo/`. Each module has an `index.js` barrel that re-exports its public API. `src/lib/index.js` re-exports all four (plus `array-utils.js`) for the "all" bundle.
- `src/apps/` — example/demo sketches, grouped by category folder (`basic/`, `graphics/`, `math/`, `serial/`, `makelogo/`). Each app is a self-contained folder with its own `index.html` + `sketch.js` (+ optional `style.css`). The category folder name becomes the gallery section heading.

### Build matrix (rollup.config.js)

Each of the 5 entry points (4 modules + `all`) produces **4 bundles**: `.js`, `.min.js`, `.iife.js`, `.iife.min.js` → 20 bundles, plus **1 `.d.ts` per entry** → 25 dist files total.

- **ESM** builds (`.js`/`.min.js`): for `import` / `<script type="module">`.
- **IIFE** builds (`.iife.js`/`.iife.min.js`): for plain `<script>` tags in p5.js / classroom use. Exports land on `window.Makelab.<Module>` (`extend: true` merges modules loaded separately). A `footer` string then **hoists** the most-used names to bare globals (`window.Serial`, `window.SerialEvents`, `window.Vector`, `window.lerp`, …) so students can write `new Serial()` with no import. When adding a commonly-used export, update the relevant footer in `createModuleConfigs(...)` calls if it should be globally available.
- **TypeScript declarations** (`makelab.<entry>.d.ts`): generated from the JSDoc, one bundled `.d.ts` per entry next to its ESM bundle. `npm run build` runs `tsc -p tsconfig.json` first (emitting per-file `.d.ts` into the git-ignored `.types/`), then `createDtsConfig(...)` calls in rollup bundle each into `dist/`. `tsconfig.json` exists **only** for this declaration emit — it does not type-check the JS (`checkJs` is off, since the loose JSDoc would be noisy). To regenerate types, just run `npm run build`.

### Import-path aliases

Rollup `@rollup/plugin-alias` defines: `@lib` → `src/lib`, `@graphicslib` → `src/lib/graphics`, `@mathlib` → `src/lib/math`, `@apps` → `src/apps`, `@dist` → `dist`. These only resolve through the rollup build; raw browser `import` in apps uses relative paths instead. Demo apps inconsistently import either from built `dist/` (e.g. `../../../../dist/makelab.math.js`) or directly from `src/lib/` source — both patterns exist.

### Module notes

- **serial** (`serial/serial.js`): event-driven Web Serial wrapper. `Serial` extends an event emitter pattern (`serial.on(SerialEvents.DATA_RECEIVED, cb)`), with `SerialState` for connection lifecycle and `LineBreakTransformer` for line-delimited streams.
- **logo** (`logo/`): the animated Makeability Lab logo, built from `Triangle`/`Cell`/`Grid` primitives. `makelab-logo-morpher.js` morphs the logo into shapes defined by JSON in `logo/art_data/` (heart, pumpkin, santa, etc.). `triangle-art.js` is the shared morph-target representation.

## Conventions

- Vanilla ES modules only — no framework, no TypeScript, no runtime dependencies.
- JSDoc on public functions/classes (per the lab's documentation conventions).
- HTML uses 2-space indentation.
