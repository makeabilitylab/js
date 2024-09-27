import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from './makelab-logo.js';
import { lerpColor, convertColorStringToObject } from '../graphics/color-utils.js';
import { lerp, random } from '../math/math-utils.js';

export class MakeabilityLabLogoExploder{
  constructor(x, y, triangleSize){
    this.makeLabLogo = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogo.visible = false;

    this.makeLabLogoAnimated = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogoAnimated.isLOutlineVisible = false;
    this.makeLabLogoAnimated.isMOutlineVisible = false;

    this.originalRandomTriLocs = [];
    this.reset();

    this.explodeSize = true;
    this.explodeX = true;
    this.explodeY = true;
    this.explodeAngle = true;
  }

  reset(width, height){
    this.originalRandomTriLocs = [];
    const triangleSize = this.makeLabLogoAnimated.triangleSize;
    for(const tri of this.makeLabLogo.getAllTriangles(true)){
      let randSize = this.explodeSize ? random(triangleSize/2, triangleSize*3) : triangleSize;
      tri.x = random(randSize, width - randSize);
      tri.y = random(randSize, height - randSize);
      tri.angle = modifyAngle ? random(0, 360) : 0;
      tri.size = randSize;
      this.originalRandomTriLocs.push({x: tri.x, y: tri.y, angle: tri.angle, size: randSize});
    }
  }

  update(lerpAmt){
    if(lerpAmt >= 1){
      this.makeLabLogoAnimated.isLOutlineVisible = true;
    }else{
      this.makeLabLogoAnimated.isLOutlineVisible = false;
    }

    const staticTriangles = this.makeLabLogo.getAllTriangles(true);
    let animatedTriangles = this.makeLabLogoAnimated.getAllTriangles(true);

    for (let i = 0; i < this.originalRandomTriLocs.length; i++) {
      const endX = staticTriangles[i].x;
      const endY = staticTriangles[i].y;
      const endAngle = 0;
      const endSize = staticTriangles[i].size;
  
      const startX = this.originalRandomTriLocs[i].x;
      const startY = this.originalRandomTriLocs[i].y;
      const startAngle = this.originalRandomTriLocs[i].angle;
      const startSize = this.originalRandomTriLocs[i].size;
  
      const newX = lerp(startX, endX, lerpAmt);
      const newY = lerp(startY, endY, lerpAmt);
      const newAngle = lerp(startAngle, endAngle, lerpAmt);
      const newSize = lerp(startSize, endSize, lerpAmt);
  
      animatedTriangles[i].x = newX;
      animatedTriangles[i].y = newY;
      animatedTriangles[i].angle = newAngle;
      animatedTriangles[i].size = newSize;
    }
  
    const animatedColoredTriangles = this.makeLabLogoAnimated.getDefaultColoredTriangles();
    for (let i = 0; i < animatedColoredTriangles.length; i++) {
      const startColor = { r: 255, g: 255, b: 255, a: 1 };
      const endColor = ORIGINAL_COLOR_ARRAY[i];
      const newColor = lerpColor(startColor, endColor, lerpAmt);
      animatedColoredTriangles[i].fillColor = newColor;
    }
  }

  draw(ctx){
    this.makeLabLogo.draw(ctx);
    this.makeLabLogoAnimated.draw(ctx);
  }
  
}