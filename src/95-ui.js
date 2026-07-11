/* 95-ui.js — save/load (localStorage + in-memory fallback), party & bag field screens. */

var SAVE_KEY = 'dd_bars_through_time_v2';
var _memSave = null; /* in-memory fallback for sandboxed iframes */

function serializeGame() {
  var party = [];
  for (var i = 0; i < Game.party.length; i++) { var f = Game.party[i];
    party.push({ id: f.id, level: f.level, xp: f.xp, hp: f.hp, maxHP: f.maxHP,
      baseFLOW: f.baseFLOW, basePOISE: f.basePOISE, baseTEMPO: f.baseTEMPO,
      moves: f.moves.slice(), drip: f.drip, fainted: f.fainted, status: null }); }
  return JSON.stringify({
    v: 2, party: party, activeIdx: Game.activeIdx, flags: Game.flags, items: Game.items,
    drip: Game.drip, money: Game.money, mustaches: Game.mustaches, parts: Game.parts,
    map: Game.map, px: Game.px, py: Game.py, dir: Game.dir, checkpoint: Game.checkpoint, playtime: Game.playtime
  });
}
function saveGame(loud) {
  var data = serializeGame();
  try { localStorage.setItem(SAVE_KEY, data); } catch (e) { _memSave = data; }
  _memSave = data;
  if (loud) sfx('save');
}
function hasSave() {
  try { if (localStorage.getItem(SAVE_KEY)) return true; } catch (e) {}
  return !!_memSave;
}
function loadGame() {
  var data = null;
  try { data = localStorage.getItem(SAVE_KEY); } catch (e) {}
  if (!data) data = _memSave;
  if (!data) return false;
  var o;
  try { o = JSON.parse(data); } catch (e) { return false; }
  Game.party = [];
  for (var i = 0; i < o.party.length; i++) {
    var s = o.party[i], f = makeFighter(s.id, s.level);
    f.xp = s.xp; f.hp = s.hp; f.maxHP = s.maxHP || f.maxHP;
    f.baseFLOW = s.baseFLOW || f.baseFLOW; f.basePOISE = s.basePOISE || f.basePOISE; f.baseTEMPO = s.baseTEMPO || f.baseTEMPO;
    f.moves = s.moves && s.moves.length ? s.moves.slice() : f.moves; f.drip = s.drip || null; f.fainted = !!s.fainted;
    Game.party.push(f);
  }
  Game.activeIdx = o.activeIdx || 0; Game.flags = o.flags || {}; Game.items = o.items || {};
  Game.drip = o.drip || {}; Game.money = o.money || 0; Game.mustaches = o.mustaches || 0; Game.parts = o.parts || 0;
  Game.map = o.map || 'manor'; Game.px = o.px; Game.py = o.py; Game.dir = o.dir || 'down';
  Game.checkpoint = o.checkpoint || { map: Game.map, px: Game.px, py: Game.py, dir: Game.dir };
  Game.playtime = o.playtime || 0; Game.started = true;
  return true;
}
function deleteSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} _memSave = null; }

/* ---------- party field screen ---------- */
function makePartyScreen(back) {
  return {
    idx: 0, mode: 'list', dripIdx: 0,
    enter: function () {},
    onPress: function (k) {
      if (this.mode === 'drip') return this.dripInput(k);
      if (k === 'up') { this.idx = (this.idx + Game.party.length - 1) % Game.party.length; sfx('cursor'); }
      else if (k === 'down') { this.idx = (this.idx + 1) % Game.party.length; sfx('cursor'); }
      else if (k === 'b' || k === 'start') { sfx('cancel'); setScene(back); }
      else if (k === 'a') { sfx('select'); this.mode = 'drip'; this.dripIdx = 0; this.dripList = this.buildDrip(); }
    },
    buildDrip: function () { /* owned drip tracked in Game.items with key drip:<id> */
      var owned = ['(NONE)']; for (var k in Game.items) { if (k.indexOf('drip:') === 0 && Game.items[k] > 0) owned.push(k.slice(5)); }
      return owned; },
    dripInput: function (k) {
      if (k === 'up') { this.dripIdx = (this.dripIdx + this.dripList.length - 1) % this.dripList.length; sfx('cursor'); }
      else if (k === 'down') { this.dripIdx = (this.dripIdx + 1) % this.dripList.length; sfx('cursor'); }
      else if (k === 'b') { this.mode = 'list'; sfx('cancel'); }
      else if (k === 'a') { var sel = this.dripList[this.dripIdx]; var f = Game.party[this.idx];
        f.drip = (sel === '(NONE)') ? null : sel; sfx('item'); this.mode = 'list'; }
    },
    update: function () {},
    draw: function () {
      cls(COL.night);
      centerText('THE DADDIES', 8, COL.gold);
      for (var i = 0; i < Game.party.length; i++) { var f = Game.party[i];
        var yy = 24 + i * 30;
        panel(10, yy, 220, 28, i === this.idx ? COL.cream : '#d8d0c0', COL.black);
        drawMiniPortrait(SPR[f.spr], f.spr === 'samuel' ? { trueForm: hasFlag('trueform') } : undefined, 12, yy - 20, 0.5);
        drawText(f.name, 44, yy + 3, COL.black);
        drawText('LV ' + f.level, 150, yy + 3, COL.black);
        bar(44, yy + 13, 100, 6, f.hp / maxHPd(f), COL.grass);
        drawText('HP ' + f.hp + '/' + maxHPd(f), 44, yy + 20, COL.black);
        if (f.drip && DRIP[f.drip]) drawText(DRIP[f.drip].name, 150, yy + 15, COL.purple);
      }
      if (this.mode === 'drip') {
        panel(60, 40, 120, 80, COL.cream, COL.gold);
        centerText('EQUIP DRIP', 46, COL.black);
        for (var d = 0; d < this.dripList.length && d < 6; d++) { var id = this.dripList[d];
          var nm = id === '(NONE)' ? id : (DRIP[id] ? DRIP[id].name : id);
          drawText(nm, 74, 58 + d * 10, COL.black); if (d === this.dripIdx) drawText('>', 64, 58 + d * 10, COL.red); }
      } else centerText('A: DRIP   B: BACK', 150, COL.stone);
    }
  };
}
function objHas(o, k) { return o && o[k]; }

/* ---------- bag field screen: browse swag, pick a Daddy, apply it ----------
   Consumables (tea, lozenges, spare mustaches) are USED on a chosen member;
   DRIP gear (hats, chains, goggles) is EQUIPPED on a chosen member for
   permanent stat bonuses (HYPE = max HP, FLOW = attack, etc.). */
function makeBagScreen(back) {
  return {
    idx: 0, top: 0, mode: 'list', whoIdx: 0, msg: '', msgT: 0,
    build: function () {
      var a = [], k;
      for (k in Game.items) { if (k.indexOf('drip:') === 0) continue; if (Game.items[k] > 0 && ITEMS[k]) a.push(k); }
      for (k in Game.items) { if (k.indexOf('drip:') === 0 && Game.items[k] > 0 && DRIP[k.slice(5)]) a.push(k); }
      return a;
    },
    def: function (id) { return id.indexOf('drip:') === 0 ? DRIP[id.slice(5)] : ITEMS[id]; },
    toast: function (m) { this.msg = m; this.msgT = 1.6; },
    onPress: function (k) {
      if (this.mode === 'who') return this.whoInput(k);
      var list = this.build();
      if (k === 'up') { this.idx = (this.idx + list.length - 1) % Math.max(1, list.length); sfx('cursor'); }
      else if (k === 'down') { this.idx = (this.idx + 1) % Math.max(1, list.length); sfx('cursor'); }
      else if (k === 'b' || k === 'start') { sfx('cancel'); setScene(back); }
      else if (k === 'a' && list.length) {
        var it = ITEMS[list[this.idx]];
        if (it && it.kind === 'flee') { this.toast('ONLY USEFUL MID-BATTLE.'); sfx('cancel'); return; }
        sfx('select'); this.mode = 'who'; this.whoIdx = 0;
      }
    },
    whoInput: function (k) {
      if (k === 'up') { this.whoIdx = (this.whoIdx + Game.party.length - 1) % Game.party.length; sfx('cursor'); }
      else if (k === 'down') { this.whoIdx = (this.whoIdx + 1) % Game.party.length; sfx('cursor'); }
      else if (k === 'b' || k === 'start') { this.mode = 'list'; sfx('cancel'); }
      else if (k === 'a') { this.apply(Game.party[this.whoIdx]); }
    },
    apply: function (f) {
      var list = this.build(), id = list[this.idx];
      if (!id || !f) { this.mode = 'list'; return; }
      if (id.indexOf('drip:') === 0) {
        var d = id.slice(5);
        if (f.drip === d) { f.drip = null; this.toast(f.name + ' TAKES OFF THE ' + DRIP[d].name + '.'); }
        else { f.drip = d; this.toast(f.name + ' DONS THE ' + DRIP[d].name + '!'); }
        sfx('item'); this.mode = 'list'; return;
      }
      var it = ITEMS[id];
      if (it.kind === 'heal') {
        if (f.fainted) { this.toast(f.name + ' NEEDS A SPARE MUSTACHE.'); sfx('cancel'); return; }
        if (f.hp >= maxHPd(f)) { this.toast(f.name + ' IS ALREADY FULL OF HYPE.'); sfx('cancel'); return; }
        var heal = Math.min(it.amt, maxHPd(f) - f.hp);
        f.hp += heal; takeItem(id); sfx('heal'); this.toast(f.name + ' RECOVERED ' + heal + ' HYPE!');
      } else if (it.kind === 'cure') {
        if (!f.status) { this.toast(f.name + ' HAS NOTHING TO CURE.'); sfx('cancel'); return; }
        f.status = null; takeItem(id); sfx('item'); this.toast(f.name + ' FEELS COMPOSED AGAIN.');
      } else if (it.kind === 'revive') {
        if (!f.fainted) { this.toast(f.name + ' IS STILL STANDING.'); sfx('cancel'); return; }
        f.fainted = false; f.hp = Math.round(maxHPd(f) * 0.5); takeItem(id); sfx('heal'); this.toast(f.name + ' IS BACK IN THE CYPHER!');
      } else { this.toast('NO USE FOR THAT HERE.'); sfx('cancel'); return; }
      if (itemCount(id) <= 0) this.mode = 'list';
    },
    update: function () { if (this.msgT > 0) this.msgT -= 1 / 60; },
    draw: function () {
      cls(COL.night); centerText('SWAG POUCH', 8, COL.gold);
      var list = this.build();
      if (this.idx >= list.length) this.idx = Math.max(0, list.length - 1);
      /* keep the cursor inside an 8-row window (drip can overflow one screen) */
      var ROWS = 8;
      if (this.idx < this.top) this.top = this.idx;
      if (this.idx >= this.top + ROWS) this.top = this.idx - ROWS + 1;
      drawText('SHILLINGS: ' + Game.money, 12, 20, COL.white);
      if (list.length === 0) centerText('NOTHING BUT LINT.', 80, COL.stone);
      for (var i = this.top; i < list.length && i < this.top + ROWS; i++) {
        var id = list[i], d = this.def(id), isDrip = id.indexOf('drip:') === 0;
        var yy = 32 + (i - this.top) * 12;
        drawText(d.name + (isDrip ? '' : '  x' + Game.items[id]), 24, yy, i === this.idx ? COL.gold : (isDrip ? COL.pink : COL.white));
        if (i === this.idx) drawText('>', 14, yy, COL.red);
      }
      if (this.top > 0) drawText('^', 226, 32, COL.stone);
      if (this.top + ROWS < list.length) drawText('v', 226, 32 + (ROWS - 1) * 12, COL.stone);
      if (list.length) { panel(6, 132, 228, 16, COL.cream); drawText(this.def(list[this.idx]).desc, 12, 137, COL.black); }
      centerText(this.mode === 'who' ? 'A: APPLY   B: BACK' : (list.length ? 'A: USE/EQUIP   B: BACK' : 'B: BACK'), 152, COL.stone);
      if (this.mode === 'who') this.drawWho(list);
      if (this.msgT > 0) { panel(30, 66, 180, 20, COL.cream, COL.gold); centerText(this.msg, 73, COL.black); }
    },
    drawWho: function (list) {
      var id = list[this.idx], isDrip = id && id.indexOf('drip:') === 0;
      var n = Game.party.length;
      panel(16, 30, 208, n * 22 + 18, COL.cream, COL.gold);
      centerText(isDrip ? 'WHO WEARS IT?' : 'USE ON WHO?', 36, COL.black);
      for (var i = 0; i < n; i++) { var f = Game.party[i], yy = 48 + i * 22;
        drawText(f.name, 34, yy, f.fainted ? COL.red : COL.black);
        drawText('LV ' + f.level, 108, yy, COL.black);
        if (f.drip && DRIP[f.drip]) drawText(DRIP[f.drip].name, 140, yy, COL.purple);
        bar(34, yy + 9, 70, 4, f.hp / maxHPd(f), COL.grass);
        drawText(f.fainted ? 'OUT COLD' : 'HP ' + f.hp + '/' + maxHPd(f), 108, yy + 8, COL.black);
        if (i === this.whoIdx) drawText('>', 24, yy, COL.red);
      }
    }
  };
}
/* ---------- shop screen ---------- */
function makeShop(inv, back, title) {
  return {
    idx: 0, msg: '', msgT: 0, title: title || "BABBAGE'S CART",
    onPress: function (k) {
      if (k === 'up') { this.idx = (this.idx + inv.length - 1) % inv.length; sfx('cursor'); }
      else if (k === 'down') { this.idx = (this.idx + 1) % inv.length; sfx('cursor'); }
      else if (k === 'b' || k === 'start') { sfx('cancel'); setScene(back); }
      else if (k === 'a') { this.buy(inv[this.idx]); }
    },
    buy: function (id) {
      var isDrip = id.indexOf('drip:') === 0;
      var def = isDrip ? DRIP[id.slice(5)] : ITEMS[id];
      var price = isDrip ? (def.price || 60) : def.price;
      if (Game.money < price) { this.msg = 'NOT ENOUGH SHILLINGS.'; this.msgT = 1.4; sfx('cancel'); return; }
      Game.money -= price; giveItem(id, 1); sfx('item');
      this.msg = 'BOUGHT ' + def.name + '!'; this.msgT = 1.4;
    },
    update: function () { if (this.msgT > 0) this.msgT -= 1 / 60; },
    draw: function () {
      cls(COL.night);
      centerText(this.title, 8, COL.gold);
      drawText('SHILLINGS: ' + Game.money, 12, 20, COL.white);
      for (var i = 0; i < inv.length; i++) { var id = inv[i];
        var isDrip = id.indexOf('drip:') === 0, def = isDrip ? DRIP[id.slice(5)] : ITEMS[id];
        var price = isDrip ? (def.price || 60) : def.price;
        var yy = 34 + i * 12;
        drawText(def.name, 24, yy, i === this.idx ? COL.gold : COL.white);
        drawText(price + 'S', 176, yy, i === this.idx ? COL.gold : COL.white);
        if (i === this.idx) drawText('>', 14, yy, COL.red); }
      var sel = inv[this.idx], sd = sel.indexOf('drip:') === 0 ? DRIP[sel.slice(5)] : ITEMS[sel];
      panel(6, 132, 228, 16, COL.cream); drawText(sd.desc, 12, 137, COL.black);
      if (this.msgT > 0) { panel(50, 70, 140, 20, COL.cream, COL.gold); centerText(this.msg, 77, COL.black); }
      else centerText('A: BUY   B: LEAVE', 152, COL.stone);
    }
  };
}
DRIP.dapperhat.price = 45; DRIP.goldchain.price = 45; DRIP.swiftcane.price = 45; DRIP.heartlocket.price = 50;
DRIP.laurelband.price = 70; DRIP.discogoggle.price = 80;

/* heal whole party (phonograph / teapot save points) */
function healParty() { for (var i = 0; i < Game.party.length; i++) { var f = Game.party[i]; f.fainted = false; f.hp = maxHPd(f); f.status = null; f.stage = { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 }; } }
function giveDrip(id) { giveItem('drip:' + id, 1); }
