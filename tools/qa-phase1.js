/* qa-phase1.js — Act 0 headless playthrough:
   boot -> title -> new game -> opening cutscene -> walk manor->bakersrow->theatre
   -> tutorial battle -> win -> save/load roundtrip. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, sceneName } = require('./qa.js');

function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

const h = loadGame();
const { G } = h;

console.log('PHASE 1 QA — Engine + Act 0');

// boot -> title
h.step(70, 33);
assert(G.getScene() === G.Title || sceneName(G) === 'title', 'reached title, got ' + sceneName(G));
ok('boot -> title');

// title press -> menu -> new game
h.tap('start'); h.step(3);
h.tap('a'); h.step(3); // NEW GAME (default idx 0 when no save)
ok('started new game');

// opening cutscene -> world (manor)
advanceUntil(h, isWorld, 6000, 'opening');
assert(G.Game.map === 'manor', 'in manor, got ' + G.Game.map);
assert(G.Game.party.length === 1 && G.Game.party[0].id === 'samuel', 'party is solo Samuel');
assert(G.hasFlag('act0_intro'), 'act0_intro set');
ok('opening cutscene played, Samuel alone in manor');

// walk to manor door warp (7,11) -> bakersrow
walkTo(h, 7, 11);
advanceUntil(h, isWorld, 3000, 'to bakersrow');
assert(G.Game.map === 'bakersrow', 'warped to bakersrow, got ' + G.Game.map);
ok('walked manor -> bakersrow (warp + autosave)');
assert(h.store['dd_bars_through_time_v2'], 'autosaved on transition');
ok('autosave on map transition present');

// walk to theatre door warp (1,4) -> theatre (triggers tutorial)
walkTo(h, 1, 4, {});
// tutorial cutscene then battle
advanceUntil(h, g => isWorld(g) || isBattle(g), 4000, 'to theatre/tutorial');
if (isBattle(G)) { const r = autoBattle(h, { onBeat: true }); assert(r.win, 'won tutorial'); }
advanceUntil(h, isWorld, 4000, 'post-tutorial');
assert(G.hasFlag('act0_tutorial'), 'tutorial flag set');
assert(G.hasFlag('rome_unlocked'), 'rome unlocked');
ok('tutorial battle won (Samuel solo)');

// Samuel should have gained xp
const sam = G.Game.party[0];
assert(sam.xp > 0 || sam.level > 1, 'Samuel gained XP from tutorial');
ok('xp awarded (' + sam.name + ' lv' + sam.level + ' xp' + sam.xp + ')');

// save/load roundtrip
G.Game.money = 77; G.saveGame(true);
const beforeLv = sam.level, beforeMap = G.Game.map, beforePx = G.Game.px;
// mutate live state then reload
G.Game.money = 0; G.Game.party[0].hp = 1;
const loaded = G.loadGame();
assert(loaded, 'loadGame returned true');
assert(G.Game.money === 77, 'money restored (' + G.Game.money + ')');
assert(G.Game.party[0].level === beforeLv, 'level restored');
ok('save/load roundtrip preserved state');

// battle system numeric checks
assert(G.typeMult('ROAST', 'FLEX') === 1.5, 'ROAST > FLEX = 1.5');
assert(G.typeMult('FLEX', 'ROAST') === 0.75, 'FLEX < ROAST = 0.75');
assert(G.typeMult('CLASSIC', 'HEART') === 1, 'CLASSIC neutral');
ok('type wheel multipliers correct');

// a raw damage sanity: samuel punch on heckler enemy > 0 and finite
const atk = G.makeFighter('samuel', 5), def = G.makeEnemy('heckler', 5);
G.startBattle({ enemies: [{ enemy: 'heckler', level: 5 }], canFlee: true }, () => {});
const dmg = G.computeDamage(atk, def, G.MOVES.punchline, false, false);
assert(dmg.dmg > 0 && isFinite(dmg.dmg), 'damage finite positive (' + dmg.dmg + ')');
ok('damage formula finite/positive');

console.log('\nPHASE 1 QA PASSED — ' + PASS + ' checks. ✔');
