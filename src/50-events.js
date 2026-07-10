/* events.js — Director pattern generalized: cutscenes, dialogue (typewriter),
   flags/quest state, and the battle bridge. */

/* speaker -> { spr(sprite fn or null), f(voice freq), tf(trueform opt) } */
var SPEAKERS = {
  'SAMUEL':      { spr: SPR.samuel,   f: 392 },
  'SAMUELTRUE':  { spr: SPR.samuel,   f: 440, opt: { trueForm: true } },
  'HERSCHEL':    { spr: SPR.herschel, f: 150 },
  'WILLIAM':     { spr: SPR.william,  f: 494 },
  'ROSALIND':    { spr: SPR.rosalind, f: 587 },
  'BABBAGE':     { spr: SPR.babbage,  f: 330 },
  'MAXIMVS':     { spr: SPR.maximvs,  f: 208 },
  'JAKE':        { spr: SPR.jake,     f: 175 },
  'REX':         { spr: SPR.rex,      f: 262 },
  'SNOBBINGTON': { spr: SPR.snob,     f: 233 },
  'GERALD':      { spr: SPR.gerald,   f: 300 },
  'EDITOR':      { spr: SPR.editor,   f: 280 },
  'CROWD':       { spr: null,         f: 330 },
  'NARRATOR':    { spr: null,         f: 0 }
};

/* draw a battle sprite shrunk into a small box (for the dialogue portrait) */
function drawMiniPortrait(fn, opt, x, y, sc) {
  sc = sc || 0.62;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  fn(0, 0, opt);
  ctx.restore();
}

/* ---------- dialogue box + cutscene director ---------- */
var Cutscene = {
  steps: [], i: 0, onDone: null, bg: null,
  who: '', lines: [], total: 0, shown: 0, doneTyping: false, lastBlip: 0,
  mode: 'idle', waitT: 0, choice: null,
  enter: function () {},
  play: function (steps, opts) {
    opts = opts || {};
    this.steps = steps; this.i = 0; this.onDone = opts.onDone || null;
    this.bg = opts.bg || null; this.mode = 'idle';
    setScene(this);
    this.next();
  },
  next: function () {
    if (this.i >= this.steps.length) {
      var d = this.onDone; this.onDone = null; this.mode = 'idle';
      if (d) d(); else gotoWorld();
      return;
    }
    var st = this.steps[this.i++];
    if (st.say) { this.startDialogue(st.say[0], st.say[1]); }
    else if (st.narr) { this.startDialogue('NARRATOR', st.narr); }
    else if (st.bg) { this.bg = st.bg; this.next(); }
    else if (st.music) { musicStart(st.music); this.next(); }
    else if (st.stop) { musicStop(); this.next(); }
    else if (st.sfx) { sfx(st.sfx); this.next(); }
    else if (st.wait) { this.mode = 'wait'; this.waitT = st.wait; }
    else if (st.do) { st.do(); if (this.mode === 'idle') this.next(); }
    else if (st.battle) {
      var self = this, spec = (typeof st.battle === 'function') ? st.battle() : st.battle;
      this.mode = 'battle';
      startBattle(spec, function (res) {
        if (st.onResult) st.onResult(res);
        setScene(self);
        self.mode = 'idle';
        self.next();
      });
    }
    else if (st.choice) { this.startChoice(st.choice); }
    else if (st.goto) { this.mode = 'idle'; if (st.goto === 'world') gotoWorld(); else if (typeof st.goto === 'function') st.goto(); }
    else this.next();
  },
  startDialogue: function (who, text) {
    this.who = who; this.mode = 'dialogue';
    var narr = (who === 'NARRATOR');
    this.lines = wrap(text, narr ? 210 : 180);
    if (this.lines.length > 3) this.lines = this.lines.slice(0, 3); /* keep tone rule: 3 lines */
    this.total = 0; for (var k = 0; k < this.lines.length; k++) this.total += this.lines[k].length;
    this.shown = 0; this.doneTyping = false; this.lastBlip = 0;
  },
  startChoice: function (ch) {
    this.mode = 'choice';
    this.choice = { q: ch.q, opts: ch.opts, idx: 0, cb: ch.cb };
    /* show the question as dialogue first line via who */
    this.who = ch.who || 'SAMUEL';
    this.lines = wrap(ch.q, 180); this.total = 0;
    for (var k = 0; k < this.lines.length; k++) this.total += this.lines[k].length;
    this.shown = this.total; this.doneTyping = true;
  },
  update: function (dt) {
    if (this.mode === 'wait') { this.waitT -= dt; if (this.waitT <= 0) this.next(); return; }
    if (this.mode === 'dialogue' && !this.doneTyping) {
      this.shown += dt * 46;
      if (this.shown >= this.total) { this.shown = this.total; this.doneTyping = true; }
      var iShown = Math.floor(this.shown);
      if (iShown > this.lastBlip + 2) { this.lastBlip = iShown; var sp = SPEAKERS[this.who]; if (sp && sp.f) sfx('blip'); }
    }
  },
  onPress: function (k) {
    if (this.mode === 'choice') {
      var c = this.choice;
      if (k === 'up') { c.idx = (c.idx + c.opts.length - 1) % c.opts.length; sfx('cursor'); }
      else if (k === 'down') { c.idx = (c.idx + 1) % c.opts.length; sfx('cursor'); }
      else if (k === 'a') { sfx('select'); var cb = c.cb, idx = c.idx; this.choice = null; this.mode = 'idle'; cb(idx); if (this.mode === 'idle') this.next(); }
      return;
    }
    if (this.mode !== 'dialogue') return;
    if (k === 'a' || k === 'b' || k === 'start') {
      if (!this.doneTyping) { this.shown = this.total; this.doneTyping = true; }
      else { sfx('blip'); this.next(); }
    }
  },
  draw: function () {
    /* background */
    if (this.bg && BGS[this.bg]) BGS[this.bg]();
    else if (World && curMap()) { var wasLock = World.locked; World.locked = true; var m = World.menu; World.menu = null; World.draw(); World.menu = m; World.locked = wasLock; }
    else cls(COL.night);
    if (this.mode === 'battle') return;
    if (this.mode === 'dialogue' || this.mode === 'choice') this.drawBox();
  },
  drawBox: function () {
    var narr = (this.who === 'NARRATOR');
    panel(6, 112, 228, 44, COL.cream, COL.black);
    px(8, 114, 224, 1, COL.gold);
    var tx = 12, ty = narr ? 122 : 126;
    if (!narr) {
      var sp = SPEAKERS[this.who];
      if (sp && sp.spr) {
        /* portrait tab on the left */
        panel(6, 92, 40, 22, COL.night, COL.gold);
        drawMiniPortrait(sp.spr, sp.opt, 10, 66, 0.56);
      }
      drawText(this.who, 12, 116, COL.red);
      tx = 12; ty = 128;
    }
    var remaining = Math.floor(this.shown);
    for (var i = 0; i < this.lines.length; i++) {
      var line = this.lines[i], take = Math.min(line.length, Math.max(0, remaining));
      remaining -= line.length;
      if (take > 0) {
        var s = line.substr(0, take);
        if (narr) centerText(s, ty + i * 9, COL.black); else drawText(s, tx, ty + i * 9, COL.black);
      }
    }
    if (this.mode === 'choice' && this.doneTyping) {
      var c = this.choice, bx = 150, bw = 84, by = 156 - (c.opts.length * 11) - 4;
      panel(bx, by - 2, bw, c.opts.length * 11 + 6, COL.white);
      for (var j = 0; j < c.opts.length; j++) {
        drawText(c.opts[j], bx + 12, by + 2 + j * 11, COL.black);
        if (j === c.idx) drawText('>', bx + 4, by + 2 + j * 11, COL.red);
      }
    } else if (this.doneTyping && (Math.floor(performance.now() / 400) % 2)) {
      drawText('>', 224, 148, COL.red);
    }
  }
};

/* convenience: play a simple dialogue chain then return to world (or callback) */
function say(pairs, onDone) {
  var steps = [];
  for (var i = 0; i < pairs.length; i++) {
    if (typeof pairs[i] === 'string') steps.push({ narr: pairs[i] });
    else steps.push({ say: pairs[i] });
  }
  Cutscene.play(steps, { onDone: onDone });
}
function narr(text, onDone) { Cutscene.play([{ narr: text }], { onDone: onDone }); }

/* ---------- full-screen cutscene backgrounds ---------- */
var BGS = {
  stage: function () {
    cls('#2a1830'); px(0, 0, 34, 160, '#5a2038'); px(206, 0, 34, 160, '#5a2038');
    px(34, 0, 172, 12, '#5a2038');
    for (var i = 0; i < 12; i++) px(38 + i * 14, 12, 9, 6, '#4a1830');
    px(34, 118, 172, 3, COL.gold); px(34, 121, 172, 39, '#6a4a3a');
    px(115, 70, 3, 42, COL.black); px(110, 62, 13, 8, COL.black); /* mic */
  },
  rome: function () { cls(COL.sky);
    px(190, 12, 18, 18, COL.gold);
    px(0, 44, 240, 60, '#c8a86a'); for (var i = 0; i < 10; i++) { px(6 + i * 24, 66, 16, 40, '#b09050'); px(9 + i * 24, 50, 10, 8, '#b09050'); }
    px(0, 104, 240, 56, COL.sand); },
  west: function () { cls('#e0a860'); px(24, 12, 18, 18, '#fce0a0');
    px(140, 50, 56, 56, '#a86038'); px(180, 36, 44, 70, '#a86038');
    px(0, 106, 240, 54, COL.sand); px(50, 74, 6, 32, COL.teal); px(40, 84, 8, 6, COL.teal); },
  disco: function () { cls('#1a1030');
    for (var r = 0; r < 6; r++) for (var q = 0; q < 6; q++) px(96 + q * 8, 8 + r * 8, 8, 8, ((r + q) % 2) ? COL.neon : COL.neon2);
    var dots = [[24,30],[60,50],[180,40],[212,60],[36,78],[204,90]];
    for (var i = 0; i < dots.length; i++) px(dots[i][0], dots[i][1], 3, 3, (i % 2) ? COL.neon : COL.neon2);
    for (var yy = 0; yy < 5; yy++) for (var xx = 0; xx < 15; xx++) px(xx * 16, 100 + yy * 12, 16, 12, ((xx + yy) % 2) ? '#3a2a5a' : '#5a3a7a'); },
  london: function () { cls(COL.night);
    px(196, 12, 20, 20, COL.cream);
    var st = [[30,16],[80,24],[140,12],[170,30]]; for (var i = 0; i < st.length; i++) px(st[i][0], st[i][1], 2, 2, COL.white);
    px(30, 40, 26, 66, '#2a3450'); px(34, 30, 16, 12, '#2a3450'); px(36, 48, 12, 12, COL.cream);
    px(80, 70, 30, 36, '#2a3450'); px(120, 60, 34, 46, '#2a3450'); px(164, 52, 30, 54, '#2a3450');
    px(0, 106, 240, 54, '#3a3244'); },
  manorbg: function () { cls('#3a2a3a'); px(0, 0, 240, 100, '#4a3a4a');
    for (var i = 0; i < 8; i++) px(10 + i * 30, 20, 20, 80, '#5a4a5a');
    px(0, 100, 240, 60, '#6a4a3a'); },
  black: function () { cls(COL.black); },
  theatre: function () { BGS.stage(); }
};

/* boom + travel transition scenes (reused from story) */
function playBoom(onDone) {
  var s = { t: 0,
    enter: function () { sfx('boom'); musicStop(); },
    update: function (dt) { this.t += dt; if (this.t > 1.2) onDone(); },
    draw: function () {
      var sh = this.t < 0.6 ? ((Math.sin(this.t * 60) * 4) | 0) : 0;
      ctx.save(); ctx.translate(sh, 0);
      if ((this.t * 16 | 0) % 2 && this.t < 0.5) cls(COL.white); else BGS.stage();
      centerTextO('B O O M !', 70, COL.red, COL.black, 3);
      ctx.restore();
    }, onPress: function () {} };
  setScene(s);
}
function playTravel(label, onDone) {
  var s = { t: 0,
    enter: function () { musicStop(); sfx('whoosh'); },
    update: function (dt) { this.t += dt; if (this.t > 2.2) onDone(); },
    draw: function () {
      cls(COL.black);
      for (var i = 0; i < 9; i++) {
        var sz = ((this.t * 120 + i * 26) % 240) | 0, cx = 120, cy = 76;
        var c = [COL.pink, COL.teal, COL.gold, COL.purple][(i + (this.t * 6 | 0)) % 4];
        px(cx - sz / 2, cy - sz / 2, sz, 2, c); px(cx - sz / 2, cy + sz / 2, sz, 2, c);
        px(cx - sz / 2, cy - sz / 2, 2, sz, c); px(cx + sz / 2, cy - sz / 2, 2, sz, c);
      }
      panel(50, 116, 140, 30, COL.night, COL.gold);
      centerText('TRAVELING TO', 122, COL.cream); centerText(label, 133, COL.gold);
    }, onPress: function () {} };
  setScene(s);
}
