# DOWNTON DADDIES: BARS THROUGH TIME
## Design Document — DaddyBoy Advance Edition (v2)

A turn-based RPG in the mold of Pokémon Emerald, built as a single self-contained browser game, presented inside a **DaddyBoy ADVANCE** — the same virtual-console conceit you liked, evolved one hardware generation: horizontal shell, shoulder buttons, 240×160 full-color screen, GBA-era pixel art (bright saturated palettes, dithered skies, chunky 16×16 tiles).

Everything you liked survives: the characters, the comedic voice, the mustache arc, the birthday finale. What changes is everything around it — a walkable world, real strategy, and 60–90 minutes of game.

---

## 1. The Pitch in One Paragraph

Lord Snobbington — a failed rapper turned aristocrat — sabotages Rosalind's time engine on the eve of the Daddies' greatest show, scattering the team across history. He isn't just a snob: he leads **The Scripted Order**, a secret society traveling through time to stamp out rap itself, so that every rhyme in history is pre-written, pre-approved, and dead inside. Samuel — the only Daddy left in 1889 — must repair the time machine era by era, rescue each Daddy (who joins the battle party), foil the Order's schemes in every century, and finally take back the theatre in a two-phase finale where the mustache falls, the truth comes out, and the crowd chants her real name. Roll credits, cut to confetti, happy birthday.

The villain rework is the load-bearing change: it gives the game a recurring antagonist (his cravat-wearing goons appear in every era, like Team Magma grunts), it retroactively exonerates Herschel ("IT WAS DECAF." — it was, in fact, sabotage), and it makes the finale thematic rather than just final: Snobbington's whole villainy is fear of being seen failing; Samuel wins by choosing to be seen, period.

---

## 2. Structure: The Emerald Skeleton

| Pokémon Emerald | Bars Through Time |
|---|---|
| Player's house / Littleroot | **Daddy Manor**, the home base where all four live |
| Professor Birch | **Babbage**, Rosalind's brass automaton butler (guide, tutorial, shopkeeper) |
| Pokémon that join your party | **The Daddies themselves** — rescued one per era, each a class with stats, moves, levels |
| Gym leaders | **Era bosses** with backstories, gimmick fights, and post-battle arcs |
| Team Magma/Aqua | **The Scripted Order** (recurring grunt battles + Snobbington encounters in every era) |
| Routes with wild encounters | Era "routes" with **street cyphers** — random battles vs local rappers for XP |
| Badges | **Time machine parts** (Flux Gear, Chrono Coil, Temporal Lens, Master Spring) |
| HMs opening new areas | Machine repairs opening new eras |
| Pokémon Centers | **Phonograph save points** (also: full heal at any teapot) |

Progression loop: arrive in era → explore town, talk to NPCs, pick up sidequests → route/dungeon with cyphers and Order grunts → find the captured Daddy → boss battle → Daddy joins party + machine part acquired → beat back to the manor or straight on to the next era.

---

## 3. The World

### London, 1889 — Home Base (Act 0 and Finale)
**Daddy Manor** is fully explorable and dense with interactions, because this is where the gift lives. Every object examined returns a joke in-voice: Herschel's army trunk ("A MEDAL FOR BRAVERY IN THE KITCHEN. THE STEW WAS HOSTILE."), William's enormous mirror ("IT IS ALWAYS POLITE TO WAVE BACK."), Rosalind's half-built inventions, Samuel's locked mustache case on her nightstand — examine it early and it says "PRIVATE."; examine it after the finale reveal and the text changes. The **time machine** dominates the parlor and is the main story device: interact with it to travel once eras unlock.

Outside the manor: a short street (Baker's Row) with a couple of NPCs, the corner shop (Babbage relocates here as shopkeeper), and the **Downton Theatre** — site of the tutorial battle (open-mic heckler, teaches combat with Samuel solo at level 1) and, much later, the finale.

The manor evolves: rescued Daddies' rooms light up, a trophy shelf fills with era mementos, and post-game the whole team is home and re-interactable with new dialogue.

### The Four Eras
Each era is a compact region — roughly one town map, one route, one small dungeon, one boss arena — sized like an early Emerald town-plus-route. Order of play is fixed (difficulty curve), travel is via the machine.

**ROME, 74 AD.** Forum plaza (town), Market Road (route — wild cyphers vs Street Orators and Gossiping Senators), Colosseum Kitchens (dungeon — Herschel is found here, put to work *again*), Arena floor (boss). The Scripted Order is distributing "approved verse scrolls" and shutting down the Forum's open cypher — all rhymes must be submitted in writing, in triplicate.

**THE OLD WEST, 1878.** The engine overshoots Dodge by a desert. The High Desert (spawn — wild scrub, a cow skull that has seen things), Dry Gulch (frontier town — the locals talk up Dodge City and its smiling new sheriff), Dry Gulch Station (buy a 25-shilling ticket for the 3:10; a repeatable porter chore means nobody soft-locks broke), the 3:10 to Dodge (walkable train — side quests: the seat-4B granny duel, the lucky marble, the tonic testimonial, Gertrude the emotional-support rock; the conductor will not stop until the GREAT METAPHOR ROBBERY in the mail car is foiled — Gerald and a Train Bandit, 2-on-party), Front Street, Dodge City (detailed town — William has been sheriff for an hour, having smiled; patrol opponents; the Saloon is barred until the duel-card press falls), Dusty Trail (route — Tumbleweed Poets, Cattle Auctioneers), the Silver Mine (dungeon — the Order is printing scripted "duel dialogue" cards down there; destroying the press opens the Saloon), Saloon showdown (boss).

**NEW YORK, 1977.** Back Alley (arrival), Club Inferno dance floor (town-equivalent, NPC-dense, best jokes-per-square-tile in the game), the Boiler Room (dungeon), Rooftop (boss under the stars). Rosalind has already reverse-engineered the DJ booth and identified the disco ball as a perfect temporal lens. The Order is replacing the club's DJs with a pre-programmed "Automatic Playlist" (they invented the algorithm, the monsters).

**LONDON, 1889 — Act 3.** Return home to find the theatre district under Scripted Order occupation. Street-by-street liberation, a gauntlet of Order elites in the theatre lobby, then the two-phase Snobbington finale (Section 7).

---

## 4. The Party: Four Daddies, Four Classes

Party building is the strategy core: by the finale you field all four, choose who's active (one on stage, the rest benched, free switching like Pokémon), and manage four distinct kits. The party order matters and is player-controlled (START > PARTY > LEAD/MOVE): the first slot is the LEAD — they walk the overworld, start battles, and set wild-encounter levels. **Double battles:** whenever a fight has 2+ opponents and the party has 2+ standing daddies, the first two fielded members fight side by side — each picks a move and a target per round, every combatant's HP stays on screen (compact boxes), foes split their attacks between the two, and a fallen daddy is replaced from the bench (or the fight continues solo).

Stats: **HYPE** (HP), **FLOW** (attack), **POISE** (defense), **TEMPO** (speed, turn order). Levels 1–15, moves learned on a fixed schedule, four move slots each (choosing which four to equip is a real decision by midgame).

### SAMUEL — The Protagonist. Balanced striker (Wordplay/Flex).
Starts level 1, solo, and carries Act 0–1 alone. Signature mechanic: **after the finale reveal, she transforms** — the "True Form" battle sprite loses the mustache, her stats jump, and she learns her ultimate. The player literally feels the character get stronger by being herself. This is the birthday moment expressed as game mechanics.
Sample kit: Opening Bar (basic), Double Entendre (Wordplay, chance to Fluster), Humble Brag (Flex), Mustache Twirl (raise Poise/evasion — replaced post-reveal by **Hat Tip**, same effect, better line), Punchline (Wordplay, high crit), and at the very end **NO MORE DISGUISE** (Heart, 95 power, damage scales with Crowd Meter).

### HERSCHEL — The Tank (Roast/Old-School). Joins in Rome, ~lv 3.
Highest Hype and Poise, lowest Tempo (the hips). Control and counterplay.
Sample kit: Cane Whack, War Story (puts enemy to "Bored" — sleep analog), Back In My Day (Roast), Grumble Stance (counters the next attack), Kitchen Duty (small party heal + cures status; he was a kitchen soldier, healing via aggressive stew), Both Hips (huge Roast damage, hurts himself — "WORTH IT.").

### WILLIAM — The Charmer (Heart/Support). Joins in Dodge City, ~lv 7.
Buffs, debuffs, sustain. Fragile but game-warping.
Sample kit: Devastating Wink (Heart, chance to Charm — enemy may skip a turn admiring him), Hair Flip (party evasion up), Royal Decree (enemy Flow down), Smolder (Heart damage), Noblesse Oblige (big single-ally heal), Crown Jewel (Flex nuke he learns very late, because even his violence is fabulous).

### ROSALIND — The Mage (Wordplay/Tech). Joins in NYC, ~lv 9.
Glass cannon and toolbox. Debuffs and the game's only buff-piercing move.
Sample kit: Steam Vent, Tea Dispenser (heal-over-time on the party — the teapot is load-bearing), Recalibrate (cleanse + buff), Overclock (party Tempo up), Logic Bomb (Wordplay, ignores enemy buffs), Tesla Verse (huge, small chance to Fluster *herself* — science has risks).

---

## 5. Battle System

Turn-based, menu-driven, Emerald-legible: FIGHT / SWAG (items) / SWITCH / FLEE. Turn order by Tempo. Damage formula Pokémon-simple (level, Flow vs Poise, move power, type multiplier, crit, small variance).

### The Type Wheel
Four rap-battle styles in a clean cycle, each boss embodying one so the game teaches the wheel naturally:

**ROAST → FLEX → WORDPLAY → HEART → ROAST** (each beats the next)

Roast punctures bragging; raw confidence steamrolls cleverness; cleverness reframes sincerity; sincerity disarms mockery. Multipliers are a friendly 1.5× / 0.75× (not Pokémon's brutal 2×/0×) — visible "SUPER EFFECTIVE!"-style feedback ("THAT ONE LANDED!" / "THE CROWD'S NOT FEELING IT...") without hard walls. A fifth neutral style, CLASSIC, covers basic moves.

Boss identities: Maximvs = FLEX, Jake = ROAST, Rex = HEART, Snobbington = WORDPLAY. By the finale the player has fought every style and knows exactly why Heart beats Wordplay — which is also, not coincidentally, the theme of the ending.

### The Crowd Meter — the signature mechanic
Every battle happens in front of a crowd, and the crowd is a tug-of-war bar (−100…+100) that both sides fight over. Landing effective hits, crits, and certain moves swing it; at ±40 the favored side deals +20% damage; hitting +100 triggers a once-per-battle **SHOWSTOPPER** (a free extra action with the screen flashing). It layers a second strategic axis over the HP race — sometimes the right play is a crowd-swinging move over a damage move — and it pays off narratively in the finale, where phase 2 begins with the crowd surging to Samuel's side.

### Status Effects
FLUSTERED (confusion — may fumble the turn), BORED (sleep — wasted turns until "woken" by damage), SHOOK (Flow down), CHARMED (William-exclusive — chance to skip turn), MIC FEEDBACK (small damage each turn — burn analog).

### Timing Crits (proposal — approve or veto)
One borrowed idea from Mario RPGs: when your Daddy attacks, a beat marker flashes — press A on the beat for a bonus ("ON BEAT! +30%"). It's a light echo of v1's rhythm DNA, keeps every single turn interactive instead of menu-then-watch, and is cheap to build. Fully optional (works fine if ignored). **Your call.**

### Items & Drip
Consumables in the SWAG pouch: Earl Grey (heal), Strong Earl Grey, Crumpet (full heal), Throat Lozenge (cure status), Pocket Watch (flee), and the crown jewel of the item list — the **SPARE MUSTACHE**, which revives a fainted Daddy. Each character also has one **Drip slot** (equipment): found and shop-bought hats, canes, chains, and goggles with small stat bonuses, several hidden as sidequest rewards.

---

## 6. The Bosses, Fleshed Out

**MC MAXIMVS (Rome, FLEX).** A gladiator who won his freedom not with a sword but with words — champion of the Forum Cypher for eleven years, undefeated, and quietly miserable. The rules say the champion battles all comers ("THEM'S THE RULES" is his whole legal philosophy), so he can never stop, never go home to the family farm he raps about when he thinks no one is listening. He doesn't want to beat you; he wants to finally *lose* to someone worthy. Battle gimmick: opens with three turns of escalating self-buffs (Flex stacking) — the fight teaches you to answer with Roast and to use the Crowd Meter before his stats snowball. Post-battle: retires on the spot, hands over the Flux Gear, and teaches Herschel "Both Hips." The Order's local scheme (approved scrolls) collapses when the Forum sees improv beat the champion.

**RATTLESNAKE JAKE (Dodge City, ROAST).** The meanest tongue in the territory — because it's all he has left. Jake was a singer once; lost his voice in a legendary week-long shouting match over a horse, and the doctor said the singing was gone for good. So he pivoted to venom. Then William rides in, smiles once, becomes sheriff in an hour, and every wound reopens. Battle gimmick: pure Roast aggression plus SHOOK debuffs; the counter is William's Heart kit (sincerity disarms mockery — the wheel as character work). Post-battle: William, genuinely kind, points out that Jake's gravel is perfect for *spoken word*. Jake's first poem is terrible and the whole saloon cries anyway. Hands over the Chrono Coil.

**DISCO REX (NYC, HEART).** King of Club Inferno, and the only boss who fights you for a *good* reason. Rex is getting older, the radio says disco is dying, and the mirror ball is the one thing that makes him feel eternal — so when Rosalind announces she needs it ("FOREVER"), the battle is on. His Heart moves genuinely hurt because he means every word. Battle gimmick: heals himself by swinging the Crowd Meter — the fight teaches meter denial. Post-battle: Rosalind, in a rare gentle moment, explains that a temporal lens doesn't just look through time — it can *record* it. She etches the entire golden age of Club Inferno into the ball's facets before removing it. Rex donates it, weeping, magnificent. The Order's Automatic Playlist machine gets thrown in a dumpster by his bouncers.

**LORD SNOBBINGTON (London, WORDPLAY).** The reveal: he was a rapper once. Forty years ago, a young Reginald Snobbington stepped up at this very theatre's open cypher, went blank mid-verse, and was laughed out of the building. He has spent a fortune and four decades making sure no one can ever be laughed at again — by making sure no one ever *freestyles* again. If every bar is written, approved, and rehearsed, no one can ever choke. He founded the Scripted Order, sabotaged the engine (planted the tea!), and bought the theatre. He is the fear of being seen failing, wearing a very tall hat.
**Phase 1:** Wordplay elite with a full human moveset, flanked by two goons.
**Between phases (scripted):** the wind, the mustache, the gasp, "A FRAUD!" — and the team's replies, kept word-for-word from v1 ("IT WAS CROOKED EVERY SINGLE DAY."). Samuel transforms to True Form, learns NO MORE DISGUISE, and the Crowd Meter slams to +100 in her favor.
**Phase 2:** Snobbington's desperate "FINAL DRAFT" form — faster, stronger, and losing the crowd with every turn. Beat him with the whole party. Post-battle stinger after the credits: he's in the front row of a beginner freestyle class at the Daddies' theatre, hating it, coming back next week.

Recurring en route: **Scripted Order Goons** (matching cravats, all named Gerald) and two mini-bosses, the Order's elite "Editors."

---

## 7. Side Content

Sidequests, one to three per era, all joke-forward: recover Herschel's medal from the Colosseum kitchen (the stew guards it); ghostwrite a love poem for a Roman senator (dialogue-choice puzzle); help a cowboy name his horse (every option is wrong in a different funny way); reunite a disco couple by relaying increasingly garbled messages across the dance floor. Rewards: Drip, Spare Mustaches, and manor trophies.

Collectibles: **12 Golden Mustaches** hidden across all maps (sparkle tiles, behind objects, one held by an NPC who must be out-negotiated). Babbage exchanges them for the best Drip in the game. Finding all 12 unlocks a bonus scene at the manor after the credits.

Optional superboss (post-game, if time allows): **THE UNDERSTUDY** — a Scripted Order automaton trained on transcripts of every Daddies show, waiting in the theatre basement. The hardest fight in the game, and thematically perfect: a copy versus the real thing.

---

## 8. The Birthday Layer

The ending keeps v1's best trick — the game is GBA-colorful throughout, so the finale needs a bigger visual spike: on victory, a full credits sequence rolls over a montage of every era (each boss shown living their post-battle epilogue), ending on the curtain call, confetti, the crown, "HAPPY BIRTHDAY [NAME]" on the marquee in lights, and the dedication line. Config block at the top of the file, same as before: her name, the dedication, both clearly marked.

Personalization hooks (this is where your inside jokes go — send them and I'll place them): NPC dialogue lines, examine-text on manor objects, one sidequest built around a real team bit if you have one that fits, and optionally the name of the theatre itself.

---

## 9. Technical Plan (honest version)

Same delivery: **one self-contained HTML file**, no dependencies, playable in any browser. The DaddyBoy Advance shell is horizontal with D-pad, A/B, L/R, Start/Select — touch and keyboard both.

Engine: 240×160 canvas, 16×16 tiles, maps authored as ASCII grids with a legend (fast to write, easy to debug), grid movement with collision and warps, an NPC/event scripting layer reusing v1's Director pattern, and the battle system as a separate scene. Character walk sprites in 4 directions (small, hand-placed pixel art like v1's portraits, which carry over to battle as larger sprites). Chiptune engine upgrades to per-era overworld themes + battle theme + boss theme.

**Saving is now mandatory** (60–90 min game). Plan: auto-save at map transitions + phonograph save points, stored in localStorage with a graceful in-memory fallback (note: saves won't persist inside claude.ai's preview pane, but will work perfectly when she opens the actual file or a hosted link — one more reason Netlify hosting is the right delivery).

Testing: the same headless harness that caught bugs in v1, extended — simulated full playthrough (walk paths, every battle with scripted strategies, every sidequest), plus rendered-frame visual checks of every map and boss.

Scale reality: this is roughly **5–8× the v1 codebase**. Entirely buildable, but not in one pass — it needs a phased build with your playtesting between phases.

### Build Phases
1. **Engine + Act 0** — DaddyBoy Advance shell, tile engine, walking, Daddy Manor + London maps, dialogue, battle system core, tutorial fight. *This is the go/no-go checkpoint: you playtest the feel.*
2. **Rome** — full era, Herschel joins, Maximvs, leveling proven end-to-end.
3. **Dodge City + NYC** — content production at speed (systems all exist by now).
4. **Finale + credits + birthday sequence + save system polish.**
5. **Personalization pass** (her name, inside jokes) **+ balance tuning + full test sweep.**

### The Saturday Question
Two days is tight for all five phases at full quality. Three honest options:

**A — Sprint for Saturday.** Phases 1–2 today, 3 tomorrow, 4–5 Saturday morning. Achievable but the margin for your playtesting shrinks, and side content gets thinned.

**B — Two-stage gift (my recommendation).** Saturday she gets v1 (finished, tested, delightful) as "DaddyBoy CLASSIC — the launch title," with a teaser at the end: "COMING SOON TO DADDYBOY ADVANCE." The full RPG follows a week later as the real present's second act. Zero deadline compromise on the big game, and she gets two reveals instead of one.

**C — Hybrid.** Build Phases 1–2 for Saturday and ship it honestly as "Chapter 1" with a to-be-continued screen; remaining eras arrive as the promised "expansion packs." On-theme with your original expansion-pack instinct.

---

## 10. Decisions Needed From You

1. **Timeline:** A, B, or C above?
2. **Timing crits** (press A on the beat for bonus damage): in or out?
3. **Scope check on side content:** full sidequest/collectible layer, or trim to critical path + manor jokes if we're sprinting?
4. **Her real name** (for the config), and — the important one — **a brain-dump of team inside jokes**, bits, catchphrases, real show memories. Even a messy list. That's the raw material that turns this from "a game about the Downton Daddies" into "our game."
