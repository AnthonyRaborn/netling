# Netling 2.0 sketch

Status: planning notes for a separate app, not a change to this repository's game. Nothing here is implemented or tested. Items marked Decided come from the maintainer; everything else is a proposal. Companions: [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (all page text) and [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) (the reference review; its candidate analysis was written for fitting a second egg into 1.0 and is partly superseded by this doc).

## Handoff

**Where it stands.** The overall shape is decided: a separate app, three launch eggs (Program, Iron, Wetware), a layered form model, a story frame, and a codex page model. Since the first sketch, these are settled or measured: all codex page text (15 role and hidden form pages, 12 new story pages, 3 Source pages, 18 temper hints); the late-page flag and Root Access arithmetic; evolution (Standing and the mini-game roles are the levers, with tie-break rules); two named forms per role (option C) with 12 second form names; hidden-path rules; bugs (faults feed bugs, bugs raise drain, cleared with scrip, Standing or a netrun anomaly); the temper scale, its tells, its catalogue and its care preferences; and starting numbers for Standing, bugs, temper and the egg page drop rate. All numbers come from prototypes on 1.0's simulator and are starting values to retest in 2.0 (see `docs/netling2-prototypes/README.md`). What is not designed: see Not designed yet.

**Next steps (the maintainer has not set an order after the sprite work was raised).**
1. **Sprite redesign** (the largest open piece): the three bodies, a visible neglect look, the temper tells (countable rhythm for steady, growing chaos for unsteady, with a calmer reduced-motion version and nothing flashing more than three times a second), a flicker guard so a tell does not flip at a level threshold. See Neglect and the sprites and The temper tell.
2. **Per-egg meters and care buttons**, then baby and teen stages and forms per egg, then the elder stage rules.
3. **Netrun content per egg** (abilities, regions, events, tutorial run) and the debug station anomaly's options.
4. Review and edit all drafted text in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md). Idle and chatter temper hints are flagged for revisiting.
5. Retest every starting number once 2.0 exists; the prototypes only approximate it.

**Document map.** This file holds the decisions, the architecture, the measured starting numbers and the open questions. [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) holds all page text and the temper hints. [netling2-prototypes/README.md](netling2-prototypes/README.md) holds the patch and the drivers that produced every measured figure, with how to re-run them. [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) is the reference review that started this, partly superseded.

**What was and was not run.** Only documents changed in this repository. The prototypes ran on scratch copies of 1.0's simulator; `npm test` was run after the docs change to confirm nothing broke, and `npm run smoke` was not run (it needs Playwright and a browser). No 2.0 code exists. No page text has been read in context or playtested.

**Working agreements.** Avoid emojis and em dashes. Measure before claiming a number, and say what a measurement does not cover. Say plainly what was not run or verified. Ask clarifying questions before ambiguous or non-trivial steps. Record each decision here as it is made, marked Decided or proposal. Keep in-game Wetware text to plain words (see The eggs). Do not open a pull request unless asked. The soft freeze in `CLAUDE.md` still applies to this repository's game code; only documents change here. Work is on branch `claude/game-egg-differentiation-xkl6x2`.

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
- Sprites (decided): every teen and adult form is authored in full, with its own silhouette and its own anchor rows, as in 1.0. Composing a form from a shared body plus role and lean overlays was prototyped and rejected for the current plan of forms (option C, two named forms per role); see [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md). Temper stays an animation skin, not a separate sprite, and neglect stays a mark layer drawn over any authored sprite.
- A hidden, unlockable egg is welcome.
- Standing is two tracks (corp and street), not one signed number.
- The ending does not show NL-0's differentiation. It is told only through codex pages.
- The hidden temper shows through sprite motion, idle behavior and chatter tone together, in all three eggs.
- The hidden egg is Rogue (the Puppet Master line) with the merge ending, gated on the ending having played and the egg-specific codex pages (the merge itself uses lineage fragments).
- Each egg's elder stage has its own form. (Refined, see below: one elder per adult.)
- Elders (decided): one elder per adult, each a variant of the adult it grows from, as 1.0's mainframes are of their lines. That is 9 per egg and 27 in all, each wider than its adult (18 columns against 16) and no taller than 15 rows. Elder forms still get no pages. The names are not decided.
- Neglect and bugs (decided to try): neglect is a transient look from unmet care needs; bugs are a persistent look, glitches on the sprite, that stay until cleared. Both showing together is intended: neglect leads to faults and faults roll bugs, so the rust and the glitches appear together by design, and bugs do not suppress the rust.
- Teens and hidden paths (decided): the two main teens per egg (corp lean, street lean) may differ only slightly. The hidden path must be distinct, so a hidden-path teen needs its own outline, not just marks over the others'.
- New codex pages are allowed. NL-0's differentiation is carried by pages in the Old Web Ruins (Iron) and the Darknet Bazaar (Wetware).
- The Source stays one place (option B with a touch of A): each egg finds one extra page there that the others do not, and the descent is drawn in that egg's own style.
- Root Access needs the general, shared story pages at minimum. Egg-specific pages are for Rogue's unlock only, not for Root Access.
- Codex fragments are called codex pages from here on. There are two kinds. Story pages are shared by every egg, start from the 1.0 codex, and carry Root Access and, by default, all unlocks. Egg pages are specific to one egg, one page per role (each covering both of the role's forms) plus one hidden-form page, so 5 form pages per egg and 15 in all, plus 3 Source pages, which are egg pages (decided). Teen pages are discarded, and elder forms get no pages (decided). Egg pages count toward Rogue's gate. They are rare drops with no per-life limit (decided), so they do not share the story pages' cap. Work order: codex pages first, temper hints after.
- Any member of an egg can find that egg's form pages, whatever its own form.
- Each egg has 5 role-or-hidden pages but 9 adult forms (decided, option C): each of the four roles (Breach, Dodge, Tune, Feast) has two named forms, one corp-leaning and one street-leaning, plus one hidden form that masters all four. The role is a descriptor for the DEX and hints, not the form's name. The original first-pass names are in Adult forms and names; the 12 second names are in Second form names.
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
- In-game Wetware text uses plain words rather than CP2020 jargon. The Wetware form names (Razor, Solo, Wired, Chipped, Gibson, Mentat, Leech, Nutri, Blank) are exempt.

**Decisions from the evolution and numbers pass (details and measurements in the sections named).**

- Standing resets each life; it is shown as the floor of each track, labeled as a rough estimate; decisions use the fractions (Evolution, Starting numbers).
- Standing sources: packets 0.25, COMPLY, HIDE, an ignored trace, checkpoint and anomaly choices 1, market purchases 0.5, voucher and Black ICE shard 1; plain care and mini-games add nothing.
- Tie breaks: a gap of 1 or less is a coin flip, the lesser option's chance falls to 0 at a gap of 5, unseen forms weigh about 20% more. Same rule for the Standing lean and the role.
- Hidden path: the Standing tracks within 1 point plus the games requirement; faults and stability are not conditions.
- Faults are hidden (not logged) and uncapped; the 10-fault death is removed. Faults feed temper and roll bugs.
- Bugs: 30% per fault, ceiling 5, clearable for 15 scrip, 2 Standing in any split, or a netrun debug station anomaly. Segfault: 60% one bug, 15% two, 25% none, temper -4. The penalty ceiling is not ignorable and smaller for Integrity.
- Temper: resets each life, 24-hour half-life, flow +0.5 an hour, Coolant cell and Antivirus patch +1, levels at -6, -2, +3, +6, tells through motion, idle behavior and chatter, hints in the Dex (Temper scale, The temper tell, the drafts file).
- Care preferences: steady likes routine, unsteady likes novelty (Sync +2 mild, +4 strong), hidden; game requests are biased (steady: one of the last two distinct plays with netrun ICE games in the history; unsteady: a game not among them); no packet request (Care preferences).
- Egg pages are rare drops (0.10 per run), no per-life limit; Rogue's gate is all 18 egg pages; elder forms get no pages.

## Architecture

| Layer | Decided by | Replaces in 1.0 |
|---|---|---|
| Egg (substrate) | The player's choice at the prompt | The single fixed software egg |
| Temper (body) | One hidden axis, orderly to volatile, fed by faults and handling, shown by behavior and sprite tells. It shapes personality, not the form (decided; see Evolution) | Stability axis and its pull on Daemon and Glitch |
| Role | What it specialized in, from the four mini-games | Netrun abilities tied to form |
| Standing | Visible reputation of one netling; it starts at zero each life and does not carry over (decided) | Allegiance axis, Chrome and Firewall |

Standing is two non-negative tracks (corp and street), not one signed number (decided). High corp reads as Chrome-like, high street as Firewall-like, both high as a broker, and tracks within 1 point of each other as balanced, which is the hidden path's Standing condition and replaces the Ghost's "neutral allegiance" condition (decided; the earlier idea of "both low" was dropped because feeding adds Standing, which makes "low on both" hard to reason about).

Proposal: roles map to the four games. Breach to a Cracker, Dodge to an Evader, Tune to a Seer, Feast to a Scavenger. Names draw on CP2020 icebreaker, Jargon cracker, "mouse around", gibson, and Jargon snarf.

Proposal: traits act on abstract drives (Upkeep, Exposure, Reward, Risk). Each egg maps the drives to its own meters, so lineage and traits are shared across eggs.

Proposal: all three bodies share anchor rows (head, face, body, float) so the 41 wearables work unchanged. With forms authored in full (decided), each form carries its own anchor rows, as in 1.0, and the prototype ran the 1.0 wearables on them unchanged.

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
| Baby to teen | Standing only: which track leads (corp or street) | Three teen types per egg: corp-leaning, street-leaning, and the hidden path. The hidden-path teen also needs wins in each of the four games (the number is a balance question) and the two Standing tracks within 1 point of each other. Faults are not required (not decided) |
| Teen to adult | Role (the game with the most wins this life) and Standing lean at that time | The teen is a preview of the Standing lean, as a checkpoint the player can read. The lean is recomputed at adulthood, so it can still change |
| Hidden adult | All four games mastered, Standing tracks within 1 point of each other | Needs a threshold for mastery, as 1.0's Ghost does (4 wins each and 29 in all) |
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
- **Whether it lasts.** The look can clear when needs are met, or leave a mark that persists to the next stage. A persistent mark would be the Stub-like consequence of 1.0. Not decided. Decided to try (maintainer): neglect is transient and comes from the care needs left unmet; bugs are the persistent layer and show as glitches on the sprite (torn rows, one more per bug, until cleared). Two looks on two channels, so a recovered netling loses its neglect look at once and keeps its glitches until the bugs are cleared. Prototyped in [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md); not yet tuned or judged on a device.
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

- A corp or scavenged packet adds 0.25 to its track. COMPLY, HIDE, an ignored trace, checkpoint choices and anomaly choices add 1 (the maintainer raised these to see what they give). A market purchase adds 0.5. Plain care and mini-games add nothing, so a player can stay at zero on both tracks.
- A Corp voucher and a Black ICE shard add 1 each (set below).
- **Display and decisions (decided):** decisions use the fractional values. The display shows the floor of each track and is clearly labeled as a rough estimate, so a player who wants a guaranteed form has to take a stronger stance. A displayed track can be up to 1 below the true value, so a displayed gap can be off by up to 1 either way. A displayed gap of 6 or more guarantees a true gap above 5 (a certain lean); a displayed gap of 5 might be a true gap of 4 to 6.
- The earlier run (packets 0.1, decisions 0.5) gave casual a gap of about 1.4 at adulthood and steerers only 3.2 to 3.4 at the teen check, so the teen preview was weak. It is superseded by the numbers below.

What those sizes do (measured, with limits). I ran 1.0's real simulator (`simulate()` from `tools/balance.mjs`) with packets at 0.25 and everything else at 1.0's own values, which already match the new ones: decisions and checkpoints at 1, markets at 0.5. 300 lives per archetype. The gap is approximated by the absolute value of 1.0's single signed allegiance, the closest 1.0 equivalent of the corp-minus-street gap; 2.0's two tracks were not simulated. "Leader chance" is the weight formula from Tie breaks (4 against clamp(5 minus the gap, 0, 4)) applied to each life's gap and averaged.

| Archetype | Teen: mean gap | Teen: certain (gap 5 or more) | Teen: coin flip (gap 1 or less) | Teen: leader chance | Adult: mean gap | Adult: certain | Adult: coin flip | Adult: leader chance |
|---|---|---|---|---|---|---|---|---|
| Casual | 1.4 | 1% | 50% | 55% | 2.5 | 11% | 27% | 65% |
| Attentive | 1.7 | 0% | 38% | 57% | 2.9 | 21% | 25% | 68% |
| Worker | 1.1 | 0% | 61% | 53% | 1.8 | 3% | 39% | 58% |
| Daredevil | 2.0 | 7% | 35% | 61% | 4.1 | 35% | 17% | 76% |
| Corp-only feeding, no netruns | 4.3 | 27% | 0% | 84% | 10.3 | 100% | 0% | 100% |
| Street-only feeding, no netruns | 4.8 | 45% | 0% | 89% | 12.7 | 100% | 0% | 100% |
| Steered Chrome | 7.3 | 92% | 0% | 99% | 19.5 | 100% | 0% | 100% |
| Steered Firewall | 7.9 | 98% | 0% | 100% | 24.3 | 100% | 0% | 100% |

What it means:

- **Players who steer are predictable early.** A committed steerer is almost always certain at the teen check, and a player who feeds only one packet type is mostly certain by adulthood and at least 84% at the teen. This fixes the weak teen preview from the earlier run.
- **Players who do not steer stay random.** Casual, attentive and worker netlings are a coin flip about a third to a half of the time and about 55% to 68% for the leader on average. That is the intent: no stance, no guarantee.
- **The middle was not measured.** The archetypes are all-or-nothing: either they steer hard or they do not. A player who commits only a little has no archetype here, so how far a few choices move the leader chance is untested.
- **Caveats:** one signed number stands in for two tracks, which can differ (a netling with both tracks high is a "broker" with a small gap and large totals, and 1.0's allegiance cannot show that); 300 lives is small; the hidden path's "low on both" was not measured; and Standing sources in 2.0 are not the same as 1.0's allegiance sources, so the totals are a rough guide.

**Wins that make a role**

- No threshold is needed. The gap rule already handles it: equal wins give equal chances, and a gap of 5 or more is certain. At 1.0's win rates (about 16 by adulthood for casual, about 23 for attentive) a specialist reaches a gap of 5 easily, and a spread-out player is a weighted coin. A netling with no wins is simply a tie among all four.

**Hidden path** (starting values from 1.0's Shell and Ghost, to be adjusted)

- **Standing condition (decided):** the two tracks stay within 1 point of each other. This replaces "low on both". A netling that takes no side qualifies, and so does one with both tracks high and equal.
- **Teen:** at least 3 wins in each of the four games (1.0's Shell number), plus the Standing condition.
- **Adult:** at least 4 wins in each game and 29 in all (1.0's Ghost numbers; boosted wins count as 2), plus the Standing condition.
- **Measured:** 1.0's ghosthunter archetype, which balances corp and scavenged feeds and chooses evenly, kept the gap at 1 or less in about 100% of its lives at both checks, with packets at 0.25. By chance alone, casual netlings had a gap of 1 or less in 50% of lives at the teen check and 27% at adulthood. So the Standing condition is easy for a player who aims at it and common by accident; the games requirement is what makes the hidden path hard. Faults and stability, which 1.0's Ghost also needed, are no longer conditions.
- For scale, in 1.0's baseline 27% of casual teens met the axis conditions for Shell (allegiance near zero, stability not negative, at most 1 fault), 18% also had at least 1 win in every game, and 1% had at least 2 wins in every game. Shell asks for 3 in every game, which is rarer still, so the hidden path stays hard. (My first version of this note misread those figures.)

**Bugs** (all guesses, to tune)

- **Chance a fault adds a bug:** 30%. Casual makes 4.6 faults a life, so about 1.4 bugs a life before feedback, and attentive nearly none. The feedback loop raises it.
- **Per-bug penalty:** each bug adds about 8% to the drain of Charge and Sync, 10% to Heat gain, and 4% to the drain of Integrity. 1.0's perks are 15% to 20% slower drain, so one bug cancels half a perk.
- **Ceiling:** 5 bugs. At the ceiling that is +40% Charge and Sync drain, +50% Heat gain and +20% Integrity drain. The Integrity penalty is smaller on purpose, so a player can recover (decided). 40% is not ignorable and is still survivable, but this is the number most likely to move after a balance run, since casual's full-life rate is 90.5% today.
- **Clearing:** a scrip price of 15 per bug (the price of a Repair kit; a casual netling ends with about 63 scrip and buys about 6.7 items). A Standing price of 2 points per bug from a track the player picks. The anomaly clears one bug when taken. All are guesses.

**Bug prototype on the 1.0 simulator (measured, with limits)**

I patched a scratch copy of 1.0's sim and balance tool to add bugs: a fault rolls a bug at 30%, up to 5; each bug adds 8% to Charge and Sync drain, 10% to the Heat drift and 4% to Integrity drain; Segfault rolls 25% none, 60% one, 15% two; the fault cap is removed. 300 lives per archetype and scenario. The bots do not adapt their play to bugs. Scenarios: **B1** is 1.0 as it is (cap 10, no bugs); **B2** removes the cap, no bugs; **S1** adds bugs, no clearing; **S2** adds bugs and pays 15 scrip per bug at check-ins when affordable; **S3** is S2 with a 50% bug chance; **S4** is a stress case with a 50% chance, a ceiling of 8 and no clearing. Cells show the full-life rate and the mean faults a life.

| Archetype | B1 | B2 | S1 | S2 | S3 | S4 |
|---|---|---|---|---|---|---|
| Casual | 92.7%, 4.6 | 95.7%, 4.6 | 94.7%, 5.7 | 95.0%, 4.8 | 94.7%, 4.9 | 94.3%, 6.1 |
| Worker | 91.3%, 5.3 | 92.7%, 5.3 | 92.7%, 7.7 | 92.7%, 7.2 | 90.7%, 8.8 | 88.3%, 9.6 |
| Attentive | 99.3%, 0.2 | 99.3%, 0.2 | 99.3%, 0.2 | 99.3%, 0.2 | 99.3%, 0.2 | 99.3%, 0.2 |
| Overclocker | 97.3%, 1.3 | 97.3%, 1.3 | 97.0%, 1.7 | 97.0%, 1.6 | 97.7%, 1.8 | 97.3%, 1.9 |
| Steer-stub (uses Segfault) | 100%, 3.4 | 100%, 3.4 | 99.7%, 3.7 | 100%, 3.4 | 100%, 3.5 | 99.7%, 4.0 |
| Neglectful | 0%, 4.0 | 0.3%, 4.1 | 0%, 4.3 | 0%, 4.3 | 0%, 4.2 | 0%, 4.2 |

What it shows:

- **No death spiral at the starting values.** Full-life rates in S1 and S2 sit within noise of B2 (300 lives gives about 1.5 points of noise on a rate near 93%, and bug rolls change the random stream, so differences under about 3 points are not meaningful). The feedback loop is real but mild.
- **The loop does raise faults.** The worker, who has the least scrip, goes from 5.3 faults to 7.7 without clearing (+45%), and 17% of workers reach the ceiling of 5. The casual netling goes from 4.6 to 5.7.
- **Clearing at 15 scrip works for players who run, not for those who do not.** Casual clears about 1.1 bugs a life and ends near zero bugs. The worker, who ends with about 19 scrip, clears under one bug a life and still ends with 1.3 bugs on average and 11% at the ceiling. The Standing price and the netrun anomaly matter most for players with little scrip.
- **Stress.** At a 50% bug chance with no clearing and a ceiling of 8, the worker loses about 4.5 points of full-life rate (88.3% against 92.7%) and the casual netling does not move meaningfully. That is the edge of acceptable; the starting values are not near it.
- **Removing the fault cap.** From B1 to B2, casual full-life rises 3 points and the worker 1.4, because neglect deaths (3.0% and 1.3% in these runs) now run on, and the neglectful archetype still dies of integrity collapse in essentially every life.
- **Attentive and daredevil players get almost no bugs**, as intended.
- **Not modeled:** bugs from netrun-disconnect faults (1.27 disconnects a life for casual, against 4.6 faults), Heat gained from actions such as playing (only the Heat drift is scaled), clearing with Standing or by anomaly, any change in how a real player reacts to a glitching sprite, and the temper effects of bugs. The bots clear only at their scheduled check-ins. So this probably understates the loop slightly and overstates how late bugs are cleared.

**Clearing prices and frequency (set as starting values)**

- **Scrip:** 15 per bug, as proposed.
- **Standing:** 2 points per bug, paid from the tracks in any split the player picks (decided: the player picks). A split lets a player keep their gap while paying (1 from each track), or shift it on purpose (2 from one). Paying 2 from the leader narrows the gap by 2 and paying 2 from the other widens it by 2, which is the hidden retooling effect.
- **Netrun anomaly:** one extra entry in the anomaly pool, called a debug station here, that clears 1 bug. It enters the pool only while the netling has at least one bug, so it is never a dead result. Its frequency is its share of the pool: each region has about five or six eligible anomalies, so about 1 in 6 anomaly nodes while a netling has bugs. Its options and cost are not designed (for example, clear one bug for a small Charge cost, or leave it).
- **Corp voucher and Black ICE shard:** 1 Standing each (voucher to corp, shard to street), as in 1.0 and the same as the other choices.

How those prices sit against the data (1.0 simulator, packets at 0.25, 200 lives per archetype; the track totals are the sum of everything added to that track, taken from 1.0's single signed allegiance by splitting its gains and losses, so they are a rough stand-in for two tracks):

| Archetype | Runs a life | Anomaly nodes a life | Higher track at teen | Lower track at teen | Higher track at adult | Lower track at adult |
|---|---|---|---|---|---|---|
| Casual | 17.9 | 14.4 | 3.6 | 2.2 | 10.4 | 7.8 |
| Attentive | 24.1 | 24.3 | 4.5 | 2.8 | 12.8 | 9.9 |
| Worker | 2.5 | 2.4 | 2.5 | 1.4 | 5.6 | 3.8 |
| Daredevil | 25.1 | 27.0 | 5.4 | 3.3 | 14.5 | 10.4 |
| Steered Chrome | 24.2 | 25.5 | 7.3 | 0 | 20.6 | 1.2 |
| Balance seeker (ghosthunter) | 0 | 0 | 2.7 | 2.5 | 7.0 | 6.8 |

- **Both tracks grow.** Even a casual netling has about 10 on its higher track and 8 on its lower by adulthood, because every feed and every choice adds to one of them. So a price of 2 is affordable from adulthood for every archetype in the table, and is about a fifth of a casual netling's higher track. At the teen check, a track can be below 2 (casual's lower track is 2.2 on average), so a price of 2 is not always payable early.
- **A price of 2 is cheap for a committed steerer** (their lead is 20) and meaningful for a casual netling (gap of 2.5, so one bug's worth of Standing can swing the leader's chance from about 60% (a gap of 2.5) to a coin flip or to about 90%). That matches the intent: the retooling is real for players who have not committed.
- **Anomaly nodes are about one a run** (0.8 for casual, 1.0 for attentive). With a debug station at about 1 in 6, a casual netling that has bugs meets one about 2.4 times a life, and a worker (2.4 anomaly nodes a life) about 0.4 times. So the anomaly helps players who run, and the Standing price is the option for players who do not.
- The balance seeker's two tracks stay together (2.7 and 2.5 at the teen check). Paying 2 from one track would break the "within 1 point" hidden-path rule, so a balance seeker pays 1 from each. A split price makes that possible.

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

**Scrip and Standing prices** are above. **Segfault (decided):** it adds 2 faults (as in 1.0) and pushes temper noticeably volatile. One roll decides its bugs: 60% for one bug, 15% for two, 25% for none, so 75% for at least one. For comparison, two plain faults at 30% each give 42% for exactly one bug, 9% for two and 49% for none (51% for at least one), so a Segfault is about 24 points likelier to add a bug and has an expected 0.9 bugs against 0.6 (maintainer's figures, my check of the arithmetic). The temper push is -4 on the temper scale (proposal; see Temper scale).

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

- **Accrual and scale:** see Temper scale below.
- **Effects:** the three tells already decided (sprite motion, idle behavior, chatter tone) plus mild care preferences. For example an orderly netling likes a steady routine and a volatile one likes novelty, and a match makes care slightly easier. Keep this small. Preferences change care values, and faults feed temper, so there is a loop; check it with the balance tools so it does not snowball.
- **Perks:** 1.0's Daemon and Glitch perks were tied to forms. In 2.0 temper could carry small perks, or none. Open.
- **Consequence for the layered model:** the "temper variant" in composed forms (egg body, temper variant, role overlay) becomes an animation and idle skin, not a separate sprite identity. The temper hints stay on the list, but they are now personality hints, so they can be vaguer and lower stakes.

### Temper scale (starting values, measured on the 1.0 simulator)

Temper is one number per netling, hidden, read only through the tells. **It resets each life, and drifts back toward 0 with a 24-hour half-life (both decided).** The measurements below use 1.0's stability axis as the stand-in for temper, with the bug prototype switched on (30% chance, clearing at 15 scrip), the fault cap removed and flow raised to +0.5 an hour. 300 lives per archetype. The 2.0 sources for temper are not built, so this is a rough guide.

**Sources**

| Effect on temper | Source |
|---|---|
| +0.5 an hour | Awake, in flow, no alert (decided; 1.0 had 0.2. Overclocking is much easier to reach than flow, so flow pays more) |
| -0.2 an hour | Awake and overclocked (Heat 65 to 84) |
| -1 an hour | Heat 85 or more |
| -1 | Each fault |
| +1 | A fast PATCH (within 30 minutes) or a repelled intrusion |
| +0.5 | PURGE |
| -1 | A slow PATCH, a Black ICE shard, a netrun disconnect |
| -0.5 | A mini-game that leaves Heat above 70 |
| +1 | Using a Coolant cell or an Antivirus patch (decided) |
| 0 | Plain awake time |
| -4 | A Segfault (two faults at -1 each, plus -2 for the noticeable push; proposal) |

Bugs raise Heat gain, so they push temper unsteady through the Heat rows, with no row of their own.

**Why decay.** In 1.0, stability only accumulates, so by the end of a life it is wide and permanent (attentive +10.6, daredevil -33, overclocker -36, median at end of life, cumulative). A decayed temper reflects recent habits, stays bounded, and can recover, which supports the countable-rhythm tells being readable. With a 24-hour half-life and flow at +0.5, a netling in flow all day would settle near +17, though real play (alerts, sleep, care gaps) lands far below that. Calm care sits at about +3 to +4 and sustained overheating goes past -10.

**Levels (decided): asymmetric by one step, because the steady side is slow and the unsteady side is fast.**

| Level | Temper | Tell |
|---|---|---|
| Strongly unsteady | -6 or lower | strongest unsteady tell |
| Unsteady | -6 to -2 | mild unsteady tell |
| Middle | -2 to +3 | little or no tell |
| Steady | +3 to +6 | steady tell |
| Strongly steady | +6 or higher | strongest steady tell (clearest countable rhythm and ritual) |

Share of lives at each level with flow at +0.5, the Coolant cell and Antivirus patch at +1 each, and the thresholds above (percent: strongly unsteady / unsteady / middle / steady / strongly steady). The bots use a Coolant cell whenever Heat is above 70 and an Antivirus patch on a schedule or a virus, as soon as they have one:

| Archetype | At teen | At adulthood | At end of life |
|---|---|---|---|
| Casual | 0/3/90/7/0 | 0/20/79/1/0 | 0/20/76/4/0 |
| Worker | 0/3/93/4/0 | 0/24/75/1/0 | 2/37/60/0/0 |
| Attentive | 0/0/29/60/11 | 0/0/23/58/19 | 0/0/10/46/43 |
| Sysadmin (very attentive) | 0/0/40/53/7 | 0/0/26/60/13 | 0/0/10/42/47 |
| Steer-daemon (aims for calm) | 0/0/22/59/19 | 0/0/12/54/34 | 0/0/1/25/74 |
| Balance seeker | 0/1/37/56/7 | 0/0/21/66/12 | 0/0/9/42/49 |
| Steer-glitch (runs warm) | 1/16/78/5/0 | 2/37/60/1/0 | 6/49/45/0/0 |
| Daredevil (runs hot) | 6/43/50/1/0 | 17/57/25/1/0 | 24/53/22/0/0 |
| Overclocker | 27/62/11/0/0 | 66/33/1/0/0 | 72/27/0/0/0 |
| Neglectful | 11/62/27/0/0 | 34/66/0/0/0 | 18/56/25/0/0 |

What it means:

- **Thresholds (decided).** With steady at +2 and +5, careful players almost never read as middle (attentive was steady or strongly steady in 88% of lives at adulthood) and strongly steady was reached by 61% of attentive and 71% to 86% of calm-seeking players by the end of life. Moving the steady levels to +3 and +6 keeps a visible middle for careful players (23% to 26% at adulthood), halves strongly steady at adulthood (attentive 36% to 19%) and leaves it as the reward for a calm life by the end (attentive 43%, calm-seekers 74%). Casual and hot players do not move.
- **Items matter.** Without the +1 for Coolant cell and Antivirus patch, 62% of daredevil lives and 83% of overclocker lives were strongly unsteady at adulthood. With it, 17% and 66%. A warm-running player (steer-glitch) goes from 90% unsteady at adulthood to 39%, and the attentive archetype's strongly steady share at adulthood rose from 13% to 36% (these two figures were measured with the earlier steady thresholds of +2 and +5; at +3 and +6 it is 19%). The bots spend items immediately; a real player who stockpiles them will use fewer. Items are limited by drops and market stock, so this makes a Coolant cell a temper tool as well as a cooling one, and means a hot player can settle a temper deliberately.
- **Flow at +0.5 fixes the steady side.** Before the item change, with flow at +0.2 and a strong-steady threshold of +4, attentive reached strongly steady in 7% of lives at adulthood; at +0.5 and a threshold of +5 it reached 13%, and with symmetric thresholds of 2 and 5 at flow +0.2 only 2% to 3%. Casual and worker netlings barely change, because they rarely reach flow.
- **Tells appear where behavior is clear.** Casual and worker netlings are mostly middle at the teen check (88% to 91%) and drift mildly unsteady by adulthood (about a third), mostly from faults and Heat. Careful players are steady most of the time.
- **Strong steady takes sustained calm, helped by items.** Attentive is strongly steady in 19% of lives at adulthood and 43% by the end; players who aim for calm reach 34% at adulthood and 74% by the end.
- **Strong unsteady needs sustained heat and no cooling.** Overclocker lives are strongly unsteady 66% of the time at adulthood and 72% by the end; daredevils, who cool when they can, 17% and 24%, with most of the rest unsteady.
- **Hot play dominates temper.** A casual player's drift toward unsteady is mostly faults; a hot player's is Heat. Both read as the same tell, which is fine because temper is personality, not a form lever.
- **Without decay the numbers are not usable.** At the end of life, 1.0's cumulative stability spans about -44 to +22 (the 10th to 90th percentile across archetypes), and the strong levels would be permanent.
- **Not measured:** the 2.0 temper sources as built, how often a player is in flow against overclocked (the maintainer's observation that overclocking is easier is taken as given; the simulator does not log it), a flicker guard (hysteresis) so a tell does not flip at a threshold, the effect of temper on care preferences (proposed below, not tested), and decay per minute against per check-in. A 48-hour half-life was also run at flow +0.2: it widens the spread (casual's end of life 17% strongly unsteady), so 24 hours stays closer to recent habits.

### Care preferences (proposal)

Preferences stay hidden (decided): there is no Dex hint for them. The player finds them the way 1.0's favorite packet is found, from a log line and a small Sync gain. They need no new sprite work, only log text and numbers.

**Rule.** The temper level decides which care choices please the netling.

| Level | It likes | A match is |
|---|---|---|
| Strongly steady, steady | Routine | A feed of the same packet type as its last feed, or a mini-game that is one of its last two plays |
| Middle | Nothing in particular | No bonus |
| Unsteady, strongly unsteady | Novelty | A feed of the other packet type, or a mini-game that is not one of its last two plays |

- **Reward:** Sync, on top of anything else. Mild levels +2, strong levels +4, once per action. It stacks with the favorite-packet bonus (+8 in 1.0) and with a form's perk.
- **No penalty for a miss.** An unmatched action is simply normal. This keeps unsteady from being strictly worse, and steady from being strictly better.
- **Log lines, as with "it loves these":** steady, "it settles into the routine."; unsteady, "something new. it perks up." Wording is a draft.
- **Equal chance under random play.** With two packet types and four games, "same as the last" would match half the feeds but only a quarter of the plays, while "different from the last" would match half and three quarters. Using "one of the last two plays" for steady and "not one of the last two" for unsteady makes both about half under random choices, so neither side has an edge by luck. Real players' habits then decide it.

**How big, from the 1.0 simulator (the number of care actions, not a preference test).** Average actions a life: casual 44 corp feeds, 44 scavenged feeds and 56 plays (144 in all); attentive 54, 55 and 73 (182); worker 30, 29 and 46 (105). At +2 and a match on every action, casual would gain 288 Sync a life at a mild level and 576 at a strong one. Sync drains at 13.2 an hour, so over a full life that is at most about 1,600 (an upper bound, since drain is lower asleep). So always matching would offset about 18% (mild) to 36% (strong) of Sync drain, and matching about half the time, about 9% to 18%. For comparison, 1.0's favorite packet (+8 on about half of 88 feeds) is about 350 Sync a life for casual, so +2 and +4 are smaller than something already in the game. Those figures are estimates.

**How the preference is exposed (decided: the middle path).** The bonus is a basic hidden rule; it is not a request in itself. In 1.0 the netling can already ask for COOL or for one named game (chosen at random, while idle with at least 20 Charge, about 0.25 chances an hour). There is no packet request. Decided: bias the **game request** by temper, so a steady netling asks for one of its last two distinct plays (netrun ICE games count in that history, see the follow-up measurement) and an unsteady netling asks for a game it has not played in its last two, and add **no packet request**. The bonus still applies without a request. Rationale: answering a request becomes one visible way to match the preference, with no Dex hint and no label, while packet choice (which drives Standing) stays unprompted.

**Measured concern (the middle path did not keep the steady push weaker).** I added the biased request to the prototype. Share of lives with a certain role (gap of 5 or more), without / with the biased request, and share reaching 4 wins in all four games for the follow bot:

| Archetype | Role certain, ignore bot | Role certain, follow bot | Four games at 4 wins or more, follow bot |
|---|---|---|---|
| Attentive | 3% / 3% | 59% / 92% | 63% / 31% |
| Sysadmin | 5% / 8% | 67% / 96% | 66% / 34% |
| Steer-daemon | 4% / 8% | 61% / 98% | 51% / 8% |
| Balance seeker | 7% / 7% | 71% / 96% | 79% / 39% |
| Overclocker | 2% / 3% | 2% / 1% | 98% / 98% |
| Casual | 1% / 1% | 8% / 9% | 95% / 96% |

- **For a player who ignores the preference, the bias changes little** (role certain moves by a few points at most).
- **For a steady follower it makes specializing nearly total.** Role certain rises from 59% to 92% for attentive and from 61% to 98% for steer-daemon, and the share who play all four games to 4 wins falls to 8% to 39%. Before, a random request broke the repetition now and then; a request for the last-played game reinforces it. Standing is unchanged (the packet part is unprompted), as intended.
- **For unsteady netlings it changes nothing measurable.** A request for a new game fits the rotation they already follow.
- So biasing the steady request toward the last game gave a stronger lock-in than the middle path was meant to. This was resolved by the follow-up measurement below (decided: last two plus ICE).

**Follow-up measurement: softening the steady request (options from the maintainer).** Two ways to soften the lock-in were tried. **Last two:** the steady netling asks for one of its last two distinct plays instead of the last one. **Last two plus ICE:** the same, with the random game of each netrun ICE fight added to the play history (an ICE fight is a mini-game of a randomly chosen game in 1.0; it adds to the history only, not to the wins that decide a role, and gives no Sync bonus). Each cell is the share of lives with a certain role / the share reaching 4 wins in every game, for the follow bot, 300 lives:

| Archetype | No preference | Random request | Asks for the last | Asks for one of the last two | Last two plus ICE |
|---|---|---|---|---|---|
| Attentive (runs netruns) | 5% / 100% | 59% / 63% | 92% / 31% | 76% / 35% | 32% / 95% |
| Steer-daemon (runs netruns) | 5% / 100% | 61% / 51% | 98% / 8% | 84% / 13% | 42% / 90% |
| Sysadmin (no netruns) | 5% / 100% | 67% / 66% | 96% / 34% | 77% / 41% | 77% / 41% |
| Balance seeker (no netruns) | 8% / 100% | 71% / 79% | 96% / 39% | 86% / 46% | 86% / 46% |

- **Last two alone softens it only a little** (role certain 76% to 86%, against 92% to 98% for the last game and 59% to 71% for a random request).
- **Adding ICE softens it a lot for players who run.** Role certain falls to 32% for attentive and 42% for steer-daemon, and 90% to 95% still reach 4 wins in every game. A random ICE game in the history breaks the repetition, so the preference becomes a soft push, not a lock.
- **It does nothing for players who never netrun** (sysadmin and the balance seeker are unchanged at 77% and 86%), because they have no ICE games in their history. Real players mostly run (18 to 24 runs a life in the casual and attentive archetypes), so the bot archetypes without runs are the worst case.
- **For players who ignore the preference,** the ICE version leaves everything at the no-preference baseline (role certain 4% to 6%).
- **Standing is unaffected** (the Standing gap stays 10 to 17 for steady followers), since packet choice is not prompted.
- **Decided: last two plus ICE.** It keeps a visible, answerable preference, gives steady players the variety netruns already provide, and leaves a real but soft push toward specializing. The match rule for the Sync bonus uses the same history: for steady, a game among the last two distinct plays (ICE games included); for unsteady, a game not among them. ICE games enter the history but give no bonus.

**Interplay with evolution (not a form rule).**

- Steady repeats the same packet and the same games, which pushes Standing steadily one way and concentrates wins in one game. That favors a clear lean and a certain role.
- Unsteady switches packets and games, which keeps Standing balanced and spreads wins across the four games. That is also what the hidden path needs (Standing within 1 point, every game played).
- So personality gives a soft push toward specializing (steady) or toward the hidden path (unsteady). Temper still does not choose a form, and the push is worth +2 to +4 Sync an action, but it is a real effect and worth knowing before it ships.

**Prototype on the 1.0 simulator (measured, with limits).** I added the rule to a scratch copy and built a bot that follows it. The bot knows the netling's temper level, which a real player has to infer from tells, and follows the preference on every feed and play it controls (a pet's own game request still forces that game). Scenarios: **off** (no preference), **ignore** (preference on, the usual bots, which cycle games in order and pick packets at random) and **follow**. Temper uses the decided scale (flow +0.5, 24-hour decay, items +1, thresholds -6, -2, +3, +6), bugs are on with clearing, and 300 lives per cell. Doubling the size to +4 and +8 was also run for the survival numbers.

Survival and faults (faults a life / full-life rate):

| Archetype | Off | Ignore | Follow | Sync bonus a life (follow) | Matched actions (follow) |
|---|---|---|---|---|---|
| Casual | 4.79 / 94.0% | 4.72 / 94.7% | 4.56 / 96.3% | 46 | 23 of 23 |
| Worker | 7.03 / 91.0% | 6.9 / 91.3% | 6.94 / 90.7% | 67 | 32 of 32 |
| Attentive (mostly steady) | 0.15 / 99.3% | 0.14 / 100.0% | 0.13 / 100.0% | 336 | 119 of 123 |
| Sysadmin (steady) | 0.02 / 100.0% | 0.01 / 100.0% | 0.02 / 99.7% | 337 | 113 of 117 |
| Daredevil (unsteady) | 1 / 100.0% | 0.92 / 100.0% | 0.93 / 100.0% | 283 | 113 of 116 |
| Overclocker (unsteady) | 1.66 / 96.7% | 1.39 / 97.7% | 1.29 / 97.0% | 389 | 128 of 129 |

- **Survival barely moves.** Casual rises from 94.0% to 96.3% full-life and from 4.8 to 4.6 faults, a gain close to the noise of 300 lives (about 1.4 points). The worker, whose faults come from missed care, does not move. Careful archetypes have almost no faults to remove, so 340 Sync a life changes nothing for them.
- **Doubling the size did not change that** (casual 96.0%, overclocker 95.3% with +4 and +8, within noise). The preference is flavor at both sizes; the +2 and +4 starting values are not near any instability.
- **Following is easy.** The follow bot matches almost every action it controls, so a player who notices the log lines and the tells can collect the bonus nearly always. A netling near the middle of the scale has no preference at all, which is why casual and worker netlings had only 23 to 32 preference-bearing actions a life against 113 to 129 for the steady and hot archetypes.
- **Under the ordinary bots (ignore),** steady netlings match about a third of actions and unsteady about 60% to 70%, because those bots cycle games in a fixed order (never a repeat, always a novelty) and pick packets at random. So with that play pattern the unsteady side gets the bonus more often. Real players with a favorite game would tilt it the other way. This is the base-rate caveat from the rule above: the two sides are not equal under every play pattern.

Effect on the evolution levers (off / follow):

| Archetype | Role certain (gap 5 or more) | All four games at 4 wins or more | Standing gap at end | Standing within 1 point |
|---|---|---|---|---|
| Attentive | 5% / 59% | 100% / 63% | 4.12 / 16.56 | 14% / 2% |
| Sysadmin | 5% / 67% | 100% / 66% | 3.13 / 13.54 | 22% / 4% |
| Steer-daemon (balances Standing) | 5% / 61% | 100% / 51% | 0.29 / 10.77 | 96% / 2% |
| Balance seeker | 8% / 71% | 100% / 79% | 0.18 / 9.9 | 100% / 3% |
| Overclocker | 3% / 2% | 99% / 98% | 3.28 / 2.64 | 22% / 26% |
| Daredevil | 2% / 1% | 100% / 100% | 9.01 / 8.66 | 6% / 7% |
| Casual | 1% / 8% | 97% / 95% | 3.79 / 3.86 | 18% / 18% |

- **For steady netlings, following is a strong specializing push.** Repeating the same game and packet makes the role certain in 59% to 71% of lives (against 5% to 8% otherwise), cuts the share who reach 4 wins in every game from 100% to 51% to 79%, and opens the Standing gap from about 3 to 4 up to 10 to 17. A balance seeker who followed the preference would fall from 100% to 3% within 1 point. So a steady netling whose player follows its routine is on a clear, predictable path, and the hidden path then needs the player to ignore the preference.
- **For unsteady netlings the nudge toward the hidden path is mild.** Overclocker followers keep Standing a little more balanced (gap 3.3 to 2.6, within 1 point 22% to 26%) and still play all four games. Casual and daredevil barely change. (A first version of the bot starved one game for unsteady followers; that was a bot fault and is fixed in these figures.)
- **The force comes from behavior, not from the Sync.** The bonus is small; what moves evolution is that following a routine means repeating one game and one packet. The cost of not following is small for careful players, who have few faults to lose, so a hidden-path player can ignore it cheaply. For a player short on Sync it costs more.
- **Limits.** One bot design, 300 lives, a bot that sees temper directly, and 1.0's allegiance standing in for Standing. A bot that follows only part of the time was not built.

### Catalogue: what affects temper (1.0 code and docs)

Checked against `src/sim.js`, `src/netrun/run.js`, `src/netrun/anomalies.js` and `docs/CONTENT_CATALOG.md`. In 1.0 these change the stability axis, which 2.0's temper replaces. In 1.0 only the Segfault and the Black ICE shard touch temper directly. In 2.0 the Coolant cell and the Antivirus patch also add +1 (decided).

**Items (nine in 1.0)**

| Item | Effect on temper | How |
|---|---|---|
| Segfault | Direct, strong | +2 faults; -1 each in 1.0. 2.0 proposal: -4 at once and a 60/15/25 chance of 1, 2 or no bugs |
| Black ICE shard | Direct, mild | -1, plus +20 Heat (which can push toward the Heat rows) and street Standing |
| Coolant cell | Direct, mild (decided) | +1 when used, and it vents 50 Heat, which also stops the Heat 85+ and overclocking rows |
| Antivirus patch | Direct, mild (decided) | +1 when used, and it cures or prevents a virus, which avoids the slow PATCH (-1) |
| Corp voucher, Signal booster, Memory shard, Repair kit, Bypass chip | None | A voucher moves corp Standing only; the rest touch other stats |

**Actions and care**

| Source | Effect |
|---|---|
| PATCH | +1 within 30 minutes of a virus, -1 later |
| PURGE | +0.5 (a cache purge or an overflow) |
| Repelling an intrusion | +1 (`attackRepelledStability`) |
| A mini-game leaving Heat above 70 | -0.5 |
| Each fault | -1 (`faultStability`) |
| Overclocked, Heat 65 to 84 | -0.2 an hour (`overclockStabilityPerHour`) |
| Heat 85 or more | -1 an hour |
| In flow | +0.2 an hour in 1.0, +0.5 proposed here |
| Plain awake time | 0 (`uptimeStabilityPerHour`) |
| COMPLY, HIDE, voucher, market purchases | None; Standing only |

**Netrun**

| Source | Effect |
|---|---|
| Disconnect | -1 (it also logs a fault when below the cap, which in 1.0 adds no second -1 here, but in 2.0 would roll a bug) |
| Corrupted sector: REPAIR / SALVAGE | +1 / -1 |
| Overclock rig: PLUG IN | -1, plus Charge +25 and Heat +25 |
| The purge order (the Source only): LEAVE IT | +1, plus Sync +15 |
| Corp honeypot, Stray signal, Echo | None (the honeypot moves Standing only) |
| Market, checkpoint | None (Standing only) |

The debug station anomaly proposed for clearing bugs has no temper effect set.

Two things the catalogue shows. First, almost nothing besides faults, Heat and PATCH and PURGE moves temper, so temper is mostly an echo of how the netling is cared for and how hot it runs. Second, with the Coolant cell and Antivirus patch now at +1, two items raise temper (toward steady) and two lower it (Segfault, Black ICE shard), so a player has a small amount of control in both directions.

### Risks to check

- **Standing resets each life (decided), so the starting state is zero on both tracks.** That removes the worry that a line repeats the same lean, but it has two consequences. First, the hidden form's Standing condition (the tracks within 1 point of each other) is the default state at zero, so that form is a matter of mastering all four games and not taking a side. Second, at the teen check a netling with no clear lead is a tie and is settled by the tie-break rule (a random pick, weighted toward unseen forms). It is the hidden path only if the games are met.
- **Removing the fault cap changes 1.0's death rules.** In 1.0 a life ends by integrity collapse, by neglect (10 care mistakes) or at the end of the life cycle, and Root Access can undo the first two. Without the cap, only integrity collapse and the end of the life cycle remain, and Root Access undoes only the first. Against the committed 1.0 baseline (`tools/baseline/lives.json`, 1000 simulated lives per archetype), the neglect cap ended 4.8% of the casual archetype's lives, 4.2% of the neglectful one's, 1.7% of the worker's and none for the others. The neglectful archetype already died of integrity collapse in 95.8% of its lives. That agrees with the view that the cap rarely matters, but it is simulation, not real players. After the change, those few lives would run on or die of integrity collapse instead, so a balance run is needed.
- **The Segfault item loses its risk.** It adds 2 faults deliberately, and its cost was that faults could end a life. In 2.0 it becomes a temper push with no fatal cost. Its design (or its cost) needs a look. Its name per egg stays in the item table.
- **Netrun faults.** 1.0's netrun adds a care mistake on some disconnects, clamped below the cap. Without a cap that clamp goes, and the mistake becomes a temper nudge.
- **Simulation limits.** The counts are arithmetic from the docs; the Standing, bug, temper and preference numbers come from 1.0's simulator with stand-ins (see `netling2-prototypes/README.md`), not from 2.0.

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
- **Blank:** a person without a SIN, unknown to the system (CP2020). The hidden form, a netling that takes no side (Standing within 1 point).

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

- **Story pages:** shared by every egg. Root Access needs these at minimum (24 Root pages). Cosmetic and other unlocks default to story pages. They keep the 1.0 per-life cap (8 a life). Twelve new ones are drafted, to cover the two extra eggs and the lore they imply; 15 are `late` (see the drafts file).
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
| Items (9) | Rename per egg; Coolant cell and Antivirus patch gain +1 temper, Segfault gains temper -4 and a bug chance (see the catalogue) |
| Wearables (41) and props (8) | Mostly unchanged, if bodies share anchor rows |
| Tints, effects, sounds | Unchanged |
| Shells (15) | 10 unlock by "discover form X" and need rewriting |
| Crests (11) | Full house and Rack mount need new definitions |
| Mini device prop | Condition (own the nine original shells) needs redefining |
| Music (9) | Mostly unchanged; one track or timbre per egg is a possible addition |
| Chatter (52 lines) | 32 rewrite (teen and adult bodies); 20 survive |
| Dex (14 entries) | All rewrite |
| Codex (27 pages in 1.0) | Five reworded (`corp-4`, `corp-5`, `bazaar-1`, `bazaar-4`, `bazaar-5`), `deep-3` unchanged; 2.0 has 39 story pages (24 Root, 15 late) and 18 egg pages (15 form pages, 3 Source pages) |
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

Settled items are listed under Decided. What is still open:

1. **Names for the 27 elder forms** (one per adult, decided) and the teen forms.
2. **Where form pages drop** (the drafts put each egg's pages in its home region and the hidden pages in The Deep); not confirmed.
3. **Purge order details.** Recommended, not confirmed: leave accident or deliberate unsettled, and have NL-0 learn the order was dead only when the player shows it.
4. **Standing:** whether the measured spread (committed players certain early, everyone else random) is the intended feel; whether Standing is also shown to the player as a gap or only as two floors.
5. **Bugs:** the debug station's options and cost, the names of the clearing action per egg (Program: defrag or bugfix), and the ceiling and penalty values once the 2.0 loop exists.
6. **Temper:** a flicker guard at level thresholds, decay per minute or per check-in, whether strong steady should have its own reward, which items beyond Segfault and Black ICE should be retooled.
7. **Care preferences:** whether the steady lock-in that remains for players who never netrun is acceptable; the base-rate difference between steady and unsteady under fixed-order play; wording of the log lines.
8. **Second form names:** Nutri is decided; the other 11 are proposals (Spoof and Mouse swapped, Thrash proposed over Hog), and the corp or street lean each name takes is a guess.
9. **Pages:** the idle and chatter temper hints (flagged for revisiting), the word order and length of the longer drafts, region placement for the egg pages.
10. **UI:** the Dex structure for hints, the floor display of Standing, and how a bug and neglect show; to be revisited once the game decisions are final.
11. **Egg page drop rate** (0.10 per run) and the bug values need retesting in 2.0.

## Not designed yet

The backlog. None of this has been decided or drafted.

- **Sprites:** the three bodies, the neglected look, the temper tells in motion, the flicker guard, how the test and balance tools drive the new forms, and the art itself: the Iron line was prototyped (see [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md)); Program, Wetware and the rest of Iron's 14 forms are not drawn. Forms are authored in full (decided).
- **Per-egg meters and care buttons:** Iron's drift and calibration, Wetware's rejection, and how corrective, adaptive and perfective care map to actions. The abstract drives (Upkeep, Exposure, Reward, Risk) are a proposal only.
- **Baby and teen stages and forms per egg;** the elder stage rules (1.0's Mainframe gating replaced by the `late` flag); Source access rules.
- **Netrun abilities per form,** regions per egg, events per egg, the debug station's options, and the tutorial run per egg.
- **The Rogue egg** beyond the merge idea and its gate.
- **Mini-game modifiers per egg.**
- **Shells, crests and the Mini device prop,** which depended on 1.0 forms.
- **The Source descent's presentation per egg** (read, burned in, dreamed), and how the late-page gating by Root Access interacts with the elder stage.
- **Unlocks for the late pages themselves,** if any.
- **Save format and storage keys for the new app.** Migration from 1.0 saves is not planned.

## Not done

- No 2.0 code exists. The 1.0 code was read for the prototypes only (`src/sim.js`, `src/netrun/run.js`, `tools/balance.mjs`), not for feasibility of the whole design.
- All measured numbers use 1.0's simulator and archetype bots with stand-ins (single signed allegiance for Standing, stability for temper). They are starting values, not results for 2.0.
- No bot follows the preference only part of the time, none adapts its play to bugs, and bugs from netrun faults, Heat from actions, and Standing or anomaly clearing are not modeled.
- No page text has been playtested or read in context. The drafts run longer than 1.0's pages (see the drafts file).
- The page counts and the Root Access arithmetic are from the 1.0 tables, not simulation.
- The Puppet Master details are from memory of the film.
- The dream framing draws on a reading of CP2020's simulated-reality entries (BTL, SimSense, moddy).
- `npm run smoke` was not run (needs Playwright and a browser). Only documents changed in this repository.
