# `scripts/` — build tooling for the demo gallery

These two scripts exist to keep the project's **home page** (the demo gallery at
the repo root, [`index.html`](../index.html)) and its **thumbnail images**
([`previews/`](../previews)) automatically in sync with the demo apps under
[`src/apps/`](../src/apps).

**You normally never run these by hand.** They run automatically on GitHub's
servers every time something is pushed to `main` (this is "CI" — *continuous
integration*, i.e. automation that runs on a push). The scripts regenerate the
gallery + thumbnails and commit the results back to the repo. They're checked in
here so that automation — and you, if you ever want to preview changes locally —
can find them.

> [!IMPORTANT]
> The root `index.html` and everything in `previews/` are **generated output**.
> Don't hand-edit them — your edits would be overwritten the next time CI runs.
> To change the gallery, edit `build_gallery.py`; to change a thumbnail, edit the
> app (or its `preview.json`) and let `capture_previews.mjs` re-render it.

## The two scripts

### `capture_previews.mjs` — makes the thumbnail images
Opens each demo app in a real (headless) browser and records it:
- canvas/animation apps → a short looping animated **WebP** + a static **poster** PNG
- serial / static apps → just a poster screenshot

Output lands in `previews/<category>/<App>.webp` and `<App>.poster.png`, plus a
`previews/manifest.json` of content hashes. The hashes let it **skip apps that
haven't changed**, so re-runs are cheap — it only re-renders what you actually
edited (including apps that import the shared `src/lib`/`dist`).

```bash
# Re-render thumbnails locally (needs ffmpeg + a browser — see Requirements):
PW_CHANNEL=chrome node scripts/capture_previews.mjs        # use installed Chrome
node scripts/capture_previews.mjs --force                  # rebuild all, ignore hashes
node scripts/capture_previews.mjs --only LeafFall          # just one app
```
Per-app overrides go in a `preview.json` next to the app's `index.html`
(`skip`, `mode: "animated"|"poster"`, `duration`, `fps`, `width`, `quality`, …).

### `build_gallery.py` — builds the gallery page
Scans `src/apps/**/index.html`, groups the apps by their category folder
(`basic/`, `graphics/`, `makelogo/`, …), and writes the root `index.html` — one
card per app, each linking to the live demo and showing its preview. Cards
degrade gracefully: **animated WebP → static poster → a category emoji** if no
preview exists. The poster also serves as the `prefers-reduced-motion` fallback.

```bash
python scripts/build_gallery.py        # regenerate ./index.html
```

The order matters: previews are generated **first**, then the gallery is built
to reference them.

## How this fits into CI

Two GitHub Actions workflows live in [`.github/workflows/`](../.github/workflows):

- **`build-gallery.yml`** — runs on every push to `main`. It runs
  `capture_previews.mjs` then `build_gallery.py`, and if anything changed, commits
  it back as `chore: rebuild gallery + previews`. *(This is why you'll sometimes
  see a bot commit appear right after your own.)*
- **`ci.yml`** — runs the unit tests and rebuilds `dist/` to make sure the
  committed bundles match `src/`. (Unrelated to the gallery, but listed here so
  the full picture of "what runs on push" is in one place.)

## Requirements (only if running locally)

| Tool | Used by | Notes |
|------|---------|-------|
| **Node.js** + `npm install` | both | installs Playwright (the headless-browser driver) |
| **ffmpeg** (with `libwebp_anim`) | `capture_previews.mjs` | encodes the animated WebP loops; must be on your `PATH` |
| a **browser** | `capture_previews.mjs` | `PW_CHANNEL=chrome` drives your installed Chrome (no download); CI uses Playwright's bundled Chromium |
| **Python 3** | `build_gallery.py` | standard library only — no extra packages |

If you don't have ffmpeg/Chrome set up locally, that's fine: just push your app
changes and let CI render the gallery for you.
