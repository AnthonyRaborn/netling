// The field manual, and onboarding:
// intro (terminal) -> readme (field manual) -> nudge (go explore) -> tutorial (first run) -> done
import { createScript, drainCurve, isAlive, CFG, MIN } from '../sim.js';
import { mainframeManual } from '../archive.js';
import { startRun, RUN_CFG } from '../netrun/run.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, newForms, rootUnlocked, now, save, store } from './app.js';
import { grantStyle } from './style.js';
import { openRun } from './play.js';
import { advance } from './life.js';

// --- field manual ---

// Built from the live config so the numbers never drift from the rules.
function renderHelp() {
  const d = CFG.drainPerHour;
  const pct = (mult) => `${Math.round(mult * 100)}%`;
  // Awake drain per hour when full, at half and near empty (it drains faster the fuller it is).
  const rates = (base) => [100, 50, 0].map((v) => Math.round(base * drainCurve(v)));
  const sections = [
    [
      'STATS',
      [
        ['CHG · Charge', `Power. Drains faster the fuller it is: awake, about ${rates(d.charge).join(', ')}/hr when full, half full and nearly empty; much slower while it rests (see REST). Feed it with CORP PKT or SCAV DATA.`, 'At zero it becomes a fault and Integrity starts slipping.'],
        ['SYN · Sync', `Its bond with you. Drains like Charge: about ${rates(d.sync).join(', ')}/hr when full, half full and nearly empty. PLAY a mini-game to raise it; wins count for more.`, 'At zero it becomes a fault.'],
        ['INT · Integrity', `Its health. Viruses, a full cache, overheating and an empty Charge all wear it down. It recovers ${CFG.integrityRegenPerHour}/hr when nothing is wrong, ${CFG.integrityRestRegenPerHour}/hr while it sleeps in the dark or naps; COOL and PURGE each restore ${CFG.careIntegrity} more.`, `At zero for ${CFG.flatlineIntegrityMin / 60} hours, it flatlines.`],
        ['HEAT', 'Rises while it is awake, when it plays, on netruns and in power surges. COOL vents it; it cools on its own while it rests.', 'At 85+ it damages Integrity; at 100 it is a fault.'],
        ['OC · Overclocked', `At ${CFG.overclockHeat}+ Heat the bar reads OC. Mini-games run ${pct(1 - CFG.overclockGameSpeed)} slower and wins find items ${CFG.overclockDropMult}x as often; a netrun jacked into overclocked slows its ICE the same way. But a lost game costs ${-CFG.overclockLoseSync} Sync and ${CFG.overclockLoseIntegrity} Integrity, lost ICE bites ${CFG.overclockIceDamageMult}x as hard, and traces, intrusions, overflows and surges come ${pct(CFG.overclockEventMult - 1)} more often.`, 'Running hot or cool leans it one way or the other as it grows.'],
        ['CACHE', 'Corrupted files it writes after eating, up to four. PURGE clears them.', '3+ files damage Integrity and make viruses more likely.'],
      ],
    ],
    [
      'REST',
      [
        ['Sleep', `It sleeps at night on its own. With the LIGHTS OFF its stats drain at ${pct(CFG.sleepDarkDrainMult)} of the awake rate; with them on, ${pct(CFG.sleepDrainMult)}, and it can't settle. Nothing new finds it while it sleeps, and an open event's timer holds until morning.`, `Lights left on for ${CFG.lightsGraceMin} minutes is a fault.`],
        ['NAP', `A rest on demand, up to ${CFG.napMaxMin / 60} hours: stats drain at ${pct(CFG.napDrainMult)} while time keeps passing. It can't eat, play or jack in while napping; WAKE UP ends it early. Unlike sleep, a nap does not pause an open alert's timer, so answer traces, intrusions and overflows first.`, `After a nap it needs ${CFG.napCooldownMin / 60} hours awake before the next one.`],
        ['Lights off, awake', 'The screen goes dark and it gets bored: Sync drains faster.'],
      ],
    ],
    [
      'QUIRKS',
      [
        ['quirks', 'Every netling compiles with its own quirks: its colors, the pitch of its voice, the way it moves when idle, a favorite kind of packet, and how early or late it goes to bed. Feed it the one it loves and it perks up a little. Watch it to find out the rest.', 'Each generation inherits one quirk from the netling before it. A Memory shard rewrites one at random.'],
      ],
    ],
    [
      'THE READOUT',
      [
        ['v1.0 Kernel', 'Generation number and its current form.'],
        ['age · bed', 'How long it has been running, and the hour it goes to sleep.'],
        ['faults', `Care mistakes. A need left unmet for ${CFG.mistakeGraceMin} minutes counts as one (${CFG.lightsGraceMin} for sleeping with the lights on). ${CFG.maxMistakes} ends its life.`],
        ['trait', 'What it inherited from the netling before it. A numeral (II, III) means that form ran in the family for generations in a row, and the trait is stronger. Its history is a weaker trait from the generation before that.'],
        // Hidden until earned: the codex holds the secret.
        rootUnlocked()
          ? ['root', "NL-0's protection, once you have earned it: ready, spent, or cooling."]
          : ['r\u2593\u2592t', '\u2591\u2592\u2593 [sector corrupted] \u2593\u2592\u2591', 'unrecoverable. for now.'],
        // The Mainframe stage, behind its switch: corrupted until Root Access, then a hint, then the rule.
        ...[mainframeManual(app.dex, { rootEarned: rootUnlocked() })].filter(Boolean),
      ],
    ],
    [
      'ON THE SCREEN',
      [
        ['!', 'It needs something. Check the bars.'],
        ['virus icon', 'Infected. PATCH it before Integrity collapses.'],
        ['eye', 'A corp trace. HIDE or COMPLY before the timer runs out.'],
        ['crosshair', `An intrusion attempt. DEFEND (a mini-game) within ${CFG.attackWindowMin} minutes, or it installs a virus.`, 'An active antivirus shield bounces them.'],
        ['overflowing chip', `A memory overflow. PURGE within ${CFG.overflowWindowMin} minutes, or it crashes and reboots for ${CFG.rebootMin} minutes with its cache full.`, 'Cache files make overflows likelier.'],
        ['file icons', `Corrupted cache files, bottom left: one per file, up to ${CFG.maxCache}. It writes them now and then while digesting a meal. PURGE clears them.`, '3+ files damage Integrity; every file makes a virus more likely.'],
        ['Z', 'Resting: asleep for the night (turn the LIGHTS OFF), or napping.'],
        ['a second netling', `A stray visitor, playing with it for ${CFG.visitMinMin} to ${CFG.visitMaxMin} minutes: +${CFG.visitSync} Sync, +${CFG.visitHeat} Heat. GREET it while it is here and it may pass on a line from the wider net.`, 'Sometimes it leaves a gift; more often if you said hello.'],
        ['a request', `Now and then it asks for one game, or for a COOL when it is warm, and waits ${CFG.requestWindowMin} minutes. Answer it from the bar below the inventory.`, 'Nothing bad happens if you miss one.'],
        ['a contract', `While the uplink is ready and the app is open, a job for one region may come in: reach its exit, get past some ICE, crack caches, buy at a market or bring back a fragment. It waits ${RUN_CFG.contractOpenMin / 60} hours, and every route through that run can meet it. Pays scrip, sometimes an item.`, 'Nothing bad happens if you miss one.'],
        ['a speech bubble', `It mutters to itself while it is awake and idle. Lines you see are kept in the Archive under CHATTER.`, 'Lines only count while the app is open.'],
        ['a glow', `Kept in good shape for ${CFG.flowAfterMin / 60} hours in a row while awake (Charge and Sync ${CFG.flowMinStat}+, Integrity ${CFG.flowMinIntegrity}+, Heat under ${CFG.flowMaxHeat}, nothing wrong), it glows. Time in flow leans it steadier as it grows.`],
      ],
    ],
  ];
  const body = sections.flatMap(([title, rows]) => {
    const h = document.createElement('h3');
    h.textContent = title;
    const dl = document.createElement('dl');
    for (const [term, desc, note] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = desc;
      if (note) {
        const small = document.createElement('small');
        small.textContent = note;
        dd.append(small);
      }
      dl.append(dt, dd);
    }
    return [h, dl];
  });
  const tip = document.createElement('p');
  tip.textContent = 'It lives in real time, even while this page is closed. Hover a stat for a reminder.';
  $('help-body').replaceChildren(tip, ...body);
}

export function openHelp({ readme = false } = {}) {
  renderHelp();
  $('help-title').textContent = readme ? 'FIELD_MANUAL.txt' : 'FIELD MANUAL';
  if (readme) {
    const p = document.createElement('p');
    p.textContent = '// unpacked from netling.v1.0.sh. you just compiled something alive. keep it that way.';
    $('help-body').prepend(p);
  }
  $('help').showModal();
  store.set(KEYS.helpSeen, true);
}

// --- onboarding ---

export function setOnboarding(step) {
  app.onboarding = step;
  store.set(KEYS.onboarding, step);
  renderNudge();
}

const INTRO_LINES = [
  ['runner@sprawl:~$ ls /mnt/sector7f', ''],
  ['cleanup.sh   netling.v1.0.sh   notes.txt', ''],
  ['runner@sprawl:~$ ./', ''],
  ['  [tab]', ''],
  ['runner@sprawl:~$ ./netling.v1.0.sh', 'hl'],
  ['', ''],
  ["...that wasn't cleanup.sh.", 'warn'],
  ['', ''],
  ['> compiling netling.v1.0 ...', 'hl'],
  ['> unpacking FIELD_MANUAL.txt', ''],
];
let introTimer = null;
let introShown = 0;

export function startIntro() {
  introShown = 0;
  document.body.classList.add('intro-active');
  $('intro').hidden = false;
  $('intro-next').hidden = true;
  $('intro-text').replaceChildren();
  typeNextLine();
}

function typeNextLine() {
  if (introShown >= INTRO_LINES.length) {
    $('intro-next').hidden = false;
    scrollIntro(); // the prompt takes room from the text
    return;
  }
  const [line, cls] = INTRO_LINES[introShown++];
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = `${line}\n`;
  $('intro-text').append(span);
  scrollIntro();
  sfx('move', 520);
  introTimer = setTimeout(typeNextLine, line ? 520 : 260);
}

// Keeps the newest line in view when the screen is too short for all of them.
function scrollIntro() {
  const pre = $('intro-text');
  pre.scrollTop = pre.scrollHeight;
}

export const introWaiting = () => app.onboarding === 'intro' && !$('intro').hidden;

export function advanceIntro() {
  if (app.onboarding !== 'intro') return;
  unlockAudio();
  if (introShown < INTRO_LINES.length) {
    // tap skips the typing
    clearTimeout(introTimer);
    while (introShown < INTRO_LINES.length) typeNextLine();
    clearTimeout(introTimer);
    typeNextLine(); // all typed: shows the prompt
    return;
  }
  $('intro').hidden = true;
  document.body.classList.remove('intro-active');
  // The script compiles for real: a fresh netling that boots on the next tick.
  app.state = createScript({ now: now() - CFG.bootMinutes * MIN, rootAccess: rootUnlocked(), newForms: newForms() });
  app.lastStage = app.state.stage;
  app.lastLogKey = '';
  save();
  advance();
  setOnboarding('readme');
  setTimeout(() => openHelp({ readme: true }), 700);
}

// The netling asks to go exploring; NETRUN glows until the first run.
export function renderNudge() {
  const nudging = app.onboarding === 'nudge' && isAlive(app.state) && !app.session;
  if (nudging) {
    $('speech').hidden = false;
    $('speech').textContent = 'the net is out there... take me?';
  }
  $('btn-netrun').classList.toggle('nudge', nudging);
  return nudging; // the speech bubble is the nudge's; chatter waits (see renderSpeech)
}

export function startTutorial() {
  startRun(app.state, 'tutorial', Math.random, app.codex, app.ownedAccessories);
  setOnboarding('tutorial');
  sfx('boot', app.state.quirk.pitch);
  save();
  openRun();
}

export function finishOnboarding() {
  setOnboarding('done');
  if (!app.ownedAccessories.includes('partyhat')) {
    grantStyle('partyhat', 'a gift: party hat. accessories live in ARCHIVE > STYLE.');
    app.wardrobe = { ...app.wardrobe, head: 'partyhat' };
    store.set(KEYS.wardrobe, app.wardrobe);
  }
  $('open-archive').classList.add('nudge');
  setTimeout(() => $('open-archive').classList.remove('nudge'), 9000);
}

export function initOnboarding() {
  $('open-help').addEventListener('click', () => openHelp());
  $('close-help').addEventListener('click', () => $('help').close());
  $('help').addEventListener('click', (e) => {
    if (e.target === $('help')) $('help').close();
  });
  $('help').addEventListener('close', () => {
    if (app.onboarding === 'readme') {
      setOnboarding('nudge');
      sfx('alert', app.state.quirk.pitch);
    }
  });
  $('intro').addEventListener('click', advanceIntro);
  addEventListener('resize', () => !$('intro').hidden && scrollIntro());
}
