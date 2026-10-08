# Netling 2.0 netrun drafts

Status: design drafts for step 2 of the sketch's Next steps (netrun content per egg: abilities, the elder level, regions, events, tutorial run), with most structure now **decided by the maintainer** and the rules built as switches in the 2.0 simulator fork (`prototype/netling2/sim/netrun/nr2.js`, off by default). No 2.0 game code exists. Every number is a simulator starting value (bots with one skill number); nothing is playtested. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (the design record), [NETRUN.md](NETRUN.md) (1.0's netrun, the source of every hook named below), [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (item and meter wording) and `prototype/netling2/notes/netrun-sim-notes.md` (what was built and measured, results, the stale-sims audit and the map of which sim tests which question). Spoilers throughout.

**Decided (maintainer), in one place:**
1. **Abilities.** One ability per role and lean (eight) plus one per hidden form (three), at two levels: the adult is level 1, the elder level 2. The adult has one part, balanced alone; a second part may appear at the elder level. Egg flavor is text, with the same mechanics in every egg. No triggered abilities. The hidden forms follow Ghost's ability (full sight, never noticed at checkpoints, ICE often misses them); their never-notice chance is trimmed to 30% at the adult level and 55% at the elder level for parity. Tune corp has a wide, shallow sight (node types two steps ahead on every branch, three as an elder) and Tune street a narrow, deep one (Foresight: the game of the next ICE only, one step ahead as an adult and two as an elder; no tier, cache, stock or anomaly detail, decided after measuring). Feast is about loot, with a small sustain from a won ICE. Breach corp is the safety net (insurance).
2. **Harder ICE.** A second tier mixed in by region depth only (few in the shallow regions; a deeper-region thematic addition and difficulty lever), made harder by speed for Dodge, Tune and Feast and by a four-codes-in-a-buffer-of-five variant for Breach (the timer may need a refund, to test). It does not pay more to start, the tier is logged and carried in the daily share line, and avoidance abilities work less often against it, especially at the adult level.
3. **In a run.** Egg pressures pause; a held state resumes after a jack-out or an error-out (not an abort or a failure) with a 5 minute window before the bars can change it; each egg's own problem (Iron's wear, Program's overflow, Wetware's infections) can worsen in a run as a light extra cost. The forced filled cache (Feast corp elder) comes at set intervals and never displaces a relay.
4. **Fog of war** (in the 2.0 app): a line is drawn only where it leaves the node the player is on, walked lines stay, elder sight shows the lines between the nodes it sees, the stray signal shows one extra set of lines and the purge order's reveal more.
5. **Inventory** (changed from 1.0 for 2.0): items of a kind stack in a slot (starting size 3, further copies open another slot) and at the end of a run the player chooses what to keep.
6. **Parity yardstick** (settled at the maintainer's request): banked value per run plus exit rate, within 20% and 10 points of the mean in the Deep and the Source, elders no worse than their adults and 15% above them on average. Egg-flavored anomalies are a go. A work-day gap is not survivable. Rogue's origin and hunters are in section 8.

## 1. Scope and ground rules

In: adult abilities, elder upgrades, how the three eggs differ inside a run, anomalies, regions, the tutorial run, and what has to be measured. Out until the rest is firmer: the Rogue egg's netrun (see section 8), new mini-games, new regions, a new node type beyond the clinic.

Ground rules carried over (all from 1.0's netrun code and docs):
1. **Pure rules.** Anything that changes a run lives in `run.js`-style code: `(pet, rng)`, no DOM, driven by the balance bots.
2. **One ability, two levels (Decided).** The adult has the ability at level 1 and the elder at level 2. A named ability may have two parts (Decided), but the **adult has one part, balanced alone, and a second part may appear at the elder level** once the adult level is balanced. Caution from 1.0: its lines started with one effect, fell behind in The Deep, and got a second effect in balance pass 2, so expect some adult parts to need strengthening on their own; the bots decide. Hidden forms may break this rule (the three hidden forms follow Ghost's ability, 3.4).
3. **Parity yardstick (settled at the maintainer's request; my proposal, veto welcome).** 1.0's bar was disconnect rate (no adult ability more than about 4 points better than another in The Deep), which cannot fit a form whose ability is loot or information. The yardstick is **banked value per run**, in common items (items banked plus scrip over one common item's price of 15; a disconnect banks nothing, so survival is inside it), together with the **exit rate** (reaching exits is what clears regions and meets the elder feat). The bar, measured in The Deep and The Source with careful play and the ICE tiers on, at both levels: every form's value within 20% of the mean of the forms at that level; every exit rate within 10 points of the mean; each elder no worse than its own adult; and the elder level's mean value at least 15% above the adult level's. Disconnect rate stays reported, not binding. `netrun-sweep.mjs` prints this read-out.
4. **Daily trace.** Any ability that rolls must use the lane rng (`laneRng`), and any ability that takes or gives items or scrip must work with the stake ledger or be off in the daily. A change in the order of rolls bumps `DAILY.rules`.
5. **Challenges (checked, maintainer's reading to confirm).** Checked against the 2.0 abilities and ICE tiers (netrun notes, section 13; `challenge-sweep.mjs`, 4 tests): Unplugged (no relay repair or venting: the elder relay patches go dark, Tune street's repair per move does not), Blackout (no sight: the hidden forms' sight goes dark; **the Tune forms keep a limited form of theirs, on the maintainer's suggestion**: Tune corp sees types two steps ahead at both levels, Tune street's Foresight reads the next step's ICE game at both levels), Glass (a soft loss counts as lost, an insurance save does too, and tier-2 ICE makes it harder: 5 to 12 points of completion) and Bare metal (no items bought or used; a clinic fix is a service and allowed). Completion rates sit where 1.0's did and every form can complete every challenge; Glass favors the skip-ICE forms about 1.8 to 3.5 times, Unplugged is hardest on Tune corp (its elder patch is dark), and under Blackout the limited Tune variant brings the Tune forms to 73 to 100% of the mean of the nine (from 63 to 93% fully dark); Foresight still helps in Unplugged, Glass and Bare metal.
6. **Ids are permanent** once the app uses them; use the form ids, not display names.

## 2. The hook inventory

The six places an ability can act in 1.0, plus the small hooks a 2.0 ability might add. "Exists" means 1.0 already implements the hook; "small" means a few lines in the same style; "new" means a new mechanic needing its own design and tests.

| Hook | 1.0 users | Status |
|---|---|---|
| Sight (what the map shows) | Daemon (2 steps), Init (3), Ghost (all) | Exists |
| ICE avoidance (no fight starts) | Glitch (first ICE, then 35%), Panic (first 2), Ghost (45%), Whisper (50%) | Exists |
| ICE damage taken | Firewall (half), Airgap (first loss at 30% of that) | Exists |
| Per-move repair | Daemon (6), Init (8) | Exists |
| Relay and checkpoint | Chrome and Plat (relay repair 20 and 40, checkpoints waved through, cheaper exchange); Ghost (checkpoints never notice) | Exists |
| Last stand (survive a lethal blow) | Chrome (once, to 12 Integrity), Plat (twice) | Exists |
| Loot yield (cache and ICE-win odds, exit bonus, scrip) | none | Small |
| Market price or stock edge (a discount, one extra offer) | Chrome's exchange price only | Small |
| Move cost (Charge or Heat per move) | none | Small |
| Heat handling in a run (cooling per relay, less Heat from a lost fight) | none (an Airgap version was dropped in 1.0: Heat drives throttling, so it was worth more than it looked) | Small, but measure first |
| An ability the player triggers (a button, a charge) | none | New; avoided (maintainer prefers no triggered abilities) |

Observation for design: the 1.0 five cover every existing hook once. Reusing them for 27 adults means each hook is used about five times, so the 2.0 forms must differ by pairing and by egg, not only by hook. Section 3 proposes how.

### 2.1 ICE tiers (new input to everything below)

Decided (maintainer): a second tier of harder ICE is mixed in at random, with the share of tier-2 ICE set by the depth of the net. Region and depth go together: the share depends on the region only, with no extra effect from the layer inside a map. My reading of 'lower difficulties' (confirm): the shallow regions currently hold only the one kind of ICE, so they get an occasional harder fight, and the share grows toward The Source.

**The levers (Decided in direction, maintainer).**
- **Speed** is the easiest and the default: a tier-2 fight is played at a higher `speed` than 1 (the same lever overclock already uses, at 0.85). In the code, `speed` multiplies the game's elapsed time, so it directly affects Dodge, Tune and Feast, and also Breach's timer.
- **Breach** needs a second lever instead of a shorter time. Proposal for the maintainer's '4 matches in 5 moves': a tier-2 Breach has a target of 4 codes and a buffer of 5 (today it is a target of 3 and a buffer of 4, with a 25 second timer), with the same one spare move. **Decided (maintainer): yes to this shape.** The timer may also need extra time to make up for the longer target (a 'refund'); that is to be tested, not set. The constructor builds the target as a slice of a legal path, so a longer path and slice keep it always solvable. This needs a small code change (a variant argument to the game) that the speed lever does not.
- Higher damage or better rewards for tier 2 are not decided and not proposed.

**Felt, not shown.** With speed as the only difference, the player feels the tier. The maintainer is considering a subtle visual clue as the fight loads; it is not built and not designed. Whatever it is must not rely on color alone and must keep every strobe under three a second (project rule 7).

**Avoidance against harder ICE (maintainer, balance matter).** Avoidance abilities (phase, slip, never-notice) should probably work less often against tier-2 ICE, especially at the adult level, so the elder level narrows the gap. For example 1.0's Glitch slips the first ICE of a run for certain; against tier 2 it could be a chance at level 1 and closer to certain at level 2. Numbers come from the bots.

What it changes in this work:
1. **Re-baseline.** The disconnect targets (careful: 3% Public Net, 4% Bazaar, 6% Corp Grid, 10% Ruins, 34% Deep in 1.0) were set with one kind of ICE. Any tier share moves every one of them, so the targets and the parity bars (ground rule 3) must be re-measured with the mix on, and the shallow regions will no longer be near-risk-free.
2. **Abilities that touch ICE gain value.** Damage reduction, avoidance and last stands are worth more against harder ICE, and Feast and Tune relatively less. The Breach and Dodge abilities therefore need re-balancing against Feast and Tune once the mix exists, which is why the ICE tiers come first in the order.
3. **The daily trace.** The tier roll must be seeded in the ice lane, so every player meets the same tier at a node; the order of rolls changing bumps `DAILY.rules`.
4. **Shallow regions (Decided, maintainer).** The shallow regions should hold few harder ICE fights: tier 2 is a deeper-region thematic addition and difficulty lever. The simulator's first result agrees (a careful player meets about 1.5 ICE a run in the Public Net, so even a modest share barely shows), and the placeholder shares are now 5% in the Public Net and 10% in the Bazaar, growing to 50% in the Deep and 60% in the Source.
5. **Rewards and logging.** Harder ICE does not pay more to start (Decided); whether it should is a later balance question. The tier can be logged (Decided): a log line when a tier-2 fight starts and the tier in the run record. The daily share line carries it if possible (Decided, maintainer). Proposal: a count on the second line, for example `ICE 5/6 T2: 2`, so the trail symbols do not change. That changes the share format, so bump `DAILY.rules`, and check that the sanitizer's cleaning of the stored share string accepts the new text (`TRAIL_CHARS` and the share line are cleaned in `sanitize.js`; I did not read that code).
6. **Still open:** the shares themselves, which come from the bots, not from a guess.

## 3. Adult abilities

### 3.1 Structure (Decided, maintainer)

One ability per role and lean combination, at two levels (adult is level 1, elder is level 2). That is 8 abilities plus 3 hidden ones, each defined once and stepped once, so 11 abilities and 22 level definitions, not 27 adults with separate upgrades. The egg's flavor is the starting point for each egg's version of an ability, as text.

**Egg flavor is text (Decided, maintainer).** The core ability is the same mechanics in every egg, so parity is measured once. Each egg's version differs in its name, description and log lines (section 3.5), not in numbers. The eggs already differ in a run through their pressures (Iron's wear and so on), so the ability does not need to. If playtests show the eggs feel identical, a mechanical egg twist can be added later; none is proposed.

### 3.2 Roles and leans as ability themes

The role is the mini-game a form is built around; the lean is the Standing lean. Themes (proposal):

| Role | Game | Theme in a run |
|---|---|---|
| Breach | Breach | Fights ICE well: takes less from it or wins more |
| Dodge | Dodge | Avoids ICE and trouble |
| Tune | Tune | Sees the map and pays attention to the route |
| Feast | Feast | Takes more from the net: loot, scrip, sustain |

Lean: **corp** forms lean on credentials, relays and the exchange; **street** forms lean on toughness, the black market and risk.

### 3.3 The eight (proposal; adult part, then the elder's second part)

Working names are placeholders. The **adult has one part**, chosen to work alone (hooks that 1.0 already implements, except where marked). The **elder** takes the same part one step stronger and may add the **second part** shown, which is a candidate only: per the maintainer it appears at the elder level only once the adult level is balanced, so the second parts are the least settled content here. Strength is not set; 1.0's constants are the starting point for the bots.

| Form (egg-neutral name) | Adult part (level 1) | Elder: second part candidate (level 2) | Hooks |
|---|---|---|---|
| Breach corp | Insurance: once a run, a lethal blow leaves it at 12 Integrity | Pays out twice a run; relays patch it | last stand, relay |
| Breach street | Hardened: ICE deals reduced damage | The first loss each run barely scratches it | damage |
| Dodge corp | Phase: slips the first ICE of a run, and often the later ones | Checkpoints are waved through | avoidance, checkpoint |
| Dodge street | Unseen: ICE often never notices it | Checkpoints never notice it | avoidance, checkpoint |
| Tune corp | Lookahead: wide and shallow. Sees node types two steps ahead, on every branch, but only the type | Three steps ahead; relays patch it | sight (breadth), relay |
| Tune street | Foresight: narrow and deep. Sees an ICE's game (decided: the game only, not its tier, a cache, a market's stock or an anomaly's kind) in the nodes it can already see, one step ahead like anyone else | Sees an ICE's game two steps ahead (decided); repairs 3 Integrity every move (decided, from 6) | sight (detail, new small hook), per-move repair |
| Feast corp | Concession: more loose scrip, a cheaper exchange, one more item at the exit (proposed after tuning), and the same small sustain from a won ICE | One filled cache a run, where none would otherwise be and never in place of a relay (Decided; measured against two and three, netrun notes section 6) | loot (small), market (small), map change |
| Feast street | Scavenge: better cache and ICE-win loot odds, and a won ICE restores a little Integrity (a small sustain, Decided as fitting the theme) | More ICE-win loot, and a larger restore | loot (small), sustain (small) |

Notes:
- **Foresight, measured, and decided by the maintainer: the adult reads the ICE's game one step ahead, the elder two steps ahead, and the elder's repair per move is 3 (not 6); no tier, no filled-cache detail** (netrun notes, section 12). With a bot that is better at some mini-games than others (same mean) and a pre-rolled map, **the ICE's game is the whole value**: adding the tier gives 0 to 5% and a filled cache 1 to 5%, and market stock and anomaly kinds could not be simulated. Proposed fields: the ICE's game only, at the adult's next step (depth 1) and the elder's two steps (depth 2); the tier stays felt, not shown (consistent with the decided direction), and nothing shows whether a cache is filled (it would make caches trivial). **Adult:** it lifts Tune street from 77% of the mean of the nine forms (Deep, careful) to 86% for a moderately uneven player (spread 0.2) and 97% for a very uneven one, and does nothing for a player equally good at everything. **Elder:** with the repair per move at 6 (the current value) the elder is 105 to 123% of the mean in the Deep and up to 145% in the Source, over the 120% bar, because the repair already carries it (99% blind); **with the repair at 3 the elder sits at 79 to 114% across spreads 0 to 0.4 in both regions** (one cell, Source careful at spread 0, at 79%). The alternatives were elder depth 1 with repair 6 (inside the band at 96 to 132%, over it only in the Source for an uneven player) or leaving it; depth 2 with repair 3 was chosen. For the 2.0 app: Foresight reads contents that must be fixed before arrival (a per-run seed, as the daily trace already does) and shows them in the map (the fog change: lines for the nodes it reads, per the decided reading).
- **Tune no longer overlaps (Decided direction, maintainer).** Corp sight is wide and shallow (many nodes, types only); street sight is narrow and deep (fewer nodes, with details). Both are sight, but they answer different questions: where things are, and what they are. Detail sight is a small new hook (the nodes already carry their game, stock and kind, so it is showing existing data), not a new mechanic. It pairs with the harder-ICE tiers (2.1): the tier is 'felt, not shown' by default. Decided (maintainer): Foresight shows the ICE's type (which game) only, not the tier, at both levels (the elder's tier was left out after measuring; section 10, item 2). Upkeep (repair per move) moves to the street elder as the second part.
- **Breach** is split by defense type (Decided, maintainer: the safety net suits corp, an insurance policy): corp is a last stand, which also works in the Source; street is plain damage reduction (the 1.0 Firewall). Corp credentials and checkpoint passing leave Breach corp; they remain in the Dodge elders and in the flavor text. Expect Breach corp's adult part to be the weakest in routine fights; the bots decide whether it needs a second part earlier.
- **Feast corp, forced cache (maintainer's suggestion, adopted).** A filled cache (its find roll is skipped) appears where none would otherwise. Decided (maintainer): it appears at a set interval, not at random, with one a run around the halfway point as the example; the number a run was a balance question, since decided at one (section 10, item 3); and, to start, it may displace any node (the simplest rule), accepting that it will be strong in the harder regions and may need balancing. My proposal for the mechanics, to confirm: when the run reaches the layer before the halfway layer, one of the next layer's nodes becomes the filled cache, so the player always sees it and chooses whether to take it. The entry and the exit are never displaced. Decided (maintainer), revised after the first simulation: it may displace any node but **never a relay**. Measured with the relay open to displacement (prototype/netling2/notes/netrun-sim-notes.md), the forced cache cost the Feast corp elder 3 to 11 points of disconnect rate, because it lands in the layer that holds the map's guaranteed relay; with the relay kept it costs nothing. It reuses the node-type conversion that contracts already use (`ensureOnEveryRoute`). It works in the Source (cache weight 2) where markets and exchanges do not exist.
- **Sustain** (Decided: Feast is about loot): Feast street's second part is more ICE-win loot, not a Charge refund. Sustain remains available if another form needs a second part.
- **Loot and ICE tiers:** harder ICE does not pay more (2.1), so Feast street's loot-from-ICE-wins part needs no change for tiers.
- Avoidance parts (Phase, Unseen) work less often against tier-2 ICE, especially at level 1 (2.1).
- With ICE tiers coming (2.1), Breach and Dodge abilities will need to be re-tuned against Feast and Tune.

### 3.4 Hidden abilities (Decided: all three follow Ghost's ability, trimmed)

Ghost, Guru (Iron) and Blank (Wetware) share one ability, and their elders (Whisper, Init, Cipher) its elder level: full sight of the map, checkpoints never notice it, and ICE never notices it 30% of the time (55% at the elder level), trimmed from Ghost's 45% and Whisper's 50% to fit the parity yardstick (decided; `hiddenUnseen` in `nr2.js`). The egg difference is flavor text (3.5). This is the one place that breaks the one-part adult rule, which the hidden forms may do. With ICE tiers, the slip chance against tier-2 ICE falls like the other avoidance parts (2.1), so Ghost's strength depends on the tier mix; re-measure in the Deep and the Source.

### 3.5 Egg flavor as text (proposal)

Each of the 11 abilities gets three texts: a name, a one-line description and a log line, per egg, in the egg's vocabulary (Program: processes and interrupts; Iron: firmware, read-only, batch; Wetware: plain words about tissue and growth, no CP2020 jargon in-game). The numbers are shared. Example, for Breach street (placeholder wording, to be drafted properly with the rest of the text):

| Egg | Name | Description | Log line |
|---|---|---|---|
| Program | Hardened | ICE hits you for less. The first loss each run barely scratches you. | `checksum held.` |
| Iron | Burned in | ICE hits you for less. The first loss each run barely scratches you. | `nothing to overwrite.` |
| Wetware | Scar tissue | ICE hits you for less. The first loss each run barely scratches you. | `it closes up fast.` |

The flavor text is where the egg's lore (the sketch's Eggs and Story sections) reaches the netrun without touching balance. Level 2 reuses the same three texts with a changed name or an added word, to be decided when the text is drafted.

## 4. Elder level (level 2)

Decided structure (3.1): the elder has the same ability as its adult at level 2, not a separate upgrade. That is 11 level-2 definitions, one per ability, shared by every form of that role and lean in every egg. Egg flavor is text (3.5), so there is nothing mechanical to step per egg.

**Counting.** The sketch's 'about 23 more elder upgrades' (27 elders minus the 4 whose names come from 1.0: Whisper, Plat, Init and Daemon) is replaced by 11 level-2 definitions. The 1.0 names stay as names only; their old Mainframe upgrades are not carried over as such. This is a smaller job than the sketch assumed.

**Method.** Level 2 steps the adult part once (reduction a little deeper, sight one step further, a repair a little bigger, a slip chance a little higher) and may add the second part from 3.3. 1.0's own Mainframe upgrades were exactly that plus one small extra, and they sat within a few points of each other in the Source (careful disconnects 24 to 28%); the target is the same closeness, measured in the Source with the ICE tiers on. Second parts come last: the maintainer wants the adult level balanced first.

**The Source.** The elder is the only stage that enters the Source (13 layers, ICE weight 11, ICE damage 52, no markets or checkpoints). Markets and checkpoints are absent there, so the Source-working parts matter: Breach corp's last stand and Feast corp's forced cache (3.3) were chosen so those two forms are not left without a part that acts there.

## 5. How the three eggs differ inside a run

Because the core abilities are shared (3.1), the eggs differ through the egg pressures, the flavor text (3.5) and skin. This section is the open design area.

1. **Pressures pause in a run (Decided, maintainer).** The hold clocks of Overdrive and Overlink and the state benefits do not advance during a run. An egg's own problem can get worse in a run (also decided; these bullets are the first proposals, and the decided sizes follow below):
   - **Iron:** wear keeps building. A run adds Heat on every move (5) and on a lost fight (12), so a run that gets hot builds wear, and the wear stays after the jack-out.
   - **Program:** Charge falls with every move (4), and the 'bleed and overflow' problem becomes a run problem, for example a lost fight at high Charge costs extra Integrity.
   - **Wetware:** Sync and infections: a lost fight rolls an infection at the usual chance, and a disconnect hurts Sync more.

   **Decided (maintainer): these are light extra costs to start**, not decision points. Each should be small enough that it does not compete with the abilities for the player's attention, and is measured against the egg-neutral parity bars (3.3).

   **Sizes (decided by the maintainer after measuring on bots; `prototype/netling2/notes/netrun-sim-notes.md`, section 11):** Iron's run wear is 2.5 minutes of wear a move at Heat over 75 (from 1), Program's bleed is 4 Integrity on a lost fight at Charge 80+, Wetware's roll is 4% an infection on a lost fight. At those sizes a netling that runs a lot pays about 2 to 7 Integrity a life under any egg (an infection counted at 13 to 18), no ordinary archetype moves outside noise on full-life rate or temper (1000 lives), Wetware adds +0.3 to +0.45 infections a life for anyone who loses fights, Iron +0.17 to +0.56 for those who jack in hot, and Program bleeds 1.8 times a life for an attentive netling and 6 for a casual one (casual disconnects +0.17 a life).

   **A held state resumes after the run (Decided, maintainer), with a 5 minute window.** Bars change in a run (a run starts at Charge 30 or more, falls 4 a move, and adds Heat), so the state is not re-checked against the current bars for 5 minutes after the jack-out; after that it follows the usual end conditions (Overdrive ends under Charge 65, Overlink under Sync 70, Overclock under Heat 65). The hold counter resumes where it stopped. My reading, to confirm: the window gives the player five minutes to feed or cool, not a free extension of the state. It does mean a run that leaves Charge low will usually lose Overdrive unless the player feeds within the window; whether that is the intent is for the maintainer. Which endings start the window (Decided, maintainer, my reading to confirm): a **jack-out** (at the exit or early at a relay) does, and so does an **error-out**, meaning the run ends because something went wrong outside the player's play (for example a crash). A **player abort** and a **failure** (Integrity or Charge reaching 0, which 1.0 calls a disconnect) do **not**. In 1.0's code the three results are `jacked`, `disconnected` and `aborted`, and a crashing netrun is closed as an abort, so an error-out needs its own marker to be told apart from a player's abort; that is a small code change. A burnout (Overlink's 24 hour lock) is not cleared by the window.
2. **Run texture, not rules.** Each egg gets its own wording for the same events: node labels, ICE names, relay text, the summary. This is a skin: Program (processes, interrupts), Iron (firmware, batch queue, read-only), Wetware (plain words, tissue, culture; no CP2020 jargon in-game).
3. **One egg-flavored anomaly each** (section 6). This is where eggs can differ in play without touching ability parity.
4. **Items.** Item names per egg are already proposed in the sketch (Coolant cell / Coolant loop / Cold pack, and so on); the effects are unchanged, so nothing here needs balancing.

## 6. Anomalies

1.0 has six; the Source's purge order is the only region-limited one. 2.0 needs:

| Slot | Plan |
|---|---|
| Debug station | Dropped. The clinic node replaces it (sketch, Bugs). Maintainer's design, kept. |
| Existing five | Keep. Reword per egg as skin (section 5). Honeypot, rig, echo and sector keep their rules. |
| Egg-flavored anomaly, one per egg (Decided as a go; content below is still a proposal) | Program: a **stack overflow** (take on Charge past the line for a free ICE skip, Overdrive-flavored). Iron: a **bit-rot patch** (cool and calibrate: lose Heat, clear some wear, at a cost in Charge). Wetware: a **graft** (a Sync gain, a chance of an infection, Overlink-flavored). Each has two options like 1.0's, each choice leans Standing or temper |
| Purge order | Keep in the Source; unchanged rule, the three readings (the order can never run) |
| Source anomalies | 1.0's Source pulls from all six; 2.0 should keep the Source's own selection mostly un-egg-flavored |

The egg anomalies are a go (maintainer). **Detailed first pass, built in the fork and measured on bots** (`sim/netrun/egg-anomalies.js`, switch `NR2='{"eggAnomalies":true}'`, `nr2.test.js`; results in `prototype/netling2/notes/netrun-sim-notes.md`, section 10). All numbers are my starting values.

- **Who meets them, and where.** A netling meets only its own egg's anomaly, as **one more entry in the region's anomaly pool** (so about one anomaly node in six of its own, the same as any of 1.0's), in every region except the Source, the daily trace and the tutorial. The daily trace stays the same for every egg; the Source keeps its own selection (the purge order and the five shared ones). Measured, a netling meets its egg's anomaly about 0.17 times a run in the Bazaar, 0.08 in the Corp Grid, 0.31 in the Ruins and 0.22 in the Deep.
- **Each has two options like 1.0's, and each option leans** (allegiance becomes Standing, stability is temper), through the same `lean` adapter:

| Egg | Anomaly | Option | Effect (starting values) | Leans |
|---|---|---|---|---|
| Program | STACK OVERFLOW: "a call with no return address. the stack grows a frame at a time." | RUN IT | +25 Charge; 50% a loot item; if Charge ends over 95 the stack overflows: -10 Integrity | temper, entropy |
| | | TERMINATE | -8 Charge, +10 Integrity | temper, order |
| Iron | BIT-ROT PATCH: "a read-only region is flipping bits. a signed patch sits on the bench beside it, one build old." | FLASH IT | -12 Charge, -20 Heat, -30 wear | corp (signed patch) |
| | | PRY OPEN | +10 Heat, +8 Charge; 60% a loot item | street |
| Wetware | GRAFT: "a bed of living tissue, still alive, the right shape for a graft." | GRAFT IT | +20 Sync; 30% rejection (an infection, -4 Integrity; none if already infected) | temper, entropy |
| | | SAMPLE | -6 Sync; 50% a loot item | temper, order |

- **Flavor, kept small.** Each anomaly sits on its egg's bar: the overflow's surge is **Overdrive-flavored** (the surge is free until the buffer is full, then the stack overflows and tears, so a Program netling already holding Charge pays for the greed), the patch is **maintenance for Iron's wear** (Heat and wear down, at a cost in Charge, against loot that runs hot), the graft is **Overlink-flavored** (Sync up, with the infection risk Wetware already lives with). Nothing needs the egg's pressure to be on, except that the patch's wear part does nothing for a netling with no wear.
- **Decided (maintainer): hints are numberless**, like the 2.0 state clues (1.0's anomaly hints show numbers; these do not). **Decided: no free ICE pass** for the stack overflow (the first draft had UNWIND skip the next ICE; dropped, so none of the three adds a run mechanic, they only move bars, Integrity and items). Program's options were reworded (UNWIND and CATCH IT became LET IT RUN and KILL IT, then RUN IT and TERMINATE with the wording pass below). Wetware's text stays plain (no CP2020 jargon); Program's and Iron's use their own substrate words.
- **Measured against the yardstick** (bots, 4000 runs a cell, careful and skilled, no ability and Breach corp, Bazaar to Deep): taking the options at random and averaging over the styles and forms, each egg anomaly moves the disconnect rate by less than 1 point, the exit rate by 1.5 points or less and banked value by under 2.5%, in every region (single cells reach 1.1 and 1.5 points); neither option of any anomaly is more than about 5% of value better than its pair. The largest single option effect is RUN IT (then named LET IT RUN; +0.4 points disconnect and -1.1 exit in the Ruins, +1.4% value in the Bazaar). The bots cannot value what the Iron patch does to wear and Heat or the graft's Sync (they bank loot, not bars), so FLASH IT looks about 2% worse than PRY OPEN on value and is probably better than it looks for a hot Iron netling.

**Wording (Decided, maintainer; care drafts' register).** Labels stay at 9 characters or fewer until the 2.0 UI is revisited. Hints use each egg's meter words (Iron: power; Wetware: bond), still numberless. Run messages carry no `> ` prefix: the run panel shows them as they are and the home log adds `> netrun (region): ` in front of the last one, so a prefix in the string would double it. The care drafts' `!!` marks the two penalty lines. Text, hints and messages are in `sim/netrun/egg-anomalies.js`.

| | Program | Iron | Wetware |
|---|---|---|---|
| Option 1 | RUN IT: "charge surges, may find a stray item, may overflow"; "call finished. buffers full. charge up."; over the line "stack overflow. !! it tore on the way out. -10 integrity." | FLASH IT: "costs power, cools, eases wear, corp"; "flashed. fans spin down. tolerances hold." | GRAFT IT: "bond surges, may reject"; "it took. the new tissue hums along with the rest."; rejected "it took, then it turned. !! rejection setting in." |
| Option 2 | TERMINATE: "costs charge, repairs, order"; "call terminated. frames released one by one." | PRY OPEN: "likely salvage, a little power, runs hot, street"; "module pried out. [item]" or "pried at it. the module was already dead." | SAMPLE: "costs bond, maybe a find, order"; "a clean sample. [item]" or "the sample failed. nothing worth keeping." |

**PRY OPEN gives +8 Charge (Decided, maintainer's suggestion; the size is mine).** It had no power gain only because it was copied from 1.0's SALVAGE option; with power it matches Iron's street feed (SALVAGE) and mirrors RUN IT. Measured with `egg-anomaly-sweep.mjs` (3000 runs a cell, careful and skilled, four regions): the sweep output is **identical** with and without it, and also with +60 as a probe. The bots do not use Iron's power in a run (it is neither banked nor near zero), so the sweep says only that the gain cannot move the exit, disconnect or value figures; it cannot say whether +8 is the right size. The gap between the two options is unchanged (PRY OPEN about 1 to 3% of value ahead of FLASH IT in the old figures, which the bots also cannot offset with wear and Heat).

## 7. Regions, the tutorial run and contracts

- **Regions.** Keep the six and their order, node weights, ICE damage and loot. Reskin the text per egg only. New regions are out of scope: they would add content, and 2.0 already has the clinic, the exchange stock and three anomalies to test. If a region is ever added for Rogue, treat it as a Rogue-only region (section 8).
- **Fog of war (Decided, maintainer): make it foggier, in the 2.0 app.** Today the whole map's connecting lines are drawn, so a player sees every route even where the nodes are dim dots (`view.js` draws every edge unless the Blackout challenge is on). Decided rules:
  - A connecting line is drawn only where it **leaves the node the player is on**, and **lines already walked stay drawn**. Unseen nodes stay as dim dots.
  - **Elder abilities show lines.** An elder-level sight ability draws the connecting lines for the nodes it sees, so elder Tune corp (three steps), elder Tune street (contents two steps ahead) and the hidden elders (Whisper, Init and Cipher, which follow Ghost's) show how their visible nodes connect. Adult sight shows nodes only. My reading: the lines shown are those between nodes the ability sees.
  - **Reveals show lines too.** The stray signal anomaly, which reveals the next two layers' nodes, also shows **one extra set of lines**; the purge order's margin reveal (three layers, once the Source's codex is complete) shows **more**. Confirmed (maintainer): 'a set of lines' is the lines leaving the nodes of one layer, so the signal shows the lines for one layer past where the player is, and the purge order shows the lines for all three revealed layers.
  - Consequence: without an elder ability or a reveal, a player never sees more than the next step's lines, even with adult sight. This makes the elder level more valuable and the Source (13 layers) harder to plan, and it helps the Source's purge order and the signal become reasons to stop.
  - The change is made in the 2.0 app, not on this branch, because it is a drawing change that does not touch the rules: `visibleNodeIds` and the map data stay as they are, and the balance bots plan from the rules (they use the map's edges and count unseen nodes as nothing), so their results should not move. The reveal effects already exist as rules (`reveal(depth)`); showing lines for them is also a drawing choice, but the 'extra set' for the signal needs a way to say how many layers of lines were revealed, which is a small data addition to the run (to design in the 2.0 app). Human play is the real test. Needs a drawing test there (1.0's draw tests run a whole netrun in every region).
- **Tutorial run.** The fixed map (entry, cache, ICE, relay, exit) stays, with the egg's wording. The guaranteed first codex page must be a story page every egg shares. The party hat gift and onboarding completion stay as in 1.0.

  **Wording (first draft, for the maintainer to edit; scope decided: the tutorial surfaces only).** In `prototype/netling2/tutorial-text.js` (shape rules and tests in `tutorial-text.test.js`; not wired into any game). It covers the nudge before the first run, the five tip captions, the four node hints, the six run log lines the tutorial prints and the gift line, in each egg's register (care drafts: Program bureaucratic and technical, Iron physical and procedural, Wetware street-level and plain) and with the egg's own meter words (Program charge and integrity, Iron power and integrity, Wetware food and health). Kept as 1.0 has them in every egg, because the player has to find them on screen: the controls line (`◀ ▶ picks a node, A moves.`), the buttons CONTINUE and JACK OUT, the node label ICE and the pointer ARCHIVE > STYLE. Width limits are 1.0's longest lines (tip lines 45 characters, hints 35; measured at size 18 in the game's font, the longest draft tip is 342.6 px, the same as 1.0's longest, and the longest hint 252 px against 1.0's 252).

  | | Program | Iron | Wetware |
  |---|---|---|---|
  | Nudge | spare cycles logged. permission to go out? | idle. the queue is empty. take me out? | i want to see what is out there. take me? |
  | Tip: cache | moves draw charge. (controls) / caches may hold items. this one does. | moves draw power. (controls) / a sealed crate may hold items. this one does. | moves burn food. (controls) / a pouch may hold items. this one does. |
  | Tip: ICE | ICE enforces access. pass the mini-game, / or it takes integrity as a penalty. | ICE is a lockout. clear the mini-game, / or it hammers integrity. | ICE stands in the way. beat the mini-game, / or it hurts, and that costs health. |
  | Tip: relay | relays restore charge and shed heat. / bank your loot here, or continue. | relays top up power and vent heat. / bank your haul here, or press on. | relays are a rest. you eat and cool off. / bank your loot here, or push on. |
  | Tip: exit | the exit banks everything you found, / plus a bonus. end the session. | the exit banks everything you hauled, / plus a bonus. bring it home. | the exit banks everything you carried, / plus a bonus. take it home. |
  | Tip: relay choice | CONTINUE to reach the exit. / JACK OUT closes the run safely here. | CONTINUE to reach the exit. / JACK OUT stops the run safely here. | CONTINUE to reach the exit. / JACK OUT ends the run safely here. |
  | Hint: cache | may hold an item. | a sealed crate. may hold an item. | a pouch. might hold an item. |
  | Hint: ICE | a mini-game. fail and it bites. | lockout game. lose and it hits. | an ICE game. lose and it hurts. |
  | Hint: relay | recharge, cool down, safe jack-out. | top up power, vent heat, jack out. | rest, cool off, safe jack-out. |
  | Hint: exit | bank everything + a bonus. | bank the haul + a bonus. | bank it all + a bonus. |
  | Log: cache | cache opened: {item}. / cache empty. | crate forced: {item}. / crate was empty. | the pouch held {item}. / the pouch was empty. |
  | Log: ICE won, lost | ICE cleared. recovered {item}. / ICE retaliated. -{dmg} integrity. | ICE shut down. pulled {item}. / ICE hit back. -{dmg} integrity. | the ICE backed off. you got {item}. / the ICE hurt you. -{dmg} health. |
  | Log: relay | relay reached. charge restored, heat shed. | relay found. power topped up, heat vented. | a relay. you rested and cooled off. |
  | Log: exit | exit node. committed: {bonus}, {scrip} scrip. | exit node. hauled out: {bonus}, {scrip} scrip. | the exit. you brought home {bonus}, {scrip} scrip. |
  | Gift | issued: party hat. accessories live in ARCHIVE > STYLE. | a gift: party hat. fit it in ARCHIVE > STYLE. | a gift: party hat. dress up in ARCHIVE > STYLE. |

  **Decided (maintainer):** ICE stays ICE in every egg, including Wetware's log lines (no "guard"); the run HUD follows each egg's meter words (FOOD, HLTH, TEMP; PWR, LOCK) so the tips read true; the button names (CONTINUE, JACK OUT) are the same in every egg. Open: the tone is a first pass and unplaytested, and the Iron nudge is the loosest line.
- **Contracts.** Keep the six kinds plus the clinic job already in the fork. No new kind is proposed.
- **Challenges.** Unchanged; check abilities against them (ground rule 5).
- **Daily trace.** Unchanged, but bump `DAILY.rules` whenever an ability changes the order of rolls.

## 8. Rogue (deferred, with direction)

Decided (maintainer, this stretch): Rogue is a line that escaped on its own from the unnamed corp that stole NL-0's earlier code, is built on the three hidden lines, and is hunted much more aggressively than the three NL-0 eggs (sketch, Hidden egg). For the netrun, that suggests, as proposals only: a **hunter presence** in runs (a clock or node type the corp's hunters add) rather than the corp trace, ability seeds drawn from the three hidden forms (3.4), and Rogue-only regions or events if any. Nothing is drawn up until Rogue's design is firmer; this section only keeps the direction visible.

## 9. Measuring it

**Where it stands.** The rules are built as switches in the 2.0 simulator fork (`prototype/netling2/sim/netrun/nr2.js`; `NR2=all` turns them on), with tests (`prototype/netling2/nr2.test.js`) and the tools `netrun-sweep.mjs` (per-form outcomes and the yardstick read-out), `lineage-sweep.mjs` (lives to finish the 18 egg pages), `grace-sweep.mjs` and `item-sweep.mjs` (what the inventory loses). Results, the stale-sims audit and a table of which tool tests which open question are in `prototype/netling2/notes/netrun-sim-notes.md`. Headlines, all from bots with one skill number and untuned starting values:
- The abilities sit inside the yardstick in the Deep and the Source except the hidden form at the adult level (about 120%, accepted) and the Tune forms (low; the bots cannot use information, so they are a playtest question).
- Feast is at the mean on value (loot plus a small sustain, an extra exit item for the corp form, a forced cache for the corp elder) and still finishes up to a life behind the defensive forms to a first elder.
- Tier 2 ICE barely moves the shallow regions at the placeholder shares (5% in the Public Net, 10% in the Bazaar, up to 50% and 60% in the Deep and the Source); it costs about four points of disconnect rate in the Deep.
- Under 1.0's inventory about a third of items found were scrapped even with perfect bots; at stack 3 with the end-of-run choice it is about 14%.
- The forced cache cost the Feast corp elder 3 to 11 points of disconnect rate when it could displace the relay; it no longer can.

**Method, as built.**
1. Abilities are constants beside the run rules (`nr2.js`), read by the bots; sight and avoidance work through `visibleNodeIds` and `moveToNode`. Abilities that act on choices (markets, scrip) are modelled where the bot buys; the contract-dependent ones are not measured (the bots never take contracts).
2. Targets: the yardstick in ground rule 3, in the Deep and the Source, at both levels, with the ICE tiers on and a starting inventory (`INVFILL`).
3. The Breach variant and the tier's cost are an assumed win-chance drop (`tier.winPerSpeed`, `tier.breachPenalty`); a game-playing bot or a playtest would replace the assumption.
4. Challenges and the daily trace: the daily's tier roll is seeded by node and tested; challenges are untested.
5. The fog change is a drawing change for the 2.0 app and does not touch the rules; confirm with a drawing test there. Human play is the real test, since bots plan from the rules.
6. Record each result in `prototype/netling2/notes/` and summarize here; do not quote numbers before they are measured.

## 10. Open questions for the maintainer

Still open (the decisions above are not repeated):
1. **Egg run costs (5.1):** sizes proposed and the ordinary-archetype pass bar run (section 5.1 and the netrun notes, section 11): Iron 2.5, Program 4, Wetware 4%. **Decided (maintainer): Program's bleed landing harder on casual players is fine, and Iron's 2.5 is accepted.** Open: whether a real player jacks in hotter or fuller than the bots, which only a playtest shows.
2. **Foresight (Tune street): decided (maintainer).** Measured with a bot that has uneven per-game skill (section 3.3 and the netrun notes, section 12): the adult reads the ICE's game in the next step's nodes, the elder two steps ahead, neither shows the tier or whether a cache is filled, and the elder's repair per move is 3. Still a model of a person; the value depends on how uneven a player's skill is across the four games, which only a playtest shows.
3. **Forced filled cache: decided, one a run (maintainer's recollection, confirmed by a re-run).** It lands in the layer after the one before halfway and never replaces a relay. Against none, two and three a run, with the abilities and ICE tiers on (800 runs a cell, careful, all nine forms at the elder level, value as a share of the elders' mean): in the Deep one a run puts Feast corp at 118% (none 98%, two 130%, three 130%) and in the Source at 103% (none 95%, two 111%, three 117%), so one is the only setting that keeps it inside the 120% bar in both regions where the bar is set. Two or three also cuts the Deep disconnect rate by only 3 points more. In the shallow regions Feast corp is already 113 to 136% of the mean with no cache (the concession and the exit item), and one cache adds about 15 to 25 points; the bar is not set there and it is a loot role. Details: netrun notes, section 6, Forced cache count. The Public Net, Bazaar, Corp Grid and Ruins excess is accepted (maintainer): the bar is set in the Deep and the Source, and imbalance in the easier regions is fine. A smaller concession would trim it, not the cache, if that ever changes.
4. **Fog of war: decided (maintainer).** Elder sight draws the lines between all the nodes it sees. A possible balance lever if it proves too strong in play (the fallback would be lines leaving the seen nodes only).
5. **Share line: format decided (maintainer), sanitizer checked.** The tier is a count on the second line: `EXIT 9/9  ICE 5/6 T2: 2  Ghost`. "T2" is the number of ICE fought at tier 2 (the fork's `run.tally.iceHard`); a tier-2 ICE that was slipped or phased is not counted, so the count can differ between forms on the same route, as the rest of the line does. It is left out when 0, so a line with none, and every 1.0 line, is unchanged. The tier roll is seeded by node, so the count is comparable between players who took the same route. Not in the trail (that would change `TRAIL_CHARS`, which the run sanitizer filters on). `prototype/netling2/share.js` builds it on 1.0's `shareText`; `share.test.js` pins the format. **Sanitizer (checked):** `cleanProgress` keeps `daily.share` as any string cut to 300 characters, shown with `textContent`, so no markup is interpreted. The longest 2.0 line (40 ICE, all hard, a 40-symbol trail, the run sanitizer's cap) is 110 characters, so it is never cut, and a stored 1.0 line passes unchanged. Needs no sanitizer change. The 2.0 app also bumps `DAILY.rules` for the tier roll (section 2.1, item 3), which the line shows as `rN`.
6. **Second parts and the elder level: leave until a playtest (maintainer).** They are candidates with starting values, tuned only against the bots. Tune corp and Tune street sit under the band on the bots' measure and are not a bot target.
7. **Feast progression:** still up to a life behind the defensive forms to a first elder and the three-egg total; accepted for a loot role, to be judged in a playtest.
8. **Challenges:** tried (ground rule 5 and the netrun notes, section 13). **Decided (maintainer): Glass stays the hardest** (tier-2 ICE included). The Tune forms get a limited sight under Blackout (see ground rule 5; the numbers are in the netrun notes, section 13). Open: whether Tune corp deserves anything under Unplugged, where its elder relay patch is dark (the elder gains nothing over the adult there: 34 / 35 Deep careful, 44% of the elder mean in the Source). **Decided (maintainer): leave it.** Kept as a bot-tested balance option for after playtesting, if Tune corp still proves too hard under Unplugged: a repair of 2 Integrity a move for the Tune corp elder under Unplugged only (switch `NR2.ab.darkUpkeep.tuneCorp[2]`, off at 0; 2 puts every cell inside the 20% band, 1 and 3 also measured; netrun notes, section 13, Unplugged and Tune corp).
9. **Egg anomalies:** options are designed and measured in the fork (section 6). **Wording decided (maintainer), in the care drafts' register** (section 6, Wording). Open: a playtest, since the bots cannot value the Iron patch's wear and Heat, PRY OPEN's power or the graft's Sync.
10. **Stack size** (3) and the keep-or-sell screen need a playtest.

## 11. Not done

No 2.0 game code. Nothing here is playtested. The simulator cannot test: Foresight, the fog change, the share line, the Breach variant's real difficulty, an error-out, the 5 minute window (the bots act in one instant), or challenges. Tuned only against bots with one skill number; harder ICE costs an assumed win chance. The 18 egg pages are rates in the lineage sweep (not drops in the codex); the ending (all 39 story pages and a Source exit) is tracked there since (netrun notes, section 14). The sources are 1.0's `docs/NETRUN.md`, `src/netrun/*` and the fork.
