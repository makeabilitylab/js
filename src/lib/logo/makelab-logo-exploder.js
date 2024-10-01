import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from './makelab-logo.js';
import { lerpColor, convertColorStringToObject } from '../graphics/color-utils.js';
import { lerp, random } from '../math/math-utils.js';

export class MakeabilityLabLogoExploder{
  constructor(x, y, triangleSize, startFillColor="rgb(255, 255, 255, 0.5)", 
    startStrokeColor="rgba(0, 0, 0, 0.6)"){

    this.makeLabLogo = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogo.visible = false;

    this.makeLabLogoAnimated = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogoAnimated.isLOutlineVisible = false;
    this.makeLabLogoAnimated.isMOutlineVisible = false;
    
    this.makeLabLogo.setLTriangleStrokeColor('rgb(240, 240, 240)'); // barely noticeable
    this.makeLabLogoAnimated.setFillColor(startFillColor);
    this.makeLabLogoAnimated.setColors(startFillColor, startStrokeColor);
    this.makeLabLogoAnimated.areLTriangleStrokesVisible = true;

    this.originalRandomTriLocs = [];

    this.explodeSize = true;
    this.explodeX = true;
    this.explodeY = true;
    this.explodeAngle = true;
    this.explodeStrokeColor = true;
    this.explodeFillColor = true;
    this.explodeStrokeWidth = true;

    // TODO:
    // - Add explodeFillColor property
    // - Add explodeStrokeColor property
    // - Add Makeability Lab text at end of animation
  }

  /**
   * Resets the state of the logo exploder with new dimensions and randomizes the 
   * positions, angles, and sizes of the triangles.
   *
   * @param {number} width - The drawing area width
   * @param {number} height - The drawing area height
   */
  reset(width, height){

    this.originalRandomTriLocs = [];
    const triangleSize = this.makeLabLogo.cellSize;
   
    const makeLabLogoTriangles = this.makeLabLogo.getAllTriangles();
    const makeLabLogoAnimatedTriangles = this.makeLabLogoAnimated.getAllTriangles();
    for (let i = 0; i < makeLabLogoAnimatedTriangles.length; i++) {
      const tri = makeLabLogoAnimatedTriangles[i];
      let randSize = this.explodeSize ? random(triangleSize/2, triangleSize*3) : triangleSize;
      tri.x = this.explodeX ? random(randSize, width - randSize) : makeLabLogoTriangles[i].x;
      tri.y = this.explodeY ? random(randSize, height - randSize) : makeLabLogoTriangles[i].y;
      tri.angle = this.explodeAngle ? random(0, 360) : 0;
      tri.strokeColor = this.explodeStrokeColor ? makeLabLogoAnimatedTriangles[i].strokeColor : makeLabLogoTriangles[i].strokeColor;
      tri.fillColor = this.explodeFillColor ? makeLabLogoAnimatedTriangles[i].fillColor : makeLabLogoTriangles[i].fillColor;
      tri.strokeWidth = this.explodeStrokeWidth ? makeLabLogoAnimatedTriangles[i].strokeWidth : makeLabLogoTriangles[i].strokeWidth;
      tri.size = randSize;
      this.originalRandomTriLocs.push(
        { x: tri.x, 
          y: tri.y, 
          angle: tri.angle, 
          size: tri.size,
          strokeColor: tri.strokeColor,
          fillColor: tri.fillColor,
          strokeWidth: tri.strokeWidth
        });
    }
  }

  /**
   * Updates the state of the animated logo based on the provided interpolation amount.
   *
   * @param {number} lerpAmt - The interpolation amount, a value between 0 and 1.
   *
   * This function performs the following operations:
   * 1. Toggles the visibility of the logo outline based on the lerpAmt.
   * 2. Interpolates the position, angle, and size of each triangle in the logo from their
   *    original random locations to their final static positions.
   * 3. Interpolates the color of each triangle in the logo from white to their original colors.
   */
  update(lerpAmt){
    if(lerpAmt >= 1){
      this.makeLabLogoAnimated.isLOutlineVisible = true;
      //this.makeLabLogoAnimated.areLTriangleStrokesVisible = false;
    }else{
      this.makeLabLogoAnimated.isLOutlineVisible = false;
      //this.makeLabLogoAnimated.areLTriangleStrokesVisible = true;
    }

    const staticTriangles = this.makeLabLogo.getAllTriangles(true);
    let animatedTriangles = this.makeLabLogoAnimated.getAllTriangles(true);

    for (let i = 0; i < this.originalRandomTriLocs.length; i++) {
      const endX = staticTriangles[i].x;
      const endY = staticTriangles[i].y;
      const endAngle = 0;
      const endSize = staticTriangles[i].size;
      const endStrokeColor = staticTriangles[i].strokeColor;
      const endFillColor = staticTriangles[i].fillColor;
      const endStrokeWidth = staticTriangles[i].strokeWidth;
  
      const startX = this.originalRandomTriLocs[i].x;
      const startY = this.originalRandomTriLocs[i].y;
      const startAngle = this.originalRandomTriLocs[i].angle;
      const startSize = this.originalRandomTriLocs[i].size;
      const startStrokeColor = this.originalRandomTriLocs[i].strokeColor;
      const startFillColor = this.originalRandomTriLocs[i].fillColor;
      const startStrokeWidth = this.originalRandomTriLocs[i].strokeWidth;
  
      const newX = lerp(startX, endX, lerpAmt);
      const newY = lerp(startY, endY, lerpAmt);
      const newAngle = lerp(startAngle, endAngle, lerpAmt);
      const newSize = lerp(startSize, endSize, lerpAmt);
      const newStrokeWidth = lerp(startStrokeWidth, endStrokeWidth, lerpAmt);
      const newStrokeColor = lerpColor(startStrokeColor, endStrokeColor, lerpAmt);
      const newFillColor = lerpColor(startFillColor, endFillColor, lerpAmt);
      
      animatedTriangles[i].x = newX;
      animatedTriangles[i].y = newY;
      animatedTriangles[i].angle = newAngle;
      animatedTriangles[i].size = newSize;
      animatedTriangles[i].strokeWidth = newStrokeWidth;
      animatedTriangles[i].strokeColor = newStrokeColor;
      animatedTriangles[i].fillColor = newFillColor;

      console.log(`Triangle ${i}`, JSON.stringify(animatedTriangles[i]));
      //console.log
    }
  }

  /**
   * Draws the MakeLab logo and its animated version on the provided canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context where the logos will be drawn.
   */
  draw(ctx){
    this.makeLabLogo.draw(ctx);
    this.makeLabLogoAnimated.draw(ctx);
  }
  
}