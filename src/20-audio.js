/* audio.js — WebAudio chiptune engine (ported from v1, expanded).
   Per-era overworld themes, battle + boss themes, victory/level-up jingles, SFX table.
   Fully null-safe: if AudioContext is unavailable (headless), every call is a no-op. */

var ac = null, master = null, noiseBuf = null;
function ensureAudio() {
  if (ac) return;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = 0.32; master.connect(ac.destination);
    var len = (ac.sampleRate * 0.3) | 0;
    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  } catch (e) { ac = null; }
}
function tnow() { return ac ? ac.currentTime : (performance.now() / 1000); }
function tone(type, f0, f1, t, dur, vol) {
  if (!ac) return;
  var o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(Math.max(1, f0), t);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noiseHit(t, dur, vol) {
  if (!ac) return;
  var src = ac.createBufferSource(), g = ac.createGain();
  src.buffer = noiseBuf; g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(g); g.connect(master); src.start(t); src.stop(t + dur + 0.02);
}
function kick(t)  { tone('sine', 150, 44, t, 0.13, 0.5); }
function snare(t) { noiseHit(t, 0.09, 0.24); tone('triangle', 200, 120, t, 0.06, 0.1); }
function hat(t)   { noiseHit(t, 0.026, 0.07); }
function bassN(semi, t, dur, root) { tone('square', root * Math.pow(2, semi / 12), 0, t, dur, 0.1); }
function leadN(semi, t, dur, root, vol) { tone('square', root * Math.pow(2, semi / 12), 0, t, dur, vol || 0.07); }

/* ---- SFX table ---- */
function sfx(name) {
  ensureAudio(); if (!ac) return;
  var t = tnow();
  switch (name) {
    case 'blip':   tone('square', 620, 0, t, 0.04, 0.09); break;
    case 'select': tone('square', 720, 940, t, 0.06, 0.11); break;
    case 'cancel': tone('square', 360, 220, t, 0.07, 0.1); break;
    case 'cursor': tone('square', 500, 0, t, 0.03, 0.07); break;
    case 'bump':   tone('square', 150, 90, t, 0.06, 0.09); break;
    case 'step':   tone('square', 240, 0, t, 0.015, 0.03); break;
    case 'hit':    tone('square', 300, 160, t, 0.09, 0.14); noiseHit(t, 0.05, 0.12); break;
    case 'crit':   tone('square', 520, 900, t, 0.1, 0.16); noiseHit(t, 0.06, 0.14); break;
    case 'onbeat': tone('square', 880, 1320, t, 0.08, 0.15); break;
    case 'weak':   tone('sawtooth', 220, 120, t, 0.14, 0.1); break;
    case 'super':  tone('square', 700, 0, t, 0.05, 0.13); tone('square', 1050, 0, t + 0.05, 0.08, 0.12); break;
    case 'heal':   tone('sine', 520, 780, t, 0.12, 0.13); tone('sine', 780, 1040, t + 0.08, 0.1, 0.1); break;
    case 'status': tone('sawtooth', 300, 180, t, 0.16, 0.12); break;
    case 'faint':  tone('sawtooth', 300, 60, t, 0.4, 0.16); break;
    case 'item':   tone('square', 660, 990, t, 0.08, 0.12); break;
    case 'save':   tone('sine', 440, 660, t, 0.1, 0.12); tone('sine', 660, 880, t + 0.1, 0.12, 0.1); break;
    case 'door':   noiseHit(t, 0.12, 0.1); tone('square', 200, 120, t, 0.1, 0.08); break;
    case 'showstopper': for (var i = 0; i < 4; i++) tone('square', 440 * Math.pow(2, i / 4), 0, t + i * 0.05, 0.1, 0.14); break;
    case 'whoosh': noiseHit(t, 0.9, 0.16); tone('sawtooth', 900, 80, t, 0.9, 0.08); break;
    case 'boom':   noiseHit(t, 0.7, 0.45); tone('sine', 130, 30, t, 0.6, 0.45); break;
    case 'sparkle':tone('square', 1200, 1700, t, 0.06, 0.1); tone('square', 1700, 2200, t + 0.05, 0.05, 0.08); break;
    case 'reveal': tone('sine', 300, 900, t, 0.9, 0.14); break;
  }
}
function jingle(name) {
  ensureAudio(); if (!ac) return;
  var t = tnow(), seq, root, i;
  if (name === 'win')   { seq = [0, 4, 7, 12, 16]; root = 392; }
  else if (name === 'level') { seq = [0, 5, 7, 12]; root = 440; }
  else if (name === 'lose')  { seq = [7, 5, 3, 0]; root = 220; }
  else if (name === 'get')   { seq = [7, 12, 16, 19]; root = 330; }
  else return;
  for (i = 0; i < seq.length; i++)
    tone('square', root * Math.pow(2, seq[i] / 12), 0, t + i * (name === 'lose' ? 0.16 : 0.1), 0.15, 0.15);
}

/* ---- music: 16-step (2-bar) patterns + a lead melody line ---- */
function K(list) { var a = []; for (var i = 0; i < 16; i++) a.push(list.indexOf(i) >= 0 ? 1 : 0); return a; }
var N8 = [0, 2, 4, 6, 8, 10, 12, 14];
var ALL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var TRACKS = {
  manor:  { bpm: 84, root: 65.4, kick: K([0, 8]), snare: K([4, 12]), hat: K(N8),
            bass: [0, null, null, null, 7, null, null, null, 5, null, null, null, 7, null, 3, null],
            lead: [12, null, 15, null, 19, null, 15, null, 17, null, 12, null, 10, null, 12, null] },
  town:   { bpm: 96, root: 65.4, kick: K([0, 8]), snare: K([4, 12]), hat: K(N8),
            bass: [0, null, 7, null, 5, null, 7, null, 0, null, 7, null, 3, null, 5, null],
            lead: [12, 14, 15, null, 17, null, 15, 12, 10, null, 12, null, 7, null, null, null] },
  rome:   { bpm: 100, root: 65.4, kick: K([0, 6, 8]), snare: K([4, 12]), hat: K(N8),
            bass: [0, null, null, null, 3, null, null, null, 7, null, null, null, 3, null, 10, null],
            lead: [12, null, 15, 17, 15, null, 12, null, 10, null, 12, 15, 12, null, 10, null] },
  west:   { bpm: 112, root: 73.4, kick: K([0, 6, 8, 14]), snare: K([4, 12]), hat: K(N8),
            bass: [0, null, 7, null, 0, null, 7, null, 5, null, 3, null, 0, null, 7, null],
            lead: [0, null, 4, null, 7, 4, 0, null, 5, null, 3, null, 0, null, null, null] },
  disco:  { bpm: 124, root: 55, kick: K(N8), snare: K([4, 12]), hat: K(ALL),
            bass: [0, 12, null, 12, 0, 12, null, 12, 3, 15, null, 15, 5, 17, null, 12],
            lead: [12, 15, 19, 15, 12, 15, 19, 22, 19, 15, 12, 15, 17, 15, 12, null] },
  london: { bpm: 120, root: 61.7, kick: K([0, 6, 8, 14]), snare: K([4, 12]), hat: K(N8),
            bass: [0, null, null, 3, null, null, 7, null, 8, null, 7, null, 3, null, null, null],
            lead: [12, null, 15, null, 19, null, 15, null, 20, null, 19, null, 15, null, 12, null] },
  xmas:   { bpm: 104, root: 65.4, kick: K([0, 8]), snare: K([4, 12]), hat: K(ALL),
            bass: [0, null, 4, null, 7, null, 4, null, 5, null, 9, null, 7, null, 4, null],
            lead: [12, null, 16, 19, 16, null, 12, null, 14, null, 17, 21, 19, 17, 16, null] },
  jazz:   { bpm: 92, root: 58.3, kick: K([0, 10]), snare: K([4, 12]), hat: K([0, 3, 4, 7, 8, 11, 12, 15]),
            bass: [0, 2, 3, 5, 7, 9, 10, 7, 5, 3, 2, 0, 10, 9, 7, 5],
            lead: [null, 15, null, 14, 12, null, 10, null, null, 12, 14, 15, 17, null, 15, 12] },
  battle: { bpm: 130, root: 82.4, kick: K([0, 4, 8, 12]), snare: K([4, 12]), hat: K(ALL),
            bass: [0, null, 0, 7, 0, null, 3, null, 5, null, 5, 12, 5, null, 7, null],
            lead: [12, 15, 12, null, 10, 12, 10, null, 8, 10, 8, null, 7, null, 12, null] },
  boss:   { bpm: 146, root: 77.8, kick: K([0, 3, 6, 8, 11, 14]), snare: K([4, 12]), hat: K(ALL),
            bass: [0, 0, 12, 3, 0, 0, 7, 3, 5, 5, 15, 8, 5, 5, 10, 7],
            lead: [12, null, 11, 12, 15, null, 12, 11, 10, null, 12, 15, 19, null, 15, 12] },
  finale: { bpm: 150, root: 82.4, kick: K([0, 2, 4, 6, 8, 10, 12, 14]), snare: K([4, 12]), hat: K(ALL),
            bass: [0, 12, 0, 12, 7, 12, 7, 12, 5, 12, 5, 12, 8, 12, 10, 15],
            lead: [12, 16, 19, 24, 19, 16, 12, 16, 17, 21, 24, 21, 17, 14, 12, 19] }
};
var Music = { on: false, tr: null, name: '', step: 0, next: 0 };
function musicStart(name, at) {
  ensureAudio();
  var tr = TRACKS[name]; if (!tr) return;
  if (Music.on && Music.name === name) return; /* already playing */
  Music.on = true; Music.tr = tr; Music.name = name; Music.step = 0;
  Music.next = (at !== undefined) ? at : tnow() + 0.06;
}
function musicStop() { Music.on = false; Music.name = ''; }
function musicTick() {
  if (!Music.on || !ac) return;
  var tr = Music.tr, sl = 30 / tr.bpm, guard = 0;
  while (Music.next < tnow() + 0.16 && guard++ < 64) {
    var st = Music.step % 16, t = Math.max(Music.next, tnow());
    if (tr.kick[st]) kick(t);
    if (tr.snare[st]) snare(t);
    if (tr.hat[st]) hat(t);
    var b = tr.bass[st];
    if (b !== null && b !== undefined) bassN(b, t, sl * 0.9, tr.root);
    if (tr.lead) { var l = tr.lead[st]; if (l !== null && l !== undefined) leadN(l, t, sl * 0.8, tr.root * 2, 0.06); }
    Music.step++; Music.next += sl;
  }
}
