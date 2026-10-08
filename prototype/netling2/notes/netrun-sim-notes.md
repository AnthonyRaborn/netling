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

Other changes to the fork: the codex cap is 12 (decided; was 8), Root Access arrives mid-life when the codex completes (`CFG.rootMid`, decided), the elder feat can follow the account (`CFG.featFor`, used by `lineage-sweep.mjs`), `simulate` returns the final `form`, `POSTRUN=skip` makes a bot not top Charge up again after a netrun, and `infect` is exported from `sim.js`. `npm run proto:test` is 212 tests (it was 190); `npm test` is 503, unchanged.

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
