# Contributing and extending

How to change Netling without breaking saves, plus checklists for the common additions. Written for a maintainer or an AI session. Written against commit `ea87757`.

Read [ARCHITECTURE.md](ARCHITECTURE.md) first for the layout and [DATA_AND_SAVES.md](DATA_AND_SAVES.md) for what is persisted.

## Ground rules

1. **Ids are permanent once shipped.** Saved data stores ids, and the sanitizer drops any id it does not know, so removing or renaming one silently deletes a player's progress. This applies to: codex fragment ids, item ids, species and form ids, accessory and prop ids, cosmetic ids (unlock strings are `slot:id`), region ids (a stored run names its region), quirk keys, event types, and storage keys. Add new ones; retire old ones by hiding them, never by deleting.
2. **Adding a save field is safe; changing one is not.** New field: give it a default in `createScript`, `migrate` (`??=`) and `cleanSave`. Renaming, retyping or restructuring needs a real migration and a version bump, and there is no upgrade path yet (see [KNOWN_ISSUES.md](KNOWN_ISSUES.md#ki-02)). Do not bump `SAVE_VERSION` without adding one.
3. **Keep the simulation pure.** No DOM, no storage, no `Date.now()` or `Math.random()` inside `sim.js` or `netrun/run.js`. Take `now` and `rng` as arguments.
4. **All storage goes through `store`.** Never call `localStorage` directly (the lease is the one exception). Use `store.set` and check its return value where the result matters.
5. **Treat stored and imported data as hostile.** New stored values need a `clean*` function in `sanitize.js`, and imported ones must survive strict cleaning.
6. **Use `now()` from `ui/app.js` in UI code**, not `Date.now()`, so test mode's clock works.
7. **Add new files to `sw.js` `SHELL`.** `npm test` fails until you do. Keep all paths relative so a `/netling/` subpath works.
8. **No build step, no dependencies.** Plain ES modules with explicit `.js` extensions in imports.
9. **Do not import at the top level of `ui/` modules in a way that runs code at load.** The `ui/` modules import each other in cycles and rely on only calling functions later.
10. **Do not put spoilers in the README.** Hidden mechanics belong in `docs/`.

### Style

The code has no linter or formatter configured. Match what is there: 2-space indent, single quotes, semicolons, `const` arrow helpers, short comments that say why. Log lines in the pet's log start with `> ` and are lowercase, with `!!` for warnings. Button labels are uppercase. In user-facing text, avoid em dashes (the project's docs follow this too).

## Before you push

1. `npm test` (must pass).
2. If you changed UI, storage, the service worker or anything visible: `npm run smoke` (needs Playwright).
3. If you changed rules or numbers: `npm run balance` and compare with the targets in [TESTING.md](TESTING.md#balance-tools).
4. If you changed files loaded by the game: consider bumping `CACHE` in `sw.js`.
5. If you changed a number that the README or docs quote, update the docs. The field manual is generated from `CFG`, so it stays right by itself; prose docs do not.

## Checklists

### Change a rule number

Edit `CFG` (or `ITEM_CFG`, `RUN_CFG`). The field manual updates itself. Run the balance tool with `CFG='{...}'` first to see the effect without editing. Update [SIMULATION.md](SIMULATION.md) if a documented number changed.

### Add an item

1. `ITEMS` in `sim.js` (name, description, `awake: true` if it needs the netling awake).
2. A `case` in `useItem`, and any block rule in `itemBlockReason`.
3. Add it to the `DROPS` tables it should appear in, and to region `loot` or `market` tables in `netrun/regions.js`.
4. Art: `ITEM_SPRITES` (7x7 rows) and `ITEM_COLORS` in `sprites.js`.
5. Optional reaction animation in `ITEM_ANIMS` (`ui/hud.js`).
6. A test in `tests/items.test.js`. The sanitizer picks the item up automatically because it validates against `ITEMS`.

### Add a mini-game

1. `src/games/<id>.js`: a class with static `id`, `title`, `hint`, `winText`, `loseText`; constructor `(rng, sound)`; `input(key)`, `update(dt)`, `draw(ctx, pal, time)`; `done` and `won`. Draw on the 400x280 canvas with `common.js` helpers. Take all randomness from `rng`.
2. Register it in `GAMES` (`games/session.js`).
3. Add its id to `GAME_IDS` in `sim.js`. This automatically extends save cleaning, `migrate`, the netrun ICE pool, and the Ghost requirement (4 wins in every game).
4. Add a button to the `#picker` nav in `index.html` (`data-game="<id>"`).
5. Add the file to `SHELL` in `sw.js`.
6. Consider a streak cosmetic in `cosmetics.js` and a row in `renderRecord` (`ui/archive.js`, which currently omits Feast, see KI-04).
7. Tests in `tests/games.test.js`.

### Add a form

1. `SPECIES` (and `FORMS` if adult, with its trait), `TRAITS`, `FORM_MODS`, `KEEPSAKES` in `sim.js`.
2. Sprites in `sprites.js`: `<form>A`, `<form>B`, and optionally `<form>Sleep` and `<form>Dead` (missing poses fall back to `A`). Use `#`, `o`, `+`, `.`.
3. The rule that selects it in `leaningForm`, and its netrun ability in `FORM_ABILITIES` and `visibleNodeIds` or the relevant case in `netrun/run.js`.
4. Dex entries in `archive.js`: `DEX_ORDER`, `DEX_HINTS`, `DEX_LORE`.
5. A shell cosmetic unlocked by discovering it (`cosmetics.js`) if wanted.
6. Update `gallery.html` if it lists forms by hand, the balance tool's adult tallies, and tests (`sim.test.js`, `archive.test.js`, `accessories.test.js` already loops over all forms).

### Add an accessory or prop

Add an entry to `ACCESSORIES` (or `PROPS`) in `accessories.js`: `id`, `name`, `rarity` (`common`, `rare`, `veryrare`), optional `regions`, optional `source: 'earned'`, optional `hint`, optional `colors: [[label, default]]`, and `draw(px, anchors, frame, time, colors)`. Draw relative to the anchors (`headTop`, `eyeRow`, `cx`, ...), never fixed coordinates, so it fits every form. `tests/accessories.test.js` renders every accessory on every form and checks a sane margin. Earned items need a grant in the UI (`grantStyle`).

### Add a netrun region

1. `REGIONS` and `REGION_ORDER` in `netrun/regions.js`: name, blurb, `minStage`, optional `requires` (a codex fragment id), `layers`, `width`, `nodes` weights, `loot`, optional `market` and `marketPrice`, `iceDamage`, `exitBonus`, `palette`, `sound`.
2. Codex fragments for it (below), a tint cosmetic that unlocks on finishing them, and possibly regional accessories.
3. `tests/netrun.test.js` already checks every region generates valid maps; add access-rule tests.
4. Regions are stored by id inside a saved run, so the id must never change.

### Add a codex fragment

Append to `FRAGMENTS` in `netrun/codex.js` with a unique id of the form `<region>-<n>`. Position in the array is drop order. **Warning:** `codexComplete()` requires every fragment, so adding one makes players who already completed the codex incomplete again. New netlings will compile without Root Access until they find it, and the NL-0 transmission will play again when they do (KI-18). Decide whether that is intended before shipping.

### Add an anomaly

Add an object to `ANOMALIES` in `netrun/anomalies.js` with two or more `options`, each with `id`, `label`, `hint` and `apply(ctx)`, where `ctx` provides `pet`, `run`, `rng`, `loot()`, `hurt(n, why)`, `lean(allegiance, stability)`, `reveal(depth)` and `fragment(chance)`. Return the log text. The sanitizer and the option checks read from this list, so a stored anomaly keeps working.

### Add a timed event

Events are the most cross-cutting addition. Touch: `EVENTS` and its CFG numbers in `sim.js`; the roll and the ignored outcome in `stepEvents`; the answer in `act` and `blockReason`; `alertReason` and `needsAttention`; the event bar buttons in `index.html` and their `data-event` handling in `ui/hud.js`; an icon in `render.js` `EVENT_ICONS`; the field manual text in `ui/onboarding.js`; `hibernateBlockReason` already blocks on any event. `sanitize.js` accepts only types in `EVENTS`. Add tests in `tests/events.test.js`.

### Add a cosmetic

Add to the slot's list in `cosmetics.js` with `id`, `name`, and either `free: true` or a `hint` and a `check(ctx)` over `{ dex, codex, lineage, generation, progress }`. A tint needs `lcd` and `dark` colors; a shell needs a `.device.shell-<id>` rule and an effect a `.screen.fx-<id>` rule in `style.css` (`applyWardrobe` in `ui/style.js` sets those classes); a sound needs `wave` and `mult`. Unlock ids (`slot:id`) are stored, so never rename. Unlocks are never revoked once stored.

### Add a UI element

Add the markup to `index.html` with an `id`, then wire it in the matching `init...` function of a `ui/` module using `$('id')`. Buttons that must not fire by accident use `armed(btn, confirmLabel, idleLabel)`. Dialogs use `<dialog>` with `showModal()`, which the gamepad code already navigates.

### Add a stored value

Add a key to `KEYS` (`storage.js`), a `clean*` function and, if it should travel, entries in `CLEANERS` (`sanitize.js`) and `TRANSFER_KEYS` (`transfer.js`) plus `collectData()` in `ui/system.js`. Decide whether it may change while the device is locked (`WRITABLE_WHILE_LOCKED` in `ui/app.js`). Load it in `loadAll()`. Add tests in `tests/sanitize.test.js` and `tests/transfer.test.js`.

## Releasing

There is no versioned release process. Pushing to `main` with green tests deploys to GitHub Pages. The service worker is network-first, so players get new files on their next online launch. Bump `CACHE` in `sw.js` when you want old caches dropped. Tier 2 native builds ([PLATFORMS.md](PLATFORMS.md)) are not built.

## Working with AI sessions

- Start from `CLAUDE.md` at the repository root, then the doc for the area you are changing.
- Sessions on a feature branch should not open a pull request unless asked.
- Say when you have not run something (for example the smoke test). [KNOWN_ISSUES.md](KNOWN_ISSUES.md) uses "Reproduced", "Read" and "Unverified" for that reason.
