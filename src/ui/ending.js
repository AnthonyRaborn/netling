// The ending scene (ending.js): a terminal that types the purge order out, waits for the player to run SUDO, then
// types NL-0's goodbye and the credits. Shown once when it is due (after a run, or on load for a player who already
// qualifies); REPLAY ENDING in the codex plays it again. With motion calmed, each part prints at once.
import { log } from '../sim.js';
import { ENDING_AFTER, ENDING_BEFORE, ENDING_LOG, creditLines, endingDue } from '../ending.js';
import { sfx } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, now, save, store } from './app.js';
import { checkUnlocks } from './style.js';

export const LINE_MS = 600;
const CREDIT_MS = 150;
let timer = null;

const kind = (line) => (line.startsWith('$') ? 'cmd' : line.startsWith('> NL-0') ? 'nl0' : '');

// Adds lines one at a time (all at once when calm), then calls done.
function typeLines(lines, ms, cls, done) {
  const box = $('ending-lines');
  const add = (line) => {
    const d = document.createElement('div');
    d.textContent = line;
    const c = cls ?? kind(line);
    if (c) d.className = c;
    box.append(d);
    box.scrollTop = box.scrollHeight;
  };
  if (app.calm) {
    lines.forEach(add);
    return done();
  }
  let i = 0;
  const next = () => {
    if (i >= lines.length) return done();
    add(lines[i++]);
    timer = setTimeout(next, ms);
  };
  next();
}

function stop() {
  clearTimeout(timer);
  timer = null;
}

// The first time: keep it for good, let NL-0 rest in this netling's lines, and unlock the crest.
function finish() {
  if (app.progress.ended) return;
  app.progress.ended = true;
  store.set(KEYS.progress, app.progress);
  app.state.nl0Rests = true;
  log(app.state, now(), ENDING_LOG);
  save();
  checkUnlocks();
}

export function showEnding() {
  stop();
  if ($('archive').open) $('archive').close();
  $('ending-lines').replaceChildren();
  $('ending-sudo').hidden = true;
  $('ending-close').hidden = true;
  $('ending').showModal();
  sfx('evolve', 220, 'sine');
  typeLines(ENDING_BEFORE, LINE_MS, null, () => {
    $('ending-sudo').hidden = false;
    $('ending-sudo').focus();
  });
}

// Running it is what counts: closing the dialog before the credits still ends it.
function runSudo() {
  $('ending-sudo').hidden = true;
  sfx('patch', 440, 'sine');
  finish();
  typeLines(ENDING_AFTER, LINE_MS, null, () => {
    typeLines(['', ...creditLines(app.lineage, app.state)], CREDIT_MS, 'credits', () => {
      $('ending-close').hidden = false;
      $('ending-close').focus({ preventScroll: true });
      $('ending-lines').scrollTop = $('ending-lines').scrollHeight; // the button took room: show the last line again
    });
  });
}

// After a run closes and on load: play it if it is due and nothing else is on screen.
export function maybeShowEnding() {
  if (app.session || app.lock || app.inactive || app.onboarding !== 'done' || document.querySelector('dialog[open]')) return false;
  if (!endingDue(app.codex, app.progress)) return false;
  showEnding();
  return true;
}

export function initEnding() {
  $('ending-sudo').addEventListener('click', runSudo);
  $('ending-close').addEventListener('click', () => $('ending').close());
  $('ending').addEventListener('close', stop);
  $('replay-ending').addEventListener('click', showEnding);
}
