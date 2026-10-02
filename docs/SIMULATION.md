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
8. [Visitors](#visitors), [Attention rewards](#attention-rewards) and [Overclocked](#overclocked)
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
- The step decides sleep by the hour in the netling's own **zone** (`s.zone`, the device's UTC offset in minutes as `getTimezoneOffset` gives it). The zone is set at compile and read again from the device only when the netling wakes; if it is still night in the new zone, it keeps sleeping. So travel, daylight saving or importing onto a device elsewhere takes effect the next morning, and a day never changes zone halfway. Tests pin `TZ=UTC` and set `s.zone` to act out a move.
- The UI calls `advance()` (`ui/life.js`) once per second, on tab focus, and before every action, so the simulation is always caught up when the player acts.
- Test mode replaces "now" with a scaled clock (see [DATA_AND_SAVES.md](DATA_AND_SAVES.md#test-mode)). The simulation does not know.

### Order of work inside one step

`step()` does this, in order:

1. `ageMin++`. Stage `script` only waits for `bootMinutes` (3) and becomes `baby`. Nothing else happens while compiling.
2. Evolution check (baby to teen at `life.teenAt`, teen to adult at `life.adultAt`: 1020 and 3060 minutes for a netling compiled now; see [Life length](#life-length)).
3. Sleep and nap transitions for this minute.
4. Drain Charge, Sync, and move Heat.
5. Cache file roll (awake and digesting only).
6. Virus roll, or `virusMin++` if already infected.
7. Integrity change from all current damage sources or regeneration.
8. Stability drift (overclocked or in flow; plain uptime adds nothing; see [the axes](#evolution-and-the-hidden-axes)).
9. `stepVisit`, then `stepEvents`, then the attention rewards: `stepRequest`, `stepFlow`, `stepOverclock` (logs crossing the overclock line), `stepChatter` (see [Attention rewards](#attention-rewards)).
10. Care mistake checks (Charge, Sync, Heat, Lights).
11. Death checks, in this priority: integrity collapse, neglect, end of life.

## State shape

Created by `createScript()`. The full field list with meanings is in [DATA_AND_SAVES.md](DATA_AND_SAVES.md#the-netling-save). The fields that carry rules:

| Field | Meaning |
|---|---|
| `stage` | `script` (compiling), `baby`, `teen`, `adult`, `mainframe`, `dead` |
| `form` | Current body. `bitling` for babies, `kernel`/`stub`/`shell` for teens, one of five adult forms |
| `life` | `{ teenAt, adultAt, lifespan }` in minutes, fixed when it compiles (see [Life length](#life-length)) |
| `newForms` | Adult forms the player had never raised when it compiled; they win ties a little more often |
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
| Charge | -15.4/hr, scaled by the drain curve | At 0: 15 minutes makes a care mistake; also -6 Integrity/hr |
| Sync | -13.2/hr, scaled by the drain curve | At 0: 15 minutes makes a care mistake |
| Integrity | see below | At 0 for 120 minutes: death |
| Heat | +3/hr | At 65+: overclocked (see [Overclocked](#overclocked)). At 85+ also: -8 Integrity/hr and -1 stability/hr; at 100: 15 minutes makes a care mistake |

**Drain curve** (`drainCurve`): Charge and Sync drain faster the fuller they are. Each minute the base rate is scaled by `empty + (full - empty) * value / 100`, with `empty` 0.39 and `full` 2, so a stat drains at 0.39x near 0, 1.2x at half and 2x when full. Awake, that is about 31, 18 and 6 Charge an hour (26, 16 and 5 Sync). Topping up often means more to do between check-ins; a stat left low eases off, so a long gap still costs faults without being fatal. Casual players take about 4.5 faults a life and workers about 5.4; attentive players act about 54 times a day (see [BALANCE.md](BALANCE.md)).

Drain multipliers stack multiplicatively on the base rate (and on the curve):

| Situation | Multiplier |
|---|---|
| Asleep, lights off | 0.33 (`sleepDarkDrainMult`) |
| Asleep, lights on | 0.5 (`sleepDrainMult`) |
| Napping | 0.35 (`napDrainMult`) |
| Resting with trait Persistent | x0.7 extra at strength 1 (see [Trait strength](#trait-strength-balance-pass-3)) |
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
| Trait Volatile | an extra -0.75 at strength 1 always applies |

Care actions add flat Integrity on top: COOL +4, PURGE that clears something +4, PATCH +10, Repair kit +40.

The `integrityRegenPerHour` comment in `sim.js` says a full recovery takes "about 16 hours". Not measured. See [KNOWN_ISSUES.md](KNOWN_ISSUES.md#open-questions).

### Cache and digestion

- Eating sets `sinceFed = 0`. For the next 240 minutes ("digesting"), while awake and with fewer than 4 files, each minute has a 1/150 chance of writing a corrupted cache file.
- Resting stops cache writes and virus infections but the digestion timer still runs.
- Cache files raise virus and overflow chances (below). PURGE clears all of them.

### Viruses

- Infection chance per hour: `0.02 + 0.03 * cache`. It is multiplied by 0.5 for trait Hardened at strength 1 and by 0.7 for the Firewall form (they stack: x0.35).
- Never while resting, while shielded (Antivirus patch), or while already infected.
- Other infection routes: a scavenged packet (12%, or 6% with Hardened at strength 1, times the Firewall multiplier), Black ICE shard (25%), a landed intrusion (certain).
- `virusMin` counts minutes since infection. PATCHing within 30 minutes gives +1 stability, later gives -1.

## Rest: sleep, lights, naps

**Sleep.** A netling sleeps from `22 + sleepOffset` to `7 + sleepOffset` in its own zone (see above). The readout shows its bedtime converted to the device's clock (`bedtimeOnDevice`), which differs from `bedtimeHour` only between a zone change and the next wake. `sleepOffset` is a quirk from -2 to +2, so bedtime is 20:00 to 00:00 and wake time 05:00 to 09:00. It falls asleep and wakes on its own. On waking, `lightsOn` is reset to true.

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

Each mistake adds 1 to `careMistakes` and removes 1 stability (`faultStability`). A Segfault (see [Items](#items)) adds 2 of them at once, with the same stability cost. A netling dies when any of these fires, checked in this order:

1. **integrity collapse**: Integrity at 0 for 120 consecutive minutes.
2. **neglect**: 10 care mistakes (`maxMistakes`).
3. **end of life cycle**: age reaches `life.lifespan` (5 days, 7200 minutes, for a netling compiled now).

Death creates the `fragment` (see [Lineage](#lineage-fragments-traits-quirks)) and sets `stage = 'dead'`. Root Access can undo the first two (see below).

## Care actions

`act(state, action, now, rng, opts)` returns `{ ok, msg, sfx }`. It calls `blockReason` first. Global blocks: dead, hibernating, still compiling, rebooting (everything except `lights` is refused), and resting for `corp`, `scav`, `play` and `cool`.

| Action | Requires | Effect |
|---|---|---|
| `corp` (CORP PKT) | Charge under 95 | +30 Charge (x1.25 with Licensed at strength 1), +2 Heat, allegiance +0.75, starts digestion. Favorite packet +8 Sync. Chrome form: +5 Sync |
| `scav` (SCAV DATA) | Charge under 95 | +25 Charge, +2 Heat, allegiance -0.75, starts digestion. Favorite +8 Sync. Chrome form: -5 Sync. 12% infection chance |
| `play` | Charge 10+ (checked before the mini-game) | Sync +25 on win, +8 on loss (overclocked: -6 Sync and -4 Integrity instead). Charge -6, Heat +12. Records win/loss. Wins can drop items (25%, 37.5% overclocked) |
| `hide` | Open trace | Ends it. Charge -10, Heat +10, allegiance -1. 30% drop from the hide table |
| `comply` | Open trace | Ends it. Integrity -5, Sync -10, allegiance +1. 30% drop from the comply table |
| `defend` | Open intrusion | Result of the DEFEND mini-game. Win: stability +1. Loss: virus and -10 Integrity |
| `patch` | Virus present | Cures it. Integrity +10. Stability +1 if within 30 minutes of infection, else -1 |
| `cool` | Heat 30+ | Heat -35, Integrity +4 |
| `purge` | Cache above 0, or an overflow event | Clears cache. Stability +0.5, Integrity +4. Cancels an overflow |
| `use` | Item in slot, item's own conditions | See [Items](#items) |
| `discard` | Item in slot | SCRAP: removes it for a quarter of its scrip price (see [NETRUN.md](NETRUN.md#corpo-scrip)) |
| `nap` | Not asleep, no netrun, cooldown over | Starts a nap; pressing again wakes it |
| `lights` | always allowed except dead/hibernating | Toggles `lightsOn` |

Play modifiers: Glitch form replaces the Sync gain with a random 10 to 40. Volatile trait multiplies gain by 1.5 at strength 1. A Signal booster doubles a win and is consumed. Packet Feast also adds Charge (+10 on a win, +3 on a loss, before the -6). Heat above 70 after a play costs 0.5 stability. Whether it was overclocked is read before the play's own +12 Heat; an overclocked loss replaces every other Sync modifier with -6.

The UI runs the mini-game first, then calls `act('play', { game, won })`. The result can be refused if the netling fell asleep or hit 0 charge while the game ran.

## Events

At most one timed event is open at a time (`state.event`). While one is open, no new event starts. Rolls only happen while awake and not napping. Each minute the chain below is tried in order and stops at the first success. While overclocked, the trace, intrusion, overflow and surge chances are 1.25x (`overclockEventMult`); in flow they are 0.75x (`flowEventMult`, calm). The visitor's chance goes up in both (1.25x, `overclockVisitMult` and `flowVisitMult`), never down. In flow a visitor adds no Heat, so it never ends flow.

| Event | Chance per hour | Window | If ignored | Answer |
|---|---|---|---|---|
| **Corp trace** | 8% (60% less for Untraceable at strength 1) | 120 min | Integrity -15, allegiance +1 | HIDE or COMPLY, or a Corp voucher |
| **Intrusion** | 4% (not while infected) | 60 min | Virus, Integrity -10 | DEFEND (random mini-game) |
| **Memory overflow** | 2% + 2% per cache file | 45 min | Integrity -15, cache set to 4, reboot for 20 min | PURGE |
| **Power surge** | 3% | instant | Heat +25, Charge +10 | none |
| **Visitor** | 6%, 7.5% while overclocked or in flow (no event, no netrun, not rebooting) | 10 to 20 min | none | GREET (optional) |

Details:

- A **Corp voucher** used with no trace open sets `traceSkip`; the next trace roll is cancelled with a log line instead of opening.
- An active **Antivirus shield** turns an intrusion roll into a log line ("bounced off").
- **Reboot** (`rebootUntilAge`) refuses every action except `lights` for 20 minutes.
- **Sleep holds timers**: while asleep, an open event's `startedAge` is bumped every minute so nothing lands overnight. Napping does not hold them. An intrusion's timer also holds while its DEFEND mini-game is running (`event.defending`, set by the UI, cleared when the game ends and never accepted from storage), so a win cannot arrive after the virus has already landed.
- **Hibernation** is blocked while any event is open.

## Visitors

A stray netling appears for 10 to 20 minutes (`visitMinMin`, `visitMaxMin`), at 6% an awake hour (`visitChancePerHour`; it was 3% and 5 to 10 minutes before the attention rewards). Its form is uniformly random over every body (the mainframe forms only to a line with Root Access, since until then they are corrupted records), its palette never matches the host's, and 75% of the time it wears a random findable accessory, half of those with a second from another wear slot (`visitWearsAccessoryChance`, `visitSecondAccessoryChance`). Each minute it adds `visitSync / len` Sync and `visitHeat / len` Heat (total +15 and +10); in flow it adds no Heat, so a visit never ends flow. It leaves early if the netling rests, jacks in or reboots. On leaving it may drop an accessory (1%, or 5% if it was greeted: `visitGreetedAccessoryChance`; chosen by the UI so it is always new) or, failing that, an item (10%, from the visit table).

**GREET** (`act(s, 'greet')`): once per visit (`visit.greeted`). It sets a visitor chatter line on screen and raises the accessory chance above; nothing else. Refused with no visitor, or once already greeted.

## Attention rewards

Opt-in extras for a player who is around (principles and unlocks in [ATTENTION.md](ATTENTION.md)). Missing any of them costs nothing: no fault, no stat change.

**Requests** (`s.request`, `stepRequest`). Only while idle: awake, not napping, no netrun, not rebooting, no open event, and Charge at least 20 (`requestMinCharge`). Chance 0.25 an hour (`requestChancePerHour`). When Heat is 30 or more (`requestCoolHeat`), a quarter of requests ask for COOL; the rest name one game at random. The request waits 45 minutes (`requestWindowMin`) and then ends with `> it stopped asking.`; sleep, a nap, a netrun or a crash end it quietly. PLAY of the named game (win or lose) or COOL for a COOL request answers it: the action's result carries `requestMet: true` and the log adds "just what it asked for.". DEFEND and netrun ICE never answer a request. There are no food requests, so answering never moves allegiance.

**Flow** (`s.flowMin`, `stepFlow`, `inFlow`). Each minute awake, not napping, with no netrun, event, virus, 3+ cache files or reboot, and Charge and Sync 50 or more (`flowMinStat`), Integrity 80 or more (`flowMinIntegrity`) and Heat under 60 (`flowMaxHeat`), `flowMin` goes up by 1; anything else resets it to 0. At 180 minutes (`flowAfterMin`) the netling is in flow: the renderer draws a slow glow and the readout says so. Each minute in flow adds to `flowTotalMin` for the life (the Aurora effect counts these across lives). Flow changes no stat, but it builds stability (+0.2/hr, `flowStabilityPerHour`; plain awake time builds none) and makes it calm: traces, intrusions, overflows and surges are 0.75x as likely (`flowEventMult`).

## Overclocked

**Overclocked** (`overclocked()`, `s.hot`): Heat at 65 or more (`overclockHeat`), up to and including the 85+ danger zone, whose harms still apply on top. It is the hot side of a choice whose cool side is flow (Heat under 60, calmer and steadier), so the two never overlap.

| Effect | Value | Where |
|---|---|---|
| Mini-games run slower (DEFEND too) | 0.85x speed (`overclockGameSpeed`): the whole game clock, so falling things, sweeps and timers | `gameSpeed()`, `GameSession` `speed` |
| A won game drops items more often | 1.5x `winDropChance` (`overclockDropMult`) | `act('play')` |
| A lost game costs | -6 Sync (`overclockLoseSync`) instead of +8, and -4 Integrity (`overclockLoseIntegrity`) | `act('play')` |
| Events are likelier | 1.25x (`overclockEventMult`) | `stepEvents` |
| It leans unstable | -0.2 stability per awake hour (`overclockStabilityPerHour`), 85+ keeps its own -1/hr instead | `step` |
| Visitors are likelier | 1.25x (`overclockVisitMult`; flow has the same, `flowVisitMult`) | `stepEvents` |
| Awake minutes overclocked are counted | `hotTotalMin`, banked across lives for the Heatwave effect (40 hours) | `stepOverclock`, `ui/style.js` |
| A netrun jacked into overclocked | ICE runs at 0.85x and lost ICE deals 1.5x damage (`overclockIceDamageMult`) all run. Fixed at jack-in (`run.hot`): Heat gained on the way never switches it on | `startRun`, `resolveIce`, `iceSpeed()` |

Crossing the line either way is logged once (`> !! overclocked. ...` and `> clock speed back to spec.`). The HUD's HEAT label reads OC, heat wisps rise off the sprite, and the netrun map shows OC by the region name.

**Morning** (`s.wokeAt`): set to the minute the night's sleep ends (not a nap). The daily check-in (`checkin.js`, run by the UI) keys off it.

**Contracts** (`s.contract`) are netrun jobs, posted by the UI through `updateContract` in `netrun/run.js` while the app is open; see [NETRUN.md](NETRUN.md#contracts). `step` never posts or expires one.

**Chatter** (`s.chatter`, `stepChatter`, `src/chatter.js`). While idle, 0.15 an hour (`chatterChancePerHour`), it picks a line from its pool: the lines of its current body, plus lineage lines whose condition holds (its trait, a history, NL-0 watching). A line stays for 20 minutes (`chatterShowMin`) or until it rests. GREET shows a visitor line instead. The UI records a line as heard (`progress.chatter`) once it is on screen with the page visible.

## Items

Six slots (`INVENTORY_SLOTS`). A find that meets a full inventory is scrapped for a quarter of its scrip price (`grantItem`), up to the scrip cap of 100.

| Id | Name | Effect | Needs awake |
|---|---|---|---|
| `coolant` | Coolant cell | Heat -50 | no |
| `antivirus` | Antivirus patch | Cures a virus, shields for 6 hours (360 min) | no |
| `voucher` | Corp voucher | Charge to 100, allegiance +1, cancels the open trace or the next one | no |
| `blackice` | Black ICE shard | Sync +40, Heat +20, allegiance -1, stability -1, 25% virus | yes |
| `booster` | Signal booster | Next mini-game win counts double (wins recorded as 2) | yes |
| `memory` | Memory shard | Rerolls one of palette, pitch, idle, favorite packet | no |
| `repair` | Repair kit | Integrity +40 (refused at 100) | no |
| `overclock` | Bypass chip | Cuts 60 min off the netrun cooldown (refused if none left or at the 2 hour floor) | no |
| `segfault` | Segfault | 2 care mistakes on purpose (`ITEM_CFG.segfaultFaults`), stability -2 (1 per fault). Can end its life at the limit. The UI asks for a second press | yes |

Drop tables (weights):

| Source | Table |
|---|---|
| Mini-game win (25%) | coolant 3, antivirus 2, booster 2, blackice 2, repair 2, memory 1, overclock 1, segfault 1 |
| Hide (30%) | blackice 2, memory 1, coolant 1, overclock 1, segfault 1 |
| Comply (30%) | voucher 3, antivirus 1, repair 1 |
| Visitor gift (10%) | coolant 2, booster 2, repair 2, memory 1, overclock 1 |

Netrun loot uses per-region tables, see [NETRUN.md](NETRUN.md).

A **Segfault** can also turn up after a DEFEND (won or lost), a contained overflow (PURGE), or a power surge, each with a 10% chance (`ITEM_CFG.eventSegfaultChance`). It exists so a player can steer toward a Stub on purpose: one Segfault plus one other mistake before the teen stage.

**Keepsakes.** When a netling of an adult form dies, its fragment carries one item that starts in the next generation's inventory: Chrome gives a voucher, Firewall an antivirus patch, Daemon a coolant cell, Glitch a Black ICE shard, Ghost a memory shard.

## Evolution and the hidden axes

Two hidden numbers, `axes.allegiance` and `axes.stability`, are nudged by almost everything the player does. They decide the adult form. Neither is shown in the UI.

**Allegiance** (positive = corp, negative = indie):

| Effect | Source |
|---|---|
| +0.75 | Corp packet (`feedAllegiance`) |
| -0.75 | Scavenged packet |
| +1 | COMPLY, ignored trace, Corp voucher, netrun checkpoint comply or voucher |
| -1 | HIDE, Black ICE shard, netrun checkpoint hide |
| -0.5 | Each item bought at a netrun market |
| varies | Netrun anomalies (see [NETRUN.md](NETRUN.md)) |

**Stability** (positive = orderly, negative = chaotic):

| Effect | Source |
|---|---|
| 0 | Plain awake time (`uptimeStabilityPerHour`; it was +0.1/hr, which made careful players Daemon by default) |
| +0.2/hr | Awake in flow, no alert active |
| -0.2/hr | Awake and overclocked (Heat 65 to 84) |
| +1 | Fast PATCH (within 30 min), repelled intrusion |
| +0.5 | PURGE |
| -1/hr | Heat at 85+ |
| -1 | Each care mistake (`faultStability`; it was -2, so Glitch came mostly from neglect) |
| -0.5 | A mini-game that leaves Heat above 70 |
| -1 | Slow PATCH, Black ICE shard, a netrun disconnect |

**Baby to teen** at `life.teenAt` (`teenForm()`):

1. **Stub** if `careMistakes > 2`.
2. **Shell** if it is on Ghost's path: `|allegiance| < 2`, `stability >= 0`, `careMistakes <= 1` (`shellMaxMistakes`), and at least 3 wins in each of the four games (`shellMinWinsEach`). A hint, not a promise: the Shell still needs Ghost's adult conditions.
3. Otherwise **Kernel**.

**Teen to adult** at `life.adultAt`: `leaningForm(s, rng)`:

1. **Ghost** if `|allegiance| < 2`, `stability >= 0`, `careMistakes <= 1`, at least 4 wins in each of the four games (`ghostMinWinsEach`), and at least 29 wins in total (`ghostMinGameWins`; a boosted win counts as 2, which is kept on purpose: boosters are part of the chase).
2. Otherwise the larger axis (in size) decides: allegiance gives Chrome (0 or more) or Firewall (negative); stability gives Daemon (0 or more) or Glitch (negative). `leaningCandidates()` lists the forms in play.
3. **Ties** (`tieBand`, 0.5): if the two axes are within 0.5 of each other in size, both axes' forms are candidates; an axis within 0.5 of zero puts both of its forms in. A perfectly neutral netling that misses Ghost can become any of the four. The pick is random, each candidate weighted 1, or 1.2 (`newFormWeight`) if it is in `newForms`, the adult forms the player had never raised when this netling compiled.

Adult perks (`FORM_MODS`): Chrome loves corp packets and sulks at scavenged data; Firewall -30% virus chance; Daemon Charge drains 20% slower; Glitch play is a gamble (+10 to +40 Sync); Ghost all drains 15% slower. Run abilities are in [NETRUN.md](NETRUN.md).

### Life length

`CFG.lifespanMin`, `teenAtMin` and `adultAtMin` (5 days, 17 hours, 51 hours) are copied into `s.life` when a netling compiles, and the rules read `s.life`, so changing them never shortens a netling that is already alive. Saves from before `s.life` existed get `LEGACY_LIFE` (7 days, 24 hours, 72 hours) from `migrate` and the sanitizer; a stored `life` that is out of order or longer than 7 days is replaced with the same.

**Dying before adulthood.** `flatline()` uses the current form if it is an adult form, else `leaningForm()` at the moment of death. The record marks it `realized: false` and the UI calls it an echo or "(unrealized)".

### Mainframe

A fourth stage beyond adult (`mainframeDue`). An adult recompiles into its line's mainframe form (`MAINFRAME_OF`: Chrome to Plat, Firewall to Airgap, Daemon to Init, Glitch to Panic, Ghost to Whisper) at the first minute all of this holds:

- it is home (not on a run);
- it is at least `lifespan - mainframeBeforeEndMin` old (the start of its last ordinary day, 96 hours in a 5-day life);
- this life it has come back from The Deep `mainframeExits` (3) times, or `mainframeCleanExits` (2) times without losing an ICE fight (`s.deepExits`, `{ all, clean }`, counted at The Deep's exit node; relay jack-outs do not count);
- its line has Root Access (`rootEarnedIn`: `s.rootAccess`, or `s.rootCooling` for the generation resting after a rescue).

It logs "it has another day in it now.", gains `mainframeBonusMin` (a day) of life (`s.lifeBonus`; the life ends at `lifeEnd(s)`), and keeps its line (`lineOf`): the same perk, trait, keepsake and netrun ability, the last with an upgrade ([NETRUN.md](NETRUN.md#mainframe-upgrades)). It passes its trait on at level II or higher (`mainframeTraitLevel`), and its lineage record keeps the line's adult form with `mainframe` naming the body. Its netrun cooldown is the adult's. Only a mainframe can enter the Source.

`CFG.mainframe` (on) switches the whole stage, the Source and everything that belongs to them; off, none of it appears. Tests and the balance tools use it.

## Lineage: fragments, traits, quirks

On death a `fragment` is stored: `{ form, trait, quirk, keepsake, rootUsed, scrip, level, history }` (`fragmentOf`).

| Adult form | Trait passed on | Effect at strength 1 | Cap |
|---|---|---|---|
| Chrome | Licensed | Corp packets restore +25% Charge | 1.5 |
| Firewall | Hardened | -50% virus chance (per hour and from scavenged data) | 1.5 |
| Daemon | Persistent | Drains 30% slower while resting | 1.25 |
| Glitch | Volatile | Play rewards x1.5, Integrity drains an extra 0.75/hr | 1.25 |
| Ghost | Untraceable | Corp traces 60% less often | 1.25 |

### Trait strength (balance pass 3)

Every trait effect is its strength-1 value (`TRAIT_CFG.full`) times the netling's strength in that trait (`traitStrength`), so a stronger trait does more of the same, costs included (Volatile's Integrity drain scales too).

- **The parent's trait** (`trait`) applies at its level's strength: level 1 is 1.0, and each level adds 0.25 (`levelStep`), up to level 3 (`maxLevel`, 1.5).
- **Levels are a streak.** A netling that ends as the same adult form as its parent passes the trait on one level higher (Daemon, Daemon, Daemon gives Persistent III). Ending as any other form starts the new trait at level 1.
- **The grandparent's trait comes back as its history** (`history`) at half strength (`TRAIT_CFG.history`): the fragment stores the dying netling's own inherited trait. When the history is the same trait as the parent's, the two add up.
- **Each trait is capped** (`TRAIT_CFG.cap`, table above), after measuring: Persistent's fewer faults shift adult forms, Volatile's cost hurts casual players, and a stronger Untraceable would be an immunity again. So Persistent III with a Persistent history (1.5 + 0.5) is still 1.25.
- A first-generation netling has neither. Saves from before levels get level 1 and no history.

Measured with 400 to 800 simulated lives per case, against the same parent with the trait switched off: no trait at its cap moves the casual full-life rate by more than about 4 points, or any adult form's share by more than about 8 points. The Untraceable child of a Ghost meets about 2 corp traces a life at strength 1 (1.3 at the cap) instead of 5, so it can still steer its allegiance.

**Quirks** (`rollQuirk`): `palette` (0 to 4, plus 5 "origin" only with Root Access), `pitch` (440 to 880 Hz), `idle` (bounce, sway, hover), `favPacket` (corp or scav), `sleepOffset` (-2 to +2). A new generation rolls a fresh quirk and then overwrites exactly one random key (from all five) with the parent's value. `createScript` records which one in `inheritedQuirk`.

## Root Access (NL-0)

Unlocked by finding the original 22 codex fragments (`ROOT_FRAGMENTS`; the five the Mainframe stage added, `deep-5` and the Source's, do not count), and then kept for good: the moment the codex completes, `progress.rootEarned` is recorded (`drainCodexInbox`), and `rootUnlocked()` in `netrun/codex.js` is true if that flag is set or every fragment is found. A fragment added to the game later therefore cannot take Root Access back. Saves from before the flag existed get it backfilled at load if the codex is complete or the current netling already has Root Access, is cooling, or a lineage record shows a rescue.

- New scripts compile with `rootAccess = true` once it is unlocked. The current netling also gets it the moment the codex completes (`drainCodexInbox`).
- `rootRescue()`: the first time a netling would die of integrity collapse or neglect, it does not. Integrity, Charge and Sync are raised to at least 25, the virus is cleared, the zero-integrity counter resets, and care mistakes are capped at 9. Sets `rootUsed`. Old age is never rescued.
- The next generation after a rescue has `rootCooling = true`: no protection, and NL-0's origin palette can still roll.
- Dying without spending it carries straight into the next generation.
- Root Access in the line is also what opens the Mainframe stage (above).

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
- A boosted win adds 2 to `games[id].won`, which makes the Ghost requirement slightly easier than "29 wins". Kept on purpose.
- Ties within 0.5 are broken at random, weighted toward forms the player has never raised (`newForms`). Repairs of a damaged save (no rng) take the heaviest candidate, then the first.
- COOL is refused under 30 Heat, PATCH is refused with no virus, PURGE is refused with an empty cache. A refused action costs nothing and does not count toward unlock counters.
- The shield from an Antivirus patch is stored as an age (`shieldUntilAge`), so it survives hibernation correctly.
