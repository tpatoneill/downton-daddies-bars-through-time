/* shots-phase2.js — render Rome screens. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, interactAt } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
console.log('rendering Phase 2 screenshots...');
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);
G.setFlag('act0_tutorial'); G.setFlag('rome_unlocked');
G.Game.party[0] = G.makeFighter('samuel', 6);
walkTo(h, 7, 2); interactAt(h, 7, 1);
advanceUntil(h, isWorld, 6000);
shoot(h, 'p2-01-forum');
walkTo(h, 15, 5); advanceUntil(h, isWorld, 3000); shoot(h, 'p2-02-marketroad');
walkTo(h, 17, 4); advanceUntil(h, isWorld, 3000);
walkTo(h, 7, 6); shoot(h, 'p2-03-kitchens');
interactAt(h, 7, 5); // herschel join dialogue (face up from (7,6))
h.step(4); shoot(h, 'p2-04-herschel-join');
advanceUntil(h, isWorld, 4000);
G.Game.party[1] = G.makeFighter('herschel', 6);
walkTo(h, 13, 1); advanceUntil(h, g => isWorld(g) || isBattle(g), 5000);
if (!isBattle(G)) advanceUntil(h, isBattle, 4000);
if (isBattle(G)) { const b = G.getScene(); if (b.phase === 'intro') { h.tap('a'); h.step(2); } shoot(h, 'p2-05-maximvs'); }
console.log('done.');
