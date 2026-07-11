/* sprites.js — Emerald-scale battle/dialogue sprites (ported from tools/hires.py)
   and 16px overworld walk sprites (ported from tools/sprites.py).
   Each battle sprite is ~48-60px tall, drawn at 1x. Overworld sprites are 16x16-ish. */

/* ---- palette (from hires.py) ---- */
var sK='#181820', sSK='#f4c898', sSD='#d09c6e', sWH='#f6f6fa', sGD='#e2b23e',
    sHT='#2c303c', sHTs='#3c4252', sHB='#9a2c3c', sCOAT='#3a3842', sCOs='#2a2832', sCOh='#4c4a56',
    sRD='#c63a46', sMC='#422a1a', sBL='#e2c26c', sBLs='#c09e4e', sBK='#32323e', sBKs='#24242e',
    sBE='#e0e0e8', sBEs='#b2b2be', sAU='#b05c30', sAUs='#8c4624', sTE='#349c8e', sTEs='#24746a',
    sBZ='#c49446', sBZs='#966a2c', sGL='#b0e0ec', sTRO='#34323a', sSHO='#1e1e26',
    sLF='#6ea84a', sLFh='#82be5a', sRC='#aa3434', sAR='#e2b23e', sARs='#966a2c';

/* pixel-ellipse helpers (absolute coords, PIL-style bounding box) */
function _ellIn(X, Y, cx, cy, rx, ry) { var a = (X - cx) / rx, b = (Y - cy) / ry; return a * a + b * b <= 1; }
function fillEll(x0, y0, x1, y1, c) {
  var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 0.5, ry = (y1 - y0) / 2 + 0.5;
  for (var Y = y0; Y <= y1; Y++) for (var X = x0; X <= x1; X++) if (_ellIn(X, Y, cx, cy, rx, ry)) px(X, Y, 1, 1, c);
}
function strokeEll(x0, y0, x1, y1, c) {
  var cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 0.5, ry = (y1 - y0) / 2 + 0.5;
  for (var Y = y0; Y <= y1; Y++) for (var X = x0; X <= x1; X++) {
    if (!_ellIn(X, Y, cx, cy, rx, ry)) continue;
    if (!_ellIn(X - 1, Y, cx, cy, rx, ry) || !_ellIn(X + 1, Y, cx, cy, rx, ry) ||
        !_ellIn(X, Y - 1, cx, cy, rx, ry) || !_ellIn(X, Y + 1, cx, cy, rx, ry)) px(X, Y, 1, 1, c);
  }
}
function drawEll(x0, y0, x1, y1, fill, outline) { fillEll(x0, y0, x1, y1, fill); if (outline) strokeEll(x0, y0, x1, y1, outline); }

/* Build a painter bound to an origin so we can port hires.py bodies verbatim-ish. */
function painter(ox, oy) {
  return {
    p: function (x, y, w, h, c) { px(ox + x, oy + y, w, h, c); },
    ell: function (x0, y0, x1, y1, fill, outline) { drawEll(ox + x0, oy + y0, ox + x1, oy + y1, fill, outline); },
    eo:  function (x0, y0, x1, y1, outline) { strokeEll(ox + x0, oy + y0, ox + x1, oy + y1, outline); }
  };
}

/* ---- shared body primitives (ported) ---- */
function _hat(g, cx, top, crown_h, band, extra) {
  crown_h = crown_h || 9; band = band || sHB; extra = extra || 0;
  var ch = crown_h + extra;
  g.p(cx - 10, top, 20, ch, sHT);
  g.p(cx - 10, top, 20, 1, sK);
  g.p(cx - 10, top, 1, ch, sK); g.p(cx + 9, top, 1, ch, sK);
  g.p(cx - 9, top + 1, 2, ch - 2, sHTs);
  g.p(cx - 9, top + ch - 3, 18, 2, band);
  g.p(cx - 15, top + ch, 30, 3, sHT);
  g.p(cx - 15, top + ch, 30, 1, sK);
  g.p(cx - 15, top + ch + 2, 30, 1, sK);
  g.p(cx - 15, top + ch, 1, 3, sK); g.p(cx + 14, top + ch, 1, 3, sK);
  return top + ch + 3;
}
function _face(g, cx, ytop, jaw) {
  jaw = jaw || 17;
  g.ell(cx - 9, ytop - 2, cx + 9, ytop + jaw, sSK, sK);
  g.p(cx - 7, ytop + jaw - 4, 14, 2, sSD);
  return ytop;
}
function _eyes(g, cx, ey, squint, brows) {
  var exs = [cx - 6, cx + 2], i;
  for (i = 0; i < 2; i++) {
    var ex = exs[i];
    if (squint) g.p(ex, ey + 1, 4, 1, sK);
    else { g.p(ex, ey, 4, 4, sWH); g.p(ex + 2, ey + 1, 2, 2, sK); }
  }
  if (brows) { var bxs = [cx - 7, cx + 2]; for (i = 0; i < 2; i++) g.p(bxs[i], ey - 3, 5, brows, sK); }
  g.p(cx - 1, ey + 4, 2, 2, sSD);
}
function _glasses(g, cx, ey, color) {
  color = color || sGD;
  g.eo(cx - 8, ey - 2, cx - 1, ey + 5, color);
  g.eo(cx + 1, ey - 2, cx + 8, ey + 5, color);
  g.p(cx - 1, ey + 1, 2, 1, color);
  g.p(cx - 11, ey, 3, 1, color); g.p(cx + 9, ey, 3, 1, color);
}
function _smile(g, cx, my, wide) {
  if (wide) {
    g.p(cx - 4, my, 8, 1, sK);
    g.p(cx - 5, my - 1, 1, 1, sK); g.p(cx + 4, my - 1, 1, 1, sK);
    g.p(cx - 3, my + 1, 6, 1, sWH);
  } else {
    g.p(cx - 3, my, 6, 1, sK);
    g.p(cx - 4, my - 1, 1, 1, sK); g.p(cx + 3, my - 1, 1, 1, sK);
  }
}
function _coatBody(g, cx, ytop, ybot, coat, shade, hi, shirt, lapels, skirt) {
  coat = coat || sCOAT; shade = shade || sCOs; hi = hi || sCOh; shirt = shirt || sWH;
  var w = 13, i, s;
  g.p(cx - w, ytop, w * 2, ybot - ytop, coat);
  if (skirt) {
    g.p(cx - w - 2, ybot - 8, 2, 8, coat); g.p(cx + w, ybot - 8, 2, 8, coat);
    g.p(cx - w - 3, ybot - 4, 1, 4, coat); g.p(cx + w + 2, ybot - 4, 1, 4, coat);
  }
  g.p(cx - w, ytop, 1, ybot - ytop, sK); g.p(cx + w - 1, ytop, 1, ybot - ytop, sK);
  g.p(cx - w, ytop, w * 2, 1, sK); g.p(cx - w, ybot - 1, w * 2, 1, sK);
  g.p(cx - w + 1, ytop + 1, 2, ybot - ytop - 2, hi);
  g.p(cx + w - 4, ytop + 1, 3, ybot - ytop - 2, shade);
  var sh = Math.min(14, ybot - ytop - 4);
  g.p(cx - 3, ytop, 6, sh, shirt);
  g.p(cx - 3, ytop, 1, sh, sK); g.p(cx + 2, ytop, 1, sh, sK);
  if (lapels !== false) for (s = -1; s <= 1; s += 2) for (i = 0; i < 5; i++)
    g.p(cx + s * (4 + i) - (s < 0 ? 1 : 0), ytop + i, 1, 3, shade);
}
function _arms(g, cx, ytop, length, coat, hands) {
  length = length || 17; coat = coat || sCOAT; hands = hands !== false;
  for (var s = -1; s <= 1; s += 2) {
    var ax = cx + s * 13 + (s < 0 ? 0 : -1), x0 = s > 0 ? ax : ax - 4;
    g.p(x0, ytop + 1, 5, length, coat);
    g.p(x0, ytop + 1, 5, 1, sK);
    g.p(x0 + (s < 0 ? 0 : 4), ytop + 1, 1, length, sK);
    g.p(x0 + (s < 0 ? 4 : 0), ytop + 1, 1, length, sK);
    if (hands) { g.p(x0 + 1, ytop + length, 3, 3, sSK); g.p(x0 + 1, ytop + length + 2, 3, 1, sSD); }
  }
}
function _legs(g, cx, ytop, h) {
  h = h || 7;
  for (var s = -1; s <= 1; s += 2) {
    var lx = s < 0 ? cx - 8 : cx + 1;
    g.p(lx, ytop, 8, h - 2, sTRO);
    g.p(lx, ytop, 1, h - 2, sK); g.p(lx + 7, ytop, 1, h - 2, sK);
    g.p(lx - (s < 0 ? 1 : 0), ytop + h - 2, 9, 2, sSHO);
    g.p(lx - (s < 0 ? 1 : 0), ytop + h - 1, 9, 1, sK);
  }
}

/* ====================== battle/dialogue sprites ====================== */
var SPR = {};
SPR.samuel = function (ox, oy, opt) {
  var g = painter(ox, oy), cx = 24, tf = opt && opt.trueForm;
  var ub = _hat(g, cx, 2), ytop = _face(g, cx, ub + 1);
  g.p(cx - 8, ytop - 1, 16, 4, sBL);
  g.p(cx - 8, ytop + 2, 3, 2, sBLs);
  g.p(cx - 9, ytop + 1, 2, 12, sBL); g.p(cx + 7, ytop + 1, 2, 12, sBL);
  g.p(cx - 9, ytop + 11, 2, 2, sBLs); g.p(cx + 7, ytop + 11, 2, 2, sBLs);
  if (tf) {
    g.p(cx - 11, ytop + 3, 3, 20, sBL); g.p(cx + 8, ytop + 3, 3, 20, sBL);
    g.p(cx - 11, ytop + 21, 2, 3, sBLs); g.p(cx + 9, ytop + 21, 2, 3, sBLs);
  }
  var ey = ytop + 6;
  _eyes(g, cx, ey, false, 1);
  if (tf) { _smile(g, cx, ytop + 14); }
  else {
    g.p(cx - 8, ey + 6, 7, 3, sMC); g.p(cx - 8, ey + 9, 2, 1, sMC);
    g.p(cx + 1, ey + 5, 7, 3, sMC); g.p(cx + 6, ey + 8, 2, 1, sMC);
  }
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53); _arms(g, cx, sh);
  g.p(cx - 4, sh + 1, 3, 3, sRD); g.p(cx + 1, sh + 1, 3, 3, sRD);
  g.p(cx - 1, sh + 2, 2, 2, '#96283c');
  g.p(cx + 3, sh + 12, 1, 1, sGD); g.p(cx + 4, sh + 13, 1, 1, sGD); g.p(cx + 5, sh + 12, 1, 1, sGD);
  _legs(g, cx, 53);
  if (tf) { /* crown for true form */ g.p(cx - 6, -1, 12, 2, sGD); g.p(cx - 6, -3, 2, 2, sGD); g.p(cx - 1, -3, 2, 2, sGD); g.p(cx + 4, -3, 2, 2, sGD); }
};
SPR.william = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i, s;
  g.p(cx - 14, 14, 5, 22, sBK); g.p(cx + 9, 14, 5, 22, sBK);
  var arr = [-1, 1];
  for (i = 0; i < 2; i++) { s = arr[i]; var x0 = s < 0 ? cx - 14 : cx + 9;
    g.p(x0 + 1, 36, 3, 2, sBK); g.p(x0, 34, 1, 2, sBKs); g.p(x0 + (s < 0 ? 0 : 2), 33, 2, 3, sBKs); }
  g.p(cx - 13, 14, 1, 20, sBKs); g.p(cx + 12, 14, 1, 20, sBKs);
  var ub = _hat(g, cx, 2, 8), ytop = _face(g, cx, ub + 1);
  g.p(cx - 8, ytop - 1, 16, 3, sBK);
  var ey = ytop + 6;
  _eyes(g, cx, ey); _glasses(g, cx, ey); _smile(g, cx, ytop + 13, true);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53); _arms(g, cx, sh);
  g.ell(cx - 5, sh - 1, cx + 5, sh + 6, sWH, sK);
  g.p(cx - 3, sh + 2, 2, 1, '#d2d2dc'); g.p(cx + 1, sh + 4, 2, 1, '#d2d2dc');
  g.p(cx - 1, sh + 3, 2, 2, sGD);
  _legs(g, cx, 53);
};
SPR.herschel = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, dy = 3;
  var ub = _hat(g, cx, 2 + dy, 7), ytop = _face(g, cx, ub + 1);
  var ey = ytop + 5;
  _eyes(g, cx, ey, true, 2);
  g.ell(cx - 9, ey + 3, cx + 9, ey + 16, sBE, sK);
  g.p(cx - 7, ey + 13, 14, 2, sBEs); g.p(cx - 6, ey + 15, 12, 1, sBEs);
  g.p(cx - 3, ey + 7, 6, 1, sK); g.p(cx - 1, ey + 4, 2, 2, sSD);
  var sh = ytop + 16;
  _coatBody(g, cx, sh, 53);
  g.p(cx - 6, sh + 3, 2, 2, sHB); g.p(cx + 4, sh + 3, 2, 2, sHB);
  g.p(cx - 6, sh + 8, 2, 2, sHB); g.p(cx + 4, sh + 8, 2, 2, sHB);
  _arms(g, cx, sh, 15);
  g.p(cx + 17, sh + 2, 2, 22, sBZs); g.p(cx + 15, sh + 1, 5, 2, sBZ); g.p(cx + 16, sh + 24, 4, 1, sK);
  _legs(g, cx, 53);
};
SPR.rosalind = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var ub = _hat(g, cx, 2, 9);
  g.p(cx - 10, 6, 20, 2, sBZs);
  var gxs = [cx - 8, cx + 1];
  for (i = 0; i < 2; i++) { var gx = gxs[i]; g.p(gx, 4, 7, 5, sBZ); g.p(gx + 1, 5, 5, 3, sGL); g.p(gx, 4, 7, 1, sK); g.p(gx, 8, 7, 1, sK); }
  var ytop = _face(g, cx, ub + 1);
  g.p(cx - 8, ytop - 1, 16, 4, sAU); g.p(cx + 3, ytop + 1, 5, 2, sAUs);
  var bxs = [cx - 13, cx + 8];
  for (i = 0; i < 2; i++) { var bx = bxs[i]; g.ell(bx, ytop + 6, bx + 5, ytop + 12, sAU, sK); g.p(bx + 1, ytop + 7, 2, 2, sAUs); }
  var ey = ytop + 6;
  _eyes(g, cx, ey); _glasses(g, cx, ey); _smile(g, cx, ytop + 13);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, sTE, sTEs, '#50b6a8', sWH, true, true);
  _arms(g, cx, sh, 17, sTE);
  g.p(cx - 1, sh + 2, 2, 2, sBZ);
  _legs(g, cx, 53);
};
SPR.maximvs = function (ox, oy) {
  var g = painter(ox, oy), cx = 26, i, s;
  g.p(cx - 17, 26, 5, 26, sRC); g.p(cx + 12, 26, 5, 26, sRC);
  g.p(cx - 17, 26, 1, 26, sK); g.p(cx + 16, 26, 1, 26, sK);
  g.ell(cx - 9, 4, cx + 9, 14, '#60422a', sK);
  var lxs = [cx - 10, cx - 6, cx + 3, cx + 7];
  for (i = 0; i < 4; i++) { g.p(lxs[i], 5, 3, 2, sLF); g.p(lxs[i] + 1, 4, 2, 2, sLFh); }
  var ytop = _face(g, cx, 9), ey = ytop + 6;
  _eyes(g, cx, ey, false, 2);
  g.p(cx - 3, ytop + 14, 6, 1, sK); g.p(cx - 4, ytop + 13, 1, 1, sK); g.p(cx + 3, ytop + 13, 1, 1, sK);
  var sh = ytop + 17;
  g.p(cx - 13, sh, 26, 18, sGD);
  g.p(cx - 13, sh, 26, 1, sK); g.p(cx - 13, sh + 17, 26, 1, sK);
  g.p(cx - 13, sh, 1, 18, sK); g.p(cx + 12, sh, 1, 18, sK);
  g.p(cx - 1, sh + 1, 2, 16, sBZs);
  g.p(cx - 11, sh + 3, 4, 3, sBZs); g.p(cx + 7, sh + 3, 4, 3, sBZs);
  g.p(cx - 15, sh - 1, 6, 5, sGD); g.p(cx + 9, sh - 1, 6, 5, sGD);
  g.p(cx - 15, sh - 1, 6, 1, sK); g.p(cx + 9, sh - 1, 6, 1, sK);
  for (i = 0; i < 5; i++) { g.p(cx - 11 + i * 5, sh + 18, 3, 6, sBZ); g.p(cx - 11 + i * 5, sh + 23, 3, 1, sK); }
  for (s = -1; s <= 1; s += 2) { var x0 = cx + s * 15 - (s < 0 ? 4 : 0); g.p(x0, sh + 4, 4, 13, sSK); g.p(x0, sh + 4, 4, 1, sK); g.p(x0, sh + 10, 4, 2, sBZ); }
  _legs(g, cx, 53, 7);
};
/* Jake — cowboy, ROAST. Matching style. */
SPR.jake = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  /* cowboy hat */
  g.p(cx - 8, 6, 16, 7, '#6e4a2c'); g.p(cx - 8, 6, 16, 1, sK);
  g.p(cx - 7, 7, 3, 4, '#84603a'); g.p(cx - 8, 11, 16, 2, '#5a3c22');
  g.p(cx - 15, 12, 30, 3, '#6e4a2c'); g.p(cx - 15, 12, 30, 1, sK); g.p(cx - 15, 14, 30, 1, sK);
  var ytop = _face(g, cx, 16, 16), ey = ytop + 5;
  _eyes(g, cx, ey, true, 1);
  /* stubble + scowl */
  g.p(cx - 3, ytop + 11, 6, 1, sK);
  g.p(cx - 5, ytop + 9, 10, 2, sSD);
  var sh = ytop + 15;
  _coatBody(g, cx, sh, 53, '#7a5030', '#5a3c22', '#96663c', '#c8b48c');
  /* red bandana */
  g.p(cx - 5, sh - 1, 10, 3, sRD); g.p(cx - 2, sh + 1, 4, 2, '#96283c');
  _arms(g, cx, sh, 16, '#7a5030');
  /* star badge */
  g.p(cx - 8, sh + 5, 3, 3, sGD); g.p(cx - 7, sh + 4, 1, 5, sGD); g.p(cx - 9, sh + 6, 5, 1, sGD);
  _legs(g, cx, 53);
};
/* Rex — disco king, HEART. Afro + shades + collar. */
SPR.rex = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  g.ell(cx - 12, 0, cx + 12, 18, '#2a2028', sK); /* afro */
  g.p(cx - 12, 8, 3, 6, '#3a2c34'); g.p(cx + 9, 8, 3, 6, '#3a2c34');
  var ytop = _face(g, cx, 15), ey = ytop + 6;
  /* shades */
  g.p(cx - 8, ey - 1, 7, 4, sK); g.p(cx + 1, ey - 1, 7, 4, sK); g.p(cx - 1, ey, 2, 1, sK);
  g.p(cx - 7, ey, 2, 1, '#4ff0ff'); g.p(cx + 2, ey, 2, 1, '#4ff0ff');
  _smile(g, cx, ytop + 13, true);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, '#8b3ca8', '#6a2c84', '#a44fc0', '#ff4fd8', false);
  /* big collar wings */
  g.p(cx - 15, sh - 1, 6, 6, '#ff4fd8'); g.p(cx + 9, sh - 1, 6, 6, '#ff4fd8');
  g.p(cx - 15, sh - 1, 6, 1, sK); g.p(cx + 9, sh - 1, 6, 1, sK);
  _arms(g, cx, sh, 17, '#8b3ca8');
  /* gold medallion */
  g.p(cx - 2, sh + 8, 4, 4, sGD); g.p(cx - 1, sh + 9, 2, 2, sBZs);
  _legs(g, cx, 53);
};
/* Snobbington — WORDPLAY. Extra-tall hat, monocle, cravat. */
SPR.snob = function (ox, oy, opt) {
  var g = painter(ox, oy), cx = 24, fin = opt && opt.finalDraft;
  var ub = _hat(g, cx, 0, 9, fin ? '#c63a46' : sHB, 6);
  var ytop = _face(g, cx, ub + 1), ey = ytop + 6;
  _eyes(g, cx, ey, false, 1);
  /* monocle on right eye */
  g.eo(cx + 1, ey - 2, cx + 8, ey + 5, sGD);
  g.p(cx + 8, ey + 5, 1, 4, sGD);
  /* sneer */
  g.p(cx - 3, ytop + 14, 6, 1, sK); g.p(cx - 4, ytop + 15, 2, 1, sK);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, fin ? '#3a2a4a' : '#2a2a34', '#1a1a24', '#4a3a5a', fin ? '#e2b23e' : sWH);
  /* purple cravat */
  g.p(cx - 4, sh + 1, 8, 5, fin ? '#e2b23e' : '#8b5cf6'); g.p(cx - 2, sh + 3, 4, 3, fin ? '#c09030' : '#6a3cc0');
  _arms(g, cx, sh, 17, fin ? '#3a2a4a' : '#2a2a34');
  _legs(g, cx, 53);
};
/* Gerald — Scripted Order goon. Cravat, clipboard. */
SPR.gerald = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var ub = _hat(g, cx, 6, 6, '#5a5a6a'), ytop = _face(g, cx, ub + 1), ey = ytop + 6;
  _eyes(g, cx, ey, false, 1);
  g.p(cx - 3, ytop + 13, 6, 1, sK); /* flat mouth */
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, '#4a4a5a', '#34343f', '#5a5a6a', '#c9b6e6');
  g.p(cx - 4, sh + 1, 8, 4, '#8b5cf6'); /* cravat */
  _arms(g, cx, sh);
  /* clipboard */
  g.p(cx + 9, sh + 8, 6, 8, '#c8b48c'); g.p(cx + 9, sh + 8, 6, 1, sK); g.p(cx + 10, sh + 10, 4, 1, sK); g.p(cx + 10, sh + 12, 4, 1, sK);
  _legs(g, cx, 53);
};
/* Editor — Order mini-boss. Taller hat + red pen. */
SPR.editor = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var ub = _hat(g, cx, 3, 8, '#c63a46'), ytop = _face(g, cx, ub + 1), ey = ytop + 6;
  _eyes(g, cx, ey, false, 2); _glasses(g, cx, ey, '#c63a46');
  g.p(cx - 3, ytop + 14, 6, 1, sK);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, '#3a3a4a', '#2a2a34', '#4a4a5a', sWH);
  g.p(cx - 4, sh + 1, 8, 4, '#c63a46');
  _arms(g, cx, sh);
  g.p(cx + 10, sh + 6, 2, 10, '#c63a46'); g.p(cx + 10, sh + 4, 2, 2, sGD); /* red pen */
  _legs(g, cx, 53);
};
/* Babbage — brass automaton butler. */
SPR.babbage = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  /* dome head */
  g.ell(cx - 9, 4, cx + 9, 22, sBZ, sK);
  g.p(cx - 7, 6, 3, 4, '#d8b060');
  g.p(cx - 6, 12, 4, 4, sWH); g.p(cx + 2, 12, 4, 4, sWH); /* glass eyes */
  g.p(cx - 5, 13, 2, 2, '#4ff0ff'); g.p(cx + 3, 13, 2, 2, '#4ff0ff');
  g.p(cx - 4, 18, 8, 1, sBZs); /* grille mouth */
  g.p(cx - 4, 20, 8, 1, sBZs);
  g.p(cx - 1, 0, 2, 4, sBZs); g.p(cx - 2, -1, 4, 2, sGD); /* antenna */
  var sh = 26;
  _coatBody(g, cx, sh, 53, sBZ, sBZs, '#d8b060', '#f6f6fa');
  g.p(cx - 2, sh + 4, 4, 4, '#4ff0ff'); g.p(cx - 1, sh + 5, 2, 2, sWH); /* chest gauge */
  _arms(g, cx, sh, 17, sBZ);
  _legs(g, cx, 53);
};
/* Generic street-cypher foes (era-flavored), compact. */
SPR.orator = function (ox, oy) { /* Rome */
  var g = painter(ox, oy), cx = 24;
  g.ell(cx - 9, 6, cx + 9, 24, sSK, sK); g.p(cx - 8, 7, 16, 2, '#c0a058'); /* balding + laurel */
  g.p(cx - 8, 6, 3, 2, sLF); g.p(cx + 5, 6, 3, 2, sLF);
  var ey = 14; _eyes(g, cx, ey, false, 1); g.p(cx - 3, 21, 6, 1, sK);
  var sh = 27; g.p(cx - 13, sh, 26, 26, sWH); g.p(cx - 13, sh, 26, 1, sK); g.p(cx - 13, sh + 25, 26, 1, sK);
  g.p(cx - 13, sh, 1, 26, sK); g.p(cx + 12, sh, 1, 26, sK);
  for (var i = 0; i < 4; i++) g.p(cx - 10 + i * 6, sh + 2, 1, 22, '#d8d8e0'); /* toga folds */
  g.p(cx + 4, sh + 2, 4, 22, '#c63a46'); /* sash */
  _legs(g, cx, 53);
};
SPR.poet = function (ox, oy) { /* West tumbleweed poet */
  var g = painter(ox, oy), cx = 24;
  g.p(cx - 8, 8, 16, 5, '#8c6a3c'); g.p(cx - 12, 12, 24, 2, '#8c6a3c'); /* floppy hat */
  var ytop = _face(g, cx, 15), ey = ytop + 5; _eyes(g, cx, ey, true, 1);
  g.p(cx - 4, ytop + 9, 8, 3, sBE); /* scruffy */
  var sh = ytop + 15; _coatBody(g, cx, sh, 53, '#6a6a52', '#4a4a3a', '#8a8a6a', '#c8b48c');
  _arms(g, cx, sh, 16, '#6a6a52'); _legs(g, cx, 53);
};
SPR.senator = function (ox, oy) { /* Rome gossiping senator - reuse orator tint */ SPR.orator(ox, oy); };
SPR.dancer = function (ox, oy) { /* NYC */
  var g = painter(ox, oy), cx = 24;
  g.ell(cx - 10, 2, cx + 10, 16, '#3a2c34', sK);
  var ytop = _face(g, cx, 14), ey = ytop + 6;
  g.p(cx - 7, ey, 5, 2, sK); g.p(cx + 2, ey, 5, 2, sK); /* shades */
  _smile(g, cx, ytop + 12);
  var sh = ytop + 16; _coatBody(g, cx, sh, 53, '#e05f8f', '#b0356a', '#ff7faf', '#4ff0ff', false);
  _arms(g, cx, sh, 17, '#e05f8f'); _legs(g, cx, 53);
};
SPR.heckler = function (ox, oy) { /* Act 0 tutorial foe */
  var g = painter(ox, oy), cx = 24;
  g.p(cx - 7, 6, 14, 5, '#5a4a3a'); g.p(cx - 10, 10, 20, 2, '#5a4a3a'); /* flat cap */
  var ytop = _face(g, cx, 13), ey = ytop + 6; _eyes(g, cx, ey, false, 1);
  g.p(cx - 3, ytop + 13, 6, 1, sK); g.p(cx - 4, ytop + 14, 2, 1, sK);
  var sh = ytop + 16; _coatBody(g, cx, sh, 53, '#5a5548', '#3f3c34', '#6e685a', '#b0a890');
  _arms(g, cx, sh); _legs(g, cx, 53);
};

/* ====================== 16px overworld walk sprites ====================== */
/* Ported from tools/sprites.py + generated variants. 4 dir x 2 frames. */
var wK = sK, wHT = sHT, wS = sSK, wM = sMC, wN = sCOAT, wW = sWH, wY = sBL,
    wBZ = sBZ, wBD = sBZs, wTE = sTE, wRY = sCOAT, wBR = '#4a3c30', wBE = sBE;

/* Samuel overworld (from sprites.py, extended to 4 dirs) */
var SAMUEL_WALK_DOWN = "....KKKKKKKK....\n...KHHHHHHHHK...\n...KHHHHHHHHK...\n..KKKKKKKKKKKK..\n...KYYYYYYYYK...\n...KYKSSSSKYK...\n...KSSSSSSSSK...\n...KSKMMMMKSK...\n....KKKKKKKK....\n..KKNNKWWKNNKK..\n..KNNNKWWKNNNK..\n..KNNNKWWKNNNK..\n...KNNNNNNNNK...\n...KNKKKKKKNK...\n...KNK....KNK...\n...KKK....KKK...";
var SAMUEL_WALK_UP = "....KKKKKKKK....\n...KHHHHHHHHK...\n...KHHHHHHHHK...\n..KKKKKKKKKKKK..\n...KYYYYYYYYK...\n...KYYYYYYYYK...\n...KYYYYYYYYK...\n...KYYYYYYYYK...\n....KKKKKKKK....\n..KKNNKNNKNNKK..\n..KNNNKNNKNNNK..\n..KNNNKNNKNNNK..\n...KNNNNNNNNK...\n...KNKKKKKKNK...\n...KNK....KNK...\n...KKK....KKK...";
function samuelWalkLegend() { return {K: sK, H: sHT, S: sSK, M: sMC, N: sCOAT, W: sWH, Y: sBL}; }

/* Registry of overworld actors → draw(dir, frame, x, y) */
var WALK = {};
function regSimpleWalker(name, legend, downArt, upArt) {
  /* Derive left/right by mirroring arms; keep it simple: reuse down with shifted legs. */
  WALK[name] = {
    legend: legend,
    draw: function (dir, frame, x, y) {
      var art = (dir === 'up') ? upArt : downArt;
      /* leg bob: on odd frame nudge nothing (kept legible & cheap) */
      drawGrid(art, legend, x, y, 1);
      if (frame && (dir === 'left' || dir === 'right' || dir === 'down' || dir === 'up')) {
        /* simple step: redraw one foot lower for motion feel */
        px(x + 4, y + 15, 3, 1, legend.N || sCOAT);
        px(x + 9, y + 14, 3, 1, legend.N || sCOAT);
      }
    }
  };
}
regSimpleWalker('samuel', samuelWalkLegend(), SAMUEL_WALK_DOWN, SAMUEL_WALK_UP);

/* Generic NPC walker built from a config, registered by name */
function defWalker(name, cfg) {
  var hair = cfg.hair || sBL, coat = cfg.coat || sCOAT, hat = cfg.hat || sHT, mous = cfg.mous;
  var legend = {K: sK, H: hat, S: sSK, M: mous || sMC, N: coat, W: sWH, Y: hair, R: cfg.accent || sRD};
  var mrow = mous ? "SKMMMMKS" : "SSSKKSSS";
  var hairtop = cfg.hairShow === false ? "HHHHHHHH" : "YYYYYYYY";
  var down =
    "....KKKKKKKK....\n" +
    "...K"+ (cfg.hatShow===false?"YYYYYYYY":"HHHHHHHH") +"K...\n" +
    "...K"+ (cfg.hatShow===false?"YYYYYYYY":"HHHHHHHH") +"K...\n" +
    "..KKKKKKKKKKKK..\n" +
    "...K"+hairtop+"K...\n" +
    "...KYKSSSSKYK...\n" +
    "...KSSSSSSSSK...\n" +
    "...K"+mrow+"K...\n" +
    "....KKKKKKKK....\n" +
    "..KKNNKWWKNNKK..\n" +
    "..KNNNKWWKNNNK..\n" +
    "..KNNNKWWKNNNK..\n" +
    "...KNNNNNNNNK...\n" +
    "...KNKKKKKKNK...\n" +
    "...KNK....KNK...\n" +
    "...KKK....KKK...";
  var up = down.replace("KYKSSSSKYK", "KYYYYYYYYK").replace(mrow, "SSSSSSSS").replace("KYKSSSSKYK","KYYYYYYYYK");
  regSimpleWalker(name, legend, down, up);
}
defWalker('babbage', {hat: sBZ, hair: sBZ, coat: sBZ, coatd: sBZs, accent: '#4ff0ff', hatShow: true});
defWalker('herschel', {hat: sHT, hair: sBE, coat: '#4a3c30', mous: sBE});
defWalker('william', {hat: sHT, hair: sBK, coat: sCOAT, accent: sGD});
defWalker('rosalind', {hat: sHT, hair: sAU, coat: sTE});
defWalker('villager', {hat: '#8a6a4a', hair: '#6a4a2a', coat: '#6a7a8a'});
defWalker('villager2', {hat: '#a06a3a', hair: '#3a2a1a', coat: '#7a5a4a'});
defWalker('gerald', {hat: '#5a5a6a', hair: '#3a3a4a', coat: '#4a4a5a', accent: '#8b5cf6'});
defWalker('roman', {hat: '#c0a058', hair: '#3a2a1a', coat: '#e8e8f0', hatShow: false});
defWalker('cowboy', {hat: '#6e4a2c', hair: '#3a2a1a', coat: '#7a5030'});
defWalker('discoer', {hat: '#e05f8f', hair: '#2a2028', coat: '#8b3ca8', hatShow: false, accent: '#4ff0ff'});

/* Order Editor — a detailed custom walker (red-banded hat, red glasses, red pen). */
var EDITOR_WALK_DOWN =
  "....KKKKKKKK....\n" +
  "...KHHHHHHHHK...\n" +
  "...KHBBBBBBHK...\n" +
  "..KKKKKKKKKKKK..\n" +
  "...KDDDDDDDDK...\n" +
  "...KGGSSSSGGK...\n" +
  "...KSGSSSSGSK...\n" +
  "...KSSSKKSSSK...\n" +
  "....KKKKKKKK....\n" +
  "..KKNNKCCKNNKK..\n" +
  "..KNNNKCCKNNNKP.\n" +
  "..KNNNKWWKNNNKP.\n" +
  "...KNNNNNNNNK...\n" +
  "...KNKKKKKKNK...\n" +
  "...KNK....KNK...\n" +
  "...KKK....KKK...";
var EDITOR_WALK_UP =
  "....KKKKKKKK....\n" +
  "...KHHHHHHHHK...\n" +
  "...KHBBBBBBHK...\n" +
  "..KKKKKKKKKKKK..\n" +
  "...KDDDDDDDDK...\n" +
  "...KDDDDDDDDK...\n" +
  "...KDDDDDDDDK...\n" +
  "...KSSSSSSSSK...\n" +
  "....KKKKKKKK....\n" +
  "..KKNNKNNKNNKK..\n" +
  "..KNNNKNNKNNNKP.\n" +
  "..KNNNKWWKNNNKP.\n" +
  "...KNNNNNNNNK...\n" +
  "...KNKKKKKKNK...\n" +
  "...KNK....KNK...\n" +
  "...KKK....KKK...";
regSimpleWalker('editor', { K: sK, H: '#2c303c', B: '#c63a46', D: '#24242e', G: '#c63a46',
  S: sSK, C: '#c63a46', N: '#3a3a4a', W: '#f6f6fa', P: '#c63a46' }, EDITOR_WALK_DOWN, EDITOR_WALK_UP);

function drawWalker(name, dir, frame, x, y) {
  var w = WALK[name] || WALK.villager;
  w.draw(dir, frame, x, y);
}
