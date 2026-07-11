/* make-boxart.js v3 — print-ready physical box art (4.5in x 6.5in @ 300dpi = 1350x1950),
   in the SMOOTH painted style of the real GBA/Pokemon Emerald box (not pixel art):
   2x supersampled vector-ish cartoon rendering with anti-aliasing. Pixel art appears
   ONLY in the back cover's real gameplay screenshots. All four dads on the front.
   Outputs: print/cover-front.png, print/cover-back.png, print/qr-code.png */
const fs = require('fs');
const path = require('path');
const { encodePNG } = require('./canvas.js');
const { bundleOnly } = require('../build.js');
const QR = require(process.env.QR_LIB || '/private/tmp/claude-501/-Users-pationeill-Desktop-dd-advance-kit/c9853315-07c0-48fc-8efd-b6efac7ce17c/scratchpad/node_modules/qrcode');

const URL = 'https://tpatoneill.github.io/downton-daddies-bars-through-time/';
const FW = 1350, FH = 1950, SS = 2;          // final size + supersample factor
const W = FW * SS, H = FH * SS;
const OUT = path.join(__dirname, '..', 'print');
fs.mkdirSync(OUT, { recursive: true });

/* ---------- pixel FONT data (borrowed from the game source, for print text) ---------- */
const FONT = (() => {
  const src = bundleOnly();
  const m = src.match(/var FONT = \{[\s\S]*?\n\};/);
  return new Function(m[0] + '; return FONT;')();
})();
function glyphW(ch) { const g = FONT[ch.toUpperCase()]; return ch === ' ' ? 4 : (g ? g.split('|')[0].length + 1 : 4); }
function textCells(s) { let w = 0; for (const ch of s.toUpperCase()) w += glyphW(ch); return w; }

/* ---------- supersampled canvas + smooth drawing kit ---------- */
function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function makeBuf() { const b = new Uint8ClampedArray(W * H * 4); for (let i = 0; i < W * H; i++) b[i * 4 + 3] = 255; return b; }
function kit(buf) {
  function set(x, y, c, a) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    if (a === undefined || a >= 1) { buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; }
    else { buf[i] = c[0] * a + buf[i] * (1 - a); buf[i + 1] = c[1] * a + buf[i + 1] * (1 - a); buf[i + 2] = c[2] * a + buf[i + 2] * (1 - a); }
  }
  function rect(x, y, w, h, col, a) { const c = hx(col); x |= 0; y |= 0; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, c, a); }
  function ellipse(cx, cy, rx, ry, col, a) { const c = hx(col);
    for (let yy = Math.floor(cy - ry); yy <= cy + ry; yy++) { const dy = (yy - cy) / ry, s = Math.sqrt(Math.max(0, 1 - dy * dy)) * rx;
      for (let xx = Math.floor(cx - s); xx <= cx + s; xx++) set(xx, yy, c, a); } }
  function circle(cx, cy, r, col, a) { ellipse(cx, cy, r, r, col, a); }
  function ring(cx, cy, r, th, col, a) { const c = hx(col);
    for (let yy = Math.floor(cy - r - th); yy <= cy + r + th; yy++) for (let xx = Math.floor(cx - r - th); xx <= cx + r + th; xx++) {
      const d = Math.hypot(xx - cx, yy - cy); if (d >= r - th / 2 && d <= r + th / 2) set(xx, yy, c, a); } }
  function rrect(x, y, w, h, r, col, a) {
    rect(x + r, y, w - 2 * r, h, col, a); rect(x, y + r, w, h - 2 * r, col, a);
    circle(x + r, y + r, r, col, a); circle(x + w - r, y + r, r, col, a);
    circle(x + r, y + h - r, r, col, a); circle(x + w - r, y + h - r, r, col, a); }
  function cap(x1, y1, x2, y2, r, col, a) { const n = Math.max(2, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / (r * 0.5)));
    for (let i = 0; i <= n; i++) circle(x1 + (x2 - x1) * i / n, y1 + (y2 - y1) * i / n, r, col, a); }
  function vgrad(x, y, w, h, c1, c2) { const a = hx(c1), b = hx(c2);
    for (let yy = 0; yy < h; yy++) { const t = yy / h, c = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      for (let xx = 0; xx < w; xx++) set(x + xx, y + yy, c); } }
  /* bubbly rounded lettering built from the pixel font grid (Pokemon-logo vibe) */
  function bubble(s, x, y, cell, fill, outline, ow, arch) {
    s = s.toUpperCase();
    const n = s.length; let sx = x;
    const stamps = [];
    for (let i = 0; i < n; i++) {
      const ch = s[i]; const t = n > 1 ? (i / (n - 1)) * 2 - 1 : 0;
      const yo = arch ? arch * t * t : 0;
      const g = FONT[ch];
      if (g) { const rows = g.split('|');
        for (let r = 0; r < rows.length; r++) for (let q = 0; q < rows[r].length; q++)
          if (rows[r][q] === 'X') stamps.push([sx + q * cell + cell / 2, y + yo + r * cell + cell / 2]); }
      sx += glyphW(ch) * cell;
    }
    const rr = cell * 0.68;
    if (outline) for (const p of stamps) circle(p[0], p[1], rr + ow, outline);
    for (const p of stamps) circle(p[0], p[1], rr, fill);
    return sx - x;
  }
  function bubbleW(s, cell) { return textCells(s) * cell; }
  /* crisp pixel text (for print body copy) */
  function ptext(s, x, y, scale, col) { s = s.toUpperCase(); let cx = x;
    for (const ch of s) { const g = FONT[ch];
      if (g) { const rows = g.split('|');
        for (let r = 0; r < rows.length; r++) for (let q = 0; q < rows[r].length; q++)
          if (rows[r][q] === 'X') rect(cx + q * scale, y + r * scale, Math.ceil(scale), Math.ceil(scale), col); }
      cx += glyphW(ch) * scale; } return cx - x; }
  function ptextW(s, scale) { return textCells(s) * scale; }
  return { set, rect, ellipse, circle, ring, rrect, cap, vgrad, bubble, bubbleW, ptext, ptextW };
}
/* rotate a keyed region 90° CCW into dest (for the vertical band text) */
function rotCCW(srcBuf, sw, sh, K, dx, dy, key) {
  const k = hx(key);
  for (let yy = 0; yy < sh; yy++) for (let xx = 0; xx < sw; xx++) {
    const si = (yy * W + xx) * 4;
    if (srcBuf[si] === k[0] && srcBuf[si + 1] === k[1] && srcBuf[si + 2] === k[2]) continue;
    K.set(dx + yy, dy + (sw - 1 - xx), [srcBuf[si], srcBuf[si + 1], srcBuf[si + 2]]);
  }
}
/* downsample SSxSS -> final and save */
function save(buf, file) {
  const out = new Uint8ClampedArray(FW * FH * 4);
  for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) {
    let r = 0, g = 0, b = 0;
    for (let dy = 0; dy < SS; dy++) for (let dx = 0; dx < SS; dx++) {
      const i = ((y * SS + dy) * W + (x * SS + dx)) * 4; r += buf[i]; g += buf[i + 1]; b += buf[i + 2];
    }
    const o = (y * FW + x) * 4; out[o] = r / (SS * SS); out[o + 1] = g / (SS * SS); out[o + 2] = b / (SS * SS); out[o + 3] = 255;
  }
  fs.writeFileSync(path.join(OUT, file), encodePNG(out, FW, FH, 1));
  console.log('  print/' + file + ' (1350x1950 @300dpi = 4.5x6.5in)');
}

/* ---------- external hero art (PNG/JPEG from an image generator) ---------- */
const SCRATCH = '/private/tmp/claude-501/-Users-pationeill-Desktop-dd-advance-kit/c9853315-07c0-48fc-8efd-b6efac7ce17c/scratchpad/node_modules';
function loadImage(p2) {
  const b = fs.readFileSync(p2);
  if (p2.match(/\.png$/i)) { const { PNG } = require(SCRATCH + '/pngjs'); const img = PNG.sync.read(b); return { w: img.width, h: img.height, data: img.data }; }
  const jpeg = require(SCRATCH + '/jpeg-js'); const img = jpeg.decode(b, { maxMemoryUsageInMB: 1024 }); return { w: img.width, h: img.height, data: img.data };
}
function findFile(names) { for (const c of names.filter(Boolean)) if (fs.existsSync(c)) return c; return null; }
function findArt() {
  return findFile([process.env.ART,
    '/Users/pationeill/Downloads/cover-art.png', '/Users/pationeill/Downloads/cover-art.jpg',
    '/Users/pationeill/Downloads/cover-art.jpeg', '/Users/pationeill/Downloads/cover-art 2.png']);
}
function findBackArt() {
  return findFile([process.env.BACKART,
    '/Users/pationeill/Downloads/back-art.png', '/Users/pationeill/Downloads/back-art.jpg',
    '/Users/pationeill/Downloads/back-art.jpeg', '/Users/pationeill/Downloads/back-art 2.png']);
}
function findCharArt() {
  return findFile([process.env.CHARART,
    '/Users/pationeill/Downloads/character-art.png', '/Users/pationeill/Downloads/character-art 2.png']);
}
/* alpha-aware contain-fit blit (for transparent character cutouts) */
function spriteBlit(buf, img, x0, y0, rw, rh) {
  const sc = Math.min(rw / img.w, rh / img.h);
  const dw = Math.round(img.w * sc), dh = Math.round(img.h * sc);
  const ox = x0 + Math.round((rw - dw) / 2), oy = y0 + rh - dh; // bottom-aligned
  for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
    const sx = Math.min(img.w - 1, Math.floor(x / sc)), sy = Math.min(img.h - 1, Math.floor(y / sc));
    const si = (sy * img.w + sx) * 4, a = (img.data[si + 3] === undefined ? 255 : img.data[si + 3]) / 255;
    if (a < 0.04) continue;
    const di = ((oy + y) * W + (ox + x)) * 4;
    for (let c = 0; c < 3; c++) buf[di + c] = img.data[si + c] * a + buf[di + c] * (1 - a);
  }
}
/* cover-fit `img` into buffer region (bilinear), cropping overflow centered */
function coverBlit(buf, img, x0, y0, rw, rh) {
  const sc = Math.max(rw / img.w, rh / img.h);
  const cw = rw / sc, ch = rh / sc;                 // source crop size
  const cx0 = (img.w - cw) / 2, cy0 = (img.h - ch) / 2;
  for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
    const sx = cx0 + x / sc, sy = cy0 + y / sc;
    const x1 = Math.min(img.w - 1, Math.floor(sx)), y1 = Math.min(img.h - 1, Math.floor(sy));
    const x2 = Math.min(img.w - 1, x1 + 1), y2 = Math.min(img.h - 1, y1 + 1);
    const fx = sx - x1, fy = sy - y1;
    const di = ((y0 + y) * W + (x0 + x)) * 4;
    for (let c = 0; c < 3; c++) {
      const a = img.data[(y1 * img.w + x1) * 4 + c] * (1 - fx) + img.data[(y1 * img.w + x2) * 4 + c] * fx;
      const b2 = img.data[(y2 * img.w + x1) * 4 + c] * (1 - fx) + img.data[(y2 * img.w + x2) * 4 + c] * fx;
      buf[di + c] = a * (1 - fy) + b2 * fy;
    }
    buf[di + 3] = 255;
  }
}

/* ---------- the glittery Emerald-style field (smooth, purple) ---------- */
function field(K, cx, cy) {
  K.vgrad(0, 0, W, H, '#4a3080', '#241543');
  for (let i = 0; i < 24; i++) {                       /* soft radial rays */
    const a = (i / 24) * Math.PI * 2;
    for (let r = 60; r < 3400; r += 26) {
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r * 0.85;
      if (x < -60 || y < -60 || x > W + 60 || y > H + 60) break;
      if (i % 2 === 0) K.circle(x, y, 26, '#5b3f94', 0.16);
    }
  }
  for (let i = 0; i < 90; i++) {                       /* glitter streaks */
    const x = (i * 487 + 131) % W, y = (i * 331 + 77) % H, L = 40 + (i % 4) * 26;
    K.cap(x, y, x + L * 0.5, y - L, 7, i % 3 ? '#6b4fae' : '#33205e', 0.5);
  }
  for (let i = 0; i < 40; i++) {                       /* 4-point sparkles */
    const x = (i * 823 + 211) % (W - 80) + 40, y = (i * 557 + 97) % (H - 80) + 40, s = 12 + (i % 3) * 9;
    K.ellipse(x, y, s * 0.22, s, '#e8defc', 0.85); K.ellipse(x, y, s, s * 0.22, '#e8defc', 0.85);
    K.circle(x, y, s * 0.2, '#ffffff');
  }
}

/* ---------- smooth chibi cartoon dads ---------- */
const INK = '#1b1430';
function dadBase(K, cx, fy, s, coat, coatHi) {
  const ow = Math.max(3, s * 0.045);
  K.rrect(cx - s * 0.30, fy - s * 0.34, s * 0.26, s * 0.34, s * 0.08, INK);
  K.rrect(cx + s * 0.04, fy - s * 0.34, s * 0.26, s * 0.34, s * 0.08, INK);
  K.ellipse(cx - s * 0.18, fy, s * 0.19, s * 0.09, INK); K.ellipse(cx + s * 0.18, fy, s * 0.19, s * 0.09, INK);
  K.rrect(cx - s * 0.52 - ow, fy - s * 1.18 - ow, s * 1.04 + ow * 2, s * 0.95 + ow * 2, s * 0.2, INK);
  K.rrect(cx - s * 0.52, fy - s * 1.18, s * 1.04, s * 0.95, s * 0.18, coat);
  K.rrect(cx - s * 0.52, fy - s * 1.18, s * 0.3, s * 0.95, s * 0.18, coatHi, 0.5);
  K.rrect(cx - s * 0.13, fy - s * 1.16, s * 0.26, s * 0.6, s * 0.08, '#f6f4fa');
  return ow;
}
function dadArms(K, cx, fy, s, coat, raiseR) {
  const ow = Math.max(3, s * 0.045), shY = fy - s * 1.08;
  K.cap(cx - s * 0.52, shY, cx - s * 0.62, fy - s * 0.5, s * 0.11 + ow, INK);
  K.cap(cx - s * 0.52, shY, cx - s * 0.62, fy - s * 0.5, s * 0.11, coat);
  K.circle(cx - s * 0.62, fy - s * 0.46, s * 0.1, '#f4c898'); K.ring(cx - s * 0.62, fy - s * 0.46, s * 0.1, ow * 0.8, INK);
  const rx2 = raiseR ? cx + s * 0.60 : cx + s * 0.62, ry2 = raiseR ? fy - s * 1.62 : fy - s * 0.5;
  K.cap(cx + s * 0.52, shY, rx2, ry2, s * 0.11 + ow, INK);
  K.cap(cx + s * 0.52, shY, rx2, ry2, s * 0.11, coat);
  K.circle(rx2, ry2 + (raiseR ? 0 : s * 0.04), s * 0.1, '#f4c898'); K.ring(rx2, ry2 + (raiseR ? 0 : s * 0.04), s * 0.1, ow * 0.8, INK);
  return [rx2, ry2];
}
function dadHead(K, cx, hy, s) {
  const ow = Math.max(3, s * 0.045);
  K.circle(cx, hy, s * 0.46 + ow, INK);
  K.circle(cx, hy, s * 0.46, '#f4c898');
  K.circle(cx - s * 0.17, hy + 0.14 * s, s * 0.07, '#e8927c', 0.5); K.circle(cx + s * 0.17, hy + 0.14 * s, s * 0.07, '#e8927c', 0.5);
}
function dadEyes(K, cx, hy, s, squint) {
  if (squint) { K.rrect(cx - s * 0.26, hy - s * 0.03, s * 0.18, s * 0.05, s * 0.02, INK); K.rrect(cx + s * 0.08, hy - s * 0.03, s * 0.18, s * 0.05, s * 0.02, INK); return; }
  K.ellipse(cx - s * 0.16, hy - s * 0.02, s * 0.085, s * 0.11, '#ffffff'); K.ellipse(cx + s * 0.16, hy - s * 0.02, s * 0.085, s * 0.11, '#ffffff');
  K.circle(cx - s * 0.14, hy, s * 0.045, INK); K.circle(cx + s * 0.18, hy, s * 0.045, INK);
  K.circle(cx - s * 0.125, hy - s * 0.015, s * 0.015, '#ffffff'); K.circle(cx + s * 0.195, hy - s * 0.015, s * 0.015, '#ffffff');
}
function topHat(K, cx, hy, s, band) {
  const ow = Math.max(3, s * 0.045);
  K.ellipse(cx, hy - s * 0.32, s * 0.62 + ow, s * 0.13 + ow, INK);
  K.ellipse(cx, hy - s * 0.32, s * 0.62, s * 0.13, '#242038');
  K.rrect(cx - s * 0.4 - ow, hy - s * 0.86 - ow, s * 0.8 + ow * 2, s * 0.56, s * 0.07, INK);
  K.rrect(cx - s * 0.4, hy - s * 0.86, s * 0.8, s * 0.54, s * 0.06, '#2e2a44');
  K.rect(cx - s * 0.4, hy - s * 0.47, s * 0.8, s * 0.12, band);
  K.rrect(cx - s * 0.36, hy - s * 0.83, s * 0.14, s * 0.42, s * 0.06, '#4a4468', 0.7);
}
function drawSamuel(K, cx, fy, s) {
  dadBase(K, cx, fy, s, '#3a3644', '#524e60');
  const hy = fy - s * 1.5;
  K.ellipse(cx - s * 0.4, hy + s * 0.08, s * 0.14, s * 0.3, '#e2c26c'); K.ellipse(cx + s * 0.4, hy + s * 0.08, s * 0.14, s * 0.3, '#e2c26c');
  dadHead(K, cx, hy, s);
  K.ellipse(cx, hy - s * 0.3, s * 0.44, s * 0.18, '#e2c26c');
  dadEyes(K, cx, hy, s);
  const ow = s * 0.04;
  K.ellipse(cx - s * 0.15, hy + s * 0.2, s * 0.17 + ow, s * 0.085 + ow, INK); K.ellipse(cx + s * 0.16, hy + s * 0.17, s * 0.17 + ow, s * 0.085 + ow, INK);
  K.ellipse(cx - s * 0.15, hy + s * 0.2, s * 0.17, s * 0.085, '#5a3a22'); K.ellipse(cx + s * 0.16, hy + s * 0.17, s * 0.17, s * 0.085, '#5a3a22');
  K.circle(cx - s * 0.32, hy + s * 0.16, s * 0.055, '#5a3a22'); K.circle(cx + s * 0.33, hy + s * 0.13, s * 0.055, '#5a3a22');
  topHat(K, cx, hy, s, '#a02c3c');
  K.ellipse(cx - s * 0.1, fy - s * 1.12, s * 0.1, s * 0.07, '#c8102e'); K.ellipse(cx + s * 0.1, fy - s * 1.12, s * 0.1, s * 0.07, '#c8102e');
  K.circle(cx, fy - s * 1.12, s * 0.05, '#8a0a1e');
  const hand = dadArms(K, cx, fy, s, '#3a3644', true);
  K.rrect(hand[0] - s * 0.035, hand[1] - s * 0.02, s * 0.07, s * 0.3, s * 0.03, '#242038');
  K.circle(hand[0], hand[1] - s * 0.08, s * 0.11, '#9aa0b0'); K.ring(hand[0], hand[1] - s * 0.08, s * 0.11, s * 0.03, INK);
  K.circle(hand[0] - s * 0.03, hand[1] - s * 0.11, s * 0.03, '#e8ecf4');
}
function drawHerschel(K, cx, fy, s) {
  dadBase(K, cx, fy, s, '#4a3c30', '#645244');
  const hy = fy - s * 1.42;
  dadHead(K, cx, hy, s);
  dadEyes(K, cx, hy, s, true);
  K.rrect(cx - s * 0.3, hy - s * 0.14, s * 0.2, s * 0.05, s * 0.02, INK); K.rrect(cx + s * 0.1, hy - s * 0.14, s * 0.2, s * 0.05, s * 0.02, INK);
  K.ellipse(cx, hy + s * 0.3, s * 0.4, s * 0.36, INK);
  K.ellipse(cx, hy + s * 0.3, s * 0.36, s * 0.32, '#e6e6ee');
  K.ellipse(cx, hy + s * 0.16, s * 0.1, s * 0.045, INK);
  topHat(K, cx, hy, s, '#a02c3c');
  dadArms(K, cx, fy, s, '#4a3c30', false);
  K.cap(cx + s * 0.62, fy - s * 0.42, cx + s * 0.68, fy, s * 0.035, '#8a6a3a');
  K.ring(cx + s * 0.56, fy - s * 0.46, s * 0.08, s * 0.05, '#c49446');
  K.circle(cx - s * 0.3, fy - s * 0.9, s * 0.045, '#a02c3c'); K.circle(cx - s * 0.3, fy - s * 0.72, s * 0.045, '#a02c3c');
}
function drawWilliam(K, cx, fy, s) {
  K.ellipse(cx - s * 0.42, fy - s * 1.1, s * 0.17, s * 0.55, INK); K.ellipse(cx + s * 0.42, fy - s * 1.1, s * 0.17, s * 0.55, INK);
  K.ellipse(cx - s * 0.42, fy - s * 1.1, s * 0.13, s * 0.5, '#2e2a3e'); K.ellipse(cx + s * 0.42, fy - s * 1.1, s * 0.13, s * 0.5, '#2e2a3e');
  dadBase(K, cx, fy, s, '#3a3644', '#524e60');
  const hy = fy - s * 1.5;
  dadHead(K, cx, hy, s);
  K.ellipse(cx, hy - s * 0.3, s * 0.44, s * 0.16, '#2e2a3e');
  dadEyes(K, cx, hy, s);
  K.ring(cx - s * 0.16, hy - s * 0.01, s * 0.13, s * 0.028, '#e2b23e'); K.ring(cx + s * 0.16, hy - s * 0.01, s * 0.13, s * 0.028, '#e2b23e');
  K.rect(cx - s * 0.04, hy - s * 0.03, s * 0.08, s * 0.025, '#e2b23e');
  K.ellipse(cx, hy + s * 0.22, s * 0.13, s * 0.08, INK); K.rect(cx - s * 0.09, hy + s * 0.16, s * 0.18, s * 0.05, '#ffffff');
  topHat(K, cx, hy, s, '#a02c3c');
  K.circle(cx - s * 0.06, fy - s * 1.1, s * 0.08, '#f6f4fa'); K.circle(cx + s * 0.06, fy - s * 1.1, s * 0.08, '#f6f4fa'); K.circle(cx, fy - s * 1.04, s * 0.08, '#f6f4fa');
  K.circle(cx, fy - s * 1.1, s * 0.035, '#e2b23e');
  dadArms(K, cx, fy, s, '#3a3644', false);
  K.ellipse(cx + s * 0.42, hy + s * 0.26, s * 0.02, s * 0.09, '#ffffff'); K.ellipse(cx + s * 0.42, hy + s * 0.26, s * 0.09, s * 0.02, '#ffffff');
}
function drawRosalind(K, cx, fy, s) {
  dadBase(K, cx, fy, s, '#2e8a7c', '#48a496');
  const hy = fy - s * 1.5;
  K.circle(cx - s * 0.44, hy + s * 0.05, s * 0.19, INK); K.circle(cx + s * 0.44, hy + s * 0.05, s * 0.19, INK);
  K.circle(cx - s * 0.44, hy + s * 0.05, s * 0.15, '#b05c30'); K.circle(cx + s * 0.44, hy + s * 0.05, s * 0.15, '#b05c30');
  dadHead(K, cx, hy, s);
  K.ellipse(cx, hy - s * 0.3, s * 0.44, s * 0.17, '#b05c30');
  dadEyes(K, cx, hy, s);
  K.ring(cx - s * 0.16, hy - s * 0.01, s * 0.13, s * 0.028, '#e2b23e'); K.ring(cx + s * 0.16, hy - s * 0.01, s * 0.13, s * 0.028, '#e2b23e');
  K.rect(cx - s * 0.04, hy - s * 0.03, s * 0.08, s * 0.025, '#e2b23e');
  K.ellipse(cx, hy + s * 0.2, s * 0.1, s * 0.07, INK);
  topHat(K, cx, hy, s, '#2e8a7c');
  K.rect(cx - s * 0.4, hy - s * 0.68, s * 0.8, s * 0.06, '#966a2c');
  K.circle(cx - s * 0.16, hy - s * 0.65, s * 0.1, '#966a2c'); K.circle(cx + s * 0.16, hy - s * 0.65, s * 0.1, '#966a2c');
  K.circle(cx - s * 0.16, hy - s * 0.65, s * 0.065, '#aee6f2'); K.circle(cx + s * 0.16, hy - s * 0.65, s * 0.065, '#aee6f2');
  const hand = dadArms(K, cx, fy, s, '#2e8a7c', false);
  K.ellipse(hand[0], hand[1] - s * 0.2, s * 0.13, s * 0.1, '#f6f4fa'); K.ring(hand[0], hand[1] - s * 0.2, s * 0.12, s * 0.028, INK);
  K.cap(hand[0] + s * 0.12, hand[1] - s * 0.24, hand[0] + s * 0.2, hand[1] - s * 0.3, s * 0.028, '#f6f4fa');
  K.circle(hand[0], hand[1] - s * 0.33, s * 0.032, '#e2b23e');
}
function drawGoblin(K, cx, fy, s) {
  K.rrect(cx - s * 0.3, fy - s * 0.5, s * 0.6, s * 0.5, s * 0.12, '#3f7f36');
  K.circle(cx, fy - s * 0.75, s * 0.46, '#2e5f28');
  K.circle(cx, fy - s * 0.75, s * 0.42, '#5aa84a');
  K.ellipse(cx - s * 0.5, fy - s * 0.85, s * 0.16, s * 0.09, '#5aa84a'); K.ellipse(cx + s * 0.5, fy - s * 0.85, s * 0.16, s * 0.09, '#5aa84a');
  K.circle(cx - s * 0.15, fy - s * 0.82, s * 0.08, '#f2df5a'); K.circle(cx + s * 0.15, fy - s * 0.82, s * 0.08, '#f2df5a');
  K.circle(cx - s * 0.15, fy - s * 0.8, s * 0.035, INK); K.circle(cx + s * 0.15, fy - s * 0.8, s * 0.035, INK);
  K.ellipse(cx, fy - s * 0.6, s * 0.2, s * 0.1, INK); K.rect(cx - s * 0.15, fy - s * 0.66, s * 0.3, s * 0.06, '#ffffff');
}

/* ---------- gameplay screenshots (pixel art — intentionally!) ---------- */
function screenshot(setup) {
  const { loadGame, advanceUntil, isWorld } = require('./qa.js');
  const h = loadGame(); const G = h.G;
  h.step(70, 33); h.tap('start'); h.step(3); h.tap('a'); h.step(6);
  advanceUntil(h, isWorld, 6000);
  setup(h, G); h.step(6);
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
function blitShot(buf, shot, x, y, scale) { // crisp integer-scaled pixel art
  for (let sy = 0; sy < 160; sy++) for (let sx = 0; sx < 240; sx++) {
    const si = (sy * 240 + sx) * 4;
    for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
      const px2 = x + sx * scale + dx, py2 = y + sy * scale + dy;
      if (px2 < 0 || py2 < 0 || px2 >= W || py2 >= H) continue;
      const di = (py2 * W + px2) * 4;
      buf[di] = shot[si]; buf[di + 1] = shot[si + 1]; buf[di + 2] = shot[si + 2]; buf[di + 3] = 255;
    }
  }
}

/* ================= FRONT COVER ================= */
console.log('composing front cover (smooth cartoon style)...');
{
  const buf = makeBuf(); const K = kit(buf);
  const BAND = 150 * SS, CX = BAND + (W - BAND) / 2;
  const artPath = findArt();
  if (artPath) {
    console.log('  hero art: ' + artPath);
    coverBlit(buf, loadImage(artPath), BAND, 0, W - BAND, H);
    /* soft scrims so the logo + bottom chrome pop over the painting */
    for (let y = 0; y < 380 * SS; y++) { const a = 0.34 * (1 - y / (380 * SS)); K.rect(BAND, y, W - BAND, 1, '#1a0f2e', a); }
    for (let y = 0; y < 220 * SS; y++) { const a = 0.4 * (y / (220 * SS)); K.rect(BAND, H - 220 * SS + y, W - BAND, 1, '#1a0f2e', a); }
  } else {
    console.log('  (no Downloads/cover-art.png yet — using the drawn field as placeholder)');
    field(K, CX, 1150 * SS);
  }
  /* vertical silver band */
  for (let x = 0; x < BAND; x++) { const t = x / BAND, v = Math.round(148 + 70 * Math.sin(t * Math.PI)); const c = [v, v, v + 10]; for (let y = 0; y < H; y++) K.set(x, y, c); }
  K.rect(BAND, 0, 5 * SS, H, INK);
  /* BLUE only-for tab */
  K.rect(0, 0, BAND, 170 * SS, '#1d4fc4');
  K.vgrad(0, 0, BAND, 24 * SS, '#3a6ee0', '#1d4fc4');
  /* vertical texts (render on scratch buffer, rotate 90° CCW) */
  {
    const tmp = makeBuf(); const T = kit(tmp);
    T.rect(0, 0, 1400 * SS, 80 * SS, '#ff00ff');
    const w1 = T.ptext('ONLY FOR', 0, 6, 4 * SS, '#ffffff');
    rotCCW(tmp, w1, 40 * SS, K, 56 * SS, 8 * SS, '#ff00ff');
    T.rect(0, 0, 1400 * SS, 80 * SS, '#ff00ff');
    const w2 = T.ptext('DADDYBOY ADVANCE', 0, 6, 10 * SS, '#22224a');
    rotCCW(tmp, w2, 66 * SS, K, 34 * SS, 200 * SS, '#ff00ff');
  }
  /* arched bubbly logo */
  const gold = '#f2c53d', navy = '#232a54';
  K.bubble('DOWNTON', CX - K.bubbleW('DOWNTON', 13 * SS) / 2, 66 * SS, 13 * SS, gold, navy, 5 * SS, 16 * SS);
  K.bubble('DADDIES', CX - K.bubbleW('DADDIES', 13 * SS) / 2, 172 * SS, 13 * SS, gold, navy, 5 * SS, 16 * SS);
  K.bubble('BARS THROUGH TIME', CX - K.bubbleW('BARS THROUGH TIME', 5.4 * SS) / 2, 292 * SS, 5.4 * SS, '#ffffff', navy, 3 * SS, 0);
  /* (hero art carries the characters; dads drawn in code only when no art exists) */
  if (!artPath) { drawHerschel(K, 265 * SS, 1575 * SS, 250 * SS); drawRosalind(K, 1150 * SS, 1580 * SS, 235 * SS);
    drawWilliam(K, 515 * SS, 1645 * SS, 265 * SS); drawSamuel(K, 815 * SS, 1690 * SS, 315 * SS); }
  /* ESRB-style rating box: E for EVERYONE */
  K.rrect(190 * SS, 1700 * SS, 132 * SS, 180 * SS, 8 * SS, '#ffffff');
  K.rrect(196 * SS, 1706 * SS, 120 * SS, 168 * SS, 6 * SS, '#000000');
  K.rrect(200 * SS, 1710 * SS, 112 * SS, 128 * SS, 4 * SS, '#ffffff');
  /* center the E in the white window (drawn width = 4 cells, height = 5 cells) */
  const eScale = 22 * SS, eW = 4 * eScale, eH = 5 * eScale;
  K.ptext('E', 200 * SS + (112 * SS - eW) / 2, 1710 * SS + (128 * SS - eH) / 2, eScale, '#000000');
  /* center EVERYONE in the black strip below (drop the trailing letter-space) */
  const evScale = 3 * SS, evW = K.ptextW('EVERYONE', evScale) - evScale, evH = 5 * evScale;
  K.ptext('EVERYONE', 196 * SS + (120 * SS - evW) / 2, 1838 * SS + (36 * SS - evH) / 2, evScale, '#ffffff');
  /* company + publisher */
  K.ptext('THE DOWNTON DADDIES COMPANY', CX - K.ptextW('THE DOWNTON DADDIES COMPANY', 4 * SS) / 2, 1892 * SS, 4 * SS, '#f6f4fa');
  K.rrect(1030 * SS, 1786 * SS, 270 * SS, 76 * SS, 38 * SS, '#c8102e');
  K.bubble('DADDYSOFT', 1165 * SS - K.bubbleW('DADDYSOFT', 4.6 * SS) / 2, 1806 * SS, 4.6 * SS, '#ffffff', null, 0);
  save(buf, 'cover-front.png');
}

/* ================= BACK COVER ================= */
console.log('composing back cover...');
const qrm = QR.create(URL, { errorCorrectionLevel: 'M' }).modules;
{
  const buf = makeBuf(); const K = kit(buf);
  const backArt = findBackArt();
  if (backArt) {
    console.log('  back art: ' + backArt);
    coverBlit(buf, loadImage(backArt), 0, 0, W, H);
  } else {
    console.log('  (no Downloads/back-art.png — using the drawn field)');
    field(K, 675 * SS, 200 * SS);
  }
  const gold = '#f2c53d', navy = '#232a54';
  /* top-left logo */
  K.bubble('DOWNTON', 60 * SS, 34 * SS, 6.5 * SS, gold, navy, 3 * SS, 8 * SS);
  K.bubble('DADDIES', 60 * SS, 92 * SS, 6.5 * SS, gold, navy, 3 * SS, 8 * SS);
  K.ptext('BARS THROUGH TIME', 62 * SS, 158 * SS, 4 * SS, '#f6f4fa');
  /* hardware boxes top-right */
  K.rrect(830 * SS, 40 * SS, 460 * SS, 62 * SS, 10 * SS, '#ffffff');
  K.rrect(836 * SS, 46 * SS, 448 * SS, 50 * SS, 8 * SS, '#1a0f2e');
  K.ptext('DADDYBOY ADVANCE', 1060 * SS - K.ptextW('DADDYBOY ADVANCE', 4 * SS) / 2, 60 * SS, 4 * SS, '#ffffff');
  K.rrect(830 * SS, 112 * SS, 460 * SS, 52 * SS, 10 * SS, '#ffffff');
  K.ptext('ANY BROWSER', 1060 * SS - K.ptextW('ANY BROWSER', 4 * SS) / 2, 126 * SS, 4 * SS, '#000000');
  K.ptext('NOT COMPATIBLE WITH BEING SAD.', 830 * SS, 178 * SS, 3 * SS, '#ff8a9a');
  /* the big dark panel (translucent over generated art) */
  K.rrect(52 * SS, 226 * SS, 1246 * SS, 1400 * SS, 24 * SS, gold, backArt ? 0.9 : 1);
  K.rrect(58 * SS, 232 * SS, 1234 * SS, 1388 * SS, 20 * SS, '#221240', backArt ? 0.82 : 1);
  /* blurb */
  const blurb = [
    'HISTORY IS UNSTABLE - THE TIME',
    'ENGINE HAS EXPLODED! YOUR BARS',
    'WILL BE TESTED LIKE NEVER',
    'BEFORE. RESCUE THE SCATTERED',
    'DADDIES ACROSS ROME, DODGE',
    'CITY, DISCO-ERA NEW YORK AND',
    'A REALM OF GOBLINS - THEN',
    'TAKE THE THEATRE BACK FROM',
    'THE SCRIPTED ORDER!'
  ];
  blurb.forEach((l, i) => K.ptext(l, 92 * SS, (272 + i * 40) * SS, 4.4 * SS, '#f6f4fa'));
  /* bullets */
  const feats = ['FOUR PLAYABLE DADDIES.', 'CRAWL THE COLOSSEUM.', 'WIN THE CROWD.', '12 GOLDEN MUSTACHES.'];
  feats.forEach((f, i) => { K.circle(104 * SS, (668 + i * 44) * SS, 7 * SS, gold); K.ptext(f, 124 * SS, (656 + i * 44) * SS, 4.4 * SS, '#e8e0f8'); });
  /* character slot above the caption: generated portrait if present, else cartoon */
  const charArt = findCharArt();
  if (charArt) { console.log('  character art: ' + charArt); spriteBlit(buf, loadImage(charArt), 80 * SS, 980 * SS, 600 * SS, 560 * SS); }
  else if (!backArt) drawWilliam(K, 330 * SS, 1500 * SS, 220 * SS);
  K.ptext('THE FRONT LINE OF RAP BATTLING!', 92 * SS, 1566 * SS, 4 * SS, gold);
  /* right column: 2 pixel screenshots + QR */
  function frame(x, y, w2, h2) { K.rrect(x - 10 * SS, y - 10 * SS, w2 + 20 * SS, h2 + 20 * SS, 8 * SS, '#ffffff'); K.rect(x - 3 * SS, y - 3 * SS, w2 + 6 * SS, h2 + 6 * SS, '#000000'); }
  frame(790 * SS, 262 * SS, 480 * SS, 320 * SS); blitShot(buf, shotBattle, 790 * SS, 262 * SS, 2 * SS);
  frame(790 * SS, 632 * SS, 480 * SS, 320 * SS); blitShot(buf, shotHypo, 790 * SS, 632 * SS, 2 * SS);
  /* QR callout */
  K.rrect(790 * SS, 1002 * SS, 480 * SS, 596 * SS, 12 * SS, '#ffffff');
  const mod = 12 * SS, qs = qrm.size, qx = 790 * SS + Math.round((480 * SS - qs * mod) / 2), qy = 1032 * SS;
  for (let r = 0; r < qs; r++) for (let c = 0; c < qs; c++)
    if (qrm.get(r, c)) K.rect(qx + c * mod, qy + r * mod, mod, mod, '#000000');
  K.ptext('SCAN TO PLAY - ANY PHONE.', 1030 * SS - K.ptextW('SCAN TO PLAY - ANY PHONE.', 4 * SS) / 2, 1550 * SS, 4 * SS, '#000000');
  /* bottom strip */
  K.rrect(70 * SS, 1660 * SS, 340 * SS, 190 * SS, 8 * SS, '#ffffff');
  let bxx = 96 * SS; const seed = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1];
  seed.forEach((w2, i) => { if (i % 2 === 0) K.rect(bxx, 1680 * SS, w2 * 4 * SS, 112 * SS, '#000000'); bxx += (w2 + 1) * 4 * SS; });
  K.ptext('1 8 8 9 0 7 1 2', 130 * SS, 1806 * SS, 4 * SS, '#000000');
  K.circle(520 * SS, 1755 * SS, 88 * SS, '#8a6a1e'); K.circle(520 * SS, 1755 * SS, 82 * SS, gold);
  K.ptext('SEAL', 520 * SS - K.ptextW('SEAL', 4 * SS) / 2, 1712 * SS, 4 * SS, navy);
  K.ptext('OF', 520 * SS - K.ptextW('OF', 4 * SS) / 2, 1744 * SS, 4 * SS, navy);
  K.ptext('QUALITY', 520 * SS - K.ptextW('QUALITY', 4 * SS) / 2, 1776 * SS, 4 * SS, navy);
  K.ptext('MODEL NO. DBA-1889', 660 * SS, 1676 * SS, 4 * SS, '#f6f4fa');
  K.ptext('THE DOWNTON DADDIES CO.', 660 * SS, 1716 * SS, 4 * SS, '#c9b6e6');
  K.ptext('(C) 1889 DADDYSOFT', 660 * SS, 1756 * SS, 4 * SS, '#c9b6e6');
  K.rrect(1050 * SS, 1790 * SS, 250 * SS, 70 * SS, 35 * SS, '#c8102e');
  K.bubble('DADDYSOFT', 1175 * SS - K.bubbleW('DADDYSOFT', 4.2 * SS) / 2, 1808 * SS, 4.2 * SS, '#ffffff', null, 0);
  K.ptext('MADE FOR LANE ALLISON - THE GREATEST DADDY OF ALL', 675 * SS - K.ptextW('MADE FOR LANE ALLISON - THE GREATEST DADDY OF ALL', 4 * SS) / 2, 1892 * SS, 4 * SS, gold);
  save(buf, 'cover-back.png');
}

/* ================= STANDALONE QR ================= */
QR.toFile(path.join(OUT, 'qr-code.png'), URL, { width: 1200, margin: 4, errorCorrectionLevel: 'M' }, (e) => {
  if (e) throw e;
  console.log('  print/qr-code.png (1200x1200, scan -> ' + URL + ')');
  console.log('BOX ART DONE');
});
