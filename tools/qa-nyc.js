/* qa-nyc.js — Second City in exile: story gates block-then-open in order,
   the improv class (money + THE HAROLD + refusals), the merch shop's new drip,
   the show's heal, and Rosalind joining in the disco (not at arrival). */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, walkToNextMap } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
const h = loadGame(); const { G } = h;
console.log('NYC / SECOND CITY QA');

h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000, 'opening');

// mid-game NYC state, pre-Second City: 3 Daddies, arrival cutscene already seen
G.Game.party = [G.makeFighter('samuel', 12), G.makeFighter('herschel', 12), G.makeFighter('william', 12)];
['act0_tutorial', 'nyc_unlocked', 'nyc_arrived_seen'].forEach(f => G.setFlag(f));
G.Game.items = { strongtea: 10 };
G.Game.money = 200;
G.Game.map = 'wellsstreet'; G.Game.px = 12; G.Game.py = 6; G.Game.dir = 'up';
G.setScene(G.World); h.step(3);

function chooseOpt(i) {
  let g = 0;
  while (g++ < 400 && !isWorld(G)) {
    const s = G.getScene();
    if (s === G.Cutscene && s.mode === 'choice' && s.choice) { s.choice.idx = i; h.tap('a'); h.step(3, 25); }
    else { h.tap('a'); h.step(2, 25); }
  }
  return isWorld(G);
}

// (1) the stage door is locked until you learn the password
assert(walkToNextMap(h, 'backalley'), 'reached the back alley');
assert(!walkToNextMap(h, 'scfront'), 'stage door refuses entry without the password');
assert(G.Game.map === 'backalley', 'still in the alley');
ok('secret entrance blocked without the password');

// (2) Lenny's quiz: wrong answer teaches nothing, YES-AND opens the door
assert(walkToNextMap(h, 'wellsstreet'), 'back to the street');
walkTo(h, 3, 3); interactAt(h, 2, 3); chooseOpt(0);
assert(!G.hasFlag('sc_password'), 'wrong quiz answer does not yield the password');
interactAt(h, 2, 3); chooseOpt(1);
assert(G.hasFlag('sc_password'), 'YES, AND earns the password');
assert(walkToNextMap(h, 'backalley') && walkToNextMap(h, 'scfront'), 'stage door now opens');
ok('password quiz gates the secret entrance');

// (3) elevator locked before the key; trunk refuses before the briefing
assert(walkToNextMap(h, 'scbasement'), 'down to HQ');
assert(!walkToNextMap(h, 'clubinferno'), 'freight elevator locked without the key');
assert(walkToNextMap(h, 'scfront') && walkToNextMap(h, 'scgreenroom'), 'up to the green room');
walkTo(h, 2, 7); interactAt(h, 1, 7); advanceUntil(h, isWorld, 4000, 'trunk early');
assert(!G.hasFlag('sc_elevator_key'), 'trunk yields nothing before the briefing');
ok('elevator + trunk gated behind the briefing');

// (4) Del Close: briefing, then the class (broke -> refused; paid -> THE HAROLD; no double-enroll)
assert(walkToNextMap(h, 'scfront') && walkToNextMap(h, 'scbasement'), 'back to HQ');
walkTo(h, 6, 5); interactAt(h, 6, 4); advanceUntil(h, isWorld, 6000, 'briefing');
assert(G.hasFlag('sc_briefed'), 'briefing sets sc_briefed');
G.Game.money = 20;
interactAt(h, 6, 4); chooseOpt(0);
assert(G.Game.money === 20 && !G.Game.party[0].moves.includes('harold'), 'broke: refused, nothing charged');
G.Game.money = 200;
interactAt(h, 6, 4); chooseOpt(0);
assert(G.Game.money === 140 && G.Game.party[0].moves.includes('harold'), 'Samuel learned THE HAROLD for 60s');
interactAt(h, 6, 4); chooseOpt(0);
assert(G.Game.money === 140, 'no refresher courses: re-enroll refused, nothing charged');
interactAt(h, 6, 4); chooseOpt(1);
assert(G.Game.money === 80 && G.Game.party[1].moves.includes('harold'), 'Herschel enrolled separately for 60s');
assert(G.MOVES.harold && G.MOVES.harold.eff.scaleCrowd, 'THE HAROLD scales with the crowd');
ok('improv class: pay per Daddy, learn THE HAROLD, refusals never charge');

// (5) the key is in the prop trunk after the briefing
assert(walkToNextMap(h, 'scfront') && walkToNextMap(h, 'scgreenroom'), 'green room again');
walkTo(h, 2, 7); interactAt(h, 1, 7); advanceUntil(h, isWorld, 4000, 'trunk');
assert(G.hasFlag('sc_elevator_key'), 'prop trunk yields the freight elevator key');
ok('secret item found in the prop trunk');

// (6) the show heals the party for a suggestion
G.Game.party.forEach(f => { f.hp = Math.max(1, Math.round(f.hp * 0.3)); });
assert(walkToNextMap(h, 'scfront') && walkToNextMap(h, 'sctheater'), 'into the mainstage');
walkTo(h, 7, 3); h.tap('a'); h.step(3);
chooseOpt(2);
assert(G.Game.party.every(f => f.hp === G.maxHPd(f)), 'watching the show fully healed the party');
assert(G.hasFlag('sc_show_seen'), 'first show flagged');
ok('improv show: suggestion choice + full heal');

// (7) the merch table sells the BLACK TURTLENECK drip
assert(walkToNextMap(h, 'scfront'), 'back to the lobby');
walkTo(h, 12, 8); interactAt(h, 12, 7); h.step(3);
const shop = G.getScene();
assert(shop !== G.World && shop.buy, 'merch table opened a shop');
shop.idx = 5; h.tap('a'); h.step(3); // drip:turtleneck is the last entry
assert(G.itemCount('drip:turtleneck') === 1, 'bought the BLACK TURTLENECK');
assert(G.DRIP.turtleneck.bonus.POISE === 3 && G.DRIP.turtleneck.bonus.TEMPO === 3, 'turtleneck grants +3 POISE +3 TEMPO');
h.tap('b'); h.step(3);
assert(isWorld(G), 'left the shop');
ok('resistance merch: new drip purchasable');

// (8) the elevator now works, and Rosalind joins IN the disco
assert(G.Game.party.length === 3, 'Rosalind still not in the party');
assert(walkToNextMap(h, 'scbasement'), 'down to HQ once more');
assert(walkToNextMap(h, 'clubinferno'), 'freight elevator rides up');
advanceUntil(h, isWorld, 6000, 'rosalind joins');
assert(G.hasFlag('rosalind_joined') && G.Game.party.length === 4 && G.Game.party[3].id === 'rosalind', 'Rosalind joined in the disco');
ok('Rosalind joins in Club Inferno, not at arrival');

console.log('\nNYC / SECOND CITY QA PASSED — ' + PASS + ' checks. ✔');
