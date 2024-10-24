import { LineSegment } from '../graphics/line-segment.js';

export class MakeabilityLabLogo {

  constructor(x, y, triangleSize) {

    // The Makeability Lab logo is composed of 6 columns and 4 rows of square cells
    // Each cell is composed of two triangles, which can be in different orientations
    this.makeLabLogoArray = MakeabilityLabLogo.createMakeabilityLabLogoCellArray(x, y, triangleSize);

    this.visible = true;
    this.isMOutlineVisible = true;
    this.isLOutlineVisible = true;
    this.mOutlineColor = 'black';
    this.mOutlineStrokeWidth = 4;
    this.lOutlineColor = 'black';
    this.lOutlineStrokeWidth = 4;
    this.setColors('white', 'black');
    this.setFillColorsToDefault();

    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = tri.strokeColor;
    }

    //this.setColorScheme(ColorScheme.BlackOnWhite);
    this.areLTriangleStrokesVisible = false;

    this.drawBoundingBox = false;
  }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numRows() { return 4; }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numCols() { return 6; }

  /**
   * Calculates the width of the MakeabilityLabLogo based on the size of the triangles.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @returns {number} The total width of the MakeabilityLabLogo.
   */
  static getWidth(triangleSize){
    return MakeabilityLabLogo.numCols * triangleSize;
  }

  /**
   * Calculates the height of the MakeabilityLabLogo based on the size of the triangles.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @returns {number} The total height of the logo.
   */
  static getHeight(triangleSize){
    return MakeabilityLabLogo.numRows * triangleSize;
  }

  /**
   * Calculates the X center position for the MakeabilityLabLogo on a canvas.
   *
   * @param {number} triangleSize - The size of the triangle used in the logo.
   * @param {number} canvasWidth - The width of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.a   * @returns {number} The X center position, optionally aligned to the grid.n(xCent on the given width.
   *
   * @param {number} logoWidth - The width of the logo.
   */
  static getXCenterPosition(triangleSize, canvasWidth, alignToGrid = false){
    const xCenter = (canvasWidth - MakeabilityLabLogo.getWidth(triangleSize)) / 2;
    
    if(alignToGrid){
      return Math.round(xCenter / triangleSize) * triangleSize;
    }else{
      return xCenter;
    } 
  }

  /**
   * Calculates the y-coordinate for centering the MakeabilityLabLogo on the canvas.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @param {number} canvasHeight - The width of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the center position to the grid.a   * @returns {number} The X center position, optionally aligned to the grid.n(xCent on the given width.
   *
   * @returns {number} The y-coordinate for centering the logo.
   */
  static getYCenterPosition(triangleSize, canvasHeight, alignToGrid=false){
    const yCenter = (canvasHeight - MakeabilityLabLogo.getHeight(triangleSize)) / 2;
    
    if(alignToGrid){
      return Math.round(yCenter / triangleSize) * triangleSize;
    }else{
      return yCenter;
    }
  }

  /**
   * Sets the draw debug information flag for the logo and its components.
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawBoundingBox = drawDebugInfo;
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        this.makeLabLogoArray[row][col].setDrawDebugInfo(drawDebugInfo);
      }
    }
  }

  /**
   * Calculates the bounding box for the logo dynamically that encompasses all triangles.
   * Keeps track of which triangles contribute to the minX, minY, maxX, and maxY values.
   *
   * @returns {Object} An object representing the bounding box with the following properties:
   * - `x` {number}: The minimum x-coordinate of the bounding box.
   * - `y` {number}: The minimum y-coordinate of the bounding box.
   * - `width` {number}: The width of the bounding box.
   * - `height` {number}: The height of the bounding box.
   * - `minXTriangle` {Triangle}: The triangle contributing to the minimum x-coordinate.
   * - `minYTriangle` {Triangle}: The triangle contributing to the minimum y-coordinate.
   * - `maxXTriangle` {Triangle}: The triangle contributing to the maximum x-coordinate.
   * - `maxYTriangle` {Triangle}: The triangle contributing to the maximum y-coordinate.
   */
  getBoundingBox() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    let minXTriangle = null;
    let minYTriangle = null;
    let maxXTriangle = null;
    let maxYTriangle = null;

    for (const tri of this.getAllTriangles()) {
      if (!tri.visible){ continue; }

      const triBoundingBox = tri.getBoundingBox();
      
      // Update minX and minY
      if (triBoundingBox.x < minX) {
        minX = triBoundingBox.x;
        minXTriangle = tri;
      }
      if (triBoundingBox.y < minY) {
        minY = triBoundingBox.y;
        minYTriangle = tri;
      }
      
      // Update maxX and maxY
      if (triBoundingBox.x + triBoundingBox.width > maxX) {
        maxX = triBoundingBox.x + triBoundingBox.width;
        maxXTriangle = tri;
      }
      if (triBoundingBox.y + triBoundingBox.height > maxY) {
        maxY = triBoundingBox.y + triBoundingBox.height;
        maxYTriangle = tri;
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      minXTriangle,
      minYTriangle,
      maxXTriangle,
      maxYTriangle
    };
  }


  /**
   * Gets the far left x-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The x-coordinate of the first element.
   */
  get x(){ return this.makeLabLogoArray[0][0].x }
  
  /**
   * Sets the x-coordinate for the logo by adjusting the coordinates 
   * of all triangles accordingly
   * 
   * @param {number} x - The new x-coordinate to set.
   */
  set x(x){
    const xOffset = x - this.x;
    for(const tri of this.getAllTriangles()){
      tri.x += xOffset;
    }
  }

  /**
   * Gets the top y-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The y-coordinate of the first element.
   */
  get y(){ return this.makeLabLogoArray[0][0].y }

  /**
   * Sets the y-coordinate for the logo and adjusts the y-coordinates of all 
   * triangles accordingly.
   * 
   * @param {number} y - The new y-coordinate to set.
   */
  set y(y){ 
    const yOffset = y - this.y;
    for(const tri of this.getAllTriangles()){
      tri.y += yOffset;
    }
  }

  /**
   * Gets the size of a cell in the Makeability Lab logo
   * Each cell is composed of two triangles
   * 
   * @returns {number} The size of the cell.
   */
  get cellSize(){ return this.makeLabLogoArray[0][0].size }

  /**
   * Gets the width of the Makeability Lab logo
   *
   * @returns {number} The width of the Makeability Lab logo.
   */
  get width(){ return MakeabilityLabLogo.numCols * this.makeLabLogoArray[0][0].size }

  /**
   * Gets the height of the MakeabilityLab logo.
   * The height is calculated as the number of rows in the logo multiplied by the size of the first element in the logo array.
   * 
   * @returns {number} The height of the MakeabilityLab logo.
   */
  get height(){ return MakeabilityLabLogo.numRows * this.makeLabLogoArray[0][0].size }

  /**
   * Getter for the default colors state.
   * 
   * @returns {boolean} - Returns true if the default colors are on, otherwise false.
   */
  get areDefaultColorsOn(){ return this._defaultColorsOn; }

  /**
   * Adjusts the logo size to fit within the given canvas dimensions.
   * Optionally aligns the logo to a grid.
   *
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - If true, aligns the logo to the grid.
   */ 
  fitToCanvas(canvasWidth, canvasHeight, alignToGrid=false){
    // Maximize the logo size to fit the canvas
    // If alignToGrid is true, the logo will be aligned to the grid
    let adjustedHeight = canvasHeight - 2;
    if (this.isLOutlineVisible){
      adjustedHeight -= this.lOutlineStrokeWidth / 2.0;
    }
    if(this.isMOutlineVisible){
      adjustedHeight -= this.mOutlineStrokeWidth / 2.0;
    }
    const triangleSize = Math.min(canvasWidth / MakeabilityLabLogo.numCols, adjustedHeight / MakeabilityLabLogo.numRows);
    this.setTriangleSize(triangleSize);
    this.centerLogo(canvasWidth, canvasHeight, alignToGrid);
  }

  /**
   * Centers the logo on the canvas.
   *
   * @param {number} canvasWidth - The width of the canvas.
   * @param {number} canvasHeight - The height of the canvas.
   * @param {boolean} [alignToGrid=false] - Whether to align the logo to the grid.
   */
  centerLogo(canvasWidth, canvasHeight, alignToGrid=false){
    const xCenter = MakeabilityLabLogo.getXCenterPosition(this.cellSize, canvasWidth, alignToGrid);
    const yCenter = MakeabilityLabLogo.getYCenterPosition(this.cellSize, canvasHeight, alignToGrid);
    this.setLogoPosition(xCenter, yCenter);
  }

  /**
   * Sets the size of the logo based on the given width.
   *
   * @param {number} logoWidth - The width of the logo.
   */
  setLogoSize(logoWidth){
    const triangleSize = logoWidth / MakeabilityLabLogo.numCols;
    this.setTriangleSize(triangleSize);
  }

  /**
   * Sets the size of all triangles to the specified value.
   *
   * @param {number} triangleSize - The new size to set for all triangles.
   */
  setTriangleSize(triangleSize){
    const makeLabLogoNewSize = new MakeabilityLabLogo(this.x, this.y, triangleSize);
    const newTriangles = makeLabLogoNewSize.getAllTriangles();
    const allTriangles = this.getAllTriangles();
    for (let i = 0; i < allTriangles.length; i++) {
      allTriangles[i].x = newTriangles[i].x;
      allTriangles[i].y = newTriangles[i].y;
      allTriangles[i].size = newTriangles[i].size;
    }
  }

  /**
   * Sets the position of the logo by adjusting the coordinates of all triangles.
   *
   * @param {number} x - The new x-coordinate for the logo.
   * @param {number} y - The new y-coordinate for the logo.
   */
  setLogoPosition(x, y){
    const xOffset = x - this.x;
    const yOffset = y - this.y;
    for(const tri of this.getAllTriangles()){
      tri.x += xOffset;
      tri.y += yOffset;
    }
  }

  /**
   * Sets the visibility of the strokes for the L outline in the Makeability Lab logo
   * 
   * @param {boolean} visible - A boolean indicating whether the strokes should be visible.
   */
  set areLTriangleStrokesVisible(visible){ 
    for(const tri of this.getLTriangles()){
      tri.isStrokeVisible = visible;
    }
  }
  
  /**
   * Returns true of the L strokes are visible, otherwise false.
   * 
   * @returns {boolean} True if all L-shaped triangle strokes are visible, otherwise false.
   */
  get areLTriangleStrokesVisible(){
    let visible = true;
    for(const tri of this.getLTriangles()){
      visible &= tri.isStrokeVisible;
    }
    return visible;
  }

  /**
   * Sets the stroke color for all L-shaped triangles.
   *
   * @param {string} color - The color to set as the stroke color for the triangles.
   */
  setLTriangleStrokeColor(color){
    for(const tri of this.getLTriangles()){
      tri.strokeColor = color;
    }
  }

  /**
   * Sets the fill color for all MShadow triangles.
   *
   * @param {string} color - The color to set for the fill of the MShadow triangles.
   */
  setMShadowTriangleFillColor(color){
    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = color;
    }
  }

  /**
   * Sets the stroke visibility for all triangles.
   *
   * @param {boolean} isTransparent - If true, the stroke will be made transparent (invisible).
   * @param {boolean} [includeMShadowTriangles=true] - If true, includes M shadow triangles in the operation.
   */
  setStrokeTransparent(isTransparent, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.isStrokeVisible = !isTransparent;
    }
  }

  /**
   * Sets the internal triangles to transparent
   * @param {Boolean} isTransparent 
   * @param {Boolean} includeMShadowTriangles 
   */
  setFillTransparent(isTransparent, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.isFillVisible = !isTransparent;
    }
  }

  /**
   * Sets the fill color for all triangles in the logo.
   *
   * @param {string} color - The color to set as the fill color for the triangles.
   */
  setFillColor(color, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.fillColor = color;
    }
  }

  /**
   * Convenience method to set fill and stroke colors
   * @param {*} fillColor 
   * @param {*} strokeColor 
   */
  setColors(fillColor, strokeColor, includeMShadowTriangles=true){
    for (const tri of this.getAllTriangles(includeMShadowTriangles)) {
      tri.fillColor = fillColor;
      tri.strokeColor = strokeColor;
    }
  }

  /**
   * Retrieves all triangles from the Makeability Lab logo array.
   * The M shadow triangles are the two dark triangles on the bottom left and right
   * side of the logo
   * 
   * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles in the result.
   * @returns {Array} An array containing all the triangles from the Makeability Lab logo.
   */
  getAllTriangles(includeMShadowTriangles=true, includeLTriangles=true){
    let allTriangles = new Array();
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        if ((includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 1)) &&
            (includeLTriangles || !MakeabilityLabLogo.isLTriangle(row, col, 1))) {
            allTriangles.push(this.makeLabLogoArray[row][col].tri1);
        }

        if ((includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 2)) &&
            (includeLTriangles || !MakeabilityLabLogo.isLTriangle(row, col, 2))) {
            allTriangles.push(this.makeLabLogoArray[row][col].tri2);
        }
      }
    }  
    return allTriangles;
  }

  /**
   * Gets the triangles that are part of the M "shadow". That is, the 
   * black/darkened parts of the M logo
   *
   * @returns {Array} An array containing the selected triangles.
   */
  getMShadowTriangles(){
    let mShadowTriangles = new Array();
    
    // left side
    mShadowTriangles.push(this.makeLabLogoArray[2][1].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][1].tri1);
    
    // right side
    mShadowTriangles.push(this.makeLabLogoArray[2][4].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][4].tri1);

    return mShadowTriangles;
  }

  /**
   * Gets the triangles that compose the L in the Makeability Lab logo
   *
   * @returns {Array} An array containing the selected triangles.
   */
  getLTriangles(){
    let lTriangles = new Array();
    lTriangles.push(this.makeLabLogoArray[0][0].tri2);
    lTriangles.push(this.makeLabLogoArray[0][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][0].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][2].tri2);
    lTriangles.push(this.makeLabLogoArray[2][1].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri2);
    lTriangles.push(this.makeLabLogoArray[3][2].tri1);
    lTriangles.push(this.makeLabLogoArray[3][3].tri1);

    lTriangles.push(this.makeLabLogoArray[2][3].tri1);
    lTriangles.push(this.makeLabLogoArray[2][3].tri2);

    lTriangles.push(this.makeLabLogoArray[1][3].tri2);
    lTriangles.push(this.makeLabLogoArray[2][4].tri1);
    lTriangles.push(this.makeLabLogoArray[1][4].tri2);
    return lTriangles;
  }

  /**
   * Gets the triangles that are colored in the ML logo by default
   *
   * @returns {Array} An array containing the default colored triangles.
   */
  getDefaultColoredTriangles(){
    let cTriangles = new Array();
    cTriangles.push(this.makeLabLogoArray[0][4].tri2);
    cTriangles.push(this.makeLabLogoArray[0][5].tri2);
    cTriangles.push(this.makeLabLogoArray[1][0].tri2);
    cTriangles.push(this.makeLabLogoArray[1][4].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri2);
    cTriangles.push(this.makeLabLogoArray[2][0].tri1);
    cTriangles.push(this.makeLabLogoArray[2][0].tri2);
    cTriangles.push(this.makeLabLogoArray[2][5].tri1);
    cTriangles.push(this.makeLabLogoArray[2][5].tri2);
    cTriangles.push(this.makeLabLogoArray[3][0].tri1);
    cTriangles.push(this.makeLabLogoArray[3][5].tri1);
    return cTriangles;
  }

  /**
   * Sets the default colors for the logo.
   */
  setFillColorsToDefault(){
    this.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
  }

  /**
   * Sets the default fill color for the colored triangles.
   * 
   * @param {(string|string[])} fillColorOrColorArray - A single color string or an 
   * array of color strings to set as the fill color(s) for the triangles.
   */
  setDefaultColoredTrianglesFillColor(fillColorOrColorArray){
    const cTriangles = this.getDefaultColoredTriangles();
    if(Array.isArray(fillColorOrColorArray)){
      for(let i=0; i<cTriangles.length; i++){
        cTriangles[i].fillColor = fillColorOrColorArray[i];
      }
    }else{
      for(let i=0; i<cTriangles.length; i++){
        cTriangles[i].fillColor = fillColorOrColorArray;
      }
    }
  }

  /**
   * Sets the stroke width for all triangles.
   *
   * @param {number} strokeWidth - The width of the stroke to set.
   * @param {boolean} [includeMShadowTriangles=true] - Whether to include M shadow triangles.
   * @param {boolean} [includeLTriangles=true] - Whether to include L triangles.
   */
  setStrokeWidth(strokeWidth, includeMShadowTriangles=true, includeLTriangles=true, ){
    for(const tri of this.getAllTriangles(includeMShadowTriangles, includeLTriangles)){
      tri.strokeWidth = strokeWidth;
    }
  }

  /**
   * Draws the Makeability Lab logo and its outlines if they are visible.
   * 
   * This method performs the following actions:
   * 1. Checks if the logo is visible; if not, it returns immediately.
   * 2. Iterates through the `makeLabLogoArray` and calls the `draw` method on each element.
   * 3. If the M outline is visible, it draws the M outline using the specified color and stroke width.
   * 4. If the L outline is visible, it draws the L outline using the specified color and stroke width.
   */
  draw(ctx) {
    if(!this.visible){ return; }

    if(this.drawBoundingBox){
      // for debugging
      const bBox = this.getBoundingBox();
      ctx.save();
      ctx.setLineDash([4, 8]); // Dots of 3 pixel, gaps of 4 pixels
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.strokeRect(bBox.x, bBox.y, bBox.width, bBox.height);
      ctx.restore();

      bBox.minXTriangle.visible = true;
      bBox.maxXTriangle.visible = true;
      bBox.minYTriangle.visible = true;
      bBox.maxYTriangle.visible = true;

      bBox.minXTriangle.fillColor = 'green';
      bBox.maxXTriangle.fillColor = 'blue';
      bBox.minYTriangle.fillColor = 'red';
      bBox.maxYTriangle.fillColor = 'orange';

      // set text properties
      ctx.fillStyle = 'black';
      ctx.font = '16px Arial';

      // show width and height of bounding box
      const boundingBoxDimensionsText = `Bounding Box Dimensions: ${bBox.width.toFixed(1)} x ${bBox.height.toFixed(1)}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(boundingBoxDimensionsText, bBox.x + bBox.width / 2, bBox.y);

      // measure and draw bounding box width centered at the top
      const widthText = `Width: ${bBox.width.toFixed(1)}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(widthText, bBox.x + bBox.width / 2, bBox.y + bBox.height + 2);

      // measure and draw bounding box height rotated 90 degrees and centered vertically
      const heightText = `Height: ${bBox.height.toFixed(1)}`;
      ctx.save();
      ctx.translate(bBox.x - 1, bBox.y + bBox.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(heightText, 0, 0);
      ctx.restore();
    }

    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
          this.makeLabLogoArray[row][col].draw(ctx);
      }
    }

    if(this.isMOutlineVisible){
      ctx.save();
      ctx.strokeStyle = this.mOutlineColor;
      ctx.lineWidth = this.mOutlineStrokeWidth;
      ctx.beginPath();
      let mPoints = this.getMOutlinePoints();
      for (const [x, y] of mPoints) {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    if(this.isLOutlineVisible){
      ctx.save();
      ctx.strokeStyle = this.lOutlineColor;
      ctx.lineWidth = this.lOutlineStrokeWidth;
      ctx.beginPath();
      let lPoints = this.getLOutlinePoints();
      for (const [x, y] of lPoints) {
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    
  }

  /**
   * 
   * @returns gets the L outline as an array of line segments
   */
  getLOutlineLineSegments(){
    let lLineSegments = new Array();
    
    lLineSegments.push(new LineSegment(this.x + this.cellSize, this.y, 
      this.x + 3 * this.cellSize, this.y + 2 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, 
      this.y + 2 * this.cellSize, this.x + 4 * this.cellSize, this.y + this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 4 * this.cellSize, this.y + this.cellSize,
      this.x + 5 * this.cellSize, this.y + 2 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y + 2 * this.cellSize,
      this.x + 3 * this.cellSize, this.y + 4 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 4 * this.cellSize,
      this.x, this.y + 1 * this.cellSize));
    lLineSegments.push(new LineSegment(this.x, this.y + this.cellSize,
      this.x + this.cellSize, this.y));

    return lLineSegments;
  }

  /**
   * 
   * @returns Gets the L outline as an array of points (each point is [x, y])
   */
  getLOutlinePoints(){
    let lPoints = new Array();

    // Top part
    lPoints.push([this.x, this.y + this.cellSize]);
    lPoints.push([this.x + this.cellSize, this.y]);
    lPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);

    // Right side
    lPoints.push([this.x + 5 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    lPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 1 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);

    return lPoints
  }

  /**
   * 
   * @returns gets the M outline as an array of line segments
   */
   getMOutlineLineSegments(){
    let mLineSegments = new Array();
    
    mLineSegments.push(new LineSegment(this.x + this.cellSize, this.y, 
      this.x + 3 * this.cellSize, this.y + 2 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 2 * this.cellSize, 
      this.x + 5 * this.cellSize, this.y));

    mLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y, 
      this.x + 6 * this.cellSize, this.y + this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 6 * this.cellSize, this.y + this.cellSize, 
      this.x + 6 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 6 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + 5 * this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 5 * this.cellSize, this.y + 4 * this.cellSize, 
      this.x + 4 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 4 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + 3 * this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 3 * this.cellSize, this.y + 4 * this.cellSize, 
      this.x + 2 * this.cellSize, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + 2 * this.cellSize, this.y + 3 * this.cellSize, 
      this.x + this.cellSize, this.y + 4 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x + this.cellSize, this.y + 4 * this.cellSize, 
      this.x, this.y + 3 * this.cellSize));

    mLineSegments.push(new LineSegment(this.x, this.y + 3 * this.cellSize, 
      this.x, this.y + this.cellSize));

    mLineSegments.push(new LineSegment(this.x, this.y + this.cellSize, 
      this.x + this.cellSize, this.y));

    return mLineSegments;
  }

  /**
   * 
   * @returns Gets the M outline as an array of points (each point is [x, y])
   */
  getMOutlinePoints(){
    let mPoints = new Array();

    // Top part
    mPoints.push([this.x, this.y + this.cellSize]);
    mPoints.push([this.x + this.cellSize, this.y]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + this.cellSize]);

    // Right part
    mPoints.push([this.x + 6 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    mPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 1 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 3 * this.cellSize]);

    // Left part
    mPoints.push([this.x + 0 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);
   
    return mPoints;
  }

  static setRandomColors(triangles, isFillVisible=true, isStrokeVisible=true){
    for(const tri of triangles){
      const fillColor = MakeabilityLabLogoColorer.getRandomOriginalColor();
      tri.fillColor = fillColor;
      tri.startFillColor = fillColor;
      tri.endFillColor = fillColor;
      tri.strokeColor = fillColor;
      tri.isFillVisible = isFillVisible;
      tri.isStrokeVisible = isStrokeVisible;
    }
  }

  static setColors(triangles, fillColor, strokeColor, isFillVisible=true, isStrokeVisible=true){
    for(const tri of triangles){
      tri.fillColor = fillColor;
      tri.startFillColor = fillColor;
      tri.endFillColor = fillColor;
      tri.strokeColor = strokeColor;
      tri.isFillVisible = isFillVisible;
      tri.isStrokeVisible = isStrokeVisible;
    }
  }

  static createMakeabilityLabLogoCellArray(x, y, triangleSize) {
    let mlLogo = new Array(MakeabilityLabLogo.numRows);

    // Initialize the make lab logo grid
    for (let row = 0; row < mlLogo.length; row++) {
      mlLogo[row] = new Array(MakeabilityLabLogo.numCols);
    }

    mlLogo[0] = MakeabilityLabLogo.createMakeabilityLabTopRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[1] = MakeabilityLabLogo.createMakeabilityLab2ndRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[2] = MakeabilityLabLogo.createMakeabilityLab3rdRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[3] = MakeabilityLabLogo.createMakeabilityLabBottomRow(x, y, triangleSize);

    return mlLogo;
  }

  static createMakeabilityLabTopRow(x, y, triangleSize) {
    let topRow = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize, TriangleDir.TopLeft);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize, TriangleDir.TopRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    return topRow;
  }

  static createMakeabilityLab2ndRow(x, y, triangleSize) {
    let row2 = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    return row2;
  }

  static createMakeabilityLab3rdRow(x, y, triangleSize) {
    let row3 = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < row3.length; col++) {
      let triDir = TriangleDir.TopLeft;
      if (col % 2 != 0) {
        triDir = TriangleDir.TopRight;
      }
      row3[col] = Cell.createCell(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return row3;
  }

  static createMakeabilityLabBottomRow(x, y, triangleSize) {
    let botRow = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < botRow.length; col++) {
      let triDir = TriangleDir.TopRight;
      if (col % 2 != 0) {
        triDir = TriangleDir.TopLeft;
      }
      botRow[col] = Cell.createCellWithTopTriangleOnly(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return botRow;
  }

  /**
   * Determines if the given row, column, and triangle number correspond to an M shadow triangle.
   * See getMShadowTriangles() for more information.
   * 
   * @param {number} row - The row number to check.
   * @param {number} col - The column number to check.
   * @param {number} triNum - The triangle number to check.
   * @returns {boolean} - Returns true if the specified row, column, and triangle number 
   * form an M shadow triangle, otherwise false.
   */
  static isMShadowTriangle(row, col, triNum){
    return (row == 2 && col == 1 && triNum == 2) ||
          (row == 3 && col == 1 && triNum == 1) ||
          (row == 2 && col == 4 && triNum == 2) ||
          (row == 3 && col == 4 && triNum == 1);
  }

  /**
   * Determines if the specified row, column, and triangle number correspond to a 
   * triangle used in the L in the Makeability Lab logo
   * See getLTriangles() for more information.
   *
   * @param {number} row - The row index.
   * @param {number} col - The column index.
   * @param {number} triNum - The triangle number.
   * @returns {boolean} - Returns true if the specified row, column, and triangle number 
   *   correspond to an L-shaped triangle; otherwise, false.
   */
  static isLTriangle(row, col, triNum) {
    return (row == 0 && col == 0 && triNum == 2) ||
           (row == 0 && col == 1 && triNum == 2) ||
           (row == 1 && col == 0 && triNum == 1) ||
           (row == 1 && col == 1 && triNum == 1) ||
           (row == 1 && col == 1 && triNum == 2) ||
           (row == 1 && col == 2 && triNum == 2) ||
           (row == 2 && col == 1 && triNum == 1) ||
           (row == 2 && col == 2 && triNum == 1) ||
           (row == 2 && col == 2 && triNum == 2) ||
           (row == 3 && col == 2 && triNum == 1) ||
           (row == 3 && col == 3 && triNum == 1) ||
           (row == 2 && col == 3 && triNum == 1) ||
           (row == 2 && col == 3 && triNum == 2) ||
           (row == 1 && col == 3 && triNum == 2) ||
           (row == 2 && col == 4 && triNum == 1) ||
           (row == 1 && col == 4 && triNum == 2);
  }

}

export const TriangleDir = {
  TopLeft: 'TopLeft',
  TopRight: 'TopRight',
  BottomLeft: 'BottomLeft',
  BottomRight: 'BottomRight'
};

export class Cell {
  /**
   * Creates an instance of the class with two triangles.
   * @constructor
   * @param {Object} triangle1 - The first triangle object.
   * @param {Object} triangle2 - The second triangle object.
   */
  constructor(triangle1, triangle2) {
    this.tri1 = triangle1;
    this.tri2 = triangle2;

    this.drawBoundingBox = false; // for debugging
  }

  /**
   * Sets the draw debug information flag for this cell
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawBoundingBox = drawDebugInfo;
    this.tri1.setDrawDebugInfo(drawDebugInfo);
    this.tri2.setDrawDebugInfo(drawDebugInfo);
  }

  /**
   * Gets the x-coordinate of the cell
   * @returns {number} The x-coordinate of the cell.
   */
  get x() {
    return this.tri1.x;
  }

  /**
   * Sets the x-coordinate for the cell
   * 
   * @param {number} x - The x-coordinate to set.
   */
  set x(x){
    this.tri1.x = x;
    this.tri2.x = x;
  }

  /**
   * Gets the y-coordinate of the cell
   * @returns {number} The y-coordinate of the cell.
   */
  get y() {
    return this.tri1.y;
  }

  /**
   * Sets the y-coordinate for the cell
   * 
   * @param {number} y - The y-coordinate to set.
   */
  set y(y){
    this.tri1.y = y;
    this.tri2.y = y;
  }

  /**
   * Gets the size of the cell. Cells are always square.
   * @type {number}
   */
  get size() {
    return this.tri1.size;
  }

  /**
   * Sets the size of the cell.
   * 
   * @param {number} size - The size to set for the cell.
   */
  set size(size){
    this.tri1.size = size;
    this.tri2.size = size;
  }


  /**
   * Sets the fill and stroke colors for the cell.
   *
   * @param {string} fillColor - The color to be used for filling.
   * @param {string} [strokeColor] - The color to be used for the stroke. 
   *    If not provided, the fillColor will be used as the stroke color.
   */
  setColors(fillColor, strokeColor){
    this.setFillColor(fillColor);

    if(strokeColor){
      this.setStrokeColor(strokeColor);
    }else{
      this.setStrokeColor(fillColor);
    }
  }

  /**
   * Sets the fill color for the cell.
   * 
   * @param {string} fillColor - The fill color
   */
  setFillColor(fillColor){
    this.tri1.fillColor = fillColor;
    this.tri2.fillColor = fillColor;
  }

  /**
   * Sets the stroke width for the logo's triangles.
   *
   * @param {number} strokeWidth - The width of the stroke to be applied to the triangles.
   */
  setStrokeWidth(strokeWidth){
    this.tri1.strokeWidth = strokeWidth;
    this.tri2.strokeWidth = strokeWidth;
  }

  /**
   * Sets the stroke color for the cell.
   * 
   * @param {string} strokeColor - The stroke color
   */
  setStrokeColor(strokeColor){
    this.tri1.strokeColor = strokeColor;
    this.tri2.strokeColor = strokeColor;
  }

  /**
   * Sets the visibility of the cell
   *
   * @param {boolean} isVisible - A boolean indicating whether the cell is visible
   */
  setVisibility(isVisible){
    this.tri1.visible = isVisible;
    this.tri2.visible = isVisible;
  }

  getBoundingBox() {
    const tri1BoundingBox = this.tri1.getBoundingBox();
    const tri2BoundingBox = this.tri2.getBoundingBox();
  
    if (this.tri1.visible){
      return this.tri1.getBoundingBox();
    }else{
      return this.tri2.getBoundingBox();
    }
  }

  /**
   * Draws the cells on the canvas
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    if (this.tri1.visible) {
      this.tri1.draw(ctx);
    }

    if (this.tri2.visible) {
      this.tri2.draw(ctx);
    }

    ctx.save();
    if (this.drawBoundingBox){
      const boundingBox = this.getBoundingBox();
      ctx.setLineDash([3, 4]); // Dots of 3 pixel, gaps of 4 pixels
      ctx.strokeStyle = 'rgba(0, 0, 240, 0.5)';
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    }
    ctx.restore();
  }

  /**
   * Creates an empty cell with two invisible triangles.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {TriangleDir} [topTriangleDir=TriangleDir.TopLeft] - The direction of the top triangle.
   * @returns {Cell} A new cell containing two invisible triangles.
   */
  static createEmptyCell(x, y, size, topTriangleDir=TriangleDir.TopLeft) {
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri1.visible = false;
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  /**
   * Creates a cell with only the top triangle visible.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {string} topTriangleDir - The direction of the top triangle. See TriangleDir for possible values.
   * @returns {Cell} A cell object with the top triangle visible and the bottom triangle hidden.
   */
  static createCellWithTopTriangleOnly(x, y, size, topTriangleDir) {
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  /**
   * Creates a cell with only the bottom triangle visible.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {string} botTriangleDir - The direction of the bottom triangle. See TriangleDir for possible values.
   * @returns {Cell} A new cell with the specified bottom triangle.
   */
  static createCellWithBottomTriangleOnly(x, y, size, botTriangleDir) {
    let tri1 = new Triangle(x, y, size, Triangle.getOppositeDirection(botTriangleDir));
    let tri2 = new Triangle(x, y, size, botTriangleDir);
    tri1.visible = false;
    return new Cell(tri1, tri2);
  }

  /**
   * Creates a cell composed of two triangles.
   *
   * @param {number} x - The x-coordinate of the cell.
   * @param {number} y - The y-coordinate of the cell.
   * @param {number} size - The size of the triangles.
   * @param {string} triangle1Dir - The direction of the first triangle. See TriangleDir for possible values.
   * @param {string} [triangle2Dir] - The direction of the second triangle. If not provided, it will be the opposite of the first triangle's direction.
   * @returns {Cell} A new cell composed of two triangles.
   */
  static createCell(x, y, size, triangle1Dir, triangle2Dir) {
    let tri1 = new Triangle(x, y, size, triangle1Dir);

    if (!triangle2Dir) {
      triangle2Dir = Triangle.getOppositeDirection(triangle1Dir);
    }
    let tri2 = new Triangle(x, y, size, triangle2Dir);
    return new Cell(tri1, tri2);
  }
}

export class Triangle {
  /**
   * Creates an instance of the triangle.
   * 
   * @constructor
   * @param {number} x - The x-coordinate of the triangle.
   * @param {number} y - The y-coordinate of the triangle.
   * @param {number} size - The size of the equilateral triangle.
   * @param {string} direction - The direction of the triangle. See TriangleDir for possible values.
   * @param {p5.Color} [fillColor='white'] - The fill color of the triangle.
   * @param {p5.Color} [strokeColor='black'] - The stroke color of the triangle.
   * @param {number} [strokeWidth=1] - The stroke width of the triangle.
   * @param {boolean} [visible=true] - The visibility of the triangle.
   */
  constructor(x, y, size, direction, fillColor = 'white',
    strokeColor = 'black', strokeWidth = 1, visible = true) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = direction;
    this.angle = 0;

    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWidth = strokeWidth;
    this.visible = visible;

    this.isFillVisible = true;
    this.isStrokeVisible = true;

    this.drawCellOutline = false; // for debugging
    this.drawBoundingBox = false; // for debugging
  }

  /**
   * Sets the draw debug information flag for this triangle
   *
   * @param {boolean} drawDebugInfo - A flag indicating whether to draw debug information.
   */
  setDrawDebugInfo(drawDebugInfo){
    this.drawCellOutline = drawDebugInfo; 
    this.drawBoundingBox = drawDebugInfo;
  }

  /**
   * Sets the fill and stroke colors for the triangle.
   *
   * @param {string} fillColor - The color to be used for filling.
   * @param {string} [strokeColor] - The color to be used for the stroke. If not provided, the fillColor will be used as the stroke color.
   */
  setColors(fillColor, strokeColor){
    this.fillColor = fillColor;

    if(strokeColor){
      this.strokeColor = strokeColor;
    }else{
      this.strokeColor = fillColor;
    }
  }

  /**
   * Draws a triangle on the given canvas context based on the object's properties.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    if (!this.visible) return;

    ctx.save();

    if (this.isFillVisible) {
      ctx.fillStyle = this.fillColor;
    } 

    if (this.isStrokeVisible) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWidth;
    } 

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle * Math.PI / 180);

    ctx.beginPath();
    switch (this.direction) {
      case TriangleDir.BottomLeft:
        ctx.moveTo(0, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(this.size, this.size);
        break;
      case TriangleDir.BottomRight:
        ctx.moveTo(0, this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(this.size, 0);
        break;
      case TriangleDir.TopRight:
        ctx.moveTo(0, 0);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(this.size, this.size);
        break;
      case TriangleDir.TopLeft:
      default:
        ctx.moveTo(0, this.size);
        ctx.lineTo(0, 0);
        ctx.lineTo(this.size, 0);
        break;
    }
    ctx.closePath();

    if (this.isFillVisible) {
      ctx.fill();
    }

    if (this.isStrokeVisible) {
      ctx.stroke();
    }

    // useful for debugging
    if (this.drawCellOutline) {
      ctx.setLineDash([2, 3]); // Dots of 2 pixel, gaps of 3 pixels
      ctx.strokeStyle = 'rgba(0, 200, 0, 0.5)';
      ctx.strokeRect(0, 0, this.size, this.size);
    }

    ctx.restore();

    ctx.save();
    if (this.drawBoundingBox){
      const boundingBox = this.getBoundingBox();
      ctx.setLineDash([1, 5]); // Dots of 1 pixel, gaps of 5 pixels
      ctx.strokeStyle = 'rgba(200, 0, 30, 0.8)';
      ctx.strokeRect(boundingBox.x, boundingBox.y, boundingBox.width, boundingBox.height);
    }
    ctx.restore();
  }

  /**
   * Calculates the bounding box of the triangle, taking into account its location, 
   * size, and angle
   *
   * @returns {Object} An object containing the coordinates of the bounding box.
   */
  getBoundingBox() {
    const halfSize = this.size / 2;
    const rad = this.angle * Math.PI / 180;

    // Calculate the vertices of the triangle based on its direction
    let vertices;
    switch (this.direction) {
      case TriangleDir.BottomLeft:
        vertices = [
          { x: 0, y: 0 },
          { x: 0, y: this.size },
          { x: this.size, y: this.size }
        ];
        break;
      case TriangleDir.BottomRight:
        vertices = [
          { x: 0, y: this.size },
          { x: this.size, y: this.size },
          { x: this.size, y: 0 }
        ];
        break;
      case TriangleDir.TopRight:
        vertices = [
          { x: 0, y: 0 },
          { x: this.size, y: 0 },
          { x: this.size, y: this.size }
        ];
        break;
      case TriangleDir.TopLeft:
      default:
        vertices = [
          { x: 0, y: this.size },
          { x: 0, y: 0 },
          { x: this.size, y: 0 }
        ];
        break;
    }

    // Rotate the vertices around the origin and translate to the triangle's position
    const rotatedVertices = vertices.map(vertex => {
      const rotatedX = vertex.x * Math.cos(rad) - vertex.y * Math.sin(rad);
      const rotatedY = vertex.x * Math.sin(rad) + vertex.y * Math.cos(rad);
      return {
        x: this.x + rotatedX,
        y: this.y + rotatedY
      };
    });

    // Find the min and max x and y values
    const minX = Math.min(...rotatedVertices.map(vertex => vertex.x));
    const maxX = Math.max(...rotatedVertices.map(vertex => vertex.x));
    const minY = Math.min(...rotatedVertices.map(vertex => vertex.y));
    const maxY = Math.max(...rotatedVertices.map(vertex => vertex.y));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Returns the opposite direction of the given triangle direction.
   *
   * @param {TriangleDir} triangleDir - The current direction of the triangle.
   * @returns {TriangleDir} - The opposite direction of the given triangle direction.
   */
  static getOppositeDirection(triangleDir) {
    switch (triangleDir) {
      case TriangleDir.BottomLeft:
        return TriangleDir.TopRight;
      case TriangleDir.BottomRight:
        return TriangleDir.TopLeft;
      case TriangleDir.TopRight:
        return TriangleDir.BottomLeft;
      case TriangleDir.TopLeft:
      default:
        return TriangleDir.BottomRight;
    }
  }

  /**
   * Creates a new Triangle object with the specified properties.
   *
   * @param {Object} tri - An object containing the properties of the triangle.
   * @param {number} tri.x - The x-coordinate of the triangle.
   * @param {number} tri.y - The y-coordinate of the triangle.
   * @param {number} tri.size - The size of the triangle.
   * @param {string} tri.direction - The direction of the triangle.
   * @param {string} tri.fillColor - The fill color of the triangle.
   * @param {string} tri.strokeColor - The stroke color of the triangle.
   * @param {number} tri.strokeWeight - The stroke weight of the triangle.
   * @param {boolean} tri.visible - The visibility of the triangle.
   * @returns {Triangle} A new Triangle object.
   */
  static createTriangle(tri){
    return new Triangle(tri.x, tri.y, tri.size, tri.direction,
      tri.fillColor, tri.strokeColor, tri.strokeWeight, tri.visible);
  }
}

export class Grid{
  /**
   * Constructs a new instance of the class.
   * 
   * @constructor
   * @param {number} gridWidth - The width of the grid.
   * @param {number} gridHeight - The height of the grid.
   * @param {number} triangleSize - The size of each triangle in the grid.
   * @param {string} [strokeColor='rgba(100, 100, 100, 0.5)'] - The color of the stroke for the grid lines.
   * @param {string|null} [fillColor=null] - The fill color for the grid triangles.
   */
  constructor(gridWidth, gridHeight, triangleSize, strokeColor = 'rgba(200, 200, 200, 0.5)', fillColor = null){
    this.gridArray = Grid.createGrid(gridWidth, gridHeight, triangleSize, strokeColor, fillColor);
    this.visible = true;
    this.setFillColor(fillColor);
  }

  /**
   * Draws the grid onto the provided canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx){
    if(!this.visible){ return; }

    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].draw(ctx);
      }
    }
  }

  /**
   * Sets the stroke color for all triangles in the grid array.
   *
   * @param {string} strokeColor - The color to set as the stroke color for the triangles.
   */
  setStrokeColor(strokeColor){
    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].tri1.strokeColor = strokeColor;
        this.gridArray[row][col].tri2.strokeColor = strokeColor;
      }
    }
  }
  
  /**
   * Sets the fill color for all triangles in the grid array.
   *
   * @param {string} fillColor - The color to set as the fill color for the triangles.
   */
  setFillColor(fillColor){
    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].tri1.fillColor = fillColor;
        this.gridArray[row][col].tri2.fillColor = fillColor;
      }
    }
  }


  /**
   * Creates a grid of cells with triangles.
   *
   * @param {number} gridWidth - The width of the grid.
   * @param {number} gridHeight - The height of the grid.
   * @param {number} triangleSize - The size of each triangle in the grid.
   * @param {string} strokeColor - The color of the triangle strokes.
   * @param {string} [fillColor] - The optional fill color of the triangles.
   * @returns {Array<Array<Cell>>} A 2D array representing the grid of cells.
   */
  static createGrid(gridWidth, gridHeight, triangleSize, strokeColor, fillColor){

    const numGridColumns = Math.floor(gridWidth / triangleSize);
    const numGridRows = Math.floor(gridHeight / triangleSize);
  
    let grid = new Array(numGridRows);
  
    for(let row = 0; row < grid.length; row++){
      grid[row] = new Array(numGridColumns);
      for(let col = 0; col < grid[row].length; col++){
        let triDir = TriangleDir.TopLeft;
        if((row % 2 == 0 && col % 2 == 0) || (row % 2 != 0 && col % 2 != 0)){
          triDir = TriangleDir.TopRight;
        }
        let cell = Cell.createCell(col * triangleSize, row * triangleSize, triangleSize, triDir);
  
        cell.tri1.strokeColor = strokeColor;
        cell.tri2.strokeColor = strokeColor;

        if(fillColor){
          cell.tri1.fillColor = fillColor;
          cell.tri2.fillColor = fillColor;
        }

        grid[row][col] = cell;
      }
    }
    return grid;
  }
}

export const OriginalColorPaletteRGB = {
  Blue: "rgb(135, 202, 228)",
  BlueGray: "rgb(147, 169, 207)",
  Purple: "rgb(171, 147, 197)",
  Green: "rgb(148, 206, 146)",
  Orange: "rgb(235, 185, 130)",
  RedPurple: "rgb(207, 145, 166)",
  Pink: "rgb(237, 162, 163)",
  YellowGreen: "rgb(239, 226, 127)",
  LightGreen: "rgb(209, 226, 133)",
  BlueGreen: "rgb(147, 211, 202)"
};

export const ORIGINAL_COLOR_ARRAY = [
  OriginalColorPaletteRGB.Blue, 
  OriginalColorPaletteRGB.BlueGray,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.Purple,
  OriginalColorPaletteRGB.Green,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.LightGreen,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.RedPurple,
  OriginalColorPaletteRGB.BlueGreen,
  OriginalColorPaletteRGB.Pink
];


/**
 * Class representing a colorer for the Makeability Lab logo.
 */
export class MakeabilityLabLogoColorer {

  /**
   * Gets a random color from the original color palette.
   * @returns {string} A random color in RGB format from the original color palette.
   */
  static getRandomOriginalColor(){
    return MakeabilityLabLogoColorer.getRandomColorFromPalette(OriginalColorPaletteRGB);
  }

  /**
   * Gets a random color from the specified color palette.
   * If no palette is provided, it defaults to the original color palette.
   * @param {Object} [palette] - An optional color palette object where keys are color names and values are RGB strings.
   * @returns {string} A random color in RGB format from the specified or default color palette.
   */
  static getRandomColorFromPalette(palette){
    if(!palette){
      palette = OriginalColorPaletteRGB;
    }

    const keys = Object.keys(palette);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return palette[randKey];
  }
}