// The netling's life: the clock tick, evolution, flatline and the next generation, and the care buttons.
import { act, createScript, tick, CFG, FORMS, ITEMS, SPECIES, TRAITS } from '../sim.js';
import { deathRecord } from '../archive.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, codexComplete, flashStatus, now, playAnim, save, store } from './app.js';
import { fmtAge, pushAlert, updateHUD } from './hud.js';
import { recordForm } from './archive.js';
import { closeStaleSession } from './play.js';
import { checkUnlocks, countAct, drainAccessoryInbox, grantStyle, plushExtra } from './style.js';

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
    if (state.stage === 'teen' || state.stage === 'adult') {
      app.flashUntil = performance.now() + 2400;
      sfx('evolve', state.quirk.pitch);
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
    app.surgeUntil = performance.now() + 900;
    if (now() - state.lastSurgeAt < 2 * 60_000) sfx('surge', state.quirk.pitch); // not for one caught up on load
  }
  // A visitor pinging in gets a greeting; one leaving may have left an accessory behind.
  const visiting = Boolean(state.visit);
  if (visiting && !app.lastVisit) sfx('visit', state.quirk.pitch);
  app.lastVisit = visiting;
  if (state.visitAccGifts > 0) drainAccessoryInbox();
  if (stageChanged || performance.now() - lastClockSave >= SAVE_EVERY_MS) saveClock();
  updateHUD();
}

function onFlatline() {
  const state = app.state;
  sfx('flatline', state.quirk.pitch);
  pushAlert('FLATLINE', `netling.v${state.generation}.0 is gone: ${state.deathCause}.`);
  app.lineage.push(deathRecord(state));
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
  $('fl-trait').textContent = `${TRAITS[f.trait].name} — ${TRAITS[f.trait].desc}${f.keepsake ? ` · keepsake: ${ITEMS[f.keepsake].name}` : ''}`;
  $('fl-echo').textContent = `${FORMS[f.form].name} signature${FORMS[state.form] ? '' : ' (unrealized)'}`;
  $('fl-next').textContent = `COMPILE v${state.generation + 1}.0`;
  $('flatline').hidden = false;
}

// What plays on the LCD when a care action works (a refusal always shakes its head).
const ACT_ANIMS = { corp: 'eat', scav: 'eat', patch: 'patch', purge: 'purge', cool: 'cool' };

export function initLife() {
  $('fl-next').addEventListener('click', () => {
    const prev = app.state;
    app.state = createScript({ now: now(), generation: prev.generation + 1, fragment: prev.fragment, rootAccess: codexComplete() });
    app.lastStage = app.state.stage;
    app.lastLogKey = '';
    $('flatline').hidden = true;
    sfx('boot', app.state.quirk.pitch);
    save();
    updateHUD();
  });

  document.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      unlockAudio();
      const state = app.state;
      tick(state, now());
      const res = act(state, btn.dataset.act, now());
      sfx(res.sfx, state.quirk.pitch);
      if (res.ok) countAct(btn.dataset.act);
      if (!res.ok) playAnim('refuse');
      else if (ACT_ANIMS[btn.dataset.act]) playAnim(ACT_ANIMS[btn.dataset.act]);
      if (!res.ok) flashStatus(res.msg);
      else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
      save();
      updateHUD();
    });
  });
}
