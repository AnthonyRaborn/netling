# Perks, traits, keepsakes and the two new items: first balance pass

Design: `docs/NETLING_2_PERKS_TRAITS_DRAFTS.md`. Built in the simulator fork behind `PERKS=1` (`PERKS.on`, off by default: with it off, 100 simulated lives across attentive, casual, daredevil and worker are byte-identical to before). Tests: `prototype/netling2/perks.test.js` (8). Measurement aid: `FORCE_ADULT=<form>` makes every netling grow into that form (fork only). Bots with 1.0's scripted players, `NR2=all`, 500 runs a cell, the same seeds in every configuration (so differences are paired and tighter than the usual noise, about 2 points near 80% and 1 point near 95%).

## What was run

For each of the nine adult forms and four archetypes, full-life rate (the share of lives that reach the end of the life cycle) in five configurations:

- **A** no perks, the form forced (the baseline);
- **B** the form's perk only;
- **C** a control: the same baseline, started as the child of that form with no trait (checks the "child of a parent" path adds nothing; it matched A to the decimal);
- **D** perk, trait at level I and the keepsake (a child of that form with the perks switched on);
- **E** the same with the trait at level III (strength 1.5, or the cap).

Commands: `FORCE_ADULT=<form> PERKS=1 [TRAIT=<form> [TRAIT_LEVEL=3]] NR2=all JSON=1 node prototype/netling2/sim/balance.mjs 500 <archetype>`.

## Results (full-life rate, percent; change from the baseline in brackets)

**Worker** (baseline 80 to 81%, the archetype with the most room):

| Form | Perk only | Perk + trait I + keepsake | Perk + trait III |
|---|---|---|---|
| Breach corp | 85.4 (+5.8) | 90.4 (+10.8) | 92.0 (+12.4) |
| Breach street | 84.0 (+4.0) | 90.4 (+10.4) | 92.0 (+12.0) |
| Dodge corp | 82.0 (+1.2) | 85.8 (+5.0) | 85.0 (+4.2) |
| Dodge street | 82.0 (+1.6) | 87.8 (+7.4) | 87.6 (+7.2) |
| Tune corp | 86.6 (+6.4) | 89.6 (+9.4) | 90.6 (+10.4) |
| Tune street | 85.2 (+4.8) | 86.4 (+6.0) | 89.6 (+9.2) |
| Feast corp | 83.0 (+1.8) | 82.2 (+1.0) | 83.2 (+2.0) |
| Feast street | 83.8 (+3.2) | 82.0 (+1.4) | 83.6 (+3.0) |
| Hidden | 88.2 (+7.6) | 87.0 (+6.4) | 87.6 (+7.0) |

**Casual** (baseline 93 to 95%): every change is within 3 points, mostly noise; Breach is the only clear gain (+1.4 to +1.6 perk, +2.6 to +3.6 with the trait). Tune corp and Tune street are 1 to 2 points below baseline (noise level).

**Overclocker** (baseline 96.2%): Breach trait +3 (to 99.2); everything else within 1.6.

**Human-casual** (baseline 3.4 to 6.0%, the fatal-gap archetype): no perk or trait rescues it. The largest change is Breach street with the trait at III (+6.4, to 9.8%); the Tune drain perks give +1.6 and +0.8. Dodge corp's perk alone is -3.4 (noise or not, it is not a gain).

## Reading

- **Nothing is a survival fix for the long gap.** Survival still depends on the longest awake gap (sketch, Next steps): the drain perks (Tune corp, Tune street, hidden) do not lift human-casual (+0.8 to +1.6), so no perk becomes the default pick as a gap cure. The earlier fear is not borne out on the bots.
- **The spread is real for the stressed player.** For the worker the nine forms run from 82 (Feast) to 90 (Breach, Tune corp) with the perk and the level I trait, against a flat 80 before. Hardened (Breach) is the strongest single trait: infection chance -50% at level I, -75% at level III, +10 to +12 points. Persistent (Tune) and the hidden perk follow. Evasive (Dodge) is worth about +5 to +7 over the perk. Foraging (Feast) is worth about nothing for survival (+1 to +3) and the Feast perks are the weakest (+1.8 and +3.2).
- **Feast lags on care survival by design.** Its value is loot in a run (netrun notes, Feast tuning: at the mean on banked value with one forced cache), and a loot form that also survives as well as Breach would be a free lunch. The question is whether Foraging, a +25% Charge on both packets, is enough of a reason to pick the line; on the bots it is the least.
- **Level III trait vs level I.** The extra levels add -1 to +3 on top of level I (up to +1.6 for Breach, +3.2 for Tune street). The caps hold: nothing at III is runaway.
- **The keepsakes are inside the "perk + trait" columns.** They were not isolated; each gives the child one item at birth (Antivirus patch, Repair kit, Bypass chip, Decoy, Coolant cell, Signal booster, Corp voucher, Salvage cell, Memory shard). The bots use them by the same rules as any item (decoy on an intrusion, salvage under 25 Charge).

## Not measured

- Interaction with the egg pressures (Overdrive, Overlink, Iron's band): slower drains should make the Charge and Sync states easier to hold; `sides-sweep` / `iron-sweep` with `PERKS=1` is the check.
- Steering: how many players will aim at a role for its perk, and whether Breach or Tune corp becomes the default. Role is cheap to steer (README); the bots do not weigh a perk.
- Netrun effects of Decoy and Salvage cell in a run (they join loot and the black market at weight 1 each when `PERKS.on`, which dilutes other items by about 12%), and the market stock for the Bazaar's own list (unchanged).
- The elder-feat rate with perks (the 17-archetype first pass moved it by 1 point or less).
- A human: all bots, 1.0's scripted players.

## Options (not decided)

1. Leave the first versions until a playtest (the first pass found no outlier above 12 points, the strongest being Hardened at level III for a worker).
2. Lift the Feast care value: Foraging to +35%, or a Feast corp perk that helps Charge (the line's loot is its job; this is a care top-up).
3. Trim Hardened's cap (1.5) to 1.25 like the other traits, for a worker +12 becomes about +10.

**Decided (maintainer): option 3 only; the rest waits for a playtest.** The cap is 1.25 under `PERKS.on` in `sim.js`. The tables above were measured at 1.5, so the level III column for Breach (+12) is stale: at 1.25 a level III Hardened is -62.5% infections instead of -75%. Not re-run.
