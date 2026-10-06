# Netling 2.0 sketch

Status: planning notes for a separate app, not a change to this repository's game. Nothing here is implemented or tested. Items marked Decided come from the maintainer; everything else is a proposal. Companions: [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (all page text) and [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) (the reference review; its candidate analysis was written for fitting a second egg into 1.0 and is partly superseded by this doc).

## Handoff

**Where it stands.** The overall shape is decided: a separate app, three launch eggs (Program, Iron, Wetware), a layered form model, a naming scheme with 15 adult form names, a story frame, and a codex page model. All codex page text is drafted (egg form pages, new story pages, Source pages). Temper hints and most of the mechanical design are not; see Not designed yet.

**Next steps, in the maintainer's order.**
1. Review and edit the page drafts in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md): 15 egg form pages, twelve new story pages and three Source pages. The four approved rewordings of 1.0 pages are in this file, under Rewording the four pages.
2. Temper hints are drafted in the drafts file (a hint names a behavior to look for, not a temper value). The Evolution section still has open numbers: the size of a Standing point, the wins that make a role, and the bug and ceiling values.
3. After that, the maintainer has not set an order. The list under Not designed yet is the backlog.

**Document map.** This file holds the decisions, the architecture and the open questions. [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) holds all page text. [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) is the reference review that started this, partly superseded.

**Working agreements.** Avoid emojis and em dashes. Say plainly what was not run or verified. Ask clarifying questions before ambiguous or non-trivial steps. Record each decision here as it is made, marked Decided or proposal. Keep in-game Wetware text to plain words (see The eggs). Do not open a pull request unless asked. The soft freeze in `CLAUDE.md` still applies to this repository's game code; only documents change here. Work is on branch `claude/game-egg-differentiation-xkl6x2`.

**Sources** (the four references; local copies are not kept in the repository, so re-download if needed):
- Jargon File 1.0.0.33: https://jargon-file.org/archive/jargon-1.0.0.33.dos.txt
- Jargon File 4.4.7: https://jargon-file.org/archive/jargon-4.4.7.dos.txt (sampled by term, not read in full)
- Cyberpunk 2020 slang glossary: https://www.wyldeside.com/rpgs/cp2020/info-slang.html
- FDA glossary of computer system software development terminology (8/95): https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-guides/glossary-computer-system-software-development-terminology-895 (about 110 of 768 entries read)
- In the original session the web fetch tool was blocked for the first two hosts and the CP2020 host, while `curl` from the shell worked once the environment network settings were widened. This may differ for you.

**1.0 files that matter.** `docs/CONTENT_CATALOG.md` (forms, items, cosmetics, codex text), `docs/SIMULATION.md`, `docs/NETRUN.md`, `docs/SOURCE_PLAN.md` (purge order and ending), `docs/BALANCE.md` (design goals), `src/netrun/codex.js`, `src/ending.js`, `src/ui/onboarding.js` (intro terminal).

**Key terms.**
- **Egg:** the substrate a netling is raised on: Program (software, the original line), Iron (firmware and infrastructure) or Wetware (grown tissue running software).
- **Temper:** a hidden orderly-to-volatile axis, shown by sprite motion, idle behavior and chatter tone.
- **Standing:** two visible reputation tracks, corp and street, that belong to one netling and reset each life.
- **Role:** which mini-game a form is built around (Breach, Dodge, Tune, Feast). Each egg has four role forms and one hidden form that masters all four.
- **NL-0:** the first netling, an offshoot of the corp's roadmap that differentiated to escape a planned purge. It speaks in codex pages and grants root access from above.
- **Root Access:** earned by finding the Root story pages (24 of them). It unlocks the late game.
- **Story page, egg page, late page:** story pages are shared by every egg; egg pages belong to one egg; late pages never count toward Root Access and drop only once the line holds it.
- **The Source:** the read-only code the netlings were written from, holding the unexecuted purge order.

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
- Codex fragments are called codex pages from here on. There are two kinds. Story pages are shared by every egg, start from the 1.0 codex, and carry Root Access and, by default, all unlocks. Egg pages are specific to one egg, one page per adult form (5 adult forms per egg, one of them hidden), so 15 egg form pages in all, plus 3 Source pages, which are egg pages (decided). Teen pages are discarded, and elder forms get no pages (decided). Egg pages count toward Rogue's gate. They are rare drops with no per-life limit (decided), so they do not share the story pages' cap. Work order: codex pages first, temper hints after.
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
- Evolution direction (see Evolution): Standing and the mini-game roles are the levers; faults feed temper; temper is personality and does not choose forms; teens depend on Standing only, except the hidden path, which also needs the games played.
- The generation counter (`vN.0` in the UI and credits) and the lore's `v1.0` alpha stay separate, as in 1.0.
- Root Access and the twelve new story pages: only `public-4` (classified ad) and `corp-2` (release schedule) count toward Root, which then needs 24 pages. The other ten carry the `late` flag and never count toward Root. `late` pages drop only once the line holds Root, are required by the ending, are ignored by regional unlocks, and replace 1.0's `mainframe` flag. Ids match drop position, so some 1.0 ids move (mapping in the drafts file). Ids in this sketch's older text are 1.0 ids unless noted.
- In-game Wetware text uses plain words rather than CP2020 jargon. The Wetware form names (Razor, Wired, Gibson, Leech, Blank) stay as they are.

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (body) | One hidden axis, orderly to volatile, fed by faults and handling, shown by behavior and sprite tells. It shapes personality, not the form (decided; see Evolution) | Stability axis and its pull on Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation of one netling; it starts at zero each life and does not carry over (decided) | Allegiance axis, Chrome and Firewall |

Standing is two non-negative tracks (corp and street), not one signed number (decided). High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, and both low as unknown to the system (the idea behind the form name Blank), which replaces the Ghost's "neutral allegiance" condition.

Proposal: roles map to the four games. Breach to a Cracker, Dodge to an Evader, Tune to a Seer, Feast to a Scavenger. Names draw on CP2020 icebreaker, Jargon cracker, "mouse around", gibson, and Jargon snarf.

Proposal: traits act on abstract drives (Upkeep, Exposure, Reward, Risk). Each egg maps the drives to its own meters, so lineage and traits are shared across eggs.

Proposal: all three bodies share anchor rows (head, face, body, float) so the 41 wearables work unchanged.

## Evolution

Sketch from the maintainer's direction on 2026-10-06, prompted by [issue 28](https://github.com/AnthonyRaborn/netling/issues/28) on 1.0 (a player who met the games requirement and kept allegiance neutral still guessed wrong on the hidden stability axis). Items marked decided come from the maintainer; the rest is a proposal.

### Decided

- Allegiance becomes Standing. Stability becomes Temper.
- Forms tie to the mini-games, at least in style, through the four roles.
- Evolution should be fairly predictable to an observant player. 1.0's problem was continuous hidden axes that nothing shows. Other virtual pets route on a few countable levers: Digimon uses one lever on some devices (effort or training) and more on others (level, condition); 1.0's issue also cites care mistakes and discipline mistakes for Tamagotchi. I did not check any device beyond what the issue says.
- Standing is at least one of the levers.
- Faults (care mistakes) feed Temper. Temper is mostly personality: how the netling interacts, talks and idles, and possibly its care preferences. It does not choose a form.
- Teens depend on Standing only, except the hidden path, which also needs the games played, as 1.0's Shell does (3 wins in each of the four games).
- Adult forms use option C: two named forms per role, one codex page per role (decided, first try). Option B is the fallback. If B is used, each form needs a terminal indicator of its Standing variant, because the variant would no longer be a different named form.
- Standing does not carry across lives (decided). It is the netling's own standing, and the world treats the next netling as a new entity, rightly or wrongly. What carries over is the lineage (trait, quirk, keepsake), Root Access, the codex and the dex, as in 1.0.
- Neglect must have a visible effect (decided). Part of the 2.0 redesign is to revisit the netling sprites (see below).
- Faults are hidden (not logged) and have no cap (decided). They only feed temper. The 1.0 rule that 10 faults end a life is removed.

### Does Standing as a lever force more forms?

Yes, if Standing is supposed to change the adult form. For one role (say Breach), Standing has to produce at least two different outcomes, or it is not a lever at that stage. With two Standing leans (corp ahead of street, or street ahead of corp) and four roles, that is 8 role forms per egg plus the hidden form, 9 in all. Three ways to pay for it:

| Option | Adult forms | Egg form pages | Cost |
|---|---|---|---|
| A. Two named forms per role | 27 (9 per egg; 12 new names) | 27 form pages + 3 Source = 30 | Most Digimon-like and most readable, but 12 more names and 12 more pages, which pushes against the wish to keep the codex from growing |
| B. One named form per role, Standing as a visible variant | 15 (as now) | 15 + 3 = 18 | Cheapest. The sketch already allows composed forms, so the lean is a look and a small perk, not a new form |
| C. Two named forms per role, one page per role | 27 | 15 + 3 = 18 (a page covers both forms of a role) | Keeps page count, but a page then cannot be one form's own document |

Decided: try C first, with B as the fallback (B needs a visible Standing indicator on each form). A is not chosen, since it would raise the Rogue gate from 18 to 30 pages. Under C the egg pages stay at 18: 5 per egg (four role pages, each covering both forms of that role, and one hidden form page) and 3 Source pages. Consequence for the drafts: the 12 role form pages were reworded so one page fits both forms, and renamed by role (done; see the drafts file). Option C also needed 12 new form names (see Second form names).

### Levers by stage (proposal)

| Stage | Lever | Notes |
|---|---|---|
| Baby to teen | Standing only: which track leads (corp or street) | Three teen types per egg: corp-leaning, street-leaning, and the hidden path. The hidden-path teen also needs wins in each of the four games (the number is a balance question) and low Standing on both tracks. Faults are not required (not decided) |
| Teen to adult | Role (the game with the most wins this life) and Standing lean at that time | The teen is a preview of the Standing lean, as a checkpoint the player can read. The lean is recomputed at adulthood, so it can still change |
| Hidden adult | All four games mastered, low Standing on both tracks | Needs a threshold for mastery, as 1.0's Ghost does (4 wins each and 29 in all) |
| Neglect | A visible sprite effect (decided), form effect not decided | Faults no longer pick a teen form (1.0's Stub). Neglect shows on the netling instead (see Neglect and the sprites). Whether sustained neglect also marks the form is open |

What the player can see (proposal, resolves issue 28 for 2.0 without an item):

- **Standing:** visible, two tracks.
- **Wins per game:** a visible tally per life, like effort or training counts.
- **Faults:** hidden and uncapped (decided). They are no longer shown in the HUD, the life screen or the log, and nothing counts them toward a death.
- **Temper:** hidden, shown only by tells. Because it does not choose a form, guessing it wrong costs nothing, which is the point.
- An item like issue 28's "sysmonitor" is no longer needed for form routing. It could still exist as flavor that reads temper.

### Neglect and the sprites (decided in principle)

Neglect must be visible, and faults no longer are. So the netling itself shows it. Part of the 2.0 redesign is to revisit the netling sprites; this is the only place the sketch has noted that, besides the composed-form sprite spec in the backlog and the shared anchor rows for the wearables (see Architecture). Nothing here is designed. Questions for that pass:

- **A neglected look per body.** A reversible state tied to needs left unmet, readable at a glance (dimmed, worn, glitching, or a posture), with a calmer version when motion is reduced and nothing that flashes more than three times a second.
- **Separate from temper.** Temper shows through motion rhythm and idle behavior. Neglect needs a different channel (pose, color, wear) so the two are not confused.
- **Whether it lasts.** The look can clear when needs are met, or leave a mark that persists to the next stage. A persistent mark would be the Stub-like consequence of 1.0. Not decided.
- **Per egg.** Each body (software, firmware, grown tissue) would show it in its own way.

### Starting numbers (proposal, not measured)

Anchors are from the committed 1.0 baseline (`tools/baseline/lives.json`, 1000 simulated lives per archetype) and `src/sim.js` and `src/netrun/run.js`. They are starting points for the balance tools, not results. None of the 2.0 mechanics exist yet, so nothing below was simulated in 2.0.

**What the 1.0 data says**

| Anchor | Casual | Attentive | Steered (Chrome or Firewall) |
|---|---|---|---|
| Absolute allegiance at the teen check | 2.6 | not recorded here | not recorded here |
| Absolute allegiance at adulthood | 4.3 | 5.1 | 42 to 53 |
| Wins (all four games) by adulthood / by end of life | 15.9 / 33.8 | 22.9 / 51.7 | about 22 to 24 / 48 to 49 |
| Netruns per life | 17.9 | 24.3 | about 24 |
| Faults per life | 4.6 | 0.16 | 0.1 to 0.2 |

**Standing sources and size (decided as a starting point)**

- A corp or scavenged packet adds 0.1 to its track. COMPLY or HIDE adds 0.5. A market purchase adds 0.5. Plain care and mini-games add nothing, so a player can stay at zero on both tracks (my suggestion, accepted as part of "a good start").
- The sources the maintainer did not name are open: a Corp voucher, a Black ICE shard, an ignored trace, checkpoint choices, and anomaly choices. My test below gave the ones that were 1 in 1.0 a value of 0.5.
- Standing now has fractions, so the gap thresholds (a tie within 1, certain at 5) are in these units unless Standing is rounded for display and decisions. Which is meant is open.

What those sizes do (measured, with limits). I ran 1.0's balance tool on a scratch copy with feeds at 0.1, the 1.0 one-point decisions halved to 0.5, and the netrun one-point leans halved. 150 simulated lives per archetype. The gap is approximated by the absolute value of 1.0's single signed allegiance, which is the closest 1.0 equivalent of the corp-minus-street gap; 2.0's two tracks were not simulated.

| Archetype | Gap at teen, 1.0 values | Gap at teen, feed 0.1 | Gap at adult, 1.0 values | Gap at adult, feed 0.1 | Gap at adult, feed 0.25 |
|---|---|---|---|---|---|
| Casual | 2.6 | 0.65 | 4.3 | 1.4 | 1.8 |
| Attentive | 3.1 | 0.79 | 5.1 | 1.6 | not run |
| Steered Chrome (feeds and chooses corp) | 16.1 | 3.2 | 42 | 9.0 | 15.9 |
| Steered Firewall | 18.9 | 3.4 | 52.6 | 11.5 | not run |
| Corp-only feeding, no netruns | 11.2 | 1.8 | 27.6 | 4.3 | 9.5 |
| Street-only feeding, no netruns | 12.8 | 2.0 | 33.0 | 5.4 | 11.5 |

What it means with the tie rule (a gap of 5 or more is certain, 0 to 1 is a coin flip, about 80% at 4):

- **Casual and attentive players** stay near a coin flip at both checks (gap about 0.7 at the teen, about 1.5 at adulthood). That is the intent: a player who has not chosen gets a random lean.
- **A committed steerer** is certain by adulthood (gap 9 to 11.5) but not at the teen check (gap about 3.2 to 3.4, about 67% to 70% for the leader). So the teen is only a weak preview of the lean, even for a player who is steering.
- **A player who only feeds one packet type** ends adulthood at about 4.3 to 5.4, right at the edge of certain. Decisions and netrun choices are what carry a lean at these sizes.
- **If the teen preview should be reliable for a steerer**, two levers fit: raise the packet value to about 0.25 (steerers reach about 5.8 at the teen, feed-only about 9.5 to 11.5 at adulthood, casual still near a coin flip at 1.8), or lower the "certain" gap from 5 to about 3. Not decided; the starting values stay as the maintainer set them.
- **Caveats:** one signed number stands in for two tracks, 150 lives is small, and the unnamed sources were set to 0.5 by me. The hidden path's "low on both" is not tested here.

**Wins that make a role**

- No threshold is needed. The gap rule already handles it: equal wins give equal chances, and a gap of 5 or more is certain. At 1.0's win rates (about 16 by adulthood for casual, about 23 for attentive) a specialist reaches a gap of 5 easily, and a spread-out player is a weighted coin. A netling with no wins is simply a tie among all four.

**Hidden path** (starting values from 1.0's Shell and Ghost, to be adjusted)

- **Teen:** at least 3 wins in each of the four games (1.0's Shell number), plus low Standing on both tracks.
- **Adult:** at least 4 wins in each game and 29 in all (1.0's Ghost numbers; boosted wins count as 2), plus low Standing on both tracks.
- "Low" is a placeholder: both tracks under 3 points, which is close to 1.0's allegiance band (under 2). It depends on the dependency above.
- For scale, in 1.0's baseline 27% of casual teens met the axis conditions for Shell (allegiance near zero, stability not negative, at most 1 fault), 18% also had at least 1 win in every game, and 1% had at least 2 wins in every game. Shell asks for 3 in every game, which is rarer still, so the hidden path stays hard. (My first version of this note misread those figures.)

**Bugs** (all guesses, to tune)

- **Chance a fault adds a bug:** 30%. Casual makes 4.6 faults a life, so about 1.4 bugs a life before feedback, and attentive nearly none. The feedback loop raises it.
- **Per-bug penalty:** each bug adds about 8% to the drain of Charge and Sync, 10% to Heat gain, and 4% to the drain of Integrity. 1.0's perks are 15% to 20% slower drain, so one bug cancels half a perk.
- **Ceiling:** 5 bugs. At the ceiling that is +40% Charge and Sync drain, +50% Heat gain and +20% Integrity drain. The Integrity penalty is smaller on purpose, so a player can recover (decided). 40% is not ignorable and is still survivable, but this is the number most likely to move after a balance run, since casual's full-life rate is 90.5% today.
- **Clearing:** a scrip price of 15 per bug (the price of a Repair kit; a casual netling ends with about 63 scrip and buys about 6.7 items). A Standing price of 2 points per bug from a track the player picks. The anomaly clears one bug when taken. All are guesses.

**Egg page drop rate** (computed from a simple model, so it is arithmetic, not a simulation)

- Model: each netrun gives a chance `p` of an egg page, pages come in order with no repeats, and there is no per-life cap. Casual makes about 18 runs a life and attentive about 24.
- The chance of finding all 5 form pages of one egg (the Source page is separate and needs Root and the Source descent):

| p per run | Attentive, 1 life | 2 lives | 3 lives | Casual, 2 lives | 3 lives | 4 lives |
|---|---|---|---|---|---|---|
| 0.08 | 4% | 34% | 69% | 16% | 44% | 69% |
| 0.10 | 9% | 53% | 86% | 29% | 64% | 86% |
| 0.12 | 15% | 70% | 94% | 44% | 79% | 94% |
| 0.15 | 29% | 87% | 99% | 65% | 92% | 99% |

- Egg page drop rate: `p = 0.10` per run is accepted as the starting value (decided). A very consistent player has a 9% chance of all five in one life and a median near 2 lives, which matches the intent. A casual player takes about 3 lives. At 0.15 a consistent player finishes in one life 29% of the time, which is more than "might".
- For Rogue's gate (all 18 pages), a consistent player needs about 2 lives per egg for the form pages, so about 6 lives, plus a trip through Root and the Source for each Source page. A casual player needs closer to 9 or more.

**Bug anomaly:** it is one entry in the anomaly pool, so its frequency is its share of the pool times the anomaly share of nodes. Not set.

**Scrip and Standing prices** are above. **Segfault (decided):** it adds 2 faults (as in 1.0), pushes temper noticeably volatile, and has a 60% chance of adding a bug. I read the 60% as one roll for the whole use, adding at most one bug. For comparison, two plain faults at 30% each add at least one bug 51% of the time (the 49% figure is the chance of none) and can add two. The size of the temper push is not set.

### Tie breaks (decided)

Standing and wins per game are integers, and decisions use the integers. For each choice (the Standing lean, and the role) the rule is the same:

- Take the gap from the leader. A gap of 0 or 1 counts as a tie. The chance of the lesser option falls as the gap grows, and at a gap of 5 or more the leader is certain.
- Ties are random. Options with equal counts get equal chances.
- A form the player has never raised (per egg, in the dex) gets a weight of about 20% more (1.0's `newFormWeight` is 1.2), applied after the gap weights and then renormalized. A choice already at 100% is unaffected.

My proposed way to compute it (the numbers are a proposal; the shape is yours): each option gets weight 4 at a gap of 0 or 1, then 3, 2, 1 and 0 at gaps of 2, 3, 4 and 5 or more. Then:

| Gap between two options | Leader | Other |
|---|---|---|
| 0 or 1 | 50% | 50% |
| 2 | 57% | 43% |
| 3 | 67% | 33% |
| 4 | 80% | 20% |
| 5 or more | 100% | 0% |

With more than two games it works the same way: gaps of 0, 2 and 4 give 4, 3 and 1, so 50%, 37.5% and 12.5%. The role and the Standing lean are rolled together, and the unseen weight applies to the final form. This resolves the earlier open question on ties.

Needs tuning: a point of Standing is a unit that has to be chosen, and 5 points only means "clear" if a life earns Standing in the right range. 1.0's allegiance moved by 0.75 to 1 per action, so a life produces tens of points. The size of a Standing point, and how many wins a specialist makes in a game, decide how often a gap of 5 is reached. That is a balance run, not arithmetic.

### Bugs (proposal)

Idea from the maintainer: faults are not tracked. Each fault has a chance of adding a BUG. Bugs raise the penalties on the four care values (Charge, Sync, Integrity, Heat) and push Heat gain up, which makes flow hard to reach, so care is harder to keep up, which causes more faults and more bugs. Heat still affects temper through the overclocked and flow states.

What it does well:

- **It makes neglect visible without counting faults.** Bugs can show as glitches on the sprite, which answers "neglect must be visible" with something the player can read and fix.
- **It replaces the fault cap with a consequence that scales.** A few bugs are an annoyance, many are a crisis.
- **It fits temper.** Heat already moves stability in 1.0 (overclocked and 85+ push volatile, flow pushes orderly), so a buggy netling drifts volatile on its own. That also makes volatile read as a hard-run, glitchy netling, which suits the old Glitch.

What to watch:

- **A death spiral.** The loop (fault, bug, harder care, fault) has no brake as described. 1.0's simulated casual archetype reaches the end of its life about 90% of the time and has about 4.6 faults a life, and heat at 100 is itself a fault source. Bugs that raise heat gain feed that directly. Without a way to clear bugs, a small early slip could end a life in a way a player cannot read or undo.
- **Clearing bugs (decided).** A netling can be "defragged" or "bugfixed" (the Program wording; the Iron and Wetware wording is not chosen). There are three ways, in this order of weight:
  1. **Scrip (the main way).** A price in scrip, so a player can always fix bugs by earning scrip.
  2. **Standing (an alternate cost).** Paying in Standing also lets a player retool their evolution direction, since Standing is a lever (a gap of 5 decides a form). That is an intended side effect, and hidden: the game does not advertise it (decided). The player picks which track pays (decided).
  3. **A random netrun anomaly event.** Netruns already have anomalies (`src/netrun/anomalies.js` in 1.0), so a bug-clearing anomaly needs no new icon (decided).
  1.0's Repair kit (Integrity), Antivirus patch (viruses) and Coolant cell (Heat) do not clear bugs, so this is new 2.0 content.
- **Needs a ceiling (decided).** The total penalty is capped so a bad stretch is recoverable, but not so low that the maximum can be ignored. The Integrity penalty is relatively smaller at the maximum than the other three, so a player has a realistic chance to recover (confirmed by the maintainer).
- **Chance and penalty per bug are tuning numbers.** I chose none.
- **It touches death.** Integrity collapse becomes the main way neglect kills (see Risks), so the balance run has to cover it.
- **Volatile does not need bugs (decided).** A netling can be volatile with no bugs and no faults by running hot consistently, so volatile is not only a symptom of poor care. Bugs still push heat up and so push temper that way. The preference effects of temper should not make volatile strictly worse.
- **Bugs do not carry across lives** (proposal). A new netling starts with none, matching Standing.

### Temper (proposal)

- **Accrual:** reuse 1.0's stability table as a starting point (faults push volatile, calm uptime pushes orderly, overheating pushes volatile, a fast PATCH pushes orderly). Numbers go to the balance tools.
- **Effects:** the three tells already decided (sprite motion, idle behavior, chatter tone) plus mild care preferences. For example an orderly netling likes a steady routine and a volatile one likes novelty, and a match makes care slightly easier. Keep this small. Preferences change care values, and faults feed temper, so there is a loop; check it with the balance tools so it does not snowball.
- **Perks:** 1.0's Daemon and Glitch perks were tied to forms. In 2.0 temper could carry small perks, or none. Open.
- **Consequence for the layered model:** the "temper variant" in composed forms (egg body, temper variant, role overlay) becomes an animation and idle skin, not a separate sprite identity. The temper hints stay on the list, but they are now personality hints, so they can be vaguer and lower stakes.

### Risks to check

- **Standing resets each life (decided), so the starting state is zero on both tracks.** That removes the worry that a line repeats the same lean, but it has two consequences. First, the hidden form's "low Standing on both tracks" is the default state, so that form means mastering all four games while staying unremarkable to both the corp and the street. Second, at the teen check a netling with no clear lead is a tie and is settled by the tie-break rule (a random pick, weighted toward unseen forms). It is the hidden path only if the games are met.
- **Removing the fault cap changes 1.0's death rules.** In 1.0 a life ends by integrity collapse, by neglect (10 care mistakes) or at the end of the life cycle, and Root Access can undo the first two. Without the cap, only integrity collapse and the end of the life cycle remain, and Root Access undoes only the first. Against the committed 1.0 baseline (`tools/baseline/lives.json`, 1000 simulated lives per archetype), the neglect cap ended 4.8% of the casual archetype's lives, 4.2% of the neglectful one's, 1.7% of the worker's and none for the others. The neglectful archetype already died of integrity collapse in 95.8% of its lives. That agrees with the view that the cap rarely matters, but it is simulation, not real players. After the change, those few lives would run on or die of integrity collapse instead, so a balance run is needed.
- **The Segfault item loses its risk.** It adds 2 faults deliberately, and its cost was that faults could end a life. In 2.0 it becomes a temper push with no fatal cost. Its design (or its cost) needs a look. Its name per egg stays in the item table.
- **Netrun faults.** 1.0's netrun adds a care mistake on some disconnects, clamped below the cap. Without a cap that clamp goes, and the mistake becomes a temper nudge.
- **Nothing here was simulated.** The counts are arithmetic from the docs.

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

- **Trigger:** 1.0 requires every codex fragment and one Source exit. In 2.0 it requires all story pages, Root and late, and one Source exit, not egg pages, consistent with Root Access (decided with the late flag). Otherwise it would depend on the eggs a player has raised.
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

### Making the steady end legible (proposal)

The problem: the unsteady end can grow more chaotic, but the steady end is the absence of chaos, which is easy to miss. The fix is to make steadiness something the player can notice and predict, not merely a lack of noise, and to let it grow stronger the same way chaos does. Ideas, to combine as wanted:

- **A countable rhythm (chosen).** A steady netling does a small signature move on an exact beat (a blink or a settle every N seconds, always the same N). A player can count it, and the tell is "I can predict it". Keep any pulse at or below one change a second.
- **A visible ritual that grows.** The idle routine is a fixed sequence of steps that the player can learn, and at the strong end it repeats exactly. This ties to the idle hints (the same three tasks in the same order).
- **Tidiness.** Poses snap to a grid, the sprite returns to the same spot after each move, and there is no stray motion. The unsteady end is the same set of parts, drifting.
- **Sound.** A steady netling has a clean tone with a regular tick; an unsteady one wobbles in pitch. Every sound tell needs a non-sound equivalent for players with audio off.
- **Chatter format.** A steady netling uses a recognizable frame (the same opener and sign-off); an unsteady one breaks it.
- **Strength levels.** Both ends get two or three levels. The steady end gets crisper and more ritual, the unsteady end more chaotic, so strength reads in both directions.

The tell on each end must still stay under three flashes or changes a second in every motion setting, with a calmer variant under reduced motion. The steady end suits reduced motion well, since it is calm by nature. None of this is designed in detail. The numbers and animations are for the sprite redesign pass.

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

### Second form names for option C (proposal)

Option C gives each role two named forms, one leaning corp and one leaning street, so 12 new names are needed. The existing 12 role names stay; each takes one lean, and a new name takes the other. Which existing name takes which lean is arbitrary and is a proposal. Every new word below was checked against the glossary named; the Iron names are monosyllabic, as decided.

| Egg | Role | Corp-leaning | Street-leaning | New name's source |
|---|---|---|---|---|
| Program | Breach | **Tiger** | Worm | Jargon 4.4.7: tiger team, paid professionals who penetrate security to test it |
| Program | Dodge | Mouse | **Spoof** | Jargon: to alter a communication stream so it misleads the recipient (leans swapped at the maintainer's request) |
| Program | Tune | **Parse** | Phreak | Jargon: to understand or comprehend (and to work out structure) |
| Program | Feast | **Gobble** | Snarf | Jargon: to consume; points to snarf |
| Iron | Breach | **Splat** | Gronk | Jargon: the squashed-bug mark, so smashing and tidying |
| Iron | Dodge | Jiff | **Bamf** | Jargon: the sound of something teleporting in or out |
| Iron | Tune | **Ping** | Feep | Jargon: a small message sent to check that something is there (from a sonar pulse) |
| Iron | Feast | Munch | **Thrash** | Jargon: to move wildly or violently without accomplishing anything useful; overloaded systems thrash, moving data in and out and grinding the disk (proposed over Hog) |
| Wetware | Breach | Razor | **Solo** | CP2020: a mercenary who works the streets |
| Wetware | Dodge | Wired | **Chipped** | CP2020: senses, skills and reflexes enhanced by cyberware |
| Wetware | Tune | **Mentat** | Gibson | CP2020: someone who stares at a problem and answers without visible steps |
| Wetware | Feast | **Nutri** | Leech | A clipping of CP2020's Nutrisoy (cheap processed food). Decided. Wirehead was dropped as too close to Wired |

New names are in bold. The hidden forms (Ghost, Guru, Blank) are unchanged.

Notes:

- **Lean assignment is a guess.** I gave the corp lean the tidier or paid word (a hired team, a clean signal, serial processing) and the street lean the wilder one, following 1.0's Chrome (licensed) and Firewall (street-minded). Swap any pair; nothing else depends on it.
- **Wetware Feast, corp lean (open).** Wirehead is dropped. The maintainer suggested Batch or Stream. Checked against the sources:
  - **Batch:** Jargon 4.4.7 has it (non-interactive, processed in bulk), so it reads corporate and orderly, and "feeding a batch" gives a Feast link. But it is not CP2020 slang, and Wetware's names come from CP2020. It also collides with the Wetware Segfault item, Bad batch.
  - **Stream:** in neither glossary. It reads as flow, with a weaker link to eating.
  - **Nutrisoy:** CP2020 (cheap processed food product). Corp-flavored and unmistakably about eating, but three syllables, longer than the other Wetware names.
  - **Chunking:** CP2020 (eating on the run, or as a secondary activity). Short, directly about eating, but it is a gerund and reads street, not corp.
  - If Batch is chosen anyway, the Bad batch item would need another name.
  - **Nutri:** a clipping of Nutrisoy, proposed by the maintainer as the shorter option. The glossary has only the full word, but clipping has a precedent (Phreak is a clipping of the Jargon term phreaking). Two syllables, like Razor and Gibson. It reads like a brand prefix, which suits the corp lean, and plainly points at food and nourishment. Risk: it can sound cute next to the other Wetware names. Decided by the maintainer.
- **Weak links.** Spoof (deception reads outlaw, now on the street lean) and Splat (smashing, close to Gronk). Thrash and Gronk are both violent street names in Iron, which is acceptable since the roles differ (Breach and Feast). Alternates: Program Breach Sneaker (also verified, a hired breaker); Iron Breach Gib (Jargon: destroy utterly) or Scag; Iron Feast Hog (Jargon: eats more than its share); Wetware Breach Blade (CP2020: a fighter with edged weapons, or a surgeon), Wetware Dodge Edge (the fringe of society).
- **Form-bound pages (done).** Under option C one page covers both forms of a role. The drafts file now has one page per role, named by role (`iron-breach`, not `iron-gronk`). The Iron pages `iron-breach` and `iron-dodge` name no form (decided); the other role pages name neither lean.
- **Not checked:** how the names read in the UI, or whether any collides with a 1.0 form name. None of them is a 1.0 form (Chrome, Firewall, Daemon, Glitch, Ghost, Stub, Shell, Kernel and the mainframe names).

Alternates: Program Breach Trojan or Cowboy; Dodge Snark or Boojum (Snark was dropped as too close to Snarf); Tune Phantom or Dragon; hidden Wheel. Iron Feast Slurp; hidden Wizard or Wheel. Wetware Breach Cowboy; Feast Exotic (graceful but no feeding link); Dodge Ace. Wabbit was dropped (too close to Elmer Fudd).

Not yet named: the elder (mainframe-stage) forms, and the teen forms.

## Codex pages

Two kinds (decided):

- **Story pages:** shared by every egg. Root Access needs these at minimum. Cosmetic and other unlocks default to story pages. They keep the 1.0 per-life cap (8 a life). Ten new ones are drafted, to cover the two extra eggs and the lore they imply.
- **Egg pages:** specific to one egg, one per adult form. Each egg has 5 adult forms, one of them hidden, so 5 egg pages per egg and 15 in all, all new. Any member of the egg can find its form pages. They count toward Rogue's gate, which needs all 18 (decided). They are rare drops with no per-life limit (decided): the rate should be set so that a very consistent player could in principle collect all of an egg's pages in one life but would more realistically need about two. The rate itself is to be tuned with the balance tools, and no number is chosen. Each egg also has one Source page, which is an egg page (decided), so 6 per egg and 18 in all. The earlier idea of a page per teen form is discarded, and elder forms get no pages (decided): they are hidden until after Root, and the codex is already growing a lot.

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

- Story set: 24 Root pages (the original 22 plus the new `public-4` and `corp-2`) and 15 late pages (ten new ones plus 1.0's `deep-5`, now `deep-6`, and the four Source pages), 39 in all. At 8 a life, 24 Root pages takes 3 lives, as in 1.0.
- Egg pages: 15 form pages (5 per egg), all new, plus 3 Source pages (one per egg), 18 in all (the Source pages are egg pages, decided).

### What follows

- Unlocks default to story pages, and regional unlocks count Root pages only. So the Public Net tint now needs five pages (the original four plus the new `public-4`) and the Corp Grid tint six (the original five plus the new `corp-2`); the other regions are unchanged. Corp gold, which uses the whole Root list, needs the same 24 pages. This matches 1.0's code, where regional unlocks already count only the Root list.
- Corp deletion failing differently per egg is told in the new story page `corp-7` (deletion log), not in the egg pages and not by editing `corp-3`, which stays shared.
- In-world version numbering: `ruins-3` ("back to v1.0") and `source-1` ("last write: before v1.0") use "v1.0" as lore, which is now the alpha. The intro script is unversioned. The generation counter (`vN.0`) stays separate, as in 1.0.
- The word "fragment" is used in-world for lineage records (`bazaar-2`, `bazaar-3`, `ruins-3`, `deep-2`, `deep-4`), so renaming only the codex side to "pages" keeps the lore consistent.

## Hidden egg

Candidates, with fit:

1. **Rogue (the Puppet Master line).** Unlocked after the ending. Its end of life is a merge: two fragments from different eggs combine into a hybrid next generation with traits from both. This fits the shared-lineage decision and the Puppet Master's wish for variation. Failure model: being hunted by rogue hunters instead of corp traces. Recommended.
2. **Replicator (wabbit).** A playable prequel to the outbreak, tied to `public-1` ("unexplained process growth") and `public-2`. High build cost because it manages a population, not one pet.
3. **Variant.** Same meters, different tree. Lowest cost, lowest contrast, and less of a secret.

Gate (decided): the ending has played, and the egg-specific codex pages are what count toward it. Until then it should not appear at all, not even as a corrupted slot.

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
| Codex (27 pages in 1.0) | Five reworded (`corp-4`, `corp-5`, `bazaar-1`, `bazaar-4`, `bazaar-5`), `deep-3` unchanged; 2.0 has 37 story pages (24 Root, 13 late) and 18 egg pages (15 form pages, 3 Source pages) |
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

1. Names for the elder and teen forms. The 15 adult names had no objections after their last revision.
2. Where do form pages drop: the egg's home region, or any region? Any member of the egg can find them. Current drafts put each egg's pages in its home region and the three hidden pages in The Deep.
3. Decided: egg pages have no per-life limit. Open: the drop rate that makes full collection take about 2 lives for a consistent player, to be tuned with the balance tools.
4. Decided: elder forms get no pages.
5. Decided: Rogue's gate is all 18 egg pages (15 form pages and 3 Source pages), so a player must raise all three eggs and find every egg page. It is a secret egg and should be hard to get. Consequence to tune: at about 2 lives per egg for a consistent player, that is about 6 lives at the least, and a Source page needs Root and the Source descent in each egg.
6. Decided: the three Source pages are egg pages.
7. Purge order details. Recommended, not confirmed: leave accident or deliberate unsettled, and have NL-0 learn the order was dead only when the player shows it.
8. Wording of the temper hints: first drafts exist (see the drafts file); where they appear is open.
9. Evolution: Standing sources are set as a starting point (see Starting numbers); open are the unnamed sources (voucher, Black ICE, ignored trace, checkpoints, anomalies), whether Standing is rounded for decisions, and whether the teen preview should be made more reliable (tie breaks are decided, see Tie breaks; a netling with no lead is then just a tie, so there is no separate default teen; no wins threshold is needed for a role); whether sustained neglect also marks the form (or only shows on the sprite); the number of wins that makes a role; and how the 12 role form pages are reworded for option C.
10. The Segfault item (decided in part): it still causes a fault and pushes temper noticeably toward volatile, and it now has an increased chance of adding a bug. The size of those effects is not set. Other items can be retooled to affect temper less intensely than Segfault, which items and by how much is open.
11. Bugs: the scrip price, the Standing price, how often the anomaly appears, the names per egg, the ceiling values, and the chance a fault adds a bug.
12. The 12 second form names (see Second form names): Nutri is decided; the rest are proposals, with Spoof and Mouse swapped and Thrash proposed over Hog.

## Not designed yet

The backlog. None of this has been decided or drafted.

- Per-egg meters and care buttons: Iron's drift and calibration, Wetware's rejection, and how corrective, adaptive and perfective care map to actions. The abstract drives (Upkeep, Exposure, Reward, Risk) are a proposal only.
- The exact tells per egg and the numbers for temper accrual (see Evolution); how the two Standing tracks move and what they change (markets, checkpoints, traces); the hidden form's conditions (mastering all four games, and perhaps low Standing on both tracks).
- Baby and teen stages and forms per egg; the elder stage rules (1.0's Mainframe gating replaced); Source access rules.
- Netrun abilities per form, regions per egg, events per egg, and the tutorial run per egg.
- The Rogue egg beyond the merge idea and its gate.
- The composed-form sprite spec, and how the test and balance tools drive composed forms.
- Mini-game modifiers per egg.
- Shells, crests and the Mini device prop, which depended on 1.0 forms.
- The Source descent's presentation per egg (read, burned in, dreamed), and how the late-page gating by Root Access interacts with the elder stage.
- Unlocks for the late pages themselves, if any.
- Save format and storage keys for the new app. Migration from 1.0 saves is not planned.

## Not done

- No code was read for feasibility. All counts come from the docs.
- The Puppet Master details are from memory of the film.
- The dream framing draws on my reading of CP2020's simulated-reality entries (BTL, SimSense, moddy).
- No page text has been playtested or read in context. The drafts run longer than 1.0's pages (see the drafts file).
- The page counts and the Root Access arithmetic are from the 1.0 tables, not simulation.
