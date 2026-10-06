# Netling 2.0 codex drafts

Status: first drafts of the 15 egg pages, for the maintainer to edit. Nothing here is implemented or tested. Decisions and context are in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md); this file holds the page text only. Story pages, the Source page per egg and temper hints are not drafted yet.

## What these pages are

One egg page per adult form: five per egg (four role forms and one hidden form), 15 in all. Any member of the egg can find them. They count toward Rogue's gate and have their own per-life limit.

## Style, taken from the 1.0 pages

- A found document with a short lowercase title: a log, a memo, a forum post, graffiti, an asset register.
- One to three sentences. Dry humor, a little uncanny. The lore is implied, never explained.
- The role (Breach, Dodge, Tune, Feast) shows in the situation, not by name. The form name appears only as an in-world word, and only where it reads naturally (`iron-gronk`, `iron-jiff`).
- No page names another egg, NL-0 or the purge order. NL-0's differentiation belongs to the story pages, which are the next piece.
- Hidden-form pages do not say how the form is reached.
- The vocabulary follows the egg: Program uses logs and tickets, Iron uses work orders and inspections, Wetware uses clinic notes and street signs.

Ids below are proposals. In 1.0 ids are permanent once shipped, so confirm them before any code exists. Region placement is a proposal for the open question on where form pages drop: each egg's pages in its home region, and the three hidden pages in The Deep so they feel secret.

## Program

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `program-worm` | Corp Grid | Worm (Breach) | incident log, closed | Incident 0412: entry through a five by five access grid, four codes, buffer full on the first try. Logged as a fluke. Incidents 0413 to 0498: also flukes. |
| `program-mouse` | Public Net | Mouse (Dodge) | sysadmin's note, taped to a monitor | Every block I drop, it is already somewhere else. I stopped dropping them. It is still somewhere else. It does not seem to mind. |
| `program-phreak` | Public Net | Phreak (Tune) | fault ticket, closed | Line 9 holds one clean tone when nobody is calling. Technician matched the tone by ear. The tone matched back. Closed: could not reproduce, could not stop. |
| `program-snarf` | Corp Grid | Snarf (Feast) | helpdesk ticket | Customer reports the packet feed arrives cleaner than it was sent. Something is eating the corrupted ones. Customer asks how to make it stop. Agent response: don't. |
| `program-ghost` | The Deep | Ghost (hidden) | audit trail | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. The auditor notes the log is perfect, and that a perfect log is a kind of silence. The note is unsigned. |

Notes:

- `program-worm` points at the Breach game (a five by five grid, a four-slot buffer, a target code). "Also flukes" is the joke and the unease.
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
| `wetware-razor` | Darknet Bazaar | Razor (Breach) | ripperdoc's invoice, annotated | Sharpen. Sharpen again. Nothing to sharpen: it keeps its own edge. Charged anyway. Margin note: it opened the safe on the way out. Not charged. |
| `wetware-wired` | Darknet Bazaar | Wired (Dodge) | chart, black clinic | Reflex chip: none installed. Dropped one weight, then twenty. It was never under any of them. Ripperdoc: refund the customer. Customer: for what. |
| `wetware-gibson` | Darknet Bazaar | Gibson (Tune) | stall sign | SIGNALS READ, 3 EDDIES. ASK FIRST, THEN LISTEN. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. READS BEST ASLEEP. NO REFUNDS. |
| `wetware-leech` | Darknet Bazaar | Leech (Feast) | street doc's ledger | Paid in: soy, spare chrome, a debt, a favor, a week of someone else's sleep. Healed: 31. The ledger does not say who is feeding on whom. |
| `wetware-blank` | The Deep | Blank (hidden) | collections note | SIN: none. Card: none. Debt: none. Collections tried three times and closed the file: nothing to collect from, and nobody to collect it for. |

Notes:

- `wetware-razor` and `wetware-wired` use CP2020 words: ripperdoc, chrome, reflex chip, eddies.
- `wetware-wired` is the Dodge game seen from outside: a falling weight, twenty times, never hit.
- `wetware-gibson` carries the dream idea lightly ("reads best asleep"), since a Wetware generation ends as a dream does.
- `wetware-leech` is Feast with an ambiguous direction: Feast means eating, and CP2020's only sense of leech is a street doctor, so the ledger leaves it open.
- `wetware-blank` uses CP2020's SIN (a citizen identification number). A person without one is unknown to the system, which matches the hidden form's low Standing on both tracks.

## Cross-checks

- **Hidden pages share a motif of absence** (no entries, no roster listing, no debt). That is deliberate: the three secret forms are the ones that leave no trace. If it feels repetitive, vary the wording, not the idea.
- **Three registers:** Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and commercial. The same four jobs (breach, dodge, tune, feast) appear in each.
- **No spoilers:** none of the 15 pages names another egg, NL-0, the purge order, Standing or temper.
- **Length:** the 15 drafts have a median of 145 characters and a longest of 164. The 27 pages in 1.0 have a median of 90 and a longest of 166, so these run longer than 1.0's. They can be trimmed further if the pages should feel as terse as the originals.

## Open

1. Edit any text. These are first drafts.
2. Confirm the ids and the region placement.
3. Whether the humor of `iron-gronk` and `iron-jiff` (word jokes) fits Iron, which is otherwise elegiac. If not, they can be replaced with a plainer fault report.
4. Next in order: the new story pages (including the ones that carry NL-0's differentiation for Iron in the Old Web Ruins and Wetware in the Darknet Bazaar), then the Source page per egg, then temper hints.
