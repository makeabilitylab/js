/**
 * An interactive holiday greeting card from the Makeability Lab.
 * 
 * The card displays a triangle-art Santa Claus that morphs into the 
 * Makeability Lab logo as the user moves the mouse (or drags on touch)
 * from left to right across the canvas. The animation works by:
 * 
 *   1. Building a {@link TriangleSanta} and a {@link MakeabilityLabLogo},
 *      both composed of right-triangle grids.
 *   2. Creating a direction-matched mapping between Santa triangles and 
 *      logo triangles (shuffled for a pleasing scatter effect).
 *   3. On each mouse/touch move, computing a lerp amount (0 at left edge,
 *      1 at right edge) and interpolating every triangle's position, fill 
 *      color, and stroke color between its Santa origin and logo destination.
 * 
 * A holiday greeting message also fades and slides into position as the
 * user interacts with the canvas.
 * 
 * Keyboard shortcuts (for development/debugging):
 *   'g' - Toggle background triangle grid visibility
 *   'h' - Toggle static Makeability Lab logo overlay
 *   'm' - Toggle M outline on the static logo
 *   'l' - Toggle L outline on the static logo
 *   'k' - Toggle L triangle stroke visibility on the static logo
 * 
 * Future ideas:
 *   - Snow falling (and possibly accumulating on bottom)
 *   - Scenery in background like trees/mountains
 *   - Have triangles also rotate into place during the morph
 * 
 * Converted from p5js to vanilla Canvas + makelab-all.js
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 */

import { 
  MakeabilityLabLogo, Grid, Triangle, ORIGINAL_COLOR_ARRAY, 
} from '../../../lib/logo/makelab-logo.js';
import { TriangleSanta } from './triangle-santa.js';
import { shuffle } from '../../../lib/array-utils.js';
import { map, lerp } from '../../../lib/math/math-utils.js';
import { lerpColor } from '../../../lib/graphics/color-utils.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** @const {number} Size of each square cell in the triangle grid (pixels). */
const TRIANGLE_SIZE = 50;

/** @const {string} CSS font-family for the holiday greeting text. */
const HOLIDAY_FONT_FAMILY = 'MerryChristmasFlake, cursive';

/** @const {number} Font size in pixels for the holiday greeting text. */
const HOLIDAY_TEXT_SIZE = 45;

/** @const {string} The holiday greeting message displayed on the canvas. */
const HOLIDAY_MESSAGE = "Happy holidays from the Makeability Lab!";

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** @type {HTMLCanvasElement} The main drawing canvas. */
let canvas;

/** @type {CanvasRenderingContext2D} The 2D rendering context. */
let ctx;

/** @type {number} Logical width of the canvas in CSS pixels. */
let logicalWidth;

/** @type {number} Logical height of the canvas in CSS pixels. */
let logicalHeight;

/** @type {MakeabilityLabLogo} The static logo used as the animation destination. */
let makeLabLogoStatic = null;

/** @type {Grid} Optional background grid for debugging. */
let makeLabGrid = null;

/** @type {TriangleSanta} The Santa figure whose triangles are animated. */
let triangleSantaAnimated = null;

/** @type {Triangle[]} Cached reference to all visible Santa triangles. */
let originalSantaTriangles = null;

/** @type {number} Current mouse/touch x-coordinate relative to the canvas. */
let mouseX = 0;

// ---------------------------------------------------------------------------
// Initialization & Layout
// ---------------------------------------------------------------------------

/**
 * Initializes the canvas dimensions for High DPI displays and centers the 
 * Santa and Logo objects based on current logical dimensions.
 */
function setupCanvas() {
  // 1. Get the bounding box of the canvas (allows CSS to control size)
  const rect = canvas.getBoundingClientRect();
  logicalWidth = rect.width;
  logicalHeight = rect.height;

  // 2. Get the device pixel ratio for crispness
  const dpr = window.devicePixelRatio || 1;

  // 3. Set the physical buffer size
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  // 4. Ensure CSS matches the logical size
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  // 5. Scale all drawing operations
  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.scale(dpr, dpr);

  // 6. Calculate centered positions
  const santaX = (logicalWidth - (TriangleSanta.numCols * TRIANGLE_SIZE)) / 2;
  const santaY = (logicalHeight - (TriangleSanta.numRows * TRIANGLE_SIZE)) / 2;
  
  const logoX = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);

  // 7. Initialize or update positions
  if (!triangleSantaAnimated) {
    triangleSantaAnimated = new TriangleSanta(santaX, santaY, TRIANGLE_SIZE);
    originalSantaTriangles = triangleSantaAnimated.getAllTriangles();

    makeLabLogoStatic = new MakeabilityLabLogo(logoX, logoY, TRIANGLE_SIZE);
    makeLabLogoStatic.visible = false;
    makeLabLogoStatic.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);

    makeLabGrid = new Grid(logicalWidth, logicalHeight, TRIANGLE_SIZE);
    makeLabGrid.setFillColor(null);
    makeLabGrid.visible = false;

    createTriangleAnimationMapping();
  } else {
    // If the window is resized, we refresh to re-calculate mappings accurately
    location.reload(); 
  }
}

/**
 * Loads the custom holiday font using the CSS Font Loading API.
 * @returns {Promise<void>}
 */
async function loadFonts() {
  const font = new FontFace('MerryChristmasFlake', "url('fonts/MerryChristmasFlake.ttf')");
  try {
    const loadedFont = await font.load();
    document.fonts.add(loadedFont);
  } catch (e) {
    console.warn('Could not load MerryChristmasFlake font, falling back to cursive:', e);
  }
}

/**
 * Main entry point. Loads fonts, initializes the canvas, and starts the loop.
 * @returns {Promise<void>}
 */
async function setup() {
  await loadFonts();

  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');

  setupCanvas();

  // Event listeners
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('resize', setupCanvas);
  document.addEventListener('keydown', onKeyPressed);

  requestAnimationFrame(drawLoop);
}

// ---------------------------------------------------------------------------
// Animation mapping
// ---------------------------------------------------------------------------

/**
 * Groups triangles by direction to ensure consistent morphing orientation.
 * @param {Triangle[]} triangles 
 * @returns {Map<string, Triangle[]>}
 */
function getMapOfTriangleDirectionToTriangles(triangles) {
  const dirMap = new Map();
  for (const tri of triangles) {
    if (!dirMap.has(tri.direction)) {
      dirMap.set(tri.direction, []);
    }
    dirMap.get(tri.direction).push(tri);
  }
  return dirMap;
}

/**
 * Links each Santa triangle to a destination logo triangle.
 */
function createTriangleAnimationMapping() {
  const allSantaTriangles = triangleSantaAnimated.getAllTriangles();
  const allMakeLabTriangles = makeLabLogoStatic.getAllTriangles();
  const visibleMakeLabTriangles = allMakeLabTriangles.filter(tri => tri.visible);

  const mapDirToSantaTris = getMapOfTriangleDirectionToTriangles(allSantaTriangles);
  const mapDirToMakeLabTris = getMapOfTriangleDirectionToTriangles(visibleMakeLabTriangles);

  for (const [triDir, santaTriangles] of mapDirToSantaTris) {
    const makeLabTriangles = mapDirToMakeLabTris.get(triDir);
    if (!makeLabTriangles) continue;

    shuffle(santaTriangles);
    shuffle(makeLabTriangles);

    for (let i = 0; i < santaTriangles.length; i++) {
      const santaTri = santaTriangles[i];
      santaTri.original = Triangle.createTriangle(santaTri);
      santaTri.destination = makeLabTriangles[i % makeLabTriangles.length];
    }
  }
}

// ---------------------------------------------------------------------------
// Input handling
// ---------------------------------------------------------------------------

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  updateAnimation();
}

function onTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseX = e.touches[0].clientX - rect.left;
  updateAnimation();
}

/**
 * Interpolates Santa triangles based on the current mouseX.
 */
function updateAnimation() {
  const lerpAmt = map(mouseX, 0, logicalWidth, 0, 1, true);

  for (const tri of originalSantaTriangles) {
    // Interpolate position
    tri.x = lerp(tri.original.x, tri.destination.x, lerpAmt);
    tri.y = lerp(tri.original.y, tri.destination.y, lerpAmt);

    // Interpolate colors
    tri.fillColor = lerpColor(tri.original.fillColor, tri.destination.fillColor, lerpAmt);
    tri.strokeColor = lerpColor(tri.original.strokeColor, tri.destination.strokeColor, lerpAmt);
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawLoop() {
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  if (makeLabGrid.visible) makeLabGrid.draw(ctx);
  if (triangleSantaAnimated.visible) triangleSantaAnimated.draw(ctx);
  if (makeLabLogoStatic.visible) makeLabLogoStatic.draw(ctx);

  drawHolidayMessage();
  requestAnimationFrame(drawLoop);
}

/**
 * Renders the holiday message with dynamic positioning and color.
 */
function drawHolidayMessage() {
  const lerpAmt = map(mouseX, 0, logicalWidth, 0, 1, true);

  ctx.save();
  ctx.font = `${HOLIDAY_TEXT_SIZE}px ${HOLIDAY_FONT_FAMILY}`;

  const textColor = lerpColor('rgb(128, 128, 128)', 'rgb(0, 0, 0)', lerpAmt);
  const metrics = ctx.measureText(HOLIDAY_MESSAGE);
  const yLoc = lerp(60, 120, lerpAmt);

  ctx.fillStyle = textColor;
  ctx.fillText(HOLIDAY_MESSAGE, (logicalWidth - metrics.width) / 2, yLoc);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Keyboard controls (debugging)
// ---------------------------------------------------------------------------

function onKeyPressed(e) {
  switch (e.key) {
    case 'g':
      makeLabGrid.visible = !makeLabGrid.visible;
      break;
    case 'm':
      makeLabLogoStatic.isMOutlineVisible = !makeLabLogoStatic.isMOutlineVisible;
      break;
    case 'l':
      makeLabLogoStatic.isLOutlineVisible = !makeLabLogoStatic.isLOutlineVisible;
      break;
    case 'k':
      makeLabLogoStatic.areLTriangleStrokesVisible = !makeLabLogoStatic.areLTriangleStrokesVisible;
      break;
    case 'h':
      makeLabLogoStatic.visible = !makeLabLogoStatic.visible;
      break;
  }
}

setup();