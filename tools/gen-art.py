#!/usr/bin/env python3
"""gen-art.py — generate character art via the OpenAI Images API, then convert
it to a GBA battle sprite with sprite-import.py.

Key lookup order: $OPENAI_API_KEY, then ~/.openai_key (file contents).
Usage: python3 gen-art.py <name> "<prompt>" [--h=64] [--colors=15] [--quality=medium]
Writes into ~/Desktop/dd_character_art/: <name>.png (raw), <name>-sprite.png,
<name>-preview.png, <name>-grid.json.
"""
import sys, os, json, base64, subprocess, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.expanduser('~/Desktop/dd_character_art')

STYLES = {
  'char': ('Flat cel-shaded 2D anime character illustration in the style of Pokemon '
           'Emerald GBA trainer battle art: hard-edged shadow shapes, thick dark '
           'outlines, bold simple colors (about 12 total), anime proportions, no '
           'realistic rendering, no soft airbrush shading. Single character only, '
           'whole subject visible with margin, centered, on a completely flat solid '
           'light-green background (#b8e0b0), no text, no watermark, no frame. '),
  'charp': ('Flat cel-shaded 2D anime character illustration in the style of Pokemon '
           'Emerald GBA trainer battle art: hard-edged shadow shapes, thick dark '
           'outlines, bold simple colors (about 12 total), anime proportions, no '
           'realistic rendering, no soft airbrush shading. Single character only, '
           'whole subject visible with margin, centered, on a completely flat solid '
           'light-pink background (#f0c0d8), no text, no watermark, no frame. '),
  'prop': ('Flat cel-shaded 2D game object illustration in the style of Pokemon '
           'Emerald GBA art: hard-edged shadow shapes, thick dark outlines, bold '
           'simple colors, no realistic rendering. Single object only, centered '
           'with margin, on a completely flat solid light-pink background '
           '(#f0c0d8), no text, no watermark, no frame. '),
  'bg':   ('Painted battle background for a Game Boy Advance Pokemon Emerald style '
           'RPG, landscape orientation, simple bands of depth, flat cel shading '
           'with hard edges, bold simple colors, slightly darker toward the bottom '
           'third, NO characters, NO people, no text, no watermark, no frame, no '
           'border. '),
  'tile': ('A single seamless ground-texture tile for a top-down Game Boy Advance '
           'RPG tileset, in flat pixel-art style: uniform lighting, no perspective, '
           'texture fills the ENTIRE image edge to edge with no border, no vignette, '
           'no text, no watermark. Viewed from directly above. '),
  'fx':   ('A single small video-game effect sprite in flat cel-shaded GBA pixel '
           'style: bold simple colors, thick dark outline, single glyph only, '
           'centered with margin, on a completely flat solid light-green background '
           '(#b8e0b0), no text, no watermark, no frame. ')
}

def get_key():
    k = os.environ.get('OPENAI_API_KEY', '').strip()
    if k:
        return k
    p = os.path.expanduser('~/.openai_key')
    if os.path.exists(p):
        return open(p).read().strip()
    print('No API key: set OPENAI_API_KEY or put the key in ~/.openai_key')
    sys.exit(2)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    flags = {a.lstrip('-').split('=')[0]: a.split('=', 1)[1] if '=' in a else '1'
             for a in sys.argv[1:] if a.startswith('--')}
    name, prompt = args[0], args[1]
    os.makedirs(OUTDIR, exist_ok=True)

    style = flags.get('style', 'char')
    size = '1536x1024' if style == 'bg' else ('1024x1024' if style in ('tile', 'fx') else '1024x1536')
    body = json.dumps({
        'model': 'gpt-image-1',
        'prompt': STYLES[style] + prompt,
        'size': size,
        'quality': flags.get('quality', 'medium'),
        'n': 1,
    }).encode()
    req = urllib.request.Request(
        'https://api.openai.com/v1/images/generations',
        data=body,
        headers={'Authorization': 'Bearer ' + get_key(), 'Content-Type': 'application/json'})
    print('generating %s ...' % name)
    with urllib.request.urlopen(req, timeout=300) as r:
        resp = json.load(r)
    b64 = resp['data'][0]['b64_json']
    raw = os.path.join(OUTDIR, name + '.png')
    with open(raw, 'wb') as f:
        f.write(base64.b64decode(b64))
    print('saved', raw)

    cmd = ['python3', os.path.join(HERE, 'sprite-import.py'), raw, name]
    for k in ('h', 'w', 'colors', 'croptop', 'mode'):
        if k in flags:
            cmd.append('--%s=%s' % (k, flags[k]))
    if 'h' not in flags and flags.get('mode', 'sprite') == 'sprite':
        cmd.append('--h=64')
    subprocess.run(cmd, check=True)

if __name__ == '__main__':
    main()
