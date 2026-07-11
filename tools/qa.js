/* qa.js — headless QA. Shared helpers used by phase-specific playthrough tests.
   Exports navigation (BFS walk), auto-battle, cutscene advance, and assertions. */
const { loadGame } = require('./loadgame.js');

function sceneName(G) {
  const s = G.getScene();
  if (!s) return 'null';
  if (s.enemies && s.crowd !== undefined) return 'battle';
  if (s === G.World) return 'world';
  if (s === G.Cutscene) return 'cutscene';
  if (s === G.Title) return 'title';
  if (s === G.Boot) return 'boot';
  if (s.dripList !== undefined || s.mode === 'drip') return 'party';
  return 'other';
}

function isBattle(G) { const s = G.getScene(); return s && s.enemies && s.crowd !== undefined; }
function isWorld(G) { return G.getScene() === G.World; }

/* advance any dialogue/cutscene/other menu by tapping A until we reach world/battle */
function advanceUntil(h, pred, maxSteps, label) {
  const { G } = h;
  let guard = 0;
  while (!pred(G) && guard++ < (maxSteps || 4000)) {
    const nm = sceneName(G);
    if (nm === 'battle') return; /* let caller handle */
    if (nm === 'cutscene' || nm === 'other' || nm === 'boot' || nm === 'title') { h.tap('a'); h.step(2, 20); }
    else h.step(2, 20);
  }
  if (!pred(G)) throw new Error('advanceUntil timeout' + (label ? ' [' + label + ']' : '') + ' scene=' + sceneName(G));
}

/* BFS path of directions from player to target tile on current map */
function findPath(G, tx, ty) {
  const m = G.curMap();
  const sx = G.Game.px, sy = G.Game.py;
  const key = (x, y) => x + ',' + y;
  const q = [[sx, sy]]; const prev = {}; prev[key(sx, sy)] = null;
  const dirs = [['up', 0, -1], ['down', 0, 1], ['left', -1, 0], ['right', 1, 0]];
  let head = 0;
  while (head < q.length) {
    const [cx, cy] = q[head++];
    if (cx === tx && cy === ty) {
      const path = []; let cur = key(cx, cy);
      while (prev[cur]) { path.unshift(prev[cur].d); cur = prev[cur].k; }
      return path;
    }
    for (const [d, dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy, k = key(nx, ny);
      if (k in prev) continue;
      // allow the destination even if it's a warp; block solids (except target)
      if (!(nx === tx && ny === ty) && G.solidAt(m, nx, ny)) continue;
      if (nx < 0 || ny < 0 || nx >= m.w || ny >= m.h) continue;
      prev[k] = { k: key(cx, cy), d }; q.push([nx, ny]);
    }
  }
  return null;
}

/* walk exactly one tile in dir; returns true if moved/warped */
function walkStep(h, dir) {
  const { G } = h;
  const beforeMap = G.Game.map, bx = G.Game.px, by = G.Game.py;
  G.press(dir);
  let guard = 0;
  // wait for the move to *begin*, then release immediately so the held key
  // can't chain into a second tile (keeps walkTo in sync with its path)
  while (!G.World.moving && guard++ < 8 && isWorld(G) && G.Game.map === beforeMap) h.step(1, 16);
  G.release(dir);
  guard = 0;
  while (G.World.moving && guard++ < 40) h.step(1, 16);
  h.step(1, 16);
  // pump through any warp transition (World.locked) so the map actually changes
  guard = 0;
  while (isWorld(G) && G.World.locked && guard++ < 60) h.step(1, 16);
  return G.Game.map !== beforeMap || G.Game.px !== bx || G.Game.py !== by || !isWorld(G);
}

/* turn to face a direction (bumps if solid ahead) without relying on a full move */
function face(h, dir) {
  const { G } = h;
  G.press(dir);
  let g = 0;
  while (!G.World.moving && g++ < 4 && isWorld(G)) h.step(1, 16); // hold long enough to register a turn/bump
  G.release(dir);
  g = 0;
  while (G.World.moving && g++ < 30) h.step(1, 16); // if it actually stepped, finish it
  h.step(1, 16);
}
/* face a tile then press A to interact with whatever is there */
function interactAt(h, tx, ty) {
  const { G } = h;
  const dx = tx - G.Game.px, dy = ty - G.Game.py;
  const dir = dy < 0 ? 'up' : dy > 0 ? 'down' : dx < 0 ? 'left' : 'right';
  face(h, dir);
  h.tap('a'); h.step(3, 20);
}

/* walk to a target tile, auto-resolving any encounters along the way */
function walkTo(h, tx, ty, onBattle) {
  const { G } = h;
  let attempts = 0;
  while (isWorld(G) && !(G.Game.px === tx && G.Game.py === ty) && attempts++ < 60) {
    const path = findPath(G, tx, ty);
    if (!path || path.length === 0) throw new Error('no path to ' + tx + ',' + ty + ' on ' + G.Game.map + ' from ' + G.Game.px + ',' + G.Game.py);
    for (const d of path) {
      const mapBefore = G.Game.map;
      walkStep(h, d);
      if (isBattle(G)) { autoBattle(h, onBattle); h.step(3, 20); }
      if (!isWorld(G) && !isBattle(G)) { advanceUntil(h, isWorld, 3000, 'post-walk'); }
      if (G.Game.map !== mapBefore) return true; /* warped */
      if (G.Game.px === tx && G.Game.py === ty) return true;
    }
  }
  return G.Game.px === tx && G.Game.py === ty;
}

/* drive a battle to completion with a naive-but-typed strategy */
function autoBattle(h, opts) {
  const { G } = h;
  opts = opts || {};
  let guard = 0;
  while (guard++ < 8000) {
    // a scripted mid-battle reveal pauses the fight into a cutscene, then resumes it —
    // advance any such interrupt and keep fighting
    if (!isBattle(G)) {
      if (G.getScene() === G.Cutscene) { h.tap('a'); h.step(2, 20); continue; }
      break;
    }
    const b = G.getScene();
    if (b.phase === 'intro') { h.tap('a'); h.step(1, 20); continue; }
    if (b.phase === 'menu') {
      // choose FIGHT
      b.menuIdx = 0; h.tap('a'); h.step(1, 20); continue;
    }
    if (b.phase === 'move') {
      // pick the move with best type mult vs first living enemy (naive but sensible)
      const en = b.livingEnemies()[0];
      let best = 0, bestScore = -1;
      const mv = b.active().moves;
      for (let i = 0; i < mv.length; i++) {
        const M = G.MOVES[mv[i]];
        const score = (M.pow || 20) * G.typeMult(M.type, en.type);
        if (score > bestScore) { bestScore = score; best = i; }
      }
      b.moveIdx = best; h.tap('a'); h.step(1, 20); continue;
    }
    if (b.phase === 'target') { h.tap('a'); h.step(1, 20); continue; }
    if (b.phase === 'aim') { if (opts.onBeat) { /* try to hit beat */ h.tap('a'); } h.step(2, 20); continue; }
    if (b.phase === 'resolve') { h.tap('a'); h.step(1, 20); continue; }
    if (b.phase === 'faintswitch') {
      // choose first living
      const p = b.party; for (let i = 0; i < p.length; i++) if (!p[i].fainted && p[i].hp > 0) { b.switchIdx = i; break; }
      h.tap('a'); h.step(1, 20); continue;
    }
    if (b.phase === 'result') {
      const won = b.result.win, fled = b.result.fled;
      if (opts.stopAtResult) return { win: won, fled: fled, lost: b.result.lost }; // single attempt (balance sweep)
      h.tap('a'); h.step(3, 20);
      // loss on a boss/story fight retries the same battle; keep playing until we leave battle
      if (!isBattle(G)) return { win: won, fled: fled, lost: b.result.lost };
      continue;
    }
    h.step(1, 20);
  }
  return { win: !isBattle(G) };
}

/* walk from the current map to the warp leading to targetMapId, resolving encounters */
function walkToNextMap(h, targetMapId, onBattle) {
  const { G } = h;
  const w = G.curMap().warps.find(w => w.to === targetMapId);
  if (!w) throw new Error('no warp to ' + targetMapId + ' on ' + G.Game.map);
  walkTo(h, w.x, w.y, onBattle);
  advanceUntil(h, g => isWorld(g) || isBattle(g), 4000, 'to ' + targetMapId);
  if (isBattle(G)) { autoBattle(h, onBattle || {}); advanceUntil(h, isWorld, 5000); }
  return G.Game.map === targetMapId;
}
/* advance any victory dialogue, then when the travelChoose hub appears pick the
   option whose label includes `needle`; then ride the transition into the new map */
function pickTravel(h, needle) {
  const { G } = h;
  let guard = 0;
  while (guard++ < 200) {
    const s = G.getScene();
    if (s === G.Cutscene && s.mode === 'choice' && s.choice) {
      const i = s.choice.opts.findIndex(o => o.indexOf(needle) >= 0);
      if (i >= 0) { s.choice.idx = i; h.tap('a'); h.step(3, 25); return true; }
      h.tap('a'); h.step(2, 25); continue;
    }
    if (s === G.Cutscene) { h.tap('a'); h.step(2, 25); continue; } // advance victory dialogue
    h.step(2, 25);
  }
  return false;
}

module.exports = { loadGame, sceneName, isBattle, isWorld, advanceUntil, findPath, walkTo, walkStep, autoBattle, face, interactAt, walkToNextMap, pickTravel };
