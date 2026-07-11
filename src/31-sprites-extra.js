/* sprites-extra.js — additional battle/dialogue sprites + overworld walkers.
   Appends to the global SPR registry and WALK registry from 30-sprites.js.
   Reuses painter(), the shared body primitives, and the shared palette consts. */

/* Goblin — small mischievous cave goblin, ~40px tall (clearly shorter than a Daddy). */
SPR.goblin = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var GB = '#5aa84a', GBs = '#3f7f36', GBk = '#2e5f28', YE = '#f0d838';
  /* tiny horn nubs */
  g.p(cx - 6, 19, 2, 3, sBEs); g.p(cx + 4, 19, 2, 3, sBEs);
  g.p(cx - 6, 19, 2, 1, sK); g.p(cx + 4, 19, 2, 1, sK);
  /* big pointy ears */
  g.p(cx - 15, 27, 6, 3, GB); g.p(cx - 18, 26, 3, 2, GB); g.p(cx - 18, 25, 2, 1, GBk);
  g.p(cx - 15, 29, 6, 1, GBs);
  g.p(cx + 9, 27, 6, 3, GB); g.p(cx + 15, 26, 3, 2, GB); g.p(cx + 16, 25, 2, 1, GBk);
  g.p(cx + 9, 29, 6, 1, GBs);
  /* head */
  g.ell(cx - 9, 21, cx + 9, 37, GB, GBk);
  g.p(cx - 6, 35, 12, 1, GBs);
  /* big round yellow eyes, tiny pupils */
  g.ell(cx - 7, 24, cx - 2, 29, YE, sK);
  g.ell(cx + 2, 24, cx + 7, 29, YE, sK);
  g.p(cx - 4, 26, 1, 1, sK); g.p(cx + 4, 26, 1, 1, sK);
  /* wide devilish grin with fangs */
  g.p(cx - 6, 32, 12, 1, sK);
  g.p(cx - 7, 31, 1, 1, sK); g.p(cx + 6, 31, 1, 1, sK);
  g.p(cx - 5, 33, 10, 2, GBk);
  g.p(cx - 4, 33, 1, 2, sWH); g.p(cx - 1, 33, 1, 2, sWH); g.p(cx + 3, 33, 1, 2, sWH);
  /* raggedy tunic with jagged hem */
  g.p(cx - 8, 38, 16, 10, '#8a6a3c');
  g.p(cx - 8, 38, 16, 1, sK); g.p(cx - 8, 38, 1, 10, sK); g.p(cx + 7, 38, 1, 10, sK);
  g.p(cx + 4, 39, 3, 9, '#6a4e2a');
  g.p(cx - 8, 48, 3, 2, '#8a6a3c'); g.p(cx - 2, 48, 3, 2, '#8a6a3c'); g.p(cx + 4, 48, 3, 2, '#8a6a3c');
  g.p(cx - 8, 49, 3, 1, sK); g.p(cx - 2, 49, 3, 1, sK); g.p(cx + 4, 49, 3, 1, sK);
  /* rope belt */
  g.p(cx - 8, 43, 16, 1, '#5a462a');
  /* skinny arms with grabby claws */
  var s, ax;
  for (s = -1; s <= 1; s += 2) {
    ax = s < 0 ? cx - 12 : cx + 9;
    g.p(ax, 39, 3, 9, GB);
    g.p(ax + (s < 0 ? 0 : 2), 39, 1, 9, GBk);
    g.p(ax, 48, 3, 2, GB);
    g.p(ax, 49, 1, 1, sK); g.p(ax + 2, 49, 1, 1, sK);
  }
  /* short legs, bare toed feet */
  g.p(cx - 6, 50, 4, 7, GB); g.p(cx + 2, 50, 4, 7, GB);
  g.p(cx - 6, 50, 1, 7, GBk); g.p(cx + 5, 50, 1, 7, GBk);
  g.p(cx - 8, 57, 7, 2, GB); g.p(cx + 1, 57, 7, 2, GB);
  g.p(cx - 8, 58, 7, 1, sK); g.p(cx + 1, 58, 7, 1, sK);
  g.p(cx - 8, 57, 1, 1, sK); g.p(cx + 7, 57, 1, 1, sK);
};

/* Pedro Garcia — revolutionary baker. Peaked cap, bandolier, apron, baguette. */
SPR.pedro = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var OL = '#6a7a3c', OLs = '#4e5c2c', OLh = '#82944c', BAG = '#d8a860', BAGs = '#b07830';
  /* military peaked cap with gold star */
  g.p(cx - 9, 5, 18, 7, OL);
  g.p(cx - 9, 5, 18, 1, sK); g.p(cx - 9, 5, 1, 7, sK); g.p(cx + 8, 5, 1, 7, sK);
  g.p(cx - 8, 6, 2, 5, OLh);
  g.p(cx - 9, 10, 18, 2, OLs);
  g.p(cx - 7, 12, 14, 2, '#3a4420'); g.p(cx - 7, 13, 14, 1, sK);
  g.p(cx - 1, 7, 3, 3, sGD);
  var ytop = _face(g, cx, 16), ey = ytop + 6;
  /* black hair at the temples */
  g.p(cx - 9, ytop + 1, 2, 6, sBK); g.p(cx + 7, ytop + 1, 2, 6, sBK);
  _eyes(g, cx, ey, false, 1);
  /* thick black mustache, warm smile beneath */
  g.p(cx - 6, ytop + 11, 12, 3, sBK);
  g.p(cx - 7, ytop + 13, 2, 2, sBK); g.p(cx + 5, ytop + 13, 2, 2, sBK);
  g.p(cx - 2, ytop + 15, 4, 1, sK);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, OL, OLs, OLh, sWH, false);
  /* white baker's apron */
  g.p(cx - 8, sh + 6, 16, 14, sWH);
  g.p(cx - 8, sh + 6, 16, 1, sK); g.p(cx - 8, sh + 6, 1, 14, sK); g.p(cx + 7, sh + 6, 1, 14, sK);
  g.p(cx + 4, sh + 8, 2, 11, '#d8d8e0');
  g.p(cx - 5, sh + 1, 1, 5, sWH); g.p(cx + 4, sh + 1, 1, 5, sWH);
  /* bandolier of bullets crossed over the chest */
  var i;
  for (i = 0; i < 5; i++) {
    g.p(cx - 9 + i * 4, sh + 8 - i * 2, 4, 3, '#8a5a2c');
    g.p(cx - 8 + i * 4, sh + 9 - i * 2, 1, 2, sGD);
    g.p(cx - 6 + i * 4, sh + 9 - i * 2, 1, 2, sGD);
  }
  /* rolled sleeves: olive upper arm, bare forearm */
  var s, ax, x0;
  for (s = -1; s <= 1; s += 2) {
    ax = cx + s * 13 + (s < 0 ? 0 : -1); x0 = s > 0 ? ax : ax - 4;
    g.p(x0, sh + 1, 5, 8, OL);
    g.p(x0, sh + 1, 5, 1, sK);
    g.p(x0 + (s < 0 ? 0 : 4), sh + 1, 1, 8, sK);
    g.p(x0 + (s < 0 ? 4 : 0), sh + 1, 1, 8, sK);
    g.p(x0, sh + 8, 5, 1, OLs);
    g.p(x0 + 1, sh + 9, 3, 8, sSK);
    g.p(x0 + 1, sh + 15, 3, 2, sSD);
  }
  /* baguette tucked at his side */
  g.p(cx + 16, sh + 3, 3, 17, BAG);
  g.p(cx + 16, sh + 3, 3, 1, sK); g.p(cx + 16, sh + 19, 3, 1, sK);
  g.p(cx + 16, sh + 3, 1, 17, sK); g.p(cx + 18, sh + 3, 1, 17, sK);
  g.p(cx + 17, sh + 6, 1, 1, BAGs); g.p(cx + 17, sh + 10, 1, 1, BAGs); g.p(cx + 17, sh + 14, 1, 1, BAGs);
  _legs(g, cx, 53);
};

/* Slick music mogul — dark shades, glossy navy suit, gold chain, smirk. */
SPR.pdiddy = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var NV = '#1e2a4a', NVs = '#141c34', NVh = '#31456f';
  var ytop = _face(g, cx, 10), ey = ytop + 6;
  /* close-cropped hair */
  g.p(cx - 8, ytop - 2, 16, 3, sBK);
  g.p(cx - 9, ytop, 2, 4, sBK); g.p(cx + 7, ytop, 2, 4, sBK);
  /* dark sunglasses with a cool glint */
  g.p(cx - 8, ey - 1, 7, 4, sK); g.p(cx + 1, ey - 1, 7, 4, sK);
  g.p(cx - 1, ey, 2, 1, sK);
  g.p(cx - 7, ey, 2, 1, '#5a5a72'); g.p(cx + 2, ey, 2, 1, '#5a5a72');
  /* confident smirk + trim goatee */
  g.p(cx - 2, ytop + 13, 5, 1, sK); g.p(cx + 3, ytop + 12, 1, 1, sK);
  g.p(cx - 3, ytop + 15, 6, 1, sBK);
  var sh = ytop + 17;
  _coatBody(g, cx, sh, 53, NV, NVs, NVh, '#16161e');
  /* glossy sheen streaks */
  g.p(cx - 9, sh + 3, 1, 12, NVh); g.p(cx + 6, sh + 5, 1, 10, '#3d548a');
  /* subtle gold chain over the dark shirt */
  g.p(cx - 3, sh + 2, 1, 2, sGD); g.p(cx + 2, sh + 2, 1, 2, sGD);
  g.p(cx - 2, sh + 4, 4, 1, sGD); g.p(cx - 1, sh + 5, 2, 2, sGD);
  _arms(g, cx, sh, 17, NV);
  /* pocket square */
  g.p(cx + 7, sh + 6, 3, 2, sWH);
  _legs(g, cx, 53);
};

/* Muscular rapper — do-rag, white tank, big arms, calm tough expression. */
SPR.fiftycent = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var DR = '#2a2a3a', DRh = '#3c3c54';
  var ytop = _face(g, cx, 13), ey = ytop + 5;
  /* do-rag hugging the skull, tie tail at the back */
  g.p(cx - 9, 8, 18, 7, DR);
  g.p(cx - 9, 8, 18, 1, sK); g.p(cx - 9, 8, 1, 7, sK); g.p(cx + 8, 8, 1, 7, sK);
  g.p(cx - 8, 9, 2, 5, DRh);
  g.p(cx + 9, 12, 3, 6, DR); g.p(cx + 10, 18, 2, 3, DR);
  g.p(cx + 11, 12, 1, 6, sK);
  _eyes(g, cx, ey, true, 2);
  g.p(cx - 3, ytop + 12, 6, 1, sK); /* calm flat mouth */
  var sh = ytop + 16;
  /* broad tank-top torso */
  g.p(cx - 15, sh, 30, 24, sWH);
  g.p(cx - 15, sh, 30, 1, sK); g.p(cx - 15, sh + 23, 30, 1, sK);
  g.p(cx - 15, sh, 1, 24, sK); g.p(cx + 14, sh, 1, 24, sK);
  g.p(cx + 10, sh + 1, 4, 22, '#d8d8e0');
  g.p(cx - 14, sh + 1, 2, 22, '#ffffff');
  /* small gold chain */
  g.p(cx - 4, sh + 1, 1, 2, sGD); g.p(cx + 3, sh + 1, 1, 2, sGD);
  g.p(cx - 3, sh + 3, 2, 1, sGD); g.p(cx + 1, sh + 3, 2, 1, sGD);
  g.p(cx - 1, sh + 4, 2, 2, sGD);
  /* big sleeveless arms */
  var s, x0;
  for (s = -1; s <= 1; s += 2) {
    x0 = s < 0 ? cx - 21 : cx + 15;
    g.ell(x0, sh - 1, x0 + 6, sh + 6, sSK, sK);
    g.p(x0 + 1, sh + 5, 5, 11, sSK);
    g.p(x0 + (s < 0 ? 0 : 5), sh + 5, 1, 11, sK);
    g.p(x0 + (s < 0 ? 5 : 1), sh + 5, 1, 11, sK);
    g.p(x0 + (s < 0 ? 1 : 4), sh + 7, 1, 6, sSD);
    g.p(x0 + 1, sh + 16, 4, 3, sSK); g.p(x0 + 1, sh + 18, 4, 1, sSD);
  }
  _legs(g, cx, 53);
};

/* ---- overworld walkers ---- */
defWalker('goblin', {hat: '#3f7f36', hair: '#5aa84a', coat: '#3f7f36', coatd: '#2e5f28', mous: '#2e5f28', accent: '#f0d838', hatShow: false});
defWalker('pedro', {hat: '#6a7a3c', hair: sBK, coat: '#6a7a3c', coatd: '#4e5c2c', mous: sBK, accent: sGD});
