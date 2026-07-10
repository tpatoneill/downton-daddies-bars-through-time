from PIL import Image, ImageDraw
from sprites import *
import hires

W, H = 240, 160

# ============ IMAGE 1: BATTLE SCREEN (Rome, vs MC MAXIMVS) ============
def battle_screen():
    img = new_canvas(W, H, (248, 232, 190))
    # sky gradient (dithered bands, GBA-style)
    sky = [(120,190,230),(135,200,235),(152,210,238),(170,218,242)]
    for i, c in enumerate(sky):
        P(img, 0, i*10, W, 10, c)
    # colosseum far wall
    P(img, 0, 40, W, 34, (222,196,150))
    for i in range(10):
        P(img, 4+i*24, 48, 14, 22, (196,166,120))     # arches
        P(img, 4+i*24, 48, 14, 4, (176,146,102))
    P(img, 0, 40, W, 3, (198,170,124))
    # crowd dots in arches
    import random
    random.seed(7)
    for i in range(10):
        for j in range(3):
            P(img, 6+i*24+random.randint(0,9), 56+random.randint(0,10), 2, 2,
              random.choice([(220,80,80),(80,120,210),(240,210,90),(90,180,120)]))
    # arena sand
    P(img, 0, 74, W, H-74, (238,212,158))
    P(img, 0, 74, W, 2, (208,180,128))
    # enemy platform + sprite
    d = ImageDraw.Draw(img)
    d.ellipse([140, 82, 238, 108], fill=(224,196,140), outline=(200,172,118))
    mx = hires.maximvs(); img.paste(mx, (166, 28), mx)
    # player platform + samuel back sprite (large, Emerald-style foreground)
    d.ellipse([0, 118, 120, 150], fill=(224,196,140), outline=(200,172,118))
    sb = hires.samuel_back(); img.paste(sb, (14, 84), sb)

    # ---- enemy info box (top-left) ----
    P(img, 6, 6, 104, 30, (40,56,80))
    P(img, 8, 8, 100, 26, (248,248,240))
    draw_text(img, 'MC MAXIMVS', 12, 11, (40,48,64))
    draw_text(img, 'LV4', 88, 11, (40,48,64))
    draw_text(img, 'HYPE', 12, 21, (120,110,90))
    P(img, 34, 21, 66, 6, (60,60,66))
    P(img, 35, 22, 64, 4, (232,232,224))
    P(img, 35, 22, 44, 4, (92,200,96))
    # FLEX type tag
    P(img, 12, 29, 24, 1, (0,0,0,0))
    # ---- player info box (bottom-right, above menu) ----
    P(img, 126, 92, 108, 34, (40,56,80))
    P(img, 128, 94, 104, 30, (248,248,240))
    draw_text(img, 'SAMUEL', 132, 97, (40,48,64))
    draw_text(img, 'LV5', 212, 97, (40,48,64))
    draw_text(img, 'HYPE', 132, 107, (120,110,90))
    P(img, 154, 107, 74, 6, (60,60,66))
    P(img, 155, 108, 72, 4, (232,232,224))
    P(img, 155, 108, 58, 4, (92,200,96))
    draw_text(img, '46/54', 132, 116, (110,110,120))
    P(img, 168, 118, 60, 3, (60,60,66))
    P(img, 169, 119, 40, 1, (90,150,240))   # xp bar

    # ---- CROWD meter (top center) ----
    P(img, 64, 2, 112, 12, (40,56,80))
    P(img, 66, 4, 108, 8, (248,248,240))
    draw_text(img, 'CROWD', 70, 5, (120,60,110))
    P(img, 100, 5, 70, 6, (60,60,66))
    P(img, 101, 6, 68, 4, (230,230,224))
    P(img, 101, 6, 34, 4, (218,120,150))     # neutral-ish split
    P(img, 135+8, 4, 2, 8, (200,60,60))      # marker leaning samuel

    # ---- battle menu (bottom) ----
    P(img, 0, 128, W, 32, (32,40,60))
    P(img, 2, 130, 138, 28, (250,250,244))
    draw_text(img, 'WHAT WILL', 8, 134, (50,60,80))
    draw_text(img, 'SAMUEL DO?', 8, 144, (50,60,80))
    P(img, 142, 130, 96, 28, (250,250,244))
    draw_text(img, 'FIGHT', 156, 134, (180,60,60))
    draw_text(img, 'SWAG', 202, 134, (60,80,180))
    draw_text(img, 'SWITCH', 148, 146, (60,140,80))
    draw_text(img, 'FLEE', 202, 146, (120,110,60))
    draw_text(img, '>', 148, 134, (30,30,40))
    return img

# ============ IMAGE 2: OVERWORLD (Daddy Manor parlor) ============
def overworld_screen():
    img = new_canvas(W, H, (30,30,40))
    T = 16
    # wall (top 2 rows): victorian wallpaper
    for tx in range(15):
        P(img, tx*T, 0, T, T*2, (94,120,110))
        P(img, tx*T, 0, T, 2, (70,92,84))
        for py in (6, 16, 26):
            P(img, tx*T+4, py, 2, 2, (140,168,150))
            P(img, tx*T+11, py, 2, 2, (140,168,150))
    P(img, 0, T*2-3, W, 3, (60,52,40))          # wainscot line
    # wood floor
    for ty in range(2, 10):
        for tx in range(15):
            base = (176,128,82) if (tx+ty) % 2 == 0 else (168,120,76)
            P(img, tx*T, ty*T, T, T, base)
            P(img, tx*T, ty*T, T, 1, (140,98,60))
            P(img, tx*T, ty*T+8, 8 if (tx%2) else 12, 1, (150,106,66))
    # rug
    P(img, 3*T, 5*T, 6*T, 3*T, (150,52,58))
    P(img, 3*T+3, 5*T+3, 6*T-6, 3*T-6, (178,70,74))
    P(img, 3*T+6, 5*T+6, 6*T-12, 3*T-12, (150,52,58))
    # portraits on wall (the four daddies, tiny)
    for i, col in enumerate([(56,54,62),(58,56,66),(60,58,68),(52,156,142)]):
        P(img, 24+i*28, 6, 18, 20, (110,80,40))
        P(img, 26+i*28, 8, 14, 16, (238,228,200))
        P(img, 29+i*28, 11, 8, 6, col)                 # tiny suit
        P(img, 31+i*28, 9, 4, 3, (244,200,152))        # tiny face
        P(img, 30+i*28, 8, 6, 2, (44,48,60))           # tiny hat
    # fireplace (right wall)
    P(img, 12*T, 2, 40, 30, (120,116,112))
    P(img, 12*T+4, 8, 32, 24, (70,66,64))
    P(img, 12*T+8, 14, 24, 18, (36,30,30))
    P(img, 12*T+12, 20, 6, 8, (240,140,60))
    P(img, 12*T+20, 18, 6, 10, (250,190,70))
    P(img, 12*T+16, 24, 6, 6, (240,110,50))
    # THE TIME MACHINE (left side, 2x3 tiles, brass with clock face)
    tmx, tmy = 1*T, 2*T+4
    d = ImageDraw.Draw(img)
    P(img, tmx+2, tmy+34, 34, 8, (90,70,40))                       # base
    d.ellipse([tmx, tmy, tmx+38, tmy+38], fill=(196,148,70), outline=(24,24,32))
    d.ellipse([tmx+6, tmy+6, tmx+32, tmy+32], fill=(224,182,110), outline=(150,106,44))
    d.ellipse([tmx+11, tmy+11, tmx+27, tmy+27], fill=(246,238,214), outline=(24,24,32))
    P(img, tmx+18, tmy+14, 2, 6, (24,24,32))                        # clock hands
    P(img, tmx+19, tmy+19, 5, 2, (24,24,32))
    P(img, tmx+34, tmy+6, 8, 4, (150,106,44))                       # pipes
    P(img, tmx+38, tmy-4, 4, 12, (150,106,44))
    P(img, tmx+39, tmy-8, 2, 4, (230,230,240))                      # steam
    P(img, tmx+41, tmy-12, 2, 3, (210,210,225))
    # sofa (bottom right)
    P(img, 10*T, 7*T, 56, 24, (86,60,110))
    P(img, 10*T, 7*T, 56, 6, (110,80,140))
    P(img, 10*T, 7*T+18, 56, 6, (66,44,88))
    P(img, 10*T-4, 7*T, 6, 24, (110,80,140))
    P(img, 10*T+54, 7*T, 6, 24, (110,80,140))
    # tea table with teapot
    P(img, 8*T, 3*T, 24, 16, (140,96,58))
    P(img, 8*T+2, 3*T+2, 20, 3, (170,122,76))
    P(img, 8*T+6, 3*T-8, 12, 8, (240,240,246))     # teapot body
    P(img, 8*T+4, 3*T-6, 3, 4, (240,240,246))      # spout
    P(img, 8*T+10, 3*T-11, 4, 3, (240,240,246))    # lid

    # characters
    babbage_walk(img, 3*T, 3*T+6, 1)
    samuel_walk(img, 6*T, 5*T+4, 1)

    # dialogue box (GBA style)
    P(img, 4, 116, 232, 40, (36,48,72))
    P(img, 6, 118, 228, 36, (250,250,244))
    P(img, 6, 118, 228, 2, (170,180,200))
    draw_text(img, 'BABBAGE:', 12, 123, (150,90,30))
    draw_text(img, 'WELCOME HOME, MASTER SAMUEL.', 12, 133, (50,60,80))
    draw_text(img, 'THE ENGINE IS STILL QUITE EXPLODED.', 12, 143, (50,60,80))
    return img

# ============ IMAGE 3: CHARACTER LINEUP CARD ============
def lineup_card():
    img = new_canvas(W, H, (46,32,72))
    # header banner
    P(img, 0, 0, W, 24, (30,20,50))
    draw_text(img, 'THE DOWNTON DADDIES', (W - text_w('THE DOWNTON DADDIES', 2))//2, 6, (238,206,90), 2)
    # stage floor
    P(img, 0, 126, W, 34, (110,74,44))
    P(img, 0, 126, W, 3, (140,98,60))
    # spotlights
    d = ImageDraw.Draw(img)
    for cx in (34, 92, 150, 208):
        d.polygon([(cx, 24), (cx-24, 126), (cx+24, 126)], fill=(58,42,88))
    names = [('HERSCHEL', hires.herschel, 10, (222,222,230)),
             ('WILLIAM', hires.william, 68, (120,160,240)),
             ('SAMUEL', hires.samuel, 126, (238,206,90)),
             ('ROSALIND', hires.rosalind, 184, (92,214,196))]
    for name, fn, x, col in names:
        sp = fn(); img.paste(sp, (x, 54), sp)
        draw_text(img, name, x + (48 - text_w(name))//2, 130, col)
    # crown over samuel (hat top sits ~y56)
    P(img, 140, 50, 20, 4, (238,206,90))
    for i in range(3):
        P(img, 141+i*7, 44, 4, 6, (238,206,90))
    draw_text(img, 'BATTLE SPRITES - DADDYBOY ADVANCE', (W-text_w('BATTLE SPRITES - DADDYBOY ADVANCE'))//2, 148, (200,180,220))
    return img

# ============ compose + GBA shell for battle screen ============
def gba_shell(screen):
    sw, sh = screen.size
    pad_x, pad_y = 70, 46
    shell = Image.new('RGB', (sw + pad_x*2, sh + pad_y*2), (20,20,26))
    d = ImageDraw.Draw(shell)
    # body
    d.rounded_rectangle([8, 8, shell.width-8, shell.height-8], radius=60, fill=(84,60,140))
    d.rounded_rectangle([8, 8, shell.width-8, shell.height-8], radius=60, outline=(50,34,90), width=4)
    # screen bezel
    d.rounded_rectangle([pad_x-18, pad_y-18, pad_x+sw+18, pad_y+sh+18], radius=14, fill=(40,40,52))
    shell.paste(screen, (pad_x, pad_y))
    # d-pad (left)
    cx, cy = 40, shell.height//2
    d.rectangle([cx-9, cy-26, cx+9, cy+26], fill=(38,38,46))
    d.rectangle([cx-26, cy-9, cx+26, cy+9], fill=(38,38,46))
    # A/B (right)
    bx = shell.width - 40
    d.ellipse([bx-12, cy-30, bx+12, cy-6], fill=(200,60,90))
    d.ellipse([bx-12, cy+6, bx+12, cy+30], fill=(200,60,90))
    # brand
    return shell

if __name__ == '__main__':
    b = battle_screen()
    o = overworld_screen()
    l = lineup_card()
    for name, im in [('art-battle', b), ('art-overworld', o), ('art-lineup', l)]:
        im.resize((im.width*3, im.height*3), Image.NEAREST).save('/home/claude/%s.png' % name)
        print('saved', name)
    shell = gba_shell(b.resize((b.width*2, b.height*2), Image.NEAREST))
    shell.save('/home/claude/art-shell.png')
    print('saved shell')
