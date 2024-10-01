import { MakeabilityLabLogoExploder } from '../../../lib/logo/makelab-logo-exploder.js';
import { MakeabilityLabLogo } from '../../../lib/logo/makelab-logo.js'; 
//import { MakeabilityLabLogoExploder, MakeabilityLabLogo} from '/dist/makelab.logo.js';

const canvas = document.getElementById('myCanvas');

canvas.width = 1000;
canvas.height = 1000;

const ctx = canvas.getContext('2d');
const TRIANGLE_SIZE = 50;
let xLogo = MakeabilityLabLogo.getXCenterPosition(TRIANGLE_SIZE, canvas.width);
let yLogo = MakeabilityLabLogo.getYCenterPosition(TRIANGLE_SIZE, canvas.height);
let makeLabLogoExploder = new MakeabilityLabLogoExploder(xLogo, yLogo, TRIANGLE_SIZE);
makeLabLogoExploder.reset(canvas.width, canvas.height);
makeLabLogoExploder.draw(ctx);

canvas.addEventListener('mousemove', mouseMoved);
printMenu();

function mouseMoved(event){
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left; // Mouse X relative to the canvas
  const width = rect.width - 50;
  const lerpAmt = Math.min(mouseX / width, 1); // Normalize to range [0.0, 1.0]
  //console.log(`mouseX: ${mouseX}, width: ${width}, lerpAmt: ${lerpAmt}`);

  makeLabLogoExploder.update(lerpAmt);
  draw(ctx);
}

function draw(ctx){
  // clear canvas
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  makeLabLogoExploder.draw(ctx);
}

function printMenu(){
  console.log("Press 'a' to toggle explode angle. Currently set to: ", makeLabLogoExploder.explodeAngle);
  console.log("Press 's' to toggle explode size. Currently set to: ", makeLabLogoExploder.explodeSize);
  console.log("Press 'x' to toggle explode X. Currently set to: ", makeLabLogoExploder.explodeX);
  console.log("Press 'y' to toggle explode Y. Currently set to: ", makeLabLogoExploder.explodeY);
  console.log("Press 'h' to toggle Makeability Lab logo. Currently set to: ", makeLabLogoExploder.makeLabLogo.visible);
  console.log("Press 'r' to reset animation.");
  console.log("");
  console.log("Type printMenu() to see this menu again.");
}

document.addEventListener('keydown', function(event) {
  const key = event.key;

  switch (key) {

    case 'a':
      makeLabLogoExploder.explodeAngle = !makeLabLogoExploder.explodeAngle;
      makeLabLogoExploder.reset(canvas.width, canvas.height);
      console.log("Explode Angle: ", makeLabLogoExploder.explodeAngle);
      draw(ctx);
      break;

    case 'x':
      makeLabLogoExploder.explodeX = !makeLabLogoExploder.explodeX;
      makeLabLogoExploder.reset(canvas.width, canvas.height);
      console.log("Explode X: ", makeLabLogoExploder.explodeX);
      draw(ctx);
      break;

    case 'y':
      makeLabLogoExploder.explodeY = !makeLabLogoExploder.explodeY;
      makeLabLogoExploder.reset(canvas.width, canvas.height);
      console.log("Explode Y: ", makeLabLogoExploder.explodeY);
      draw(ctx);
      break;

    case 's':
      makeLabLogoExploder.explodeSize = !makeLabLogoExploder.explodeSize;
      makeLabLogoExploder.reset(canvas.width, canvas.height);
      console.log("Explode Size: ", makeLabLogoExploder.explodeSize);
      draw(ctx);
      break

    case 'h':
      makeLabLogoExploder.makeLabLogo.visible = !makeLabLogoExploder.makeLabLogo.visible;
      console.log("Makeability Lab logo visible: ", makeLabLogoExploder.makeLabLogo.visible);
      draw(ctx);
      break;

    case 'r':
      console.log("Resetting animation");
      makeLabLogoExploder.reset(canvas.width, canvas.height);
      draw(ctx);
      break;
      
  }
});