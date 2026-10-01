# Plan: a stage beyond Adult, and the Source

A design plan. None of this is built. Spoiler-heavy, like the rest of `docs/`. When it is built, the rules move into [SIMULATION.md](SIMULATION.md) and [NETRUN.md](NETRUN.md) and this file is retired or cut down to what stays open.

Stage ids, form ids, region ids and fragment ids are permanent once shipped (CLAUDE.md rule 1), so every name still marked open needs sign-off before any code is written. Lore text marked *(draft)* can still change after shipping, since only ids are stored.

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
| The stage's name | **Mainframe**, id `mainframe`. Baby, teen and adult keep their names. |
| How the stage is reached | Time plus a feat. It must reach an age and also meet a condition in this life; otherwise it stays an adult. The age half is the start of the last ordinary day (96 hours in a 5-day life), so a mainframe can have up to two days. |
| Form names | Plat (Chrome), Airgap (Firewall), Init (Daemon), Panic (Glitch), Whisper (Ghost). |
| Testing the gate | A measurement in the balance tools comes first, before any game code (see [The gate test](#the-gate-test)). |
| How many forms | One for each adult form: five new forms, each keeping its line's identity and ability. |
| Life length | The stage adds one day of life, because the feat is hard to reach. |
| Root Access | It stays tied to the original 22 fragments. The new fragments give their own unlock. |
| Lineage reward | A mainframe passes its trait at level II or higher (see [Lineage](#lineage)). |
| The Source while locked | Not `???`: a corrupted, foreboding entry (see [Access](#access)). |
| Fragment wording | The drafts stand, with NL-0's `deep-5` line ending "i will not go again." |
| A new region | The Source. It is the last region, below The Deep. It needs the new stage, and it is somewhat harder than The Deep. |
| New codex entries | Several for the Source, and one new entry in The Deep that hints at the Source and at NL-0 not wanting to go there. |

## Still to decide

1. **Whether the gate holds up.** The [gate test](#the-gate-test) runs before anything is built. Its numbers may move the age half or the feat.

## The stage

### Reaching it

Decided: reading (a), the start of the last ordinary day. Reading (b), recompiling at the moment it would die of old age, was set aside because it leaves only one day as a mainframe, about eight uplink cooldowns.

An adult recompiles into its mainframe form at the first step where all of these are true:

- `s.stage === 'adult'`
- `s.ageMin >= mainframeAt`, where `mainframeAt = s.life.lifespan - 24h`: 96 hours for a 5-day life (144 for a legacy 7-day life, which needs no separate testing). Deriving it from `lifespan` means `s.life` and `cleanLife` need no new field.
- **The feat:** this netling has reached the exit of The Deep (`s.cleared.includes('deep')`). Clears already belong to each netling and are never inherited, so "cleared The Deep" already means "in this life".
- It is not on a netrun (`!s.run`). A recompile mid-run would swap its ability under the player. It recompiles on the first step after the run ends instead.

Order matters. Clearing The Deep before 96 hours means it waits until 96 hours. Clearing it after 96 hours means it recompiles as soon as it is home. The check sits with the teen and adult checks in `step()`, before the end-of-life check, so a netling that meets the gate on its last minute recompiles and gets its extra day.

Why this feat: The Deep is already the wall (35% careful disconnects without abilities, 15 to 19% with them), reaching it needs the whole way down in one life, and it points the player straight at the Source.

Alternatives that were weighed and set aside: the codex entry `deep-5` as the feat (that is lineage progress, not this netling's), and low faults (that is already Ghost's lever).

### The extra day

At the recompile, the netling gains a day: the life ends at `s.life.lifespan + CFG.mainframeBonusMin` (1440).

- Store it as its own field, `s.lifeBonus` (0, or 1440 once it is a mainframe), instead of editing `s.life.lifespan`. `cleanLife` refuses any lifespan over 7 days, and a legacy mainframe would reach 8. This way `cleanLife` stays as it is.
- The end-of-life check (`sim.js`, currently `s.ageMin >= s.life.lifespan`) reads a helper, `lifeEnd(s)`, which is `s.life.lifespan + (s.lifeBonus ?? 0)`. Everything else that reads `s.life.lifespan` for "time left" (the HUD age bar, the field manual, the balance tools) moves to the helper too.
- The bonus is fixed at 24 hours after `lifespan`, not 24 hours after the recompile. A netling that clears The Deep late gets a shorter mainframe stage, never a longer life overall. The longest life is 6 days, or 8 for a legacy netling.

### Its body and perks

- `SPECIES` gains five entries with `stage: 'mainframe'` and `line: '<adult form>'` (for example `{ name: 'Airgap', stage: 'mainframe', line: 'firewall' }`).
- A helper, `lineOf(form)`, returns the adult form for any adult or mainframe form. Every table keyed by adult form reads through it: `FORMS` (trait), `KEEPSAKES`, `FORM_MODS`, `FORM_ABILITIES`. A mainframe keeps its line's in-life perk and its line's netrun ability, and adds the mainframe upgrade below.
- The log line uses the existing `evolve()`: `> recompiling... netling is now AIRGAP.`

### Lineage

- `fragmentOf` passes the line's trait and keepsake (via `lineOf`), so the next generation gets exactly what an adult of that line would give.
- **Decided:** a mainframe passes its trait at level II or higher: `max(the streak level, 2)`. A streak that would already give level III still gives III. The per-trait caps (`TRAIT_CFG.cap`) still apply, so Persistent and Untraceable stay at 1.25. Run `tools/trait-balance.mjs` with a level II parent per trait to confirm nothing moves past the BALANCE.md limits (about 4 points on casual full lives, 8 on any adult form's share).
- A streak counts lines, not bodies: a Firewall parent followed by an Airgap child is a streak.
- The lineage record gains `mainframe: true`. The Archive shows the mainframe form, with the line in brackets.

## The five forms

Each mainframe keeps its line's adult ability and adds one upgrade. Every upgrade uses a number already in `RUN_CFG`, so balance can tune it without new rules.

| Line | Mainframe form | Why the name | Keeps | Mainframe upgrade (proposal, to measure) |
|---|---|---|---|---|
| Chrome | Plat (`plat`) | corp prestige tier, short like Stub and Init | credentials, corp insurance | Corp insurance twice a run instead of once |
| Firewall | Airgap (`airgap`) | a machine cut off from every network: trusts nothing upstream, at the limit | ICE deals half damage | A lost ICE fight adds no Heat |
| Daemon | Init (`init`) | PID 1, the first process | lookahead 2, +6 Integrity a move | Lookahead 3; +8 Integrity a move |
| Glitch | Panic (`panic`) | a kernel panic; echoes the Kernel teen | phases the first ICE, 35% after | Phases the first two ICE |
| Ghost | Whisper (`whisper`) | in Ghost in the Shell, characters act on what their ghost whispers to them | sees all, checkpoints never notice it, 45% ICE slip | ICE slip 55% |

Ghost's form keeps the Ghost in the Shell thread that runs from the Shell teen. Set aside along the way: Spark (an accessory already has the name), Null (`null` is a poor stored id), Vast (too generic), Rootkit, Major.

What the upgrades should do: bring careful mainframes in the Source into the target band below, with no form more than about 6 points from the others. The balance run decides the numbers. The Deep's pass 2 showed that raising ICE damage pulls abilities apart, so the Source should be harder mainly by distance and ICE count (below), with the upgrades tuned to match.

## The Source

### Place in the world

The Source is where the net was written from. It holds the original KERNEL code and the purge order that was issued and never ran ("No purge was ever recorded", `public-1`). That order is still waiting, and that is why NL-0 will not go down there. The Source is read-only, lit and quiet, the opposite of The Deep's dark.

### Access

- `REGION_ORDER` becomes `public, bazaar, corp, ruins, deep, source`, and `STAGE_ORDER` becomes `baby, teen, adult, mainframe`.
- `minStage: 'mainframe'`, previous region `deep` (already required by the feat), and `requires: 'deep-5'`, the new Deep fragment (the same pattern as The Deep needing `ruins-4`).
- `regionLock` needs its article fix for the new stage ("needs a mainframe netling").
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
- One new chatter line in the `lineage` group for a mainframe, for example `NL-0 has gone quiet. it knows where you have been.` (draft).

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

27 fragments with 8 per life means at least 4 lives for the full codex (8 + 8 + 8 + 3). The 22 that Root Access needs still take at least 3. The balance goal "the codex takes at least 3 lives" still holds for Root Access. The Source's four fragments are also behind the mainframe stage, so in practice they come later still.

## Unlocks and cosmetics

Proposals. Each needs a permanent id and a hint.

| Unlock | Condition | Slot |
|---|---|---|
| A crest for the first mainframe | raise any mainframe | crest |
| A shell for the Source | find all four Source fragments (`regionDone(c, 'source')`) | tint or shell |
| A Source music variant | reach the Source's exit once (`progress.sourceExits`, like `deepExits`) | music (see [Art and sound](#art-and-sound)) |
| Optional: a Source accessory | found only in the Source (`regions: ['source']`), like the Deep's | accessory, one of the four wear slots |

The `LEGACY.adultsRaised` goal counts `FORMS[e.form]`. It must count lines (`lineOf`), so a mainframe still counts as its adult form.

## Saves and data

- **New values:** stage `mainframe`, five `SPECIES` ids, region `source`, fragments `deep-5` and `source-1` to `source-4`, `progress.sourceExits`, `s.lifeBonus`, and the lineage record's `mainframe` flag.
- **Defaults** (CLAUDE.md rule 2) in `createScript`, `migrate` and `cleanSave`: `lifeBonus: 0`. The sanitizer keeps it at `0` or `CFG.mainframeBonusMin`, and forces it to `0` unless the stage is `mainframe` (or `dead` with a mainframe form).
- **`sanitize.js`:** add `mainframe` to `STAGES`. `settle()` gains a branch: an `mainframe` whose body is not a mainframe form becomes the mainframe of `leaningForm(s)`'s line. The fragment cleaner maps mainframe forms through `lineOf`.
- **Bump `SAVE_VERSION`, with a step that changes nothing.** The new fields are additive, but an older build refuses a save with an unknown stage and treats it as damaged. With the version bumped, an older build sets it aside as `newer` ("reload to update") instead. That is the right message for a mainframe save opened on a stale tab, and it is the reason to bump. Rules for adding the step are in [DATA_AND_SAVES.md](DATA_AND_SAVES.md). Never edit an old step or `tests/fixtures/save-v1.json`.
- **Release:** bump `VERSION` and the `sw.js` `CACHE` together. Add any new source file to `SHELL` (none are planned; everything above fits in existing modules).

## Art and sound

- **Sprites:** five mainframe bodies. Each should read as its adult form grown older and larger, keeping the line's silhouette so the player sees the connection. They must pass `tools/sprite-audit.mjs`, including the anchors for all four wear slots and the `combos` check, and must hold the three-flashes-a-second rule (`tests/draw.test.js`). `gallery.html` loops `['baby', 'teen', 'adult']` and gains `mainframe`. SPRITES.md gets its audit numbers.
- **Dex:** five entries with hints that say nothing about the feat until one is raised, for example "some never stop growing." *(draft)*.
- **Music:** `tracks.js` has a region variant for `deep` (transposed down, slow, most parts muted). The Source gets its own: the opposite of The Deep, sparse and high, perhaps just the `ping` part and a pad. It is listed in MUSIC.md.
- **Sound voice:** the region's `sound` entry (above).

## Balance targets and measurement

| What | Target (proposal) | Tool |
|---|---|---|
| Careful mainframes, disconnects in the Source | 22 to 30% (The Deep with adult abilities is 15 to 19%) | `tools/netrun-balance.mjs`, new `source.*` rows, 4000 runs each |
| Spread between mainframe forms in the Source | at most about 6 points | same |
| Careful, no ability, in the Source | clearly worse than The Deep's 35%. This is a check, not a target. | same |
| Mainframe upgrades in The Deep | must not make The Deep trivial: careful mainframes at 8% or more | same |
| Lives that reach the mainframe stage | steer archetypes that run: some. Casual: rare. Report the numbers; no fixed target until they are seen. | `tools/balance.mjs` |
| Adult form shares | not moved by more than noise | `tools/balance.mjs`, `tools/balance-diff.mjs` |
| Codex pacing to Root Access | unchanged (median life 4 for attentive lines) | `tools/baseline/lineages.json` |

Regenerate `tools/baseline/` in the same change and report what moved.

### The gate test

Run this first, in the tools only, before any game code. It answers whether the gate is reachable and how much time it leaves.

**Why the current tools can't answer it.** The bots in `tools/balance.mjs` already head for the deepest open region until they clear it (the way down). But a single life starts with an empty codex, and The Deep needs `ruins-4`, so a single-life bot never sees The Deep. Only `LIVES=n` lineages carry the codex forward, and by then the lineage numbers are mixed with the codex pace.

**What to add** (tools only; `src/` untouched):

1. **A codex preset** for `tools/balance.mjs`: `CODEX=deep` starts every life knowing the 22 shipped fragments, so the way down is open as far as The Deep from the first life. `CODEX=ruins` (up to `ruins-4`) is a second setting, the earliest a real lineage meets the gate.
2. **A gate probe.** After every check-in, the tool records the first minute at which an adult is not on a run, has reached The Deep's exit, and is at least `lifespan - 24h` old. That is when it would recompile. Nothing in the life changes, so this measures the gate alone, not the mainframe's effects.
3. **Per archetype, report:** the share of lives that meet the gate, the median and 10th-percentile age at which they meet it, the hours left as a mainframe (`lifespan + 24h` minus that age), the share whose Deep clear came after 96 hours (it waited on the feat, not the age), and the number of Deep attempts and disconnects before the first clear.
4. **A deliberate archetype**, `steer-mainframe`: attentive care, careful runs, and it heads down at every chance. It shows the best case a player who wants the stage can reach. The existing archetypes show how often it happens without trying.
5. **A unit test** for the probe's condition, so the tool and the later `sim.js` rule cannot drift apart. When the stage is built, the probe calls the same exported helper (`mainframeDue(s)`) the sim uses.

**What would change the plan:**

| Result | Response |
|---|---|
| `steer-mainframe` meets the gate in under about half its lives | Move the age half earlier (84 hours) before touching The Deep. |
| Casual or worker archetypes meet it often | The feat is too easy: consider also requiring a clean Deep clear, or a maximum number of faults. |
| Most gates are met on the age half, with time to spare | Fine: the feat is the real test, as intended. |
| Most gates are met late, from a Deep clear after 96 hours, leaving under a day | The age half is not the issue: The Deep's disconnect rate is. Consider whether The Deep should count its clear from any jack-out at its exit, a relay included (it does not today). |

Report it with 1000 lives per archetype and the fixed seeds, like any other balance number.

If the bots show that almost no one can meet the gate before the end of life, the first lever is the age half (`mainframeAt` earlier, for example 84 hours), not The Deep's difficulty.

## Everything that assumes three stages

A starting checklist. Before building, grep for `'adult'`, `STAGE_ORDER`, `FORMS[` and `FRAGMENTS` to catch more.

- `sim.js`: `step()` (the new check), `evolve()`, `CFG.runCooldownMin` (add `mainframe`, probably the adult value), `SPECIES`, `lineOf`, `lifeEnd`, `fragmentOf`, `flatline()` (a mainframe dying keeps its form, realized).
- `netrun/run.js`: `ability(pet)` is `pet.stage === 'adult' ? pet.form : null`. It becomes "adult or mainframe, through `lineOf`", plus the mainframe upgrades.
- `netrun/regions.js`: `REGIONS.source`, `REGION_ORDER`, `STAGE_ORDER`, the article in `regionLock`, `clearedForStage`.
- `netrun/codex.js`: fragments, `ROOT_FRAGMENTS`, `rootUnlocked`.
- `sanitize.js`: `STAGES`, `settle()`, `cleanFragment`, `lifeBonus`, the lineage record's `mainframe`.
- `ui/life.js` (`state.stage === 'teen' || state.stage === 'adult'`), `ui/archive.js` (abilities, lineage rows), `ui/onboarding.js` (the field manual: stages, the gate, the Source), `ui/play.js` (`sourceExits`, the picker), `ui/app.js` (`rootEarned` backfill uses `allFragmentsFound`).
- `archive.js`: `FORM_ABILITIES` lookups by form.
- `cosmetics.js`: Corp gold, Abyss, `adultsRaised`, new unlocks.
- `chatter.js`: the new line (no chatter condition reads `'adult'` today).
- `tracks.js`: the region variant.
- Tools: `balance.mjs` (stage days include `mainframe`; an archetype that goes deep), `netrun-balance.mjs` (the stage for mainframe styles), `smoke.mjs` (scenarios for a mainframe home screen and the Source picker), `sprite-audit.mjs`, `make-screenshots.mjs` if it lists forms, `gallery.html`.
- Docs: SIMULATION.md (stages, the gate, the extra day), NETRUN.md (region table, loot, codex table, abilities), CONTENT_CATALOG.md (forms, fragments, cosmetics), GLOSSARY.md, DATA_AND_SAVES.md (the version step), BALANCE.md (the goal "No fourth life stage for now" goes, and the new measurements come in), SPRITES.md, MUSIC.md, and the counts in `docs/README.md`. The top-level README stays spoiler-free. At most, it might say that some netlings grow further.

## Build order

Each step is one commit that passes `npm test` on its own.

0. **The gate test.** Tools only, as above. Report the numbers before any game code.
1. **Names and text signed off.** The unlock ids (every stage and form id is decided). Nothing is built before this, because ids are permanent.
2. **Sim.** The stage, the gate, `lifeBonus` and `lifeEnd`, `lineOf`, lineage, sanitizer, the save version step. Tests: the gate in each order (feat first or age first), not mid-run, the extra day, legacy lives, sanitizer repairs, and a v-previous save loading unchanged.
3. **Netrun.** `REGIONS.source`, access, mainframe abilities, the codex, `ROOT_FRAGMENTS`. Tests: access locks, map generation for the Source over many seeds (the existing reachability test covers it once it is in `REGION_ORDER`), Root Access on the 22 only, and contracts in the Source.
4. **Measure and tune.** The netrun and life balance runs above. Set the numbers, regenerate the baselines, and report with `balance-diff.mjs`.
5. **UI, art, sound.** Sprites through the audit, the dex, the Archive, the picker, the field manual, cosmetics, music, smoke scenarios.
6. **Docs and release.** Every doc in the checklist, the version bump, and the smoke run.

## Risks

- **Nobody reaches it.** The gate chains the whole way down in one life with The Deep's disconnect rate. Measure before tuning anything else, and move the age half first.
- **The upgrades leak into The Deep.** A mainframe is stronger everywhere, not only in the Source. That is fine as a reward, but The Deep should stay a wall for adults. Mainframes are past it by definition.
- **"All fragments" checks.** Any check missed in the `FRAGMENTS` audit would quietly move a goal. The tests should assert that Root Access and Corp gold do not change when fragments are added (`allFragmentsFound` already takes a `fragments` parameter for this).
- **Stale tabs.** Without the save version bump, an older build refuses a mainframe save as damaged. See [Saves and data](#saves-and-data).
- **Sprite scale.** Larger bodies must still leave room for the four wear slots. The audit's `ROOM_MAX` of 4 and the `minRow` rules apply.
