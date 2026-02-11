import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from '/dist/makelab.all.js';
import { lerpColor } from '/dist/makelab.all.js';
import { lerp, random } from '/dist/makelab.all.js';

// --- Constants & Globals ---
const TRIANGLE_SIZE = 50;
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// State variables
let logicalWidth, logicalHeight;
let makeLabGrid, makeLabLogo, makeLabLogoAnimated;
let originalRandomTriLocs = [];

// Animation flags
let explodeSize = true;
let explodeAngle = true;
let explodeX = true;
let explodeY = true;

/**
 * Initializes or Updates the canvas dimensions.
 * @param {boolean} [isResize=false] - If true, preserves animation state.
 */
function setupCanvas(isResize = false) {
  // 1. Update Dimensions (Standard High DPI logic)
  const rect = canvas.getBoundingClientRect();
  logicalWidth = rect.width;
  logicalHeight = rect.height;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // 2. Calculate New Center
  const xLogo = MakeabilityLabLogo.getXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const yLogo = MakeabilityLabLogo.getYCenterPosition(TRIANGLE_SIZE, logicalHeight);

  // 3. Re-create Grid (Cheap, ensures coverage)
  makeLabGrid = new Grid(logicalWidth, logicalHeight, TRIANGLE_SIZE);

  // 4. Handle Logo State
  if (!makeLabLogo || !isResize) {
    // FIRST LOAD: Create everything fresh
    makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
    makeLabLogo.visible = false;

    makeLabLogoAnimated = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
    makeLabLogoAnimated.isLOutlineVisible = false;
    makeLabLogoAnimated.isMOutlineVisible = false;

    // Only generate random positions on first load!
    resetRandomTriLocs();
  } else {
    // RESIZE: Just update the position of existing logos
    makeLabLogo.setLogoPosition(xLogo, yLogo);
    makeLabLogoAnimated.setLogoPosition(xLogo, yLogo);
    
    // Note: We deliberately DO NOT call resetRandomTriLocs() here.
    // The exploded triangles will stay where they are, while the 
    // target logo moves to the new center.
  }

  draw(ctx);
}

/**
 * Resets the "exploded" random positions for the animation triangles.
 * Uses the current logicalWidth/Height to ensure triangles stay on screen.
 */
function resetRandomTriLocs() {
  originalRandomTriLocs = [];
  
  const makeLabLogoTriangles = makeLabLogo.getAllTriangles(true);
  const makeLabLogoAnimatedTriangles = makeLabLogoAnimated.getAllTriangles(true);
  
  for (let i = 0; i < makeLabLogoAnimatedTriangles.length; i++) {
    const tri = makeLabLogoAnimatedTriangles[i];
    
    // Determine random properties based on flags
    let randSize = explodeSize ? random(TRIANGLE_SIZE / 2, TRIANGLE_SIZE * 3) : TRIANGLE_SIZE;
    
    const xPos = explodeX ? random(randSize, logicalWidth - randSize) : makeLabLogoTriangles[i].x;
    const yPos = explodeY ? random(randSize, logicalHeight - randSize) : makeLabLogoTriangles[i].y;
    const angle = explodeAngle ? random(0, 360) : 0;

    // Apply to current triangle state
    tri.x = xPos;
    tri.y = yPos;
    tri.angle = angle;
    tri.size = randSize;

    // Store for interpolation
    originalRandomTriLocs.push({
      x: xPos,
      y: yPos,
      angle: angle,
      size: randSize
    });
  }

  console.log(`resetRandomTriLocs: originalRandomTriLocs.length: ${originalRandomTriLocs.length}`);
}

/**
 * Handles mouse movement to drive the animation interpolation.
 * Calculates a 'lerpAmt' (0.0 to 1.0) based on mouse X position.
 * * @param {MouseEvent} event - The DOM mouse event
 */
function mouseMoved(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // Mouse X relative to the canvas
  
  // Normalize mouseX to 0.0 - 1.0 range, clamping at 1.0
  const interactionWidth = rect.width - 50; // Buffer zone
  const lerpAmt = Math.min(Math.max(mouseX / interactionWidth, 0), 1);

  // Toggle Outline visibility based on completion
  makeLabLogoAnimated.isLOutlineVisible = (lerpAmt >= 1);

  const staticTriangles = makeLabLogo.getAllTriangles(true);
  const animatedTriangles = makeLabLogoAnimated.getAllTriangles(true);

  // 1. Interpolate Position and Size
  for (let i = 0; i < originalRandomTriLocs.length; i++) {
    const startState = originalRandomTriLocs[i];
    const endState = staticTriangles[i];

    // Lerp individual properties
    animatedTriangles[i].x = lerp(startState.x, endState.x, lerpAmt);
    animatedTriangles[i].y = lerp(startState.y, endState.y, lerpAmt);
    animatedTriangles[i].angle = lerp(startState.angle, 0, lerpAmt); // 0 is end angle
    animatedTriangles[i].size = lerp(startState.size, endState.size, lerpAmt);
  }

  // 2. Interpolate Color
  const animatedColoredTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
  for (let i = 0; i < animatedColoredTriangles.length; i++) {
    const startColor = { r: 255, g: 255, b: 255, a: 1 }; // Start white
    const endColor = ORIGINAL_COLOR_ARRAY[i];
    const newColor = lerpColor(startColor, endColor, lerpAmt);
    animatedColoredTriangles[i].fillColor = newColor;
  }

  draw(ctx);
}

/**
 * Clears the canvas and draws the current state of the Grid and Logos.
 * * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 */
function draw(ctx) {
  // Clear background
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // Draw components
  if (makeLabGrid) makeLabGrid.draw(ctx);
  if (makeLabLogo) makeLabLogo.draw(ctx);
  if (makeLabLogoAnimated) makeLabLogoAnimated.draw(ctx);
}

/**
 * Prints the keyboard controls to the console for debugging.
 */
function printMenu() {
  console.log("--- Interactive Menu ---");
  console.log("Press 'd' to toggle debug info. Currently: ", makeLabLogoAnimated.drawBoundingBox);
  console.log("Press 'g' to toggle grid. Currently: ", makeLabGrid ? makeLabGrid.visible : false);
  console.log("Press 'm' to toggle M outline. Currently: ", makeLabLogoAnimated.isMOutlineVisible);
  console.log("Press 'l' to toggle L outline. Currently: ", makeLabLogoAnimated.isLOutlineVisible);
  console.log("Press 'k' to toggle L triangle strokes. Currently: ", makeLabLogoAnimated.areLTriangleStrokesVisible);
  console.log("Press 'h' to toggle hidden static logo. Currently: ", makeLabLogo.visible);
  console.log("Press 'r' to reset animation positions.");
  console.log("");
}

// --- Initialization ---

// 1. Initial Setup (isResize = false)
setupCanvas(false);
printMenu();

// 2. Event Listeners
canvas.addEventListener('mousemove', mouseMoved);

// 3. Resize Listener (isResize = true)
window.addEventListener('resize', () => {
  setupCanvas(true);
});

document.addEventListener('keydown', function(event) {
  const key = event.key;

  switch (key) {
    case 'd':
      makeLabLogoAnimated.drawBoundingBox = !makeLabLogoAnimated.drawBoundingBox;
      makeLabLogoAnimated.setDrawDebugInfo(makeLabLogoAnimated.drawBoundingBox);
      console.log("Draw debug info:", makeLabLogoAnimated.drawBoundingBox);
      draw(ctx);
      break;

    case 'g':
      makeLabGrid.visible = !makeLabGrid.visible;
      console.log("Grid visibility:", makeLabGrid.visible);
      draw(ctx);
      break;

    case 'm':
      makeLabLogoAnimated.isMOutlineVisible = !makeLabLogoAnimated.isMOutlineVisible;
      console.log("M outline visible:", makeLabLogoAnimated.isMOutlineVisible);
      draw(ctx);
      break;

    case 'l':
      // Note: This is also toggled automatically in mouseMoved based on lerpAmt
      makeLabLogoAnimated.isLOutlineVisible = !makeLabLogoAnimated.isLOutlineVisible;
      console.log("L outline visible:", makeLabLogoAnimated.isLOutlineVisible);
      draw(ctx);
      break;

    case 'k':
      makeLabLogoAnimated.areLTriangleStrokesVisible = !makeLabLogoAnimated.areLTriangleStrokesVisible;
      console.log("L triangle strokes visible:", makeLabLogoAnimated.areLTriangleStrokesVisible);
      draw(ctx);
      break;

    case 'h':
      makeLabLogo.visible = !makeLabLogo.visible;
      console.log("Static logo visible:", makeLabLogo.visible);
      draw(ctx);
      break;

    case 'r':
      console.log("Resetting random triangle locations...");
      resetRandomTriLocs();
      draw(ctx);
      break;
  }
});