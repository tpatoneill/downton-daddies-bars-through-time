/* qa-swag.js — field SWAG pouch: consumables + drip listed together, applied to a
   CHOSEN party member (heal/cure/revive/equip), with refusal cases not consuming. */
const { loadGame } = require('./loadgame.js');
const h = loadGame(); const { G } = h;
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
console.log('SWAG POUCH QA');

h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
let g = 0; while (G.getScene() !== G.World && g++ < 3000) { h.tap('a'); h.step(2, 20); }
assert(G.getScene() === G.World, 'reached the overworld');

G.Game.party = [G.makeFighter('samuel', 8), G.makeFighter('herschel', 8)];
G.Game.party[0].hp -= 25;
G.Game.party[1].fainted = true; G.Game.party[1].hp = 0;
G.Game.items = { earlgrey: 2, sparestache: 1, 'drip:goldchain': 1, 'drip:heartlocket': 1 };

h.tap('start'); h.step(2);
G.World.menu.idx = 1; h.tap('a'); h.step(2);
const bag = G.getScene();
assert(bag !== G.World && bag.build, 'SWAG pouch opened');
assert(bag.build().join(',') === 'earlgrey,sparestache,drip:goldchain,drip:heartlocket', 'pouch lists consumables AND drip');
ok('pouch lists consumables and drip gear');

bag.idx = 0; h.tap('a'); h.step(2);
assert(bag.mode === 'who', 'A opens the member picker');
bag.whoIdx = 0; h.tap('a'); h.step(2);
assert(G.Game.party[0].hp === G.maxHPd(G.Game.party[0]), 'earl grey healed the chosen member');
assert(G.Game.items.earlgrey === 1, 'earl grey consumed');
ok('targeted heal works');

bag.mode = 'list'; bag.idx = 0; h.tap('a'); h.step(2); bag.whoIdx = 1; h.tap('a'); h.step(2);
assert(G.Game.party[1].fainted && G.Game.items.earlgrey === 1, 'tea refused on a fainted member, not consumed');
h.tap('b'); h.step(2);
bag.idx = bag.build().indexOf('sparestache'); h.tap('a'); h.step(2); bag.whoIdx = 1; h.tap('a'); h.step(2);
assert(!G.Game.party[1].fainted && G.Game.party[1].hp > 0, 'spare mustache revived the chosen member');
ok('refusals do not consume; targeted revive works');

const flowBefore = G.eff(G.Game.party[1], 'FLOW');
bag.idx = bag.build().indexOf('drip:goldchain'); h.tap('a'); h.step(2); bag.whoIdx = 1; h.tap('a'); h.step(2);
assert(G.Game.party[1].drip === 'goldchain', 'drip equipped on chosen member');
assert(G.eff(G.Game.party[1], 'FLOW') === flowBefore + 4, 'FLOW improved by the drip bonus');
bag.idx = bag.build().indexOf('drip:heartlocket'); h.tap('a'); h.step(2); bag.whoIdx = 0; h.tap('a'); h.step(2);
assert(G.maxHPd(G.Game.party[0]) === G.Game.party[0].maxHP + 16, 'heart locket raised max HP');
bag.idx = bag.build().indexOf('drip:heartlocket'); h.tap('a'); h.step(2); bag.whoIdx = 0; h.tap('a'); h.step(2);
assert(G.Game.party[0].drip === null, 're-applying the same drip removes it');
ok('drip equip/unequip from the pouch improves stats');

h.tap('b'); h.step(2);
assert(G.getScene() === G.World, 'B returns to the overworld');
ok('back out to the world');

console.log('\nSWAG POUCH QA PASSED — ' + PASS + ' checks. ✔');
