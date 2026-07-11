/* shots-phase3.js — render Old West + NYC screens. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, walkToNextMap, trek, pickTravel } = require('./qa.js');
const { shoot } = require('./shots.js');
const h = loadGame(); const { G } = h;
function level(n) { G.Game.party.forEach(f => { const nf = G.makeFighter(f.id, n); f.level = n; f.maxHP = nf.maxHP; f.baseFLOW = nf.baseFLOW; f.basePOISE = nf.basePOISE; f.baseTEMPO = nf.baseTEMPO; f.hp = f.maxHP; f.moves = nf.moves.slice(); }); }
function boss(t) { const w = G.curMap().warps.find(w => w.to === t); walkTo(h, w.x, w.y); advanceUntil(h, isBattle, 8000); const b = G.getScene(); if (b.phase === 'intro' || b.phase === 'transition') { h.tap('a'); h.step(2); } }
console.log('rendering Phase 3 screenshots...');
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);
G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
G.giveItem('strongtea', 10);
G.setFlag('act0_tutorial'); G.setFlag('dodge_unlocked');
walkTo(h, 7, 2); interactAt(h, 7, 1); advanceUntil(h, isWorld, 8000);   // -> OLD WEST (desert arrival)
shoot(h, 'p3-01-desertspawn');
level(9);
trek(h, ['desertspawn', 'drygulch']); shoot(h, 'p3-02-drygulch');
trek(h, ['drygulch', 'station']); shoot(h, 'p3-03-station');
G.Game.money = 40;
walkTo(h, 11, 5); interactAt(h, 11, 4); pickTravel(h, 'BUY TICKET'); advanceUntil(h, isWorld, 4000);
walkTo(h, 7, 2); advanceUntil(h, isWorld, 12000);                        // board -> departure scene
shoot(h, 'p3-04-traincar');
walkToNextMap(h, 'baggagecar');                                          // robbery auto-resolves en route if it fires
if (!G.hasFlag('train_robbery_done')) {
  advanceUntil(h, isBattle, 8000, 'robbery');
  autoBattle(h, { onBeat: true }); advanceUntil(h, isWorld, 6000);
}
shoot(h, 'p3-05-mailcar');
trek(h, ['baggagecar', 'traincar']);
walkTo(h, 2, 3); interactAt(h, 1, 3); advanceUntil(h, isWorld, 15000);   // arrival animation -> William joins
shoot(h, 'p3-06-mainstreet');
trek(h, ['mainstreet', 'dustytrail']); shoot(h, 'p3-07-dustytrail');
// the press opens the saloon (retry through any wipe-respawn)
for (let a = 0; a < 4 && !G.hasFlag('dodge_press'); a++) {
  if (G.Game.map !== 'silvermine' && !trek(h, ['mainstreet', 'dustytrail', 'silvermine'])) continue;
  walkTo(h, 7, 2); if (G.Game.map !== 'silvermine') continue;
  interactAt(h, 7, 3); advanceUntil(h, g => isBattle(g), 6000, 'press');
  autoBattle(h, { onBeat: true }); advanceUntil(h, isWorld, 6000);
}
level(10);
let jakeDone = false;
for (let a = 0; a < 5 && !jakeDone; a++) {
  if (!trek(h, ['silvermine', 'dustytrail', 'mainstreet'])) continue;
  boss('saloon'); shoot(h, 'p3-08-jake');
  if (autoBattle(h, { onBeat: true }).win) jakeDone = true;
  else advanceUntil(h, isWorld, 8000, 'respawn after jake wipe');
}
// Jake's victory hub -> ride the engine straight to NYC
pickTravel(h, 'NEW YORK');
let g = 0; while (!(isWorld(G) && G.Game.map === 'wellsstreet') && g++ < 400) { h.tap('a'); h.step(2, 25); }
shoot(h, 'p3-09-nyc-arrival');
level(12);
// skip the Second City story steps for the screenshot pass
['sc_password', 'sc_inside', 'sc_briefed', 'sc_elevator_key'].forEach(f => G.setFlag(f));
walkToNextMap(h, 'backalley'); walkToNextMap(h, 'scfront'); shoot(h, 'p3-10-secondcity');
walkToNextMap(h, 'scbasement'); walkToNextMap(h, 'clubinferno');
advanceUntil(h, isWorld, 6000); // Rosalind joins in the disco
shoot(h, 'p3-11-clubinferno');
walkToNextMap(h, 'boilerroom');
boss('rooftop'); shoot(h, 'p3-12-rex');
console.log('done.');
