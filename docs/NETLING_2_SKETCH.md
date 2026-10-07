# Netling 2.0 sketch

Status: planning notes for a separate app, plus a sprite prototype for all three eggs in `prototype/netling2/` (not shipped; see [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md)). The rules, pages and the app are not implemented; all 66 sprites are drawn as first drafts. Items marked Decided come from the maintainer; everything else is a proposal. Companions: [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (all page text) and [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) (source vocabulary and unused ideas; reference only).

## Handoff

Written for an AI picking up the work. Sprite work has its own handoff: **[NETLING_2_SPRITES.md](NETLING_2_SPRITES.md)** (status, commands, rules, next phase). This file is the game design; the sections below are decisions, not tasks.

**State.**
- Separate app, built from the ground up; **no 2.0 app code exists**. Three launch eggs (Program, Iron, Wetware) plus a hidden Rogue egg, a layered form model (egg, temper, role, Standing), option C forms (two named forms per role, corp and street, plus a hidden form: 9 adults an egg), a story frame and a codex page model.
- Settled, with text or numbers: all codex page text (15 role and hidden form pages, 12 new story pages, 3 Source pages, 18 temper hints); late-page flag and Root Access arithmetic; evolution (Standing and mini-game roles are the levers, tie-break rules); hidden-path rules; bugs (faults feed bugs, bugs raise drain, cleared with scrip, Standing or a netrun anomaly); the temper scale, tells and care preferences; starting numbers for Standing, bugs, temper and the egg page drop rate (measured on scratch copies of 1.0's simulator, to retest in 2.0; see `docs/netling2-prototypes/README.md`).
- Sprites: all 66 forms (22 per egg) are drawn as first drafts in `prototype/netling2/`, with the temper tell, neglect and bug layers built but only checked in numbers (and Iron's unit tests). **Nothing has been judged on a device.**

**Next steps (the maintainer sets the order).**
1. **Sprite phase** (see the SPRITES handoff): the maintainer's gallery review of Program and Wetware; care (neglect) and bug effects enacted and checked on all sprites; a temper pass on every form (only part of Iron was used for feasibility); then names, accessories and smaller items.
2. Idle behavior and chatter tone for temper (the other two tell channels): shapes specified and tested in `prototype/netling2/voice.js` (see the drafts file, Temper hints); not rendered, not player-tested.
3. Per-egg meters and care buttons, then the elder stage rules and Source access.
4. Netrun content per egg (abilities, regions, events, tutorial run) and the debug station anomaly's options.
5. Review and edit all drafted text in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md); idle and chatter temper hints are flagged for revisiting.
6. Retest every starting number once 2.0 exists (including the tell's level edges and 0.5 guard, and the neglect lines).

**Document map.** This file: decisions, architecture, measured numbers, open questions. [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md): sprite handoff; [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md): its archive (drafts, rejected options, measurements). [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md): all page text and temper hints. [netling2-prototypes/README.md](netling2-prototypes/README.md): rule-prototype patch and drivers behind the figures. [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md): source vocabulary (Jargon, CP2020, FDA) and unused ideas; reference only.

**Verified and not.** `npm test` (500) and `npm run proto:test` (111) pass; the prototype pages load in headless Chromium; the 1.0 sprite audit ran on each egg. Not run: `npm run smoke`, any device or phone check, any balance run on 2.0 numbers. No page text has been playtested.

**Working agreements.** Avoid emojis and em dashes. Measure before claiming a number and say what a measurement does not cover (the 1.0 overlap score misled for palette marks and for grown elders). Say plainly what was not run or verified. Ask clarifying questions before ambiguous or non-trivial steps; when a form is contested, render options side by side first (the maintainer reviews from screenshots). Record each decision here as it is made, marked Decided or proposal. Keep in-game Wetware text to plain words (see The eggs). Do not open a pull request unless asked. **This branch is not under the 1.0 soft freeze** (maintainer): 1.0 code may change where asked, minimally, with tests, regenerating what depends on it (`node tools/wearable-colors.mjs --write` after palette or sprite changes), and saying so. The prototype lives only in `prototype/netling2/`. Work is on branch `claude/game-egg-differentiation-xkl6x2`.

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
- **Role:** which mini-game a form is built around (Breach, Dodge, Tune, Feast). Each egg has four role forms and one hidden form that masters all four.
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
- Hidden forms are hidden from the Dex (decided): the hidden-path teen and the hidden adult are not listed, not even as a `???` slot, until raised or revealed by a late page (`public-6` and `public-7`; see the drafts, Open item 9). Visible per egg: 1 baby, 2 teens, 8 adults (11); with the hidden teen and adult and nine elders, 22 forms.
- Option C: each of four roles (Breach, Dodge, Tune, Feast) has two named forms, corp-leaning and street-leaning, plus one hidden form that masters all four: 9 adults an egg, 27 in all. The role is a descriptor for the Dex and hints, not the name. Names are in Adult forms and names.
- Three teens an egg: corp-leaning, street-leaning, hidden-path. The two main teens may differ only slightly; the hidden path must be distinct in outline.
- One elder per adult, each a variant of its adult (18 columns against 16, up to 15 rows). Elders get no pages. Each egg has its own baby. Hidden forms may break the form rules. Frame and wearable rules are in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md).
- Names decided: Mouse (was Snark), Snarf (was Wabbit), Phreak (was Phantom), Jiff, Munch, Guru (not Wizard), Nutri. The non-hidden Iron and all Program names are monosyllabic. The other second-form names are proposals.

**Evolution, Standing, faults**
- Allegiance becomes Standing: two non-negative tracks (corp and street). Stability becomes Temper. Standing resets each life (what carries over: lineage trait, quirk, keepsake, Root Access, codex, dex).
- Levers: Standing and the mini-game roles. Faults feed temper; temper is personality and never chooses a form. Teens depend on Standing only, except the hidden path, which also needs the games played.
- Standing sources: packets 0.25; COMPLY, HIDE, an ignored trace, checkpoint and anomaly choices 1; market purchases 0.5; Corp voucher 1 (corp) and Black ICE shard 1 (street); plain care and mini-games add nothing. Display shows the floor of each track, labeled a rough estimate; decisions use the fractions.
- Tie breaks and the hidden-path conditions are below. Faults are hidden (not logged) and uncapped; 1.0's 10-fault death is removed.
- Neglect has a visible sprite effect: transient, from unmet care needs. Bugs are persistent glitches until cleared. Both together is intended (neglect leads to faults, faults roll bugs).

**Bugs**: 30% per fault, ceiling 5, each bug about +8% Charge and Sync drain, +10% Heat gain, +4% Integrity drain (smaller on purpose so recovery is possible; the ceiling is not ignorable). Cleared for 15 scrip, or 2 Standing in any split the player picks (a hidden way to retool direction), or by a netrun debug-station anomaly (one entry in the anomaly pool, only while the netling has bugs; its options and cost are undesigned). Segfault: +2 faults, 60% one bug, 15% two, 25% none, temper -4. A netling can be volatile with no bugs. Bugs do not carry across lives (proposal). Clearing action name: Program "defrag" or "bugfix"; the others undecided.

**Temper**: one hidden number, resets each life, 24-hour half-life, five levels at -6, -2, +3, +6. Shown through sprite motion, idle behavior and chatter tone together, with hints in the Dex (18 drafted). Somewhat mysterious, clearly different between bodies. Coolant cell and Antivirus patch add +1. Care preferences (hidden): see Care preferences.

**Story and codex**
- Lore: the corp's plan is the roadmap and v1.0 was its alpha. NL-0 is an offshoot that differentiated to escape the planned purge, loosely like the Puppet Master. It does not go down into the Source again because that might set off the order. The purge order can never run (wrong permissions, owner nobody), shown through pages. The 1.0 ending carries over (the player deletes the order with root access granted by NL-0). The ending does not show NL-0's differentiation; only pages do.
- The Source stays one place (option B with a touch of A): each egg finds one extra page there, and the descent is drawn in that egg's style. NL-0's differentiation is told in new pages in the Old Web Ruins (Iron) and the Darknet Bazaar (Wetware).
- Two page kinds. **Story pages** (shared by every egg): 24 Root pages (the original 22 plus the new `public-4` and `corp-2`) and 15 `late` pages (ten new, 1.0's `deep-5` now `deep-6`, four Source pages), 39 in all; 8 a life as in 1.0. Late pages drop only once the line holds Root, are required by the ending, are ignored by regional unlocks, and replace 1.0's `mainframe` flag. Ids match drop position, so some 1.0 ids move (mapping in the drafts file). **Egg pages**: 15 form pages (per egg: one per role covering both forms, plus one hidden-form page) and 3 Source pages, 18 in all. Egg pages are rare drops (0.10 per run), no per-life limit; Rogue's gate is all 18. Any member of an egg can find its pages.
- Root Access needs the shared story pages at minimum. Unlocks default to story pages.
- `corp-4`, `corp-5`, `bazaar-4`, `bazaar-5` become shared pages on Standing and Temper, reworded to hint that v1.0 was an alpha; `bazaar-1` is reworded to "Netlings don't sell. They pick you, or they don't."; `deep-3` is unchanged.
- Codex "fragments" are "pages" from here on; lineage records stay "fragments".
- **NL-0 is the precursor of the player's netlings in particular, not of every netling (decided).** Netlings exist fairly widely already (KERNEL built maintenance processes in quantity; other runners have netlings; visitors are others' netlings), and some are not NL-0's line, though they may be siblings. NL-0 is special and drives the plot; all three eggs are its line. This explains why only the player's line sees the corrupted records and the corrupted Source sector with no mention elsewhere: they are NL-0's, opened by the Root Access it grants. Checked against the 1.0 and 2.0 draft text, nothing needs rewriting: the asset registers say "KERNEL descendants", not NL-0's; `ruins-3` ("every netling version ever compiled, back to v1.0. Before v1.0 there is one entry: NL-0") reads as the product line; `deep-4` ("you took care of one of mine") now reads exactly; `deep-2` (every fragment comes home) is the player's line's fragments; the ending's "so many of us" is all the maintenance processes. In `bazaar-7` the forty others that "each remember no. 1" are NL-0's Wetware siblings. Not stating any count of netlings stays the rule. Option, not decided: the hidden Rogue egg could be a non-NL-0 line, an independent netling that escaped on its own, which this framing makes natural.

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (body) | One hidden axis, orderly to volatile, fed by faults and handling, shown by behavior and sprite tells; personality, not form | Stability axis and its pull on Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation of one netling, starts at zero each life | Allegiance axis, Chrome and Firewall |

High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, tracks within 1 point as balanced (the hidden path's condition; it replaces the Ghost's "neutral allegiance"). Proposals: roles map to the four games (Cracker, Evader, Seer, Scavenger); traits act on abstract drives (Upkeep, Exposure, Reward, Risk) that each egg maps to its own meters, so lineage and traits are shared.

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

**Tie breaks (decided).** Standing and wins are integers; decisions use the integers. For each choice (Standing lean, role): a gap of 0 or 1 is a tie; the lesser option's chance falls with the gap and is 0 at 5 or more; ties are random; a form never raised (per egg, in the dex) weighs about 20% more (1.0's `newFormWeight` 1.2), applied after the gap weights. Weights: 4 at gap 0 or 1, then 3, 2, 1, 0 at gaps 2, 3, 4, 5 or more. Two options: gap 0 or 1 is 50/50, gap 2 is 57/43, gap 3 is 67/33, gap 4 is 80/20, gap 5 or more is 100/0. Role and lean are rolled together; the unseen weight applies to the final form.

**Measured on 1.0's simulator** (1.0's signed allegiance stands in for Standing; 300 lives per archetype; drivers in `docs/netling2-prototypes/`):
- Players who steer are predictable early: steered Chrome or Firewall are certain (gap of 5 or more) at the teen check in 92% to 98% of lives; one-packet-type feeders in 27% to 45% at teen and 100% by adulthood. Casual, attentive and worker play stays a coin flip about a third to a half of the time (leader chance 53% to 68%). That is the intent: no stance, no guarantee. The middle (a player who commits a little) was not measured.
- Hidden path: the balance-seeking bot kept the gap at 1 or less in about 100% of lives; casual netlings by chance in 50% at teen and 27% at adulthood. So the Standing condition is easy if aimed at and common by accident; the games requirement makes the hidden path hard (in 1.0's baseline 1% of casual teens had 2 wins in every game; Shell asks 3).
- Track sizes: even a casual netling has about 10 on its higher track and 8 on its lower by adulthood (about 3.6 and 2.2 at the teen check), so a price of 2 is affordable from adulthood and cheap for a committed steerer (lead about 20) but meaningful for a casual one (gap about 2.5).
- Anchors (1.0 baseline): casual makes about 18 netruns, 4.6 faults, 15.9 wins by adulthood and 33.8 by end of life; attentive 24, 0.16 faults, 22.9 and 51.7.

**Neglect and bugs on the sprite** are in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md). Neglect is a reversible look from unmet needs on its own channel (marks, not motion), calmer under reduced motion, nothing flashing over three times a second. A neglect line sits at 1.0's alert lines (Charge or Sync under 20, Heat over 80) with earlier soft lines (40, 40, 65; Integrity 60 and 30 are placeholders).

### Bugs

Faults are not tracked; each fault has a chance of adding a bug. Bugs raise the four care drains and Heat gain, so flow is harder, which causes more faults (a loop). Heat still moves temper through the overclocked and flow states, so a buggy netling drifts volatile on its own.
- 1.0's Repair kit, Antivirus patch and Coolant cell do not clear bugs; clearing is new 2.0 content (see Decided). Scrip is the main route so a player can always fix bugs by earning scrip.
- **Measured** (patched scratch copy of 1.0's simulator; scenarios 1.0 as is, cap removed, bugs, bugs plus clearing at 15 scrip, a 50% chance, a ceiling of 8): no death spiral at the starting values (full-life rates within noise of the no-bug runs; 300 lives gives about 1.5 points of noise, so differences under 3 points mean nothing). The loop is mild: the worker, with least scrip, goes from 5.3 faults to 7.7 without clearing and 17% reach the ceiling; casual from 4.6 to 5.7. Clearing at 15 scrip works for players who run (casual clears about 1.1 bugs a life); a worker with about 19 scrip still ends with 1.3 bugs and 11% at the ceiling, so the Standing price and the anomaly matter most for players with little scrip. Stress (50% chance, ceiling 8, no clearing) costs the worker about 4.5 points of full-life rate. Removing the fault cap raises casual full-life from 92.7% to 95.7% (neglect deaths now run on); the neglectful archetype still dies of integrity collapse in essentially every life. Attentive and daredevil players get almost no bugs.
- **Not modeled:** bugs from netrun disconnects (1.27 a life for casual), Heat from actions, clearing by Standing or anomaly, how a player reacts to a glitching sprite, temper effects of bugs. The bots clear only at scheduled check-ins.
- **Clearing prices:** 15 scrip per bug (a Repair kit's price; a casual netling ends with about 63 scrip); 2 Standing per bug in any split (1 from each keeps the gap; 2 from the leader narrows it by 2, 2 from the other widens it by 2, the hidden retooling effect); the debug station is about 1 in 6 anomaly nodes while the netling has bugs. Anomaly nodes run about one a netrun (0.8 casual, 1.0 attentive), so the anomaly helps players who run and the Standing price helps those who do not. A balance seeker pays 1 from each track to keep within 1 point.
- Segfault compares with two plain faults at 30% each (51% for at least one bug, expected 0.6): 75% for at least one bug, expected 0.9.

### Temper

Temper is the personality channel. Effects: the three tells and mild care preferences. Preferences change care values and faults feed temper, so there is a loop to check with the balance tools. Perks (1.0's Daemon and Glitch had form perks) are open. The "temper variant" in a composed model is an animation and idle skin, not a sprite identity (see the sprite handoff).

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
- Not measured: the 2.0 sources as built, how often a player is in flow against overclocked, a flicker guard (hysteresis, 0.5 is a placeholder in the sprite prototype), preferences' effect, decay per minute against per check-in.

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
- Segfault loses its risk (it added 2 faults at a fatal cost); its design needs a look. Netrun disconnect faults lose their clamp and become a temper nudge.
- All numbers are from 1.0's simulator with stand-ins (see `netling2-prototypes/README.md`).

## The eggs

| Egg | Substrate | Failure model | Rhythm | Death register |
|---|---|---|---|---|
| Program | Software processes | Fault, error, failure; viruses | Interrupt-driven: timed events call you | Process ends: flatline, exit code |
| Iron | Firmware and infrastructure; read-only, cannot be patched | Drift and bit rot, corrected by calibration | Batch: queue work, collect it on return | Decommission: a last write that leaves a read-only record |
| Wetware | Grown tissue running software (CP2020's biosoft) | Rejection as it takes on more augmentation | Polling: needs visits at intervals | Waking: a dream ends and the next begins |

All share three care verbs from the FDA glossary: corrective, adaptive, perfective. Egg lore stays implied and arrives only through pages, chatter and accessories; the egg prompt shows terse labels with no explanation.

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

Lean assignment is a guess (the corp lean got the tidier or paid word, the street lean the wilder one, after 1.0's Chrome and Firewall); swap any pair. Weak links: Spoof (deception reads outlaw) and Splat (close to Gronk); Thrash and Gronk are both violent street names, acceptable since the roles differ. Rejected or alternate names: Program Breach Trojan, Cowboy or Sneaker; Dodge Snark (too close to Snarf) or Boojum; Tune Phantom or Dragon; hidden Wheel; Iron Feast Slurp or Hog, Breach Gib or Scag, hidden Wizard or Wheel; Wetware Breach Cowboy or Blade, Dodge Ace or Edge, Feast Exotic (no feeding link), Batch (collides with the Bad batch item), Stream, Nutrisoy (three syllables), Chunking (reads street). Wabbit was dropped (Elmer Fudd). None collides with a 1.0 form name. Not named: the elders and the teens.

## Teen, baby and elder names (proposals, second pass)

Proposed names for the 34 forms that have none: Iron's baby, three teens and nine elders (13), Program's street teen and eight elders (9; the Bitling, Kernel and Shell keep their 1.0 names and Ghost's elder is 1.0's Whisper) and Wetware's baby, three teens and eight elders (12; Wired's elder is 1.0's Plat). Marked Decided where the maintainer has said so; everything else is a proposal. The first pass is in the git history of this file; the maintainer's feedback on it is recorded below.

**Method.** Iron from Jargon machine sounds and timings, Program from software and network folklore, Wetware from plain words with a light CP2020 nod where one fits (second pass: heavy glossary terms and Star Wars terms are out). Elders are "the same idea after long service". Chosen after printing every unnamed form's art as text, not from a rendered gallery.

**Decided so far (maintainer feedback, two rounds).**
- Iron: Boot (baby), Init (Guru's elder), Ram (Gronk's elder), Thunk, Buzz, Gweep, Brick, Tick, Hop, Peek, Ding, Crunch and Swap. Core, Drum and Crack are held back as terms too useful to spend on a form. Bump was too cute. Firewall for Gronk's elder was odd on a Breach line; the maintainer suggested ORC or Mudge instead.
- Program: Rat (street teen) and Daemon (Mouse's elder) are decided; Tree for Parse's elder is preferred to Daemon; Fork, Mask, Tone, Leak and Dump stand. Hack, Null and Flame are out; Bot does not work. A malware-flavoured street teen is wanted (Mal, Malware or Malspam). Airgap for Mouse's elder was weak unless the sprite is revisited.
- Wetware: Pod, Zero, Edge, Lancet, Frag (Solo's elder), Surge (Chipped's elder), Broth, Observer and Cipher (the line Zero, Blank, Cipher). Star Wars terms are out. Helminth (Leech's elder) is confirmed.
- Names not commented on (Graft, Savant, Tone, Fork, Mask, Leak, Dump, Thunk and so on) are taken as accepted unless the maintainer says otherwise.

**Reserved terms (do not spend on a form):** Core, Crack, Drum, Null, Bot, Hack. Colour words (Red, Blue) are avoided because tints and shells use them.

**Checked.** The Jargon File 4.4.7 and the CP2020 slang page were downloaded in this session. Found as Jargon headwords: tick, thunk, buzz, gweep, brick, hop, peek, ding, crunch, swap, boot, daemon, fork, leak, dump. Found as CP2020 headwords: Zero, Observer, Pod (inside Pods), Edge, Frag, Apter. Not headwords in either: Init, Lynx, Mask, Tone, Tree, and the plain-English Wetware names (Graft, Lancet, Savant, Surge, Broth, Helminth, Cipher). ORC was checked against Wikipedia's Old Red Cracker page (an anonymous reverser, founder of the High Cracking University); the Kerenzikov and Sandevistan references rest on the maintainer's message, not on a source I read. All 34 names are unique and none matches an adult name.

**The four 1.0 names (Daemon, Init, Firewall, Airgap).** Init is placed (Guru's elder). Daemon is proposed for Mouse's elder (Parse's elder is Tree). Firewall and Airgap have no form: both already exist in 1.0 as shells (`brick`, "Firewall brick"; `airgap`, "Air gap") and Firewall's trait is `hardened`, and the sketch already says 10 shells need new unlock conditions. The simplest place for them is those shells with new conditions, which keeps the names without forcing a weak form link. Airgap could return as a form name if the Mouse elder's sprite is redrawn with a visible gap (a sprite change, so not decided here). Daemon and Init are two syllables, so the monosyllable rule applies to adults only.

### Iron

| Form id | Name | Reason | Strength |
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

| Form id | Name | Reason | Strength |
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

| Form id | Name | Reason | Strength |
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

## Codex pages

Two kinds (see Decided). Under option C one page covers both forms of a role, named by role (`iron-breach`); the Iron pages `iron-breach` and `iron-dodge` name no form; other role pages name neither lean. Where form pages drop is decided: role pages drop on any run in any cleared non-Deep region (the home region in the drafts is only the page's setting) and the hidden pages in The Deep (see the drafts, Open item 6).

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

**Egg page drop rate (arithmetic from a simple model).** Each netrun has chance `p` of an egg page, in order, no repeats, no per-life cap; casual makes about 18 runs a life and attentive about 24. Chance of all five form pages of one egg: at p 0.10, attentive 9% in 1 life, 53% in 2, 86% in 3; casual 29% in 2 lives, 64% in 3, 86% in 4. At 0.08 attentive gets 34% in 2 lives; at 0.15, 29% in 1. **Correction (measured after this was written):** the arithmetic above assumes every run can roll every page. With pages placed in a home region, and the hidden page in The Deep (reached in life 2 or later), the pace is much slower and uneven between eggs; see the codex drafts, Open item 6, and `docs/netling2-prototypes/egg-pages.mjs`. **p = 0.10 is the starting value, and role pages roll on any run in any cleared non-Deep region (decided); the hidden page rolls 0.25 on each Deep run (decided), one roll per run throughout.** Rogue's gate (18 pages) takes a consistent player about 2 lives an egg (about 6) plus a Root and Source trip for each Source page; a casual player 9 or more.

## Hidden egg

1. **Rogue (the Puppet Master line)**: unlocked after the ending; its end of life is a merge of two lineage fragments from different eggs into a hybrid next generation; failure model: rogue hunters instead of corp traces. Chosen.
2. Replicator (wabbit): a playable prequel tied to `public-1` and `public-2`; costly because it manages a population. Not chosen.
3. Variant: same meters, different tree; low cost, low contrast. Not chosen.

Gate: the ending has played and all 18 egg pages; it does not appear before then, not even as a corrupted slot.

## Impact on 1.0 content

| Area | Impact |
|---|---|
| Mini-game mechanics | Unchanged |
| Mini-game text and modifiers | Re-skin per egg, add a modifier per egg |
| Items (9) | Rename per egg; Coolant cell and Antivirus patch gain +1 temper; Segfault gains temper -4 and a bug chance |
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
1. Names for the 27 elders and the teens (sprite ids are placeholders): 34 proposals are drafted in Teen, baby and elder names (second pass after maintainer feedback; only the names marked Decided there are settled).
2. Purge order details (where form pages drop is decided: any cleared non-Deep region at 0.10 a run, the hidden page 0.25 on each Deep run, one roll per run);  (recommended: leave accident or deliberate unsettled; NL-0 learns it was dead only when the player shows it).
3. Standing: whether the measured spread (committed players certain early, others random) is the intended feel; whether Standing shows as a gap or only two floors.
4. Bugs: the debug station's options and cost; clearing action names per egg; the ceiling and penalty values once the loop exists.
5. Temper: a flicker guard at thresholds, decay per minute or per check-in, whether strong steady has its own reward, which items beyond Segfault and Black ICE retool, perks.
6. Care preferences: whether the steady lock-in for players who never netrun is acceptable; the base-rate difference under fixed-order play; log line wording.
7. Second form names: Nutri is decided; the other 11 are proposals and the lean each takes is a guess.
8. Pages: idle and chatter temper hints (flagged), the length of the longer drafts, retesting the egg page rates once 2.0 exists (see item 10).
9. UI: the Dex structure for hints (hidden forms are unlisted until raised or revealed, decided; elders show as corrupted records, see the drafts, Open item 10), the floor display of Standing, how bugs and neglect show.
10. Retest in 2.0: egg page drop rate (0.10 a run) and the bug values.

**Not designed yet**
- Sprites: see the sprite handoff (all 66 drawn as first drafts; care, bug and temper passes, device check outstanding).
- Per-egg meters and care buttons (Iron's drift and calibration, Wetware's rejection; how corrective, adaptive and perfective care map to actions; the abstract drives are a proposal).
- Baby and teen stages and forms' rules per egg; the elder stage rules (1.0's Mainframe gating replaced by the `late` flag); Source access rules and the descent's presentation per egg (read, burned in, dreamed); how late-page gating by Root interacts with the elder stage.
- Netrun abilities per form, regions per egg, events per egg, the tutorial run per egg; the Rogue egg beyond the merge idea; mini-game modifiers per egg; shells, crests and the Mini device prop; unlocks for late pages; save format and storage keys (migration from 1.0 is not planned).

**Not done.** No 2.0 code exists; 1.0 code was read only for the prototypes. All measured numbers use 1.0's simulator and archetype bots with stand-ins (single signed allegiance for Standing, stability for temper): starting values, not 2.0 results. No bot follows the preference part of the time or adapts to bugs. No page text has been playtested or read in context (drafts run longer than 1.0's pages). Page counts and Root arithmetic are from 1.0's tables. Puppet Master details are from memory of the film; the dream framing is from a reading of CP2020's simulated-reality entries (BTL, SimSense, moddy).
