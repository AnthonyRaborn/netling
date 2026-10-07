# Netling 2.0 sprite prototype

Status: prototype and comparison. **Decided (maintainer): forms are authored in full, not composed.** The composed model below was prototyped and is kept only as the rejected alternative. Nothing here is wired into the game. The code is in `prototype/netling2/`; it is not part of `npm test`, it is not deployed, and it only reads the game's modules. Items marked proposal are mine; the decision between the two models is the maintainer's. It answers part of the sketch's "Sprite redesign" step: the Iron body at every stage of one line, the temper tell, the flicker guard and a neglected look. Companion to [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (see Neglect and the sprites, The temper tell, Making the steady end legible, Temper scale).

## Decision

Authored, for the current plan of forms (option C: two named forms per role, three teens, one hidden form). The reasons the numbers gave: with nine adults the composed forms missed the 1.0 silhouette bar and a role's two forms came out as near-identical outlines, which defeats having two named forms; the cost advantage of composing only appears at many forms per body, and the authored forms cleared the bar after a small redraw. Consequences:

- Each form is drawn in full and carries its own anchor rows, as in 1.0. The prototype ran every 1.0 wearable on the authored forms unchanged.
- The sprite audit and gallery will need the new forms added; the temper tell and neglect look are independent of how a form is built, so they carry over.
- Cost: Iron's whole tree is now drawn and measured, 22 forms and 6306 hand-placed cells counting both frames (baby 154, three teens 626, nine adults 2470, nine elders 3056). If Program and Wetware cost the same, three eggs come to about 19000 cells (an extrapolation, not a measurement), before any rework after review. The elders are about half of it.
- The composed code (`OVERLAYS`, `LEAN_OVERLAYS`, `TEEN_OVERLAYS`, `compose`, model A in `models.js`) stays in the prototype for reference and can be deleted; it is in git history either way.

### Decided since (maintainer)

- **Elders: one per adult**, each a variant of the adult it grows from (9 per egg, 27 in all). All nine of Iron's are drawn.
- **Babies:** eventually each egg gets its own baby. Iron's is the only one drawn; Program and Wetware babies are not.
- **Teens:** the two main teens per egg (corp lean, street lean) may differ only slightly. **Hidden paths must be distinct.** In the wider run the hidden teen differed from the street teen by marks only (outline overlap 0.95), which did not meet this. Iron's hidden-path teen is now drawn with its own outline (see The hidden path, below). The hidden adult (Guru) was already distinct (closest overlap 0.77).
- **Neglect and bugs (decided to try):** neglect is transient and comes from the care needs left unmet; bugs are the persistent layer and show as glitches. See What drives neglect and bugs, below.

## Program (baby, teens, adults and elders)

Drawn after Iron, from 1.0's art as the guideline (maintainer's call: reuse 1.0 sprites directly where they fit). Code: `program-art.js`, `program-models.js`, `program.test.js`, registered by `register.js` under the key `protoP_<id>`. In the audit wrapper (`npm run proto:audit:program`, or `EGG=program` / `EGG=all` with `proto:audit`; the default stays Iron so its numbers remain comparable). Also in the generated gallery (`prototype/netling2/gallery-program.html`) and the review page (its own section, with the same controls).

| Form | Source | Size |
|---|---|---|
| Baby | 1.0's Bitling | 12 x 12 |
| Teen, corp lean | 1.0's Kernel | 14 x 11 |
| Teen, street lean | new: Kernel's blocky body kept whole, with a spiked mohawk, a dark unibrow, arms like elongated exclamation points and wide boots | 14 x 11 |
| Teen, hidden path | 1.0's Shell (1.0's hidden teen, which grows into the Ghost) | 14 x 12 |

- **Stub has no slot.** 1.0's Stub was the teen that faults picked, and faults no longer choose a teen form.
- **What the 2.0 rules changed.** The A frames are 1.0's, unchanged (a test checks it). The B frames are not: 1.0's Bitling, Kernel and Shell move the head, eyes or both between frames, which makes wearables bob, so each B frame keeps the head and takes only the legs. The Shell's own B frame swaps its last two rows, leaving a last row too thin for the wearable code to find the body's bottom, so its feet widen outward instead. A and B differ by only 4 to 8 cells (the audit floor is 4), so these forms animate quietly.
- **Poses.** Sleep and dead are the generic 1.0 poses (slit eyes, X eyes) plus Program's own chest mark, from the sketch's Program register (interrupt-driven, a process that ends): asleep is a block cursor waiting for an interrupt, dead is a flatline run across the chest. A pair of marks for asleep read as a second pair of eyes, hence one block. The marks are a proposal.
- **Teens.** Corp and street overlap 0.82 (0.816; 19 outline cells and 6 marks differ), at 1.0's 0.82 bar and closer than Iron's 0.74 because Kernel is a compact shape. The street teen took six passes: the first (0.94, 5 cells differ) failed the audit; the second (0.81) cut the right side away and read as a broken robot; the third (0.81, hunched and lopsided) still read as broken; the fourth added horns, brows and wide boots and read as a different creature; the fifth added exclamation-point arms to the horned body, which was not what the maintainer meant; the sixth (current) is the blocky Kernel body with a mohawk, a unibrow and bar-and-dot arms, which the maintainer had liked in an earlier candidate. Lesson recorded: for the street lean, add rather than remove, and keep the body blocky. The hidden teen is 0.63 from corp and 0.72 from street, so the test that the hidden teen is further from each main teen than the main pair are from each other by 0.1 holds only just (0.72 against 0.816), and its absolute ceiling is now 0.72 (it was 0.7). The main-teen outline test allows up to 24 differing cells. Whether the lean reads on a phone is a by-eye call.
- **Wearables.** All 41 non-prop wearables on every Program form and pose (492 cases): none leave the screen, and none move between frames (164 cases).
- **Audit (Program's 4 forms, `npm run proto:audit:program`).** The first run flagged corp and street teens at 0.94, above 1.0's 0.82 bar; after the street teen's redraw the highest same-stage pair is 0.81 and nothing else is flagged. Everything is at or inside 1.0: the holologo clips 1 px on the baby and the hidden teen (as on 1.0's forms), the necktie loses half its pixels on the corp teen on the ice palette (0.60), and the worst worn combinations are the usual ones (Chrome jaw over Gold chain 0.83, over Necktie 0.80, worst on the baby). 
- **The nine adults** (option C: corp then street within a role, then the hidden form). Only Ghost has a 1.0 slot (1.0's hidden adult, which the hidden teen Shell grows into); the other eight are new, on 1.0's language (rounded bodies, antennae, 2x2 accent eyes), the corp lean tidy and symmetric and the street lean ragged, as with the teens. All 16 columns, 13 to 14 rows (Mouse is 13), with their own anchor rows.

  | Role | Corp | Street | Motif |
  |---|---|---|---|
  | Breach | Tiger | Worm | Tiger: broad shoulders, arms apart, fangs, stripes. Worm: a head with jaws on a narrower column striped down the body |
  | Dodge | Mouse | Spoof | Mouse: small, big round ears, a flicking tail. Spoof: hooded, half masked (the left half of the face is dim), ragged cape |
  | Tune | Parse | Phreak | Parse: a screen head with bracket antennae and a line of text for a mouth, on a slim stand. Phreak: a narrow head between huge headphone cups, a swaying cable |
  | Feast | Gobble | Snarf | Gobble: a small head on a big round belly, a wide mouth right under the eyes (teeth over a dark maw). Snarf: almost all jaw, a dark maw with teeth above and below |
  | Hidden | Ghost (1.0's) | | |

- **Distinctness.** The closest same-stage pairs are Tiger and Snarf 0.78, Snarf and Ghost 0.78, then Mouse and Snarf 0.76; every pair is under 1.0's 0.82 and Iron's highest (0.81). Each role's two forms overlap under 0.8 and differ by 20 or more outline cells (a test checks it).
- **Frames.** Rows 0 to the neck row are identical in A and B and the body's bottom is the same row in both. A and B differ by 4 to 14 cells: Phreak's cables sway (7 in the adult), Ghost's hem shifts (8), Worm's tail swishes (6) and its stripes step between frames, the rest move their feet, tail or belly (4 to 8). Ghost's B frame is 1.0's with the head frozen and the hem's last row kept, because 1.0's B moves the mouth and thins the last row, which would move the bottom.
- **Audit (the nine adults added, 13 forms).** Nothing new flagged. The highest same-stage pair is still the teens at 0.81. The holologo clips 1 px on 11 of the 13 forms (all but the corp and street teens, as on 1.0's forms), and no wearable loses half its pixels in the dark. All 41 wearables on all 13 forms: none move between frames (533 cases) and none leave the screen (1599 cases).
- **The nine elders** (ids `<adult>Elder`, names undecided). Hand-drawn the way Iron's were (the maintainer chose this over stretching each adult mechanically, which was tried first and compared side by side): 18 columns against 16, 14 to 15 rows, keeping the adult's own marks and growing a feature of its own (Tiger's bigger ears and bolder stripes, Worm's longer crown, Mouse's torn, tagged ear against a whole tall one, whiskers and a tail, Spoof's longer hood and cape, Parse's doubled brackets, Phreak's hooked cables, Gobble's navel and heavier belly, Snarf's tusks). Rows 0 to the neck row are identical in A and B, and anchors follow each drawing. **Ghost's elder is 1.0's Whisper** (the maintainer's call), which keeps 1.0's size (14 columns, smaller than the Ghost, its body thinning to a wisp): a hidden form may differ from the other forms' rules, so the elder width, height and closest-to-its-adult rules skip it. Its B frame keeps the head and mouth still, as 1.0's moves the mouth.
- **Elder numbers.** Each role elder is closest, after scaling its adult to the elder's size, to its own adult among all nine (the 1.0 raw score misleads for a form that has grown; see The nine elders). Margins over the nearest other adult: Parse 0.02 (Snarf), Phreak 0.08 (Ghost), Gobble 0.08, Tiger 0.06, Mouse 0.05, Worm 0.07, Spoof 0.13, Snarf 0.08. The closest elder pairs are Tiger's and Snarf's, Worm's and Ghost's, and Mouse's and Snarf's, all 0.81 and under 0.82.
- **Audit (all 22 forms, elders as mainframes).** Nothing new flagged. The holologo clips 1 px on the 20 forms that are not the corp and street teens, the same 15 row clip as 1.0's forms (a test accepts it only where 1.0 already clips). All 41 wearables on all 22 forms: none move between frames (902 cases) and none leave the screen except that clip.
- **Not drawn:** names for the teens and the elders.

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
- **Poses** (`ironMarks` in `models.js`). Sleep and dead start from the generated 1.0 poses (slit eyes asleep, X eyes dead; a hidden form's third eye goes dark) and add Iron's own mark on the chest, from the sketch's Iron register (batch work, and a decommission that leaves a read-only record): **asleep shows a queue**, four accent dots in a row (work waiting for the next batch); **dead shows a read-only record**, a dark barcode stamped across the chest (the last write). Marks only: they replace body cells, never touch the eyes or the outline. Every form has both, and a test checks it.
- **Real wearables.** `register.js` adds the prototype sprites to the game's own `SPRITES` and `ANCHOR_ROWS` tables before `src/accessories.js` loads, so the 1.0 wearable code places items on them unchanged. This only happens in the prototype page and its tests.

## Results for the line

Measured by `npm run proto:test` (44 tests at the time; it now also holds Program's) and `npm run proto:audit` and shown on the page. Silhouette overlap is the 1.0 audit's screen (`tools/lib/sprite-checks.mjs`); 1.0 flags nothing above 0.82 within a stage, and a person judges the rest.

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
- **Wearables.** Re-measured on the whole tree after the anchor fix below; see Fit and frame stability. (An earlier figure here was taken with guessed anchors.)
- **Flash budget.** Over 120 seconds at 10 ms steps, for every egg, level and four seeds, with and without reduced motion, the picture (frame A, frame B or the blink) never changed less than 200 ms after the last and never more than six times in a second. Wetware's brightness swings at most 0.25 and moves at under 1 Hz. The flicker guard holds the level steady while temper alternates 0.4 either side of any threshold (0.8 of the guard width).
- **Steady beat.** Exactly on its interval, identical for any seed, and twice as often when strongly steady, for all three eggs.
- **Neglect.** Level 2 contains level 1's patches (the look grows and clears without jumping), only body cells below the mouth row change, and the outline is identical in every form and frame, in both models.
- **Anchors.** Every form's head, eye, mouth and neck rows are in range and in order, point at painted cells, and move at most one row between frames (the 1.0 rule).

## The hidden path (Iron)

Drawn, authored: the **hidden-path teen**, which grows into **Guru** (the hidden adult, restored from the wider run). The other main teen (corp lean) is back too, so the three teens can be compared. Both are in the authored model only. Guru's elder is not drawn.

| Teen pair (outline overlap) | Overlap | Outline cells that differ |
|---|---|---|
| Corp and Street (the two main teens) | 0.74 | 14 |
| Hidden and Corp | 0.59 | 56 |
| Hidden and Street | 0.61 | 44 |

- **It stands clear of both.** The hidden teen is further from each main teen (0.59 and 0.61) than they are from each other (0.74), by tens of outline cells and not by marks. A test enforces both: more than 0.1 lower overlap than the main pair, and at least 20 outline cells different.
- **How it is built.** Slimmer than the others (a 10 column body against 12), a narrow neck, a crown, a third eye, and two detached side orbs, 13 rows against 12. It shares Guru's crown and third eye.
- **First try failed.** My first draw kept the blocky body and only added the crown and third eye; it overlapped the street teen at 0.80, less distinct than the main teens are from each other. I redrew it. This is the same marks-over-an-outline problem the wider run had.
- **Against the adult it grows into.** By outline the hidden teen is further from Guru (0.56) than the street teen is (0.66). What carries the lineage is the crown and the third eye, not the silhouette. Whether that is enough of a preview is a judgment; a person should look at it.
- **Not drawn:** the hidden-path teens of Program and Wetware, Guru's elder, and the elders of the other eight adults.

## The nine elders (Iron)

Drawn, authored: one elder per adult, each its adult grown to 18 columns (against 16) and no taller than 15 rows, keeping that adult's own marks. The other seven adults (Splat, Jiff, Bamf, Ping, Feep, Munch, Thrash) are restored from the wider run, authored only, so Iron's whole tree is now in the prototype: baby, three teens, nine adults, nine elders. Elder names are not decided; ids follow the adult (`splatElder`, ...).

**The 1.0 overlap score misleads for a form that has grown.** It centres two sprites without scaling, so a wider elder scores lower against its own adult than against a big filled slab (Splat, a full rectangle, attracts every blocky elder). By that raw score five elders are closer to another adult than to their own (Gronk's to Splat 0.81, Jiff's to Ping 0.76, Ping's to Guru 0.81, Thrash's to Splat 0.83, Guru's to Splat 0.84). A plain stretch of an adult shows the same effect, so it is the measure and not the drawing. I therefore also measure the overlap after scaling the adult to the elder's size (nearest neighbour) and require that: each elder must be closest to its own adult among all nine.

| Elder | Overlap with its own adult (scaled) | Closest other adult |
|---|---|---|
| Splat's | 0.95 | Gronk 0.79 |
| Gronk's | 0.84 | Splat 0.82 |
| Jiff's | 0.82 | Ping 0.70 |
| Bamf's | 0.81 | Ping 0.76 |
| Ping's | 0.82 | Munch 0.80 |
| Feep's | 0.92 | Munch 0.81 |
| Munch's | 0.84 | Splat 0.81 |
| Thrash's | 0.81 | Splat 0.80 |
| Guru's | 0.87 | Splat 0.79 |

- **Margins are thin** for Gronk (0.02 over its sibling Splat), Ping (0.02), Munch (0.03) and Thrash (0.01). A redraw that loses one is caught by a test, but these are the ones to look at by eye.
- **First pass failed on three.** My first Bamf, Munch and Thrash elders were drawn from scratch and read as generic bigger blobs: each was closer to another adult (Bamf's to Guru, Munch's to Splat, Thrash's to Splat). I rebuilt those three from their own adult widened and one row taller, with a small mark (a brow mark for Bamf and Munch, a second row of spikes for Thrash). The other six were drawn by hand and passed.
- **The nine elders are distinct from each other.** Elders of different roles overlap at most 0.82 (Gronk's and Guru's, 0.817, just under the 1.0 bar); the two elders of one role overlap 0.83 (Splat's and Gronk's), 0.71, 0.73 and 0.80.
- **Wearables.** 3198 cases across all 22 forms and both frames and the asleep pose; 24 clip a pixel above the screen, all the holologo on 15 row sprites, as 1.0's own 15 row forms do (the audit also finds a 1 px drone clip on Splat's elder).
- **Not drawn:** the elders of Program and Wetware, and the Program and Wetware babies and teens.

## Iron through the real 1.0 sprite audit

`npm run proto:audit` runs the unchanged `tools/sprite-audit.mjs` on Iron's 22 forms: `prototype/netling2/audit.mjs` registers the prototype sprites in the game's own tables, replaces `SPECIES` with Iron's forms (the elders as the `mainframe` stage the game draws for a grown form) and imports the audit. Forms show as `protoB_<id>`. It checks wearable clipping, icon slots, contrast, occlusion, worn combinations, silhouette overlap, poses and props. The run takes about 15 seconds. 1.0's own forms are not in it; the comparison below is the same tool run on 1.0 (`node tools/sprite-audit.mjs`).

| Check | 1.0 (13 forms) | Iron (22 forms) |
|---|---|---|
| Wearables that clip the top of the screen | holologo on all 13 forms (39 cases), 1 px | holologo on 15 of 22 forms, 1 px, and the drone on Splat's elder, 1 px (47 cases) |
| Contrast, awake and lit: wearables losing half or more of their pixels | 5 combinations of 84 (crown, necktie, spiked collar, earpiece x2) | 1 combination of 132 (necktie) |
| Contrast, asleep with the lights off | 0 | 0 |
| Worst worn combination (upper slot hiding the lower) | Chrome jaw over gold chain 0.86; Data aura over blush 1.00 for a moment | Drone over sat dish 0.86; Chrome jaw over necktie 0.80 |
| Plush prop covers the pet | up to 42% (46% with a visitor) | up to 33% (45% with a visitor) |
| Highest same-stage silhouette overlap | Firewall and Ghost 0.81 | Munch and Thrash 0.81, then a group at 0.80 (after the Gronk and Splat redraw; before it, Gronk and Splat were 0.85 and their elders 0.83) |
| Asleep and dead poses | n/a | 8 to 10 cells differ asleep, 14 to 18 dead |

- **Wearables hold up.** Iron's forms are no worse than 1.0's on clipping and contrast, and better on contrast, with no wearable losing half its pixels in the dark.
- **The silhouette overlap was the one result that was worse, and the redraw fixed it** (see The Gronk and Splat redraw). Munch and Thrash (the Feast pair) now tie 1.0's highest at 0.81.
- **The audit's cross-stage pairs** (an elder against its own adult, for example Feep's elder and Feep at 0.86) are expected and not a problem: 1.0 only reads same-stage pairs.
- **A discrepancy in 1.0's own doc, found on the way.** `docs/SPRITES.md` lists "Off-screen wearable cases: 0", but the current audit reports 39 holologo cases on 1.0's forms, 1 px above the screen. I did not change it; it is a separate fix (suggested separately).
- **`gallery.html` is not extended (the generated copies are).** The audit is; the gallery's by-eye review for Iron is the review page here.

## Fit and frame stability (found in review)

Review of the gallery found five things; one was a bug in my tooling that had also skewed the audit, and two were requirements for the new forms.

**1. A bug in my tooling: the wearable code was guessing the Iron anchors.** `src/accessories.js` builds its table of authored anchor rows once, when it first loads, and `src/sim.js` imports it. My gallery prelude, audit wrapper, review page and one test all imported `sim.js` before registering Iron's forms, so every wearable was placed from anchors guessed from pixels (the first row with an accent pixel as the eye row, the first wide row as the head). Where the guess is wrong:
- the hidden teen and Guru: the guessed eye row is the **third eye**, so the visor sat one row too high with the real eyes showing below it, and shades and the monocle were drawn on the third eye;
- Gronk and its elder: the guessed head is the **horn row**, so the visor ran wider than the body and the headphone cups floated a column away from the head.

Fix: `prototype/netling2/ready.js` registers the forms and then checks the wearable code is using them, throwing if it is not. It is the first import everywhere (tests, audit, gallery prelude, review page). Two new tests pin it: the anchors the wearable code uses equal the authored ones for every form, pose and model, and the head width it uses is the authored head. I confirmed the guard fires when `sim.js` is imported first. **The audit figures earlier in this document were taken with the guessed anchors**; the table above is the corrected run. With the real anchors the hidden forms' visor covers both real eyes (10 of 12 and 10 of 14 eye cells covered, against 6 before) and the monocle rings the left eye, and Gronk's visor spans exactly its head and its headphone cups touch the head.

**2. Headphones plus visor merge into one band on Gronk, and that is not Gronk's fault.** The headphone cups sit at the eye rows and the visor spans the head, so together they read as one band with a cup at each end. Rendering the same pair on 1.0's own forms shows the identical effect on Bitling, Kernel, Chrome, Daemon, Firewall and Glitch. It is the wearable layout shared by every form. If it should change, the place is the headphones (for example cups one row above the visor), which touches 1.0 art; I did not.

**3. No wearable moves between frames (the Bitling problem).** The complaint about 1.0's smallest forms: the Bitling's ears move between frames, so the headphones slide sideways and every head wearable (flower, bow, mohawk, antenna) bobs a row. I measured how far each wearable moves between the A and B frames, holding the wearable's own animation fixed so any shift is the body. On 1.0 the number of wearables that move is: Bitling 21, Kernel 19, Stub 27, Shell 12, Firewall 18, Airgap 22, Ghost 2, Whisper 2, Glitch 41 and Panic 41 (up to 5 columns), and none on Chrome, Daemon, Plat and Init. All 22 Iron forms had the same fault by my own design (the B frame dropped the head one row, so every head wearable bobbed 1 row, 17 or more of them per form). They now have none. The rule for new forms, applied to every Iron form:
- the head, eyes, mouth and neck rows are **identical** in A and B;
- only the lower body animates: the feet step and the vent slots close;
- the A and B anchors are the same;
- the foot row keeps enough cells (at least 0.4 of the width) that the wearable code's idea of the body's bottom does not move either (Thrash's elder had missed this and moved four chest wearables a row).

A test checks it on every form and every wearable through the real `placeWorn` (902 cases, none move) and that the A and B frames still differ by at least 4 cells (the audit's floor). The cost: the frames now look quieter (rigid, as Iron should), and a held head means the holologo is drawn at its higher position in both frames, which is why more 15 row cases clip than before.

**4. Palette colors (a 1.0 change).** The yellow-looking marks are the sprite's highlight cells ('+', near-white `#f5f5f5`: nose, cheeks, teeth). I had judged them by CIE76, which is dominated by hue; by luminance contrast white is 1.10:1 on acid, 1.11:1 on origin and 1.24:1 on toxic, and 2.1 to 3.3 on the palettes that read fine. Toxic's eyes (cyan on bright green) were 1.28:1 against 2.1 to 3.0 elsewhere. Changes in `src/sim.js`: acid, toxic and origin get a `mark` color, a dark indigo `#2b1b5a` (11:1 or better against all three), and `paletteColors` uses it; toxic's accent goes from `#05d9e8` to the deeper teal `#0891b2` (2.7:1 on its body, 4.5:1 on the dark screen, so the HUD still reads). `tools/lib/sprite-checks.mjs` uses the same color, and `src/wearable-colors.js` was regenerated (three default colors changed). A near-black first try (`#0a1214`) made the Corp barcode half-blend into the marks on Daemon in three palettes in the audit's own screen; the indigo does not. Both audits are at their baselines, and `npm test` passes (500). **Not changed:** ice, whose white marks are 1.59:1; borderline, and not flagged in review.

**5. Everything else** in the review (the other sprites) looked fine.

## The Gronk and Splat redraw

The audit flagged Gronk and Splat (the two forms of the Breach role) at 0.85, above anything in 1.0, and their elders at 0.83. Both were near-rectangles (16 wide, 14 rows). I redrew them with opposite proportions and let the elders follow:

- **Splat** (corp): a wide hammer-head slab, 16 across, over a narrower 12 column body, with its piston on top and its eyes a row higher.
- **Gronk** (street): a narrower head (12) over broad shoulders (16), the arms apart from the torso with a gap column, horns and teeth kept. Its elder's arms run down to the hem so its fists reach the floor.
- **Elders:** each is its adult stretched to 18 columns and one row taller, with a brow mark, as before.

| | Before | After |
|---|---|---|
| Gronk and Splat | 0.85 | 0.61 |
| Their elders | 0.83 | 0.63 |
| Gronk's elder and Guru's elder | 0.82 | 0.81 |
| Each elder closest to its own adult, scaled | yes | yes (Gronk's 0.79 against Guru's 0.73, Splat's 0.90 against Munch's 0.72) |

- **First try on the elder missed.** After the redraw, Gronk's elder overlapped Guru's elder at 0.821, just over the 1.0 bar of 0.82. Extending its arms down to the hem brought it to 0.806, still closest to Gronk. The test is the 1.0 bar (0.82), not looser.
- **A test that hard-coded the old Gronk's rows failed and was updated** to check the marks instead (horns, teeth, arms apart).
- **Judge by eye.** The numbers are a screen; the redrawn pair should be looked at in the gallery (see Reviewing the sprites).

## The holologo clip (1.0), and the options

The one wearable that clips (the holologo, 1 px above the screen) clips on 1.0's forms too. The audit only says it leaves the screen at some point of the idle motion; I measured how much of the time, over 60 to 200 seconds of each idle (bounce, sway, hover), on 1.0's 14 forms:

| Idle | Forms with any clip | Share of time clipped (mean, worst form) | Longest unbroken run |
|---|---|---|---|
| bounce | 13 of 14 | 32%, 62% | 5.7 s |
| sway | 13 of 14 | 30%, 48% | 7.3 s |
| hover | 13 of 14 | 45%, 77% | 2.9 s |

It is **not a brief artifact of the top of a bounce**: on most forms it is cut about a third of the time, in runs of several seconds, and always the same single tip pixel (the diamond's top). Cause: the holologo sits 6 rows above the head (`a.top - 4`, with the tip 2 above that) while the idle motion reserves 5 rows (sized for the halo), and a 15 row form has only 5 rows of room even at rest.

Options, none applied (a 1.0 art or layout change is the maintainer's call):

| Option | Effect | Cost |
|---|---|---|
| Draw the holologo one row lower (`a.top - 3`) | Fits the 5 rows the idle already reserves, fixes every form including the 15 row ones | The diamond's bottom tip touches the head top (no gap row). Smallest change |
| Move the sprite space down one pixel (floor 20 to 21) | Gives every form and the halo one more row | Touches the whole layout: the prop floor (row 21), the flatline (row 23) and the cache icons below. Largest |
| Resize the viewscreen | Same, by adding a row at the top | Also changes the HUD slots at the top (virus, trace, bang, Z); every row-based number moves |
| Leave it | A single tip pixel is lost about a third of the time; the diamond stays recognisable | None, but it is not the temporary flicker it might seem |

My lean is the first (one row lower), or leaving it if the touching tip looks worse than the clipped one. Check both in the gallery before choosing.

## Reviewing the sprites

Three places, from broad to specific.

1. **Every form, with the real game's code (the gallery).** `npm run proto:gallery` writes `prototype/netling2/gallery-iron.html` and `gallery-program.html` (Program; same sections, forms named `protoP_<id>`, starts on Tiger), which is the unchanged `gallery.html` with Iron's 22 forms (and 1.0's Chrome and Bitling as its reference bodies) instead of 1.0's; it is generated, not committed. Then `npm run serve` and open `http://localhost:5174/prototype/netling2/gallery-iron.html`. It is the real gallery: raw A, B, sleep and dead sprites at 10x, silhouettes, the real LCD in every state, every wearable alone and worn together, every palette and tint, props, visitors. The `form` control picks one form for the scene, wearable and combination views; the section buttons (forms, silhouettes, scenes, wearables, matrix, combos, props and so on) jump to a part, and the link keeps the view (`#sec=forms&form=protoB_gronk`). Pink outlines mark a wearable that blends into the pet; hover a cell for the reason. Forms appear as `protoB_<id>`.
2. **A specific problem, from the audit.** `npm run proto:audit` runs the real audit on Iron's forms and names each candidate (for example `protoB_gronk / protoB_splat`). `--check=forms` (silhouette pairs), `--check=clip`, `--check=combos`, `--check=poses` and so on run one part, and `--json` gives the raw rows. Then open the gallery on that form (`#form=protoB_gronk`) and look. The audit flags candidates; a person judges them.
3. **The prototype review page, for what the gallery does not have.** `http://localhost:5174/prototype/netling2/`: the whole Iron tree in rows (the line, the three teens and the hidden branch, all nine adults and elders), the temper tell at any level, the neglect and bug looks driven by sliders, and a pose, wearable and anchor-row control. `bugs-and-neglect` and the tell are only here.

`npm run proto:test` runs the prototype's own tests; `npm test` is the game's. Whichever you use, say what was not run on a device: nothing here has been looked at on a phone.

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

0. 1.0's own Bitling, Kernel, Stub, Shell, Firewall, Airgap, Ghost, Whisper, Glitch and Panic still move wearables between frames (see Fit and frame stability). Not changed; fixing them is a 1.0 art change.
1. Iron's unsteady tell is a drift off its grid. Is it distinct enough from 1.0's idle sway (a separate inherited quirk)? The steady settle and the Program blink are the other new motions to judge.
2. **Neglect and bugs (saved for later):** the thresholds, the bug look and whether two looks are readable together on a device are untested; the review page shows neglect only on Iron's four-form line and bugs only on Gronk, so 18 of 22 Iron forms have never been looked at with either, and the audit does not check them; see What drives neglect and bugs. Program needs its own skin; only Iron's rust exists.
3. Not drawn: Wetware's four street adults, Blank and nine elders (its baby, three teens and four corp adults are drawn). Program's 22 forms are drawn.
3a. Program by-eye checks: the street teen (six passes), Gobble and Worm (weakest reads), the 4-cell frame changes on Tiger, Parse and Snarf, and the thin elder margin on Parse (0.02).
4. Names for the teens and elders of both eggs, and whether the thin elder margins (above) read right by eye.
5. Temper level edges and the guard width of 0.5, and Wetware's pulse numbers: tune with the balance tools once temper accrual exists.
6. The holologo clip in 1.0 (a persistent 1 px, about a third of the time): four options laid out in The holologo clip, none chosen.
7. Ice's white marks are 1.59:1 by luminance (acid, toxic and origin were fixed): leave, or give ice a mark color too?
8. Headphones plus visor merge into one band on every form, 1.0's included: change the shared wearable layout, or accept?

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
- **Both looks together is intended (maintainer).** Neglect leads to faults and faults roll bugs, so the rust and the glitches are meant to appear together, and bugs do not suppress the rust. A test checks the two combine without interfering (rust never changes which cells are painted or where rows tear).
- **Not measured:** how often needs sit past a line in real play (the balance tools have not been run on this), and whether the combined look is readable on a small screen; I have not judged it by eye on a device.
- **Open:** whether five bugs on a small form read as five distinct states or as a smear; the Dex and log wording for either look; the Iron, Wetware and Program skins other than rust and torn rows.

## Not done

- Not looked at on a phone or by anyone but me, and not at motion speed beyond screenshots of single frames. Whether the Iron art reads as firmware, whether the rust reads as neglect and not as part of the design, and whether the tells are legible are human calls.
- Wetware has tell code and tests but no body art and no neglect skin, so its tell has only been checked as numbers, not seen. Program has body art but no skin of its own for neglect or bugs.
- Idle behavior and chatter tone, the other two temper channels, are not prototyped. Nothing about Standing visuals beyond the street lean marks.
- `gallery.html` itself is unchanged. `npm run proto:gallery` generates copies that run it on Iron's and Program's forms (see Reviewing the sprites), and the audit runs on them through a wrapper. Both depend on `ready.js` being imported first; see the trap in NETLING_2_SKETCH.md (Handoff).
- The smoke test was not run. The page was loaded in headless Chromium with no console errors apart from the browser's favicon request.
- **1.0 code was changed in one place**, with the maintainer's agreement: acid, toxic and origin get a `mark` color and toxic's accent changed (`src/sim.js`, `src/sprites.js`, `tools/lib/sprite-checks.mjs`, regenerated `src/wearable-colors.js`). Nothing else under `src/` or `tools/` changed. The wearable movement and holologo clipping in 1.0 were measured, not changed.

## Wetware (baby, teens and corp adults)

Code: `wetware-art.js`, `wetware-models.js`, `wetware.test.js`, `gallery-prelude-wetware.js`; forms register under `protoW_<id>`. Run `npm run proto:audit:wetware` (or `EGG=wetware`, `EGG=all`) and `npm run proto:gallery`.

- **The baby is an organoid** (maintainer's pick of three candidates: a round cell, an organoid, a tadpole): 12 x 11, a lump of cultured tissue with a folded cortex (dim cells across the top of the head), the standard face, and four root-like tendrils. Head, eyes, mouth and neck are identical in A and B; only the two tendril rows move (14 cells differ). The folds are meant as the egg's mark for later forms, and give the pallor skin and the pulse tell somewhere to show.
- **Silhouette.** The first draft overlapped Iron's baby at 0.84, over 1.0's 0.82 same-stage bar (a cross-egg pair, but kept under it anyway); rounding the top and narrowing the row under the eyes brought it to 0.77 against Iron's and 0.75 against Program's.
- **Poses (a proposal, easy to change).** Asleep: two accent cells with a gap (a slow pulse) on the first chest row under the mouth. Dead: a run of dim cells across the chest (a pale trace, the colour going out of the tissue; the opposite of Program's bright flatline). Both from the sketch's Wetware register (polling; a dream ends and the next begins). Neither has been judged by eye on a device.
- **Verified:** the prototype tests (79, including 9 new), the real 1.0 audit on the baby (0 wearables move between frames, 0 leave the screen, no contrast losses), and `npm test` (500). **Not done:** a by-eye or device check, the Wetware neglect (pallor) and bug skins, and the tell seen on art.

**Teens (maintainer's directions: blobs for now, humanoid bodies come at the adult stage; 11 rows like Iron's and Program's; Blank's line may keep a Ghost in the Shell reference as long as it is a different take on Program's).** Ids `teenCorp`, `teenStreet`, `teenHidden` (names undecided). 14 columns, 11 rows, head, eyes, mouth and neck identical in A and B, only the last row animates.
- **Corp:** the baby grown: the same folded cortex, a wider body, four tendril feet.
- **Street:** the corp body kept whole plus added parts (the rule from Program): spikes over the cortex, a dark unibrow, ear stubs by the eyes, arms held off the body and wide boots.
- **Hidden (Blank's line):** a cloaked blob. A hood peak, slit eyes, no mouth, a body of alternating dim and bright cells (the shimmer of the thermoptic camouflage in Ghost in the Shell, where Program's hidden path takes the Shell as a hollow casing and the Ghost as the thing inside) and a scalloped hem. A first draft was a humanoid ninja at 13 rows; both were set aside by the maintainer's directions.
- **Measured (the 1.0 silhouette overlap, centred):** corp and street 0.81 (under 1.0's 0.82 bar; the first draft was 0.93, then 0.86, 0.83 and 0.82 as parts were added), hidden against corp 0.67 and against street 0.62; baby against each teen 0.58 to 0.66. Outline cells differing: corp/street 24, hidden against either 36 and 48.
- **Verified:** 83 prototype tests, the real audit on the four forms (no clips, no frame movement, no contrast losses), `npm test`. **Not done:** by-eye or device review; the corp and street pair is the closest (0.81) and the street's unibrow reads as a headband at small size; the hidden teen's shimmer and the 4 dim cells of its eye row read small.

**Corp adults** (`WETWARE_ADULTS`; maintainer: Chrome for Wired; humanoid is a hunch, not a directive). 16 columns, up to 15 rows, humanoid (a neck, shoulders, arms, legs), the baby's cortex kept on the head. Names are the sketch's.
- **Razor** (Breach), 14 rows: a narrow jaw on full-width shoulders, a brow, a crest of folds, blade forearms ('+' strips).
- **Wired** (Dodge), 15 rows: **1.0's Chrome**. The A frame is 1.0's, unchanged (a test). 1.0's B frame moves the visor's lights and eyes, so B keeps A down to the neck row and takes only 1.0's arm and leg rows (6 cells differ). It has no cortex and no Wetware look yet; the generic sleep and dead poses put one X on the whole visor band.
- **Mentat** (Tune), 14 rows: an oversized cortex on a narrow body in a robe with a scalloped hem.
- **Nutri** (Feast), 14 rows: a round, wide body, a wide mouth and a dark belly band; the legs are the only moving part (4 cells).
- **Measured:** the closest pair is Wired and Nutri at 0.80 (Razor and Wired was 0.85 on the first Razor, a wide dome like Chrome's; the redraw as a narrow jaw on full shoulders brought it to 0.70); every adult is under 0.67 against every teen and the baby. The audit reports no new problems: the holologo clips 1 px on all four, as it does on all 13 of 1.0's forms; no contrast losses; wearables do not move between frames (86 prototype tests pass).
- **Weak spots to check by eye:** Razor's blades read as separate pink strips and its shoulders as one bar; Wired has no Wetware mark; Mentat and Nutri share a wide base (0.79); Razor's A and B frames differ by only 4 cells, Nutri's by 4.
- **Not drawn:** the street adults (Solo, Chipped, Gibson, Leech), Blank, and the nine elders.

**Dead X placement fix (Wetware).** Review found the dead X's awkward on Wired and Razor. Three causes, three fixes: (1) Razor had a dark brow row above its eyes and eyes two rows lower than the other forms, so the X's landed on the brow and the jaw; the brow is gone and the eyes sit on rows 4 and 5 like the other forms (Razor's eye row is now 4). (2) Wired is 1.0's Chrome, whose eyes are one wide visor band, so 1.0's generic pose put one X in the middle of it; Wired now has its own dead pose as in 1.0: the visor goes dark and an X sits at each end (columns 5 and 10). (3) 1.0's X is 3x3 and rounds a half-cell centre to the right, so on every two-cell eye (all Wetware forms but the hidden teen and Wired) the pair sat 2.5 columns in from the left and 3.5 from the right. A Wetware dead pose rounds a half-cell centre toward the middle of the sprite, so the pair is symmetric. Tried and dropped: a 4x4 X for two-cell eyes read as a block with corner dots. Iron's and Program's dead poses are unchanged and still have the right-rounding; whether to fix those too is a question for the maintainer. The review page and gallery already default to the ice palette (palette 0); the previews I make now use it too.
