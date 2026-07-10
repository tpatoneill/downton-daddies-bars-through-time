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
    map: Game.map, px: Game.px, py: Game.py, dir: Game.dir, playtime: Game.playtime
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

/* ---------- bag field screen ---------- */
function makeBagScreen(back) {
  return {
    idx: 0,
    onPress: function (k) {
      var list = this.build();
      if (k === 'up') { this.idx = (this.idx + list.length - 1) % Math.max(1, list.length); sfx('cursor'); }
      else if (k === 'down') { this.idx = (this.idx + 1) % Math.max(1, list.length); sfx('cursor'); }
      else if (k === 'b' || k === 'start') { sfx('cancel'); setScene(back); }
      else if (k === 'a') { sfx('select'); this.useField(list[this.idx]); }
    },
    build: function () { var a = []; for (var id in Game.items) { if (id.indexOf('drip:') === 0) continue; if (Game.items[id] > 0 && ITEMS[id]) a.push(id); } return a; },
    useField: function (id) {
      if (!id) return; var it = ITEMS[id];
      if (it && it.kind === 'heal') { var f = firstDamaged(); if (f) { f.hp = Math.min(maxHPd(f), f.hp + it.amt); takeItem(id); sfx('heal'); } }
      else if (it && it.kind === 'cure') { var g = firstStatus(); if (g) { g.status = null; takeItem(id); sfx('item'); } }
      else if (it && it.kind === 'revive') { var d = firstFainted(); if (d) { d.fainted = false; d.hp = Math.round(maxHPd(d) * 0.5); takeItem(id); sfx('heal'); } }
    },
    update: function () {},
    draw: function () {
      cls(COL.night); centerText('SWAG POUCH', 8, COL.gold);
      var list = this.build();
      drawText('SHILLINGS: ' + Game.money, 12, 20, COL.white);
      if (list.length === 0) centerText('NOTHING BUT LINT.', 80, COL.stone);
      for (var i = 0; i < list.length; i++) { var id = list[i];
        var yy = 32 + i * 12; drawText(ITEMS[id].name + '  x' + Game.items[id], 24, yy, i === this.idx ? COL.gold : COL.white);
        if (i === this.idx) drawText('>', 14, yy, COL.red); }
      if (list.length) { panel(6, 138, 228, 16, COL.cream); drawText(ITEMS[list[this.idx]].desc, 12, 143, COL.black); }
      else centerText('B: BACK', 150, COL.stone);
    }
  };
}
function firstDamaged() { for (var i = 0; i < Game.party.length; i++) if (!Game.party[i].fainted && Game.party[i].hp < maxHPd(Game.party[i])) return Game.party[i]; return null; }
function firstStatus() { for (var i = 0; i < Game.party.length; i++) if (Game.party[i].status) return Game.party[i]; return null; }
function firstFainted() { for (var i = 0; i < Game.party.length; i++) if (Game.party[i].fainted) return Game.party[i]; return null; }

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
