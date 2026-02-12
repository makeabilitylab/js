/**
 * Extensible Shape Morpher
 * 1. Listens for dropdown changes in index.html
 * 2. Fetches the selected JSON file
 * 3. Uses TriangleArt to build the grid
 * 4. Morphs it into the Makeability Lab Logo
 */

// In the future, we could consider:
// 4th of July — star shape (5-pointed), red/white/blue
// 🦃 Thanksgiving (Nov) — turkey? Might be tough at this resolution. A fall leaf could work better — maple leaf shape in red/orange/yellow
// ⭐ New Year's — star or firework burst
// 🌸 Spring/Cherry Blossom — simple flower shape, pink (could double for UW cherry blossom season)

import { 
  MakeabilityLabLogo, Grid, Triangle, ORIGINAL_COLOR_ARRAY, 
} from '../../../lib/logo/makelab-logo.js';
import { shuffle } from '../../../lib/array-utils.js';
import { map, lerp } from '../../../lib/math/math-utils.js';
import { lerpColor } from '../../../lib/graphics/color-utils.js';
import { TriangleArt } from '../../../lib/logo/triangle-art.js'; 

// --- Constants ---
const TRIANGLE_SIZE = 50;
const WIDTH_MARGIN_PCT = 0.1; 

// --- State ---
let canvas, ctx;
let logicalWidth, logicalHeight;
let mouseX = 0;

// The Objects
let makeLabLogoStatic = null;
let currentTriangleArt = null; 
let makeLabGrid = null;
let currentLerpAmt = 0;

// The Morph Data
let animatedTriangles = []; 

async function setup() {
  canvas = document.getElementById('myCanvas');
  ctx = canvas.getContext('2d');
  
  // 1. Setup Dropdown Listener
  const selector = document.getElementById('shapeSelect');
  if(selector) {
      selector.addEventListener('change', (e) => loadShape(e.target.value));
      // Initial load of whatever is selected first
      await loadShape(selector.value);
  } else {
      // Fallback if no dropdown exists
      await loadShape('art_data/santa.json');
  }

  // 2. Event listeners
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('resize', () => {
    if(currentTriangleArt) setupCanvas(currentTriangleArt.data);
  });
  document.addEventListener('keydown', onKeyPressed);

  // 3. Start Loop
  requestAnimationFrame(drawLoop);
}

/**
 * Loads a JSON file and initializes the artwork
 */
async function loadShape(filename) {
  try {
    const response = await fetch(filename);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const artData = await response.json();
    
    // Initialize the canvas with this new data
    setupCanvas(artData);
  } catch (e) {
    console.error("Could not load shape:", e);
  }
}

function setupCanvas(artData) {
  if (!artData) return;

  // 1. Get the parent container's size
  const container = canvas.parentElement;
  logicalWidth = container.clientWidth;
  logicalHeight = container.clientHeight;

  // 2. Adjust for High DPI (Retina)
  const dpr = window.devicePixelRatio || 1;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  
  // 3. Keep CSS size locked to logical pixels
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.scale(dpr, dpr);

  // 4. Center the Jack-o-Lantern or Santa based on its grid size
  const artX = (logicalWidth - (artData.numCols * TRIANGLE_SIZE)) / 2;
  const artY = (logicalHeight - (artData.numRows * TRIANGLE_SIZE)) / 2;
  
  currentTriangleArt = new TriangleArt(artX, artY, TRIANGLE_SIZE, artData);
  currentTriangleArt.visible = false;

  // 5. Setup the Logo destination
  const logoX = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const logoY = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);
  
  makeLabLogoStatic = new MakeabilityLabLogo(logoX, logoY, TRIANGLE_SIZE);
  makeLabLogoStatic.visible = false;
  makeLabLogoStatic.isLabelVisible = true;
  
  // Re-map the triangles for the new layout
  createAnimationMapping();
}

/**
 * The Magic: Maps triangles from the Source (JSON Art) to Destination (ML Logo)
 */
function createAnimationMapping() {
  const sourceTris = currentTriangleArt.getAllTriangles();
  const destTris = makeLabLogoStatic.getAllTriangles().filter(t => t.visible);

  // Helper to group triangles by direction (TopLeft vs BottomRight, etc)
  const groupByDirection = (list) => {
    const map = new Map();
    list.forEach(t => {
      if (!map.has(t.direction)) map.set(t.direction, []);
      map.get(t.direction).push(t);
    });
    return map;
  };

  const sourceByDir = groupByDirection(sourceTris);
  const destByDir = groupByDirection(destTris);

  animatedTriangles = [];

  // Match triangles of the same orientation so they morph cleanly
  for (const [dir, sources] of sourceByDir) {
    const dests = destByDir.get(dir);
    if (!dests || dests.length === 0) continue;

    shuffle(sources);
    shuffle(dests);

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      const dest = dests[i % dests.length]; // Recycle dest triangles if source has more

      // Create a "Clone" triangle that will actually move
      const animTri = Triangle.createTriangle(source);
      
      // Save the start and end states directly onto the triangle object
      animTri._originState = {
        x: source.x, y: source.y, 
        fill: source.fillColor, stroke: source.strokeColor
      };
      animTri._destState = {
        x: dest.x, y: dest.y,
        fill: dest.fillColor, stroke: dest.strokeColor
      };
      
      animatedTriangles.push(animTri);
    }
  }
}

function updateAnimation() {
  const smallBuffer = WIDTH_MARGIN_PCT * logicalWidth;
  const effectiveWidth = logicalWidth - 2 * smallBuffer;
  currentLerpAmt = map(mouseX, smallBuffer, effectiveWidth, 0, 1, true);

  for (const tri of animatedTriangles) {
    tri.x = lerp(tri._originState.x, tri._destState.x, currentLerpAmt);
    tri.y = lerp(tri._originState.y, tri._destState.y, currentLerpAmt);
    tri.fillColor = lerpColor(tri._originState.fill, tri._destState.fill, currentLerpAmt);
    tri.strokeColor = lerpColor(tri._originState.stroke, tri._destState.stroke, currentLerpAmt);
  }
}

function drawLoop() {
  // Clear screen first
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  updateAnimation(); // sets currentLerpAmt

  if (makeLabGrid && makeLabGrid.visible) makeLabGrid.draw(ctx);

  for (const tri of animatedTriangles) tri.draw(ctx);

  if (makeLabLogoStatic && makeLabLogoStatic.visible) makeLabLogoStatic.draw(ctx);

  // Labels: art message fades out, logo label fades in
  if (currentTriangleArt?.message) currentTriangleArt.drawMessage(ctx, 1 - currentLerpAmt);
  drawLogoLabel(ctx, currentLerpAmt);

  requestAnimationFrame(drawLoop);
}

const LABEL_APPEAR_THRESHOLD = 0.7;
const LABEL_SLIDE_FRACTION = 0.4;

function drawLogoLabel(ctx, lerpAmt) {
  if (lerpAmt <= LABEL_APPEAR_THRESHOLD) return;
  const progress = (lerpAmt - LABEL_APPEAR_THRESHOLD) / (1 - LABEL_APPEAR_THRESHOLD);
  const eased = progress * progress * (3 - 2 * progress); // smoothstep
  const slideOffset = makeLabLogoStatic.labelFontSize * LABEL_SLIDE_FRACTION * (1 - eased);
  makeLabLogoStatic.drawLabel(ctx, { opacity: eased, yOffset: slideOffset });
}

// --- Inputs ---
function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
}
function onTouchMove(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  mouseX = e.touches[0].clientX - rect.left;
}
function onKeyPressed(e) {
  if (e.key === 'g') makeLabGrid.visible = !makeLabGrid.visible;
  if (e.key === 'h') makeLabLogoStatic.visible = !makeLabLogoStatic.visible;
}

setup();