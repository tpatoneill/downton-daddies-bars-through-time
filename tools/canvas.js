/* A tiny rasterizing 2D context + PNG encoder, so the headless harness can both
   drive the game and render real screenshots. Supports fillRect, globalAlpha,
   save/restore/translate/scale (no rotation needed — the shell rotates via CSS). */
const zlib = require('zlib');

function parseColor(s) {
  if (typeof s !== 'string') return [0, 0, 0, 255];
  s = s.trim();
  if (s[0] === '#') {
    if (s.length === 4) return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16), 255];
    return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 255];
  }
  var m = s.match(/rgba?\(([^)]+)\)/);
  if (m) { var p = m[1].split(',').map(x => parseFloat(x)); return [p[0] | 0, p[1] | 0, p[2] | 0, p[3] === undefined ? 255 : Math.round(p[3] * 255)]; }
  return [0, 0, 0, 255];
}

function makeCanvas(W, H) {
  const buf = new Uint8ClampedArray(W * H * 4);
  // start opaque black
  for (let i = 0; i < W * H; i++) { buf[i * 4 + 3] = 255; }
  const stack = [];
  const st = { a: 1, d: 1, e: 0, f: 0, alpha: 1 };
  const ctx = {
    fillStyle: '#000', globalAlpha: 1, imageSmoothingEnabled: false,
    save() { stack.push({ a: st.a, d: st.d, e: st.e, f: st.f, alpha: this.globalAlpha }); },
    restore() { const s = stack.pop(); if (s) { st.a = s.a; st.d = s.d; st.e = s.e; st.f = s.f; this.globalAlpha = s.alpha; } },
    translate(x, y) { st.e += st.a * x; st.f += st.d * y; },
    scale(sx, sy) { st.a *= sx; st.d *= sy; },
    beginPath() {}, ellipse() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {}, rect() {}, clip() {}, closePath() {},
    fillRect(x, y, w, h) {
      if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h)) throw new Error('non-finite rect: ' + [x, y, w, h]);
      const X = Math.round(st.e + st.a * x), Y = Math.round(st.f + st.d * y);
      const Wd = Math.round(st.a * w), Hd = Math.round(st.d * h);
      const col = parseColor(this.fillStyle);
      const alpha = (this.globalAlpha === undefined ? 1 : this.globalAlpha) * (col[3] / 255);
      for (let yy = Y; yy < Y + Hd; yy++) {
        if (yy < 0 || yy >= H) continue;
        for (let xx = X; xx < X + Wd; xx++) {
          if (xx < 0 || xx >= W) continue;
          const idx = (yy * W + xx) * 4;
          if (alpha >= 1) { buf[idx] = col[0]; buf[idx + 1] = col[1]; buf[idx + 2] = col[2]; buf[idx + 3] = 255; }
          else {
            buf[idx] = col[0] * alpha + buf[idx] * (1 - alpha);
            buf[idx + 1] = col[1] * alpha + buf[idx + 1] * (1 - alpha);
            buf[idx + 2] = col[2] * alpha + buf[idx + 2] * (1 - alpha);
            buf[idx + 3] = 255;
          }
        }
      }
    }
  };
  return { ctx, buf, W, H };
}

function crc32(b) {
  let c, t = crc32.t;
  if (!t) { t = crc32.t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } }
  let crc = 0xffffffff;
  for (let i = 0; i < b.length; i++) crc = t[(crc ^ b[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePNG(buf, W, H, scale) {
  scale = scale || 1;
  const SW = W * scale, SH = H * scale;
  const raw = Buffer.alloc((SW * 4 + 1) * SH);
  let o = 0;
  for (let y = 0; y < SH; y++) {
    raw[o++] = 0;
    for (let x = 0; x < SW; x++) {
      const sx = (x / scale) | 0, sy = (y / scale) | 0, i = (sy * W + sx) * 4;
      raw[o++] = buf[i]; raw[o++] = buf[i + 1]; raw[o++] = buf[i + 2]; raw[o++] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SW, 0); ihdr.writeUInt32BE(SH, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

module.exports = { makeCanvas, encodePNG };
