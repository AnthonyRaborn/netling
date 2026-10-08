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
| The ending's 39 story pages and the Source story pages | Not modelled |
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
