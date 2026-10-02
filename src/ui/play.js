// Mini-games (PLAY), netruns (NETRUN), the control pad and the keyboard.
import { act, blockReason, gameSpeed, isAlive, log, tick, CFG, GAME_IDS } from '../sim.js';
import { recordGame } from '../cosmetics.js';
import { GameSession } from '../games/session.js';
import { RunView } from '../netrun/view.js';
import { abortRun, closeRun, codexRoom, contractMinutesLeft, contractPay, contractText, fmtLeft, runBlockReason, startRun, RUN_CFG } from '../netrun/run.js';
import { REGIONS, regionLock, shownRegions } from '../netrun/regions.js';
import { liveFragments, allFragmentsFound } from '../netrun/codex.js';
import { CHALLENGES, CHALLENGE_REGIONS, challengeById, challengesOpen } from '../netrun/challenges.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, flashStatus, now, playAnim, save, store } from './app.js';
import { updateHUD } from './hud.js';
import { checkUnlocks, countAttention, countGame, drainAccessoryInbox, grantStyle } from './style.js';
import { drainCodexInbox } from './archive.js';
import { maybeShowEnding } from './ending.js';
import { markDailyStart, playedToday, recordDaily, showDaily, todayKey } from './daily.js';
import { DAILY, dayNumber } from '../netrun/daily.js';
import { advanceIntro, finishOnboarding, introWaiting, startTutorial } from './onboarding.js';

export function showPanel(name) {
  $('controls').hidden = name !== 'controls';
  $('picker').hidden = name !== 'picker';
  $('pad').hidden = name !== 'pad';
  $('regions').hidden = name !== 'regions';
  $('box').hidden = name !== 'box';
  if (name !== 'pad') disarmQuit(); // a confirm never outlives its game
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
  resetPadQuit();
  showPanel('controls');
  save();
  updateHUD();
  flashStatus(run ? 'the run crashed and was aborted. your netling is fine.' : 'the game crashed and was closed.', 4000);
}

// A mini-game or netrun that belongs to a netling that has flatlined (or been replaced) is closed
// without counting anything: no result, no progress, no loot.
export function closeStaleSession() {
  const s = app.session;
  // A DEFEND that ended without reporting (a crash, a reload) must not hold the intrusion forever.
  if (!s) {
    if (app.state.event?.defending) delete app.state.event.defending;
    return;
  }
  const stale = app.state.stage === 'dead' || (s.pet && s.pet !== app.state);
  if (!stale) return;
  app.session = null;
  resetPadQuit();
  showPanel('controls');
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
export const sendKey = (key) => {
  if (app.quitArmed) return disarmQuit(); // any game input answers the confirm with KEEP PLAYING, and is not played
  return app.session && sendInput((s) => s.input(key));
};
export const quitSession = () => {
  disarmQuit();
  return app.session && sendInput((s) => s.forfeit());
};

// On touch, QUIT (or ABORT RUN) asks for a confirm somewhere else: a button over the top of the
// screen, away from the pad where thumbs rest, so a second tap in the same place never quits.
// While it shows, the game is paused.
// Keyboard (Esc) and controller (B) keep their own behaviour through quitSession.
const QUIT_CONFIRM_MS = 3000;
let quitTimer = null;

export function resetPadQuit() {
  const run = app.session instanceof RunView;
  $('pad-quit').textContent = run ? 'ABORT RUN' : 'QUIT (ESC)';
  $('pad-confirm').textContent = run ? 'CONFIRM ABORT' : 'CONFIRM QUIT';
}

function disarmQuit() {
  clearTimeout(quitTimer);
  quitTimer = null;
  app.quitArmed = false;
  $('pad-confirm').hidden = true;
  resetPadQuit();
}

function armQuit() {
  const run = app.session instanceof RunView;
  // An ICE fight inside a run is a mini-game: losing it is the cost, not the loot.
  $('pad-confirm').textContent = run && !app.session.game ? 'CONFIRM ABORT' : 'CONFIRM QUIT';
  $('pad-confirm').hidden = false;
  app.quitArmed = true; // the render loop holds the session still until it is answered
  $('pad-quit').textContent = run && !app.session.game ? 'KEEP RUNNING' : 'KEEP PLAYING';
  quitTimer = setTimeout(disarmQuit, QUIT_CONFIRM_MS);
}

function padQuit(e) {
  if (!app.session) return;
  if (e.detail === 0) return quitSession(); // Enter or Space on the focused button: a key press
  if (quitTimer) return disarmQuit(); // KEEP PLAYING
  if (app.session instanceof RunView && app.session.run?.phase === 'done') return quitSession(); // the summary card just closes
  armQuit();
}

function confirmQuit() {
  disarmQuit();
  if (app.session) sendInput((s) => (s.abortNow ? s.abortNow() : s.forfeit()));
}

function bumpProgress(run) {
  if (run?.daily) return run.result && recordDaily(run); // nothing at stake: it counts only toward its own record
  const progress = app.progress;
  if (run?.result) progress.runs = { ...progress.runs, [run.result]: (progress.runs?.[run.result] ?? 0) + 1 };
  if (run?.result === 'jacked') {
    if ((run.tally?.iceLost ?? 0) === 0) progress.cleanJackouts = (progress.cleanJackouts ?? 0) + 1;
    const at = run.map.nodes.find((n) => n.id === run.pos);
    if (run.region === 'deep' && at?.type === 'exit') progress.deepExits = (progress.deepExits ?? 0) + 1;
    if (run.region === 'source' && at?.type === 'exit') progress.sourceExits = (progress.sourceExits ?? 0) + 1;
    if (run.contract?.settled === 'met') progress.contractsDone = (progress.contractsDone ?? 0) + 1;
    if (run.challengeWon && !(progress.challenges ?? []).includes(run.challenge)) progress.challenges = [...(progress.challenges ?? []), run.challenge];
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
      if (run?.result === 'disconnected' && !run.daily) grantStyle('bandage', 'earned: bandage. you made it back.');
      bumpProgress(run);
      checkUnlocks();
      maybeShowEnding();
      resetPadQuit();
      showPanel('controls');
      save();
      updateHUD();
    },
  });
  resetPadQuit();
  showPanel('pad');
}

function jackIn(region) {
  tick(app.state, now());
  const blocked = runBlockReason(app.state, region, app.codex);
  if (blocked) {
    sfx('error', app.state.quirk.pitch);
    playAnim('refuse');
    return flashStatus(blocked);
  }
  const daily = REGIONS[region].daily;
  if (daily && playedToday()) return flashStatus("today's trace is done. a new one at midnight.");
  const day = todayKey();
  if (daily) markDailyStart(day); // the day's one attempt is used the moment it starts
  startRun(app.state, region, Math.random, app.codex, app.ownedAccessories, { challenge: CHALLENGE_REGIONS.includes(region) ? pickedChallenge : null, day });
  sfx('boot', app.state.quirk.pitch * REGIONS[region].sound.mult, REGIONS[region].sound.wave);
  save();
  openRun();
}

// The challenge picked in the region list (challenges.js): null, or an id. It applies to the Deep and the Source only.
let pickedChallenge = null;

function renderChallenge() {
  const btn = $('region-challenge');
  btn.hidden = !challengesOpen(app.progress);
  if (btn.hidden) return (pickedChallenge = null);
  const c = challengeById(pickedChallenge);
  const done = (id) => (app.progress.challenges ?? []).includes(id);
  btn.classList.toggle('on', Boolean(c));
  btn.textContent = c
    ? `CHALLENGE: ${c.name.toUpperCase()}${done(c.id) ? ' (DONE)' : ''}. ${c.rule} DEEP AND SOURCE ONLY. TAP TO CHANGE.`
    : `CHALLENGE: NONE. ${CHALLENGES.filter((x) => done(x.id)).length}/${CHALLENGES.length} DONE. TAP TO PICK ONE.`;
}

// The daily trace (netrun/daily.js): open to any netling once the first run is done, once a day, outside the cooldown.
const dailyOpen = () => app.onboarding === 'done' && !playedToday() && !runBlockReason(app.state, 'daily', app.codex);

function renderDaily() {
  const b = $('region-daily');
  b.hidden = app.onboarding !== 'done';
  if (b.hidden) return;
  const r = REGIONS.daily;
  const key = todayKey();
  const d = app.progress.daily;
  const done = d?.day === key;
  const wins = app.progress.dailyWins ?? 0;
  const name = document.createElement('span');
  name.className = 'rname';
  name.textContent = `${r.name.toUpperCase()} #${dayNumber(key)}`;
  name.style.color = r.palette.main;
  const frag = document.createElement('span');
  frag.className = 'rfrag';
  frag.textContent = wins >= DAILY.winsForReward ? `exits ${wins}` : `exits ${wins}/${DAILY.winsForReward}`;
  const meta = document.createElement('span');
  meta.className = 'rmeta';
  meta.textContent = done ? (d.share ? `done today: ${d.exit ? 'reached the exit' : 'no exit'}. tap to share.` : 'done today. a new one at midnight.') : r.blurb;
  b.style.borderLeftColor = r.palette.main;
  b.classList.toggle('done', done);
  b.replaceChildren(name, frag, meta);
}

function renderRegions() {
  renderDaily();
  renderChallenge();
  const room = codexRoom(app.state);
  $('region-memory').textContent = `CODEX MEMORY ${RUN_CFG.codexPerLife - room}/${RUN_CFG.codexPerLife} THIS LIFE${room ? '' : ' · FULL'}`;
  $('region-memory').classList.toggle('full', !room);
  $('region-memory').hidden = allFragmentsFound(app.codex); // nothing left to find
  const c = app.state.contract;
  $('region-contract').hidden = !c;
  if (c) $('region-contract').textContent = `CONTRACT: ${contractText(c).toUpperCase()}. PAYS ${contractPay(c).toUpperCase()}. ${fmtLeft(contractMinutesLeft(app.state)).toUpperCase()} LEFT`;
  $('region-list').replaceChildren(
    ...shownRegions(CFG.mainframe).map((id) => {
      const r = REGIONS[id];
      const lock = regionLock(id, app.state.stage, app.codex, app.state.cleared);
      const secret = lock && r.requires;
      const regionFrags = liveFragments().filter((f) => f.region === id);
      const found = regionFrags.filter((f) => app.codex.includes(f.id)).length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'region';
      b.disabled = Boolean(lock);
      b.style.borderLeftColor = r.palette.main;
      const name = document.createElement('span');
      name.className = 'rname';
      name.textContent = secret ? r.lockedName ?? '???' : r.name.toUpperCase();
      if (secret && r.lockedName) name.classList.add('corrupt');
      // The first time a corrupted sector opens, its entry repairs itself once, with a log line.
      if (!lock && r.lockedName && !app.progress.sourceSeen) {
        app.progress.sourceSeen = true;
        store.set(KEYS.progress, app.progress);
        log(app.state, now(), '> sector integrity: restored. something down there noticed.');
        name.textContent = r.lockedName;
        name.classList.add('corrupt');
        setTimeout(() => {
          name.textContent = r.name.toUpperCase();
          name.classList.remove('corrupt');
        }, 1600);
      }
      name.style.color = lock ? '' : r.palette.main;
      const frag = document.createElement('span');
      frag.className = 'rfrag';
      frag.textContent = secret ? '' : `codex ${found}/${regionFrags.length}`;
      const meta = document.createElement('span');
      meta.className = 'rmeta';
      meta.textContent = (secret && r.lockedBlurb) || (lock ?? (c?.region === id ? `contract: ${contractText(c)}.` : r.blurb));
      if (!lock && pickedChallenge && CHALLENGE_REGIONS.includes(id)) meta.textContent = `challenge: ${challengeById(pickedChallenge).name.toLowerCase()}. ${meta.textContent}`;
      if (c?.region === id && !lock) meta.classList.add('contract');
      b.append(name, frag, meta);
      b.addEventListener('click', () => jackIn(id));
      return b;
    }),
  );
}

function startGame(id) {
  app.session = new GameSession(id, {
    sound: (name) => sfx(name, app.state.quirk.pitch),
    speed: gameSpeed(app.state),
    onFinish: (won) => {
      app.session = null;
      showPanel('controls');
      tick(app.state, now());
      // It can refuse the result: it fell asleep, ran out of charge or flatlined mid-game.
      const res = act(app.state, 'play', now(), Math.random, { game: id, won });
      if (res.ok) {
        app.progress.streaks = recordGame(app.progress.streaks, id, won); // streak unlocks: PLAY games only
        countGame();
        countAttention(res);
      }
      playAnim(res.ok ? 'play' : 'refuse');
      if (!res.ok) {
        sfx('error', app.state.quirk.pitch);
        flashStatus(res.msg);
      }
      else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
      save();
      updateHUD();
    },
  });
  showPanel('pad');
  updateHUD(); // hides the request bar and the chatter bubble while the game runs
}

// DEFEND: an intrusion is fought off with a random mini-game, like netrun ICE. It counts toward
// game unlocks but not win streaks or the netling's own game record.
function startDefense() {
  unlockAudio();
  if (app.session) return;
  tick(app.state, now());
  const blocked = blockReason(app.state, 'defend');
  if (blocked) {
    sfx('error', app.state.quirk.pitch);
    playAnim('refuse');
    return flashStatus(blocked);
  }
  const game = GAME_IDS[Math.floor(Math.random() * GAME_IDS.length)];
  app.state.event.defending = true; // the intrusion's timer holds while the defense runs
  app.session = new GameSession(game, {
    sound: (name) => sfx(name, app.state.quirk.pitch),
    speed: gameSpeed(app.state),
    onFinish: (won) => {
      app.session = null;
      if (app.state.event) delete app.state.event.defending;
      countGame();
      showPanel('controls');
      tick(app.state, now());
      const res = act(app.state, 'defend', now(), Math.random, { won });
      playAnim(res.ok && won ? 'patch' : 'refuse');
      flashStatus(res.msg, 3000);
      save();
      updateHUD();
    },
  });
  showPanel('pad');
}

// PLAY straight into the game it asked for (the request bar's button).
export function playRequested(game) {
  unlockAudio();
  tick(app.state, now());
  const blocked = blockReason(app.state, 'play');
  if (blocked) {
    sfx('error', app.state.quirk.pitch);
    playAnim('refuse');
    return flashStatus(blocked);
  }
  sfx('select', app.state.quirk.pitch);
  startGame(game);
}

const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ' ': 'a', Enter: 'a', z: 'a', x: 'a' };

export function initPlay() {
  $('btn-play').addEventListener('click', () => {
    unlockAudio();
    tick(app.state, now());
    const blocked = blockReason(app.state, 'play');
    if (blocked) {
      sfx('error', app.state.quirk.pitch);
      playAnim('refuse');
      return flashStatus(blocked);
    }
    sfx('select', app.state.quirk.pitch);
    showPanel('picker');
  });
  $('picker-back').addEventListener('click', () => showPanel('controls'));
  document.querySelectorAll('[data-game]').forEach((btn) => btn.addEventListener('click', () => startGame(btn.dataset.game)));

  $('wish-run').addEventListener('click', () => $('btn-netrun').click());
  $('btn-netrun').addEventListener('click', () => {
    unlockAudio();
    tick(app.state, now());
    if (app.state.run) return openRun(); // resume
    if (app.onboarding === 'nudge') return startTutorial();
    // The daily trace stays open while the uplink cools down, so the list opens for it (or for today's line to share).
    const blocked = runBlockReason(app.state, 'public', app.codex);
    if (blocked && !dailyOpen() && !(isAlive(app.state) && playedToday() && app.progress.daily?.share)) {
      sfx('error', app.state.quirk.pitch);
      playAnim('refuse');
      return flashStatus(blocked);
    }
    sfx('select', app.state.quirk.pitch);
    renderRegions();
    showPanel('regions');
  });
  $('regions-back').addEventListener('click', () => showPanel('controls'));
  $('region-daily').addEventListener('click', () => {
    if (playedToday()) {
      if (app.progress.daily?.share) return showDaily();
      return flashStatus("today's trace is done. a new one at midnight.");
    }
    jackIn('daily');
  });
  $('region-challenge').addEventListener('click', () => {
    const ids = [null, ...CHALLENGES.map((c) => c.id)];
    pickedChallenge = ids[(ids.indexOf(pickedChallenge) + 1) % ids.length];
    sfx('select', app.state.quirk.pitch);
    renderRegions();
  });
  $('event-defend').addEventListener('click', startDefense);

  document.querySelectorAll('[data-key]').forEach((btn) =>
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      sendKey(btn.dataset.key);
    }),
  );
  $('pad-quit').addEventListener('click', padQuit);
  $('pad-confirm').addEventListener('click', confirmQuit);

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
