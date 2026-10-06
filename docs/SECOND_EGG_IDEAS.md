# Second egg: reference review and ideas

Status: brainstorm, not a decision. Nothing here is implemented or tested. The soft freeze in `CLAUDE.md` is waived for this design work only.

Sources read in full or in part (downloaded and read locally):

- Jargon File 1.0.0.33 (1981 era, MIT/SAIL/CMU/WPI), read in full.
- Jargon File 4.4.7, about 90 selected entries out of roughly 2,300 (creatures, bugs, hardware, archetypes, folklore). Not read in full.
- Cyberpunk 2020 slang glossary (WyldeSide), read in full.

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

## Recommendation

Candidate 1 (Wetware) gives the clearest contrast with the least risk to the core loop: same Tamagotchi care structure, new meters and items, a new world pole (flesh and chrome), and CP2020 supplies most of the vocabulary. Candidate 2 (Iron) is the best contrast in pacing and tone, and Jargon 1.0 and 4.4.7 supply its vocabulary. Candidate 3 is the most original but changes the genre of the game. I would start with Wetware or Iron and use the bug taxonomy (section B) in whichever egg is chosen, since it is cheap to add as event types.

If the first egg should also gain differentiation from these sources without new forms, section B (bug types as events) and section D (a night-mode sleep phase) can apply to the existing line.

## Open questions for the maintainer

1. Should the second egg be a separate game track (own dex, codex, lineage) or share the current lineage and Source?
2. Is it a choice at the start of a new life, or an unlock (Root Access, the Source)?
3. Should the two eggs be able to interact (flea, mentor, shared netruns), or stay separate?
4. Which of the four poles above (flesh, old iron, replicator, rogue AI) fits the intended tone?
5. Expected scope: new meters and items only, or new netrun regions and mini-games per egg?
6. More references are coming. Which themes should I weight when they arrive?

## Not done

- No code changed, no tests run, no balance simulations.
- The 4.4.7 Jargon File was sampled by term, not read end to end, so some useful entries may have been missed.
- Section B and C mappings to care loops are proposals; none were checked against `sim.js` for feasibility.
