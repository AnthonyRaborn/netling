// The netling's life: the clock tick, evolution, flatline and the next generation, and the care buttons.
import { act, createScript, tick, CFG, FORMS, ITEMS, SPECIES, TRAITS } from '../sim.js';
import { deathRecord } from '../archive.js';
import { sfx, unlockAudio } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, codexComplete, flashStatus, now, save, store } from './app.js';
import { fmtAge, pushAlert, updateHUD } from './hud.js';
import { recordForm } from './archive.js';
import { checkUnlocks, countAct, grantStyle, plushExtra } from './style.js';

export function advance() {
  if (app.lock || app.inactive) return; // on another device, or in another tab
  const state = app.state;
  tick(state, now());
  if (state.stage !== app.lastStage) {
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
  }
  save();
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

export function initLife() {
  $('fl-next').addEventListener('click', () => {
    const prev = app.state;
    app.state = createScript({ now: now(), generation: prev.generation + 1, fragment: prev.fragment, rootAccess: codexComplete() });
    app.lastStage = app.state.stage;
    app.lastLogLen = 0;
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
      if (!res.ok) flashStatus(res.msg);
      else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
      save();
      updateHUD();
    });
  });
}
