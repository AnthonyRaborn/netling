// The two ways to build the Iron line, behind one interface so the page, the tests and the audit treat them alike.
//   Model A, composed: a body per stage, with overlays merged onto it (a role overlay and a lean overlay for an adult, a lean
//                      overlay for a teen).
//   Model B, authored: every teen and adult drawn in full.
// Baby and elder are the same art in both (one each per egg, no role or lean).
//
// The 14 forms follow docs/NETLING_2_SKETCH.md: baby; three teens (corp lean, street lean, and the hidden path); nine adults
// (four roles with two named forms each, one corp-leaning and one street-leaning, plus the hidden one); one elder.
import { BABY, ELDER, TEEN_BODY, TEEN_OVERLAYS, TEENS, ADULT_BODY, OVERLAYS, LEAN_OVERLAYS, ADULTS, ANCHORS } from './art.js';

export const ROLES = ['breach', 'dodge', 'tune', 'feast', 'hidden'];
// Form id -> what it is. Iron's names: the corp lean takes the tidier word, the street lean the wilder one.
export const FORMS = {
  baby: { stage: 'baby' },
  teenCorp: { stage: 'teen', lean: 'corp' },
  teenStreet: { stage: 'teen', lean: 'street' },
  teenHidden: { stage: 'teen', lean: 'hidden' },
  splat: { stage: 'adult', role: 'breach', lean: 'corp' },
  gronk: { stage: 'adult', role: 'breach', lean: 'street' },
  jiff: { stage: 'adult', role: 'dodge', lean: 'corp' },
  bamf: { stage: 'adult', role: 'dodge', lean: 'street' },
  ping: { stage: 'adult', role: 'tune', lean: 'corp' },
  feep: { stage: 'adult', role: 'tune', lean: 'street' },
  munch: { stage: 'adult', role: 'feast', lean: 'corp' },
  thrash: { stage: 'adult', role: 'feast', lean: 'street' },
  guru: { stage: 'adult', role: 'hidden' },
  elder: { stage: 'elder' },
};
export const ids = (stage) => Object.keys(FORMS).filter((id) => FORMS[id].stage === stage);
export const ADULT_IDS = ids('adult');
export const TEEN_IDS = ids('teen');
// The forms of a role: corp lean then street lean (just the one for the hidden role).
export const roleForms = (role) => ADULT_IDS.filter((id) => FORMS[id].role === role);

// Merge an overlay onto a body: '_' erases, any other non-'.' replaces.
export function compose(body, overlay) {
  if (body.length !== overlay.length) throw new Error(`overlay has ${overlay.length} rows, body has ${body.length}`);
  return body.map((row, y) => [...row].map((ch, x) => (overlay[y][x] === '.' ? ch : overlay[y][x] === '_' ? '.' : overlay[y][x])).join(''));
}

// Dead and asleep poses, generated from the A frame the way src/sprites.js does for 1.0 forms: each eye (a connected group
// of accent cells on the eye rows) becomes an X when dead and a slit when asleep.
const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]];
function eyeGroups(rows, eyeRow) {
  const seen = new Set();
  const groups = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== 'o' || seen.has(`${x},${y}`) || y < eyeRow || y > eyeRow + 1) return;
      const cells = [];
      const stack = [[x, y]];
      seen.add(`${x},${y}`);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        cells.push([cx, cy]);
        for (const [dx, dy] of NEIGHBOURS) {
          const key = `${cx + dx},${cy + dy}`;
          if (rows[cy + dy]?.[cx + dx] === 'o' && cy + dy >= eyeRow && cy + dy <= eyeRow + 1 && !seen.has(key)) {
            seen.add(key);
            stack.push([cx + dx, cy + dy]);
          }
        }
      }
      groups.push(cells);
    }),
  );
  return groups;
}
export function pose(a, eyeRow, kind) {
  const g = a.map((r) => [...r]);
  const groups = eyeGroups(a, eyeRow);
  // Any other accent cell on the head above the eyes (a hidden form's third eye) goes dark in both poses.
  a.forEach((row, y) => y < eyeRow && y >= eyeRow - 2 && [...row].forEach((ch, x) => ch === 'o' && (g[y][x] = '#')));
  for (const cells of groups) for (const [x, y] of cells) g[y][x] = '#';
  for (const cells of groups) {
    const mx = Math.round(cells.reduce((n, [x]) => n + x, 0) / cells.length);
    const my = Math.round(cells.reduce((n, [, y]) => n + y, 0) / cells.length);
    if (kind === 'dead') {
      for (const [dx, dy] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) if (g[my + dy]?.[mx + dx] !== undefined && g[my + dy][mx + dx] !== '.') g[my + dy][mx + dx] = 'o';
    } else {
      const bottom = Math.max(...cells.map(([, y]) => y));
      for (const [x, y] of cells) if (y === bottom) g[y][x] = 'o';
    }
  }
  return g.map((r) => r.join(''));
}

// Sleep and dead take the A frame's anchors (the eyes shut or crossed on the same row).
function build(id, frames, anchors) {
  const sleep = pose(frames.a, anchors.a.eyeRow, 'sleep');
  const dead = pose(frames.a, anchors.a.eyeRow, 'dead');
  return { id, ...FORMS[id], a: frames.a, b: frames.b, sleep, dead, anchors: { a: anchors.a, b: anchors.b, sleep: anchors.a } };
}

function framesA(id) {
  const { stage, role, lean } = FORMS[id];
  const both = (body, ...overlays) => Object.fromEntries(['a', 'b'].map((f) => [f, overlays.reduce((rows, o) => compose(rows, o[f]), body[f])]));
  if (stage === 'baby') return BABY;
  if (stage === 'elder') return ELDER;
  if (stage === 'teen') return both(TEEN_BODY, TEEN_OVERLAYS[lean]);
  return role === 'hidden' ? both(ADULT_BODY, OVERLAYS.hidden) : both(ADULT_BODY, OVERLAYS[role], LEAN_OVERLAYS[lean]);
}
function framesB(id) {
  const { stage } = FORMS[id];
  if (stage === 'baby') return BABY;
  if (stage === 'elder') return ELDER;
  return stage === 'teen' ? TEENS[id] : ADULTS[id];
}
// Model A's forms share the body's anchors (that is its premise); model B authors each form's own.
function anchorsA(id) {
  const { stage } = FORMS[id];
  return stage === 'teen' ? ANCHORS.teenBody : stage === 'adult' ? ANCHORS.adultBody : ANCHORS[id];
}

const cache = {};
// Memoized: the same arrays every call, because src/accessories.js keys its anchor table on array identity (register.js).
export function forms(model) {
  return (cache[model] ??= Object.fromEntries(Object.keys(FORMS).map((id) => [id, build(id, model === 'A' ? framesA(id) : framesB(id), model === 'A' ? anchorsA(id) : ANCHORS[id])])));
}
