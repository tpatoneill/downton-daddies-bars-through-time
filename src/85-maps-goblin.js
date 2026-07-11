/* 85-maps-goblin.js — THE GOBLIN REALM (inserted between New York and the London
   finale). The engine — jammed with stowaway goblins — misfires and strands the
   Daddies here. They meet Pedro Garcia, battle him, and MID-FIGHT Samuel's wig
   flies off: she's revealed to be a woman (team EXTREMELY shocked) and rises to
   her True Form. Pedro gets her number; the spark repairs the machine; on to London. */

/* eerie green-realm backdrop (used for cutscenes + the Pedro battle) */
BGS.goblin = function () {
  cls('#122016');
  px(0, 0, 240, 70, '#1c3324');
  px(40, 12, 16, 16, '#7ec86a'); px(180, 20, 12, 12, '#a0e080'); /* two sickly moons */
  for (var i = 0; i < 30; i++) { var sx = (i * 53) % 240, sy = (i * 29) % 60; px(sx, sy, 1, 1, '#8fd868'); }
  /* twisted tree silhouettes */
  var tx = [16, 70, 150, 210];
  for (var t = 0; t < tx.length; t++) { px(tx[t] + 4, 60, 4, 46, '#0e1a10'); fillEll(tx[t] - 6, 44, tx[t] + 16, 70, '#16281a'); }
  px(0, 104, 240, 56, '#0e1710'); /* ground */
};

/* ================= GOBLIN REALM (single map) ================= */
registerMap('goblinrealm', {
  banner: 'THE GOBLIN REALM', music: 'west', encPool: 'goblin', safe: true,
  grid: [
    '#################',
    '#ggggggggggggggg#',
    '#gTtttttttttttTg#',
    '#gtttttttttttttg#',
    '#gtttttttttttttg#',
    '#gtttttttttttttg#',
    '#gtttttttttttttg#',
    '#gTtttttttttttTg#',
    '#ggggggggggggggg#',
    '#ggggggggggggggg#',
    '#################'
  ],
  warps: [],
  objs: [
    { x: 8, y: 1, solid: true, spr: 'pedro', dir: 'down', flag: 'pedro_beaten',
      onInteract: function () { pedroFight(); } },
    { x: 2, y: 9, solid: true, draw: drawPhono, onInteract: function () { phonographInteract(); } },
    mkTrainer(5, 5, { spr: 'goblin', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_gob_a', enemy: 'goblin', level: 11, reward: 30, bg: 'goblin', tname: 'CACKLING GOBLIN', hail: 'HEE HEE! NO REFUNDS! FIGHT US!', beaten: 'AWW. YOU BROKE OUR CACKLE.' }),
    mkTrainer(11, 5, { spr: 'goblinhex', dir: 'down', patrol: { ax: 'v', span: 2 }, sight: 3, defeat: 'tr_gob_b', enemy: 'goblinhex', level: 11, reward: 34, bg: 'goblin', tname: 'HEXING GOBLIN', hail: 'A HEX UPON YOUR BARS!', beaten: 'MY HEX... BACKFIRED. TYPICAL.' }),
    mkTrainer(8, 6, { spr: 'goblinbrute', dir: 'down', patrol: { ax: 'v', span: 1 }, sight: 3, defeat: 'tr_gob_c', enemy: 'goblinbrute', level: 12, reward: 36, bg: 'goblin', tname: 'BRUTE GOBLIN', hail: 'BRUTE. SMASH. BARS. NOW.', beaten: 'BRUTE... SAD. BRUTE GO HOME.' }),
    { x: 13, y: 8, mustache: true, flag: 'stache_goblin', onInteract: function (o) { collectMustache(o, 'stache_goblin'); } }
  ],
  onEnter: function () { if (!hasFlag('goblin_arrived')) { /* arrival handled by goblinMalfunction */ } }
});

/* ================= story: the malfunction ================= */
function goblinMalfunction() {
  Cutscene.play([
    { bg: 'disco' },
    { narr: 'THE DADDIES PILE INTO THE MACHINE, HOMEWARD FOR LONDON.' },
    { say: ['ROSALIND', 'SETTING COURSE FOR 1889 AND— WAIT.'] },
    { say: ['ROSALIND', 'WHAT ARE THOSE... IN THE GEARS?'] },
    { narr: 'SOMETHING GREEN IS TANGLED IN THE FLUX GEARS. SOMETHING GRINNING.' },
    { say: ['HERSCHEL', 'GOBLINS. WHY IS IT ALWAYS GOBLINS.'] },
    { say: ['SAMUEL', 'HOLD ON, DADDIES!'] },
    { do: function () { playBoom(function () { Cutscene.next(); }); } },
    { bg: 'goblin' }, { music: 'west' },
    { narr: 'THE MACHINE LURCHES OFF COURSE... AND SPITS THEM OUT SOMEWHERE ELSE.' },
    { do: function () { Game.map = 'goblinrealm'; Game.px = 8; Game.py = 9; Game.dir = 'up'; setFlag('goblin_arrived'); saveGame(false); } }
  ], { onDone: function () { goblinArrive(); } });
}
function goblinArrive() {
  Cutscene.play([
    { bg: 'goblin' },
    { narr: 'A STRANGE GREEN REALM. GOBLINS EVERYWHERE. AND ONE MAN ON THE HILL.' },
    { say: ['SAMUEL', 'THE ENGINE IS DEAD. WE NEED A SPARK.'] },
    { say: ['ROSALIND', 'OR A MIRACLE. IDEALLY WITH VOLTAGE.'] },
    { say: ['WILLIAM', 'WHO IS THAT... BAKER?'] }
  ], { onDone: function () { gotoWorld(); } });
}

/* ================= story: Pedro ================= */
function pedroFight() {
  if (hasFlag('pedro_beaten')) { say([['PEDRO', 'GO WELL, MI CORAZON. AND CALL ME.'], ['PEDRO', 'SOMEHOW.']]); return; }
  Cutscene.play([
    { bg: 'goblin' }, { music: 'boss' },
    { say: ['PEDRO', 'ALTO! I AM PEDRO GARCIA.'] },
    { say: ['PEDRO', 'A BAKER BY TRADE, A REVOLUTIONARY'] },
    { say: ['PEDRO', 'BY HEART. I WAS AGAINST THE MONARCH.'] },
    { say: ['PEDRO', 'I SERVED IN THE MILITARY IN MEXICO.'] },
    { say: ['PEDRO', 'I HELPED THE REVOLUTION DURING'] },
    { say: ['PEDRO', "MEXICO'S INDEPENDENCE FROM THE US."] },
    { say: ['PEDRO', 'I AM DETERMINED TO MAKE A'] },
    { say: ['PEDRO', 'DIFFERENCE IN ENGLAND.'] },
    { say: ['SAMUEL', 'THAT IS... A LOT OF HISTORY.'] },
    { say: ['SAMUEL', "LET'S SETTLE IT WITH BARS."] },
    { say: ['PEDRO', 'CON GUSTO. EN GARD— I MEAN, DROP IT.'] },
    { battle: function () { return { enemies: [{ boss: 'pedro' }], music: 'boss', canFlee: false, bg: 'goblin', crowdStart: 0, reveal: { hpFrac: 0.55, fn: pedroReveal } }; },
      onResult: function (r) { if (r.win) setFlag('pedro_beaten'); } }
  ], { onDone: function () { if (hasFlag('pedro_beaten')) pedroAfter(); else gotoWorld(); } });
}

/* THE WIG REVEAL — fired mid-battle by the reveal hook. Team EXTREMELY shocked. */
function pedroReveal(resume) {
  Cutscene.play([
    { bg: 'goblin' }, { stop: true }, { sfx: 'reveal' },
    { narr: "MID-VERSE, SAMUEL'S WIG FLIES OFF. IT HITS THE FLOOR. SILENCE." },
    { narr: 'EVEN THE GOBLINS STOP GRINNING.' },
    { say: ['HERSCHEL', 'A... A WOMAN?!'] },
    { say: ['HERSCHEL', 'I FOUGHT IN THREE WARS. I WAS'] },
    { say: ['HERSCHEL', 'NOT READY FOR THIS.'] },
    { say: ['WILLIAM', 'A WOMAN?! AND STILL BETTER HAIR'] },
    { say: ['WILLIAM', 'THAN— NO. I REFUSE TO ACCEPT IT.'] },
    { say: ['ROSALIND', 'MY INSTRUMENTS DETECTED NOTHING!'] },
    { say: ['ROSALIND', 'I MUST RECALIBRATE MY ENTIRE LIFE!'] },
    { say: ['HERSCHEL', '...I NEED TO SIT DOWN.'] },
    { say: ['SAMUEL', 'THE WIG WAS THE COSTUME.'] },
    { say: ['SAMUEL', 'THE BARS WERE ALWAYS MINE.'] },
    { do: function () { transformSamuel(); } },
    { music: 'boss' },
    { narr: 'SAMUEL RISES TO HER TRUE FORM! SHE LEARNED NO MORE DISGUISE!' },
    { say: ['PEDRO', 'SENORITA... YOU CONTAIN MULTITUDES.'] },
    { say: ['PEDRO', "AND EXCELLENT BARS. LET'S FINISH."] }
  ], { onDone: function () { resume(); } });
}

/* AFTER the fight: Pedro shoots his shot, gets the number, the spark fixes the engine. */
function pedroAfter() {
  Cutscene.play([
    { bg: 'goblin' },
    { say: ['PEDRO', 'A WOMAN WHO OUT-RAPS MY ENTIRE'] },
    { say: ['PEDRO', 'GOBLIN ARMY... CAN I GET YOUR NUMBER?'] },
    { say: ['HERSCHEL', "IT'S 1889. WHAT NUMBER."] },
    { choice: { who: 'SAMUEL', q: 'YOUR MOVE, SAMUEL:',
      opts: ["I DON'T DATE MEN I JUST BEAT.", "YOU BAKE? I'M STARVING.", 'SAY THAT AGAIN. SLOWER.'],
      cb: function (idx) {} } },
    { narr: 'SHE SCRIBBLES A NUMBER DOWN. THEIR FINGERS TOUCH.' },
    { sfx: 'sparkle' },
    { narr: 'A SPARK LEAPS BETWEEN THEM — AND INTO THE DEAD MACHINE!' },
    { say: ['ROSALIND', "THE ENGINE'S ALIVE! A SPARK IS,"] },
    { say: ['ROSALIND', 'APPARENTLY, A POWER SOURCE.'] },
    { say: ['ROSALIND', 'ALSO — WHAT IS A "PHONE NUMBER"?'] },
    { say: ['PEDRO', 'GO. MAKE YOUR DIFFERENCE IN ENGLAND.'] },
    { say: ['PEDRO', 'AND CALL ME. SOMEHOW.'] },
    { say: ['SAMUEL', 'I WILL. ...SOMEHOW.'] },
    { do: function () { setFlag('goblin_done'); setFlag('london_unlocked'); saveGame(false); } },
    { narr: 'THE DADDIES BOARD THE MENDED MACHINE — LONDON AT LAST!' }
  ], { onDone: function () { playTravel('LONDON 1889', function () {
        Game.map = 'theatredistrict'; Game.px = 9; Game.py = 5; Game.dir = 'up'; saveGame(false); gotoWorld();
      }); } });
}
