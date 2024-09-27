// import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from '../_library/makelab-logo.js';
// import { lerpColor, convertColorStringToObject } from '../_library/color-utils.js';
// import { lerp, random } from '../_library/math-utils.js';

import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY} from '/dist/makelab.all.js';
import { lerpColor } from '/dist/makelab.all.js';
import { lerp, random } from '/dist/makelab.all.js';

const canvas = document.getElementById('myCanvas');

canvas.width = 1000;
canvas.height = 1000;

const ctx = canvas.getContext('2d');

let originalRandomTriLocs = [];
let explodeSize = true;
let explodeAngle = true;
let explodeX = true;
let explodeY = true;

ctx.fillStyle = "rgb(250, 250, 250)"; // Set the fill style to gray
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

const TRIANGLE_SIZE = 50;
let xLogo = MakeabilityLabLogo.getXCenterPosition(TRIANGLE_SIZE, canvas.width);
let yLogo = MakeabilityLabLogo.getYCenterPosition(TRIANGLE_SIZE, canvas.height);
let makeLabGrid = new Grid(canvas.width, canvas.height, TRIANGLE_SIZE);
let makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
makeLabLogo.visible = false;

let makeLabLogoAnimated = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);
makeLabLogoAnimated.isLOutlineVisible = false;
makeLabLogoAnimated.isMOutlineVisible = false;
resetRandomTriLocs();

draw(ctx);
printMenu();
canvas.addEventListener('mousemove', mouseMoved);

// function resetRandomTriLocs(){
//   originalRandomTriLocs = [];
//   const width = canvas.width;
//   const height = canvas.height;
//   for(const tri of makeLabLogoAnimated.getAllTriangles(true)){
  
//     let randSize = explodeSize ? random(TRIANGLE_SIZE/2, TRIANGLE_SIZE*3) : TRIANGLE_SIZE;
//     tri.x = random(randSize, width - randSize);
//     tri.y = random(randSize, height - randSize);
//     tri.angle = explodeAngle ? random(0, 360) : 0;
//     tri.size = randSize;
//     originalRandomTriLocs.push({x: tri.x, y: tri.y, angle: tri.angle, size: randSize});
//   }
  
//   console.log(`resetRandomTriLocs: originalRandomTriLocs.length: ${originalRandomTriLocs.length}`);
// }

function resetRandomTriLocs(){
  originalRandomTriLocs = [];
  const width = canvas.width;
  const height = canvas.height;
  const makeLabLogoTriangles = makeLabLogo.getAllTriangles(true);
  const makeLabLogoAnimatedTriangles = makeLabLogoAnimated.getAllTriangles(true);
  for (let i = 0; i < makeLabLogoAnimatedTriangles.length; i++) {
    const tri = makeLabLogoAnimatedTriangles[i];
    let randSize = explodeSize ? random(TRIANGLE_SIZE/2, TRIANGLE_SIZE*3) : TRIANGLE_SIZE;
    tri.x = explodeX ? random(randSize, width - randSize) : makeLabLogoTriangles[i].x;
    tri.y = explodeY ? random(randSize, height - randSize) : makeLabLogoTriangles[i].y;
    tri.angle = explodeAngle ? random(0, 360) : 0;
    tri.size = randSize;
    originalRandomTriLocs.push({x: tri.x, y: tri.y, angle: tri.angle, size: randSize});
  }
  
  console.log(`resetRandomTriLocs: originalRandomTriLocs.length: ${originalRandomTriLocs.length}`);
}

// function resetRandomTriLocs(){
//   originalRandomTriLocs = [];
//   const width = canvas.width;
//   const height = canvas.height;
//   // Get the triangles from both makeLabLogo and makeLabLogoAnimated
//   const makeLabLogoTriangles = makeLabLogo.getAllTriangles(true);
//   const makeLabLogoAnimatedTriangles = makeLabLogoAnimated.getAllTriangles(true);

//   const triangleSize = makeLabLogo.triangleSize;

//   // Iterate through both arrays simultaneously
//   for (let i = 0; i < makeLabLogoTriangles.length; i++) {
//     const originalTri = makeLabLogoTriangles[i];
//     const animatedTri = makeLabLogoAnimatedTriangles[i];
//     let randSize = explodeSize ? random(triangleSize/2, triangleSize*3) : triangleSize;
//     animatedTri.x = explodeX ? random(randSize, width - randSize) : originalTri.x;
//     animatedTri.y = explodeY ? random(randSize, height - randSize) : originalTri.y;
//     animatedTri.angle = explodeAngle ? random(0, 360) : 0;
//     animatedTri.size = randSize;
//     originalRandomTriLocs.push({x: animatedTri.x, 
//       y: animatedTri.y, 
//       angle: animatedTri.angle, 
//       size: randSize});
//   }
//   console.log(`resetRandomTriLocs: originalRandomTriLocs.length: ${originalRandomTriLocs.length}`);
// }

function mouseMoved(event) {
  //console.log(`mouseMoved: ${event.clientX}, ${event.clientY}`);
  // const mouseX = event.clientX;
  // const width = canvas.width;
  // const lerpAmt = (mouseX - 0) / (width - 0);
  const rect = canvas.getBoundingClientRect();
  //console.log(`rect`, rect);
  const mouseX = event.clientX - rect.left; // Mouse X relative to the canvas
  const width = rect.width - 50;
  const lerpAmt = Math.min(mouseX / width, 1); // Normalize to range [0.0, 1.0]
  if(lerpAmt >= 1){
    makeLabLogoAnimated.isLOutlineVisible = true;
  }else{
    makeLabLogoAnimated.isLOutlineVisible = false;
  }
  //console.log(`mouseX: ${mouseX}, width: ${width}, lerpAmt: ${lerpAmt}`);

  let staticTriangles = makeLabLogo.getAllTriangles(true);
  let animatedTriangles = makeLabLogoAnimated.getAllTriangles(true);
  //console.log(`originalRandomTriLocs.length: ${originalRandomTriLocs.length}`);
  for (let i = 0; i < originalRandomTriLocs.length; i++) {
    const endX = staticTriangles[i].x;
    const endY = staticTriangles[i].y;
    const endAngle = 0;
    const endSize = staticTriangles[i].size;

    const startX = originalRandomTriLocs[i].x;
    const startY = originalRandomTriLocs[i].y;
    const startAngle = originalRandomTriLocs[i].angle;
    const startSize = originalRandomTriLocs[i].size;

    const newX = lerp(startX, endX, lerpAmt);
    const newY = lerp(startY, endY, lerpAmt);
    const newAngle = lerp(startAngle, endAngle, lerpAmt);
    const newSize = lerp(startSize, endSize, lerpAmt);

    animatedTriangles[i].x = newX;
    animatedTriangles[i].y = newY;
    animatedTriangles[i].angle = newAngle;
    animatedTriangles[i].size = newSize;
    // console.log(`animatedTriangles[${i}]: x: ${animatedTriangles[i].x}, y: ${animatedTriangles[i].y}, angle: ${animatedTriangles[i].angle}, size: ${animatedTriangles[i].size}`);
  }

  const animatedColoredTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
  for (let i = 0; i < animatedColoredTriangles.length; i++) {
    const startColor = { r: 255, g: 255, b: 255, a: 1 };
    const endColor = ORIGINAL_COLOR_ARRAY[i];
    const newColor = lerpColor(startColor, endColor, lerpAmt);
    animatedColoredTriangles[i].fillColor = newColor;
  }
  draw(ctx);
}

function draw(ctx){
  // clear canvas
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw grid and logo
  makeLabGrid.draw(ctx);
  makeLabLogo.draw(ctx);
  makeLabLogoAnimated.draw(ctx);
}

function printMenu(){
  console.log("Press 'g' to toggle grid. Currently set to: ", makeLabGrid.visible);
  console.log("Press 'm' to toggle M outline. Currently set to: ", makeLabLogo.isMOutlineVisible);
  console.log("Press 'l' to toggle L outline. Currently set to: ", makeLabLogo.isLOutlineVisible);
  console.log("Press 'k' to toggle L triangle strokes. Currently set to: ", makeLabLogo.areLTriangleStrokesVisible);
  console.log("Press 'h' to toggle Makeability Lab logo. Currently set to: ", makeLabLogo.visible);
  console.log("");
  console.log("Type printMenu() to see this menu again.");
}

document.addEventListener('keydown', function(event) {
  const key = event.key;

  switch (key) {
    case 'g':
      makeLabGrid.visible = !makeLabGrid.visible;
      console.log("Grid visibility is set to: ", makeLabGrid.visible);
      draw(ctx);
      break;

    case 'm':
      makeLabLogoAnimated.isMOutlineVisible = !makeLabLogoAnimated.isMOutlineVisible;
      console.log("M outline visible: ", makeLabLogoAnimated.isMOutlineVisible);
      draw(ctx);
      break;

    case 'l':
      makeLabLogoAnimated.isLOutlineVisible = !makeLabLogoAnimated.isLOutlineVisible;
      console.log("L outline visible: ", makeLabLogoAnimated.isLOutlineVisible);
      draw(ctx);
      break;

    case 'k':
      makeLabLogoAnimated.areLTriangleStrokesVisible = !makeLabLogoAnimated.areLTriangleStrokesVisible;
      console.log("L triangle strokes visible: ", makeLabLogoAnimated.areLTriangleStrokesVisible);
      draw(ctx);
      break;

    case 'h':
      makeLabLogo.visible = !makeLabLogo.visible;
      console.log("Makeability Lab logo visible: ", makeLabLogo.visible);
      draw(ctx);
      break;

    case 'r':
      console.log("Resetting random triangle locations");
      resetRandomTriLocs();
      draw(ctx);
      break;
      
  }
});