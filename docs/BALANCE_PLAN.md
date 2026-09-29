# Balance plan

An outline of three balance passes (adult and teen forms, netruns, lineage), with the measurements that motivate them. Nothing here is implemented yet. Spoiler-heavy, like the rest of `docs/`.

Measured on commit `767b7c5` (2026-09-29) with the tools in [TESTING.md](TESTING.md#balance-tools): `DETAIL=1 node tools/balance.mjs 300 <archetype>` and `node tools/netrun-balance.mjs 1000 <region|all>`. The simulators are scripted players, not people: treat the numbers as relative, and rerun them before acting on any of this.

## Contents

- [How the passes work](#how-the-passes-work)
- [Pass 0: tooling](#pass-0-tooling)
- [Pass 1: forms](#pass-1-forms)
- [Pass 2: netruns](#pass-2-netruns)
- [Pass 3: lineage](#pass-3-lineage)
- [Decisions needed](#decisions-needed)

## How the passes work

- **Order**: tooling first, then forms, then netruns, then lineage. Form odds decide which traits and abilities players see, so lineage is tuned last.
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
3. **Ghost**: decide whether it stays a deliberate chase (it is now). If it stays, keep the win requirement and settle KI-14 by counting a boosted win once toward Ghost, reported separately.
4. **Tie-break (KI-15)**: decide whether a neutral netling that misses Ghost should become Chrome, or whichever form its larger scaled axis points to.
5. **Teen variety (content, the largest change)**: a third teen form chosen from the axes at 24 hours, as a preview of the adult direction. A new form needs:
   - a permanent id and sprites;
   - a DEX entry with hints, and `DEX_ORDER`;
   - a check of every "all forms" condition in cosmetics and archive, the sanitizer whitelist, CONTENT_CATALOG and `gallery.html`.

   It is additive, so no save version bump.

### Candidate targets (to confirm)

- Attentive with mixed choices: no adult form above about 45%, and each of Chrome, Firewall, Daemon and Glitch at least 10%.
- Each deliberate archetype reaches its form at least 80% of the time, including Glitch through `daredevil` without faults.
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

1. **Pacing**: decide how many lives the codex should take (see Decisions), then tune the exit fragment chance (60%), the cache chance (15%) and the uplink cooldown (180 to 240 minutes, floor 120).
2. **Item economy**: fewer loot drops, or a sink for surplus items (for example trading two items for one at a market, or a keepsake slot). Target: players who run sometimes have a free slot.
3. **Difficulty curve**: bring the Corp Grid's disconnect rate below the Ruins' (ICE damage 40, or its checkpoint weight). Decide whether the Deep's 31% for careful players is the intended endgame wall.
4. **Abilities**: after Pass 0, bring Daemon and Ghost vision to within a few points of Firewall's disconnect rate, or give them a second effect.
5. Late-game content (seeded daily runs, run modifiers) is a feature, not balance; it is out of scope here, but its rewards would be tuned with the same tools.

### Candidate targets (to confirm)

- Careful-player disconnect rates rise region by region (Public < Bazaar ≈ Corp < Ruins < Deep), with the Deep under about 20%.
- Codex completion takes about 3 to 4 lives for an attentive player (measured with `LIVES=n`).
- No adult ability is more than about 4 points better than another at avoiding disconnects.

## Pass 3: lineage

### Findings

- A new generation inherits the parent's adult form as one trait, one quirk and one keepsake item. Nothing accumulates beyond one generation, apart from Root Access, the codex and cosmetics.
- Trait strength is unmeasured (Pass 0 adds this). Two to check first:
  - **Untraceable** (from Ghost) removes corp traces entirely. That also removes the HIDE and COMPLY choices, which are the main way to move allegiance, so it changes the next generation's likely form.
  - **Volatile** (from Glitch) multiplies play rewards by 1.5 but costs 1 Integrity an hour.
- Because good care funnels into Daemon (Pass 1), most lineages will pass on Persistent, and most players will see only one or two traits.

### Proposed changes

1. **Measure every trait** for casual and attentive players (full-life rate, faults, form odds). Bring outliers in line. Target: no trait changes the casual full-life rate by more than about 5 points.
2. **Depth over generations**, if wanted (see Decisions):
   - **Trait echoes**: a grandparent's trait at reduced strength.
   - **Trait levels**: the same adult form twice in a row strengthens the trait, capped.
   - **Legacy goals**: a record of streaks across generations, rewarded with cosmetics only, so power stays bounded.
3. **Family tree** in the Archive, from the lineage records the game already keeps. UI only.
4. **Save work**: echoes and levels add fields to the stored fragment and the lineage record, with defaults (no version bump). Changing the fragment's shape would need a `SAVE_VERSION` bump and a step in `src/migrations.js`. Trait ids and form ids stay as they are.

## Decisions needed

1. **Form odds**: are the candidate targets in Pass 1 the right shape? In particular, should a caring player be able to reach every form, or should some forms stay tied to a playstyle (Glitch to risk, Ghost to a deliberate chase)?
2. **Ghost**: a deliberate chase as now, or reachable by attentive players now and then? And should a boosted win count once or twice toward it?
3. **Teen stage**: add a third teen form (content work), or leave teens as Kernel or Stub?
4. **Codex pacing**: how many lives should finishing the codex take for an attentive player? For a casual one?
5. **Item scarcity**: fewer drops, or an item sink?
6. **The Deep**: an endgame wall, or in line with the other regions?
7. **Lineage depth**: keep one generation of inheritance, or add echoes, levels or legacy goals?
