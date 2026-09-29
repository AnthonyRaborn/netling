// Pixel sprites as string rows. '#' = main color, 'o' = accent, '+' = highlight, 'x' = dim fill (a darkened main color,
// used for the inside of the Shell's casing), '.' = empty.
import { blend } from './colors.js';

// The colors of a living netling's sprite marks in palette `pal` ({ main, accent }).
export const paletteColors = (pal) => ({ '#': pal.main, o: pal.accent, '+': '#f5f5f5', x: blend(pal.main, 0.3, '#000000') });

export const SPRITES = {
  script: [
    '#######...',
    '#.....##..',
    '#.....#.#.',
    '#.....####',
    '#........#',
    '#.o....o.#',
    '#o..++..o#',
    '#.o....o.#',
    '#........#',
    '#........#',
    '##########',
  ],
  bitlingA: [
    '....#..#....',
    '....o..o....',
    '...######...',
    '..########..',
    '.##########.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '.##########.',
    '.###+##+###.',
    '..########..',
    '..#.#..#.#..',
    '............',
  ],
  bitlingB: [
    '............',
    '....#..#....',
    '...#o##o#...',
    '..########..',
    '.##########.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '.##########.',
    '.###++++###.',
    '..########..',
    '.#..#..#..#.',
    '............',
  ],
  bitlingSleep: [
    '............',
    '............',
    '............',
    '...######...',
    '..########..',
    '.##########.',
    '.#oo####oo#.',
    '.##########.',
    '.##########.',
    '..########..',
    '..#.#..#.#..',
    '............',
  ],
  bitlingDead: [
    '............',
    '............',
    '...######...',
    '..########..',
    '.##########.',
    '.#o#o##o#o#.',
    '.##o####o##.',
    '.#o#o##o#o#.',
    '.##########.',
    '..########..',
    '..#.#..#.#..',
    '............',
  ],
  kernelA: [
    '....#....#....',
    '....o....o....',
    '..##########..',
    '#.##########.#',
    '..##oo##oo##..',
    '#.##oo##oo##.#',
    '..##########..',
    '#.####++####.#',
    '..##########..',
    '....#....#....',
    '...##....##...',
  ],
  kernelB: [
    '..............',
    '....#....#....',
    '..###o##o###..',
    '..##########..',
    '#.##oo##oo##.#',
    '..##oo##oo##..',
    '#.##########.#',
    '..###++++###..',
    '#.##########.#',
    '....#....#....',
    '..##......##..',
  ],
  stubA: [
    '......#.......',
    '......o.......',
    '....#####.#...',
    '...#######....',
    '..###.######..',
    '..#oo####o.#..',
    '..#oo####oo#..',
    '..#######.##..',
    '..###+++####..',
    '...##.#####...',
    '...#......#...',
    '..##.......#..',
  ],
  stubB: [
    '..............',
    '......#.......',
    '....##o##.#...',
    '...#######....',
    '..####.#####..',
    '..#oo####oo#..',
    '..#o.####oo#..',
    '..##.#######..',
    '..###+++####..',
    '...#######.#..',
    '...#......#...',
    '...#......##..',
  ],
  // The Shell: a hollow, cracked casing; the eyes float inside it and drift between frames. The inside is a dim fill ('x'),
  // so the casing reads as a solid shape with a dark void in it rather than an outline.
  shellA: [
    '.....####.....',
    '...###xx###...',
    '..##xxxxxx##..',
    '.##xxxxxxxx##.',
    '.#xxooxxooxx#.',
    '.#xxooxxooxx#.',
    '.#xxxx++xxxx#.',
    '.##xxxxxxxx##.',
    '..###xxxx###..',
    '..#.######.#..',
    '..#.#....#.#..',
    '.##.#....#.##.',
  ],
  shellB: [
    '.....####.....',
    '...###xx###...',
    '..##xxxxxx##..',
    '.##xxxxxxxx##.',
    '.#xxxooxxoox#.',
    '.#xxxooxxoox#.',
    '.#xxxxx++xxx#.',
    '.##xxxxxxxx##.',
    '..###xxxx###..',
    '..#.######.#..',
    '.##.#....#.##.',
    '..#.#....#.#..',
  ],
  chromeA: [
    '......####......',
    '....########....',
    '...##########...',
    '..############..',
    '..#oooooooooo#..',
    '..#o++oooo++o#..',
    '..############..',
    '...##########...',
    '....#+####+#....',
    '..############..',
    '.##############.',
    '.#.##########.#.',
    '.#.##########.#.',
    '...###....###...',
    '...##......##...',
  ],
  chromeB: [
    '......####......',
    '....########....',
    '...##########...',
    '..############..',
    '..#oooooooooo#..',
    '..#oo++oo++oo#..',
    '..############..',
    '...##########...',
    '....#+####+#....',
    '..############..',
    '.##############.',
    '.#.##########.#.',
    '..#.########.#..',
    '...###....###...',
    '...##......##...',
  ],
  firewallA: [
    '..#..........#..',
    '..##.######.##..',
    '..############..',
    '.##############.',
    '.#+##+####+##+#.',
    '.##############.',
    '.##oo######oo##.',
    '.##oo######oo##.',
    '.##############.',
    '.#+##+####+##+#.',
    '..############..',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
  ],
  firewallB: [
    '..............',
    '..#..........#..',
    '..##.######.##..',
    '.##############.',
    '.#+##+####+##+#.',
    '.##############.',
    '.##oo######oo##.',
    '.##oo######oo##.',
    '.##############.',
    '.##+##+##+##+##.',
    '..############..',
    '...##########...',
    '....########....',
    '.....######.....',
    '......####......',
  ].map((r) => r.padEnd(16, '.')),
  daemonA: [
    '.#............#.',
    '.##..........##.',
    '..##.######.##..',
    '...##########...',
    '..############..',
    '..##oo####oo##..',
    '..###oo##oo###..',
    '..############..',
    '...##+#++#+##...',
    '....########....',
    '...##########...',
    '..###.####.###..',
    '..##..####..##..',
    '.##...#..#...##.',
  ],
  daemonB: [
    '#..............#',
    '.##..........##.',
    '..##.######.##..',
    '...##########...',
    '..############..',
    '..##oo####oo##..',
    '..###oo##oo###..',
    '..############..',
    '...##+####+##...',
    '....########....',
    '...##########...',
    '..###.####.###..',
    '..##..####..##..',
    '.##...#..#...##.',
  ],
  glitchA: [
    '....#.....#.....',
    '.....########...',
    '...#########....',
    '..##########.#..',
    '.....##oo###oo#.',
    '..#oo####oo##...',
    '..###########...',
    '....##########..',
    '.##+.++##+##....',
    '...#########....',
    '.....#.#.#.#....',
    '...#...#...#.#..',
  ],
  glitchB: [
    '......#.....#...',
    '...########.....',
    '....#########...',
    '.#.##########...',
    '..#oo####oo##...',
    '.....##oo###oo#.',
    '...###########..',
    '..##########....',
    '....##+.++##+##.',
    '....#########...',
    '...#.#.#.#......',
    '.#...#...#...#..',
  ],
  ghostA: [
    '.....######.....',
    '...##########...',
    '..############..',
    '.##############.',
    '.###oo####oo###.',
    '.###oo####oo###.',
    '.##############.',
    '.#####+##+#####.',
    '.##############.',
    '.##############.',
    '.##############.',
    '.#.###.##.###.#.',
    '.#..#..##..#..#.',
  ],
  ghostB: [
    '.....######.....',
    '...##########...',
    '..############..',
    '.##############.',
    '.###oo####oo###.',
    '.###oo####oo###.',
    '.##############.',
    '.######++######.',
    '.##############.',
    '.##############.',
    '.##############.',
    '.##.###..###.##.',
    '..#..#....#..#..',
  ],
  cache: ['###.', '#..#', '#oo#', '#..#', '####'],
  virus: ['.#.#.', '#####', '#o#o#', '#####', '.#.#.'],
  eye: ['..###..', '.#ooo#.', '#oo#oo#', '.#ooo#.', '..###..'],
  z: ['####', '..#.', '.#..', '####'],
  bang: ['#', '#', '#', '.', '#'],
};

// 7x7 inventory icons. '#' = item color, 'o' = dim fill, '+' = highlight.
export const ITEM_SPRITES = {
  coolant: ['..###..', '.#ooo#.', '.#+oo#.', '.#ooo#.', '.#+oo#.', '.#ooo#.', '..###..'],
  antivirus: ['.#####.', '#ooooo#', '#oo+oo#', '#o+++o#', '#oo+oo#', '.#ooo#.', '..###..'],
  voucher: ['.......', '#######', '#o+o+o#', '##ooo##', '#o+o+o#', '#######', '.......'],
  blackice: ['...#...', '..#o#..', '.#oo+#.', '#ooo+o#', '.#ooo#.', '..#o#..', '...#...'],
  booster: ['...#...', '.#.#.#.', '#..#..#', '.#.#.#.', '...#...', '..###..', '.#####.'],
  memory: ['#.#.#.#', '.#####.', '##o+o##', '.#ooo#.', '##o+o##', '.#####.', '#.#.#.#'],
  repair: ['.#...#.', '.##.##.', '..#+#..', '...#...', '..#+#..', '.##.##.', '.#...#.'],
  overclock: ['.#.#.#.', '#######', '.#o+o#.', '##+++##', '.#o+o#.', '#######', '.#.#.#.'],
  segfault: ['.#####.', '#oo.oo#', '#o.#.o#', '#.#+#.#', '#o.#.o#', '#oo.oo#', '.#####.'],
};

export const ITEM_COLORS = {
  coolant: '#05d9e8',
  antivirus: '#39ff14',
  voucher: '#f9f002',
  blackice: '#ff2a6d',
  booster: '#b967ff',
  memory: '#c7f9ff',
  repair: '#ff9f1c',
  overclock: '#f9f002',
  segfault: '#ff4040',
};

// Frame lookup per form; falls back to frame A for missing sleep/dead poses.
export function formSprite(form, pose) {
  const a = SPRITES[`${form}A`] ?? SPRITES.bitlingA;
  if (pose === 'b') return SPRITES[`${form}B`] ?? a;
  if (pose === 'sleep') return SPRITES[`${form}Sleep`] ?? a;
  if (pose === 'dead') return SPRITES[`${form}Dead`] ?? a;
  return a;
}

export function drawSprite(ctx, rows, x, y, colors) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const color = colors[row[c]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + c, y + r, 1, 1);
    }
  }
}

// --- colors of the sprite marks in the states a netling is drawn in ------------------------------------------------------
export const DEAD_COLORS = { '#': '#3a4a4d', o: '#1c2a2d', '+': '#3a4a4d', x: '#27363a' };
export const DIM_COLORS = { '#': '#1c3a3f', o: '#0f2528', '+': '#1c3a3f', x: '#12292d' }; // resting in the dark
export const POWERED_DOWN_COLORS = { '#': '#1c3a3f', o: '#2f6b73', '+': '#2f6b73', x: '#12292d' }; // crashed and rebooting
export const LOCKED_COLORS = { '#': '#1c3a3f', o: '#1c3a3f', '+': '#1c3a3f', x: '#1c3a3f' }; // a form not yet discovered
export const WHITE_COLORS = { '#': '#ffffff', o: '#ffffff', '+': '#ffffff', x: '#ffffff' }; // the evolution strobe

// --- authored anchor rows ---------------------------------------------------------------------------------------------
// Rows a wearable is placed by, per form and pose (a, b, sleep); a missing pose uses the form's A frame. headTop: the
// first row of the head proper (not antennae or horns). eyeRow: the row the eyes are on. mouthRow: where a mouthpiece
// sits. neckRow: where a scarf goes. accessories.js reads these (anchorsFor); they live here, beside the art they
// describe, because the generated poses below need the eye rows too. Guessing eyeRow from "the first row with an accent
// pixel" failed on the small forms, whose B frames put an accent pixel in the top of the head, so eye wearables jumped
// up to four rows between frames.
export const ANCHOR_ROWS = {
  bitling: {
    a: { headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9 },
    sleep: { headTop: 3, eyeRow: 6, mouthRow: 8, neckRow: 9 },
  },
  kernel: { a: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 }, sleep: { headTop: 2, eyeRow: 5, mouthRow: 7, neckRow: 8 } },
  stub: { a: { headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9 }, sleep: { headTop: 2, eyeRow: 6, mouthRow: 8, neckRow: 9 } },
  shell: { a: { headTop: 1, eyeRow: 4, mouthRow: 6, neckRow: 8 }, sleep: { headTop: 1, eyeRow: 5, mouthRow: 6, neckRow: 8 } },
  chrome: { a: { headTop: 1, eyeRow: 4, mouthRow: 6, neckRow: 8 }, sleep: { headTop: 1, eyeRow: 5, mouthRow: 6, neckRow: 8 } },
  firewall: {
    a: { headTop: 1, eyeRow: 6, mouthRow: 8, neckRow: 10 },
    b: { headTop: 2, eyeRow: 6, mouthRow: 8, neckRow: 10 },
    sleep: { headTop: 1, eyeRow: 7, mouthRow: 8, neckRow: 10 },
  },
  daemon: { a: { headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9 }, sleep: { headTop: 2, eyeRow: 6, mouthRow: 8, neckRow: 9 } },
  glitch: { a: { headTop: 1, eyeRow: 4, mouthRow: 8, neckRow: 9 }, sleep: { headTop: 1, eyeRow: 5, mouthRow: 8, neckRow: 9 } },
  ghost: { a: { headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8 }, sleep: { headTop: 1, eyeRow: 5, mouthRow: 7, neckRow: 8 } },
};
export const anchorRowsFor = (form, pose) => ANCHOR_ROWS[form]?.[pose] ?? ANCHOR_ROWS[form]?.a ?? null;

// --- generated poses: dead (X eyes) and asleep (closed eyes) -----------------------------------------------------------
// Bitling has both drawn by hand. Every other form gets them from its A frame: each eye (a connected group of accent
// cells on the eye rows) becomes an X when dead and a slit when asleep. The Shell's void fill ('x') takes the place of
// the eye. Chrome's eyes are one wide visor band and Glitch's are double images, so those two are handled by hand below.
const NEIGHBOURS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function eyeGroups(rows, eyeRow) {
  const seen = new Set();
  const groups = [];
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== 'o' || seen.has(`${x},${y}`)) return;
      const cells = [];
      const stack = [[x, y]];
      seen.add(`${x},${y}`);
      while (stack.length) {
        const [cx, cy] = stack.pop();
        cells.push([cx, cy]);
        for (const [dx, dy] of NEIGHBOURS) {
          const key = `${cx + dx},${cy + dy}`;
          if (rows[cy + dy]?.[cx + dx] === 'o' && !seen.has(key)) {
            seen.add(key);
            stack.push([cx + dx, cy + dy]);
          }
        }
      }
      if (cells.some(([, cy]) => cy === eyeRow || cy === eyeRow + 1)) groups.push(cells);
    }),
  );
  return groups;
}
const stampX = (g, cx, cy, ch) => {
  for (const [dx, dy] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) if (g[cy + dy]?.[cx + dx] !== undefined) g[cy + dy][cx + dx] = ch;
};
// The middle of an eye group, rounded away from the sprite's centre line so the two X's of a pair keep a gap between them.
const centre = (cells, width) => {
  const mx = cells.reduce((n, [x]) => n + x, 0) / cells.length;
  const my = cells.reduce((n, [, y]) => n + y, 0) / cells.length;
  const mid = (width - 1) / 2;
  return [mx < mid ? Math.floor(mx) : mx > mid ? Math.ceil(mx) : Math.round(mx), Math.round(my)];
};

function generatedPose(form, pose) {
  const src = SPRITES[`${form}A`];
  const g = src.map((r) => [...r]);
  const fill = form === 'shell' ? 'x' : '#';
  const groups = eyeGroups(src, ANCHOR_ROWS[form].a.eyeRow);
  if (form === 'chrome') {
    const bandTop = pose === 'dead' ? 3 : 4;
    for (let y = 3; y <= 5; y++) for (let x = 3; x <= 12; x++) if (g[y][x] === 'o' || g[y][x] === '+') g[y][x] = y >= bandTop ? 'o' : '#';
    if (pose === 'dead') {
      for (let x = 4; x <= 11; x++) g[3][x] = 'o'; // a taller visor, room for an X on each side
      for (const cx of [5, 10]) stampX(g, cx, 4, '#');
    } else {
      for (let x = 3; x <= 12; x++) g[4][x] = '#'; // the visor dims to a slit
    }
  } else if (form === 'glitch') {
    // Two eyes on row 5, each with a shifted double image on row 4.
    for (const cells of groups) for (const [x, y] of cells) if (pose === 'dead' || y === 4) g[y][x] = fill;
    if (pose === 'dead') for (const cx of [4, 10]) stampX(g, cx, 5, 'o');
  } else {
    for (const cells of groups) {
      for (const [x, y] of cells) g[y][x] = fill;
      if (pose === 'dead') {
        const [cx, cy] = centre(cells, src[0].length);
        stampX(g, cx, cy, 'o');
      } else {
        const bottom = Math.max(...cells.map(([, y]) => y));
        for (const [x, y] of cells) if (y === bottom) g[y][x] = 'o';
      }
    }
  }
  return g.map((r) => r.join(''));
}
for (const form of Object.keys(ANCHOR_ROWS)) {
  if (form === 'bitling') continue;
  SPRITES[`${form}Dead`] ??= generatedPose(form, 'dead');
  SPRITES[`${form}Sleep`] ??= generatedPose(form, 'sleep');
}
