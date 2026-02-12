/**
 * Extensible Shape Morpher
 * 1. Listens for dropdown changes in index.html
 * 2. Fetches the selected JSON file
 * 3. Uses TriangleArt to build the grid
 * 4. Morphs it into the Makeability Lab Logo
 */


import { 
  MakeabilityLabLogo, Grid, Triangle, ORIGINAL_COLOR_ARRAY, 
} from '../../../lib/logo/makelab-logo.js';
import { shuffle } from '../../../lib/array-utils.js';
import { map, lerp } from '../../../lib/math/math-utils.js';
import { lerpColor } from '../../../lib/graphics/color-utils.js';
import { TriangleArt } from './triangle-art.js'; 

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
  
  // Calculate morph progress (0.0 to 1.0) based on Mouse X
  const lerpAmt = map(mouseX, smallBuffer, effectiveWidth, 0, 1, true);

  for (const tri of animatedTriangles) {
    tri.x = lerp(tri._originState.x, tri._destState.x, lerpAmt);
    tri.y = lerp(tri._originState.y, tri._destState.y, lerpAmt);
    tri.fillColor = lerpColor(tri._originState.fill, tri._destState.fill, lerpAmt);
    tri.strokeColor = lerpColor(tri._originState.stroke, tri._destState.stroke, lerpAmt);
  }
}

function drawLoop() {
  // Clear Screen
  ctx.fillStyle = 'rgb(250, 250, 250)';
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  updateAnimation();

  if (makeLabGrid && makeLabGrid.visible) makeLabGrid.draw(ctx);
  
  // Draw the animated morphing triangles
  for (const tri of animatedTriangles) {
    tri.draw(ctx);
  }

  // Draw Logo Overlay (Debugging: press 'h' to toggle)
  if (makeLabLogoStatic && makeLabLogoStatic.visible) makeLabLogoStatic.draw(ctx);

  requestAnimationFrame(drawLoop);
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