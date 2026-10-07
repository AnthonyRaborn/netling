# Netling 2.0 rule prototypes

## The 2.0 simulator (current)

`prototype/netling2/sim/` is a fork of 1.0's simulator carrying the 2.0 core life rules as real rules, replacing the scratch patch described further down for everything it covers. `src/` and `tools/` are untouched, and the fork reproduced 1.0's `npm run balance` output exactly before any 2.0 change (casual, 100 lives), so its diffs show only the 2.0 rules. It is a prototype: not shipped, not in `sw.js`.

| File | What it is |
|---|---|
| `sim/sim.js` | Fork of `src/sim.js`. Standing as two tracks, temper with a 24 hour half-life and the five levels (the flicker guard is `tell.js`'s), bugs, no fault cap, teen and adult evolution with the tie-break weights, care preferences, 22 generic forms per egg |
| `sim/netrun/run.js` | Fork of `src/netrun/run.js`: ICE games enter the preference history; a disconnect fault owes a bug roll |
| `sim/netrun-bot.mjs`, `sim/balance.mjs` | Forks of the scripted netrun player and `tools/balance.mjs` (same archetypes, same settings, new report lines) |
| `sim.test.js` | 21 tests, one or more per rule (`npm run proto:test`) |

Run: `npm run proto:balance [runs] [archetype]` (`DETAIL=1` for the full report, `JSON=1` for JSON, whose level keys are the numbers -2 to 2). Settings beyond 1.0's: `CLEAR=scrip|both|none` (how bots clear bugs: scrip at check-ins, or also 2 Standing, one from each track; default `scrip`), `PREF='{"on":false}'` (preferences off), `PREFBOT=follow` (bots follow their netling's preference), `BUGS='{"chance":0.5,"max":8}'`. 300 lives of all 16 archetypes take about 80 seconds.

**Rules modeled** (sketch sections in brackets): Standing sources, 0.25 a packet, 1 for COMPLY, HIDE, an ignored trace, a voucher, a Black ICE shard, checkpoint and anomaly choices, 0.5 for market purchases, nothing for care or games (Standing; netrun leans pass through an adapter, `attachAxes`); temper sources and decay, items +1, Segfault -4, shown level with guard 1.0 (Temper); bugs 30% a fault, ceiling 5, drains +8%, +8%, +10% Heat, +4% Integrity damage, clearing for 15 scrip or 2 Standing (Bugs); faults uncapped, integrity collapse and the end of the cycle the only deaths (Risks); teen and adult forms by fractional Standing against whole-number cutpoints (the gap's whole part sets the weight; decided by the maintainer) and wins, hidden teen at 3 wins each, hidden adult at 4 each and 29, tracks within a point (Evolution); care preferences with the Sync bonus, the request bias and ICE in the history (Care preferences). It also records, per life, awake time at each temper level, the longest unbroken 12 hour hold at a strong level with neglect level 2 paused (the Metronome's test), and awake hours at neglect level 2.

**Not modeled:** the debug station anomaly and any bug-clearing node (undecided); 2.0 perks, traits, keepsakes and netrun abilities (undesigned, so the 22 forms differ only in how they are reached and the three eggs behave the same); Root Access granted at once and the elder tiers (progression layer, use the drivers below); egg pages and the Rogue gate; neglect's look; the sprite. The bots are still 1.0's: they cycle games in a fixed order, so the **role is never certain** (the top two games are within 5 wins), and no archetype steers a role; they do not react to a glitching sprite; the Standing display (floors) is not modeled.

**Fidelity checks** (300 lives, share of lives ending at each shown temper level, strongly unsteady / unsteady / middle / steady / strongly steady; the sketch's figures came from the scratch patch):

| Archetype | Sketch | This simulator |
|---|---|---|
| Casual | 0/20/76/4/0 | 0/21/74/4/0 |
| Worker | 2/37/60/0/0 | 3/40/56/1/0 |
| Attentive | 0/0/10/46/43 | 0/0/14/38/48 |
| Steer-daemon | 0/0/1/25/74 | 0/0/2/22/76 |
| Steer-glitch | 6/49/45/0/0 | 4/50/46/0/0 |
| Daredevil | 24/53/22/0/0 | 32/55/12/0/0 |
| Overclocker | 72/27/0/0/0 | 83/17/0/0/0 |
| Neglectful | 18/56/25/0/0 | 14/43/43/0/0 |

Also in line: casual Standing by adulthood about 9.4 and 8.9 (the sketch: about 10 and 8); a worker without clearing 7.7 faults and 14% at the bug ceiling (the sketch: 7.7 and 17%); the 12 hour hold reach with neglect level 2 paused: attentive 48% (52%), steer-daemon 80% (87%), daredevil 35% (34%), steer-glitch 5% (5%), overclocker 80% (90%). Casual full-life rate 94% (the sketch: 95.7% without the cap). **The hot end does not reproduce** (daredevil and overclocker end more unsteady), and the gap is not explained: it does not come from bugs (switching them off changes nothing), and switching care preferences off widens it (overclocker 91% strongly unsteady, daredevil 35%), so preferences narrow it without closing it.

**New findings:** care preferences pull the unsteady end back. A matched action gives Sync, so a hot player plays less. With preferences off the overclocker's 12 hour unsteady hold reaches 89% of lives against 80% with them, the daredevil's 45% against 35%, and overclockers ending strongly unsteady 91% against 83%. The sketch measured the preference and the Metronome separately, so their interaction was not seen. Clearing bugs with Standing as a fallback (`CLEAR=both`) cuts a worker's final bugs from 1.24 to 0.04 and the bug ceiling from 7% to 0 at the cost of a few Standing points; with no clearing a worker ends with 2.1 bugs and 14% at the ceiling.

Not verified: `npm run smoke`, any device check, and the temper-level differences above beyond the sample noise (about 1.5 points a share at 300 lives).

## The scratch patch (earlier figures)


Scratch prototypes that test Netling 2.0 rule ideas on 1.0's headless simulator (`tools/balance.mjs`, `src/sim.js`). They are not part of the game and are not shipped, tested or wired into `sw.js`. They exist so the numbers in [NETLING_2_SKETCH.md](../NETLING_2_SKETCH.md) can be reproduced and re-run, and so a later session knows exactly what was and was not modeled.

Everything here stands in for rules that do not exist yet. 1.0's single signed allegiance stands in for Standing, and 1.0's stability axis stands in for temper. Treat every figure as a rough guide. Retest the numbers when 2.0 is built.

## What the patch changes

`netling2-prototype.patch` is a unified diff against 1.0 (`src/sim.js`, `src/netrun/run.js`, `tools/balance.mjs`). Apply it only to a scratch copy, never to the repository's game code. It adds, all switched by environment variables or off by default where noted:

- **Bugs** (`BUG_CFG`, env `BUGS`): a fault rolls a bug (chance 0.3, ceiling 5), each bug adds to Charge and Sync drain (8% each), Heat drift (10%) and Integrity drain (4%), Segfault rolls 25% none, 60% one, 15% two, and bots clear bugs at check-ins for 15 scrip when `clear` is true. `on: false` turns bugs off. The temper decay (`tdecay`) is also set through `BUGS`.
- **Temper stand-in:** `s.axes.stability` multiplied by `tdecay` each minute (24-hour half-life is 0.999519). `ITEMTEMPER=1` makes a Coolant cell and an Antivirus patch add 1 to it.
- **Standing stand-in:** `s.standing` accumulates the positive and negative changes to 1.0's allegiance as two track totals.
- **Care preferences** (`PREF`, `PREFBOT`): temper level decides a Sync bonus for routine or novelty, game requests can be biased (`reqbias`, `steadyMode: "last2"`), `distinct` keeps the last two plays distinct, `ice` adds netrun ICE games to the history. `PREFBOT=follow` makes the bot follow the preference; anything else ignores it.
- **Counters:** per-action counts (`s.actCount`), anomaly nodes met (`s.anomalies`), games won, bug and preference totals in the result of `simulate()`.

## Reproducing a run

```bash
mkdir /tmp/n2 && cp -r src tools package.json /tmp/n2/ && cd /tmp/n2
patch -p1 < <repo>/docs/netling2-prototypes/netling2-prototype.patch
cp <repo>/docs/netling2-prototypes/*.mjs .
```

`guard.mjs` and `hold.mjs` read each minute's temper through a hook that is not in the patch; add it to the scratch copy with `sed -i 's|^    tick(s, t0 + minute \* MIN, rng);|&\n    globalThis.__sample?.(s, minute);|' tools/balance.mjs`.

Run from the scratch copy with Node 22. Each driver takes an archetype name from `tools/balance.mjs` and a number of lives.

| Measurement | Command (example) | Settings used for the sketch |
|---|---|---|
| Standing gap and tie-break leader chance | `BUGS='{"on":false}' node gap.mjs casual 0.25 300` | packets at 0.25 (the second argument), decisions at 1.0's values |
| Standing track totals, anomaly nodes, runs | `BUGS='{"on":false}' node standing.mjs casual 200` | packets 0.25, no fault cap |
| Bugs, death rates, clearing | `BUGS='{"clear":true}' NOCAP=1 node bugs.mjs casual 300 S2` | `NOCAP=1` removes the fault cap; scenarios B1 (1.0 as is, `BUGS='{"on":false}'` and no `NOCAP`), B2 (`on:false` with `NOCAP`), S1 (`{}`), S2 (`clear`), S3 (`clear`, `chance` 0.5), S4 (`chance` 0.5, `max` 8) |
| Temper levels | `ITEMTEMPER=1 FLOW=0.5 S1=3 S2=6 U1=2 U2=6 BUGS='{"clear":true,"tdecay":0.999519}' node temper.mjs attentive 300` | flow +0.5 an hour, 24-hour decay, items +1, thresholds -6, -2, +3, +6 |
| Care preferences | `ITEMTEMPER=1 PREF='{"on":true,"reqbias":true,"steadyMode":"last2","distinct":true,"ice":true}' PREFBOT=follow BUGS='{"clear":true,"tdecay":0.999519}' node pref.mjs attentive 300 FOLB3I` | follow bot; `PREFBOT=ignore` for the ignore bot; `PREF='{"on":false}'` for off |
| Temper level flips, flow against overclocked time, decay timing | `VARIANT=minute ITEMTEMPER=1 BUGS='{"clear":true,"tdecay":1}' node guard.mjs attentive 200` | needs the sampler hook (below); `VARIANT=minute\|hour\|sixh` is when the 24-hour decay is applied (`tdecay` must be 1 so the driver applies it), `GUARDS=0,0.25,0.5,1,1.5` |
| Time at each temper level, longest holds | `ITEMTEMPER=1 BUGS='{"clear":true,"tdecay":1}' node hold.mjs attentive 200` | flow +0.5 an hour, guard 1.0, thresholds -6, -2, +3, +6; `NEG=2` (or 1) makes awake minutes at that neglect level not count toward a hold, `NEGMODE=pause\|reset` |
| Long lineages per life (runs by region, elder, Source exit) | `TAG=_s2 CAP=12 EXITS=2 CLEAN=1 ROOT=nodeep node lines.mjs attentive 300 10` | run in a scratch copy of the UNPATCHED repo (`cp -r src tools package.json`); writes `lines-<archetype><TAG>.json`; `CAP` is codex fragments a life, `EXITS` and `CLEAN` the elder feat, `BEFORE` the hours before the end of life that the elder gate opens, `ROOT=nodeep\|sixteen` shrinks the Root list (the sim always uses the 22 of 1.0) |
| Lives to finish the 18 egg pages under Source page rules | `TAG=_s2 ROLE=0.2 HID=0.5 node rogue.mjs attentive` | needs `lines-<archetype><TAG>.json`; `ROLE` and `HID` set the role and hidden page rates (defaults 0.10 and 0.25), `ONLY='guaranteed first Source exit'` runs one rule; role pages 0.10 a non-Deep run, hidden page 0.25 a Deep run, three eggs one after another, eggs 2 and 3 drawn from post-Root lives |
| Lives to finish the 18 egg pages with a lighter elder feat after the first | `MODE=e1 TAG=_ease node lines2.mjs attentive 300 10` (also `MODE=later`, `MODE=laterEasy`, `EXITS=3 CLEAN=2` for the hard feat, `CAP`), then `ROLE=0.2 HID=0.5 node rogue2.mjs name l2-attentive-e1_ease.json l2-attentive-later_ease.json` | scratch copy of the unpatched repo; egg 1 from an empty codex, eggs 2 and 3 start with Root held and the codex full. `MID=1` makes Root arrive the moment the codex completes, as in the game (`drainCodexInbox`); the balance tool only grants it to the next netling, so without `MID=1` egg 1 runs about a life too long. `MID=1` needs one line in `tools/balance.mjs` after `tick(s, t0 + minute * MIN, rng);`: `if (globalThis.__rootMid && !s.rootAccess && ROOT_FRAGMENT_IDS.every((id) => ctx.codex.includes(id))) s.rootAccess = true;` |
| Egg page pace by placement | `node egg-pages.mjs` | needs only `tools/baseline/lineages.json`; compares home-region placement with any-region at 0.10 a run, and the hidden page's Deep rate |
| Actions per life | `BUGS='{"on":false}' node acts.mjs casual` | counts feeds, plays, cooling and so on over 100 lives |

**Which copy each driver needs.** Patched copy (the patch above): `gap`, `standing`, `bugs`, `temper`, `pref`, `acts`, `guard`, `hold`. Unpatched copy (`cp -r src tools package.json`): `lines`, `lines2`. No simulator: `egg-pages` (reads `tools/baseline/lineages.json`), `rogue` and `rogue2` (read the `lines` and `lines2` output).

Results are printed as one JSON line each. The sketch quotes them with their limits.

## Known limits

- The bots are 1.0's archetypes. They cycle mini-games in a fixed order and choose packets at random, so they cannot stand in for a player with habits. The preference-following bot sees temper directly, which a real player has to infer.
- Bugs from netrun-disconnect faults are not rolled, Heat from actions is not scaled by bugs, and clearing by Standing or by a netrun anomaly is not modeled (only the scrip route, at scheduled check-ins).
- Standing is 1.0's one signed number, so a netling with both tracks high looks balanced. Hidden-path "low on both" was replaced by "within 1 point" for that reason.
- Sample sizes are 150 to 300 lives per cell, so differences under about 3 points on a rate near 93% are noise. Bug rolls change the random stream, so scenarios do not share exact lives.
- `tools/balance.mjs` grants Root Access to the next netling after the codex completes; the game grants it at once. `lines2.mjs` with `MID=1` (plus the one-line hook in its row) models the game; `lines.mjs` and the first Rogue-gate tables in the sketch do not, and run egg 1 about a life long.
- The patch was built against 1.0 at the time of writing; if `src/sim.js` changes, re-apply by hand.
