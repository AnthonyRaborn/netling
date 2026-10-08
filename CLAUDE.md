# Netling: notes for AI sessions

A cyberpunk Tamagotchi-style pet in the browser. Vanilla ES modules, canvas, no build step, no runtime dependencies. Read `docs/README.md` for the documentation index; the docs describe hidden mechanics and are spoiler-heavy on purpose. The top-level `README.md` is the player-facing guide and must stay spoiler-free (keep the AI disclosure near its top).

## Status: soft freeze

The game is complete. Do not add new features, content or rules (forms, items, regions, cosmetics, mechanics) unless
the maintainer explicitly asks for that feature in the conversation; if a request would add one, say the game is in a
soft freeze and ask first. In scope: bug fixes, balance fixes, accessibility fixes, fixes for current browsers, and
doc corrections. A full freeze (v1.0) follows the maintainer's device testing. Every rule below still applies.

Exception: the branch `claude/game-egg-differentiation-xkl6x2` (the Netling 2.0 planning and sprite prototype) is not under the freeze, per the maintainer; keep any game-code change there minimal, tested and reported. See `docs/NETLING_2_SKETCH.md` (Handoff).

## Commands

```bash
npm test          # 503 unit tests, Node 22
npm run smoke     # browser test; needs: npm install --no-save playwright && npx playwright install chromium
npm run balance   # lifetime simulations per player archetype (JSON=1, LIVES=n, TRAIT=form; see docs/TESTING.md)
npm run serve     # http://localhost:5174

# Netling 2.0 sprite prototype (prototype/netling2/, not shipped; see docs/NETLING_2_SPRITES.md)
npm run proto:test     # its tests (260)
npm run proto:temper   # the temper tell against 1.0's idle and wearables (measurements, not rules)
npm run proto:balance  # the 2.0 core-rules simulator (prototype/netling2/sim/): lifetime simulations per archetype, same settings as npm run balance plus CLEAR, PREF, PREFBOT, BUGS
npm run proto:audit    # the real sprite audit on Iron's forms (EGG=program, EGG=wetware or EGG=all; proto:audit:program, proto:audit:wetware)
npm run proto:gallery  # generates prototype/netling2/gallery-iron.html, gallery-program.html and gallery-wetware.html (the real gallery on each egg's forms)
```

## Map

- `src/sim.js`: all rules and every tunable number (`CFG`). Pure: `(state, now, rng)`. No DOM, no storage.
- `src/netrun/`: expeditions (`run.js` rules, `map.js`, `regions.js`, `anomalies.js`, `codex.js`, `view.js`).
- `src/ui/`: DOM code; `ui/app.js` holds the shared `app` object, the write gate and `loadAll`.
- `src/storage.js`, `src/sanitize.js`, `src/transfer.js`: everything about persistence and moving saves.
- `prototype/netling2/sim/`: a fork of the simulator, netrun rules and balance bot with the core 2.0 rules (Standing, temper, bugs, the clinic, the egg pressures `SIDES` and `IRON`); `npm run proto:balance`, see `docs/netling2-prototypes/README.md`. `src/` is untouched by it.
- `prototype/netling2/`: the Netling 2.0 sprite prototype. Not shipped, not in `sw.js`. Import `ready.js` first in any script that draws wearables on its forms (see the trap in `docs/NETLING_2_SPRITES.md`, Commands).
- `sw.js`: network-first service worker with a hand-written `SHELL` file list. Its `CACHE` name must equal `VERSION` in `src/version.js`; bump both per release so open pages are offered the update.

## Rules that are easy to break

1. **Ids are permanent** (fragments, items, forms, accessories, cosmetics, regions, event types, storage keys). Saves store them and the sanitizer drops unknown ones.
2. **Save format**: an added field only needs a default in `createScript`, `migrate` and `cleanSave`. A rename or restructure must bump `SAVE_VERSION` and add a step in `src/migrations.js` (rules in `docs/DATA_AND_SAVES.md`). Never edit an old step or `tests/fixtures/save-v1.json`.
3. **New source files go in `sw.js` `SHELL`**; `npm test` checks the modules (assets like fonts you must remember yourself).
4. **Never call `localStorage` directly** (except the lease); use `store` so the write gate applies. Use `now()` from `ui/app.js`, not `Date.now()`.
5. **Treat stored and imported data as hostile**: new values need a `clean*` function in `sanitize.js`.
6. **Keep `sim.js` and `netrun/run.js` pure** so tests and the balance tools can drive them.
7. **Nothing flashes more than three times a second**, in any motion setting: strobes toggle no faster than `FLASH_TOGGLE_MS` (`games/common.js`), and `tests/draw.test.js` checks the home screen.
8. The field manual (`ui/onboarding.js`) is generated from `CFG`; prose docs are not, so update `docs/` when numbers change.

## Workflow

- Develop on the branch you are given; do not open a pull request unless asked.
- Say plainly what you did not run (the smoke test in particular, which needs Playwright and a browser).
- Avoid emojis and em dashes in written text.
- Add tests for rule changes (`tests/*.test.js`, deterministic: inject `now` and `rng`; import `./helpers/utc.js` first if the test depends on the time of day).
- When a rule or number changes, regenerate `tools/baseline/` and report what moved with `tools/balance-diff.mjs` (commands in `docs/TESTING.md`).

## Known traps

See `docs/KNOWN_ISSUES.md` for behaviour that is easy to misread and for open questions. Two to know: a nap does not pause an open event's timer while sleep does, and sleep follows the netling's stored `zone`, not the device's hour directly.
