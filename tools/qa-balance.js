/* qa-balance.js — balance sweep. Auto-play each mandatory boss at on-curve level
   with a naive strategy (best-type move, NO timing crits, NO items/switch), single
   attempt, many trials. Target: naive win rate 60-80% (winnable but not free). */
const { loadGame, isBattle, autoBattle } = require('./qa.js');
const h = loadGame(); const { G } = h;
const TRIALS = 60;

function party(ids, lvl, trueform) {
  return ids.map(id => {
    const f = G.makeFighter(id, lvl);
    if (trueform && id === 'samuel') { // approximate True Form buff for the phase-2 sim
      f.baseFLOW += 8; f.basePOISE += 6; f.baseTEMPO += 6; f.maxHP += 20; f.hp = f.maxHP;
      if (f.moves.indexOf('nomoredis') < 0) f.moves[3] = 'nomoredis';
    }
    return f;
  });
}
function trial(spec, mkParty) {
  G.Game.party = mkParty();
  G.Game.activeIdx = 0;
  let done = false, result = null;
  G.startBattle(Object.assign({ music: 'boss', canFlee: false }, spec), r => { done = true; result = r; });
  // naive: no onBeat, no items, no switching (autoBattle default picks best-type move & fights)
  const r = autoBattle(h, { stopAtResult: true, onBeat: false });
  return r.win;
}
function sweep(name, spec, mkParty) {
  let wins = 0;
  for (let i = 0; i < TRIALS; i++) if (trial(spec, mkParty)) wins++;
  const pct = Math.round((wins / TRIALS) * 100);
  const flag = pct >= 55 && pct <= 85 ? 'OK ' : (pct > 85 ? 'EASY' : 'HARD');
  console.log('  [' + flag + '] ' + name.padEnd(22) + wins + '/' + TRIALS + '  (' + pct + '%)');
  return pct;
}

console.log('BALANCE SWEEP — naive strategy, single attempt, ' + TRIALS + ' trials each');
const res = {};
res.maximvs = sweep('MC MAXIMVS (lv5)', { enemies: [{ boss: 'maximvs' }], crowdStart: 0 }, () => party(['samuel', 'herschel'], 5));
res.jake = sweep('RATTLESNAKE JAKE (lv8)', { enemies: [{ boss: 'jake' }], crowdStart: 0 }, () => party(['samuel', 'herschel', 'william'], 8));
res.rex = sweep('DISCO REX (lv11)', { enemies: [{ boss: 'rex' }], crowdStart: 0 }, () => party(['samuel', 'herschel', 'william', 'rosalind'], 11));
res.snob1 = sweep('SNOBBINGTON P1 (lv13)', { enemies: [{ boss: 'snob1' }, { enemy: 'gerald', level: 10 }, { enemy: 'gerald', level: 10 }], crowdStart: -20 }, () => party(['samuel', 'herschel', 'william', 'rosalind'], 13));
res.snob2 = sweep('FINAL DRAFT P2 (lv14)', { enemies: [{ boss: 'snob2' }], crowdStart: 100 }, () => party(['samuel', 'herschel', 'william', 'rosalind'], 14, true));
res.heckler = sweep('TUTORIAL HECKLER (lv1)', { enemies: [{ boss: 'heckler_boss' }], crowdStart: -10 }, () => party(['samuel'], 1));

console.log('\nsummary:', JSON.stringify(res));
module.exports = res;
