# Sprites

State of the art review: how the sprites are built, what the checks measure, what was accepted on purpose, and what is open. **Contains spoilers** (secret forms, earned items). The audit is `node tools/sprite-audit.mjs [--check=a,b] [--json] [--strict]` and the gallery is `npm run serve` then `http://localhost:5174/gallery.html` (development only, not deployed). The audit flags candidates and a person judges them; see [TESTING.md](TESTING.md).

## How the art is built

- **Anchors are an authored table** per form and frame. No wearable moves more than one row between frames (a test enforces it). A `neckRow` anchor places the Scarf; Kernel's and Stub's body spans are solid runs through the middle or authored.
- **Mainframe forms** (the stage beyond Adult, [SIMULATION.md](SIMULATION.md#mainframe)). Four are their adult line grown wider: 18 columns against the adults' 16, and no taller than the tallest adult (15 rows), so a halo still fits above it and the walk still clears the cache icons. Plat is a broader Chrome with a crest; Airgap the Firewall split down the middle by a dark seam; Init the Daemon with longer horns and a mark on its brow; Panic is a Glitch torn clean in two: the head half and the body half sit well apart sideways and swap sides every frame (119 cells differ between frames, the most of any form), with a torn seam row between, and its eyes are white '!' marks, a kernel panic message, that show through eyewear like Chrome's visor (`shine`). Its asleep and dead poses are drawn by hand, since its eyes are not accent cells. Whisper goes the other way: smaller than a Ghost (14 columns, about 80% of its cells), its body thinning into a single faint wisp that sways between frames, so it reads as a Ghost fading out rather than growing. Plat's visor uses the same dead and asleep handling as Chrome's (`VISORS` in `sprites.js`). The Archive thumbnails are 18 pixels wide so they fit, and a mainframe's plush keeps its middle 16 columns.
- **Poses.** Every form except Bitling gets a generated dead pose (a 3x3 X on each eye, `#0a1214` on `#3a4a4d`) and sleep pose (slit eyes). Stub's X's are placed by hand, Chrome's visor goes dark when dead, and the Shell loses its mouth. The Shell casing is filled with a dim void mark.
- **Wearable colors.** A precomputed per-palette default (`src/wearable-colors.js`); a slot the player has not picked is automatic (`null`). Other wearables swap any pixel that would blend into the body (`contrastColor`), only where a pixel sits on the body or right beside it.
- **Resting and Ghost.** A resting pet's wearable is `#2f6b73`, one step lighter than the dimmed body `#1c3a3f`. A Ghost's wearable is drawn at full alpha.
- **Idle motion** leaves five rows above the sprite (the halo needs five) and the hover idle is clamped like bounce and sway.
- **Wear slots.** One accessory per slot (`body`, `face`, `head`, `float`), drawn in that order. Worn together, the Scarf, Corp barcode and KERNEL pin slide down past a face or head item, and the Halo and Spark rise above a hat, each by up to 4 rows and taking the shift that covers the fewest pixels; a riser never leaves the top of the screen. The floaters that orbit (`orbits: true`: the Drone buddy, Data aura and Glitch moth) draw last, in front of everything, and are not an obstacle: nothing else shifts to make room for them (`placeWorn`). Any future orbiting accessory should set the flag.
- **Props** are drawn in front of the pet, so they are always whole. The Plush has a one pixel outline.
- **Visitors** keep at least two columns between them and the host.
- **Item and node art.** Segfault is a skull, Overclock a gear, the exit node a door, the Helix crest a twisted double strand with rungs.
- **Visor** is three unbroken lines across the face (a dark line above and below a colored band) with a mirrored pair of scan lights sweeping outer, middle, inner, middle on the band; its automatic band color is never orange or gold. On Chrome, its bright eye cells shine through the Shades.

## Accepted on purpose

- **Alerts draw over everything else.** The screen is 28 rows, the floor is row 20 with the cache icons below, and the tallest adult (15 rows) plus a halo (5) already fills rows 0 to 20, so there is no room to separate the 5 row alerts at the top.
- **Plat and Airgap overlap 0.72** (same stage), the two wide, full-bodied ones; Plat stands on legs with its arms apart, Airgap tapers to a point and carries its seam.
- **Panic is closer by silhouette to Ghost (0.58) than to Glitch (0.42).** It is torn in two on purpose and its halves swap sides every frame, so a centred overlap says little about it; Panic shifts more between its frames than any other mainframe (a test checks that instead).
- **Whisper loses half its Earpiece on the origin palette**, as the Ghost does (the same ear, the same colors).
- **The Plush can cover up to 32% of the pet** at the far right, and up to 46% with a visitor (the Cyberdeck, Boom box and Mini device cover 9% at most). Players can remove it.
- **Any `#rrggbb` is allowed** in the wardrobe, so a player can pick a clashing color. The automatic state means it only happens by choice.
- **Daemon's animation** reads about as distinct as the other adults, the Ghost aside.
- **The strobe of an evolution hides the wearable** (the pet is a white silhouette).
- **Some pairs share a spot.** Headphones cover the Earpiece and the edge of a Cyber eye (all ear or eye-side devices), and the orbiting Drone buddy, Data aura and Glitch moth pass over whatever they cross.

## What works

- **The fourteen forms are distinct**, and every mainframe but Panic and Whisper is closer to its own line than to any other adult (Plat to Chrome 0.78, Airgap to Firewall 0.82, Init to Daemon 0.77, a test enforces it). Whisper is closer by silhouette to Chrome (0.73) than to Ghost (0.67): a small round head over a narrowing tail. A test checks instead that it is smaller than a Ghost and that its tail fades.
- **The nine original forms are distinct.** Flat silhouettes separate every form, including the pairs the overlap score ranks highest (Firewall and Ghost 0.81, Chrome and Ghost 0.77, Chrome and Firewall 0.68, Kernel and Stub 0.67; all distinct by eye, the score is only a screen).
- Awake A and B frames differ on every form (4 to 48 cells). Daemon's differ least (4 cells), Chrome's and Bitling's 6.
- Every item icon, HUD icon, node marker and mini-game frame renders without artifacts.
- About half the wearables read well on every form and palette: Flower, Bow, Crown, Halo, Party hat, Kernel pin, Sat-dish antenna.

## Audit numbers to keep

For regressions (rerun the audit):

- Off-screen wearable cases: 0.
- Wearables that lose half or more of their pixels awake and lit: 2 (Crown in 1 of 84 form and palette cases, Earpiece in 2: Ghost and Whisper).
- Wearables that lose half or more asleep with the lights off: 0.
- Highest wearable pair overlaps: Shades and Visor up to 0.67 on Chrome and Plat (the Visor is now three unbroken lines; the colors differ), Cap and Party hat 0.58 (different colors).
- Highest crest pair overlap: Seal and Rack mount 0.37 (Rack mount is a framed block, 41 lit; the Seal a ring with tails), then Full house and Seal 0.30.
- Highest form pair overlap: Firewall and Airgap 0.82 (a line and its mainframe, meant to look alike); same stage, Firewall and Ghost 0.81, then Plat and Airgap 0.72 among the mainframes.
- Worn together (`--check=combos`, worst over every form, pose and orbit time): Chrome jaw over Scarf 0.82 and Rebreather over Scarf 0.73 (Glitch, which has almost no neck), Bandage over Cyber eye 0.67 (Panic, whose '!' eyes sit high; 0.60 on Kernel), Circuit tattoo over KERNEL pin 0.44, Chrome jaw and Rebreather over the Checksum 0.33 (it slides down like the other chest items). Before the room-making, Chrome jaw and Rebreather hid the Corp barcode and KERNEL pin entirely on Daemon.
- The gallery outlines a wearable when half or more of its pixels blend in, computed from the sprite's own colors. The audit measures the real render, so counts can differ slightly at the edges.

## Open

- **Human pass in a browser** (not done): motion and flicker, phone-size legibility, anything flashing, and Daemon's, Chrome's and Bitling's idle animation, which barely differs between frames.
- **Crests on the real shells.** The gallery uses the picker swatch colors, so crests still need checking on the shell art in the app. The pink logo color on the Firewall brick and Holographic shell swatches is low contrast.
- **Not looked at closely:** the palette-`all` matrices (the audit covers their numbers) and the wearable-plus-prop matrix. The COMBINATIONS section was looked at on Daemon only, plus the audit's worst pairs rendered on their worst forms.
- **Mouthwear and a Scarf on Glitch.** The Chrome jaw or Rebreather still hides most of a Scarf on Glitch; only its tail shows. The Bandage sits over a Kernel's visor rim and cyber eye.
- **The Visor has no description text**, only the rarity hint.
- **The smoke test was not run against the sprite changes.** The only game-code change from the review's tooling is `export` on `drawNode` in `src/netrun/view.js`.
