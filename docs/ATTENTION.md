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
| Daily check-in | A seven-day reward ladder for opening the app once after each morning it wakes; rewards wait in a reward box |
| Contracts | A netrun job for one region, posted while the uplink is ready and the app is open; every route through that run can meet it. Count is `progress.contractsDone` |

## Unlocks

| Slot | Cosmetic | Unlocked by |
|---|---|---|
| sound | Purr | 25 requests answered |
| effect | Aurora | 24 hours in flow, across lives |
| effect | Heatwave | 40 hours overclocked while awake, across lives (its hot-side twin) |
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

An attentive player earns Purr in about three lives and Aurora in about two (median 1.15 lives); casual players rarely reach flow. Heatwave asks 40 hours, not 24, because a player who runs hot spends more of each life overclocked than a cool one spends in flow (flow needs three good hours first): an attentive player who runs hot (`daredevil`) earns it at a median of 1.1 lives, `steer-glitch` (who stays at 65 to 72 Heat) at 2. Casual and worker players overclock 2 to 4 hours a life by accident, so it comes from choosing to run hot. Both overclocked and in flow, visitors are 1.25x likelier. Hourly check-ins catch about one visit a life.

## Daily check-in

Rules in `src/checkin.js` (`CHECKIN`), the UI in `src/ui/rewards.js`.

- **When.** The first time the app is open after the netling wakes for a new day (`s.wokeAt`, set when the night's sleep ends; a nap or hibernation does not count). Several mornings away count as one. The very first check-in is due at once (after the tutorial). A new netling has to wake once before the next one. Moving the device clock forward also ages the netling, so it is no free farm.
- **The ladder never resets.** Each check-in steps one day; a missed day only pauses it; after day 7 it starts over.

  | Day | Reward |
  |---|---|
  | 1 | 10 scrip |
  | 2 | A cheapest-tier item (coolant, antivirus, repair, booster, memory) |
  | 3 | 25 scrip |
  | 4 | A middle-tier item (voucher, black ICE; never a Segfault) |
  | 5 | An unowned common accessory from the general pool (Cap, Scarf, Headphones, Flower, Bow), else 25 scrip |
  | 6 | An Bypass chip |
  | 7 | An unowned rare or very rare accessory from the general pool (Shades, Visor, Crown, Halo, Spark), else 40 scrip |

  The general pool is the accessories found anywhere: regional drops and earned items stay the reward for exploring and for events.
- **The reward box.** Rewards wait in a box kept per device (`netling.rewardBox`, up to 30; a check-in waits while it is full), which moves with a transfer code like the rest of the collection. The BOX button beside the scrip count opens it with the ladder. TAKE moves scrip to the netling up to the cap (the rest stays in the box), an item when the inventory has room, an accessory to the collection at any time. Nothing is taken during a netrun or without a living netling, except accessories.
- **Where it shows.** A line in the netling's log, the box count in yellow, and a notification with ALERTS on. Never the status line, which carries notices that matter more.
- **Not measured.** The balance bots do not check in, so the baselines do not include it.

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

- **Rebalance the check-in accessories** once more general-pool accessories exist (see [Daily check-in](#daily-check-in)): with today's ten, the accessory days fall back to scrip after about ten weeks of check-ins.
