# Known behaviour and open questions

Things that work as coded but are easy to misunderstand, and things not yet verified. Fixed defects are not listed; see `git log`.

## Behaviour to know about

- **A nap does not hold an open event's timer; sleep does.** With a trace open, a 60 minute nap takes 60 minutes off the remaining time. HIDE, COMPLY, DEFEND and PURGE stay available during a nap. The field manual says so.
- **Sleep follows the netling's stored zone.** `s.zone` is set at compile and re-read from the device only on waking, so travel, daylight saving and importing onto a device elsewhere take effect the next morning (`tests/zone.test.js`). Tests pin `TZ=UTC` (`tests/helpers/utc.js`).
- **Time in transit counts.** A transfer code stores `lastTick`, and the imported netling is ticked from that moment (clamped to now). A netling left in a code for two days ages two days on load. The source device stops simulating while locked, so nothing is duplicated. Hibernation is the pause, not a code. TRANSFER OUT and the IN TRANSIT screen say so.
- **Boosted wins count double toward Ghost.** A win with a Signal booster adds 2 to `games[id].won`. Intended.
- **Tied forms are chosen at random.** When the axes are within 0.5 of each other, or an axis is within 0.5 of zero, `leaningCandidates` picks among the tied forms, weighting forms the player has never raised at 1.2.
- **`pickByRarity` (`accessories.js`) is separate from `weighted()` (`random.js`).** It weights an array by a rarity table, not an object of weights.
- **Adding a codex fragment does not revoke Root Access.** It is recorded as `progress.rootEarned`; the NL-0 transmission does not replay.
- **The daily trace is honour-system.** Its day is the device's local date, so changing the clock opens another day's map, and clearing site data or using a second device gives another attempt. It is compared socially, not ranked, so this is accepted. A player who knows the map from a friend who played earlier also has an edge; same.
- **`cleanSave` cannot be pointed at a fake step table**, so its wiring to real upgrade steps is first exercised when a real step exists. The runner itself is tested with an injected table and the frozen version 1 fixture.

## Open questions

- **Real-device behaviour is untested** (the maintainer's device pass comes before the full freeze) beyond what the maintainer confirmed: Pages is live, pushes to `main` update it, the installed PWA updates, and a manual install works on macOS. Android, Windows, Steam Deck (controller behaviour included) and iOS storage eviction are untested. Native wrappers are unbuilt stretch goals ([PLATFORMS.md](PLATFORMS.md)).

## Accepted limitations

- **`ui/*` and `ui/gamepad.js` have no unit tests.** They need a real DOM, so only the smoke test covers them.
- **The draw and audio tests cannot judge appearance or sound.** They prove nothing throws, arguments are finite and every sound name exists.

## Verified facts

- `npm test`: 500 tests pass.
- Integrity recovers from 0 to 100 in 20 hours awake or 12.5 hours of dark sleep or naps; across a real day with the lights off at night, 14.6 to 17.8 hours depending on the start time, before care actions (measured with the sim, Charge and Heat held fine).
- Every module reachable from `main.js` is in the service worker's `SHELL` (`tests/shell.test.js`).
- The codex has 27 fragments.
- Every Breach puzzle is generated from a legal path, so it is solvable.
- Balance reference results are in `tools/baseline/`; regenerate them when a rule or number changes ([TESTING.md](TESTING.md)).
