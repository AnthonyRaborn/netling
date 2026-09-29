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
| `node tools/make-screenshots.mjs` | Regenerates `screenshots/*.png` (the install dialog's screenshots) from the real app, and checks their sizes against the manifest | Playwright |
| `npm run serve` | Serves the folder at http://localhost:5174 | Python 3 |

On this branch, `npm test` runs 265 tests in 28 files and all pass. The smoke test has 45 scenarios and passed in full when last run here (Playwright 1.56.1 with the preinstalled Chromium).

CI (`.github/workflows/test.yml`) runs on every pull request and every push to `main`: Node 22, `npm test`, then Playwright 1.56.1 and `npm run smoke`. `pages.yml` deploys only after that workflow succeeds on `main`.

## Unit tests

They use `node:test` and `node:assert/strict` and import the modules under test directly. Time and randomness are injected. Code that needs a browser API is tested against small fakes: `tests/helpers/fake-canvas.js` (a canvas that records its draw calls, and its fill, stroke and alpha changes), and per-file fakes for `AudioContext`, `Notification` and the service worker API (including its `controllerchange` and `message` events, in `update.test.js`). `tests/helpers/` is not matched by the test glob.

### Conventions used by the tests

- Tests start at noon UTC (`Date.UTC(2026, 8, 26, 12, 0)`) so a new netling is awake, and set `quirk.sleepOffset = 0`. The simulation reads the local hour, so the files that depend on that import `tests/helpers/utc.js` first (it sets `TZ=UTC`); the npm script also sets it. Run in Tokyo, Los Angeles and Kiritimati time, the whole suite passes.
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
| `content.test.js` | 14 | Cross-checks of the content tables: every form and item has art, traits and keepsakes exist, region tables only name real items and fragments, cosmetics unlock from something and have hints, style items are valid, every service worker file exists, the Pages deploy copies everything the game and the manifest load, install screenshots match their stated sizes |
| `draw.test.js` | 10 | Rendering under a fake canvas: every form, stage, state, accessory, prop and reaction on the home screen; every mini-game through intro, play and result; a whole netrun in every region through the run view's own input. Fails on any NaN or infinite draw argument. Flash safety: the evolution strobe and the glitch change at most three times a second, and a surge is one fading flash |
| `audio.test.js` | 7 | Sound playback against a fake `AudioContext`: notes and pitch, sound packs, the low-frequency floor, mute and volume, and a scan that every sound name used in the source really exists |
| `notify.test.js` | 7 | Notification support, permission, service-worker delivery and fallback, the app badge, and quiet failure |
| `wake.test.js` | 5 | The screen wake lock against a fake API: taken once while wanted, released, re-taken after the browser drops it, a refusal waits, missing support is quiet |
| `migrations.test.js` | 7 | The upgrade runner, error cases, the frozen version 1 fixture, transfer codes across versions |
| `lease.test.js` | 4 | The one-tab lease |
| `qr.test.js` | 4 | Versions, finder and timing patterns, capacity |
| `lifecycle.test.js` | 15 | Balance pass 1: life lengths (new, legacy and cleaned), Ghost's 18 and 3, the Shell, tie bands and weights, Segfault (use, the fault limit, awake only, event drops) |
| `tools.test.js` | 6 | The balance tools: the netrun bot plans only with visible nodes, simulated lives are repeatable, a child starts from its parent, a lineage carries the codex, stats and the report diff |
| `shell.test.js` | 2 | Every module reachable from `main.js` is in the service worker's `SHELL`; the worker's `CACHE` equals the page's `VERSION` |
| `update.test.js` | 6 | The update prompt against a fake service worker: another release offers a reload, the same one stays quiet, malformed messages are ignored, checks are throttled, failures are quiet |

Run one file: `TZ=UTC node --test tests/sim.test.js`. Filter by name: add `--test-name-pattern="nap"`.

## Browser smoke test

`tools/smoke.mjs` starts a static server on a random port, launches Chromium through Playwright, and runs each scenario in a **fresh browser context** (so localStorage is empty). It aborts requests to Google Fonts (so it also exercises the no-font path). Any uncaught page error or `console.error` fails the scenario, except patterns a scenario explicitly allows. Failures print the first line of the error.

Helpers: `seed()` writes a prepared save into localStorage before load, `awakeNetling()` builds one, `padPress()` fakes controller buttons, `saved(page)` reads the stored netling. Scenarios:

- First run: intro, manual, nudge, tutorial run.
- Home: care actions, games, Archive, SYSTEM.
- Transfer out locks and reloads keep the lock; loading a code unlocks; malformed and hostile `#import=` links and codes.
- Corrupted or unreadable saves; full storage; blocked storage.
- Offline: the service worker serves every module.
- Accessibility: meter values and danger text, the danger mark, the screen summary, a new need announced, a new log line added without rebuilding the log, and MOTION (AUTO follows the emulated system setting; REDUCED and FULL override it).
- Device: the screen is kept on during a mini-game and with KEEP SCREEN ON, not otherwise; the badge follows its needs with ALERTS on (wake lock, badge and notification permission are faked, as headless Chromium lacks them).
- A new release while the page is open: the first install stays quiet, a changed `sw.js` shows the update bar, RELOAD waits for a running game, then reloads and keeps the netling; LATER hides the bar.
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

The simulators are scripted players, not people: use their numbers to compare one version of the rules with another, not as a forecast. The balance plan ([BALANCE_PLAN.md](BALANCE_PLAN.md)) says what each pass is trying to move.

### `tools/balance.mjs`

Simulates `runs` lifetimes (default 300) for each **archetype**: scripted players with check-in times, a diet (`corp` share), a trace policy (`hide`, `comply`, `mix`, `balance`), a mini-game win rate and a netrun style. It reports reach-teen, reach-adult and full-life rates, median lifespan, faults, causes of death and the mix of teen and adult forms. It sets `TZ=UTC` itself, and every run is seeded, so the same settings always give the same numbers.

| Archetype | Plays like |
|---|---|
| `attentive` | Checks in hourly, mixed choices, careful netruns |
| `casual` | Six check-ins a day, greedy netruns |
| `worker` | Five check-ins around a working day |
| `neglectful` | Twice a day |
| `corpo`, `runner`, `overclocker`, `sysadmin`, `ghosthunter` | Deliberate strategies for Chrome, Firewall, Glitch (hot and sloppy), Daemon and Ghost, with no netruns |
| `daredevil` | Attentive, but takes every risk that costs no fault: plays hot, Overclock rigs, SALVAGE, RAID |
| `steer-chrome`, `steer-firewall`, `steer-daemon`, `steer-glitch` | Attentive players choosing everything (diet, traces, checkpoints, anomalies, markets) for one adult form. Ghost's is `ghosthunter` |
| `steer-stub` | Attentive, but lets Charge and Sync run out as a baby until 3 faults have landed, for a Stub teen |

Archetype fields (see the comment above `ARCHETYPES`): `checks`, `jitter`, `diet`, `trace`, `winRate`, `runs` (a `RUN_STYLES` name), `hot` or `coolAt`, `sloppy`, `gamer`, `anomaly` (an `ANOMALY_PREFS` name), `shop` and `babyFaults`.

Settings (environment variables and arguments):

| Setting | Effect |
|---|---|
| `node tools/balance.mjs 500 casual` | 500 runs, only archetypes whose name contains `casual` (the second argument is a substring filter) |
| `DETAIL=1` | Adds faults by kind, days spent in each stage; at the teen evolution, the axes, faults and wins, how often both axes were within 1, 1.5, 2 or 3 of zero, and how often it was on Ghost's path (alone, with every game won once, and with every game won twice); the axes and wins at adulthood, timed events and corp traces, peak items held, and netrun totals |
| `JSON=1` | Prints the whole report as JSON (rates as fractions) instead of text, for `tools/balance-diff.mjs` |
| `CFG='{"drainPerHour":{"charge":15},"lifespanMin":7200}'` | Override `CFG` values without editing the game. Top-level keys are replaced; `drainPerHour` is merged key by key. Other nested objects (such as `runCooldownMin`) are replaced whole |
| `TRAIT=ghost` | Every netling starts as the child of that adult form: its trait and keepsake, generation 2 |
| `LIVES=4` | Simulates lineages of that many lives instead of single lives. Each child inherits its parent's fragment (trait, quirk, keepsake), the codex found so far, and Root Access from the life after the codex completes. Reports the share of lineages that finished the codex by each life, the fastest and median, new fragments per life, and every life's results. `runs` is then the number of lineages |
| `NO_ITEMS=1` / `NO_RUNS=1` | Disable item use / netruns to isolate their effect |
| `ROOT=1` | Give every netling Root Access, to measure it |

Exported for tests and scripts: `simulate(profile, seed, { fragment, generation, codex, rootAccess })`, `simulateLine(profile, seed, lives)`, `stats(results)`, `lineStats(lines)` and `parentOf(form)`.

### `tools/netrun-balance.mjs` and `tools/netrun-bot.mjs`

`netrun-bot.mjs` is a scripted netrun player shared by both balance tools. `RUN_STYLES`: `careful` (banks at a relay when Integrity is under 55, avoids ICE under 45), `greedy` (always pushes to the exit, judging only the next step) and `skilled` (higher win rate). Careful and skilled players **plan**: `planMove` scores each way on by the best path up to three steps ahead, using only the nodes the player can see (`visibleNodeIds`: adjacent, visited, revealed, plus Daemon's and Ghost's sight). Unseen nodes count as nothing, so sight is the only thing planning gains, and a tie keeps the first option as the one-step bot did.

The bot answers checkpoints by lean (`corp`, `indie`, `mix`, `balance`; an indie player won't spend a voucher), buys the first market offer when Charge is over 50 unless the style says `shop: false`, and picks anomaly options from an `ANOMALY_PREFS` list (`random`, `risky`, `orderly`, `corp`, `indie`).

`node tools/netrun-balance.mjs [runs=2000] [region=public]` reports, per style, the jacked-out and disconnected rates, items banked, Integrity and Charge spent, and the average axis lean. Styles include a weak baby and each adult form with its ability. `region` may be `all`, which prints the disconnect rate, items, fragments per run and Integrity spent for careful and skilled players and every adult form, in every region. `JSON=1` prints JSON.

### `tools/balance-diff.mjs`

Compares two JSON reports from either tool and prints every number that moved by at least a threshold (default 0.01; rates are shown in percentage points):

```bash
JSON=1 node tools/balance.mjs 1000 > before.json
# change CFG, RUN_CFG or a rule
JSON=1 node tools/balance.mjs 1000 > after.json
node tools/balance-diff.mjs before.json after.json 0.02
```

### Baselines

`tools/baseline/` holds reports for the rules as they are, to diff a change against:

| File | Command |
|---|---|
| `lives.json` | `JSON=1 node tools/balance.mjs 1000` |
| `netruns.json` | `JSON=1 node tools/netrun-balance.mjs 1000 all` |
| `lineages.json` | `JSON=1 LIVES=4 node tools/balance.mjs 200` |

Regenerate all three in the same pull request as any change to the rules or to the tools, and say in the pull request what moved. They take about four minutes together.

### Balance targets

Agreed with the maintainer (see [BALANCE_PLAN.md](BALANCE_PLAN.md#decisions-so-far)). Status is from the baselines above.

| Target | Measured by | Status |
|---|---|---|
| Ghost stays a deliberate chase: `ghosthunter` at least 95% Ghost, other attentive players under 5% | `lives.json` | Met: 99% and at most 0.9% |
| The Shell hints at Ghost: most Ghost chasers pass through it, almost nobody else | `lives.json`, `teens` | Met: 63% of `ghosthunter` teens, at most 0.4% of anyone else |
| Attentive players can steer every adult form: each `steer-*` at least 80% for its form | `lives.json` | Met: 91 to 100%. Glitch costs about one fault a life (`steer-glitch`, 1.3 faults) |
| Attentive players can steer the teen form: `steer-stub` at least 80% Stub, at a low cost | `lives.json` | Met: 98% Stub at 3.5 faults. A Segfault turns up before the teen stage in 59% of its lives; without one it still starves the netling for the faults |
| The codex takes at least 3 lives: no lineage finishes in fewer | `lineages.json`, `fastest` | Not met: attentive-style lines finish within 2 lives 4 to 22% of the time (and once in 200, in 1). Pass 2 adds the per-life cap |
| The Deep stays a wall: careful disconnects well above the Ruins' | `netruns.json` | Met: 27% against 8% |
| No regression in survival: full-life rates within 3 points of the previous baseline | `lives.json` | Met: every archetype held or rose with the 5-day life (casual 80% to 88%, worker 52% to 81%) |

### `tools/make-icons.mjs`

Writes `icons/icon-192.png`, `icon-512.png`, `maskable-512.png` and `apple-touch-icon.png` from the Bitling sprite with no dependencies (its own PNG and CRC code).

## Coverage gaps

Summarised from [KNOWN_ISSUES.md](KNOWN_ISSUES.md#ki-16):

- `ui/*` (including `advance`, the flatline handling and `dropSession`) and `ui/gamepad.js` still have no unit tests: they need a real DOM, so only the smoke test covers them. Rendering, the run view, mini-game drawing, audio, notifications and the content tables are unit tested (KI-16).
- The draw and audio tests prove nothing throws, arguments are finite and every sound exists. They cannot tell whether the art looks right or a sound is pleasant; `gallery.html` and playtesting cover that.
- A flatline during an open netrun is covered by a unit test and a smoke scenario (KI-01).
- Upgrade steps are tested through an injected step table and the frozen version 1 fixture. `cleanSave` cannot be pointed at a fake table, so its wiring to real steps only gets exercised once a first real step exists.
- Real-device behaviour (installation, controllers on Steam Deck, iOS storage eviction) is manual.

## Adding tests

- Put pure-logic tests in `tests/<area>.test.js`. Keep them deterministic: inject `now` and an `rng`.
- When you add a mechanic that ships in saves, add a test that an old-shape save still loads (`migrate` and `cleanSave`).
- When you add a source file, run `npm test`: `shell.test.js` will fail until the file is in `sw.js`.
- For UI behaviour, add a scenario to `tools/smoke.mjs` using `seed()` to set up state.
