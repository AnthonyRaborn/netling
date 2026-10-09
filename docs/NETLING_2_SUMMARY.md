# Netling 2.0: summary of the plan and the differences from 1.0

A reading aid drawn from [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) and [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md). Where this file and those disagree, they are right: fix this file. Written 2026-10-09 from the docs only; the code was not read.

Two things to know up front:
- No 2.0 game code exists. The rules run only in the simulator fork (`prototype/netling2/sim/`), driven by scripted bots.
- All 66 sprites are first drafts, and nothing has been playtested.

## What 2.0 is

2.0 is a separate app, not an update to 1.0. After the intro, the player picks an egg and then plays a short tutorial. Three eggs launch, and a fourth is hidden.

| Egg | Substrate | Pressure bar and state | Cure for faults |
|---|---|---|---|
| Program | Software (the original line) | Charge: Overdrive | Patch-style fixes |
| Iron | Firmware and infrastructure | Heat: Overclock, plus hidden wear | ALIGN (read-only, so no patch) |
| Wetware | Grown tissue running software | Sync: Overlink, with a burnout brake | Plain-word fixes |

- **Forms:** each egg has 22 forms: 1 baby, 3 teens, 9 adults and 9 elders (66 in all). The 9 adults are four roles (Breach, Dodge, Tune, Feast), each with a corp-leaning and a street-leaning form, plus one hidden form that masters all four games.
- **Hidden egg (Rogue):** a non-NL-0 line that escaped on its own from an unnamed corp that stole NL-0's earlier code. It is built on the three hidden lines and hunted harder than the other eggs. It unlocks after the ending and all 18 egg pages, and its life ends in a merge of lineage fragments from two eggs. How it plays is still undesigned.
- **Care:** care keeps 1.0's four meters and nine buttons, reskinned per egg. The rhythm differences are wording only.
- **Egg pressures:** each egg's own bar has a special state. Entering the state gives the owner triple benefits (more win drops and visits) and a real cost. The states are teen and later.
- **The break:** if Integrity falls under 40 during a state, the state ends. The netling takes one fault, the bar drops well below its exit line, and the state is locked out for 12 hours. A warning shows at Integrity 70.
- **Standing:** replaces 1.0's allegiance axis. Two non-negative tracks, corp and street, that reset each life. They display as floors but are kept as fractions.
- **Temper:** replaces the stability axis. One hidden orderly-to-volatile number with a 24-hour half-life and five levels. It is shown only through sprite motion, idle behavior and chatter tone. It never picks a form and carries no perks. The only reward is the Metronome prop.
- **Bugs:** each fault has a 30% chance to add a bug, up to 5. Each bug raises Charge and Sync drain, Heat gain and damage, and costs Integrity over time. Bugs clear only at a clinic node on a netrun, for 15 scrip or 2 Standing plus a Charge fee. The clinic is also the only place that sells the healing items.
- **Evolution:** the baby becomes a teen on Standing alone. The adult follows the role (the game with the most wins) and the Standing lean. The hidden forms need wins in every game, with the two tracks within 1 point of each other. Close calls are settled by a weighted random tie break.
- **Perks, traits, keepsakes:** perks come by role and lean, traits by role (including Untraceable on the hidden line), with one keepsake per form. Two new items are added, Decoy and Salvage cell.
- **Netrun additions:**
  - one ability per role and lean, at adult and elder levels;
  - a second, harder ICE tier by region depth;
  - foggier maps, with wider Deep and Source layers;
  - a forced cache once a run;
  - three per-egg anomalies;
  - per-egg run costs;
  - Foresight for the Tune forms;
  - item stacking with a keep-or-sell choice.
- **Stage care** (decided, built in the fork and measured):
  - The baby is shortened to about 7 hours of wall-clock time, with higher drain (x2.4).
  - Adulthood arrives at 46 hours.
  - Elders produce a quarter of the cache.
  - A rest call (a notification) gives the netling a 20 to 30 minute rest. Ignoring it makes the netling tired, with x1.16 drain and Flow blocked.
  - Timed events and attention requests count against a budget of 6 notifications a day. Visitors never notify.
- **Story:** NL-0 precedes the player's line only, and the purge order can never run. Codex "fragments" become "pages", split into 39 shared story pages (24 Root, 15 late) and 18 egg pages. The cap is 12 pages a life.
- **Root Access:** earned once and kept across all eggs and lives.

## Main differences from 1.0

| Area | Netling 1.0 | Netling 2.0 (planned) |
|---|---|---|
| Structure | One software egg | Three eggs, plus a hidden Rogue egg |
| Forms | 14 | 66 (22 per egg), all drawn in full |
| Evolution axes | Allegiance and hidden stability | Standing (visible tracks) and temper (personality only) |
| Adult choice | Axes plus games played | Role (most-won game) plus Standing lean |
| Hidden form | Ghost (neutral allegiance) | Per-egg hidden adult (Ghost, Guru, Blank) needing wins in all four games and a balanced Standing |
| Faults | 10 care mistakes end a life | No cap. Faults feed temper and can add bugs, and the life ends by Integrity collapse or old age. |
| Bugs | None | Persistent, lethal in moderation, cleared only at clinics |
| Pressure states | Heat-based Overclock and Flow | Each egg owns one bar with a state and a break; Flow stays Heat-gated |
| Baby stage | Same care as other stages | Shorter and harder |
| Elder stage | Mainframe, 1.0's gate | Same gate (Root, a late-life feat, the Deep), but Root carries across eggs |
| Rest | Naps | Rest calls with a tired state |
| Netrun | Form-tied abilities | Role-and-lean abilities, ICE tiers, fog, wider maps, per-egg anomalies |
| Codex | 27 pages | 57 pages (39 story, 18 egg), with a per-life cap of 12 |
| Death register | One | Per egg (process ends, decommission, waking) |
| Migration | | None planned from 1.0 saves |

Unchanged: the mini-game mechanics, the four meters, wearables and props, the ending, and the rule that a work-day gap stays fatal.

## Still open

- Rogue's design: how the hidden-line base and the hunters work in play, and its merge ending.
- Playtest-bound questions: egg run costs, Foresight's value, the stack size, the keep-or-sell screen, the break's thresholds and Iron's trigger, and how people read the Overlink brake.
- Length: the Rogue gate is about 9 lives for attentive players (about 45 days) and about 22 for casual players (a lower bound).
- Not designed yet: per-egg baby and teen rules beyond stage care, mini-game modifiers per egg, shell, crest and device-prop conditions, and save format.
- Parked: XP with per-stage caps, a third ICE tier, more home events and multiplayer.
