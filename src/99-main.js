/* 99-main.js — boot logo, title screen, and engine kickoff. */

var Boot = {
  t: 0,
  enter: function () { this.t = 0; },
  update: function (dt) { this.t += dt; if (this.t > 1.8) setScene(Title); },
  draw: function () {
    cls('#1a1030');
    var y = Math.min(66, -12 + this.t * 60);
    centerTextO('DADDYSOFT', y, COL.gold, COL.black, 3);
    if (this.t > 1.0) centerText('PRESENTS', 96, COL.pink);
    /* little top hat spinning-in */
    if (this.t > 0.5) { var hx = 120; px(hx - 14, 40, 28, 3, COL.black); px(hx - 9, 26, 18, 14, COL.black); px(hx - 9, 36, 18, 2, COL.hatband); }
  },
  onPress: function () { if (this.t > 0.4) setScene(Title); }
};

var Title = {
  t: 0, idx: 0, mode: 'press',
  enter: function () { this.t = 0; this.idx = 0; this.mode = 'press'; this.debug = false; musicStart('manor'); },
  update: function (dt) { this.t += dt; },
  draw: function () {
    cls('#241238');
    /* dithered sky bars */
    for (var i = 0; i < 8; i++) px(0, i * 6, 240, 3, i % 2 ? '#2c1a44' : '#341d52');
    /* big top hat crest */
    px(96, 24, 48, 24, COL.black); px(90, 46, 60, 5, COL.black); px(96, 40, 48, 3, COL.hatband);
    px(112, 16, 16, 8, COL.black);
    centerTextO('DOWNTON DADDIES', 60, COL.gold, COL.black, 2);
    centerTextO('BARS THROUGH TIME', 82, COL.pink, COL.black, 1);
    px(40, 96, 160, 1, COL.gold);
    centerText('DADDYBOY ADVANCE EDITION', 100, COL.cream);
    if (this.mode === 'press') {
      if (Math.floor(this.t * 2) % 2) centerText('PRESS START', 122, COL.white);
    } else if (this.debug) {
      /* DEV: visit-any-era menu (compact list) */
      drawText('DEV: VISIT ERA', 8, 4, COL.pink);
      for (var d = 0; d < DEV_VISITS.length; d++) {
        var yy = 104 + d * 9;
        centerText(DEV_VISITS[d].label, yy, d === this.idx ? COL.gold : COL.stone);
        if (d === this.idx) drawText('>', (240 - textW(DEV_VISITS[d].label)) / 2 - 12, yy, COL.red);
      }
    } else if (this.mode === 'slots') {
      this.drawSlots();
    } else {
      var opts = this.opts();
      var y0 = 112;
      for (var j = 0; j < opts.length; j++) { centerText(opts[j], y0 + j * 11, j === this.idx ? COL.gold : COL.stone);
        if (j === this.idx) drawText('>', (240 - textW(opts[j])) / 2 - 12, y0 + j * 11, COL.red); }
      centerText('(C) 1889 DADDYSOFT', 152, COL.stone);
    }
  },
  drawSlots: function () {
    var title = this.slotPurpose === 'continue' ? 'CONTINUE - CHOOSE A SLOT' : 'NEW GAME - CHOOSE A SLOT';
    centerTextO(title, 106, COL.gold, COL.black);
    for (var i = 0; i < SLOT_COUNT; i++) {
      var yy = 116 + i * 9;
      var info = slotInfo(i + 1);
      var label = 'SLOT ' + (i + 1) + ': ' + (info ? (info.where + ' LV' + info.level + ' ' + info.mins + 'M') : 'EMPTY');
      var col = (i === this.idx) ? COL.gold : (info ? COL.white : COL.stone);
      centerText(label, yy, col);
      if (i === this.idx) drawText('>', (240 - textW(label)) / 2 - 10, yy, COL.red);
    }
    var hint = this.overArmed ? 'SLOT IN USE! A: OVERWRITE  B: BACK' : 'A: SELECT   B: BACK';
    centerText(hint, 153, this.overArmed ? COL.red : COL.stone);
  },
  opts: function () {
    return hasSave() ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
  },
  onPress: function (k) {
    if (this.mode === 'press') {
      if (k === 'start' || k === 'a') { sfx('select'); this.mode = 'menu'; this.idx = 0; }
      else if (k === 'select') { this.debug = true; this.mode = 'menu'; this.idx = 0; sfx('cursor'); } /* DEV: era menu */
      return;
    }
    if (k === 'select') { this.debug = !this.debug; this.mode = 'menu'; this.idx = 0; sfx('cursor'); return; } /* toggle dev menu */
    if (this.debug) {
      if (k === 'up') { this.idx = (this.idx + DEV_VISITS.length - 1) % DEV_VISITS.length; sfx('cursor'); }
      else if (k === 'down') { this.idx = (this.idx + 1) % DEV_VISITS.length; sfx('cursor'); }
      else if (k === 'a' || k === 'start') { sfx('select'); musicStop(); debugVisit(DEV_VISITS[this.idx].era); }
      return;
    }
    if (this.mode === 'slots') { this.slotsPress(k); return; }
    var opts = this.opts();
    if (k === 'up') { this.idx = (this.idx + opts.length - 1) % opts.length; sfx('cursor'); }
    else if (k === 'down') { this.idx = (this.idx + 1) % opts.length; sfx('cursor'); }
    else if (k === 'a' || k === 'start') {
      sfx('select');
      this.slotPurpose = (opts[this.idx] === 'CONTINUE') ? 'continue' : 'new';
      this.mode = 'slots'; this.overArmed = false;
      /* preselect the first sensible slot: occupied for continue, empty for new */
      this.idx = 0;
      for (var i = 0; i < SLOT_COUNT; i++) {
        var occ = !!slotInfo(i + 1);
        if ((this.slotPurpose === 'continue') === occ) { this.idx = i; break; }
      }
    }
  },
  slotsPress: function (k) {
    if (k === 'up') { this.idx = (this.idx + SLOT_COUNT - 1) % SLOT_COUNT; this.overArmed = false; sfx('cursor'); }
    else if (k === 'down') { this.idx = (this.idx + 1) % SLOT_COUNT; this.overArmed = false; sfx('cursor'); }
    else if (k === 'b') { this.mode = 'menu'; this.idx = 0; this.overArmed = false; sfx('cancel'); }
    else if (k === 'a' || k === 'start') {
      var slot = this.idx + 1, occ = !!slotInfo(slot);
      if (this.slotPurpose === 'continue') {
        if (!occ) { sfx('cancel'); return; }               /* nothing to load */
        sfx('select'); musicStop(); continueGame(slot);
      } else {
        if (occ && !this.overArmed) { this.overArmed = true; sfx('cursor'); return; } /* confirm overwrite */
        sfx('select'); musicStop(); newGame(slot);
      }
    }
  }
};

/* ---- kickoff ---- */
function boot() {
  var canvas = document.getElementById('s');
  gfxInit(canvas);
  bindDOM();
  setScene(Boot);
  requestAnimationFrame(frame);
}
if (typeof document !== 'undefined' && document.getElementById) boot();
