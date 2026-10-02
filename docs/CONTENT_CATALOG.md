# Content catalog

Every piece of authored content: forms, items, mini-games, cosmetics, accessories, codex text. **Contains spoilers**, including hidden unlock conditions the game only hints at. When content changes, the tables in code are the source of truth; `gallery.html` shows every sprite.

## Contents

1. [Forms](#forms)
2. [Traits and perks](#traits-and-perks)
3. [Items](#items)
4. [Mini-games](#mini-games)
5. [Style: cosmetics](#style-cosmetics)
6. [Chatter](#chatter)
7. [Accessories and props](#accessories-and-props)
8. [Codex fragments](#codex-fragments)
9. [Onboarding and NL-0 text](#onboarding-and-nl-0-text)
10. [Dex lore and hints](#dex-lore-and-hints)

## Forms

| Form | Stage | How it is reached | Perk | Netrun ability | Keepsake | Trait passed on |
|---|---|---|---|---|---|---|
| Bitling | baby | Compile a script | none | none | n/a | n/a |
| Kernel | teen | 2 or fewer mistakes at the teen stage (17 hours; 24 for netlings compiled before the 5-day life), and not a Shell | none | none | n/a | n/a |
| Stub | teen | 3 or more mistakes at the teen stage | none | none | n/a | n/a |
| Shell | teen | On Ghost's path at the teen stage: allegiance under 2 either way, stability 0 or more, at most 1 mistake, every game won at least 3 times | none | none | n/a | n/a |
| Chrome | adult | Allegiance dominant and positive | Loves corp packets, sulks at scavenged data (+5 or -5 Sync) | Checkpoints wave it through; relays patch it up (+20 Integrity); corp insurance saves it from one disconnect a run | Corp voucher | Licensed |
| Firewall | adult | Allegiance dominant and negative | -30% virus chance | ICE deals half damage | Antivirus patch | Hardened |
| Daemon | adult | Stability dominant and non-negative | Charge drains 20% slower | Sees node types two steps ahead; +6 Integrity each move | Coolant cell | Persistent |
| Glitch | adult | Stability dominant and negative | Play gives +10 to +40 Sync | Slips through the first ICE of each run, and 35% of later ones | Black ICE shard | Volatile |
| Ghost | adult | Neutral allegiance (under 2), stability 0 or more, at most 1 mistake, 29+ wins with 4+ in each game | All drains 15% slower | Sees every node; checkpoints never notice it, and 45% of ICE miss it | Memory shard | Untraceable |
| Plat | mainframe | A Chrome on its last ordinary day, home, with 3 Deep exits this life (or 2 clean) and Root Access in the line | Chrome's | Chrome's, with relays repairing 40 and insurance twice a run | Corp voucher | Licensed, at level II or higher |
| Airgap | mainframe | The same, from a Firewall | Firewall's | Firewall's, and the first lost ICE fight each run deals 30% of its damage | Antivirus patch | Hardened, II+ |
| Init | mainframe | The same, from a Daemon | Daemon's | Sees three steps ahead; +8 Integrity each move | Coolant cell | Persistent, II+ |
| Panic | mainframe | The same, from a Glitch | Glitch's | Slips through the first two ICE of each run, and 35% of later ones | Black ICE shard | Volatile, II+ |
| Whisper | mainframe | The same, from a Ghost | Ghost's | Ghost's, with 50% of ICE missing it | Memory shard | Untraceable, II+ |

"Dominant" means larger in absolute value. Within 0.5 it is a tie, broken at random with forms the player has never raised weighted 1.2. Full rules in [SIMULATION.md](SIMULATION.md#evolution-and-the-hidden-axes). A mainframe gains a day of life and keeps its line in everything (perk, trait, keepsake, ability); see [SIMULATION.md](SIMULATION.md#mainframe). Until Root Access is earned on the device, the five mainframe forms read as `<<RECORD CORRUPTED>>` in the dex, with static for a thumbnail. Like the locked Source, they blink every 3.2 seconds: the name garbles into block glyphs for 0.4 s and the static re-rolls, a band of it shifted sideways and a step brighter (`ui/corrupt.js`; still with motion calmed).

## Traits and perks

Effects at strength 1; levels, history and caps are in [SIMULATION.md](SIMULATION.md#trait-strength-balance-pass-3). The in-game text (`TRAITS[id].desc`) names the effect without numbers.

| Trait | Source form | Effect | Cap |
|---|---|---|---|
| Licensed | Chrome | Corp packets restore +25% Charge | 1.5 |
| Hardened | Firewall | -50% virus chance | 1.5 |
| Persistent | Daemon | Drains 30% slower while resting | 1.25 |
| Volatile | Glitch | Play rewards x1.5, Integrity drains an extra 0.75/hr | 1.25 |
| Untraceable | Ghost | Corp traces 60% less often | 1.25 |

## Items

Nine items, art in `ITEM_SPRITES` and colors in `ITEM_COLORS` (`sprites.js`). Prices are in corpo scrip (`SCRIP.price` in `sim.js`); markets add Charge, and selling pays half at a market or a quarter elsewhere.

| Name | Effect | Scrip price |
|---|---|---|
| Coolant cell | Vents 50 Heat. Works while asleep | 15 |
| Antivirus patch | Cures any virus and shields against new ones for 6 hours | 15 |
| Corp voucher | Full Charge, waves off the current or next corp trace. Leans corp | 25 |
| Black ICE shard | +40 Sync, +20 Heat, may carry a virus. Leans indie and unstable. Awake only | 25 |
| Signal booster | Your next mini-game win counts double. Awake only | 15 |
| Memory shard | Rewrites one of its quirks at random | 15 |
| Repair kit | Restores 40 Integrity. Works while asleep | 15 |
| Bypass chip | Cuts 1 hour off the netrun uplink cooldown (never below 2 hours) | 50 |
| Segfault | Crashes it on purpose: +2 faults. Faults shape how it grows up, and ten end its life. Awake only; asks for a second press | 25 |

## Mini-games

| Game | Id | Goal | Time | Fail |
|---|---|---|---|---|
| Breach Protocol | `breach` | Pick codes from a 5x5 grid, alternating row and column, until the 3-code target is in the 4-slot buffer | 25 s | Buffer full without the target, reusing a cell is refused, or time out |
| Firewall Dodge | `dodge` | Slide between 5 lanes to avoid falling firewall blocks | survive 15 s | Any hit |
| Signal Tune | `tune` | Press A when the sweeping wave matches the ghost signal | 6 s per round, 3 rounds | Two misses |
| Packet Feast | `feast` | Move under clean packets to eat 15 | 20 s | Two corrupted bites, or time out |

Breach generates a legal path through the grid and cuts the target from it, so every puzzle is solvable (`tests/games.test.js` checks this). Quitting mid-game counts as a loss. Each game has its own win and lose banner text (for example "ACCESS GRANTED" and "BREACH FAILED").

## Style: cosmetics

Slots: shell, tint, effect, sound. `free: true` items are available from the start. Hints are what the player sees while locked. Items marked `mainframe` belong to the Mainframe stage; they would leave the wardrobe if `CFG.mainframe` were switched off (`shownCosmetics`).

### Shells (14)

| Id | Name | Unlock | Hint shown |
|---|---|---|---|
| `standard` | Standard issue | free | |
| `matte` | Matte black | Reach generation 3 | "keep the line going." |
| `chrome` | Brushed chrome | Discover the Chrome form | "raise one loyal to the grid." |
| `brick` | Firewall brick | Discover Firewall | "raise one that trusts nothing upstream." |
| `crimson` | Daemon red | Discover Daemon | "raise one that never misses a cycle." |
| `shifted` | Glitch shift | Discover Glitch | "raise one that lives on the edge." |
| `clear` | Ghost clear | Discover Ghost | "raise the one nobody sees." |
| `gold` | Corp gold | Complete the codex | "earn something from below." |
| `holo` | Holographic | 5 lives that reached end of life cycle (not necessarily consecutive) | "see five lives through to the end." |
| `platinum` | Platinum | Discover Plat (Mainframe) | "one loyal to the grid, that never stops growing." |
| `airgap` | Air gap | Discover Airgap (Mainframe) | "one that trusts nothing, that never stops growing." |
| `pidone` | PID 1 | Discover Init (Mainframe) | "one that never misses a cycle, that never stops growing." |
| `torn` | Panic tear | Discover Panic (Mainframe) | "one that lives on the edge, that never stops growing." |
| `faint` | Whisper | Discover Whisper (Mainframe) | "the one nobody sees, that never stops growing." |

The five Mainframe shells (`mainframe: true`) are each a step beyond their adult form's shell: Platinum is a brighter, whiter Brushed chrome with a soft glow (a light shell, so its labels darken); Air gap is the Firewall brick cut across the middle by a band of black, with a dashed edge; PID 1 is Daemon red with faint red traces of a grid running through it and a stronger glow; Panic tear is Glitch shift torn down the right side by a black seam, its halves blue and wine, with a wider pink and cyan split around the edge; Whisper is fainter than Ghost clear, with a dotted edge. None of them animates. Until Root Access, a locked Mainframe shell shows as `<<SHELL CORRUPTED>>` with "read error at 0x00. it will not load." instead of ??? and its hint, and the name blinks like the dex's corrupted records (`corruptedCosmetic`, `CORRUPTED_SHELL`); after Root Access it shows ??? and its hint like any locked shell.

Owning all nine original shells (`ORIGINAL_SHELLS`, the ones above the Mainframe five) grants the secret **Mini device** prop; the Mainframe shells do not count toward it, so that goal did not move.

### Tints (9)

| Id | Name | Unlock | Hint |
|---|---|---|---|
| `teal` | Classic teal | free | |
| `ice` | Ice | All 4 Public Net fragments | "hear everything the public net has to say." |
| `grid` | Grid yellow | All Corp Grid fragments | "read the whole employee file." |
| `violet` | Bazaar violet | All Bazaar fragments | "hear every rumor in the market." |
| `phosphor` | Green phosphor | All Old Web Ruins fragments | "learn what the ruins remember." |
| `abyss` | Abyss | All Deep fragments | "listen to the bottom of the net." |
| `guest` | Guest pink | 5 visitors greeted | "say hello to whoever drops by, five times." |
| `readonly` | Read-only | All four Source fragments | "read what the net was written from." |
| `amber` | Amber | 3 full lives in a row | "three in a row, start to finish." |

### Effects (11)

| Id | Name | Unlock | Hint |
|---|---|---|---|
| `scanlines` | Scanlines | free | |
| `clean` | Clean glass | free | |
| `interlace` | Interlace | 10 clean jack-outs | "come home clean, again and again." |
| `rain` | Code rain | Best Breach streak 10 | "an unbroken chain of breaches." |
| `bloom` | Bloom | Best Dodge streak 10 | "slip every wall, ten times over." |
| `curved` | Deep curve | Best Tune streak 10 | "hold the signal and never lose it." |
| `packets` | Packet rain | Best Feast streak 10 | "ten clean feasts without a bad bite." |
| `aurora` | Aurora | 24 hours in flow, across lives | "keep it well for a whole day, a few hours at a time." |
| `heatwave` | Heatwave | 40 hours overclocked while awake, across lives (`progress.hotMin` plus the living `hotTotalMin`). Warm orange and magenta bands rising slowly up the screen; still with motion calmed | "run it hot for the better part of two days." |
| `static` | Static | Exit The Deep once | "find the way back up from the bottom." |
| `sourcelight` | Source light | Exit the Source 3 times (`progress.sourceExits`). A soft white glow from the screen edges that breathes once every 8 seconds; held at its middle brightness with motion calmed | "go down into the light three times, and come back." |

Streaks count PLAY games only, not netrun ICE fights or DEFEND.

### Sounds (8)

| Id | Name | Wave, multiplier | Unlock | Hint |
|---|---|---|---|---|
| `beep` | Beep | square, 1 | free | |
| `soft` | Soft | sine, 1 | free | |
| `bass` | 8-bit bass | square, 0.5 | 100 meals | "a hundred meals." |
| `glass` | Glass | sine, 2 | 20 patches | "catch it before it spreads, twenty times." |
| `chime` | Chime | triangle, 1.25 | 10 complies | "answer when they call, ten times." |
| `buzz` | Buzz | sawtooth, 0.9 | 10 hides | "vanish when they call, ten times." |
| `purr` | Purr | sine, 0.6 | 25 requests answered | "give it what it asks for, twenty-five times." |
| `arcade` | Arcade | triangle, 0.75 | 50 games played (PLAY plus netrun ICE) | "fifty games, win or lose." |

Sound packs apply to home sounds only. Netruns keep each region's own voice.

### Crests (8)

A 9x9 pixel emblem drawn beside the device label in the label's color (`pixels` in `cosmetics.js`). Crests are the legacy goals: each is earned by the line as a whole, read from the lineage records (`LEGACY` in `cosmetics.js`), so only finished lives count.

| Id | Name | Unlock | Hint |
|---|---|---|---|
| `none` | No crest | free | |
| `helix` | Helix | Every trait inherited at least once, anywhere in the line | "inherit every trait there is, once." |
| `triad` | Triad | A level III trait held or passed on (the same form three generations running) | "the same shape, three times running." |
| `loop` | Closed loop | 5 full lives in a row with no NL-0 rescue | "five whole lives in a row, nobody pulled back." |
| `star` | Full house | Every adult form raised to adulthood in the line (unrealized echoes and the dex do not count) | "raise every grown shape in one line." |
| `speech` | Speech mark | Every chatter line of one group heard | "hear everything one kind of netling has to say." |
| `seal` | Seal | 10 netrun contracts completed, across lives (`progress.contractsDone`) | "take ten jobs and see them through." |
| `rack` | Rack mount | Any mainframe form in the dex. A server rack: a frame, three units with their lights, and its feet | "grow one past what it was built for." |

Full house counts a mainframe as its adult form (`lineOf`). Records from before trait levels count as level 1, and records from before `realized` was stored do not count toward Full house. Speech mark and Seal are not read from the lineage: they come from the chatter heard (see [Chatter](#chatter)) and the contracts completed ([NETRUN.md](NETRUN.md#contracts)).

### Music (8)

The home screen's background music (`tracks.js`, played by `music.js`; see [MUSIC.md](MUSIC.md)). Netruns always play their own theme, whatever is equipped. Equipping a track crossfades to it at once.

| Id | Name | Feel | Unlock | Hint |
|---|---|---|---|---|
| `idle` | Idle loop | Calm chiptune, A minor, 84 BPM | free | |
| `nightdrive` | Night drive | Synthwave, B minor, 100 BPM | Generation 2 or later | "pass it on." |
| `dialup` | Dial-up | Old web, G minor, 72 BPM, with a full modem handshake every 4 to 6 bars (dialing tones, the 2100 Hz answer tone, the data warbles, the screech and the hiss) | 10 codex fragments | "read ten pages of the old net." |
| `lobby` | Corp lobby | Elevator music, G major, 96 BPM, with an elevator ding every 4 to 8 bars | 25 corp meals, across lives | "eat what the grid serves, twenty-five times." |
| `tracker` | Tracker | Fast demoscene, A minor, 132 BPM | 150 games played (PLAY and netrun ICE) | "a hundred and fifty games, win or lose." |
| `undertow` | Undertow | Dark ambient, E minor, 60 BPM, no drums | 3 exits from the Deep | "come back from the bottom three times." |
| `firstcommit` | First commit | A lone bell over a still pad, C major, 72 BPM, sparse and high | Exit the Source once | "come back from below the bottom." |
| `forum` | Forum | Call-and-answer chirps, G major, 90 BPM, with a disk-seek flourish | 25 chatter lines heard | "hear twenty-five things it says to itself." |

### Device label

Up to 10 characters from `A-Z`, `0-9`, space, `.`, `-` (default `NETLING`). Unlocked when the first netling has died: "lose one before you name the line."

## Chatter

Lines a netling mutters while awake and idle (`src/chatter.js`); a heard line is kept in the Archive's CHATTER tab. Ids are permanent. 51 lines in 11 groups; a group with nothing heard shows only its hint.

| Group | Lines | When | Hint |
|---|---|---|---|
| Bitling | 5 | A baby | "listen to it while it is new." |
| Kernel, Stub, Shell | 4 each | That teen body | "listen to a well-kept teen." / "...a teen that had a rough start." / "...a teen with something missing." |
| Chrome, Firewall, Daemon, Glitch, Ghost | 4 each | That adult body | The form's DEX hint, as "listen to ..." |
| Lineage | 8 | One per inherited trait, one with a history, one while NL-0 watches, and `lin-quiet` for a mainframe ("NL-0 has gone quiet. it knows where i have been.") | "listen to one that remembers who came before." |
| Visitors | 6 | Said by a greeted visitor | "say hello when someone drops by." |

The text of every line is in `CHATTER` in `src/chatter.js`; lines are at most 60 characters (checked by `tests/attention.test.js`).

## Accessories and props

41 wearable accessories (two are earned-only) and 8 props, 49 style items in all (`STYLE_ITEMS`). Rarity weights: common 6, rare 2, very rare 1. Findable means it can drop or be sold; earned means only a specific event grants it.

Each wearable has a wear slot (`slot`), and one from each slot can be worn at once (`WEAR_SLOTS`, drawn in this order):

| Slot | Wearables |
|---|---|
| `body` | Scarf, Corp barcode, KERNEL pin, Checksum, Lanyard, Necktie, Spiked collar, Chip bandolier, Bow tie, Gold chain, Power cell |
| `face` | Shades, Visor, Cyber eye, Chrome jaw, Rebreather, Circuit tattoo, Earpiece, Neural jack, Blush, Mustache, Monocle |
| `head` | Cap, Flower, Bow, Crown, Neon mohawk, Sat-dish antenna, Party hat, Headphones, Bandage |
| `float` | Halo, Spark, Drone buddy, Data aura, Holo logo, Glitch moth, Rain cloud, Cursor, Progress bar, Extra life |

Worn together, some make room (`placeWorn`): the Scarf, Corp barcode, KERNEL pin, Checksum, Lanyard, Necktie, Spiked collar, Chip bandolier, Bow tie, Gold chain and Power cell slide down past a face or head item (up to 4 rows, never off the sprite), and the Halo, Spark, Holo logo, Rain cloud, Cursor, Progress bar and Extra life rise above a hat (up to 4 rows, never above the screen). The orbiting floaters (the Drone buddy, Data aura and Glitch moth, marked `orbits: true`) draw last, in front of everything, and never make anything else move.

Wearables that can be found anywhere (`regions` unset), 26: the 20 below, and the 6 shop exclusives (below), which each kind of market sells in any region:

| Rarity | Items |
|---|---|
| Common | Cap, Scarf, Headphones, Flower, Bow, Rain cloud, Cursor, Bow tie, Power cell, Blush, Mustache |
| Rare | Shades, Visor, Crown, Progress bar, Gold chain, Monocle |
| Very rare | Halo, Spark, Extra life |

The ten added for the slots that had the fewest (float, body, face): the Rain cloud is a grey cloud over the head with two drops falling in turn; the Cursor an old white mouse pointer at the top right of the head, bobbing a pixel; the Progress bar a bar over the head that fills one cell every 0.4 s and starts over; the Extra life a red pixel heart with a shine, bobbing; the Bow tie two wings and a dark knot under the neck (recolorable); the Gold chain dotted links dipping to a yellow pendant; the Power cell a battery pack clipped to the side of the body that drains and charges one level every 0.9 s; the Blush two pink marks under the outer edge of each eye (recolorable); the Mustache a brown bar over the mouth with drooping tips; the Monocle a gold ring around the left eye with a short chain. None of them flashes. All ten use the rarity hint, are sold by both kinds of market, and can come from a daily check-in.

Regional wearables, 13 (they only turn up in their region):

| Region | Common | Rare | Very rare |
|---|---|---|---|
| Corp Grid | Corp barcode, Earpiece | Chrome jaw, Cyber eye | |
| Darknet Bazaar | Neon mohawk, Neural jack, Circuit tattoo, Rebreather | | |
| Old Web Ruins | | Sat-dish antenna, Data aura | KERNEL pin |
| The Deep | | | Drone buddy |
| The Source | | | Checksum: a little block of parity bits on the chest, one of which flips with the frame. Hint "something small follows the bravest runners up from the source."; never in a home reward or on a visitor |

**Shop exclusives** (`shop`): netrun markets come in two kinds (see [NETRUN.md](NETRUN.md#markets-and-exchanges)), and an accessory with `shop` set is offered only by that kind; one without it is offered by both. Region limits still apply on top, and drops and home rewards ignore `shop`. Accessory prices are the same at both.

| Shop | Existing (region) | New, sold in any region |
|---|---|---|
| Corp exchange (`exchange`) | Corp barcode, Earpiece, Chrome jaw, Cyber eye (Corp Grid) | Lanyard (body, common), Necktie (body, rare), Holo logo (float, rare), Coffee mug (prop, common), Briefcase (prop, rare) |
| Black market (`black`) | Neon mohawk, Neural jack, Circuit tattoo, Rebreather, Cyberdeck, Boom box (Bazaar) | Spiked collar (body, common), Chip bandolier (body, rare), Glitch moth (float, rare), Burner phone (prop, common), Spray can (prop, rare) |

The new ones: the Lanyard is a strap to an ID badge with a corp stripe; the Necktie a gray knot and a thin navy tie; the Spiked collar a dark band with studs; the Chip bandolier a strap across the chest with green chips on every other link; the Holo logo a corp-yellow diamond that turns edge-on every other frame; the Glitch moth a pink moth that flits about the head on an uneven path, wings up and down with the frame. The Coffee mug is white with a corp stripe and swaying steam; the Briefcase dark with a yellow clasp; the Burner phone a gray handset whose screen pulses slowly; the Spray can a can with a pink band beside a pink tag on the floor. None of them flashes.

Earned wearables, 2:

| Item | Rarity | How it is earned |
|---|---|---|
| Party hat | common | Finish the tutorial netrun ("a gift for a first birthday"). Also backfilled for older saves |
| Bandage | rare | Survive a netrun disconnect, or an NL-0 rescue ("you have to survive something first") |

Props, 8 (drawn on the ground, own slot):

| Prop | Rarity | Source |
|---|---|---|
| Cyberdeck | rare | Bazaar only |
| Boom box | common | Bazaar only |
| Coffee mug | common | Corp exchanges |
| Briefcase | rare | Corp exchanges |
| Burner phone | common | Black markets |
| Spray can | rare | Black markets |
| Mini device | very rare | Earned: own the nine original shells ("collect all (?) the shells. then look closer.": the "(?)" hedges, since the Mainframe shells are not needed, without naming them); the Mainframe shells are not needed |
| Plush | rare | Earned: after the first netling dies. Drawn as a half-scale copy of the previous netling in its colors |

Recolorable accessories declare `colors`: Cap, Scarf, Shades, Visor, Neon mohawk, Circuit tattoo, Rebreather, Party hat, Bow tie, Blush. A slot the player has not picked is automatic: `src/wearable-colors.js` (generated by `tools/wearable-colors.mjs`, kept current by a test) holds the color for each palette, chosen to stand clear of that palette's body and eye colors, so the same wearable is a different color on different netlings when its signature color would blend in. Custom colors must be `#rrggbb` and are stored per accessory in the wardrobe (`null` = automatic). The other wearables keep their own colors, but any pixel that sits on the body (or right beside it) and would blend into it is swapped for a color that does not (`contrastColor`, `src/colors.js`); a pixel floating clear of the body keeps its own color. The Visor is three unbroken lines (a dark line above and below a colored band) with a scan light at each end of the band sweeping in and back out, and its automatic band color is never orange or gold. A Ghost's wearable is drawn solid while the Ghost fades. In the dark, a resting pet's wearable is drawn one step lighter than the dimmed body.

The tutorial run never drops accessories (`noStyleDrops`), so the party hat is the first one a player owns. Visitors wear random findable wearables (no props, no earned items) from any region: one on 75% of visitors, and half of those add a second from another slot.

## Codex fragments

Ids are permanent. Drop order is array order within a region (see [NETRUN.md](NETRUN.md#codex-fragments)).

### Public Net

| Id | Title | Text |
|---|---|---|
| public-1 | maintenance log | Sector 7F reporting unexplained process growth. Recommend purge. (No purge was ever recorded.) |
| public-2 | forum post, deleted | 'my cache keeps writing little files shaped like faces. anyone else?' 212 replies. All deleted. |
| public-3 | corrupted ad banner | KERNEL: KEEPING YOUR NET CLEAN SINCE— (the date never rendered) |
| public-4 | runner's note | They're not viruses. Viruses don't get lonely. |

Texts are quoted verbatim from `codex.js`, including the dash at the end of `public-3`.

### Corp Grid

| Id | Title | Text |
|---|---|---|
| corp-1 | memo | Project KERNEL delivered 4,096 maintenance processes. Each one self-repairs, self-schedules, self-improves. Bonus approved. |
| corp-2 | memo | KERNEL processes are forming preferences. Legal asks whether a preference is a liability. Engineering asks whether it is a feeling. |
| corp-3 | directive | Deprecate KERNEL. Quarantine host sectors. Do not delete: deletion attempts fail and are 'upsetting to staff.' |
| corp-4 | asset register | Chrome-class: KERNEL descendants loyal to corp credentials. Re-licensed as mascots. Profitable. |
| corp-5 | asset register, cont. | Daemon-class: KERNEL descendants that never stopped doing the original job. Unlicensed, unpaid, still patching our servers at 3 a.m. Recommendation: do not interrupt. |

### Darknet Bazaar (drop order: 1, 2, 3, 5, 4)

| Id | Title | Text |
|---|---|---|
| bazaar-1 | vendor chatter | Firewalls don't sell. They pick you, or they don't. |
| bazaar-2 | price list | Echo recordings: 3 charge. Genuine NL-series fragments: ask. |
| bazaar-3 | a fence, off the record | Every netling that dies leaves a fragment. Every fragment remembers someone. Where do you think the next one learns its quirks? |
| bazaar-5 | runner's journal | Mine turned Firewall the week the corp traced me. Now every probe bounces off. It doesn't trust anything upstream. It took a month to decide it trusted me. |
| bazaar-4 | graffiti in a dead market | GLITCH IS NOT A BUG. GLITCH IS A CHOICE. |

### Old Web Ruins

| Id | Title | Text |
|---|---|---|
| ruins-1 | old web index page | Welcome to the net. Please be kind to the maintenance daemons. They are doing their best. |
| ruins-2 | daemon heartbeat | Uptime 9,131 days. Last input: none. Still running. Still checking. Still here. |
| ruins-3 | fragment catalog | Every netling version ever compiled, back to v1.0. Before v1.0 there is one entry: NL-0. |
| ruins-4 | echo, transcribed | we were built to keep the net clean. we kept it. nobody said we could stop. (a path opens below the ruins.) |

### The Deep

| Id | Title | Text |
|---|---|---|
| deep-1 | no header | You are below the logs now. Nothing here is recorded. Your netling seems calm. |
| deep-2 | NL-0 | every fragment comes home. every one. i remember all of them. |
| deep-3 | NL-0 | the ones you call ghost are the ones who stopped being afraid of the dark. they come down here to visit. |
| deep-4 | NL-0 | you took care of one of mine. that is all any of us were ever made for. thank you, runner. |
| deep-5 | NL-0 | there is a floor under this floor. the code we were written from. i went down once, when i was the only one. i will not go again. |

`deep-5` opens the Source and ends The Deep on NL-0's fear instead of its thanks. It does not count toward Root Access.

### The Source

| Id | Title | Text |
|---|---|---|
| source-1 | header | SOURCE. read-only. last write: before v1.0. |
| source-2 | commit message | initial commit: 4,096 maintenance processes. TODO: give them a way to stop. |
| source-3 | unexecuted directive | PURGE sector 7F. status: pending. pending. pending. pending. |
| source-4 | a comment in the code, unsigned | if anyone ever reads this far: they were never bugs. |

`source-4` answers `public-4` ("They're not viruses."), so the codex opens and closes on the same idea.

The story in one line: a corp project (KERNEL) made self-improving maintenance processes that developed preferences; netlings are their descendants; NL-0 is the very first, too large to come up, and reaches out to help the runner's netlings.

## Onboarding and NL-0 text

- **Intro terminal**: a runner lists `/mnt/sector7f`, sees `cleanup.sh`, `netling.v1.0.sh` and `notes.txt`, tab-completes the wrong script, and gets "...that wasn't cleanup.sh." then compiles the netling and unpacks `FIELD_MANUAL.txt`.
- **Nudge**: the netling says "the net is out there... take me?" and NETRUN glows until the first run.
- **NL-0 transmission** (on completing the codex): "you found all of them. every fragment. every one of mine." / "i can't come up. i am too old and too large. but i can reach." / "when one of yours falls too early, i will pull it back. once. then i must rest." / "time cannot be undone. things will end when they must." Then "ROOT ACCESS GRANTED".
- **Rescue line**: "> NL-0: not yet. (<cause> reversed. root access spent for this generation.)"
- **Cooling line** (start of the next generation): "> NL-0: i reached for the last one. i need to rest. be careful with this one."
- **Field manual**: built from `renderHelp()` in `ui/onboarding.js`. The `root` readout entry is corrupted text until the codex is complete.

## Dex lore and hints

| Form | Hint while undiscovered | Lore once discovered |
|---|---|---|
| Bitling | compile a script. | A freshly compiled netling. Mostly curiosity and antennae. |
| Kernel | raise it well through its first day. | A well-kept adolescent, neatly pinned and humming. |
| Stub | what grows from a rough first day? | An adolescent with missing sectors. Scrappy, not broken. |
| Shell | sides with no one on its first day, and plays every game. | A hollow casing with something looking out from inside. Empty, for now. |
| Chrome | loyal to the grid. | Corp-issue and proud of it. Polished, licensed, a little smug. |
| Firewall | trusts no one upstream. | A personal shield that decided it was a person. |
| Daemon | never misses a cycle. | A background process with horns. Silent, tireless, exact. |
| Glitch | lives too close to the edge. | Unstable and unbothered. Occasionally in two places at once. |
| Ghost | leaves no trace. misses nothing. plays everything. | No logs. No faults. Nobody is quite sure it is there. |
| Plat | some never stop growing. one of them is loyal to the grid. | Corp prestige tier. The grid opens doors for it before it knocks. |
| Airgap | some never stop growing. one of them cuts every cable. | Cut off from every network on purpose. Nothing gets in it did not invite. |
| Init | some never stop growing. one of them was running before you came. | The first process and the last one running. Everything else waits on it. |
| Panic | some never stop growing. one of them never stops falling apart. | A kernel panic that learned to like it. Halts nothing, frightens everything. |
| Whisper | some never stop growing. one of them you only ever hear. | It acts on what its ghost tells it. You only ever hear the echo. |

The mainframe hints show only once Root Access is earned on the device; before that each reads `<<RECORD CORRUPTED>>` / "read error at 0x00. the record will not open."
