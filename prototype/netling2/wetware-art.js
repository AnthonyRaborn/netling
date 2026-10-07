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
