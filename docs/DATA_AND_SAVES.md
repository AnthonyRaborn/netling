# Data, saves and transfer

Everything Netling stores lives in the browser's `localStorage`. There is no server. This file covers the keys, the shape of each value, how loading repairs data, how a transfer code is built, and test mode's separate storage.

Files: `src/storage.js` (the store), `src/sanitize.js` (cleaning), `src/transfer.js` (codes), `src/qr.js` (QR), `src/ui/app.js` (loading and the write gate), `src/ui/system.js` (the transfer UI).

## Contents

1. [Storage keys](#storage-keys)
2. [The netling save](#the-netling-save)
3. [Other stored values](#other-stored-values)
4. [The write gate](#the-write-gate)
5. [Loading pipeline](#loading-pipeline)
6. [Sanitizing rules](#sanitizing-rules)
7. [Versioning and migration](#versioning-and-migration)
8. [Transfer codes](#transfer-codes)
9. [Transfer out, the lock, and importing](#transfer-out-the-lock-and-importing)
10. [QR codes](#qr-codes)
11. [Test mode](#test-mode)
12. [Dev mode](#dev-mode)

## Storage keys

`KEYS` in `storage.js` is the single list. Nothing else should hard-code a key string (one exception: `applyImport` builds `netling.<name>` for the transferable keys).

| Key | Value | Transfers | Notes |
|---|---|---|---|
| `netling.save` | The live netling | yes | Written by the caretaker tab: on every action, at most every 5 seconds by the clock, and when the page is hidden or closing |
| `netling.lineage` | Array of death records | yes | Appended on flatline by `ui/life.js` only |
| `netling.dex` | Array of species ids seen | yes | Ids in `SPECIES` |
| `netling.codex` | Array of fragment ids found | yes | Ids in `FRAGMENTS` |
| `netling.wardrobe` | Equipped cosmetics | yes | See below |
| `netling.progress` | Counters and streaks | yes | See below |
| `netling.unlocked` | Array of unlocked style ids | yes | `slot:id` strings, plus `label` |
| `netling.accessories` | Array of owned accessory and prop ids | yes | Ids in `STYLE_ITEMS` |
| `netling.prefs` | `{ sound, alerts, volume, awake, motion }` (`motion`: `auto`, `reduce` or `full`) | yes | |
| `netling.onboarding` | `intro`, `readme`, `nudge`, `tutorial` or `done` | yes | |
| `netling.helpSeen` | `true` | yes | |
| `netling.lock` | `{ code, at, generation }` | no | Present while the netling is on another device |
| `netling.devSkew` | Number of ms | no | Only read in dev or test mode |
| `netling.iosHintSeen` | `true` | no | The one-time Add to Home Screen prompt |
| `netling.corruptSave` | `{ at, raw }` | no | An unreadable save set aside, never overwritten |
| `netling.preUpgrade` | `{ at, from, raw }` | no | The save as it was before an upgrade step changed it (last upgrade only) |
| `netling.tabLease` | `{ id, at }` | no | Written by `lease.js` directly, bypassing the gate |
| `netling.testMode` | `{ on, revealed, speed }` | no | Always in the real namespace |
| `netling.testClock` | `{ simAt, realAt, speed }` | no | In the test namespace while test mode is on |

## The netling save

Built by `createScript()` in `sim.js`. Fields:

| Field | Type | Notes |
|---|---|---|
| `saveVersion` | number | Always `1` today (`SAVE_VERSION`) |
| `generation` | int | 1-based, shown as `v<generation>.0` |
| `life` | `{ teenAt, adultAt, lifespan }` | Minutes, fixed at compile from `CFG`. Missing (a save from before the 5-day life), out of order or over 7 days: the 7-day `LEGACY_LIFE` |
| `newForms` | string[] | Adult forms the player had never raised at compile (tie-break weights). Unknown ids dropped |
| `stage`, `form`, `teenForm` | strings | `teenForm` is `kernel` or `stub` once reached |
| `evolvedAt`, `bornAt`, `lastTick`, `diedAt` | ms epoch | `lastTick` is clamped to "now" when loading |
| `ageMin` | int | Simulated minutes. Excludes hibernation |
| `stats` | `{ charge, sync, integrity, heat }` | 0..100 floats |
| `cache`, `virus`, `virusMin`, `sinceFed` | | See [SIMULATION.md](SIMULATION.md) |
| `asleep`, `lightsOn`, `nap`, `lastNapEndAge` | | `nap` is `{ startedAge }` or `null` |
| `rebootUntilAge` | number or null | Age at which a crash reboot ends |
| `careMistakes`, `zeroMin`, `flagged`, `integrityZeroMin` | | Mistake bookkeeping |
| `axes` | `{ allegiance, stability }` | Hidden numbers |
| `games` | `{ breach, dodge, tune, feast }` each `{ played, won }` | |
| `event` | `{ type, startedAge }` or null | `trace`, `attack` or `overflow` |
| `lastSurgeAt` | ms epoch or null | Drives the surge flash |
| `inventory` | array of item ids | Max 6 |
| `scrip` | int | Corpo scrip, 0..100. Missing: 0 |
| `zone` | int -840..840 | The time zone its sleep follows, in minutes as `getTimezoneOffset` gives it; refreshed when it wakes. Missing or junk: the device's zone |
| `buffs` | `{ shieldUntilAge, traceSkip, boost }` | |
| `run` | the netrun or null | Cleaned by `cleanRun` |
| `rootAccess`, `rootUsed`, `rootCooling` | booleans | |
| `lastRunEndAge`, `runCooldownCut`, `runStats` | | Uplink cooldown state and lifetime counts for this netling |
| `cleared` | region ids | Regions whose exit this netling reached, in `REGION_ORDER` order. Unknown ids and repeats dropped. Missing (a save from before the unlock order): every region its stage can enter (`clearedForStage`) |
| `codexFound` | int | New codex fragments banked this life (the per-life cap). Missing: 0 |
| `visit`, `visitAccGifts` | | A visitor in progress (`greeted: true` once GREET is used); pending accessory gifts (max 10) |
| `request` | `{ kind: 'game', game, startedAge }`, `{ kind: 'cool', startedAge }` or null | What it is asking for. Unknown kinds or games: null. Missing: null |
| `flowMin`, `flowTotalMin` | int | Minutes in a row in good shape (flow at 180), and minutes in flow this life. Missing: 0 |
| `chatter` | `{ id, startedAge }` or null | The chatter line on screen. Unknown ids: null. Missing: null |
| `hibernation`, `lastWakeAt` | `{ since }` ms, ms | Wall-clock values |
| `trait`, `inheritedQuirk`, `quirk` | | `quirk` has palette, pitch, idle, favPacket, sleepOffset |
| `traitLevel`, `history` | int 1..3, trait id or null | The trait's level (a streak of that form) and the grandparent's trait at half strength. Missing (older saves): 1 and null |
| `log` | `[{ t, msg }]` | Capped at 50 lines |
| `deathCause`, `fragment` | | Set on death; `fragment` is `{ form, trait, quirk, keepsake, rootUsed, scrip, level, history }`, where `level` is 1..3 (1 for older fragments), `history` the dying netling's own trait, and `scrip` the inheritance (half, rounded down; cleaned to 0..50) |
| `codexInbox`, `accessoryInbox` | arrays of ids | Finds waiting for the UI to bank them into the shared codex and wardrobe |

The netling belongs to one generation. Everything shared across generations (lineage, dex, codex, wardrobe, unlocks, accessories, progress) is stored separately.

## Other stored values

**Lineage record** (`deathRecord` in `archive.js`): `generation, form, realized, teenForm, cause, ageMin, mistakes, trait, traitLevel, history, fragmentTrait, fragmentLevel, keepsake, rescued, palette, bornAt, diedAt`. Older records may lack fields; the sanitizer, `lineageRows` and `lineageChain` tolerate that.

**Wardrobe**: `shell`, `tint`, `effect`, `sound`, `crest` (ids from `COSMETICS`; a missing slot uses its default, so `crest` needed no migration), `accessory` and `prop` (a style id or `none`), `label` (up to 10 characters from `A-Z 0-9 space . -`), and `colors` (per-accessory arrays with one entry per color slot: a `#rrggbb` the player picked, or `null` for automatic, meaning the wearable's color for the netling's palette, see `accessoryColors`). Old saves hold concrete hex values, which stay as the player's picks; the cleaner turns anything that is not a `#rrggbb` into `null`. No version bump: the value domain widened, the shape did not.

**Progress**: `runs` (counts by result), `streaks` (per game `{ cur, best }`, PLAY games only), `acts` (counts of care actions: corp, scav, patch, purge, hide, comply and others), `gamesPlayed` (PLAY games plus netrun ICE fights), `cleanJackouts`, `deepExits`, `requestsMet`, `visitorsGreeted`, `flowMin` (minutes in flow of lives that have ended; the living netling's `flowTotalMin` is added for the Aurora check), `chatter` (heard line ids, unknown ones dropped), and `rootEarned` (true once Root Access has been earned; absent otherwise).

## The write gate

All writes go through `createStore(...).canWrite`, defined in `ui/app.js`:

```
canWrite(key) = app.claimed && !app.inactive && !app.leaving
                && (!app.lock || key === null || key in WRITABLE_WHILE_LOCKED)
```

- `claimed`: this tab won the caretaker role (see [ARCHITECTURE.md](ARCHITECTURE.md#one-active-tab)). Until it is decided, storage is read-only.
- `inactive`: another tab is the caretaker.
- `leaving`: a reload is coming (import, restart, takeover), so stale in-memory state must not be saved.
- While locked (the netling is on another device) only settings may change: `lock`, `prefs`, `iosHintSeen`, `corruptSave`, `testMode`.
- A `null` key means a bulk operation (`setAll`, `clearAll`); those are refused only for the first three reasons.

Failures never throw. `set` returns `false` and calls `onError`, which flashes a warning at most once a minute and marks `app.writeFailed`. `setAll` is all-or-nothing: it remembers old values and restores them if any write fails. `clearAll` removes only keys in its own namespace.

`sw.js` and `lease.js` use `localStorage` and `caches` directly; the lease deliberately bypasses the gate because it decides who may write.

## Loading pipeline

`loadAll()` in `ui/app.js` reads and repairs everything and writes nothing (the tab may not be the caretaker yet):

1. Read every key through its `clean*` function (`cleanCodex`, `cleanLineage`, `cleanDex`, ...).
2. Read the raw save. `cleanSave` returns a repaired netling or `null`.
3. If the raw save existed but cleaned to `null`, keep the raw text in `app.corruptSave`; `main.js` stores it under `netling.corruptSave` after the caretaker is decided, and SYSTEM offers it as a download. A fresh script is compiled.
4. `migrate(state)` fills any field a newer build added.
5. First launch (no save at all) starts onboarding at `intro`.

`main.js` then decides the caretaker, sets aside a corrupt save, backfills the dex, requests persistent storage, records already-earned unlocks silently, and starts the clock.

## Sanitizing rules

`sanitize.js` treats all stored and imported data as hostile. Principles:

- Every value is rebuilt from known fields. Numbers are clamped (`num`, `int`), strings truncated, ids checked against the real tables (`has(table, id)` uses `Object.hasOwn`, so `__proto__` is not a valid id).
- `cleanSave` first upgrades the save to the current version (see below), then refuses it only when it cannot be upgraded or has an unknown stage or form. Anything else is repaired to a safe default.
- `lastTick` is clamped to `[0, now]`; a future value (clock set back) would otherwise freeze the netling.
- **Non-strict** (local storage): unknown fields are kept (`...raw`), so a newer build's data survives a downgrade.
- **Strict** (imported codes): only known fields survive.
- `cleanRun` validates the map graph, drops a broken pending choice or ICE, refuses a run stuck at a dead end, and checks market choices ("rejected, not clamped: a price of 0 would mean free"). Loose scrip carried in a run (`run.scrip`) is cleaned to 0..1000, and `run.insured` (Chrome's corp insurance, spent) to a boolean.
- Fragments are rebuilt from the dead netling if the stored one is unusable.
- `settle()` then makes the parts agree: the form is set to fit the stage (a baby is a Bitling, a teen Kernel, Stub or Shell, an adult an adult form chosen by `leaningForm`; a dead netling keeps whatever body it had), and timers that start in the future (run and nap cooldowns, an open event, hibernation) are clamped to the netling's own past or to now. Other cross-field consistency is not checked.

## Versioning and migration

The netling save carries `saveVersion` (`SAVE_VERSION` in `sim.js`, currently 1). Two mechanisms keep old saves working, for two kinds of change:

| Kind of change | Mechanism | Version bump |
|---|---|---|
| **Additive**: a new field with a default (nap, visitors, hibernation, Packet Feast were all like this) | `migrate()` in `sim.js` fills it with `??=`, and `cleanSave` defaults it | No |
| **Structural**: rename, retype, split, merge or reinterpret a field | A step in `STEPS` in `src/migrations.js` | Yes: bump `SAVE_VERSION` |

### How upgrading works

`cleanSave` starts by calling `upgradeSave(raw)` (`migrations.js`). It works on a private copy and runs `STEPS[v]` for each version from the save's own up to `SAVE_VERSION`, setting `saveVersion` after each step. The result then goes through the normal field-by-field cleaning. So a save from any earlier version loads, as long as no step was ever removed.

`upgradeSave` returns an error instead of guessing:

| Error | When | What the game does |
|---|---|---|
| `invalid` | Not an object, or `saveVersion` is not an integer of at least 1 | Set aside as unreadable |
| `newer` | Saved by a newer build than this one | Set aside, with the notice "was saved by a newer version of the game (reload to update)". An import code says "made by a newer version of Netling" |
| `failed` | A step is missing or throws or returns junk | Set aside as unreadable |

"Set aside" means the raw text is kept under `netling.corruptSave` (SYSTEM offers it as a download) and a new netling compiles. The newer-version case is unlikely to happen to a real player because the service worker is network-first, but a transfer code carried from a newer install can trigger it.

### Safety net

When a local save was upgraded on load, `main.js` stores its pre-upgrade text as `netling.preUpgrade` (`{ at, from, raw }`), so a bad step can be recovered by hand. There is no UI for it yet. It holds the last upgrade only, and is removed by RESTART.

### Rules for a structural change

1. Bump `SAVE_VERSION` in `sim.js`.
2. Add `STEPS[<old version>]` in `migrations.js`. It receives the old shape and returns the new one. It must tolerate missing or wrong-typed fields (`cleanSave` repairs the result, but a step that throws sends the save to the set-aside path).
3. Update `createScript`, `migrate` and `cleanSave` for the new shape.
4. **Never edit or delete an old step**, and never regenerate `tests/fixtures/save-v1.json`. `tests/migrations.test.js` loads that frozen version 1 save through the whole chain; add a frozen fixture for each new version too, so every historical shape keeps being tested.
5. Add a test for the new step with a before and after example.
6. Transfer codes carry the save, so old codes upgrade through the same path. The code wrapper (`payload.v`, currently 1) is a separate format number: change it only if the wrapper itself changes.

### Other stored values

Only the netling save is versioned. Lineage, dex, codex, wardrobe, progress, unlocked, accessories and prefs are lists of ids and small records that the cleaners rebuild leniently, so additive changes need no migration. If one of them ever changes shape in a way a cleaner cannot absorb, add the upgrade inside that value's `clean*` function and note it here (or introduce a data version key then).

## Transfer codes

Format: `NL1.<base64url(deflate-raw(JSON))>.<crc32 hex>`

Payload: `{ v: 1, exportedAt, data: { <transferable keys> } }`.

Encoding (`encodeSave`):

1. `collectData()` in `ui/system.js` gathers the current in-memory state (not storage, which may be stale after a failed write) and keeps only the last 10 log lines to shrink the code.
2. `JSON.stringify` with a replacer that rounds fractional numbers to 2 decimals (long float tails do not compress).
3. Compress with the browser's `CompressionStream('deflate-raw')`.
4. Base64url, then append an 8-hex-digit CRC-32 of the uncompressed JSON.

Decoding (`decodeSave`) throws `TransferError` with a player-facing message at each step:

| Check | Message |
|---|---|
| More than 512 K characters | "far too long to be a netling code" |
| Not three dot-separated parts, or prefix not `NL1` | "doesn't look like a netling code" |
| Decompression fails or exceeds 4 MB | "the code is damaged" |
| CRC mismatch, or JSON parse fails | "the code is damaged" |
| `v` is not 1 or `data` is not an object | "different version" |
| `data.save` fails strict `cleanSave` | "has no netling in it" |

Whitespace anywhere in the pasted code is ignored. Each other key is passed through its cleaner (`CLEANERS`); a key that cleans to `null` is dropped.

`describeSave` builds the preview shown before loading: netling label, generations (lineage length + 1), dex count, codex count, style count, and the export time.

## Transfer out, the lock, and importing

**Transfer out** (`ARCHIVE > SYSTEM > TRANSFER OUT`):

- Refused while a mini-game or netrun is running, and in test mode.
- Needs a second press (`armed`) within 4 seconds.
- Encodes the state, then writes `netling.lock` with `{ code, at, generation }`. If that write fails the transfer is cancelled ("nothing was transferred").
- The lock screen (`showLock`) then covers the game. `advance()` returns early while locked, so the netling stops aging on this device. It offers the code and a QR, COPY, DOWNLOAD, RE-EXPORT (redraw the same code), RELOAD (load a code here, including its own) and RESTART.

**The lock is not copy protection.** Codes are self-contained and offline; nothing marks one as used. The same code loads on any number of devices, and the source device can reload it.

**Import** (`checkImport`, `applyImport`):

1. Decode and preview. The player must confirm ("REPLACE THIS DEVICE", or "LOAD AND UNLOCK" when locked).
2. `store.setAll` writes every transferable key in one all-or-nothing batch. Keys missing from the code are removed, so the import replaces everything. It also clears `lock` and resets `devSkew`.
3. `app.leaving = true`, then a reload into the imported data.

A scanned QR opens the game with `#import=<code>`; `importFromUrl()` removes the fragment from the address bar and opens the preview. The fragment is never sent to a server.

The imported netling's `lastTick` is clamped to now, so it keeps aging in real time from the moment it was exported. Time in transit counts.

## QR codes

`qr.js` is a dependency-free encoder: byte mode, error correction level L, versions 1 to 40, all eight masks scored by the standard penalty rules. `encodeQR(text)` throws when the text does not fit. The lock screen QR encodes `origin + pathname + #import=<code>`; if the code is too big for a QR, the QR is hidden and the code still works.

## Test mode

Test mode is a second, separate game on the same device for playtesting.

- Reveal: tap the NETLING logo 7 times within 4 seconds, then `ARCHIVE > SYSTEM > TEST MODE`.
- `netling.testMode` (`{ on, revealed, speed }`) is always read from the real namespace. Entering or leaving reloads the page.
- While on, the store uses the **`netling-test.`** prefix (`TEST_PREFIX`). It does not start with `netling.`, so the real `clearAll` cannot see it and a test RESTART cannot reach real data.
- The clock: `now = simAt + (Date.now() - realAt) * speed`, speeds 1x, 24x (a day per hour) or 168x (a full life per hour). Leaving test mode stores `realAt: null` (paused), so the test netling resumes where it stopped.
- Test mode turns on the dev buttons (`DEV = DEV_URL || TEST`), disables transfer out, and shows a yellow `TEST <speed>x` badge.
- The care mistake grace is in simulated minutes: at 168x it is about 5 real seconds.
- The tab lease key (`netling.tabLease`) is always in the real namespace, so the two modes share the one-active-tab rule.

## Dev mode

Add `?dev` to the URL. `app.skew` (stored in `netling.devSkew`) is added to "now". The dev bar has time-skip buttons, forced evolution, and forced trace, intrusion and overflow events, plus RESET, which replays onboarding with a new script. Skew is only read when dev or test mode is on.
