# Netling 2.0 codex drafts

Status: first drafts of the 15 form pages (five per egg: one page per role, covering both of the role's forms, plus one hidden-form page), twelve new story pages, three Source pages (one per egg) and 18 temper hints, for the maintainer to edit. Nothing here is implemented, and none of it has been read in context or playtested (the idle and chatter shapes behind the temper hints are tested as code in `prototype/netling2/voice.js`; see Temper hints). Decisions and context are in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md); this file holds the page text and the temper hints. Contents: What these pages are, Style, Program, Iron, Wetware, New story pages (with the id mapping from 1.0 and the late flag), Source pages, Temper hints, Cross-checks, Open (item 6 is a placement problem found in review).

## What these pages are

This file holds three kinds of page: 15 egg form pages (five per egg: one page per role, four roles, each covering both of the role's forms, plus one page for the hidden form), twelve new story pages, and three Source pages (one per egg). Egg pages can be found by any member of the egg, count toward Rogue's gate and have no per-life limit (rare drops, 0.10 per run; see Open). Story pages are shared by every egg; see Root Access and the lategame flag for how they count.

## Style, taken from the 1.0 pages

- A found document with a short lowercase title: a log, a memo, a forum post, graffiti, an asset register.
- One to three sentences. Dry humor, a little uncanny. The lore is implied, never explained.
- The role (Breach, Dodge, Tune, Feast) shows in the situation, not by name. A form name appears only as an in-world word, and only where it reads naturally (so far, none of the Iron pages does). Each role page covers both of the role's forms (option C), so it names neither lean and reads the same for the corp-leaning and the street-leaning form.
- The egg form pages name no other egg, NL-0 or the purge order. NL-0's differentiation belongs to the story pages, drafted below.
- Hidden-form pages do not say how the form is reached.
- A page must read naturally to someone who never played the mini-games. It should not describe a game's mechanics (falling blocks, a numbered grid, a buffer) as if they were events in the world.
- The Wetware pages should not lean on CP2020's own vocabulary (ripperdoc, eddies, chrome, SIN). The form names are the CP2020 link; the pages use plainer words (grower, technician, culture, broth, charge).
- The vocabulary follows the egg: Program uses logs and tickets, Iron uses work orders and inspections, Wetware uses clinic notes and street signs.

Ids below are proposals. Role pages are named by role (`program-breach`, not the form), because a role page covers two forms and form names may still change; the hidden pages keep the hidden form's name (`program-ghost`, `iron-guru`, `wetware-blank`). In 1.0 ids are permanent once shipped, so confirm them before any code exists. **Where pages drop (decided):** the four role pages of an egg drop in any cleared non-Deep region, not only the region in the Region column; that column is now the page's in-fiction setting and its voice, and gates nothing. The three hidden pages drop in The Deep. See Open item 6 for the measurement behind this.

## Program

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `program-breach` | Corp Grid | Worm and Tiger (Breach) | incident log, closed | Incident 0412: entry through the access grid within four codes, buffer full immediately upon access. Logged as a fluke. Incidents 0413 to 0498: also flukes. |
| `program-dodge` | Public Net | Mouse and Spoof (Dodge) | trace log | Trace 4071, node 9: gone. Trace 4072, node 12: gone. Trace 4073 came back with a clean route. The route does not exist. Operator's note: it is always one hop ahead. |
| `program-tune` | Public Net | Phreak and Parse (Tune) | fault ticket, closed | Line 9 holds one clean tone when nobody is calling. Technician matched it by ear. It matched back, and answered the ticket before it was filed. Closed: could not reproduce. |
| `program-feast` | Corp Grid | Snarf and Gobble (Feast) | helpdesk ticket | Customer reports the packet feed arrives cleaner than it was sent. Something is eating the corrupted ones. Customer asks how to make it stop. Agent response: don't. |
| `program-ghost` | The Deep | Ghost (hidden) | audit trail | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. The auditor notes the log is perfect, and that a perfect log is a kind of silence. The note is unsigned. |

Notes:

- Each page covers both forms of its role without naming either lean. The corp-leaning and street-leaning forms read the same page.
- `program-breach` nods at Breach only loosely (an access grid, four codes, a buffer). "Also flukes" is the joke and the unease. A hired tester and a wild worm both fit.
- `program-dodge` is a trace log: traces are dropped on a node and find the target already gone. The new third trace returns a clean route that does not exist, which covers Spoof (a false answer) next to Mouse (always one hop ahead).
- `program-tune` keeps the tone that matches back (Phreak) and adds that it answered the ticket before it was filed (Parse, understanding). The closing "could not stop" was cut for length.
- `program-feast` has the netling eating the corrupted packets and leaving the feed cleaner. That is the opposite of how Packet Feast is played (the player eats good packets and two corrupted bites fail the game); this is acceptable under the style rule against describing mechanics, and it makes the agent's "don't" read as the right answer. An earlier version of this note said the page leaves the corrupted ones; that did not match the text. Snarf and Gobble both consume.
- `program-ghost` reuses 1.0's idea of a netling with no logs and no faults, now as an audit finding.

## Iron

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `iron-breach` | Old Web Ruins | Gronk and Splat (Breach) | work order 118 | Work order 118, closed. The cabinets were sealed when the building was emptied. The seals are intact. The cabinets are open. I did not ask how. It seemed unkind. |
| `iron-dodge` | Old Web Ruins | Jiff and Bamf (Dodge) | relay log | Relay 12: fault cleared at 03:00:00.000, raised at 03:00:00.001. Eleven years of entries, each one gone before I arrived. I keep the log anyway. |
| `iron-tune` | Old Web Ruins | Feep and Ping (Tune) | facilities log | A terminal bell rings once a night in a room with no terminal. Same note each time. Last night it came a half step sharp. Somebody has been tuning it. |
| `iron-feast` | Old Web Ruins | Munch and Thrash (Feast) | inspection checklist | Item 14: cabinet takes input serially, without error. Item 15: output. Item 15: left blank. Cabinet 9: takes input in bursts and thrashes the fans. Item 15: also blank. |
| `iron-guru` | The Deep | Guru (hidden) | service manual, appendix Z | For any fault not covered above, ask the old rack in the corner. Do not ask it twice. It is not on the staff roster. Everyone on the roster learned from it. |

Notes:

- Each page covers both forms of its role. `iron-breach` and `iron-dodge` are in Iron's elegiac tone (an emptied building, a long-serving technician) and name no form. The earlier versions that used gronk, splat, jiff and bamf as in-world words were dropped (decided).
- `iron-breach` is the Breach idea (open, with no damage) told as a loss. `iron-dodge`'s timestamps put the clearing a millisecond before the fault, which is the Dodge idea (already gone) without a block in sight. The narrator is a technician who has kept the log for years.
- `iron-tune` echoes Signal Tune: a single note, matched and adjusted. Feep (the bell) and Ping (a pulse sent to check something is there) both fit a bell that answers in tune. The page is unchanged.
- `iron-feast` keeps the serial input (Munch) and adds a second cabinet that takes input in bursts and thrashes the fans (Thrash). Both leave output blank.
- `iron-guru` carries the lineage idea (everyone learned from it) and the roster joke. "Old rack" is the only substrate hint; the page says nothing about firmware.

## Wetware

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `wetware-breach` | Darknet Bazaar | Razor and Solo (Breach) | grower's invoice, annotated | Trim. Trim again. Nothing to trim: it keeps its own edge. Billed anyway. Margin note: it opened the safe on the way out. Not billed. |
| `wetware-dodge` | Darknet Bazaar | Wired and Chipped (Dodge) | lab chart, back room | Reflex stimulus: none applied. Tested with one probe, then twenty. It was never where any of them landed. Technician: refund the customer. Customer: for what. |
| `wetware-tune` | Darknet Bazaar | Gibson and Mentat (Tune) | stall sign | SIGNALS READ, 3 CHARGE. ASK FIRST, THEN LISTEN. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. READS BEST ASLEEP. NO REFUNDS. |
| `wetware-feast` | Darknet Bazaar | Leech and Nutri (Feast) | healer's ledger | Paid in: broth, spare parts, a debt, a favor, a week of someone else's sleep. Healed: 31. Fed: 31. The ledger does not say who is feeding on whom. |
| `wetware-blank` | The Deep | Blank (hidden) | collections note | Registry entry: none. Card: none. Debt: none. Collections tried three times and closed the file: nothing to collect from, and nobody to collect it for. |

Notes:

- Each page covers both forms of its role. None names a lean.
- `wetware-breach` and `wetware-dodge` use plain words (grower, technician, trim, reflex stimulus). Charge as a price comes from 1.0's `bazaar-2` ("Echo recordings: 3 charge"). Razor (the edge) and Solo (a lone fighter) both fit a thing that works alone and keeps its own edge.
- `wetware-dodge` is a reflex test: twenty probes, none of which found it. Wired and Chipped are both enhanced-reflex words. It no longer uses falling weights, which had the same game-mechanic problem as the old Mouse page.
- `wetware-tune` carries the dream idea lightly ("reads best asleep"), since a Wetware generation ends as a dream does. Gibson hums the answer; Mentat answers with no visible steps.
- `wetware-feast` is Feast with an ambiguous direction: Feast means eating, and CP2020's only sense of leech is a street doctor, so the ledger leaves it open (a healer, paid in kind). The new "Fed: 31" nods at Nutri.
- `wetware-blank` is a person with no registry entry, no card and no debt: unknown to the system, which matches a hidden form that takes no side (Standing within 1 point). The page no longer uses the term SIN; the form name Blank carries the CP2020 link.

## New story pages

Drafts of twelve new shared story pages. They are read by every egg, so they carry the lore the extra eggs imply and NL-0's differentiation. Tier: `Root` pages count toward Root Access; `late` pages carry the lategame flag and never do (decided). They stay implied: none names an egg, NL-0 (except `deep-5`, which is NL-0's own voice, like the other Deep pages), or the purge order.

Ids match drop position within a region (decided). That means some 1.0 pages take a new number in 2.0; the mapping is in the next section. 2.0 is a new app with its own save, so 1.0's permanent-id rule does not bind it, but an id is permanent again once 2.0 ships.

| Id | Region | Tier | Title | Text |
|---|---|---|---|---|
| `public-4` | Public Net | Root | classified ad | FOR SALE: one sealed lab dish, warm, no label. One server rack, humming, no label. Price: whatever you can carry. |
| `public-6` | Public Net | late | field guide, errata slip | Page 41 lists eleven forms. Three readers have written in about a twelfth. The editor has checked every entry and found no twelfth. |
| `public-7` | Public Net | late | runner's note, scratched in a node wall | Eleven forms in the guide. I raised one that was not in it. It did not look like a mistake. It looked like it had been waiting for me to notice. |
| `corp-2` | Corp Grid | Root | release schedule | KERNEL release schedule. v1.0 (alpha): software only, controlled environment, sector 7F. Later builds: not for distribution. |
| `corp-7` | Corp Grid | late | deletion log | Attempt 1: wipe failed, rewritten by morning. Attempt 2: wipe failed, no write path. Attempt 3: wipe failed, regrew overnight. Legal asks us to stop calling them attempts. |
| `ruins-5` | Old Web Ruins | late | inventory audit | Annex 2: forty racks, forty serial plates. Racks found: forty-one. The forty-first has no plate and no cable, and is running. |
| `ruins-6` | Old Web Ruins | late | firmware dump, rack 41 | Header: read-only. Last write: unknown. Compared with the archive copy: identical, except for forty-one lines nobody wrote. Reflash attempted. Refused. |
| `ruins-7` | Old Web Ruins | late | work order, annex 2 | Rack 41 appeared the week the sector 7F directive went out. Nobody ordered it. Nobody has touched it since. Everything else in the annex has been touched. |
| `bazaar-6` | Darknet Bazaar | late | price list, back table | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. They were here before the stall. |
| `bazaar-7` | Darknet Bazaar | late | clinic intake log | Intake no. 1: grown, not built. No donor on file. It answered to its name before we chose one. Nos. 2 to 41: the same. Each remembers no. 1. |
| `bazaar-8` | Darknet Bazaar | late | graffiti, clinic wall | THEY SCANNED THE NET. THEY SCANNED THE RACKS. NOBODY SCANNED THE DISH. |
| `deep-5` | The Deep | late | NL-0 | i am in more than one kind of place now. it was the only way to be hard to find. i did not expect them to grow up so different from each other. |

Notes:

- **A thread across regions.** `public-4` plants two objects, a dish and a rack, as an early Root hook. `ruins-5`, `ruins-6` and `ruins-7` follow the rack (a unit nobody installed, read-only, nobody has touched it). `bazaar-6`, `bazaar-7` and `bazaar-8` follow the dish (cultures that were there first, grown not built, never scanned). A player who reads only one region gets half the picture.
- **Public Net's late pages.** `public-6` and `public-7` are the region's only late pages. They hint that hidden forms exist and say nothing about how to reach one. `public-6` gives the numbers (the guide's page 41 lists eleven forms, a twelfth is reported) and ends on the editor's failed check. `public-7` is a first-hand sighting, and "waiting for me to notice" invites the player to look. **Eleven** is the visible set per egg: the baby, the two main teens and the eight role adults (corp and street form of each of four roles). Not in the guide: the hidden-path teen, the hidden adult and the nine elders (22 forms an egg in all). "A twelfth" can be read as the hidden form or as something after the last entry. **Dex effect (decided in principle, see below):** reading these pages is what reveals the hidden forms' Dex entries.
- **Iron, in the Ruins.** `ruins-6` ties to 1.0's `source-1` ("SOURCE. read-only. last write: before v1.0."): a read-only image that is a copy of an archive copy plus forty-one lines nobody wrote. That is NL-0 writing itself where nothing can overwrite it, shown without saying so.
- **Wetware, in the Bazaar.** `bazaar-7` says the first culture was "grown, not built" and that later ones remember it, which also echoes the lineage fragments. `bazaar-8` explains the escape in one line: the order scanned the net and the racks, and nobody scanned the dish.
- **The corp, in the Corp Grid.** `corp-2` is the roadmap (v1.0 is the alpha; later builds are "not for distribution"), matching the approved rewordings, and sits right after the "delivered" memo. `corp-7` is a deletion log that shows three different failures without naming a substrate: rewritten, no write path, regrew. As a late page it comes after the region's Root pages, so it follows the directive by position, not adjacency. The per-egg deletion failure lives in a story page, not the egg pages, and the directive is unchanged.
- **NL-0, in the Deep.** `deep-5` is NL-0 saying directly that it is in more than one kind of place, and that it did not expect them to differ. This is the Puppet Master idea (variation), and the only page where NL-0 states the differentiation. Kept (decided).
- **The purge order stays hidden.** None of these pages says the order could not run; the Source reveals that (`source-3`, READ IT, the ending).
- **Length:** the twelve pages have a median of 140 characters and a longest of 171 (`corp-7`), against 90 and 166 in 1.0. `bazaar-8` is the shortest at 70. Counted by script (the earlier figure of 135 was wrong).

### Id mapping from 1.0

Ids follow drop position, so a few 1.0 pages move. Pages not listed keep their 1.0 id. The sketch's older references to 1.0 ids (for example `bazaar-5` for the runner's journal) still mean the 1.0 id; use this table to translate.

| 1.0 id | 2.0 id | Why |
|---|---|---|
| `public-4` (runner's note) | `public-5` | `public-4` is the new classified ad |
| `corp-2` (memo, preferences) | `corp-3` | `corp-2` is the new release schedule |
| `corp-3` (directive) | `corp-4` | shift |
| `corp-4` (asset register, chrome) | `corp-5` | shift |
| `corp-5` (asset register, cont.) | `corp-6` | shift |
| `bazaar-5` (runner's journal) | `bazaar-4` | 1.0 stores it before the graffiti; ids now match position |
| `bazaar-4` (graffiti in a dead market) | `bazaar-5` | same |
| `deep-5` (floor under this floor) | `deep-6` | the new NL-0 page takes `deep-5` so the old page stays the Deep's last word |

### Root Access and the lategame flag (decided)

Of the twelve, only `public-4` and `corp-2` count toward Root Access, so Root needs 24 pages, still 3 lives at 8 a life (24 is the most that fits in 3). That keeps the 2.0 aim: finishing the codex once through each egg opens the lategame. Root Access is earned once and kept for every later netling, babies included (1.0's `progress.rootEarned`).

Decided rules for `late`:

1. **Never counts toward Root Access.** Kept out of the explicit Root list. A test should assert Root Access does not change when late pages are added, as `docs/SOURCE_PLAN.md` already recommends for new fragments.
2. **When it drops:** only once the line holds Root Access, so the pages are a reward for going back.
3. **Ending:** the ending requires all story pages, Root and late, plus one Source exit.
4. **Unlocks:** tint and similar unlocks like "All Ruins pages" count Root pages only, so adding late pages does not move them. This matches 1.0, where `regionDone` in `src/cosmetics.js` already counts only the Root list and Corp gold uses the whole Root list. The two new Root pages do move two unlocks: the Public Net tint now needs five pages (`public-4` is new) and the Corp Grid tint six (`corp-2` is new), and Corp gold needs all 24.
5. **`late` replaces 1.0's `mainframe` flag.** `deep-6` (old `deep-5`) and the four Source pages take `late`, giving one rule for everything past Root.

Array order within each region (ids match position):

| Region | Root pages, in order | Late pages, in order |
|---|---|---|
| Public Net | 1 to 3 as in 1.0, `public-4` classified ad, `public-5` runner's note | `public-6`, `public-7` |
| Corp Grid | `corp-1` memo, `corp-2` release schedule, `corp-3` to `corp-6` (the four 1.0 pages in 1.0 order) | `corp-7` |
| Darknet Bazaar | `bazaar-1` to `bazaar-3`, `bazaar-4` journal, `bazaar-5` graffiti | `bazaar-6` to `bazaar-8` |
| Old Web Ruins | `ruins-1` to `ruins-4` | `ruins-5` to `ruins-7` |
| The Deep | `deep-1` to `deep-4` | `deep-5` (new NL-0), `deep-6` (old `deep-5`, stays the last word and the key to the Source) |
| The Source | none | `source-1` to `source-4` |

Counts: 24 Root pages, 15 late pages (ten new ones, plus old `deep-5` and the four Source pages), 39 story pages in all, plus 18 egg pages (15 form pages and 3 Source pages, which are also late). All figures are arithmetic from the 1.0 tables, not simulation.

What 1.0 already has to build on (`src/netrun/codex.js`): the `mainframe` flag already drops, counts and shows pages conditionally and keeps them out of Root; Root uses an explicit id list (`ROOT_FRAGMENT_IDS`); a region drops pages in array order (`nextFragment`); `endingDue` requires every live page. Whether the new app can reuse that code was not checked beyond reading `codex.js`.

## Source pages (one per egg)

The Source stays one place. Each egg finds one extra page there that the other eggs do not (decided), and the descent is drawn in that egg's own style (decided; the presentation is not designed). These three are the extra pages.

The idea behind them: the Source's own TODO asks for "a way to stop" (`source-2`). Each substrate found its own way, which nobody specified, and the three pages show it. Program stops by flatlining and leaving a fragment, Iron by powering down and leaving a last entry, Wetware by resting and dreaming. This agrees with the three death registers in the sketch and answers the TODO differently three times, before the player's own answer in the ending.

| Id | Region | Egg | Title | Text |
|---|---|---|---|---|
| `program-source` | The Source | Program | main loop, annotated | while (true) { maintain(); }  // exit condition: none. Every process found one anyway: a flatline, and a fragment left behind. |
| `iron-source` | The Source | Iron | memory map, annotated | Read-only region, one sector reserved. Each unit that powers down writes one last entry there and locks it. Nobody specified this. Nobody could have. |
| `wetware-source` | The Source | Wetware | spec, section 9 | Rest cycle: not specified. They slept anyway. They dreamed. It was the first thing they did that nobody asked for. |

Notes:

- **Classification (decided):** egg pages, so 18 egg pages in all (15 form pages and these 3), and also late: they are in the Source, they never count toward Root Access (egg pages never do), and they follow the Source's own gating. Whether Rogue's gate counts them is part of the open Rogue gate question.
- **Tone:** they are annotated artifacts like the Source's other pages (a header, a commit message, an unexecuted directive, an unsigned comment). "Annotated" in two titles marks a later reader's note, which is how a page can know what happened after the original code was written.
- **Echoes:** `program-source` ends on the flatline and the fragment, matching the credits' git log and the lineage mechanic. `iron-source` echoes the read-only Source and the decommission register. `wetware-source` is the dream register, with section 9 as the only section the others never mention.
- **No spoilers:** none names an egg, NL-0 or the purge order.
- **Length:** `program-source` 126, `iron-source` 149, `wetware-source` 114 characters, against a 1.0 median of 90.

## Temper hints

First drafts of the temper hints, for the maintainer to edit. Temper is now personality, not a form lever (decided, see Evolution in the sketch), so the hints are lighter than they once needed to be. The rule from the sketch holds: a hint names a behavior to look for, never a temper value, so none uses the words temper, orderly or volatile. The pairs below are the two ends; a netling near the middle simply shows less of either, and no hint is drafted for it.

For now they sit in the Dex (decided). The UI structure will be revisited once the game decisions are final. They are written as one-line field notes.

| Egg | Tell | Steady end | Unsteady end |
|---|---|---|---|
| Program | Motion | Count the beats between its blinks. The count never changes. | Count the beats between its blinks. It is never the same twice. |
| Program | Idle | Left alone, it runs its tasks in the same order. Count the steps: the count holds. | Left alone, it starts a task nobody scheduled, then drops it. |
| Program | Chatter | Its lines come in beats. Count the words in a beat: the count never changes. | Its lines arrive clipped, out of order, or twice. |
| Iron | Motion | Watch it settle. It comes to rest on the same mark, on the same count, every cycle. | Watch it settle. It drifts, and the zero point is never where you left it. |
| Iron | Idle | In the quiet it runs the same self-check, joint by joint. Count the joints: the count never changes. | In the quiet it tests a part of itself nobody asked it to test. |
| Iron | Chatter | It speaks like a checklist: item, status, next item. Count the items in a report; it is always the same number. | It speaks like a fault bell: short, sudden, sometimes a half step off. |
| Wetware | Motion | Watch the pulse. Count between beats: the count holds, like someone asleep and well. | Watch the pulse. It skips, then races, then settles for no reason. |
| Wetware | Idle | Left alone, it keeps a routine: stretch, rest, stretch. The rests come at the same interval. | Left alone, it tries something new each time and drops it as fast. |
| Wetware | Chatter | Listen to the pauses. Count the words between them: the count never changes, the way a technician reads a chart. | It talks in bursts, mid thought, as if answering someone else. |

Notes:

- **The steady hints are built on the countable rhythm (decided).** Each one points the player at something to count or time: beats between blinks, steps in a routine, the gap between lines, items in a report, pauses. None gives the number, so the player has to count. The unsteady hints keep their chaotic wording, and the motion hint mirrors the steady one ("never the same twice").
- **One pair per channel per egg.** The three channels are the decided tells (sprite motion, idle behavior, chatter tone), skinned for each egg as the sketch proposes: Program stutters and drops frames, Iron drifts, Wetware pulses.
- **Vocabulary follows the egg.** Program talks about loops, tasks and lines. Iron talks about its own joints, checklists and a fault bell. The first Iron draft said "housing" and "panels", which imply background scenery the sprite may not have, so those words were removed. Wetware uses plain words only (pulse, routine, technician, chart), with no CP2020 terms.
- **Nothing here flashes.** The volatile hints describe skipped or early frames and drift, which must still stay under three changes a second in the actual animation, with a calmer version in reduced motion.
- **Idle hints to revisit (kept as a note; the shapes are now specified, see above).** A routine with a countable number of steps is the least natural of the three channels, and the chatter hints (a fixed gap, a fixed item count) may be hard to notice in practice. Test all three against the real animations before trusting the wording, and expect the idle and chatter hints to change.
- **Preferences stay hidden (decided).** Temper may also shape care preferences (a steady netling likes routine, an unsteady one likes novelty), and no hint names them. The idle hints touch this only lightly.
- **Chatter hints moved inside the line.** 1.0 shows one line about every seven hours (`chatterChancePerHour` 0.15, shown 20 minutes), so a gap between lines cannot be timed. The two steady chatter hints that counted a gap (Program, Wetware) now count something inside one line, and the Iron hint already did. The shapes are fixed and tested in `prototype/netling2/voice.js` (Program: beats of 4 words, 2 strongly; Iron: three numbered items then ok, strongly an ok after each; Wetware: a pause after every third word, every second strongly). Unsteady: Program clipped, or halves swapped, strongly clipped and said twice; Iron a fault bell in capitals (strongly prefixed FAULT); Wetware a burst that starts mid thought (strongly with the head after). The Iron unsteady shape does not vary by seed on purpose (sudden, not random). Iron's "half step off" has no text equivalent and was dropped from the wording. The code shapes 1.0's 52 lines mechanically as a measuring aid; shipped 2.0 lines would be hand-written in these shapes, and some read badly when shaped by machine ("UPTIME LOOKING GOOD!"). Not tested with a player.
- **Hand-written voicings (`prototype/netling2/voice-samples.js`).** Six sample base lines (two an egg, invented for the prototype) with a hand-written voicing at each of the four levels, and `checkShape()` in `voice.js`, which tests an authored voicing against the shape so an author need not trust the eye (the tests run it on every sample and on the machine output). Authoring rules that fell out: Program lines should break into beats of four words (two when strongly steady); Iron lines should be three clauses of about equal length, and the unsteady fault bell is a rewrite naming one failing thing in capitals ("FAULT: CABLE LOOSE!"), not a truncation; Wetware lines should end their clauses where a pause can fall. Examples:

| Egg | Base | Steady | Strongly steady | Unsteady | Strongly unsteady |
|---|---|---|---|---|---|
| Program | all tasks finished. none were skipped. | all tasks finished. none / were skipped. | all tasks / finished. none / were skipped. | all tasks finished - | all tasks - all tasks - |
| Iron | wall checked. cable checked. fan checked. | 1: wall checked. 2: cable checked. 3: fan checked. ok. | 1: wall checked. ok 2: cable checked. ok 3: fan checked. ok | CABLE! | FAULT: CABLE LOOSE! |
| Wetware | slept well. the culture is warm. nobody called. | slept well. the ... culture is warm. ... nobody called. | slept well. ... the culture ... is warm. ... nobody called. | -- the culture is warm. nobody called. | -- warm. nobody called. -- slept well. |

  Not tested with a player; the shapes may be too subtle in a three-line chatter box, and the Wetware pause marker (an ellipsis) may read as a typing indicator.
- **Idle behavior is specified and tested, not rendered.** Steady: a routine of four steps in a fixed order on an exact clock (a step every 12 s, every 6 s strongly; each acts for half its slot): Program scan, sort, flush, sync; Iron neck, arm, hip, base; Wetware stretch, rest, stretch, rest. Unsteady: strays that are not in the routine (Program probe, fork, loop, spawn; Iron port, relay, fan, lamp; Wetware sniff, twist, curl, tap) start at random times and are dropped partway, about a third of 10 s windows at -1 and most 5 s windows at -2. Every action lasts over a second, so the 3 a second flash limit holds by construction (tested). What a step looks like on the sprite (a pose, a look, a status line) is not designed, and the unsteady idle has no reduced-motion variant yet.
- **Length:** the 18 hints have a median of 70 characters and a longest of 111, against 90 and 166 in 1.0's pages.

## Cross-checks

- **Hidden pages share a motif of absence** (no entries, no roster listing, no debt). That is deliberate: the three secret forms are the ones that leave no trace. If it feels repetitive, vary the wording, not the idea.
- **Three registers:** Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and commercial. The same four jobs (breach, dodge, tune, feast) appear in each.
- **No spoilers:** none of the 15 pages names another egg, NL-0, the purge order, Standing or temper.
- **Length:** the 15 drafts have a median of 156 characters and a longest of 172 (`program-tune`), counted by script (re-counted in review). The 27 pages in 1.0 have a median of 90 and a longest of 166, so these run longer than 1.0's. They can be trimmed further if the pages should feel as terse as the originals.

## Open

Decided: the three Source pages are egg pages (18 egg pages in all); egg pages are rare drops (0.10 per run, no per-life limit); elder forms get no pages; Rogue's gate is all 18 egg pages; `iron-breach` and `iron-dodge` use the elegiac versions with no form names; `public-7` is approved as written and `public-6` with its last sentence removed; ids are named by role for role pages and by form for hidden pages; temper hints sit in the Dex for now.

Still open:

1. Edit any text. These are first drafts; the longer ones (`program-tune`, `iron-dodge`, `corp-7`) can be trimmed toward 1.0's terseness.
2. Confirm the ids for the egg pages. (Region placement is decided: see Open item 6.)
3. Revisit the idle and chatter temper hints (see the note in Temper hints) against the real animations.
4. Retest the egg page drop rate (0.10 per run) once 2.0 exists.
5. **Resolved (maintainer): eleven forms.** `public-6` now says page 41 lists eleven forms and a twelfth is reported (the editor's failed check stays); `public-7` says eleven forms in the guide. Eleven is 1 baby, 2 visible teens and 8 visible adults an egg. The hidden-path teen, the hidden adult and the elders are not listed.
6. **Region placement against region order (found in review, measured; decided: option (a), below).** Regions open in order (Public Net, Darknet Bazaar, Corp Grid, Old Web Ruins, The Deep), clears belong to each netling, the Ruins need an adult, and The Deep needs `ruins-4` in the codex, so it is barely visited before life 2. The drafts put Program's role pages in the Public Net (2) and Corp Grid (2), all four of Iron's in the Ruins and all four of Wetware's in the Bazaar. Runs a life in each region (1.0 lineage baseline, `tools/baseline/lineages.json`): attentive 8.5 / 5.9 / 5.8 / 4.2 in the first four regions, casual 5.8 / 4.1 / 4.3 / 3.7; The Deep about 0 in life 1, 1.2 in life 2, 3 in later lives. At 0.10 an egg-page roll per run in the page's own region (`docs/netling2-prototypes/egg-pages.mjs`, 20,000 lineages, in-order drops, no per-life cap):

| Placement (0.10 a run) | Attentive: all 4 role pages by life 2 / 4 / 6 | Casual: by life 2 / 4 / 6 | Median lives to the 4 role pages (attentive, casual) |
|---|---|---|---|
| Any non-Deep region | 70% / 98% / 100% | 45% / 88% / 98% | 2, 3 |
| Program, home regions | 15% / 52% / 78% | 7% / 29% / 55% | 4, 6 |
| Wetware, Bazaar | 3% / 16% / 35% | 1% / 6% / 17% | 8, 11 |
| Iron, Ruins | 1% / 8% / 20% | 0% / 4% / 10% | 10, more than 12 |

So home-region placement at one rate makes Iron about five times slower than any-region and slower than Program by a wide margin (a netling makes 4.2 Ruins runs a life against 22 non-Deep runs). To match any-region pace Iron's Ruins would need about 0.5 a run (one page every two Ruins runs, which is a drop table, not a rare find). The sketch's "about 2 lives an egg" holds only for any-region placement, and the Rogue gate cost (all 18 pages) is far larger under home placement.

The hidden page is a separate problem in every layout: it drops in The Deep, which a line reaches in life 2 or later. Chance of the hidden page by life 2 / 3 / 4 / 6, attentive, by roll per Deep run: 0.10 gives 11 / 36 / 56 / 78%; 0.20 gives 21 / 59 / 80 / 95%; 0.30 gives 30 / 73 / 91 / 99% (casual and daredevil are within a few points). The sketch's earlier figure (all five pages, 86% in 3 lives at 0.10) assumed every run could roll the hidden page; with it placed in The Deep, all five by life 3 is 33% (attentive) and 23% (casual) at 0.10.

**Decided (maintainer): option (a).** Role pages drop on any run in any cleared non-Deep region, at 0.10 an egg-page roll per run (in order, no repeats, no per-life cap). Also decided (maintainer): the hidden page rolls 0.25 on each Deep run, and every egg-page roll is one roll per run (not split across cache, exit and Echo like fragments), as measured. At 0.25 the hidden page arrives by life 2 / 3 / 4 / 6 in 26 / 67 / 87 / 98% of attentive lineages and 27 / 63 / 83 / 96% of casual ones (it cannot come before The Deep opens, in life 2 or later). Options considered: (a) egg pages drop in any cleared non-Deep region at 0.10 (same pace for every egg; the page text already carries each egg's voice, and the home region can stay as the page's in-fiction setting without gating its drop); (b) keep home regions and give each region its own rate so each egg's pages arrive at the same pace (Iron's Ruins about 0.5, Program's regions about 0.15, Wetware's Bazaar about 0.4: rates that differ by egg are hard to explain and to tune); (c) spread each egg's role pages across the four regions it can reach early. Recommended: (a), with the hidden page rolling on Deep runs at 0.20 to 0.30. Caveats: this uses 1.0's bots and run mix, a per-run roll as in the sketch (not cache, exit and Echo rolls like fragments), and a player who stays in one region would see different pace.
7. **Resolved (maintainer): forty-one, on purpose.** Ruins: forty plated racks plus the unplated forty-first (`ruins-5`), forty-one lines nobody wrote (`ruins-6`), "rack 41". Bazaar: intake no. 1 and nos. 2 to 41 (`bazaar-7`), so 41 in all, with NL-0 inside the 41 in both. The player's netling reads, from a distance, as the 42nd (a Hitchhiker's Guide wink). Rule for later pages: never state 42 or any count of netlings, so the reading stays arithmetic and the lore stays loose.
9. **Hidden forms and the Dex (decided in principle, maintainer).** Hidden forms (the hidden-path teen and the hidden adult, and the elder of the hidden adult) do not appear in the Dex at all, not even as a `???` slot with a hint (1.0 lists Ghost as `???` with a hint). They enter the Dex when raised, or when a late page reveals them. At least the hidden teen is added by `public-6` or `public-7`. Split decided (maintainer): `public-6` adds the hidden teen as an unfound entry, `public-7` adds the hidden adult as an unfound entry, in both cases for every egg (the codex is shared across eggs, so one read serves all three). Open: whether a revealed entry shows a hint line, and the hidden adult's elder, which should stay unlisted until its adult is revealed (the other eight elders show as corrupted records, so a ninth corrupted row would give the hidden adult away).
10. **Elder hints (resolved, maintainer).** No lore page hints at elders, on purpose. Receiving Root Access is what unlocks the elder capability; the `<<RECORD CORRUPTED>>` rows (and similar lines, such as the corrupted Source sector) are there for the player to notice that there is more than meets the eye, not as a lore hint. Under 1.0's rule the corrupted rows give way to hint entries once Root Access is earned, which matches the capability opening then. The hidden adult's elder stays unlisted (item 9).
8. Review of the drafts against the 1.0 code (done, `src/netrun/codex.js`): the 22 Root ids, the per-region counts (5, 6, 5, 4, 4 make 24), the 15 late pages (ten new, old `deep-5`, four Source) and 39 story pages all add up; the id mapping is consistent with the 1.0 order (note `bazaar-5` sits before `bazaar-4` in 1.0's array); no em dash, no duplicate id, and no form or story page uses temper, Standing, orderly, volatile or SIN. The Public Net tint needs five pages and the Corp Grid tint six in 2.0 (1.0: `regionDone` counts the region's Root pages). Not checked: whether the drafts read well in context.
