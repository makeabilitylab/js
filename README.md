# Makeability Lab Library

A modular JavaScript library for mathematical computations, graphics utilities, and interactive visualizations developed by the Makeability Lab at the University of Washington.

## Features

The library is organized into three main modules:

- **Math** - Vector operations and mathematical utilities (conversions, interpolation, random numbers)
- **Graphics** - Color manipulation and geometric primitives (line segments, color utilities)
- **Serial** - Web Serial API wrapper for communication with microcontrollers (Arduino, ESP32)
- **Logo** - Interactive Makeability Lab logo components with animation support

Each module can be imported independently or as a complete bundle, allowing for optimized loading based on your needs.

## Quick Start (CDN)

The easiest way to use this library is via CDN. No installation required - just import directly in your HTML or JavaScript:

```html
<!-- In your HTML file -->
<script type="module">
  // Import specific modules
  import { Vector, lerp } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.js';
  import { lerpColor } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.js';
  import { Serial, SerialEvents } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.js';
  import { MakeabilityLabLogo } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.js';

  // Or import everything
  import * as Makelab from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.js';

  // Use the library
  const v = new Vector(10, 20);
  console.log(v.magnitude());
</script>
```

### Quick Start with Plain `<script>` Tags (No Modules)

If you're using **p5.js**, teaching a class, or just want the simplest possible setup, use the **IIFE builds**. These work with plain `<script>` tags and make the library available as global variables — no `import` statements or `type="module"` needed:

```html
<!-- Include just the serial module -->
<script src="https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.min.js"></script>

<script>
  // Serial, SerialEvents, and SerialState are now global variables!
  const serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, () => console.log("Connected!"));
  serial.on(SerialEvents.DATA_RECEIVED, (sender, data) => console.log(data));

  async function connect() {
    await serial.connectAndOpen(null, { baudRate: 115200 });
  }
</script>
```

This is the recommended approach for **p5.js + Arduino** projects. See the [Physical Computing textbook](https://makeabilitylab.github.io/physcomp/communication/web-serial.html) for full tutorials.

#### IIFE CDN URLs

```
// Individual modules (IIFE — plain <script> tag)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.iife.min.js

// All-in-one bundle (IIFE)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.iife.min.js
```

### CDN Usage Options

#### Using jsdelivr CDN

The library is available via the jsdelivr CDN, which automatically serves files from this GitHub repository:

```javascript
// Base URL pattern
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/{filename}

// ES module versions (for use with <script type="module"> and import)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.js

// ES module minified versions (recommended for production)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.min.js

// IIFE versions (for use with plain <script> tags — no import needed)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.iife.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.iife.min.js
```

#### Version Pinning

For production use, it's recommended to pin to a specific commit or tag instead of `@main`:

```javascript
// Pin to a specific version tag (no "v" prefix)
import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@0.3.0/dist/makelab.math.min.js';

// Pin to a specific commit
import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@5baeb55/dist/makelab.math.min.js';
```

#### Complete CDN Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Makelab Library CDN Example</title>
</head>
<body>
  <canvas id="canvas" width="800" height="600"></canvas>

  <script type="module">
    // Import from CDN
    import { Vector, lerp } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.min.js';
    import { LineSegment, lerpColor } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.min.js';

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Create and draw a line
    const line = new LineSegment(100, 100, 700, 500);
    line.draw(ctx);

    // Create vectors
    const v1 = new Vector(10, 20);
    const v2 = new Vector(30, 40);
    console.log('Vector sum:', v1.add(v2));
  </script>
</body>
</html>
```

## Local Installation

For local development or when you need to modify the library:

### Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Rollup (module bundler)
- Rollup plugins (node-resolve, alias, terser)

## Development Setup

### Project Structure

```
js/
├── src/
│   ├── lib/
│   │   ├── math/           # Math utilities and Vector class
│   │   ├── graphics/       # Graphics utilities (colors, line segments)
│   │   ├── serial/         # Web Serial API wrapper
│   │   └── logo/           # Makeability Lab logo components
│   └── apps/               # Example applications
├── dist/                   # Built output files
├── rollup.config.js        # Rollup bundler configuration
└── package.json
```

### Available Modules

#### Math Module
- `Vector` - 2D vector operations (add, subtract, multiply, normalize, etc.)
- `convertToRadians()` - Convert degrees to radians
- `convertToDegrees()` - Convert radians to degrees
- `lerp()` - Linear interpolation between values
- `random()` - Random number generation utilities

#### Graphics Module
- `LineSegment` - Line segment operations and intersections
- `lerpColor()` - Interpolate between colors
- `convertColorStringToObject()` - Parse color strings to RGB objects
- `hsvToRgb()` - Convert HSV to RGB
- `rgbToHsv()` - Convert RGB to HSV
- `rgbToHex()` - Convert RGB to hex string
- `hexStringToRgb()` - Convert hex string to RGB
- `changeColorBrightness()` - Adjust color brightness
- `changeColorSaturationAndBrightness()` - Adjust color saturation and brightness

#### Serial Module
- `Serial` - Event-driven Web Serial API wrapper for text-based communication
- `SerialEvents` - Event type constants (`CONNECTION_OPENED`, `CONNECTION_CLOSED`, `DATA_RECEIVED`, `ERROR_OCCURRED`)
- `SerialState` - Connection state constants (`CLOSED`, `OPENING`, `OPEN`, `CLOSING`)
- `LineBreakTransformer` - Stream transformer for line-delimited serial data

#### Logo Module
- `MakeabilityLabLogo` - Main logo component
- `MakeabilityLabLogoExploder` - Animated logo explosion effect
- `Triangle`, `Cell`, `Grid` - Logo building blocks
- Color palette utilities

## Building the Distribution

The project uses Rollup to create optimized bundles. The build process generates both standard and minified versions of each module.

### Build All Modules

```bash
npm run build
```

This runs TypeScript first (to generate `.d.ts` type declarations from the
JSDoc) and then Rollup, generating the following files in the `dist/` directory:

| Module | ESM | ESM (min) | IIFE | IIFE (min) |
|--------|-----|-----------|------|------------|
| Math | `makelab.math.js` | `makelab.math.min.js` | `makelab.math.iife.js` | `makelab.math.iife.min.js` |
| Graphics | `makelab.graphics.js` | `makelab.graphics.min.js` | `makelab.graphics.iife.js` | `makelab.graphics.iife.min.js` |
| Serial | `makelab.serial.js` | `makelab.serial.min.js` | `makelab.serial.iife.js` | `makelab.serial.iife.min.js` |
| Logo | `makelab.logo.js` | `makelab.logo.min.js` | `makelab.logo.iife.js` | `makelab.logo.iife.min.js` |
| All (Complete) | `makelab.all.js` | `makelab.all.min.js` | `makelab.all.iife.js` | `makelab.all.iife.min.js` |

### Build Details

- **ESM format**: ES6 modules for use with `import` statements and `<script type="module">`
- **IIFE format**: Immediately Invoked Function Expression for use with plain `<script>` tags. Exports are placed on `window.Makelab.*` and commonly used classes (like `Serial`, `SerialEvents`, `Vector`) are also hoisted to the global scope for convenience.
- **TypeScript declarations**: one bundled `makelab.<entry>.d.ts` per entry point (e.g. `makelab.math.d.ts`, `makelab.all.d.ts`), generated from the library's JSDoc. A TypeScript project or editor that imports a bundle picks up types from the sibling `.d.ts` automatically; `package.json`'s `types` field points at `dist/makelab.all.d.ts`. (Types target the ESM bundles.)
- **Source Maps**: Generated for non-minified versions
- **Minification**: Terser plugin for optimized builds
- **Path Aliases**: Configured for clean imports (@lib, @mathlib, @graphicslib, @apps, @dist)

### Which build format should I use?

- **Use ESM** (`.js` / `.min.js`) if you're building a modern web app with `import`/`export` syntax and `<script type="module">`.
- **Use IIFE** (`.iife.js` / `.iife.min.js`) if you're using **p5.js**, working in an educational context, or just want the simplest possible setup with plain `<script>` tags. This is the recommended approach for our [Physical Computing course](https://makeabilitylab.github.io/physcomp/).

### Production Build

For production use, reference the minified versions:

```html
<script type="module">
  import { Vector, lerp } from './dist/makelab.math.min.js';
  import { lerpColor, LineSegment } from './dist/makelab.graphics.min.js';
  // Or import everything
  import * from './dist/makelab.all.min.js';
</script>
```

## Testing

The library has a small, zero-dependency test suite in `test/` (covering the
`Vector` and `LineSegment` classes and the math, color, and array utilities).
The same tests run in two ways:

```bash
# From the command line (Node):
npm test
```

```
# In the browser: open test/index.html
# (results show on the page and in the dev console)
```

Tests are plain ES modules using a tiny ~100-line harness (`test/test-runner.js`)
with `test()`, `assert()`, and `assertEquals()`. To add tests, create a
`*.test.js` file in `test/`, import what you need from `../src/lib/...`, and add
an `import` for it in `test/all.test.js`.

## Versioning and Releases

This library follows [Semantic Versioning](https://semver.org/) (SemVer): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes that are not backwards compatible
- **MINOR**: New features that are backwards compatible
- **PATCH**: Bug fixes and minor improvements

### Creating a New Release

Releases are git tags (served by jsdelivr). Tags use a bare version number with
**no `v` prefix** (e.g. `0.3.1`), matching the existing tags. From a clean `main`
with your changes committed:

#### 1. Update the Version Number

Edit `package.json` and bump `version` (e.g. `0.3.0` → `0.3.1`). Pick the bump
per SemVer: PATCH for fixes, MINOR for new features (or a breaking change while
still in `0.x`), MAJOR once you're past `1.0`.

#### 2. Build and Test

```bash
npm run build   # regenerate all dist/ files from your latest source
npm test        # confirm the test suite passes
```

#### 3. Commit and Push

```bash
git add package.json dist/
git commit -m "Release 0.3.1"
git push
```

#### 4. Tag and Publish the GitHub Release

Use the [GitHub CLI](https://cli.github.com/) to create the tag and release in
one step:

```bash
gh release create 0.3.1 --title "0.3.1" --target main \
  --notes "What's new, changed, or fixed in this release."
```

(You can also do this from the GitHub web UI under **Releases → Draft a new
release**, but make sure the **tag** has no `v` prefix.)

#### 5. Verify CDN Access

The jsdelivr CDN usually serves the new tag within a minute:

```javascript
import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@0.3.1/dist/makelab.math.min.js';
```

You can check propagation status at:
```
https://www.jsdelivr.com/package/gh/makeabilitylab/js
```

### Version Pinning Best Practices

For users of the library:

- **Development/Testing**: Use `@main` for the latest code
  ```javascript
  import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.js';
  ```

- **Production**: Always pin to a specific version tag (no `v` prefix)
  ```javascript
  import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@0.3.0/dist/makelab.math.min.js';
  ```

- **Specific Commit**: Pin to a commit hash for absolute stability
  ```javascript
  import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@5baeb55/dist/makelab.math.min.js';
  ```

### Release Checklist

Before creating a release, ensure:

- [ ] `npm test` passes
- [ ] Version number updated in `package.json`
- [ ] `npm run build` has been run and `dist/` committed
- [ ] All changes committed and pushed to `main`
- [ ] GitHub release created with a no-`v`-prefix tag (`gh release create …`)
- [ ] CDN link for the new tag tested and working

## Usage

### Importing Individual Modules (Local Files)

```javascript
// Import only what you need
import { Vector, lerp } from './dist/makelab.math.js';
import { lerpColor } from './dist/makelab.graphics.js';

// Create a vector
const v1 = new Vector(10, 20);
const v2 = new Vector(30, 40);
const sum = v1.add(v2);

// Interpolate between values
const midpoint = lerp(0, 100, 0.5); // Returns 50

// Interpolate between colors
const blendedColor = lerpColor('#FF0000', '#0000FF', 0.5);
```

### Importing the Complete Library

```javascript
import * as Makelab from './dist/makelab.all.js';

const vec = new Makelab.Vector(5, 10);
const line = new Makelab.LineSegment(0, 0, 100, 100);
```

### Development Imports (Source Files)

During development, you can import directly from source files:

```javascript
import { Vector } from './src/lib/math/vector.js';
import { LineSegment } from './src/lib/graphics/line-segment.js';
```

## Development Workflow

1. **Make Changes** - Edit files in the `src/` directory
2. **Test Changes** - Create test applications in `src/apps/`
3. **Build** - Run `npx rollup -c rollup.config.js` to generate distribution files
4. **Verify** - Test the built files in `dist/`
5. **Commit** - Commit both source and built files (the CDN serves from the repo)

### Watch Mode (Optional)

For automatic rebuilds during development, you can run Rollup in watch mode:

```bash
npx rollup -c rollup.config.js --watch
```

This will automatically rebuild the distribution files whenever source files change.

### Important Note for Contributors

Since the library is served via CDN directly from this GitHub repository, it's important to:

1. Always run the build process before committing
2. Commit both source files and the generated `dist/` files
3. The `dist/` directory should NOT be in `.gitignore`
4. Test the CDN links after pushing to ensure they work correctly

## API Documentation

### Math Module

#### Vector Class
```javascript
const v = new Vector(x, y)
v.add(other)           // Vector addition
v.sub(other)           // Vector subtraction
v.mult(scalar)         // Scalar multiplication
v.magnitude()          // Get magnitude
v.normalize()          // Normalize to unit vector
v.heading()            // Get angle in radians
```

#### Math Utilities
```javascript
convertToRadians(degrees)    // Degrees to radians
convertToDegrees(radians)    // Radians to degrees
lerp(start, stop, amount)    // Linear interpolation
random(min, max)             // Random number generation
```

### Graphics Module

#### LineSegment Class
```javascript
const line = new LineSegment(x1, y1, x2, y2)
line.draw(context)              // Draw to canvas context
line.intersects(otherLine)      // Check intersection
line.getIntersection(otherLine) // Get intersection point
```

#### Color Utilities
```javascript
lerpColor(color1, color2, amount)        // Blend two colors
convertColorStringToObject(colorString)  // Parse color to RGB
hsvToRgb(h, s, v)                        // HSV (0–1) to RGB object
rgbToHsv(r, g, b)                        // RGB (0–255) to HSV object
rgbToHex(r, g, b)                        // RGB to hex string
hexStringToRgb(hex)                      // Hex string to RGB object
changeColorBrightness(color, percent)    // Adjust brightness
```

### Serial Module

```javascript
const serial = new Serial()

// Events
serial.on(SerialEvents.DATA_RECEIVED, (sender, line) => { ... })
serial.on(SerialEvents.CONNECTION_OPENED, (sender) => { ... })
serial.on(SerialEvents.CONNECTION_CLOSED, (sender) => { ... })
serial.on(SerialEvents.ERROR_OCCURRED, (sender, error) => { ... })
serial.off(event, callback)    // Remove a listener

// Connection
serial.connectAndOpen(filters, options)  // Prompt user + open (requires user gesture)
serial.autoConnectAndOpenPreviouslyApprovedPort(options)  // Reconnect without gesture
serial.close()                 // Close and release resources

// I/O
serial.writeLine(text)         // Send text + newline
serial.write(text)             // Send text

// State
serial.isOpen()                // Boolean
serial.state                   // "closed" | "opening" | "open" | "closing"
Serial.isWebSerialSupported()  // Static browser check
```

### Logo Module

Specialized components for rendering and animating the Makeability Lab logo. See source files for detailed API documentation.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. **Run the build process** (`npx rollup -c rollup.config.js`)
6. Commit both source and dist files
7. Submit a pull request

## License

MIT License - Copyright (c) 2024 UW Makeability Lab

See [LICENSE](LICENSE) file for full details.

## Author

Jon E. Froehlich

## Support

For questions, issues, or contributions, please visit the project repository.

---

Built with Rollup | Powered by JavaScript ES6+ Modules