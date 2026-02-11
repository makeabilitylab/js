import { MakeabilityLabLogo, Grid, ORIGINAL_COLOR_ARRAY } from './makelab-logo.js';
import { lerpColor, convertColorStringToObject } from '../graphics/color-utils.js';
import { lerp, random, easeOutCubic } from '../math/math-utils.js';

export class MakeabilityLabLogoExploder{
  /**
   * Creates a new MakeabilityLabLogoExploder instance.
   *
   * The exploder manages two internal MakeabilityLabLogo instances: a static "target"
   * logo (makeLabLogo) and an animated logo (makeLabLogoAnimated). Call reset() to
   * randomize particle positions, then update(lerpAmt) to interpolate between the
   * exploded and assembled states.
   *
   * @param {number} x - The x-coordinate for the logo position.
   * @param {number} y - The y-coordinate for the logo position.
   * @param {number} triangleSize - The size of each triangle cell.
   * @param {string} [startFillColor="rgb(255, 255, 255, 0.5)"] - Initial fill color for exploded triangles.
   * @param {string} [startStrokeColor="rgba(0, 0, 0, 0.6)"] - Initial stroke color for exploded triangles.
   */
  constructor(x, y, triangleSize, startFillColor="rgb(255, 255, 255, 0.5)", 
    startStrokeColor="rgba(0, 0, 0, 0.6)"){

    // Static "target" logo — invisible by default, used as the end-state reference
    this.makeLabLogo = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogo.visible = false;

    // Animated logo — the one that moves from exploded → assembled
    this.makeLabLogoAnimated = new MakeabilityLabLogo(x, y, triangleSize);
    this.makeLabLogoAnimated.isLOutlineVisible = false;
    this.makeLabLogoAnimated.isMOutlineVisible = false;
    
    this.makeLabLogo.setLTriangleStrokeColor('rgb(240, 240, 240)'); // barely noticeable
    this.makeLabLogoAnimated.areLTriangleStrokesVisible = true;

    /** @type {Array<Object>} Snapshot of each triangle's randomized start state */
    this.originalRandomTriLocs = [];

    // --- Explode flags: control which properties are randomized ---
    this.explodeSize = true;
    this.explodeX = true;
    this.explodeY = true;
    this.explodeAngle = true;
    this.explodeStrokeColor = true;
    this.explodeFillColor = true;
    this.explodeStrokeWidth = true;

    this.startFillColor = startFillColor;
    this.startStrokeColor = startStrokeColor;

    // --- Easing ---
    /** 
     * Easing function applied to spatial properties (position, angle, size).
     * Receives a value in [0, 1] and returns a value in [0, 1].
     * Colors always use linear interpolation regardless of this setting.
     * @type {function(number): number} 
     */
    this.easingFunction = easeOutCubic;

    // --- Label text ---
    this.isLabelVisible = true;
    this.labelText = "MAKEABILITY LAB"; // All caps
    this.labelBoldUntilIndex = 4; // Bolds the first 4 characters ("MAKE")
    this.labelFontFamily = "Inter, Roboto, system-ui, -apple-system, sans-serif"; // Modern, cool font stack
    this.labelColor = "black";

    /** 
     * Controls when the label starts fading in, as a fraction of the overall
     * animation. E.g., 0.7 means the label begins appearing at 70% progress. 
     * @type {number} 
     */
    this.labelAppearThreshold = 0.7;

    /**
     * Vertical gap in pixels between the bottom of the logo and the label.
     * @type {number}
     */
    this.labelGap = 8;

    /**
     * Label font size as a fraction of the logo width. The actual pixel size
     * is computed dynamically so the text scales with the logo.
     * @type {number}
     */
    this.labelFontSizeFraction = 0.09;
  }

  // --- Getters ---

  get finalHeight(){ return this.makeLabLogo.height; }
  get finalWidth(){ return this.makeLabLogo.width; }

  
  /**
   * Adjusts the size of the logo to fit within the specified canvas dimensions.
   *
   * @param {number} canvasWidth - The width of the canvas to fit the logo into.
   * @param {number} canvasHeight - The height of the canvas to fit the logo into.
   * @param {boolean} [alignToGrid=false] - Optional parameter to align the logo to a grid.
   */
  fitToCanvas(canvasWidth, canvasHeight, alignToGrid=false){
    this.makeLabLogo.fitToCanvas(canvasWidth, canvasHeight, alignToGrid);
    this.makeLabLogoAnimated.fitToCanvas(canvasWidth, canvasHeight, alignToGrid);
  }

  /**
   * Sets the size of the logo for both the static and animated versions.
   *
   * @param {number} logoWidth - The width to set for the logo.
   */
  setLogoSize(logoWidth){
    this.makeLabLogo.setLogoSize(logoWidth);
    this.makeLabLogoAnimated.setLogoSize(logoWidth);
  }

  /**
   * Sets the final size of the logo at the end state.
   *
   * @param {number} finalWidth - The desired width of the logo.
   */
  setLogoSizeEndState(finalWidth){
    this.makeLabLogo.setLogoSize(finalWidth);
  }

  /**
   * Sets the x position for both the static and animated MakeLab logos.
   *
   * @param {number} x - The x-coordinate to set for the logos.
   */
  setXPosition(x){
    this.makeLabLogo.x = x;
    this.makeLabLogoAnimated.x = x;
  }

  /**
   * Sets the Y position for both static and animated MakeLab logos.
   *
   * @param {number} y - The Y coordinate to set.
   */
  setYPosition(y){
    this.makeLabLogo.y = y;
    this.makeLabLogoAnimated.y = y;
  }

  /**
   * Sets the position of the logo.
   *
   * @param {number} x - The x-coordinate for the logo position.
   * @param {number} y - The y-coordinate for the logo position.
   */
  setLogoPosition(x, y){
    this.makeLabLogo.setLogoPosition(x, y);
    this.makeLabLogoAnimated.setLogoPosition(x, y);
  }

  /**
   * Centers the logo on the canvas.
   *
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.
   */
  centerLogo(canvasWidth, canvasHeight, alignedToGrid=false){
    this.makeLabLogo.centerLogo(canvasWidth, canvasHeight, alignedToGrid);
    this.makeLabLogoAnimated.centerLogo(canvasWidth, canvasHeight, alignedToGrid);
  }

  /**
   * Resets the state of the logo exploder with new dimensions and randomizes the 
   * positions, angles, and sizes of the triangles.
   *
   * @param {number} canvasWidth - The drawing area width.
   * @param {number} canvasHeight - The drawing area height.
   */
  reset(canvasWidth, canvasHeight){

    this.originalRandomTriLocs = [];
    const endStateTriangleSize = this.makeLabLogo.cellSize;
   
    const makeLabLogoTriangles = this.makeLabLogo.getAllTriangles();
    const makeLabLogoAnimatedTriangles = this.makeLabLogoAnimated.getAllTriangles();
    this.makeLabLogoAnimated.setColors(this.startFillColor, this.startStrokeColor);
    for (let i = 0; i < makeLabLogoAnimatedTriangles.length; i++) {
      const tri = makeLabLogoAnimatedTriangles[i];
      let randSize = this.explodeSize ? random(endStateTriangleSize/2, endStateTriangleSize*3) : endStateTriangleSize;
      tri.x = this.explodeX ? random(randSize, canvasWidth - randSize) : makeLabLogoTriangles[i].x;
      tri.y = this.explodeY ? random(randSize, canvasHeight - randSize) : makeLabLogoTriangles[i].y;
      tri.angle = this.explodeAngle ? random(0, 540) : 0;
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
   * 3. Interpolates the color of each triangle in the logo from the start colors to their
   *    original colors.
   */
  update(lerpAmt){
    if (this.originalRandomTriLocs.length === 0) return;

    // Apply easing to spatial properties
    const t = this.easingFunction(lerpAmt);

    if(lerpAmt >= 1){
      this.makeLabLogoAnimated.isLOutlineVisible = true;
    }else{
      this.makeLabLogoAnimated.isLOutlineVisible = false;
    }

    const staticTriangles = this.makeLabLogo.getAllTriangles(true);
    const animatedTriangles = this.makeLabLogoAnimated.getAllTriangles(true);

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
  
      // Apply easing (t) to spatial properties
      animatedTriangles[i].x = lerp(startX, endX, t);
      animatedTriangles[i].y = lerp(startY, endY, t);
      animatedTriangles[i].angle = lerp(startAngle, endAngle, t);
      animatedTriangles[i].size = lerp(startSize, endSize, t);
      
      // Apply linear interpolation for visual style properties
      animatedTriangles[i].strokeWidth = lerp(startStrokeWidth, endStrokeWidth, lerpAmt);
      animatedTriangles[i].strokeColor = lerpColor(startStrokeColor, endStrokeColor, lerpAmt);
      animatedTriangles[i].fillColor = lerpColor(startFillColor, endFillColor, lerpAmt);
    }

    // Cache the current lerpAmt so draw() can use it for the label
    this._currentLerpAmt = lerpAmt;
  }

  /**
   * Draws the MakeLab logo and its animated version on the provided canvas context.
   * When the animation is near completion, also draws the "Makeability Lab" label
   * with a fade-in and slide-up effect.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context where the logos will be drawn.
   */
  draw(ctx){
    this.makeLabLogo.draw(ctx);
    this.makeLabLogoAnimated.draw(ctx);

    if (this.isLabelVisible) {
      this._drawLabel(ctx);
    }
  }

  /**
   * Draws the "MAKEABILITY LAB" label with "MAKE" bolded, matched to logo width.
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @private
   */
  _drawLabel(ctx) {
    const lerpAmt = this._currentLerpAmt ?? 0;
    if (lerpAmt <= this.labelAppearThreshold) return;

    const labelProgress = Math.min(
      (lerpAmt - this.labelAppearThreshold) / (1 - this.labelAppearThreshold),
      1
    );
    const easedProgress = this.easingFunction(labelProgress);

    const logoWidth = this.makeLabLogoAnimated.width;
    const targetWidth = logoWidth;

    // Dynamically split based on the index
    const part1 = this.labelText.substring(0, this.labelBoldUntilIndex);
    const part2 = this.labelText.substring(this.labelBoldUntilIndex);

    // 1. Determine font size to match logo width
    // We measure at 100px to find the ratio, then scale
    ctx.save();
    const testFontSize = 100;
    ctx.font = `bold ${testFontSize}px ${this.labelFontFamily}`;
    const widthPart1 = ctx.measureText(part1).width;
    ctx.font = `${testFontSize}px ${this.labelFontFamily}`;
    const widthPart2 = ctx.measureText(part2).width;
    
    const totalMeasuredWidth = widthPart1 + widthPart2;
    const scaledFontSize = (targetWidth / totalMeasuredWidth) * testFontSize;

    // 2. Setup Animation Positioning
    const logoX = this.makeLabLogoAnimated.x;
    const logoY = this.makeLabLogoAnimated.y;
    const logoHeight = this.makeLabLogoAnimated.height;
    
    const slideOffset = scaledFontSize * 0.4;
    const targetY = logoY + logoHeight + this.labelGap + scaledFontSize;
    const currentY = lerp(targetY + slideOffset, targetY, easedProgress);

    // 3. Draw
    ctx.globalAlpha = easedProgress;
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = this.labelColor;

    // Draw Part 1: Bold
    ctx.font = `bold ${scaledFontSize}px ${this.labelFontFamily}`;
    ctx.textAlign = 'left';
    ctx.fillText(part1, logoX, currentY);

    // Draw Part 2: Regular
    const part1ActualWidth = ctx.measureText(part1).width;
    ctx.font = `${scaledFontSize}px ${this.labelFontFamily}`;
    ctx.fillText(part2, logoX + part1ActualWidth, currentY);

    ctx.restore();
  }
}