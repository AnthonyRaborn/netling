# Netrun rules in the 2.0 simulator fork: what was added, what was measured, what is stale

Written for step 2 of the sketch (netrun content per egg). Companion to `docs/NETLING_2_NETRUN_DRAFTS.md` (the design, with its decided and proposed parts) and `docs/netling2-prototypes/README.md` (the fork's older rules and tables). Everything here is simulator output: scripted players with one skill number, starting values that were not tuned, and an assumed cost for harder ICE. Not run: `npm run smoke`, any device, any playtest.

## 1. What was added (all off by default, so the earlier tables reproduce)

`sim/netrun/nr2.js` holds the switches and every starting value. `NR2='{"abilities":true,"tiers":true,"eggCost":true}'` or `NR2=all` turns them on; any value can be overridden the same way (`NR2='{"tier":{"scale":1.5}}'`). Checked: with everything off, `proto:balance` JSON for casual, attentive and worker is byte-identical to before the change.

| Switch | What it does | Decided (maintainer) or mine |
|---|---|---|
| `abilities` | One ability per role and lean, adult at level 1 and elder at level 2 (breach corp insurance, breach street hardened, dodge corp phase, dodge street unseen, tune corp lookahead, tune street upkeep at the elder level, feast corp concession and the forced cache at the elder level, feast street scavenge, hidden follows Ghost and Whisper) | Structure and themes decided; every number is 1.0's constant, untuned |
| `tiers` | A tier 2 of ICE rolled per fight by region share (placeholder shares 0.05 in the Public Net to 0.60 in the Source; the maintainer wants few harder fights in the shallow regions); logged and counted; seeded by node in the daily trace; avoidance abilities work less often against it (adult 0.5, elder 0.75 of normal) | By-depth, speed lever, Breach 4-in-5, no extra pay: decided. Shares, 0.5 and 0.75, the speed 1.25: mine |
| `eggCost` | Light run costs: Iron's wear keeps building from run Heat, Program's lost fight at high Charge bleeds 4 more Integrity, Wetware's lost fight rolls a 4% infection | Light costs decided; sizes mine |
| `graceMin` (5) | After a jack-out a held Overdrive or Overlink cannot be ended by the bars for 5 minutes | Decided. An error-out also gets it in the design; the fork has none, so only a jack-out does |
| `forcedCache` | The Feast corp elder gets one filled cache a run, placed in the layer after the one before halfway; may displace any node **except a relay** (`relaySafe` is true) | Interval decided; never a relay: decided after the first run (section 3) |

**Parity yardstick (settled at the maintainer's request; my proposal, veto welcome).** Banked value per run, in common items (items plus scrip over 15; a disconnect banks nothing), with the exit rate. Bar, in the Deep and the Source with careful play and ICE tiers on, at both levels: every form's value within 20% of the mean, every exit rate within 10 points of the mean, each elder no worse than its own adult, the elder level's mean value at least 15% above the adult level's. `netrun-sweep.mjs` prints the read-out. First reading (400 runs, ICE tiers on, placeholder numbers): Deep, adult level, Tune corp, Tune street and Feast corp are more than 20% below the mean value and Breach street, Dodge corp and the hidden form more than 20% above; at elder level Feast corp and Feast street are low and Breach street and Dodge corp high; the elder level's mean value is 1.24 times the adult's in the Deep and 1.35 times in the Source, so that bar is met, and no elder is worse than its own adult now that the cache keeps the relay. The Feast forms are the clearest gap: their loot parts are too small to match what the defensive forms bank by surviving.

Other changes to the fork: the codex cap is 12 (decided; was 8), Root Access arrives mid-life when the codex completes (`CFG.rootMid`, decided), the elder feat can follow the account (`CFG.featFor`, used by `lineage-sweep.mjs`), `simulate` returns the final `form`, `POSTRUN=skip` makes a bot not top Charge up again after a netrun, and `infect` is exported from `sim.js`. `npm run proto:test` is 217 tests (it was 190); `npm test` is 503, unchanged.

Not modelled: Tune street's Foresight (the bots have one skill number, so knowing an ICE's game changes nothing for them), the fog change (a drawing change; the bots plan from the rules and are not affected, which is why it can wait for the 2.0 app), the share line, the Breach variant's real difficulty (an assumed win-chance drop), and an error-out.

## 2. New commands

| Command | What it answers |
|---|---|
| `node prototype/netling2/sim/netrun-sweep.mjs [runs] [regions] [styles]` | Disconnect, exit, items, scrip, Integrity spent, hard fights, slips and forced caches per form at both levels, for each of `CASES` (NR2 overrides). Prints a parity read-out (mean and spread of the disconnect rate over the forms). `FORMS=none` is no ability; `EGG=iron|program|wetware` switches that egg's pressure on |
| `node prototype/netling2/sim/lineage-sweep.mjs <archetype> [lineages] [lives]` | Lives to finish the 18 egg pages (three eggs in a row), root life, first elder life, with the decided rules (cap 12, Root mid-life, the four feat tiers, page rates 0.20 and 0.50, first Source exit guarantees the page). `FEATS=1.0` uses 1.0's feat for every elder. Replaces `lines.mjs`, `lines2.mjs`, `rogue.mjs` and `rogue2.mjs` for questions on the fork |
| `node prototype/netling2/sim/grace-sweep.mjs [lives] [archetypes] [graces]` | How often a run ends a held Overdrive or Overlink, by grace window |

## 3. Results (preliminary; starting values)

### Parity of the abilities, careful play, 500 runs a cell (about plus or minus 2 points at 30%)

1.0's bar was no adult more than about 4 points apart in The Deep, and the five mainframe upgrades close together in the Source (24 to 28%). Disconnect rate over the nine forms, with abilities on and no ICE tiers:

| Region | Level | Mean | Lowest to highest | Spread |
|---|---|---|---|---|
| Ruins | adult / elder | 5.7 / 4.4 | 1.6 to 9.6 / 0.4 to 10.8 | 8.0 / 10.4 |
| Deep | adult / elder | 24.0 / 21.5 | 13.2 to 34.0 / 10.0 to 42.8 | 20.8 / 32.8 |
| Source | adult / elder | 40.5 / 38.5 | 26.8 to 53.4 / 25.2 to 65.2 | 26.6 / 40.0 |

The spread is far from 1.0's bar, and it is structural. The forms with a defensive hook (breach, dodge, hidden) sit at 13 to 19% in the Deep, and the forms whose ability is information or loot (tune corp 30%, tune street adult 34% because Foresight does nothing for a bot, feast 34%) sit near the 34% of no ability. That is not a tuning slip: it follows from the themes. Whether disconnect rate is the right yardstick for Feast, whose value is loot, is a design question (the sweep also prints items and scrip: Feast corp earns 2.4 scrip a Deep run against 1.5 to 2.9 for the others).

Elders are only a few points better than adults on average (Deep 21.5 against 24.0, Source 38.5 against 40.5), where 1.0's mainframes were 11 to 14% in the Deep and 24 to 28% in the Source. The elder level is too weak, mostly because the stepped values are small and the second parts that need map features (checkpoints, markets) do nothing in the Deep and the Source.

With ICE tiers on at the placeholder shares, the Deep rises by about 4 points (mean 28.4 adult, 25.3 elder) and the Source by about 6 (46.4 and 43.6).

### The forced cache displaced the relay, so it no longer may (decided)

Feast corp elder, careful, 1500 runs, disconnect rate in Ruins, Deep and Source, and items banked in the Deep:

| Rule | Ruins | Deep | Source | Items (Deep) |
|---|---|---|---|---|
| No forced cache | 8.5% | 35.7% | 51.7% | 1.43 |
| Forced cache, may displace the relay (measured) | 10.6% | 42.9% | 64.0% | 1.85 |
| Forced cache, relay kept (now the rule) | 7.7% | 34.5% | 52.6% | 1.74 |

The cache lands in the layer that holds the map's guaranteed relay, so letting it displace the relay cost 3 to 11 points of disconnect rate for 0.4 more items. The maintainer ruled that it never displaces a relay. With the relay kept it costs nothing and gives 0.3 more items than no cache.

### Harder ICE: the shares barely move the disconnect rate unless the harder tier also hits harder

No ability, careful play, 800 runs, disconnect rate in Public Net, Corp Grid and Deep. The placeholder shares are 0.10, 0.25 and 0.50. Tier 2 costs a flat 0.10 of win chance (the assumption in `nr2.js`).

| Case | Public | Corp | Deep | Hard fights a run (Public, Corp, Deep) |
|---|---|---|---|---|
| No tiers | 4.6% | 4.8% | 35.0% | none |
| Tiers, same damage | 4.4% | 6.3% | 40.0% | 0.15, 0.37, 1.37 |
| Tiers, 30% more damage | 5.1% | 7.5% | 45.1% | 0.14, 0.36, 1.33 |
| Tiers, 60% more damage | 5.6% | 8.1% | 56.1% | 0.14, 0.36, 1.27 |

The shallow regions barely notice tier 2: a careful player meets about 1.5 ICE a run in the Public Net, so a 10% share is 0.15 fights, and a lost fight at 35 damage rarely disconnects. If the harder tier is meant to be felt in the shallow regions, speed alone (as modelled) is not enough: it needs a much larger share there or extra damage. This is the main finding for the open question on damage and rewards.

### Pacing (lineages of 10 lives, 80 lineages, medians; p10 to p90 in brackets)

Lives to finish all 18 egg pages across three eggs. The page rates are the decided 0.20 and 0.50, the cap 12, Root mid-life, the guaranteed Source page. The forms have the abilities unless stated. "Feat tiers" means the easier elder feat for each elder the account has.

| Setup | Attentive | Casual |
|---|---|---|
| No abilities (every form has none; this is the fork's old baseline, not a valid 2.0 baseline) | 10 (7 to 14) | 32 (18 to 55) |
| Abilities, 1.0's feat for every elder | 9 (6 to 12) | 24 (12 to 44) |
| Abilities, feat tiers | 8 (6 to 11) | 15 (10 to 22) |
| Abilities, feat tiers, ICE tiers at the placeholder shares | 8 (6 to 12) | 21 (13 to 31) |
| The same, with the 2.0 page list (24 Root, 15 late; 100 lineages, shallower tier shares) | 9 (7 to 13) | 22 (14 to 35) |

Reading it. The abilities matter a lot for pacing, because without any ability the Deep is a wall (35% disconnects) and the first elder comes late. The feat tiers matter most for casual play (24 down to 15). ICE tiers at the placeholder shares cost casual play about six lives and attentive play none. Casual first-elder reach is 51% with ICE tiers against 73% without. The 2.0 page list costs about one life (more Root pages to find in the same cap). Limits: 80 to 100 lineages, bots, and ICE tiers that cost an assumed win chance. The three-egg totals also exclude the ending's 39 story pages and the Source's story pages.

### The grace window cannot be resolved by this simulator

`grace-sweep.mjs` compares windows of 0, 5, 15 and 30 minutes and finds no difference. The bots act in one instant at a check-in and top Charge up before it ends, so a run almost never leaves a held state at risk (0.63 runs a life end below the exit line, and none of those states then ended within 30 minutes). With `POSTRUN=skip` (no top-up after a run) a held state is lost soon after a run 0.08 times a life, again with no difference between 0 and 30 minutes, because the next action is hours away. The window is a real-time question of seconds to minutes; the bots have no clock that fine. Treat it as a design rule, not a measured one.

## 4. What was stale, what is updated, what is not

| Item | Status |
|---|---|
| 2.0 run abilities, ICE tiers, forced cache, grace, egg costs | Added this stretch (section 1) |
| Codex cap 12, Root at once, elder feat tiers, page rates 0.20 and 0.50, first-exit Source page | Updated in the fork (defaults and `lineage-sweep.mjs`); the older drivers in `docs/netling2-prototypes/` still run on a scratch copy of 1.0 |
| The Root list | **Updated.** `sim/codex2.js` holds the 24 Root pages and 15 late pages by region as in `docs/NETLING_2_CODEX_DRAFTS.md` (late pages drop only once Root is held; the Source opens on `deep-6`). The 18 egg pages stay rates in `lineage-sweep.mjs` |
| The ending's 39 story pages and the Source story pages | **Tracked** in `lineage-sweep.mjs` (section 14): the pages drop in the fork already (`codex2.js`); the sweep now times the ending and the Rogue gate |
| Older fork tables (role, hunters, temper seekers, noisy players, bug policies, clinic, push, gap, human, fidelity, steerers, the clinic against the final pressure design) | **Refreshed** with `NR2=all` (abilities, ICE tiers, light costs), cap 12, Root mid-life and the 2.0 page list; the figures are in `docs/netling2-prototypes/README.md`. Most agree with the earlier ones within noise. Moved by more than noise: casual and worker end more unsteady, the Segfault route reaches the bug ceiling more often (14% against 5%), survival at 4 and 5 hour gaps is lower (the earlier gap table predates the stronger bugs), and the human-casual and human-keen full-life rates fall (4% and 65%, from 8% and 72%) |
| Egg pressure sweeps (`iron-sweep`, `sides-sweep`, `band`, hint sweeps), exchange stock | Not re-run: the netrun changes do not touch them; rerun the pass bar with `NR2.eggCost` once the cost sizes are chosen. The clinic against the final pressure design was re-run (README) |
| The scratch-patch drivers in `docs/netling2-prototypes/*.mjs` | Superseded on the fork for pacing; left as they are for the 1.0 patch |
| The fog change, the share line, Foresight | Not simulable here (section 1) |
| `bug-sweep`, `clinic-sweep` assumptions on healing stock | Unchanged by this work |

## 5. Which sims can test the undecided balance questions

| Open question (NETLING_2_NETRUN_DRAFTS.md) | Tool, and the knob | Can it answer? |
|---|---|---|
| Tier shares by region; speed; whether tier 2 should hit harder or pay more | `netrun-sweep` with `CASES` on `tier.scale`, `tier.share`, `tier.speed`, `tier.winPerSpeed`, `tier.damageMult`; `lineage-sweep` for pacing | Shape yes. The size of a speed penalty on a human is an assumption: it needs a game-playing bot or a playtest |
| Breach 4-in-5 and a timer refund | `tier.breachPenalty` and `tier.breachRefund` | No: the cost is assumed. Needs a Breach-playing bot or a playtest |
| Avoidance weaker against tier 2 (adult and elder) | `tier.avoid` | Yes, as a rate |
| Forced cache: how many a run (the relay question is settled: never displaced) | `forcedCache.perRun` | Yes |
| Second parts and the elder level | `ab.*` values, parity read-out | Yes, for hooks the bot uses; no for Foresight and for checkpoint and market parts in regions without them |
| Is disconnect rate the right yardstick for Feast and Tune | `items` and `scrip` columns of `netrun-sweep`, plus a lives run (`balance.mjs` with `NR2=all`) | Partly: needs a decision on the yardstick |
| Egg run cost sizes | `cost.*` with `EGG=` in `netrun-sweep`, then `sides-sweep` / `balance.mjs` pass bar (ordinary archetypes unchanged) | Yes |
| Pace of the Rogue gate with the new netrun | `lineage-sweep` | Yes, with the caveat on the Root list |
| The 5 minute window | `grace-sweep` | No (section 3) |
| Challenges under the new abilities | none | Not tested; the fork's challenge code is 1.0's and the bots can run a challenge (`style.challenge`) but nothing here does |
| Foresight's value; Tune street at adult level | none | No: needs per-game skill in the bots |
| Whether harder ICE should pay more | `netrun-sweep` items and scrip with a pay knob (none yet) | Not yet: add a pay knob when it is decided |

## 6. Feast tuning (first pass, against the settled yardstick)

The maintainer's instruction: tune Feast first, and expect the sight-based abilities to be hard to tune with bots, because their job is to give a human more information. Values are now in `nr2.js`; the parity read-out of `netrun-sweep.mjs` is the check (800 runs a cell, careful play, ICE tiers on).

What was tried, as value against the mean of the nine forms (Deep adult / Deep elder / Source adult / Source elder), Feast corp and Feast street:

| Variant | Feast corp | Feast street |
|---|---|---|
| Starting values (loot odds 0.5/0.3 and 0.55/0.4, scrip +2, forced cache once) | 78 / 74 / 72 / 64% | 84 / 73 / 76 / 62% |
| Bigger loot odds only (0.7/0.45 and 0.8/0.6), scrip +6 and +8 | 82 / 80 / 75 / 68% | 97 / 84 / 90 / 77% |
| Scrip +14 and +20 (and loot odds 0.8/0.55, 0.9/0.8) | 92 / 93 / 81 / 77% | 103 / 92 / 102 / 89% |
| **Chosen:** street odds 0.7/0.45 then 0.9/0.8; corp scrip +6 then +8 and one extra item at the exit; the forced cache up to three a run, every 3 layers | 92 / 108 / 77 / 78% | 96 / 90 / 90 / 89% |

Findings:
- **Scrip is a weak loot part.** The yardstick values 15 scrip as one item, and a run banks scrip only on surviving, so +14 scrip at the exit did far less than +1 item. Feast corp gained its value from an **extra company-store item at the exit** (a proposal; the decided part was "more loose scrip and a cheaper exchange"), and from the forced cache.
- **More than one forced cache is what lifts the corp elder.** Three a run (every three layers, so two in the Deep and three in the Source) takes the elder to 108% in the Deep. The caches also replace ICE nodes, so the route is safer: its disconnect rate falls from 40% to 34% in the Deep. In the Ruins, though, the corp elder reaches 137% of the mean value, because the region is safe and the caches are free items; flag.
- **Feast street needs very high odds.** Cache find 0.7 (adult) and 0.9 (elder) against the 0.4 of everyone else, ICE-win loot 0.45 and 0.8 against 0.2. That is what the yardstick asks for; it is large, so check it against the loot economy before keeping it.
- **Still short:** Feast corp in the Source, adult 77% and elder 78% of the mean value. The cause is survival (57% disconnects there against about 40% for the mean), not loot.
- **The exit-rate bar cannot be met by a loot form.** Feast forms exit 22% of Deep runs against a 33% mean, because they have nothing that keeps them alive. That also lowers how often a Feast netling meets the elder feat. Options: relax the exit bar for forms without a defensive part; or add a small sustain part. The sustain part was measured: a won ICE restoring 12 Integrity at the elder level (6 at the adult level) takes Feast street to 101 / 96 / 105 / 96% and lifts its Deep exit rate to 24 / 29% and its Source elder exit rate to 12.6%. `ab.scavenge[level].winHeal` holds it (set to 0, off) for the maintainer to decide.

**Forced cache count (decided: one a run; re-run after the maintainer asked whether one was enough).** The "Chosen" row above set three a run while tuning Feast, before the relay rule and the later changes; `nr2.js` has carried `perRun: 1` since. Re-run with `netrun-sweep.mjs` (800 runs a cell, careful, abilities and tiers on, all nine forms, `forcedCache.perRun` 0, 1, 2, 3; `CASES` as in the usage line). Feast corp elder, banked value as a share of the nine elders' mean, with its disconnect rate:

| Caches a run | Public | Bazaar | Corp | Ruins | Deep | Source |
|---|---|---|---|---|---|---|
| none | 131% | 136% | 128% | 113% | 98% (36.5% disc) | 95% (51.9%) |
| 1 | 157% | 164% | 153% | 129% | 118% (35.8%) | 103% (53.4%) |
| 2 | 170% | 178% | 171% | 136% | 130% (32.8%) | 111% (51.8%) |
| 3 | 170% | 178% | 171% | 136% | 130% (32.8%) | 117% (50.5%) |

Two and three are the same everywhere but the Source, because the shorter maps run out of middle layers. One keeps Feast corp inside the 20% band in the Deep and the Source, which is where the bar is set; two takes the Deep to 130% for 3 points less disconnect. The excess in the shallow regions comes mostly from the concession and the exit item, not the cache (none is already 113 to 136%). The Source figure with one cache is 103%, not the 78% of the "Chosen" row: Feast corp's won-ICE sustain (`concession[2].winHeal` 18) is in `nr2.js` now and the row was measured without it, so do not read that row as current. I did not re-run the row to prove this is the whole difference. Not covered: bots only, one skill number, careful play.

Tune forms, per the maintainer's note: Tune corp (types two steps ahead, relay patch at the elder level) is 20% or more below the mean in the Deep at the adult level and at the elder level; Tune street at the adult level (Foresight, which the bots cannot use) is low in both regions, as expected. These are not a tuning target for the bots: the read-out is a floor for them, and the real check is a playtest of what the extra information does for a person. The fog change (lines only from the current node, elder sight showing lines) makes sight worth more to a human and nothing to a bot, so it widens this gap.

Remaining outliers on the yardstick (800 runs): Breach street is more than 20% above the mean at both levels in the Deep and the Source (it is the strongest form); the hidden form is high at the adult level; Dodge corp is high at some cells; Tune corp and Tune street are low. These are the next things to tune once the Feast question (sustain or a relaxed exit bar) is answered.

## 7. Inventory (decided: stacks plus a choice at the end of a run)

The maintainer felt in 1.0 that there are too many items and that the end-of-run discard takes away choice. Measured first (`sim/item-sweep.mjs`, lives, 120 to 150 a cell, ICE tiers and abilities on): about a third of all items granted are scrapped because the six slots are full, even though the bots sell surplus and scrap at home perfectly (attentive 82 granted and 30 scrapped a life, casual 55 and 20, Feast street 87 and 37). More slots barely help (10 slots: 36% down to 33%) because far more come in than are used; stacking helps most.

Decided (maintainer): items of a kind stack in a slot, and at the end of a run the player chooses what to keep, for 2.0. Built as switches (`NR2.inventory`, on with `NR2=all`; `NR2.inv.stack` is 3 as a starting value, mine):
- **Stacking.** Each slot holds up to `stack` items of one kind, and **a further copy opens another slot of the same kind** (six slots at stack 3 hold eighteen of one kind). `slotsUsed` and `hasRoom` in `sim.js`.
- **The choice.** At jack-out the loot and what is already carried compete for the slots: the best are kept and the rest are scrapped (a quarter of price). A bot keeps what it has a use for, then by price; a person chooses.

Results (scrapped share of items granted, attentive / casual / Feast street):

| Setting | Scrapped share | Scrap scrip a life (attentive) |
|---|---|---|
| 1.0: one to a slot, auto-scrap in the order found | 36% / 35% / 42% | 116 |
| One to a slot, with the choice | 36% / 33% / 41% | 103 |
| Stack 2, with the choice | 21% / 20% / 26% | 63 |
| **Stack 3, with the choice** | 14% / 13% / 21% | 41 |

The choice does not cut the count of scrapped items; it changes which ones: it scraps the cheap ones and keeps the dear ones (scrap scrip falls 12% at one to a slot), which is the feel the maintainer asked for. Stacking is what cuts the count. At stack 3 a bot holds up to 13 items at its peak.

**What this means for the yardstick.** `netrun-sweep.mjs` starts every run with an empty inventory, so it cannot see overflow, and it values a banked item as a whole item. In a life, an item found with a full inventory is worth about a quarter of its price. The Feast numbers in section 6 were tuned before this change and against an empty inventory; with stacking they will be worth more, with the overflow they were worth less. The right check is lives: `item-sweep.mjs` with `NR2=all` (items kept = granted minus scrapped). Retune Feast after the stack size is settled.

### Feast re-checked with the inventory on (stack 3, six cheap items carried at jack-in)

`netrun-sweep.mjs` takes `INVFILL=n` (the run starts with n cheap items carried, so overflow and the end-of-run choice bite; value is then the change in what the inventory is worth, price over 15, plus scrip over 15). With the stack of 3 and the choice on, the tuned Feast values hold (800 runs a cell, careful play, ICE tiers on; value against the mean of the nine forms, Deep adult / Deep elder / Source adult / Source elder): Feast corp 92 / 111 / 82 / 86%, Feast street 93 / 84 / 95 / 99%. Lowering the Feast street odds (cache 0.55 then 0.7, ICE-win 0.3 then 0.5) drops it to 75 / 68 / 77 / 77%, so the high odds stay. No Feast retune is needed after the inventory change. Starting-inventory runs lower every form's value (mean 0.90 in the Deep at the adult level against 1.74 with an empty inventory), as overflow and displaced items should.

Remaining outliers on the yardstick with the inventory on: Breach street is above 120% at both levels in both regions, Dodge corp and the hidden form above 120% in the Deep at the adult level (the hidden form at about 130% in both regions; the maintainer is fine with the hidden role being higher if it is not absurdly out of line), Tune corp below 80% at the elder level and Tune street at the adult level (information parts the bots cannot use). The elder level's mean value is 1.4 times the adult's, above the 1.15 bar, and no elder is below its own adult.

## 8. Breach street and Dodge corp tuned down

Both were above 120% of the mean value at both levels (Breach street 133 / 127 / 132 / 125%, Dodge corp 127 / 127 / 112 / 117%, Deep adult / Deep elder / Source adult / Source elder). Changed in `nr2.js`: Hardened (Breach street) takes 70% of ICE damage at the adult level (was 50%) and 65% at the elder level (the first loss still barely scratches it); Phase (Dodge corp) slips the later ICE 15% of the time at the adult level (was 35%) and 30% at the elder level (was 35%), with one certain slip at each level (the elder had two). Result with the inventory on and six items carried (800 runs a cell, ICE tiers on): Breach street 102 / 114 / 107 / 115%, Dodge corp 117 / 101 / 98 / 92%.

Parity read-out after the change (careful play, 800 runs): in the Deep and the Source the only forms outside 20% of the mean value are the hidden form at the adult level (about 138%, accepted by the maintainer as a higher role provided it is not absurd) and the Tune forms (Tune corp at the elder level in the Deep, Tune street at the adult level; information parts the bots cannot use). The exit-rate bar still fails for the Feast forms (the open sustain question) and a form or two at single cells (Dodge street and the hidden form at the adult level in the Deep, Breach street at the elder level). The elder level's mean value is 1.4 times the adult's.

## 9. Feast sustain (decided as fitting the theme) and the hidden form's trim options

The maintainer accepted a small sustain part for Feast. Built as `winHeal`: a won ICE restores a little Integrity, for both Feast forms (Feast street 8 at the adult level and 16 at the elder level; Feast corp 8 and 12). With the sustain in, the loot parts were brought back down (Feast street cache find 0.6 and 0.8, ICE-win loot 0.4 and 0.6; Feast corp scrip +4 and +6, the exit item kept, and the forced cache back to one a run) so the value stayed in the band. Result (800 runs a cell, careful play, ICE tiers on, inventory on, six items carried; value against the mean of the nine forms, Deep adult / Deep elder / Source adult / Source elder): Feast corp 108 / 110 / 108 / 102%, Feast street 98 / 103 / 108 / 118%. The exit rate is close to the bar: Feast forms are within 10 points of the mean everywhere except the Deep at the elder level (Feast corp 31.6% and Feast street 32.1% against a mean of 44%, about 12 points off). The forms now survive: Feast street's Deep disconnect rate falls and its exit rate rises from 22% to 25 to 32%.

Parity read-out after all the changes (final numbers): in the Deep and the Source the only forms outside 20% of the mean value are the hidden form at the adult level (about 138%) and the Tune forms (Tune corp at the elder level in the Deep; Tune street at the adult level in both regions). The elder level's mean value is 1.4 times the adult's.

**Hidden form trim (not applied; the maintainer asked how it could be done).** The hidden form's strength is its never-notice chance (Ghost's 45% at the adult level and Whisper's 50% at the elder level, halved against tier 2 ICE at the adult level) on top of full sight. Lowering the chance is the one lever that does not touch its identity. Measured, hidden as a share of the mean value, Deep adult / Deep elder / Source adult / Source elder:

| Never-notice chance (adult / elder) | Hidden value |
|---|---|
| 45% / 50% (Ghost and Whisper, now) | 138 / 107 / 138 / 111% |
| 35% / 40% | 128 / 102 / 123 / 103% |
| 30% / 40% | 126 / 102 / 118 / 103% |

Lowering it to 30% at the adult level (Whisper then at 40%) puts the form about 18 to 26% above the mean at the adult level, and leaves the elder level at the mean. The cost is that the hidden forms no longer match 1.0's Ghost and Whisper numbers exactly (the maintainer decided that Guru and Blank follow Ghost exactly; the ability stays the same, only the chance changes). Full sight could not be trimmed without removing the ability's identity.

### Hidden trim applied, and how the roles compare on progression

The maintainer asked for 30% at the adult level and 55% at the elder level (not 40%) for the hidden forms' never-notice chance, so the elder stays ahead. Applied as `ab.hiddenUnseen` (Dodge street keeps Ghost's 45% and 50% in `ab.unseen`). Hidden value against the mean (Deep adult / Deep elder / Source adult / Source elder): 122 / 110 / 112 / 114%.

Does Feast still come out weaker? Value per run, no: Feast corp 110 / 110 / 111 / 101% and Feast street 100 / 99 / 111 / 114%, inside the band. Progression, a little yes. Steered lineages of one role (attentive play, 60 lineages of 8 lives, the 2.0 page list, abilities, ICE tiers, inventory, stack 3, feat tiers; lives to finish the 18 egg pages across three eggs, median with p10 to p90, and the share reaching a first elder):

| Steered role | First elder reached | Three eggs |
|---|---|---|
| Breach street | 98% | 8 (6 to 10) |
| Dodge corp | 98% | 7 (6 to 10) |
| Dodge street | 98% | 8 (6 to 11) |
| Feast corp | 93% | 9 (6 to 13) |
| Feast street | 87% | 9 (7 to 13) |
| Tune corp | 87% | 9 (7 to 13) |

So the Feast and Tune forms finish about one to two lives later (a life is about five real days), reach a first elder less often, and have a wider spread. The gap is survival in the Deep, not loot: the band measure counts banked value, while progression needs exits. About 60 lineages gives roughly one life of noise on these medians. Two ways to close it, if wanted: another small step of sustain for Feast, or leave it and let the playtest decide whether a loot role should progress a little slower.

### One more small step of Feast sustain

Applied at the maintainer's request: the Integrity a won ICE restores is now 11 at the adult level for both Feast forms and 22 (Feast street) and 18 (Feast corp) at the elder level, with the loot trimmed to keep the value in the band (Feast street cache find 0.55 and 0.7, ICE-win loot 0.35 and 0.5; Feast corp scrip +3 and +4). Value against the mean (Deep adult / Deep elder / Source adult / Source elder): Feast corp 114 / 115 / 115 / 107%, Feast street 100 / 98 / 117 / 114%. Progression (100 lineages of 8 lives, steered role, lives to finish the 18 egg pages across three eggs, median with p10 to p90, and the share reaching a first elder): Feast corp 8 (6 to 12) and 95% (was 9 and 93%), Feast street 9 (6 to 13) and 92% (was 9 and 87%), against Breach street 8 (6 to 10) and 98% and Tune corp 9 (7 to 13) and 90%. The gap has narrowed, not closed: the Feast forms still finish up to a life later than the defensive forms, with a wider spread, which is within what a loot role might be expected to cost.

## 10. Egg-flavored anomalies (first pass)

Built: `sim/netrun/egg-anomalies.js` (the three anomalies), the switch `NR2='{"eggAnomalies":true}'` (not part of `NR2=all` yet; options and numbers in `NR2.eggAnomaly`), the bot's `only:<option id>` anomaly style and the sweep `sim/egg-anomaly-sweep.mjs` (`EGG=iron|program|wetware FORMS=none,breachCorp node prototype/netling2/sim/egg-anomaly-sweep.mjs 4000`; variants `off`, `random`, and each option forced). Tests: the last 9 in `nr2.test.js`. **Revision after the maintainer's review:** the stack overflow's first draft gave UNWIND a free ICE pass (the next ICE never fights, any tier), which was dropped (decided), and Program's options were reworded and reworked into LET IT RUN (surge, 50% an item, a tear if Charge ends over 95) and KILL IT (costs Charge, repairs). Hints are numberless (decided). The Program rows below are the second measurement; Iron and Wetware are unchanged. The first Program draft, for the record: UNWIND alone was -1.3 points disconnect and +2.1 exit in the Deep, the largest effect of any option, because a skipped fight is worth most where ICE bites hardest; that is why the pass mattered and why it was dropped rather than tuned. The design is in `docs/NETLING_2_NETRUN_DRAFTS.md`, section 6.

**Results** (4000 runs a cell, careful and skilled bots, no ability and Breach corp, adult level, tiers and egg costs on, inventory on; each cell compared with the same seeds without the anomaly in the pool). Averages over the styles and forms, change against `off` (disconnect and exit in points, value in %). Sampling noise: about 1 point on a rate near 30%, about 1% on value; the random pool pick changes the rolls after the first anomaly, so cells are not paired past that point.

| Egg, variant | Bazaar | Corp Grid | Ruins | Deep |
|---|---|---|---|---|
| Program, random | -0.1 / +0.3 / -0.3 | -0.1 / +0.1 / 0.0 | 0.0 / -0.3 / -0.3 | -0.1 / +0.2 / 0.0 |
| Program, LET IT RUN only | 0.0 / 0.0 / +1.4 | -0.1 / -0.1 / +0.3 | +0.4 / -1.1 / +1.2 | +0.2 / -0.5 / +0.6 |
| Program, KILL IT only | -0.1 / +0.4 / -1.9 | -0.1 / +0.2 / -0.9 | -0.1 / +0.4 / -2.3 | -0.3 / +1.2 / -0.3 |
| Iron, random | -0.1 / +0.2 / +0.2 | -0.1 / 0.0 / -0.1 | +0.1 / -0.1 / +0.4 | -0.2 / +0.3 / +0.5 |
| Iron, FLASH IT only | -0.1 / +0.1 / -2.1 | -0.1 / 0.0 / -1.1 | 0.0 / 0.0 / -2.7 | -0.6 / +0.9 / -0.6 |
| Iron, PRY IT OPEN only | -0.1 / +0.2 / +2.1 | 0.0 / 0.0 / +1.0 | +0.3 / -0.5 / +2.6 | +0.3 / -0.2 / +1.9 |
| Wetware, random | -0.1 / +0.2 / 0.0 | 0.0 / 0.0 / 0.0 | +0.1 / -0.2 / -0.4 | -0.1 / +0.7 / +1.0 |
| Wetware, GRAFT only | -0.1 / +0.1 / -2.3 | 0.0 / -0.1 / -1.1 | +0.1 / 0.0 / -2.5 | -0.3 / +0.4 / -1.4 |
| Wetware, TAKE A SAMPLE only | -0.2 / +0.3 / +1.9 | -0.1 / +0.1 / +0.6 | +0.1 / -0.3 / +1.9 | -0.1 / +0.4 / +2.6 |

Encounters a run (random): Bazaar 0.17, Corp Grid 0.08, Ruins 0.31, Deep 0.21 to 0.22 (the Source and the daily trace have none).

**Names since (wording pass, maintainer).** The tables above use the names at measurement time. Now: LET IT RUN is RUN IT, KILL IT is TERMINATE, PRY IT OPEN is PRY OPEN, TAKE A SAMPLE is SAMPLE. PRY OPEN also gives +8 Charge; the sweep (3000 runs a cell, Iron, all four regions) is bit-identical with and without it and with +60 as a probe, so the bots do not use Iron's power in a run and the figures above stand. The size is unmeasured.

**Reading.** Every egg anomaly is inside noise at the run level when its options are taken at random, which is the intent (flavor, not power). No single option moves a rate by more than about 1 point now. The loot options (PRY IT OPEN, TAKE A SAMPLE, and LET IT RUN with its 50% item) look 2 to 5% better on value than the maintenance options (FLASH IT, KILL IT) and GRAFT IT, because the bot's value counts items and scrip and nothing else; what FLASH IT does for wear and Heat, GRAFT for Sync, and CATCH IT for Integrity beyond survival is not in the metric. Iron's wear in a run is about 1 point either way (the run costs are light), so the patch has little to clear in these runs; for a hot Iron netling it is worth more than the bots show.

**Not measured.** Players choosing options by their bars (a bot picks at random or by lean), the Overdrive overflow for a Program netling that is really at Charge 80+ when it unwinds (the careful bot's LET IT RUN in the Deep tore in 53% of 1122 uses, 6000 runs, because its Charge is usually high at an anomaly; a human who watches the bar can avoid it, which is the design), contracts, challenges (none of these options changes what Unplugged, Blackout, Glass or Bare metal forbid), the daily trace (excluded by rule), and wording.

## 11. Egg run costs: sizes and the pass bar

Built: `sim/runcost-sweep.mjs` (`EGG=iron|program|wetware node prototype/netling2/sim/runcost-sweep.mjs [lives] [archetypes] [cost-overrides-json]`: per archetype, whole lives with `NR2.eggCost` off and on, same seeds, with what each cost did a life from `COST_METER` in `run.js`), and `netrun-sweep.mjs` with `EGG=` for the run level. Tests: the last two in `nr2.test.js`. The costs are the decided direction (light, not decision points); the sizes are mine, a proposal for veto.

**What each cost is, and what it did at the first sizes** (Iron 1 minute of wear a move at Heat over 75, Program 4 Integrity on a lost fight at Charge 80+, Wetware 4% infection on a lost fight; 500 lives; attentive / casual / daredevil, the three who netrun a lot; sysadmin and overclocker never netrun here, worker and human-regular about 2 to 3 runs a life):
- Fired a life: lost fights 11.7 / 14.4 / 10.3. Iron: wear added 30 / 52 / 108 over 32 / 47 / 87 hot moves. Program: 1.8 / 6.1 / 2.1 bleeds, 7 / 25 / 8 Integrity. Wetware: 10.3 / 11.1 / 9.3 rolls, 0.39 / 0.40 / 0.34 infections.
- Run level (`netrun-sweep`, 3000 runs, Ruins and Deep, careful and skilled): Iron 0.0 change in every column, because a run seldom takes Heat past 75 from the sweep's starting Heat (20 to 50); Program +0.0 to +0.3 points disconnect; Wetware -0.1 to +0.8. All inside noise.
- Life level: every cost passes the bar (ordinary archetypes within noise on full-life rate, infections and temper) except that Wetware's infections show (+0.3 to +0.4 a life for a player who netruns a lot), which is the cost by design.

**A common unit.** An infection costs about 13 Integrity for an attentive netling (4 at once, then 12 an hour until cured, 47 awake minutes on average), 18 for a casual one and 12 for a daredevil (`virusdur`, 150 lives each). In Integrity-equivalents a life, the first sizes were: Wetware 5.1 / 7.2 / 4.1, Program 7.1 / 24.5 / 8.2, Iron about 1.7 / 3.6 / 1.4 plus the wear itself. Iron was the lightest by a factor of 3.

**Variants tried** (500 lives, paired seeds; infections change a life for attentive / casual / daredevil, noise about 0.15):
| Cost | Infections | Other |
|---|---|---|
| Iron x1 (first size) | +0.13 / +0.20 / +0.12 | wear max +3 / +4 / +5 |
| Iron x2 | +0.05 / +0.30 / +0.33 | casual full-life -0.8 |
| Iron x3 | +0.24 / +0.24 / +0.62 | casual full-life -2.0, human-regular -1.6, daredevil temper -0.6 |
| Program bleed 6 | -0.03 / +0.05 / -0.03 | casual disconnects +0.26 a life, +0.1 attentive |
| Program bleed 8 | -0.03 / +0.08 / -0.02 | casual disconnects +0.38 a life |
| Wetware 6% | +0.56 / +0.54 / +0.45 | (4% gave +0.36 / +0.31 / +0.26) |

**Sizes chosen** (proposal): **Iron 2.5 minutes of wear a move** (from 1), **Program 4 Integrity** (unchanged), **Wetware 4%** (unchanged). Checked at 1000 lives, paired seeds, change from off to on:
| | attentive | casual | worker | human-regular | daredevil |
|---|---|---|---|---|---|
| Iron 2.5: full-life | 0.998 to 0.998 | 0.911 to 0.909 | 0.815 to 0.826 | 0.290 to 0.291 | 0.995 to 0.992 |
| Iron 2.5: infections | +0.17 | +0.34 | -0.03 | +0.06 | +0.56 |
| Iron 2.5: wear max | 12.9 to 24.2 | 18.5 to 36.5 | 40.8 to 43.6 | 31.0 to 35.9 | 69.1 to 83.1 |
| Program 4: full-life | 0.997 to 0.997 | 0.937 to 0.931 | 0.923 to 0.924 | 0.330 to 0.332 | 0.994 to 0.997 |
| Program 4: casual disconnects a life | | 2.66 to 2.83 | | | |
| Wetware 4%: full-life | 0.996 to 0.998 | 0.929 to 0.940 | 0.899 to 0.899 | 0.281 to 0.295 | 0.996 to 0.996 |
| Wetware 4%: infections | +0.41 | +0.45 | +0.07 | +0.10 | +0.33 |
In Integrity-equivalents a life, attentive / casual / daredevil: Iron about 2.4 / 6.1 / 6.7, Program 7.0 / 25 / 7.9, Wetware 5.3 / 8.1 / 4.0. The attentive netrunner pays 2 to 7 Integrity a life under any egg, which is light.

**Reading.**
- No full-life rate moves outside noise (1000 lives, about 1 point). The costs are present but small; the ordinary archetypes that netrun (attentive, casual) are unchanged on full life and temper, and pay in infections (Iron, Wetware) or Integrity (Program).
- Who pays differs, as the pressures intend: Iron's cost falls on players who jack in hot (daredevil +0.56 infections, wear +14), Wetware's on anyone who loses fights (all netrunners +0.3 to +0.45), Program's on players who jack in with Charge full (casual 6 bleeds a life, attentive 1.8). Program's cost lands on casual players about 3 times as hard as on attentive ones: casual disconnects +0.17 a life (6%). If that is too heavy, raise the Charge line for the bleed to 90 or drop the bleed to 3; not tried.
- The Iron run cost is the one the netrun-level bots cannot see (0.0 at the run level): it only fires for netlings that jack in hot, which the run-level sweep's starting Heat never produces.

**Not measured:** the 5 minute window with these costs (the bots act in one instant); the elder level or an ability on top (the sweeps ran with no ability); whether a real player jacks in hotter or fuller than the bots (Heat 20 to 50 at the run-level sweep, Charge 60 to 100); wear's own effects beyond infections (the LOCK Sync drain at wear 100 is in the life results through `wearMax` only); and anything the Iron wear caption or an infection log line does to behavior. The earlier tables that ran with `eggCost` on used Iron 1 minute a move; the run-level results do not change (Iron's cost never fired there), the life-level ones were not re-run.

## 12. Foresight (Tune street): what the information is worth

Built (all off by default): `NR2.fate` pre-rolls what is in a node (an ICE's game and tier, whether a cache is filled) from a per-run seed, so it can be known before arrival and does not depend on the route (the daily trace already worked this way); `NR2.foresight` (`on`, `depth` by level, `fields` by level) lets a Tune street netling read those contents within its depth, and makes the nodes it reads visible; `foresightView(pet)` in `run.js`; per-game skill in the bot (`style.spread`: the four games at the mean plus `spread` x 1, 1/3, -1/3, -1; clamped), a planner that values an ICE by how likely this player is to lose that game and tier, and a cache by whether it is filled; `sim/foresight-sweep.mjs`. Tests: the last 4 in `nr2.test.js`. All arms in a sweep use the same seeds and the same pre-rolled contents, so a difference is what the information bought.

**The measurement is a model of a person, not a person.** The one number that decides the result is how uneven a player's skill is across the four games (`spread`), and it is not known: 0 is a player equally good at everything (Foresight then helps only through seeing further), 0.2 puts the games at about 80, 67, 53 and 40% around a 60% mean, 0.4 at 100, 73, 47 and 20%. The sweep reports 0, 0.2 and 0.4. It models routing by what is seen; it does not model preparing for a hard fight (healing first), choosing when to jack out, or reading a market's stock or an anomaly's kind (not simulated).

**Adult (reads the next step), banked value as % of the mean of the nine forms blind; 3000 runs; careful / skilled** (blind: Deep 77 / 85, Source 71 / 77):
| Variant | spread 0 | spread 0.2 | spread 0.4 |
|---|---|---|---|
| Deep, depth 1: game | 77 / 85 | 86 / 93 | 97 / 94 |
| Deep, depth 1: game, tier | 79 / 86 | 87 / 93 | 97 / 95 |
| Deep, depth 1: game, tier, cache | 81 / 88 | 89 / 95 | 99 / 97 |
| Source, depth 1: game | 71 / 77 | 88 / 88 | 97 / 94 |
The yardstick's floor is 80%: the adult is under it blind and reaches it when the player's skill is uneven (spread 0.2 and up); for a player equally good at everything the information is worth nothing at one step.

**Elder (reads two steps), % of the mean of the nine forms; the elder's own repair per move (`ab.upkeep.tuneStreet[2]`, 6 in nr2.js) carries most of it: blind it is 60% with no repair, 75% with 3, 99% with 6 in the Deep, careful, spread 0.** Deep and Source, careful / skilled, depth 2 with the game only:
| Repair per move | spread 0 | spread 0.2 | spread 0.4 |
|---|---|---|---|
| 6 (now), Deep | 105 / 104 | 114 / 108 | 123 / 113 |
| 6 (now), Source | 109 / 115 | 125 / 127 | 145 / 140 |
| 3, Deep | 81 / 92 | 89 / 98 | 97 / 101 |
| 3, Source | 79 / 92 | 93 / 105 | 107 / 114 |
| 0, Deep | 66 / 78 | 74 / 85 | 84 / 86 |
Depth 1 at the elder with repair 6: Deep 99 / 101 at spread 0, 108 / 105 at 0.2, 116 / 109 at 0.4; Source 96 / 109, 116 / 121, 130 / 132.

**Reading.**
- **The ICE's game is the whole value.** The tier adds 0 to 5% (the tier-2 share is low and its win penalty small), a filled cache 1 to 5%. Depth 2 adds about 5 to 12 points over depth 1 at any spread (some of it from seeing further, not from the detail: at spread 0 depth 2 still gains 4 to 12%).
- **Foresight at the current repair value is too strong for the elder in the Source** (125% and more at spread 0.2 and up, careful) and over the 120% bar for an uneven player in the Deep (123% at 0.4). With the repair halved to 3 the elder sits in the 80 to 120% band at every spread tried in both regions except Source careful at spread 0 (79%, the one cell under).
- Tune street is the form that depends most on the player (0 at spread 0, a lot at 0.4); the others do not. That is by design (information for a player who can use it) and is the thing a playtest has to answer.

**Not measured:** market stock and anomaly kinds (the bots buy by a fixed list and pick anomaly options by a style), preparing for a known ICE, the fog (lines only from the current node, elder sight showing lines: a drawing change that raises the worth of sight for a human), how much better than the planner a person routes, and whether the nodes two steps ahead stay visible when a fight or choice interrupts.

**Decided (maintainer): elder depth 2, repair 3.** `NR2.ab.upkeep.tuneStreet[2]` is now 3 (was 6), `NR2.foresight` keeps depth 1 and 2 with the game only, and `NR2=all` now also switches `fate` and Foresight on (a test checks it). Tables made earlier with the elder's repair at 6 (the parity read-out in section 3 and the Tune lines in sections 6 to 9) are not re-run: the Tune street elder is lower blind by the amount in the repair table above (99% to 75% of the mean in the Deep, careful, spread 0).

## 13. Challenges under the 2.0 abilities

Built: `sim/challenge-sweep.mjs` (`node prototype/netling2/sim/challenge-sweep.mjs [runs] [regions] [styles] [challenges]`; `SPREAD` for the bots' per-game skill, default 0.2; abilities, ICE tiers and Foresight on unless `NR2` is set), Foresight dark under Blackout in `foresightView`, and 4 tests in `nr2.test.js` (one per challenge rule against the abilities that touch it). Completion is reaching the exit with the rule kept; under a challenge the bot never banks at a relay and, for Bare metal, never buys an item (`netrun-bot.mjs`). 2000 runs a cell.

**What each rule does to the 2.0 parts (checked in code and by test).**
- **Glass:** every lost ICE fight breaks it, so Breach street's softened first loss counts as lost and Breach corp's insurance saves the netling but not the challenge. Dodge corp's phase, Dodge street's unseen and the hidden forms' slips are not losses, so they help most. Tier-2 ICE makes it harder (below).
- **Unplugged:** relays are dark, so the elder relay patches (Breach corp, Tune corp) do nothing and no relay recharges. Tune street's repair per move is not a relay and keeps working.
- **Blackout:** only visited nodes and the next step are seen. The hidden forms' full sight goes dark, as 1.0's Ghost's did. **Revised after the maintainer's note: the Tune forms keep a limited form of their ability** (`NR2.blackout`, both at 1; section 13, Blackout and the Tune forms): Tune corp sees node types two steps ahead at both levels (one step beyond Blackout's), and Tune street's Foresight reads the next step's ICE game at both levels (the elder's second step is dark). The first reading had both dark, which left them at the level of a netling with no ability. Avoidance and the other parts work.
- **Bare metal:** buying an item breaks it. A clinic fix is a service and does not; a found item (cache, ICE win, anomaly) does not. Feast corp's cheaper exchange is moot because nothing is bought.

**Mean completion of the nine forms, adult / elder** (careful / skilled; 1.0's adult-form bots in brackets, one flat bot with no abilities of this kind):
| | Deep careful | Deep skilled | Source careful | Source skilled |
|---|---|---|---|---|
| Glass | 15.8 / 19.8 (16) | 34.7 / 39.1 (41) | 6.7 / 9.2 (6) | 20.8 / 24.8 (27) |
| Unplugged | 42.0 / 53.1 (37) | 67.5 / 76.7 (68) | 13.2 / 21.1 (10) | 34.4 / 46.8 (33) |
| Blackout (with the limited Tune variant; fully dark: 47.4 / 59.3, 72.7 / 81.1, 20.5 / 31.5, 45.8 / 58.9) | 48.4 / 60.4 (45) | 73.7 / 81.9 (73) | 21.2 / 32.6 (19) | 47.1 / 60.4 (48) |
| Bare metal | 49.0 / 61.5 (45) | 74.2 / 82.6 (73) | 21.8 / 33.7 (19) | 47.9 / 61.2 (48) |
The 2.0 rates sit where 1.0's did. Every challenge is completable by every form (the lowest cell anywhere is 4.0%, Source careful Glass, Feast street elder).

**Who it favors** (Deep, careful, adult / elder, percent complete):
- Glass: Dodge corp 24 / 30, Dodge street 24 / 32 and the hidden forms 22 / 38 against Breach 12 / 12, Feast 11 to 12 / 11 to 14 and Tune 13 to 14 / 14 to 16: the skip-ICE forms complete it about 1.8 to 3.5 times as often, as in 1.0 (Glitch, Ghost, Panic, Whisper). Breach's defensive parts do nothing for Glass by rule.
- Unplugged: Tune corp lowest (34 / 35) against hidden 48 / 66 and Breach street elder 62: the elder patches are the loss.
- Blackout, fully dark: Tune corp (36 / 44) and Tune street (36 / 50) lowest, at the level of a netling with no ability (36.5 adult); Breach corp elder highest (76). The forms whose ability is sight lose it. With the limited variant they are 40 / 49 and 41 / 55 (Deep careful), see below.
- Bare metal: the same shape as Blackout, a little kinder to the Tune forms (40 / 50 and 41 / 58).

**Tier-2 ICE costs every challenge 5 to 12 points** (mean completion adult, tiers on / off, Deep careful: Glass 15.8 / 21.5, Unplugged 42.0 / 49.7, Blackout 47.4 / 55.3, Bare metal 49.0 / 56.9; Source careful: Glass 6.7 / 11.6, Unplugged 13.2 / 20.3, Blackout 20.5 / 29.4, Bare metal 21.8 / 31.0), because the Deep and the Source have the most tier-2 ICE. Glass in the Source with careful play falls to 6.7% (a 42% drop in relative terms).

**Not measured:** the bots plan three steps ahead at most and never use items mid-run, so Blackout and Bare metal read easier than they play for a person (1.0's note); the Foresight spread (0.2) is an assumption; the daily trace and Source-only anomalies under a challenge; a challenge with the egg run costs on (none of these sweeps has them on); and the rewards (cosmetics) are unchanged.

**Did the Foresight bots run in these sweeps, and does it help in Unplugged? (maintainer's questions)** Yes to both. The challenge sweep switches `fate` and Foresight on, with per-game skill 0.2, and the planner uses `foresightView`; a direct check (3000 runs, Tune street, Deep, careful, completion with Foresight off against on):
| Challenge | Adult, spread 0.2 | Elder, spread 0.2 | Adult / elder, spread 0 |
|---|---|---|---|
| Unplugged | 30.8 to 35.2 | 43.3 to 51.3 | 31.0 to 31.0 / 42.7 to 46.6 |
| Glass | 11.7 to 13.9 | 11.7 to 15.9 | 11.9 to 11.9 / 11.9 to 13.0 |
| Bare metal | 36.6 to 41.6 | 50.2 to 59.0 | 36.5 to 36.5 / 49.4 to 54.6 |
| Blackout (dark) | 36.5 to 36.5 | 50.1 to 50.1 | no change |
| No challenge (exit rate) | 23.8 to 27.9 | 33.6 to 38.9 | 23.4 to 23.4 / 32.8 to 35.0 |
So Foresight helps in Unplugged (+4 points adult, +8 elder at spread 0.2; the elder gains 4 even at spread 0 from seeing two steps) and in Bare metal and Glass, and it did, in the tables above: the Tune street cell under Unplugged (35 / 51, Deep careful) already includes it. It did nothing under Blackout only because the first reading made it dark.

**Unplugged and Tune corp (maintainer's open question; decided: leave it, the option below is kept for after playtesting).** Under Unplugged the Tune corp elder's second part, the relay patch, is dark, and its first part (sight) does not help survival much. It is the one form whose elder gains nothing over its adult: Deep careful 34.0 adult, 35.1 elder, against elders of 44 to 66% (the nine-form elder mean is 53.1%); Source careful 8.3 and 9.2 against a mean of 21.1, 44% of the mean and the lowest elder cell of any form. (Breach corp's elder loses its patch too, but its other parts carry it: 106% of the mean.) The option measured is a switch, `NR2.ab.darkUpkeep.tuneCorp[2]`, off at 0: under Unplugged only, the Tune corp elder repairs that much Integrity every move (Tune street's repair is the model; it is not a relay). `challenge-sweep.mjs`, 2000 runs a cell, Foresight on, spread 0.2; 0 is bit-identical to the default run. Tune corp elder completion, percent of the elder mean in brackets:

| Repair a move | Deep careful | Deep skilled | Source careful | Source skilled |
|---|---|---|---|---|
| 0 (now) | 35.1 (66%) | 61.4 (80%) | 9.2 (44%) | 25.1 (54%) |
| 1 | 40.6 (76%) | 67.6 (87%) | 13.1 (61%) | 33.9 (71%) |
| 2 | 44.4 (82%) | 71.9 (92%) | 17.8 (81%) | 42.9 (88%) |
| 3 | 48.3 (88%) | 74.7 (96%) | 20.4 (91%) | 48.5 (98%) |

The other forms move by under 1 point (the elder mean rises 0.5 to 1.5 because Tune corp is in it). Two a move puts every cell inside the 20% band; three is the same repair as Tune street's. It is a special case for one challenge, so it needs a one-line in-game explanation if taken. Bots only; Tune corp's value to a person (sight) is not in these figures, and the adult is untouched (81% of the mean, the same low as without the challenge).

**Blackout and the Tune forms: a limited variant** (`NR2.blackout`; 2000 runs; Tune corp / Tune street completion, percent of the nine-form mean in brackets; A dark, B Tune corp two steps of types, C Tune street's next-step Foresight, D both):
| | A dark | B corp | C street | D both |
|---|---|---|---|---|
| Deep careful, adult | 36 (77) / 36 (77) | 40 (84) / 36 | 36 / 41 (86) | 40 (83) / 41 (85) |
| Deep careful, elder | 44 (74) / 50 (83) | 48 (81) / 50 | 44 / 55 (91) | 48 (80) / 55 (91) |
| Deep skilled, adult | 64 (88) / 64 (88) | 67 (92) / 64 | 64 / 71 (96) | 67 (91) / 71 (96) |
| Source careful, elder | 20 (63) / 22 (69) | 24 (75) / 22 | 20 / 28 (87) | 24 (73) / 28 (86) |
| Source skilled, elder | 44 (75) / 52 (88) | 49 (82) / 52 | 44 / 60 (100) | 49 (81) / 60 (99) |
Tune street's limited Foresight is worth +4 to +8 points of completion (to 83 to 100% of the mean, from 67 to 93%); Tune corp's extra step +3 to +5 (to 73 to 92%). Both together (D, now the default) bring every Tune cell to 73 to 100% of the mean; Tune corp stays the lowest in the Source (73 to 83%), as it is a form with no defence. The other forms do not move.

## 14. The Rogue gate with the ending (lineage-sweep)

Rogue needs the ending to have played and all 18 egg pages (sketch, Hidden egg). The ending (decided) is all 39 story pages, 24 Root and 15 late, and one Source exit, the same for everyone and not egg pages. Until now `lineage-sweep.mjs` timed only the egg pages. It now also tracks the ending in egg 1's lineage, where the codex fills and the story pages really drop (`sim/codex2.js`, cap 12 a life, late pages only once Root is held), and reports the Rogue gate as the later of the ending and the three eggs' pages. Run: `NR2=all node prototype/netling2/sim/lineage-sweep.mjs <archetype> <lineages> <lives>` (60 lineages, lives 14 for the quick archetypes and 26 for the slow ones). Lives are counted from life 1 of the first egg; a life is about 5 real days (sketch, Measured on 1.0's simulator).

| Archetype | Root life | Ending life (median, p90) | Three eggs' pages | Rogue gate (p10 to p90) | Ending is the later |
|---|---|---|---|---|---|
| attentive (100 lineages) | 4 | 7 (11) | 9 | 9 (7 to 12) | 9% of trials |
| daredevil | 4 | 7 (10) | 10 | 10 (7 to 15) | 2% |
| casual | 5 | 14 (25), 72% within 26 lives | 20 | 22 (13 to 36) | 22% |

- **The ending adds little for attentive and daredevil lines** (the gate moves 0 to 1 life), because by the time three eggs' pages are in, the story pages are too. It matters for casual play: the ending is the later in about a fifth of trials, and the casual gate moves from 20 to 22 lives (about 110 real days at 5 days a life). Casual figures are lower bounds: 29% of casual lineages had not reached the ending within 26 lives and are counted at 27.
- **The Source pages are the slow part for casual play.** The ending needs a Source exit and the four Source pages, which only an elder reaches; casual median first elder is life 8 (88% reach), and the Source then drops pages under the cap like everywhere else.
- **Sysadmin and human-regular:** sysadmin never held Root within 26 lives in this model (the sweep now says so instead of crashing on an empty pool). Human-regular reaches Root in 25% of lineages and the gate is in the hundreds of lives: the figure is not meaningful, it says only that this archetype does not unlock Rogue in the model.
- **Not modelled:** the egg pages are drops by roll (0.20 a non-Deep run for four role pages, 0.50 a Deep run for the hidden page, a guaranteed Source page at the first Source exit) and each roll finds a new page, so a repeat find would lengthen the gate slightly; the egg pages are not a codex object in the fork. Later eggs are assumed to start with the codex full, and the ending's lives come from egg 1's lineage extended past that egg's own pages. Bots, not people.
