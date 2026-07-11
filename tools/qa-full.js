/* qa-full.js — THE full headless critical-path playthrough:
   Act0 -> Rome -> Dodge -> NYC -> Finale -> Birthday, walking every map, fighting
   every mandatory battle, using the real travel hub. Party is topped to on-curve
   levels at each era boundary (stands in for the grinding a real player does; the
   balance sweep validates that on-curve fights are winnable-not-free). */
const Q = require('./qa.js');
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, walkStep, autoBattle, interactAt, walkToNextMap, trek, pickTravel, sceneName } = Q;
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
const h = loadGame(); const { G } = h;
function levelParty(n) { G.Game.party.forEach(f => { const nf = G.makeFighter(f.id, n); f.level = n; f.maxHP = nf.maxHP; f.baseFLOW = nf.baseFLOW; f.basePOISE = nf.basePOISE; f.baseTEMPO = nf.baseTEMPO; f.hp = f.maxHP; f.fainted = false; f.moves = nf.moves.slice(); }); G.giveItem('strongtea', 12); /* stands in for shopping */ }
function useMachineTo(needle) { walkTo(h, 7, 2); interactAt(h, 7, 1); pickTravel(h, needle); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'travel ' + needle); }
function enterBossMap(target) { const w = G.curMap().warps.find(w => w.to === target); walkTo(h, w.x, w.y); advanceUntil(h, isBattle, 8000, 'boss ' + target); }
/* run fn on the last map of route; if a wipe respawned us elsewhere, re-trek + retry */
function onMap(route, fn, tries) {
  const target = route[route.length - 1];
  for (let a = 0; a < (tries || 5); a++) {
    if (G.Game.map !== target && !trek(h, route)) continue;
    if (fn() !== false) return true;
  }
  return false;
}
/* trek to a boss map and beat the boss, re-trekking after any wipe-respawn */
function beatBoss(route, bossMap, bossId, tries) {
  for (let a = 0; a < (tries || 6); a++) {
    if (!trek(h, route)) continue;
    enterBossMap(bossMap);
    assert(isBattle(G) && G.getScene().enemies[0].bossId === bossId, bossId + ' fight');
    if (autoBattle(h, { onBeat: true }).win) return true;
    advanceUntil(h, isWorld, 8000, 'respawn after ' + bossId + ' wipe');
  }
  return false;
}

console.log('FULL PLAYTHROUGH QA');

// ---- Act 0 ----
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000, 'opening');
walkTo(h, 7, 11); advanceUntil(h, isWorld, 3000);        // manor -> bakersrow
walkTo(h, 1, 4); advanceUntil(h, g => isWorld(g) || isBattle(g), 4000); // -> theatre tutorial
if (isBattle(G)) autoBattle(h, { onBeat: true });
advanceUntil(h, isWorld, 4000);
assert(G.hasFlag('act0_tutorial') && G.hasFlag('rome_unlocked'), 'Act 0 tutorial done');
ok('ACT 0: opening, walked 3 maps, tutorial battle won');

// back to manor
walkToNextMap(h, 'bakersrow'); walkToNextMap(h, 'manor');
assert(G.Game.map === 'manor', 'back at manor');

// ---- Rome (Colosseum maze) ----
levelParty(6);
useMachineTo('ROME');
assert(G.Game.map === 'forum', 'in Rome forum, got ' + G.Game.map);
const MAZE = ['forum', 'grounds', 'arcades', 'hypogeum'];
assert(trek(h, MAZE), 'reach hypogeum');
assert(onMap(MAZE, () => {                                  // OBJECTIVE 1: Herschel
  walkTo(h, 14, 2); if (G.Game.map !== 'hypogeum') return false;
  interactAt(h, 14, 1); advanceUntil(h, isWorld, 6000);
  return G.Game.party.length === 2 && G.Game.party[1].id === 'herschel';
}), 'Herschel joined (KITCHEN PASS)');
assert(onMap(MAZE, () => {                                  // capstan puzzle
  walkTo(h, 5, 8); if (G.Game.map !== 'hypogeum') return false;
  interactAt(h, 6, 8); advanceUntil(h, isWorld, 4000);
  return G.hasFlag('rome_capstan');
}), 'beast lift raised');
levelParty(7);
const TO_GATE = ['forum', 'grounds', 'arcades', 'hypogeum', 'stands', 'gateoflife'];
assert(beatBoss(TO_GATE, 'arena', 'maximvs'), 'buffed Maximvs beaten');  // OBJECTIVE 2
pickTravel(h, 'OLD WEST'); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'to the old west');
assert(G.hasFlag('rome_done') && G.Game.parts >= 1, 'Rome complete, part 1');
ok('ROME MAZE: Herschel + pass, capstan, Gate of Life, buffed Maximvs, Flux Gear');

// ---- The Old West: desert -> Dry Gulch -> the 3:10 to Dodge ----
assert(G.Game.map === 'desertspawn', 'in the High Desert, got ' + G.Game.map);
levelParty(8);
assert(trek(h, ['desertspawn', 'drygulch', 'station']), 'reach Dry Gulch station');
// boarding is gated on a ticket: try broke, get turned away
G.Game.money = 10;
walkTo(h, 7, 3); h.step(2, 20); walkStep(h, 'up'); advanceUntil(h, isWorld, 4000, 'no-ticket turnaway');
assert(G.Game.map === 'station' && !G.hasFlag('ticket_bought'), 'boarding blocked without a ticket');
// the stationmaster refuses a broke daddy, the porter pays for honest work
walkTo(h, 11, 5); interactAt(h, 11, 4); pickTravel(h, 'BUY TICKET'); advanceUntil(h, isWorld, 4000, 'too broke');
assert(!G.hasFlag('ticket_bought'), 'no sale at 10 shillings');
const moneyBefore = G.Game.money;
walkTo(h, 3, 5); interactAt(h, 3, 6); advanceUntil(h, isWorld, 4000, 'porter chore');
assert(G.Game.money === moneyBefore + 8, 'porter chore pays 8');
// now buy it for real
G.Game.money = 40;
walkTo(h, 11, 5); interactAt(h, 11, 4); pickTravel(h, 'BUY TICKET'); advanceUntil(h, isWorld, 4000, 'ticket bought');
assert(G.hasFlag('ticket_bought') && G.Game.money === 15, 'ticket bought for 25');
// board: departure scene + train ride animation
walkTo(h, 7, 3); h.step(2, 20); walkStep(h, 'up'); advanceUntil(h, isWorld, 12000, 'the 3:10 departs');
assert(G.Game.map === 'traincar' && G.hasFlag('train_departed'), 'aboard and rolling');
// the conductor will not stop while the Order robs his mail
walkTo(h, 2, 3); interactAt(h, 1, 3); advanceUntil(h, isWorld, 4000, 'conductor refuses');
assert(!G.hasFlag('train_arrived'), 'no stop before the robbery is handled');
// side quest: the seat 4B granny duel
interactAt(h, 2, 2); advanceUntil(h, g => isBattle(g), 6000, 'granny seat duel'); autoBattle(h, { onBeat: true });
advanceUntil(h, isWorld, 5000, 'granny beaten');
assert(G.hasFlag('q_granny'), 'seat 4B settled with bars');
// the required task: the Great Metaphor Robbery (2-enemy battle in the mail car)
walkToNextMap(h, 'baggagecar');
if (!G.hasFlag('train_robbery_done')) { advanceUntil(h, g => isBattle(g), 8000, 'robbery'); autoBattle(h, { onBeat: true }); advanceUntil(h, isWorld, 6000, 'robbery done'); }
assert(G.hasFlag('train_robbery_done'), 'Great Metaphor Robbery foiled');
// the relocated mustache hides behind the crates
walkTo(h, 10, 5); advanceUntil(h, isWorld, 4000, 'mail car mustache');
assert(G.hasFlag('stache_dodge') && G.Game.mustaches >= 1, 'mail-car mustache collected');
// tell the conductor -> arrival animation -> Dodge City, where William joins
assert(trek(h, ['baggagecar', 'traincar']), 'back to the passenger car');
walkTo(h, 2, 3); interactAt(h, 1, 3); advanceUntil(h, isWorld, 15000, 'pull into Dodge');
assert(G.Game.map === 'mainstreet', 'arrived at Front Street, got ' + G.Game.map);
assert(G.Game.party.length === 3 && G.Game.party[2].id === 'william', 'William joined on arrival');
ok('OLD WEST: desert, Dry Gulch, ticket gate, porter chore, the 3:10, granny duel, robbery foiled, William joins');

// ---- Dodge City: the saloon is gated on the press ----
levelParty(10);
walkTo(h, 6, 5); h.step(2, 20); walkStep(h, 'up'); advanceUntil(h, isWorld, 4000, 'saloon barred');
assert(G.Game.map === 'mainstreet' && !G.hasFlag('dodge_press'), 'saloon barred before the press falls');
assert(onMap(['mainstreet', 'dustytrail', 'silvermine'], () => {
  walkTo(h, 7, 2); if (G.Game.map !== 'silvermine') return false;
  interactAt(h, 7, 3); advanceUntil(h, g => isBattle(g), 6000, 'press battle'); autoBattle(h, { onBeat: true });
  advanceUntil(h, isWorld, 6000, 'press down');
  return G.hasFlag('dodge_press');
}), 'press destroyed -> saloon opens');
assert(beatBoss(['silvermine', 'dustytrail', 'mainstreet'], 'saloon', 'jake'), 'Jake beaten'); // Jake on onEnter
pickTravel(h, 'NEW YORK'); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'to nyc');
assert(G.hasFlag('dodge_done') && G.Game.parts >= 2, 'Dodge complete, part 2');
ok('DODGE CITY: press gate, Jake down, Chrono Coil');

// ---- New York ----
assert(G.Game.party.length === 4 && G.Game.party[3].id === 'rosalind', 'Rosalind joined on arrival');
const nycStart = G.Game.map;
levelParty(13);
// traverse the NYC chain dynamically (map ids from the era file)
const nycChain = [G.Game.map];
{ let cur = G.Game.map, seen = {}; while (cur && !seen[cur]) { seen[cur] = 1; const m = G.Maps[cur]; const nxt = m.warps.find(w => !seen[w.to] && ['clubinferno','boilerroom','rooftop'].includes(w.to)); if (!nxt) break; nycChain.push(nxt.to); cur = nxt.to; } }
assert(beatBoss(nycChain.slice(0, -1), nycChain[nycChain.length - 1], 'rex'), 'Rex beaten'); // Rex on onEnter
// after Rex: nycVictory -> the engine malfunctions -> stranded in the Goblin Realm
advanceUntil(h, isWorld, 14000, 'to goblin realm');
assert(G.Game.map === 'goblinrealm', 'stranded in the Goblin Realm, got ' + G.Game.map);
assert(G.hasFlag('nyc_done') && !G.hasFlag('london_unlocked'), 'London NOT unlocked until the engine is fixed');
ok('NYC: Rex down, Time Crystal -> engine malfunction -> Goblin Realm');

// ---- Goblin Realm: Pedro + the mid-battle wig reveal ----
levelParty(13);
let pedroWin = false;
for (let att = 0; att < 6 && !pedroWin; att++) {            // respawn checkpoint is this same map
  walkTo(h, 8, 2); interactAt(h, 8, 1);                     // talk to Pedro -> fight
  advanceUntil(h, isBattle, 6000, 'pedro');
  assert(isBattle(G) && G.getScene().enemies[0].bossId === 'pedro', 'Pedro fight');
  if (autoBattle(h, { onBeat: true }).win) pedroWin = true;  // includes the mid-fight wig reveal interrupt
  else advanceUntil(h, isWorld, 8000, 'respawn after pedro wipe');
}
assert(pedroWin, 'Pedro beaten');
assert(G.hasFlag('trueform'), 'the wig fell -> True Form mid-battle');
assert(G.Game.party[0].moves.includes('nomoredis'), 'learned NO MORE DISGUISE at the reveal');
advanceUntil(h, isWorld, 12000, 'to london');              // pedroAfter (number/spark) -> travel to London
assert(G.hasFlag('goblin_done') && G.hasFlag('london_unlocked'), 'engine repaired, London unlocked');
assert(G.Game.map === 'theatredistrict', 'arrived at theatre district, got ' + G.Game.map);
ok('GOBLIN REALM: Pedro, EXTREMELY-shocked wig reveal, True Form, number-spark fix');

// ---- Finale (Samuel already True Form) ----
levelParty(15);
function editorFight(x, y) {
  for (let att = 0; att < 5; att++) {                       // respawn checkpoint is theatredistrict
    walkTo(h, x, y + 1); if (G.Game.map !== 'theatredistrict') continue;
    interactAt(h, x, y); advanceUntil(h, g => isWorld(g) || isBattle(g), 3000);
    if (isBattle(G)) { if (!autoBattle(h, {}).win) { advanceUntil(h, isWorld, 6000); continue; } advanceUntil(h, isWorld, 3000); }
    return true;
  }
  return false;
}
assert(editorFight(8, 3) && editorFight(9, 3) && G.hasFlag('lobby_clear'), 'editors cleared');
let snobDone = false;
for (let att = 0; att < 6 && !snobDone; att++) {            // a wipe in either phase -> walk back, refight both
  walkTo(h, 9, 1); advanceUntil(h, isBattle, 6000, 'snob1');
  assert(isBattle(G) && G.getScene().enemies[0].bossId === 'snob1', 'Snobbington phase 1');
  if (!autoBattle(h, { onBeat: true }).win) { advanceUntil(h, isWorld, 8000, 'respawn after snob1 wipe'); continue; }
  advanceUntil(h, isBattle, 8000, 'snob2');                 // snobEscalate bridge -> FINAL DRAFT
  assert(G.getScene().enemies[0].bossId === 'snob2' && G.getScene().crowd >= 100, 'phase 2 + crowd 100');
  if (!autoBattle(h, { onBeat: true }).win) { advanceUntil(h, isWorld, 8000, 'respawn after snob2 wipe'); continue; }
  snobDone = true;
}
assert(snobDone, 'both Snobbington phases beaten');
advanceUntil(h, isWorld, 10000, 'p diddy unmask -> HQ');  // -> control returns near HQ
assert(G.Game.map === 'bakersrow' && G.hasFlag('finale_done') && !G.hasFlag('game_complete'), 'unmask done -> must walk home to HQ');
walkTo(h, 9, 1);                                          // into the manor (HQ) -> surprise party + 50 Cent
let guard = 0; while (!(G.getScene() && G.getScene().phase === 'credits') && guard++ < 500) { h.tap('a'); h.step(3, 25); }
assert(G.hasFlag('game_complete'), 'game_complete after the surprise party');
assert(G.getScene() && (G.getScene().phase === 'credits' || G.getScene().phase === 'bow'), 'birthday sequence');
ok('FINALE: Snobbington solo, P Diddy unmask, walk home -> surprise party + 50 Cent, birthday');
// the new finale beats are present verbatim
const dist = require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'index.html'), 'utf8');
assert(dist.indexOf('MEDDLING DADDIES') >= 0, 'P Diddy Scooby-Doo line present');
assert(dist.indexOf("50 CENT") >= 0 && dist.indexOf('FROM THE FUTURE') >= 0, '50 Cent future-mission hook present');
assert(dist.indexOf('PEDRO GARCIA') >= 0 && dist.indexOf("MEXICO'S INDEPENDENCE FROM THE US") >= 0, "Pedro's bio verbatim");
ok('new story beats present verbatim (P Diddy, 50 Cent, Pedro bio)');

// ---- save/load mid-nothing roundtrip on final state ----
G.saveGame(true); const parts = G.Game.parts; G.Game.parts = 0; assert(G.loadGame() && G.Game.parts === parts, 'save/load roundtrip');
ok('save/load roundtrip on completed game');

console.log('\nFULL PLAYTHROUGH QA PASSED — ' + PASS + ' checks. ✔  (parts=' + G.Game.parts + ')');
