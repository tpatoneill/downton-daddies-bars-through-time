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
    this.moving = false; this.menu = null; this.locked = false; this.spot = null;
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
    /* encounter? (maps set encPool, not enc — this gate was wrong before) */
    var tl = tileAt(m, Game.px, Game.py);
    if (tl.enc && m.encPool) {
      var rate = m.encRate || 0.12;
      if (Math.random() < rate) { startWildBattle(m); return; }
    }
    /* auto-pickup (golden mustaches, etc.) */
    var here = objAt(m, Game.px, Game.py);
    if (here && here.mustache && here.onInteract) { here.onInteract(here); return; }
    /* onStep hook */
    if (m.onStep) m.onStep(Game.px, Game.py);
  },
  interact: function () {
    if (this.locked || this.spot) return;
    var m = curMap(), d = DIRV[Game.dir];
    var o = objAt(m, Game.px + d[0], Game.py + d[1]);
    if (!o) { /* also allow interacting with tile you stand on for some pickups */ o = objAt(m, Game.px, Game.py); if (!o || !o.standOn) o = null; }
    if (!o) return;
    if (o.trainer) { sfx('select'); if (hasFlag(o.defeat)) say([[o.tname || 'THEM', o.beaten || 'GOOD BOUT.']]); else startTrainerBattle(o); return; }
    if (o.onInteract) { sfx('select'); o.onInteract(o); }
  },
  openMenu: function () {
    this.menu = { idx: 0, items: ['PARTY', 'SWAG', 'SAVE', 'CLOSE'] };
    sfx('select');
  },
  update: function (dt) {
    Game.playtime += dt;
    if (this.spot) { this.updateSpot(dt); this.updateCam(false); return; } /* a trainer is charging us */
    if (this.locked) { this.updateCam(false); return; }
    if (this.menu) { this.updateCam(false); return; }
    this.updateTrainers(dt);                              /* patrols + line-of-sight */
    if (this.spot || this.locked) { this.updateCam(false); return; }
    if (this.moving) {
      this.moveT += dt;
      this.stepAcc += dt;
      if (this.stepAcc > this.moveDur) { this.stepAcc = 0; this.frame ^= 1; }
      if (this.moveT >= this.moveDur) {
        this.moving = false;
        this.arrive();
        if (this.moving || this.menu || this.locked || this.spot || scene !== World) { this.updateCam(false); return; }
      }
    }
    if (!this.moving) {
      var dir = held.up ? 'up' : held.down ? 'down' : held.left ? 'left' : held.right ? 'right' : null;
      if (dir) this.tryMove(dir);
    }
    this.updateCam(false);
  },
  onPress: function (k) {
    if (this.spot || this.locked) return;
    if (this.menu) { this.menuPress(k); return; }
    if (k === 'a') this.interact();
    else if (k === 'start') this.openMenu();
  },
  /* ---------- Pokemon-style trainers: patrol, line-of-sight, forced battle ---------- */
  initTrainer: function (o) {
    if (o._init) return; o._init = true;
    o._anchorx = o.x; o._anchory = o.y; o._moving = false; o._mt = 0;
    o._wait = Math.random() * 0.6; o._frame = 0; if (!o.dir) o.dir = 'down';
  },
  updateTrainers: function (dt) {
    var m = curMap(); if (!m.objs) return;
    for (var i = 0; i < m.objs.length; i++) {
      var o = m.objs[i];
      if (!o.trainer || objGone(o)) continue;
      this.initTrainer(o);
      if (hasFlag(o.defeat)) continue;                   /* beaten: stands still */
      if (o._moving) { o._mt += dt; if (o._mt >= 0.16) { o._moving = false; o._wait = 0.3 + Math.random() * 0.4; } }
      else if (o._wait > 0) { o._wait -= dt; }
      else { this.trainerStep(o); }
      if (this.trainerSees(o)) { this.spotTrainer(o); return; }
    }
  },
  trainerStep: function (o) {
    var p = o.patrol || { type: 'watch' };
    if (p.type === 'watch') { o.dir = (o.dir === (p.b || 'right')) ? (p.a || 'left') : (p.b || 'right'); o._wait = 0.5 + Math.random() * 0.5; o._frame ^= 1; return; }
    var ax = p.ax || 'h', span = p.span || 2;
    if (ax === 'h' && o.dir !== 'left' && o.dir !== 'right') o.dir = 'right';
    if (ax === 'v' && o.dir !== 'up' && o.dir !== 'down') o.dir = 'down';
    var dx = ax === 'h' ? (o.dir === 'left' ? -1 : 1) : 0, dy = ax === 'v' ? (o.dir === 'up' ? -1 : 1) : 0;
    var nx = o.x + dx, ny = o.y + dy;
    var within = ax === 'h' ? (nx >= o._anchorx - span && nx <= o._anchorx + span) : (ny >= o._anchory - span && ny <= o._anchory + span);
    if (within && !trainerBlocked(nx, ny)) { o._fx = o.x; o._fy = o.y; o.x = nx; o.y = ny; o._moving = true; o._mt = 0; o._frame ^= 1; }
    else { o.dir = (ax === 'h') ? (o.dir === 'left' ? 'right' : 'left') : (o.dir === 'up' ? 'down' : 'up'); o._wait = 0.2; }
  },
  trainerSees: function (o) {
    var d = DIRV[o.dir]; if (!d) return 0;
    var s = o.sight || 3, m = curMap();
    for (var k = 1; k <= s; k++) {
      var tx = o.x + d[0] * k, ty = o.y + d[1] * k;
      if (tx < 0 || ty < 0 || tx >= m.w || ty >= m.h) return 0;
      if (tx === Game.px && ty === Game.py) return k;
      if (tileAt(m, tx, ty).solid) return 0;
      var oo = objAt(m, tx, ty); if (oo && oo !== o && oo.solid) return 0;
    }
    return 0;
  },
  spotTrainer: function (o) { this.spot = { o: o, phase: 'alert', t: 0 }; o._moving = false; this.moving = false; sfx('bump'); sfx('cursor'); },
  updateSpot: function (dt) {
    var s = this.spot, o = s.o; s.t += dt;
    if (s.phase === 'alert') { if (s.t > 0.6) { s.phase = 'march'; s.t = 0; } return; }
    /* march toward the player, one tile at a time */
    if (o._moving) { o._mt += dt; if (o._mt >= 0.14) o._moving = false; return; }
    if (Math.abs(o.x - Game.px) + Math.abs(o.y - Game.py) <= 1) {
      o.dir = (Game.px > o.x) ? 'right' : (Game.px < o.x) ? 'left' : (Game.py > o.y) ? 'down' : 'up';
      this.spot = null; startTrainerBattle(o); return;
    }
    var dx = Game.px - o.x, dy = Game.py - o.y, sx = 0, sy = 0;
    if (Math.abs(dx) >= Math.abs(dy)) sx = dx > 0 ? 1 : -1; else sy = dy > 0 ? 1 : -1;
    var nx = o.x + sx, ny = o.y + sy;
    if (trainerBlocked(nx, ny)) { if (sx) { sx = 0; sy = dy > 0 ? 1 : dy < 0 ? -1 : 0; } else { sy = 0; sx = dx > 0 ? 1 : dx < 0 ? -1 : 0; } nx = o.x + sx; ny = o.y + sy; }
    o.dir = sx > 0 ? 'right' : sx < 0 ? 'left' : sy > 0 ? 'down' : 'up';
    if (!trainerBlocked(nx, ny)) { o._fx = o.x; o._fy = o.y; o.x = nx; o.y = ny; o._moving = true; o._mt = 0; o._frame ^= 1; }
    else { this.spot = null; startTrainerBattle(o); }
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
      var pxo = o.x * TS, pyo = o.y * TS;
      if (o.trainer && o._moving) { var t = o._mt / 0.16; pxo = (o._fx + (o.x - o._fx) * t) * TS; pyo = (o._fy + (o.y - o._fy) * t) * TS; }
      var ox = pxo - cx, oy = pyo - cy;
      if (o.draw) { o.draw(ox, oy); return; }
      if (o.spr && WALK[o.spr]) {
        drawWalker(o.spr, o.dir || 'down', (o.trainer && o._moving) ? o._frame : 0, ox, oy);
        if (World.spot && World.spot.o === o && World.spot.phase === 'alert') drawAlert(ox, oy);
        return;
      }
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

/* ---------------- trainer helpers ---------------- */
function trainerBlocked(x, y) {
  var m = curMap();
  if (solidAt(m, x, y)) return true;
  if (x === Game.px && y === Game.py) return true;   /* don't stand on the player */
  return false;
}
function drawAlert(x, y) {
  px(x + 4, y - 12, 8, 9, COL.white); px(x + 4, y - 13, 8, 1, COL.black);
  px(x + 4, y - 3, 8, 1, COL.black); px(x + 5, y - 4, 2, 3, COL.black); /* speech tail */
  px(x + 7, y - 11, 2, 4, COL.red); px(x + 7, y - 6, 2, 2, COL.red);    /* the ! */
}
/* place a patrolling forced-battle trainer */
function mkTrainer(x, y, cfg) {
  cfg = cfg || {}; cfg.x = x; cfg.y = y; cfg.solid = true; cfg.trainer = true;
  if (cfg.sight === undefined) cfg.sight = 3;
  return cfg;
}
function startTrainerBattle(o) {
  World.locked = true; World.spot = null;
  var nm = o.tname || 'CHALLENGER';
  Cutscene.play([
    { say: [nm, o.hail || "YOU THERE! WE DUEL, HERE, NOW!"] },
    { battle: function () { return { enemies: [{ enemy: o.enemy, level: o.level || 5 }], music: 'battle', canFlee: false, bg: o.bg, taunt: o.hail }; },
      onResult: function (r) { if (r.win) { setFlag(o.defeat); Game.money += (o.reward || 0); } } },
    { say: [nm, o.beaten || 'A WORTHY BOUT. WELL BATTLED.'] }
  ], { onDone: function () { gotoWorld(); } });
}
