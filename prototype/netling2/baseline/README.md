# Netling 2.0 simulator baseline

Taken 2026-10-08 on branch `ccr-d71db475-tnfy9b`. The rules code is at `956cbce`; every commit since only adds this directory. It is the whole simulator suite in `prototype/netling2/sim/` re-run under the rules decided so far, so later changes (the stage-care package, wider maps, ICE tiers by layer) can be compared with one set of numbers.

Everything here is a model with scripted players, not a measurement of people. Read the limits in `docs/netling2-prototypes/README.md` before quoting a figure.

## Files

| Path | What |
|---|---|
| `run-all.mjs` | The runner. `node prototype/netling2/baseline/run-all.mjs [jobFilter] [--jobs=4] [--lives=1000] [--force]`. Resumable: a job whose output exists is skipped, and an output is written only after a clean exit. `--smoke` runs tiny counts to check that every job starts |
| `summarize.mjs` | Builds `summary-balance.md` from the four balance JSON files |
| `summary-balance.md` | Generated: 37 archetypes by 16 columns for each configuration, and each egg against core |
| `results/` | One file per job (`.json` where the tool supports `JSON=1`, otherwise `.txt`), and `_run.log` (start, finish and duration of every job) |

## Configurations

| Name | Switches | Used by |
|---|---|---|
| core | none: the 2.0 core rules only (Standing, temper, bugs, the clinic, the soft push); egg pressures, netrun rules and perks off | `balance-core` |
| full-iron | `NR2=all PERKS=1`, Iron's wear (`IRON.on`), owner multiplier 3, Iron's Overclock benefits tripled | `balance-full-iron`, `runcost-iron`, `egg-anomaly-iron` |
| full-program | `NR2=all PERKS=1`, Overdrive (Charge 80+ held 3 awake hours, exit under 65, bleed 8, overflow 2), owner multiplier 3 | `balance-full-program`, `runcost-program`, `egg-anomaly-program` |
| full-wetware | `NR2=all PERKS=1`, Overlink (Sync 85+ held 3 awake hours, exit under 70, the brake: infection at 90+, burnout on the second play, 24 hour cooldown), owner multiplier 3 | `balance-full-wetware`, `runcost-wetware`, `egg-anomaly-wetware` |
| rules | `NR2=all PERKS=1`, no pressure; sweeps that model a pressure set their own | every other sweep |

The pressure numbers are the ones `clinic-final.mjs`, `grace-sweep.mjs` and `hint-sweep.mjs` already use for the final design in `docs/NETLING_2_EGG_PRESSURES.md`.

**Comparability note.** `runcost-sweep.mjs` and `egg-anomaly-sweep.mjs` default to a minimal Program and Wetware pressure (`hold` only). The runner passes the full final design instead (for Iron that adds the owner multiplier of 3 and the tripled Overclock benefits, which the scripts' own Iron default leaves out), so their tables are not directly comparable with the older tables in the notes.

## Sample sizes

- Whole-life balance: 1000 lives per archetype, 37 archetypes (the docs say 36; the fork has 37).
- Life-count sweeps: 1000 lives, except `lineage-sweep` (200 lineages of 15, 20 and 40 lives for attentive, daredevil and casual; each is 3 eggs in a row).
- Netrun sweeps: their own defaults when above 1000 (challenge 2000, Foresight and egg anomaly 3000), else 1000.
- Noise at 1000 lives: about 1 point on a full-life rate near 90%. At 200 lineages the Rogue-gate median moves by about 1 life.

## Headline: full-life rate by egg (percent, 1000 lives)

| archetype | core | Iron | Program | Wetware |
|---|---:|---:|---:|---:|
| attentive | 99.8 | 99.7 | 95.0 | 99.8 |
| casual | 92.4 | 93.8 | 94.9 | 93.3 |
| worker | 82.9 | 89.5 | 81.4 | 82.9 |
| sysadmin | 99.5 | 99.8 | 92.2 | 99.1 |
| daredevil | 99.8 | 99.5 | 93.6 | 99.4 |
| overclocker | 96.2 | 94.9 | 96.8 | 96.8 |
| ghosthunter | 100.0 | 99.7 | 80.5 | 98.6 |
| steer-tune-corp | 100.0 | 100.0 | 67.5 | 99.1 |
| steer-tune-street | 99.7 | 99.0 | 98.7 | 99.4 |
| human-casual | 3.2 | 5.4 | 4.9 | 4.2 |
| human-regular | 25.5 | 31.2 | 28.9 | 29.1 |
| human-keen | 63.5 | 67.9 | 65.0 | 67.6 |

Full tables: `summary-balance.md`.

## New findings

1. **Program with the Charge-drain perks.** Under Program, Tune corp (`chargeDrainMult` 0.8) and the hidden form (0.85 on Charge and Sync) lose a lot of full life: steer-tune-corp 100.0 to 67.5, ghosthunter and the hidden-path hunters 100 to about 81 or 82. Mechanism (read from the code, not isolated by an experiment): slower Charge drain keeps the bots in Overdrive's band longer, where the Integrity bleed accrues. `notes/perks-traits-notes.md` (line 49) listed this interaction as a check still to do; this is that check. Tune street (a Sync perk) is fine on Wetware (99.4). Caveat: the bots always top Charge up, so a person who stops feeding at the cost would not pay it.
2. **Program costs ordinary heavy-Charge players 5 to 7 points** (attentive 4.8, sysadmin 7.3, daredevil 6.2). The older egg-pressure notes recorded a smaller figure (attentive 97%, sysadmin 94%, daredevil 93.5%); this run adds `NR2=all` and `PERKS=1`.
3. **Iron helps the worker** (82.9 to 89.5) and the sparse human archetypes (+4 to +6). Not investigated.
4. **Wetware moves almost nothing** on full life. Its cost shows in infections (the `viruses` column of `summary-balance.md`); I did not tabulate temper.

## Against the figures in the docs

| Doc figure | Now | Note |
|---|---|---|
| human-casual 4%, human-keen 65% (netrun notes, section 4) | 3.2%, 63.5% | within noise |
| Even gaps of 4 hours or less give 93% to 99% full lives, 5 hours 73%, 6 hours 24%, 8 hours 5% (sketch) | 2h 99.2, 3h 94.1, 4h 90.6, 5h 62.0, 6h 22.8, 8h 3.2 | the notes already say 4 and 5 hour gaps moved down (stronger bugs); 5 hours is 11 points under the old figure |
| Rogue gate: attentive 9 (7 to 12), daredevil 10 (7 to 15), casual 22 (13 to 36) | 9 (7 to 13), 9 (7 to 14), 20 (12 to 35) | within noise; casual used 40 lives and 200 lineages, the old table 26 lives and 100 |
| Ending median: attentive 7, casual 14 (p90 25) | 7, 16 (p90 28) | casual later; likely the same cap effect, not isolated |
| First elder: casual life 8 (88% reach) | life 10 (98% reach) | probably the old 26 life cap: lineages that reach an elder late were not counted; not isolated |
| Hidden adult: 45% of lives at 9 check-ins a day, 1% at 6 (sketch, hunters) | 52% at 9 a day, 1% at 6 (hidden teen 51% and 4%); 93% at 17 a day | consistent |

## Jobs

| Job | Output | Seconds |
|---|---|---:|
| balance-core, -full-iron, -full-program, -full-wetware | `balance-*.json` | 736, 936, 914, 918 |
| lineage-attentive, -daredevil, -casual | `lineage-*.json` | 173, 244, 397 |
| bug, clinic, push, gap, human, hunter, temper, item, exchange-stock, role | `*.txt` | 80 to 507 |
| clinic-final | `clinic-final.txt` | 1764 |
| grace, hint, heat-hint, sides, stat-profile | `*.txt` | 150 to 863 |
| iron, iron-cold | `*.txt` | 1311, 1335 |
| runcost-iron, -program, -wetware | `runcost-*.txt` | 349, 343, 339 |
| netrun, challenge, foresight | `*.txt` | 74, 85, 191 |
| egg-anomaly-iron, -program, -wetware | `egg-anomaly-*.txt` | 12 each |
| act-sweep-charge, -sync; band-sweep-charge, -sync | `*.txt` | 987 to 998 (band-sync: see `_run.log`) |

`act-sweep` and `band-sweep` test designs the maintainer rejected (action-based and banded pressure); they are here only so "everything" is true.

## Not run, and limits

- `act-calibrate.mjs` needs a bar and a line as arguments and is a calibration helper, not a sweep.
- The first run was killed twice when the container restarted. `balance-core` finished before the first kill; the rest was rerun, so run times in `_run.log` include contention from four parallel jobs. Results do not depend on contention.
- Not run: `npm run smoke`, any device check, any playtest.
- These are scripted players with the assumptions listed in `docs/netling2-prototypes/README.md`. The stage-care package, rest calls and wider maps are not modelled here; this directory is the "before".
