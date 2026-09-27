// Accessories: cosmetic pixel add-ons drawn over the pet. Every form can wear every accessory:
// placement comes from anchors computed from the sprite's own pixels, not per-form tables.

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
  };
  cache.set(sprite, a);
  return a;
}

// Each draw(px, a, frame) paints with px(x, y, color) in sprite-local coordinates.
export const ACCESSORIES = [
  {
    id: 'cap',
    name: 'Cap',
    rarity: 'common',
    draw: (px, a) => {
      for (let x = a.cx - 2; x <= a.cx + 2; x++) px(x, a.headTop - 2, '#05d9e8');
      for (let x = a.cx - 3; x <= a.cx + 5; x++) px(x, a.headTop - 1, '#05d9e8');
    },
  },
  {
    id: 'scarf',
    name: 'Scarf',
    rarity: 'common',
    draw: (px, a) => {
      for (let x = a.bodyLeft; x <= a.bodyRight; x++) px(x, a.mid, '#ff2a6d');
      px(a.bodyRight - 1, a.mid + 1, '#ff2a6d');
      px(a.bodyRight - 1, a.mid + 2, '#ff2a6d');
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
    draw: (px, a) => {
      for (const x of a.eyeCols) {
        px(x, a.eyeRow, '#050508');
        px(x, a.eyeRow + 1, '#050508');
      }
      for (let x = a.eyeLeft; x <= a.eyeRight; x++) px(x, a.eyeRow, '#050508');
      px(a.eyeLeft, a.eyeRow, '#5d7a80'); // glint
    },
  },
  {
    id: 'visor',
    name: 'Visor',
    rarity: 'rare',
    draw: (px, a, frame) => {
      for (let x = a.headLeft; x <= a.headRight; x++) px(x, a.eyeRow, '#ff2a6d');
      px(a.headLeft + 1 + (frame % 2) * 2, a.eyeRow, '#ffffff'); // scanning light
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
];

export const accessoryById = (id) => ACCESSORIES.find((x) => x.id === id);

// Pick an accessory the player doesn't own yet, weighted by rarity, or null.
export function rollAccessory(exclude, rng) {
  const pool = ACCESSORIES.filter((x) => !exclude.includes(x.id));
  if (!pool.length) return null;
  const total = pool.reduce((n, x) => n + RARITY[x.rarity].weight, 0);
  let r = rng() * total;
  for (const x of pool) if ((r -= RARITY[x.rarity].weight) < 0) return x.id;
  return pool[pool.length - 1].id;
}

// Draw onto a canvas context at sprite origin (ox, oy). dim for sleep in the dark.
export function drawAccessory(ctx, id, sprite, ox, oy, frame = 0, dim = false) {
  const acc = accessoryById(id);
  if (!acc) return;
  const a = anchorsFor(sprite);
  const px = (x, y, color) => {
    ctx.fillStyle = dim ? '#1c3a3f' : color;
    ctx.fillRect(ox + x, oy + y, 1, 1);
  };
  acc.draw(px, a, frame);
}
