# Netling 2.0 care drafts

Status: first-pass proposals for the per-egg meters and care buttons (sketch, Next steps). Nothing here is implemented or playtested; the per-egg pressure the wording sits on is measured on the simulator ([NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md)). Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (decisions) and [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (page text and the same three registers).

## Frame (maintainer answers, first pass, not set in stone)

- **Reskins are enough.** Every egg keeps 1.0's four meters, the cache, and the same rules. Only names, log lines and alert text change. Lineage, traits, Standing, temper, bugs and the simulator stay shared.
- **Rhythm is flavor.** Interrupt, batch and polling are wording, not clock changes. Drains, windows and event chances are 1.0's.
- **The button count stays fixed:** nine control buttons (feed, feed, play, cure, cool, purge, netrun, nap, lights) plus the event-bar buttons (two trace answers, DEFEND, PURGE) and GREET. Names change, the layout does not.
- **Extra pressure per egg is a hidden rule behind the same buttons.** Iron keeps Heat in a band with hidden wear (drift), Program has a Charge state and Wetware a Sync state, each with a benefit, a risk and a brake (see the pressures doc). Buttons, drains' base numbers and meters do not change; the state cues below are log lines, not new controls.

Rules for the words: Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and plain (no CP2020 jargon in game text). Button labels stay at 9 characters or fewer (the longest 1.0 labels are `SCAV DATA` and `LIGHTS OFF`). Log lines are lowercase with a `> ` prefix as in 1.0.

## Meters

| 1.0 meter | Program | Iron | Wetware | Hover text (Iron / Wetware) |
|---|---|---|---|---|
| Charge `CHG` | CHG | PWR | FOOD | "Power. Feed it." / "Food. Feed it." |
| Sync `SYN` | SYN | LOCK | BOND | "Phase lock with you. Play with it." / "Its bond with you. Play with it." |
| Integrity `INT` | INT | INT | HLTH | "Its soundness. At zero too long, it is decommissioned." / "Its health. At zero too long, it wakes elsewhere." |
| Heat `HEAT` | HEAT | HEAT | TEMP | "Running hot wears it out. Vent it." / "A fever hurts it. Cool it down." |
| Cache (pips) `CACHE` | CACHE | ROT | WASTE | "Bit rot. Scrub it." / "Waste builds up. Flush it." |

**Decided (maintainer): the run HUD follows these meter words** (FOOD, HLTH, TEMP for Wetware; PWR, LOCK for Iron), not only the home screen, so the netrun tips and log lines (NETLING_2_NETRUN_DRAFTS.md, section 7) read true. The netrun's button names (CONTINUE, JACK OUT) and the node label ICE are the same in every egg.

## Care buttons

The 1.0 name is the rule; the egg name is only the label. Verb is the FDA kind the action belongs to (see Care verbs).

| 1.0 action | Program | Iron | Wetware | Verb |
|---|---|---|---|---|
| CORP PKT (Charge, corp Standing) | CORP PKT | MAINS | VAT MIX | upkeep |
| SCAV DATA (Charge, street Standing, 12% infection) | SCAV DATA | SALVAGE | SCRAPS | upkeep |
| PLAY | PLAY | PLAY | PLAY | perfective |
| PATCH (cure) | PATCH | ALIGN | TREAT | corrective |
| COOL | COOL | VENT | CHILL | corrective |
| PURGE (cache, overflow) | PURGE | SCRUB | FLUSH | corrective |
| NETRUN | NETRUN | NETRUN | NETRUN | perfective |
| NAP | NAP | IDLE | DOZE | adaptive |
| LIGHTS OFF | LIGHTS OFF | LIGHTS OFF | LIGHTS OFF | adaptive |

Notes:
- The two feeds keep the corp and street flavor because they carry Standing (0.25). MAINS is clean supplied power and SALVAGE is scavenged; VAT MIX is corp-grown and SCRAPS is street.
- Iron is read-only and cannot be patched, so its cure is an alignment (calibration), which fits its failure model. The rule (cure the infection, Integrity +10, temper +1 within 30 minutes, -1 later) is unchanged.
- The mini-game picker stays BREACH, DODGE, TUNE, FEAST in every egg: the roles are the Dex descriptors. Mini-game text is re-skinned elsewhere (sketch, Impact).

## Event bar

| 1.0 | Program | Iron | Wetware |
|---|---|---|---|
| Corp trace | CORP TRACE | FIELD AUDIT | CORP SCAN |
| HIDE (street +1) | HIDE | SHUTTER | DUCK |
| COMPLY (corp +1) | COMPLY | SIGN OFF | SUBMIT |
| Intrusion | INTRUSION | TAMPER | INVADER |
| DEFEND | DEFEND | LOCK DOWN | FIGHT |
| Memory overflow | OVERFLOW | BUFFER FULL | BACKLOG |
| Overflow answer | PURGE | SCRUB | FLUSH |
| Power surge | POWER SURGE | LINE SURGE | FEVER SPIKE |
| Visitor / GREET | GREET | HAIL | WAVE |

## Failures

| 1.0 state | Program | Iron | Wetware |
|---|---|---|---|
| Virus | virus | drift | rejection |
| Cache file | corrupted cache | bit rot | waste |
| Care mistake | fault | fault | slip |
| Death | flatline, exit code | decommission | waking |
| Bug (2.0) | bug | errata | scar |
| Clearing a bug | BUGFIX | REWORK | STITCH |

Notes:
- Program's death register, Iron's and Wetware's are the sketch's. "Care mistake" is internal and shown only in log text.
- Wetware's rejection is the sketch's failure model used as the name of the virus. Its closest mechanism now is the Sync state: infections are likelier inside it, and playing past 90 inside it rolls one. It still does not grow with augmentation (open).
- **Bug clearing goes through netruns (decided, maintainer, first pass): a clinic node.** The control bar stays fixed. The clinic is a third, unaligned kind of market (Clinic and bug statements, below; the prototypes README, The clinic); the first draft's debug-station anomaly and the idea of splitting netruns into a dive and a market-like mode are set aside. Scrip (15) and Standing (2, any split) remain the prices, plus the market's Charge fee.

## Items

Names are the sketch's suggestions; effects are 1.0's with the 2.0 temper changes (Coolant +1, Antivirus +1, Black ICE shard -1, Segfault -4).

| 1.0 | Program | Iron | Wetware |
|---|---|---|---|
| Coolant cell | Coolant cell | Coolant loop | Cold pack |
| Antivirus patch | Antivirus patch | Shielding | Immune booster |
| Repair kit | Repair kit | Spare parts | Skin patch |
| Black ICE shard | Black ICE shard | Overvolt shard | Dream chip |
| Memory shard | Memory shard | EEPROM swap | Splice |
| Segfault | Segfault | Head crash | Bad batch |
| Corp voucher, Signal booster, Bypass chip | same in all | same | same |

## Alert lines

Replaces `alertReason` text (1.0 line in the first column). The key and the thresholds are unchanged.

| Key | 1.0 | Iron | Wetware |
|---|---|---|---|
| trace | Corp trace incoming. Nm to respond. | Field audit under way. Nm to answer. | Corp scan under way. Nm to answer. |
| attack | Intrusion attempt. DEFEND within Nm. | Tamper alarm. LOCK DOWN within Nm. | Something is getting in. FIGHT within Nm. |
| overflow | Memory overflow. PURGE within Nm. | Buffer full. SCRUB within Nm. | Waste is backing up. FLUSH within Nm. |
| virus | Virus detected. Patch it before Integrity collapses. | Drift detected. Align it before it wears through. | Rejection setting in. Treat it before Health collapses. |
| charge | Charge is running low. | Power is running low. | It is hungry. |
| sync | Sync is fading. It wants to play. | Lock is slipping. It wants to play. | It is drifting away. It wants to play. |
| heat | Running hot. Flush the coolant. | Running hot. Vent it. | Running a fever. Cool it down. |
| lights | It's trying to sleep. Kill the lights. | Same line. | Same line. |
| cache | Corrupted cache is piling up. | Bit rot is spreading. | Waste is piling up. |

## Care verbs (corrective, adaptive, perfective)

The FDA glossary has no preventive entry, so feeding is labeled upkeep and sits outside the three. The mapping is descriptive (Dex and field manual wording); no rule depends on it.

- **Corrective** (fix a fault): the cure, COOL, PURGE, DEFEND, bug clearing.
- **Adaptive** (respond to a changed environment): NAP, LIGHTS, and the sleep zone it follows. HIDE and COMPLY also fit, since a trace is the environment changing.
- **Perfective** (improve performance): PLAY, NETRUN, and the mini-game roles.

## Sample log lines (draft, first pass)

| Moment | Program | Iron | Wetware |
|---|---|---|---|
| Feed (corp) | > packet received. charge up. | > mains connected. charge up. | > vat mix down. it eats. |
| Cure within 30 min | > patch applied. clean. | > aligned. drift gone. | > treated early. it settles. |
| Cool | > coolant flushed. | > vented. fans spin down. | > chilled. the fever breaks. |
| Purge | > cache cleared. | > scrubbed. sectors good. | > flushed. it breathes easier. |
| Nap | > nap over. back online. | > idle ended. back online. | > it wakes from a doze. |

## Open

1. Egg pressures have a working design (Iron's drift band and wear, a Charge state, a Sync state; see the pressures doc). The states are named Overdrive (Charge) and Overlink (Sync). Open here: whether the cue lines below are enough of a signal.
2. Bug clearing in netruns: the maintainer's direction is a clinic, a third unaligned kind of market that fixes bugs and sells the healing items (see the prototypes README, The clinic); its per-egg names, statements, hover text and visit lines are drafted below (Clinic and bug statements).
3. Names: SHUTTER, SIGN OFF, DUCK, SUBMIT, INVADER, FIGHT, HAIL, WAVE, VAT MIX and SCRAPS are first guesses; HIDE and COMPLY keep their Standing meaning (street, corp) under every name.
4. The Dex hints for temper and the chatter use these words, so they follow once the names settle.
5. Everything here is untested: label widths on the real control bar, the readout line length, the field manual (generated from `CFG`, so it needs egg-aware text).
6. Resolved: the 2.0 simulator fork (`prototype/netling2/sim/`) models the current rules; it measures the pressures and the clinic, not the wording.

## Pressure cues (drafts, first pass)

Log lines for the states in the pressures doc, in the register of each egg. Every egg can enter both states (at x1 when it is not the owner), so every egg needs both rows. Cues must be visible: the player is never told a number. Unread in context.

| | Program | Iron | Wetware |
|---|---|---|---|
| Charge state begins | > buffers full and steady. boost mode on. | > mains steady. running above spec. | > well fed and humming. |
| Charge state ends | > boost mode off. | > power back to rating. | > the hum settles. |
| Sync state begins | > link saturated. latency near zero. | > locked tight. every move lands. | > it is buzzing. everything feels close. |
| Sync state, first play at the top | > link at limit. more load will bite. | > lock at limit. more will strain it. | > it is wound too tight to play safely. |
| Sync state, burnout | > link burned out. offline until tomorrow. | > lock burned out. it needs the day to settle. | > burned out. it needs the rest of the day. |
| Sync state ends | > link settles. | > lock eases. | > the buzz fades. |
| Sync state, ready again (24 hours after a burnout) | > link ready again. | > lock ready again. | > it can link again. |
| Penalty hit (infection from a play) | > overloaded. !! virus signature detected. | > overloaded. !! drift detected. | > too wound up. !! rejection setting in. |
| Wear passes the warning line (Iron only) | none | > tolerances are slipping. | none |
| Wear from running cold (Iron only) | none | > running cold. it stiffens. | none |

Wear exists only on Iron, so those two rows have one line. The two Iron lines are the simulator's text. The Charge state's cost (overflow, Integrity bleed) already has existing overflow and decay text.

## State clues (drafts, first pass)

How a player sees the states without a number. Patterned on 1.0's two: the Heat bar reads OC with a title and a screen-reader value, the readout line appends " · overclocked", and the sprite grows three heat wisps (`src/render.js`, `src/ui/hud.js`). Flow is a slow breathing outline and " · in flow". Rules kept from 1.0: nothing flashes more than three times a second (steps of 400 ms or more, double `FLASH_TOGGLE_MS`), every motion cue has a still version in calm mode, color is never the only signal (a label, a shape and a text value go with it), and no new sound (props have none). Not rendered or read on a device; the marks' timing and placement are in `prototype/netling2/marks.js` and tested.

**Where each cue lives**

| Clue | Overclock (1.0) | Overdrive (Charge) | Overlink (Sync) |
|---|---|---|---|
| Bar label | OC replaces HEAT | OD replaces the Charge label | OL replaces the Sync label |
| Readout line | " · overclocked" | " · overdrive" | " · overlink" |
| Sprite | three wisps rise off the top edge | two sparks hop along its base, under the feet, one step per 400 ms | two dots slide up and down at its sides, three columns out, one step per 400 ms |
| Calm mode | wisps still, stacked | sparks still, one each side | dots still, one each side |
| Screen-reader value | ", overclocked" | ", overdrive" | ", overlink" |
| Title (hover) | what OC does | "Overdrive: a full buffer pays off, but overdrawing it hurts." | "Overlink: closely linked, but pushing it too far burns it out." |

The three marks sit in different places (above, below, beside) and have different shapes (rising pixels, hopping pixels, sliding pixels), so two states at once (Overclock and Overlink, say) stay readable. Flow keeps its outline.

**Stages of Overlink** (the one with a brake; Overdrive has no brake and only the first two rows)

| Stage | What the player sees | Why |
|---|---|---|
| Building (Sync high, under 3 hours) | nothing | the hold is the discovery; a countdown would give the number away |
| Active | OL label, two sliding dots, " · overlink", the begins log line; a thin tick appears on the Sync bar just under the top | the tick marks where playing stops being free, without a number |
| Strained (a play above the tick) | the tick fills in, one dot drops away, " · strained", the first-play log line | the warning that a second play burns it out |
| Burned out | dots fall away, label back to the Sync name, " · spent", the burnout log line | the state is over and cannot return today |
| Ready again | " · spent" clears, the log line "> it can link again." | the player learns when to try again |
| Infection from a play | the existing virus alert and the penalty log line | the cost is an infection, shown as one |

**Iron's wear** (Iron only; the other eggs show none):

| Stage | What the player sees |
|---|---|
| Wear below the warning line | nothing |
| Past the line | a small static seam on one edge of the sprite, " · worn" in the readout, "> tolerances are slipping." |
| Heavy wear | a second seam, the readout stays " · worn" |
| Recovering | seams go one at a time as wear fades; "> back within spec." |
| Heat under the cold line, awake | the Heat label reads COLD, "> running cold. it stiffens." |

Seams do not move, so they carry no flash risk and need no calm version. Titles: "Worn: running outside its range wears it down. Rest to recover." and "Cold: running too cool wears it down too."

**Field manual lines (draft, in the existing style).** Decided (maintainer): qualitative, no numbers, for the three states and Flow. 1.0's own OC entry prints numbers (generated from `CFG`); the 2.0 manual does not.

- OC · Overclocked: "Heat held high. Mini-games and ICE run slower and wins find more, but a lost game costs Sync and Integrity, lost ICE bites harder, and trouble and visitors come more often. Cool it down to end it." Second line kept from 1.0: "Running hot or cool leans it one way or the other as it grows."
- OD · Overdrive: "Charge held full for hours. Games pay more and wins find more, but the buffer overflows more often and it loses Integrity. Rest or a drop in Charge ends it."
- OL · Overlink: "Sync held high for hours. Visitors drop by more, wins find more, and infections come easier. Play inside the tick and it holds; play past it and it can burn out for a day."
- a glow (Flow, the sprite note rather than a bar label): "Kept fed, in sync, sound and cool for hours in a row while awake, with nothing wrong, it glows. In flow, traces, intrusions, overflows and surges come less often, visitors drop by more often, and it leans steadier as it grows." Qualitative too (decided, maintainer); 1.0's entry prints the three hours, the 50 and 80 lines and the 60 Heat ceiling.
- Not printed anywhere: the heat threshold, the hold time, the Charge and Sync lines and the free band's edge (the tick shows it without a number).

**Mark colors (proposal, measured).** Overclock keeps 1.0's orange `#ff9f1c`. Overdrive's sparks are white `#ffffff` and Overlink's dots sky blue `#4dabff` (`prototype/netling2/mark-colors.mjs`, `MARK_COLORS` in `marks.js`). Why: the six body palettes use cyan, magenta, yellow, green, purple and pale lilac for body and accents, and Flow's outline takes the palette accent, so the marks need hues that are not body colors: orange is taken by Overclock, and of the candidates tried white and sky blue were the pair with the largest worst-case separation (CIE76 distance 49 at the closest pair, over normal vision and protan, deutan and tritan simulations; 6.8:1 contrast on the LCD, against the 3:1 asked of non-text marks). The marks also differ by place (above, below, beside) and by motion, so color is never the only signal. White is also the body's small highlight color (the `+` marks); the sparks sit below the feet, outside the body, so they do not read as part of it. Preview: `docs/netling2-prototypes/state-mark-colors.png` (stand-in blocks in each palette, four vision modes), source `marks-preview.html`. Not seen on a device or against real sprites.

Open: whether Iron's seams need a design pass per form (drafted by a placement rule on all 22 forms, `prototype/netling2/seams.js`, for review; hand overrides go in its `OVERRIDES`); the pre-state caption (drafted below, Pre-state caption).

## Temper and the states (drafts, first pass)

**Proposal: the states do not move temper and have no temper tell of their own.** Temper is personality (the maintainer: not a cost or a benefit), and the two measurements that tried to move it from these states (a Sync swing, Result 10, and faster decay of steady temper, Result 11) shifted the mean by two points or more and were dropped as a bias. As built, a state reaches temper only indirectly: it takes Flow time away from heavy players and its infections are faults (-1 each), which measured at -0.1 to -0.7 for attentive and sysadmin players with Overdrive and Overlink (Results 14 to 16).

So the work is coexistence. The tell speaks through the body (pose, drift, settle, pulse, idle actions and chatter shape); the states speak through marks beside it. Rules, kept so a player can tell them apart:

1. The marks are always regular: one step per 400 ms on a fixed clock, the same at every temper level and for every egg. Irregularity belongs to the tell alone, so a stuttering body inside steady marks reads as "unsteady netling, in a state", never as a stronger state.
2. The marks sit outside the body's reach. The new ones are three columns out at the sides (Iron's strongest drift is two) and on rows h+1 and h+2 below the feet (Iron's settle drops the body one row). Overclock's wisps are 1.0's and sit above the top.
3. Flash budget by region: the pose keeps its own budget (a change at most every 200 ms); the marks change at most every 400 ms, on that same grid. The marks never touch the pose.
4. State log lines are system lines in the egg's register and are never shaped by the chatter tone (no beats, checklist, bell or burst). Only chatter is shaped.
5. The Metronome and its twelve-hour clock follow the tell, not the states; a state does not pause or count toward it. Neglect works as in 1.0 (a state's cost is not neglect).
6. The idle routine and strays stay as drafted; they are body actions and do not collide with the marks.

What a player can read: a steady beat with steady marks (calm and in a state); a drifting or stuttering body with steady marks (unsteady and in a state); no marks (neither). The mix is the only new information, and it comes from existing channels.

Verified (marks.js and marks.test.js; the prototype suite passes): the marks step only on the 400 ms grid and never change faster, hold still in calm mode, occupy different places (no shared pixel), and the new ones never touch the body at any egg or level in the sampled drift. Not done: drawn in a real frame, a device check, any playtest.

Archive hints and chatter lines for the states are drafted in `NETLING_2_CODEX_DRAFTS.md`, State chatter and Archive hints. Open: whether strongly unsteady netlings should show the marks more nervously (rejected here to keep rule 1).

## Pre-state caption (draft, first pass)

Decided (maintainer): one caption per netling, not one per player (the easier version), because vpets are played in short sessions and a new netling is a fresh start. A per-life or per-state countdown stays out (it would give the hold time away).

- **What it is.** A two-line caption on the home screen in the style of 1.0's first-run tips, shown once per netling per bar (so at most two a life): one for Charge, one for Sync. It names no state, no number and no time. Lines are in `prototype/netling2/state-hints.js`:

| | Charge | Sync |
|---|---|---|
| Program | charge is holding steady. / keep it up and something may change. | sync is holding steady. / keep it up and something may change. |
| Iron | power is holding steady. / keep it up and something may change. | the lock is holding steady. / keep it up and something may change. |
| Wetware | it is well fed and doing well. / keep it up and something may change. | the bond is holding strong. / keep it up and something may change. |

- **When.** Never to a baby (decided, maintainer): the netling must be a teen or later. After 120 minutes of building toward the state (a bar at or over its entry level, dips above the exit level allowed), the state not yet on and not yet reached by this netling, this netling not yet shown the caption for that bar, and nothing more urgent on screen (an alert, event, request, visit, run, nap or sleep). A bar that has already built when the teen stage begins shows its caption at once. A new netling resets it. The state it points to needs 180 minutes, so the caption comes two thirds of the way. Once a netling has reached a state its own label and readout word teach it, so the caption is dropped for that bar.
- **Save.** A per-netling flag for each caption (Charge, Sync, Overclock and Iron's wear), default false, needs a default in `createScript`, `migrate` and `cleanSave` (the 2.0 app's equivalents of 1.0's rules).
- **Measured (`sim/hint-sweep.mjs`, final pressure design, default bots, 150 lives each, simulator only; 120 minutes, states teen and later).** Attentive, sysadmin and daredevil see the Charge caption in 100% of lives and the Sync caption in 99% to 100%, about 2 hours before the state, which they reach in 91% to 99% of lives (never as a baby). Casual and worker players never see a caption and never reach a state; human-regular see Charge in 16% (reaching the state in 1%) and Sync in 3%; overclocker Sync in 3%. At 60 minutes the promise went unkept too often (casual 11% to 29%, human-regular 69% to 85%, almost no state reached), and at 150 the lead time dropped under an hour; 120 is the compromise.
- **States are teen and later (decided, maintainer).** A baby holds no Overclock, Overdrive or Overlink: lore, babies are too young, inexperienced and unstable to maintain the intense states. Before this rule many attentive netlings reached a state during babyhood (Overdrive in 59% of attentive lives, Overlink in 29%), so the captions never showed for them; now every state starts at the teen stage and the captions line up with it. Measured effect (200 lives, default bots): the ordinary five are unchanged (infections within 0.5, full-life within 0.03); Iron's amplified Overclock benefit shrinks a little because babies no longer overclock (daredevil drops +8.9 to +7.3, overclocker +7.6 to +6.3 over their no-pressure runs), infections unchanged. Iron's wear is not a state and still builds in a baby. A baby at a high bar shows no cue and no line (decided, maintainer). The Overclock rule for babies is a change to a 1.0 rule in 2.0.
- **Heat has its own caption (added after the maintainer asked where Overclock was).** Overclock has no hold, so there is nothing to build toward: it starts the moment Heat reaches the line and the OC label shows. Its caption is shown once per netling, the first time it is overclocked at the teen stage or later, with nothing more urgent on screen. Lines (`OVERCLOCK_HINTS` in `state-hints.js`): Program "it is running hot. / wins find more, but a loss costs it."; Iron "it is running past rating. / wins find more, but a loss costs it."; Wetware "it is running hot all over. / wins find more, but a loss costs it." (not "fever", which is Wetware's name for the power surge). Iron alone also gets a wear caption the first time its hidden wear passes the warning line, shown with the existing log line "> tolerances are slipping.": "running too hot or too cold wears it. / rest lets it recover." It names no number and covers the cold side with the same words.
- **Measured (`sim/heat-hint-sweep.mjs`, final design, Iron's wear on, default bots, 150 lives, simulator only).** The Overclock caption would show in most lives (the first Overclock at the teen stage or later): attentive 52% (median day 2.4), sysadmin 48%, casual 72%, worker 85%, human-regular 61%, daredevil 100% (day 1.0), overclocker 99%. The Iron wear caption is rarer and better targeted: attentive 9%, sysadmin 3%, casual 7%, worker 25%, human-regular 19%, daredevil 73%, overclocker 99%. So Overclock teaches nearly everyone, while the wear caption mostly reaches players who run hot.
- **Reading it.** The caption mostly reaches the players who can reach the state, which is the point. A small share of occasional players see a caption for a state they will not reach.
- **Not done.** The caption's look and timing on screen, a device check, a playtest, and wiring any flag.

## Clinic and bug statements (drafts, first pass)

The maintainer's direction: bugs are cleared at a clinic node on a netrun (a third, unaligned market kind that also sells the healing items), and a bugged netling softly pushes its player to go: it says so, and a clinic job is offered (see the prototypes README, The clinic and Soft push to run). Names per egg follow the registers above; the simulator uses the generic wording. All lines are the Wetware-plain or Iron-physical or Program-technical voice and have not been read in context.

| | Program | Iron | Wetware |
|---|---|---|---|
| The node | repair shop | workshop | clinic |
| A bug settles in | > a bug has crept in. a repair shop out on the net can fix it. | > out of true. a workshop out on the net can rework it. | > something is wrong under the skin. a clinic out on the net can stitch it. |
| Three or more bugs | > it is riddled with bugs. find a repair shop. | > badly out of true. find a workshop. | > it is badly scarred. find a clinic. |
| A reminder, now and then | > still buggy. repair shops are out there. | > still out of true. there are workshops out there. | > still sore. there are clinics out there. |
| The job (contract text) | get a bug fixed at a Public Net repair shop | get a bug reworked at a Public Net workshop | get a bug stitched at a Public Net clinic |
| Fix button | FIX A BUG | REWORK | STITCH |

**Read in context (first pass).** One collision fixed: Program's first statement said a repair shop "can patch it", but PATCH is Program's virus cure and Antivirus patch is an item, so it now says "fix". Fix button labels stay at nine characters or fewer (FIX A BUG is nine). The fix button lives on the clinic node, not the control bar, so the control bar's nine buttons are unchanged. Lines are not read on a device.

**Healing items keep their egg names at the clinic (proposal).** Coolant cell / Coolant loop / Cold pack, Repair kit / Spare parts / Skin patch, Antivirus patch / Shielding / Immune booster, as in Items. The clinic is where they are bought, and each egg already reads them in its own voice, so no clinic-only names are needed.

**Hover text (draft).** Numbers are the simulator's (12 Charge plus 15 scrip, or 2 Standing, any split; the share and fee were re-measured against the final pressure design and kept, see the end of this section) and 1.0 shows prices on market buttons, so these show them too.

| | Program | Iron | Wetware |
|---|---|---|---|
| Node (map) | Repair shop: fixes one bug for a fee. Sells coolant, repair and antivirus supplies. Takes no side. | Workshop: reworks one errata for a fee. Sells coolant, spare parts and shielding. Takes no side. | Clinic: closes one scar for a fee. Sells cold packs, skin patches and immune boosters. Takes no side. |
| Fix button | Fix one bug. 12 Charge plus 15 scrip, or 2 Standing. Fix as many as you can pay for. | Rework one errata. 12 Charge plus 15 scrip, or 2 Standing. Rework as many as you can pay for. | Close one scar. 12 Charge plus 15 scrip, or 2 Standing. Stitch as many as you can pay for. |

**Visit log lines (draft).**

| | Program | Iron | Wetware |
|---|---|---|---|
| Arrive | > a repair shop. open for bugs. | > a workshop. benches free. | > a clinic. someone waves you in. |
| Nothing to fix | > no bugs found. nothing to fix. | > in true. nothing to rework. | > nothing wrong under the skin. |
| A fix | > bug fixed. clean build. | > errata reworked. back in true. | > scar closed. it breathes easier. |
| Cannot pay | > cannot cover the fee. | > cannot cover the bench time. | > cannot cover the bill. |

The pay choice (scrip, or 2 Standing as 2 corp, 1 and 1 or 2 street) keeps 1.0's market button style and needs no egg wording.

**Clinic look on the map (draft, first pass).** Drawn like the 1.0 nodes in `src/netrun/view.js`: canvas rects, a fixed color in every region so the type reads at a glance, inside the same 20 px footprint, fading to 45% when spent. A thick plus (`prototype/netling2/clinic-node.js`), pink-lilac `#ff71ce`. Why this one: the markets are boxes (a tab on top for the black market, a counter across for the exchange), the relay is a circle with one bar, the checkpoint two bars, ICE a diamond in the region's accent (always `#ff2a6d`, red) and the cache a box in the region's main color, so a plain plus with four equal arms and no outline is the only unused shape, and no 1.0 node uses pink-lilac. Red was avoided on purpose (red means ICE and failure). The same icon serves all three eggs; only the label, hint and first-run caption change:

| | Program | Iron | Wetware |
|---|---|---|---|
| Label (cursor line) | REPAIR SHOP | WORKSHOP | CLINIC |
| Hint after it | fixes bugs. no side. | reworks errata. no side. | closes scars. no side. |
| First-run caption | bugs only clear at a repair shop. / it takes no side. | errata only clear at a workshop. / it takes no side. | scars only close at a clinic. / it takes no side. |

The preview is `docs/netling2-prototypes/clinic-node.png` (the real `drawNode` from 1.0 beside the clinic, in all seven region palettes, plus the spent fade and the three cursor lines against the 1.0 exchange line). Source: `prototype/netling2/clinic-preview.html`. Checked: the plus is inside the footprint, symmetric, one color and fades with the others (4 tests); the label, hint and caption are within the 1.0 sizes. Seen in headless Chromium at three times scale only, never at the real map size on a device. One resemblance to watch: ICE's diamond has a dark plus cut into it, so a clinic and an ICE both contain a plus, but the clinic is a solid pink cross with no diamond and the ICE is a red diamond; the label line separates them if a player is unsure. Not done: the clinic's map position rules (it replaces a market node, one in four) are the simulator's, not drawn.

**Corp exchange stock (decided, maintainer; measured).** With the healing items clinic-only the exchange offered the same two items at every visit (a Corp voucher and a Memory shard; the market shows two distinct items by weight). Proposed stock: Corp voucher 3, Signal booster 2, Bypass chip 1, Memory shard 1: the voucher stays the exchange's signature (it is sold nowhere else), the other three are neutral items the black market also sells, and the risky ones (Black ICE shard, Segfault) stay black-market only, which keeps the "safe, pricier" read. A visit then offers voucher 74%, booster 60%, memory 33%, bypass 33%, in 7 distinct pairs (was 2). Bots under the four stocks tried (attentive, casual, worker, sysadmin, 100 lives each) moved within noise; the bots buy the first wanted offer, so the value to a human is not measured (`sim/exchange-stock.mjs`).

The clinic's share (25%) and fee (15 scrip or 2 Standing) were re-measured against the final pressure design and kept (see the prototypes README, The clinic). Open: the stock weights (unmeasured).

## The break (drafts, first pass, for the maintainer to choose)

Wording for the break (decided rule: [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md), "The break"): while a state is held, Integrity under 70 warns once; under 40 the state ends, the bar drops well below its exit line, the netling takes one fault and the state is locked out for 12 hours. Every egg manages every bar and can reach every state, and only the owner's benefits are larger (maintainer, 2026-10-09), so every egg needs all three rows, Overclock included (its break applies on every egg: `BRAKE.allOverclock`). Nothing here is implemented, read in context or read on a device.

Rules followed: lowercase log lines with `> `, `!!` for the break itself as for 1.0's other bad news; no state name and no number in log lines or chatter (the label and readout word carry the name, as for the states themselves); the 12 hours is said as "half a day", as Overlink's burnout says "until tomorrow"; words already taken are avoided: "patch" (Program's cure), "reset" (Program's rest word), "reboot" (post-crash recovery), "defrag" (a bug-clearing candidate), "fever" (Wetware's power surge); the fault word follows Failures (fault, fault, slip).

**Log lines**

| Moment | Program | Iron | Wetware |
|---|---|---|---|
| Warning, Overdrive | > integrity falling under load. ease off the charge. | > over spec too long. the frame is taking it. ease the power. | > too full, and it hurts now. ease off the food. |
| Warning, Overlink | > link load is eating integrity. stop playing for now. | > the lock is straining the frame. let it ease. | > too close for too long. it hurts. give it some space. |
| Warning, Overclock | > running hot under load. integrity falling. flush the coolant. | > past rating too long. it is wearing through. vent it. | > too hot for too long. it hurts. cool it down. |
| Break, Overdrive (discharge) | > !! buffers discharged. boost blocked for half a day. fault logged. | > !! breaker tripped. power dumped. held under spec for half a day. fault. | > !! it threw it all up. it cannot fill up like that for half a day. slip. |
| Break, Overlink (crash) | > !! link crashed. session dropped. no relink for half a day. fault logged. | > !! lock slipped. gears out. no lock for half a day. fault. | > !! it pulled away all at once. half a day before it can get that close. slip. |
| Break, Overclock (throttle) | > !! thermal limit hit. clock throttled for half a day. fault logged. | > !! thermal cutout. throttled under rating for half a day. fault. | > !! it overheated and shut down hard. it cannot run that hot for half a day. slip. |
| Lockout over, Overdrive | > boost available again. | > breaker closed. it can run over spec again. | > it can fill up again. |
| Lockout over, Overlink | > relink available. | > lock free again. | > it can get close again. |
| Lockout over, Overclock | > clock limit lifted. | > cutout cleared. it can run hot again. | > it can run hot again. |

Alternative for Wetware's discharge if "threw it all up" is too much: "> !! it ate too much and crashed. it cannot fill up like that for half a day. slip."

**Alert lines** (the warning only; stat-alert style, sentence case). Proposal: the warning is a **Care** notification (not counted against the Events budget of 6 a day), once per state per entry, like the simulator's one-time warning; the break itself and the end of the lockout are log lines only, since by then there is nothing to answer.

| Key | Program | Iron | Wetware |
|---|---|---|---|
| Overdrive strain | Running too full. Integrity is dropping. | Over spec too long. Integrity is dropping. | Too full. Its health is dropping. |
| Overlink strain | Link overloaded. Integrity is dropping. | Lock straining. Integrity is dropping. | Too close for too long. Its health is dropping. |
| Overclock strain | Running hot under load. Integrity is dropping. | Past rating too long. Vent it. | Too hot for too long. Its health is dropping. |

**State clues during the lockout** (extends the State clues table): the state's label goes back to the bar's own name and its marks fall away, as for Overlink's burnout, and the readout line carries a word until the lockout ends: Overdrive " · drained", Overlink " · spent" (the same word as the burnout, since the player's lesson is the same: not today), Overclock " · throttled". Screen-reader values match (", drained" and so on). No new sprite mark (keeps the flash budget and the three-region layout). During the warning: proposal, nothing beyond the log line and the alert; a thin strain mark was considered and left out because the marks are kept regular (Temper and the states, rule 1).

**Field manual** (qualitative, appended to each state's entry): OD, OL and OC, on every egg: "Let Integrity sink too far while it lasts and the state breaks: it takes a fault and cannot return for a while."

**One-time caption** (proposal, same rules as the pre-state caption: once per netling, teen or later, nothing more urgent on screen), shown with the first warning:

| Program | Iron | Wetware |
|---|---|---|
| it is paying for this in integrity. / ease off before it breaks. | it is paying for this in soundness. / ease off before something gives. | it is paying for this with its health. / ease off before it breaks. |

**Chatter while strained (optional).** Two lines per state per egg was decided as enough; if a third, strained line is wanted (said only while the warning holds), drafts: Program "load exceeds rating. continuing anyway." (Overdrive) and "too much input. dropping frames." (Overlink); Iron "relays hot. something will trip." and "gears grinding. hold it steady."; Wetware "i ate too much. my insides hurt." and "too close. i cannot breathe right."; Overclock: Program "thermal margin gone. throttling soon.", Iron "casing too hot to hold. it will cut out.", Wetware "i am burning up. make it stop." Not checked by `checkShape` yet; they would be if adopted.

Why "ease off" and not "stop": the watch bots (baseline README, "players who mind the break") show that feeding or playing less while Integrity is low saves a player who will be back soon but costs a sparse player 2 to 3 points of full life over the next gap, so the lines ask for less, not none.

**Second pass (2026-10-09, proposal; the first draft above is option A).** The rows above were written before the strain trigger, so a break now has two causes: Integrity under 40, or the owner's strain at 80. The lines above name no cause, so they fit both and need no change for it. What a second read found, and option B for the three break lines:

- Program's Overlink line says "link crashed". 1.0's overflow line is "buffers burst. crashed: ... rebooting...", so a Program player may expect a reboot after "crashed" and none comes. Option B says "dropped".
- Option A runs long: the Wetware discharge is 74 characters with the prefix and so is Iron's, against 68 for 1.0's longest event line (the overflow crash, "> !! buffers burst. crashed: -15 integrity, cache full. rebooting..."). Option B keeps every break line at 61 or under.
- The fork's own break line (`sim/sim.js`, the generic simulator text) ends "care mistake."; the drafts use the egg's fault word, as the Failures table does. The app should take the drafts' word.

| Break | Program | Iron | Wetware |
|---|---|---|---|
| Overdrive (discharge) | > !! buffers dumped. boost blocked for half a day. fault. | > !! breaker tripped. held under spec for half a day. fault. | > !! it brought it all up. no gorging for half a day. slip. |
| Overlink (crash) | > !! link dropped. no relink for half a day. fault. | > !! lock slipped its gears. no lock for half a day. fault. | > !! it pulled away hard. distant for half a day. slip. |
| Overclock (throttle) | > !! thermal limit hit. throttled for half a day. fault. | > !! thermal cutout. held under rating for half a day. fault. | > !! it overheated. no running hot for half a day. slip. |

My recommendation: option B on every egg (the "crashed" collision and the length); option A's Wetware discharge alternative ("it ate too much and crashed") has the same "crashed" problem. Lengths measured as strings only (51 to 61 characters); neither option is read in context or on a device.

Open: whether the warning should notify at all (it is the only state line that asks for an action); "half a day" against "for a while" (the second hides the number entirely); Iron's trigger: since 2026-10-09 the owner's state also breaks on its strain (Iron's wear; EGG_PRESSURES, "The strain trigger"), so a strain break is preceded by the strain's own line ("tolerances are slipping.", "swap is filling up.", "it is jittery."), not by the Integrity warning; the maintainer reads them as warnings already, since they show only while the state is active (decided: on crossing the line in the state or on entering the state past it; EGG_PRESSURES, "Where the warning fires"). The wording stays.

## Overuse and owner strain (drafts, first pass)

Wording for the overuse rules (design: [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md), "Overuse and owner strain"). Same rules as above: lowercase log lines, no number, no state name, the egg's register, and the fault words from Failures. The basic lines show on every egg when an action past the line costs Integrity; the strain lines show only on the owner's egg, past the strain's warning line, as Iron's "> tolerances are slipping." does. Nothing here is read in context.

| Moment | Program | Iron | Wetware |
|---|---|---|---|
| Overfeed (a feed when full, every egg) | > buffer already full. the extra cost it. | > over capacity. the excess stung. | > it ate past full. that hurt. |
| Third overfeed (writes a cache file; replaces the overfeed line) | > overfed. corrupted cache file written. | > overfed. bit rot spreading. | > overfed. waste is piling up. |
| Overplay (a game past the line, every egg; inside Overlink the existing "first play at the top" cue replaces it, one line a game) | > link at limit. that game cost it. | > lock at limit. that one strained it. | > too wound up to play safely. that hurt. |
| Overheat (a game past the line, every egg) | > too hot to run clean. that cost it. | > past rating. that wore on it. | > it played too hot. that hurt. |
| Feed refused (after three overfeeds; Program's is 1.0's line) | > buffer full. refused. | > at capacity. refused. | > it is full. it turns away. |
| Owner strain past the warning line | > swap is filling up. it is thrashing. | > tolerances are slipping. (wear, existing) | > it is jittery. too much, too close. |
| Owner strain back under the line | > swap clearing. | > back within spec. (existing) | > it is calming down. |

**Readout words** (owner's egg only, while strain is past the line, as Iron's " · worn"): Program " · thrashing", Wetware " · frayed". Screen-reader values match. **Sprite mark (decided, maintainer, 2026-10-09): the seam on every egg**, the same mark as Iron's wear (one seam past the warning line, a second at heavy strain), so the readout word carries each egg's flavor. Per-egg marks (a stuck pixel for Program, a fray for Wetware) were rendered and not chosen: the stuck pixel reads as a tooth or highlight, the fray changes the outline (`docs/netling2-prototypes/shots/strain-marks-options.png`, `prototype/netling2/strain-marks-preview.html`). Placement is `seams.js`'s rule on all 66 forms, with Wired and Plat pinned by hand; the hidden forms the rule misses (Shell, Blank, Cipher) show no seam (maintainer: hidden forms may break the rules).

**Titles (hover):** Program "Thrashing: feeding it past full wears it down. Rest to recover." Wetware "Frayed: playing past its limit wears it down. Rest to recover." (Iron's: "Worn: running outside its range wears it down. Rest to recover.")

**One-time caption** (owner's egg, the first time strain passes the line, teen or later, as Iron's wear caption): Program "feeding it past full wears it. / rest lets it recover." Wetware "playing past its limit wears it. / rest lets it recover." (Iron's: "running too hot or too cold wears it. / rest lets it recover.")

**Field manual** (qualitative): on every egg, one line: "Feeding it past full, playing while Sync is nearly full or playing while hot each cost a little Integrity. Past full it takes only a few more, and the last spoils into the cache." On the owner's egg its strain line: Program "Feed it past full too often and it thrashes: infections come easier and its buffer overflows more, until it rests."; Wetware "Play past its limit too often and it frays: infections come easier and it burns through food, until it rests."

**Reviewed with the maintainer (2026-10-09).** Fixed: Iron's overfeed no longer says "surge" (Iron's LINE SURGE event; the word was dropped as a state name for the same reason); one line a game inside Overlink and one line for the third overfeed; Wetware's overheat line says the game was played; the field manual is one accurate line; Iron's Overdrive end is "> power back to rating." so "> back within spec." means only that wear has recovered (Pressure cues). Decided: Program's three basic lines all end "cost it" and Wetware's all end "that hurt" (one repeated signal per egg; Wetware's overfeed was "its stomach hurts"). The strain mark is the seam on every egg (decided; Readout words, below).

Open: "cyberpsychosis" is the maintainer's theme for Wetware's strain; in-game Wetware text stays plain (The eggs), so the word itself does not appear; "frayed" and "jittery" carry it. Program's "out of swap" likewise shows as "thrashing".

## Stage care and notifications (drafts, first pass)

Wording for the stage-care rules ([NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md), section 2) and the three notification classes (its section 2.6), plus a review of the strain readout words. Drafted 2026-10-09 for the maintainer to choose and edit; nothing here is implemented, read in context, read on a device or played. Rules followed, as above: lowercase log lines with `> `, sentence case for alert and notification text, button names in capitals, no state name and no hidden number, the egg's register (Program bureaucratic and technical, Iron physical and procedural, Wetware street-level and plain), the egg's fault word. Words kept out because they are taken: "reboot" (post-crash recovery), "defrag" (a bug-clearing candidate), "cool" (a care button), "drift" (Iron's virus), "true" and "out of true" (Iron's bugs), "worn" (Iron's wear readout), "fever" (Wetware's surge), "slip" outside a fault (Wetware's fault word), "spent", "drained" and "throttled" (the lockout readout words).

### The rest call

The call, the answer and its end follow the stage-care draft (section 2.5): the call fires, the nap button shows the egg's rest verb, answering in the first 30 minutes is on time, later in the 60 minute window is late, a lapse sets tired. The call line names no window (as 1.0's virus alert names none; the 30 minute on-time part stays hidden, as PATCH's does). The rest length is printed when the rest starts ("back in 25m"), as Iron's decided line does; it is the real random length, 20 to 30 minutes.

| Moment | Program | Iron | Wetware |
|---|---|---|---|
| Call (log) | > reset due. downtime requested. | > calibration due. (decided) | > it needs rest. (drafted earlier) |
| Answered, on time | > reset on schedule. back in 25m. | > calibrating on schedule. back in 25m. | > it lies down right away. back in 25m. |
| Answered, late | > reset started behind schedule. back in 25m. | > calibrating, overdue. back in 25m. | > it finally lies down. back in 25m. |
| Status while resting (readout, as 1.0's " · napping, 1h left") | " · resetting, 25m left" | " · calibrating, 25m left" | " · resting, 25m left" |
| Rest over | > reset complete. back online. | > calibrated. back online. | > it gets up, rested. |
| Woken early (WAKE UP during a call-rest) | > reset cut short. | > calibration cut short. | > it gets up too soon. |
| Lapsed (sets tired) | > reset window missed. running degraded. | > calibration missed. it runs sluggish. | > it never got its rest. it is running tired. |
| Tired clears (a rest of 20 minutes or a night) | > back to nominal. | > running smooth again. | > it has its energy back. |

The late line is neutral on purpose (the rule is neutral; only a lapse costs). Iron's decided "> calibrating. back in 25m." becomes the two answered rows; if one line for both is wanted, it stands as decided. Not drafted: a reminder before the lapse (the stage-care draft lists unanswered-call reminders as unmeasured; proposal: none, one notification a call).

**A collision to fix in 1.0's nap text.** The nap button's refusal says "not tired yet. 3h until it can nap again." (`src/sim.js`, kept in the fork). With a tired state in 2.0 that line would read as a statement about tired. Proposal, per egg: Program "no nap needed yet. 3h until the next.", Iron "no idle needed yet. 3h until the next.", Wetware "it is not sleepy yet. 3h until it can doze."

### Tired

Tired is not a meter, so its "meter word" is a readout word, as Iron's " · worn" is: the readout line carries it while tired holds, the screen-reader value matches, and the title explains it. No bar label changes and no sprite mark (it would compete with the seams and the state marks; the drain shows on the bars).

| | Program | Iron | Wetware |
|---|---|---|---|
| Readout word | " · degraded" | " · sluggish" | " · tired" |
| Screen-reader value | ", degraded" | ", sluggish" | ", tired" |
| Title (hover) | Degraded: it missed a reset. It drains faster and will not reach flow until it rests. | Sluggish: it missed a calibration. It drains faster and will not reach flow until it rests. | Tired: it missed its rest. It gets hungry and lonely faster and will not glow until it rests. |
| Field manual (qualitative) | Now and then it asks for a reset. Answer soon and it steadies; let the call pass and it runs degraded, draining faster, until it rests or sleeps. | Now and then it asks for calibration. Answer soon and it steadies; let the call pass and it runs sluggish, draining faster, until it rests or sleeps. | Now and then it needs rest. Let it lie down soon and it steadies; let the moment pass and it runs tired, getting hungry and lonely faster, until it rests or sleeps. |

Alternatives: Program " · lagging" (plainer, but lag is also a network word the netrun uses loosely); Iron " · uncalibrated" (ties to the verb, but at 12 letters it would be the longest one-word readout state; 1.0's longest is " · overclocked" at 11). Wetware's word is the plain word, as the rules ask.

### The baby

A baby drains at x2.4 and writes cache at x2 (stage-care draft, 2.1), so it is hungry and messy more often than any later stage. The lines say so once, as the stage's own explanation, then fall back to the ordinary ones. Proposal: the baby variants replace the ordinary alert and log line only while the netling is a baby; the alert keys and thresholds are 1.0's.

| Moment | Program | Iron | Wetware |
|---|---|---|---|
| Hungry (the charge alert, baby) | Charge is running low. New builds burn through it fast. | Power is running low. New units draw hard. | It is hungry. Babies eat a lot. |
| A cache file is written (log, baby) | > corrupted cache file written. new builds leak. | > bit rot spreading. new parts shed while they settle. | > it made a mess. babies do. |
| Cache piling up (the cache alert, baby) | Corrupted cache is piling up. Young processes leak fast. | Bit rot is spreading. New parts shed fast. | Waste is piling up. Babies make a lot of it. |

The ordinary lines (Alert lines; 1.0's "> corrupted cache file written.") return at the teen stage. Not drafted: baby chatter about food or mess (chatter is body lines shaped by temper, and each baby already has one base line in `body-lines.js`).

### The elder's "nothing to purge" line

PURGE with an empty cache returns 1.0's refusal "cache is clean." (no `> `, as the other action refusals). An elder writes cache at a quarter of the rate (decided), so it sees this refusal far more often than any other stage; its version says why, without a number.

| | Program | Iron | Wetware |
|---|---|---|---|
| Nothing to purge (every stage before the elder) | cache is clean. (1.0) | no rot to scrub. | nothing to flush. |
| Nothing to purge (elder) | cache is clean. it keeps it that way now. | no rot to scrub. old sectors hold. | nothing to flush. it keeps itself clean now. |

### Notification texts

1.0 sends one title per kind ("Netling needs you" with the alert line as body; "Netling wants something"; "A visitor pinged in"; "A contract came in"; "Netling is evolving") under one tag, so a new notification replaces the last (`src/notify.js`). 2.0 keeps that and adds the class (decided: Events, Care, Cooldowns; visitors never notify). Proposal: the title names the kind in the egg's register; the body is the alert line already drafted (Alert lines, and The break's alert lines), so a notification and the in-app alert never disagree.

| Class | Kind | Program title | Iron title | Wetware title | Body |
|---|---|---|---|---|---|
| Events | trace, intrusion, overflow | Netling: incident open | Netling: alarm raised | Netling needs you now | the alert line (Alert lines, keys trace, attack, overflow), with its minutes |
| Events | attention request | Netling: request queued | Netling: service call | Netling wants you | request text, below |
| Care | rest call | Netling: reset due | Netling: calibration due | Netling needs rest | rest call body, below |
| Care | stat alert (virus, charge, sync, heat, lights, cache) | Netling needs you (1.0) | Netling: check the gauges | Netling needs you | the alert line (Alert lines; the baby lines above while a baby) |
| Care | the break's warning (if it notifies; open in The break) | Netling needs you | Netling: check the gauges | Netling needs you | The break's alert line |
| Care | evolution | Netling is evolving (1.0) | Netling: refit complete | Netling is growing | evolution body, below |
| Cooldowns | netrun ready | Netling: netrun ready | Netling: netrun ready | Netling: netrun ready | cooldown body, below |

Bodies not drafted before:

| Body | Program | Iron | Wetware |
|---|---|---|---|
| Rest call | Scheduled reset requested. Press RESET. | Its readings have wandered. CALIBRATE it. | It can barely keep its eyes open. Let it REST. |
| Request, a game | It wants to play TUNE. (1.0) | It is asking for a run of TUNE. | It wants to play TUNE. |
| Request, a cool | It is running warm and wants a COOL. (1.0) | It is running warm and wants a VENT. | It feels warm and wants a CHILL. |
| Evolution | It recompiled into NAME. (1.0) | It was rebuilt as NAME. | It grew into NAME. |
| Netrun ready | Cooldown complete. The net is open. | Cleared to go out again. | It is ready to go out again. |

Notes:
- The surge is not here: it needs no answer, and 1.0 does not notify it. Contracts are not in a class yet (1.0 posts them only while the app is open, so a background notification is rare); proposal: Cooldowns, since they are a convenience.
- The NAME in the evolution body is the form's name in capitals, as 1.0 does. Evolution to an elder uses the same line.
- The Iron "check the gauges" title is the one place Iron's title differs between stat alerts and events; it tells an Iron player that nothing timed is running. Program and Wetware keep 1.0's split (events by kind, stat alerts "needs you").

### The strain readout words (review)

Proposal so far: Program " · thrashing", Wetware " · frayed", Iron " · worn". Checked against the forms, the other readout words and the log lines:

| Word | Fits | Watch | Recommendation |
|---|---|---|---|
| Program " · thrashing" | Matches its warning line ("it is thrashing.") and the field manual ("it thrashes"); real memory-pressure jargon. | Iron's Feast street adult is named Thrash, and its elder Swap ("swap is filling up"). Both are another egg's forms, so a Program player meets them only as visitors. | Keep. Alternatives if the collision matters: " · swapping", " · paging". |
| Wetware " · frayed" | Matches the title and the field manual ("it frays"); plain; carries the cyberpsychosis theme without the word. | The warning line says "it is jittery", so the log and the readout use two words for one condition. | Keep " · frayed" (the condition) and the decided line (the moment). If one word is wanted, " · jittery" in the readout is the smaller change. |
| Iron " · worn" | Physical; drafted first; matches "Worn:" in its title. | None found; 1.0 has no readout "worn". | Keep. |

None of the three collides with a readout word already in use (" · overclocked", " · overdrive", " · overlink", " · strained", " · spent", " · drained", " · throttled", " · in flow") or with the tired words above.
