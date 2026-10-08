// Visits (docs/NETLING_2_SPRITES.md, Temper pass). A visit is short, and the 1.0 screen is busy with two sprites bouncing
// toward each other, so the prototype's visual layers PAUSE during one (maintainer): no temper tell, no neglect, no bugs, no
// idle wander, no state marks. The sprite plays 1.0's own visit animation, a plain bounce, and nothing else.
//
// visitLayers() is what every layer reads: it returns the layer state to draw. visitMotion() is the bounce, a copy of the visit
// rules in src/render.js (swing and hop), so it can be drawn and tested without the DOM. Keep it in step with that file.
const LCD_W = 40;

// The layer state to draw: while visiting, every layer is off and the tell shows the plain 1.0 frame rhythm.
export function visitLayers(state, visiting) {
  if (!visiting) return state;
  return { ...state, level: 0, neglect: 0, bugs: 0, idle: 'none', marks: false };
}

// -> { x, y, frame } for a visiting netling `w` columns and `h` rows, with a visitor `visitorWidth` columns wide, at `time` ms;
// x and y are the sprite's top left on the 40 column screen. calm: the reduced-motion bounce (render.js: a fixed swing of 2, no hop).
export function visitMotion({ w, h, visitorWidth = 16, time, calm = false }) {
  const frame = Math.floor(time / 500) % 2;
  const swingCap = Math.max(0, Math.floor((LCD_W - 4 - w - visitorWidth) / 2));
  const swing = Math.min(swingCap, calm ? 2 : Math.round((Math.sin(time / 700 + Math.PI) + 1) * 2));
  const hop = calm ? 0 : !frame ? 1 : 0;
  return { x: LCD_W - 1 - w - swing, y: 20 - h - hop, frame };
}
