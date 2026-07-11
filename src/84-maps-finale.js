/* 84-maps-finale.js — LONDON, 1889, ACT 3. The occupied theatre district, the
   Order-elite gauntlet, and the two-phase Snobbington finale: the reveal, Samuel's
   True Form transformation, NO MORE DISGUISE, then the birthday sequence + credits.
   The reveal lines are SACRED — kept verbatim from DESIGN.md / v1. */

var SHOP_FINALE = ['strongtea', 'crumpet', 'lozenge', 'sparestache', 'drip:heartlocket'];

/* new finale speakers (sprites come from 31-sprites-extra.js) */
SPEAKERS['P DIDDY'] = { spr: SPR.pdiddy, f: 240 };
SPEAKERS['50 CENT'] = { spr: SPR.fiftycent, f: 200 };
SPEAKERS['PEDRO'] = { spr: SPR.pedro, f: 196 };
SPEAKERS['UNDERSTUDY'] = { spr: SPR.babbage, f: 300 };

function drawBasement(x, y) { px(x + 2, y + 2, 12, 13, '#1a1018'); px(x + 3, y + 3, 10, 11, '#2a2030');
  for (var i = 0; i < 4; i++) px(x + 4, y + 4 + i * 2, 8, 1, '#0e0812'); px(x + 6, y, 4, 3, COL.stoned); }

function drawBarricade(x, y) { px(x, y + 3, TS, 10, '#3a3244'); px(x, y + 3, TS, 2, '#4a4258');
  px(x + 2, y + 6, 3, 6, COL.purple); px(x + 8, y + 6, 3, 6, COL.purple); px(x + 5, y, 2, TS, '#5a4a6a'); }
function drawMarquee(x, y) { px(x, y, TS, 12, '#5a2038'); px(x + 1, y + 1, TS - 2, 8, COL.gold);
  for (var i = 0; i < 4; i++) px(x + 2 + i * 3, y + 3, 2, 4, ((performance.now() / 200 | 0) + i) % 2 ? COL.red : COL.cream); }

/* ================= THEATRE DISTRICT (occupied) ================= */
registerMap('theatredistrict', {
  banner: 'THEATRE DISTRICT', music: 'london', riftBg: 'london',
  grid: [
    '###################',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '#ppppppppppppppppp#',
    '#gggggggppgggggggg#',
    '#ggTggggppggggTggg#',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '#gggggggppgggggggg#',
    '###################'
  ],
  warps: [ { x: 9, y: 1, to: 'finalstage', tx: 7, ty: 11, dir: 'up', gate: 'lobby_clear',
             blocked: function () { say([['NARRATOR', 'ORDER ELITES GUARD THE STAGE DOOR.'], ['NARRATOR', 'CLEAR BOTH EDITORS FIRST.']]); } } ],
  objs: [
    { x: 9, y: 0, solid: true, draw: drawMarquee, onInteract: function () { say([['NARRATOR', 'THE MARQUEE IS DARK. THE ORDER'], ['NARRATOR', "PAINTED OVER THE DADDIES' NAMES."]]); } },
    { x: 8, y: 3, solid: true, spr: 'editor', dir: 'down', flag: 'editor1_beaten',
      onInteract: function (o) { editorBattle(o, 'editor1_beaten'); } },
    { x: 9, y: 3, solid: true, spr: 'editor', dir: 'down', flag: 'editor2_beaten',
      onInteract: function (o) { editorBattle(o, 'editor2_beaten'); } },
    { x: 3, y: 6, solid: true, draw: drawBarricade, onInteract: function () { say([['GERALD', 'THIS DISTRICT IS UNDER REVIEW.'], ['GERALD', 'ALL JOY MUST BE SUBMITTED IN WRITING.']]); } },
    { x: 15, y: 6, solid: true, draw: drawBarricade, onInteract: function () { say([['GERALD', 'NO FREESTYLING PAST THIS POINT.'], ['GERALD', 'ORDER OF LORD SNOBBINGTON.']]); } },
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    { x: 16, y: 9, solid: true, spr: 'babbage', dir: 'up', onInteract: function () { babbageTalk(SHOP_FINALE, "BABBAGE'S CART"); } },
    { x: 5, y: 7, mustache: true, flag: 'stache_finale', onInteract: function (o) { collectMustache(o, 'stache_finale'); } },
    { x: 16, y: 3, solid: true, draw: drawBasement, onInteract: function () {
        if (hasFlag('understudy_beaten')) say([['NARRATOR', 'THE UNDERSTUDY IS SILENT NOW.'], ['NARRATOR', 'A COPY NEVER BEATS THE ORIGINAL.']]);
        else if (hasFlag('understudy_unlocked')) understudyFight();
        else say([['NARRATOR', 'A SEALED CELLAR DOOR. SOMETHING HUMS'], ['NARRATOR', 'BELOW — WAITING FOR A FULL SET OF 12.']]); } }
  ],
  onStep: function () { if (hasFlag('editor1_beaten') && hasFlag('editor2_beaten')) setFlag('lobby_clear'); },
  onEnter: function () { if (!hasFlag('finale_arrived')) { setFlag('finale_arrived'); finaleArrive(); } }
});

/* ================= FINAL STAGE ================= */
registerMap('finalstage', {
  banner: 'THE DOWNTON THEATRE', music: 'london',
  grid: [
    '###############',
    '#mmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmm#',
    '#mmmm=====mmmm#',
    '#mmmmmmmmmmmmm#',
    '#mmmmmmmmmmmmm#',
    '#.###.###.###.#',
    '#.###.###.###.#',
    '#.###.###.###.#',
    '#.............#',
    '#.....===.....#',
    '#.............#',
    '######..#######'
  ],
  warps: [ { x: 6, y: 12, to: 'theatredistrict', tx: 9, ty: 5, dir: 'down' },
           { x: 7, y: 12, to: 'theatredistrict', tx: 9, ty: 5, dir: 'down' } ],
  objs: [],
  onEnter: function () { if (!hasFlag('finale_done')) snobbingtonFight(); }
});

/* ================= FINALE STORY ================= */
function finaleArrive() {
  Cutscene.play([
    { bg: 'london' }, { music: 'london' },
    { narr: 'LONDON, 1889. HOME AT LAST.' },
    { narr: 'BUT THE THEATRE DISTRICT IS UNDER SCRIPTED ORDER OCCUPATION.' },
    { say: ['HERSCHEL', 'THEY PAINTED OVER OUR NAMES.'] },
    { say: ['WILLIAM', 'THEN WE SHALL SIMPLY REPAINT THEM.'] },
    { say: ['ROSALIND', 'IN A COLOR HE CANNOT APPROVE.'] },
    { say: ['SAMUEL', 'CLEAR THE EDITORS. TAKE BACK THE STAGE.'] }
  ], { onDone: function () { gotoWorld(); } });
}
function editorBattle(o, flag, who) {
  Cutscene.play([
    { say: ['EDITOR', 'HALT. YOUR VERSE IS UNAPPROVED.'] },
    { say: ['SAMUEL', 'GOOD. THE APPROVED ONES ARE BORING.'] },
    { battle: function () { return { enemies: [{ enemy: 'editor', level: 12 }], music: 'boss', canFlee: false, bg: 'london' }; },
      onResult: function (r) { if (r.win) setFlag(flag); } }
  ], { onDone: function () { if (hasFlag(flag)) { if (hasFlag('editor1_beaten') && hasFlag('editor2_beaten')) setFlag('lobby_clear'); } gotoWorld(); } });
}

/* two-phase Snobbington finale */
function snobbingtonFight() {
  Cutscene.play([
    { bg: 'stage' }, { music: 'boss' },
    { say: ['SNOBBINGTON', 'WELL, WELL. THE DOWNTON DADDIES.'] },
    { say: ['SNOBBINGTON', 'I HAVE PURCHASED YOUR THEATRE.'] },
    { say: ['SNOBBINGTON', 'IMPROV IS BANNED. RAP IS BANNED.'] },
    { say: ['SNOBBINGTON', 'FUN IS... UNDER REVIEW.'] },
    { say: ['WILLIAM', 'YOU FIEND.'] },
    { say: ['SNOBBINGTON', 'FORTY YEARS AGO I STEPPED UP HERE.'] },
    { say: ['SNOBBINGTON', 'I WENT BLANK. THEY LAUGHED.'] },
    { say: ['SNOBBINGTON', 'NO ONE WILL EVER FREESTYLE AGAIN.'] },
    { say: ['SNOBBINGTON', 'LEAVE, OR FACE ME.'] },
    { say: ['SAMUEL', 'A RAP BATTLE?'] },
    { say: ['SNOBBINGTON', "REGRETTABLY, YES. THEM'S THE RULES."] },
    { say: ['SNOBBINGTON', 'NO GOONS. NO SCRIPT. JUST ME —'] },
    { say: ['SNOBBINGTON', 'AND MY MASTERPIECE. BEHOLD!'] },
    { battle: function () { return { enemies: [{ boss: 'snob1' }], music: 'boss', canFlee: false, bg: 'stage', crowdStart: -10 }; },
      onResult: function (r) { if (r.win) setFlag('snob1_beaten'); } }
  ], { onDone: function () { if (hasFlag('snob1_beaten')) snobEscalate(); else gotoWorld(); } });
}

/* Samuel was already revealed + powered up back in the Goblin Realm, so the
   between-phase beat is Snobbington's OWN escalation and the crowd is all Daddies. */
function snobEscalate() {
  Cutscene.play([
    { bg: 'stage' }, { stop: true },
    { say: ['SNOBBINGTON', 'SO THE GREAT SAMUEL IS A WOMAN.'] },
    { say: ['SNOBBINGTON', 'HOW DELIGHTFULLY OFF-SCRIPT.'] },
    { say: ['SAMUEL', "AND YOU'RE STILL GOING TO LOSE."] },
    { sfx: 'reveal' },
    { narr: 'SNOBBINGTON TEARS OPEN HIS COAT — THE FINAL DRAFT!' },
    { music: 'finale' },
    { narr: 'BUT THE CROWD IS ALL DADDIES NOW! THE METER SLAMS IN HER FAVOR!' },
    { battle: function () { return { enemies: [{ boss: 'snob2' }], music: 'finale', canFlee: false, bg: 'stage', crowdStart: 100 }; },
      onResult: function (r) { if (r.win) setFlag('finale_done'); } }
  ], { onDone: function () { if (hasFlag('finale_done')) pDiddyUnmask(); else gotoWorld(); } });
}

/* True Form: mustache-free sprite (keyed on 'trueform' flag), stat jump, ultimate. */
function transformSamuel() {
  setFlag('trueform');
  var sam = null; for (var i = 0; i < Game.party.length; i++) if (Game.party[i].id === 'samuel') sam = Game.party[i];
  if (!sam) return;
  sam.level = Math.max(sam.level, 14);
  var cls = sam.cls, old = sam.maxHP;
  sam.maxHP = statAt(cls, 'HYPE', sam.level) + 20;
  sam.baseFLOW = statAt(cls, 'FLOW', sam.level) + 8;
  sam.basePOISE = statAt(cls, 'POISE', sam.level) + 6;
  sam.baseTEMPO = statAt(cls, 'TEMPO', sam.level) + 6;
  sam.hp = sam.maxHP; sam.status = null; sam.fainted = false;
  sam.stage = { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 };
  /* Mustache Twirl -> Hat Tip (better line, same effect) */
  var mi = sam.moves.indexOf('mustache'); if (mi >= 0) sam.moves[mi] = 'hattip';
  /* learn the ultimate */
  if (sam.moves.indexOf('nomoredis') < 0) { if (sam.moves.length >= 4) sam.moves[sam.moves.length - 1] = 'nomoredis'; else sam.moves.push('nomoredis'); }
  jingle('level');
}

/* THE SCOOBY-DOO UNMASK + the 50 Cent future-mission hook. */
function pDiddyUnmask() {
  Cutscene.play([
    { bg: 'stage' },
    { say: ['SNOBBINGTON', 'IMPOSSIBLE! MY... MY FINAL DRAFT!'] },
    { sfx: 'reveal' },
    { narr: 'SAMUEL YANKS OFF HIS MASK. THE WHOLE THEATRE GASPS.' },
    { narr: 'LORD SNOBBINGTON WAS... P DIDDY?!' },
    { say: ['P DIDDY', "AND I WOULD'VE GOTTEN AWAY WITH IT TOO,"] },
    { say: ['P DIDDY', "IF IT WEREN'T FOR YOU MEDDLING DADDIES!"] },
    { sfx: 'whoosh' },
    { narr: 'THEN THE TIME MACHINE ROARS. A FIGURE STEPS OUT.' },
    { say: ['50 CENT', 'DADDIES. YOU TOOK DOWN P DIDDY.'] },
    { say: ['50 CENT', 'I CAME FROM THE FUTURE. WE NEED YOU.'] },
    { say: ['50 CENT', "THE MISSION? IT ISN'T WRITTEN YET."] },
    { say: ['SAMUEL', "THEN WE'LL FREESTYLE IT."] },
    { say: ['HERSCHEL', 'MY HIP SAYS NO. WE GO ANYWAY.'] },
    { do: function () { setFlag('game_complete'); gainPart('MASTER SPRING'); healParty(); saveGame(false); } },
    { narr: 'THE DADDIES PILE INTO THE MACHINE. ONE MORE JUMP...' }
  ], { onDone: function () { setScene(makeBirthday()); } });
}

/* register the finale as a travel destination once unlocked */
registerEra({ id: 'london_finale', label: 'LONDON 1889 - THE STAGE', unlockFlag: 'london_unlocked',
  warp: { to: 'theatredistrict', tx: 9, ty: 5, dir: 'up' }, arrive: finaleArrive, arrivedFlag: 'finale_arrived' });

/* ================= BIRTHDAY SEQUENCE + CREDITS ================= */
var CONFETTI_COLORS = ['#e05f8f', '#e2b23e', '#349c8e', '#8b5cf6', '#f6f6fa', '#4ff0ff'];
var CREDITS = [
  '- THE DOWNTON DADDIES -', '',
  'SAMUEL .......... THE SHOWMAN', 'HERSCHEL ........ THE TANK',
  'WILLIAM ......... THE CHARMER', 'ROSALIND ........ THE MAGE',
  'BABBAGE ......... FAITHFUL BUTLER', '',
  '- WHERE ARE THEY NOW -', '',
  'MAXIMVS RETIRED TO THE FARM.', 'JAKE TOURS AS A SPOKEN-WORD POET.',
  'REX DANCES ON, FOREVER YOUNG.', 'SNOBBINGTON TOOK A FREESTYLE CLASS.', '',
  'AND THE THEATRE?', 'THE THEATRE NEVER CLOSED AGAIN.', ''
];
function makeBirthday() {
  var conf = [];
  for (var i = 0; i < 60; i++) conf.push({ x: Math.random() * 240, y: -Math.random() * 160,
    vy: 18 + Math.random() * 30, vx: (Math.random() - 0.5) * 12, c: CONFETTI_COLORS[(Math.random() * 6) | 0], w: Math.random() < 0.5 ? 2 : 3 });
  return {
    t: 0, phase: 'credits', scroll: 0,
    enter: function () { musicStart('finale'); jingle('win'); this.t = 0; this.scroll = 0; this.phase = 'credits'; },
    update: function (dt) {
      this.t += dt;
      for (var i = 0; i < conf.length; i++) { var p = conf[i]; p.y += p.vy * dt; p.x += p.vx * dt + Math.sin(this.t * 3 + i) * 0.3; if (p.y > 162) { p.y = -4; p.x = Math.random() * 240; } }
      if (this.phase === 'credits') { this.scroll += dt * 16; if (this.scroll > CREDITS.length * 12 + 40) this.phase = 'bow'; }
    },
    onPress: function (k) {
      if (this.phase === 'credits' && (k === 'a' || k === 'start')) { this.scroll += 40; }
      else if (this.phase === 'bow' && (k === 'start' || k === 'a')) { this.phase = 'stinger'; this.t = 0; }
      else if (this.phase === 'stinger' && (k === 'start' || k === 'a')) { musicStop(); saveGame(false); setScene(Title); }
    },
    draw: function () {
      if (this.phase === 'stinger') { this.drawStinger(); return; }
      /* theatre backdrop */
      cls('#2a1830'); px(0, 0, 36, 160, '#5a2038'); px(204, 0, 36, 160, '#5a2038');
      px(36, 0, 168, 14, '#5a2038');
      for (var i = 0; i < 12; i++) px(40 + i * 14, 14, 9, 6, '#4a1830');
      px(36, 120, 168, 3, COL.gold); px(36, 123, 168, 37, '#6a4a3a');
      if (this.phase === 'credits') {
        for (var c = 0; c < CREDITS.length; c++) { var yy = 150 - this.scroll + c * 12; if (yy > 20 && yy < 150) centerTextO(CREDITS[c], yy, CREDITS[c][0] === '-' ? COL.gold : COL.cream, COL.black); }
      } else {
        /* curtain call: the four daddies bow, Samuel (true form) crowned */
        centerTextO('HAPPY BIRTHDAY', 22, COL.gold, COL.black, 2);
        centerTextO(BIRTHDAY_NAME + '!', 44, COL.pink, COL.black, 2);
        var row = [['herschel', 40], ['william', 88], ['samuel', 128, true], ['rosalind', 172]];
        for (i = 0; i < row.length; i++) { var bob = Math.round(Math.sin(this.t * 4 + i) * 2);
          if (row[i][0] === 'samuel') SPR.samuel(row[i][1] - 24, 70 + bob, { trueForm: true }); else SPR[row[i][0]](row[i][1] - 24, 74 + bob); }
        /* crown on Samuel */
        var sb = Math.round(Math.sin(this.t * 4 + 2) * 2);
        px(120, 64 + sb, 16, 3, COL.gold); px(120, 60 + sb, 3, 4, COL.gold); px(126, 58 + sb, 3, 6, COL.gold); px(132, 60 + sb, 3, 4, COL.gold);
        centerTextO('THE DADDIES TAKE A BOW', 128, COL.cream, COL.black);
        centerTextO(DEDICATION, 140, COL.gold, COL.black);
        if (Math.floor(this.t * 2) % 2) centerTextO('PRESS START', 150, COL.white, COL.black);
      }
      /* confetti over everything */
      for (i = 0; i < conf.length; i++) { var p = conf[i]; px(p.x | 0, p.y | 0, p.w, p.w, p.c); }
    },
    drawStinger: function () {
      cls('#2a2436');
      centerTextO('ONE WEEK LATER...', 20, COL.gold, COL.black);
      /* a beginner freestyle class; Snobbington in the front row, hating it */
      panel(20, 40, 200, 90, COL.cream, COL.black);
      SPR.pdiddy(40, 60);
      drawText('BEGINNER FREESTYLE CLASS', 90, 52, COL.black);
      var lines = ['P DIDDY SITS IN THE FRONT ROW.', 'HE HATES IT. HE IS TERRIBLE AT IT.', 'HE IS COMING BACK NEXT WEEK.'];
      for (var i = 0; i < lines.length; i++) drawText(lines[i], 90, 74 + i * 12, COL.black);
      if (Math.floor(this.t * 2) % 2) centerText('PRESS START', 140, COL.red);
    }
  };
}
