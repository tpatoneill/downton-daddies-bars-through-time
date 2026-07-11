/* sprites-nyc.js — Second City in exile (NYC, 1977). The resistance.
   Real 70s alumni drawn with love: Del Close, John Belushi, Bill Murray,
   Harold Ramis, Gilda Radner, Dan Aykroyd. Appends to SPR + WALK registries;
   reuses painter(), the shared body primitives, and the shared palette. */

/* Del Close — resistance leader. Balding crown, wild side hair, full beard,
   burning teacher eyes, dark turtleneck under a corduroy jacket, raised chalk. */
SPR.delclose = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var CRD = '#6a5238', CRDs = '#503c26', CRDh = '#84683e', TN = '#22222c', HR = '#8a8278', HRd = '#6a635a';
  /* bare crown with wild side tufts */
  var ytop = _face(g, cx, 12), ey = ytop + 5;
  g.ell(cx - 12, ytop + 1, cx - 7, ytop + 12, HR, sK);   /* left tuft */
  g.ell(cx + 7, ytop + 1, cx + 12, ytop + 12, HR, sK);   /* right tuft */
  g.p(cx - 10, ytop + 4, 2, 6, HRd); g.p(cx + 8, ytop + 4, 2, 6, HRd);
  g.p(cx - 6, ytop - 3, 12, 2, HR); g.p(cx - 4, ytop - 4, 8, 1, HRd); /* thin combover wisp */
  _eyes(g, cx, ey, false, 2);                             /* heavy intense brows */
  /* full grey beard swallowing the jaw */
  g.ell(cx - 8, ytop + 9, cx + 8, ytop + 20, HR, sK);
  g.p(cx - 5, ytop + 11, 10, 2, HRd);
  g.p(cx - 3, ytop + 11, 6, 1, sK);                       /* mouth mid-lecture */
  var sh = ytop + 19;
  /* dark turtleneck under corduroy jacket */
  _coatBody(g, cx, sh, 53, CRD, CRDs, CRDh, TN, true);
  g.p(cx - 3, sh, 6, 3, TN); g.p(cx - 4, sh + 2, 8, 1, TN); /* rolled collar */
  for (var i = 0; i < 3; i++) g.p(cx - 12, sh + 4 + i * 8, 2, 5, CRDs); /* cord wale hint */
  /* left arm down, right arm raised with chalk — always teaching */
  g.p(cx - 17, sh + 1, 5, 15, CRD);
  g.p(cx - 17, sh + 1, 5, 1, sK); g.p(cx - 17, sh + 1, 1, 15, sK); g.p(cx - 13, sh + 1, 1, 15, sK);
  g.p(cx - 16, sh + 16, 3, 3, sSK); g.p(cx - 16, sh + 18, 3, 1, sSD);
  g.p(cx + 12, sh - 4, 5, 12, CRD);
  g.p(cx + 12, sh - 4, 5, 1, sK); g.p(cx + 12, sh - 4, 1, 12, sK); g.p(cx + 16, sh - 4, 1, 12, sK);
  g.p(cx + 13, sh - 7, 3, 3, sSK);                        /* raised fist */
  g.p(cx + 14, sh - 11, 2, 4, sWH); g.p(cx + 14, sh - 12, 2, 1, sBEs); /* the chalk */
  _legs(g, cx, 53);
};

/* John Belushi — mainstage thunder. Black mop, ONE raised eyebrow, big grin,
   stocky dark suit with a loose skinny tie. */
SPR.belushi = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var HR = '#181418', HRd = '#2c242c', ST = '#2e2c36', STs = '#201e28', STh = '#403e4c';
  /* thick black mop, low on the brow */
  g.ell(cx - 10, 4, cx + 10, 17, HR, sK);
  g.p(cx - 9, 12, 4, 3, HRd); g.p(cx + 5, 11, 4, 3, HRd);
  var ytop = _face(g, cx, 15), ey = ytop + 5;
  /* the eyebrow: left arched high, right flat */
  g.p(cx - 7, ey - 5, 6, 2, sK);                          /* raised left brow */
  g.p(cx - 8, ey - 4, 2, 2, sK);
  g.p(cx + 2, ey - 2, 5, 2, sK);                          /* flat right brow */
  g.p(cx - 6, ey, 4, 4, sWH); g.p(cx - 4, ey + 1, 2, 2, sK);
  g.p(cx + 2, ey + 1, 4, 3, sWH); g.p(cx + 4, ey + 2, 2, 2, sK);
  g.p(cx - 1, ey + 4, 2, 2, sSD);
  _smile(g, cx, ytop + 12, true);                         /* huge grin */
  g.p(cx - 7, ytop + 8, 2, 4, sSD); g.p(cx + 5, ytop + 8, 2, 4, sSD); /* round cheeks */
  var sh = ytop + 15;
  /* stocky: widen the suit a touch with side fills */
  _coatBody(g, cx, sh, 53, ST, STs, STh, sWH, true);
  g.p(cx - 15, sh + 2, 2, 16, ST); g.p(cx + 13, sh + 2, 2, 16, ST);
  g.p(cx - 15, sh + 2, 1, 16, sK); g.p(cx + 14, sh + 2, 1, 16, sK);
  /* loose skinny tie, knot yanked down */
  g.p(cx - 1, sh + 2, 2, 3, sRD);
  g.p(cx - 2, sh + 5, 3, 8, sRD); g.p(cx - 1, sh + 13, 2, 3, sRD);
  g.p(cx - 2, sh + 5, 1, 8, '#96283c');
  _arms(g, cx, sh, 17, ST);
  _legs(g, cx, 53);
};

/* Bill Murray — heavy-lidded deadpan, sandy shag, loud plaid lounge jacket,
   liberated sandwich in hand. */
SPR.murray = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var HR = '#b08a52', HRd = '#8c6c3c', PL = '#7a4a3a', PLs = '#5e3828', PLh = '#96604a', PLq = '#c8a050';
  /* shaggy sandy hair, parted, over the ears */
  g.ell(cx - 10, 5, cx + 10, 17, HR, sK);
  g.p(cx - 10, 12, 3, 6, HR); g.p(cx + 7, 12, 3, 6, HR);
  g.p(cx - 2, 6, 6, 2, HRd); g.p(cx + 2, 8, 5, 2, HRd);
  var ytop = _face(g, cx, 15), ey = ytop + 6;
  /* heavy lids: half-closed eyes */
  g.p(cx - 6, ey, 4, 3, sWH); g.p(cx - 6, ey, 4, 1, sSD); g.p(cx - 4, ey + 1, 2, 2, sK);
  g.p(cx + 2, ey, 4, 3, sWH); g.p(cx + 2, ey, 4, 1, sSD); g.p(cx + 4, ey + 1, 2, 2, sK);
  g.p(cx - 6, ey - 2, 4, 1, sK); g.p(cx + 2, ey - 2, 4, 1, sK); /* flat unbothered brows */
  g.p(cx - 1, ey + 4, 2, 2, sSD);
  g.p(cx - 3, ytop + 12, 5, 1, sK); g.p(cx + 2, ytop + 11, 2, 1, sK); /* sideways smirk */
  g.p(cx - 7, ytop + 6, 2, 1, sSD); /* pockmark cheek */
  var sh = ytop + 15;
  /* loud plaid lounge jacket */
  _coatBody(g, cx, sh, 53, PL, PLs, PLh, sBE, true);
  for (i = 0; i < 3; i++) { g.p(cx - 12 + i * 9, sh + 1, 1, 20, PLq); } /* plaid verticals */
  g.p(cx - 12, sh + 6, 24, 1, PLq); g.p(cx - 12, sh + 14, 24, 1, PLq); /* plaid horizontals */
  /* left arm down; right arm bent holding the sandwich */
  g.p(cx - 17, sh + 1, 5, 15, PL);
  g.p(cx - 17, sh + 1, 5, 1, sK); g.p(cx - 17, sh + 1, 1, 15, sK); g.p(cx - 13, sh + 1, 1, 15, sK);
  g.p(cx - 16, sh + 16, 3, 3, sSK); g.p(cx - 16, sh + 18, 3, 1, sSD);
  g.p(cx + 12, sh + 4, 5, 9, PL);
  g.p(cx + 12, sh + 4, 5, 1, sK); g.p(cx + 12, sh + 4, 1, 9, sK); g.p(cx + 16, sh + 4, 1, 9, sK);
  g.p(cx + 12, sh + 13, 4, 3, sSK);
  g.p(cx + 10, sh + 15, 8, 2, sBL); g.p(cx + 10, sh + 16, 8, 1, sLF); /* someone's sandwich */
  g.p(cx + 10, sh + 17, 8, 2, sBLs);
  _legs(g, cx, 53);
};

/* Harold Ramis — the head writer. Round wire-rims, dark curls, warm smile,
   corduroy blazer, pencil tucked behind the ear. */
SPR.ramis = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var HR = '#2a2018', HRd = '#443528', CB = '#8a7a5a', CBs = '#6c5e42', CBh = '#a4946e';
  /* tall pile of dark curls */
  g.ell(cx - 10, 2, cx + 10, 15, HR, sK);
  for (i = 0; i < 5; i++) g.eo(cx - 9 + i * 4, 4 + (i % 2) * 3, cx - 4 + i * 4, 9 + (i % 2) * 3, HRd);
  g.p(cx - 10, 10, 3, 6, HR); g.p(cx + 7, 10, 3, 6, HR);
  var ytop = _face(g, cx, 14), ey = ytop + 6;
  _eyes(g, cx, ey, false, 1);
  _glasses(g, cx, ey, sGD);                                /* real round wire-rims */
  _smile(g, cx, ytop + 12, false);                         /* gentle knowing smile */
  g.p(cx + 8, ytop - 1, 5, 2, sAR); g.p(cx + 12, ytop - 2, 1, 3, sRD); /* pencil behind ear */
  var sh = ytop + 16;
  _coatBody(g, cx, sh, 53, CB, CBs, CBh, sWH, true);
  for (i = 0; i < 3; i++) g.p(cx + 10, sh + 3 + i * 7, 2, 4, CBs);  /* cord wale */
  g.p(cx - 8, sh + 9, 5, 6, CBs); g.p(cx - 8, sh + 9, 5, 1, sK);    /* notebook in pocket */
  g.p(cx - 7, sh + 10, 3, 4, sWH);
  _arms(g, cx, sh, 17, CB);
  _legs(g, cx, 53);
};

/* Gilda Radner — all warmth. Huge dark curls, bright eyes, the widest smile
   in the building, mustard dress with a red scarf. */
SPR.radner = function (ox, oy) {
  var g = painter(ox, oy), cx = 24, i;
  var HR = '#3a2c20', HRd = '#54402e', DR = '#c89a3c', DRs = '#a07828', DRh = '#e0b45a', SC = sRD;
  /* enormous curly halo */
  g.ell(cx - 13, 1, cx + 13, 20, HR, sK);
  for (i = 0; i < 6; i++) g.eo(cx - 12 + i * 4, 3 + (i % 2) * 4, cx - 6 + i * 4, 10 + (i % 2) * 4, HRd);
  g.eo(cx - 12, 12, cx - 5, 19, HRd); g.eo(cx + 5, 12, cx + 12, 19, HRd);
  var ytop = _face(g, cx, 15), ey = ytop + 5;
  _eyes(g, cx, ey, false, 1);
  g.p(cx - 6, ey - 1, 1, 1, sWH); g.p(cx + 2, ey - 1, 1, 1, sWH); /* sparkle */
  _smile(g, cx, ytop + 11, true);
  g.p(cx - 4, ytop + 13, 8, 1, sWH);                       /* extra tooth row: WIDEST smile */
  g.p(cx - 8, ytop + 7, 2, 2, '#e8a0a0'); g.p(cx + 6, ytop + 7, 2, 2, '#e8a0a0'); /* blush */
  var sh = ytop + 15;
  /* mustard dress with skirt flare */
  _coatBody(g, cx, sh, 53, DR, DRs, DRh, DR, false, true);
  /* jaunty red scarf */
  g.p(cx - 6, sh, 12, 3, SC); g.p(cx - 6, sh, 12, 1, sK);
  g.p(cx + 3, sh + 3, 3, 8, SC); g.p(cx + 3, sh + 10, 3, 2, '#96283c');
  _arms(g, cx, sh, 16, DR);
  _legs(g, cx, 53);
};

/* Dan Aykroyd — precision instrument. Cop shades, dark crop, skinny tie,
   screwdriver + scanner chassis mid-disassembly. */
SPR.aykroyd = function (ox, oy) {
  var g = painter(ox, oy), cx = 24;
  var HR = '#241c14', ST = '#34343e', STs = '#26262e', STh = '#464652', MT = '#8a8a96', MTs = '#6a6a76';
  /* short dark crop, straight fringe */
  g.ell(cx - 9, 5, cx + 9, 15, HR, sK);
  g.p(cx - 8, 12, 16, 2, HR);
  var ytop = _face(g, cx, 14), ey = ytop + 5;
  /* opaque cop shades: one black bar, glint pixel */
  g.p(cx - 8, ey - 1, 16, 5, sK);
  g.p(cx - 7, ey, 6, 3, '#2c2c38'); g.p(cx + 1, ey, 6, 3, '#2c2c38');
  g.p(cx - 6, ey, 2, 1, sGL); g.p(cx + 2, ey, 2, 1, sGL);
  g.p(cx - 1, ey + 5, 2, 2, sSD);
  g.p(cx - 3, ytop + 12, 6, 1, sK);                        /* perfectly level mouth */
  var sh = ytop + 16;
  _coatBody(g, cx, sh, 53, ST, STs, STh, sWH, true);
  /* regulation skinny tie */
  g.p(cx - 1, sh + 1, 2, 2, sK); g.p(cx - 1, sh + 3, 2, 10, sK);
  /* left hand: scanner chassis; right hand: screwdriver */
  g.p(cx - 19, sh + 6, 8, 10, MT);
  g.p(cx - 19, sh + 6, 8, 1, sK); g.p(cx - 19, sh + 6, 1, 10, sK); g.p(cx - 12, sh + 6, 1, 10, sK);
  g.p(cx - 18, sh + 8, 6, 1, MTs); g.p(cx - 18, sh + 11, 4, 1, MTs);
  g.p(cx - 17, sh + 13, 2, 2, sRD);                        /* little scanner LED */
  g.p(cx - 15, sh + 2, 4, 4, sSK);                         /* hand gripping it */
  g.p(cx + 12, sh + 1, 5, 12, ST);
  g.p(cx + 12, sh + 1, 5, 1, sK); g.p(cx + 12, sh + 1, 1, 12, sK); g.p(cx + 16, sh + 1, 1, 12, sK);
  g.p(cx + 13, sh + 13, 3, 3, sSK);
  g.p(cx + 14, sh + 16, 1, 6, MTs); g.p(cx + 13, sh + 21, 3, 2, sRD); /* screwdriver */
  _legs(g, cx, 53);
};

/* ---- overworld walkers for the resistance + street life ---- */
defWalker('delclose', { hat: '#8a8278', hair: '#8a8278', coat: '#6a5238', mous: '#8a8278', hatShow: false });
defWalker('belushi',  { hat: '#181418', hair: '#181418', coat: '#2e2c36', hatShow: false });
defWalker('murray',   { hat: '#b08a52', hair: '#b08a52', coat: '#7a4a3a', hatShow: false });
defWalker('ramis',    { hat: '#2a2018', hair: '#2a2018', coat: '#8a7a5a', hatShow: false });
defWalker('radner',   { hat: '#3a2c20', hair: '#3a2c20', coat: '#c89a3c', hatShow: false });
defWalker('aykroyd',  { hat: '#241c14', hair: '#241c14', coat: '#34343e', hatShow: false });
defWalker('scgoon',   { hat: '#2c303c', hair: '#3a3a4a', coat: '#4a4a5a', accent: '#c63a46' });
defWalker('caroler',  { hat: '#96283c', hair: '#6a4a2a', coat: '#2e5e46', accent: sGD });
defWalker('vendor',   { hat: '#5e3828', hair: '#3a2a1a', coat: '#8a3c2c', mous: '#3a2a1a' });
defWalker('streetcomic', { hat: '#4a3c30', hair: '#2a2018', coat: '#5a4a6a', hatShow: false });
defWalker('flaherty', { hat: '#2a2420', hair: '#2a2420', coat: '#4a5a6a', mous: '#2a2420', hatShow: false });
defWalker('bartender', { hat: '#181420', hair: '#181420', coat: '#7a2a3a', mous: '#181420', hatShow: false });
