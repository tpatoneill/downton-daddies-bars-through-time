/* shell.js — canvas hookup, input mapping (pointer + keyboard incl L/R shoulders),
   scene manager, and the main animation loop. Bootstrap (first scene) is in 99-main.js. */

/* ---- scene manager ---- */
var scene = null;
function setScene(sc) { scene = sc; if (sc && sc.enter) sc.enter(); }

/* ---- input ---- */
var held = {};
function press(k) {
  ensureAudio();
  if (ac && ac.state === 'suspended') ac.resume();
  if (held[k]) return;
  held[k] = true;
  if (scene && scene.onPress) scene.onPress(k);
}
function release(k) { held[k] = false; if (scene && scene.onRelease) scene.onRelease(k); }

var KEYMAP = {
  'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down',
  'z':'a','Z':'a','x':'b','X':'b','Enter':'start','Shift':'select',
  'a':'l','A':'l','s':'r','S':'r',' ':'a'
};
function bindDOM() {
  window.addEventListener('keydown', function (e) {
    var k = KEYMAP[e.key]; if (!k) return; e.preventDefault(); if (!e.repeat) press(k);
  });
  window.addEventListener('keyup', function (e) {
    var k = KEYMAP[e.key]; if (!k) return; e.preventDefault(); release(k);
  });
  var btns = document.querySelectorAll('[data-k]');
  for (var bi = 0; bi < btns.length; bi++) {
    (function (b) {
      var k = b.getAttribute('data-k');
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); b.classList.add('dn'); press(k); });
      var up = function () { b.classList.remove('dn'); release(k); };
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
      b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    })(btns[bi]);
  }
}

/* ---- main loop ---- */
var lastTs = 0;
function frame(ts) {
  var dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;
  musicTick();
  if (scene) {
    if (scene.update) scene.update(dt);
    if (scene.draw) scene.draw();
  }
  Transition.update(dt);
  Transition.draw();
  requestAnimationFrame(frame);
}
