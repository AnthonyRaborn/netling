# Netling 2.0 netrun drafts

Status: first-pass design drafts, revised after the maintainer's answers (see Decided below), for step 2 of the sketch's Next steps (netrun content per egg: abilities, 23 more elder upgrades, regions, events, tutorial run). Everything here is a proposal unless marked Decided. Nothing is in code, nothing is tuned and nothing has been measured; any number quoted is 1.0's, shown only as a starting point. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (the design record), [NETRUN.md](NETRUN.md) (1.0's netrun, the source of every hook named below) and [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (item and meter wording). Spoilers throughout.

**Decided (maintainer), recorded here:** (1) one ability per role and lean, at two levels (adult, elder), with the egg's flavor as the starting point of each egg's version; (2) egg pressures pause during a run, but each egg's own problem (Iron's wear and so on) can be made worse by a run; (3) no triggered abilities if avoidable; (4) a second, harder tier of ICE is mixed into runs at proportions that depend on the depth of the net (section 2.1). Everything else below is still a proposal.

## 1. Scope and ground rules

In: adult abilities, elder upgrades, how the three eggs differ inside a run, anomalies, regions, the tutorial run, and what has to be measured. Out until the rest is firmer: the Rogue egg's netrun (see section 8), new mini-games, new regions, a new node type beyond the clinic.

Ground rules carried over (all from 1.0's netrun code and docs):
1. **Pure rules.** Anything that changes a run lives in `run.js`-style code: `(pet, rng)`, no DOM, driven by the balance bots.
2. **One ability, two levels (Decided).** The adult has the ability at level 1 and the elder at level 2. Caution from 1.0: its lines started with one effect, fell behind in The Deep, and got a second effect in balance pass 2, so a named ability may have two parts (for example 'takes less ICE damage, and the first loss each run barely scratches it'), and level 2 steps both parts up. That keeps 'one ability' without repeating 1.0's mistake.
3. **Parity target (re-measured with the ICE tiers on).** In 1.0 no adult ability was more than about 4 points better than another at avoiding disconnects in The Deep, and the five mainframe upgrades sat within a few points of each other in the Source (careful disconnects 24 to 28%). The same bar applies to every 2.0 form, measured, not argued.
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
| An ability the player triggers (a button, a charge) | none | New; avoided (maintainer prefers no triggered abilities) |

Observation for design: the 1.0 five cover every existing hook once. Reusing them for 27 adults means each hook is used about five times, so the 2.0 forms must differ by pairing and by egg, not only by hook. Section 3 proposes how.

### 2.1 ICE tiers (new input to everything below)

Decided (maintainer): a second tier of harder ICE is mixed in at random, with the share of tier-2 ICE set by the depth of the net. My reading, to confirm: the shallow regions currently hold only the one kind of ICE, so they get an occasional harder fight, and the share grows toward The Source.

What the code gives us: an ICE fight is a random one of the four mini-games, played at `speed` 1, or 0.85 while jacked in overclocked; the region sets only the damage (35 in the Public Net up to 52 in the Source). Dodge and Feast also speed up over the course of a game. So the cheapest harder variant is a higher `speed` and, if wanted, a higher damage or better reward, using the lever overclock already uses. A per-game variant (a different Breach or Tune puzzle) is new content and needs its own design.

What it changes in this work:
1. **Re-baseline.** The disconnect targets (careful: 3% Public Net, 4% Bazaar, 6% Corp Grid, 10% Ruins, 34% Deep in 1.0) were set with one kind of ICE. Any tier share moves every one of them, so the targets and the parity bars (ground rule 3) must be re-measured with the mix on, and the shallow regions will no longer be near-risk-free.
2. **Abilities that touch ICE gain value.** Damage reduction, avoidance and last stands are worth more against harder ICE, and Feast and Tune relatively less, so the Breach and Dodge abilities need re-balancing against Feast and Tune once the mix exists. This is the main reason to settle the ICE tiers before tuning any numbers.
3. **Open design questions for the maintainer:** (a) depth by region only, or also by layer inside a map; (b) is the tier visible on the map or revealed at the fight; (c) harder means faster, or more damage, or both; do tier-2 wins pay more; (d) do avoidance abilities (phase, slip) treat tier 2 the same as tier 1 (proposal: yes, otherwise Dodge forms stop being Dodge forms); (e) how this fits the challenges (Glass becomes harder) and the daily trace (the tier roll must be seeded in the ice lane); (f) the flash rule: a faster game must still keep every strobe under three a second.
4. **Not proposed here:** the shares themselves. They are a tuning output of the bots, not a design choice to guess at.

## 3. Adult abilities

### 3.1 Structure (Decided, maintainer)

One ability per role and lean combination, at two levels (adult is level 1, elder is level 2). That is 8 abilities plus 3 hidden ones, each defined once and stepped once, so 11 abilities and 22 level definitions, not 27 adults with separate upgrades. The egg's flavor is the starting point for each egg's version of an ability.

**How I read 'egg flavor as the starting point' (please confirm):** the core ability is the same in every egg, so parity can be measured once; each egg adds a rider that comes from the problem it already manages (section 3.5). The alternative reading, three separately designed versions of every ability, is closer to the earlier option B or C and about three times the tuning; I have not assumed it.

### 3.2 Roles and leans as ability themes

The role is the mini-game a form is built around; the lean is the Standing lean. Themes (proposal):

| Role | Game | Theme in a run |
|---|---|---|
| Breach | Breach | Fights ICE well: takes less from it or wins more |
| Dodge | Dodge | Avoids ICE and trouble |
| Tune | Tune | Sees the map and pays attention to the route |
| Feast | Feast | Takes more from the net: loot, scrip, sustain |

Lean: **corp** forms lean on credentials, relays and the exchange; **street** forms lean on toughness, the black market and risk.

### 3.3 The eight (proposal; each is one ability, level 1 shown)

Working names are placeholders. Each ability is one named ability with up to two parts, both existing or small hooks. Strength is not set here; 1.0's constants are the starting point for the bots. Level 2 (elder) is the same ability one step stronger in every part, which the elder in 1.0 already did for its line.

| Form (egg-neutral name) | Ability (working name) and what it does at level 1 | Hooks | Closest 1.0 |
|---|---|---|---|
| Breach corp | Clearance: takes reduced ICE damage, and checkpoints wave it through | damage, checkpoint | Firewall plus Chrome |
| Breach street | Hardened: takes reduced ICE damage, and the first loss each run barely scratches it | damage | Firewall plus Airgap |
| Dodge corp | Phase: slips the first ICE of a run, and often the later ones | avoidance | Glitch |
| Dodge street | Unseen: ICE often never notices it, and checkpoints never notice it | avoidance, checkpoint | Ghost without the sight |
| Tune corp | Lookahead: sees node types two steps ahead, and relays patch it | sight, relay | Daemon plus Chrome |
| Tune street | Upkeep: sees node types two steps ahead, and repairs a little Integrity every move | sight, per-move repair | Daemon |
| Feast corp | Concession: more loose scrip, and a cheaper exchange | loot (small), market (small) | New, Chrome's price |
| Feast street | Scavenge: better cache and ICE-win loot odds, and moves cost a little less Charge | loot (small), move cost (small) | New |

Where this is weak (flag for the maintainer):
- **Tune** has two forms with nearly the same first part. They differ only in the second part. If that is too thin, give one of them a different hook.
- **Dodge corp** has only one part. 1.0's Glitch also needed a second effect (the later phases) to catch up, so I counted the 'often the later ones' as part of the same ability. Measure first.
- **Last stand** (Chrome's insurance) is dropped from the eight. In 1.0 it lived on Chrome only. It could return as a part of Clearance or Phase if the bots show those lagging.
- With ICE tiers coming (2.1), Breach and Dodge abilities will need to be re-tuned against Feast and Tune.

### 3.4 Hidden abilities (one per egg, proposal)

Each hidden form masters all four games and takes no side, and may break the form rules. Proposal: each hidden ability has **parts drawn from three of the four roles**, at two levels, so it is the strongest runner and the most expensive to reach.

| Egg | Form | Level 1 |
|---|---|---|
| Program | Ghost | 1.0's Ghost: full sight, checkpoints never notice it, 45% of ICE never notice it |
| Iron | Guru | Full sight, reduced ICE damage, a small loot edge |
| Wetware | Blank | Checkpoints never notice it, ICE often misses it, one last stand a run |

Open: whether Guru and Blank get full sight at all. Full sight removes the map's fog, which is its main uncertainty, so keeping it to Program's Ghost is a reasonable default.

### 3.5 Egg riders (proposal, starting point)

Each egg adds a small rider to every one of its abilities, drawn from the egg's own bar (sketch, Egg pressures), so the same ability plays slightly differently per egg:

| Egg | Bar | Rider theme |
|---|---|---|
| Iron | Heat | Heat in a run: a lost fight adds less Heat, or a relay vents more |
| Program | Charge | Charge in a run: a move costs a little less, or a relay refills more |
| Wetware | Sync | Sync in a run: a lost fight costs less Sync, or a loss never rolls an infection |

Cautions: 1.0 dropped an 'Airgap: no Heat from a lost fight' upgrade because Heat drives throttling damage, so it was worth far more than it looked; the Heat rider especially needs measuring. The riders should be small enough that no egg's abilities are ahead in The Deep. The riders are also where section 5's run pressure enters (a rider that eases Iron's Heat matters more because a run raises Heat).

## 4. Elder level (level 2)

Decided structure (3.1): the elder has the same ability as its adult at level 2, not a separate upgrade. That is 11 level-2 definitions, one per ability, shared by every form of that role and lean in every egg, plus the egg riders stepped to their level 2.

**Counting.** The sketch's 'about 23 more elder upgrades' (27 elders minus the 4 whose names come from 1.0: Whisper, Plat, Init and Daemon) is replaced by 11 level-2 definitions. The 1.0 names stay as names only; their old Mainframe upgrades are not carried over as such. This is a smaller job than the sketch assumed.

**Method.** Level 2 steps every part of the ability once: reduction a little deeper, sight one step further, a repair a little bigger, a slip chance a little higher. 1.0's own Mainframe upgrades were exactly that plus one small extra, and they sat within a few points of each other in the Source (careful disconnects 24 to 28%); the target for level 2 is the same closeness, measured in the Source with the ICE tiers on.

The elder is the only stage that enters the Source (13 layers, ICE weight 11, ICE damage 52, no markets or checkpoints). Markets and checkpoints are absent there, so a Concession or Clearance ability does nothing in the Source; the rest of its power must live in the parts that act elsewhere. This is true in 1.0 for Chrome's checkpoint and exchange parts too, and its relay and insurance parts are what carried it. Flag: Feast corp and Breach corp need a part that works in the Source.

## 5. How the three eggs differ inside a run

Because the core abilities are shared (3.1), the eggs differ through the riders (3.5), the egg pressures and skin. This section is the open design area.

1. **Pressures pause in a run (Decided, maintainer).** The hold clocks of Overdrive and Overlink and the state benefits do not advance during a run. Iron's wear is the exception the maintainer named: an egg's own problem can get worse in a run. Proposal for each (starting points to measure, not set):
   - **Iron:** wear keeps building. A run adds Heat on every move (5) and on a lost fight (12), so a run that gets hot builds wear, and the wear stays after the jack-out.
   - **Program:** Charge falls with every move (4), and the 'bleed and overflow' problem becomes a run problem, for example a lost fight at high Charge costs extra Integrity.
   - **Wetware:** Sync and infections: a lost fight rolls an infection at the usual chance, and a disconnect hurts Sync more.
   Open: when the run ends, does a pressure state that was held resume where it stopped, or does it end at jack-in? Proposal: it resumes (pause means pause), which keeps a long run from silently punishing an attentive player.
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
6. Add the ICE tier mix to the fork first (2.1), then re-baseline, then tune abilities against it; abilities tuned before the mix will be wrong.
7. Record each result in `prototype/netling2/notes/` and summarize here; do not quote numbers before they are measured.

## 10. Open questions for the maintainer

Answered (Decided, recorded at the top): ability structure (one per role and lean, two levels), egg flavor as the starting point, pressures pause, no triggered abilities, ICE tiers by depth.

Still open:
1. **Egg flavor reading:** shared core with egg riders (3.1, 3.5, my reading), or three designed versions of each ability.
2. **'One ability':** may a named ability have two parts, as proposed in ground rule 2, or must it be a single effect.
3. **ICE tiers (2.1):** depth by region or also by layer; visible or hidden; faster, stronger or both; rewards; whether avoidance treats tier 2 as tier 1.
4. **Pause semantics:** a held state resumes after a run (my proposal) or ends at jack-in.
5. **Egg run problems (5.1):** the three proposals (Iron's wear, Program's overflow, Wetware's infections), or others.
6. **Hidden forms:** do Guru and Blank get full sight, or is that Ghost's alone.
7. **Feast:** loot and scrip (proposed) or sustain.
8. **Tune:** overlap between its two forms.
9. **Elder in the Source:** Feast corp and Breach corp need a part that works where there are no markets or checkpoints (4).
10. **Egg-flavored anomalies:** the three proposed in section 6, or none.
11. **Order:** ICE tiers first, then abilities, then elder level, then anomalies and wording, with Rogue last.

## 11. Not done

No ability, upgrade or anomaly here has been implemented, simulated or tested. No number has been proposed. The sources are 1.0's `docs/NETRUN.md`, `src/netrun/*` and the fork's `run.js` header and clinic diff; I read the 1.0 test titles but not their bodies, and I did not read the fork's netrun bot or `sim/balance.mjs`.
