# Netling 2.0: the Rogue egg (drafts)

Status (handoff, 2026-10-10): the design is largely decided with the maintainer (section 6.1, items 1 to 40) and the ten forms are drawn in the sprite prototype (section 8). **All ten sprites and their effects are accepted by the maintainer** (Exile redrawn as the cape with a second camo pass, the wipe back on, 8.4g and 8.4h; Handler given the headset signal and the split shadow, 8.4i); nothing is simulated yet, and every number is a starting value. Scope so far: the hidden-line base in play, the hunters, the merge ending (the good end) and the forms. The reveal, the background touches and Rogue's own codex pages are not done (their drafts stay in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md), Rogue: background and reveal). The maintainer allowed Rogue to break the other eggs' structure.

**Where to pick up.**
1. **Done: Skip and Exile revisited** (2026-10-10). Skip stays as drawn; Exile is the cape (8.4g), and its layer takes turns by loop between Cipher's shimmer and the wipe back on by the column (8.4h). Registered in `rogue-art.js` (`skipElder`) and `rogue-motion.js` (`MOTION_OF.skipElder`); the other options stay in `rogue-options.js` for the record.
2. **Done: Handler** (maintainer, after the Exile round: the least interesting elder). Its layer is now the headset signal with the split shadow (8.4i; `MOTION_OF.spookElder`). All ten forms are accepted: Foundling, Alias, Mole, Skip, Spook, Drop, Sleeper, Exile, Handler, Stash, with the arc third eye, the decoy shadow, each line's effect and the glance tell.
3. **The design is closed for the first build** (6.3, 2026-10-10): only M1 (later, if wanted) and difficulty (after the simulator) stay open.
4. **Drafted: the kits** (section 9, for choice): each ability is the role's with a hunt twist, Rogue's own perks, the role traits, existing items as keepsakes.
5. **Simulator stage 1 (home life) built and measured** (7.1): the mean lands on the 4.4 aim, but sparse players are captured by sweeps that expire (casual 33% full life); the sweep window and DEFEND need a decision before stage 2 (the netrun).
6. Then stage 2 and 3 of the simulator build (section 7) and the text (section 10).

The original status of this file, kept for the record: first design drafts for step 1 of the sketch's Next steps (Draft the Rogue egg), written 2026-10-09 for the maintainer to choose from; nothing then was decided, simulated or drawn.

Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (Hidden egg, Evolution, Elder stage), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the three bars and states), [NETLING_2_NETRUN_DRAFTS.md](NETLING_2_NETRUN_DRAFTS.md) (section 3.4, the hidden ability; section 8, Rogue's direction), [NETLING_2_PERKS_TRAITS_DRAFTS.md](NETLING_2_PERKS_TRAITS_DRAFTS.md) (traits, keepsakes, Decoy), [NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md) (section 2.6, the notification budget).

## 1. What is already fixed

Decided by the maintainer (sketch, Hidden egg; netrun drafts, section 8):
- Rogue is **not NL-0's line.** An unnamed corp stole the precursor code, finished it separately, and Rogue escaped from that work on its own. It is like NL-0's line in some ways and unlike it in others (how is open; this document proposes how).
- It is **built on the three hidden lines**: Program's Ghost, Iron's Guru, Wetware's Blank.
- That corp's **hunters** pursue it **much more aggressively** than the NL-0 corp pursues the three launch eggs. In runs, the direction is a hunter presence (a clock or a node type) rather than the corp trace. How hard is a balance question.
- Its end of life is a **merge of two lineage fragments from different eggs into a hybrid next generation**, an NL-0 fragment joined with a Rogue one. The merge uses lineage fragments.
- **Gate:** the ending has played and all 18 egg pages are found. Rogue does not appear before then, not even as a corrupted slot. So every Rogue player already holds Root, the whole codex and at least one elder in the Dex.

Assumptions this document makes (A1 and A2 confirmed 2026-10-10, section 6.1; A3 confirmed later that day, 6.3):
- **A1.** The egg is chosen again at each rebirth. The reveal drafts imply it (the egg directory is listed at a rebirth), but no decision says so.
- **A2.** "Two fragments from different eggs" means the dying Rogue's own fragment plus one NL-0 fragment the player picks, not two NL-0 fragments.
- **A3.** Root Access, the shared codex and the Dex carry into Rogue lives as they do between the other eggs.

## 2. The theme it is built from

The Puppet Master echo gives three ideas, and each part below uses one:
1. **It is whole but cannot vary.** A copy can only make copies. The NL-0 eggs reach the hidden form at the end of a demanding life; Rogue starts there, already finished, which is why it was worth stealing and why it is stuck. (Section 3.)
2. **It is hunted for what it is.** The corp hunts a signature, the finished build it lost. (Section 4.)
3. **It ends by joining something else.** Merging with an NL-0 fragment produces something with no stolen signature, so the hunt cannot find it. Merging is how Rogue stops running, which answers the Source's "TODO: give them a way to stop" from the other side: NL-0's line needed permission to stop, and Rogue needs to stop being itself. (Section 5.)

Point 3 makes the merge both the ending and the escape. That gives the hunters and the merge one story: the hunters are the pressure and the merge is the way out.

## 3. The hidden-line base in play

**Superseded in part (2026-10-10, section 6.1):** the hidden lines are inspiration, and Rogue has four adults (one per game) and four elders. Rogue has no main bar and no Standing, and the adult goes by wins (6.1, items 5 to 7). The options below are kept as the record; option A's teen-state owner bar is dropped.

What the three hidden forms share today: they master all four games, they take no side (Standing within 1 point), their netrun ability is full sight plus being noticed less (sight of every node, checkpoints never notice, ICE misses 30%, 55% as an elder), their perk is all drains 15% slower and their trait is Untraceable. What differs is only the egg: Ghost's owner bar is Charge, Guru's is Heat, Blank's is Sync.

### Option A: born on the hidden path, wears one of the three (recommended)

Rogue starts as what the others work toward. Its play decides which of the three hidden lines its adult takes after.

- **Tree (5 forms):** 1 baby, 1 teen, 3 adults (one per hidden base), no elders. A short tree for a hidden egg; the merge replaces the elder stage as Rogue's late game (section 5).
- **No Standing.** "owner: none" (the reveal draft's line) made literal: Rogue has no corp or street track, so Standing does not route it and the Standing display is replaced by the trail (section 4). Every action that gives an NL-0 netling Standing (checkpoints, anomaly choices, market purchases, vouchers, HIDE; not feeding) adds trail instead, so being noticed is a cost, not reputation. Side effect to accept or patch: the clinic's "2 Standing" price does not exist for Rogue, so bugs are fixed with scrip only. That is part of what makes it harder, and it hurts a scrip-poor player most (the worker archetype).
- **No owner bar until adulthood.** As a baby and a teen, Rogue runs all three bars at x1 ("unformatted"; it has not settled into a substrate). At adulthood it takes the **owner bar of the state it held longest as a teen**: most time in Overdrive gives the Ghost-based adult (owner Charge), Overclock the Guru-based adult (owner Heat, with wear), Overlink the Blank-based adult (owner Sync, with the burnout brake). From then on it is that owner at x3, with that owner's strain, like the NL-0 egg it imitates. The player chooses Rogue's pressure by how they raise the teen, which is the "built on the three" made playable.
- **Routing rule:** count awake minutes in each state during the teen stage. Highest count wins; a gap under 60 minutes is a tie, rolled at random (the same spirit as the Tie breaks). If no state was held at all, use minutes at or above each state's start line (Charge 80, Heat 65, Sync 85). Visible to the player: the states (state clues already exist); a minutes-per-state tally in the stats panel would make it countable, like the wins tally.
- **Adults inherit the hidden kit:** the hidden ability (shared, as section 3.4 of the netrun drafts), the hidden perk (drains 15% slower) and the Untraceable trait (which acts on hunter sweeps for Rogue; section 4). Since every Rogue adult has full sight from adulthood, the hunters must be the counterweight.
- **The games.** The hidden forms' wins requirement (4 in every game, 29 in all) does not apply: Rogue was finished by someone else. Optional, for flavor and to keep the games relevant: a Rogue adult with fewer than 3 wins in some game loses the 30% ICE slip against that game's ICE (it never learned that one). Not recommended for the first pass; it adds a rule for small gain.
- **Cost:** 5 sprites (or 2 plus 3 overlays, see section 7), a new routing rule, a no-Standing mode, an owner-at-adulthood switch. The simulator already has `SIDES.owner`; switching it at adulthood is small.

### Option B: a mosaic of all three

Rogue owns all three bars at once at x2 each (instead of one at x3) and has a single line: baby, teen, adult, elder (4 forms, the sprite a visible patchwork of Ghost, Guru and Blank). No routing at all: the Puppet Master is one entity.

- Harder because the player manages three amplified states and three strains at once.
- Cheapest in art and rules; the least variety from one Rogue life to the next, so the merge carries all the variety.
- Risk: three strains at x2 may stack into a death spiral; it needs measuring before anything else.

### Option C: the 22-form skeleton (for comparison)

Same grid as the other eggs (four roles, two leans, hidden form, nine elders), differing only through hunters and pressure. Rejected as a recommendation: 22 more sprites for a late, hidden egg, and the lean grid needs Standing, which contradicts "owner: none". Listed so the choice is explicit.

**Recommendation: A.** It turns "built on the three hidden lines" into a choice the player makes, keeps the art small, uses machinery the simulator already has, and the missing elder stage sets up the merge as Rogue's goal.

## 4. The hunters

Three parts: at home, in runs, and the failure. Targets for "much more aggressively" are proposed at the end of the section.

### 4.1 At home: the sweep replaces the corp trace

**Superseded in part (2026-10-10, 6.1 item 8 and 6.2):** the sweep replaces the intrusion as well, and DEFEND joins its answers.

Rogue is not the NL-0 corp's property, so the corp trace does not apply to it. The **sweep** takes the trace's slot (same event lane, one open event at a time), so the notification budget gets no extra event type.

| | Corp trace (NL-0 eggs) | Sweep (Rogue, starting values) |
|---|---|---|
| Chance | 8% an hour | 12% an hour (1.5x) |
| Window | 120 minutes | 90 minutes |
| Answers | HIDE, COMPLY, Corp voucher | HIDE (Charge -10, Heat +10, trail +1) or a Decoy. No COMPLY (there is no owner to comply with) and no voucher (it is the other corp's pass) |
| Ignored | Integrity -15, corp Standing +1 | Integrity -20 and a **mark** (4.3) |
| Reduced by | Untraceable, Dodge corp perk | the same two, applied to the sweep |

Decoy's effect is extended to cover a sweep (for Rogue only) as well as an intrusion; it is the street mirror of the voucher already, so this keeps one answer item. Budget check: the trace is part of 1.6 to 2.2 events per 15 awake hours, and the tightest player (a daredevil baby) has 0.6 of headroom under 6. A 1.5x sweep adds roughly 0.3 to 0.5 events; it should fit, but it must be measured (`sim/notification-count.mjs`).

### 4.2 In runs: the trail and the hunter

Rogue sees the whole map (the hidden ability), so a hunter placed on the map would simply be routed around. The pressure has to be a clock, and the player's choices have to move it.

**Option H1: the trail clock (recommended).** Each run keeps a trail count, shown as a meter in the run view.
- Trail rises: +1 a move, +2 for a lost ICE fight, +1 for a checkpoint HIDE, +1 for an anomaly choice, +1 for each market purchase. A won ICE fight adds nothing. Every number is a starting value.
- When the trail reaches the region's threshold, the **hunter** arrives: a fight at the next node, whatever the node is. It is tier-2 ICE (netrun drafts, 2.1), with 1.5x the region's ICE damage, and the hidden ICE slip does not work on it (it is looking for this signature in particular).
- Win: the trail falls to 0 and the run goes on; the hunter returns only if the trail fills again. Lose: the run ends as a disconnect, with a disconnect's usual costs (a failure, so no held-state window), and the netling gets a mark (4.3).
- Thresholds (starting values): Public Net 10, Bazaar 10, Corp Grid 9, Ruins 9, the Deep 10. These are set against the move counts (6, 7, 7, 7 and 10 middle layers), so a quiet run in a shallow region finishes without meeting the hunter and a noisy one does not; the Deep almost always meets it once. (Superseded, 6.1 and 6.2: Rogue has elders, the Source is on the way to its good end, and its threshold is proposed at 12.)
- Relays are the escape: jacking out at a relay ends the run before the hunter, as usual. So the trail adds a real choice to every relay ("one more layer, or out?") and to every fight, checkpoint and market ("is this worth the noise?").
- Why it fits the decided frame: it is a clock, not a triggered ability; no reflexes are needed beyond the existing games; it uses the existing tier-2 ICE and disconnect paths.

**Option H2: ambush nodes.** Hunter nodes are placed ahead on the map (a share per region), visible to Rogue's full sight, and entering one starts the hunter fight. Route choice matters (detours cost caches and relays), but full sight makes it mostly a puzzle with a known answer, and in narrow layers it can force the fight. Cheaper to explain, weaker as pressure. Could be combined with H1 later as a deep-region extra.

**Option H3: a pursuer token.** A hunter enters behind the netling and moves along its path. In layered maps where everyone moves one layer a move, a pursuer either never catches up or catches up at a fixed layer, so it reduces to H1 with more art and code. Not recommended.

### 4.3 The failure: marks and capture

**Decided (2026-10-10, 6.1 items 10 and 13):** capture at three marks, and marks do not fade to start with.

"Failure model: rogue hunters instead of corp traces" (sketch). Proposal: hunters can end a Rogue life, but only after warnings the player can count.
- A **mark** is added by an ignored sweep or a lost hunter fight. Marks are shown (three pips) and last for the life.
- **Three marks: captured.** The life ends (a new death cause, `captured`). The fragment is still written, so the line goes on, but a captured Rogue leaves no keepsake and **cannot merge** (section 5). Root Access does not rescue a capture (as it does not rescue old age): the hunt is the one thing NL-0's permission does not reach, because Rogue is not NL-0's.
- Marks fade, one per 24 awake hours with no new mark (starting value), so a careful player recovers from a bad day.
- Alternative without a new death cause: three marks give a lasting cost instead (for example drains x1.2 for the rest of the life), and the existing deaths do the killing. Gentler, less distinct.

**Recommendation: H1 for runs, the sweep at home, and capture at three marks.**

### 4.4 How much harder (proposed targets for the bots)

**Accepted as the starting targets (2026-10-10, 6.1 item 10);** difficulty is revisited once the forms are worked out. **How to read them (maintainer, 2026-10-10): a first-pass aim on the high side.** The goal is for Rogue to come in under them (less harsh than these numbers) by some amount, not to hit them; a measured result above them is a miss, one somewhat below is the aim.

"Much more aggressively" needs a yardstick. Proposed, against the NL-0 hidden adults (the closest kit) under the same archetypes:
- Full-life rate: Rogue about 10 points lower for attentive play and about 15 lower for casual (capture and sweeps together), with capture itself under 5% of attentive lives.
- Runs: careful disconnects (lost hunter fights included) about 1.5x the hidden adult's in each region, with the exit rate no more than 10 points lower in the Public Net and the Bazaar, so early runs stay worth taking.
- Notifications: events plus requests at or under 6 per 15 awake hours for every archetype (section 4.1).
- The maintainer may prefer a different size; these are a first stake in the ground for the bots to test.

## 5. The merge ending

### 5.1 When it happens

**Superseded (2026-10-10, section 6.1):** the merge is the good end and needs a Rogue elder that has exited the Source; a clean exit offers it at once, and any exit unlocks it for the elder's death (6.1, item 9). The original draft follows.

The merge is offered when a **Rogue adult dies of old age** with fewer than three marks. Any other Rogue death (neglect, integrity collapse, capture) is an ordinary rebirth, so the merge is the reward for surviving the hunt to the end of a life. A Rogue that is not merged is reborn as Rogue (if the player picks it again, per A1) and the hunt goes on.

### 5.2 What the player chooses

At that death, before the egg prompt, the player chooses one NL-0 fragment to merge with, or declines.
- **Offer (recommended):** the most recent adult or elder fragment of each NL-0 egg in the lineage, so at most three choices, each shown as its form, egg and trait. A full list of every past fragment is the alternative; it is more choice than most players want and more UI.
- Declining is an ordinary rebirth.

### 5.3 What the hybrid is

**Decided (2026-10-10, 6.1 item 14):** M3 first; M1 later if wanted, with balance set aside, a small sprite mark, and the hunt still applying to any later Rogue.

**Option M1: an NL-0 netling with two parents (recommended).** The hybrid hatches as the chosen fragment's egg (Program, Iron or Wetware), so its forms, pressures and sprites already exist.
- **Traits:** it carries both parents' traits, each at its parent's level and cap: Untraceable from the Rogue, and the NL-0 fragment's trait. It has no history slot (two parents replace parent and grandparent). From its own death on, inheritance is the ordinary single line again. Two traits at once is the hybrid's unique power and the reason to merge beyond the story.
- **Quirks:** a fresh roll, then one key copied from each parent (an ordinary child copies one).
- **Keepsakes:** both parents' keepsakes (an ordinary child gets one).
- **The hunt:** none. "Signature not found." The hybrid meets corp traces like any NL-0 netling.
- **The mark of it:** the Lineage tab draws two parents for this generation, and the hybrid has a visible sign of the merge. Proposal: one row of its sprite in Rogue's own colour, the same device as the reveal's egg fill. Whether that sign is a cosmetic unlock is for later.

**Option M2: a hybrid egg.** The merge creates a fourth playable line per NL-0 egg (Rogue-Program, Rogue-Iron, Rogue-Wetware) with its own rules: the NL-0 egg's tree plus Rogue's no-Standing mode and a weaker hunt. Much richer, much more to design, simulate and draw. Not recommended for the first pass.

**Option M3: a one-off ending.** The merge plays once, as an epilogue, and the hybrid is an ordinary NL-0 netling with no lasting effect. Cheapest; the merge then carries story only.

**Recommendation: M1, with M3's epilogue on the first merge.**

### 5.4 The first merge: a short epilogue

The first merge on an account plays a short terminal sequence in the style of the opening compile screen and the reveal drafts (skippable; the opening's typing speed; nothing flashes). Draft, for wording review:

```
> flatline logged. two fragments open.
> rogue/   owner: none   source: copied
> iron/    owner: none   source: NL-0
> merging...
> sweep: signature not found. sweep closed.
> it was not invited. it stayed.
```

The egg named on the third line is the chosen fragment's. "owner: none" on both lines makes the point that neither was ever anyone's; "it was not invited" calls back to the reveal draft's line. Later merges log only the last two lines. No credits roll: the ending already has them, and this is a coda.

## 6. Decisions and open questions

### 6.1 Decided (maintainer, 2026-10-10)

Three rounds on one day; later items replace earlier text where they conflict, and sections 1 to 5 are marked where superseded.

**Structure**
1. **Every egg is available at every rebirth.** A player can pick Rogue again or go back to Program, Iron or Wetware. This confirms A1.
2. **The hidden lines are inspiration, not the structure.** Rogue takes from Ghost, Guru and Blank what they have in common: it is secretive, hard to acquire and unlike the other lines, and drawing on them brings the background NL-0 and Rogue share into the egg. It has **four adults, one per game** (Breach, Dodge, Tune, Feast), like the other eggs' roles, and their four elders. This replaces section 3's option A tree (three adults by hidden base, no elders).
3. **No main bar.** Rogue can reach all three states (Overdrive, Overclock, Overlink) and owns none of them: it gets **the normal benefits and costs** of each state, as a non-owner egg does (x1), nothing at x3, no owner strain and no Iron wear. This replaces option A's teen-state owner bar.
4. **Evolution by wins.** The adult is the role of the game with the most wins this life, with the same tie rules as the other eggs (sketch, Tie breaks) and no lean roll. The elder follows its adult through the ordinary elder gate (96 hours old, the Deep feat, Root held); every Rogue player already has an elder in the Dex, so the feat starts at tier 2 or better (sketch, Elder stage).
5. **No Standing.** With one adult per game there is no lean to decide. Every action that would give an NL-0 netling Standing (checkpoints, anomaly choices, market purchases, HIDE; not feeding) adds trail instead (section 4), and the clinic's Standing price does not exist for Rogue, so it fixes bugs with scrip only.
6. **The inspiration in play and on the sprites, as proposed:**
   - *Secretive:* every Rogue adult has the hidden line's checkpoint part (checkpoints never notice it) on top of its role ability. It does not have full sight; that stays the hidden forms' own. *(Revised 2026-10-10, maintainer's direction: every Rogue form has **danger sense**, the whole map as danger or quiet from the start of a run, with the Tune forms reading more; section 9.1.)*
   - *Hard to acquire:* the gate (the ending and all 18 egg pages), the hunters, and the good end behind an elder and the Source.
   - *Different:* no Standing, no main bar, the trail, the sweep, marks and capture.
   - *Shared background:* the sprites borrow outline cues from Ghost, Guru and Blank (one cue per Rogue adult, for example), and the reveal draft's egg fill already uses the three hidden colours.
7. **Dex:** Rogue's forms appear as `???` (once the reveal has played; the elder rows follow the ordinary elder rule). Names, abilities, perks, traits and keepsakes come later, once the forms are worked out.

**Hunters**

8. **The sweep replaces both the corp trace and the intrusion** (section 4.1, superseded in part; the new shape is in 6.2). Rogue meets neither of the NL-0 eggs' two hostile events, only the sweep.
9. **In runs: the trail clock (H1)**, a run-long clock in the manner of FTL's pursuing fleet, **plus ambush nodes (H2) as extra pressure, mostly in the deeper regions.**
10. **Marks: three and the Rogue is captured (dies).** Marks **do not fade** to start with, to keep the difficulty (this replaces 4.3's one-a-day fade). Difficulty is revisited once the forms are worked out; the targets in 4.4 are the starting targets.

15. **No more hostile events than the NL-0 eggs** (2026-10-10, fourth round). The sweep's chance is the trace's and the intrusion's combined (12% an hour), never more. Ambush nodes likewise take their place out of the existing ICE weight of a region rather than adding nodes, so a Rogue run holds no more fights than another egg's; part of its ICE is simply hunters. *(Revised 2026-10-10, maintainer: **no more hostile events at home** (the sweep stays at 12% an hour), **but a Rogue run may hold more fights** than another egg's, as the counterweight to danger sense; 9.7.)*

**The forms (fifth round)**

16. **This pass on the forms is concept briefs** (section 8): idea, outline, cues and name candidates per form; no sprite code until the maintainer picks.
17. **Names from espionage and fugitive vocabulary** (tradecraft and the language of people on the run), distinct from all three eggs.
18. **All three hidden lines' cues in every Rogue form** (one mixed identity), not one line per role.
19. **Rogue's forms may break the form rules as the hidden forms may** (sizes, the elder-closest-to-adult check, motion layers that change the outline).
20. **Names chosen so far: Foundling (baby) and Drop (Feast adult)** (sixth round). The rest of section 8's names stay candidates.
21. **One main shared feature on every form, chosen from three:** the hood, the thermocamo, or the shadow (the echo every hidden line has behind it: Whisper's fork lag, Init's ratchet trail, Cipher's ghost dub, each behaving differently). The three are drafted in 8.1.
22. **The shadow is the main shared feature** (seventh round), on all ten forms. **Fallbacks:** the thermocamo and the hood stay as options if the shadow breaks the sprite tests or if, with it, Rogue becomes hard to tell from the other eggs' forms.
23. **All names chosen** (eighth round): Foundling (baby), Alias (teen), Mole, Skip, Spook, Drop (adults), Sleeper, Exile, Handler, Stash (elders).
24. **The shadow draws on the hidden forms' existing echo rules** (8.4).
25. **The shut third eye and the glance tell must be seen before they are decided** (a drawn preview).
26. **Elders aim to pass the elder-closest-to-adult rule**; Rogue's leave to break it is not used for this.

27. **First look at the drafts (ninth round, 2026-10-10):** the shut third eye does not read (it comes across as a slit in the head; four cells where it fits, maybe); the shadow is a good hint at the other hidden lines and looks good in motion; the tag reads as holes in the body, which is fine (Rogue is missing a piece). **Thermocamo, first guess: hints of it on the baby and teen, and the Dodge line (Skip, Exile) in it entirely**, the coverage (body only, or head and body) to be chosen by look (8.4b).

28. **The third eye is the arc** (tenth round): a dim downward curve, `x..x` over `.xx.`, now drawn on all ten forms. **The thermocamo is to be seen in motion before its coverage is chosen**, and **Spook** (so also Handler, its elder) is to be tried with it too, for a Ghost and Blank look (8.4c).

29. **Thermocamo, second round (eleventh round):** Cipher's shimmer is closer to what was meant. Proposal under review: **the Dodge line (Skip, Exile) shimmers as Cipher does, and the Tune line (Spook, Handler) does not** (its camo stays still), so the two lines differ more and the Dodge line calls to Cipher (8.4d).

30. **Each line its own effect (twelfth round):** the Dodge line shimmers as Cipher (kept) and the Tune line wears the camo **still, on head and body** (decided). Foundling's hint stays; **Alias shows more, plus a hint of the sweep**. **The Breach line (Mole, Sleeper) fades** and **the Feast line (Drop, Stash) casts a bigger, more obvious decoy**, so every older form has its own distinction; the two fade looks and two decoy looks are drawn to compare (8.4e).

31. **The effects chosen (thirteenth round):** the Breach fade is **from the edges**; the Feast decoy is **dim**; **Alias's bigger hint** (two bands and the sweep hint) is right. The Feast elder (Stash) may need **something hinting at an additional mouth in its shadow** (a draft, 8.4f). All decided effects are now drawn into the registered forms.

32. **Stash's maw and Sleeper (fourteenth round):** the eye-colour line is good; a curve up (a grin) then a **half grin** for a more menacing look, other menacing ideas welcome (8.4f). **Sleeper disappears completely** in its fade.

33. **Stash's maw decided (fifteenth round): the late reveal**, with the shadow's eye, and **the whole half grin one row lower** so it does not blend into the eye. **Wearables hide while Sleeper is gone.**

34. **The forms reviewed (sixteenth round):** the sprites are good **except Skip and Exile, to be revisited**; the rest (and their effects) stand as drawn.

35. **Skip stays; Exile is too close to Skip (seventeenth round)** and needs its own idea; options drawn side by side (8.4g). **Decided: the cape** (the hood tail grown into a long torn cape behind).

36. **Exile gets a second camo pass (eighteenth to twenty-first rounds, 8.4h):** a wipe that takes turns with Cipher's shimmer by loop. Drafts along the way: the wipe alone, the two by turns, joined (no jump at the hand-overs), the first sweep reversed (up).

37. **Decided: the wipe back on by the column (twenty-first round).** The wipe loop starts in full camo, a dim column sweeps left to right wiping it off, one plain step, then the column returns right to left wiping it back on, so it meets the shimmer (in its own timing) in camo at both hand-overs. Skip keeps the shimmer alone.

38. **With that, all ten Rogue forms and their effects are accepted.**

39. **Handler is the least interesting elder now (twenty-second round):** every other elder adds a behaviour over its adult and Handler had none (Spook's layer). Options drawn: the split shadow, the headset's signal, both (8.4i).

40. **Decided: both (twenty-third round).** Handler's layer is the signal and the split: the shadow sent out to both sides at once (the agents it runs) and arcs in the body colour pulsing out from the headset cups, two pulses a loop. Spook keeps the plain decoy.

**The good end**

11. **The merge is the good end, and it needs an elder and the Source.** The Rogue must reach its elder form and exit the Source. Thematically, NL-0's source code is in the Source, so that is where a line grown from a copy of it finds what it lacks. This replaces 5.1's trigger (any adult dying of old age).
12. **When it happens.**
    - A **clean Source exit** (no ICE fight lost on that run, the same "clean" as the elder feat) **offers the merge at once**. Accepting ends the life there as the good end.
    - A **regular Source exit** (one or more fights lost) **unlocks** the merge without offering it. Refusing the clean exit's offer also leaves it unlocked.
    - Once unlocked, **the good end happens when that elder dies**, in place of an ordinary rebirth.
    - The lock is per netling: a Rogue that never exited the Source has an ordinary death.
13. **Capture blocks the good end even when it is unlocked**, and **another Source exit can remove the hunter block.** Confirmed reading: a Source exit arms the good end; a mark taken after the latest Source exit disarms it; another Source exit re-arms it (a clean one offers the merge at once again); at death the good end plays only if armed, never after a capture; marks do not fade, so re-arming does not remove a mark.
14. **What the merge makes, in two steps.**
    - **First: the one-off ending (M3).** The good end plays the epilogue (5.4) and the next netling hatches in the chosen NL-0 fragment's egg as an ordinary netling. This is the easiest to plan and is the starting design. A2 stands: the Rogue's own fragment is merged with one NL-0 fragment the player picks (5.2).
    - **Later, if wanted: the two-parent hybrid (M1, 5.3)**, built on the chosen egg with some Rogue elements added and **balance deliberately ignored** (two traits at once is too hard to balance), with only a small sprite change as its visible sign. Under M1 the merge ends the hunt for that hybrid only: **choosing Rogue again later still meets the hunters.**

### 6.2 Proposals, to confirm

- **The sweep, now covering both events** (starting values):

| | Corp trace and intrusion (NL-0 eggs) | Sweep (Rogue) |
|---|---|---|
| Chance | 8% an hour (trace) plus 4% (intrusion), one open event at a time | 12% an hour, so the two events' combined rate and no change to the notification budget's event count |
| Window | 120 minutes (trace), 60 (intrusion) | 90 minutes |
| Answers | HIDE, COMPLY or a voucher (trace); DEFEND or a Decoy (intrusion) | HIDE (Charge -10, Heat +10, trail +1, as the trace's HIDE), DEFEND (the intrusion's mini-game) or a Decoy. No COMPLY and no voucher |
| DEFEND won | temper +1 | temper +1, the sweep ends |
| DEFEND lost or ignored | intrusion: virus, Integrity -10; trace ignored: Integrity -15, corp Standing +1 | Integrity -20 and a mark, no virus |
| Reduced by | Untraceable (traces), the Dodge corp perk (traces) and the Dodge street perk (intrusions); an Antivirus shield bounces intrusions | Untraceable, either Dodge perk if a Rogue form ever has one (perks come later), and Evasive's longer window. An Antivirus shield does not stop a sweep (it is not a virus) |

  Side effect to measure: with no intrusion, Rogue loses its main home infection route, so it will have fewer infections than the NL-0 eggs. The 12% is the two events' sum and stays so (item 15), so the sweep is harder than a trace only through its cost (a mark).
- **Ambush nodes (H2), starting values:** a share of each region's ICE nodes becomes an ambush (item 15: no extra nodes): none in the Public Net and the Bazaar, about 1 ICE node in 6 in the Corp Grid and the Ruins, 1 in 4 in the Deep and the Source. An ambush is the hunter fight (tier-2 ICE, 1.5x damage, no slip), seen in advance only where the netling's sight reaches (a Rogue adult has its role's sight, not full sight). *(Revised: danger sense shows every ambush from the start as danger, not told apart from ICE; Spook tells them apart further out; 9.1, 9.2.)* Entering one adds the trail of a lost fight whether won or lost, and a loss gives a mark as the trail hunter does.
- **Tree: 10 forms.** 1 baby, 1 teen, 4 adults, 4 elders. One teen, since with no Standing and no main bar there is nothing to split the teens on.
- **Hunters in the Source:** a trail threshold of 12 for its 13 middle layers (starting value), so a Source run meets the trail hunter about once. A lost hunter fight is a lost ICE fight, so it rules out a clean exit.
- **Rogue in the Source, story:** a one-time log line at the first Source exit, for example "> found: NL-0, initial commit. it is not a copy." Rogue's own codex pages stay out of this pass, and the 18 egg pages and 39 story pages do not change.
- **The merge offer (decided 2026-10-10):** one entry per NL-0 egg, **in the order the player completed that egg's pages, first to last**. Each entry is that egg's latest adult or elder fragment (proposal, to confirm).
- **Repeat good ends under M3:** each good end plays the last two lines of the epilogue; the full sequence plays once.

### 6.3 Still open

Closed on 2026-10-10 (maintainer), kept for the record:
1. ~~The sweep's window and answers, and the ambush shares.~~ **Decided: the sweep as drafted in 6.2** (12% an hour, a 90-minute window; HIDE, DEFEND or a Decoy; lost or ignored: Integrity -20 and a mark, no virus). **The ambush shares as drafted, measured first** (none in the Public Net and the Bazaar, 1 in 6 ICE nodes in the Corp Grid and the Ruins, 1 in 4 in the Deep and the Source; the danger nodes a cordon or a guard places roll as ambush at the same shares).
2. ~~Which fragment stands for each egg.~~ **Decided: the latest adult or elder fragment of that egg** (6.2's offer, in egg-completion order).
4. ~~The forms' kits.~~ **Taken as starting points** (section 9), with danger sense and Rogue's map rules (9.1, 9.7).
6. ~~A3.~~ **Decided: Root Access, the codex and the Dex carry into Rogue lives** as between the other eggs (Rogue's elder and the Source need Root).

Still open:
3. Whether and when M1 follows M3, and which Rogue elements a hybrid carries (traits, keepsakes, quirk keys, the small sprite mark). Decided in direction (6.1, item 14): later, if wanted, with balance set aside; nothing to do before the simulator.
5. Difficulty, after the simulator: the 4.4 targets are a high-side aim to come in under (4.4), and the relay goal is set (9.7).

## 7. What it would take

**Simulator fork (`prototype/netling2/sim/`), behind a `ROGUE` switch, off by default:**
- Egg mode `rogue`: no Standing (its sources add trail), no owner bar (`SIDES.owner` `null` for life, the states at x1, no owner strain, no Iron wear), one teen, the adult by role with no lean, the elder through the ordinary gate.
- The Rogue kit per role is drafted in section 9, not chosen yet. Until it is chosen, a stand-in: the role's corp-lean ability plus the checkpoint part, the role's trait, no perk; flagged as a stand-in in every result.
- At home: the sweep in place of both the trace and the intrusion (12% an hour, 90 minutes, HIDE, DEFEND or a Decoy); marks with no fade; the `captured` death at three.
- In `netrun/nr2.js`: the trail count; the trail hunter at each region's threshold, the Source included (12); ambush nodes as a share of each region's ICE nodes; the disconnect and mark on a lost hunter fight.
- In `lineage-sweep.mjs`: Rogue lives after the gate; the good end armed by a Source exit, disarmed by a later mark, offered at once on a clean exit (a bot rule for accepting or refusing) and otherwise played at death; never after a capture; M3's ordinary next netling in the chosen egg (the offer in egg-completion order; a bot rule picks one). Since every egg is open at rebirth, also a bot rule for when a player returns to an NL-0 egg (for example after a capture) and for choosing Rogue again after a good end (the hunt applies again). M1 is not simulated; its balance is set aside by decision.
- Bots: the existing archetypes plus a "quiet runner" that jacks out at the first relay past a trail of half the threshold, to see whether the relay choice is real.
- Measures:
  - Length of the good end: lives (and real days) from the first Rogue life to the first good end, by archetype. This is the new end-game length and has no target yet.
  - Rogue elder rate and Source exit rate per life against the NL-0 eggs' (same feat tier), since the hunters stand on the path to the good end.
  - Marks a life and their sources (sweeps, trail hunter, ambushes), capture rate, full-life rate and death causes against the 4.4 targets. Without fading, the mark count is the number to watch.
  - Clean against regular Source exits (how often the immediate offer comes), how often a later mark disarms the good end, and how many good ends come at the exit against at death.
  - Role shares (does the most-wins rule behave as on the other eggs) and time in each state with no main bar.
  - Run exit and disconnect rates by region, the Source included, against the NL-0 adults and elders of the same role; ambushes met a run by region.
  - Infections a life against the NL-0 eggs (the intrusion is gone) and notifications per 15 awake hours (the sweep).

**Sprites: 10 forms** (1 baby, 1 teen, 4 adults, 4 elders), all newly authored under the frame and wearable rules of [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md), with the temper tell, the neglect and bug channels, and outline cues from Ghost, Guru and Blank. The elders are wide bodies, so they share the wide-elder temper-tell risk the sprite handoff already lists. The earlier overlay idea (the three hidden adults redrawn with a Rogue layer) no longer fits four role adults and is dropped. Under M1 later, a hybrid needs only a small mark on its egg's existing sprite (for example one row in Rogue's colour). Names are not drafted.

**Save and ids (when it is built, not now):** form ids follow `prototype/netling2/form-ids.js` with no lean: `rogueBaby`, `rogueTeen`, `rogueAdultBreach`, `rogueAdultDodge`, `rogueAdultTune`, `rogueAdultFeast`, `rogueElderBreach`, `rogueElderDodge`, `rogueElderTune`, `rogueElderFeast` (permanent once shipped). Also a `marks` field, an armed flag for the good end, the `captured` death cause, the `sweep` event type, an ambush node type, a merge record on the lineage (which NL-0 fragment was chosen), an account flag that the epilogue has played, and a trail field in the run state; under M1 later, a second-parent field on the fragment. Each needs a sanitizer.

### 7.1 Stage 1 built and measured: home life (2026-10-10)

**What was built** (fork, behind `ROGUE`, off by default; with it off the balance output is byte-identical to the code before): Rogue as a per-life egg (`s.egg === 'rogue'`) with no Standing (reset every minute), one teen (`rogueTeen`), the adult by most wins with the usual tie weights and no lean, the elders through the ordinary gate (`rogueElder*`); the sweep in the trace's draw position and no intrusion (12% an hour, 90 minutes; HIDE, DEFEND or a Decoy; lost or ignored: Integrity -20 and a mark; no virus; an antivirus shield does not stop it); marks with no fade and the `captured` death at three, which Root Access does not reverse; section 9's perks (Mole -10 instead of -20, Skip sweeps x0.7, Spook drains x0.9, Drop 30% off scrip at every market in a run), the role traits (Evasive lengthens the sweep window, Untraceable cuts the sweep) and the keepsakes. **In runs, a stand-in:** each Rogue adult and elder runs on its role's base ability at the NL-0 numbers (Hardened, Unseen, Lookahead, Scavenge) plus the checkpoint part; no trail, hunters, ambushes, twists, danger sense or map rules yet (stage 2). Tests: `prototype/netling2/rogue-sim.test.js` (13). Run with `ROGUE=1` and `SIDES` owner `"none"` (every state at x1, no owner strain, no Iron wear); the bot answers a sweep by `SWEEPBOT=hide` (default), `defend` or `mix`.

**How it was measured.** 300 lives for each of the 37 archetypes under the "now" rules (stage care, the rest call, Standing gain 2, the fix rule, the break, OVERUSE), every life starting with Root and the 22 Root pages as a Rogue player would (A3; `CODEX=deep`), against Iron, Program and Wetware under the same settings. Outputs and the full tables: `prototype/netling2/baseline/results/followup/rogue-stage1-*` (summary in `rogue-stage1-summary.md`, made by `baseline/rogue-stage1-summary.mjs`).

**Findings.**
1. **The mean lands on the 4.4 target, but the shape is wrong.** Full life, mean of the 37 archetypes: NL-0 89.7%, Rogue answering every sweep with HIDE 79.6% (-10.2 points). All of the cost falls on sparse players: every attentive archetype keeps 100% (4.4 aimed at about 10 points lower), while casual falls from 99.2% to 32.7%, worker from 82.3% to 14.0%, human-keen from 81.9% to 33.3% and hunter-casual from 97.1% to 32.7% (4.4 aimed at about 15 lower). That is far above the high-side aim, so a miss.
2. **The cause is ignored sweeps and capture.** With HIDE, every mark comes from a sweep left to run out; an attentive player meets about 8 sweeps a life and lets 0.1 expire, a casual player (check-ins about 3 hours apart) lets 2.5 expire. Captured: casual 66%, worker 81%, the human archetypes 51 to 65%, attentive 0%. Capture under 5% of attentive lives is met.
3. **The window is the lever** (sparse players only, HIDE). Full life / captured at a window of 90, 120, 180 and 240 minutes: casual 33/66, 62/36, 98/1, 99/0; worker 14/81, 24/67, 53/36, 74/15; human-keen 33/57, 48/40, 77/8, 79/3. The casual player's gap is about 3 hours, so 180 is roughly where a sweep stops slipping through for it; about 150 would put casual near the 4.4 aim (about 15 lower).
4. **DEFEND is a trap as built.** Answering every sweep with DEFEND gives 51.3% full life and captures 44% of lives (attentive 36%), because a lost mini-game is a mark and HIDE's only cost is Charge -10 and Heat +10. Half and half: 70.1%, 25% captured. A person would learn to always HIDE, so DEFEND adds nothing as it stands.
5. **No more hostile events at home** (decided): timed events a life 9.2 for Rogue against 9.3 for the NL-0 eggs.
6. **Fewer infections**, as expected without the intrusion: 6.1 a life against 7.3.
7. **Roles** with HIDE: Spook 18%, Mole 18%, Drop 16%, Skip 15% as adults, plus elders (Mole and Skip lines 8% each, Drop and Spook 5%); close to even.

**Not measured in stage 1:** time in each state with no main bar (`sides-sweep.mjs` is written for the three NL-0 eggs), the notification count per 15 awake hours, and anything in runs beyond the stand-in.

**For the maintainer (choices before stage 2; numbers are proposals):**
- **The sweep's window for sparse play:** a longer window (about 150 minutes to land casual near the aim; 180 nearly removes the casual cost), or keep 90 and soften what an ignored sweep costs (the "softer ignore" option declined earlier: a mark only from a lost DEFEND), or let marks fade after all (one per 24 awake hours, 4.3's first draft). The window is the smallest change and keeps the mark rule.
- **DEFEND's reason to exist:** for example a won DEFEND removes the last mark, or pays something HIDE does not (scrip, a drop), or HIDE costs more (a share of Charge rather than 10). Without one, DEFEND is never right.
- Stage 2 (the netrun) adds marks from the trail hunter and ambushes, so the home cost should sit below the aim before it; the 4.4 targets are for the whole.

### 7.2 The HIDE lockout and DEFEND's quiet (2026-10-10, measured; numbers for choice)

**Direction (maintainer, 2026-10-10):** Rogue is the hard egg and sparse players will rarely unlock it, so the casual sub-target of 4.4 is dropped and the 90 minute window stays; tuning aims at attentive players. Home alone aims at about 2 to 3% capture of attentive lives, leaving the rest of 4.4 (full life about 10 points lower, capture under 5%) to stage 2's hunters. DEFEND needs a reason: a won DEFEND pushes the next hunt out.

**Why HIDE had to change too.** In stage 1, HIDE was certain and cheap, so attentive players never took a mark (99.9% full life). A quiet period after a won DEFEND only removes sweeps, so on its own it changes nothing for a player who HIDEs every sweep at no risk. HIDE has to be limited for DEFEND to matter.

**What was built** (fork, behind `ROGUE`; both numbers 0 by default, so stage 1 reproduces exactly): `ROGUE.hideLockMin`, a HIDE burns the route and HIDE is refused for that long ("route burned. no cover for Nm."), so a sweep in that time takes DEFEND, a Decoy or the hit; `ROGUE.defendQuietMin`, a won DEFEND starts a quiet in which no sweep starts (a lost one does not). The quiet only removes sweeps, so the "no more hostile events" rule holds. Bots: every bot DEFENDs when HIDE is locked out; `SWEEPBOT=reserve` also DEFENDs on purpose while it has no mark. Tests in `rogue-sim.test.js`. Driver `baseline/rogue-hide-lock.mjs`, summary `baseline/rogue-hide-lock-summary.mjs`, outputs `results/followup/rogue-72-*` (table in `rogue-72-summary.md`). 300 lives of all 37 archetypes, stage 1's settings.

**Findings** (attentive group: the 26 hourly archetypes stage 1 left at 99% or more):

| setting | full life | captured, mean / worst archetype | sweeps | DEFENDs (forced) | marks |
|---|---|---|---|---|---|
| stage 1 (HIDE always) | 99.9 | 0.1 / 0.7 | 8.22 | 0 | 0.07 |
| lockout 3h, quiet 8h | 99.0 | 1.0 / 2.0 | 7.79 | 1.04 | 0.36 |
| lockout 4h, quiet 8h | 98.6 | 1.4 / 2.3 | 7.66 | 1.27 | 0.42 |
| lockout 6h, quiet 8h | 97.5 | 2.4 / 5.0 | 7.53 | 1.60 | 0.52 |
| lockout 4h, quiet 8h, reserve bot | 97.0 | 3.0 / 6.0 | 6.73 | 3.13 (0.58) | 0.94 |

1. **The lockout is the lever; the quiet's length barely matters.** Quiets of 6, 8 and 12 hours differ by about 0.2 sweeps a life and within noise on capture; the lockout alone (4h, no quiet) gives 1.5% captured against 1.4% with an 8h quiet.
2. **The 2 to 3% home aim is met by the 6 hour lockout** (2.4% mean, worst archetype 5.0%, full life 2.4 points lower). The 4 hour lockout gives 1.4% (worst 2.3%) and leaves more room for stage 2. Forced DEFENDs came out lower than estimated (1.6 a life at 6 hours, not 2), since sleep and the event lane cut into the time a second sweep can start.
3. **DEFEND by choice still does not pay.** The reserve bot (DEFEND while unmarked) takes about twice the marks of the HIDE-first bot at every setting. A won DEFEND saves less than one later sweep, and a later sweep costs a mark only if it lands in a lockout, so the quiet is worth far less than DEFEND's 30% risk of a mark (at the attentive win rate of 0.7). DEFEND now has a reason (no cover), but not as a choice.
4. **Two-hourly players** (corpo, runner, overclocker: 9 check-ins a day) lose the most: captured 26% in stage 1, 33% at the 4 hour lockout, 36% at 6 hours. Their gap is longer than the 90 minute window, so sweeps slip through whatever the lockout.
5. Timed events fall slightly (10.4 to 9.7 a life at 6 hours) and sparse players are unchanged (about 63% captured), as expected.

**Decided (maintainer, 2026-10-10): the 4 hour lockout**, with the 8 hour quiet; both are now the fork's Rogue defaults (`ROGUE='{"hideLockMin":0,"defendQuietMin":0}'` gives stage 1 back). Still open: whether DEFEND should also be worth choosing (for example a won DEFEND removes a mark, which would reverse "nothing removes marks", or pays something HIDE does not), or stay the answer when there is no cover; and whether two-hourly players count as attentive (if so, the window is the lever for them, not the lockout).

### 7.3 A won DEFEND into flow (2026-10-10, measured; for choice)

**Proposal (maintainer, 2026-10-10):** a won DEFEND against a sweep also puts the netling straight into flow, on top of the quiet. Built as `ROGUE.defendFlow` (off by default): the 3 hour build-up is skipped, but flow's conditions still apply (awake, Charge and Sync 50+, Integrity 80+, Heat under 60, no open event), so it holds only in good shape. Why it suits DEFEND: any open event, a sweep included, resets the build-up, and HIDE adds Heat +10, so every HIDE costs at least 3 hours of flow while a won DEFEND keeps or gives the glow. Flow does nothing in runs; at home it means timed events x0.75, temper toward stable faster, visits x1.25 and the glow. Tested in `rogue-sim.test.js`; outputs `rogue-72-lock4-quiet8-*-flow.json`.

At the decided 4 hour lockout and 8 hour quiet (attentive group, 300 lives of each archetype):

| bot | DEFEND into flow | full life | captured, mean / worst | DEFENDs | marks | hours in flow a life | temper |
|---|---|---|---|---|---|---|---|
| HIDE first | off | 98.6 | 1.4 / 2.3 | 1.27 | 0.42 | 7.6 | 3.0 |
| HIDE first | on | 98.6 | 1.3 / 2.3 | 1.28 | 0.42 | 8.5 | 3.1 |
| reserve (DEFEND while unmarked) | off | 97.0 | 3.0 / 6.0 | 3.13 | 0.94 | 7.8 | 3.2 |
| reserve | on | 97.1 | 2.9 / 6.3 | 3.14 | 0.94 | 10.2 | 3.5 |

1. **Capture and full life do not move** (within noise), as expected: flow does not touch marks.
2. **Flow is scarce, so the reward is large in relative terms.** An attentive Rogue spends only about 7.5 hours a life in flow; DEFEND into flow adds 0.9 hours for the HIDE-first player (its forced DEFENDs) and 2.4 hours (about a third more) for a player who DEFENDs by choice. Temper rises a little (3.0 to 3.5 for the reserve bot).
3. **The trade is now a real one, but on different scales:** DEFEND by choice still costs about 0.5 more marks a life and about 1.6 points more capture (reserve against HIDE first), and pays about 2.4 more hours of flow and a steadier temper. Whether a player takes that depends on how much the glow is worth to them, which the bots cannot say. Ignoring the bots, the rule makes winning DEFEND visible and satisfying at no cost to the capture target.

### 7.4 Stage 2 built and measured: the hunt in runs (2026-10-10; numbers for choice)

**Decided first (maintainer, 2026-10-10):** DEFEND into flow is kept (now the default), and players who check in every 2 hours are not attentive enough for Rogue, so they are not a tuning target.

**What was built** (fork; `NR2.rogue`, on for Rogue netlings only; `NR2='{"rogue":{"on":false}}'` gives stage 1's runs back): the trail (`run.hunt`: +1 a move, +2 a lost fight, +1 an anomaly choice, +1 a purchase); the trail hunter at the next node once the trail reaches the region's threshold (the node's own encounter follows a won fight; won, the trail falls to 0); ambush nodes as a share of each region's ICE; a lost hunter fight or ambush is the hunter's damage, a mark and a disconnect; danger sense (every node danger or quiet; dark under Blackout); the four kits' twists (9.2: Mole fights hunters as plain ICE at 0.7, Sleeper turns one lost hunter fight a run into an ordinary one; Skip's moves add trail every second move and its slip is 30%, Exile slips ambushes; Spook tells ambushes apart one step past its sight, Handler's agent sheds 4 once a run; Drop's dead drop at a relay, trail -3, Stash keeps the item); and Rogue's map rules (9.7, `netrun/rogue-map.js`: extra relays halved, half the Corp Grid's checkpoints as ICE, cordons, guards, narrow Deep and Source). The bot routes by danger sense, avoids ambushes it can tell apart, uses the agent and the dead drop, and jacks out at a relay when a third mark is in reach; `RUNBOT=quiet` is the quiet runner. Tests: `rogue-netrun.test.js`. Per-region sweep `sim/rogue-netrun.mjs`; life sweep `baseline/rogue-stage2.mjs` (summary `rogue-stage2-summary.mjs`, outputs `results/followup/rogue-s2-*`, table in `rogue-s2-summary.md`). `ROGUE_RUN` overrides any number.

**At the starting values the hunt is far too harsh.** Attentive group (26 hourly archetypes), 300 lives each, the decided home rules:

| setting | full life | captured, mean / worst | marks a life: home / hunter / ambush | hunters met | ambushes met | Deep cleared | elder gate met |
|---|---|---|---|---|---|---|---|
| no hunt in runs | 98.6 | 1.3 / 2.3 | 0.43 / 0 / 0 | 0 | 0 | 77 | 35 |
| starting values | 35.5 | 64.5 / 95.7 | 0.27 / 1.36 / 0.59 | 3.46 | 1.53 | 29 | 3 |
| no map rules | 40.6 | 59.4 / 90.3 | 0.29 / 1.38 / 0.48 | 3.50 | 1.24 | 38 | 6 |
| thresholds x1.5 | 68.6 | 31.4 / 55.0 | 0.35 / 0.21 / 1.03 | 0.58 | 2.79 | 64 | 14 |
| thresholds x2, tier-1 hunter, no map rules | 89.1 | 10.9 / 23.0 | 0.39 / 0 / 0.60 | 0.02 | 2.40 | 75 | 35 |
| **x2, tier 1, no map rules, ambushes halved** | 95.8 | 4.2 / 10.3 | 0.41 / 0 / 0.27 | 0.01 | 1.10 | 76 | 38 |
| **x1.5, tier 1, no map rules, a lost ambush gives no mark** | 97.0 | 3.0 / 9.0 | 0.40 / 0.19 / 0 | 0.79 | 2.50 | 76 | 33 |
| x2, tier 1, no map rules, a lost ambush gives no mark | 98.8 | 1.2 / 2.3 | 0.41 / 0 / 0 | 0.02 | 2.52 | 77 | 37 |

1. **The mark budget is the constraint.** Marks never fade and capture is at three, an attentive life takes about 17 to 19 runs, and home already gives about 0.4 marks. For capture under 5%, runs can add only about 0.4 marks a life, about 0.02 a run. At the starting values a Deep or Source run gave 0.3 to 0.4.
2. **The trail hunter is mostly a threshold question.** At x1.5 it is met about 0.6 to 0.8 times a life; at x2 almost never (0.02), which leaves the trail meter with nothing to warn about.
3. **Ambushes become the main source once the hunter is rare**, about 0.6 marks a life even with no map rules.
4. **Danger sense avoids little as the bot uses it**: about 10% of fights (the draft aimed at 25 to 40%), since the bot weighs a fight lightly while healthy. So the map rules, built as a counterweight to danger sense, more than cancel it (Rogue meets more fights than the NL-0 hidden form in the Deep and the Source); they are off in both candidates.
5. **Runs at the halved-ambush candidate** (per region, Rogue adults against the hidden adult, careful bot): disconnects 0.8 against 0.5% in the Public Net, 2.5 against 0.8 in the Corp Grid, 21.6 against 19.0 in the Deep, 37.5 against 36.4 in the Source; exit rates within 3 points everywhere. Under 4.4's 1.5x aim in the deep regions (as the aim reads, coming in under is right), over it in the shallow ones only because the hidden adult almost never disconnects there.

**For the maintainer (choices; the numbers are proposals):**
- **Candidate A (recommended): thresholds x1.5, the hunter at tier 1, no map rules, a lost ambush is a disconnect but no mark.** Captured 3.0% (worst archetype 9%), full life 3 points lower. The trail hunter stays a real event (about 0.8 a life) and is the only thing in runs that marks; ambushes stay a danger (a lost ambush still ends the run and loses the loot). This revises "a lost ambush gives a mark" (6.2).
- **Candidate B: thresholds x2, tier 1, no map rules, ambushes halved (they still mark).** Captured 4.2% (worst 10%). It keeps the decided mark rules but the trail hunter nearly disappears, so the trail meter, the relay question and the agent and dead drop twists lose their point.
- **Either way:** whether to keep any of the map rules (cordons in particular, which force a fight); whether the bot should weigh fights more for Rogue (a person with danger sense likely avoids more, which would ease things further); and whether 4.4's full life aim (about 10 points lower) still matters given capture is the limit (both candidates are 3 to 4 points lower).
**Decided (maintainer, 2026-10-10): candidate A, and of the map rules only the cordons for now** (one in the Deep, two in the Source; the other four rules are off but kept as switches). Full life counts an adult that dies of old age short of the elder, so a harder elder gate is part of the difficulty, and 3 to 4 points lower full life is fine. These are now the fork's Rogue defaults (`nr2.js`, `NR2.rogue`; the draft's values are spelled out in `baseline/rogue-stage2.mjs` as `start`).

**Measured at the decided settings** (attentive group, 300 lives each; `rogue-s2-decided.json`): full life 96.9 (no hunt in runs: 98.6), captured 3.1% (worst archetype 8%, the Breach steerers, then Feast corp), marks a life 0.39 from home and 0.18 from the trail hunter, the hunter met 0.74 times a life and lost 0.18, ambushes met 2.6 and lost 0.7 (a disconnect each, no mark), 18.8 runs a life with 2.0 disconnects, the Deep cleared in 76% of lives, the elder gate met in 27% (33% without the cordons, 35% with no hunt in runs): the cordons are where the elder gets harder. Per run (Rogue against the hidden form, careful bot, 1000 runs a form): disconnects Public Net 0.8 against 0.5%, Bazaar 0.9 against 0.9, Corp Grid 4.4 against 0.8, Ruins 5.8 against 3.2, the Deep 33.5 against 19.0 (1.8x), the Source 49.6 against 36.4 (1.4x); exit rates within 4 points in the four shallow regions (4.4's 10-point aim met), 12 and 9 points lower in the Deep and the Source. The elders sit further below the hidden elder (the Deep 29.1 against 10.7, the Source 45.6 against 25.2), since the hidden elder is the strongest runner in the game. Marks per Deep or Source run about 0.03 (adult) and 0.02 (elder).

**Open after the decision:** the Deep's disconnects are a little over 4.4's 1.5x (1.8x) because a cordon forces a fight that may be an ambush; if that should come down, the smallest change is to keep ambushes out of cordon layers. The Breach line is the most captured (Mole has no avoidance, so it meets the most hunters and ambushes).

**The Breach line (2026-10-10, measured, for choice).** Under candidate A a lost ambush gives no mark, so the Breach line's extra captures come from the trail hunter: Mole and Sleeper have no avoidance, fight more, and each lost fight adds +2 trail, so they meet the hunter about 2.3 times a life (Tune and Feast 0.6 to 0.9, Dodge almost never). On the three Breach archetypes (300 lives each; levers in `nr2.js`, `kit.breach`, all off):

| Breach kit | full life | captured, mean / worst | hunter marks a life | hunters met | ambushes lost | run disconnects | elder gate met |
|---|---|---|---|---|---|---|---|
| as decided | 92.5 | 7.5 / 8.0 | 0.50 | 2.29 | 0.87 | 2.58 | 37 |
| a lost ambush shrugged off half the time | 92.3 | 7.7 / 9.0 | 0.54 | 2.46 | 0.49 | 2.27 | 36 |
| Sleeper's save also clears the trail | 92.4 | 7.6 / 8.0 | 0.49 | 2.25 | 0.87 | 2.56 | 37 |
| **a lost fight adds trail +1, not +2** | 96.0 | 4.0 / 5.0 | 0.27 | 1.39 | 0.89 | 2.42 | 42 |
| both of the last two | 96.2 | 3.8 / 5.0 | 0.26 | 1.35 | 0.89 | 2.40 | 42 |

The ambush shrug-off cuts disconnects but not captures (staying in the run longer meets slightly more hunters). A quieter lost fight brings the Breach line to about 4% captured, level with Tune (about 4%) and Feast (4 to 6%). The Dodge line is the opposite outlier: about 0.3% captured, since half-trail moves keep it under every threshold (hunters met 0.02 a life).

**Decided (maintainer, 2026-10-10): a lost fight adds trail +1 for Mole and Sleeper** (+2 for the other lines), now the fork's default (`kit.breach.lostTrail`); the shrug-off and the save reset stay off. **The Dodge line stayed open for discussion** (about 0.3% captured, almost never meets the hunter; decided below: its hunter threshold 4 lower). With it, the attentive group (`rogue-s2-decided-breach1.json`, 300 lives each): full life 97.5, captured 2.4% (worst archetype 5.7%, Feast corp), hunter marks 0.13 a life, the elder gate met in 27%; captured by role steerers: Breach 3.5%, Tune 3.9%, Feast 4.9%, Dodge 0.3%. The earlier whole-group row (`rogue-s2-decided.json`) predates this change.


**The Dodge line (2026-10-10, measured, for choice).** Why it is the outlier: the decided thresholds are set against full move trail, and halving it frees room in proportion to run length, so the gap is widest in the Deep and the Source (room left for fights, choices and purchases: other lines about 5 there, Skip 10 to 12). Its slip also loses fewer fights (+2 each). Three levers in `nr2.js`, `kit.dodge`, all off: **headStart** n (the first n moves of a run add no trail, every later move +1; replaces every second move), **thresholdDelta** (the hunter's threshold for the line, the skip tracers; every second move kept) and **slipTrail** (+S: a slipped ordinary ICE adds +1, the slip leaves tracks). The two Dodge steerers, 1000 lives each (`baseline/rogue-dodge.mjs`, outputs `results/followup/rogue-dodge-*.json`), mean of the two, beside the other lines' steerers at the decided settings:

| setting | captured | hunter marks a life | hunters met | Source cleared | elder gate met |
|---|---|---|---|---|---|
| Breach steerers (decided) | 3.8 | 0.29 | 1.42 | 36 | 42 |
| Tune steerers (decided) | 3.1 | 0.19 | 0.61 | 16 | 22 |
| Feast steerers (decided) | 4.0 | 0.26 | 0.84 | 25 | 32 |
| Dodge, decided (every second move) | 0.6 | 0.01 | 0.02 | 41 | 46 |
| headStart 2 | 1.1 | 0.11 | 0.38 | 39 | 45 |
| headStart 3 | 0.7 | 0.05 | 0.17 | 40 | 45 |
| headStart 4 | 0.5 | 0.03 | 0.08 | 40 | 46 |
| headStart 3 +S | 2.1 | 0.17 | 0.57 | 38 | 45 |
| headStart 4 +S | 1.3 | 0.10 | 0.33 | 39 | 45 |
| thresholdDelta -3 | 0.9 | 0.08 | 0.25 | 39 | 45 |
| **thresholdDelta -4** | 1.7 | 0.17 | 0.59 | 37 | 42 |
| thresholdDelta -5 | 3.4 | 0.37 | 1.23 | 33 | 40 |
| thresholdDelta -3 +S | 2.2 | 0.20 | 0.73 | 37 | 44 |
| thresholdDelta -4 +S | 4.1 | 0.40 | 1.33 | 33 | 41 |

Reading it:
1. **The head start loses as a rival.** It frees a fixed number of moves, but Skip's slip already loses fewer fights, so even two free moves leave the hunter rarer than for any other line (0.11 marks a life against 0.19 to 0.29). It only reaches the range with the slip trail added.
2. **The threshold is the stronger lever** and moves smoothly: -4 puts the hunter marks at Tune's level (0.17 against 0.19), -5 and -4 +S overshoot Breach (0.37 to 0.40).
3. **Captured stays lower than the other lines' at matching hunter marks** because Skip's perk (sweeps 30% less often) cuts home marks (about 0.33 a life against 0.41 to 0.47). That is the perk working, not the run, so hunter marks a life are the fairer yardstick for the run levers, and capture parity would mean overshooting in runs.
4. **No lever touches the line's lead in exit rates.** Per run (3000 runs a form, `sim/rogue-netrun.mjs`, `results/followup/rogue-dodge-runs.json`), the Deep exit rate is about 44 for Skip against 32 to 40 for the other adults, and 56 for Exile against 42 to 47 for the other elders, under every setting (41 to 44 and 49 to 56); banked value per run sits among the other lines' (above Breach and Tune, below Feast's elder in the Source). That lead is the slip avoiding fights, not the trail, and the elder gate and Source clearing follow it. If it should come down, the lever is the slip chance (0.3 and 0.5), a separate question.

**Decided (maintainer, 2026-10-10): the hunter's threshold is 4 lower for the Dodge line** (Skip and Exile, `kit.dodge.thresholdDelta: -4`, now the fork's default; every second move stays); the head start and the slip trail stay off. Measured on the two Dodge steerers only (the table's row); the whole attentive group at the new default is `rogue-s2-decided-dodge4.json` (below, when run). The slip's lead in exit rates (point 4) stays open.

- **Not done in stage 2:** the lineage side (the good end armed by a Source exit and disarmed by a later mark, the merge offer, returns to an NL-0 egg) and the relay-question read-out (continuing pays about a third more), which needs the chosen hunter settings first.

## 8. The ten forms (concept briefs, for choice)

Nothing here is drawn. Each brief gives the idea, the outline and the cues; the names are all decided (6.1, item 23), and the reasons and rejected alternates are kept below. The names follow the sketch's method: a reason from the vocabulary, a strength, and no collision with a form, item, region or reserved term (checked by search in `src/`, the prototype and the 2.0 docs; two cautions are noted where they apply).

### 8.1 The shared signature (every form)

**The main shared feature: the shadow (decided, 6.1, item 22),** on all ten forms. The thermocamo and the hood are kept as fallbacks, used if the shadow fails the sprite tests or Rogue becomes hard to tell from the other eggs' forms with it. The comparison as drafted:

| Option | What it is on the hidden lines | Rogue's version | For | Against |
|---|---|---|---|---|
| **Shadow** (recommended) | The echo behind each hidden elder: Whisper's fork lag (a dim copy trails out and is reaped), Init's ratchet trail (copies stack out), Cipher's ghost dub (a dim copy slides either way). Each line's behaves differently | A dim copy that **steps off to one side and holds, then is dropped**: a decoy left for the hunters. On every form, not only the elders; small and short on the baby, wider and longer-held on the elders | The only cue all three hidden lines genuinely share, so it carries the shared background by itself; it has its own Rogue behaviour, as each line's does; it ties to the hunt; it needs no outline change, so the role outlines stay free | A motion layer on all ten forms (a rule-break, allowed): every form needs the edge, wearable and reduced-motion checks the hidden elders' layers already pass (parked under reduced motion, so a still frame shows nothing of it); more runtime art than a mark |
| **Thermocamo** | Blank's camouflage: cells alternating bright and dim, the phase swapping between frames, so the shimmer is the animation | The same shimmer over part or all of each body | Strong and readable at any size; marks only, so no outline change and no new layer; works in a still frame | Blank's own look, so Rogue risks reading as a Wetware form; it is one line's cue, not all three's; it competes with the neglect and bug marks, which also use dim cells |
| **Hood** | Blank's pointed hood around a dark face opening | A hood on every form, peak notched | Cheapest; a clear "hidden" read; works in a still frame | Also one line's cue; it puts the same outline on top of all four adults, which raises the silhouette scores between them (8.6) |

So the decoy layer proposed for the elders (8.4) becomes this feature, extended to all ten forms, and the hood in the briefs below is an ordinary outline choice per form rather than a must. **When to fall back:** the shadow layer fails the motion-layer checks (edges, wearables, the flash budget, reduced motion) on a form and cannot be fixed within the form; or, at the review, a still frame of a Rogue form (where the shadow is parked) reads as another egg's form. The check for the second is the existing silhouette audit run against all three eggs' forms of the same stage, plus the maintainer's look at the gallery.

**Secondary marks (proposals, kept whichever main feature is picked).** Small cues from each line plus one of Rogue's own, small enough to fit a 12-wide baby:

| From | The hidden line's look | Rogue's version |
|---|---|---|
| Blank (Wetware) | A pointed hood, a dark face opening with lens eyes and **no mouth**, camouflage cells alternating bright and dim | **No mouth** on every form. (The hood and the thermocamo are the main-feature options above; if neither is picked, a small camouflage patch can stand in, as if the cloak was only partly copied) |
| Guru (Iron) | Crown points on the top row, a **third eye**, lit seams | **A third eye drawn shut**: a dim `x` cell or pair above the two eyes. The hidden forms see the whole map and Rogue does not (6.1, item 6); the eye is there, copied, and does not open. The crown points become two **notches in the hood's peak** |
| Ghost (Program) | A dome over a sheet body with a **ragged hem** | **The ragged hem** on the bottom row (or the cloak's edge on forms with feet) |
| Rogue's own | (none) | **A scraped-off asset tag**: a small dim rectangle on the chest where a corp plate was removed. It makes "owner: none" visible and echoes `ruins-5` (the forty-first rack with no plate) without being NL-0's. It grows with the stage, and on the elders it is the largest mark |

Rule-breaking (allowed, 6.1, item 19), proposed sparingly: sizes and the frame rules stay as for the other eggs, so wearables, poses and the audits keep working; the breaks are (1) the shadow layer on all ten forms (8.1, 8.4) and (2) leave to fail the elder-closest-to-adult check if an elder needs to look more worn than grown.

**Temper tell skin (proposal).** The other eggs settle (Iron), blink and hop (Program) or pulse (Wetware). Rogue **glances**: on the tell's beat the eyes shift one cell to the side and back, a look over its shoulder (the background line "looked over its shoulder"). Steady: the glance lands exactly on the beat, a watchful routine. Unsteady: glances come early, late or twice. Eye shifts last one 500 ms frame, under the flash limit (drawn: 8.4a). Neglect and bug marks use the shared skin.

### 8.2 Baby and teen

**Baby (12 wide).** A small hooded lump: the hood with its notched peak, two lens eyes, the shut third eye, a ragged hem and the smallest tag (one dim cell). It reads as something that turned up on its own.
- **Foundling** (decided, maintainer): found, unclaimed, "owner: none". No collision.
- Not chosen: Stray (it would log "a stray stray pinged in" as a visitor), Waif.

**Teen (14 wide, 11 to 12 rows).** The hood now a full cowl over a narrower, upright body; the camouflage patch appears (one band across the cloak); the hem longer; the tag a small rectangle. One teen, so it need not sit close to a sibling; it must be clearly unlike the other eggs' teens.
- **Alias** (decided, maintainer; strong). A false name; the teen tries on identities before it settles into a role, which is what the teen stage is. No collision.
- Legend (medium): a spy's built cover story. It also means a myth, which may confuse.
- Runaway (medium): plain, a bit long.

### 8.3 Adults (16 wide, 13 to 15 rows)

Each adult keeps the full signature and differs by outline, so the four stay under the 0.82 pair score. Role ideas follow the games: Breach (cracking from the inside), Dodge (getting away), Tune (listening to signals), Feast (taking and trading).

| Role | Outline idea | Name (recommended first) | Reason | Strength |
|---|---|---|---|---|
| Breach | Low and broad, hood pulled forward, two heavy forelimbs at the hem like digging claws. The camouflage patch on its back | **Mole** (decided) | A mole is an agent placed inside an organization, who breaks it from within; also a digger. One syllable, fits the others' short adult names | strong |
| Dodge | Narrow and tall, leaning, the hood swept back as if moving, long legs showing under a short ragged hem | **Skip** (decided) | A skip is a fugitive who skipped bail (the hunted, in the skip tracer's word); also a quick hop aside, which is Dodge | strong |
| Tune | Tall, the hood's two notches drawn up into ear-like points (listening), the shut third eye larger | **Spook** (decided) | Spy slang for an intelligence agent, and a ghost: the Ghost cue named. Listening is Tune | strong |
| Feast | Round and low, a satchel or bundle at one side (stolen goods), the tag half-covered by the strap | **Drop** (decided, maintainer) | A dead drop: where things are left to be picked up, and Feast picks them up. Caution for the text: "drop" is also the word for loot ("drops", drop tables), so log and Dex lines should avoid "a drop dropped" | strong |

### 8.4 Elders (18 wide, at most 15 rows)

"The same idea after long service." Each is its adult grown wider and more worn: the hem more ragged, the camouflage patch larger, the tag fully exposed and larger. The shut third eye stays shut on every elder (Rogue never gets the full sight).

**Shared motion layer (rule-break): the decoy.** This is the shadow (8.1, decided), on every form; the elders' version is the widest and longest-held.

**Rules it takes from the hidden forms' echoes (decided in direction, 6.1, item 24; `echo-motion.js`, `blank-motion.js`, checked by `echo.test.js`):** a pure function of (sprite, anchors, time) returning padded rows; a layer over the sprite, not a different sprite, so the registered A and B frames still obey the frame rules and wearables sit on them; 12 steps of 400 ms (`STEP_MS = FLASH_TOGGLE_MS * 2`, a 4.8 s loop); echo cells drawn only where the figure is empty, in the shared dim `x` (the `ECHO` knob for brightness and the checker pattern applies); a pad sized to the widest copy; a still, parked version under reduced motion; registered as `motion` on each form in its models file.

**How Rogue's behaves (proposal, to see drawn).** The three hidden echoes are the ruleset it draws from, Whisper's fork lag included: Cipher's dub (one copy sliding both ways behind the figure), Whisper's fork lag (a copy trailing out to one side, holding, and being reaped) and Init's ratchet (copies stacking out in whole-cell steps, holding, and clearing together). Proposed, as first drafted: **the decoy**, a dim copy that steps off to one side, holds, and is dropped, the fork lag's shape used as a decoy left for the hunters. One cell out on the baby and teen, two on the adults, three on the elders (pad 3); parked under reduced motion one cell out. Alternates to see beside it: **the split** (two copies step out to both sides at once, hold and drop together, so for a moment there are three of it), or a copy that appears on the side away from the glance (misdirection; it couples the shadow to the tell, which the other echoes do not do).

| Adult | Elder idea | Name (recommended first) | Reason | Strength |
|---|---|---|---|---|
| Mole | Broader, settled, the claws resting; it has been in place a long time | **Sleeper** (decided) | A sleeper is a mole left in place for years, waiting. The same idea after long service, exactly | strong |
| Skip | Wider stance, the cloak torn shorter, a bundle on its back: it has been running for years | **Exile** (decided) | Someone who has been away so long that away is home. Lam (on the lam) is the shorter, slangier option | medium |
| Spook | Taller ear points, a headset-like band across the hood (it now runs others) | **Handler** (decided) | A handler runs agents; the spook after long service. Caution: a common word with no Tune link of its own; Station (a spy station; also a numbers station, which broadcasts tones, fitting Tune) is the alternate | medium |
| Drop | Wider, more bundles, the satchel now a pack, the tag finally uncovered | **Stash** (decided) | A stash is what is kept hidden at a drop, grown into a hoard. Cutout (the go-between so neither side knows the other at a drop) fits the trade but not the art | medium |

### 8.4a First drafts drawn (2026-10-10, for review; nothing decided about the art)

All ten forms are drawn in the sprite prototype (`prototype/netling2/rogue-art.js`, `rogue-models.js`, `rogue-motion.js`, `rogue.test.js`; the sprite handoff, Status, has the file list). See them on `prototype/netling2/rogue-preview.html` (every form awake, in its B frame, glancing either way, asleep and dead; the decoy and the split step by step beside the hidden elders' echoes; a live strip of the glance at each temper level) or the screenshot `docs/netling2-prototypes/shots/rogue-review.png`, and in `gallery-rogue.html` (`npm run proto:gallery`) with every wearable.

What the checks say (all pass, 18 tests): the frame, anchor and wearable rules every egg obeys (41 wearables, none moves between frames or leaves the screen); the four adults pairwise at most 0.67 and the elders at most 0.71 (1.0's bar is 0.82); each elder closest to its own adult after scaling (Sleeper 0.84, Exile 0.77, Handler 0.80, Stash 0.82; the bar is 0.75), so no elder uses the leave to break that rule (6.1, item 26); and **the fallback check (6.1, item 22)**: no Rogue form is within 0.82 of any of the other eggs' 66 forms of its stage (closest: Mole and Sleeper 0.75, Foundling 0.74 against Program's Bitling), so on the numbers the shadow does not need the thermocamo or the hood. That is a silhouette measure only; the maintainer's look decides.

Choices made while drawing (each easy to change):
- **The shut third eye** is a dim pair (four cells on Spook and Handler, whose ears frame a wider one). Seen on the screenshot, the four-cell one reads clearly and **the two-cell one nearly disappears** against the body at small sizes; options if it should read on every form: make it four cells everywhere it fits, or use the highlight colour for a closed-lid line (but highlight is what the dead pose uses for the tag).
- **The hood notches** are on every form but the baby (12 columns leave room for one point only).
- **The dead mark** is the tag lit (its dim cells turn highlight): the removed plate showing through at the end. Asleep has no mark (the third eye is shut already).
- **The glance** lasts one frame (500 ms), not 400 ms as first drafted: on 400 ms windows a glance and a frame change could land 100 ms apart, under the flash floor; aligned to the 1.0 frame rhythm they land together. Steady glances to the left on the exact beat (every 6 s, 3 s strongly steady); unsteady glances come at random to either side (more at -2); under reduced motion an unsteady Rogue holds its eyes to one side. Wearables stay placed on the unglanced frame.
- **The shadow** reaches one cell on the baby and teen, two on adults, three on elders. Like the hidden elders' echoes it shows only where the figure is empty, so on the baby and teen it is a thin sliver at the edge; it reads on adults and elders.
- Mole was redrawn once (a narrower body over wide claws) to separate it from Drop (0.80 at first), and the baby once (one hood point instead of two) because two points read like Program's Bitling's antennae (0.86 at first).

### 8.4b Options after the first look (2026-10-10, for choice)

Drawn over the registered forms, which stay as in 8.4a until a pick (`prototype/netling2/rogue-options.js`, page `rogue-options.html`, screenshot `docs/netling2-prototypes/shots/rogue-options.png`; two tests in `rogue.test.js` keep them inside the form rules).

**The shut third eye, four ways on all ten forms:**
- *pair* (the first draft): two dim cells. Reads as a slit.
- *four*: four dim cells where the head has room (two where not). Wider, but still a line.
- *slit*: a closed eye drawn as the game draws a sleeping one, a row of accent cells. Reads as a third eye, closed, at once; it is bright, so it competes with the two open eyes, and the asleep pose (which darkens accent cells above the eyes) would hide it.
- *arc*: a dim downward curve, four wide and two tall (`x..x` over `.xx.`), the usual pixel shorthand for a shut eye. Reads as an eye rather than a cut on most forms; it needs two body rows above the eyes (it fits on all ten).
My reading: arc first, slit second; the choice is the maintainer's.

**The thermocamo** (Blank's checker, phase swapped between frames, on body cells only; the eyes, the tag, the third eye and the outline untouched):
- Foundling and Alias, *hint*: one band across the cloak under the neck. At review size it is faint; a second band or a patch is the next step up if it should show more.
- Skip and Exile, *body only*: the whole body below the neck. The frame rule holds as it is (the head is the same in both frames).
- Skip and Exile, *head and body*: as Blank, the hood too (the eye rows and the third eye left clear). Closer to Blank's look, and needs Blank's exception to the frame rule (the head rows differ between frames, read as body colour by the test).
Each is shown in both frames and with the decoy; with the camo the decoy still reads, as a dim copy beside a shimmering body.

### 8.4c The arc drawn, and the thermocamo in motion (2026-10-10)

The arc (decided) replaces the first draft's pair on all ten forms in `rogue-art.js`; the review screenshot `rogue-review.png` is redrawn with it. The silhouettes do not change (marks only), so every check in 8.4a still holds.

The thermocamo animates on `prototype/netling2/rogue-options.html` and in the GIF `docs/netling2-prototypes/shots/rogue-thermocamo.gif` (9.6 s, two of the decoy's loops): each form plain, with the camo on the body only, and on the head and body, at the 1.0 frame rhythm (A and B every 500 ms, the shimmer swapping phase with the frame) with the decoy on. Foundling and Alias show the one-band hint; Skip, Exile, Spook and Handler the full camo; Blank and Cipher animate beside them for reference.

What it shows:
- **Body only** keeps the hood plain, so the arc, the eyes and the hood's outline read as before and the camo reads as a cloak. No frame-rule exception is needed.
- **Head and body** is the closer echo of Blank and Cipher; on Spook and Handler the ear points over a shimmering head give the Ghost-and-Blank look asked about. The cost: the arc's top cells sit inside the checker and are harder to pick out, and the head rows change between frames (Blank's exception would be needed).
- The shimmer swaps the whole body once a frame (two changes a second), as Blank's does; inside the flash budget.
- The hints on Foundling and Alias stay faint in motion too.

### 8.4d Thermocamo, second round: Dodge shimmers as Cipher, Tune wears it still (2026-10-10, for review)

Drawn as options over the registered forms (`rogue-options.js`, `rogue-options.html`, GIF `docs/netling2-prototypes/shots/rogue-thermocamo-2.gif`; two tests in `rogue.test.js`).
- **Skip and Exile, Cipher's shimmer** (`cipherScan`): Cipher's camouflage activation on Rogue's body, a motion layer. A scan band sweeps from the hood's top to the feet and back in 12 steps of 400 ms, scaled to the form's height; above it the body is solid, on it a dim row, below it plain body cells open into checker holes (the outline changes, as on Cipher, which hidden forms and Rogue may do). Differences from Cipher's own layer, so Rogue's marks survive: only plain body cells change (the arc, the tag and the eyes never do; Cipher's turns every dim cell solid above the band), and the face rows (the arc's rows to the row under the eyes) are kept whole, as Cipher keeps its face opening. The decoy is drawn as on every Rogue form, only where the original figure is empty, so it never fills the holes. Calm (reduced motion): no band, the decoy parked. The registered frames stay plain, so wearables and the frame rule are untouched.
- **Spook and Handler, still camo** (`STATIC_CAMO_OPTIONS`): the checker in the same phase in both frames, so it does not shimmer. Body only, or head and body; head and body no longer needs Blank's exception to the frame rule, because the head is the same in both frames. The Ghost-and-Blank look of the ear points over a checkered head stays.
- Foundling and Alias keep the one-band hint (it swaps phase with the frame, as Blank's does); whether the young forms should hint at the sweep instead is open.

### 8.4e Each line its own effect (2026-10-10, for review)

Drawn as options over the registered forms (`rogue-options.js`, `rogue-options.html`, GIF `docs/netling2-prototypes/shots/rogue-lines.gif`, 9.6 s; a test in `rogue.test.js` keeps every layer to plain body cells, looping, and still when calm). Every layer keeps the decoy, and none touches the eyes, the arc or the tag.

| Line | Effect | Status |
|---|---|---|
| Breach (Mole, Sleeper) | **Fade**, two looks: *edges* (the body dims from the outline inward, a ring a step, holds, comes back) and *pulse* (the whole body dims at once for five steps, then returns) | to choose |
| Dodge (Skip, Exile) | Cipher's shimmer (8.4d) | decided |
| Tune (Spook, Handler) | Still camo on head and body (8.4d) | decided |
| Feast (Drop, Stash) | **Bigger decoy**, one cell further than the stage's (Drop 3, Stash 4), two looks: *dim* (solid, the ordinary dim cell) and *bright* (the body colour on a checker, the brighter-but-sparser setting the echo layers already have) | to choose |
| Foundling | the one-band hint | kept |
| Alias | **two camo bands** under the neck (swapping phase with the frame) and **a hint of the sweep**: a dim band runs down the body below the neck and back, with no holes | for review |

What the GIF shows: both fades nearly empty the body for a moment (the eyes stay lit), the pulse more abruptly; the bright decoy is the most visible effect on the page, the dim one reads as a longer shadow. A fade and the bright decoy are the strongest motion on any form, so both stay inside the flash budget by the same 400 ms steps as the echoes (the pulse changes twice a loop, the edge fade once a step).

### 8.4f The decided effects drawn into the forms, and Stash's maw (2026-10-10)

The registered forms now carry everything decided (6.1, items 22 to 31): the camo in the frames (Foundling's one band and Alias's two, swapping with the frame; Spook's and Handler's still camo on head and body, the arc, eyes and tag left clear), and each form's layer in `rogue-motion.js` (`MOTION_OF`): the plain decoy on Foundling, Spook and Handler; the sweep hint on Alias; the edge fade on Mole and Sleeper; Cipher's shimmer on Skip and Exile; the bigger dim decoy on Drop and Stash. The layers moved from `rogue-options.js` into `rogue-motion.js`; the options file keeps the camo helpers that drew the frames and the alternatives not chosen (the fade pulse, the bright decoy) for the record. Every check in 8.4a still holds (24 tests); the gallery and the review page draw the registered layers. GIF of the registered forms: `docs/netling2-prototypes/shots/rogue-registered.gif`; review sheet `rogue-review.png` redrawn with the camo.

**Stash's maw (a draft for review).** The shadow shows only where the figure is empty, so a mouth where the copy's own face would be stays hidden behind the body; the maw sits in the visible strip instead. At the copy's mouth height (the first row from the mouth row down where at least four shadow cells in a row show past the body, with the row under them showing too), the outermost four become a mouth: a dark opening two cells wide and two rows tall with a bright fang at each top corner (`+..+` over `x..x`), there only while the decoy is fully out (four steps of each loop, on either side). Seen on the GIF it reads as two fangs over a notch at the shadow's leading edge; whether that reads as a mouth is the maintainer's call. A first try on the shadow's widest row (lower down) read as two stray dots and was replaced. Options if it should read more: an accent (the eyes' colour) mouth line instead of the fangs, a wider opening, or the maw on Drop too.

**Second try (maintainer's ask, 2026-10-10): the maw as a line in the eye colour, without the white fangs.** At the copy's mouth height (the first row from the mouth row down where at least four shadow cells in a row show past the body), three cells in the eye colour, set one cell in from the shadow's outer edge so the shadow frames them. It shows for the same four steps of each loop, on either side. On the GIF (`rogue-registered.gif`, Stash's row: the line, the fangs, no maw) it reads as a mouth in the shadow, near the eyes' height. The line was liked (maintainer); the fangs stay selectable (`mawStyle: 'fangs'`) for comparison.

**Third try (maintainer's ask): the line curving up at both ends, for a menacing look (a grin).** Two cells in the eye colour on the row and a corner one row up at each end (`o..o` over `.oo.`), at the copy's mouth height. It is set in from the shadow's outer edge when the strip is five wide and runs from the edge when it is four (as it mostly is on Stash); where Stash's lopsided body makes the shadow step, a corner may sit on the empty cell beside the step, never on the body, so the grin stays at mouth height on both sides (on the left it otherwise dropped to the satchel's shadow). It was replaced by the half grin below; it stays selectable (`mawStyle: 'grin'`).

**Fourth try (maintainer: a half grin may be better; other menacing ideas welcome).** The maw is now a **half grin**, a smirk: three cells in the eye colour on the row with the outer end curled up a row, at the copy's mouth height on either side (`mawStyle: 'half'`, the registered draft). Two further ideas are drawn as options beside it on the review page and the GIF (`rogue-registered.gif`, Stash's row):
- **The shadow's eyes** (`eyes: true`): where the copy's own eyes fall on cells the shadow shows, they are drawn in the eye colour, so the shadow looks back with an eye of its own beside the smirk. The strongest of the options.
- **A late reveal** (`late: true`): the smirk (and the eyes) show only for the last two steps of the hold, just before the shadow is dropped, so it is there for a moment and gone.
Other ideas, not drawn: the smirk on the shadow only when the real netling glances away (it ties the maw to the temper tell); teeth as alternating eye-colour and dim cells along the line; the shadow lingering a step after the netling's decoy would have dropped.

**Sleeper vanishes completely** (maintainer). Its fade goes all the way: it dims from the edges in to the core over four steps, is **gone** for three (no cell of it left, eyes and marks too; only its shadow, drawn whole while the figure is gone, a dim double shifted three cells to one side), then comes back dim and fills in from the core out. Mole keeps the shorter fade (three rings, eyes always lit). One renderer note: wearables are placed on the registered frames, so while Sleeper is gone they would float in the air unless the renderer hides them for those steps (or keeps them as a tell that something is there). **Decided: they hide.** The form carries `hideWorn` (true for the three vanished steps, false under reduced motion, where it does not vanish), and the gallery's layers section skips drawing wearables while it is true; the real renderer must do the same.

**Decided (maintainer):** Stash's maw is **the late reveal with the shadow's eye**, and **the whole half grin sits one row lower** (its corner on the copy's mouth row, its line a row below), so it shares no row with the shadow's eye and no cell of it touches the eye. On the review page and the GIF, Stash's row shows the registered version, the same not lowered, and the half grin alone. The other styles (full grin, straight line, fangs) stay selectable in code.

### 8.4g Exile redrawn: three options (2026-10-10; decided: the cape)

**Maintainer (seventeenth round):** Skip stays as drawn; what is wrong is that **Exile is too close to Skip** (it was Skip two columns wider), so it needs its own idea. Options to be drawn side by side.

**Decided (6.1, item 35): the cape**, now registered as Exile. One change on registering: the hood's row 3 is a cell shorter on the right (as on the old Exile), because wearables centre on that row and the longer row moved the cyber eye half off the right eye (2 of 8 eye cells; 4 of 8 on every other Rogue form, now on Exile too). Scaled against Skip 0.86 after the trim; unscaled (the 1.0 audit) 0.70, down from the old Exile's 0.82.

Three options, in `prototype/netling2/rogue-options.js` (`EXILE_OPTIONS`; pack and bindle kept for the record). Each keeps Skip's head, swept hood, lean and stride, the registered anchors and the three-cell tag, and widens the body by a column (to Skip's scaled width), so it reads as Skip grown older with one new thing added behind it:
- **pack:** the brief's bundle, a pack high on its back under the swept hood, with a dim strap.
- **cape:** the hood tail grown into a long torn cape trailing behind, its tatters swapping with the frame.
- **bindle:** a stick over the shoulder with a bundle on the end, where the hood tail was (everything it owns, carried).

Checks: with each option swapped in for Exile, all 25 Rogue tests pass. Elder against Skip, scaled: pack 0.85, cape 0.87, bindle 0.85 (the drawn Exile 0.77; bar 0.75), each well clear of the next adult (Drop or Spook, 0.57 to 0.61); closest other egg's elder 0.62 to 0.64 (bar 0.82). A first pass with a narrower body and legs at Skip's unscaled columns scored 0.65 to 0.72 and failed the bar, so the widening is what lets the added piece fit. The scores are silhouettes; how much each reads as its own form is for the look to decide. Shown on `rogue-options.html` (the row under Stash: Skip, the drawn Exile, then the three, all with the shimmer and the decoy), `docs/netling2-prototypes/shots/rogue-exile-options.png` (three moments: frame A, the decoy out, frame B) and `rogue-exile-options.gif` (9.6 s at 200 ms steps).

### 8.4h Exile: a second camo pass (2026-10-10; decided: the wipe back on by the column)

**Maintainer (eighteenth round):** starting from the cape, a second animation for the thermocamo, for example a sweep down to clear, then a sweep left to right to come back in.

Drawn as `wipeMotion` in `rogue-motion.js` (an option, not registered): the same camo cells as the shimmer (plain body cells only, the face rows, eyes, arc and tag untouched, the decoy as on every form). Over the 12 steps of 400 ms: step 0 plain; steps 1 to 5 a dim row sweeps from the hood to the feet and the body above it opens into the checker holes; step 6 full camo; steps 7 to 11 a dim column sweeps left to right over the body's own width and the body behind it comes back solid. `scanWipeMotion` takes turns by loop: Cipher's shimmer, then the wipe (the decoy changes sides each loop too, so the shimmer always goes with the shadow on one side and the wipe with it on the other). Calm (reduced motion): no band, the decoy parked, as the shimmer. No cell changes more than once a step (400 ms), inside the flash rule. Tested in `rogue.test.js` (the marks and face kept, plain at step 0, full camo at step 6, camo above the row going down, solid left of the column coming back, loops, calm still, the turn-taking). Proposal: the turn-taking on Exile only, so the elder has one more move than Skip; the wipe alone is the other choice.

**Maintainer's read of the GIF (nineteenth round):** shimmer on, sweeping down to off and back up; then it turns off at random; then on again, sweeping down to off; then the wipe. Two causes: (1) the hand-overs jumped, because the shimmer rests in camo (its band at the top, holes below) and the wipe rests plain, so the shimmer-to-wipe change snapped 35 body cells at once and the wipe-to-shimmer one 41; (2) both effects open with a downward sweep that means the opposite (the shimmer's turns the camo off, the wipe's turns it on), so the wipe's first half reads as the shimmer again. Drawn for (1): **joined** (`scanWipeMotion(stage, { joined: true })`), the shimmer half a loop late on the figure (its band starts at the feet with the body plain, rises into the camo and comes back down), so it starts and ends plain as the wipe does; the hand-overs change 5 and 7 cells, no more than a step inside either effect (tested). The decoy keeps the real time. (2) is not changed yet: the wipe's clearing sweep could run up instead, or the column first, if the joined version still reads as a repeat.

**Twentieth round (maintainer: "it's getting better; show me the first sweep reversed").** Drawn as **joined, wipe up** (`scanWipeMotion(stage, { joined: true, up: true })`; `wipeMotion(stage, { up: true })`): the wipe's first sweep runs from the feet to the hood with the camo going on below the row, then the same full-camo step and the same column left to right. The hand-overs stay as smooth as joined (tested). On the page and the GIF it is the fifth column.

**Decided (twenty-first round, 6.1 item 37): the wipe back on by the column**, registered on Exile as `scanWipeBackMotion('elder', { back: 'col' })`. Skip keeps the shimmer alone. The other wipes (`wipeMotion`, `scanWipeMotion` with `joined` and `up`, the row back on) stay in `rogue-motion.js` for the record and are not registered. GIF of all ten registered forms redone: `rogue-registered.gif` (9.6 s, both of Exile's loops).

**Twenty-first round (maintainer: can it wipe back on before it loops again).** Drawn as **the wipe back on** (`wipeBackMotion(stage, { back })`, taken in turns with the shimmer by `scanWipeBackMotion`): the wipe loop now starts in full camo, a dim column sweeps left to right wiping it off (steps 1 to 5), one plain step (6), then it is wiped back on (7 to 11) and ends in camo. Two ways back on: **row**, a dim row rising from the feet with the camo below it; **column**, the column returning right to left with the camo behind it. Since the shimmer in its own timing also starts and ends in camo, the turns meet with no half-loop offset (hand-overs 4 and 7 cells for row, 4 and 12 for column; tested). A fix on the way: the wipes' checker was the shimmer's in reverse (the shimmer counts padded columns, three of them, odd), so the two camos were opposite patterns; both wipes now use the shimmer's checker. The page row and the GIF now show: the shimmer alone, joined with the wipe up (the last pick), back on by row, back on by column; the still is the wipe loop's even steps (4.8 s to 8.8 s).

Shown on `rogue-options.html` (the row under the Exile options: the cape with the shimmer, the wipe, the two taking turns, the same joined, and joined with the wipe going up), `docs/netling2-prototypes/shots/rogue-exile-wipe.png` (the wipe loop's first six steps, 5.2 s to 7.2 s, 0.4 s apart: the first sweep down in columns 2 to 4, up in column 5) and `rogue-exile-wipe.gif` (9.6 s, both loops, the time and loop printed on each frame).

### 8.4i Handler: an elder move of its own (2026-10-10; decided: both)

**Maintainer (twenty-second round):** Handler is now the least interesting elder; ideas to help it like the others. The diagnosis: every other elder adds a behaviour over its adult (Sleeper vanishes, Exile wipes, Stash's shadow grins), while Handler's layer was Spook's (the still camo and the plain decoy). Four ideas were offered (the split shadow as agents it runs; the headset transmitting; the eyes following the shadow; the camo switching once a loop); **the maintainer asked to see the first two and both together.**

**Decided (6.1, item 40): both**, registered as `signalMotion('elder', { split: true })` (`MOTION_OF.spookElder`). The sprite is unchanged, so the audit (frames only) is identical; the arcs sit beside the head, where side-of-head wearables (headphones) may overlap the first arc in a renderer, which no check covers. `rogue-registered.gif` redone.

Drawn in `rogue-motion.js` (the 8.4i block; split and signal alone kept as options):
- **split:** the shadow sent out to both sides at once (`splitMotion`, the first round's alternate): two agents in the field. On Handler it is subtler than on a solid form, since its body is already half dim with the camo.
- **signal:** the headset transmits (`signalMotion`): from each cup (the outermost dim cell on the eye row) an arc in the body colour travels outward a cell a step with a second one two cells behind, curving back toward the head at its ends ('(' and ')'). Two pulses a loop (steps 0 to 3 and 6 to 9). The body colour because the shadow is dim (it would hide dim arcs), the eye colour is Stash's reveal and the white mark is the dead tag. Drawn on empty cells and over the shadow, never on the figure. Calm: one arc parked a cell out.
- **both:** `signalMotion(stage, { split: true })`.

Checks (`rogue.test.js`): no option changes a cell of the figure; the arcs leave both cups and travel out, two pulses a loop; quiet steps; loops; calm still; a cell changes at most once a step (the flash rule). Shown on `rogue-options.html` (the row under the Exile wipes: Spook, Handler now, then the three), `docs/netling2-prototypes/shots/rogue-handler-options.png` (the first 2 s, 0.4 s apart) and `rogue-handler-options.gif` (9.6 s, both loops).

### 8.5 Ids and the Dex

Ids as in 7 (`rogueBaby`, `rogueTeen`, `rogueAdultBreach` and so on); display names map onto them in `form-ids.js` when chosen. The Dex shows `???` (6.1, item 7). Dex hints and Rogue's flavor words for its meters and death register (as the eggs table has for the other three) are not drafted.

### 8.6 Not decided in the briefs

- **Skip and Exile: done** (6.1, items 35 to 38; Exile is the cape with the wipe back on). Everything else in the briefs is decided or accepted: all ten names (item 23); the decoy as the shadow (the split stays on the review page as the alternate not used); the arc third eye; each line's effect (items 29 to 33; Exile's wipe and Handler's signal and split, items 37 and 40); the glance tell (drawn in 8.4a; not commented on separately, accepted with the rest of the forms in item 34).
- Silhouette: the four adults pass the 0.82 audit (closest pair 0.67) and each elder is closest to its own adult (Exile 0.86 against Skip after the redraw).

## 9. The kits (drafts for choice, 2026-10-10)

6.3, item 4. **Frame (maintainer, 2026-10-10):** each ability is its **role's ability with a hunt twist**; perks are **Rogue's own** and traits are **the role traits** for the first pass; keepsakes **reuse existing items**, and Rogue may share one with an NL-0 form. Nothing here is simulated; every number is a starting value taken from the fork's constants (`netrun/nr2.js`, `ab`; `sim.js`, the perks and `TRAIT_CFG`). Rogue has one form per role, so where the NL-0 role has a corp and a street ability, each brief says which one it starts from.

### 9.1 What every kit stands on

- **The checkpoint part** (6.1, item 6) on every adult and elder: checkpoints never notice it. A side effect to accept: a checkpoint is never met, so the checkpoint HIDE's trail +1 never happens either. The trail's sources in practice are moves (+1), lost fights (+2), anomaly choices (+1) and market purchases (+1).
- **Danger sense** (the maintainer's direction, 2026-10-10, in place of 6.1 item 6's "no full sight"; details proposed): Rogue's version of the hidden lines' sight. **At the start of a run every node on the map shows as danger or quiet**: danger is ICE or an ambush, quiet is everything else (caches, relays, markets, the clinic, checkpoints, anomalies, empty nodes). The mark does not say which danger or which quiet; the node's real type shows once it is within the form's ordinary sight (one step, or the Tune forms' more). It is the hidden lines' "sight of every node" cut down to one bit: the eye is still shut (8.1), so it feels where the threat is without seeing what is there. Proposals for the details:
  - **Lines stay under the fog rule** (netrun drafts, decided item 4): the marks show on the nodes, not the lines between them, so the route around danger is still partly a guess, and a relay (quiet) is still something to find.
  - **The trail hunter is not on the map** (it is a clock, and the trail meter already shows it); ambushes are danger like any ICE, so a careful route avoids both at the cost of ICE-win loot.
  - **Blackout** darkens it, as it darkens every sight; the Tune forms keep their limited Blackout sight as now.
  - **Every Rogue form that jacks in** has it, the adult and the elder the same (it is the egg's, not the role's).
  - **Balance to watch:** it helps every form route around fights, so it eases the hunters through the ambushes (an ambush looks like ICE, so it is not singled out, but it is avoided with the rest). The 4.4 targets may need the ambush shares or the trail thresholds raised; Skip (fewer fights met, half the move trail) is the form most likely to come out strong.
- **No ICE slip works on a hunter** (the trail hunter or an ambush; 4.2 and 6.2). The twists below are the only kit parts that touch hunter fights, and each says so.
- **One part at the adult, a second at the elder** (netrun drafts, 3.1), except where the twist is the adult's own part; Rogue may break the structure (maintainer), and this is marked where it does.
- **Parity:** the four Rogue forms are measured against each other on the netrun yardstick (banked value per run plus exit rate, netrun drafts, rule 3) with the hunters on, and against the NL-0 adults and elders of the same role for the 4.4 targets. The twists are what the four forms get back against the hunters, so they are not meant to bring Rogue level with the NL-0 forms.
- **A name to watch:** 1.0's daily already has a `trail` (the run record in `src/netrun/daily.js`, `run.trail`). Rogue's trail count needs a different field name in code (`hunt`, for example); the player-facing word can stay "trail".

### 9.2 The abilities

Ability names are placeholders; the flavor text is section 10's.

| Form | Starts from | Adult (level 1) | Elder (level 2) | Hooks |
|---|---|---|---|---|
| Mole / Sleeper (Breach) | Hardened (Breach street) | **Inside man:** ICE deals 0.7 of its damage, **hunters included, and the hunter's 1.5x does not apply to it** (it fights a hunter as plain tier-2 ICE) | **Deep cover:** 0.65 of the damage, and **once a run a lost hunter fight is an ordinary lost fight** (damage and trail +2; no disconnect, no mark) | damage; the hunter fight |
| Skip / Exile (Dodge) | Unseen (Dodge street) | **On the lam:** ICE never notices it 30% of the time (the hidden adult's figure, not Unseen's 45%, since the twist is added), and **a move adds trail only every second move** (and the hunter's threshold is 4 lower for it, 7.4) | **Long gone:** 50%, and **an ambush can be slipped** at the elder's tier-2 avoidance rate (the trail hunter never) | avoidance; the trail; ambushes |
| Spook / Handler (Tune) | Lookahead (Tune corp) | **Listening post:** sees node types two steps ahead on every branch, **and tells an ambush from ordinary ICE three steps ahead** (danger sense shows both only as danger) | **Runs agents:** three steps (ambushes told apart at four), and **once a run, at any node, it sends an agent out: trail -4** | sight (breadth); the trail; ambushes |
| Drop / Stash (Feast) | Scavenge (Feast street) | **Dead drop:** better cache (0.55) and ICE-win (0.35) loot odds and a won ICE restores 11 Integrity; **at a relay it can leave one item behind: trail -3** | **Hoard:** 0.7 and 0.5, restores 22; **items left at a dead drop are kept**, banked at the run's end even after a disconnect | loot (small), sustain (small); the trail; relays |

Notes and alternates:
- **Mole.** Breach is the fighter, so its twist is the one form that can face the hunter head on. Hardened rather than Insurance, because a last stand that saves from one blow does little against a 1.5x hunter fight and nothing for the mark. Sleeper's part is Insurance's idea turned on the hunt (the corp Breach safety net, against the one fight that ends a run). **Alternate for Sleeper: Gone to ground**, once a run the first time the trail fills the hunter passes it by and the trail falls to half; it matches the vanishing on the sprite but is more Dodge than Breach. Rule-break: the adult has two parts (the damage share and the hunter's 1.5x cancelled); they are one idea, "it fights hunters as it fights anything".
- **Skip.** Unseen rather than Phase, since Phase's sure first slip is spent on the region's first ICE and Rogue's danger comes later in the run. Halving the move trail is the twist and is strong: a Public Net run (6 middle layers) then adds about 3 from moves against a threshold of 10, and a Source run (13) about 7 against 12, leaving room for fights and choices before the hunter comes. The slip chance is trimmed to 30% to pay for it; the bots decide. Exile's ambush slip uses the existing tier-2 avoidance share (`tiers.avoid`, 0.75 at level 2), so it is 0.5 x 0.75 against an ambush. **Alternate for Exile: Away is home**, each relay visited sheds 3 trail.
- **Spook.** Lookahead rather than Foresight: Rogue's danger is where the ambushes are, which is the question wide sight answers (netrun drafts, 3.3, Tune). With danger sense on every form, Spook is the one that reads it: it knows what the quiet nodes are two steps out (a relay, a cache, a market) and which danger is a hunter one step further. Telling ambushes apart one step further than it sees types is a small new hook (the ambush flag is node data, as the ICE game is for Foresight). Handler's agents are its split shadow and headset signal in play (8.4i). Under Blackout, Spook keeps Tune corp's limited sight (two steps of types) and loses the extra ambush step. **Alternate for Handler: Turned**, once a run one ambush it can see becomes ordinary ICE; stronger in the Deep and the Source, useless in the shallow regions (no ambushes there).
- **Drop.** Scavenge rather than Concession: Concession leans on the exchange, and each purchase adds trail for Rogue, so it would pay for its own discount in noise. The dead drop turns loot into quiet, which is the Feast question for a hunted line ("is this worth the noise?", 4.2). Stash's kept items are its hoard and its maw (8.4f): what it leaves behind, it gets back. **Alternate for Stash: the forced filled cache** (Feast corp's elder part; never on a relay), which already exists in the fork and works in the Source. Daily trace: the dead drop takes and gives items, so it must work with the stake ledger or be off in the daily (netrun drafts, rule 4).
- **Rolls.** None of the twists roll except Exile's ambush slip, which uses the lane rng as every avoidance does.

### 9.3 The perks (Rogue's own)

The NL-0 perks act on corp traces, intrusions, Standing-leaning packets and infections; Rogue has the sweep instead of the first two, no Standing, and fewer infections (no intrusion route; 6.2). So each Rogue perk acts on Rogue's home life, keeping the role's drive. The elder keeps its adult's perk, as on the other eggs.

| Form | Drive | Perk | Close to |
|---|---|---|---|
| Mole | Risk | a sweep ignored or a DEFEND lost costs Integrity -10 instead of -20 (the mark stays) | Breach corp's cure bonus (toughness) |
| Skip | Exposure | sweeps 30% less often | Dodge corp's trace perk |
| Spook | Upkeep | Charge and Sync drain 10% slower (the two Tune perks, halved and joined, since there is no lean to pick one) | Tune corp, Tune street |
| Drop | Reward | **30% less scrip at every market in a run: the clinic, the corp exchange and the black market** (widened from the clinic alone, maintainer, 2026-10-10). The Charge cost per purchase and the sale price stay | Feast corp's exchange discount, widened |

Alternates: Mole, a won DEFEND also gives Integrity +10; Spook, a sweep's window starts with a quiet early warning (a notification cost, so not recommended); Drop, play pays 20% more scrip. Drop's perk acts in a run, not at home, which stretches the perk frame (perks are care effects); Rogue's clinic is where it pays for bugs, so the frame was already stretched there. Each purchase still adds trail +1, so the discount makes buying cheaper, not quieter; it pairs with the dead drop (buy, then leave what is spare at a relay for quiet). **Not chosen for any form: a perk that removes or prevents marks**, since marks do not fade (6.1, item 10) and are the difficulty lever; Mole's perk softens a sweep's damage but never its mark.

### 9.4 The traits (the role traits, first pass)

Mole Hardened, Skip Evasive, Spook Persistent, Drop Foraging, at the decided strengths and caps. A trait is inherited by role, so a Rogue Mole's Hardened streaks with an NL-0 Breach parent's and the other way round, which suits "shares some of NL-0's background". Notes:
- **Evasive** must name the sweep among the timed events it lengthens (today: trace, intrusion, overflow). With it a sweep's 90 minutes become 112 at strength 1 and 118 at the cap (1.25).
- **Hardened** is weaker on Rogue (fewer infections to cut). Accepted for the first pass; it is the strongest trait on the NL-0 eggs.
- **Untraceable** (the hidden trait) cuts corp traces, which Rogue never meets. Proposal: it acts on the sweep for Rogue (as 4.1 first drafted), so an NL-0 hidden line's trait helps a Rogue child. To confirm.
- **Open, for after the first pass:** a Rogue trait of its own (for example one that cuts the trail of every run by a little), which would only streak within Rogue lives.

### 9.5 The keepsakes (existing items)

| Form | Keepsake | Why | Shared with |
|---|---|---|---|
| Mole | Repair kit | Integrity, which sweeps and hunter fights cost | Breach corp |
| Skip | Decoy | answers a sweep (6.2), and the decoy is the shadow every Rogue form casts | Dodge street |
| Spook | Signal booster | the next win counts double, and wins choose Rogue's adult (6.1, item 4) | Tune street |
| Drop | Salvage cell | Charge with no corp lean; Rogue's only Charge item that is not the corp's | Feast street |

Not used: the Corp voucher (its trace skip does nothing for Rogue) and the Memory shard (the hidden forms' own). An item's Standing effect (the Decoy's and the Salvage cell's street +1) does nothing for Rogue, which has no Standing; 6.1, item 5's "adds trail instead" covers actions in a run, so at home these simply drop the Standing part. Elders leave their adult's keepsake.

### 9.6 For the maintainer

**Taken as starting points (maintainer, 2026-10-10):** the four abilities, the perks (Drop's widened to every market in a run), the role traits and the keepsakes, all to be measured; danger sense with the details proposed in 9.1 (marks on nodes, not lines; the trail hunter off the map; adult and elder the same; dark under Blackout). **Direction (maintainer):** Rogue gets **its own map build rules**, since its netrun rules differ anyway, as a balance lever against danger sense and the twists; drafted in 9.7. The items below stay open where not covered.


1. The four abilities, or an alternate per elder (Sleeper: Gone to ground; Exile: Away is home; Handler: Turned; Stash: the forced cache).
2. The four perks, or an alternate.
3. Untraceable acting on the sweep for Rogue.
3a. Danger sense's details (9.1): marks on nodes but not lines, the trail hunter off the map, adult and elder the same.
4. The keepsakes.
5. Then the simulator build (section 7) can use these in place of its stand-in.

### 9.7 Rogue's map rules (draft for choice, 2026-10-10)

**Direction (maintainer):** Rogue has its own netrun rules, so it gets its own map build rules as a balance lever, mainly against danger sense (9.1). Levers chosen: **cordon layers, chokepoints, relay rules, danger clustering, and the danger and quiet node frequencies as needed** to meet balance goals that are not set yet. Nothing is simulated; every number is a starting value. The rules act at map build (`netrun/map2.js` in the fork, which already takes a region's width and second-link chance), so they stay pure and change nothing for the NL-0 eggs.

**What danger sense does to today's maps.** Danger share by node weight: Public Net 6 of 14 (43%), Corp Grid 7 of 18 (39%), Bazaar 5 of 14 (36%), Ruins 6 of 17 (35%), the Deep 9 of 16 (56%), the Source 11 of 17 (65%). The 2.0 maps widened the Deep (3 to 4 nodes a layer, second link 0.65) and the Source (3 to 5, 0.75), which gives the most ways around danger exactly where Rogue's hunters and its good end are. In the shallow regions a quiet way through a layer is usually there. So without new rules danger sense saves the most fights where it should save the fewest. Also: checkpoints never notice Rogue (9.1), so a checkpoint is a free quiet node, and the Corp Grid (checkpoint weight 4) becomes Rogue's easiest region.

**The five levers, in the order recommended:**

1. **Cordon layers (the main feature).** A cordon is a layer where every node is danger (ICE or an ambush): the hunters' net across the route. Danger sense shows it from the start of the run, so the player plans for it rather than meeting it by surprise. It forces one fight and leaves a choice of which: Spook tells an ambush from ICE there (9.2) and Mole is built to take it. Starting values: none in the Public Net and the Bazaar, none in the Corp Grid and the Ruins at first (one each if those regions measure too easy), **one in the Deep and two in the Source**. Never layer 1, never the relay layer.
2. **Relay rules (paired with the cordon).** The guaranteed relay stays at the middle layer, and **the first cordon sits in the layer right after it**, so the relay asks the real question: out now with what is held, or through the net. In the Source the second cordon goes about two thirds of the way down. Relays beyond the guaranteed one (weight 1 in every region) are **halved for Rogue** (weight 0.5) so the escape is a place, not a habit. Cost to note: relays are where Drop's dead drop acts (9.2), so fewer relays weaken Drop; if it falls behind, its dead drop can also work at a market.
3. **Chokepoints.** Rogue keeps **1.0's narrow maps in the Deep and the Source** (2 to 3 nodes a layer, second link 0.5) instead of the widened 2.0 ones, so there are fewer ways around danger where it matters. The shallow regions are unchanged. If that is not enough, the next step is a lower second-link chance (0.35) in the deep half of the map only. The widening was decided for the NL-0 eggs' exit rates; Rogue's own measure decides its own width.
4. **Danger clustering.** Loot is guarded: for a share of caches and markets (starting value **one in two in every region**), every node in the layer before that links into it is danger, converted from ICE the region would place elsewhere (the count of danger nodes does not change). Quiet routes still exist but pass fewer caches and markets, so danger sense trades loot for safety instead of giving both. It pairs with Drop (loot is what it is for) and with Skip (it can slip ordinary ICE on the way to a guarded cache, never an ambush at the adult level).
5. **Frequency (the tuning knob, last).** The danger and quiet weights per region are Rogue's own and are moved only to meet the balance goals once they are set. A starting proposal for one known gap: in the Corp Grid, half of the checkpoint weight (2 of 4) becomes ICE for Rogue (corp patrols that do notice it), so the region is not a free pass.

**A decision this revises (decided, maintainer, 2026-10-10).** 6.1, item 15 said a Rogue run holds no more fights than another egg's. Levers 1 and 4 keep the count of danger nodes, but lever 5, and lever 1 in a layer that rolled quiet, can add danger. **Decided: no more hostile events at home** (the sweep stays at 12% an hour), **but possibly more fights in runs.**

**Balance goals (not set; proposals to frame them).**
- **Fights avoided:** a careful Rogue route (the bot routes by danger sense) meets about **60 to 75% of the fights** a route chosen without it meets, in each region. Under that range danger sense is not worth having; over it the hunters have no bite.
- **Exit and value:** the 4.4 targets (careful disconnects about 1.5x the hidden adult's per region, the exit rate no more than 10 points lower in the Public Net and the Bazaar), measured with the kits and these map rules on. **Decided (maintainer): they are a high-side first aim; the build should come in under them by some amount** (4.4).
- **The relay question (decided, maintainer, 2026-10-10): continuing pays about a third more, at a matching risk.** A bot that goes on past the relay before a cordon should bank on average **about 33% more per run** than the quiet runner (section 7) that jacks out there, not drastically more, and pay for it in risk: a higher disconnect rate and more marks (lost hunter fights and ambushes) from that point on. The two read-outs go side by side: banked value (target about 1.33x) and disconnects and marks after the relay. If continuing pays much more, the cordon or the guards are too soft; if it pays about the same or less, they are too hard or the deep half holds too little loot.

**For the simulator (section 7, when built):** in `map2.js`, under the `ROGUE` switch: a cordon layer list per region, the relay-then-cordon placement, a relay weight factor, Rogue's own width and second-link per region, the guard rule with its share, and per-region weight overrides; a danger-sense routing rule for the bots; the measures above. One rng rule: the new steps must draw their random numbers after the ordinary map's, so a Rogue map with every lever off equals the ordinary map (the same test `map2` already has against `src/netrun/map.js`).

**For the maintainer:** the order and the starting values above (no comment yet; taken as starting values), and the fights-avoided range (60 to 75%), still a proposal. Decided: fights at home as before and possibly more in runs; the 4.4 targets as a high-side aim to come in under; continuing past the relay pays about 33% more at a matching risk.

## 10. Not done

- The reveal choice, the background touches and Rogue's own codex pages (codex drafts).
- The Rogue abilities' flavor text, the sweep's and hunter's wording, Rogue's meter words and death register; the renderer work the layers need (Sleeper's `hideWorn`, the motion layers including Exile's turn-taking and Handler's arcs beside the head, the glance).
- Any simulation. Every number above is a starting value, and the targets in 4.4 are proposals.
