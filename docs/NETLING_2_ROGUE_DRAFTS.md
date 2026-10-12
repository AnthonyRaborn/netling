# Netling 2.0: the Rogue egg (drafts)

Status (handoff, 2026-10-10): the design is largely decided with the maintainer (section 6.1, items 1 to 40) and the ten forms are drawn in the sprite prototype (section 8). **All ten sprites and their effects are accepted by the maintainer** (Exile redrawn as the cape with a second camo pass, the wipe back on, 8.4g and 8.4h; Handler given the headset signal and the split shadow, 8.4i); the simulator fork now carries all three stages (home life, the hunt in runs and the lineage side; section 7), and every number not marked decided is a starting value. Scope so far: the hidden-line base in play, the hunters, the merge ending (the good end) and the forms. The reveal, the background touches and Rogue's own codex pages are not done (their drafts stay in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md), Rogue: background and reveal). The maintainer allowed Rogue to break the other eggs' structure.

**Where to pick up.**
1. **Done: Skip and Exile revisited** (2026-10-10). Skip stays as drawn; Exile is the cape (8.4g), and its layer takes turns by loop between Cipher's shimmer and the wipe back on by the column (8.4h). Registered in `rogue-art.js` (`skipElder`) and `rogue-motion.js` (`MOTION_OF.skipElder`); the other options stay in `rogue-options.js` for the record.
2. **Done: Handler** (maintainer, after the Exile round: the least interesting elder). Its layer is now the headset signal with the split shadow (8.4i; `MOTION_OF.spookElder`). All ten forms are accepted: Foundling, Alias, Mole, Skip, Spook, Drop, Sleeper, Exile, Handler, Stash, with the arc third eye, the decoy shadow, each line's effect and the glance tell.
3. **The design is closed for the first build** (6.3, 2026-10-10): only M1 (later, if wanted) and difficulty (after the simulator) stay open.
4. **Drafted: the kits** (section 9, for choice): each ability is the role's with a hunt twist, Rogue's own perks, the role traits, existing items as keepsakes.
5. **2026-10-11: the good end's second round and inheritance decided** (6.1, items 41 to 47) and measured (7.6): only a clean Source exit arms the good end, the mixed egg (any egg after a good end; the Rogue as parent; a Rogue trait to choose, 9.4a), inheritance needs a full life on every egg, and the crossings between Rogue and the NL-0 eggs are gated. The good end now comes in 24% of first Rogue lives (33% of all Rogue lives; a median 2.8 Rogue lives, about 15 days). Then **the Rogue trait decided and measured** (item 48, 7.7): capture halves (3.4% to 1.7% of Rogue lives) but the good end barely moves (35% a Rogue life) and the gap between the lines stays (Dodge about 65%, the others 24 to 29%), since the good end is gated by clean Source exits, which ordinary ICE decides. **Next: the maintainer's call on the line gap (levers in 7.7), then the Deep's disconnects (item 45).**
   Earlier: **Simulator stages 1 to 3 built and measured** (7.1 to 7.5): home life, the hunt in runs (every run setting decided, 7.4) and the lineage side (7.5). Stage 3's first measure: a Rogue line of a player who runs reaches the good end in its first Rogue life half the time and within three 89% of the time (a median 1.5 Rogue lives, about 8 real days), because the Rogue elder is easy at the decided feat tiers and the hunt rarely bites after a Source exit. The good end's length has no target yet; that, with difficulty (6.3, item 5), is the maintainer's next call.
6. **2026-10-11: the Deep's disconnects decided** (6.1, item 50; 7.12): no ambush in the Deep's cordon and the Deep's ambush share 0.15, so Rogue adults disconnect 1.49x the hidden form's there (1.72x with the trait alone, 1.84x before it); both kept as levers for a playtest.
7. **The text, first pass (2026-10-11):** the reveal is decided (the egg list with a two-line log entry) and Rogue's five pages (one per role and a Source page; they count toward nothing) and the background touches are decided (texts and ids confirmed, the background touches as recommended, the Source log line kept; 2026-10-12), in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) (Rogue: background and reveal; Rogue pages). The rest (ability flavor, the sweep and the hunter, meter words, the death register) drafted for choice in section 10 (2026-10-12).

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

**Superseded (2026-10-10, section 6.1):** the merge is the good end and needs a Rogue elder that has exited the Source; a clean exit offers it at once, and any exit unlocks it for the elder's death (6.1, items 11 to 13). *(Revised 2026-10-11: only a clean exit arms it, 6.1 item 41.)* The original draft follows.

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
    - *Revised 2026-10-11 (items 42 and 43): the hatchling's parent is the Rogue, not the chosen NL-0 fragment, and it carries the Rogue trait.*

**The good end, second round (maintainer, 2026-10-11)**

41. **Only a clean Source exit arms the good end** (no ICE fight lost on that run, hunter fights included; the same "clean" as before). A Source exit with a lost fight arms nothing and does not re-arm a disarmed good end; it leaves an armed one as it was. This replaces item 12's "a regular Source exit unlocks the merge" and item 13's "another Source exit can remove the hunter block" (now another *clean* exit). The clean exit still offers the merge at once; declining it keeps the good end armed for the elder's death.
42. **The mixed egg.** After the good end the player picks an egg. Choosing Program, Iron or Wetware hatches the **mixed egg**: a netling of that egg whose **parent is the Rogue that just died**, so its traits continue as on any rebirth (a Rogue Mole's role trait streaks into a Breach line of the chosen egg, and so on), and which also carries **a special Rogue trait** (not designed yet; drafts in 9.4). This replaces item 14's M3 hatchling (an ordinary netling whose parent was the chosen NL-0 fragment) and the stage 3 assumption about its parent (7.5).
43. **Any egg after the good end, and a new mixed egg needs a new good end.** Every egg is open at rebirth (item 1), Rogue included; the mixed egg comes only from choosing an NL-0 egg right after a good end. The good end is an end of a Rogue life, not of the game: each mixed egg needs its own Rogue life that reaches the good end.
44. **Length and difficulty.** About half of first Rogue lives reaching the good end is fine (it is harder than the story progression). Confirmed for the simulator: the order the egg pages were completed in hardly matters, and a player who unlocks Rogue has played every NL-0 egg at least once (each egg finds only its own pages), so the lead-in life of each egg in `rogue-lineage.mjs` stands (the first Rogue hatches with no parent, item 47).
45. **Rogue gets a trait of its own** (drafts in 9.4). **The Deep's disconnects** (1.8x the hidden form's against 4.4's 1.5x, 7.4) are revisited once the Rogue trait is decided *(decided: item 50, 7.12)*. **The Dodge line stays as it is for now** (7.4).

**Inheritance (maintainer, 2026-10-11, later the same day)**

46. **Only a full life inherits, on every egg** (sketch, Decided, Evolution). A netling passes the trait line on (trait, streak level, history) only if it dies at the end of its life cycle, as an adult or an elder; a death by neglect, integrity collapse or capture passes only the quirk key, the keepsake and the scrip. For Rogue: the good end taken at a clean exit counts as a full life, and **an armed elder's death is the good end only at the end of its life cycle**; dying of neglect or collapse while armed is an ordinary death (no mixed egg). This revises item 12's "the good end happens when that elder dies".
47. **Crossings between Rogue and the NL-0 eggs** (two rounds the same day; this is the second). Rogue to Rogue inherits as any rebirth does (a full life still needed), before and after a good end; choosing Rogue after a good end brings no special benefit, only the ordinary rules. **Rogue to an NL-0 egg:** the trait line crosses only through that life's good end (the mixed egg, item 42); without it the quirk key, the keepsake and the scrip still cross. **An NL-0 egg to Rogue:** nothing crosses until the account's first good end, so the first Rogue egg (and every Rogue egg hatched from an NL-0 parent before the first good end) has no parent at all; after the first good end everything crosses.

**The Rogue trait (maintainer, 2026-10-11)**

48. **C1 with E1** (9.4a): the trait is innate to the egg, on every Rogue beside its role trait and on the mixed egg for its one life, never inherited. On a Rogue: every region's hunter threshold +2. On the mixed egg: **a share of its corp traces is reassigned to visitors**, the one positive random event, instead of simply removed (starting share a quarter, 9.4a's figure). Placeholder name Unsigned. Then: see what the trait does to the good end's balance between the lines (7.6) before anything else; the Deep's disconnects after that (item 45).

**The line gap (maintainer, 2026-10-11)**

49. **The lines at about 50% to start, 35% kept for tuning** (7.8 to 7.11). In the Source only: Mole's and Sleeper's lost ordinary fight is forgiven at a 50% roll, at most one a run; Skip's and Exile's slip works half as often; a Source exit by Drop or Stash also counts as clean at Integrity 80 or more; Spook and Handler replay one lost ordinary fight a run (reroll). Each line reaches the good end in about 47 to 51% of Rogue lives. The thirtyfive set (the roll at 20%, no Dodge slip in the Source, clean at Integrity 100, one nullify a run in place of the reroll) is the tuning option after a playtest, at today's overall pace. Then: the Deep's disconnects (item 45).

**The Deep's disconnects (maintainer, 2026-10-11)**

50. **Both Deep levers** (7.12; item 45): no ambush in the Deep's cordon and the Deep's ambush share 0.15 (from 0.25), so Rogue adults disconnect about 1.5x the hidden form's there (1.49x, from 1.72x). Both stay levers for after a playtest, in case human players find the Deep a little easier than the bot does (the share back toward 0.25, or the cordon ambushes back).

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
- **Rogue in the Source, story (decided, 2026-10-12):** a one-time log line at the first Source exit, "> found: NL-0, initial commit. it is not a copy.", beside Rogue's Source page (`rogue-source`, codex drafts). The 18 egg pages and 39 story pages do not change.
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
5. Difficulty, after the simulator: the 4.4 targets are a high-side aim to come in under (4.4), and the relay goal is set (9.7). The good end's length is set in direction (6.1, item 44: about half of first Rogue lives reaching it is fine) and re-measured under the clean-only arming (7.6). The Rogue trait is decided (6.1, item 48). The Deep's disconnects are decided (6.1, item 50; 7.12).

## 7. What it would take

**Simulator fork (`prototype/netling2/sim/`), behind a `ROGUE` switch, off by default:**
- Egg mode `rogue`: no Standing (its sources add trail), no owner bar (`SIDES.owner` `null` for life, the states at x1, no owner strain, no Iron wear), one teen, the adult by role with no lean, the elder through the ordinary gate.
- The Rogue kit per role is drafted in section 9, not chosen yet. Until it is chosen, a stand-in: the role's corp-lean ability plus the checkpoint part, the role's trait, no perk; flagged as a stand-in in every result.
- At home: the sweep in place of both the trace and the intrusion (12% an hour, 90 minutes, HIDE, DEFEND or a Decoy); marks with no fade; the `captured` death at three.
- In `netrun/nr2.js`: the trail count; the trail hunter at each region's threshold, the Source included (12); ambush nodes as a share of each region's ICE nodes; the disconnect and mark on a lost hunter fight.
- In the lineage driver (built as `sim/rogue-lineage.mjs`, not `lineage-sweep.mjs`; 7.5): Rogue lives after the gate; the good end armed by a Source exit, disarmed by a later mark, offered at once on a clean exit (a bot rule for accepting or refusing) and otherwise played at death; never after a capture; M3's ordinary next netling in the chosen egg (the offer in egg-completion order; a bot rule picks one). Since every egg is open at rebirth, also a bot rule for when a player returns to an NL-0 egg (for example after a capture) and for choosing Rogue again after a good end (the hunt applies again). M1 is not simulated; its balance is set aside by decision.
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

**Save and ids (when it is built, not now):** form ids follow `prototype/netling2/form-ids.js` with no lean: `rogueBaby`, `rogueTeen`, `rogueAdultBreach`, `rogueAdultDodge`, `rogueAdultTune`, `rogueAdultFeast`, `rogueElderBreach`, `rogueElderDodge`, `rogueElderTune`, `rogueElderFeast` (permanent once shipped). Also a `marks` field, a `mixed` flag on a netling hatched as the mixed egg (it carries the Rogue trait for that life), an armed flag for the good end, the `captured` death cause, a death cause or flag for a merge taken at a clean Source exit (`merged` in the simulator), the `sweep` event type, an ambush node type, a merge record on the lineage (which NL-0 fragment was chosen), an account flag that the epilogue has played, and a trail field in the run state; under M1 later, a second-parent field on the fragment. Each needs a sanitizer.

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

**Decided (maintainer, 2026-10-10): the 4 hour lockout**, with the 8 hour quiet; both are now the fork's Rogue defaults (`ROGUE='{"hideLockMin":0,"defendQuietMin":0}'` gives stage 1 back). Both questions left open here were settled the same day (7.3 and 7.4): a won DEFEND also gives flow (decided, so DEFEND pays something HIDE does not), and two-hourly players are not a tuning target.

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

**Open after the decision:** the Deep's disconnects are a little over 4.4's 1.5x (1.8x) because a cordon forces a fight that may be an ambush; if that should come down, the smallest change is to keep ambushes out of cordon layers. *(2026-10-11: still 1.84x after the relay and exit bonus decisions below, which change what a Deep run banks, not who disconnects; to revisit once the Rogue trait is decided, 6.1 item 45.)* The Breach line is the most captured (Mole has no avoidance, so it meets the most hunters and ambushes). *(Addressed below: a lost fight adds trail +1 for the Breach line.)*

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

**Decided (maintainer, 2026-10-10): the hunter's threshold is 4 lower for the Dodge line** (Skip and Exile, `kit.dodge.thresholdDelta: -4`, now the fork's default; every second move stays); the head start and the slip trail stay off. Measured on the two Dodge steerers only (the table's row); the whole attentive group at the new default (`rogue-s2-decided-dodge4.json`, 300 lives each; against `decided-breach1`): full life 97.4 (97.5), captured 2.6% (2.4; worst archetype 5.7%, unchanged), hunter marks 0.17 a life (0.13), hunters met 0.64 (0.54), the elder gate met in 26.7% (27.2); captured by role steerers: Breach 3.5%, Dodge 1.1% (0.3), Tune 3.9%, Feast 4.9%. The Dodge steerers' 1.1% at 300 lives and 1.7% at 1000 differ by a few lives, within sampling noise. The slip's lead in exit rates (point 4) stays open.

**The relay question (2026-10-10, measured, for choice).** 9.7's target: going on past the relay before a cordon banks about 1.33x what jacking out there banks, at a matching risk. Measured at the decided settings (the Dodge threshold included) by `sim/rogue-relay.mjs` (3000 runs a form; `results/followup/rogue-relay.md` and `.json`): the careful bot plays a Rogue run until it stands at the relay of the relay layer, the run is copied, and one copy jacks out (quiet) while the other goes on (push: the dead drop first for Drop and Stash, always on even when hurt, later relays by the bot's own rule). The same run up to the relay, so the ratio reads the choice alone. Runs that never stand at that relay are counted, not split; every run starts with no marks. Banked value is items plus loose scrip in items, as `rogue-netrun.mjs`; a disconnect banks nothing (Stash keeps its dead drop).

| region | reached the relay | push / quiet, adults | push / quiet, elders | push: exit / disconnect, after the relay | marks a run, push | push / quiet when hurt (Integrity under 55) |
|---|---|---|---|---|---|---|
| the Deep | 38 to 42% | 2.1 to 2.7 | 2.5 to 3.2 | 41 to 66% / 22 to 41% | 0.00 to 0.03 | 1.1 to 2.2 |
| the Source | 30 to 35% | 1.15 to 1.63 | 1.57 to 2.21 | 22 to 47% / 40 to 63% | 0.00 to 0.06 | 0.5 to 1.5 |

Reading it:
1. **The Deep pays far more than the target for going on** (2 to 3x, not 1.33x), even with every hurt run pushed on. Its relay holds little (1.3 to 1.7 items jacking out there; Stash 2.4), and the far half holds the exit's bonus item and scrip. By 9.7's rule (pays much more: the cordon or the guards are too soft), the Deep's deep half is the soft part. The Source's adults sit near the target (Tune 1.15, Breach 1.41, Feast 1.44, Dodge 1.63) and its elders above it (1.57 to 2.21), Exile the most.
2. **The risk is disconnects, not marks.** Going on disconnects 22 to 63% of the time after the relay, but marks stay rare (a few in a hundred runs), since only the trail hunter marks in runs (candidate A) and the cordon fight is ordinary ICE or a non-marking ambush. A disconnect's other costs (a care mistake and a bug roll, Sync, stability) are not in the value, so the ratio overstates going on somewhat.
3. **Hurt at the relay, going on stops paying in the Source** (0.5 to 1.5; under 1 for every adult), so the careful bot's bank-when-hurt rule is the right play there; in the Deep it still pays.
4. **Most runs never meet the question.** Only 38 to 42% of Deep runs and 30 to 35% of Source runs stand at the relay before the cordon; 40 to 50% cross the relay layer by another node (measured on Mole) (ICE, a cache, an anomaly) and meet the cordon without the offer, and the rest end before it. The relay rule in 9.7 (relay layer, then cordon) makes the question available, not asked.

**The Deep's levers (2026-10-10, measured).** Every existing lever, alone and combined: 9.7's map rules (guards, the narrow Deep, fewer extra relays) and three on the far half (a second cordon, more ambushes, a lower hunter threshold). `baseline/rogue-deep-levers.mjs` runs the relay read-out and whole Deep runs (Rogue and the hidden form, 3000 runs a form) for each; output `results/followup/rogue-deep-levers.json`. The hidden form's Deep: exit 53%, disconnects 18.1% (elder 66%, 10.4%).

| setting | reached the relay % | push / quiet, adults | push / quiet, elders | push: disconnect % after the relay | marks a run, push | whole Deep run, adults: exit / disconnect / value | elders: exit / disconnect | adult disconnects vs hidden |
|---|---|---|---|---|---|---|---|---|
| decided | 38 to 42 | 2.1 to 2.7 | 2.5 to 3.2 | 22 to 41 | 0.034 max | 38 / 34.3 / 3.04 | 47 / 29.4 | 1.90x |
| guard 0.25 | 38 to 43 | 2.1 to 2.6 | 2.5 to 3.2 | 24 to 43 | 0.050 max | 38 / 34.1 / 3.06 | 47 / 29.0 | 1.89x |
| guard 0.5 | 37 to 42 | 2.0 to 2.6 | 2.4 to 3.2 | 24 to 44 | 0.038 max | 36 / 35.4 / 2.91 | 45 / 30.3 | 1.96x |
| narrow | 48 to 55 | 2.1 to 2.8 | 2.6 to 3.4 | 24 to 44 | 0.056 max | 35 / 35.1 / 2.69 | 44 / 29.8 | 1.95x |
| relays 0.5 | 40 to 44 | 2.0 to 2.8 | 2.5 to 3.2 | 23 to 46 | 0.055 max | 41 / 36.6 / 3.33 | 49 / 31.1 | 2.03x |
| guard 0.5 + narrow | 45 to 53 | 2.0 to 2.6 | 2.5 to 3.4 | 25 to 47 | 0.051 max | 33 / 35.7 / 2.63 | 43 / 30.8 | 1.97x |
| guard 0.5 + relays 0.5 | 38 to 42 | 2.1 to 2.7 | 2.5 to 3.3 | 25 to 47 | 0.059 max | 39 / 37.7 / 3.07 | 48 / 32.6 | 2.09x |
| narrow + relays 0.5 | 49 to 56 | 2.1 to 2.8 | 2.6 to 3.4 | 26 to 47 | 0.057 max | 38 / 37.3 / 2.96 | 47 / 31.6 | 2.06x |
| all | 47 to 54 | 2.0 to 2.7 | 2.5 to 3.3 | 28 to 49 | 0.056 max | 35 / 38.8 / 2.80 | 44 / 33.5 | 2.14x |
| second cordon 0.8 | 39 to 43 | 2.0 to 2.6 | 2.4 to 3.0 | 26 to 47 | 0.041 max | 35 / 39.1 / 2.77 | 44 / 33.6 | 2.16x |
| second cordon 0.9 | 39 to 42 | 1.8 to 2.5 | 2.4 to 3.0 | 26 to 48 | 0.048 max | 36 / 37.7 / 2.81 | 45 / 32.5 | 2.09x |
| ambush 0.4 | 36 to 42 | 2.0 to 2.5 | 2.4 to 3.0 | 26 to 45 | 0.060 max | 34 / 41.5 / 2.68 | 44 / 34.4 | 2.30x |
| threshold 12 | 38 to 42 | 1.8 to 2.3 | 2.4 to 2.8 | 29 to 51 | 0.190 max | 32 / 41.5 / 2.59 | 43 / 34.3 | 2.30x |
| second cordon 0.8 + ambush 0.4 | 37 to 43 | 1.8 to 2.3 | 2.3 to 2.9 | 32 to 51 | 0.062 max | 31 / 46.0 / 2.42 | 41 / 39.1 | 2.55x |

Reading it:
1. **No danger lever brings the ratio near 1.33.** The map rules leave it where it was (adults 2.0 to 2.8); the far-half levers lower it a little (the best, a second cordon at 0.8 with ambushes at 0.4: adults 1.8 to 2.3) while whole-run disconnects climb to 2.55x the hidden form's (4.4 aims at 1.5x; the decided Deep is already 1.9x). Danger raises the risk on both sides of the relay, so it costs the run more than it changes the choice.
2. **The ratio is structural.** Jacking out at the middle relay banks the first half's loot only; going on adds the second half and the exit's bonus item and scrip. Even a run that is half lost on the way still out-banks the relay by about 2x.
3. **The narrow Deep raises the share of runs that meet the question** (38 to 42% to 48 to 55%), the one thing it does well here.

**What could move it (not in the fork, for choice):** (a) move the Rogue Deep's relay later (about two thirds of the way down, the cordon still right after it), so jacking out there banks more; (b) a smaller exit bonus for Rogue in the Deep; (c) a payout for jacking out at that relay; (d) accept a higher target in the Deep, where the exit is the clearing run, and keep 1.33 for the Source, whose adults are in range.

**Option (a) measured (2026-10-10): the relay moved down.** A map rule in the fork, `relayAt` (`rogue-map.js`, `nr2.js` `rogue.map`, off): the guaranteed relay moves to that share of the way down, the middle layer's becomes a quiet node, and the cordon stays right after it. Same read-out (`rogue-deep-levers.mjs`, same file; 3000 runs a form):

| relay at | reached the relay | push / quiet, adults | push / quiet, elders | push: disconnect % after the relay | adults: banked jacking out there | whole Deep run, adults: exit / disconnect | adult disconnects vs hidden |
|---|---|---|---|---|---|---|---|
| the middle (layer 5, decided) | 38 to 42% | 2.1 to 2.7 | 2.5 to 3.2 | 22 to 41 | 1.4 to 1.7 | 38 / 34.3 | 1.90x |
| 0.6 (layer 6) | 35 to 40% | 1.7 to 2.2 | 2.1 to 2.6 | 19 to 38 | | 41 / 33.6 | 1.86x |
| **0.667 (layer 7)** | 32 to 38% | 1.6 to 2.0 | 1.9 to 2.4 | 18 to 35 | 2.2 to 2.7 | 40 / 33.2 | 1.84x |
| 0.8 (layer 8) | 29 to 35% | 1.5 to 1.9 | 1.7 to 2.1 | 16 to 32 | 2.6 to 3.1 | 39 / 34.8 | 1.92x |
| 0.9 (layer 9, the cordon in the last layer) | 27 to 33% | 1.4 to 1.9 | 1.6 to 2.1 | 12 to 25 | 2.9 to 3.6 | 40 / 34.2 | 1.90x |
| 0.667 with the narrow Deep | 42 to 50% | 1.6 to 2.1 | 1.9 to 2.4 | 19 to 38 | | 36 / 34.8 | 1.93x |

Reading it:
1. **It works where danger did not**, and costs the run nothing: the relay at two thirds brings the adults from 2.1 to 2.7 down to 1.6 to 2.0 (Feast 1.59, Tune 1.76, Breach and Dodge 1.99), the elders to 1.9 to 2.4, with whole-run disconnects unchanged or a little lower (1.84x the hidden form's against 1.90x).
2. **It levels off well above 1.33.** Even with the relay one layer before the exit (0.9), going on pays 1.4 to 1.9: the push crosses one cordon and collects the Deep's exit bonus (2 items and 3 scrip, `exitBonus` 2), which alone is most of a quiet run's value. The remainder is the exit bonus, so option (b) is what closes it.
3. **Fewer runs meet the question** the later the relay sits (38 to 42% at the middle, 32 to 38% at two thirds); the narrow Deep gives that back (42 to 50%).

**Decided (maintainer, 2026-10-10): the Rogue Deep's relay two thirds of the way down** (`relayAt: { deep: 0.667 }`, now the fork's default; the narrow Deep stays off). The earlier sweep scripts spell out the middle relay so their saved outputs still reproduce (`rogue-relay.json` with `ROGUE_RUN='{"map":{"relayAt":{}}}'`). Whole lives, attentive group (`rogue-s2-decided-relay667.json`, 300 lives each; against `decided-dodge4`): full life 97.3 (97.4), captured 2.7% (2.6; worst archetype 5.3%, from 5.7), hunters met 0.69 (0.64), the Deep cleared in 75.9% (75.8), **the elder gate met in 30.0% (26.7)**; captured by role steerers: Breach 4.8%, Dodge 1.7%, Tune 2.5%, Feast 3.7% (each moved by a few lives in 300, within sampling noise).

**Option (b) measured on top: a Rogue exit bonus in the Deep.** A lever in the fork, `rogue.exitBonus` (`nr2.js`, off: the region's own, 2 in the Deep), in place of the region's exit items for a Rogue netling only. Same read-out, the relay at 0.667:

| setting | push / quiet, adults | push / quiet, elders | push / quiet when hurt, adults | whole Deep run: banked value, adults (hidden 4.20) | elders (hidden elder 4.92) |
|---|---|---|---|---|---|
| exit bonus 2 (the region's, decided) | 1.6 to 2.0 | 1.9 to 2.4 | | 3.06 to 3.49 | 3.64 to 4.98 |
| **exit bonus 1** | **1.18 to 1.53** (Feast 1.18, Tune 1.36, Breach 1.52, Dodge 1.53) | 1.58 to 1.78 | 0.91 to 1.18 | 2.49 to 2.83 | 2.88 to 4.25 |
| exit bonus 0 | 0.8 to 1.1 | 1.1 to 1.3 | | | |
| exit bonus 1, narrow Deep | 1.18 to 1.59 | 1.58 to 1.78 | 0.84 to 1.20 | | |
| exit bonus 1, relay at 0.8 | 1.1 to 1.4 | 1.4 to 1.6 | | | |

Reading it:
1. **An exit bonus of 1 brings the adults to the target** (mean about 1.4, Tune at 1.36), the elders to about 1.6 to 1.8, and hurt at the relay going on about breaks even (0.9 to 1.2), so banking when hurt stays a fair call. Exit and disconnect rates do not move (the bonus is paid at the exit only).
2. **The cost is the Deep's value.** A whole Rogue Deep run banks about 19% less (adults 2.5 to 2.8 against 3.1 to 3.5), below the decided middle-relay Deep (2.7 to 3.2) and further below the hidden form (4.20). The Deep is where Rogue earns least against the NL-0 hidden form already.
3. **0 overshoots** (going on pays the same as or less than jacking out), and the narrow Deep or a relay at 0.8 change little on top of an exit bonus of 1.

**Decided (maintainer, 2026-10-10): Rogue's exit bonus in the Deep is 1** (`rogue.exitBonus: { deep: 1 }`, now the fork's default; other regions keep their own). The earlier sweep scripts spell out the region's 2 so their saved outputs still reproduce (`rogue-relay.json` with `ROGUE_RUN='{"map":{"relayAt":{}},"exitBonus":{"deep":2}}'`). Whole lives, attentive group (`rogue-s2-decided-exit1.json`, 300 lives each; against `decided-relay667`): full life 97.6 (97.3), captured 2.4% (2.7; worst archetype 5.7%, from 5.3), hunters met 0.70 (0.69), the Deep cleared in 75.9% (75.9), the elder gate met in 29.3% (30.0); captured by role steerers: Breach 5.2%, Dodge 1.7%, Tune 2.7%, Feast 3.0%. Nothing moves beyond sampling noise: the bonus is paid at the exit, so it changes what a Deep run banks, not who survives it.

- **Not done in stage 2:** the lineage side (the good end armed by a Source exit and disarmed by a later mark, the merge offer, returns to an NL-0 egg). Built in stage 3 (7.5).

### 7.5 Stage 3 built and measured: the lineage side (2026-10-10; no target yet)

**What was built** (fork; Rogue netlings only, so with `ROGUE` off every output is byte-identical, and the earlier Rogue drivers reproduce exactly with the offer declined, which they now pin, `MERGEBOT=refuse`). The good end as decided in 6.1, items 11 to 14 (`sim.js`, `sourceExit`, `takeMerge`, `declineMerge`): a Source exit by a Rogue (only an elder reaches the Source) arms the good end; a clean one (no ICE fight lost on that run, hunter fights and Sleeper's saved fight included) also offers the merge at once; accepting ends the life there (death cause `merged`, which Root Access does not reverse; the fragment is still written); a mark taken after the latest Source exit disarms it and withdraws an unanswered offer; another Source exit re-arms it (a clean one offers again) and removes no mark; an armed elder's death of any cause is the good end in place of an ordinary rebirth, never after a capture (the third mark has disarmed it). Root Access still reverses an armed elder's premature death once, and it stays armed. What follows a Rogue life (`sim/rogue-line.js`): after the good end the offer is one entry per NL-0 egg in page-completion order, each that egg's latest adult or elder fragment, and the next netling hatches in the chosen egg (M3); after an NL-0 life the player picks Rogue again; after any other Rogue death, Rogue again. Tests: `rogue-goodend.test.js` (9).

**Bot rules** (none are design decisions): `MERGEBOT=accept` (default) or `refuse` for the immediate offer; `PICK=first` (default, the first egg completed) or `last`; `LINEBOT=stay` (default) or `back` (one life of the first egg completed after a capture, then Rogue again).

**Assumptions to confirm** (the drafts do not say): the M3 hatchling's parent is the chosen NL-0 fragment, so its trait is that fragment's (the Rogue's own fragment is used only by M1, later); the pages were completed in the order Program, Iron, Wetware; and before the first Rogue life each lineage plays one lead-in life of each NL-0 egg, which stands for the player's earlier lines (their fragments are the offer's first entries, the last is the first Rogue's parent; lead-in lives are not counted).

**How it was measured.** `sim/rogue-lineage.mjs` plays a lineage from the first Rogue life for 10 Rogue lives (with the NL-0 lives between them), so a line can reach the good end more than once. Every life holds Root and the whole codex (a Rogue player has the ending), runs under its own egg's pressure (Rogue no owner bar, Program Charge, Wetware Sync, Iron Heat with wear; the final pressure numbers) and the decided home and run rules (stage 2's settings). The elder feat follows the decided tiers (`lineage-sweep.mjs`): tier 2 (an elder in the Dex, two Deep exits) for the first Rogue elder, tier 3 once the account holds a Rogue elder, tier 4 (one Deep exit) for a line it already holds. Runner `baseline/rogue-lineage.mjs` (resumable), summary `baseline/rogue-lineage-summary.mjs`, outputs `results/followup/rogue-lineage-*.json`. The attentive group as in 7.4, less six archetypes that never jack in (sysadmin, ghosthunter and the four hidden-path hunters; with no Source exit they could not have passed the Rogue gate either): 20 archetypes, 200 lines each for the decided bot rules and 100 for the others.

| bot rules | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end, medians: Rogue lives / days (p90) | of first good ends, at the exit | per Rogue life: elder / Source exit / clean exit / good end | captured a Rogue life | Source exit but no good end | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|---|---|
| **decided: accept, first, stay** | 100% (worst 100) | 49 / 89 / 98% | 1.5 / 8.1 (3.6 / 19.3; worst archetype p90 26 days) | 47% | 89 / 76 / 33 / 71% | 3.4% | 8% | 7.0 |
| refuse every offer | 100% | 46 / 87 / 97% | 1.6 / 8.9 (4.0 / 21.4) | 0 | 89 / 77 / 33 / 67% | 3.8% | 12% | 6.7 |
| one NL-0 life after a capture | 100% | 49 / 89 / 98% | 1.4 / 8.1 (3.6 / 20.5) | 46% | 89 / 76 / 33 / 71% | 3.4% | 8% | 7.1 |
| lever: every Rogue elder at 1.0's feat (tier 1) | 95% (worst 83, the Tune steerers) | 29 / 61 / 80% | 2.6 / 13.2 (6.7 / 33.7), of the lines that reach it | 46% | 37 / 31 / 14 / 29% | 2.5% | 7% | 2.9 |

Reading it:
1. **How often: almost always, and soon.** Every line of a running archetype reaches the good end within 10 Rogue lives; half in the first, 89% by the third. The first good end comes a median 1.5 Rogue lives and about 8 real days after the first Rogue hatches (90th percentile about 3.6 lives and 19 days). With the gate (8 to 9 lives for attentive play on 2.0's simulator; sketch, Handoff) that puts the first good end about 10 lives into the game.
2. **Why: the elder is easy and the hunt rarely bites after the Source.** 89% of Rogue lives reach the elder, because a Rogue player meets the feat at tier 2 or better (73% of Rogue elders meet it at tier 4, one Deep exit). Stage 2's elder gate (about 30% of attentive lives, 7.4) ran every life at 1.0's tier-1 feat, so it understated the elder for a real Rogue player. Of Rogue lives with a Source exit, 8.5% are disarmed by a later mark at least once and 1% are captured afterwards; only 8% end without the good end. Marks a Rogue life: 0.65; capture 3.4%.
3. **The bot rules hardly matter.** Accepting the immediate offer is a little better than waiting for death (good end 71% against 67% a life; 12% of exiting lives lose it while waiting, against 8%), since an elder that waits can still take a mark. Accepting gives up the rest of the elder's life (Rogue lives are 5.4 days with accepting, 5.8 without). Going back to an NL-0 egg after a capture changes nothing at 3.4% capture.
4. **By line** (per Rogue life, decided): Dodge 86 to 87% good end (clean exits 63 to 65%: the slip), Breach 77 to 78%, Feast 68 to 70% (Feast corp has the most capture, 6.5%), Tune 65 to 67%.
5. **Repeat good ends are the rule, not the exception**: about 7 in 10 Rogue lives, so under M3 most Rogue deaths play the epilogue's last two lines (6.2), and each sends one life into an NL-0 egg (about 6 NL-0 lives a line in 10 Rogue lives).
6. **The tier-1 lever** (not a proposal, a measure of the feat's weight): holding Rogue elders to 1.0's feat cuts the elder to 37% and the good end to 29% a Rogue life, and the first good end to a median 2.6 Rogue lives (13 days; p90 6.7 lives, 34 days), with 5% of lines not there in 10 lives (17% of the Tune corp steerer's).

**For the maintainer.** Section 7 left the good end's length without a target; this is the first measure. If the good end should be rarer or later than a life or two for a player who runs, the measured lever is Rogue's own elder feat (above); others not measured yet: only a clean Source exit arms the good end, more than one Source exit to arm it, or more of the hunt in the Source run itself. Not measured: sparse players (out of 7.2's tuning target), notifications, the one-time Source log line, and M1.

### 7.6 The good end, second round: a clean exit arms it, the mixed egg (2026-10-11)

**What was built** (fork; every rule on by default, each with a switch back to stage 3):
- `ROGUE.armClean` (6.1, item 41): only a clean Source exit arms the good end; one with a lost fight arms nothing and leaves an armed good end as it was.
- `ROGUE.goodEndFullLife` (item 46): an armed elder's death is the good end only at the end of its life cycle.
- `INHERIT.fullLife` (item 46, every egg): only a death at the end of the life cycle or a taken good end passes the trait line; other deaths pass the fragment without it (`sim.js` `withoutTraitLine`).
- `sim/rogue-line.js`: after a good end any egg can be chosen (`PICK=first|last|rogue`); an NL-0 egg hatches the mixed egg, whose parent is the Rogue (item 42; `PARENT=fragment` gives stage 3's assumption back); the crossings are gated (item 47, `crossFragment`: Rogue to NL-0 without a good end drops the trait line, NL-0 to Rogue before the first good end passes no fragment; `CROSS=open` gives stage 3 back).
- Nothing in the simulator acts on the mixed egg's Rogue trait yet (9.4a). Stage 3's saved jobs pin every old rule (`baseline/rogue-lineage.mjs`, `STAGE3`); re-run with those switches, one archetype (`steer-feast-street`, 200 lines) reproduced its saved file in every measure. Tests: `rogue-goodend.test.js` (13).

**How it was measured:** as 7.5 (`sim/rogue-lineage.mjs`, the attentive group's 20 archetypes that run, 200 lines of 10 Rogue lives each), with every rule above on; jobs `clean` (accept the offer, the mixed egg in the first NL-0 egg completed), `clean-refuse` (decline every offer) and `clean-rogue` (Rogue again after every good end, no mixed egg). Outputs `baseline/results/followup/rogue-lineage-clean*.json`; summary `baseline/rogue-lineage-summary.mjs`.

| bot rules | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end, medians: Rogue lives / days (p90) | per Rogue life: elder / Source exit / clean exit / good end | captured a Rogue life | Source exit but no good end | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|---|
| stage 3 (7.5, for comparison) | 100% | 49 / 89 / 98% | 1.5 / 8.1 (3.6 / 19.3) | 89 / 76 / 33 / 71% | 3.4% | 8% | 7.0 |
| **decided 2026-10-11: accept, the mixed egg** | 97% (worst 90, Breach corp) | 24 / 60 / 80% | 2.8 / 14.8 (6.6 / 36; worst archetype p90 47 days) | 89 / 76 / 33 / 33% | 3.4% | 56% | 3.4 |
| refuse every offer | 94% (worst 86) | 21 / 55 / 75% | 3.1 / 17.7 (7.0 / 41) | 89 / 76 / 33 / 29% | 3.9% | 61% | 2.9 |
| Rogue again after every good end | 97% | 24 / 60 / 80% | 2.8 / 14.8 | 89 / 76 / 34 / 34% | 3.4% | 56% | 3.4 |

Reading it:
1. **The clean exit is now the gate, and it halves the good end.** Elder and Source exit rates do not move (89% and 76% of Rogue lives); a third of Rogue lives exit the Source clean, and that third is now the whole good end (33% a Rogue life, against 71%). The first good end comes in a median 2.8 Rogue lives and about 15 real days (90th percentile 6.6 lives, 36 days); 97% of lines get there within 10 Rogue lives.
2. **Against item 44's "about half of first attempts":** 24% of first Rogue lives reach the good end, under the half that was called fine. By line (per Rogue life; first-life share in brackets): Dodge 64 to 65% (45 to 48%; its slip keeps exits clean), the steady seeker 40% (33%), Feast 25 to 27% (16 to 20%), Tune 23 to 25% (10 to 16%), Breach 22 to 23% (14 to 16%). So only the Dodge line is near half; the other three lines sit near a quarter or lower in the first life.
3. **Accepting at once is the only way to keep it** now: a regular exit no longer arms, so an elder that declines can only lose the good end to a later mark (6% of exiting lives disarmed when refusing, none when accepting).
4. **The mixed egg and the crossings change nothing for Rogue lives**: choosing Rogue again after every good end gives the same rows (the NL-0 lives between do not touch a Rogue life). A line makes about 3 mixed eggs in 10 Rogue lives. 87% of Rogue lives hatch with a trait line (the first has no parent, item 47; captures, 3.4%, pass none). These bots never die of neglect or collapse, so the full-life rule bites here only through capture.
5. **The NL-0 lineage sweep under the full-life rule** (`baseline/run-all.mjs inherit-`, 200 lineages, against the "now" set): the Rogue gate is unchanged (attentive 8 lives, daredevil 8, casual 18; p90 10, 11, 30), as are Root (life 3 or 4), the first elder and the ending. The scripted players rarely die young once they are past the baby, so losing the trait line after a premature death costs them little; a person who loses netlings to neglect would lose more (not measured).

**For the maintainer.** The good end now lands in about a quarter of first Rogue lives (half on the Dodge line, a sixth on Breach and Tune) and in a third of later ones. If that is lower than wanted, levers not measured yet: leave hunter fights out of "clean" (only ordinary ICE fights count), a Source exit that loses at most one fight still arms, or ease the Source run for Rogue (its cordons, 9.7). The Breach and Tune lines' gap to Dodge (about 2.5x) is the larger question. The Rogue trait (9.4a), once chosen, also moves this.

### 7.7 The Rogue trait measured (2026-10-11)

**What was built** (fork): `sim.js` `ROGUE_TRAIT` (on by default; `ROGUE_TRAIT=0` off): innate on every Rogue and on the mixed egg (`s.mixed`) for its one life, never inherited. On a Rogue, every region's hunter threshold +2 (`netrun/run.js` `huntThreshold`; the bots read the same threshold). On the mixed egg, when a corp trace fires, a quarter of the time it arrives as a visitor instead (none if a visit cannot start then), so the draws with the trait off are unchanged. The older Rogue runners pin it off. Tests: `rogue-goodend.test.js` (15); the stage 2 hunt tests run with the trait off, at the region thresholds.

**Rogue lines** (`rogue-lineage.mjs`, job `trait`, as 7.6: 20 archetypes, 200 lines of 10 Rogue lives; against 7.6's `clean`):

| | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days (p90 days) | per Rogue life: elder / Source exit / clean exit / good end | captured | marks a Rogue life | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|---|
| 7.6, no trait | 97% (worst 90) | 24 / 60 / 80% | 2.8 / 14.8 (36) | 89 / 76 / 33 / 33% | 3.4% | 0.66 | 3.4 |
| **with the trait** | 98% (worst 94) | 25 / 64 / 84% | 2.8 / 14.3 (35) | 90 / 80 / 35 / 35% | 1.7% | 0.48 | 3.5 |

By line, per Rogue life with the trait (7.6 in brackets; first Rogue life after the slash): Dodge 65% (64 to 65) / 41 to 47%; Feast 26 to 29% (25 to 27) / 20 to 24%; Breach 26% (22 to 23) / 16 to 20%; Tune 24 to 26% (23 to 25) / 9 to 13%.

**Stage 2's attentive group** (`rogue-stage2.mjs`, job `decided-trait`, 300 lives of each of the 26 hourly archetypes; against `decided-exit1`): full life 98.5 (97.6), captured 1.5% (2.4; worst archetype 4.0, from 5.7), hunters met 0.18 a life (0.70) and lost 0.04 (0.17), hunter marks 0.04 (0.17), ambushes and run disconnects unchanged (2.7 met, 1.9 disconnects in 19 runs), the elder gate met in 31% (29).

**The mixed egg** (paired runs, trait off and on, three archetypes, 50 lines each: attentive, Breach corp, Tune corp; 97 to 154 mixed lives each): corp traces fall from 6.1 to 6.4 a life to 4.6 to 4.7 (about 26% fewer), and visitors greeted rise from 1.0 to 1.2 to 1.5 (about 0.4 more a life). A visitor is shorter and only greeted when the player is around, so the traces removed do not all show up as greeted visits. In the same runs the hunters met on Rogue lives fell from 0.65 to 2.13 to 0.11 to 0.66, and capture from 3.6 to 4.8% to 1.4 to 2.8%.

Reading it:
1. **The trait does what E1 drafted on the hunt side**: the trail hunter comes about a quarter as often, and capture halves (3.4% to 1.7% of Rogue lives). Marks a life fall by about a quarter (home sweeps, 0.4, are now most of them).
2. **It barely moves the good end** (33% to 35% a Rogue life, 24% to 25% of first lives), because the good end is gated by a clean Source exit, and a clean exit is lost to ordinary ICE in the Source run, not to the hunter. The small rise is lines that would have been captured or disarmed.
3. **The gap between the lines stays** (Dodge about 65%, the other three 24 to 29%). Dodge's slip avoids ICE fights, so its Source exits are clean; Breach exits the Source most often (89 to 91% of lives) but cleanly only 26%. Balancing the lines means acting on clean exits in the Source (fights met or lost there), not on the hunt.
4. **The trail hunter is close to the point where it stops mattering** (0.18 a life in stage 2; 7.4 called 0.02 "nothing to warn about" at x2 thresholds). The trail meter, the relay question, Handler's agent and Drop's dead drop lean on it, so +2 is near the top of what the trait can give without hollowing the hunt.

**For the maintainer.** Levers for the line gap, not measured: (a) a Source-only help for the Breach, Tune and Feast lines (for example, Breach: one lost ordinary ICE fight in the Source does not spoil "clean"; Tune: its sight shows the Source's ICE types from the start; Feast: a won fight there heals more); (b) relax "clean" to at most one lost fight for every line, which lifts all lines and keeps Dodge ahead; (c) trim Dodge (its slip at the Source). The Deep's disconnects come after this (6.1, item 45).

### 7.8 The line gap: Source-only levers measured (2026-10-11; for choice, nothing decided)

**What was built** (fork, all off by default; `nr2.js` `rogue.source`, set with `ROGUE_RUN='{"source":{...}}'`; tests in `rogue-netrun.test.js`): `breachFree` (Mole and Sleeper may lose that many ordinary ICE fights in a Source run and still exit clean; a lost hunter fight, Sleeper's saved one included, still spoils it), `tuneTypes` (Spook and Handler read every Source ICE's game and tier from the start, as Foresight's fields on the whole map; an ambush shows a decoy reading, so it is not told apart; the planner now uses a known reading on danger-sensed nodes), `feastHeal` (Drop's and Stash's won-fight heal in the Source, ordinary and hunter fights, multiplied), `dodgeSlip` (Skip's and Exile's slip in the Source, ordinary ICE and Exile's ambush slip, multiplied). The lineage driver takes `SPREAD` (uneven per-game skill, `netrun-bot.mjs` `style.spread`). With every lever off the saved `trait` outputs reproduce exactly.

**Measured** (`rogue-lineage.mjs` as 7.7, 200 lines of 10 Rogue lives; jobs in `baseline/rogue-lineage.mjs`, summary `baseline/rogue-levers-summary.mjs`). By line, each line's corp and street steerer, per Rogue life: good end / Source exit / good end in the first Rogue life (a clean exit equals the good end within a point in every row, so it is left out):

| job | Breach | Dodge | Tune | Feast |
|---|---|---|---|---|
| trait (7.7) | 26 / 89 to 91 / 16 to 20 | 65 / 91 to 92 / 41 to 47 | 24 to 26 / 74 to 76 / 9 to 13 | 26 to 29 / 82 / 20 to 24 |
| breachFree 1 | **66** / 89 to 91 / 46 to 50 | unchanged | unchanged | unchanged |
| tuneTypes | unchanged | unchanged | 25 to 27 / 74 to 77 / 12 to 14 | unchanged |
| feastHeal 2 | unchanged | unchanged | unchanged | 25 to 27 / 84 to 85 / 19 to 20 |
| feastHeal 3 | unchanged | unchanged | unchanged | 25 to 27 / 84 to 85 / 18 to 20 |
| dodgeSlip 0.75 | unchanged | 57 to 58 / 87 to 89 / 38 to 44 | unchanged | unchanged |
| dodgeSlip 0.5 | unchanged | 49 to 50 / 82 to 85 / 33 to 38 | unchanged | unchanged |
| uneven skill (SPREAD 0.2), no lever | 26 to 27 / 91 / 18 to 22 | 64 to 68 / 91 to 93 / 44 to 46 | 24 to 28 / 74 to 77 / 14 | 28 / 80 to 84 / 15 to 19 |
| uneven skill, tuneTypes | as above | as above | 29 to 34 / 79 to 82 / 16 to 17 | as above |

Captured stays 0 to 3% in every row. The attentive group (26 archetypes, 7.7's means):

| | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days | per Rogue life: elder / Source exit / clean exit / good end | captured | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|
| trait (7.7) | 98% (worst 94) | 25 / 64 / 84% | 2.8 / 14.3 | 90 / 80 / 35 / 35% | 1.7% | 3.5 |
| breachFree 1, tuneTypes, feastHeal 2 | 99% (93) | 33 / 74 / 90% | 2.3 / 11.6 | 90 / 81 / 46 / 46% | 1.7% | 4.6 |
| the same, dodgeSlip 0.75 | 99% (93) | 32 / 73 / 89% | 2.4 / 12.0 | 90 / 80 / 44 / 44% | 1.7% | 4.4 |
| the same with feastHeal 3, dodgeSlip 0.5 | 98% (93) | 31 / 70 / 88% | 2.4 / 12.3 | 90 / 79 / 42 / 42% | 1.7% | 4.2 |

A Source-run read-out (scratch, 1500 runs a line, careful bot at win 0.7, the elders) shows why: a clean exit means no lost fight, so only a lever that removes losses, or forgives one, moves it. With the types read, Spook and Handler's routing cut lost fights a Source run from 1.36 to 1.33 (the cordons leave little choice, and tier 2 costs a bot only 0.1 of win chance); Stash's x3 heal lifted exits from 31% to 37% but left clean exits at 10%, because a heal never undoes a loss and a healthier careful bot walks into more ICE.

Reading it:
1. **breachFree 1 closes Breach's gap on its own**: 26% to 66% a Rogue life, level with Dodge (65%), and the first Rogue life from 16 to 20% to 46 to 50%. Breach was already the line that exits the Source most (about 90%); forgiving one loss turns those exits clean.
2. **tuneTypes and feastHeal do almost nothing for the good end** (Tune +1 point; Feast a point lower, within noise, with more exits that are not clean). Tune's lever is worth about +5 points only when the player is uneven across the games (SPREAD 0.2), the half a bot with one skill number cannot use; how uneven real players are is unknown.
3. **dodgeSlip trims Dodge as expected** (0.75: 65% to 57%; 0.5: to 49%), at a small cost in its Source exits, and leaves the others where they are.
4. **No mix of these four closes the gap for Tune and Feast.** With the three helps and Dodge at 0.5, the lines sit at Breach 66, Dodge 49 to 50, Tune 25 to 27, Feast 25 to 27%.

**For the maintainer.** If the aim is lines within reach of each other, the measured shape is: the Breach lever as drafted (or not, if Breach should stay a harder line), and for Tune and Feast a lever that acts on losses or on "clean", not on information or heals. Candidates, not built: the same one-loss forgiveness for Tune and Feast (which is 7.7's lever (b) less Dodge; Dodge then needs a trim to stay level); Feast: a won Source fight wipes one earlier loss from that run's count (feeding on it); Tune: one Source ICE a run read and passed without a fight (a skip, as Breach's forgiven loss is a pass). Each needs a run; the forgiveness version should land near Breach's 66% by the Breach result.

### 7.9 The line gap, second round: loss-based levers (2026-10-11; for choice, nothing decided)

The maintainer's options after 7.8, aimed at every line but Dodge: Feast's exit counts as clean at a high Integrity, and Tune can reroll or nullify an ICE fight, counted like Phase (one for the adult, one or two for the elder).

**What was built** (fork, off by default, `nr2.js` `rogue.source`; tests in `rogue-netrun.test.js`): `feastClean` (a Source exit by Drop or Stash also counts as clean at this Integrity or more, read at the exit; an addition to "no fight lost", so a Stash that lost nothing is still clean below it), `tuneReroll` by level (a lost ordinary fight in a Source run is played again, the same game and tier, with no damage and no loss counted, this many times a run), `tuneNullify` by level (this many ordinary fights a Source run passed without a win or a loss, chosen once the fight shows; `nullifyIce`). Hunter fights are excluded from both Tune levers. Bot rule for nullify (`netrun-bot.mjs` `wantsNullify`): pass a fight it is likelier than average to lose (tier 2, or a weaker game under uneven skill), and spend what is left on any fight once the fewest ICE nodes on a path to the exit are no more than the nulls left. Only elders reach the Source, so the adult count never applies while the levers are Source-only.

**Measured** (as 7.8; each lever on its line's two steerers, the packages on the whole attentive group). Per Rogue life: good end / Source exit / good end in the first Rogue life:

| job | the line | good end / Source exit / first Rogue life |
|---|---|---|
| none (7.7) | Feast | 26 to 29 / 82 / 20 to 24 |
| feastClean 100 | Feast | 35 / 82 / 23 to 28 |
| feastClean 90 | Feast | 44 / 82 / 27 to 34 |
| feastClean 80 | Feast | 50 to 51 / 82 / 31 to 37 |
| feastClean 100, heal x2 | Feast | 39 to 40 / 84 to 85 / 25 to 31 |
| feastClean 90, heal x2 | Feast | 55 / 84 to 85 / 35 to 39 |
| feastClean 80, heal x2 | Feast | **65 to 66** / 85 / 41 to 44 |
| none (7.7) | Tune | 24 to 26 / 74 to 76 / 9 to 13 |
| reroll 1 (elder 1) | Tune | 47 to 50 / 83 to 85 / 27 to 29 |
| reroll 2 (elder 2) | Tune | **64 to 67** / 87 to 89 / 35 to 39 |
| nullify 1 (elder 1) | Tune | 33 to 34 / 81 to 83 / 16 to 18 |
| nullify 2 (elder 2) | Tune | 43 to 46 / 86 to 87 / 22 to 26 |

Captured stays 1 to 3% in every row. The two packages, every line (Breach / Dodge / Tune / Feast, good end a Rogue life):

| package | Breach | Dodge | Tune | Feast |
|---|---|---|---|---|
| none (7.7) | 26 | 65 | 24 to 26 | 26 to 29 |
| **even**: breachFree 1, feastClean 80 with heal x2, reroll 2 | 66 | 65 | 64 to 67 | 65 to 66 |
| **softer**: breachFree 1, feastClean 90 with heal x2, nullify 2 | 66 | 65 | 43 to 46 | 55 |

The attentive group (7.7's means):

| | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days | per Rogue life: elder / Source exit / clean exit / good end | captured | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|
| none (7.7) | 98% (worst 94) | 25 / 64 / 84% | 2.8 / 14.3 | 90 / 80 / 35 / 35% | 1.7% | 3.5 |
| even | 100% (100) | 44 / 87 / 97% | 1.8 / 8.5 | 90 / 84 / 63 / 63% | 1.5% | 6.3 |
| softer | 100% (99) | 40 / 84 / 96% | 1.9 / 9.4 | 90 / 84 / 57 / 57% | 1.6% | 5.7 |

Reading it:
1. **Both options work where 7.8's did not**, because each acts on losses: Feast's threshold forgives losses a run's wins have healed back, and the reroll forgives a loss outright about 70% of the time (the bots' win chance).
2. **Feast's threshold and heal are one knob together.** A lost Source fight costs about 50 Integrity and Stash heals 22 a win (44 at x2), so the threshold sets how many wins buy back a loss; 80 with the heal x2 matches Dodge, 90 with x2 sits about 10 points under.
3. **Reroll beats nullify** at the same count (elder 2: 64 to 67% against 43 to 46%), since a reroll is only spent on a loss and a null can be spent on a fight that would have been won. Nullify is the one that plays unlike Dodge (a chosen, certain pass against a chance on every ICE); with the types-reading lever of 7.8 it would let a player pick the fight to pass, which the bots value little.
4. **The even package lines up all four lines at about 65%**, and the group's good end rises from 35% to 63% a Rogue life (first good end 2.8 to 1.8 Rogue lives, 14 to 8.5 days). That is easier overall, not only more even: no target was set for the good end (4.4's targets cover survival, capture and runs, all unchanged here). If the old overall pace should hold, the alternative is to bring every line toward about 50%: Dodge's slip x0.5 (49 to 50%), Feast 90 with heal x2 (55%), Tune reroll 1 (47 to 50%), and Breach needs a smaller help than one free loss (66%), not measured.

**For the maintainer.** Choose a target level for the lines (about 65%, Dodge as it is, or about 50%, Dodge trimmed), then the Tune lever (reroll for the level, nullify for the feel) and Feast's threshold and heal. The Deep's disconnects come after this (6.1, item 45).

### 7.10 The line gap, third round: the lines at about 50% (2026-10-11; for choice, nothing decided)

The maintainer chose to aim the lines at about 50% (7.9's second route), with Breach's free loss as a chance instead of a certainty.

**What was built** (fork, off by default): `breachChance` in `nr2.js` `rogue.source` (default 1). With `breachFree` set, each lost ordinary Source fight of a Mole or Sleeper rolls this chance when it is lost; a success forgives it (at most `breachFree` a run), and the exit is clean if every loss was forgiven and no hunter fight was lost. At 1 no roll is made, so 7.8's `breach1` outputs reproduce exactly (checked). Test in `rogue-netrun.test.js`.

**Measured** (as 7.8). Breach's steerers, per Rogue life, good end / Source exit / first Rogue life: chance 0.5 gives 47 to 49 / 88 to 91 / 38 to 39%; chance 0.6 gives 51 / 89 to 92 / 36 to 43% (none: 26%; certain: 66%). The package **fifty**: Breach's free loss at 0.5, Dodge's Source slip x0.5, Feast clean at Integrity 80 with the ordinary heal (7.9: 50 to 51%, closer to 50 than 90 with the heal x2 at 55%), Tune's reroll 1 for the adult and the elder.

| package | Breach | Dodge | Tune | Feast |
|---|---|---|---|---|
| none (7.7) | 26 | 65 | 24 to 26 | 26 to 29 |
| even (7.9) | 66 | 65 | 64 to 67 | 65 to 66 |
| **fifty** | 47 to 49 | 49 to 50 | 47 to 50 | 50 to 51 |

Good end in the first Rogue life, fifty: Breach 38 to 39%, Dodge 33 to 38%, Tune 27 to 29%, Feast 31 to 37%. Captured 1 to 3% on every line.

| attentive group | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days | per Rogue life: elder / Source exit / clean exit / good end | captured | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|
| none (7.7) | 98% (worst 94) | 25 / 64 / 84% | 2.8 / 14.3 | 90 / 80 / 35 / 35% | 1.7% | 3.5 |
| even (7.9) | 100% (100) | 44 / 87 / 97% | 1.8 / 8.5 | 90 / 84 / 63 / 63% | 1.5% | 6.3 |
| **fifty** | 100% (99) | 33 / 77 / 93% | 2.1 / 10.8 | 90 / 80 / 47 / 47% | 1.6% | 4.7 |

Reading it:
1. **The four lines sit within 4 points of each other (47 to 51%)**, from a spread of 24 to 65%. Tune's first Rogue life stays the lowest (27 to 29%), since its Source exits start lower.
2. **The good end is still easier overall than now** (35% to 47% a Rogue life, first good end 14 to about 11 days), because three lines rise by about 22 points and only Dodge falls, by 15. 7.9 said the 50% route would keep the current pace; that was wrong: the current group mean of 35% is close to the lines' plain average (about 36%), so holding it would put every line at about 35%.
3. **Breach's chance is a fine knob**: about 4 points of good end per 0.1 of chance between 0.5 and 0.6, which matches the read-out (an exit with exactly one loss is about 40% of Breach's lives).

**For the maintainer.** fifty as it stands, or every line toward about 35% to keep today's pace (smaller knobs of the same levers: Breach's chance about 0.25, Dodge's slip lower than x0.5, Feast's threshold above 90, Tune's reroll on fewer fights; not measured). The Deep's disconnects come after this (6.1, item 45).

### 7.11 The lines at about 35%, and the fifty set decided (2026-10-11)

**Decided (maintainer, 2026-10-11):** the fifty set (7.10) is the starting rule for the Source; the thirtyfive set below, which keeps today's overall pace, is kept for tuning after a playtest. In the fork, `nr2.js` `SOURCE_SETS` holds `off`, `fifty` and `thirtyfive`; `fifty` is now the default for `NR2.rogue.source`, and `ROGUE_SOURCE=off|fifty|thirtyfive` (`0` for off) picks a set before `ROGUE_RUN` applies. Every runner measured before this (`baseline/rogue-lineage.mjs`, `rogue-stage2.mjs`, `rogue-dodge.mjs`, `rogue-hide-lock.mjs`, `rogue-deep-levers.mjs`) now pins `ROGUE_SOURCE=0` so its saved outputs reproduce; the lineage runner's `decided-fifty` job runs the new defaults. Run directly, `sim/rogue-netrun.mjs` and `sim/rogue-relay.mjs` now use the fifty set in the Source; `ROGUE_SOURCE=0` gives their earlier tables.

**The search for 35%** (as 7.8, each line's two steerers, good end a Rogue life / Source exit / first Rogue life): Breach's free loss at chance 0.2 gives 35 / 89 to 91 / 28%, at 0.25 37 to 38 / 89 to 91 / 31%; Dodge's Source slip at x0.25 gives 43 / 77 to 79 / 24 to 27%, at x0.1 39 / 73 to 75 / 25 to 26%, at x0 (no slip in the Source) 35 to 36 / 70 to 72 / 27%; Feast clean at Integrity 100 (7.9) 35 / 82 / 23 to 28%; Tune's nullify 1 for the adult and the elder (7.9) 33 to 34 / 81 to 83 / 16 to 18%.

| set | Breach | Dodge | Tune | Feast |
|---|---|---|---|---|
| none (7.7) | 26 | 65 | 24 to 26 | 26 to 29 |
| **fifty** (decided): free loss at 0.5, slip x0.5, clean at 80, reroll 1 | 47 to 49 | 49 to 50 | 47 to 50 | 50 to 51 |
| **thirtyfive** (kept): free loss at 0.2, slip x0 in the Source, clean at 100, nullify 1 | 35 | 35 to 36 | 33 to 34 | 35 |

| attentive group | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days | per Rogue life: elder / Source exit / clean exit / good end | captured | good ends in 10 Rogue lives |
|---|---|---|---|---|---|---|
| none (7.7) | 98% (worst 94) | 25 / 64 / 84% | 2.8 / 14.3 | 90 / 80 / 35 / 35% | 1.7% | 3.5 |
| fifty | 100% (99) | 33 / 77 / 93% | 2.1 / 10.8 | 90 / 80 / 47 / 47% | 1.6% | 4.7 |
| thirtyfive | 98% (95) | 25 / 63 / 84% | 2.6 / 13.9 | 90 / 76 / 34 / 34% | 1.7% | 3.4 |

Reading it:
1. **thirtyfive keeps today's pace** (34% a Rogue life against 35%, first good end 13.9 days against 14.3) with the four lines within 3 points (33 to 36%), where today they span 24 to 65%.
2. **Dodge needs its slip gone in the Source to come down to 35%**: the slip's effect flattens near zero (x0.25 43%, x0.1 39%, x0 35 to 36%), since Dodge also keeps its lighter trail and the hunter's lower threshold. In the fiction that is the Source seeing through Skip and Exile; it is the most visible change in either set.
3. **thirtyfive swaps Tune's reroll for nullify** (the version that plays least like Dodge's slip) and needs no extra heal for Feast; Breach's roll is the same lever at a lower chance.

### 7.12 The Deep's disconnects revisited, both levers decided (2026-10-11)

6.1 item 45: with the Rogue trait decided, the Deep's disconnects (1.84x the hidden form's at 7.4, against 4.4's 1.5x aim) were to be looked at again. A lever in the fork, `rogue.cordonAmbush` (`nr2.js`, off: `{ region: f }` multiplies the ambush share in that region's cordon layers, one draw a node either way, so the decided map is unchanged); test in `rogue-netrun.test.js`. The fifth round of `baseline/rogue-deep-levers.mjs` (today's defaults, the trait on; 3000 Deep runs a form, careful bot; same file, `results/followup/rogue-deep-levers.json`). The hidden form: disconnects 18.1% (elder 10.4%).

| setting | adults: exit / disconnect % | adults: Breach / Dodge / Tune / Feast disconnect % | adults vs hidden | value, adults | elders: disconnect % (vs hidden elder) | relay push / quiet, adults (mean) |
|---|---|---|---|---|---|---|
| **today** (7.4's settings plus the trait) | 42.3 / 31.0 | 27.9 / 30.4 / 33.1 / 32.6 | **1.72x** | 2.81 | 26.1 (2.50x) | 1.20 to 1.60 (1.46) |
| no ambush in the cordon (`cordonAmbush` 0.5) | 43.1 / 29.8 | 26.3 / 29.4 / 32.4 / 31.3 | 1.65x | 2.86 | 25.4 (2.44x) | |
| **no ambush in the cordon** (`cordonAmbush` 0) | 43.7 / 29.2 | 25.6 / 28.4 / 31.8 / 30.8 | **1.61x** | 2.92 | 24.9 (2.39x) | 1.27 to 1.70 (1.53) |
| Deep ambushes 0.2 (from 0.25) | 42.9 / 29.6 | 26.2 / 28.4 / 32.4 / 31.3 | 1.64x | 2.86 | 25.5 (2.44x) | |
| **Deep ambushes 0.15** | 43.6 / 27.9 | 24.1 / 26.7 / 31.3 / 29.3 | **1.54x** | 2.94 | 24.1 (2.31x) | 1.23 to 1.66 (1.49) |
| Deep ambushes 0.1 | 44.4 / 26.1 | 22.2 / 24.9 / 30.1 / 27.3 | 1.45x | 3.01 | 22.9 (2.20x) | |
| Deep ambushes 0 | 45.0 / 24.7 | 19.7 / 22.5 / 30.5 / 26.0 | 1.37x | 3.18 | 22.0 (2.11x) | |
| no cordon ambush + ambushes 0.2 | 44.0 / 28.1 | 24.6 / 26.8 / 31.3 / 29.9 | 1.56x | 2.95 | 24.5 (2.35x) | |
| **no cordon ambush + ambushes 0.15** | 44.4 / 26.9 | 23.1 / 25.4 / 30.7 / 28.5 | **1.49x** | 3.00 | 23.5 (2.25x) | 1.26 to 1.71 (1.53) |
| no cordon (for comparison) | 47.1 / 25.7 | 22.6 / 24.6 / 28.5 / 27.1 | 1.42x | 3.14 | 21.8 (2.09x) | |
| no cordon, no ambushes (the floor) | 49.3 / 20.0 | 15.3 / 17.1 / 25.6 / 22.0 | 1.11x | 3.47 | 18.1 (1.73x) | |

Reading it:
1. **The trait already brought it from 1.84x to 1.72x**: its +2 threshold made the trail hunter almost absent in the Deep (0.01 to 0.03 a run), so what is left is the cordon and the ambushes.
2. **Keeping ambushes out of the cordon, the smallest change named in 7.4, is not enough on its own** (1.61x). Lost ambushes are about 11 points of the adults' 31% (0.11 a run) and the cordon layer holds only part of them.
3. **1.5x needs the Deep's ambush share lowered**: 0.15 alone gives 1.54x, with no cordon ambush 1.49x. The cordon itself, forcing a fight every run, is worth about 5 points (no cordon: 1.42x); both off leave 1.11x, so the rest of the gap is the kits, not the hunt.
4. **The elders stay at 2.1 to 2.5x whatever is done**, since the hidden elder is the strongest runner in the game (7.4 said the same); 4.4's aim reads as the adults'.
5. **Tune is the outlier**: Spook's disconnects barely move (33.1% today, 30.5% with no ambushes at all) while the other three fall 7 to 8 points, since Spook already tells ambushes apart and meets the fewest; ambush levers help it least.
6. **The relay question holds**: going on past the relay pays 1.49 to 1.53x what jacking out there pays on the adults against today's 1.46 (9.7 aims at about 1.33), since fewer ambushes after the relay make going on a little safer. A Deep run banks 4 to 7% more.
7. Not run: whole lives (`rogue-stage2.mjs`) for any candidate; per run the change is 2 to 4 points of disconnects in one region, so capture and the elder gate should move little, but that is not measured.

**Decided (maintainer, 2026-10-11): both** (6.1, item 50): no ambush in the Deep's cordon and the Deep's ambush share 0.15, now the fork's defaults (`nr2.js`: `rogue.cordonAmbush: { deep: 0 }`, `rogue.ambush.deep` 0.15). Both are kept as levers for after a playtest, if human players find the Deep a little easier than the bot does: the share back toward 0.25 first, then the cordon ambushes (`cordonAmbush` 0.5 or 1). `ROGUE_DEEP=0` gives the Deep as it was before (share 0.25, cordon ambushes drawn as anywhere); every runner measured before this pins it (`baseline/rogue-stage2.mjs`, `rogue-lineage.mjs`, `rogue-dodge.mjs`, `rogue-hide-lock.mjs`, `rogue-deep-levers.mjs`), and their saved outputs reproduce (checked on the Deep sweep: byte-identical). Run directly, `sim/rogue-netrun.mjs` and `sim/rogue-relay.mjs` now use the new Deep. The two runners' `decided-deep` jobs measure whole lives at the new defaults (below).

**Whole lives at the new Deep** (`rogue-stage2.mjs`, job `decided-deep`, attentive group, 300 lives of each of the 26 hourly archetypes; against `decided-trait`, so only the Deep differs): full life 98.4 (98.5), captured 1.6% (1.5; worst archetype 3.3, from 4.0), ambushes met 1.9 a life (2.7) and lost 0.45 (0.67), run disconnects 1.74 a life (1.89) in 19.3 runs, the Deep cleared in 76.5% (76.2), the elder gate met in 33.6% (31.1). Capture does not move beyond sampling noise (a lost ambush never marks, 7.4); the elder gets a little easier.

**The lineage side at the new Deep** (`rogue-lineage.mjs`, job `decided-deep`, 200 lines of 10 Rogue lives for each archetype that runs; against `fifty`, the defaults before it; table in `rogue-lineage-summary.mjs`): good end within 10 Rogue lives 100% (worst 98, from 99), by Rogue life 1 / 3 / 5 35 / 79 / 95% (33 / 77 / 93), first good end a median 2.0 Rogue lives, 10.4 days (2.1, 10.8), per Rogue life elder / Source exit / good end 91 / 81 / 48% (90 / 80 / 47), captured 1.5% (1.6). By line (good end a Rogue life, the two steerers): Breach 46 and 50% (47, 49), Dodge 50 and 50 (50, 49), Tune 50 and 53 (47, 50), Feast 51 and 51 (51, 50). Everything is within a few points: the good end's pace and the balance between the lines stay where 7.11 left them.

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
- Foundling and Alias keep the one-band hint (it swaps phase with the frame, as Blank's does); whether the young forms should hint at the sweep instead was open here. *(Decided in 6.1, items 30 and 31: Foundling keeps the hint; Alias shows two bands and the sweep hint.)*

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

Ids as in 7 (`rogueBaby`, `rogueTeen`, `rogueAdultBreach` and so on); display names map onto them in `form-ids.js` when chosen. The Dex shows `???` (6.1, item 7). Dex hints are not drafted; Rogue's meter words and death register are drafted for choice in 10.5 and 10.6.

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
- **Open, for after the first pass:** *(decided 2026-10-11 that Rogue gets one, 6.1 items 42 and 45; drafts in 9.4a)* a Rogue trait of its own (for example one that cuts the trail of every run by a little), which would only streak within Rogue lives.

### 9.4a The Rogue trait (drafts for choice, 2026-10-11)

Fixed by decision (6.1, items 42, 43 and 45): Rogue gets a trait of its own, and the mixed egg (an NL-0 netling hatched after a good end, the Rogue its parent) carries it **on top of** the trait it inherits as usual; a new mixed egg needs a new good end. Two choices remain: who carries the trait, and what it does. Nothing here is simulated. Today's frame for comparison: a netling holds one inherited trait (its parent's adult form's, at a level that streaks up to III) plus its grandparent's as history at half strength, and every trait so far acts at home (`sim.js`, `TRAIT_CFG`).

**Who carries it.**

| | Rogue lives | the mixed egg | its child | notes |
|---|---|---|---|---|
| **C1, innate to the egg (recommended)** | every Rogue has it, beside its role trait | has it for its one life, beside its inherited trait | does not | a second slot that is never inherited, always level 1 (no streak, no history), so it lasts exactly one mixed life per good end (item 43) and leaves the role-trait streaks across eggs (9.4) alone |
| C2, the mixed egg only | role trait only | as C1 | does not | simplest, but Rogue lives then have no trait of their own, which item 45 asks for |
| C3, Rogue's inherited trait (9.4's first idea) | in place of the role trait; streaks within Rogue lives | inherits it as its ordinary trait | ordinary inheritance | not recommended: it conflicts with item 42, since the mixed egg would carry the Rogue trait *instead of* the role trait that should continue, and Rogue lines lose the role-trait streak with the NL-0 eggs |

**What it does.** Under C1 it must work under both rule sets: the hunt (Rogue lives) and the NL-0 rules (the mixed egg). Strength as the other traits (a full value, scaled by level; at C1 always level 1). Names are placeholders.

- **E1, Unsigned (recommended): whatever hunts it finds it less.** Rogue: every region's trail threshold +2 (about +13% on the decided thresholds of 14 to 18), so the trail hunter comes later in a run. The mixed egg: corp traces 25% less often (its signature was never the corp's). *For:* one idea in both rule sets, cheap to explain and to simulate (`NR2.rogue.threshold`, `traceChancePerHour`). *Against:* the mixed egg's part overlaps Untraceable (separate traits, so an Untraceable line gets both, each under its own cap). *Balance:* +2 sits between the decided x1.5 thresholds and the x2 setting that made the hunter vanish (7.4), so it lowers capture and hunters met; that is why the Deep's disconnects wait for this choice (item 45).
- **E2, Second sight: the egg's danger sense, carried over.** Rogue: its danger sense also tells an ambush from ordinary ICE one step past its ordinary sight (Spook and Handler, which already do, see one step further still). The mixed egg: at a run's start, the nodes of the first three layers show danger or quiet. *For:* the most distinctive; the merge shows in play, and it is Rogue's own mechanic. *Against:* the first trait that acts in runs, not at home (it breaks the trait frame), it needs a danger and quiet display in NL-0 runs, and the bots use information poorly (as measured for the Tune forms), so the simulator would understate it.
- **E3, Off the books: the quiet ways stay quiet.** Rogue: market purchases and anomaly choices add no trail (moves and lost fights still do). The mixed egg: checkpoints never notice it (Rogue's checkpoint part, 6.1 item 6). *For:* a clear trade for Rogue (shop and choose freely, still pay for distance and fights) and it pairs with Drop's market perk. *Against:* for the mixed egg, unnoticed checkpoints also mean no checkpoint Standing (HIDE at a checkpoint is a Standing source), so it nudges the mixed egg's lean, which the NL-0 eggs' Standing design does not expect.

**Decided (2026-10-11, 6.1 item 48): C1 with E1**, with the mixed egg's half changed: its removed traces become visitors (a quarter of its traces arrive as a visitor instead). Built in the fork as `sim.js` `ROGUE_TRAIT`; measured in 7.7. The plan as first written: build it in the fork, re-run stage 2's attentive group and the lineage measure (7.6), and look at the Deep's disconnects again with the trait on (item 45).

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


*(2026-10-11: items 1 to 5 are settled. The abilities in the 9.2 table, elders included, are the decided starting points and are built in the simulator (7.4); the per-elder alternates were not taken. The perks, Untraceable on the sweep, danger sense and the keepsakes are built as drafted, 7.1 and 7.4. The list is kept for the record.)*

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

## 10. The rest of the text (drafts for choice, 2026-10-12)

The text section 10 listed as not done: the abilities' flavor, the sweep's and the hunter's wording, Rogue's meter words and its death register. Nothing here is implemented, read in context, read on a device or played; every line is a first draft for the maintainer to choose and edit. Lengths are in characters, counted by script; 1.0's ability lines run 32 to 121 (`src/netrun/run.js`, `FORM_ABILITIES`).

### 10.1 Rogue's own register

The pages already have a register (the hunters' files, codex drafts). The netling's side needs one too, for the log, the HUD and the death screen. **Proposal: a fugitive's tradecraft, terse, in the status-line voice the reveal set** ("rogue/ owner: none source: copied status: running", "it was not invited. it is asking anyway.", "found: NL-0, initial commit. it is not a copy."). Under the egg's own rules (care drafts' Frame): log lines lowercase with `> `, run messages with no prefix, `!!` on the penalty lines, button labels in capitals at 9 characters or fewer, no number the player is not already shown, and the netling as "it". The hunters are "they" and are never named, as on the pages.

The base vocabulary stays software (Rogue is a copy of the precursor code, so its virus is a virus and its bug a bug); only the hunt and a few meters take tradecraft words. Words kept out: the form names (Mole, Skip, Spook, Drop, Sleeper, Exile, Handler, Stash, Alias, Foundling) as common words, "drop" anywhere (8.3's caution), "slip" outside a run (Wetware's fault word), "fever", "drift", "worn", "reboot", and the anomaly button LEAVE IT (1.0, "do nothing").

### 10.2 The abilities' flavor

Format as the netrun drafts' 3.5: a name, a one-line description in the Dex and the run's ability line (1.0's `FORM_ABILITIES` style: "Name: what it does."), and the log line the run prints when the part acts. The elder line says what it adds, as 1.0's `MAINFRAME_ABILITIES` do. The placeholders of 9.2 are kept where they read well and changed where they collide.

**The egg's own part (every Rogue form that jacks in):**

| Name | Description | Log line |
|---|---|---|
| **Tradecraft** | Every node reads as danger or quiet from the start. Checkpoints never notice it. (80) | at the run's start: `danger and quiet, every node. no names yet.`; at a checkpoint: `the checkpoint never looked up.` |

**The four lines:**

| Form | Name | Description | Log line |
|---|---|---|---|
| Mole | **Inside man** | ICE hits it for less, and a hunter hits it no harder than plain ICE. (68) | on a hunter fight: `it has worked for them. it knows how they hit.` |
| Sleeper | **Deep cover** | ICE hits it for less still. Once a run, a lost hunter fight costs no mark and no link. (86) | `lost to the hunter. kept its cover.` |
| Skip | **On the lam** | ICE often never notices it, and it leaves half the trail on the move. (69) | on a slip: `gone before the ICE turned on.` (maintainer; it reads both ways: before the ICE switched on, and before it turned on it) |
| Exile | **Over the wall** (maintainer, for Long gone) | Unnoticed more often, and it can slip past an ambush. (53) | `the ambush closed on an empty node.` |
| Spook | **Wiretap** (maintainer, for Listening post) | Sees node types two steps ahead, and hears an ambush a step further. (68) | when it tells an ambush apart: `ambush ahead. it heard them set up.` |
| Handler | **Agents out** | Three steps ahead, ambushes at four. Once a run it sends an agent the other way. (80) | `an agent went the other way. the trail followed it.` |
| Drop | **Foldering** (decided, maintainer; was Dead letter) | Finds more in caches and on beaten ICE, mends on a win. It can plant an item at a relay. (88) | `saved to drafts at the relay. the trail ends there.` |
| Stash | **Hoard** | Finds more, mends more. What it plants at a relay is still there when it gets out. (82) | at the run's end: `the drafts were still there. all of them.` |

Notes:
- **Two new buttons.** Handler's agent and Drop's relay item are the player's to use (the bot chooses them in the fork), so each needs a label: **SEND OUT** (Handler, any node, once a run) and **PLANT** (Drop and Stash, at a relay). PLANT replaces "leave", which would collide with the anomaly button LEAVE IT. Their hints, numberless: SEND OUT `throws them off for a while`; PLANT `one item, and the trail goes cold here`.
- **Renamed from 9.2:** Drop's *Dead drop* is **Dead letter** (a dead letter box is the British name for the same thing), for 8.3's caution; Handler's *Runs agents* is **Agents out**, a name rather than a phrase. *Hoard* stays (Stash and hoard are near, but one is a form and one a part, as Hardened and Firewall were in 1.0); the alternate is **Nest egg**.
- **Inside man's line** echoes `rogue-breach` (a desk on the hunters' own floor). **Hoard's line** echoes `rogue-feast` ("the bag came back lighter"). **Agents out** is Handler's split shadow in play (8.4i).
- **The Source rules (6.1, item 49) stay out of the descriptions** (the Dex would then carry four Source clauses the player meets late), and each gets a log line when it acts, so it is learned in play:

| Line | Source rule | Log line |
|---|---|---|
| Mole, Sleeper | one lost ordinary fight forgiven, at a roll | `that one did not count. no one saw it.` |
| Skip, Exile | the slip works half as often | none (a reduction has no moment) |
| Spook, Handler | one lost ordinary fight replayed | `it heard that one coming the second time.` |
| Drop, Stash | the exit counts as clean at Integrity 80 or more | at the exit: `out with enough left. clean.` |

- **Alternates:** *Tradecraft* as **Gut feeling** (plainer, and it names the shut third eye's sense rather than a skill). *Wiretap* and *Over the wall* were alternates here and are now the names (maintainer, 2026-10-12); Over the wall is a prison break, which suits the elder that does not come back (`rogue-dodge`, "file stays open").
- **Foldering (decided, maintainer, 2026-10-12, with PLANT).** Foldering is the digital dead drop: two people share one mail account and leave messages as unsent drafts, so nothing is ever sent and nothing crosses the wire to be read. *For:* it is the digital form of Dead letter on Rogue's software base, it avoids the word "drop", and a drafts folder is something that fills up, which leads into the elder's **Hoard** (the folder became a hoard; the hoard line above now says so). *Against:* few players know the term, and on its own it reads as filing. Proposal: take it, and let the log lines teach it ("saved to drafts at the relay", "the drafts were still there"), the way "skip trace" carries itself on its page. The button can stay **PLANT**, or become **DRAFT** (5) to match; DRAFT ties the button to the name, PLANT says what happens to the item. Dead letter stays the alternate.

### 10.3 The sweep (at home)

The sweep takes the trace's and the intrusion's slot (6.2), so it needs the event bar, the alert line, a notification and its log lines.

**Event bar and answers.**

| 1.0 | Rogue | Note |
|---|---|---|
| Corp trace and Intrusion | **SWEEP** | the fork's label already |
| HIDE | **LIE LOW** | HIDE means street Standing on the NL-0 eggs; Rogue has none, so the word is free to be its own |
| DEFEND | **COUNTER** | countersurveillance; it plays the intrusion's mini-game as DEFEND does |
| Decoy (item) | Decoy | unchanged; the item name is the same in every egg |

**Alert line** (key `sweep`; it replaces `trace` and `attack` for Rogue):
- `Sweep inbound. LIE LOW or COUNTER within Nm.` (45 with two digits)
- In the HIDE lockout: `Sweep inbound and no cover. COUNTER within Nm.` (47)

**Notification:** class Events, title **Netling: sweep inbound**, body the alert line (care drafts, Notification texts).

**Log lines.**

| Moment | Line |
|---|---|
| A sweep starts | `> !! sweep inbound. 90m to get clear.` |
| LIE LOW | `> it lay low. the sweep went past.` |
| The lockout starts (with LIE LOW) | `> that route is burned. no cover for 4h.` (the fork's "route burned. no cover for Nm.", in the log's voice) |
| LIE LOW refused in the lockout (the button's hint) | `no cover yet. COUNTER, or a Decoy.` |
| Decoy | `> the sweep followed the decoy instead.` (the fork's line, kept) |
| COUNTER won | `> sweep countered. they lost the signal.` |
| The quiet after a won COUNTER | `> quiet on every channel. for now.` |
| COUNTER lost | `> !! countered too late. they have a mark on it.` |
| Ignored | `> !! the sweep found it. they have a mark on it.` |
| The second mark (home or run) | `> !! two marks. one more and it burns itself.` |
| The quiet ends (optional, no notification) | `> the channels are busy again.` |

Notes: no line gives the Integrity cost (the HUD shows it; the care drafts' rule). "Mark" is the one word for both home and run, so the player learns that a mark is the same thing wherever it came from. The quiet's end line is optional: it tells an attentive player the 8 hours are over, at no notification cost, but it also turns an unseen timer into a seen one.

### 10.4 The hunter (in runs)

**The HUD.** Two Rogue-only readouts beside the egg's meters (10.5):

| Readout | Label | Hover |
|---|---|---|
| The trail (`run.hunt`) | **TRAIL** | "What it leaves behind. Full, and the hunter comes." |
| Marks (three pips, home and run) | **MARKS** | "Marks they have on it. At three, it burns itself before they can take it." |

**Node marks.** Danger sense draws a mark, not a word, on every node; the screen reader and the hint read **danger** and **quiet**. Once a node is within sight it shows its real label, as on every egg. An ambush Spook or Handler has told apart is labelled **AMBUSH** (6; ICE stays ICE for the rest). The hunter's fight screen is titled **HUNTER**.

**Run messages** (no prefix, `!!` on the penalty lines; the home log adds `> netrun (region): ` before the last one, as on every egg):

| Moment | Message |
|---|---|
| The trail passes half | `something is on the trail now.` (maintainer: moved here from near full) |
| The trail is near full | `hunters are circling closer now.` (maintainer) |
| At a relay, with the trail past half (a hint, the relay question) | `out here, or one more layer?` |
| A cordon on the map (the Deep and the Source, at the start) | `a cordon past the relay. no quiet way through.` |
| The hunter arrives | `the hunter caught up.` |
| The hunter beaten | `hunter shaken. the trail goes cold.` |
| The hunter wins | `!! the hunter got a mark on it. link cut.` |
| An ambush entered | `ambush. they were waiting.` |
| An ambush beaten (its trail still rises) | `ambush broken. they know where it went.` |
| An ambush lost | `!! ambush. a mark, and the link cut.` |
| The third mark, anywhere | `!! third mark. it burned itself before they could.` (see 10.6, capture) |

Notes: the trail lines are numberless, like the egg anomalies' hints; the meter shows the count. The cordon line says "past the relay" because a cordon always sits after one (9.7), which holds in the Source's second cordon only loosely; a plainer alternative is `a cordon ahead. no quiet way through.` The relay hint is the one line that asks the player something; it shows only when the trail is past half, so it does not nag a quiet run.

### 10.5 Rogue's meter words

Rogue has all four meters and the cache, with no main bar (6.1, item 3). Two sets:

| 1.0 meter | R1, Program's words | R2, two tradecraft words (recommended) | R2 hover text |
|---|---|---|---|
| Charge | CHG | CHG | "Charge. Feed it." |
| Sync | SYN | **TRUST** | "Its trust in you. Play with it." |
| Integrity | INT | INT | "Its soundness. At zero too long, it goes dark." |
| Heat | HEAT | HEAT | "Running hot hurts it. Cool it." |
| Cache (pips) | CACHE | **BURN** | "What it must not leave behind. Shred it." |

- **R1** says the copy outright: Rogue reads like Program because it was cut from the same code, and the hunt (TRAIL, MARKS) carries all its difference. Cheapest; no new word to learn.
- **R2 (recommended)** gives Rogue a screen of its own with two words that fit a fugitive and collide with nothing: TRUST (the player is the one contact it has; Sync's "play with it" reads true) and BURN (a burn bag, the waste a spy has to destroy). With BURN, the purge button is **SHRED** and the overflow event **BAG FULL**, answered by SHRED; every other label stays Program's. The alert lines follow: `Trust is fading. It wants to play.`; `The burn bag is filling up.`
- **Not proposed:** COVER for Integrity (strong, but a blown cover reads as capture, and capture is the marks, not Integrity); a tradecraft word for Heat ("heat" already means pursuit in the slang, and LIE LOW raises the meter, which would read backwards). Heat stays HEAT and is plainly the temperature.
- The run HUD follows the meter words, as on every egg (care drafts, decided).

### 10.6 The death register

The other three each end in their own way (Program a flatline, Iron a decommission, Wetware a waking), which answers the Source's TODO three times. Rogue's copy had that line cut (`rogue-source`), so its register should be **one that does not stop**: it is not over, only out of reach. The one real stop is the good end, "it stayed" (5.4).

**D1, gone dark (recommended).** A fugitive who goes dark drops off every channel and is not heard from again. Nothing says it ended.

| Where | 1.0 | Rogue (D1) |
|---|---|---|
| Death screen header | FLATLINE | **GONE DARK** (9) |
| Death screen line | `netling.vN.0 is gone: CAUSE.` | `netling.vN.0 has gone dark: CAUSE.` |
| Log | `> FLATLINE: CAUSE. fragment recovered: TRAIT.` | `> GONE DARK: CAUSE. left for pickup: WHAT.` (WHAT is what crosses: the trait on a full life, else the keepsake) |
| Cause, old age | end of life cycle | **end of the line** (the lineage and the run, both) |
| Cause, collapse | integrity collapse | integrity collapse (unchanged; a plain fact reads well beside "gone dark") |
| Capture | (none) | header **TAKEN**; line `netling.vN.0 was taken: three marks. it burned itself first.`; log `> !! TAKEN. it burned itself first. nothing left for them to open.` then the pickup line (see below) |
| The good end | (none) | **STAYED** when the next egg is Rogue, **MERGED** when it is an NL-0 egg (the mixed egg); decided (maintainer, 2026-10-12). Lines and the order of screens below |

**Capture as a self-destruct (maintainer, 2026-10-12).** At the third mark the hunters do not get it: Rogue would rather delete itself than be taken, so the life ends by its own hand an instant before capture. Text only; the rule is unchanged (three marks end the life, block the good end and pass no trait line; the quirk key, keepsake and scrip still cross, 6.1 item 46; the fork's cause stays `captured`). It fits what is already there: the pages show the corp losing, the hunters' file closes empty, the fragment still goes to the player ("left for pickup"), and BURN (10.5) is already the meter for what must not be left behind, so the last thing in the burn bag is itself. TAKEN stays the header (maintainer): the hunt took it from the player, even though the hunters got nothing.

Drafts for the third-mark line (run message and home log; the death screen line above follows the chosen one):

| | Line | Note |
|---|---|---|
| a (decided) | `!! third mark. it burned itself before they could.` | plain; says who acted and that the corp lost |
| b (maintainer's) | `!! third mark. burn notice in effect.` | ties to BURN and reads well, but a burn notice is, in the real term, issued by an agency to disown its own agent; a player who knows it may read the corp as the actor. It works if read as Rogue disowning itself, which no one else would do for it |
| c | `!! third mark. into the burn bag, last of all itself.` | the BURN tie made explicit; longer |
| d | `!! third mark. self-destruct.` then `> it left them nothing.` | the maintainer's word; two lines |

Death screen alternates to the recommended line: `netling.vN.0 was taken: three marks. self-destruct.`; or a header **BURNED** in place of TAKEN (closer to what happened, and D2's one good fit; not recommended, since TAKEN was the maintainer's call). Art note: a self-destruct invites a death animation or mark of its own; not drawn, and it must keep to the flash rule (nothing faster than three times a second).

**The good end's two headers (decided, maintainer, 2026-10-12).** A good end is recorded by what the player does next. If the next egg is **Rogue**, the line goes on as any Rogue rebirth does and the generation is **STAYED**; if it is **Program, Iron or Wetware**, the next netling is the mixed egg (6.1, item 42) and the generation is **MERGED**. Drafts:

| | STAYED (next egg Rogue) | MERGED (next egg NL-0) |
|---|---|---|
| Death screen line | `netling.vN.0 stayed.` | `netling.vN.0 merged into iron/.` (the chosen egg's name) |
| Log | `> STAYED. left for pickup: TRAIT.` | `> MERGED: rogue/ into iron/. left for pickup: TRAIT.` |
| Epilogue (5.4) | none; the log adds `> it was not invited. it stayed.` so the reveal's echo chain still closes | the epilogue (the full one the first time, its last two lines later, 6.2) |

**The screen order (decided, maintainer, 2026-10-12: the egg prompt first).** Today the death screen comes first and the egg prompt after it (COMPILE; NETLING_2_UI.md), so at the death screen the next egg is not known yet. Decided: on a good end only, **the egg prompt comes first** (it is the merge choice in all but name, and the epilogue already needs the chosen egg), then the epilogue for MERGED, then the death screen with its header. The choice not taken was to keep the order, show a neutral line on the death screen, and write STAYED or MERGED only into the log, the Lineage tab and the credits' git log once the egg is picked; that keeps one flow for every death but leaves the moment without its word. Either way the record (Lineage, credits) carries the header.

**NL-0's rescue.** The fork lets Root Access pull a Rogue back from integrity collapse (never from capture, old age or the good end; `sim.js`, `rootRescue`). NL-0 reaching a line that is not its own deserves a line of its own: `> NL-0: not mine. not yet. (integrity collapse reversed. root access spent for this generation.)` Optional, on a capture with Root unspent: `> NL-0: i cannot reach them.` Both name NL-0, which Rogue's player already knows (the gate is the ending).

**Alternates.** **D2, burned** (an agent whose cover is blown): strong for capture, wrong for old age, and close to the lockout's "route burned". **D3, signal lost**: plain and safe, but it sits next to Program's flatline and says nothing of Rogue.

**Not drafted here:** Rogue's dead and asleep sprite marks (art; the other eggs have a chest mark each, NETLING_2_SPRITES.md), and its failure words (virus, cache, fault, bug, the clearing button), proposed to stay Program's under either meter set, with BURN replacing the cache word under R2.

### 10.7 For the maintainer

1. The register (10.1): tradecraft on a software base, the netling as "it", the hunters as "they".
2. The ability names and lines (10.2), the two buttons SEND OUT and PLANT, and whether the Source rules show only as log lines.
3. The sweep's labels LIE LOW and COUNTER, the alert lines and the log lines (10.3), and whether the quiet's end gets a line.
4. The hunter's HUD words TRAIL and MARKS and the run messages (10.4).
5. Meter words: R1 or R2 (10.5).
6. Death register: D1, D2 or D3 (10.6), the capture header TAKEN, the good end's STAYED, and NL-0's rescue line.

**First review (maintainer, 2026-10-12).**
- **Decided:** Skip's line `gone before the ICE turned on.`; **Wiretap** (Spook) and **Over the wall** (Exile); the sweep's lines as drafted (10.3); the trail's half line `something is on the trail now.` and near-full line `hunters are circling closer now.`; **R2** for the meter words (TRUST, BURN; SHRED and BAG FULL with it); **D1, gone dark**, with every row but capture as drafted; both NL-0 lines; the third mark as a **self-destruct**, under the header **TAKEN** (10.6).
- **Second review (maintainer, 2026-10-12), all decided:** **Foldering** for Drop with **PLANT** (Dead letter dropped; DRAFT not used); the third-mark line **(a)**, `!! third mark. it burned itself before they could.`, with the death screen line `netling.vN.0 was taken: three marks. it burned itself first.`; the rest of 10.2 as drafted (Tradecraft, Inside man, Deep cover, On the lam, Agents out, SEND OUT, the Source log lines); the rest of 10.4 as drafted (TRAIL, MARKS, danger and quiet, AMBUSH, HUNTER, the run messages); the good end **STAYED** for a Rogue next egg and **MERGED** for an NL-0 one.
- **Third review (maintainer, 2026-10-12):** the good end's screen order as proposed (the egg prompt first, then the epilogue for MERGED, then the death screen with its header), and the STAYED log lines as drafted. **Section 10 is fully decided**; what is left is in section 11.

### 10.8 One feed: SCAVENGE (decided, maintainer, 2026-10-12)

**Decided (maintainer):** Rogue has no Standing, so it has **one feed button, SCAVENGE** (8 characters), not the corp and street pair. The other two eggs' two feeds differ by Standing (and Program's corp packet gives a little more Charge, the scavenged one rolls an infection), so with no Standing the second button has no reason to exist. The control bar keeps its place: the empty slot can stay dim or the row can close up (a layout question for the 2.0 UI pass, NETLING_2_UI.md). Rogue's packet is the scavenged one: 25 Charge, no Standing, no trail at home (6.1 item 5: feeding never adds trail).

**What one packet breaks, and the answers (proposed, then decided by the maintainer, 2026-10-12; the fork's default now, `ROGUE.oneFeed` with `oneFeedVirus` 0.5; `ROGUE_FEED=0` gives the two feeds back and pins the earlier saved runs; tested in `rogue-sim.test.js`):**
- **The temper packet preference** (a steady netling likes the same packet again, an unsteady one a change) has nothing to choose between: a steady Rogue would match on every feed and an unsteady one never. **Proposal: off for Rogue's feeds.** Temper still shows in the games' preference and in the three tells (10.9).
- **The favorite-packet quirk** (+8 Sync on its favorite) would fire on every feed for half of Rogues and never for the others. **Proposal: it does nothing on a Rogue;** the quirk key still crosses lives, so a later NL-0 netling keeps it.
- **Licensed** (corp packets give more Charge) can reach a Rogue as an inherited trait after the first good end (a Feast corp parent). **Proposal: it acts on SCAVENGE,** so an inherited trait is never dead weight.
- **The infection roll.** Every Rogue feed would now roll it (12% a feed). The open choice below.

**Measured** (fork, 300 lives of each of the 37 archetypes, the decided Rogue settings, `MERGEBOT=refuse`; measured while the switch was off by default, so the two-feed row now needs `ROGUE_FEED=0`, and the F2 row is the fork's default; outputs `baseline/results/followup/rogue-onefeed-*.json`; Program's line is the same settings with Program as owner, for scale):

| | full life | infections a life (all / attentive 25) | captured | collapse |
|---|---|---|---|---|
| Rogue, two feeds (today's fork) | 77.9% | 6.05 / 6.8 | 16.6% | 5.5% |
| **F1: SCAVENGE, the full infection roll** | 77.6% | 11.08 / 13.0 | 16.0% | 6.4% |
| **F2: SCAVENGE, the roll at half** | 77.8% | 7.14 / 8.3 | 16.3% | 5.9% |
| Program, for scale | 89.6% | 7.05 | | 10.4% |

1. **Survival does not move** in either case (within 0.3 points, under the 1.5 points of noise at 300 lives; the attentive group is 98.5 to 98.7% in all three). A cure is a button press, and the bots press it.
2. **The workload does.** F1 nearly doubles infections (6 to 11 a life; 13 for attentive players), so an attentive Rogue patches about twice as often as a Program player. F2 puts Rogue at about Program's count (7.1 against 7.05), which is where Rogue's missing intrusion (6.2) had left it a little under.
3. **Decided: F2** (`oneFeedVirus` 0.5; maintainer: "Rogue has it hard enough"). The reason it was recommended: Rogue is meant to be harder through the hunt, not through more chores, and the notification budget (4.4) is the scarce thing for an attentive player; F1 is kept as the harder option (`ROGUE='{"oneFeedVirus":1}'`). The log keeps the infected-payload line: `> scavenged. charge up.`, and on an infection `> scavenged. charge up. !! payload was infected.`

### 10.9 Rogue's chatter and temper tell (decided, maintainer, 2026-10-12)

Rogue's netling speaks in chatter like every egg (first person, lowercase, one line every few hours), so it needs its own lines and its own temper shape for them. Data and tests: `prototype/netling2/rogue-lines.js`, `rogue-lines.test.js`; the shape is in `voice.js` (`chatterTone`, `checkShape`, `ROUTINE`, `STRAYS` for `rogue`; Rogue stays out of `EGGS`, as in `tell.js`, so the launch eggs' tests are unchanged).

**The shape, from the glance.** Rogue's motion tell is a glance over its shoulder (8.1; `tell.js`), so its lines stop to look:
- **Steady:** a check after a fixed count of words, `(clear)` every fifth word (every third strongly). The glance on the beat, finding nothing. Countable, as the other eggs' steady shapes are.
- **Unsteady:** it breaks off to look behind it, `(behind?)`, once somewhere inside the line, then picks the line up again; strongly, it looks back twice and never finishes (the line ends on the look).
- **Idle (the third channel):** steady, a four-step watch on the clock: left, right, behind, still. Unsteady, strays that are never in the watch: flinch, freeze, duck, bolt. Names only; nothing is drawn.

Example (Mole): `i sat at their desk all day. nobody looked up.`

| Steady | Strongly steady | Unsteady | Strongly unsteady |
|---|---|---|---|
| i sat at their desk (clear) all day. nobody looked up. | i sat at (clear) their desk all (clear) day. nobody looked (clear) up. | i sat at their desk all day. (behind?) nobody looked up. | i sat at their desk (behind?) all day. (behind?) |

**Body lines** (one each for the baby, the teen and the four adults; elders have none, as on every egg):

| Form | Line |
|---|---|
| Foundling | nobody sent for me. i came anyway. |
| Alias | new name today. it fits better than the last. |
| Mole | i sat at their desk all day. nobody looked up. |
| Skip | i was gone before they finished the sentence. |
| Spook | they talk on an open channel. i just listen. |
| Drop | i left something for you. same place as before. |

**State lines** (two a state, in the existing Overclock, Overdrive and Overlink groups and hints):

| State | Lines |
|---|---|
| Overclock | running hot. heat shows up on their scans. / too warm to hide well. worth it, for now. |
| Overdrive | full up. i could run for days if i had to. / packed and ready. say the word and we go. |
| Overlink | you are the only one i talk to. keep it that way. / when you play, i forget to look behind me. |

Notes:
- **Echoes:** Foundling's line is the reveal's "it was not invited. it is asking anyway." from the inside; Mole's is `rogue-breach`; Spook's is `rogue-tune` from the other end of the call; Drop's is the dead letter left for the player. The last Overlink line is the glance turned off: closest to the player, it stops checking behind it (its unsteady voicings still look, right after "when you play,").
- **Tested** (`rogue-lines.test.js`): one line per non-elder form; two per state; lowercase, no digits, no em dash; body lines 50 characters or less and state lines 62 (the other eggs' limits); no state name; no Rogue form name as a word and never "drop"; no repeat of any egg's line or 1.0's; every hand-written voicing passes `checkShape`; the steady voicings only add the checks; the machine voicing keeps the shape on any line at every level and seed; and the idle watch and strays.
- **The NL-0 Lineage line** "something out there runs almost like me. it is running from someone." (decided as a background touch, codex drafts) now has its four voicings in each launch egg's shape, as that decision required before it ships (`LINEAGE_ROGUE_LINE`, id `lin-almost-like-me`, tested). Program: `something out there runs / almost like me. it / is running from someone.`, clipped `something out there runs almost -`; Iron: `1: something out there. 2: runs almost like me. 3: running from someone. ok.`, bell `UNKNOWN UNIT RUNNING!`; Wetware: `something out there ... runs almost like ... me. it is ... running from someone.`, mid thought `-- there runs almost like me. it is running from someone.`. The strong voicings are in the file.

**Temper hints for Rogue: none (decided, maintainer, 2026-10-12),** with the Dex hints (10.12). The drafts are kept for the record. The other eggs show one pair of hints per tell channel in the Dex (codex drafts, Temper hints). Rogue's forms show `???` and get no Dex hints (decided, 10.12), so the question is whether the egg's temper hints go too. Drafts, in case they stay:

| Tell | Steady end | Unsteady end |
|---|---|---|
| Motion | Watch where it looks. It checks over its shoulder on the same count, every time. | Watch where it looks. It checks behind it whenever it likes, either way. |
| Idle | Left alone, it keeps watch: each way in turn, then still. Count the checks: the count holds. | Left alone, it flinches at nothing and stops halfway. |
| Chatter | It stops to make sure it is clear. Count the words between checks: the count never changes. | It breaks off mid line to look behind it. |

Dropped with the Dex hints, as recommended, for the reason the maintainer gave for the forms: a Rogue player has read every other egg's hints by then, and the glance, the watch and the checks are the same three tells in a new skin.

### 10.10 The good end's offer (decided, maintainer, 2026-10-12)

At a clean Source exit (no fight lost on the run, hunter fights included; 6.1 item 41) a Rogue elder is offered the good end at once; declining keeps it armed for the elder's death at the end of its life cycle, unless a later mark disarms it (item 13), and another clean exit re-arms it and offers it again.

**The offer** (on the run's end screen, after the Source's results and, on the first exit, after `> found: NL-0, initial commit. it is not a copy.`):

```
the Source is behind it. it found the line its copy was missing.
it can stay.
```

| Button | Label | Hint |
|---|---|---|
| Accept | **STAY** | `this life ends here, by choice.` (31) |
| Decline | **NOT YET** | `it can stay later, if not marked.` (33) |

**Log lines around it:**

| Moment | Line |
|---|---|
| STAY | the good end flow (10.6: the egg prompt, the epilogue for MERGED, the death screen) |
| NOT YET | `> not yet. it can still stay when its time comes.` |
| A later mark disarms it | `> !! they marked it. staying is off until it comes out clean again.` |
| Another clean exit re-arms it | the offer again (STAY, NOT YET) |
| An armed elder reaches the end of its life cycle | the good end flow, no prompt (it was already chosen by declining) |

Notes: STAY carries the echo chain ("it was not invited. it stayed.") into the button itself; NOT YET is NL-0's own "not yet" from the Root rescue line, which a Rogue player has seen. No line says "good end", "merge" or "armed". Hints are kept to 35 characters, the length of 1.0's longest anomaly hint and the tutorial's hint limit. The hint for NOT YET is the one place the player is told that a mark matters after the Source; it is a rule they need to make the choice, and it gives no number. Alternate labels: **STAY HERE** (9) and **KEEP GOING** (10, one over the limit, so not used); **GO ON** for NOT YET (shorter, but "go on" also reads as "continue to the good end").

### 10.11 The Rogue trait's name and description (decided, maintainer, 2026-10-12: Unsigned, with both descriptions)

The trait (6.1 item 48; 9.4a, C1 with E1): innate on every Rogue and on the mixed egg for its one life, never inherited. On a Rogue, every region's hunter threshold +2; on the mixed egg, a quarter of its corp traces arrive as visitors. Trait descriptions follow `sim.js` `TRAITS` (a name and a short plain sentence, no number: "Corp traces find it less often").

| Name | On a Rogue | On the mixed egg | Note |
|---|---|---|---|
| **Unsigned** (decided) | `The hunters take longer to pick up its trail.` | `Some corp traces turn out to be friendly visitors.` | unsigned code carries no signature, and the hunt hunts a signature (section 2; the epilogue's "sweep: signature not found") |
| No signature | as above | as above | says the same plainly; longer, and close to the epilogue's line |
| Off the books | as above | as above | tradecraft; it was E3's name for a different effect, which may confuse the record |

Two descriptions, one per rule set, since the trait does different things on the two; the Lineage tab and the Dex show the one for the netling's egg. "Friendly" is there because a corp trace that becomes a visitor would otherwise read as a corp visit.

### 10.12 The Dex (decided, maintainer, 2026-10-12)

**No Dex hints for Rogue's forms; each shows `???` until found.** A Rogue player has played every NL-0 egg; with four adults, one per game, and no Standing, evolution by wins is intuited from the other eggs. This closes 8.5's open item.

## 11. Not done

- ~~The reveal choice, the background touches and Rogue's own codex pages.~~ The reveal, the pages and the background touches decided (codex drafts, 2026-10-11 and 2026-10-12).
- ~~The Rogue abilities' flavor text, the sweep's and hunter's wording, Rogue's meter words and death register.~~ Drafted for choice (section 10, 2026-10-12).
- ~~Still to write: the good end's offer, the Dex hints, the Rogue trait's name and description, the feeds, the chatter voicings.~~ Drafted for choice or decided (10.8 to 10.12, 2026-10-12): one feed SCAVENGE with F1 or F2, Rogue's chatter shape and lines, the NL-0 Lineage line's voicings, Rogue's temper hints (recommended dropped), the offer (STAY, NOT YET), the trait (Unsigned), no Dex hints.
- **All of section 10 is decided** (maintainer, 2026-10-12): F2 and the three one-feed answers, the chatter as drafted, no Rogue temper hints, the offer, Unsigned. What is left for Rogue's text is only what a build will turn up (wording read in context and on a device).
- The renderer work the layers need (Sleeper's `hideWorn`, the motion layers including Exile's turn-taking and Handler's arcs beside the head, the glance), and Rogue's dead and asleep marks.
- Simulated since (section 7): home life, the hunt in runs and the lineage side. Numbers not marked decided are starting values, and the targets in 4.4 are a high-side aim.
