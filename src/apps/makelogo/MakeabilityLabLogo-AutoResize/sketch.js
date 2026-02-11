import { MakeabilityLabLogo, Grid } from '../../../lib/logo/makelab-logo.js'; 

const div = document.querySelector('.container');
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let backgroundColor = "rgb(250, 250, 250)";
let triangleSize = 100;
let makeLabGrid, xLogo, yLogo, makeLabLogo;

// Store logical dimensions for drawing logic
let logicalWidth, logicalHeight;

// Initial setup
resizeCanvas();
printMenu();

function draw(ctx){
  // clear canvas using logical dimensions
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, logicalWidth, logicalHeight);

  // draw grid and logo
  makeLabGrid.draw(ctx);
  makeLabLogo.draw(ctx);
}

function recreateGraphicalObjects(){
  // Use logical coordinates for object placement
  makeLabGrid = new Grid(logicalWidth, logicalHeight, triangleSize);
  xLogo = MakeabilityLabLogo.getGridXCenterPosition(triangleSize, logicalWidth);
  yLogo = MakeabilityLabLogo.getGridYCenterPosition(triangleSize, logicalHeight);
  makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, triangleSize);
  window.makeLabLogo = makeLabLogo;
}

function resizeCanvas() {
  // 1. Determine logical size from the container
  logicalWidth = div.clientWidth;
  logicalHeight = div.clientHeight;

  // 2. Determine physical size based on device pixel ratio
  const dpr = window.devicePixelRatio || 1;

  // 3. Scale the drawing buffer
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;

  // 4. Force the CSS display size to match logical size
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;

  // 5. Reset and apply scaling to the context
  ctx.setTransform(1, 0, 0, 1, 0, 0); 
  ctx.scale(dpr, dpr);

  console.log(`Resized: Logical(${logicalWidth}x${logicalHeight}) DPR: ${dpr}`);
  
  recreateGraphicalObjects();
  draw(ctx);
}

// Event listener for window resize
window.addEventListener('resize', resizeCanvas);

// --- Keyboard Controls (Original logic maintained) ---

function printMenu(){
  console.log("Press '+' to increase triangle size. Currently set to: ", triangleSize);
  console.log("Press '-' to decrease triangle size. Currently set to: ", triangleSize);
  console.log("Press 'g' to toggle grid. Currently set to: ", makeLabGrid.visible);
  console.log("Press 'm' to toggle M outline. Currently set to: ", makeLabLogo.isMOutlineVisible);
  console.log("Press 'l' to toggle L outline. Currently set to: ", makeLabLogo.isLOutlineVisible);
  console.log("Press 'k' to toggle L triangle strokes. Currently set to: ", makeLabLogo.areLTriangleStrokesVisible);
  console.log("Press 'h' to toggle Makeability Lab logo. Currently set to: ", makeLabLogo.visible);
  console.log("Press 'b' to toggle the text label.");
  console.log("Press 'r' to refresh the canvas.");
  console.log("");
}

document.addEventListener('keydown', function(event) {
  const key = event.key;
  switch (key) {
    case '=':
    case "+":
      triangleSize += 5;
      recreateGraphicalObjects();
      draw(ctx);
      break;
    case '-':
    case "_":
      triangleSize = Math.max(5, triangleSize - 5);
      recreateGraphicalObjects();
      draw(ctx);
      break;
    case 'g':
      makeLabGrid.visible = !makeLabGrid.visible;
      draw(ctx);
      break;
    case 'm':
      makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
      draw(ctx);
      break;
    case 'l':
      makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
      draw(ctx);
      break;
    case 'k':
      makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible;
      draw(ctx);
      break;
    case 'h':
      makeLabLogo.visible = !makeLabLogo.visible;
      draw(ctx);
      break;
    case 'r':
      draw(ctx);
      break;
    case 'b': // 'b' for "Brand" or "Bottom label"
      makeLabLogo.isLabelVisible = !makeLabLogo.isLabelVisible;
      console.log("Text label visible:", makeLabLogo.isLabelVisible);
      // Crucial: Recenter the logo because the height changed
      makeLabLogo.centerLogo(logicalWidth, logicalHeight);
      
      draw(ctx);
      break; 
  }
});