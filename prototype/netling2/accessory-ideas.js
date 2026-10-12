// First drafts of the 2.0 style ideas' art (docs/NETLING_2_ACCESSORY_IDEAS.md): 26 wearables, 10 props and 5 crests, drawn as 1.0's are.
// Nothing here is decided or shipped, and src/ is untouched: registerIdeas() adds the drafts to 1.0's tables at run time, so the real
// placeWorn (anchors, the blend swap, orbiting floaters last) and drawProp place them, the way register.js adds the prototype forms.
// The Laughing Man ring is here as the Light ring, redrawn: the version rendered as one of Blank's elder options (NETLING_2_SPRITES_HISTORY.md,
// "Blank's elder in motion") was never committed, and was only ever seen on the Wetware hidden line. It is the one exclusive idea
// (render.js exclusiveWorn).
//
// Wearables: draw(px, a, frame, time, colors) over the authored anchors, as src/accessories.js. Props: draw(px, frame, time, extra) in
// prop-local coordinates, standing on their bottom row, size [w, h]. Crests: 9x9, '#' lit, as 1.0's cosmetics.js.
//
// The doc's Paid? column decides what each idea draws as:
//   free (find), free (earn): one version, as described (a few move: the Cat-ear headset, the Propeller beanie and others).
//   split: the animated version under the idea's id; the free version (id + FREE) is exactly one frame of it, the reduced-motion
//          picture, at `stillAt` ms, as the doc asks ("a reduced-motion player gives up nothing by not paying").
//   paid:  the doc gives no free version, so the comparison is a plainer still drawing (`plain`), for the maintainer to judge the gap.
// Every motion steps no faster than FLASH_TOGGLE_MS (most at 400 ms), and the tests check it cell by cell.
import { ACCESSORIES, PROPS, STYLE_ITEMS, anchorsFor } from '../../src/accessories.js';
import { SPRITES } from '../../src/sprites.js';

export const FREE = '.free'; // the id suffix of a split or paid idea's free comparison version (prototype only; no id is reserved)

const step = (time, ms) => Math.floor((time ?? 0) / ms);
// A ping-pong over 0..n-1: 0 1 2 .. n-1 n-2 .. 1, then over.
const pingPong = (i, n) => {
  if (n < 2) return 0;
  const k = i % (2 * n - 2);
  return k < n ? k : 2 * n - 2 - k;
};
// Paints a little grid: rows of characters, each mapped to a colour in `key` (a character not in the key is left clear).
const grid = (px, x0, y0, rows, key) => rows.forEach((r, dy) => [...r].forEach((ch, dx) => key[ch] && px(x0 + dx, y0 + dy, key[ch])));
// The eyes, split into the left and right groups (eyeCols holds both).
const eyesOf = (a) => {
  const left = a.eyeCols.filter((x) => x <= a.cx);
  const right = a.eyeCols.filter((x) => x > a.cx);
  return { left: left.length ? left : [a.eyeLeft], right: right.length ? right : [a.eyeRight] };
};

const DARK = '#050508';
const STEEL = '#8a93a3';
const LIGHT = '#c8d0dc';
const WHITE = '#e8e8f0';

// 3x5 digits for the Notification badge.
const DIGITS = {
  1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'],
  3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'],
  5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'],
  7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'],
  9: ['###', '#.#', '###', '..#', '##.'],
};

// --- wearables -------------------------------------------------------------------------------------------------------------------
export const IDEA_WEARABLES = [
  // Head
  {
    id: 'goggles',
    name: 'Goggles',
    slot: 'head',
    paid: 'free (find)',
    draw: (px, a) => {
      // Pushed up on the forehead: a strap on the head's top row (never lower than the row over the eyes) and a round dark lens over
      // each eye, a highlight cell in each.
      const y = Math.min(a.headTop, a.eyeRow - 2);
      for (let x = a.headLeft; x <= a.headRight; x++) px(x, y, '#5a3a22');
      const { left, right } = eyesOf(a);
      for (const x0 of [left[0], right[right.length - 1] - 1]) {
        grid(px, x0 - 1, y - 2, ['.##.', '#hl#', '#ll#', '.##.'], { '#': '#6a6a7a', h: '#c8f0ff', l: '#1a2a30' });
      }
    },
  },
  {
    id: 'hardhat',
    name: 'Hard hat',
    slot: 'head',
    paid: 'free (find)',
    draw: (px, a) => {
      // A yellow dome, one dark stripe down its middle, and a brim out to both sides (the Cap's brim juts one way only).
      grid(px, a.cx - 4, a.headTop - 3, ['...ydy...', '..yydyy..', 'yyyyyyyyy'], { y: '#f9c802', d: '#7a5a10' });
    },
  },
  {
    id: 'catears',
    name: 'Cat-ear headset',
    slot: 'head',
    paid: 'free (find)',
    draw: (px, a, frame, time = 0) => {
      // Two small triangle ears on a band, each tip a lit accent cell. Every 3.2 s one tip goes dark for 400 ms, the left, then
      // halfway round the right: never both at once.
      for (let x = a.headLeft + 1; x <= a.headRight - 1; x++) px(x, a.headTop - 1, '#3a3f49');
      const t = time % 3200;
      for (const [x0, off] of [[a.headLeft + 1, t < 400], [a.headRight - 3, t >= 1600 && t < 2000]]) {
        grid(px, x0, a.headTop - 4, ['.t.', 'eie', 'eee'], { e: '#5a5a6a', i: '#9a6a7a', t: off ? '#3a1a2a' : '#ff2a6d' });
      }
    },
  },
  {
    id: 'electrodes',
    name: 'Electrode cap',
    slot: 'head',
    paid: 'split',
    stillAt: 800, // the middle dot lit
    draw: (px, a, frame, time = 0) => {
      // A dotted net over the head top, five dots joined by dim lines in a W, one dot lit at a time moving across (400 ms a step).
      const hw = Math.max(2, Math.min(4, Math.floor((a.headRight - a.headLeft) / 2)));
      const half = Math.ceil(hw / 2);
      const y = a.headTop;
      const dots = [[a.cx - hw, y], [a.cx - half, y - 2], [a.cx, y], [a.cx + half, y - 2], [a.cx + hw, y]];
      for (let i = 0; i < 4; i++) {
        const [x0, y0] = dots[i];
        const [x1] = dots[i + 1];
        for (let x = x0 + 1; x < x1; x++) px(x, y - 1, '#4a6a70'); // the lines, on the row between
      }
      const lit = pingPong(step(time, 400), 5);
      dots.forEach(([x, yy], i) => px(x, yy, i === lit ? '#39ff14' : LIGHT));
    },
  },
  {
    id: 'signalbars',
    name: 'Signal bars',
    slot: 'head',
    paid: 'split',
    stillAt: 1200, // all three bars full
    draw: (px, a, frame, time = 0) => {
      // Three bars of rising height standing on the right of the head top, filling from short to tall and dropping back (400 ms).
      const n = step(time, 400) % 4; // 0, 1, 2, 3 bars lit
      const x0 = a.headRight - 4;
      for (let i = 0; i < 3; i++) for (let h = 0; h <= i; h++) px(x0 + i * 2, a.headTop - 1 - h, i < n ? WHITE : '#3a4a50');
    },
  },
  {
    id: 'cabletangle',
    name: 'Cable tangle',
    slot: 'head',
    paid: 'free (find)',
    draw: (px, a) => {
      // Three loose patch cables out of the left of the head, drooping, each plug a different colour. Still.
      const L = a.headLeft;
      const y = a.headTop + 1;
      grid(px, L - 5, y - 2, [
        '..cc.',
        '.c..c',
        'c....',
        'p..cc',
        '..c.c',
        '..q..',
        '....r',
      ], { c: STEEL, p: '#ff2a6d', q: '#f9f002', r: '#05d9e8' });
    },
  },
  {
    id: 'hood',
    name: 'Hood',
    slot: 'head',
    paid: 'free (find)',
    draw: (px, a) => {
      // A dark drape over the head top and down both sides to the eye row, the face left clear. One cell wider than the head on each
      // side (the outline check the doc asks for is in the tests: it stays on screen on every form).
      const c = '#3d2a55';
      const edge = '#5d4a7a';
      for (let x = a.headLeft; x <= a.headRight; x++) px(x, a.headTop - 1, c);
      for (let x = a.headLeft - 1; x <= a.headRight + 1; x++) px(x, a.headTop, x === a.headLeft - 1 || x === a.headRight + 1 ? edge : c);
      for (let y = a.headTop + 1; y <= a.eyeRow + 1; y++) {
        px(a.headLeft - 1, y, edge);
        px(a.headRight + 1, y, edge);
      }
    },
  },
  {
    id: 'beanie',
    name: 'Propeller beanie',
    slot: 'head',
    paid: 'free (earn)',
    draw: (px, a, frame, time = 0) => {
      // A striped beanie with a two-blade propeller on a stem; the blades turn, wide and edge-on, every 400 ms.
      grid(px, a.cx - 3, a.headTop - 3, ['..ccc..', '.ppppp.', 'ccccccc'], { c: '#05d9e8', p: '#ff2a6d' });
      px(a.cx, a.headTop - 4, LIGHT);
      const blades = step(time, 400) % 2 ? ['.b.b.'] : ['bb.bb'];
      grid(px, a.cx - 2, a.headTop - 5, blades, { b: '#f9f002' });
      px(a.cx, a.headTop - 5, LIGHT);
    },
  },

  // Face
  {
    id: 'laughingring',
    name: 'Light ring',
    slot: 'face',
    paid: 'free (find)',
    // Worn alone on the face, and over the head: the renderer (render.js exclusiveWorn) hides every other face item and any worn item
    // whose pixels fall on the ring or inside it (maintainer, 2026-10-12).
    exclusive: true,
    // Recolorable, so placeWorn's blend check never swaps the cells over the body to another colour: the ring stays one tone all round.
    colors: [
      ['ring', '#c0eeff'],
      ['glow', '#ffffff'],
    ],
    draw: (px, a, frame, time = 0, colors) => {
      // An unbroken oval round the head in one pale colour, with a glow (three bright cells and a softer cell either side) sliding round it
      // counterclockwise (maintainer, 2026-10-12), two cells every 200 ms (the fastest the flash rule allows: each cell still holds a
      // colour for 200 ms; maintainer asked for a brighter ring and a faster pulse): a lap of about 2.5 to 4 s. Redrawn from the maintainer's memory of
      // the 2026-10-07 version for Blank (a continuous oval glow with a pulsing motion), which was never committed; the first redraw
      // (blue dashes, a dash every 400 ms) read as broken and shaded. Kept findable whole, motion included, as the doc says.
      const [ring, glow] = colors ?? ['#c0eeff', '#ffffff'];
      const soft = mix(ring, glow);
      const cells = ringCells(a);
      const n = cells.length;
      const head = (n - ((step(time, 200) * 2) % n)) % n; // the cell list runs clockwise
      cells.forEach(([x, y], i) => {
        const d = Math.min((i - head + n) % n, (head - i + n) % n);
        px(x, y, d <= 1 ? glow : d === 2 ? soft : ring);
      });
    },
  },
  {
    id: 'scanvisor',
    name: 'Scan visor',
    slot: 'face',
    paid: 'split',
    stillAt: 800,
    draw: (px, a, frame, time = 0) => {
      // A thin dark band across the top eye row, the eyes showing through as dim cells, and one bright cell sweeping left and right
      // inside it (400 ms a step). The Visor is three lines and hides the eyes; this is one line and keeps them.
      const left = Math.min(a.headLeft, a.eyeLeft);
      const right = Math.max(a.headRight, a.eyeRight);
      for (let x = left; x <= right; x++) px(x, a.eyeRow, a.eyeCols.includes(x) ? '#2f6b73' : '#101418');
      px(left + 1 + pingPong(step(time, 400), right - left - 1), a.eyeRow, '#ff2a6d');
    },
  },
  {
    id: 'warpaint',
    name: 'War paint',
    slot: 'face',
    paid: 'free (find)',
    colors: [['paint', '#14141c']],
    draw: (px, a, frame, time, colors) => {
      // Two short slanted stripes under each eye, mirrored, dark by default (recolorable). Still.
      const [c] = colors ?? ['#14141c'];
      const { left, right } = eyesOf(a);
      const y = a.eyeRow + 2;
      for (const [x, d] of [[left[0], 1], [right[right.length - 1], -1]]) {
        px(x, y, c);
        px(x - d, y + 1, c);
        px(x + 2 * d, y, c);
        px(x + d, y + 1, c);
      }
    },
  },
  {
    id: 'teardrop',
    name: 'Teardrop code',
    slot: 'face',
    paid: 'free (find)',
    draw: (px, a) => {
      // One accent cell under the right eye's inner edge, a dim cell under it. Still.
      const { right } = eyesOf(a);
      px(right[0], a.eyeRow + 2, '#05d9e8');
      px(right[0], a.eyeRow + 3, '#1f5a68');
    },
  },
  {
    id: 'deadpixels',
    name: 'Dead pixels',
    slot: 'face',
    paid: 'free (find)',
    draw: (px, a) => {
      // Three dark cells on the cheeks, like freckles. Still, always (the bug tears move; these never do).
      const { left, right } = eyesOf(a);
      px(left[0] - 1, a.eyeRow + 2, DARK);
      px(left[0] + 1, a.eyeRow + 3, DARK);
      px(right[right.length - 1], a.eyeRow + 3, DARK);
    },
  },
  {
    id: 'censorbar',
    name: 'Censor bar',
    slot: 'face',
    paid: 'free (find)',
    draw: (px, a, frame, time = 0) => {
      // A solid black bar over the mouth row, a cell past each end, with a ragged edge under it whose cells shift between two
      // patterns every 800 ms. Over the mouth only: the eyes still read.
      for (let x = a.mouthLeft - 1; x <= a.mouthRight + 1; x++) {
        px(x, a.mouthRow, DARK);
        if ((x + step(time, 800)) % 2) px(x, a.mouthRow + 1, DARK);
      }
    },
  },

  // Body
  {
    id: 'dogtags',
    name: 'Dog tags',
    slot: 'body',
    paid: 'free (find)',
    draw: (px, a) => {
      // A dotted chain from both sides of the neck to two small grey plates, one hanging a row lower. Still.
      const y = a.neckRow;
      for (const [x, dy] of [[a.cx - 3, 0], [a.cx - 2, 1], [a.cx + 2, 0], [a.cx + 1, 1]]) px(x, y + dy, STEEL);
      for (const dy of [2, 3]) px(a.cx - 1, y + dy, LIGHT);
      for (const dy of [3, 4]) px(a.cx, y + dy, '#a8b0bc');
    },
  },
  {
    id: 'hazardsash',
    name: 'Hazard sash',
    slot: 'body',
    paid: 'free (find)',
    draw: (px, a) => {
      // A diagonal band from the right shoulder down to the left hip, alternating yellow and dark cells (the Chip bandolier runs the
      // other way). Still, so the stripes never strobe.
      const x0 = Math.min(a.bodyLeft, a.cx - 2);
      const x1 = Math.max(a.bodyRight, a.cx + 2);
      // Never past the row above the feet (the Baby's neck sits low).
      const rows = Math.max(1, Math.min(Math.max(3, a.mid + 3 - a.neckRow), (a.bottom ?? a.mid + 5) - 1 - a.neckRow));
      for (let i = 0; i <= x1 - x0; i++) {
        const y = a.neckRow + Math.round((i * rows) / Math.max(1, x1 - x0));
        px(x1 - i, y, i % 2 ? '#1a1a1a' : '#f9c802');
      }
    },
  },
  {
    id: 'pulsepatch',
    name: 'Pulse patch',
    slot: 'body',
    paid: 'split',
    stillAt: 0, // the blip up
    draw: (px, a, frame, time = 0) => {
      // A small square patch on the chest with a one-row trace that blips once a second: up 250 ms on one cell, 250 ms on the next,
      // then flat for 500 ms.
      const x0 = a.cx - 2;
      const y0 = a.mid - 1;
      for (let dx = 0; dx < 5; dx++) for (let dy = 0; dy < 3; dy++) px(x0 + dx, y0 + dy, WHITE);
      const t = (time ?? 0) % 1000;
      const blip = t < 250 ? 1 : t < 500 ? 2 : -1;
      for (let dx = 0; dx < 5; dx++) px(x0 + dx, dx === blip ? y0 : y0 + 1, '#ff2a6d');
    },
  },
  {
    id: 'heatsink',
    name: 'Heat sink',
    slot: 'body',
    paid: 'free (find)',
    draw: (px, a) => {
      // Three short fins clipped to the right side of the body. Drawn plain, as the doc advises if the Overclock glow is too much
      // rule; HEATSINK_HOT below is the glowing version, for the review page only.
      heatsink(px, a, false);
    },
  },
  {
    id: 'visitorpass',
    name: 'Visitor pass',
    slot: 'body',
    paid: 'free (find)',
    draw: (px, a) => {
      // A white card clipped to the left of the chest, one red stripe across its top and a tiny dark photo square. Still.
      const x0 = Math.min(a.bodyLeft + 1, a.cx - 3);
      const y0 = a.mid - 1;
      px(x0 + 1, y0 - 1, STEEL); // the clip
      grid(px, x0, y0, ['rrr', 'p##', '###'], { r: '#ff1a1a', '#': WHITE, p: DARK });
    },
  },
  {
    id: 'leashcable',
    name: 'Leash cable',
    slot: 'body',
    paid: 'free (earn)',
    draw: (px, a) => {
      // A thin cable from a ring at the neck, down the left side to the floor and off the left of the screen, as if something still
      // holds the other end. Still. The floor is the sprite's last row (where every awake form stands; registerIdeas adds it).
      const floor = a.bottom ?? a.mid + 5;
      const x = a.neckLeft - 2;
      px(a.neckLeft - 1, a.neckRow, LIGHT); // the ring
      for (let y = a.neckRow + 1; y <= floor; y++) px(x, y, '#6a7a8a');
      for (let dx = 1; dx <= 48; dx++) px(x - dx, floor, '#6a7a8a');
    },
  },

  // Float
  {
    id: 'spinner',
    name: 'Loading spinner',
    slot: 'float',
    paid: 'split',
    stillAt: 0,
    draw: (px, a, frame, time = 0) => {
      // A ring of eight dim cells over the head, one bright cell stepping round it clockwise (400 ms a step).
      const RING = [[-1, -2], [1, -2], [2, -1], [2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1]];
      const lit = step(time, 400) % 8;
      const y = a.top - 4;
      RING.forEach(([dx, dy], i) => px(a.cx + dx, y + dy, i === lit ? '#e8f8ff' : '#4a7a80'));
    },
  },
  {
    id: 'badge',
    name: 'Notification badge',
    slot: 'float',
    paid: 'split',
    stillAt: 0, // "1"
    draw: (px, a, frame, time = 0) => {
      // A red badge with a white digit over the head's top right corner, counting 1 to 9 and over again, one every 3 s.
      const n = (step(time, 3000) % 9) + 1;
      const x0 = a.headRight - 2;
      const y0 = a.headTop - 5;
      grid(px, x0, y0, ['.###.', '#####', '#####', '#####', '#####', '#####', '.###.'], { '#': '#ff1a4a' });
      grid(px, x0 + 1, y0 + 1, DIGITS[n], { '#': '#ffffff' });
    },
  },
  {
    id: 'thoughtbubble',
    name: 'Thought bubble',
    slot: 'float',
    paid: 'paid',
    draw: (px, a, frame, time = 0) => {
      // Two dots rising to a bubble over the head, the bubble holding a tiny icon that changes every 3 s: a chip, a heart, a skull.
      // Decorative only: it never shows what the netling wants.
      bubble(px, a);
      const icon = [
        { rows: ['.#.#.', '#####', '.#.#.'], c: '#39ff14' }, // a chip with its pins
        { rows: ['##.##', '.###.', '..#..'], c: '#ff1a4a' },
        { rows: ['.###.', '#.#.#', '.###.'], c: '#e8e8f0' }, // a skull: a round head, two sockets
      ][step(time, 3000) % 3];
      grid(px, a.cx, a.top - 5, icon.rows, { '#': icon.c });
    },
    // The plainer free picture: the dots and an empty bubble, still.
    plain: (px, a) => bubble(px, a),
  },
  {
    id: 'bitswarm',
    name: 'Bit swarm',
    slot: 'float',
    orbits: true,
    paid: 'split',
    stillAt: 0,
    draw: (px, a, frame, time = 0) => {
      // Three bright single pixels orbiting the body at different distances and speeds, like fireflies, a cell a step (400 ms).
      const s = step(time, 400);
      const cy = a.mid - 1;
      const half = Math.floor((a.headRight - a.headLeft) / 2);
      [[half + 2, 3, 0.55, 0], [half + 4, 5, 0.4, 2.1], [half + 6, 4, 0.3, 4.2]].forEach(([rx, ry, w, p]) => {
        const t = s * w + p;
        px(a.cx + Math.round(Math.cos(t) * rx), cy + Math.round(Math.sin(t) * ry), '#f9f05a');
      });
    },
  },
  {
    id: 'padlock',
    name: 'Padlock',
    slot: 'float',
    paid: 'free (find)',
    draw: (px, a, frame, time = 0) => {
      // A small gold padlock over the head that opens and shuts slowly, 3 s each: shut, the shackle down in the body; open, lifted a
      // row with one leg free. A dark keyhole in the body.
      const open = step(time, 3000) % 2 === 1;
      const rows = open ? ['.###.', '.#.#.', '.#...', '#####', '##k##', '#####'] : ['.###.', '.#.#.', '#####', '##k##', '#####'];
      grid(px, a.cx - 2, a.top - rows.length, rows, { '#': '#d8b04a', k: '#3a2a10' });
    },
  },
  {
    id: 'minisat',
    name: 'Mini satellite',
    slot: 'float',
    orbits: true,
    paid: 'split',
    stillAt: 12 * 400, // parked over the middle of the head
    draw: (px, a, frame, time = 0) => {
      // A tiny satellite with two panel wings crossing high over the head from left to right, a cell every 400 ms, then over again.
      const span = 12;
      const x = a.cx - span + (step(time, 400) % (2 * span + 1));
      const y = a.top - 5;
      grid(px, x - 2, y, ['pp#pp', '..d..'], { p: '#05d9e8', '#': LIGHT, d: STEEL });
    },
  },
];

// The Light ring's cells: an unbroken oval (each cell touching the next, corners included) from two cells outside the head's sides and
// two rows over the head top to two rows under the mouth, clear of the head's outline so it reads as a glow round it, not a shaded edge; in clockwise order from the top.
export function ringCells(a) {
  const cx = (a.headLeft + a.headRight) / 2;
  const top = a.headTop - 2;
  const bottom = a.mouthRow + 2;
  const cy = (top + bottom) / 2;
  const rx = (a.headRight - a.headLeft) / 2 + 2;
  const ry = (bottom - top) / 2;
  const cells = [];
  for (let i = 0; i < 1440; i++) {
    const t = (i / 1440) * Math.PI * 2 - Math.PI / 2;
    const x = Math.round(cx + Math.cos(t) * rx);
    const y = Math.round(cy + Math.sin(t) * ry);
    const last = cells[cells.length - 1];
    if (last && last[0] === x && last[1] === y) continue;
    if (cells.some(([u, v]) => u === x && v === y)) continue;
    cells.push([x, y]);
  }
  // Thin the line: drop a cell whose neighbours on both sides already touch each other, so the oval is one cell wide without
  // corner clumps.
  for (let k = 0; k < cells.length && cells.length > 8; ) {
    const p = cells[(k - 1 + cells.length) % cells.length];
    const q = cells[(k + 1) % cells.length];
    if (Math.abs(p[0] - q[0]) <= 1 && Math.abs(p[1] - q[1]) <= 1) cells.splice(k, 1);
    else k++;
  }
  return cells;
}
// The midpoint of two #rrggbb colours.
function mix(c1, c2) {
  const h = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
  return `#${[0, 1, 2].map((i) => Math.round((h(c1, i) + h(c2, i)) / 2).toString(16).padStart(2, '0')).join('')}`;
}
function heatsink(px, a, hot) {
  const x = a.bodyRight + 1;
  for (const dy of [-1, 1, 3]) {
    px(x, a.mid + dy, STEEL);
    px(x + 1, a.mid + dy, hot ? '#ff8a1a' : LIGHT);
  }
  for (let dy = -1; dy <= 3; dy++) px(x, a.mid + dy, STEEL); // the clip, along the body's edge
}
function bubble(px, a) {
  px(a.cx - 3, a.top - 1, WHITE);
  px(a.cx - 2, a.top - 2, WHITE);
  grid(px, a.cx - 1, a.top - 6, ['.#####.', '#.....#', '#.....#', '#.....#', '.#####.'], { '#': WHITE });
}

// The Heat sink as drafted, glowing in Overclock (a colour, not a flash). Review page only: tied to a state it tells the player
// something, which the doc says keeps it free.
export const HEATSINK_HOT = { id: 'heatsink.hot', name: 'Heat sink (in Overclock)', slot: 'body', paid: 'review only: the Overclock glow', version: 'only', draw: (px, a) => heatsink(px, a, true) };

// --- props -----------------------------------------------------------------------------------------------------------------------
export const IDEA_PROPS = [
  {
    id: 'servertower',
    name: 'Server tower',
    paid: 'split',
    stillAt: 0,
    size: [5, 11],
    draw: (px, frame, time = 0) => {
      // A narrow dark case with a column of status lights, one stepping down the column every 400 ms, and a green one that stays lit.
      const rows = ['#####', '#.g.#', '#...#', '#.-.#', '#...#', '#.-.#', '#...#', '#.-.#', '#...#', '#####', '#.#.#'];
      grid(px, 0, 0, rows, { '#': '#4a5060', '.': '#1a1d24', '-': '#3a3f49', g: '#39ff14' });
      const lit = step(time, 400) % 7;
      px(1, 2 + lit, '#05d9e8');
    },
  },
  {
    id: 'petridish',
    name: 'Petri dish',
    paid: 'free (find)',
    size: [7, 3],
    // extra.growth (0 to 1): how far the culture has spread. Without it, time over a day of real time (the renderer's clock in a
    // review; in a game it would be the life's age, reset with each new life). Still from moment to moment.
    draw: (px, frame, time = 0, extra = null) => {
      grid(px, 0, 0, ['g.....g', 'g.....g', '.ggggg.'], { g: '#a8d8e8' });
      const growth = extra?.growth ?? ((time ?? 0) % 86_400_000) / 86_400_000;
      const SPOTS = [[3, 1, '#39ff14'], [2, 1, '#39ff14'], [4, 1, '#f9f002'], [1, 1, '#39ff14'], [3, 0, '#ff2a6d'], [5, 1, '#f9f002'], [2, 0, '#39ff14'], [4, 0, '#39ff14'], [1, 0, '#f9f002'], [5, 0, '#ff2a6d']];
      const n = 1 + Math.floor(growth * (SPOTS.length - 1) + 1e-9);
      for (const [x, y, c] of SPOTS.slice(0, n)) px(x, y, c);
    },
  },
  {
    id: 'terminal',
    name: 'Desk terminal',
    paid: 'paid',
    size: [7, 8],
    draw: (px, frame, time = 0) => {
      // A small beige CRT on a stand, a prompt on its screen and a cursor blinking on 1.0's 500 ms frame rhythm.
      terminal(px, true);
      if (step(time, 500) % 2 === 0) px(3, 3, '#39ff14');
    },
    plain: (px) => terminal(px, false), // the plainer free picture: no stand, no shading, no cursor
  },
  {
    id: 'cardboardbox',
    name: 'Cardboard box',
    paid: 'free (find)',
    size: [9, 6],
    draw: (px) => {
      // A plain box, its flaps half open, big enough to hide in. Still.
      grid(px, 0, 0, ['f.......f', '.f.....f.', '.tdddddt.', '.bbbbbbb.', '.bbbsbbb.', '.bbbbbbb.'], { f: '#c8965a', t: '#c8965a', d: '#3a2410', b: '#b8864a', s: '#d8b07a' });
    },
  },
  {
    id: 'toolbox',
    name: 'Toolbox',
    paid: 'free (find)',
    size: [7, 6],
    draw: (px) => {
      // A red toolbox with its lid ajar and a spanner sticking out. Still.
      grid(px, 0, 0, ['....s.s', '.....s.', 'llll.s.', '#######', '###y###', '#######'], { s: LIGHT, l: '#e04040', '#': '#c02a2a', y: '#f9c802' });
    },
  },
  {
    id: 'noodles',
    name: 'Noodle cup',
    paid: 'paid',
    size: [6, 8],
    draw: (px, frame, time = 0) => {
      // A takeaway cup with chopsticks and a wisp of steam drifting up in two slow steps (800 ms).
      noodles(px, true);
      const up = step(time, 800) % 2;
      px(1, 1 - up, '#8a93a3');
      px(2, 2 - up, '#8a93a3');
    },
    plain: (px) => noodles(px, false), // no steam, no band
  },
  {
    id: 'lavalamp',
    name: 'Lava lamp',
    paid: 'paid',
    size: [5, 10],
    draw: (px, frame, time = 0) => {
      // A tall lamp, two blobs rising and sinking out of step, one cell every 800 ms. (The faint glow on the floor with the lights off
      // needs the renderer to tell a prop the lights are off; 1.0's drawProp dims every prop instead, so it is not drawn here.)
      lavalamp(px);
      const s = step(time, 800);
      const cells = [[1, 7, 2], [3, 2, 7]]; // [x, top, bottom] of each blob's path
      cells.forEach(([x, y0, y1], i) => {
        const y = i === 0 ? y1 - pingPong(s, y1 - y0 + 1) : y0 + pingPong(s, y1 - y0 + 1);
        px(x, y, '#ff6b2a');
        px(2, Math.min(y1, Math.max(y0, y)), '#ff6b2a');
      });
    },
    plain: (px) => {
      // One blob resting at the bottom, still.
      lavalamp(px);
      for (const x of [1, 2, 3]) px(x, 7, '#ff6b2a');
    },
  },
  {
    id: 'minicab',
    name: 'Mini arcade cabinet',
    paid: 'paid',
    size: [6, 10],
    draw: (px, frame, time = 0) => {
      // A knee-high cabinet whose screen cycles still pictures of the four home games, one every 3 s: Breach's bricks and ball,
      // Dodge's falling blocks, Feast's dots, Tune's notes.
      cabinet(px, true);
      const PICS = [
        { rows: ['####', '.#.#', '..o.'], c: { '#': '#ff2a6d', o: '#ffffff' } },
        { rows: ['#..#', '..#.', '.o..'], c: { '#': '#f9f002', o: '#39ff14' } },
        { rows: ['o.o.', '.o.o', 'o.o.'], c: { o: '#f9f002' } },
        { rows: ['.#..', '.#.#', '##.#'], c: { '#': '#05d9e8' } },
      ];
      const pic = PICS[step(time, 3000) % 4];
      grid(px, 1, 2, pic.rows, pic.c);
    },
    plain: (px) => cabinet(px, false), // the plainer free picture: a plain case, a dark screen
  },
  {
    id: 'fishbowl',
    name: 'Fishbowl',
    paid: 'split',
    stillAt: 800, // the fish in the middle, facing right
    size: [7, 6],
    draw: (px, frame, time = 0) => {
      // A round bowl, one pixel fish swimming left and right a cell every 800 ms and turning at the glass.
      grid(px, 0, 0, ['.g...g.', 'gwwwwwg', 'gwwwwwg', 'gwwwwwg', '.gwwwg.', '..ggg..'], { g: '#a8d8e8', w: '#1a4a6a' });
      // Head positions: right 2..5, then left 4..1, then over (8 steps).
      const PATH = [[2, 1], [3, 1], [4, 1], [5, 1], [4, -1], [3, -1], [2, -1], [1, -1]];
      const [x, dir] = PATH[step(time, 800) % PATH.length];
      px(x, 2, '#ff8a1a');
      px(x - dir, 2, '#c85a10');
    },
  },
  {
    id: 'jammer',
    name: 'Signal jammer',
    paid: 'free (earn)',
    size: [6, 5],
    draw: (px, frame, time = 0) => {
      // A squat box with two stubby antennas and a red light that pulses once a second (on 500 ms, off 500 ms).
      const on = step(time, 500) % 2 === 0;
      grid(px, 0, 0, ['.a..a.', '.a..a.', '######', '#r#--#', '######'], { a: STEEL, '#': '#3a3f49', '-': '#5a5a6a', r: on ? '#ff1a1a' : '#4a1010' });
    },
  },
];

function terminal(px, full) {
  const rows = full
    ? ['#######', '#sssss#', '#s>sss#', '#sssss#', '#######', '..###..', '.#####.', '.......']
    : ['#######', '#sssss#', '#s>sss#', '#sssss#', '#######', '.......', '.......', '.......'];
  // Without the stand the plain CRT sits on the floor.
  const dy = full ? 0 : 3;
  grid(px, 0, dy, rows.slice(0, full ? 7 : 5), { '#': '#d8c8a0', s: '#0a1a0a', '>': '#39ff14' });
  if (full) {
    px(0, 4, '#a8987a'); // the shading along the case's bottom edge
    for (let x = 1; x < 6; x++) px(x, 4, '#a8987a');
    px(6, 4, '#a8987a');
  }
}
function noodles(px, full) {
  grid(px, 0, 2, ['....c.', '...c.c', '#####.', full ? 'rrrrr.' : '#####.', '.###..', '.###..'], { c: '#d8b04a', '#': WHITE, r: '#ff2a6d' });
}
function lavalamp(px) {
  grid(px, 0, 0, ['.mmm.', '.ggg.', '.ggg.', '.ggg.', 'ggggg', 'ggggg', 'ggggg', '.ggg.', '.mmm.', 'mmmmm'], { m: STEEL, g: '#4a1a4a' });
}
function cabinet(px, full) {
  grid(px, 0, 0, ['mmmmmm', '#....#', '#ssss#', '#ssss#', '#ssss#', '######', full ? '#j#b##' : '######', '######', '##..##', '######'], {
    m: full ? '#05d9e8' : '#4a3a7a',
    '#': '#4a3a7a',
    s: '#0a0a14',
    '.': '#4a3a7a',
    j: '#ff2a6d',
    b: '#f9f002',
  });
}

// --- crests (9x9, '#' lit), as 1.0's cosmetics.js crest pixels ---------------------------------------------------------------------
export const IDEA_CRESTS = [
  {
    id: 'threeeggs',
    name: 'Three eggs',
    paid: 'free (earn)',
    // Three small eggs, the middle one a step higher, so they read as three, not a bar.
    pixels: ['.........', '....#....', '...###...', '...###...', '.#.###.#.', '###...###', '###...###', '###...###', '.........'],
  },
  {
    id: 'scales',
    name: 'Scales',
    paid: 'free (earn)',
    // A balance with its pans level.
    pixels: ['....#....', '#########', '.#..#..#.', '.#..#..#.', '###.#.###', '....#....', '....#....', '...###...', '..#####..'],
  },
  {
    id: 'plus',
    name: 'Plus',
    paid: 'free (earn)',
    // A clinic cross.
    pixels: ['.........', '...###...', '...###...', '.#######.', '.#######.', '.#######.', '...###...', '...###...', '.........'],
  },
  {
    id: 'wanted',
    name: 'Wanted',
    paid: 'free (earn)',
    // A poster corner torn away at the bottom right, a dot for a face and a line of text under it.
    pixels: ['########.', '#......#.', '#..##..#.', '#..##..#.', '#......#.', '#.###.#..', '#.....#..', '#...##...', '#####....'],
  },
  {
    id: 'fulltree',
    name: 'Full tree',
    paid: 'free (earn)',
    // A small tree: nine leaves in a diamond over a trunk.
    pixels: ['....#....', '...#.#...', '..#.#.#..', '...#.#...', '....#....', '....#....', '....#....', '...###...', '.#######.'],
  },
];

// --- registration --------------------------------------------------------------------------------------------------------------
// The entries the review page and the tests use: [{ id, base, version: 'only' | 'free' | 'paid', ... }]. A split or paid idea gives two
// (its id is the paid, animated one; id + FREE the free comparison); every other idea one.
const freeOf = (x, args) =>
  x.paid === 'split'
    ? args === 'wear'
      ? (px, a, frame, time, colors) => x.draw(px, a, 0, x.stillAt, colors)
      : (px, frame, time, extra) => x.draw(px, 0, x.stillAt, extra)
    : x.plain;
const versions = (list, args) =>
  list.flatMap((x) => {
    const base = { ...x, base: x.id };
    if (x.paid !== 'split' && x.paid !== 'paid') return [{ ...base, version: 'only' }];
    return [
      { ...base, id: x.id + FREE, name: `${x.name} (free)`, version: 'free', draw: freeOf(x, args) },
      { ...base, name: `${x.name} (paid)`, version: 'paid' },
    ];
  });
export const WEARABLE_ENTRIES = versions(IDEA_WEARABLES, 'wear');
export const PROP_ENTRIES = versions(IDEA_PROPS, 'prop');

// Adds every entry to 1.0's tables (idempotent). The Leash cable needs the sprite's last row, which 1.0's anchors do not keep: `bottom`
// is added to the anchors the draw sees. Call it from the review page and the tests only, never from anything the 1.0 tests load.
let registered = false;
export function registerIdeas() {
  if (registered) return;
  registered = true;
  const taken = new Set(STYLE_ITEMS.map((x) => x.id));
  for (const x of [...WEARABLE_ENTRIES, HEATSINK_HOT, ...PROP_ENTRIES]) if (taken.has(x.id)) throw new Error(`style idea ${x.id} clashes with a 1.0 id`);
  for (const x of [...WEARABLE_ENTRIES, HEATSINK_HOT]) {
    const entry = { ...x, rarity: 'common', source: 'earned', draw: x.draw };
    ACCESSORIES.push(entry);
    STYLE_ITEMS.push(entry);
  }
  for (const x of PROP_ENTRIES) {
    const entry = { ...x, slot: 'prop', rarity: 'common', source: 'earned' };
    PROPS.push(entry);
    STYLE_ITEMS.push(entry);
  }
  // anchorsFor caches one object per sprite, so the row is added once to every registered sprite (1.0's and the prototype's).
  for (const s of Object.values(SPRITES)) {
    if (!Array.isArray(s) || typeof s[0] !== 'string') continue;
    try {
      anchorsFor(s).bottom = s.length - 1;
    } catch {
      // not a body (the Z, the icons): nothing wears anything on it
    }
  }
}
