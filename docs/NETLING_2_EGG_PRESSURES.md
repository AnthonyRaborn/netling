# Netling 2.0: egg pressures (working design)

Status: simulator-tested draft, not in any game code. Numbers are from `prototype/netling2/sim/` bots, never from players. Full measurements: `prototype/netling2/notes/egg-pressure-notes.md` (Results 6 to 17). Commands: `docs/netling2-prototypes/README.md`.

## The idea

Each egg manages one bar harder than the others, and that bar has a special state with a real benefit and a real risk. The same states exist for every egg; the owner's bar is stronger (x3 on every effect), so the egg decides which risk is worth taking. Equal on average: the ordinary archetypes (attentive, casual, worker, sysadmin, human-regular) must stay within noise on full-life rate, infections and temper.

| Egg | Bar | State | How it starts and ends | Benefit | Risk |
|---|---|---|---|---|---|
| Iron | Heat | Overclock (1.0 rule) and wear | Heat 65+. Wear builds above Heat 75 and below Heat 20, fades with rest; nap and sleep cool no lower than 20 | Win drops x1.5, visits x1.25 | Lost games cost Sync and Integrity, events x1.25, wear raises Sync drain and infection hazard |
| Program | Charge | Surge | Charge 80+ for 3 awake hours; ends under 65 or at rest | Play pays more Sync, win drops up | Overflow events likelier, Integrity bleeds |
| Wetware | Sync | Wired | Sync 85+ for 3 awake hours; ends under 70 or at rest | Visits up, win drops up | Infection hazard up (cyberpsychosis) |

Low sides are deficits only: low Sync means fewer win drops (focus). Low Charge has no extra rule beyond the old ones (mistake at 0, no play under 10). Flow stays Heat-gated (Charge and Sync 50+, Integrity 80+, Heat under 60, 180 minutes). Non-owner eggs get the same states at x1.

## Numbers tested (tripled benefits, doubled costs, x3 owner, 200 lives a cell)

- Time in the state: attentive, sysadmin and daredevil 6% to 13% of awake time. Casual, worker, human-regular and overclocker never enter; they are unchanged from the no-pressure baseline on Program and Wetware.
- Program, sysadmin: win drops 13.7 -> 17.0 (+25%), Sync a play +11% (the 100 cap limits it), full-life 0.99 -> 0.975. Daredevil full-life 0.92. Flow share falls (attentive 0.27 -> about 0.19).
- Wetware, sysadmin: win drops +26%, visits +23%, infections 7.33 -> 7.78.
- Iron: unchanged by Surge and Wired; its trade is wear (daredevil infections 9.4, overclocker 12.2 against 7.3 and 8.7 with no pressure).
- Overclock as a held state (2 h and 6 h holds) was tried on Iron and rejected: the heavy players live at Heat 65+ half the time, so a hold only shrinks the benefit (daredevil drops 19.7 -> 17.8 -> 15.3) and leaves the wear cost, which follows Heat, untouched. Overclock stays the plain 1.0 rule.

## Play styles it pushes

- Iron: a thermostat player. Run warm for the drops, nap or sleep before the wear builds, and do not chase cold (it wears too). The risky read is "one more game while hot".
- Program: a feeder who keeps Charge topped. Feeding every few hours for three hours straight reaches Surge; the greed is feeding past it into overflow and Integrity loss. Cadence is rewarded, so it favors frequent check-ins.
- Wetware: a player who keeps Sync high by playing often, to bring visits and drops, at the price of infections. Needs the antivirus habit (clinic, shield) more than the other eggs.
- Casual, worker and human-regular players never reach a state. For them the egg changes forms, names and codex, not the care loop. Whether that is enough difference is a design question, not a finding.

## What players should be able to find out

- The thresholds and the three-hour hold are hidden; the player learns that a steadily full bar "comes on" after a while and that the egg's bar goes wrong faster. It needs a visible cue when a state starts and ends, or it will feel random.
- Resting ends a state, so a nap or sleep is the reset. Players will learn to time it.
- The same bar means different things on different eggs: a Program owner reaching Surge is a decision, a Wetware owner at the same Charge is not.
- Surge competes with Flow for the same attentive players. Choosing between them is the intended texture.

## Not verified

- Only drops, play Sync and visits were measured as benefits; the worth of an item is a design call.
- The bots are not people. A human can nap on purpose to end a state, hold exactly 3 hours, or ignore the bar entirely.
- Low-side rules are not settled (Charge low is empty; Sync low costs the worker about 0.03 to 0.06 full-life).
- Nothing here has unit tests; the temper tells for these states are not designed.
