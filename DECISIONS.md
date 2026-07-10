# DECISIONS — Bars Through Time (DaddyBoy Advance)

Autonomous build decisions where DESIGN.md left a choice or was silent. Each choice
is made to best serve DESIGN.md.

## From DESIGN.md §10 (Decisions Needed)
1. **Timeline:** Option **A — full build, all five phases.** The prompt asks for the entire
   game through Phase 5, so we build the complete RPG, not a two-stage/chapter release.
2. **Timing crits:** **IN.** DESIGN §5 asks for approval; it "keeps every turn interactive"
   and is the light echo of v1's rhythm DNA. Implemented as an optional ON-BEAT press for
   +30% damage, fully ignorable (attacks resolve normally if the player never presses).
3. **Side content:** Included where it strengthens the gift — manor examine-jokes everywhere,
   one to two sidequests per era, Golden Mustache collectibles, and the Understudy superboss
   hook. Marked `// JOKE SLOT` where the owner will supply personalized bits.
4. **Her real name:** `LANE ALLISON` (from CLAUDE.md config requirement).

## Engine / architecture
- **Full color, not 4-shade DMG.** DaddyBoy ADVANCE is GBA-era; palette is a named-color
  object of CSS hex strings. `px()` takes a color string directly.
- **Battle is turn-based** (menu: FIGHT / SWAG / SWITCH / FLEE), replacing v1's rhythm minigame.
  v1's rhythm feel survives only as the optional ON-BEAT timing crit.
- **Modules concatenated, single shared scope** (like v1), bundled by `build.js` into one
  `dist/index.html`. No ES imports (they break the single-file self-contained requirement and
  the "no template literals that break bundling" rule). Files share globals by load order.
- **Sprites are code-drawn** in JS, porting `tools/hires.py` (Emerald-scale battle sprites) and
  `tools/sprites.py` (16px overworld walk sprites) into canvas draw functions. No PNG assets.
- **Save:** localStorage wrapped in try/catch with in-memory fallback; auto-save on map
  transitions + phonograph save points. Three slots collapsed to one auto-slot for simplicity
  (a gift, not a franchise).
- **Screen:** 240×160, 15×10 tiles of 16px. Camera follows player, clamped to map bounds.

## Battle specifics
- Type wheel ROAST→FLEX→WORDPLAY→HEART→ROAST, 1.5× / 0.75×, CLASSIC neutral (per §5).
- Crowd Meter −100..+100; ±40 → +20% dmg to favored side; +100 → one SHOWSTOPPER free action.
- Damage: Pokémon-style `((2*lvl/5+2)*power*Flow/Poise)/50 + 2` × type × crit × onbeat × variance.
- XP curve: medium-fast-ish, tuned so on-curve naive play wins gym fights ~60–80% (QA balance sweep).

## Content scope realized
- Eras each: one town map + one route (encounter zone) + boss arena, with the captured Daddy
  and machine part. Dungeons folded into route/arena maps to keep the 60–90 min target tight.
- Finale: two-phase Snobbington with the verbatim reveal and True Form transform.
- Birthday sequence + credits montage with LANE ALLISON on the marquee.
