// Mini-games (PLAY), netruns (NETRUN), the control pad and the keyboard.
import { act, blockReason, tick } from '../sim.js';
import { recordGame } from '../cosmetics.js';
import { GameSession } from '../games/session.js';
import { RunView } from '../netrun/view.js';
import { abortRun, closeRun, runBlockReason, startRun } from '../netrun/run.js';
import { REGIONS, REGION_ORDER, regionLock } from '../netrun/regions.js';
import { FRAGMENTS } from '../netrun/codex.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, flashStatus, now, save, store } from './app.js';
import { updateHUD } from './hud.js';
import { checkUnlocks, countGame, drainAccessoryInbox, grantStyle } from './style.js';
import { drainCodexInbox } from './archive.js';
import { advanceIntro, finishOnboarding, introWaiting, startTutorial } from './onboarding.js';

function showPanel(name) {
  $('controls').hidden = name !== 'controls';
  $('picker').hidden = name !== 'picker';
  $('pad').hidden = name !== 'pad';
  $('regions').hidden = name !== 'regions';
}

// A mini-game or netrun that throws is closed rather than left frozen on screen. A broken run is
// aborted (its loot is lost, as with ABORT) so it can't crash again on the next resume.
export function dropSession(err) {
  console.error('netling: closing a session after an error', err);
  app.session = null;
  const run = app.state.run;
  if (run) {
    try {
      if (run.phase !== 'done') abortRun(app.state);
      closeRun(app.state, now());
      bumpProgress(run);
    } catch {
      app.state.run = null;
    }
    if (run.region === 'tutorial') finishOnboarding(); // never leave onboarding stuck on a broken tutorial
  }
  $('pad-quit').textContent = 'QUIT (ESC)';
  showPanel('controls');
  save();
  updateHUD();
  flashStatus(run ? 'the run crashed and was aborted. your netling is fine.' : 'the game crashed and was closed.', 4000);
}

// Pad and keyboard input for the running session, with the same safety net as the render loop.
function sendInput(fn) {
  try {
    fn(app.session);
  } catch (err) {
    dropSession(err);
  }
}

// Pad, keyboard and controller input for the running session.
export const sendKey = (key) => app.session && sendInput((s) => s.input(key));
export const quitSession = () => app.session && sendInput((s) => s.forfeit());

function bumpProgress(run) {
  const progress = app.progress;
  if (run?.result) progress.runs = { ...progress.runs, [run.result]: (progress.runs?.[run.result] ?? 0) + 1 };
  if (run?.result === 'jacked') {
    if ((run.tally?.iceLost ?? 0) === 0) progress.cleanJackouts = (progress.cleanJackouts ?? 0) + 1;
    const at = run.map.nodes.find((n) => n.id === run.pos);
    if (run.region === 'deep' && at?.type === 'exit') progress.deepExits = (progress.deepExits ?? 0) + 1;
  }
  if (run?.result) store.set(KEYS.progress, progress);
}

export function openRun() {
  app.session = new RunView(app.state, {
    now,
    sound: (name) => {
      const tone = REGIONS[app.state.run?.region]?.sound ?? { mult: 1, wave: 'square' };
      sfx(name, app.state.quirk.pitch * tone.mult, tone.wave);
    },
    onChange: () => {
      drainCodexInbox();
      drainAccessoryInbox();
      save();
      updateHUD();
    },
    onGame: () => countGame(),
    onClose: (run) => {
      app.session = null;
      if (run?.region === 'tutorial') finishOnboarding();
      if (run?.result === 'disconnected') grantStyle('bandage', 'earned: bandage. you made it back.');
      bumpProgress(run);
      checkUnlocks();
      $('pad-quit').textContent = 'QUIT (ESC)';
      showPanel('controls');
      save();
      updateHUD();
    },
  });
  $('pad-quit').textContent = 'ABORT RUN';
  showPanel('pad');
}

function jackIn(region) {
  tick(app.state, now());
  const blocked = runBlockReason(app.state, region, app.codex);
  if (blocked) {
    sfx('error', app.state.quirk.pitch);
    return flashStatus(blocked);
  }
  startRun(app.state, region, Math.random, app.codex, app.ownedAccessories);
  sfx('boot', app.state.quirk.pitch * REGIONS[region].sound.mult, REGIONS[region].sound.wave);
  save();
  openRun();
}

function renderRegions() {
  $('region-list').replaceChildren(
    ...REGION_ORDER.map((id) => {
      const r = REGIONS[id];
      const lock = regionLock(id, app.state.stage, app.codex);
      const secret = lock && r.requires;
      const regionFrags = FRAGMENTS.filter((f) => f.region === id);
      const found = regionFrags.filter((f) => app.codex.includes(f.id)).length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'region';
      b.disabled = Boolean(lock);
      b.style.borderLeftColor = r.palette.main;
      const name = document.createElement('span');
      name.className = 'rname';
      name.textContent = secret ? '???' : r.name.toUpperCase();
      name.style.color = lock ? '' : r.palette.main;
      const frag = document.createElement('span');
      frag.className = 'rfrag';
      frag.textContent = secret ? '' : `codex ${found}/${regionFrags.length}`;
      const meta = document.createElement('span');
      meta.className = 'rmeta';
      meta.textContent = lock ?? r.blurb;
      b.append(name, frag, meta);
      b.addEventListener('click', () => jackIn(id));
      return b;
    }),
  );
}

function startGame(id) {
  app.session = new GameSession(id, {
    sound: (name) => sfx(name, app.state.quirk.pitch),
    onFinish: (won) => {
      app.session = null;
      showPanel('controls');
      tick(app.state, now());
      // It can refuse the result: it fell asleep, ran out of charge or flatlined mid-game.
      const res = act(app.state, 'play', now(), Math.random, { game: id, won });
      if (res.ok) {
        app.progress.streaks = recordGame(app.progress.streaks, id, won); // streak unlocks: PLAY games only
        countGame();
      }
      if (!res.ok) flashStatus(res.msg);
      else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
      save();
      updateHUD();
    },
  });
  showPanel('pad');
}

const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ' ': 'a', Enter: 'a', z: 'a', x: 'a' };

export function initPlay() {
  $('btn-play').addEventListener('click', () => {
    unlockAudio();
    tick(app.state, now());
    const blocked = blockReason(app.state, 'play');
    if (blocked) {
      sfx('error', app.state.quirk.pitch);
      return flashStatus(blocked);
    }
    sfx('select', app.state.quirk.pitch);
    showPanel('picker');
  });
  $('picker-back').addEventListener('click', () => showPanel('controls'));
  document.querySelectorAll('[data-game]').forEach((btn) => btn.addEventListener('click', () => startGame(btn.dataset.game)));

  $('btn-netrun').addEventListener('click', () => {
    unlockAudio();
    tick(app.state, now());
    if (app.state.run) return openRun(); // resume
    if (app.onboarding === 'nudge') return startTutorial();
    const blocked = runBlockReason(app.state, 'public', app.codex);
    if (blocked) {
      sfx('error', app.state.quirk.pitch);
      return flashStatus(blocked);
    }
    sfx('select', app.state.quirk.pitch);
    renderRegions();
    showPanel('regions');
  });
  $('regions-back').addEventListener('click', () => showPanel('controls'));

  document.querySelectorAll('[data-key]').forEach((btn) =>
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sendKey(btn.dataset.key);
    }),
  );
  $('pad-quit').addEventListener('click', quitSession);

  document.addEventListener('keydown', (e) => {
    if (introWaiting() && [' ', 'Enter', 'z', 'x'].includes(e.key)) {
      e.preventDefault();
      return advanceIntro();
    }
    if (!app.session) return;
    if (e.key === 'Escape') return quitSession();
    const key = KEYMAP[e.key];
    if (!key || e.repeat) return;
    e.preventDefault();
    sendKey(key);
  });
}
