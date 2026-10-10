# Netling 2.0: the Rogue egg (drafts)

Status: first design drafts for step 1 of the sketch's Next steps (Draft the Rogue egg), written 2026-10-09 for the maintainer to choose from. Scope agreed for this pass: **the hidden-line base in play, the hunters, and the merge ending.** The reveal, the background touches and Rogue's own codex pages are out of this pass (their drafts stay in [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md), Rogue: background and reveal). The maintainer allowed Rogue to break the other eggs' structure (22 forms, four roles with two leans, one owner bar). Nothing here is decided, simulated or drawn; every number is a starting value for the 2.0 simulator fork to replace. Spoilers throughout.

Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (Hidden egg, Evolution, Elder stage), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the three bars and states), [NETLING_2_NETRUN_DRAFTS.md](NETLING_2_NETRUN_DRAFTS.md) (section 3.4, the hidden ability; section 8, Rogue's direction), [NETLING_2_PERKS_TRAITS_DRAFTS.md](NETLING_2_PERKS_TRAITS_DRAFTS.md) (traits, keepsakes, Decoy), [NETLING_2_STAGE_CARE_DRAFTS.md](NETLING_2_STAGE_CARE_DRAFTS.md) (section 2.6, the notification budget).

## 1. What is already fixed

Decided by the maintainer (sketch, Hidden egg; netrun drafts, section 8):
- Rogue is **not NL-0's line.** An unnamed corp stole the precursor code, finished it separately, and Rogue escaped from that work on its own. It is like NL-0's line in some ways and unlike it in others (how is open; this document proposes how).
- It is **built on the three hidden lines**: Program's Ghost, Iron's Guru, Wetware's Blank.
- That corp's **hunters** pursue it **much more aggressively** than the NL-0 corp pursues the three launch eggs. In runs, the direction is a hunter presence (a clock or a node type) rather than the corp trace. How hard is a balance question.
- Its end of life is a **merge of two lineage fragments from different eggs into a hybrid next generation**, an NL-0 fragment joined with a Rogue one. The merge uses lineage fragments.
- **Gate:** the ending has played and all 18 egg pages are found. Rogue does not appear before then, not even as a corrupted slot. So every Rogue player already holds Root, the whole codex and at least one elder in the Dex.

Assumptions this document makes (to confirm):
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
- Thresholds (starting values): Public Net 10, Bazaar 10, Corp Grid 9, Ruins 9, the Deep 10. These are set against the move counts (6, 7, 7, 7 and 10 middle layers), so a quiet run in a shallow region finishes without meeting the hunter and a noisy one does not; the Deep almost always meets it once. Rogue cannot enter the Source (no elders), which matches A and needs nothing new.
- Relays are the escape: jacking out at a relay ends the run before the hunter, as usual. So the trail adds a real choice to every relay ("one more layer, or out?") and to every fight, checkpoint and market ("is this worth the noise?").
- Why it fits the decided frame: it is a clock, not a triggered ability; no reflexes are needed beyond the existing games; it uses the existing tier-2 ICE and disconnect paths.

**Option H2: ambush nodes.** Hunter nodes are placed ahead on the map (a share per region), visible to Rogue's full sight, and entering one starts the hunter fight. Route choice matters (detours cost caches and relays), but full sight makes it mostly a puzzle with a known answer, and in narrow layers it can force the fight. Cheaper to explain, weaker as pressure. Could be combined with H1 later as a deep-region extra.

**Option H3: a pursuer token.** A hunter enters behind the netling and moves along its path. In layered maps where everyone moves one layer a move, a pursuer either never catches up or catches up at a fixed layer, so it reduces to H1 with more art and code. Not recommended.

### 4.3 The failure: marks and capture

"Failure model: rogue hunters instead of corp traces" (sketch). Proposal: hunters can end a Rogue life, but only after warnings the player can count.
- A **mark** is added by an ignored sweep or a lost hunter fight. Marks are shown (three pips) and last for the life.
- **Three marks: captured.** The life ends (a new death cause, `captured`). The fragment is still written, so the line goes on, but a captured Rogue leaves no keepsake and **cannot merge** (section 5). Root Access does not rescue a capture (as it does not rescue old age): the hunt is the one thing NL-0's permission does not reach, because Rogue is not NL-0's.
- Marks fade, one per 24 awake hours with no new mark (starting value), so a careful player recovers from a bad day.
- Alternative without a new death cause: three marks give a lasting cost instead (for example drains x1.2 for the rest of the life), and the existing deaths do the killing. Gentler, less distinct.

**Recommendation: H1 for runs, the sweep at home, and capture at three marks.**

### 4.4 How much harder (proposed targets for the bots)

"Much more aggressively" needs a yardstick. Proposed, against the NL-0 hidden adults (the closest kit) under the same archetypes:
- Full-life rate: Rogue about 10 points lower for attentive play and about 15 lower for casual (capture and sweeps together), with capture itself under 5% of attentive lives.
- Runs: careful disconnects (lost hunter fights included) about 1.5x the hidden adult's in each region, with the exit rate no more than 10 points lower in the Public Net and the Bazaar, so early runs stay worth taking.
- Notifications: events plus requests at or under 6 per 15 awake hours for every archetype (section 4.1).
- The maintainer may prefer a different size; these are a first stake in the ground for the bots to test.

## 5. The merge ending

### 5.1 When it happens

The merge is offered when a **Rogue adult dies of old age** with fewer than three marks. Any other Rogue death (neglect, integrity collapse, capture) is an ordinary rebirth, so the merge is the reward for surviving the hunt to the end of a life. A Rogue that is not merged is reborn as Rogue (if the player picks it again, per A1) and the hunt goes on.

### 5.2 What the player chooses

At that death, before the egg prompt, the player chooses one NL-0 fragment to merge with, or declines.
- **Offer (recommended):** the most recent adult or elder fragment of each NL-0 egg in the lineage, so at most three choices, each shown as its form, egg and trait. A full list of every past fragment is the alternative; it is more choice than most players want and more UI.
- Declining is an ordinary rebirth.

### 5.3 What the hybrid is

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

## 6. Assumptions and open questions for the maintainer

1. Confirm A1 to A3 (section 1).
2. Base: A, B or C (section 3). Under A: are no elders acceptable for Rogue, and is a Standing-free egg acceptable (the clinic's Standing price is lost)?
3. Hunters: H1, H2 or both; the sweep's numbers; capture at three marks, or the gentler lasting cost.
4. How much harder (section 4.4): the proposed targets, or other ones.
5. Merge: who can merge (old age only, as proposed, or any death with fewer than three marks); the offer (latest per egg or the full list); M1, M2 or M3.
6. Can a hybrid's descendants merge again? Proposal: no; only a Rogue merges, so a player wanting another hybrid raises another Rogue to old age.
7. Does Rogue get Dex entries before it is raised? The gate makes it visible only after the reveal; proposal: its 5 forms appear as `???` once the reveal has played.

## 7. What it would take

**Simulator fork (`prototype/netling2/sim/`), behind a `ROGUE` switch, off by default:**
- Egg mode `rogue`: no Standing (sources route to trail), owner bar `null` until adulthood, the teen state-time tally and the routing rule, the hidden kit at adulthood.
- The sweep in place of the trace when `ROGUE` is on; marks; the `captured` death.
- In `netrun/nr2.js`: the trail count, the hunter fight at the threshold, the disconnect and mark on a loss.
- In `lineage-sweep.mjs`: the merge (pick the latest fragment per egg by a bot rule), the two-trait hybrid, and the hybrid's next life.
- Bots: the existing archetypes plus a "quiet runner" that jacks out at the first relay past a trail of half the threshold, to see whether the relay choice is real.
- Measures: full-life rate, capture rate, death causes, adult base shares by archetype (does play steer the base as intended, or does one bar dominate), run exit and disconnect rates by region against the hidden adults, notifications per 15 awake hours, and the hybrid's full-life rate against an ordinary child of the same fragment (how much two traits are worth).

**Sprites (option A):** 5 forms. Two ways: (a) five new authored forms; (b) a Rogue baby and teen authored new, and the three adults drawn as Ghost, Guru and Blank with a Rogue overlay (the "wears a stolen body" reading; 2 new sprites and 3 overlays, cheaper, and it shows the base on the sprite). Either way the forms need ids, frame and wearable checks, and the temper tell. Proposal: (b) for the first pass.

**Save and ids (when it is built, not now):** new form ids (for example `rogueBaby`, `rogueTeen`, `rogueAdultGhost`, `rogueAdultGuru`, `rogueAdultBlank`; permanent once shipped), a `marks` field, the `captured` death cause, a second-parent field on the fragment and the lineage record, and a trail field in the run state. Each needs a sanitizer.

## 8. Not done

- The reveal choice, the background touches and Rogue's own codex pages (codex drafts).
- Names for the five forms, egg flavor text for the hidden ability under Rogue, the sweep's and hunter's wording.
- Any simulation. Every number above is a starting value, and the targets in 4.4 are proposals.
