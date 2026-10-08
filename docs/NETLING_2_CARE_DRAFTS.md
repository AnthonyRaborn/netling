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
2. Bug clearing in netruns: the maintainer's direction is a clinic, a third unaligned kind of market that fixes bugs and sells the healing items (see the prototypes README, The clinic); names for it per egg are not drafted (Program clinic or repair shop, Iron workshop, Wetware clinic).
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
| Penalty hit (infection from a play) | > overloaded. !! virus signature detected. | > overloaded. !! drift detected. | > too wound up. !! rejection setting in. |
| Wear passes the warning line (Iron only) | none | > tolerances are slipping. | none |
| Wear from running cold (Iron only) | none | > running cold. it stiffens. | none |

Wear exists only on Iron, so those two rows have one line. The two Iron lines are the simulator's text. The Charge state's cost (overflow, Integrity bleed) already has existing overflow and decay text.

## Clinic and bug statements (drafts, first pass)

The maintainer's direction: bugs are cleared at a clinic node on a netrun (a third, unaligned market kind that also sells the healing items), and a bugged netling softly pushes its player to go: it says so, and a clinic job is offered (see the prototypes README, The clinic and Soft push to run). Names per egg follow the registers above; the simulator uses the generic wording. All lines are the Wetware-plain or Iron-physical or Program-technical voice and have not been read in context.

| | Program | Iron | Wetware |
|---|---|---|---|
| The node | repair shop | workshop | clinic |
| A bug settles in | > a bug has crept in. a repair shop out on the net can patch it. | > out of true. a workshop out on the net can rework it. | > something is wrong under the skin. a clinic out on the net can stitch it. |
| Three or more bugs | > it is riddled with bugs. find a repair shop. | > badly out of true. find a workshop. | > it is badly scarred. find a clinic. |
| A reminder, now and then | > still buggy. repair shops are out there. | > still out of true. there are workshops out there. | > still sore. there are clinics out there. |
| The job (contract text) | get a bug fixed at a Public Net repair shop | get a bug reworked at a Public Net workshop | get a bug stitched at a Public Net clinic |
| Fix button | FIX A BUG | REWORK | STITCH |

Open: whether the three healing items keep their egg names there (Coolant cell / Coolant loop / Cold pack; Repair kit / Spare parts / Skin patch; Antivirus patch / Shielding / Immune booster); the clinic's look on the map; whether the corp exchange should stock something in place of the healing items (the maintainer will revisit it).
