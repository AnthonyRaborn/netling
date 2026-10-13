// The focus review page's pure half (review.html; docs/NETLING_2_SPRITES.md, Commands): one registry of every 2.0 form across the four
// eggs, the page's state as a URL hash (so a link reopens the exact view: forms, aspect, settings and the frozen time), the presets
// that pick a set of forms, and the change track that finds when the composed picture changes. No DOM; review.test.js drives it.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';
import { composeLCD } from './render.js';
import { placeWorn, ACCESSORIES } from '../../src/accessories.js';

export const EGG_LIST = ['iron', 'program', 'wetware', 'rogue'];
export const STAGES = ['baby', 'teen', 'adult', 'elder'];
export const VIEWS = ['frames', 'motion', 'damage', 'wear'];
export const DAMAGE = ['neglect', 'bugs', 'seams', 'marks'];

let registry = null;
// -> Map id -> { form, egg }, in each egg's authoring order (baby, teens, adults, elders).
export function allForms() {
  if (registry) return registry;
  registry = new Map();
  const sets = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
  for (const egg of EGG_LIST) for (const f of Object.values(sets[egg])) registry.set(f.id, { form: f, egg });
  return registry;
}

export const stageOf = (form) => form.id.match(/(Baby|Teen|Adult|Elder)/)[1].toLowerCase();

// The settings and their defaults. Numbers are parsed as numbers; lists are comma separated. Only values that differ from the default go
// into the hash, so links stay short.
export const DEFAULTS = {
  ids: [],
  view: 'frames',
  palette: 0,
  scale: 0, // 0 = pick by view
  seed: 1,
  level: 0,
  idle: 'none',
  idleHold: 'held',
  actions: 1,
  reduced: 0,
  visit: 0,
  pose: 'awake',
  dark: 0,
  anchors: 0,
  grid: 1,
  diff: 1,
  neglect: 0,
  bugs: 0,
  seams: 0,
  marks: '',
  prop: '',
  wear: [],
  damage: 'neglect',
  wearAll: 0,
  t: 0,
  speed: 1,
  play: 1,
  strip: 0, // motion: show a filmstrip of this many frames instead of live screens
  stripMs: 250,
  span: 12000, // motion: the change track's window
};
const LISTS = new Set(['ids', 'wear']);

export function parseState(hash) {
  const out = structuredClone(DEFAULTS);
  const params = new URLSearchParams(String(hash ?? '').replace(/^#/, ''));
  for (const [k, raw] of params) {
    if (!(k in DEFAULTS)) continue;
    if (LISTS.has(k)) out[k] = raw ? raw.split(',').filter(Boolean) : [];
    else if (typeof DEFAULTS[k] === 'number') {
      const n = Number(raw);
      if (Number.isFinite(n)) out[k] = n;
    } else out[k] = raw;
  }
  if (!VIEWS.includes(out.view)) out.view = DEFAULTS.view;
  if (!DAMAGE.includes(out.damage)) out.damage = DEFAULTS.damage;
  const known = allForms();
  out.ids = out.ids.filter((id) => known.has(id));
  out.wear = out.wear.filter((id) => ACCESSORIES.some((a) => a.id === id && a.slot !== 'prop'));
  return out;
}

export function stateHash(state) {
  const params = new URLSearchParams();
  for (const k of Object.keys(DEFAULTS)) {
    const v = state[k];
    if (LISTS.has(k)) {
      if (v?.length) params.set(k, v.join(','));
    } else if (v !== undefined && v !== DEFAULTS[k]) params.set(k, String(v));
  }
  return `#${params.toString().replaceAll('%2C', ',')}`;
}

// Presets: each returns a list of ids.
export function preset(name, { egg = 'iron', stage = 'adult', id = null } = {}) {
  const all = [...allForms().values()];
  const of = (e) => all.filter((x) => x.egg === e).map((x) => x.form.id);
  if (name === 'egg') return of(egg);
  if (name === 'stage') return all.filter((x) => x.egg === egg && stageOf(x.form) === stage).map((x) => x.form.id);
  if (name === 'across') return EGG_LIST.flatMap((e) => all.filter((x) => x.egg === e && stageOf(x.form) === stage).map((x) => x.form.id));
  if (name === 'line') {
    // A form's line, as far as the ids say: a baby and its teens; a teen and the baby before it; an adult or an elder with the baby,
    // the teen of its lean (Rogue has one teen), the adult and the elder.
    if (!allForms().has(id)) return [];
    const [, e, st, rest] = id.match(/^(\w+?)(Baby|Teen|Adult|Elder)(\w*)$/);
    const has = (x) => allForms().has(x);
    if (st === 'Baby') return [id, ...of(e).filter((x) => x.startsWith(`${e}Teen`))];
    if (st === 'Teen') return [`${e}Baby`, id].filter(has);
    const lean = rest.match(/(Corp|Street|Hidden)$/)?.[1];
    const teen = e === 'rogue' ? 'rogueTeen' : `${e}Teen${lean ?? 'Corp'}`;
    return [`${e}Baby`, teen, `${e}Adult${rest}`, `${e}Elder${rest}`].filter(has);
  }
  if (name === 'pair') {
    // An adult and its elder (or an elder and its adult).
    const m = id?.match(/^(\w+?)(Adult|Elder)(\w*)$/);
    if (!m) return id ? [id] : [];
    return [`${m[1]}Adult${m[3]}`, `${m[1]}Elder${m[3]}`].filter((x) => allForms().has(x));
  }
  return [];
}

// The change track: the times in [from, to) at which the composed screen changes, sampled every `step` ms (the layers change on 100 ms
// boundaries at the finest: 1.0's 500 ms frames, 400 ms motion and mark steps, Iron's 1333 ms drift, the 200 ms floor). Each entry also
// says what changed: the frame rows, the position, the wearables, the marks or the shade.
export function changeTrack(pet, opts, { from = 0, to = 12000, step = 50 } = {}) {
  const out = [];
  let prev = null;
  for (let t = from; t < to; t += step) {
    const sig = signature(composeLCD(pet, t, opts));
    if (prev) {
      const what = Object.keys(sig).filter((k) => sig[k] !== prev[k]);
      if (what.length) out.push({ t, what });
    }
    prev = sig;
  }
  return out;
}

function signature({ ops, box }) {
  const sprite = ops.find((o) => o.op === 'rows');
  const marks = ops.filter((o) => o.op === 'rect').map((o) => `${o.x},${o.y},${o.color}`).join(';');
  // Wearables by their placed pixels (relative to the figure, so a move alone is not a wearable change), as paintLCD places them.
  const worn = ops
    .filter((o) => o.op === 'worn')
    .flatMap((o) => placeWorn(o.list, o.sprite, { frame: o.frame, time: o.time, pal: o.pal, minRow: -o.y }).flatMap((it) => it.pts.map((p) => {
      const [px, py] = o.warp ? o.warp(p.x, p.y) : [p.x, p.y];
      return `${px},${py},${o.dim ? 'd' : p.color}`;
    })))
    .join(';');
  const props = ops.filter((o) => o.op === 'prop' || (o.op === 'rows' && o !== sprite)).map((o) => (o.rows ? o.rows.join('/') : `${o.id}${o.frame}`)).join(';');
  return {
    picture: sprite ? sprite.rows.join('/') : '',
    place: box ? `${box.x},${box.y}` : '',
    shade: sprite?.alpha ?? 1,
    worn,
    marks,
    props,
  };
}
