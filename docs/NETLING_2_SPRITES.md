# Netling 2.0 sprite prototype

Status: prototype and comparison. **Decided (maintainer): forms are authored in full, not composed.** The composed model below was prototyped and is kept only as the rejected alternative. Nothing here is wired into the game. The code is in `prototype/netling2/`; it is not part of `npm test`, it is not deployed, and it only reads the game's modules. Items marked proposal are mine; the decision between the two models is the maintainer's. It answers part of the sketch's "Sprite redesign" step: the Iron body at every stage of one line, the temper tell, the flicker guard and a neglected look. Companion to [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (see Neglect and the sprites, The temper tell, Making the steady end legible, Temper scale).

## Decision

Authored, for the current plan of forms (option C: two named forms per role, three teens, one hidden form). The reasons the numbers gave: with nine adults the composed forms missed the 1.0 silhouette bar and a role's two forms came out as near-identical outlines, which defeats having two named forms; the cost advantage of composing only appears at many forms per body, and the authored forms cleared the bar after a small redraw. Consequences:

- Each form is drawn in full and carries its own anchor rows, as in 1.0. The prototype ran every 1.0 wearable on the authored forms unchanged.
- The sprite audit and gallery will need the new forms added; the temper tell and neglect look are independent of how a form is built, so they carry over.
- Cost, an extrapolation from the Iron figures and not a measurement: the wider run was 3146 hand-placed cells for 3 teens and 9 adults, plus 154 for the baby, plus one elder per adult at 430 each as drawn (both frames), so roughly 7200 cells per egg and about 21500 for three, before any rework after review. The elders are over half of that.
- The composed code (`OVERLAYS`, `LEAN_OVERLAYS`, `TEEN_OVERLAYS`, `compose`, model A in `models.js`) stays in the prototype for reference and can be deleted; it is in git history either way.

### Decided since (maintainer)

- **Elders: one per adult**, each a variant of the adult it grows from (9 per egg, 27 in all). The prototype's elder is Gronk's.
- **Teens:** the two main teens per egg (corp lean, street lean) may differ only slightly. **Hidden paths must be distinct.** In the wider run the hidden teen differed from the street teen by marks only (outline overlap 0.95), which does not meet this: a hidden-path teen needs its own outline. The hidden adult (Guru) was already distinct (closest overlap 0.77).
- **Neglect and bugs (decided to try):** neglect is transient and comes from the care needs left unmet; bugs are the persistent layer and show as glitches. See What drives neglect and bugs, below.

## Scope

One line, four forms, as the maintainer asked: Iron, baby to elder. The line is **Baby, a street-leaning Teen, Gronk (Breach, street lean) and Gronk's Elder**. The sketch's full tree (3 teens and 9 adults per egg under option C) is not in this prototype. An earlier, wider version that drew all of it is in git history at commit `580db88`; its measured numbers are quoted below, marked as such, because the code that produced them is no longer in the tree. The line is a table (`FORMS` in `models.js`), so another can be swapped in.

## What was built

| Stage | Form | Size | Built in model A | Built in model B |
|---|---|---|---|---|
| Baby | Baby | 12 x 11 | authored, shared | authored, shared |
| Teen | Teen (street lean) | 14 x 12 | teen body + street overlay | authored in full |
| Adult | Gronk (Breach, street) | 16 x 14 | adult body + Breach overlay + street lean overlay | authored in full |
| Elder | Gronk's Elder | 18 x 15 | authored, a variant of Gronk, shared | authored, a variant of Gronk, shared |

- **Model A, composed.** A body per stage with overlays merged onto it. An overlay is a layer the size of the body: a mark replaces the body cell, `_` erases it, `.` leaves it. The street lean is lopsided (one antenna, a notched head corner, a taped patch); Breach adds horn studs, a toothed grille and heavy shoulders. All forms of a stage share the body's anchor rows.
- **Model B, authored.** The teen and Gronk drawn in full, each with its own anchor rows.
- **Temper tell** (`tell.js`), the same for both, on the sketch's five levels (strongly unsteady at -6 or lower, unsteady, middle, steady from +3, strongly steady from +6). Steady is a countable beat, the same move on an exact interval (every 6 s, every 3 s when strongly steady, independent of any seed). Unsteady is growing chaos: a stuttering frame and a drift, more of both when strong. Skins per egg: Iron settles a row on the beat and drifts a column at a time; Program blinks, stutters and hops; Wetware has a clean beat that goes irregular. Reduced motion keeps the steady beat (calm, tiny, predictable) and gives the unsteady levels a still variant (Iron one column off its grid, Program holding its alternate frame, Wetware a dimmer steady shade).
- **Flicker guard.** `guardedLevel(temper, currentLevel)` only moves the shown level once temper is 0.5 beyond a threshold, so a value hovering on one does not flip the tell. The 0.5 is a placeholder.
- **Neglect look** (`neglect.js`, level from `needs.js`). Iron's skin is rust: dim patches that spread from the bottom up in two levels, never over the eyes or above the mouth, never changing the outline. It does not move, so it is a different channel from temper, and reduced motion needs no variant. Anchors, poses and wearables are unaffected.
- **Bug glitch** (`glitch.js`). Each bug (0 to 5) tears one body row a column sideways; see What drives neglect and bugs.
- **Review page:** `npm run serve`, then `http://localhost:5174/prototype/netling2/`. Both lines side by side, controls for palette, tell skin, temper, neglect, reduced motion, pose, any 1.0 wearable and the anchor rows, how the composed forms are built, the timeline of the tell, and the metrics.
- **Poses.** Sleep and dead are generated from the A frame, as in 1.0 (X eyes when dead, slits asleep).
- **Real wearables.** `register.js` adds the prototype sprites to the game's own `SPRITES` and `ANCHOR_ROWS` tables before `src/accessories.js` loads, so the 1.0 wearable code places items on them unchanged. This only happens in the prototype page and its tests.

## Results for the line

Measured by `npm run proto:test` (37 tests) and shown on the page. Silhouette overlap is the 1.0 audit's screen (`tools/lib/sprite-checks.mjs`); 1.0 flags nothing above 0.82 within a stage, and a person judges the rest.

| | Model A, composed | Model B, authored |
|---|---|---|
| Hand-placed cells, teen and adult | 556 | 548 |
| Sprites drawn | 10 | 4 |

Baby and the elder are 584 hand-placed cells in both (154 and 430).

| Stage against stage (outline overlap) | A | B |
|---|---|---|
| Baby and Teen | 0.73 | 0.73 |
| Baby and Gronk | 0.51 | 0.48 |
| Baby and Elder | 0.37 | 0.37 |
| Teen and Gronk | 0.69 | 0.64 |
| Teen and Elder | 0.50 | 0.50 |
| Gronk and Elder | 0.70 | 0.77 |

- **Both read as one line.** Every pair is under 0.82 and over 0.3, in both models.
- **The elder is a variant of its adult.** It keeps Gronk's horns, slanted brow, toothed jaw and broad shoulders, grown to 18 columns and 15 rows. Against the authored Gronk it overlaps 0.77, the closest of any form in the line and inside the 0.77 to 0.82 that 1.0's mainframes sit at against their adult line; a test checks it. Against the composed Gronk it is 0.70, a small extra reason the authored adult suits a derived elder.
- **For one line the models cost the same.** A needs two bodies and three overlays to make two forms, so it has nothing to amortize. Composing only pays when the bodies are reused across many forms.
- **Where they differ.** The composed teen has the same outline as the authored one and differs by 2 mark cells. Composed Gronk differs from authored Gronk by 20 outline cells and 22 mark cells (outline overlap 0.89): the authored Gronk has a rounder brow, angry eyes and a ragged hem that an overlay on the shared body does not give.
- **Wearables.** 984 cases (every 1.0 wearable on all four forms and every pose, both models, through the real `placeWorn`). Four clip one pixel above the screen: the holologo on the 15 row sprites (the elder in both models). 1.0's own 15 row forms (Chrome, Firewall and the mainframes) clip the same way, so this is an existing quirk, not something the prototype adds. I did not change it.
- **Flash budget.** Over 120 seconds at 10 ms steps, for every egg, level and four seeds, with and without reduced motion, the picture (frame A, frame B or the blink) never changed less than 200 ms after the last and never more than six times in a second. Wetware's brightness swings at most 0.25 and moves at under 1 Hz. The flicker guard holds the level steady while temper alternates 0.4 either side of any threshold (0.8 of the guard width).
- **Steady beat.** Exactly on its interval, identical for any seed, and twice as often when strongly steady, for all three eggs.
- **Neglect.** Level 2 contains level 1's patches (the look grows and clears without jumping), only body cells below the mouth row change, and the outline is identical in every form and frame, in both models.
- **Anchors.** Every form's head, eye, mouth and neck rows are in range and in order, point at painted cells, and move at most one row between frames (the 1.0 rule).

## What the wider run showed (commit 580db88, not reproducible from this tree)

Before the scope was narrowed I built the full option C tree (3 teens and 9 adults) in both models. These figures were measured then with the same checks; the code that produced them is in that commit only.

| 3 teens and 9 adults | Model A, composed | Model B, authored |
|---|---|---|
| Hand-placed cells | 832 | 3146 |
| Closest pair of adults of different roles | Gronk and Thrash 0.89 | Feep and Thrash 0.80 |
| Pairs of different roles at 0.80 or above | 10 | 1 |
| A role's corp and street forms | 0.94, 0.75, 0.94, 0.70 | 0.85, 0.67, 0.75, 0.81 |

Three conclusions, which the one-line prototype cannot show:
- **Cost flips with the number of forms.** A was about a quarter of B's cells at 12 forms, and equal at 2. The break-even is a handful of forms per body.
- **Model A did not clear the 1.0 bar at 9 adults** (0.89, after a second pass on the lean overlays), and its two forms of a role were near-identical outlines. Model B cleared it after redrawing two forms.
- **This maps onto the sketch's option B against C.** Model A is, in effect, option B (one named form per role, the Standing lean as a visible variant); model B is option C (two genuinely different named forms per role). If option C stands, B is the safer fit for the adults; if the fallback to option B is used, A is the natural build.

## Open questions

The composition question is closed (see Decision).

1. Iron's unsteady tell is a drift off its grid. Is it distinct enough from 1.0's idle sway (a separate inherited quirk)? The steady settle and the Program blink are the other new motions to judge.
2. Neglect and bugs: the thresholds, the bug look and whether two looks are readable together on a device are untested; see What drives neglect and bugs.
3. Hidden-path teens and the other eight elders are not drawn.
4. Temper level edges and the guard width of 0.5, and Wetware's pulse numbers: tune with the balance tools once temper accrual exists.

## What drives neglect and bugs

Decided to try (maintainer): **neglect comes from unmet needs and is transient; bugs are the persistent layer and show as glitches.** Two looks on two channels, so the player reads each at a glance.

| | Neglect | Bugs |
|---|---|---|
| Input | The four care stats (Charge, Sync, Integrity, Heat, 0 to 100), read now | The bug count, 0 to 5 (the sketch's ceiling) |
| Persistence | Transient: a function of the stats now, so it clears as soon as the needs are met | Persistent: stays until the bugs are cleared (scrip, Standing or a netrun debug station) |
| Look | Rust: dim patches on the body from the bottom up, in two levels. Marks only, never moves, never changes the outline | Glitch: each bug tears one more body row a column sideways, in a fixed order, so the count reads at a glance |
| Motion | None, so reduced motion needs no variant | A bugged netling also twitches one more row for 400 ms every 3 s; reduced motion drops the twitch and keeps the still tears |
| Code | `needs.js`, `neglect.js` | `glitch.js` |

- **Neglect lines.** 1.0's own alert lines (Charge or Sync under 20, Heat over 80, from `needsAttention` in `src/sim.js`) are the alert line. A soft line sits earlier (40, 40, and Heat at 1.0's overclock line of 65). Integrity has no alert line in 1.0 (a virus is the alert), so its lines (60 and 30) are mine, to tune. Level 1 (worn) is one need past its soft line; level 2 (neglected) is one need past its alert line or two past soft.
- **Flicker guard.** A need has to clear a line by 3 points before the look changes back, so a stat hovering on a line does not flicker it. Placeholder, like the temper guard.
- **Tests (37 in all):** neglect lines and the transient behavior, the guard, one torn row per bug and never an eye row or a lost cell, persistence under reduced motion, a new bug adding exactly one tear, the outline staying within 0.8 overlap at five bugs, the twitch timing and its 200 ms floor, and the two looks combining without interfering.
- **Not measured:** how often needs sit past a line in real play (the balance tools have not been run on this), and how bugs and low needs overlap, since a neglected netling tends to fault and so to pick up bugs. Both looks can show at once; I have not judged whether that is too busy.
- **Open:** whether five bugs on a small form read as five distinct states or as a smear; the Dex and log wording for either look; the Iron, Wetware and Program skins other than rust and torn rows.

## Not done

- Not looked at on a phone or by anyone but me, and not at motion speed beyond screenshots of single frames. Whether the Iron art reads as firmware, whether the rust reads as neglect and not as part of the design, and whether the tells are legible are human calls.
- Program and Wetware have tell code and tests but no body art and no neglect skin, so their tells have only been checked as numbers, not seen.
- Idle behavior and chatter tone, the other two temper channels, are not prototyped. Nothing about Standing visuals beyond the street lean marks.
- `tools/sprite-audit.mjs` and `gallery.html` were not extended to the prototype forms; the checks above are the prototype's own tests plus the audit's shared pure helpers.
- The smoke test was not run. The page was loaded in headless Chromium with no console errors apart from the browser's favicon request.
- Nothing in `src/` was changed.
