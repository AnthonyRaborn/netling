# Attention rewards

Opt-in extras for players who check in often. The rules and numbers are in [SIMULATION.md](SIMULATION.md#attention-rewards); this file holds the principles, the unlocks and what is open. Spoiler-heavy, like the rest of `docs/`.

## Principles

1. **Attention earns something extra; missing it costs nothing.** No faults, no lost streaks, no stat penalties for an unanswered request or an unseen visitor. The penalty for inattention stays in drain and events ([BALANCE.md](BALANCE.md)).
2. **Rewards favour cosmetics and lore.**
3. **Requests are games and COOL only**, never food, so answering cannot steer allegiance.
4. **Notifications share the ALERTS switch.** A request or visitor arriving in the background notifies once. Chatter and flow never notify.
5. **Nothing flashes.** Flow is a slow glow, a still glow under reduced motion.

## What exists

| Feature | Behaviour |
|---|---|
| Requests | The netling asks for one game or COOL; the count is `progress.requestsMet` |
| Greet a visitor | One GREET per visit; count is `progress.visitorsGreeted` |
| Flow | A glow after 3 hours in good shape; time spent counts across lives (`flowMin`) |
| Chatter | 50 lines; heard lines are kept in the Archive's CHATTER tab (`progress.chatter`) |
| Contracts | A netrun job for one region, posted while the uplink is ready and the app is open; every route through that run can meet it. Count is `progress.contractsDone` |

## Unlocks

| Slot | Cosmetic | Unlocked by |
|---|---|---|
| sound | Purr | 25 requests answered |
| effect | Aurora | 24 hours in flow, across lives |
| tint | Guest pink | 5 visitors greeted |
| crest | Speech mark | every chatter line of one group heard |
| crest | Seal | 10 contracts completed, across lives |

## Measured

Balance bots, 1000 lives each. They answer a request or greet a visitor only if it is there at a check-in, and see a chatter line only then, so real players who keep the app open will see more.

| Archetype | Requests answered | Visitors greeted | Hours in flow | Chatter lines seen |
|---|---|---|---|---|
| attentive | 9.5 | 1.0 | 19.5 | 3.6 |
| casual | 2.1 | 0.3 | 0.1 | 1.2 |
| worker | 0.6 | 0.2 | 0.0 | 0.8 |
| neglectful | 0.0 | 0.0 | 0.0 | 0.1 |

An attentive player earns Purr in about three lives and Aurora in about two; casual players rarely reach flow. Hourly check-ins catch about one visit a life.

## Contracts

Rules and numbers are in [NETRUN.md](NETRUN.md#contracts).

- **When.** Only while the app is open (the UI posts them; the sim never does), after the tutorial, with the uplink ready and the netling awake, not rebooting and not on a run: 50% an hour. It waits 6 hours, or until a jack-in into its region takes it along. A jack-in elsewhere leaves it posted, so the uplink cooldown never makes one impossible to take.
- **Jobs.** Reach the region's exit; reach it without losing an ICE fight; get past 2 or 3 ICE (a win, or a Ghost or Glitch slipping by); crack 2 or 3 caches; buy something at a market; bring back a codex fragment.
- **Solvable on every route.** When the run starts, the map is fixed so that every route from entry to exit meets the job without perfect play: an ICE job gets one ICE more than it asks for on every route, so one lost fight doesn't sink it; a cache job gets enough caches on every route; a market job gets a market in the first half of every route, each offering one of the cheapest items. A fragment job is only posted where an unread fragment waits and the netling's memory has room, and it makes the exit's fragment certain. A market job needs 15 scrip when posted. Winning ICE fights is still up to the player.
- **Pay.** 15 to 25 scrip by job, and a 25% chance of one cheapest-tier item, named when posted, paid into the run's loot on jack-out (so a disconnect or abort loses it with the rest). A missed job pays nothing and costs nothing.
- **Not measured.** The balance bots never take contracts (they are posted by the UI), so the baselines did not move and there is no measured rate yet.

## Limits

Notifications are local: they fire while the app is open or in a background tab. A closed or suspended app gets nothing, because a static site has no push server. Reliable notifications with the app closed need a native wrapper ([PLATFORMS.md](PLATFORMS.md)).

## Open ideas

- **Daily check-in reward.** Needs reward ideas; any version should pay for showing up without taking anything away for a missed day.
