# Netling 2.0 sprites: handoff

Read this first for any sprite work. It is the current state only. The log of every draft and measurement is in [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md) (archive; not needed to continue). Game design (eggs, forms, Standing, temper, bugs, codex) is in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md). Spoilers throughout.

## Status

- All three eggs have all 22 forms drawn, in `prototype/netling2/` (not shipped, not in `sw.js`, not in `npm test`): baby, 3 teens (corp, street, hidden), 9 adults (4 roles x corp/street, plus hidden), 9 elders (one per adult).
- Authored in full, not composed (maintainer). Everything is a first draft judged only from screenshots; **nothing has been seen on a device or in the real renderer.** `npm run smoke` has not been run.
- Verified by machine: `npm test` 500 pass, `npm run proto:test` 119 pass (99 sprite and tell tests plus 14 in `voice.test.js` for idle and chatter and 6 in `metronome.test.js`), the unchanged 1.0 sprite audit on each egg (nothing new flagged), review page and three galleries load in headless Chromium.
- Wearables: all 41 1.0 wearables are placed by the game's own code on every form; none leave the screen (except the 1 px holologo clip that 1.0's own 15 row forms have) and none move between frames.

| | Iron (firmware) | Program (software) | Wetware (grown tissue) |
|---|---|---|---|
| Key / files | `protoB_<id>`; `art.js`, `models.js`, `proto.test.js` | `protoP_<id>`; `program-art.js`, `program-models.js`, `program.test.js` | `protoW_<id>`; `wetware-art.js`, `wetware-models.js`, `wetware.test.js`, `blank-motion.js` |
| Baby | own (blocky) | 1.0's Bitling | organoid (cortex folds, tendrils) |
| Teens corp / street / hidden | corp, street, hidden (own) | 1.0's Kernel / new (mohawk, unibrow, bar-and-dot arms) / 1.0's Shell | blobs: baby grown / + spikes, unibrow, boots / cloaked blob |
| Breach corp, street | Splat, Gronk | Tiger, Worm | Razor, Solo (after Batou) |
| Dodge | Jiff, Bamf | Mouse, Spoof | Wired (1.0's Chrome), Chipped |
| Tune | Ping, Feep | Parse, Phreak | Mentat, Gibson |
| Feast | Munch, Thrash | Gobble, Snarf | Nutri, Leech |
| Hidden adult | Guru | Ghost (1.0's) | Blank (hooded, camouflaged) |
| Elders | `<adult>Elder`, hand-drawn | same; `ghostElder` is 1.0's Whisper | same; `wiredElder` is 1.0's Plat; `blankElder` has a motion layer |
| Asleep / dead mark | queue of dots / dark barcode | block cursor / bright flatline | none / dim trace |

Names of teens and elders are undecided; proposals for all 34 unnamed forms are in the sketch (Teen, baby and elder names). Ids are `teenCorp`, `tigerElder` and so on. Ids are permanent once the app uses them.

## Commands

```bash
npm run proto:test                 # all prototype tests
npm run proto:audit                # 1.0 sprite audit on Iron; EGG=program|wetware|all or proto:audit:program, proto:audit:wetware
npm run proto:gallery              # writes gallery-iron.html, gallery-program.html, gallery-wetware.html (generated, gitignored)
npm run serve                      # http://localhost:5174 ; review page /prototype/netling2/ ; galleries /prototype/netling2/gallery-<egg>.html
```

- The review page (`index.html`) has a section per egg and controls that apply to every form shown: palette, tell skin, temper, care sliders (neglect), bugs, reduced motion, pose, any wearable, anchor rows. Dedicated strips exist only for neglect on Iron's four-form line and bugs on Gronk.
- The galleries are 1.0's real `gallery.html` run on one egg's forms (every wearable, state, palette, tint, prop, visitor).
- To judge art, screenshot the pages in headless Chromium (Playwright; browsers are in `/opt/pw-browsers`) and look; draw options side by side before committing when a form is contested. The maintainer reviews from screenshots and prefers options shown together.
- **Trap:** `src/accessories.js` builds its anchor table once on first load, and `src/sim.js` imports it. Any script, test or page that draws wearables on prototype forms must import `prototype/netling2/ready.js` **first**, or the wearable code silently guesses anchors (it throws if it did not take).

## Rules the tests enforce (apply to every new or redrawn form)

- **Size.** Baby 12 wide. Teens 14 wide, 11 to 12 rows. Adults 16 wide, 13 to 15 rows. Elders 18 wide, no more than 15 rows, never shorter than the adult. Marks only `. # o + x` (main, accent/eyes, highlight, dim).
- **Frames.** Rows 0 to the neck row are identical in A and B (only the lower body animates). The body's bottom (the last row with at least 0.4 of the width painted, as the wearable code reads it) is the same row in both. A and B differ by at least 4 outline cells. Anchors (`headTop`, `eyeRow`, `mouthRow`, `neckRow`) are in range, in order, point at painted cells and are the same in A and B. Most frame bugs came from the bottom-row rule.
- **Eyes** are 2x2 groups of `o` on `eyeRow` and the row below (the generic poses find them there). Head width for eyewear comes from the `headTop` row, so that row must cover the eyes.
- **Silhouette** (1.0 audit screen, centred overlap): no same-stage pair above 0.82. The two main teens are close (0.7 to 0.82); the hidden-path teen is at least 0.1 further from each (and under 0.72) and at least 20 outline cells different. Hidden-path forms must be distinct in outline.
- **Elders.** Each role elder is closest, after scaling its adult to the elder's size, to its own adult among all nine and at least 0.75 (the unscaled score misleads for grown forms); elder pairs under 0.82. Hand-drawn, not stretched.
- **Hidden forms may break the form rules** (maintainer): Ghost's elder is 1.0's Whisper (14 wide, smaller); Blank's elder has a motion layer that changes its outline.
- **Poses.** Asleep and dead keep the awake outline; the dead X is symmetric on two-cell eyes (Wetware rounds toward the middle; Iron and Program still use 1.0's rounding, see Open).
- **Flash budget** (project rule 7): nothing flashes more than three times a second; no picture change faster than 200 ms; motion layers use 400 ms steps.

Design lessons: the street lean adds to the corp body and keeps it blocky (cutting pieces away read as broken); a hidden form's lineage can ride on marks (hood peak, shimmer, crown) not outline; a pair of marks under the mouth reads as stray pixels or extra eyes; reuse 1.0's A frame and re-time only its B frame.

## Layers over the sprites (not part of the registered frames)

All are pure functions, applied by the review page; the real renderer and the galleries do not run them.

| Layer | File | What it does | Tested | Not done |
|---|---|---|---|---|
| Temper tell | `tell.js` | five levels (-6, -2, +3, +6 edges, 1.0 flicker guard, measured on 1.0's simulator); steady = countable beat (every 6 s, 3 s strongly), unsteady = stutter and drift; skin per egg (Iron settles and drifts, Program blinks and hops, Wetware pulses brightness); reduced motion keeps the beat and gives unsteady a still variant | numbers only: levels, guard, exact beat, 200 ms floor, reduced motion, skins differ (`proto.test.js`) | never reviewed on every form; the review page's tell skin is a manual control, not tied to the form's egg; interaction with the 1.0 idle quirk (bounce, sway, hover), wearables and Blank's layer unchecked; edges are placeholders |
| Neglect | `neglect.js`, `needs.js` | Iron's rust: dim `x` on `#` body cells below the mouth row, two levels, bottom first, never over eyes or outline; level from the four care stats with soft and alert lines (soft 40, alert 20, heat 65 and 80, Integrity 60 and 30, 3 point guard) | unit tests on all 22 Iron forms only | Program and Wetware have no tests and no skin of their own (header says corruption and pallor were intended); `x` already means dim fill, shimmer, void or stripes on many forms, so rust may be invisible or confusing there; spot check with the existing function: Program's baby gets 1 rust patch at level 2 (nearly invisible); stat lines unmeasured against play |
| Bugs | `glitch.js` | 0 to 5 bugs each tear one body row a column sideways in a fixed order; persistent; twitch one more row for 400 ms every 3 s (not under reduced motion) | unit tests on all 22 Iron forms only | needs at least 5 rows with free edge columns; spot check: Wetware's street teen has only 4, so it cannot take 5 bugs, and at 5 bugs the overlap with the original falls under the 0.8 the Iron test requires on Wetware's baby (0.63) and Wired (0.77) and Program's spoofElder (0.79), with Program's Mouse borderline (0.80); readability of 5 bugs on small forms; combined with rust |
| Metronome prop | `metronome.js` | a pendulum that swings on the tell's beat when steady (6 s, 3 s strongly), at irregular moments when unsteady, still at the middle; pure function of level, time and seed | 6 tests in `metronome.test.js`: exact beat, seed ignored when steady, irregular when unsteady, 200 ms floor, reduced motion | not drawn: no sprite or prop art is rendered, no real prop slot, no sound by decision; see the sketch |
| Blank elder motion | `blank-motion.js` | camouflage scan band sweeps hood to feet and back, plus a dim ghost dub sliding 3 cells either way; 12 steps of 400 ms; 24 columns wide; registered A and B frames still obey the rules; reduced motion parks it | 5 tests in `wetware.test.js` | real renderer and gallery do not run it; how wearables sit on the moving figure unchecked; device flicker check owed |

Neglect and bugs are meant to appear together (neglect leads to faults, faults roll bugs). Bugs are cleared with scrip, Standing or a netrun debug station (see the sketch).

## Next phase

The maintainer sets the order. Suggested sequence:

1. **Maintainer review (not an AI task).** Program and Wetware in `gallery-program.html` and `gallery-wetware.html` and on the review page, for oddities. Known suspects: Program's Gobble and Worm (weakest reads), the street teen (six passes), Spoof's half mask, Tiger, Parse and Snarf (4 cell frame changes, near-frozen); Wetware's Chipped (its cyber lens is the highlight colour, which the wearable code does not count as an eye, so eyewear finds one eye), Leech's one cell tube, Solo against Nutri (0.81), Blank's shimmer and hood, and the nine Wetware elders (first drafts, mostly wider adults with one feature). Record findings in the sketch handoff, then fix.
2. **Care and bug effects, enacted and checked on all 66 forms.** Extend the neglect and bug tests to Program and Wetware (loop all three eggs, both frames, asleep and dead); look at every form with each level and each bug count on the review page (sliders apply to every form) and in the galleries; decide whether Program and Wetware get their own neglect skin (corruption, pallor) and a bug look that fits their edges; check the combined look and small forms; check poses; then confirm the stat lines with the balance tools once 2.0 rules exist. Known from a spot check: Wetware's street teen (4 tearable rows), Wetware's baby and Wired and Program's spoofElder (outline lost at 5 bugs), Program's baby (rust nearly invisible). Fix forms where the effect is invisible or breaks (for example shimmer or `x` heavy forms), or change the layer's rules.
3. **Temper pass on every form.** Only part of Iron was used for feasibility. Run each egg's skin on every form of that egg at every level, with reduced motion, with wearables on, with the idle quirk, with Blank's layer, and look for forms where the move reads wrong (drift off the screen edge, a hop through a wearable, a wide elder). Bind the skin to the form's egg on the review page. Tune thresholds and the guard with the balance tools once temper accrues. Idle behavior and chatter tone (the other two tell channels) are not prototyped.
4. **Smaller items:** names for teens and elders (all eggs); Chipped's accessory placement; Plat or a hand-drawn Wired elder (a hand-drawn one overlaps Plat 0.96, so Plat is in); put Blank's motion layer in the real renderer and gallery; the Laughing Man ring (a bright dash chase around the face opening, saved as an eye accessory idea); Iron's and Program's asleep chest marks (queue, cursor) sit under the mouth and read as stray pixels (Wetware dropped its mark); Iron's and Program's dead X rounding; thin elder margins (Iron's Gronk, Ping, Munch, Thrash 0.01 to 0.03; Program's Parse 0.02).

## Open decisions for the maintainer

- 1.0 art problems found on the way, none changed: the holologo clips 1 px about a third of the time on every form (options in the history file; leaning to draw it one row lower); headphones plus visor merge into one band on every form; ice's white marks are 1.59:1; 1.0's Bitling, Kernel, Stub, Shell, Firewall, Airgap, Ghost, Whisper, Glitch and Panic move wearables between frames (Program reuses their A frames with re-timed B frames).
- 1.0 code changed once, with the maintainer's agreement: acid, toxic and origin got a `mark` colour and toxic's accent changed (`src/sim.js`, `src/sprites.js`, `tools/lib/sprite-checks.mjs`, regenerated `src/wearable-colors.js`). Regenerate with `node tools/wearable-colors.mjs --write` after any palette or sprite change that affects it.
- Whether the temper tell for Iron (drift off a grid) is distinct enough from 1.0's idle sway.

## Not run, not known

No device or phone check of any sprite, motion, flicker, legibility at small size or the real renderer. No balance run on neglect lines or temper edges. The audit's silhouette score is a screen, not a judgment. Rule prototypes behind the design numbers ran on scratch copies of 1.0's simulator (see `docs/netling2-prototypes/README.md`).
