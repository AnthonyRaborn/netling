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

## Unlocks

| Slot | Cosmetic | Unlocked by |
|---|---|---|
| sound | Purr | 25 requests answered |
| effect | Aurora | 24 hours in flow, across lives |
| tint | Guest pink | 5 visitors greeted |
| crest | Speech mark | every chatter line of one group heard |

## Measured

Balance bots, 1000 lives each. They answer a request or greet a visitor only if it is there at a check-in, and see a chatter line only then, so real players who keep the app open will see more.

| Archetype | Requests answered | Visitors greeted | Hours in flow | Chatter lines seen |
|---|---|---|---|---|
| attentive | 9.5 | 1.0 | 19.5 | 3.6 |
| casual | 2.1 | 0.3 | 0.1 | 1.2 |
| worker | 0.6 | 0.2 | 0.0 | 0.8 |
| neglectful | 0.0 | 0.0 | 0.0 | 0.1 |

An attentive player earns Purr in about three lives and Aurora in about two; casual players rarely reach flow. Hourly check-ins catch about one visit a life.

## Limits

Notifications are local: they fire while the app is open or in a background tab. A closed or suspended app gets nothing, because a static site has no push server. Reliable notifications with the app closed need a native wrapper ([PLATFORMS.md](PLATFORMS.md)).

## Open ideas

- **Netrun contracts.** A time window can clash with the uplink cooldown. One way round it: post a contract only when the uplink is ready and keep it open until the next jack-in or 6 hours, whichever comes first.
- **Daily check-in reward.** Needs reward ideas; any version should pay for showing up without taking anything away for a missed day.
