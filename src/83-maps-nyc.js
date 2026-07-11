/* 83-maps-nyc.js — NEW YORK, 1977. CHRISTMAS WEEK.
   Snobbington's Scripted Order banned improv and padlocked Second City's
   famous Chicago home — so the troupe fled east and secretly reopened in the
   basement levels UNDER Club Inferno. Del Close runs the resistance.
   Flow: Wells St. (in exile) -> back alley (password) -> Second City lobby /
   theater / green room / basement -> freight elevator -> Club Inferno (disco,
   Rosalind joins) -> Boiler Room -> Rooftop (DISCO REX boss). */

var SHOP_NYC = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:discogoggle'];
var SHOP_SC  = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:turtleneck'];

/* ---------------- NYC winter + Second City tile set ---------------- */
/* S = fresh snow (walkable, sparkles) */
TILES['S'] = { solid: false, draw: function (x, y, f) { px(x, y, TS, TS, '#e6eaf2');
  px(x + 2, y + 4, 2, 1, '#c8d0e0'); px(x + 10, y + 9, 3, 1, '#c8d0e0'); px(x + 6, y + 13, 2, 1, '#c8d0e0');
  if (f) px(x + 12, y + 3, 1, 1, '#ffffff'); else px(x + 4, y + 10, 1, 1, '#ffffff'); } };
/* R = plowed road (dark asphalt, slush at the edges, tire lines) */
TILES['R'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#33343e');
  px(x, y, TS, 2, '#c8d0e0'); px(x, y + 14, TS, 2, '#c8d0e0');
  px(x + 2, y + 5, 5, 1, '#282932'); px(x + 9, y + 10, 5, 1, '#282932');
  px(x + 6, y + 3, 1, 1, '#4a4c58'); } };
/* W = brownstone wall (solid), V = brownstone with a lit window (warm flicker) */
TILES['W'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#5e3c34');
  px(x, y, TS, 1, '#4a2e28'); px(x, y + 8, TS, 1, '#4a2e28');
  px(x + 5, y, 1, 8, '#4a2e28'); px(x + 11, y + 8, 1, 8, '#4a2e28');
  px(x, y + 15, TS, 1, '#e6eaf2'); } };
TILES['V'] = { solid: true, draw: function (x, y, f) { px(x, y, TS, TS, '#5e3c34');
  px(x, y, TS, 1, '#4a2e28');
  px(x + 3, y + 3, 10, 10, f ? '#f0c060' : '#e0a848');
  px(x + 3, y + 3, 10, 1, '#3a241e'); px(x + 3, y + 12, 10, 1, '#3a241e');
  px(x + 3, y + 3, 1, 10, '#3a241e'); px(x + 12, y + 3, 1, 10, '#3a241e');
  px(x + 7, y + 3, 1, 10, '#3a241e'); px(x + 3, y + 7, 10, 1, '#3a241e');
  px(x + 2, y + 2, 12, 1, '#e6eaf2'); } };
/* I = exposed interior brick (Second City's famous back wall) */
TILES['I'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#4c3028');
  px(x, y, TS, 1, '#38221c'); px(x, y + 8, TS, 1, '#38221c');
  px(x + 4, y, 1, 8, '#38221c'); px(x + 10, y + 8, 1, 8, '#38221c');
  px(x + 6, y + 3, 3, 2, '#5a3c30'); } };
/* N = checkerboard lobby floor */
TILES['N'] = { solid: false, draw: function (x, y) {
  px(x, y, 8, 8, '#d8d0c0'); px(x + 8, y + 8, 8, 8, '#d8d0c0');
  px(x + 8, y, 8, 8, '#2e2a30'); px(x, y + 8, 8, 8, '#2e2a30'); } };
/* E = theater seat row (solid), Y = stage boards, U = the red main curtain */
TILES['E'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#241f26');
  px(x + 1, y + 2, 6, 8, '#8b2c3c'); px(x + 9, y + 2, 6, 8, '#8b2c3c');
  px(x + 1, y + 2, 6, 2, '#a83c4c'); px(x + 9, y + 2, 6, 2, '#a83c4c');
  px(x + 1, y + 10, 6, 3, '#5e1e2a'); px(x + 9, y + 10, 6, 3, '#5e1e2a'); } };
TILES['Y'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#9a6a3c');
  px(x, y + 5, TS, 1, '#7a5230'); px(x, y + 11, TS, 1, '#7a5230'); px(x + 8, y, 1, TS, '#7a5230'); } };
TILES['U'] = { solid: true, draw: function (x, y, f) { px(x, y, TS, TS, '#7e1e2e');
  for (var i = 0; i < 4; i++) px(x + 1 + i * 4 + (f ? 1 : 0), y, 1, TS, '#5e1622');
  px(x, y + 14, TS, 2, '#a83c4c'); } };
/* Z = basement concrete */
TILES['Z'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#5a5a62');
  px(x + 3, y + 6, 4, 1, '#4a4a52'); px(x + 10, y + 12, 4, 1, '#4a4a52'); px(x + 12, y + 2, 1, 1, '#6a6a72'); } };

/* ---------------- object art ---------------- */
function drawBall(x, y) {
  var t = (performance.now() / 150) | 0;
  px(x + 3, y + 9, 10, 6, COL.woodd); fillEll(x + 3, y, x + 12, y + 9, '#b8c8d8');
  px(x + 4 + (t % 3) * 2, y + 2, 2, 2, COL.white); px(x + 8, y + 5, 2, 2, COL.white);
}
function drawPlaylist(x, y) {
  px(x + 2, y - 2, 12, 16, '#3a3a4a'); px(x + 2, y - 2, 12, 2, '#5a5a6a');
  var t = (performance.now() / 250) | 0;
  px(x + 4, y + 2, 8, 4, (t % 2) ? COL.neon : COL.pink);
  px(x + 4, y + 8, 8, 1, COL.white); px(x + 4, y + 10, 6, 1, COL.white);
}
function drawDumpster(x, y) { px(x + 1, y + 6, 14, 8, '#3a5a4a'); px(x + 1, y + 5, 14, 2, '#2a4a3a'); px(x + 3, y + 14, 2, 2, '#22222a'); px(x + 11, y + 14, 2, 2, '#22222a');
  px(x + 2, y + 3, 12, 2, '#e6eaf2'); } /* snow on the lid */
function drawMarquee(x, y) { /* spans ~4 tiles: the dark Second City marquee */
  px(x - 4, y + 2, 72, 12, '#2a2430'); px(x - 4, y + 2, 72, 1, '#1a161e'); px(x - 4, y + 13, 72, 1, '#1a161e');
  px(x - 2, y + 4, 68, 8, '#141018');
  drawText('SECOND CITY', x + 6, y + 5, '#6a6272');       /* bulbs dark: banned */
  px(x - 4, y, 72, 2, '#e6eaf2');                          /* snow on top */
}
function drawPadlock(x, y) { px(x + 2, y + 1, 12, 14, '#3a2a22'); px(x + 4, y + 3, 8, 10, '#241a14');
  px(x + 6, y + 6, 4, 4, sBZ); px(x + 7, y + 4, 2, 2, '#8a8a96'); }
function drawXmasTree(x, y) { var t = (performance.now() / 300) | 0;
  px(x + 6, y + 10, 4, 6, '#5e3c2a');
  fillEll(x + 1, y - 10, x + 14, y + 12, '#2e6e46');
  fillEll(x + 4, y - 16, x + 11, y - 4, '#2e6e46');
  var L = [[4, -8], [10, -6], [3, 0], [12, 2], [7, -2], [5, 6], [11, 8]];
  for (var i = 0; i < L.length; i++) px(x + L[i][0], y + L[i][1], 2, 2, ((i + t) % 3 === 0) ? COL.gold : ((i + t) % 3 === 1) ? COL.red : COL.teal);
  px(x + 6, y - 19, 3, 3, COL.gold);
}
function drawSnowman(x, y) { fillEll(x + 3, y + 6, x + 12, y + 15, '#f4f6fa'); fillEll(x + 5, y, x + 10, y + 7, '#f4f6fa');
  px(x + 6, y + 2, 1, 1, sK); px(x + 9, y + 2, 1, 1, sK); px(x + 8, y + 4, 3, 1, '#e07830');
  px(x + 5, y - 3, 6, 3, sK); px(x + 4, y, 8, 1, sK); }
function drawLampSnow(x, y) { px(x + 7, y - 8, 2, 22, '#2a2a34');
  px(x + 4, y - 12, 8, 5, (performance.now() / 400 | 0) % 2 ? '#f0c060' : '#e0a848');
  px(x + 4, y - 13, 8, 1, '#e6eaf2'); px(x + 5, y - 14, 6, 1, '#e6eaf2'); }
function drawLightString(x, y) { /* sagging holiday lights across the whole street */
  var t = (performance.now() / 350) | 0;
  for (var i = 0; i < 30; i++) {
    var lx = i * 8 + 2, ly = y + 26 + Math.round(Math.sin(i / 4.6) * 4);
    px(lx, ly, 1, 1, '#3a3a44');
    if (i % 2 === 0) px(lx, ly + 1, 2, 2, ((i + t) % 4 === 0) ? COL.gold : ((i + t) % 4 === 2) ? COL.red : COL.teal);
  }
}
function drawCocoaCart(x, y) { px(x + 1, y + 4, 14, 8, '#8a3c2c'); px(x + 1, y + 4, 14, 1, '#6a2c20');
  px(x + 2, y + 12, 3, 3, '#22222a'); px(x + 11, y + 12, 3, 3, '#22222a');
  px(x + 4, y, 8, 4, '#d8d0c0'); px(x + 6, y - 3, 2, 3, '#b8b8c4');
  var t = (performance.now() / 500 | 0) % 2; px(x + 9 + t, y - 5, 1, 2, '#c8d0e0'); /* steam */ }
function drawStageDoor(x, y) { px(x, y, TS, TS, '#3a2a22'); px(x + 3, y + 2, 10, 14, '#241a14');
  px(x + 5, y + 5, 6, 2, '#141018'); px(x + 11, y + 9, 2, 2, sBZ); }
function drawBoxOffice(x, y) { px(x, y + 4, TS, 12, '#6a4a34'); px(x, y + 4, TS, 2, '#523826');
  px(x + 2, y - 4, 12, 8, '#d8d0c0'); px(x + 2, y - 4, 12, 1, '#8a8278');
  px(x + 4, y - 2, 8, 4, '#241a14'); }
function drawPhoto(x, y) { px(x + 2, y + 2, 12, 12, sBZ); px(x + 4, y + 4, 8, 8, '#d8d0c0');
  px(x + 6, y + 6, 4, 3, '#4a3028'); px(x + 5, y + 9, 6, 2, '#3a3a4a'); }
function drawCoatRack(x, y) { px(x + 7, y + 1, 2, 14, '#523826');
  px(x + 2, y + 3, 12, 1, '#523826');
  px(x + 2, y + 4, 4, 8, '#5a4a6a'); px(x + 10, y + 4, 4, 7, '#7a2a3a'); }
function drawMicStand(x, y) { px(x + 7, y + 2, 2, 13, '#22222a'); px(x + 5, y + 14, 6, 2, '#22222a');
  px(x + 6, y - 1, 4, 4, '#3a3a44'); px(x + 7, y, 2, 2, '#6a6a76'); }
function drawBulbMirror(x, y) { px(x + 1, y + 1, 14, 14, '#8a6a3c');
  px(x + 3, y + 3, 10, 10, '#b8c8d8'); px(x + 5, y + 5, 3, 5, '#d8e4ee');
  var t = (performance.now() / 400 | 0) % 2;
  for (var i = 0; i < 4; i++) { px(x + 1 + i * 4, y, 2, 2, (i % 2 === t) ? COL.gold : '#8a6a3c'); px(x + 1 + i * 4, y + 14, 2, 2, (i % 2 !== t) ? COL.gold : '#8a6a3c'); } }
function drawCouch(x, y) { px(x, y + 5, 32, 9, '#6a7a4a'); px(x, y + 5, 32, 2, '#7e9058');
  px(x, y + 3, 4, 11, '#586840'); px(x + 28, y + 3, 4, 11, '#586840'); px(x + 2, y + 14, 28, 2, '#38442a');
  px(x + 8, y + 6, 7, 4, '#8a5a4a'); /* mystery stain, historic */ }
function drawFridge(x, y) { px(x + 2, y - 4, 12, 20, '#c8ccd4'); px(x + 2, y - 4, 12, 1, '#8a8e96');
  px(x + 2, y + 4, 12, 1, '#8a8e96'); px(x + 12, y - 1, 1, 3, '#3a3a44'); px(x + 12, y + 7, 1, 4, '#3a3a44');
  px(x + 3, y - 3, 6, 2, '#e0a848'); /* "BILL'S" tape label, ignored */ }
function drawTypewriter(x, y) { px(x, y + 6, TS, 10, '#6a4a34'); px(x, y + 6, TS, 2, '#523826');
  px(x + 3, y, 10, 6, '#3a3a44'); px(x + 4, y - 2, 8, 2, '#d8d0c0'); px(x + 4, y + 4, 8, 1, '#6a6a76'); }
function drawTrunk(x, y) { var got = hasFlag('sc_elevator_key');
  px(x + 1, y + 4, 14, 10, '#6e4a2c'); px(x + 1, y + 4, 14, 2, '#523620');
  px(x + 1, y + 8, 14, 1, '#3a2616'); px(x + 6, y + 8, 4, 3, got ? '#3a2616' : sBZ);
  px(x + 2, y + 2, 12, 2, '#8a6a3c'); }
function drawCorkboard(x, y) { px(x - 2, y + 1, 36, 13, '#8a6a3c'); px(x, y + 3, 32, 9, '#c8a86a');
  px(x + 2, y + 4, 6, 4, '#d8d0c0'); px(x + 12, y + 5, 6, 4, '#d8d0c0'); px(x + 22, y + 4, 6, 4, '#d8d0c0');
  px(x + 5, y + 6, 10, 1, sRD); px(x + 15, y + 7, 9, 1, sRD); /* red string */
  px(x + 9, y + 5, 1, 1, sRD); px(x + 19, y + 6, 1, 1, sRD); }
function drawMimeo(x, y) { px(x + 2, y + 4, 12, 10, '#4a4a56'); px(x + 2, y + 4, 12, 2, '#3a3a44');
  var t = (performance.now() / 320 | 0) % 3;
  px(x + 4, y - 2 + t, 8, 6, '#e8e4d8'); px(x + 5, y + t, 6, 1, '#8a8694'); px(x + 5, y + 2 + t, 4, 1, '#8a8694'); }
function drawCrate(x, y) { px(x + 1, y + 3, 14, 12, '#6e4a2c'); px(x + 1, y + 3, 14, 1, '#523620');
  px(x + 1, y + 8, 14, 1, '#523620'); px(x + 3, y + 5, 8, 2, '#3a2616'); /* stencil */ }
function drawElevator(x, y) { var open = hasFlag('sc_elevator_key');
  px(x - 2, y - 4, 20, 20, '#5a5a66'); px(x - 2, y - 4, 20, 2, '#3a3a44');
  px(x, y - 1, 16, 16, open ? '#241a14' : '#4a4a56');
  px(x + 7, y - 1, 2, 16, open ? '#241a14' : '#3a3a44');
  px(x + 18, y + 2, 2, 3, open ? COL.teal : sRD); }
function drawSpeaker(x, y) { px(x + 2, y - 4, 12, 20, '#22222a'); px(x + 2, y - 4, 12, 1, '#3a3a44');
  fillEll(x + 4, y - 2, x + 11, y + 5, '#3a3a44'); fillEll(x + 6, y, x + 9, y + 3, '#14141a');
  fillEll(x + 4, y + 7, x + 11, y + 14, '#3a3a44'); fillEll(x + 6, y + 9, x + 9, y + 12, '#14141a'); }
function drawVelvetRope(x, y) { px(x + 2, y + 4, 2, 11, sBZ); px(x + 12, y + 4, 2, 11, sBZ);
  px(x + 1, y + 15, 4, 1, sBZs); px(x + 11, y + 15, 4, 1, sBZs);
  for (var i = 0; i < 8; i++) px(x + 3 + i, y + 6 + Math.round(Math.sin(i / 2.2) * 2), 1, 2, '#8b2c3c'); }
function drawBoothVIP(x, y) { px(x, y + 2, 32, 12, '#5e1e2a'); px(x, y + 2, 32, 2, '#7e2e3a');
  px(x + 2, y + 10, 28, 4, '#3a141c'); px(x + 10, y + 5, 12, 4, '#8a6a3c'); }
function drawBarNeon(x, y) { px(x, y + 6, TS, 10, '#2a2430'); px(x, y + 6, TS, 2, '#3a3444');
  var t = (performance.now() / 300 | 0) % 2;
  px(x + 2, y, 12, 4, t ? COL.neon : COL.pink); px(x + 4, y + 1, 8, 2, '#14141a'); }

/* Christmas street cutscene backdrop */
BGS.xmas = function () {
  cls('#141824');
  var st = [[20, 10], [60, 22], [120, 8], [170, 18], [210, 12], [90, 30]];
  for (var i = 0; i < st.length; i++) px(st[i][0], st[i][1], 2, 2, COL.white);
  px(0, 60, 240, 60, '#3a2a2e');
  for (i = 0; i < 6; i++) { px(6 + i * 40, 46, 30, 74, '#5e3c34'); px(12 + i * 40, 56, 8, 10, '#e0a848'); px(24 + i * 40, 76, 8, 10, '#e0a848'); }
  px(0, 118, 240, 42, '#e6eaf2');
  for (i = 0; i < 14; i++) px(8 + i * 17, 124 + (i % 3) * 8, 2, 1, '#c8d0e0');
  var t = (performance.now() / 260 | 0);
  for (i = 0; i < 24; i++) px((i * 37 + t * 3) % 240, (i * 53 + t * 2) % 118, 1, 1, COL.white);
};

/* ---------------- WELLS STREET IN EXILE (arrival town) ---------------- */
registerMap('wellsstreet', {
  banner: 'WELLS ST. IN EXILE - NYC', music: 'xmas', safe: true, riftBg: 'xmas',
  grid: [
    'WWVWWWWVWWWWWWVWWWWWVWWW',
    'WWVWWWWVWWWWWWVWWWWWVWWW',
    'SSSSSSSSSSSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSSSSSSSSSSS',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
    'RRRRRRRRRRRRRRRRRRRRRRRR',
    'SSSSSSSSSSSSSSSSSSSSSSSS',
    'SSSSSSSSSSSSSSSSSSSSSSSS',
    'WWVWWWVWWWSSWWVWWWVVWWWW',
    'WWVWWWVWWWSSWWVWWWVVWWWW',
    'WWWWWWWWWWSSWWWWWWWWWWWW',
    'WWWWWWWWWWSSWWWWWWWWWWWW',
    'WWWWWWWWWWSSWWWWWWWWWWWW',
    'WWWWWWWWWWSSWWWWWWWWWWWW'
  ],
  warps: [
    { x: 17, y: 2, to: 'clubinferno', tx: 9, ty: 12, dir: 'up', gate: 'rex_beaten',
      blocked: function () { say([['BOUNCER', 'PRIVATE EVENT TONIGHT.'], ['BOUNCER', 'AND TOMORROW. AND FOREVER.'], ['BOUNCER', 'MANAGEMENT LOVES FOREVER.']]); } },
    { x: 10, y: 13, to: 'backalley', tx: 6, ty: 5, dir: 'up' },
    { x: 11, y: 13, to: 'backalley', tx: 6, ty: 5, dir: 'up' }
  ],
  objs: [
    { x: 0, y: 0, solid: false, draw: drawLightString },
    { x: 3, y: 0, solid: false, draw: function (x, y) { drawMarquee(x, y); } },
    { x: 5, y: 1, solid: true, draw: drawPadlock, onInteract: function () {
        say([['NARRATOR', 'THE FAMOUS STAGE, DARK. A PADLOCK'], ['NARRATOR', 'THE SIZE OF A HAM. A NOTICE:'], ['NARRATOR', '"CLOSED BY SCRIPTED ORDER."'],
             ['SAMUEL', 'THEY LOCKED UP COMEDY ITSELF.'], ['HERSCHEL', 'THE HAM COMPARISON STANDS.']]); } },
    { x: 16, y: 0, solid: false, draw: function (x, y) { var t = (performance.now() / 280 | 0) % 2;
        px(x + 4, y + 4, 40, 10, '#1a1620'); drawText('INFERNO', x + 7, y + 6, t ? COL.neon : COL.pink); } },
    { x: 9, y: 1, solid: true, draw: drawSign, onInteract: function () {
        say([['NARRATOR', 'POSTER: "IMPROV IS ILLEGAL."'], ['NARRATOR', '"SCRIPTS AVAILABLE ON REQUEST."'], ['NARRATOR', '"MERRY CHRISTMAS. - THE ORDER"']]); } },
    /* street furniture */
    { x: 2, y: 2, solid: true, draw: drawLampSnow }, { x: 13, y: 2, solid: true, draw: drawLampSnow },
    { x: 21, y: 2, solid: true, draw: drawLampSnow }, { x: 5, y: 7, solid: true, draw: drawLampSnow },
    { x: 14, y: 6, solid: true, draw: drawXmasTree, onInteract: function () {
        say([['NARRATOR', 'THE BLOCK TREE. THE ANGEL ON TOP'], ['NARRATOR', 'IS A LITTLE MUSTACHE SOMEONE'], ['NARRATOR', 'BENT OUT OF TINSEL. RESPECT.']]); } },
    { x: 3, y: 6, solid: true, draw: drawSnowman, onInteract: function () {
        say([['NARRATOR', 'SOMEONE GAVE THE SNOWMAN A'], ['NARRATOR', 'TOP HAT AND A TINY SCRIPT.'], ['NARRATOR', 'HE REFUSES TO READ IT.']]); } },
    /* street people */
    { x: 7, y: 6, solid: true, draw: drawCocoaCart },
    { x: 8, y: 7, solid: true, spr: 'vendor', dir: 'up', onInteract: function () {
        say([['COCOA MAN', 'HOT COCOA! TWO SHILLINGS!'], ['COCOA MAN', 'FREE FOR SAD COMEDIANS.'], ['COCOA MAN', 'BUSINESS IS TERRIBLE. DRINK UP.']]); healParty(); sfx('heal'); } },
    { x: 12, y: 3, solid: true, spr: 'villager', dir: 'down', onInteract: function () {
        say([['PAPERBOY', 'EXTRA! EXTRA! IMPROV BAN'], ['PAPERBOY', 'EXTENDED THROUGH THE HOLIDAYS!'], ['PAPERBOY', 'ALSO: DISCO STILL LEGAL. ODD.']]); } },
    { x: 19, y: 6, solid: true, spr: 'caroler', dir: 'right', onInteract: function () { carolers(); } },
    { x: 21, y: 7, solid: true, spr: 'caroler', dir: 'left', onInteract: function () { carolers(); } },
    { x: 20, y: 7, solid: true, spr: 'caroler', dir: 'up', onInteract: function () { carolers(); } },
    { x: 2, y: 3, solid: true, spr: 'streetcomic', dir: 'right', onInteract: function () { streetComic(); } },
    /* the Order patrols even on Christmas week */
    mkTrainer(16, 4, { spr: 'scgoon', dir: 'left', patrol: { ax: 'h', span: 4 }, sight: 3, defeat: 'tr_nyc_goon1', enemy: 'gerald', level: 9, reward: 30, bg: 'xmas', tname: 'ORDER PATROLMAN', hail: 'LAUGHTER PERMIT, PLEASE.', beaten: 'PERMIT... APPROVED. CARRY ON.' })
  ],
  onEnter: function () { if (!hasFlag('nyc_arrived_seen')) { setFlag('nyc_arrived_seen'); nycArrive(); } else if (hasFlag('nyc_done')) { musicStart('xmas'); } }
});

/* ---------------- BACK ALLEY (the secret entrance) ---------------- */
registerMap('backalley', {
  banner: 'BACK ALLEY - NEW YORK', music: 'xmas', safe: true,
  grid: [
    'bbbbbbbbbbbbb',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#S|SSSSSSS|S#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '######S######'
  ],
  warps: [
    { x: 6, y: 1, to: 'scfront', tx: 7, ty: 8, dir: 'up', gate: 'sc_password',
      blocked: function () { say([['NARRATOR', 'A SLOT IN THE DOOR OPENS.'], ['DOOR', 'PASSWORD.'], ['SAMUEL', 'UM. OPEN SESAME?'], ['DOOR', 'THAT IS A DIFFERENT FRANCHISE.'],
             ['NARRATOR', 'THE SHIVERING FELLOW OUT FRONT'], ['NARRATOR', 'LOOKED LIKE A MAN WITH SECRETS.']]); } },
    { x: 6, y: 7, to: 'wellsstreet', tx: 10, ty: 12, dir: 'down' }
  ],
  objs: [
    { x: 6, y: 0, solid: true, draw: drawStageDoor, onInteract: function () {
        if (hasFlag('sc_password')) say([['DOOR', 'PASSWORD ACCEPTED, FRIEND.'], ['DOOR', 'WALK IN LIKE YOU MEAN IT.']]);
        else say([['NARRATOR', 'AN UNMARKED STAGE DOOR WITH A'], ['NARRATOR', 'PEEPHOLE. FAINT LAUGHTER LEAKS'], ['NARRATOR', 'THROUGH THE BRICKS. SUSPICIOUS.']]); } },
    { x: 10, y: 4, solid: true, draw: drawSign, onInteract: function () {
        say([['NARRATOR', 'GRAFFITI: "THE PASSWORD IS NOT'], ['NARRATOR', 'A WORD. IT IS A PHILOSOPHY."'], ['NARRATOR', 'BELOW, SMALLER: "ASK LENNY."']]); } },
    { x: 11, y: 6, solid: true, draw: drawDumpster, onInteract: function () {
        say([['NARRATOR', 'A DUMPSTER FULL OF CONFISCATED'], ['NARRATOR', 'WHOOPEE CUSHIONS. A WAR CRIME.']]); } },
    mkTrainer(3, 3, { spr: 'scgoon', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 2, defeat: 'tr_nyc_goon2', enemy: 'gerald', level: 9, reward: 30, bg: 'xmas', tname: 'ALLEY INSPECTOR', hail: 'THIS ALLEY IS SUSPICIOUSLY FUNNY.', beaten: 'FINE. THE ALLEY IS CLEAN.' }),
    { x: 2, y: 6, mustache: true, flag: 'stache_nyc', onInteract: function (o) { collectMustache(o, 'stache_nyc'); } }
  ]
});

/* ---------------- SECOND CITY: FRONT OF HOUSE ---------------- */
registerMap('scfront', {
  banner: 'SECOND CITY (IN EXILE)', music: 'jazz', safe: true,
  grid: [
    'IIIIIIINIIIIIII',
    'INNNNNNNNNNNNNI',
    'INNNNNNNNNNNNNI',
    'INNNNNNNNNNNNNI',
    'NNNNNNNNNNNNNNN',
    'INNNNNNNNNNNNNN',
    'INNNNNNNNNNNNNI',
    'INNNNNNNNNNNNNI',
    'INNNNNNNNNNNNNI',
    'IIIIIIINIIIIIII'
  ],
  warps: [
    { x: 7, y: 9, to: 'backalley', tx: 6, ty: 2, dir: 'down' },
    { x: 7, y: 0, to: 'scgreenroom', tx: 6, ty: 7, dir: 'up' },
    { x: 14, y: 4, to: 'sctheater', tx: 1, ty: 5, dir: 'right' },
    { x: 14, y: 5, to: 'sctheater', tx: 1, ty: 5, dir: 'right' },
    { x: 0, y: 4, to: 'scbasement', tx: 2, ty: 1, dir: 'left' }
  ],
  objs: [
    { x: 2, y: 1, solid: true, draw: drawBoxOffice, onInteract: function () {
        say([['NARRATOR', 'BOX OFFICE. THE PRICE BOARD READS:'], ['NARRATOR', '"ADMISSION: ONE LAUGH."'], ['NARRATOR', '"WE ARE A RESISTANCE, NOT A CHARITY."']]); } },
    { x: 3, y: 2, solid: true, spr: 'radner', dir: 'down', onInteract: function () {
        say([['RADNER', 'WELCOME IN, HONEY! COLD OUT?'], ['RADNER', "I'M GILDA. VISITING FROM THE"], ['RADNER', 'TORONTO CELL. YES, CELL.'],
             ['RADNER', 'THE SHOW RUNS ALL NIGHT AND THE'], ['RADNER', 'BASEMENT RUNS THE REVOLUTION.'], ['RADNER', 'BOTH HAVE A TWO-JOKE MINIMUM.']]); } },
    /* the alumni photo wall */
    { x: 9, y: 0, solid: true, draw: drawPhoto, onInteract: function () {
        say([['NARRATOR', 'PHOTO: CHICAGO, 1959. A LITTLE'], ['NARRATOR', 'CABARET OPENS ON WELLS STREET.'], ['NARRATOR', 'EVERYONE LOOKS TERRIFIED. GOOD.']]); } },
    { x: 10, y: 0, solid: true, draw: drawPhoto, onInteract: function () {
        say([['NARRATOR', 'PHOTO: THE OLD MAINSTAGE, 1973.'], ['NARRATOR', 'A BEARDED DIRECTOR MID-SERMON.'], ['NARRATOR', 'CAPTION: "DEL RETURNS. BEHAVE."']]); } },
    { x: 11, y: 0, solid: true, draw: drawPhoto, onInteract: function () {
        say([['NARRATOR', 'PHOTO: HALF THE CAST, WAVING,'], ['NARRATOR', 'OFF TO SOME LATE-NIGHT SKETCH'], ['NARRATOR', 'PROGRAM. "IT WON\'T LAST." - DEL']]); } },
    { x: 13, y: 1, solid: true, draw: drawCoatRack, onInteract: function () {
        say([['NARRATOR', 'THE COAT CHECK. EVERY COAT IS'], ['NARRATOR', 'BLACK TURTLENECK ADJACENT.']]); } },
    { x: 12, y: 7, solid: true, draw: drawCounter, onInteract: function () { setScene(makeShop(SHOP_SC, World, 'RESISTANCE MERCH TABLE')); } },
    { x: 1, y: 7, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 10, y: 3, solid: true, spr: 'villager2', dir: 'down', onInteract: function () {
        say([['USHER', 'THE THEATER IS THROUGH THE'], ['USHER', 'RIGHT DOOR. GREEN ROOM UPSTAIRS.'], ['USHER', 'BASEMENT IS... A STORAGE ROOM.'], ['USHER', 'A VERY ORGANIZED STORAGE ROOM.']]); } }
  ],
  onEnter: function () { if (!hasFlag('sc_inside')) { setFlag('sc_inside'); scWelcome(); } }
});

/* ---------------- SECOND CITY: MAINSTAGE THEATER ---------------- */
registerMap('sctheater', {
  banner: 'THE MAINSTAGE', music: 'jazz', safe: true,
  grid: [
    'IUUUUUUUUUUUUUI',
    'IYYYYYYYYYYYYYI',
    'IYYYYYYYYYYYYYI',
    'INNNNNNNNNNNNNI',
    'IEEEEENNNEEEEEI',
    'NNNNNNNNNNNNNNI',
    'IEEEEENNNEEEEEI',
    'INNNNNNNNNNNNNI',
    'IEEEEENNNEEEEEI',
    'IIIIIIIIIIIIIII'
  ],
  warps: [ { x: 0, y: 5, to: 'scfront', tx: 13, ty: 4, dir: 'left' } ],
  objs: [
    { x: 7, y: 1, solid: true, draw: drawMicStand, onInteract: function () {
        say([['NARRATOR', 'THE MIC IS A DECOY. IMPROV'], ['NARRATOR', 'NEEDS NO AMPLIFICATION.'], ['NARRATOR', 'BELUSHI NEEDS DE-AMPLIFICATION.']]); } },
    { x: 5, y: 2, solid: true, spr: 'belushi', dir: 'down', onInteract: function () {
        say([['BELUSHI', 'YOU MADE IT PAST THE DOOR!'], ['BELUSHI', 'SIT DOWN. WATCH THE SET.'], ['BELUSHI', "I'M NOT LOUD. THE ROOM IS QUIET."],
             ['BELUSHI', 'STAY FOR THE BASEMENT MEETING.'], ['BELUSHI', 'DEL EXPLAINS THE WHOLE WAR.'], ['BELUSHI', 'BRING A NOTEBOOK. AND A HELMET.']]); } },
    { x: 9, y: 2, solid: true, spr: 'flaherty', dir: 'down', onInteract: function () {
        say([['FLAHERTY', "I'M JOE. I PLAY THE CALM ONE."], ['FLAHERTY', 'ON STAGE AND IN THE RESISTANCE.'], ['FLAHERTY', 'SOMEBODY HAS TO.']]); } },
    /* seated audience */
    { x: 3, y: 4, solid: false, spr: 'villager', dir: 'up' },
    { x: 11, y: 4, solid: false, spr: 'villager2', dir: 'up' },
    { x: 4, y: 6, solid: false, spr: 'discoer', dir: 'up', onInteract: function () {
        say([['AUDIENCE', 'I CAME FOR THE DISCO UPSTAIRS'], ['AUDIENCE', 'AND STAYED FOR THE TRUTH.'], ['AUDIENCE', 'ALSO THE COCOA. // JOKE SLOT']]); } },
    { x: 12, y: 8, solid: false, spr: 'villager', dir: 'up' },
    /* your seat, front row center */
    { x: 7, y: 3, solid: false, standOn: true, onInteract: function () { watchShow(); },
      draw: function (x, y) { px(x + 3, y + 10, 10, 3, '#8b2c3c'); px(x + 3, y + 13, 10, 2, '#5e1e2a');
        if (!hasFlag('sc_show_seen')) { var t = (performance.now() / 300 | 0) % 2; if (t) px(x + 6, y + 2, 4, 4, COL.gold); } } }
  ]
});

/* ---------------- SECOND CITY: GREEN ROOM ---------------- */
registerMap('scgreenroom', {
  banner: 'THE GREEN ROOM', music: 'jazz', safe: true,
  grid: [
    'IIIIIIIIIIIII',
    'I...........I',
    'I...........I',
    'I...........I',
    'I...........I',
    'I...........I',
    'I...........I',
    'I...........I',
    'IIIIII.IIIIII'
  ],
  warps: [ { x: 6, y: 8, to: 'scfront', tx: 7, ty: 1, dir: 'down' } ],
  objs: [
    { x: 2, y: 0, solid: true, draw: drawBulbMirror, onInteract: function () {
        say([['NARRATOR', 'THE MIRROR HAS SEEN EVERY'], ['NARRATOR', 'PRE-SHOW FACE SINCE 1959.'], ['NARRATOR', 'IT REMAINS UNIMPRESSED.']]); } },
    { x: 9, y: 0, solid: true, draw: drawSign, onInteract: function () {
        say([['NARRATOR', 'THE PROP SHELF. RULE ONE:'], ['NARRATOR', 'PROPS ARE FOR COWARDS.'], ['NARRATOR', 'RULE TWO: EXCEPT THE GOOD ONES.']]); } },
    { x: 5, y: 3, solid: true, draw: function (x, y) { drawCouch(x, y); },
      onInteract: function () { say([['NARRATOR', 'THE LEGENDARY COUCH. SCIENTISTS'], ['NARRATOR', 'DATE THE STAIN TO OPENING NIGHT.'], ['NARRATOR', 'IT IS LOAD-BEARING NOW.']]); } },
    { x: 6, y: 3, solid: true, draw: function () {} },
    { x: 11, y: 1, solid: true, draw: drawFridge },
    { x: 10, y: 2, solid: true, spr: 'murray', dir: 'right', onInteract: function () {
        say([['MURRAY', 'THIS SANDWICH? FOUND IT.'], ['MURRAY', 'IN THE FRIDGE. BEHIND A LABEL'], ['MURRAY', 'WITH SOMEONE ELSE\'S NAME ON IT.'],
             ['MURRAY', "I'M NOT STEALING. I'M"], ['MURRAY', 'IMPROVISING OWNERSHIP.'], ['MURRAY', 'DEL SAYS COMMIT. I COMMIT.']]); } },
    { x: 2, y: 4, solid: true, draw: drawTypewriter },
    { x: 3, y: 5, solid: true, spr: 'ramis', dir: 'left', onInteract: function () {
        if (hasFlag('sc_briefed') && !hasFlag('sc_elevator_key'))
          say([['RAMIS', 'DEL BRIEFED YOU? GOOD.'], ['RAMIS', 'COMEDY IS STRUCTURE. SO IS A'], ['RAMIS', 'TRUNK. CHECK THE PROP TRUNK.']]);
        else say([['RAMIS', "I'M WRITING NEXT MONTH'S SHOW."], ['RAMIS', 'IT IS ABOUT A HAUNTED HOTEL.'], ['RAMIS', 'OR GHOSTS YOU CAN HIRE. UNCLEAR.'],
             ['RAMIS', 'THE TRICK IS STRUCTURE. JOKES'], ['RAMIS', 'ARE JUST LOAD-BEARING WALLS.'], ['RAMIS', 'HERSCHEL WOULD UNDERSTAND. // JOKE SLOT']]); } },
    { x: 8, y: 5, solid: true, spr: 'aykroyd', dir: 'down', onInteract: function () {
        say([['AYKROYD', 'THIS IS A MODEL 400 SCANNER.'], ['AYKROYD', 'FOUR CRYSTALS. TWENTY CHANNELS.'], ['AYKROYD', 'I MONITOR ORDER GOON FREQUENCIES.'],
             ['AYKROYD', 'ALSO HOCKEY SCORES.'], ['AYKROYD', 'PRIORITIES ARE A LADDER,'], ['AYKROYD', 'NOT A WALL.']]); } },
    { x: 1, y: 7, solid: true, draw: drawTrunk, onInteract: function () { trunkInteract(); } }
  ]
});

/* ---------------- SECOND CITY: BASEMENT (RESISTANCE HQ) ---------------- */
registerMap('scbasement', {
  banner: 'RESISTANCE HQ', music: 'jazz', safe: true,
  grid: [
    'IIIIIIIIIIIIIII',
    'IZZZZZZZZZZZZZI',
    'IZZZZZZZZZZZZZI',
    'IZZZZZZZZZZZZZI',
    'IZZZZrrrZZZZZZI',
    'IZZZZrrrZZZZZZI',
    'IZZZZrrrZZZZZZI',
    'IZZZZZZZZZZZZZI',
    'IZZZZZZZZZZZZZI',
    'IIIIIIIIIIIIIII'
  ],
  warps: [
    { x: 1, y: 1, to: 'scfront', tx: 1, ty: 4, dir: 'right' },
    { x: 13, y: 2, to: 'clubinferno', tx: 1, ty: 6, dir: 'up', gate: 'sc_elevator_key',
      blocked: function () { say([['NARRATOR', 'THE FREIGHT ELEVATOR. IT GOES'], ['NARRATOR', 'ONE PLACE: UP. IT IS LOCKED.'], ['NARRATOR', 'THE PANEL WANTS A KEY.']]); } }
  ],
  objs: [
    { x: 5, y: 0, solid: true, draw: drawCorkboard, onInteract: function () {
        say([['NARRATOR', 'THE WAR BOARD. RED STRING LINKS'], ['NARRATOR', 'ROME. DODGE. THE PLAYLIST. ALL'], ['NARRATOR', 'OF IT LEADS TO ONE POWDERED WIG.'],
             ['SAMUEL', 'SNOBBINGTON.'], ['NARRATOR', 'SOMEONE DREW A MUSTACHE ON HIM.'], ['NARRATOR', 'MORALE IS IMPORTANT.']]); } },
    { x: 10, y: 1, solid: true, draw: drawMimeo, onInteract: function () {
        say([['NARRATOR', 'THE MIMEOGRAPH PRINTS FLYERS:'], ['NARRATOR', '"LAUGHTER IS NOT A CRIME."'], ['NARRATOR', 'IT SMELLS PURPLE. GLORIOUS.']]); } },
    { x: 13, y: 1, solid: true, draw: drawElevator },
    { x: 3, y: 6, solid: true, draw: drawCrate }, { x: 11, y: 7, solid: true, draw: drawCrate },
    { x: 2, y: 7, solid: true, draw: drawCrate, onInteract: function () {
        say([['NARRATOR', 'CRATES STENCILED "SCRIPTS."'], ['NARRATOR', 'INSIDE: NOTHING. EVERY CRATE'], ['NARRATOR', 'IS A BIT. COMMITMENT.']]); } },
    { x: 6, y: 4, solid: true, spr: 'delclose', dir: 'down', onInteract: function () { delCloseTalk(); } },
    { x: 9, y: 5, solid: true, spr: 'streetcomic', dir: 'left', onInteract: function () {
        say([['TRAINEE', 'DEL MADE ME BE A DOOR FOR'], ['TRAINEE', 'THREE HOURS. I WAS A GREAT'], ['TRAINEE', 'DOOR. I HAVE NEVER FELT MORE.']]); } },
    { x: 11, y: 4, solid: true, spr: 'caroler', dir: 'left', onInteract: function () {
        say([['REBEL', 'BY DAY I CAROL. BY NIGHT I'], ['REBEL', 'IMPROVISE THE CAROLS.'], ['REBEL', 'THE ORDER SUSPECTS NOTHING. // JOKE SLOT']]); } }
  ]
});

/* ---------------- CLUB INFERNO (the disco upstairs) ---------------- */
registerMap('clubinferno', {
  banner: 'CLUB INFERNO', music: 'disco', riftBg: 'disco', safe: true,
  grid: [
    '####################',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    'fffffffffffffffffff#',
    '#fffffffffffffffffff',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#ffffffffffffffffff#',
    '#########ff#########'
  ],
  warps: [
    { x: 0, y: 6, to: 'scbasement', tx: 12, ty: 2, dir: 'left' },
    { x: 19, y: 7, to: 'boilerroom', tx: 2, ty: 5, dir: 'right' },
    { x: 9, y: 13, to: 'wellsstreet', tx: 17, ty: 3, dir: 'down' },
    { x: 10, y: 13, to: 'wellsstreet', tx: 17, ty: 3, dir: 'down' }
  ],
  objs: [
    { x: 2, y: 1, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 9, y: 1, solid: true, draw: drawCounter, onInteract: function () { say([['NARRATOR', 'THE DJ BOOTH. A NOTE READS:'], ['NARRATOR', '"OUT TO LUNCH. FOREVER."'], ['NARRATOR', '"- MANAGEMENT."']]); } },
    { x: 10, y: 6, solid: true, draw: function (x, y) { drawBall(x, y - 14);
        var t = (performance.now() / 200 | 0) % 4;
        px(x - 16 + t * 8, y + 10, 3, 2, 'rgba(255,255,255,0.5)'); px(x + 24 - t * 8, y + 18, 3, 2, 'rgba(255,255,255,0.35)'); },
      onInteract: function () { say([['NARRATOR', 'THE MIRROR BALL. LOW ENOUGH TO'], ['NARRATOR', 'TOUCH. IT HOLDS EVERY SATURDAY'], ['NARRATOR', 'NIGHT THERE EVER WAS.']]); } },
    /* the bar */
    { x: 14, y: 2, solid: true, draw: drawBarNeon }, { x: 15, y: 2, solid: true, draw: drawBarNeon }, { x: 16, y: 2, solid: true, draw: drawBarNeon },
    { x: 15, y: 1, solid: true, spr: 'bartender', dir: 'down', onInteract: function () {
        say([['BARTENDER', 'HOUSE SPECIAL IS A SHIRLEY'], ['BARTENDER', 'TEMPLE. REX DOES NOT PERMIT'], ['BARTENDER', 'ANYTHING STRONGER THAN JOY.']]); } },
    { x: 13, y: 2, solid: true, draw: drawSpeaker }, { x: 17, y: 2, solid: true, draw: drawSpeaker },
    /* VIP corner */
    { x: 16, y: 10, solid: true, draw: function (x, y) { drawBoothVIP(x, y); },
      onInteract: function () { say([['NARRATOR', 'THE VIP BOOTH. RESERVED SIGN'], ['NARRATOR', 'READS: "REX + THE MIRROR BALL."'], ['NARRATOR', 'A TABLE FOR TWO.']]); } },
    { x: 17, y: 10, solid: true, draw: function () {} },
    /* velvet rope by the front door */
    { x: 7, y: 12, solid: true, draw: drawVelvetRope }, { x: 12, y: 12, solid: true, draw: drawVelvetRope },
    /* regulars */
    { x: 14, y: 3, solid: true, spr: 'discoer', dir: 'left', onInteract: function () { coupleDonna(); } },
    { x: 12, y: 4, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'DANCING IS PERMITTED.'], ['GERALD', 'SPONTANEOUS DANCING IS NOT.'], ['GERALD', 'CONSULT THE APPROVED MOVES LIST.'], ['GERALD', '(THE LIST IS ONE MOVE.)']]); } },
    { x: 5, y: 4, solid: true, spr: 'discoer', dir: 'down', onInteract: function () { say([['DANCER', "I'VE DONE THE HUSTLE SINCE"], ['DANCER', 'TUESDAY. IT IS NOW SATURDAY.'], ['DANCER', 'SOMEONE PLEASE CALL MY BOSS.']]); } },
    { x: 8, y: 8, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'THE AUTOMATIC PLAYLIST NEVER'], ['GERALD', 'TIRES. NEVER ERRS. NEVER PAYS.'], ['GERALD', 'NEVER GETS FUNKY.'], ['SAMUEL', 'YOU SAID THE QUIET PART LOUD.']]); } },
    { x: 13, y: 9, solid: true, spr: 'villager2', dir: 'up', onInteract: function () { say([['REGULAR', 'MY PLATFORM SHOES ADD FOUR'], ['REGULAR', 'INCHES AND ONE PERSONALITY.'], ['REGULAR', '// JOKE SLOT']]); } },
    { x: 4, y: 10, solid: true, spr: 'discoer', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_NYC, World, 'CLUB MERCH TABLE')); } },
    { x: 2, y: 11, solid: true, spr: 'villager2', dir: 'right', onInteract: function () { coupleVinnie(); } },
    { x: 17, y: 11, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 1, y: 12, mustache: true, flag: 'stache_nyc3', onInteract: function (o) { collectMustache(o, 'stache_nyc3'); } },
    /* floor trainers — Rex's court */
    mkTrainer(8, 11, { spr: 'scgoon', dir: 'right', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_nyc_d', enemy: 'discofan', level: 10, reward: 36, bg: 'disco', tname: 'VELVET ROPE BOUNCER', hail: 'THE ROPE SAYS NO.', beaten: 'THE ROPE HAS RECONSIDERED.' }),
    mkTrainer(9, 5, { spr: 'discoer', dir: 'down', patrol: { ax: 'h', span: 4 }, sight: 3, defeat: 'tr_nyc_e', enemy: 'deejay', level: 11, reward: 42, bg: 'disco', tname: 'THE HUSTLE KING', hail: 'THIS FLOOR IS MY KINGDOM!', beaten: 'THE KINGDOM HAS A NEW KING.' }),
    mkTrainer(15, 5, { spr: 'skater', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_nyc_f', enemy: 'skater', level: 11, reward: 42, bg: 'disco', tname: 'STUDIO ANGEL', hail: 'YOU CANNOT SIT AT THE BAR.', beaten: 'OKAY. ONE SHIRLEY TEMPLE.' })
  ],
  onEnter: function () { if (!hasFlag('rosalind_joined')) { discoRosalind(); } else if (hasFlag('nyc_done')) { musicStart('disco'); } }
});

/* ---------------- BOILER ROOM (dungeon) ---------------- */
registerMap('boilerroom', {
  banner: 'UNDER THE DANCE FLOOR', music: 'disco', encPool: 'disco',
  grid: [
    '###############',
    '#....O....O...#',
    '#.tt.......tt.#',
    '#.tt.......tt.#',
    '#.....OOO.....#',
    '#.............#',
    '#.tt.....O.tt.#',
    '#.tt.......tt.#',
    '#......O......#',
    '#.............#',
    '###############'
  ],
  warps: [
    { x: 1, y: 5, to: 'clubinferno', tx: 18, ty: 7, dir: 'left' },
    { x: 13, y: 1, to: 'rooftop', tx: 6, ty: 8, dir: 'up' }
  ],
  objs: [
    { x: 7, y: 5, solid: true, spr: 'gerald', dir: 'down', flag: 'nyc_gerald1',
      onInteract: function (o) { nycGeraldBattle(o); } },
    { x: 7, y: 9, solid: true, draw: drawPlaylist, flag: 'nyc_playlist',
      onInteract: function (o) { playlistBattle(o); } },
    { x: 10, y: 2, solid: true, spr: 'gerald', dir: 'right', onInteract: function () { say([['GERALD', "REX IS ON THE ROOF. HE WON'T"], ['GERALD', 'SIGN THE PLAYLIST CONTRACT.'], ['GERALD', 'HE SAID, QUOTE, "NEVER."'], ['GERALD', 'IT WAS HONESTLY VERY COOL.']]); } },
    mkTrainer(5, 5, { spr: 'discoer', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_nyc_a', enemy: 'discofan', level: 10, reward: 34, bg: 'disco', tname: 'DISCO REGULAR', hail: 'YOU WANNA BATTLE? ON THE FLOOR?', beaten: 'OKAY OKAY, YOU GOT THE MOVES.' }),
    mkTrainer(13, 4, { spr: 'deejay', dir: 'up', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_nyc_b', enemy: 'deejay', level: 10, reward: 40, bg: 'disco', tname: 'THE HYPE-MAN', hail: 'MAKE SOME NOISE FOR YOUR DEFEAT!', beaten: 'AIGHT, AIGHT, YOU GOT BARS.' }),
    mkTrainer(6, 9, { spr: 'skater', dir: 'right', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_nyc_c', enemy: 'skater', level: 10, reward: 40, bg: 'disco', tname: 'ROLLER SKATER', hail: "CAN'T STOP, WON'T STOP — LET'S GO!", beaten: 'WIPEOUT. RESPECT, THOUGH.' }),
    { x: 13, y: 9, mustache: true, flag: 'stache_nyc2', onInteract: function (o) { collectMustache(o, 'stache_nyc2'); } }
  ]
});

/* ---------------- ROOFTOP (boss) ---------------- */
registerMap('rooftop', {
  banner: 'THE ROOFTOP', music: 'disco',
  grid: [
    '#############',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#SSSSSSSSSSS#',
    '#############'
  ],
  warps: [ { x: 6, y: 9, to: 'boilerroom', tx: 12, ty: 1, dir: 'down' } ],
  objs: [
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('rex_beaten')) SPR.rex(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('rex_beaten')) rexFight(); } },
    { x: 10, y: 2, solid: true, draw: drawBall, onInteract: function () {
        if (hasFlag('rex_beaten')) say([['NARRATOR', 'THE CRATE IS EMPTY. THE GOLDEN'], ['NARRATOR', 'AGE TRAVELS WITH THE DADDIES NOW.']]);
        else say([['NARRATOR', 'THE MIRROR BALL, LOWERED FOR'], ['NARRATOR', 'MAINTENANCE. IT HOLDS EVERY'], ['NARRATOR', 'SATURDAY NIGHT THERE EVER WAS.']]); } },
    { x: 2, y: 2, solid: true, draw: drawSnowman, onInteract: function () {
        say([['NARRATOR', "REX BUILT IT. IT'S DOING THE"], ['NARRATOR', 'HUSTLE. IT IS VERY GOOD.']]); } }
  ],
  onEnter: function () { if (!hasFlag('rex_beaten') && hasFlag('rosalind_joined')) rexFight(); }
});

/* ---------------- NYC story beats ---------------- */
function nycArrive() {
  Cutscene.play([
    { bg: 'xmas' }, { music: 'xmas' },
    { narr: 'NEW YORK, 1977. CHRISTMAS WEEK.' },
    { narr: 'SNOW ON THE STOOPS. LIGHTS ON THE LAMPPOSTS. A BAN ON THE BOOKS.' },
    { say: ['HERSCHEL', 'MY HIPS SAY IT IS COLD.'] },
    { say: ['HERSCHEL', 'MY HIPS ARE NEVER WRONG.'] },
    { say: ['WILLIAM', 'A ROYAL WINTER! CRISP. NOBLE.'] },
    { say: ['WILLIAM', 'MY MUSTACHE HAS FROZEN'] },
    { say: ['WILLIAM', 'MAJESTICALLY.'] },
    { narr: 'ACROSS THE STREET: A DARK MARQUEE. "SECOND CITY." PADLOCKED.' },
    { say: ['SAMUEL', 'THE FAMOUS IMPROV THEATER...'] },
    { say: ['SAMUEL', 'WAIT. THIS SHOULD BE IN CHICAGO.'] },
    { say: ['BABBAGE', 'IT SHOULD, MASTER SAMUEL.'] },
    { say: ['BABBAGE', 'THE ORDER PADLOCKED THE CHICAGO'] },
    { say: ['BABBAGE', 'HOME. THE TROUPE FLED EAST.'] },
    { say: ['BABBAGE', 'THEY PERFORM IN SECRET, IN'] },
    { say: ['BABBAGE', 'EXILE, SOMEWHERE ON THIS BLOCK.'] },
    { say: ['SAMUEL', 'AND ROSALIND IS WITH THEM?'] },
    { say: ['BABBAGE', 'HER LAST POSTCARD SAID ONLY:'] },
    { say: ['BABBAGE', '"FOLLOW THE DISCO BALL."'] },
    { say: ['SAMUEL', 'FIND THE COMEDIANS. FIND HER.'] },
    { say: ['SAMUEL', 'SAVE CHRISTMAS. STANDARD WEEK.'] }
  ], { onDone: function () { gotoWorld(); } });
}
/* the shivering comic out front holds the password */
function streetComic() {
  if (hasFlag('sc_password')) {
    say([['LENNY', 'DOOR TREATING YOU RIGHT?'], ['LENNY', 'REMEMBER: WALK IN LIKE THE'], ['LENNY', 'SCENE ALREADY STARTED.']]);
    return;
  }
  Cutscene.play([
    { say: ['LENNY', "PSST. NAME'S LENNY. YOU LOOK"] },
    { say: ['LENNY', 'LIKE PEOPLE WHO MISS JOKES.'] },
    { say: ['SAMUEL', 'DESPERATELY.'] },
    { say: ['LENNY', 'THEN ANSWER ME THIS. A SCENE'] },
    { say: ['LENNY', 'PARTNER SAYS THE SKY IS SOUP.'] },
    { say: ['LENNY', 'WHAT DO YOU SAY?'] },
    { choice: { who: 'SAMUEL', q: 'THE SKY IS SOUP. AND I SAY...',
      opts: ['NO, THAT IS WEATHER', 'YES, AND HERE IS A SPOON', 'CALL A DOCTOR'],
      cb: function (idx) {
        if (idx === 1) {
          setFlag('sc_password'); sfx('sparkle');
          say([['LENNY', 'YES, AND. THAT IS THE WHOLE'], ['LENNY', 'PHILOSOPHY. AND THE PASSWORD.'],
               ['LENNY', 'BACK ALLEY. STAGE DOOR. SAY IT'], ['LENNY', 'LIKE YOU MEAN IT, GENTLEMEN.'],
               ['NARRATOR', 'LEARNED THE PASSWORD: "YES, AND..."']]);
        } else {
          say([['LENNY', 'HM. THE SCENE DIED. YOU KILLED'], ['LENNY', 'IT. IN THIS ECONOMY.'], ['LENNY', 'THINK AGREEMENT. TRY ME AGAIN.']]);
        }
      } } }
  ], { onDone: function () { gotoWorld(); } });
}
function carolers() {
  say([['CAROLERS', 'GOD REST YE MERRY GENTLEMEN,'], ['CAROLERS', 'LET NOTHING YOU DISMAY...'],
       ['CAROLERS', 'THE ORDER APPROVED ONE VERSE.'], ['CAROLERS', 'WE HAVE SUNG IT FOR SIX HOURS.']]);
}
/* first steps inside the secret theater */
function scWelcome() {
  Cutscene.play([
    { narr: 'WARMTH. LAMPLIGHT. THE SMELL OF COFFEE AND COURAGE.' },
    { say: ['RADNER', 'THEY SAID YES-AND AT THE DOOR!'] },
    { say: ['RADNER', 'EVERYONE, BE COOL! BE COOL!'] },
    { narr: 'NOBODY IS COOL. THE ROOM CHEERS. SOMEBODY HUGS HERSCHEL.' },
    { say: ['HERSCHEL', 'UNHAND ME. ...IN A MINUTE.'] },
    { say: ['RADNER', 'WELCOME TO SECOND CITY, BOYS.'] },
    { say: ['RADNER', 'THE SHOW IS UPSTAGE RIGHT. THE'] },
    { say: ['RADNER', 'REVOLUTION IS DOWNSTAIRS.'] }
  ], { onDone: function () { gotoWorld(); } });
}
/* take a seat, give a suggestion, watch the pros work */
function watchShow() {
  Cutscene.play([
    { narr: 'YOU TAKE THE FRONT ROW. THE LIGHTS DIM.' },
    { say: ['BELUSHI', 'WE NEED ONE SUGGESTION TO'] },
    { say: ['BELUSHI', 'DESTROY. A WORD. ANYTHING.'] },
    { choice: { who: 'SAMUEL', q: 'ONE SUGGESTION, ANY SUGGESTION...',
      opts: ['A HAUNTED ZAMBONI', 'TAX SEASON', 'MY MUSTACHE'],
      cb: function (idx) {
        var scene;
        if (idx === 0) scene = [
          ['FLAHERTY', 'I AM THE ZAMBONI. I DIED AS I'],
          ['FLAHERTY', 'LIVED. SLOWLY. IN CIRCLES.'],
          ['BELUSHI', 'AND I AM THE ICE THAT'],
          ['BELUSHI', 'REMEMBERS EVERYTHING!'],
          ['NARRATOR', 'THE SCENE BUILDS FOR TEN GLORIOUS MINUTES AND ENDS IN A FUNERAL ON SKATES.']
        ];
        else if (idx === 1) scene = [
          ['FLAHERTY', 'SIR, YOU CANNOT DEDUCT A'],
          ['FLAHERTY', 'FEELING OF GENERAL DREAD.'],
          ['BELUSHI', 'IT IS MY BIGGEST EXPENSE!'],
          ['NARRATOR', 'THE AUDIT ESCALATES INTO A WEDDING. EVERYONE FILES JOINTLY.']
        ];
        else scene = [
          ['BELUSHI', 'BEHOLD MY MUSTACHE. IT KNOWS'],
          ['BELUSHI', 'THINGS. IT KEEPS SECRETS.'],
          ['FLAHERTY', 'MINE HAS BEEN CROOKED FOR'],
          ['FLAHERTY', 'YEARS AND NOBODY SAYS A WORD.'],
          ['NARRATOR', 'SOMEWHERE IN THE PARTY, SOMEONE FEELS EXTREMELY SEEN.']
        ];
        var steps = [];
        for (var i = 0; i < scene.length; i++) steps.push(scene[i][0] === 'NARRATOR' ? { narr: scene[i][1] } : { say: scene[i] });
        steps.push({ narr: 'THE CALLBACK LANDS. THE ROOM DETONATES. THIS IS THE HAROLD.' });
        steps.push({ do: function () { healParty(); sfx('heal');
          if (!hasFlag('sc_show_seen')) setFlag('sc_show_seen'); } });
        steps.push({ narr: 'LAUGHTER IS THE BEST MEDICINE. THE PARTY IS FULLY HEALED!' });
        steps.push({ say: ['BELUSHI', 'STICK AROUND. DEL IS BRIEFING'] });
        steps.push({ say: ['BELUSHI', 'DOWNSTAIRS. BRING A HELMET.'] });
        Cutscene.play(steps, { onDone: function () { gotoWorld(); } });
      } } }
  ], { onDone: function () { gotoWorld(); } });
}
/* Del Close: briefing first, then the improv class */
function delCloseTalk() {
  if (!hasFlag('sc_briefed')) {
    Cutscene.play([
      { say: ['DEL CLOSE', 'SO. THE TIME TRAVELERS.'] },
      { say: ['DEL CLOSE', 'GILDA VOUCHES FOR YOU. SIT.'] },
      { narr: 'DEL CLOSE. RESIDENT DIRECTOR. GENERAL OF THE LAUGHING ARMY.' },
      { say: ['DEL CLOSE', 'SNOBBINGTON PADLOCKED OUR HOME'] },
      { say: ['DEL CLOSE', 'IN CHICAGO. CALLED IMPROV'] },
      { say: ['DEL CLOSE', '"UNSCRIPTED INSOLENCE."'] },
      { say: ['DEL CLOSE', 'SO WE MOVED THE WHOLE CITY'] },
      { say: ['DEL CLOSE', 'HERE. BRICK BY BRICK. BIT BY'] },
      { say: ['DEL CLOSE', 'BIT. MOSTLY BIT.'] },
      { say: ['SAMUEL', 'WHY HIDE UNDER A DISCO?'] },
      { say: ['DEL CLOSE', 'BECAUSE THE ORDER LOVES DISCO.'] },
      { say: ['DEL CLOSE', 'ONE PLAYLIST. ZERO SURPRISES.'] },
      { say: ['DEL CLOSE', 'NOBODY AUDITS THE BASEMENT OF'] },
      { say: ['DEL CLOSE', 'A BUILDING THEY ALREADY OWN.'] },
      { say: ['DEL CLOSE', 'OUR AGENT ROSALIND IS UPSTAIRS'] },
      { say: ['DEL CLOSE', 'STUDYING THE MIRROR BALL. GO'] },
      { say: ['DEL CLOSE', 'GET HER. TAKE THE FREIGHT'] },
      { say: ['DEL CLOSE', 'ELEVATOR. THE KEY IS HIDDEN'] },
      { say: ['DEL CLOSE', 'WHERE NO GOON WOULD EVER LOOK:'] },
      { say: ['DEL CLOSE', 'THE PROP TRUNK. PROPS ARE FOR'] },
      { say: ['DEL CLOSE', 'COWARDS. GOONS KNOW THIS.'] },
      { do: function () { setFlag('sc_briefed'); } },
      { narr: 'NEW OBJECTIVE: THE KEY IS IN THE GREEN ROOM PROP TRUNK.' },
      { say: ['DEL CLOSE', 'AND WHEN YOU HAVE A MINUTE —'] },
      { say: ['DEL CLOSE', 'TAKE MY CLASS. I TEACH A WEAPON.'] }
    ], { onDone: function () { gotoWorld(); } });
    return;
  }
  /* the class: 60 shillings, pick the student */
  var opts = [], i;
  for (i = 0; i < Game.party.length; i++) opts.push(Game.party[i].name);
  opts.push('NOT TODAY');
  Cutscene.play([
    { say: ['DEL CLOSE', 'CLASS IS SIXTY SHILLINGS.'] },
    { say: ['DEL CLOSE', 'I TEACH THE HAROLD. LONG-FORM.'] },
    { say: ['DEL CLOSE', 'CALLBACKS. PATTERN. TRUTH.'] },
    { say: ['DEL CLOSE', 'THE CROWD CARRIES YOUR DAMAGE.'] },
    { choice: { who: 'SAMUEL', q: 'WHO ENROLLS?', opts: opts,
      cb: function (idx) {
        if (idx >= Game.party.length) { say([['DEL CLOSE', 'COWARDICE. ALSO A CHOICE.']]); return; }
        var f = Game.party[idx];
        if (f.moves.indexOf('harold') >= 0) { say([['DEL CLOSE', f.name + ' ALREADY GRADUATED.'], ['DEL CLOSE', 'I DO NOT DO REFRESHERS.']]); return; }
        if (Game.money < 60) { say([['DEL CLOSE', 'SIXTY SHILLINGS. YOU HAVE ' + Game.money + '.'], ['DEL CLOSE', 'COME BACK FUNNIER AND RICHER.']]); return; }
        Game.money -= 60; teachMove(f.id, 'harold'); jingle('level'); sfx('sparkle');
        say([['DEL CLOSE', 'BE A DOOR. NOW A REGRET. NOW A'], ['DEL CLOSE', 'CALLBACK TO THE DOOR. ...YES.'], ['DEL CLOSE', 'CLASS DISMISSED. USE IT WELL.'],
             ['NARRATOR', f.name + ' LEARNED THE HAROLD!'],
             ['NARRATOR', '(FOUR MOVES MAX — OLDEST ONE MAKES ROOM.)']]);
      } } }
  ], { onDone: function () { gotoWorld(); } });
}
function trunkInteract() {
  if (hasFlag('sc_elevator_key')) { say([['NARRATOR', 'THE TRUNK NOW HOLDS ONE (1)'], ['NARRATOR', 'RUBBER CHICKEN. EMERGENCY USE.']]); return; }
  if (!hasFlag('sc_briefed')) { say([['NARRATOR', 'A TRUNK STENCILED "PROPS."'], ['NARRATOR', 'IT FEELS RUDE TO RUMMAGE'], ['NARRATOR', 'BEFORE BEING BRIEFED.']]); return; }
  Cutscene.play([
    { narr: 'YOU OPEN THE PROP TRUNK. INSIDE: ONE RUBBER CHICKEN, ONE FAKE ARROW, AND...' },
    { sfx: 'sparkle' },
    { do: function () { setFlag('sc_elevator_key'); } },
    { narr: 'GOT THE FREIGHT ELEVATOR KEY!' },
    { narr: 'THE BASEMENT ELEVATOR NOW GOES UP: STRAIGHT INTO CLUB INFERNO.' }
  ], { onDone: function () { gotoWorld(); } });
}
/* upstairs at last: the agent in the disco */
function discoRosalind() {
  Cutscene.play([
    { bg: 'disco' }, { music: 'disco' },
    { narr: 'THE ELEVATOR OPENS ON LIGHT. NOISE. SEQUINS. THE DISCO.' },
    { say: ['ROSALIND', 'SAMUEL! OVER HERE! I REVERSE-'] },
    { say: ['ROSALIND', 'ENGINEERED THE DJ BOOTH. TWICE.'] },
    { say: ['ROSALIND', 'THE SECOND TIME WAS FOR FUN.'] },
    { say: ['SAMUEL', 'DEL SAID YOU FOUND SOMETHING.'] },
    { say: ['ROSALIND', 'SAMUEL. THIS DISCO BALL IS A'] },
    { say: ['ROSALIND', 'PERFECT TEMPORAL LENS!'] },
    { say: ['SAMUEL', 'CAN IT GET US HOME?'] },
    { say: ['ROSALIND', 'YES. I JUST NEED TO BORROW IT.'] },
    { say: ['ROSALIND', 'FOREVER.'] },
    { do: function () { addToParty('rosalind', 9); setFlag('rosalind_joined'); } },
    { narr: 'ROSALIND JOINS THE PARTY!' },
    { say: ['ROSALIND', 'THE BALL BELONGS TO A MAN CALLED'] },
    { say: ['ROSALIND', 'DISCO REX. HE SEEMS REASONABLE.'] },
    { say: ['SAMUEL', 'FAMOUS LAST WORDS, PROFESSOR.'] },
    { narr: 'OBJECTIVE: THROUGH THE BOILER ROOM, UP TO THE ROOF. FIND REX.' }
  ], { onDone: function () { gotoWorld(); } });
}
function nycGeraldBattle(o) {
  Cutscene.play([
    { say: ['GERALD', 'HALT. THE BOILER ROOM IS FOR'] },
    { say: ['GERALD', 'AUTHORIZED PERSONNEL AND VIBES.'] },
    { say: ['SAMUEL', 'OUR VIBES ARE EXTREMELY'] },
    { say: ['SAMUEL', 'AUTHORIZED.'] },
    { battle: function () { return { enemies: [{ enemy: 'gerald', level: 9 }], music: 'battle', canFlee: false }; },
      onResult: function (r) { if (r.win) { setFlag('nyc_gerald1'); } } },
    { say: ['GERALD', 'FINE. BUT I AM TELLING GERALD.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function playlistBattle(o) {
  Cutscene.play([
    { narr: 'THE AUTOMATIC PLAYLIST BOOTS UP.' },
    { say: ['EDITOR', 'THIS MACHINE HOLDS EVERY SONG'] },
    { say: ['EDITOR', 'YOU WILL EVER NEED. IN ORDER.'] },
    { say: ['SAMUEL', 'THAT IS THE SADDEST SENTENCE'] },
    { say: ['SAMUEL', 'I HAVE EVER HEARD.'] },
    { battle: function () { return { enemies: [{ enemy: 'editor', level: 10 }], music: 'battle', canFlee: false, bg: 'disco' }; },
      onResult: function (r) { if (r.win) { setFlag('nyc_playlist'); giveDrip('swiftcane'); } } },
    { narr: 'THE PLAYLIST POWERS DOWN. GOT A SWIFT CANE (DRIP)!' },
    { say: ['ROSALIND', 'FASCINATING WIRING. AWFUL TASTE.'] }
  ], { onDone: function () { gotoWorld(); } });
}
/* -- sidequest: relay messages across the loudest dance floor in history -- */
function coupleVinnie() {
  if (hasFlag('nyc_couple')) { say([['VINNIE', 'DONNA AND I ARE DANCING TONIGHT.'], ['VINNIE', 'THE APPROVED LIST HAS ONE MOVE.'], ['VINNIE', 'WE ARE DOING A DIFFERENT ONE.']]); return; }
  if (!hasFlag('couple_step1')) {
    Cutscene.play([
      { say: ['VINNIE', 'SEE DONNA BY THE SPEAKERS?'] },
      { say: ['VINNIE', 'I WROTE HER A LINE, BUT THE'] },
      { say: ['VINNIE', 'FLOOR IS TOO LOUD TO CROSS.'] },
      { say: ['VINNIE', 'TELL HER: YOUR EYES OUTSHINE'] },
      { say: ['VINNIE', 'THE MIRROR BALL.'] },
      { do: function () { setFlag('couple_step1'); } }
    ], { onDone: function () { gotoWorld(); } });
  } else if (!hasFlag('couple_step2')) {
    say([['VINNIE', 'DID YOU TELL HER? WHY IS SHE'], ['VINNIE', 'LAUGHING? IS IT A GOOD LAUGH?']]);
  } else {
    Cutscene.play([{ choice: { who: 'SAMUEL',
      q: "DONNA'S REPLY WAS... WHAT WAS IT?",
      opts: ['SHE LIKED YOUR HAT SINCE APRIL', 'SHE HAS LIKED YOU SINCE THE HUSTLE', 'SHE LICENSED A HUSTLE'],
      cb: function (idx) {
        if (idx === 1) { setFlag('nyc_couple'); giveDrip('heartlocket'); say([['VINNIE', 'SINCE THE HUSTLE? THAT WAS THREE'], ['VINNIE', 'YEARS AGO. EXCUSE ME. I HAVE'], ['VINNIE', 'SOME DANCING TO CATCH UP ON.'], ['NARRATOR', 'GOT A HEART LOCKET (DRIP)!']]); }
        else say([['VINNIE', '...THAT CANNOT BE RIGHT.'], ['VINNIE', 'ASK HER AGAIN. SHOUT POLITELY.']]);
      } } }]);
  }
}
function coupleDonna() {
  if (hasFlag('nyc_couple')) { say([['DONNA', 'VINNIE IS TEACHING ME A MOVE'], ['DONNA', 'THAT IS NOT ON THE LIST.']]); return; }
  if (!hasFlag('couple_step1')) { say([['DONNA', 'I COME FOR THE MUSIC. I STAY'], ['DONNA', "BECAUSE A BOY WON'T LOOK AT ME."]]); return; }
  if (!hasFlag('couple_step2')) {
    Cutscene.play([{ choice: { who: 'SAMUEL',
      q: 'VINNIE SAYS... UM... IT WAS LOUD.',
      opts: ['YOUR FRIES OUTSHINE THE BALL', 'YOUR EYES OUTSHINE THE MIRROR BALL', 'YOUR THIGHS FRIGHTEN THE BALL'],
      cb: function (idx) {
        if (idx === 1) { setFlag('couple_step2'); say([['DONNA', 'HE SAID THAT? ACROSS THIS NOISE?'], ['DONNA', 'TELL HIM: I HAVE LIKED HIM'], ['DONNA', 'SINCE THE HUSTLE.']]); }
        else say([['DONNA', '...I DO NOT THINK THAT IS IT.'], ['DONNA', 'THE FLOOR IS LOUD. TRY AGAIN.']]);
      } } }]);
  } else say([['DONNA', 'WELL? WHAT DID HE SAY BACK?']]);
}
function rexFight() {
  Cutscene.play([
    { bg: 'disco' }, { music: 'boss' },
    { say: ['REX', 'WELCOME TO MY ROOF, DADDIES.'] },
    { say: ['REX', 'THE RADIO SAYS DISCO IS DYING.'] },
    { say: ['REX', 'BUT UNDER THAT BALL, NOBODY'] },
    { say: ['REX', 'DIES. UNDER THAT BALL, I AM'] },
    { say: ['REX', 'ETERNAL.'] },
    { say: ['ROSALIND', 'AND I NEED IT! ...FOREVER.'] },
    { say: ['REX', 'THEN IT IS ON, LITTLE GENIUS.'] },
    { say: ['REX', 'AND KNOW THIS: EVERY LINE I'] },
    { say: ['REX', 'SPIT TONIGHT, I MEAN.'] },
    { battle: function () { return { enemies: [{ boss: 'rex' }], music: 'boss', canFlee: false, bg: 'disco' }; },
      onResult: function (r) { if (r.win) nycRewards(); } }
  ], { onDone: function () { if (hasFlag('rex_beaten')) nycVictory(); else gotoWorld(); } });
}
function nycRewards() {
  /* London unlocks only AFTER the Goblin Realm detour repairs the engine. */
  setFlag('rex_beaten'); setFlag('nyc_done'); gainPart('TIME CRYSTAL');
}
function nycVictory() {
  Cutscene.play([
    { say: ['ROSALIND', 'REX. A TEMPORAL LENS DOES NOT'] },
    { say: ['ROSALIND', 'JUST LOOK THROUGH TIME.'] },
    { say: ['ROSALIND', 'IT CAN RECORD IT.'] },
    { narr: 'ROSALIND ETCHES THE GOLDEN AGE OF CLUB INFERNO INTO EVERY FACET.' },
    { say: ['REX', 'EVERY NIGHT WE EVER DANCED...'] },
    { say: ['REX', 'IS IN THERE? FOREVER?'] },
    { say: ['ROSALIND', 'FOREVER. THAT WAS THE POINT.'] },
    { say: ['REX', 'TAKE IT. I AM NOT CRYING.'] },
    { say: ['REX', 'THE GLITTER IS IN MY EYES.'] },
    { narr: 'REX DONATES THE MIRROR BALL, WEEPING. MAGNIFICENT.' },
    { narr: 'HIS BOUNCERS THROW THE AUTOMATIC PLAYLIST IN A DUMPSTER.' },
    { narr: 'DOWNSTAIRS, SECOND CITY TURNS THE MARQUEE LIGHTS BACK ON.' },
    { narr: 'TIME CRYSTAL GET! ( 3 OF 4 )' },
    { say: ['BABBAGE', 'THE ENGINE CAN NOW REACH HOME.'] },
    { say: ['BABBAGE', 'PLOTTING A COURSE FOR LONDON...'] }
  ], { onDone: function () { saveGame(false); goblinMalfunction(); } });
}

/* ---------------- register NYC as a travel destination ---------------- */
registerEra({ id: 'nyc', label: 'NEW YORK 1977', unlockFlag: 'nyc_unlocked',
  warp: { to: 'wellsstreet', tx: 12, ty: 6, dir: 'up' }, arrive: nycArrive, arrivedFlag: 'nyc_arrived_seen' });
