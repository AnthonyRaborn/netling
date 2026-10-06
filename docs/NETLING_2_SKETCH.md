# Netling 2.0 sketch

Status: planning notes for a separate app, not a change to this repository's game. Nothing here is implemented or tested. Items marked Decided come from the maintainer; everything else is a proposal. Companion to [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md), which holds the reference review.

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
- The ending does not show NL-0's differentiation. It is told only through codex fragments.
- The hidden temper shows through sprite motion, idle behavior and chatter tone together, in all three eggs.
- The hidden egg is Rogue (the Puppet Master line) with the merge ending, gated on the ending having played and fragments from all three eggs in the archive.
- Each egg's elder stage has its own form.
- New codex fragments are allowed. NL-0's differentiation is carried by fragments in the Old Web Ruins (Iron) and the Darknet Bazaar (Wetware).
- The Source stays one place (option B with a touch of A): each egg finds one extra fragment there that the others do not, and the descent is drawn in that egg's own style.
- Root Access needs the general, shared story fragments at minimum. Egg-specific fragments are for Rogue's unlock only, not for Root Access.
- Codex fragments are called codex pages from here on. There are two kinds. Story pages are shared by every egg, start from the 1.0 codex, and carry Root Access and, by default, all unlocks. Egg pages are specific to one egg, one page per adult form (5 adult forms per egg, one of them hidden), so 15 egg pages in all. Teen pages are discarded. Egg pages count toward Rogue's gate and do not share the story pages' per-life limit. Work order: codex pages first, temper hints after.
- Any member of an egg can find that egg's form pages, whatever its own form.
- The story set needs more pages than 1.0, to cover the two extra eggs and the lore they imply.
- `bazaar-1` is a shared story page, reworded to "Netlings don't sell. They pick you, or they don't."
- `corp-4`, `corp-5`, `bazaar-5` and `bazaar-4` become Program egg pages (the Chrome, Daemon, Firewall and Glitch pages, all adult forms). `deep-3` stays a shared story page.
- Temper tells should be somewhat mysterious but clearly differentiated between bodies. Hints (DEX or similar) are wanted.
- The earlier "easy unlock" idea was about 1.0 and no longer applies to the three launch eggs.

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (body) | One hidden axis, orderly to volatile, shown by behavior and sprite tells | Stability axis, Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation that carries across lives | Allegiance axis, Chrome and Firewall |

Standing is two non-negative tracks (corp and street), not one signed number (decided). High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, and both low as unknown to the system, which matches CP2020's "blank" and "SINless" and replaces the Ghost's "neutral allegiance" condition.

Proposal: roles map to the four games. Breach to a Cracker, Dodge to an Evader, Tune to a Seer, Feast to a Scavenger. Names draw on CP2020 icebreaker, Jargon cracker, "mouse around", gibson, and Jargon snarf.

Proposal: traits act on abstract drives (Upkeep, Exposure, Reward, Risk). Each egg maps the drives to its own meters, so lineage and traits are shared across eggs.

Proposal: all three bodies share anchor rows (head, face, body, float) so the 41 wearables work unchanged.

## The eggs

| Egg | Substrate | Failure model | Rhythm | Death register |
|---|---|---|---|---|
| Program | Software processes | Fault, error, failure; viruses | Interrupt-driven: timed events call you | Process ends: flatline, exit code |
| Iron | Firmware and infrastructure; read-only, so it cannot be patched | Drift and bit rot, corrected by calibration | Batch: queue work, collect it on return | Decommission: a last write that leaves a read-only record |
| Wetware | Biosoft: software on grown tissue (CP2020 biosoft) | Rejection as chrome load rises | Polling: needs visits at intervals | Waking: a dream ends and the next begins |

All three share three care verbs from the FDA glossary: corrective, adaptive and perfective.

## Story

The lore as written: Project KERNEL built maintenance processes, which began forming preferences. Corp deletion attempts failed. The Source reads "initial commit: maintenance processes, as many as it takes. TODO: give them a way to stop." and holds an unexecuted purge order whose first target is NL-0.

Proposal for the three eggs: one commit, three branches. NL-0 differentiated itself to escape the purge, writing itself where deletion could not reach.

- Iron: NL-0 learned from the Source being read-only and wrote itself somewhere nothing can write over, firmware.
- Wetware: NL-0 grew somewhere the purge does not parse, biosoft tissue.
- Program: the original line, which the purge actually targeted.

This echoes the Puppet Master: a program made for one purpose that sought variation and an ending instead of being a copy. As I remember the film, the Puppet Master argues that a copy is not life because it lacks diversity and death. That maps onto the game's lineage (inheritance with variation) and onto the Source's "TODO: give them a way to stop." The film details here are from memory, not from a source read for this project. CP2020 also has the terms Rogue (an AI that has escaped its node) and Rogue Hunter, which cover the same ground.

Egg lore should stay implied and arrive only through codex fragments, chatter and accessories. The egg prompt should show terse labels with no explanation.

### Wetware death as a dream ending

This fits CP2020's vocabulary: SimSense, SimStim, and BTL chips that "burn out after one use" and force the user to buy another; "moddy" (a personality module); "Ram" (personality); "deep reality" (the real world, as opposed to the realities made in minds and processors). A wetware generation ending as a burnt-out chip, with the next generation as the next chip carrying a "moddy" of the last, uses the game's own lineage mechanics. CP2020's tone is grittier (addiction, brain damage); a gentler dream framing is a deliberate choice.

### The temper tell

Decided: it shows through all three channels at once, in every egg. Proposal for how each channel works, kept consistent so a player can learn to read it:

- **Sprite motion:** the idle animation changes with temper. An orderly body keeps a steady, even rhythm; a volatile one stutters, drifts or jumps frames. The existing idle quirk (bounce, sway, hover) stays a separate inherited trait, so temper has to read as a different kind of change, such as timing regularity.
- **Idle behavior:** what it does when left alone. Orderly: repeats a routine in the same order. Volatile: does something unscheduled.
- **Chatter tone:** chatter lines gain a temper voice. The existing 52 lines are 32 body-bound, so the rewrite for 2.0 is the natural place to add it.
- **Per egg:** the three channels would be skinned for each substrate, so the tell for Iron differs from Program and Wetware (for example, drift for Iron, a pulse for Wetware).
- Constraint from 1.0: nothing flashes more than three times a second, in any motion setting, so a volatile tell must stay under that limit and have a calmer variant when motion is reduced.
- The tell should come from the temper value, not be a label, and the exact thresholds should be tuned with the balance tools like any other number.

## Codex pages

Two kinds (decided):

- **Story pages:** shared by every egg. Root Access needs these at minimum. Cosmetic and other unlocks default to story pages. They keep the 1.0 per-life cap (8 a life). More are needed than in 1.0, to cover the two extra eggs and the lore they imply.
- **Egg pages:** specific to one egg, one per adult form. Each egg has 5 adult forms, one of them hidden (like Ghost in 1.0), so 5 egg pages per egg and 15 in all. Any member of the egg can find its form pages. They count toward Rogue's gate. They do not share the story pages' per-life limit; they get their own, to be set with the balance tools. The earlier idea of a page per teen form is discarded.

### The six form-bound 1.0 pages

| Page | Form it names | Decision |
|---|---|---|
| `corp-4` | Chrome (adult) | Program egg page |
| `corp-5` | Daemon (adult) | Program egg page |
| `bazaar-5` | Firewall (adult) | Program egg page |
| `bazaar-4` | Glitch (adult) | Program egg page |
| `bazaar-1` | Firewall | Shared story page, reworded "Netlings don't sell. They pick you, or they don't." |
| `deep-3` | Ghost (adult) | Shared story page (NL-0's voice). The hidden Program form still needs its own egg page. |

### Page counts

Arithmetic from the 1.0 tables, not a simulation.

- Program egg: 5 adult pages. Four exist (Chrome, Daemon, Firewall, Glitch); one is new, for the hidden form (Ghost in 1.0 terms).
- Iron and Wetware: 5 new egg pages each. So 11 new egg pages in total.
- Story set: the original 22 Root pages minus `corp-4`, `corp-5`, `bazaar-5` and `bazaar-4` is 18 pages (public 4, corp 3, bazaar 3, ruins 4, deep 4). Beyond Root: `deep-5` and `source-1` to `source-4`, 5 pages, unchanged. At 8 a life, 18 story pages still takes 3 lives, so the "at least 3 lives" goal holds, and new story pages only add to this.
- The Corp Grid and the Bazaar now have 3 story pages each, against 5 each in 1.0. Restoring that parity would be about 2 new story pages each, 4 in all, more if the lore needs it.

### What follows

- Unlocks default to story pages, so tint unlocks like "All Corp Grid fragments" count story pages only.
- Corp deletion failing differently per egg should be told in the Iron and Wetware egg pages, not by editing `corp-3`, which stays shared.
- In-world version numbering: `ruins-3` ("back to v1.0"), `source-1` ("last write: before v1.0") and the intro script `netling.v1.0.sh` use "v1.0" as lore. The 2.0 product name does not have to change that, but the two should not be confused.
- The word "fragment" is used in-world for lineage records (`bazaar-2`, `bazaar-3`, `ruins-3`, `deep-2`, `deep-4`), so renaming only the codex side to "pages" keeps the lore consistent.
- The five adult forms per egg are not designed yet, and the egg pages hang on them. See the first open question.

## Hidden egg

Candidates, with fit:

1. **Rogue (the Puppet Master line).** Unlocked after the ending. Its end of life is a merge: two fragments from different eggs combine into a hybrid next generation with traits from both. This fits the shared-lineage decision and the Puppet Master's wish for variation. Failure model: being hunted by rogue hunters instead of corp traces. Recommended.
2. **Replicator (wabbit).** A playable prequel to the outbreak, tied to `public-1` ("unexplained process growth") and `public-2`. High build cost because it manages a population, not one pet.
3. **Variant.** Same meters, different tree. Lowest cost, lowest contrast, and less of a secret.

Gate (decided): the ending has played, and the egg-specific codex fragments are what count toward it. Until then it should not appear at all, not even as a corrupted slot.

Terminology: "fragment" means two things in 1.0, a codex story fragment and a lineage fragment left by a dead netling. In this doc, the Rogue gate uses egg-specific codex fragments, while the merge ending uses lineage fragments. Consider renaming one of them in 2.0 (for example codex "pages" and lineage "fragments") so the two are not confused.

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
| Codex (27 fragments) | About 6 rewrite (`corp-4`, `corp-5`, `bazaar-1`, `bazaar-4`, `bazaar-5`, `deep-3`); new fragments for Iron and Wetware |
| Field manual | Generated from config |
| Ending | Needs a decision: NL-0 as root of all three, with per-egg death registers |

Item names across the eggs (suggestions):

| Item | Program | Iron | Wetware |
|---|---|---|---|
| Coolant cell | Coolant cell | Coolant loop | Cold pack |
| Antivirus patch | Antivirus patch | Shielding | Immune booster |
| Repair kit | Repair kit | Spare parts | Slap patch (derm) |
| Black ICE shard | Black ICE shard | Overvolt shard | BTL chip |
| Memory shard | Memory shard | EEPROM swap | Moddy |
| Segfault | Segfault | Head crash | Dorph overdose |
| Corp voucher, Signal booster, Bypass chip | Same | Same | Same |

## Open questions

1. **What are the five adult forms per egg?** The page names depend on it. One reading that fits the earlier design: four role forms, one for each mini-game (Cracker for Breach, Evader for Dodge, Seer for Tune, Scavenger for Feast), plus one hidden master that needs all four. Temper would then be a hidden body variation with sprite, idle and chatter tells, and Standing would be separate, not a form. If so, the four Program pages (`corp-4`, `corp-5`, `bazaar-5`, `bazaar-4`), which name the 1.0 forms Chrome, Daemon, Firewall and Glitch, would need rewording to fit roles, or would stay as the corp's own classification of older forms.
2. Where do form pages drop: the egg's home region, or any region? Any member of the egg can find them. NL-0's differentiation pages are still planned for the Ruins (Iron) and the Bazaar (Wetware).
3. What per-life limit do egg pages get, and should it be tuned with the balance tools?
4. Do elder (mainframe-stage) forms get pages? The rule so far covers adult forms only.
5. Rogue's gate: all 15 egg pages, or a subset such as all of one egg?
6. Is the one extra Source page per egg an egg page (so more than 15) or a story page?
7. Text is unwritten for: the new Program hidden-form page, the Iron set, the Wetware set, the Source page per egg, and the new story pages.
8. Temper hints come after the codex pages. A hint should name a behavior to look for, not a temper value.

## Not done

- No code was read for feasibility. All counts come from the docs.
- The Puppet Master details are from memory of the film.
- The CP2020 alignment of the dream framing is my reading of the BTL, SimSense and moddy entries.
