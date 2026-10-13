# Netling 2.0 rule prototypes

Operational reference for the 2.0 rule simulator in `prototype/netling2/sim/` (a fork of 1.0's simulator, netrun rules and balance bot; `src/` and `tools/` are untouched, and before any 2.0 change the fork reproduced `npm run balance` exactly: casual, 100 lives). Not shipped, not in `sw.js`.

**Status.** Nothing here is player-tested. Every number comes from scripted bots, so it is a starting value for the maintainer to decide on, not a measurement of people. Noise is about 2 to 3 points on a rate at 300 lives (about 1.5 points a share on temper levels; differences under about 3 points near 93% are noise). Read "Known limits" before quoting a figure.

Long result tables and per-run narrative live in `../archive/netling2/PROTOTYPES_README_FULL.md` (a byte-identical copy of the previous README; headings below are quoted from it). Design history is in `../archive/netling2/`; the notes files are in `../archive/netling2/notes/` (`docs/archive/netling2/notes/netrun-sim-notes.md`, `docs/archive/netling2/notes/perks-traits-notes.md`, `docs/archive/netling2/notes/egg-pressure-notes.md`). Whole-suite 1000-life re-runs: `../../prototype/netling2/baseline/README.md`.

## Running things

All commands run from the repo root with Node 22. `npm run proto:test` runs the prototype's tests.

| Command | What it does |
|---|---|
| `npm run proto:balance [runs] [archetype]` | Lifetime simulations per archetype (`sim/balance.mjs`). `DETAIL=1` full report, `JSON=1` JSON (level keys are -2 to 2). 300 lives of all archetypes take about 3.5 minutes |
| `npm run proto:netrun` | `sim/netrun-sweep.mjs`: per-form netrun outcomes and a parity read-out |
| `npm run proto:lineage` | `sim/lineage-sweep.mjs`: lives to finish the 18 egg pages (replaces `lines`, `lines2`, `rogue`, `rogue2` on the fork); also tracks the ending and the Rogue gate |
| `node prototype/netling2/baseline/run-all.mjs` | Every sweep at 1000 lives into `baseline/results` (resumable; read `baseline/README.md` first; never import it, importing runs it) |

Environment switches (all off by default, so older tables reproduce). JSON values are objects merged over the defaults.

| Switch | Turns on / sets |
|---|---|
| `NR2=all` (or a JSON object) | Decided 2.0 netrun rules (`sim/netrun/nr2.js`): abilities per role and lean, harder ICE tier, forced filled cache, 5 minute grace window, light egg run costs, inventory rule, fate, Foresight, wider maps |
| `PERKS=1` | Perks by role and lean, traits by role, one keepsake per form, Decoy and Salvage cell. `FORCE_ADULT=<form>` makes every netling grow into that form (measurement aid) |
| `ROGUE=1` (or JSON) | Rogue as a per-life egg (no Standing, one teen, sweep in place of trace and intrusion, capture at three marks). Run with `SIDES` owner `"none"`. `SWEEPBOT=hide\|defend\|mix\|reserve` answers sweeps; `ROGUE_RUN` overrides the hunt in runs; `MERGEBOT=accept\|refuse` for the Source exit merge |
| `SIDES='{...}'` | Two-sided Charge and Sync, special states (Surge, Wired, Overclock, Overdrive, Overlink), play penalty, burnout; `owner` picks the egg boosted (x`ownerMult`). `SYNCBOT=greedy\|sip\|budget`, `PROGBOT`, `WETBOT`, `ACTBOT` set bot habits |
| `IRON='{...}'` | Iron's wear (hot line 75, cold line 20, rest cooling floor 20). `IRONBOT=avoid\|chill` cooling bots. `WET='{...}'` is Wetware's shock stand-in (not with `IRON`) |
| `OVERUSE='{...}'` | Owner strain: overfeeding (Program) and overplaying (Wetware) add strain that raises infection hazard |
| `BRAKE='{...}'` | Wetware's Overlink brake (break at Integrity 40, 12 hour lock); needs `SIDES` (and `OVERUSE` for the strain break) |
| `STAGE='{...}'` | Stage-care package (stage drain and cache multipliers, rest button, tired state) |
| `STANDINGGAIN=n` | Multiplies every Standing source (costs and tie weights stay absolute) |
| `BUGS='{...}'` | Bug settings: `chance`, `max`, `on`, `homeClear`, `integrityFlat`, `regenCut`, `charge`, `sync`, `heat`, `integrity`, `startBugs`. Defaults are `BUG_CFG` |
| `CLINIC='{...}'` | `clinicShare` (0.25), `healingOnlyAtClinic` |
| `CLEAR=scrip\|both\|none` | How bots clear bugs unless the archetype sets its own `fix`: scrip, or scrip and 2 Standing, or never |
| `PREF='{"on":false}'`, `PREFBOT=follow` | Care preferences off; bots follow their netling's preference |
| `INV`, `EGG=iron\|program\|wetware`, `SIM=1.0` | Inventory rules for `item-sweep.mjs` (`'{"slots":8,"stack":3,"scrap":0.5}'`); egg for `runcost-sweep.mjs` and `egg-anomaly-sweep.mjs`; `gap-sweep.mjs` on 1.0's simulator |

Rogue defaults: HIDE lockout 4 hours, DEFEND quiet 8 hours; `ROGUE='{"hideLockMin":0,"defendQuietMin":0}'` reproduces stage 1.

## Map of sim/ tools

| File | Question it answers |
|---|---|
| `sim/sim.js`, `sim/netrun/*` | The rules: Standing as two tracks, temper (24 hour half-life, five levels), bugs, no fault cap, teen/adult evolution, care preferences, 22 generic forms per egg; netrun rules, `nr2.js` switches, egg anomalies, Rogue map |
| `sim/netrun-bot.mjs`, `sim/balance.mjs` | Scripted netrun player and the archetype balance tool |
| `sim/role-sweep.mjs` | How committed to one game a player must be for the role to be certain |
| `sim/hunter-sweep.mjs` | How much play the hidden forms take |
| `sim/temper-sweep.mjs` | How much play the Metronome's 12 hour hold takes |
| `sim/gap-sweep.mjs`, `sim/human-sweep.mjs` | Survival against the longest gap between check-ins, and against irregular schedules |
| `sim/bug-sweep.mjs` | How a player should handle bugs (home-clearing policies, sets `homeClear`) |
| `sim/clinic-sweep.mjs`, `sim/clinic-final.mjs` | The clinic against no clearing and home clearing; against the final egg pressure design (share and fee) |
| `sim/push-sweep.mjs` | Whether the soft push gets a bugged player to a clinic |
| `sim/challenge-sweep.mjs` | The four challenge runs under 2.0 abilities and ICE tiers (netrun notes, section 13) |
| `sim/foresight-sweep.mjs` | What Foresight (Tune street) is worth (netrun notes, section 12; `UPKEEP`) |
| `sim/runcost-sweep.mjs`, `sim/egg-anomaly-sweep.mjs` | Egg run costs at the life level; egg-flavored anomalies (netrun notes, sections 11 and 10) |
| `sim/grace-sweep.mjs`, `sim/item-sweep.mjs`, `sim/exchange-stock.mjs` | The grace window; what the inventory loses; whether the corp exchange stock moves the bots |
| `sim/sides-sweep.mjs`, `iron-sweep`, `iron-cold-sweep`, `band-sweep`, `stat-profile` (all `.mjs`) | Egg pressures: two-sided stats, Iron's wear, its cold line and rest floor, level bands (rejected), per-stat profiles (`docs/archive/netling2/notes/egg-pressure-notes.md`) |
| `sim/hint-sweep.mjs`, `sim/heat-hint-sweep.mjs` | How often the one-time pre-state and Overclock/wear captions show (`HINT_MIN`) |
| `sim/rogue-netrun.mjs`, `sim/rogue-lineage.mjs` | Rogue's hunt per region; Rogue lines with NL-0 lives between them (`PICK`, `LINEBOT`, `FEAT=1`) |
| `baseline/*.mjs` | Whole-suite 1000-life runner and Rogue/gap re-run drivers (`gap-reruns.mjs` runs the "Do bugs kill?" re-run) |

More sweeps exist in `sim/` (`overuse-sweep`, `elder-sweep`, `act-sweep`, ...); see each file's header and `baseline/README.md`.

Archetypes added in the fork (defined in `sim/balance.mjs`): `steer-<role>-corp|street` (breach, dodge, tune, feast), `nudge-breach`, `hunter-exact|shown|shown-rotation|casual`, `human-casual|regular|keen|bursty`, `seek-steady|unsteady|unsteady-segfault`.

## The clinic

Decided design input (maintainer's design, kept after re-measuring against the final pressure design). Bugs cannot be cleared away from a netrun; only at a **clinic**, a third unaligned market node (`flavor: 'clinic'`, `clinicShare` 0.25 of market nodes). It fixes one bug for the market Charge fee (12) plus 15 scrip, or 2 Standing (2 corp, 1 and 1, or 2 street), stays open after a fix, and is the only market selling the healing items (Coolant cell, Repair kit, Antivirus patch; stock weights 3, 3, 2, unmeasured). Bots with bugs prefer a clinic in sight and pay by their `fix` policy.

- Share 25% is the best of 10/25/40; the fee is not a lever.
- Casual: 94% full life, 3.5 visits (no way to clear 91%, home clearing 95%).
- Players who rarely or never netrun cannot clear bugs: worker 83% against 79% with no way to clear, 21% at the bug ceiling; the overclocker (no runs) never visits.
- The soft push (statements plus the clinic job, 70% of offered jobs while bugged, 15 scrip) is the lever for workers: ceiling 21% to 6% when it acts half the time.

Full results: ../archive/netling2/PROTOTYPES_README_FULL.md, sections "The clinic (maintainer's design, first pass)", "The clinic against the final pressure design (re-measured)" and "Soft push to run (maintainer's request)".

## Headline findings (decided inputs only)

1. **Survival depends on the longest awake gap, not on check-in count.** Casual, evenly spaced, full life: 2 h 99%, 3 h 94%, 4 h 90%, 5 h 58%, 6 h 19%, 8 h 3% (1.0 behaves the same). Six check-ins a day at random times survive in 37% to 40% of lives. A work-day gap is not survivable (maintainer decided it stays). Full table: archive file, "Noisy players".
2. **Bugs kill moderately (decided: doubling plus flat 0.5 an hour a bug).** `BUG_CFG`: Charge and Sync +16%, Heat +20%, damage +8%, `integrityFlat` 0.5. Under the now rules (1000 lives, 30% a fault) points of full life lost to bugs: casual 0.7, worker 28.7, human-regular 6.2, human-keen 1.9; the worker carries 1.96 bugs and sits at the ceiling in 45% of lives (the spiral to watch). Archive file, "Do bugs kill? (decided: yes, moderately)".
3. **Role is cheap to steer.** Share of plays in one game: 0.2 gives role certain in 31%, 0.5 in 96%, 0.8 in 100%. Archive file, "Role steerers".
4. **The hidden forms need wins, not Standing.** Tracks stay within 1 of each other in 96% to 100% of lives; hurdle is 3 wins in every game by 17 hours and 29 wins in all by 51 hours. `hunter-shown` at 17 check-ins a day: hidden teen 85%, adult 97%; 9 a day 45% and 44%; 6 a day 5% and 1%. Archive file, "Hidden-path hunters".
5. **Following the preference works against the hidden path and the role.** Hidden adult for `hunter-shown` falls from 98% to 22%; steerers fail to reach a certain role in 27% to 41% of lives. Archive file, "Hidden-path hunters following their netling's preference" and "Role steerers following their netling's preference".
6. **Metronome (12 hour hold) at 17 check-ins a day:** `seek-steady` 90%, `seek-unsteady` 44%, `seek-unsteady-segfault` 92% (13.2 faults, 14% at the bug ceiling). `seek-steady` falls to 30% at 9 a day and 1% at 6 a day. Archive file, "Temper seekers".
7. **Care preferences pull the unsteady end back:** overclocker's 12 hour unsteady hold 89% with preferences off against 80% on; daredevil 45% against 35%. Archive file, "New findings".
8. **Rogue stage 1:** mean full life 79.6% against 89.7% for the NL-0 eggs, all on sparse players captured by expiring sweeps (casual 33%, attentive 100%); a 180 minute window brings casual to 98%. Design and results: `../archive/netling2/ROGUE_DRAFTS.md`, sections 7 to 7.5.
9. Egg pressures, perks and netrun abilities: figures are in `../archive/netling2/EGG_PRESSURES.md`, `PERKS_TRAITS_DRAFTS.md` and the notes files, not here.

Baseline cross-check (1000 lives, `NR2=all PERKS=1`): most rows agree within noise; the differences are listed in the archive file under "Baseline check". Read ranges, not single numbers.

## Reproducing a run

Preferred: run the fork in the repository (`npm run proto:balance ...` or `node prototype/netling2/sim/<sweep>.mjs [lives] [bases]`) with the switches above. Seeds are fixed, so a run repeats; bug rolls change the random stream, so scenarios do not share exact lives.

The earlier figures (the sketch's) came from the scratch patch: `docs/netling2-prototypes/netling2-prototype.patch` is a unified diff against 1.0 (`src/sim.js`, `src/netrun/run.js`, `tools/balance.mjs`) adding bugs (`BUGS`), a temper stand-in, a Standing stand-in, care preferences (`PREF`, `PREFBOT`) and counters. Apply it only to a scratch copy, never to the repository's game code:

```bash
mkdir /tmp/n2 && cp -r src tools package.json /tmp/n2/ && cd /tmp/n2
patch -p1 < <repo>/docs/netling2-prototypes/netling2-prototype.patch
cp <repo>/docs/netling2-prototypes/*.mjs .
```

The drivers in this directory (`gap`, `standing`, `bugs`, `temper`, `pref`, `acts`, `guard`, `hold`) need the patched copy; `lines`, `lines2` need an unpatched copy; `egg-pages` reads `tools/baseline/lineages.json`; `rogue`, `rogue2` read the `lines` outputs. `guard.mjs` and `hold.mjs` also need a sampler hook in the scratch copy's `tools/balance.mjs`; `lines2` with `MID=1` needs a one-line Root Access hook. Per-driver commands and settings: ../archive/netling2/PROTOTYPES_README_FULL.md, section "Reproducing a run". Patch contents: same file, section "What the patch changes". The patch was built against 1.0 at the time of writing; if `src/sim.js` changes, re-apply by hand. Prefer the fork for anything new.

Also cut (same archive file): the section "Rules modeled" (full rule list and what the sim records per life), "Not modeled", and "Fidelity checks" (sketch against this simulator; the hot end, daredevil and overclocker, does not reproduce and the gap is unexplained).

## Known limits

- The bots are 1.0's archetypes plus the added ones. They cycle mini-games in a fixed order (only the role steerers choose a game) and choose packets at random, so they cannot stand in for a player with habits. The preference-following bot sees temper directly, which a real player has to infer. No bot reacts to a glitching sprite. The hunters decide perfectly from the floors; no real player counts wins per game without a tally.
- Bots detour to a clinic only when it is one step ahead or within three steps and visible. The clinic's share, fee and stock weights are guesses. Bugs do not carry between lives. The value of the exchange's stock to a human is not modeled (bots buy the first wanted offer).
- Bots top up Charge and Sync to 85 or 94, not 100, and carry only an Antivirus patch for a long gap. Segfault seekers use every Segfault they find; the warm seekers have one fixed heat policy; the 12 hour length and neglect rule were not tuned here.
- The Standing display (floors) and neglect's look are not modeled. In the scratch patch Standing is 1.0's one signed number, so a netling with both tracks high looks balanced and "low on both" was replaced by "within 1 point"; the fork has two real tracks.
- Sample sizes are 150 to 300 lives per cell in the older tables (1000 in the baseline), so differences under about 3 points on a rate near 93% are noise. Side effect of the soft push: bots that read the job board accept every kind of job, so their scrip rises (a worker ends with about 46 against 20).
- `tools/balance.mjs` (patched or unpatched copy) grants Root Access to the next netling after the codex completes; the game grants it at once (in the fork Root Access arrives mid-life, as in the game; `lines2.mjs` with `MID=1` models it in a scratch copy). `lines.mjs` and the first Rogue-gate tables in the sketch run egg 1 about a life long.
- Tables not re-run after later rule changes keep the figures they were measured with: the egg pressure sweeps, the exchange stock, and the quoted bug-lethality experiments. Not verified: `npm run smoke`, any device check.

Full limits as first written: ../archive/netling2/PROTOTYPES_README_FULL.md, section "Known limits".

## Cut sections (all in ../archive/netling2/PROTOTYPES_README_FULL.md)

Tables and discussion removed from this file, by heading: "Role steerers", "Hidden-path hunters", "Noisy players", "Bug policies (home clearing; ...)" (single-rule clearing policies; superseded because home clearing is no longer allowed), "Temper seekers", "Fidelity checks", "Rules modeled", "Not modeled", "Baseline check", "Do bugs kill? (decided: yes, moderately)" (candidate effects and the old 400-life runs), "Soft push to run (maintainer's request)", "The clinic (maintainer's design, first pass)", "The 2.0 simulator (current)" (the per-run notes on NR2, PERKS and Rogue stages 1 to 3), and "What the patch changes".
