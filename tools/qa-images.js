/* qa-images.js — embedded AI-art registry integrity: every image decodes to
   exactly w*h pixels, data strings are script-safe, and every name the game
   routes to (sprites, backdrops, tiles, fx) exists. */
const fs = require('fs');
const path = require('path');
const { loadGame } = require('./loadgame.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
console.log('IMAGE REGISTRY QA');

const src = fs.readFileSync(path.join(__dirname, '..', 'src', '25-images.js'), 'utf8');
assert(src.indexOf('<') < 0 || src.indexOf('</script') < 0, 'no script-closing sequence in data');
assert(src.indexOf('`') < 0, 'no backticks in data');
ok('data strings are script-safe');

const h = loadGame(); const { G } = h;
h.step(5);
const IMG = new Function(src + ';return IMG;')();
const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const IDX = {}; for (let i = 0; i < B62.length; i++) IDX[B62[i]] = i;
let n = 0;
for (const name in IMG) {
  const im = IMG[name];
  let x = 0, rows = 0;
  for (let i = 0; i < im.d.length; i += 2) {
    const ci = IDX[im.d[i]], len = IDX[im.d[i + 1]] + 1;
    assert(ci !== undefined && len >= 1, name + ': bad pair at ' + i);
    assert(ci === 0 || ci <= im.pal.length, name + ': palette index out of range');
    x += len;
    if (x > im.w) assert(false, name + ': run crosses row at pair ' + i);
    if (x === im.w) { x = 0; rows++; }
  }
  assert(x === 0 && rows === im.h, name + ': decoded ' + rows + ' rows, expected ' + im.h);
  n++;
}
ok(n + ' images decode to exact dimensions');

const need = ['samuel', 'samuel-true', 'samuel-back', 'herschel-back', 'william-back', 'rosalind-back',
  'heckler', 'gerald', 'editor', 'maximvs', 'jake', 'rex', 'snob', 'snob2', 'pedro', 'understudy',
  'bg-stage', 'bg-rome', 'bg-west', 'bg-disco', 'bg-london', 'bg-hypogeum', 'bg-traincar', 'bg-goblin', 'bg-xmas',
  'fx-ember', 'fx-heart', 'fx-glyph', 'fx-star', 'fx-burst', 'fx-chevron', 'fx-zzz', 'fx-note', 'fx-sweat',
  'tile-grass', 'tile-path', 'tile-snow', 'tile-sand', 'tile-rails', 'tile-tree'];
for (const nm of need) assert(IMG[nm], 'required asset missing: ' + nm);
ok('all required assets present (' + need.length + ' checked)');

// tile flags survived the art swap
assert(G.TILES['w'].solid && G.TILES['t'].enc && G.TILES['1'].solid, 'tile solid/enc flags preserved');
assert(G.TILES['R'].solid === undefined || G.TILES['R'].solid === false, 'nyc road stays walkable');
ok('tile collision/encounter flags intact after art routing');

console.log('\nIMAGE REGISTRY QA PASSED — ' + PASS + ' checks. ✔');
