# Netling 2.0 prototype: notes for AI sessions

This directory is the Netling 2.0 sprite prototype and rules simulator. It is **not shipped**, not in `sw.js`, and `src/` is untouched by it (one exception: `ROOM` is exported from `src/accessories.js`). There is no 2.0 game code. The 1.0 soft freeze in the root `CLAUDE.md` does not apply here, but keep any change to 1.0 code (`src/`, `tools/`) minimal, tested and reported. Start with `docs/netling2/README.md` (index) and `docs/netling2/DESIGN.md` (decisions); open work is `docs/netling2/OPEN_ITEMS.md`. Long history is in `docs/archive/netling2/`, searchable but not the source of truth.

## Commands

```bash
npm run proto:test       # prototype tests (run it; counts drift)
npm run proto:temper     # the temper tell against 1.0's idle and wearables (measurements, not rules)
npm run proto:balance    # the 2.0 core-rules simulator (sim/): lifetimes per archetype; same settings as npm run balance plus CLEAR, PREF, PREFBOT, BUGS
node prototype/netling2/baseline/run-all.mjs   # the 1000-life baseline into baseline/results (resumable; read baseline/README.md first; NEVER import this file, importing runs it)
npm run proto:audit      # the real sprite audit on Iron's forms (EGG=program|wetware|all|rogue; proto:audit:program, proto:audit:wetware)
npm run proto:gallery    # generates gallery-{iron,program,wetware,rogue}.html (gitignored)
npm run serve            # http://localhost:5174 ; focus review page /prototype/netling2/review.html (forms + one aspect; every setting is in the link)
```

Simulator switches (`NR2=all`, `PERKS=1`, `BRAKE`, `OVERUSE`, `STAGE`, `ROGUE=1`, `SIDES`, `IRON`, ...), the tool map and the model's limits are in `docs/netling2-prototypes/README.md`.

## Rules that are easy to break

1. **Import `ready.js` first** in any script, test or page that draws wearables on prototype forms. `src/accessories.js` builds its anchor table once on first load; without it wearable code silently guesses anchors.
2. **Form ids are `eggLevelRoleLean`** (`ironAdultBreachStreet`) and permanent once the app uses them. Names live only in `form-ids.js`; Rogue names in `ROGUE_NAMES`. Do not rename an id.
3. **`sim/` and the netrun rules stay pure:** `(state, now, rng)`, no DOM, no storage, so tests and bots can drive them. New rules go in as switches that are **off by default**, so every older table stays reproducible; a rule that moves a number needs a test and a re-run (say which tables moved).
4. **Rogue map rules draw their random numbers after the ordinary map's**, so a Rogue map with every lever off equals the ordinary map (tested in `map2`).
5. **Nothing flashes more than three times a second** and no layer changes picture faster than 200 ms (motion layers use 400 ms steps). `render.test.js` checks the composed screen.
6. **Layers are pure functions drawn by `render.js`** (the room, the frame, the tell, neglect, seams, bugs, motion layer, wearables, state marks, prop). Add a layer there, not in a page. The 2.0 LCD is 1.0's 40x28 plus 2 rows of headroom on top (`TOP`).
7. **Do not edit measured outputs by hand.** Keep earlier results under their own names when a rule changes (`results/superseded/`), so a table can be traced to the rules that made it. Never quote an older table without checking its notes.
8. After a palette or sprite change that affects wearable colours, run `node tools/wearable-colors.mjs --write`.
9. The container restarts when idle and kills background jobs: use `setsid nohup`, keep jobs resumable, and wait in the foreground.

## Verification honesty

Say plainly what was not run. Nothing here has been seen on a device or played; `npm run smoke` needs Playwright. Bots are not people: report figures as bot results. For sprite checks launch Chromium with `executablePath: '/opt/pw-browsers/chromium'` and screenshot the focus review page; when a form is contested, render options side by side first (the maintainer reviews from screenshots).

## Keeping the docs current

When you finish something, move its outcome into `docs/netling2/DESIGN.md` (decisions) or the owning handoff (`SPRITES_HANDOFF.md`) and delete it from `OPEN_ITEMS.md`. Put history, rejected options and long measurements in `docs/archive/netling2/`, not in the active files.
