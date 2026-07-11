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

## Phase 3 — Dodge City + NYC  ✔ (QA green)
Delegated the two era content files to Fable 5 subagents (per request), each mirroring the Rome
template exactly; I integrated + QA'd both.
- **Dodge City 1875** (`82-maps-dodge.js`, Fable 5): Main Street / Dusty Trail / Silver Mine / Saloon.
  William joins on arrival ("I SMILED."), name-the-horse sidequest, Order printing-press battle,
  RATTLESNAKE JAKE (ROAST) boss -> Chrono Coil + spoken-word epilogue -> NYC unlocked.
- **New York 1977** (`83-maps-nyc.js`, Fable 5): Back Alley / Club Inferno (disco floors) / Boiler
  Room / Rooftop. Rosalind joins ("BORROW IT. FOREVER."), disco-couple garbled-message sidequest,
  Automatic-Playlist battle, DISCO REX (HEART, heals via crowd) -> Time Crystal + records the club
  into the ball -> London unlocked.
Both validated end-to-end (travel, joins, all maps, bosses, parts, unlocks). Added QA helpers
`walkToNextMap`/`pickTravel`/`face`/`interactAt`. Screenshots: `screenshots/p3-*.png`.

## Phase 4 — Finale + Birthday  ✔ (QA green)
- **Finale** (`84-maps-finale.js`): occupied Theatre District (Editor gauntlet gating the stage door
  via a warp `gate` flag), two-phase Snobbington. Phase 1: WORDPLAY elite + two Geralds. THE REVEAL
  (verbatim: "WE KNEW, LASS. WE ALWAYS KNEW." / "IT WAS CROOKED EVERY SINGLE DAY."). Samuel's
  **True Form** transform (mustache-free crowned sprite, stat jump, Mustache Twirl -> Hat Tip,
  learns **NO MORE DISGUISE**), crowd slams to +100. Phase 2: THE FINAL DRAFT (loses the crowd each
  turn). Post-credits Snobbington stinger.
- **Birthday sequence**: credits + where-are-they-now montage -> curtain call with all four Daddies
  bowing, Samuel (True Form) crowned, confetti, "HAPPY BIRTHDAY LANE ALLISON" + dedication.
- **qa-full.js**: THE complete critical-path playthrough Act0->Rome->Dodge->NYC->Finale->Birthday,
  every map walked, every mandatory battle fought via the real travel hub, save/load roundtrip.
  All suites green: phase1 10, phase2 7, phase4 8, full 6.
Screenshots: `screenshots/p4-*.png`.

## Phase 5 — Personalization + Balance + Ship  ✔ (all QA green)
- **Balance sweep** (`tools/qa-balance.js`): tuned every boss against a naive type-optimal bot
  (60 trials, single attempt, on-curve level). Landed Jake ~75%, Rex ~63%, Snobbington P1 ~60%;
  tutorial + finale phase-2 intentionally triumphant; Maximvs high-variance (~78% mean). See DECISIONS.
- **Loss-path test** (`tools/qa-loss.js`): party wipe -> revive + full heal + control returned;
  SPARE MUSTACHE revive mid-battle. No soft-locks.
- **JOKE SLOT hooks** seeded across the manor + every era town for the owner's inside jokes.
- **Every map rendered** (`tools/shots-allmaps.js` -> `screenshots/map-01..17-*.png`) for review.
- **Self-contained** confirmed: zero external URLs/fonts/CDNs; config block intact
  (`BIRTHDAY_NAME='LANE ALLISON'`, `DEDICATION='THE GREATEST DADDY OF ALL'`). ~192 KB single file.

### Final QA status
- qa-phase1 (10) · qa-phase2 (7) · qa-phase4 (8) · qa-loss (2) · qa-full (6) — **all pass**.
- qa-full is the complete critical-path playthrough: Act0 -> Rome -> Dodge -> NYC -> Finale ->
  Birthday, walking every map, every mandatory battle, the reveal + True Form, save/load roundtrip,
  ending on the birthday marquee for LANE ALLISON.

### The deliverable
`dist/index.html` — one self-contained file, works offline, touch + keyboard, saves to localStorage
(in-memory fallback). Build with `node build.js`; test with `node tools/qa-*.js`.

## Update — The Goblin Realm act + finale rework (owner request)
Restructured the endgame per the owner's new story:
- **New act: THE GOBLIN REALM** (`85-maps-goblin.js`), inserted between New York and London.
  Homeward from NYC the engine — jammed with stowaway **goblins** (new enemy + sprite) — misfires
  and strands the Daddies. They meet **PEDRO GARCIA** (bio verbatim), battle him, and **mid-fight
  Samuel's wig flies off** — the team is EXTREMELY shocked — and she rises to her **True Form**
  (the reveal + NO MORE DISGUISE moved here from the finale). Pedro **gets her number**, the spark
  repairs the machine, and they warp to London. Pedro is a one-scene character (not playable).
- **New battle tech:** a scripted **mid-battle reveal** hook (`spec.reveal`) that pauses the fight
  into a cutscene and resumes it — plus a fix to the cutscene/battle bridge so a nested mid-fight
  cutscene can't clobber the enclosing script (save/restore of the Cutscene queue).
- **Finale reworked** (`84`): Samuel now arrives already revealed; Snobbington's own **FINAL DRAFT**
  escalation bridges the two phases; and on defeat the **Scooby-Doo unmask** reveals him as
  **P DIDDY** ("…IF IT WEREN'T FOR YOU MEDDLING DADDIES!"), then **50 CENT** steps out of the machine
  with a from-the-future mission hook → confetti **"HAPPY BIRTHDAY LANE ALLISON!"** (no death).
- **New sprites** (Fable 5, `31-sprites-extra.js`): goblin, Pedro, P Diddy, 50 Cent (+ walkers).
- QA: `qa-full` extended through the new act (mid-fight reveal + P Diddy/50 Cent verbatim), `qa-phase4`
  updated for the new finale. All suites green: phase1 10 · phase2 7 · phase4 7 · loss 2 · full 8 · dist 7.
  Screenshots: `screenshots/gob-*.png`.

## Update — Solo Snobbington + boss SUPER abilities (owner request)
- **Snobbington now fights SOLO** in phase 1 (removed the two Gerald goons) and is buffed
  (330 HYPE) so he's a real threat alone.
- **Every era boss has a signature SUPER move** with a screen-shaking animation, unleashed
  roughly every 4th turn: Maximvs THUMBS DOWN (gold rings), Jake GRAVEL STORM (embers),
  Rex LAST DANCE (hearts, self-heal), Pedro REVOLUCION! (hearts), Snobbington THE FINAL WORD
  (redaction bars + scribbles, 120 pow, pierces buffs). Animation tinted to the move's type.
- New battle FX system (`superFX`) + AI hook (`superMove`, fired on a 4-turn cadence).
Screenshots: `screenshots/super-0*.png`. All suites green (phase4/full/dist).

(PENDING owner confirm: the era-specific patrolling forced-fight locals + no-heal attrition.)

## Update — Trainers, types, attrition, and the walk-home ending (owner requests)
- **Pokemon-style forced-battle mini-bosses:** a new trainer engine (patrol patterns + line-of-sight
  + "!" alert + charge + forced battle + defeated state + money reward). Populated each era's route
  with 3 **era-specific, typed locals** (Rome: Orator/Legionary/Senator; Dodge: Poet/Auctioneer/
  Salesman; NYC: Disco Regular/Hype-Man/Skater; Goblin Realm: Cackling/Hexing/Brute goblins), spread
  across the type wheel so different Daddies shine. Wild grass encounters remain. 6 new sprites
  (Fable 5, `32-sprites-locals.js`); fixed missing overworld walkers (orator/senator/poet/dancer/cowboy).
- **HP persists between battles (attrition):** removed the auto-heal from era-boss victories — damage
  now carries era-to-era; heal only at phonographs / with teas / on a wipe. Bosses already buffed
  (supers + solo Snobbington) to match.
- **New walk-home ending:** after the P Diddy unmask, the dads vanish and **you manually walk back to
  Daddy HQ**; entering the manor triggers a **SURPRISE PARTY** cutscene, then an **animated 50 Cent
  entrance** from the time machine, the dads react in SHOCK/AWE/REVERENCE, then the birthday card.
- QA: harness made spot/forced-battle aware (auto-resolves trainer/wild fights, leaves bosses to the
  test; retry cap prevents unwinnable-fight hangs). All suites green: phase1 10 · phase2 7 · phase4 7 ·
  loss 2 · full 8 · dist 7. Screenshots: `screenshots/tr-*.png`.

## Fix — Wild tall-grass encounters never fired (+ grass-covered routes)
- **Critical bug:** the encounter gate checked `m.enc`, but maps set `m.encPool`, so wild grass
  battles NEVER triggered (since Phase 1). Fixed the gate; wild battles now fire (~12%/grass-step).
- **Routes are now grass-covered** (Market Road, Dusty Trail, Goblin Realm) so walking a route
  actually produces wild "street cypher" battles, Pokemon-style, instead of a clear dirt path you
  could cross battle-free. Trainers' line-of-sight also crosses the grassy lanes now.
- Raised the QA retry cap (bosses got harder with supers + no-heal; retries heal to full, so they're
  winnable). All suites green: phase1 10 · phase2 7 · phase4 7 · loss 2 · full 8 · dist 7.

## Update — Stylish battle-intro transition + pre-fight taunts (owner request)
- Every battle now opens with a **Pokemon-style VS transition**: a flash burst with radiating
  spokes, then sweeping colored bands + a "VS!" while the foe slides in. (~1s, skippable with A.)
- The opponent **says a line before the fight** — a random in-character taunt per enemy type
  (wild encounters use `TAUNTS`; trainers reuse their hail line), shown over the battle scene
  before the FIGHT menu.
- QA harness skips the transition; all suites green (phase1 10 · phase2 7 · phase4 7 · loss 2 ·
  full 8 · dist 7). Screenshots: `screenshots/trans-*.png`.
