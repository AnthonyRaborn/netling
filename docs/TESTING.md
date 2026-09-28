# Testing and tools

What tests exist, how to run them, what each tool does, and where coverage is thin. Written against commit `ea87757`.

## Quick reference

| Command | What it does | Needs |
|---|---|---|
| `npm test` | Unit tests: `TZ=UTC node --test --test-timeout=20000 'tests/*.test.js'` | Node 22 (uses `node:test`, `CompressionStream`, `Blob.stream`) |
| `npm run smoke` | Drives the real app in headless Chromium | Playwright (`npm install --no-save playwright && npx playwright install chromium`) |
| `npm run balance [runs] [archetype]` | Simulates full lifetimes for scripted players | Node only |
| `node tools/netrun-balance.mjs [runs] [region]` | Monte Carlo netrun outcomes per play style | Node only |
| `node tools/make-icons.mjs` | Regenerates `icons/*.png` from the Bitling sprite | Node only |
| `npm run serve` | Serves the folder at http://localhost:5174 | Python 3 |

On this branch, `npm test` runs 183 tests in 19 files and all pass. The smoke test has 37 scenarios and passed in full when last run here (Playwright 1.56.1 with the preinstalled Chromium).

CI (`.github/workflows/test.yml`) runs on every pull request and every push to `main`: Node 22, `npm test`, then Playwright 1.56.1 and `npm run smoke`. `pages.yml` deploys only after that workflow succeeds on `main`.

## Unit tests

They use `node:test` and `node:assert/strict`, import the modules under test directly, and never touch a DOM. Time and randomness are injected.

### Conventions used by the tests

- `TZ=UTC` is set by the npm script. Tests start at noon UTC (`Date.UTC(2026, 8, 26, 12, 0)`) so a new netling is awake, and set `quirk.sleepOffset = 0`.
- `const noRng = () => 0.999` means "no random event ever fires". Tests that want a specific random outcome pass `() => 0` or a seeded `mulberry32(seed)`.
- A helper such as `booted()` compiles a script with `createScript` and ticks it past `CFG.bootMinutes`.
- Advance time with `tick(s, T0 + minutes * MIN, rng)`; call `act(s, action, now, rng, opts)` for care.
- Storage tests pass a fake Storage object to `createStore`.

### Files

| File | Tests | Covers |
|---|---|---|
| `sim.test.js` | 27 | Compile and boot, drain, care mistakes, lights, neglect death, feeding, patch, leaning, inheritance, sleep window, evolution, form perks, migrate, Ghost rule, play, traces, alerts, clock rollback, Packet Feast |
| `netrun.test.js` | 28 | Map connectivity for all regions, run gating, movement, jack out, disconnect, relay, abort, checkpoints, markets, anomalies, form abilities, fog, region locks, fragment order, codex grouping, accessories, the tutorial run, a flatline mid-run |
| `recovery.test.js` | 14 | Integrity regeneration, care restores, quiet nights, event timers overnight, visitors, uplink cooldown, overclock, repair kit |
| `sanitize.test.js` | 14 | Repairing every kind of stored data, hostile input, run validation, strict cleaning, stage and form agreement, future timers |
| `items.test.js` | 10 | Inventory limits, each item, drops, keepsakes, discard |
| `games.test.js` | 10 | Breach solvability, Dodge, Tune, Feast, session result and forfeit |
| `accessories.test.js` | 10 | Sprite anchors, every accessory on every form, rarity rolls, regions, earned exclusion, props, colors |
| `events.test.js` | 11 | Intrusions, shield, DEFEND, overflow and crash, hibernation blocking, loading stored events |
| `storage.test.js` | 9 | The store: parsing, the write gate, failures, all-or-nothing `setAll`, `clearAll`, test namespace |
| `cosmetics.test.js` | 8 | Unlock conditions, hints, streaks, defaults, label |
| `archive.test.js` | 7 | Dex, death records, lineage rows, back-compat |
| `nap.test.js` | 7 | Naps: drain, duration, cooldown, blocking, bedtime override, persistence |
| `transfer.test.js` | 7 | Round trip, whitespace tolerance, rejection messages, summary, rounding, per-key repair, size caps |
| `root.test.js` | 6 | Root Access rescue rules, cooling, origin palette |
| `hibernate.test.js` | 4 | Freeze, wake rules, cooldown, blocking |
| `random.test.js` | 2 | The weighted pick |
| `lease.test.js` | 4 | The one-tab lease |
| `qr.test.js` | 4 | Versions, finder and timing patterns, capacity |
| `shell.test.js` | 1 | Every module reachable from `main.js` is in the service worker's `SHELL` |

Run one file: `TZ=UTC node --test tests/sim.test.js`. Filter by name: add `--test-name-pattern="nap"`.

## Browser smoke test

`tools/smoke.mjs` starts a static server on a random port, launches Chromium through Playwright, and runs each scenario in a **fresh browser context** (so localStorage is empty). It aborts requests to Google Fonts (so it also exercises the no-font path). Any uncaught page error or `console.error` fails the scenario, except patterns a scenario explicitly allows. Failures print the first line of the error.

Helpers: `seed()` writes a prepared save into localStorage before load, `awakeNetling()` builds one, `padPress()` fakes controller buttons, `saved(page)` reads the stored netling. Scenarios:

- First run: intro, manual, nudge, tutorial run.
- Home: care actions, games, Archive, SYSTEM.
- Transfer out locks and reloads keep the lock; loading a code unlocks; malformed and hostile `#import=` links and codes.
- Corrupted or unreadable saves; full storage; blocked storage.
- Offline: the service worker serves every module.
- Two tabs: guard screen, takeover (Web Locks and the lease fallback).
- Stale confirm timers, discard confirm.
- System actions waiting for a running mini-game; refused results explain why.
- A controller drives menus and a mini-game.
- Screen sizes: Steam Deck and laptop without scrolling, phone in one column.
- Nap, lights-off screen, log scrolling.
- Field manual hides and reveals `root`.
- Test mode: hidden until 7 logo taps, separate fast netling, real one untouched.
- Reaction animations, Packet Feast payout, intrusion and DEFEND, overflow and PURGE, reboot.
- Crashes: a crashing mini-game is closed, a crashing netrun is aborted, a crash in the tutorial still finishes onboarding.
- Shell change keeps accessory and label; flatline and next generation; hibernate; dev mode.

## Balance tools

### `tools/balance.mjs`

Simulates `runs` lifetimes (default 300) for each **archetype**: scripted players with check-in times, a diet (`corp` share), a trace policy (`hide`, `comply`, `mix`, `balance`), a mini-game win rate and a netrun style. Archetypes: `attentive`, `casual`, `worker`, `neglectful`, `corpo`, `runner`, `overclocker`, `sysadmin`, `ghosthunter`. It reports reach-teen, reach-adult, full-life rates, median lifespan, mistakes, causes of death, and the mix of teen and adult forms.

Options (environment variables and arguments):

| Setting | Effect |
|---|---|
| `node tools/balance.mjs 500 casual` | 500 runs, only archetypes whose name contains `casual` (the second argument is a substring filter) |
| `DETAIL=1` | Adds mistakes per run by kind, stats at adulthood, traces and peak items held, and netrun totals |
| `CFG='{"drainPerHour":{"charge":15},"teenAtMin":1200}'` | Override `CFG` values without editing the game. Top-level keys are replaced; `drainPerHour` is merged key by key. Other nested objects (such as `runCooldownMin`) are replaced whole |
| `NO_ITEMS=1` / `NO_RUNS=1` | Disable item use / netruns to isolate their effect |
| `ROOT=1` | Give every netling Root Access, to measure it |

It sets `TZ=UTC` itself. `simulate(profile, seed)` is exported.

The README's old balance targets came from this tool; a run on this commit matched them within sampling noise (see [KNOWN_ISSUES.md](KNOWN_ISSUES.md#checked-and-found-consistent)).

### `tools/netrun-balance.mjs` and `tools/netrun-bot.mjs`

`netrun-bot.mjs` is a scripted netrun player shared by both balance tools. `RUN_STYLES`: `careful` (banks at a relay when Integrity is under 55, avoids ICE under 45), `greedy` (always pushes to the exit) and `skilled` (higher win rate). The bot picks checkpoint answers by lean (`corp`, `indie`, `mix`), buys the first market offer when Charge is over 50, and picks anomaly options at random.

`node tools/netrun-balance.mjs [runs=2000] [region=public]` reports, per style, the jacked-out and disconnected rates, items banked, Integrity and Charge spent, and the average axis lean. Styles include a weak baby and each adult form with its ability. `region` may be `all`, which instead prints disconnect rate, items, fragments per run and Integrity spent for careful, skilled and Firewall players in every region.

### `tools/make-icons.mjs`

Writes `icons/icon-192.png`, `icon-512.png`, `maskable-512.png` and `apple-touch-icon.png` from the Bitling sprite with no dependencies (its own PNG and CRC code).

## Coverage gaps

Summarised from [KNOWN_ISSUES.md](KNOWN_ISSUES.md#ki-16):

- `render.js`, `audio.js`, `notify.js`, `ui/*` and `netrun/view.js` have no unit tests; the smoke test covers their main paths.
- A flatline during an open netrun is covered by a unit test and a smoke scenario (KI-01).
- No test loads a save with a different `saveVersion` and expects an upgrade, because there is no upgrade path (KI-02).
- Real-device behaviour (installation, controllers on Steam Deck, iOS storage eviction) is manual.

## Adding tests

- Put pure-logic tests in `tests/<area>.test.js`. Keep them deterministic: inject `now` and an `rng`.
- When you add a mechanic that ships in saves, add a test that an old-shape save still loads (`migrate` and `cleanSave`).
- When you add a source file, run `npm test`: `shell.test.js` will fail until the file is in `sw.js`.
- For UI behaviour, add a scenario to `tools/smoke.mjs` using `seed()` to set up state.
