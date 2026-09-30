# Known behaviour and open questions

Things that work as coded but are easy to misunderstand, and things not yet verified. Fixed defects are not listed; see `git log`.

## Behaviour to know about

- **A nap does not hold an open event's timer; sleep does.** With a trace open, a 60 minute nap takes 60 minutes off the remaining time. HIDE, COMPLY, DEFEND and PURGE stay available during a nap. The field manual says so.
- **Sleep uses the device's local time zone.** `step()` decides sleep from `new Date(t).getHours()`. Travel, daylight saving changes, and importing a netling onto a device in another time zone all shift the sleep window. Tests pin `TZ=UTC` (`tests/helpers/utc.js`).
- **Time in transit counts.** A transfer code stores `lastTick`, and the imported netling is ticked from that moment (clamped to now). A netling left in a code for two days ages two days on load. The source device stops simulating while locked, so nothing is duplicated. Hibernation is the pause, not a code.
- **Boosted wins count double toward Ghost.** A win with a Signal booster adds 2 to `games[id].won`, so "22 wins, 4 in each game" can be met with fewer real wins.
- **Neutral netlings that miss Ghost become Chrome.** `leaningForm` breaks ties toward allegiance, and allegiance 0 counts as positive. A tidy, neutral player usually gets Daemon instead, because stability accrues steadily.
- **`pickByRarity` (`accessories.js`) is separate from `weighted()` (`random.js`).** It weights an array by a rarity table, not an object of weights.
- **Adding a codex fragment does not revoke Root Access.** It is recorded as `progress.rootEarned`; the NL-0 transmission does not replay.
- **`cleanSave` cannot be pointed at a fake step table**, so its wiring to real upgrade steps is first exercised when a real step exists. The runner itself is tested with an injected table and the frozen version 1 fixture.

## Open questions

- **Integrity regeneration: 14 or 16 hours for a full recovery?** The comment on `integrityRegenPerHour` in `sim.js` says about 16. Never measured. The player README does not quote it.
- **Real-device behaviour is untested** beyond what the maintainer confirmed: Pages is live, pushes to `main` update it, the installed PWA updates, and a manual install works on macOS. Android, Windows, Steam Deck (controller behaviour included) and iOS storage eviction are untested. Native wrappers are unbuilt stretch goals ([PLATFORMS.md](PLATFORMS.md)).
- **`ui/*` and `ui/gamepad.js` have no unit tests.** They need a real DOM, so only the smoke test covers them.
- **The draw and audio tests cannot judge appearance or sound.** They prove nothing throws, arguments are finite and every sound name exists. `gallery.html` and playtesting cover the rest.

## Verified facts

- `npm test`: 227 tests pass, in UTC and in Tokyo, Los Angeles and Kiritimati time.
- `npm run smoke`: 41 scenarios pass in headless Chromium, including a check that no third-party requests are made.
- `npm run balance` (300 runs per archetype): attentive 100% adult and 99% full life; casual 93% and 83%; worker 87% and 49%; neglectful 4% adult, dying around day 1. Deliberate strategies reach their forms: Chrome 100%, Firewall 100%, Glitch 65%, Daemon 83%, Ghost 100%.
- Every module reachable from `main.js` is in the service worker's `SHELL` (`tests/shell.test.js`).
- The codex has 22 fragments (4, 5, 5, 4, 4 by region).
- Every Breach puzzle is generated from a legal path, so it is solvable.
