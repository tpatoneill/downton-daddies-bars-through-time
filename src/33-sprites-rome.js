/* sprites-rome.js — Colosseum dungeon opponents/NPCs (Rome, 74 AD).
   Appends to the global SPR registry and WALK registry from 30-sprites.js.
   Reuses painter(), the shared body primitives, and the shared palette consts. */

/* Hypogeum Beast Handler — leather apron, arm wraps, coiled whip. Underground-worker vibe. */
SPR.beasthandler = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, s;
  var LE = '#6a4a2c', LEs = '#503620', LEh = '#84603a', TU = '#8a8a76', TUs = '#6a6a58', SCR = '#96283c';
  /* short cropped dark hair */
  g.ell(cx - 9, 6, cx + 9, 16, '#3a2a1a', sK);
  var ytop = _face(g, cx, 14), ey = ytop + 5;
  _eyes(g, cx, ey, true, 2); /* tired squint, heavy brows */
  g.p(cx - 6, ey + 3, 3, 1, sSD); g.p(cx + 4, ey + 3, 3, 1, sSD); /* eye bags */
  g.p(cx - 8, ytop + 2, 1, 4, SCR); /* old cheek scar */
  g.p(cx - 3, ytop + 11, 6, 1, sK); /* flat tough mouth */
  var sh = ytop + 15;
  /* drab work tunic */
  _coatBody(g, cx, sh, 53, TU, TUs, '#9c9c86', TU, false);
  /* heavy leather apron over the front */
  g.p(cx - 8, sh + 1, 16, 19, LE);
  g.p(cx - 8, sh + 1, 16, 1, sK);
  g.p(cx - 8, sh + 1, 1, 19, sK); g.p(cx + 7, sh + 1, 1, 19, sK);
  g.p(cx - 7, sh + 2, 2, 17, LEh);
  g.p(cx + 4, sh + 2, 3, 17, LEs);
  g.p(cx - 4, sh + 8, 3, 1, LEs); g.p(cx + 1, sh + 13, 3, 1, LEs); /* claw nicks */
  g.p(cx - 5, sh - 1, 2, 2, LEs); g.p(cx + 3, sh - 1, 2, 2, LEs); /* neck straps */
  /* bare scratched arms with leather wrist wraps */
  for (s = -1; s <= 1; s += 2) {
    var ax = s < 0 ? cx - 17 : cx + 13;
    g.p(ax, sh + 1, 5, 15, sSK);
    g.p(ax, sh + 1, 5, 1, sK);
    g.p(ax, sh + 1, 1, 15, sK); g.p(ax + 4, sh + 1, 1, 15, sK);
    g.p(ax + 1, sh + 4, 3, 1, SCR); /* scratches */
    g.p(ax + 1, sh + 7, 2, 1, SCR);
    g.p(ax + 1, sh + 10, 3, 3, LE); /* arm wrap */
    g.p(ax + 1, sh + 13, 3, 3, sSK); g.p(ax + 1, sh + 15, 3, 1, sSD);
  }
  /* coiled whip hanging by the right hand */
  g.eo(cx + 12, sh + 17, cx + 20, sh + 25, LEs);
  g.eo(cx + 13, sh + 18, cx + 19, sh + 24, LE);
  g.p(cx + 19, sh + 25, 2, 3, LEs); /* whip tail */
  _legs(g, cx, 53);
};

/* Gladiator Trainee — oversized bronze helmet tilted over the eyes, wooden rudis, padded arm. */
SPR.trainee = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var PAD = '#c8b48c', PADs = '#a08a60', WD = '#8a6a3c', WDs = '#6a4e28';
  var ytop = _face(g, cx, 14), ey = ytop + 6;
  /* oversized bronze galea, slumping down-left */
  g.ell(cx - 12, 2, cx + 11, 19, sBZ, sK);
  g.p(cx - 8, 4, 4, 3, '#d8b060'); /* shine */
  /* wee red crest, also crooked */
  g.p(cx - 4, 0, 8, 3, sRD); g.p(cx - 4, 0, 8, 1, sK);
  g.p(cx - 4, 0, 1, 3, sK); g.p(cx + 3, 0, 1, 3, sK);
  /* tilted brim: low over the left eye, riding up on the right */
  g.p(cx - 13, 17, 12, 5, sBZ);
  g.p(cx - 13, 17, 12, 1, sK); g.p(cx - 13, 21, 12, 1, sK);
  g.p(cx - 13, 17, 1, 5, sK);
  g.p(cx - 12, 20, 10, 1, sBZs);
  g.p(cx - 1, 15, 13, 4, sBZ);
  g.p(cx - 1, 15, 13, 1, sK); g.p(cx - 1, 18, 13, 1, sK);
  g.p(cx + 11, 15, 1, 4, sK);
  /* only the right eye peeks out from under the tilt */
  g.p(cx + 2, ey, 4, 4, sWH); g.p(cx + 3, ey + 1, 2, 2, sK);
  g.p(cx - 1, ey + 4, 2, 2, sSD);
  g.p(cx + 9, ey + 2, 1, 3, sGL); /* nervous sweat drop */
  _smile(g, cx, ytop + 13, true); /* big nervous grin */
  var sh = ytop + 17;
  /* quilted training tunic */
  _coatBody(g, cx, sh, 53, PAD, PADs, '#d8c8a0', PAD, false);
  for (i = 0; i < 4; i++) g.p(cx - 11, sh + 3 + i * 4, 22, 1, PADs); /* stitch rows */
  g.p(cx - 12, sh + 14, 24, 2, WDs); /* rope belt */
  /* left arm: extra-padded sparring sleeve */
  g.p(cx - 19, sh + 1, 7, 14, PAD);
  g.p(cx - 19, sh + 1, 7, 1, sK);
  g.p(cx - 19, sh + 1, 1, 14, sK); g.p(cx - 13, sh + 1, 1, 14, sK);
  g.p(cx - 18, sh + 4, 5, 1, PADs); g.p(cx - 18, sh + 8, 5, 1, PADs); g.p(cx - 18, sh + 12, 5, 1, PADs);
  g.p(cx - 17, sh + 15, 3, 3, sSK); g.p(cx - 17, sh + 17, 3, 1, sSD);
  /* right arm raised, gripping the wooden rudis */
  g.p(cx + 12, sh - 2, 5, 11, PAD);
  g.p(cx + 12, sh - 2, 5, 1, sK);
  g.p(cx + 12, sh - 2, 1, 11, sK); g.p(cx + 16, sh - 2, 1, 11, sK);
  g.p(cx + 13, sh - 5, 3, 3, sSK); /* fist */
  g.p(cx + 12, sh - 6, 6, 2, WDs); /* crossguard */
  g.p(cx + 12, sh - 6, 6, 1, sK);
  g.p(cx + 14, sh - 16, 2, 10, WD); /* wooden blade */
  g.p(cx + 14, sh - 16, 1, 10, WDs);
  g.p(cx + 14, sh - 17, 2, 1, sK);
  _legs(g, cx, 53);
};

/* Colosseum Bookmaker — toga, coin purse on belt, wax tablet + stylus, shifty eyes. */
SPR.bookmaker = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var TG = '#e8e8f0', TGs = '#c8c8d4', WD = '#8a6a3c', WDs = '#6a4e28', WAX = '#e0c860';
  /* slick dark hair, combed flat */
  g.ell(cx - 9, 6, cx + 9, 15, '#2a2028', sK);
  g.p(cx - 7, 8, 11, 1, '#4a3c44'); /* comb shine */
  var ytop = _face(g, cx, 13), ey = ytop + 5;
  /* shifty sideways eyes: pupils pushed hard left */
  g.p(cx - 6, ey, 4, 4, sWH); g.p(cx + 2, ey, 4, 4, sWH);
  g.p(cx - 6, ey + 1, 2, 2, sK); g.p(cx + 2, ey + 1, 2, 2, sK);
  g.p(cx - 7, ey - 3, 5, 1, sK); g.p(cx + 2, ey - 4, 5, 1, sK); /* one brow raised */
  g.p(cx - 1, ey + 4, 2, 2, sSD);
  /* slick lopsided smile */
  g.p(cx - 2, ytop + 12, 5, 1, sK); g.p(cx + 3, ytop + 11, 1, 1, sK);
  var sh = ytop + 16;
  /* toga with a gold hem */
  g.p(cx - 13, sh, 26, 24, TG);
  g.p(cx - 13, sh, 26, 1, sK); g.p(cx - 13, sh + 23, 26, 1, sK);
  g.p(cx - 13, sh, 1, 24, sK); g.p(cx + 12, sh, 1, 24, sK);
  for (i = 0; i < 4; i++) g.p(cx - 10 + i * 6, sh + 2, 1, 20, TGs); /* folds */
  g.p(cx - 12, sh + 21, 24, 2, sGD);
  /* belt with a fat coin purse */
  g.p(cx - 12, sh + 12, 24, 2, WDs);
  g.ell(cx + 6, sh + 13, cx + 12, sh + 20, WD, sK);
  g.p(cx + 8, sh + 13, 3, 1, WDs); /* drawstring */
  g.p(cx + 8, sh + 11, 3, 2, sGD); /* coin peeking from the purse mouth */
  g.p(cx + 9, sh + 12, 1, 1, sBZs);
  /* short sleeves, forearms in toward the tablet */
  _arms(g, cx, sh, 8, TG, false);
  g.p(cx - 14, sh + 9, 7, 3, sSK); g.p(cx + 8, sh + 9, 7, 3, sSK);
  g.p(cx - 14, sh + 9, 7, 1, sK); g.p(cx + 8, sh + 9, 7, 1, sK);
  g.p(cx - 9, sh + 10, 3, 4, sSK); g.p(cx + 5, sh + 10, 3, 4, sSK); /* hands */
  /* wax tablet held in front */
  g.p(cx - 8, sh + 8, 12, 9, WD);
  g.p(cx - 8, sh + 8, 12, 1, sK); g.p(cx - 8, sh + 16, 12, 1, sK);
  g.p(cx - 8, sh + 8, 1, 9, sK); g.p(cx + 3, sh + 8, 1, 9, sK);
  g.p(cx - 6, sh + 10, 8, 5, WAX);
  g.p(cx - 5, sh + 11, 5, 1, WDs); g.p(cx - 5, sh + 13, 4, 1, WDs); /* the odds */
  /* stylus sticking up from the right hand */
  g.p(cx + 6, sh + 4, 1, 6, sBZ); g.p(cx + 6, sh + 3, 1, 1, sGD);
  _legs(g, cx, 53);
};

/* Maximvs Superfan — half red / half gold face paint, banner on a stick, wild eyes, spiky hair. */
SPR.superfan = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var RD2 = '#c63a46', SPK = '#3a2a1a', BNR = '#e8e0c8', WD = '#8a6a3c';
  var ytop = 14, ey = ytop + 6, sh = ytop + 17;
  /* banner on a stick, waving behind the head (drawn first) */
  g.p(cx + 14, sh - 24, 2, 34, WD);
  g.p(cx - 1, sh - 24, 15, 8, BNR);
  g.p(cx - 1, sh - 24, 15, 1, sK); g.p(cx - 1, sh - 17, 15, 1, sK);
  g.p(cx - 1, sh - 24, 1, 8, sK);
  /* crude MAX daubed in red */
  g.p(cx, sh - 22, 1, 4, RD2); g.p(cx + 2, sh - 22, 1, 4, RD2); g.p(cx + 1, sh - 21, 1, 1, RD2);
  g.p(cx + 4, sh - 22, 1, 4, RD2); g.p(cx + 6, sh - 22, 1, 4, RD2);
  g.p(cx + 5, sh - 22, 1, 1, RD2); g.p(cx + 5, sh - 20, 1, 1, RD2);
  g.p(cx + 8, sh - 22, 1, 1, RD2); g.p(cx + 10, sh - 22, 1, 1, RD2);
  g.p(cx + 9, sh - 21, 1, 2, RD2);
  g.p(cx + 8, sh - 19, 1, 1, RD2); g.p(cx + 10, sh - 19, 1, 1, RD2);
  /* spiky hair */
  g.ell(cx - 9, 7, cx + 9, 16, SPK, sK);
  var sxs = [cx - 9, cx - 5, cx - 1, cx + 3, cx + 7];
  for (i = 0; i < 5; i++) { g.p(sxs[i], 3, 3, 5, SPK); g.p(sxs[i] + 1, 1, 1, 2, SPK); }
  _face(g, cx, ytop);
  /* face paint: half red / half gold, split down the middle */
  g.p(cx - 8, ytop + 1, 8, 12, RD2); g.p(cx, ytop + 1, 8, 12, sGD);
  g.p(cx - 9, ytop + 3, 1, 8, RD2); g.p(cx + 8, ytop + 3, 1, 8, sGD);
  g.p(cx - 7, ytop + 13, 7, 1, RD2); g.p(cx, ytop + 13, 7, 1, sGD);
  /* wild happy eyes */
  g.ell(cx - 8, ey - 1, cx - 2, ey + 4, sWH, sK);
  g.ell(cx + 2, ey - 1, cx + 8, ey + 4, sWH, sK);
  g.p(cx - 5, ey + 1, 2, 2, sK); g.p(cx + 4, ey + 1, 2, 2, sK);
  g.p(cx - 1, ey + 5, 2, 1, sSD);
  /* huge open cheer */
  g.p(cx - 5, ytop + 12, 10, 3, sK);
  g.p(cx - 4, ytop + 12, 8, 1, sWH);
  /* two-tone tunic matching the paint job */
  g.p(cx - 12, sh, 12, 22, RD2); g.p(cx, sh, 12, 22, sGD);
  g.p(cx - 12, sh, 24, 1, sK); g.p(cx - 12, sh + 21, 24, 1, sK);
  g.p(cx - 12, sh, 1, 22, sK); g.p(cx + 11, sh, 1, 22, sK);
  g.p(cx - 11, sh + 1, 2, 20, '#d84c58');
  g.p(cx + 9, sh + 1, 2, 20, sBZs);
  /* left arm: bare, pumping a fist */
  g.p(cx - 16, sh - 8, 4, 11, sSK);
  g.p(cx - 16, sh - 8, 1, 11, sK); g.p(cx - 13, sh - 8, 1, 11, sK);
  g.p(cx - 17, sh - 12, 5, 4, sSK);
  g.p(cx - 17, sh - 12, 5, 1, sK); g.p(cx - 17, sh - 12, 1, 4, sK); g.p(cx - 13, sh - 12, 1, 4, sK);
  g.p(cx - 16, sh - 9, 3, 1, sSD);
  /* right arm gripping the banner pole */
  g.p(cx + 12, sh + 1, 5, 9, sSK);
  g.p(cx + 12, sh + 1, 5, 1, sK);
  g.p(cx + 12, sh + 1, 1, 9, sK); g.p(cx + 16, sh + 1, 1, 9, sK);
  g.p(cx + 13, sh + 8, 3, 3, sSK); g.p(cx + 13, sh + 10, 3, 1, sSD);
  _legs(g, cx, 53);
};

/* Theater Critic — older, severe, thin; precise toga, half-unrolled scroll, wire-rim glasses. */
SPR.critic = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i, s;
  var TG = '#e8e8f0', TGs = '#c8c8d4', SCL = '#e8e0c8', SCLp = '#f4ecd8';
  /* long thin face, bald dome */
  g.ell(cx - 7, 6, cx + 7, 27, sSK, sK);
  g.p(cx - 5, 24, 10, 2, sSD);
  /* receding gray hair: side tufts + one loyal wisp */
  g.p(cx - 9, 13, 3, 6, sBE); g.p(cx + 6, 13, 3, 6, sBE);
  g.p(cx - 9, 13, 3, 1, sK); g.p(cx + 6, 13, 3, 1, sK);
  g.p(cx - 9, 18, 3, 1, sBEs); g.p(cx + 6, 18, 3, 1, sBEs);
  g.p(cx - 4, 6, 5, 1, sBE);
  var ey = 14;
  _eyes(g, cx, ey, false, 1);
  g.p(cx - 6, ey, 4, 1, sSD); g.p(cx + 2, ey, 4, 1, sSD); /* half-lidded, unimpressed */
  _glasses(g, cx, ey);
  g.p(cx - 5, 21, 1, 2, sSD); g.p(cx + 4, 21, 1, 2, sSD); /* gaunt cheeks */
  /* the frown of a man watching act three fall apart */
  g.p(cx - 3, 23, 6, 1, sK);
  g.p(cx - 4, 24, 1, 1, sK); g.p(cx + 3, 24, 1, 1, sK);
  var sh = 28;
  /* narrow toga, draped with terrifying precision */
  g.p(cx - 10, sh, 20, 25, TG);
  g.p(cx - 10, sh, 20, 1, sK); g.p(cx - 10, sh + 24, 20, 1, sK);
  g.p(cx - 10, sh, 1, 25, sK); g.p(cx + 9, sh, 1, 25, sK);
  for (i = 0; i < 4; i++) g.p(cx - 7 + i * 4, sh + 2, 1, 22, TGs); /* ruler-straight folds */
  g.p(cx + 5, sh + 1, 2, 23, '#96283c'); /* severe maroon stripe */
  /* thin arms */
  for (s = -1; s <= 1; s += 2) {
    var ax = s < 0 ? cx - 14 : cx + 11;
    g.p(ax, sh + 1, 3, 14, TG);
    g.p(ax, sh + 1, 3, 1, sK);
    g.p(ax + (s < 0 ? 0 : 2), sh + 1, 1, 14, sK);
    g.p(ax + (s < 0 ? 2 : 0), sh + 1, 1, 14, sK);
    g.p(ax, sh + 15, 3, 3, sSK); g.p(ax, sh + 17, 3, 1, sSD);
  }
  /* scroll, half-unrolled: the review is not going well */
  g.p(cx + 9, sh + 13, 8, 3, SCL);
  g.p(cx + 9, sh + 13, 8, 1, sK); g.p(cx + 9, sh + 15, 8, 1, sK);
  g.p(cx + 9, sh + 13, 1, 3, sK); g.p(cx + 16, sh + 13, 1, 3, sK);
  g.p(cx + 10, sh + 16, 6, 9, SCLp);
  g.p(cx + 10, sh + 16, 1, 9, sK); g.p(cx + 15, sh + 16, 1, 9, sK);
  g.p(cx + 10, sh + 24, 6, 1, sK);
  g.p(cx + 11, sh + 18, 4, 1, sBKs); g.p(cx + 11, sh + 20, 4, 1, sBKs); g.p(cx + 11, sh + 22, 3, 1, sBKs);
  _legs(g, cx, 53);
};

/* ---- overworld walkers ---- */
defWalker('beasthandler', {hair: '#3a2a1a', coat: '#6a4a2c', coatd: '#503620', hatShow: false, accent: '#96283c'});
defWalker('trainee', {hat: sBZ, hair: '#6a4a2a', coat: '#c8b48c', coatd: '#a08a60', accent: sRD});
defWalker('bookmaker', {hair: '#2a2028', coat: '#e8e8f0', coatd: '#c8c8d4', hatShow: false, accent: sGD});
defWalker('superfan', {hair: '#3a2a1a', coat: '#c63a46', coatd: '#96283c', hatShow: false, accent: sGD});
defWalker('critic', {hair: sBE, coat: '#e8e8f0', coatd: '#c8c8d4', hatShow: false, accent: '#96283c'});
