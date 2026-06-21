// Generate looping animated-WebP (and static poster) previews for every demo
// app under src/apps/, for use as thumbnails in the auto-generated gallery
// (see scripts/build_gallery.py). Canvas-based apps are recorded as short
// loops; serial / static apps get a single poster screenshot.
//
// Drives a headless browser via Playwright and encodes frames with ffmpeg
// (both expected on PATH; ffmpeg needs libwebp_anim). Runs locally and in CI:
//   - Local:  PW_CHANNEL=chrome  uses your installed Google Chrome (no download)
//   - CI:     (no channel)       uses Playwright's bundled Chromium
//
// Output: previews/<category>/<App>.webp + <App>.poster.png
//         previews/manifest.json  (content hashes, to skip unchanged apps)
//
// Usage:
//   node scripts/capture_previews.mjs [--force] [--only <substr>]
//
// Per-app overrides live in a preview.json next to the app's index.html:
//   { "skip": false, "mode": "animated" | "poster",
//     "duration": 5, "fps": 20, "delay": 150, "width": 360, "quality": 68 }

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdir, rm, readFile, writeFile, readdir, stat,
} from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS_DIR = path.join(ROOT, 'src', 'apps');
const OUT_DIR = path.join(ROOT, 'previews');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const SHARED_DIRS = ['src/lib', 'dist']; // changes here can alter app visuals
const PORT = 8123;

// Defaults (overridable per app via preview.json). The capture viewport keeps
// the same aspect as the card thumbnail (360 x 224 ≈ 16:10); frames are scaled
// down to `width` at encode time.
const DEFAULTS = {
  mode: 'animated',
  duration: 5, // seconds
  fps: 20,
  delay: 150, // ms warm-up before first frame
  width: 360, // output px width
  quality: 68, // libwebp q:v
};
const VIEWPORT = { width: 900, height: 560 };

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const CHANNEL = process.env.PW_CHANNEL || undefined; // 'chrome' locally, unset in CI

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd, a) => spawnSync(cmd, a, { encoding: 'utf8' });

// ---------- file discovery + hashing ----------

/** Recursively list files under `dir` (absolute paths), skipping nothing. */
async function listFiles(dir) {
  const out = [];
  async function walk(d) {
    let entries;
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(dir);
  return out.sort();
}

/** Stable content hash of a set of files (path-relative-to-ROOT + bytes). */
async function hashFiles(files) {
  const h = createHash('sha256');
  for (const f of files) {
    h.update(path.relative(ROOT, f).replace(/\\/g, '/'));
    h.update('\0');
    h.update(await readFile(f));
    h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

// ---------- app model ----------

/** Find every app: { category, name, dir, url, key, config, mode }. */
async function discoverApps() {
  const apps = [];
  const categories = (await readdir(APPS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory()).map((e) => e.name).sort();
  for (const category of categories) {
    const catDir = path.join(APPS_DIR, category);
    const names = (await readdir(catDir, { withFileTypes: true }))
      .filter((e) => e.isDirectory()).map((e) => e.name).sort();
    for (const name of names) {
      const dir = path.join(catDir, name);
      if (!existsSync(path.join(dir, 'index.html'))) continue;

      let config = {};
      const cfgPath = path.join(dir, 'preview.json');
      if (existsSync(cfgPath)) {
        try { config = JSON.parse(await readFile(cfgPath, 'utf8')); }
        catch (e) { console.warn(`  ! bad preview.json in ${category}/${name}: ${e.message}`); }
      }
      const opts = { ...DEFAULTS, ...config };
      const rel = path.relative(ROOT, dir).replace(/\\/g, '/');
      apps.push({
        category, name, dir, opts,
        key: `${category}/${name}`,
        url: `http://localhost:${PORT}/${rel}/index.html`,
        skip: config.skip === true,
      });
    }
  }
  return apps;
}

/** Does the app import from the shared library/dist (so shared changes matter)? */
async function usesShared(appFiles) {
  for (const f of appFiles) {
    if (!/\.(js|mjs|html)$/.test(f)) continue;
    const text = await readFile(f, 'utf8');
    if (/(?:\.\.\/)+(?:lib|dist)\//.test(text) || /\/(?:lib|dist)\//.test(text)) return true;
  }
  return false;
}

// ---------- capture + encode ----------

async function captureAnimated(page, app, framesDir) {
  const { duration, fps, delay } = app.opts;
  const frameCount = Math.round(fps * duration);
  const intervalMs = 1000 / fps;

  const canvas = page.locator('canvas').first();
  await canvas.waitFor({ state: 'visible', timeout: 10000 });
  await sleep(delay);

  const t0 = Date.now();
  for (let i = 0; i < frameCount; i++) {
    const drift = Date.now() - t0 - i * intervalMs;
    if (drift < 0) await sleep(-drift); // pace toward real-time fps
    await canvas.screenshot({ path: path.join(framesDir, `f_${String(i).padStart(4, '0')}.png`) });
  }
  return frameCount;
}

function encodeWebp(framesDir, fps, width, quality, outFile) {
  const r = sh('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(fps),
    '-i', path.join(framesDir, 'f_%04d.png'),
    '-vf', `scale=${width}:-1:flags=lanczos`,
    '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(quality),
    '-compression_level', '6', '-loop', '0',
    outFile,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg webp failed: ${r.stderr}`);
}

function encodePoster(srcPng, width, outFile) {
  const r = sh('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', srcPng,
    '-vf', `scale=${width}:-1:flags=lanczos`, outFile,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg poster failed: ${r.stderr}`);
}

/** Render one app to previews/. Returns the produced mode. */
async function renderApp(browser, app) {
  const outCatDir = path.join(OUT_DIR, app.category);
  await mkdir(outCatDir, { recursive: true });
  const webpOut = path.join(outCatDir, `${app.name}.webp`);
  const posterOut = path.join(outCatDir, `${app.name}.poster.png`);
  const tmp = path.join(os.tmpdir(), `mklab-preview-${app.category}-${app.name}`);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });

  const page = await browser.newPage({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  try {
    await page.goto(app.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.addStyleTag({ content: '.hint{display:none !important;}' });

    if (app.opts.mode === 'poster') {
      // Static thumbnail: full-page screenshot (captures UI, e.g. serial demos).
      const raw = path.join(tmp, 'page.png');
      await page.screenshot({ path: raw });
      encodePoster(raw, app.opts.width, posterOut);
      await rm(webpOut, { force: true }); // drop any stale animation
      return 'poster';
    }

    // Animated: record the canvas loop, derive the poster from the last frame.
    const n = await captureAnimated(page, app, tmp);
    encodeWebp(tmp, app.opts.fps, app.opts.width, app.opts.quality, webpOut);
    const last = path.join(tmp, `f_${String(n - 1).padStart(4, '0')}.png`);
    encodePoster(last, app.opts.width, posterOut);
    return 'animated';
  } finally {
    await page.close();
    await rm(tmp, { recursive: true, force: true });
  }
}

// ---------- server ----------

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT)], {
    cwd: ROOT, stdio: 'ignore',
  });
}

// ---------- main ----------

async function main() {
  const apps = await discoverApps();
  const sharedFiles = (await Promise.all(
    SHARED_DIRS.map((d) => listFiles(path.join(ROOT, d))),
  )).flat();
  const sharedHash = await hashFiles(sharedFiles);

  let manifest = {};
  if (existsSync(MANIFEST)) {
    try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { /* rebuild */ }
  }

  // Decide what needs work.
  const work = [];
  for (const app of apps) {
    if (ONLY && !app.key.includes(ONLY)) continue;
    if (app.skip) {
      console.log(`skip   ${app.key} (preview.json skip)`);
      delete manifest[app.key];
      continue;
    }
    const appFiles = await listFiles(app.dir);
    const appHash = await hashFiles(appFiles.filter((f) => !f.endsWith('preview.json')));
    const shared = await usesShared(appFiles);
    const prev = manifest[app.key];
    const outWebp = path.join(OUT_DIR, app.category, `${app.name}.webp`);
    const outPoster = path.join(OUT_DIR, app.category, `${app.name}.poster.png`);
    const expected = app.opts.mode === 'poster' ? outPoster : outWebp;

    const fresh = !FORCE && prev
      && prev.appHash === appHash
      && prev.mode === app.opts.mode
      && (!shared || prev.sharedHash === sharedHash)
      && existsSync(expected);

    if (fresh) { console.log(`ok     ${app.key} (unchanged)`); continue; }
    work.push({ app, appHash, shared });
  }

  if (work.length === 0) {
    console.log('\nAll previews up to date.');
    await writeFile(MANIFEST, `${JSON.stringify(sortObj(manifest), null, 2)}\n`);
    return;
  }

  console.log(`\nGenerating ${work.length} preview(s)…`);
  const server = startServer();
  await sleep(1200); // let the static server come up
  const browser = await chromium.launch({ channel: CHANNEL, headless: true });
  try {
    for (const { app, appHash, shared } of work) {
      const label = `${app.key} [${app.opts.mode}]`;
      try {
        const t = Date.now();
        const mode = await renderApp(browser, app);
        manifest[app.key] = {
          mode, appHash, sharedHash: shared ? sharedHash : null,
        };
        console.log(`build  ${label} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.error(`FAIL   ${label}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }

  await writeFile(MANIFEST, `${JSON.stringify(sortObj(manifest), null, 2)}\n`);
  console.log(`\nWrote ${OUT_DIR}/`);
}

function sortObj(o) {
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
}

await main();
