# Attention rewards plan

Opt-in rewards for players who check in often. Nothing here is implemented yet. Spoiler-heavy, like the rest of `docs/`.

## Principles (from the maintainer, 2026-09-29)

1. **Attention earns something extra; missing it costs nothing.** No faults, no lost streaks, no stat penalties for an unanswered request or an unseen visitor. The penalty for inattention stays where it is: drain and events (see the [drain pass](BALANCE_PLAN.md#drain-pass)).
2. **Rewards favour cosmetics and lore.** Gameplay benefits are allowed where they fit (for example netrun contracts), but are never the main purpose.
3. **Notifications: yes**, for the short windows below.

## Scope

| Idea | Status |
|---|---|
| 1. Requests | Proposed below |
| 2. Greet a visitor | Proposed below |
| 3. Flow state, visual only | Proposed below |
| 4. Daily check-in reward | Parked: the maintainer is thinking about rewards and balance |
| 5. Netrun contracts | Parked: its time window can clash with the uplink cooldown (see [Later](#later)) |
| 6. Chatter logs | Proposed below |

## 1. Requests

The netling sometimes asks for one specific thing. Answer it in time and it is happy; ignore it and it gives up quietly.

- **When**: only awake, not napping, not on a netrun, not rebooting, and with no timed event open. At most one at a time. Proposed chance 0.25 an awake hour (about 3 or 4 a day), `requestChancePerHour`.
- **Window**: 45 minutes (`requestWindowMin`). After that: `> it stopped asking.` and nothing else.
- **Kinds**, each fulfilled by an action the game already has:

  | Kind | Asks for | Offered only when |
  |---|---|---|
  | `game` | One named mini-game (win or lose) | Charge is at least 20 |
  | `cool` | COOL | Heat is 30 or more |
  | `packet` | Its favourite packet (`quirk.favPacket`) | Charge is below 95 (see question Q1) |

- **Reward**: a happy animation and log line, and the count `progress.requestsMet`, which carries across lives and unlocks cosmetics (see [Cosmetic rewards](#cosmetic-rewards)). No stat bonus beyond what the action itself gives.
- **Screen**: a small speech bubble or icon beside the netling naming what it wants, and a line in the log. It is not an alert: no alert sound and no app badge, so it never reads as a need.
- **Sim**: `s.request = { kind, game?, until }` (age in minutes); cleared by the matching `act`, by expiry, by sleep, a nap or a netrun. Pure, like the rest of `sim.js`.

## 2. Greet a visitor

Visitors already drop in and play for 5 to 10 minutes with no response needed. Greeting one becomes an optional extra.

- **The problem**: at 0.03 an awake hour, visits come about every other day, and a check-in every hour catches one about 12% of the time. Greeting would almost never happen.
- **Proposed**: visits at 0.06 an awake hour (about one a day) that last 10 to 20 minutes. This gives everyone a little more free Sync (a visit adds 15), which slightly offsets the drain pass for casual players; it would be measured with the balance tools before shipping.
- **GREET**: one press per visit, shown while a visitor is present. It keeps the visitor for its full stay, raises the accessory-gift chance from 1% to 5% (cosmetic), keeps the item-gift chance as it is (10%), and the visitor may leave a chatter line from the wider net (see 6). Counted in `progress.visitorsGreeted`.
- **Unanswered**: the visit plays out exactly as it does today.

## 3. Flow state (visual only)

A netling that has been kept in good shape for a while looks it.

- **Condition**: awake; Charge and Sync 50 or more; Integrity 80 or more; Heat under 60; no virus, no 3+ cache files and no open alert; for 3 hours in a row (`flowAfterMin`). Any break ends it and the 3 hours start again.
- **Look**: a soft glow or a slow drift of particles around the netling. It never flashes (rule 7); with reduced motion it is a still glow.
- **Reward**: none beyond the look, apart from a cosmetic for time spent in flow (see below).
- **Why it fits the drain pass**: with the drain curve, holding both bars above 50 for 3 hours takes a check-in every hour or two, so flow belongs to attentive players without anything being taken from casual ones.
- **Sim**: `s.flowMin` counts qualifying minutes; flow is `flowMin >= flowAfterMin`.

## 6. Chatter logs

The netling mutters to itself. Lines you catch are kept in the Archive.

- **When**: awake and idle, about 0.15 an hour (`chatterChancePerHour`). A line stays on screen for 20 minutes, then fades.
- **Caught**: a line counts as heard only if the page is visible while it is showing. That is recorded by the UI in the cross-life progress store (`progress.chatter`, a list of line ids, cleaned in `sanitize.js` like the codex). Missing one costs nothing; it comes round again later.
- **Content**: pools by stage and form (for example a Chrome muttering about compliance scores, a Glitch talking over itself), a few that mention its parent's form or trait, and visitor lines about other netlings. About 50 lines to start, drafted by Claude for the maintainer's approval. Line ids are permanent once shipped.
- **Archive**: a new CHATTER tab, or a section of the Codex (see question Q3), showing lines heard and a count of lines left per group, with hints for the empty ones in the style of the DEX.

## Notifications

The app already sends a notification when a need appears while it is in the background (`notify.js`, the ALERTS setting). Proposed:

- A request or a visitor arriving while the app is in the background sends a notification: "It wants to play TUNE." or "A visitor pinged in." (at most one per request or visit).
- Chatter and flow never notify.
- A separate setting, "Requests and visitors", so a player can keep need alerts and turn these off (see question Q4).

**Limit**: these are local notifications. They fire while the app is open or in a background tab; a closed app, or a phone that has suspended it, gets nothing, because a static site has no push server. Reliable notifications with the app closed would need a push service, which is a larger change (see [PLATFORMS.md](PLATFORMS.md)).

## Cosmetic rewards

Placeholder names and thresholds, to be confirmed with the art:

| Slot | Cosmetic | Unlocked by |
|---|---|---|
| sound | Purr | 25 requests answered |
| effect | Aurora | 24 hours in flow, across lives |
| tint | Guest pink | 10 visitors greeted |
| crest | Speech mark | every chatter line of one group heard |

## Save and code notes

- New per-netling fields (`request`, `flowMin`) need defaults in `createScript`, `migrate` and `cleanSave`; the progress fields (`requestsMet`, `visitorsGreeted`, `flowHours`, `chatter`) need cleaning in `cleanProgress`. No `SAVE_VERSION` bump: they are additions.
- New cosmetic ids and chatter ids are permanent.
- New UI or content files go in the `sw.js` `SHELL`.
- The balance bots get an "answers requests when present" behaviour so the tools can show request and flow rates by archetype, and confirm visits don't move survival or forms by much.

## Questions for the maintainer

- **Q1**: should food requests exist? Asking for its favourite packet nudges allegiance toward corp or scav every time it is answered, which could quietly steer the adult form. The alternative is games and COOL only.
- **Q2**: are more frequent and longer visits acceptable (a little free Sync for everyone), with GREET raising only the accessory chance?
- **Q3**: chatter in its own Archive tab, or a section of the Codex?
- **Q4**: a separate notification setting for requests and visitors, or share the existing ALERTS switch?
- **Q5**: the cosmetic list above: right slots and thresholds, or different rewards (for example lore only for requests)?

## Later

- **Netrun contracts (5)**: a way round the cooldown clash is to post a contract only when the uplink is ready, and keep it open until the next jack-in or for 6 hours, whichever comes first, so a cooldown never makes one impossible to take.
- **Daily check-in (4)**: waiting on the maintainer's ideas for rewards; any version should pay for showing up without taking anything away for a missed day.
