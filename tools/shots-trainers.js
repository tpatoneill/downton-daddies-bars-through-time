/* shots-trainers.js — era-local mini-boss sprites, a route with patrolling trainers,
   and the walk-home surprise party + 50 Cent entrance. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo } = require('./qa.js');
const { shoot } = require('./shots.js');

function newHarness() {
  const { loadGame } = require('./qa.js'); const h = loadGame(); const G = h.G;
  h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6); advanceUntil(h, isWorld, 6000);
  return h;
}
// new era-local battle sprites
function capEnemy(enemy, level, name) {
  const h = newHarness(); const G = h.G;
  G.Game.party = [G.makeFighter('samuel', 6)];
  G.startBattle({ enemies: [{ enemy: enemy, level: level }], music: 'battle', canFlee: true }, () => {});
  const b = G.getScene(); if (b.phase === 'intro') { h.tap('a'); h.step(2); }
  shoot(h, 'tr-enemy-' + name);
}
console.log('rendering trainer/ending screenshots...');
capEnemy('legionary', 4, 'legionary');
capEnemy('salesman', 7, 'salesman');
capEnemy('deejay', 10, 'deejay');
capEnemy('skater', 10, 'skater');
capEnemy('goblinhex', 11, 'goblinhex');
capEnemy('goblinbrute', 12, 'goblinbrute');

// a route with patrolling trainers (Rome market road)
{
  const h = newHarness(); const G = h.G;
  G.Game.party = [G.makeFighter('samuel', 6)];
  G.Game.map = 'marketroad'; G.Game.px = 8; G.Game.py = 4; G.Game.dir = 'right'; G.setScene(G.World);
  h.step(6); shoot(h, 'tr-route-marketroad');
}

// the walk-home ending: surprise party + 50 Cent entrance
{
  const h = newHarness(); const G = h.G;
  G.Game.party = [G.makeFighter('samuel', 15), G.makeFighter('herschel', 15), G.makeFighter('william', 15), G.makeFighter('rosalind', 15)];
  ['act0_tutorial', 'trueform', 'finale_done', 'await_party'].forEach(f => G.setFlag(f));
  G.Game.party[0].moves = ['humblebrag', 'punchline', 'hattip', 'nomoredis'];
  G.Game.map = 'bakersrow'; G.Game.px = 9; G.Game.py = 3; G.Game.dir = 'up'; G.setScene(G.World);
  advanceUntil(h, isWorld, 3000);
  walkTo(h, 9, 1); // into manor -> surprise party
  // advance to a SURPRISE! frame
  let g = 0; while (g++ < 40) { const s = G.getScene(); if (s === G.Cutscene && /SURPRISE/.test((s.lines || []).join(' '))) { shoot(h, 'tr-surprise-party'); break; } h.tap('a'); h.step(3); }
  // advance to the 50 Cent entrance animation (a custom scene, not Cutscene/World)
  g = 0; let shotFifty = false;
  while (g++ < 120 && !shotFifty) {
    const s = G.getScene();
    if (s !== G.Cutscene && s !== G.World && s.update && !isBattle(G) && s.phase === undefined) { h.step(6); shoot(h, 'tr-50cent-entrance'); shotFifty = true; break; }
    h.tap('a'); h.step(3);
  }
  console.log('50 cent shot:', shotFifty);
}
console.log('done.');
