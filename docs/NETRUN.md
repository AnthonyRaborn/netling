# Netrun reference

A **netrun** is the game's dungeon crawl: the netling jacks into the net and walks a node map, spending its real Charge, Heat and Integrity. Rules live in `src/netrun/run.js`, map generation in `map.js`, regions in `regions.js`, events in `anomalies.js`, lore in `codex.js`, and the screen and input in `view.js`.

## Contents

1. [Run lifecycle](#run-lifecycle)
2. [Starting a run](#starting-a-run)
3. [Regions](#regions)
4. [Map generation](#map-generation)
5. [Nodes](#nodes)
6. [Movement costs](#movement-costs)
7. [Ending a run](#ending-a-run)
8. [Adult form abilities](#adult-form-abilities)
9. [Anomalies](#anomalies)
10. [Codex fragments](#codex-fragments)
11. [Accessories in runs](#accessories-in-runs)
12. [Contracts](#contracts)
13. [Challenges](#challenges)
14. [The tutorial run](#the-tutorial-run)
15. [Where the run lives](#where-the-run-lives)

## Run lifecycle

`pet.run` is `null` when no run is open. A run has a `phase`:

| Phase | Meaning | Input |
|---|---|---|
| `map` | Choosing the next node | Left/right selects, A moves |
| `ice` | An ICE mini-game is pending | The mini-game's own input |
| `choice` | A relay, checkpoint, market or anomaly prompt is open (`run.pending`) | Left/right, A |
| `done` | Finished; `run.result` is set and the summary screen is showing | A closes |

`run.result` is `jacked`, `disconnected` or `aborted`. `closeRun()` writes one log line and sets `pet.run = null`.

The run is stored on the netling, so it survives a reload. `main.js` reopens it on boot (`openRun()`). The simulation keeps ticking during a run: Charge drains, events can open, a visitor logs off.

## Starting a run

`runBlockReason(pet, region, codex)` returns why a run cannot start, or `null`. Checked in this order:

1. Dead or still compiling.
2. A run is already open (resuming is always allowed).
3. Hibernating.
4. The tutorial region is always allowed.
5. Resting (asleep or napping).
6. Rebooting.
7. Region lock (`regionLock(region, stage, codex, cleared)`): stage too young, the region before it in `REGION_ORDER` not yet cleared by this netling, or The Deep without codex fragment `ruins-4`.
8. Uplink cooldown still running.
9. Charge under 30 (`RUN_CFG.minCharge`).

### Uplink cooldown

The cooldown is measured from the end of the last run, in netling minutes (`lastRunEndAge`).

| Stage | Base |
|---|---|
| Baby | 240 min |
| Teen | 210 min |
| Adult | 180 min |

Two things shorten it, and it never goes under 120 minutes (`runCooldownFloorMin`):

- A **clean clear** (jacked out with no ICE lost) sets `runCooldownCut = 60` for the next cooldown. Any other result resets the cut to 0.
- Each **Bypass chip** adds 60 to `runCooldownCut`.

The tutorial run neither starts nor resets the cooldown (`noCooldown`).

## Regions

`REGION_ORDER` is public, bazaar, corp, ruins, deep, source: the way down. `tutorial` is defined too but is not in the picker.

### The way down

Each region after the first opens once **this netling** has reached the exit of the region before it (`pet.cleared`, a list of region ids). Only the exit node counts: jacking out at a relay, a disconnect, an abort and the tutorial do not. The stage gates still apply on top, so a baby that clears the Public Net waits for the teen stage before the Bazaar opens. Every new netling starts with only the Public Net; clears are not inherited.

Netlings from before the order existed (no `cleared` field) are given every region their current stage can enter (`clearedForStage`), so nothing they could reach closes on them and the Ruins still open when a teen grows up.

| Region | Unlock | Middle layers | Node weights (cache / ICE / relay / checkpoint / market / anomaly) | ICE damage | Exit bonus items | Home sound |
|---|---|---|---|---|---|---|
| Public Net | any stage | 6 | 3 / 6 / 1 / 1 / 1 / 2 (exchanges 50%) | 35 | 1 | square, x1 |
| Darknet Bazaar | teen+, Public Net cleared | 7 | 2 / 5 / 1 / 0 / 4 / 2 (exchanges 15%) | 40 | 1 | sawtooth, x0.9 |
| Corp Grid | teen+, Bazaar cleared | 7 | 3 / 7 / 1 / 4 / 2 / 1 (exchanges 80%) | 35 | 1 | triangle, x1.25 |
| Old Web Ruins | adult, Corp Grid cleared | 7 | 3 / 6 / 1 / 0 / 1 / 4 (exchanges 50%) | 48 | 2 | sine, x0.75 |
| The Deep | adult, Ruins cleared, and codex fragment `ruins-4` | 10 | 2 / 9 / 1 / 0 / 1 / 2 (exchanges 50%) | 50 | 2 | sine, x0.5 |
| The Source | mainframe, Deep cleared, and codex fragment `deep-5` | 13 | 2 / 11 / 1 / 0 / 0 / 3 | 52 | 3 | triangle, x0.4 |

ICE damage was tuned in balance pass 2 so careful players disconnect more often at each step down: about 4% in the Public Net, 5% in the Bazaar, 7% in the Corp Grid (whose checkpoints add their own damage), 8% in the Ruins and 35% in The Deep, which stays a wall (`tools/baseline/netruns.json`). The Deep is hard by distance (10 middle layers, from 8 in pass 2) rather than by ICE damage, because more ICE damage pulls the adult abilities apart again; with their abilities, careful adults disconnect 14 to 19% there against 1 to 3% in the Ruins.

The Source is somewhat harder than The Deep, again by distance (13 middle layers) and more ICE (weight 11). Careful mainframes disconnect 24 to 28% of the time there (10 to 14% in The Deep), and reach its exit 38 to 44% of the time. Without an ability it would be 52%. It has no markets or checkpoints. Jacking into it with Root Access logs `> NL-0: i'll wait up here.`

While locked, The Deep shows as `???` in the picker, and the exit message of the Ruins never names it. The Source does not: while locked it shows as `<<SECTOR CORRUPTED>>` (`lockedName`), its name blinking once every 3.2 seconds (`ui/corrupt.js`: for 0.4 s it slips sideways in pink with some letters turned to block glyphs or look-alike digits, `<<S▓CT0R C░RRUPT3D>>`; still with motion calmed), over the warning "do not open. do not open. do not" (`lockedBlurb`). The first time it opens on a device, the entry repairs itself to THE SOURCE with the log line `> sector integrity: restored. something down there noticed.` (`progress.sourceSeen`). The picker also shows how many new codex fragments this netling has recovered against the per-life cap. Each region has its own palette and its own netrun sound voice. The player's chosen sound pack applies only at home.

Loot tables (weights), used for caches, ICE wins, exit bonuses and anomaly loot:

| Region | Loot |
|---|---|
| Public Net | coolant 2, antivirus 2, booster 2, repair 2, voucher 1, memory 1, blackice 1, segfault 2 |
| Corp Grid | voucher 4, antivirus 3, coolant 2, repair 2, booster 1, segfault 1 |
| Darknet Bazaar | blackice 4, memory 2, booster 2, coolant 1, segfault 1 |
| Old Web Ruins | memory 4, repair 3, coolant 2, antivirus 2, booster 1, segfault 1 |
| The Deep | memory 3, booster 2, antivirus 2, coolant 2, repair 2, voucher 1, blackice 1, overclock 1, segfault 1 |
| The Source | memory 3, overclock 2, booster 2, repair 2, antivirus 2, coolant 2, blackice 1, voucher 1, segfault 1 |

### Markets and exchanges

Every region but the Source has market nodes, and each is one of two kinds, fixed when the map is made (`marketKinds` in `map.js`, by the region's `exchangeShare`, half and half unless set; a market a contract adds later gets one the same way). The map shows which: a purple storefront for a black market, a yellow one with a counter for a corp exchange.

| | Black market | Corp exchange |
|---|---|---|
| Allegiance per item bought | -0.5 (`blackLean`) | +0.5 (`exchangeLean`) |
| Charge per item | 12 (10 in the Bazaar, `marketPrice`) | 16 (`exchangePrice`); 11 for an adult Chrome line (`exchangeChromePrice`, corp credentials) |
| Stock (weights) | `blackStock`: blackice 3, booster 2, overclock 2, memory 2, segfault 1, coolant 1 (the Bazaar keeps its own: blackice 3, memory 2, booster 2, overclock 2, antivirus 1, coolant 1, repair 1, segfault 1) | `exchangeStock`: voucher 3, coolant 2, repair 2, antivirus 2, memory 1 |
| Accessories | its own exclusives and the shared ones ([CONTENT_CATALOG.md](CONTENT_CATALOG.md#accessories-and-props)) | the same |

Scrip prices, accessory prices and selling are the same at both. Exchanges are the only place to buy a Corp voucher. The Corp Grid, the Ruins and the Deep gained markets with this change, and one ICE weight each so that the disconnect order holds. With the split, an attentive player who buys at both comes out even (Chrome 24%, Firewall 23%), where a buy used to always lean indie.

### Corpo scrip

Scrip is the netling's money (`pet.scrip`, 0 to `SCRIP.max` = 100; anything over the cap is lost, and the inventory panel shows FULL). It is defined in `sim.js` (`SCRIP`, `sellValue`, `addScrip`).

| Tier | Items | Price | Sells at a market (half) | Scraps elsewhere (a quarter) |
|---|---|---|---|---|
| Common | Coolant cell, Antivirus patch, Repair kit, Signal booster, Memory shard | 15 | 7 | 3 |
| Uncommon | Black ICE shard, Corp voucher, Segfault | 25 | 12 | 6 |
| Rarest | Bypass chip | 50 | 25 | 12 |

- **Earning**: selling an inventory item while a market is open (the inventory's button reads SELL +n; `sellItem`), SCRAP at home (a quarter), any pickup that meets a full inventory (scrapped for a quarter automatically, at home or on jack-out), and loose scrip on runs: 3 at every exit (`exitScrip`) and 3 in 30% of empty caches (`cacheScripChance`, `cacheScrip`). Loose scrip is carried in `run.scrip` and banked on jack-out like loot; a disconnect or abort loses it. Selling is neutral for allegiance.
- **Spending**: a market item costs its price plus the region's Charge price; an accessory costs 25 scrip (common) or 50 (rare or very rare) plus 20 Charge (`accScrip`, `accPrice`). A button is enabled only while the netling has the scrip and more than Charge price + 5; `refreshMarket` recomputes this whenever the inventory sells mid-choice. Each item bought still leans allegiance by -0.5.
- **Inheritance**: the flatline fragment carries `Math.floor(scrip / 2)` (`inheritedScrip`), and the next netling starts with it.

## Map generation

`generateMap(regionId, rng)` builds a layered graph: one entry, `layers` middle layers of 2 to 3 nodes each, one exit.

- Node types are drawn independently per node from the region's weights.
- Layer 1 never contains a relay.
- The middle layer `ceil(layers / 2)` is guaranteed to hold a relay: if the draw produced none, one node is converted.
- Each node links to the nearest node (by relative vertical position) in the next layer, and 50% of the time also to the second nearest.
- Any node left with no incoming edge is attached to its nearest predecessor.

Result: every node is reachable from the entry and has a way forward. `tests/netrun.test.js` checks this for every region over many seeds.

The map is fogged. `visibleNodeIds()` shows visited nodes, revealed nodes and the current node's neighbours; the exit is always drawn. Daemon sees two steps ahead, Ghost sees everything.

## Nodes

Every move first costs Charge and Heat (see below), then the node triggers.

| Node | What happens |
|---|---|
| `entry` | Start only |
| `cache` | 40% chance of a loot item (`cacheFindChance`); an empty cache holds 3 loose scrip 30% of the time. Independent 15% chance of a codex fragment, 3% chance of an accessory |
| `ice` | A random mini-game (any of the four). Win: 20% chance of loot, 5% of an accessory. Loss: Integrity minus the region's ICE damage (halved for Firewall; 1.5x for a run jacked into overclocked), Heat +12. Integrity 0 disconnects. A run jacked into overclocked also plays its ICE at 0.85x speed |
| `relay` | Charge +15, Heat -20, and +20 Integrity for an adult Chrome (corp relays). Then a choice: CONTINUE or JACK OUT (banks loot, ends the run) |
| `checkpoint` | Chrome and Ghost pass automatically. Others choose: **HIDE** (Charge -8, Heat +8, allegiance -1, 25% chance of -15 Integrity), **COMPLY** (allegiance +1 and a 5 scrip scan fee, `complyScrip`; only a netling that can't pay has a random carried item confiscated, or -5 Integrity if carrying nothing), **VOUCHER** (spend a voucher from the inventory, pass clean, allegiance +1) |
| `market` | Two different offered items for their scrip price plus the region's Charge price, and a 50% chance of an accessory offer (25 or 50 scrip plus 20 Charge). While it is open the inventory sells for half price. Each item bought leans allegiance -0.5 at a black market, +0.5 at a corp exchange (see [Markets and exchanges](#markets-and-exchanges)) |
| `anomaly` | A random anomaly from the list below |
| `exit` | Adds the region's exit bonus item(s) and 3 loose scrip, rolls 60% for a fragment (100% in the tutorial) and 8% for an accessory, marks the region cleared for this netling (not the tutorial), then jacks out |

Glitch form skips the first ICE of each run entirely (`run.phased`), and each later ICE with a 35% chance (`glitchPhaseChance`). A Ghost goes unnoticed by 45% of ICE (`ghostSlipChance`).

## Movement costs

Per move: Charge -4 (`moveCharge`), Heat +5 (`moveHeat`).

- Charge reaches 0: **disconnect**.
- Heat at 90 or more: Integrity -6 per move (`throttleDamage`). Integrity reaching 0 this way disconnects.
- **Overclocked at jack-in** (Heat 65+, `run.hot`): every ICE fight this run runs at 0.85x speed (`iceSpeed()`) and a lost one deals 1.5x damage. It is fixed when the run starts, so the Heat each move adds never switches it on partway; see [SIMULATION.md](SIMULATION.md#overclocked). The map shows OC by the region name.

## Ending a run

**Jack out** (`jackOut`): via the exit node or a relay.

- A carried contract is settled first (see [Contracts](#contracts)).
- Every carried item goes to the inventory; anything that does not fit is scrapped for a quarter of its price ("N scrapped for S scrip: inventory full"). Loose scrip is added, up to the cap.
- `pet.codexFound` grows by the number of fragments banked (see the per-life cap below).
- Half of the Integrity lost during the run is restored (`jackOutRestore = 0.5`, based on `startStats.integrity`).
- Fragments and accessories found this run go into `pet.codexInbox` and `pet.accessoryInbox`. The UI (`drainCodexInbox`, `drainAccessoryInbox`) banks them into the shared codex and wardrobe.
- `clean` is true when no ICE was lost. A clean clear cuts 1 hour off the next cooldown.

**Disconnect** (`disconnect`): Integrity or Charge hits 0 during a move, an ICE fight, or a choice.

- Integrity is raised to at least 30, Charge to at least 5, Sync -20, stability -1.
- One care mistake is logged, unless the netling is already at 9 of 10 (a disconnect can never be the killing mistake).
- All loot, loose scrip, fragments and accessories from the run are lost.
- The UI grants the earned "bandage" accessory on the first disconnect.

**Abort** (touch: ABORT RUN, then CONFIRM ABORT at the top of the screen within 3 s; Esc or a controller's B: pressed twice within 2.5 s): loot, fragments and accessories are forfeited, nothing else. Counts as `aborted`; the cooldown starts and any clean-clear bonus is reset.

All three call `endRun`, which stamps `lastRunEndAge`, updates `runCooldownCut` and increments `runStats`.

## Adult form abilities

`FORM_ABILITIES`, applied automatically to adult and mainframe netlings (a mainframe uses its line's, through `lineOf`):

| Form | Ability |
|---|---|
| Chrome | Corp credentials: checkpoints wave it through. Corp relays: every relay also repairs 20 Integrity (`chromeRelayRepair`). Corp insurance: once a run, a blow that would disconnect it leaves it at 12 Integrity instead (`chromeInsurance`, `run.insured`) |
| Firewall | ICE deals half damage |
| Daemon | Sees node types two steps ahead. Upkeep: +6 Integrity with every move (`daemonMoveRepair`) |
| Glitch | Slips through the first ICE of each run, and each later one 35% of the time (`glitchPhaseChance`) |
| Ghost | Sees every node; checkpoints never notice it; 45% of ICE never notice it either (`ghostSlipChance`) |

The second effects (insurance, upkeep, the later phases, slipping past ICE) were added in balance pass 2 so no form is far ahead where it matters most. Careful play, 4000 runs each, disconnect rates in The Deep: Firewall 14%, Ghost 14%, Glitch 17%, Daemon 18%, Chrome 20%, against 35% with no ability.

Corp relays came later (the Mainframe gate test, [SOURCE_PLAN.md](SOURCE_PLAN.md#chrome-lags-on-exits-fixed-corp-relays)). Chrome had normal disconnect rates but reached far fewer exits: with nothing to heal it or cut damage, careful play banked at relays early (exits reached: 76% in the Corp Grid and Ruins against 83 to 93% for the other forms, and 31% in The Deep against 48 to 58%). The relay repair brings it to 86 to 89% and 44%, and halves the Integrity it spends outside The Deep. It pushes on further, so its Deep disconnect rate rose from 18% to 20%.

### Mainframe upgrades

A mainframe keeps its line's ability and adds an upgrade (`upgraded(pet)` in `run.js`; the text is `MAINFRAME_ABILITIES`). Tuned in the build's step 5 so the five sit close together in the Source:

| Form | Upgrade |
|---|---|
| Plat (Chrome) | Relays repair 40 instead of 20 (`platRelayRepair`); corp insurance pays out twice a run (`platInsurance`, `run.insuredTimes`) |
| Airgap (Firewall) | The first ICE fight it loses each run deals 30% of its halved damage (`airgapSoftLosses` 1, `airgapSoftMult` 0.3, `run.softLosses`) |
| Init (Daemon) | Sees node types three steps ahead (`initLookahead`); +8 Integrity with every move (`initMoveRepair`) |
| Panic (Glitch) | Slips through the first two ICE of each run for certain (`panicFreePhases`, `run.freePhases`), each later one 35% as before |
| Whisper (Ghost) | 50% of ICE never notice it (`whisperSlipChance`, against the Ghost's 45%) |

Careful play, 4000 runs each, disconnect rates: The Deep 11 / 10 / 14 / 13 / 12% (Plat, Airgap, Init, Panic, Whisper), the Source 26 / 26 / 28 / 28 / 24%. An earlier Airgap upgrade (no Heat from a lost fight) was dropped: Heat drives throttling damage, so it was worth more than it looked and took Airgap's Deep disconnects under the 8% floor.

## Anomalies

Six events in `ANOMALIES`. Each has two options. Choices lean the hidden axes (`lean(allegiance, stability)`). An anomaly with `regions` set turns up only there (`anomaliesFor(region)`); the other five turn up anywhere, so an anomaly node in the Source picks from all six and one elsewhere from five.

| Event | Option A | Option B |
|---|---|---|
| Corrupted sector | REPAIR: Charge -10, stability +1, 50% loot | SALVAGE: stability -1, 70% loot, else -12 Integrity |
| Corp honeypot | REPORT IT: allegiance +1, 50% a voucher | RAID IT: allegiance -1, 55% two loot items, else -20 Integrity |
| Stray signal | FOLLOW: Heat +5, reveals the next 2 layers | TUNE OUT: nothing |
| Overclock rig | PLUG IN: Charge +25, Heat +25, stability -1 | LEAVE IT: nothing |
| Echo | LISTEN: Sync +15, 50% a codex fragment | MOVE ON: nothing |
| The purge order (the Source only) | READ IT: -15 Integrity, 60% the next codex fragment (once the Source's codex is complete: reveals the next 3 layers instead, and its hint says so, `codexDoneHint`); shows one of three readings at random (`PURGE_READINGS`: NL-0 first on the list, every netling with yours near the end, or `./purge: permission denied. owner: nobody.`) | LEAVE IT: Sync +15, stability +1 ("left pending. pending. pending. something down here stops holding its breath.") |

After an anomaly, Charge, Heat and Sync are clamped to 0..100. Integrity or Charge at 0 afterwards disconnects.

## Codex fragments

27 fragments in `FRAGMENTS`, in story order per region. The order of the array is the drop order: `nextFragment(region, known)` returns the first fragment of that region not yet known, so the story reads in sequence and never repeats.

| Region | Count | Ids |
|---|---|---|
| Public Net | 4 | public-1 to public-4 |
| Corp Grid | 5 | corp-1 to corp-5 |
| Darknet Bazaar | 5 | bazaar-1, 2, 3, 5, 4 (5 sits before 4 on purpose: the graffiti stays the region's last word) |
| Old Web Ruins | 4 | ruins-1 to ruins-4 |
| The Deep | 5 | deep-1 to deep-5 (`deep-5` is NL-0's, and opens the Source) |
| The Source | 4 | source-1 to source-4 |

Fragment ids are permanent: saved codexes store them, and `sanitize.js` drops unknown ids. Never rename or remove a shipped id.

Fragment sources: cache (15%), exit (60%, tutorial 100%), Echo anomaly (50%). `run.known` snapshots the codex at jack-in and `run.fragments` holds finds this run, so two finds in one run never repeat. Fragments found in a run that ends in a disconnect or abort are lost.

### Per-life cap

A netling's memory holds at most 8 new fragments (`RUN_CFG.codexPerLife`), so the 22 that Root Access needs take at least three generations however often a player runs (8 + 8 + 6), and all 27 at least four (8 + 8 + 8 + 3). The Source's four come later still, behind the Mainframe stage. `pet.codexFound` counts the fragments banked this life; fragments in the current run hold a place while it lasts (`codexRoom(pet)`). Once it is full, a roll that would have found a fragment logs "a codex fragment, but its memory is full" and the fragment stays for the next generation. The counter starts at 0 for each new netling, and for netlings from before the cap. Measured (`tools/baseline/lineages.json`): attentive-style lineages finish the codex in life 3 or 4 (median 4), never sooner; casual lines rarely finish within 4 lives.

Completing the original 22 grants Root Access (`ROOT_FRAGMENT_IDS`, written out so fragments added later never join them; the Mainframe stage's five, `deep-5` and `source-1` to `source-4`, do not count) (see [SIMULATION.md](SIMULATION.md#root-access-nl-0)). The Deep opens when `ruins-4` is known, the Source when `deep-5` is. Corp gold and every region tint also count only the 22. Full text is in [CONTENT_CATALOG.md](CONTENT_CATALOG.md#codex-fragments).

## Accessories in runs

`rollAccessory(exclude, rng, region)` picks an unowned, non-earned style item, weighted by rarity (common 6, rare 2, very rare 1), restricted to items with no `regions` or a matching region. Sources and odds:

| Source | Chance |
|---|---|
| Market offer | 50% one is offered, bought for 20 Charge |
| Cache | 3% |
| ICE win | 5% |
| Exit | 8% |

Accessories found or bought are held in `run.accessories` and are lost on a disconnect or abort, like loot. `noStyleDrops` (tutorial) disables all of it.

## Contracts

`pet.contract` is an open job, `{ kind, region, n?, scrip, item, postedAge }` (`updateContract`, `RUN_CFG.contract*`). The UI calls `updateContract(pet, rng, codex, now)` every clock tick while the app is open and onboarding is done; it expires a job after 360 minutes (`contractOpenMin`, in netling minutes) and otherwise, when `contractReady` (alive, awake, no run, not hibernating or rebooting, cooldown 0), rolls 0.5 an hour (`contractChancePerHour`) for each netling minute since the last call, counting at most 60 of them (`contractCatchUpMin`). It picks an open region, then a kind that can be met there:

| Kind | Job | Met when (at jack-out) | Posted only if | Map fix at jack-in | Pay |
|---|---|---|---|---|---|
| `exit` | Reach the region's exit | Jacked out at the exit (not a relay) | always | none | 15 |
| `clean` | Reach the exit without losing to ICE | At the exit with `tally.iceLost` 0 | always | none | 20 |
| `ice` | Get past `n` ICE (2 or 3) | `iceWon + icePhased >= n` | always | Every route holds `n + 1` ICE (`contractIceSpare`) | 20 |
| `caches` | Crack `n` caches (2 or 3) | `tally.caches >= n` | always | Every route holds `n` caches | 15 |
| `market` | Buy something at a market | `tally.bought >= 1` (item or accessory) | the region has markets and the netling has 15+ scrip | A market in the first half of every route (`contractMarketBy`); each market's first offer is a cheapest-tier item | 15 |
| `fragment` | Bring back a codex fragment | At least one fragment carried out | an unread fragment waits there and `codexRoom > 0` | The exit's fragment roll is certain | 25 |

`item` (25%, `contractItemChance`) is one of the cheapest-tier items (coolant, antivirus, repair, booster, memory), chosen when posted.

- `startRun` takes the job along only when jacking into its region (`run.contract`, and `pet.contract = null`); another region leaves it posted. The map fix is `ensureOnEveryRoute` (`map.js`): it finds the route with the fewest nodes of the type (`thinnestRoute`, one pass over the layers) and turns one of that route's other middle nodes into the type, relays only when nothing else is left on it, until every route has enough. The map's shape never changes. Tests check the result against every route on hundreds of maps.
- `run.tally` counts `icePhased` (ICE a Ghost or Glitch slipped past), `caches` and `bought` alongside `nodes`, `iceWon` and `iceLost`. The run screen shows the job and its progress at the top right (`contractShort`).
- `settleContract` runs first in `jackOut`, `disconnect` and `abortRun`: `run.contract.settled` becomes `met` (the pay joins `run.scrip` and `run.loot`, so it is banked with them), `missed` or `void`. `jackOut` returns `contract: 'met' | 'missed' | null`; the UI counts a met one in `progress.contractsDone` (the Seal crest at 10).
- The balance bots never take contracts, so the baselines do not include them.

## Challenges

A rule for one run, picked in the region list (`src/netrun/challenges.js`). The row appears once any netling has reached the Deep's exit (`progress.deepExits`, no Root Access needed) and cycles NONE, GLASS, UNPLUGGED, BLACKOUT, BARE METAL. The rule rides along only into the Deep or the Source (`CHALLENGE_REGIONS`); other regions run without it. Ids are permanent.

| Id | Name | Rule | Broken by |
|---|---|---|---|
| `glass` | Glass | Lose no ICE fight (an Airgap's soft loss counts) | A lost fight: the challenge is off, the run goes on |
| `unplugged` | Unplugged | Relays are dark: no Charge, no venting, no Chrome or Plat patch. JACK OUT still works there, but only the exit counts | Nothing on its own; it is lost the usual way (Charge or Integrity) |
| `blackout` | Blackout | Only visited nodes and one step ahead are seen and drawn: no reveals, no Ghost or Daemon sight (`visibleNodeIds`) | Nothing on its own |
| `baremetal` | Bare metal | Buy no item and use no item. Accessories and selling are fine | Buying an item (the market option asks twice: `confirm`) or using one mid-run (USE asks twice): the challenge is off |

`run.challenge`, `run.challengeVoid` (broken) and `run.challengeWon` (set at the exit node if it still held) are saved with the run. A disconnect or abort never completes one. On jack-out the UI adds the id to `progress.challenges`. The map header shows the name (dimmed with OFF once broken) and the summary says "challenge complete" or "challenge not met".

**Rewards** (CONTENT_CATALOG): Glass the crest Cracked pane, Unplugged the shell Cut cable, Blackout the tint Blackout, Bare metal the effect Bare metal, and all four the track Exit code 0.

**Measured** (`CHALLENGE=<id> node tools/netrun-balance.mjs 1000 all`; under a challenge the bot never banks at a relay and, for Bare metal, never buys an item). Share of runs that complete it:

| Challenge | Deep, careful | Deep, skilled | Deep, adult forms | Source, careful | Source, skilled | Source, mainframes |
|---|---|---|---|---|---|---|
| Glass | 16% | 41% | 15 to 43% | 6% | 27% | 6 to 30% |
| Unplugged | 37% | 68% | 51 to 72% | 10% | 33% | 28 to 52% |
| Blackout | 45% | 73% | 70 to 75% | 19% | 48% | 48 to 56% |
| Bare metal | 45% | 73% | 71 to 76% | 19% | 48% | 51 to 61% |

Glass is the hardest and favours the forms that skip ICE (Glitch, Ghost, Panic, Whisper). Blackout and Bare metal read as easy for the bots only because the bots plan three steps ahead at most and never use items mid-run; people lean on both, so they should play harder than these numbers. The default baselines do not move: no bot takes a challenge unless `CHALLENGE` is set.

## The tutorial run

`REGIONS.tutorial` copies the Public Net but with a fixed map (entry, cache, ICE, relay, exit), ICE damage 10, only coolant loot, a guaranteed cache find, a guaranteed first Public Net fragment, no cooldown effect and no accessory drops. Finishing it triggers the party hat gift and completes onboarding. Tips are drawn by `RunView.drawTutorialTip`.

## Where the run lives

- **Data**: `pet.run`, cleaned by `sanitize.cleanRun`. On load, a broken ICE or choice is dropped (the runner is put back on the map), a dead-end position clears the run, and a finished run always gets a result.
- **Input and drawing**: `RunView` has the same interface as `GameSession` (`input`, `update`, `draw`, `forfeit`), so `ui/play.js` treats both as `app.session`.
- **ICE**: `RunView.startIce()` creates a `GameSession`. Its result is fed to `resolveIce`. ICE fights count toward `gamesPlayed` (via `onGame`) but not toward per-game win streaks or the netling's own `games` record.
- **Balance tools**: `tools/netrun-bot.mjs` plays runs with scripted strategies; `tools/netrun-balance.mjs` runs Monte Carlo batches per play style. See [TESTING.md](TESTING.md).
