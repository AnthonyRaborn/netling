// Netling 2.0 sprite prototype: one Iron line, baby to elder (four forms). Same string-row format as src/sprites.js ('#' main,
// 'o' accent, '+' highlight, 'x' dim fill, '.' empty). Not shipped and not imported by the game; see docs/NETLING_2_SPRITES.md.
//
// Iron is firmware and infrastructure: blocky, rigid, read-only. Its marks: a write-protect notch in the top edge, square
// shoulders, vent bays, pin feet.
//
// The line is Baby, a street-leaning Teen, Gronk (Breach, street lean) and Gronk's Elder. Baby and the Elder are the same in both
// composition models. The Teen and Gronk are where the models differ: model A (composed) builds them from a body plus
// overlays, model B (authored) draws each in full. An earlier, wider version of this prototype (every teen and adult of the
// egg) is in git history at commit 580db88.

// --- shared stages -------------------------------------------------------------------------------------------------------
export const BABY = {
  a: [
    '............',
    '.####..####.',
    '.##########.',
    '.##########.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '.##########.',
    '.###+##+###.',
    '.##########.',
    '..#.#..#.#..',
    '............',
  ],
  b: [
    '............',
    '............',
    '.####..####.',
    '.##########.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '.##########.',
    '.###+##+###.',
    '.##########.',
    '..#..##..#..',
    '............',
  ],
};

// The elder (mainframe stage) is a variant of the adult it grows from, one elder per adult (decided): this is Gronk's, Gronk grown
// wider (18 columns against 16, 15 rows against 14), keeping its horns, slanted brow, toothed jaw and broad shoulders, as 1.0's
// mainframes keep their line's look. The same in both models, since an elder is authored whole.
export const ELDER = {
  a: [
    '.##............##.',
    '.###.########.###.',
    '..##############..',
    '..##############..',
    '.################.',
    '..#oo########oo#..',
    '..###o######o###..',
    '.################.',
    '.#+#+#+#++#+#+#+#.',
    '##################',
    '####xxx####xxx####',
    '####xxx####xxx####',
    '##################',
    '.################.',
    '.###..######..###.',
  ],
  b: [
    '..................',
    '.##............##.',
    '.###.########.###.',
    '..##############..',
    '.################.',
    '..#oo########oo#..',
    '..###o######o###..',
    '.################.',
    '.#+#+#+#++#+#+#+#.',
    '##################',
    '####xxx####xxx####',
    '####xxx####xxx####',
    '##################',
    '.################.',
    '.##..########..##.',
  ],
};

// --- model A: bodies and overlays ----------------------------------------------------------------------------------------------
// Overlay characters: '#', 'o', '+', 'x' replace the body cell, '_' erases it, '.' leaves it alone. The head moves down a row
// in the B frame, so overlay parts on the head do too.
export const TEEN_BODY = {
  a: [
    '..............',
    '..####..####..',
    '..##########..',
    '..##########..',
    '..##oo##oo##..',
    '..##oo##oo##..',
    '..##########..',
    '..###+##+###..',
    '.############.',
    '.##xx####xx##.',
    '.############.',
    '..##.####.##..',
  ],
  b: [
    '..............',
    '..............',
    '..####..####..',
    '..##########..',
    '..##oo##oo##..',
    '..##oo##oo##..',
    '..##########..',
    '..###+##+###..',
    '.############.',
    '.##xx####xx##.',
    '.############.',
    '.###..##..###.',
  ],
};
export const ADULT_BODY = {
  a: [
    '................',
    '................',
    '..#####..#####..',
    '..############..',
    '..############..',
    '..##oo####oo##..',
    '..##oo####oo##..',
    '..############..',
    '..##+######+##..',
    '.##############.',
    '.##xx######xx##.',
    '.##xx######xx##.',
    '.##############.',
    '..##..####..##..',
  ],
  b: [
    '................',
    '................',
    '................',
    '..#####..#####..',
    '..############..',
    '..##oo####oo##..',
    '..##oo####oo##..',
    '..############..',
    '..##+######+##..',
    '.##############.',
    '.##xx######xx##.',
    '.##xx######xx##.',
    '.##############.',
    '..##.######.##..',
  ],
};

const BLANK = '.'.repeat(16);
const grid = (rows) => Array.from({ length: 14 }, (_, y) => rows[y] ?? BLANK);
const teenGrid = (rows) => Array.from({ length: 12 }, (_, y) => rows[y] ?? '.'.repeat(14));

// Role overlay: Breach adds horn studs, a toothed grille and heavy shoulders.
export const OVERLAYS = {
  breach: {
    a: grid({ 0: '.#............#.', 1: '.##..........##.', 8: '...+.+.++.+.+...', 9: '##............##', 10: '#..............#', 11: '#..............#' }),
    b: grid({ 1: '.#............#.', 2: '.##..........##.', 8: '...+.+.++.+.+...', 9: '##............##', 10: '#..............#', 11: '#..............#' }),
  },
};
// Lean overlay (the Standing lean, option C in the sketch): the street lean is lopsided, a single antenna, a notched head
// corner and a taped patch. It does not use 'x', which is the neglect look's mark.
export const LEAN_OVERLAYS = {
  street: {
    a: grid({ 0: '............#...', 1: '............#...', 2: '__..............', 7: '...+o...........' }),
    b: grid({ 1: '............#...', 2: '............#...', 3: '__..............', 7: '...+o...........' }),
  },
};
export const TEEN_OVERLAYS = {
  street: {
    a: teenGrid({ 0: '..........#...', 6: '...+o.........', 9: '............_.' }),
    b: teenGrid({ 1: '..........#...', 6: '...+o.........', 9: '............_.' }),
  },
};

// --- model B: authored in full -------------------------------------------------------------------------------------------------
export const TEENS = {
  // Option C's other main teen (corp lean): a squared head with an under-eye strip. It differs only slightly from the street teen.
  teenCorp: {
    a: [
      '..............',
      '..####..####..',
      '.############.',
      '.############.',
      '.##oo####oo##.',
      '.##oo####oo##.',
      '.############.',
      '.##++++++++##.',
      '.############.',
      '.##xx####xx##.',
      '.############.',
      '..##.####.##..',
    ],
    b: [
      '..............',
      '..............',
      '..####..####..',
      '.############.',
      '.##oo####oo##.',
      '.##oo####oo##.',
      '.############.',
      '.##++++++++##.',
      '.############.',
      '.##xx####xx##.',
      '.############.',
      '.###..##..###.',
    ],
  },
  // The hidden-path teen (decided: distinct, not marks over the others' outline): taller (13 rows against 12), crowned, with a third
  // eye, a narrow neck over a robed body. It foreshadows Guru, the hidden adult it grows into.
  teenHidden: {
    a: [
      '....#.##.#....',
      '....######....',
      '...########...',
      '...###oo###...',
      '...#oo##oo#...',
      '...#oo##oo#...',
      '...########...',
      '....#+##+#....',
      '.....####.....',
      '..##########..',
      '.#.o######o.#.',
      '...########...',
      '...##....##...',
    ],
    b: [
      '..............',
      '....#.##.#....',
      '....######....',
      '...###oo###...',
      '...#oo##oo#...',
      '...#oo##oo#...',
      '...########...',
      '....#+##+#....',
      '.....####.....',
      '..##########..',
      '..#o######o#..',
      '...########...',
      '....##..##....',
    ],
  },
  teenStreet: {
    a: [
      '..........#...',
      '..####..####..',
      '..##########..',
      '..##########..',
      '..##oo##oo##..',
      '..##oo##oo##..',
      '..##########..',
      '..###+##+###..',
      '.############.',
      '.##xx####xx#..',
      '.############.',
      '..##.####.##..',
    ],
    b: [
      '..............',
      '..........#...',
      '..####..####..',
      '..##########..',
      '..##oo##oo##..',
      '..##oo##oo##..',
      '..##########..',
      '..###+##+###..',
      '.############.',
      '.##xx####xx#..',
      '.############.',
      '.###..##..###.',
    ],
  },
};
export const ADULTS = {
  // Guru (hidden): the tallest, crowned, a third eye and lit seams, the hidden path's adult. 15 rows, the most an adult may be.
  guru: {
    a: [
      '....#.#..#.#....',
      '....########....',
      '...##########...',
      '..############..',
      '..#####oo#####..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '...###+##+###...',
      '....########....',
      '.##############.',
      '.##o########o##.',
      '.##o########o##.',
      '.##############.',
      '..##..####..##..',
    ],
    b: [
      '................',
      '....#.#..#.#....',
      '....########....',
      '...##########...',
      '..#####oo#####..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '...###+##+###...',
      '....########....',
      '.##############.',
      '.##o########o##.',
      '.##o########o##.',
      '.##############.',
      '..##.######.##..',
    ],
  },
  // Gronk (Breach, street lean): broad and low, horned, angry brow, toothed jaw, full-width shoulders.
  gronk: {
    a: [
      '.#............#.',
      '.##..######..##.',
      '..############..',
      '..############..',
      '..############..',
      '..#oo######oo#..',
      '..###o####o###..',
      '.##############.',
      '.#+#+#+##+#+#+#.',
      '################',
      '###xxx####xxx###',
      '###xxx####xxx###',
      '################',
      '.##...####...##.',
    ],
    b: [
      '................',
      '.#............#.',
      '.##..######..##.',
      '..############..',
      '..############..',
      '..#oo######oo#..',
      '..###o####o###..',
      '.##############.',
      '.#+#+#+##+#+#+#.',
      '################',
      '###xxx####xxx###',
      '###xxx####xxx###',
      '################',
      '.##..######..##.',
    ],
  },
};

// Anchor rows for wearables, per sprite and frame (see ANCHOR_ROWS in src/sprites.js). headTop is the first row of the head
// proper, eyeRow the eyes, mouthRow where a mouthpiece sits, neckRow where a scarf goes.
export const ANCHORS = {
  baby: {a: {headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8}, b: {headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8}},
  gronkElder: {a: {headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9}, b: {headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9}},
  // Model A: every form of a stage shares the body's anchors (its premise).
  teenBody: {a: {headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8}, b: {headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8}},
  adultBody: {a: {headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9}, b: {headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9}},
  // Model B: each authored form's own.
  teenStreet: {a: {headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8}, b: {headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8}},
  gronk: {a: {headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9}, b: {headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9}},
  teenCorp: {a: {headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8}, b: {headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8}},
  teenHidden: {a: {headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8}, b: {headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8}},
  guru: {a: {headTop: 2, eyeRow: 5, mouthRow: 8, neckRow: 9}, b: {headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9}},
};
