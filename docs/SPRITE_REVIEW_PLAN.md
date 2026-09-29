# Sprite review plan

Plan for a full art review of every code-drawn sprite, and of the ways they are layered. **Contains spoilers** (secret forms, earned items). Written against branch `claude/vibrant-cerf-kthozk`, now merged with `main` at `c121f59` (which includes the crest slot).

**Status (2026-09-29):** steps 1 to 3 are done. The gallery is rewritten (section 3), `tools/sprite-audit.mjs` and its tests exist (section 4), and the screenshot pass has been run, with the results in [SPRITE_FINDINGS.md](SPRITE_FINDINGS.md). Step 4 (the human pass in a browser) is the maintainer's. The sections below are kept as the plan; where reality differed, a note says so. Section 8's suspicions are now resolved in the findings (most confirmed; the silhouette one was not).

Decisions recorded from the maintainer: the review covers all art; it is done by both an automated pass and a human pass; and the output is **findings only** (severity and a suggested fix, no art or code changes as part of the review).

## 1. Goals and how each is judged

A finding is any place where a goal below fails. Each goal has a concrete test so two reviewers reach the same verdict.

| Goal | Test |
|---|---|
| **Thematic** | Reads as cyberpunk, netrunning, glitch or corp iconography at first glance, and matches the form's role: Bitling and Kernel are small and cute, Stub is scrappy, Shell is hollow, Chrome is corp and polished, Firewall is a wall or shield, Daemon is a watcher with horns, Glitch is unstable, Ghost is faint. An accessory should suit the world (a cap and a flower are allowed to be cute, but the set should not mix styles by accident). |
| **Clear** | At the real size (40x28 LCD, about 5x scale on a phone) the eyes, the pose and the object can be named without a caption. Eyes and mouth stay visible when an accessory is worn. No accessory is unreadable noise. |
| **Differentiated: forms** | Blur the sprite to a silhouette (one color, no eyes). Every pair of forms must still differ, at least within a stage. Teens (Kernel, Stub, Shell) are the tightest set. Awake, asleep and dead must differ from each other on each form. |
| **Differentiated: items** | No two accessories, props or item icons read as the same object at size. Accessories that share a slot on the body (hats, eyewear, mouthwear, neck) must be distinguishable from each other. |
| **Layered** | Every accessory on every form, in every pose, palette and lighting state still passes Clear and Differentiated. The accessory is not lost against the body, does not hide the eyes unless it is meant to, does not leave the screen, and does not collide with HUD icons, props or a visitor. |
| **Stable across settings** | Holds on all 7 screen tints, all 9 shells (for the crest), 6 palettes, both motion settings, and with the wander, sway and hover idles. |

## 2. Inventory: what "every sprite" means

| Surface | Source | Count | Notes |
|---|---|---|---|
| Form poses | `sprites.js` `SPRITES` | 9 forms: A and B for all, Sleep and Dead only for Bitling | Every other form's Sleep and Dead fall back to A. Sleep is A with the eye color swapped; Dead is A in grey. That is the largest single risk to "differentiated" (see 7) |
| Script (compile) sprite | `SPRITES.script` | 1 | Shown with the boot bar |
| Wearables | `accessories.js` `ACCESSORIES` | 24 (22 findable, 2 earned) | 8 are recolorable, with any `#rrggbb` |
| Props | `PROPS` | 4 | Deck, boom box, mini device, plush (plush draws a half-scale copy of the previous netling in its colors) |
| Item icons | `ITEM_SPRITES` | 9 | 7x7, single color plus dim and highlight |
| HUD icons | `render.js` | cache, virus, trace eye, attack, overflow, Z, bang | Share the top rows with tall accessories |
| Netrun node markers | `netrun/view.js` `drawNode` | 8 | entry, cache, ice, relay, checkpoint, market, anomaly, exit. Canvas shapes, not string sprites |
| Mini-game art | `games/*.js` | 4 games | Blocks, packets, grid cells, waves; also check they match the sprite style |
| Form thumbnails | `ui/archive.js`, `ui/style.js` | dex and family tree at 16px; plush | Same sprites at a different scale |
| Icons | `icons/*.png` | 4 | Generated from Bitling by `tools/make-icons.mjs` |
| **Crests (fifth wardrobe slot)** | `cosmetics.js` on `ccr-14d93101-qcalx0`, not on this branch | 4 (Helix, Triad, Closed loop, Full house) | 9x9, single color; see section 8 |

### Combination space

- Wearable on a form: 24 x 9 forms x 4 states (awake A, awake B, asleep lit, asleep in the dark) = 864, times 6 palettes = 5,184 renders. Too many to read one by one, so the automated pass covers all of them and the eyes cover a structured subset (section 5).
- Wearable plus prop (both slots equipped): 24 x 4 x 9 = 864. The pet wanders up to 8 columns either side of centre, and props sit in columns 30 to 37, so adults overlap them.
- Visitor scenes: 9 x 9 form pairs, with the visitor wearing any findable wearable. With a visitor present the host moves to the right side and the visitor stands on the left.
- Custom colors on the 8 recolorable wearables: unbounded, so test against a fixed worst-case set (section 4).
- Background: 7 tints, each with a darker lights-off variant.

## 3. Step 1: bring `gallery.html` up to date (do first)

Today the gallery shows each form awake, asleep and dead once, and a 9 x 24 matrix of awake pets, all at 160x112. It runs cleanly (no console errors) but cannot support this review:

| Gap | Effect |
|---|---|
| Palette is random per load (`createScript` rolls it) | A review is not reproducible; a finding cannot be re-found |
| Only awake pose with accessories | Sleep and dark-sleep layering, where every accessory collapses to one dim color, is unseen |
| No props, no wearable plus prop, no visitor, no script sprite, no item or HUD icons | Half the inventory is not visible |
| Matrix cells are about 50 px wide on screen | Individual pixels cannot be judged |
| No A and B side by side | Animation frames only show as they flip |
| No palette or tint control | Color clashes are invisible |
| `idle` fixed to bounce, position wanders | Placement varies frame to frame |
| No crest, no netrun nodes | Not covered |

Spec for the update (still a single static file, no build step, reading from the real modules so it cannot drift from the game):

1. **Controls bar**: palette (all 6, or "all"), tint (7 plus lights off), lights on and off, wearable, prop, form, pose (A, B, sleep, dead), scale (1x real, 4x, 8x), and a "freeze" toggle that pins `time` so nothing animates or wanders. Encode the settings in the URL hash so a finding can link to its exact view.
2. **Deterministic render**: build pets with a fixed `quirk`, seeded `createScript` and a fixed `time` (frame A or B chosen explicitly, not by the clock). Use `renderLCD` itself with the same options as `main.js` (do not reimplement drawing), so what is reviewed is what ships.
3. **Sections**, each generated from the source arrays so new ids appear automatically:
   - Forms: for each form, A, B, sleep lit, sleep dark, dead, all in one row, with the raw sprite (no LCD) beside it for the silhouette test.
   - Silhouette strip: every form as a single flat color, sorted by stage, to judge differentiation.
   - Wearables x forms: one sheet per state (awake A, awake B, asleep lit, asleep dark), rows are forms, columns are wearables, and a palette selector or an "all palettes" mode that repeats the sheet per palette.
   - Wearables alone: each wearable drawn on a neutral reference body at 8x, with its anchor points marked, so the item's own shape can be judged apart from the pet.
   - Props: each prop alone, then with each form standing at left, centre and right of the wander range.
   - Wearable plus prop: the 864 pairs as a filterable grid.
   - Scenes: visitor pairs (any form with any form), compile screen, reboot, evolution strobe, event and virus icons on with a tall wearable.
   - Icons: the 9 item icons at 7x7 and real HUD size, all HUD icons, the 8 netrun node markers on each region's palette, the four mini-game frames.
   - Custom colors: the 8 recolorable wearables in the worst-case color set from section 4.
   - Crests: read `COSMETICS.crest` when it exists (guarded, so the page works before and after the merge), at 9x9 native, at the 27px device-header size, and at the 18px picker swatch, in each shell's logo color.
4. **Static checks embedded in the page**: a red outline on any cell where the automated pass (section 4) reported a finding, with the reason on hover. The same logic should live in one shared module so the page and the CLI script agree.
5. Keep the spoiler warning at the top. `gallery.html` is not deployed (`pages.yml` excludes it) and is not in `sw.js` `SHELL`; leave it that way.

Verify the update by loading it in Chromium (the sandbox has it) and checking the console is clean and the cell counts equal the expected totals.

## 4. Step 2: automated checks (script, no human judgement)

A new tool, `tools/sprite-audit.mjs`, imports the real sprite, accessory and palette modules and prints a machine-readable list of candidate findings. It only flags; a person confirms. Suggested checks, in order of value:

1. **Clipping**: for every form x pose x wearable, the topmost and bottom pixel in LCD coordinates at the highest and lowest wander position. Flag any pixel off screen (row below 0) or inside the HUD icon rows (2 to 6) over the icon columns (2 to 13, 30 to 33, 37).
2. **Contrast against the body**: for every wearable color x palette, WCAG-style or simple RGB distance against the palette main and accent. Flag pairs below a threshold, and any wearable whose every pixel is within the threshold of the body it sits on.
3. **Contrast against the background**: every wearable, sprite and prop color against all 7 tints and their dark variants.
4. **Dim collapse**: with lights off and the pet resting, `drawAccessory` paints everything `#1c3a3f`, the same as the body. Count how many wearable pixels touch the body and cannot be told apart from it; flag wearables that lose more than about half their shape.
5. **Occlusion**: which wearables overwrite the eye pixels (`o` in the sprite) or the mouth pixels (`+`). Expected for shades and visor; anything else is a finding.
6. **Overlap between slots**: wearables that occupy the same pixels as another slot on the same form (for example a cap and mohawk both at headTop, headphones and cap).
7. **Silhouette similarity**: for every pair of forms, the overlap of their filled pixels after centring (intersection over union) and after a blur. Flag pairs above a threshold; report the teen set separately.
8. **Pose similarity**: for each form, the difference between A, B, Sleep and Dead as a pixel count. Flags forms where Sleep or Dead differ from A only in color.
9. **Wearable pair similarity**: for each pair of wearables, the overlap of drawn pixels relative to the body anchors, so near-duplicates (for example Crown and Halo, Earpiece and Neural jack) are surfaced.
10. **Worst-case custom colors**: render the 8 recolorable wearables with body color, background color, black, white and near-body colors, and run checks 2 and 3 on them.
11. **Prop and visitor collisions**: prop columns (30 to 37) against every form's wander range and the visitor's column range (17 to 36 for adults).
12. **Ghost alpha and Glitch flicker**: Ghost draws its wearable at 55 to 80 percent alpha because `globalAlpha` is set before the wearable is drawn, so the contrast checks must be rerun with that alpha applied; Glitch's ghost-image offset can shear a wearable.

Gate: the tool exits non-zero only for hard failures (clipping, unreadable everywhere). Softer findings are listed for the visual pass. Add unit tests for the shared check functions (deterministic), as the repo's testing rules ask; do not add a test that fails on subjective results.

## 5. Step 3: screenshot pass (reviewer works from images)

Use Playwright with the pre-installed Chromium to write PNG contact sheets from the updated gallery into a scratch folder (not committed). Sheets to produce and inspect, each at 4x or 8x:

1. Forms: all poses, plus the silhouette strip.
2. Wearables on a reference body, with anchors.
3. Wearables x forms, awake A. One sheet per palette (6), so 6 sheets.
4. Wearables x forms, awake B, asleep lit, asleep dark. One sheet per palette for asleep lit; asleep dark needs only one palette per form because everything is a single color.
5. Props with forms at left, centre and right.
6. Wearable plus prop for the tallest and widest forms (Chrome, Firewall, Ghost) and the smallest (Bitling).
7. Visitor scenes and HUD collisions.
8. Icons, nodes, mini-game frames.
9. Crests in each shell color.

For every sheet, walk the goals table and log a finding per failure using the format in section 7. Also review the real game screen, not only the gallery: capture the home screen from `tools/make-screenshots.mjs` style runs, since the phone-size scale and the CRT effects change legibility. Say plainly in the report which sheets were viewed and which were skipped.

## 6. Step 4: human pass in the browser

A shorter pass, after the automated and screenshot passes have cleared what they can:

1. Open the gallery with the frozen view, then unfreeze to see animation (bounce, sway, hover, wander, blinking cyber eye, orbiting drone, flickering Glitch).
2. Judge the things stills cannot show: whether motion makes an accessory unreadable, whether the Glitch flicker and Ghost fade hurt legibility, whether anything flashes more than three times a second (repo rule 7), and how it looks on a real phone at real size.
3. Check the findings the screenshot pass marked "needs a person" (mostly taste calls about theme and cuteness).
4. Sign off on the seeded suspicions in section 8 one by one (confirm, reject or downgrade).

## 7. Findings log

One row per finding, in a new `docs/SPRITE_FINDINGS.md` (or a section of `KNOWN_ISSUES.md`), following the repo's confidence labels.

| Field | Content |
|---|---|
| Id | `SR-01`, `SR-02`, ... |
| Where | Form, pose, wearable, prop, palette, tint, lighting (plus a gallery hash link) |
| Goal failed | Thematic, Clear, Differentiated, Layered or Stable |
| Severity | **Blocker**: hides the pet's state or an item, or leaves the screen. **Major**: two things cannot be told apart, or a common palette hides an item. **Minor**: awkward but readable. **Taste**: a preference, for the maintainer to accept or drop |
| Confidence | Reproduced (seen in the gallery), Read (from code only), Unverified |
| Suggested fix | One line: anchor change, color change, redraw, or accept as is. Not applied |

The output of the review is this list, sorted by severity, with counts per surface. Because ids are permanent and sprite edits move the icon and archive thumbnails, any suggested redraw should say which other surfaces it touches.

## 8. Seeded suspicions (to confirm, not yet findings)

**Resolved by the first pass:** 1 is SR-04 (worse than first computed: the hover idle is not clamped) and SR-11; 2 is SR-01; 3 is SR-02; 4 is SR-03; 5 is SR-16; 6 is SR-09 and SR-10 (with the correction that the host, not the visitor, moves onto the prop); 7 was **not confirmed** (all three teens are distinct in silhouette); 8 is SR-17; 9 was fixed by the gallery rewrite.

From a quick script over the current code (2026-09-29), and a look at the current gallery. Each is a hypothesis.

1. **Halo, Spark and Sat-dish antenna clip off the top** on the tall forms (Chrome, Firewall, Daemon, Ghost, plus Halo on Bitling, Stub, Shell and Glitch) at the highest wander position. Halo goes to LCD row -1 on the tall adults; Spark and Sat-dish reach row 0. Likely Major.
2. **Default colors collide with palettes.** For example: Cap and Spark are `#05d9e8`, the `ice` palette's main color, so they disappear on an ice-coloured pet; Scarf, Bow, Visor, Mohawk and Party hat are `#ff2a6d`, the `neon` main color and `ice` accent (on ice the accent is the eyes, so a hat blends with the eyes); Flower, Crown and Halo are yellow on `acid`. 17 of the 24 wearables collide with at least one of the 6 palettes. Likely Major for the "layered" goal.
3. **Dark sleep flattens every wearable** to the body color (`#1c3a3f`), so hats merge with the head. Likely Major, and it is the state a player looks at most (overnight).
4. **Sleep and Dead reuse the awake sprite** for 8 of 9 forms (Sleep is a recolor; Dead is a grey copy). Dead Ghost and Dead Firewall look like awake versions in grey. Likely Major for "differentiated".
5. **Ghost's alpha applies to its wearable**, so a worn item on a Ghost fades and pulses with the body. May be intended; needs a decision.
6. **Wearable plus prop overlap for adults**: props occupy columns 30 to 37; an adult at maximum wander covers up to about column 35. With a visitor the host itself is moved to the right edge, over the prop. Confirmed in the props and visitors sheets (SR-09, SR-10).
7. **Teens are a tight set** (Kernel, Stub, Shell all round with side details, 12 to 14 pixels); check the silhouette test.
8. **The Shell sprite is a draft.** `BALANCE_PLAN.md` (item 27) said it should be reviewed before any rules depended on it, and the Shell has since shipped. Give it a specific pass.
9. **Gallery layout**: column widths in the wearable matrix are uneven because header labels stretch some columns, and accessory cells are too small to judge.

## 9. The fifth wardrobe option (crests), from `ccr-14d93101-qcalx0`

That work (`7fccbd6` "Lineage Step 3: family tree and legacy crests" and `309ff54`, from `ccr-14d93101-qcalx0`) has since been merged to `main` (PR 9) and into this branch. It adds a `crest` wardrobe slot (`SLOTS` becomes `['shell', 'tint', 'effect', 'sound', 'crest']`) with four 9x9 emblems (`helix`, `triad`, `loop`, `star`), drawn by `drawCrest` in `ui/style.js` into a canvas beside the device label in the logo's color, at 27px in the header and 18px in the picker. The same commit reworks the family tree in `ui/archive.js`, which redraws form thumbnails.

How the plan handles it:

1. **Sequence**: done. The merge landed before the gallery was built, so the gallery has a crests section (guarded, so it still works if the slot is removed) and the audit has a `crests` check. Findings are SR-14 (and SR-15 for custom colors).
2. **Crest checks** (goal wording as above):
   - Clear: each emblem reads at 9x9 native and at 27px. The `drop-shadow(1px 0 0 var(--cyan))` on `.crest` adds a colored fringe; judge legibility with it on.
   - Differentiated: the four shapes differ from each other in silhouette, and none looks like one of the 9 form sprites or a HUD icon. Compare pairs: Triad and Helix are both diagonal-heavy.
   - Thematic: each crest matches its hint text (a double helix for "every trait", stacked triangles for "three times running", a ring for "closed loop", a star or house for "full house").
   - Stable: the crest in each shell's logo color (default plus chrome and gold, which recolor the logo) against each shell body, and the swatch color `#ff2a6d` in the picker on the locked and unlocked states.
   - Layering: crest plus the label at the 10 character maximum on a narrow phone; crest beside the device shell.
3. **Family tree thumbnails**: the tree at 16px reuses `formSprite`, so add its form list (each form, each palette, the plush's half-scale copy) to the icon section.
4. **Merge hygiene**: done. With the crest branch merged, the docs edits this plan had held back were made: an index row in `docs/README.md`, test and tool entries in `docs/TESTING.md`, and the gallery notes in `ARCHITECTURE.md` and `CONTRIBUTING.md`.
5. **New forms and slots later**: the gallery and the audit read forms, wearables, props and crests from the source arrays, so a new one appears with no edit; `docs/CONTRIBUTING.md` step 6 now says so. Two things are copied by hand and can drift: the thumbnail colors from `src/ui/archive.js` (gallery thumbs section) and the HUD icon boxes in `tools/lib/sprite-checks.mjs` (from `render.js`).

## 10. Order of work and what this plan has not done

| # | Step | Output | Who | Status |
|---|---|---|---|---|
| 1 | Gallery update (section 3) | `gallery.html`, verified in Chromium: 14 sections, no console errors | Claude | Done |
| 2 | Audit tool and unit tests (section 4) | `tools/sprite-audit.mjs`, `tools/lib/sprite-checks.mjs`, `tests/sprite-checks.test.js` | Claude | Done |
| 3 | Screenshot pass (section 5) | [SPRITE_FINDINGS.md](SPRITE_FINDINGS.md), 18 findings | Claude | Done, except the palette-`all` matrices and the wearable-plus-prop matrix, which were not looked at closely |
| 4 | Human pass (section 6) | Confirmed and closed findings, taste calls, motion and flicker | Maintainer | Open |
| 5 | Crests after the merge | Crest section and check | Claude | Done (SR-14) |
| 6 | Decide fixes | A separate change set, with a balance and baseline check only if a rule changes (CLAUDE.md workflow) | Maintainer | Open |

Not done or not run: the human pass; the smoke test (needs Playwright, `npm run smoke`), which was not run against these changes (the only game-code change is `export` added to `drawNode` in `src/netrun/view.js`, so the netrun view is untouched but has not been re-driven in a browser); the balance tools (no rule or number changed); `sw.js` and `version.js` (no shipped asset changed, so no version bump). The palette-`all` matrices were checked through the audit's numbers only. The gallery's pink outline is computed from the sprite's own colors, so it can differ slightly from the audit, which reads the real render.

Changes made to game code for this: only `export` on `drawNode`. Everything else is `gallery.html`, `tools/`, `tests/sprite-checks.test.js` and docs.

Open questions for the maintainer:

1. Are Ghost's faded wearables and the Glitch flicker intended, or do you want wearables to stay solid on those two forms?
2. Is a dedicated Sleep and Dead pose for every form wanted eventually, or is the recolor a deliberate style choice? This decides whether finding 4 is a defect or a design.
3. Should a "worst case" custom color be blocked in the wardrobe picker (a wearable in the body color), or is that the player's call?
