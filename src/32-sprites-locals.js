/* sprites-locals.js — era-local enemy battle sprites + overworld walkers.
   Appends to the global SPR registry and WALK registry from 30-sprites.js.
   Reuses painter(), the shared body primitives, and the shared palette consts. */

/* Legionary — Rome, ROAST. Bronze galea with red transverse crest, lorica segmentata, spear. */
SPR.legionary = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var IR = '#9aa0ae', IRs = '#6e7480', IRh = '#c6ccd8';
  /* short spear behind the body */
  g.p(cx + 17, 8, 2, 45, '#8a6a3c');
  g.p(cx + 16, 8, 1, 1, sK); g.p(cx + 19, 8, 1, 1, sK);
  g.p(cx + 16, 2, 4, 6, IR);
  g.p(cx + 17, 0, 2, 3, IRh);
  g.p(cx + 16, 2, 4, 1, sK); g.p(cx + 16, 7, 4, 1, sK);
  /* red transverse crest (ear to ear across the helmet) */
  g.p(cx - 13, 3, 26, 4, sRD);
  g.p(cx - 13, 3, 26, 1, sK);
  g.p(cx - 13, 3, 1, 4, sK); g.p(cx + 12, 3, 1, 4, sK);
  g.p(cx - 11, 6, 22, 1, '#96283c');
  /* bronze galea dome */
  g.ell(cx - 10, 6, cx + 10, 19, sBZ, sK);
  g.p(cx - 7, 8, 3, 3, '#d8b060');
  g.p(cx - 9, 15, 18, 2, sBZs);
  var ytop = _face(g, cx, 17, 15), ey = ytop + 4;
  /* hinged cheek guards */
  g.p(cx - 10, ytop, 3, 10, sBZ); g.p(cx + 7, ytop, 3, 10, sBZ);
  g.p(cx - 10, ytop, 1, 10, sK); g.p(cx + 9, ytop, 1, 10, sK);
  g.p(cx - 10, ytop + 8, 3, 2, sBZs); g.p(cx + 7, ytop + 8, 3, 2, sBZs);
  _eyes(g, cx, ey, true, 2);
  g.p(cx - 3, ytop + 11, 6, 1, sK); /* stern mouth */
  var sh = ytop + 15;
  /* segmented lorica — banded metal chest */
  g.p(cx - 13, sh, 26, 15, IR);
  g.p(cx - 13, sh, 26, 1, sK);
  g.p(cx - 13, sh, 1, 15, sK); g.p(cx + 12, sh, 1, 15, sK);
  for (i = 1; i < 5; i++) g.p(cx - 12, sh + i * 3, 24, 1, IRs);
  g.p(cx - 12, sh + 1, 2, 13, IRh);
  g.p(cx + 9, sh + 1, 3, 13, IRs);
  /* shoulder plates */
  g.p(cx - 16, sh - 1, 6, 5, IR); g.p(cx + 10, sh - 1, 6, 5, IR);
  g.p(cx - 16, sh - 1, 6, 1, sK); g.p(cx + 10, sh - 1, 6, 1, sK);
  g.p(cx - 16, sh + 3, 6, 1, IRs); g.p(cx + 10, sh + 3, 6, 1, IRs);
  /* red tunic edge below the armor */
  g.p(cx - 12, sh + 15, 24, 6, sRD);
  g.p(cx - 12, sh + 15, 1, 6, sK); g.p(cx + 11, sh + 15, 1, 6, sK);
  g.p(cx - 12, sh + 20, 24, 1, '#96283c');
  _arms(g, cx, sh, 14, sRD);
  _legs(g, cx, 53);
};

/* Snake-oil salesman — Dodge City, FLEX. Tall garish hat, checkered vest, tonic held high. */
SPR.salesman = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i, j;
  var PU = '#8b3ca8', CK = '#f0d838', CKs = '#c8a030', GN = '#4aa860';
  /* tall garish purple hat with a yellow band */
  g.p(cx - 8, 0, 16, 12, PU);
  g.p(cx - 8, 0, 16, 1, sK);
  g.p(cx - 8, 0, 1, 12, sK); g.p(cx + 7, 0, 1, 12, sK);
  g.p(cx - 7, 1, 2, 10, '#a44fc0');
  g.p(cx - 7, 9, 14, 2, CK);
  g.p(cx - 13, 12, 26, 3, PU);
  g.p(cx - 13, 12, 26, 1, sK); g.p(cx - 13, 14, 26, 1, sK);
  g.p(cx - 13, 12, 1, 3, sK); g.p(cx + 12, 12, 1, 3, sK);
  var ytop = _face(g, cx, 17), ey = ytop + 5;
  _eyes(g, cx, ey, false, 1);
  /* curly showman mustache */
  g.p(cx - 7, ey + 6, 6, 2, sMC); g.p(cx + 1, ey + 6, 6, 2, sMC);
  g.p(cx - 9, ey + 5, 2, 2, sMC); g.p(cx + 7, ey + 5, 2, 2, sMC);
  _smile(g, cx, ytop + 14, true);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, CK, CKs, '#f8e878', sWH, false);
  /* loud checkered vest pattern */
  for (j = 0; j < 5; j++) for (i = 0; i < 2; i++) {
    if ((i + j) % 2 === 0) g.p(cx - 12 + i * 4, sh + 2 + j * 3, 4, 3, sRD);
    else g.p(cx + 4 + i * 4, sh + 2 + j * 3, 4, 3, sRD);
  }
  /* left arm down */
  g.p(cx - 17, sh + 1, 5, 15, CK);
  g.p(cx - 17, sh + 1, 5, 1, sK);
  g.p(cx - 17, sh + 1, 1, 15, sK); g.p(cx - 13, sh + 1, 1, 15, sK);
  g.p(cx - 16, sh + 16, 3, 3, sSK); g.p(cx - 16, sh + 18, 3, 1, sSD);
  /* right arm raised, hand aloft */
  g.p(cx + 12, sh - 6, 5, 9, CK);
  g.p(cx + 12, sh - 6, 5, 1, sK);
  g.p(cx + 12, sh - 6, 1, 9, sK); g.p(cx + 16, sh - 6, 1, 9, sK);
  g.p(cx + 13, sh - 9, 3, 3, sSK);
  /* the little bottle of MIRACLE TONIC, held high */
  g.p(cx + 12, sh - 15, 5, 6, GN);
  g.p(cx + 12, sh - 15, 5, 1, sK); g.p(cx + 12, sh - 10, 5, 1, sK);
  g.p(cx + 12, sh - 15, 1, 6, sK); g.p(cx + 16, sh - 15, 1, 6, sK);
  g.p(cx + 13, sh - 18, 3, 3, '#8a6a3c'); /* cork */
  g.p(cx + 13, sh - 18, 3, 1, sK);
  g.p(cx + 13, sh - 13, 3, 2, sWH); /* label */
  _legs(g, cx, 53);
};

/* Deejay — New York, FLEX. Big headphones over an afro, gold chain, open shirt. */
SPR.deejay = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var OR = '#e07820', ORs = '#b05a14', ORh = '#f09040', AF = '#2a2028';
  /* afro */
  g.ell(cx - 12, 2, cx + 12, 20, AF, sK);
  g.p(cx - 12, 10, 3, 6, '#3a2c34'); g.p(cx + 9, 10, 3, 6, '#3a2c34');
  var ytop = _face(g, cx, 17), ey = ytop + 6;
  /* headphone band over the top, straps down the sides */
  g.p(cx - 10, 1, 20, 3, sRD);
  g.p(cx - 10, 1, 20, 1, sK); g.p(cx - 10, 3, 20, 1, sK);
  g.p(cx - 13, 3, 2, ey - 5, sRD); g.p(cx + 11, 3, 2, ey - 5, sRD);
  /* big red ear cups with dark pads */
  g.p(cx - 15, ey - 2, 5, 9, sRD); g.p(cx + 10, ey - 2, 5, 9, sRD);
  g.p(cx - 15, ey - 2, 5, 1, sK); g.p(cx + 10, ey - 2, 5, 1, sK);
  g.p(cx - 15, ey + 6, 5, 1, sK); g.p(cx + 10, ey + 6, 5, 1, sK);
  g.p(cx - 15, ey - 2, 1, 9, sK); g.p(cx + 14, ey - 2, 1, 9, sK);
  g.p(cx - 14, ey + 1, 3, 3, '#96283c'); g.p(cx + 11, ey + 1, 3, 3, '#96283c');
  _eyes(g, cx, ey, false, 1);
  /* cool confident smirk */
  g.p(cx - 2, ytop + 13, 5, 1, sK); g.p(cx + 3, ytop + 12, 1, 1, sK);
  var sh = ytop + 17;
  /* open flashy shirt: bare chest strip up the middle */
  _coatBody(g, cx, sh, 53, OR, ORs, ORh, sSK, false);
  /* big collar wings */
  g.p(cx - 15, sh - 1, 6, 6, ORh); g.p(cx + 9, sh - 1, 6, 6, ORh);
  g.p(cx - 15, sh - 1, 6, 1, sK); g.p(cx + 9, sh - 1, 6, 1, sK);
  /* gold chain + medallion on the chest */
  g.p(cx - 3, sh + 2, 1, 2, sGD); g.p(cx + 2, sh + 2, 1, 2, sGD);
  g.p(cx - 2, sh + 4, 4, 1, sGD);
  g.p(cx - 1, sh + 5, 2, 3, sGD); g.p(cx - 1, sh + 6, 2, 1, sBZs);
  _arms(g, cx, sh, 17, OR);
  _legs(g, cx, 53);
};

/* Skater — New York, WORDPLAY. Headband, striped tee, tube socks, roller skates. */
SPR.skater = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i, s;
  var TS = '#f6f6fa', HR = '#8a5a2c';
  /* hair */
  g.ell(cx - 9, 1, cx + 9, 14, HR, sK);
  var ytop = _face(g, cx, 12), ey = ytop + 5;
  /* headband across the forehead, knot tail on the side */
  g.p(cx - 9, ytop + 1, 18, 3, sRD);
  g.p(cx - 9, ytop + 1, 18, 1, sK); g.p(cx - 9, ytop + 3, 18, 1, sK);
  g.p(cx + 9, ytop + 2, 3, 2, sRD); g.p(cx + 10, ytop + 4, 2, 2, '#96283c');
  _eyes(g, cx, ey); /* no brows: the headband sits right above the eyes */
  _smile(g, cx, ytop + 12, true); /* sunny grin */
  var sh = ytop + 16;
  /* striped tee */
  g.p(cx - 12, sh, 24, 13, TS);
  g.p(cx - 12, sh, 24, 1, sK); g.p(cx - 12, sh + 12, 24, 1, sK);
  g.p(cx - 12, sh, 1, 13, sK); g.p(cx + 11, sh, 1, 13, sK);
  for (i = 0; i < 3; i++) g.p(cx - 11, sh + 2 + i * 4, 22, 2, sTE);
  /* bare arms, wristbands */
  for (s = -1; s <= 1; s += 2) {
    var ax = s < 0 ? cx - 16 : cx + 12;
    g.p(ax, sh + 1, 4, 12, sSK);
    g.p(ax, sh + 1, 4, 1, sK);
    g.p(ax + (s < 0 ? 0 : 3), sh + 1, 1, 12, sK);
    g.p(ax + (s < 0 ? 3 : 0), sh + 1, 1, 12, sK);
    g.p(ax + 1, sh + 10, 2, 2, sRD);
    g.p(ax + 1, sh + 13, 2, 2, sSK); g.p(ax + 1, sh + 14, 2, 1, sSD);
  }
  /* gym shorts */
  g.p(cx - 9, sh + 13, 18, 5, '#3a5ac0');
  g.p(cx - 9, sh + 13, 1, 5, sK); g.p(cx + 8, sh + 13, 1, 5, sK);
  g.p(cx - 9, sh + 17, 18, 1, sK);
  g.p(cx - 8, sh + 14, 16, 1, sWH); /* piping */
  /* bare legs */
  g.p(cx - 7, sh + 18, 5, 4, sSK); g.p(cx + 2, sh + 18, 5, 4, sSK);
  g.p(cx - 7, sh + 18, 1, 4, sSD); g.p(cx + 6, sh + 18, 1, 4, sSD);
  /* striped tube socks */
  g.p(cx - 7, sh + 22, 5, 6, TS); g.p(cx + 2, sh + 22, 5, 6, TS);
  g.p(cx - 7, sh + 22, 1, 6, sK); g.p(cx - 3, sh + 22, 1, 6, sK);
  g.p(cx + 2, sh + 22, 1, 6, sK); g.p(cx + 6, sh + 22, 1, 6, sK);
  g.p(cx - 6, sh + 23, 3, 1, sRD); g.p(cx + 3, sh + 23, 3, 1, sRD);
  g.p(cx - 6, sh + 25, 3, 1, sTE); g.p(cx + 3, sh + 25, 3, 1, sTE);
  /* roller skates, mid-glide */
  g.p(cx - 9, sh + 28, 8, 3, sRD); g.p(cx + 1, sh + 28, 8, 3, sRD);
  g.p(cx - 9, sh + 28, 8, 1, sK); g.p(cx + 1, sh + 28, 8, 1, sK);
  g.p(cx - 9, sh + 28, 1, 3, sK); g.p(cx + 8, sh + 28, 1, 3, sK);
  g.p(cx - 8, sh + 29, 2, 1, sWH); g.p(cx + 2, sh + 29, 2, 1, sWH); /* laces */
  /* wheels */
  g.p(cx - 8, sh + 31, 2, 2, sK); g.p(cx - 4, sh + 31, 2, 2, sK);
  g.p(cx + 2, sh + 31, 2, 2, sK); g.p(cx + 6, sh + 31, 2, 2, sK);
  g.p(cx - 8, sh + 31, 1, 1, sGD); g.p(cx - 4, sh + 31, 1, 1, sGD);
  g.p(cx + 2, sh + 31, 1, 1, sGD); g.p(cx + 6, sh + 31, 1, 1, sGD);
};

/* Hexing goblin — Goblin Realm, WORDPLAY. Purple-tinted, pointed wizard hat, glowing eyes. ~40px. */
SPR.goblinhex = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var PB = '#8a6ab8', PBs = '#5a3f88', PBk = '#3e2a62', GLO = '#e070ff';
  /* big pointy ears */
  g.p(cx - 15, 28, 6, 3, PB); g.p(cx - 18, 27, 3, 2, PB); g.p(cx - 18, 26, 2, 1, PBk);
  g.p(cx - 15, 30, 6, 1, PBs);
  g.p(cx + 9, 28, 6, 3, PB); g.p(cx + 15, 27, 3, 2, PB); g.p(cx + 16, 26, 2, 1, PBk);
  g.p(cx + 9, 30, 6, 1, PBs);
  /* head */
  g.ell(cx - 9, 22, cx + 9, 38, PB, PBk);
  g.p(cx - 6, 36, 12, 1, PBs);
  /* glowing eyes with a faint spark */
  g.ell(cx - 7, 25, cx - 2, 30, GLO, PBk);
  g.ell(cx + 2, 25, cx + 7, 30, GLO, PBk);
  g.p(cx - 5, 27, 1, 1, sWH); g.p(cx + 4, 27, 1, 1, sWH);
  g.p(cx - 8, 24, 1, 1, GLO); g.p(cx + 7, 24, 1, 1, GLO);
  /* mischievous grin with one fang */
  g.p(cx - 5, 33, 10, 1, sK);
  g.p(cx - 6, 32, 1, 1, sK); g.p(cx + 5, 32, 1, 1, sK);
  g.p(cx - 3, 34, 1, 1, sWH);
  /* little pointed wizard hat (drawn over the head) */
  g.p(cx - 1, 8, 2, 3, PBs);
  g.p(cx - 3, 11, 6, 3, PBs);
  g.p(cx - 5, 14, 10, 3, PBs);
  g.p(cx - 7, 17, 14, 4, PBs);
  g.p(cx - 1, 8, 2, 1, sK);
  g.p(cx - 3, 11, 1, 3, sK); g.p(cx + 2, 11, 1, 3, sK);
  g.p(cx - 5, 14, 1, 3, sK); g.p(cx + 4, 14, 1, 3, sK);
  g.p(cx - 7, 17, 1, 4, sK); g.p(cx + 6, 17, 1, 4, sK);
  g.p(cx - 11, 21, 22, 2, PBk);
  g.p(cx - 11, 21, 22, 1, sK); g.p(cx - 11, 22, 1, 1, sK); g.p(cx + 10, 22, 1, 1, sK);
  g.p(cx - 4, 18, 3, 2, sGD); /* little star on the brim */
  g.p(cx + 1, 12, 1, 1, GLO); /* hex spark on the cone */
  /* raggedy robe with jagged hem */
  g.p(cx - 8, 39, 16, 9, PBs);
  g.p(cx - 8, 39, 16, 1, sK); g.p(cx - 8, 39, 1, 9, sK); g.p(cx + 7, 39, 1, 9, sK);
  g.p(cx + 4, 40, 3, 8, PBk);
  g.p(cx - 8, 48, 3, 2, PBs); g.p(cx - 2, 48, 3, 2, PBs); g.p(cx + 4, 48, 3, 2, PBs);
  g.p(cx - 8, 49, 3, 1, sK); g.p(cx - 2, 49, 3, 1, sK); g.p(cx + 4, 49, 3, 1, sK);
  /* rune belt */
  g.p(cx - 8, 43, 16, 1, GLO);
  /* spindly arms with grabby claws */
  var s, ax;
  for (s = -1; s <= 1; s += 2) {
    ax = s < 0 ? cx - 11 : cx + 9;
    g.p(ax, 40, 2, 9, PB);
    g.p(ax + (s < 0 ? 0 : 1), 40, 1, 9, PBk);
    g.p(ax - (s < 0 ? 1 : 0), 48, 3, 2, PB);
    g.p(ax - (s < 0 ? 1 : 0), 49, 1, 1, sK); g.p(ax + (s < 0 ? 1 : 2), 49, 1, 1, sK);
  }
  /* short legs, bare toed feet */
  g.p(cx - 5, 50, 3, 6, PB); g.p(cx + 2, 50, 3, 6, PB);
  g.p(cx - 5, 50, 1, 6, PBk); g.p(cx + 4, 50, 1, 6, PBk);
  g.p(cx - 7, 56, 6, 2, PB); g.p(cx + 1, 56, 6, 2, PB);
  g.p(cx - 7, 57, 6, 1, sK); g.p(cx + 1, 57, 6, 1, sK);
};

/* Brute goblin — Goblin Realm, FLEX. Big, dark green, heavy brow, tusks, bone club. */
SPR.goblinbrute = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, s;
  var GB = '#4a8a3a', GBs = '#356828', GBk = '#234a1a', TK = '#e8e0c8', BN = '#c8b48c';
  /* big pointy ears */
  g.p(cx - 16, 12, 6, 4, GB); g.p(cx - 19, 11, 3, 2, GB); g.p(cx - 16, 15, 6, 1, GBs);
  g.p(cx + 10, 12, 6, 4, GB); g.p(cx + 16, 11, 3, 2, GB); g.p(cx + 10, 15, 6, 1, GBs);
  /* big blocky head */
  g.ell(cx - 11, 4, cx + 11, 24, GB, GBk);
  /* heavy single brow */
  g.p(cx - 8, 10, 16, 3, GBk);
  /* small dim eyes under the brow */
  g.p(cx - 6, 13, 3, 2, sWH); g.p(cx + 3, 13, 3, 2, sWH);
  g.p(cx - 5, 14, 1, 1, sK); g.p(cx + 4, 14, 1, 1, sK);
  /* underbite jaw with tusks poking up */
  g.p(cx - 7, 19, 14, 3, GBs);
  g.p(cx - 6, 19, 12, 1, sK);
  g.p(cx - 6, 17, 2, 3, TK); g.p(cx + 4, 17, 2, 3, TK);
  g.p(cx - 6, 17, 2, 1, sWH); g.p(cx + 4, 17, 2, 1, sWH);
  /* crude bone club (behind the right arm) */
  g.ell(cx + 14, 13, cx + 21, 21, BN, sK);
  g.p(cx + 16, 15, 2, 2, sWH);
  g.p(cx + 16, 21, 4, 24, BN);
  g.p(cx + 16, 21, 1, 24, sK); g.p(cx + 19, 21, 1, 24, sK);
  g.p(cx + 17, 26, 1, 1, '#8a7a58'); g.p(cx + 18, 33, 1, 1, '#8a7a58');
  /* broad hulking torso */
  g.p(cx - 15, 25, 30, 18, GB);
  g.p(cx - 15, 25, 30, 1, sK);
  g.p(cx - 15, 25, 1, 18, sK); g.p(cx + 14, 25, 1, 18, sK);
  g.p(cx - 14, 26, 2, 16, '#5a9c48');
  g.p(cx + 11, 26, 3, 16, GBs);
  /* ragged hide vest with a bone toggle */
  g.p(cx - 8, 27, 16, 16, '#7a5a34');
  g.p(cx - 8, 27, 16, 1, sK);
  g.p(cx - 8, 27, 1, 16, sK); g.p(cx + 7, 27, 1, 16, sK);
  g.p(cx + 4, 28, 3, 15, '#5a4024');
  g.p(cx - 2, 31, 4, 2, TK);
  /* thick arms with knuckly fists */
  for (s = -1; s <= 1; s += 2) {
    var x0 = s < 0 ? cx - 21 : cx + 15;
    g.p(x0, 25, 6, 17, GB);
    g.p(x0, 25, 6, 1, sK);
    g.p(x0, 25, 1, 17, sK); g.p(x0 + 5, 25, 1, 17, sK);
    g.p(x0 + (s < 0 ? 1 : 4), 27, 1, 13, GBs);
    g.p(x0, 42, 6, 4, GB);
    g.p(x0, 42, 1, 4, sK); g.p(x0 + 5, 42, 1, 4, sK);
    g.p(x0, 45, 6, 1, sK);
    g.p(x0 + 1, 43, 1, 1, GBk); g.p(x0 + 3, 43, 1, 1, GBk);
  }
  /* stumpy legs */
  g.p(cx - 9, 43, 7, 8, GB); g.p(cx + 2, 43, 7, 8, GB);
  g.p(cx - 9, 43, 1, 8, GBk); g.p(cx - 3, 43, 1, 8, GBk);
  g.p(cx + 2, 43, 1, 8, GBk); g.p(cx + 8, 43, 1, 8, GBk);
  /* big flat feet */
  g.p(cx - 11, 51, 10, 3, GB); g.p(cx + 1, 51, 10, 3, GB);
  g.p(cx - 11, 53, 10, 1, sK); g.p(cx + 1, 53, 10, 1, sK);
  g.p(cx - 11, 51, 1, 2, sK); g.p(cx + 10, 51, 1, 2, sK);
};

/* ---- overworld walkers ---- */
defWalker('legionary', {hat: sBZ, hair: sBZ, coat: '#9aa0ae', coatd: '#6e7480', accent: sRD});
defWalker('salesman', {hat: '#8b3ca8', hair: '#6a4a2a', coat: '#f0d838', coatd: '#c8a030', mous: sMC, accent: sRD});
defWalker('deejay', {hair: '#2a2028', coat: '#e07820', coatd: '#b05a14', hatShow: false, accent: '#4ff0ff'});
defWalker('skater', {hat: sRD, hair: '#8a5a2c', coat: sTE, coatd: sTEs, accent: sRD});
defWalker('goblinhex', {hat: '#5a3f88', hair: '#8a6ab8', coat: '#5a3f88', coatd: '#3e2a62', mous: '#3e2a62', accent: '#e070ff'});
defWalker('goblinbrute', {hair: '#4a8a3a', coat: '#4a8a3a', coatd: '#356828', mous: '#234a1a', accent: '#c8b48c', hatShow: false});
