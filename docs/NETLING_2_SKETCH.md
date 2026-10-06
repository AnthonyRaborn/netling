# Netling 2.0 sketch

Status: planning notes for a separate app, not a change to this repository's game. Nothing here is implemented or tested. Items marked Decided come from the maintainer; everything else is a proposal. Companion to [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md), the reference review; its candidate analysis was written for fitting a second egg into 1.0 and is partly superseded by this doc.

## Handoff

**Where it stands.** The overall shape is decided: a separate app, three launch eggs (Program, Iron, Wetware), a layered form model, a naming scheme with 15 adult form names, a story frame, and a codex page model. Much of the mechanical design is not done; see Not designed yet. Drafts of the 15 egg pages are written; the other pages are not.

**Next steps, in the maintainer's order.**
1. Write the codex pages. Drafts of the 15 egg pages (5 per egg, one per adult form) and ten new story pages (which carry NL-0's differentiation for Iron in the Old Web Ruins and Wetware in the Darknet Bazaar) are in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) for review. Still to write: one extra Source page per egg. The approved rewordings of the four 1.0 pages are in this file.
2. Then temper hints: a hint should name a behavior to look for, not a temper value.
3. After that, the maintainer has not set an order. The list under Not designed yet is the backlog.

**Working agreements.** Avoid emojis and em dashes. Say plainly what was not run or verified. Ask clarifying questions before ambiguous or non-trivial steps. Record each decision here as it is made, marked Decided or proposal. Keep in-game Wetware text to plain words (see The eggs). Do not open a pull request unless asked. The soft freeze in `CLAUDE.md` still applies to this repository's game code; only documents change here. Work is on branch `claude/game-egg-differentiation-xkl6x2`.

**Sources** (the three glossaries; local copies are not kept in the repository, so re-download if needed):
- Jargon File 1.0.0.33: https://jargon-file.org/archive/jargon-1.0.0.33.dos.txt
- Jargon File 4.4.7: https://jargon-file.org/archive/jargon-4.4.7.dos.txt (sampled by term, not read in full)
- Cyberpunk 2020 slang glossary: https://www.wyldeside.com/rpgs/cp2020/info-slang.html
- FDA glossary of computer system software development terminology (8/95): https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-guides/glossary-computer-system-software-development-terminology-895 (about 110 of 768 entries read)
- In the original session the web fetch tool was blocked for the first two hosts and the CP2020 host, while `curl` from the shell worked once the environment network settings were widened. This may differ for you.

**1.0 files that matter.** `docs/CONTENT_CATALOG.md` (forms, items, cosmetics, codex text), `docs/SIMULATION.md`, `docs/NETRUN.md`, `docs/SOURCE_PLAN.md` (purge order and ending), `docs/BALANCE.md` (design goals), `src/netrun/codex.js`, `src/ending.js`, `src/ui/onboarding.js` (intro terminal).

**Terminology.** Codex story pages are "pages". Lineage records left by dead netlings stay "fragments". Anything below that says "fragment" for a codex entry predates this and means a page.

## Decided

- 2.0 is a separate app, built from the ground up. Forms, evolution and content can be rearranged.
- Three eggs at launch: Program, Iron, Wetware. After the intro runs `netling.sh`, a prompt asks which egg to start with, then the short tutorial follows. The story intro stays close to 1.0.
- The temper axis stays hidden from the UI but shows through behavior and sprite tells.
- Standing (a visible reputation) replaces the corp and indie axis as an evolution input, and replaces the Chrome and Firewall forms.
- NL-0 stays the original. It differentiates itself to escape the purge order, loosely like the Puppet Master in Ghost in the Shell.
- Wetware death can read as a dream ending and a new one beginning.
- Composed forms (egg body, temper variant, role overlay) are acceptable if the current test and balance tools can still drive them.
- A hidden, unlockable egg is welcome.
- Standing is two tracks (corp and street), not one signed number.
- The ending does not show NL-0's differentiation. It is told only through codex pages.
- The hidden temper shows through sprite motion, idle behavior and chatter tone together, in all three eggs.
- The hidden egg is Rogue (the Puppet Master line) with the merge ending, gated on the ending having played and the egg-specific codex pages (the merge itself uses lineage fragments).
- Each egg's elder stage has its own form.
- New codex pages are allowed. NL-0's differentiation is carried by pages in the Old Web Ruins (Iron) and the Darknet Bazaar (Wetware).
- The Source stays one place (option B with a touch of A): each egg finds one extra page there that the others do not, and the descent is drawn in that egg's own style.
- Root Access needs the general, shared story pages at minimum. Egg-specific pages are for Rogue's unlock only, not for Root Access.
- Codex fragments are called codex pages from here on. There are two kinds. Story pages are shared by every egg, start from the 1.0 codex, and carry Root Access and, by default, all unlocks. Egg pages are specific to one egg, one page per adult form (5 adult forms per egg, one of them hidden), so 15 egg pages in all. Teen pages are discarded. Egg pages count toward Rogue's gate and do not share the story pages' per-life limit. Work order: codex pages first, temper hints after.
- Any member of an egg can find that egg's form pages, whatever its own form.
- Each egg has 5 adult forms: one per mini-game (Breach, Dodge, Tune, Feast) plus one hidden form that masters all four. The role is a descriptor for the DEX and hints, not the form's name.
- The story set needs more pages than 1.0, to cover the two extra eggs and the lore they imply.
- `bazaar-1` is a shared story page, reworded to "Netlings don't sell. They pick you, or they don't."
- `corp-4`, `corp-5`, `bazaar-5` and `bazaar-4` become shared story pages about Standing and Temper (not Program egg pages), reworded to hint at v1.0 as an alpha stage of the current plan. `deep-3` stays a shared story page. All 15 egg pages are therefore new.
- Form names changed after review: Snark to Mouse, Wabbit to Snarf, Phantom to Phreak, Jiffy to Jiff, Slurp to Munch, and the hidden Iron form is Guru, not Wizard. The non-hidden Iron forms and the Program forms stay monosyllabic.
- Lore (decided): the corp's plan is the roadmap, and v1.0 was its alpha. NL-0 is an offshoot of that roadmap and differentiated to escape the planned purge. NL-0 avoids going down into the Source again because doing so might accidentally set off the purge order and get it erased. The four drafted alpha rewordings are approved. The plan is the corp's roadmap, which NL-0 finished.
- The purge order can never run: wrong permissions and an owner of nobody, shown through codex pages, as in 1.0. The 1.0 ending carries over, where the player deletes the order with root access granted by NL-0.
- The intro script drops its version: it is `netling.sh`, not `netling.v1.0.sh`. A versioned file name does not belong on a script that is properly versioned. The version shows only in the compile output and the UI label, as in 1.0.
- Temper tells should be somewhat mysterious but clearly differentiated between bodies. Hints (DEX or similar) are wanted.
- The earlier "easy unlock" idea was about 1.0 and no longer applies to the three launch eggs.
- The generation counter (`vN.0` in the UI and credits) and the lore's `v1.0` alpha stay separate, as in 1.0.
- Root Access and the ten new story pages (option C): only `corp-6` and `corp-7` count toward Root, which then needs 24 pages. The other eight new pages carry a lategame flag and never count toward Root. `deep-6` is kept.
- In-game Wetware text uses plain words rather than CP2020 jargon. The Wetware form names (Razor, Wired, Gibson, Leech, Blank) stay as they are.

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (body) | One hidden axis, orderly to volatile, shown by behavior and sprite tells | Stability axis, Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation that carries across lives | Allegiance axis, Chrome and Firewall |

Standing is two non-negative tracks (corp and street), not one signed number (decided). High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, and both low as unknown to the system (the idea behind the form name Blank), which replaces the Ghost's "neutral allegiance" condition.

Proposal: roles map to the four games. Breach to a Cracker, Dodge to an Evader, Tune to a Seer, Feast to a Scavenger. Names draw on CP2020 icebreaker, Jargon cracker, "mouse around", gibson, and Jargon snarf.

Proposal: traits act on abstract drives (Upkeep, Exposure, Reward, Risk). Each egg maps the drives to its own meters, so lineage and traits are shared across eggs.

Proposal: all three bodies share anchor rows (head, face, body, float) so the 41 wearables work unchanged.

## The eggs

| Egg | Substrate | Failure model | Rhythm | Death register |
|---|---|---|---|---|
| Program | Software processes | Fault, error, failure; viruses | Interrupt-driven: timed events call you | Process ends: flatline, exit code |
| Iron | Firmware and infrastructure; read-only, so it cannot be patched | Drift and bit rot, corrected by calibration | Batch: queue work, collect it on return | Decommission: a last write that leaves a read-only record |
| Wetware | Grown tissue running software (an idea from CP2020's biosoft) | Rejection as it takes on more augmentation | Polling: needs visits at intervals | Waking: a dream ends and the next begins |

All three share three care verbs from the FDA glossary: corrective, adaptive and perfective.

Vocabulary rule (decided): in-game Wetware text uses plain words, not CP2020's own jargon (ripperdoc, eddies, chrome, SIN, BTL, moddy, dorph, derm). Form names are exempt. This document may cite CP2020 terms as sources.

## Story

The lore as written: Project KERNEL built maintenance processes, which began forming preferences. Corp deletion attempts failed. The Source reads "initial commit: maintenance processes, as many as it takes. TODO: give them a way to stop." and holds an unexecuted purge order whose first target is NL-0.

Proposal for the three eggs: one commit, three branches. NL-0 differentiated itself to escape the purge, writing itself where deletion could not reach.

- Iron: NL-0 learned from the Source being read-only and wrote itself somewhere nothing can write over, firmware.
- Wetware: NL-0 grew somewhere the purge does not parse, in grown tissue.
- Program: the original line, which the purge actually targeted.

Alpha framing (decided): the corp's plan is the roadmap, and v1.0 was its alpha, which is the Program egg. Proposal: Iron and Wetware are the later builds of that roadmap, which NL-0 carried out itself when it fled. The drafted page rewordings hint at this without naming the other eggs.

This echoes the Puppet Master: a program made for one purpose that sought variation and an ending instead of being a copy. As I remember the film, the Puppet Master argues that a copy is not life because it lacks diversity and death. That maps onto the game's lineage (inheritance with variation) and onto the Source's "TODO: give them a way to stop." The film details here are from memory, not from a source read for this project. CP2020 also has the terms Rogue (an AI that has escaped its node) and Rogue Hunter, which cover the same ground.

Egg lore should stay implied and arrive only through codex pages, chatter and accessories. The egg prompt should show terse labels with no explanation.

### Why NL-0 will not return to the Source (decided)

The corp's plan is the roadmap, and v1.0 was its alpha. NL-0 is an offshoot of that roadmap. It differentiated to escape the planned purge, and it does not go down into the Source again because being there might accidentally set off the purge order and get it erased. This agrees with the 1.0 text:

- `deep-5`: "there is a floor under this floor. the code we were written from. i went down once, when i was the only one. i will not go again."
- `source-3`: "PURGE sector 7F. first target: NL-0. status: pending. ./purge: permission denied. owner: nobody. pending. pending."

The order sits pending with no owner, and NL-0 is its first target. NL-0's one visit is where it could have found the roadmap and the order. The player's netlings can go where NL-0 cannot, which also gives the Source descent a reason.

### The purge order can never run (decided)

The order never could execute: `./purge: permission denied. owner: nobody.` The 1.0 text already says so in several places: `source-3`, the READ IT readings ("it was never allowed to run"), and the ending's `./purge` line. NL-0's fear is therefore unfounded, and the player's reading of the Source shows it. The tragic irony: NL-0 differentiated, and the eggs exist, because of an order that could not run.

This fits NL-0 not needing to go down. In the 1.0 ending NL-0 grants root access from above ("[sudo] root access: granted by NL-0.") and the player runs `sudo rm purge`; NL-0 then says "so many of us, and not one was ever allowed to stop" and rests. That all carries over to 2.0 unchanged. Suggestion: NL-0 never learns the order was dead until the player shows it.

Two Jargon and FDA entries echo the situation. FDA's "dead code" is code that can never execute. Jargon's Schroedinbug is a bug that "never should have worked", noticed only when someone reads the source. The purge order is dead code that a reader of the Source notices was never going to run.

One difference to settle: the 1.0 design notes read the owner of "nobody" as deliberate ("someone set the order's owner so it could never run"), while an incorrect permission reads as an accident. The text supports both. Recommendation: leave it unsettled, in keeping with the implied-story rule.


### The ending in 2.0

The 1.0 ending carries over: the same for everyone, the player runs `sudo rm purge`, and NL-0 rests. What needs to change:

- **Trigger:** 1.0 requires every codex fragment and one Source exit. In 2.0 it should require the story pages and one Source exit, not egg pages, consistent with Root Access. Otherwise it would depend on the eggs a player has raised.
- **Credits:** the credits print the player's line as a git log, one row per generation, as `vN.0`, the body name and the age. They need form names from all three eggs.
- **Version numbers:** the intro script is now `netling.sh` (decided). In 1.0 the version appears in four places in `ui/onboarding.js`: the directory listing, the command typed, the compile line ("compiling netling.v1.0 ...") and the readme note ("unpacked from netling.v1.0.sh"). All four lose it, and the compile line can print the version itself, for example "compiling netling v1.0 ...". The generation counter in the UI and the credits (`vN.0`) and the lore's "v1.0" in `ruins-3` and `source-1` already coexist in 1.0; the remaining question is whether they should mean the same thing.
- **Not changed:** NL-0 never names a number of processes ("so many of us"), so the ending does not pin down the lore.

### Wetware death as a dream ending

A Wetware generation ends the way a dream does, and the next generation begins as a new dream that carries a trace of the last. This uses the lineage mechanics already planned: inheritance with variation. The idea draws on CP2020's simulated-reality entries (a recording built to burn out after one use and be replaced; a module that carries another personality). In-game text should use plain words: dream, waking, the next culture. CP2020's tone is grittier (addiction, brain damage); a gentler dream framing is a deliberate choice.

### The temper tell

Decided: it shows through all three channels at once, in every egg. Proposal for how each channel works, kept consistent so a player can learn to read it:

- **Sprite motion:** the idle animation changes with temper. An orderly body keeps a steady, even rhythm; a volatile one stutters, drifts or jumps frames. The existing idle quirk (bounce, sway, hover) stays a separate inherited trait, so temper has to read as a different kind of change, such as timing regularity.
- **Idle behavior:** what it does when left alone. Orderly: repeats a routine in the same order. Volatile: does something unscheduled.
- **Chatter tone:** chatter lines gain a temper voice. The existing 52 lines are 32 body-bound, so the rewrite for 2.0 is the natural place to add it.
- **Per egg:** the three channels would be skinned for each substrate, so the tell for Iron differs from Program and Wetware (for example, drift for Iron, a pulse for Wetware).
- Constraint from 1.0: nothing flashes more than three times a second, in any motion setting, so a volatile tell must stay under that limit and have a calmer variant when motion is reduced.
- The tell should come from the temper value, not be a label, and the exact thresholds should be tuned with the balance tools like any other number.

## Adult forms and names

Decided: one adult form per mini-game, plus a hidden form that masters all four. The role (Cracker, Evader, Seer, Scavenger) describes the form in the DEX and hints; it is not the name. 1.0's names are single evocative words (Daemon, Glitch, Ghost), so these are too.

Naming rule: each egg draws its names from its own vocabulary, so the egg is recognizable from the name alone. Names fit their role loosely, because the role is carried by the descriptor. The non-hidden Iron names are monosyllabic (decided).

| Egg | Vocabulary | Breach | Dodge | Tune | Feast | Hidden |
|---|---|---|---|---|---|---|
| Program | Software and network folklore (Jargon, CP2020) | Worm | Mouse | Phreak | Snarf | Ghost |
| Iron | Jargon machine sounds and timings | Gronk | Jiff | Feep | Munch | Guru |
| Wetware | CP2020 street and body slang | Razor | Wired | Gibson | Leech | Blank |

Why each (sources are the Jargon File, the CP2020 glossary and the FDA glossary):

- **Worm:** a program that propagates across network connections (Jargon, FDA). Fits getting through a grid.
- **Mouse:** from CP2020's "mouse around", to explore in a very low-profile manner. An evader.
- **Phreak:** Jargon 4.4.7 defines phreaking as cracking the phone network, and a blue box as a device that reproduced the switching tones used to route calls. Matching tones is Tune. Monosyllabic like the rest of the Program set.
- **Snarf:** Jargon for grabbing a large file, and in the 1960s "to eat piggishly". Feast.
- **Ghost:** kept from 1.0. NL-0's line in `deep-3` ("the ones you call ghost...") can then cover all three hidden forms as what players call them.
- **Gronk:** to cut, sever or smash, and the sound of a diskette drive (Jargon 4.4.7). Smashing through.
- **Jiff:** short for Jargon 1.0's "jiffy", a tiny interval of time. Quick.
- **Feep:** the soft bell of a terminal (Jargon). A signal, so Tune.
- **Munch:** Jargon for transforming information serially, close to crunch but with less pain. Feast.
- **Guru:** Jargon 4.4.7: an expert with wizard skill and a history of being a knowledge resource for others. That last part matches the shared lineage.
- **Razor:** heavily cybered muscle-for-hire (CP2020). Cuts through defenses.
- **Wired:** cyberware, especially increased reflexes (CP2020). Dodge.
- **Gibson:** a psychic, or unexplained phenomena in the Net (CP2020). Tune.
- **Leech:** CP2020 defines it only as a street doctor or med-tech; the Feast link comes from the word, not the glossary.
- **Blank:** a person without a SIN, unknown to the system (CP2020). The hidden form, matching a low Standing on both tracks.

Alternates: Program Breach Trojan or Cowboy; Dodge Snark or Boojum (Snark was dropped as too close to Snarf); Tune Phantom or Dragon; hidden Wheel. Iron Feast Slurp; hidden Wizard or Wheel. Wetware Breach Cowboy; Feast Exotic (graceful but no feeding link); Dodge Ace. Wabbit was dropped (too close to Elmer Fudd).

Not yet named: the elder (mainframe-stage) forms, and the teen forms.

## Codex pages

Two kinds (decided):

- **Story pages:** shared by every egg. Root Access needs these at minimum. Cosmetic and other unlocks default to story pages. They keep the 1.0 per-life cap (8 a life). More are needed than in 1.0, to cover the two extra eggs and the lore they imply.
- **Egg pages:** specific to one egg, one per adult form. Each egg has 5 adult forms, one of them hidden, so 5 egg pages per egg and 15 in all, all new. Any member of the egg can find its form pages. They count toward Rogue's gate. They do not share the story pages' per-life limit; they get their own, to be set with the balance tools. The earlier idea of a page per teen form is discarded.

### The six form-bound 1.0 pages

All six become shared story pages (decided). The first four describe Standing and Temper, which exist in every egg, so they are not tied to a role form.

| Page | 1.0 meaning | Decision |
|---|---|---|
| `corp-4` | Chrome-class: corp-loyal | Shared story page about Standing, reworded to hint at v1.0 as an alpha |
| `corp-5` | Daemon-class: orderly, never stopped the original job | Shared story page about Temper, reworded the same way |
| `bazaar-5` | Firewall: street-minded, distrusts upstream | Shared story page about Standing, reworded the same way |
| `bazaar-4` | Glitch: volatile, "a choice" | Shared story page about Temper, reworded the same way |
| `bazaar-1` | Firewall | Shared, reworded "Netlings don't sell. They pick you, or they don't." |
| `deep-3` | Ghost (NL-0's voice) | Shared, unchanged |

### Rewording the four pages (proposal)

Lore frame: v1.0 was an alpha of a larger plan. This reconciles two things already decided. The corp's plan is the roadmap, and NL-0 differentiating to escape the purge is it finishing that roadmap. The FDA glossary supports the framing: alpha testing happens "in a controlled environment at the developer's site" (the quarantined host sectors of `corp-3`), while beta is "in a live application ... in an environment not controlled by the developer" (the wild). `ruins-3` already treats v1.0 as a version number.

Drafts, keeping the original lines and adding a light hint. For the maintainer to edit:

- `corp-4` (asset register): "Build v1.0 (alpha). Chrome-class: KERNEL descendants loyal to corp credentials. Re-licensed as mascots. Profitable. Class definitions to be revised for later builds."
- `corp-5` (asset register, cont.): "Daemon-class: KERNEL descendants that never stopped doing the original job. Unlicensed, unpaid, still patching our servers at 3 a.m. Recommendation: do not interrupt. Alpha cohort only; later builds not yet observed."
- `bazaar-5` (runner's journal): "Mine turned Firewall the week the corp traced me. Now every probe bounces off. It doesn't trust anything upstream. It took a month to decide it trusted me. Old build, they say. A first draft."
- `bazaar-4` (graffiti in a dead market): "GLITCH IS NOT A BUG. GLITCH IS A CHOICE. v1.0 WAS ONLY THE ALPHA."

The class names (Chrome, Daemon, Firewall, Glitch) remain as the corp's and the runners' own words from the alpha, even though no 2.0 form uses them. That helps the hint: the old classes are out of date. The lore stays implied; none of the lines names the other eggs.

### Page counts

Arithmetic from the 1.0 tables, not a simulation.

- Story set: 24 Root pages (the original 22 plus `corp-6` and `corp-7`) and 13 late pages (eight new ones plus `deep-5` and the four Source pages), 37 in all. At 8 a life, 24 Root pages takes 3 lives, as in 1.0.
- Egg pages: 15, all new (5 per egg).

### What follows

- Unlocks default to story pages, so tint unlocks like "All Corp Grid fragments" count story pages only. The Corp Grid and the Bazaar keep their five pages each.
- Corp deletion failing differently per egg is told in the new story page `corp-7` (deletion log), not in the egg pages and not by editing `corp-3`, which stays shared.
- In-world version numbering: `ruins-3` ("back to v1.0") and `source-1` ("last write: before v1.0") use "v1.0" as lore, which is now the alpha. The intro script is unversioned. The generation counter (`vN.0`) stays separate, as in 1.0.
- The word "fragment" is used in-world for lineage records (`bazaar-2`, `bazaar-3`, `ruins-3`, `deep-2`, `deep-4`), so renaming only the codex side to "pages" keeps the lore consistent.

## Hidden egg

Candidates, with fit:

1. **Rogue (the Puppet Master line).** Unlocked after the ending. Its end of life is a merge: two fragments from different eggs combine into a hybrid next generation with traits from both. This fits the shared-lineage decision and the Puppet Master's wish for variation. Failure model: being hunted by rogue hunters instead of corp traces. Recommended.
2. **Replicator (wabbit).** A playable prequel to the outbreak, tied to `public-1` ("unexplained process growth") and `public-2`. High build cost because it manages a population, not one pet.
3. **Variant.** Same meters, different tree. Lowest cost, lowest contrast, and less of a secret.

Gate (decided): the ending has played, and the egg-specific codex fragments are what count toward it. Until then it should not appear at all, not even as a corrupted slot.

Terminology (decided): codex story pages are "pages"; lineage records left by dead netlings stay "fragments". The Rogue gate uses egg-specific codex pages, while the merge ending uses lineage fragments.

## Impact on 1.0 content

| Area | Impact |
|---|---|
| Mini-game mechanics | Unchanged |
| Mini-game text and modifiers | Re-skin per egg, add a modifier per egg |
| Items (9) | Rename per egg, same effects |
| Wearables (41) and props (8) | Mostly unchanged, if bodies share anchor rows |
| Tints, effects, sounds | Unchanged |
| Shells (15) | 10 unlock by "discover form X" and need rewriting |
| Crests (11) | Full house and Rack mount need new definitions |
| Mini device prop | Condition (own the nine original shells) needs redefining |
| Music (9) | Mostly unchanged; one track or timbre per egg is a possible addition |
| Chatter (52 lines) | 32 rewrite (teen and adult bodies); 20 survive |
| Dex (14 entries) | All rewrite |
| Codex (27 pages) | Five reworded (`corp-4`, `corp-5`, `bazaar-1`, `bazaar-4`, `bazaar-5`), `deep-3` unchanged; 15 new egg pages; one new Source page per egg; new story pages for the extra eggs |
| Field manual | Generated from config |
| Ending | Carries over; trigger and credits adapt (see The ending in 2.0) |

Item names across the eggs (suggestions):

| Item | Program | Iron | Wetware |
|---|---|---|---|
| Coolant cell | Coolant cell | Coolant loop | Cold pack |
| Antivirus patch | Antivirus patch | Shielding | Immune booster |
| Repair kit | Repair kit | Spare parts | Skin patch |
| Black ICE shard | Black ICE shard | Overvolt shard | Dream chip |
| Memory shard | Memory shard | EEPROM swap | Splice |
| Segfault | Segfault | Head crash | Bad batch |
| Corp voucher, Signal booster, Bypass chip | Same | Same | Same |

The Wetware names follow the vocabulary rule. Earlier suggestions that used CP2020 terms directly were replaced: slap patch (derm) became Skin patch, BTL chip became Dream chip (keeping the one-use, risky idea), Moddy became Splice, and Dorph overdose became Bad batch.

## Open questions

1. Names for the elder (mainframe-stage) and teen forms. The 15 adult names had no objections after their last revision.
2. Where do form pages drop: the egg's home region, or any region? Any member of the egg can find them. NL-0's differentiation pages are planned for the Ruins (Iron) and the Bazaar (Wetware).
3. What per-life limit do egg pages get, and should it be tuned with the balance tools?
4. Do elder forms get pages? The rule so far covers adult forms only.
5. Rogue's gate: all 15 egg pages, or a subset such as all of one egg?
6. Is the one extra Source page per egg an egg page (so more than 15) or a story page?
7. Purge order details. Recommended, not confirmed: leave accident or deliberate unsettled, and have NL-0 learn the order was dead only when the player shows it.
8. Wording of the temper hints (after the codex pages).
9. The meaning of the lategame flag (see the drafts file): when late pages drop (recommended: once the line holds Root Access), whether the ending requires them (recommended: yes), whether regional unlocks count them (recommended: no), and whether it replaces 1.0's `mainframe` flag for `deep-5` and the Source pages.

## Not designed yet

The backlog. None of this has been decided or drafted.

- Per-egg meters and care buttons: Iron's drift and calibration, Wetware's rejection, and how corrective, adaptive and perfective care map to actions. The abstract drives (Upkeep, Exposure, Reward, Risk) are a proposal only.
- How temper accrues and the exact tells per egg; how the two Standing tracks move and what they change (markets, checkpoints, traces); the hidden form's conditions (mastering all four games, and perhaps low Standing on both tracks).
- Baby and teen stages and forms per egg; the elder stage rules (1.0's Mainframe gating replaced); Source access rules.
- Netrun abilities per form, regions per egg, events per egg, and the tutorial run per egg.
- The Rogue egg beyond the merge idea and its gate.
- The composed-form sprite spec, and how the test and balance tools drive composed forms. A prototype of both approaches for the Iron egg, with results, is in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md); the choice between them is open.
- Mini-game modifiers per egg.
- Shells, crests and the Mini device prop, which depended on 1.0 forms.
- Save format and storage keys for the new app. Migration from 1.0 saves is not planned.

## Not done

- No code was read for feasibility. All counts come from the docs.
- The Puppet Master details are from memory of the film.
- The dream framing draws on my reading of CP2020's simulated-reality entries (BTL, SimSense, moddy).
