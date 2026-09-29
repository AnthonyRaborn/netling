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
2. **A caring route to Glitch**: give deliberate risk its own chaos, separate from neglect. For example, Overclock rig, SALVAGE, RAID and playing while hot move stability down even with zero faults. Measured with the `daredevil` archetype.
3. **Ghost (decided: stays a deliberate chase)**: keep its conditions. Every other change in this pass is checked against the `ghosthunter` archetype (100% Ghost today) and attentive players (1 to 2%), so neither moves. KI-14 (a boosted win counts twice) can stay as it is: boosters are part of the chase. Document it where the rule is described.
4. **Tie-break (KI-15)**: decide whether a neutral netling that misses Ghost should become Chrome, or whichever form its larger scaled axis points to.
5. **Teen variety (content, the largest change)**: a third teen form chosen from the axes at 24 hours, as a preview of the adult direction. A new form needs:
   - a permanent id and sprites;
   - a DEX entry with hints, and `DEX_ORDER`;
   - a check of every "all forms" condition in cosmetics and archive, the sanitizer whitelist, CONTENT_CATALOG and `gallery.html`.

   It is additive, so no save version bump.

### Candidate targets (to confirm)

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

**Recommended: A on its own to start.** Casual players already take about 4 lives at 6 a life, and the cap stops busy players at exactly 3. Take a small cut from B only if measurements show otherwise. Root Access then arrives in generation 3 at the earliest. The cap is a new `RUN_CFG` number and a counter on the netling (`codexFoundThisLife`, an added field with a default, so no save version bump). The cooldown (180 to 240 minutes, floor 120) is a separate lever that also cuts item income; see below.

#### Item economy (decided: scarcer, or a use for surplus)

A currency, working name **scrip**, gives surplus a use without making the inventory bigger:

- **Earning**: sell an item at a netrun market for scrip. When a pickup meets a full inventory, offer to take it as scrip instead of losing it. Exits and caches can also drop a little loose scrip.
- **Spending**: market items and the market's accessory offers are priced in scrip instead of Charge. Charge stays the cost of moving through a run, so the run's tension stays where it is.
- **At home**: DISCARD becomes SCRAP, for a token amount, so a home sale is never better than a market sale.
- **Scarcity still matters**: lower the loot tables a little too, so a full inventory is the exception. Targets are below.
- **Where it lives**: on the netling (`state.scrip`), so it can take part in lineage (for example half is inherited; see Pass 3), or shared across generations (`progress.scrip`). It needs a default in `createScript`, `migrate` and `cleanSave`, a cleaner, a place in the HUD or Archive, and a transfer round-trip test. No version bump.
- **Allegiance**: buying at a market leans indie today (-0.5 per item). Keep that on purchases; selling can stay neutral.

#### Other netrun changes

1. **Difficulty curve**: bring the Corp Grid's disconnect rate below the Ruins' (ICE damage 40, or its checkpoint weight). Whether the Deep's 31% for careful players is the intended endgame wall is still open.
2. **Abilities**: after Pass 0, bring Daemon and Ghost vision to within a few points of Firewall's disconnect rate, or give them a second effect.
3. Late-game content (seeded daily runs, run modifiers) is a feature, not balance; it is out of scope here, but its rewards would be tuned with the same tools.

### Candidate targets (to confirm)

- Codex: no simulated player finishes in fewer than 3 lives; attentive players take 3 to 4, casual players 4 to 6 (measured with `LIVES=n`).
- Items: players who run have a free slot at least half the time at check-ins; a market purchase is affordable about every second run.
- Careful-player disconnect rates rise region by region (Public < Bazaar ≈ Corp < Ruins < Deep), with the Deep under about 20% unless it is kept as a wall.
- No adult ability is more than about 4 points better than another at avoiding disconnects.

## Pass 3: lineage

### Findings

- A new generation inherits the parent's adult form as one trait, one quirk and one keepsake item. Nothing accumulates beyond one generation, apart from Root Access, the codex and cosmetics.
- Trait strength is unmeasured (Pass 0 adds this). Two to check first:
  - **Untraceable** (from Ghost) removes corp traces entirely. Traces arrive about 0.08 times an hour, roughly 13 a life, and HIDE or COMPLY is the main way to move allegiance. So a Ghost's child loses most of its steering, which is at odds with Ghost being the reward for a deliberate chase.
  - **Volatile** (from Glitch) multiplies play rewards by 1.5 but costs 1 Integrity an hour.
- Because good care funnels into Daemon (Pass 1), most lineages will pass on Persistent, and most players will see only one or two traits.

### Step 1: echoes and trait strength (decided in outline)

- **Every trait gets a strength**, stored in one table (`TRAIT_CFG` beside `CFG`). The parent's trait applies at full strength, and the **grandparent's trait as an echo at half strength**. If both are the same trait, the echo adds to it, capped (a mild "bloodline" bonus with no new rule).
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

**Suggested direction**: Step 1 first (it is needed whatever is chosen, and fixes the Ghost steering problem), then **C** for teen variety, then **A** with two hybrids as the lineage-driven secret forms. B is the most expensive and can wait until A shows whether players chase multi-generation goals. D is mostly covered by Step 1's capped bloodline bonus.

### Step 3: lineage UI and goals

1. **Family tree** in the Archive, from the lineage records the game already keeps, showing each generation's trait and echo.
2. **Legacy goals**: streaks across generations (for example three full lives in a line, or every trait held once), rewarded with cosmetics only so power stays bounded.
3. **Inherited scrip** (if scrip lives on the netling): half passes to the next generation, as a small head start and a reason to end a life well.

## Still to decide

1. **Glitch**: should a caring player have a route to Glitch through deliberate risk (Pass 1, item 2), or should Glitch stay tied to neglect and faults?
2. **Teen stage**: variety through heritage teens (Pass 3, option C), a third teen from the axes, or leave teens as they are?
3. **The Deep**: an endgame wall (31% disconnects for careful players), or in line with the other regions?
4. **Codex cap**: is a per-life cap (Pass 2, option A) acceptable, or should pacing come from rarer drops instead?
5. **Scrip**: the name, whether it lives on the netling or is shared across generations, and whether markets should also take Charge.
6. **Lineage forms**: which of options A to D, and how many new forms to plan for.
7. **Echo strength**: half strength for a grandparent's trait, and the capped bonus when parent and grandparent share a trait?
