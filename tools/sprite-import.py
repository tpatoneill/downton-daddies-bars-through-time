#!/usr/bin/env python3
"""sprite-import.py — turn AI-generated character art into GBA-authentic battle sprites.

In:  a generated image (any size) on a plain solid background
Out: <name>-sprite.png   64px-tall true pixel art, <=15 colors + transparency, 1px outline
     <name>-preview.png  the sprite at 6x on a pale battle-green backdrop
     <name>-grid.json    string-art grid + legend (the game's embedded sprite format)

Usage: python3 sprite-import.py input.png name [--h 64] [--colors 15] [--back]
"""
import sys, os, json, collections
from PIL import Image

def flood_background(img, step_tol=20):
    """BFS flood-fill from the borders: expands across smooth background
    gradients (neighbor-to-neighbor tolerance) and stops at hard outline
    edges. Handles dark art on dark gradient backgrounds."""
    px = img.convert('RGB').load()
    w, h = img.size
    mask = Image.new('L', img.size, 0)
    mpx = mask.load()
    from collections import deque
    # seed ONLY from border pixels that match the dominant border color —
    # a subject cropped by the frame (e.g. a chest-up back sprite) must not
    # become a flood seed.
    border = []
    for x in range(w):
        border.append((x, 0)); border.append((x, h - 1))
    for y in range(h):
        border.append((0, y)); border.append((w - 1, y))
    buckets = collections.Counter((px[x, y][0] // 24, px[x, y][1] // 24, px[x, y][2] // 24) for x, y in border)
    mode = buckets.most_common(1)[0][0]
    modec = (mode[0] * 24 + 12, mode[1] * 24 + 12, mode[2] * 24 + 12)
    q = deque()
    for x, y in border:
        c = px[x, y]
        if abs(c[0] - modec[0]) + abs(c[1] - modec[1]) + abs(c[2] - modec[2]) < 120:
            if mpx[x, y] == 0:
                mpx[x, y] = 255
                q.append((x, y))
    while q:
        x, y = q.popleft()
        c = px[x, y]
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and mpx[nx, ny] == 0:
                n = px[nx, ny]
                if abs(n[0] - c[0]) + abs(n[1] - c[1]) + abs(n[2] - c[2]) < step_tol:
                    mpx[nx, ny] = 255
                    q.append((nx, ny))
    return mask  # 255 = background

def bbox_of_subject(mask):
    w, h = mask.size
    mpx = mask.load()
    x0, y0, x1, y1 = w, h, 0, 0
    for y in range(h):
        for x in range(w):
            if mpx[x, y] == 0:
                if x < x0: x0 = x
                if y < y0: y0 = y
                if x > x1: x1 = x
                if y > y1: y1 = y
    return (x0, y0, x1 + 1, y1 + 1)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = {a.lstrip('-').split('=')[0]: (a.split('=')[1] if '=' in a else True) for a in sys.argv[1:] if a.startswith('--')}
    inp, name = args[0], args[1]
    target_h = int(flags.get('h', 64))
    n_colors = int(flags.get('colors', 15))

    img = Image.open(inp).convert('RGB')
    mode = flags.get('mode', 'sprite')
    if mode in ('bg', 'tile'):
        # whole image IS the asset: no background removal, exact resize, no outline
        from PIL import ImageEnhance as _IE, ImageFilter as _IFf
        tw = int(flags.get('w', 240 if mode == 'bg' else 16))
        th = int(flags.get('h', 112 if mode == 'bg' else 16))
        img = img.filter(_IFf.MedianFilter(5))
        img = _IE.Color(img).enhance(1.12)
        small = img.resize((tw, th), Image.NEAREST if mode == 'tile' else Image.LANCZOS)
        ncol = int(flags.get('colors', 32 if mode == 'bg' else 8))
        q = small.quantize(colors=ncol, method=Image.MEDIANCUT).convert('RGB')
        out = q.convert('RGBA')
        outdir = os.path.dirname(os.path.abspath(inp))
        out.save(os.path.join(outdir, name + '-sprite.png'))
        prev = Image.new('RGB', (tw * 4 + 16, th * 4 + 16), (40, 44, 56))
        prev.paste(out.convert('RGB').resize((tw * 4, th * 4), Image.NEAREST), (8, 8))
        prev.save(os.path.join(outdir, name + '-preview.png'))
        op = out.load()
        colors = {}
        keys = 'ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz0123456789'
        grid = []
        for y in range(th):
            row = ''
            for x in range(tw):
                c = '#%02x%02x%02x' % op[x, y][:3]
                if c not in colors:
                    colors[c] = keys[len(colors) % len(keys)]
                row += colors[c]
            grid.append(row)
        with open(os.path.join(outdir, name + '-grid.json'), 'w') as f:
            json.dump({'legend': {v: k for k, v in colors.items()}, 'grid': grid, 'w': tw, 'h': th}, f, indent=0)
        print('%s mode: %dx%d, %d colors' % (mode, tw, th, len(colors)))
        print('wrote', os.path.join(outdir, name + '-sprite.png'))
        return

    bgmask = flood_background(img)
    # interior pockets: enclosed regions the border flood can't reach (between
    # legs, under arms) — any subject pixel matching the background color goes too
    _px = img.load()
    _mp = bgmask.load()
    _w, _h = img.size
    _border = []
    for _x in range(_w):
        _border.append(_px[_x, 0]); _border.append(_px[_x, _h - 1])
    for _y in range(_h):
        _border.append(_px[0, _y]); _border.append(_px[_w - 1, _y])
    _bc = collections.Counter(((c[0] // 24, c[1] // 24, c[2] // 24) for c in _border)).most_common(1)[0][0]
    _bcc = (_bc[0] * 24 + 12, _bc[1] * 24 + 12, _bc[2] * 24 + 12)
    for _y in range(_h):
        for _x in range(_w):
            if _mp[_x, _y] == 0:
                c = _px[_x, _y]
                if abs(c[0] - _bcc[0]) + abs(c[1] - _bcc[1]) + abs(c[2] - _bcc[2]) < 66:
                    _mp[_x, _y] = 255
    # erode the subject ~3px: the anti-aliased rim is background-contaminated
    # and would drag the quantized palette toward the background hue
    from PIL import ImageFilter as _IF
    bgmask = bgmask.filter(_IF.MaxFilter(7))
    box = bbox_of_subject(bgmask)
    img = img.crop(box)
    bgmask = bgmask.crop(box)

    # sanity: if the surviving subject is a sliver, the background likely
    # swallowed the character (e.g. dark art on a dark background)
    kept = sum(1 for y in range(img.size[1]) for x in range(img.size[0]) if bgmask.load()[x, y] == 0)
    frac = kept / float(img.size[0] * img.size[1])
    if frac < 0.28:
        print('WARNING: only %.0f%% of the crop survived background removal.' % (frac * 100))
        print('The background probably matched the character. Regenerate the')
        print('image on a completely flat LIGHT background (light green), per the prompt sheet.')

    # scale to target height. NEAREST decimation keeps colors pure (no outline
    # smear, no background bleed) — authentic pixel-art downsampling. A light
    # saturation boost compensates for the flat-shade midtones.
    from PIL import ImageEnhance, ImageFilter
    img = img.filter(ImageFilter.MedianFilter(5))
    img = ImageEnhance.Color(img).enhance(1.25)
    w, h = img.size
    target_w = max(1, round(w * target_h / h))
    small = img.resize((target_w, target_h), Image.NEAREST)
    smask = bgmask.resize((target_w, target_h), Image.NEAREST)

    # quantize subject pixels to <= n_colors (median cut on subject only)
    subj = Image.new('RGB', small.size, (255, 0, 255))
    sp, mp, qp = small.load(), smask.load(), subj.load()
    for y in range(target_h):
        for x in range(target_w):
            if mp[x, y] < 128:
                qp[x, y] = sp[x, y]
    pal_img = subj.quantize(colors=n_colors + 1, method=Image.MEDIANCUT).convert('RGB')
    pp = pal_img.load()

    # compose RGBA sprite: subject quantized, background transparent
    out = Image.new('RGBA', small.size, (0, 0, 0, 0))
    op = out.load()
    for y in range(target_h):
        for x in range(target_w):
            if mp[x, y] < 128:
                op[x, y] = pp[x, y] + (255,)

    # 1px dark outline: any transparent pixel adjacent to the subject
    OUT = (24, 20, 32, 255)
    edge = []
    for y in range(target_h):
        for x in range(target_w):
            if op[x, y][3] == 0:
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < target_w and 0 <= ny < target_h and op[nx, ny][3] == 255 and op[nx, ny][:3] != OUT[:3]:
                        edge.append((x, y)); break
    for x, y in edge:
        op[x, y] = OUT

    # palette-level background kill: any quantized color still close to the
    # background hue becomes transparent (catches AA-shaded pocket remnants)
    for y in range(target_h):
        for x in range(target_w):
            r, g, b, a = op[x, y]
            if a == 255 and (r, g, b) != OUT[:3]:
                if abs(r - _bcc[0]) + abs(g - _bcc[1]) + abs(b - _bcc[2]) < 96:
                    op[x, y] = (0, 0, 0, 0)

    # despeckle: an isolated pixel (no 4-neighbor of its own color) becomes
    # the majority neighbor color — kills 1px sampling noise
    for _ in range(2):
        changes = []
        for y in range(target_h):
            for x in range(target_w):
                r, g, b, a = op[x, y]
                if a == 0 or (r, g, b) == OUT[:3]:
                    continue
                neigh = []
                same = 0
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < target_w and 0 <= ny < target_h and op[nx, ny][3] == 255:
                        nc = op[nx, ny][:3]
                        neigh.append(nc)
                        if nc == (r, g, b):
                            same += 1
                if same == 0 and neigh:
                    maj = collections.Counter(neigh).most_common(1)[0][0]
                    if maj != OUT[:3]:
                        changes.append((x, y, maj))
        for x, y, c in changes:
            op[x, y] = c + (255,)

    # optional top-crop (chest-up back sprites): keep only the top N rows
    croptop = int(flags.get('croptop', 0))
    if croptop and croptop < target_h:
        out = out.crop((0, 0, target_w, croptop))
        target_h = croptop
        op = out.load()

    base = os.path.splitext(os.path.basename(inp))[0]
    outdir = os.path.dirname(os.path.abspath(inp))
    sprite_path = os.path.join(outdir, name + '-sprite.png')
    out.save(sprite_path)

    # 6x preview on pale battle green
    prev = Image.new('RGB', ((target_w + 8) * 6, (target_h + 8) * 6), (200, 224, 200))
    big = out.resize((target_w * 6, target_h * 6), Image.NEAREST)
    prev.paste(big, (24, 24), big)
    prev_path = os.path.join(outdir, name + '-preview.png')
    prev.save(prev_path)

    # string-art grid + legend (game-embeddable format)
    colors = {}
    keys = 'ABCDEFGHIJLMNOPQRSTUVWXYZabcdefghijlmnopqrstuvwxyz0123456789'
    grid = []
    for y in range(target_h):
        row = ''
        for x in range(target_w):
            r, g, b, a = op[x, y]
            if a == 0:
                row += '.'
                continue
            c = '#%02x%02x%02x' % (r, g, b)
            if c == '#181420':
                row += 'K'
                continue
            if c not in colors:
                colors[c] = keys[len(colors)]
            row += colors[c]
        grid.append(row)
    legend = {v: k for k, v in colors.items()}
    legend['K'] = '#181420'
    with open(os.path.join(outdir, name + '-grid.json'), 'w') as f:
        json.dump({'legend': legend, 'grid': grid, 'w': target_w, 'h': target_h}, f, indent=0)

    print('subject %dx%d -> sprite %dx%d, %d colors + outline' % (w, h, target_w, target_h, len(legend)))
    print('wrote', sprite_path)
    print('wrote', prev_path)

if __name__ == '__main__':
    main()
