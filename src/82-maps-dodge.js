/* 82-maps-dodge.js — THE OLD WEST, 1878. The engine overshoots Dodge City by a
   desert: High Desert -> Dry Gulch (frontier town) -> the 3:10 to Dodge (buy a
   ticket, ride the train, foil the Great Metaphor Robbery) -> Front Street,
   Dodge City (William joins; detailed town) -> Dusty Trail -> Silver Mine
   (press battle opens the Saloon) -> Rattlesnake Jake (ROAST) boss. */

var SHOP_WEST = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:swiftcane'];

/* ---------------- dialogue voices (portraits for the new locals) ---------------- */
SPEAKERS['CONDUCTOR'] = { spr: null, f: 200 };
SPEAKERS['STATIONMASTER'] = { spr: null, f: 180 };
SPEAKERS['PORTER'] = { spr: null, f: 210 };
SPEAKERS['KID'] = { spr: null, f: 520 };
SPEAKERS['OLD TIMER'] = { spr: null, f: 140 };
SPEAKERS['DEPUTY'] = { spr: null, f: 260 };
SPEAKERS['UNDERTAKER'] = { spr: null, f: 120 };
SPEAKERS['PASSENGER'] = { spr: null, f: 240 };
SPEAKERS['TRAIN BANDIT'] = { spr: SPR.bandit, f: 170 };
SPEAKERS['GRIZZLED PROSPECTOR'] = { spr: SPR.prospector, f: 160 };
SPEAKERS['PROSPECTOR'] = { spr: SPR.prospector, f: 160 };
SPEAKERS['QUICK-DRAW GRANNY'] = { spr: SPR.granny, f: 320 };
SPEAKERS['GRANNY'] = { spr: SPR.granny, f: 320 };
SPEAKERS['CARD SHARP'] = { spr: SPR.cardsharp, f: 250 };

/* ---------------- Old West tile set ---------------- */
/* 1 = rails (solid) */
TILES['1'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, COL.sand);
  for (var i = 0; i < 4; i++) px(x + i * 4 + 1, y + 2, 2, 12, '#5a452a');
  px(x, y + 4, TS, 2, '#3a3230'); px(x, y + 10, TS, 2, '#3a3230');
  px(x + 3, y + 4, 1, 2, '#565058'); px(x + 11, y + 10, 1, 2, '#565058'); } };
/* P = platform planks (walkable) */
TILES['P'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#8a6a42');
  px(x, y + 4, TS, 1, '#6e5232'); px(x, y + 9, TS, 1, '#6e5232'); px(x, y + 14, TS, 1, '#6e5232');
  px(x + 3, y + 2, 1, 1, '#5a452a'); px(x + 11, y + 6, 1, 1, '#5a452a'); px(x + 6, y + 11, 1, 1, '#5a452a'); } };
/* a = train-car aisle (walkable, carpeted) */
TILES['a'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#4a3626');
  px(x, y + 5, TS, 6, '#8b3c4c'); px(x, y + 5, TS, 1, '#6e2e3c'); px(x, y + 10, TS, 1, '#6e2e3c'); } };
/* e = train seat (solid) */
TILES['e'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#4a3626');
  px(x + 1, y + 2, 14, 11, '#3f6a4a'); px(x + 1, y + 2, 14, 3, '#2f523a');
  px(x + 1, y + 2, 1, 11, '#181820'); px(x + 14, y + 2, 1, 11, '#181820');
  px(x + 1, y + 13, 14, 2, '#6a4a2c'); } };
/* n = train window wall (solid; desert scrolls by while the train is moving) */
TILES['n'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#5a4030');
  px(x, y, TS, 2, '#6e5238'); px(x, y + 14, TS, 2, '#3e2a1e');
  px(x + 3, y + 4, 10, 8, '#f0c070');
  if (hasFlag('train_departed') && !hasFlag('train_arrived')) {
    var s = ((performance.now() / 90) | 0) % 6;
    px(x + 3 + s, y + 8, 4, 4, '#a86038'); px(x + 4 + s, y + 7, 2, 1, '#a86038');
  } else { px(x + 4, y + 9, 4, 3, '#a86038'); }
  px(x + 3, y + 4, 10, 1, '#3e2a1e'); px(x + 3, y + 11, 10, 1, '#3e2a1e');
  px(x + 3, y + 4, 1, 8, '#3e2a1e'); px(x + 12, y + 4, 1, 8, '#3e2a1e'); } };
/* h = train wall (solid, lacquered) */
TILES['h'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#5a4030');
  px(x, y, TS, 2, '#6e5238'); px(x, y + 12, TS, 1, '#c49446'); px(x + 7, y + 2, 1, 10, '#4a3424'); } };
/* k = crate stack (solid) */
TILES['k'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#4a3626');
  px(x + 1, y + 3, 14, 12, '#8a6a3c'); px(x + 1, y + 3, 14, 1, '#181820'); px(x + 1, y + 14, 14, 1, '#181820');
  px(x + 1, y + 3, 1, 12, '#181820'); px(x + 14, y + 3, 1, 12, '#181820');
  px(x + 1, y + 8, 14, 1, '#6a4e28'); px(x + 7, y + 3, 1, 12, '#6a4e28');
  px(x + 3, y + 5, 4, 2, '#c8a86a'); } };
/* z = desert scrub (walkable, wild encounters) */
TILES['z'] = { solid: false, enc: true, draw: function (x, y, f) { px(x, y, TS, TS, COL.sand);
  var o = f ? 1 : 0;
  px(x + 2, y + 9 - o, 2, 5, '#8a7a4a'); px(x + 3, y + 6 - o, 1, 3, '#a89858');
  px(x + 8, y + 10, 2, 4, '#8a7a4a'); px(x + 12, y + 7 - o, 2, 6, '#8a7a4a');
  px(x + 13, y + 5 - o, 1, 2, '#a89858'); px(x + 6, y + 13, 1, 1, COL.sandd); } };
/* F = false-front facade (solid) */
TILES['F'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#c8a878');
  px(x, y, TS, 3, '#e0c898'); px(x, y + 3, TS, 1, '#8a6a44');
  for (var i = 0; i < 4; i++) px(x + i * 4 + 3, y + 4, 1, 12, '#a08050'); } };
/* 2 = facade window (solid) */
TILES['2'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#c8a878');
  px(x, y, TS, 3, '#e0c898'); px(x, y + 3, TS, 1, '#8a6a44');
  px(x + 3, y + 6, 10, 8, '#26314f'); px(x + 3, y + 6, 10, 1, '#181820'); px(x + 3, y + 13, 10, 1, '#181820');
  px(x + 3, y + 6, 1, 8, '#181820'); px(x + 12, y + 6, 1, 8, '#181820');
  px(x + 4, y + 7, 3, 6, '#e0c898'); px(x + 10, y + 9, 2, 2, '#4a5a7a'); } };
/* x = desert cactus (solid, sand base) */
TILES['x'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, COL.sand);
  px(x + 6, y + 2, 4, 13, COL.tealtip); px(x + 2, y + 6, 4, 4, COL.tealtip); px(x + 10, y + 5, 4, 4, COL.tealtip);
  px(x + 2, y + 6, 2, 6, COL.teal); px(x + 12, y + 5, 2, 5, COL.teal); } };

/* ---------------- battle backdrop: inside the train ---------------- */
BGS.traincar = function () {
  cls('#5a4030');
  px(0, 0, 240, 22, '#6e5238'); px(0, 22, 240, 2, '#3e2a1e');
  px(0, 24, 240, 40, '#f0c070');
  var s = ((performance.now() / 60) | 0) % 48;
  px(200 - s, 44, 30, 20, '#a86038'); px(206 - s, 38, 18, 8, '#a86038');
  px(60 - s, 50, 24, 14, '#b87048'); px(66 - s, 46, 12, 5, '#b87048');
  for (var i = 0; i < 6; i++) px(i * 48 - 4, 24, 8, 40, '#4a3626');
  px(0, 64, 240, 2, '#3e2a1e'); px(0, 66, 240, 6, '#c49446');
  px(0, 72, 240, 30, '#6a4a32');
  for (var j = 0; j < 8; j++) px(j * 32 + 14, 74, 1, 26, '#573a26');
  px(0, 102, 240, 58, '#4a3626'); px(0, 108, 240, 40, '#8b3c4c');
  px(0, 108, 240, 2, '#6e2e3c'); px(0, 146, 240, 2, '#6e2e3c');
};

/* ---------------- scenery draw helpers ---------------- */
function drawSkull(x, y) {
  fillEll(x + 3, y + 5, x + 12, y + 12, '#f0ead8'); px(x + 1, y + 6, 3, 2, '#f0ead8'); px(x + 12, y + 6, 3, 2, '#f0ead8');
  px(x + 5, y + 8, 2, 2, '#181820'); px(x + 9, y + 8, 2, 2, '#181820'); px(x + 6, y + 12, 4, 2, '#c8bca4');
}
function drawWell(x, y) {
  px(x + 2, y + 8, 12, 7, COL.stoned); px(x + 3, y + 9, 10, 4, '#26314f');
  px(x + 3, y + 1, 2, 8, COL.woodd); px(x + 11, y + 1, 2, 8, COL.woodd);
  px(x + 1, y, 14, 3, COL.wood); px(x + 1, y, 14, 1, COL.woodd); px(x + 7, y + 4, 2, 5, '#8a6a3c');
}
function drawBench(x, y) {
  px(x + 1, y + 6, 14, 3, COL.wood); px(x + 1, y + 6, 14, 1, '#a87c4c');
  px(x + 2, y + 9, 2, 5, COL.woodd); px(x + 12, y + 9, 2, 5, COL.woodd); px(x + 1, y + 2, 14, 2, COL.wood);
}
function drawBooth(x, y) {
  px(x, y - 6, TS, 20, '#8a6a42'); px(x, y - 6, TS, 2, '#e0c898'); px(x, y - 4, TS, 1, '#6e5232');
  px(x + 3, y - 1, 10, 8, '#26314f'); px(x + 3, y - 1, 10, 1, COL.gold); px(x + 3, y + 6, 10, 1, COL.gold);
  px(x + 3, y - 1, 1, 8, COL.gold); px(x + 12, y - 1, 1, 8, COL.gold);
  px(x + 6, y + 1, 4, 3, '#f4c898'); px(x + 6, y, 4, 1, '#26324a'); /* the stationmaster, on duty */
  px(x + 2, y + 9, 12, 3, '#e0c898'); px(x + 4, y + 10, 8, 1, '#8a6a44'); /* TICKETS shingle */
}
function drawCrateObj(x, y) {
  px(x + 2, y + 4, 12, 11, '#8a6a3c'); px(x + 2, y + 4, 12, 1, '#181820'); px(x + 2, y + 14, 12, 1, '#181820');
  px(x + 2, y + 4, 1, 11, '#181820'); px(x + 13, y + 4, 1, 11, '#181820');
  px(x + 2, y + 9, 12, 1, '#6a4e28'); px(x + 7, y + 4, 1, 11, '#6a4e28'); px(x + 4, y + 6, 3, 2, '#c8a86a');
}
function drawMailbag(x, y) {
  fillEll(x + 3, y + 4, x + 12, y + 14, '#9a9aa6'); px(x + 5, y + 2, 6, 3, '#7a7a86');
  px(x + 6, y + 8, 4, 3, '#6a6a76'); px(x + 5, y + 4, 2, 1, '#c8c8d0');
}
function drawTumbleweed(x, y) {
  var r = ((performance.now() / 300) | 0) % 4;
  var ox = [0, 2, 4, 2][r];
  strokeEll(x + 2 + ox, y + 5, x + 12 + ox, y + 14, '#a08050');
  strokeEll(x + 4 + ox, y + 7, x + 10 + ox, y + 12, '#8a6a44');
  px(x + 6 + ox, y + 6, 1, 2, '#a08050'); px(x + 9 + ox, y + 11, 2, 1, '#8a6a44');
}
function drawBoardedDoor(x, y) {
  px(x + 2, y, 12, 16, '#3e2a1e');
  px(x + 1, y + 2, 14, 3, '#8a6a3c'); px(x + 1, y + 8, 14, 3, '#8a6a3c');
  px(x + 1, y + 2, 14, 1, '#181820'); px(x + 1, y + 10, 14, 1, '#181820');
  px(x + 3, y + 3, 1, 1, '#565058'); px(x + 12, y + 9, 1, 1, '#565058');
}
/* the parked train at the platform: one draw call paints the whole consist.
   Leaves a doorway gap at the boarding tile (5 tiles right of the anchor). */
function drawParkedTrain(x, y) {
  if (!hasFlag('train_at_station')) return;
  var K = '#181820', LO = '#3a3a44', CAR = '#6a3a2a', CARd = '#4e2a1e';
  /* cow-catcher + boiler + stack + cab */
  px(x - 6, y + 8, 3, 6, LO); px(x - 4, y + 5, 3, 9, LO); px(x - 2, y + 2, 3, 12, LO);
  px(x, y - 2, 34, 16, LO); px(x, y - 2, 34, 1, K); px(x, y + 13, 34, 1, K);
  px(x + 6, y - 10, 6, 9, LO); px(x + 6, y - 10, 6, 1, K); px(x + 5, y - 11, 8, 2, '#2a2a32');
  fillEll(x + 20, y - 6, x + 27, y - 1, '#c49446');
  px(x + 34, y - 8, 16, 22, LO); px(x + 34, y - 8, 16, 1, K); px(x + 49, y - 8, 1, 22, K);
  px(x + 37, y - 5, 9, 7, '#f0c070'); px(x + 37, y - 5, 9, 1, K);
  /* tender */
  px(x + 52, y - 2, 22, 16, CARd); px(x + 52, y - 2, 22, 1, K); px(x + 52, y + 13, 22, 1, K);
  px(x + 54, y, 18, 4, '#2a2a32');
  /* car one, with the boarding doorway cut into it */
  px(x + 76, y - 4, 40, 18, CAR); px(x + 76, y - 4, 40, 1, K); px(x + 76, y + 13, 40, 1, K);
  px(x + 76, y - 4, 1, 18, K); px(x + 115, y - 4, 1, 18, K);
  px(x + 78, y - 1, 8, 6, '#f0c070'); px(x + 106, y - 1, 8, 6, '#f0c070');
  px(x + 90, y - 2, 12, 18, '#2a1a12'); px(x + 90, y - 2, 12, 1, COL.gold);
  px(x + 90, y - 2, 1, 18, COL.gold); px(x + 101, y - 2, 1, 18, COL.gold);
  /* car two */
  px(x + 118, y - 4, 38, 18, CAR); px(x + 118, y - 4, 38, 1, K); px(x + 118, y + 13, 38, 1, K);
  px(x + 118, y - 4, 1, 18, K); px(x + 155, y - 4, 1, 18, K);
  px(x + 121, y - 1, 8, 6, '#f0c070'); px(x + 133, y - 1, 8, 6, '#f0c070'); px(x + 145, y - 1, 8, 6, '#f0c070');
  /* wheels along the rails */
  var wx = [x + 4, x + 20, x + 40, x + 56, x + 66, x + 80, x + 108, x + 122, x + 148];
  for (var i = 0; i < wx.length; i++) { fillEll(wx[i], y + 10, wx[i] + 7, y + 17, '#1a1a1e'); px(wx[i] + 3, y + 12, 1, 3, '#565058'); }
}

/* ---------------- the train ride animation (pull in / depart) ---------------- */
function playTrainRide(kind, onDone) {
  var s = { t: 0, fired: false, hissed: false,
    enter: function () { musicStop(); sfx('whoosh'); },
    update: function (dt) {
      this.t += dt;
      if (this.t > 3.1 && !this.fired) { this.fired = true; onDone(); }
    },
    draw: function () {
      var t = this.t, u, ez, trainX, moving;
      if (kind === 'depart') { u = Math.min(1, t / 2.4); ez = u * u; trainX = 40 - ez * 340; moving = t > 0.15 && u < 1; }
      else { u = Math.min(1, t / 2.2); ez = 1 - (1 - u) * (1 - u); trainX = 250 - ez * 210; moving = u < 1;
        if (u >= 1 && !this.hissed) { this.hissed = true; sfx('door'); } }
      /* dusk sky, sun, mesas, ground */
      cls('#f0b060');
      fillEll(24, 12, 46, 34, '#fce0a0');
      px(146, 58, 52, 48, '#a86038'); px(154, 50, 30, 8, '#a86038'); px(160, 44, 14, 6, '#a86038');
      px(30, 70, 40, 36, '#b87048'); px(38, 62, 20, 8, '#b87048');
      px(0, 106, 240, 54, COL.sand);
      /* track: ties then rails */
      var scroll = (kind === 'depart') ? ((ez * 400) | 0) : (((1 - ez) * 300) | 0);
      for (var i = 0; i < 21; i++) { var tx2 = ((i * 12 + scroll) % 252) - 6; px(tx2, 122, 5, 8, '#5a452a'); }
      px(0, 123, 240, 2, '#3a3230'); px(0, 128, 240, 2, '#3a3230');
      /* the consist: cow-catcher, boiler, stack, cab, tender, two cars */
      var K = '#181820', LO = '#3a3a44', CAR = '#6a3a2a';
      var X = trainX | 0, y = 92;
      px(X - 8, y + 16, 4, 8, LO); px(X - 5, y + 12, 4, 12, LO); px(X - 2, y + 8, 4, 16, LO);
      px(X, y + 2, 40, 22, LO); px(X, y + 2, 40, 1, K); px(X, y + 23, 40, 1, K);
      px(X + 8, y - 10, 7, 13, LO); px(X + 8, y - 10, 7, 1, K); px(X + 6, y - 12, 11, 3, '#2a2a32');
      fillEll(X + 24, y - 3, X + 32, y + 2, '#c49446');
      px(X + 40, y - 8, 18, 32, LO); px(X + 40, y - 8, 18, 1, K); px(X + 57, y - 8, 1, 32, K);
      px(X + 44, y - 4, 10, 8, '#f0c070'); px(X + 44, y - 4, 10, 1, K);
      px(X + 60, y + 6, 24, 18, '#4e2a1e'); px(X + 60, y + 6, 24, 1, K); px(X + 62, y + 8, 20, 5, '#2a2a32');
      var cx2;
      for (var c = 0; c < 2; c++) {
        cx2 = X + 86 + c * 42;
        px(cx2, y + 2, 40, 22, CAR); px(cx2, y + 2, 40, 1, K); px(cx2, y + 23, 40, 1, K);
        px(cx2, y + 2, 1, 22, K); px(cx2 + 39, y + 2, 1, 22, K);
        px(cx2 + 4, y + 6, 8, 7, '#f0c070'); px(cx2 + 16, y + 6, 8, 7, '#f0c070'); px(cx2 + 28, y + 6, 8, 7, '#f0c070');
      }
      /* wheels, spokes ticking while moving */
      var sp = moving ? ((t * 10) | 0) % 2 : 0;
      var wx = [X + 6, X + 26, X + 46, X + 64, X + 74, X + 90, X + 112, X + 132, X + 154];
      for (var w = 0; w < wx.length; w++) {
        fillEll(wx[w], y + 20, wx[w] + 9, y + 29, '#1a1a1e');
        px(wx[w] + 4, y + 22 + sp * 3, 1, 3, '#8a8a96');
      }
      /* smoke while rolling */
      if (moving) for (var p = 0; p < 4; p++) {
        var age = ((t * 1.2 + p * 0.28) % 1);
        var sxp = X + 11 - age * 26, syp = y - 14 - age * 24, r = (2 + age * 5) | 0;
        fillEll(sxp - r, syp - r, sxp + r, syp + r, '#d8d0c8');
      }
      /* label panel */
      var title = 'NOW ARRIVING', sub = 'DRY GULCH';
      if (kind === 'depart') { title = 'THE 3:10 TO DODGE'; sub = 'ALL ABOARD!'; }
      else if (kind === 'pullin_dodge') { sub = 'DODGE CITY 1878'; }
      panel(45, 132, 150, 25, COL.night, COL.gold);
      centerText(title, 137, COL.cream); centerText(sub, 147, COL.gold);
    }, onPress: function () {} };
  setScene(s);
}

/* ---------------- THE HIGH DESERT (era spawn, wild scrub) ---------------- */
registerMap('desertspawn', {
  banner: 'THE HIGH DESERT', music: 'west', encPool: 'desert', battleBg: 'west', riftBg: 'west',
  grid: [
    '###################',
    '#ssszzsssxsszzssss#',
    '#szzsssszzsssssxss#',
    '#sxsszzssssszzssss#',
    '#sssssssssssssssss#',
    '#szzssXssszzsssssss',
    '#sssssssssszzssssss',
    '#sxszzsssszzssssXs#',
    '#sszzssssssssszzss#',
    '#sssssssssssssssss#',
    '###################'
  ],
  warps: [
    { x: 18, y: 5, to: 'drygulch', tx: 1, ty: 5, dir: 'right' },
    { x: 18, y: 6, to: 'drygulch', tx: 1, ty: 6, dir: 'right' }
  ],
  objs: [
    { x: 8, y: 4, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 12, y: 7, solid: true, draw: drawSkull, onInteract: function () { say([['NARRATOR', 'A BLEACHED COW SKULL.'], ['NARRATOR', 'IT HAS SEEN THINGS.']]); } },
    { x: 15, y: 4, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'DRY GULCH: 1 MILE EAST.'], ['NARRATOR', 'DODGE CITY: FAR.'], ['NARRATOR', 'THE TRAIN: FASTER.']]); } },
    mkTrainer(10, 8, { spr: 'prospector', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_west_a', enemy: 'prospector', level: 6, reward: 24, bg: 'west', tname: 'GRIZZLED PROSPECTOR', hail: "THIS DESERT AIN'T BIG ENOUGH!", beaten: 'IT IS PLENTY BIG. MY MISTAKE.' })
  ],
  onEnter: function () { if (!hasFlag('west_arrived_seen')) { setFlag('west_arrived_seen'); westArrive(); } }
});

/* ---------------- DRY GULCH (frontier town) ---------------- */
registerMap('drygulch', {
  banner: 'DRY GULCH', music: 'west', riftBg: 'west', safe: true,
  grid: [
    '#################',
    '#sssssssssssssss#',
    '#sFF2FsssssFF2Fs#',
    '#sssssssssssssss#',
    '#ssss|sssss|ssss#',
    'sddddddddddddddds',
    'sddddddddddddddds',
    '#ssss|sssss|ssss#',
    '#sssssssxsssssss#',
    '#sssssssssssssss#',
    '#################'
  ],
  warps: [
    { x: 0, y: 5, to: 'desertspawn', tx: 17, ty: 5, dir: 'left' },
    { x: 0, y: 6, to: 'desertspawn', tx: 17, ty: 6, dir: 'left' },
    { x: 16, y: 5, to: 'station', tx: 1, ty: 5, dir: 'right' },
    { x: 16, y: 6, to: 'station', tx: 1, ty: 6, dir: 'right' }
  ],
  objs: [
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 3, y: 3, solid: true, spr: 'villager', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_WEST, World, 'DRY GULCH GENERAL STORE')); } },
    { x: 12, y: 3, solid: true, spr: 'villager2', dir: 'down', onInteract: function () { say([['OLD TIMER', 'DODGE CITY? BIGGEST TOWN WEST'], ['OLD TIMER', 'OF ANYWHERE. RATTLESNAKE JAKE'], ['OLD TIMER', 'RUNS THE SALOON. AND THE FEAR.']]); } },
    { x: 6, y: 8, solid: true, spr: 'villager', dir: 'down', onInteract: function () { say([['KID', 'A NEW SHERIFF RODE INTO DODGE!'], ['KID', 'FOLKS SAY HE GOT THE JOB'], ['KID', 'BY SMILING. JUST... SMILING.']]); } },
    { x: 10, y: 8, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'THE ORDER RUNS THE DODGE PRESS'], ['GERALD', 'NOW. EVERY DUEL PRE-WRITTEN.'], ['GERALD', 'THE TRAIN IS ALSO PRE-WRITTEN.']]); } },
    { x: 13, y: 8, solid: true, spr: 'cowboy', dir: 'down', onInteract: function () { horseQuest(); } },
    { x: 8, y: 3, solid: true, draw: drawWell, onInteract: function () { say([['NARRATOR', 'THE TOWN WELL. A BUCKET, A ROPE,'], ['NARRATOR', "AND SOMEBODY'S LOST HARMONICA."]]); } },
    { x: 14, y: 4, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'TRAIN TO DODGE - TICKETS AT THE'], ['NARRATOR', 'STATION. NO REFUNDS. NO'], ['NARRATOR', 'EXCEPTIONS. NO SPITTING.']]); } },
    mkTrainer(7, 1, { spr: 'cowboy', dir: 'down', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_west_b', enemy: 'tumbleweed', level: 6, reward: 26, bg: 'west', tname: 'TUMBLEWEED POET', hail: 'HOWDY. I WROTE YOU A DIRGE.', beaten: 'I SHALL REVISE IT TO AN ODE.' })
  ],
  onEnter: function () {
    if (!hasFlag('drygulch_seen')) { setFlag('drygulch_seen');
      say([['NARRATOR', 'DRY GULCH. POPULATION: 11.'], ['NARRATOR', '12 IF YOU COUNT THE HORSE.'], ['SAMUEL', 'WILLIAM IS IN DODGE. TRAIN TIME.']]); }
  }
});

/* ---------------- DRY GULCH STATION (platform, tickets, the parked 3:10) ---------------- */
registerMap('station', {
  banner: 'DRY GULCH STATION', music: 'west', safe: true,
  grid: [
    '###############',
    '111111111111111',
    '1111111P1111111',
    'PPPPPPPPPPPPPPP',
    '#ddddddddddddd#',
    'sddddddddddddd#',
    'sddddddddddddd#',
    '#ddddddddddddd#',
    '#ddddddddddddd#',
    '###############'
  ],
  warps: [
    { x: 0, y: 5, to: 'drygulch', tx: 15, ty: 5, dir: 'left' },
    { x: 0, y: 6, to: 'drygulch', tx: 15, ty: 6, dir: 'left' },
    { x: 7, y: 2, to: 'traincar', tx: 2, ty: 3, dir: 'right', gate: 'ticket_bought',
      blocked: function () { say([['CONDUCTOR', 'TICKET, PLEASE.'], ['CONDUCTOR', 'NO TICKET, NO TRAIN.'], ['CONDUCTOR', 'THE WINDOW IS RIGHT THERE.']]); } }
  ],
  objs: [
    { x: 2, y: 1, draw: drawParkedTrain },
    { x: 11, y: 4, solid: true, draw: drawBooth, onInteract: function () { ticketOffice(); } },
    { x: 9, y: 4, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'DEPARTURES: DODGE CITY, 3:10.'], ['NARRATOR', 'ARRIVALS: REGRET, HOURLY.']]); } },
    { x: 4, y: 4, solid: true, draw: drawBench, onInteract: function () { say([['NARRATOR', 'A WAITING BENCH, WORN SMOOTH'], ['NARRATOR', 'BY A CENTURY OF PATIENCE.']]); } },
    { x: 3, y: 6, solid: true, spr: 'villager2', dir: 'right', onInteract: function () { porterChore(); } },
    { x: 2, y: 7, solid: true, draw: drawCrateObj, onInteract: function () { say([['NARRATOR', 'FREIGHT. HEAVY, HONEST FREIGHT.']]); } },
    { x: 4, y: 7, solid: true, draw: drawCrateObj, onInteract: function () { say([['NARRATOR', 'THIS ONE TICKS. NO. IT IS'], ['NARRATOR', 'FULL OF POCKET WATCHES.']]); } }
  ],
  onEnter: function () {
    if (!hasFlag('train_at_station')) { setFlag('train_at_station');
      playTrainRide('pullin', function () { gotoWorld();
        say([['STATIONMASTER', 'THE 3:10 TO DODGE, RIGHT ON TIME.'], ['STATIONMASTER', 'TICKETS AT THE WINDOW.']]); }); }
  }
});

/* ---------------- THE 3:10 TO DODGE (passenger car, side quests) ---------------- */
registerMap('traincar', {
  banner: 'THE 3:10 TO DODGE', music: 'west', battleBg: 'traincar',
  grid: [
    'hhhhhhhhhhhhhhh',
    'nhnnhnnhnnhnnhn',
    'haeeaeeaeeaeeah',
    'haaaaaaaaaaaaah',
    'haeeaeeaeeaeeah',
    'nhnnhnnhnnhnnhn',
    'hhhhhhhhhhhhhhh'
  ],
  warps: [ { x: 13, y: 3, to: 'baggagecar', tx: 2, ty: 3, dir: 'right' } ],
  objs: [
    { x: 1, y: 3, solid: true, spr: 'conductor', dir: 'right', onInteract: function () { conductorTalk(); } },
    { x: 2, y: 2, solid: true, spr: 'granny', dir: 'down', onInteract: function () { grannySeat(); } },
    { x: 11, y: 2, solid: true, spr: 'salesman', dir: 'down', onInteract: function () { tonicQuest(); } },
    { x: 5, y: 4, solid: true, spr: 'villager', dir: 'up', onInteract: function () { marbleKid(); } },
    { x: 9, y: 4, solid: true, spr: 'cardsharp', dir: 'up', onInteract: function () { marbleSharp(); } },
    { x: 12, y: 4, solid: true, spr: 'villager2', dir: 'up', onInteract: function () { say([['PASSENGER', 'I RIDE THIS LINE EVERY WEEK.'], ['PASSENGER', 'THE DESERT NEVER CHANGES.'], ['PASSENGER', 'THAT IS ITS WHOLE BIT.']]); } }
  ],
  onEnter: function () {
    if (!hasFlag('train_departed')) { setFlag('train_departed'); trainDepartScene(); }
  }
});

/* ---------------- THE MAIL CAR (the required task) ---------------- */
registerMap('baggagecar', {
  banner: 'THE MAIL CAR', music: 'west', battleBg: 'traincar',
  grid: [
    'hhhhhhhhhhhhh',
    'hakkakkakkaah',
    'haaaaakaaaaah',
    'haaaaaaaaaaah',
    'hakkaakkaakah',
    'hkkaaakkaaakh',
    'hhhhhhhhhhhhh'
  ],
  warps: [ { x: 1, y: 3, to: 'traincar', tx: 12, ty: 3, dir: 'left' } ],
  objs: [
    { x: 5, y: 2, solid: true, spr: 'gerald', dir: 'down', flag: 'train_robbery_done', onInteract: function (o) { robberyBattle(); } },
    { x: 7, y: 2, solid: true, spr: 'bandit', dir: 'down', flag: 'train_robbery_done', onInteract: function (o) { robberyBattle(); } },
    { x: 10, y: 2, solid: true, spr: 'prospector', dir: 'down', onInteract: function () { rockQuest(); } },
    { x: 3, y: 4, solid: true, draw: drawMailbag, onInteract: function () { say([['NARRATOR', 'A MAIL BAG. SOMEONE IN DODGE IS'], ['NARRATOR', 'GETTING A VERY STERN LETTER.']]); } },
    { x: 2, y: 1, solid: true, draw: drawCrateObj, onInteract: function () { rockCrate(0); } },
    { x: 8, y: 1, solid: true, draw: drawCrateObj, onInteract: function () { rockCrate(1); } },
    { x: 7, y: 4, solid: true, draw: drawCrateObj, onInteract: function () { rockCrate(2); } },
    { x: 10, y: 5, mustache: true, flag: 'stache_dodge', onInteract: function (o) { collectMustache(o, 'stache_dodge'); } }
  ],
  onEnter: function () {
    if (!hasFlag('train_robbery_done') && !hasFlag('robbery_started')) { setFlag('robbery_started'); robberyScene(); }
  }
});

/* ---------------- FRONT STREET, DODGE CITY (the real town) ---------------- */
registerMap('mainstreet', {
  banner: 'FRONT STREET - DODGE CITY', music: 'west', riftBg: 'west', safe: true,
  grid: [
    '#####################',
    '111111111111111111111',
    'PPPPPPPPPPPPPPPPPPPPP',
    '#FF2FF2FFFdF2FFF2FFF#',
    '#FFFFFdFFFdFFFdFFFFF#',
    '#ddddddddddddddddddd#',
    '#dddddddddddddddddddd',
    '#ddddddddddddddddddd#',
    '#F2FFF2FFFFF2FFFF2FF#',
    '#FF2FFFFF2FFFFF2FFFF#',
    '#d|dddddddddddd|dddd#',
    '#ddddddddddddddddddd#',
    '#####################'
  ],
  warps: [
    { x: 6, y: 4, to: 'saloon', tx: 6, ty: 8, dir: 'up', gate: 'dodge_press',
      blocked: function () { saloonBlocked(); } },
    { x: 20, y: 6, to: 'dustytrail', tx: 2, ty: 4, dir: 'right' }
  ],
  objs: [
    { x: 12, y: 2, solid: true, spr: 'conductor', dir: 'down', onInteract: function () { returnConductor(); } },
    { x: 17, y: 10, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 2, y: 11, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 14, y: 4, solid: true, spr: 'villager', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_WEST, World, 'DODGE MERCANTILE')); } },
    { x: 3, y: 7, solid: true, spr: 'cowboy', dir: 'down', onInteract: function () { say([['DEPUTY', 'NEW SHERIFF SMILED AT ME ONCE.'], ['DEPUTY', 'I HANDED IN MY BADGE. THEN HE'], ['DEPUTY', 'SMILED AGAIN. I TOOK IT BACK.']]); } },
    { x: 17, y: 7, solid: true, spr: 'villager2', dir: 'down', onInteract: function () { say([['UNDERTAKER', 'BUSINESS IS SLOW. NOBODY DIES'], ['UNDERTAKER', 'IN A SCRIPTED DUEL.'], ['UNDERTAKER', 'I MISS THE AD-LIBS.']]); } },
    { x: 8, y: 5, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'WELCOME TO DODGE. HERE IS YOUR'], ['GERALD', 'DUEL DIALOGUE CARD. READ IT ALOUD.'], ['SAMUEL', 'IT JUST SAYS "OUCH."'], ['GERALD', 'THEN YOU LOSE THE DUEL. NEXT.']]); } },
    { x: 12, y: 7, solid: true, spr: 'gerald', dir: 'up', onInteract: function () { say([['GERALD', 'THE ORDER FINDS COWBOYS TOO'], ['GERALD', 'SPONTANEOUS. EFFECTIVE TODAY, ALL'], ['GERALD', 'YEEHAWS MUST BE FILED IN ADVANCE.']]); } },
    { x: 10, y: 11, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'NOTICE: "ALL DUELS MUST USE'], ['NARRATOR', 'APPROVED DIALOGUE CARDS.'], ['NARRATOR', 'DRAW... FROM THE DECK."']]); } },
    { x: 5, y: 6, draw: drawTumbleweed },
    mkTrainer(4, 6, { spr: 'bandit', dir: 'right', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_west_c', enemy: 'bandit', level: 7, reward: 28, bg: 'west', tname: 'WANTED OUTLAW', hail: 'I ROB TRAINS. AND EGOS.', beaten: 'PUT ME ON A NICER POSTER.' }),
    mkTrainer(15, 5, { spr: 'cardsharp', dir: 'left', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_west_d', enemy: 'cardsharp', level: 8, reward: 32, bg: 'west', tname: 'CARD SHARP', hail: 'CARE TO CUT THE DECK, DADDY?', beaten: 'THE HOUSE FOLDS. UNHEARD OF.' }),
    mkTrainer(9, 10, { spr: 'granny', dir: 'down', patrol: { ax: 'h', span: 2 }, sight: 4, defeat: 'tr_west_e', enemy: 'granny', level: 8, reward: 30, bg: 'west', tname: 'QUICK-DRAW GRANNY', hail: 'MY SISTER SAYS YOU BATTLE. DRAW.', beaten: 'YOU REMIND ME OF MY THIRD HUSBAND.' })
  ],
  onEnter: function () {
    if (!hasFlag('dodge_city_reached')) { setFlag('dodge_city_reached'); dodgeArrive(); }
    else if (hasFlag('dodge_done')) { musicStart('west'); }
  }
});

/* ---------------- DUSTY TRAIL (route) ---------------- */
registerMap('dustytrail', {
  banner: 'DUSTY TRAIL', music: 'west', encPool: 'west', battleBg: 'west',
  grid: [
    '###################',
    '#sssssssssssssssss#',
    '#stttttCttttttttts#',
    '#sttttttttttttttts#',
    '#sttttttttttttttts#',
    '#stttttttttttCttts#',
    '#sttttttttttttttts#',
    '#sssssssssssssssss#',
    '###################'
  ],
  warps: [
    { x: 1, y: 4, to: 'mainstreet', tx: 19, ty: 6, dir: 'left' },
    { x: 17, y: 4, to: 'silvermine', tx: 2, ty: 9, dir: 'up' }
  ],
  objs: [
    { x: 9, y: 4, solid: true, spr: 'gerald', dir: 'down', flag: 'dodge_gerald1',
      onInteract: function (o) { dodgeGeraldBattle(o); } },
    mkTrainer(5, 3, { spr: 'cowboy', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_dodge_a', enemy: 'tumbleweed', level: 7, reward: 26, bg: 'west', tname: 'TUMBLEWEED POET', hail: 'STOP. LISTEN TO MY... FEELINGS.', beaten: 'THAT WAS BEAUTIFUL. I LOST.' }),
    mkTrainer(12, 3, { spr: 'cowboy', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_dodge_b', enemy: 'auctioneer', level: 7, reward: 26, bg: 'west', tname: 'CATTLE AUCTIONEER', hail: 'DO-I-HEAR-A-BATTLE-BATTLE-HEY?', beaten: 'SOLD! TO THE DADDY IN THE HAT.' }),
    mkTrainer(14, 6, { spr: 'salesman', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_dodge_c', enemy: 'salesman', level: 7, reward: 30, bg: 'west', tname: 'SNAKE-OIL SALESMAN', hail: 'STEP RIGHT UP AND GET BEAT!', beaten: 'THE TONIC WAS JUST GRAVY. DANG.' }),
    { x: 15, y: 1, mustache: true, flag: 'stache_dodge2', onInteract: function (o) { collectMustache(o, 'stache_dodge2'); } }
  ]
});

/* ---------------- SILVER MINE (dungeon) ---------------- */
registerMap('silvermine', {
  banner: 'THE SILVER MINE', music: 'west',
  grid: [
    '###############',
    '#....X...X....#',
    '#.XX.......XX.#',
    '#.............#',
    '#...=======...#',
    '#.............#',
    '#.XX.....XX...#',
    '#.............#',
    '#.....===.....#',
    '#.............#',
    '###############'
  ],
  warps: [
    { x: 1, y: 9, to: 'dustytrail', tx: 16, ty: 4, dir: 'left' }
  ],
  objs: [
    { x: 13, y: 1, solid: true, draw: drawBoardedDoor, onInteract: function () { say([['NARRATOR', 'AN OLD TUNNEL, BOARDED UP.'], ['NARRATOR', 'A CARD READS: "THE SALOON HAS'], ['NARRATOR', 'A FRONT DOOR. USE IT. - JAKE"']]); } },
    { x: 7, y: 3, solid: true, draw: drawCase, flag: 'dodge_press',
      onInteract: function (o) { pressBattle(o); } },
    { x: 7, y: 5, solid: true, spr: 'gerald', dir: 'up', onInteract: function () { say([['GERALD', 'BEHOLD. THE PRESS PRINTS EVERY'], ['GERALD', 'DUEL IN ADVANCE. HIGH NOON, DAILY.'], ['GERALD', 'ALL DUELS ARE AT NOON. IT SCANS.']]); } },
    { x: 11, y: 8, solid: true, spr: 'gerald', dir: 'left', onInteract: function () { say([['GERALD', 'CAREFUL. THESE CARDS ARE HOT'], ['GERALD', 'OFF THE PRESS. LEGALLY BINDING'], ['GERALD', 'AND ALSO QUITE WARM.']]); } },
    { x: 13, y: 9, mustache: true, flag: 'stache_dodge3', onInteract: function (o) { collectMustache(o, 'stache_dodge3'); } }
  ]
});

/* ---------------- SALOON (boss) ---------------- */
registerMap('saloon', {
  banner: 'THE SALOON', music: 'west',
  grid: [
    '#############',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#...........#',
    '#############'
  ],
  warps: [ { x: 6, y: 9, to: 'mainstreet', tx: 6, ty: 5, dir: 'down' } ],
  objs: [
    { x: 10, y: 1, solid: true, draw: drawCounter, onInteract: function () { say([['NARRATOR', 'THE BAR. STICKY WITH'], ['NARRATOR', 'SARSAPARILLA AND REGRET.']]); } },
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('jake_beaten')) SPR.jake(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('jake_beaten')) jakeFight(); } }
  ],
  onEnter: function () { if (!hasFlag('jake_beaten') && hasFlag('william_joined')) jakeFight(); }
});

/* ---------------- Old West story beats ---------------- */
function westArrive() {
  Cutscene.play([
    { bg: 'west' }, { music: 'west' },
    { narr: 'THE OLD WEST, 1878.' },
    { narr: 'THE ENGINE OVERSHOOTS DODGE CITY BY... A DESERT.' },
    { say: ['SAMUEL', 'BABBAGE. THIS IS SAND.'] },
    { say: ['BABBAGE', 'THE ENGINE ROUNDS TO THE NEAREST'] },
    { say: ['BABBAGE', 'CACTUS, SIR. DODGE IS EAST.'] },
    { say: ['SAMUEL', 'WILLIAM IS OUT THERE SOMEWHERE.'] },
    { say: ['SAMUEL', 'PROBABLY MAKING FRIENDS. UNFAIRLY.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function dodgeArrive() {
  Cutscene.play([
    { bg: 'west' }, { music: 'west' },
    { narr: 'DODGE CITY, 1878.' },
    { say: ['NARRATOR', 'THE SCRIPTED ORDER IS PRINTING'] },
    { say: ['NARRATOR', '"DUEL DIALOGUE" CARDS IN THE MINE.'] },
    { say: ['GERALD', 'DRAW, PARDNER. YOUR LINE IS ON'] },
    { say: ['GERALD', 'THE CARD. DO NOT AD-LIB.'] },
    { say: ['WILLIAM', "SAMUEL! I'VE BEEN HERE AN HOUR"] },
    { say: ['WILLIAM', "AND I'M ALREADY SHERIFF."] },
    { say: ['SAMUEL', 'HOW?!'] },
    { say: ['WILLIAM', 'I SMILED.'] },
    { do: function () { addToParty('william', 7); setFlag('william_joined'); } },
    { narr: 'WILLIAM JOINS THE PARTY!' },
    { say: ['WILLIAM', 'THE MAN IN THE SALOON DOES NOT'] },
    { say: ['WILLIAM', 'CARE FOR MY SMILE. AT ALL.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function saloonBlocked() {
  Cutscene.play([
    { narr: 'THE SALOON IS BARRED SHUT.' },
    { narr: 'A CARD READS: "NO DUELS UNTIL THE NEW CARDS ARRIVE. - JAKE"' },
    { say: ['WILLIAM', 'THE CARDS COME FROM THE SILVER'] },
    { say: ['WILLIAM', 'MINE, PAST THE TRAIL. SHALL WE?'] }
  ], { onDone: function () { gotoWorld(); } });
}
function ticketOffice() {
  if (hasFlag('ticket_bought')) {
    say([['STATIONMASTER', 'YOU HAVE A TICKET. THE TRAIN'], ['STATIONMASTER', 'IS THE LARGE LOUD THING. GO.']]);
    return;
  }
  Cutscene.play([
    { say: ['STATIONMASTER', 'WELCOME TO DRY GULCH STATION.'] },
    { choice: { who: 'STATIONMASTER', q: 'DODGE CITY. ONE WAY. 25 SHILLINGS.',
      opts: ['BUY TICKET (25S)', 'NOT YET'],
      cb: function (idx) {
        if (idx === 0) {
          if (Game.money >= 25) { Game.money -= 25; setFlag('ticket_bought'); sfx('item');
            say([['NARRATOR', 'GOT A TICKET TO DODGE CITY!'], ['STATIONMASTER', 'PLATFORM ONE. THE ONLY PLATFORM.']]); }
          else { say([['STATIONMASTER', 'YOU ARE ' + (25 - Game.money) + ' SHILLINGS SHORT.'], ['STATIONMASTER', 'THE PORTER PAYS FOR CRATE WORK.']]); }
        } else { say([['STATIONMASTER', 'SUIT YOURSELF. THE 3:10 LEAVES'], ['STATIONMASTER', 'AT 3:10. FAMOUSLY.']]); }
      } } }
  ]);
}
function porterChore() {
  Cutscene.play([
    { say: ['PORTER', 'CRATES WANT MOVING. EIGHT'] },
    { say: ['PORTER', 'SHILLINGS A LOAD. BACK STRAIGHT.'] },
    { narr: 'SAMUEL HAULS CRATES WITH GREAT DIGNITY.' },
    { sfx: 'item' }, { do: function () { Game.money += 8; } },
    { say: ['PORTER', 'EIGHT SHILLINGS. THE CRATES'] },
    { say: ['PORTER', 'RESPECT YOU NOW.'] } /* JOKE SLOT */
  ], { onDone: function () { gotoWorld(); } });
}
function trainDepartScene() {
  Cutscene.play([
    { say: ['CONDUCTOR', 'ALL ABOARD! NEXT STOP,'] },
    { say: ['CONDUCTOR', 'DODGE CITY!'] },
    { do: function () { playTrainRide('depart', function () { setScene(Cutscene); Cutscene.next(); }); } },
    { music: 'west' },
    { say: ['CONDUCTOR', '...UNLESS.'] },
    { say: ['SAMUEL', 'UNLESS?'] },
    { say: ['CONDUCTOR', 'BANDITS BOARDED AT THE WATER'] },
    { say: ['CONDUCTOR', 'TOWER. THEY ARE IN THE MAIL CAR.'] },
    { say: ['CONDUCTOR', 'I DO NOT STOP THIS TRAIN WHILE'] },
    { say: ['CONDUCTOR', 'THE ORDER IS ROBBING MY MAIL.'] },
    { say: ['SAMUEL', 'THE MAIL CAR IS TO THE REAR?'] },
    { say: ['CONDUCTOR', 'THE MAIL CAR IS TO THE REAR.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function robberyStep() {
  return { battle: function () { return { enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'boss', canFlee: false, bg: 'traincar' }; },
    onResult: function (r) { if (r.win) { setFlag('train_robbery_done'); Game.money += 40; } } };
}
function robberyScene() {
  Cutscene.play([
    { music: 'boss' },
    { narr: 'THE MAIL CAR. TWO FIGURES RIFLE THROUGH THE POST.' },
    { say: ['GERALD', 'BY ORDER OF THE ORDER: ALL'] },
    { say: ['GERALD', 'UNLICENSED METAPHORS ON THIS'] },
    { say: ['GERALD', 'TRAIN ARE HEREBY CONFISCATED.'] },
    { say: ['TRAIN BANDIT', 'THIS ONE COMPARES A LADY'] },
    { say: ['TRAIN BANDIT', "TO A SUMMER MORNIN'. SEIZE IT."] },
    { say: ['SAMUEL', "YOU'RE ROBBING THE MAIL..."] },
    { say: ['SAMUEL', 'OF POETRY?'] },
    { say: ['GERALD', 'IT IS A LIVING. FILE YOUR'] },
    { say: ['GERALD', 'OBJECTION. WE WILL SEIZE IT TOO.'] },
    robberyStep()
  ], { onDone: function () { robberyOutcome(); } });
}
function robberyBattle() {
  Cutscene.play([
    { say: ['GERALD', 'YOU AGAIN. THE PAPERWORK ON'] },
    { say: ['GERALD', 'YOU IS BECOMING A BURDEN.'] },
    robberyStep()
  ], { onDone: function () { robberyOutcome(); } });
}
function robberyOutcome() {
  if (!hasFlag('train_robbery_done')) { gotoWorld(); return; }
  Cutscene.play([
    { music: 'west' },
    { say: ['GERALD', 'WE WILL ROB A DIFFERENT TRAIN.'] },
    { say: ['GERALD', 'ONE WITH WORSE PASSENGERS.'] },
    { narr: 'THE MAIL IS SAFE! GOT 40 SHILLINGS REWARD.' },
    { narr: 'TELL THE CONDUCTOR THE COAST IS CLEAR.' },
    { do: function () { saveGame(false); } }
  ], { onDone: function () { gotoWorld(); } });
}
function conductorTalk() {
  if (!hasFlag('train_robbery_done')) {
    say([['CONDUCTOR', 'I HEAR THEM BACK THERE. RHYMING'], ['CONDUCTOR', "THROUGH MY MAIL. I WON'T STOP"], ['CONDUCTOR', "THIS TRAIN UNTIL THEY'RE GONE."]]);
    return;
  }
  if (!hasFlag('train_arrived')) {
    Cutscene.play([
      { say: ['CONDUCTOR', "MAIL'S SAFE? THEN HOLD ON TO"] },
      { say: ['CONDUCTOR', 'YOUR MUSTACHE. DODGE CITY, HO!'] },
      { do: function () { playTrainRide('pullin_dodge', function () {
          setFlag('train_arrived');
          Game.map = 'mainstreet'; Game.px = 8; Game.py = 2; Game.dir = 'down';
          saveGame(false); gotoWorld(); }); } }
    ]);
    return;
  }
  Cutscene.play([{ choice: { who: 'CONDUCTOR', q: 'BACK TO DODGE CITY, FRIEND?',
    opts: ['RIDE (FREE)', 'STAY'],
    cb: function (idx) {
      if (idx === 0) { playTrainRide('pullin_dodge', function () {
        Game.map = 'mainstreet'; Game.px = 8; Game.py = 2; Game.dir = 'down';
        saveGame(false); gotoWorld(); }); }
      else { say([['CONDUCTOR', 'WE ARRIVED. WHY ARE YOU'], ['CONDUCTOR', 'STILL ON MY TRAIN?']]); }
    } } }]);
}
function returnConductor() {
  Cutscene.play([{ choice: { who: 'CONDUCTOR', q: 'BACK TO DRY GULCH? RETURN FARE INCLUDED.',
    opts: ['RIDE (FREE)', 'STAY'],
    cb: function (idx) {
      if (idx === 0) { playTrainRide('pullin', function () {
        Game.map = 'station'; Game.px = 6; Game.py = 3; Game.dir = 'down';
        saveGame(false); gotoWorld(); }); }
      else { say([['CONDUCTOR', 'WISE. DODGE GROWS ON YOU.'], ['CONDUCTOR', 'LIKE DUST. AND DESTINY.']]); }
    } } }]);
}

/* ---- the train side quests ---- */
function grannySeat() {
  if (hasFlag('q_granny')) { say([['GRANNY', 'THE SEAT IS YOURS, DEARIE.'], ['GRANNY', 'I LIED. IT WAS NEVER MINE.']]); return; }
  Cutscene.play([
    { say: ['GRANNY', 'THAT IS MY SEAT, SONNY.'] },
    { say: ['SAMUEL', 'MY TICKET SAYS 4B.'] },
    { say: ['GRANNY', 'MINE TOO. WE SETTLE THIS'] },
    { say: ['GRANNY', 'THE OLD WAY. WITH BARS.'] },
    { battle: function () { return { enemies: [{ enemy: 'granny', level: 6 }], music: 'battle', canFlee: false, bg: 'traincar' }; },
      onResult: function (r) { if (r.win) { setFlag('q_granny'); giveItem('strongtea', 2); } } },
    { say: ['GRANNY', 'TAKE THE SEAT. AND THIS TEA.'] },
    { say: ['GRANNY', 'YOU LOOK PALE. SIT. SIT!'] }, /* JOKE SLOT */
    { narr: 'GOT 2 STRONG EARL GREYS!' }
  ], { onDone: function () { gotoWorld(); } });
}
function tonicQuest() {
  if (hasFlag('q_tonic')) { say([['SNAKE-OIL SALESMAN', '"TASTES LIKE HOT REGRET."'], ['SNAKE-OIL SALESMAN', 'SALES HAVE TRIPLED. YOU GENIUS.']]); return; }
  Cutscene.play([{ choice: { who: 'SNAKE-OIL SALESMAN',
    q: 'ENDORSE MY TONIC! WHAT SAYS SAMUEL?',
    opts: ['IT CURED MY DOUBTS', 'TASTES LIKE HOT REGRET', 'NO COMMENT (LEGAL)'],
    cb: function (idx) {
      if (idx === 1) { setFlag('q_tonic'); giveItem('lozenge', 2);
        say([['SNAKE-OIL SALESMAN', 'HONESTY! THE ONE FLAVOR I'], ['SNAKE-OIL SALESMAN', 'NEVER TRIED! TAKE THESE.'], ['NARRATOR', 'GOT 2 THROAT LOZENGES!']]); }
      else if (idx === 0) { say([['SNAKE-OIL SALESMAN', 'EVERYONE SAYS THAT. THE LABEL'], ['SNAKE-OIL SALESMAN', 'SAYS THAT. THE HORSE SAYS THAT.'], ['SNAKE-OIL SALESMAN', 'GIVE ME SOMETHING REAL.']]); }
      else { say([['SNAKE-OIL SALESMAN', 'LEGAL? SIR, THIS TONIC IS'], ['SNAKE-OIL SALESMAN', 'BEYOND THE LAW. TRY AGAIN.']]); }
    } } }]);
}
function marbleKid() {
  if (hasFlag('q_marble')) { say([['KID', 'ME AND MY MARBLE ARE NEVER'], ['KID', 'GAMBLING AGAIN. UNTIL DODGE.']]); return; }
  if (hasFlag('q_marble_won')) {
    setFlag('q_marble'); Game.money += 15; sfx('item');
    say([['KID', 'MY MARBLE! HERE, MY LIFE'], ['KID', 'SAVINGS. FIFTEEN SHILLINGS.'], ['SAMUEL', 'I CANNOT TAKE- OKAY, THANKS.']]);
    return;
  }
  say([['KID', 'THE CARD MAN TOOK MY LUCKY'], ['KID', 'MARBLE. HE SAID IT WAS "ANTE."'], ['KID', 'I DO NOT KNOW WHAT ANTE MEANS.']]);
}
function marbleSharp() {
  if (hasFlag('q_marble_won')) { say([['CARD SHARP', 'THE MARBLE IS WITH THE CHILD?'], ['CARD SHARP', 'GOOD. IT WAS CURSED ANYWAY.']]); return; }
  Cutscene.play([
    { say: ['CARD SHARP', 'THE MARBLE? WON FAIR AND SQUARE.'] },
    { say: ['CARD SHARP', 'WELL. SQUARE-ISH.'] },
    { say: ['SAMUEL', 'DEAL ME IN. STAKES: THE MARBLE.'] },
    { battle: function () { return { enemies: [{ enemy: 'cardsharp', level: 7 }], music: 'battle', canFlee: false, bg: 'traincar' }; },
      onResult: function (r) { if (r.win) { setFlag('q_marble_won'); } } },
    { say: ['CARD SHARP', 'TAKE IT. THE LUCK WAS ALWAYS'] },
    { say: ['CARD SHARP', 'IN THE KID, NOT THE MARBLE.'] },
    { narr: 'GOT THE LUCKY MARBLE BACK! RETURN IT.' }
  ], { onDone: function () { gotoWorld(); } });
}
function rockQuest() {
  if (hasFlag('q_rock')) { say([['PROSPECTOR', 'GERTRUDE SAYS THANKS AGAIN.'], ['PROSPECTOR', 'SHE IS SLEEPING. SHHH.']]); return; }
  say([['PROSPECTOR', "MY ROCK! GERTRUDE! SHE'S"], ['PROSPECTOR', 'SOMEWHERE IN THESE CRATES!'], ['PROSPECTOR', 'SHE HATES THE DARK. HURRY!']]);
}
function rockCrate(which) {
  if (hasFlag('q_rock')) { say([['NARRATOR', 'FREIGHT. IT MINDS ITS BUSINESS.']]); return; }
  if (which === 0) { say([['NARRATOR', 'CHICKENS. ANGRY ONES.']]); return; }
  if (which === 1) { say([['NARRATOR', 'A CRATE OF DUEL DIALOGUE CARDS.'], ['NARRATOR', 'OMINOUS.']]); return; }
  setFlag('q_rock'); Game.money += 25; sfx('sparkle');
  say([['PROSPECTOR', 'GERTRUDE! YOU HAD ME WORRIED'], ['PROSPECTOR', 'SICK. ...SHE SAYS THANK YOU.'], ['SAMUEL', 'SHE SEEMS QUIET.'], ['PROSPECTOR', "SHE'S SHY. HERE. 25 SHILLINGS."]]);
}

/* ---- kept beats: Gerald, the press, the horse, and Jake ---- */
function dodgeGeraldBattle(o) {
  Cutscene.play([
    { say: ['GERALD', 'HALT! THIS TRAIL REQUIRES A'] },
    { say: ['GERALD', 'PERMIT TO MOSEY.'] },
    { say: ['SAMUEL', 'I PREFER TO SAUNTER.'] },
    { say: ['GERALD', 'SAUNTERING IS NOT IN THE SCRIPT!'] },
    { battle: function () { return { enemies: [{ enemy: 'gerald', level: 6 }], music: 'battle', canFlee: false }; },
      onResult: function (r) { if (r.win) { setFlag('dodge_gerald1'); } } },
    { say: ['GERALD', 'FINE. MOSEY. SAUNTER. PRANCE.'] },
    { say: ['GERALD', 'I NO LONGER CARE.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function pressBattle(o) {
  Cutscene.play([
    { narr: 'A CRATE OF DUEL CARDS. THE PRESS OPERATORS OBJECT!' },
    { battle: function () { return { enemies: [{ enemy: 'gerald', level: 7 }], music: 'battle', canFlee: false, bg: 'west' }; },
      onResult: function (r) { if (r.win) { setFlag('dodge_press'); giveDrip('discogoggle'); } } },
    { narr: 'THE PRESS GRINDS TO A HALT! GOT DISCO GOGGLES (DRIP)!' },
    { say: ['SAMUEL', 'GOGGLES? IN 1878?'] },
    { say: ['SAMUEL', 'THE RIFTS ARE LEAKING.'] },
    { say: ['WILLIAM', 'NO CARDS, NO EXCUSES. THE SALOON'] },
    { say: ['WILLIAM', 'DOORS OPEN TONIGHT. SMILE READY.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function horseQuest() {
  if (hasFlag('dodge_horse')) { say([['COWBOY', "OL' BRENDA AND ME ARE DOIN' FINE."], ['COWBOY', 'SHE ANSWERS TO NOTHING ELSE. // JOKE SLOT']]); return; }
  Cutscene.play([{ choice: { who: 'COWBOY',
    q: "HELP ME NAME MY HORSE! SHE'S PICKY.",
    opts: ['THUNDERBOLT', 'HORSE', 'BRENDA'],
    cb: function (idx) {
      if (idx === 2) { setFlag('dodge_horse'); giveDrip('heartlocket'); say([['COWBOY', 'SHE... SHE NODDED. BRENDA IT IS.'], ['NARRATOR', 'GOT A HEART LOCKET (DRIP)!']]); }
      else if (idx === 0) say([['COWBOY', 'SHE BUCKED ME INTO A TROUGH.'], ['COWBOY', 'TOO MUCH PRESSURE. TRY AGAIN.']]);
      else say([['COWBOY', 'SHE STARED AT ME FOR A FULL'], ['COWBOY', 'MINUTE. I FELT JUDGED. AGAIN?']]);
    } } }]);
}
function jakeFight() {
  Cutscene.play([
    { bg: 'west' }, { music: 'boss' },
    { say: ['JAKE', 'WELL, WELL. THE SMILING SHERIFF'] },
    { say: ['JAKE', 'AND HIS LITTLE CHOIR.'] },
    { say: ['WILLIAM', 'I ADORE YOUR VOICE. VERY GRAVEL.'] },
    { say: ['JAKE', "DON'T. I WAS A SINGER ONCE."] },
    { say: ['JAKE', 'LOST MY VOICE IN A WEEK-LONG'] },
    { say: ['JAKE', 'SHOUTING MATCH. OVER A HORSE.'] },
    { say: ['SAMUEL', 'DID YOU AT LEAST GET THE HORSE?'] },
    { say: ['JAKE', 'THE HORSE TESTIFIED AGAINST ME.'] },
    { battle: function () { return { enemies: [{ boss: 'jake' }], music: 'boss', canFlee: false, bg: 'west' }; },
      onResult: function (r) { if (r.win) dodgeRewards(); } }
  ], { onDone: function () { if (hasFlag('jake_beaten')) dodgeVictory(); else gotoWorld(); } });
}
function dodgeRewards() {
  setFlag('jake_beaten'); setFlag('dodge_done'); setFlag('nyc_unlocked'); gainPart('CHRONO COIL');
}
function dodgeVictory() {
  Cutscene.play([
    { say: ['JAKE', '...NOBODY BEAT ME SINCE THE HORSE.'] },
    { say: ['WILLIAM', 'FRIEND, THAT GRAVEL IS A GIFT.'] },
    { say: ['WILLIAM', 'HAVE YOU TRIED SPOKEN WORD?'] },
    { say: ['JAKE', 'SPOKEN... WORD?'] },
    { narr: 'JAKE CLEARS HIS THROAT. HIS FIRST POEM:' },
    { say: ['JAKE', 'DUST. MORE DUST. A HORSE, GONE.'] },
    { say: ['JAKE', '...THE END.'] },
    { narr: 'IT IS TERRIBLE. THE WHOLE SALOON CRIES ANYWAY.' },
    { say: ['JAKE', 'TAKE THE CHRONO COIL. I GOT'] },
    { say: ['JAKE', 'FEELINGS TO WRANGLE.'] },
    { narr: 'CHRONO COIL GET! ( 2 OF 4 )' },
    { say: ['BABBAGE', 'THE ENGINE CAN NOW REACH NEW YORK.'] },
    { do: function () { saveGame(false); } }
  ], { onDone: function () { travelChoose('west'); } });
}

/* ---------------- register the Old West as a travel destination ---------------- */
registerEra({ id: 'dodge', label: 'OLD WEST 1878', unlockFlag: 'dodge_unlocked',
  warp: { to: 'desertspawn', tx: 3, ty: 4, dir: 'right' }, arrive: westArrive, arrivedFlag: 'west_arrived_seen' });
