/* qa-dist.js — integrity check of the ACTUAL dist/index.html as a browser sees it:
   exactly one <script>, no premature </script>, and the extracted script boots
   under 'use strict' with a real rasterizing canvas. Catches build/HTML bugs that
   the JS-only QA cannot (e.g. template-replace corruption). */
const fs = require('fs');
const path = require('path');
const { makeCanvas } = require('./canvas.js');
function assert(c, m) { if (!c) throw new Error('ASSERT FAILED: ' + m); }
let PASS = 0; function ok(m) { PASS++; console.log('  ok  ' + m); }

const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'index.html'), 'utf8');
console.log('DIST INTEGRITY QA');

const closers = (html.match(/<\/script>/g) || []).length;
assert(closers === 1, 'exactly one </script> (found ' + closers + ' — premature close corrupts the page)');
ok('exactly one </script> tag');
const openers = (html.match(/<script>/g) || []).length;
assert(openers === 1, 'exactly one <script> tag');
ok('exactly one <script> tag');
assert(html.indexOf('</body>') > html.indexOf('</script>'), '</script> comes before </body>');
assert(html.trim().endsWith('</html>'), 'document ends with </html>');
ok('document structure well-formed');
assert(/BIRTHDAY_NAME = 'LANE ALLISON'/.test(html), "config: BIRTHDAY_NAME = 'LANE ALLISON'");
assert(/DEDICATION\s*=\s*'THE GREATEST DADDY OF ALL'/.test(html), 'config: DEDICATION present');
ok('config block intact');

// extract the script exactly as the browser would and boot it strict
const script = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));
const cv = makeCanvas(240, 160);
let raf = null, clock = 0;
global.window = { addEventListener() {}, AudioContext: undefined, webkitAudioContext: undefined };
global.document = { getElementById: () => ({ getContext: () => cv.ctx }), querySelectorAll: () => [] };
global.performance = { now: () => clock };
global.requestAnimationFrame = cb => { raf = cb; };
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
try {
  new Function('"use strict";\n' + script)();
} catch (e) { throw new Error('dist script threw on load (strict): ' + e.message); }
assert(raf, 'requestAnimationFrame was scheduled (boot ran)');
ok('dist script boots under strict mode');
let frames = 0; for (let i = 0; i < 120; i++) { clock += 33; raf(clock); frames++; }
ok('ran ' + frames + ' frames of the real dist script without error');

// pixel-font sanity: the '$' glyph that triggered the bug must still be a real glyph string
assert(/'\$':'[.X|]+'/.test(script), "pixel font '$' glyph intact (the bug canary)");
ok("pixel-font '$' glyph intact");

console.log('\nDIST INTEGRITY QA PASSED — ' + PASS + ' checks. ✔');
