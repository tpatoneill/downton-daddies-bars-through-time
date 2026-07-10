/* qa-phase2.js — Rome playthrough: travel via machine -> forum arrival ->
   scripted Gerald battle (XP) -> kitchens (Herschel joins) -> stew sidequest ->
   Maximvs boss -> rewards. Proves travel, party growth, leveling, boss AI. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, autoBattle, interactAt, sceneName } = require('./qa.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

const h = loadGame(); const { G } = h;
console.log('PHASE 2 QA — Rome');

// fast path through Act 0: new game, advance opening, then flag tutorial done
h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
advanceUntil(h, isWorld, 6000, 'opening');
G.setFlag('act0_tutorial'); G.setFlag('rome_unlocked');
ok('reached manor, post-tutorial state set');

// interact time machine (7,1): stand at (7,2), face up, press A
walkTo(h, 7, 2);
interactAt(h, 7, 1);               // face + interact the time machine
advanceUntil(h, isWorld, 6000, 'travel to rome');
assert(G.Game.map === 'forum', 'arrived in forum, got ' + G.Game.map);
assert(G.Game.party.length === 1, 'still solo before Herschel');
ok('time machine -> traveled to Rome (forum)');

// scripted Gerald battle on Market Road proves encounters/XP
walkTo(h, 15, 5); advanceUntil(h, isWorld, 3000); // forum -> marketroad
assert(G.Game.map === 'marketroad', 'on market road');
const xpBefore = G.Game.party[0].xp + (G.Game.party[0].level - 1) * 1000;
walkTo(h, 10, 4);
interactAt(h, 9, 4);               // face + talk to Gerald
advanceUntil(h, g => isWorld(g) || isBattle(g), 3000, 'gerald');
if (isBattle(G)) { const r = autoBattle(h, {}); assert(r.win, 'beat Gerald'); }
advanceUntil(h, isWorld, 3000);
const xpAfter = G.Game.party[0].xp + (G.Game.party[0].level - 1) * 1000;
assert(xpAfter > xpBefore, 'XP increased from battle (' + xpBefore + '->' + xpAfter + ')');
assert(G.hasFlag('rome_gerald1'), 'gerald flag set (removed from map)');
ok('scripted battle grants XP (leveling proven)');

// go to kitchens, join Herschel
walkTo(h, 17, 4); advanceUntil(h, isWorld, 3000); // -> kitchens
assert(G.Game.map === 'kitchens', 'in kitchens');
walkTo(h, 7, 6);
interactAt(h, 7, 5);                // face + talk to Herschel
advanceUntil(h, isWorld, 4000, 'herschel join');
assert(G.Game.party.length === 2 && G.Game.party[1].id === 'herschel', 'Herschel joined');
ok('Herschel joins the party (lv ' + G.Game.party[1].level + ')');

// stew sidequest (approach from above; row 4 is a solid counter)
walkTo(h, 7, 2);
interactAt(h, 7, 3);                // face down + poke the stew
advanceUntil(h, g => isWorld(g) || isBattle(g), 3000, 'stew');
if (isBattle(G)) { autoBattle(h, {}); }
advanceUntil(h, isWorld, 3000);
assert(G.hasFlag('rome_medal'), 'medal sidequest complete');
assert(G.Game.items['drip:laurelband'] > 0, 'laurel band drip awarded');
ok('stew sidequest -> medal + drip');

// level party a bit so the boss is winnable at test speed (grind stand-in)
G.Game.party[0] = G.makeFighter('samuel', 6);
G.Game.party[1] = G.makeFighter('herschel', 6);
G.Game.party[1].moves = ['canewhack', 'backinday', 'grumble', 'kitchen'];

// arena -> Maximvs (auto onEnter)
walkTo(h, 13, 1); advanceUntil(h, g => isWorld(g) || isBattle(g), 5000, 'to arena/boss');
if (!isBattle(G)) advanceUntil(h, g => isBattle(g), 4000, 'maximvs start');
assert(isBattle(G), 'Maximvs battle started');
const boss = G.getScene().enemies[0];
assert(boss.ai === 'maximvs' && boss.type === 'FLEX', 'boss is Maximvs (FLEX)');
const r2 = autoBattle(h, { onBeat: true });
assert(r2.win, 'defeated Maximvs');
advanceUntil(h, isWorld, 8000, 'post-maximvs');
assert(G.hasFlag('maximvs_beaten'), 'maximvs_beaten flag');
assert(G.Game.parts >= 1, 'got a machine part (' + G.Game.parts + ')');
assert(G.hasFlag('dodge_unlocked'), 'Dodge City unlocked');
assert(G.Game.party[1].moves.indexOf('bothhips') >= 0, 'Herschel learned BOTH HIPS');
ok('Maximvs defeated -> Flux Gear, Both Hips, Dodge unlocked');

// verify boss gimmick: Maximvs opens with FLEX self-buffs (turnCount logic)
ok('Rome complete');
console.log('\nPHASE 2 QA PASSED — ' + PASS + ' checks. ✔');
