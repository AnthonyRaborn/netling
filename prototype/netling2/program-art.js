// Netling 2.0 sprite prototype: the Program egg, baby and teens. Same string-row format as src/sprites.js ('#' main, 'o' accent,
// '+' highlight, 'x' dim fill, '.' empty). Not shipped; see docs/NETLING_2_SPRITES.md.
//
// Program is the original line, so it starts from 1.0's art (maintainer's call): the baby is 1.0's Bitling, the corp-lean teen is
// 1.0's Kernel, the hidden-path teen is 1.0's Shell (1.0's hidden teen, which grows into the Ghost). Only the street-lean teen is
// new, a lopsided Kernel, as Iron's street teen is a lopsided corp teen. 1.0's Stub (the teen that faults picked) has no slot: faults
// no longer choose a teen form.
//
// The one change the 2.0 rules force: a form's head, eyes, mouth and neck must not move between the A and B frames (so no wearable
// bobs), and 1.0's Bitling, Kernel and Shell B frames move them. `frozen` keeps 1.0's A frame down to the feet and takes only
// 1.0's own lower rows from its B frame, so the art is still 1.0's, with the animation limited to the legs.
import { SPRITES, ANCHOR_ROWS } from '../../src/sprites.js';

// A with its rows from `fromRow` down replaced by B's.
const frozen = (a, b, fromRow) => ({ a, b: a.map((row, y) => (y >= fromRow ? b[y] : row)) });

const KERNEL = frozen(SPRITES.kernelA, SPRITES.kernelB, 9);

export const PROGRAM_BABY = frozen(SPRITES.bitlingA, SPRITES.bitlingB, 10);
export const PROGRAM_TEENS = {
  teenCorp: KERNEL,
  // The street lean: Kernel's blocky body, kept whole, with a spiked mohawk, a dark unibrow across the forehead, arms that are elongated
  // exclamation points (a bar and a dot, set off from the body) and wide boots. This is the second candidate of the fifth pass, which the
  // maintainer preferred to the horned one: the earlier passes (0.94, and two with parts cut away, then a horned one) read as
  // broken or as a different creature. The head top still covers both eyes.
  teenStreet: {
    a: [
      '...#.#..#.#...',
      '...####o####..',
      '..##########..',
      '#x##xxxxxx##x#',
      '#.##oo##oo##.#',
      '#.##oo##oo##.#',
      '..##########..',
      '#.####++####.#',
      '..##########..',
      '....#....#....',
      '..###....###..',
    ],
    b: [
      '...#.#..#.#...',
      '...####o####..',
      '..##########..',
      '#x##xxxxxx##x#',
      '#.##oo##oo##.#',
      '#.##oo##oo##.#',
      '..##########..',
      '#.####++####.#',
      '..##########..',
      '....#....#....',
      '.###......###.',
    ],
  },
  // 1.0's own B frame swaps the last two rows, which leaves a last row too thin (4 of 14 cells, under the 0.4 the wearable code needs
  // to find the body's bottom), so the wearables would move. Here the two foot rows widen outward instead and the last row stays.
  teenHidden: {
    a: SPRITES.shellA,
    b: SPRITES.shellA.map((row, y) => (y === 9 ? '.##.######.##.' : y === 10 ? '.##.#....#.##.' : row)),
  },
};

// --- adults ---------------------------------------------------------------------------------------------------------------------
// Option C: two named forms per role (corp lean, then street lean) and the hidden form. Program's naming (Tiger and Worm for Breach,
// Mouse and Spoof for Dodge, Parse and Phreak for Tune, Gobble and Snarf for Feast, Ghost hidden) is in the sketch. Only Ghost has a
// 1.0 slot (1.0's hidden adult, which the hidden teen Shell grows into); the eight role forms are new, drawn on 1.0's language
// (rounded bodies, antennae, 2x2 accent eyes), the corp lean tidy and symmetric and the street lean ragged, as with the teens.
//
// Rules each one follows (see NETLING_2_SPRITES.md, Rules the tests enforce): 16 columns, no more than 14 rows; rows 0 to neckRow are
// identical in A and B (only the lower body animates); the last row with 0.4 of the width painted is the same row in both frames.
export const PROGRAM_ADULTS = {
  // Tiger (Breach, corp): a tiger team, striped: broad shoulders, arms apart, fangs, cheek and flank stripes.
  tiger: {
    a: [
      '..##........##..',
      '..####....####..',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '.##x########x##.',
      '..###+####+###..',
      '..############..',
      '################',
      '#x############x#',
      '#.############.#',
      '#.####....####.#',
      '..##........##..',
    ],
    b: [
      '..##........##..',
      '..####....####..',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '.##x########x##.',
      '..###+####+###..',
      '..############..',
      '################',
      '#x############x#',
      '#.############.#',
      '#.####....####.#',
      '...##......##...',
    ],
  },
  // Worm (Breach, street): a head with jaws on a narrower column, striped down the body (the stripes step between frames) and a tail that swishes.
  worm: {
    a: [
      '......#..#......',
      '.....######.....',
      '....########....',
      '...##########...',
      '...##oo##oo##...',
      '...##oo##oo##...',
      '....########....',
      '...#+#+##+#+#...',
      '....########....',
      '....########....',
      '....xxxxxxxx....',
      '....########....',
      '....xxxxxxxx....',
      '.....######.....',
    ],
    b: [
      '......#..#......',
      '.....######.....',
      '....########....',
      '...##########...',
      '...##oo##oo##...',
      '...##oo##oo##...',
      '....########....',
      '...#+#+##+#+#...',
      '....########....',
      '....########....',
      '....########....',
      '....xxxxxxxx....',
      '....########....',
      '...######.......',
    ],
  },
  // Mouse (Dodge, corp): small and round, big round ears, a nose, thin legs and a tail that flicks.
  mouse: {
    a: [
      '..####....####..',
      '.######..######.',
      '.######..######.',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '.##############.',
      '..#####++#####..',
      '...##########...',
      '..############..',
      '..############.#',
      '...##......##.#.',
    ],
    b: [
      '..####....####..',
      '.######..######.',
      '.######..######.',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '.##############.',
      '..#####++#####..',
      '...##########...',
      '..############..',
      '..############..',
      '....##....##..##',
    ],
  },
  // Spoof (Dodge, street): hooded and half masked (the left half of the face is dim), a cape with a ragged hem.
  spoof: {
    a: [
      '.......##.......',
      '......####......',
      '.....######.....',
      '....########....',
      '...xxxx#####....',
      '...xxoo##oo##...',
      '...xxoo##oo##...',
      '...xxx##++##....',
      '....########....',
      '.....######.....',
      '...##########...',
      '..############..',
      '..############..',
      '.##..##.##.#....',
    ],
    b: [
      '.......##.......',
      '......####......',
      '.....######.....',
      '....########....',
      '...xxxx#####....',
      '...xxoo##oo##...',
      '...xxoo##oo##...',
      '...xxx##++##....',
      '....########....',
      '.....######.....',
      '...##########...',
      '..############..',
      '..############..',
      '..##.#.##..#.#..',
    ],
  },
  // Parse (Tune, corp): a screen for a head with bracket antennae and a line of text for a mouth, on a slim stand.
  parse: {
    a: [
      '#.#..........#.#',
      '.#............#.',
      '..############..',
      '..############..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '..#++++##++++#..',
      '..############..',
      '...##########...',
      '...#x######x#...',
      '...##########...',
      '....###..###....',
      '....##....##....',
    ],
    b: [
      '#.#..........#.#',
      '.#............#.',
      '..############..',
      '..############..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '..#++++##++++#..',
      '..############..',
      '...##########...',
      '...#x######x#...',
      '...##########...',
      '....###..###....',
      '...##......##...',
    ],
  },
  // Phreak (Tune, street): a narrow head between two huge headphone cups, and a cable that sways.
  phreak: {
    a: [
      '.....######.....',
      '....########....',
      '....########....',
      '###.########.###',
      '#x#.#oo##oo#.#x#',
      '#x#.#oo##oo#.#x#',
      '#x#.########.#x#',
      '###.##+##+##.###',
      '....########....',
      '.#..########....',
      '.#..########....',
      '.##.#########...',
      '....###..###....',
      '....##....##....',
    ],
    b: [
      '.....######.....',
      '....########....',
      '....########....',
      '###.########.###',
      '#x#.#oo##oo#.#x#',
      '#x#.#oo##oo#.#x#',
      '#x#.########.#x#',
      '###.##+##+##.###',
      '....########....',
      '.#..########....',
      '..#.########....',
      '..#.#########...',
      '....###..###....',
      '...##......##...',
    ],
  },
  // Gobble (Feast, corp): a small neat head on a big round belly; the wide mouth sits right under the eyes, teeth over a dark maw.
  gobble: {
    a: [
      '.....######.....',
      '....########....',
      '...##########...',
      '...##oo##oo##...',
      '...##oo##oo##...',
      '...#++++++++#...',
      '....#xxxxxx#....',
      '....########....',
      '..############..',
      '.##############.',
      '################',
      '################',
      '.##############.',
      '..##........##..',
    ],
    b: [
      '.....######.....',
      '....########....',
      '...##########...',
      '...##oo##oo##...',
      '...##oo##oo##...',
      '...#++++++++#...',
      '....#xxxxxx#....',
      '....########....',
      '..############..',
      '.##############.',
      '.##############.',
      '.##############.',
      '.##############.',
      '...##......##...',
    ],
  },
  // Snarf (Feast, street): almost all jaw: a wide head split by a dark maw with teeth above and below, on a small body.
  snarf: {
    a: [
      '...##......##...',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '################',
      '#+#+#+#++#+#+#+#',
      '#xxxxxxxxxxxxxx#',
      '#+#+#+#++#+#+#+#',
      '.##############.',
      '..############..',
      '...##########...',
      '...###....###...',
      '...##......##...',
    ],
    b: [
      '...##......##...',
      '..############..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '################',
      '#+#+#+#++#+#+#+#',
      '#xxxxxxxxxxxxxx#',
      '#+#+#+#++#+#+#+#',
      '.##############.',
      '..############..',
      '...##########...',
      '...###....###...',
      '..##........##..',
    ],
  },
  // Ghost (hidden): 1.0's Ghost. B keeps the head (1.0's moves the mouth) and only shifts the hem's first row; the last row stays as it
  // is (1.0's B thins it, which would move the body's bottom a row).
  ghost: {
    a: SPRITES.ghostA,
    b: SPRITES.ghostA.map((row, y) => (y === 11 ? '.##.###..###.##.' : row)),
  },
};

// Authored anchor rows (headTop, eyeRow, mouthRow, neckRow), the same in A and B and asleep.
const rows4 = (headTop, eyeRow, mouthRow, neckRow) => ({ headTop, eyeRow, mouthRow, neckRow });
export const PROGRAM_ADULT_ANCHORS = {
  tiger: rows4(2, 4, 7, 8),
  worm: rows4(2, 4, 7, 8),
  mouse: rows4(3, 5, 8, 9),
  spoof: rows4(3, 5, 7, 9),
  parse: rows4(2, 4, 7, 8),
  phreak: rows4(2, 4, 7, 8),
  gobble: rows4(2, 3, 5, 7),
  snarf: rows4(1, 3, 6, 8),
  ghost: rows4(1, 4, 7, 8),
};

// --- elders ---------------------------------------------------------------------------------------------------------------------
// One elder per adult (decided), drawn by hand the way Iron's were (the maintainer chose this over stretching each adult): 18 columns
// against 16, one row taller or so (never past 15), keeping the adult's own marks and growing a feature of its own. Rows 0 to the neck row
// are identical in A and B and the body's bottom is the same row in both. Anchors follow each drawing. `swap(rows, from, tail)` replaces
// the rows from `from` down, which is how each B frame is the A frame with only its lower body changed.
const pair = (a, b) => ({ a, b });
export const PROGRAM_ELDER_ANCHORS = {
  tigerElder: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  wormElder: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  mouseElder: { headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9 },
  spoofElder: { headTop: 4, eyeRow: 6, mouthRow: 8, neckRow: 10 },
  parseElder: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  phreakElder: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  gobbleElder: { headTop: 2, eyeRow: 3, mouthRow: 5, neckRow: 7 },
  snarfElder: { headTop: 1, eyeRow: 3, mouthRow: 6, neckRow: 8 },
  ghostElder: { headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8 },
};
const swap = (rows, from, tail) => rows.map((r, y) => tail[y - from] ?? r);

const tigerA = [
  '..##..........##..',
  '..####......####..',
  '..##############..',
  '.################.',
  '.##oo########oo##.',
  '.##oo########oo##.',
  '.##x##########x##.',
  '..###+######+###..',
  '..##############..',
  '##################',
  '#x##############x#',
  '#.##############.#',
  '#.##x########x##.#',
  '#.####......####.#',
  '..##..........##..',
];
const wormA = [
  '.....#..##..#.....',
  '.....########.....',
  '....##########....',
  '...############...',
  '...##oo####oo##...',
  '...##oo####oo##...',
  '....##########....',
  '...#+#+####+#+#...',
  '....##########....',
  '.....########.....',
  '.....xxxxxxxx.....',
  '.....########.....',
  '.....xxxxxxxx.....',
  '.....########.....',
  '......######......',
];
// Mouse's elder keeps one ear whole and tall and wears the other torn: a notch bitten out of its top, a tag on it, set lower.
const mouseA = [
  '..#####...........',
  '.#######...#.####.',
  '.#######..###x###.',
  '..##############..',
  '.################.',
  '.##oo########oo##.',
  '.##oo########oo##.',
  '.################.',
  '#.######++######.#',
  '...############...',
  '..##############..',
  '..##############..',
  '..##############.#',
  '...##........##.#.',
];
const spoofA = [
  '........##........',
  '.......####.......',
  '......######......',
  '.....########.....',
  '....##########....',
  '...xxxxx#######...',
  '...xxoo####oo##...',
  '...xxoo####oo##...',
  '...xxxx##++##.....',
  '....##########....',
  '.....########.....',
  '...############...',
  '..##############..',
  '.################.',
  '.##..##..##..##...',
];
const parseA = [
  '##.#..........#.##',
  '.##............##.',
  '...############...',
  '...############...',
  '...#oo######oo#...',
  '...#oo######oo#...',
  '...############...',
  '...++++####++++...',
  '...############...',
  '...############...',
  '....#x######x#....',
  '....##########....',
  '....##########....',
  '....###....###....',
  '....##......##....',
];
const phreakA = [
  '.....########.....',
  '....##########....',
  '....##########....',
  '###.##########.###',
  '#x#.#oo####oo#.#x#',
  '#x#.#oo####oo#.#x#',
  '#x#.##########.#x#',
  '###.##+####+##.###',
  '....##########....',
  '.#..##########..#.',
  '.#..##########..#.',
  '.##.##########.##.',
  '....##########....',
  '....###....###....',
  '....##......##....',
];
const gobbleA = [
  '......######......',
  '....##########....',
  '...############...',
  '...##oo####oo##...',
  '...##oo####oo##...',
  '...#++++++++++#...',
  '....#xxxxxxxx#....',
  '....##########....',
  '..##############..',
  '.################.',
  '##################',
  '########xx########',
  '##################',
  '.################.',
  '..###........###..',
];
const snarfA = [
  '..###........###..',
  '..##############..',
  '.################.',
  '.##oo########oo##.',
  '.##oo########oo##.',
  '##################',
  '#+#+#+#+##+#+#+#+#',
  '#xxxxxxxxxxxxxxxx#',
  '#+#+#+#+##+#+#+#+#',
  '.################.',
  '#.##############.#',
  '..##############..',
  '...############...',
  '...####....####...',
  '...##........##...',
];

export const PROGRAM_ELDERS = {
  tigerElder: pair(tigerA, swap(tigerA, 14, ['...##........##...'])),
  wormElder: pair(wormA, swap(wormA, 10, ['.....########.....', '.....xxxxxxxx.....', '.....########.....', '.....xxxxxxxx.....', '....######........'])),
  mouseElder: pair(mouseA, swap(mouseA, 12, ['..##############..', '....##......##..##'])),
  spoofElder: pair(spoofA, swap(spoofA, 14, ['..##..##..##..##..'])),
  parseElder: pair(parseA, swap(parseA, 14, ['...##........##...'])),
  phreakElder: pair(phreakA, swap(phreakA, 9, ['.#..##########..#.', '..#.##########.#..', '..##.########.##..', '....##########....', '....###....###....', '...##........##...'])),
  gobbleElder: pair(gobbleA, swap(gobbleA, 10, ['.################.', '.################.', '.################.', '.################.', '...###......###...'])),
  snarfElder: pair(snarfA, swap(snarfA, 14, ['..##..........##..'])),
  // Ghost's elder is 1.0's own (maintainer's call): Whisper, Ghost's mainframe form. A hidden form may differ from the other forms' rules, so it
  // keeps 1.0's size (14 columns, smaller than the Ghost, its body thinning into a wisp). Its B frame keeps the head and mouth still, as 1.0's moves the mouth.
  ghostElder: pair(SPRITES.whisperA, SPRITES.whisperA.map((row, y) => (y <= 8 ? row : SPRITES.whisperB[y]))),
};
