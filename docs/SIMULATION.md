# Simulation reference

Everything here comes from `src/sim.js` unless another file is named. Numbers are the values of `CFG` (and friends). If a number here disagrees with the code, the code wins: fix this file.

The simulation is pure in the sense that matters: every function takes the state, a time in epoch milliseconds and an `rng` function. There is no hidden clock, no `Math.random` call that cannot be replaced, and no DOM. That is why the unit tests can run a whole life in milliseconds.

## Contents

1. [The clock](#the-clock)
2. [State shape](#state-shape)
3. [Stats and drain](#stats-and-drain)
4. [Rest: sleep, lights, naps](#rest-sleep-lights-naps)
5. [Care mistakes and death](#care-mistakes-and-death)
6. [Care actions](#care-actions)
7. [Events](#events)
8. [Visitors](#visitors)
9. [Items](#items)
10. [Evolution and the hidden axes](#evolution-and-the-hidden-axes)
11. [Lineage: fragments, traits, quirks](#lineage-fragments-traits-quirks)
12. [Root Access (NL-0)](#root-access-nl-0)
13. [Hibernation](#hibernation)
14. [Alerts](#alerts)
15. [Rule interactions worth knowing](#rule-interactions-worth-knowing)

## The clock

- One simulation step is **one minute** of game time. `tick(state, now, rng)` runs `floor((now - lastTick) / 60000)` steps, then advances `lastTick` by exactly that many minutes (the leftover seconds carry over).
- `state.ageMin` counts simulated minutes. It is the netling's own timeline: events, naps, cooldowns and shields are all stored as ages, not wall-clock times, so hibernation (which freezes the clock) cannot break them.
- If `now < lastTick` (the device clock moved backwards), `lastTick` is reset to `now` and the netling resumes from there instead of pausing until real time catches up.
- Hibernation makes `tick` return immediately. `wake()` sets `lastTick = now`, so the frozen stretch never happened.
- The step uses the **local hour** (`new Date(t).getHours()`) to decide sleep. Time zone changes and daylight saving shift the bedtime window. Tests pin `TZ=UTC` for this reason.
- The UI calls `advance()` (`ui/life.js`) once per second, on tab focus, and before every action, so the simulation is always caught up when the player acts.
- Test mode replaces "now" with a scaled clock (see [DATA_AND_SAVES.md](DATA_AND_SAVES.md#test-mode)). The simulation does not know.

### Order of work inside one step

`step()` does this, in order:

1. `ageMin++`. Stage `script` only waits for `bootMinutes` (3) and becomes `baby`. Nothing else happens while compiling.
2. Evolution check (baby to teen at 1440 min, teen to adult at 4320 min).
3. Sleep and nap transitions for this minute.
4. Drain Charge, Sync, and move Heat.
5. Cache file roll (awake and digesting only).
6. Virus roll, or `virusMin++` if already infected.
7. Integrity change from all current damage sources or regeneration.
8. Stability drift.
9. `stepVisit`, then `stepEvents`.
10. Care mistake checks (Charge, Sync, Heat, Lights).
11. Death checks, in this priority: integrity collapse, neglect, end of life.

## State shape

Created by `createScript()`. The full field list with meanings is in [DATA_AND_SAVES.md](DATA_AND_SAVES.md#the-netling-save). The fields that carry rules:

| Field | Meaning |
|---|---|
| `stage` | `script` (compiling), `baby`, `teen`, `adult`, `dead` |
| `form` | Current body. `bitling` for babies, `kernel`/`stub` for teens, one of five adult forms |
| `stats` | `charge`, `sync`, `integrity`, `heat`, each 0 to 100 |
| `cache` | 0 to 4 corrupted files |
| `sinceFed` | Minutes since the last meal. Starts at 240 so a new netling is not "digesting" |
| `zeroMin` / `flagged` | Per-need counters for care mistakes |
| `axes` | `allegiance` and `stability`, the two hidden numbers that pick the adult form |
| `games` | Per mini-game `played` and `won` counts (wins can count double, see Signal booster) |
| `event` | The one open timed event: `{ type, startedAge }` or `null` |
| `buffs` | `shieldUntilAge`, `traceSkip`, `boost` |
| `nap`, `lastNapEndAge` | Nap in progress and when the last one ended |
| `rebootUntilAge` | Set by a memory-overflow crash |
| `hibernation`, `lastWakeAt` | Wall-clock ms, because they span a frozen clock |

## Stats and drain

Four stats, all clamped to 0..100.

| Stat | Awake drain or drift | Effect at the extremes |
|---|---|---|
| Charge | -14/hr | At 0: 15 minutes makes a care mistake; also -6 Integrity/hr |
| Sync | -12/hr | At 0: 15 minutes makes a care mistake |
| Integrity | see below | At 0 for 120 minutes: death |
| Heat | +3/hr | At 85+: -8 Integrity/hr and -1 stability/hr; at 100: 15 minutes makes a care mistake |

Drain multipliers stack multiplicatively on the base rate:

| Situation | Multiplier |
|---|---|
| Asleep, lights off | 0.33 (`sleepDarkDrainMult`) |
| Asleep, lights on | 0.5 (`sleepDrainMult`) |
| Napping | 0.35 (`napDrainMult`) |
| Resting with trait Persistent | x0.7 extra |
| Daemon form (Charge only) | x0.8 |
| Ghost form (Charge and Sync) | x0.85 |
| Awake with lights off (Sync only) | x2 (`darkAwakeSyncMult`) |

Heat while resting falls 10/hr (`heatCoolWhileAsleepPerHour`) instead of drifting up.

### Integrity per hour

Damage sources add up. If there are none, Integrity regenerates.

| Source | Per hour |
|---|---|
| Virus | -12 |
| Cache 3 or more | -5 |
| Heat 85 or more | -8 |
| Charge at 0 | -6 |
| Nothing wrong | +5 (`integrityRegenPerHour`), or +8 when in "deep rest" (napping, or asleep with lights off) |
| Trait Volatile | an extra -1 always applies |

Care actions add flat Integrity on top: COOL +4, PURGE that clears something +4, PATCH +10, Repair kit +40.

The `integrityRegenPerHour` comment in `sim.js` says a full recovery takes "about 16 hours". The old README said 14. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md).

### Cache and digestion

- Eating sets `sinceFed = 0`. For the next 240 minutes ("digesting"), while awake and with fewer than 4 files, each minute has a 1/150 chance of writing a corrupted cache file.
- Resting stops cache writes and virus infections but the digestion timer still runs.
- Cache files raise virus and overflow chances (below). PURGE clears all of them.

### Viruses

- Infection chance per hour: `0.02 + 0.03 * cache`. It is multiplied by 0.5 for trait Hardened and by 0.7 for the Firewall form (they stack: x0.35).
- Never while resting, while shielded (Antivirus patch), or while already infected.
- Other infection routes: a scavenged packet (12%, or 6% with Hardened, times the Firewall multiplier), Black ICE shard (25%), a landed intrusion (certain).
- `virusMin` counts minutes since infection. PATCHing within 30 minutes gives +1 stability, later gives -1.

## Rest: sleep, lights, naps

**Sleep.** A netling sleeps from `22 + sleepOffset` to `7 + sleepOffset` local time. `sleepOffset` is a quirk from -2 to +2, so bedtime is 20:00 to 00:00 and wake time 05:00 to 09:00. It falls asleep and wakes on its own. On waking, `lightsOn` is reset to true.

**Lights.** `LIGHTS OFF` while asleep gives the dark drain multiplier and deep-rest regeneration. Sleeping with the lights on for 60 minutes (`lightsGraceMin`) is a care mistake. Lights off while awake makes it bored (Sync x2) and darkens the screen. Lights state is not touched at bedtime, so turning them off during the day carries into the night.

**Naps.** `NAP` rests it for up to 120 minutes at 0.35 drain. After a nap ends (naturally, early via WAKE UP, or because bedtime arrived) it needs 240 minutes before the next one. While resting, feeding, playing, cooling and netrunning are blocked (`blockReason`). PATCH, PURGE, HIDE, COMPLY, DEFEND and items that do not need it awake are still allowed. Naps cannot start during a netrun or while asleep.

**Event timers and rest.** A nap does not freeze an open event's timer. Only real sleep does (`stepEvents` adds 1 to `event.startedAge` each minute while `asleep`). See [Events](#events).

## Care mistakes and death

A **care mistake** is a need left unmet for a grace period. It is counted once per continuous stretch: the `flagged` flag stays set until the condition clears.

| Need | Condition | Grace |
|---|---|---|
| charge | Charge at 0 | 15 min |
| sync | Sync at 0 | 15 min |
| heat | Heat at 100 | 15 min |
| lights | Asleep with lights on | 60 min |

Each mistake adds 1 to `careMistakes` and removes 2 stability. A netling dies when any of these fires, checked in this order:

1. **integrity collapse**: Integrity at 0 for 120 consecutive minutes.
2. **neglect**: 10 care mistakes (`maxMistakes`).
3. **end of life cycle**: age reaches 7 days (`lifespanMin`).

Death creates the `fragment` (see [Lineage](#lineage-fragments-traits-quirks)) and sets `stage = 'dead'`. Root Access can undo the first two (see below).

## Care actions

`act(state, action, now, rng, opts)` returns `{ ok, msg, sfx }`. It calls `blockReason` first. Global blocks: dead, hibernating, still compiling, rebooting (everything except `lights` is refused), and resting for `corp`, `scav`, `play` and `cool`.

| Action | Requires | Effect |
|---|---|---|
| `corp` (CORP PKT) | Charge under 95 | +30 Charge (x1.25 with Licensed), +2 Heat, allegiance +1, starts digestion. Favorite packet +8 Sync. Chrome form: +5 Sync |
| `scav` (SCAV DATA) | Charge under 95 | +25 Charge, +2 Heat, allegiance -1, starts digestion. Favorite +8 Sync. Chrome form: -5 Sync. 12% infection chance |
| `play` | Charge 10+ (checked before the mini-game) | Sync +25 on win, +8 on loss. Charge -6, Heat +12. Records win/loss. Wins can drop items (25%) |
| `hide` | Open trace | Ends it. Charge -10, Heat +10, allegiance -1. 30% drop from the hide table |
| `comply` | Open trace | Ends it. Integrity -5, Sync -10, allegiance +1. 30% drop from the comply table |
| `defend` | Open intrusion | Result of the DEFEND mini-game. Win: stability +1. Loss: virus and -10 Integrity |
| `patch` | Virus present | Cures it. Integrity +10. Stability +1 if within 30 minutes of infection, else -1 |
| `cool` | Heat 30+ | Heat -35, Integrity +4 |
| `purge` | Cache above 0, or an overflow event | Clears cache. Stability +0.5, Integrity +4. Cancels an overflow |
| `use` | Item in slot, item's own conditions | See [Items](#items) |
| `discard` | Item in slot | Removes it |
| `nap` | Not asleep, no netrun, cooldown over | Starts a nap; pressing again wakes it |
| `lights` | always allowed except dead/hibernating | Toggles `lightsOn` |

Play modifiers: Glitch form replaces the Sync gain with a random 10 to 40. Volatile trait multiplies gain by 1.5. A Signal booster doubles a win and is consumed. Packet Feast also adds Charge (+10 on a win, +3 on a loss, before the -6). Heat above 70 after a play costs 0.5 stability.

The UI runs the mini-game first, then calls `act('play', { game, won })`. The result can be refused if the netling fell asleep or hit 0 charge while the game ran.

## Events

At most one timed event is open at a time (`state.event`). While one is open, no new event starts. Rolls only happen while awake and not napping. Each minute the chain below is tried in order and stops at the first success.

| Event | Chance per hour | Window | If ignored | Answer |
|---|---|---|---|---|
| **Corp trace** | 8% (never for Untraceable) | 120 min | Integrity -15, allegiance +1 | HIDE or COMPLY, or a Corp voucher |
| **Intrusion** | 4% (not while infected) | 60 min | Virus, Integrity -10 | DEFEND (random mini-game) |
| **Memory overflow** | 2% + 2% per cache file | 45 min | Integrity -15, cache set to 4, reboot for 20 min | PURGE |
| **Power surge** | 3% | instant | Heat +25, Charge +10 | none |
| **Visitor** | 3% (no event, no netrun, not rebooting) | 5 to 10 min | none | none |

Details:

- A **Corp voucher** used with no trace open sets `traceSkip`; the next trace roll is cancelled with a log line instead of opening.
- An active **Antivirus shield** turns an intrusion roll into a log line ("bounced off").
- **Reboot** (`rebootUntilAge`) refuses every action except `lights` for 20 minutes.
- **Sleep holds timers**: while asleep, an open event's `startedAge` is bumped every minute so nothing lands overnight. Napping does not hold them. An intrusion's timer also holds while its DEFEND mini-game is running (`event.defending`, set by the UI, cleared when the game ends and never accepted from storage), so a win cannot arrive after the virus has already landed.
- **Hibernation** is blocked while any event is open.

## Visitors

A stray netling appears for 5 to 10 minutes (`visitMinMin`, `visitMaxMin`). Its form is uniformly random over all eight bodies, its palette never matches the host's, and 75% of the time it wears a random findable accessory. Each minute it adds `visitSync / len` Sync and `visitHeat / len` Heat (total +15 and +10). It leaves early if the netling rests, jacks in or reboots. On leaving it may drop an accessory (1%, chosen by the UI so it is always new) or, failing that, an item (10%, from the visit table).

## Items

Six slots (`INVENTORY_SLOTS`). Extra finds are refused with "inventory is full".

| Id | Name | Effect | Needs awake |
|---|---|---|---|
| `coolant` | Coolant cell | Heat -50 | no |
| `antivirus` | Antivirus patch | Cures a virus, shields for 6 hours (360 min) | no |
| `voucher` | Corp voucher | Charge to 100, allegiance +1, cancels the open trace or the next one | no |
| `blackice` | Black ICE shard | Sync +40, Heat +20, allegiance -1, stability -1, 25% virus | yes |
| `booster` | Signal booster | Next mini-game win counts double (wins recorded as 2) | yes |
| `memory` | Memory shard | Rerolls one of palette, pitch, idle, favorite packet | no |
| `repair` | Repair kit | Integrity +40 (refused at 100) | no |
| `overclock` | Overclock chip | Cuts 60 min off the netrun cooldown (refused if none left or at the 2 hour floor) | no |

Drop tables (weights):

| Source | Table |
|---|---|
| Mini-game win (25%) | coolant 3, antivirus 2, booster 2, blackice 2, repair 2, memory 1, overclock 1 |
| Hide (30%) | blackice 2, memory 1, coolant 1, overclock 1 |
| Comply (30%) | voucher 3, antivirus 1, repair 1 |
| Visitor gift (10%) | coolant 2, booster 2, repair 2, memory 1, overclock 1 |

Netrun loot uses per-region tables, see [NETRUN.md](NETRUN.md).

**Keepsakes.** When a netling of an adult form dies, its fragment carries one item that starts in the next generation's inventory: Chrome gives a voucher, Firewall an antivirus patch, Daemon a coolant cell, Glitch a Black ICE shard, Ghost a memory shard.

## Evolution and the hidden axes

Two hidden numbers, `axes.allegiance` and `axes.stability`, are nudged by almost everything the player does. They decide the adult form. Neither is shown in the UI.

**Allegiance** (positive = corp, negative = indie):

| Effect | Source |
|---|---|
| +1 | Corp packet, COMPLY, ignored trace, Corp voucher, netrun checkpoint comply or voucher |
| -1 | Scavenged packet, HIDE, Black ICE shard, netrun checkpoint hide |
| -0.5 | Each item bought at a netrun market |
| varies | Netrun anomalies (see [NETRUN.md](NETRUN.md)) |

**Stability** (positive = orderly, negative = chaotic):

| Effect | Source |
|---|---|
| +0.1/hr | Awake, no alert active |
| +1 | Fast PATCH (within 30 min), repelled intrusion |
| +0.5 | PURGE |
| -1/hr | Heat at 85+ |
| -2 | Each care mistake |
| -0.5 | A mini-game that leaves Heat above 70 |
| -1 | Slow PATCH, Black ICE shard, a netrun disconnect |

**Baby to teen** at 1440 minutes: Kernel if `careMistakes <= 2`, otherwise Stub.

**Teen to adult** at 4320 minutes: `leaningForm()`:

1. **Ghost** if `|allegiance| < 2`, `stability >= 0`, `careMistakes <= 1`, at least 4 wins in each of the four games, and at least 22 wins in total (a boosted win counts as 2).
2. Otherwise, if `|allegiance| >= |stability|`: Chrome when allegiance is 0 or more, Firewall when negative.
3. Otherwise: Daemon when stability is 0 or more, Glitch when negative.

Ties go to allegiance, and a perfectly neutral netling that misses the Ghost conditions becomes Chrome.

Adult perks (`FORM_MODS`): Chrome loves corp packets and sulks at scavenged data; Firewall -30% virus chance; Daemon Charge drains 20% slower; Glitch play is a gamble (+10 to +40 Sync); Ghost all drains 15% slower. Run abilities are in [NETRUN.md](NETRUN.md).

**Dying before adulthood.** `flatline()` uses the current form if it is an adult form, else `leaningForm()` at the moment of death. The record marks it `realized: false` and the UI calls it an echo or "(unrealized)".

## Lineage: fragments, traits, quirks

On death a `fragment` is stored: `{ form, trait, quirk, keepsake, rootUsed }`.

| Adult form | Trait passed on | Trait effect |
|---|---|---|
| Chrome | Licensed | Corp packets restore +25% Charge |
| Firewall | Hardened | -50% virus chance |
| Daemon | Persistent | Drains 30% slower while resting |
| Glitch | Volatile | Play rewards x1.5, Integrity drains an extra 1/hr |
| Ghost | Untraceable | Immune to corp traces |

**Quirks** (`rollQuirk`): `palette` (0 to 4, plus 5 "origin" only with Root Access), `pitch` (440 to 880 Hz), `idle` (bounce, sway, hover), `favPacket` (corp or scav), `sleepOffset` (-2 to +2). A new generation rolls a fresh quirk and then overwrites exactly one random key (from all five) with the parent's value. `createScript` records which one in `inheritedQuirk`.

## Root Access (NL-0)

Unlocked by finding all 22 codex fragments, and then kept for good: the moment the codex completes, `progress.rootEarned` is recorded (`drainCodexInbox`), and `rootUnlocked()` in `netrun/codex.js` is true if that flag is set or every fragment is found. A fragment added to the game later therefore cannot take Root Access back. Saves from before the flag existed get it backfilled at load if the codex is complete or the current netling already has Root Access, is cooling, or a lineage record shows a rescue.

- New scripts compile with `rootAccess = true` once it is unlocked. The current netling also gets it the moment the codex completes (`drainCodexInbox`).
- `rootRescue()`: the first time a netling would die of integrity collapse or neglect, it does not. Integrity, Charge and Sync are raised to at least 25, the virus is cleared, the zero-integrity counter resets, and care mistakes are capped at 9. Sets `rootUsed`. Old age is never rescued.
- The next generation after a rescue has `rootCooling = true`: no protection, and NL-0's origin palette can still roll.
- Dying without spending it carries straight into the next generation.

## Hibernation

- `hibernate()` first ticks to now, then refuses if: a netrun is open, an event is open, it is rebooting, or the last wake was under 3 days ago (`hibernateCooldownMin`).
- While frozen, nothing drains, ages or fires.
- `wake()` is refused until 24 hours (`hibernateMinMin`) have passed. It resets `lastTick`, so the netling resumes exactly as it was.
- The UI additionally waits for any running mini-game or netrun to finish.

## Alerts

`alertReason(state)` returns the single most urgent reason to call the player back, in priority order: trace, intrusion, overflow, virus, Charge under 20, Sync under 20, Heat over 80, asleep with lights on, cache of 3 or more. It drives the alert chirp and background notifications. `needsAttention()` (the blinking "!" icon) is looser: it also fires at 2 cache files and for any open event.

## Rule interactions worth knowing

These follow from the code and are easy to get wrong when changing balance.

- Resting suppresses new infections, cache files and new events, but not existing damage: a virus keeps eating Integrity at -12/hr through the night.
- The 15-minute care mistake grace is in **simulated** minutes. In test mode at 168x that is about 5 real seconds.
- Charge from a corp packet above 95 is refused, so meals cannot be stacked to skip drain.
- A boosted win adds 2 to `games[id].won`, which makes the Ghost requirement slightly easier than "22 wins".
- Tie handling in `leaningForm` favors Chrome over everything else except Ghost.
- COOL is refused under 30 Heat, PATCH is refused with no virus, PURGE is refused with an empty cache. A refused action costs nothing and does not count toward unlock counters.
- The shield from an Antivirus patch is stored as an age (`shieldUntilAge`), so it survives hibernation correctly.
