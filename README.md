# Makeability Lab Library

A modular JavaScript library for mathematical computations, graphics utilities, and interactive visualizations developed by the Makeability Lab at the University of Washington.

## Features

The library is organized into three main modules:

- **Math** - Vector operations and mathematical utilities (conversions, interpolation, random numbers)
- **Graphics** - Color manipulation and geometric primitives (line segments, color utilities)
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
  import { MakeabilityLabLogo } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.js';

  // Or import everything
  import * as Makelab from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.js';

  // Use the library
  const v = new Vector(10, 20);
  console.log(v.magnitude());
</script>
```

### CDN Usage Options

#### Using jsdelivr CDN

The library is available via the jsdelivr CDN, which automatically serves files from this GitHub repository:

```javascript
// Base URL pattern
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/{filename}

// Specific modules
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.js

// Minified versions (recommended for production)
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.math.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.graphics.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.logo.min.js
https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.all.min.js
```

#### Version Pinning

For production use, it's recommended to pin to a specific commit or tag instead of `@main`:

```javascript
// Pin to a specific version tag
import { Vector } from 'https://cdn.jsdelivr.net/gh/makeabilitylab/js@v1.0.0/dist/makelab.math.min.js';

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

#### Logo Module
- `MakeabilityLabLogo` - Main logo component
- `MakeabilityLabLogoExploder` - Animated logo explosion effect
- `Triangle`, `Cell`, `Grid` - Logo building blocks
- Color palette utilities

## Building the Distribution

The project uses Rollup to create optimized bundles. The build process generates both standard and minified versions of each module.

### Build All Modules

```bash
npx rollup -c rollup.config.js
```

This command generates the following files in the `dist/` directory:

| Module | Standard | Minified |
|--------|----------|----------|
| Math | `makelab.math.js` | `makelab.math.min.js` |
| Graphics | `makelab.graphics.js` | `makelab.graphics.min.js` |
| Logo | `makelab.logo.js` | `makelab.logo.min.js` |
| All (Complete) | `makelab.all.js` | `makelab.all.min.js` |

### Build Details

- **Format**: ES6 modules (ESM)
- **Source Maps**: Generated for non-minified versions
- **Minification**: Terser plugin for optimized builds
- **Path Aliases**: Configured for clean imports (@lib, @mathlib, @graphicslib, @apps, @dist)

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
