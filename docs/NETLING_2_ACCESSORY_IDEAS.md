# Netling 2.0 accessory and style ideas (drafts, text only)

An idea list for style items that 2.0 could add on top of 1.0's: wearables (1.0's 41 carry over unchanged; [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), "Wearables (41) and props (8)"), props, and the wardrobe's other categories (shell, tint, screen effect, sound, crest, music, label; [NETLING_2_UI.md](NETLING_2_UI.md), "STYLE (the wardrobe)"). 26 wearables, 10 props and 37 other style items (73 in all), plus three bigger asks, and a planning note on which could be paid (Paid options). **Nothing here is decided or shipped.** First art drafts of the wearables, props and crests exist in the prototype (Art drafts, below); everything else is text only. Names and ids are suggestions: an id becomes permanent only once it ships (CLAUDE.md rule 1), so none is reserved yet. Spoilers for the hidden forms where noted.

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
| Laughing Man ring (`laughingring`) | very rare, the Deep | Wetware, Blank | **Prototyped already** as one of Blank's elder options (2026-10-07; [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md), "Blank's elder in motion"), not chosen for Blank and kept as an accessory idea. A ring of dashes circling the face, the lit dashes in the highlight colour (in the hood's colour they vanished), with one bright dash travelling round once every few seconds. Spoiler-free name in the shop: "Smiling ring". | free (find) |
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

## Shells (8)

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
| Three of a kind (`tricolor`) | A full life on each of the three launch eggs | "raise one of every kind." | Three stripes, one in each egg skin's colour. | free (earn) |

## Tints (5)

Tints colour the LCD. 1.0's 10 carry over unchanged.

| Name (suggested id) | Unlock (suggestion) | Hint | Description | Paid? |
|---|---|---|---|---|
| Scrub green (`scrubs`) | First clinic visit | "everyone ends up at the clinic." | The muted green of hospital scrubs. | free (earn) |
| Infrared (`infrared`) | Survive 10 Rogue sweeps | "stay cold while they look for you." | A dark red screen with the brightest cells turning orange, like a thermal camera. Needs the 3:1 contrast check on every palette. | free (earn) |
| Hazard orange (`hazard`) | 24 hours in Overclock, across lives | "run it past the red line." | Warning orange, darker at the edges. Overlaps 1.0's Heatwave effect in spirit; pick one. | free (earn) |
| Sepia (`sepia`) | Read every NL-0 page | "learn where the first one came from." | Old photograph brown, for the story pages. | free (earn) |
| Night shift (`nightshift`) | 30 nights slept with the lights off | "turn the lights off when it sleeps." | A deep blue that keeps the netling readable at low brightness. A care-habit reward rather than a skill one. | free (always) |

## Screen effects (6)

Effects are overlays on the LCD. 1.0's 12 carry over unchanged. Every one must keep the flash rule and have a calm version for reduced motion.

| Name (suggested id) | Unlock (suggestion) | Hint | Description | Paid? |
|---|---|---|---|---|
| Dot matrix (`dotmatrix`) | free | | A fine grid between the cells, so each pixel reads as a separate LCD dot. Still. | free (always) |
| Ghosting (`ghosting`) | 100 hours awake, across lives | "watch it for a long time." | Old LCD lag: a cell that turns off fades over 200 ms instead of snapping. A fade, not a blink, so it adds no flashes; needs the flash test on the composed screen anyway. | free (earn) |
| Condensation (`condensation`) | A Wetware line to its elder | "keep it warm and wet." | A few still droplets on the glass near the edges. With motion on, one droplet runs down every half minute. | split |
| Thermal (`thermal`) | See a Rogue form | "it hides from heat, not light." | A soft heat-map wash: warmer colours where the netling is, cooler at the edges. Still. Spoiler-light: Rogue already uses a thermal look in its effects. | free (earn) |
| Vignette (`vignette`) | free | | Darker corners, as on an old tube. Still. | free (always) |
| Interference (`interference`) | 10 relay jack-outs | "leave by the back door, ten times." | A thin horizontal band of noise that drifts down the screen once every 10 seconds; off with motion calmed. | split |

## Sounds (5)

Home sounds only, as in 1.0 (netruns keep each region's voice). Described as 1.0's are: a wave and a pitch multiplier, plus anything new they need.

| Name (suggested id) | Sound | Unlock (suggestion) | Hint | Paid? |
|---|---|---|---|---|
| Relay (`relay`) | Square, 0.8, very short, with a click at the start: a relay closing | 50 Iron feeds | "keep the machine fed." | free (earn) |
| Wet (`wet`) | Sine, 1, with a quick downward bend at the end: a drop into water | 50 Wetware feeds | "keep the culture fed." | free (earn) |
| Modem (`modem`) | Square, 1.5, two quick alternating tones per note | 50 Program feeds | "keep the process fed." | free (earn) |
| Muffled (`muffled`) | Triangle, 0.6, low and soft, as through a wall | 25 Rogue hides | "say it quietly." | free (earn) |
| Clinic (`clinic`) | Sine, 1.75, a short two-note bell like a waiting room call | 10 clinic visits | "take a number." | free (earn) |

## Crests (5)

Crests are line goals read from the lineage records (1.0). Two of 1.0's 11 (Full house and Rack mount) need new definitions in 2.0. The maintainer dropped two temper crests as too many, so none of these is about temper.

| Name (suggested id) | Unlock (suggestion) | Hint | Shape | Paid? |
|---|---|---|---|---|
| Three eggs (`threeeggs`) | A finished life on each launch egg, anywhere in the line's history | "raise one of every kind." | Three small eggs in a row. Overlaps the Three of a kind shell; pick one. | free (earn) |
| Scales (`scales`) | An adult with both Standing tracks within 1 | "neither side owns it." | A balance with its pans level. | free (earn) |
| Plus (`plus`) | A whole life with no bug left untreated for a day | "fix it before it sets in." | A clinic cross. | free (earn) |
| Wanted (`wanted`) | A Rogue line three generations long | "keep running, three times over." | A torn poster corner with a dot for a face. Spoiler-light. | free (earn) |
| Full tree (`fulltree`) | Every adult of one egg raised in the line (a 2.0 redefinition of Full house, one egg at a time) | "raise every grown shape of one kind." | A small tree with nine leaves. | free (earn) |

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
| Etched (`etched`) | A line ten generations long | The label cut into the shell, darker than the shell colour, no background. | free (earn) |
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
- The Laughing Man ring's travelling dash would be the best animated upgrade on the list, but the ring is a very rare Deep find with a story (Blank), so it stays findable whole.

**Other paid shapes besides motion.**
- **Colourways:** a findable or earned shell, prop or wearable free in its own colours, with alternate colourways paid. Suits shells, since a 2.0 shell recolours the UI surfaces.
- **A glow:** a flat shell free, the same shell with a slow glow paid (as 1.0's Source light breathes).
- **Remixes and packs:** extra music tracks and sound packs in themed packs; the four egg tracks stay earned.

**The bigger asks, priced.** Room backdrops are the strongest paid category (packs, a few free by region cleared); beds paid, with a free default dock; visitor card frames paid, since friends see them.

**Recommendation.** Price only the new categories (rooms, beds, card frames), colourways and a few new decorative props, wearables and effects as above; leave every 1.0 item and every earned item as it is. That avoids any sense of taking things away and keeps the earning loop whole.

## Art drafts (2026-10-12)

First drafts of every wearable (26), prop (10) and crest (5) above, in `prototype/netling2/accessory-ideas.js`. Shells, tints, effects, sounds, music and labels are not drawn. Wearables use 1.0's `draw(px, anchors, frame, time)`, props `draw(px, frame, time, extra)` with a size, crests 9x9; `registerIdeas()` adds them to 1.0's tables at run time (prototype only, `src/` untouched, `source: 'earned'` so they never enter drops, shops or visitor gifts), so the real `placeWorn` and `drawProp` place them through the 2.0 renderer.

- **The Laughing Man ring, as the Light ring** (maintainer, 2026-10-12: shown under a different name; id still `laughingring`, nothing reserved). The 2026-10-07 drawing for Blank was never committed. A first redraw from the description (blue dashes, one white dash travelling) was rejected as broken and shaded; it is now drawn from the maintainer's memory of the original: **an unbroken pale oval** (`#c0eeff`, brightened from `#8fd8ff` at the maintainer's ask, one cell wide, every cell touching the next) from two cells outside the head's sides and two rows over the head top to two rows under the mouth, clear of the outline so it reads as a glow round the head, with **a glow sliding round it counterclockwise** (three white cells and a softer cell either side, two cells every 200 ms: a lap of about 2.5 to 4 s; sped up at the maintainer's ask to the fastest the flash rule allows, since each cell must hold a colour for `FLASH_TOGGLE_MS`). Recolorable (ring and glow), so the blend check never splits it into two tones over the body. **It is exclusive** (maintainer): worn, it hides every other face item and any worn item with a pixel on the ring or inside it (row by row), which in practice is every head item; float items over the head and body items below the mouth stay. This lives in the prototype renderer (`render.js` `exclusiveWorn`, driven by `exclusive: true` on the item; 1.0's lists pass through unchanged); a 2.0 wardrobe would need to grey out what it hides. Before this it had only been seen on the Wetware hidden line; the review page shows it on six forms including Blank (`wetwareElderHidden`), and `#sec=ring` shows an outfit with and without it. GIF: `style-ideas-light-ring.gif` (6 s, all three rows of `#sec=ring`).
- **Free and paid versions.** A **split** idea draws as its animated (paid) version under its id and as a free version (id + `.free`) that is exactly one frame of the animation, the reduced-motion picture. A **paid** idea has no free version in the tables above, so its free comparison is a plainer still drawing (the Thought bubble empty; the Desk terminal without stand or cursor; the Noodle cup without steam or band; the Lava lamp with one resting blob; the arcade cabinet with a dark screen). The Heat sink is drawn plain, with its Overclock glow as a separate review-only entry.
- **Review page:** `prototype/netling2/accessory-ideas-preview.html` (`#sec=wear`, `motion`, `props`, `crests`; `scale=n`, `t=ms` to freeze), served by `npm run serve`. Screenshots: `docs/netling2-prototypes/shots/style-ideas-wearables.png`, `style-ideas-light-ring-blank.png`, `style-ideas-light-ring.gif`, `style-ideas-wearables-motion.png`, `style-ideas-props.png`, `style-ideas-crests.png`.
- **Tests:** `accessory-ideas.test.js` (10, in `npm run proto:test`): the Light ring is an unbroken loop on every form and its exclusion holds on every form; every idea in these tables has art with the table's Paid? value; a split's free version is a frame of its animation and a paid one's is not; nothing leaves the top of the 2.0 screen on any of the 76 forms at the highest each frame stands in 1.0's idles; every cell holds each colour at least `FLASH_TOGGLE_MS`; the still ideas do not move; props stay inside their size; crests are 9x9.
- **Not done:** the blend check against every palette (only palette 0 was looked at; `placeWorn` swaps fixed colours that blend into the body, as for 1.0's), the room rules when worn with other items (1.0's `ROOM` table is internal to `src/accessories.js`, so body ideas do not slide past face items and float ideas do not rise over hats), the Lava lamp's floor glow with the lights off (1.0's `drawProp` dims every prop), the four-egg review render beyond the five forms on the page, and any device check. The overlaps the next list names were looked at in screenshots only.
- **Judgement calls to review:** War paint is dark by default (the doc's contrasting colour; pink merged with the default eyes); the Notification badge is 5x7 to fit a readable digit; the Thought bubble's chip, heart and skull are 5x3; the Bit swarm and Mini satellite step a cell every 400 ms (1.0's Drone moves continuously) so the flash test holds.

## Open questions

- **How many to add, if any.** 1.0 has 41 wearables and 49 style items in all; this list has 73. A handful per category would keep the wardrobe readable; the maintainer picks.
- **Where props live in the 2.0 wardrobe.** The UI's decided tabs are HEAD, FACE, BACK, SHELL, TINT, FX, SOUND, CREST, MUSIC and LABEL ([NETLING_2_UI.md](NETLING_2_UI.md)); props and two of 1.0's wear slots (body, float) are not named there. Worth settling before any are added.
- **Unlocks are placeholders.** Every condition above uses 2.0 mechanics as they stand in the simulator (Standing, the clinic, bugs, the egg pressures, the Rogue hunt) and would need the same measuring as 1.0's (how many lives a casual or attentive player takes to get one).
- **Duplicates to resolve:** Three of a kind (shell) against Three eggs (crest); Hazard orange (tint) against Heatwave (effect); the Clinic sound against the Waiting room track (same hint).
- **Egg ties.** Whether 2.0 should give each egg a few items that only it can find or earn (a source rule, not a wear rule). The "Fits" column is written so it could become one, but nothing here assumes it.
- **Overlaps to check before drawing:** the Hood and Rogue's outline, the Scan visor and the Visor, the Pulse patch and Wetware's shade, the Bit swarm and the Glitch moth, the Censor bar and the mouth-less forms (Blank, Cipher).

## Next steps (if the maintainer picks any)

Wearables and props: draw each pick in `prototype/netling2/` as 1.0's accessories are drawn (a `draw(px, anchors, frame, time)` over the authored anchors), then run the same checks 1.0's wearables pass: no movement between the A and B frames, on screen on every form (`render.test.js`'s headroom test), the blend check against every palette, the room rules with every other slot, and a review render across all four eggs. Shells, tints and effects: a contrast check on every palette and both screens (the 3:1 asked of graphics), and the flash test for anything that moves. Sounds and music: written as 1.0's (`sound.js`, `tracks.js`) and heard on a device. Crests: a 9x9 pixel shape and a `LEGACY` rule.
