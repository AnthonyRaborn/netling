# Netling 2.0 rule prototypes

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

Run from the scratch copy with Node 22. Each driver takes an archetype name from `tools/balance.mjs` and a number of lives.

| Measurement | Command (example) | Settings used for the sketch |
|---|---|---|
| Standing gap and tie-break leader chance | `BUGS='{"on":false}' node gap.mjs casual 0.25 300` | packets at 0.25 (the second argument), decisions at 1.0's values |
| Standing track totals, anomaly nodes, runs | `BUGS='{"on":false}' node standing.mjs casual 200` | packets 0.25, no fault cap |
| Bugs, death rates, clearing | `BUGS='{"clear":true}' NOCAP=1 node bugs.mjs casual 300 S2` | `NOCAP=1` removes the fault cap; scenarios B1 (1.0 as is, `BUGS='{"on":false}'` and no `NOCAP`), B2 (`on:false` with `NOCAP`), S1 (`{}`), S2 (`clear`), S3 (`clear`, `chance` 0.5), S4 (`chance` 0.5, `max` 8) |
| Temper levels | `ITEMTEMPER=1 FLOW=0.5 S1=3 S2=6 U1=2 U2=6 BUGS='{"clear":true,"tdecay":0.999519}' node temper.mjs attentive 300` | flow +0.5 an hour, 24-hour decay, items +1, thresholds -6, -2, +3, +6 |
| Care preferences | `ITEMTEMPER=1 PREF='{"on":true,"reqbias":true,"steadyMode":"last2","distinct":true,"ice":true}' PREFBOT=follow BUGS='{"clear":true,"tdecay":0.999519}' node pref.mjs attentive 300 FOLB3I` | follow bot; `PREFBOT=ignore` for the ignore bot; `PREF='{"on":false}'` for off |
| Actions per life | `BUGS='{"on":false}' node acts.mjs casual` | counts feeds, plays, cooling and so on over 100 lives |

Results are printed as one JSON line each. The sketch quotes them with their limits.

## Known limits

- The bots are 1.0's archetypes. They cycle mini-games in a fixed order and choose packets at random, so they cannot stand in for a player with habits. The preference-following bot sees temper directly, which a real player has to infer.
- Bugs from netrun-disconnect faults are not rolled, Heat from actions is not scaled by bugs, and clearing by Standing or by a netrun anomaly is not modeled (only the scrip route, at scheduled check-ins).
- Standing is 1.0's one signed number, so a netling with both tracks high looks balanced. Hidden-path "low on both" was replaced by "within 1 point" for that reason.
- Sample sizes are 150 to 300 lives per cell, so differences under about 3 points on a rate near 93% are noise. Bug rolls change the random stream, so scenarios do not share exact lives.
- The patch was built against 1.0 at the time of writing; if `src/sim.js` changes, re-apply by hand.
