# Content catalog

Every piece of authored content: forms, items, mini-games, cosmetics, accessories, codex text. **Contains spoilers**, including hidden unlock conditions the game only hints at. Written against commit `ea87757`. When content changes, the tables in code are the source of truth; `gallery.html` shows every sprite.

## Contents

1. [Forms](#forms)
2. [Traits and perks](#traits-and-perks)
3. [Items](#items)
4. [Mini-games](#mini-games)
5. [Style: cosmetics](#style-cosmetics)
6. [Accessories and props](#accessories-and-props)
7. [Codex fragments](#codex-fragments)
8. [Onboarding and NL-0 text](#onboarding-and-nl-0-text)
9. [Dex lore and hints](#dex-lore-and-hints)

## Forms

| Form | Stage | How it is reached | Perk | Netrun ability | Keepsake | Trait passed on |
|---|---|---|---|---|---|---|
| Bitling | baby | Compile a script | none | none | n/a | n/a |
| Kernel | teen | 2 or fewer mistakes at the teen stage (17 hours; 24 for netlings compiled before the 5-day life), and not a Shell | none | none | n/a | n/a |
| Stub | teen | 3 or more mistakes at the teen stage | none | none | n/a | n/a |
| Shell | teen | On Ghost's path at the teen stage: allegiance under 2 either way, stability 0 or more, at most 1 mistake, every game won at least twice | none | none | n/a | n/a |
| Chrome | adult | Allegiance dominant and positive | Loves corp packets, sulks at scavenged data (+5 or -5 Sync) | Checkpoints wave it through; corp insurance saves it from one disconnect a run | Corp voucher | Licensed |
| Firewall | adult | Allegiance dominant and negative | -30% virus chance | ICE deals half damage | Antivirus patch | Hardened |
| Daemon | adult | Stability dominant and non-negative | Charge drains 20% slower | Sees node types two steps ahead; +6 Integrity each move | Coolant cell | Persistent |
| Glitch | adult | Stability dominant and negative | Play gives +10 to +40 Sync | Slips through the first ICE of each run, and 35% of later ones | Black ICE shard | Volatile |
| Ghost | adult | Neutral allegiance (under 2), stability 0 or more, at most 1 mistake, 18+ wins with 3+ in each game | All drains 15% slower | Sees every node; checkpoints never notice it, and 45% of ICE miss it | Memory shard | Untraceable |

"Dominant" means larger in absolute value. Within 0.5 it is a tie, broken at random with forms the player has never raised weighted 1.2. Full rules in [SIMULATION.md](SIMULATION.md#evolution-and-the-hidden-axes).

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
| Overclock chip | Cuts 1 hour off the netrun uplink cooldown (never below 2 hours) | 50 |
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

Slots: shell, tint, effect, sound. `free: true` items are available from the start. Hints are what the player sees while locked.

### Shells (9)

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

Owning all nine shells grants the secret **Mini device** prop.

### Tints (7)

| Id | Name | Unlock | Hint |
|---|---|---|---|
| `teal` | Classic teal | free | |
| `ice` | Ice | All 4 Public Net fragments | "hear everything the public net has to say." |
| `grid` | Grid yellow | All Corp Grid fragments | "read the whole employee file." |
| `violet` | Bazaar violet | All Bazaar fragments | "hear every rumor in the market." |
| `phosphor` | Green phosphor | All Old Web Ruins fragments | "learn what the ruins remember." |
| `abyss` | Abyss | All Deep fragments | "listen to the bottom of the net." |
| `amber` | Amber | 3 full lives in a row | "three in a row, start to finish." |

### Effects (8)

| Id | Name | Unlock | Hint |
|---|---|---|---|
| `scanlines` | Scanlines | free | |
| `clean` | Clean glass | free | |
| `interlace` | Interlace | 10 clean jack-outs | "come home clean, again and again." |
| `rain` | Code rain | Best Breach streak 10 | "an unbroken chain of breaches." |
| `bloom` | Bloom | Best Dodge streak 10 | "slip every wall, ten times over." |
| `curved` | Deep curve | Best Tune streak 10 | "hold the signal and never lose it." |
| `packets` | Packet rain | Best Feast streak 10 | "ten clean feasts without a bad bite." |
| `static` | Static | Exit The Deep once | "find the way back up from the bottom." |

Streaks count PLAY games only, not netrun ICE fights or DEFEND.

### Sounds (7)

| Id | Name | Wave, multiplier | Unlock | Hint |
|---|---|---|---|---|
| `beep` | Beep | square, 1 | free | |
| `soft` | Soft | sine, 1 | free | |
| `bass` | 8-bit bass | square, 0.5 | 100 meals | "a hundred meals." |
| `glass` | Glass | sine, 2 | 20 patches | "catch it before it spreads, twenty times." |
| `chime` | Chime | triangle, 1.25 | 10 complies | "answer when they call, ten times." |
| `buzz` | Buzz | sawtooth, 0.9 | 10 hides | "vanish when they call, ten times." |
| `arcade` | Arcade | triangle, 0.75 | 50 games played (PLAY plus netrun ICE) | "fifty games, win or lose." |

Sound packs apply to home sounds only. Netruns keep each region's own voice.

### Device label

Up to 10 characters from `A-Z`, `0-9`, space, `.`, `-` (default `NETLING`). Unlocked when the first netling has died: "lose one before you name the line."

## Accessories and props

24 wearable accessories (two are earned-only) and 4 props, 28 style items in all (`STYLE_ITEMS`). Rarity weights: common 6, rare 2, very rare 1. Findable means it can drop or be sold; earned means only a specific event grants it.

Wearables that can be found anywhere (`regions` unset), 10:

| Rarity | Items |
|---|---|
| Common | Cap, Scarf, Headphones, Flower, Bow |
| Rare | Shades, Visor, Crown |
| Very rare | Halo, Spark |

Regional wearables, 12 (they only turn up in their region):

| Region | Common | Rare | Very rare |
|---|---|---|---|
| Corp Grid | Corp barcode, Earpiece | Chrome jaw, Cyber eye | |
| Darknet Bazaar | Neon mohawk, Neural jack, Circuit tattoo, Rebreather | | |
| Old Web Ruins | | Sat-dish antenna, Data aura | KERNEL pin |
| The Deep | | | Drone buddy |

Earned wearables, 2:

| Item | Rarity | How it is earned |
|---|---|---|
| Party hat | common | Finish the tutorial netrun ("a gift for a first birthday"). Also backfilled for older saves |
| Bandage | rare | Survive a netrun disconnect, or an NL-0 rescue ("you have to survive something first") |

Props, 4 (drawn on the ground, own slot):

| Prop | Rarity | Source |
|---|---|---|
| Cyberdeck | rare | Bazaar only |
| Boom box | common | Bazaar only |
| Mini device | very rare | Earned: own every shell ("collect every shell. then look closer.") |
| Plush | rare | Earned: after the first netling dies. Drawn as a half-scale copy of the previous netling in its colors |

Recolorable accessories declare `colors`: Cap, Scarf, Shades, Visor, Neon mohawk, Circuit tattoo, Rebreather, Party hat. Custom colors must be `#rrggbb` and are stored per accessory in the wardrobe.

The tutorial run never drops accessories (`noStyleDrops`), so the party hat is the first one a player owns. Visitors wear random findable wearables (no props, no earned items) from any region.

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
