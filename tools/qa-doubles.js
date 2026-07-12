/* qa-doubles.js — double battles: 2+ foes and 2+ living daddies field TWO allies.
   Covers activation, the two-slot command loop, B-back, enemy targeting spread,
   forced-switch auto-snap, bench-empty compaction, retarget-on-kill, and
   termination of the naive autoBattle driver. */
const { loadGame, advanceUntil, isWorld, isBattle, autoBattle } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

function fresh() {
  const h = loadGame(); const G = h.G;
  h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
  advanceUntil(h, isWorld, 6000);
  return { h, G };
}
function toMenu(h, G) { /* pump transition/intro to the first command menu */
  const b = G.getScene();
  let g = 0; while (b.phase !== 'menu' && g++ < 400) { h.tap('a'); h.step(4, 20); }
  assert(b.phase === 'menu', 'reached command menu, got ' + b.phase);
  return b;
}
function commitMove(h, G, b, targetIdx) { /* FIGHT -> first damaging move -> (target) -> aim auto-commit */
  b.menuIdx = 0; h.tap('a'); h.step(2, 20);
  assert(b.phase === 'move', 'move phase');
  const mv = b.active().moves;
  let mi = 0; for (let i = 0; i < mv.length; i++) if (G.MOVES[mv[i]].pow) { mi = i; break; }
  b.moveIdx = mi; h.tap('a'); h.step(2, 20);
  if (b.phase === 'target') {
    if (targetIdx !== undefined) { b.targetIdx = targetIdx; }
    h.tap('a'); h.step(2, 20);
  }
  let g = 0; while (b.phase === 'aim' && g++ < 200) h.step(4, 20); /* let it auto-commit */
}

console.log('DOUBLE BATTLES QA');

// ---- 1. activation matrix ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  let b = G.getScene();
  assert(b.double === true && b.field.length === 2, '2v2 activates double');
  assert(b.field[0] === 0 && b.field[1] === 1, 'field = first two living');
  G.setScene(G.World);

  G.Game.party = [G.makeFighter('samuel', 8)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  b = G.getScene();
  assert(!b.double, '2 enemies vs 1 living daddy stays single');
  G.setScene(G.World);

  G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8), G.makeFighter('william', 8)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }], music: 'battle', canFlee: true }, () => {});
  b = G.getScene();
  assert(!b.double, '1 enemy stays single');
  G.setScene(G.World);

  G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
  G.Game.party[0].fainted = true; G.Game.party[0].hp = 0;
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  b = G.getScene();
  assert(!b.double, 'pre-fainted lead -> only 1 living -> single');
  ok('activation matrix: 2v2 double; 1-living / 1-enemy / pre-fainted stay single');
}

// ---- 2. command loop: slot 0 -> slot 1 -> resolve; B-back ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 10), G.makeFighter('herschel', 10)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  const b = toMenu(h, G);
  assert(b.cmdSlot === 0 && b.active().id === 'samuel', 'slot 0 commands first');
  commitMove(h, G, b, 0);
  assert(b.phase === 'menu' && b.cmdSlot === 1 && b.active().id === 'herschel', 'slot 1 commands second');
  assert(b.slotActions[0] && b.slotActions[0].kind === 'move', 'slot 0 action stored');
  // B in slot 1's menu un-commits slot 0
  h.tap('b'); h.step(2, 20);
  assert(b.cmdSlot === 0 && !b.slotActions[0], 'B backs up to slot 0');
  // recommit both; round resolves with both player actors
  const e0hp = b.enemies[0].hp, e1hp = b.enemies[1].hp;
  commitMove(h, G, b, 0);
  commitMove(h, G, b, 1);
  let g = 0; while (b.phase !== 'menu' && b.phase !== 'faintswitch' && b.phase !== 'result' && g++ < 600) { h.tap('a'); h.step(4, 20); }
  const dmg0 = e0hp - b.enemies[0].hp, dmg1 = e1hp - b.enemies[1].hp;
  assert(dmg0 > 0 && dmg1 > 0, 'both allies acted on their chosen targets (dmg ' + dmg0 + '/' + dmg1 + ')');
  ok('command loop: two slots, per-slot targeting, B-back, both actions resolve');
}

// ---- 3. enemy targeting spread hits both fielded daddies, never bench ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 10), G.makeFighter('herschel', 10), G.makeFighter('william', 10)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  const b = G.getScene();
  const seen = {};
  for (let i = 0; i < 200; i++) { const act = b.enemyChoose(b.enemies[0]); seen[act.targetP] = (seen[act.targetP] || 0) + 1; }
  assert(seen[0] > 0 && seen[1] > 0, 'both fielded slots targeted (' + JSON.stringify(seen) + ')');
  assert(!seen[2], 'benched william never targeted');
  ok('enemy AI spreads targets across the two fielded daddies only');
}

// ---- 4. forced faintswitch auto-snap + bench entry ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 10), G.makeFighter('herschel', 10), G.makeFighter('william', 10)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  const b = toMenu(h, G);
  b.party[1].hp = 1; /* herschel about to drop */
  let g = 0;
  while (b.phase !== 'faintswitch' && b.phase !== 'result' && g++ < 40) {
    if (b.phase === 'menu') commitMove(h, G, b);
    else { h.tap('a'); h.step(4, 20); }
  }
  assert(b.phase === 'faintswitch', 'faintswitch fires when a fielded daddy drops');
  // QA-style invalid pick: the other FIELDED ally — engine must snap to the bench (william, idx 2)
  b.switchIdx = 0;
  h.tap('a'); h.step(3, 20);
  assert(b.field.indexOf(2) >= 0, 'auto-snap fielded william from the bench');
  assert(b.field.indexOf(1) < 0, 'fainted herschel left the field');
  ok('forced switch: invalid pick snaps to the first valid bench daddy');
}

// ---- 5. bench empty -> field compacts, battle continues with one ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 10), G.makeFighter('herschel', 10)];
  G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  const b = toMenu(h, G);
  b.party[1].fainted = true; b.party[1].hp = 0;
  b.afterFaintCheck();
  assert(b.field.length === 1 && b.field[0] === 0, 'field compacts to the survivor');
  assert(b.phase === 'menu' && b.active().id === 'samuel', 'battle continues 1-vs-many');
  ok('no bench: field compacts and the fight goes on');
}

// ---- 6. retarget when the chosen enemy dies first ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 12), G.makeFighter('herschel', 12)];
  G.startBattle({ enemies: [{ enemy: 'heckler', level: 2 }, { enemy: 'bandit', level: 7 }], music: 'battle', canFlee: false }, () => {});
  let b = toMenu(h, G);
  b.enemies[0].hp = 1; /* both will aim at the heckler; it dies to the first hit */
  const b1hp = b.enemies[1].hp;
  /* an accuracy miss can void a single round — allow up to 3 rounds for the retargeted hit to land */
  let hit = false;
  for (let round = 0; round < 3 && !hit && b.phase !== 'result'; round++) {
    commitMove(h, G, b, 0);
    if (b.phase === 'menu') commitMove(h, G, b, 0);
    let g = 0; while (b.phase !== 'menu' && b.phase !== 'result' && g++ < 600) { h.tap('a'); h.step(4, 20); }
    hit = b.enemies[1].fainted || b.enemies[1].hp < b1hp;
  }
  assert(b.enemies[0].fainted, 'first target down');
  assert(b.phase === 'result' || hit, 'second attack retargeted the survivor');
  ok('same-target kill: the second daddy retargets automatically');
}

// ---- 7. the naive walker terminates + sane win rate on the robbery double ----
{
  const { h, G } = fresh();
  let wins = 0; const N = 60;
  for (let i = 0; i < N; i++) {
    G.Game.party = [G.makeFighter('samuel', 7), G.makeFighter('herschel', 7)];
    G.giveItem('strongtea', 3);
    G.startBattle({ enemies: [{ enemy: 'gerald', level: 7 }, { enemy: 'bandit', level: 7 }], music: 'boss', canFlee: false }, () => {});
    const r = autoBattle(h, { stopAtResult: true, onBeat: false });
    assert(!r.stuck, 'autoBattle terminated');
    if (r.win) wins++;
    G.setScene(G.World);
  }
  const pct = Math.round(wins / N * 100);
  assert(pct > 30 && pct <= 100, 'robbery double win rate sane: ' + pct + '%');
  ok('autoBattle drives doubles to completion (' + pct + '% naive wins over ' + N + ')');
}

// ---- 8. 3 enemies vs 2 daddies (snob1 balance spec shape) ----
{
  const { h, G } = fresh();
  G.Game.party = [G.makeFighter('samuel', 15), G.makeFighter('herschel', 15), G.makeFighter('william', 15), G.makeFighter('rosalind', 15)];
  G.startBattle({ enemies: [{ boss: 'snob1' }, { enemy: 'gerald', level: 12 }, { enemy: 'gerald', level: 12 }], music: 'boss', canFlee: false, crowdStart: -20 }, () => {});
  const b = G.getScene();
  assert(b.double && b.field.length === 2, '3 enemies vs 4 daddies fields two');
  const r = autoBattle(h, { stopAtResult: true, onBeat: true });
  assert(!r.stuck, '3v2 terminated (win=' + !!r.win + ')');
  ok('3-enemy double battle runs to completion');
}

console.log('\nDOUBLE BATTLES QA PASSED — ' + PASS + ' checks. ✔');
