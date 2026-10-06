// Lets the real wearable code (src/accessories.js) place items on the prototype sprites. accessories.js builds its table of
// authored anchor rows from SPRITES and ANCHOR_ROWS when it first loads, so call this before importing it. Both objects are
// the game's own mutable tables; this only ever runs in the prototype page and in the prototype's tests.
import { forms } from './models.js';

export const MODELS = ['A', 'B'];
export const protoKey = (model, id) => `proto${model}_${id}`;

export function register(SPRITES, ANCHOR_ROWS) {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      const key = protoKey(model, f.id);
      SPRITES[`${key}A`] = f.a;
      SPRITES[`${key}B`] = f.b;
      SPRITES[`${key}Sleep`] = f.sleep;
      SPRITES[`${key}Dead`] = f.dead;
      ANCHOR_ROWS[key] = f.anchors;
    }
  }
}
