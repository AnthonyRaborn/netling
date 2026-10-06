# Second egg: reference review and ideas

Status: brainstorm, not a decision. Nothing here is implemented or tested. The soft freeze in `CLAUDE.md` is waived for this design work only.

Sources read in full or in part (downloaded and read locally):

- Jargon File 1.0.0.33 (1981 era, MIT/SAIL/CMU/WPI), read in full.
- Jargon File 4.4.7, about 90 selected entries out of roughly 2,300 (creatures, bugs, hardware, archetypes, folklore). Not read in full.
- Cyberpunk 2020 slang glossary (WyldeSide), read in full.
- FDA "Glossary of Computer System Software Development Terminology" (8/95), 768 terms drawn mostly from IEEE and NBS standards. About 110 entries read in full; the rest scanned by term name only.

No terms below come from anywhere else. Where a term is the maintainer's existing name for something, that is noted.

## What the current line already uses

The first egg is a program: "compile a script", care by Charge, Heat, Sync, Integrity, patching and purging. Its two hidden axes are allegiance (corp or indie) and stability (orderly or chaotic). Adult forms are Chrome, Firewall, Daemon, Glitch, Ghost, then Mainframe forms (Plat, Airgap, Init, Panic, Whisper). The theme is network security and the corp-versus-street conflict. Both references already feed this: Daemon, Glitch, Chrome, Ghost, Black ICE, Kernel, Shell, Stub, flatline.

Two gaps stand out, and they are where a second egg can differ most.

1. **Everything is software.** The creature is code, the world is the Net. Both references have a strong opposite pole: hardware and bodies.
2. **One failure model.** Care mistakes, a virus, heat. The sources have many distinct kinds of failure (bugs with different personalities, rot, rejection) that map to different care loops.

## Differentiators the sources suggest

### A. What the creature is made of (hardware, software, flesh)

- Jargon: `iron`, `big iron`, `silicon`, `dinosaur`, `fossil`, `dusty deck`, `stone age`, `elder days`, `hardwarily` and `softwarily`. A heavy, old, slow-aging machine versus the nimble program.
- Cyberpunk 2020: `wetware` (biochemical augmentation, and "the human brain"), `chrome` (cyberware, and also sexy features not needed for function), `biosoft`, `vatjob`, `exotic`, `bioroid`, `metalhead`, `wired`, `chipped`.
- Note the word "chrome" already names the corp adult form. In CP2020 it means flash and cyberware, which fits Chrome as is, but it would be confusing to reuse as a flesh-line term. A wetware egg should avoid it.

### B. How it fails

Jargon has a bug taxonomy that can become event or illness types instead of a single "virus":

| Term | Meaning | Care-loop idea |
|---|---|---|
| Bohr bug | Repeatable, reliable under known conditions | Fix once with the right item, stays fixed |
| Heisenbug | Changes or vanishes when probed | Acting on it too early or too often makes it worse; waiting reveals it |
| Mandelbug | Causes so tangled it looks chaotic | Needs several actions in sequence |
| Schroedinbug | Never worked, only noticed late, then breaks for everyone | A latent flaw surfaced by a milestone or a check |
| Bit rot / software rot | Unused things decay | Features, items or skills unused for a day degrade |
| Wedged / hung / gronked | Stuck but not dead; needs a reset | A "stuck" state distinct from sleep |
| Fried / fry | Hardware or human burnout, smoke | Hard cap on a hardware-style meter |
| Zombie / orphan | Dead process still holding a slot; process with no parent | Lineage edge cases (see C) |
| CIRS, cyberpsychosis, "the curse" | Rejection from too much chrome | A rising risk meter tied to augmentation |
| Shortwire | Burn out, flame out, crash mentally | A wipeout end state with a story |
| 404 | Lost or clueless | A "wandering" state on netruns |

### C. How it reproduces and passes on

The current game: it dies, leaves a fragment, trait levels stack as a streak, quirks inherit. Alternatives from the sources:

- `fork`, `spawn`, `rabbit job`, `wabbit`, `worm`: reproduction by splitting rather than death. Jargon's definition of fork stresses irreconcilable differences between copies.
- `orphan` and `zombie`: a generation whose parent has died but whose slot is still held.
- `egg` (Jargon 4.4.7): "the binary code that is the payload for buffer overflow and format string attacks", also called shellcode; it escalates privileges when it hatches. Also `Easter egg`: a hidden message found by people browsing code. The word the maintainer is already using has two real Jargon senses, so the second egg can be named for either.
- CP2020 `Ram` (personality), `moddy` (personality module chip), `skeleton` (all the electronic records on a person), `DI` (a computer intelligence built from recorded human expertise), `Observer` and `Promethean` (an AI in a body). These suggest lineage as a recording rather than a trait.

### D. Time and sleep

- Jargon `phase` (of people), `night mode`, `day mode`, `change phase the hard way/easy way`, `phase of the moon`, `larval stage`. The sim already ties sleep to a stored `zone`. A nocturnal egg that sleeps in the owner's daytime is nearly free to describe, because the rule is a zone offset.
- `larval stage` (4.4.7): a period of monomaniacal concentration, 6 to 24 months, symptoms include neglecting food and sleep. A good baby stage name and a good "neglect is part of how it grows" rule.
- `yoyo mode`: the system alternates rapidly between up and down. A candidate unstable state.
- `jiffy` and `tick`: Jargon 1.0 defines tick as the discrete time step in simulations, which is what `sim.js` does.

### E. Archetypes for form names

Jargon people-types: `hacker`, `wizard` (knows how a complex system works, can fix bugs in an emergency), `guru` (wizard plus a history of being a knowledge resource), `Real Programmer` (flippant about complexity, bare metal), `jock` (brute-force programs), `wannabee`, `tourist`, `lamer`, `luser/loser`, `winner/real winner`, `samurai` (hacker for hire with a code), `cowboy` (reverent term for a hacker), `wheel` (privileged).

CP2020 people-types: `edgerunner`, `solo`, `fixer`, `netrunner/deckjockey/cowboy`, `rigger`, `ripperdoc`, `razor/samurai`, `ronin`, `blank/SINless`, `ghost` (a deckjockey who assists a physical entry team), `flea` (non-netrunner riding along on a run), `Obi-Wan` and `Padawan` (older runner helping a young one on first runs), `gibson` (unexplained Net phenomenon, or a psychic), `rogue` and `rogue hunter`, `Mr. Johnson`, `sarariman`, `suit`, `shirt`, `wageslave`, `fossil` (also in CP2020), `Fred`, `NetFet`, `wirehead`, `brain potato`, `reality junkie`, `vidiot`.

## Decisions so far

Recorded from the maintainer, not yet designed in detail.

1. **Access:** the second egg is an unlocked choice, and the unlock should be easy, for example raising two different adult forms. The game already tracks which adult forms the player has raised (`newForms` in the evolution tie-break), which may be a starting point. Not checked against the save format yet.
2. **Lineage:** shared across both eggs, while the forms stay separate. Fragments, traits and the codex carry over; each egg has its own forms.

Consequence to design for: the current traits (Licensed, Hardened, Persistent, Volatile, Untraceable) are effects on the first egg's meters (Charge, virus chance, play rewards, corp traces). If lineage is shared, the second egg either reuses those meters or needs trait equivalents that translate between the eggs. A candidate with new meters (Wetware: rejection, Replicator: population) makes this the main design question. Raising it before choosing the egg is worth doing.

## How the current forms fit the references

Judged from form names, mechanics and the docs read. Lore text in `CONTENT_CATALOG.md`, sprites and music were not reviewed.

| Form | Fit | Why |
|---|---|---|
| Daemon, Init | Very strong | Jargon: a daemon "lies dormant waiting for some condition(s) to occur", which matches the slower drain while resting. Jargon also defines an orphan as a process whose parent died and that init(1) inherits, which is close to the lineage mechanic. |
| Glitch, Panic | Strong | Jargon 1.0: glitch is "a sudden interruption in electric service, sanity, or program function. Sometimes recoverable." Matches the gambling play and the volatile trait. |
| Ghost, Whisper | Good, with a catch | CP2020: a ghost is a deckjockey who assists an entry team; "ghost in the machine" means unexplained Net phenomena. The unlock (29 wins across four games) is a mastery requirement, which in the sources is the wizard or guru archetype, not the ghost. |
| Firewall, Airgap | Partial | In both sources ICE and firewalls are the corp's tools and the indie tool is the icebreaker, so Firewall as the indie form is slightly inverted. Airgap fits the isolation theme. |
| Chrome, Plat | Partial | CP2020: chrome is flash and cyberware, and chromers are street gangs. Corp types are suit, shirt, sarariman, keiretsu and badge. The corp-loving behavior only loosely fits. A flesh-and-cyberware egg would want the word "chrome". |
| Bitling, Kernel, Stub, Shell | Neutral | Not contradicted. Shell also echoes shellcode, which Jargon calls an egg. |

Mechanics and world that fit: PURGE and cache files (Jargon prowler and reaper, cruft, CP2020 gomi), the memory overflow event (Jargon's egg is a buffer-overflow payload), virus and trace events, corpo scrip (CP2020 valuta), Root Access (Jargon wheel, a privilege bit), Packet Feast (Jargon chomp is explicitly Pac-Man), Darknet Bazaar (fixers, ponies, paydata), Old Web Ruins (fossil, dusty deck, Stone Age), and The Source (Jargon's guru entry cross-references "source of all good bits"; only the cross-reference was seen, not that entry).

Unused in the game: the bug taxonomy, bit rot, night-mode sleep beyond the stored `zone`, a code-of-honor axis (CP2020 bushi, giri, ronin, samurai), and people archetypes (fixer, rigger, ripperdoc, wizard, guru, Real Programmer, the Obi-Wan and Padawan mentor pairing).

Implications for the egg choice:

- **Iron overlaps the Mainframe stage.** Jargon treats mainframe, big iron and dinosaur as one family, and the Mainframe stage already sits in that pole. An Iron egg would partly duplicate it unless it is deliberately a whole life lived as a mainframe.
- **Heat is already a hardware meter.** Heat, Coolant cell and "Heat 85+" are the magic-smoke and fry idea, so the first egg is not purely software.
- **Chrome is spoken for.** A Wetware egg needs a different word for its augmented lines.

## FDA glossary review

A different kind of source. It is a sober 1995 regulated-industry glossary (IEEE, NBS, DOD and FDA definitions), so it supplies little slang or creature naming. It is strong on structure: life cycles, kinds of failure, kinds of maintenance, qualification gates and safety design. Its voice is the corp pole of the game (audit, certification, change control, quality assurance) more than a new egg identity.

### Where it confirms existing content

- **Stub** (the 3+ mistakes teen): "special code segments that ... simulate the behavior of designed and specified modules not yet constructed." A placeholder standing in for something not built yet fits that teen very well.
- **Region** (a Netling term): "a clearly described area within the computer's storage that is logically and/or physically distinct ... used to separate testing from production." Syn: partition.
- **Boot**: "to cause a computer system to reach a known beginning state", which matches the 20 minute reboot after a crash. **Crash**: "the sudden and complete failure of a computer system or component", the same as the game's use.
- **Trace** and **audit trail**: a record of execution; a chronological record sufficient to reconstruct the events leading to a result. Fits the corp trace event and could name lineage records.
- **Watchdog timer**, **fail-safe**, **patch** ("a change made directly to an object program without reassembling or recompiling"), **workaround**, **virus** and **worm**, **bomb** (logic, time and letter bomb), **overflow**, **buffer**, **checksum**, **CRC** and **parity**: all consistent with the current events and items.
- **Coroutine**: "begins execution at the point at which operation was last suspended" and need not return to its caller. That is close to hibernation resuming exactly as it was.
- Weak or absent: Kernel, Shell, Firewall, Daemon (nearest is "utility program" and "service program"), and Mainframe (defined only as "a large computer").

### What it adds

**Failure vocabulary with real distinctions.** The glossary separates fault (an incorrect step or data definition), error (a discrepancy between a computed and the correct value), failure (inability to perform within requirements), exception (an event that suspends normal execution), anomaly (deviation from expectation), defect and latent defect. A care loop could use cause, state and outcome as three different things the player handles, rather than one "virus". It also defines **drift**: "the unwanted change of the value of an output signal ... over a period of time when the values of all input signals are kept constant", and **calibration** as the fix. Drift is a slow, no-input decay that differs from Jargon's bit rot because routine upkeep corrects it.

**Three kinds of maintenance.** Corrective (fix faults), adaptive (make it usable in a changed environment), perfective (improve performance or maintainability). The glossary has no preventive entry. Current care maps mostly to corrective (PATCH, PURGE). Adaptive could be a response to travel or a changed schedule (the stored `zone`), and perfective could be tuning. The three could be separate actions or separate egg specialties.

**Life-cycle phases as growth stages.** Concept, requirements, design, implementation, test, installation and checkout, operation and maintenance. The glossary has no retirement phase; it ends the life cycle when "the product is no longer available for use". The waterfall and spiral models contrast a one-pass life with an iterative one, which could differ between eggs.

**Qualification gates.** Installation qualification, operational qualification ("capable of consistently operating within established limits and tolerances") and process performance qualification ("effective and reproducible"). Three sequential gates are a ready-made shape for the easy unlock the maintainer wants, for example: raise one adult, raise a second form, then a reproducibility check.

**Alpha and beta testing.** Alpha is controlled and observed by the developer; beta is a live environment the developer does not control. Could describe region risk tiers or an egg that grows in a sandbox versus the wild.

**Real time, batch and interactive.** Batch collects inputs and processes them all at once; real time responds as an external process occurs. A batch-style creature and a real-time creature would differ in pacing. **Polling versus interrupt**: polling checks each device in turn; an interrupt notifies the CPU; a **non-maskable interrupt** cannot be disabled by another interrupt. The first egg's rest suppresses new events; a non-maskable event would ignore that rule. This is a clean way to differentiate how the two eggs call the player back.

**Safety analysis.** Hazard (a prerequisite to a mishap), mishap (an unplanned loss event), severity, hazard probability, and risk as probability times consequence. Fault tree analysis and FMEA. Useful for designing events with a probability and a severity, and a possible name and shape for a failure-analysis mini-game.

**Software diversity** and **mutation analysis.** Diversity: "two or more functionally identical variants of a program ... developed from the same specification by different programmers" to improve reliability. Mutation analysis tests against "slight variants (mutants)" of a program. Parallel testing runs a new system on the same data as the standard system for comparison. See Candidate 5 below.

**Dead code** and **spaghetti code**: code that can never execute, and code with no coherent structure. Candidates for vestigial features or a hoarding or rot line.

### Honest limits of this source

- It is not thematic on its own. Used alone it would pull the second egg toward a compliance and bureaucracy tone, which suits the Corp Grid and the Chrome line but not a creature identity.
- It supports the Iron and Wetware candidates only indirectly (hardware, firmware and sensors appear as plain definitions).
- Whether the game already has a checksum on its transfer code was not checked, so the CRC and parity link is only a naming match.

## Candidate second eggs

Each candidate gets its own hidden axes and its own failure model, so it is not a recolor. Adult names are suggestions only. I checked that none of the words below already appear in `src/` or `docs/`.

### Candidate 1: Wetware (a grown creature, body versus chip)

- Egg: a vat-grown or organic seed. The first egg is "compiled"; this one is "grown" or "cultured".
- Stages: Larva (Jargon `larval stage`), then Padawan (CP2020), then adult.
- Axes: **Chrome load** (organic to augmented, shaped by buying and installing items at a black clinic or ripperdoc) and **Edge** (cautious to reckless, shaped by risk-taking on runs and mini-games). Avoid reusing allegiance.
- Failure model: **rejection**. Rising CIRS risk with augmentation; tuning a "dorph" (synthetic painkiller, addictive) or "derm" (skin patch) item trades short-term relief for long-term dependence.
- Care loop: feed, rest, medicate, install; not patch or purge.
- Adult lines: Wired (reflexes), Vatjob (heavily replaced), Exotic (biosculpted), Blank (SINless, untraceable, a counterpart to Ghost), Gibson (neutral, unexplained, the rare form).
- Items: dorph, derm or slap patch, BTL chip (burns out after one use, addictive, risky), moddy, daddy and apter chips (skills), Nutrisoy and Soykaf (food).
- Cross-egg hook: a Wetware netling can ride as a `flea` on a program netling's run, or an elder line can mentor (`Obi-Wan`).

### Candidate 2: Iron (old hardware, slow and heavy)

- Egg: a core or a cabinet rather than a script.
- Stages: Stone Age, Iron Age, then adult is not a growth but an "uptime" counter. Jargon uses Stone Age, Bronze Age, Iron Age as real eras.
- Axes: **Age** (elder-days orthodoxy versus neophilia, both Jargon terms) and **Load** (brute force versus tense and efficient; `jock` versus `tense`, `bum`).
- Failure model: **bit rot and head crash**. Unused features decay; heat is replaced by magic smoke (`magic smoke`, `smoke test`, `fry`).
- Care loop: keep it powered, keep it exercised, give it a smoke test after repairs; sleeping is `down`.
- Adult lines: Big Iron, Dinosaur, Fossil, Real Programmer, Wizard, Guru.
- Time model: a much longer or much shorter life than 5 days, and a "dusty deck" mechanic where old lineage records must stay compatible.
- Tone: elegiac, the first egg's opposite pole (nimble, networked, corp or indie).

### Candidate 3: Replicator (wabbit, worm, rabbit job)

- Egg: a payload (Jargon `egg`, shellcode). It exists to be delivered and hatches inside something else.
- Stages: Egg, Spawn, Fork.
- Axes: **Spread** (stays single to many copies) and **Stealth** (quiet to loud).
- Failure model: **runaway**. Replicating too fast crashes the host, like `fork bomb` and `rabbit job`.
- Care loop: manage population rather than a single pet. This is the biggest departure from the Tamagotchi core and the largest build.
- Adult lines: Wabbit, Worm, Rabbit, Logic Bomb, Back Door, Zombie.

### Candidate 4: Rogue (an AI that has escaped)

- Egg: a recording rather than a script. CP2020 `DI`, `AI`, `Observer`, `Promethean`, `Rogue`, `Rogue Hunter`.
- Stages: DI (limited, built from recorded expertise), AI (self-aware), Rogue (escaped).
- Axes: **Autonomy** (leashed to free, compare CP2020 `leash` and `cortex bomb`) and **Humanity** (mimics people or stays alien).
- Failure model: **being hunted**. Rogue hunters replace corp traces.
- Pairs naturally with the existing ending and the Source.

### Candidate 5: Variant (same spec, different implementation)

Added after the FDA glossary review and the maintainer's decisions.

- Idea: the second egg runs on the same meters and care loop as the first (Charge, Heat, Sync, Integrity), with different hidden axes, a different adult tree and a different tone. Named for software diversity: functionally identical variants built from one specification.
- Why it fits the decisions: with lineage shared and forms separate, traits like Persistent or Hardened apply to the second egg unchanged, because the meters are the same. This removes the main design cost of the other candidates (trait translation). An easy unlock also matches, since a variant can be offered once two different adults have been raised.
- Cost: less contrast. The egg differs in tree and axes, but the player does the same chores. The first egg's gaps (software only, one failure model) stay open unless this egg adds a new failure model (for example drift and calibration, or the fault, error and failure split).
- Possible axes: **Honor** (code of honor, from CP2020 bushi, giri, samurai versus ronin) and **Tempo** (batch versus real time).
- Possible adult lines: Samurai, Ronin, Wizard, Guru, Real Programmer, Fixer, Rigger.
- Could be combined with another candidate later: the Variant egg first, then a second tier with new meters.

## Recommendation

Candidate 1 (Wetware) gives the clearest contrast with the least risk to the core loop: same Tamagotchi care structure, new meters and items, a new world pole (flesh and chrome), and CP2020 supplies most of the vocabulary. Candidate 2 (Iron) is the best contrast in pacing and tone, and Jargon 1.0 and 4.4.7 supply its vocabulary. Candidate 3 is the most original but changes the genre of the game. I would start with Wetware or Iron and use the bug taxonomy (section B) in whichever egg is chosen, since it is cheap to add as event types.

With the shared-lineage decision, Candidate 5 (Variant) is the lowest-risk path and Candidate 1 (Wetware) the highest-contrast path that still keeps the care structure. The choice depends on how much the second egg should feel like a different game. If the first egg should also gain differentiation from these sources without new forms, section B (bug types as events) and section D (a night-mode sleep phase) can apply to the existing line.

## Open questions for the maintainer

Answered: access (unlocked choice, easy unlock) and lineage (shared, forms separate); see Decisions so far.

1. Should the two eggs interact (flea, mentor, shared netruns), or only share lineage?
2. Which pole fits the intended tone: flesh, old iron, replicator or rogue AI? (See the fit notes: Iron overlaps the Mainframe stage.)
3. Shared lineage and traits: reuse the first egg's meters in the second egg, or translate traits between the two?
4. Exactly what counts as the easy unlock (two different adult forms, or something else)?
5. Expected scope: new meters and items only, or new netrun regions and mini-games per egg?
6. Should the second egg reuse the first egg's meters (Candidate 5) or bring new ones (Wetware, Replicator)?
7. More references are coming. Which themes should I weight when they arrive?

## Not done

- No code changed, no tests run, no balance simulations.
- The 4.4.7 Jargon File was sampled by term, not read end to end, so some useful entries may have been missed.
- Section B and C mappings to care loops are proposals; none were checked against `sim.js` for feasibility.
