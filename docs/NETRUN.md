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
12. [The tutorial run](#the-tutorial-run)
13. [Where the run lives](#where-the-run-lives)

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
7. Region lock (`regionLock`): stage too young, or The Deep without codex fragment `ruins-4`.
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
- Each **Overclock chip** adds 60 to `runCooldownCut`.

The tutorial run neither starts nor resets the cooldown (`noCooldown`).

## Regions

`REGION_ORDER` is public, corp, bazaar, ruins, deep. `tutorial` is defined too but is not in the picker.

| Region | Unlock | Middle layers | Node weights (cache / ICE / relay / checkpoint / market / anomaly) | ICE damage | Exit bonus items | Home sound |
|---|---|---|---|---|---|---|
| Public Net | any stage | 6 | 3 / 6 / 1 / 1 / 1 / 2 | 35 | 1 | square, x1 |
| Corp Grid | teen+ | 7 | 3 / 6 / 1 / 4 / 0 / 1 | 40 | 1 | triangle, x1.25 |
| Darknet Bazaar | teen+ | 7 | 2 / 5 / 1 / 0 / 4 / 2 | 38 | 1 | sawtooth, x0.9 |
| Old Web Ruins | adult | 7 | 3 / 5 / 1 / 0 / 0 / 4 | 45 | 2 | sine, x0.75 |
| The Deep | adult and codex fragment `ruins-4` | 8 | 2 / 8 / 1 / 0 / 0 / 2 | 50 | 2 | sine, x0.5 |

While locked, The Deep shows as `???` in the picker. Each region has its own palette and its own netrun sound voice. The player's chosen sound pack applies only at home.

Loot tables (weights), used for caches, ICE wins, exit bonuses and anomaly loot:

| Region | Loot |
|---|---|
| Public Net | coolant 3, antivirus 2, booster 2, repair 2, voucher 1, memory 1, blackice 1 |
| Corp Grid | voucher 4, antivirus 3, coolant 2, repair 2, booster 1 |
| Darknet Bazaar | blackice 4, memory 2, booster 2, coolant 1 |
| Old Web Ruins | memory 4, repair 3, coolant 2, antivirus 2, booster 1 |
| The Deep | memory 3, booster 2, antivirus 2, coolant 2, repair 2, voucher 1, blackice 1, overclock 1 |

Market stock (weights) differs from loot in the Public Net (`coolant 2, antivirus 2, booster 2, blackice 2, repair 2, memory 1, overclock 1`) and the Bazaar (`blackice 3, memory 2, booster 2, overclock 2, antivirus 1, coolant 1, repair 1`). Bazaar items cost 10 Charge, all others 12. Only regions whose `nodes` include `market` (Public Net, Bazaar) generate market nodes.

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
| `cache` | 40% chance of a loot item (`cacheFindChance`). Independent 15% chance of a codex fragment, 3% chance of an accessory |
| `ice` | A random mini-game (any of the four). Win: 20% chance of loot, 5% of an accessory. Loss: Integrity minus the region's ICE damage (halved for Firewall), Heat +12. Integrity 0 disconnects |
| `relay` | Charge +15, Heat -20. Then a choice: CONTINUE or JACK OUT (banks loot, ends the run) |
| `checkpoint` | Chrome and Ghost pass automatically. Others choose: **HIDE** (Charge -8, Heat +8, allegiance -1, 25% chance of -15 Integrity), **COMPLY** (allegiance +1, a random carried item is confiscated, or -5 Integrity if carrying nothing), **VOUCHER** (spend a voucher from the inventory, pass clean, allegiance +1) |
| `market` | Two different offered items at the region price, plus a 50% chance of an accessory offer at 20 Charge. Buying needs Charge above price + 5. Each item bought leans allegiance by -0.5 |
| `anomaly` | A random anomaly from the list below |
| `exit` | Adds the region's exit bonus item(s), rolls 60% for a fragment (100% in the tutorial) and 8% for an accessory, then jacks out |

Glitch form skips the first ICE of each run entirely (`run.phased`).

## Movement costs

Per move: Charge -4 (`moveCharge`), Heat +5 (`moveHeat`).

- Charge reaches 0: **disconnect**.
- Heat at 90 or more: Integrity -6 per move (`throttleDamage`). Integrity reaching 0 this way disconnects.

## Ending a run

**Jack out** (`jackOut`): via the exit node or a relay.

- Every carried item goes to the inventory; anything that does not fit is lost ("N lost: inventory full").
- Half of the Integrity lost during the run is restored (`jackOutRestore = 0.5`, based on `startStats.integrity`).
- Fragments and accessories found this run go into `pet.codexInbox` and `pet.accessoryInbox`. The UI (`drainCodexInbox`, `drainAccessoryInbox`) banks them into the shared codex and wardrobe.
- `clean` is true when no ICE was lost. A clean clear cuts 1 hour off the next cooldown.

**Disconnect** (`disconnect`): Integrity or Charge hits 0 during a move, an ICE fight, or a choice.

- Integrity is raised to at least 30, Charge to at least 5, Sync -20, stability -1.
- One care mistake is logged, unless the netling is already at 9 of 10 (a disconnect can never be the killing mistake).
- All loot, fragments and accessories from the run are lost.
- The UI grants the earned "bandage" accessory on the first disconnect.

**Abort** (ABORT RUN pressed twice within 2.5 s): loot, fragments and accessories are forfeited, nothing else. Counts as `aborted`; the cooldown starts and any clean-clear bonus is reset.

All three call `endRun`, which stamps `lastRunEndAge`, updates `runCooldownCut` and increments `runStats`.

## Adult form abilities

`FORM_ABILITIES`, applied automatically to adult netlings only:

| Form | Ability |
|---|---|
| Chrome | Corp credentials: checkpoints wave it through |
| Firewall | ICE deals half damage |
| Daemon | Sees node types two steps ahead |
| Glitch | Slips through the first ICE of each run |
| Ghost | Sees every node; checkpoints never notice it |

## Anomalies

Five events in `ANOMALIES`. Each has two options. Choices lean the hidden axes (`lean(allegiance, stability)`).

| Event | Option A | Option B |
|---|---|---|
| Corrupted sector | REPAIR: Charge -10, stability +1, 50% loot | SALVAGE: stability -1, 70% loot, else -12 Integrity |
| Corp honeypot | REPORT IT: allegiance +1, 50% a voucher | RAID IT: allegiance -1, 55% two loot items, else -20 Integrity |
| Stray signal | FOLLOW: Heat +5, reveals the next 2 layers | TUNE OUT: nothing |
| Overclock rig | PLUG IN: Charge +25, Heat +25, stability -1 | LEAVE IT: nothing |
| Echo | LISTEN: Sync +15, 50% a codex fragment | MOVE ON: nothing |

After an anomaly, Charge, Heat and Sync are clamped to 0..100. Integrity or Charge at 0 afterwards disconnects.

## Codex fragments

22 fragments in `FRAGMENTS`, in story order per region. The order of the array is the drop order: `nextFragment(region, known)` returns the first fragment of that region not yet known, so the story reads in sequence and never repeats.

| Region | Count | Ids |
|---|---|---|
| Public Net | 4 | public-1 to public-4 |
| Corp Grid | 5 | corp-1 to corp-5 |
| Darknet Bazaar | 5 | bazaar-1, 2, 3, 5, 4 (5 sits before 4 on purpose: the graffiti stays the region's last word) |
| Old Web Ruins | 4 | ruins-1 to ruins-4 |
| The Deep | 4 | deep-1 to deep-4 |

Fragment ids are permanent: saved codexes store them, and `sanitize.js` drops unknown ids. Never rename or remove a shipped id.

Fragment sources: cache (15%), exit (60%, tutorial 100%), Echo anomaly (50%). `run.known` snapshots the codex at jack-in and `run.fragments` holds finds this run, so two finds in one run never repeat. Fragments found in a run that ends in a disconnect or abort are lost.

Completing all 22 grants Root Access (see [SIMULATION.md](SIMULATION.md#root-access-nl-0)). The Deep opens when `ruins-4` is known. Full text is in [CONTENT_CATALOG.md](CONTENT_CATALOG.md#codex-fragments).

## Accessories in runs

`rollAccessory(exclude, rng, region)` picks an unowned, non-earned style item, weighted by rarity (common 6, rare 2, very rare 1), restricted to items with no `regions` or a matching region. Sources and odds:

| Source | Chance |
|---|---|
| Market offer | 50% one is offered, bought for 20 Charge |
| Cache | 3% |
| ICE win | 5% |
| Exit | 8% |

Accessories found or bought are held in `run.accessories` and are lost on a disconnect or abort, like loot. `noStyleDrops` (tutorial) disables all of it.

## The tutorial run

`REGIONS.tutorial` copies the Public Net but with a fixed map (entry, cache, ICE, relay, exit), ICE damage 10, only coolant loot, a guaranteed cache find, a guaranteed first Public Net fragment, no cooldown effect and no accessory drops. Finishing it triggers the party hat gift and completes onboarding. Tips are drawn by `RunView.drawTutorialTip`.

## Where the run lives

- **Data**: `pet.run`, cleaned by `sanitize.cleanRun`. On load, a broken ICE or choice is dropped (the runner is put back on the map), a dead-end position clears the run, and a finished run always gets a result.
- **Input and drawing**: `RunView` has the same interface as `GameSession` (`input`, `update`, `draw`, `forfeit`), so `ui/play.js` treats both as `app.session`.
- **ICE**: `RunView.startIce()` creates a `GameSession`. Its result is fed to `resolveIce`. ICE fights count toward `gamesPlayed` (via `onGame`) but not toward per-game win streaks or the netling's own `games` record.
- **Balance tools**: `tools/netrun-bot.mjs` plays runs with scripted strategies; `tools/netrun-balance.mjs` runs Monte Carlo batches per play style. See [TESTING.md](TESTING.md).
