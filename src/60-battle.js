/* battle.js — turn-based combat. FIGHT / SWAG / SWITCH / FLEE.
   Type wheel, Crowd Meter, statuses, timing crits (ON BEAT!), switching,
   items, flee, XP/level-ups/move learning, boss AI gimmicks, SHOWSTOPPER. */

var Battle = null;
function startBattle(spec, onEnd) {
  Battle = makeBattle(spec, onEnd);
  setScene(Battle);
}
function startWildBattle(map) {
  var pool = ENC_POOLS[map.encPool || map.id] || ENC_POOLS.london;
  var eid = pool[(Math.random() * pool.length) | 0];
  var lead = firstLiving(Game.party) || Game.party[0];
  var lv = Math.max(1, lead.level + ((Math.random() * 3 | 0) - 1));
  startBattle({ enemies: [{ enemy: eid, level: lv }], music: 'battle', canFlee: true, wild: true, bg: map.battleBg, taunt: pickTaunt(eid) },
    function () { setScene(World); });
}
function firstLiving(arr) { for (var i = 0; i < arr.length; i++) if (!arr[i].fainted && arr[i].hp > 0) return arr[i]; return null; }
function firstLivingIdx(arr) { for (var i = 0; i < arr.length; i++) if (!arr[i].fainted && arr[i].hp > 0) return i; return -1; }

function computeDamage(atk, def, move, onBeat, favored) {
  var lvl = atk.level, pow = move.pow;
  if (move.eff && move.eff.scaleCrowd) {
    var favor = atk.isEnemy ? -Battle.crowd : Battle.crowd;
    pow = 55 + Math.max(0, favor);
  }
  var flow = eff(atk, 'FLOW');
  var poise = (move.eff && move.eff.pierce) ? (def.basePOISE + dripBonus(def, 'POISE')) : eff(def, 'POISE');
  var base = Math.floor(((2 * lvl / 5 + 2) * pow * flow / poise) / 50 + 2);
  var tm = typeMult(move.type, def.type);
  var crit = (Math.random() < (0.055 + (move.crit || 0))) ? 1.5 : 1;
  var ob = onBeat ? 1.3 : 1;
  var fav = favored ? 1.2 : 1;
  var vr = 0.85 + Math.random() * 0.15;
  return { dmg: Math.max(1, Math.round(base * tm * crit * ob * fav * vr)), tm: tm, crit: crit > 1, ob: onBeat };
}
function dripBonus(f, stat) { return (f.drip && DRIP[f.drip] && DRIP[f.drip].bonus && DRIP[f.drip].bonus[stat]) || 0; }

/* ================= Emerald-style battle presentation ================= */
/* pale dotted platform ellipses (the "circle of land"), era-tinted rim */
var PLAT = {
  stage: { top: '#e6d8c6', dot: '#cdbca4', rim: '#a8907a' },
  disco: { top: '#d8cfe8', dot: '#b8aad0', rim: '#8a78ac' },
  west:  { top: '#ecd9b0', dot: '#d0b988', rim: '#b09660' },
  rome:  { top: '#e8dfc8', dot: '#ccc0a0', rim: '#a89a78' },
  xmas:  { top: '#eef2f8', dot: '#ccd6e4', rim: '#a4b2c6' }
};
function bPlatform(bg, x0, y0, x1, y1) {
  var c = PLAT[bg] || { top: '#e0dcd0', dot: '#c4beac', rim: '#9a9484' };
  fillEll(x0, y0, x1, y1, c.top);
  strokeEll(x0, y0, x1, y1, c.rim);
  var w = x1 - x0, h = y1 - y0;
  for (var i = 0; i < 14; i++) {
    var a = i * 2.399, r = 0.15 + (i % 5) * 0.16;
    var dx = (x0 + x1) / 2 + Math.cos(a) * (w / 2) * r * 0.9;
    var dy = (y0 + y1) / 2 + Math.sin(a) * (h / 2) * r * 0.9;
    px(dx, dy, 2, 1, c.dot);
  }
}
function bPlatforms(bg, exOfs, pxOfs) {
  exOfs = exOfs || 0; pxOfs = pxOfs || 0;
  bPlatform(bg, 130 + exOfs, 62, 238 + exOfs, 86);
  bPlatform(bg, -10 + pxOfs, 104, 112 + pxOfs, 136);
}
/* Emerald textbox: teal fill, dark red frame, white text with shadow */
function bTealBox(x, y, w, h) {
  px(x, y, w, h, '#8a2c34');
  px(x + 2, y + 2, w - 4, h - 4, '#b8404a');
  px(x + 4, y + 4, w - 8, h - 8, '#3e7d84');
  px(x + 4, y + 4, w - 8, 1, '#5a9aa0');
}
function bShadowText(t, x, y, c) { drawText(t, x + 1, y + 1, '#1e3d42'); drawText(t, x, y, c || '#f8f8f8'); }
function bShadowCenter(t, y, c) { bShadowText(t, (240 - textW(t)) >> 1, y, c); }
/* white command/move panel (GBA menu paper) */
function bWhitePanel(x, y, w, h) {
  px(x, y, w, h, '#5a5244'); px(x + 2, y + 2, w - 4, h - 4, '#f8f8f4');
  px(x + 2, y + 2, w - 4, 1, '#ffffff'); px(x + 2, y + h - 4, w - 4, 1, '#d0ccc0');
}
/* parchment panel with drop shadow (HP boxes, result/switch/bag) */
function bParchPanel(x, y, w, h) {
  px(x + 2, y + 2, w, h, 'rgba(0,0,0,0.25)');
  px(x, y, w, h, '#5a5244');
  px(x + 1, y + 1, w - 2, h - 2, '#f4ecd4');
  px(x + 1, y + 1, w - 2, 1, '#fdf8ea'); px(x + 1, y + h - 2, w - 2, 1, '#d8ccac');
}
var STATUS_PILL = { FLUSTERED: '#8b5cf6', BORED: '#9aa0b0', SHOOK: '#349c8e', CHARMED: '#e05f8f', MICFEEDBACK: '#c63a46' };
function bHpBar(bx, by, bw, frac) {
  frac = Math.max(0, Math.min(1, frac));
  px(bx, by, 16, 7, '#4a5568'); drawText('HP', bx + 2, by + 1, '#f8d048');
  px(bx + 16, by, bw - 16, 7, '#4a5568');
  px(bx + 17, by + 1, bw - 18, 5, '#2e333e');
  var c = frac > 0.5 ? '#48c848' : frac > 0.2 ? '#f8d048' : '#e84848';
  if (frac > 0) px(bx + 17, by + 1, Math.max(1, Math.round((bw - 18) * frac)), 5, c);
}
function bHpBoxEnemy(f, x, y) {
  bParchPanel(x, y, 102, 28);
  drawText(('' + f.name).substr(0, 11), x + 5, y + 4, '#4a4438');
  drawText('LV' + f.level, x + 78, y + 4, '#4a4438');
  var st = f.status;
  if (st) { px(x + 4, y + 14, 26, 9, STATUS_PILL[st] || '#c8a020'); px(x + 4, y + 14, 26, 1, 'rgba(0,0,0,0.3)'); drawText(st.substr(0, 3), x + 6, y + 15, COL.white); }
  bHpBar(st ? x + 32 : x + 5, y + 15, st ? 66 : 93, f.hp / maxHPd(f));
}
function bHpBoxPlayer(f, x, y) {
  bParchPanel(x, y, 110, 34);
  drawText(('' + f.name).substr(0, 11), x + 5, y + 4, '#4a4438');
  drawText('LV' + f.level, x + 86, y + 4, '#4a4438');
  bHpBar(x + 5, y + 14, 100, f.hp / maxHPd(f));
  var st = f.status;
  if (st) { px(x + 5, y + 23, 26, 9, STATUS_PILL[st] || '#c8a020'); px(x + 5, y + 23, 26, 1, 'rgba(0,0,0,0.3)'); drawText(st.substr(0, 3), x + 7, y + 24, COL.white); }
  drawText(f.hp + '/' + maxHPd(f), x + 52, y + 24, '#4a4438');
}
/* compact boxes for double battles: every combatant's stats stay on screen */
function bHpBoxEnemyMini(f, x, y) {
  bParchPanel(x, y, 94, 20);
  drawText(('' + f.name).substr(0, 9), x + 4, y + 3, '#4a4438');
  var st = f.status;
  if (st) { px(x + 70, y + 2, 20, 9, STATUS_PILL[st] || '#c8a020'); drawText(st.substr(0, 3), x + 72, y + 3, COL.white); }
  else drawText('L' + f.level, x + 74, y + 3, '#4a4438');
  bHpBar(x + 4, y + 11, 86, f.hp / maxHPd(f));
}
function bHpBoxAllyMini(f, x, y, isCmd) {
  bParchPanel(x, y, 102, 21);
  if (isCmd) { px(x + 1, y + 1, 100, 1, COL.gold); drawText('>', x - 7, y + 6, '#e84848'); }
  drawText(('' + f.name).substr(0, 9), x + 4, y + 3, '#4a4438');
  var st = f.status;
  if (st) { px(x + 76, y + 2, 22, 9, STATUS_PILL[st] || '#c8a020'); drawText(st.substr(0, 3), x + 78, y + 3, COL.white); }
  else drawText('L' + f.level, x + 80, y + 3, '#4a4438');
  bHpBar(x + 4, y + 12, 56, f.hp / maxHPd(f));
  drawText(f.hp + '/' + maxHPd(f), x + 62, y + 13, '#4a4438');
}
/* crowd meter as a live audience strip along the top (Battle Frontier style) */
function bAudienceStrip(v, maxed) {
  px(0, 0, 240, 12, '#2a2a36');
  var heads = 18, lit = Math.round(((v + 100) / 200) * heads);
  var skins = ['#f4c898', '#ce9c6a', '#8a5a34'], hats = ['#c63a46', '#349c8e', '#e2b23e', '#8b5cf6'];
  for (var i = 0; i < heads; i++) {
    var hx = 4 + i * 12, on = i < lit;
    px(hx, 3, 7, 6, on ? skins[i % 3] : '#3e3e4c');
    px(hx, 1, 7, 3, on ? hats[i % 4] : '#34343e');
    if (on && i % 4 === 2) px(hx + 2, 0, 3, 2, '#f8d048'); /* a fan waving */
  }
  if (maxed) drawTextO('MAX!', 221, 3, '#e2b23e', COL.black);
  px(0, 12, 240, 1, '#15121c');
}
/* slim move-name banner shown during attack animations */
function bBanner(txt, col) { px(30, 16, 180, 12, 'rgba(21,18,28,0.85)'); centerText(txt, 18, col || '#f8f4e4'); }
/* attack projectile glyph per type + idle-tic lookup tables */
var FX_GLYPH = { ROAST: 'fx-ember', HEART: 'fx-heart', WORDPLAY: 'fx-glyph', FLEX: 'fx-star', CLASSIC: 'fx-burst' };
var TIC_BY_ID = { samuel: 'note', herschel: 'zzz', william: 'sparkle', rosalind: 'spark', rex: 'point',
  goblin: 'note', goblinhex: 'note', goblinbrute: 'note', gerald: 'sweat', editor: 'sweat' };
var TIC_BY_TYPE = { ROAST: 'ember', FLEX: 'star', WORDPLAY: 'glyph', HEART: 'heart', CLASSIC: 'sweat' };
function ticKindFor(f) { return TIC_BY_ID[f.id] || TIC_BY_ID[f.spr] || TIC_BY_TYPE[f.type] || 'sweat'; }
var SPR_IMG_ALIAS = { dancer: 'discofan', cowboy: 'auctioneer' };
function battleImg(name) { return (typeof IMG !== 'undefined' && IMG[name]) ? IMG[name] : null; }

function makeBattle(spec, onEnd) {
  var enemies = [];
  for (var i = 0; i < spec.enemies.length; i++) {
    var e = spec.enemies[i];
    enemies.push(e.boss ? makeBoss(e.boss) : makeEnemy(e.enemy, e.level));
  }
  var livingP = 0;
  for (var lp = 0; lp < Game.party.length; lp++) if (!Game.party[lp].fainted && Game.party[lp].hp > 0) livingP++;
  var B = {
    spec: spec, onEnd: onEnd, enemies: enemies,
    party: Game.party,
    activeIdx: Math.max(0, firstLivingIdx(Game.party)),
    targetIdx: 0,
    /* DOUBLE BATTLE: 2+ foes and 2+ living daddies -> two allies fight at once */
    double: (enemies.length >= 2 && livingP >= 2),
    field: null, cmdSlot: 0, slotActions: [null, null], faintSlot: -1, roundMsgs: [],
    crowd: spec.crowdStart || 0, usedShow: false,
    revealPending: false, revealDone: false, superFX: null,
    phase: 'transition', transT: 0, transDur: 1.7, taunt: spec.taunt || null,
    menuIdx: 0, moveIdx: 0, itemIdx: 0, switchIdx: 0,
    queue: [], qi: 0, msg: '', msgT: 0, autoMsgT: 0,
    aimT: 0, aimHit: false, pendingMove: null,
    flash: 0, shake: 0, participants: {},
    result: null, introT: 0, animT: 0, hitFlash: 0, anim: null,
    xpMsgs: [],
    enter: function () { musicStart(spec.music || 'battle'); this.introT = 0;
      this.participants[this.activeIdx] = true;
      if (this.double) for (var s = 0; s < this.field.length; s++) this.participants[this.field[s]] = true; },
    active: function () { return this.party[this.activeIdx]; },
    livingEnemies: function () { var a = []; for (var i = 0; i < this.enemies.length; i++) if (!this.enemies[i].fainted) a.push(this.enemies[i]); return a; },
    firstEnemyIdx: function () { for (var i = 0; i < this.enemies.length; i++) if (!this.enemies[i].fainted) return i; return -1; },
    /* ---------- double-battle helpers ---------- */
    fieldFighter: function (s) { return this.party[this.field[s]]; },
    setSlot: function (s) { this.cmdSlot = s; this.activeIdx = this.field[s]; this.menuIdx = 0; this.moveIdx = 0; },
    nextSlotOrRun: function () {
      for (var s = this.cmdSlot + 1; s < this.field.length; s++) {
        var f = this.fieldFighter(s);
        if (f && !f.fainted && f.hp > 0 && !this.slotActions[s]) { this.setSlot(s); this.phase = 'menu'; return; }
      }
      this.runRound();
    },
    benchLiving: function () {
      var a = [];
      for (var i = 0; i < this.party.length; i++) { var f = this.party[i];
        if (!f.fainted && f.hp > 0 && this.field.indexOf(i) < 0) a.push(i); }
      return a;
    },
    pickAllyTargetP: function () {
      var opts = [];
      for (var s = 0; s < this.field.length; s++) { var f = this.fieldFighter(s); if (f && !f.fainted && f.hp > 0) opts.push(this.field[s]); }
      if (!opts.length) return this.activeIdx;
      return opts[(Math.random() * opts.length) | 0];
    },
    resolveAllyTarget: function (pIdx) {
      var f = this.party[pIdx];
      if (f && !f.fainted && f.hp > 0 && this.field.indexOf(pIdx) >= 0) return f;
      for (var s = 0; s < this.field.length; s++) { var g = this.fieldFighter(s); if (g && !g.fainted && g.hp > 0) return g; }
      return null;
    },
    /* ---------- input ---------- */
    onPress: function (k) {
      if (this.phase === 'transition') { if (k === 'a' || k === 'start') { this.transT = this.transDur; this.phase = 'intro'; this.introT = 0; } return; }
      if (this.phase === 'intro') { if (k === 'a' || k === 'b' || k === 'start') this.toMenu(); return; }
      if (this.phase === 'anim') { if ((k === 'a' || k === 'b' || k === 'start') && this.anim) this.anim.t = this.anim.dur; return; }
      if (this.phase === 'menu') return this.menuInput(k);
      if (this.phase === 'move') return this.moveInput(k);
      if (this.phase === 'target') return this.targetInput(k);
      if (this.phase === 'switch') return this.switchInput(k);
      if (this.phase === 'bag') return this.bagInput(k);
      if (this.phase === 'aim') { if (k === 'a') this.aimPress(); return; }
      if (this.phase === 'resolve') { if (k === 'a' || k === 'b') this.advance(); return; }
      if (this.phase === 'result') { if (k === 'a' || k === 'start') this.finish(); return; }
      if (this.phase === 'faintswitch') return this.switchInput(k);
    },
    toMenu: function () {
      if (this.double) {
        var s0 = -1;
        for (var s = 0; s < this.field.length; s++) { var ff = this.fieldFighter(s); if (ff && !ff.fainted && ff.hp > 0) { s0 = s; break; } }
        if (s0 < 0) { if (firstLivingIdx(this.party) < 0) { this.lose(); return; } s0 = 0; }
        this.slotActions = [null, null]; this.roundMsgs = [];
        this.setSlot(s0); this.phase = 'menu';
        if (this.crowd >= 100 && !this.usedShow) { this.showBanner = true; }
        return;
      }
      if (!this.active() || this.active().fainted) { var idx = firstLivingIdx(this.party); if (idx < 0) { this.lose(); return; } this.activeIdx = idx; }
      this.phase = 'menu'; this.menuIdx = 0;
      if (this.crowd >= 100 && !this.usedShow) { this.showBanner = true; }
    },
    menuInput: function (k) {
      var opts = 4;
      if (k === 'up') { this.menuIdx = (this.menuIdx + 2) % 4; sfx('cursor'); }
      else if (k === 'down') { this.menuIdx = (this.menuIdx + 2) % 4; sfx('cursor'); }
      else if (k === 'left') { this.menuIdx = (this.menuIdx + 3) % 4; sfx('cursor'); }
      else if (k === 'right') { this.menuIdx = (this.menuIdx + 1) % 4; sfx('cursor'); }
      else if (k === 'b' && this.double && this.cmdSlot > 0 && this.slotActions[this.cmdSlot - 1] && this.slotActions[this.cmdSlot - 1].kind === 'move') {
        /* back up to re-choose the first daddy's move (switch/item already applied, can't undo) */
        this.slotActions[this.cmdSlot - 1] = null; this.setSlot(this.cmdSlot - 1); this.phase = 'menu'; sfx('cancel');
      }
      else if (k === 'a') {
        sfx('select');
        if (this.menuIdx === 0) { this.phase = 'move'; this.moveIdx = 0; }
        else if (this.menuIdx === 1) { this.phase = 'bag'; this.itemIdx = 0; this.bagList = this.buildBag(); }
        else if (this.menuIdx === 2) { this.phase = 'switch'; this.switchIdx = this.activeIdx; }
        else if (this.menuIdx === 3) { this.tryFlee(); }
      }
    },
    moveInput: function (k) {
      var mv = this.active().moves;
      if (k === 'up') { this.moveIdx = (this.moveIdx + mv.length - 1) % mv.length; sfx('cursor'); }
      else if (k === 'down') { this.moveIdx = (this.moveIdx + 1) % mv.length; sfx('cursor'); }
      else if (k === 'b') { this.phase = 'menu'; sfx('cancel'); }
      else if (k === 'a') {
        sfx('select');
        var move = MOVES[mv[this.moveIdx]];
        this.pendingMove = move;
        if (move.tgt === 'enemy' && this.livingEnemies().length > 1) { this.phase = 'target'; this.targetIdx = this.firstEnemyIdx(); }
        else { this.beginAim(move); }
      }
    },
    targetInput: function (k) {
      if (k === 'up' || k === 'left') { do { this.targetIdx = (this.targetIdx + this.enemies.length - 1) % this.enemies.length; } while (this.enemies[this.targetIdx].fainted); sfx('cursor'); }
      else if (k === 'down' || k === 'right') { do { this.targetIdx = (this.targetIdx + 1) % this.enemies.length; } while (this.enemies[this.targetIdx].fainted); sfx('cursor'); }
      else if (k === 'b') { this.phase = 'move'; sfx('cancel'); }
      else if (k === 'a') { sfx('select'); this.beginAim(this.pendingMove); }
    },
    switchInput: function (k) {
      var forced = (this.phase === 'faintswitch');
      if (k === 'up') { this.switchIdx = (this.switchIdx + this.party.length - 1) % this.party.length; sfx('cursor'); }
      else if (k === 'down') { this.switchIdx = (this.switchIdx + 1) % this.party.length; sfx('cursor'); }
      else if (k === 'b' && !forced) { this.phase = 'menu'; sfx('cancel'); }
      else if (k === 'a') {
        var t = this.party[this.switchIdx];
        if (this.double) {
          if (forced) {
            /* auto-snap an invalid pick (fainted or already fielded) to the next valid bench daddy */
            var pick = this.switchIdx, guard = 0;
            while (guard++ < this.party.length && (this.party[pick].fainted || this.party[pick].hp <= 0 || this.field.indexOf(pick) >= 0))
              pick = (pick + 1) % this.party.length;
            if (this.party[pick].fainted || this.party[pick].hp <= 0 || this.field.indexOf(pick) >= 0) { sfx('cancel'); return; }
            sfx('select');
            this.field[this.faintSlot] = pick; this.activeIdx = pick; this.participants[pick] = true; this.faintSlot = -1;
            this.afterFaintCheck(); return;
          }
          if (t.fainted || t.hp <= 0 || this.field.indexOf(this.switchIdx) >= 0) { sfx('cancel'); return; }
          sfx('select');
          this.field[this.cmdSlot] = this.switchIdx; this.activeIdx = this.switchIdx; this.participants[this.switchIdx] = true;
          this.slotActions[this.cmdSlot] = { kind: 'switch' };
          this.roundMsgs.push(this.party[this.switchIdx].name + ' STEPS UP!');
          this.nextSlotOrRun(); return;
        }
        if (t.fainted || t.hp <= 0) { sfx('cancel'); return; }
        if (this.switchIdx === this.activeIdx && !forced) { sfx('cancel'); return; }
        sfx('select'); this.activeIdx = this.switchIdx; this.participants[this.activeIdx] = true;
        if (forced) { this.phase = 'menu'; this.toMenu(); }
        else { this.playerAction = { kind: 'switch' }; this.runRound(); }
      }
    },
    bagInput: function (k) {
      if (this.bagList.length === 0) { if (k === 'b') { this.phase = 'menu'; sfx('cancel'); } return; }
      if (k === 'up') { this.itemIdx = (this.itemIdx + this.bagList.length - 1) % this.bagList.length; sfx('cursor'); }
      else if (k === 'down') { this.itemIdx = (this.itemIdx + 1) % this.bagList.length; sfx('cursor'); }
      else if (k === 'b') { this.phase = 'menu'; sfx('cancel'); }
      else if (k === 'a') { sfx('select'); this.useItemFromBag(this.bagList[this.itemIdx]); }
    },
    buildBag: function () { var a = []; for (var id in Game.items) if (Game.items[id] > 0 && ITEMS[id] && ITEMS[id].field !== false) a.push(id); return a; },
    /* ---------- timing crit ---------- */
    beginAim: function (move) {
      if (!move.pow || move.tgt !== 'enemy') { this.commitPlayer(move, false); return; }
      this.phase = 'aim'; this.aimT = 0; this.aimHit = false; this.aimDur = 0.95;
    },
    aimPress: function () {
      var p = this.aimT / this.aimDur; /* marker sweeps 0..1 */
      if (Math.abs(p - 0.7) < 0.09) { this.aimHit = true; sfx('onbeat'); }
      else { sfx('blip'); }
      this.commitPlayer(this.pendingMove, this.aimHit);
    },
    commitPlayer: function (move, onBeat) {
      if (this.double) {
        this.slotActions[this.cmdSlot] = { kind: 'move', move: move, onBeat: onBeat, target: this.targetIdx };
        this.nextSlotOrRun(); return;
      }
      this.playerAction = { kind: 'move', move: move, onBeat: onBeat, target: this.targetIdx };
      this.runRound();
    },
    /* ---------- round resolution ---------- */
    runRound: function () {
      var self = this;
      this.queue = []; this.qi = 0;
      /* build actor action list */
      var actors = [], i;
      if (this.double) {
        for (i = 0; i < this.roundMsgs.length; i++) this.pushMsg(this.roundMsgs[i]);
        this.roundMsgs = [];
        for (var s = 0; s < this.field.length; s++) {
          var sAct = this.slotActions[s], ff = this.fieldFighter(s);
          if (sAct && sAct.kind === 'move' && ff && !ff.fainted) actors.push({ f: ff, isPlayer: true, slot: s, act: sAct });
        }
      } else {
        var ply = this.active();
        var pAct = this.playerAction;
        if (pAct.kind === 'move') actors.push({ f: ply, isPlayer: true, slot: 0, act: pAct });
        else if (pAct.kind === 'switch') { /* switch already applied; enemies still act */ }
      }
      /* enemies choose */
      for (i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i]; if (e.fainted) continue;
        actors.push({ f: e, isPlayer: false, act: this.enemyChoose(e) });
      }
      /* order by TEMPO (switch = player already moved; enemies act after) */
      actors.sort(function (a, b) { return eff(b.f, 'TEMPO') - eff(a.f, 'TEMPO') + (Math.random() - 0.5); });
      /* build event queue */
      if (!this.double && this.playerAction.kind === 'switch') this.pushMsg(this.active().name + ' STEPS UP!');
      for (i = 0; i < actors.length; i++) this.buildActorEvents(actors[i]);
      /* end of round: status ticks */
      this.queue.push({ fn: function () { return self.endRoundTick(); } });
      this.phase = 'resolve'; this.qi = 0; this.runEvent();
    },
    enemyChoose: function (e) {
      var ai = e.ai || 'basic';
      e.turnCount = (e.turnCount || 0) + 1;
      /* in doubles each foe picks which fielded daddy it goes after */
      var tgtP = this.double ? this.pickAllyTargetP() : this.activeIdx;
      var tgtF = this.party[tgtP] || this.active();
      var pick = function (id) { return { kind: 'move', move: MOVES[id], onBeat: false, target: 0, targetP: tgtP, actor: e }; };
      var atkMove = function () {
        /* choose a damaging move, prefer type advantage on the chosen target */
        var best = null, bestScore = -1, tgt = tgtF;
        for (var i = 0; i < e.moves.length; i++) { var m = MOVES[e.moves[i]]; if (!m.pow) continue;
          var sc = m.pow * typeMult(m.type, tgt.type) + Math.random() * 5; if (sc > bestScore) { bestScore = sc; best = e.moves[i]; } }
        return pick(best || e.moves[0]);
      };
      /* every boss unleashes its screen-shaking SUPER every 4th turn */
      if (e.superMove && e.turnCount >= 3 && e.turnCount % 3 === 0) return pick(e.superMove);
      if (ai === 'maximvs' && e.turnCount <= 3) return pick('flexstack'); /* three escalating self-buffs */
      if (ai === 'rex' && this.crowd < -20 && e.turnCount % 2 === 0) return pick('mirrorball'); /* heals via crowd */
      if (ai === 'snob1' && e.turnCount % 3 === 0) return pick('rewrite');
      if (ai === 'snob2') { if (e.turnCount % 2 === 0) return pick('finaldraft'); return atkMove(); }
      if (ai === 'jake' && e.turnCount % 3 === 0) return pick('venom');
      if (ai === 'understudy') { var mv = e.moves[(e.turnCount) % e.moves.length]; return pick(mv); }
      /* basic + grunt: mostly attack, occasional utility */
      var m = e.moves[(Math.random() * e.moves.length) | 0];
      if (!MOVES[m].pow && Math.random() < 0.5) m = e.moves[0];
      return pick(m);
    },
    buildActorEvents: function (a) {
      var self = this, f = a.f, act = a.act;
      /* attack animation beat: plays before the action resolves */
      if (act && act.kind === 'move' && act.move) {
        this.queue.push({ fn: function () { return self.makeAnim(f, act, a.isPlayer, a.slot); } });
      }
      /* status gate */
      this.queue.push({ fn: function () {
        if (f.fainted || f.hp <= 0) return null;
        if (f.status === 'BORED') { if (Math.random() < 0.4) { f.status = null; return f.name + ' SNAPS AWAKE!'; } return f.name + ' IS BORED... (ZZZ)'; }
        if (f.status === 'CHARMED' && Math.random() < 0.5) return f.name + ' IS CHARMED! IT SKIPS ITS TURN.';
        if (f.status === 'FLUSTERED' && Math.random() < 0.33) { var d = Math.max(1, Math.round(maxHPd(f) * 0.06)); f.hp = Math.max(0, f.hp - d); self.hitFlash = 0.2; return f.name + ' IS FLUSTERED AND FUMBLES!'; }
        return self.doAction(f, act, a.isPlayer);
      } });
    },
    /* build the {anim:...} descriptor for a queued action, or null to skip it */
    makeAnim: function (f, act, isPlayer, slot) {
      if (f.fainted || f.hp <= 0 || f.status === 'BORED') return null;
      var move = act.move; if (!move) return null;
      var e = move.eff || {}, cat;
      if (move.pow) cat = 'hit';
      else if (e.healFrac || e.hot || e.cure) cat = 'heal';
      else if (e.status || e.debuffStat) cat = 'status';
      else cat = 'buff';
      var tIdx = 0;
      if (move.tgt === 'enemy' && isPlayer) {
        tIdx = (this.enemies[act.target] && !this.enemies[act.target].fainted) ? act.target : this.firstEnemyIdx();
        if (tIdx < 0) return null;
      }
      var eIdx = isPlayer ? 0 : this.enemies.indexOf(f);
      /* doubles: which ally slot lunges / gets hit */
      var pSlot = isPlayer ? (slot || 0) : 0, tSlot = 0;
      if (!isPlayer && this.double && move.tgt === 'enemy') {
        var rt = this.resolveAllyTarget(act.targetP);
        if (rt) { var fsIdx = this.field.indexOf(this.party.indexOf(rt)); if (fsIdx >= 0) tSlot = fsIdx; }
      }
      return { anim: { actorIsEnemy: !isPlayer, eIdx: eIdx < 0 ? 0 : eIdx, tIdx: tIdx, pSlot: pSlot, tSlot: tSlot,
        type: move.type, cat: cat, name: move.name, atEnemy: move.tgt === 'enemy', t: 0, dur: 0.55 } };
    },
    doAction: function (f, act, isPlayer) {
      if (act.kind !== 'move') return null;
      var move = act.move;
      /* accuracy incl. evasion */
      var tgt;
      if (move.tgt === 'enemy') tgt = isPlayer ? (this.enemies[act.target] && !this.enemies[act.target].fainted ? this.enemies[act.target] : this.livingEnemies()[0]) : (this.double ? this.resolveAllyTarget(act.targetP) : this.active());
      else tgt = f;
      if (!tgt) return null;
      var accRoll = Math.random();
      var evaSt = (move.tgt === 'enemy') ? stageMul(-(tgt.stage.EVA || 0)) : 1;
      if (move.pow || move.eff && (move.eff.status || move.eff.debuffStat)) {
        if (accRoll > (move.acc || 1) * evaSt) { this.crowdSwing(f, -3); return f.name + "'S " + move.name + ' MISSED!'; }
      }
      var lines = [f.name + ' USES ' + move.name + '!'];
      /* signature SUPER move -> screen-shaking animation overlay */
      if (move.fx) { this.superFX = { kind: move.fx, name: move.name, t: 0, dur: 1.5, color: TYPECOL[move.type] || COL.white }; this.shake = 1.5; this.flash = 0.5; sfx('boom'); sfx('showstopper'); }
      this.crowdSwing(f, Math.abs(move.crowd || 0));
      /* damage */
      if (move.pow) {
        var favored = f.isEnemy ? (this.crowd <= -40) : (this.crowd >= 40);
        var r = computeDamage(f, tgt, move, act.onBeat, favored);
        /* counter check */
        if (tgt.counter && !f.isEnemy === !!tgt.isEnemy) {} /* counter handled below generically */
        if (tgt.counter) {
          tgt.counter = false;
          var back = Math.max(1, Math.round(r.dmg * 0.75));
          f.hp = Math.max(0, f.hp - back);
          this.hitFlash = 0.25; this.shake = 0.3;
          lines.push(tgt.name + ' COUNTERS FOR ' + back + '!');
          this.crowdSwing(tgt, 6);
          if (f.hp <= 0) lines.push(this.faint(f));
          return lines;
        }
        tgt.hp = Math.max(0, tgt.hp - r.dmg);
        this.hitFlash = 0.25; this.shake = r.crit ? 0.4 : 0.2;
        /* scripted mid-battle reveal (e.g. Samuel's wig): fire once when the marked foe drops below the threshold */
        if (this.spec.reveal && !this.revealDone && tgt.isEnemy && tgt.hp > 0 && tgt.hp / maxHPd(tgt) <= this.spec.reveal.hpFrac) this.revealPending = true;
        if (act.onBeat) lines.push('ON BEAT! +30%');
        if (r.crit) { sfx('crit'); lines.push('A CRITICAL BAR!'); this.crowdSwing(f, 6); }
        else sfx('hit');
        if (r.tm > 1) { sfx('super'); lines.push('THAT ONE LANDED!'); this.crowdSwing(f, 8); }
        else if (r.tm < 1) { sfx('weak'); lines.push("THE CROWD'S NOT FEELING IT..."); }
        if (move.eff && move.eff.selfDmgFrac) { var sd = Math.round(maxHPd(f) * move.eff.selfDmgFrac); f.hp = Math.max(0, f.hp - sd); lines.push(f.name + ' TAKES ' + sd + ' RECOIL.'); }
        if (move.eff && move.eff.healFromCrowd) { var favr = f.isEnemy ? -this.crowd : this.crowd; if (favr > 0) { var h = Math.round(favr * 0.6); f.hp = Math.min(maxHPd(f), f.hp + h); lines.push(f.name + ' FEEDS OFF THE CROWD! +' + h); sfx('heal'); } }
        this.applyStatus(f, tgt, move, lines);
        if (tgt.hp <= 0) lines.push(this.faint(tgt));
      } else {
        this.applyUtility(f, move, lines, isPlayer);
        this.applyStatus(f, tgt, move, lines); /* zero-pow status moves (WAR STORY, ROYAL DECREE) land their effect */
      }
      return lines;
    },
    applyStatus: function (user, tgt, move, lines) {
      var e = move.eff; if (!e) return;
      if (e.status && Math.random() < (e.chance || 1) && !tgt.fainted) {
        if (!(tgt.status === e.status)) { tgt.status = e.status; tgt.statusT = 3; sfx('status');
          lines.push(tgt.name + ' IS ' + e.status + '!'); }
      }
      if (e.debuffStat && !tgt.fainted) { tgt.stage[e.debuffStat] = Math.max(-6, (tgt.stage[e.debuffStat] || 0) - (e.debuffAmt || 1)); lines.push(tgt.name + "'S " + e.debuffStat + ' FELL.'); }
      if (e.selfStatus && Math.random() < (e.selfChance || 0)) { user.status = e.selfStatus; user.statusT = 3; lines.push(user.name + ' IS ' + e.selfStatus + ' (BACKFIRE)!'); }
    },
    applyUtility: function (f, move, lines, isPlayer) {
      var e = move.eff || {};
      var partyArr = isPlayer ? this.party : this.enemies;
      if (e.buffStat) { f.stage[e.buffStat] = Math.min(6, (f.stage[e.buffStat] || 0) + e.buffAmt); lines.push(f.name + "'S " + e.buffStat + ' ROSE!'); }
      if (e.evasion) { f.stage.EVA = Math.min(6, (f.stage.EVA || 0) + e.evasion); lines.push(f.name + ' BECAME EVASIVE!'); }
      if (e.counter) { f.counter = true; lines.push(f.name + ' BRACES FOR A COUNTER!'); }
      if (e.buffStatParty) { for (var i = 0; i < partyArr.length; i++) if (!partyArr[i].fainted) partyArr[i].stage[e.buffStatParty] = Math.min(6, (partyArr[i].stage[e.buffStatParty] || 0) + e.buffAmt); lines.push('THE PARTY IS FIRED UP!'); }
      if (e.evasionParty) { for (var j = 0; j < partyArr.length; j++) if (!partyArr[j].fainted) partyArr[j].stage.EVA = Math.min(6, (partyArr[j].stage.EVA || 0) + e.evasionParty); lines.push('THE PARTY GROWS SLIPPERY!'); }
      if (e.healFrac) { var tg = (move.tgt === 'ally') ? this.chooseHealTarget() : null;
        if (move.tgt === 'party') { for (var m = 0; m < partyArr.length; m++) { var t = partyArr[m]; if (!t.fainted) t.hp = Math.min(maxHPd(t), t.hp + Math.round(maxHPd(t) * e.healFrac)); } lines.push('THE PARTY RECOVERS!'); sfx('heal'); }
        else { if (tg) { tg.hp = Math.min(maxHPd(tg), tg.hp + Math.round(maxHPd(tg) * e.healFrac)); lines.push(tg.name + ' RECOVERS!'); sfx('heal'); } } }
      if (e.hot) { for (var h = 0; h < partyArr.length; h++) if (!partyArr[h].fainted) { partyArr[h].hotT = e.hot; partyArr[h].hotFrac = e.hotFrac; } lines.push('SOOTHING TEA FILLS THE AIR.'); sfx('heal'); }
      if (e.cure) { for (var c = 0; c < partyArr.length; c++) if (!partyArr[c].fainted) partyArr[c].status = null; lines.push('STATUS CLEANSED!'); }
      if (lines.length === 1) lines.push('...BUT NOTHING ELSE HAPPENED.');
    },
    chooseHealTarget: function () {
      var best = null, bestFrac = 2;
      for (var i = 0; i < this.party.length; i++) { var t = this.party[i]; if (t.fainted) continue; var fr = t.hp / maxHPd(t); if (fr < bestFrac) { bestFrac = fr; best = t; } }
      return best;
    },
    faint: function (f) {
      f.fainted = true; f.hp = 0; f.status = null; sfx('faint');
      if (f.isEnemy) { this.crowdSwing(this.active(), 20); return f.name + ' IS OUT! THE CROWD ROARS!'; }
      return f.name + ' HAS FAINTED!';
    },
    crowdSwing: function (user, amt) {
      var sign = user.isEnemy ? -1 : 1;
      this.crowd = Math.max(-100, Math.min(100, this.crowd + sign * amt));
      if (this.crowd >= 100 && !this.usedShow) this.showReady = true;
    },
    endRoundTick: function () {
      var lines = [];
      var all = this.party.concat(this.enemies);
      for (var i = 0; i < all.length; i++) {
        var f = all[i]; if (f.fainted) continue;
        if (f.status === 'MICFEEDBACK') { var d = Math.max(1, Math.round(maxHPd(f) * 0.06)); f.hp = Math.max(0, f.hp - d); lines.push(f.name + ' TAKES MIC FEEDBACK! -' + d); if (f.hp <= 0) lines.push(this.faint(f)); }
        if (f.hotT > 0) { var h = Math.round(maxHPd(f) * f.hotFrac); f.hp = Math.min(maxHPd(f), f.hp + h); f.hotT--; }
        if (f.statusT > 0 && f.status && f.status !== 'MICFEEDBACK' && f.status !== 'SHOOK') { f.statusT--; if (f.statusT <= 0 && f.status !== 'BORED') f.status = null; }
      }
      if (this.ai === 'snob2') {}
      /* snob2 gimmick: loses the crowd every turn */
      for (var j = 0; j < this.enemies.length; j++) if (this.enemies[j].ai === 'snob2' && !this.enemies[j].fainted) this.crowd = Math.min(100, this.crowd + 6);
      return lines.length ? lines : null;
    },
    /* ---------- event playback ---------- */
    pushMsg: function (t) { this.queue.push({ fn: function () { return t; } }); },
    doReveal: function () {
      var self = this;
      this.revealDone = true; this.revealPending = false;
      this.phase = 'paused';
      this.crowd = Math.min(100, this.crowd + 90); this.flash = 0.7; sfx('reveal');
      this.spec.reveal.fn(function () { setScene(self); self.phase = 'resolve'; self.runEvent(); });
    },
    runEvent: function () {
      if (this.checkEnd()) return;
      if (this.revealPending && !this.revealDone) { this.doReveal(); return; }
      if (this.qi >= this.queue.length) { this.afterRound(); return; }
      var ev = this.queue[this.qi];
      var out = ev.fn();
      if (out === null || out === undefined) { this.qi++; this.runEvent(); return; }
      if (out.anim) { this.anim = out.anim; this.phase = 'anim'; this.qi++; return; }
      this.msgLines = (typeof out === 'string') ? [out] : out;
      this.msgSub = 0; this.msg = this.msgLines[0]; this.autoMsgT = 0;
      this.qi++;
    },
    advance: function () {
      if (this.phase !== 'resolve') return;
      if (this.msgSub < this.msgLines.length - 1) { this.msgSub++; this.msg = this.msgLines[this.msgSub]; this.autoMsgT = 0; return; }
      if (this.checkEnd()) return;
      this.runEvent();
    },
    afterRound: function () {
      /* showstopper */
      if (this.showReady && !this.usedShow) {
        this.usedShow = true; this.showReady = false; this.flash = 0.6; sfx('showstopper');
        if (this.double) { /* the free encore goes to the first standing fielded daddy */
          for (var ss = 0; ss < this.field.length; ss++) { var sf = this.fieldFighter(ss); if (sf && !sf.fainted && sf.hp > 0) { this.setSlot(ss); break; } }
        }
        this.playerAction = { kind: 'move', move: this.bestPlayerMove(), onBeat: true, target: this.firstEnemyIdx() };
        this.queue = []; this.qi = 0;
        this.pushMsg('SHOWSTOPPER!! ' + this.active().name + ' GETS A FREE ENCORE!');
        this.buildActorEvents({ f: this.active(), isPlayer: true, slot: this.cmdSlot, act: this.playerAction });
        var self = this; this.queue.push({ fn: function () { return self.endRoundTick(); } });
        this.phase = 'resolve'; this.runEvent(); return;
      }
      if (this.checkEnd()) return;
      if (this.double) { this.afterFaintCheck(); return; }
      /* forced faint switch */
      if (this.active().fainted) {
        var idx = firstLivingIdx(this.party);
        if (idx < 0) { this.lose(); return; }
        this.phase = 'faintswitch'; this.switchIdx = idx; return;
      }
      this.toMenu();
    },
    /* doubles: refill or compact empty field slots after a round */
    afterFaintCheck: function () {
      for (var s = 0; s < this.field.length; s++) {
        var f = this.fieldFighter(s);
        if (!f || f.fainted || f.hp <= 0) {
          var bench = this.benchLiving();
          if (bench.length) { this.phase = 'faintswitch'; this.faintSlot = s; this.switchIdx = bench[0]; return; }
          this.field.splice(s, 1); s--;
        }
      }
      if (this.field.length === 0) { this.lose(); return; }
      this.toMenu();
    },
    bestPlayerMove: function () {
      var a = this.active(), best = a.moves[0], bp = -1;
      for (var i = 0; i < a.moves.length; i++) { var m = MOVES[a.moves[i]]; if (m.pow > bp) { bp = m.pow; best = a.moves[i]; } }
      return MOVES[best];
    },
    checkEnd: function () {
      if (this.phase === 'result') return true;
      if (this.livingEnemies().length === 0) { this.win(); return true; }
      if (firstLivingIdx(this.party) < 0) { this.lose(); return true; }
      return false;
    },
    /* ---------- items / flee ---------- */
    useItemFromBag: function (id) {
      var it = ITEMS[id], msg;
      if (it.kind === 'heal' || it.kind === 'cure') {
        var t = this.active();
        if (it.kind === 'heal') { if (t.hp >= maxHPd(t)) { sfx('cancel'); return; } t.hp = Math.min(maxHPd(t), t.hp + it.amt); }
        else { if (!t.status) { sfx('cancel'); return; } t.status = null; }
        takeItem(id); sfx('item');
        msg = t.name + (it.kind === 'heal' ? ' DRINKS ' + it.name + '!' : ' IS CURED!');
        if (this.double) { this.slotActions[this.cmdSlot] = { kind: 'item', id: id }; this.roundMsgs.push(msg); this.nextSlotOrRun(); return; }
        this.playerAction = { kind: 'item', id: id };
        this.pushAndRun(msg);
      } else if (it.kind === 'revive') {
        var fell = null; for (var i = 0; i < this.party.length; i++) if (this.party[i].fainted) { fell = this.party[i]; break; }
        if (!fell) { sfx('cancel'); return; }
        fell.fainted = false; fell.hp = Math.round(maxHPd(fell) * 0.5); takeItem(id); sfx('heal');
        msg = fell.name + ' IS BACK IN THE SPOTLIGHT!';
        if (this.double) { this.slotActions[this.cmdSlot] = { kind: 'item', id: id }; this.roundMsgs.push(msg); this.nextSlotOrRun(); return; }
        this.pushAndRun(msg);
      } else if (it.kind === 'flee') { takeItem(id); this.flee(); }
    },
    pushAndRun: function (msg) {
      /* item used = your turn; enemies still act */
      this.queue = []; this.qi = 0; this.pushMsg(msg);
      for (var i = 0; i < this.enemies.length; i++) { var e = this.enemies[i]; if (e.fainted) continue; this.buildActorEvents({ f: e, isPlayer: false, act: this.enemyChoose(e) }); }
      var self = this; this.queue.push({ fn: function () { return self.endRoundTick(); } });
      this.phase = 'resolve'; this.runEvent();
    },
    tryFlee: function () {
      /* fleeing is a whole-team call: any committed slot actions are dropped */
      if (this.double) { this.slotActions = [null, null]; this.roundMsgs = []; }
      if (this.spec.canFlee === false) { this.pushAndRun("THERE'S NO RUNNING FROM THIS ONE!"); return; }
      var pl = this.active(), en = this.livingEnemies()[0];
      var chance = 0.5 + (eff(pl, 'TEMPO') - eff(en, 'TEMPO')) * 0.03;
      if (Math.random() < Math.max(0.3, chance)) { sfx('item'); this.flee(); }
      else { sfx('cancel'); this.pushAndRun("COULDN'T GET AWAY!"); }
    },
    flee: function () { this.result = { win: false, fled: true }; this.phase = 'result'; this.resultT = 0; musicStop(); },
    /* ---------- win / lose ---------- */
    win: function () {
      musicStop(); jingle('win'); this.phase = 'result'; this.result = { win: true }; this.resultT = 0;
      /* xp + money */
      var totalXp = 0, totalMoney = 0;
      for (var i = 0; i < this.enemies.length; i++) { totalXp += this.enemies[i].xpYield || 0; totalMoney += this.enemies[i].moneyYield || 0; }
      Game.money += totalMoney;
      this.xpMsgs = [];
      var share = [];
      for (var p = 0; p < this.party.length; p++) if (!this.party[p].fainted) share.push(this.party[p]);
      if (share.length === 0) share = this.party;
      var each = Math.max(1, Math.round(totalXp / share.length));
      for (var s = 0; s < share.length; s++) this.grantXp(share[s], each);
      if (totalMoney) this.xpMsgs.unshift('GOT ' + totalMoney + ' SHILLINGS!');
    },
    grantXp: function (f, amt) {
      if (f.level >= 15) return;
      f.xp += amt; this.xpMsgs.push(f.name + ' GAINED ' + amt + ' XP.');
      while (f.level < 15 && f.xp >= xpNeed(f.level)) {
        f.xp -= xpNeed(f.level); this.levelUp(f);
      }
    },
    levelUp: function (f) {
      f.level++;
      var cls = f.cls;
      var oldMax = f.maxHP;
      f.maxHP = statAt(cls, 'HYPE', f.level);
      f.baseFLOW = statAt(cls, 'FLOW', f.level);
      f.basePOISE = statAt(cls, 'POISE', f.level);
      f.baseTEMPO = statAt(cls, 'TEMPO', f.level);
      f.hp += (f.maxHP - oldMax);
      this.xpMsgs.push(f.name + ' GREW TO LV ' + f.level + '!');
      if (cls.learn[f.level]) for (var i = 0; i < cls.learn[f.level].length; i++) {
        var mid = cls.learn[f.level][i];
        if (f.moves.indexOf(mid) < 0) {
          if (f.moves.length < 4) f.moves.push(mid);
          else { f.moves.shift(); f.moves.push(mid); }
          this.xpMsgs.push(f.name + ' LEARNED ' + MOVES[mid].name + '!');
        }
      }
    },
    lose: function () {
      musicStop(); jingle('lose'); this.phase = 'result'; this.result = { win: false, lost: true }; this.resultT = 0;
    },
    finish: function () {
      var r = this.result;
      if (r.win || r.fled) { var cb = this.onEnd; Battle = null; cb(r); return; }
      /* lost: revive + full-heal the party, then respawn at the last checkpoint.
         Any surrounding cutscene script is dropped; boss/trainer fights re-trigger
         on return because their flags only set on a win. */
      for (var i = 0; i < this.party.length; i++) { this.party[i].fainted = false; this.party[i].hp = maxHPd(this.party[i]); this.party[i].status = null; this.party[i].stage = { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 }; }
      Battle = null;
      respawnAtCheckpoint();
    },
    /* ---------- update / draw ---------- */
    update: function (dt) {
      this.animT += dt;
      if (this.superFX) { this.superFX.t += dt; if (this.superFX.t >= this.superFX.dur) this.superFX = null; }
      if (this.hitFlash > 0) this.hitFlash -= dt;
      if (this.shake > 0) this.shake -= dt;
      if (this.flash > 0) this.flash -= dt;
      if (this.phase === 'transition') { this.transT += dt; if (this.transT >= this.transDur) { this.phase = 'intro'; this.introT = 0; sfx('super'); } }
      if (this.phase === 'intro') { this.introT += dt; if (this.introT > (this.taunt ? 2.6 : 1.0)) this.toMenu(); }
      if (this.phase === 'aim') { this.aimT += dt; if (this.aimT >= this.aimDur) { this.commitPlayer(this.pendingMove, false); } }
      if (this.phase === 'anim') { /* self-advancing: QA gives no input here */
        if (this.anim) { this.anim.t += dt; if (this.anim.t >= this.anim.dur) { this.anim = null; this.phase = 'resolve'; this.runEvent(); } }
        else { this.phase = 'resolve'; this.runEvent(); }
      }
      if (this.phase === 'resolve') { this.autoMsgT += dt; if (this.autoMsgT > 2.4) this.advance(); }
      if (this.phase === 'result') { this.resultT += dt; }
      /* idle mannerism timers (only tick while waiting on player input) */
      var idling = this.phase === 'menu' || this.phase === 'move' || this.phase === 'aim' || this.phase === 'target';
      var cast = [];
      if (this.double) { for (var fs = 0; fs < this.field.length; fs++) cast.push(this.fieldFighter(fs)); }
      else cast.push(this.active());
      cast = cast.concat(this.livingEnemies());
      for (var ci = 0; ci < cast.length; ci++) {
        var cf = cast[ci]; if (!cf || cf.fainted) continue;
        if (cf._tic) { cf._tic.t += dt; if (cf._tic.t >= cf._tic.dur) cf._tic = null; }
        else if (idling) {
          if (cf._ticNext === undefined) cf._ticNext = 3 + Math.random() * 4;
          cf._ticNext -= dt;
          if (cf._ticNext <= 0) { cf._ticNext = 3 + Math.random() * 4; cf._tic = { kind: ticKindFor(cf), t: 0, dur: 1.2 }; }
        }
      }
      /* animate crowd bar smoothing */
      this._crowdShown = (this._crowdShown === undefined) ? this.crowd : this._crowdShown + (this.crowd - this._crowdShown) * 0.2;
    },
    /* on-screen rect for enemy i (AI art bottom-aligned to the platform) */
    enemyRect: function (i) {
      var e = this.enemies[i];
      var key = e ? e.spr : null;
      if (key === 'snob' && e.sprOpt && e.sprOpt.finalDraft) key = 'snob2';
      if (SPR_IMG_ALIAS[key]) key = SPR_IMG_ALIAS[key];
      var im = battleImg(key);
      var w = im ? im.w : 40, h = im ? im.h : 60;
      var x = im ? (178 + i * 28 - (w >> 1)) : 158 + i * 28;
      var y = im ? 84 - h : 20;
      return { x: x, y: y, w: w, h: h, cx: x + (w >> 1), cy: y + (h >> 1) };
    },
    /* on-screen rect for an ally back sprite (or SPR fallback); slot shifts the second daddy right */
    playerRect: function (slot) {
      slot = slot || 0;
      var a = (this.double && this.field[slot] !== undefined) ? this.fieldFighter(slot) : this.active();
      var ofs = slot * 52;
      var key = (a && a.id) ? a.id + '-back' : null;
      var im = key ? battleImg(key) : null;
      if (im) { var x = 6 + ofs + ((63 - im.w) >> 1); return { img: key, x: x, y: 58, w: im.w, h: im.h, cx: x + (im.w >> 1), cy: 58 + (im.h >> 1) }; }
      return { img: null, x: 26 + ofs, y: 78, w: 36, h: 48, cx: 44 + ofs, cy: 102 };
    },
    drawPlayerSprite: function (r, dx, dy, f) {
      var a = f || this.active(); if (!a) return;
      if (r.img) { drawImg(r.img, r.x + dx, r.y + dy); return; }
      if (SPR[a.spr]) SPR[a.spr](r.x + dx, r.y + dy, a.spr === 'samuel' ? { trueForm: hasFlag('trueform') } : undefined);
    },
    draw: function () {
      if (this.phase === 'transition') { this.drawTransition(); return; }
      var sh = this.shake > 0 ? ((Math.random() - 0.5) * 5) | 0 : 0;
      ctx.save(); ctx.translate(sh, 0);
      /* backdrop + era platforms */
      var bgn = this.spec.bg || 'stage';
      if (BGS[bgn]) BGS[bgn](); else cls(COL.night);
      bPlatforms(bgn);
      var anim = (this.phase === 'anim') ? this.anim : null;
      var pr = anim ? anim.t / anim.dur : 0;
      var lunge = (anim && anim.cat === 'hit') ? (pr < 0.5 ? pr * 2 : (1 - pr) * 2) * 8 : 0;
      var impact = anim && anim.cat === 'hit' && anim.t > anim.dur * 0.7;
      var blinkOff = impact && ((anim.t * 20 | 0) % 2 === 1);
      var jit = impact ? ((((anim.t * 30) | 0) % 2) ? 1 : -1) : 0;
      var prr = this.playerRect(0);
      var lungeTgt = (anim && this.double) ? this.playerRect(anim.tSlot || 0) : prr;
      var showTics = this.phase === 'menu' || this.phase === 'move' || this.phase === 'aim' || this.phase === 'target';
      /* enemy sprite(s) on the upper-right platform */
      for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i]; if (e.fainted) continue;
        var r = this.enemyRect(i);
        var dx = 0, dy = 0, skipE = false;
        if (anim && anim.actorIsEnemy && anim.eIdx === i) {
          if (anim.atEnemy && lunge > 0) { /* lunge toward the targeted daddy */
            var vx = lungeTgt.cx - r.cx, vy = lungeTgt.cy - r.cy, vl = Math.sqrt(vx * vx + vy * vy) || 1;
            dx += vx / vl * lunge; dy += vy / vl * lunge;
          }
        } else {
          if (anim && !anim.actorIsEnemy && anim.atEnemy && anim.tIdx === i) {
            if (blinkOff) skipE = true; dx += jit;
          }
          dy += Math.sin(this.animT * 2 + i + 1) > 0 ? 1 : 0; /* breathing bob */
        }
        if (!skipE && SPR[e.spr]) SPR[e.spr]((r.x + dx) | 0, (r.y + dy) | 0, e.sprOpt);
        if (showTics && e._tic) this.drawTic(e._tic, r.cx, r.y);
      }
      /* ally back sprite(s) on the lower-left platform */
      var slots = this.double ? this.field.length : 1;
      var a = this.active();
      for (var sl = 0; sl < slots; sl++) {
        var af = this.double ? this.fieldFighter(sl) : a;
        if (!af || (this.double && (af.fainted || af.hp <= 0))) continue;
        var arr = this.playerRect(sl);
        var pdx = 0, pdy = 0, skipP = false;
        if (anim && !anim.actorIsEnemy && (anim.pSlot || 0) === sl) {
          if (anim.atEnemy && lunge > 0) {
            var tr = this.enemyRect(anim.tIdx);
            var pvx = tr.cx - arr.cx, pvy = tr.cy - arr.cy, pvl = Math.sqrt(pvx * pvx + pvy * pvy) || 1;
            pdx += pvx / pvl * lunge; pdy += pvy / pvl * lunge;
          }
        } else {
          if (anim && anim.actorIsEnemy && anim.atEnemy && (anim.tSlot || 0) === sl) {
            if (blinkOff) skipP = true; pdx += jit;
          }
          pdy += Math.sin(this.animT * 2 + sl) > 0 ? 1 : 0; /* breathing bob */
        }
        if (!skipP) this.drawPlayerSprite(arr, pdx | 0, pdy | 0, af);
        if (showTics && af._tic) this.drawTic(af._tic, arr.cx, arr.y);
      }
      if (anim) this.drawAnimFX(anim, this.playerRect(anim.pSlot || 0));
      if (this.hitFlash > 0) { ctx.globalAlpha = 0.35; cls(COL.white); ctx.globalAlpha = 1; }
      if (this.flash > 0 && (this.animT * 20 | 0) % 2) { ctx.globalAlpha = 0.4; cls(COL.gold); ctx.globalAlpha = 1; }
      /* parchment HP boxes: everyone's stats stay visible in a double battle */
      if (this.double) {
        var eb = 0;
        for (var ei2 = 0; ei2 < this.enemies.length; ei2++) { if (this.enemies[ei2].fainted) continue; bHpBoxEnemyMini(this.enemies[ei2], 4, 14 + eb * 21); eb++; }
        var cmdPhase = this.phase === 'menu' || this.phase === 'move' || this.phase === 'target' || this.phase === 'aim' || this.phase === 'bag' || this.phase === 'switch';
        for (var as2 = 0; as2 < this.field.length; as2++) { var afb = this.fieldFighter(as2); if (afb) bHpBoxAllyMini(afb, 134, 68 + as2 * 22, cmdPhase && as2 === this.cmdSlot); }
      } else {
        var fe = this.enemies[Math.max(0, this.firstEnemyIdx())];
        if (fe) bHpBoxEnemy(fe, 8, 14);
        if (a) bHpBoxPlayer(a, 124, 74);
      }
      /* live audience strip (crowd meter) — swapped for a move banner mid-anim */
      if (anim) bBanner(anim.name, TYPECOL[anim.type] || '#f8f4e4');
      else bAudienceStrip(this._crowdShown || 0, this.crowd >= 100);
      ctx.restore();
      /* UI panels */
      if (this.phase === 'intro') {
        var en = this.enemies[Math.max(0, this.firstEnemyIdx())] || this.enemies[0];
        bTealBox(4, 112, 232, 46);
        bShadowText((en ? en.name : 'A FOE'), 12, 120, COL.gold);
        if (this.taunt) { var tl = wrap(this.taunt, 214); for (var ti = 0; ti < tl.length && ti < 2; ti++) bShadowText(tl[ti], 12, 132 + ti * 12); }
        else bShadowText('WANTS TO BATTLE!', 12, 134);
        if (Math.floor(performance.now() / 400) % 2) bShadowText('>', 224, 148);
      }
      else if (this.phase === 'menu') this.drawMenu();
      else if (this.phase === 'move') this.drawMoves();
      else if (this.phase === 'target') this.drawTargetPrompt();
      else if (this.phase === 'switch' || this.phase === 'faintswitch') this.drawSwitch();
      else if (this.phase === 'bag') this.drawBag();
      else if (this.phase === 'aim') this.drawAim();
      else if (this.phase === 'resolve') this.drawMsg();
      else if (this.phase === 'result') this.drawResult();
      /* boss SUPER animation overlays everything */
      if (this.superFX) this.drawSuperFX();
    },
    /* per-type attack/heal/buff/status overlays during the 'anim' phase */
    drawAnimFX: function (anim, prr) {
      var p = anim.t / anim.dur, k;
      var atk, tgt;
      if (anim.actorIsEnemy) { atk = this.enemyRect(anim.eIdx); tgt = anim.atEnemy ? this.playerRect(anim.tSlot || 0) : atk; }
      else { atk = prr; tgt = anim.atEnemy ? this.enemyRect(anim.tIdx) : atk; }
      if (anim.cat === 'hit') {
        var glyph = FX_GLYPH[anim.type] || 'fx-burst';
        for (k = 0; k < 3; k++) { /* projectile glyphs arc along the path */
          var f = p / 0.7 - k * 0.14;
          if (f <= 0 || f >= 1) continue;
          var gx = atk.cx + (tgt.cx - atk.cx) * f, gy = atk.cy + (tgt.cy - atk.cy) * f - Math.sin(f * 3.14) * 12;
          drawImg(glyph, (gx - 7) | 0, (gy - 8) | 0);
        }
        if (p >= 0.7) drawImg('fx-burst', (tgt.cx - 12) | 0, (tgt.cy - 14) | 0);
      } else if (anim.cat === 'buff') {
        for (k = 0; k < 3; k++) { /* rising chevrons over the user */
          var by = atk.y + atk.h - 14 - p * 26 - k * 9;
          if (by > atk.y - 14) drawImg('fx-chevron', (atk.cx - 20 + k * 14) | 0, by | 0);
        }
      } else if (anim.cat === 'heal') {
        ctx.globalAlpha = 0.3 * (1 - p);
        px(atk.x, atk.y, atk.w, atk.h, '#48c848');
        ctx.globalAlpha = 1;
        drawImg('fx-note', (atk.cx - 7 + Math.sin(p * 8) * 4) | 0, (atk.y - 10 - p * 10) | 0);
      } else { /* status: sweat drop over the target */
        drawImg('fx-sweat', (tgt.cx + 8) | 0, (tgt.y - 6 + Math.sin(p * 9) * 2) | 0);
      }
    },
    /* idle mannerism overlay anchored to a battler's head */
    drawTic: function (tic, hx, hy) {
      var t = tic.t / tic.dur, k = tic.kind, i;
      if (k === 'note') drawImg('fx-note', hx + 6, hy - 8 - t * 8);
      else if (k === 'zzz') { for (i = 0; i < 3; i++) if (t > i * 0.25) drawImg('fx-zzz', hx + 8 + i * 8, hy - 4 - i * 9 - t * 4); }
      else if (k === 'sparkle') drawImg('fx-star', hx - 16 + t * 32, hy + 2 + Math.sin(t * 6.3) * 3);
      else if (k === 'spark') { drawImg('fx-glyph', hx + 8, hy - 8 - t * 6); drawImg('fx-sweat', hx - 12, hy + 2); }
      else if (k === 'point') { drawImg('fx-note', hx + 4, hy - 8 - t * 6); drawImg('fx-star', hx + 14, hy - 16); }
      else if (k === 'sweat') drawImg('fx-sweat', hx + 8, hy - 2 + t * 4);
      else if (k === 'ember') drawImg('fx-ember', hx + 6, hy - 10 - t * 8);
      else if (k === 'star') drawImg('fx-star', hx + 6, hy - 10 - t * 6);
      else if (k === 'glyph') drawImg('fx-glyph', hx + 6, hy - 10 - t * 6);
      else if (k === 'heart') drawImg('fx-heart', hx + 6, hy - 10 - t * 6);
    },
    drawSuperFX: function () {
      var s = this.superFX, p = s.t / s.dur; /* 0..1 */
      var i, k;
      /* colored flash, brightest at the start */
      ctx.globalAlpha = 0.6 * (1 - p);
      cls(s.color); ctx.globalAlpha = 1;
      /* type-flavored particles */
      if (s.kind === 'finalword') {                       /* Snobbington: black redaction bars + scribbles */
        for (i = 0; i < 6; i++) { var by = ((s.t * 260 + i * 34) % 190) | 0; px(0, by, 240, 6, COL.black); }
        for (i = 0; i < 10; i++) { var rx = (i * 53 + (s.t * 40 | 0)) % 236; px(rx, 30 + (i * 13) % 100, 18, 3, '#c63a46'); }
      } else if (s.kind === 'flex') {                     /* Maximvs: expanding gold rings */
        for (i = 0; i < 4; i++) { var sz = ((p * 260 + i * 55) % 240) | 0, cx = 120, cy = 80;
          px(cx - sz / 2, cy - sz / 2, sz, 2, COL.gold); px(cx - sz / 2, cy + sz / 2, sz, 2, COL.gold);
          px(cx - sz / 2, cy - sz / 2, 2, sz, COL.gold); px(cx + sz / 2, cy - sz / 2, 2, sz, COL.gold); }
      } else if (s.kind === 'roast') {                    /* Jake: rising embers */
        for (i = 0; i < 26; i++) { var ex = (i * 37) % 240, ey = 160 - ((s.t * 200 + i * 43) % 170); px(ex, ey, 3, 3, i % 2 ? COL.gold : COL.red); }
      } else if (s.kind === 'heart') {                    /* Rex / Pedro: floating hearts */
        for (i = 0; i < 16; i++) { var hx = (i * 61) % 232, hy = 150 - ((s.t * 150 + i * 51) % 150);
          px(hx, hy + 1, 6, 4, COL.pink); px(hx + 1, hy, 2, 2, COL.pink); px(hx + 4, hy, 2, 2, COL.pink); px(hx + 2, hy + 5, 2, 2, COL.pink); }
      }
      /* the move name, big and shaking */
      var jx = ((Math.random() - 0.5) * 6) | 0;
      centerTextO(s.name, 66 + (((s.t * 20) | 0) % 2), COL.white, COL.black, 2);
      if (p < 0.5) centerTextO('!!', 92, s.color, COL.black, 2);
    },
    drawTransition: function () {
      var t = this.transT, dur = this.transDur, p = t / dur, i;
      if (p < 0.32) {                                 /* spinning spoke burst (softer flash) */
        var q0 = p / 0.32, on = ((t * 14) | 0) % 2;
        cls(on ? '#3a2a5a' : '#1a1030');
        var n = 18, len = q0 * 380, rot = t * 5;
        for (i = 0; i < n; i++) { var a = (i / n) * 6.2832 + rot; var c0 = [COL.gold, COL.pink, COL.teal, COL.purple][i % 4];
          px((120 + Math.cos(a) * len) | 0, (80 + Math.sin(a) * len) | 0, 5, 5, c0); }
        centerTextO('!', 62, COL.white, COL.black, 3);
      } else if (p < 0.72) {                           /* colored bands sweep in from both sides */
        cls('#1a1030');
        var q = (p - 0.32) / 0.40;
        for (var b = 0; b < 12; b++) { var c = [COL.pink, COL.gold, COL.teal, COL.purple][b % 4]; var w = (240 * q) | 0; px((b % 2) ? 0 : 240 - w, b * 14, w, 14, c); }
        centerTextO('VS!', 62, COL.white, COL.black, 3);
      } else {                                         /* battlers slide onto their platforms */
        var q2 = (p - 0.72) / 0.28;
        var bgn = this.spec.bg || 'stage';
        if (BGS[bgn]) BGS[bgn](); else cls(COL.night);
        var slide = ((1 - Math.min(1, q2 * 1.25)) * 130) | 0;
        bPlatforms(bgn, slide, -slide);
        for (var ei = 0; ei < this.enemies.length; ei++) {
          var er = this.enemyRect(ei), ene = this.enemies[ei];
          if (SPR[ene.spr]) SPR[ene.spr](er.x + slide, er.y, ene.sprOpt);
        }
        if (this.double) {
          for (var ps = 0; ps < this.field.length; ps++) { var pf = this.fieldFighter(ps);
            if (pf && !pf.fainted) this.drawPlayerSprite(this.playerRect(ps), -slide, 0, pf); }
        } else this.drawPlayerSprite(this.playerRect(0), -slide, 0);
        if (slide <= 0) {                              /* HP boxes pop at the end */
          if (this.double) {
            var teb = 0;
            for (var te = 0; te < this.enemies.length; te++) { if (this.enemies[te].fainted) continue; bHpBoxEnemyMini(this.enemies[te], 4, 14 + teb * 21); teb++; }
            for (var ta = 0; ta < this.field.length; ta++) { var taf = this.fieldFighter(ta); if (taf) bHpBoxAllyMini(taf, 134, 68 + ta * 22, false); }
          } else {
            var fe2 = this.enemies[Math.max(0, this.firstEnemyIdx())];
            if (fe2) bHpBoxEnemy(fe2, 8, 14);
            var a2 = this.active(); if (a2) bHpBoxPlayer(a2, 124, 74);
          }
        } else centerTextO('VS!', 20, COL.white, COL.black, 2);
      }
    },
    drawMenu: function () {
      var a = this.active();
      bTealBox(4, 112, 130, 46);
      bShadowText('WHAT WILL', 12, 122);
      bShadowText(a.name + ' DO?', 12, 136);
      bWhitePanel(134, 112, 102, 46);
      var labels = ['FIGHT', 'SWAG', 'SWITCH', 'FLEE'];
      for (var i = 0; i < 4; i++) {
        var cxp = 152 + (i % 2) * 46, cyp = 122 + ((i / 2) | 0) * 16;
        drawText(labels[i], cxp, cyp, '#3a3a44');
        if (i === this.menuIdx) drawText('>', cxp - 8, cyp, '#e84848');
      }
      if (this.showReady) { centerTextO('SHOWSTOPPER READY!', 102, COL.gold, COL.black); }
    },
    drawMoves: function () {
      var mv = this.active().moves;
      bWhitePanel(4, 112, 148, 46);
      for (var i = 0; i < mv.length; i++) { var m = MOVES[mv[i]];
        var xx = 22 + (i % 2) * 66, yy = 122 + ((i / 2) | 0) * 16;
        drawText(m.name.substr(0, 10), xx, yy, '#3a3a44');
        if (i === this.moveIdx) drawText('>', xx - 8, yy, '#e84848'); }
      var sel = MOVES[mv[this.moveIdx]];
      bWhitePanel(152, 112, 84, 46);
      drawText('CROWD ' + ((sel.crowd || 0) >= 0 ? '+' : '') + (sel.crowd || 0), 158, 119, '#3a3a44');
      drawText(sel.pow ? 'PWR ' + sel.pow : 'STATUS', 158, 129, '#3a3a44');
      drawText('TYPE/', 158, 141, '#3a3a44');
      px(188, 138, 44, 11, TYPECOL[sel.type] || COL.stone);
      drawText(sel.type.substr(0, 4), 192, 140, COL.white);
    },
    drawTargetPrompt: function () {
      bTealBox(4, 112, 232, 46);
      bShadowText('CHOOSE A TARGET (A)', 12, 128);
      var t = this.enemies[this.targetIdx];
      if (t) { var r = this.enemyRect(this.targetIdx); drawTextO('v', r.cx - 2, 14, COL.red, COL.black); }
    },
    drawSwitch: function () {
      bParchPanel(6, 96, 228, 60);
      centerText(this.phase === 'faintswitch' ? 'CHOOSE WHO STEPS UP' : 'SWITCH TO WHO?', 100, '#4a4438');
      for (var i = 0; i < this.party.length; i++) { var f = this.party[i];
        var yy = 112 + i * 11;
        var col = f.fainted ? COL.stone : '#4a4438';
        var fielded = this.double ? this.field.indexOf(i) >= 0 : i === this.activeIdx;
        drawText(f.name + '  LV' + f.level + '  HP ' + f.hp + '/' + maxHPd(f) + (fielded ? ' *' : ''), 20, yy, col);
        if (i === this.switchIdx) drawText('>', 10, yy, '#e84848'); }
    },
    drawBag: function () {
      bParchPanel(6, 96, 228, 60);
      centerText('SWAG POUCH', 100, '#4a4438');
      if (this.bagList.length === 0) { centerText('EMPTY.', 124, COL.stone); return; }
      for (var i = 0; i < this.bagList.length && i < 4; i++) { var id = this.bagList[i];
        var yy = 112 + i * 11; drawText(ITEMS[id].name + ' x' + Game.items[id], 20, yy, '#4a4438');
        if (i === this.itemIdx) drawText('>', 10, yy, '#e84848'); }
      drawText(ITEMS[this.bagList[this.itemIdx]].desc, 12, 146, '#8a7f68');
    },
    drawAim: function () {
      bTealBox(4, 112, 232, 46);
      bShadowCenter('PRESS A ON THE BEAT!', 118);
      var bx = 30, bw = 180, by = 134;
      px(bx - 1, by - 1, bw + 2, 10, '#1e3d42');
      px(bx, by, bw, 8, '#2e333e');
      var zone = bx + bw * 0.7;
      px(zone - 8, by, 16, 8, COL.gold);
      var p = this.aimT / this.aimDur;
      px(bx + bw * p - 1, by - 2, 3, 12, COL.pink);
      bShadowCenter('(OPTIONAL)', 147, '#9fc2c6');
    },
    drawMsg: function () {
      bTealBox(4, 112, 232, 46);
      var lines = wrap(this.msg || '', 214);
      for (var i = 0; i < lines.length && i < 2; i++) bShadowText(lines[i], 12, 122 + i * 14);
      if (Math.floor(performance.now() / 400) % 2) bShadowText('>', 224, 148);
    },
    drawResult: function () {
      bParchPanel(20, 40, 200, 80);
      if (this.result.win) {
        centerText('VICTORY!', 50, '#c63a46', 2);
        for (var i = 0; i < this.xpMsgs.length && i < 5; i++) centerText(this.xpMsgs[i], 68 + i * 9, '#4a4438');
      } else if (this.result.fled) { centerText('GOT AWAY SAFELY!', 74, '#4a4438'); }
      else { centerText('THE CROWD BOOS...', 60, '#4a4438'); centerText('BUT THE SHOW GOES ON.', 74, '#4a4438'); centerText('(FULL HEAL — TRY AGAIN)', 90, COL.stone); }
      if (Math.floor(performance.now() / 400) % 2) centerText('PRESS A', 106, '#c63a46');
    }
  };
  if (B.double) {
    B.field = [];
    for (var fi = 0; fi < B.party.length && B.field.length < 2; fi++)
      if (!B.party[fi].fainted && B.party[fi].hp > 0) B.field.push(fi);
    B.activeIdx = B.field[0];
  }
  B.phase = 'transition';
  return B;
}
