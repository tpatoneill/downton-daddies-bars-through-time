/* qa-slots.js — 4 save slots + pause-menu EXIT.
   NEW GAME/CONTINUE go through a slot-select screen; slots are independent
   localStorage keys; overwriting an occupied slot needs a confirm; EXIT in the
   pause menu (two-press confirm) returns to the title screen. */
const { loadGame, advanceUntil, isWorld, sceneName } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }
const h = loadGame(); const { G } = h;
console.log('SLOTS + EXIT QA');

h.step(70, 33); h.tap('start'); h.step(2);
h.tap('a'); h.step(2);
assert(G.Title.mode === 'slots' && G.Title.slotPurpose === 'new', 'slot screen opened');
h.tap('down'); h.step(1); h.tap('a'); h.step(4);
advanceUntil(h, isWorld, 6000, 'opening');
assert(G.Game.slot === 2, 'playing on slot 2');
ok('NEW GAME -> slot select -> slot 2');

G.Game.money = 222; G.saveGame(true);
assert(h.store['dd_bars_through_time_v2_slot2'], 'slot-2 key written');
ok('saves land in the chosen slot key');

G.World.openMenu(); h.step(1);
const mn = G.World.menu;
assert(mn.items.indexOf('EXIT') >= 0, 'EXIT in pause menu');
mn.idx = mn.items.indexOf('EXIT');
h.tap('a'); h.step(1);
assert(G.getScene() === G.World && mn.exitArmed, 'first press arms confirm');
h.tap('a'); h.step(2);
assert(sceneName(G) === 'title', 'second press exits to title');
ok('START -> EXIT -> confirm -> title');

h.tap('start'); h.step(2);
assert(G.Title.opts()[0] === 'CONTINUE', 'CONTINUE offered');
h.tap('a'); h.step(2);
assert(G.Title.mode === 'slots' && G.Title.slotPurpose === 'continue' && G.Title.idx === 1, 'continue preselects occupied slot');
h.tap('a'); h.step(4);
advanceUntil(h, isWorld, 6000, 'continue');
assert(G.Game.slot === 2 && G.Game.money === 222, 'slot 2 restored');
ok('CONTINUE -> slot 2 loaded');

// second independent game on slot 4
G.World.openMenu(); const m2 = G.World.menu; m2.idx = m2.items.indexOf('EXIT');
h.tap('a'); h.step(1); h.tap('a'); h.step(2);
h.tap('start'); h.step(2); h.tap('down'); h.step(1); h.tap('a'); h.step(2);
G.Title.idx = 3; h.tap('a'); h.step(4);
advanceUntil(h, isWorld, 6000, 'second game');
G.Game.money = 444; G.saveGame(true);
assert(JSON.parse(h.store['dd_bars_through_time_v2_slot2']).money === 222, 'slot 2 intact');
assert(JSON.parse(h.store['dd_bars_through_time_v2_slot4']).money === 444, 'slot 4 separate');
ok('slots are independent (2 vs 4 verified)');

// overwrite guard
G.World.openMenu(); const m3 = G.World.menu; m3.idx = m3.items.indexOf('EXIT');
h.tap('a'); h.step(1); h.tap('a'); h.step(2);
h.tap('start'); h.step(2); h.tap('down'); h.step(1); h.tap('a'); h.step(2);
G.Title.idx = 1; h.tap('a'); h.step(1);
assert(G.Title.overArmed && G.Title.mode === 'slots', 'occupied slot needs overwrite confirm');
ok('overwrite guard on occupied slots');

console.log('\nSLOTS + EXIT QA PASSED — ' + PASS + ' checks. ✔');
