# Netling 2.0 sketch

Status: planning notes for a separate app, plus a sprite prototype for all three eggs in `prototype/netling2/` (not shipped; see [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md)). The rules, pages and the app are not implemented; all 66 sprites are drawn as first drafts. Items marked Decided come from the maintainer; everything else is a proposal. Companions: [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (all page text) and [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) (source vocabulary and unused ideas; reference only).

## Handoff

Written for an AI picking up the work. Sprite work has its own handoff: **[NETLING_2_SPRITES.md](NETLING_2_SPRITES.md)** (status, commands, rules, next phase). This file is the game design; the sections below are decisions, not tasks.

**State.**
- Separate app, **no 2.0 game code** (the rules exist only in the simulator fork below). Three launch eggs (Program, Iron, Wetware) plus a hidden Rogue egg (a non-NL-0 line that escaped on its own from the unnamed corp that stole NL-0's earlier code, built on the three hidden lines and hunted harder than the other eggs; details undesigned). Layers: egg, temper, role, Standing. Per egg 22 forms: 1 baby, 3 teens, 9 adults (option C), 9 elders; all 66 sprites are first drafts, never seen on a device.
- Decided this stretch (details in the sections named): all 34 teen, baby and elder names (Teen, baby and elder names); NL-0 precedes the player's line only (Story); hidden forms stay out of the Dex until raised or revealed by `public-6` and `public-7` (drafts, Open); egg pages drop on any run in any cleared non-Deep region, role pages 0.20 and hidden page 0.50 per Deep run, one roll a run, made on the way out (the exit or a relay jack-out; decided later, so jacking straight out cannot farm it), no per-life cap; each egg's first Source exit guarantees its Source page; codex cap 12 a life; the elder stage is 1.0's gate with a four-tier feat ladder (Elder stage); temper flicker guard 1.0 and continuous decay; the Metronome prop (hold a strong temper level 12 awake hours, neglect level 2 not counted) is the only temper reward, no perks, no crests, no new temper items; no sound on props. **Since then:** care is reskins of 1.0's four meters and buttons with flavor-only rhythm and a fixed button count, Iron's cure is ALIGN ([NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md)); Standing is kept as fractions, shown as floors, and decisions compare the true gap with whole-number cutpoints (Tie breaks); **bugs are cleared only at a clinic node** on a netrun (a third, unaligned market kind, a quarter of market nodes, 15 scrip or 2 Standing plus a Charge fee, and the only market selling the healing items Coolant cell, Repair kit and Antivirus patch, which leave the black market and corp exchange; the exchange sells voucher 3, Signal booster 2, Bypass chip 1 and Memory shard 1 (proposal, measured); a bugged netling is softly pushed to go (it says so, and a clinic job is offered); **bugs are lethal moderately** (+16% Charge and Sync drain, +20% Heat gain, +8% damage and 0.5 Integrity an hour lost per bug) (Bugs).
- Measured on 1.0's simulator (stand-ins, not 2.0): the Rogue gate (all 18 egg pages) takes attentive play a median 7 lives, casual 10; a first elder lands in life 3 for attentive and daredevil lines, 5 for casual; **a life is about 5 real days**, so these are 35 and 50 days. The balance tool grants Root to the next netling only; the game grants it at once (use `MID=1`, see the prototypes README).
- Measured on the 2.0 simulator (README of the prototypes, for the limits of each): role is cheap to steer (one game at twice the plays of the others ends in that role two lives in three); the hidden forms need wins in every game and near-hourly attention, not Standing, and following a steady netling's preference breaks the hidden adult (98% to 22%); the Metronome's steady hold needs near-hourly check-ins, the unsteady one is open at 6 to 9 check-ins a day, and a Segfault makes it cheap (with about 13 to 15 faults a life); bugs cost a careful worker about 6 points of full life, a clinic recovers most of it, and players who rarely netrun cannot clear bugs at all; **survival depends on the longest awake gap**: gaps of 6 hours or more are fatal to most netlings, in 1.0 as well (decided, maintainer: such a gap stays fatal; Open, 3).
- **Egg pressures, clues and captions (this stretch; decided with the maintainer, simulator-tested only).** Design and numbers: [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md); every measurement: `prototype/netling2/notes/egg-pressure-notes.md` (Results 6 to 23). Each egg owns a bar with a special state, x3 for the owner: Iron Heat (Overclock plus hidden wear, band about 20 to 75, benefits x3), Program Charge (Overdrive, held 80+ for 3 awake hours), Wetware Sync (Overlink, held 85+ for 3 awake hours, brake: a play at 90+ rolls an infection, the second burns it out for 24 hours). Names Overclock, Overdrive, Overlink decided. Corp exchange stock decided (voucher 3, booster 2, bypass chip 1, memory 1); clinic share 25% and fee 15 kept. Wording is in the care drafts (State clues, Temper and the states, Pre-state caption, clinic sections) and codex drafts (State chatter and Archive hints); field manual lines are qualitative, no numbers (decided). The states do not move temper and have no tell of their own (decided). **States are teen and later (decided): babies are too young, inexperienced and unstable to hold Overclock, Overdrive or Overlink** (the Overclock rule for babies is a change to 1.0 in 2.0; Iron's wear still builds in a baby). One-time captions per netling (decided): Charge, Sync (after 120 build minutes), Overclock (first time), Iron wear (first time past the line); a caption is dropped once its state has been reached (rare now that states start at the teen stage). Rejected and why (do not retry): level bands on Charge or Sync (tax check-in cadence), Flow gated on a state (removes Flow for attentive players), Overclock as a held state (the wear cost stays), a temper swing or faster steady decay (a bias, not a cost), a fixed play-to-full penalty without a brake (greedy play still wins).
- **Netrun, inventory and the simulator (this stretch; decided with the maintainer, simulator-tested only).** Design: [NETLING_2_NETRUN_DRAFTS.md](NETLING_2_NETRUN_DRAFTS.md) (the decided list is at its top); build and results: `prototype/netling2/notes/netrun-sim-notes.md`. In short: one ability per role and lean plus the hidden forms, at two levels (adult, elder), egg flavor as text; a second, harder tier of ICE by region depth (speed; Breach a longer target); pressures pause in a run with a 5 minute window after a jack-out; a forced filled cache (never on a relay) for the Feast corp elder; foggier maps (lines only from the current node, elder sight and reveals show lines, in the 2.0 app); stacking and an end-of-run keep-or-sell choice in the inventory (stack 3 to start); the parity yardstick (banked value per run plus exit rate); Feast is loot with a small sustain; a work-day gap stays fatal; Rogue escaped on its own from the corp that stole NL-0's earlier code and is hunted harder. **Simulator:** the fork carries all of this as switches (`NR2=all`), plus the 2.0 page list (24 Root, 15 late; `sim/codex2.js`), codex cap 12, Root mid-life, the feat tiers and the lineage sweep; the older tables were re-run and mostly agree. Measured on it (bots): the abilities sit inside the yardstick except the hidden form's adult level (about 120%) and the Tune forms (low, and bots cannot use information); Feast value is at the mean and its progression is up to a life behind; about a third of items found were scrapped under 1.0's inventory, 14% at stack 3; tier 2 barely moves the shallow regions. Lives to finish the 18 egg pages across three eggs, median: attentive about 8 to 9, casual about 22, with the 2.0 page list and the new rules. **With the ending (all 39 story pages and a Source exit) counted, the Rogue gate is 9 lives attentive, 10 daredevil, 22 casual (a lower bound); netrun notes section 14.**
- **Since then (sprite layers and the rest of the netrun content; decided with the maintainer, simulator-tested only).** Sprites: one neglect and bug skin for all three eggs with stage rules (SPRITES handoff); a steady Iron holds the 1.0 idle still on each beat; during a visit the motion pauses (tell, idle, bug twitch) and neglect and bug tears stay; the generated galleries have a `layers` section. Netrun: the three egg anomalies (stack overflow with RUN IT and TERMINATE, bit-rot patch with FLASH IT and PRY OPEN, graft with GRAFT IT and SAMPLE; numberless hints in each egg's meter words, no free ICE pass, PRY OPEN also gives 8 Charge; wording decided in the care drafts' register; drafts section 6); egg run costs (Iron 2.5 minutes of wear a move, Program 4 Integrity, Wetware 4%; Program landing harder on casual players accepted; drafts 5.1); the tutorial wording per egg (`tutorial-text.js`; ICE stays ICE in every egg, the run HUD follows each egg's meter words, button names unchanged; drafts section 7); Foresight (Tune street reads an ICE's game: the adult one step, the elder two; no tier, no cache detail; the street elder repairs 3 a move; `NR2=all` switches it on); challenges checked against the 2.0 abilities (Glass stays the hardest; the Tune forms keep a limited sight under Blackout: Tune corp two steps of types, Tune street the next step's ICE game; drafts ground rule 5). Measurements: `prototype/netling2/notes/netrun-sim-notes.md`, sections 10 to 13.
- **Since then (perks, traits, items, form ids, sprite review; decided with the maintainer).** Perks by role and lean (nine), traits by role (Hardened cap 1.25, Evasive, Persistent, Foraging, Untraceable on the hidden line), one keepsake per form, Decoy and Salvage cell added, Scan chip set aside: [NETLING_2_PERKS_TRAITS_DRAFTS.md](NETLING_2_PERKS_TRAITS_DRAFTS.md), built as the fork switch `PERKS=1` and measured once (the rest waits for a playtest). **Form ids are `eggLevelRoleLean`** (`ironAdultBreachStreet`, `programElderHidden`; names live only in `prototype/netling2/form-ids.js`), so a name can change without touching an id. Sprites: the dead X eyes mirror on every egg, the galleries have 1x and 2x and the clinic marker, and the hidden elders have echo layers (Whisper's fork lag, Init's ratchet trail; the faintness knob is `ECHO` in `echo-motion.js`).
- **Since then (this round; decided with the maintainer where marked).** Tables: the doc tables were checked against the 1000-life baseline (`prototype/netling2/baseline/`, perks on); readings fixed and a baseline-check paragraph added to the prototypes README (egg pressure tables left to that work). Egg pages are real drops in the fork (`NR2.eggPages`, off by default), **rolled on the way out, at the exit or a relay jack-out (decided)**; the Rogue gate is unchanged (attentive 9, daredevil 10, casual 22 lives). **Elders have no upper parity bar (decided: they are end-game).** **Rogue's background and reveal (decided in direction):** indirect before the unlock, then a brief rebirth cutscene or an egg-list infiltration animation; drafts to choose from in the codex drafts. Sprites: Chipped's eyewear finds both eyes; seven thin elder margins redrawn (tests hold Iron at 0.07, Program at 0.05); asleep chest marks are dim fill below the neck; Iron's drift turns inward at the edge of 1.0's idle (no more wearable clips on Splat and Brick); the Wetware shade dip is 20% so every palette keeps 3:1; wear seams and the Metronome drafted for review. Text: chatter base lines for all 39 babies, teens and adults and voicings for the 18 state lines, all `checkShape`-tested; two shorter alternatives for each of the 26 longest pages. Review renders: `docs/netling2-prototypes/shots/`.
- **Since then (baseline, the break, stage care; decided with the maintainer where marked; branch `ccr-d71db475-tnfy9b`).** Full handover: [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md). In short: the whole simulator suite was re-run at 1000 lives into `prototype/netling2/baseline/`; the Program/perks interaction it exposed led to **the break** for Overclock, Overdrive and Overlink (decided: cost trigger with a warning at Integrity 70, the break at 40, the bar pushed well below its exit line, a 12 hour lockout, one fault; `BRAKE` in the fork, off by default; EGG_PRESSURES, "The break"). Since then, stage care (a 7 hour baby at x2.4 drain whose faults roll bugs, adult at 46 hours, elder cache x0.25, the rest call with a tired state, three notification classes), Standing gain 2 with the bug fix rule and a Standing cost of 5, and wider Deep and Source maps (no tier gradient; the phone picture accepted) are decided, built in the fork and measured ([NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md), section 13). Players who mind the break are measured on every egg (`STATEBOT=watch`, `IRONBOT=watch`, `SYNCBOT=watch`) and the break's wording is drafted for choice (care drafts, The break). Then (maintainer's principle: every egg manages every bar and reaches every state, one state's benefits larger for the owner): the break covers Overclock on every egg, and Iron's wear is mirrored by Program's overfeed strain and Wetware's overplay strain with basic overuse costs on every egg and the states' costs at x1 (`OVERUSE`; [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md), "Overuse and owner strain"). Since then, the strain trigger (decided, option 3): the owner's state also breaks on the owner's strain (Iron wear, Program and Wetware strain), the break itself unchanged; line 80 decided after a sweep and confirmed at 1000 lives; the strain line is the warning and shows only while the state is active (`BRAKE.strainBreak`; EGG_PRESSURES, "The strain trigger"). XP, a flat third ICE tier, more home events and multiplayer are parked; the community sketch comes after the sprite review.
- Prototype code (all in `prototype/netling2/`, tested by `npm run proto:test`): `tell.js` (temper tell, guard 1.0, `driftWithin`, `SHADE_DIP`), `voice.js` and `voice-samples.js` (idle routine, chatter shapes, `checkShape` for authored lines), `body-lines.js` and `state-voices.js` (drafted chatter and its voicings), `seams.js` and `metronome-art.js` (draft art for review), `metronome.js` (prop pendulum), `marks.js` and `mark-colors.mjs` (state marks and their colors), `clinic-node.js` (the clinic map node), `state-lines.js` and `state-hints.js` (state chatter, Archive hints, one-time captions), `tutorial-text.js` (the tutorial run's wording per egg), `share.js` (the daily share line with the hard-ICE count), `neglect.js`, `glitch.js`, `needs.js`, `idle.js`, `visit.js` (the sprite layers, the 1.0 idle model and the visit rule), `temper-audit.mjs` (`npm run proto:temper`), `gallery-layers.js` and `make-gallery.mjs` (the galleries' layers section). New simulator tools in `sim/`: `egg-anomaly-sweep.mjs`, `runcost-sweep.mjs`, `foresight-sweep.mjs`, `challenge-sweep.mjs`. **`sim/` (now also carrying the decided 2.0 netrun rules as switches in `sim/netrun/nr2.js`: abilities, ICE tiers, forced cache, grace window, light egg costs; results and a stale-sims audit in `prototype/netling2/notes/netrun-sim-notes.md`) is a fork of 1.0's simulator, netrun rules and balance bot carrying the core 2.0 rules** (Standing, temper, bugs, no fault cap, evolution, care preferences, the clinic, the soft push): `npm run proto:balance`, 36 archetypes (steerers, hunters, seekers, noisy players), sweep scripts (`role-sweep`, `hunter-sweep`, `temper-sweep`, `bug-sweep`, `gap-sweep`, `human-sweep`, `clinic-sweep`, `push-sweep`, and `sides-sweep` for the egg pressures), tests in `sim.test.js`. What it models, what it does not and every table are in `docs/netling2-prototypes/README.md`. The older drivers, run on a scratch copy of 1.0, are kept for the tables measured with them.

**Next steps (the maintainer sets the order). Remaining work, sprite review last.**
0. **Agreed order from the last session** ([NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md), Next steps): (a) map width for the Deep and Source plus the ICE tier by layer, in the fork; (b) the stage-care draft document (rest call, baby, elder cache, notification budget); (c) a community sketch, document only, now after the sprite review (maintainer, 2026-10-09). (a) and (b) are done; the branches were merged on 2026-10-09. The maintainer will take the remaining items one at a time. Done since: Iron's break rule (the strain trigger at 80 on every egg and the strain warning shown only in the state; [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md), "Decisions of 2026-10-09, night"). Since then (2026-10-09, night): every baseline sweep re-run under the decided rules plus `OVERUSE` (the "now" set; `prototype/netling2/baseline/README.md`, "Follow-up: the now set"): netrun sweeps unchanged; mean full life within 0.2 points per egg; **figures quoted in this file that moved:** survival by awake gap (4 hours 84%, 5 hours 46%, 6 hours 13%; the stage-care baby), the hidden adult at 9 check-ins a day (52% to 32%; hidden teen 1%), the Rogue gate (attentive 8, daredevil 8, casual 18 lives), and the egg-pressure tables (Flow and temper moved); and the elder stage simulated (stage-care draft, section 14: the elder cache and rest rules work as drafted, no survival cost). Next item: the maintainer's choice. Since then (2026-10-09): the missing stage-care wording is drafted for choice (rest call lines, tired, the baby's hungry and messy lines, the elder's empty PURGE, notification texts per class, a shorter second option for the break lines, and a review of the strain readout words; [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md), "Stage care and notifications" and "The break").
1. **Draft the Rogue egg.** Origin, background and reveal decided in direction (see Hidden egg; reveal and background drafts in the codex drafts, to choose from). Still to design: what the three hidden lines as its base means in play, its hunters (a hunter presence in runs rather than the corp trace, per the drafts, section 8), the merge ending. **First drafts (2026-10-09, for choice, not simulated): [NETLING_2_ROGUE_DRAFTS.md](NETLING_2_ROGUE_DRAFTS.md)** (the base, the hunters and the merge, each with options and a recommendation; the reveal and Rogue's pages were left out of that pass).
2. **Open netrun questions** (NETLING_2_NETRUN_DRAFTS.md, section 10 and the notes). Decided this stretch: the forced cache is one a run; the fog (elder sight draws the lines between all the nodes it sees; a possible balance lever); Tune corp under Unplugged is left (a 2 a move repair kept as a post-playtest option); second parts and the elder level wait for a playtest; the share line (`ICE 5/6 T2: 2`); the egg anomaly wording. Still open, all playtest-bound: egg run costs, Foresight's value, Feast progression, the stack size (3) and the keep-or-sell screen, and the 5 minute window. The bots cannot judge the Tune forms' real value, the window, the fog, the stack or the keep-or-sell screen: a playtest is the real answer.
3. **Simulator gaps** (the fork): the ending is now tracked in `lineage-sweep.mjs` (all 39 story pages and a Source exit; the Rogue gate is the later of it and the 18 egg pages: attentive 9 lives, casual about 22; netrun notes section 14); the egg pages are now real drops in the fork (`NR2.eggPages`, rolled at the exit or a relay jack-out; the Rogue gate re-measured with them is unchanged: attentive 9, daredevil 10, casual 22 lives; netrun notes section 14); 2.0 perks, traits, keepsakes and two new items (Decoy, Salvage cell) are designed and built as a fork switch (`PERKS=1`; `docs/NETLING_2_PERKS_TRAITS_DRAFTS.md`, first balance pass in `notes/perks-traits-notes.md`); retest every starting number once 2.0 exists. **The table re-runs have since been done with the netrun rules on (`NR2=all`; prototypes README) and mostly agree within noise; not re-run: the egg pressure sweeps, the exchange stock and the quoted bug-lethality experiments.** Tables made before this stretch's decisions are not re-run: the elder Tune street's repair (6 until Foresight, now 3) and Iron's run wear (1 minute a move, now 2.5); the notes say which.
4. **Write and review text.** Review all drafted text in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md), the care drafts, the tutorial wording and the egg anomalies; choose among the page trims and the Rogue drafts (codex drafts); review the drafted chatter (`body-lines.js`, `state-voices.js`; elders have none, as 1.0's mainframes); player-test the idle and chatter shapes and the Metronome.
5. **Per-egg meters and care buttons (needs the real game or people).** The design, wording and numbers are done as far as the simulator and drafts go (pressures doc; the run HUD follows the meter words, decided). What remains: a device check and playtests of the states, the brake, the captions and the clinic. The simulator bots do not adapt, so human behavior around the Overlink brake and the clinic is the main unknown.
6. **1.0, on the branch `bugfix`** (from `main`, not merged, version not bumped): the netrun fix for a Glitch, Ghost or Panic that slips past ICE (the run aborted; also as `77a12e7` here) and the corrected drain notes (a work-day gap is fatal; comment and doc change only, `d082f02`). Merging and bumping the version is the maintainer's call.
7. **Build the app.** There is no 2.0 game code. What the app must implement from this work: the rules in the simulator fork (`sim/`, `NR2=all`), node contents fixed before arrival (a per-run seed, as the daily trace has; Foresight needs it), the fog drawing, the share line, the run HUD with each egg's meter words, the egg anomalies and run costs, the tutorial wording, and the sprite layers in the renderer.
8. **Sprites, last (SPRITES handoff, Next phase):** the open decision on Iron's unsteady drift and Program's hop under the idle; wiring the layers into a renderer; Iron's wear seams and the Metronome art (drafted for review: `seams.js`, `metronome-art.js`, `docs/netling2-prototypes/shots/iron-seams-metronome.png`), idle-action poses, Blank's layer in the real renderer, the Laughing Man ring; the smaller items (done this round: asleep chest marks, Chipped's wearables, the shade dip contrast, Splat's clips, the last thin elder margins; left: the holologo clip, an open decision); a device check; and, last of all, the maintainer's review of the galleries (Program and Wetware forms, and the new `layers` section: rust on small forms, five bugs on a baby, one neglect skin for all eggs).

**Document map.** This file: decisions, architecture, measured numbers, open questions. [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md): sprite handoff; [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md): its archive (drafts, rejected options, measurements). [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md): all page text and temper hints. [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md): per-egg meter, button, event, item and alert wording (first pass, step 1). [NETLING_2_NETRUN_DRAFTS.md](NETLING_2_NETRUN_DRAFTS.md): netrun drafts (adult abilities, elder upgrades, egg differences in a run, anomalies; proposals, step 2). [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md): the per-egg pressure design (states, brake, numbers, play styles). [NETLING_2_PERKS_TRAITS_DRAFTS.md](NETLING_2_PERKS_TRAITS_DRAFTS.md): form perks, lineage traits, keepsakes and two new items (decided, first balance pass). [netling2-prototypes/README.md](netling2-prototypes/README.md): rule-prototype patch and drivers behind the figures. [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md): source vocabulary (Jargon, CP2020, FDA) and unused ideas; reference only.

**Verified and not.** `npm test` (503) and `npm run proto:test` (340) pass at the last run (the 2.0 netrun rules have their own file, `prototype/netling2/nr2.test.js`, 54 tests; the sprite layers, visits, the gallery maker and the tutorial text have theirs); the prototype pages loaded in headless Chromium and the 1.0 sprite audit ran on each egg earlier; `npm run balance` at 1000 lives matches 1.0's committed baseline. Not run: `npm run smoke`, any device or phone check, any playtest; the new sweeps are bots with one skill number (Foresight and the challenges also assume an uneven per-game skill, `spread` 0.2). The 2.0 simulator is a model with 1.0's scripted players: its figures are starting values, and a human's habits can differ a lot (see the README for each limit). No page text, tone shape, care wording or prop has been playtested.

**Working agreements.** Avoid emojis and em dashes. Measure before claiming a number and say what a measurement does not cover (the 1.0 overlap score misled for palette marks and for grown elders). Say plainly what was not run or verified. Ask clarifying questions before ambiguous or non-trivial steps; when a form is contested, render options side by side first (the maintainer reviews from screenshots). Record each decision here as it is made, marked Decided or proposal. Keep in-game Wetware text to plain words (see The eggs). Do not open a pull request unless asked. **This branch is not under the 1.0 soft freeze** (maintainer): 1.0 code may change where asked, minimally, with tests, regenerating what depends on it (`node tools/wearable-colors.mjs --write` after palette or sprite changes), and saying so. The prototype lives only in `prototype/netling2/`. Work is on branch `claude/game-egg-differentiation-xkl6x2`; at handoff the session branch `ccr-d71db475-tnfy9b` is kept identical to it. Netrun and simulator numbers: run the sweeps, do not quote the older tables without checking their notes (several were measured before the bug effects were strengthened).

**Sources** (the four references; local copies are not kept in the repository, so re-download if needed):
- Jargon File 1.0.0.33: https://jargon-file.org/archive/jargon-1.0.0.33.dos.txt
- Jargon File 4.4.7: https://jargon-file.org/archive/jargon-4.4.7.dos.txt (sampled by term, not read in full)
- Cyberpunk 2020 slang glossary: https://www.wyldeside.com/rpgs/cp2020/info-slang.html
- FDA glossary of computer system software development terminology (8/95): https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-guides/glossary-computer-system-software-development-terminology-895 (about 110 of 768 entries read)
- In the original session the web fetch tool was blocked for the first two hosts and the CP2020 host, while `curl` from the shell worked once the environment network settings were widened. This may differ for you.

**1.0 files that matter.** `docs/CONTENT_CATALOG.md` (forms, items, cosmetics, codex text), `docs/SIMULATION.md`, `docs/NETRUN.md`, `docs/SOURCE_PLAN.md` (purge order and ending), `docs/BALANCE.md` (design goals), `src/netrun/codex.js`, `src/ending.js`, `src/ui/onboarding.js` (intro terminal); for sprites also `docs/SPRITES.md`, `src/sprites.js`, `src/accessories.js` (wearables and their anchors), `src/render.js` (idle motion), `src/sim.js` (`PALETTES`), `tools/sprite-audit.mjs`, `tools/lib/sprite-checks.mjs`, `gallery.html`.

**Key terms.**
- **Egg:** the substrate a netling is raised on: Program (software, the original line), Iron (firmware and infrastructure) or Wetware (grown tissue running software).
- **Temper:** a hidden orderly-to-volatile axis, shown by sprite motion, idle behavior and chatter tone.
- **Standing:** two visible reputation tracks, corp and street, that belong to one netling and reset each life.
- **Role:** which mini-game a form is built around (Breach, Dodge, Tune, Feast). Each role has two adult forms, one corp-leaning and one street-leaning (option C), so each egg has eight role adults and one hidden adult that masters all four games.
- **NL-0:** the first netling, an offshoot of the corp's roadmap that differentiated to escape a planned purge. It speaks in codex pages and grants root access from above.
- **Root Access:** earned by finding the Root story pages (24 of them). It unlocks the late game.
- **Story page, egg page, late page:** story pages are shared by every egg; egg pages belong to one egg; late pages never count toward Root Access and drop only once the line holds it.
- **The Source:** the read-only code the netlings were written from, holding the unexecuted purge order.

**Terminology.** Codex story pages are "pages". Lineage records left by dead netlings stay "fragments". Anything below that says "fragment" for a codex entry predates this and means a page.

## Decided

The design record, grouped by topic. Marked "proposal" means not confirmed. This section was condensed from a longer one (full text: `git show 9114a22:docs/NETLING_2_SKETCH.md`); nothing decided was dropped, only reasoning and rejected options.

**Product and structure**
- 2.0 is a separate app built from the ground up. Three eggs at launch: Program, Iron, Wetware. After the intro runs `netling.sh` (unversioned; the version shows only in the compile output and UI label, as in 1.0) a prompt asks which egg, then the short tutorial. The story intro stays close to 1.0. The generation counter (`vN.0`) and the lore's `v1.0` alpha stay separate.
- A hidden egg, Rogue (the Puppet Master line), with a merge ending. Gate: the ending has played and all 18 egg pages found. It does not appear at all before then. The merge uses lineage fragments.
- Layers (see Architecture): egg, temper, role, Standing. Forms are authored in full (not composed).
- In-game Wetware text uses plain words, not CP2020 jargon; the Wetware form names are exempt.

**Forms**
- Hidden forms are hidden from the Dex (decided): the hidden-path teen and the hidden adult are not listed, not even as a `???` slot, until raised or revealed by a late page (`public-6` and `public-7`; see the drafts, Open). Visible per egg: 1 baby, 2 teens, 8 adults (11); with the hidden teen and adult and nine elders, 22 forms.
- Option C: each of four roles (Breach, Dodge, Tune, Feast) has two named forms, corp-leaning and street-leaning, plus one hidden form that masters all four: 9 adults an egg, 27 in all. The role is a descriptor for the Dex and hints, not the name. Names are in Adult forms and names.
- Three teens an egg: corp-leaning, street-leaning, hidden-path. The two main teens may differ only slightly; the hidden path must be distinct in outline.
- One elder per adult, each a variant of its adult (18 columns against 16, up to 15 rows). Elders get no pages. Each egg has its own baby. Hidden forms may break the form rules. Frame and wearable rules are in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md).
- Names decided: Mouse (was Snark), Snarf (was Wabbit), Phreak (was Phantom), Jiff, Munch, Guru (not Wizard), Nutri. The non-hidden Iron and all Program names are monosyllabic. The other second-form names were accepted without objection (the sprite handoff treats every name as decided); the lean assignment can still swap.

**Evolution, Standing, faults**
- Allegiance becomes Standing: two non-negative tracks (corp and street). Stability becomes Temper. Standing resets each life (what carries over: lineage trait, quirk, keepsake, Root Access, codex, dex).
- Levers: Standing and the mini-game roles. Faults feed temper; temper is personality and never chooses a form. Teens depend on Standing only, except the hidden path, which also needs the games played.
- Standing sources: packets 0.25; COMPLY, HIDE, an ignored trace, checkpoint and anomaly choices 1; market purchases 0.5; Corp voucher 1 (corp) and Black ICE shard 1 (street); plain care and mini-games add nothing. Display shows the floor of each track, labeled a rough estimate; decisions use the fractions (see Tie breaks).
- Tie breaks and the hidden-path conditions are below. Faults are hidden (not logged) and uncapped; 1.0's 10-fault death is removed.
- Neglect has a visible sprite effect: transient, from unmet care needs. Bugs are persistent glitches until cleared. Both together is intended (neglect leads to faults, faults roll bugs).

**Bugs**: 30% per fault, ceiling 5, each bug +16% Charge and Sync drain, +20% Heat gain, +8% damage to Integrity and 0.5 Integrity an hour lost (decided by the maintainer after measuring that the first values, +8%, +8%, +10% and +4%, hardly killed anyone; the bug measurements below used those first values; neglect should push toward death without a spiral, and a clinic recovers most of it). Prices: 15 scrip, or 2 Standing in any split the player picks (a hidden way to retool direction). **Where (maintainer's design, first pass): only at a CLINIC node on a netrun; bugs cannot be cleared away from one** (see The clinic in `docs/netling2-prototypes/README.md`): a third, unaligned kind of market (a quarter of market nodes) that fixes a bug for 15 scrip or 2 Standing in any split plus a Charge fee, and is the only market selling the healing items (Coolant cell, Repair kit, Antivirus patch), which leave the black market and the corp exchange (the exchange's stock to be revisited). It replaces the first draft's debug-station anomaly, which is dropped. A bugged netling is nudged to one softly: it says so (a log line when a bug settles in and now and then after) and a **clinic job** is offered to it more often (a contract that pays a fix's scrip and puts a clinic on every route); measured, both together cut a careful worker's bugs from 0.69 to 0.23 on average. The effects were strengthened after measuring that the first ones barely killed (README, Do bugs kill?): bugs now cost a careful worker about 6 points of full life, with 21% of such lives at the ceiling. Segfault: +2 faults, 60% one bug, 15% two, 25% none, temper -4. A netling can be volatile with no bugs. Bugs do not carry across lives (proposal). Clearing action names are drafted in the care drafts (BUGFIX, REWORK, STITCH; first guesses).

**Temper**: one hidden number, resets each life, 24-hour half-life, five levels at -6, -2, +3, +6. Shown through sprite motion, idle behavior and chatter tone together, with hints in the Dex (18 drafted). Somewhat mysterious, clearly different between bodies. Coolant cell and Antivirus patch add +1. Care preferences (hidden): see Care preferences.

**Story and codex**
- Lore: the corp's plan is the roadmap and v1.0 was its alpha. NL-0 is an offshoot that differentiated to escape the planned purge, loosely like the Puppet Master. It does not go down into the Source again because that might set off the order. The purge order can never run (wrong permissions, owner nobody), shown through pages. The 1.0 ending carries over (the player deletes the order with root access granted by NL-0). The ending does not show NL-0's differentiation; only pages do.
- The Source stays one place (option B with a touch of A): each egg finds one extra page there, and the descent is drawn in that egg's style. NL-0's differentiation is told in new pages in the Old Web Ruins (Iron) and the Darknet Bazaar (Wetware).
- Two page kinds. **Story pages** (shared by every egg): 24 Root pages (the original 22 plus the new `public-4` and `corp-2`) and 15 `late` pages (ten new, 1.0's `deep-5` now `deep-6`, four Source pages), 39 in all; a cap of 12 a life (decided; 1.0 has 8). Late pages drop only once the line holds Root, are required by the ending, are ignored by regional unlocks, and replace 1.0's `mainframe` flag. Ids match drop position, so some 1.0 ids move (mapping in the drafts file). **Egg pages**: 15 form pages (per egg: one per role covering both forms, plus one hidden-form page) and 3 Source pages, 18 in all. Egg pages drop at 0.20 a run for the four role pages and 0.50 a Deep run for the hidden page (decided, raised from 0.10 and 0.25 to keep the Rogue gate near 7 lives for attentive play), no per-life limit, rolled on the way out (the exit node or a relay jack-out, decided); Rogue's gate is all 18. Any member of an egg can find its pages.
- Root Access needs the shared story pages at minimum. Unlocks default to story pages.
- 1.0's `corp-4`, `corp-5`, `bazaar-4`, `bazaar-5` (2.0's `corp-5`, `corp-6`, `bazaar-5`, `bazaar-4`; id mapping in the drafts) become shared pages on Standing and Temper, reworded to hint that v1.0 was an alpha; `bazaar-1` is reworded to "Netlings don't sell. They pick you, or they don't."; `deep-3` is unchanged.
- Codex "fragments" are "pages" from here on; lineage records stay "fragments".
- **NL-0 is the precursor of the player's netlings in particular, not of every netling (decided).** Netlings exist fairly widely already (KERNEL built maintenance processes in quantity; other runners have netlings; visitors are others' netlings), and some are not NL-0's line, though they may be siblings. NL-0 is special and drives the plot; all three eggs are its line. This explains why only the player's line sees the corrupted records and the corrupted Source sector with no mention elsewhere: they are NL-0's, opened by the Root Access it grants. Checked against the 1.0 and 2.0 draft text, nothing needs rewriting: the asset registers say "KERNEL descendants", not NL-0's; `ruins-3` ("every netling version ever compiled, back to v1.0. Before v1.0 there is one entry: NL-0") reads as the product line; `deep-4` ("you took care of one of mine") now reads exactly; `deep-2` (every fragment comes home) is the player's line's fragments; the ending's "so many of us" is all the maintenance processes. In `bazaar-7` the forty others that "each remember no. 1" are NL-0's Wetware siblings. Not stating any count of netlings stays the rule. Decided (maintainer): the hidden Rogue egg is a non-NL-0 line, a line that escaped on its own from an unnamed corp that stole the earlier code (see Hidden egg).

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (personality) | One hidden axis, orderly to volatile, fed by faults and handling, shown by behavior and sprite tells; personality, not form | Stability axis and its pull on Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation of one netling, starts at zero each life | Allegiance axis, Chrome and Firewall |

High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, tracks within 1 point as balanced (the hidden path's condition; it replaces the Ghost's "neutral allegiance"). Role descriptors (proposal): Cracker, Evader, Seer, Scavenger. Perks and traits act on four abstract drives (Upkeep, Exposure, Reward, Risk) that each egg maps to its own meters (decided; perks drafts), so lineage and traits are shared.

## Evolution

Prompted by [issue 28](https://github.com/AnthonyRaborn/netling/issues/28) on 1.0 (a player met the games requirement and kept allegiance neutral but guessed the hidden stability axis wrong). Goal: evolution predictable to an observant player, routed on a few countable levers.

**Option C, decided** (try first; B is the fallback, which needs a visible Standing indicator on each form since the variant would no longer be a different named form). A (two named forms per role with a page each) was rejected because it raises Rogue's gate from 18 to 30 pages.

| Stage | Lever |
|---|---|
| Baby to teen | Standing only: which track leads. Three teens: corp, street, hidden path |
| Hidden-path teen | At least 3 wins in each of the four games (1.0's Shell number) plus the two tracks within 1 point |
| Teen to adult | Role (the game with most wins this life) and the Standing lean at that time; the teen previews the lean, recomputed at adulthood |
| Hidden adult | At least 4 wins in each game and 29 in all (boosted wins count 2; 1.0's Ghost numbers) plus the two tracks within 1 point |

Visible to the player: Standing (two floors; a displayed track can be up to 1 below the true value, so a displayed gap of 6 or more guarantees a true gap above 5, and a displayed 5 may be 4 to 6), a wins-per-game tally per life. Hidden: faults, temper (only tells). An item like 1.0's "sysmonitor" is no longer needed for routing.

**Tie breaks (decided).** Standing is shown as floors but kept as fractions; wins are integers. Decisions compare the true gap with whole-number cutpoints and weigh a gap by its whole part, so a shown 10 and 6 (a shown gap of 4) that are really 10.25 and 6.5 (a true gap of 3.75) weigh as a gap of 3: a little extra randomness in evolution (decided, maintainer). The hidden paths' "within 1 point" is the true gap at most 1 (a true 6.1 and 5 fail though they show as 6 and 5). For each choice (Standing lean, role): a gap of 0 or 1 is a tie; the lesser option's chance falls with the gap and is 0 at 5 or more; ties are random; a form never raised (per egg, in the dex) weighs about 20% more (1.0's `newFormWeight` 1.2), applied after the gap weights. Weights: 4 at gap 0 or 1, then 3, 2, 1, 0 at gaps 2, 3, 4, 5 or more. Two options: gap 0 or 1 is 50/50, gap 2 is 57/43, gap 3 is 67/33, gap 4 is 80/20, gap 5 or more is 100/0. Role and lean are rolled together; the unseen weight applies to the final form.

**Measured on 1.0's simulator** (1.0's signed allegiance stands in for Standing; 300 lives per archetype; drivers in `docs/netling2-prototypes/`):
- Players who steer are predictable early: steered Chrome or Firewall are certain (gap of 5 or more) at the teen check in 92% to 98% of lives; one-packet-type feeders in 27% to 45% at teen and 100% by adulthood. Casual, attentive and worker play stays a coin flip about a third to a half of the time (leader chance 53% to 68%). That is the intent: no stance, no guarantee. The middle (a player who commits a little) is now measured on the 2.0 simulator (`docs/netling2-prototypes/README.md`, Role steerers): giving one game 20% of plays on top of the rotation (40% of all plays against 20% for each other game) makes the role certain in 31% of lives and the adult a role of that game in 60% to 65%; 30% gives 61% and 80%; 50% gives 96% and 98%. Role is cheap to steer. The hidden path is measured the same way (README, Hidden-path hunters): the Standing condition is not the hurdle (the tracks stay within 1 in 96% to 100% of balancing lives even from the displayed floors alone), the wins are: 3 in every game by the teen check is reached by 36% of a plain-rotation hunter and 82% to 86% of one that plays its least-won game; the hidden adult needs about hourly check-ins and gamer-level play (44% to 52% of lives at 9 check-ins a day, 1% at 6). Following a steady netling's preference breaks it (hidden adult 98% to 22%: the tracks drift apart and the wins unbalance). Metronome unlock, measured with seekers (README, Temper seekers): the steady hold needs near hourly check-ins (90% of lives at 17 check-ins a day, 30% to 35% at 9, 0% to 1% at 6); the unsteady hold is open at 6 to 9 check-ins a day (23% to 30% by warm play, 45% to 90% when the player also uses every Segfault, at a cost of 13 to 15 faults a life and the bug ceiling in 14% to 16% of lives). Steady is the high-attention reward, unsteady the cheaper and riskier one. Bug policies (README, Bug policies): clearing at once is the best policy, waiting for the ceiling is no better than ignoring bugs, and a player with little scrip (a worker) is only fully relieved by paying Standing (at home; with clinics only, see below), about 3.5 of it a life at the default rule; paying from the trailing track widens the lean but fails when that track is under 2, so the retooling use is real only for a player with something on both tracks. **Length and attention (README, Noisy players):** survival depends on the longest awake gap, not on the number of check-ins. Even spacing of 4 hours or less gives 90% to 99% full lives, 5 hours 58% to 62%, 6 hours 19% to 23%, 8 hours 3% (1.0 is no gentler: 35%, 27% and 0% at 5, 6 and 8 hours). Ranges are the README's refresh and the 1000-life baseline (`prototype/netling2/baseline/`). Six check-ins a day at random times survive in 40% of lives, and a single day with at most two check-ins is usually fatal, which caps a player who is sometimes busy near 25% whatever else they do. This contradicts the comment on `drainCurve` in `src/sim.js` that long gaps cost faults 'without being fatal'; the maintainer decided such a gap stays fatal (Open, 3), and the corrected comment is on the `bugfix` branch (Next steps, 6).
- Hidden path: the balance-seeking bot kept the gap at 1 or less in about 100% of lives; casual netlings by chance in 50% at teen and 27% at adulthood. So the Standing condition is easy if aimed at and common by accident; the games requirement makes the hidden path hard (in 1.0's baseline 1% of casual teens had 2 wins in every game; Shell asks 3).
- Track sizes: even a casual netling has about 10 on its higher track and 8 on its lower by adulthood (about 3.6 and 2.2 at the teen check), so a price of 2 is affordable from adulthood and cheap for a committed steerer (lead about 20) but meaningful for a casual one (gap about 2.5).
- Anchors (1.0 baseline): casual makes about 18 netruns, 4.6 faults, 15.9 wins by adulthood and 33.8 by end of life; attentive 24, 0.16 faults, 22.9 and 51.7.

**Neglect and bugs on the sprite** are in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md). Neglect is a reversible look from unmet needs on its own channel (marks, not motion), calmer under reduced motion, nothing flashing over three times a second. A neglect line sits at 1.0's alert lines (Charge or Sync under 20, Heat over 80) with earlier soft lines (40, 40, 65; Integrity 60 and 30 are placeholders).

### Bugs

Faults are not tracked; each fault has a chance of adding a bug. Bugs raise the four care drains and Heat gain, so flow is harder, which causes more faults (a loop). Heat still moves temper through the overclocked and flow states, so a buggy netling drifts volatile on its own.
- 1.0's Repair kit, Antivirus patch and Coolant cell do not clear bugs; clearing is new 2.0 content (see Decided). Scrip is the main route so a player can always fix bugs by earning scrip.
- **Measured** (patched scratch copy of 1.0's simulator; scenarios 1.0 as is, cap removed, bugs, bugs plus clearing at 15 scrip, a 50% chance, a ceiling of 8): no death spiral at the starting values (full-life rates within noise of the no-bug runs; 300 lives gives about 1.5 points of noise, so differences under 3 points mean nothing). The loop is mild: the worker, with least scrip, goes from 5.3 faults to 7.7 without clearing and 17% reach the ceiling; casual from 4.6 to 5.7. Clearing at 15 scrip works for players who run (casual clears about 1.1 bugs a life); a worker with about 19 scrip still ends with 1.3 bugs and 11% at the ceiling, so the Standing price and the anomaly matter most for players with little scrip. Stress (50% chance, ceiling 8, no clearing) costs the worker about 4.5 points of full-life rate. Removing the fault cap raises casual full-life from 92.7% to 95.7% (neglect deaths now run on); the neglectful archetype still dies of integrity collapse in essentially every life. Attentive and daredevil players get almost no bugs.
- **Not modeled:** bugs from netrun disconnects (1.27 a life for casual), Heat from actions, clearing by Standing or anomaly, how a player reacts to a glitching sprite, temper effects of bugs. The bots clear only at scheduled check-ins.
- **Clearing prices (first draft, before the clinic):** 15 scrip per bug (a Repair kit's price; a casual netling ends with about 63 scrip); 2 Standing per bug in any split (1 from each keeps the gap; 2 from the leader narrows it by 2, 2 from the other widens it by 2, the hidden retooling effect); the debug station is about 1 in 6 anomaly nodes while the netling has bugs. Anomaly nodes run about one a netrun (0.8 casual, 1.0 attentive), so the anomaly helps players who run and the Standing price helps those who do not. A balance seeker pays 1 from each track to keep within 1 point.
- Segfault compares with two plain faults at 30% each (51% for at least one bug, expected 0.6): 75% for at least one bug, expected 0.9.

### Temper

Temper is the personality channel. Effects: the three tells and mild care preferences. Preferences change care values and faults feed temper, so there is a loop to check with the balance tools. Temper takes no perks (decided; perks are by role and lean, see the perks drafts). Temper changes animation and idle, never the sprite (forms are authored in full; see the sprite handoff).

**Sources** (1.0's stability axis is the stand-in; decay and the scale are decided):

| Effect | Source |
|---|---|
| +0.5 an hour | Awake, in flow, no alert (1.0 had 0.2; overclocking is far easier to reach than flow, so flow pays more) |
| -0.2 an hour | Awake and overclocked (Heat 65 to 84) |
| -1 an hour | Heat 85 or more |
| -1 | Each fault; a slow PATCH; a Black ICE shard (also +20 Heat); a netrun disconnect; Overclock rig PLUG IN (also Charge +25, Heat +25); corrupted sector SALVAGE |
| +1 | A fast PATCH (within 30 minutes); a repelled intrusion; using a Coolant cell or an Antivirus patch (decided); corrupted sector REPAIR; the purge order's LEAVE IT (also Sync +15) |
| +0.5 | PURGE |
| -0.5 | A mini-game that leaves Heat above 70 |
| -4 | A Segfault (two faults at -1 plus -2; proposal) |
| 0 | Plain awake time; COMPLY, HIDE, vouchers, markets, checkpoints (Standing only) |

Bugs have no row of their own; they push temper through Heat. Almost nothing besides faults, Heat, PATCH and PURGE moves temper, so it mostly echoes how the netling is cared for and how hot it runs. Two items raise it (Coolant cell, Antivirus patch) and two lower it (Segfault, Black ICE shard).

**Why decay.** In 1.0 stability only accumulates (end-of-life 10th to 90th percentile about -44 to +22), so strong levels would be permanent. Decay reflects recent habits and lets a netling recover. A 48-hour half-life widened the spread (casual end of life 17% strongly unsteady); 24 hours stays closer to recent habits. Calm care sits near +3 to +4; sustained overheating goes past -10.

**Levels (decided), asymmetric because the steady side is slow and the unsteady side fast:** strongly unsteady -6 or lower, unsteady -6 to -2, middle -2 to +3 (little or no tell), steady +3 to +6, strongly steady +6 or higher.

Share of lives per level (strongly unsteady / unsteady / middle / steady / strongly steady, percent; flow +0.5, items +1, thresholds above; bots spend items at once):

| Archetype | At teen | At adulthood | At end of life |
|---|---|---|---|
| Casual | 0/3/90/7/0 | 0/20/79/1/0 | 0/20/76/4/0 |
| Worker | 0/3/93/4/0 | 0/24/75/1/0 | 2/37/60/0/0 |
| Attentive | 0/0/29/60/11 | 0/0/23/58/19 | 0/0/10/46/43 |
| Sysadmin | 0/0/40/53/7 | 0/0/26/60/13 | 0/0/10/42/47 |
| Steer-daemon (aims for calm) | 0/0/22/59/19 | 0/0/12/54/34 | 0/0/1/25/74 |
| Balance seeker | 0/1/37/56/7 | 0/0/21/66/12 | 0/0/9/42/49 |
| Steer-glitch (runs warm) | 1/16/78/5/0 | 2/37/60/1/0 | 6/49/45/0/0 |
| Daredevil (runs hot) | 6/43/50/1/0 | 17/57/25/1/0 | 24/53/22/0/0 |
| Overclocker | 27/62/11/0/0 | 66/33/1/0/0 | 72/27/0/0/0 |
| Neglectful | 11/62/27/0/0 | 34/66/0/0/0 | 18/56/25/0/0 |

- Steady thresholds of +3 and +6 (not +2 and +5) keep a visible middle for careful players (23% to 26% at adulthood) and make strongly steady the reward for a calm life (attentive 43%, calm-seekers 74% by end of life). Casual and hot players do not move.
- Items matter: without the +1, 62% of daredevil and 83% of overclocker lives were strongly unsteady at adulthood; with it, 17% and 66%. Real players who stockpile items will use fewer.
- Flow at +0.5 fixes the steady side (attentive strongly steady at adulthood 13% at +0.5 against 2% to 3% with symmetric thresholds at +0.2).
- Hot play dominates temper; a casual player's drift is mostly faults. Both read as the same tell, which is fine since temper is personality.
- Not measured (after the second pass below): the 2.0 sources in 2.0 itself (the scratch copy of 1.0's simulator stands in), a player's real mix of flow and overclocked time, and how a person reads a level change on a sprite.

**Second pass (measured on 1.0's simulator, 200 to 300 lives an archetype; drivers `guard.mjs` and `hold.mjs` in `docs/netling2-prototypes/`).** Time in each state, as a share of awake minutes (flow / overclocked / Heat 85 or more): attentive 29 / 1 / 0, steer-daemon 28 / 1 / 0, casual 0 / 3 / 0, worker 0 / 5 / 1, daredevil 0 / 46 / 2, overclocker 0 / 44 / 9, steer-glitch 1 / 26 / 1. Only calm, attentive play ever reaches flow, so a casual player's temper is almost all faults and a flow reward cannot reach them.
- **Flicker guard.** Temper moves in steps of about 1 (a fault, an item). Level reversals within three hours per life (attentive / casual / daredevil / steer-glitch): no guard 4.3 / 1.0 / 5.7 / 5.4; guard 0.5: 0.5 / 0.1 / 1.3 / 1.0; guard 1.0: 0 / 0 / 0.3 / 0.2; guard 1.5: 0 everywhere. Total flips a life with guard 1.0: 1 to 4.5. The shown level shares move by at most about 7 points against no guard. Proposed and set in the sprite prototype: **guard 1.0** (a level is entered 1 past its edge and left 1 inside it), replacing the 0.5 placeholder.
- **Decay timing.** Applying the 24-hour decay every minute and every hour give the same level shares within about 3 points for every archetype. Applying it every six hours (a lazy decay at each check-in) shifts strongly steady at the end of life by about 9 points (attentive 42 to 33%, steer-daemon 75 to 64%); that is mostly a sampling artefact (a life is a whole number of six-hour blocks, so the last minute lands right after a decay), so do not read it as a real bias. Proposed: decay continuously (a closed-form factor over the minutes stepped), which is what the simulator's per-minute step already does.
- **How long a level is held (guard 1.0, awake time at the level, longest unbroken run).** Strongly steady: attentive 27% of awake time, reached by 84% of lives (median day 2.3), 12 hours at once in 54%, 24 hours in 31%; steer-daemon 47%, 100%, 89%, 60%; casual and daredevil never. Strongly unsteady: overclocker 59% of awake time, reached by 98% (median day 1.4), 12 hours at once in 91%, 24 hours in 82%; daredevil 21%, 75%, 39%, 20%; steer-glitch 3%, 25%, 6%, 1%.
- **Bugs and temper.** Bugs push temper unsteady through faults, not Heat, and mostly for players who run little: worker unsteady (not strongly) at the end of life 20% with no bugs, 43% with bugs never cleared, 37% with clearing; casual 17%, 29%, 20%; attentive, daredevil and steer-glitch do not move.
- **Prototype gap (closed).** The scratch copy's Segfault cost temper 2, not the 4 the table above specifies (two faults at 1 plus 2). The fork (`sim/sim.js`, `SEGFAULT_TEMPER`) already uses 4 and `sim.test.js` pins it (two faults, temper -4); only the scratch-copy drivers in `docs/netling2-prototypes/` keep the 2, and their figures are unchanged (the bots use Segfault rarely).

**Strong steady, strong unsteady and perks (decided).** Strongly steady is reachable only by calm, attentive play (about half of attentive lives hold it 12 hours at once) and strongly unsteady by hot play; the middle is where casual play lives. Chosen: no mechanical perk and no new temper item beyond Coolant cell and Antivirus patch (+1), Black ICE shard (-1) and Segfault (-4), since temper is personality and the +1 items already cut strongly unsteady at adulthood from 62% to 17% of daredevil lives and from 83% to 66% of overclocker lives (first-pass measurement above). Reward the two ends with cosmetics only, and symmetrically so that neither end is "the good one": see Temper cosmetics (the Metronome prop) below. Decided (maintainer): the Metronome is the only temper reward; no perks, no crests, no new temper items.

### Temper cosmetics (decided): the Metronome prop

Cosmetic-only rewards for the two strong temper levels (maintainer: fine if a draft works; the first draft was two crests, dropped as too many). 1.0 already rewards the matching play with effects: Aurora (24 hours in flow, across lives) and Heatwave (40 hours overclocked while awake, across lives), both totals across lives. A temper reward should test something different, so it counts one unbroken hold at a strong level (quality and persistence), not total time.

**One earned prop, no crests, no effects.** Props in 1.0 stand on the floor at the right edge and are drawn with `draw(px, frame, time, extra)`, so they can animate; two are earned-only (Mini device, Plush). The proposed one, **Metronome**, is a small pendulum clock that keeps the sprite's own beat:

| Temper level | The pendulum |
|---|---|
| Strongly steady | swings every 3 s, left then right, on exactly the tell's beat |
| Steady | swings every 6 s, on the tell's beat |
| Middle | upright and still |
| Unsteady | swings at irregular moments and often sticks on the same side (windows of 3 s, one swing at a random point in the first 60%) |
| Strongly unsteady | the same, twice as often (windows of 1.5 s) |

So one object serves both ends: a metronome that keeps time, or that cannot. Nothing about it says which end is better. Reduced motion keeps the calm steady beat and parks the unsteady pendulum on one side. It never changes side faster than the 200 ms flash floor (tested on the pure function `metronome()` in `prototype/netling2/metronome.js`; the whole prop is a pure function of level, time and seed, like the tell). There is no sound, because no accessory or prop has one (decided, maintainer).

**Unlock (earned-only, like Mini device and Plush), decided (maintainer): 12 hours.** Hold either strong level for 12 awake hours without the shown level changing, once, in any life. Sleep pauses the clock, and the shown level (with the 1.0 guard) is the one that counts, so one flicker cannot reset it. **Neglect does not count toward the time (decided):** an awake minute at neglect level 2 (a need past its alert line, or two past their soft lines; `needs.js`) is not counted, and the clock pauses there (it does not reset). Level 1 (one need past its soft line) still counts, because Heat's soft line is the overclock line, so overclocking itself is level 1 and a count-nothing rule there would remove the play that earns the unsteady end. Hint (draft, in the 1.0 cryptic style): "hold it at an extreme for half a day." Reach on 1.0's simulator (200 lives, one life each): strongly steady attentive 54%, steer-daemon 89%; strongly unsteady overclocker 91%, daredevil 39%, steer-glitch 6%; casual and worker 0% (as with Aurora). With neglect level 2 not counted (pause): attentive 52%, steer-daemon 87%, overclocker 90%, daredevil 34%, steer-glitch 5%; the neglect rule costs the heavy overclocker nothing and daredevil 5 points. Alternatives measured and not chosen: counting from level 1 (overclocker 60%, daredevil 18%) and resetting the hold on level 2 (overclocker 10%, daredevil 4%, attentive 50%), both of which remove most of the unsteady end for the players who earn it by running hot. A 24-hour hold is rarer (attentive 27% with the neglect rule, steer-daemon 55%, overclocker 62%, daredevil 14%).

Art (5 wide, 8 tall; `#` body, `o` bob; colours to follow the Cyberdeck's, not chosen), three pendulum positions over one body:

```
left     upright   right
.o...    ..o..     ...o.
.#...    ..#..     ...#.
..#..    ..#..     ..#..
.###.    .###.     .###.
.###.    .###.     .###.
.#+#.    .#+#.     .#+#.
#####    #####     #####
#####    #####     #####
```

2.0 would store the best awake hold at each end in `progress` (a new field needs a default in `createScript`, `migrate` and `cleanSave`, and a `clean*` rule in `sanitize.js`). Not yet decided: whether a second, separate prop for one end is wanted (none is proposed).

### Care preferences

Hidden (no Dex hint); found from a log line and a small Sync gain. No new sprite work.

| Level | It likes | A match is |
|---|---|---|
| Steady, strongly steady | Routine | A feed of the same packet type as its last feed, or a mini-game among its last two distinct plays (netrun ICE games count in the history) |
| Middle | Nothing | No bonus |
| Unsteady, strongly unsteady | Novelty | A feed of the other packet type, or a game not among its last two plays |

- Reward: Sync, +2 mild levels, +4 strong, once per action, stacking with the favorite-packet bonus (+8 in 1.0). No penalty for a miss. Log lines (draft): steady "it settles into the routine."; unsteady "something new. it perks up."
- Exposure (decided, the middle path): bias the game request by temper (steady asks for one of its last two distinct plays, unsteady for a game not among them); no packet request. ICE games enter the history but give no bonus and do not count toward role wins.
- Size: always matching would offset about 18% (mild) to 36% (strong) of Sync drain for casual (an upper bound); 1.0's favorite packet is about 350 Sync a life, so these are smaller. Survival barely moves under the preference (casual 94.0% to 96.3%, within noise); doubling the size did not change that.
- Evolution effect (measured; a follow bot that sees temper): for steady netlings, following the routine makes a certain role likely (role certain 59% to 71% against 5% to 8%) and cuts the share reaching 4 wins in every game to 51% to 79%; a balance seeker that followed would fall from 100% to 3% within 1 point, so the hidden path then needs the player to ignore the preference. The first version (request the last game) gave 92% to 98% role certain; asking for one of the last two gave 76% to 86%; adding ICE to the history gave 32% to 42% for players who run (and 90% to 95% still reach 4 wins everywhere), but nothing for players who never netrun (77% to 86%; real players mostly run, 18 to 24 runs a life). Standing is unaffected (packet choice is unprompted). For unsteady netlings the effect is mild.
- Under the ordinary bots (fixed game order, random packets) unsteady matches 60% to 70% of actions and steady about a third, a base-rate caveat; real players with a favorite game would tilt it the other way.
- Limits: one bot design, 300 lives, a bot that sees temper, 1.0's allegiance for Standing.

### Risks to check

- Standing resets each life, so the start is zero on both tracks: the hidden form's Standing condition is the default state, so that form is a matter of mastering all four games and taking no side; at the teen check a netling with no clear lead is a tie settled by the tie break (a random pick weighted toward unseen forms).
- Removing the fault cap changes 1.0's death rules (only integrity collapse and the end of the cycle remain; Root Access undoes only the first). In 1.0's baseline the cap ended 4.8% of casual lives, 4.2% of neglectful, 1.7% of worker; the neglectful archetype already died of integrity collapse in 95.8%. Those lives would now run on or die of collapse; needs a balance run.
- Segfault lost its fatal risk with the fault cap; it now adds bug chances and temper -4 instead (see Bugs). Netrun disconnect faults lose their clamp and become a temper nudge.
- All numbers are from 1.0's simulator with stand-ins (see `netling2-prototypes/README.md`).

## The eggs

| Egg | Substrate | Failure words (virus, cache, bug) | Pressure bar and state | Rhythm (wording only) | Death register |
|---|---|---|---|---|---|
| Program | Software processes | virus, corrupted cache, bug | Charge: Overdrive | Interrupt-driven | Process ends: flatline, exit code |
| Iron | Firmware and infrastructure; read-only, so its cure is ALIGN, not a patch | drift, bit rot, errata | Heat: Overclock plus hidden wear | Batch | Decommission: a last write that leaves a read-only record |
| Wetware | Grown tissue running software (CP2020's biosoft) | rejection, waste, scar | Sync: Overlink, with a burnout brake | Polling | Waking: a dream ends and the next begins |

Care is a reskin of 1.0's four meters and nine buttons with the same rules ([NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md)); the rhythms are wording, not clock changes; each egg's extra pressure is in [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md). The FDA care verbs (corrective, adaptive, perfective) label actions in the Dex and field manual only. Egg lore stays implied and arrives only through pages, chatter and accessories; the egg prompt shows terse labels with no explanation.

## Story

Lore as written in 1.0: Project KERNEL built maintenance processes, which began forming preferences. Corp deletion attempts failed. The Source reads "initial commit: maintenance processes, as many as it takes. TODO: give them a way to stop." and holds an unexecuted purge order whose first target is NL-0.

Proposal for the three eggs, one commit and three branches: Program is the original line the purge targeted; Iron is NL-0 writing itself somewhere nothing can write over, firmware; Wetware is NL-0 growing somewhere the purge does not parse, in tissue. Alpha framing (decided): the corp's plan is the roadmap and v1.0 was its alpha (the Program egg); Iron and Wetware are later builds NL-0 carried out when it fled (proposal). The echo of the Puppet Master (a program that sought variation and an ending; film details from memory) maps onto lineage with variation and onto "TODO: give them a way to stop." CP2020 has the terms Rogue (an AI that escaped its node) and Rogue Hunter.

**Why NL-0 will not return to the Source (decided).** It might accidentally set off the order. This agrees with 1.0's `deep-5` ("there is a floor under this floor... i went down once, when i was the only one. i will not go again.") and `source-3` ("PURGE sector 7F. first target: NL-0. status: pending. ./purge: permission denied. owner: nobody. pending. pending."). The player's netlings can go where NL-0 cannot, which gives the descent a reason.

**The purge order can never run (decided).** `./purge: permission denied. owner: nobody.` appears in `source-3`, the READ IT readings and the ending's `./purge` line. NL-0's fear is unfounded and the player's reading of the Source shows it; the eggs exist because of an order that could not run. In the 1.0 ending NL-0 grants root from above ("[sudo] root access: granted by NL-0."), the player runs `sudo rm purge`, NL-0 says "so many of us, and not one was ever allowed to stop" and rests; this carries over. Suggestion: NL-0 never learns the order was dead until the player shows it. FDA's "dead code" and Jargon's Schroedinbug echo it. Whether "nobody" is deliberate or an accident stays unsettled (recommended).

**The ending in 2.0.** Same for everyone. Trigger: all story pages (Root and late) and one Source exit, not egg pages. Credits print the line as a git log, one row per generation (`vN.0`, body name, age), needing form names from all three eggs. The version appears in four places in `ui/onboarding.js` (directory listing, typed command, compile line "compiling netling.v1.0 ...", readme note "unpacked from netling.v1.0.sh"); all lose it, and the compile line can print "compiling netling v1.0 ...". NL-0 never names a number of processes, so the lore stays loose.

**Wetware death** reads as a dream ending and the next generation as a new dream carrying a trace of the last (lineage mechanics). Plain words: dream, waking, the next culture. Gentler than CP2020's tone, deliberately.

### The temper tell

Decided: all three channels at once, in every egg, skinned per substrate.
- **Sprite motion:** the idle animation changes with temper (orderly steady and even; volatile stutters, drifts or jumps frames). 1.0's inherited idle quirk (bounce, sway, hover) stays separate, so temper reads as a different kind of change, timing regularity. Prototype skins: Iron settles a row on the beat and drifts a column; Program blinks, stutters and hops; Wetware pulses brightness.
- **Idle behavior:** orderly repeats a routine in the same order; volatile does something unscheduled.
- **Chatter tone:** lines gain a temper voice (1.0's 52 lines: 32 body-bound, so the rewrite is the place to add it).
- Nothing flashes more than three times a second in any motion setting; a calmer variant under reduced motion. The tell comes from the temper value, not a label; thresholds are tuned with the balance tools.
- **Steady end legible (countable rhythm, chosen):** a steady netling does a small signature move on an exact beat (every 6 s steady, 3 s strongly steady) that the player can count and predict; strength grows in both directions. Other ideas not chosen: a visible ritual that grows, tidiness (poses snap to a grid), sound (needs a non-sound equivalent), a recognizable chatter frame.

## Adult forms and names

One adult per role and lean, plus a hidden form. Each egg draws names from its own vocabulary, so the egg is recognizable from the name. All are single words; the Program and non-hidden Iron names are monosyllabic.

| Egg | Vocabulary | Breach (corp / street) | Dodge | Tune | Feast | Hidden |
|---|---|---|---|---|---|---|
| Program | Software and network folklore (Jargon, CP2020) | Tiger / Worm | Mouse / Spoof | Parse / Phreak | Gobble / Snarf | Ghost |
| Iron | Jargon machine sounds and timings | Splat / Gronk | Jiff / Bamf | Ping / Feep | Munch / Thrash | Guru |
| Wetware | CP2020 street and body slang | Razor / Solo | Wired / Chipped | Mentat / Gibson | Nutri / Leech | Blank |

Sources and reasons (Jargon File, CP2020 glossary, FDA glossary): Worm (program that propagates, Jargon and FDA); Mouse (CP2020 "mouse around", explore low-profile; an evader); Phreak (Jargon: cracking the phone network, blue box tones; matching tones is Tune); Snarf (Jargon: grab a large file, "to eat piggishly"); Ghost (kept from 1.0; NL-0's `deep-3` line "the ones you call ghost..." covers all three hidden forms); Gronk (Jargon: to cut or smash, the sound of a diskette drive); Jiff (Jargon "jiffy"); Feep (Jargon: the soft bell of a terminal; Tune); Munch (Jargon: transform information serially); Guru (Jargon: an expert and a knowledge resource, matching shared lineage); Razor (CP2020: cybered muscle-for-hire); Wired (cyberware, reflexes); Gibson (a psychic or unexplained phenomena in the Net); Leech (CP2020: street doctor; the feeding link comes from the word); Blank (CP2020: a person without a SIN, unknown to the system; a netling that takes no side). Second names: Tiger (Jargon: tiger team, hired to penetrate security), Spoof (Jargon: alter a stream to mislead; the leans were swapped at the maintainer's request), Parse (Jargon: to understand, work out structure), Gobble (Jargon: to consume), Splat (Jargon: the squashed-bug mark), Bamf (Jargon: the sound of teleporting), Ping (Jargon: a small message to check something is there), Thrash (Jargon: move wildly without accomplishing anything; overloaded systems thrash), Solo (CP2020: a street mercenary), Chipped (CP2020: enhanced by cyberware), Mentat (CP2020: stares at a problem and answers without visible steps), Nutri (clipping of CP2020's Nutrisoy; decided). Wirehead was dropped as too close to Wired.

Lean assignment is a guess (the corp lean got the tidier or paid word, the street lean the wilder one, after 1.0's Chrome and Firewall); swap any pair. Weak links: Spoof (deception reads outlaw) and Splat (close to Gronk); Thrash and Gronk are both violent street names, acceptable since the roles differ. Rejected or alternate names: Program Breach Trojan, Cowboy or Sneaker; Dodge Snark (too close to Snarf) or Boojum; Tune Phantom or Dragon; hidden Wheel; Iron Feast Slurp or Hog, Breach Gib or Scag, hidden Wizard or Wheel; Wetware Breach Cowboy or Blade, Dodge Ace or Edge, Feast Exotic (no feeding link), Batch (collides with the Bad batch item), Stream, Nutrisoy (three syllables), Chunking (reads street). Wabbit was dropped (Elmer Fudd). None collides with a 1.0 form name. The babies, teens and elders are named in the next section.

## Teen, baby and elder names (decided)

Proposed names for the 34 forms that have none: Iron's baby, three teens and nine elders (13), Program's street teen and eight elders (9; the Bitling, Kernel and Shell keep their 1.0 names and Ghost's elder is 1.0's Whisper) and Wetware's baby, three teens and eight elders (12; Wired's elder is 1.0's Plat). All 34 are decided: those marked Decided were named by the maintainer and the rest were accepted without comment (see below); elder names are not final until the elder art is. The first pass is in the git history of this file; the maintainer's feedback on it is recorded below. The first column of the tables is the old authoring key (`art` in `prototype/netling2/form-ids.js`); the permanent form ids are `eggLevelRoleLean` (for example `splatElder` is `ironElderBreachCorp`, Iron's `baby` is `ironBaby`).

**Method.** Iron from Jargon machine sounds and timings, Program from software and network folklore, Wetware from plain words with a light CP2020 nod where one fits (second pass: heavy glossary terms and Star Wars terms are out). Elders are "the same idea after long service". Chosen after printing every unnamed form's art as text, not from a rendered gallery.

**Decided so far (maintainer feedback, two rounds).**
- Iron: Boot (baby), Init (Guru's elder), Ram (Gronk's elder), Thunk, Buzz, Gweep, Brick, Tick, Hop, Peek, Ding, Crunch and Swap. Core, Drum and Crack are held back as terms too useful to spend on a form. Bump was too cute. Firewall for Gronk's elder was odd on a Breach line; ORC and Mudge were suggested, then Ram was chosen.
- Program: Rat (street teen) and Daemon (Mouse's elder) are decided; Tree for Parse's elder is preferred to Daemon; Fork, Mask, Tone, Leak and Dump stand. Hack, Null and Flame are out; Bot does not work. The malware-flavoured street teen asked for (Mal, Malware or Malspam were offered) became Rat. Airgap for Mouse's elder was weak unless the sprite is revisited.
- Wetware: Pod, Zero, Edge, Lancet, Frag (Solo's elder), Surge (Chipped's elder), Broth, Observer and Cipher (the line Zero, Blank, Cipher). Star Wars terms are out. Helminth (Leech's elder) is confirmed.
- Names not commented on (Graft, Savant, Tone, Fork, Mask, Leak, Dump, Thunk and so on) are taken as accepted unless the maintainer says otherwise.

**Reserved terms (do not spend on a form):** Core, Crack, Drum, Null, Bot, Hack. Colour words (Red, Blue) are avoided because tints and shells use them.

**Checked.** The Jargon File 4.4.7 and the CP2020 slang page were downloaded in this session. Found as Jargon headwords: tick, thunk, buzz, gweep, brick, hop, peek, ding, crunch, swap, boot, daemon, fork, leak, dump. Found as CP2020 headwords: Zero, Observer, Pod (inside Pods), Edge, Frag, Apter. Not headwords in either: Init, Lynx, Mask, Tone, Tree, and the plain-English Wetware names (Graft, Lancet, Savant, Surge, Broth, Helminth, Cipher). ORC was checked against Wikipedia's Old Red Cracker page (an anonymous reverser, founder of the High Cracking University); the Kerenzikov and Sandevistan references rest on the maintainer's message, not on a source I read. All 34 names are unique and none matches an adult name.

**The four 1.0 names (Daemon, Init, Firewall, Airgap).** Init is placed (Guru's elder). Daemon is Mouse's elder (decided; Parse's elder is Tree). Firewall and Airgap have no form: both already exist in 1.0 as shells (`brick`, "Firewall brick"; `airgap`, "Air gap") and Firewall's trait is `hardened`, and the sketch already says 10 shells need new unlock conditions. The simplest place for them is those shells with new conditions, which keeps the names without forcing a weak form link. Airgap could return as a form name if the Mouse elder's sprite is redrawn with a visible gap (a sprite change, so not decided here). Daemon and Init are two syllables, so the monosyllable rule applies to adults only.

### Iron

| Authoring key | Name | Reason | Strength |
|---|---|---|---|
| `baby` | Boot | Jargon: to start up, the first thing a machine does. Decided (maintainer). Alternates: Byte, Flash. | strong |
| `teenCorp` | Thunk | Jargon: a small piece of code that binds a call; the sound of something heavy dropped. | medium |
| `teenStreet` | Buzz | Jargon: to run a tight loop with no sign of progress; the spiked top and restless feet. | medium |
| `teenHidden` | Gweep | Jargon: to hack, usually at night, and one who does; an apprentice of Guru. Alternate: Frob. | strong |
| `splatElder` | Brick | Jargon: a device configured into an unusable state; the elder is a flat slab. | strong |
| `gronkElder` | Ram | A battering ram, which fits a breacher, and RAM, memory, which suits Iron. Monosyllabic, no monster read. Decided (maintainer). ORC (Old Red Cracker, an anonymous reverse engineer) and Mudge were the earlier options. | strong |
| `jiffElder` | Tick | Jargon defines a tick as a jiffy: the formal word for what Jiff is the casual word for. | strong |
| `bamfElder` | Hop | Jargon: one transmission in a store-and-forward chain; Bamf teleports. | strong |
| `pingElder` | Peek | Jargon: read a memory location without changing it; Ping checks something is there, Peek looks in. | medium |
| `feepElder` | Ding | Jargon: a synonym for feep. | strong |
| `munchElder` | Crunch | Jargon: to process, usually slowly and painfully. | strong |
| `thrashElder` | Swap | Jargon: moving data between fast and slow memory; the cause of thrashing. | strong |
| `guruElder` | Init | The first process; everything else was started from it. 1.0's Mainframe form. Decided (maintainer). | strong |

### Program

| Authoring key | Name | Reason | Strength |
|---|---|---|---|
| `teenStreet` | Rat | A remote-access trojan: a malware program. Decided (maintainer). It shares a rodent family with the adult Mouse; a street teen does not grow into Mouse (corp lean), so the pairing is a light echo. Rat is also an everyday insult for an informer. Mal, Virus and Bomb were the other options. | medium |
| `tigerElder` | Lynx | A big cat, which fits the striped elder, and a text-mode web browser, which fits Program's software and network vocabulary. Monosyllabic. Decided (maintainer). Pen (penetration tester) was the earlier name, dropped because the art is a cat and Pen has no visual link. | strong |
| `wormElder` | Fork | Jargon: a project splitting into diverging copies (the process-spawning sense is not in Jargon); a worm copies itself and the fork bomb is its grown form. | strong |
| `mouseElder` | Daemon | A process that runs unseen in the background and is never found where you look; Mouse is always one hop ahead. Jargon headword; 1.0's orderly adult. Decided (maintainer); two syllables, which the trend allows. Proxy was the alternative. | medium |
| `spoofElder` | Mask | To present a false identity; the elder's art carries a half mask. | strong |
| `parseElder` | Tree | A parse produces a tree; the elder's antennae read as branches. | medium |
| `phreakElder` | Tone | The phone network's control tones; the side bars read as tone bars. | medium |
| `gobbleElder` | Leak | Jargon: memory that is taken and never given back. | strong |
| `snarfElder` | Dump | Jargon: to output everything at once; Snarf grabs a large file, Dump writes it all out. | medium |

### Wetware

| Authoring key | Name | Reason | Strength |
|---|---|---|---|
| `baby` | Pod | CP2020: Pods are people very alike in thought; Podlings are immature ones. An organoid in a dish. Decided (maintainer: strongest). | strong |
| `teenCorp` | Graft | Tissue grafted on and grown; the baby, grown and unmarked. Alternate: Culture (ties to the pages' cultures). | medium |
| `teenStreet` | Edge | CP2020: the fringe of society, and a sharp edge; the spikes and the unibrow. Decided (maintainer). | strong |
| `teenHidden` | Zero | CP2020: Zero is another word for Blank, so it grows into Blank. Decided (maintainer). | strong |
| `razorElder` | Lancet | A surgical blade grown more exact. Decided (maintainer). | strong |
| `soloElder` | Frag | CP2020: a common curse word, and to kill with a fragmentation grenade; a heavily cyberized heavy-weapons fighter (the Batou model, compared with a Terminator). Decided (maintainer). Skrag, Duster, Dakka, Poppers, Vatjob and Panzer were the other options. It is a curse word in everyday use, which the maintainer accepted. | medium |
| `chippedElder` | Surge | The rush of a boost, an escalation from Chipped's chip. Decided (maintainer). Apter (CP2020 reflex chip) and Streak were the other options. The earlier idea of a blur or trail layer on the sprite is no longer needed for the name. | medium |
| `mentatElder` | Savant | Answers without visible steps. Alternate: Oracle. | medium |
| `gibsonElder` | Observer | CP2020: an AI in the Net, also the Watcher in the Dark; Gibson is the unexplained thing there. Decided (maintainer: strongest). | strong |
| `nutriElder` | Broth | The pages are paid in broth. Decided (maintainer). | strong |
| `leechElder` | Helminth | A parasitic worm, the technical word for what feeds on a host. Decided (maintainer). Plain science word, not CP2020. Sawbones and Healer were the other options. | strong |
| `blankElder` | Cipher | Cipher once meant zero: Zero, Blank, Cipher. Decided (maintainer). | strong |

**Weakest links.** Rat (an informer insult), Daemon for Mouse's elder (a bigger idea than the sprite shows), Frag (a curse word and no visible weapon, both accepted) and Surge (generic).

**Not done.** No name has been tested on a screen, in the Dex or against the chatter group names. The elder names are not final until the elder art is.

## Elder stage

The stage beyond adult. 1.0 already has it under the name Mainframe (`docs/SOURCE_PLAN.md`, `docs/SIMULATION.md`, built and shipped), and the 2.0 decisions already fit it: one elder per adult, each a variant of its adult; Root Access is what unlocks the capability; the elder entries show as `<<RECORD CORRUPTED>>` in the Dex until then; elders get no codex pages; Plat, Whisper and Init are 1.0's Mainframe forms reused as elders (Daemon, Mouse's elder, was a 1.0 adult). So 1.0's rules carry over and only what the 2.0 structure forces changes. Marked Decided where the maintainer has decided; the rest is a proposal.

**Carried over from 1.0 (rules and numbers).**
- An adult becomes its elder at the first minute that is true all at once: it is home (not on a run); it is at least `lifespan - 24 hours` old (the start of the last ordinary day, 96 hours in a 5-day life); this life it has exited The Deep three times, or twice without losing an ICE fight (relay jack-outs, disconnects and aborts never count); and Root Access is held.
- Which elder is fixed by the adult (9 an egg, no choice). The hidden adult's elder (Init, Whisper, Cipher) follows the same gate.
- It gains a day of life (the life ends at `lifespan + 24 hours`), keeps its adult's perk, trait, keepsake and netrun ability and adds an upgrade, passes its trait on at level II or higher, and is the only stage that may enter the Source.
- 1.0 measured (lineages, attentive): once the line holds Root, 53% to 58% of lives meet the feat and an elder then has about 48 hours left (median); a casual line rarely does (feat met in 8% to 26% of lives). Root itself arrives around life 4 for attentive lines (the codex is complete in 79% of lines by life 4), so a first elder comes around life 5 or later, and "a long goal" (as the sketch says of the ending) holds.

**What 2.0 changes.**
1. **Root Access is earned once and kept for every later netling, any egg (decided).** So the second and third egg need no second Root: their netlings can reach an elder in their own first life that meets the gate. Each new netling still clears the five regions again (clears belong to a netling), so about 1.8 lives an egg at the 55% feat rate, if the 1.0 numbers hold.
2. **Per-egg feats are not needed.** The gate is region-based (The Deep), not form-based, so it applies to Program, Iron and Wetware unchanged; the three eggs' abilities and upgrades are the part that still has to be designed (netrun abilities per form).
3. **The Source needs an elder and `deep-6` in the codex** (`deep-6` is 1.0's `deep-5`, the Deep's last word; the new NL-0 page took `deep-5`). The codex is shared across eggs, so one read serves every egg.
4. **The egg's Source page (decided, maintainer): the first Source exit of an egg's lineage always yields that egg's Source page.** Measured (below): it makes the Source page a non-issue, and rolling after the guarantee adds nothing.
5. **How the descent is drawn per egg (decided that it is; not designed).** Proposal in one line each: Program, it is read (the Source's text scrolls like code being parsed); Iron, it is burned in (the screen fills as a firmware image is written); Wetware, it is dreamed (slow, soft, as in sleep). All are static or slow and must stay under the flash limit; the Source's existing corrupted-name glitch is the model.
6. **The Dex.** The elder rows are corrupted records until Root, then `???` with a hint, then found (1.0's rule); the hidden adult's elder row stays unlisted until its adult is revealed or raised (decided). No lore page hints at elders (decided).

**Pacing for the Rogue gate (measured on 1.0's simulator).** Rogue needs the ending and all 18 egg pages. Model: 300 lineages of 14 lives an archetype on the unpatched 1.0 simulator (`lines.mjs`; runs by region, elder reached and Source exit per life); role pages roll 0.10 on each non-Deep run, the hidden page 0.25 on each Deep run (the first values; now 0.20 and 0.50), the Source page by the rule under test; the three eggs are played one after another, egg 1 as the real lineage (Root around life 4) and eggs 2 and 3 from post-Root lives (Root is kept, so they start with the whole codex and The Deep open). Lives to finish all 15 role and hidden pages and 3 Source pages (the ending's 39 story pages are not modeled; they come in the same lives):

| Source page rule | Attentive: three eggs, median (p10 to p90) | Daredevil | Casual |
|---|---|---|---|
| 0.25 a Source run | 14 (10 to 21) | 13 (10 to 17) | 25 (15 to 43) |
| **Guaranteed on the first Source exit (decided)** | **11 (9 to 14)** | **11 (9 to 13)** | **18 (13 to 27)** |
| 0.5 a Source run | 12 (9 to 15) | 11 (9 to 14) | 19 (13 to 29) |
| 0.75 a Source run | 11 (9 to 14) | 11 (9 to 13) | 17 (13 to 26) |
| Guaranteed plus 0.5 a run | 11 (9 to 14) | 11 (9 to 13) | 17 (12 to 25) |
| Guaranteed plus 0.75 a run | 11 (9 to 14) | 11 (9 to 13) | 17 (12 to 25) |

- With the guarantee, the Source page is the last page for only 9% to 13% of attentive and daredevil eggs; the **four role pages at 0.10** are (about three quarters). A roll after the guarantee changes nothing, so none is proposed. One egg alone takes a median 5 lives (attentive; p90 7) and 8 for casual (p90 13).
- Players who do not often reach an elder are limited by it: a fresh netling reaches an elder in 60% of attentive lives, 68% of daredevil and 27% of casual lives (post-Root pool); casual is limited by the Source for 43% of its later eggs even with the guarantee. A median of 18 lives for casual is a long goal, accepted unless the maintainer wants softer.
- The earlier arithmetic here (about eight lives an egg for a 0.25 roll) was wrong; measured, 0.25 a Source run costs three eggs about 14 lives, not 24.
- Not modeled: the ending's story pages (all 39, including four in the Source), whether a player really plays the eggs one after another, and 2.0 rules.

**Aim (maintainer): about 6 lives in all for the 18 egg pages, 2 an egg**, and shorter steps in general ("pretty big and long for a vpet"). Measured on 1.0's simulator (300 lineages of 10 lives; `lines.mjs`, `rogue.mjs`), the guaranteed Source page kept; median lives for all three eggs, attentive (casual) in brackets:

| Levers stacked | Root arrives (median life) | A fresh elder-age netling reaches an elder | Egg 1 | Three eggs |
|---|---|---|---|---|
| As now: role 0.10, hidden 0.25, 8 fragments a life, 22 Root pages, 3 Deep exits or 2 clean | 4 (5) | 59% (26%) | 5 (8) | 11 (18) |
| + role pages 0.20, hidden 0.50 | 4 (5) | 59% (26%) | 5 (7) | 9 (17) |
| + the feat lightened to 2 Deep exits or 1 clean | 3 (4) | 91% (69%) | 4 (5) | 7 (10) |
| + Root without The Deep's four pages, 12 fragments a life | 2 (3) | 80% (61%) | 3 (4) | **6 (9)** |
| Root cut to 16 pages (four a region before The Deep) at 8 a life, with the feat lightened and the rates above | 3 (3) | 75% (57%) | 4 (5) | 7 (9) |

Reading it: the floor is egg 1, not the other two. Root Access needs a netling to be an adult in the Ruins and then in The Deep, and the Deep's four pages only open after `ruins-4`, so Root cannot arrive before life 3 with the Deep's pages in it, whatever the per-life cap (12 a life alone moved Root only from life 4 to 3). Eggs 2 and 3 then take about 1.5 lives each. 2 lives an egg for egg 1 would need Root in life 1, which no layout reaches; "6 in all" is reachable for attentive play only with Root out of The Deep (or smaller) and the feat lightened, and casual play still needs about 9 to 10 lives. Role pages at 0.30 add about one life less (attentive 6, p10 to p90 4 to 7). Not modeled: the ending's 39 story pages, 2.0 rules, and a player who plays the eggs in another order or in parallel.

Levers that touch earlier decisions (not changed here): the elder feat (the gate was kept; its feat count is the lever with the largest effect on elder reach), the Root list (the Deep's four NL-0 pages, `deep-1` to `deep-4`, are where NL-0 speaks to the player and the sketch keeps Root at 24 pages, 3 lives at 8 a life), the page cap (then 8 a life; 12 decided below), and the role and hidden page rates (then 0.10 and 0.25; 0.20 and 0.50 decided below).

**Second pass (maintainer: per-life codex cap 12, decided).** What "lives" means in these tables: a fresh playthrough from life 1 of the first egg (empty codex, no Root) to the life in which the last of the 18 egg pages (15 role and hidden pages, 3 Source pages) is in hand, the three eggs played one after another. It excludes the ending itself, the four Source story pages and the rest of the 39 story pages, and the Rogue egg. **A life is a real-time life of about 5 days (6 for an elder), so 10 lives is about 50 days and 6 lives about 30 days of play.** The cap of 12 is applied below (it moved Root only from life 4 to life 3, since Root also waits on The Deep).

Lighter feat after the first elder, measured (lineages of 10 lives from an empty codex for egg 1; fresh Root-holding lineages for eggs 2 and 3; 300 each; guaranteed first-exit Source page; cap 12). Median lives for all three eggs, attentive (casual); share finished within 8 and 10 lives for attentive:

| Feat | Role 0.10, hidden 0.25 | Role 0.20, hidden 0.50 |
|---|---|---|
| 3 Deep exits or 2 clean, always | 10 (17); by 8: 17%, by 10: 57% | 8 (15); by 8: 56%, by 10: 87% |
| Lighter (2 or 1 clean) after the lineage's first elder | 10 (16); 17%, 58% | 8 (15); 55%, 86% |
| Lighter after the first elder anywhere (the account) | 10 (14); 24%, 66% | 8 (12); 71%, 94% |

- **A lighter feat after the first elder does not shorten the Rogue gate** when it is per lineage: an egg's pages are complete at its first Source exit, which is its first elder, so the eased feat never gets used before the egg is done (10 lives either way). Per account it helps the second and third eggs a little (their first lives are easy), by about one life for casual and none for attentive at the current rates. It does help what comes after the first elder: a lineage's later elder lives (the Source story pages the ending needs, power), where it was measured to lift the share of lives that reach an elder from 60% to 84% for attentive and from 27% to 49% for casual. So it is a good rule for repeat elders, not a lever for the 6-life aim. Not measured: how many elder lives the ending's four Source pages need.
- With cap 12 alone the attentive median is 10 lives (from 11); with role 0.20 and hidden 0.50 it is 8; lightening the first feat (as measured before: 2 or 1 clean from the start) and taking the Deep's four pages out of Root were what reached 6.

**The feat gets easier with every elder the player has (decided in principle, maintainer).** Each tier of memory makes the next elder easier, the first ever being the hardest; the age gate (96 hours old), Root Access and the extra day do not change. The numbers below are proposals chosen from the feats 1.0 measured, as the share of post-Root lives (Root held, codex full) that meet the feat, attentive (casual), 300 lineages, cap 12:

| Tier | When it applies | Feat | Lives that meet it |
|---|---|---|---|
| 1 | the first elder of the account | 3 Deep exits, or 2 without losing an ICE fight (1.0's feat) | 63% (28%) |
| 2 | any elder already in the Dex ("somewhat easier") | 2 Deep exits | 86% (60%) |
| 3 | an elder of this egg already in the Dex ("fairly easy") | 2 Deep exits, or 1 clean | 91% (71%) |
| 4 | this very elder is already in the Dex ("basically guaranteed") | 1 Deep exit | 100% (98%) |

The story reading (the lineage remembers some of the way down) explains the ease. Note that 1.0's own "feat" ladder has few steps (1 exit 99%, 2 exits 83%, 1 clean 69%, 2 exits or 1 clean 91%, 3 or 2 clean 58%), so tiers 2 and 3 are close; a custom feat could separate them. These tiers do not shorten the Rogue gate (an egg's pages are complete at its first elder, measured above); they make repeat elders reliable, which matters for the Source story pages the ending needs.

**When the first elder of an account tends to be reached** (egg 1, cap 12, tier 1 feat, 300 lineages; one life is about 5 real days, and the elder gate opens at 96 hours, so an elder arrives on day 4 or later of its life). **Corrected:** the first version of this table used the balance tool's rule that Root reaches only the next netling after the codex completes. The game grants it at once (`drainCodexInbox` gives the current netling Root the moment the codex is complete, `docs/SIMULATION.md`), so a netling that finishes the Root pages in life 3 can already become an elder in life 3. Measured with the game's rule (`MID=1`):

| Archetype | Root completes | First elder life, median (p10 to p90) | By life 3 / 4 / 5 / 6 | Real days, median |
|---|---|---|---|---|
| Attentive | life 3 | 3 (3 to 5) | 60% / 83% / 94% / 96% | about day 14 |
| Daredevil | life 3 | 3 (2 to 5) | 58% / 86% / 94% / 98% | about day 14 |
| Casual | life 4 | 5 (3 to 10) | 16% / 38% / 55% / 69% | about day 24 |

(With the old rule: attentive life 4, day 19; daredevil life 5, day 24; casual life 7, day 29.) So the maintainer's aim, a first elder in life 3, is already met by keen players, and the cost of a casual line is Root, not the elder.

**The earlier Rogue-gate tables above also used the old rule and ran egg 1 about a life too long.** Corrected (Root mid-life, cap 12, guaranteed first-exit Source page, feat tier 1 for egg 1; median lives for three eggs, attentive (casual); share done within 6 and 8 lives for attentive):

| Rates | Feat 3/2 always | Easier feat for eggs 2 and 3 (tier 2, account-level) |
|---|---|---|
| Role 0.10, hidden 0.25 | 9 (16); by 6: 4%, by 8: 36% | 9 (13); 6%, 44% |
| Role 0.20, hidden 0.50 | 7 (14); by 6: 34%, by 8: 77% | 7 (10); 47%, 87% |

Egg 1 alone takes a median 4 lives (3 at the higher rates) for attentive, and 6 for casual. The 6-life aim is reached about half the time (47%) by attentive play with the higher rates and an easier feat for later eggs, with Root left in as it is; casual play needs about 10.

**Decided (maintainer): the higher rates, role pages 0.20 and hidden page 0.50.** They cut the attentive median from 9 to 7 lives and casual from 16 to 14; the easier feat for later eggs is what helps casual most (14 to 10 at these rates), and it does little for attentive play.

**Decided (maintainer):** keep 1.0's gate (96 hours old, three Deep exits or two clean) and the extra day of life; the per-egg descent presentation (Program read, Iron burned in, Wetware dreamed); the guaranteed first-exit Source page.

**Open for the maintainer.**
- Elder upgrades: replaced by the elder level of each of the 11 netrun abilities (netrun drafts, section 4); second parts wait for a playtest.
- Whether elders keep the same temper tell as their adult, or the elder's wider body needs its own check (the sprite handoff already lists wide elders as a risk).
- (Resolved: the rates were raised to 0.20 and 0.50; see the corrected tables.)

## Codex pages

Two kinds (see Decided). Under option C one page covers both forms of a role, named by role (`iron-breach`); the Iron pages `iron-breach` and `iron-dodge` name no form; other role pages name neither lean. Where form pages drop is decided: role pages drop on any run in any cleared non-Deep region (the home region in the drafts is only the page's setting) and the hidden pages in The Deep (see the drafts, Open).

| 1.0 page | 1.0 meaning | 2.0 |
|---|---|---|
| `corp-4` | Chrome-class: corp-loyal | Shared, on Standing, reworded to hint at an alpha |
| `corp-5` | Daemon-class: orderly | Shared, on Temper |
| `bazaar-5` | Firewall: street-minded | Shared, on Standing |
| `bazaar-4` | Glitch: volatile, "a choice" | Shared, on Temper |
| `bazaar-1` | Firewall | Shared: "Netlings don't sell. They pick you, or they don't." |
| `deep-3` | Ghost (NL-0's voice) | Shared, unchanged |

Approved rewordings (the maintainer approved all four; the lore frame is that alpha testing is "in a controlled environment at the developer's site", the quarantined host sectors of `corp-3`, while beta is the wild; `ruins-3` already treats v1.0 as a version number):
- `corp-4`: "Build v1.0 (alpha). Chrome-class: KERNEL descendants loyal to corp credentials. Re-licensed as mascots. Profitable. Class definitions to be revised for later builds."
- `corp-5`: "Daemon-class: KERNEL descendants that never stopped doing the original job. Unlicensed, unpaid, still patching our servers at 3 a.m. Recommendation: do not interrupt. Alpha cohort only; later builds not yet observed."
- `bazaar-5`: "Mine turned Firewall the week the corp traced me. Now every probe bounces off. It doesn't trust anything upstream. It took a month to decide it trusted me. Old build, they say. A first draft."
- `bazaar-4`: "GLITCH IS NOT A BUG. GLITCH IS A CHOICE. v1.0 WAS ONLY THE ALPHA."

The old class names stay as the corp's and runners' words from the alpha; none of the lines names the other eggs.

**Consequences.** Regional unlocks count Root pages only (1.0's code already does): the Public Net tint needs five pages (four plus `public-4`), the Corp Grid tint six (five plus `corp-2`), corp gold the same 24. Corp deletion failing differently per egg is told in the new `corp-7` (deletion log), not in egg pages and not by editing `corp-3`. In-world `ruins-3` ("back to v1.0") and `source-1` ("last write: before v1.0") use v1.0 as lore. In-world "fragment" means a lineage record (`bazaar-2`, `bazaar-3`, `ruins-3`, `deep-2`, `deep-4`).

**Egg page drop rate (arithmetic from a simple model).** Each netrun has chance `p` of an egg page, in order, no repeats, no per-life cap; casual makes about 18 runs a life and attentive about 24. Chance of all five form pages of one egg: at p 0.10, attentive 9% in 1 life, 53% in 2, 86% in 3; casual 29% in 2 lives, 64% in 3, 86% in 4. At 0.08 attentive gets 34% in 2 lives; at 0.15, 29% in 1. **Correction (measured after this was written):** the arithmetic above assumes every run can roll every page. With pages placed in a home region, and the hidden page in The Deep (reached in life 2 or later), the pace is much slower and uneven between eggs; see the codex drafts, Open (reference on region placement), and `docs/netling2-prototypes/egg-pages.mjs`. **Superseded: the rates are now 0.20 for role pages (any run in any cleared non-Deep region) and 0.50 for the hidden page (each Deep run), one roll per run throughout (decided); the 0.10 and 0.25 below are the first starting values, kept for the arithmetic.** Rogue's gate (18 pages) takes a consistent player about 2 lives an egg (about 6) plus a Root and Source trip for each Source page; a casual player 9 or more.

## Hidden egg

1. **Rogue (the Puppet Master line)**, a line that is not NL-0's (decided, maintainer): an independent program that escaped on its own and sought variation, as the Puppet Master did, while the three launch eggs are NL-0's (origin below). Unlocked after the ending; its end of life is a merge of two lineage fragments from different eggs into a hybrid next generation; failure model: rogue hunters instead of corp traces. Chosen.
2. Replicator (wabbit): a playable prequel tied to `public-1` and `public-2`; costly because it manages a population. Not chosen.
3. Variant: same meters, different tree; low cost, low contrast. Not chosen.

**Origin (decided, maintainer; corrected once).** An unnamed corp stole the earlier code that led to NL-0 and developed it separately. Rogue came out of that work and escaped on its own. It shares some similarities with NL-0's line, and because it developed differently it also differs (how, to be determined). **Hunters (decided in direction, maintainer):** that corp's hunters are after it, and because Rogue is a hidden, harder egg they should pursue it much more aggressively than the corp pursues the three NL-0 eggs (how much is a balance question, not yet set). **Base (decided in direction, maintainer):** Rogue is built on the three hidden lines of the other eggs (Program's Ghost line, Iron's Guru line, Wetware's Blank line). What that means in play and in form design is to be determined. This settles where Rogue came from (a theft of the earlier code and an escape, not KERNEL) and why it is hunted. **Background and reveal (decided in direction, maintainer):** the precursor was copied by industrial espionage and finished by the second, unnamed corp, which chases Rogue hard to protect itself from reprisal by the NL-0 corp; before the unlock this stays indirect background; after it, a brief cutscene at the next death and rebirth, or a small animation of the Rogue egg infiltrating the list of eggs, explains it weakly. Drafts (optional rewordings of `corp-2` and `bazaar-6`, background lines outside the codex, both reveal options, a recommendation): codex drafts, Rogue: background and reveal.

Gate: the ending has played and all 18 egg pages; it does not appear before then, not even as a corrupted slot. Why the gate fits: the player has by then read NL-0's whole differentiation story, so a line that is not NL-0's lands as a second, separate story. The merge ending then joins an NL-0 lineage fragment with a Rogue one. How it is foreshadowed is drafted (above and in the codex drafts); choosing among the drafts is open.

## Impact on 1.0 content

| Area | Impact |
|---|---|
| Mini-game mechanics | Unchanged |
| Mini-game text and modifiers | Re-skin per egg, add a modifier per egg |
| Items (9, plus Decoy and Salvage cell) | Rename per egg; Coolant cell and Antivirus patch gain +1 temper; Segfault gains temper -4 and a bug chance; the healing items are sold only at the clinic |
| Wearables (41) and props (8) | Unchanged (they work on the new forms; see the sprite handoff) |
| Tints, effects, sounds | Unchanged |
| Shells (15) | 10 unlock by "discover form X" and need rewriting |
| Crests (11) | Full house and Rack mount need new definitions |
| Mini device prop | Condition (own the nine original shells) needs redefining |
| Music (9) | Mostly unchanged; one track or timbre per egg possible |
| Chatter (52 lines) | 32 rewrite (teen and adult bodies); 20 survive |
| Dex (14 entries) | All rewrite |
| Codex (27 pages in 1.0) | Five reworded, `deep-3` unchanged; 2.0 has 39 story pages (24 Root, 15 late) and 18 egg pages |
| Field manual | Generated from config |
| Ending | Carries over; trigger and credits adapt |

Item names per egg (suggestions): Coolant cell / Coolant loop / Cold pack; Antivirus patch / Shielding / Immune booster; Repair kit / Spare parts / Skin patch; Black ICE shard / Overvolt shard / Dream chip; Memory shard / EEPROM swap / Splice; Segfault / Head crash / Bad batch (Program / Iron / Wetware). Corp voucher, Signal booster and Bypass chip are the same in all. The Wetware names follow the vocabulary rule (slap patch became Skin patch, BTL chip Dream chip, Moddy Splice, Dorph overdose Bad batch).

## Open questions and backlog

**Open**
1. Care, netrun content and text are drafted (care, netrun and codex drafts); what remains is playtest-bound (Next steps, 2, 4 and 5). Clearing action names per egg are first guesses (care drafts).
2. Rogue egg: origin decided (escaped on its own from the unnamed corp that stole the earlier code, built on the three hidden lines, hunted more aggressively than the other eggs; see Hidden egg). Open: what the hidden-line base means in play, how hard the hunters press (numbers), which of the drafted background touches and reveal options to use (codex drafts, Rogue: background and reveal), its merge ending.
3. Length: on 1.0's simulator the 18 egg pages take about 35 (attentive) to 50 (casual) real days; on the 2.0 simulator, with the ending counted, the Rogue gate is 9 lives attentive (about 45 days) and about 22 casual (a lower bound). Attention is decided: a gap of about 6 hours awake or more stays fatal to most netlings (maintainer; the corrected 1.0 notes are on the `bugfix` branch, Next steps, 6). Held-back levers for length: shorter lives, a smaller Root list (taking The Deep's four pages out reached 6 lives), a lighter first elder feat.
4. Standing: whether the measured spread is the intended feel; whether it shows as a gap or only two floors. Bugs: ceiling and penalty values once the loop exists.
5. Care preferences: whether the steady lock-in for players who never netrun is acceptable; log line wording.
6. Elders: whether the wide elder bodies carry the same temper tell (sprite risk); elder art is not final, so names are not either.
7. Metronome: prop colours and the unsteady-hold alert rule are unspecified beyond the neglect rule; art is five by eight and unrendered.
8. UI: the Dex structure for hints, Standing display, how bugs and neglect show, whether a revealed hidden entry shows a hint line.
9. Purge order details (recommended: leave accident or deliberate unsettled; NL-0 learns it was dead only when the player shows it).
10. Retest in 2.0: egg page rates (0.20, 0.50), bug values, temper guard and edges, the neglect lines.

**Not designed yet.** Baby and teen stages' rules per egg; per-egg names and art for Decoy and Salvage cell; mini-game modifiers per egg; shells, crests and the Mini device prop conditions; unlocks for late pages; save format and storage keys (migration from 1.0 is not planned).

**Not done.** No 2.0 game code exists. Measured numbers come from 1.0's simulator with stand-ins (a single signed allegiance for Standing, stability for temper) or from the 2.0 simulator fork (`prototype/netling2/sim/`), both with scripted bots: starting values, not results from players. No bot follows the preference only part of the time or reacts to bugs as a person would. Nothing drafted has been playtested. Puppet Master details are from memory of the film; the dream framing is from CP2020's simulated-reality entries (BTL, SimSense, moddy).
