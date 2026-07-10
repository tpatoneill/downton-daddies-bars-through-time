/* tiles.js — 16x16 terrain tiles. Each entry: { solid, enc, draw(x,y,frame) }.
   Interactable objects (signs, machine, NPCs) are a separate map layer, not tiles. */
var TS = 16;

function _tf(x, y, base, speck, sc) { /* base fill + scattered speckles */
  px(x, y, TS, TS, base);
  if (!speck) return;
  var pts = [[2,3],[7,1],[12,5],[4,9],[10,11],[14,13],[1,13],[8,7]];
  for (var i = 0; i < pts.length; i++) px(x + pts[i][0], y + pts[i][1], 1, 1, speck);
}

var TILES = {
  ' ': { solid: false, draw: function (x, y) { px(x, y, TS, TS, COL.black); } },
  g: { solid: false, draw: function (x, y) { _tf(x, y, COL.grass, COL.grasstip);
        px(x + 3, y + 6, 2, 1, COL.grassd); px(x + 10, y + 3, 2, 1, COL.grassd); } },
  t: { solid: false, enc: true, draw: function (x, y, f) { px(x, y, TS, TS, COL.grassd);
        for (var i = 0; i < 4; i++) { var bx = x + 1 + i * 4, o = (f && i % 2) ? 1 : 0;
          px(bx, y + 8 - o, 2, 7, COL.grass); px(bx + 1, y + 5 - o, 1, 3, COL.grasstip); } } },
  p: { solid: false, draw: function (x, y) { _tf(x, y, COL.road, COL.roadd); } },
  d: { solid: false, draw: function (x, y) { _tf(x, y, COL.dirt, COL.dirtd); } },
  s: { solid: false, draw: function (x, y) { _tf(x, y, COL.sand, COL.sandd); } },
  w: { solid: true, draw: function (x, y, f) { px(x, y, TS, TS, COL.water);
        var o = f ? 2 : 0; px(x + 2 + o, y + 4, 5, 1, COL.waterd); px(x + 9 - o, y + 9, 5, 1, COL.waterd);
        px(x + 1, y + 11, 4, 1, COL.waterd); } },
  T: { solid: true, draw: function (x, y) { px(x, y, TS, TS, COL.grass);
        fillEll(x + 1, y - 2, x + 14, y + 12, COL.grassd); fillEll(x + 3, y, x + 12, y + 9, '#4f9a44');
        px(x + 7, y + 11, 3, 5, COL.woodd); } },
  '#': { solid: true, draw: function (x, y) { px(x, y, TS, TS, COL.stone);
        px(x, y, TS, 1, COL.stoned); px(x, y + 8, TS, 1, COL.stoned);
        px(x + 5, y, 1, 8, COL.stoned); px(x + 11, y + 8, 1, 8, COL.stoned); } },
  b: { solid: true, draw: function (x, y) { px(x, y, TS, TS, COL.wall); /* brick wall */
        px(x, y, TS, 1, COL.walld); px(x, y + 8, TS, 1, COL.walld);
        for (var i = 0; i < 2; i++) { px(x + 7, y + i * 8, 1, 8, COL.walld); px(x + 3, y + 8 + 0, 0, 0, COL.walld); } } },
  '.': { solid: false, draw: function (x, y) { px(x, y, TS, TS, COL.wood);
        px(x, y + 7, TS, 1, COL.woodd); px(x, y + 15, TS, 1, COL.woodd); } },
  r: { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#8b3c4c'); /* rug */
        px(x + 1, y + 1, TS - 2, TS - 2, '#a84c5c'); px(x + 3, y + 3, TS - 6, TS - 6, '#c05c6c'); } },
  m: { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#c8c0d8'); /* marble */
        px(x, y, TS, 1, '#e0d8e8'); px(x + 8, y, 1, TS, '#a8a0b8'); } },
  f: { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#2a2a3a'); /* disco floor tile */
        px(x + 1, y + 1, 6, 6, COL.neon); px(x + 9, y + 9, 6, 6, COL.neon2);
        px(x + 9, y + 1, 6, 6, '#3a3a4a'); px(x + 1, y + 9, 6, 6, '#3a3a4a'); } }
};

/* solid furniture / scenery tiles (still just tiles; interaction is separate) */
function furni(name, solid, drawFn) { TILES[name] = { solid: solid, draw: drawFn }; }
furni('=', true, function (x, y) { px(x, y, TS, TS, COL.wood); px(x + 1, y + 2, TS - 2, 5, COL.woodd);
  px(x, y + 1, TS, 1, COL.black); px(x + 2, y + 8, 2, 8, COL.woodd); px(x + 12, y + 8, 2, 8, COL.woodd); }); /* table */
furni('B', true, function (x, y) { px(x, y, TS, TS, COL.woodd); /* bookshelf */
  for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++)
    px(x + 1 + c * 4, y + 1 + r * 5, 3, 4, ['#c63a46','#349c8e','#e2b23e','#8b5cf6'][(r + c) % 4]); });
furni('H', true, function (x, y) { px(x, y, TS, TS, '#c05c6c'); /* bed */
  px(x + 1, y + 1, TS - 2, 5, COL.white); px(x + 1, y + 6, TS - 2, 9, '#c05c6c'); px(x, y, 3, TS, COL.woodd); });
furni('O', true, function (x, y) { px(x + 2, y + 2, 12, 12, COL.stoned); /* stove/hearth */
  px(x + 4, y + 6, 8, 8, '#e2b23e'); px(x + 6, y + 8, 4, 5, COL.red); });
furni('|', true, function (x, y) { px(x + 6, y, 4, TS, COL.wood); px(x + 4, y, 8, 3, COL.woodd); }); /* post/fence */
furni('C', true, function (x, y) { px(x, y, TS, TS, COL.grass); /* cactus */
  px(x + 6, y + 2, 4, 13, COL.tealtip); px(x + 2, y + 6, 4, 4, COL.tealtip); px(x + 10, y + 5, 4, 4, COL.tealtip);
  px(x + 2, y + 6, 2, 6, COL.teal); px(x + 12, y + 5, 2, 5, COL.teal); });
furni('X', true, function (x, y) { px(x, y, TS, TS, COL.stoned); px(x + 2, y + 2, 12, 12, COL.stone); /* rubble/column */
  px(x + 4, y, 8, TS, '#d8d0c0'); px(x + 5, y + 2, 1, TS, '#b0a898'); px(x + 10, y + 2, 1, TS, '#b0a898'); });
