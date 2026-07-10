/* map.js — tile engine, global Game state, and the walkable World scene.
   16x16 tiles, ASCII grids, collision, warps, camera, interactable objects,
   NPCs, and grass-equivalent encounter zones. */

/* ---------------- global game state ---------------- */
var Game = {
  party: [],        /* array of fighter objects (see data.js makeFighter) */
  activeIdx: 0,
  flags: {},        /* story/quest flags */
  items: {},        /* itemId -> count */
  drip: {},         /* memberId -> drip id equipped */
  money: 30,
  mustaches: 0,     /* golden mustaches collected */
  parts: 0,         /* time machine parts */
  map: 'manor',
  px: 6, py: 8, dir: 'down',
  playtime: 0,
  started: false
};
/* era registry (populated by per-era map modules) for the time-machine travel hub */
var ERAS = [];
function registerEra(def) { ERAS.push(def); }

function hasFlag(f) { return !!Game.flags[f]; }
function setFlag(f, v) { Game.flags[f] = (v === undefined) ? true : v; }
function giveItem(id, n) { Game.items[id] = (Game.items[id] || 0) + (n || 1); }
function takeItem(id, n) { Game.items[id] = Math.max(0, (Game.items[id] || 0) - (n || 1)); }
function itemCount(id) { return Game.items[id] || 0; }

/* ---------------- map registry ---------------- */
var Maps = {};
function registerMap(id, def) {
  def.id = id;
  def.h = def.grid.length;
  def.w = def.grid[0].length;
  def.objs = def.objs || [];
  def.warps = def.warps || [];
  Maps[id] = def;
}
function curMap() { return Maps[Game.map]; }

function tileKeyAt(map, x, y) {
  if (y < 0 || y >= map.h || x < 0 || x >= map.w) return '#';
  return map.grid[y][x] || ' ';
}
function tileAt(map, x, y) { return TILES[tileKeyAt(map, x, y)] || TILES['#']; }

function objGone(o) { return o.flag && hasFlag(o.flag); }
function objAt(map, x, y) {
  for (var i = 0; i < map.objs.length; i++) {
    var o = map.objs[i];
    if (o.x === x && o.y === y && !objGone(o)) return o;
  }
  return null;
}
function warpAt(map, x, y) {
  for (var i = 0; i < map.warps.length; i++) { var w = map.warps[i]; if (w.x === x && w.y === y) return w; }
  return null;
}
function solidAt(map, x, y) {
  if (x < 0 || x >= map.w || y < 0 || y >= map.h) return true;
  if (tileAt(map, x, y).solid) return true;
  var o = objAt(map, x, y);
  if (o && o.solid) return true;
  return false;
}

var DIRV = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/* ---------------- world scene ---------------- */
var World = {
  moving: false, moveT: 0, moveDur: 0.14, fromX: 0, fromY: 0, frame: 0, stepAcc: 0,
  cam: { x: 0, y: 0 },
  menu: null,       /* pause menu state */
  locked: false,    /* input lock during cutscenes */
  enter: function () {
    this.moving = false; this.menu = null; this.locked = false;
    var m = curMap();
    if (m && m.music) musicStart(m.music);
    this.updateCam(true);
    if (m && m.onEnter) m.onEnter();
  },
  camTarget: function () {
    var m = curMap();
    var pxp = Game.px * TS, pyp = Game.py * TS;
    if (this.moving) {
      var t = this.moveT / this.moveDur;
      pxp = (this.fromX + (Game.px - this.fromX) * t) * TS;
      pyp = (this.fromY + (Game.py - this.fromY) * t) * TS;
    }
    var cx = pxp + TS / 2 - 120, cy = pyp + TS / 2 - 80;
    var maxX = Math.max(0, m.w * TS - 240), maxY = Math.max(0, m.h * TS - 160);
    if (m.w * TS < 240) cx = (m.w * TS - 240) / 2; else cx = Math.max(0, Math.min(maxX, cx));
    if (m.h * TS < 160) cy = (m.h * TS - 160) / 2; else cy = Math.max(0, Math.min(maxY, cy));
    return { x: cx, y: cy };
  },
  updateCam: function (snap) {
    var t = this.camTarget();
    if (snap) { this.cam.x = t.x; this.cam.y = t.y; }
    else { this.cam.x += (t.x - this.cam.x) * 0.35; this.cam.y += (t.y - this.cam.y) * 0.35; }
  },
  tryMove: function (dir) {
    Game.dir = dir;
    var d = DIRV[dir], nx = Game.px + d[0], ny = Game.py + d[1];
    var m = curMap();
    if (solidAt(m, nx, ny)) { sfx('bump'); return; }
    this.fromX = Game.px; this.fromY = Game.py;
    Game.px = nx; Game.py = ny;
    this.moving = true; this.moveT = 0;
  },
  arrive: function () {
    var m = curMap();
    /* warp? */
    var w = warpAt(m, Game.px, Game.py);
    if (w) { if (w.gate && !hasFlag(w.gate)) { if (w.blocked) w.blocked(); return; } warpTo(w); return; }
    /* encounter? */
    var tl = tileAt(m, Game.px, Game.py);
    if (tl.enc && m.enc) {
      var rate = m.enc.rate || 0.12;
      if (Math.random() < rate) { startWildBattle(m); return; }
    }
    /* auto-pickup (golden mustaches, etc.) */
    var here = objAt(m, Game.px, Game.py);
    if (here && here.mustache && here.onInteract) { here.onInteract(here); return; }
    /* onStep hook */
    if (m.onStep) m.onStep(Game.px, Game.py);
  },
  interact: function () {
    if (this.locked) return;
    var m = curMap(), d = DIRV[Game.dir];
    var o = objAt(m, Game.px + d[0], Game.py + d[1]);
    if (!o) { /* also allow interacting with tile you stand on for some pickups */ o = objAt(m, Game.px, Game.py); if (!o || !o.standOn) o = null; }
    if (o && o.onInteract) { sfx('select'); o.onInteract(o); }
  },
  openMenu: function () {
    this.menu = { idx: 0, items: ['PARTY', 'SWAG', 'SAVE', 'CLOSE'] };
    sfx('select');
  },
  update: function (dt) {
    Game.playtime += dt;
    if (this.locked) { this.updateCam(false); return; }
    if (this.menu) { this.updateCam(false); return; }
    if (this.moving) {
      this.moveT += dt;
      this.stepAcc += dt;
      if (this.stepAcc > this.moveDur) { this.stepAcc = 0; this.frame ^= 1; }
      if (this.moveT >= this.moveDur) {
        this.moving = false;
        this.arrive();
        if (this.moving || this.menu || this.locked || scene !== World) { this.updateCam(false); return; }
      }
    }
    if (!this.moving) {
      var dir = held.up ? 'up' : held.down ? 'down' : held.left ? 'left' : held.right ? 'right' : null;
      if (dir) this.tryMove(dir);
    }
    this.updateCam(false);
  },
  onPress: function (k) {
    if (this.locked) return;
    if (this.menu) { this.menuPress(k); return; }
    if (k === 'a') this.interact();
    else if (k === 'start') this.openMenu();
  },
  menuPress: function (k) {
    var mn = this.menu;
    if (k === 'up') { mn.idx = (mn.idx + mn.items.length - 1) % mn.items.length; sfx('cursor'); }
    else if (k === 'down') { mn.idx = (mn.idx + 1) % mn.items.length; sfx('cursor'); }
    else if (k === 'b' || k === 'start') { this.menu = null; sfx('cancel'); }
    else if (k === 'a') {
      var sel = mn.items[mn.idx];
      if (sel === 'CLOSE') { this.menu = null; sfx('cancel'); }
      else if (sel === 'SAVE') { saveGame(true); mn.msg = 'GAME SAVED.'; mn.msgT = 1.2; sfx('save'); }
      else if (sel === 'PARTY') { setScene(makePartyScreen(World)); }
      else if (sel === 'SWAG') { setScene(makeBagScreen(World)); }
    }
  },
  draw: function () {
    var m = curMap();
    cls(COL.black);
    var cx = this.cam.x | 0, cy = this.cam.y | 0;
    var f = (performance.now() / 500) | 0 & 1;
    var x0 = Math.floor(cx / TS), y0 = Math.floor(cy / TS);
    var x1 = x0 + 16, y1 = y0 + 11;
    /* terrain */
    for (var ty = y0; ty <= y1; ty++) for (var tx = x0; tx <= x1; tx++) {
      var tl = tileAt(m, tx, ty);
      tl.draw(tx * TS - cx, ty * TS - cy, f & 1);
    }
    /* objects (behind or in front of player by y) */
    var pyForSort = Game.py;
    var drawn = [];
    for (var i = 0; i < m.objs.length; i++) {
      var o = m.objs[i]; if (objGone(o)) continue;
      drawn.push(o);
    }
    /* draw objects with y <= player first (background), then player, then y>player */
    function drawObj(o) {
      var ox = o.x * TS - cx, oy = o.y * TS - cy;
      if (o.draw) { o.draw(ox, oy); return; }
      if (o.spr && WALK[o.spr]) { drawWalker(o.spr, o.dir || 'down', 0, ox, oy); return; }
      if (o.tile && TILES[o.tile]) { TILES[o.tile].draw(ox, oy, f & 1); return; }
      if (o.mustache) { drawMustache(ox, oy); return; }
      /* default: little marker */
      px(ox + 4, oy + 4, 8, 8, o.color || COL.gold);
    }
    for (i = 0; i < drawn.length; i++) if (drawn[i].y <= pyForSort) drawObj(drawn[i]);
    /* player */
    this.drawPlayer(cx, cy);
    for (i = 0; i < drawn.length; i++) if (drawn[i].y > pyForSort) drawObj(drawn[i]);
    /* location banner (brief) */
    if (m.banner && m.bannerT === undefined) { m.bannerT = 2.4; }
    if (m.bannerT > 0) { m.bannerT -= 1 / 60; drawLocationBanner(m.banner); }
    /* pause menu */
    if (this.menu) this.drawMenu();
  },
  drawPlayer: function (cx, cy) {
    var pxp = Game.px * TS, pyp = Game.py * TS;
    if (this.moving) {
      var t = this.moveT / this.moveDur;
      pxp = (this.fromX + (Game.px - this.fromX) * t) * TS;
      pyp = (this.fromY + (Game.py - this.fromY) * t) * TS;
    }
    var sx = pxp - cx, sy = pyp - cy;
    /* shadow */
    px(sx + 3, sy + 14, 10, 2, 'rgba(0,0,0,0.25)');
    drawWalker('samuel', Game.dir, this.moving ? this.frame : 0, sx, sy);
  },
  drawMenu: function () {
    var mn = this.menu;
    var w = 90, x = 240 - w - 6, y = 6;
    panel(x, y, w, mn.items.length * 12 + 8);
    for (var i = 0; i < mn.items.length; i++) {
      drawText(mn.items[i], x + 14, y + 6 + i * 12, COL.black);
      if (i === mn.idx) drawText('>', x + 6, y + 6 + i * 12, COL.red);
    }
    if (mn.msgT > 0) { mn.msgT -= 1 / 60; panel(40, 130, 160, 20); centerText(mn.msg, 137, COL.black); }
  }
};

function drawMustache(x, y) {
  var t = (performance.now() / 200) | 0;
  var c = (t % 3 === 0) ? COL.white : COL.gold;
  px(x + 2, y + 7, 5, 2, c); px(x + 9, y + 7, 5, 2, c);
  px(x + 1, y + 9, 2, 1, c); px(x + 13, y + 9, 2, 1, c);
  px(x + 6, y + 6, 1, 1, COL.white); px(x + 4, y + 4, 1, 1, COL.white);
}
function drawLocationBanner(txt) {
  var w = textW(txt) + 16;
  panel((240 - w) / 2, 6, w, 16, COL.night, COL.gold);
  centerText(txt, 11, COL.gold);
}

/* ---------------- warping ---------------- */
function warpTo(w) {
  World.locked = true;
  Transition.start('fade', function () {
    Game.map = w.to;
    Game.px = w.tx; Game.py = w.ty;
    if (w.dir) Game.dir = w.dir;
    World.moving = false;
    var m = curMap();
    if (m.music) musicStart(m.music);
    World.updateCam(true);
    saveGame(false);           /* auto-save on map transition */
    World.locked = false;
    m.bannerT = m.banner ? 2.4 : undefined;
    if (m.onEnter) m.onEnter();
  }, 0.5);
  sfx('door');
}
function gotoWorld() { setScene(World); }
