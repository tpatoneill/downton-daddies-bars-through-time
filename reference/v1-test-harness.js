const fs = require('fs');
const html = fs.readFileSync('/home/claude/downton-daddies.html', 'utf8');
const src = html.match(/<script>([\s\S]*)<\/script>/)[1];

// ---- DOM / canvas stubs ----
var ts = 0;
const ctxCalls = { fillRect: 0 };
const fakeCtx = {
  fillStyle: '',
  fillRect: (x, y, w, h) => {
    ctxCalls.fillRect++;
    if (!isFinite(x) || !isFinite(y)) throw new Error('non-finite fillRect coords: ' + x + ',' + y);
  },
  save: () => {}, restore: () => {}, translate: () => {}
};
global.window = {
  addEventListener: () => {},
  AudioContext: undefined, webkitAudioContext: undefined
};
global.document = {
  getElementById: () => ({ getContext: () => fakeCtx }),
  querySelectorAll: () => []
};
global.performance = { now: () => ts };  // simulated clock so battles run instantly
let rafCb = null;
global.requestAnimationFrame = cb => { rafCb = cb; };

// run the game script with hooks exported
const run = new Function(src + `
;return { press, release, getScene: function(){return scene}, Director, SCRIPT, BATTLES, makeBattle, setScene, tnow };
`);
const G = run();

function frames(n, step = 33) {
  for (let i = 0; i < n; i++) { ts += step; rafCb(ts); }
}
function tap(k) { G.press(k); G.release(k); }

console.log('boot scene running...');
frames(70);                 // boot (2s) -> title
console.log('scene after boot should be Title. fillRects so far:', ctxCalls.fillRect);

tap('start');               // start game
frames(5);

// walk through all dialogue + scenes until we hit each battle; play battles by auto-hitting
let battlesWon = 0, safety = 0;
while (battlesWon < 5 && safety++ < 60000) {
  const sc = G.getScene();
  if (sc && sc.chart) {
    // it's a battle
    if (sc.state === 'ready') { tap('a'); frames(2); continue; }
    if (sc.state === 'run') {
      // auto-play: hit every note at its exact time
      const t = G.tnow();
      for (const note of sc.chart) {
        if (!note.hit && !note.missed) {
          const nt = sc.noteT(note);
          if (Math.abs(nt - t) < 0.09) {
            tap(['left','up','down','right'][note.lane]);
          }
        }
      }
      frames(1, 16);
      continue;
    }
    if (sc.state === 'result') {
      if (!sc.won) throw new Error('LOST a battle even with perfect autoplay! meter=' + sc.meter);
      battlesWon++;
      console.log('battle ' + battlesWon + ' WON with hype ' + sc.meter + '%');
      tap('a'); frames(3);
      continue;
    }
  } else {
    // dialogue / travel / boom — press A and advance time
    tap('a');
    frames(4);
  }
}
if (battlesWon < 5) throw new Error('did not reach all 5 battles, stuck at ' + battlesWon + ', script index ' + G.Director.i);

// should now be at ending
frames(60);
const end = G.getScene();
console.log('reached ending scene:', !!(end && end.t !== undefined));
tap('start');  // encore -> back to title
frames(5);
console.log('encore back to title: OK');
console.log('total fillRect calls (rendering happened):', ctxCalls.fillRect);
console.log('\\nFULL PLAYTHROUGH PASSED ✔');
