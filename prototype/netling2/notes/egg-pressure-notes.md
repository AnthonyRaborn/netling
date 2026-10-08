# Egg pressure notes (scratch, not for docs yet)

Status: brainstorm. Nothing implemented or measured. Keep out of docs until simulator numbers exist.

## Decisions so far (maintainer)
- Program, Iron and Wetware must be equal on average. The hidden Rogue egg will be deliberately harder later.
- Test Program's rattle timer first.
- Keep notes in scratchpad, not in docs.

## Principle
Equal on average, different in who pays. Calibrate each egg so mean infections per life match 1.0 for every
archetype; only the predictor of infection differs.

## Facts from the code (1.0 src/sim.js, fork prototype/netling2/sim/sim.js)
- Virus hazard per hour = virusBasePerHour 0.02 + virusPerCachePerHour 0.03 * cache pips; SCAV DATA adds 12%.
  So Program's virus is already partly causal (cache), not purely random.
- One event slot (`s.event`); two events can never be open together. Real triage needs a second slot.
- The fork has no egg concept yet. An egg flag with per-egg hooks is the first thing to add.

## Pressures
| | Program: Triage | Iron: Restraint | Wetware: Consistency |
|---|---|---|---|
| State | rattle (timer) | wear | shock |
| Raised by | event answered in last third of its window | SUSTAINED Heat over ~70 (not peaks) | feed-type switches vs the last feed (not blocks) |
| Effect | next event window ~25% shorter for 2h | past threshold LOCK drain +10%, higher: drift | infection hazard scales with shock |
| Relief | answer promptly | time at low Heat, faster in IDLE | decays ~24h |

## Worry 1: Wetware pushes toward one Standing
Cause: feeds are the Standing source, so penalising feed-type switches penalises balance.
Mitigation: count a switch only against the LAST feed. Blocks (corp, corp, corp, street, street, street) cost one
switch per block, so a balance seeker can plan in blocks; flip-flopping pays most. Optionally a free allowance of
switches per 24h. Unsteady (wants the other type every feed) pays the most, which is the intended tension.
To measure: hidden-path hunter (needs tracks within 1) pass rate on Wetware vs Program; Standing gap distribution.

## Worry 2: Iron pushes toward steady
Cause: Heat moves temper volatile (overclocked and flow states), so avoiding Heat drifts steady, and steady
netlings are easier to steer (role certain 59-71% vs 5-8%).
Mitigation: make wear a duty-cycle cost (sustained redline), not abstention. Short spikes (a netrun) are free; a
burst followed by IDLE or VENT is free. Volatility then still comes from faults, Segfault and Black ICE shard.
To measure: temper level distribution per archetype, Iron vs Program; share reaching Metronome unsteady hold;
role-certain rate.

## Pass bar (proposed)
Per archetype, vs Program: infections per life, full-life rate within noise (~3 points at 300 lives); temper
distribution and Standing gap distribution within noise for archetypes that did not choose to seek them.

## Open
- Free allowance size for Wetware switches.
- Wear thresholds and the sustained-Heat window.
- Rattle: 25% and 2h are placeholders; attentive players pay most, check the attentive archetype.

## Result 1: Program rattle timer (prototype/netling2/sim, RATTLE env, off by default)
Run: 1000 lives per archetype, rattle off vs on. Not run: smoke test, any device, any human playtest.
- Placeholders (late 2/3 of window, cut 25%, 120 min): full-life rate and infections per life are unchanged within
  noise (about 1.2 points at 1000 lives) for all nine archetypes. The timer is set about 0.8 to 1.0 times a life but
  changes only 0.2 events a life, since events are rare (about 9 a life) and mostly not close to the cut.
- Infections are the wrong metric for this pressure. Viruses come mostly from the cache hazard; the rattle acts on
  event outcomes (trace ignored, overflow crash, intrusion landing). Use events timed out per life and full-life rate.
- Stronger settings (late 0.34, cut 0.67, 720 min): attentive unchanged (99.7 to 99.8%), casual 92.2 to 91.4%,
  worker 83.2 to 78.9%, human-regular unchanged. Events answered a life fall (attentive 5.21 to 4.71).
- So: faint at the placeholders, and when strengthened it hurts the sparse-check-in players (worker) most, not the
  present player. That cuts against the intent (a skill test for the present player) and acts like a gap penalty.
- Options: leave as pure flavor (log line plus a tiny effect); change the trigger so it does not depend on check-in
  spacing (e.g. two events within an hour); or move to the real two-slot triage.

## Result 2: Program pileup trigger (RATTLE mode 'pileup': an event opens within `gap` min of the previous one ending)
1000 lives per archetype, off vs four settings (gap/cut: p1 60/0.25, p2 120/0.5, p3 240/0.5, p4 120/0.5 answered-only).
Noise is about 1.2 to 1.5 points on a full-life rate at 1000 lives.
- Events rattled a life: p1 0.5 to 1.1, p2 0.9 to 2.0, p3 1.4 to 3.3 (of 3.6 to 10 events). p1 changes nothing beyond noise.
- Full-life: attentive and daredevil unchanged (99.5 to 99.9%). Worker 83.2% to 81.7 (p1), 79.3 (p2), 77.9 (p3),
  80.3 (p4). Casual 92.2 to 92.8 (p1), 90.6 (p2), 91.3 (p3), 91.7 (p4). Human-regular and human-keen move by +1 to +2,
  which is within noise and not a real gain.
- Finding: the pileup trigger depends on arrival, not check-ins, but ANY window cut falls hardest on slow answerers,
  because a cut turns "answered at minute 100 of 120" into a timeout. So no window-cut setting is both felt and
  gap-neutral. Answered-only (p4) halves the exposure but not the worker's loss.
- Next idea: cost instead of window. While rattled, an answer costs a little extra (e.g. +5 Heat or -5 Charge). A
  player who is absent pays nothing, a present player pays a small tax. Opposite bias to the window cut.

## Result 3: Program answer cost (RATTLE heat/charge with cut 0; pileup trigger)
1000 lives per archetype. Variants (gap, Heat, Charge): c1 120/5/0, c2 120/10/5, c3 240/10/5, c4 240/15/10.
- Gap-neutral: worker full-life 83.2% off against 82.2 to 82.8 on; casual, attentive, daredevil and the four human
  archetypes all within noise. Temper unchanged (daredevil -4.78 to -4.64 at most). Infections unchanged.
- Rattled events a life 1.2 to 3.2 (c1 to c4); extra costs paid 0.2 to 1.9 a life (daredevil most, since it answers most).
- Invisible in aggregate even at c4 (+15 Heat, -10 Charge, about 1 to 2 payments a life): a life's drain is far larger.
  So it can only be flavor, felt per moment on the meters, not a balance lever.
- Where this leaves Program: pileup trigger + small answer cost is safe at every setting tried. The window cut is not.
  If it needs to be felt, raise the gap (240 min) rather than the cost.

## Result 4: Iron wear (prototype/netling2/sim, IRON env, off by default; IRONBOT=avoid makes a bot cool earlier once wear builds)
1000 lives per archetype. Wear builds from Heat over `heat` (rate 0.12 per point per minute), decays 1/180 a minute
(3x at rest), and replaces the flat base infection hazard 0.02/h with floor + slope * wear/100 (floor 0.012 to 0.016,
slope 0.3). Cache and SCAV DATA infection terms are unchanged.
- Threshold 70: sustained hot play costs a lot (daredevil 7.3 to 11.2 infections, overclocker 8.9 to 13.3, full life
  96.2 to 91.4%), and a player who avoids it flattens temper (daredevil -4.78 to -2.36; the unsteady 12h hold for the
  unsteady seeker falls from 41% to 7%). This confirms the worry that Iron's restraint pushes toward steady.
- Threshold 75: still drifts (unsteady hold 44% to 32% for an avoider).
- Threshold 80 (floor 0.014, slope 0.3, avoider bot): temper change under 0.2, unsteady hold 0.43 to 0.39 (daredevil),
  0.41 to 0.40 (seeker). Mean infections for the five ordinary archetypes 6.30 to 6.17 (about 2% under; floor 0.016
  would match). Full-life rate within noise for all except the overclocker (96.2 to 94.9%). Hot players pay: daredevil
  7.3 to 8.0, overclocker 8.9 to 10.5, unsteady seeker 7.1 to 7.7 infections a life.
- Threshold 85: nothing to feel (equal to off within noise even for hot players).
- Reading: at 80, wear only meters real redlining (the band 1.0 already alerts at), so the volatile 65 to 80 play that
  drives temper stays free. The cost is that the pressure touches ordinary players hardly at all (wear high share
  under 1% of awake time) and is felt only by overclockers. As Iron's identity it is thin; it is not a gap penalty.
- Not modelled: a human's response to the warning line, the LOCK drain effect, and wear from netruns or Black ICE shard
  (the notes proposed those; only Heat counts so far).

## Result 5: Wetware shock (WET env, off by default; WETBOT=settle feeds the same type as last once shock builds)
1000 lives per archetype. A feed of the other packet type from the last feed adds `shock` (3); shock halves every 24h;
the base infection hazard becomes floor + slope * shock/100 (floor 0.0075, slope 0.03). Bots feed about 40 to 115
times a life (not the 6 to 10 a day I assumed), so a per-switch value of 10 saturated at 100 for almost everyone;
3 is the calibrated value.
- Equal on average: mean infections of the five ordinary archetypes 6.30 off, 6.15 on (about 2% under; floor 0.009
  would match). Full-life rate within noise everywhere.
- Who pays (infections a life, off to on): flip-flopping balancer (hunter-exact) 7.27 to 7.32; block-feeding balancer
  (3 of one type, then the other) 7.18 to 6.57; steady follower 6.72 to 6.36; unsteady follower 7.24 to 7.43; corpo
  (never switches) 3.93 to 2.76. The whole spread is about 1.3 infections either side of average: faint, like Program.
- The Standing worry: no sign of a push to one side. Random-diet players: Standing gap at adulthood 2.91 to 2.95
  (attentive), 2.66 to 2.72 (casual). With the settle bot (feeds the same type once shock reaches 30): attentive 3.05,
  hunter-exact gap 0.17 to 0.30 and hidden adult 96% to 94%. Block feeding keeps the hidden path (94%) and costs less.
- The temper tension is real but small: an unsteady follower pays about +0.2 infections, a steady one about -0.4
  (a 0.6 swing a life) and its Sync bonus is unchanged.
- Reading: the pressure only touches the base infection term (about 2.4 of 7 infections a life), so every egg's
  pressure lands at the same faint size. To make any of them felt, the lever is what shock or wear also touches
  (Sync drain, a bug chance), not the threshold. IRON defaults are now the calibrated ones (heat 80, floor 0.014,
  slope 0.3).

## Result 6: widening Iron's wear (IRON lock, prototype/netling2/sim/iron-sweep.mjs)
Widening was tried by touching more (LOCK, Sync drain up to x(1+lock) at wear 100) and by lowering the Heat threshold. 400 lives per
archetype, wear off against seven settings; IRONBOT=avoid cools earlier once wear builds.
- Ordinary players are not touched by any setting: attentive, casual, worker, human-regular and human-bursty stay within noise on full-life,
  infections, temper (wear high share 0 to 2.8% of awake time even at threshold 70). The widening cannot reach them, because they do not run hot.
- Hot players feel it, and LOCK adds a second cost: overclocker Sync mistakes 0.56 to 1.46 a life and temper -7.7 to -9.3 at (80, lock 1)
  (a feedback: hot play, wear, Sync drain, faults, unsteady). Daredevil 80/lock 1: infections 7.3 to 7.9, Sync mistakes 0.02 to 0.05.
- Threshold 75 with lock 1: wear high share daredevil 1.6% to 10%, overclocker 9% to 18%. A non-avoider pays infections 7.3 to 9.3 and
  temper -4.8 to -5.9; the AVOIDER pays infections 8.9 but keeps temper (-4.72 against off -4.77) and the unsteady 12h hold (0.415 against
  0.445), so the Restraint worry (Iron pushes toward steady) does not appear: the cost is real and avoidable without flattening.
- Threshold 70 with lock 1 is too low: the avoider flattens temper (daredevil -3.91, unsteady hold 0.23 against 0.445 off) and non-avoiders pay
  11 to 13.5 infections and 0.43 to 2.7 Sync mistakes.
- Reading: (75, lock 1) is the widened setting that is felt by the players it is aimed at without distorting temper or touching anyone else.
  Not adopted as the default yet (IRON.lock defaults to 0, heat 80). Not modelled: a human's response to the warning line, wear from netruns
  (runs are instant in the sim and the 2 to 3 hour cooldown lets wear decay between them), Black ICE shard.

## Result 7: Iron pushed from both ends (IRON cold and restFloor; prototype/netling2/sim/iron-cold-sweep.mjs, stat-profile.mjs)
Wear also builds while Heat is under `cold` (awake only), and `restFloor` stops nap and sleep cooling below it. 400 lives per archetype; the
hot side is the Result 6 setting (75, lock 1). IRONBOT=chill cools at 30 and over, whatever the wear.
- Heat profile (stat-profile.mjs): rest cools Heat to about 0 (median Heat on waking 0.05), and awake ordinary play spends 6 to 10% of its
  time under 10 and 8 to 15% under 20, mostly the warm-up after a rest (awake Heat then drifts up 3 an hour). So a cold line with no rest floor
  taxes everyone: cold 20 without a floor takes the worker's full-life rate from 84% to 53%, attentive infections 7.6 to 9.8, casual 7.2 to 9.5.
- A floor equal to the cold line removes that: cold 20, floor 20 leaves attentive (7.61 against 7.61 off), sysadmin, casual, worker and
  human-regular within noise of "hot only" on full-life, infections and temper. Cold 15, floor 15 is gentler still; cold 25, floor 25
  starts to touch ordinary play (attentive 8.63, casual full-life 0.898).
- The cold side catches the over-cooler and nobody else: chiller infections hot-only to two-sided (cold 20, floor 20): attentive 7.4 to 14.5,
  sysadmin 7.2 to 17.3, casual 7.2 to 10.7 (full-life 0.958 to 0.853), daredevil 7.3 to 14.1. Their temper falls back toward the middle
  (attentive 5.3 to 3.3, steady 12h hold 0.54 to 0.16), so cooling hard to dodge the hot side is no longer free.
- The floor has a cost for hot players: waking at 20, not 0, leaves less headroom (overclocker hot-only temper -10.2 to -11.3, infections 12.0 to
  12.4). Daredevil about the same (9.26 to 9.50). Worker temper moves -0.3.
- Reading: a push from both ends works with floor = cold line = 20 (a comfortable band of about 20 to 75): ordinary play is unaffected, the
  hot and the over-cooling pay. Not adopted as defaults (IRON.cold 0, restFloor 0). Not modelled: how a human reads the cold warning, and the
  floor's effect on flow and overclock timing beyond temper.
- Ideas for the other two, untested: Wetware's opposite end is monotony (one packet type for too long), but that taxes committed Standing
  steering (the corpo player), which Result 5 already flagged; Program's rattle has no natural opposite end yet.

## Decision (maintainer): Iron's pressure is adopted
Restraint: Heat band 20 to 75 (hot line 75 with the Sync (LOCK) effect x1, cold line 20, nap and sleep cool no lower than 20). Defaults in
`IRON` (sim.js); still switched on with IRON='{"on":true}'. Idea from the maintainer: each egg manages one meter, Iron Heat, Wetware Charge,
Program Sync.

## Result 8: a band on Charge (Wetware) or Sync (Program) (BANDS, prototype/netling2/sim/band-sweep.mjs, stat-profile.mjs)
Strain builds above `hi` and under `lo` while awake and replaces the base infection hazard (floor 0.014, slope 0.3, as Iron's). 400 lives per
archetype. Charge and Sync behave almost the same.
- Profile (stat-profile.mjs): the bots keep an attentive player's Charge and Sync at 80 and over for about half of awake time (they top up to 85
  and play to 80 to 90 at each check), while the worker spends 23% of awake time under Charge 10 and the casual and human players spread across
  the whole range. Heat is different: its level follows choices (play, overclock), so a Heat band was neutral; Charge and Sync follow check-in
  cadence.
- High end: hi 85 hits the present players (attentive infections 7.6 to 11.7, sysadmin 7.5 to 12.4, daredevil 7.3 to 10.9; Sync: 12.5, 14.5,
  11.9) and leaves casual, worker and human players near their baseline (+0.1 to +0.8); hi 90 is about half that; hi 95 is nothing. So it taxes
  attention, not skill.
- Low end: lo 25 and lo 15 hit the sparse check-in players: worker full-life 84.5% to 53% (lo 25) or 58% (lo 15), casual 92.5 to 88.8%,
  human-regular infections 4.1 to 5.7. That is a gap penalty, the same finding as Program's rattle window cut.
- Reading: a band on the meter's level is not a neutral egg pressure for Charge or Sync, because those levels are set by when the player
  checks in. Next idea, not built: put the strain on what the player does, not where the meter sits (Wetware: a feed that lands above a
  line, Program: a play when Sync is already high), with a free allowance, as the shock does for switching; or give Wetware and Program a
  second axis that is a choice, not a level.

## Result 9: action-based strain (Program on Charge, Wetware on Sync)

Scripts: `act-sweep.mjs`, `act-calibrate.mjs`. Strain +3 per corp/scav feed (Charge) or play (Sync) while the stat is at or over the line, halving every 24 h; infection hazard rises with strain above a floor. Budgeter bot skips those actions at or over the line. Mean infections a life of the five ordinary archetypes (attentive, casual, worker, sysadmin, human-regular), off = 6.65.

- Charge, line 70: 7.8 at floor 0 (7.96 at 0.004). Floor 0 is the minimum, so the floor is not the lever. Sysadmin and attentive pay most (+2.1, +2.4); worker +0.2. A budgeter pays in infections less (attentive 6.2) but the sparse worker's full-life rate falls from 0.845 to 0.72-0.76. Cadence-sensitive for the worker.
- Sync, line 65: 8.64 at floor 0. Sysadmin +5.6, attentive +3.8, casual +0.3, worker 0. A budgeter pays about nothing (worker full-life 0.83 vs 0.845). Cadence-neutral.
- Not equal on average yet: both overshoot by 1.1 to 2.0. Remaining levers: a higher line, a smaller `add`, a longer half-life. Not run.
- Who pays is wrong for both: the two heaviest feeders/players (sysadmin, attentive) pay, which is the "pay for what you do" intent, but the mean must come back to off before this is adopted.

## Result 10: two-sided Charge and Sync (SIDES)

Design (user): every egg gets both sides on Charge and Sync; the owner's meter (Program: Charge, Wetware: Sync; Iron owns Heat, so neither) has every effect x2. No bug resistance on Sync's high side. Charge high (85+): play pays more Sync, wins drop more; cost: overflow likelier, Integrity bleeds. Charge low (30-): drain and Heat drift slower; cost: play needs more Charge. Sync high (85+): visits likelier, wins drop more; cost: infection hazard up, temper amplified. Sync low (30-): fewer events; cost: wins drop less. Script `sides-sweep.mjs`; code `SIDES` in sim.js (off by default). 200 to 300 lives per cell; not unit-tested.

Time in the sides (awake): attentive/sysadmin/daredevil sit high 34-43% of the time and low 5%; worker sits low 43-46% and high 5-7%; casual about 10-14% each. So the high side is the attentive player's side and the low side the sparse player's.

Pass 1 (cost bleed 1.5, overflow 0.5, virus 0.3, swing 0.0002; low slow 0.25, gate 5): infections within +-0.3 everywhere; the low-side benefit lifts sparse players on every egg incl. Iron (worker full-life 0.833 -> 0.907, mistakes 9.1 -> 6.5). The cost side barely bites.
Pass 2 (bleed 4, overflow 1, virus 0.6, swing 0.0004; slow 0.1, gate 10): full-life stays within noise for attentive, sysadmin, daredevil, overclocker (0.93-1.0). Infections up 0.2-1.0 (sysadmin 7.33 -> 7.9 to 8.3). Wetware temper amplified (attentive 4.9 -> 7.0, sysadmin 5.5 -> 8.4, daredevil -4.95 -> -7.0, overclocker -7.5 -> -8.5): the swing works but pushes the mean away from off. Worker: mistakes 8.95 -> 7.1 (Program) to 8.0, full-life 0.84 -> 0.865-0.88; casual mistakes 6.65 -> 5.7-6.2. Still a sparse-player benefit on every egg, from the low side's slower drain.
Open: the swing is a bias, not an equal-mean change; the low-side benefit helps sparse players on non-owner eggs; the owner contrast (x2) is small in infections and full-life, visible mainly in Wetware temper and Program worker mistakes.

## Result 11: SIDES with owner-only low benefit, steady decay, x3 and sharper thresholds

Changes from Result 10: low-side benefits (slower Charge drain and Heat drift, calmer Sync) go to the owner only (`lowOwnerOnly`); the low-side costs stay for all eggs. The Sync temper swing is gone; high Sync instead decays positive temper faster (`steadyDecay` 0.0005 a minute x owner multiplier) and raises infections (virus 0.6 x multiplier). Costs: bleed 4, overflow 1, gate 10. 200 lives per cell, `sides-sweep.mjs` with the JSON overrides; not unit-tested. Cases: A = x3, 85/30; S = x2, 80/35; C = x3, 80/35.

- Owner-only works: on Iron and Wetware the worker is no longer buffed (mistakes 8.95 off vs 8.5 to 9.2); on Program it is (A 6.3, S 6.6, C 5.2). Full-life stays 0.82 to 0.88 for all.
- Infections: Wetware pays most (sysadmin 7.33 -> 8.24 A, 8.63 S, 8.96 C; attentive 7.67 -> 8.3, 8.0, 8.2). Program +0.3 to +0.5 for heavy players, a drop for the worker (6.56 -> 6.1). Iron +0.2 to +0.6 for heavy players (non-owner costs).
- Temper: steady decay lowers attentive and sysadmin on every egg (attentive 4.93 -> 3.6 Iron, 3.1 Program, 2.5 Wetware in A; 2.05 Wetware in C; sysadmin 5.45 -> 3.1 Wetware in A, 2.5 in C). Below the +3 threshold, so a Wetware attentive player mostly loses Steady. Daredevil and overclocker move toward 0 by +0.7 to +1.2.
- Full-life, ordinary five: within noise in A and S (0.82 to 1.0 against off 0.84 to 1.0). C hurts heavy owners: overclocker Program 0.95 -> 0.86, daredevil Program 0.935, sysadmin Program 0.965.
- A (x3, 85/30) gives the cleanest owner contrast without full-life harm. Sharper thresholds (S, C) add owner cost for the heavy archetypes and little contrast for the ordinary ones.
- Open: steadyDecay costs Wetware attentive players Steady; Iron's equivalent of the owner-only low benefit (extra reward for running cold) is unbuilt.

## Result 12: one special state per bar (Surge, Wired, Overclock), low sides as deficits only

Config: x3 owner multiplier, high at 85, low at 30; low-side benefits removed (slow 0, calm 0), low-side costs kept for every egg (gate 10, dull 0.3); high-side costs as Result 11 (bleed 4, overflow 1, virus 0.6), no steady decay; Iron rows run with the adopted wear model (Heat is Iron's bar). P = Flow unchanged. Q = Flow also blocked while Charge or Sync is in its high state (`flowShared`). 200 lives per cell, `sides-sweep.mjs`; not unit-tested.

- Q fails: attentive and sysadmin sit at 85+ a third of the time, so the Flow share goes from 0.27/0.32 to 0 and their temper drops from 4.9/5.5 to 2.6 (Steady lost). 85 is where good players normally are, so it is not a special state yet.
- Time on a high side by threshold (awake, off, attentive/sysadmin/casual/worker, 60 lives): 85 about 34-42% / 32-41% / 10-12% / 5-7%; 90 about 19-24% / 17-24% / 6% / 3-4%; 95 about 7-9% / 6-10% / 2% / 1-2%. 95 is "special".
- P: worker full-life 0.84 -> 0.77 (Iron, with wear), 0.785 (Program), 0.805 (Wetware); casual Program 0.875 (off 0.94). The low-side gate (10 more Charge to play under 30) costs sparse players on every egg, and Program's worker no longer has the slower-drain benefit.
- P infections, ordinary five: within +-0.7 of off (attentive 7.4 to 8.1, sysadmin 7.6 to 8.4 Wetware, worker 6.1 to 6.6, human-regular 3.8 to 4.6). Daredevil and overclocker pay on Iron (9.5, 12.0 against 7.3, 8.7) because of the wear model; not a new effect.
- Open: raise the special-state threshold (95); make the low-side gate owner-only or drop it; Flow stays Heat-gated unless the special states are made rare enough to gate it.

## Result 13: special states at 95, low-side gate dropped

Config: x3, high at 95 for Charge and Sync, Charge gate 0, low-side benefits off, Sync low dull 0.3, costs as Result 12, Iron with wear. R = Flow unchanged; T = Flow blocked while Charge or Sync is at 95+. 200 lives per cell.

- Time on a high side: attentive/sysadmin/daredevil 6-11%, overclocker 4-5%, casual 2%, worker 1-2%, human-regular 3%.
- R: the ordinary five stay within noise on full-life (attentive/sysadmin 0.99 to 1.0, casual 0.9 to 0.95, human-regular 0.27 to 0.28) and infections (+-0.5, Wetware sysadmin 7.69, attentive 7.84 against 7.33, 7.67), temper (+-0.4). The owner contrast is small: Program attentive 7.52, Wetware 7.84 against Iron 7.57; owner effects are mostly flavor at 7-10% of the time.
- T fails again: requiring no 95+ moment in the 180 Flow minutes drops the attentive Flow share from 0.27 to 0.002 and the sysadmin's from 0.32 to 0.002 (temper 4.9 to 2.2, 5.45 to 2.65). Any brief touch of 95 resets the counter. Flow stays Heat-gated.
- Worker full-life still falls on every egg (0.84 off; Iron 0.81, Program 0.815, Wetware 0.755). With the Charge gate gone the likely cause is Sync low's dull (fewer drops, x3 on Wetware) on the worker's 43% of time at low Sync; not isolated.
- Daredevil and overclocker pay on Iron as before (9.3, 12.1 infections).
- Open: effects at 95 are nearly inert for averages; the owner contrast would need stronger effects or a state that is entered on purpose (held). Isolate the worker drop (dull).

## Result 14: held special states (Surge, Wired)

State is entered after `hold` awake minutes at the entry level and left under `exit` or on rest (`SIDES.<bar>.hold`/`exit`, `sideHold`/`sideHeld` in sim.js; not the temper `hold`). Charge: enter 80, hold 180, exit 65. Sync: enter 85, hold 180, exit 70. x3 owner, Iron with wear, Flow Heat-gated, low-side gate and benefits off, Sync low dull 0.3. H = costs bleed 4, overflow 1, virus 0.6. G = double (bleed 8, overflow 2, virus 1.2). 200 lives per cell. The benefits (play gain, drops, visits) are in the sim but not measured here.

- Who enters (share of awake time): attentive 12% Charge / 6% Sync, sysadmin 12-13% / 11-12%, daredevil 12-13% / 10% (2% on Iron). Casual, worker, human-regular and overclocker never enter, so they are unchanged from off on Program and Wetware.
- H: no ordinary archetype moves outside noise (full-life 0.99 to 1.0; infections attentive 7.39 to 7.56, sysadmin 7.21 to 7.58; temper -0.3 to -0.5). Flow share falls a little (attentive 0.27 -> 0.21 to 0.24). Owner contrast is small.
- G: the owner contrast appears and only where the owner's bar is held. Program: attentive full-life 0.97, sysadmin 0.94, daredevil 0.935 (others 0.99 to 1.0); Flow 0.27 -> 0.185, 0.32 -> 0.23. Wetware: sysadmin infections 7.97 against 7.27 to 7.30 on Iron/Program, attentive 7.71 against 7.29 to 7.46. Iron unchanged by G (its pressure is wear).
- Open: the benefits are unmeasured, so G is a cost-only reading; the Program cost (Integrity bleed x3) is the one that moves full-life.

## Result 15: benefits of the held states (G costs)

Same run as Result 14's G (200 lives per cell), with `SIDE_METER` counters (win drops, Sync gained per play, visits, a life). Benefit strengths unchanged: Charge held: play Sync +15% and win drops +25% (x3 owner); Sync held: visits +25% and win drops +25% (x3 owner). Overclock (Iron, existing) is win drops x1.5.

- Win drops a life, off -> Program / Wetware: attentive 12.6 -> 13.3 / 13.2 (+5%), sysadmin 13.66 -> 15.1 / 14.8 (+10%), daredevil 15.6 -> 16.6 / 16.8. Casual, worker, human-regular, overclocker unchanged (never enter).
- Sync a play: attentive 19.8 -> 20.5 Program (+3.5%), sysadmin 19.8 -> 20.7.
- Visits a life: attentive 4.4 -> 4.5 Program / 4.8 Wetware (+9%), sysadmin 4.5 -> 4.7 Wetware, daredevil 4.45 -> 4.8 Wetware.
- Iron's Overclock gives more (daredevil drops 15.6 -> 18.6, overclocker 13.1 -> 16.9) and costs more (infections 9.3 and 12.2).
- Read: against the costs in Result 14 (Program sysadmin full-life 0.99 -> 0.94, Wetware sysadmin infections +0.7) the benefits are small (+3 to +10%) because the states are held about 12% of the time. Raising benefit strength is the lever to make holding worth the risk.

## Result 16: tripled benefits (G costs)

Base benefit strengths x3 (Charge held: play Sync 0.45, drops 0.75; Sync held: visits 0.75, drops 0.75; x3 owner on top, so the owner's effective values are drops +225%, play +135%, visits +225%). Costs as G (bleed 8, overflow 2, virus 1.2). Same states and thresholds as Result 14. 200 lives per cell. Note: Result 15's closing line described the previous owner-effective values (+75%, +45%, +75%) as the tripled ones; they were the old values.

- Win drops a life, off -> Program / Wetware: attentive 12.6 -> 15.2 / 14.3 (+20% / +13%), sysadmin 13.7 -> 17.0 / 17.2 (+25% / +26%), daredevil 15.6 -> 17.3 / 18.2. Iron's Overclock: daredevil 19.7, overclocker 16.9.
- Sync a play: attentive 19.8 -> 22.1 Program (+11%), sysadmin 22.0; capped by the 100 ceiling.
- Visits: attentive 4.4 -> 4.7 Program / 5.3 Wetware, sysadmin 4.5 -> 5.6 Wetware (+23%).
- Costs: Program full-life attentive 0.975, sysadmin 0.975, daredevil 0.92; infections flat to slightly down (daredevil 6.9). Wetware: full-life 0.99 to 1.0, sysadmin infections 7.78 (off 7.33), temper -0.1 to -0.7.
- Never-entering archetypes (casual, worker, human-regular, overclocker) unchanged from off on both eggs.
- Read: the trade is now close to even for heavy players (about +25% drops for -2 points of full-life on Program, +25% drops and visits for +0.45 infections on Wetware). Iron's trade is bigger on both sides.
