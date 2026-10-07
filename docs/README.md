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
| Run the device checks that come before the full freeze | [DEVICE_PASS.md](DEVICE_PASS.md) |
| See what the balance passes changed and what is still open | [BALANCE.md](BALANCE.md) |
| Look up the opt-in rewards for attentive players (requests, visitors, flow, chatter) | [ATTENTION.md](ATTENTION.md) |
| Look up the background music (tracks, variants, unlocks, how it plays) | [MUSIC.md](MUSIC.md) |
| Review the art (forms, wearables, props, icons, crests) and see what is open | [SPRITES.md](SPRITES.md) |
| Plan native apps and store releases | [PLATFORMS.md](PLATFORMS.md) |
| Read how the Mainframe stage and the Source were decided, built and measured | [SOURCE_PLAN.md](SOURCE_PLAN.md) |
| Read the second-egg reference review (Jargon File, CP2020 slang, FDA glossary) | [SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md) |
| Continue the Netling 2.0 planning (separate app, three eggs) | [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) |
| Review or continue the Netling 2.0 sprites (Iron's and Program's 22 forms each, the audit, the galleries, how to run it; prototype in `prototype/netling2/`) | [NETLING_2_SPRITES.md](NETLING_2_SPRITES.md) |
| Read or edit the Netling 2.0 codex page drafts | [NETLING_2_CODEX_DRAFTS.md](NETLING_2_CODEX_DRAFTS.md) |
| Re-run or inspect the Netling 2.0 rule prototypes (bugs, temper, Standing, care preferences) | [netling2-prototypes/README.md](netling2-prototypes/README.md) |

## The project in one paragraph

Netling is a Tamagotchi-style pet that runs in real time in the browser. A pure simulation (`src/sim.js`) advances one minute per step from a saved timestamp, so it keeps living while closed. The player feeds, plays with, patches, cools and rests it, answers timed events, and sends it on netruns (node-map expeditions). Its adult form is chosen by two hidden axes. When it dies it leaves a fragment that shapes the next generation. Everything is stored in `localStorage`, and a save can be moved between devices as a compressed code. The game is vanilla ES modules with no build step and installs as a PWA.

## Numbers at a glance

- About 13,600 lines of code, tests and markup in 74 tracked files (before these docs); 48 unit test files (500 tests) and an 81-scenario browser smoke test.
- 14 forms (Bitling, Kernel, Stub, Shell, Chrome, Firewall, Daemon, Glitch, Ghost, and the Mainframe forms Plat, Airgap, Init, Panic, Whisper), 9 items, 4 mini-games, 6 netrun regions plus a tutorial and the daily trace, 27 codex fragments, 49 style items (41 accessories, 8 props), 65 cosmetics (15 shells, 10 tints, 12 effects, 8 sounds, 11 crests, 9 music tracks) plus a device label, 52 chatter lines, 4 challenge runs, and an ending.
- Life: up to 5 days; teen at 17 hours; adult at 51 hours (netlings compiled before this keep 7 days, 24 and 72); 10 care mistakes end it.

## Keeping these docs true

- Numbers in prose (drain rates, chances, windows) come from `CFG`, `ITEM_CFG` and `RUN_CFG`. If you change one, search these docs for the old number.
- The in-game field manual is generated from `CFG`, so it cannot drift. These documents can.
- New findings and open questions go in [KNOWN_ISSUES.md](KNOWN_ISSUES.md).
- Content tables in [CONTENT_CATALOG.md](CONTENT_CATALOG.md) are copied from code and should be regenerated or re-checked after content changes.
