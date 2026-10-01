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
| How the stage is reached | Time plus a feat. The age half is the start of the last ordinary day (96 hours in a 5-day life), so a mainframe can have up to two days. The feat: **three exits from The Deep in this life, or two clean ones** (no ICE fight lost). Otherwise it stays an adult. |
| A prerequisite | **The Chrome corp-relay fix** ([below](#chrome-lags-on-exits-fixed-corp-relays)), shipped first as its own change. Without it Chrome met the feat far less often than the other forms. |
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

1. **The unlock ids** (see [Unlocks and cosmetics](#unlocks-and-cosmetics)). Every stage, form, region and fragment id is decided.

## The stage

### Reaching it

Decided: reading (a), the start of the last ordinary day. Reading (b), recompiling at the moment it would die of old age, was set aside because it leaves only one day as a mainframe, about eight uplink cooldowns.

An adult recompiles into its mainframe form at the first step where all of these are true:

- `s.stage === 'adult'`
- `s.ageMin >= mainframeAt`, where `mainframeAt = s.life.lifespan - 24h`: 96 hours for a 5-day life (144 for a legacy 7-day life, which needs no separate testing). Deriving it from `lifespan` means `s.life` and `cleanLife` need no new field.
- **The feat:** this life, it has reached The Deep's exit three times, or twice without losing an ICE fight on the way (`s.deepExits.all >= 3 || s.deepExits.clean >= 2`). A new per-life counter, `s.deepExits = { all, clean }`, is raised by `jackOut` when the run ends on The Deep's exit node; "clean" is the same test as a clean jack-out (`tally.iceLost === 0`). Relay jack-outs, disconnects and aborts never count. The rule is `mainframeFeat` and `mainframeDue` in `tools/lib/mainframe-gate.mjs`, which move into `sim.js` when the stage is built.
- It is not on a netrun (`!s.run`). A recompile mid-run would swap its ability under the player. It recompiles on the first step after the run ends instead.

Order matters. Meeting the feat before 96 hours means it waits until 96 hours. Meeting it after 96 hours means it recompiles as soon as it is home. The check sits with the teen and adult checks in `step()`, before the end-of-life check, so a netling that meets the gate on its last minute recompiles and gets its extra day.

Why this feat: The Deep is already the wall, reaching it needs the whole way down in one life, and it points the player straight at the Source. One exit turned out to be no test at all (every runner made it); three, or two clean, asks for mastery. The two routes suit different forms: forms that endure (Firewall, Daemon, a fixed Chrome) get there by count, and Glitch, which slips past ICE, by clean runs. In the field manual: "prove yourself in The Deep: three times, or twice without a scratch." (draft)

Alternatives that were weighed and set aside (measurements in the [gate test results](#gate-test-results)): one Deep exit (far too easy), the codex entry `deep-5` (lineage progress, not this netling's), a fault limit (does not test netrunning, and shuts out the Stub line), and flow (shuts out the Glitch line, whose way is running hot).

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

- **New values:** `s.deepExits` (`{ all, clean }`, per life; default `{ all: 0, clean: 0 }`; the sanitizer keeps both as whole numbers from 0 to 99 with `clean <= all`), stage `mainframe`, five `SPECIES` ids, region `source`, fragments `deep-5` and `source-1` to `source-4`, `progress.sourceExits`, `s.lifeBonus`, and the lineage record's `mainframe` flag.
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
| Lives that reach the mainframe stage | Deliberate runners: about half, every form within about 10 points. Casual: a quarter or less. Workers and players who never run: rare. Measured with the chosen feat and the Chrome fix: deliberate 57 to 65%, casual 27%, worker 0% ([results](#gate-test-results)). | `CODEX=deep node tools/balance.mjs 1000` |
| Adult form shares | not moved by more than noise | `tools/balance.mjs`, `tools/balance-diff.mjs` |
| Codex pacing to Root Access | unchanged (median life 4 for attentive lines) | `tools/baseline/lineages.json` |

Regenerate `tools/baseline/` in the same change and report what moved.

### The gate test

Run this first, in the tools only, before any game code. It answers whether the gate is reachable and how much time it leaves.

**Why the current tools can't answer it.** The bots in `tools/balance.mjs` already head for the deepest open region until they clear it (the way down). But a single life starts with an empty codex, and The Deep needs `ruins-4`, so a single-life bot never sees The Deep. Only `LIVES=n` lineages carry the codex forward, and by then the lineage numbers are mixed with the codex pace.

**What was built** (tools only; `src/` untouched; how to run it is in [TESTING.md](TESTING.md#toolsbalancemjs)):

1. **Codex presets** for `tools/balance.mjs`: `CODEX=deep` starts every single life knowing every fragment (and with Root Access, as the game would grant it). `CODEX=ruins` starts it knowing the fragments through `ruins-4`, the earliest a lineage can open The Deep.
2. **A gate probe.** Every simulated minute, the tool checks `mainframeDue(s)` (`tools/lib/mainframe-gate.mjs`): an adult, home from any run, The Deep cleared this life, and at least `lifespan - 24h` old. The first minute it holds is when the netling would recompile. Nothing in the life changes, so this measures the gate alone, not the mainframe's effects.
3. **The report** (`mainframe` in `stats()`): the share that cleared The Deep and met the gate, the median and earliest-tenth age at the gate, the hours it would have as a mainframe, the share that waited on the feat, and Deep runs and disconnects up to the first clear. It also measures harder feats beside the planned one (`FEATS`).
4. **`steer-mainframe`**: attentive care and careful runs, but it jacks in at every chance.
5. **Unit tests** in `tests/tools.test.js` for the rule and the probe. When the stage is built, `mainframeDue` moves into `sim.js` and the tool imports it from there.

**What would have changed the plan** (written before the run):

| Result | Response |
|---|---|
| `steer-mainframe` meets the gate in under about half its lives | Move the age half earlier (84 hours) before touching The Deep. |
| Casual or worker archetypes meet it often | The feat is too easy: consider also requiring a clean Deep clear, or a maximum number of faults. |
| Most gates are met on the age half, with time to spare | Fine: the feat is the real test, as intended. |
| Most gates are met late, from a Deep clear after 96 hours, leaving under a day | The age half is not the issue: The Deep's disconnect rate is. |

### Gate test results

`CODEX=deep node tools/balance.mjs 1000` and `CODEX=ruins node tools/balance.mjs 1000`. The two presets give the same numbers except for casual players, who meet the gate 92% of the time without Root Access (4% die before the age half) against 99% with it. Archetypes that never run (`neglectful`, `corpo`, `runner`, `overclocker`, `sysadmin`, `ghosthunter`) never reach The Deep and are left out.

**The planned feat is far too easy.** Every archetype that runs netruns, casual included, meets it in 92 to 100% of lives. They clear The Deep in 1.3 to 2.1 tries, long before 96 hours, so the age half decides the timing for almost everyone: the gate opens at 96 hours, and 48 hours as a mainframe is the norm. Workers are the exception (4%): their careful runs only start when they will be back within two hours, which their schedule rarely allows.

The "Deep is a wall" goal is about single runs (15 to 35% disconnects). Over two adult days of runs, a wall that stops a third of tries still falls.

**The harder feats** (share of lives that would meet them, `CODEX=deep`):

| Archetype | One Deep exit (planned) | Two exits | Three exits | One clean exit | Two clean exits | Exit with at most 2 faults |
|---|---|---|---|---|---|---|
| attentive | 100% | 79% | 50% | 63% | 23% | 99% |
| casual | 99% | 59% | 24% | 35% | 7% | 41% |
| worker | 4% | 0% | 0% | 2% | 0% | 0% |
| daredevil | 100% | 77% | 44% | 79% | 44% | 96% |
| steer-chrome | 100% | 64% | 28% | 70% | 24% | 99% |
| steer-firewall | 100% | 87% | 58% | 61% | 19% | 100% |
| steer-daemon | 100% | 85% | 58% | 64% | 24% | 99% |
| steer-glitch | 100% | 72% | 39% | 90% | 54% | 91% |
| steer-stub | 100% | 82% | 51% | 73% | 32% | 1% |
| steer-mainframe | 100% | 81% | 53% | 63% | 22% | 99% |

What the table says:

- **Counting exits** separates effort best. Three Deep exits: about half of deliberate players, a quarter of casual ones. It leans toward the forms that are strongest in The Deep (Firewall and Daemon 58%, Chrome 28%).
- **Clean exits** lean hard toward Glitch, whose phasing skips ICE (90% against 61 to 70% for the others; 54% against about 20% for two). This is the pull-apart effect pass 2 found with ICE damage.
- **A fault limit** does not test netrunning at all. Careful players almost never fault, and it would quietly shut out the Stub line (1%).
- **Time left is never the problem.** Every variant leaves a median of 44 to 48 hours. Moving the age half earlier is not needed.

The bots run at every check-in where they are healthy, so these are upper bounds: real players run less often. Casual numbers are the ones to watch, since a real casual player runs much less than the casual bot.

**Combined and flow-based feats** (measured next; `CODEX=deep`, 1000 lives; median hours left as a mainframe was 44 to 48 for every variant). Flow is the glow after 3 hours awake in good shape, which needs Heat under 60 (see [ATTENTION.md](ATTENTION.md)).

| Archetype | Three exits | Three exits, or two clean | Two exits and flow once this life | Two exits, one jacked into in flow |
|---|---|---|---|---|
| attentive | 50% | 55% | 79% | 49% |
| casual | 24% | 26% | 5% | 0% |
| worker | 0% | 0% | 0% | 0% |
| daredevil | 44% | 56% | 15% | 1% |
| steer-chrome | 28% | 37% | 64% | 37% |
| steer-firewall | 58% | 59% | 87% | 54% |
| steer-daemon | 58% | 60% | 85% | 53% |
| steer-glitch | 39% | 57% | 5% | 0% |
| steer-stub | 51% | 58% | 82% | 50% |
| steer-mainframe | 53% | 56% | 81% | 52% |

- **"Three exits, or two clean"** evens out the forms: the clean route lifts Glitch (39% to 57%) and Chrome (28% to 37%), and the others barely move. Every deliberate player lands between 37 and 60%, casual at 26%.
- **Flow-based feats shut out the Glitch line.** The way to Glitch is running hot (Heat 85 and over leans it chaotic), and flow needs Heat under 60, so the Glitch-steering and daredevil bots almost never reach flow (0.03 and 0.1 hours a life, against 15 to 20 for careful players). A real player could cool an adult Glitch down to reach flow; the bot does not try. Flow also mostly shuts out casual players (5%), which fits "earned", but the form lean is the same problem a fault limit had with the Stub line. "Flow once this life" adds almost nothing over two exits for careful players; "jacked into in flow" is about as hard as three exits for them.

### Chrome lags on exits (fixed: corp relays)

Chrome trails every exit-count feat (28% on three exits against 58% for Firewall and Daemon). The cause is not disconnects: careful Chrome disconnects in The Deep as often as Daemon (18%). It leaves early instead. With no healing and no damage cut, its Integrity drops under the careful bot's bank-out point (55) and it jacks out at a relay. Its credentials do nothing in regions without checkpoints, and its insurance only stops disconnects. The gap is in every region, not only The Deep. Pass 2 compared disconnect rates, so it did not show.

Exit reached, careful play (scratch prototype, 2000 to 4000 runs a cell, `src/` untouched):

| Change | Corp Grid | Old Web Ruins | The Deep | steer-chrome meets "three exits" |
|---|---|---|---|---|
| None (Chrome now) | 76% | 76% | 31% | 28% |
| Other forms, for comparison | 83 to 91% | 85 to 93% | 48 to 58% | 39 to 58% |
| **Corp relays:** relays also repair 20 Integrity for Chrome | 89% | 86% | 44% | 54% |
| Corp clearance: the first lost ICE fight each run does half damage | 87% | 87% | 45% | 59% |
| Bigger insurance payout (12 to 50) | not measured | not measured | 37% | not measured |

**Shipped: corp relays** (`RUN_CFG.chromeRelayRepair`, 20; build step 1). Measured with the real rule: exactly the prototype's gate numbers (steer-chrome 57% on the chosen feat), Chrome's Deep disconnects 18% to 20%, and no adult form share or full-life rate moving by more than noise. Why it was chosen over the alternatives: It fits Chrome (the grid services its own) and gives its credentials a use where there are no checkpoints. It raises exits without lowering The Deep's disconnect rate (about 20%), so The Deep stays a wall. Corp clearance works about as well, but halving ICE damage is Firewall's identity.

It shipped as its own change to the current game: the rule in `run.js` (Chrome's relay note says it was patched), a test, the ability text (`FORM_ABILITIES`, shown in the dex), NETRUN.md and the other docs, and regenerated baselines. The bots bank at a fixed Integrity, which exaggerates relay exits; real players may push on more, so the gap it closed was probably smaller in real play, though real.

**Gate test with the corp-relay fix** (`CODEX=deep`, 1000 lives, `chromeRelayRepair: 20` in a scratch prototype):

| Archetype | Two exits | Three exits | Three exits, or two clean | One clean exit |
|---|---|---|---|---|
| attentive | 79 to 84% | 50 to 55% | 55 to 58% | 63 to 61% |
| casual | 59 to 62% | 24 to 25% | 26 to 27% | 35 to 34% |
| steer-chrome | 64 to 85% | **28 to 54%** | 37 to 57% | 70 to 62% |
| steer-firewall | 87% | 58% | 59% | 61% |
| steer-daemon | 85% | 58% | 60% | 64% |
| steer-glitch | 72% | 39% | 57% | 90% |
| steer-mainframe | 81 to 86% | 53 to 58% | 56 to 60% | 63 to 61% |

Forms without the fix do not move. Chrome's clean exits drop a little: with relays mending it, it pushes on past relays it used to bank at, and meets more ICE. With the fix, Glitch becomes the outlier on three exits (39%), so "three exits, or two clean" stays the most even: every deliberate archetype lands between 57 and 65%, casual at 27%.

Ordinary lives (no codex preset, against `tools/baseline/lives.json`): no adult form share moves, full-life rates move by at most 0.5 points (casual, up), and casual disconnects fall from 1.14 to 1.09 a life.

**Decided: three Deep exits, or two clean ones,** with the Chrome corp-relay fix shipped first. The probe's main gate (`mainframeDue`) now uses it. Before the fix (`CODEX=deep node tools/balance.mjs 1000`):

| Archetype | Met | Met at (median) | Time as a mainframe (median, shortest tenth) | Met the feat after 96 hours |
|---|---|---|---|---|
| attentive | 55% | 96h | 48h, 36h | about half |
| casual | 26% | 98h | 46h, 33h | about half |
| worker | 0% | | | |
| steer-chrome | 37% | 98h | 47h, 35h | 54% |
| steer-firewall | 59% | 96h | 48h, 37h | |
| steer-daemon | 60% | 96h | 48h, 37h | |
| steer-glitch | 57% | 96h | 48h, 38h | |
| steer-mainframe | 56% | 96h | 48h, 37h | |

About half the lives that make it meet the feat after 96 hours, so the feat, not the age, is now the real test. Even so, the shortest tenth still has 33 to 38 hours as a mainframe, so the age half stays where it is. With the fix in the game, the same command gives attentive 58%, casual 27%, steer-chrome 57%, steer-firewall 59%, steer-daemon 60%, steer-glitch 57%, steer-stub 65% and steer-mainframe 60%, matching the prototype. Casual's shortest tenth has 25 hours as a mainframe; everyone else's about 37.

A flow feat was set aside for the Glitch problem. If it comes back, it needs a way around that first, for example counting flow before adulthood only.

## Everything that assumes three stages

A starting checklist. Before building, grep for `'adult'`, `STAGE_ORDER`, `FORMS[` and `FRAGMENTS` to catch more.

- `sim.js`: `step()` (the new check), `evolve()`, `CFG.runCooldownMin` (add `mainframe`, probably the adult value), `SPECIES`, `lineOf`, `lifeEnd`, `fragmentOf`, `flatline()` (a mainframe dying keeps its form, realized).
- `netrun/run.js`: `ability(pet)` is `pet.stage === 'adult' ? pet.form : null`. It becomes "adult or mainframe, through `lineOf`", plus the mainframe upgrades. `jackOut` raises `s.deepExits` on a Deep exit.
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

0. **The gate test.** Done (tools only). The feat is decided: three Deep exits, or two clean.
1. **The Chrome corp-relay fix.** Done, as its own change to the current game. The gate test re-run with the real rule matches the prototype.
2. **Names and text signed off.** The unlock ids (every stage and form id is decided). Nothing is built before this, because ids are permanent.
3. **Sim and the exit counter.** The stage, the gate (`mainframeFeat` and `mainframeDue` move from `tools/lib/mainframe-gate.mjs` into `sim.js`), `s.deepExits` and its count in `jackOut`, `lifeBonus` and `lifeEnd`, `lineOf`, lineage, sanitizer, the save version step. The balance tool stops keeping its own copy of the counter. Tests: the gate in each order (feat first or age first), three exits, two clean, relay jack-outs not counting, not mid-run, the extra day, legacy lives, sanitizer repairs, and a v-previous save loading unchanged.
4. **Netrun.** `REGIONS.source`, access, mainframe abilities, the codex, `ROOT_FRAGMENTS`. Tests: access locks, map generation for the Source over many seeds (the existing reachability test covers it once it is in `REGION_ORDER`), Root Access on the 22 only, and contracts in the Source.
5. **Measure and tune.** The netrun and life balance runs above. Set the numbers, regenerate the baselines, and report with `balance-diff.mjs`.
6. **UI, art, sound.** Sprites through the audit, the dex, the Archive, the picker, the field manual, cosmetics, music, smoke scenarios.
7. **Docs and release.** Every doc in the checklist, the version bump, and the smoke run.

## Risks

- **Everybody reaches it, or nobody does.** One Deep exit let every runner in; the chosen feat lets in about half of deliberate players and a quarter of casual bots. The bots run more than real players, so real numbers will be lower, casual ones most of all. Re-measure after the Chrome fix, and watch real play before tuning the counts.
- **The Chrome fix is reverted.** The feat leaned against Chrome without it (37% against 57 to 60%). If corp relays ever go, revisit the feat.
- **The upgrades leak into The Deep.** A mainframe is stronger everywhere, not only in the Source. That is fine as a reward, but The Deep should stay a wall for adults. Mainframes are past it by definition.
- **"All fragments" checks.** Any check missed in the `FRAGMENTS` audit would quietly move a goal. The tests should assert that Root Access and Corp gold do not change when fragments are added (`allFragmentsFound` already takes a `fragments` parameter for this).
- **Stale tabs.** Without the save version bump, an older build refuses a mainframe save as damaged. See [Saves and data](#saves-and-data).
- **Sprite scale.** Larger bodies must still leave room for the four wear slots. The audit's `ROOM_MAX` of 4 and the `minRow` rules apply.
