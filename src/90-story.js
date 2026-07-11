/* 90-story.js — Act 0 cutscenes + shared story helpers + the time-machine travel hub.
   Era-specific arrivals/bosses are registered from the per-era map modules. */

/* ERAS + registerEra live in 40-map.js so era modules can self-register at load. */

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
  say([['NARRATOR', 'A GOLDEN MUSTACHE! ( ' + Game.mustaches + ' / 12 )'],
       ['NARRATOR', 'BABBAGE TRADES THESE FOR FINE DRIP.']]);
}

/* ---- phonograph save point ---- */
function phonographInteract() {
  healParty(); saveGame(true);
  say([['NARRATOR', 'THE PHONOGRAPH CRACKLES A WARM TUNE.'],
       ['NARRATOR', 'THE PARTY IS HEALED. GAME SAVED.']]);
}

/* ---- shops ---- */
function bakersShop() { setScene(makeShop(SHOP_LONDON, World, "BABBAGE'S CART")); }

/* ---- manor Babbage guide ---- */
function manorBabbage() {
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
function newGame() {
  Game.party = [makeFighter('samuel', 1)];
  Game.activeIdx = 0; Game.flags = {}; Game.items = {}; Game.drip = {};
  Game.money = 30; Game.mustaches = 0; Game.parts = 0;
  Game.map = 'manor'; Game.px = 7; Game.py = 9; Game.dir = 'up'; Game.playtime = 0; Game.started = true;
  giveItem('earlgrey', 3); giveItem('lozenge', 1);
  /* clear any per-map cached entry flags */
  for (var k in Maps) Maps[k]._entered = false;
  gotoWorld();
}
function continueGame() { if (loadGame()) gotoWorld(); else newGame(); }

/* ---- DEV: skip straight to late-game states (title screen, behind SELECT) ---- */
function debugParty(level) {
  Game.party = [makeFighter('samuel', level), makeFighter('herschel', level), makeFighter('william', level), makeFighter('rosalind', level)];
  Game.activeIdx = 0; Game.money = 200; Game.mustaches = 0; Game.parts = 3;
  Game.items = { earlgrey: 5, strongtea: 3, crumpet: 2, sparestache: 2, lozenge: 3 };
  Game.drip = {}; Game.playtime = 0; Game.started = true;
  ['act0_intro', 'act0_tutorial', 'rome_unlocked', 'rome_arrived_seen', 'rome_done', 'maximvs_beaten', 'herschel_joined',
   'dodge_unlocked', 'dodge_arrived_seen', 'dodge_done', 'jake_beaten', 'william_joined',
   'nyc_unlocked', 'nyc_arrived_seen', 'nyc_done', 'rex_beaten', 'rosalind_joined'].forEach(function (f) { setFlag(f); });
  for (var k in Maps) Maps[k]._entered = false;
}
function debugSkip(where) {
  Game.flags = {};
  if (where === 'goblin') {
    /* start exactly at the end of the NYC (Rex) boss fight: plays the mirror-ball
       donation + the engine-malfunction cutscenes, then lands in the Goblin Realm */
    debugParty(11);
    Game.map = 'rooftop'; Game.px = 6; Game.py = 6; Game.dir = 'up';
    nycVictory();
  } else { /* finale (already revealed, at the theatre) */
    debugParty(14);
    ['goblin_done', 'london_unlocked', 'trueform', 'editor1_beaten', 'editor2_beaten', 'lobby_clear'].forEach(function (f) { setFlag(f); });
    Game.parts = 3;
    Game.party[0].moves = ['humblebrag', 'punchline', 'hattip', 'nomoredis'];
    Game.map = 'finalstage'; Game.px = 7; Game.py = 11; Game.dir = 'up'; /* onEnter starts Snobbington */
    gotoWorld();
  }
}
