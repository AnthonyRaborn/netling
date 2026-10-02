// The netling's life: the clock tick, evolution, flatline and the next generation, and the care buttons.
import { act, createScript, isAlive, tick, CFG, FORMS, ITEMS, SPECIES, TRAITS, traitLabel, lineOf } from '../sim.js';
import { deathRecord } from '../archive.js';
import { SURGE_MS } from '../render.js';
import { sfx, unlockAudio } from '../audio.js';
import { duckMusic } from '../music.js';
import { KEYS } from '../storage.js';
import { $, app, newForms, rootUnlocked, flashStatus, now, playAnim, save, store } from './app.js';
import { fmtAge, pushAlert, requestText, updateHUD } from './hud.js';
import { recordForm } from './archive.js';
import { closeStaleSession, playRequested } from './play.js';
import { contractPay, contractText, updateContract } from '../netrun/run.js';
import { checkIn } from './rewards.js';
import { bankFlow, checkUnlocks, countAct, countAttention, drainAccessoryInbox, grantStyle, plushExtra } from './style.js';

// The clock tick runs every second, but the netling only needs writing now and then: actions save
// themselves, and a hidden or closing page flushes (see flushSave).
const SAVE_EVERY_MS = 5000;
let lastClockSave = -Infinity;

function saveClock() {
  lastClockSave = performance.now();
  save();
}

// For when the page is hidden or about to close: write what the clock has done since the last save.
export function flushSave() {
  if (app.lock || app.inactive) return;
  saveClock();
}

export function advance() {
  if (app.lock || app.inactive) return; // on another device, or in another tab
  const state = app.state;
  tick(state, now());
  closeStaleSession();
  const stageChanged = state.stage !== app.lastStage;
  if (stageChanged) {
    if (state.stage === 'baby') sfx('boot', state.quirk.pitch);
    if (state.stage === 'teen' || state.stage === 'adult' || state.stage === 'mainframe') {
      app.flashUntil = performance.now() + 2400;
      sfx('evolve', state.quirk.pitch);
      duckMusic(2.4); // under the evolve jingle
      pushAlert('Netling is evolving', `It recompiled into ${SPECIES[state.form].name.toUpperCase()}.`);
    }
    if (state.stage === 'dead') onFlatline();
    recordForm();
    checkUnlocks();
    app.lastStage = state.stage;
  }
  if (state.rootUsed) grantStyle('bandage', 'earned: bandage. it came back once.');
  if (state.lastSurgeAt !== app.lastSurgeAt) {
    app.lastSurgeAt = state.lastSurgeAt;
    app.surgeUntil = performance.now() + SURGE_MS;
    if (now() - state.lastSurgeAt < 2 * 60_000) sfx('surge', state.quirk.pitch); // not for one caught up on load
  }
  // A visitor pinging in gets a greeting; one leaving may have left an accessory behind.
  const visiting = Boolean(state.visit);
  if (visiting && !app.lastVisit) {
    sfx('visit', state.quirk.pitch);
    if (isAlive(state)) pushAlert(state.visit.friend ? "A friend's netling pinged in" : 'A visitor pinged in', 'Say hello before it logs off.');
  }
  app.lastVisit = visiting;
  // A new request: a soft chirp (never the alert sound), or a notification when the page is hidden.
  const asking = state.request ? `${state.request.kind}:${state.request.game ?? ''}:${state.request.startedAge}` : null;
  if (asking && asking !== app.lastRequest && app.lastRequest !== undefined) {
    sfx('ask', state.quirk.pitch);
    pushAlert('Netling wants something', requestText(state.request));
  }
  app.lastRequest = asking;
  // Contracts are only posted while the app is open (and after the tutorial): an attention reward, never a chore.
  if (app.onboarding === 'done' && updateContract(state, Math.random, app.codex, now()) === 'posted') {
    sfx('ask', state.quirk.pitch);
    pushAlert('A contract came in', `${contractText(state.contract)}. pays ${contractPay(state.contract)}.`);
  }
  if (state.visitAccGifts > 0) drainAccessoryInbox();
  checkIn();
  if (stageChanged || performance.now() - lastClockSave >= SAVE_EVERY_MS) saveClock();
  updateHUD();
}

function onFlatline() {
  const state = app.state;
  sfx('flatline', state.quirk.pitch);
  pushAlert('FLATLINE', `netling.v${state.generation}.0 is gone: ${state.deathCause}.`);
  app.lineage.push(deathRecord(state));
  bankFlow(state);
  store.set(KEYS.lineage, app.lineage);
  showFlatline();
  grantStyle('plush', 'a keepsake: a plush of your last netling.');
  app.plushCache = plushExtra();
  checkUnlocks();
}

export function showFlatline() {
  const state = app.state;
  const f = state.fragment;
  $('fl-title').textContent = `netling.v${state.generation}.0`;
  $('fl-cause').textContent = state.deathCause;
  $('fl-age').textContent = fmtAge(state.ageMin);
  $('fl-faults').textContent = `${state.careMistakes}/${CFG.maxMistakes}`;
  // What the next generation gets: this trait (levelled up by a streak of one form), and this netling's own trait as its history.
  const history = f.history && f.history !== f.trait ? ` · history: ${TRAITS[f.history].name}` : f.history ? ' · and its history' : '';
  $('fl-trait').textContent = `${traitLabel(f.trait, f.level)} — ${TRAITS[f.trait].desc}${history}${f.keepsake ? ` · keepsake: ${ITEMS[f.keepsake].name}` : ''}`;
  $('fl-echo').textContent = `${FORMS[f.form].name} signature${FORMS[lineOf(state.form)] ? '' : ' (unrealized)'}`;
  $('fl-next').textContent = `COMPILE v${state.generation + 1}.0`;
  $('flatline').hidden = false;
}

// What plays on the LCD when a care action works (a refusal always shakes its head).
const ACT_ANIMS = { corp: 'eat', scav: 'eat', patch: 'patch', purge: 'purge', cool: 'cool' };

export function initLife() {
  $('fl-next').addEventListener('click', () => {
    const prev = app.state;
    // Friends invited during the last life still come: the card was for the device, not one netling.
    app.state = createScript({ now: now(), generation: prev.generation + 1, fragment: prev.fragment, rootAccess: rootUnlocked(), newForms: newForms(), friends: prev.friends ?? [] });
    app.lastStage = app.state.stage;
    app.lastLogKey = '';
    $('flatline').hidden = true;
    sfx('boot', app.state.quirk.pitch);
    save();
    updateHUD();
  });

  document.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', () => performAct(btn.dataset.act)));
  // The request bar: straight to what it asked for, or a hello for the visitor.
  $('wish-play').addEventListener('click', () => app.state.request?.game && playRequested(app.state.request.game));
  $('wish-cool').addEventListener('click', () => performAct('cool'));
  $('wish-greet').addEventListener('click', () => performAct('greet'));
}

// A care action from a button: the rule, its sound and animation, and what it counts toward.
export function performAct(action) {
  unlockAudio();
  const state = app.state;
  tick(state, now());
  const res = act(state, action, now());
  sfx(res.sfx, state.quirk.pitch);
  if (res.ok) {
    countAct(action);
    countAttention(res);
  }
  if (!res.ok) playAnim('refuse');
  else if (res.requestMet) playAnim('play');
  else if (ACT_ANIMS[action]) playAnim(ACT_ANIMS[action]);
  if (!res.ok) flashStatus(res.msg);
  else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
  save();
  updateHUD();
}

