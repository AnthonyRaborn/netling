# Netling documentation

Reference documentation for maintainers and AI sessions. The [top-level README](../README.md) is the player-facing getting-started guide and is deliberately spoiler-free. These documents are not: they describe every hidden rule and secret.

When code and a doc disagree, the code is right: fix the doc.

## Start here

| If you want to... | Read |
|---|---|
| Understand how the app is organised and how it boots | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Know exactly how a rule works (drain, events, evolution, items) | [SIMULATION.md](SIMULATION.md) |
| Know how netruns work (regions, maps, nodes, loot, codex) | [NETRUN.md](NETRUN.md) |
| Change what is stored, or debug a save, transfer code or import | [DATA_AND_SAVES.md](DATA_AND_SAVES.md) |
| Look up a term used in the game or the code | [GLOSSARY.md](GLOSSARY.md) |
| Look up a form, item, accessory, cosmetic or lore text (spoilers) | [CONTENT_CATALOG.md](CONTENT_CATALOG.md) |
| Add a feature safely | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Run or write tests, or use the balance tools | [TESTING.md](TESTING.md) |
| See known bugs, risks and open questions | [KNOWN_ISSUES.md](KNOWN_ISSUES.md) |
| See what the balance passes changed and what is still open | [BALANCE.md](BALANCE.md) |
| Look up the opt-in rewards for attentive players (requests, visitors, flow, chatter) | [ATTENTION.md](ATTENTION.md) |
| Look up the background music (tracks, variants, unlocks, how it plays) | [MUSIC.md](MUSIC.md) |
| Review the art (forms, wearables, props, icons, crests) and see what is open | [SPRITES.md](SPRITES.md) |
| Plan native apps and store releases | [PLATFORMS.md](PLATFORMS.md) |

## The project in one paragraph

Netling is a Tamagotchi-style pet that runs in real time in the browser. A pure simulation (`src/sim.js`) advances one minute per step from a saved timestamp, so it keeps living while closed. The player feeds, plays with, patches, cools and rests it, answers timed events, and sends it on netruns (node-map expeditions). Its adult form is chosen by two hidden axes. When it dies it leaves a fragment that shapes the next generation. Everything is stored in `localStorage`, and a save can be moved between devices as a compressed code. The game is vanilla ES modules with no build step and installs as a PWA.

## Numbers at a glance

- About 13,600 lines of code, tests and markup in 74 tracked files (before these docs); 36 unit test files (363 tests) and a 66-scenario browser smoke test.
- 9 forms (Bitling, Kernel, Stub, Shell, Chrome, Firewall, Daemon, Glitch, Ghost), 9 items, 4 mini-games, 5 netrun regions plus a tutorial, 22 codex fragments, 28 style items (24 accessories, 4 props), 47 cosmetics (9 shells, 8 tints, 9 effects, 8 sounds, 6 crests, 7 music tracks) plus a device label, 50 chatter lines.
- Life: up to 5 days; teen at 17 hours; adult at 51 hours (netlings compiled before this keep 7 days, 24 and 72); 10 care mistakes end it.

## Keeping these docs true

- Numbers in prose (drain rates, chances, windows) come from `CFG`, `ITEM_CFG` and `RUN_CFG`. If you change one, search these docs for the old number.
- The in-game field manual is generated from `CFG`, so it cannot drift. These documents can.
- New findings and open questions go in [KNOWN_ISSUES.md](KNOWN_ISSUES.md).
- Content tables in [CONTENT_CATALOG.md](CONTENT_CATALOG.md) are copied from code and should be regenerated or re-checked after content changes.
