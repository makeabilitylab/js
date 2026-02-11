import { MakeabilityLabLogoExploder } from '../../../lib/logo/makelab-logo-exploder.js';
import { MakeabilityLabLogo } from '../../../lib/logo/makelab-logo.js'; 

// --- Constants & Globals ---
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const TRIANGLE_SIZE = 50;

// State variables
let logicalWidth, logicalHeight;
let makeLabLogoExploder;

// --- Initialization ---

// 1. Initial Setup
setupCanvas();
printMenu();

// 2. Event Listeners
canvas.addEventListener('mousemove', mouseMoved);

// Handle window resizing dynamically
window.addEventListener('resize', () => {
  setupCanvas();
});

// --- Core Functions ---

/**
 * Initializes the canvas dimensions for High DPI displays and sets up
 * the Exploder object. This function is idempotent and handles resizing.
 */
function setupCanvas() {
  // 1. Get the bounding box of the canvas (allows CSS to control size)
  const rect = canvas.getBoundingClientRect();
  logicalWidth = rect.width;
  logicalHeight = rect.height;

  // 2. Get the device pixel ratio (e.g., 2 for Retina screens)
  const dpr = window.devicePixelRatio || 1;

  // 3. Set the physical buffer size (multiplied by dpr for crispness)
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  // 4. Ensure CSS matches the logical size
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  // 5. Scale all drawing operations so we can use logical coordinates
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  ctx.scale(dpr, dpr);

  // 6. Calculate centered position
  const xLogo = MakeabilityLabLogo.getGridXCenterPosition(TRIANGLE_SIZE, logicalWidth);
  const yLogo = MakeabilityLabLogo.getGridYCenterPosition(TRIANGLE_SIZE, logicalHeight);

  // 7. Initialize or Update the Exploder
  if (!makeLabLogoExploder) {
    makeLabLogoExploder = new MakeabilityLabLogoExploder(0, 0, TRIANGLE_SIZE);
    makeLabLogoExploder.centerLogo(logicalWidth, logicalHeight);
    window.makeLabLogoExploder = makeLabLogoExploder;
  } else {
    makeLabLogoExploder.centerLogo(logicalWidth, logicalHeight);
  }

  // CRITICAL: We must reset the explosion bounds using logical dimensions.
  // Note: This will re-randomize the particles on every resize.
  makeLabLogoExploder.reset(logicalWidth, logicalHeight);

  draw(ctx);
}

/**
 * Handles mouse movement to drive the animation interpolation.
 * @param {MouseEvent} event - The DOM mouse event
 */
function mouseMoved(event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // Mouse X relative to the canvas
  
  // Interaction buffer (stops 50px short of the edge)
  const interactionWidth = rect.width - 50;
  
  // Normalize to range [0.0, 1.0] and clamp
  const lerpAmt = Math.min(Math.max(mouseX / interactionWidth, 0), 1);

  // Update exploder state
  if (makeLabLogoExploder) {
    makeLabLogoExploder.update(lerpAmt);
  }
  
  draw(ctx);
}

/**
 * Clears the canvas and draws the current state of the Exploder.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D context
 */
function draw(ctx) {
  // Clear canvas using logical dimensions
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);
  
  if (makeLabLogoExploder) {
    makeLabLogoExploder.draw(ctx);
  }
}

/**
 * Prints the keyboard controls to the console for debugging.
 */
function printMenu() {
  if (!makeLabLogoExploder) return;
  
  console.log("--- Interactive Menu ---");
  console.log("Press 'a' to toggle explode angle. Currently: ", makeLabLogoExploder.explodeAngle);
  console.log("Press 'd' to toggle debug info. Currently: ", makeLabLogoExploder.makeLabLogoAnimated.drawBoundingBox);
  console.log("Press 's' to toggle explode size. Currently: ", makeLabLogoExploder.explodeSize);
  console.log("Press 'x' to toggle explode X. Currently: ", makeLabLogoExploder.explodeX);
  console.log("Press 'y' to toggle explode Y. Currently: ", makeLabLogoExploder.explodeY);
  console.log("Press 'h' to toggle Makeability Lab logo. Currently: ", makeLabLogoExploder.makeLabLogo.visible);
  console.log("Press 'r' to reset animation.");
  console.log("");
}

// --- Keyboard Controls ---

document.addEventListener('keydown', function(event) {
  if (!makeLabLogoExploder) return;
  const key = event.key;

  switch (key) {
    case 'd':
      makeLabLogoExploder.makeLabLogoAnimated.drawBoundingBox = !makeLabLogoExploder.makeLabLogoAnimated.drawBoundingBox;
      makeLabLogoExploder.makeLabLogoAnimated.setDrawDebugInfo(makeLabLogoExploder.makeLabLogoAnimated.drawBoundingBox);
      console.log("Draw debug info:", makeLabLogoExploder.makeLabLogoAnimated.drawBoundingBox);
      draw(ctx);
      break;

    case 'a':
      makeLabLogoExploder.explodeAngle = !makeLabLogoExploder.explodeAngle;
      makeLabLogoExploder.reset(logicalWidth, logicalHeight);
      console.log("Explode Angle:", makeLabLogoExploder.explodeAngle);
      draw(ctx);
      break;

    case 'x':
      makeLabLogoExploder.explodeX = !makeLabLogoExploder.explodeX;
      makeLabLogoExploder.reset(logicalWidth, logicalHeight);
      console.log("Explode X:", makeLabLogoExploder.explodeX);
      draw(ctx);
      break;

    case 'y':
      makeLabLogoExploder.explodeY = !makeLabLogoExploder.explodeY;
      makeLabLogoExploder.reset(logicalWidth, logicalHeight);
      console.log("Explode Y:", makeLabLogoExploder.explodeY);
      draw(ctx);
      break;

    case 's':
      makeLabLogoExploder.explodeSize = !makeLabLogoExploder.explodeSize;
      makeLabLogoExploder.reset(logicalWidth, logicalHeight);
      console.log("Explode Size:", makeLabLogoExploder.explodeSize);
      draw(ctx);
      break;

    case 'h':
      makeLabLogoExploder.makeLabLogo.visible = !makeLabLogoExploder.makeLabLogo.visible;
      console.log("Makeability Lab logo visible:", makeLabLogoExploder.makeLabLogo.visible);
      draw(ctx);
      break;

    case 'r':
      console.log("Resetting animation...");
      makeLabLogoExploder.reset(logicalWidth, logicalHeight);
      draw(ctx);
      break;
  }
});