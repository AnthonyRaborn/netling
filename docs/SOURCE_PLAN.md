# Plan: a stage beyond Adult, and the Source

A design plan. None of this is built. Spoiler-heavy, like the rest of `docs/`. When it is built, the rules move into [SIMULATION.md](SIMULATION.md) and [NETRUN.md](NETRUN.md) and this file is retired or cut down to what stays open.

Working names are marked *(working)*. Stage ids, form ids, region ids and fragment ids are permanent once shipped (CLAUDE.md rule 1), so every name marked *(working)* needs sign-off before any code is written.

## Contents

- [Decisions so far](#decisions-so-far)
- [Still to decide](#still-to-decide)
- [The stage](#the-stage)
- [The five forms](#the-five-forms)
- [The Source](#the-source)
- [Codex](#codex)
- [Unlocks and cosmetics](#unlocks-and-cosmetics)
- [Saves and data](#saves-and-data)
- [Art and sound](#art-and-sound)
- [Balance targets and measurement](#balance-targets-and-measurement)
- [Everything that assumes three stages](#everything-that-assumes-three-stages)
- [Build order](#build-order)
- [Risks](#risks)

## Decisions so far

| Question | Decision |
|---|---|
| How the stage is reached | Time plus a feat. It must reach an age and also meet a condition in this life; otherwise it stays an adult. |
| How many forms | One for each adult form: five new forms, each keeping its line's identity and ability. |
| Life length | The stage adds one day of life, because the feat is hard to reach. |
| Root Access | It stays tied to the original 22 fragments. The new fragments give their own unlock. |
| Lineage reward | An elder passes its trait at level II or higher (see [Lineage](#lineage)). |
| The Source while locked | Not `???`: a corrupted, foreboding entry (see [Access](#access)). |
| Fragment wording | The drafts stand, with NL-0's `deep-5` line ending "i will not go again." |
| A new region | The Source. It is the last region, below The Deep. It needs the new stage, and it is somewhat harder than The Deep. |
| New codex entries | Several for the Source, and one new entry in The Deep that hints at the Source and at NL-0 not wanting to go there. |

## Still to decide

1. **The name of the stage and its id.** The working id is `elder` *(working)*. Other ideas: Legacy (fits "legacy code", but `LEGACY` and `LEGACY_LIFE` already mean other things in the code), Mainline, Sysop.
2. **The five form names and ids** (table below). They are all *(working)*.
3. **When the age half fires.** Two readings: (a) at the start of the last ordinary day (96 hours in a 5-day life; up to two days as an elder, ending at 144 hours), or (b) at the moment it would die of old age, it recompiles instead (at 120 hours; exactly one day as an elder). Either way it must be measured. Legacy 7-day lives do not need their own testing.
4. **Whether the stage names change too.** Under consideration: rename the displayed stages to a release cycle (Bitling, then Alpha, Beta and Prod or Gold), or keep teen and adult and name only the new stage (Frame, Mainframe or Interpreter). Stored stage ids (`teen`, `adult`) stay either way; only the displayed words change.

## The stage

### Reaching it

An adult recompiles into its elder form at the first step where all of these are true:

- `s.stage === 'adult'`
- `s.ageMin >= elderAt`, where `elderAt = s.life.lifespan - 24h`: 96 hours for a 5-day life, and 144 hours for a legacy 7-day life. Deriving it from `lifespan` means `s.life` and `cleanLife` need no new field.
- **The feat:** this netling has reached the exit of The Deep (`s.cleared.includes('deep')`). Clears already belong to each netling and are never inherited, so "cleared The Deep" already means "in this life".
- It is not on a netrun (`!s.run`). A recompile mid-run would swap its ability under the player. It recompiles on the first step after the run ends instead.

Order matters. Clearing The Deep before 96 hours means it waits until 96 hours. Clearing it after 96 hours means it recompiles as soon as it is home. The check sits with the teen and adult checks in `step()`, before the end-of-life check, so a netling that meets the gate on its last minute recompiles and gets its extra day.

Why this feat: The Deep is already the wall (35% careful disconnects without abilities, 15 to 19% with them), reaching it needs the whole way down in one life, and it points the player straight at the Source.

Alternatives that were weighed and set aside: the codex entry `deep-5` as the feat (that is lineage progress, not this netling's), and low faults (that is already Ghost's lever).

### The extra day

At the recompile, the netling gains a day: the life ends at `s.life.lifespan + CFG.elderBonusMin` (1440).

- Store it as its own field, `s.lifeBonus` (0, or 1440 once it is an elder), instead of editing `s.life.lifespan`. `cleanLife` refuses any lifespan over 7 days, and a legacy elder would reach 8. This way `cleanLife` stays as it is.
- The end-of-life check (`sim.js`, currently `s.ageMin >= s.life.lifespan`) reads a helper, `lifeEnd(s)`, which is `s.life.lifespan + (s.lifeBonus ?? 0)`. Everything else that reads `s.life.lifespan` for "time left" (the HUD age bar, the field manual, the balance tools) moves to the helper too.
- The bonus is fixed at 24 hours after `lifespan`, not 24 hours after the recompile. A netling that clears The Deep late gets a shorter elder stage, never a longer life overall. The longest life is 6 days, or 8 for a legacy netling.

### Its body and perks

- `SPECIES` gains five entries with `stage: 'elder'` and `line: '<adult form>'` (for example `{ name: 'Bastion', stage: 'elder', line: 'firewall' }`).
- A helper, `lineOf(form)`, returns the adult form for any adult or elder form. Every table keyed by adult form reads through it: `FORMS` (trait), `KEEPSAKES`, `FORM_MODS`, `FORM_ABILITIES`. An elder keeps its line's in-life perk and its line's netrun ability, and adds the elder upgrade below.
- The log line uses the existing `evolve()`: `> recompiling... netling is now BASTION.`

### Lineage

- `fragmentOf` passes the line's trait and keepsake (via `lineOf`), so the next generation gets exactly what an adult of that line would give.
- **Decided:** an elder passes its trait at level II or higher: `max(the streak level, 2)`. A streak that would already give level III still gives III. The per-trait caps (`TRAIT_CFG.cap`) still apply, so Persistent and Untraceable stay at 1.25. Run `tools/trait-balance.mjs` with a level II parent per trait to confirm nothing moves past the BALANCE.md limits (about 4 points on casual full lives, 8 on any adult form's share).
- A streak counts lines, not bodies: a Firewall parent followed by a Bastion child is a streak.
- The lineage record gains `elder: true`. The Archive shows the elder form, with the line in brackets.

## The five forms

All names are *(working)*. Each elder keeps its line's adult ability and adds one upgrade. Every upgrade uses a number already in `RUN_CFG`, so balance can tune it without new rules.

| Line | Elder *(working)* | Why the name | Keeps | Elder upgrade (proposal, to measure) |
|---|---|---|---|---|
| Chrome | Platinum | corp prestige tier | credentials, corp insurance | Corp insurance twice a run instead of once |
| Firewall | Bastion | a hardened host | ICE deals half damage | A lost ICE fight adds no Heat |
| Daemon | Init | PID 1, the first process | lookahead 2, +6 Integrity a move | Lookahead 3; +8 Integrity a move |
| Glitch | Fractal | chaos with structure | phases the first ICE, 35% after | Phases the first two ICE |
| Ghost | Null | not there at all | sees all, checkpoints never notice it, 45% ICE slip | ICE slip 55% |

What the upgrades should do: bring careful elders in the Source into the target band below, with no form more than about 6 points from the others. The balance run decides the numbers. The Deep's pass 2 showed that raising ICE damage pulls abilities apart, so the Source should be harder mainly by distance and ICE count (below), with the upgrades tuned to match.

## The Source

### Place in the world

The Source is where the net was written from. It holds the original KERNEL code and the purge order that was issued and never ran ("No purge was ever recorded", `public-1`). That order is still waiting, and that is why NL-0 will not go down there. The Source is read-only, lit and quiet, the opposite of The Deep's dark.

### Access

- `REGION_ORDER` becomes `public, bazaar, corp, ruins, deep, source`, and `STAGE_ORDER` becomes `baby, teen, adult, elder`.
- `minStage: 'elder'`, previous region `deep` (already required by the feat), and `requires: 'deep-5'`, the new Deep fragment (the same pattern as The Deep needing `ruins-4`).
- `regionLock` needs its article fix for the new stage ("needs an elder netling").
- **While locked, it does not show as `???`** (The Deep keeps `???`). It shows as a damaged entry, for example `<<SECTOR CORRUpTED>>`, with a blurb that reads as a warning, not a hint (draft: `do not open. do not open. do not`). It cannot be selected. Any motion in the label (characters swapping, a slow tear) toggles no faster than `FLASH_TOGGLE_MS` (CLAUDE.md rule 7) and is static under reduced motion.
- When it opens, the entry repairs itself to `Source` once, with a log line (draft: `> sector integrity: restored. something down there noticed.`).
- The exit message of The Deep never names it.

### Proposed numbers (starting point for measurement)

| | The Deep (now) | The Source (proposal) |
|---|---|---|
| Middle layers | 10 | 11 |
| Node weights (cache / ICE / relay / anomaly) | 2 / 8 / 1 / 2 | 2 / 9 / 1 / 3 |
| Checkpoints, markets | none | none |
| ICE damage | 50 | 52 |
| Exit bonus items | 2 | 3 |
| Loot | memory 3, booster 2, antivirus 2, coolant 2, repair 2, voucher 1, blackice 1, overclock 1, segfault 1 | overclock 2, memory 3, booster 2, repair 2, antivirus 2, coolant 2, blackice 1, voucher 1, segfault 1 |
| Palette | `#e8e8ff` on `#08081a` | near-white on black, such as `#f4f4f4` on `#000000`, with the usual accent |
| Sound | sine x0.5 | triangle x0.4 (clean and very low) |

These are guesses to start from. `tools/netrun-balance.mjs` sets the real values (see [targets](#balance-targets-and-measurement)).

### Flavour (no rule changes)

- Jacking into the Source with Root Access active logs something like `> NL-0: i'll wait up here.` Without Root Access, the log says nothing about it. This is a log line only: Root Access protects against flatlines, and a run can never cause one.
- One new chatter line in the `lineage` group for an elder, for example `NL-0 has gone quiet. it knows where you have been.` (draft).

### Contracts

Once the Source is open, `updateContract` offers it like any other region. There are no markets there, so `contractKinds` already drops the market kind. Consider leaving out `clean` for the Source if measurement shows a clean clear is too rare there to be fair (the contract rule is "solvable, not only through perfect play").

### Optional, not in the first cut

A Source-only anomaly (for example, "The purge order": READ IT or LEAVE IT). Anomalies have no region filter today, so this would add one. It can wait for a later pass.

## Codex

### New fragments (drafts)

| Id | Region | Title | Text (draft) |
|---|---|---|---|
| `deep-5` | The Deep | NL-0 | there is a floor under this floor. the code we were written from. i went down once, when i was the only one. i will not go again. |
| `source-1` | The Source | header | SOURCE. read-only. last write: before v1.0. |
| `source-2` | The Source | commit message | initial commit: 4,096 maintenance processes. TODO: give them a way to stop. |
| `source-3` | The Source | unexecuted directive | PURGE sector 7F. status: pending. pending. pending. pending. |
| `source-4` | The Source | a comment in the code, unsigned | if anyone ever reads this far: they were never bugs. |

`deep-5` goes last in The Deep's part of `FRAGMENTS`. It is the one that opens the way, as `ruins-4` does for The Deep. It also ends The Deep on NL-0's fear instead of its thanks. Placing it before `deep-4` would keep the thanks as the last word, but then the gate would be a fragment in the middle of the region, which nothing else does. Players who already have `deep-1` to `deep-4` get `deep-5` next either way.

`source-4` answers `public-4` ("They're not viruses."), so the codex opens and closes on the same idea.

### Root Access stays on the original 22

- Add `ROOT_FRAGMENTS`, the 22 ids that ship today, written out as a fixed list (not derived, so later fragments never join it).
- `rootUnlocked` and the `drainCodexInbox` check use `allFragmentsFound(codex, ROOT_FRAGMENTS)`. `progress.rootEarned` already keeps it for players who have it.
- Every other use of `FRAGMENTS` must be checked for "means all of them" versus "means the original 22". Known cases:
  - The Corp gold shell's `FRAGMENTS.every(...)`, hint "earn something from below": pin it to `ROOT_FRAGMENTS`.
  - The Abyss tint's `regionDone(c, 'deep')`: this would start needing `deep-5`. Recommend pinning it to `deep-1` to `deep-4`.

  Unlocks are sticky (`app.unlocked`), so no one loses one either way. Pinning only stops a player who is one fragment away from being moved further.
- The field manual and the Archive show the codex total. They will read 27.

### Pacing

27 fragments with 8 per life means at least 4 lives for the full codex (8 + 8 + 8 + 3). The 22 that Root Access needs still take at least 3. The balance goal "the codex takes at least 3 lives" still holds for Root Access. The Source's four fragments are also behind the elder stage, so in practice they come later still.

## Unlocks and cosmetics

Proposals. Each needs a permanent id and a hint.

| Unlock | Condition | Slot |
|---|---|---|
| A crest for the first elder | raise any elder | crest |
| A shell for the Source | find all four Source fragments (`regionDone(c, 'source')`) | tint or shell |
| A Source music variant | reach the Source's exit once (`progress.sourceExits`, like `deepExits`) | music (see [Art and sound](#art-and-sound)) |
| Optional: a Source accessory | found only in the Source (`regions: ['source']`), like the Deep's | accessory, one of the four wear slots |

The `LEGACY.adultsRaised` goal counts `FORMS[e.form]`. It must count lines (`lineOf`), so an elder still counts as its adult form.

## Saves and data

- **New values:** stage `elder`, five `SPECIES` ids, region `source`, fragments `deep-5` and `source-1` to `source-4`, `progress.sourceExits`, `s.lifeBonus`, and the lineage record's `elder` flag.
- **Defaults** (CLAUDE.md rule 2) in `createScript`, `migrate` and `cleanSave`: `lifeBonus: 0`. The sanitizer keeps it at `0` or `CFG.elderBonusMin`, and forces it to `0` unless the stage is `elder` (or `dead` with an elder form).
- **`sanitize.js`:** add `elder` to `STAGES`. `settle()` gains a branch: an `elder` whose body is not an elder form becomes the elder of `leaningForm(s)`'s line. The fragment cleaner maps elder forms through `lineOf`.
- **Bump `SAVE_VERSION`, with a step that changes nothing.** The new fields are additive, but an older build refuses a save with an unknown stage and treats it as damaged. With the version bumped, an older build sets it aside as `newer` ("reload to update") instead. That is the right message for an elder save opened on a stale tab, and it is the reason to bump. Rules for adding the step are in [DATA_AND_SAVES.md](DATA_AND_SAVES.md). Never edit an old step or `tests/fixtures/save-v1.json`.
- **Release:** bump `VERSION` and the `sw.js` `CACHE` together. Add any new source file to `SHELL` (none are planned; everything above fits in existing modules).

## Art and sound

- **Sprites:** five elder bodies. Each should read as its adult form grown older and larger, keeping the line's silhouette so the player sees the connection. They must pass `tools/sprite-audit.mjs`, including the anchors for all four wear slots and the `combos` check, and must hold the three-flashes-a-second rule (`tests/draw.test.js`). `gallery.html` loops `['baby', 'teen', 'adult']` and gains `elder`. SPRITES.md gets its audit numbers.
- **Dex:** five entries with hints that say nothing about the feat until one is raised, for example "some never stop growing." *(draft)*.
- **Music:** `tracks.js` has a region variant for `deep` (transposed down, slow, most parts muted). The Source gets its own: the opposite of The Deep, sparse and high, perhaps just the `ping` part and a pad. It is listed in MUSIC.md.
- **Sound voice:** the region's `sound` entry (above).

## Balance targets and measurement

| What | Target (proposal) | Tool |
|---|---|---|
| Careful elders, disconnects in the Source | 22 to 30% (The Deep with adult abilities is 15 to 19%) | `tools/netrun-balance.mjs`, new `source.*` rows, 4000 runs each |
| Spread between elder forms in the Source | at most about 6 points | same |
| Careful, no ability, in the Source | clearly worse than The Deep's 35%. This is a check, not a target. | same |
| Elder upgrades in The Deep | must not make The Deep trivial: careful elders at 8% or more | same |
| Lives that reach the elder stage | steer archetypes that run: some. Casual: rare. Report the numbers; no fixed target until they are seen. | `tools/balance.mjs` |
| Adult form shares | not moved by more than noise | `tools/balance.mjs`, `tools/balance-diff.mjs` |
| Codex pacing to Root Access | unchanged (median life 4 for attentive lines) | `tools/baseline/lineages.json` |

The balance bots do not run the whole way down in one life today. `tools/balance.mjs` needs an archetype that pushes for The Deep as an adult, or the elder share will read as zero whatever the rules say. Regenerate `tools/baseline/` in the same change and report what moved.

If the bots show that almost no one can meet the gate before the end of life, the first lever is the age half (`elderAt` earlier, for example 84 hours), not The Deep's difficulty.

## Everything that assumes three stages

A starting checklist. Before building, grep for `'adult'`, `STAGE_ORDER`, `FORMS[` and `FRAGMENTS` to catch more.

- `sim.js`: `step()` (the new check), `evolve()`, `CFG.runCooldownMin` (add `elder`, probably the adult value), `SPECIES`, `lineOf`, `lifeEnd`, `fragmentOf`, `flatline()` (an elder dying keeps its form, realized).
- `netrun/run.js`: `ability(pet)` is `pet.stage === 'adult' ? pet.form : null`. It becomes "adult or elder, through `lineOf`", plus the elder upgrades.
- `netrun/regions.js`: `REGIONS.source`, `REGION_ORDER`, `STAGE_ORDER`, the article in `regionLock`, `clearedForStage`.
- `netrun/codex.js`: fragments, `ROOT_FRAGMENTS`, `rootUnlocked`.
- `sanitize.js`: `STAGES`, `settle()`, `cleanFragment`, `lifeBonus`, the lineage record's `elder`.
- `ui/life.js` (`state.stage === 'teen' || state.stage === 'adult'`), `ui/archive.js` (abilities, lineage rows), `ui/onboarding.js` (the field manual: stages, the gate, the Source), `ui/play.js` (`sourceExits`, the picker), `ui/app.js` (`rootEarned` backfill uses `allFragmentsFound`).
- `archive.js`: `FORM_ABILITIES` lookups by form.
- `cosmetics.js`: Corp gold, Abyss, `adultsRaised`, new unlocks.
- `chatter.js`: the new line (no chatter condition reads `'adult'` today).
- `tracks.js`: the region variant.
- Tools: `balance.mjs` (stage days include `elder`; an archetype that goes deep), `netrun-balance.mjs` (the stage for elder styles), `smoke.mjs` (scenarios for an elder home screen and the Source picker), `sprite-audit.mjs`, `make-screenshots.mjs` if it lists forms, `gallery.html`.
- Docs: SIMULATION.md (stages, the gate, the extra day), NETRUN.md (region table, loot, codex table, abilities), CONTENT_CATALOG.md (forms, fragments, cosmetics), GLOSSARY.md, DATA_AND_SAVES.md (the version step), BALANCE.md (the goal "No fourth life stage for now" goes, and the new measurements come in), SPRITES.md, MUSIC.md, and the counts in `docs/README.md`. The top-level README stays spoiler-free. At most, it might say that some netlings grow further.

## Build order

Each step is one commit that passes `npm test` on its own.

1. **Names and text signed off.** Stage id, the five form ids and names, the fragment texts, and the unlock ids. Nothing is built before this, because ids are permanent.
2. **Sim.** The stage, the gate, `lifeBonus` and `lifeEnd`, `lineOf`, lineage, sanitizer, the save version step. Tests: the gate in each order (feat first or age first), not mid-run, the extra day, legacy lives, sanitizer repairs, and a v-previous save loading unchanged.
3. **Netrun.** `REGIONS.source`, access, elder abilities, the codex, `ROOT_FRAGMENTS`. Tests: access locks, map generation for the Source over many seeds (the existing reachability test covers it once it is in `REGION_ORDER`), Root Access on the 22 only, and contracts in the Source.
4. **Measure and tune.** The netrun and life balance runs above. Set the numbers, regenerate the baselines, and report with `balance-diff.mjs`.
5. **UI, art, sound.** Sprites through the audit, the dex, the Archive, the picker, the field manual, cosmetics, music, smoke scenarios.
6. **Docs and release.** Every doc in the checklist, the version bump, and the smoke run.

## Risks

- **Nobody reaches it.** The gate chains the whole way down in one life with The Deep's disconnect rate. Measure before tuning anything else, and move the age half first.
- **The upgrades leak into The Deep.** An elder is stronger everywhere, not only in the Source. That is fine as a reward, but The Deep should stay a wall for adults. Elders are past it by definition.
- **"All fragments" checks.** Any check missed in the `FRAGMENTS` audit would quietly move a goal. The tests should assert that Root Access and Corp gold do not change when fragments are added (`allFragmentsFound` already takes a `fragments` parameter for this).
- **Stale tabs.** Without the save version bump, an older build refuses an elder save as damaged. See [Saves and data](#saves-and-data).
- **Sprite scale.** Larger bodies must still leave room for the four wear slots. The audit's `ROOM_MAX` of 4 and the `minRow` rules apply.
