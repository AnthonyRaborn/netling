# Balance plan

An outline of three balance passes (adult and teen forms, netruns, lineage), with the measurements that motivate them and the maintainer's decisions so far. All of it is implemented: Pass 0 (tooling), the three passes, lineage Step 3 and the drain pass. Spoiler-heavy, like the rest of `docs/`.

First measured on commit `767b7c5` (2026-09-29). After Pass 0 the numbers come from the baselines in `tools/baseline/` (see [TESTING.md](TESTING.md#baselines)), with the netrun bot planning by what the player can see; where the two differ, this document says so. The simulators are scripted players, not people: treat the numbers as relative. The agreed targets and whether they are met are in [TESTING.md](TESTING.md#balance-targets).

## Contents

- [Decisions so far](#decisions-so-far)
- [How the passes work](#how-the-passes-work)
- [Pass 0: tooling](#pass-0-tooling)
- [Pass 1: forms](#pass-1-forms)
- [Pass 2: netruns](#pass-2-netruns)
- [Pass 3: lineage](#pass-3-lineage)
- [Drain pass](#drain-pass)
- [Still to decide](#still-to-decide)

## Decisions so far

From the maintainer, 2026-09-29:

1. **Ghost stays a secret, deliberate chase.** Its requirements stay; nothing in these passes should make it reachable by accident.
2. **The codex should take at least 3 lives**, even for a player who runs as often as they can.
3. **Items should be scarcer, or surplus needs a use** other than DISCARD: for example a thematic currency ("scrip") spent at netrun markets.
4. **More lineage depth.** A weaker echo of an older generation's trait is welcome, partly so that an inherited Ghost trait no longer takes away the next netling's main way to steer its form. Lineage depth should be designed together with possible new evolution forms (see [Pass 3](#pass-3-lineage)).

Second round, 2026-09-29:

5. **Attentive players can steer every evolution**, teen and adult (Ghost stays the deliberate chase within that). For the teen stage this comes from items or similar that let a player take faults on purpose, either directly (an item adds a fault) or indirectly (an item pushes a stat into fault territory).
6. **A third teen form, chosen by the hidden axes.**
7. **The Deep stays a deliberate wall.**
8. **Codex pacing uses a per-life cap.**
9. **Corpo scrip**: the currency is called scrip in short and corpo scrip where the text has room. It belongs to each netling, part of it is inherited, it has a **maximum** so spending stays a choice, and **Charge is still needed** at markets alongside scrip.
10. **Lineage forms**: trait levels (option D), if the numbers work. New forms must be thematic, visually distinct and interesting to play, so none are planned yet.
11. **Echoes at half strength**; a trait shared by parent and grandparent stacks up to a cap chosen by measurement.
12. **Life length is an open question**: seven days is long for three stages. Either shorten it (for example to five days) or add a stage. Measure both.
13. **Tooling pass first.** (Done.)

Third round, 2026-09-29:

14. **The third teen hints at Ghost**, by the hidden axes being closely balanced. The measurements below suggest a narrower rule (see Pass 1, item 5).
15. **A deliberate-fault item**: using it adds 1 to the netling's faults, which counts like any fault and can end its life at the limit. Found at markets, from intrusions, overflows and power surges, and from visitors.
16. **Scrip numbers**: a cap of 100; item prices scale with rarity, the rarest costing 50; the next generation inherits 50%, rounded down.
17. **Tie-breaks**: pick randomly among the tied forms, with a 20% weight boost for each form the player has not yet raised.

Fourth round, 2026-09-29:

18. **The third teen is the Shell** (so the Ghost is in the Shell), chosen by the narrower rule: Ghost's axis rule, at most 1 fault, and every game won at least twice.
19. **A tie is a band of 0.5.**
20. **Life length: 5 days, stages scaled** (teen at 17 hours, adult at 51 hours). This leaves room for an extra stage later.
21. **Selling pays half the price at a market and a quarter anywhere else. A purchase costs the same Charge as today** (12, or 10 in the Bazaar) on top of its scrip price.
22. **Segfault**: the deliberate-fault item, uncommon tier. Using it adds **2 faults**, so a Stub takes one Segfault and one other deliberate mistake.
23. **Casual codex pacing is acceptable** as it is: casual lines may take many lives.

Fifth round, 2026-09-29:

24. **Ghost needs 18 wins, at least 3 in each game**, with the scaled stages.
25. **Netlings alive when the change ships keep their 7-day life.** Each netling stores the life lengths it was compiled with (an added field; saves without it get the 7-day values), so nothing already alive changes and the next generation gets 5 days. No save version bump.
26. **Segfault drops**: Public Net loot weight 2 (Coolant cell drops from 3 to 2 there), weight 1 in the other regions' loot, weight 1 in the mini-game win and HIDE drop tables, weight 1 in market stock (Public Net and Bazaar), and small new chances after answering an intrusion (DEFEND), containing an overflow (PURGE) and after a power surge.
27. **The Shell's sprite comes first**, for review before any rule changes (see Pass 1, item 5).

Sixth round, 2026-09-29 (Pass 2):

28. **Netruns are linear**: each region opens once the netling has cleared the one before it, in the order Public Net, Darknet Bazaar, Corp Grid, Old Web Ruins, The Deep.
29. **Clears belong to each netling**: every new netling starts with only the Public Net.
30. **Only reaching the exit node clears a region** (not a relay jack-out).
31. **Stage gates stay** (Bazaar and Corp Grid need a teen, the Ruins and The Deep an adult), and **The Deep still needs `ruins-4`** as well as a Ruins clear.
32. **Netlings alive when this ships** count as having cleared every region their stage can enter.
33. **Abilities: option B**, second effects: Chrome gets corp insurance (once a run, a blow that would disconnect it leaves it at 12 Integrity), Daemon repairs 6 Integrity per move, Glitch phases each later ICE 35% of the time, Ghost goes unnoticed by 45% of ICE. Firewall is unchanged. (Daemon taking less ICE damage was measured too, but it would copy Firewall.)
34. **Harden The Deep** so it stays a wall with every form stronger, by something other than ICE damage: it is now 10 middle layers long (from 8).

Seventh round, 2026-09-29 (Pass 3):

35. **Trait levels are a streak**: each generation in a row that ends as the same form adds a level (1.0, 1.25, 1.5); a different form starts over. The grandparent's trait (its history, half strength) adds on top when it matches, under the per-trait cap.
36. **Pass 3 scope**: Step 1 plus levels. The family tree and legacy goals (Step 3) followed separately (decisions 40 to 44).
37. **Display**: the readout shows the trait with its level and its history (for example "Persistent II · history Hardened"); the flatline screen shows what the next generation inherits; the field manual explains levels and history without numbers.
38. **Untraceable** becomes fewer traces (60% less at strength 1), not an immunity.
39. **The grandparent's trait is called its history**, not an echo, which already names an anomaly and an unrealized form. The stored field is `history` (renamed before release, so no save ever held `echo`).

Eighth round, 2026-09-29 (lineage Step 3):

40. **The family tree is a chain** in the Lineage tab, oldest first, replacing the list: every netling has one parent and one child. Links show the child's trait (level and history) and the keepsake.
41. **Four legacy goals**: every trait held, a level III trait, five full lives in a row with no rescue, and every adult form raised in the line.
42. **Rewards are crests**, a new wardrobe slot drawn beside the device label, not more shells or tints.
43. **Hints only**, like the rest of the wardrobe; no checklist.
44. **The tree opens at the running netling**, which also shows its current stats (Charge, Sync, Integrity, Heat and scrip). Checked with a 100-generation line of simulated lives: every record survives the sanitizer, the Archive opens in about 40 ms, and the line earns all four crests.

Ninth round, 2026-09-29:

45. **The Shell is approved** as drafted: sprite, DEX hint and lore.
46. **Segfault's drop chances** and market weight are approved as measured in Pass 1.
47. **No fourth stage** for now. It is left for a possible expansion or a separate game.

Tenth round, 2026-09-29:

48. **Attentive players need more to do, and inattention must still cost something.** Charge and Sync drain 10% faster at base, and a drain curve makes a full stat drain faster than a low one.
49. **Targets**: casual players at about 3.5 faults a life and workers at about 5, from 2.6 and 4.4 at the time. The bot was corrected during the pass, which moved both starting points up, so the shipped tuning keeps the increases (about +0.9 and +0.7) rather than the absolute numbers; see [Drain pass](#drain-pass).
50. **Opt-in rewards for attention** come next, to be brainstormed.

## How the passes work

- **Order**: tooling first, then forms, then netruns, then lineage. Form odds decide which traits and abilities players see, so lineage is tuned last. Any new evolution forms that come out of Pass 3 feed back into Pass 1's targets.
- **One branch and one pull request per pass**. Within a pass, change `CFG` and `RUN_CFG` numbers before adding rules; a number change needs no save work.
- **Measure before and after** with fixed seeds (the tools already seed `mulberry32` per run), at 1000 runs per archetype for anything that goes into a doc.
- **Every pass updates** [SIMULATION.md](SIMULATION.md) or [NETRUN.md](NETRUN.md) (prose numbers are not generated), [KNOWN_ISSUES.md](KNOWN_ISSUES.md) where an entry is settled, and adds tests for changed rules. The field manual follows `CFG` by itself.
- **Save rules** ([DATA_AND_SAVES.md](DATA_AND_SAVES.md)): ids are permanent; an added field needs defaults in `createScript`, `migrate` and `cleanSave`; a restructure needs a `SAVE_VERSION` bump and a migration step.

## Pass 0: tooling (done)

What was missing, and what the tools do now (details in [TESTING.md](TESTING.md#balance-tools)):

| Gap | Change |
|---|---|
| The netrun bot ignored map vision, so Daemon's and Ghost's sight measured as nothing | Careful and skilled players plan three steps ahead using only the nodes the player can see (`planMove`); a unit test checks unseen nodes never steer it |
| Every simulated netling was first-generation | `TRAIT=<form>` starts each netling as the child of that form |
| Codex progress reset every life | `LIVES=n` simulates lineages, carrying the fragment, codex and Root Access |
| No careful player leaned chaotic, and none steered | `daredevil`, `steer-chrome`, `steer-firewall`, `steer-daemon`, `steer-glitch` and `steer-stub` |
| Results were only printed | `JSON=1` on both tools, `tools/balance-diff.mjs`, and committed baselines |
| No written targets | A targets table in TESTING.md, with each target's status |
| The "traces" count included intrusions and overflows | It now counts corp traces only (about 8 a life, not 13); all timed events are counted separately |

The planning bot changes a few old numbers. Against the one-step bot at 300 runs, `attentive` finds about one more fragment a life (16.8), disconnects less (0.6 a life), and ends Firewall slightly more often (29%, from 24%). The archetypes that don't run are unchanged.

### What the new tools found

- **Adult forms can already be steered.** Each `steer-*` player reaches its form 96 to 100% of the time. Glitch costs about one heat fault a life, from running hot.
- **Stub can be steered, at a price**: `steer-stub` gets a Stub teen every time, but by starving the netling for 3.6 faults of 10, and the faults push its adult toward Firewall (54%).
- **A caring player who takes risks mostly becomes Firewall, not Glitch** (`daredevil`: Firewall 61%, Glitch 19%): RAID and market buys lean indie faster than the risks lean chaotic.
- **Codex pacing**: attentive-style lineages finish the codex in a median of 3 lives, but 1 to 5% finish in one life and 20 to 46% within two. Casual lineages almost never finish within 4 lives (0.5%): later fragments sit in regions they rarely reach.
- **Chrome's netrun ability only works where there are checkpoints** (Public Net and Corp Grid). Elsewhere a Chrome plays exactly like a careful player with no ability.
- **Vision is worth something, but little**: in the Deep, Daemon and Ghost disconnect 21% and 20% of the time against 27% with no ability; Firewall 9%.

## Pass 1: forms

**Status: implemented** (release `netling-v36`). What shipped:

- **5-day life, stages scaled** (teen at 17 hours, adult at 51), stored per netling in `s.life`; netlings alive before the change keep 7 days.
- **Ghost** needs 18 wins with at least 3 in each game (boosted wins still count double).
- **The Shell**, a third teen for netlings on Ghost's path, with its sprite, DEX hint and lore.
- **Segfault** (2 faults, awake only, two presses to use), with the drop weights in decision 26 and a 10% chance after DEFEND, a contained overflow or a power surge.
- **Tie-breaks** within 0.5, random, with forms the player has never raised weighted 1.2.

Measured against the previous baselines (details in [TESTING.md](TESTING.md#balance-targets)): Ghost chasers still reach Ghost 99% of the time and no one else above 1%; 63% of them pass through the Shell; every steering player reaches its form 91% or more; `steer-stub` reaches Stub 98% of the time; full-life rates rose (casual 80% to 88%, worker 52% to 81%); fragments a life fell by about 15% (attentive 16.9 to 14.3). Not done in this pass: lowering the passive stability gain (item 1), which was never decided.


### Findings

| Archetype | Teen | Adult forms | Axes at adulthood |
|---|---|---|---|
| attentive | Kernel 100% | Daemon 66%, Firewall 24%, Chrome 8%, Ghost 1%, Glitch 0% | allegiance \|6.3\|, stability 8.4, wins 18.5 |
| attentive, no netruns | Kernel 100% | Daemon 80%, Chrome 8%, Firewall 8%, Ghost 4% | allegiance \|5.5\|, stability 10.2 |
| casual | Kernel 97%, Stub 1% | Chrome 30%, Firewall 27%, Daemon 24%, Glitch 12% | allegiance \|4.9\|, stability 0.8 |
| overclocker (deliberately hot and sloppy) | Kernel 100% | Glitch 65%, Firewall 19%, Chrome 15% | |
| ghosthunter (deliberate) | Kernel 100% | Ghost 100% | |

- **The teen stage is almost always Kernel.** Stub needs more than 2 faults in the first 24 hours, which only neglect produces (neglectful: Stub 34%).
- **Good care funnels into Daemon.** Stability gains 0.1 an hour whenever the netling is awake with no alert, which is about +5 by 72 hours for any tidy player. Allegiance only moves through choices, so for an attentive player stability is usually the larger axis, and it is positive.
- **Glitch is the bad-care form for a player who isn't aiming for it.** Negative stability comes from faults, heat and slow patches, so an attentive player with mixed choices almost never gets it (0.1%). A player aiming for it gets it by running hot (`steer-glitch`, 96%; see Pass 0).
- **Ghost is rare unless chased.** An attentive player averages 18.5 wins by adulthood against the 22 required, and also needs \|allegiance\| under 2.
- Known notes that belong here: boosted wins count double toward Ghost (kept on purpose; see SIMULATION.md).

### Proposed changes (in order of cost)

1. **Numbers only**: lower `uptimeStabilityPerHour` (for example 0.1 to 0.05), then measure. If Daemon still dominates, compare the axes after scaling each by its typical spread instead of raw.
2. **Full steering for attentive players (decided)**:
   - **Adults**: every form must be reachable by a careful player who chooses for it. Glitch needs its own route: deliberate risk (Overclock rig, SALVAGE, RAID, playing hot) should move stability down without faults. Measured with the `steer-*` and `daredevil` archetypes.
   - **Teens (decided): Segfault**, an uncommon item that adds **2 faults** when used. They count like any fault, so it can end a life at the limit. Sources: markets, intrusions, overflows, power surges and visitors. A Stub needs 3 faults before the teen stage (17 hours with the scaled stages), so one Segfault plus one other deliberate mistake does it; a baby must be able to find one Segfault in its first 17 hours (the Public Net is the only region open to it). Today `steer-stub` gets there by starving the netling, at 3.6 faults of 10; with Segfault it should cost exactly 3 and less Integrity. It needs a permanent item id (`segfault`), art, a field-manual entry, and a `steer-stub` update to use it.
3. **Ghost (decided: stays a deliberate chase)**: keep its conditions. Every other change in this pass is checked against the `ghosthunter` archetype (100% Ghost today) and attentive players (1 to 2%), so neither moves. a boosted win counting twice can stay as it is: boosters are part of the chase. Document it where the rule is described.
4. **Tie-break**: when the axes tie, pick at random among the tied forms, each weighted 1, or 1.2 if the player has never raised it (not in the dex).
   - **What counts as a tie (decided: a band of 0.5)**: the two axes within 0.5 of each other in size (allegiance against stability) is a tie between the forms they point to; an axis within 0.5 of zero is a tie between its two forms (Chrome and Firewall, or Daemon and Glitch). Both can apply at once, giving up to four candidates.
   - **Purity**: `sim.js` doesn't know the dex. The simplest route is a list of forms not yet raised, stored on the netling when it compiles (`newForms`, an added field with a default of none) and passed on by the UI; the balance tools can then simulate a first-time player or a veteran.
5. **A third teen form that hints at Ghost (decided)**: at 24 hours, a netling on Ghost's path becomes the new teen instead of Kernel. Measured at 24 hours over 500 lives per archetype:

   | Rule at 24 hours | Ghost chaser | Every other archetype |
   |---|---|---|
   | Both axes within ±2, at most 2 faults (the literal "closely balanced") | 16% | up to 49% (steer-glitch), casual 32%, worker 37% |
   | Ghost's axis rule (allegiance within ±2, stability 0 or more), at most 1 fault | 99% | up to 98% (steer-daemon), attentive 29% |
   | **Ghost's axis rule, at most 1 fault, and every game won at least twice** | **74%** | **at most 5%** (steer-daemon), attentive 2% |

   "Both axes balanced" is a poor hint: tidy play raises stability by about 0.1 an hour, so Ghost chasers are at about +3.5 by 24 hours, and the rule mostly picks casual players who won't reach Ghost. **Decided: the third row, and the teen is called the Shell.** It stays a hint, not a promise: the Shell still needs Ghost's adult conditions.

   **Draft art** (in `src/sprites.js` as `shellA` and `shellB`, not yet a form): a hollow, cracked casing with the eyes floating inside, the empty shell that a Ghost later fills. In the second idle frame the eyes drift, as if something inside moves. Accessories anchor on it like any form. Forms take their colors from the netling's palette quirk, so the Shell has no palette of its own; a slow inner glow (within the flash limit) is a possible later touch. Draft text: DEX hint "sides with no one on its first day, and plays every game."; lore "A hollow casing with something looking out from inside. Empty, for now." It sits after Stub in `DEX_ORDER`.

   With the scaled stages (item 6) the check happens at 17 hours instead of 24. Measured there: every game won twice catches 63% of Ghost chasers and at most 1% of anyone else; every game won once catches 96% of chasers but also 59% of Daemon-steering players and about 20% of attentive ones. **Keep "twice"**: the Shell is a sign for players already on the chase, and chasers reach Ghost 98% of the time either way. A new form needs:
   - a permanent id and sprites;
   - a DEX entry with hints, and `DEX_ORDER`;
   - a check of every "all forms" condition in cosmetics and archive, the sanitizer whitelist, CONTENT_CATALOG and `gallery.html`.

   It is additive, so no save version bump.

6. **Life length (open, measured)**: seven days for three stages leaves four days as an adult. Three five-day variants, 500 lives per archetype (`CFG` overrides):

   | Variant | Adult days | Full life: casual, worker | Ghost chaser reaches Ghost | Fragments a life (attentive) | Codex by life 5 (attentive, 200 lines) |
   |---|---|---|---|---|---|
   | 7 days (now) | 4.0 | 80%, 51% | 100% | 16.9 | 94% (median 3) |
   | 5 days, same stages (teen 24h, adult 72h) | 2.0 | 88%, 79% | 100% | 13.5 | 50% |
   | 5 days, adult at 48h | 3.0 | 88%, 77% | 67% | 14.1 | not run |
   | 5 days, scaled (teen 17h, adult 51h) | 2.9 | 87%, 78% | 89% | 14.2 | not run |

   - **Same stages** changes no evolution odds (they are decided by 72 hours) and raises survival, but leaves only two adult days. Adult-only content suffers most: the Ruins and the Deep hold the last fragments, so the codex slows sharply (half of attentive lines unfinished after 5 lives, casual never).
   - **An earlier adulthood** breaks the Ghost chase: 22 wins by adulthood is out of reach for a third of chasers at 48 hours. Ghost's win count would have to scale with the stage (about 15 at 48 hours), which touches the decided Ghost conditions.
   - **Seven days with a fourth stage** can't be measured until the stage has rules. The candidate: an elder stage from day 5 or 6 with its own perk or pose, keeping four adult days split into adult and elder.
   - **Decided: 5 days, stages scaled** (`lifespanMin` 7200, `teenAtMin` 1020, `adultAtMin` 3060). It keeps the option of a fourth stage later.
   - **Ghost's win requirement has to scale with it**, or the chase breaks (89% for the chaser at 22 wins and 4 each). Measured with the scaled stages, 500 lives per archetype:

     | Ghost needs | Ghost chaser | Highest other archetype |
     |---|---|---|
     | 22 wins, 4 in each game (now) | 89% | 0% |
     | **18 wins, 3 in each game** | **98%** | **0.8%** (sysadmin, steer-daemon) |
     | 16 wins, 4 in each game | 92% | 3% |
     | 16 wins, 3 in each game | 98% | 10% (steer-daemon) |

     **Decided: 18 and 3**, which keeps Ghost as secret as it is today. Other results with that setting: survival rises (casual full life 87%, worker 78%), steer-glitch reaches Glitch 89%, and every other steering player 99% or more.
   - **Codex** with scaled stages (200 lineages): attentive lines finish in a median of 4 lives, 9% within 2 and 36% within 3; about 14 fragments a life. The per-life cap is still needed for the at-least-3-lives rule. Casual lines rarely finish, which is accepted (decision 23).

### Candidate targets (to confirm)

- Every adult form, including Glitch, reached at least 80% of the time by its `steer-*` archetype, with no more faults than an attentive player makes.
- Attentive with mixed choices: no adult form above about 45%, and each of Chrome, Firewall, Daemon and Glitch at least 10%.
- Each deliberate archetype reaches its form at least 80% of the time, including Glitch through `daredevil` without faults.
- Ghost: `ghosthunter` stays at or near 100%, and attentive players stay under 5%.
- Full-life and adult rates per archetype stay within 3 points of today's.

## Pass 2: netruns

**Status: implemented** (release `netling-v37`). What shipped:

- **The way down** (decisions 28 to 32): `pet.cleared`, `regionLock(region, stage, codex, cleared)`, `REGION_ORDER` reordered to public, bazaar, corp, ruins, deep.
- **Per-life codex cap of 8** (`RUN_CFG.codexPerLife`, `pet.codexFound`), shown in the region picker.
- **Corpo scrip** as outlined below: cap 100, prices 15 / 25 / 50, half at a market and a quarter elsewhere, market purchases cost scrip plus the old Charge price, accessories 25 or 50 scrip plus 20 Charge, half inherited. A pickup that meets a full inventory is scrapped for a quarter automatically (no prompt). Loose scrip: 3 at every exit and 3 in 30% of empty caches.
- **Region difficulty**: ICE damage Bazaar 38 to 40, Corp Grid 40 to 35, Ruins 45 to 48. The Deep is longer (10 middle layers, from 8).
- **Second abilities** (decisions 33 and 34): Chrome's corp insurance, Daemon's upkeep, Glitch's later phases, Ghost slipping past ICE.
- **Loot tables unchanged**: once the balance players use or sell what they carry, the inventory is full at only 16 to 26% of check-ins, under the target of half, so no cut was needed.
- **Balance tools**: the bots follow the way down (heading for the deepest open region until it is cleared), sell surplus at markets, scrap surplus when full, use Repair kits and Overclock chips, and buy only what they use. New report fields: `netruns.cleared`, `netruns.byRegion`, `netruns.codexCapped`, `scrip.*` and `fullAtCheckIn`.

Results (baselines regenerated):

| Target | Result |
|---|---|
| Codex takes at least 3 lives | Met: no lineage finishes before life 3; attentive-style lines finish in life 3 (17 to 33%) or 4 (median 4). Casual lines: 0.5% within 4 lives |
| Free slot at least half the time at check-ins | Met: inventory full at 16% (casual) to 26% (attentive) of check-ins |
| A purchase affordable about every second run | Met for attentive players: 0.66 markets a run, affordable at 81% of them (0.53 a run). Casual players: 34% of markets |
| Careful disconnects rise region by region, the Deep a wall | Met: Public 4%, Bazaar 5%, Corp 7%, Ruins 8%, Deep 35%. Adults with abilities: 1 to 3% in the Ruins, 14 to 19% in the Deep |
| Abilities within about 4 points of each other | Met: in the Deep (4000 runs each), Firewall 14.3%, Ghost 14.1%, Glitch 16.6%, Chrome 18.1%, Daemon 18.1% (from 8 / 22 / 21 / 26 / 23 before) |
| No regression elsewhere | Every form target from Pass 1 still holds (Ghost 99% for `ghosthunter`, `steer-*` 89 to 100%, `steer-stub` 97% Stub). Full-life rates held or rose |

Side effects: attentive players end as Firewall less often (30% to 22%) and Chrome more often (11% to 16%), because they now buy fewer items at markets (buying leans indie). Heavy runners reach the scrip cap late in life (attentive peak 98, 84 at the end).

### Findings (before Pass 2)

| | Result |
|---|---|
| Runs per life | attentive 30.7 (0.6 disconnects), casual 7.4 |
| Codex fragments found in one life | attentive 16.9 of 22, casual 5.9 |
| Items held | attentive and casual peak at 6.0 and 5.9, which is the 6-slot cap |
| Disconnect rate, careful player | Public 3%, Corp 11%, Bazaar 5%, Ruins 8%, Deep 27% |
| Disconnect rate, skilled player | Public 1%, Corp 4%, Bazaar 1%, Ruins 3%, Deep 13% |
| Baby in the Public Net | 12% disconnected |
| Adult abilities (Deep, careful play) | Firewall 9% disconnects, Ghost 20%, Daemon 21%, Glitch 22%, Chrome 27% (the same as no ability there) |

- **The codex goes fast for an attentive player**: a median of 3 lives, but within 2 lives for a third of lineages, and occasionally in 1 (Pass 0). Casual players are the opposite: they rarely finish in 4 lives. After the codex, runs have no story left to find.
- **Items are not scarce**: players who run sit at a full inventory, so loot often has nowhere to go and markets matter little.
- **The difficulty curve is uneven**: the Corp Grid (teen) is harder than the Bazaar and than the Ruins (adult): 11% against 5% and 8% for careful players with the planning bot. The Deep is a big step up (27%).
- **Abilities are uneven**: halving ICE damage (Firewall) is by far the strongest; vision (Daemon, Ghost) helps a little; Chrome's does nothing outside the Public Net and Corp Grid.

### Proposed changes

#### Codex pacing (decided: at least 3 lives)

An attentive player finds about 16 fragments a life today, so the limit has to hold however much a player runs. Options:

| Option | Effect | Downside |
|---|---|---|
| **A. A per-life cap**: a netling can recover at most 8 new fragments ("its memory only holds so much") | 22 fragments need at least 3 lives (8 + 8 + 6), whatever the play rate. Casual players (6 a life) are not touched | A player who hits the cap mid-life finds nothing more; the run screen has to say why |
| **B. Lower drop rates**: exit 60% to about 25%, cache 15% to 8%, Echo 50% to 25% | Fewer finds for everyone | Casual players drop to about 3 a life (7 or more lives), and a lucky, busy player can still beat 3 lives |
| **C. Generation gates**: The Deep's fragments need generation 3 or later | A hard minimum, and a reason to keep a line going | Only works if the earlier regions take 2 lives by themselves; a gate alone doesn't pace them |

**Decided: A.** Start with A on its own. Casual players already take about 4 lives at 6 a life, and the cap stops busy players at exactly 3. Take a small cut from B only if measurements show otherwise. Root Access then arrives in generation 3 at the earliest. The cap is a new `RUN_CFG` number and a counter on the netling (`codexFoundThisLife`, an added field with a default, so no save version bump). The cooldown (180 to 240 minutes, floor 120) is a separate lever that also cuts item income; see below.

#### Item economy (decided: corpo scrip)

**Corpo scrip** (scrip for short) gives surplus a use without making the inventory bigger:

- **Earning**: sell an item at a netrun market for scrip. When a pickup meets a full inventory, offer to take it as scrip instead of losing it. Exits and caches can also drop a little loose scrip.
- **Spending**: market items and accessory offers cost scrip **and** some Charge (decided: Charge is still needed). Tune the two together so a purchase stays a real choice mid-run.
- **A maximum of 100** (decided), so hoarding is not a strategy and spending stays a decision. Scrip that would go over the cap is lost, and the HUD should show when it is full.
- **Prices by rarity** (decided: the rarest costs 50). A starting table, tiered by each item's average share of the loot tables across the five regions, to be tuned:

  | Tier | Items (average loot share) | Price |
  |---|---|---|
  | Common | Memory shard 17%, Coolant cell 17%, Antivirus patch 15%, Repair kit 15%, Signal booster 14% | 15 |
  | Uncommon | Black ICE shard 12%, Corp voucher 10%, Segfault (decided) | 25 |
  | Rarest | Overclock chip 1% | 50 |

  **Selling (decided)** pays half the price at a netrun market, and a quarter anywhere else (SCRAP at home). **Buying (decided)** costs the scrip price plus the same Charge as today (12, or 10 in the Bazaar).
- **At home**: DISCARD becomes SCRAP, for a quarter of the price (decided), so a home sale is never better than a market sale.
- **Scarcity still matters**: lower the loot tables a little too, so a full inventory is the exception. Targets are below.
- **Where it lives (decided)**: on the netling (`state.scrip`); the next generation inherits `Math.floor(scrip / 2)`. It needs a default in `createScript`, `migrate` and `cleanSave`, a cleaner, a place in the HUD or Archive, and a transfer round-trip test. No version bump.
- **Allegiance**: buying at a market leans indie today (-0.5 per item). Keep that on purchases; selling can stay neutral.

#### Other netrun changes

1. **Difficulty curve** (done): with the way down, the order is now Public < Bazaar < Corp < Ruins < Deep.
2. **Abilities** (decided: B, see decision 33). Measured before the change, careful play, 4000 runs each (disconnect rates):

   | Region | No ability | Chrome | Firewall | Daemon | Glitch | Ghost |
   |---|---|---|---|---|---|---|
   | Corp Grid | 7.1% | 5.1% | 1.4% | 5.7% | 3.0% | 3.5% |
   | Old Web Ruins | 7.9% | 7.9% | 1.1% | 6.4% | 2.5% | 5.5% |
   | The Deep | 26.4% | 26.4% | 7.5% | 23.4% | 20.6% | 21.6% |

   Firewall's half ICE damage is far ahead everywhere; Chrome's credentials do nothing outside checkpoint regions. Softening Firewall alone (ICE damage x0.7 instead of x0.5) gives 15.9% in the Deep: still the best, but closer. Options: (a) soften Firewall; (b) give Daemon, Ghost and Chrome a second effect that matters in the Deep (for example Daemon's lookahead also shows which mini-game each ICE holds, or Chrome pays less scrip at markets); (c) accept that abilities differ in kind and drop the 4-point target. Decided: (b), with a longer Deep (decisions 33 and 34).
3. Late-game content (seeded daily runs, run modifiers) is a feature, not balance; it is out of scope here, but its rewards would be tuned with the same tools.

### Candidate targets (to confirm)

- Codex: no simulated player finishes in fewer than 3 lives; attentive players take 3 to 4, casual players 4 to 6 (measured with `LIVES=n`).
- Items: players who run have a free slot at least half the time at check-ins; a market purchase is affordable about every second run.
- Careful-player disconnect rates rise region by region (Public < Bazaar < Corp < Ruins < Deep, the way down), with the Deep kept as a wall.
- No adult ability is more than about 4 points better than another at avoiding disconnects.

## Pass 3: lineage

**Status: Step 1 and trait levels implemented** (release `netling-v38`). What shipped:

- `TRAIT_CFG` in `sim.js`: each trait's effect at strength 1 (`full`), the history (0.5), the level step (0.25, up to level 3) and a cap per trait. `traitStrength(s, id)` combines the netling's `trait` at `levelStrength(traitLevel)` with its `history`; every trait effect scales by it, costs included.
- Save fields (added, no version bump): `traitLevel` and `history` on the netling, `level` and `history` on the fragment (`fragmentOf`), and `traitLevel`, `history`, `fragmentLevel` on lineage records. All cleaned in `sanitize.js`; older saves get level 1 and no history.
- Untraceable: corp traces 60% less often at strength 1.
- Volatile's Integrity cost is 0.75 an hour at strength 1 (from 1): at 1, casual players lost 5.7 points of full-life rate against the same parent with the trait switched off, over the target of 5.
- Caps: Licensed and Hardened 1.5; Persistent, Volatile and Untraceable 1.25.
- UI: readout, flatline screen, lineage rows and the field manual; `TRAITS[id].desc` no longer states numbers.
- Tools: `TRAIT_LEVEL=<1-3>` and `HISTORY=<adult form>` beside `TRAIT=<form>`.

Measured (400 to 800 lives per case, each trait at strengths 0.5, 1 and its cap, against the same parent with the trait switched off):

| Trait | Casual full-life change at the cap | Largest adult-form shift | Notes |
|---|---|---|---|
| Licensed | -0.7 at 1.5 | 4 points | Within noise |
| Hardened | +4.0 at 1.5 | 7 points (attentive) | Fewer viruses keep casual players alive |
| Persistent | -1.3 at 1.25 | 8 points (casual) | Fewer faults (2.6 to 1.2 a life) move casual players toward Daemon; at 1.5 it was 10.5 |
| Volatile | -4.2 at 1.25 | 3 points | At the old cost it was -9.0 at 1.5 |
| Untraceable | -1.2 at 1.25 | 5 points | Corp traces 5.0 a life with no trait, 2.2 at 1, 1.3 at the cap (0.6 at 1.5) |

Targets met: no trait moves the casual full-life rate by more than about 5 points, or the adult form odds by more than about 10. Across lineages (`lineages.json`, 4 lives), every steering player still reaches its form in every generation (`ghosthunter` 99%, `steer-*` 86 to 100%), and casual full-life rates held (93 to 95%).

### Findings (before Pass 3)

- A new generation inherits the parent's adult form as one trait, one quirk and one keepsake item. Nothing accumulates beyond one generation, apart from Root Access, the codex and cosmetics.
- Trait strength is unmeasured (Pass 0 adds this). Two to check first:
  - **Untraceable** (from Ghost) removes corp traces entirely. Traces arrive about 0.08 times an hour while awake, roughly 8 a life, and HIDE or COMPLY is the main way to move allegiance. So a Ghost's child loses most of its steering, which is at odds with Ghost being the reward for a deliberate chase.
  - **Volatile** (from Glitch) multiplies play rewards by 1.5 but costs 1 Integrity an hour.
- Because good care funnels into Daemon (Pass 1), most lineages will pass on Persistent, and most players will see only one or two traits.

### Step 1: echoes and trait strength (decided in outline)

- **Every trait gets a strength**, stored in one table (`TRAIT_CFG` beside `CFG`). The parent's trait applies at full strength, and the **grandparent's trait as an echo at half strength** (decided). If both are the same trait, the echo adds to it, up to a cap per trait set by measurement (decided).
- **Untraceable becomes a strength, not an immunity**: traces arrive 60% less often at full strength and 30% less as an echo. The child of a Ghost still meets a few traces and can still steer. The numbers are placeholders, to be measured.
- **Save work**: the stored fragment gains the parent's own trait as `echo` (an added field, default none), and the lineage record shows it. No version bump. Trait ids stay.
- **Measure** every trait at full and echo strength, for casual and attentive players. Target: no trait moves the casual full-life rate by more than about 5 points, and no trait moves the adult form odds by more than about 10 points.

### Step 2: lineage and new evolution forms (for discussion)

Four ways lineage could lead to new forms. They can be combined; each new form needs a permanent id, sprites, a DEX entry and hints, a trait, a keepsake, a netrun ability, a check of every "all forms" condition (cosmetics, archive), CONTENT_CATALOG and `gallery.html`. All are additive, so no save version bump.

| Option | How it works | New forms | Fit | Cost and risk |
|---|---|---|---|---|
| **A. Hybrid adults** | A few specific pairs of inherited trait and the child's own leaning produce a hybrid. For example: a Hardened child that leans chaotic becomes a Firewall and Glitch hybrid; a Licensed child that leans indie becomes a turncoat Chrome | 2 to 4, chosen, not every pair | Secret, deliberate chases like Ghost, planned across two lives. Gives the echo and the parent's form a purpose | Moderate: a few sprites, rules in `leaningForm`. Needs the `LIVES=n` tool to tune |
| **B. Bloodline forms** | The same adult form three generations running unlocks an "ascended" version of it for the third | Up to 5, one per base form | Rewards commitment; a long-term goal | High art cost; can feel like it locks a player into one form |
| **C. Heritage teens** | The teen form follows the inherited trait (or the axes at 24 hours) instead of always being Kernel | 2 to 3 teens | Fixes the teen stage's lack of variety (Pass 1) and previews where the line is heading | Low to moderate: teens have no perks today, so balance risk is small |
| **D. Trait levels only** | Repeating a form raises its trait's strength, capped | None | Depth without new content | Cheap, but adds nothing to discover |

**Decided**: D (trait levels), if the numbers work. New forms must be thematic, visually distinct and interesting to play, so none are planned from lineage for now; A and B stay on the list for later, and teen variety comes from the axes instead (Pass 1, item 5). Trait levels extend Step 1: the same form over several generations raises its trait further, still under the per-trait cap.

### Step 3: lineage UI and goals

**Status: implemented** (release `netling-v39`): the Lineage tab is a chain from the oldest generation to the running one, with a link between each parent and child naming what passed down (`lineageChain` in `archive.js`), and four legacy goals unlock crests, a new fifth wardrobe slot (`LEGACY` and `COSMETICS.crest` in `cosmetics.js`; listed in [CONTENT_CATALOG.md](CONTENT_CATALOG.md#crests-5)). No rule or number changed, so the baselines did not move.

1. **Family tree** in the Archive, from the lineage records the game already keeps, showing each generation's trait and history.
2. **Legacy goals**: streaks across generations (for example three full lives in a line, or every trait held once), rewarded with cosmetics only so power stays bounded.
3. **Inherited scrip** (decided): half, rounded down, passes to the next generation, as a small head start and a reason to end a life well.

## Drain pass

**Status: implemented** (release `netling-v41`). Attentive players had little to do: at 14 Charge and 12 Sync an hour, an hourly check found the bars barely moved. A flat speedup barely helps them, and it quickly hurts casual players and workers, whose limit is the night and the long midday gap: at 1.15x worker full lives fell from 83% to 39%. What shipped:

- **Base drain +10%**: 15.4 Charge and 13.2 Sync an hour (`drainPerHour`).
- **Drain curve** (`drainCurve`, `empty` 0.39, `full` 2): the rate is scaled from 0.39x at 0 to 2x at 100. Awake, Charge drains about 31/hr when full, 18 at half and 6 near empty. Keeping the bars topped up costs more actions, and a stat left low eases off, so a long gap costs faults rather than a life.
- **Ghost needs 29 wins with 4 in each game** (was 18 and 3), and **the Shell needs every game won 3 times** (was twice): more care means more play, and at the old numbers Daemon-steering players became Ghost 95% of the time.
- **The balance bot feeds before deciding to netrun**, as a player would. Before, it checked Charge first, so with the curve casual players almost never jacked in (0.2 runs a life instead of 5.7).

Measured with 1000 lives each, same bot for both rows:

| Archetype | Care actions a day | Faults a life | Full life |
|---|---|---|---|
| attentive | 37.8 to **54.3** (+44%) | 0.16 to 0.16 | 99.7% to 99.7% |
| casual | 34.6 to 42.8 | 3.59 to **4.47** | 94.6% to 92.5% |
| worker | 27.0 to 30.9 | 4.70 to **5.44** | 89.9% to 91.7% |
| neglectful | 11.0 to 11.2 | 4.01 to 3.87 | 0% to 0% |

Care actions are feeds, games, COOL, PURGE and PATCH. Against the previous baselines (older bot): casual faults 2.61 to 4.47 and worker 4.42 to 5.44. The fault numbers are sensitive to `empty`: each 0.01 moves casual faults by about 0.2.

Side effects, all within the targets in [TESTING.md](TESTING.md#balance-targets):

- **More play moves the axes.** Playing hot costs stability, so fewer attentive players drift into Daemon (attentive 62% to 49%, sysadmin 78% to 60%; Firewall and Chrome take the difference), and risk-takers lean Glitch (`overclocker` 58% to 87%, `daredevil` 20% to 58%). Every `steer-*` archetype still reaches its form 99% or more.
- **Ghost**: `ghosthunter` 99% to 97%, nobody else above 2.3% (`sysadmin`). The Shell catches 47% of Ghost chasers (was 63%) and at most 2.6% of anyone else.
- **Casual players jack in three times as often** (5.7 to 17.9 runs a life) because the bot now feeds first; their inventory is full at 47% of check-ins (was 17%).

## Still to decide

Opt-in rewards for attention (decision 50) are implemented; see [ATTENTION_PLAN.md](ATTENTION_PLAN.md) for what remains open there.
