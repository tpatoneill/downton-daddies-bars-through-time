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
  enter: function () { this.t = 0; this.idx = 0; this.mode = 'press'; musicStart('manor'); },
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
    } else {
      var opts = hasSave() ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
      for (var j = 0; j < opts.length; j++) { centerText(opts[j], 118 + j * 14, j === this.idx ? COL.gold : COL.stone);
        if (j === this.idx) drawText('>', (240 - textW(opts[j])) / 2 - 12, 118 + j * 14, COL.red); }
    }
    centerText('(C) 1889 DADDYSOFT', 150, COL.stone);
  },
  onPress: function (k) {
    if (this.mode === 'press') { if (k === 'start' || k === 'a') { sfx('select'); this.mode = 'menu'; this.idx = 0; } return; }
    var opts = hasSave() ? ['CONTINUE', 'NEW GAME'] : ['NEW GAME'];
    if (k === 'up' || k === 'down') { this.idx = (this.idx + 1) % opts.length; sfx('cursor'); }
    else if (k === 'a' || k === 'start') {
      sfx('select'); musicStop();
      var sel = opts[this.idx];
      if (sel === 'CONTINUE') continueGame(); else newGame();
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
