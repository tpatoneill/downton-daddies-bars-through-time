/* 81-maps-rome.js — ROME, 74 AD, overhauled: "THE DAY OF THE GAMES".
   Forum (festival) -> Colosseum Grounds (facade + crowds) -> the maze:
   Arcades -> Hypogeum (Herschel + kitchens + capstan puzzle) -> Stands
   -> Gate of Life (Porta Sanavivaria) -> Arena (Maximvs).
   Objectives: (1) find Herschel — his KITCHEN PASS opens the arena gate;
   (2) find the arena entrance through the maze. */

var SHOP_ROME = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:laurelband'];

/* ---------------- new tiles (Colosseum set) ---------------- */
/* A = travertine facade arch (solid) — stacked-arch look with dark opening */
TILES['A'] = { solid: true, draw: function (x, y) {
  px(x, y, TS, TS, '#d8d0c0'); px(x, y, TS, 1, '#b0a898'); px(x, y + 15, TS, 1, '#b0a898');
  px(x + 3, y + 4, 10, 12, '#3a3226');                       /* arch opening */
  px(x + 4, y + 2, 8, 3, '#3a3226'); px(x + 5, y + 1, 6, 2, '#3a3226');
  px(x + 2, y + 4, 1, 12, '#b0a898'); px(x + 13, y + 4, 1, 12, '#b0a898');
} };
/* c = packed crowd in the stands (solid, heads bob on the anim frame) */
TILES['c'] = { solid: true, draw: function (x, y, f) {
  px(x, y, TS, TS, '#6a5a48');
  var cols = ['#f4c898', '#ce9c6a', '#8a5a34', '#f4c898'];
  for (var i = 0; i < 4; i++) {
    var hx = x + 1 + i * 4, hy = y + 3 + ((i + (f ? 1 : 0)) % 2) * 2;
    px(hx, hy, 3, 3, cols[i]);                                /* bobbing heads */
    px(hx, hy + 3, 3, 4, ['#c63a46', '#349c8e', '#e2b23e', '#8b5cf6'][i]); /* tunics */
  }
} };
/* u = hypogeum floor (dark earth), v = hypogeum wall, q = rubble (encounters) */
TILES['u'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#3a3228');
  px(x + 3, y + 5, 2, 1, '#2a241c'); px(x + 10, y + 11, 2, 1, '#2a241c'); px(x + 7, y + 2, 1, 1, '#4a4234'); } };
TILES['v'] = { solid: true, draw: function (x, y) { px(x, y, TS, TS, '#241f18');
  px(x, y, TS, 1, '#3a3228'); px(x, y + 8, TS, 1, '#161210'); px(x + 5, y, 1, 8, '#161210'); px(x + 11, y + 8, 1, 8, '#161210'); } };
TILES['q'] = { solid: false, enc: true, draw: function (x, y, f) { px(x, y, TS, TS, '#3a3228');
  var o = f ? 1 : 0; px(x + 2, y + 3 + o, 4, 3, '#57493a'); px(x + 9, y + 8 - o, 5, 3, '#4a3f30'); px(x + 5, y + 11, 3, 2, '#57493a'); } };
/* G = beast cage (solid) */
TILES['G'] = { solid: true, draw: function (x, y, f) {
  px(x, y, TS, TS, '#241f18'); px(x + 1, y + 6, 14, 9, '#1a1510');
  if (f) { px(x + 4, y + 9, 6, 4, '#8a6a3a'); px(x + 9, y + 8, 3, 3, '#8a6a3a'); } /* something stirs */
  for (var i = 0; i < 5; i++) px(x + 1 + i * 3, y + 2, 2, 13, '#6a6255');          /* bars */
  px(x, y + 1, TS, 2, '#57493a');
} };
/* L = wooden beast-lift platform (walkable) */
TILES['L'] = { solid: false, draw: function (x, y) { px(x, y, TS, TS, '#5e4a2e');
  px(x, y + 5, TS, 1, '#3f3220'); px(x, y + 11, TS, 1, '#3f3220'); px(x + 2, y, 1, TS, '#3f3220'); px(x + 12, y, 1, TS, '#3f3220'); } };

/* ---------------- draw helpers ---------------- */
function drawRift(x, y) {
  var t = (performance.now() / 120) | 0;
  for (var r = 0; r < 4; r++) { var c = [COL.purple, COL.neon, COL.neon2, COL.gold][(r + t) % 4]; px(x + 2 + r, y + 2 + r, 12 - r * 2, 12 - r * 2, c); }
  px(x + 6, y + 6, 4, 4, COL.white);
}
function drawStew(x, y) { px(x + 2, y + 6, 12, 8, '#5a3c22'); px(x + 3, y + 5, 10, 3, '#7a4c2a');
  var t = (performance.now() / 200) | 0; px(x + 4 + (t % 3), y + 6, 3, 2, '#8a6c3a'); px(x + 9, y + 7, 2, 2, '#9a7c4a'); }
function drawBannerObj(x, y) { var f = ((performance.now() / 260) | 0) % 2;
  px(x + 7, y, 2, 16, '#8a6a3a');                              /* pole */
  px(x + 2 + (f ? 1 : 0), y + 1, 6, 9, '#c63a46'); px(x + 2 + (f ? 1 : 0), y + 1, 6, 2, '#e2b23e');
  px(x + 2 + (f ? 1 : 0), y + 9, 3, 2, '#c63a46'); }
function drawTorch(x, y) { var f = ((performance.now() / 140) | 0) % 2;
  px(x + 7, y + 6, 2, 9, '#5a4a2e');
  px(x + 5, y + 2 + (f ? 1 : 0), 6, 5, f ? '#e2b23e' : '#e07030'); px(x + 6, y + 1 + (f ? 1 : 0), 4, 2, '#f6e07a'); }
function drawPoster(x, y) { px(x + 1, y + 1, 14, 14, '#d8d0c0'); px(x + 1, y + 1, 14, 1, '#8a6a3a'); px(x + 1, y + 14, 14, 1, '#8a6a3a');
  px(x + 3, y + 3, 10, 5, '#e2b23e'); px(x + 5, y + 4, 6, 3, '#3a3226'); px(x + 3, y + 9, 10, 1, '#c63a46'); px(x + 3, y + 11, 8, 1, '#c63a46'); }
function drawStatue(x, y) { px(x + 5, y + 12, 6, 3, '#b0a898'); px(x + 6, y + 4, 4, 8, '#d8d0c0');
  px(x + 6, y + 2, 4, 3, '#d8d0c0'); px(x + 4, y + 6, 2, 4, '#d8d0c0'); px(x + 10, y + 5, 2, 3, '#d8d0c0'); }
function drawLever(x, y) { var on = hasFlag('rome_capstan');
  px(x + 2, y + 10, 12, 5, '#57493a'); px(x + 4, y + 11, 8, 3, '#8a6a3a');   /* capstan drum */
  if (on) { px(x + 10, y + 4, 2, 7, '#c49446'); px(x + 9, y + 3, 4, 2, '#c63a46'); }
  else { px(x + 4, y + 4, 2, 7, '#c49446'); px(x + 3, y + 3, 4, 2, '#c63a46'); } }
function drawAmphora(x, y) { px(x + 6, y + 3, 4, 2, '#8a5a34'); px(x + 5, y + 5, 6, 7, '#a86e3e');
  px(x + 6, y + 12, 4, 2, '#8a5a34'); px(x + 6, y + 6, 1, 4, '#c08a52'); }
function drawGateDoor(x, y) { px(x, y, TS, TS, '#57493a'); px(x + 2, y + 2, 12, 14, '#241f18');
  px(x + 3, y + 3, 10, 1, '#c49446'); px(x + 7, y + 8, 2, 3, '#c49446'); }

/* battle backdrops for the new zones */
BGS.hypogeum = function () {
  cls('#241f18');
  px(0, 104, 240, 56, '#1a1510');
  for (var i = 0; i < 4; i++) { var tx = 24 + i * 60;                          /* torches */
    px(tx, 34, 3, 14, '#5a4a2e'); px(tx - 2, 26, 7, 8, '#e07030'); px(tx - 1, 24, 5, 4, '#f6e07a'); }
  for (var c = 0; c < 3; c++) { var cx0 = 30 + c * 70;                          /* cages */
    px(cx0, 64, 40, 36, '#1a1510'); for (var b = 0; b < 6; b++) px(cx0 + b * 7, 62, 3, 40, '#6a6255'); }
};
BGS.stands = function () {
  cls(COL.sky);
  for (var r = 0; r < 4; r++) { px(0, r * 22, 240, 22, r % 2 ? '#6a5a48' : '#75634e');
    for (var i = 0; i < 15; i++) { px(6 + i * 16, r * 22 + 6, 4, 4, ['#f4c898', '#ce9c6a', '#8a5a34'][(i + r) % 3]);
      px(6 + i * 16, r * 22 + 10, 4, 5, ['#c63a46', '#349c8e', '#e2b23e', '#8b5cf6'][(i + r) % 4]); } }
  px(0, 104, 240, 56, COL.sand);
};

/* ---------------- FORUM (festival day) ---------------- */
registerMap('forum', {
  banner: 'THE FORUM - ROME', music: 'rome', riftBg: 'rome',
  grid: [
    '#################',
    '#mmmmmmmmmmmmmmm#',
    '#mXmmmmmmmmmmmXm#',
    '#mmmmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmmmp#',
    '#mmmmmmmmmmmmmmp#',
    '#mXmmmmmmmmmmmXm#',
    '#mmmmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmmmm#',
    '#################'
  ],
  warps: [ { x: 15, y: 5, to: 'grounds', tx: 2, ty: 5, dir: 'right' },
           { x: 15, y: 6, to: 'grounds', tx: 2, ty: 6, dir: 'right' } ],
  objs: [
    { x: 8, y: 1, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 4, y: 1, solid: true, draw: drawBannerObj, onInteract: function () { say([['NARRATOR', 'FESTIVAL BANNERS, EVERYWHERE.'], ['NARRATOR', 'TODAY IS THE DAY OF THE GAMES.']]); } },
    { x: 12, y: 1, solid: true, draw: drawBannerObj, onInteract: function () { say([['NARRATOR', 'THE CLOTH SNAPS IN THE WIND.'], ['NARRATOR', 'THE CITY HOLDS ITS BREATH.']]); } },
    { x: 6, y: 2, solid: true, draw: drawPoster, onInteract: function () { say([['NARRATOR', 'POSTER: "MAXIMVS! XI YEARS'], ['NARRATOR', 'UNDEFEATED! TODAY AT NOON!"'], ['NARRATOR', 'SOMEONE DREW A MUSTACHE ON HIM.']]); } },
    { x: 4, y: 3, solid: true, spr: 'roman', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_ROME, World, 'ROMAN MERCHANT')); } },
    { x: 12, y: 3, solid: true, spr: 'roman', dir: 'down', onInteract: function () { senatorQuest(); } },
    { x: 10, y: 5, solid: true, spr: 'villager', dir: 'right', onInteract: function () { say([['CITIZEN', 'THE QUEUE STARTS BEHIND ME.'], ['CITIZEN', 'I HAVE BEEN HERE SINCE TUESDAY.']]); } },
    { x: 12, y: 6, solid: true, spr: 'villager2', dir: 'right', onInteract: function () { say([['CITIZEN', 'MAXIMVS ONCE RHYMED "GLADIATOR"'], ['CITIZEN', 'WITH "GLAD-HE-ATE-HER". GENIUS.']]); } },
    { x: 6, y: 7, solid: true, spr: 'villager', dir: 'up', onInteract: function () { say([['SMALL CHILD', 'MISTER! ARE YOU A GLADIATOR?'], ['SAMUEL', 'WORSE. A FREESTYLER.'], ['SMALL CHILD', 'WHOA.']]); } },
    { x: 8, y: 8, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', "THE ORDER SPONSORS TODAY'S GAMES."], ['GERALD', 'EVERY VERSE PRE-APPROVED. EVEN HIS.'], ['GERALD', '(MY NAME IS ALSO GERALD.)']]); } },
    { x: 14, y: 9, mustache: true, flag: 'stache_rome', onInteract: function (o) { collectMustache(o, 'stache_rome'); } }
  ],
  onEnter: function () { if (!hasFlag('rome_arrived_seen')) { setFlag('rome_arrived_seen'); romeArrive(); } else if (hasFlag('rome_done')) { musicStart('rome'); } }
});

/* ---------------- COLOSSEUM GROUNDS (exterior) ---------------- */
registerMap('grounds', {
  banner: 'COLOSSEUM GROUNDS', music: 'rome', encPool: 'rome', battleBg: 'rome',
  grid: [
    '#AAAAAAAAAAAAAAAA#',
    '#gggggggggggggggg#',
    '#gtttggggggggtttg#',
    '#gtttggggggggtttg#',
    '#gggggggggggggggg#',
    'ppppppppppppppppp#',
    'ppppppppppppppppp#',
    '#gggggggggggggggg#',
    '#gtttggggggggtttg#',
    '#gggggggggggggggg#',
    '##################'
  ],
  warps: [ { x: 0, y: 5, to: 'forum', tx: 14, ty: 5, dir: 'left' },
           { x: 0, y: 6, to: 'forum', tx: 14, ty: 6, dir: 'left' },
           { x: 16, y: 1, to: 'arcades', tx: 7, ty: 2, dir: 'up' } ],
  objs: [
    /* the great facade: statues + gates along the arch row */
    { x: 4, y: 0, solid: true, draw: drawStatue, onInteract: function () { say([['NARRATOR', 'A STATUE OF SOME EMPEROR.'], ['NARRATOR', 'THE PIGEONS ARE UNIMPRESSED.']]); } },
    { x: 12, y: 0, solid: true, draw: drawStatue, onInteract: function () { say([['NARRATOR', 'A STATUE OF MAXIMVS, MID-BAR.'], ['NARRATOR', 'IT IS BRAND NEW. IT IS ENORMOUS.']]); } },
    { x: 8, y: 0, solid: true, draw: drawGateDoor, onInteract: function () { say([['LEGIONARY', 'MAIN GATE IS FIGHTERS AND STAFF'], ['LEGIONARY', "ONLY. SERVANTS' DOOR IS EAST."], ['LEGIONARY', 'AND NO, YOUR HAT IS NOT STAFF.']]); } },
    { x: 16, y: 0, solid: true, draw: drawGateDoor, onInteract: function () { say([['NARRATOR', "THE SERVANTS' ENTRANCE."], ['NARRATOR', 'IT SMELLS LIKE STEW AND DESTINY.']]); } },
    /* fight-day activities */
    { x: 3, y: 4, solid: true, spr: 'villager2', dir: 'right', onInteract: function () { say([['DICE PLAYER', 'TRIPLE VENUS! PAY UP, GAIVS!'], ['GAIVS', 'THE DICE ARE CARVED FROM LIES.']]); } },
    { x: 5, y: 7, solid: true, spr: 'roman', dir: 'up', onInteract: function () { say([['SCALPER', 'PSST. TICKETS TO THE GAMES.'], ['SAMUEL', 'THE GAMES ARE FREE.'], ['SCALPER', '...THESE ARE PREMIUM FREE.']]); } },
    { x: 13, y: 7, solid: true, spr: 'villager', dir: 'left', onInteract: function () { say([['JUGGLER', 'I JUGGLE FOR THE QUEUE!'], ['JUGGLER', 'YESTERDAY I DROPPED ONE ONTO'], ['JUGGLER', 'A SENATOR. BIG LAUGHS. BIG FINE.']]); } },
    { x: 9, y: 4, solid: true, draw: drawBannerObj, onInteract: function () { say([['NARRATOR', 'BANNER: "THE CHAMPION DEFENDS'], ['NARRATOR', 'HIS TITLE. ALL COMERS WELCOME."']]); } },
    /* patrolling locals */
    mkTrainer(6, 2, { spr: 'roman', dir: 'down', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_rome_a', enemy: 'orator', level: 4, reward: 20, bg: 'rome', tname: 'STREET ORATOR', hail: 'A CROWD! PERFECT FOR MY SPEECH!', beaten: 'I SHALL WORKSHOP THAT ONE.' }),
    mkTrainer(11, 8, { spr: 'legionary', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_rome_b', enemy: 'legionary', level: 4, reward: 20, bg: 'rome', tname: 'LEGIONARY', hail: 'CROWD CONTROL! YOU. BATTLE. NOW.', beaten: 'PROCEED. IN AN ORDERLY FASHION.' })
  ],
  onEnter: function () { if (!hasFlag('grounds_seen')) { setFlag('grounds_seen');
    say([['NARRATOR', 'THE COLOSSEUM. FIGHT DAY.'], ['NARRATOR', 'HALF THE EMPIRE IS IN THIS QUEUE.'], ['SAMUEL', 'HERSCHEL IS SOMEWHERE INSIDE.']]); } }
});

/* ---------------- THE ARCADES (ring corridor) ---------------- */
registerMap('arcades', {
  banner: 'THE ARCADES', music: 'rome', encPool: 'rome', battleBg: 'rome',
  grid: [
    '###############',
    '#mmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmm#',
    '#mXmXmXmXmXmXm#',
    '#mmmmmmmmmmmmm#',
    '#mXmXmmmmmXmXm#',
    '#mmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmm#',
    '###############'
  ],
  warps: [ { x: 7, y: 1, to: 'grounds', tx: 16, ty: 2, dir: 'down' },
           { x: 13, y: 7, to: 'hypogeum', tx: 2, ty: 2, dir: 'down' } ],
  objs: [
    { x: 1, y: 1, solid: true, draw: drawTorch, onInteract: function () {} },
    { x: 13, y: 1, solid: true, draw: drawTorch, onInteract: function () {} },
    { x: 1, y: 7, solid: true, draw: function (x, y) { px(x, y, TS, TS, '#57493a'); px(x + 3, y + 2, 10, 12, '#241f18'); },
      onInteract: function () { say([['NARRATOR', 'STAIRS TO THE STANDS — PACKED'], ['NARRATOR', 'SOLID WITH FANS. NO WAY THROUGH.'], ['NARRATOR', 'MAYBE THERE IS A WAY BELOW.']]); } },
    { x: 6, y: 4, solid: true, spr: 'gerald', dir: 'down', flag: 'rome_gerald1',
      onInteract: function (o) { romeGeraldBattle(o); } },
    { x: 12, y: 6, solid: true, draw: function (x, y) { px(x + 2, y + 4, 12, 10, '#57493a'); px(x + 4, y + 2, 8, 4, '#6a5a48'); },
      onInteract: function () { say([['NARRATOR', 'STAIRS DOWN. COLD AIR RISES.'], ['NARRATOR', 'SOMETHING GROWLS, FAR BELOW.']]); } },
    mkTrainer(3, 2, { spr: 'legionary', dir: 'right', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_rome_c', enemy: 'legionary', level: 5, reward: 24, bg: 'rome', tname: 'LEGIONARY', hail: 'HALT! CORRIDOR INSPECTION!', beaten: 'INSPECTION... PASSED. SOMEHOW.' }),
    mkTrainer(9, 6, { spr: 'trainee', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_rome_d', enemy: 'trainee', level: 5, reward: 24, bg: 'rome', tname: 'GLADIATOR TRAINEE', hail: 'MY FIRST REAL BATTLE! BE GENTLE!', beaten: 'I LEARNED SO MUCH JUST NOW.' })
  ]
});

/* ---------------- THE HYPOGEUM (underground) ---------------- */
registerMap('hypogeum', {
  banner: 'THE HYPOGEUM', music: 'manor', encPool: 'hypogeum', battleBg: 'hypogeum',
  grid: [
    'vvvvvvvvvvvvvvvvv',
    'vuuuuuvGGvuuuuuuv',
    'vuuquuvuuuuuqquuv',
    'vuvvvuvuvvvvvvuuv',
    'vuuuuuvuuuuuvuuuv',
    'vvvuqvvvGGuvvuqvv',
    'vuuuuuuuuuuuuuuuv',
    'vuvvvuvvvvvuvvvuv',
    'vuuquuuLLLuuuquuv',
    'vvvvvvvLLLvvvvvvv',
    'vvvvvvvvvvvvvvvvv'
  ],
  warps: [ { x: 1, y: 1, to: 'arcades', tx: 12, ty: 7, dir: 'up' },
           { x: 8, y: 9, to: 'stands', tx: 2, ty: 6, dir: 'up', gate: 'rome_capstan',
             blocked: function () { say([['NARRATOR', 'THE BEAST LIFT IS LOCKED IN PLACE.'], ['NARRATOR', 'THE CAPSTAN NEARBY MIGHT RAISE IT.']]); } } ],
  objs: [
    { x: 3, y: 1, solid: true, draw: drawTorch, onInteract: function () {} },
    { x: 12, y: 1, solid: true, draw: drawTorch, onInteract: function () {} },
    { x: 10, y: 1, solid: true, spr: 'beasthandler', dir: 'left', onInteract: function () {
        say([['BEAST HANDLER', 'SHHH. THE LION IS ASLEEP.'], ['BEAST HANDLER', 'SHE SNORES IN LATIN. LISTEN.'], ['NARRATOR', '"...ZZZQVE... ZZZQVE..."']]); } },
    /* Herschel — objective 1. Found running the kitchens, of course. */
    { x: 14, y: 1, solid: true, spr: 'herschel', dir: 'down', flag: 'herschel_joined',
      onInteract: function () { herschelJoin(); } },
    { x: 15, y: 2, solid: true, draw: drawStew, flag: 'rome_medal',
      onInteract: function (o) { stewBattle(o); } },
    { x: 15, y: 4, solid: true, draw: drawAmphora, flag: 'rome_amphora',
      onInteract: function () { setFlag('rome_amphora'); giveDrip('goldchain'); sfx('item');
        say([['NARRATOR', 'INSIDE THE AMPHORA: A GOLD CHAIN!'], ['NARRATOR', '(GLADIATOR DRIP. EQUIP IN PARTY.)']]); } },
    /* the capstan — needs Herschel's hips */
    { x: 6, y: 8, solid: true, draw: drawLever, onInteract: function () { capstanInteract(); } },
    /* trapdoor side room prize */
    { x: 3, y: 8, mustache: true, flag: 'stache_rome2', onInteract: function (o) { collectMustache(o, 'stache_rome2'); } },
    mkTrainer(3, 6, { spr: 'beasthandler', dir: 'right', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_rome_e', enemy: 'beasthandler', level: 5, reward: 26, bg: 'hypogeum', tname: 'BEAST HANDLER', hail: 'YOU SPOOKED MY LION. APOLOGIZE!', beaten: 'SHE LIKES YOU NOW. LUCKY.' }),
    mkTrainer(13, 6, { spr: 'trainee', dir: 'left', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_rome_f', enemy: 'trainee', level: 6, reward: 26, bg: 'hypogeum', tname: 'GLADIATOR TRAINEE', hail: 'NOBODY PASSES! COACH SAID SO!', beaten: 'COACH IS GOING TO HEAR OF THIS.' })
  ],
  onEnter: function () { if (!hasFlag('hypo_seen')) { setFlag('hypo_seen');
    say([['NARRATOR', 'THE HYPOGEUM: TUNNELS AND CAGES'], ['NARRATOR', 'BENEATH THE ARENA FLOOR.'], ['SAMUEL', 'STEW. I SMELL STEW. HERSCHEL!']]); } }
});

/* ---------------- THE STANDS (cavea) ---------------- */
registerMap('stands', {
  banner: 'THE STANDS', music: 'rome', battleBg: 'stands',
  grid: [
    '#################',
    '#ccccccccccccccc#',
    '#mmmmmmmmmmmmmmm#',
    '#ccccccmcccccccc#',
    '#mmmmmmmmmmmmmmm#',
    '#ccmccccccccmccc#',
    '#mmmmmmmmmmmmmmm#',
    '#ccccccccccccccc#',
    '#################'
  ],
  warps: [ { x: 1, y: 6, to: 'hypogeum', tx: 8, ty: 8, dir: 'down' },
           { x: 15, y: 6, to: 'gateoflife', tx: 4, ty: 4, dir: 'right' } ],
  objs: [
    { x: 8, y: 1, solid: true, spr: 'roman', dir: 'down', onInteract: function () { say([['SNOOZING SENATOR', 'ZZZ... I OBJECT... ZZZ...'], ['NARRATOR', 'HE HAS THE BEST SEAT. HE IS ASLEEP.']]); } },
    { x: 4, y: 3, solid: true, draw: function (x, y) { px(x + 2, y + 2, 12, 12, '#e2b23e'); px(x + 4, y + 4, 8, 8, '#c63a46'); },
      onInteract: function () { say([['NARRATOR', 'THE VIEW: THE ARENA BELOW,'], ['NARRATOR', 'FIFTY THOUSAND ROARING FANS,'], ['NARRATOR', 'AND ONE VERY LONELY CHAMPION.']]); } },
    { x: 13, y: 2, mustache: true, flag: 'stache_rome3', onInteract: function (o) { collectMustache(o, 'stache_rome3'); } },
    mkTrainer(3, 2, { spr: 'bookmaker', dir: 'right', patrol: { ax: 'h', span: 2 }, sight: 3, defeat: 'tr_rome_g', enemy: 'bookmaker', level: 6, reward: 40, bg: 'stands', tname: 'BOOKMAKER', hail: 'ODDS SAY YOU LOSE. CARE TO BET?', beaten: 'THE HOUSE... LOSES?! UNPRECEDENTED.' }),
    mkTrainer(10, 4, { spr: 'superfan', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_rome_h', enemy: 'superfan', level: 6, reward: 28, bg: 'stands', tname: 'MAXIMVS SUPERFAN', hail: 'NOBODY SEES MAXIMVS BEFORE ME!', beaten: 'YOU FIGHT LIKE HIM. RESPECT.' }),
    mkTrainer(14, 2, { spr: 'critic', dir: 'left', patrol: { ax: 'h', span: 1 }, sight: 4, defeat: 'tr_rome_i', enemy: 'critic', level: 7, reward: 34, bg: 'stands', tname: 'THEATER CRITIC', hail: 'AH, AMATEURS. I SHALL TAKE NOTES.', beaten: 'FOUR STARS. THE HAT LOSES ONE.' })
  ],
  onEnter: function () { if (!hasFlag('stands_seen')) { setFlag('stands_seen');
    say([['NARRATOR', 'THE BEAST LIFT OPENS INTO THE'], ['NARRATOR', 'STANDS. FIFTY THOUSAND ROMANS.'], ['HERSCHEL', 'IF ANYONE ASKS, WE ARE STEW.']]); } }
});

/* ---------------- GATE OF LIFE (arena entrance) ---------------- */
registerMap('gateoflife', {
  banner: 'PORTA SANAVIVARIA', music: 'rome', battleBg: 'rome',
  grid: [
    '#########',
    '####.####',
    '####.####',
    '###...###',
    '###...###',
    '###...###',
    '#########'
  ],
  warps: [ { x: 4, y: 1, to: 'arena', tx: 6, ty: 8, dir: 'up', gate: 'herschel_joined',
             blocked: function () { say([['GATE GUARD', 'THE GATE OF LIFE. FIGHTERS AND'], ['GATE GUARD', 'STAFF ONLY. SHOW A PASS OR WALK.']]); } },
           { x: 4, y: 5, to: 'stands', tx: 14, ty: 6, dir: 'down' } ],
  objs: [
    { x: 3, y: 3, solid: true, draw: drawTorch, onInteract: function () {} },
    { x: 5, y: 3, solid: true, spr: 'legionary', dir: 'left', onInteract: function () {
        if (hasFlag('herschel_joined')) say([['GATE GUARD', 'A KITCHEN PASS? "BRAVERY IN THE'], ['GATE GUARD', 'KITCHEN, SECOND CLASS"... VALID.'], ['GATE GUARD', 'THE CHAMPION AWAITS. GOOD LUCK.']]);
        else say([['GATE GUARD', 'BEYOND THIS GATE: THE ARENA.'], ['GATE GUARD', 'NO PASS, NO PASSAGE. STAFF ONLY.']]); } }
  ],
  onEnter: function () { if (!hasFlag('gate_seen')) { setFlag('gate_seen');
    say([['NARRATOR', 'THE GATE OF LIFE — WHERE THE'], ['NARRATOR', 'FIGHTERS WALK OUT INTO THE SUN.']]); } }
});

/* ---------------- ARENA (boss) ---------------- */
registerMap('arena', {
  banner: 'THE ARENA', music: 'rome',
  grid: [
    '#############',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#sssssssssss#',
    '#############'
  ],
  warps: [ { x: 1, y: 5, to: 'gateoflife', tx: 4, ty: 2, dir: 'left' } ],
  objs: [
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('maximvs_beaten')) SPR.maximvs(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('maximvs_beaten')) maximvsFight(); } }
  ],
  onEnter: function () { if (!hasFlag('maximvs_beaten') && hasFlag('herschel_joined')) maximvsFight(); }
});

/* ---------------- Rome story beats ---------------- */
function romeArrive() {
  Cutscene.play([
    { bg: 'rome' }, { music: 'rome' },
    { narr: 'ROME, 74 AD. THE DAY OF THE GAMES.' },
    { narr: 'THE WHOLE CITY SURGES TOWARD THE COLOSSEUM. MAXIMVS FIGHTS AT NOON.' },
    { say: ['GERALD', 'PROGRAMS! PRE-APPROVED PROGRAMS!'] },
    { say: ['SAMUEL', 'EXCUSE ME — HAVE YOU SEEN AN OLD'] },
    { say: ['SAMUEL', 'MAN? GRUMPY? SUSPICIOUS HIPS?'] },
    { say: ['GERALD', "THE CHAMPION'S NEW KITCHEN MAN?"] },
    { say: ['GERALD', 'HE IS INSIDE. COMPLAINING.'] },
    { say: ['SAMUEL', "THAT'S HIM. TO THE COLOSSEUM."] }
  ], { onDone: function () { gotoWorld(); } });
}
function romeGeraldBattle(o) {
  Cutscene.play([
    { say: ['GERALD', 'HALT! THESE ARCADES ARE FOR'] },
    { say: ['GERALD', 'PRE-APPROVED FOOT TRAFFIC ONLY.'] },
    { say: ['SAMUEL', 'THEN APPROVE THIS.'] },
    { battle: function () { return { enemies: [{ enemy: 'gerald', level: 5 }], music: 'battle', canFlee: false, bg: 'rome' }; },
      onResult: function (r) { if (r.win) { setFlag('rome_gerald1'); } } },
    { say: ['GERALD', 'UGH. FINE. FILE A COMPLAINT WITH... ME.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function herschelJoin() {
  Cutscene.play([
    { say: ['HERSCHEL', 'SAMUEL! THEY PUT ME TO WORK IN THE'] },
    { say: ['HERSCHEL', 'KITCHEN. AGAIN. UNDERGROUND. AGAIN.'] },
    { say: ['SAMUEL', 'HERSCHEL! ARE YOU HURT?'] },
    { say: ['HERSCHEL', 'ONLY MY PRIDE. AND MY HIP.'] },
    { say: ['HERSCHEL', 'AND MY OTHER HIP.'] },
    { do: function () { addToParty('herschel', 4); setFlag('herschel_joined'); } },
    { narr: 'HERSCHEL JOINS THE PARTY!' },
    { narr: 'GOT THE KITCHEN PASS! ("BRAVERY IN THE KITCHEN, SECOND CLASS")' },
    { say: ['HERSCHEL', 'THAT PASS OPENS THE ARENA GATE.'] },
    { say: ['HERSCHEL', 'AND THE STEW POT GUARDS MY MEDAL.'] },
    { say: ['SAMUEL', 'FIRST: A WORD WITH THE CHAMPION.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function capstanInteract() {
  if (hasFlag('rome_capstan')) { say([['NARRATOR', 'THE CAPSTAN IS LOCKED OPEN.'], ['NARRATOR', 'THE BEAST LIFT AWAITS.']]); return; }
  if (!hasFlag('herschel_joined')) {
    say([['NARRATOR', 'A GREAT WOODEN CAPSTAN. IT RAISES'], ['NARRATOR', 'THE BEAST LIFT TO THE STANDS.'], ['SAMUEL', 'TOO STIFF. THIS NEEDS TWO PEOPLE.']]);
    return;
  }
  Cutscene.play([
    { narr: 'SAMUEL AND HERSCHEL HEAVE THE CAPSTAN TOGETHER...' },
    { say: ['HERSCHEL', 'BOTH. HIPS. WORTH IT.'] },
    { sfx: 'door' },
    { do: function () { setFlag('rome_capstan'); saveGame(false); } },
    { narr: 'CLUNK. THE BEAST LIFT GRINDS INTO PLACE. THE WAY UP IS OPEN!' }
  ], { onDone: function () { gotoWorld(); } });
}
function stewBattle(o) {
  Cutscene.play([
    { narr: 'THE STEW BUBBLES... AND RISES UP!' },
    { battle: function () { return { enemies: [{ enemy: 'orator', level: 5 }], music: 'battle', canFlee: false, bg: 'hypogeum' }; },
      onResult: function (r) { if (r.win) { setFlag('rome_medal'); giveDrip('laurelband'); } } },
    { narr: "HERSCHEL'S MEDAL IS RECOVERED! GOT A LAUREL BAND (DRIP)!" },
    { say: ['HERSCHEL', 'A MEDAL FOR BRAVERY IN THE KITCHEN.'] },
    { say: ['HERSCHEL', 'THE STEW WAS HOSTILE.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function senatorQuest() {
  if (hasFlag('rome_poem')) { say([['SENATOR', 'SHE SAID YES! YOUR WORDS WERE MAGIC.'], ['SENATOR', '// JOKE SLOT']]); return; }
  Cutscene.play([{ choice: { who: 'SENATOR',
    q: 'GHOSTWRITE MY LOVE POEM! HOW SHALL I OPEN?',
    opts: ['ROSES ARE RED...', 'YOUR EYES: TWO COINS', 'O, THOU HAST NICE VIBES'],
    cb: function (idx) {
      if (idx === 1) { setFlag('rome_poem'); giveItem('crumpet', 1); say([['SENATOR', 'PERFECT! ROMANTIC AND FISCAL!'], ['NARRATOR', 'GOT A CRUMPET! (FULL HEAL)']]); }
      else say([['SENATOR', 'HMM. NO. TRY AGAIN LATER, POET.']]);
    } } }]);
}
function maximvsFight() {
  Cutscene.play([
    { bg: 'rome' }, { music: 'boss' },
    { narr: 'THE GATE LIFTS. SUNLIGHT. FIFTY THOUSAND VOICES GO QUIET.' },
    { say: ['MAXIMVS', 'STAFF, IN MY ARENA? NO.'] },
    { say: ['MAXIMVS', 'CHALLENGERS. AT LAST.'] },
    { say: ['MAXIMVS', 'NONE MAY LEAVE WITHOUT A BATTLE.'] },
    { say: ['MAXIMVS', "THEM'S THE RULES."] },
    { say: ['SAMUEL', 'THEN I CHOOSE A RAP BATTLE.'] },
    { say: ['MAXIMVS', '...ELEVEN YEARS UNDEFEATED. SHOW ME.'] },
    { battle: function () { return { enemies: [{ boss: 'maximvs' }], music: 'boss', canFlee: false, bg: 'rome' }; },
      onResult: function (r) { if (r.win) romeRewards(); } }
  ], { onDone: function () { if (hasFlag('maximvs_beaten')) romeVictory(); else gotoWorld(); } });
}
function romeRewards() {
  setFlag('maximvs_beaten'); setFlag('rome_done'); setFlag('dodge_unlocked'); gainPart('FLUX GEAR');
  teachMove('herschel', 'bothhips');
}
function romeVictory() {
  Cutscene.play([
    { say: ['MAXIMVS', 'AT LAST. A WORTHY LOSS. TAKE THE'] },
    { say: ['MAXIMVS', 'FLUX GEAR. I RETIRE TO THE FARM.'] },
    { say: ['HERSCHEL', 'NOT BAD, KID. NOW WATCH THIS.'] },
    { narr: 'HERSCHEL LEARNED BOTH HIPS!' },
    { narr: 'FLUX GEAR GET! ( 1 OF 4 )' },
    { say: ['BABBAGE', 'THE ENGINE CAN NOW REACH DODGE CITY.'] },
    { do: function () { saveGame(false); } }
  ], { onDone: function () { travelChoose('rome'); } });
}

/* ---------------- register Rome as a travel destination ---------------- */
registerEra({ id: 'rome', label: 'ROME 74 AD', unlockFlag: 'rome_unlocked',
  warp: { to: 'forum', tx: 8, ty: 9, dir: 'up' }, arrive: romeArrive, arrivedFlag: 'rome_arrived_seen' });
