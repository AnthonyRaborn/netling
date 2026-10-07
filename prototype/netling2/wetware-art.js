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

import { SPRITES, ANCHOR_ROWS } from '../../src/sprites.js';

// A with its rows from `fromRow` down replaced by B's (the head and eyes stay A's).
const frozen = (a, b, fromRow) => ({ a, b: a.map((row, y) => (y >= fromRow ? b[y] : row)) });

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

// --- corp adults (16 wide, up to 15 rows) -----------------------------------------------------------------------------------------
// The four corp-lean role forms (the street forms and the hidden Blank come later). Maintainer's hunch: Wetware reads more humanoid
// than Iron and Program, so these are people-shaped (a neck, shoulders, arms, legs) and keep the baby's folded cortex on the head.
//   Razor (Breach): heavily cybered muscle; a narrow jaw, shoulders, and arms that hang beside the torso, each ending in a blade ('+' strip) that runs down the outside of the forearm. No brow (a dark brow row made the dead X's land on it).
//   Wired (Dodge): 1.0's Chrome as it is (the maintainer's suggestion), its visor and reflexes; the B frame is Chrome's with the head and
//           eyes frozen, as Program's reused forms are.
//   Mentat (Tune): an oversized cortex on a narrow body in a robe: someone who stares at a problem and answers.
//   Nutri (Feast): a round, wide body with a big mouth and a dark feeding band across the belly.
export const WETWARE_ADULTS = {
  // Razor
  razor: {
    a: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '...##########...',
      '...#oo####oo#...',
      '...#oo####oo#...',
      '...##########...',
      '....########....',
      '.....#+##+#.....',
      '......####......',
      '..############..',
      '+##.########.##+',
      '+##.########.##+',
      '+..###....###..+',
    ],
    b: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '...##########...',
      '...#oo####oo#...',
      '...#oo####oo#...',
      '...##########...',
      '....########....',
      '.....#+##+#.....',
      '......####......',
      '..############..',
      '+##.########.##+',
      '+##.########.##+',
      '+.###......###.+',
    ],
  },
  // Wired: 1.0's Chrome, head frozen (1.0's B frame moves the visor's lights and eyes; only its arms are taken from B).
  wired: frozen(SPRITES.chromeA, SPRITES.chromeB, 9),
  // Mentat
  mentat: {
    a: [
      '....#x#xx#x#....',
      '...#x#x##x#x#...',
      '..#x#x#xx#x#x#..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '..############..',
      '...####++####...',
      '.....######.....',
      '...##########...',
      '.#.##########.#.',
      '.#.##########.#.',
      '.##############.',
      '.##.##.##.##.##.',
    ],
    b: [
      '....#x#xx#x#....',
      '...#x#x##x#x#...',
      '..#x#x#xx#x#x#..',
      '.##############.',
      '.##oo######oo##.',
      '.##oo######oo##.',
      '..############..',
      '...####++####...',
      '.....######.....',
      '...##########...',
      '.#.##########.#.',
      '.#.##########.#.',
      '.##############.',
      '..##.##.##.##.#.',
    ],
  },
  // Nutri
  nutri: {
    a: [
      '.....#x##x#.....',
      '...##x#xx#x##...',
      '..############..',
      '..############..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '..##+x++++x+##..',
      '..############..',
      '.##############.',
      '################',
      '##xxxxxxxxxxxx##',
      '.##############.',
      '..##..####..##..',
    ],
    b: [
      '.....#x##x#.....',
      '...##x#xx#x##...',
      '..############..',
      '..############..',
      '..##oo####oo##..',
      '..##oo####oo##..',
      '..############..',
      '..##+x++++x+##..',
      '..############..',
      '.##############.',
      '################',
      '##xxxxxxxxxxxx##',
      '.##############.',
      '...##.####.##...',
    ],
  },
  // Solo (Breach, street): after Batou (Ghost in the Shell): a bristle crop with cortex folds, a square jaw behind a wide dark ocular band with two lens eyes, a thick neck, huge shoulders and heavy arms with fists, a plain chest.
  solo: {
    a: [
      '...#.#.##.#.#...',
      '..#x#x####x#x#..',
      '..############..',
      '..############..',
      '..#xooxxxxoox#..',
      '..#xooxxxxoox#..',
      '..############..',
      '..#+#+####+#+#..',
      '....########....',
      '################',
      '##.##########.##',
      '##.##########.##',
      '##..###..###..##',
      '....###..###....',
    ],
    b: [
      '...#.#.##.#.#...',
      '..#x#x####x#x#..',
      '..############..',
      '..############..',
      '..#xooxxxxoox#..',
      '..#xooxxxxoox#..',
      '..############..',
      '..#+#+####+#+#..',
      '....########....',
      '################',
      '##.##########.##',
      '##.##########.##',
      '##..###..###..##',
      '...###....###...',
    ],
  },
  // Chipped (Dodge, street): slim and springy: an antenna and a chip port at the temple, both eyes the same size but the right one a different colour (the highlight mark, a cyber lens), arms that run unbroken from the shoulders to the hands, long legs.
  chipped: {
    a: [
      '.....#xxxx#..#..',
      '....#x#xx#x#.#..',
      '...##########...',
      '...##########...',
      '...#oo####++#...',
      '...#oo####++#...',
      '...##########...',
      '....###++###....',
      '.....######.....',
      '...##########...',
      '...#.######.#...',
      '...#.######.#...',
      '...##.####.##...',
      '.....##..##.....',
      '....###..###....',
    ],
    b: [
      '.....#xxxx#..#..',
      '....#x#xx#x#.#..',
      '...##########...',
      '...##########...',
      '...#oo####++#...',
      '...#oo####++#...',
      '...##########...',
      '....###++###....',
      '.....######.....',
      '...##########...',
      '...#.######.#...',
      '...#.######.#...',
      '...##.####.##...',
      '....##....##....',
      '...###....###...',
    ],
  },
  // Gibson (Tune, street), second attempt: a psychic receiver: cortex folds, broadcast arcs on both sides of the head, a slim body with arms hanging, and no legs: the body thins into scattered cells, as if dissolving into the Net, that shift between frames.
  gibson: {
    a: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '.#.##########.#.',
      '#..#oo####oo#..#',
      '#..#oo####oo#..#',
      '.#.##########.#.',
      '....###++###....',
      '.....######.....',
      '...##########...',
      '..##.######.##..',
      '..##.######.##..',
      '..#...####...#..',
      '.....#.##.#.....',
      '....#..#..#..#..',
    ],
    b: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '.#.##########.#.',
      '#..#oo####oo#..#',
      '#..#oo####oo#..#',
      '.#.##########.#.',
      '....###++###....',
      '.....######.....',
      '...##########...',
      '..##.######.##..',
      '..##.######.##..',
      '..#...####...#..',
      '....#.##.#......',
      '.....#..#..#..#.',
    ],
  },
  // Leech (Feast, street): a tall, thin street doctor: eyes set wide apart, a round sucker mouth with a feeding tube (a single bright line) running from it down the chest to a dark pump at the belly, long arms and a stoop.
  leech: {
    a: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '...##########...',
      '...#oo####oo#...',
      '...#oo####oo#...',
      '...##########...',
      '....##++++##....',
      '.....###+##.....',
      '......##+#......',
      '...#####+####...',
      '...#.###+##.#...',
      '...#.###xx#.#...',
      '..##..####..##..',
      '.....##..##.....',
    ],
    b: [
      '.....#xxxx#.....',
      '....#x#xx#x#....',
      '...##########...',
      '...##########...',
      '...#oo####oo#...',
      '...#oo####oo#...',
      '...##########...',
      '....##++++##....',
      '.....###+##.....',
      '......##+#......',
      '...#####+####...',
      '...#.###+##.#...',
      '...#.###xx#.#...',
      '..##..####..##..',
      '......####......',
    ],
  },
  // Blank (hidden): the hidden teen grown. A person the system does not know, in a hooded cloak: a pointed hood whose top is camouflaged, a
  // solid rim around a dark face opening where only two lens eyes show (no mouth, nothing to say who it is: the CP2020 sense of a person without
  // a SIN), and a cloak that slopes from the shoulders to a flat hem with feet showing. The camouflage (cells alternating bright and dim,
  // after the thermoptic suit in Ghost in the Shell, a different take on Program's Shell and Ghost) covers the hood top, the chin and the
  // whole cloak. The hood is the same in both frames; the cloak's shimmer swaps phase and the feet step. Rejected drafts: a smooth round
  // head over a checkered skirt read as a squid, and shimmer over the rim as well made the face opening murky.
  blank: {
    a: [
      '.......##.......',
      '......####......',
      '.....x#x#x#.....',
      '....x#x#x#x#....',
      '...x#x#x#x#x#...',
      '..##xooxxoox##..',
      '..##xooxxoox##..',
      '..##xxxxxxxx##..',
      '...x#x#x#x#x#...',
      '....########....',
      '...x#x#x#x#x#...',
      '..x#x#x#x#x#x#..',
      '.x#x#x#x#x#x#x#.',
      '.#x#x#x#x#x#x#x.',
      '.....##..##.....',
    ],
    b: [
      '.......##.......',
      '......####......',
      '.....x#x#x#.....',
      '....x#x#x#x#....',
      '...x#x#x#x#x#...',
      '..##xooxxoox##..',
      '..##xooxxoox##..',
      '..##xxxxxxxx##..',
      '...x#x#x#x#x#...',
      '....########....',
      '...#x#x#x#x#x...',
      '..#x#x#x#x#x#x..',
      '.#x#x#x#x#x#x#x.',
      '.x#x#x#x#x#x#x#.',
      '......####......',
    ],
  },
};
export const WETWARE_ADULT_ANCHORS = {
  razor: { headTop: 2, eyeRow: 4, mouthRow: 8, neckRow: 9 },
  wired: { ...ANCHOR_ROWS.chrome.a },
  mentat: { headTop: 3, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  nutri: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  solo: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  chipped: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  gibson: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 8 },
  leech: { headTop: 2, eyeRow: 4, mouthRow: 7, neckRow: 9 },
  blank: { headTop: 3, eyeRow: 5, mouthRow: 8, neckRow: 9 },
};
