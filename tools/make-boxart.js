/* make-boxart.js — print-ready physical box art (4.5in x 6.5in @ 300dpi = 1350x1950px).
   Composes at 270x390 in the game's own pixel style (real sprite painters + font),
   embeds real screenshots on the back, stamps a scannable QR, then upscales 5x.
   Outputs: print/cover-front.png, print/cover-back.png, print/qr-code.png */
const fs = require('fs');
const path = require('path');
const { makeCanvas, encodePNG } = require('./canvas.js');
const { bundleOnly } = require('../build.js');
const QR = require(process.env.QR_LIB || '/private/tmp/claude-501/-Users-pationeill-Desktop-dd-advance-kit/c9853315-07c0-48fc-8efd-b6efac7ce17c/scratchpad/node_modules/qrcode');

const URL = 'https://tpatoneill.github.io/downton-daddies-bars-through-time/';
const W = 270, H = 390, SCALE = 5; // -> 1350x1950 (4.5x6.5in @ 300dpi)
const OUT = path.join(__dirname, '..', 'print');
fs.mkdirSync(OUT, { recursive: true });

/* ---- load the game bundle bound to an arbitrary canvas, exporting draw internals ---- */
function loadArt(w, h) {
  const cv = makeCanvas(w, h);
  let raf = null;
  global.window = { addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined };
  global.document = { getElementById: () => ({ getContext: () => cv.ctx }), querySelectorAll: () => [] };
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = cb => { raf = cb; };
  global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  const src = "var BIRTHDAY_NAME='LANE ALLISON';var DEDICATION='THE GREATEST DADDY OF ALL';\n" + bundleOnly();
  const run = new Function(src + ';return { px, drawText, drawTextO, textW, panel, SPR, COL, ctx, fillEll };');
  return { G: run(), cv };
}

/* ---- real screenshots for the back (normal 240x160 instances) ---- */
function screenshot(setup) {
  const { loadGame, advanceUntil, isWorld } = require('./qa.js');
  const h = loadGame(); const G = h.G;
  h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
  advanceUntil(h, isWorld, 6000);
  setup(h, G);
  h.step(6);
  return h.cv.buf.slice(); // copy
}
console.log('rendering in-game screenshots...');
const shotBattle = screenshot((h, G) => {
  G.Game.party = [G.makeFighter('samuel', 7), G.makeFighter('herschel', 7)];
  G.startBattle({ enemies: [{ boss: 'maximvs' }], music: 'boss', canFlee: false, bg: 'rome' }, () => {});
  const b = G.getScene(); b.transT = b.transDur; b.phase = 'menu';
});
const shotHypo = screenshot((h, G) => {
  ['act0_tutorial', 'rome_arrived_seen', 'hypo_seen'].forEach(f => G.setFlag(f));
  G.Game.party = [G.makeFighter('samuel', 6)];
  G.Game.map = 'hypogeum'; G.Game.px = 8; G.Game.py = 6; G.Game.dir = 'up'; G.setScene(G.World);
});
const shotDisco = screenshot((h, G) => {
  ['act0_tutorial', 'nyc_arrived_seen', 'rosalind_joined'].forEach(f => G.setFlag(f));
  G.Game.party = [G.makeFighter('samuel', 10)];
  G.Game.map = 'clubinferno'; G.Game.px = 8; G.Game.py = 7; G.Game.dir = 'down'; G.setScene(G.World);
});

/* ---- helpers ---- */
function blitHalf(cv, shotBuf, dx0, dy0) { // 240x160 -> 120x80 into comp buffer
  for (let y = 0; y < 80; y++) for (let x = 0; x < 120; x++) {
    const si = ((y * 2) * 240 + (x * 2)) * 4, di = ((dy0 + y) * W + (dx0 + x)) * 4;
    cv.buf[di] = shotBuf[si]; cv.buf[di + 1] = shotBuf[si + 1]; cv.buf[di + 2] = shotBuf[si + 2]; cv.buf[di + 3] = 255;
  }
}
function centerX(G, s, scale) { return Math.round((W - G.textW(s, scale)) / 2); }

/* ================= FRONT COVER ================= */
console.log('composing front cover...');
{
  const { G, cv } = loadArt(W, H);
  const { px, drawText, drawTextO, SPR, COL, ctx } = G;
  px(0, 0, W, H, '#241238');
  for (let y = 0; y < H; y += 6) px(0, y, W, 3, (y / 6) % 2 ? '#2c1a44' : '#341d52');
  /* top hardware band (GBA-box style) */
  px(0, 0, W, 26, '#160b28'); px(0, 26, W, 2, COL.gold);
  drawText('DADDYBOY', 10, 7, COL.gold, 1); drawText('ADVANCE', 62, 7, '#c9b6e6', 1);
  drawText('VIDEO GAME CARTRIDGE... SPIRITUALLY', 10, 17, '#5a5578', 1);
  px(238, 5, 24, 16, '#2c1a44'); px(241, 8, 18, 10, '#4ff0ff'); /* little screen icon */
  /* gold spoke burst behind everything center */
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    for (let r = 24; r < 130; r += 6) px(Math.round(135 + Math.cos(a) * r), Math.round(235 + Math.sin(a) * r * 0.72), 2, 2, i % 2 ? '#3a2a5a' : '#4a3568');
  }
  /* crest top hat */
  const hx = 135;
  px(hx - 30, 36, 60, 26, COL.black); px(hx - 30, 54, 60, 5, COL.hatband); px(hx - 44, 62, 88, 6, COL.black);
  /* title */
  drawTextO('DOWNTON', centerX(G, 'DOWNTON', 4), 76, COL.gold, COL.black, 4);
  drawTextO('DADDIES', centerX(G, 'DADDIES', 4), 104, COL.gold, COL.black, 4);
  drawTextO('BARS THROUGH TIME', centerX(G, 'BARS THROUGH TIME', 2), 134, COL.pink, COL.black, 2);
  px(40, 152, 190, 1, COL.gold);
  /* character lineup: back row William + Rosalind, front center Samuel (mustache intact!) */
  ctx.save(); ctx.translate(34, 196); ctx.scale(1.5, 1.5); SPR.william(0, 0); ctx.restore();
  ctx.save(); ctx.translate(164, 196); ctx.scale(1.5, 1.5); SPR.rosalind(0, 0); ctx.restore();
  ctx.save(); ctx.translate(8, 224); ctx.scale(1.5, 1.5); SPR.herschel(0, 0); ctx.restore();
  ctx.save(); ctx.translate(198, 224); ctx.scale(1.5, 1.5); SPR.maximvs(0, 0); ctx.restore();
  ctx.save(); ctx.translate(87, 200); ctx.scale(2, 2); SPR.samuel(0, 0); ctx.restore();
  /* goblins peeking from the bottom corners */
  ctx.save(); ctx.translate(2, 320); SPR.goblin(0, 0); ctx.restore();
  ctx.save(); ctx.translate(222, 320); SPR.goblin(0, 0); ctx.restore();
  /* confetti */
  const conf = [[20,170],[60,160],[120,158],[190,164],[240,175],[30,300],[130,310],[250,290],[80,330],[180,335]];
  conf.forEach((p, i) => px(p[0], p[1], 3, 3, ['#e05f8f', '#e2b23e', '#349c8e', '#8b5cf6', '#4ff0ff'][i % 5]));
  /* tagline ribbon */
  px(0, 336, W, 18, '#160b28'); px(0, 335, W, 1, COL.gold); px(0, 354, W, 1, COL.gold);
  drawTextO('SPIT BARS ACROSS ALL OF HISTORY.', centerX(G, 'SPIT BARS ACROSS ALL OF HISTORY.', 1), 341, COL.cream, COL.black, 1);
  /* bottom band */
  px(0, 358, W, 32, '#160b28');
  drawTextO('DADDYSOFT', centerX(G, 'DADDYSOFT', 2), 363, COL.gold, COL.black, 2);
  drawText('(C) 1889 DADDYSOFT - MADE WITH LOVE AND TOP HATS', centerX(G, '(C) 1889 DADDYSOFT - MADE WITH LOVE AND TOP HATS', 1), 380, '#5a5578', 1);
  fs.writeFileSync(path.join(OUT, 'cover-front.png'), encodePNG(cv.buf, W, H, SCALE));
  console.log('  print/cover-front.png (1350x1950 @300dpi = 4.5x6.5in)');
}

/* ================= BACK COVER ================= */
console.log('composing back cover...');
QR.create(URL, { errorCorrectionLevel: 'M' }); // warm
const qr = QR.create(URL, { errorCorrectionLevel: 'M' }).modules; // size x size, .get(r,c)
{
  const { G, cv } = loadArt(W, H);
  const { px, drawText, drawTextO, SPR, COL, ctx } = G;
  px(0, 0, W, H, '#241238');
  for (let y = 0; y < H; y += 6) px(0, y, W, 3, (y / 6) % 2 ? '#2c1a44' : '#341d52');
  /* header */
  px(0, 0, W, 24, '#160b28'); px(0, 24, W, 2, COL.gold);
  drawTextO('THE SHOW MUST GO ON.', 10, 4, COL.gold, COL.black, 1);
  drawTextO('THROUGH ALL OF TIME.', 10, 14, COL.pink, COL.black, 1);
  ctx.save(); ctx.translate(232, 2); ctx.scale(0.45, 0.45); SPR.samuel(0, 0); ctx.restore();
  /* blurb */
  const blurb = [
    'AN EXPLOSION. A SCATTERED TEAM. A TIME',
    'MACHINE FULL OF GOBLINS. SAMUEL MUST',
    'RESCUE THE DADDIES ACROSS ROME, DODGE',
    'CITY, DISCO-ERA NEW YORK AND BEYOND -',
    'AND TAKE BACK THE THEATRE FROM THE',
    'SCRIPTED ORDER. IN RAP BATTLES.'
  ];
  blurb.forEach((l, i) => drawText(l, 10, 34 + i * 9, COL.cream, 1));
  /* screenshots row 1 (real captures) */
  function frame(x, y) { px(x - 2, y - 2, 124, 84, COL.gold); px(x - 1, y - 1, 122, 82, COL.black); }
  frame(10, 96); blitHalf(cv, shotBattle, 10, 96);
  frame(140, 96); blitHalf(cv, shotHypo, 140, 96);
  drawText('BATTLE THE CHAMPION', 10, 179, '#c9b6e6', 1);
  drawText('CRAWL THE HYPOGEUM', 140, 179, '#c9b6e6', 1);
  /* screenshot row 2 + features */
  frame(10, 194); blitHalf(cv, shotDisco, 10, 194);
  drawText('BOOGIE THROUGH TIME', 10, 277, '#c9b6e6', 1);
  const feats = ['4 PLAYABLE DADDIES', '6 ERAS OF HISTORY', 'TURN-BASED RAP BATTLES', 'WIN THE CROWD.', 'STEAL THE SHOW.', 'GOLDEN MUSTACHES', 'A SECRET WORTH SINGING'];
  feats.forEach((f, i) => { px(140, 196 + i * 12, 4, 4, COL.gold); drawText(f, 148, 194 + i * 12, COL.white, 1); });
  /* dedication ribbon */
  px(0, 284, W, 19, '#160b28'); px(0, 283, W, 1, COL.gold); px(0, 303, W, 1, COL.gold);
  drawTextO('MADE FOR LANE ALLISON -', centerX(G, 'MADE FOR LANE ALLISON -', 1), 286, COL.gold, COL.black, 1);
  drawTextO('THE GREATEST DADDY OF ALL', centerX(G, 'THE GREATEST DADDY OF ALL', 1), 295, COL.pink, COL.black, 1);
  /* QR (scannable): full white quiet zone, nothing drawn over it */
  const qs = qr.size, mod = 2, qx = 14, qy = 310;
  px(qx - 6, 304, qs * mod + 12, 86, '#ffffff'); /* generous quiet zone, 304..390 */
  for (let r = 0; r < qs; r++) for (let c = 0; c < qs; c++)
    if (qr.get(r, c)) px(qx + c * mod, qy + r * mod, mod, mod, '#000000');
  /* center info column */
  const bx = 104;
  px(bx, 310, 56, 22, COL.white); px(bx + 1, 311, 54, 20, COL.black);
  drawText('RATED', bx + 16, 313, COL.white, 1); drawTextO('D', bx + 24, 320, COL.gold, COL.black, 1);
  drawText('DADDY', bx + 15, 325, COL.white, 1);
  drawText('1 PLAYER', bx + 6, 338, '#c9b6e6', 1);
  drawText('SAVES: YES', bx + 2, 348, '#c9b6e6', 1);
  drawText('HIPS: BOTH', bx + 2, 358, '#c9b6e6', 1);
  drawTextO('SCAN QR TO PLAY', bx - 2, 370, COL.gold, COL.black, 1);
  drawText('ANY BROWSER.', bx + 4, 380, '#c9b6e6', 1);
  /* fake barcode */
  px(188, 310, 72, 40, '#ffffff');
  let bxx = 192; const seed = [3,1,2,1,1,3,1,2,2,1,3,1,1,2,1,3,2,1,1,2,3,1];
  seed.forEach((w2, i) => { if (i % 2 === 0) px(bxx, 314, w2, 28, '#000000'); bxx += w2 + 1; });
  drawText('1 8 8 9 0 7 1 2', 194, 343, '#000000', 1);
  drawText('DADDYSOFT 1889', 190, 354, '#5a5578', 1);
  drawText('NO BATTERIES.', 190, 366, '#5a5578', 1);
  drawText('NO REGRETS.', 190, 376, '#5a5578', 1);
  fs.writeFileSync(path.join(OUT, 'cover-back.png'), encodePNG(cv.buf, W, H, SCALE));
  console.log('  print/cover-back.png (1350x1950 @300dpi = 4.5x6.5in)');
}

/* ================= STANDALONE QR ================= */
QR.toFile(path.join(OUT, 'qr-code.png'), URL, { width: 1200, margin: 4, errorCorrectionLevel: 'M' }, (e) => {
  if (e) throw e;
  console.log('  print/qr-code.png (1200x1200, scan -> ' + URL + ')');
  console.log('BOX ART DONE');
});
