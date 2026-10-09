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

**Correction (same day).** The first run's `full-iron` configuration left out the final Charge and Sync pressure numbers that `clinic-final.mjs` applies to every egg, so `balance-full-iron`, `runcost-iron` and `egg-anomaly-iron` were rerun after fixing it. The first outputs are in `results/superseded/` and should not be used.

## Configurations

| Name | Switches | Used by |
|---|---|---|
| core | none: the 2.0 core rules only (Standing, temper, bugs, the clinic, the soft push); egg pressures, netrun rules and perks off | `balance-core` |
| full-iron | `NR2=all PERKS=1`, Iron's wear (`IRON.on`), owner multiplier 3, Iron's Overclock benefits tripled | `balance-full-iron`, `runcost-iron`, `egg-anomaly-iron` |
| full-program | `NR2=all PERKS=1`, Overdrive (Charge 80+ held 3 awake hours, exit under 65, bleed 8, overflow 2), owner multiplier 3 | `balance-full-program`, `runcost-program`, `egg-anomaly-program` |
| full-wetware | `NR2=all PERKS=1`, Overlink (Sync 85+ held 3 awake hours, exit under 70, the brake: infection at 90+, burnout on the second play, 24 hour cooldown), owner multiplier 3 | `balance-full-wetware`, `runcost-wetware`, `egg-anomaly-wetware` |
| rules | `NR2=all PERKS=1`, no pressure; sweeps that model a pressure set their own | every other sweep |

The pressure numbers are the ones `clinic-final.mjs`, `grace-sweep.mjs` and `hint-sweep.mjs` already use for the final design in `docs/NETLING_2_EGG_PRESSURES.md`.

**Comparability note.** `runcost-sweep.mjs` and `egg-anomaly-sweep.mjs` default to a minimal Program and Wetware pressure (`hold` only). The runner passes the full final design instead (for Iron that adds the owner multiplier of 3, the tripled Overclock benefits and the final Charge and Sync numbers, which the scripts' own Iron default leaves out), so their tables are not directly comparable with the older tables in the notes.

## Sample sizes

- Whole-life balance: 1000 lives per archetype, 37 archetypes (the docs say 36; the fork has 37).
- Life-count sweeps: 1000 lives, except `lineage-sweep` (200 lineages of 15, 20 and 40 lives for attentive, daredevil and casual; each is 3 eggs in a row).
- Netrun sweeps: their own defaults when above 1000 (challenge 2000, Foresight and egg anomaly 3000), else 1000.
- Noise at 1000 lives: about 1 point on a full-life rate near 90%. At 200 lineages the Rogue-gate median moves by about 1 life.

## Headline: full-life rate by egg (percent, 1000 lives)

| archetype | core | Iron | Program | Wetware |
|---|---:|---:|---:|---:|
| attentive | 99.8 | 99.7 | 95.0 | 99.8 |
| casual | 92.4 | 94.5 | 94.9 | 93.3 |
| worker | 82.9 | 83.3 | 81.4 | 82.9 |
| sysadmin | 99.5 | 99.2 | 92.2 | 99.1 |
| daredevil | 99.8 | 99.3 | 93.6 | 99.4 |
| overclocker | 96.2 | 94.0 | 96.8 | 96.8 |
| ghosthunter | 100.0 | 98.0 | 80.5 | 98.6 |
| steer-tune-corp | 100.0 | 99.7 | 67.5 | 99.1 |
| steer-tune-street | 99.7 | 99.5 | 98.7 | 99.4 |
| human-casual | 3.2 | 3.7 | 4.9 | 4.2 |
| human-regular | 25.5 | 28.4 | 28.9 | 29.1 |
| human-keen | 63.5 | 66.3 | 65.0 | 67.6 |

Full tables: `summary-balance.md`.

## New findings

1. **Program with the Charge-drain perks.** Under Program, Tune corp (`chargeDrainMult` 0.8) and the hidden form (0.85 on Charge and Sync) lose a lot of full life: steer-tune-corp 100.0 to 67.5, ghosthunter and the hidden-path hunters 100 to about 81 or 82. Mechanism (read from the code, not isolated by an experiment): slower Charge drain keeps the bots in Overdrive's band longer, where the Integrity bleed accrues. `notes/perks-traits-notes.md` (line 49) listed this interaction as a check still to do; this is that check. Tune street (a Sync perk) is fine on Wetware (99.4). Caveat: the bots always top Charge up, so a person who stops feeding at the cost would not pay it.
2. **Program costs ordinary heavy-Charge players 5 to 7 points** (attentive 4.8, sysadmin 7.3, daredevil 6.2). The older egg-pressure notes recorded a smaller figure (attentive 97%, sysadmin 94%, daredevil 93.5%); this run adds `NR2=all` and `PERKS=1`.
3. **Iron moves almost nothing.** With the final Charge and Sync numbers applied, no archetype is more than 3 points from core (worker 83.3 against 82.9, overclocker 94.0 against 96.2). The first baseline run showed Iron helping the worker (89.5) because its configuration left those numbers out; that output is kept in `results/superseded/`.
4. **Wetware moves almost nothing** on full life. Its cost shows in infections (the `viruses` column of `summary-balance.md`); I did not tabulate temper.

## Follow-up: Program and the Charge-drain perks

Scripts: `sim/program-perk-sweep.mjs` (one factor at a time) and `sim/program-bot-sweep.mjs` (players who mind the cost, `PROGBOT=avoid|watch` in `sim/balance.mjs`). Rows: `results/followup/`. 1000 lives each, Program's final design, `NR2=all PERKS=1`.

**Which factor.** Full life, percent:

| variant | tune-corp | ghosthunter | hunter-shown | attentive | sysadmin | tune-street |
|---|---:|---:|---:|---:|---:|---:|
| base | 68.4 | 82.3 | 83.0 | 96.2 | 93.3 | 98.4 |
| no perks | 98.6 | 98.6 | 98.5 | 98.6 | 98.2 | 99.3 |
| no Charge perk (Tune corp and hidden set to 1) | 97.6 | 97.8 | 98.1 | 98.9 | 96.8 | 98.4 |
| no Overdrive bleed | 99.3 | 99.4 | 99.2 | 99.7 | 99.4 | 99.7 |
| no overflow multiplier | 67.5 | 85.8 | 83.3 | 96.9 | 92.8 | 98.3 |
| no pressure | 99.9 | 99.8 | 99.8 | 99.8 | 99.9 | 99.6 |

The Integrity bleed is the damage and the Charge-drain perks (Tune corp 0.8, hidden 0.85) are what keep the bots in Overdrive long enough for it to matter. The overflow multiplier plays no part. (The "no perks" variant leaves the perk-dependent drop tables in place, which are fixed at import.)

**A player who minds the cost** (perks on; benefits are per life):

| archetype | bot | full life % | in Overdrive % | win drops | play gain | faults |
|---|---|---:|---:|---:|---:|---:|
| steer-tune-corp | greedy (the default bot) | 68.4 | 33.6 | 20.8 | 1661 | 0.33 |
| steer-tune-corp | watch | 99.2 | 18.4 | 18.0 | 1530 | 0.42 |
| steer-tune-corp | avoid | 100.0 | 0.0 | 13.7 | 1305 | 0.75 |
| ghosthunter | greedy | 82.3 | 29.3 | 28.9 | 2327 | 0.00 |
| ghosthunter | watch | 97.9 | 15.5 | 25.7 | 2194 | 0.02 |
| ghosthunter | avoid | 99.9 | 0.0 | 21.2 | 1977 | 0.47 |
| attentive | greedy | 96.2 | 12.2 | 16.9 | 1500 | 0.39 |
| attentive | watch | 99.6 | 8.1 | 16.2 | 1458 | 0.49 |
| attentive | avoid | 100.0 | 0.0 | 14.2 | 1380 | 0.95 |
| sysadmin | greedy | 93.3 | 13.1 | 19.1 | 1712 | 0.01 |
| sysadmin | watch | 98.7 | 8.7 | 18.4 | 1681 | 0.04 |
| sysadmin | avoid | 99.7 | 0.0 | 17.2 | 1656 | 0.83 |

Reading:
- A player who stops feeding when Integrity falls under 70 (`watch`) survives in 98% to 99% of lives and keeps about 87% to 92% of the win drops and play gain. For that player the finding mostly goes away.
- A player who never enters the state (`avoid`) survives about as often, gives up a third of the win drops (tune-corp 13.7 against 20.8), and takes more faults (0.75 against 0.33) because Charge sits lower between check-ins.
- A player who ignores the cost (the default bot) still loses 18 to 32 points as Tune corp or the hidden form. That is the worst case, not the typical one.
- Assumptions: the 70 threshold for `watch`, and that the player understands the state and its cost at all. The thresholds are hidden by design (`docs/NETLING_2_EGG_PRESSURES.md`), so a first-time player is the greedy case once.

**Final break settings** (maintainer: Integrity 40, a 12 hour lockout, one fault a break; `BRAKE='{"on":true}'` is the final configuration): `balance-brake-iron`, `-program`, `-wetware` (1000 lives of 37 archetypes) and `results/followup/program-bot-sweep-final-*.txt`.
- Program, full life without the break to with it: steer-tune-corp 67.5 to 99.5, ghosthunter 80.5 to 98.1, the hidden-path hunters about 81 to 97.6 to 98.3, sysadmin 92.2 to 97.9, attentive 95.0 to 99.1, steer-glitch 90.9 to 99.4. Every Program archetype that is not a human archetype or the neglectful one is at 97.6 or better. The cost is faults: heavy greedy players take 3.3 to 3.6 more a life (hunters, ghosthunter, Tune corp; bugs +0.4), ordinary ones 1 to 2.
- Iron: nothing moves by 1.5 points except worker (83.3 to 82.1, within noise at 1000 lives); faults rise by 0.5 to 1.0 for the unsteady and daredevil archetypes.
- Wetware: nothing moves by 1.5 points; two archetypes take 0.5 more faults.
- Bot sweep (Charge perks on), no break to final, full life / win drops / faults: greedy Tune corp 68.4 to 99.3 / 20.8 to 18.2 / 0.33 to 3.11; watching Tune corp 99.2 to 99.4 / 18.0 to 17.7 / 0.42 to 1.03; greedy ghosthunter 82.3 to 98.2 / 28.9 to 25.1 / 0 to 2.09; watching ghosthunter 97.9 to 97.8 / 25.7 to 25.5 / 0.02 to 0.36; the avoiding player is unchanged. A player who minds the bar now pays about a third of what a careless one does in faults, for the same benefit.

**Earlier break tests** (kept for the record; the final settings above replace them): the first break was at Integrity 55 with a 24 hour lockout and no consequence (`balance-brake55-*`), then at 40 (`balance-brake40-lock24-*`). Notes on those and on the lockout tests:

**With the break** (`BRAKE='{"on":true}'`; design in `docs/NETLING_2_EGG_PRESSURES.md`, "The break"): These were the first runs at **Integrity 40** with a 24 hour lockout and no consequence (now `balance-brake40-lock24-*` and `followup/program-bot-sweep-brake40-lock24-*`; the test at 55 is `balance-brake55-*` and `followup/program-bot-sweep-brake55-*`). 1000 lives of 37 archetypes each; `summary-balance.md` compares each with the same egg without it.
- Program, full life without the break, at 55 and at 40: steer-tune-corp 67.5, 99.7, 99.1; ghosthunter 80.5, 98.6, 98.3; the hidden-path hunters about 81, 98.6 to 99.4, 97.7 to 98.3; sysadmin 92.2, 98.6, 97.5; attentive 95.0, 99.6, 99.3. At 40 every Program archetype is at 97.5 or better and nothing is worse than with no break.
- Iron and Wetware: no archetype moves by 1.5 points or more at either line.
- Bot sweep (Charge perks on), full life / win drops a life, no break, 55, 40: greedy Tune corp 68.4 / 20.8, 99.8 / 15.1, 99.2 / 17.2; watching Tune corp 99.2 / 18.0, 99.5 / 15.0, 99.5 / 17.4; greedy ghosthunter 82.3 / 28.9, 98.6 / 23.1, 98.1 / 24.7; watching ghosthunter 97.9 / 25.7, 98.4 / 23.5, 97.8 / 25.3.
- Reading: the lower line costs 0.3 to 1.5 points of full life and returns about 83% to 96% of the unbraked benefit. A careful player and a careless one end up with almost the same benefit (17.4 against 17.2 for Tune corp), so the break protects the careless without rewarding the careful.
- **Lockout length** (break line 40; Program only; `results/followup/program-bot-sweep-brake-lock{8,12}-*.txt`, `results/balance-brake-lock{8,12}-program.json`), no break / 24h / 12h / 8h: greedy Tune corp full life 68.4 / 99.2 / 99.6 / 99.6, win drops 20.8 / 17.2 / 18.1 / 18.1, time in Overdrive 33.6 / 15.3 / 19.9 / 19.9 percent; greedy ghosthunter win drops 28.9 / 24.7 / 25.7 / 25.7; watching players barely move (Tune corp 18.0 / 17.4 / 17.7 / 17.7). No archetype in the 37 moves by 1 point or more between 24h, 12h and 8h; mean netruns a life 13.43, 13.26, 13.25 (12.81 with no break). 8 and 12 hours are identical to the digit, probably because both end before the netling wakes (sleep is 22:00 to 07:00 and a hold needs 3 awake hours); not isolated. A shorter lockout gives greedy play about 5% more benefit and puts it level with, or just above, careful play (Tune corp 18.1 against 17.7), so it does not help the break reward care.
- Decided since: the maintainer chose a 12 hour lockout. Untested: the warning line (70), and an Iron-specific trigger.

**Break consequences, all three eggs** (`sim/break-consequence-sweep.mjs`, `results/followup/break-consequence-*.txt`; line 40, 12 hour lockout, 1000 lives; Iron 6 archetypes, Program 7 with the default bot and with `PROGBOT=watch`, Wetware 6 with the default bot and `SYNCBOT=greedy`). Mean over archetypes, plain break against the break plus a consequence (the human-keen archetype, near 65% full life everywhere, is the minimum in every row and is not an effect of the break):

| egg / bot | breaks a life | full life % plain / +1 fault / +10 integrity / both | faults a life plain / +1 fault |
|---|---:|---|---|
| Iron / default | 0.35 | 93.3 / 93.3 / 93.2 / 93.0 | 1.50 / 1.90 |
| Program / default | 1.74 | 93.8 / 93.6 / 93.4 / 93.3 | 1.13 / 2.63 |
| Program / watch | 0.30 | 94.1 / 94.0 / 93.9 / 93.8 | 1.17 / 1.48 |
| Wetware / default | 0.17 | 93.7 / 93.7 / 93.7 / 93.6 | 1.28 / 1.46 |
| Wetware / greedy | 0.19 | 93.2 / 93.2 / 93.2 / 93.2 | 1.26 / 1.45 |

- A fault a break is cheap in survival (largest single loss 0.8 points, Program ghosthunter) and separates the two Program players: a greedy ghosthunter takes 0.02 faults a life with the plain break and 3.55 with a fault, a watching one 0.02 and 0.73; Tune corp 0.43 and 3.63 against 0.45 and 1.12. Bugs per life for the default Program bot rise from 0.08 to 0.19 and temper falls from 1.23 to 0.78.
- Ten Integrity a break costs more survival than a fault (ghosthunter 1.7 points, no faults) and leaves no trace the player can read. Both together is the largest loss (2.1 points).
- The greedy and heavy Program players break often (ghosthunter 4.9 and Tune corp 3.4 a life with the default bot, against 0.7 when watching), which a 12 hour lockout allows (a life is about 5 days).
- Iron's hot players (overclocker) lose the most there (0.7 points with a fault); Wetware barely registers it, because the break fires 0.17 times a life even for the greedy bot.

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
| balance-core, -full-iron, -full-program, -full-wetware | `balance-*.json` | 736, 952, 914, 918 |
| lineage-attentive, -daredevil, -casual | `lineage-*.json` | 173, 244, 397 |
| bug, clinic, push, gap, human, hunter, temper, item, exchange-stock, role | `*.txt` | 80 to 507 |
| clinic-final | `clinic-final.txt` | 1764 |
| grace, hint, heat-hint, sides, stat-profile | `*.txt` | 150 to 863 |
| iron, iron-cold | `*.txt` | 1311, 1335 |
| runcost-iron, -program, -wetware | `runcost-*.txt` | 343, 343, 339 |
| netrun, challenge, foresight | `*.txt` | 74, 85, 191 |
| egg-anomaly-iron, -program, -wetware | `egg-anomaly-*.txt` | 11, 12, 12 |
| act-sweep-charge, -sync; band-sweep-charge, -sync | `*.txt` | 987, 998, 994, 1010 |

`act-sweep` and `band-sweep` test designs the maintainer rejected (action-based and banded pressure); they are here only so "everything" is true.

## Not run, and limits

- `act-calibrate.mjs` needs a bar and a line as arguments and is a calibration helper, not a sweep.
- The first run was killed twice when the container restarted. `balance-core` finished before the first kill; the rest was rerun, so run times in `_run.log` include contention from four parallel jobs. Results do not depend on contention.
- Not run: `npm run smoke`, any device check, any playtest.
- These are scripted players with the assumptions listed in `docs/netling2-prototypes/README.md`. The stage-care package, rest calls and wider maps are not modelled here; this directory is the "before".
