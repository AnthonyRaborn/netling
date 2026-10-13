# Netling 2.0: start here

Netling 2.0 is a planned separate app (three eggs plus a hidden fourth) with a sprite prototype and a rules simulator in this repository. There is **no 2.0 game code**; everything runs in `prototype/netling2/`, which is not shipped and not in `sw.js`. These docs are spoiler-heavy on purpose. The player-facing `README.md` stays spoiler-free.

Status: planning and prototype. Decisions are the maintainer's; numbers come from scripted bots and are starting values. Soft freeze applies to 1.0 only; the 2.0 branch `claude/game-egg-differentiation-xkl6x2` is not frozen (see the root `CLAUDE.md`).

## Read in this order

| Need | File |
|---|---|
| What is decided (rules, forms, eggs, Rogue, stage care, netrun) | [DESIGN.md](DESIGN.md) |
| What is open, what to do next, what needs the maintainer | [OPEN_ITEMS.md](OPEN_ITEMS.md) |
| Sprite work: status, commands, rules the tests enforce, what is left | [SPRITES_HANDOFF.md](SPRITES_HANDOFF.md) |
| How the apps ship (Capacitor, Tauri, forecast notifications, widget) | [DEPLOY.md](DEPLOY.md) |
| UI design (phone portrait first, decided against proposed) | [UI.md](UI.md) |
| Run or understand the simulator fork and its limits | [../netling2-prototypes/README.md](../netling2-prototypes/README.md) |
| Re-run the 1000-life baseline | [../../prototype/netling2/baseline/README.md](../../prototype/netling2/baseline/README.md) |
| Drafted wording awaiting the maintainer's review (page text, care wording, Rogue text) | [text/](text/) |
| Why something was decided, rejected options, long measurements | [../archive/netling2/](../archive/netling2/README.md) |

Prototype code has its own short guide for AI sessions: `prototype/netling2/CLAUDE.md` (loaded automatically when you work there).

## Working rules for these docs

- **One owner per fact.** A decision lives in DESIGN.md (or the owning handoff). Do not copy numbers into several files; link instead. Measurement logs go in the archive, with a one-line result in DESIGN.md.
- **Mark status.** Each file opens with a status line (what it is, date, whether decided). Mark unconfirmed items **Proposal**; say plainly what was not run or verified.
- **Keep handoffs current-state only.** History, rejected options and round-by-round narrative go to `../archive/netling2/`. When a task finishes, move its outcome into the owning file and delete it from OPEN_ITEMS.md.
- **Ids are permanent** once the app uses them: use form ids (`eggLevelRoleLean`), not display names.
- Prefer short files with a clear purpose over one long record. A doc over about 30 KB should be split or have its history archived.
- Say plainly what was not run (the smoke test needs Playwright and a browser; there is no device check). Avoid emojis and em dashes.
- Do not open a pull request unless asked. 2.0 work goes on the integration branch `claude/game-egg-differentiation-xkl6x2`; session branches are kept current with it.
