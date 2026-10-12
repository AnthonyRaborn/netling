// Idle actions: what the temper tell's third channel (voice.js idleBehavior: a steady ROUTINE, unsteady STRAYS) looks like on the
// sprite. DRAFT for review, not decided art (maintainer, 2026-10-12: rule-based poses on every form, all four eggs, routine and strays;
// reduced motion holds one still pose; 1.0's idle pauses while an action plays). Not shipped.
//
// Every action is a short loop of KEYFRAMES, each a whole number of 500 ms units (1.0's frame period), built from a few rule-based
// primitives that read only the registered frame and its anchors, so they work on all 76 forms without hand drawing:
//   look [dx, dy]  the eyes ('o' cells on the two eye rows) move a cell, all or none, onto body or dim body cells only
//   squint         the top eye row closes, as on the sleep pose
//   lit            the eyes light up ('o' to '+', the highlight colour)
//   back           it turns its back: the face's eyes and highlights become body; face wearables are hidden
//   head dx        the head (every row above the neck) moves dx columns against the body
//   lift +1 / -1   the body grows a row (the first row under the neck is doubled) or loses one (the neck row goes): the head and
//                  everything above it moves up or down with the wearables on it; the feet stay on the floor
//   move [dx, dy]  the whole figure moves (as the tell's drift and settle)
//   lamp joint     one check light ('+') on the right edge of a joint: neck, arm (the shoulder), hip (the lowest torso row), base (the feet)
//   arm            the right arm comes out and up: two body cells beside the shoulder
//   hold           the frame stops on A and the form's motion layer parks (its reduced-motion picture)
//   marks          single cells outside the figure (a fan blade, a probe, an orbit), in sprite colours, relative to the figure
//
// Timing (flash rule, CLAUDE.md rule 7): a keyframe changes only on the 500 ms grid. Steady steps start on it (STEP_MS is a multiple);
// a stray's start and end are snapped inward to it (actionAt), so every change an action makes lands on a frame change, and a cell
// changes at most twice a second from the action. Reduced motion shows one keyframe (`key`) still for the whole action.
//
// Rules (routine and strays are disjoint in voice.js, so a stray never looks like a step):
//   iron     the routine is a joint-by-joint self check with a check light on each joint: neck (the head turns right, then left),
//            arm (the arm lifts), hip (it bends a row), base (it rises a row on its feet). Strays: port (a light blinks beside it), relay
//            (the head clicks a column and back), fan (a blade turns above the head), lamp (the eyes flash lit).
//   program  scan (a highlight line sweeps down the body), sort (the eyes go left, right), flush (it drops a row and comes back), sync
//            (the eyes look up at a blinking cell above the head). Strays: probe (a line reaches out from the side), fork (a dim copy of
//            a cell drifts off the head), loop (a cell circles the head), spawn (a dim cell or two appear by the feet).
//   wetware  stretch (it grows a row and looks up), rest (it sinks a row with its eyes half shut). Strays: sniff (the head leans and the
//            eyes flick), twist (head one way, body the other), curl (it sinks and settles low), tap (a foot taps beside it).
//   rogue    left and right (the head turns and the eyes hold to that side: longer than the glance and with the head), behind (it
//            turns its back), still (it stops dead: frame and motion layer held). Strays: flinch (it shrinks a row and squints),
//            freeze (held, eyes lit wide), duck (low and looking down), bolt (it darts two columns aside).
//
// actionAt({ egg, level, time, seed, reduced }) -> null or { name, scheduled, elapsed, span, pose } where pose is the keyframe to
// draw; applyAction(rows, form, key, pose, pad) draws it; actionWindows lists the snapped spans for the idle hold (tell.js heldClock).
import { idleBehavior, STEP_MS, ACTIVE_FRACTION } from './voice.js';
import { tellHoldWindows, mergeWindows } from './tell.js';

export const UNIT_MS = 500;
export const ACTION_PAD = 2; // columns added on each side while an action plays (the head and the arm may leave the frame by 2)

const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};

// Keyframes: { u: units, ...primitives }. A function form gets (k, n, form) for actions whose path depends on the step or the body.
// `key` is the keyframe reduced motion holds.
const fan = [[0, -2], [1, -3], [2, -2], [1, -1]]; // a blade going round a point above the head, relative to its centre
export const ACTIONS = {
  iron: {
    neck: { key: 0, frames: [{ u: 2, head: 1, lamp: 'neck' }, { u: 2, head: -1, lamp: 'neck' }] },
    arm: { key: 0, frames: [{ u: 2, arm: true, lamp: 'arm' }, { u: 2, lamp: 'arm' }] },
    hip: { key: 0, frames: [{ u: 2, lift: -1, lamp: 'hip' }, { u: 2, lamp: 'hip' }] },
    base: { key: 0, frames: [{ u: 2, lift: 1, lamp: 'base' }, { u: 2, lamp: 'base' }] },
    port: { key: 0, frames: [{ u: 1, marks: (f) => [[-2, f.anchors.a.neckRow + 1, '+']] }, { u: 1, marks: (f) => [[-2, f.anchors.a.neckRow + 1, '#']] }] },
    relay: { key: 0, frames: [{ u: 1, head: -1 }, { u: 1 }] },
    fan: { key: 0, frames: fan.map((d) => ({ u: 1, marks: (f) => [[Math.floor(f.a[0].length / 2) + d[0] - 1, f.anchors.a.headTop + d[1], '+']] })) },
    lamp: { key: 0, frames: [{ u: 1, lit: true }, { u: 1 }] },
  },
  program: {
    scan: { key: 0, frames: 'scan' },
    sort: { key: 0, frames: [{ u: 1, look: [-1, 0] }, { u: 1, look: [1, 0] }] },
    flush: { key: 0, frames: [{ u: 2, lift: -1 }, { u: 1 }] },
    sync: { key: 0, frames: [{ u: 1, look: [0, -1], marks: (f) => [[Math.floor(f.a[0].length / 2), f.anchors.a.headTop - 2, '+']] }, { u: 1, look: [0, -1] }] },
    probe: { key: 2, frames: [1, 2, 3].map((n) => ({ u: 1, marks: (f) => Array.from({ length: n }, (_, i) => [f.a[0].length + i, f.anchors.a.eyeRow, '+']) })) },
    fork: { key: 1, frames: [0, 1, 2].map((n) => ({ u: 1, marks: (f) => [[f.a[0].length + n, f.anchors.a.headTop + 1 - n, '#'], [f.a[0].length + n, f.anchors.a.headTop + 2 - n, '#']] })) },
    loop: { key: 0, frames: [
      { u: 1, marks: (f) => [[Math.floor(f.a[0].length / 2), f.anchors.a.headTop - 2, '+']] },
      { u: 1, marks: (f) => [[f.a[0].length + 1, f.anchors.a.eyeRow, '+']] },
      { u: 1 }, // behind the head
      { u: 1, marks: (f) => [[-2, f.anchors.a.eyeRow, '+']] },
    ] },
    spawn: { key: 1, frames: [{ u: 1, marks: (f) => [[f.a[0].length + 1, lastRow(f), '#']] }, { u: 1, marks: (f) => [[f.a[0].length + 1, lastRow(f), '#'], [f.a[0].length + 3, lastRow(f), '#']] }] },
  },
  wetware: {
    stretch: { key: 0, frames: [{ u: 4, lift: 1, look: [0, -1] }, { u: 2 }] },
    rest: { key: 0, frames: [{ u: 1, lift: -1, squint: true }] },
    sniff: { key: 0, frames: [{ u: 1, head: 1, look: [1, 0] }, { u: 1, head: 1 }] },
    twist: { key: 0, frames: [{ u: 1, head: 2, move: [-1, 0] }, { u: 1, head: -2, move: [1, 0] }] },
    curl: { key: 0, frames: [{ u: 1, lift: -1, squint: true, move: [0, 1] }] },
    tap: { key: 0, frames: [{ u: 1, marks: (f) => [[rightEdge(f.a[lastRow(f)]) + 1, lastRow(f), '#']] }, { u: 1 }] },
  },
  rogue: {
    left: { key: 0, frames: [{ u: 1, head: -1, look: [-1, 0] }] },
    right: { key: 0, frames: [{ u: 1, head: 1, look: [1, 0] }] },
    behind: { key: 0, frames: [{ u: 1, back: true }] },
    still: { key: 0, frames: [{ u: 1, hold: true }] },
    flinch: { key: 0, frames: [{ u: 1, lift: -1, squint: true }, { u: 1 }] },
    freeze: { key: 0, frames: [{ u: 1, hold: true, lit: true }] },
    duck: { key: 0, frames: [{ u: 1, lift: -1, move: [0, 1], look: [0, 1] }] },
    bolt: { key: 0, frames: [{ u: 1, move: [2, 0] }] },
  },
};
function rightEdge(row) {
  return [...row].findLastIndex((c) => c !== '.');
}

// Program's scan: one row of highlight per unit, from the head top down to the feet, spread over the step so a whole sweep fits it.
function scanFrame(k, n, form) {
  const { headTop } = form.anchors.a;
  const rows = form.a.length - headTop;
  const per = Math.max(1, Math.ceil(rows / n));
  return { scan: Math.min(form.a.length - 1, headTop + ((k * per) % rows)), scanRows: per };
}

function framesOf(egg, name) {
  return ACTIONS[egg]?.[name];
}

// The keyframe at `elapsed` ms into an action `span` ms long.
export function keyframe(egg, name, elapsed, span, form, reduced = false) {
  const a = framesOf(egg, name);
  if (!a) return null;
  const n = Math.max(1, Math.floor(span / UNIT_MS));
  const k = Math.floor(elapsed / UNIT_MS);
  if (a.frames === 'scan') return scanFrame(reduced ? 0 : k, n, form);
  const list = a.frames;
  if (reduced) return list[a.key];
  const total = list.reduce((s, f) => s + f.u, 0);
  let at = k % total;
  for (const f of list) {
    if (at < f.u) return f;
    at -= f.u;
  }
  return list[0];
}

const snapUp = (t) => Math.ceil(t / UNIT_MS) * UNIT_MS;
const snapDown = (t) => Math.floor(t / UNIT_MS) * UNIT_MS;

// voice.js's behaviour with the stray's span snapped inward to the 500 ms grid. -> null or { name, scheduled, start, end }.
function spanAt({ egg, level, time, seed }) {
  const b = idleBehavior({ egg, level, time, seed });
  if (!b) return null;
  if (b.scheduled) {
    const step = STEP_MS[level];
    const start = Math.floor(time / step) * step;
    return { name: b.action, scheduled: true, start, end: start + step * ACTIVE_FRACTION };
  }
  const start = time - b.elapsed;
  const s = snapUp(start);
  const e = snapDown(start + b.shown);
  if (time < s || time >= e) return null;
  return { name: b.action, scheduled: false, start: s, end: e };
}

// -> null or { name, scheduled, elapsed, span, pose, side }.
export function actionAt({ egg, level, time, seed = 0, reduced = false, form }) {
  if (!level || !ACTIONS[egg]) return null;
  const s = spanAt({ egg, level, time, seed });
  if (!s) return null;
  const elapsed = time - s.start;
  const span = s.end - s.start;
  let pose = keyframe(egg, s.name, elapsed, span, form, reduced);
  if (!pose) return null;
  // A stray picks its side once (the bolt, the twist's first way): from where it starts, so it is fixed for the whole stray.
  const side = s.scheduled ? 1 : hash(s.start + seed * 7) < 0.5 ? -1 : 1;
  if (side < 0 && !s.scheduled) pose = mirrorPose(pose, form);
  return { name: s.name, scheduled: s.scheduled, elapsed, span, pose, side };
}

function mirrorPose(pose, form) {
  const w = form.a[0].length;
  const out = { ...pose };
  if (pose.move) out.move = [-pose.move[0], pose.move[1]];
  if (pose.head) out.head = -pose.head;
  if (pose.look) out.look = [-pose.look[0], pose.look[1]];
  if (pose.marks) out.marks = (f) => pose.marks(f).map(([x, y, c]) => [w - 1 - x, y, c]);
  return out;
}

// The spans [start, end) in [from, to), ascending, during which an action plays: the idle hold's windows. Reduced motion holds too
// (the still pose should not slide about under the idle).
export function actionWindows({ egg, level, seed = 0, from, to }) {
  const out = [];
  if (!level || !ACTIONS[egg] || to <= from) return out;
  if (level > 0) {
    const step = STEP_MS[level];
    for (let k = Math.max(0, Math.floor(from / step)); k * step < to; k++) {
      const a = Math.max(from, k * step);
      const b = Math.min(to, k * step + step * ACTIVE_FRACTION);
      if (b > a) out.push([a, b]);
    }
    return out;
  }
  // Strays: one window of voice.js's at most per window; walk the 500 ms grid cheaply by asking at each window's possible start.
  let t = Math.max(0, snapDown(from));
  while (t < to) {
    const s = spanAt({ egg, level, time: t, seed });
    if (s) {
      const a = Math.max(from, s.start);
      const b = Math.min(to, s.end);
      if (b > a) out.push([a, b]);
      t = s.end;
    } else t += UNIT_MS;
  }
  return out;
}

// --- drawing -----------------------------------------------------------------------------------------------------------------

const grid = (rows) => rows.map((r) => [...r]);
const text = (g) => g.map((r) => r.join(''));

function eyeCells(rows, an, pad) {
  const out = [];
  for (const y of [an.eyeRow, an.eyeRow + 1]) [...(rows[y] ?? '')].forEach((c, x) => c === 'o' && out.push([x, y]));
  return out.filter(([x]) => x >= pad);
}

// The right edge of a row of the registered frame: the outermost painted cell, shifted by the pad.
function edgeOf(form, y) {
  const row = form.a[y] ?? '';
  return [...row].findLastIndex((c) => c !== '.');
}

function lampCell(form, joint) {
  const an = form.anchors.a;
  if (joint === 'arm') return armShoulder(form);
  const last = lastRow(form);
  const y = { neck: an.neckRow - 1, hip: Math.max(an.neckRow + 1, last - 2), base: last }[joint];
  return [edgeOf(form, y), y];
}

// The row a lift doubles: the first under the neck, but never the feet (the last painted row), so a short baby grows in the body.
const liftRow = (form, an) => Math.max(0, Math.min(an.neckRow + 1, lastRow(form) - 1));

// The last row with anything painted (a baby's frame has empty rows under its feet).
const lastRow = (form) => form.a.findLastIndex((r) => /[^.]/.test(r));

// The raised arm, two cells, the hand last (the check light rides on it). From the right edge of the shoulder row (the first under the
// neck): where that edge column is a short limb (it starts at or below the chin), the arm goes straight up from its top; where it runs
// up the side of a slab body (it would grow out of the head), it goes out and up diagonally from the shoulder.
function armShoulder(form) {
  const y0 = Math.min(lastRow(form) - 1, form.anchors.a.neckRow + 1);
  return [edgeOf(form, y0), y0];
}
function armCells(form) {
  const y0 = Math.min(lastRow(form) - 1, form.anchors.a.neckRow + 1);
  const x = edgeOf(form, y0);
  let top = y0;
  while (top > 0 && form.a[top - 1][x] !== '.') top--;
  if (top >= form.anchors.a.neckRow - 1) return [[x, top - 1], [x, top - 2]];
  return [[x + 1, y0], [x + 2, y0 - 1]];
}

// Draw a pose onto rows that may be padded (a motion layer's) by `pad` columns. `key` is the registered frame the rows came from
// ('a', 'b' or 'sleep'). -> { rows, lift } where lift is the rows added (+1) or taken (-1), bottom aligned: draw at y - lift.
export function applyAction(rows, form, key, pose, pad = 0) {
  const an = form.anchors[key] ?? form.anchors.a;
  let g = grid(rows);
  const P = ACTION_PAD;
  // Cell changes first, in the frame's own coordinates (plus the pad).
  if (pose.scan != null) {
    for (let y = pose.scan; y < Math.min(g.length, pose.scan + pose.scanRows); y++) g[y] = g[y].map((c) => (c === '#' ? '+' : c));
  }
  const eyes = eyeCells(rows, an, pad);
  if (pose.lit) for (const [x, y] of eyes) g[y][x] = '+';
  if (pose.look) {
    const [dx, dy] = pose.look;
    const set = new Set(eyes.map(([x, y]) => `${x},${y}`));
    // All the eyes move or none do (a part move would merge two eye cells and shrink the eye).
    // They move onto body or dim body (Shell's face is dim), and leave behind what they moved onto.
    const onto = eyes.map(([x, y]) => rows[y + dy]?.[x + dx]).filter((c) => c !== 'o');
    const free = eyes.every(([x, y]) => ['#', 'x'].includes(rows[y + dy]?.[x + dx]) || set.has(`${x + dx},${y + dy}`));
    if (free) {
      for (const [x, y] of eyes) g[y][x] = onto[0] ?? '#';
      for (const [x, y] of eyes) g[y + dy][x + dx] = pose.lit ? '+' : 'o';
    }
  }
  if (pose.squint) for (const [x, y] of eyes) if (y === an.eyeRow) g[y][x] = '#';
  if (pose.back) {
    for (let y = an.headTop; y < an.neckRow; y++) g[y] = g[y].map((c) => (c === 'o' || c === '+' ? '#' : c));
  }
  if (pose.lamp && !(pose.lamp === 'arm' && pose.arm)) {
    const [x, y] = lampCell(form, pose.lamp);
    if (x >= 0 && g[y]?.[x + pad] && g[y][x + pad] !== '.') g[y][x + pad] = '+';
  }
  // Then the frame grows by the action pad, so the head and the arm can step out of it.
  g = g.map((r) => [...'.'.repeat(P), ...r, ...'.'.repeat(P)]);
  if (pose.arm) {
    const cells = armCells(form);
    cells.forEach(([i, j], n) => {
      if (g[j]?.[i + pad + P] === '.') g[j][i + pad + P] = pose.lamp === 'arm' && n === cells.length - 1 ? '+' : '#';
    });
  }
  if (pose.head) {
    const dx = pose.head;
    for (let y = 0; y < an.neckRow; y++) {
      const r = g[y];
      g[y] = dx > 0 ? [...'.'.repeat(dx), ...r.slice(0, r.length - dx)] : [...r.slice(-dx), ...'.'.repeat(-dx)];
    }
  }
  let lift = 0;
  if (pose.lift === 1) {
    const y = liftRow(form, an);
    g.splice(y, 0, [...g[y]]);
    lift = 1;
  } else if (pose.lift === -1) {
    g.splice(an.neckRow, 1);
    lift = -1;
  }
  return { rows: text(g), lift };
}

// Where a wearable pixel at (x, y) on the registered frame goes under a pose: it follows the head (rows above the neck, and anything
// floating above the figure) and the lift (rows above the doubled or lost row). -> [x, y] in the same frame coordinates.
export function warpPoint(x, y, form, key, pose) {
  const an = form.anchors[key] ?? form.anchors.a;
  let nx = x;
  let ny = y;
  if (pose.head && y < an.neckRow) nx += pose.head;
  if (pose.lift === 1 && y <= liftRow(form, an)) ny -= 1;
  if (pose.lift === -1 && y <= an.neckRow) ny += 1;
  return [nx, ny];
}

// --- the idle hold -------------------------------------------------------------------------------------------------------------

// Decided (maintainer, 2026-10-12): 1.0's idle pauses while an idle action plays, as it pauses around the tell (tell.js idleClock), so
// the action is not masked by the wander. heldClock is the time to give the 1.0 idle: the real time less every paused moment, the union
// of the tell's windows and the actions' (so the two never count a moment twice and the clock never runs backwards). Paused time is
// summed per chunk and kept per netling, so a clock hours in costs a lookup; the cache only memoizes.
const CHUNK_MS = 4000;
const cumulative = new Map();
function pausedIn(p, a, b) {
  const list = [...tellHoldWindows({ ...p, from: a, to: b }), ...actionWindows({ ...p, from: a, to: b })];
  return mergeWindows(list, a, b).reduce((s, [x, y]) => s + (y - x), 0);
}
export function heldClock({ egg, level, time, seed = 0, reduced = false }) {
  if (time <= 0 || !level) return time;
  const p = { egg, level, seed, reduced };
  const key = `${egg}|${level}|${seed}|${reduced}`;
  let cum = cumulative.get(key);
  if (!cum) {
    if (cumulative.size >= 64) cumulative.clear();
    cumulative.set(key, (cum = [0]));
  }
  const k = Math.floor(time / CHUNK_MS);
  while (cum.length <= k) {
    const j = cum.length - 1;
    cum.push(cum[j] + pausedIn(p, j * CHUNK_MS, (j + 1) * CHUNK_MS));
  }
  return time - (cum[k] + pausedIn(p, k * CHUNK_MS, time));
}
