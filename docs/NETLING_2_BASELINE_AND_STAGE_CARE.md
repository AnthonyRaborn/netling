# Netling 2.0: baseline, the break, stage care and map width

Handover from the session on branch `ccr-d71db475-tnfy9b`, written 2026-10-09. It covers what that session measured and decided with the maintainer, what was only discussed, and what to do next. The main design record is still [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md); this file is additive so the two branches can merge without conflicts.

Decided means the maintainer chose it. Proposal means it was discussed or suggested and nobody has chosen. Everything here is simulator-tested only; no device check, playtest or `npm run smoke` was run.

## Branch state (read first)

- `claude/game-egg-differentiation-xkl6x2` is the integration branch. Before this merge it already contained this session's earlier commits up to `e64a0fb`; this branch had the newer ones (the break at Integrity 40, the 12 hour lockout, the fault consequence, their tests and docs), and the other branch had newer sprite cleanup, text drafts, a handoff refresh and simulator changes (egg pages rolled on the way out, elders allowed to be stronger).
- On 2026-10-09 the integration branch (`a7eaba7`) was merged into this one with a merge commit. One conflict, in the sketch's Handoff, was resolved by keeping their text and re-adding this session's two pointer lines. `npm test` passes (503) and `npm run proto:test` passes (308 at the merge, 323 now).
- Baseline check after the merge: three archetypes (steer-tune-corp, attentive, human-keen) at 300 lives under the final configuration (`NR2=all PERKS=1`, Program's pressure design, the break on) give byte-identical JSON before and after the merge, so the other branch's simulator changes do not alter those numbers. That is a sample, not a full rerun; rerun `node prototype/netling2/baseline/run-all.mjs --force` if a number matters.
- This branch is now ahead of the integration branch by the merge and this session's newest commits; bring it back by merging this branch into `claude/game-egg-differentiation-xkl6x2` (the session only pushes to its own branch).

## The baseline

`prototype/netling2/baseline/` holds the whole simulator suite re-run under the rules decided so far: 38 jobs, 1000 lives where a sweep takes lives, 37 archetypes. Read its `README.md` for the tables, the comparison with the older doc figures, and the limits.

- Run it: `node prototype/netling2/baseline/run-all.mjs [jobFilter] [--jobs=4] [--lives=1000] [--force]`. It is resumable (a finished job is skipped; an output is written only after a clean exit). Never `import` the file to check it: importing runs it.
- Tables: `node prototype/netling2/baseline/summarize.mjs` writes `summary-balance.md`.
- Configurations: core (no switches), full-iron, full-program, full-wetware (`NR2=all PERKS=1` plus the egg's final pressure design), rules (`NR2=all PERKS=1`, no pressure).
- A correction in the history: the first run's Iron configuration left out the final Charge and Sync numbers; it was rerun and the old outputs are in `results/superseded/`. Do not use those.
- Finding: under Program, the Tune corp and hidden-form Charge-drain perks keep a netling in Overdrive long enough for its Integrity bleed to kill (Tune corp 68% full life, hidden form about 82%, for a player who never stops feeding). Isolated one factor at a time (`sim/program-perk-sweep.mjs`): the bleed is the damage and the Charge-drain perks are the enabler; the overflow multiplier plays no part. A player who watches the bar (`PROGBOT=watch`) pays little. This led to the break.
- Stage care was added after this baseline: `stageA-*` and `stageB-*` runs on each egg with the break (`results/balance-stage{A,B}-*.json`), not part of `summary-balance.md`.
- Where the older doc figures moved: five-hour awake gaps now survive in 62% of lives (73% before), casual first elder and ending are later (probably the old 26 life cap), everything else within noise. See the README table.

## The break (decided, maintainer)

Design and numbers: [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md), "The break". In short:

- A cost trigger with a warning, for all three states (Iron's Overclock, Program's Overdrive, Wetware's Overlink). While a state is active: Integrity under 70 gives a one-time warning; under **40** the state ends, the bar is pushed well below its exit line (Charge to at most 50, Sync 55, Heat 35), the state is locked out for **12 hours**, and the netling takes **one fault** (care mistake, temper loss, a bug roll).
- Simulator switch: `BRAKE='{"on":true}'` (off by default so every older table is unchanged; `sim/sim.js`, `BRAKE`). Knobs: `warnInt`, `breakInt`, `lockMin`, `drop`, `faults`, `integrityHit`.
- Result: in Program every non-human, non-neglectful archetype is at 97.6% or better (Tune corp 67.5 to 99.5, hidden hunters about 81 to 98); heavy greedy players take 3.3 to 3.6 more faults a life, a watching one about a third of that. Iron and Wetware move by under 1.5 points (Iron's worker 83.3 to 82.1, within noise).
- Tried and not chosen: break line 55; lockouts of 8 and 24 hours (8 and 12 are identical in the simulator, probably because both end before the netling wakes); ten Integrity a break (costs more survival and teaches nothing); fault plus Integrity.
- Open: Iron's trigger (the simulator uses Integrity for all three; Iron's real cost is hidden wear and Heat 85+); the warning line (70); how real players read the warning; whether `watch` (stop feeding under Integrity 70) is a fair model of a person; wording for the discharge, throttle and crash.
- Note that the break protects careless players without making careful play pay more in benefit (a watching Tune corp player and a greedy one end with about equal win drops). If care should earn more, the lever is a bigger consequence, not the lockout length.

## Stage care and rest (decisions from conversation; the draft is [NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md), which is the place to read and edit; this section is the summary)

Starting point: care is the same at every stage in 1.0 and in the 2.0 fork (drain is one number per meter; stage only changes the netrun cooldown). Vpets make young pets need more and older pets need less and more regular care. The package, in the order discussed:

- **Baby** (decided direction): needs more care, so its stage is **shortened to about 6 to 8 hours** (start 7), measured in wall-clock time (sleeping through it is fine); adult age moves to 46 hours (decided). It demands more food, which gives more Standing; add a multiplier only if the teen form becomes too random, and a random teen is acceptable. Today's casual teen check has a 71% tie rate already. Numbers open.
- **Hidden teen** (decided): keep 3 wins in each game. Nothing blocks a binge except Charge (6 a game, blocked under 10) and Heat (+12 a game). The hunter bots never binge, so the hunter sweep understates a person. To do: add a binger policy and rerun at a 7 hour baby.
- **Cache** (the vpet "poop"): babies produce more, adults as now, elders **x0.25** (decided). A cache file also raises virus and overflow chance, costs 5 Integrity at three or more files, blocks flow and gives PURGE its use (+0.5 temper, +4 Integrity), so removing it removes several things and kills the PURGE button for elders. Decided: **reduce** the elder rate (x0.25), which keeps PURGE alive (the alternative, a matching elder wear, was not chosen). Program's Overdrive overflow multiplier also needs a look.
- **Rest call** (decided, built in the fork and measured): a hidden sleep demand builds with form and stage and with runs and play, drops a little on a feed and a lot on a scheduled nap; past a line it fires a **rest call**, a notification (the app is an APK, so notifications are expected). Answering starts a rest of 20 to 30 minutes (random) at the nap drain rate with events paused. Ignoring it makes the netling **tired** (0 or 1) with extra drain (start near one bug's +16% on Charge and Sync; possibly blocks flow). Answering on time builds steady temper, missing it builds unsteady. A call-rest **pauses** a held state; a voluntary rest while not tired still breaks it (decided). Flavor per egg: Program "reset", Wetware "rest", Iron undecided; do not use "reboot" (post-crash recovery) or "defrag" (a proposed bug-clearing name). Naps keep their 2 hour cap and 4 hour cooldown. Two calls expected in the baby stage. Decided 2026-10-09: the response window is **60 minutes**, tired is a good start at x1.16 drain with flow blocked, adult age is **46 hours**, baby drain x2.4 for now. Notifications (decided): visitors never notify; timed events and attention requests are the **Events** class and count against a budget of 6 a day (measured 3.8 to 5.4 per 15 awake hours, under it everywhere); rest calls, stat alerts and evolution notices are **Care**, not counted; **Cooldowns** is the third class; Events and Care default on. The rest is answered with the relabelled nap button; Iron's word is calibration; the 30 minute on-time part stays; elder cache is reduced so PURGE is unchanged. Iron's button label is **CALIBRATE** (decided; CALIBRATION is 11 characters and the rule is 9). Open: the Cooldowns default (suggest off).
- Constraints to respect: a work-day gap stays fatal (decided earlier), so a rest call must not become a safety net; the care drafts decided "reskins, fixed button count, flavor-only rhythm" and stage curves reopen the rhythm part.
- How to test: stage tables in the fork for drain, cache chance and meal size, calibrated so a whole life keeps its difficulty; the safe longest gap per stage with `gap-sweep` and `human-sweep`; a response-probability model for rest calls (an assumption, to be labelled one).

## Map width and ICE tiers (decided and built in the fork)

- **Decided (maintainer, 2026-10-09):** Deep layers [3,4] wide with a second-link chance of **0.65**, Source [3,5] with **0.75**; **no tier gradient** along the run (the switch `NR2.tier.layer` stays in the fork, off). The widths and chances are the defaults of `NR2.map`, and `NR2=all` now switches the wider maps on (`sim/netrun/nr2.js`, `sim/netrun/map2.js`; tests in `nr2.test.js`).
- Why those numbers: wider layers give real lanes (no two-lane jumps, fewer lane changes), but at the old chance of .5 the runs get harder because lanes lock; the second-link chance is the lever. About .65 in the Deep and .75 in the Source is roughly difficulty-neutral for the bots, and it lifts Tune street with Foresight toward the mean of the nine forms. Measurements and tables: `prototype/netling2/baseline/README.md`, "Follow-up: wider Deep and Source maps".
- The netrun-class baseline outputs (netrun, challenge, Foresight, egg anomalies, lineage) were rerun with the chosen maps; the earlier outputs are in `results/superseded/narrow-maps/`. Whole-life balance does not move with the maps (no archetype by 1.5 points), so the other baseline outputs were not rerun.
- Not measured: the phone map (about 55 to 60 nodes), the fog, how a person scans a bigger map, and the cost of the route guarantees (`ensureOnEveryRoute`) on wider maps.

## Decisions of 2026-10-09, after the stage-care measurements (draft section 13)

Decided: baby drain 2.4 with bugs (option A); Standing gain 2, the fix rule and a Standing cost of 5; Cooldowns class off by default; elder stage not simulated yet; meal size by stage unchanged; hidden teen unchanged (reachable by a deliberate binge, 83 to 99% of hunter bots that binge); community sketch comes after the phone map feedback. Measured as decided: worker -17 to -21 points, hunter-casual about -5, teen ties 44 to 65% for regular play. The sections below record how those numbers were reached.

## Standing gain and the bug fix cost (measured, now decided)

Draft sections 9 and 10. `STANDINGGAIN` multiplies every source of Standing; on Program with the break and option 1, gain 2 gives about 44 to 59% teen ties for regular play and about 0% for strict guided play (the maintainer's target); sparse play stays tied. The bug fix rule (`standingOnlyIfShort`) and a cost of 5 change nothing measurable in the bots; recommended as asked. Gain 2 is confirmed on all three eggs (draft section 11). The next step in the maintainer's order: feedback on the phone map picture, then the community sketch.

## Parked

- **XP with per-stage caps** (0, 1, 2 and 3 level-ups for baby, teen, adult, elder; a choice of themed sidegrade options at each; stacking up to three with curves like 1.1, 1.25, 1.5; reset at death): a thought experiment. Stage care covers most of what it was for. If revived: random offers weighted toward owned options (pure random almost never lets a player specialize), costs that scale with stacks, and a pick-rate-when-offered check for dominance.
- **Third ICE tier** (folded into the layer idea above), **more home events** (only under a notification budget, inside the stage-care work), **multiplayer** (design document only; start without a backend: date-seeded content, the share line, transfer codes; true forums or live hacking need a backend and a trust model).

## Next steps, in the agreed order

1. Map width: decided and built (above); still to check: the route guarantees and the phone map. The tier gradient was declined.
2. The stage tables and the rest call are **built in the fork** (`STAGE`, `stage.test.js`) and measured alone and on each egg with the break: see the draft, sections 7 and 8. The open decision is the baby (drain, bug rule, a Standing multiplier; three options there). The stage-care draft document: **started and answered** (seven questions answered 2026-10-09), [NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md) (what care is today, the baby, elder, cache and rest call with starting numbers, the notification count, a test plan, four open questions). Measured alone and on top of each egg's pressure and the break (draft sections 7 and 8).
3. A community sketch (document only): moved to after the sprite review (maintainer, 2026-10-09).
4. Alongside: done 2026-10-09: Iron and Wetware watch bots (`IRONBOT=watch`, `SYNCBOT=watch|avoid`) and a player who watches every bar (`STATEBOT=watch`), measured on all three eggs (`sim/state-bot-sweep.mjs`, tests in `statebot.test.js`; baseline README, "players who mind the break"); wording for the break drafted for choice (care drafts, "The break": log lines, alert lines, lockout readout words, a field manual line, a one-time caption, optional strained chatter). The hunter binger was done earlier (draft section 12).

## Decisions of 2026-10-09, later (maintainer)

- The phone map picture is accepted (the map widths stand as built).
- The community sketch moves to after the sprite review.
- Next: build the Iron and Wetware break bots and suggest wording (done, above), then work through the remaining open items one at a time.

## Working notes for the next session

- The container restarts when idle and kills background jobs (it happened several times). Prefer `setsid nohup`, keep jobs resumable, and wait in the foreground with `timeout 590 tail --pid=<pid> -f /dev/null` (find the real pid with `pgrep -af`; a launching shell's pid exits at once). The run log is overwritten if two runners write it at the same time.
- Keep earlier results under their own names when a rule changes (`balance-brake55-*`, `balance-brake40-lock24-*`, `results/superseded/`), so a table can always be traced to the rules that made it.
- Tools added: `STAGE` in `sim/sim.js` and `stage.test.js`, `sim/notification-count.mjs`, `sim/map-metrics.mjs`, `sim/netrun/map2.js`, `sim/program-perk-sweep.mjs`, `sim/program-bot-sweep.mjs`, `sim/break-consequence-sweep.mjs`, `PROGBOT=avoid|watch` in `sim/balance.mjs`. Tests: `sides.test.js` (the break), `statebot.test.js` (the watch bots; 328 prototype tests pass), `bugcost.test.js`.
- Test notes: two of the break's own tests were first written wrongly (one mixed up Overdrive's and Overlink's breaks, one ignored the one-minute lag after a sudden Integrity hit); both are fixed and the reasons are in the test comments.
