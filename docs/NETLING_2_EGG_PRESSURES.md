# Netling 2.0: egg pressures (working design)

Status: simulator-tested working design, not in any game code. Numbers come from `prototype/netling2/sim/` bots, never from players. Full measurements: `prototype/netling2/notes/egg-pressure-notes.md` (Results 6 to 21). Commands: `docs/netling2-prototypes/README.md` (`sides-sweep.mjs`, `SIDES`, `SYNCBOT`).

## The idea

Names (decided, maintainer): Heat's state is Overclock, Charge's is **Overdrive** and Sync's is **Overlink**, one shared name per state. They replace the working names Surge and Wired, which clashed with Chipped's elder (Surge), the Wired adult and the power-surge event. Results 6 to 22 in the notes still say Surge and Wired for these states.

Each egg manages one bar harder than the others, and that bar has a special state with a real benefit and a real risk. The same states exist for every egg; the owner's bar is stronger (x3 on every effect), so the egg decides which risk is worth taking. Pass bar: the ordinary archetypes (attentive, casual, worker, sysadmin, human-regular) stay within noise on full-life rate, infections and temper.

| Egg | Bar | State | Starts | Ends |
|---|---|---|---|---|
| Iron | Heat | Overclock plus wear (Iron's Overclock benefits are amplified like the others) | Heat 65+; wear builds above Heat 75 and below Heat 20 (0.08 a minute a point, eased from 0.12), fades with a 2 hour half-life and 4x faster at rest; nap and sleep cool no lower than 20 | Heat under 65 |
| Program | Charge | Overdrive | Charge 80+ held 3 awake hours | Charge under 65, or rest |
| Wetware | Sync | Overlink | Sync 85+ held 3 awake hours | Sync under 70, rest, or burnout |

Tested strengths (base, before the x3 owner multiplier). Overdrive: play Sync +45%, win drops +75%; costs: Integrity bleeds 8 an hour, overflow events x3. Overlink: visits +75%, win drops +75%; cost: infection hazard x2.2 (virus 1.2). Sync low (30 or under): win drops x0.77 (focus). Charge has no low-side rule and already refuses feeds at 95 ("buffer full"). Non-owner eggs get the same states at x1. Flow stays Heat-gated (Charge and Sync 50+, Integrity 80+, Heat under 60, 180 minutes): gating Flow on Overdrive or Overlink removed it for attentive players in every test.

## Overlink: playing too high

Sync has no ceiling (a game can always be played), so Overlink needs a brake:
- Plays at Sync 85 to 89 inside Overlink are free.
- A play at Sync 90+ inside Overlink rolls an infection (10% x the number of such plays so far x3 for the owner, capped at 90%).
- The second play at 90+ burns the netling out: Overlink ends and cannot be re-entered for 24 hours (a night's rest alone does not reset it).

A player who stops at 89 pays essentially nothing and keeps a small benefit; a player who plays to full pays infections and loses the state.

## Numbers (tripled benefits, doubled costs, x3 owner, burnout 2 plays / 24 h, +10% step, 200 lives a cell)

- Time in a state: attentive, sysadmin and daredevil enter (Overlink 19% to 23% if they play to full, 6% to 13% if they stop at 89). Casual, worker, human-regular and overclocker never enter and are unchanged from the no-pressure baseline.
- Wetware, plays to full, attentive / sysadmin: win drops 21.3 -> 28.7 and 21.6 -> 32.0 (+35% and +48%), visits 4.3 -> 6.0 and 4.4 -> 6.5, infections 7.5 -> 9.2 and 7.8 -> 9.6, full-life 0.995 to 1.0, 1.3 and 1.7 penalty hits and 2.1 to 2.5 burnouts a life.
- Wetware, stops at 89: drops +13% and +26%, visits +19% and +23%, infections within 0.3 of off.
- Program (Overdrive): attentive drops 21.3 -> 25.2, sysadmin 21.6 -> 27.0; full-life 0.965 for both when they play to full (0.975 when they stop at 89).
- Iron: its own trade is wear, eased once (Result 22), and its Overclock benefits are amplified by the owner multiplier, x3 like Overdrive and Overlink (decided, maintainer; Result 23: win drops x2.5 and visits x1.75 while overclocked, against 1.5 and 1.25 in 1.0; the other eggs keep the 1.0 values). Daredevil infections 8.2 (was 9.4; 7.3 with no pressure), overclocker 10.9 (was 12.2; 8.7 with no pressure), drops 18.4 and 15.3 against 15.6 and 13.1. The ordinary five are unchanged. Iron is still the riskiest egg for players who live hot, now close to Wetware's greedy cost for the daredevil (8.1).
- Iron's cost against the others (Result 23): without the amplification the overclocker earned about 1 drop per extra infection and the other eggs' heavy players 4 to 6. With it: daredevil +8.9 drops, +1.2 visits for +0.8 infections; overclocker +7.6 drops, +0.8 visits for +2.4 infections, temper -2.1. The ordinary five are unchanged. The overclocker is still the heaviest trade.
- Overclock as a held state was tried and rejected: heavy players live at Heat 65+ half the time, so a hold only shrinks the benefit and leaves the wear cost.

## The break: a way out of every state (decided with the maintainer, simulator-tested only)

Each state needs a break so that no state can spiral. Decided: a **cost trigger with a warning**, a drop **well below** the exit line, and the **same 24 hour lockout for all three** as Overlink's burnout.

- **Trigger.** While a state is active (Overclock, Overdrive or Overlink), Integrity under a warning line (70 in the simulator) shows a one-time warning; Integrity under the break line (55) forces the break. The warning is for visibility only. The simulator uses Integrity for all three states; the trigger for Iron's Overclock (whose cost is hidden wear and Heat 85+) may need its own line.
- **The break.** The state ends, the bar is pushed well below its exit line (Charge to at most 50 for Overdrive's discharge, Sync to at most 55 for Overlink's crash, Heat to at most 35 for Overclock's throttle), and the state cannot be entered again for 24 hours. For Overclock, which is a plain Heat band, the lockout turns its benefits and costs off.
- **Flavor.** Overclock vents heat, Overdrive discharges, Overlink crashes. Wording is not drafted.
- **Rest.** A rest call that is answered never breaks a held state (it pauses the hold); a voluntary rest while not tired still does (see the stage-care notes in the sketch's conversation record, once written up).

Measured in the 2.0 simulator (`NR2=all PERKS=1`, 1000 lives; `prototype/netling2/baseline/README.md`, Follow-up sections): without a break, Program's Overdrive cost (an Integrity bleed of 8 an hour, tripled for the owner) drove the form with Charge-drain perks into collapse (Tune corp 68% full life, the hidden form about 82% to 83%) for a player who never stops feeding. With the break on, every archetype in Program is at 98.6% or better, and Iron and Wetware move by less than 1.5 points everywhere. The break trims Overdrive's benefit (a greedy Tune corp player's win drops 20.8 to 15.1 a life) and makes a careful player's and a careless player's benefits about equal, because the lockout removes access for a day after every break; the break line (55) is the lever if careful play should earn more. Not verified: how real players read the warning, whether the thresholds fit real play, and Iron's trigger.

## Stage rule

Every state is teen and later (decided, maintainer). Lore: a baby is too young, inexperienced and unstable to maintain the intense states, so a baby holds no Overclock, Overdrive or Overlink at any bar level and the hold counters do not start until the teen stage. Iron's wear is not a state and still builds in a baby. A baby at a high bar shows nothing: no cue, no line (decided, maintainer). In the simulator this is `SIDES.teenStates` (true by default, with the pressures on). Effect: the ordinary archetypes are unchanged; Iron's amplified Overclock benefit shrinks a little (daredevil drops +8.9 to +7.3 over its no-pressure run, overclocker +7.6 to +6.3).

## Play styles it pushes

- Iron: a thermostat player. Run warm for drops, rest before wear builds, do not chase cold (it wears too). The risky read is "one more game while hot".
- Program: a feeder who keeps Charge topped. Three steady hours reaches Overdrive; greed is feeding past it into overflow and Integrity loss.
- Wetware: a player who keeps Sync high, plays up to 89 for visits and drops, and stops. Playing to full costs infections and the state.
- Casual, worker and human-regular players never reach a state, so for them the egg changes forms, names and codex but not the care loop. Whether that is enough difference is a design question.

## What players should be able to find out

- The thresholds, the three-hour hold, the free band and the burnout count are hidden. Each state is shown by a bar label, a readout word, a sprite mark and a screen-reader value, and Overlink's brake by a tick on the Sync bar; the drafts are in `NETLING_2_CARE_DRAFTS.md`, State clues and Temper and the states (the states do not move temper and have no tell of their own; the marks keep out of the tell's way).
- Resting ends a state; a nap is the reset. Burnout is the only thing that blocks re-entry for a day.
- The same bar means different things on different eggs: Overdrive for a Program owner is a decision; for another egg it is a mild side effect.
- Overdrive and Overlink compete with Flow for the same attentive players, and the choice between them is the intended texture.

## Not verified

- The bots are not people: a human can nap to end a state, hold exactly 3 hours, or stay at 89 indefinitely.
- Only drops, play Sync and visits were measured as benefits; the worth of an item is a design call.
- Iron: wear plus Overclock is still the hardest state to hold for players who live hot; the wear easing and the amplified Overclock benefits (Results 22 and 23) are measured on bots only. Overclock's amplified benefits are a change to a 1.0 rule for Iron only; the other eggs keep the 1.0 values.
- Low-side rules are thin (Charge low is empty); the temper tells for these states are undesigned; nothing here has unit tests.
