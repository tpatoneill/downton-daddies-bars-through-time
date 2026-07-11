/* sprites-west.js — Old West opponents/NPCs (Old West, 1878).
   Appends to the global SPR registry and WALK registry from 30-sprites.js.
   Reuses painter(), the shared body primitives, and the shared palette consts. */

/* Train Bandit — black flat-brim hat, red bandana over the nose, dark duster, lasso coil. */
SPR.bandit = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, s;
  var HT = '#22202a', HTs = '#34303e', DU = '#3a3440', DUs = '#2a2630', DUh = '#4a4454', BN = '#c63a46', BNs = '#96283c';
  /* flat-crowned black hat, wide brim */
  g.p(cx - 9, 3, 18, 8, HT);
  g.p(cx - 9, 3, 18, 1, sK);
  g.p(cx - 9, 3, 1, 8, sK); g.p(cx + 8, 3, 1, 8, sK);
  g.p(cx - 8, 4, 2, 6, HTs);
  g.p(cx - 8, 8, 16, 2, BNs); /* hat band */
  g.p(cx - 15, 11, 30, 3, HT);
  g.p(cx - 15, 11, 30, 1, sK); g.p(cx - 15, 13, 30, 1, sK);
  g.p(cx - 15, 11, 1, 3, sK); g.p(cx + 14, 11, 1, 3, sK);
  var ytop = _face(g, cx, 15), ey = ytop + 5;
  /* hard eyes under the brim */
  _eyes(g, cx, ey, false, 2);
  /* red bandana over nose and mouth, knotted at the side */
  g.p(cx - 9, ey + 4, 18, 9, BN);
  g.p(cx - 9, ey + 4, 18, 1, sK);
  g.p(cx - 9, ey + 4, 1, 9, sK); g.p(cx + 8, ey + 4, 1, 9, sK);
  g.p(cx - 7, ey + 6, 4, 1, BNs); g.p(cx + 1, ey + 8, 5, 1, BNs); /* folds */
  g.p(cx - 3, ey + 10, 6, 1, BNs);
  g.p(cx + 8, ey + 5, 4, 4, BN); /* side knot */
  g.p(cx + 9, ey + 9, 2, 4, BN); g.p(cx + 9, ey + 9, 1, 4, BNs); /* knot tail */
  var sh = ytop + 15;
  /* long dark duster over a gray shirt */
  _coatBody(g, cx, sh, 53, DU, DUs, DUh, '#8a8a96', true);
  g.p(cx - 12, sh + 12, 24, 2, '#503620'); /* gun-less belt: holds rhymes */
  g.p(cx + 3, sh + 11, 4, 4, sBZ); g.p(cx + 4, sh + 12, 2, 2, sBZs); /* big buckle */
  _arms(g, cx, sh, 15, DU);
  /* lasso coil hooked at the left hip */
  g.eo(cx - 21, sh + 14, cx - 12, sh + 23, '#6a4e28');
  g.eo(cx - 20, sh + 15, cx - 13, sh + 22, '#8a6a3c');
  g.p(cx - 14, sh + 23, 2, 3, '#6a4e28'); /* rope tail */
  _legs(g, cx, 53);
};

/* Grizzled Prospector — floppy hat, enormous gray beard, patched overalls,
   pickaxe over the shoulder, beloved rock ("Gertrude") cradled in one hand. */
SPR.prospector = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var HT = '#8a6a3a', HTs = '#6e5430', BD = '#c8c8d0', BDs = '#a0a0ac', OV = '#4a5a72', OVs = '#3a4658', SH2 = '#8a5a3a', RK = '#8a8a90', RKs = '#6a6a72';
  /* pickaxe over the right shoulder (drawn first, behind the body) */
  g.p(cx + 8, 20, 2, 26, '#8a6a3c');
  g.p(cx + 8, 20, 1, 26, '#6a4e28');
  g.p(cx + 1, 16, 16, 3, '#7a7a84'); /* iron head */
  g.p(cx + 1, 16, 16, 1, sK); g.p(cx + 1, 18, 16, 1, sK);
  g.p(cx - 1, 17, 2, 4, '#7a7a84'); g.p(cx + 17, 17, 2, 4, '#7a7a84'); /* drooping picks */
  /* floppy shapeless hat */
  g.ell(cx - 11, 4, cx + 11, 14, HT, sK);
  g.p(cx - 13, 11, 26, 3, HT);
  g.p(cx - 13, 11, 26, 1, sK); g.p(cx - 13, 13, 26, 1, sK);
  g.p(cx - 8, 6, 5, 2, HTs); /* dents */
  g.p(cx + 2, 9, 6, 1, HTs);
  var ytop = _face(g, cx, 15), ey = ytop + 5;
  _eyes(g, cx, ey, true, 2); /* sun-squint */
  g.p(cx - 8, ey + 2, 2, 1, sSD); g.p(cx + 6, ey + 2, 2, 1, sSD); /* crow's feet */
  /* the beard: huge, gray, load-bearing */
  g.ell(cx - 9, ey + 4, cx + 9, ey + 22, BD, sK);
  g.p(cx - 6, ey + 7, 3, 1, BDs); g.p(cx + 3, ey + 9, 4, 1, BDs);
  g.p(cx - 2, ey + 12, 4, 1, BDs); g.p(cx - 5, ey + 16, 3, 1, BDs);
  g.p(cx - 2, ey + 5, 4, 2, '#7a5a4a'); /* weathered nose pokes out */
  var sh = ytop + 17;
  /* red flannel shirt under blue overalls */
  _coatBody(g, cx, sh, 53, SH2, '#6e4630', '#a06a46', SH2, false);
  g.p(cx - 8, sh + 6, 16, 16, OV); /* overall bib */
  g.p(cx - 8, sh + 6, 16, 1, sK);
  g.p(cx - 8, sh + 6, 1, 16, sK); g.p(cx + 7, sh + 6, 1, 16, sK);
  g.p(cx - 7, sh + 7, 2, 14, '#5a6a84');
  g.p(cx + 4, sh + 7, 3, 14, OVs);
  g.p(cx - 7, sh - 1, 3, 8, OV); g.p(cx + 4, sh - 1, 3, 8, OV); /* straps */
  g.p(cx - 6, sh + 6, 1, 1, sGD); g.p(cx + 5, sh + 6, 1, 1, sGD); /* brass buttons */
  g.p(cx - 4, sh + 12, 5, 5, OVs); /* patch */
  g.p(cx - 4, sh + 12, 5, 1, sK); g.p(cx - 4, sh + 16, 5, 1, sK);
  /* left arm cradling Gertrude; right arm up gripping the pickaxe handle */
  g.p(cx - 18, sh + 2, 5, 12, SH2);
  g.p(cx - 18, sh + 2, 5, 1, sK);
  g.p(cx - 18, sh + 2, 1, 12, sK); g.p(cx - 14, sh + 2, 1, 12, sK);
  g.p(cx - 17, sh + 14, 3, 3, sSK); g.p(cx - 17, sh + 16, 3, 1, sSD);
  g.ell(cx - 20, sh + 15, cx - 12, sh + 21, RK, sK); /* Gertrude */
  g.p(cx - 17, sh + 17, 3, 1, RKs); g.p(cx - 15, sh + 19, 2, 1, RKs);
  g.p(cx + 12, sh + 1, 5, 10, SH2);
  g.p(cx + 12, sh + 1, 5, 1, sK);
  g.p(cx + 12, sh + 1, 1, 10, sK); g.p(cx + 16, sh + 1, 1, 10, sK);
  g.p(cx + 13, sh - 2, 3, 3, sSK); /* fist on the handle */
  _legs(g, cx, 53);
};

/* Quick-Draw Granny — gray bun, wire glasses, fringed shawl, knitting needles
   crossed at the ready like six-shooters. */
SPR.granny = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i, s;
  var HR = '#c8c8d0', HRs = '#a0a0ac', SW = '#7a5a7a', SWs = '#5e4460', SWh = '#94709a', DR = '#4a5a72', ND = '#c49446';
  /* silver hair with a tight bun on top */
  g.ell(cx - 9, 8, cx + 9, 18, HR, sK);
  g.ell(cx - 4, 2, cx + 4, 9, HR, sK);
  g.p(cx - 2, 4, 3, 1, HRs); g.p(cx - 6, 11, 4, 1, HRs); g.p(cx + 3, 12, 4, 1, HRs);
  g.p(cx - 1, 1, 2, 2, ND); /* a spare needle stuck through the bun */
  var ytop = _face(g, cx, 16), ey = ytop + 5;
  _eyes(g, cx, ey, false, 1);
  _glasses(g, cx, ey);
  g.p(cx - 6, ytop + 10, 2, 1, sSD); g.p(cx + 4, ytop + 10, 2, 1, sSD); /* cheek lines */
  g.p(cx - 2, ytop + 12, 5, 1, sK); /* small knowing smile */
  g.p(cx + 3, ytop + 11, 1, 1, sK);
  var sh = ytop + 15;
  /* long prairie dress under a fringed shawl */
  _coatBody(g, cx, sh, 53, DR, '#3a4658', '#5a6a84', DR, false, true);
  g.p(cx - 13, sh, 26, 12, SW); /* shawl */
  g.p(cx - 13, sh, 26, 1, sK);
  g.p(cx - 13, sh, 1, 12, sK); g.p(cx + 12, sh, 1, 12, sK);
  g.p(cx - 12, sh + 1, 2, 10, SWh);
  g.p(cx + 9, sh + 1, 3, 10, SWs);
  for (i = 0; i < 9; i++) g.p(cx - 12 + i * 3, sh + 12, 1, 3, SW); /* fringe */
  g.p(cx - 3, sh + 2, 6, 3, SWs); /* knot at the collar */
  /* both arms drawn, needles crossed in front: the quick-draw stance */
  for (s = -1; s <= 1; s += 2) {
    var ax = s < 0 ? cx - 17 : cx + 12;
    g.p(ax, sh + 3, 5, 10, SW);
    g.p(ax, sh + 3, 5, 1, sK);
    g.p(ax, sh + 3, 1, 10, sK); g.p(ax + 4, sh + 3, 1, 10, sK);
    g.p(ax + 1, sh + 13, 3, 3, sSK); g.p(ax + 1, sh + 15, 3, 1, sSD);
  }
  g.p(cx - 14, sh + 13, 12, 1, ND); g.p(cx - 3, sh + 12, 1, 1, ND); /* needle, angled */
  g.p(cx + 2, sh + 13, 12, 1, ND); g.p(cx + 2, sh + 12, 1, 1, ND);  /* needle, crossed */
  g.p(cx - 15, sh + 12, 2, 2, sK); g.p(cx + 13, sh + 12, 2, 2, sK); /* needle caps */
  /* dangling yarn ball */
  g.ell(cx + 12, sh + 18, cx + 18, sh + 24, sRD, sK);
  g.p(cx + 13, sh + 20, 4, 1, '#96283c'); g.p(cx + 14, sh + 22, 3, 1, '#96283c');
  g.p(cx + 14, sh + 14, 1, 4, sRD); /* the strand */
  _legs(g, cx, 53);
};

/* Card Sharp — riverboat gambler: slick hair, pencil mustache, dark vest,
   string tie, a fan of cards where a pistol would be. */
SPR.cardsharp = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var VS = '#4a3040', VSs = '#382430', VSh = '#5c3e52', HRC = '#2a2028';
  /* slick center-parted hair */
  g.ell(cx - 9, 6, cx + 9, 15, HRC, sK);
  g.p(cx, 7, 1, 6, '#4a3c44'); /* the part */
  g.p(cx - 7, 8, 5, 1, '#4a3c44');
  var ytop = _face(g, cx, 13), ey = ytop + 5;
  /* one brow cocked, appraising eyes */
  g.p(cx - 6, ey, 4, 4, sWH); g.p(cx + 2, ey, 4, 4, sWH);
  g.p(cx - 5, ey + 1, 2, 2, sK); g.p(cx + 3, ey + 1, 2, 2, sK);
  g.p(cx - 7, ey - 3, 5, 1, sK); g.p(cx + 2, ey - 5, 5, 1, sK);
  g.p(cx - 1, ey + 4, 2, 2, sSD);
  /* pencil mustache + sliver of a smile */
  g.p(cx - 4, ytop + 10, 9, 1, HRC);
  g.p(cx - 2, ytop + 12, 5, 1, sK); g.p(cx + 3, ytop + 11, 1, 1, sK);
  var sh = ytop + 16;
  /* white shirt, dark vest, string tie */
  _coatBody(g, cx, sh, 53, VS, VSs, VSh, sWH, true);
  g.p(cx - 1, sh + 1, 2, 2, sK); /* tie knot */
  g.p(cx - 1, sh + 3, 1, 8, sK); g.p(cx, sh + 3, 1, 8, sK); /* string tails */
  g.p(cx - 5, sh + 8, 2, 1, sGD); /* watch chain, swagged */
  g.p(cx - 3, sh + 9, 2, 1, sGD); g.p(cx - 1, sh + 10, 2, 1, sGD);
  g.p(cx + 1, sh + 9, 2, 1, sGD); g.p(cx + 3, sh + 8, 2, 1, sGD);
  g.ell(cx + 4, sh + 9, cx + 7, sh + 12, sGD, sK); /* pocket watch */
  _arms(g, cx, sh, 13, VS);
  /* left hand: a crisp fan of five cards */
  for (i = 0; i < 5; i++) {
    var fx = cx - 22 + i * 3;
    g.p(fx, sh + 10 - i, 5, 8, sWH);
    g.p(fx, sh + 10 - i, 5, 1, sK);
    g.p(fx, sh + 10 - i, 1, 8, sK); g.p(fx + 4, sh + 10 - i, 1, 8, sK);
    g.p(fx + 4, sh + 17 - i, 1, 1, sK);
  }
  g.p(cx - 21, sh + 12, 1, 2, sRD); g.p(cx - 15, sh + 9, 1, 2, sK); /* pips */
  g.p(cx - 9, sh + 7, 1, 2, sRD);
  /* right hand: one card held back, face down of course */
  g.p(cx + 13, sh + 12, 6, 8, '#96283c');
  g.p(cx + 13, sh + 12, 6, 1, sK); g.p(cx + 13, sh + 19, 6, 1, sK);
  g.p(cx + 13, sh + 12, 1, 8, sK); g.p(cx + 18, sh + 12, 1, 8, sK);
  g.p(cx + 14, sh + 14, 4, 4, '#b04652'); /* filigree back */
  _legs(g, cx, 53);
};

/* ---- overworld walkers ---- */
defWalker('bandit', {hat: '#22202a', hair: '#2a2028', coat: '#3a3440', accent: '#c63a46'});
defWalker('prospector', {hat: '#8a6a3a', hair: sBE, coat: '#4a5a72', mous: sBE});
defWalker('granny', {hair: '#c8c8d0', coat: '#7a5a7a', hatShow: false, accent: sRD});
defWalker('cardsharp', {hat: '#2c303c', hair: '#2a2028', coat: '#4a3040', accent: sGD});
defWalker('stationmaster', {hat: '#26324a', hair: '#3a2a1a', coat: '#26324a', accent: sGD});
defWalker('conductor', {hat: '#1e2a40', hair: '#4a3a2a', coat: '#2e3a54', accent: sGD, mous: sBE});
