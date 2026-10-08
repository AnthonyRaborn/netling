# Netling 2.0 care drafts

Status: first-pass proposals for step 1 of the sketch's next steps (per-egg meters and care buttons). Nothing here is implemented or playtested; the per-egg pressure the wording sits on is measured on the simulator ([NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md)). Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (decisions) and [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (page text and the same three registers).

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
- **Bug clearing goes through netruns (maintainer, first pass).** The control bar stays fixed. How is undecided: either a new node type in the existing netrun (the debug station anomaly in the sketch is one entry in the anomaly pool, which would grow into a node that needs rebalancing), or netruns split into a dive (JACK IN, the current expedition) and a market-like open mode. Scrip (15) and Standing (2, any split) remain the prices. Both options touch `netrun/` and its balance tools, so they come after the balance-bot update.

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
6. The balance tools model 1.0 only and need updating for the current rules before they can check any of this (maintainer, this session).

## Pressure cues (drafts, first pass)

Log lines for the states in the pressures doc, in the register of each egg. Every egg can enter both states (at x1 when it is not the owner), so every egg needs both rows. Cues must be visible: the player is never told a number. Unread in context.

| | Program | Iron | Wetware |
|---|---|---|---|
| Charge state begins | > buffers full and steady. boost mode on. | > mains steady. running above spec. | > well fed and humming. |
| Charge state ends | > boost mode off. | > back within spec. | > the hum settles. |
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

Open: the colors of the sparks and dots (the palette's accent is taken by Flow's outline, the heat color by the wisps); whether Iron's seams need a design pass per form (they sit on a sprite edge and 22 forms differ); a pre-state hint for new players (none is drafted).

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

Verified (marks.js and marks.test.js, 172 prototype tests pass): the marks step only on the 400 ms grid and never change faster, hold still in calm mode, occupy different places (no shared pixel), and the new ones never touch the body at any egg or level in the sampled drift. Not done: drawn in a real frame, a device check, any playtest.

Archive hints and chatter lines for the states are drafted in `NETLING_2_CODEX_DRAFTS.md`, State chatter and Archive hints. Open: whether strongly unsteady netlings should show the marks more nervously (rejected here to keep rule 1).

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

**Hover text (draft).** Numbers are the simulator's first guesses (12 Charge plus 15 scrip, or 2 Standing, any split; not tuned against the final pressure design) and 1.0 shows prices on market buttons, so these show them too.

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

Open: the clinic's share, fee and stock weights against the final design.
