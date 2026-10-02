# Testing and tools

What tests exist, how to run them, what each tool does, and where coverage is thin.

## Quick reference

| Command | What it does | Needs |
|---|---|---|
| `npm test` | Unit tests: `TZ=UTC node --test --test-timeout=20000 'tests/*.test.js'` | Node 22 (uses `node:test`, `CompressionStream`, `Blob.stream`) |
| `npm run smoke` | Drives the real app in headless Chromium | Playwright (`npm install --no-save playwright && npx playwright install chromium`) |
| `npm run balance [runs] [archetype]` | Simulates full lifetimes for scripted players | Node only |
| `node tools/netrun-balance.mjs [runs] [region]` | Monte Carlo netrun outcomes per play style | Node only |
| `node tools/wearable-colors.mjs [--write]` | Picks each recolorable wearable's default color per palette and rewrites `src/wearable-colors.js` (run it with `--write` after changing sprites, palettes or wearables; a test fails when it is stale) | Node only |
| `node tools/sprite-audit.mjs [--check=a,b] [--json] [--strict]` | Candidate art problems (clipping, colors that blend into the pet, look-alike wearables and icons, wearables from different slots that cover each other, missing poses) from the real renderer; see [SPRITES.md](SPRITES.md) | Node only |
| `npm run serve`, then open `http://localhost:5174/gallery.html` | The sprite gallery (every sprite in every valid combination; see [SPRITES.md](SPRITES.md)). It must be served: a `file://` page cannot load modules. If it is blank in a browser that has run the game before, an older stored copy of a file (service worker or cache) is the usual cause: use the button in its error box, or a private window | A browser |
| `node tools/render-music.mjs <out dir> [seconds] [track[:state[:region]] ...]` | Renders the background music to WAV files (every track and state by default) with the real player code, at the game's own level (music slider at `VOLUME`, default 0.4), plus `reference-effects.wav` (sound effects at the default 80%) to compare with; prints each file's loudness. Sleep renders run at least 64 s to cover the wind-down | Playwright |
| `node tools/make-icons.mjs` | Regenerates `icons/*.png` from the Bitling sprite | Node only |
| `node tools/make-screenshots.mjs` | Regenerates `screenshots/*.png` (the install dialog's screenshots) from the real app, and checks their sizes against the manifest | Playwright |
| `node tools/make-trailer.mjs` | Renders the spoiler-free trailer (49 s, 1080x1920, 30 fps) from the real app, with its sound effects and one continuous take of the game's music under them (`renderMusic`, following the rules in [MUSIC.md](MUSIC.md); `MUSIC_DB=n` sets its level over the game's own, default 4) to `trailer/netling-trailer.mp4` (git ignores it). Deterministic: a fake clock and a seeded `Math.random`. `SCENES=care,netrun` renders only those scenes (effects only, no music), `STILLS=dir` saves every 15th frame, `OUT=file.mp4` moves the output. Takes about 9 minutes | Playwright, and an ffmpeg with libx264 and aac on `PATH` or in `FFMPEG` (`pip install imageio-ffmpeg` bundles one) |
| `npm run serve` | Serves the folder at http://localhost:5174 | Python 3 |

`npm test` runs 453 tests in 41 files. The smoke test has 73 scenarios (Playwright 1.56.1).

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
| `sim.test.js` | 28 | Compile and boot, drain and the drain curve, care mistakes, lights, neglect death, feeding, patch, leaning, inheritance, sleep window, evolution, form perks, migrate, Ghost rule, play, traces, alerts, clock rollback, Packet Feast |
| `netrun.test.js` | 28 | Map connectivity for all regions, run gating, movement, jack out, disconnect, relay, abort, checkpoints, markets (scrip and Charge), anomalies, form abilities, fog, region locks, fragment order, codex grouping, accessories, the tutorial run, a flatline mid-run |
| `recovery.test.js` | 14 | Integrity regeneration, care restores, quiet nights, event timers overnight, visitors, uplink cooldown, overclock, repair kit |
| `overclock.test.js` | 13 | Overclocked: game and ICE speed, costlier losses, better drops, likelier events and visitors, the stability lean, the jack-in latch, Heatwave minutes; flow is calm, and visitors add no Heat in flow |
| `markets.test.js` | 5 | Black markets and corp exchanges: each region's share, the Source has none, leans and Charge prices (and the Chrome discount), exclusive accessories, saves |
| `comply.test.js` | 2 | Corp choices cost about what indie ones do: trace COMPLY costs Sync only, a checkpoint takes a scrip fee and confiscates only when the netling can't pay |
| `sanitize.test.js` | 14 | Repairing every kind of stored data, hostile input, run validation, strict cleaning, stage and form agreement, future timers |
| `items.test.js` | 10 | Inventory limits, each item, drops, keepsakes, discard |
| `games.test.js` | 10 | Breach solvability, Dodge, Tune, Feast, session result and forfeit |
| `sprites.test.js` | 5 | Every form has its own dead and sleep sprite, dead eyes are X's, asleep eyes are slits, the Shell is solid with a void, every color map covers every mark |
| `colors.test.js` | 2 | Color distance and the contrast swap |
| `sprite-checks.test.js` | 7 | The sprite review arithmetic: color distance, blending, clipping, lost pixels, overlap, silhouettes |
| `accessories.test.js` | 22 | Sprite anchors (authored rows for every form and frame, no jumping between frames, the neck row), every accessory on every form, rarity rolls, regions, earned exclusion, props, wear slots (every accessory has one, draw order, what the wardrobe has on, making room, a visitor's second item from another slot), colors (per-palette defaults, the generated table is current, the contrast swap) |
| `events.test.js` | 11 | Intrusions, shield, DEFEND, overflow and crash, hibernation blocking, loading stored events |
| `storage.test.js` | 9 | The store: parsing, the write gate, failures, all-or-nothing `setAll`, `clearAll`, test namespace |
| `checkin.test.js` | 8 | Daily check-in: the morning wake is recorded (not a nap), due once per morning however many passed, the seven-day ladder and its loop, item tiers (never a Segfault), accessory days from the general pool (never owned or waiting, scrip when none are left), a full box holding it back, taking from the box, cleaning, and transfer keys |
| `contracts.test.js` | 12 | Netrun contracts: the thinnest-route count against every route, the map fix on every route in every region, posting (only with the uplink ready and awake, the hourly chance and its catch-up cap, only kinds that can be met), taking one along, each kind met or missed, slipped ICE counting, void on a disconnect or abort, the cheap market offer and certain fragment, and save round trips |
| `cosmetics.test.js` | 19 | Unlock conditions, hints, streaks, defaults, label, the four legacy goals and the crest slot, the four attention cosmetics, the music tracks' milestones and wardrobe slot, and the Seal crest |
| `attention.test.js` | 12 | Attention rewards: requests (game and COOL, expiry without a fault, when none are asked), GREET and the gift chance, flow and that it changes nothing, chatter (pool, fading, content rules), saves |
| `archive.test.js` | 9 | Dex, death records, lineage rows, the family tree chain (links, gaps, the running netling's stats), back-compat |
| `nap.test.js` | 7 | Naps: drain, duration, cooldown, blocking, bedtime override, persistence |
| `transfer.test.js` | 7 | Round trip, whitespace tolerance, rejection messages, summary, rounding, per-key repair, size caps |
| `root.test.js` | 11 | Root Access rescue rules, cooling, origin palette, Root Access on the original 22 only |
| `hibernate.test.js` | 4 | Freeze, wake rules, cooldown, blocking |
| `random.test.js` | 2 | The weighted pick |
| `corrupt.test.js` | 3 | The blink of corrupted records and sectors: garbled letters (block glyphs or look-alike digits, brackets and spaces kept, at least two changed), the static re-rolling with a band shifted, and the timing against the flash limit |
| `content.test.js` | 14 | Cross-checks of the content tables: every form and item has art, traits and keepsakes exist, region tables only name real items and fragments, cosmetics unlock from something and have hints, style items are valid, every service worker file exists, the Pages deploy copies everything the game and the manifest load, install screenshots match their stated sizes |
| `draw.test.js` | 10 | Rendering under a fake canvas: every form, stage, state, accessory, prop and reaction on the home screen; every mini-game through intro, play and result; a whole netrun in every region through the run view's own input. Fails on any NaN or infinite draw argument. Flash safety: the evolution strobe and the glitch change at most three times a second, and a surge is one fading flash |
| `audio.test.js` | 7 | Sound playback against a fake `AudioContext`: notes and pitch, sound packs, the low-frequency floor, mute and volume, and a scan that every sound name used in the source really exists |
| `music.test.js` | 8 | Background music: phrase and form checks (every track, the wardrobe lists every track but the netrun theme, each has a part for the flow sparkle), which variant plays when (resting, then alert, then flow), the arranger (seeded, no phrase twice running, flourish spacing, the low-note floor in every state and region), the sleep variant and its wind-down (bars, one closing chord, nothing after 60 s), the alert and flow drafts, the netrun theme per region, what plays when, and the player against a fake `AudioContext` (no autoplay; hidden, muted, 0% and flatline stop it; a netrun swaps the track) |
| `notify.test.js` | 7 | Notification support, permission, service-worker delivery and fallback, the app badge, and quiet failure |
| `wake.test.js` | 5 | The screen wake lock against a fake API: taken once while wanted, released, re-taken after the browser drops it, a refusal waits, missing support is quiet |
| `migrations.test.js` | 8 | The upgrade runner, error cases, the frozen version 1 and version 2 fixtures, transfer codes across versions |
| `source.test.js` | 20 | The Source and the Mainframe stage's netrun side, with the switch on and off: Root Access opens the stage, corrupted dex entries until then, the Source's place and locks, fragments and regions out of play while off, every Source map connected, NL-0's line, cosmetics on the original 22, each mainframe upgrade; and what the player sees: the four Mainframe unlocks (hidden while off), Full house counting a mainframe as its line, the field manual row (corrupted, hint, rule), the Source's netrun theme, and a mainframe's plush, and the cleaned Source progress |
| `mainframe.test.js` | 14 | The Mainframe stage, with its switch on and off: forms and lines, the gate (age, feat, home, once), the switch off, feat first and age first, the extra day, the Deep exit counter, a mainframe keeping its line's ability, the level II trait, save cleaning, the lineage and dex, its own art (18 wide, no taller than an adult, shaped like its line), visitors (only to a line with root) and chatter (its line's, plus one line of its own) |
| `lease.test.js` | 4 | The one-tab lease |
| `qr.test.js` | 4 | Versions, finder and timing patterns, capacity |
| `lifecycle.test.js` | 15 | Balance pass 1: life lengths (new, legacy and cleaned), Ghost's 29 and 4, the Shell's 3 each, tie bands and weights, Segfault (use, the fault limit, awake only, event drops) |
| `progression.test.js` | 28 | Balance pass 2: the way down (order, exits only, stage gates, old saves, cleaning), the per-life codex cap, corpo scrip (prices, SCRAP, full-inventory pickups, the cap, market selling and buying, loose scrip, inheritance, cleaning, a transfer round trip), and the second abilities (Chrome's insurance and its saved flag, Chrome's corp relays, Daemon's upkeep, Ghost slipping past ICE, Glitch's later phases) |
| `traits.test.js` | 9 | Balance pass 3: level strengths, history and caps, the streak through fragments and a real flatline, each trait's effect scaling (Persistent, Licensed, Volatile, Hardened), old saves and cleaning |
| `zone.test.js` | 5 | the sleep zone is taken at compile, kept through the day and night, refreshed on waking (staying asleep if it is still night there), the readout's bedtime on the device clock, old saves and cleaning |
| `tools.test.js` | 9 | The balance tools: the netrun bot plans only with visible nodes and sells surplus first, simulated lives are repeatable and follow the way down, a child starts from its parent, a lineage carries the codex, stats and the report diff, and the Mainframe gate probe (codex presets, and a reported gate that agrees with the rule) |
| `shell.test.js` | 2 | Every module reachable from `main.js` is in the service worker's `SHELL`; the worker's `CACHE` equals the page's `VERSION` |
| `update.test.js` | 6 | The update prompt against a fake service worker: another release offers a reload, the same one stays quiet, malformed messages are ignored, checks are throttled, failures are quiet |

Run one file: `TZ=UTC node --test tests/sim.test.js`. Filter by name: add `--test-name-pattern="nap"`.

## Browser smoke test

`tools/smoke.mjs` starts a static server on a random port, launches Chromium through Playwright, and runs each scenario in a **fresh browser context** (so localStorage is empty). It aborts requests to Google Fonts (so it also exercises the no-font path). Any uncaught page error or `console.error` fails the scenario, except patterns a scenario explicitly allows. Failures print the first line of the error. `SMOKE_ONLY=text npm run smoke` runs only the scenarios whose name contains `text`, and prints more of each failure.

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
- Stale confirm timers, the SCRAP confirm, a Segfault's second press.
- The readout shows the trait level and its history.
- Quitting on touch: QUIT arms a confirm at the top of the screen, a second tap on QUIT only cancels, it times out, CONFIRM forfeits, Esc still quits at once; ABORT RUN confirms the same way.
- Scrip: SCRAP pays a quarter and the scrip line updates; at an open market the button sells for half and a purchase opens up.
- Regions open in order: only the Public Net until its exit is reached, then the Bazaar; the codex memory line and FULL.
- System actions waiting for a running mini-game; refused results explain why.
- A controller drives menus and a mini-game.
- Screen sizes: Steam Deck and laptop without scrolling, phone in one column.
- Nap, lights-off screen, log scrolling.
- Field manual hides and reveals `root`.
- Test mode: hidden until 7 logo taps, separate fast netling, real one untouched.
- Reaction animations, Packet Feast payout, intrusion and DEFEND, overflow and PURGE, reboot.
- Crashes: a crashing mini-game is closed, a crashing netrun is aborted, a crash in the tutorial still finishes onboarding.
- The daily check-in fills the box once a morning and TAKE moves it (other scenarios seed today's check-in as claimed).
- A posted contract in the bar and the region picker, taken along on a jack-in.
- Shell change keeps accessory and label (and an old single accessory moves to its slot); a hat and shades worn together, and a second hat replaces the first; flatline and next generation; hibernate; dev mode.
- The Mainframe stage and the Source: before Root Access the Source reads `<<SECTOR CORRUPTED>>` (glitching, closed to an adult) and the five forms `<<RECORD CORRUPTED>>`, with the field manual row corrupted; the records blink (the name garbles and comes back, the static re-rolls) and stay still with motion calmed; after it a mainframe draws and animates, the dex shows `???` and hints, the Source repairs its name once, opens and logs it, and the field manual has the rule; a Source run plays its own theme, and Source light and First commit unlock and equip.

## Balance tools

The simulators are scripted players, not people: use their numbers to compare one version of the rules with another, not as a forecast. The balance notes ([BALANCE.md](BALANCE.md)) say what each pass is trying to move.

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
| `steer-mainframe` | Attentive and careful in runs, but jacks in at every chance (`eager`), to reach The Deep's exit as an adult: the best case for the planned Mainframe gate |

Every player that runs follows the way down: it heads for the deepest open region until it has cleared it, then picks any open region. Items: each player keeps what it has a use for (Coolant, Antivirus, Repair kits, Overclock chips, Black ICE; vouchers unless it always hides; boosters if it chases Ghost; a Segfault while it wants faults), sells the rest at markets down to one free slot, scraps surplus at home when the inventory is full, and buys only items it keeps. The report adds, per archetype: `netruns.cleared` (share of lives that reached each exit), `netruns.byRegion` (runs a life), `netruns.codexCapped`, `scrip` (at the end, peak, bought, sold, `affordable` and `marketsPerRun`) and `fullAtCheckIn`.

Archetype fields (see the comment above `ARCHETYPES`): `checks`, `jitter`, `diet`, `trace`, `winRate`, `runs` (a `RUN_STYLES` name), `hot` or `coolAt`, `sloppy`, `gamer`, `anomaly` (an `ANOMALY_PREFS` name), `shop`, `babyFaults` and `eager` (a careful runner that jacks in whenever it is fairly healthy, not only when it will be back soon).

**The Mainframe gate probe** ([SIMULATION.md](SIMULATION.md#mainframe)). Every life records the minute the gate is met (`mainframeDue` in `sim.js`: an adult, home from any run, at least `lifespan - 24h` old, with three Deep exits or two clean ones this life, counted by the game in `s.deepExits`, and Root Access in the line; `CODEX=deep` gives a single life a complete codex and Root Access). The stage is on by default, so the report's stage days include `mainframe`, its Deep runs and disconnects up to the first clear, and each Deep exit. `stats()` reports them as `mainframe`: the share that cleared The Deep, met the feat and met the gate, the median and earliest-tenth age, the hours it would leave as a mainframe, the share that waited on the feat, and `feats`, harder alternatives (`FEATS`: one, two or three Deep exits, a clean one, one with at most 2 faults, two clean ones, three exits or two clean, and two exits with flow once in the life or with one run jacked into in flow). The text report prints it for any archetype that cleared The Deep. A single life starts with an empty codex, so The Deep stays locked unless `CODEX` is set.

Settings (environment variables and arguments):

| Setting | Effect |
|---|---|
| `node tools/balance.mjs 500 casual` | 500 runs, only archetypes whose name contains `casual` (the second argument is a substring filter) |
| `DETAIL=1` | Adds faults by kind, days spent in each stage; at the teen evolution, the axes, faults and wins, how often both axes were within 1, 1.5, 2 or 3 of zero, and how often it was on Ghost's path (alone, with every game won once, and with every game won twice); the axes and wins at adulthood, timed events and corp traces, peak items held, netrun totals, and attention rewards a life (requests answered, visitors greeted, hours in flow, chatter lines seen at check-ins) |
| `JSON=1` | Prints the whole report as JSON (rates as fractions) instead of text, for `tools/balance-diff.mjs` |
| `CFG='{"drainPerHour":{"charge":15},"lifespanMin":7200}'` | Override `CFG` values without editing the game. Top-level keys are replaced; `drainPerHour` is merged key by key. Other nested objects (such as `runCooldownMin`) are replaced whole |
| `TRAIT=ghost` | Every netling starts as the child of that adult form: its trait and keepsake, generation 2. Add `TRAIT_LEVEL=2` for a streak, `HISTORY=daemon` for a grandparent whose trait carries on as history |
| `LIVES=4` | Simulates lineages of that many lives instead of single lives. Each child inherits its parent's fragment (trait, quirk, keepsake), the codex found so far, and Root Access from the life after the codex completes. Reports the share of lineages that finished the codex by each life, the fastest and median, new fragments per life, and every life's results. `runs` is then the number of lineages |
| `NO_ITEMS=1` / `NO_RUNS=1` | Disable item use / netruns to isolate their effect |
| `ROOT=1` | Give every netling Root Access, to measure it |
| `CODEX=deep` / `CODEX=ruins` | Every single life starts knowing every fragment (and so has Root Access, as the game would grant it) or the fragments through `ruins-4` (the earliest a lineage can open The Deep). For the Mainframe gate probe. Not with `LIVES` |

It sets `TZ=UTC` itself. Exported for tests and scripts: `simulate(profile, seed, { fragment, generation, codex, rootAccess })`, `simulateLine(profile, seed, lives)`, `stats(results)`, `lineStats(lines)` and `parentOf(form)`.

Reference results are in [KNOWN_ISSUES.md](KNOWN_ISSUES.md#verified-facts).

### `tools/netrun-balance.mjs` and `tools/netrun-bot.mjs`

`netrun-bot.mjs` is a scripted netrun player shared by both balance tools. `RUN_STYLES`: `careful` (banks at a relay when Integrity is under 55, avoids ICE under 45), `greedy` (always pushes to the exit, judging only the next step) and `skilled` (higher win rate). Careful and skilled players **plan**: `planMove` scores each way on by the best path up to three steps ahead, using only the nodes the player can see (`visibleNodeIds`: adjacent, visited, revealed, plus Daemon's and Ghost's sight). Unseen nodes count as nothing, so sight is the only thing planning gains, and a tie keeps the first option as the one-step bot did.

The bot answers checkpoints by lean (`corp`, `indie`, `mix`, `balance`; an indie player won't spend a voucher), buys the first market offer when Charge is over 50 unless the style says `shop: false`, and picks anomaly options from an `ANOMALY_PREFS` list (`random`, `risky`, `orderly`, `corp`, `indie`).

`node tools/netrun-balance.mjs [runs=2000] [region=public]` reports, per style, the jacked-out and disconnected rates, items banked, Integrity and Charge spent, and the average axis lean. It also reports `exit`, the share of runs that reach the exit node (a relay jack-out is not one): disconnect rates alone hid that Chrome banked early. Styles include a weak baby, each adult form with its ability, and each mainframe form (`plat`, `airgap`, `init`, `panic`, `whisper`) with its line's ability and its upgrade. `region` may be `all`, which prints the disconnect and exit rates, items, fragments per run and Integrity spent for careful and skilled players and every adult form, in every region, and the mainframe forms in The Deep and the Source. `JSON=1` prints JSON.

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

Agreed with the maintainer (see [BALANCE.md](BALANCE.md#design-goals)). Status is from the baselines above.

| Target | Measured by | Status |
|---|---|---|
| Ghost stays a deliberate chase: `ghosthunter` at least 95% Ghost, other attentive players under 5% | `lives.json` | Met: 95.6% (the bot cools at 45: with no uptime gain, Ghost chasers keep stability at 0 or above by staying cool) and at most 2.5% (`sysadmin`) |
| The Shell hints at Ghost: most Ghost chasers pass through it, almost nobody else | `lives.json`, `teens` | Met: 47% of `ghosthunter` teens (63% before the drain pass), at most 2.6% of anyone else |
| Attentive players can steer every adult form: each `steer-*` at least 80% for its form | `lives.json` | Met: 97 to 100%. Glitch by staying overclocked (`steer-glitch`, 99%) |
| Attentive players can steer the teen form: `steer-stub` at least 80% Stub, at a low cost | `lives.json` | Met: 95% Stub at 3.4 faults. A Segfault turns up before the teen stage in 59% of its lives; without one it still starves the netling for the faults |
| The codex takes at least 3 lives: no lineage finishes in fewer | `lineages.json`, `fastest` | Met: fastest is life 3 for every archetype (the per-life cap of 8); attentive-style lines finish in life 3 (23 to 47%) or 4 (median 4); casual lines now finish in life 3 or 4 about half the time |
| Players who run have a free slot at least half the time at check-ins | `lives.json`, `fullAtCheckIn` | Met: the inventory is full at 23 to 32% of check-ins for attentive-style players and 47% for casual ones |
| A market purchase is affordable about every second run | `lives.json`, `scrip.affordable`, `scrip.marketsPerRun` | Met for attentive players (about 1 market a run since every region but the Source has them, affordable at 84 to 93%). Casual players: 76% of markets |
| Careful disconnects rise down the way: Public < Bazaar < Corp < Ruins < Deep | `netruns.json` | Met: 3%, 4%, 6%, 10%, 34% |
| The Deep stays a wall: careful disconnects well above the Ruins' | `netruns.json` | Met: 34% against 10%; adults with their abilities 10 to 19% against 2 to 3% |
| No adult ability is more than about 4 points better than another at avoiding disconnects | `netruns.json` | Met: in the Deep, 14.3 to 18.1% at 4000 runs each (the 1000-run baseline shows 14.6 to 19.2%, within its noise) |
| Traits stay bounded: no trait at its cap moves the casual full-life rate by more than about 5 points, or any adult form's share by more than about 10 | `node tools/trait-balance.mjs 800` | Met, at the edge: at most 3.2 points (Persistent) and 10.5 points (Persistent at its cap; it was 8 before the drain pass) |
| Steering survives inheritance: every `steer-*`, `corpo`, `runner` and `ghosthunter` reaches its form in every generation of a lineage | `lineages.json` | Met: 89 to 100% in lives 1 to 4 (lowest: `steer-stub`'s Stub teen, 89 to 95%; `ghosthunter` 96 to 98%) |
| No regression in survival: full-life rates within 3 points of the previous baseline | `lives.json` | Met: the drain pass costs casual players 2 points (94.6% to 92.5% on the same bot) while faults rise as intended (casual 3.6 to 4.5, worker 4.7 to 5.4). Against the previous baseline, worker full lives rose (84% to 92%) because the corrected bot feeds before a netrun |

### `tools/trait-balance.mjs`

`node tools/trait-balance.mjs [lives=400] [archetypes=casual,attentive] [forms=all] [strengths=0,0.5,1,cap]` measures each trait at several strengths for a child of that form, against the same parent with the trait switched off (strength 0), so the keepsake and the parent's form stay the same. A strength scales `TRAIT_CFG.full` (and Volatile's Integrity cost); 0.5 is a history alone and `cap` the trait's cap. It prints the full-life rate and its change, the largest change in any adult form's share, corp traces and faults a life. `TRAIT=<form>`, `TRAIT_LEVEL=<1-3>` and `HISTORY=<form>` on `balance.mjs` run whole reports for a given inheritance.

### `tools/make-icons.mjs`

Writes `icons/icon-192.png`, `icon-512.png`, `maskable-512.png` and `apple-touch-icon.png` from the Bitling sprite with no dependencies (its own PNG and CRC code).

## Coverage gaps

- `ui/*` (including `advance` and `dropSession`) and `ui/gamepad.js` have no unit tests: they need a real DOM, so only the smoke test covers them.
- The draw and audio tests prove nothing throws, arguments are finite and every sound exists. They cannot tell whether the art looks right or a sound is pleasant; `gallery.html`, `tools/sprite-audit.mjs` (it flags candidates; a person judges them) and playtesting cover that.
- `cleanSave` cannot be pointed at a fake step table, so its wiring to real upgrade steps is exercised only once a first real step exists. The runner is tested through an injected table and the frozen version 1 fixture.
- Real-device behaviour (installation, controllers on Steam Deck, iOS storage eviction) is manual.

## Adding tests

- Put pure-logic tests in `tests/<area>.test.js`. Keep them deterministic: inject `now` and an `rng`.
- When you add a mechanic that ships in saves, add a test that an old-shape save still loads (`migrate` and `cleanSave`).
- When you add a source file, run `npm test`: `shell.test.js` will fail until the file is in `sw.js`.
- For UI behaviour, add a scenario to `tools/smoke.mjs` using `seed()` to set up state.
