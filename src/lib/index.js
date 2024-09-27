// Exporting primary modules from lib
// export { Vector } from '@mathlib/vector.js';
// export { LineSegment } from '@graphicslib/line-segment.js';
// export { MakeabilityLabLogo } from '@lib/makelab-logo.js';

// Initializing global variables (optional)
//window.globalVariable = 'some value';

//export { Vector } from '@mathlib/vector.js'; 

// ./src/lib/makelab-index.js

// Import everything from the sub-index files
export * from './math/index.js';
export * from './graphics/index.js';
export * from './makelab-logo.js';