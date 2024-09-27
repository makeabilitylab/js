/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */
function convertToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} radians - The angle in radians to be converted.
 * @returns {number} The angle in degrees.
 */
function convertToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Linearly interpolates between two values.
 *
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} amt - The interpolation amount (0-1).
 * @returns {number} The interpolated value.
 */
function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

/**
 * Generates a random number within a specified range (similar to p5js random)
 * If only one argument is provided, it generates a number between 0 and the argument.
 * If two arguments are provided, it generates a number between the two arguments.
 * 
 * @param {number} min - The minimum value (inclusive) or the maximum value if only one argument is provided.
 * @param {number} [max] - The maximum value (exclusive).
 * @returns {number} A random number within the specified range.
 */
function random(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}

/**
 * Class representing a 2D vector.
 */
class Vector {
  /**
   * Create a vector.
   * @param {number} x - The x coordinate.
   * @param {number} y - The y coordinate.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Add another vector to this vector.
   * @param {Vector} other - The vector to add.
   * @returns {Vector} The resulting vector.
   */
  add(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  /**
   * Subtract another vector from this vector.
   * @param {Vector} other - The vector to subtract.
   * @returns {Vector} The resulting vector.
   */
  subtract(other) {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  /**
   * Multiply this vector by a scalar.
   * @param {number} scalar - The scalar to multiply by.
   * @returns {Vector} The resulting vector.
   */
  multiply(scalar) {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  /**
   * Divide this vector by a scalar.
   * @param {number} scalar - The scalar to divide by.
   * @returns {Vector} The resulting vector.
   */
  divide(scalar) {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  /**
   * Calculate the magnitude (length) of this vector.
   * @returns {number} The magnitude of the vector.
   */
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Normalize this vector (make it have a magnitude of 1).
   * @returns {Vector} The normalized vector.
   */
  normalize() {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag);
  }

  /**
   * Calculate the dot product of this vector and another vector.
   * @param {Vector} other - The other vector.
   * @returns {number} The dot product.
   */
  dotProduct(other) {
    return this.x * other.x + this.y * other.y;
  }

  /**
   * Calculate the angle between this vector and another vector.
   * @param {Vector} other - The other vector.
   * @returns {number} The angle in radians.
   */
  angleBetween(other) {
    // const cosTheta = this.dotProduct(other) / (this.magnitude() * other.magnitude());
    // return Math.acos(cosTheta);

    const dotProduct = this.dotProduct(other);
    const magnitudeProduct = this.magnitude() * other.magnitude();

    // Handle parallel vectors (dotProduct ≈ magnitudeProduct)
    if (Math.abs(dotProduct - magnitudeProduct) < Number.EPSILON) {
      return dotProduct >= 0 ? 0 : Math.PI;
    }

    // Handle zero vectors
    if (magnitudeProduct === 0) {
      return 0; // Or return NaN if you prefer
    }

    const cosTheta = dotProduct / magnitudeProduct;
    let angle = Math.acos(cosTheta);

    // Use the cross product to determine the sign of the angle
    const crossProductZ = this.x * other.y - this.y * other.x; // 2D cross product
    if (crossProductZ < 0) {
      angle = 2 * Math.PI - angle;
    }

    return angle;
  }

  /**
   * Get a string representation of this vector.
   * @returns {string} A string representation of the vector.
   */
  toString() {
    return `(${this.x}, ${this.y})`;
  }

  /**
   * Create a vector from two points.
   * @param {Object} p1 - The first point with x and y properties.
   * @param {Object} p2 - The second point with x and y properties.
   * @returns {Vector} The resulting vector.
   */
  static fromPoints(p1, p2) {
    return new Vector(p2.x - p1.x, p2.y - p1.y);
  }
}

/**
 * Linearly interpolates between two colors.
 *
 * @param {Object|string} startColor - The starting color. Can be an object with r, g, b, and 
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {Object|string} endColor - The ending color. Can be an object with r, g, b, and 
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {number} amt - The amount to interpolate between the two colors. Should be a value between 0 and 1.
 * @returns {string} The interpolated color in rgba format.
 */
function lerpColor(startColor, endColor, amt) {
  // console.log(`lerpColor: startColor: ${startColor}, endColor: ${endColor}, amt: ${amt}`);

  // Ensure both colors are objects with r, g, b, and optionally a properties
  startColor = convertColorStringToObject(startColor);
  endColor = convertColorStringToObject(endColor);

  const r = Math.round(lerp(startColor.r, endColor.r, amt));
  const g = Math.round(lerp(startColor.g, endColor.g, amt));
  const b = Math.round(lerp(startColor.b, endColor.b, amt));
  const a = lerp(startColor.a || 1, endColor.a || 1, amt); // Default to 1 if a property is missing

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts a color string (hex, rgb, or rgba) to an object with r, g, b, and optionally a properties.
 * If the input is already an object, it returns the input as is.
 *
 * @param {string|Object} colorStr - The color string or object to convert.
 * @returns {Object} An object with properties r, g, b, and optionally a.
 * @throws {Error} If the color string format is invalid.
 */
function convertColorStringToObject(colorStr) {
  if (typeof colorStr === 'string') {
    // Handle hexstring, rgb, or rgba string
    const match = colorStr.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})$/);
    if (match) {
      // Hexstring
      const hex = match[1];
      if (hex.length === 8) {
        // 8-digit hex string with alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: parseInt(hex.substring(6, 8), 16) / 255
        };
      } else {
        // 6-digit hex string without alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: 1 // Default to 1 if alpha is not specified
        };
      }
    } else if (colorStr.startsWith('rgb')) {
      // rgb or rgba string
      const match = colorStr.match(/rgba?\((\d+), (\d+), (\d+)(?:, (\d?\.\d+))?\)/);
      if (match) {
        const [, r, g, b, a] = match;
        return {
          r: parseInt(r),
          g: parseInt(g),
          b: parseInt(b),
          a: a !== undefined ? parseFloat(a) : 1 // Default to 1 if alpha is not specified
        };
      }
    }
    throw new Error(`Invalid color string: ${colorStr}`);
  }

  // If it's already an object, return it
  return colorStr;
}

// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.io/
//

class LineSegment {
  /**
   * Creates an instance of a line segment.
   * 
   * @constructor
   * @param {number|object} x1 - The x-coordinate of the first point or a vector object.
   * @param {number|object} y1 - The y-coordinate of the first point or a vector object.
   * @param {number} [x2] - The x-coordinate of the second point (optional if x1 and y1 are vectors).
   * @param {number} [y2] - The y-coordinate of the second point (optional if x1 and y1 are vectors).
   */
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = new Vector(x1, y1);
      this.pt2 = new Vector(x2, y2);
    }

    this.fontSize = 10;
    this.strokeColor = "black";
    this.isDashedLine = false;
    this.drawTextLabels = true;
    this.drawTextMagnitude = true;
    this.drawTextAngle = true;
    this.strokeWeight = 2;
  }

  /**
   * Returns x1
   */
  get x1() {
    return this.pt1.x;
  }

  /**
   * Set x1
   */
  set x1(val) {
    this.pt1.x = val;
  }

  /**
   * Returns y1
   */
  get y1() {
    return this.pt1.y;
  }

  /**
   * Set y1
   */
  set y1(val) {
    this.pt1.y = val;
  }

  /**
   * Returns x2
   */
  get x2() {
    return this.pt2.x;
  }

  /**
   * Set x2
   */
  set x2(val) {
    this.pt2.x = val;
  }

  /**
   * Returns y2
   */
  get y2() {
    return this.pt2.y;
  }

  /**
   * Set y2
   */
  set y2(val) {
    this.pt2.y = val;
  }

  /**
   * Returns the heading of the line segment in radians between 0 and 2*PI.
   */
  getHeading() {
    const diffVector = this.pt2.subtract(this.pt1);
    let heading = Math.atan2(diffVector.y, diffVector.x);

    if (heading < 0) {
      heading += 2 * Math.PI;
    }
    return heading;
  }

  /**
   * Returns the two normals for the line segment (one normal for each direction)
   */
  getNormals() {
    return calculateNormals(this.pt1, this.pt2);
  }

  /**
   * Returns one of the normals for this line segment. To get both
   * normals, call getNormals()
   */
  getNormal() {
    return this.getNormals()[0];
  }

  /**
   * Calculates the vector representing the line segment moved to the origin.
   *
   * @returns {Vector} The vector representing the line segment at the origin.
   */
  getVectorAtOrigin() {
    return this.pt2.subtract(this.pt1);
  }

  /**
   * Gets the angles between this line segment and the given vector or line segment.
   * Returns both the counterclockwise and clockwise angles in radians.
   *
   * @param {Vector|LineSegment} vectorOrLineSegment The other vector or line segment.
   * @returns {Object} An object containing both the counterclockwise and clockwise angles in radians.
   */
  getAnglesBetween(vectorOrLineSegment) {
    const v1 = this.getVectorAtOrigin();
    let v2;

    if (vectorOrLineSegment instanceof LineSegment) {
      v2 = vectorOrLineSegment.getVectorAtOrigin();
    } else {
      v2 = vectorOrLineSegment;
    }

    let angleBetweenRadians = v1.angleBetween(v2);
    console.log(`angleBetweenDegrees: ${convertToDegrees(angleBetweenRadians).toFixed(1)}`);

    // Ensure the angle is between 0 and 2*PI
    if (angleBetweenRadians < 0) {
      angleBetweenRadians += 2 * Math.PI;
    }

    // Calculate the counterclockwise and clockwise angles
    const clockwiseAngle = angleBetweenRadians;
    const counterclockwiseAngle = 2 * Math.PI - angleBetweenRadians;
    
    return {
      counterclockwiseAngle,
      clockwiseAngle
    };
  }

  /**
   * Calculates the orthogonal projection of vector p onto this line segment.
   * 
   * @param {Vector} p The vector to project onto the line segment.
   * @returns {Vector} The orthogonal projection of p onto the line segment.
   */
  getOrthogonalProjection(p) {
    // http://mathonline.wikidot.com/orthogonal-projections

    const d1 = this.pt2.subtract(this.pt1); // Direction vector of the line segment
    const d2 = p.subtract(this.pt1); // Vector from point p to the first point of the line segment

    const l1 = d1.magnitude(); // Length of the line segment

    const dotProduct = Math.min(Math.max(d2.dotProduct(d1.normalize()), 0), l1); // Constrain dot product between 0 and l1

    return this.pt1.add(d1.multiply(dotProduct)); // Project p onto the line segment
  }

  /**
   * Returns the minimum distance between this line segment and the given point p.
   * 
   * @param {Vector} p The point to calculate the distance to.
   * @returns {number} The minimum distance between the line segment and the point.
   */
  getDistance(p) {
    const op = this.getOrthogonalProjection(p);
    return p.subtract(op).magnitude();
  }

  /**
   * Returns the magnitude of this vector as a floating point number.
   * 
   * @returns {number} The magnitude of the line segment.
   */
  getMagnitude() {
    return this.pt2.subtract(this.pt1).magnitude();
  }

  /**
   * Sets the magnitude of the line segment to the given number.
   * 
   * @param {number} len The desired magnitude of the line segment.
   */
  setMagnitude(len) {
    const diffVector = this.pt2.subtract(this.pt1).normalize().multiply(len);
    this.pt2 = this.pt1.add(diffVector);
  }

  /**
   * Draws the line segment on the provided canvas context.
   * 
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWeight;
  
    if (this.isDashedLine) {
      ctx.setLineDash([5, 15]);
    }
  
    this.drawArrow(ctx, this.pt1, this.pt2.subtract(this.pt1), this.strokeColor); 
  
    // Draw text labels (optional)
    if (this.drawTextLabels) {
      ctx.font = `${this.fontSize}px Arial`; // Replace with your desired font and size
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = this.strokeColor; // Or any other desired color
  
      const label = this.generateLabel();
      const labelWidth = ctx.measureText(label).width;
      ctx.fillText(label, -labelWidth - 3, 12);
    }
  }

  drawArrow(ctx, p1, p2, color) {
    const headLength = 10; // Length of the arrow head
    const angle = Math.atan2(p2.y, p2.x);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.stroke();

    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle + Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
  
  /**
   * Generates the label to be displayed on the line segment.
   *
   * @returns {string} The label text.
   */
  generateLabel() {
    let label = "";
    if (this.drawTextAngle) {
      const angleDegrees = Math.round(Math.atan2(this.pt2.y - this.pt1.y, this.pt2.x - this.pt1.x) * 180 / Math.PI);
      label += `${angleDegrees}°`;
    }
  
    if (this.drawTextAngle && this.drawTextMagnitude) {
      label += " ";
    }
  
    if (this.drawTextMagnitude) {
      label += `|${this.getMagnitude().toFixed(1)}|`;
    }
  
    return label;
  }

  /**
   * Draws positive and negative angle arcs between two line segments on a canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} lineSegment1 - The first line segment.
   * @param {Object} lineSegment2 - The second line segment.
   * @param {string} clockwiseArcColor - The color of arc1
   * @param {string} counterclockwiseArcColor - The color of arc2
   * @param {number} [clockwiseArcRadius=50] - The size of the positive angle arc.
   * @param {number} [counterclockwiseArcRadius=30] - The size of the negative angle arc.
   */
  static drawAngleArcs(ctx, lineSegment1, lineSegment2, clockwiseArcColor='blue', 
    counterclockwiseArcColor='red', clockwiseArcRadius = 50, counterclockwiseArcRadius = 30) {
    
    const lineSeg1AngleRadians = lineSegment1.getHeading();
    const angles = lineSegment1.getAnglesBetween(lineSegment2);

    console.log(`CW angle ${convertToDegrees(angles.clockwiseAngle).toFixed(1)} CCW angle ${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}`);
    //console.log(`Counterclockwise Angle: ${angles.counterclockwiseAngle} radians (${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}°)`);
    //console.log(`Clockwise Angle: ${angles.clockwiseAngle} radians (${convertToDegrees(angles.clockwiseAngle).toFixed(1)}°)`);
    // console.log(`Old angle Between: ${angleBetweenLineSegmentsInRadians} radians (${convertToDegrees(angleBetweenLineSegmentsInRadians).toFixed(1)}°)`);
    
    ctx.save();

    // Draw the clockwise arc
    // arc(x, y, radius, startAngle, endAngle, counterclockwise)
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, clockwiseArcRadius, 
      lineSeg1AngleRadians, lineSeg1AngleRadians + angles.clockwiseAngle, false);
    ctx.strokeStyle = clockwiseArcColor;
    //ctx.setLineDash([2, 5]);
    ctx.stroke();

    // Draw the clockwise angle text
    const clockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + clockwiseArcRadius * 1.35 * Math.cos(lineSeg1AngleRadians + angles.clockwiseAngle / 2),
      lineSegment1.pt1.y + clockwiseArcRadius * 1.35 * Math.sin(lineSeg1AngleRadians + angles.clockwiseAngle / 2)
    );
  
    ctx.font = "12px Arial"; // Replace with your desired font and size
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = clockwiseArcColor;
  
    const clockwiseAngleDegrees = convertToDegrees(angles.clockwiseAngle);
    const clockwiseAngleDegreesLabel = `${clockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillText(clockwiseAngleDegreesLabel, clockwiseArcMiddleVector.x, clockwiseArcMiddleVector.y);

    // Draw the counterclockwise arc
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, counterclockwiseArcRadius,
      lineSeg1AngleRadians, lineSeg1AngleRadians - angles.counterclockwiseAngle, true);
    ctx.strokeStyle = counterclockwiseArcColor;
    ctx.stroke();

    // Draw the counterclockwise angle text
    const counterclockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + counterclockwiseArcRadius * 1.5 * Math.cos(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2),
      lineSegment1.pt1.y + counterclockwiseArcRadius * 1.5 * Math.sin(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2)
    );

    const counterclockwiseAngleDegrees = convertToDegrees(angles.counterclockwiseAngle);
    const counterclockwiseAngleDegreesLabel = `${counterclockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillStyle = counterclockwiseArcColor;
    ctx.fillText(counterclockwiseAngleDegreesLabel, counterclockwiseArcMiddleVector.x, counterclockwiseArcMiddleVector.y);
  
    ctx.restore();
  }
}

/**
 * Calculates the two normals for the line segment (one normal for each direction).
 * 
 * @param {Vector} pt1 The first point in the line segment.
 * @param {Vector} pt2 The second point in the line segment.
 * @returns {Vector[]} An array containing two Vector objects representing the normals.
 */
function calculateNormals(pt1, pt2) {
  // From: https://stackoverflow.com/a/1243676  
  // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
  //  V = B - A;
  //  normal1 = [ V(2), -V(1)];
  //  normal2 = [-V(2), V(1)];

  const v = pt2.subtract(pt1);
  return [new Vector(v.y, -v.x), new Vector(-v.y, v.x)];
}

class MakeabilityLabLogo {

  constructor(x, y, triangleSize) {
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
   * Calculates the x-coordinate for centering the MakeabilityLabLogo on the canvas.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @param {number} canvasWidth - The width of the canvas.
   * @returns {number} The x-coordinate for centering the logo.
   */
  static getXCenterPosition(triangleSize, canvasWidth){
    const xCenter = (canvasWidth - MakeabilityLabLogo.getWidth(triangleSize)) / 2;
    return Math.round(xCenter / triangleSize) * triangleSize;
  }

  /**
   * Calculates the y-coordinate for centering the MakeabilityLabLogo on the canvas.
   *
   * @param {number} triangleSize - The size of each triangle.
   * @param {number} canvasHeight - The width of the canvas.
   * @returns {number} The y-coordinate for centering the logo.
   */
  static getYCenterPosition(triangleSize, canvasHeight){
    const yCenter = (canvasHeight - MakeabilityLabLogo.getHeight(triangleSize)) / 2;
    return Math.round(yCenter / triangleSize) * triangleSize;
  }

  /**
   * Gets the far left x-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The x-coordinate of the first element.
   */
  get x(){ return this.makeLabLogoArray[0][0].x }

  /**
   * Gets the top y-coordinate of the Makeability Lab logo
   * 
   * @returns {number} The y-coordinate of the first element.
   */
  get y(){ return this.makeLabLogoArray[0][0].y }

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
   * Convenience method to set fill and stroke colors
   * @param {*} fillColor 
   * @param {*} strokeColor 
   */
  setColors(fillColor, strokeColor){
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        this.makeLabLogoArray[row][col].tri1.fillColor = fillColor;
        this.makeLabLogoArray[row][col].tri1.strokeColor = strokeColor;

        this.makeLabLogoArray[row][col].tri2.fillColor = fillColor;
        this.makeLabLogoArray[row][col].tri2.strokeColor = strokeColor;
      }
    }  

    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = tri.strokeColor;
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
  getAllTriangles(includeMShadowTriangles=true){
    let allTriangles = new Array();
    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        if(includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 1)){
          allTriangles.push(this.makeLabLogoArray[row][col].tri1);
        }

        if(includeMShadowTriangles || !MakeabilityLabLogo.isMShadowTriangle(row, col, 2)){
          allTriangles.push(this.makeLabLogoArray[row][col].tri2);
        }
      }
    }  
    return allTriangles;
  }

  /**
   * Gets the triangles that are part of the M "shadow". That is, the 
   * black/darkened in the logo
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
    }else {
      for(let i=0; i<cTriangles.length; i++){
        cTriangles[i].fillColor = fillColorOrColorArray;
      }
    }
  }

  /**
   * Draws the Makeability Lab logo and its outlines if they are visible.
   * 
   * This method performs the following actions:
   * 1. Checks if the logo is visible; if not, it returns immediately.
   * 2. Iterates through the `makeLabLogoArray` and calls the `draw` method on each element.
   * 3. If the M outline is visible, it draws the M outline using the specified color and stroke weight.
   * 4. If the L outline is visible, it draws the L outline using the specified color and stroke weight.
   */
  draw(ctx) {
    if(!this.visible){ return; }

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

  static isMShadowTriangle(row, col, triNum){
    return (row == 2 && col == 1 && triNum == 2) ||
          (row == 3 && col == 1 && triNum == 1) ||
          (row == 2 && col == 4 && triNum == 2) ||
          (row == 3 && col == 4 && triNum == 1);
  }
}

const TriangleDir = {
  TopLeft: 'TopLeft',
  TopRight: 'TopRight',
  BottomLeft: 'BottomLeft',
  BottomRight: 'BottomRight'
};

class Cell {
  /**
   * Creates an instance of the class with two triangles.
   * @constructor
   * @param {Object} triangle1 - The first triangle object.
   * @param {Object} triangle2 - The second triangle object.
   */
  constructor(triangle1, triangle2) {
    this.tri1 = triangle1;
    this.tri2 = triangle2;
  }

  /**
   * Gets the x-coordinate of the cell
   * @returns {number} The x-coordinate of the cell.
   */
  get x() {
    return this.tri1.x;
  }

  /**
   * Gets the y-coordinate of the cell
   * @returns {number} The y-coordinate of the cell.
   */
  get y() {
    return this.tri1.y;
  }

  /**
   * Gets the size of the cell. Cells are always square.
   * @type {number}
   */
  get size() {
    return this.tri1.size;
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
    }else {
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

class Triangle {
  /**
   * Creates an instance of the triangle.
   * 
   * @constructor
   * @param {number} x - The x-coordinate of the triangle.
   * @param {number} y - The y-coordinate of the triangle.
   * @param {number} size - The size of the triangle.
   * @param {string} direction - The direction of the triangle. See TriangleDir for possible values.
   * @param {p5.Color} [fillColor='white'] - The fill color of the triangle.
   * @param {p5.Color} [strokeColor='black'] - The stroke color of the triangle.
   * @param {number} [strokeWeight=1] - The stroke weight of the triangle.
   * @param {boolean} [visible=true] - The visibility of the triangle.
   */
  constructor(x, y, size, direction, fillColor = 'white',
    strokeColor = 'black', strokeWeight = 1, visible = true) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = direction;
    this.angle = 0;

    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWeight = strokeWeight;
    this.visible = visible;

    this.isFillVisible = true;
    this.isStrokeVisible = true;

    this.drawCellOutline = false; // for debugging
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
    }else {
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
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    }

    if (this.isStrokeVisible) {
      ctx.strokeStyle = this.strokeColor;
      ctx.lineWidth = this.strokeWeight;
    } else {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
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
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)';
      ctx.strokeRect(0, 0, this.size, this.size);
    }

    ctx.restore();
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

class Grid{
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

const OriginalColorPaletteRGB = {
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

const ORIGINAL_COLOR_ARRAY = [
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
class MakeabilityLabLogoColorer {

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

export { Cell, Grid, LineSegment, MakeabilityLabLogo, MakeabilityLabLogoColorer, ORIGINAL_COLOR_ARRAY, OriginalColorPaletteRGB, Triangle, TriangleDir, Vector, convertColorStringToObject, convertToDegrees, convertToRadians, lerp, lerpColor, random };
//# sourceMappingURL=makelab.all.js.map