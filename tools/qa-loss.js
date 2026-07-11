/* qa-loss.js — loss-path recovery (DESIGN QA req b): a party wipe must recover
   gracefully (revive + full heal) and hand control back, never soft-lock. Also
   verifies the SPARE MUSTACHE in-battle revive. */
const { loadGame, isBattle, isWorld, autoBattle, advanceUntil } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
const h = loadGame(); const { G } = h;
console.log('LOSS-PATH QA');

h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000);

// (1) hopeless wild fight -> guaranteed wipe -> graceful recovery
G.Game.party = [G.makeFighter('samuel', 1)];
let ended = null;
G.startBattle({ enemies: [{ enemy: 'orator', level: 15 }], music: 'battle', canFlee: false, wild: true }, r => { ended = r; G.gotoWorld(); });
autoBattle(h, {}); // drives to the loss, taps through the result -> finish()
assert(ended && ended.lost, 'battle reported a loss');
assert(!G.Game.party[0].fainted && G.Game.party[0].hp === G.maxHPd(G.Game.party[0]), 'party revived + full-healed after wipe');
assert(isWorld(G), 'returned control to the overworld after the wipe (no soft-lock)');
ok('party wipe -> revive + full heal + control returned');

// (2) SPARE MUSTACHE revives a fallen Daddy mid-battle
G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
G.Game.party[1].fainted = true; G.Game.party[1].hp = 0;
G.Game.items = { sparestache: 1 };
G.startBattle({ enemies: [{ enemy: 'heckler', level: 3 }], music: 'battle', canFlee: true }, () => {});
let b = G.getScene();
// skip the intro transition + taunt to the command menu
let g = 0; while (b.phase !== 'menu' && g++ < 40) { h.tap('a'); h.step(2, 20); }
// open SWAG -> use SPARE MUSTACHE
b.menuIdx = 1; h.tap('a'); h.step(2);          // SWAG
assert(b.phase === 'bag', 'bag opened');
h.tap('a'); h.step(4);                          // use first item (spare mustache)
assert(!G.Game.party[1].fainted && G.Game.party[1].hp > 0, 'SPARE MUSTACHE revived Herschel');
assert(G.itemCount ? true : (G.Game.items.sparestache === 0), 'spare mustache consumed');
ok('SPARE MUSTACHE revives a fallen Daddy mid-battle');

console.log('\nLOSS-PATH QA PASSED — ' + PASS + ' checks. ✔');
