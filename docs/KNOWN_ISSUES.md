# Known issues and risks

Found by reading the code at commit `ea87757` (2026-09-28). Nothing here has been fixed. Each entry says how sure the finding is:

- **Reproduced**: shown with a small Node script against `sim.js` or `run.js`.
- **Read**: derived by reading the code; not run.
- **Unverified**: a suspicion or a gap I could not confirm.

Severity: **Medium** (wrong behaviour a player could hit, or a latent trap), **Low** (cosmetic, rare, or cleanup), **Note** (works as coded, but easy to misunderstand).

Not checked: any behaviour in a real browser (the smoke test needs Playwright, which was not installed for this pass), the Pages deploy, and real-device behaviour (see [PLATFORMS.md](PLATFORMS.md)).

## Summary

| Id | Severity | Confidence | Title | Status |
|---|---|---|---|---|
| [KI-01](#ki-01) | Medium | Reproduced (sim), Read (UI) | A netling can die mid-netrun and leave the run screen bound to the dead one | Fixed |
| [KI-02](#ki-02) | Medium | Read | `SAVE_VERSION` has no migration path: a bump would set aside every save | Open |
| [KI-03](#ki-03) | Low | Read | A DEFEND result is discarded if the intrusion lands while the mini-game is running | Fixed |
| [KI-04](#ki-04) | Low | Read | The Archive's RECORD omits the Packet Feast streak | Fixed |
| [KI-05](#ki-05) | Low | Read | Storage is rewritten every second | Fixed |
| [KI-06](#ki-06) | Low | Read | The "no dependencies" claim ignores the Google Fonts request | Fixed |
| [KI-07](#ki-07) | Low | Read | Import in test mode says it replaces "this device" | Fixed |
| [KI-08](#ki-08) | Low | Read | The sanitizer accepts inconsistent stage and form pairs | Fixed |
| [KI-09](#ki-09) | Low | Read | Docs and comments that disagreed with the code | Open |
| [KI-10](#ki-10) | Low | Read | Duplicated helpers | Fixed |
| [KI-11](#ki-11) | Note | Reproduced | A nap does not hold an open event's timer | Open |
| [KI-12](#ki-12) | Note | Read | Sleep uses the device's local time zone | Open |
| [KI-13](#ki-13) | Note | Read | Time in transit counts when a netling is transferred | Open |
| [KI-14](#ki-14) | Note | Read | Boosted wins count double toward Ghost | Open |
| [KI-15](#ki-15) | Note | Read | Neutral netlings that miss Ghost become Chrome | Open |
| [KI-18](#ki-18) | Note | Read | Adding a codex fragment makes finished codexes incomplete | Open |
| [KI-16](#ki-16) | Gap | Read | Test coverage gaps | Open |
| [KI-17](#ki-17) | Open work | Read | Unfinished platform steps | Open |

## Findings

### KI-01

**A netling can die mid-netrun and leave the run screen bound to the dead one.** Severity Medium.

**Status: Fixed.** `flatline()` now drops the open run, and `advance()` closes any session belonging to a dead or replaced netling (`closeStaleSession` in `ui/play.js`). Covered by two unit tests and a smoke scenario. The description below is the original finding.

- `sim.js` `flatline()` sets the stage to `dead` but never touches `state.run`. Reproduced: a netling with an open run, aged to the last minutes of its life, ticks to `dead` with `run` still set (phase `map`).
- In the UI, `ui/life.js` `advance()` calls `onFlatline()` and shows the flatline overlay, but nothing closes `app.session`. Neither `ui/play.js` nor `netrun/view.js` checks for a dead netling.
- The `RunView` holds `this.pet`, the old state object. After the player presses COMPILE, `app.state` is a new netling but `app.session` still drives the old one. Moving, ICE results and `close()` mutate the dead object, while `onClose` still runs `bumpProgress` and the disconnect bandage grant against the new game's progress.
- How it can happen: the simulation keeps ticking while a run is open, and a run has no time limit. Leaving the map open long enough for neglect, integrity collapse or the 7 day limit to trigger is enough. It is more likely near the end of a life.
- Impact is awkward rather than corrupting: the pad stays on screen until the player presses ABORT RUN, and progress counters can be bumped by the ghost run. The new netling is not modified.
- Suggested fix (not applied): in `advance()`, when the stage becomes `dead`, close `app.session` (abort the run and skip progress); or have `RunView` refuse input when its pet is no longer `app.state`. Add a `tests/` case for a flatline with an open run.

### KI-02

**`SAVE_VERSION` has no migration path.** Severity Medium (latent).

- `SAVE_VERSION` is 1 and `cleanSave` returns `null` for any other value, which sends the save down the "set aside, compile a new netling" path (`corruptSave`).
- `migrate()` only fills missing fields with `??=` defaults. Every mechanic added so far (nap, visitors, hibernation, Packet Feast, run cooldown cuts) was handled that way, so no bump was ever needed.
- The first change that cannot be expressed as "add a field with a default" will need a version bump, and the bump will orphan every existing save unless `cleanSave` accepts the old version and upgrades it. Transfer codes carry the same version (`payload.v` and `saveVersion`).
- Suggested approach: keep accepting version 1, add an ordered list of upgrade steps run from `cleanSave`, and add a test that loads a frozen version 1 fixture.

### KI-03

**A DEFEND result is discarded if the intrusion lands during the mini-game.** Severity Low.

**Status: Fixed.** While a DEFEND mini-game runs, the UI sets `event.defending` and `stepEvents` holds the intrusion timer (like sleep does). The flag is cleared on finish, or by `closeStaleSession` if the session ends without reporting, and `cleanSave` never keeps it. Unit tests added. The description below is the original finding.

- `ui/play.js` `startDefense` starts a random mini-game with up to 60 minutes on the intrusion timer. The simulation keeps ticking. If the timer runs out while the game is open, `stepEvents` clears the event and installs the virus.
- On finish, `act('defend')` is refused with "no intrusion to defend against" and the flash message shows that, even if the player just won. The virus and the -10 Integrity have already landed.
- Rare in practice (a mini-game lasts seconds, and the player usually starts DEFEND with time to spare), and the outcome is consistent with the timer, but the message is confusing.

### KI-04

**The RECORD tab omits the Packet Feast streak.** Severity Low.

**Status: Fixed.** The RECORD row now lists all four streaks.

- `renderRecord` in `ui/archive.js` lists "best streak: breach / dodge / tune". Packet Feast was added later and has its own unlock (the Packet rain effect needs a Feast streak of 10), but its streak is not shown.

### KI-05

**Storage is rewritten every second.** Severity Low.

**Status: Fixed.** The clock tick now saves at most every 5 seconds (and on stage changes), actions still save at once, and `flushSave` writes when the page is hidden or closing. Verified by the smoke run only after this commit; see the commit that follows if it needed a fix.

- `advance()` ends with `save()` and runs each second (and on every action), so the whole netling, including its log and any open netrun map, is serialized and written continuously while the tab is open.
- It is cheap for a save this small, but it costs battery on phones and makes storage-full failures appear as soon as space runs out rather than at a meaningful moment. Saving on change or every N seconds would do.

### KI-06

**"No dependencies" ignores the font.** Severity Low.

**Status: Fixed.** VT323 is now served from `fonts/` (with its OFL license) through an `@font-face` rule; the Google Fonts links and the service worker's font hosts are gone, the font is in `SHELL`, and Pages copies `fonts/`. A smoke scenario asserts no third-party requests.

- `index.html` loads VT323 from Google Fonts, and the service worker caches those hosts. First launch with no network shows the fallback monospace font (canvas text included) until a cached copy exists. It also sends a request to a third party. Self-hosting the font file would remove both.

### KI-07

**Import in test mode says it replaces "this device".** Severity Low.

**Status: Fixed.** In test mode the import preview now says it replaces the test data.

- Transfer out is disabled in test mode, but importing is not. `applyImport` writes through `store`, which is the test store, so it replaces the **test** data only. The preview button still says "REPLACE THIS DEVICE". Real data is not touched (the test namespace is separate), but the wording is wrong.

### KI-08

**The sanitizer accepts inconsistent stage and form pairs.** Severity Low.

**Status: Fixed.** New `settle()` in `sanitize.js` makes the form fit the stage (a dead netling keeps its body) and clamps timers that start in the netling's future (run and nap cooldowns, open event, hibernation start). Without the clamp a hostile or damaged value such as `lastRunEndAge: 1e9` would lock netruns for good.

- `cleanSave` checks that stage and form are each valid, not that they agree (for example stage `adult` with form `bitling`). A hand-edited or hostile save can therefore hold an impossible netling. The game tolerates it (lookups fall back), but it is not validated. Also, `hibernation`, `nap` and `rebootUntilAge` are not cross-checked against `ageMin`.

### KI-09

**Docs and comments that disagreed with the code.** Severity Low.

- The old README said accessories number 20; the code has 24 wearable accessories plus 4 props (22 wearables are findable, 2 are earned). `gallery.html` also lays out a fixed 20-column grid. (README trimmed in this pass.)
- The old README said a full Integrity recovery takes "about 14 hours"; the comment on `integrityRegenPerHour` in `sim.js` says "about 16 hours". Neither was measured here. (README trimmed in this pass.)
- Misplaced or duplicated comments: `netrun/run.js` has "Picks up the region's next unread fragment" above `takeAccessory` instead of `takeFragment`; `ui/system.js` has a comment about sessions blocking hibernate and transfer sitting above the test mode section instead of `sessionBlockReason`; `accessories.js` opens with two overlapping header comments.
- `sw.js` `CACHE` is a hand-bumped name (`netling-v34`) with no reminder anywhere to bump it.

### KI-10

**Duplicated helpers.** Severity Low.

**Status: Fixed.** The three copies now share `weighted()` in `src/random.js` (added to `SHELL`, with tests). `pickByRarity` in `accessories.js` was left alone: it weights an array by a rarity table, not an object of weights.

- The weighted random pick exists three times: `weighted` in `netrun/map.js`, `weighted` in `netrun/run.js`, `rollTable` in `sim.js` (and a fourth variant, `pickByRarity`, in `accessories.js`). Behaviour is the same; consolidating would remove a place for drift.

### KI-11

**A nap does not hold an open event's timer.** Severity Note. Reproduced.

- Real sleep holds an open event's timer (the field manual says so). A nap does not: with a trace open, a 60 minute nap takes the remaining time from 120 to 60. A player can nap through a trace, intrusion or overflow and wake to the consequence. HIDE, COMPLY, DEFEND and PURGE stay available during a nap, so it is avoidable, but the manual's NAP entry does not mention it.

### KI-12

**Sleep uses the device's local time zone.** Severity Note.

- `step()` decides sleep with `new Date(t).getHours()`. Travelling, daylight saving changes and importing a netling onto a device in another time zone all shift the sleep window. Tests pin `TZ=UTC`.

### KI-13

**Time in transit counts.** Severity Note.

- A transfer code stores `lastTick`. The imported netling is ticked from that moment (clamped to now), so a netling left in a code for two days ages two days on load. The source device stops simulating while locked, so nothing is duplicated, but a code is not a pause. Hibernation is the pause.

### KI-14

**Boosted wins count double toward Ghost.** Severity Note.

- A win with a Signal booster adds 2 to `games[id].won`. The Ghost condition of "22 wins" and "4 in each game" can therefore be met with fewer actual wins. Probably fine, but document it if the requirement is ever tuned.

### KI-15

**Neutral netlings that miss Ghost become Chrome.** Severity Note.

- `leaningForm` breaks ties in favour of allegiance, and allegiance 0 counts as positive. A netling with both axes near zero that does not qualify for Ghost evolves into Chrome. The balance run reflects this indirectly (a tidy, neutral player gets Daemon most of the time because stability accrues steadily).

### KI-18

**Adding a codex fragment makes finished codexes incomplete.** Severity Note.

- `codexComplete()` (`ui/app.js`) is `FRAGMENTS.every(...)`. It decides Root Access for each new script, and `drainCodexInbox` plays the NL-0 transmission when it flips from false to true. Shipping fragment 23 would leave every player who had completed the codex without Root Access for new netlings until they find it, and would replay the transmission. Unlocked shells and tints stay unlocked (unlocks are stored, never revoked), but the "gold" shell check reads the same list.

### KI-16

**Test coverage gaps.** Severity Gap.

- Covered well: `sim`, netrun rules, sanitizing, transfer, storage, lease, events, items, root access, mini-game logic (headless).
- Only covered by the browser smoke test (or not at all): `render.js`, `sprites.js` (only anchors are unit tested), `audio.js`, `notify.js`, `ui/*` (including `advance`, the flatline handling and `dropSession`), `netrun/view.js`, `ui/gamepad.js`.
- No test covers a flatline with an open netrun (KI-01), the DEFEND timing case (KI-03), or a save with a different `saveVersion` beyond "rejected".
- `npm test` sets `TZ=UTC`. Running `node --test` directly in another time zone was not tried, and the sim tests assume the noon-UTC start is awake.

### KI-17

**Unfinished platform steps.** Open work, not a defect.

From [PLATFORMS.md](PLATFORMS.md), at the time of writing: enable Pages in the repository settings, confirm the Pages workflow runs (it had not run when the doc was written), and manually install and play on Android, Windows, macOS and Steam Deck. Tier 2 native wrappers are unstarted and untested.

## Checked and found consistent

Useful when deciding what to trust:

- `npm test`: 176 tests, all passing on this commit.
- `npm run balance` (300 runs per archetype) matches the README's old balance table within sampling noise: attentive 100% adult and 99% full life; casual 93% and 83%; worker 87% and 49% (README said 85% and 51%); neglectful 4% adult, dying around day 1; deliberate strategies reach their forms (Chrome 100%, Firewall 100%, Glitch 65%, Daemon 83%, Ghost 100%).
- Every module reachable from `main.js` is in the service worker's `SHELL`.
- The codex has 22 fragments (4, 5, 5, 4, 4 by region), as documented.
- Every Breach puzzle is generated from a legal path, so it is solvable.
