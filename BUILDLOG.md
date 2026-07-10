# BUILDLOG — Bars Through Time

Running log of the autonomous build so you can see what happened while you were away.

## Setup
- Read CLAUDE.md + docs/DESIGN.md + reference/v1 + both sprite painters end to end.
- Wrote DECISIONS.md (timeline A / timing-crits IN / side content included / name LANE ALLISON).
- Established architecture: src/ modules concatenated into a single self-contained dist/index.html
  by build.js; turn-based battle; full-color GBA palette; code-drawn sprites; localStorage save
  with in-memory fallback; headless QA harness extended from v1's.

## Phase 1 — Engine + Act 0  ✔ (QA green)
Built the whole engine and a playable Act 0:
- **Shell** (`00`): DaddyBoy ADVANCE horizontal shell (D-pad, A/B, L/R shoulders, Start/Select),
  pointer + keyboard input, scene manager, main loop.
- **gfx** (`10`): full-color palette, pixel font (ported from v1, expanded), text/wrap/outline,
  panels/bars, string-art sprite grids, fade/wipe transitions.
- **audio** (`20`): chiptune engine with per-era themes (manor/town/rome/west/disco/london),
  battle/boss/finale themes, jingles, and a full SFX table. Null-safe when headless.
- **sprites** (`30`): Emerald-scale battle sprites ported from `tools/hires.py` (Samuel + trueform,
  Herschel, William, Rosalind, Maximvs, plus new Jake/Rex/Snob/Gerald/Editor/Babbage and era foes)
  and 16px overworld walkers.
- **tiles** (`35`): 16x16 terrain + furniture tiles with solidity/encounter flags.
- **map** (`40`): global Game state, tile engine, smooth grid movement, collision, warps, camera,
  interactable objects, NPCs, encounter zones, pause menu, auto-pickup.
- **events** (`50`): generalized Director — cutscenes, typewriter dialogue, choices, battle bridge,
  boom/travel transitions, full-screen era backdrops.
- **battle** (`60`): full turn-based combat — FIGHT/SWAG/SWITCH/FLEE, type wheel, Crowd Meter,
  statuses, optional ON-BEAT timing crits, switching, items, flee, XP/level-ups/move-learning,
  boss AI hooks, SHOWSTOPPER.
- **data** (`70`): types, ~43 moves, 4 party classes + movesets, enemies, bosses, items, drip, XP.
- **maps-london** (`80`): Daddy Manor (machine, phonograph, examine-jokes), Baker's Row (shop, NPCs,
  golden mustache, encounter grass), Downton Theatre (tutorial).
- **story** (`90`): opening cutscene (verbatim "IT WAS DECAF."), tutorial fight, travel hub, new/continue.
- **ui** (`95`): localStorage save/load with in-memory fallback, party & bag & shop screens.
- **main** (`99`): boot logo, title screen, kickoff.
- **Tooling**: `build.js` (concat → dist/index.html), rasterizing headless canvas + PNG encoder,
  BFS-navigating QA harness, screenshot renderer.

QA (`tools/qa-phase1.js`): boot→title→new game→opening→walk manor→bakersrow→theatre→tutorial win
→xp→save/load roundtrip→type-wheel + damage numeric checks. **10/10 pass.**
Screenshots: `screenshots/p1-*.png`. dist/index.html builds at ~144 KB.


## Phase 2 — Rome  ✔ (QA green)
- Refactored the travel hub into a shared `travelChoose` (time machine + era "time rifts"),
  fixed a Cutscene-singleton reentrancy bug (a choice callback starting an async scene was
  being clobbered by `next()`), and moved ERAS/registerEra into the engine.
- **Rome era** (`81-maps-rome.js`): Forum plaza (shop, senator love-poem sidequest, Scripted Order
  goons, phonograph, mustache), Market Road (encounter grass + scripted Gerald battle),
  Colosseum Kitchens (Herschel joins, sentient-stew medal sidequest), Arena.
- **MC Maximvs** boss (FLEX): opens with 3 escalating FLEX self-buffs; on defeat retires, hands over
  the Flux Gear, teaches Herschel BOTH HIPS, unlocks Dodge City. Party growth + level-ups proven.
QA (`tools/qa-phase2.js`): travel via machine → forum → scripted battle grants XP → Herschel joins →
stew sidequest → Maximvs defeated → Flux Gear + Both Hips + Dodge unlocked. **7/7 pass.** Also fixed
the QA harness (added `face`/`interactAt`; taps don't turn the player — movement polls held state).
Screenshots: `screenshots/p2-*.png`.
