/* make-boxart.js — print-ready physical box art (4.5in x 6.5in @ 300dpi = 1350x1950px),
   modeled on the classic GBA / Pokemon Emerald box format:
   FRONT: vertical silver DADDYBOY ADVANCE band, arched logo, one big hero on a
   glittery radial-burst field, rating box + company + publisher logos at bottom.
   BACK: dark panel with blurb + bullets left, stacked framed screenshots + QR
   right, character overlapping the panel, barcode / seal / model strip below.
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
  global.window = { addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined };
  global.document = { getElementById: () => ({ getContext: () => cv.ctx }), querySelectorAll: () => [] };
  global.performance = { now: () => 0 };
  global.requestAnimationFrame = () => {};
  global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  const src = "var BIRTHDAY_NAME='LANE ALLISON';var DEDICATION='THE GREATEST DADDY OF ALL';\n" + bundleOnly();
  const run = new Function(src + ';return { px, drawText, drawTextO, textW, SPR, COL, ctx, fillEll, strokeEll };');
  return { G: run(), cv };
}

/* ---- real screenshots for the back ---- */
function screenshot(setup) {
  const { loadGame, advanceUntil, isWorld } = require('./qa.js');
  const h = loadGame(); const G = h.G;
  h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
  advanceUntil(h, isWorld, 6000);
  setup(h, G);
  h.step(6);
  return h.cv.buf.slice();
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

/* ---- helpers ---- */
function blitScaled(cv, shotBuf, dx0, dy0, dw, dh) { // 240x160 -> dw x dh
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const sx = Math.floor(x * 240 / dw), sy = Math.floor(y * 160 / dh);
    const si = (sy * 240 + sx) * 4, di = ((dy0 + y) * W + (dx0 + x)) * 4;
    cv.buf[di] = shotBuf[si]; cv.buf[di + 1] = shotBuf[si + 1]; cv.buf[di + 2] = shotBuf[si + 2]; cv.buf[di + 3] = 255;
  }
}
/* render text on a scratch canvas, blit it rotated 90° CCW (reads bottom-to-top) */
function vertText(destCv, text, scale, color, dx, dy) {
  const sw = 220, sh = 20;
  const { G: S, cv: scv } = loadArt(sw, sh);
  S.px(0, 0, sw, sh, '#ff00ff');
  S.drawText(text, 0, 2, color, scale);
  const tw = S.textW(text, scale), th = 5 * scale + 4;
  for (let xx = 0; xx < tw; xx++) for (let yy = 0; yy < th; yy++) {
    const si = (yy * sw + xx) * 4;
    if (scv.buf[si] === 255 && scv.buf[si + 1] === 0 && scv.buf[si + 2] === 255) continue;
    const dxp = dx + yy, dyp = dy + (tw - 1 - xx);
    if (dxp < 0 || dyp < 0 || dxp >= W || dyp >= H) continue;
    const di = (dyp * W + dxp) * 4;
    destCv.buf[di] = scv.buf[si]; destCv.buf[di + 1] = scv.buf[si + 1]; destCv.buf[di + 2] = scv.buf[si + 2]; destCv.buf[di + 3] = 255;
  }
  return tw;
}
/* arched logo text (letters follow a Pokemon-logo-style arc, ends dipping down) */
function archText(G, text, cx, baseY, scale, amp, fill, outline) {
  const total = G.textW(text, scale);
  let x = Math.round(cx - total / 2);
  const n = text.length;
  for (let i = 0; i < n; i++) {
    const ch = text[i];
    const t = (i / (n - 1)) * 2 - 1;                 // -1..1
    const yoff = Math.round(amp * t * t);            // ends dip down
    if (ch !== ' ') G.drawTextO(ch, x, baseY + yoff, fill, outline, scale);
    x += G.textW(ch, scale) || 4 * scale;
  }
}
/* the glittery radial-burst field (Emerald-style, in DaddyBoy purple) */
function glitterField(G, cx, cy) {
  const { px } = G;
  px(0, 0, W, H, '#3a2560');
  for (let i = 0; i < 28; i++) {                     /* radial light rays */
    const a = (i / 28) * Math.PI * 2;
    for (let r = 6; r < 460; r += 3) {
      const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (x < -4 || y < -4 || x >= W + 4 || y >= H + 4) break;
      if (i % 2 === 0 && x >= 0 && y >= 0 && x < W && y < H) px(x, y, 2, 2, '#472e73');
    }
  }
  const tones = ['#2c1a44', '#54398a', '#63459e', '#3f2a6b'];
  for (let i = 0; i < 240; i++) {                    /* glitter facets */
    const x = (i * 97 + 31) % W, y = (i * 61 + 17) % H, s = 2 + (i % 4);
    px(x, y, s, s, tones[i % 4]);
  }
  for (let i = 0; i < 26; i++) {                     /* white sparkles */
    const x = (i * 143 + 53) % (W - 8), y = (i * 89 + 29) % (H - 8);
    px(x + 2, y, 1, 5, '#cfc2ec'); px(x, y + 2, 5, 1, '#cfc2ec'); px(x + 2, y + 2, 1, 1, '#ffffff');
  }
}
function centerXAt(G, s, scale, cx) { return Math.round(cx - G.textW(s, scale) / 2); }

/* ================= FRONT COVER ================= */
console.log('composing front cover...');
{
  const { G, cv } = loadArt(W, H);
  const { px, drawText, drawTextO, SPR, COL, ctx, fillEll } = G;
  const BAND = 28, CX = BAND + (W - BAND) / 2;       // content centers right of the band
  glitterField(G, CX, 235);
  px(0, 0, W, 2, '#1a0f2e'); px(0, H - 2, W, 2, '#1a0f2e'); px(W - 2, 0, 2, H, '#1a0f2e');
  /* ---- vertical silver hardware band (GBA style) ---- */
  for (let x = 0; x < BAND; x++) { const t = x / BAND; const v = Math.round(150 + 60 * Math.sin(t * Math.PI)); px(x, 0, 1, H, 'rgb(' + v + ',' + v + ',' + (v + 8) + ')'); }
  px(BAND, 0, 2, H, '#1a0f2e');
  px(0, 0, BAND, 34, '#3d2b6b');                     /* ONLY FOR tab */
  vertText(cv, 'ONLY FOR', 1, '#ffffff', 9, 3);
  vertText(cv, 'DADDYBOY ADVANCE', 2, '#22224a', 5, 44);
  /* ---- arched logo ---- */
  archText(G, 'DOWNTON', CX, 24, 4, 7, COL.gold, '#1a2138');
  archText(G, 'DADDIES', CX, 56, 4, 7, COL.gold, '#1a2138');
  drawTextO('BARS THROUGH', centerXAt(G, 'BARS THROUGH', 2, CX), 94, '#f6f6fa', '#1a2138', 2);
  drawTextO('TIME', centerXAt(G, 'TIME', 2, CX), 110, '#f6f6fa', '#1a2138', 2);
  /* ---- the box legendary: BIG Samuel ---- */
  ctx.save(); ctx.translate(CX - 72, 142); ctx.scale(3, 3); SPR.samuel(0, 0); ctx.restore();
  /* gold connected-badge (right side, Emerald-style) */
  fillEll(226, 286, 262, 322, COL.gold); G.strokeEll(226, 286, 262, 322, '#8a6a1e');
  drawText('100%', 234, 294, '#5a3c0a', 1);
  drawText('BIRTH', 233, 301, '#5a3c0a', 1);
  drawText('DAY', 238, 308, '#5a3c0a', 1);
  /* ---- rating box (ESRB-style, lower-left) ---- */
  px(34, 330, 30, 38, '#ffffff'); px(35, 331, 28, 36, '#000000'); px(36, 332, 26, 30, '#ffffff');
  drawTextO('D', 44, 336, '#000000', '#ffffff', 3);
  drawText('DADDY', 36, 355, '#000000', 1);
  vertText(cv, 'RATED BY DAD', 1, '#e8e0f8', 66, 330);
  /* company + publisher */
  drawText('THE DOWNTON DADDIES COMPANY', centerXAt(G, 'THE DOWNTON DADDIES COMPANY', 1, CX), 374, '#f6f6fa', 1);
  fillEll(206, 354, 262, 370, '#c8102e');
  drawTextO('DADDYSOFT', 209, 359, '#ffffff', '#8a0a1e', 1);
  fs.writeFileSync(path.join(OUT, 'cover-front.png'), encodePNG(cv.buf, W, H, SCALE));
  console.log('  print/cover-front.png (1350x1950 @300dpi = 4.5x6.5in)');
}

/* ================= BACK COVER ================= */
console.log('composing back cover...');
const qr = QR.create(URL, { errorCorrectionLevel: 'M' }).modules;
{
  const { G, cv } = loadArt(W, H);
  const { px, drawText, drawTextO, SPR, COL, ctx, fillEll } = G;
  glitterField(G, 135, 40);
  px(0, 0, W, 2, '#1a0f2e'); px(0, H - 2, W, 2, '#1a0f2e'); px(0, 0, 2, H, '#1a0f2e'); px(W - 2, 0, 2, H, '#1a0f2e');
  /* ---- top-left: small logo block ---- */
  archText(G, 'DOWNTON', 62, 8, 2, 3, COL.gold, '#1a2138');
  archText(G, 'DADDIES', 62, 24, 2, 3, COL.gold, '#1a2138');
  drawTextO('BARS THROUGH TIME', 14, 40, '#f6f6fa', '#1a2138', 1);
  /* ---- top-right: hardware compatibility strip ---- */
  px(158, 8, 100, 14, '#ffffff'); px(159, 9, 98, 12, '#1a0f2e');
  drawText('DADDYBOY ADVANCE', 163, 13, '#ffffff', 1);
  px(158, 26, 100, 12, '#ffffff');
  drawText('ANY BROWSER', 178, 29, '#000000', 1);
  drawText('NOT COMPATIBLE', 158, 41, '#ff8a9a', 1);
  drawText('WITH BEING SAD.', 158, 49, '#ff8a9a', 1);
  /* ---- the big dark panel ---- */
  px(10, 58, 250, 268, '#160b28'); px(12, 60, 246, 264, '#231240');
  px(10, 58, 250, 1, COL.gold); px(10, 325, 250, 1, COL.gold); px(10, 58, 1, 268, COL.gold); px(259, 58, 1, 268, COL.gold);
  /* blurb (left column) */
  const blurb = [
    'HISTORY IS UNSTABLE - THE',
    'TIME ENGINE HAS EXPLODED!',
    'YOUR BARS WILL BE TESTED',
    'LIKE NEVER BEFORE. RESCUE',
    'THE SCATTERED DADDIES IN',
    'ROME, DODGE CITY, DISCO-',
    'ERA NEW YORK AND A REALM',
    'OF GOBLINS - THEN TAKE',
    'THE THEATRE BACK FROM',
    'THE SCRIPTED ORDER!'
  ];
  blurb.forEach((l, i) => drawText(l, 18, 66 + i * 9, '#f6f6fa', 1));
  /* bullets */
  const feats = ['FOUR PLAYABLE DADDIES.', 'CRAWL THE HYPOGEUM.', 'WIN THE CROWD.', '12 GOLDEN MUSTACHES.'];
  feats.forEach((f, i) => { px(18, 162 + i * 10 + 1, 3, 3, COL.gold); drawText(f, 25, 162 + i * 10, '#e8e0f8', 1); });
  /* character overlapping the panel (Emerald's May slot) */
  ctx.save(); ctx.translate(34, 204); ctx.scale(2, 2); SPR.william(0, 0); ctx.restore();
  drawText('THE FRONT LINE', 160, 312, COL.gold, 1);
  drawText('OF RAP BATTLING!', 160, 320, COL.gold, 1);
  /* ---- right column: 2 framed screenshots + QR box ---- */
  function shotFrame(x, y, w2, h2) { px(x - 2, y - 2, w2 + 4, h2 + 4, '#ffffff'); px(x - 1, y - 1, w2 + 2, h2 + 2, '#000000'); }
  shotFrame(160, 62, 90, 60); blitScaled(cv, shotBattle, 160, 62, 90, 60);
  shotFrame(160, 132, 90, 60); blitScaled(cv, shotHypo, 160, 132, 90, 60);
  /* QR as the third callout: generous white quiet zone */
  const qs = qr.size, mod = 2;                       // 37*2 = 74
  px(158, 202, 94, 104, '#ffffff');
  const qx = 158 + Math.round((94 - qs * mod) / 2), qy = 208;
  for (let r = 0; r < qs; r++) for (let c = 0; c < qs; c++)
    if (qr.get(r, c)) px(qx + c * mod, qy + r * mod, mod, mod, '#000000');
  drawText('SCAN TO PLAY', 172, 288, '#000000', 1);
  drawText('ANY PHONE.', 178, 297, '#000000', 1);
  /* ---- bottom strip (on the field) ---- */
  px(14, 334, 74, 40, '#ffffff');                    /* barcode */
  let bxx = 18; const seed = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1];
  seed.forEach((w2, i) => { if (i % 2 === 0) px(bxx, 338, w2, 24, '#000000'); bxx += w2 + 1; });
  drawText('1 8 8 9 0 7 1 2', 20, 364, '#000000', 1);
  fillEll(96, 336, 132, 372, COL.gold); G.strokeEll(96, 336, 132, 372, '#8a6a1e');  /* seal */
  drawText('SEAL', 106, 344, '#5a3c0a', 1);
  drawText('OF', 111, 351, '#5a3c0a', 1);
  drawText('QUALITY', 100, 358, '#5a3c0a', 1);
  drawText('MODEL NO. DBA-1889', 142, 338, '#f6f6fa', 1);
  drawText('THE DOWNTON DADDIES CO.', 142, 348, '#c9b6e6', 1);
  drawText('(C) 1889 DADDYSOFT', 142, 358, '#c9b6e6', 1);
  fillEll(208, 364, 260, 378, '#c8102e');
  drawTextO('DADDYSOFT', 211, 368, '#ffffff', '#8a0a1e', 1);
  drawTextO('MADE FOR LANE ALLISON - THE GREATEST DADDY OF ALL', centerXAt(G, 'MADE FOR LANE ALLISON - THE GREATEST DADDY OF ALL', 1, 135), 381, COL.gold, '#1a0f2e', 1);
  fs.writeFileSync(path.join(OUT, 'cover-back.png'), encodePNG(cv.buf, W, H, SCALE));
  console.log('  print/cover-back.png (1350x1950 @300dpi = 4.5x6.5in)');
}

/* ================= STANDALONE QR ================= */
QR.toFile(path.join(OUT, 'qr-code.png'), URL, { width: 1200, margin: 4, errorCorrectionLevel: 'M' }, (e) => {
  if (e) throw e;
  console.log('  print/qr-code.png (1200x1200, scan -> ' + URL + ')');
  console.log('BOX ART DONE');
});
