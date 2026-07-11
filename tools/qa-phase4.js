/* qa-phase4.js — finale playthrough: assemble full party -> theatre district ->
   clear both Editors -> Snobbington phase 1 -> THE REVEAL + True Form -> phase 2 ->
   finale_done -> birthday sequence with LANE ALLISON. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, sceneName } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

const h = loadGame(); const { G } = h;
console.log('PHASE 4 QA — Finale + Birthday');

// boot into a new game, advance opening
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000, 'opening');

// assemble the full, leveled party + finale-ready flags. Samuel is ALREADY in True
// Form here (the reveal happened back in the Goblin Realm), so give her nomoredis.
G.Game.party = [G.makeFighter('samuel', 15), G.makeFighter('herschel', 15), G.makeFighter('william', 15), G.makeFighter('rosalind', 15)];
['act0_tutorial', 'rome_done', 'dodge_done', 'nyc_done', 'goblin_done', 'london_unlocked', 'trueform',
 'herschel_joined', 'william_joined', 'rosalind_joined', 'pedro_beaten'].forEach(f => G.setFlag(f));
G.Game.party[0].moves = ['humblebrag', 'punchline', 'hattip', 'nomoredis'];
ok('assembled full party (all 4 Daddies, lv15), Samuel already True Form');

// jump to the theatre district and trigger arrival
G.Game.map = 'theatredistrict'; G.Game.px = 9; G.Game.py = 5; G.Game.dir = 'up'; G.setScene(G.World);
advanceUntil(h, isWorld, 5000, 'finale arrival');
assert(G.Game.map === 'theatredistrict', 'in theatre district');
ok('arrived at occupied theatre district');

// clear both Editors (block the stage-door corridor)
walkTo(h, 8, 4); interactAt(h, 8, 3);
advanceUntil(h, g => isWorld(g) || isBattle(g), 3000, 'editor1');
if (isBattle(G)) { const r = autoBattle(h, { onBeat: true }); assert(r.win, 'beat editor 1'); }
advanceUntil(h, isWorld, 3000);
walkTo(h, 9, 4); interactAt(h, 9, 3);
advanceUntil(h, g => isWorld(g) || isBattle(g), 3000, 'editor2');
if (isBattle(G)) { const r = autoBattle(h, { onBeat: true }); assert(r.win, 'beat editor 2'); }
advanceUntil(h, isWorld, 3000);
assert(G.hasFlag('editor1_beaten') && G.hasFlag('editor2_beaten'), 'both editors beaten');
assert(G.hasFlag('lobby_clear'), 'stage door unlocked');
ok('cleared the Editor gauntlet');

// walk to the stage door -> final stage -> Snobbington phase 1
walkTo(h, 9, 1); advanceUntil(h, g => isWorld(g) || isBattle(g) || sceneName(g) === 'cutscene', 5000, 'to stage');
advanceUntil(h, isBattle, 6000, 'snob phase 1');
assert(isBattle(G), 'Snobbington phase 1 started');
const p1 = G.getScene();
assert(p1.enemies[0].bossId === 'snob1' && p1.enemies.length === 3, 'snob1 + 2 goons');
autoBattle(h, { onBeat: true });
ok('Snobbington phase 1 (with two goons) defeated');

// Snobbington escalates (no Samuel reveal here — she's already True Form) -> phase 2
advanceUntil(h, isBattle, 8000, 'escalate + phase 2');
const p2 = G.getScene();
assert(p2.enemies[0].bossId === 'snob2', 'phase 2 is FINAL DRAFT');
assert(p2.crowd >= 100, 'crowd slammed to +100 in her favor (' + p2.crowd + ')');
autoBattle(h, { onBeat: true });
ok('Snobbington phase 2 (FINAL DRAFT) defeated');

// P Diddy unmask + 50 Cent hook -> birthday sequence
let guard = 0;
while (!(G.getScene() && G.getScene().phase === 'credits') && guard++ < 400) { h.tap('a'); h.step(3, 25); }
assert(G.hasFlag('finale_done'), 'finale_done flag set');
assert(G.hasFlag('game_complete'), 'game_complete flag set');
const bd = G.getScene();
assert(bd && (bd.phase === 'credits' || bd.phase === 'bow'), 'birthday sequence reached (phase ' + (bd && bd.phase) + ')');
ok('birthday sequence reached');
// config + new finale beats present
const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'dist', 'index.html'), 'utf8');
assert(src.indexOf("BIRTHDAY_NAME = 'LANE ALLISON'") >= 0, "config has BIRTHDAY_NAME = 'LANE ALLISON'");
assert(src.indexOf('MEDDLING DADDIES') >= 0, 'P Diddy Scooby-Doo unmask line present');
assert(src.indexOf('50 CENT') >= 0 && src.indexOf('FROM THE FUTURE') >= 0, '50 Cent future-mission hook present');
ok('config + P Diddy unmask + 50 Cent hook verbatim');

console.log('\nPHASE 4 QA PASSED — ' + PASS + ' checks. ✔');
