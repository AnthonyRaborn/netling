// The field manual, and onboarding:
// intro (terminal) -> readme (field manual) -> nudge (go explore) -> tutorial (first run) -> done
import { createScript, isAlive, CFG, MIN } from '../sim.js';
import { startRun } from '../netrun/run.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, codexComplete, now, save, store } from './app.js';
import { grantStyle } from './style.js';
import { openRun } from './play.js';
import { advance } from './life.js';

// --- field manual ---

// Built from the live config so the numbers never drift from the rules.
function renderHelp() {
  const d = CFG.drainPerHour;
  const pct = (mult) => `${Math.round(mult * 100)}%`;
  const sections = [
    [
      'STATS',
      [
        ['CHG · Charge', `Power. Drains about ${d.charge}/hr awake, much slower while it rests (see REST). Feed it with CORP PKT or SCAV DATA.`, 'At zero it becomes a fault and Integrity starts slipping.'],
        ['SYN · Sync', `Its bond with you. Drains about ${d.sync}/hr. PLAY a mini-game to raise it; wins count for more.`, 'At zero it becomes a fault.'],
        ['INT · Integrity', 'Its health. Viruses, a full cache, overheating and an empty Charge all wear it down. It slowly recovers when nothing is wrong.', `At zero for ${CFG.flatlineIntegrityMin / 60} hours, it flatlines.`],
        ['HEAT', 'Rises while it is awake, when it plays, on netruns and in power surges. COOL vents it; it cools on its own while it rests.', 'At 85+ it damages Integrity; at 100 it is a fault.'],
        ['CACHE', 'Corrupted files it writes after eating, up to four. PURGE clears them.', '3+ files damage Integrity and make viruses more likely.'],
      ],
    ],
    [
      'REST',
      [
        ['Sleep', `It sleeps at night on its own. With the LIGHTS OFF its stats drain at ${pct(CFG.sleepDarkDrainMult)} of the awake rate; with them on, ${pct(CFG.sleepDrainMult)}, and it can't settle.`, `Lights left on for ${CFG.lightsGraceMin} minutes is a fault.`],
        ['NAP', `A rest on demand, up to ${CFG.napMaxMin / 60} hours: stats drain at ${pct(CFG.napDrainMult)} while time keeps passing. It can't eat, play or jack in while napping; WAKE UP ends it early.`, `After a nap it needs ${CFG.napCooldownMin / 60} hours awake before the next one.`],
        ['Lights off, awake', 'The screen goes dark and it gets bored: Sync drains faster.'],
      ],
    ],
    [
      'THE READOUT',
      [
        ['v1.0 Kernel', 'Generation number and its current form.'],
        ['age · bed', 'How long it has been running, and the hour it goes to sleep.'],
        ['faults', `Care mistakes. A need left unmet for ${CFG.mistakeGraceMin} minutes counts as one (${CFG.lightsGraceMin} for sleeping with the lights on). ${CFG.maxMistakes} ends its life.`],
        ['trait', 'What it inherited from the netling before it.'],
        // Hidden until earned: the codex holds the secret.
        codexComplete()
          ? ['root', "NL-0's protection, once you have earned it: ready, spent, or cooling."]
          : ['r\u2593\u2592t', '\u2591\u2592\u2593 [sector corrupted] \u2593\u2592\u2591', 'unrecoverable. for now.'],
      ],
    ],
    [
      'ON THE SCREEN',
      [
        ['!', 'It needs something. Check the bars.'],
        ['virus icon', 'Infected. PATCH it before Integrity collapses.'],
        ['eye', 'A corp trace. HIDE or COMPLY before the timer runs out.'],
        ['Z', 'Resting: asleep for the night (turn the LIGHTS OFF), or napping.'],
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
    return;
  }
  const [line, cls] = INTRO_LINES[introShown++];
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = `${line}\n`;
  $('intro-text').append(span);
  sfx('move', 520);
  introTimer = setTimeout(typeNextLine, line ? 520 : 260);
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
    return;
  }
  $('intro').hidden = true;
  document.body.classList.remove('intro-active');
  // The script compiles for real: a fresh netling that boots on the next tick.
  app.state = createScript({ now: now() - CFG.bootMinutes * MIN, rootAccess: codexComplete() });
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
  $('speech').hidden = !nudging;
  if (nudging) $('speech').textContent = 'the net is out there... take me?';
  $('btn-netrun').classList.toggle('nudge', nudging);
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
    app.wardrobe = { ...app.wardrobe, accessory: 'partyhat' };
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
}
