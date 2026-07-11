/* 83-maps-nyc.js — NEW YORK, 1977. Back Alley, Club Inferno dance floor,
   Boiler Room, Rooftop. Rosalind joins; DISCO REX (HEART) boss; disco-couple
   message-relay sidequest. The Order is replacing DJs with the Automatic Playlist. */

var SHOP_NYC = ['earlgrey', 'strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:discogoggle'];

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
function drawDumpster(x, y) { px(x + 1, y + 6, 14, 8, '#3a5a4a'); px(x + 1, y + 5, 14, 2, '#2a4a3a'); px(x + 3, y + 14, 2, 2, '#22222a'); px(x + 11, y + 14, 2, 2, '#22222a'); }

/* ---------------- BACK ALLEY (arrival) ---------------- */
registerMap('backalley', {
  banner: 'BACK ALLEY - NEW YORK', music: 'disco',
  grid: [
    'bbbbbbbbbbbbb',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#p|ppppppp|p#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#############'
  ],
  warps: [ { x: 6, y: 1, to: 'clubinferno', tx: 8, ty: 12, dir: 'up' } ],
  objs: [
    { x: 6, y: 0, solid: true, draw: drawTheatreDoor, onInteract: function () { say([['NARRATOR', 'CLUB INFERNO. THE BASS IS'], ['NARRATOR', 'AUDIBLE THROUGH THE BRICKS.']]); } },
    { x: 4, y: 3, solid: true, spr: 'villager', dir: 'down', onInteract: function () { say([['BOUNCER', 'DRESS CODE IS FUNKY.'], ['BOUNCER', 'THE MUSTACHES COUNT.'], ['BOUNCER', 'GO RIGHT IN, GENTLEMEN.']]); } },
    { x: 10, y: 4, solid: true, draw: drawSign, onInteract: function () { say([['NARRATOR', 'SIGN: "TONIGHT: THE AUTOMATIC'], ['NARRATOR', 'PLAYLIST. NO DJ."'], ['NARRATOR', '"DO NOT ASK ABOUT THE DJ."']]); } },
    { x: 11, y: 6, solid: true, draw: drawDumpster, onInteract: function () { say([['NARRATOR', 'A PERFECTLY GOOD DUMPSTER.'], ['NARRATOR', 'EMPTY. FOR NOW.']]); } },
    { x: 2, y: 6, mustache: true, flag: 'stache_nyc', onInteract: function (o) { collectMustache(o, 'stache_nyc'); } }
  ],
  onEnter: function () { if (!hasFlag('nyc_arrived_seen')) { setFlag('nyc_arrived_seen'); nycArrive(); } else if (hasFlag('nyc_done')) { musicStart('disco'); } }
});

/* ---------------- CLUB INFERNO (town) ---------------- */
registerMap('clubinferno', {
  banner: 'CLUB INFERNO', music: 'disco', riftBg: 'disco',
  grid: [
    '#################',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#ffffffffffffffff',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '#fffffffffffffff#',
    '########f########'
  ],
  warps: [
    { x: 8, y: 13, to: 'backalley', tx: 6, ty: 2, dir: 'down' },
    { x: 16, y: 6, to: 'boilerroom', tx: 2, ty: 5, dir: 'right' }
  ],
  objs: [
    { x: 2, y: 1, solid: true, draw: drawRift, onInteract: function () { openRift(); } },
    { x: 8, y: 1, solid: true, draw: drawCounter, onInteract: function () { say([['NARRATOR', 'THE DJ BOOTH. A NOTE READS:'], ['NARRATOR', '"OUT TO LUNCH. FOREVER."'], ['NARRATOR', '"- MANAGEMENT."']]); } },
    { x: 14, y: 2, solid: true, spr: 'discoer', dir: 'left', onInteract: function () { coupleDonna(); } },
    { x: 12, y: 3, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'DANCING IS PERMITTED.'], ['GERALD', 'SPONTANEOUS DANCING IS NOT.'], ['GERALD', 'CONSULT THE APPROVED MOVES LIST.'], ['GERALD', '(THE LIST IS ONE MOVE.)']]); } },
    { x: 5, y: 4, solid: true, spr: 'discoer', dir: 'down', onInteract: function () { say([['DANCER', "I'VE DONE THE HUSTLE SINCE"], ['DANCER', 'TUESDAY. IT IS NOW SATURDAY.'], ['DANCER', 'SOMEONE PLEASE CALL MY BOSS.']]); } },
    { x: 8, y: 7, solid: true, spr: 'gerald', dir: 'down', onInteract: function () { say([['GERALD', 'THE AUTOMATIC PLAYLIST NEVER'], ['GERALD', 'TIRES. NEVER ERRS. NEVER PAYS.'], ['GERALD', 'NEVER GETS FUNKY.'], ['SAMUEL', 'YOU SAID THE QUIET PART LOUD.']]); } },
    { x: 11, y: 9, solid: true, spr: 'villager2', dir: 'up', onInteract: function () { say([['REGULAR', 'MY PLATFORM SHOES ADD FOUR'], ['REGULAR', 'INCHES AND ONE PERSONALITY.'], ['REGULAR', '// JOKE SLOT']]); } },
    { x: 3, y: 10, solid: true, spr: 'discoer', dir: 'down', onInteract: function () { setScene(makeShop(SHOP_NYC, World, 'CLUB MERCH TABLE')); } },
    { x: 2, y: 11, solid: true, spr: 'villager2', dir: 'right', onInteract: function () { coupleVinnie(); } },
    { x: 14, y: 11, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 1, y: 12, mustache: true, flag: 'stache_nyc3', onInteract: function (o) { collectMustache(o, 'stache_nyc3'); } }
  ]
});

/* ---------------- BOILER ROOM (dungeon) ---------------- */
registerMap('boilerroom', {
  banner: 'THE BOILER ROOM', music: 'disco', encPool: 'disco',
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
    { x: 1, y: 5, to: 'clubinferno', tx: 15, ty: 6, dir: 'left' },
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
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#ppppppppppp#',
    '#############'
  ],
  warps: [ { x: 6, y: 9, to: 'boilerroom', tx: 12, ty: 1, dir: 'down' } ],
  objs: [
    { x: 6, y: 2, solid: true, spr: null, draw: function (x, y) { if (!hasFlag('rex_beaten')) SPR.rex(x - 18, y - 8); }, onInteract: function () { if (!hasFlag('rex_beaten')) rexFight(); } },
    { x: 10, y: 2, solid: true, draw: drawBall, onInteract: function () {
        if (hasFlag('rex_beaten')) say([['NARRATOR', 'THE CRATE IS EMPTY. THE GOLDEN'], ['NARRATOR', 'AGE TRAVELS WITH THE DADDIES NOW.']]);
        else say([['NARRATOR', 'THE MIRROR BALL, LOWERED FOR'], ['NARRATOR', 'MAINTENANCE. IT HOLDS EVERY'], ['NARRATOR', 'SATURDAY NIGHT THERE EVER WAS.']]); } }
  ],
  onEnter: function () { if (!hasFlag('rex_beaten') && hasFlag('rosalind_joined')) rexFight(); }
});

/* ---------------- NYC story beats ---------------- */
function nycArrive() {
  Cutscene.play([
    { bg: 'disco' }, { music: 'disco' },
    { narr: 'NEW YORK, 1977. CLUB INFERNO.' },
    { say: ['NARRATOR', 'THE ORDER IS REPLACING THE DJS WITH A PRE-PROGRAMMED "AUTOMATIC PLAYLIST."'] },
    { say: ['NARRATOR', 'THEY INVENTED THE ALGORITHM. THE MONSTERS.'] },
    { say: ['ROSALIND', 'SAMUEL! OVER HERE! I REVERSE-'] },
    { say: ['ROSALIND', 'ENGINEERED THE DJ BOOTH. TWICE.'] },
    { say: ['ROSALIND', 'THE SECOND TIME WAS FOR FUN.'] },
    { say: ['ROSALIND', 'SAMUEL! THIS DISCO BALL IS A'] },
    { say: ['ROSALIND', 'PERFECT TEMPORAL LENS!'] },
    { say: ['SAMUEL', 'CAN IT GET US HOME?'] },
    { say: ['ROSALIND', 'YES. I JUST NEED TO BORROW IT.'] },
    { say: ['ROSALIND', 'FOREVER.'] },
    { do: function () { addToParty('rosalind', 9); setFlag('rosalind_joined'); } },
    { narr: 'ROSALIND JOINS THE PARTY!' },
    { say: ['ROSALIND', 'THE BALL BELONGS TO A MAN CALLED'] },
    { say: ['ROSALIND', 'DISCO REX. HE SEEMS REASONABLE.'] },
    { say: ['SAMUEL', 'FAMOUS LAST WORDS, PROFESSOR.'] }
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
    { narr: 'TIME CRYSTAL GET! ( 3 OF 4 )' },
    { say: ['BABBAGE', 'THE ENGINE CAN NOW REACH HOME.'] },
    { say: ['BABBAGE', 'PLOTTING A COURSE FOR LONDON...'] }
  ], { onDone: function () { saveGame(false); goblinMalfunction(); } });
}

/* ---------------- register NYC as a travel destination ---------------- */
registerEra({ id: 'nyc', label: 'NEW YORK 1977', unlockFlag: 'nyc_unlocked',
  warp: { to: 'backalley', tx: 6, ty: 5, dir: 'up' }, arrive: nycArrive, arrivedFlag: 'nyc_arrived_seen' });
