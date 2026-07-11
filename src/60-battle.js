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
  startBattle({ enemies: [{ enemy: eid, level: lv }], music: 'battle', canFlee: true, wild: true, taunt: pickTaunt(eid) },
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

function makeBattle(spec, onEnd) {
  var enemies = [];
  for (var i = 0; i < spec.enemies.length; i++) {
    var e = spec.enemies[i];
    enemies.push(e.boss ? makeBoss(e.boss) : makeEnemy(e.enemy, e.level));
  }
  var B = {
    spec: spec, onEnd: onEnd, enemies: enemies,
    party: Game.party,
    activeIdx: Math.max(0, firstLivingIdx(Game.party)),
    targetIdx: 0,
    crowd: spec.crowdStart || 0, usedShow: false,
    revealPending: false, revealDone: false, superFX: null,
    phase: 'transition', transT: 0, transDur: 0.95, taunt: spec.taunt || null,
    menuIdx: 0, moveIdx: 0, itemIdx: 0, switchIdx: 0,
    queue: [], qi: 0, msg: '', msgT: 0, autoMsgT: 0,
    aimT: 0, aimHit: false, pendingMove: null,
    flash: 0, shake: 0, participants: {},
    result: null, introT: 0, animT: 0, hitFlash: 0,
    xpMsgs: [],
    enter: function () { musicStart(spec.music || 'battle'); this.introT = 0;
      this.participants[this.activeIdx] = true; },
    active: function () { return this.party[this.activeIdx]; },
    livingEnemies: function () { var a = []; for (var i = 0; i < this.enemies.length; i++) if (!this.enemies[i].fainted) a.push(this.enemies[i]); return a; },
    firstEnemyIdx: function () { for (var i = 0; i < this.enemies.length; i++) if (!this.enemies[i].fainted) return i; return -1; },
    /* ---------- input ---------- */
    onPress: function (k) {
      if (this.phase === 'transition') { if (k === 'a' || k === 'start') { this.transT = this.transDur; this.phase = 'intro'; this.introT = 0; } return; }
      if (this.phase === 'intro') { if (k === 'a' || k === 'b' || k === 'start') this.toMenu(); return; }
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
      this.playerAction = { kind: 'move', move: move, onBeat: onBeat, target: this.targetIdx };
      this.runRound();
    },
    /* ---------- round resolution ---------- */
    runRound: function () {
      var self = this;
      this.queue = []; this.qi = 0;
      /* build actor action list */
      var actors = [];
      var ply = this.active();
      var pAct = this.playerAction;
      if (pAct.kind === 'move') actors.push({ f: ply, isPlayer: true, act: pAct });
      else if (pAct.kind === 'switch') { /* switch already applied; enemies still act */ }
      /* enemies choose */
      for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i]; if (e.fainted) continue;
        actors.push({ f: e, isPlayer: false, act: this.enemyChoose(e) });
      }
      /* order by TEMPO (switch = player already moved; enemies act after) */
      actors.sort(function (a, b) { return eff(b.f, 'TEMPO') - eff(a.f, 'TEMPO') + (Math.random() - 0.5); });
      /* build event queue */
      if (pAct.kind === 'switch') this.pushMsg(ply.name + ' STEPS UP!');
      for (i = 0; i < actors.length; i++) this.buildActorEvents(actors[i]);
      /* end of round: status ticks */
      this.queue.push({ fn: function () { return self.endRoundTick(); } });
      this.phase = 'resolve'; this.qi = 0; this.runEvent();
    },
    enemyChoose: function (e) {
      var ai = e.ai || 'basic';
      e.turnCount = (e.turnCount || 0) + 1;
      var pick = function (id) { return { kind: 'move', move: MOVES[id], onBeat: false, target: 0, actor: e }; };
      var atkMove = function () {
        /* choose a damaging move, prefer type advantage on active player */
        var best = null, bestScore = -1, tgt = Battle.active();
        for (var i = 0; i < e.moves.length; i++) { var m = MOVES[e.moves[i]]; if (!m.pow) continue;
          var sc = m.pow * typeMult(m.type, tgt.type) + Math.random() * 5; if (sc > bestScore) { bestScore = sc; best = e.moves[i]; } }
        return pick(best || e.moves[0]);
      };
      /* every boss unleashes its screen-shaking SUPER every 4th turn */
      if (e.superMove && e.turnCount >= 3 && e.turnCount % 4 === 0) return pick(e.superMove);
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
      /* status gate */
      this.queue.push({ fn: function () {
        if (f.fainted || f.hp <= 0) return null;
        if (f.status === 'BORED') { if (Math.random() < 0.4) { f.status = null; return f.name + ' SNAPS AWAKE!'; } return f.name + ' IS BORED... (ZZZ)'; }
        if (f.status === 'CHARMED' && Math.random() < 0.5) return f.name + ' IS CHARMED! IT SKIPS ITS TURN.';
        if (f.status === 'FLUSTERED' && Math.random() < 0.33) { var d = Math.max(1, Math.round(maxHPd(f) * 0.06)); f.hp = Math.max(0, f.hp - d); self.hitFlash = 0.2; return f.name + ' IS FLUSTERED AND FUMBLES!'; }
        return self.doAction(f, act, a.isPlayer);
      } });
    },
    doAction: function (f, act, isPlayer) {
      if (act.kind !== 'move') return null;
      var move = act.move;
      /* accuracy incl. evasion */
      var tgt;
      if (move.tgt === 'enemy') tgt = isPlayer ? (this.enemies[act.target] && !this.enemies[act.target].fainted ? this.enemies[act.target] : this.livingEnemies()[0]) : this.active();
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
        this.playerAction = { kind: 'move', move: this.bestPlayerMove(), onBeat: true, target: this.firstEnemyIdx() };
        this.queue = []; this.qi = 0;
        this.pushMsg('SHOWSTOPPER!! ' + this.active().name + ' GETS A FREE ENCORE!');
        this.buildActorEvents({ f: this.active(), isPlayer: true, act: this.playerAction });
        var self = this; this.queue.push({ fn: function () { return self.endRoundTick(); } });
        this.phase = 'resolve'; this.runEvent(); return;
      }
      if (this.checkEnd()) return;
      /* forced faint switch */
      if (this.active().fainted) {
        var idx = firstLivingIdx(this.party);
        if (idx < 0) { this.lose(); return; }
        this.phase = 'faintswitch'; this.switchIdx = idx; return;
      }
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
      var it = ITEMS[id];
      if (it.kind === 'heal' || it.kind === 'cure') {
        var t = this.active();
        if (it.kind === 'heal') { if (t.hp >= maxHPd(t)) { sfx('cancel'); return; } t.hp = Math.min(maxHPd(t), t.hp + it.amt); }
        else { if (!t.status) { sfx('cancel'); return; } t.status = null; }
        takeItem(id); sfx('item');
        this.playerAction = { kind: 'item', id: id };
        this.pushAndRun(t.name + (it.kind === 'heal' ? ' DRINKS ' + it.name + '!' : ' IS CURED!'));
      } else if (it.kind === 'revive') {
        var fell = null; for (var i = 0; i < this.party.length; i++) if (this.party[i].fainted) { fell = this.party[i]; break; }
        if (!fell) { sfx('cancel'); return; }
        fell.fainted = false; fell.hp = Math.round(maxHPd(fell) * 0.5); takeItem(id); sfx('heal');
        this.pushAndRun(fell.name + ' IS BACK IN THE SPOTLIGHT!');
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
      /* lost: revive party, heal, and either retry (boss) or return */
      for (var i = 0; i < this.party.length; i++) { this.party[i].fainted = false; this.party[i].hp = maxHPd(this.party[i]); this.party[i].status = null; this.party[i].stage = { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 }; }
      if (this.spec.canFlee === false && !this.spec.wild) {
        /* boss/story: retry the same fight */
        var spec = this.spec, onEnd = this.onEnd; Battle = null; startBattle(spec, onEnd);
      } else { var cb2 = this.onEnd; Battle = null; cb2({ win: false, lost: true }); }
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
      if (this.phase === 'resolve') { this.autoMsgT += dt; if (this.autoMsgT > 2.4) this.advance(); }
      if (this.phase === 'result') { this.resultT += dt; }
      /* animate crowd bar smoothing */
      this._crowdShown = (this._crowdShown === undefined) ? this.crowd : this._crowdShown + (this.crowd - this._crowdShown) * 0.2;
    },
    draw: function () {
      if (this.phase === 'transition') { this.drawTransition(); return; }
      var sh = this.shake > 0 ? ((Math.random() - 0.5) * 5) | 0 : 0;
      ctx.save(); ctx.translate(sh, 0);
      /* backdrop */
      var bgn = this.spec.bg || 'stage';
      if (BGS[bgn]) BGS[bgn](); else cls(COL.night);
      px(0, 96, 240, 64, 'rgba(0,0,0,0.18)');
      /* enemy sprite(s) top-right */
      for (var i = 0; i < this.enemies.length; i++) {
        var e = this.enemies[i]; if (e.fainted) continue;
        var ex = 150 + i * 30, ey = 22;
        if (SPR[e.spr]) SPR[e.spr](ex, ey, e.sprOpt);
      }
      /* active player sprite bottom-left */
      var a = this.active();
      if (a && SPR[a.spr]) SPR[a.spr](26, 78, a.spr === 'samuel' ? { trueForm: hasFlag('trueform') } : undefined);
      if (this.hitFlash > 0) { ctx.globalAlpha = 0.35; cls(COL.white); ctx.globalAlpha = 1; }
      if (this.flash > 0 && (this.animT * 20 | 0) % 2) { ctx.globalAlpha = 0.4; cls(COL.gold); ctx.globalAlpha = 1; }
      /* enemy HP box top-left */
      this.drawHPBox(this.enemies[Math.max(0, this.firstEnemyIdx())], 8, 18, false);
      /* player HP box bottom-right */
      if (a) this.drawHPBox(a, 128, 84, true);
      /* crowd meter */
      this.drawCrowd();
      ctx.restore();
      /* UI panels */
      if (this.phase === 'intro') {
        var en = this.enemies[Math.max(0, this.firstEnemyIdx())] || this.enemies[0];
        panel(6, 116, 228, 40, COL.cream, COL.black);
        drawText((en ? en.name : 'A FOE'), 12, 121, COL.red);
        if (this.taunt) { var tl = wrap(this.taunt, 210); for (var ti = 0; ti < tl.length && ti < 2; ti++) drawText(tl[ti], 12, 133 + ti * 10, COL.black); }
        else centerText('WANTS TO BATTLE!', 137, COL.black);
        if (Math.floor(performance.now() / 400) % 2) drawText('>', 224, 148, COL.red);
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
      if (p < 0.5) {                                  /* flash burst with radiating spokes */
        var on = ((t * 26) | 0) % 2;
        cls(on ? COL.white : '#1a1030');
        var n = 16, len = p * 360;
        for (i = 0; i < n; i++) { var a = (i / n) * 6.2832; px((120 + Math.cos(a) * len) | 0, (80 + Math.sin(a) * len) | 0, 4, 4, on ? '#1a1030' : COL.gold); }
        centerTextO('!', 66, on ? COL.red : COL.white, COL.black, 3);
      } else {                                        /* colored bands sweep + enemy slides in */
        cls('#1a1030');
        var q = (p - 0.5) / 0.5;
        for (var b = 0; b < 12; b++) { var c = [COL.pink, COL.gold, COL.teal, COL.purple][b % 4]; var w = (240 * q) | 0; px((b % 2) ? 0 : 240 - w, b * 14, w, 14, c); }
        var en = this.enemies[0];
        if (en && SPR[en.spr]) { ctx.globalAlpha = 0.4 + q * 0.6; SPR[en.spr]((240 - q * 96) | 0, 44, en.sprOpt); ctx.globalAlpha = 1; }
        centerTextO('VS!', 64, COL.white, COL.black, 3);
      }
    },
    drawHPBox: function (f, x, y, isPlayer) {
      if (!f) return;
      panel(x, y, 104, 30, COL.cream, COL.black);
      drawText(f.name, x + 5, y + 4, COL.black);
      drawText('L' + f.level, x + 84, y + 4, COL.black);
      bar(x + 5, y + 15, 94, 6, f.hp / maxHPd(f), f.hp / maxHPd(f) > 0.5 ? COL.grass : f.hp / maxHPd(f) > 0.2 ? COL.gold : COL.red);
      if (isPlayer) drawText(f.hp + '/' + maxHPd(f), x + 5, y + 23, COL.black);
      if (f.status) { var sc = { FLUSTERED: COL.purple, BORED: COL.stone, SHOOK: COL.teal, CHARMED: COL.pink, MICFEEDBACK: COL.red }[f.status] || COL.red;
        panel(x + 60, y + 22, 40, 8, sc, COL.black); drawText(f.status.substr(0, 4), x + 62, y + 23, COL.white); }
    },
    drawCrowd: function () {
      var cm = this._crowdShown || 0;
      var bx = 52, by = 3, bw = 150;
      drawTextO('CROWD', 8, by + 1, COL.white, COL.black);
      panel(bx - 2, by - 1, bw + 4, 11, COL.night, COL.black);
      var mid = bx + bw / 2;
      px(bx, by + 2, bw, 6, '#2a2a34');
      var half = (cm / 100) * (bw / 2);
      if (cm >= 0) px(mid, by + 2, half, 6, cm >= 40 ? COL.gold : COL.grass);
      else px(mid + half, by + 2, -half, 6, cm <= -40 ? COL.red : COL.pink);
      px(mid, by + 1, 1, 8, COL.white);
      if (cm >= 100) drawTextO('MAX!', mid + 4, by, COL.gold, COL.black);
    },
    drawMenu: function () {
      panel(6, 116, 150, 40);
      var labels = ['FIGHT', 'SWAG', 'SWITCH', 'FLEE'];
      for (var i = 0; i < 4; i++) { var cxp = 16 + (i % 2) * 74, cyp = 122 + ((i / 2) | 0) * 16;
        drawText(labels[i], cxp, cyp, COL.black); if (i === this.menuIdx) drawText('>', cxp - 8, cyp, COL.red); }
      panel(160, 116, 74, 40, COL.night);
      var a = this.active();
      drawText(a.name, 166, 122, COL.gold);
      drawText('LV ' + a.level, 166, 132, COL.white);
      drawText('HP ' + a.hp, 166, 142, COL.white);
      if (this.showReady) { centerTextO('SHOWSTOPPER READY!', 108, COL.gold, COL.black); }
    },
    drawMoves: function () {
      var mv = this.active().moves;
      panel(6, 112, 228, 44);
      for (var i = 0; i < mv.length; i++) { var m = MOVES[mv[i]];
        var xx = 14 + (i % 2) * 112, yy = 117 + ((i / 2) | 0) * 12;
        drawText(m.name, xx, yy, COL.black); if (i === this.moveIdx) drawText('>', xx - 8, yy, COL.red); }
      var sel = MOVES[mv[this.moveIdx]];
      panel(6, 141, 228, 15, TYPECOL[sel.type], COL.black);
      drawText(sel.type + (sel.pow ? '  PWR ' + sel.pow : '  STATUS'), 12, 145, COL.white);
      drawText(sel.desc, 96, 145, COL.white);
    },
    drawTargetPrompt: function () { panel(6, 120, 228, 34); centerText('CHOOSE A TARGET (A)', 133, COL.black);
      var t = this.enemies[this.targetIdx]; if (t) { var ex = 150 + this.targetIdx * 30; drawTextO('v', ex + 20, 14, COL.red, COL.black); } },
    drawSwitch: function () {
      panel(6, 96, 228, 60);
      centerText(this.phase === 'faintswitch' ? 'CHOOSE WHO STEPS UP' : 'SWITCH TO WHO?', 100, COL.black);
      for (var i = 0; i < this.party.length; i++) { var f = this.party[i];
        var yy = 112 + i * 11;
        var col = f.fainted ? COL.stone : COL.black;
        drawText(f.name + '  LV' + f.level + '  HP ' + f.hp + '/' + maxHPd(f) + (i === this.activeIdx ? ' *' : ''), 20, yy, col);
        if (i === this.switchIdx) drawText('>', 10, yy, COL.red); }
    },
    drawBag: function () {
      panel(6, 96, 228, 60);
      centerText('SWAG POUCH', 100, COL.black);
      if (this.bagList.length === 0) { centerText('EMPTY.', 124, COL.stone); return; }
      for (var i = 0; i < this.bagList.length && i < 4; i++) { var id = this.bagList[i];
        var yy = 112 + i * 11; drawText(ITEMS[id].name + ' x' + Game.items[id], 20, yy, COL.black);
        if (i === this.itemIdx) drawText('>', 10, yy, COL.red); }
      drawText(ITEMS[this.bagList[this.itemIdx]].desc, 12, 146, COL.stone);
    },
    drawAim: function () {
      panel(6, 116, 228, 40, COL.night);
      centerText('PRESS A ON THE BEAT!', 121, COL.white);
      var bx = 30, bw = 180, by = 138;
      px(bx, by, bw, 8, '#2a2a34');
      var zone = bx + bw * 0.7;
      px(zone - 8, by, 16, 8, COL.gold);
      var p = this.aimT / this.aimDur;
      px(bx + bw * p - 1, by - 2, 3, 12, COL.pink);
      drawText('(OPTIONAL)', 100, 149, COL.stone);
    },
    drawMsg: function () {
      panel(6, 120, 228, 36);
      var lines = wrap(this.msg || '', 210);
      for (var i = 0; i < lines.length && i < 2; i++) drawText(lines[i], 12, 128 + i * 10, COL.black);
      if (Math.floor(performance.now() / 400) % 2) drawText('>', 224, 148, COL.red);
    },
    drawResult: function () {
      panel(20, 40, 200, 80, COL.cream, COL.gold);
      if (this.result.win) {
        centerText('VICTORY!', 50, COL.red, 2);
        for (var i = 0; i < this.xpMsgs.length && i < 5; i++) centerText(this.xpMsgs[i], 68 + i * 9, COL.black);
      } else if (this.result.fled) { centerText('GOT AWAY SAFELY!', 74, COL.black); }
      else { centerText('THE CROWD BOOS...', 60, COL.black); centerText('BUT THE SHOW GOES ON.', 74, COL.black); centerText('(FULL HEAL — TRY AGAIN)', 90, COL.stone); }
      if (Math.floor(performance.now() / 400) % 2) centerText('PRESS A', 106, COL.red);
    }
  };
  B.phase = 'transition';
  return B;
}
