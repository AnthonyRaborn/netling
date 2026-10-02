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
- **`cleanSave` cannot be pointed at a fake step table**, so its wiring to real upgrade steps is first exercised when a real step exists. The runner itself is tested with an injected table and the frozen version 1 fixture.

## Open questions

- **Integrity regeneration: 14 or 16 hours for a full recovery?** The comment on `integrityRegenPerHour` in `sim.js` says about 16. Never measured.
- **Real-device behaviour is untested** beyond what the maintainer confirmed: Pages is live, pushes to `main` update it, the installed PWA updates, and a manual install works on macOS. Android, Windows, Steam Deck (controller behaviour included) and iOS storage eviction are untested. Native wrappers are unbuilt stretch goals ([PLATFORMS.md](PLATFORMS.md)).
- **`ui/*` and `ui/gamepad.js` have no unit tests.** They need a real DOM, so only the smoke test covers them.
- **The draw and audio tests cannot judge appearance or sound.** They prove nothing throws, arguments are finite and every sound name exists.

## Verified facts

- `npm test`: 457 tests pass.
- Every module reachable from `main.js` is in the service worker's `SHELL` (`tests/shell.test.js`).
- The codex has 22 fragments.
- Every Breach puzzle is generated from a legal path, so it is solvable.
- Balance reference results are in `tools/baseline/`; regenerate them when a rule or number changes ([TESTING.md](TESTING.md)).
