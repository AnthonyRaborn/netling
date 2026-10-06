// The two ways to build the Iron line, behind one interface so the page, the tests and the audit treat them alike.
//   Model A, composed: one adult body, five role overlays merged onto it.
//   Model B, authored: five adults drawn in full.
// Baby, teen and elder are the same art in both (they have no role).
import { BABY, TEEN, ELDER, ADULT_BODY, OVERLAYS, ADULTS, ANCHORS } from './art.js';

export const ROLES = ['breach', 'dodge', 'tune', 'feast', 'hidden'];
// Role to the adult's name and to the key of its art in each model.
export const ROLE_FORM = { breach: 'gronk', dodge: 'jiff', tune: 'feep', feast: 'munch', hidden: 'guru' };
export const SHARED = { baby: BABY, teen: TEEN, elder: ELDER };

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
  // Any other accent cell on the head above the eyes (the hidden form's third eye) goes dark in both poses.
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

// forms(model) -> { id: { stage, role?, a, b, sleep, dead, anchors: { a, b, sleep } } }
// Sleep and dead take the A frame's anchors, with the eyes a row lower asleep as in 1.0 (the slit sits on the eye's bottom row).
function build(id, stage, frames, anchors, extra = {}) {
  const sleep = pose(frames.a, anchors.a.eyeRow, 'sleep');
  const dead = pose(frames.a, anchors.a.eyeRow, 'dead');
  return { id, stage, ...extra, a: frames.a, b: frames.b, sleep, dead, anchors: { a: anchors.a, b: anchors.b, sleep: anchors.a } };
}

const cache = {};
// Memoized: the same arrays every call, because src/accessories.js keys its anchor table on array identity (register.js).
export function forms(model) {
  return (cache[model] ??= buildForms(model));
}
function buildForms(model) {
  const out = {};
  for (const [stage, frames] of Object.entries(SHARED)) out[stage] = build(stage, stage, frames, ANCHORS[stage]);
  for (const role of ROLES) {
    const name = ROLE_FORM[role];
    const frames = model === 'A' ? { a: compose(ADULT_BODY.a, OVERLAYS[role].a), b: compose(ADULT_BODY.b, OVERLAYS[role].b) } : ADULTS[name];
    // Model A's roles share the body's anchors (that is its premise); model B authors each form's own.
    out[name] = build(name, 'adult', frames, model === 'A' ? ANCHORS.adultBody : ANCHORS[name], { role });
  }
  return out;
}
