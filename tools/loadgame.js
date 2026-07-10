/* Shared loader: instantiate the bundled game with a rasterizing canvas + stubs.
   Returns the exported hooks plus the pixel buffer + a stepper. */
const { makeCanvas } = require('./canvas.js');
const { bundleOnly } = require('../build.js');

function loadGame() {
  const src = bundleOnly();
  const cv = makeCanvas(240, 160);
  const clock = { ts: 0 };
  const store = {};
  global.window = { addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined };
  global.document = {
    getElementById: () => ({ getContext: () => cv.ctx, width: 240, height: 160 }),
    querySelectorAll: () => []
  };
  global.performance = { now: () => clock.ts };
  global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = '' + v; }, removeItem: k => { delete store[k]; } };
  let raf = null;
  global.requestAnimationFrame = cb => { raf = cb; };

  const exportList = 'press,release,setScene,Game,newGame,continueGame,frame,Maps,MOVES,CLASSES,BOSSES,ENEMIES,makeFighter,makeEnemy,makeBoss,startBattle,World,Cutscene,Title,Boot,hasFlag,setFlag,saveGame,loadGame,healParty,eff,maxHPd,xpNeed,computeDamage,typeMult,ERAS,gotoWorld,solidAt,warpAt,objAt,curMap,TILES,BGS,SPR,COL';
  const run = new Function(src + `;\nreturn { ${exportList}, getScene: function(){ return scene; }, tnow: function(){ return tnow(); } };`);
  const G = run();

  function step(n, dtMs) {
    dtMs = dtMs || 33;
    for (let i = 0; i < (n || 1); i++) { clock.ts += dtMs; if (raf) raf(clock.ts); }
  }
  function tap(k) { G.press(k); G.release(k); }
  function hold(k) { G.press(k); }
  function unhold(k) { G.release(k); }

  return { G, cv, clock, step, tap, hold, unhold, store };
}

module.exports = { loadGame };
