# Balance plan

An outline of three balance passes (adult and teen forms, netruns, lineage), with the measurements that motivate them and the maintainer's decisions so far. Nothing here is implemented yet. Spoiler-heavy, like the rest of `docs/`.

Measured on commit `767b7c5` (2026-09-29) with the tools in [TESTING.md](TESTING.md#balance-tools): `DETAIL=1 node tools/balance.mjs 300 <archetype>` and `node tools/netrun-balance.mjs 1000 <region|all>`. The simulators are scripted players, not people: treat the numbers as relative, and rerun them before acting on any of this.

## Contents

- [Decisions so far](#decisions-so-far)
- [How the passes work](#how-the-passes-work)
- [Pass 0: tooling](#pass-0-tooling)
- [Pass 1: forms](#pass-1-forms)
- [Pass 2: netruns](#pass-2-netruns)
- [Pass 3: lineage](#pass-3-lineage)
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
13. **Tooling pass first.**

## How the passes work

- **Order**: tooling first, then forms, then netruns, then lineage. Form odds decide which traits and abilities players see, so lineage is tuned last. Any new evolution forms that come out of Pass 3 feed back into Pass 1's targets.
- **One branch and one pull request per pass**. Within a pass, change `CFG` and `RUN_CFG` numbers before adding rules; a number change needs no save work.
- **Measure before and after** with fixed seeds (the tools already seed `mulberry32` per run), at 1000 runs per archetype for anything that goes into a doc.
- **Every pass updates** [SIMULATION.md](SIMULATION.md) or [NETRUN.md](NETRUN.md) (prose numbers are not generated), [KNOWN_ISSUES.md](KNOWN_ISSUES.md) where an entry is settled, and adds tests for changed rules. The field manual follows `CFG` by itself.
- **Save rules** ([DATA_AND_SAVES.md](DATA_AND_SAVES.md)): ids are permanent; an added field needs defaults in `createScript`, `migrate` and `cleanSave`; a restructure needs a `SAVE_VERSION` bump and a migration step.

## Pass 0: tooling

The current tools cannot measure some of what the later passes change.

| Gap | Effect today | Change |
|---|---|---|
| The netrun bot ignores map vision | Daemon plays exactly like `careful` and Ghost exactly like Chrome in `netrun-balance.mjs`, so their abilities measure as zero | Teach `netrun-bot.mjs` to route around revealed ICE when Integrity is low |
| `simulate()` always starts a first-generation netling | No way to measure what a trait, keepsake or quirk is worth | Accept a parent fragment (`{ form, trait, keepsake }`) and add `TRAIT=<form>` to `balance.mjs` |
| Codex progress resets every simulated life | Can't measure how many generations the codex takes | A `LIVES=n` mode that carries codex, lineage and Root Access across lives |
| No archetype plays well but chaotically | Nothing shows whether a caring player can reach Glitch | Add a `daredevil` archetype: attentive care, but hot play, Overclock rigs and SALVAGE and RAID choices |
| Results are only printed | Before and after comparisons are done by eye | A `JSON=1` output and a small `tools/balance-diff.mjs` |
| No written targets | "Balanced" has no definition | A targets table in TESTING.md, filled in from the decisions below |

## Pass 1: forms

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
- **Glitch is the bad-care form.** Negative stability comes from faults, heat and slow patches, so a caring player never reaches it (0%). The overclocker gets there, but only by being sloppy.
- **Ghost is rare unless chased.** An attentive player averages 18.5 wins by adulthood against the 22 required, and also needs \|allegiance\| under 2.
- Known notes that belong here: boosted wins count double toward Ghost ([KI-14](KNOWN_ISSUES.md#ki-14)), and a neutral netling that misses Ghost becomes Chrome ([KI-15](KNOWN_ISSUES.md#ki-15)).

### Proposed changes (in order of cost)

1. **Numbers only**: lower `uptimeStabilityPerHour` (for example 0.1 to 0.05), then measure. If Daemon still dominates, compare the axes after scaling each by its typical spread instead of raw.
2. **Full steering for attentive players (decided)**:
   - **Adults**: every form must be reachable by a careful player who chooses for it. Glitch needs its own route: deliberate risk (Overclock rig, SALVAGE, RAID, playing hot) should move stability down without faults. Measured with the `steer-*` and `daredevil` archetypes.
   - **Teens**: a way to take faults on purpose, by an item that adds a fault directly, or one that pushes a stat into fault territory (for example a "drain spike" that empties Sync). Stub is reachable today only through neglect; the `steer-stub` archetype measures what that costs now.
3. **Ghost (decided: stays a deliberate chase)**: keep its conditions. Every other change in this pass is checked against the `ghosthunter` archetype (100% Ghost today) and attentive players (1 to 2%), so neither moves. KI-14 (a boosted win counts twice) can stay as it is: boosters are part of the chase. Document it where the rule is described.
4. **Tie-break (KI-15)**: decide whether a neutral netling that misses Ghost should become Chrome, or whichever form its larger scaled axis points to.
5. **A third teen form, chosen from the hidden axes (decided)**: at 24 hours, a netling with few faults and a strong lean becomes the new teen instead of Kernel, as a preview of where it is heading. Which lean (corp, indie, orderly or chaotic, or any strong one) is still open. A new form needs:
   - a permanent id and sprites;
   - a DEX entry with hints, and `DEX_ORDER`;
   - a check of every "all forms" condition in cosmetics and archive, the sanitizer whitelist, CONTENT_CATALOG and `gallery.html`.

   It is additive, so no save version bump.

6. **Life length (open)**: seven days for three stages leaves four days as an adult. Measure two variants with `CFG` overrides before choosing: a five-day life (`lifespanMin` 7200), and the current seven days with a fourth stage (for example an elder stage from day 5 with its own perk or pose). The tools report days spent in each stage.

### Candidate targets (to confirm)

- Every adult form, including Glitch, reached at least 80% of the time by its `steer-*` archetype, with no more faults than an attentive player makes.
- Attentive with mixed choices: no adult form above about 45%, and each of Chrome, Firewall, Daemon and Glitch at least 10%.
- Each deliberate archetype reaches its form at least 80% of the time, including Glitch through `daredevil` without faults.
- Ghost: `ghosthunter` stays at or near 100%, and attentive players stay under 5%.
- Full-life and adult rates per archetype stay within 3 points of today's.

## Pass 2: netruns

### Findings

| | Result |
|---|---|
| Runs per life | attentive 29.6 (0.8 disconnects), casual 7.4 |
| Codex fragments found in one life | attentive 15.8 of 22, casual 6.0 |
| Items held | attentive and casual peak at 6.0 and 5.8, which is the 6-slot cap |
| Disconnect rate, careful player | Public 5%, Corp 13%, Bazaar 8%, Ruins 12%, Deep 31% |
| Disconnect rate, skilled player | Public 2%, Corp 6%, Bazaar 3%, Ruins 5%, Deep 16% |
| Baby in the Public Net | 16% disconnected |
| Adult abilities (Public Net) | Firewall 1% disconnects, Glitch 3%, Chrome and Ghost 6%, Daemon 5% (the same as no ability; see Pass 0) |

- **The codex goes fast for an attentive player**: about two lives. After that, runs have no story left to find, and Root Access comes early.
- **Items are not scarce**: players who run sit at a full inventory, so loot often has nowhere to go and markets matter little.
- **The difficulty curve is uneven**: the Corp Grid (teen) is harder than the Bazaar and about as hard as the Ruins (adult). The Deep is a big step up.
- **Abilities are uneven**: halving ICE damage (Firewall) is by far the strongest; vision (Daemon, Ghost) can't be judged until the bot uses it.

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
- **A maximum** (decided): a netling can hold only so much scrip (for example enough for two or three purchases), so hoarding is not a strategy and spending stays a decision. Scrip that would go over the cap is lost, and the HUD should show when it is full.
- **At home**: DISCARD becomes SCRAP, for a token amount, so a home sale is never better than a market sale.
- **Scarcity still matters**: lower the loot tables a little too, so a full inventory is the exception. Targets are below.
- **Where it lives (decided)**: on the netling (`state.scrip`), with part of it inherited by the next generation (see Pass 3). It needs a default in `createScript`, `migrate` and `cleanSave`, a cleaner, a place in the HUD or Archive, and a transfer round-trip test. No version bump.
- **Allegiance**: buying at a market leans indie today (-0.5 per item). Keep that on purchases; selling can stay neutral.

#### Other netrun changes

1. **Difficulty curve**: bring the Corp Grid's disconnect rate below the Ruins' (ICE damage 40, or its checkpoint weight). The Deep stays a deliberate wall (decided); keep its rate well above the Ruins'.
2. **Abilities**: after Pass 0, bring Daemon and Ghost vision to within a few points of Firewall's disconnect rate, or give them a second effect.
3. Late-game content (seeded daily runs, run modifiers) is a feature, not balance; it is out of scope here, but its rewards would be tuned with the same tools.

### Candidate targets (to confirm)

- Codex: no simulated player finishes in fewer than 3 lives; attentive players take 3 to 4, casual players 4 to 6 (measured with `LIVES=n`).
- Items: players who run have a free slot at least half the time at check-ins; a market purchase is affordable about every second run.
- Careful-player disconnect rates rise region by region (Public < Bazaar ≈ Corp < Ruins < Deep), with the Deep kept as a wall.
- No adult ability is more than about 4 points better than another at avoiding disconnects.

## Pass 3: lineage

### Findings

- A new generation inherits the parent's adult form as one trait, one quirk and one keepsake item. Nothing accumulates beyond one generation, apart from Root Access, the codex and cosmetics.
- Trait strength is unmeasured (Pass 0 adds this). Two to check first:
  - **Untraceable** (from Ghost) removes corp traces entirely. Traces arrive about 0.08 times an hour, roughly 13 a life, and HIDE or COMPLY is the main way to move allegiance. So a Ghost's child loses most of its steering, which is at odds with Ghost being the reward for a deliberate chase.
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

1. **Family tree** in the Archive, from the lineage records the game already keeps, showing each generation's trait and echo.
2. **Legacy goals**: streaks across generations (for example three full lives in a line, or every trait held once), rewarded with cosmetics only so power stays bounded.
3. **Inherited scrip** (decided): part of it passes to the next generation (for example half, under the cap), as a small head start and a reason to end a life well.

## Still to decide

1. **Third teen**: which lean picks it (corp, indie, orderly, chaotic, or any strong one), and what it looks like.
2. **Deliberate faults**: an item that adds a fault directly, or one that pushes a stat into fault territory? How is it obtained?
3. **Life length**: five days, or seven with a fourth stage? To be measured first.
4. **Scrip numbers**: the cap, prices, the Charge part of a purchase, and how much is inherited.
5. **Trait numbers**: strengths, level steps and caps, after measuring.
