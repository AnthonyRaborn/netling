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

## Result 7: Iron pushed from both ends (IRON cold and restFloor; prototype/netling2/sim/iron-cold-sweep.mjs, heat-profile.mjs)
Wear also builds while Heat is under `cold` (awake only), and `restFloor` stops nap and sleep cooling below it. 400 lives per archetype; the
hot side is the Result 6 setting (75, lock 1). IRONBOT=chill cools at 30 and over, whatever the wear.
- Heat profile (heat-profile.mjs): rest cools Heat to about 0 (median Heat on waking 0.05), and awake ordinary play spends 6 to 10% of its
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
