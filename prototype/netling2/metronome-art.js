// The Metronome prop's art (docs/NETLING_2_SKETCH.md, Temper cosmetics; docs/NETLING_2_SPRITES.md, Next phase): 5x8, one frame per
// pendulum position from metronome.js (-1 left, 0 upright, +1 right). DRAFT for review, not decided art. Not shipped.
// Same letters as the sprites: '#' the case, 'x' its dark dial window, '+' the rod, 'o' the weight. Only the three rod rows change between
// frames; the case never moves. The prop sits at the right of the floor, like 1.0's props.
const CASE = ['.###.', '.#x#.', '.###.', '#####', '#####'];

export const METRONOME_ART = {
  '-1': ['o....', '.+...', '..+..', ...CASE],
  0: ['..o..', '..+..', '..+..', ...CASE],
  1: ['....o', '...+.', '..+..', ...CASE],
};
export const METRONOME_SIZE = { w: 5, h: 8 };
export const metronomeFrame = (pos) => METRONOME_ART[pos];
