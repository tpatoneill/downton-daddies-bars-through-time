/* shots-phase4.js — render finale + birthday screens. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, sceneName } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
console.log('rendering Phase 4 screenshots...');
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);
G.Game.party = [G.makeFighter('samuel', 15), G.makeFighter('herschel', 15), G.makeFighter('william', 15), G.makeFighter('rosalind', 15)];
['act0_tutorial','london_unlocked','herschel_joined','william_joined','rosalind_joined','editor1_beaten','editor2_beaten','lobby_clear'].forEach(f => G.setFlag(f));
G.Game.map = 'theatredistrict'; G.Game.px = 9; G.Game.py = 5; G.Game.dir = 'up'; G.setScene(G.World);
advanceUntil(h, isWorld, 5000);
shoot(h, 'p4-01-district');
walkTo(h, 9, 1); advanceUntil(h, g => isBattle(g), 6000);
const p1 = G.getScene(); if (p1.phase === 'intro') { h.tap('a'); h.step(2); }
shoot(h, 'p4-02-snob-phase1');
autoBattle(h, {});
// reveal dialogue frames
let guard = 0;
while (!isBattle(G) && guard++ < 60) { const s = G.getScene(); if (s === G.Cutscene && s.who === 'HERSCHEL') { shoot(h, 'p4-03-reveal'); } h.tap('a'); h.step(3, 25); }
if (isBattle(G)) { const b = G.getScene(); if (b.phase === 'intro') { h.tap('a'); h.step(2); } shoot(h, 'p4-04-snob-phase2-trueform'); autoBattle(h, {}); }
// birthday
guard = 0;
while (!(G.getScene() && G.getScene().phase === 'credits') && guard++ < 200) { h.tap('a'); h.step(3, 25); }
h.step(4); shoot(h, 'p4-05-credits');
// fast-forward to the bow (curtain call)
const bd = G.getScene(); if (bd) { bd.scroll = 9999; h.step(4); shoot(h, 'p4-06-birthday'); bd.phase = 'stinger'; bd.t = 1; h.step(4); shoot(h, 'p4-07-stinger'); }
console.log('done.');
