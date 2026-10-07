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
