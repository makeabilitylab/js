# TriangleArt: Data-Driven Triangle Grid Artwork

## Design Goals

1. **Readable** — A designer should be able to read the JSON and visualize the art
2. **Authorable** — Hand-writing a new pattern should be fast, not tedious
3. **Faithful** — Must reproduce the original Santa's color jitter and organic feel
4. **Compatible** — Drop-in replacement in `sketch.js` (same interface as `TriangleSanta`)
5. **Extensible** — Easy to add snowmen, trees, hearts, pumpkins, etc.

---

## JSON Format Spec

### Top-Level Structure

```jsonc
{
  "name": "Santa",                    // Human-readable label
  "numCols": 10,                      // Grid width in cells
  "numRows": 9,                       // Grid height in cells

  "palette": { ... },                 // Named colors with jitter params
  "directionPattern": "alternating",  // How tri1 direction is chosen per cell
  "grid": [ ... ]                     // The pixel art: array of rows
}
```

### Palette

Each entry defines a base color and optional randomized variation applied
at instantiation time (so each triangle gets a unique shade, preserving
the hand-crafted look).

```jsonc
"palette": {
  "R": {
    "base": "#cc4133",
    "jitter": { "type": "brightness", "range": [75, 100] }
  },
  "K": {
    "base": "#272425",
    "jitter": { "type": "brightness", "range": [8, 22] }
  },
  "W": {
    "base": "#ffffff",
    "jitter": { "type": "brightness", "range": [95, 100], "distribution": "gaussian", "sd": 2 }
  },
  "F": {
    "base": "#fdf2d0",
    "jitter": { "type": "saturation+brightness", "saturation": [20, 30], "brightness": [95, 100],
                "brightnessDistribution": "gaussian", "brightnessSd": 1 }
  },
  "N": {
    "base": "#f9da78",
    "jitter": { "type": "brightness", "range": [97, 100] }
  },
  "M": {
    "base": "#f3af56",
    "jitter": { "type": "brightness", "range": [94, 100] }
  }
}
```

**Key design choice: single-character palette keys.** This is what makes the
grid readable — each cell is 1-3 characters instead of a verbose object.

### Direction Pattern

Most triangle grids use a checkerboard alternation for tri1 direction.
The `directionPattern` field controls this:

```jsonc
"directionPattern": "alternating"
```

Under `"alternating"`, tri1 direction is determined by `(row + col) % 2`:
- Even → `TopLeft`
- Odd → `TopRight`

tri2 is always the opposite of tri1 (handled by `Cell.createCell`).

For rows that need **non-alternating** directions (like Santa's hat rows 0-1,
which use `BottomRight`/`BottomLeft`), the cell definition includes an
explicit `dir` override — see Grid section below.

### Grid — The Core Innovation

Each row is an array of **cell values**. A cell value can be:

| Syntax | Meaning | Example |
|--------|---------|---------|
| `null` | Empty cell (both tris hidden) | `null` |
| `"R"` | Both tris use palette key `"R"` | `"R"` |
| `["W", "R"]` | tri1 = `"W"`, tri2 = `"R"` | `["W", "R"]` |
| `[null, "R"]` | tri1 hidden, tri2 = `"R"` | `[null, "R"]` |
| `["R", null]` | tri1 = `"R"`, tri2 hidden | `["R", null]` |
| `{"t1":"W","t2":"R","dir":"BottomLeft"}` | Explicit direction override | rows 0-1 |
| `{"t1":"W","t1Visible":false,"t2":"W"}` | tri1 colored but hidden (for morph) | edge cells |

**Priority order:** string → array → object (use simplest form that works).

The **overwhelming majority** of cells will be `null` or a single string like
`"R"`, making the grid visually scannable. The array form `["W", "R"]`
handles the ~15% of cells where tri1 and tri2 differ. The object form is
rare — only needed for direction overrides and the hidden-but-colored edge case.

---

## Complete Santa JSON

```json
{
  "name": "Santa",
  "numCols": 10,
  "numRows": 9,

  "palette": {
    "R": {
      "base": "#cc4133",
      "jitter": { "type": "brightness", "range": [75, 100] }
    },
    "K": {
      "base": "#272425",
      "jitter": { "type": "brightness", "range": [8, 22] }
    },
    "W": {
      "base": "#ffffff",
      "jitter": { "type": "brightness", "range": [95, 100],
                  "distribution": "gaussian", "sd": 2 }
    },
    "F": {
      "base": "#fdf2d0",
      "jitter": { "type": "saturation+brightness",
                  "saturation": [20, 30],
                  "brightness": [95, 100],
                  "brightnessDistribution": "gaussian", "brightnessSd": 1 }
    },
    "N": {
      "base": "#f9da78",
      "jitter": { "type": "brightness", "range": [97, 100] }
    },
    "M": {
      "base": "#f3af56",
      "jitter": { "type": "brightness", "range": [94, 100] }
    }
  },

  "directionPattern": "alternating",

  "grid": [
    { "_comment": "Row 0: Hat tip — ....HH....",
      "cells": [
        null, null, null, null,
        { "t1": null, "t2": "R", "dir": "BottomRight" },
        { "t1": null, "t2": "R", "dir": "BottomLeft" },
        null, null, null, null
      ]
    },

    { "_comment": "Row 1: Hat wider — ...HHHH...",
      "cells": [
        null, null, null,
        { "t1": null, "t2": "R", "dir": "BottomRight" },
        { "t1": "R",  "t2": "R", "dir": "BottomLeft" },
        { "t1": "R",  "t2": "R", "dir": "BottomRight" },
        { "t1": null, "t2": "R", "dir": "BottomLeft" },
        null, null, null
      ]
    },

    { "_comment": "Row 2: White trim — ..WWWWWW..",
      "cells": [
        null, null,
        [null, "W"],
        "W", "W", "W", "W",
        [null, "W"],
        null, null
      ]
    },

    { "_comment": "Row 3: Face + nose — .WFFFFFFW.",
      "cells": [
        null,
        [null, "W"],
        "F", "F",
        ["N", "F"],
        ["N", "F"],
        "F", "F",
        [null, "W"],
        null
      ]
    },

    { "_comment": "Row 4: Face/beard/suit transition — SWFFFFFFWS",
      "cells": [
        { "t1": null, "t1Visible": false, "t2": "R" },
        ["W", "R"],
        "W", "W", "W", "W", "W", "W",
        ["W", "R"],
        { "t1": null, "t1Visible": false, "t2": "R" }
      ]
    },

    { "_comment": "Row 5: Beard/mouth/suit — SSWFMMFWSS",
      "cells": [
        "R", "R",
        ["W", "R"],
        "W",
        ["M", "W"],
        ["M", "W"],
        "W",
        ["W", "R"],
        "R", "R"
      ]
    },

    { "_comment": "Row 6: Belt top — BBBWWWWBBB",
      "cells": [
        "K", "K", "K",
        ["W", "K"],
        "W", "W",
        ["W", "K"],
        "K", "K", "K"
      ]
    },

    { "_comment": "Row 7: Belt bottom — BBBBWWBBBB",
      "cells": [
        ["K", null],
        "K", "K", "K",
        ["W", "K"],
        ["W", "K"],
        "K", "K", "K",
        ["K", null]
      ]
    },

    { "_comment": "Row 8: Suit bottom — .SSSSSSSS.",
      "cells": [
        null,
        ["R", null],
        "R", "R", "R", "R", "R", "R",
        ["R", null],
        null
      ]
    }
  ]
}
```

### Readability Check

Look at Row 5 (beard/mouth/suit): `"R", "R", ["W","R"], "W", ["M","W"], ["M","W"], "W", ["W","R"], "R", "R"`

Reading left to right: red, red, white-over-red, white, mouth-over-white,
mouth-over-white, white, white-over-red, red, red. That maps directly to
the `SSWFMMFWSS` layout comment. You can *see* the Santa in the data.

Compare to Gemini's version of the same row — 10 objects, each with 3-5 keys,
spanning ~20 lines. Not scannable.

---

## Implementation Notes

### Hidden-but-Colored Cells

The original `TriangleSanta` colors some hidden triangles (e.g., row 2 cols 0-1
set white color on hidden tris, row 4 col 0 sets suit color on hidden tri1).
This matters for the morph animation — the triangle needs a source color even
if it starts invisible.

In the JSON:
- `null` in a cell position → truly empty (hidden, default white)
- `[null, "W"]` → tri1 hidden (no color set), tri2 white
- `{ "t1": "W", "t1Visible": false, "t2": "W" }` → tri1 colored white but hidden

**For the morph use case**, I'd argue we should simplify: the loader should
color all triangles (even hidden ones) using the row's most common palette key.
This gives the morph a reasonable source color without requiring verbose object
notation for edge cells. The object form remains available for precise control.

### What About `changeColorSaturationAndBrightness`?

The face color uses both saturation AND brightness jitter via
`changeColorSaturationAndBrightness()`. The jitter spec handles this with
`"type": "saturation+brightness"`. The loader needs to import both
`changeColorBrightness` and `changeColorSaturationAndBrightness` from the
color utils.

### What About `randomGaussian`?

The white and face colors use Gaussian-distributed brightness. The jitter spec
supports `"distribution": "gaussian"` with `"sd"` parameter. The loader calls
`randomGaussian(mean, sd)` where mean is derived from the range midpoint, or
we can add explicit `"mean"` and `"sd"` fields. Looking at the original code:
- White: `randomGaussian(99, 2)` — mean 99, sd 2
- Face brightness: `randomGaussian(99, 1)` — mean 99, sd 1

So for gaussian, the range field becomes `[mean, sd]` semantically.
Actually, let me revise: let's use explicit `"mean"` and `"sd"` fields when
`"distribution": "gaussian"` to avoid ambiguity:

```jsonc
"W": {
  "base": "#ffffff",
  "jitter": { "type": "brightness", "distribution": "gaussian", "mean": 99, "sd": 2 }
}
```

And `"range": [min, max]` is for uniform distribution (the default).