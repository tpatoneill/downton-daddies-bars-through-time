# DOWNTON DADDIES: BARS THROUGH TIME — DaddyBoy Advance Edition

A birthday gift for Lane Allison, who played Samuel on the Downton Daddies hip hop improv team.
This is a Pokémon Emerald-style turn-based RPG delivered as a **single self-contained HTML file**,
presented inside a virtual "DaddyBoy Advance" console (240×160 canvas, GBA-era pixel art, full color).

**Read `docs/DESIGN.md` first. It is the authoritative spec** — story, world, party classes, movesets,
type wheel, Crowd Meter, bosses, sidequests, and the birthday ending are all defined there.
`reference/downton-daddies-v1.html` is the finished v1 (Game Boy rhythm game): steal its proven
patterns — the console shell with pointer-event buttons, the pixel font, the WebAudio chiptune
engine, the Director/script system, and the dialogue typewriter. `reference/v1-test-harness.js`
shows the headless testing pattern that caught real bugs in v1: replicate and extend it.

## Hard requirements

- **Final artifact:** `dist/index.html` — one file, zero dependencies, works offline, on phone
  (touch buttons on the DaddyBoy shell) and desktop (keyboard: arrows, Z=A, X=B, Enter=Start,
  A/S = L/R shoulder). Develop in modules under `src/`, bundle with a build script (esbuild or a
  simple concat script — no framework, vanilla JS, no template literals inside strings that break
  bundling).
- **Config block at the top of the bundled file**, clearly commented:
  `BIRTHDAY_NAME = 'LANE ALLISON'` and `DEDICATION = 'THE GREATEST DADDY OF ALL'`.
- **Saving:** auto-save on map transitions + phonograph save points. localStorage wrapped in
  try/catch with an in-memory fallback (must not crash in sandboxed iframes).
- **No external network calls, fonts, or CDNs.** All art is code-drawn or embedded; all audio is
  WebAudio-synthesized chiptune.
- **Tone rule for all dialogue:** ALL CAPS, short punchy lines (dialogue box fits ~34 chars/line
  × 3 lines), jokes land on the last line. Character voices: Samuel = confident showman with a
  secret; Herschel = grumpy vet, hip complaints, kitchen war stories, deadpan ("IT WAS DECAF.");
  William = serene royal vanity, kindness underneath; Rosalind = delighted mad scientist;
  Babbage = extremely formal automaton butler; Snobbington = wounded pomposity. Never punch down;
  the comedy is affectionate.
- **The reveal is sacred.** The finale mustache scene and the team's lines ("WE KNEW, LASS. WE
  ALWAYS KNEW." / "IT WAS CROOKED EVERY SINGLE DAY.") are kept verbatim from DESIGN.md. Samuel's
  True Form transformation (new sprite, stat jump, learns NO MORE DISGUISE) must be implemented
  exactly as specced — it is the emotional payload of the entire gift.

## Architecture (src/)

- `shell.js` — DaddyBoy Advance DOM/CSS shell, input mapping (pointer + keyboard), canvas setup.
- `gfx.js` — pixel font (port from v1), draw helpers, palette, screen transitions (wipes/fades).
- `audio.js` — chiptune engine (port v1's, add: per-era overworld themes, battle theme, boss
  theme, victory/level-up jingles, SFX table).
- `sprites.js` — all character/tile art as string-art grids with per-sprite legends (same format
  as `tools/sprites.py`, which contains approved drafts of the four Daddies, Maximvs, Babbage,
  and Samuel's walk sprite — port these, then match their style for everything else). Walk
  animations: 4 directions × 2 frames minimum.
- `map.js` — tile engine: 16×16 tiles, ASCII map grids with legends, collision, warps, camera,
  interactable objects, NPC placement/facing, grass-equivalent encounter zones.
- `events.js` — the Director pattern from v1 generalized: cutscenes, dialogue, flags, quest state.
- `battle.js` — turn-based combat per DESIGN.md §5: stats (HYPE/FLOW/POISE/TEMPO), type wheel
  (ROAST>FLEX>WORDPLAY>HEART>ROAST, 1.5×/0.75×, CLASSIC neutral), Crowd Meter (−100..+100,
  ±40 grants +20% dmg, +100 = once-per-battle SHOWSTOPPER), statuses (FLUSTERED, BORED, SHOOK,
  CHARMED, MIC FEEDBACK), switching, items, flee, XP/level-ups/move learning, **timing crits**
  (press A on the pulsing beat marker during your attack for +30% "ON BEAT!" — must be fully
  ignorable).
- `data/` — party movesets, enemy tables per era, item/Drip tables, shop inventories, XP curve
  (levels 1–15), boss battle scripts/gimmicks per DESIGN.md §6.
- `maps/` — one file per map (ASCII grid + legend + NPCs + events). Map list per DESIGN.md §3.
- `story/` — dialogue and cutscene scripts per era, sidequests (§7), the finale, credits,
  birthday sequence (§8).

## Agent team

Run an orchestrator + specialists; keep PR-sized units of work; every merge must pass QA.

1. **ENGINE** — shell, gfx, map, events, save system. Definition of done: walk around two linked
   maps with collision, warps, NPC interaction, save/load.
2. **BATTLE** — battle.js + data tables. Definition of done: scripted battle of every party
   member vs every boss archetype passes headless simulation with expected outcomes; type wheel
   and Crowd Meter verified numerically.
3. **ART** — sprites.js + tiles. Battle/dialogue sprites are **Emerald-scale: ~48-64px tall,
   full-body, real proportions (head ~1/3), drawn at 1x on the 240x160 canvas** — see
   `tools/hires.py` for the approved painter (programmatic shapes + outlines + 3-tone shading,
   parameterized per character; glasses are actual round wire-rim lenses, not single pixels).
   Overworld walk sprites stay small (16x16-ish grid sprites, see `tools/sprites.py`).
   Match `art/*.png` for palette and style. Render every sprite/tile sheet to PNG via
   a node script for human review before integration.
4. **CONTENT** — maps/, story/, quests. Owns the comedy. Must follow the tone rule; boss
   backstory beats from DESIGN.md §6 are required story content, not suggestions.
5. **AUDIO** — audio.js + all tracks/SFX. Era themes should be distinct in 5 seconds of listening.
6. **QA** — extend `reference/v1-test-harness.js` into: (a) full headless playthrough (walk the
   critical path, fight every mandatory battle with a scripted strategy, complete every sidequest),
   (b) loss-path tests (faint → recovery), (c) save/load roundtrip mid-game, (d) frame renders of
   every map and battle for visual review, (e) balance sweep — auto-play battles at expected
   level with a naive strategy; mandatory fights should be winnable but not free (target: naive
   strategy wins gym-equivalent fights 60–80% of the time at on-curve level).

## Build phases (gates, in order)

1. Engine + Act 0 (Manor, Baker's Row, Theatre, tutorial battle) — **human playtest gate**.
2. Rome, complete (town/route/dungeon/Maximvs/Herschel joins/sidequests).
3. Dodge City + NYC (systems exist; this is content production).
4. Finale (two-phase Snobbington, True Form transformation), credits, birthday sequence,
   save polish, The Understudy superboss.
5. Personalization pass (inside jokes — owner will supply a list; leave clearly-marked
   `// JOKE SLOT` hooks in NPC dialogue), balance tuning, full QA sweep, bundle, ship.

## Playtime target

60–90 minutes first playthrough, critical path; +20 min with all side content.
Difficulty: friendly. This is a gift for one specific player. Frustration is a bug.
