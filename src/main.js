import { act, createScript, tick, migrate, isAlive, CFG, TRAITS, FORMS, SPECIES, FORM_MODS, SAVE_VERSION, MIN } from './sim.js';
import { renderLCD } from './render.js';
import { sfx, unlockAudio } from './audio.js';

const SAVE_KEY = 'netling.save';
const LINEAGE_KEY = 'netling.lineage';
const SKEW_KEY = 'netling.devSkew';
const DEV = new URLSearchParams(location.search).has('dev');

const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

let skew = DEV ? store.get(SKEW_KEY) ?? 0 : 0;
const now = () => Date.now() + skew;

let state = store.get(SAVE_KEY);
if (!state || state.saveVersion !== SAVE_VERSION) state = createScript({ now: now() });
migrate(state);

const $ = (id) => document.getElementById(id);
const canvas = $('lcd');
const logEl = $('log');
const overlay = $('flatline');

let lastLogLen = 0;
let lastStage = state.stage;
let lastAttention = false;
let flashUntil = 0;

function save() {
  store.set(SAVE_KEY, state);
}

function advance() {
  tick(state, now());
  if (state.stage !== lastStage) {
    if (state.stage === 'baby') sfx('boot', state.quirk.pitch);
    if (state.stage === 'teen' || state.stage === 'adult') {
      flashUntil = performance.now() + 2400;
      sfx('evolve', state.quirk.pitch);
    }
    if (state.stage === 'dead') onFlatline();
    lastStage = state.stage;
  }
  save();
  updateHUD();
}

function fmtAge(min) {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

function setBar(id, value, danger) {
  const el = $(id);
  el.style.setProperty('--v', `${value}%`);
  el.classList.toggle('danger', danger);
}

function updateHUD() {
  const st = state.stats;
  setBar('bar-charge', st.charge, st.charge < 20);
  setBar('bar-sync', st.sync, st.sync < 20);
  setBar('bar-integrity', st.integrity, st.integrity < 30);
  setBar('bar-heat', st.heat, st.heat > 80);
  document.querySelectorAll('#cache-pips i').forEach((pip, i) => pip.classList.toggle('on', i < state.cache));

  const trait = state.trait ? TRAITS[state.trait].name : '—';
  const species = state.stage === 'script' ? 'compiling' : SPECIES[state.form].name;
  $('readout').textContent =
    `v${state.generation}.0 ${species} · age ${fmtAge(state.ageMin)} · faults ${state.careMistakes}/${CFG.maxMistakes} · trait ${trait}`;
  const perk = FORM_MODS[state.form];
  $('readout').title = perk ? `${SPECIES[state.form].name}: ${perk.desc}` : '';
  $('btn-lights').textContent = state.lightsOn ? 'LIGHTS OFF' : 'LIGHTS ON';
  document.body.classList.toggle('asleep', state.asleep);

  if (state.log.length !== lastLogLen || logEl.childElementCount === 0) {
    lastLogLen = state.log.length;
    logEl.replaceChildren(
      ...state.log.slice(-8).map((e) => {
        const li = document.createElement('li');
        const t = new Date(e.t);
        li.textContent = `${t.toTimeString().slice(0, 5)} ${e.msg}`;
        if (e.msg.includes('!!') || e.msg.includes('mistake') || e.msg.includes('FLATLINE')) li.className = 'warn';
        return li;
      }),
    );
  }

  const attention = isAlive(state) && document.hidden === false && needsAlert();
  if (attention && !lastAttention) sfx('alert', state.quirk.pitch);
  lastAttention = attention;
}

function needsAlert() {
  const s = state;
  return s.stats.charge < 20 || s.stats.sync < 20 || s.virus || (s.asleep && s.lightsOn);
}

function onFlatline() {
  sfx('flatline', state.quirk.pitch);
  const f = state.fragment;
  const lineage = store.get(LINEAGE_KEY) ?? [];
  lineage.push({
    generation: state.generation,
    ageMin: state.ageMin,
    cause: state.deathCause,
    form: f.form,
    diedAt: state.diedAt,
  });
  store.set(LINEAGE_KEY, lineage);
  showFlatline();
}

function showFlatline() {
  const f = state.fragment;
  $('fl-title').textContent = `netling.v${state.generation}.0`;
  $('fl-cause').textContent = state.deathCause;
  $('fl-age').textContent = fmtAge(state.ageMin);
  $('fl-faults').textContent = `${state.careMistakes}/${CFG.maxMistakes}`;
  $('fl-trait').textContent = `${TRAITS[f.trait].name} — ${TRAITS[f.trait].desc}`;
  $('fl-echo').textContent = `${FORMS[f.form].name} signature${FORMS[state.form] ? '' : ' (unrealized)'}`;
  $('fl-next').textContent = `COMPILE v${state.generation + 1}.0`;
  overlay.hidden = false;
}

$('fl-next').addEventListener('click', () => {
  state = createScript({ now: now(), generation: state.generation + 1, fragment: state.fragment });
  lastStage = state.stage;
  lastLogLen = 0;
  overlay.hidden = true;
  sfx('boot', state.quirk.pitch);
  save();
  updateHUD();
});

document.querySelectorAll('[data-act]').forEach((btn) => {
  btn.addEventListener('click', () => {
    unlockAudio();
    tick(state, now());
    const res = act(state, btn.dataset.act, now());
    sfx(res.sfx, state.quirk.pitch);
    if (!res.ok) flashStatus(res.msg);
    save();
    updateHUD();
  });
});

let statusTimer;
function flashStatus(msg) {
  const el = $('status');
  el.textContent = `> ${msg}`;
  el.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

if (DEV) {
  const dev = $('dev');
  dev.hidden = false;
  dev.querySelectorAll('[data-skip]').forEach((btn) =>
    btn.addEventListener('click', () => {
      skew += Number(btn.dataset.skip) * MIN;
      store.set(SKEW_KEY, skew);
      advance();
    }),
  );
  $('dev-evolve').addEventListener('click', () => {
    const target = state.stage === 'baby' ? CFG.teenAtMin : state.stage === 'teen' ? CFG.adultAtMin : null;
    if (target === null) return;
    const skip = target - state.ageMin;
    skew += skip * MIN;
    store.set(SKEW_KEY, skew);
    // Jump the clock without simulating the gap, so the pet survives the test.
    state.ageMin += skip - 1;
    state.lastTick += (skip - 1) * MIN;
    advance();
  });
  $('dev-reset').addEventListener('click', () => {
    skew = 0;
    store.set(SKEW_KEY, 0);
    state = createScript({ now: now() });
    lastStage = state.stage;
    overlay.hidden = true;
    save();
    updateHUD();
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) advance();
});

advance();
if (state.stage === 'dead') showFlatline();
setInterval(advance, 1000);

(function loop(time) {
  renderLCD(canvas, state, time, { flash: time < flashUntil });
  requestAnimationFrame(loop);
})(performance.now());
