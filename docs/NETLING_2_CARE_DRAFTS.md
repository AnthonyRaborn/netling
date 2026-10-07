# Netling 2.0 care drafts

Status: first-pass proposals for step 1 of the sketch's next steps (per-egg meters and care buttons). Nothing here is implemented, playtested or measured. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (decisions) and [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (page text and the same three registers).

## Frame (maintainer answers, first pass, not set in stone)

- **Reskins are enough.** Every egg keeps 1.0's four meters, the cache, and the same rules. Only names, log lines and alert text change. Lineage, traits, Standing, temper, bugs and the simulator stay shared.
- **Rhythm is flavor.** Interrupt, batch and polling are wording, not clock changes. Drains, windows and event chances are 1.0's.
- **The button count stays fixed:** nine control buttons (feed, feed, play, cure, cool, purge, netrun, nap, lights) plus the event-bar buttons (two trace answers, DEFEND, PURGE) and GREET. Names change, the layout does not.
- **Extra pressure per egg is open.** Program reuses 1.0's. For Iron (drift) and Wetware (rejection) this draft uses them only as names for existing things (see Failures), so a real extra mechanism is still undecided.

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
| PATCH (cure) | PATCH | RECAL | TREAT | corrective |
| COOL | COOL | VENT | CHILL | corrective |
| PURGE (cache, overflow) | PURGE | SCRUB | FLUSH | corrective |
| NETRUN | NETRUN | NETRUN | NETRUN | perfective |
| NAP | NAP | IDLE | DOZE | adaptive |
| LIGHTS OFF | LIGHTS OFF | LIGHTS OFF | LIGHTS OFF | adaptive |

Notes:
- The two feeds keep the corp and street flavor because they carry Standing (0.25). MAINS is clean supplied power and SALVAGE is scavenged; VAT MIX is corp-grown and SCRAPS is street.
- Iron is read-only and cannot be patched, so its cure is a recalibration, which fits its failure model. The rule (cure the infection, Integrity +10, temper +1 within 30 minutes, -1 later) is unchanged.
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
- Wetware's rejection is the sketch's failure model used as the name of the virus. It is not yet a mechanism that grows with augmentation (open).
- **Unresolved UI:** the button count is fixed, so bug clearing (15 scrip, or 2 Standing in any split) needs a home that is not a new control button, for example the readout or the inventory area. Not designed.

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
| virus | Virus detected. Patch it before Integrity collapses. | Drift detected. Recalibrate before it wears through. | Rejection setting in. Treat it before Health collapses. |
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
| Cure within 30 min | > patch applied. clean. | > recalibrated. drift gone. | > treated early. it settles. |
| Cool | > coolant flushed. | > vented. fans spin down. | > chilled. the fever breaks. |
| Purge | > cache cleared. | > scrubbed. sectors good. | > flushed. it breathes easier. |
| Nap | > nap over. back online. | > idle ended. back online. | > it wakes from a doze. |

## Open

1. Whether Iron and Wetware get a real extra pressure (a drift or rejection mechanism) or stay pure reskins. Wetware's rejection is the one most tied to wearables, and that is a content choice.
2. Where bug clearing lives with a fixed button count.
3. Names: SHUTTER, SIGN OFF, DUCK, SUBMIT, INVADER, FIGHT, HAIL, WAVE, VAT MIX and SCRAPS are first guesses; HIDE and COMPLY keep their Standing meaning (street, corp) under every name.
4. The Dex hints for temper and the chatter use these words, so they follow once the names settle.
5. Everything here is untested: label widths on the real control bar, the readout line length, the field manual (generated from `CFG`, so it needs egg-aware text).
6. The balance tools model 1.0 only and need updating for the current rules before they can check any of this (maintainer, this session).
