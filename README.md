# Netling

A cyberpunk, Tamagotchi-style virtual pet. It lives in real time (even while the page is closed), grows up according to how you raise it, and flatlines if neglected. Each death leaves a fragment that shapes the next generation.

No build step, no dependencies: vanilla JavaScript modules and canvas.

> **AI disclosure:** this game was made with AI. Most of its code, tests, pixel art and text were written by an AI model (Anthropic's Claude, through Claude Code) under human direction and review. It's a hobby project: review anything you reuse from it.

## Contents

- [Play](#play)
- [Your first few minutes](#your-first-few-minutes)
- [What your netling needs](#what-your-netling-needs)
- [Caring for it](#caring-for-it)
- [Rest: sleep, lights and naps](#rest-sleep-lights-and-naps)
- [When things go wrong](#when-things-go-wrong)
- [Items](#items)
- [Mini-games](#mini-games)
- [Netruns](#netruns)
- [Growing up, and what comes after](#growing-up-and-what-comes-after)
- [Style](#style)
- [Saving, moving and pausing](#saving-moving-and-pausing)
- [Install, offline and controllers](#install-offline-and-controllers)
- [For developers](#for-developers)

## Play

Open the game in a modern browser: anthonyraborn.github.io/netling. You can use this link as a PWA to install it as an app on your device (see below).

To host it on your own machine: after cloning and moving to the directory, `npm run serve`, then http://localhost:5174. Your netling is saved in the browser, so use the same browser (or the transfer feature below) to come back to it.

The **?** button in the header opens the in-game **field manual**, which always matches the current rules. This README is the longer, friendlier version.

## Your first few minutes

A new game opens with a short intro: you run a script by accident, and it turns out to be a living thing. A field manual opens, then your netling asks to go exploring and you take it on a short, gentle **netrun** (a guided first run). It ends with a party hat, and you're on your own.

The first three minutes it is still compiling. After that it is a **Bitling**, and the clock is running.

## What your netling needs

Four bars and a small icon row sit under the screen. Everything the game asks of you comes down to keeping these healthy.

| Stat | What it is | Goes down when | Looks like trouble at |
|---|---|---|---|
| **CHG** (Charge) | Its power | Time passes, faster the fuller it is (awake, about 31 an hour when full, 18 at half, 6 near empty) | 0: it becomes a fault, and Integrity starts slipping |
| **SYN** (Sync) | Its bond with you, and how happy it is | Time passes, the same way (about 26 an hour when full, 16 at half, 5 near empty) | 0: it becomes a fault |
| **INT** (Integrity) | Its health | A virus, a full cache, overheating or empty Charge wear it down | 0 for two hours in a row: it flatlines |
| **HEAT** | How hot it is running | Rises when it's awake, plays, netruns, or gets a power surge | 65 and up: overclocked (see below). 85 and up hurts Integrity; 100 is a fault |
| **Cache** (the little file icons) | Corrupted files it writes while digesting a meal, up to four | Each file makes viruses likelier; 3 or more damage Integrity | Clear it with PURGE |

Integrity heals on its own (5 an hour) whenever nothing is wrong, and faster (8 an hour) while it sleeps in the dark or naps.

### Running hot

At 65 Heat and up it is **overclocked**: the HEAT label turns to **OC** and heat wisps rise off it. Overclocked, mini-games run 15% slower and wins turn up items more often, and a netrun you jack into overclocked slows its ICE fights too. The catch: a lost game costs Sync and Integrity instead of cheering it up, lost ICE hits harder, and trouble (traces, intrusions, overflows, surges) comes more often. Visitors like a hot netling, though: they drop by more often. Above 85 the usual overheating damage still applies on top. Running hot or keeping it cool also leans it one way or the other as it grows.

The line under the bars, the **readout**, shows the generation, its form, its age, its bedtime, its **faults** and its inherited **trait**.

### Faults

A **fault** (care mistake) is a need left unmet for 15 minutes: Charge at 0, Sync at 0, or Heat at 100. Sleeping with the lights on counts after 60 minutes. Ten faults, two hours at zero Integrity, or old age ends its life. Faults also nudge how it grows up, so a tidy life matters for more than survival.

## Caring for it

| Button | What it does | Notes |
|---|---|---|
| **CORP PKT** | Feeds it a licensed packet: +30 Charge | Refused when it is nearly full. Feeding it starts digestion, which is when cache files appear |
| **SCAV DATA** | Feeds it scavenged data: +25 Charge | A small chance the payload is infected. Your choices between corp and scavenged food shape what it becomes |
| **PLAY** | Pick a mini-game. Wins give more Sync than losses | Costs Charge and warms it up. It needs at least 10 Charge to play |
| **PATCH** | Cures a virus and restores a little Integrity | Only when it is infected |
| **COOL** | Vents Heat | Only when it's warm |
| **PURGE** | Clears every cache file, or stops a memory overflow | |
| **LIGHTS** | Toggles the lights | See rest, below |
| **NAP** | A short rest on demand | See rest, below |
| **NETRUN** | Jack into the net | See netruns, below |

Anything refused costs nothing: the netling shakes its head under a red X and the reason appears on screen. Successful actions play a short reaction (eating, patching, a hop after a game).

Each netling also has **quirks** you can discover by watching it: its colors, the pitch of its voice, how it moves when idle, a favorite kind of packet (feed it that one and it perks up), and how early or late it goes to bed.

### Little extras for being around

None of these ever costs a fault; they are small rewards for checking in often.

- **Requests**: now and then it asks for one mini-game, or for a COOL when it's warm, in a bar under the inventory. Answer within 45 minutes and it's delighted; otherwise it simply stops asking.
- **Visitors**: say hello with **GREET** while one is here.
- **Chatter**: it mutters to itself in a speech bubble. Lines you see are collected in the Archive's **CHATTER** tab.
- **A glow**: keep it in good shape (and cool) for a few hours and it shows. While it glows, trouble comes less often and visitors drop by more.
- **Daily check-in**: the first time you open the app after your netling wakes each day, a reward lands in the **BOX** beside your scrip. The rewards climb over seven days and start over; a missed day never resets them. Take what's in the box whenever you like.
- **Contracts**: while the uplink is ready and the app is open, a job for one netrun region may come in (reach the exit, get past some ICE, crack caches, buy at a market, bring back a fragment). It waits 6 hours; take it by jacking into that region. Every way through that run can meet it, and it pays scrip, sometimes an item.

With ALERTS on, requests, visitors and contracts also send a notification while the app is open in the background.

## Rest: sleep, lights and naps

- **Sleep**: it goes to bed at night by itself. Its bedtime is on the readout and differs a little from netling to netling. If you change time zones, it keeps the old one until it wakes up the next morning, then settles into the new one. Turn the **lights off** when it sleeps: stats drain at about a third of the awake rate, against half with the lights on, and Integrity heals faster. Leaving the lights on all night is a fault.
- **Nothing new happens while it rests**: no new viruses, cache files or alerts start. Anything already wrong keeps hurting, though, so patch a virus before bed. An open alert's timer holds until morning.
- **Nap**: up to two hours of rest on demand, at about a third of the awake drain. It can't eat, play or jack in while napping, and needs four hours awake before it can nap again. WAKE UP ends a nap early. Unlike sleep, a nap does not pause an alert's timer.
- **Lights off while awake** darkens the screen and bores it: Sync drains faster. Use it sparingly.

## When things go wrong

Trouble shows up as an icon on the screen, a bar at the top, and a chirp (or a notification if you turn ALERTS on).

| Sign | What it is | What to do |
|---|---|---|
| **!** | It needs something | Check the bars |
| Virus icon | It's infected and losing Integrity | PATCH it |
| Eye | A **corp trace**: someone is scanning it | **HIDE** (costs Charge and Heat) or **COMPLY** (costs Integrity and Sync) within 2 hours, or lose Integrity. Your choice leans it toward one side or the other |
| Crosshair | An **intrusion** attempt | **DEFEND** within an hour by winning a random mini-game, or it installs a virus |
| Overflowing chip | A **memory overflow** | **PURGE** within 45 minutes, or it crashes: Integrity loss, a full cache, and 20 minutes rebooting where you can only turn the lights on and off. More cache files make overflows likelier |
| Screen flicker | A **power surge**: instant Heat and a little Charge | Nothing to do, but watch the Heat |
| A second netling | A **visitor** playing with it for a while: +Sync, +Heat (no Heat while it glows) | Enjoy. **GREET** it if you like; it sometimes leaves a gift |

Only one alert is open at a time. If you leave a game or a netrun open, the clock keeps running behind it.

## Items

The inventory holds six items. Tap an item to see what it does, then **USE** it, or **SCRAP** it for a little scrip (with a confirm). Some only work while it is awake.

| Item | Effect |
|---|---|
| Coolant cell | Vents 50 Heat |
| Antivirus patch | Cures a virus and shields it against new ones for 6 hours |
| Corp voucher | Full Charge, and waves off a corp trace |
| Black ICE shard | Big Sync boost, but heat and a risk of infection |
| Signal booster | Your next mini-game win counts double |
| Memory shard | Rewrites one of its quirks at random |
| Repair kit | Restores 40 Integrity |
| Bypass chip | Shortens the wait before the next netrun by an hour |
| Segfault | Adds two faults on purpose (it asks you to press twice). Faults shape how it grows up, and ten end its life |

Items drop from mini-game wins, from handling traces and alerts, from visitors, and from netruns. Each adult form also leaves a keepsake item for the next generation. Anything found while the inventory is full is scrapped for you rather than lost.

**Corpo scrip** (shown above the inventory) is your netling's money, up to 100; anything past that is lost. Rarer items are worth more. Scrapping at home pays a quarter of an item's price; selling at a netrun market pays half. Half of what a netling holds passes to the next generation.

## Mini-games

PLAY offers four. Controls are left, right and A (keyboard arrows plus Space or Enter, the on-screen pad, or a controller).

| Game | Goal |
|---|---|
| **Breach Protocol** | Pick codes from a grid, alternating between rows and columns, until the target sequence lands in your buffer |
| **Firewall Dodge** | Slide between lanes to avoid the falling firewalls for 15 seconds |
| **Signal Tune** | Press A when your wave matches the ghost signal. Two of three rounds win |
| **Packet Feast** | Move under clean packets to eat 15 in 20 seconds. Two corrupted bites lose. Gives some Charge too |

Quitting mid-game counts as a loss. On a touch screen, QUIT asks you to confirm with a button at the top of the screen (tap KEEP PLAYING to carry on); Esc or a controller's B quits at once. Intrusions and netrun ICE use the same four games.

## Netruns

A netrun is an expedition. **Jack in** with at least 30 Charge while it is awake and not resting, and pick a path across a fogged map, one node at a time. Every move costs Charge and adds Heat, and a very hot netling starts losing Integrity. Between runs the uplink needs a few hours to cool down, and a clean run shortens the wait.

| Node | What happens |
|---|---|
| **Data cache** | May hold an item |
| **ICE** | A mini-game. Win to pass; lose and it bites into Integrity |
| **Relay** | Recharges and cools it, and lets you bank your loot and jack out safely |
| **Checkpoint** | A corp scan: hide, comply or pay with a voucher |
| **Market** | Buy items with scrip plus some Charge, and sometimes something stylish. While a market is open, the inventory's button sells for half price |
| **Anomaly** | A strange event with a risky choice |
| **Exit** | Banks everything you carry, plus a bonus, and clears the region |

Loot is only safe once you **jack out**, at a relay or the exit. If Integrity or Charge hits zero you are **disconnected**: the loot is lost, it costs a care mistake (but never the last one), and the netling reboots. You can also **abort** (press twice) to bail out with no penalty beyond losing the loot.

Every netling starts with only the Public Net. Reaching a region's exit **clears** it and opens the next one down, and some regions also wait for the netling to grow up. Each new netling finds its own way down. Runs also recover **codex fragments**, scraps of lore you can read in the Archive's CODEX tab. A netling's memory only holds eight new fragments in its life (the region list shows how many it has); the rest wait for the next generation. Each adult form has a knack that helps on runs, listed in the DEX once you have raised it.

## Growing up, and what comes after

- **Baby**: the first 17 hours. How it is raised through them decides which teen it becomes; good care (two faults or fewer) grows a healthier one.
- **Teen**: from 17 hours. The teen years shape what comes next.
- **Adult**: from 51 hours. What it becomes depends on how you raised it: what you fed it, how you handled traces, how tidy you kept it, how much you played. The **DEX** in the Archive lists the forms with hints for the ones you haven't found.
- **Old age**: a netling lives for five days. Some never stop growing, and a rare few earn a little more time. (One that was already alive when lives were shortened keeps its seven days, and its old 24 and 72 hour milestones.)

When it flatlines it leaves a **fragment**. The next generation inherits that netling's form as a **trait** (a small permanent perk), one of its quirks, a keepsake item and half its scrip. A family that keeps ending as the same form makes its trait stronger (shown as II or III), and the trait from two generations back lingers as a weaker **history**. The **ARCHIVE** shows every generation you have raised, a lifetime record, the DEX and the CODEX.

## Style

The Archive's **STYLE** tab holds cosmetic shells, screen tints, screen effects, sound packs, crests, background music, a device label, and accessories. All of it is unlocked by playing: raising forms, finishing a region's lore, full-length lives, mini-game streaks, care habits, netrun feats, the little extras above, and what your line achieves over generations. Locked items show only a hint. Accessories fit every form and are mostly bought at netrun markets or found on runs. Your netling can wear one on its head, one on its face, one on its body and one floating nearby, all at once, plus a prop on the ground. Everything is purely visual and shared across generations.

## Saving, moving and pausing

Everything is stored in your browser. On a phone or tablet, install the app (below) so the browser keeps the data. Safari on iPhone and iPad clears site data after about a week without a visit, so the game asks you to Add to Home Screen.

ARCHIVE > **SYSTEM** has:

- **Transfer out**: makes a code (`NL1...`) and a QR code holding everything, then locks this device. Load the code on another device with **Bring one here** (paste it, load a file, or scan the QR). Loading shows a preview first, and it is all or nothing. The lock stops *this* device from playing, but a code is not copy-protected: it can be loaded more than once, and time keeps passing on a netling while it is in a code.
- **Hibernate**: freezes the clock for a long break. It lasts at least 24 hours and needs three days to recover after waking, so it's for vacations, not for skipping a work day.
- **Restart**: erases everything and replays the intro.
- **Storage**: shows whether the browser has agreed to keep your data, and warns if a save has failed.
- **Effects** and **Music**: a volume slider each (music starts at 40% with your first tap; set it to 0 to turn music off). The header's SND toggle mutes both. On iPhone and iPad, the ringer switch can silence the game.
- **Motion**: AUTO follows your device's reduced-motion setting; REDUCED keeps the screen still (no glitching, flicker or scrolling effects) and FULL keeps every effect. Nothing flashes more than three times a second in any setting.
- **Keep screen on**: the screen always stays on during mini-games and netruns; turn this on to keep it on whenever the game is showing (where the browser supports it).

If a saved netling can't be read, it is set aside instead of overwritten, a new one compiles, and SYSTEM offers the old save as a download.

Only one browser tab looks after the netling at a time. Other tabs show a guard screen, take over when the first closes, or take over on request.

## Install, offline and controllers

Netling is a PWA: use the browser's "Install app" (desktop Chrome or Edge), "Add to Dock" (Safari on macOS 14+), or "Add to Home Screen" (iOS and Android). It caches itself, so it plays offline. When a new version comes out while the game is open, a NEW VERSION READY bar offers a reload (finish any game or netrun first); otherwise you get it the next time you open the game. On a Steam Deck, install it from Chrome in Desktop Mode, then add it to Steam as a non-Steam game to play in Game Mode.

**Controllers** work with no setup. In mini-games and netruns the d-pad or left stick moves, A confirms and B quits. Elsewhere the d-pad moves between buttons, A presses, and B backs out or closes a dialog. Browsers only notice a controller after you press one of its buttons on the page.

Wide, short screens (Steam Deck, laptops) put the screen beside the controls so everything fits without scrolling; phones and tall windows use one column.

**Notifications**: turn on **ALERTS** in the header and the game notifies you while it is open or in the background. With ALERTS on, the installed app's icon also shows a badge while your netling needs something (on devices that support it). A fully closed app can't be woken without a push server, which this static game doesn't have, so the badge shows how things stood when you closed it.

## For developers

```bash
npm run serve      # http://localhost:5174
npm test           # unit tests (Node 22)
npm run smoke      # drives the real app in headless Chromium (needs Playwright)
npm run balance    # simulates full lifetimes per player archetype
```

`npm run smoke` needs Playwright, which the game itself doesn't depend on: `npm install --no-save playwright && npx playwright install chromium`. CI runs both test suites on every pull request and push to `main`, and GitHub Pages deploys from `main` after the tests pass.

Add `?dev` to the URL for time-skip and forced-event buttons. There is also a separate fast-clock test mode for playtesting; see the docs.

Deeper documentation is in [`docs/`](docs/README.md): architecture, the full rules, netrun mechanics, the save format, a glossary, known issues, testing, the content catalog (which contains spoilers) and a contributing guide. [`docs/PLATFORMS.md`](docs/PLATFORMS.md) covers native apps.
