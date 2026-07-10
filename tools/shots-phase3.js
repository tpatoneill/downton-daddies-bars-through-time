/* shots-phase3.js — render Dodge City + NYC screens. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, walkToNextMap } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
function level(n) { G.Game.party.forEach(f => { const nf = G.makeFighter(f.id, n); f.level = n; f.maxHP = nf.maxHP; f.baseFLOW = nf.baseFLOW; f.basePOISE = nf.basePOISE; f.baseTEMPO = nf.baseTEMPO; f.hp = f.maxHP; f.moves = nf.moves.slice(); }); }
function boss(t) { const w = G.curMap().warps.find(w => w.to === t); walkTo(h, w.x, w.y); advanceUntil(h, isBattle, 8000); const b = G.getScene(); if (b.phase === 'intro') { h.tap('a'); h.step(2); } }
console.log('rendering Phase 3 screenshots...');
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);
G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
G.setFlag('act0_tutorial'); G.setFlag('dodge_unlocked');
walkTo(h, 7, 2); interactAt(h, 7, 1); advanceUntil(h, isWorld, 6000);   // -> Dodge (William joins)
shoot(h, 'p3-01-mainstreet');
level(9);
walkToNextMap(h, 'dustytrail'); shoot(h, 'p3-02-dustytrail');
walkToNextMap(h, 'silvermine');
boss('saloon'); shoot(h, 'p3-03-jake');
autoBattle(h, {});
// jump to NYC
let g = 0; while (!(isWorld(G) && G.Game.map === 'mainstreet') && g++ < 200) { const s = G.getScene(); if (s === G.Cutscene && s.mode === 'choice') { s.choice.idx = s.choice.opts.length - 1; h.tap('a'); h.step(3); } else { h.tap('a'); h.step(2, 25); } }
G.setFlag('nyc_unlocked');
walkTo(h, 7, 2); interactAt(h, 7, 1);
g = 0; while (!(isWorld(G) && (G.Game.map === 'backalley' || G.Game.map === 'clubinferno')) && g++ < 200) { const s = G.getScene(); if (s === G.Cutscene && s.mode === 'choice') { const i = s.choice.opts.findIndex(o => o.indexOf('NEW YORK') >= 0); s.choice.idx = i >= 0 ? i : 0; h.tap('a'); h.step(3); } else { h.tap('a'); h.step(2, 25); } }
shoot(h, 'p3-04-nyc-arrival');
level(12);
// traverse to club then rooftop
const chain = []; { let cur = G.Game.map, seen = {}; while (cur && !seen[cur]) { seen[cur] = 1; const nxt = G.Maps[cur].warps.find(w => !seen[w.to] && ['clubinferno','boilerroom','rooftop'].includes(w.to)); if (!nxt) break; chain.push(nxt.to); cur = nxt.to; } }
if (G.Game.map === 'backalley') { walkToNextMap(h, 'clubinferno'); }
shoot(h, 'p3-05-clubinferno');
for (let i = 0; i < chain.length; i++) if (['boilerroom'].includes(chain[i])) walkToNextMap(h, chain[i]);
boss('rooftop'); shoot(h, 'p3-06-rex');
console.log('done.');
