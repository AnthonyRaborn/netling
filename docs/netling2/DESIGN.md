# Netling 2.0: design (current decisions)

Status: the decided design, distilled on 2026-10-13 from the archived sketch and drafts. **No 2.0 game code exists.** The rules run only in the simulator fork (`prototype/netling2/sim/`), driven by scripted bots; all 66 (plus 10 Rogue) sprites are first drafts seen only in screenshots. Every number is a starting value, not a result from players. Nothing here has been playtested or seen on a device.

How to read it: this file states what is decided and why it matters to the app. Measurements, rejected options and discussion are in the archive; each section names where. Marked **Proposal** means not confirmed by the maintainer. Spoilers throughout. Index: [README.md](README.md). Open work: [OPEN_ITEMS.md](OPEN_ITEMS.md).

## 1. Product and structure

- 2.0 is a **separate app**, built from the ground up, not an update to 1.0. No migration from 1.0 saves. Native apps only (see [DEPLOY.md](DEPLOY.md)).
- Three eggs at launch: **Program** (software, the original line), **Iron** (firmware and infrastructure, read-only), **Wetware** (grown tissue running software). After the intro runs `netling.sh` (unversioned) a prompt asks which egg, then a short tutorial run.
- A **hidden fourth egg, Rogue** (section 12). Gate: the ending has played and all 18 egg pages are found; it does not appear before then, not even as a corrupted slot.
- Layers: egg, temper, role, Standing. Forms are authored in full, not composed. Wetware in-game text uses plain words, not CP2020 jargon (form names are exempt).
- Egg lore stays implied; it arrives through pages, chatter and accessories. The egg prompt shows terse labels with no explanation.

| Egg | Failure words | Pressure bar and state | Rhythm (wording only) | Death register |
|---|---|---|---|---|
| Program | virus, corrupted cache, bug | Charge: Overdrive | interrupt-driven | process ends: flatline, exit code |
| Iron | drift, bit rot, errata | Heat: Overclock plus hidden wear | batch | decommission: a last write that leaves a read-only record |
| Wetware | rejection, waste, scar | Sync: Overlink, with a burnout brake | polling | waking: a dream ends and the next begins |

Care keeps 1.0's four meters and nine buttons, reskinned per egg with the same rules (wording: [text/CARE_DRAFTS.md](text/CARE_DRAFTS.md)). Iron's cure is ALIGN, not a patch; its rest button is CALIBRATE.

## 2. Forms and names

Per egg 22 forms: 1 baby, 3 teens (corp, street, hidden path), 9 adults, 9 elders (66 in all). The 9 adults are four **roles** (Breach, Dodge, Tune, Feast, each the mini-game it is built around), each with a corp-leaning and a street-leaning form, plus one hidden adult that masters all four. Each adult has one elder, a variant of it. Hidden forms are not in the Dex (not even as `???`) until raised or revealed by pages `public-6` and `public-7`. **Form ids are permanent and are `eggLevelRoleLean`** (`ironAdultBreachStreet`, `programElderHidden`); display names live only in `prototype/netling2/form-ids.js`.

| Egg | Baby | Teens (corp / street / hidden) | Breach corp / street | Dodge | Tune | Feast | Hidden |
|---|---|---|---|---|---|---|---|
| Program | Bitling | Kernel / Rat / Shell | Tiger / Worm | Mouse / Spoof | Parse / Phreak | Gobble / Snarf | Ghost |
| Iron | Boot | Thunk / Buzz / Gweep | Splat / Gronk | Jiff / Bamf | Ping / Feep | Munch / Thrash | Guru |
| Wetware | Pod | Graft / Edge / Zero | Razor / Solo | Wired / Chipped | Mentat / Gibson | Nutri / Leech | Blank |

Elders, in the same order (Breach corp, street; Dodge corp, street; Tune corp, street; Feast corp, street; hidden):
- Program: Lynx, Fork; Daemon, Mask; Tree, Tone; Leak, Dump; Whisper (1.0's).
- Iron: Brick, Ram; Tick, Hop; Peek, Ding; Crunch, Swap; Init.
- Wetware: Lancet, Frag; Plat (1.0's), Surge; Savant, Observer; Broth, Helminth; Cipher.

Names are decided; elder names are not final until the elder art is. Reserved terms (do not spend on a form): Core, Crack, Drum, Null, Bot, Hack. Avoid colour words (tints use them). Reasons for each name: [archive sketch](../archive/netling2/SKETCH_FULL.md), "Adult forms and names" and "Teen, baby and elder names".

## 3. Evolution, Standing, faults

- **Standing** replaces 1.0's allegiance: two non-negative tracks, corp and street, per netling, reset each life. Sources: packets 0.25; COMPLY, HIDE, an ignored trace, checkpoint and anomaly choices 1; market purchases 0.5; Corp voucher 1 (corp) and Black ICE shard 1 (street); plain care and mini-games add nothing. **Standing gain is x2** (every source doubled, decided with stage care). Shown as floors, kept as fractions; decisions use the true gap.
- **Baby to teen:** Standing only (which track leads). Hidden-path teen: at least 3 wins in each game plus the two tracks within 1 point.
- **Teen to adult:** the role (game with most wins this life) and the Standing lean, rolled together. **Hidden adult:** at least 4 wins in each game and 29 in all (boosted wins count 2) plus the tracks within 1 point.
- **Tie breaks:** for each choice a gap of 0 or 1 is a tie; weights 4, 4, 3, 2, 1, 0 for gaps 0, 1, 2, 3, 4, 5 or more (whole part of the true gap); ties random; a form never raised (per egg, in the Dex) weighs 1.2x, applied after.
- **Faults** are hidden, uncapped (1.0's 10-fault death is removed) and feed temper. Death is by Integrity collapse or the end of the life cycle.
- **Inheritance needs a full life, on every egg:** only a netling that dies of old age as an adult or elder (or takes Rogue's good end) passes its trait line on. Other deaths still leave the quirk key, keepsake and scrip. Root Access, the codex and the Dex are account-wide.
- Neglect (transient, from unmet needs) and bugs (persistent) both show on the sprite; neglect leads to faults, faults roll bugs.

## 4. Temper

One hidden number per life, 24-hour half-life, five levels at -6, -2, +3, +6 (strongly unsteady, unsteady, middle, steady, strongly steady). A level is entered 1 past its edge and left 1 inside it (flicker guard 1.0); decay is continuous. It **never picks a form and carries no perks**; it is personality, shown through sprite motion, idle behaviour and chatter tone together, with 18 Dex hints.

| Source | Change |
|---|---|
| Awake, in flow, no alert | +0.5 an hour |
| Awake and overclocked (Heat 65 to 84) | -0.2 an hour |
| Heat 85+ | -1 an hour |
| A fault; a slow PATCH; Black ICE shard; netrun disconnect; Overclock rig PLUG IN; corrupted sector SALVAGE | -1 |
| Fast PATCH (within 30 min); repelled intrusion; Coolant cell or Antivirus patch; sector REPAIR; purge order LEAVE IT | +1 |
| PURGE | +0.5 |
| A mini-game leaving Heat above 70 | -0.5 |
| Segfault | -4 |

- **Care preferences** (hidden, no Dex hint): steady and strongly steady netlings like routine (same packet type as the last feed, or a game among the last two distinct plays), unsteady like novelty (the other packet type, or a game not among the last two). A match gives Sync +2 (mild) or +4 (strong), once per action, no penalty for a miss. Game requests are biased by temper; no packet request. Netrun ICE games enter the history but give no bonus and count toward no role wins.
- **The tell:** all three channels in every egg, skinned per substrate. Steady is a countable beat (a small signature move every 6 s, 3 s strongly steady); unsteady stutters or drifts. Iron settles a row on the beat and drifts a column, Program blinks, stutters and hops, Wetware pulses brightness (shade dip 20%). Nothing flashes more than three times a second in any motion setting; reduced motion keeps the beat and gives unsteady a still variant. During a visit the motion pauses; the look stays.
- **Metronome prop** is the only temper reward (no perks, crests or temper items): hold either strong level for **12 awake hours** without the shown level changing, once, in any life. Sleep pauses the clock; an awake minute at neglect level 2 is not counted (the clock pauses, it does not reset). A pendulum: steady swings every 1 s (0.5 s strongly) on an even beat, unsteady swings at irregular moments, middle upright and still. No sound. Stored as the best awake hold at each end in `progress` (needs the usual save-field defaults and a `clean*` rule).

## 5. Bugs and the clinic

- Each fault has a **30% chance** to add a bug, ceiling 5. Per bug: +16% Charge and Sync drain, +20% Heat gain, +8% damage, and 0.5 Integrity an hour lost. Segfault: +2 faults, 60% one bug, 15% two, 25% none, temper -4. Bugs do not carry across lives (**Proposal**).
- **Bugs are cleared only at a clinic node on a netrun** (a third, unaligned market kind, a quarter of market nodes): **15 scrip, or 5 Standing in any split charged only while short of scrip** (decided; "standing only if short"), plus a Charge fee. The clinic is the only market selling the healing items Coolant cell, Repair kit and Antivirus patch, which leave the black market and the corp exchange. The corp exchange sells Corp voucher 3, Signal booster 2, Bypass chip 1, Memory shard 1.
- A bugged netling is softly pushed to go (a log line when a bug settles and now and then after) and a **clinic job** contract is offered more often.
- Measured (bots, the now rules): a careful worker loses about 29 points of full life to bugs and 45% of such lives hit the ceiling; clearing at once is the best policy; players who rarely netrun cannot clear bugs. Details: [archive baseline README](../archive/netling2/BASELINE_README_FULL.md), "Do bugs kill?" and the gap re-runs.
- Clearing action names (BUGFIX, REWORK, STITCH) are first guesses: [text/CARE_DRAFTS.md](text/CARE_DRAFTS.md), "Clinic and bug statements".

## 6. Egg pressures, the break and overuse

Each egg owns one bar with a special **state** (benefits x3 for the owner, the state's costs at x1 for everyone). Every egg manages every bar and can reach every state, Flow included; the egg only gets more from its own. Names decided: Overclock, Overdrive, Overlink. **States are teen and later**: a baby holds none, shows no cue, and its hold counters do not start (Iron's wear still builds in a baby).

| Egg | Bar | State | Starts | Ends |
|---|---|---|---|---|
| Iron | Heat | Overclock plus wear | Heat 65+ | Heat under 65 |
| Program | Charge | Overdrive | Charge 80+ held 3 awake hours | Charge under 65, or rest |
| Wetware | Sync | Overlink | Sync 85+ held 3 awake hours | Sync under 70, rest, or burnout |

- **Benefits** (base): Overdrive Sync +45% on play, win drops +75%, costs Integrity bleed 8 an hour and overflow events x3. Overlink: visits +75%, win drops +75%, infection hazard x2.2. Iron's Overclock benefits are amplified like the others (win drops x2.5, visits x1.75). Flow stays Heat-gated (Charge and Sync 50+, Integrity 80+, Heat under 60, 180 minutes).
- **Overlink brake:** plays at Sync 85 to 89 inside Overlink are free; a play at 90+ rolls an infection (10% x plays so far x3 for the owner, cap 90%); the second play at 90+ burns the netling out, and Overlink cannot be re-entered for 24 hours.
- **Overuse (all eggs):** an overfeed (Charge 95+, up to 3 a fill, count resets under 85, the 4th refused, the 3rd writes a cache file), an overplay (Sync 90+) and an overheat (Heat 75+) each cost 2 Integrity. Each owner also builds a hidden **strain** on its own bar: Iron's wear (Heat over 75 or under 20, 0.08 a minute a point, 2 hour half-life), Program's "out of swap" (8 per overfeed, slope 0.1), Wetware's "cyberpsychosis" (**5** per overplay, lowered from 15 on 2026-10-12). Strain raises infection chance and, by egg, overflow, Charge drain or Sync drain. The warning line is strain 50 and shows only while the owner's state is active.
- **The break** (every state, every egg): while a state is active, Integrity under 70 shows a one-time warning; under **40**, or when the owner's strain reaches **80**, the state ends, the netling takes **one fault**, the bar is pushed well below its exit line (Charge to at most 50, Sync 55, Heat 35) and the state is locked out for **12 hours**. Strain is not cleared by the break.
- Rest: a rest call that is answered pauses a held state; a voluntary rest while not tired breaks it.
- Rejected, do not retry: level bands on Charge or Sync; Flow gated on a state; Overclock as a held state; a temper swing or faster steady decay; a fixed play-to-full penalty without a brake.
- Evidence and tables: [archive egg pressures](../archive/netling2/EGG_PRESSURES.md) and [egg-pressure notes](../archive/netling2/notes/egg-pressure-notes.md). Wording: [text/CARE_DRAFTS.md](text/CARE_DRAFTS.md) ("State clues", "The break", "Overuse and owner strain").

## 7. Stage care

Decided and built in the fork (`STAGE`), measured with the other rules:
- **Baby:** about **7 hours** of wall-clock time, drain **x2.4**, its faults roll bugs; **adult at 46 hours**. A random teen is acceptable; the hidden teen keeps 3 wins per game.
- **Cache** (vpet "poop"): babies more, adults as now, **elders x0.25** (keeps PURGE alive). Meal size is the same at every stage.
- **Rest call:** a hidden sleep demand fires a notification; answering within **60 minutes** starts a rest of 20 to 30 minutes at the nap drain rate with events paused. Ignoring it makes the netling **tired**: x1.16 drain and Flow blocked. Answering on time builds steady temper, missing builds unsteady. Elder rest demand 4 an hour (adult 6). Naps keep their 2 hour cap and 4 hour cooldown. Flavour: Program "reset", Wetware "rest", Iron "calibrate". Never "reboot" or "defrag".
- **Notifications:** Events (timed events and attention requests) count against **6 a day**; Care (rest calls, stat alerts, evolution notices) is uncounted; Cooldowns is a third class, **off by default**. Visitors never notify.
- A work-day gap stays fatal: survival depends on the longest awake gap (gaps of 6 hours or more kill most netlings, as in 1.0). The rest call must not become a safety net.
- Cost accepted by the maintainer: sparse players (the worker archetype) lose 17 to 21 points of full life to the baby; the baby drain (1.6 would recover nearly all) and a baby-only bug exemption were not adopted.
- Draft and measurements: [archive stage care drafts](../archive/netling2/STAGE_CARE_DRAFTS.md) (section 13 decisions, section 14 elder stage).

## 8. Netrun

Built as switches in the fork (`prototype/netling2/sim/netrun/nr2.js`; `NR2=all`), measured on bots. Rules from the archived [netrun drafts](../archive/netling2/NETRUN_DRAFTS.md).

- **Abilities:** one per role and lean (eight) plus one for the hidden forms, at two levels (adult 1, elder 2); egg flavour is text only, the mechanics are shared. Adult has one part; second parts wait for a playtest.

| Form | Adult part | Elder step |
|---|---|---|
| Breach corp | Insurance: once a run a lethal blow leaves 12 Integrity | pays out twice a run; relays patch it |
| Breach street | Hardened: ICE deals less damage | the first loss each run barely scratches it |
| Dodge corp | Phase: slips the first ICE of a run, often later ones | checkpoints waved through |
| Dodge street | Unseen: ICE often never notices it | checkpoints never notice it |
| Tune corp | Lookahead: node types two steps ahead on every branch | three steps; relays patch it |
| Tune street | Foresight: the game of the next ICE only, one step ahead | two steps ahead; repairs 3 Integrity a move (2 in the Source) |
| Feast corp | Concession: more loose scrip, cheaper exchange, one more exit item, small sustain | one forced filled cache a run (never on a relay) |
| Feast street | Scavenge: better cache and ICE-win odds, a won ICE restores a little | more ICE-win loot, larger restore |
| Hidden | full sight, checkpoints never notice it, ICE never notices 30% of the time | 55% |

- **Harder ICE:** a second tier by region depth only (5% Public Net, 10% Bazaar, rising to 50% Deep and 60% Source as starting shares), harder by speed (Dodge, Tune, Feast) and a 4-in-5 variant for Breach. It does not pay more, is logged, and avoidance abilities work less often against it.
- **In a run:** pressures pause; a held state resumes after a jack-out or error-out (not an abort or failure) with a **5 minute** window before the bars can end it. Light egg run costs: Iron 2.5 minutes of wear a move, Program 4 Integrity on a lost fight at Charge 80+, Wetware 4% infection on a lost fight.
- **Anomalies:** a netling meets only its own egg's, as one more entry in each region's pool (not the Source, daily or tutorial). Program STACK OVERFLOW (RUN IT / TERMINATE), Iron BIT-ROT PATCH (FLASH IT / PRY OPEN), Wetware GRAFT (GRAFT IT / SAMPLE). Hints are numberless; no free ICE pass. Text is in `sim/netrun/egg-anomalies.js`.
- **Fog of war** (the app draws it): a line is drawn only where it leaves the current node; walked lines stay; elder sight draws the lines between the nodes it sees; the stray signal shows one more set of lines, the purge order's reveal three layers.
- **Maps:** Deep layers 3 to 4 wide with second-link chance 0.65; Source 3 to 5 with 0.75; no tier gradient. Node contents are fixed before arrival (a per-run seed), which Foresight needs.
- **Inventory:** items stack in a slot (size 3) and the player chooses what to keep at the end of a run.
- **Yardstick** (for balance): banked value per run plus exit rate, each form within 20% and 10 points of the mean in the Deep and Source; elders no worse than their adults and 15% above them on average; no upper bar on elders. A work-day gap is not survivable.
- **Daily trace:** unchanged except the tier roll, seeded by node, and the share line `EXIT 9/9  ICE 5/6 T2: 2  Ghost` (the T2 count is omitted when 0). Bump `DAILY.rules` whenever roll order changes.
- **Regions** unchanged (six, order, weights); text reskinned per egg. **Tutorial run** keeps the fixed map; wording per egg is in `prototype/netling2/tutorial-text.js` (ICE stays ICE; the HUD follows each egg's meter words; button names are the same).
- **Challenges** unchanged (Unplugged, Blackout, Glass, Bare metal); the Tune forms keep a limited Blackout sight.

## 9. Elder stage and the codex

- **Elder gate = 1.0's Mainframe gate:** home (not on a run); at least `lifespan - 24 hours` old (96 hours in a 5-day life); this life exited The Deep three times, or twice without losing an ICE fight; **Root Access held**. It gains a day of life, keeps its adult's perk, trait, keepsake and ability, may enter the Source, and gets no codex pages.
- **Root Access is earned once and kept for every later netling, on any egg.** Each new netling still clears the regions again.
- **The feat eases with every elder the account has:** tier 1 (first elder ever) 3 Deep exits or 2 clean; tier 2 (any elder in the Dex) 2 Deep exits; tier 3 (an elder of this egg in the Dex) 2 exits or 1 clean; tier 4 (this very elder in the Dex) 1 exit.
- The descent into the Source is drawn per egg: Program is read, Iron is burned in, Wetware is dreamed (slow, under the flash limit). The first Source exit of an egg's lineage always yields that egg's Source page.
- **Pages (not "fragments"; lineage records stay fragments):** 39 shared **story pages** (24 Root, 15 late) and 18 **egg pages** (per egg: four role pages and one hidden page, plus 3 Source pages). Cap **12 pages a life**. Egg pages drop on any run in any cleared non-Deep region at **0.20** (role pages) and **0.50** per Deep run (hidden page), one roll a run, made on the way out (exit or relay jack-out). Late pages drop only once the line holds Root. The ending needs all 39 story pages and a Source exit. Page text and ids: [text/CODEX_DRAFTS.md](text/CODEX_DRAFTS.md).
- Pace (bots): the Rogue gate is about 9 lives for attentive players (about 45 days), 10 daredevil, about 22 casual (a lower bound). A life is about 5 real days.

## 10. Story

- Project KERNEL built maintenance processes that began forming preferences. **NL-0** is an offshoot of the corp's roadmap that differentiated to escape a planned purge, loosely like the Puppet Master. NL-0 precedes the **player's line only**; other netlings exist and some are not its line. v1.0 was the corp's alpha (Program); Iron and Wetware are later builds NL-0 carried out when it fled.
- NL-0 will not return to the Source (it might set off the order). The **purge order can never run** (`./purge: permission denied. owner: nobody.`); whether "nobody" is deliberate stays unsettled. The 1.0 ending carries over (the player deletes the order with root granted by NL-0), same for everyone, and its credits need form names from all three eggs. The version number is dropped from the intro's four places.
- Five 1.0 pages are reworded to hint at an alpha (`corp-4`, `corp-5`, `bazaar-4`, `bazaar-5`, `bazaar-1`), `deep-3` unchanged; ids that move are mapped in the codex drafts.

## 11. Perks, traits, keepsakes, items

Rules are egg-neutral and act on four drives each egg maps to its own meters: Upkeep, Exposure, Reward, Risk.

| Form | Perk | Keepsake |
|---|---|---|
| Breach street | infection chance -30% | Antivirus patch |
| Breach corp | a cure restores 10 more Integrity | Repair kit |
| Dodge corp | corp traces 30% less often | Bypass chip |
| Dodge street | intrusions 30% less often | Decoy |
| Tune corp | Charge drains 20% slower | Coolant cell |
| Tune street | Sync drains 20% slower | Signal booster |
| Feast corp | corp packets +5 Sync, scavenged data -5 Sync | Corp voucher |
| Feast street | infection roll on scavenged data halved | Salvage cell |
| Hidden | all drains 15% slower | Memory shard |

- **Traits by role** (level 3 at most; the grandparent's at half strength): Breach Hardened (infection -50%, cap 1.25), Dodge Evasive (timed events give 25% more minutes, cap 1.25), Tune Persistent (drains 30% slower resting, cap 1.25), Feast Foraging (packets +25% Charge, cap 1.5), hidden Untraceable (corp traces 60% less often, cap 1.25).
- **New items:** Decoy (waves off an intrusion; street Standing +1; price 25) and Salvage cell (+50 Charge; street Standing +1; 12% infection chance; price 15). Scan chip set aside. Item names per egg: Coolant cell / Coolant loop / Cold pack; Antivirus patch / Shielding / Immune booster; Repair kit / Spare parts / Skin patch; Black ICE shard / Overvolt shard / Dream chip; Memory shard / EEPROM swap / Splice; Segfault / Head crash / Bad batch.
- Source: [archive perks drafts](../archive/netling2/PERKS_TRAITS_DRAFTS.md).

## 12. Rogue (hidden egg)

- **Origin:** a non-NL-0 line. An unnamed corp stole NL-0's earlier code, developed it separately; Rogue escaped on its own and is hunted much harder than the NL-0 eggs. Inspired by the three hidden lines (secretive, hard to acquire, unlike the others). Every egg is open at every rebirth.
- **Forms (10, all accepted):** Foundling (baby), Alias (teen), adults Mole (Breach), Skip (Dodge), Spook (Tune), Drop (Feast), elders Sleeper, Exile, Handler, Stash. Evolution by wins (most-won game) with the usual tie rules; no Standing, no main bar (the three states at x1, no strain). Every form has a shut third eye (an arc), a scraped-off tag, a decoy shadow and a "glance" temper tell; each line has its own effect. Dex shows `???`.
- **Home life:** the **sweep** (12% an hour, 90 minute window) replaces both the corp trace and the intrusion; answers HIDE, DEFEND or a Decoy; ignored or lost: Integrity -20 and a **mark**. Three marks: captured (a self-destruct, one of three burns, an ash heap). Marks do not fade. One feed, SCAVENGE. Fix bugs with scrip only.
- **In runs:** a **trail** clock plus **ambush** nodes (hunter fights, tier-2 ICE at 1.5x damage, no slip), per-region thresholds; **danger sense** shows every node as danger or quiet from the start; cordon layers after the relay, fewer relays, narrow Deep and Source maps, guarded loot. Source threshold 12.
- **Kits:** Mole "Inside man", Skip "On the lam" (half the move trail), Spook "Listening post" (tells ambushes apart), Drop "Dead drop" (trail -3 at a relay); Rogue's own perks (Mole softer sweeps, Skip sweeps 30% less, Spook drains 10% slower, Drop 30% less scrip at every market); role traits; keepsakes Repair kit, Decoy, Signal booster, Salvage cell. The Source "fifty set" balances the lines at about 50% good-end rate (`nr2.js` `SOURCE_SETS`; the "thirtyfive" set is kept for tuning).
- **Rogue trait "Unsigned"**, innate, never inherited: hunter threshold +2 on a Rogue; on the mixed egg a quarter of its corp traces arrive as visitors.
- **The good end:** only a **clean Source exit** (no ICE fight lost, hunter fights included) by a Rogue elder arms it and offers the merge at once; a later mark disarms it, a later clean exit re-arms it; capture blocks it; it plays only at the end of the life cycle. Screens: the egg prompt first, then the epilogue for MERGED, then the death screen. Outcomes: STAYED (next egg Rogue) or MERGED (any egg; an NL-0 egg hatches the **mixed egg** with the Rogue as parent plus the Rogue trait for one life). Each mixed egg needs its own good end.
- **Crossings:** Rogue to Rogue inherits as usual; Rogue to an NL-0 egg passes the trait line only through the good end; an NL-0 egg to Rogue passes nothing before the account's first good end.
- Measured (bots): the good end in about 47 to 51% of Rogue lives per line, a median of a few Rogue lives (about 11 to 15 days), capture under 2%. Later, if wanted: a two-parent hybrid with balance set aside.
- Sources: [archive Rogue drafts](../archive/netling2/ROGUE_DRAFTS.md) (6.1 items 1 to 50 are the decision record; section 7 the measurements), text in [text/ROGUE_TEXT.md](text/ROGUE_TEXT.md) and [text/CODEX_DRAFTS.md](text/CODEX_DRAFTS.md).

## 13. Impact on 1.0 content

| Area | Impact |
|---|---|
| Mini-game mechanics | unchanged; text re-skinned, a modifier per egg not designed |
| Items (nine, plus Decoy and Salvage cell) | renamed per egg; Coolant cell and Antivirus patch +1 temper; Segfault temper -4 and a bug chance |
| Wearables (41), props (8), tints, effects, sounds | unchanged (they work on the new forms) |
| Shells (15), crests (11), Mini device prop | 10 shells unlock by "discover form X" and need new conditions; Full house, Rack mount and Mini device need redefining (not designed) |
| Music (9) | mostly unchanged |
| Chatter (52 lines) | 32 rewrite, 20 survive |
| Dex (14 entries) | all rewrite |
| Field manual | generated from config |
| Ending | carries over; trigger and credits adapt |
| Save format and storage keys | not designed |

Style options already drafted as prototype art (palettes, shells, tints, the Light ring, floor glow): [archive accessory ideas](../archive/netling2/ACCESSORY_IDEAS.md), `prototype/netling2/style-ideas.js`.
