/* shots.js — screenshot helpers. Render the current frame buffer to a PNG. */
const fs = require('fs');
const path = require('path');
const { encodePNG } = require('./canvas.js');

const OUT = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

function shoot(h, name, scale) {
  // draw current scene a couple times to be safe
  h.step(2, 33);
  const png = encodePNG(h.cv.buf, h.cv.W, h.cv.H, scale || 3);
  fs.writeFileSync(path.join(OUT, name + '.png'), png);
  console.log('  shot  ' + name + '.png');
}
module.exports = { shoot, OUT };
