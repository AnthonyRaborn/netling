# Netling 2.0 sprite prototype

Status: prototype and comparison for the maintainer's decision. Nothing here is wired into the game. The code is in `prototype/netling2/`; it is not part of `npm test`, it is not deployed, and it only reads the game's modules. Items marked proposal are mine; the decision between the two models is the maintainer's. It answers the sketch's "Sprite redesign" next step in part: the Iron body at every stage, the temper tell, the flicker guard and a neglected look. Companion to [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (see Neglect and the sprites, The temper tell, Making the steady end legible, Temper scale).

## What was built

One egg, Iron, at every stage, with its teens and adults built two ways so they can be compared before one is chosen. The form set follows the sketch: option C, so each egg has 3 teens (corp lean, street lean, hidden path) and 9 adults (four roles with a corp-leaning and a street-leaning form each, plus the hidden one).

| Stage | Forms | Size | Same in both models |
|---|---|---|---|
| Baby | 1 | 12 x 11 | yes |
| Teen | Corp, Street, Hidden | 14 x 12 | no |
| Adult | Breach: Splat (corp), Gronk (street). Dodge: Jiff, Bamf. Tune: Ping, Feep. Feast: Munch, Thrash. Hidden: Guru | 16 x 13 to 15 | no |
| Elder | 1 | 18 x 15 | yes |

- **Model A, composed.** A body per stage with overlays merged onto it. An overlay is a layer the size of the body: a mark replaces the body cell, `_` erases it, `.` leaves it. An adult is the adult body plus a role overlay plus a lean overlay (the hidden form has no lean); a teen is the teen body plus one overlay. The corp lean is symmetric and tidy (a cap bar, an under-eye strip, shoulder studs); the street lean is lopsided (one antenna, a notched head corner, a taped patch). All forms of a stage share the body's anchor rows.
- **Model B, authored.** Each teen and adult drawn in full, with its own silhouette and its own anchor rows.
- **Temper tell** (`tell.js`), shared by both, on the sketch's five levels (strongly unsteady at -6 or lower, unsteady, middle, steady from +3, strongly steady from +6). Steady is a countable beat, the same move on an exact interval (every 6 s, every 3 s when strongly steady, independent of any seed). Unsteady is growing chaos: a stuttering frame and a drift, more of both when strong. Skins per egg: Iron settles a row on the beat and drifts a column at a time; Program blinks and stutters and hops; Wetware has a clean beat that goes irregular. Reduced motion keeps the steady beat (calm, tiny, predictable) and gives the unsteady levels a still variant (Iron one column off its grid, Program holding its alternate frame, Wetware a dimmer steady shade).
- **Flicker guard.** `guardedLevel(temper, currentLevel)` only moves the shown level once temper is 0.5 beyond a threshold, so a value hovering on one does not flip the tell. The 0.5 is a placeholder.
- **Neglect look** (`neglect.js`). Iron's skin is rust: dim patches that spread from the bottom up in two levels, never over the eyes or above the mouth, never changing the outline. It does not move, so it is a different channel from temper, and reduced motion needs no variant. The anchors, poses and wearables are unaffected.
- **Review page:** `npm run serve`, then `http://localhost:5174/prototype/netling2/`. Controls for palette, tell skin, temper, neglect, reduced motion, pose, any 1.0 wearable and the anchor rows; it also shows how each model-A form is built, the timeline of the tell, and the metrics.
- **Poses.** Sleep and dead are generated from the A frame, as in 1.0 (X eyes when dead, slits asleep; a hidden form's third eye goes dark in both).
- **Real wearables.** `register.js` adds the prototype sprites to the game's own `SPRITES` and `ANCHOR_ROWS` tables before `src/accessories.js` loads, so the 1.0 wearable code places items on them unchanged. This only happens in the prototype page and its tests.

## Results

Measured by `npm run proto:test` (32 tests) and shown on the page. The silhouette overlap is the 1.0 audit's screen (`tools/lib/sprite-checks.mjs`), where 1.0 flags nothing above 0.82 within a stage. It is a screen; a person judges.

| 3 teens and 9 adults | Model A, composed | Model B, authored |
|---|---|---|
| Hand-placed cells | 832 | 3146 |
| Sprites drawn | 24 | 24 |
| Adults of different roles: closest pair | Gronk and Thrash 0.89 | Feep and Thrash 0.80 |
| Adults of different roles: mean overlap | 0.76 | 0.66 |
| Adults of different roles: pairs at 0.80 or above | 10 | 1 |
| A role's two forms (Splat/Gronk, Jiff/Bamf, Ping/Feep, Munch/Thrash) | 0.94, 0.75, 0.94, 0.70 | 0.85, 0.67, 0.75, 0.81 |
| Teens: closest pair | Street and Hidden 0.97 | Street and Hidden 0.95 |

Baby and elder are 512 hand-placed cells in both.

- **The comparison shifted when the form count did.** With five adults, model A cleared the 0.82 bar after one extra pass (worst pair 0.81, against B's 0.77). With the nine adults option C asks for, A does not: the lean overlays make forms of the same lean resemble each other, and a role's two forms are near-identical outlines (Splat and Gronk 0.94, Ping and Feep 0.94). I gave A a second pass on the lean overlays and stopped there; the cause is structural, since an overlay adds and erases cells but the body's core stays. B needed one redraw (Splat gained a piston, Thrash became an ovoid) and then cleared the cross-role bar.
- **This maps onto the sketch's option B against C.** Model A is, in effect, the sketch's option B: one named form per role with the Standing lean as a visible variant (a look and a small perk, with a terminal indicator). Model B is option C: two genuinely different named forms per role. So the composition choice is tied to the form-count choice, not independent of it. If option C stays, B is the safer fit for the adults; if the fallback to option B is used, A is the natural build and the lean marks are the "terminal indicator".
- **Teens are marks in both.** The teen is meant to be a readable preview of the lean, and in both models the three teens differ mostly by marks (a strip and studs, an antenna and a patch, a crown and a third eye) over a similar outline. Closest pair 0.97 in A and 0.95 in B. I left that as it is.
- **Wearables.** 3444 cases (every 1.0 wearable on every prototype form and pose, both models, through the real `placeWorn`). Six clip one pixel above the screen: the holologo on the 15 row sprites (elder in both models, B's Guru). 1.0's own 15 row forms (Chrome, Firewall and the mainframes) clip the same way, so this is an existing quirk, not something the prototype adds. I did not change it.
- **Flash budget.** Over 120 seconds at 10 ms steps, for every egg, level and four seeds, with and without reduced motion, the picture (frame A, frame B or the blink) never changed less than 200 ms after the last and never more than six times in a second. Wetware's brightness swings at most 0.25 and moves at under 1 Hz. The flicker guard holds the level steady while temper alternates 0.4 either side of any threshold (0.8 of the guard width).
- **Steady beat.** Exactly on its interval, identical for any seed, and twice as often when strongly steady, for all three eggs.
- **Neglect.** Level 2 contains level 1's patches (the look grows and clears without jumping), only body cells below the mouth row change, and the outline is identical in every form and frame, in both models.
- **Anchors.** Every form's head, eye, mouth and neck rows are in range and in order, point at painted cells, and move at most one row between frames (the 1.0 rule).

## What each model costs and gives up

- **A is about a quarter of B's hand-placed cells** for the teens and adults (832 against 3146), and a new role or a new egg costs overlays instead of whole sprites. The gap widens with every egg.
- **A's forms are siblings by construction.** That is what makes it cheap and also what costs it the distinct named forms of option C.
- **A's roles share anchors**, so every wearable sits in the same place on all forms (the sketch's proposal). B's forms can differ (Munch and Thrash have a lower neck row) at the price of a per form anchor table like 1.0's.
- **A can derive things.** The head moves down a row between frames, so overlay parts on the head must shift too; they are written by hand here and could be generated. I did not try.
- **B reads at a glance on a small screen; A relies more on marks.** I looked at the page in a desktop browser only. This is the point most worth checking on a phone.

Proposal, not a decision: keep B for the adults if option C stands, and take A if the fallback to option B is used. A hybrid (compose the teens and the roles, redraw only the lean forms that collide) is possible and I have not built it. If cost is the deciding factor, A for the teens (where a mark preview is all that is wanted) is the cheapest saving.

## Open questions for the decision

1. Option C with authored adults (B), or the option B fallback with composed adults (A)? This decides the composition model.
2. Teens: marks over one outline is how both models read. Is that enough of a preview of the lean, or should teens differ in outline too?
3. Should the elder stay one authored form per egg, as built, or grow from the adult body?
4. Iron's unsteady tell is a drift off its grid. Is that distinct enough from 1.0's idle sway (a separate inherited quirk)? The steady settle and the Program blink are the other new motions to judge.
5. Neglect: reversible and tied to unmet needs, as the sketch asks, or does a mark persist to the next stage? Not decided in the sketch; the prototype only draws the reversible look.
6. Temper level edges and the guard width of 0.5, and Wetware's pulse numbers: tune with the balance tools once temper accrual exists.

## Not done

- Not looked at on a phone or by anyone but me, and not at motion speed beyond screenshots of single frames. Whether the Iron art reads as firmware, whether the rust reads as neglect and not as part of the design, and whether the tells are legible are human calls.
- Program and Wetware have tell code and tests but no body art and no neglect skin, so their tells have only been checked as numbers, not seen.
- Idle behavior and chatter tone, the other two temper channels, are not prototyped. Nothing about Standing visuals beyond the lean marks.
- `tools/sprite-audit.mjs` and `gallery.html` were not extended to the prototype forms; the checks above are the prototype's own tests plus the audit's shared pure helpers.
- The smoke test was not run. The page was loaded in headless Chromium with no console errors apart from the browser's favicon request.
- Nothing in `src/` was changed.
