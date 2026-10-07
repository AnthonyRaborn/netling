// Netling 2.0 sprite prototype: the Wetware egg. Same string-row format as src/sprites.js ('#' main, 'o' accent, '+' highlight,
// 'x' dim fill, '.' empty). Not shipped; see docs/NETLING_2_SPRITES.md.
//
// Wetware is grown tissue running software, so its baby is an ORGANOID: a lump of cultured tissue with a folded cortex (the dim 'x'
// folds across the top of the head), a face, and four root-like tendrils instead of feet. Chosen by the maintainer from three
// candidates (a round cell, this, and a tadpole). The folds are the egg's mark: later forms are meant to carry them, and the
// neglect skin (pallor) and the tell's pulse have somewhere to show.
//
// Baby rules (the same as Iron's and Program's): 12 columns, the head, eyes, mouth and neck identical in A and B, only the lowest
// two rows (the tendrils) move.

export const WETWARE_BABY = {
  a: [
    '............',
    '...#x##x#...',
    '..#x#xx#x#..',
    '.#x##xx##x#.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '..########..',
    '..###++###..',
    '...######...',
    '..#.#..#.#..',
    '..#.#..#.#..',
  ],
  b: [
    '............',
    '...#x##x#...',
    '..#x#xx#x#..',
    '.#x##xx##x#.',
    '.#oo####oo#.',
    '.#oo####oo#.',
    '..########..',
    '..###++###..',
    '...######...',
    '...#.##.#...',
    '...#....#...',
  ],
};

// headTop, eyeRow, mouthRow and neckRow, the same in both frames.
export const WETWARE_BABY_ANCHORS = { headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8 };

// --- teens (14 wide, 11 rows like Iron's and Program's) ---------------------------------------------------------------------------
// Maintainer's direction: blobs for now, not humanoids (the humanoid bodies come at the adult stage). Corp and street are the baby grown:
// the same folded cortex on a taller, wider body with four tendril feet. The street lean adds, it does not cut away (the rule from
// Program): spikes over the cortex, a dark unibrow, and arms held off the body. The hidden-path teen is Blank's: a cloaked blob in
// the spirit of Ghost in the Shell's thermoptic camouflage (Program's hidden path is its own take, a hollow Shell): a hooded peak, slit
// eyes, a body that shimmers (dim and bright cells alternating, as a camouflaged figure does) and a scalloped hem. The cyber ninja is the
// silhouette: a hood and a flared cloak, where the other two are rounded.
const teen = (a, tail) => ({ a, b: a.map((row, y) => (y === 10 ? tail : row)) });

export const WETWARE_TEENS = {
  teenCorp: teen([
    '.....#xx#.....',
    '...#x#xx#x#...',
    '..#x##xx##x#..',
    '.############.',
    '.#oo######oo#.',
    '.#oo######oo#.',
    '.############.',
    '..####++####..',
    '...########...',
    '..##########..',
    '..#.#....#.#..',
  ], '...#.#..#.#...'),
  teenStreet: teen([
    '#.#.#.xx.#.#.#',
    '...#x#xx#x#...',
    '..#x##xx##x#..',
    '#xxxxxxxxxxxx#',
    '##oo######oo##',
    '##oo######oo##',
    '.############.',
    '#.####++####.#',
    '#..########..#',
    '#.##########.#',
    '.####....####.',
  ], '...###..###...'),
  teenHidden: teen([
    '......##......',
    '.....####.....',
    '....######....',
    '...########...',
    '...#oo##oo#...',
    '...#oo##oo#...',
    '...x#x#x#x#...',
    '...#x#x#x#x...',
    '...########...',
    '.############.',
    '.####.##.####.',
  ], '.#.#.####.#.#.'),
};
export const WETWARE_TEEN_ANCHORS = {
  teenCorp: { headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  teenStreet: { headTop: 1, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  teenHidden: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
};
