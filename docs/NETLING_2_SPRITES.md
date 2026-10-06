# Netling 2.0 sprite prototype

Status: prototype and comparison for the maintainer's decision. Nothing here is wired into the game. The code is in `prototype/netling2/`; it is not part of `npm test`, it is not deployed, and it only reads the game's modules. Items marked proposal are mine; the decision between the two models is the maintainer's. Companion to [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), whose backlog item "the composed-form sprite spec" this answers.

## What was built

One egg, Iron, at every stage, with its five adults built two ways so they can be compared before one is chosen.

| Stage | Forms | Size | Same in both models |
|---|---|---|---|
| Baby | 1 | 12 x 11 | yes |
| Teen | 1 | 14 x 12 | yes |
| Adult | 5: Gronk (Breach), Jiff (Dodge), Feep (Tune), Munch (Feast), Guru (hidden) | 16 x 13 to 15 | no, this is the comparison |
| Elder | 1 | 18 x 15 | yes |

- **Model A, composed.** One adult body (16 x 14) and five role overlays. An overlay is a layer the size of the body: a mark replaces the body cell, `_` erases it, `.` leaves it. Role marks: Breach horn studs, teeth, heavy shoulders; Dodge wing fins and a trimmed body; Tune antennae, big ear plates and a narrowed stem; Feast a chin intake slot and a belly bulge; hidden a crown, a third eye, lit seams and a flared hem. All five share the body's anchor rows.
- **Model B, authored.** Each adult drawn in full with its own silhouette and its own anchor rows.
- **Temper tell** (`tell.js`), shared by both: a pure function of egg, temper, time and seed returning the frame, a column and row offset, and a brightness. Iron drifts off its grid a column at a time and snaps back, Program stutters and hops a row, Wetware pulses. Bands (orderly below 0.35, volatile from 0.65) are placeholders for the balance tools.
- **Reduced motion:** every egg has a still variant. Iron sits permanently one column off its grid, Program holds its alternate frame, Wetware holds a slightly dimmer steady shade.
- **Review page:** `npm run serve`, then `http://localhost:5174/prototype/netling2/`. Controls for palette, tell skin, temper, seed, reduced motion, pose, any 1.0 wearable and the anchor rows. It also shows how each model-A form is built and the metrics below.
- **Poses.** Sleep and dead are generated from the A frame, as in 1.0 (X eyes when dead, slits asleep; the hidden form's third eye goes dark in both).
- **Real wearables.** `register.js` adds the prototype sprites to the game's own `SPRITES` and `ANCHOR_ROWS` tables before `src/accessories.js` loads, so the 1.0 wearable code places items on them unchanged. It does this only in the prototype page and its tests.

## Results

Measured by `npm run proto:test` and the page. The silhouette overlap is the 1.0 audit's screen (`tools/lib/sprite-checks.mjs`), where 1.0 flags nothing above 0.82 within a stage. It is a screen; a person judges.

| Five adults | Model A, composed | Model B, authored |
|---|---|---|
| Hand-placed cells | 522 | 1408 |
| Sprites drawn | 12 (1 body + 5 overlays, 2 frames each) | 10 |
| Closest silhouette pair | Jiff and Munch 0.81 | Gronk and Guru 0.77 |
| Mean overlap over the 10 pairs | 0.75 | 0.65 |
| Pairs at 0.80 or above | 3 | 0 |

Baby, teen and elder are 726 hand-placed cells in both.

- **Model A needed a second pass to clear the bar.** The first overlays left Feep and Guru at 0.93, Gronk and Feep 0.88, Gronk and Guru 0.86, all over 0.82. Adding larger ear plates and a narrowed stem to Tune, and a wider crown and flared hem to Hidden, brought the worst pair to 0.81. The cause is structural: an overlay can add and erase cells but the body's core stays, so roles that mostly add interior marks keep the same outline.
- **Model B clears it without iteration.** Its widest range is Jiff (112 cells, slim) against Gronk (172, broad).
- **Wearables.** 1968 cases (every 1.0 wearable on every prototype form and pose, both models, run through the real `placeWorn`). Six clip one pixel above the screen: the holologo on the 15 row sprites (elder in both models, B's Guru). 1.0's own 15 row forms (Chrome, Firewall and the mainframes) clip the same way, so this is an existing quirk, not something the prototype adds. I did not change it.
- **Flash budget.** Over 120 seconds at 10 ms steps, for every egg, five temper values and four seeds, a frame never changed less than 200 ms after the last, and never more than six changes in a second. Wetware's brightness swings at most 0.25, moves at under 1 Hz and never jumps between samples.
- **Anchors.** Every form's head, eye, mouth and neck rows are in range and in order, point at painted cells, and move at most one row between frames (the 1.0 rule).

## What each model costs and gives up

- **A is about 37% of B's hand-placed cells for the adults.** The gap grows with every role and every egg: a new role costs one overlay of 32 to 72 cells (both frames) instead of an adult of about 280 (both frames), after a one-off body of 282. Program and Wetware would reuse the method on their own bodies.
- **A's roles share anchors.** Every wearable sits in the same place on all five roles, which is exactly what the sketch proposed (shared anchor rows). B's forms can differ (Munch's neck row is lower), at the price of a per form anchor table like 1.0.
- **A's silhouettes sit close to the limit**, and a sixth role or a tweak to the shared body can push a pair over. B has room.
- **A can derive things.** The head moves down a row between frames, so overlay parts on the head must shift too (written by hand in the prototype); that could be generated. I did not try.
- **B reads at a glance on a small screen; A relies more on marks.** I looked at the page in a desktop browser only. This is the point most worth checking on a phone.

Proposal, not a decision: use A for the three Program and Wetware adult sets if the silhouette bar is accepted as the 0.82 screen, and B (or a hybrid where only the roles that would collide get a full redraw) for anything that comes out near the limit. If every form must read distinctly at phone size without relying on marks, take B.

## Open questions for the decision

1. A or B (or the hybrid above) for the adults?
2. Teen: one body per egg here. Should teens differ by anything but temper (the sketch has not named teen forms)?
3. Should elder stay one authored form per egg, as built, or grow from the adult body?
4. Should the volatile Iron drift stay, or should Iron's tell be something that cannot be confused with the 1.0 idle sway (the quirk is separate and inherited)?
5. Temper band edges and Wetware's pulse numbers: tune with the balance tools once temper accrual exists (it is not designed yet).

## Not done

- Not looked at on a phone or by anyone but me, and not at motion speed beyond screenshots of single frames. Whether the Iron art reads as firmware and whether the tell is "somewhat mysterious but clearly differentiated" is a human call.
- Program and Wetware have tell code and tests but no body art, so their tells have only been checked as numbers, not seen.
- `tools/sprite-audit.mjs` and `gallery.html` were not extended to the prototype forms; the checks above are the prototype's own tests plus the audit's shared pure helpers.
- The smoke test was not run.
- No chatter, idle behaviour, DEX text or Standing visuals.
- Nothing in `src/` was changed.
