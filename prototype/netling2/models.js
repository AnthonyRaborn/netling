// The two ways to build the Iron line, behind one interface so the page, the tests and the audit treat them alike.
//   Model A, composed: a body per stage, with overlays merged onto it (a role overlay and a lean overlay for the adult, a lean
//                      overlay for the teen).
//   Model B, authored: the teen and the adult drawn in full.
// Baby and elder are the same art in both (one each per egg, no role or lean).
//
// The main line is four forms, baby to elder: Baby, a street-leaning Teen, Gronk (Breach, street lean) and Gronk's Elder. Beside it
// are the other main teen and the hidden branch (hidden-path teen and Guru), authored only. The sketch's full tree (3 teens and 9
// adults per egg) was prototyped earlier and is in git history at commit 580db88.
import { BABY, ELDER, ELDERS, TEEN_BODY, TEEN_OVERLAYS, TEENS, ADULT_BODY, OVERLAYS, LEAN_OVERLAYS, ADULTS, ANCHORS } from './art.js';

// Form id -> what it is, in life order. `authoredOnly` forms exist in model B only: the composed model was rejected, so it is not
// extended to them.
export const FORMS = {
  baby: { stage: 'baby' },
  teenStreet: { stage: 'teen', lean: 'street' },
  gronk: { stage: 'adult', role: 'breach', lean: 'street' },
  gronkElder: { stage: 'elder', from: 'gronk' }, // one elder per adult (decided): a variant of the adult it grows from
  // The other main teen and the hidden path (Iron). The hidden-path teen grows into Guru, the hidden adult; Guru's elder is not drawn.
  teenCorp: { stage: 'teen', lean: 'corp', authoredOnly: true },
  teenHidden: { stage: 'teen', lean: 'hidden', authoredOnly: true },
  guru: { stage: 'adult', role: 'hidden', authoredOnly: true },
  // The other adults of Iron's nine (option C: a corp and a street form for each of four roles), authored only.
  splat: { stage: 'adult', role: 'breach', lean: 'corp', authoredOnly: true },
  jiff: { stage: 'adult', role: 'dodge', lean: 'corp', authoredOnly: true },
  bamf: { stage: 'adult', role: 'dodge', lean: 'street', authoredOnly: true },
  ping: { stage: 'adult', role: 'tune', lean: 'corp', authoredOnly: true },
  feep: { stage: 'adult', role: 'tune', lean: 'street', authoredOnly: true },
  munch: { stage: 'adult', role: 'feast', lean: 'corp', authoredOnly: true },
  thrash: { stage: 'adult', role: 'feast', lean: 'street', authoredOnly: true },
  // The other eight elders, one per adult.
  splatElder: { stage: 'elder', from: 'splat', authoredOnly: true },
  jiffElder: { stage: 'elder', from: 'jiff', authoredOnly: true },
  bamfElder: { stage: 'elder', from: 'bamf', authoredOnly: true },
  pingElder: { stage: 'elder', from: 'ping', authoredOnly: true },
  feepElder: { stage: 'elder', from: 'feep', authoredOnly: true },
  munchElder: { stage: 'elder', from: 'munch', authoredOnly: true },
  thrashElder: { stage: 'elder', from: 'thrash', authoredOnly: true },
  guruElder: { stage: 'elder', from: 'guru', authoredOnly: true },
};
// Iron's nine adults and their elders, in option C order (corp then street within a role, hidden last).
export const ADULTS_ALL = ['splat', 'gronk', 'jiff', 'bamf', 'ping', 'feep', 'munch', 'thrash', 'guru'];
export const ELDER_OF = (adult) => `${adult}Elder`;
// The main line, baby to elder, and the hidden branch (baby is shared, then the hidden-path teen and its adult).
export const LINE = ['baby', 'teenStreet', 'gronk', 'gronkElder'];
export const HIDDEN_BRANCH = ['baby', 'teenHidden', 'guru'];
export const TEENS_ALL = ['teenCorp', 'teenStreet', 'teenHidden'];

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

// Iron's own marks on the generic poses (the sketch's death register: Iron is decommissioned, a last write that leaves a
// read-only record; its rhythm is batch: work is queued and collected on return).
//   asleep: a QUEUE, four accent dots in a row on the chest, work waiting for the next batch.
//   dead:   a READ-ONLY RECORD, a dark barcode stamped across the chest, the last write.
// Marks only: they replace '#' body cells, never touch the eyes or the outline, and sit at the same columns on every form.
const QUEUE = 'o.o..o.o';
const RECORD = 'oo.o..o.oo'; // symmetric: read the same from either end
function stamp(rows, from, pattern) {
  const w = rows[0].length;
  const start = (w - pattern.length) / 2;
  const hits = (y) => [...pattern].filter((c, i) => c === 'o' && rows[y][start + i] === '#').length;
  const want = [...pattern].filter((c) => c === 'o').length;
  let best = -1;
  for (let y = from; y < rows.length; y++) if (hits(y) > (best < 0 ? 2 : hits(best))) best = y;
  if (best < 0) return rows;
  return rows.map((row, y) => (y === best ? [...row].map((c, x) => (c === '#' && pattern[x - start] === 'o' ? 'o' : c)).join('') : row));
}
export const ironMarks = (rows, anchors, kind) => (kind === 'sleep' ? stamp(rows, anchors.mouthRow + 1, QUEUE) : stamp(rows, anchors.neckRow, RECORD));

// Sleep and dead take the A frame's anchors (the eyes shut or crossed on the same row).
function build(id, frames, anchors) {
  const sleep = ironMarks(pose(frames.a, anchors.a.eyeRow, 'sleep'), anchors.a, 'sleep');
  const dead = ironMarks(pose(frames.a, anchors.a.eyeRow, 'dead'), anchors.a, 'dead');
  return { id, ...FORMS[id], a: frames.a, b: frames.b, sleep, dead, anchors: { a: anchors.a, b: anchors.b, sleep: anchors.a } };
}

function framesA(id) {
  const { stage, role, lean } = FORMS[id];
  const both = (body, ...overlays) => Object.fromEntries(['a', 'b'].map((f) => [f, overlays.reduce((rows, o) => compose(rows, o[f]), body[f])]));
  if (stage === 'baby') return BABY;
  if (stage === 'elder') return ELDER;
  if (stage === 'teen') return both(TEEN_BODY, TEEN_OVERLAYS[lean]);
  return both(ADULT_BODY, OVERLAYS[role], LEAN_OVERLAYS[lean]);
}
function framesB(id) {
  const { stage } = FORMS[id];
  if (stage === 'baby') return BABY;
  if (stage === 'elder') return ELDERS[id];
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
  return (cache[model] ??= Object.fromEntries(Object.keys(FORMS).filter((id) => model === 'B' || !FORMS[id].authoredOnly).map((id) => [id, build(id, model === 'A' ? framesA(id) : framesB(id), model === 'A' ? anchorsA(id) : ANCHORS[id])])));
}
