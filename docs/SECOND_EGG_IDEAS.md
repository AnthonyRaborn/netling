# Second egg: vocabulary and idea reference

**Status: reference only.** Written for fitting a second egg into 1.0; planning moved to a from-scratch 2.0 with three eggs (Program, Iron, Wetware) and a hidden Rogue egg, all decided in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md). The candidate analysis, recommendation and open questions of the first version were superseded and are removed (full text: `git show 9114a22:docs/SECOND_EGG_IDEAS.md`). What remains is the source vocabulary the 2.0 names, failure models and care verbs were drawn from, and ideas not yet used. Nothing here is implemented or tested.

**Sources** (local copies are not kept; re-download if needed): Jargon File 1.0.0.33 (read in full) and 4.4.7 (about 90 of 2,300 entries sampled); Cyberpunk 2020 slang glossary (WyldeSide, read in full); FDA "Glossary of Computer System Software Development Terminology" (8/95; about 110 of 768 entries read). No term comes from anywhere else.

**What 1.0 already uses.** Software theme, network security, corp against street; Daemon, Glitch, Chrome, Ghost, Black ICE, Kernel, Shell, Stub, flatline. Heat is already a hardware meter (magic smoke, fry). Gaps the 2.0 eggs fill: everything was software, and there was one failure model.

**What the eggs took from here (decided in the sketch).** Iron: Jargon machine sounds and timings, drift corrected by calibration, batch rhythm. Wetware: CP2020 biosoft and street slang, rejection as failure, polling rhythm. Program: software and network folklore, interrupt rhythm. (Since then the rhythms are wording only and care reskins 1.0's meters; see the care drafts.) Care verbs: the FDA's corrective, adaptive and perfective. Hidden egg: Rogue (CP2020 `rogue`, `rogue hunter`). Not chosen: Replicator (wabbit, worm; a population game, large build) and Variant (same meters, different tree; low contrast). The word "chrome" is spoken for by 1.0's corp form; Wetware avoids it in game text.

## Vocabulary by use

**Material (hardware, software, flesh).** Jargon: `iron`, `big iron`, `silicon`, `dinosaur`, `fossil`, `dusty deck`, `stone age`, `elder days`, `hardwarily`, `softwarily`. CP2020: `wetware` (biochemical augmentation, the brain), `chrome` (cyberware, and flash), `biosoft`, `vatjob`, `exotic`, `bioroid`, `metalhead`, `wired`, `chipped`.

**Failure (bug taxonomy, usable as event types).**

| Term | Meaning | Care-loop idea |
|---|---|---|
| Bohr bug | Repeatable under known conditions | Fix once with the right item |
| Heisenbug | Changes or vanishes when probed | Acting too early or often makes it worse; waiting reveals it |
| Mandelbug | Causes so tangled it looks chaotic | Needs several actions in sequence |
| Schroedinbug | Never worked, noticed late, then breaks for everyone | A latent flaw surfaced by a milestone or a check |
| Bit rot | Unused things decay | Unused features, items or skills degrade after a day |
| Wedged, hung, gronked | Stuck but not dead; needs a reset | A "stuck" state distinct from sleep |
| Fried | Hardware or human burnout | Hard cap on a hardware-style meter |
| Zombie, orphan | Dead process holding a slot; process with no parent | Lineage edge cases |
| CIRS, cyberpsychosis | Rejection from too much chrome | A rising risk meter tied to augmentation |
| Shortwire | Burn out, crash mentally | A wipeout end state with a story |
| 404 | Lost or clueless | A "wandering" state on netruns |

**Reproduction and passing on.** `fork` (Jargon stresses irreconcilable differences between copies), `spawn`, `rabbit job`, `wabbit`, `worm`; `orphan` and `zombie`; `egg` (4.4.7: the payload of an overflow attack, shellcode, which escalates privileges when it hatches; also `Easter egg`); CP2020 `Ram` (personality), `moddy` (personality module chip), `skeleton` (all the electronic records on a person), `DI` (intelligence built from recorded expertise), `Observer`, `Promethean`. These suggest lineage as a recording rather than a trait.

**Time and sleep.** `phase`, `night mode`, `day mode`, `larval stage` (4.4.7: a 6 to 24 month period of monomaniacal concentration, neglecting food and sleep; a good baby stage name and a "neglect is part of how it grows" rule), `yoyo mode` (alternates rapidly between up and down), `jiffy`, `tick` (the discrete time step, as `sim.js` does). The stored `zone` already drives sleep, so a nocturnal egg is a zone offset.

**Archetypes for form names.** Jargon: `hacker`, `wizard` (fixes bugs in an emergency), `guru` (wizard plus a history as a knowledge resource), `Real Programmer`, `jock` (brute force), `wannabee`, `tourist`, `lamer`, `luser`, `samurai` (hacker for hire with a code), `cowboy`, `wheel` (privileged). CP2020: `edgerunner`, `solo`, `fixer`, `netrunner`, `deckjockey`, `cowboy`, `rigger`, `ripperdoc`, `razor`, `samurai`, `ronin`, `blank` (SINless), `ghost` (a deckjockey assisting an entry team), `flea` (a non-netrunner riding along), `Obi-Wan` and `Padawan` (older runner helping a young one), `gibson` (unexplained Net phenomenon, or a psychic), `rogue`, `rogue hunter`, `Mr. Johnson`, `sarariman`, `suit`, `shirt`, `wageslave`, `wirehead`, `brain potato`, `reality junkie`.

## FDA glossary: what it adds

A sober 1995 regulated-industry glossary: little slang, strong on structure. Its voice is the corp pole (audit, certification, change control).

- **Confirms existing content:** Stub ("special code segments that simulate the behavior of designed and specified modules not yet constructed"), region (a logically distinct area, used to separate testing from production), boot and crash, trace and audit trail, watchdog timer, patch, workaround, virus, worm, bomb, overflow, checksum, coroutine (resumes where last suspended, like hibernation).
- **Failure vocabulary with real distinctions:** fault (an incorrect step or definition), error (a discrepancy from the correct value), failure (inability to perform within requirements), exception, anomaly, defect, latent defect. A care loop could treat cause, state and outcome as three things. **Drift** ("unwanted change of an output over time with inputs constant") corrected by **calibration** is a slow decay that routine upkeep fixes (used for Iron).
- **Three kinds of maintenance:** corrective (fix faults; PATCH, PURGE), adaptive (respond to a changed environment, such as the stored `zone`), perfective (improve performance). The glossary has no preventive entry.
- **Life-cycle phases** as growth stages (concept, requirements, design, implementation, test, installation, operation); no retirement phase. Waterfall against spiral could differ between eggs.
- **Qualification gates:** installation, operational ("consistently operating within established limits") and process performance ("effective and reproducible"): three sequential gates, a shape for an unlock.
- **Alpha and beta testing:** alpha is controlled by the developer, beta is a live environment the developer does not control (used in the `corp-4` rewording).
- **Real time, batch, interactive; polling against interrupt; non-maskable interrupt** (cannot be disabled by another interrupt): a clean way to differentiate how eggs call the player back (batch for Iron, polling for Wetware, interrupt for Program). A non-maskable event would ignore the rule that rest suppresses new events.
- **Safety analysis:** hazard, mishap, severity, probability, risk as probability times consequence, fault tree analysis, FMEA: events with a probability and a severity, or a failure-analysis mini-game.
- **Software diversity** (functionally identical variants from one specification), **mutation analysis**, parallel testing; **dead code** (can never execute; used for the purge order) and **spaghetti code**.
- **Limit:** alone it would pull an egg toward a compliance tone, which suits the Corp Grid but not a creature identity.

## Ideas not yet used

The bug taxonomy beyond plain bugs (as event types); bit rot; yoyo mode as an unstable state; larval stage as the baby; polling or non-maskable events as a call-back difference; qualification gates as an unlock shape; cause, state and outcome as three care concerns; a code-of-honor axis (CP2020 `bushi`, `giri`, `ronin`, `samurai`); the Obi-Wan and Padawan mentor pairing; failure analysis as a mini-game.

**Not done.** No code changed or tested. The 4.4.7 Jargon File was sampled by term, so useful entries may be missed. Mappings to care loops are proposals not checked against `sim.js`.
