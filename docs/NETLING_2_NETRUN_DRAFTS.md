# Netling 2.0 netrun drafts

Status: first-pass design drafts for step 2 of the sketch's Next steps (netrun content per egg: abilities, 23 more elder upgrades, regions, events, tutorial run). Everything here is a proposal unless marked Decided. Nothing is in code, nothing is tuned and nothing has been measured; any number quoted is 1.0's, shown only as a starting point. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (the design record), [NETRUN.md](NETRUN.md) (1.0's netrun, the source of every hook named below) and [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (item and meter wording). Spoilers throughout.

## 1. Scope and ground rules

In: adult abilities, elder upgrades, how the three eggs differ inside a run, anomalies, regions, the tutorial run, and what has to be measured. Out until the rest is firmer: the Rogue egg's netrun (see section 8), new mini-games, new regions, a new node type beyond the clinic.

Ground rules carried over (all from 1.0's netrun code and docs):
1. **Pure rules.** Anything that changes a run lives in `run.js`-style code: `(pet, rng)`, no DOM, driven by the balance bots.
2. **Two effects per adult, one more per elder.** 1.0 gave each line one ability, found a form fell behind in The Deep, and added a second effect in balance pass 2; the Mainframe upgrade is a third. A single-effect ability is not enough.
3. **Parity target.** In 1.0 no adult ability was more than about 4 points better than another at avoiding disconnects in The Deep, and the five mainframe upgrades sat within a few points of each other in the Source (careful disconnects 24 to 28%). The same bar applies to every 2.0 form, measured, not argued.
4. **Daily trace.** Any ability that rolls must use the lane rng (`laneRng`), and any ability that takes or gives items or scrip must work with the stake ledger or be off in the daily. A change in the order of rolls bumps `DAILY.rules`.
5. **Challenges.** Every ability is checked against Unplugged (no relay repair or venting), Blackout (no sight), Glass (a soft loss counts as lost) and Bare metal (no items).
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
| An ability the player triggers (a button, a charge) | none | New |

Observation for design: the 1.0 five cover every existing hook once. Reusing them for 27 adults means each hook is used about five times, so the 2.0 forms must differ by pairing and by egg, not only by hook. Section 3 proposes how.

## 3. Adult abilities

### 3.1 The key question (needs the maintainer)

1.0 tied abilities to a line (five lines, five abilities). 2.0 has per egg 8 role forms (4 roles x corp or street lean) and 1 hidden form, 27 adults in all. Three ways to assign:

| Option | What it means | Cost | Risk |
|---|---|---|---|
| A. By role and lean, shared across eggs | 8 abilities plus 3 hidden ones; the egg changes the surrounding pressure, not the ability | Smallest. Reuses the 1.0 balance method on 11 abilities | Eggs feel the same in a run apart from skin and pressure |
| B. By role and lean, with an egg twist | The same 8, each with a small egg-specific second effect (24 variants) plus 3 hidden | Medium. 27 things to measure | Parity harder to hold |
| C. Fully separate per form | 27 unique abilities | Largest | Parity almost impossible without long tuning; most invented content |

**Proposal: A for the first pass, B only where playtests show the eggs feel identical.** Reason: the eggs already differ in forms, names, codex text, care loop and the egg pressure (Overclock with wear, Overdrive, Overlink, each tripled for its owner), so one ability set per role and lean keeps measurable parity and still lets the pressure do the egg-specific work. The remainder of this document assumes A.

### 3.2 Roles and leans as ability themes

The role is the mini-game a form is built around; the lean is the Standing lean. Themes (proposal):

| Role | Game | Theme in a run |
|---|---|---|
| Breach | Breach | Fights ICE well: takes less from it or wins more |
| Dodge | Dodge | Avoids ICE and trouble |
| Tune | Tune | Sees the map and pays attention to the route |
| Feast | Feast | Takes more from the net: loot, scrip, sustain |

Lean: **corp** forms lean on credentials, relays and the exchange; **street** forms lean on toughness, the black market and risk.

### 3.3 The eight (proposal, two effects each)

First effect is the role's hook; the second is the lean's flavor. Both are existing or small hooks. Strength is not set here; the 1.0 constants are the starting point for the bots.

| Form (egg-neutral name) | Effect 1 (role) | Effect 2 (lean) | Hooks | Closest 1.0 |
|---|---|---|---|---|
| Breach corp | Takes reduced ICE damage | Checkpoints waved through | damage, checkpoint | Firewall plus Chrome |
| Breach street | Takes reduced ICE damage, the first loss of a run barely scratches it | Black market discount and one extra offer | damage, market (small) | Firewall plus Airgap |
| Dodge corp | Slips the first ICE of a run, then often the later ones | Corp insurance (one last stand a run) | avoidance, last stand | Glitch plus Chrome |
| Dodge street | ICE often never notices it | Checkpoints never notice it | avoidance, checkpoint | Ghost minus sight |
| Tune corp | Sees node types two steps ahead | Relays patch it | sight, relay | Daemon plus Chrome |
| Tune street | Sees node types two steps ahead | Repairs a little Integrity every move | sight, per-move repair | Daemon |
| Feast corp | More loose scrip (exit and caches) | Cheaper exchange, exchange offers one more item | loot (small), market (small) | New, Chrome's price |
| Feast street | Better cache and ICE-win loot odds | Move costs less Charge | loot (small), move cost (small) | New |

Notes:
- Several rows are near-copies of 1.0 lines on purpose: the 1.0 lines were already measured for parity, and a near-copy starts close to balanced. The two Feast rows and the move-cost effect are the only new ground, and they are small hooks, not new mechanics.
- Tune corp and Tune street overlap in sight; they differ in the second effect. Tune is the weakest differentiation here. Flag for review.
- Dodge street is Ghost without Ghost's full sight, because full sight belongs to the hidden forms (below).
- Breach has two ICE-damage forms. If both seem too strong against the Deep's 9 ICE, trade the corp row's damage for the first-loss soft hit and keep full reduction only for street. Measure first.

### 3.4 Hidden adults (one per egg)

The hidden forms master all four games and take no side, and they may break form rules. Proposal: each gets **three effects drawn from different roles**, plus an egg-colored rider, so they are the strongest runners and cost the most to reach (the wins requirement, not Standing, is the hurdle; sketch, Evolution).

| Egg | Form | Proposal |
|---|---|---|
| Program | Ghost | 1.0's Ghost: full sight, checkpoints never notice it, 45% of ICE never notice it |
| Iron | Guru | Full sight, ICE damage reduced, plus a small loot edge (the knowledge-resource reading of the name) |
| Wetware | Blank | Checkpoints never notice it, ICE often misses it, last stand once a run (camouflage and a body that holds together) |

Open: whether Guru and Blank should reuse Ghost's full sight at all (full sight removes the fog, which is the map's main uncertainty). Giving it only to Program's Ghost keeps Ghost special and is a reasonable default.

## 4. Elder upgrades

The elder replaces 1.0's Mainframe. It keeps its adult's ability, adds an upgrade, and is the only stage that enters the Source (13 layers, 11 ICE weight, no markets or checkpoints, ICE damage 52). 1.0's five upgrades sit within a few points of each other there.

**Counting.** 27 elders. Names already in use from 1.0: Whisper (Ghost's elder), Plat (Wired's elder), Init (Guru's elder). With Daemon also reused as a name for Mouse's elder, the sketch's figure of 23 new upgrades follows. Under option A in 3.1 the abilities are shared by role and lean, so the **upgrade can be shared too**: eight role-and-lean upgrades plus three hidden ones is 11 to design and tune, not 23. The remaining forms in each egg inherit the same upgrade by their role and lean. The sketch's 23 stays the count if the maintainer wants per-form uniqueness (option C territory); flag.

Proposed pattern, stated as a rule so the 11 are consistent: **the upgrade strengthens the form's weaker effect and adds one new small effect, never a third hook of the adult's strongest kind.** For example (proposal only):

| Form | Upgrade |
|---|---|
| Breach corp | Waved checkpoints also refund the scan fee; the first ICE a run deals nothing |
| Breach street | The first two losses barely scratch it; one free market item per run |
| Dodge corp | Slips two ICE a run for certain; insurance pays twice |
| Dodge street | ICE misses it more often still; a missed ICE drops nothing but is never lost to a fight |
| Tune corp | Sees three steps ahead; relays patch twice as much |
| Tune street | Sees three steps ahead; repairs more every move |
| Feast corp | Exit bonus counts double; exchange unlocks a rare item |
| Feast street | Caches find an item more often still; a win in ICE refunds the Charge of the move |
| Hidden (each egg) | Section 3.4's three effects, each a step up |

These mirror 1.0's five (Plat, Airgap, Init, Panic, Whisper), which were each "the line's ability, one notch stronger, plus one small extra". Numbers are not proposed; the starting point is 1.0's upgrade constants, then the bots.

## 5. How the three eggs differ inside a run

Because abilities are shared (3.1), the eggs differ through the egg pressures and skin. This section is the open design area.

1. **Heat, Charge and Sync in a run.** A move costs 4 Charge and adds 5 Heat. Iron's wear builds above Heat 75 and below Heat 20; Program's Overdrive needs Charge held at 80 or more for three awake hours; Wetware's Overlink needs Sync 85 or more held for three awake hours. A run starts only at Charge 30 or more and Charge falls through it, so a run naturally breaks an Overdrive hold and heats an Iron. **Open, to measure in the fork:** do the pressures progress during a run (the sketch says they are awake-time rules), pause during it, or end on jack-in? Proposal: the clock pauses during a run and the state ends at jack-in (simplest, no new interaction), except Iron's wear, which should keep building at Heat above 75 because that is the point of Iron's trade. Needs a decision before bots can model it.
2. **Run texture, not rules.** Each egg gets its own wording for the same events: node labels, ICE names, relay text, the summary. This is a skin: Program (processes, interrupts), Iron (firmware, batch queue, read-only), Wetware (plain words, tissue, culture; no CP2020 jargon in-game).
3. **One egg-flavored anomaly each** (section 6). This is where eggs can differ in play without touching ability parity.
4. **Items.** Item names per egg are already proposed in the sketch (Coolant cell / Coolant loop / Cold pack, and so on); the effects are unchanged, so nothing here needs balancing.

## 6. Anomalies

1.0 has six; the Source's purge order is the only region-limited one. 2.0 needs:

| Slot | Plan |
|---|---|
| Debug station | Dropped. The clinic node replaces it (sketch, Bugs). Maintainer's design, kept. |
| Existing five | Keep. Reword per egg as skin (section 5). Honeypot, rig, echo and sector keep their rules. |
| Egg-flavored anomaly, one per egg (proposal) | Program: a **stack overflow** (take on Charge past the line for a free ICE skip, Overdrive-flavored). Iron: a **bit-rot patch** (cool and calibrate: lose Heat, clear some wear, at a cost in Charge). Wetware: a **graft** (a Sync gain, a chance of an infection, Overlink-flavored). Each has two options like 1.0's, each choice leans Standing or temper |
| Purge order | Keep in the Source; unchanged rule, the three readings (the order can never run) |
| Source anomalies | 1.0's Source pulls from all six; 2.0 should keep the Source's own selection mostly un-egg-flavored |

All proposals; the egg anomalies are small content, not a new mechanic, but they do add rules and need tests. Each should respect the fork's `lean` adapter (allegiance becomes Standing; temper is its own value).

## 7. Regions, the tutorial run and contracts

- **Regions.** Keep the six and their order, node weights, ICE damage and loot. Reskin the text per egg only. New regions are out of scope: they would add content, and 2.0 already has the clinic, the exchange stock and three anomalies to test. If a region is ever added for Rogue, treat it as a Rogue-only region (section 8).
- **Tutorial run.** The fixed map (entry, cache, ICE, relay, exit) stays, with the egg's wording. The guaranteed first fragment must be a story page every egg shares. The party hat gift and onboarding completion stay as in 1.0.
- **Contracts.** Keep the six kinds plus the clinic job already in the fork. No new kind is proposed.
- **Challenges.** Unchanged; check abilities against them (ground rule 5).
- **Daily trace.** Unchanged, but bump `DAILY.rules` whenever an ability changes the order of rolls.

## 8. Rogue (deferred, with direction)

Decided (maintainer, this stretch): Rogue is a line that escaped on its own from the unnamed corp that stole NL-0's earlier code, is built on the three hidden lines, and is hunted much more aggressively than the three NL-0 eggs (sketch, Hidden egg). For the netrun, that suggests, as proposals only: a **hunter presence** in runs (a clock or node type the corp's hunters add) rather than the corp trace, ability seeds drawn from the three hidden forms (3.4), and Rogue-only regions or events if any. Nothing is drawn up until Rogue's design is firmer; this section only keeps the direction visible.

## 9. Measuring it

The fork already carries the netrun rules: `prototype/netling2/sim/netrun/run.js` (1.0's `run.js` plus the clinic), with `sim/netrun-bot.mjs` and `sim/balance.mjs`. Plan:
1. Keep abilities as constants beside `RUN_CFG`, like 1.0, so the bots can read them.
2. Port `tools/netrun-bot.mjs`'s styles for the new abilities: sight and avoidance already work through `visibleNodeIds` and `moveToNode`; abilities that act on choices (markets, scrip) need bot support first. 1.0's bots never took contracts, so contract-dependent abilities cannot be measured until a bot does.
3. Targets: the 1.0 parity bars in ground rule 3, per ability set, in The Deep and The Source; plus the "do not make The Deep trivial" check (careful adults 14 to 19% disconnect).
4. Challenge and daily matrix: each ability against the four challenges and the daily's refund.
5. Tests: one narrow test per ability in the 1.0 style ("Chrome: corp insurance saves it from one disconnect a run"), in `prototype/netling2` until a 2.0 app exists.
6. Record each result in `prototype/netling2/notes/` and summarize here; do not quote numbers before they are measured.

## 10. Open questions for the maintainer

1. **Ability structure:** option A (shared by role and lean), B (egg twist) or C (unique), section 3.1. Proposal: A.
2. **Elder upgrades:** 11 shared or 23 per form (4).
3. **Hidden forms:** should Guru and Blank get full sight, or is that Ghost's alone (3.4)?
4. **Egg pressures in a run:** pause, end at jack-in, or keep running (5.1).
5. **Feast:** are loot, scrip and market edges the right theme, or should Feast mean sustain (healing, Charge) instead?
6. **Tune:** the weakest split in 3.3; give it a different second hook, or accept the overlap.
7. **A triggered ability** (a button the player presses, which 1.0 has none of): wanted for any form, or kept out as a new mechanic? Proposal: out.
8. **Egg-flavored anomalies:** the three proposed in section 6, or none.
9. **Order:** abilities first, then elder upgrades, then skin and anomalies, with Rogue last.

## 11. Not done

No ability, upgrade or anomaly here has been implemented, simulated or tested. No number has been proposed. The sources are 1.0's `docs/NETRUN.md`, `src/netrun/*` and the fork's `run.js` header and clinic diff; I read the 1.0 test titles but not their bodies, and I did not read the fork's netrun bot or `sim/balance.mjs`.
