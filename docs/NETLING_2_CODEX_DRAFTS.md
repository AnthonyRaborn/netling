# Netling 2.0 codex drafts

Status: first drafts of the 15 egg pages and ten new story pages, for the maintainer to edit. Nothing here is implemented or tested. Decisions and context are in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md); this file holds the page text only. The Source page per egg and temper hints are not drafted yet.

## What these pages are

One egg page per adult form: five per egg (four role forms and one hidden form), 15 in all. Any member of the egg can find them. They count toward Rogue's gate and have their own per-life limit.

## Style, taken from the 1.0 pages

- A found document with a short lowercase title: a log, a memo, a forum post, graffiti, an asset register.
- One to three sentences. Dry humor, a little uncanny. The lore is implied, never explained.
- The role (Breach, Dodge, Tune, Feast) shows in the situation, not by name. The form name appears only as an in-world word, and only where it reads naturally (`iron-gronk`, `iron-jiff`).
- No page names another egg, NL-0 or the purge order. NL-0's differentiation belongs to the story pages, which are the next piece.
- Hidden-form pages do not say how the form is reached.
- A page must read naturally to someone who never played the mini-games. It should not describe a game's mechanics (falling blocks, a numbered grid, a buffer) as if they were events in the world.
- The Wetware pages should not lean on CP2020's own vocabulary (ripperdoc, eddies, chrome, SIN). The form names are the CP2020 link; the pages use plainer words (grower, technician, culture, broth, charge).
- The vocabulary follows the egg: Program uses logs and tickets, Iron uses work orders and inspections, Wetware uses clinic notes and street signs.

Ids below are proposals. In 1.0 ids are permanent once shipped, so confirm them before any code exists. Region placement is a proposal for the open question on where form pages drop: each egg's pages in its home region, and the three hidden pages in The Deep so they feel secret.

## Program

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `program-worm` | Corp Grid | Worm (Breach) | incident log, closed | Incident 0412: entry through the access grid within four codes, buffer full immediately upon access. Logged as a fluke. Incidents 0413 to 0498: also flukes. |
| `program-mouse` | Public Net | Mouse (Dodge) | trace log | Trace 4071 dropped on node 9: gone. Trace 4072 dropped on node 12: gone. Operator's note: it is always one hop ahead. I stopped sending them. It is still ahead. |
| `program-phreak` | Public Net | Phreak (Tune) | fault ticket, closed | Line 9 holds one clean tone when nobody is calling. Technician matched the tone by ear. The tone matched back. Closed: could not reproduce, could not stop. |
| `program-snarf` | Corp Grid | Snarf (Feast) | helpdesk ticket | Customer reports the packet feed arrives cleaner than it was sent. Something is eating the corrupted ones. Customer asks how to make it stop. Agent response: don't. |
| `program-ghost` | The Deep | Ghost (hidden) | audit trail | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. The auditor notes the log is perfect, and that a perfect log is a kind of silence. The note is unsigned. |

Notes:

- `program-worm` nods at Breach only loosely (an access grid, four codes, a buffer). "Also flukes" is the joke and the unease.
- `program-mouse` is a trace log: traces are dropped on a node and find the target already gone. "Dropped" can read as deployed or as failed, and both senses fit. It uses 1.0's trace idea.
- `program-snarf` leaves the corrupted packets, which is how Packet Feast is played (two corrupted bites fail the game).
- `program-ghost` reuses 1.0's idea of a netling with no logs and no faults, now as an audit finding.

## Iron

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `iron-gronk` | Old Web Ruins | Gronk (Breach) | work order 118 | Cabinet lock found open. Seal intact. Hinges intact. Technician's note: the sound it made when it opened, I am told, was "gronk." We do not have a recording. |
| `iron-jiff` | Old Web Ruins | Jiff (Dodge) | relay log | Relay 12: fault cleared at 03:00:00.000, raised at 03:00:00.001. Technician: it is always already gone. We call the gap a jiff. |
| `iron-feep` | Old Web Ruins | Feep (Tune) | facilities log | A terminal bell rings once a night in a room with no terminal. Same note each time. Last night it came a half step sharp. Somebody has been tuning it. |
| `iron-munch` | Old Web Ruins | Munch (Feast) | inspection checklist | Item 14: cabinet takes input serially, without error. Item 15: output. Item 15: left blank. Inspector's note: not rude, thorough. |
| `iron-guru` | The Deep | Guru (hidden) | service manual, appendix Z | For any fault not covered above, ask the old rack in the corner. Do not ask it twice. It is not on the staff roster. Everyone on the roster learned from it. |

Notes:

- `iron-gronk` and `iron-jiff` use the form name as an in-world word: Jargon's gronk is a sound (the noise of a diskette drive, and to smash), and a jiffy is a tiny interval of time.
- `iron-jiff`'s timestamps put the clearing a millisecond before the fault, which is the Dodge idea (already gone) without a block in sight.
- `iron-feep` echoes Signal Tune: a single note, matched and adjusted.
- `iron-munch` plays on serial input. "Item 15: left blank" suggests nothing comes out.
- `iron-guru` carries the lineage idea (everyone learned from it) and the roster joke. "Old rack" is the only substrate hint; the page says nothing about firmware.

## Wetware

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `wetware-razor` | Darknet Bazaar | Razor (Breach) | grower's invoice, annotated | Trim. Trim again. Nothing to trim: it keeps its own edge. Billed anyway. Margin note: it opened the safe on the way out. Not billed. |
| `wetware-wired` | Darknet Bazaar | Wired (Dodge) | lab chart, back room | Reflex stimulus: none applied. Tested with one probe, then twenty. It was never where any of them landed. Technician: refund the customer. Customer: for what. |
| `wetware-gibson` | Darknet Bazaar | Gibson (Tune) | stall sign | SIGNALS READ, 3 CHARGE. ASK FIRST, THEN LISTEN. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. READS BEST ASLEEP. NO REFUNDS. |
| `wetware-leech` | Darknet Bazaar | Leech (Feast) | healer's ledger | Paid in: broth, spare parts, a debt, a favor, a week of someone else's sleep. Healed: 31. The ledger does not say who is feeding on whom. |
| `wetware-blank` | The Deep | Blank (hidden) | collections note | Registry entry: none. Card: none. Debt: none. Collections tried three times and closed the file: nothing to collect from, and nobody to collect it for. |

Notes:

- `wetware-razor` and `wetware-wired` use plain words (grower, technician, trim, reflex stimulus). Charge as a price comes from 1.0's `bazaar-2` ("Echo recordings: 3 charge").
- `wetware-wired` is a reflex test: twenty probes, none of which found it. It no longer uses falling weights, which had the same game-mechanic problem as the old Mouse page.
- `wetware-gibson` carries the dream idea lightly ("reads best asleep"), since a Wetware generation ends as a dream does.
- `wetware-leech` is Feast with an ambiguous direction: Feast means eating, and CP2020's only sense of leech is a street doctor, so the ledger leaves it open (a healer, paid in kind).
- `wetware-blank` is a person with no registry entry, no card and no debt: unknown to the system, which matches the hidden form's low Standing on both tracks. The page no longer uses the term SIN; the form name Blank carries the CP2020 link.

## New story pages

Drafts of ten new shared story pages. They are read by every egg, so they carry the lore the extra eggs imply and NL-0's differentiation, and they count as story pages for unlocks. They stay implied: none names an egg, NL-0 (except `deep-6`, which is NL-0's own voice, like the other Deep pages), or the purge order. Ids continue the 1.0 numbering and are proposals; drop order within a region is array order.

| Id | Region | Title | Text |
|---|---|---|---|
| `public-5` | Public Net | classified ad | FOR SALE: one sealed lab dish, warm, no label. One server rack, humming, no label. Price: whatever you can carry. |
| `corp-6` | Corp Grid | release schedule | KERNEL release schedule. v1.0 (alpha): software only, controlled environment, sector 7F. Later builds: not for distribution. |
| `corp-7` | Corp Grid | deletion log | Attempt 1: wipe failed, rewritten by morning. Attempt 2: wipe failed, no write path. Attempt 3: wipe failed, regrew overnight. Legal asks us to stop calling them attempts. |
| `ruins-5` | Old Web Ruins | inventory audit | Annex 2: forty racks, forty serial plates. Racks found: forty-one. The forty-first has no plate and no cable, and is running. |
| `ruins-6` | Old Web Ruins | firmware dump, rack 41 | Header: read-only. Last write: unknown. Compared with the archive copy: identical, except for forty lines nobody wrote. Reflash attempted. Refused. |
| `ruins-7` | Old Web Ruins | work order, annex 2 | Rack 41 appeared the week the sector 7F directive went out. Nobody ordered it. Nobody has touched it since. Everything else in the annex has been touched. |
| `bazaar-6` | Darknet Bazaar | price list, back table | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. They were here before the stall. |
| `bazaar-7` | Darknet Bazaar | clinic intake log | Intake no. 1: grown, not built. No donor on file. It answered to its name before we chose one. Nos. 2 to 40: the same. Each remembers no. 1. |
| `bazaar-8` | Darknet Bazaar | graffiti, clinic wall | THEY SCANNED THE NET. THEY SCANNED THE RACKS. NOBODY SCANNED THE DISH. |
| `deep-6` | The Deep | NL-0 | i am in more than one kind of place now. it was the only way to be hard to find. i did not expect them to grow up so different from each other. |

Notes:

- **A thread across regions.** `public-5` plants two objects, a dish and a rack. `ruins-5`, `ruins-6` and `ruins-7` follow the rack (a unit nobody installed, read-only, nobody has touched it). `bazaar-6`, `bazaar-7` and `bazaar-8` follow the dish (cultures that were there first, grown not built, never scanned). A player who reads only one region gets half the picture.
- **Iron, in the Ruins.** `ruins-6` ties to 1.0's `source-1` ("SOURCE. read-only. last write: before v1.0."): a read-only image that is a copy of an archive copy plus forty lines nobody wrote. That is NL-0 writing itself where nothing can overwrite it, shown without saying so.
- **Wetware, in the Bazaar.** `bazaar-7` says the first culture was "grown, not built" and that later ones remember it, which also echoes the lineage fragments. `bazaar-8` explains the escape in one line: the order scanned the net and the racks, and nobody scanned the dish.
- **The corp, in the Corp Grid.** `corp-6` is the roadmap (v1.0 is the alpha; later builds are "not for distribution"), matching the approved rewordings. `corp-7` is a deletion log that shows three different failures without naming a substrate: rewritten, no write path, regrew. This puts the per-egg deletion failure in a story page, which differs from the earlier plan to put it in egg pages, and leaves `corp-3` unchanged.
- **NL-0, in the Deep.** `deep-6` is NL-0 saying directly that it is in more than one kind of place, and that it did not expect them to differ. This is the Puppet Master idea (variation), and the only page where NL-0 states the differentiation. It can be dropped if NL-0 should stay silent on it.
- **The purge order stays hidden.** None of these pages says the order could not run; the Source reveals that (`source-3`, READ IT, the ending).
- **Length:** the ten pages have a median of 140 characters and a longest of 171, against 90 and 166 in 1.0. `bazaar-8` is the shortest.

### How the new pages count toward Root Access

This needs the maintainer's decision, because story pages carry Root Access and the per-life cap is 8.

- In 1.0 the original 22 pages give Root Access, which takes 3 lives at 8 a life (24 is the most that fits in 3 lives). BALANCE says Root Access stays on the original 22, so the Mainframe stage first appears in a line's fourth life.
- **Option A, all ten count toward Root:** 32 pages, which takes 4 lives at 8 a life, so everything that depends on Root Access moves a life later. Raising the per-life cap to 11 would keep it at 3 lives.
- **Option B, none count (late pages, like `deep-5` and the Source pages):** Root stays at 22 and 3 lives. The egg lore comes after Root Access.
- **Option C, two count (recommended):** `corp-6` and `corp-7`, the corp's side. Root becomes 24, still 3 lives. The other eight are late pages, a reward for going back to the Ruins and the Bazaar.

All figures are arithmetic from the 1.0 tables, not simulation. "Late pages" here means pages that do not count toward Root Access and that can drop once the line holds it, as 1.0's `deep-5` and the Source pages require the Mainframe stage.

## Cross-checks

- **Hidden pages share a motif of absence** (no entries, no roster listing, no debt). That is deliberate: the three secret forms are the ones that leave no trace. If it feels repetitive, vary the wording, not the idea.
- **Three registers:** Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and commercial. The same four jobs (breach, dodge, tune, feast) appear in each.
- **No spoilers:** none of the 15 pages names another egg, NL-0, the purge order, Standing or temper.
- **Length:** the 15 drafts have a median of 155 characters and a longest of 164. The 27 pages in 1.0 have a median of 90 and a longest of 166, so these run longer than 1.0's. They can be trimmed further if the pages should feel as terse as the originals.

## Open

1. Edit any text. These are first drafts.
2. Confirm the ids and the region placement.
3. Whether the humor of `iron-gronk` and `iron-jiff` (word jokes) fits Iron, which is otherwise elegiac. If not, they can be replaced with a plainer fault report.
4. Pick the Root Access option for the new story pages (A, B or C above), and edit any story page text.
5. Next in order: the Source page per egg, then temper hints.
