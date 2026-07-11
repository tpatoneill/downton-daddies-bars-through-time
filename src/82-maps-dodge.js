/* 82-maps-dodge.js — DODGE CITY, 1875. Main Street, Dusty Trail, Silver Mine,
   Saloon. William joins (sheriff in an hour); Rattlesnake Jake (ROAST) boss;
   name-the-horse sidequest. */

var SHOP_WEST = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:swiftcane'];

/* ---------------- MAIN STREET (town) ---------------- */
registerMap('mainstreet', {
  banner: 'MAIN STREET - DODGE CITY', music: 'west', riftBg: 'west',
  grid: [
    '#################',
    '#sssssssssssssss#',
    '#s|sssssssssss|s#',
    '#sssssssssssssss#',
    '#ppppppppppppppp#',
    '#ppppppppppppppp#',
    '#ppppppppppppppp#',
    '#s|sssssssssss|s#',
    '#sssssssssssssss#',
    '#sssssssssssssss#',
    '#################'
  ],
  warps: [ { x: 15, y: 5, to: 'dustytrail', tx: 2, ty: 4, dir: 'right' } ],
  objs: [
    { x: 8, y: 1, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 4, y: 3, solid: true, spr: 'villager', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_WEST, World, 'GENERAL STORE')); } },
    { x: 12, y: 3, solid: true, spr: 'cowboy', dir: 'down', onInteract: function () { horseQuest(); } },
    { x: 8, y: 5, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'WELCOME TO DODGE. HERE IS YOUR'], ['GERALD', 'DUEL DIALOGUE CARD. READ IT ALOUD.'], ['SAMUEL', 'IT JUST SAYS "OUCH."'], ['GERALD', 'THEN YOU LOSE THE DUEL. NEXT.']]); } },
    { x: 6, y: 7, solid: true, spr: 'gerald', dir: 'up', onInteract: function () { say([['GERALD', 'THE ORDER FINDS COWBOYS TOO'], ['GERALD', 'SPONTANEOUS. EFFECTIVE TODAY, ALL'], ['GERALD', 'YEEHAWS MUST BE FILED IN ADVANCE.']]); } },
    { x: 10, y: 8, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'NOTICE: "ALL DUELS MUST USE'], ['NARRATOR', 'APPROVED DIALOGUE CARDS.'], ['NARRATOR', 'DRAW... FROM THE DECK."']]); } },
    { x: 14, y: 9, mustache: true, flag: 'stache_dodge', onInteract: function (o) { collectMustache(o, 'stache_dodge'); } }
  ],
  onEnter: function () { if (!hasFlag('dodge_arrived_seen')) { setFlag('dodge_arrived_seen'); dodgeArrive(); } else if (hasFlag('dodge_done')) { musicStart('west'); } }
});

/* ---------------- DUSTY TRAIL (route) ---------------- */
registerMap('dustytrail', {
  banner: 'DUSTY TRAIL', music: 'west', encPool: 'west',
  grid: [
    '###################',
    '#sssssssssssssssss#',
    '#sttsssCsssssttsss#',
    '#sttsssssssssttsss#',
    '#sssssssssssssssss#',
    '#sttsssssssCsttsss#',
    '#sttsssssssssttsss#',
    '#sssssssssssssssss#',
    '###################'
  ],
  warps: [
    { x: 1, y: 4, to: 'mainstreet', tx: 14, ty: 5, dir: 'left' },
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
    { x: 1, y: 9, to: 'dustytrail', tx: 16, ty: 4, dir: 'left' },
    { x: 13, y: 1, to: 'saloon', tx: 6, ty: 8, dir: 'up' }
  ],
  objs: [
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
  warps: [ { x: 1, y: 5, to: 'silvermine', tx: 12, ty: 1, dir: 'left' } ],
  objs: [
    { x: 10, y: 1, solid: true, draw: drawCounter, onInteract: function () { say([['NARRATOR', 'THE BAR. STICKY WITH'], ['NARRATOR', 'SARSAPARILLA AND REGRET.']]); } },
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('jake_beaten')) SPR.jake(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('jake_beaten')) jakeFight(); } }
  ],
  onEnter: function () { if (!hasFlag('jake_beaten') && hasFlag('william_joined')) jakeFight(); }
});

/* ---------------- Dodge City story beats ---------------- */
function dodgeArrive() {
  Cutscene.play([
    { bg: 'west' }, { music: 'west' },
    { narr: 'DODGE CITY, 1875.' },
    { say: ['NARRATOR', 'THE SCRIPTED ORDER IS PRINTING'] },
    { say: ['NARRATOR', '"DUEL DIALOGUE" CARDS IN THE MINE.'] },
    { say: ['GERALD', 'DRAW, PARDNER. YOUR LINE IS ON'] },
    { say: ['GERALD', 'THE CARD. DO NOT AD-LIB.'] },
    { say: ['WILLIAM', "SAMUEL! I'VE BEEN HERE AN HOUR"] },
    { say: ['WILLIAM', "AND I'M ALREADY SHERIFF."] },
    { say: ['SAMUEL', 'HOW?!'] },
    { say: ['WILLIAM', 'I SMILED.'] },
    { do: function () { addToParty('william', 6); setFlag('william_joined'); } },
    { narr: 'WILLIAM JOINS THE PARTY!' },
    { say: ['WILLIAM', 'THE MAN IN THE SALOON DOES NOT'] },
    { say: ['WILLIAM', 'CARE FOR MY SMILE. AT ALL.'] }
  ], { onDone: function () { gotoWorld(); } });
}
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
    { say: ['SAMUEL', 'GOGGLES? IN 1875?'] },
    { say: ['SAMUEL', 'THE RIFTS ARE LEAKING.'] }
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

/* ---------------- register Dodge City as a travel destination ---------------- */
registerEra({ id: 'dodge', label: 'DODGE CITY 1875', unlockFlag: 'dodge_unlocked',
  warp: { to: 'mainstreet', tx: 8, ty: 9, dir: 'up' }, arrive: dodgeArrive, arrivedFlag: 'dodge_arrived_seen' });
