// Accessories: cosmetic pixel add-ons drawn over the pet. Every form can wear every accessory:
// placement comes from anchors computed from the sprite's own pixels, not per-form tables.
// Props (PROPS below) are style items too, but sit on the ground beside the pet in their own slot.
// source 'earned' items are granted by events, never sold or dropped.

export const RARITY = {
  common: { weight: 6, hint: 'sold in markets.' },
  rare: { weight: 2, hint: 'rarely sold. sometimes turns up on a run.' },
  veryrare: { weight: 1, hint: 'almost never for sale.' },
};

// Anchors for a sprite (array of strings). Cached per sprite array.
const cache = new WeakMap();
export function anchorsFor(sprite) {
  if (cache.has(sprite)) return cache.get(sprite);
  const w = sprite[0].length;
  const span = (row) => {
    const cols = [...row].map((ch, i) => (ch !== '.' ? i : -1)).filter((i) => i >= 0);
    return cols.length ? { left: cols[0], right: cols[cols.length - 1], count: cols.length } : null;
  };
  const spans = sprite.map(span);
  const top = spans.findIndex(Boolean); // first painted row (antenna tips included)
  // Head top: first row that's clearly body, not antennae or horns.
  let headTop = spans.findIndex((s) => s && s.count >= w * 0.4);
  if (headTop < 0) headTop = top;
  // Eye row: first row at/below the head top holding accent pixels.
  let eyeRow = sprite.findIndex((row, i) => i >= headTop && row.includes('o'));
  if (eyeRow < 0) eyeRow = Math.min(sprite.length - 1, headTop + 2);
  const eyeCols = [...sprite[eyeRow]].map((ch, i) => (ch === 'o' ? i : -1)).filter((i) => i >= 0);
  let bottom = sprite.length - 1;
  while (bottom > eyeRow && !(spans[bottom] && spans[bottom].count >= w * 0.4)) bottom--;
  const mid = Math.min(bottom, eyeRow + Math.max(2, Math.round((bottom - eyeRow) / 2)));
  const head = spans[headTop];
  const body = spans[mid] ?? head;
  // Mouth: first row below the eyes with highlight pixels ('+'); otherwise a guess.
  let mouthRow = sprite.findIndex((row, i) => i > eyeRow && row.includes('+'));
  if (mouthRow < 0) mouthRow = Math.min(bottom, eyeRow + 2);
  const mouthCols = [...sprite[mouthRow]].map((ch, i) => (ch === '+' ? i : -1)).filter((i) => i >= 0);
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
    rarity: 'common',
    colors: [['cap', '#05d9e8']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#05d9e8'];
      for (let x = a.cx - 2; x <= a.cx + 2; x++) px(x, a.headTop - 2, c);
      for (let x = a.cx - 3; x <= a.cx + 5; x++) px(x, a.headTop - 1, c);
    },
  },
  {
    id: 'scarf',
    name: 'Scarf',
    rarity: 'common',
    colors: [['scarf', '#ff2a6d']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#ff2a6d'];
      for (let x = a.bodyLeft; x <= a.bodyRight; x++) px(x, a.mid, c);
      px(a.bodyRight - 1, a.mid + 1, c);
      px(a.bodyRight - 1, a.mid + 2, c);
    },
  },
  {
    id: 'headphones',
    name: 'Headphones',
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
    },
  },
  {
    id: 'visor',
    name: 'Visor',
    rarity: 'rare',
    colors: [
      ['band', '#ff2a6d'],
      ['light', '#ffffff'],
    ],
    draw: (px, a, frame, time, colors) => {
      const [band, light] = colors ?? ['#ff2a6d', '#ffffff'];
      for (let x = a.headLeft; x <= a.headRight; x++) px(x, a.eyeRow, band);
      px(a.headLeft + 1 + (frame % 2) * 2, a.eyeRow, light); // scanning light
    },
  },
  {
    id: 'crown',
    name: 'Crown',
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
    rarity: 'veryrare',
    draw: (px, a, frame) => {
      const y = a.top - 3;
      px(a.cx, y, '#ffffff');
      if (frame % 2) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) px(a.cx + dx, y + dy, '#05d9e8');
    },
  },

  // --- regional ------------------------------------------------------------------------
  {
    id: 'barcode',
    name: 'Corp barcode',
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
    rarity: 'rare',
    regions: ['corp'],
    hint: 'rarely sold in the Corp Grid.',
    draw: (px, a) => {
      for (let x = a.mouthLeft - 1; x <= a.mouthRight + 1; x++) {
        px(x, a.mouthRow, '#c8d0dc');
        px(x, a.mouthRow + 1, (x - a.mouthLeft) % 2 ? '#8a93a3' : '#c8d0dc');
      }
    },
  },
  {
    id: 'cybereye',
    name: 'Cyber eye',
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
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'sold in the Darknet Bazaar.',
    colors: [['mohawk', '#ff2a6d']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#ff2a6d'];
      for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [0, -2], [1, -2], [0, -3]]) px(a.cx + dx, a.headTop + dy, c);
    },
  },
  {
    id: 'neuraljack',
    name: 'Neural jack',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'sold in the Darknet Bazaar.',
    draw: (px, a) => {
      px(a.headLeft, a.eyeRow, '#f9f002'); // the plug
      for (const [dx, dy] of [[-1, 0], [-2, 1], [-2, 2], [-3, 3], [-3, 4]]) px(a.headLeft + dx, a.eyeRow + dy, '#9a9ab8');
    },
  },
  {
    id: 'tattoo',
    name: 'Circuit tattoo',
    rarity: 'common',
    regions: ['bazaar'],
    hint: 'inked in the Darknet Bazaar.',
    colors: [['glow', '#39ff14']],
    draw: (px, a, frame, time, colors) => {
      const [c] = colors ?? ['#39ff14'];
      for (const [dx, dy] of [[0, 2], [0, 3], [1, 3], [1, 4]]) px(a.eyeLeft + dx, a.eyeRow + dy, c);
    },
  },
  {
    id: 'rebreather',
    name: 'Rebreather',
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
    },
  },
  {
    id: 'satdish',
    name: 'Sat-dish antenna',
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
      if (frame % 2) px(x, y - 1, '#39ff14');
    },
  },
];

// --- earned (never sold) ------------------------------------------------------------------
ACCESSORIES.push(
  {
    id: 'partyhat',
    name: 'Party hat',
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
      px(a.cx, a.headTop - 3, c1);
      px(a.cx, a.headTop - 4, '#ffffff');
    },
  },
  {
    id: 'bandage',
    name: 'Bandage',
    rarity: 'rare',
    source: 'earned',
    hint: 'you have to survive something first.',
    draw: (px, a) => {
      const x = a.headRight - 2;
      const y = a.headTop + 1;
      for (const [dx, dy] of [[-1, -1], [0, 0], [1, 1], [1, -1], [-1, 1]]) px(x + dx, y + dy, '#f0e6d8');
      px(x, y, '#ff8fa8');
    },
  },
  // --- more wearables -----------------------------------------------------------------------
  {
    id: 'earpiece',
    name: 'Earpiece',
    rarity: 'common',
    regions: ['corp'],
    hint: 'standard issue in the Corp Grid.',
    draw: (px, a) => {
      px(a.headRight + 1, a.eyeRow, '#3a3f49');
      px(a.headRight + 1, a.eyeRow + 1, '#8a93a3');
      px(a.headRight, a.mouthRow, '#8a93a3');
      px(a.headRight - 1, a.mouthRow, '#ff2a6d'); // mic
    },
  },
  {
    id: 'dataaura',
    name: 'Data aura',
    rarity: 'rare',
    regions: ['ruins'],
    hint: 'echoes cling to runners in the Old Web Ruins.',
    draw: (px, a, frame, time = 0) => {
      const rx = Math.floor((a.headRight - a.headLeft) / 2) + 3;
      const cy = a.eyeRow + 2;
      for (let i = 0; i < 5; i++) {
        const t = time / 1600 + (i * Math.PI * 2) / 5;
        px(a.cx + Math.round(Math.cos(t) * rx), cy + Math.round(Math.sin(t * 1.3) * 5), i % 2 ? '#39ff14' : '#05d9e8');
      }
    },
  },
);
for (const x of ACCESSORIES) x.slot ??= 'wear';

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
    size: [8, 8],
    // extra: { sprite, colors } of the previous netling; drawn at half scale.
    draw: (px, frame, time, extra) => {
      if (!extra?.sprite) return;
      const s = extra.sprite;
      for (let y = 0; y < s.length; y += 2) {
        for (let x = 0; x < s[0].length; x += 2) {
          const c = extra.colors[s[y][x]];
          if (c) px(Math.floor(x / 2), Math.floor(y / 2), c);
        }
      }
    },
  },
];
for (const x of PROPS) x.slot = 'prop';

export const STYLE_ITEMS = [...ACCESSORIES, ...PROPS];

export const accessoryHint = (x) => x.hint ?? RARITY[x.rarity].hint;

// Recolorable accessories declare colors: [[label, default], ...]. Custom picks must be #rrggbb.
export const HEX = /^#[0-9a-f]{6}$/i;
export function accessoryColors(id, custom) {
  const x = accessoryById(id);
  if (!x?.colors) return null;
  return x.colors.map(([, def], i) => (HEX.test(custom?.[i] ?? '') ? custom[i] : def));
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
// from any region, weighted by rarity. A glimpse of what's out there.
export function rollWornAccessory(rng) {
  return pickByRarity(ACCESSORIES.filter((x) => x.source !== 'earned'), rng);
}

function pickByRarity(pool, rng) {
  if (!pool.length) return null;
  const total = pool.reduce((n, x) => n + RARITY[x.rarity].weight, 0);
  let r = rng() * total;
  for (const x of pool) if ((r -= RARITY[x.rarity].weight) < 0) return x.id;
  return pool[pool.length - 1].id;
}

// Draw onto a canvas context at sprite origin (ox, oy). dim for sleep in the dark.
export function drawAccessory(ctx, id, sprite, ox, oy, frame = 0, dim = false, time = 0, custom = null) {
  const acc = accessoryById(id);
  if (!acc) return;
  const a = anchorsFor(sprite);
  const px = (x, y, color) => {
    ctx.fillStyle = dim ? '#1c3a3f' : color;
    ctx.fillRect(ox + x, oy + y, 1, 1);
  };
  acc.draw(px, a, frame, time, accessoryColors(id, custom));
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
