/* 90-story.js — Act 0 cutscenes + shared story helpers + the time-machine travel hub.
   Era-specific arrivals/bosses are registered from the per-era map modules. */

/* ERAS + registerEra live in 40-map.js so era modules can self-register at load. */

/* missing battle-sprite alias (auctioneer used 'cowboy' which had no SPR) */
if (!SPR.cowboy) SPR.cowboy = SPR.jake;
/* dialogue portraits for the era-local mini-boss "characters" */
SPEAKERS['STREET ORATOR'] = { spr: SPR.orator, f: 210 };
SPEAKERS['GOSSIPING SENATOR'] = { spr: SPR.senator, f: 220 };
SPEAKERS['LEGIONARY'] = { spr: SPR.legionary, f: 190 };
SPEAKERS['TUMBLEWEED POET'] = { spr: SPR.poet, f: 230 };
SPEAKERS['CATTLE AUCTIONEER'] = { spr: SPR.cowboy, f: 175 };
SPEAKERS['SNAKE-OIL SALESMAN'] = { spr: SPR.salesman, f: 250 };
SPEAKERS['DISCO REGULAR'] = { spr: SPR.dancer, f: 262 };
SPEAKERS['THE HYPE-MAN'] = { spr: SPR.deejay, f: 240 };
SPEAKERS['ROLLER SKATER'] = { spr: SPR.skater, f: 300 };
SPEAKERS['CACKLING GOBLIN'] = { spr: SPR.goblin, f: 330 };
SPEAKERS['HEXING GOBLIN'] = { spr: SPR.goblinhex, f: 340 };
SPEAKERS['BRUTE GOBLIN'] = { spr: SPR.goblinbrute, f: 150 };
/* Second City in exile (NYC 1977) */
SPEAKERS['DEL CLOSE'] = { spr: SPR.delclose, f: 165 };
SPEAKERS['BELUSHI'] = { spr: SPR.belushi, f: 205 };
SPEAKERS['MURRAY'] = { spr: SPR.murray, f: 178 };
SPEAKERS['RAMIS'] = { spr: SPR.ramis, f: 262 };
SPEAKERS['RADNER'] = { spr: SPR.radner, f: 430 };
SPEAKERS['AYKROYD'] = { spr: SPR.aykroyd, f: 235 };

/* ---- party growth helpers ---- */
function addToParty(id, level) {
  for (var i = 0; i < Game.party.length; i++) if (Game.party[i].id === id) return Game.party[i];
  var f = makeFighter(id, level); Game.party.push(f); jingle('get'); return f;
}
function teachMove(id, moveId) {
  for (var i = 0; i < Game.party.length; i++) { var f = Game.party[i];
    if (f.id === id && f.moves.indexOf(moveId) < 0) { if (f.moves.length < 4) f.moves.push(moveId); else { f.moves.shift(); f.moves.push(moveId); } return; } }
}
function gainPart(name) { Game.parts++; jingle('get'); }

/* ---- collectibles ---- */
function collectMustache(o, flag) {
  if (hasFlag(flag)) return;
  setFlag(flag); Game.mustaches++; sfx('sparkle');
  var hint = Game.mustaches >= 12 ? "THAT'S ALL 12! SEE BABBAGE IN LONDON." : 'BABBAGE TRADES THESE FOR FINE DRIP.';
  say([['NARRATOR', 'A GOLDEN MUSTACHE! ( ' + Game.mustaches + ' / 12 )'], ['NARRATOR', hint]]);
}

/* ---- Golden Mustache exchange: milestones of Drip, capped by the TRUE MUSTACHE ---- */
var MUSTACHE_REWARDS = [
  { n: 3, drip: 'heartlocket', flag: 'mus_r3' },
  { n: 6, drip: 'laurelband', flag: 'mus_r6' },
  { n: 9, drip: 'discogoggle', flag: 'mus_r9' },
  { n: 12, drip: 'truestache', flag: 'mus_r12' }
];
/* returns true (and plays a cutscene) if Babbage handed over a reward */
function babbageMustacheTrade() {
  var earned = [];
  for (var i = 0; i < MUSTACHE_REWARDS.length; i++) { var r = MUSTACHE_REWARDS[i];
    if (Game.mustaches >= r.n && !hasFlag(r.flag)) earned.push(r); }
  if (earned.length === 0) return false;
  var got12 = false, steps = [{ say: ['BABBAGE', 'GOLDEN MUSTACHES! LET ME SEE...'] }];
  for (var j = 0; j < earned.length; j++) { var rr = earned[j];
    steps.push({ do: (function (r) { return function () { setFlag(r.flag); giveDrip(r.drip); }; })(rr) });
    steps.push({ narr: 'GOT ' + DRIP[rr.drip].name + '! (EQUIP IT IN PARTY)' });
    if (rr.n === 12) got12 = true;
  }
  if (got12) {
    steps.push({ say: ['BABBAGE', 'ALL TWELVE. REMARKABLE, MASTER SAMUEL.'] });
    steps.push({ do: function () { setFlag('all_mustaches'); setFlag('understudy_unlocked'); } });
  }
  Cutscene.play(steps, { onDone: function () { if (got12) mustacheBonusScene(); else gotoWorld(); } });
  return true;
}
/* Babbage's cart: try the mustache trade first, else open his shop */
function babbageTalk(inv, title) {
  if (babbageMustacheTrade()) return;
  setScene(makeShop(inv, World, title));
}
/* the all-12 bonus scene (comedy) + the superboss hook */
function mustacheBonusScene() {
  Cutscene.play([
    { bg: 'manorbg' }, { music: 'finale' },
    { narr: 'THE TEAM GATHERS AROUND A DOZEN GOLDEN MUSTACHES.' },
    { say: ['WILLIAM', 'A COMPLETE SET. EXQUISITE.'] },
    { say: ['HERSCHEL', 'PUT THEM ON. ALL OF THEM. AT ONCE.'] },
    { say: ['SAMUEL', 'HERSCHEL, I AM NOT WEARING TWELVE—'] },
    { narr: 'SAMUEL WEARS ALL TWELVE MUSTACHES AT ONCE. IT IS MAGNIFICENT.' },
    { say: ['ROSALIND', 'YOU LOOK LIKE A VERY REGAL BROOM.'] },
    { say: ['BABBAGE', 'ALSO — THE TWELVE STIRRED SOMETHING'] },
    { say: ['BABBAGE', 'IN THE THEATRE BASEMENT. AN... UNDERSTUDY.'] },
    { say: ['SAMUEL', 'A COPY OF US? SEND IT MY REGARDS.'] },
    { do: function () { saveGame(false); } }
  ], { onDone: function () { gotoWorld(); } });
}
/* THE UNDERSTUDY superboss (theatre basement, unlocked by all 12 mustaches) */
function understudyFight() {
  Cutscene.play([
    { bg: 'stage' }, { music: 'boss' },
    { narr: 'IN THE BASEMENT: A BRASS AUTOMATON TRAINED ON EVERY DADDIES SHOW.' },
    { say: ['UNDERSTUDY', 'I AM THE DOWNTON DADDIES.'] },
    { say: ['UNDERSTUDY', 'I HAVE EVERY TRANSCRIPT. EVERY BAR.'] },
    { say: ['SAMUEL', 'YOU HAVE THE WORDS.'] },
    { say: ['SAMUEL', "YOU DON'T HAVE THE NEXT ONE."] },
    { battle: function () { return { enemies: [{ boss: 'understudy' }], music: 'boss', canFlee: false, bg: 'stage', crowdStart: -10 }; },
      onResult: function (r) { if (r.win) { setFlag('understudy_beaten'); Game.money += 500; } } }
  ], { onDone: function () { if (hasFlag('understudy_beaten')) understudyWin(); else gotoWorld(); } });
}
function understudyWin() {
  Cutscene.play([
    { say: ['UNDERSTUDY', 'IMPOSSIBLE. I HAD EVERY LINE.'] },
    { say: ['SAMUEL', 'EVERY LINE BUT THE ONE THAT MATTERED.'] },
    { narr: 'THE UNDERSTUDY POWERS DOWN. THE REAL THING WINS. FOREVER.' },
    { narr: 'GOT 500 SHILLINGS. AND THE ONLY BRAGGING RIGHTS THAT COUNT.' },
    { do: function () { saveGame(false); } }
  ], { onDone: function () { gotoWorld(); } });
}

/* ---- phonograph save point ---- */
function phonographInteract() {
  healParty(); saveGame(true);
  say([['NARRATOR', 'THE PHONOGRAPH CRACKLES A WARM TUNE.'],
       ['NARRATOR', 'THE PARTY IS HEALED. GAME SAVED.']]);
}

/* ---- shops ---- */
function bakersShop() { babbageTalk(SHOP_LONDON, "BABBAGE'S CART"); }

/* ---- manor Babbage guide ---- */
function manorBabbage() {
  if (babbageMustacheTrade()) return;
  if (!hasFlag('act0_tutorial')) {
    say([['BABBAGE', 'GOOD MORNING, MASTER SAMUEL. YOU'],
         ['BABBAGE', 'ALONE REMAIN IN 1889.'],
         ['BABBAGE', 'THE ENGINE IS WOUNDED. WARM UP AT'],
         ['BABBAGE', 'THE THEATRE OPEN MIC, THEN TRAVEL.']]);
  } else if (!hasFlag('rome_done')) {
    say([['BABBAGE', 'THE ENGINE CAN REACH ROME.'],
         ['BABBAGE', 'FIND THE OTHER DADDIES, ONE PER ERA.']]);
  } else {
    say([['BABBAGE', 'THE HOUSE FEELS FULLER ALREADY.'],
         ['BABBAGE', 'ONWARD, MASTER SAMUEL.']]);
  }
}

/* ---- opening cutscene (Act 0 intro) ---- */
function openingCutscene() {
  var steps = [
    { bg: 'stage' }, { music: 'manor' },
    { narr: 'LONDON, 1889. THE DOWNTON DADDIES PREPARE THEIR GREATEST SHOW.' },
    { say: ['ROSALIND', 'THE TIME ENGINE IS PURRING. TONIGHT WE TOUR ALL OF HISTORY!'] },
    { say: ['WILLIAM', 'MY HAIR IS READY. THE REST IS DETAILS.'] },
    { say: ['HERSCHEL', 'MY HIP SAYS NO. WE GO ANYWAY.'] },
    { say: ['SAMUEL', 'DADDIES! TONIGHT WE DROP THE HOTTEST BARS OF 1889!'] },
    { say: ['ROSALIND', 'WAIT. WHO PUT TEA IN THE FLUX CHAMBER?'] },
    { say: ['HERSCHEL', 'IT WAS DECAF.'] },
    { do: function () { setFlag('act0_intro'); } },
    { do: function () { playBoom(function () { Cutscene.next(); }); } },
    { bg: 'stage' },
    { narr: 'THE ENGINE OVERLOADS! THE DADDIES ARE FLUNG ACROSS TIME!' },
    { say: ['SNOBBINGTON', 'HELP! MY BEAUTIFUL DISASTER! ...I MEAN. OH DEAR.'] },
    { say: ['SAMUEL', 'MY TEAM IS GONE. MY MUSTACHE REMAINS. HOLD ON, DADDIES.'] },
    { bg: 'manorbg' },
    { narr: 'SAMUEL WAKES ALONE IN THE MANOR.' },
    { say: ['BABBAGE', 'MASTER SAMUEL! YOU LIVE. THE OTHERS'] },
    { say: ['BABBAGE', 'ARE SCATTERED ACROSS THE CENTURIES.'] },
    { say: ['BABBAGE', 'THE ENGINE IS HURT BUT NOT DEAD.'] },
    { say: ['BABBAGE', 'WARM UP AT THE THEATRE OPEN MIC.'] },
    { say: ['SAMUEL', 'THEN I RESCUE MY DADDIES. ALL OF THEM.'] }
  ];
  Cutscene.play(steps, { onDone: function () { gotoWorld(); } });
}

/* ---- tutorial battle (theatre open mic) ---- */
function tutorialCutscene() {
  var steps = [
    { narr: 'THE OPEN MIC IS PACKED. A HECKLER STANDS UP.' },
    { say: ['HECKLER', 'A ONE-DADDY SHOW? WHERE\'S YER TEAM, EH?'] },
    { say: ['SAMUEL', 'RIGHT HERE. WATCH THE HANDS. AND THE BARS.'] },
    { say: ['BABBAGE', 'CHOOSE FIGHT. MATCH TYPES ON THE WHEEL.'] },
    { say: ['BABBAGE', 'WIN THE CROWD. PRESS A ON THE BEAT FOR BONUS.'] },
    { battle: function () { return { enemies: [{ boss: 'heckler_boss' }], music: 'battle', canFlee: false, bg: 'stage', crowdStart: -10 }; },
      onResult: function () { setFlag('act0_tutorial'); setFlag('rome_unlocked'); } },
    { say: ['HECKLER', 'OKAY OKAY! YOU STILL GOT IT. SORRY, GUV.'] },
    { say: ['BABBAGE', 'THE ENGINE CAN NOW REACH ROME.'] },
    { say: ['SAMUEL', 'THEN LET\'S BRING HERSCHEL HOME.'] }
  ];
  Cutscene.play(steps, { onDone: function () { gotoWorld(); } });
}

/* ---- time machine + travel hub (shared by manor machine + era rifts) ---- */
function travelChoose(bg) {
  var dests = [];
  for (var i = 0; i < ERAS.length; i++) { var e = ERAS[i]; if (!e.unlockFlag || hasFlag(e.unlockFlag)) dests.push(e); }
  /* don't offer the era you're already in */
  dests = dests.filter(function (e) { return e.warp.to !== Game.map; });
  if (dests.length === 0) { say([['NARRATOR', 'THE ENGINE HAS NOWHERE TO GO YET.']]); return; }
  var opts = []; for (i = 0; i < dests.length; i++) opts.push(dests[i].label);
  opts.push('STAY');
  Cutscene.play([{ choice: { who: 'BABBAGE', q: 'WHERE TO, MASTER SAMUEL?', opts: opts,
    cb: function (idx) {
      if (idx >= dests.length) { gotoWorld(); return; }
      var e = dests[idx];
      playTravel(e.label, function () {
        Game.map = e.warp.to; Game.px = e.warp.tx; Game.py = e.warp.ty; Game.dir = e.warp.dir || 'down';
        saveGame(false);
        if (e.arrive && !hasFlag(e.arrivedFlag)) { setFlag(e.arrivedFlag); e.arrive(); }
        else gotoWorld();
      });
    } } }], { bg: bg || 'manorbg' });
}
function timeMachineInteract() {
  if (!hasFlag('act0_tutorial')) {
    say([['NARRATOR', 'THE TIME ENGINE SPUTTERS WEAKLY.'],
         ['BABBAGE', 'WARM UP AT THE THEATRE FIRST.']]);
    return;
  }
  travelChoose('manorbg');
}
/* era "time rift" object opens the same hub from anywhere */
function openRift() { travelChoose(BGS[curMap().riftBg] ? curMap().riftBg : 'black'); }

/* ---- new game / continue ---- */
function newGame(slot) {
  Game.slot = slot || Game.slot || 1;
  Game.party = [makeFighter('samuel', 1)];
  Game.activeIdx = 0; Game.flags = {}; Game.items = {}; Game.drip = {};
  Game.money = 30; Game.mustaches = 0; Game.parts = 0;
  Game.map = 'manor'; Game.px = 7; Game.py = 9; Game.dir = 'up'; Game.playtime = 0; Game.started = true;
  Game.checkpoint = { map: 'manor', px: 7, py: 9, dir: 'up' };
  giveItem('earlgrey', 3); giveItem('lozenge', 1);
  /* clear any per-map cached entry flags */
  for (var k in Maps) Maps[k]._entered = false;
  gotoWorld();
}
function continueGame(slot) { if (loadGame(slot)) gotoWorld(); else newGame(slot); }

/* ---- DEV: visit any era to test its level (title screen, behind SELECT) ----
   Each visit recreates the party/flags/items for THAT point in the story, so
   joins, arrival cutscenes, and bosses all behave naturally. */
function debugParty(ids, level) {
  Game.party = [];
  for (var i = 0; i < ids.length; i++) Game.party.push(makeFighter(ids[i], level));
  Game.activeIdx = 0; Game.money = 200; Game.mustaches = 0;
  Game.items = { earlgrey: 5, strongtea: 3, crumpet: 2, sparestache: 2, lozenge: 3 };
  Game.drip = {}; Game.playtime = 0; Game.started = true;
  setFlag('act0_intro'); /* never replay the opening in dev */
  for (var k in Maps) Maps[k]._entered = false;
}
var DEV_VISITS = [
  { label: 'LONDON ACT 0', era: 'act0' },
  { label: 'ROME', era: 'rome' },
  { label: 'OLD WEST', era: 'dodge' },
  { label: 'DODGE CITY (POST-TRAIN)', era: 'dodgecity' },
  { label: 'NEW YORK', era: 'nyc' },
  { label: 'GOBLIN REALM', era: 'goblin' },
  { label: 'LONDON FINALE', era: 'finale' }
];
function debugVisit(era) {
  Game.slot = 'dev'; /* keep dev auto-saves away from the 4 real slots */
  Game.flags = {};
  var F = function (list) { for (var i = 0; i < list.length; i++) setFlag(list[i]); };
  if (era === 'act0') {           /* solo lv1: tutorial + manor testable from scratch */
    debugParty(['samuel'], 1);
    Game.parts = 0;
    Game.map = 'manor'; Game.px = 7; Game.py = 9; Game.dir = 'up';
  } else if (era === 'rome') {    /* arrival cutscene + Herschel join play naturally */
    debugParty(['samuel'], 4);
    F(['act0_tutorial', 'rome_unlocked']); Game.parts = 0;
    Game.map = 'forum'; Game.px = 8; Game.py = 9; Game.dir = 'up';
  } else if (era === 'dodge') {   /* the full era from the desert spawn */
    debugParty(['samuel', 'herschel'], 7);
    F(['act0_tutorial', 'rome_unlocked', 'rome_arrived_seen', 'rome_done', 'maximvs_beaten', 'herschel_joined', 'dodge_unlocked']);
    Game.parts = 1;
    Game.map = 'desertspawn'; Game.px = 3; Game.py = 4; Game.dir = 'right';
  } else if (era === 'dodgecity') { /* skip the train: William joins on the platform */
    debugParty(['samuel', 'herschel'], 7);
    F(['act0_tutorial', 'rome_unlocked', 'rome_arrived_seen', 'rome_done', 'maximvs_beaten', 'herschel_joined',
       'dodge_unlocked', 'west_arrived_seen', 'drygulch_seen', 'train_at_station', 'ticket_bought',
       'train_departed', 'robbery_started', 'train_robbery_done', 'train_arrived']);
    Game.parts = 1;
    Game.map = 'mainstreet'; Game.px = 8; Game.py = 2; Game.dir = 'down';
  } else if (era === 'nyc') {     /* Second City chain; Rosalind joins in the disco */
    debugParty(['samuel', 'herschel', 'william'], 10);
    F(['act0_tutorial', 'rome_unlocked', 'rome_arrived_seen', 'rome_done', 'maximvs_beaten', 'herschel_joined',
       'dodge_unlocked', 'west_arrived_seen', 'drygulch_seen', 'train_at_station', 'ticket_bought',
       'train_departed', 'robbery_started', 'train_robbery_done', 'train_arrived', 'dodge_city_reached',
       'dodge_press', 'dodge_done', 'jake_beaten', 'william_joined', 'nyc_unlocked']);
    Game.parts = 2;
    Game.map = 'wellsstreet'; Game.px = 12; Game.py = 6; Game.dir = 'up';
  } else if (era === 'goblin') {  /* plays the Rex outro -> malfunction -> arrival chain */
    debugParty(['samuel', 'herschel', 'william', 'rosalind'], 11);
    F(['act0_tutorial', 'rome_unlocked', 'rome_arrived_seen', 'rome_done', 'maximvs_beaten', 'herschel_joined',
       'dodge_unlocked', 'west_arrived_seen', 'drygulch_seen', 'train_at_station', 'ticket_bought',
       'train_departed', 'robbery_started', 'train_robbery_done', 'train_arrived', 'dodge_city_reached',
       'dodge_press', 'dodge_done', 'jake_beaten', 'william_joined',
       'nyc_unlocked', 'nyc_arrived_seen', 'nyc_done', 'rex_beaten', 'rosalind_joined',
       'sc_password', 'sc_inside', 'sc_briefed', 'sc_elevator_key']);
    Game.parts = 3;
    Game.map = 'rooftop'; Game.px = 6; Game.py = 6; Game.dir = 'up';
    nycVictory(); return;
  } else {                        /* finale: full level from the occupied district */
    debugParty(['samuel', 'herschel', 'william', 'rosalind'], 14);
    F(['act0_tutorial', 'rome_arrived_seen', 'rome_done', 'herschel_joined', 'west_arrived_seen', 'drygulch_seen', 'train_at_station', 'ticket_bought',
       'train_departed', 'robbery_started', 'train_robbery_done', 'train_arrived', 'dodge_city_reached', 'dodge_press', 'dodge_done',
       'william_joined', 'nyc_arrived_seen', 'nyc_done', 'rosalind_joined', 'sc_password', 'sc_inside', 'sc_briefed', 'sc_elevator_key', 'goblin_arrived', 'goblin_done',
       'pedro_beaten', 'london_unlocked', 'trueform']);
    Game.parts = 4;
    Game.party[0].moves = ['humblebrag', 'punchline', 'hattip', 'nomoredis'];
    Game.map = 'theatredistrict'; Game.px = 9; Game.py = 5; Game.dir = 'up';
  }
  gotoWorld();
}
