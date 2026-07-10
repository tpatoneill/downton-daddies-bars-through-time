"""Hi-res (Emerald-proportioned) character sprites for DaddyBoy Advance.
Sprites are ~48x60 native pixels, drawn at 1x onto the 240x160 screen,
matching Pokemon Emerald's trainer-sprite scale."""
from PIL import Image, ImageDraw

K   = (24, 24, 32)      # outline
SK  = (244, 200, 152)   # skin
SD  = (208, 156, 110)   # skin shade
WH  = (246, 246, 250)   # white
GD  = (226, 178, 62)    # gold
HT  = (44, 48, 60)      # hat
HTs = (60, 66, 82)      # hat highlight
HB  = (154, 44, 60)     # hat band
COAT= (58, 56, 66)      # black coat
COs = (42, 40, 50)      # coat shade
COh = (76, 74, 86)      # coat highlight
RD  = (198, 58, 70)     # red accent
MC  = (66, 42, 26)      # samuel's fake mustache
BL  = (226, 194, 108)   # samuel blonde
BLs = (192, 158, 78)
BK  = (50, 50, 62)      # william black hair
BKs = (36, 36, 46)
BE  = (224, 224, 232)   # herschel beard
BEs = (178, 178, 190)
AU  = (176, 92, 48)     # rosalind auburn
AUs = (140, 70, 36)
TE  = (52, 156, 142)    # rosalind teal
TEs = (36, 116, 106)
BZ  = (196, 148, 70)    # brass
BZs = (150, 106, 44)
GL  = (176, 224, 236)   # goggle glass
TRO = (52, 50, 58)      # trousers
SHO = (30, 30, 38)      # shoes

def _p(d, x, y, w, h, c):
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)

def _outline_ellipse(d, box, fill, outline=K):
    d.ellipse(box, fill=fill, outline=outline)

def new_sprite(w=48, h=60):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)

# ----------------------------------------------------------------------
def _hat(d, cx, top, crown_h=9, band=HB, extra_tall=0):
    ch = crown_h + extra_tall
    # crown
    _p(d, cx - 10, top, 20, ch, HT)
    _p(d, cx - 10, top, 20, 1, K)
    _p(d, cx - 10, top, 1, ch, K); _p(d, cx + 9, top, 1, ch, K)
    _p(d, cx - 9, top + 1, 2, ch - 2, HTs)           # sheen
    _p(d, cx - 9, top + ch - 3, 18, 2, band)          # band
    # brim
    _p(d, cx - 15, top + ch, 30, 3, HT)
    _p(d, cx - 15, top + ch, 30, 1, K)
    _p(d, cx - 15, top + ch + 2, 30, 1, K)
    _p(d, cx - 15, top + ch, 1, 3, K); _p(d, cx + 14, top + ch, 1, 3, K)
    return top + ch + 3   # y just under the brim

def _face(d, cx, ytop, jaw=17):
    # head shape
    _outline_ellipse(d, [cx - 9, ytop - 2, cx + 9, ytop + jaw], SK)
    _p(d, cx - 7, ytop + jaw - 4, 14, 2, SD)          # jaw shading
    return ytop

def _eyes(d, cx, ey, squint=False, brows=None):
    for ex in (cx - 6, cx + 2):
        if squint:
            _p(d, ex, ey + 1, 4, 1, K)
        else:
            _p(d, ex, ey, 4, 4, WH)
            _p(d, ex + 2, ey + 1, 2, 2, K)            # pupil, looking right
    if brows:
        for ex in (cx - 7, cx + 2):
            _p(d, ex, ey - 3, 5, brows, K)
    _p(d, cx - 1, ey + 4, 2, 2, SD)                    # nose

def _glasses(d, cx, ey, color=GD):
    # round wire-rim lenses around each eye + bridge + temples
    d.ellipse([cx - 8, ey - 2, cx - 1, ey + 5], outline=color)
    d.ellipse([cx + 1, ey - 2, cx + 8, ey + 5], outline=color)
    _p(d, cx - 1, ey + 1, 2, 1, color)                 # bridge
    _p(d, cx - 11, ey, 3, 1, color)                    # temples
    _p(d, cx + 9, ey, 3, 1, color)

def _smile(d, cx, my, wide=False):
    if wide:
        _p(d, cx - 4, my, 8, 1, K)
        _p(d, cx - 5, my - 1, 1, 1, K); _p(d, cx + 4, my - 1, 1, 1, K)
        _p(d, cx - 3, my + 1, 6, 1, WH)                # teeth
    else:
        _p(d, cx - 3, my, 6, 1, K)
        _p(d, cx - 4, my - 1, 1, 1, K); _p(d, cx + 3, my - 1, 1, 1, K)

def _coat_body(d, cx, ytop, ybot, coat=COAT, shade=COs, hi=COh,
               shirt=WH, lapels=True, skirt=False):
    w = 13
    _p(d, cx - w, ytop, w * 2, ybot - ytop, coat)
    if skirt:  # flare at the bottom (Rosalind)
        _p(d, cx - w - 2, ybot - 8, 2, 8, coat)
        _p(d, cx + w, ybot - 8, 2, 8, coat)
        _p(d, cx - w - 3, ybot - 4, 1, 4, coat)
        _p(d, cx + w + 2, ybot - 4, 1, 4, coat)
    # outline
    _p(d, cx - w, ytop, 1, ybot - ytop, K); _p(d, cx + w - 1, ytop, 1, ybot - ytop, K)
    _p(d, cx - w, ytop, w * 2, 1, K); _p(d, cx - w, ybot - 1, w * 2, 1, K)
    _p(d, cx - w + 1, ytop + 1, 2, ybot - ytop - 2, hi)     # left sheen
    _p(d, cx + w - 4, ytop + 1, 3, ybot - ytop - 2, shade)  # right shade
    # shirt opening
    _p(d, cx - 3, ytop, 6, min(14, ybot - ytop - 4), shirt)
    _p(d, cx - 3, ytop, 1, min(14, ybot - ytop - 4), K)
    _p(d, cx + 2, ytop, 1, min(14, ybot - ytop - 4), K)
    if lapels:
        for s in (-1, 1):
            for i in range(5):
                _p(d, cx + s * (4 + i) - (1 if s < 0 else 0), ytop + i, 1, 3, shade)

def _arms(d, cx, ytop, length=17, coat=COAT, hands=True, raised=None):
    for s in (-1, 1):
        ax = cx + s * 13 + (0 if s < 0 else -1)
        x0 = ax if s > 0 else ax - 4
        _p(d, x0, ytop + 1, 5, length, coat)
        _p(d, x0, ytop + 1, 5, 1, K)
        _p(d, x0 + (0 if s < 0 else 4), ytop + 1, 1, length, K)
        _p(d, x0 + (4 if s < 0 else 0), ytop + 1, 1, length, K)
        if hands:
            _p(d, x0 + 1, ytop + length, 3, 3, SK)
            _p(d, x0 + 1, ytop + length + 2, 3, 1, SD)

def _legs(d, cx, ytop, h=7):
    for s in (-1, 1):
        lx = (cx - 8) if s < 0 else (cx + 1)
        _p(d, lx, ytop, 8, h - 2, TRO)
        _p(d, lx, ytop, 1, h - 2, K); _p(d, lx + 7, ytop, 1, h - 2, K)
        _p(d, lx - (1 if s < 0 else 0), ytop + h - 2, 9, 2, SHO)
        _p(d, lx - (1 if s < 0 else 0), ytop + h - 1, 9, 1, K)

# ======================================================================
def samuel(true_form=False):
    im, d = new_sprite()
    cx = 24
    under_brim = _hat(d, cx, 2)                 # brim bottom ~y14
    ytop = _face(d, cx, under_brim + 1)         # face y15..32
    # blonde: fringe + side hair to the jaw
    _p(d, cx - 8, ytop - 1, 16, 4, BL)
    _p(d, cx - 8, ytop + 2, 3, 2, BLs)
    _p(d, cx - 9, ytop + 1, 2, 12, BL); _p(d, cx + 7, ytop + 1, 2, 12, BL)
    _p(d, cx - 9, ytop + 11, 2, 2, BLs); _p(d, cx + 7, ytop + 11, 2, 2, BLs)
    if true_form:
        # hair down: longer waves past the collar
        _p(d, cx - 11, ytop + 3, 3, 20, BL); _p(d, cx + 8, ytop + 3, 3, 20, BL)
        _p(d, cx - 11, ytop + 21, 2, 3, BLs); _p(d, cx + 9, ytop + 21, 2, 3, BLs)
    ey = ytop + 6
    _eyes(d, cx, ey, brows=1)
    if true_form:
        _smile(d, cx, ytop + 14)
    else:
        # the FAKE mustache: dark, bushy, visibly crooked (right side rides higher)
        _p(d, cx - 8, ey + 6, 7, 3, MC)
        _p(d, cx - 8, ey + 9, 2, 1, MC)                # left droop
        _p(d, cx + 1, ey + 5, 7, 3, MC)
        _p(d, cx + 6, ey + 8, 2, 1, MC)                # right tip
    # body
    sh = ytop + 17
    _coat_body(d, cx, sh, 53)
    _arms(d, cx, sh)
    # red bow tie on the shirt
    _p(d, cx - 4, sh + 1, 3, 3, RD); _p(d, cx + 1, sh + 1, 3, 3, RD)
    _p(d, cx - 1, sh + 2, 2, 2, (150, 40, 52))
    # gold watch chain
    _p(d, cx + 3, sh + 12, 1, 1, GD); _p(d, cx + 4, sh + 13, 1, 1, GD)
    _p(d, cx + 5, sh + 12, 1, 1, GD)
    _legs(d, cx, 53)
    return im

def william():
    im, d = new_sprite()
    cx = 24
    # long black hair FIRST (behind the head), wavy ends
    _p(d, cx - 14, 14, 5, 22, BK); _p(d, cx + 9, 14, 5, 22, BK)
    for i, s in enumerate((-1, 1)):
        x0 = cx - 14 if s < 0 else cx + 9
        _p(d, x0 + 1, 36, 3, 2, BK); _p(d, x0, 34, 1, 2, BKs)
        _p(d, x0 + (0 if s < 0 else 2), 33, 2, 3, BKs)
    _p(d, cx - 13, 14, 1, 20, BKs); _p(d, cx + 12, 14, 1, 20, BKs)
    under_brim = _hat(d, cx, 2, crown_h=8)
    ytop = _face(d, cx, under_brim + 1)
    _p(d, cx - 8, ytop - 1, 16, 3, BK)                 # fringe peek
    ey = ytop + 6
    _eyes(d, cx, ey)
    _glasses(d, cx, ey)                                # gold wire-rims
    _smile(d, cx, ytop + 13, wide=True)                # the famous smile
    sh = ytop + 17
    _coat_body(d, cx, sh, 53)
    _arms(d, cx, sh)
    # handkerchief cravat: white puff spilling over the collar, gold pin
    d.ellipse([cx - 5, sh - 1, cx + 5, sh + 6], fill=WH, outline=K)
    _p(d, cx - 3, sh + 2, 2, 1, (210, 210, 220))
    _p(d, cx + 1, sh + 4, 2, 1, (210, 210, 220))
    _p(d, cx - 1, sh + 3, 2, 2, GD)                    # pin
    _legs(d, cx, 53)
    return im

def herschel():
    im, d = new_sprite()
    cx = 24
    dy = 3                                             # hunched: everything sits lower
    under_brim = _hat(d, cx, 2 + dy, crown_h=7)
    ytop = _face(d, cx, under_brim + 1)
    ey = ytop + 5
    _eyes(d, cx, ey, squint=True, brows=2)             # heavy brows, tired squint
    # the beard: full silver, cheeks to collar, with a grumble line
    d.ellipse([cx - 9, ey + 3, cx + 9, ey + 16], fill=BE, outline=K)
    _p(d, cx - 7, ey + 13, 14, 2, BEs)
    _p(d, cx - 6, ey + 15, 12, 1, BEs)
    _p(d, cx - 3, ey + 7, 6, 1, K)                     # mouth line
    _p(d, cx - 1, ey + 4, 2, 2, SD)                    # nose over beard
    sh = ytop + 16
    _coat_body(d, cx, sh, 53)
    _p(d, cx - 6, sh + 3, 2, 2, HB); _p(d, cx + 4, sh + 3, 2, 2, HB)   # crimson buttons
    _p(d, cx - 6, sh + 8, 2, 2, HB); _p(d, cx + 4, sh + 8, 2, 2, HB)
    _arms(d, cx, sh, length=15)
    # the cane, brass-handled, leaning in his right hand
    _p(d, cx + 17, sh + 2, 2, 22, BZs)
    _p(d, cx + 15, sh + 1, 5, 2, BZ)
    _p(d, cx + 16, sh + 24, 4, 1, K)
    _legs(d, cx, 53)
    return im

def rosalind():
    im, d = new_sprite()
    cx = 24
    under_brim = _hat(d, cx, 2, crown_h=9)
    # brass goggles resting on the crown
    _p(d, cx - 10, 6, 20, 2, BZs)                      # strap
    for gx in (cx - 8, cx + 1):
        _p(d, gx, 4, 7, 5, BZ)
        _p(d, gx + 1, 5, 5, 3, GL)
        _p(d, gx, 4, 7, 1, K); _p(d, gx, 8, 7, 1, K)
    ytop = _face(d, cx, under_brim + 1)
    # auburn: fringe + buns at the ears
    _p(d, cx - 8, ytop - 1, 16, 4, AU)
    _p(d, cx + 3, ytop + 1, 5, 2, AUs)
    for bx in (cx - 13, cx + 8):
        d.ellipse([bx, ytop + 6, bx + 5, ytop + 12], fill=AU, outline=K)
        _p(d, bx + 1, ytop + 7, 2, 2, AUs)
    ey = ytop + 6
    _eyes(d, cx, ey)
    _glasses(d, cx, ey)                                # gold wire-rims
    _smile(d, cx, ytop + 13)
    sh = ytop + 17
    _coat_body(d, cx, sh, 53, coat=TE, shade=TEs, hi=(80, 182, 168), skirt=True)
    _arms(d, cx, sh, coat=TE)
    _p(d, cx - 1, sh + 2, 2, 2, BZ)                    # brass brooch
    _legs(d, cx, 53)
    return im

# ======================================================================
def maximvs():
    im, d = new_sprite(52, 60)
    cx = 26
    # cape behind
    _p(d, cx - 17, 26, 5, 26, (170, 52, 52))
    _p(d, cx + 12, 26, 5, 26, (170, 52, 52))
    _p(d, cx - 17, 26, 1, 26, K); _p(d, cx + 16, 26, 1, 26, K)
    # hair + laurel
    d.ellipse([cx - 9, 4, cx + 9, 14], fill=(96, 66, 40), outline=K)
    for lx in (cx - 10, cx - 6, cx + 3, cx + 7):
        _p(d, lx, 5, 3, 2, (110, 168, 74))
        _p(d, lx + 1, 4, 2, 2, (130, 190, 90))
    ytop = _face(d, cx, 9)
    ey = ytop + 6
    _eyes(d, cx, ey, brows=2)                          # stern
    _p(d, cx - 3, ytop + 14, 6, 1, K)                  # flat serious mouth
    _p(d, cx - 4, ytop + 13, 1, 1, K); _p(d, cx + 3, ytop + 13, 1, 1, K)  # frown corners
    # armor
    sh = ytop + 17
    _p(d, cx - 13, sh, 26, 18, GD)
    _p(d, cx - 13, sh, 26, 1, K); _p(d, cx - 13, sh + 17, 26, 1, K)
    _p(d, cx - 13, sh, 1, 18, K); _p(d, cx + 12, sh, 1, 18, K)
    _p(d, cx - 1, sh + 1, 2, 16, BZs)                  # center seam
    _p(d, cx - 11, sh + 3, 4, 3, BZs); _p(d, cx + 7, sh + 3, 4, 3, BZs)   # pecs. yes, pecs.
    _p(d, cx - 15, sh - 1, 6, 5, GD); _p(d, cx + 9, sh - 1, 6, 5, GD)     # pauldrons
    _p(d, cx - 15, sh - 1, 6, 1, K); _p(d, cx + 9, sh - 1, 6, 1, K)
    # skirt straps
    for i in range(5):
        _p(d, cx - 11 + i * 5, sh + 18, 3, 6, BZ)
        _p(d, cx - 11 + i * 5, sh + 23, 3, 1, K)
    # arms bare (gladiator)
    for s in (-1, 1):
        x0 = cx + s * 15 - (4 if s < 0 else 0)
        _p(d, x0, sh + 4, 4, 13, SK)
        _p(d, x0, sh + 4, 4, 1, K)
        _p(d, x0, sh + 10, 4, 2, BZ)                   # arm band
    _legs(d, cx, 53, h=7)
    return im

def samuel_back():
    """Large back-view sprite for the battle screen foreground (64 wide)."""
    im, d = new_sprite(64, 48)
    cx = 32
    # hat (bigger scale)
    _p(d, cx - 13, 2, 26, 12, HT)
    _p(d, cx - 13, 2, 26, 1, K)
    _p(d, cx - 13, 2, 1, 12, K); _p(d, cx + 12, 2, 1, 12, K)
    _p(d, cx - 12, 3, 3, 10, HTs)
    _p(d, cx - 13, 11, 26, 3, HB)
    _p(d, cx - 19, 14, 38, 4, HT)
    _p(d, cx - 19, 14, 38, 1, K); _p(d, cx - 19, 17, 38, 1, K)
    _p(d, cx - 19, 14, 1, 4, K); _p(d, cx + 18, 14, 1, 4, K)
    # blonde hair at the back of the head
    _p(d, cx - 10, 18, 20, 6, BL)
    _p(d, cx - 10, 22, 20, 2, BLs)
    _p(d, cx - 10, 18, 1, 6, K); _p(d, cx + 9, 18, 1, 6, K)
    _p(d, cx - 6, 24, 12, 2, SK)                       # neck
    # coat, back view, broad
    _p(d, cx - 17, 26, 34, 22, COAT)
    _p(d, cx - 17, 26, 34, 1, K)
    _p(d, cx - 17, 26, 1, 22, K); _p(d, cx + 16, 26, 1, 22, K)
    _p(d, cx - 16, 27, 3, 20, COh)
    _p(d, cx + 12, 27, 4, 20, COs)
    _p(d, cx - 1, 28, 2, 20, K)                        # back seam
    return im

if __name__ == '__main__':
    for name, fn in [('samuel', samuel), ('william', william),
                     ('herschel', herschel), ('rosalind', rosalind),
                     ('maximvs', maximvs), ('samuel_back', samuel_back)]:
        im = fn()
        im.resize((im.width * 4, im.height * 4), Image.NEAREST).save('/home/claude/hr-%s.png' % name)
        print('painted', name, im.size)
