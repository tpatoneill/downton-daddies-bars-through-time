/* qa-phase2.js — Rome playthrough (overhauled "Day of the Games" maze):
   travel via machine -> festival forum -> grounds -> arcades -> hypogeum ->
   OBJECTIVE 1: Herschel (KITCHEN PASS) -> capstan puzzle -> stands ->
   Gate of Life -> OBJECTIVE 2: arena -> buffed Maximvs -> rewards. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, walkToNextMap, trek, sceneName } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

const h = loadGame(); const { G } = h;
console.log('PHASE 2 QA — Rome (Colosseum maze)');

// fast path through Act 0
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000, 'opening');
G.setFlag('act0_tutorial'); G.setFlag('rome_unlocked');
ok('reached manor, post-tutorial state set');

// time machine -> Rome (fight-day arrival cutscene)
walkTo(h, 7, 2); interactAt(h, 7, 1);
advanceUntil(h, isWorld, 8000, 'travel to rome');
assert(G.Game.map === 'forum', 'arrived in festival forum, got ' + G.Game.map);
ok('time machine -> Rome, Day of the Games');

// grind stand-in + tea from Babbage's cart (a wipe now respawns at the forum
// checkpoint, so the walker heals like a real player and re-treks if wiped)
G.Game.party[0] = G.makeFighter('samuel', 6);
G.giveItem('strongtea', 12);
const MAZE = ['forum', 'grounds', 'arcades', 'hypogeum'];
assert(trek(h, MAZE), 'reach hypogeum');
ok('forum -> grounds -> arcades -> hypogeum (the maze)');

// lift locked; capstan needs two people
walkTo(h, 5, 8); interactAt(h, 6, 8);
let g = 0; while (G.getScene() === G.Cutscene && g++ < 20) { h.tap('a'); h.step(2, 20); }
assert(!G.hasFlag('rome_capstan'), 'capstan needs Herschel');
ok('capstan too stiff before Herschel (gate intact)');

// OBJECTIVE 1: Herschel in the kitchens
walkTo(h, 14, 2); interactAt(h, 14, 1);
advanceUntil(h, isWorld, 6000, 'herschel join');
assert(G.hasFlag('herschel_joined') && G.Game.party.length === 2 && G.Game.party[1].id === 'herschel', 'Herschel joined');
ok('OBJECTIVE 1: Herschel found -> KITCHEN PASS');

// stew sidequest while we're in the kitchens
walkTo(h, 14, 2); interactAt(h, 15, 2);
advanceUntil(h, gg => isWorld(gg) || isBattle(gg), 3000, 'stew');
if (isBattle(G)) { autoBattle(h, {}); }
advanceUntil(h, isWorld, 3000);
assert(G.hasFlag('rome_medal'), 'medal sidequest complete');
ok('stew sidequest -> medal + drip');

// capstan with Herschel -> lift raised
walkTo(h, 5, 8); interactAt(h, 6, 8);
advanceUntil(h, isWorld, 4000, 'capstan');
assert(G.hasFlag('rome_capstan'), 'beast lift raised');
ok('capstan puzzle solved (both hips)');

// on-curve for the buffed boss
G.Game.party.forEach(f => { const n = G.makeFighter(f.id, 7); f.level = 7; f.maxHP = n.maxHP; f.hp = n.maxHP; f.baseFLOW = n.baseFLOW; f.basePOISE = n.basePOISE; f.baseTEMPO = n.baseTEMPO; f.moves = n.moves.slice(); });

// OBJECTIVE 2: lift -> stands -> Gate of Life -> arena (re-trek after any wipe)
const TO_GATE = ['forum', 'grounds', 'arcades', 'hypogeum', 'stands', 'gateoflife'];
assert(trek(h, TO_GATE), 'reach Gate of Life');
ok('OBJECTIVE 2: lift -> stands -> Gate of Life');
let mxWin = false;
for (let att = 0; att < 6 && !mxWin; att++) {
  assert(trek(h, TO_GATE), 'back to Gate of Life (attempt ' + (att + 1) + ')');
  walkTo(h, 4, 1); // stepping onto the gated warp (pass in hand) -> arena -> Maximvs
  advanceUntil(h, isBattle, 8000, 'maximvs');
  assert(isBattle(G) && G.getScene().enemies[0].bossId === 'maximvs', 'Maximvs fight');
  assert(G.getScene().enemies[0].maxHP >= 180, 'Maximvs is buffed (' + G.getScene().enemies[0].maxHP + ' HP)');
  if (autoBattle(h, { onBeat: true }).win) mxWin = true;
  else advanceUntil(h, isWorld, 8000, 'respawn after maximvs wipe');
}
assert(mxWin, 'beat buffed Maximvs within 6 attempts');
ok('arena -> buffed Maximvs defeated');
g = 0; while (g++ < 300 && !(G.getScene() === G.Cutscene && G.getScene().mode === 'choice')) { h.tap('a'); h.step(2, 25); }
assert(G.hasFlag('maximvs_beaten') && G.hasFlag('rome_done') && G.Game.parts >= 1, 'Rome complete');
assert(G.hasFlag('dodge_unlocked'), 'Dodge unlocked');
assert(G.Game.party[1].moves.indexOf('bothhips') >= 0, 'Herschel learned BOTH HIPS');
ok('Maximvs defeated -> Flux Gear, Both Hips, Dodge unlocked');

console.log('\nPHASE 2 QA PASSED — ' + PASS + ' checks. ✔');
