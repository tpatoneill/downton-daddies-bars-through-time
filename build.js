/* build.js — concatenate src/*.js (in numeric order) into template.html -> dist/index.html
   No frameworks, no bundler. Single shared scope, load order = filename order. */
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

function loadModules() {
  const files = fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort();
  return files.map(f => {
    const body = fs.readFileSync(path.join(SRC, f), 'utf8');
    return '/* ===== ' + f + ' ===== */\n' + body;
  }).join('\n\n');
}

function build() {
  const tpl = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
  const bundle = loadModules();
  // NOTE: use a function replacement — a plain string would let special patterns
  // like `$'`/`$&` in the bundle (e.g. the '$' glyph in the pixel font) corrupt output.
  const out = tpl.replace('/*__BUNDLE__*/', () => bundle);
  fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'dist', 'index.html'), out);
  // also publish to docs/ for GitHub Pages (served at the repo's Pages URL root)
  fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'docs', 'index.html'), out);
  fs.writeFileSync(path.join(ROOT, 'docs', '.nojekyll'), ''); // serve the file as-is
  const kb = (Buffer.byteLength(out) / 1024).toFixed(1);
  console.log('built dist/index.html + docs/index.html (' + kb + ' KB) from ' +
    fs.readdirSync(SRC).filter(f => f.endsWith('.js')).length + ' modules');
}

// Also expose the pure JS bundle (for the headless harness) without the HTML wrapper.
function bundleOnly() { return loadModules(); }

if (require.main === module) build();
module.exports = { build, bundleOnly };
