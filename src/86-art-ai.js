/* 37-sprites-ai.js — routes battle sprites, battle backdrops, and overworld
   tiles to the embedded AI-generated art in IMG (src/25-images.js).
   Loads after sprites/tiles so it overrides; falls back to the procedural
   art whenever an IMG asset is missing. */

(function () {
  function has(n) { return (typeof IMG !== 'undefined') && !!IMG[n]; }
  function mk(n) { return function (ox, oy) { drawImg(n, ox, oy); }; }

  /* ---- battle/dialogue sprites ---- */
  var CAST = ['heckler', 'orator', 'senator', 'poet', 'auctioneer', 'discofan',
    'gerald', 'editor', 'legionary', 'salesman', 'deejay', 'skater',
    'goblin', 'goblinhex', 'goblinbrute', 'beasthandler', 'trainee',
    'bookmaker', 'superfan', 'critic', 'maximvs', 'jake', 'pedro',
    'bandit', 'prospector', 'granny', 'cardsharp',
    'understudy', 'rex', 'herschel', 'william', 'rosalind'];
  for (var i = 0; i < CAST.length; i++) {
    if (has(CAST[i])) SPR[CAST[i]] = mk(CAST[i]);
  }
  /* aliases used by enemy spr fields */
  if (has('discofan')) SPR.dancer = mk('discofan');
  if (has('auctioneer')) SPR.cowboy = mk('auctioneer');
  if (has('poet')) SPR.poet = mk('poet');
  if (has('samuel')) SPR.samuel = function (ox, oy, opt) {
    drawImg((opt && opt.trueForm && has('samuel-true')) ? 'samuel-true' : 'samuel', ox, oy);
  };
  if (has('snob')) SPR.snob = function (ox, oy, opt) {
    drawImg((opt && opt.finalDraft && has('snob2')) ? 'snob2' : 'snob', ox, oy);
  };

  /* ---- battle backdrops (240x112 + dark floor band; overlays kept light) ---- */
  var BGN = ['stage', 'rome', 'west', 'disco', 'london', 'hypogeum', 'traincar', 'goblin', 'xmas', 'manorbg'];
  function mkbg(n) {
    return function () {
      cls('#15121c');
      drawImg('bg-' + n, 0, 0);
      if (n === 'xmas') { /* keep the falling snow feel */
        var t = (performance.now() / 260) | 0;
        for (var i = 0; i < 18; i++) px((i * 37 + t * 3) % 240, (i * 53 + t * 2) % 112, 1, 1, COL.white);
      }
    };
  }
  for (var b = 0; b < BGN.length; b++) {
    if (has('bg-' + BGN[b])) BGS[BGN[b]] = mkbg(BGN[b]);
  }
  if (BGS.stage) BGS.theatre = BGS.stage;

  /* ---- overworld tiles: swap draw fns only (solid/enc flags preserved) ---- */
  var TILEMAP = {
    'g': 'tile-grass', 't': 'tile-tallgrass', 'p': 'tile-path', 'd': 'tile-dirt',
    's': 'tile-sand', 'w': 'tile-water', '#': 'tile-stone', 'b': 'tile-brick',
    '.': 'tile-wood', 'r': 'tile-rug', 'm': 'tile-marble', 'f': 'tile-discofloor',
    '=': 'prop-table', 'B': 'prop-bookshelf', 'H': 'prop-bed', 'O': 'prop-stove',
    '|': 'prop-fence', 'C': 'prop-cactus', 'X': 'prop-column',
    'T': 'tile-tree', 'c': 'tile-crowd', 'u': 'tile-hypofloor',
    'v': 'tile-hypowall', 'q': 'tile-rubble',
    'S': 'tile-snow', 'R': 'tile-road', 'W': 'tile-brownstone', 'I': 'tile-brick',
    'N': 'tile-checker', 'E': 'tile-seats', 'Y': 'tile-stagewood',
    'U': 'tile-curtain', 'Z': 'tile-concrete',
    '1': 'tile-rails', 'P': 'tile-planks', 'F': 'tile-facade', 'z': 'tile-scrub'
  };
  function mktile(img, under) {
    return function (x, y, f) {
      if (under) drawImg(under, x, y);
      drawImg(img, x, y);
    };
  }
  for (var k in TILEMAP) {
    if (TILES[k] && has(TILEMAP[k])) TILES[k].draw = mktile(TILEMAP[k]);
  }
  /* tall grass sways: alternate the two AI frames on the map's 500ms tick
     (flags untouched — 't' keeps enc:true) */
  if (TILES['t'] && has('tile-tallgrass') && has('tile-tallgrass2')) {
    TILES['t'].draw = function (x, y, f) { drawImg(f ? 'tile-tallgrass2' : 'tile-tallgrass', x, y); };
  }
  /* props that sit on ground get a ground underlay where it matters */
  if (TILES['C'] && has('prop-cactus') && has('tile-grass')) TILES['C'].draw = mktile('prop-cactus', 'tile-grass');
  if (TILES['x'] && has('prop-cactus') && has('tile-sand')) TILES['x'].draw = mktile('prop-cactus', 'tile-sand');
  if (TILES['='] && has('prop-table') && has('tile-wood')) TILES['='].draw = mktile('prop-table', 'tile-wood');
  if (TILES['B'] && has('prop-bookshelf') && has('tile-wood')) TILES['B'].draw = mktile('prop-bookshelf', 'tile-wood');
  if (TILES['H'] && has('prop-bed') && has('tile-wood')) TILES['H'].draw = mktile('prop-bed', 'tile-wood');
  if (TILES['O'] && has('prop-stove') && has('tile-wood')) TILES['O'].draw = mktile('prop-stove', 'tile-wood');
  if (TILES['|'] && has('prop-fence') && has('tile-grass')) TILES['|'].draw = mktile('prop-fence', 'tile-grass');
  if (TILES['X'] && has('prop-column') && has('tile-grass')) TILES['X'].draw = mktile('prop-column', 'tile-grass');

  /* ---- AI overworld walkers: IMG['walk-<name>-down|up|side'] (~16x22) ----
     Same signature as the procedural drawWalker (name, dir, frame, x, y);
     World.drawPlayer and object drawing keep calling it unchanged.
     Sprites are ~22px tall, so draw at y-6 to plant the feet on the 16px
     tile; a truthy frame lifts 1px for a cheap GBA step-bob. Left faces are
     the mirrored side pose. Names without assets fall back to the old WALK. */
  var _procWalker = drawWalker;
  drawWalker = function (name, dir, frame, x, y) {
    var base = 'walk-' + name + '-';
    if (has(base + 'down')) {
      var pose = (dir === 'up') ? 'up' : (dir === 'down') ? 'down' : 'side';
      var yy = y - 6 - (frame ? 1 : 0);
      if (frame && has(base + pose + '2')) { drawImg(base + pose + '2', x, y - 6); return; }
      if (dir === 'left') drawImgFlipH(base + 'side', x, yy);
      else drawImg(base + pose, x, yy);
      return;
    }
    _procWalker(name, dir, frame, x, y);
  };
})();
