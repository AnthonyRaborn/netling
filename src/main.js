import {
  act,
  blockReason,
  createScript,
  tick,
  migrate,
  isAlive,
  traceMinutesLeft,
  alertReason,
  bedtimeHour,
  CFG,
  TRAITS,
  FORMS,
  SPECIES,
  FORM_MODS,
  PALETTES,
  SAVE_VERSION,
  MIN,
} from './sim.js';
import { renderLCD } from './render.js';
import { GameSession } from './games/session.js';
import { sfx, unlockAudio, setMuted } from './audio.js';
import { notify, notifyGranted, notifySupported, requestNotify, registerServiceWorker } from './notify.js';

const SAVE_KEY = 'netling.save';
const LINEAGE_KEY = 'netling.lineage';
const SKEW_KEY = 'netling.devSkew';
const PREFS_KEY = 'netling.prefs';
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
let session = null;
let lastSurgeAt = state.lastSurgeAt;
let surgeUntil = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const prefs = { sound: true, alerts: false, ...store.get(PREFS_KEY) };
setMuted(!prefs.sound);

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
      pushAlert('Netling is evolving', `It recompiled into ${SPECIES[state.form].name.toUpperCase()}.`);
    }
    if (state.stage === 'dead') onFlatline();
    lastStage = state.stage;
  }
  if (state.lastSurgeAt !== lastSurgeAt) {
    lastSurgeAt = state.lastSurgeAt;
    surgeUntil = performance.now() + 900;
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
    `v${state.generation}.0 ${species} · age ${fmtAge(state.ageMin)} · bed ${String(bedtimeHour(state)).padStart(2, '0')}:00 · faults ${state.careMistakes}/${CFG.maxMistakes} · trait ${trait}`;
  const perk = FORM_MODS[state.form];
  $('readout').title = perk ? `${SPECIES[state.form].name}: ${perk.desc}` : '';
  $('btn-lights').textContent = state.lightsOn ? 'LIGHTS OFF' : 'LIGHTS ON';
  const traceLeft = traceMinutesLeft(state);
  $('event-bar').hidden = !(traceLeft > 0 && isAlive(state));
  $('event-timer').textContent = `${traceLeft}m`;
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

  // Chirp (or notify, when backgrounded) each time a new need appears.
  const reason = alertReason(state);
  if (reason && reason.key !== lastAttention) {
    if (document.hidden) pushAlert('Netling needs you', reason.msg);
    else sfx('alert', state.quirk.pitch);
  }
  lastAttention = reason?.key ?? false;
}

function pushAlert(title, body) {
  if (prefs.alerts && document.hidden) notify(title, body);
}

function onFlatline() {
  sfx('flatline', state.quirk.pitch);
  pushAlert('FLATLINE', `netling.v${state.generation}.0 is gone: ${state.deathCause}.`);
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

// --- mini-games ---------------------------------------------------------------

function showPanel(name) {
  $('controls').hidden = name !== 'controls';
  $('picker').hidden = name !== 'picker';
  $('pad').hidden = name !== 'pad';
}

$('btn-play').addEventListener('click', () => {
  unlockAudio();
  tick(state, now());
  const blocked = blockReason(state, 'play');
  if (blocked) {
    sfx('error', state.quirk.pitch);
    return flashStatus(blocked);
  }
  sfx('select', state.quirk.pitch);
  showPanel('picker');
});

$('picker-back').addEventListener('click', () => showPanel('controls'));

document.querySelectorAll('[data-game]').forEach((btn) =>
  btn.addEventListener('click', () => startGame(btn.dataset.game)),
);

function startGame(id) {
  session = new GameSession(id, {
    sound: (name) => sfx(name, state.quirk.pitch),
    onFinish: (won) => {
      session = null;
      showPanel('controls');
      tick(state, now());
      const res = act(state, 'play', now(), Math.random, { game: id, won });
      if (!res.ok) flashStatus(res.msg);
      save();
      updateHUD();
    },
  });
  showPanel('pad');
}

document.querySelectorAll('[data-key]').forEach((btn) =>
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    session?.input(btn.dataset.key);
  }),
);
$('pad-quit').addEventListener('click', () => session?.forfeit());

const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ' ': 'a', Enter: 'a', z: 'a', x: 'a' };
document.addEventListener('keydown', (e) => {
  if (!session) return;
  if (e.key === 'Escape') return session.forfeit();
  const key = KEYMAP[e.key];
  if (!key || e.repeat) return;
  e.preventDefault();
  session.input(key);
});

// --- settings -------------------------------------------------------------------

function renderPrefs() {
  $('pref-sound').textContent = prefs.sound ? 'SND ON' : 'SND OFF';
  $('pref-sound').setAttribute('aria-pressed', prefs.sound);
  $('pref-alerts').textContent = prefs.alerts && notifyGranted() ? 'ALERTS ON' : 'ALERTS OFF';
  $('pref-alerts').setAttribute('aria-pressed', prefs.alerts && notifyGranted());
  $('pref-alerts').hidden = !notifySupported();
}

$('pref-sound').addEventListener('click', () => {
  prefs.sound = !prefs.sound;
  setMuted(!prefs.sound);
  store.set(PREFS_KEY, prefs);
  unlockAudio();
  sfx('select', state.quirk.pitch);
  renderPrefs();
});

$('pref-alerts').addEventListener('click', async () => {
  if (prefs.alerts && notifyGranted()) {
    prefs.alerts = false;
  } else {
    prefs.alerts = await requestNotify();
    if (!prefs.alerts) flashStatus('notifications blocked by the browser.');
  }
  store.set(PREFS_KEY, prefs);
  renderPrefs();
});

renderPrefs();
registerServiceWorker();

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
  $('dev-trace').addEventListener('click', () => {
    if (!isAlive(state)) return;
    state.event = { type: 'trace', startedAge: state.ageMin };
    save();
    updateHUD();
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

let lastFrame = performance.now();
(function loop(time) {
  const dt = Math.min(0.1, (time - lastFrame) / 1000);
  lastFrame = time;
  if (session) {
    session.update(dt);
    session?.draw(canvas.getContext('2d'), PALETTES[state.quirk.palette] ?? PALETTES[0], time);
  } else {
    renderLCD(canvas, state, time, {
      flash: time < flashUntil,
      surge: time < surgeUntil,
      calm: reducedMotion.matches,
    });
  }
  requestAnimationFrame(loop);
})(performance.now());
