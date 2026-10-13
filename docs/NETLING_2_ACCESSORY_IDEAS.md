# Netling 2.0 accessory and style ideas (drafts; first art in the prototype)

An idea list for style items that 2.0 could add on top of 1.0's: wearables (1.0's 41 carry over unchanged; [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), "Wearables (41) and props (8)"), props, and the wardrobe's other categories (shell, tint, screen effect, sound, crest, music, label; [NETLING_2_UI.md](NETLING_2_UI.md), "STYLE (the wardrobe)"). 26 wearables, 10 props and 48 other style items (84 in all: 71 after the two duplicates were dropped, plus seven effects paired with the new shells, five more crests and the Paper tint on 2026-10-13), plus three bigger asks, and a planning note on which could be paid (Paid options). **Nothing here is decided or shipped.** First art drafts of the wearables, props and crests exist in the prototype (Art drafts, below), and the shells, tints, screen effects and device labels are built there too (Build pass, below); sounds and music are text only. Names and ids are suggestions: an id becomes permanent only once it ships (CLAUDE.md rule 1), so none is reserved yet. Spoilers for the hidden forms where noted.

## How to read the entries (wearables)

- **Slot** is 1.0's: `head`, `face`, `body`, `float` (one of each worn at once). Today's counts: body 11, face 11, float 10, head 9, so head gets the most ideas here.
- **Rarity and source** follow 1.0's scheme: common, rare or very rare; found anywhere, in one region (Public Net, Corp Grid, Darknet Bazaar, Old Web Ruins, the Deep, the Source), sold at a corp exchange or the black market, or earned. A suggestion, for the maintainer to balance.
- **Fits** names an egg or form whose look it echoes. It is flavour only: in 1.0 any netling can wear anything, and nothing here proposes changing that.
- **Motion** is described where an item moves. Every motion keeps the flash rule (no toggle faster than `FLASH_TOGGLE_MS`, 200 ms; most steps here are 400 ms) and has a still version for reduced motion.
- **Room.** The 2.0 screen has 2 rows of headroom over 1.0's ([NETLING_2_SPRITES.md](NETLING_2_SPRITES.md), item 1a), so a float item may sit up to the holologo's height (6 rows over the head) without leaving the screen. Taller ones would need measuring.

## Head (8)

| Name (suggested id) | Rarity, source | Fits | Description | Paid? |
|---|---|---|---|---|
| Goggles (`goggles`) | common, anywhere | Iron | Welding goggles pushed up on the forehead: a strap across the head top and two round dark lenses with a highlight cell each. Sits above the eyes, so it never covers them. | free (find) |
| Hard hat (`hardhat`) | common, Corp Grid | Iron | A yellow dome with a brim and one dark stripe down the middle. A plainer, working sibling of the Cap. | free (find) |
| Cat-ear headset (`catears`) | rare, black market | Wetware, Rogue | Two small triangle ears on a band, each tip a lit accent cell that blinks once every few seconds, never both at once. | free (find) |
| Electrode cap (`electrodes`) | rare, Old Web Ruins | Wetware | A dotted net over the head top: four or five bright dots joined by dim lines, one dot at a time lighting as if a reading moves across the scalp (one step every 400 ms). | split |
| Signal bars (`signalbars`) | common, Public Net | Program | Three bars of rising height standing on one side of the head, filling from short to tall and dropping back, like a phone finding coverage. | split |
| Cable tangle (`cabletangle`) | common, Darknet Bazaar | street lean | Two or three loose patch cables sticking out of one side of the head and drooping, their plugs in different colours. Still; no motion. | free (find) |
| Hood (`hood`) | rare, black market | Rogue | A dark drape over the head top and down both sides to the eye row, leaving the face clear. The look Rogue already wears, offered to anyone. Needs the outline check: it widens the head by a cell each side. | free (find) |
| Propeller beanie (`beanie`) | very rare, earned | baby | A striped beanie with a two-blade propeller on top that turns (two poses, swapped every 400 ms). Earned, as the Party hat is, for something silly: a suggestion is the first time a netling grows up. | free (earn) |

## Face (6)

| Name (suggested id) | Rarity, source | Fits | Description | Paid? |
|---|---|---|---|---|
| Light ring, was the Laughing Man ring (`laughingring`) | very rare, the Deep | Wetware, Blank | Seen first as one of Blank's elder options (2026-10-07; [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md), "Blank's elder in motion"), not chosen for Blank, never committed, and redrawn as an accessory (2026-10-12; Art drafts, below). An unbroken pale oval round the head with a bright glow and a dim wake sliding round it counterclockwise; every other lap the oval fills in with a face from the right, holds and clears from the right. Two versions: a plain smiley (`laughingring`), and a cap and grin (`laughingring.cap`). Worn alone: it hides other face items and anything on or inside it. Shop name: "Light ring" (maintainer; was "Smiling ring"). | free (find) |
| Scan visor (`scanvisor`) | rare, Corp Grid | Program | A thin dark band across the eyes with one bright cell sweeping left and right inside it, a step every 400 ms. Unlike the Visor, the eyes show through as dim cells, so the face still reads. | split |
| War paint (`warpaint`) | common, Darknet Bazaar | street lean | Two short stripes under each eye in a contrasting colour (recolorable). Still. | free (find) |
| Teardrop code (`teardrop`) | rare, black market | Rogue | One accent cell under one eye and a dim cell under it, like a tattooed tear. The smallest face item; reads as a story, not a decoration. | free (find) |
| Dead pixels (`deadpixels`) | common, anywhere | any | Two or three dark cells scattered on the cheeks, like freckles. Must stay clear of the bug tears' look (bugs move; these never do), so a still item only. | free (find) |
| Censor bar (`censorbar`) | rare, Public Net | Program | A solid black bar over the mouth row, with a few cells along its edge shifting between two patterns every 800 ms. Over the mouth, never the eyes, so the expression still reads. | free (find) |

## Body (6)

| Name (suggested id) | Rarity, source | Fits | Description | Paid? |
|---|---|---|---|---|
| Dog tags (`dogtags`) | common, anywhere | Iron | Two small grey plates on a dotted chain, one hanging a row lower than the other. Still. Makes room like the Gold chain. | free (find) |
| Hazard sash (`hazardsash`) | rare, Old Web Ruins | Iron | A diagonal band across the body in alternating yellow and dark cells, shoulder to hip. Still, so the stripes never strobe. | free (find) |
| Pulse patch (`pulsepatch`) | common, anywhere | Wetware | A small square patch on the chest with a one-row trace that blips once a second (a two-step pulse, then flat). Ties to Wetware's shade and pulse without copying them. | split |
| Heat sink (`heatsink`) | rare, Corp Grid | Iron | Three short fins clipped to the side of the body, the tips glowing warmer when the netling is in Overclock (a colour, not a flash) and plain otherwise. If tying it to a state is too much rule, keep it plain. | free (find) |
| Visitor pass (`visitorpass`) | common, corp exchange | Program | A white card clipped to the chest with one red stripe and a tiny dark photo square. The corp's way of saying you do not belong here. | free (find) |
| Leash cable (`leashcable`) | very rare, the Source | NL-0 | A thin cable from the neck trailing down to the floor and off the side of the screen, as if something still holds the other end. Still. Lore item; suggested as a reward near the end, not a drop. | free (earn) |

## Float (6)

| Name (suggested id) | Rarity, source | Fits | Description | Paid? |
|---|---|---|---|---|
| Loading spinner (`spinner`) | common, anywhere | Program | A ring of eight dim cells over the head with one bright cell stepping round it, a step every 400 ms. Reduced motion: the ring with one cell lit, still. | split |
| Notification badge (`badge`) | common, Public Net | any | A red dot with a white digit at the top right of the head, the digit counting 1 to 9 and over again, one a few seconds. A joke about the game's own attention budget. | split |
| Thought bubble (`thoughtbubble`) | rare, anywhere | any | Two small dots rising to a bubble over the head, the bubble holding a tiny icon that changes every few seconds (a chip, a heart, a skull). Purely decorative: it never shows what the netling actually wants, so it cannot be mistaken for a need. | paid |
| Bit swarm (`bitswarm`) | rare, Darknet Bazaar | Wetware | Three single bright pixels orbiting the body at different distances, like fireflies. Orbits (draws last, in front of everything, as the Drone buddy and Glitch moth). | split |
| Padlock (`padlock`) | rare, corp exchange | Program | A small padlock hovering over the head that opens and shuts slowly (two poses, a few seconds each). | free (find) |
| Mini satellite (`minisat`) | very rare, the Deep | Iron | A tiny satellite with two panel wings crossing high over the head from one side to the other, then starting over. Orbits. | split |

## Props (10)

1.0 has 8 (Cyberdeck, Boom box, Coffee mug, Briefcase, Burner phone, Spray can, and the earned Mini device and Plush); 2.0 adds the **Metronome** (decided, earned at the strong temper levels; [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), "Temper cosmetics"). Props stand on the floor at the right edge, are drawn with `draw(px, frame, time, extra)` and can animate under the same flash rule.

| Name (suggested id) | Rarity, source | Fits | Description | Paid? |
|---|---|---|---|---|
| Server tower (`servertower`) | rare, Corp Grid | Iron | A narrow black case with a column of status lights, one light stepping down the column every 400 ms and a green one that stays lit. | split |
| Petri dish (`petridish`) | rare, Old Web Ruins | Wetware | A shallow glass dish on the floor with a culture in it: a few coloured dots that slowly spread over a day of real time and reset with each new life. Still from moment to moment. | free (find) |
| Desk terminal (`terminal`) | common, corp exchange | Program | A small beige CRT on a stand with a prompt and a cursor that blinks every 500 ms (1.0's frame rhythm). | paid |
| Cardboard box (`cardboardbox`) | rare, black market | Rogue | A plain box, flaps half open, big enough to hide in. A nod to the hunt: nothing happens, it is just there. A suggestion for a later joke: the netling's eyes show in the gap while a sweep is on, if that is not too much of a tell. | free (find) |
| Toolbox (`toolbox`) | common, anywhere | Iron | A red toolbox with the lid ajar and a spanner sticking out. Still. | free (find) |
| Noodle cup (`noodles`) | common, Public Net | any | A takeaway cup with chopsticks and a wisp of steam that drifts up in two slow steps. The street's answer to the Coffee mug. | paid |
| Lava lamp (`lavalamp`) | rare, Darknet Bazaar | Wetware | A tall lamp with two blobs rising and sinking, one cell every 800 ms. Glows faintly on the floor with the lights off. | paid |
| Mini arcade cabinet (`minicab`) | rare, anywhere | any | A knee-high cabinet with a screen that cycles three still pictures of the four home games, one every few seconds. | paid |
| Fishbowl (`fishbowl`) | very rare, the Deep | any | A round bowl with one pixel fish that swims left and right and turns at the glass. The only other living thing on screen, so it should stay small and slow. | split |
| Signal jammer (`jammer`) | very rare, earned | Rogue | A squat box with two stubby antennas and a red light that pulses once a second. Earned by Rogue only, if egg-only rewards are wanted (see Open questions); otherwise a Darknet Bazaar drop. | free (earn) |

## Shells (7)

In 2.0 the shell recolors the UI surfaces (strip, lane, dock, trays, rows), and the default shell defers to the egg skin. 10 of 1.0's 15 shells unlock by discovering a 1.0 form and need new conditions ([NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), the table near "Shells (15)"). These ideas could fill those slots or sit beside them. Hints are in 1.0's voice (lowercase, short, no form names).

| Name (suggested id) | Unlock (suggestion) | Hint | Description | Paid? |
|---|---|---|---|---|
| Terminal beige (`beige`) | Raise a Program line to its elder | "see a program through to the last version." | The yellowed beige of an old office terminal, with a darker band like a keyboard tray. | free (earn) |
| Rivet plate (`rivet`) | Raise an Iron line to its elder | "wear one down to the last bolt." | Gunmetal with a row of rivets along the edges and one rivet missing. | free (earn) |
| Membrane (`membrane`) | Raise a Wetware line to its elder | "keep something soft alive to the end." | A pale, slightly translucent pink with faint veins near the corners. | free (earn) |
| Scorched (`scorched`) | See a Rogue self-destruct once | "it chose how it ended." | Black with a burnt orange edge, as if the casing had been through a fire. Spoiler for Rogue; the hint gives nothing away. | free (earn) |
| Clinic white (`clinicwhite`) | Clear 25 bugs at the clinic, across lives | "get it fixed, twenty-five times." | Clean white with one pink cross in a corner. A light shell, so its labels darken (as 1.0's Platinum). | free (earn) |
| Bug-eaten (`bugeaten`) | Carry 5 bugs at once and live | "let it break, and keep going." | The default shell with a few small holes eaten out of the edges, the bug tears' look on the casing. | free (earn) |
| Even keel (`evenkeel`) | Hold both Standing tracks within 1 for a whole adulthood | "never lean either way." | A split shell, corp grey on one half and street violet on the other, meeting exactly in the middle. | free (earn) |

## Tints (5)

Tints colour the LCD. 1.0's 10 carry over unchanged.

| Name (suggested id) | Unlock (suggestion) | Hint | Description | Paid? |
|---|---|---|---|---|
| Scrub green (`scrubs`) | First clinic visit | "everyone ends up at the clinic." | The muted green of hospital scrubs. | free (earn) |
| Infrared (`infrared`) | Survive 10 Rogue sweeps | "stay cold while they look for you." | A dark red screen with the brightest cells turning orange, like a thermal camera. Needs the 3:1 contrast check on every palette. | free (earn) |
| Sepia (`sepia`) | Read every NL-0 page | "learn where the first one came from." | Old photograph brown, for the story pages. | free (earn) |
| Night shift (`nightshift`) | 30 nights slept with the lights off | "turn the lights off when it sleeps." | A deep blue that keeps the netling readable at low brightness. A care-habit reward rather than a skill one. | free (always) |
| Paper (`paper`) | Free, or 100 hours awake with the lights on (placeholder) | "read it in the daylight." | The one light screen: a pale grey-green reflective LCD with everything drawn dark on it. Needs its own contrast bars (Build pass, Paper). With the lights off it falls back to a dark screen in the palette's own colours. | free (earn) |

## Screen effects (13)

Effects are overlays on the LCD. 1.0's 12 carry over unchanged. Every one must keep the flash rule and have a calm version for reduced motion.

| Name (suggested id) | Unlock (suggestion) | Hint | Description | Paid? |
|---|---|---|---|---|
| Dot matrix (`dotmatrix`) | free | | A fine grid between the cells, so each pixel reads as a separate LCD dot. Still. | free (always) |
| Ghosting (`ghosting`) | 100 hours awake, across lives | "watch it for a long time." | Old LCD lag: a cell that turns off fades over 200 ms instead of snapping. A fade, not a blink, so it adds no flashes; needs the flash test on the composed screen anyway. | free (earn) |
| Condensation (`condensation`) | A Wetware line to its elder | "keep it warm and wet." | A few still droplets on the glass near the edges. With motion on, one droplet runs down every half minute. | split |
| Thermal (`thermal`) | See a Rogue form | "it hides from heat, not light." | A soft heat-map wash: warmer colours where the netling is, cooler at the edges. Still. Spoiler-light: Rogue already uses a thermal look in its effects. | free (earn) |
| Vignette (`vignette`) | free | | Darker corners, as on an old tube. Still. | free (always) |
| Interference (`interference`) | 10 relay jack-outs | "leave by the back door, ten times." | A thin horizontal band of noise that drifts down the screen once every 10 seconds; off with motion calmed. | split |
| Burn-in (`burnin`) | See a Rogue self-destruct once (with the Scorched shell) | "leave a mark." | The Scorched shell's look on the glass: a warm orange glow creeping in from the edges, darker at the corners, and a faint band burnt in where the status text sits. Still. | free (earn) |
| Sterile (`sterile`) | Clear 10 bugs at the clinic, across lives (the Clinic white shell's cousin) | "keep it spotless." | A cool white wash over the whole glass, slightly brighter at the top and bottom, like clinic lighting. Still. Raises the black level, so it is held to 12% white and checked against every palette and tint. | free (earn) |
| Brushed (`brushed`) | Raise two Iron lines to their elder (pairs with the Rivet plate) | "wear it down twice." | Fine horizontal grain across the glass and one soft diagonal sheen, like brushed metal. Still. | free (earn) |
| Pulse (`pulse`) | Raise two Wetware lines to their elder (pairs with Membrane) | "keep it alive twice over." | A warm red-pink glow at the edges that swells and settles every 6 seconds, a slow ease with no flash in it; calm holds it at full strength. | split |
| Dust (`dust`) | Raise two Program lines to their elder (pairs with Terminal beige) | "leave it on the desk." | A few still specks and two hairlines on the glass, as on an old office terminal. | free (earn) |
| Dead cells (`deadcells`) | Carry 5 bugs at once and live, twice (pairs with Bug-eaten) | "let it rot a little." | Four cells that will not light (a dark patch over whatever is under them) and one stuck lit. One cell is one LCD pixel. Still. | free (earn) |
| Split tone (`splittone`) | Hold both Standing tracks within 1 for two whole adulthoods (pairs with Even keel) | "one half each." | A cool corp grey wash over the left half and a street violet over the right, meeting in a hairline seam, each under 10%. Still. | free (earn) |

## Sounds (5)

Home sounds only, as in 1.0 (netruns keep each region's voice). Described as 1.0's are: a wave and a pitch multiplier, plus anything new they need.

| Name (suggested id) | Sound | Unlock (suggestion) | Hint | Paid? |
|---|---|---|---|---|
| Relay (`relay`) | Square, 0.8, very short, with a click at the start: a relay closing | 50 Iron feeds | "keep the machine fed." | free (earn) |
| Wet (`wet`) | Sine, 1, with a quick downward bend at the end: a drop into water | 50 Wetware feeds | "keep the culture fed." | free (earn) |
| Modem (`modem`) | Square, 1.5, two quick alternating tones per note | 50 Program feeds | "keep the process fed." | free (earn) |
| Muffled (`muffled`) | Triangle, 0.6, low and soft, as through a wall | 25 Rogue hides | "say it quietly." | free (earn) |
| Clinic (`clinic`) | Sine, 1.75, a short two-note bell like a waiting room call | 10 clinic visits | "listen for your name." | free (earn) |

## Crests (10)

Crests are line goals read from the lineage records (1.0). Two of 1.0's 11 (Full house and Rack mount) need new definitions in 2.0. The maintainer dropped two temper crests as too many, so none of these is about temper. The first five are line goals the first drafts needed; the last five (added 2026-10-13, further option 4) cover the mechanics they leave out. **Each of the last five needs a field the lineage record does not keep yet**, as 1.0's `LEGACY` rules read only what a record holds: a Rogue self-destruct count (the Fuse), a clinic visit count (the Ticket), the final corp and street Standing of an adult (the Keycard and the Street tag; Standing resets each life, so the record must keep its end value) and a good-end flag (the Open door). That is a save-format addition in 2.0, not a prototype matter. Fuse, Ticket, Keycard and Street tag are all numbers to measure on the simulator before they are fixed.

| Name (suggested id) | Unlock (suggestion) | Hint | Shape | Paid? |
|---|---|---|---|---|
| Three eggs (`threeeggs`) | A finished life on each launch egg, anywhere in the line's history | "raise one of every kind." | Three small eggs in a row. The shell with the same idea was dropped. | free (earn) |
| Scales (`scales`) | An adult with both Standing tracks within 1 | "neither side owns it." | A balance with its pans level. | free (earn) |
| Plus (`plus`) | A whole life with no bug left untreated for a day | "fix it before it sets in." | A clinic cross. | free (earn) |
| Wanted (`wanted`) | A Rogue line three generations long | "keep running, three times over." | A torn poster corner with a dot for a face. Spoiler-light. | free (earn) |
| Full tree (`fulltree`) | Every adult of one egg raised in the line (a 2.0 redefinition of Full house, one egg at a time) | "raise every grown shape of one kind." | A small tree with nine leaves. | free (earn) |
| Fuse (`fuse`) | Three Rogue self-destructs in the line | "light it, three times." | A round bomb with a short fuse and a spark. Spoiler for Rogue. | free (earn) |
| Ticket (`ticket`) | 25 clinic visits in the line | "stay on the books." | A queue ticket with a notch in each side and a number. | free (earn) |
| Keycard (`keycard`) | An adult whose corp Standing ended 10 or more over its street Standing | "belong to the building." | A corp pass on a clip, its chip a small grid. The number is a placeholder to measure. | free (earn) |
| Street tag (`streettag`) | An adult whose street Standing ended 10 or more over its corp Standing | "belong to the street." | A sprayed X with paint running from its lower ends. The number is a placeholder to measure. | free (earn) |
| Open door (`door`) | The Rogue good end reached in the line | "leave by the front door." | A door frame with the door swung open and a gap of light. Spoiler-light. | free (earn) |

## Music (5)

Home background music, as 1.0's `tracks.js` (netruns play their own). The sketch allows one track per egg ("one track or timbre per egg possible").

| Name (suggested id) | Feel | Unlock (suggestion) | Hint | Paid? |
|---|---|---|---|---|
| Compile (`compile`) | Program: busy arpeggios over a steady pulse, A minor, 116 BPM, with a short beep at the end of each phrase like a build finishing | A Program adult | "let it build." | free (earn) |
| Foundry (`foundry`) | Iron: a slow industrial loop, D minor, 88 BPM, a hammer on every fourth beat and a hiss of steam every few bars | An Iron adult | "hear the shop floor." | free (earn) |
| Culture (`culture`) | Wetware: warm pads and a soft heartbeat kick, F major, 66 BPM | A Wetware adult | "listen to it grow." | free (earn) |
| On the run (`ontherun`) | Rogue: tense and off-kilter, E minor, 104 BPM in 7/8, sparse percussion that drops out when a sweep would come | A Rogue adult | "it never sits still." | free (earn) |
| Waiting room (`waitingroom`) | Soft clinic muzak, C major, 80 BPM, with a ticket chime every 8 bars (a sibling of 1.0's Corp lobby) | 10 clinic visits | "take a number." | free (earn) |

## Device label (3)

1.0's label is up to 10 characters and unlocks when the first netling dies. Ideas for how it looks, not what it says:

| Name (suggested id) | Unlock (suggestion) | Description | Paid? |
|---|---|---|---|
| Label tape (`labeltape`) | With the label | The label in raised white letters on a strip of black embossing tape, slightly crooked. | paid |
| Etched (`etched`) | A line ten generations long | The label cut into the shell, no background. Built as lettering a step lighter than the shell with a dark inner edge, not "darker than the shell colour" as first written: darker lettering cannot reach 3:1 on a dark shell. On a light shell it stays dark. | free (earn) |
| Sticker (`sticker`) | 5 visitors greeted | A peeling sticker with a curled corner, in the egg skin's colour. | paid |

## Bigger asks (new categories)

Paid status for these is in Paid options below. Each would add a wardrobe tab, which the UI allows ("Adding a category adds a tab"), but each is a new system, not just new items.

- **Room.** A backdrop for the LCD behind the netling: a server room with a rack outline, a lab bench, an alley wall, a nest of cables. Drawn in the dim cells only, so the netling and its marks always win. Unlocks per region cleared. The largest of the three: it touches every screen and every contrast check.
- **Bed.** What the netling sleeps on when it rests (a charging dock, a cot, a cushion, a cardboard box for Rogue), drawn under the asleep pose. Small, and gives the sleep pose some variety.
- **Visitor card frame.** A border for the visitor card and its QR code (1.0's `visitcard.js`), so a player's card shows their style to friends. Cheap, but touches the card format, which is shared between devices.

## Paid options (planning, nothing decided)

Every table above has a **Paid?** column. There is no monetization in 1.0 or in any 2.0 plan so far; this marks which ideas could be paid, and which should stay free, if 2.0 ever sells style items.

| Value | Meaning |
|---|---|
| free (find) | Drops in netruns or is sold for scrip, as 1.0's findable items. |
| free (earn) | Granted for something the player did (an achievement, a line goal, a lore reward). Never sold. |
| free (always) | Available from the start; a readability or comfort option. Never sold. |
| paid | Bought with real money; no free version. |
| split | A still version free (findable), the animated version paid. The still version is exactly the reduced-motion picture, so a reduced-motion player gives up nothing by not paying, and the store should say that a paid animation will not move for them. |

**Constraints (from how the game works today).**
- **Nothing can verify a purchase yet.** Saves and transfer codes are offline and self-contained, and "the lock is not copy protection" ([DATA_AND_SAVES.md](DATA_AND_SAVES.md)); stored and imported data is treated as hostile. A purchase cannot live in the save or the transfer code without being copyable, so paid items need an outside source of truth (app store purchases, for one). That is new infrastructure and the largest cost here.
- **Paid items stay out of the drop tables, the shops and the visitor gifts.** Visitors wear random findable wearables and can gift them (`visitAccGifts`), which would hand out a paid item for free. Showing a paid item on a visitor or a visitor card is fine (it advertises itself).
- **Paid items keep every rule:** the flash rule, the 3:1 contrast check on every palette, the room rules, and no gameplay effect.

**Keep free.**
- Everything earned: 1.0's crests, challenge rewards (Cut cable, Blackout, Bare metal and the rest), codex tints, the Party hat, the Bandage, the Plush, the Mini device, 2.0's Metronome, and the earned ideas above.
- Anything that tells the player something: the Heat sink as drafted (it glows in Overclock); sell it plain or not at all. Infrared and Thermal are close to Rogue's hunt, so they stay earned.
- Readability and comfort: Dot matrix, Vignette, Night shift, and the recolor controls 1.0 already gives ten wearables.
- The animation on 1.0's 41 wearables and 8 props: 1.0 players own the Progress bar, Rain cloud, Drone and the rest animated, so a 2.0 split would read as taking something away. Splits are for new items only.
- The Light ring's motion (the travelling glow and the face phase) would be the best animated upgrade on the list, but the ring is a very rare Deep find with a story (Blank), so it stays findable whole, both versions included.

**Other paid shapes besides motion.**
- **Colourways:** a findable or earned shell, prop or wearable free in its own colours, with alternate colourways paid. Suits shells, since a 2.0 shell recolours the UI surfaces.
- **A glow:** a flat shell free, the same shell with a slow glow paid (as 1.0's Source light breathes).
- **Remixes and packs:** extra music tracks and sound packs in themed packs; the four egg tracks stay earned.

**The bigger asks, priced.** Room backdrops are the strongest paid category (packs, a few free by region cleared); beds paid, with a free default dock; visitor card frames paid, since friends see them.

**Recommendation.** Price only the new categories (rooms, beds, card frames), colourways and a few new decorative props, wearables and effects as above; leave every 1.0 item and every earned item as it is. That avoids any sense of taking things away and keeps the earning loop whole.

## Art drafts (2026-10-12)

First drafts of every wearable (26, the Light ring in two versions), prop (10) and crest (5) above, in `prototype/netling2/accessory-ideas.js`. Shells, tints, effects, sounds, music and labels are not drawn. Wearables use 1.0's `draw(px, anchors, frame, time)`, props `draw(px, frame, time, extra)` with a size, crests 9x9; `registerIdeas()` adds them to 1.0's tables at run time (prototype only, `src/` untouched, `source: 'earned'` so they never enter drops, shops or visitor gifts), so the real `placeWorn` and `drawProp` place them through the 2.0 renderer.

- **The Laughing Man ring, as the Light ring** (maintainer, 2026-10-12: shown under a different name; id still `laughingring`, nothing reserved). The 2026-10-07 drawing for Blank was never committed. A first redraw from the description (blue dashes, one white dash travelling) was rejected as broken and shaded; it is now drawn from the maintainer's memory of the original: **an unbroken pale oval** (`#c0eeff`, brightened from `#8fd8ff` at the maintainer's ask, one cell wide, every cell touching the next) from two cells outside the head's sides and two rows over the head top to two rows under the mouth, clear of the outline so it reads as a glow round the head, with **a glow sliding round it counterclockwise** (three white cells with a dim wake behind them that moves with the spot, maintainer 2026-10-12: two cells darker than the ring, then two halfway back; two cells every 200 ms: a lap of about 2.5 to 4 s; sped up at the maintainer's ask to the fastest the flash rule allows, since each cell must hold a colour for `FLASH_TOGGLE_MS`). Recolorable (ring and glow), so the blend check never splits it into two tones over the body. **It is exclusive** (maintainer): worn, it hides every other face item and any worn item with a pixel on the ring or inside it (row by row), which in practice is every head item; float items over the head and body items below the mouth stay. This lives in the prototype renderer (`render.js` `exclusiveWorn`, driven by `exclusive: true` on the item; 1.0's lists pass through unchanged); a 2.0 wardrobe would need to grey out what it hides. Before this it had only been seen on the Wetware hidden line; the review page shows it on six forms including Blank (`wetwareElderHidden`), and `#sec=ring` shows an outfit with and without it. GIF: `style-ideas-light-ring.gif` (6 s, all three rows of `#sec=ring`).
- **The Light ring's face (2026-10-12, wired in).** Every other lap the oval fills in with a face and clears again while the glow keeps circling (maintainer). In and out by a **wipe from right to left both times**: the face appears from the right edge, holds, and disappears from the right edge. Timing (decided): fill 0.8 s, hold 1.5 s, clear 0.8 s, starting at the second lap of a two-lap cycle (three laps on a ring whose lap is too short for the face to fit, so it never cuts off; a lap is 100 ms a cell). **Two versions of the ring** (maintainer: both kept): `laughingring`, **Light ring (smiley)** (two eyes, a curved grin), and `laughingring.cap`, **Light ring (cap and grin)** (Laughing Man-ish: a dark cap and brim, eyes, a wide grin with a tooth row). The fill is the ring's colour, the features the wake's dark blue. The layout is computed per oval (`faceFeatures`): the eyes always keep a clear row from the mouth and the cap, and on small ovals the eyes drop to one row, the smile's corners climb one row instead of two, the cap loses its dome and the grin its bottom row (the first draft's smiley ran its eyes into its mouth on Rogue's Dodge adult). **No face asleep, in a visit or with reduced motion** (decided): the renderer swaps in a faceless ring (`render.js` `calmWorn`, driven by `quietId` and `stillId` on the item; asleep and in a visit the glow keeps circling, with reduced motion the ring stands still). Review page `#sec=versions` (live) and `#sec=face` (stills, full and halfway through the wipe in); `style-ideas-light-ring-faces.png`, `style-ideas-light-ring-versions.gif`. Words do not fit at this size.
- **Free and paid versions.** A **split** idea draws as its animated (paid) version under its id and as a free version (id + `.free`) that is exactly one frame of the animation, the reduced-motion picture. A **paid** idea has no free version in the tables above, so its free comparison is a plainer still drawing (the Thought bubble empty; the Desk terminal without stand or cursor; the Noodle cup without steam or band; the Lava lamp with one resting blob; the arcade cabinet with a dark screen). The Heat sink is drawn plain, with its Overclock glow as a separate review-only entry.
- **Review page:** `prototype/netling2/accessory-ideas-preview.html` (`#sec=wear`, `eggs` (every wearable on a baby and an adult of each egg; `from=n`, `n=n`), `room`, `palettes`, `motion` (`form=n`, `only=id`), `props`, `crests`, and for the Light ring `ring` (what it hides), `versions` (both versions live) and `face` (stills of the wipe); `scale=n`, `t=ms` to freeze), served by `npm run serve`. Screenshots: `docs/netling2-prototypes/shots/style-ideas-wearables.png`, `style-ideas-light-ring-blank.png`, `style-ideas-light-ring.gif`, `style-ideas-wearables-motion.png`, `style-ideas-props.png`, `style-ideas-crests.png`, `style-ideas-room.png`, `style-ideas-palettes.png`.
- **Tests:** `accessory-ideas.test.js` (15, in `npm run proto:test`): the Light ring is an unbroken loop on every form and its exclusion holds on every form; its faces keep the eyes clear of the mouth and cap on every form; the wipe runs right to left in and out on the decided timing and never cuts off; both versions draw a face and the renderer swaps in the faceless ring asleep, in a visit and with reduced motion; every idea in these tables has art with the table's Paid? value; a split's free version is a frame of its animation and a paid one's is not; nothing leaves the top of the 2.0 screen on any of the 76 forms at the highest each frame stands in 1.0's idles; every cell holds each colour at least `FLASH_TOGGLE_MS`; the still ideas do not move; props stay inside their size; crests are 9x9; no idea blends into any palette on any form; every body and float idea is in `ROOM` and is covered no more than 6% of the time by the head and face wearables it meets.
- **Checks added (2026-10-13).** The palette blend check, the room rules and a four-egg review render now exist (below). **Still not done:** the Lava lamp's floor glow with the lights off (1.0's `drawProp` dims every prop), a review beyond one baby and one adult per egg on the `eggs` page, and any device check. The overlaps the next list names were looked at in screenshots only.
- **Blend check (every idea, 76 forms, 6 palettes, 3 frames).** Everything passes the 1.0 rule (a cell touching the body is 30 apart from it in colour) through `placeWorn`'s own swap, except the Light ring: it is recolorable, so the swap leaves it alone, and it melted into ice's cyan body and origin's pale one. It now has automatic colours for those two palettes in `AUTO_COLORS` (ice: white ring, blue glow; origin: blue ring, pink glow), as 1.0's recolorable wearables do. `RING_AUTO` in `accessory-ideas.js`; the test is the one on blending in `accessory-ideas.test.js`. `#sec=palettes` shows it.
- **Room rules (every body and float idea).** 1.0's `ROOM` table (which items slide down past face and head items, or lift over hats) is now exported from `src/accessories.js` (the one `src/` change in this work: `const` to `export const`, no behaviour change) and `registerIdeas()` adds the ideas: the Dog tags, Hazard sash, Pulse patch, Heat sink and Visitor pass slide down; the Leash cable lifts (sliding down left it on the jaw items four times as often); the Loading spinner, Notification badge, Thought bubble and Padlock lift over hats; the two orbiters (Bit swarm, Mini satellite) make no room, as 1.0's. Measured against every non-orbiting head and face wearable on a third of the forms, the room cut how often an item is covered by a factor of three or more, and no idea is covered more than 6% of the time on that sample (the Notification badge 5.6%, the Visitor pass 3.8%, the rest under 3%; 1.0's Scarf: 1.7%). The test requires 6% or less. `#sec=room` shows it. Two revisions came out of it: the **Dog tags** hang one row shorter (the plates at 1 to 2 and 2 to 3 rows under the neck, not 2 to 3 and 3 to 4), and the **Notification badge** sits on the head's top right corner half outside it, as on an app icon (it was over the head and met wide hats such as the Cat-ear headset and the Satellite dish 13% of the time; now 6%).
- **Judgement calls to review:** War paint is dark by default (the doc's contrasting colour; pink merged with the default eyes); the Notification badge is 5x7 to fit a readable digit; the Thought bubble's chip, heart and skull are 5x3; the Bit swarm and Mini satellite step a cell every 400 ms (1.0's Drone moves continuously) so the flash test holds.

## Palettes (2026-10-13)

Five more netling palettes, built in `prototype/netling2/palettes.js` (`registerPalettes()`; `src/` untouched). 1.0 has six (ice cyan, neon pink, acid yellow, toxic green, ultra violet, and origin's pale lilac, root-only); the gaps are orange and a true blue.

| Name (id) | Body | Eyes (accent) | Why |
|---|---|---|---|
| Ember (`ember`) | `#ff8a1a` orange | `#fff3d6` warm white | Fills the gap between neon and acid. A mid-tone accent cannot be 2.1:1 on a body this bright and 4.4:1 on the dark screen at once, so the eyes are warm white. |
| Cobalt (`cobalt`) | `#4d8dff` blue | `#f9f002` yellow | Fills the gap between ice and ultra. Yellow eyes, as ultra's. |
| Mint (`mint`) | `#5dffb0` mint green | `#ff2a6d` pink | Fills the gap between ice's cyan and toxic's lime (52 from ice, the nearest). Its highlight marks are dark (`#2b1b5a`), as acid's and toxic's, since white on it is 1.17:1. Added after a second search of sixteen candidates (2026-10-13): the only one to pass every bar. |
| Peach (`peach`) | `#ffb38a` pale orange | `#2b1b5a` dark purple (`ink` `#ff5c7a`) | Fills the pale gap between ember and neon (43 from ember). Dark eyes read at 8.6:1 on the pale body. Dark highlight marks (white on it is 1.60:1). |
| Rose (`rose`) | `#ff8fb8` pale pink | `#1a0a3a` dark purple (`ink` `#b967ff`) | A pale pink (41 from neon). Dark eyes at 8.6:1. Dark marks (white is 1.95:1). |

Bars, from the six: the body 4.5:1 and the accent 4.4:1 against every tint's screen colour, the accent 2.1:1 against the body, the highlight marks 2:1 on the body (white, or a dark mark as acid, toxic and origin have), and the body at least 35 apart (CIE76) from every other body. Both pass (palettes.test.js), and so does the wearables' blend check on every form (1.0's, the ideas, and the recolorable ones through automatic colours computed by `tools/wearable-colors.mjs`'s own method). Candidates first dropped: coral (its accent fails the screen contrast), aqua (too near toxic), a darker cobalt (`#3d7bff`, 4.2:1 on the screen). **Not done:** 1.0's `rollQuirk` rolls only the palettes that existed when `sim.js` loaded (`BASE_PALETTES`), so a newly hatched netling does not roll them until the real sim changes; the palettes are placed before `origin`, so `origin` moves from index 5 to 8, which a save-format change in 2.0 must account for (`quirk.palette` is an index); the wearables' automatic colours, the gallery and the field manual would be regenerated; no device look.

**`ink`: a colour for what is drawn on the screen (peach and rose, 2026-10-13).** A palette's `accent` is the eyes on the body, but 1.0 also draws it straight on the dark screen: the flatline, the virus, the cache nodes, PAUSED, the glow and a few particles (`src/render.js` lines 104, 111, 171, 182, 234, 236, 247, `src/main.js` 268, `src/sprites.js` 6 for the eyes). A dark accent cannot be 4.4:1 there, so peach and rose carry an optional `ink`, and the bar for the on-screen colour applies to `ink ?? accent`. In the prototype only the flatline reads it (`render.js`); a real build would change those `pal.accent` uses that sit on the screen to `pal.ink ?? pal.accent`, a one-word change each, with the eyes (`paletteColors`) keeping `accent`. A palette with no `ink` is unchanged. The Infrared tint and the tint tests use `ink ?? accent`.

## Build pass: shells, tints, effects, labels, the Lava lamp glow (2026-10-13)

Built in the prototype, in 1.0's shapes so they could move to `src/` and `style.css` unchanged. Sounds and music are not built (nothing here can be heard).

- **Files.** `style-ideas.css` (shells `.device.shell-<id>`, effects `.screen.fx-<id>`, labels `.device.label-<id>`; load after `style.css`), `style-ideas.js` (ids, names, hints, unlock text and the colours the tests measure; Infrared's recolour), `ghosting.js` (the one pixel effect), `style-ideas-preview.html` (`#sec=shells`, `tints`, `effects`, `labels`, `glow`; `scale=n`). Tests: `style-ideas.test.js` (15), `palettes.test.js` (4), and, for the glow, one in `accessory-ideas.test.js`.
- **Shells (7).** Terminal beige, Rivet plate, Membrane, Scorched, Clinic white, Bug-eaten, Even keel. The three light ones (beige, membrane, clinic white) darken the dim colour and the logo as Brushed chrome does. Rivet plate and Even keel were darkened until the HUD text and the dim colour held 4.5:1 (the first rivet grey gave 4.1:1; Even keel's grey half 2.8:1). The corp grey half of Even keel is therefore dark: `#2b3039`.
- **Tints (the first four).** Scrub green, Infrared, Sepia, Night shift, each 4.5:1 for every palette's body and 4.4:1 for its accent (all eight palettes), and at least 6 apart from every 1.0 tint. Scrub green and Sepia were darkened from first picks that missed 4.4:1 for ice's pink accent or sat too near Amber. **Infrared** is a recolour by brightness (`infraredMap`: deep red `#8a1414` to pale orange `#ffe08a`, square root of luminance); every palette's body holds 4.5:1 and its eyes 3:1 on the screen, and the eyes 1.5:1 on the body (1.0's palettes are 2.1:1 or better in their own colours, so Infrared reads flatter by design). Its recolour is a function, not wired into the canvas pass.
- **Screen effects (13: six first, then one paired with each new shell, below).** Dot matrix (a grid between cells, in place of the scanlines; still), Ghosting (a cell that turns off fades over 200 ms: `createGhosting().step(cells, now)`, a fade in one direction only so it adds no flashes, off with reduced motion), Condensation (still droplets; one runs down every 30 s, a 3 s slide with 0.6 s fades), Thermal (a still heat wash, no overlay above 0.2 alpha), Vignette (still; 0.42 at the very corners, the middle 58% untouched), Interference (a thin noise band drifting down every 10 s; hidden with motion calmed). No animation runs a cycle under 1 s and none is stepped; the test reads the CSS to check that.
- **Device labels (3).** Label tape, Etched (revised, see its row) and Sticker (in `--skin`, the egg skin colour; dark lettering reads 4.5:1 on every palette's body). Their CSS is for the label's look only; what the label says is 1.0's.
- **Lava lamp floor glow (generalised below to four props).** With the lights off and the lamp's own switch on (`propGlow`, on by default; the pet field `render.js` reads), the lamp's glass and caps dim as every prop's do, its blobs stay lit a step deeper than by day, and an orange pool (alpha 0.06 to 0.22, two rows) lies on the floor under and beside it. Still, apart from the blobs' 800 ms step. Switched off, or in light, it is 1.0's dim prop as before; the plain (free) lamp glows the same way with its one resting blob. The switch is per prop, as asked: nothing is stored here, and where the switch lives in the wardrobe (a toggle on the prop's row) is for the UI doc.
- **Recolourable ideas (2026-10-13).** The Goggles (strap, frame, glint), Hard hat (shell, stripe), Hood (cloth, edge) and Dog tags (chain, tags) are recolorable as 1.0's ten wearables are, with automatic colours for every palette (`palette-colors.js`, generated by `palette-colors.mjs` the way `tools/wearable-colors.mjs` does the six; the War paint and the Light ring's new palettes too). The default picture with no pick is the first palette's automatic colours, so the signature colours (the Hard hat's yellow, the Goggles' brown) show only where they stand clear of the body, as the Cap's do. The Goggles' glint is a slot of its own because a fixed colour is not blend-swapped once an item is recolorable (it melted into origin). A test checks that every slot is drawn, defaults equal the plain draw, and every palette has colours. Screenshot: `style-ideas-palettes.png`.
- **Effects paired with the new shells (2026-10-13, further option 3).** **Burn-in** (the Scorched shell's look on the glass: an orange glow creeping in from the edges, darker corners, a faint band burnt in where the status text sits; still) and **Sterile** (a cool white wash, 12% at most, a little brighter at the top and bottom; still). Sterile raises the black level, so a test lays the wash over both the body and the screen colour for every palette and every tint (15 tints, all 11 palettes) and holds 3:1; no overlay in either goes past 0.45 alpha. Unlocks pair them with the Scorched shell (a Rogue self-destruct) and the clinic (10 bugs cleared). Both look the same on a dark and a light shell, since an effect sits inside the screen: the effects page takes `shell=shell-clinicwhite` and the light-shell look (further option 8) is now seen for all eight; screenshot `style-ideas-effects-light.png`.
- **More props lit in the dark (2026-10-13, further option 5).** The Lava lamp's glow is now shared by the **Mini arcade cabinet** (screen stays lit with its picture, the floor takes the picture's colour, changing with the picture every 3 s), the **Server tower** (green light and the stepping cyan one stay lit, a faint green pool) and the **Desk terminal** (screen stays a deep green with the prompt lit and the cursor blinking on its 500 ms rhythm, a green pool). Same switch (`propGlow`, per prop, default on), same rules: a pool of at most 0.22 alpha on the two floor rows, still apart from the prop's own motion, no cell toggles faster than 200 ms (checked for every glow). A paid prop's free version glows only if it has a plainer picture that does (the free lamp and terminal do; the plain cabinet's screen is dark, so it does not); a split prop's free glow is its animated glow at its still frame (the free tower). Shared code: `litInTheDark` and `poolCells` in `accessory-ideas.js`. `style-ideas-glow.png` shows all four.
- **The rest of the shell-paired effects (2026-10-13, finishing further option 3).** Every new shell now has an effect, one to one (`shell` in `style-ideas.js`, checked): **Brushed** (Rivet plate: fine horizontal grain and a soft diagonal sheen; still), **Pulse** (Membrane: a warm red-pink edge glow that swells and settles every 6 s, a 3 s ease each way, calm holds it at full strength; split), **Dust** (Terminal beige: still specks and two hairlines), **Dead cells** (Bug-eaten: four cells that will not light and one stuck lit, each exactly one LCD cell on the grid, which a test checks) and **Split tone** (Even keel: a corp-grey wash on the left half and a street-violet one on the right, each under 10%, a hairline seam). Unlocks are placeholders in words, mostly "twice" the shell's condition. `style-ideas-effects.png` shows all thirteen.
- **The rest of the props lit in the dark (2026-10-13, finishing further option 5).** The glow now covers eight props: the **Petri dish** (the culture glows where it has spread, via `extra.growth` or the day clock; a faint green pool), the **Fishbowl** (water takes a faint blue, the fish stays lit; split, so its free version is the still frame) and 1.0's **Cyberdeck** (screen lit, its white blink on 1.0's frame) and **Boom box** (display lit, speakers pulse on the frame). The two 1.0 props get their `glowDraw` attached to their entries at run time by `registerIdeas()` (`GLOW_1_0`), so `src/accessories.js` is not edited for it; a real build would put the glows in those entries. The renderer now hands a glow the prop's `extra`. `style-ideas-glow.png` shows all eight.
- **Five more crests (2026-10-13, finishing further option 4).** Fuse (Rogue self-destruct), Ticket (clinic visits), Keycard and Street tag (the two Standing sides), Open door (the Rogue good end): 9x9, drawn in `accessory-ideas.js`, checked by the existing crest test plus one for distinctness (no two crests, 1.0's included, within 10 cells of each other, and 14 to 45 cells lit). They need lineage-record fields 1.0's does not keep (Crests lists them), and the thresholds are placeholders. `style-ideas-crests.png` shows all ten beside 1.0's Helix.
- **Paper, the light screen (2026-10-13, further option 2).** The one tint with a pale screen: `#d4dac2`, a grey-green reflective LCD. Everything drawn on it goes dark, and two mechanisms do that, both only with the lights on (in the dark the screen is `#10120c` and the palette's own colours return, as any tint). (1) **`paperPalette`** recolours a palette by role, because one hex can hold two jobs (neon's body is ice's eyes): the body is a hand-picked dark of the same hue (`PAPER_BODIES`, luminance 0.1 or less), the eyes (the accent) go pale (luminance 0.75, hue kept) since they now sit on a dark body, `ink` (the flatline) goes dark and the marks are paper white. (2) **`paperMap`** darkens every other colour (props, wearables, the dead grey) by inverting its lightness. A plain map alone was tried first and could not be made to work: with one lightness map no setting kept every palette's eyes readable (toxic, origin, mint and peach failed at every setting I searched). The renderer (`render.js`) applies both: `composeLCD` returns `recolor` for a light tint, and `paintLCD` runs the scene through a context that remaps each `#rrggbb` fill, except the screen's own colours. It also does 1.0's blend swap in paper space: a recoloured cell on or beside the body that lands within 25 of the body (or, off the body, of the paper) is redrawn in near-black or paper white, which is what stops a wearable melting into a dark body (42 of the items had a cell that did before it). Bars, all tested: body 4.5:1 and on-screen colour 4.4:1 on the screen for all 11 palettes, eyes and marks 3:1 on the body, no two bodies within 25 (CIE76) of each other (the dark screens' bodies are 35 apart; the dark range is narrower), no worn item blending into the body, and no prop under 2.5:1 on the screen. Costs and limits: the paper bodies are darker and duller than the palettes' own, ultra and cobalt most (dark violet and navy), so a netling does not look quite the same colour as on any other tint; the effects were not looked at on paper (the dark-screen ones, such as Vignette and Burn-in, assume a dark glass, and Sterile's white wash was tested on it but only for contrast); the 1.0 pixel effects that draw light colours (Code rain, Bloom, Aurora) would be pale on paper and are not reworked; nothing is wired into a real canvas loop (the recolouring context is in the prototype's `paintLCD`, and the real `src/render.js` would need the same). The unlock is a placeholder. Screenshot: `style-ideas-tints.png` (Paper on all 11 palettes, then lights off, dead, and with a prop and the Goggles).
- **Not done:** the effects were checked by reading the CSS and in screenshots, not run through the flash test on a composed canvas (the CSS ones are not canvas; Ghosting's test is pure); no device look; `ghosting.js` and Infrared are not wired into the real canvas loop; the UI for the lamp's switch; unlocks are the doc's placeholders in words.

## Further style options (2026-10-13, for later passes)

Found by looking for gaps once the first builds were done. Items 1 and 6 were built the same day (Palettes, Recolourable ideas above); the rest are open, in the order suggested.

1. **More palettes, if the on-screen colour is split from the eyes.** Done: `ink`, with peach and rose (Palettes). Still open: a true red and a magenta, which sit within 30 of neon and ultra; they need a looser distinctness bar or a deliberate shift (a deeper red such as `#d81f2a` moves away from neon but fails the screen contrast).
2. **A light-screen tint.** Done (2026-10-13): Paper (Build pass). The decision was taken as: darken, not invert, with palettes recoloured by role.
3. **Effects that pair with the new shells.** Done (2026-10-13): one for each of the seven shells (Build pass).
4. **Crests for the new mechanics.** Done (2026-10-13): Fuse, Ticket, Keycard, Street tag and Open door (Crests). Left: the lineage-record fields and the thresholds, which need the simulator.
5. **A "lit in the dark" flag for more props.** Done (2026-10-13): eight props share the lamp's glow and switch (Build pass). Left: the other 1.0 props (Coffee mug, Briefcase, Burner phone, Spray can), the Cardboard box, Toolbox, Noodle cup, Signal jammer; most have nothing that would light.
6. **Wearable colourways.** Done for the Goggles, Hard hat, Hood and Dog tags. Cheap candidates left: the Cat-ear headset, Hazard sash, Visitor pass, Cable tangle, Teardrop code, Censor bar.
7. **Eggs as a style axis.** The open "egg ties" question: one or two items only an egg can earn, so the egg choice has an aesthetic meaning.
8. **Light-shell checks for the new effects.** Looked at on Clinic white (2026-10-13): an effect sits inside the screen, so the shell does not change it. Beige and Membrane were not separately looked at.

## Open questions

- **How many to add, if any.** 1.0 has 41 wearables and 49 style items in all; this list has 84. A handful per category would keep the wardrobe readable; the maintainer picks.
- **Where props live in the 2.0 wardrobe.** The UI's decided tabs are HEAD, FACE, BACK, SHELL, TINT, FX, SOUND, CREST, MUSIC and LABEL ([NETLING_2_UI.md](NETLING_2_UI.md)); props and two of 1.0's wear slots (body, float) are not named there. Worth settling before any are added.
- **Unlocks are placeholders.** Every condition above uses 2.0 mechanics as they stand in the simulator (Standing, the clinic, bugs, the egg pressures, the Rogue hunt) and would need the same measuring as 1.0's (how many lives a casual or attentive player takes to get one).
- **Duplicates (resolved 2026-10-13, maintainer):** the Three of a kind shell is dropped (the Three eggs crest stays) and the Hazard orange tint is dropped (1.0's Heatwave stays). The Clinic sound's hint no longer repeats the Waiting room track's.
- **Egg ties.** Whether 2.0 should give each egg a few items that only it can find or earn (a source rule, not a wear rule). The "Fits" column is written so it could become one, but nothing here assumes it.
- **Overlaps, checked in screenshots only** (now that the drafts exist): the Hood and Rogue's outline (stays on screen on every form), the Scan visor and the Visor (one line that keeps the eyes, against three that hide them), the Pulse patch and Wetware's shade, the Bit swarm and the Glitch moth, the Censor bar and the mouth-less forms (Blank, Cipher). None was judged on a device.

## Next steps (if the maintainer picks any)

Wearables and props: first drafts of all of them exist (Art drafts), and they now pass the palette blend check and the room rules. For each pick, redraw as needed and take a device look. The checks in full 1.0's wearables pass: no movement between the A and B frames, on screen on every form (`render.test.js`'s headroom test), the blend check against every palette, the room rules with every other slot, and a review render across all four eggs. Shells, tints and effects: a contrast check on every palette and both screens (the 3:1 asked of graphics), and the flash test for anything that moves. Sounds and music: written as 1.0's (`sound.js`, `tracks.js`) and heard on a device. Crests: a 9x9 pixel shape and a `LEGACY` rule.
