/* gfx.js — pixel font, draw helpers, palette, transitions.
   240x160 full-color canvas. px() takes a CSS color string directly. */

/* named palette (GBA-bright). Referenced by sprites, tiles, UI. */
var COL = {
  black:'#181820', out:'#181820', white:'#f6f6fa', cream:'#fdf0d5',
  sky:'#6cc7f2', skyd:'#4aa8e0', night:'#26314f', nightd:'#1a2138',
  grass:'#5aa84a', grassd:'#3f7f36', grasstip:'#7cc85c',
  dirt:'#c8a46a', dirtd:'#a07f4c', road:'#b9a48c', roadd:'#8f7c68',
  stone:'#9aa0b0', stoned:'#6f7688', water:'#3f8fd0', waterd:'#2f6fb0',
  wood:'#8a5a34', woodd:'#5e3c22', wall:'#c8b48c', walld:'#9a8560',
  gold:'#e2b23e', red:'#c63a46', pink:'#e05f8f', teal:'#349c8e', tealtip:'#52c0b0',
  purple:'#8b5cf6', sand:'#e0c078', sandd:'#c0a058',
  skin:'#f4c898', skind:'#ce9c6a', hat:'#2c3040', hatd:'#3c4252', hatband:'#9a2c3c',
  coat:'#3a3842', coatd:'#2a2832', coath:'#4c4a56', blonde:'#e2c26c', blondd:'#c09e4e',
  beard:'#e0e0e8', beardd:'#b2b2be', bhair:'#32323e', auburn:'#b05c30', auburnd:'#8c4624',
  brass:'#c49446', brassd:'#966a2c', neon:'#ff4fd8', neon2:'#4ff0ff', crowd:'#3a2d5a'
};

var cv = null, ctx = null; /* set by shell */
function gfxInit(canvas) { cv = canvas; ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false; }

function px(x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}
function cls(c) { px(0, 0, 240, 160, c || COL.black); }

/* pixel font (4x5-ish, variable width) — ported/expanded from v1 */
var FONT = {
  'A':'.XX.|X..X|XXXX|X..X|X..X','B':'XXX.|X..X|XXX.|X..X|XXX.','C':'.XXX|X...|X...|X...|.XXX',
  'D':'XXX.|X..X|X..X|X..X|XXX.','E':'XXXX|X...|XXX.|X...|XXXX','F':'XXXX|X...|XXX.|X...|X...',
  'G':'.XXX|X...|X.XX|X..X|.XXX','H':'X..X|X..X|XXXX|X..X|X..X','I':'XXX|.X.|.X.|.X.|XXX',
  'J':'..XX|...X|...X|X..X|.XX.','K':'X..X|X.X.|XX..|X.X.|X..X','L':'X...|X...|X...|X...|XXXX',
  'M':'X...X|XX.XX|X.X.X|X...X|X...X','N':'X..X|XX.X|X.XX|X..X|X..X','O':'.XX.|X..X|X..X|X..X|.XX.',
  'P':'XXX.|X..X|XXX.|X...|X...','Q':'.XX.|X..X|X..X|X.XX|.XXX','R':'XXX.|X..X|XXX.|X.X.|X..X',
  'S':'.XXX|X...|.XX.|...X|XXX.','T':'XXX|.X.|.X.|.X.|.X.','U':'X..X|X..X|X..X|X..X|.XX.',
  'V':'X...X|X...X|.X.X.|.X.X.|..X..','W':'X...X|X...X|X.X.X|XX.XX|X...X',
  'X':'X..X|X..X|.XX.|X..X|X..X','Y':'X.X|X.X|.X.|.X.|.X.','Z':'XXXX|...X|.XX.|X...|XXXX',
  '0':'.XX.|X..X|X.XX|XX.X|.XX.','1':'.X.|XX.|.X.|.X.|XXX','2':'XX.|..X|.X.|X..|XXX',
  '3':'XX.|..X|.X.|..X|XX.','4':'X.X|X.X|XXX|..X|..X','5':'XXX|X..|XX.|..X|XX.',
  '6':'.XX|X..|XXX|X.X|XXX','7':'XXX|..X|.X.|.X.|.X.','8':'XXX|X.X|XXX|X.X|XXX',
  '9':'XXX|X.X|XXX|..X|XX.',
  '.':'.|.|.|.|X',',':'..|..|..|.X|X.','!':'X|X|X|.|X','?':'XX.|..X|.X.|...|.X.',
  "'":'X|X|.|.|.','-':'...|...|XXX|...|...',':':'.|X|.|X|.','+':'...|.X.|XXX|.X.|...',
  '/':'..X|.X.|.X.|.X.|X..','&':'.X.X.|XXXXX|XXXXX|.XXX.|..X..','*':'X.X|.X.|X.X|...|...',
  '(':'.X|X.|X.|X.|.X',')':'X.|.X|.X|.X|X.','%':'X..X|...X|..X.|.X..|X..X','"':'X.X|X.X|...|...|...',
  '=':'...|XXX|...|XXX|...','_':'...|...|...|...|XXXX','>':'X..|.X.|..X|.X.|X..','<':'..X|.X.|X..|.X.|..X',
  ';':'..|.X|..|.X|X.','$':'.X.|XXX|X.X|XXX|.X.','#':'X.X|XXX|X.X|XXX|X.X'
};
function drawText(s, x, y, c, scale) {
  if (c === undefined) c = COL.black;
  scale = scale || 1;
  s = ('' + s).toUpperCase();
  var cx = x;
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (ch === ' ') { cx += 3 * scale + scale; continue; }
    var g = FONT[ch];
    if (!g) { cx += 4 * scale; continue; }
    var rows = g.split('|'), w = rows[0].length;
    for (var r = 0; r < rows.length; r++)
      for (var q = 0; q < w; q++)
        if (rows[r][q] === 'X') px(cx + q * scale, y + r * scale, scale, scale, c);
    cx += (w + 1) * scale;
  }
  return cx - x;
}
function textW(s, scale) {
  scale = scale || 1;
  s = ('' + s).toUpperCase();
  var w = 0;
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (ch === ' ') { w += 4 * scale; continue; }
    var g = FONT[ch];
    w += g ? (g.split('|')[0].length + 1) * scale : 4 * scale;
  }
  return w;
}
function centerText(s, y, c, scale) { drawText(s, (240 - textW(s, scale)) >> 1, y, c, scale); }
/* text with a 1px dark outline — for legibility over busy backgrounds */
function drawTextO(s, x, y, c, oc, scale) {
  oc = oc || COL.black; scale = scale || 1;
  drawText(s, x - scale, y, oc, scale); drawText(s, x + scale, y, oc, scale);
  drawText(s, x, y - scale, oc, scale); drawText(s, x, y + scale, oc, scale);
  drawText(s, x, y, c, scale);
}
function centerTextO(s, y, c, oc, scale) { drawTextO(s, (240 - textW(s, scale)) >> 1, y, c, oc, scale); }

function wrap(t, maxW, scale) {
  var words = ('' + t).split(' '), lines = [], cur = '';
  for (var i = 0; i < words.length; i++) {
    var test = cur ? cur + ' ' + words[i] : words[i];
    if (textW(test, scale) > maxW && cur) { lines.push(cur); cur = words[i]; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

/* draw a string-art sprite grid with a color legend. '.'/' ' = transparent. */
function drawGrid(art, legend, x, y, scale) {
  scale = scale || 1;
  var rows = art.split('\n');
  /* trim leading/trailing empty rows */
  while (rows.length && rows[0].trim() === '') rows.shift();
  while (rows.length && rows[rows.length - 1].trim() === '') rows.pop();
  for (var r = 0; r < rows.length; r++) {
    var row = rows[r];
    for (var q = 0; q < row.length; q++) {
      var ch = row[q];
      if (ch === '.' || ch === ' ') continue;
      var c = legend[ch];
      if (c) px(x + q * scale, y + r * scale, scale, scale, c);
    }
  }
}

/* rounded-ish filled panel with border (UI boxes) */
function panel(x, y, w, h, fill, border) {
  fill = fill || COL.cream; border = border || COL.black;
  px(x, y, w, h, border);
  px(x + 1, y + 1, w - 2, h - 2, fill);
  px(x + 2, y + 2, w - 4, 1, COL.white); /* top sheen */
}

/* HP/meter bar helper */
function bar(x, y, w, h, frac, fill, bg) {
  frac = Math.max(0, Math.min(1, frac));
  px(x, y, w, h, COL.black);
  px(x + 1, y + 1, w - 2, h - 2, bg || '#2a2a34');
  px(x + 1, y + 1, ((w - 2) * frac) | 0, h - 2, fill || COL.grass);
}

/* ---- transitions: fade to/from black, and horizontal wipe ---- */
var Transition = {
  active: false, t: 0, dur: 0.4, kind: 'fade', dir: 1, cb: null, half: false,
  start: function (kind, cb, dur) {
    this.active = true; this.t = 0; this.kind = kind || 'fade';
    this.cb = cb || null; this.dur = dur || 0.4; this.half = false;
  },
  update: function (dt) {
    if (!this.active) return;
    this.t += dt;
    if (!this.half && this.t >= this.dur / 2) {
      this.half = true;
      if (this.cb) { var f = this.cb; this.cb = null; f(); }
    }
    if (this.t >= this.dur) this.active = false;
  },
  draw: function () {
    if (!this.active) return;
    var p = this.t / this.dur; /* 0..1 */
    var cover = p < 0.5 ? (p * 2) : (1 - (p - 0.5) * 2); /* 0->1->0 */
    if (this.kind === 'wipe') {
      var w = (240 * cover) | 0;
      px(0, 0, w, 160, COL.black);
    } else {
      ctx.globalAlpha = cover;
      cls(COL.black);
      ctx.globalAlpha = 1;
    }
  }
};
