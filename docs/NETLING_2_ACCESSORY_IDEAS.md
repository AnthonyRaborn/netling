# Netling 2.0 accessory ideas (drafts, text only)

An idea list for wearables that 2.0 could add on top of 1.0's 41, which carry over unchanged ([NETLING_2_SKETCH.md](NETLING_2_SKETCH.md), "Wearables (41) and props (8)"). **Nothing here is decided, drawn or coded.** Names and ids are suggestions: an id becomes permanent only once it ships (CLAUDE.md rule 1), so none is reserved yet. Spoilers for the hidden forms where noted.

## How to read the entries

- **Slot** is 1.0's: `head`, `face`, `body`, `float` (one of each worn at once). Today's counts: body 11, face 11, float 10, head 9, so head gets the most ideas here.
- **Rarity and source** follow 1.0's scheme: common, rare or very rare; found anywhere, in one region (Public Net, Corp Grid, Darknet Bazaar, Old Web Ruins, the Deep, the Source), sold at a corp exchange or the black market, or earned. A suggestion, for the maintainer to balance.
- **Fits** names an egg or form whose look it echoes. It is flavour only: in 1.0 any netling can wear anything, and nothing here proposes changing that.
- **Motion** is described where an item moves. Every motion keeps the flash rule (no toggle faster than `FLASH_TOGGLE_MS`, 200 ms; most steps here are 400 ms) and has a still version for reduced motion.
- **Room.** The 2.0 screen has 2 rows of headroom over 1.0's ([NETLING_2_SPRITES.md](NETLING_2_SPRITES.md), item 1a), so a float item may sit up to the holologo's height (6 rows over the head) without leaving the screen. Taller ones would need measuring.

## Head (8)

| Name (suggested id) | Rarity, source | Fits | Description |
|---|---|---|---|
| Goggles (`goggles`) | common, anywhere | Iron | Welding goggles pushed up on the forehead: a strap across the head top and two round dark lenses with a highlight cell each. Sits above the eyes, so it never covers them. |
| Hard hat (`hardhat`) | common, Corp Grid | Iron | A yellow dome with a brim and one dark stripe down the middle. A plainer, working sibling of the Cap. |
| Cat-ear headset (`catears`) | rare, black market | Wetware, Rogue | Two small triangle ears on a band, each tip a lit accent cell that blinks once every few seconds, never both at once. |
| Electrode cap (`electrodes`) | rare, Old Web Ruins | Wetware | A dotted net over the head top: four or five bright dots joined by dim lines, one dot at a time lighting as if a reading moves across the scalp (one step every 400 ms). |
| Signal bars (`signalbars`) | common, Public Net | Program | Three bars of rising height standing on one side of the head, filling from short to tall and dropping back, like a phone finding coverage. |
| Cable tangle (`cabletangle`) | common, Darknet Bazaar | street lean | Two or three loose patch cables sticking out of one side of the head and drooping, their plugs in different colours. Still; no motion. |
| Hood (`hood`) | rare, black market | Rogue | A dark drape over the head top and down both sides to the eye row, leaving the face clear. The look Rogue already wears, offered to anyone. Needs the outline check: it widens the head by a cell each side. |
| Propeller beanie (`beanie`) | very rare, earned | baby | A striped beanie with a two-blade propeller on top that turns (two poses, swapped every 400 ms). Earned, as the Party hat is, for something silly: a suggestion is the first time a netling grows up. |

## Face (6)

| Name (suggested id) | Rarity, source | Fits | Description |
|---|---|---|---|
| Laughing Man ring (`laughingring`) | very rare, the Deep | Wetware, Blank | **Prototyped already** as one of Blank's elder options (2026-10-07; [NETLING_2_SPRITES_HISTORY.md](NETLING_2_SPRITES_HISTORY.md), "Blank's elder in motion"), not chosen for Blank and kept as an accessory idea. A ring of dashes circling the face, the lit dashes in the highlight colour (in the hood's colour they vanished), with one bright dash travelling round once every few seconds. Spoiler-free name in the shop: "Smiling ring". |
| Scan visor (`scanvisor`) | rare, Corp Grid | Program | A thin dark band across the eyes with one bright cell sweeping left and right inside it, a step every 400 ms. Unlike the Visor, the eyes show through as dim cells, so the face still reads. |
| War paint (`warpaint`) | common, Darknet Bazaar | street lean | Two short stripes under each eye in a contrasting colour (recolorable). Still. |
| Teardrop code (`teardrop`) | rare, black market | Rogue | One accent cell under one eye and a dim cell under it, like a tattooed tear. The smallest face item; reads as a story, not a decoration. |
| Dead pixels (`deadpixels`) | common, anywhere | any | Two or three dark cells scattered on the cheeks, like freckles. Must stay clear of the bug tears' look (bugs move; these never do), so a still item only. |
| Censor bar (`censorbar`) | rare, Public Net | Program | A solid black bar over the mouth row, with a few cells along its edge shifting between two patterns every 800 ms. Over the mouth, never the eyes, so the expression still reads. |

## Body (6)

| Name (suggested id) | Rarity, source | Fits | Description |
|---|---|---|---|
| Dog tags (`dogtags`) | common, anywhere | Iron | Two small grey plates on a dotted chain, one hanging a row lower than the other. Still. Makes room like the Gold chain. |
| Hazard sash (`hazardsash`) | rare, Old Web Ruins | Iron | A diagonal band across the body in alternating yellow and dark cells, shoulder to hip. Still, so the stripes never strobe. |
| Pulse patch (`pulsepatch`) | common, anywhere | Wetware | A small square patch on the chest with a one-row trace that blips once a second (a two-step pulse, then flat). Ties to Wetware's shade and pulse without copying them. |
| Heat sink (`heatsink`) | rare, Corp Grid | Iron | Three short fins clipped to the side of the body, the tips glowing warmer when the netling is in Overclock (a colour, not a flash) and plain otherwise. If tying it to a state is too much rule, keep it plain. |
| Visitor pass (`visitorpass`) | common, corp exchange | Program | A white card clipped to the chest with one red stripe and a tiny dark photo square. The corp's way of saying you do not belong here. |
| Leash cable (`leashcable`) | very rare, the Source | NL-0 | A thin cable from the neck trailing down to the floor and off the side of the screen, as if something still holds the other end. Still. Lore item; suggested as a reward near the end, not a drop. |

## Float (6)

| Name (suggested id) | Rarity, source | Fits | Description |
|---|---|---|---|
| Loading spinner (`spinner`) | common, anywhere | Program | A ring of eight dim cells over the head with one bright cell stepping round it, a step every 400 ms. Reduced motion: the ring with one cell lit, still. |
| Notification badge (`badge`) | common, Public Net | any | A red dot with a white digit at the top right of the head, the digit counting 1 to 9 and over again, one a few seconds. A joke about the game's own attention budget. |
| Thought bubble (`thoughtbubble`) | rare, anywhere | any | Two small dots rising to a bubble over the head, the bubble holding a tiny icon that changes every few seconds (a chip, a heart, a skull). Purely decorative: it never shows what the netling actually wants, so it cannot be mistaken for a need. |
| Bit swarm (`bitswarm`) | rare, Darknet Bazaar | Wetware | Three single bright pixels orbiting the body at different distances, like fireflies. Orbits (draws last, in front of everything, as the Drone buddy and Glitch moth). |
| Padlock (`padlock`) | rare, corp exchange | Program | A small padlock hovering over the head that opens and shuts slowly (two poses, a few seconds each). |
| Mini satellite (`minisat`) | very rare, the Deep | Iron | A tiny satellite with two panel wings crossing high over the head from one side to the other, then starting over. Orbits. |

## Open questions

- **How many to add, if any.** 1.0 has 41; this list has 26. A handful per slot would keep the wardrobe readable; the maintainer picks.
- **Egg ties.** Whether 2.0 should give each egg a few accessories that only it can find (a source rule, not a wear rule). The "Fits" column is written so it could become one, but nothing here assumes it.
- **Overlaps to check before drawing:** the Hood and Rogue's outline, the Scan visor and the Visor, the Pulse patch and Wetware's shade, the Bit swarm and the Glitch moth, the Censor bar and the mouth-less forms (Blank, Cipher).
- **Props** (the eighth slot of style items, not worn) are not covered here.

## Next steps (if the maintainer picks any)

Draw each pick in `prototype/netling2/` as 1.0's accessories are drawn (a `draw(px, anchors, frame, time)` over the authored anchors), then run the same checks 1.0's wearables pass: no movement between the A and B frames, on screen on every form (`render.test.js`'s headroom test), the blend check against every palette, the room rules with every other slot, and a review render across all four eggs.
