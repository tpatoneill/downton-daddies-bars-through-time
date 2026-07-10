/* qa-full.js — THE full headless critical-path playthrough:
   Act0 -> Rome -> Dodge -> NYC -> Finale -> Birthday, walking every map, fighting
   every mandatory battle, using the real travel hub. Party is topped to on-curve
   levels at each era boundary (stands in for the grinding a real player does; the
   balance sweep validates that on-curve fights are winnable-not-free). */
const Q = require('./qa.js');
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, walkToNextMap, pickTravel, sceneName } = Q;
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
const h = loadGame(); const { G } = h;
function levelParty(n) { G.Game.party.forEach(f => { const nf = G.makeFighter(f.id, n); f.level = n; f.maxHP = nf.maxHP; f.baseFLOW = nf.baseFLOW; f.basePOISE = nf.basePOISE; f.baseTEMPO = nf.baseTEMPO; f.hp = f.maxHP; f.fainted = false; f.moves = nf.moves.slice(); }); }
function useMachineTo(needle) { walkTo(h, 7, 2); interactAt(h, 7, 1); pickTravel(h, needle); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'travel ' + needle); }
function enterBossMap(target) { const w = G.curMap().warps.find(w => w.to === target); walkTo(h, w.x, w.y); advanceUntil(h, isBattle, 8000, 'boss ' + target); }

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

// ---- Rome ----
levelParty(4);
useMachineTo('ROME');
assert(G.Game.map === 'forum', 'in Rome forum, got ' + G.Game.map);
walkToNextMap(h, 'marketroad');
walkToNextMap(h, 'kitchens');
walkTo(h, 7, 6); interactAt(h, 7, 5); advanceUntil(h, isWorld, 4000);  // Herschel joins
assert(G.Game.party.length === 2 && G.Game.party[1].id === 'herschel', 'Herschel joined');
levelParty(6);
enterBossMap('arena');                                     // Maximvs on onEnter
assert(isBattle(G) && G.getScene().enemies[0].bossId === 'maximvs', 'Maximvs fight');
autoBattle(h, { onBeat: true });
pickTravel(h, 'DODGE'); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'to dodge');
assert(G.hasFlag('rome_done') && G.Game.parts >= 1, 'Rome complete, part 1');
ok('ROME: Herschel joins, Maximvs down, Flux Gear');

// ---- Dodge City ----
assert(G.Game.map === 'mainstreet', 'in Dodge mainstreet, got ' + G.Game.map);
assert(G.Game.party.length === 3 && G.Game.party[2].id === 'william', 'William joined on arrival');
levelParty(8);
walkToNextMap(h, 'dustytrail');
walkToNextMap(h, 'silvermine');
enterBossMap('saloon');                                    // Jake on onEnter
assert(isBattle(G) && G.getScene().enemies[0].bossId === 'jake', 'Jake fight');
autoBattle(h, { onBeat: true });
pickTravel(h, 'NEW YORK'); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'to nyc');
assert(G.hasFlag('dodge_done') && G.Game.parts >= 2, 'Dodge complete, part 2');
ok('DODGE: William joins, Jake down, Chrono Coil');

// ---- New York ----
assert(G.Game.party.length === 4 && G.Game.party[3].id === 'rosalind', 'Rosalind joined on arrival');
const nycStart = G.Game.map;
levelParty(11);
// traverse the NYC chain dynamically (map ids from the era file)
const nycChain = [];
{ let cur = G.Game.map, seen = {}; while (cur && !seen[cur]) { seen[cur] = 1; const m = G.Maps[cur]; const nxt = m.warps.find(w => !seen[w.to] && ['clubinferno','boilerroom','rooftop'].includes(w.to)); if (!nxt) break; nycChain.push(nxt.to); cur = nxt.to; } }
for (let i = 0; i < nycChain.length - 1; i++) walkToNextMap(h, nycChain[i]);
enterBossMap(nycChain[nycChain.length - 1]);               // Rex on onEnter
assert(isBattle(G) && G.getScene().enemies[0].bossId === 'rex', 'Rex fight');
autoBattle(h, { onBeat: true });
pickTravel(h, 'STAGE'); advanceUntil(h, g => isWorld(g) || isBattle(g), 8000, 'to finale');
assert(G.hasFlag('nyc_done') && G.hasFlag('london_unlocked') && G.Game.parts >= 3, 'NYC complete, part 3');
ok('NYC: Rosalind joins, Rex down, Time Crystal');

// ---- Finale ----
assert(G.Game.map === 'theatredistrict', 'at theatre district, got ' + G.Game.map);
levelParty(14);
walkTo(h, 8, 4); interactAt(h, 8, 3); advanceUntil(h, g => isWorld(g) || isBattle(g), 3000); if (isBattle(G)) { autoBattle(h, {}); advanceUntil(h, isWorld, 3000); }
walkTo(h, 9, 4); interactAt(h, 9, 3); advanceUntil(h, g => isWorld(g) || isBattle(g), 3000); if (isBattle(G)) { autoBattle(h, {}); advanceUntil(h, isWorld, 3000); }
assert(G.hasFlag('lobby_clear'), 'editors cleared');
walkTo(h, 9, 1); advanceUntil(h, isBattle, 6000, 'snob1');
assert(isBattle(G) && G.getScene().enemies[0].bossId === 'snob1', 'Snobbington phase 1');
autoBattle(h, { onBeat: true });
advanceUntil(h, isBattle, 8000, 'snob2');
assert(G.hasFlag('trueform'), 'True Form');
assert(G.Game.party[0].moves.includes('nomoredis'), 'NO MORE DISGUISE learned');
assert(G.getScene().enemies[0].bossId === 'snob2' && G.getScene().crowd >= 100, 'phase 2 + crowd 100');
autoBattle(h, { onBeat: true });
let guard = 0; while (!(G.getScene() && G.getScene().phase === 'credits') && guard++ < 400) { h.tap('a'); h.step(3, 25); }
assert(G.hasFlag('finale_done') && G.hasFlag('game_complete'), 'finale complete');
assert(G.getScene() && (G.getScene().phase === 'credits' || G.getScene().phase === 'bow'), 'birthday sequence');
ok('FINALE: editors, Snobbington 2-phase, reveal, True Form, birthday');

// ---- save/load mid-nothing roundtrip on final state ----
G.saveGame(true); const parts = G.Game.parts; G.Game.parts = 0; assert(G.loadGame() && G.Game.parts === parts, 'save/load roundtrip');
ok('save/load roundtrip on completed game');

console.log('\nFULL PLAYTHROUGH QA PASSED — ' + PASS + ' checks. ✔  (parts=' + G.Game.parts + ')');
