/* shots-goblin.js — render the new Goblin Realm act + P Diddy/50 Cent finale beats. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
function party(n) { return [G.makeFighter('samuel', n), G.makeFighter('herschel', n), G.makeFighter('william', n), G.makeFighter('rosalind', n)]; }
console.log('rendering Goblin Realm + finale screenshots...');
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);

// --- Goblin Realm overworld ---
G.Game.party = party(12);
['act0_tutorial', 'nyc_done', 'goblin_arrived'].forEach(f => G.setFlag(f));
G.Game.map = 'goblinrealm'; G.Game.px = 8; G.Game.py = 6; G.Game.dir = 'up'; G.setScene(G.World);
h.step(3); shoot(h, 'gob-01-realm');

// --- Pedro battle intro ---
walkTo(h, 8, 2); interactAt(h, 8, 1);
advanceUntil(h, isBattle, 6000);
let b = G.getScene(); if (b.phase === 'intro') { h.tap('a'); h.step(2); }
shoot(h, 'gob-02-pedro');

// force Pedro just above the reveal threshold so the next hit triggers the wig reveal
b.enemies[0].hp = Math.round(G.maxHPd(b.enemies[0]) * 0.56);
// one attack
b.menuIdx = 0; h.tap('a'); h.step(2); if (b.phase === 'move') { h.tap('a'); h.step(2); }
if (b.phase === 'target') { h.tap('a'); h.step(2); }
if (b.phase === 'aim') h.step(30, 33);
// advance resolve until the reveal cutscene fires
let g = 0; while (isBattle(G) && g++ < 60) { const s = G.getScene(); if (s.phase === 'resolve') { h.tap('a'); h.step(2); } else break; }
// now the reveal cutscene should be up; advance to a HERSCHEL shocked line
g = 0; while (G.getScene() === G.Cutscene && g++ < 30) { const s = G.getScene(); if (s.who === 'HERSCHEL') { shoot(h, 'gob-03-wig-reveal'); break; } h.tap('a'); h.step(3); }
// finish reveal -> back in battle as True Form
g = 0; while (!isBattle(G) && g++ < 40) { h.tap('a'); h.step(3); }
if (isBattle(G)) { h.step(3); shoot(h, 'gob-04-trueform-battle'); }
autoBattle(h, {});
// pedroAfter number gag
g = 0; while (G.getScene() === G.Cutscene && g++ < 12) { h.tap('a'); h.step(3); }
shoot(h, 'gob-05-number');

// --- Finale: P Diddy unmask + 50 Cent ---
const h2 = loadGame(); const G2 = h2.G;
h2.step(70, 33); h2.tap('start'); h2.step(3); h2.tap('a'); h2.step(6);
advanceUntil(h2, isWorld, 6000);
G2.Game.party = [G2.makeFighter('samuel', 15), G2.makeFighter('herschel', 15), G2.makeFighter('william', 15), G2.makeFighter('rosalind', 15)];
['act0_tutorial', 'trueform', 'london_unlocked', 'herschel_joined', 'william_joined', 'rosalind_joined', 'editor1_beaten', 'editor2_beaten', 'lobby_clear'].forEach(f => G2.setFlag(f));
G2.Game.party[0].moves = ['humblebrag', 'punchline', 'hattip', 'nomoredis'];
G2.Game.map = 'finalstage'; G2.Game.px = 7; G2.Game.py = 11; G2.Game.dir = 'up'; G2.setScene(G2.World);
// snob phase 1 -> escalate -> phase 2
advanceUntil(h2, isBattle, 8000);   // snob1
autoBattle(h2, {});
advanceUntil(h2, isBattle, 8000);   // snob2 (after snobEscalate bridge)
autoBattle(h2, {});
// pDiddyUnmask cutscene: capture the unmask + 50 Cent lines
let seenP = false, seenF = false, gg = 0;
while (G2.getScene() === G2.Cutscene && gg++ < 40) {
  const s = G2.getScene();
  if (!seenP && s.who === 'PDIDDY') { h2.step(6); shoot(h2, 'gob-06-pdiddy'); seenP = true; }
  if (!seenF && s.who === '50 CENT') { shoot(h2, 'gob-07-fiftycent'); seenF = true; }
  h2.tap('a'); h2.step(3);
}
// birthday stinger (P Diddy in freestyle class)
let g3 = 0; while (!(G2.getScene() && G2.getScene().phase === 'credits') && g3++ < 300) { h2.tap('a'); h2.step(3, 25); }
const bd = G2.getScene(); if (bd) { bd.phase = 'stinger'; bd.t = 1; h2.step(3); shoot(h2, 'gob-08-stinger'); }
console.log('done.');
