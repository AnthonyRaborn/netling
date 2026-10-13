# Netling 2.0 sprites: handoff

Current state only, for an AI session picking up sprite work. Read `CLAUDE.md` first. The sprite prototype is `prototype/netling2/` (not shipped, not in `sw.js`, not in `npm test`). Game design (eggs, forms, Standing, temper, bugs, codex) is in [DESIGN.md](DESIGN.md); open work across the project is in [OPEN_ITEMS.md](OPEN_ITEMS.md). Spoilers throughout.

## 1. Status

- **What exists.** All three eggs have all 22 forms: baby, 3 teens (corp, street, hidden), 9 adults (4 roles x corp/street, plus hidden), 9 elders (one per adult). That is 66 forms, plus the hidden **Rogue** egg with 10 forms (all accepted by the maintainer, 2026-10-10). Authored in full by hand, not composed.
- **The renderer pass.** `render.js` draws every egg's layers on the LCD in one pure compose step (`composeLCD(pet, time, opts)` returns draw operations, `paintLCD` runs them on any context, `drawLCD` does both). The LCD is 1.0's 40x28 plus 2 rows of headroom on top (`TOP`, `LCD_H` 30). The review page, the focus review page and the galleries' `layers` section all draw through it.
- **Verified by machine.** Run `npm test` (1.0's suite) and `npm run proto:test` (the prototype suite: sprite, care and bug layers on all 66 forms, dead X mirroring, tell and temper pass, visit rules, gallery maker, renderer pass, flash rule on the composed screen, simulator and netrun rules). Run `npm run proto:audit` (with `EGG=program|wetware|rogue|all`) for the 1.0 sprite audit on each egg. Counts change often; run the commands. At the last run both passed.
- **Never done.** Nothing has been seen on a device (flicker, legibility at small size, the layers on a phone). There is no 2.0 app to host `render.js`. `npm run smoke` has not been run for this work. Everything is judged from screenshots.
- **Wearables.** All 41 1.0 wearables are placed by the game's own code on every form and none leave the screen.
- **1.0 code touched once** (maintainer agreed): acid, toxic and origin got a `mark` colour. Regenerate `src/wearable-colors.js` with `node tools/wearable-colors.mjs --write` after any palette or sprite change that affects it.

## 2. Forms and file keys

| | Iron (firmware) | Program (software) | Wetware (grown tissue) |
|---|---|---|---|
| Key / files | `protoB_<id>`; `art.js`, `models.js`, `proto.test.js` | `protoP_<id>`; `program-art.js`, `program-models.js`, `program.test.js` | `protoW_<id>`; `wetware-art.js`, `wetware-models.js`, `wetware.test.js`, `blank-motion.js` |
| Baby | Boot (own, blocky) | Bitling (1.0's) | Pod (organoid: cortex folds, tendrils) |
| Teens corp / street / hidden | Thunk, Buzz, Gweep (own) | Kernel (1.0's) / Rat (new: mohawk, unibrow, bar-and-dot arms) / Shell (1.0's) | Graft (baby grown) / Edge (+ spikes, unibrow, boots) / Zero (cloaked blob) |
| Breach corp, street | Splat, Gronk | Tiger, Worm | Razor, Solo (after Batou) |
| Dodge | Jiff, Bamf | Mouse, Spoof | Wired (1.0's Chrome), Chipped |
| Tune | Ping, Feep | Parse, Phreak | Mentat, Gibson |
| Feast | Munch, Thrash | Gobble, Snarf | Nutri, Leech |
| Hidden adult | Guru | Ghost (1.0's) | Blank (hooded, camouflaged) |
| Elders (in adult order: Breach corp, street; Dodge; Tune; Feast; hidden) | Brick, Ram; Tick, Hop; Peek, Ding; Crunch, Swap; Init | Lynx, Fork; Daemon, Mask; Tree, Tone; Leak, Dump; Whisper (1.0's `ghostElder`) | Lancet, Frag; Plat (1.0's `wiredElder`), Surge; Savant, Observer; Broth, Helminth; Cipher (`blankElder`, has a motion layer) |
| Asleep / dead mark | queue of dots / dark barcode | block cursor / bright flatline | none / dim trace |

**Rogue (10 forms, hidden egg):** Foundling, Alias, Mole, Skip, Spook, Drop, Sleeper, Exile, Handler, Stash. Files `rogue-art.js`, `rogue-models.js`, `rogue-motion.js`, `rogue.test.js`; keys `protoR_<id>`; ids carry no lean (e.g. `rogueAdultBreach`); names in `ROGUE_NAMES`, kept apart from `FORM_NAMES`. Design record: [ROGUE_DRAFTS.md](../archive/netling2/ROGUE_DRAFTS.md).

**Form ids** are `eggLevelRoleLean`, not names: `ironBaby`, `ironTeenCorp`, `ironAdultBreachStreet`, `ironElderHidden`; likewise `program...` and `wetware...`. Roles Breach, Dodge, Tune, Feast; leans Corp and Street. `form-ids.js` builds the ids and holds the display names (`FORM_NAMES`, the only place a name lives). Ids are permanent once the app uses them. Names are not final until the elder art is.

## 3. Commands

```bash
npm run proto:test                 # all prototype tests
npm run proto:audit                # 1.0 sprite audit on Iron; EGG=program|wetware|rogue|all, or proto:audit:program, proto:audit:wetware
npm run proto:temper               # temper tell measurements against 1.0's idle (measurements, not rules)
npm run proto:gallery              # writes gallery-iron.html, gallery-program.html, gallery-wetware.html, gallery-rogue.html (generated, gitignored)
npm run serve                      # http://localhost:5174 ; /prototype/netling2/ (overview), /prototype/netling2/review.html (focus)
node prototype/netling2/wear-motion-audit.mjs       # wearables over Blank's elder and Handler's motion layers (measurements)
SECS=60 node prototype/netling2/holologo-audit.mjs  # the holologo clip on every 2.0 form (measurements)
```

Option pages (under `npm run serve`): `echo-preview.html`, `rogue-options.html`, `rogue-preview.html`, `rogue-burn-preview.html`, `wearables-motion-preview.html`, `accessory-ideas-preview.html` (ideas in [ACCESSORY_IDEAS.md](../archive/netling2/ACCESSORY_IDEAS.md)).

## 4. Where to look

Serve with `npm run serve`; links are relative to `http://localhost:5174/prototype/netling2/`.

| Check | Page |
|---|---|
| A form's frames: A against B, asleep, dead, capture, anchors, the cells that change | `review.html`, view `frames` |
| Motion: the temper tell, 1.0 idle and its hold, idle actions, motion layers, visits, the Rogue burn | `review.html`, view `motion` (filmstrip and change track for frame-by-frame review) |
| Neglect, bugs, seams, state marks at every level | `review.html`, view `damage` |
| Wearables on a form, alone or in motion; every wearable on one form | `review.html`, view `wear` |
| Every form of an egg at once; tints, props, visitors, 1.0's own gallery checks | `index.html`, `gallery-<egg>.html` (`npm run proto:gallery`) |
| Option sets: echo styles, Rogue effects, style ideas, holologo options, burns | the single-purpose pages (section 3) |
| Machine checks (sizes, frames, silhouettes, flash rule, screen bounds) | `npm run proto:test`, `npm run proto:audit` |

- **Focus page** (`review.html`, helpers `review.js`, tests `review.test.js`): pick any forms across the four eggs (ticks or presets: an egg, a stage, a line, an adult and its elder) and one aspect; one clock for all screens. **Every setting, and the paused time, is in the URL hash**, so a link reopens the exact view. Example: `review.html#ids=programAdultTuneCorp&view=motion&level=-2&strip=8&stripMs=200&play=0&t=2000`.
- **Overview** (`index.html`) has a section per egg and global controls (palette, tell skin, temper, neglect, bugs, pose, wearables, seams, marks, Metronome, lights, idle hold). **Galleries** are 1.0's real `gallery.html` on one egg's forms plus a `layers` section (`gallery-layers.js`). Both draw layers with `render.js`.
- **Judging art:** start on the focus page, put the forms in question side by side in one aspect, share the link. An AI session loads that link in headless Chromium (Playwright, `executablePath: '/opt/pw-browsers/chromium'`) and screenshots it. Draw options side by side before committing when a form is contested; the maintainer reviews from screenshots. Screenshots live in `../netling2-prototypes/shots/`.

## 5. Rules the tests enforce (every new or redrawn form)

- **Size.** Baby 12 wide. Teens 14 wide, 11 to 12 rows. Adults 16 wide, 13 to 15 rows. Elders 18 wide, no more than 15 rows, never shorter than the adult. Marks only `. # o + x` (main, accent/eyes, highlight, dim).
- **Frames.** Rows 0 to the neck row are identical in A and B (only the lower body animates). The body's bottom (the last row with at least 0.4 of the width painted, as the wearable code reads it) is the same row in both. A and B differ by at least 4 outline cells. Anchors (`headTop`, `eyeRow`, `mouthRow`, `neckRow`) are in range, in order, point at painted cells and are the same in A and B. Most frame bugs came from the bottom-row rule.
- **Eyes** are 2x2 groups of `o` on `eyeRow` and the row below (the generic poses find them there). Head width for eyewear comes from the `headTop` row, so that row must cover the eyes.
- **Silhouette** (1.0 audit screen, centred overlap): no same-stage pair above 0.82. The two main teens are close (0.7 to 0.82); the hidden-path teen is at least 0.1 further from each (and under 0.72) and at least 20 outline cells different. Hidden-path forms must be distinct in outline.
- **Elders.** Each role elder is closest, after scaling its adult to the elder's size, to its own adult among all nine, and at least 0.75 (the unscaled score misleads for grown forms); elder pairs under 0.82. Margin over the closest other adult (scaled): Iron elders at least 0.07, Program elders at least 0.05 (Tiger is the thinnest at 0.053). Hand-drawn, not stretched.
- **Hidden forms may break the form rules** (maintainer): Ghost's elder is 1.0's Whisper (14 wide, smaller); Blank's elder has a motion layer that changes its outline.
- **Poses.** Asleep and dead keep the awake outline. The dead X is symmetric on two-cell eyes on all four eggs, and the two X's are two columns or more apart (`models.js` `xCentres`: where they would be closer, each half-cell centre rounds away from the other eye). `dead-eyes.test.js` checks both on every form (an arm dropped on an empty cell, as on Skip, is allowed).
- **Flash budget** (project rule 7): nothing flashes more than three times a second; no picture change faster than 200 ms (each layer keeps this on its own); motion layers use 400 ms steps. `render.test.js` checks the composed screen: no cell changes more than six times in any second, on every egg, level and motion setting with every layer on, and on every Rogue burn.
- **Contrast.** Graphics keep 3:1 against the screen on every palette (the Wetware shade dip is tested on all six); Razor's and Lancet's blades 4.49:1 or more.
- **Screen bounds.** No form leaves the screen at the far end of 1.0's idle wander with the tell added (`temper-pass.test.js`); every wearable on every form stays on the 30 row screen (`render.test.js`, the headroom test; it fails with `TOP = 0`).

**Design lessons.** The street lean adds to the corp body and keeps it blocky (cutting pieces away read as broken). A hidden form's lineage can ride on marks (hood peak, shimmer, crown), not outline. A pair of marks under the mouth reads as stray pixels or extra eyes. Reuse 1.0's A frame and re-time only its B frame. Asleep chest marks are dim fill from the row under the neck.

**The ready.js trap.** `src/accessories.js` builds its anchor table once on first load, and `src/sim.js` imports it. Any script, test or page that draws wearables on prototype forms must import `prototype/netling2/ready.js` **first**, or the wearable code silently guesses anchors (it throws if it did not take).

## 6. Layers over the sprites (not part of the registered frames)

Pure functions, composed by `render.js` in this order: room, frame (A or B on 1.0's 500 ms rhythm, asleep, dead, capture), tell, neglect, seams, bugs, idle actions, motion layer, wearables (on the registered frame; skipped when `form.hideWorn` or dead), state marks, prop, Z and flatline. Not drawn by it (the app's job): visitor, HUD icons, reactions, flow glow, evolution strobe, heat wash, glitch shake.

| Layer | File | Behaviour | Status |
|---|---|---|---|
| Temper tell | `tell.js` | Five levels (-6, -2, +3, +6 edges); steady = countable beat (6 s, 3 s strongly), unsteady = stutter and drift. Skins: Iron settles and drifts (`driftWithin` keeps it inside the idle's reach), Program blinks and hops, Wetware pulses brightness (`SHADE_DIP`). `tellPose` places wearables on the awake frame during a blink | Tested (`proto.test.js`, `temper-pass.test.js`). Edges are placeholders until 2.0 temper accrues |
| Idle hold | `tell.js` (`idleClock`, `idleHeld`, `unsteadyEvents`), `idle.js` | 1.0's idle stands still from 200 ms before to 600 ms after each steady beat, Iron drift step and Program hop. `idle.js` is a pure copy of 1.0's idle (a test checks constants against `src/render.js`). Switch `opts.idleHold`: `held` (default), `steady`, `none`, `tell` | Tested. Idle stands still about half the time (accepted) |
| Idle actions | `idle-actions.js` | 30 rule-based poses on every form, keyframes on the 500 ms grid, one still keyframe under reduced motion; `opts.idleActions` on by default | `idle-actions.test.js`; poses read small at 1x |
| Neglect | `neglect.js`, `needs.js` | Dim `x` on `#` body cells, bottom first, never over eyes or outline, exact counts. Adults and elders from below the mouth row, 12% and 30%; baby and teens (14 wide or less) from the row under the eyes, 20% and 40%. A form already about 40% `x` (Shell, Blank, Cipher) flips dim cells to `#`. `neglectOverMotion` forms take it after the motion layer. Level from the four care stats (soft 40, alert 20, heat 65 and 80, Integrity 60 and 30, 3 point guard) | Tested on all 66 forms. Stat lines unmeasured against play |
| Bugs | `glitch.js` | 0 to 5 bugs each tear one body row a column sideways in fixed order; persistent; twitch one more row for 400 ms every 3 s (not in reduced motion). Rows with paint on both frame edges only wrap, after every row with room is taken | Tested on all 66 forms. Cleared only at a clinic node |
| Seams | `seams.js` | Iron's wear seams: a cut outline cell plus a dim cell diagonally inward, placed by rule on all 22 Iron forms; `OVERRIDES` stays empty; Program and Wetware use the same mark as strain (Wired and Plat pinned, Shell, Blank, Cipher none) | Accepted as drafted (`seams.test.js`) |
| State marks | `marks.js`, `mark-colors.mjs` | Overclock wisps above, Overdrive sparks below the feet, Overlink dots three columns out; one pixel, 400 ms steps, still in calm mode; clear of Iron's drift (two columns) and settle (one row) | Drawn when awake; preview `../netling2-prototypes/state-mark-colors.png` |
| Metronome prop | `metronome.js`, `metronome-art.js` | Pendulum: steady swings every 1 s (0.5 s strongly), unsteady in windows of 0.5 s and 0.3 s; the tell's 6 s and 3 s land on a tick | Accepted as drafted; `metronome.test.js`. No sound, no real prop slot |
| Motion layer | `blank-motion.js`, `echo-motion.js`, `rogue-motion.js` | Cipher: camouflage scan band plus ghost dub (12 steps of 400 ms, 24 columns). Echo: Whisper fork lag, Init ratchet trail (`ECHO` knob; `echo.test.js`). Rogue: the decoy shadow on all ten, each line its own effect | Wearables over Cipher and Handler checked, nothing to fix (`wear-motion-audit.mjs`) |
| Rogue burn and glance | `rogue-burn.js`, `rogue-marks.js`, `tell.js` | Self-destruct at the third mark: one of three burns by `pickBurn(diedAt)`, 4 s with no wearables, then the ash heap (`captured`); `opts.burnStart`; reduced motion shows the heap. Rogue's tell skin is the glance (`rogueGlance`) | `rogue-burn.test.js`; review `rogue-burn-preview.html` |

**Facing (Worm, Fork).** A form with `faceFrom` (a row) mirrors its rows from there down while the idle carries it left (`idleFacing` in `idle.js`), after the damage layers; not while still, asleep or in a visit. Tested in `render.test.js`.

Neglect and bugs are meant to appear together (neglect leads to faults, faults roll bugs). Bugs are cleared only at a clinic node on a netrun, for scrip or Standing (see [DESIGN.md](DESIGN.md)).

## 7. Decisions already made (do not reopen)

- The idle hold extends to the unsteady end, the same window as the steady hold (2026-10-12). Steady Iron holds still on each beat (maintainer, option a).
- The 2.0 LCD has 2 rows of headroom on top, `TOP` in `render.js` (2026-10-12); 1.0 keeps 40x28.
- Dead X's two columns or more apart (X apart, 2026-10-12); the dead tag is dark (`o`), dim on Foundling and Alias.
- Worm and Fork use `faceFrom`: the renderer turns the original frames; a symmetric wag and a body wiggle were turned down (2026-10-13).
- The Wetware shade dip is 20% (`SHADE_DIP`), so every palette keeps 3.2:1 or more.
- One neglect skin for all eggs, rules by stage (maintainer). No per-egg skin.
- Bugs and neglect rules as in section 6.
- Visits pause motion, the look stays: no tell, no idle wander, no bug twitch during a visit; neglect, still bug tears and state marks stay (maintainer; `visit.js`: `visitLayers`, `visitMotion`).
- Form ids are `eggLevelRoleLean` (maintainer); names live only in `FORM_NAMES`.
- One mark for seam and strain on every egg (2026-10-09).
- Wetware and Blank wearables do not take Wetware's shade or Blank's and Cipher's camouflage, and should not (2026-10-13).
- Rogue: all ten forms accepted; shut third eye, ragged hem and scraped-off tag on all; all three self-destruct burns, one at random per death (2026-10-12); Exile is the cape; Handler has the headset signal.
- Hidden elders carry an echo (Cipher, Whisper, Init).
- The Metronome speeds are 1 s and 0.5 s steady (2026-10-13).
- The 200 ms rule per layer is enough; the measure that matters is under three flashes a second together.
- Iron's drift reads apart from 1.0's sway. Plat is Wired's elder.

The maintainer's sprite review finished 2026-10-13; four fixes (Worm's tail facing, Razor's and Lancet's blade colour, Cipher's neglect, the Metronome's speed) were accepted (`../netling2-prototypes/shots/review-fix-*.png`, `worm-facing.gif`).

## 8. What is left

1. **A device and real-renderer check** of everything: flicker, legibility at small size, the layers on a phone; `npm run smoke` for this work. Nothing has been seen on a device.
2. **A 2.0 app to host `render.js`.** The app's own layers (visitor, HUD icons, reactions, evolution strobe, heat wash, glitch shake) are not drawn anywhere yet; the app screen and HUD need the same 30 rows.
3. **The focus page's untested items:** the change-track click, `copy link`, the phone-width layout (no tint control, no CLI capture).
4. **Cross-layer flash rule.** Layers run on different clocks (500 ms frames, 400 ms motion and mark steps, 1333 ms drift steps), so one cell can change twice 100 to 133 ms apart. Together they stay under three flashes a second; whether the stricter 200 ms rule should hold across layers is open (it would change decided timing).
5. **Echo faintness** across palettes, tints, screens and wearables (the maintainer judges); echo padding can clip at the screen edge (the figure never does).
6. **1.0 art problems left under the freeze** (1.0 code, not changed): the **holologo** clips 1 px about a third of the time on every 1.0 form (**settled for 2.0 by the headroom; open for 1.0 only**; options `lower` (`a.top - 3`) and `clamp` measured by `holologo-audit.mjs`, render `../netling2-prototypes/shots/holologo-options.png`: lower leaves the tip touching the head, clamp changes 1.0's `placeWorn`); **headphones plus visor** merge into one band on every form; **ice's white marks** are 1.59:1.
7. **Not run, not known:** no balance run on neglect lines or temper edges; the audit's silhouette score is a screen, not a judgment. Rule prototypes: `../netling2-prototypes/README.md`.

## 9. The long record

Every draft, measurement and review round is in [SPRITES_HANDOFF_FULL_2026-10-13.md](../archive/netling2/SPRITES_HANDOFF_FULL_2026-10-13.md) (the previous full handoff) and [SPRITES_HISTORY.md](../archive/netling2/SPRITES_HISTORY.md). The design sketch it came from is [SKETCH_FULL.md](../archive/netling2/SKETCH_FULL.md); its decisions are now in [DESIGN.md](DESIGN.md).
