/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/lib/makelab-index.js":
/*!**********************************!*\
  !*** ./src/lib/makelab-index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Vector: () => (/* reexport safe */ _mathlib_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector)\n/* harmony export */ });\n/* harmony import */ var _mathlib_vector_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @mathlib/vector.js */ \"./src/lib/math/vector.js\");\n// Exporting primary modules from lib\n// export { Vector } from '@mathlib/vector.js';\n// export { LineSegment } from '@graphicslib/line-segment.js';\n// export { MakeabilityLabLogo } from '@lib/makelab-logo.js';\n\n// Initializing global variables (optional)\nwindow.globalVariable = 'some value';\n\n\nvar v = new _mathlib_vector_js__WEBPACK_IMPORTED_MODULE_0__.Vector(3, 4);\nwindow.v = v;\n\n//# sourceURL=webpack://makelab-lib/./src/lib/makelab-index.js?");

/***/ }),

/***/ "./src/lib/math/vector.js":
/*!********************************!*\
  !*** ./src/lib/math/vector.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   Vector: () => (/* binding */ Vector)\n/* harmony export */ });\nfunction _typeof(o) { \"@babel/helpers - typeof\"; return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && \"function\" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? \"symbol\" : typeof o; }, _typeof(o); }\nfunction _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError(\"Cannot call a class as a function\"); }\nfunction _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, \"value\" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }\nfunction _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, \"prototype\", { writable: !1 }), e; }\nfunction _toPropertyKey(t) { var i = _toPrimitive(t, \"string\"); return \"symbol\" == _typeof(i) ? i : i + \"\"; }\nfunction _toPrimitive(t, r) { if (\"object\" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || \"default\"); if (\"object\" != _typeof(i)) return i; throw new TypeError(\"@@toPrimitive must return a primitive value.\"); } return (\"string\" === r ? String : Number)(t); }\n/**\r\n * Class representing a 2D vector.\r\n */\nvar Vector = /*#__PURE__*/function () {\n  /**\r\n   * Create a vector.\r\n   * @param {number} x - The x coordinate.\r\n   * @param {number} y - The y coordinate.\r\n   */\n  function Vector(x, y) {\n    _classCallCheck(this, Vector);\n    this.x = x;\n    this.y = y;\n  }\n\n  /**\r\n   * Add another vector to this vector.\r\n   * @param {Vector} other - The vector to add.\r\n   * @returns {Vector} The resulting vector.\r\n   */\n  return _createClass(Vector, [{\n    key: \"add\",\n    value: function add(other) {\n      return new Vector(this.x + other.x, this.y + other.y);\n    }\n\n    /**\r\n     * Subtract another vector from this vector.\r\n     * @param {Vector} other - The vector to subtract.\r\n     * @returns {Vector} The resulting vector.\r\n     */\n  }, {\n    key: \"subtract\",\n    value: function subtract(other) {\n      return new Vector(this.x - other.x, this.y - other.y);\n    }\n\n    /**\r\n     * Multiply this vector by a scalar.\r\n     * @param {number} scalar - The scalar to multiply by.\r\n     * @returns {Vector} The resulting vector.\r\n     */\n  }, {\n    key: \"multiply\",\n    value: function multiply(scalar) {\n      return new Vector(this.x * scalar, this.y * scalar);\n    }\n\n    /**\r\n     * Divide this vector by a scalar.\r\n     * @param {number} scalar - The scalar to divide by.\r\n     * @returns {Vector} The resulting vector.\r\n     */\n  }, {\n    key: \"divide\",\n    value: function divide(scalar) {\n      return new Vector(this.x / scalar, this.y / scalar);\n    }\n\n    /**\r\n     * Calculate the magnitude (length) of this vector.\r\n     * @returns {number} The magnitude of the vector.\r\n     */\n  }, {\n    key: \"magnitude\",\n    value: function magnitude() {\n      return Math.sqrt(this.x * this.x + this.y * this.y);\n    }\n\n    /**\r\n     * Normalize this vector (make it have a magnitude of 1).\r\n     * @returns {Vector} The normalized vector.\r\n     */\n  }, {\n    key: \"normalize\",\n    value: function normalize() {\n      var mag = this.magnitude();\n      return new Vector(this.x / mag, this.y / mag);\n    }\n\n    /**\r\n     * Calculate the dot product of this vector and another vector.\r\n     * @param {Vector} other - The other vector.\r\n     * @returns {number} The dot product.\r\n     */\n  }, {\n    key: \"dotProduct\",\n    value: function dotProduct(other) {\n      return this.x * other.x + this.y * other.y;\n    }\n\n    /**\r\n     * Calculate the angle between this vector and another vector.\r\n     * @param {Vector} other - The other vector.\r\n     * @returns {number} The angle in radians.\r\n     */\n  }, {\n    key: \"angleBetween\",\n    value: function angleBetween(other) {\n      // const cosTheta = this.dotProduct(other) / (this.magnitude() * other.magnitude());\n      // return Math.acos(cosTheta);\n\n      var dotProduct = this.dotProduct(other);\n      var magnitudeProduct = this.magnitude() * other.magnitude();\n\n      // Handle parallel vectors (dotProduct ≈ magnitudeProduct)\n      if (Math.abs(dotProduct - magnitudeProduct) < Number.EPSILON) {\n        return dotProduct >= 0 ? 0 : Math.PI;\n      }\n\n      // Handle zero vectors\n      if (magnitudeProduct === 0) {\n        return 0; // Or return NaN if you prefer\n      }\n      var cosTheta = dotProduct / magnitudeProduct;\n      var angle = Math.acos(cosTheta);\n\n      // Use the cross product to determine the sign of the angle\n      var crossProductZ = this.x * other.y - this.y * other.x; // 2D cross product\n      if (crossProductZ < 0) {\n        angle = 2 * Math.PI - angle;\n      }\n      return angle;\n    }\n\n    /**\r\n     * Get a string representation of this vector.\r\n     * @returns {string} A string representation of the vector.\r\n     */\n  }, {\n    key: \"toString\",\n    value: function toString() {\n      return \"(\".concat(this.x, \", \").concat(this.y, \")\");\n    }\n\n    /**\r\n     * Create a vector from two points.\r\n     * @param {Object} p1 - The first point with x and y properties.\r\n     * @param {Object} p2 - The second point with x and y properties.\r\n     * @returns {Vector} The resulting vector.\r\n     */\n  }], [{\n    key: \"fromPoints\",\n    value: function fromPoints(p1, p2) {\n      return new Vector(p2.x - p1.x, p2.y - p1.y);\n    }\n  }]);\n}();\n\n//# sourceURL=webpack://makelab-lib/./src/lib/math/vector.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/lib/makelab-index.js");
/******/ 	
/******/ })()
;