/* data.js — type wheel, moves, party classes/movesets, enemies, bosses,
   items, drip, XP curve. Pure data + a few builders. */

/* ---------- type wheel: ROAST>FLEX>WORDPLAY>HEART>ROAST ---------- */
var TYPES = ['ROAST', 'FLEX', 'WORDPLAY', 'HEART', 'CLASSIC'];
var BEATS = { ROAST: 'FLEX', FLEX: 'WORDPLAY', WORDPLAY: 'HEART', HEART: 'ROAST' };
var TYPECOL = { ROAST: '#c63a46', FLEX: '#e2b23e', WORDPLAY: '#8b5cf6', HEART: '#e05f8f', CLASSIC: '#9aa0b0' };
function typeMult(atk, def) {
  if (atk === 'CLASSIC' || def === 'CLASSIC') return 1;
  if (BEATS[atk] === def) return 1.5;
  if (BEATS[def] === atk) return 0.75;
  return 1;
}

/* ---------- stat-stage multiplier (Pokemon-like, -6..+6) ---------- */
function stageMul(s) { s = Math.max(-6, Math.min(6, s)); return s >= 0 ? (2 + s) / 2 : 2 / (2 - s); }

/* ---------- MOVES ----------
   fields: type, pow, acc, tgt('enemy'|'self'|'ally'|'party'), crit(+chance),
   crowd(+swing to user side), and eff{} for special behavior. desc for menu. */
var MOVES = {
  /* --- Samuel --- */
  openingbar:  { name: 'OPENING BAR', type: 'CLASSIC', pow: 40, acc: 1, tgt: 'enemy', crowd: 4, desc: 'A CLEAN WARM-UP BAR.' },
  doubleent:   { name: 'DOUBLE ENTENDRE', type: 'WORDPLAY', pow: 48, acc: .95, tgt: 'enemy', crowd: 6, eff: { status: 'FLUSTERED', chance: .3 }, desc: 'CLEVER. MAY FLUSTER.' },
  humblebrag:  { name: 'HUMBLE BRAG', type: 'FLEX', pow: 52, acc: .95, tgt: 'enemy', crowd: 6, desc: 'A FLEX SO SMOOTH IT STINGS.' },
  mustache:    { name: 'MUSTACHE TWIRL', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'self', crowd: 8, eff: { buffStat: 'POISE', buffAmt: 1, evasion: 1 }, desc: 'RAISE POISE + EVASION.' },
  hattip:      { name: 'HAT TIP', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'self', crowd: 12, eff: { buffStat: 'POISE', buffAmt: 1, evasion: 1 }, desc: 'RAISE POISE + EVASION. WITH STYLE.' },
  punchline:   { name: 'PUNCHLINE', type: 'WORDPLAY', pow: 58, acc: .9, tgt: 'enemy', crit: .25, crowd: 8, desc: 'HIGH CRIT WORDPLAY.' },
  nomoredis:   { name: 'NO MORE DISGUISE', type: 'HEART', pow: 95, acc: 1, tgt: 'enemy', crowd: 14, eff: { scaleCrowd: true }, desc: 'DAMAGE SCALES WITH THE CROWD.' },
  /* --- Herschel --- */
  canewhack:   { name: 'CANE WHACK', type: 'CLASSIC', pow: 44, acc: 1, tgt: 'enemy', crowd: 4, desc: 'A STURDY THWACK.' },
  warstory:    { name: 'WAR STORY', type: 'CLASSIC', pow: 0, acc: .85, tgt: 'enemy', crowd: 6, eff: { status: 'BORED', chance: 1 }, desc: 'BORE THE FOE TO SLEEP.' },
  backinday:   { name: 'BACK IN MY DAY', type: 'ROAST', pow: 54, acc: .95, tgt: 'enemy', crowd: 6, desc: 'A ROAST FROM THE OLD SCHOOL.' },
  grumble:     { name: 'GRUMBLE STANCE', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'self', crowd: 5, eff: { counter: true, buffStat: 'POISE', buffAmt: 1 }, desc: 'COUNTER THE NEXT HIT.' },
  kitchen:     { name: 'KITCHEN DUTY', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'party', crowd: 4, eff: { healFrac: .3, cure: true }, desc: 'HEAL PARTY + CURE STATUS.' },
  bothhips:    { name: 'BOTH HIPS', type: 'ROAST', pow: 92, acc: .95, tgt: 'enemy', crowd: 10, eff: { selfDmgFrac: .15 }, desc: 'HUGE ROAST. HURTS HIM. WORTH IT.' },
  /* --- William --- */
  wink:        { name: 'DEVASTATING WINK', type: 'HEART', pow: 46, acc: .95, tgt: 'enemy', crowd: 8, eff: { status: 'CHARMED', chance: .35 }, desc: 'HEART DMG. MAY CHARM.' },
  hairflip:    { name: 'HAIR FLIP', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'party', crowd: 6, eff: { evasionParty: 1 }, desc: 'PARTY EVASION UP.' },
  decree:      { name: 'ROYAL DECREE', type: 'CLASSIC', pow: 0, acc: .95, tgt: 'enemy', crowd: 6, eff: { debuffStat: 'FLOW', debuffAmt: 1, status: 'SHOOK', chance: 1 }, desc: 'LOWER FOE FLOW (SHOOK).' },
  smolder:     { name: 'SMOLDER', type: 'HEART', pow: 56, acc: .95, tgt: 'enemy', crowd: 8, desc: 'SINCERE HEART DAMAGE.' },
  noblesse:    { name: 'NOBLESSE OBLIGE', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'ally', crowd: 4, eff: { healFrac: .55 }, desc: 'BIG HEAL FOR ONE ALLY.' },
  crownjewel:  { name: 'CROWN JEWEL', type: 'FLEX', pow: 80, acc: .95, tgt: 'enemy', crit: .1, crowd: 12, desc: 'EVEN HIS VIOLENCE IS FABULOUS.' },
  /* --- Rosalind --- */
  steamvent:   { name: 'STEAM VENT', type: 'WORDPLAY', pow: 50, acc: .95, tgt: 'enemy', crowd: 6, eff: { status: 'MICFEEDBACK', chance: .25 }, desc: 'WORDPLAY. MAY CAUSE FEEDBACK.' },
  teapot:      { name: 'TEA DISPENSER', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'party', crowd: 4, eff: { hot: 3, hotFrac: .12 }, desc: 'HEAL-OVER-TIME FOR THE PARTY.' },
  recalibrate: { name: 'RECALIBRATE', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'party', crowd: 5, eff: { cure: true, buffStatParty: 'POISE', buffAmt: 1 }, desc: 'CLEANSE + BUFF PARTY.' },
  overclock:   { name: 'OVERCLOCK', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'party', crowd: 6, eff: { buffStatParty: 'TEMPO', buffAmt: 2 }, desc: 'PARTY TEMPO WAY UP.' },
  logicbomb:   { name: 'LOGIC BOMB', type: 'WORDPLAY', pow: 60, acc: .95, tgt: 'enemy', crowd: 8, eff: { pierce: true }, desc: 'IGNORES ENEMY BUFFS.' },
  teslaverse:  { name: 'TESLA VERSE', type: 'WORDPLAY', pow: 90, acc: .9, tgt: 'enemy', crowd: 12, eff: { selfStatus: 'FLUSTERED', selfChance: .2 }, desc: 'HUGE. SCIENCE HAS RISKS.' },
  /* --- generic enemy moves --- */
  heckle:      { name: 'HECKLE', type: 'CLASSIC', pow: 38, acc: .95, tgt: 'enemy', crowd: -3, desc: '' },
  weakflex:    { name: 'CHEAP FLEX', type: 'FLEX', pow: 44, acc: .9, tgt: 'enemy', crowd: -4, desc: '' },
  weakroast:   { name: 'LAZY ROAST', type: 'ROAST', pow: 46, acc: .9, tgt: 'enemy', crowd: -4, desc: '' },
  weakword:    { name: 'DULL PUN', type: 'WORDPLAY', pow: 44, acc: .9, tgt: 'enemy', crowd: -4, desc: '' },
  weakheart:   { name: 'CHEESY LINE', type: 'HEART', pow: 44, acc: .9, tgt: 'enemy', crowd: -4, desc: '' },
  scriptread:  { name: 'READ THE SCRIPT', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'self', crowd: -2, eff: { buffStat: 'POISE', buffAmt: 1 }, desc: '' },
  /* --- boss moves --- */
  flexstack:   { name: 'FLEX STACK', type: 'CLASSIC', pow: 0, acc: 1, tgt: 'self', crowd: 6, eff: { buffStat: 'FLOW', buffAmt: 1 }, desc: '' },
  gladiator:   { name: 'GLADIATOR SLAM', type: 'FLEX', pow: 62, acc: .95, tgt: 'enemy', crowd: 4, desc: '' },
  themsrules:  { name: "THEM'S THE RULES", type: 'FLEX', pow: 72, acc: .9, tgt: 'enemy', crit: .1, crowd: 6, desc: '' },
  venom:       { name: 'VENOM SPIT', type: 'ROAST', pow: 56, acc: .95, tgt: 'enemy', crowd: 5, eff: { status: 'SHOOK', chance: .5 } , desc: '' },
  gravel:      { name: 'GRAVEL THROAT', type: 'ROAST', pow: 74, acc: .9, tgt: 'enemy', crit: .1, crowd: 6, desc: '' },
  mirrorball:  { name: 'MIRROR BALL', type: 'HEART', pow: 58, acc: .95, tgt: 'enemy', crowd: 10, eff: { healFromCrowd: true }, desc: '' },
  discofire:   { name: 'DISCO INFERNO', type: 'HEART', pow: 76, acc: .9, tgt: 'enemy', crowd: 8, desc: '' },
  redpen:      { name: 'RED PEN', type: 'CLASSIC', pow: 50, acc: .95, tgt: 'enemy', crowd: -4, eff: { debuffStat: 'FLOW', debuffAmt: 1 }, desc: '' },
  approved:    { name: 'APPROVED VERSE', type: 'WORDPLAY', pow: 58, acc: .95, tgt: 'enemy', crowd: 4, desc: '' },
  finaldraft:  { name: 'FINAL DRAFT', type: 'WORDPLAY', pow: 84, acc: .9, tgt: 'enemy', crit: .1, crowd: 8, desc: '' },
  rewrite:     { name: 'REWRITE HISTORY', type: 'WORDPLAY', pow: 66, acc: .95, tgt: 'enemy', crowd: 6, eff: { status: 'FLUSTERED', chance: .3 }, desc: '' },
  finalword:   { name: 'THE FINAL WORD', type: 'WORDPLAY', pow: 120, acc: .95, tgt: 'enemy', crit: .1, crowd: 10, eff: { pierce: true }, fx: 'finalword', desc: 'AN UNANSWERABLE EDIT.' },
  /* --- boss SUPER moves (screen-shaking signature abilities, one per boss) --- */
  thumbsdown:  { name: 'THUMBS DOWN', type: 'FLEX', pow: 100, acc: .95, tgt: 'enemy', crit: .05, crowd: 12, fx: 'flex', desc: '' },
  gravelstorm: { name: 'GRAVEL STORM', type: 'ROAST', pow: 100, acc: .95, tgt: 'enemy', crowd: 12, eff: { status: 'SHOOK', chance: .6 }, fx: 'roast', desc: '' },
  lastdance:   { name: 'LAST DANCE', type: 'HEART', pow: 100, acc: .95, tgt: 'enemy', crowd: 12, eff: { healFromCrowd: true }, fx: 'heart', desc: '' },
  revolucion:  { name: 'REVOLUCION!', type: 'HEART', pow: 96, acc: .95, tgt: 'enemy', crowd: 12, fx: 'heart', desc: '' },
  understudy:  { name: 'PERFECT COPY', type: 'CLASSIC', pow: 70, acc: .95, tgt: 'enemy', crowd: 4, eff: { pierce: true }, desc: '' }
};

/* ---------- party classes ---------- */
var CLASSES = {
  samuel: { name: 'SAMUEL', type: 'WORDPLAY', spr: 'samuel',
    base: { HYPE: 26, FLOW: 12, POISE: 11, TEMPO: 12 }, grow: { HYPE: 5.2, FLOW: 2.4, POISE: 2.0, TEMPO: 2.1 },
    learn: { 1: ['openingbar', 'doubleent'], 3: ['humblebrag'], 5: ['mustache'], 7: ['punchline'] } },
  herschel: { name: 'HERSCHEL', type: 'ROAST', spr: 'herschel',
    base: { HYPE: 36, FLOW: 12, POISE: 15, TEMPO: 6 }, grow: { HYPE: 6.6, FLOW: 2.2, POISE: 2.8, TEMPO: 1.1 },
    learn: { 1: ['canewhack', 'backinday'], 3: ['warstory'], 5: ['grumble'], 7: ['kitchen'], 9: ['bothhips'] } },
  william: { name: 'WILLIAM', type: 'HEART', spr: 'william',
    base: { HYPE: 26, FLOW: 11, POISE: 10, TEMPO: 13 }, grow: { HYPE: 4.8, FLOW: 2.0, POISE: 1.8, TEMPO: 2.4 },
    learn: { 1: ['smolder', 'wink'], 3: ['hairflip'], 6: ['decree'], 8: ['noblesse'], 12: ['crownjewel'] } },
  rosalind: { name: 'ROSALIND', type: 'WORDPLAY', spr: 'rosalind',
    base: { HYPE: 22, FLOW: 16, POISE: 9, TEMPO: 14 }, grow: { HYPE: 4.0, FLOW: 3.1, POISE: 1.5, TEMPO: 2.6 },
    learn: { 1: ['steamvent', 'teapot'], 3: ['recalibrate'], 6: ['overclock'], 9: ['logicbomb'], 12: ['teslaverse'] } }
};

/* ---------- XP curve (levels 1-15) ---------- */
function xpNeed(level) { return Math.floor(18 * level + 5 * level * level); } /* xp to go from L -> L+1 */
function statAt(cls, stat, level) { return Math.round(cls.base[stat] + cls.grow[stat] * (level - 1)); }

/* build a fighter instance */
function makeFighter(id, level) {
  var cls = CLASSES[id];
  var f = {
    id: id, cls: cls, name: cls.name, type: cls.type, spr: cls.spr,
    level: level, xp: 0,
    maxHP: statAt(cls, 'HYPE', level), hp: 0,
    baseFLOW: statAt(cls, 'FLOW', level), basePOISE: statAt(cls, 'POISE', level), baseTEMPO: statAt(cls, 'TEMPO', level),
    stage: { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 },
    status: null, statusT: 0,
    counter: false, hotT: 0, hotFrac: 0,
    moves: [], drip: null,
    fainted: false
  };
  f.hp = f.maxHP;
  /* learn all moves up to level */
  var learned = [];
  for (var lv = 1; lv <= level; lv++) if (cls.learn[lv]) for (var i = 0; i < cls.learn[lv].length; i++) learned.push(cls.learn[lv][i]);
  f.moves = learned.slice(-4); /* keep last four learned (design: choosing 4 is a midgame decision; auto for now) */
  if (f.moves.length === 0) f.moves = [cls.learn[1][0]];
  return f;
}
/* effective stat incl. stage + drip + status */
function eff(f, stat) {
  var base = stat === 'FLOW' ? f.baseFLOW : stat === 'POISE' ? f.basePOISE : f.baseTEMPO;
  var st = f.stage[stat] || 0;
  if (stat === 'FLOW' && f.status === 'SHOOK') st -= 1;
  var v = base * stageMul(st);
  if (f.drip && DRIP[f.drip] && DRIP[f.drip].bonus && DRIP[f.drip].bonus[stat]) v += DRIP[f.drip].bonus[stat];
  return Math.max(1, v);
}
function maxHPd(f) { var m = f.maxHP; if (f.drip && DRIP[f.drip] && DRIP[f.drip].bonus && DRIP[f.drip].bonus.HYPE) m += DRIP[f.drip].bonus.HYPE; return m; }

/* ---------- items ---------- */
var ITEMS = {
  earlgrey:   { name: 'EARL GREY', desc: 'RESTORE 30 HYPE.', price: 12, kind: 'heal', amt: 30, field: true },
  strongtea:  { name: 'STRONG EARL GREY', desc: 'RESTORE 70 HYPE.', price: 28, kind: 'heal', amt: 70, field: true },
  crumpet:    { name: 'CRUMPET', desc: 'FULLY RESTORE HYPE.', price: 55, kind: 'heal', amt: 999, field: true },
  lozenge:    { name: 'THROAT LOZENGE', desc: 'CURE ALL STATUS.', price: 14, kind: 'cure', field: true },
  pocketwatch:{ name: 'POCKET WATCH', desc: 'FLEE ANY BATTLE.', price: 20, kind: 'flee', field: false },
  sparestache:{ name: 'SPARE MUSTACHE', desc: 'REVIVE A FALLEN DADDY.', price: 90, kind: 'revive', field: true }
};

/* ---------- drip (equipment) ---------- */
var DRIP = {
  dapperhat:  { name: 'DAPPER HAT', desc: '+4 POISE.', bonus: { POISE: 4 } },
  goldchain:  { name: 'GOLD CHAIN', desc: '+4 FLOW.', bonus: { FLOW: 4 } },
  swiftcane:  { name: 'SWIFT CANE', desc: '+4 TEMPO.', bonus: { TEMPO: 4 } },
  heartlocket:{ name: 'HEART LOCKET', desc: '+16 HYPE.', bonus: { HYPE: 16 } },
  laurelband: { name: 'LAUREL BAND', desc: '+3 FLOW, +3 POISE.', bonus: { FLOW: 3, POISE: 3 } },
  discogoggle:{ name: 'DISCO GOGGLES', desc: '+5 TEMPO, +2 FLOW.', bonus: { TEMPO: 5, FLOW: 2 } },
  truestache: { name: 'TRUE MUSTACHE', desc: 'THE BEST DRIP. +6 ALL.', bonus: { HYPE: 24, FLOW: 6, POISE: 6, TEMPO: 6 } }
};

/* ---------- enemy definitions ---------- */
function enemyStats(base, level) {
  return { HYPE: Math.round(base.HYPE + base.gH * (level - 1)), FLOW: Math.round(base.FLOW + base.gF * (level - 1)),
           POISE: Math.round(base.POISE + base.gP * (level - 1)), TEMPO: Math.round(base.TEMPO + base.gT * (level - 1)) };
}
var ENEMIES = {
  heckler:   { name: 'OPEN-MIC HECKLER', spr: 'heckler', type: 'CLASSIC', moves: ['heckle'], base: { HYPE: 22, FLOW: 8, POISE: 7, TEMPO: 8, gH: 3, gF: 1.4, gP: 1.2, gT: 1.4 }, xp: 10, money: 6 },
  orator:    { name: 'STREET ORATOR', spr: 'orator', type: 'FLEX', moves: ['weakflex', 'heckle'], base: { HYPE: 26, FLOW: 10, POISE: 8, TEMPO: 9, gH: 3.4, gF: 1.8, gP: 1.4, gT: 1.5 }, xp: 14, money: 8 },
  senator:   { name: 'GOSSIPING SENATOR', spr: 'senator', type: 'WORDPLAY', moves: ['weakword', 'scriptread'], base: { HYPE: 24, FLOW: 11, POISE: 9, TEMPO: 8, gH: 3.2, gF: 1.9, gP: 1.5, gT: 1.4 }, xp: 15, money: 9 },
  tumbleweed:{ name: 'TUMBLEWEED POET', spr: 'poet', type: 'HEART', moves: ['weakheart', 'heckle'], base: { HYPE: 30, FLOW: 12, POISE: 10, TEMPO: 9, gH: 3.6, gF: 2.0, gP: 1.6, gT: 1.5 }, xp: 18, money: 11 },
  auctioneer:{ name: 'CATTLE AUCTIONEER', spr: 'cowboy', type: 'ROAST', moves: ['weakroast', 'weakword'], base: { HYPE: 28, FLOW: 13, POISE: 9, TEMPO: 11, gH: 3.4, gF: 2.1, gP: 1.5, gT: 1.7 }, xp: 19, money: 12 },
  discofan:  { name: 'DISCO REGULAR', spr: 'dancer', type: 'HEART', moves: ['weakheart', 'weakflex'], base: { HYPE: 32, FLOW: 14, POISE: 11, TEMPO: 12, gH: 3.8, gF: 2.2, gP: 1.7, gT: 1.9 }, xp: 22, money: 14 },
  gerald:    { name: 'GERALD', spr: 'gerald', type: 'CLASSIC', moves: ['scriptread', 'weakword', 'heckle'], base: { HYPE: 30, FLOW: 12, POISE: 12, TEMPO: 9, gH: 3.6, gF: 1.9, gP: 1.9, gT: 1.4 }, xp: 20, money: 15 },
  editor:    { name: 'ORDER EDITOR', spr: 'editor', type: 'WORDPLAY', moves: ['redpen', 'approved', 'scriptread'], base: { HYPE: 40, FLOW: 15, POISE: 14, TEMPO: 11, gH: 4.2, gF: 2.4, gP: 2.2, gT: 1.8 }, xp: 40, money: 30 },
  goblin:    { name: 'CACKLING GOBLIN', spr: 'goblin', type: 'ROAST', moves: ['heckle', 'weakroast'], base: { HYPE: 30, FLOW: 15, POISE: 10, TEMPO: 14, gH: 3.6, gF: 2.3, gP: 1.6, gT: 2.0 }, xp: 24, money: 13 }
};

/* era encounter pools: mapId enc uses one of these */
var ENC_POOLS = {
  london:  ['heckler'],
  rome:    ['orator', 'senator', 'gerald'],
  west:    ['tumbleweed', 'auctioneer', 'gerald'],
  disco:   ['discofan', 'gerald'],
  goblin:  ['goblin']
};

/* ---------- bosses ---------- */
var BOSSES = {
  heckler_boss: { enemyId: 'heckler', name: 'THE HECKLER', level: 1, hpMul: 1.4, ai: 'basic', crowd: -10,
    type: 'CLASSIC', spr: 'heckler', moves: ['heckle'] },
  maximvs: { name: 'MC MAXIMVS', spr: 'maximvs', type: 'FLEX', level: 5, ai: 'maximvs', crowd: 0, super: 'thumbsdown',
    base: { HYPE: 122, FLOW: 19, POISE: 15, TEMPO: 12 }, moves: ['flexstack', 'gladiator', 'themsrules'], xp: 120, money: 80 },
  jake: { name: 'RATTLESNAKE JAKE', spr: 'jake', type: 'ROAST', level: 8, ai: 'jake', crowd: 0, super: 'gravelstorm',
    base: { HYPE: 238, FLOW: 35, POISE: 21, TEMPO: 19 }, moves: ['venom', 'gravel', 'weakroast'], xp: 180, money: 120 },
  rex: { name: 'DISCO REX', spr: 'rex', type: 'HEART', level: 11, ai: 'rex', crowd: 0, super: 'lastdance',
    base: { HYPE: 400, FLOW: 52, POISE: 29, TEMPO: 24 }, moves: ['mirrorball', 'discofire', 'weakheart'], xp: 260, money: 180 },
  snob1: { name: 'LORD SNOBBINGTON', spr: 'snob', type: 'WORDPLAY', level: 13, ai: 'snob1', crowd: -10, super: 'finalword',
    base: { HYPE: 330, FLOW: 35, POISE: 25, TEMPO: 22 }, moves: ['approved', 'rewrite', 'redpen'], xp: 0, money: 0 },
  snob2: { name: 'THE FINAL DRAFT', spr: 'snob', sprOpt: { finalDraft: true }, type: 'WORDPLAY', level: 14, ai: 'snob2', crowd: 100, super: 'finalword',
    base: { HYPE: 372, FLOW: 53, POISE: 31, TEMPO: 30 }, moves: ['finaldraft', 'rewrite', 'approved'], xp: 400, money: 300 },
  pedro: { name: 'PEDRO GARCIA', spr: 'pedro', type: 'HEART', level: 12, ai: 'basic', crowd: 0, super: 'revolucion',
    base: { HYPE: 250, FLOW: 34, POISE: 22, TEMPO: 18 }, moves: ['smolder', 'discofire', 'weakflex'], xp: 240, money: 150 },
  understudy: { name: 'THE UNDERSTUDY', spr: 'babbage', type: 'CLASSIC', level: 15, ai: 'understudy', crowd: 0, super: 'finalword',
    base: { HYPE: 360, FLOW: 48, POISE: 32, TEMPO: 28 }, moves: ['understudy', 'finaldraft', 'gravel', 'discofire'], xp: 600, money: 500 }
};

/* build an enemy fighter (wild or grunt) */
function makeEnemy(enemyId, level) {
  var e = ENEMIES[enemyId];
  var s = enemyStats(e.base, level);
  var f = { id: enemyId, name: e.name, type: e.type, spr: e.spr, level: level, xp: 0,
    maxHP: s.HYPE, hp: s.HYPE, baseFLOW: s.FLOW, basePOISE: s.POISE, baseTEMPO: s.TEMPO,
    stage: { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 }, status: null, statusT: 0, counter: false, hotT: 0, hotFrac: 0,
    moves: e.moves.slice(), isEnemy: true, xpYield: e.xp, moneyYield: e.money, fainted: false };
  return f;
}
/* build a boss fighter */
function makeBoss(bossId) {
  var b = BOSSES[bossId];
  if (b.enemyId) { var f0 = makeEnemy(b.enemyId, b.level); f0.name = b.name; f0.maxHP = Math.round(f0.maxHP * (b.hpMul || 1)); f0.hp = f0.maxHP; f0.isBoss = true; f0.ai = b.ai; f0.bossId = bossId; return f0; }
  var f = { id: bossId, name: b.name, type: b.type, spr: b.spr, sprOpt: b.sprOpt, level: b.level, xp: 0,
    maxHP: b.base.HYPE, hp: b.base.HYPE, baseFLOW: b.base.FLOW, basePOISE: b.base.POISE, baseTEMPO: b.base.TEMPO,
    stage: { FLOW: 0, POISE: 0, TEMPO: 0, EVA: 0 }, status: null, statusT: 0, counter: false, hotT: 0, hotFrac: 0,
    moves: b.moves.slice(), isEnemy: true, isBoss: true, ai: b.ai, bossId: bossId, superMove: b.super,
    xpYield: b.xp, moneyYield: b.money, turnCount: 0, fainted: false };
  return f;
}
