/* strict-check.js — run the bundled game under 'use strict' (like the browser does)
   with a rasterizing canvas, to surface strict-only errors the non-strict QA misses. */
const { makeCanvas } = require('./canvas.js');
const { bundleOnly } = require('../build.js');
const cv = makeCanvas(240, 160);
let raf = null, clock = 0;
global.window = { addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined };
global.document = { getElementById: () => ({ getContext: () => cv.ctx }), querySelectorAll: () => [] };
global.performance = { now: () => clock };
global.requestAnimationFrame = cb => { raf = cb; };
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };

const src = "var BIRTHDAY_NAME='LANE ALLISON';var DEDICATION='THE GREATEST DADDY OF ALL';\n" + bundleOnly();
try {
  // a Function whose body starts with 'use strict' runs the WHOLE body in strict mode
  const run = new Function('"use strict";\n' + src);
  run();
  console.log('load OK under strict.');
  // run a batch of frames across many scenes to trip strict errors in draw/update paths
  for (let i = 0; i < 200; i++) { clock += 33; if (raf) raf(clock); }
  console.log('200 frames OK under strict. NO strict errors on the boot/title path.');
} catch (e) {
  console.log('STRICT ERROR:', e.constructor.name + ':', e.message);
  console.log(e.stack.split('\n').slice(0, 5).join('\n'));
}
