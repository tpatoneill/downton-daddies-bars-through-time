/* shots-phase1.js — render Phase 1 screens to /screenshots. */
const { loadGame, advanceUntil, isWorld, isBattle, walkTo, sceneName } = require('./qa.js');
const { shoot } = require('./shots.js');

const h = loadGame(); const { G } = h;
console.log('rendering Phase 1 screenshots...');

h.step(20, 33); shoot(h, 'p1-01-boot');
h.step(60, 33); shoot(h, 'p1-02-title');           // title (press mode)
h.tap('start'); h.step(3); shoot(h, 'p1-03-title-menu');
h.tap('a'); h.step(6);                              // new game -> opening cutscene
shoot(h, 'p1-04-opening');                          // a cutscene dialogue frame
advanceUntil(h, isWorld, 6000, 'opening');
shoot(h, 'p1-05-manor');                            // manor overworld
// open pause menu
G.World.openMenu(); h.step(2); shoot(h, 'p1-06-menu');
// party screen
G.setScene(G.World); G.World.menu = { idx: 0, items: ['PARTY','SWAG','SAVE','CLOSE'] };
h.step(1);
// walk to bakersrow
G.World.menu = null;
walkTo(h, 7, 11); advanceUntil(h, isWorld, 3000);
shoot(h, 'p1-07-bakersrow');
// walk into theatre -> tutorial battle
walkTo(h, 1, 4, {});
advanceUntil(h, g => isWorld(g) || isBattle(g), 4000, 'tutorial');
if (isBattle(G)) {
  const b = G.getScene();
  if (b.phase === 'intro') { h.tap('a'); h.step(2); }
  shoot(h, 'p1-08-battle-menu');
  b.menuIdx = 0; h.tap('a'); h.step(2);
  shoot(h, 'p1-09-battle-moves');
  // fire a move to show resolve + crowd
  h.tap('a'); h.step(4);
  if (b.phase === 'aim') { h.step(30, 33); }
  shoot(h, 'p1-10-battle-resolve');
}
console.log('done.');
