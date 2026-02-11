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

    // Enable label on both logos so height/centering calculations are consistent.
    // The target logo is invisible so its label won't render; only the animated
    // logo's label is drawn (with animation via _drawAnimatedLabel).
    this.makeLabLogo.isLabelVisible = true;
    this.makeLabLogoAnimated.isLabelVisible = true;

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

    // --- L outline animation ---
    /**
     * Controls when the L outline starts fading in, as a fraction of the
     * overall animation. E.g., 0.85 means it begins at 85% progress.
     * @type {number}
     */
    this.lOutlineAppearThreshold = 0.85;

    // --- Label animation ---
    /** 
     * Controls when the label starts fading in, as a fraction of the overall
     * animation. E.g., 0.7 means the label begins appearing at 70% progress. 
     * @type {number} 
     */
    this.labelAppearThreshold = 0.7;

    /**
     * The vertical slide distance (in label-font-size fractions) the label
     * travels during its entrance animation.
     * @type {number}
     */
    this.labelSlideDistanceFraction = 0.4;
  }

  // --- Getters ---

  /**
   * Gets the final assembled height of the logo (including the label if visible).
   * @returns {number}
   */
  get finalHeight(){ return this.makeLabLogo.height; }

  /**
   * Gets the final assembled width of the logo.
   * @returns {number}
   */
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
   * 1. Animates the L outline opacity (fades in after lOutlineAppearThreshold).
   * 2. Interpolates the position, angle, and size of each triangle from their
   *    original random locations to their final static positions.
   * 3. Interpolates the color of each triangle from the start colors to their
   *    original colors.
   */
  update(lerpAmt){
    if (this.originalRandomTriLocs.length === 0) return;

    // Apply easing to spatial properties
    const t = this.easingFunction(lerpAmt);

    // --- L outline: fade in after threshold ---
    if (lerpAmt >= this.lOutlineAppearThreshold) {
      this.makeLabLogoAnimated.isLOutlineVisible = true;
      const lOutlineProgress = Math.min(
        (lerpAmt - this.lOutlineAppearThreshold) / (1 - this.lOutlineAppearThreshold),
        1
      );
      this.makeLabLogoAnimated.lOutlineOpacity = this.easingFunction(lOutlineProgress);
    } else {
      this.makeLabLogoAnimated.isLOutlineVisible = false;
      this.makeLabLogoAnimated.lOutlineOpacity = 0;
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
   * The base class draw() handles triangles and outlines (with opacity).
   * The animated logo's label is drawn separately with fade-in and slide-up effects.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   */
  draw(ctx){
    // Draw the static target logo (invisible by default, but respects .visible)
    this.makeLabLogo.draw(ctx);

    // Draw the animated logo — but suppress its label so we can draw it
    // ourselves with animation effects via _drawAnimatedLabel
    const savedLabelVisible = this.makeLabLogoAnimated.isLabelVisible;
    this.makeLabLogoAnimated.isLabelVisible = false;
    this.makeLabLogoAnimated.draw(ctx);
    this.makeLabLogoAnimated.isLabelVisible = savedLabelVisible;

    // Draw the animated label with fade-in / slide-up
    if (savedLabelVisible) {
      this._drawAnimatedLabel(ctx);
    }
  }

  /**
   * Draws the label with a fade-in and slide-up animation. Delegates the actual
   * text rendering to the base class's drawLabel(), passing animated opacity and
   * yOffset values.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @private
   */
  _drawAnimatedLabel(ctx) {
    const lerpAmt = this._currentLerpAmt ?? 0;
    if (lerpAmt <= this.labelAppearThreshold) return;

    // Compute animation progress within the label's appearance window
    const labelProgress = Math.min(
      (lerpAmt - this.labelAppearThreshold) / (1 - this.labelAppearThreshold),
      1
    );
    const easedProgress = this.easingFunction(labelProgress);

    // Slide-up: starts offset downward, eases to 0
    const fontSize = this.makeLabLogoAnimated.labelFontSize;
    const slideOffset = fontSize * this.labelSlideDistanceFraction * (1 - easedProgress);

    this.makeLabLogoAnimated.drawLabel(ctx, {
      opacity: easedProgress,
      yOffset: slideOffset
    });
  }
}