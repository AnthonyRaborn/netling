# Netling 2.0 perks, traits, keepsakes and new items

Status: designed with the maintainer on paper, then built as switches in the simulator fork (`prototype/netling2/sim/`, `sim.js`) and measured on bots. Nothing is in a game: there is no 2.0 game code. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (decisions), [NETLING_2_NETRUN_DRAFTS.md](NETLING_2_NETRUN_DRAFTS.md) (the nine forms' netrun abilities), [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (per-egg names and wording). Values are starting values to measure, not tuned.

## Frame (Decided, maintainer)

- **Perks** are the in-life care effect of an adult form: one per form, by **role and lean** (the role picks the stat, the lean picks the variant). Elders keep their adult's perk.
- **Traits** are the inheritable echo, **by role** (four) plus hidden (one), so the streak (same trait, one level up per generation, level 3 at most; the grandparent's trait at half strength; capped) survives a corp or street flip inside a role. Lean is a per-life reputation (Standing resets each life); the role is the inherited aptitude. 1.0's mechanics are unchanged: `TRAIT_CFG` (history 0.5, level step 0.25, max level 3, per-trait caps).
- **Keepsakes** (the item a dead adult leaves the next generation) are included, one per form.
- Rules are egg-neutral and act on four drives that each egg maps to its own meters and words: **Upkeep** (drains and feeding), **Exposure** (infections, traces, intrusions, event timing), **Reward** (what play and feeding return), **Risk** (what actions cost).
- **Temper takes no perks** and these add no temper items (sketch, Temper). New items lean Standing, not temper.
- **Set aside:** Glitch's play gamble and Volatile's costly play bonus are dropped (Decided). Temper already shapes play rewards through the care preferences and is personality, not form; a form-based variance on the same Reward drive would compete with it. A trait with a downside can be revisited after the first balance pass (maintainer).

## Perks (Decided; values are starting values)

| Form | Drive | Perk | 1.0 source |
|---|---|---|---|
| Breach street | Exposure | infection chance -30% (per hour and from scavenged data) | Firewall |
| Breach corp | Risk | a cured infection (the cure button) restores 10 more Integrity | new |
| Dodge corp | Exposure | corp traces 30% less often | new |
| Dodge street | Exposure | intrusions 30% less often | new |
| Tune corp | Upkeep | Charge drains 20% slower | Daemon |
| Tune street | Upkeep | Sync drains 20% slower | new, mirrors Tune corp |
| Feast corp | Reward | corp packets +5 Sync, scavenged data -5 Sync | Chrome |
| Feast street | Reward | the infection roll on scavenged data halved | new |
| Hidden | Upkeep | all drains 15% slower | Ghost |

## Traits (Decided, by role; strength 1 and caps)

| Role | Trait | Effect at strength 1 | Cap | Source |
|---|---|---|---|---|
| Breach | Hardened | infection chance -50% | 1.5 | 1.0 |
| Dodge | Evasive | timed events (trace, intrusion, overflow) give 25% more minutes to answer | 1.25 | new |
| Tune | Persistent | drains 30% slower while resting | 1.25 | 1.0 |
| Feast | Foraging | both packet types restore +25% Charge | 1.5 | Licensed, generalised so it does not steer Standing |
| Hidden | Untraceable | corp traces 60% less often | 1.25 | 1.0 (moved from Ghost's line to hidden; Dodge needed a new one) |

Evasive is the one trait that changes timing, not frequency, so it does not overlap hidden's Untraceable or Dodge corp's trace perk. It forgives missed events, so it helps casual play most.

## Keepsakes (Decided, one per form; no two forms share one)

| Form | Keepsake |
|---|---|
| Breach street | Antivirus patch |
| Breach corp | Repair kit |
| Dodge corp | Bypass chip |
| Dodge street | Decoy (new) |
| Tune corp | Coolant cell |
| Tune street | Signal booster (proposal: the Signal Tune game's own item; to confirm) |
| Feast corp | Corp voucher |
| Feast street | Salvage cell (new) |
| Hidden | Memory shard |

## New items (Decided: Decoy and Salvage cell)

Items are fixed at nine kinds in 1.0; with stacks of three, two more are cheap and fill real gaps. Each takes a permanent id, three per-egg names (to draft in the care drafts), art, and entries in the drop tables and market stock.

| Item | Effect | Price | Why |
|---|---|---|---|
| Decoy | waves off the current or next intrusion; street Standing +1 | 25 | nothing answered an intrusion but DEFEND; the street mirror of the voucher's trace skip |
| Salvage cell | +50 Charge; street Standing +1; 12% infection chance like scavenged data (none if shielded) | 15 | the only Charge item was the corp-leaning voucher |

**Set aside: the Scan chip** (reveal the next two layers in a run). It duplicates the Tune forms' big hook (Lookahead, Foresight) and the stray signal; revisit with the Tune forms after a playtest (maintainer).

Drops and stock in the fork: Decoy drops from HIDE (weight 2) and wins (1); Salvage cell from wins (2) and HIDE (1); both join the black market's stock (1 each). The corp exchange and the Bazaar's own list are unchanged.

## Interactions to measure

- Drain perks (Tune corp, Tune street, hidden) are the strongest survival levers (the longest awake gap decides survival). Steering to a role is cheap, so a strong drain perk can become the default pick.
- Slower drains make Overdrive (Charge held 80+) and Overlink (Sync held 85+) easier to reach and hold.
- Foraging and a Charge perk together lean on the Charge bar; Hardened and Breach street's perk stack on infection chance (1.0 stacked them too, to x0.35).
- Decoy plus Dodge street's perk, and Evasive plus Dodge's perks, are deliberate overlap in the same drive.

## Not done

Per-egg names and wording for the new items, art, hover text, the Dex lines for the perks, and any 2.0 game code. 

## First balance pass (bots, `PERKS=1`)

Full results: `prototype/netling2/notes/perks-traits-notes.md`. In short: no outlier above about 12 points. For a worker (full-life rate 80% before) the forms run from 82 (Feast) to 90 (Breach, Tune corp) with the perk, the level I trait and the keepsake; Hardened (Breach) is the strongest, Foraging (Feast) the weakest (about +1 to +3). No perk or trait rescues the fatal long gap (human-casual 5%), so none becomes a gap cure. Casual and overclocker play barely move (a ceiling). Not measured: the egg pressure states, steering, the new items in a run, a human. Open (not decided): leave until a playtest, lift Foraging or a Feast perk, or trim Hardened's cap to 1.25.
