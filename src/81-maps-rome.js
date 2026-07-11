/* 81-maps-rome.js — ROME, 74 AD. Forum plaza, Market Road, Colosseum Kitchens,
   Arena. Herschel joins; MC Maximvs (FLEX) boss; senator love-poem sidequest. */

var SHOP_ROME = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:laurelband'];

function drawRift(x, y) {
  var t = (performance.now() / 120) | 0;
  for (var r = 0; r < 4; r++) { var c = [COL.purple, COL.neon, COL.neon2, COL.gold][(r + t) % 4]; px(x + 2 + r, y + 2 + r, 12 - r * 2, 12 - r * 2, c); }
  px(x + 6, y + 6, 4, 4, COL.white);
}
function drawStew(x, y) { px(x + 2, y + 6, 12, 8, '#5a3c22'); px(x + 3, y + 5, 10, 3, '#7a4c2a');
  var t = (performance.now() / 200) | 0; px(x + 4 + (t % 3), y + 6, 3, 2, '#8a6c3a'); px(x + 9, y + 7, 2, 2, '#9a7c4a'); }

/* ---------------- FORUM (town) ---------------- */
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
  warps: [ { x: 15, y: 5, to: 'marketroad', tx: 2, ty: 4, dir: 'right' } ],
  objs: [
    { x: 8, y: 1, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 4, y: 3, solid: true, spr: 'roman', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_ROME, World, 'ROMAN MERCHANT')); } },
    { x: 12, y: 3, solid: true, spr: 'roman', dir: 'down', onInteract: function () { senatorQuest(); } },
    { x: 8, y: 5, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'ALL RHYMES MUST BE SUBMITTED IN'], ['GERALD', 'TRIPLICATE. IN WRITING. PRE-APPROVED.'], ['SAMUEL', 'WHO WRITES A FREESTYLE DOWN?'], ['GERALD', "WE DO. IT'S SAFER. IT'S SCRIPTED."]]); } },
    { x: 6, y: 7, solid: true, spr: 'gerald', dir: 'up', onInteract: function () { say([['GERALD', 'THE FORUM CYPHER IS CLOSED.'], ['GERALD', 'BY ORDER OF THE SCRIPTED ORDER.'], ['GERALD', '(MY NAME IS ALSO GERALD.)']]); } },
    { x: 10, y: 8, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'NOTICE: "IMPROV STRICTLY FORBIDDEN.'], ['NARRATOR', 'VIOLATORS WILL BE EDITED."']]); } },
    { x: 14, y: 9, mustache: true, flag: 'stache_rome', onInteract: function (o) { collectMustache(o, 'stache_rome'); } }
  ],
  onEnter: function () { if (!hasFlag('rome_arrived_seen')) { setFlag('rome_arrived_seen'); romeArrive(); } else if (hasFlag('rome_done')) { musicStart('rome'); } }
});

/* ---------------- MARKET ROAD (route) ---------------- */
registerMap('marketroad', {
  banner: 'MARKET ROAD', music: 'rome', encPool: 'rome',
  grid: [
    '###################',
    '#ddddddddddddddddd#',
    '#dttdddddddddttddd#',
    '#dttdddddddddttddd#',
    '#ddddddddddddddddd#',
    '#dttdddddddddttddd#',
    '#dttdddddddddttddd#',
    '#ddddddddddddddddd#',
    '###################'
  ],
  warps: [
    { x: 1, y: 4, to: 'forum', tx: 14, ty: 5, dir: 'left' },
    { x: 17, y: 4, to: 'kitchens', tx: 2, ty: 9, dir: 'up' }
  ],
  objs: [
    { x: 9, y: 4, solid: true, spr: 'gerald', dir: 'down', flag: 'rome_gerald1',
      onInteract: function (o) { romeGeraldBattle(o); } },
    mkTrainer(5, 3, { spr: 'roman', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_rome_a', enemy: 'orator', level: 2, reward: 20, bg: 'rome', tname: 'STREET ORATOR', hail: 'HALT, PLEBEIAN! DEFEND YOUR VERSE!', beaten: 'IMPRESSIVE... FOR A TOURIST.' }),
    mkTrainer(12, 3, { spr: 'legionary', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_rome_b', enemy: 'legionary', level: 2, reward: 20, bg: 'rome', tname: 'LEGIONARY', hail: 'NONE PASS WITHOUT A BATTLE.', beaten: 'YOU FIGHT LIKE A CONSUL.' }),
    mkTrainer(14, 6, { spr: 'roman', dir: 'left', patrol: { ax: 'h', span: 3 }, sight: 3, defeat: 'tr_rome_c', enemy: 'senator', level: 2, reward: 22, bg: 'rome', tname: 'GOSSIPING SENATOR', hail: 'I HEARD YOUR BARS ARE... AVERAGE.', beaten: 'I SHALL GOSSIP OF YOUR GENIUS.' }),
    { x: 15, y: 1, mustache: true, flag: 'stache_rome2', onInteract: function (o) { collectMustache(o, 'stache_rome2'); } }
  ]
});

/* ---------------- COLOSSEUM KITCHENS (dungeon) ---------------- */
registerMap('kitchens', {
  banner: 'COLOSSEUM KITCHENS', music: 'rome',
  grid: [
    '###############',
    '#....O...O..X.#',
    '#.OO.......OO.#',
    '#.............#',
    '#...=======...#',
    '#.............#',
    '#.OO.....OO...#',
    '#.............#',
    '#.....===.....#',
    '#.............#',
    '###############'
  ],
  warps: [
    { x: 1, y: 9, to: 'marketroad', tx: 16, ty: 4, dir: 'left' },
    { x: 13, y: 1, to: 'arena', tx: 6, ty: 8, dir: 'up' }
  ],
  objs: [
    { x: 7, y: 5, solid: true, spr: 'herschel', dir: 'down', flag: 'herschel_joined',
      onInteract: function () { herschelJoin(); } },
    { x: 7, y: 3, solid: true, draw: drawStew, flag: 'rome_medal',
      onInteract: function (o) { stewBattle(o); } },
    { x: 11, y: 8, solid: true, spr: 'gerald', dir: 'left', onInteract: function () { say([['GERALD', 'STIR FASTER, OLD MAN. THE'], ['GERALD', 'SCRIPT SAYS THE STEW IS READY AT SIX.']]); } },
    { x: 13, y: 9, mustache: true, flag: 'stache_rome3', onInteract: function (o) { collectMustache(o, 'stache_rome3'); } }
  ]
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
  warps: [ { x: 1, y: 5, to: 'kitchens', tx: 12, ty: 1, dir: 'left' } ],
  objs: [
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('maximvs_beaten')) SPR.maximvs(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('maximvs_beaten')) maximvsFight(); } }
  ],
  onEnter: function () { if (!hasFlag('maximvs_beaten') && hasFlag('herschel_joined')) maximvsFight(); }
});

/* ---------------- Rome story beats ---------------- */
function romeArrive() {
  Cutscene.play([
    { bg: 'rome' }, { music: 'rome' },
    { narr: 'ROME, 74 AD. THE FORUM.' },
    { say: ['NARRATOR', 'THE SCRIPTED ORDER HAS SILENCED THE FORUM CYPHER.'] },
    { say: ['GERALD', 'MOVE ALONG. NO IMPROVISING IN THE FORUM.'] },
    { say: ['SAMUEL', 'HERSCHEL IS HERE SOMEWHERE. HEAD FOR THE KITCHENS.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function romeGeraldBattle(o) {
  Cutscene.play([
    { say: ['GERALD', 'HALT! THIS ROAD IS PRE-APPROVED ONLY.'] },
    { say: ['SAMUEL', 'THEN APPROVE THIS.'] },
    { battle: function () { return { enemies: [{ enemy: 'gerald', level: 3 }], music: 'battle', canFlee: false }; },
      onResult: function (r) { if (r.win) { setFlag('rome_gerald1'); } } },
    { say: ['GERALD', 'UGH. FINE. FILE A COMPLAINT WITH... ME.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function herschelJoin() {
  Cutscene.play([
    { say: ['HERSCHEL', 'SAMUEL! THEY PUT ME TO WORK IN THE'] },
    { say: ['HERSCHEL', 'KITCHEN. AGAIN.'] },
    { say: ['SAMUEL', 'HERSCHEL! ARE YOU HURT?'] },
    { say: ['HERSCHEL', 'ONLY MY PRIDE. AND MY HIP.'] },
    { say: ['HERSCHEL', 'AND MY OTHER HIP.'] },
    { do: function () { addToParty('herschel', 3); setFlag('herschel_joined'); } },
    { narr: 'HERSCHEL JOINS THE PARTY!' },
    { say: ['HERSCHEL', 'THAT STEW POT GUARDS MY OLD MEDAL.'] },
    { say: ['HERSCHEL', 'AND THE CHAMPION UPSTAIRS WANTS A WORD.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function stewBattle(o) {
  Cutscene.play([
    { narr: 'THE STEW BUBBLES... AND RISES UP!' },
    { battle: function () { return { enemies: [{ enemy: 'orator', level: 4 }], music: 'battle', canFlee: false, bg: 'rome' }; },
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
      if (idx === 1) { setFlag('rome_poem'); giveDrip('goldchain'); say([['SENATOR', 'PERFECT! ROMANTIC AND FISCAL!'], ['NARRATOR', 'GOT A GOLD CHAIN (DRIP)!']]); }
      else say([['SENATOR', 'HMM. NO. TRY AGAIN LATER, POET.']]);
    } } }]);
}
function maximvsFight() {
  Cutscene.play([
    { bg: 'rome' }, { music: 'boss' },
    { say: ['MAXIMVS', 'HALT! NONE MAY LEAVE THE ARENA'] },
    { say: ['MAXIMVS', "WITHOUT A BATTLE. THEM'S THE RULES."] },
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
