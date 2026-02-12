/**
 * @file sketch.js
 * @description A minimal demo for rendering the Makeability Lab logo on a 2D canvas.
 * Handles high-DPI scaling and basic keyboard interactions for logo debugging.
 * 
 * See all demos: https://makeabilitylab.github.io/js/
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 * 
 */

import { MakeabilityLabLogo, Grid } from '../../../lib/logo/makelab-logo.js';

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const BACKGROUND_COLOR = "rgb(250, 250, 250)";

let makeLabGrid;
let makeLabLogo;

/**
 * Initializes canvas resolution and logo objects once.
 */
function setup() {
  // 1. Determine the high-DPI scaling factor
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // 2. Set internal drawing surface size (physical pixels)
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // 3. Scale the context so coordinates match CSS pixels
  ctx.scale(dpr, dpr);

  // 4. Initialize the logo and scale it to fit the fixed canvas
  // fitToCanvas handles centering and calculating the correct triangle size
  makeLabLogo = new MakeabilityLabLogo(0, 0, 10); 
  makeLabLogo.fitToCanvas(rect.width, rect.height);

  // 5. Initialize the grid using the computed triangle size from the logo
  makeLabGrid = new Grid(rect.width, rect.height, makeLabLogo.cellSize,
                       undefined, undefined, makeLabLogo.x, makeLabLogo.y);
  
  // Expose to window for console interaction
  window.makeLabLogo = makeLabLogo;

  draw();
  printMenuToConsole();
}

/**
 * Renders the grid and logo to the canvas.
 */
function draw() {
  const rect = canvas.getBoundingClientRect();
  
  // Clear the background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.fillRect(0, 0, rect.width, rect.height);

  // Draw components if they are set to visible
  if (makeLabGrid && makeLabGrid.visible) makeLabGrid.draw(ctx);
  if (makeLabLogo && makeLabLogo.visible) makeLabLogo.draw(ctx);
}

/**
 * Logs keyboard shortcuts for the logo demo.
 */
function printMenuToConsole() {
  console.log("Press 'g' to toggle grid.");
  console.log("Press 'm' to toggle M outline.");
  console.log("Press 'l' to toggle L outline.");
  console.log("Press 'k' to toggle L triangle strokes.");
  console.log("Press 'h' to toggle Logo visibility.");
  console.log("Type window.makeLabLogo in the console to interact with the logo object directly.");
}

// Keyboard interaction for toggling logo properties
document.addEventListener('keydown', (event) => {
  if (!makeLabLogo || !makeLabGrid) return;

  switch (event.key.toLowerCase()) {
    case 'g': makeLabGrid.visible = !makeLabGrid.visible; break;
    case 'm': makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible; break;
    case 'l': makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible; break;
    case 'k': makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible; break;
    case 'h': makeLabLogo.visible = !makeLabLogo.visible; break;
    case 'r': break; 
    default: return;
  }
  draw();
});

// Run initialization
setup();