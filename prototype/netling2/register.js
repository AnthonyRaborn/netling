// Lets the real wearable code (src/accessories.js) place items on the prototype sprites. accessories.js builds its table of
// authored anchor rows from SPRITES and ANCHOR_ROWS when it first loads, so call this before importing it. Both objects are
// the game's own mutable tables; this only ever runs in the prototype page and in the prototype's tests.
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';

export const MODELS = ['A', 'B'];
export const protoKey = (model, id) => `proto${model}_${id}`;
// Program's forms register under the model letter P (they are not part of Iron's models A and B).
export const programKey = (id) => protoKey('P', id);
// Wetware's likewise, under W.
export const wetwareKey = (id) => protoKey('W', id);

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
  for (const f of Object.values(programForms())) {
    const key = programKey(f.id);
    SPRITES[`${key}A`] = f.a;
    SPRITES[`${key}B`] = f.b;
    SPRITES[`${key}Sleep`] = f.sleep;
    SPRITES[`${key}Dead`] = f.dead;
    ANCHOR_ROWS[key] = f.anchors;
  }
  for (const f of Object.values(wetwareForms())) {
    const key = wetwareKey(f.id);
    SPRITES[`${key}A`] = f.a;
    SPRITES[`${key}B`] = f.b;
    SPRITES[`${key}Sleep`] = f.sleep;
    SPRITES[`${key}Dead`] = f.dead;
    ANCHOR_ROWS[key] = f.anchors;
  }
}
