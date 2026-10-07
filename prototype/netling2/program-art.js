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
  // The street lean: Kernel worn down on one side. One antenna, the right side of the body cut away in a slanted bite (the head top
  // still covers both eyes, so eyewear spans them), a long left arm, and a taped patch on the neck. Redrawn after the first version
  // (one antenna, a notched corner, 5 cells different, 0.94 overlap) went over 1.0's 0.82 bar against the corp teen.
  teenStreet: frozen(
    [
      '....#.........',
      '....o.........',
      '..########....',
      '#.########....',
      '#.##oo##oo##..',
      '#.##oo##oo##.#',
      '#.########....',
      '#.####++##....',
      '..#####xx.....',
      '....#....#....',
      '...##....##...',
    ],
    SPRITES.kernelB.map((r, y) => (y === 10 ? r : '')),
    10,
  ),
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
// Rules each one follows (see NETLING_2_SPRITES.md, Fit and frame stability): 16 columns, no more than 14 rows; rows 0 to neckRow are
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
  // Worm (Breach, street): a tall segmented column with jaws; the rings undulate between frames.
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
      '..############..',
      '....########....',
      '..############..',
      '....########....',
      '......####......',
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
      '..############..',
      '....########....',
      '..############..',
      '.......##.......',
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
  // Gobble (Feast, corp): a small neat head on a big round belly, a wide mouth, stubby legs.
  gobble: {
    a: [
      '.....######.....',
      '....########....',
      '...##########...',
      '...##oo##oo##...',
      '...##oo##oo##...',
      '....########....',
      '...#++++++++#...',
      '..############..',
      '.##############.',
      '################',
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
      '....########....',
      '...#++++++++#...',
      '..############..',
      '.##############.',
      '################',
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
  gobble: rows4(2, 3, 6, 7),
  snarf: rows4(1, 3, 6, 8),
  ghost: rows4(1, 4, 7, 8),
};

// --- elders ---------------------------------------------------------------------------------------------------------------------
// One elder per adult (decided), each a variant of the adult it grows from: 18 columns against 16 and one row taller (never past 15),
// keeping the adult's own marks. An elder here is the adult stretched, then given a mark of its own by hand: the two centre columns
// of every row are repeated (so the eyes stay two cells wide and the face widens between them), and the row after the neck row is
// repeated (so the head, eyes, mouth and neck rows, and the anchors, are the adult's). The marks are listed per elder as [x, y, mark].
const stretch = (rows, neckRow) => {
  const wide = rows.map((r) => r.slice(0, 9) + r.slice(7, 9) + r.slice(9));
  return [...wide.slice(0, neckRow + 2), ...wide.slice(neckRow + 1)];
};
const withMarks = (rows, marks) => rows.map((r, y) => [...r].map((c, x) => marks.find(([mx, my]) => mx === x && my === y)?.[2] ?? c).join(''));
// `still`: rows down to this index are copied from A into B. The wearable code reads the body at a row about half way down the sprite,
// and a taller elder moves that row a row lower, so a form that animates its body (Worm's rings) must hold that row still too.
export const grown = (adult, neckRow, marks = [], still = 0) => {
  const a = withMarks(stretch(adult.a, neckRow), marks);
  const b = withMarks(stretch(adult.b, neckRow), marks);
  return { a, b: b.map((row, y) => (y <= still ? a[y] : row)) };
};

// Marks listed [x, y, mark] in the elder's own coordinates, all on rows the two frames share, so the head and neck stay identical.
const ELDER_MARKS = {
  tiger: [[8, 3, 'x'], [9, 3, 'x'], [2, 10, 'x'], [15, 10, 'x']], // a forehead stripe and bolder shoulder stripes
  worm: [[8, 0, '#'], [9, 0, '#'], [8, 2, 'x'], [9, 2, 'x']], // a third spike and a forehead mark
  mouse: [[0, 7, '#'], [17, 7, '#'], [8, 4, 'x'], [9, 4, 'x']], // whiskers and a forehead mark
  spoof: [[8, 9, 'x'], [9, 9, 'x']], // a clasp at the throat
  parse: [[2, 1, '#'], [15, 1, '#'], [8, 3, 'x'], [9, 3, 'x']], // doubled brackets and a cursor on the screen
  phreak: [[8, 1, 'x'], [9, 1, 'x']], // a mark on the crown
  gobble: [[8, 10, 'x'], [9, 10, 'x'], [8, 11, 'x'], [9, 11, 'x']], // a band across the belly
  snarf: [[0, 9, '#'], [17, 9, '#'], [8, 2, 'x'], [9, 2, 'x']], // tusks at the jaw corners and a brow mark
  ghost: [[8, 1, 'x'], [9, 1, 'x']], // a mark on the dome
};
export const PROGRAM_ELDERS = Object.fromEntries(
  Object.entries(PROGRAM_ADULTS).map(([id, adult]) => [`${id}Elder`, grown(adult, PROGRAM_ADULT_ANCHORS[id].neckRow, ELDER_MARKS[id], id === 'worm' ? 10 : 0)]),
);
export const PROGRAM_ELDER_ANCHORS = Object.fromEntries(Object.entries(PROGRAM_ADULT_ANCHORS).map(([id, a]) => [`${id}Elder`, a])); // the rows added are below the neck
