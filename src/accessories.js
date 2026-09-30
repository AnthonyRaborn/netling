// Accessories: cosmetic pixel add-ons drawn over the pet. Every form can wear every accessory. Placement comes from
// anchors: four rows per sprite that are authored in ANCHOR_ROWS (sprites.js, so a wearable sits on the same part of the body
// in every frame), with everything else read from the sprite's own pixels. A sprite that is not in the table falls back
// to guessing all four rows from its pixels, and tests/accessories.test.js checks that every form has its rows.
// Props (PROPS below) are style items too, but sit on the ground beside the pet in their own slot.
// source 'earned' items are granted by events, never sold or dropped.
import { SPRITES, ANCHOR_ROWS, anchorRowsFor } from './sprites.js';
export { anchorRowsFor };
import { contrastColor } from './colors.js';
import { AUTO_COLORS } from './wearable-colors.js';

export const RARITY = {
  common: { weight: 6, hint: 'sold in markets.' },
  rare: { weight: 2, hint: 'rarely sold. sometimes turns up on a run.' },
  veryrare: { weight: 1, hint: 'almost never for sale.' },
};

// sprite array -> its authored rows. The same array can be several poses (a missing pose falls back to A).
const authored = new Map();
for (const form of Object.keys(ANCHOR_ROWS)) {
  for (const [key, pose] of [['A', 'a'], ['B', 'b'], ['Sleep', 'sleep']]) {
    const sprite = SPRITES[`${form}${key}`];
    if (sprite) authored.set(sprite, anchorRowsFor(form, pose));
  }
}

const spriteCellsOf = (sprite, ch, fromRow, toRow) => {
  const out = [];
  for (let y = fromRow; y <= toRow; y++) [...(sprite[y] ?? '')].forEach((c, x) => c === ch && out.push([x, y]));
  return out;
};

// Anchors for a sprite (array of strings). Cached per sprite array.
const cache = new WeakMap();
export function anchorsFor(sprite) {
  if (cache.has(sprite)) return cache.get(sprite);
  const rows = authored.get(sprite);
  const w = sprite[0].length;
  const span = (row) => {
    const cols = [...row].map((ch, i) => (ch !== '.' ? i : -1)).filter((i) => i >= 0);
    return cols.length ? { left: cols[0], right: cols[cols.length - 1], count: cols.length } : null;
  };
  const spans = sprite.map(span);
  const top = spans.findIndex(Boolean); // first painted row (antenna tips included)
  // Head top: the authored row, else the first row that's clearly body, not antennae or horns.
  let headTop = rows?.headTop ?? spans.findIndex((s) => s && s.count >= w * 0.4);
  if (headTop < 0) headTop = top;
  // Eye row: the authored row, else the first row at/below the head top holding accent pixels.
  let eyeRow = rows?.eyeRow ?? sprite.findIndex((row, i) => i >= headTop && row.includes('o'));
  if (eyeRow < 0) eyeRow = Math.min(sprite.length - 1, headTop + 2);
  const eyeCols = [...sprite[eyeRow]].map((ch, i) => (ch === 'o' ? i : -1)).filter((i) => i >= 0);
  let bottom = sprite.length - 1;
  while (bottom > eyeRow && !(spans[bottom] && spans[bottom].count >= w * 0.4)) bottom--;
  const mid = Math.min(bottom, eyeRow + Math.max(2, Math.round((bottom - eyeRow) / 2)));
  const head = spans[headTop];
  // The body and neck are the solid run of pixels through the middle of the row: side arms (Kernel's, on some frames)
  // are attached to a row but are not the body, so a scarf must not stretch out to them.
  const centre = Math.floor((head.left + head.right) / 2);
  const runAt = (rowIndex) => {
    const row = sprite[rowIndex];
    if (!row || !spans[rowIndex]) return null;
    let start = centre;
    for (let d = 0; d < w && row[start] === '.'; d++) start = centre + (d % 2 ? -1 : 1) * Math.ceil((d + 1) / 2);
    if (row[start] === undefined || row[start] === '.') return spans[rowIndex];
    let left = start;
    let right = start;
    while (row[left - 1] && row[left - 1] !== '.') left--;
    while (row[right + 1] && row[right + 1] !== '.') right++;
    return { left, right, count: right - left + 1 };
  };
  const spanOf = (authored, rowIndex) => (authored ? { left: authored[0], right: authored[1], count: authored[1] - authored[0] + 1 } : runAt(rowIndex));
  const body = spanOf(rows?.bodySpan, mid) ?? head;
  // Mouth: the authored row, else the first row below the eyes with highlight pixels ('+'), else a guess.
  let mouthRow = rows?.mouthRow ?? sprite.findIndex((row, i) => i > eyeRow && row.includes('+'));
  if (mouthRow < 0) mouthRow = Math.min(bottom, eyeRow + 2);
  const mouthCols = [...sprite[mouthRow]].map((ch, i) => (ch === '+' ? i : -1)).filter((i) => i >= 0);
  // Neck: the authored row, else the row under the mouth.
  const neckRow = Math.min(sprite.length - 1, rows?.neckRow ?? mouthRow + 1);
  const neck = spanOf(rows?.neckSpan, neckRow) ?? body;
  const a = {
    top,
    headTop,
    headLeft: head.left,
    headRight: head.right,
    eyeRow,
    eyeLeft: eyeCols.length ? eyeCols[0] : head.left + 1,
    eyeRight: eyeCols.length ? eyeCols[eyeCols.length - 1] : head.right - 1,
    eyeCols: eyeCols.length ? eyeCols : [head.left + 2, head.right - 2],
    mid,
    bodyLeft: body.left,
    bodyRight: body.right,
    cx: Math.floor((head.left + head.right) / 2),
    mouthRow,
    mouthLeft: mouthCols.length ? mouthCols[0] : Math.floor((head.left + head.right) / 2) - 1,
    mouthRight: mouthCols.length ? mouthCols[mouthCols.length - 1] : Math.floor((head.left + head.right) / 2) + 1,
    neckRow,
    neckLeft: neck.left,
    neckRight: neck.right,
    // Cells of the sprite that shine through eyewear: a form whose eyes are bright highlights ('+') on a visor (Chrome).
    shine: rows?.shine ? spriteCellsOf(sprite, '+', eyeRow, eyeRow + 1) : [],
  };
  cache.set(sprite, a);
  return a;
}

// Each draw(px, a, frame, time) paints with px(x, y, color) in sprite-local coordinates.
// regions: where it can be found (markets and drops); omitted means anywhere. hint overrides the rarity hint.
export const ACCESSORIES = [
  {
    id: 'cap',
    name: 'Cap',
    slot: 'head',
    rarity: 'common',
    colors: [['cap', '#05d9e8']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#05d9e8'];
      // A dome with a brim that juts out to the right, so it is not the Crown's flat band.
      for (let x = a.cx - 1; x <= a.cx + 1; x++) px(x, a.headTop - 3, c);
      for (let x = a.cx - 2; x <= a.cx + 2; x++) px(x, a.headTop - 2, c);
      for (let x = a.cx - 3; x <= a.cx + 5; x++) px(x, a.headTop - 1, c);
    },
  },
  {
    id: 'scarf',
    name: 'Scarf',
    slot: 'body',
    rarity: 'common',
    colors: [['scarf', '#ff2a6d']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#ff2a6d'];
      for (let x = a.neckLeft; x <= a.neckRight; x++) px(x, a.neckRow, c);
      px(a.neckRight - 1, a.neckRow + 1, c);
      px(a.neckRight - 1, a.neckRow + 2, c);
    },
  },
  {
    id: 'headphones',
    name: 'Headphones',
    slot: 'head',
    rarity: 'common',
    draw: (px, a) => {
      for (let x = a.headLeft + 1; x <= a.headRight - 1; x++) px(x, a.headTop - 1, '#9a9ab8');
      for (let y = a.eyeRow - 1; y <= a.eyeRow + 1; y++) {
        px(a.headLeft - 1, y, '#b967ff');
        px(a.headRight + 1, y, '#b967ff');
      }
    },
  },
  {
    id: 'flower',
    name: 'Flower',
    slot: 'head',
    rarity: 'common',
    draw: (px, a) => {
      const x = a.headLeft + 1;
      const y = a.headTop - 2;
      px(x, y - 1, '#f9f002');
      px(x - 1, y, '#f9f002');
      px(x + 1, y, '#f9f002');
      px(x, y + 1, '#f9f002');
      px(x, y, '#ff2a6d');
    },
  },
  {
    id: 'bow',
    name: 'Bow',
    slot: 'head',
    rarity: 'common',
    draw: (px, a) => {
      // two loops and a knot:  ##.##  /  ##o##  /  ##.##
      const x = a.headRight - 2;
      const y = a.headTop - 2;
      for (const dy of [-1, 0, 1]) for (const dx of [-2, -1, 1, 2]) px(x + dx, y + dy, '#ff2a6d');
      px(x, y, '#ffb3c8');
    },
  },
  {
    id: 'shades',
    name: 'Shades',
    slot: 'face',
    rarity: 'rare',
    colors: [
      ['lenses', '#050508'],
      ['glint', '#5d7a80'],
    ],
    draw: (px, a, frame, time, colors) => {
      const [lens, glint] = colors ?? ['#050508', '#5d7a80'];
      for (const x of a.eyeCols) {
        px(x, a.eyeRow, lens);
        px(x, a.eyeRow + 1, lens);
      }
      for (let x = a.eyeLeft; x <= a.eyeRight; x++) px(x, a.eyeRow, lens);
      px(a.eyeLeft, a.eyeRow, glint);
      // Eyes that are too bright to hide (Chrome's) shine through the lenses.
      for (const [x, y] of a.shine) px(x, y, '#ffffff');
    },
  },
  {
    id: 'visor',
    name: 'Visor',
    slot: 'face',
    rarity: 'rare',
    colors: [
      ['band', '#ff2a6d'],
      ['light', '#ffffff'],
    ],
    draw: (px, a, frame, time, colors) => {
      const [band, light] = colors ?? ['#ff2a6d', '#ffffff'];
      // An augmented-vision visor: two tinted lenses with a bridge between them, rounded corners, a scan light sweeping
      // each lens and a blip of readout above the right one. Not a single bar across the face.
      const left = Math.min(a.headLeft, a.eyeLeft);
      const right = Math.max(a.headRight, a.eyeRight);
      const lenses = [[left, a.cx - 1], [a.cx + 1, right]];
      for (const [from, to] of lenses) {
        for (let x = from; x <= to; x++) {
          px(x, a.eyeRow, band);
          if (x > from && x < to) {
            px(x, a.eyeRow - 1, '#050508');
            px(x, a.eyeRow + 1, '#050508');
          }
        }
      }
      px(a.cx, a.eyeRow, '#050508'); // the bridge
      const sweep = frame % 2 ? 2 : 0;
      px(left + 1 + sweep, a.eyeRow, light); // scan lights, one per lens, moving together
      px(right - 1 - sweep, a.eyeRow, light);
      px(right - 1, a.eyeRow - 2, frame % 2 ? light : band); // readout blip
    },
  },
  {
    id: 'crown',
    name: 'Crown',
    slot: 'head',
    rarity: 'rare',
    draw: (px, a) => {
      for (let x = a.cx - 2; x <= a.cx + 2; x++) px(x, a.headTop - 1, '#f9f002');
      for (const x of [a.cx - 2, a.cx, a.cx + 2]) px(x, a.headTop - 2, '#f9f002');
      px(a.cx, a.headTop - 1, '#ff2a6d');
    },
  },
  {
    id: 'halo',
    name: 'Halo',
    slot: 'float',
    rarity: 'veryrare',
    draw: (px, a, frame) => {
      const y = a.top - 3 - (frame % 2);
      for (let x = a.cx - 2; x <= a.cx + 2; x++) {
        px(x, y - 1, '#f9f002');
        px(x, y + 1, '#f9f002');
      }
      px(a.cx - 3, y, '#f9f002');
      px(a.cx + 3, y, '#f9f002');
    },
  },
  {
    id: 'spark',
    name: 'Spark',
    slot: 'float',
    rarity: 'veryrare',
    draw: (px, a, frame) => {
      // A twinkle: a plus on one frame, an X on the other, always with the bright centre.
      const y = a.top - 3;
      px(a.cx, y, '#ffffff');
      for (const [dx, dy] of frame % 2 ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(a.cx + dx, y + dy, frame % 2 ? '#ffffff' : '#05d9e8');
    },
  },

  // --- regional ------------------------------------------------------------------------
  {
    id: 'barcode',
    name: 'Corp barcode',
    slot: 'body',
    rarity: 'common',
    regions: ['corp'],
    hint: 'stamped on assets in the Corp Grid.',
    draw: (px, a) => {
      const x0 = a.bodyRight - 6;
      [1, 0, 1, 1, 0, 1].forEach((on, i) => {
        if (!on) return;
        px(x0 + i, a.mid - 1, '#050508');
        px(x0 + i, a.mid, '#050508');
      });
    },
  },
  {
    id: 'chromejaw',
    name: 'Chrome jaw',
    slot: 'face',
    rarity: 'rare',
    regions: ['corp'],
    hint: 'rarely sold in the Corp Grid.',
    draw: (px, a) => {
      for (let x = a.mouthLeft - 1; x <= a.mouthRight + 1; x++) {
        px(x, a.mouthRow, '#c8d0dc');
        px(x, a.mouthRow + 1, (x - a.mouthLeft) % 2 ? '#8a93a3' : '#c8d0dc');
      }
      for (let x = a.mouthLeft; x <= a.mouthRight; x++) px(x, a.mouthRow + 2, '#8a93a3'); // a heavy chin, so the jaw hangs lower than a mask
    },
  },
  {
    id: 'cybereye',
    name: 'Cyber eye',
    slot: 'face',
    rarity: 'rare',
    regions: ['corp'],
    hint: 'rarely sold in the Corp Grid.',
    draw: (px, a, frame) => {
      const right = a.eyeCols.filter((x) => x > a.cx);
      const cols = right.length ? right : [a.eyeRight];
      for (const x of cols) {
        px(x, a.eyeRow, '#ff1a1a');
        px(x, a.eyeRow + 1, '#ff1a1a');
      }
      px(cols[cols.length - 1] + 1, a.eyeRow, '#5a5a6a');
      px(cols[0], a.eyeRow, frame % 2 ? '#ffffff' : '#ff1a1a'); // it blinks on its own
    },
  },
  {
    id: 'mohawk',
    name: 'Neon mohawk',
    slot: 'head',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'sold in the Darknet Bazaar.',
    colors: [['mohawk', '#ff2a6d']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#ff2a6d'];
      // A crest swept back and up, a staircase rather than the Party hat's cone.
      for (const [dx, dy] of [[-2, -1], [-1, -1], [-1, -2], [0, -2], [0, -3], [1, -3], [1, -4], [2, -4]]) px(a.cx + dx, a.headTop + dy, c);
    },
  },
  {
    id: 'neuraljack',
    name: 'Neural jack',
    slot: 'face',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'sold in the Darknet Bazaar.',
    draw: (px, a) => {
      px(a.headLeft, a.eyeRow, '#f9f002'); // the plug
      px(a.headLeft, a.eyeRow + 1, '#f9f002');
      for (const [dx, dy] of [[-1, 0], [-2, 1], [-2, 2], [-3, 3], [-3, 4]]) px(a.headLeft + dx, a.eyeRow + dy, '#9a9ab8');
    },
  },
  {
    id: 'tattoo',
    name: 'Circuit tattoo',
    slot: 'face',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'inked in the Darknet Bazaar.',
    colors: [['glow', '#39ff14']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#39ff14'];
      for (const [dx, dy] of [[0, 2], [0, 3], [1, 3], [2, 3], [2, 4], [3, 4]]) px(a.eyeLeft + dx, a.eyeRow + dy, c);
    },
  },
  {
    id: 'rebreather',
    name: 'Rebreather',
    slot: 'face',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'sold in the Darknet Bazaar.',
    colors: [
      ['plate', '#6a6a7a'],
      ['filter', '#4a4a5a'],
    ],
    draw: (px, a, frame, time, colors) => {
      const [plate, filter] = colors ?? ['#6a6a7a', '#4a4a5a'];
      for (let x = a.mouthLeft - 1; x <= a.mouthRight + 1; x++) px(x, a.mouthRow, plate);
      for (let x = a.mouthLeft; x <= a.mouthRight; x++) px(x, a.mouthRow + 1, filter);
      px(Math.floor((a.mouthLeft + a.mouthRight) / 2), a.mouthRow + 1, '#050508'); // vent
      // A filter can on each side, sticking out past the face: a mask, not a jaw.
      for (const x of [a.mouthLeft - 2, a.mouthRight + 2]) for (const dy of [0, 1]) px(x, a.mouthRow + dy, filter);
    },
  },
  {
    id: 'satdish',
    name: 'Sat-dish antenna',
    slot: 'head',
    rarity: 'rare',
    regions: ['ruins'],
    hint: 'left behind in the Old Web Ruins.',
    draw: (px, a, frame) => {
      const x = a.headRight - 2;
      for (const [dx, dy] of [[0, -1], [0, -2], [-1, -3], [0, -3], [1, -3], [-2, -4], [2, -4]]) px(x + dx, a.headTop + dy, '#c8c8d8');
      if (frame % 2) px(x, a.headTop - 5, '#ff2a6d');
    },
  },
  {
    id: 'kernelpin',
    name: 'KERNEL pin',
    slot: 'body',
    rarity: 'veryrare',
    regions: ['ruins'],
    hint: 'a relic of the old project. the ruins might still have one.',
    draw: (px, a) => {
      const x = a.bodyLeft + 1;
      const y = a.mid - 1;
      for (let dx = 0; dx < 3; dx++) for (let dy = 0; dy < 3; dy++) px(x + dx, y + dy, '#d8b04a');
      px(x + 1, y + 1, '#050508');
    },
  },
  {
    id: 'drone',
    name: 'Drone buddy',
    slot: 'float',
    rarity: 'veryrare',
    regions: ['deep'],
    hint: 'something small follows runners up from the deep.',
    draw: (px, a, frame, time = 0) => {
      const rx = Math.floor((a.headRight - a.headLeft) / 2) + 2;
      const t = time / 700;
      const x = a.cx + Math.round(Math.cos(t) * rx);
      const y = a.headTop - 2 + Math.round(Math.sin(t) * 2);
      px(x - 1, y, '#8a93a3');
      px(x, y, '#c8d0dc');
      px(x + 1, y, '#8a93a3');
      px(x - 2, y - 1, '#c8d0dc'); // rotors
      px(x + 2, y - 1, '#c8d0dc');
      px(x, y + 1, frame % 2 ? '#39ff14' : '#5a5a6a'); // its light blinks
    },
  },
];

// --- earned (never sold) ------------------------------------------------------------------
ACCESSORIES.push(
  {
    id: 'partyhat',
    name: 'Party hat',
    slot: 'head',
    rarity: 'common',
    source: 'earned',
    hint: 'a gift for a first birthday.',
    colors: [
      ['stripe', '#ff2a6d'],
      ['stripe', '#f9f002'],
    ],
    draw: (px, a, frame, time, colors) => {
      // a cheap hologram: the stripes swap every frame
      const [s1, s2] = colors ?? ['#ff2a6d', '#f9f002'];
      const [c1, c2] = frame % 2 ? [s1, s2] : [s2, s1];
      for (let x = a.cx - 2; x <= a.cx + 2; x++) px(x, a.headTop - 1, x % 2 ? c1 : c2);
      for (let x = a.cx - 1; x <= a.cx + 1; x++) px(x, a.headTop - 2, x % 2 ? c2 : c1);
      for (let x = a.cx - 1; x <= a.cx + 1; x++) px(x, a.headTop - 3, x % 2 ? c1 : c2); // a tall cone
      px(a.cx, a.headTop - 4, c1);
      px(a.cx, a.headTop - 5, '#ffffff'); // the pom-pom
    },
  },
  {
    id: 'bandage',
    name: 'Bandage',
    slot: 'head',
    rarity: 'rare',
    source: 'earned',
    hint: 'you have to survive something first.',
    draw: (px, a) => {
      // A plaster across the cheek: a strip with a pad in the middle.
      const x = a.headRight - 3;
      const y = a.headTop + 1;
      for (let dx = -2; dx <= 2; dx++) for (const dy of [0, 1]) px(x + dx, y + dy, '#f0e6d8');
      px(x, y, '#ff8fa8');
      px(x, y + 1, '#ff8fa8');
    },
  },
  // --- more wearables -----------------------------------------------------------------------
  {
    id: 'earpiece',
    name: 'Earpiece',
    slot: 'face',
    rarity: 'common',
    regions: ['corp'],
    hint: 'standard issue in the Corp Grid.',
    draw: (px, a) => {
      for (const dy of [0, 1]) {
        px(a.headRight + 1, a.eyeRow + dy, '#3a3f49'); // the bud, two by two
        px(a.headRight + 2, a.eyeRow + dy, '#8a93a3');
      }
      px(a.headRight + 1, a.eyeRow + 2, '#8a93a3'); // the boom, curving to the mouth
      px(a.headRight, a.mouthRow, '#8a93a3');
      px(a.headRight - 1, a.mouthRow, '#ff2a6d'); // mic
    },
  },
  {
    id: 'dataaura',
    name: 'Data aura',
    slot: 'float',
    rarity: 'rare',
    regions: ['ruins'],
    hint: 'echoes cling to runners in the Old Web Ruins.',
    draw: (px, a, frame, time = 0) => {
      const rx = Math.floor((a.headRight - a.headLeft) / 2) + 3;
      const cy = a.eyeRow + 2;
      for (let i = 0; i < 5; i++) {
        const t = time / 1600 + (i * Math.PI * 2) / 5;
        const x = a.cx + Math.round(Math.cos(t) * rx);
        const y = cy + Math.round(Math.sin(t * 1.3) * 5);
        const c = i % 2 ? '#39ff14' : '#05d9e8';
        px(x, y, c);
        px(x + 1, y, c); // each echo is two wide, so it reads as a mark rather than a speck
      }
    },
  },
);
// Worn slots: one accessory from each can be worn at once, drawn in this order (later ones on top).
export const WEAR_SLOTS = ['body', 'face', 'head', 'float'];
const slotRank = (id) => WEAR_SLOTS.indexOf(ACCESSORIES.find((x) => x.id === id)?.slot);
// Worn entries ({ id, ... }) in draw order; unknown ids and props are dropped.
export const wearOrder = (list) => list.filter((w) => slotRank(w.id) >= 0).sort((a, b) => slotRank(a.id) - slotRank(b.id));
// What the wardrobe has on ([{ id, colors }]): one owned accessory per wear slot.
export const wornFrom = (wardrobe, owned) =>
  WEAR_SLOTS.map((slot) => wardrobe?.[slot]).filter((id) => owned.includes(id)).map((id) => ({ id, colors: wardrobe.colors?.[id] ?? null }));
// What a visitor wears: a list of ids (older visits stored one id as `accessory`).
export const visitAccessories = (visit) => visit?.accessories ?? (visit?.accessory ? [visit.accessory] : []);

// --- props: drawn on the ground at the right of the screen, behind the pet --------------------
// draw(px, frame, time, extra) paints in prop-local coordinates; the prop's feet sit on its bottom row.
export const PROPS = [
  {
    id: 'deck',
    name: 'Cyberdeck',
    rarity: 'rare',
    regions: ['bazaar'],
    hint: 'every runner in the Bazaar wants one.',
    size: [7, 5],
    draw: (px, frame) => {
      const rows = ['.#####.', '.#ooo#.', '.#ooo#.', '#######', '#+#+#+#'];
      rows.forEach((r, y) =>
        [...r].forEach((ch, x) => {
          if (ch === '#') px(x, y, '#3a3f49');
          if (ch === 'o') px(x, y, frame % 2 && x === 3 && y === 2 ? '#ffffff' : '#05d9e8');
          if (ch === '+') px(x, y, '#8a93a3');
        }),
      );
    },
  },
  {
    id: 'boombox',
    name: 'Boom box',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'turned up loud in the Darknet Bazaar.',
    size: [7, 5],
    draw: (px, frame) => {
      const rows = ['.#...#.', '..###..', '#######', '#o#+#o#', '#######'];
      rows.forEach((r, y) =>
        [...r].forEach((ch, x) => {
          if (ch === '#') px(x, y, '#b967ff');
          if (ch === '+') px(x, y, '#f9f002');
          if (ch === 'o') px(x, y, frame % 2 ? '#ff2a6d' : '#1a0d26'); // speakers pulse
        }),
      );
    },
  },
  {
    id: 'minidevice',
    name: 'Mini device',
    rarity: 'veryrare',
    source: 'earned',
    hint: 'collect every shell. then look closer.',
    size: [4, 6],
    draw: (px, frame) => {
      const rows = ['.##.', '#oo#', '#oo#', '#..#', '#++#', '.##.'];
      rows.forEach((r, y) =>
        [...r].forEach((ch, x) => {
          if (ch === '#') px(x, y, '#ff2a6d');
          if (ch === 'o') px(x, y, frame % 2 && x === 1 && y === 1 ? '#39ff14' : '#0b2226'); // its pet blinks
          if (ch === '+') px(x, y, '#05d9e8');
        }),
      );
    },
  },
  {
    id: 'plush',
    name: 'Plush',
    rarity: 'rare',
    source: 'earned',
    hint: 'a keepsake, after the first goodbye.',
    size: [10, 10], // the half-scale body is 8 by 8, inside a one pixel outline
    // extra: { sprite, colors } of the previous netling; drawn at half scale.
    draw: (px, frame, time, extra) => {
      if (!extra?.sprite) return;
      const s = extra.sprite;
      const lit = new Set();
      for (let y = 0; y < s.length; y += 2) {
        for (let x = 0; x < s[0].length; x += 2) {
          const c = extra.colors[s[y][x]];
          if (c) {
            px(1 + Math.floor(x / 2), 1 + Math.floor(y / 2), c);
            lit.add(`${1 + Math.floor(x / 2)},${1 + Math.floor(y / 2)}`);
          }
        }
      }
      // A one pixel dark outline, so the plush stays a shape when it overlaps the pet.
      for (const key of [...lit]) {
        const [x, y] = key.split(',').map(Number);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!lit.has(`${x + dx},${y + dy}`)) px(x + dx, y + dy, '#050508');
      }
    },
  },
];
for (const x of PROPS) x.slot = 'prop';

export const STYLE_ITEMS = [...ACCESSORIES, ...PROPS];

export const accessoryHint = (x) => x.hint ?? RARITY[x.rarity].hint;

// Recolorable accessories declare colors: [[label, signature color], ...]. Custom picks must be #rrggbb.
export const HEX = /^#[0-9a-f]{6}$/i;
// A slot the player has not picked (null, or anything that is not a #rrggbb) is automatic: the wearable's color for the
// palette `pal` ({ name }) from AUTO_COLORS, which stands clear of that palette, else its signature color.
export function accessoryColors(id, custom, pal = null) {
  const x = accessoryById(id);
  if (!x?.colors) return null;
  return x.colors.map(([, def], i) => (HEX.test(custom?.[i] ?? '') ? custom[i] : (AUTO_COLORS[id]?.[i]?.[pal?.name] ?? def)));
}
export const accessoryRegions = (x) => x.regions ?? null;

export const accessoryById = (id) => STYLE_ITEMS.find((x) => x.id === id);

// Pick an accessory the player doesn't own yet, weighted by rarity, or null.
// With a region, only accessories found there (or anywhere) are in the pool.
export function rollAccessory(exclude, rng, region = null) {
  const pool = STYLE_ITEMS.filter(
    (x) => x.source !== 'earned' && !exclude.includes(x.id) && (!region || !x.regions || x.regions.includes(region)),
  );
  return pickByRarity(pool, rng);
}

// What a visiting netling wears: any accessory that can be found (not props, not earned ones),
// from any region, weighted by rarity. A glimpse of what's out there. `taken`: ids already worn, whose slots are full.
export function rollWornAccessory(rng, taken = []) {
  const full = new Set(taken.map((id) => accessoryById(id)?.slot));
  return pickByRarity(ACCESSORIES.filter((x) => x.source !== 'earned' && !full.has(x.slot)), rng);
}

function pickByRarity(pool, rng) {
  if (!pool.length) return null;
  const total = pool.reduce((n, x) => n + RARITY[x.rarity].weight, 0);
  let r = rng() * total;
  for (const x of pool) if ((r -= RARITY[x.rarity].weight) < 0) return x.id;
  return pool[pool.length - 1].id;
}

// What a wearable is painted in when its wearer rests in the dark: a step lighter than the dimmed body (#1c3a3f), so it
// still shows as a shape against it.
export const DIM_WEARABLE = '#2f6b73';

// Where each worn accessory lands on a sprite: [{ id, dy, pts: [{ x, y, color }] }] in draw order, sprite-local, colors
// before dimming. pal ({ name, main, accent }) is the wearer's palette: recolorable wearables take their automatic colors
// for it, and any other wearable pixel that sits on the body and would blend into it is swapped for a color that does not.
// Worn together, some make room (ROOM): a body item slides down past the face and head items, a halo or spark rises
// above a hat, never above minRow (the screen's top edge, in sprite rows). Each takes the shift that leaves the fewest
// pixels covered, the smallest on a tie. Orbiting ones (the drone, the data aura) pass in front instead of jumping.
const ROOM = { scarf: 1, barcode: 1, kernelpin: 1, halo: -1, spark: -1 };
const ROOM_MAX = 4;
export function placeWorn(list, sprite, { frame = 0, time = 0, pal = null, minRow = -Infinity } = {}) {
  const a = anchorsFor(sprite);
  const touchesBody = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (sprite[y + dy]?.[x + dx] ?? '.') !== '.');
  const pixelsOf = (w) => {
    const acc = accessoryById(w.id);
    const fixed = !acc.colors;
    const pts = [];
    // A fixed color is only swapped where it sits on the pet or right beside it; floating clear of the body (an orbiting
    // echo, a halo) it is seen against the room, where the wearable's own color is fine.
    acc.draw((x, y, color) => pts.push({ x, y, color: fixed && pal && touchesBody(x, y) ? contrastColor(color, pal.main) : color }), a, frame, time, accessoryColors(w.id, w.colors ?? null, pal));
    return pts;
  };
  const worn = wearOrder(list).map((w) => ({ id: w.id, dy: 0, pts: pixelsOf(w) }));
  const key = (x, y) => `${x},${y}`;
  const taken = new Set();
  for (const w of worn) if (!ROOM[w.id]) for (const p of w.pts) taken.add(key(p.x, p.y));
  // Body items settle first (lowest in the draw order), then the risers see them too.
  for (const w of [...worn].filter((x) => ROOM[x.id]).sort((x, y) => ROOM[y.id] - ROOM[x.id])) {
    const dir = ROOM[w.id];
    let best = { dy: 0, hits: Infinity };
    for (let n = 0; n <= ROOM_MAX; n++) {
      const dy = n ? n * dir : 0;
      const ys = w.pts.map((p) => p.y + dy);
      if (n && (Math.min(...ys) < minRow || Math.max(...ys) >= sprite.length)) break;
      const hits = w.pts.filter((p) => taken.has(key(p.x, p.y + dy))).length;
      if (hits < best.hits) best = { dy, hits };
      if (!hits) break;
    }
    w.dy = best.dy;
    w.pts = w.pts.map((p) => ({ ...p, y: p.y + best.dy }));
    for (const p of w.pts) taken.add(key(p.x, p.y));
  }
  return worn;
}

// Draw worn accessories ([{ id, colors }]) onto a canvas context at sprite origin (ox, oy). dim for sleep in the dark.
// minRow keeps a rising accessory on screen: -oy is the screen's top row.
export function drawWorn(ctx, list, sprite, ox, oy, frame = 0, dim = false, time = 0, pal = null) {
  for (const w of placeWorn(list, sprite, { frame, time, pal, minRow: -oy })) {
    for (const p of w.pts) {
      ctx.fillStyle = dim ? DIM_WEARABLE : p.color;
      ctx.fillRect(ox + p.x, oy + p.y, 1, 1);
    }
  }
}

// One accessory: the gallery and the tests draw them alone.
export function drawAccessory(ctx, id, sprite, ox, oy, frame = 0, dim = false, time = 0, custom = null, pal = null) {
  if (accessoryById(id)?.slot === 'prop') return;
  drawWorn(ctx, [{ id, colors: custom }], sprite, ox, oy, frame, dim, time, pal);
}

// Props stand on the LCD floor at the right edge. Returns nothing if the prop has nothing to draw.
export const PROP_FLOOR = 21;
export function drawProp(ctx, id, lcdW, frame = 0, time = 0, extra = null, dim = false) {
  const p = PROPS.find((x) => x.id === id);
  if (!p) return;
  const [w, h] = p.size;
  const ox = lcdW - w - 2;
  const oy = PROP_FLOOR - h;
  p.draw((x, y, color) => {
    ctx.fillStyle = dim ? '#1c3a3f' : color;
    ctx.fillRect(ox + x, oy + y, 1, 1);
  }, frame, time, extra);
}
