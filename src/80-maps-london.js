/* 80-maps-london.js — Act 0 + hub maps: Daddy Manor, Baker's Row, Downton Theatre.
   (Finale variants of these maps are set up in the story module for Phase 4.) */

/* ---- object draw helpers ---- */
function drawMachine(x, y) {
  px(x + 1, y - 4, 14, 20, sBZ); px(x + 1, y - 4, 14, 1, sBZs);
  px(x + 3, y - 2, 10, 10, '#1a2138'); /* glass */
  var t = (performance.now() / 300) | 0;
  px(x + 5, y + (t % 2 ? 0 : 2), 6, 6, (t % 2) ? COL.neon2 : COL.neon);
  px(x + 2, y + 10, 12, 4, sBZs); px(x + 4, y + 11, 2, 2, COL.red); px(x + 10, y + 11, 2, 2, COL.gold);
}
function drawPhono(x, y) {
  px(x + 4, y + 8, 8, 6, COL.woodd); px(x + 7, y + 2, 2, 8, sBZs);
  fillEll(x + 2, y, x + 12, y + 6, sBZ); px(x + 6, y + 3, 3, 2, '#1a1018');
}
function drawCase(x, y) { px(x + 3, y + 5, 10, 8, COL.woodd); px(x + 4, y + 6, 8, 6, '#2a2030'); px(x + 6, y + 8, 4, 2, COL.gold); }
function drawMirror(x, y) { px(x + 3, y + 1, 10, 14, sBZ); px(x + 4, y + 2, 8, 12, '#b8c8d8'); px(x + 5, y + 3, 3, 5, COL.white); }
function drawTrunk(x, y) { px(x + 2, y + 5, 12, 9, COL.woodd); px(x + 2, y + 8, 12, 1, sBZs); px(x + 7, y + 9, 2, 2, sGD); }
function drawSign(x, y) { px(x + 5, y + 8, 2, 8, COL.woodd); px(x + 1, y + 1, 14, 8, COL.wood); px(x + 1, y + 1, 14, 1, COL.woodd); px(x + 3, y + 3, 10, 1, COL.woodd); px(x + 3, y + 5, 8, 1, COL.woodd); }
function drawCounter(x, y) { px(x, y + 6, TS, 10, COL.wood); px(x, y + 6, TS, 2, COL.woodd); px(x + 2, y + 10, 2, 4, COL.woodd); }
function drawTheatreDoor(x, y) { px(x, y, TS, TS, '#5a2038'); px(x + 3, y + 2, 10, 14, '#2a1020'); px(x + 7, y + 8, 2, 2, COL.gold); }
function drawSeat(x, y) { px(x + 2, y + 6, 12, 8, '#7a2038'); px(x + 2, y + 4, 12, 3, '#5a1828'); }
function drawTrophy(x, y) { px(x + 5, y + 4, 6, 6, COL.gold); px(x + 6, y + 10, 4, 3, COL.gold); px(x + 4, y + 13, 8, 2, COL.woodd); }

/* ---- shop inventories ---- */
var SHOP_LONDON = ['earlgrey', 'strongtea', 'lozenge', 'sparestache', 'drip:dapperhat', 'drip:goldchain'];

/* HOME is a travel destination (registered once the engine can travel) */
registerEra({ id: 'home', label: 'LONDON 1889 - HOME', warp: { to: 'manor', tx: 7, ty: 9, dir: 'up' } });

/* ================= DADDY MANOR ================= */
registerMap('manor', {
  banner: 'DADDY MANOR', music: 'manor',
  grid: [
    '###############',
    '#.HH.....O....#',
    '#.....rrr.....#',
    '#.....rrr.....#',
    '#.....===.....#',
    '#.BB..........#',
    '#.BB..........#',
    '#.............#',
    '#.............#',
    '#.............#',
    '#.............#',
    '######..#######'
  ],
  warps: [
    { x: 6, y: 11, to: 'bakersrow', tx: 9, ty: 2, dir: 'down' },
    { x: 7, y: 11, to: 'bakersrow', tx: 9, ty: 2, dir: 'down' }
  ],
  _londonManor: true,
  objs: [
    { x: 7, y: 1, solid: true, draw: drawMachine, onInteract: function () { timeMachineInteract(); } },
    { x: 2, y: 8, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 4, y: 1, solid: true, draw: drawCase, onInteract: function () {
        if (hasFlag('finale_done')) say([['SAMUEL', 'THE CASE IS EMPTY NOW.'], ['SAMUEL', "I DON'T NEED IT ANYMORE."]]);
        else say([['NARRATOR', "SAMUEL'S MUSTACHE CASE. IT READS:"], ['NARRATOR', '"PRIVATE."']]); } },
    { x: 9, y: 1, solid: true, draw: drawMirror, onInteract: function () { say([['NARRATOR', "WILLIAM'S ENORMOUS MIRROR."], ['NARRATOR', 'IT IS ALWAYS POLITE TO WAVE BACK.']]); } },
    { x: 2, y: 5, solid: true, draw: function () {}, onInteract: function () { say([['NARRATOR', "ROSALIND'S BOOKSHELF. HALF THE"], ['NARRATOR', 'BOOKS ARE JUST WIRING DIAGRAMS.']]); } },
    { x: 10, y: 1, solid: true, draw: drawTrunk, onInteract: function () { say([['NARRATOR', "HERSCHEL'S ARMY TRUNK. A MEDAL"], ['NARRATOR', 'FOR BRAVERY IN THE KITCHEN.'], ['NARRATOR', 'THE STEW WAS HOSTILE.']]); } },
    { x: 11, y: 6, solid: true, draw: drawTrophy, onInteract: function () {
        if (hasFlag('game_complete')) say([['NARRATOR', 'THE TROPHY SHELF: FOUR ERA MEMENTOS,'], ['NARRATOR', 'AND ONE VERY CROOKED MUSTACHE.']]);
        else say([['NARRATOR', 'AN EMPTY TROPHY SHELF, WAITING.'], ['SAMUEL', 'WE\'LL FILL IT. // JOKE SLOT']]); } },
    { x: 13, y: 1, solid: true, draw: function (x, y) { px(x + 2, y + 4, 12, 9, COL.woodd); px(x + 3, y + 5, 10, 5, '#b8c8d8'); }, onInteract: function () {
        say([['NARRATOR', 'A FRAMED PHOTO OF THE WHOLE TEAM.'], ['NARRATOR', 'EVERYONE IS MID-LAUGH. // JOKE SLOT']]); } },
    /* JOKE SLOT: manor examine object for a personalized inside joke */
    { x: 12, y: 8, solid: true, draw: function (x, y) { px(x + 4, y + 6, 8, 8, COL.teal); px(x + 6, y + 4, 4, 4, COL.tealtip); }, onInteract: function () { say([['NARRATOR', 'A HALF-BUILT INVENTION HUMS.'], ['ROSALIND', 'DO NOT TOUCH THAT. // JOKE SLOT']]); } },
    { x: 11, y: 2, solid: true, spr: 'babbage', dir: 'down', flag: 'babbage_moved',
      onInteract: function () { manorBabbage(); } }
  ],
  onEnter: function () { if (!hasFlag('act0_intro')) { openingCutscene(); } }
});

/* ================= BAKER'S ROW ================= */
registerMap('bakersrow', {
  banner: "BAKER'S ROW", music: 'town', encPool: 'london',
  grid: [
    '###################',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '#ppppppppppppppppp#',
    '#gggggggppgggggggg#',
    '#ggggTggppgggttggg#',
    '#gggggggppgggttggg#',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '###################'
  ],
  warps: [
    { x: 9, y: 1, to: 'manor', tx: 7, ty: 10, dir: 'up' },
    { x: 1, y: 4, to: 'theatre', tx: 7, ty: 11, dir: 'up' }
  ],
  objs: [
    { x: 9, y: 0, solid: true, draw: function (x, y) { px(x, y + 2, TS, 14, COL.wall); px(x, y + 2, TS, 2, COL.walld); px(x + 3, y + 6, 10, 10, '#2a1020'); px(x + 7, y + 10, 2, 3, COL.gold); }, onInteract: function () { say([['NARRATOR', 'DADDY MANOR. HOME SWEET HOME.']]); } },
    { x: 0, y: 4, solid: true, draw: drawTheatreDoor, onInteract: function () { say([['NARRATOR', 'THE DOWNTON THEATRE.']]); } },
    { x: 12, y: 8, solid: true, spr: 'babbage', dir: 'up', onInteract: function () { bakersShop(); } },
    { x: 12, y: 9, solid: true, draw: drawCounter, onInteract: function () { bakersShop(); } },
    { x: 14, y: 2, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'SIGN: "OPEN MIC TONIGHT.'], ['NARRATOR', 'ALL DADDIES WELCOME."']]); } },
    { x: 5, y: 8, solid: true, spr: 'villager', dir: 'up', onInteract: function () { say([['LONDONER', 'THE DADDIES ARE THE PRIDE OF'], ['LONDONER', "BAKER'S ROW! // JOKE SLOT"]]); } },
    { x: 13, y: 3, solid: true, spr: 'villager2', dir: 'down', onInteract: function () { say([['NEWSBOY', 'EXTRA! EXTRA! TIME ENGINE'], ['NEWSBOY', 'EXPLODES! DADDIES MISSING!'], ['NEWSBOY', '...SLOW NEWS WEEK, HONESTLY.']]); } },
    { x: 16, y: 9, mustache: true, flag: 'stache_london', onInteract: function (o) { collectMustache(o, 'stache_london'); } }
  ]
});

/* ================= DOWNTON THEATRE ================= */
registerMap('theatre', {
  banner: 'DOWNTON THEATRE', music: 'manor',
  grid: [
    '###############',
    '#mmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmm#',
    '#mmmmm===mmmmm#',
    '#mmmmmmmmmmmmm#',
    '#.....###.....#',
    '#.###.###.###.#',
    '#.###.....###.#',
    '#.###.###.###.#',
    '#.....###.....#',
    '#.............#',
    '#.............#',
    '######..#######'
  ],
  warps: [
    { x: 6, y: 12, to: 'bakersrow', tx: 2, ty: 4, dir: 'down' },
    { x: 7, y: 12, to: 'bakersrow', tx: 2, ty: 4, dir: 'down' }
  ],
  objs: [
    { x: 7, y: 3, solid: true, draw: function (x, y) { px(x + 6, y - 4, 3, 12, COL.black); px(x + 3, y - 8, 9, 5, COL.black); }, onInteract: function () { say([['NARRATOR', 'THE OPEN MIC. THIS IS WHERE'], ['NARRATOR', 'THE DADDIES WERE BORN.']]); } }
  ],
  onEnter: function () { if (!hasFlag('act0_tutorial')) tutorialCutscene(); }
});
