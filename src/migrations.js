// Save upgrades. Every stored netling carries `saveVersion`. When a change to the save format can't be
// expressed as "add a field with a default" (that is what `migrate()` in sim.js is for), bump
// SAVE_VERSION in sim.js and add a step here that turns a save of the previous version into the new one.
//
// STEPS[n] takes a version-n save and returns a version-(n+1) save. A step:
//   - works on plain data only (no DOM, no storage, no clock), so it is easy to test;
//   - may edit the object it is given (it is always a private copy) or return a new one;
//   - must tolerate a damaged save (missing or wrong-typed fields): cleanSave repairs the result afterwards,
//     but a step that throws counts as "can't upgrade" and the save is set aside instead;
//   - never sets `saveVersion` itself: the runner does.
//
// Old steps are never edited or removed: a save from any earlier version must keep loading, and
// tests/fixtures/save-v1.json (a frozen version 1 save) is loaded by tests/migrations.test.js to prove it.
import { SAVE_VERSION } from './sim.js';

export const STEPS = {
  // 1 to 2: the Mainframe stage. Nothing to convert: its fields are additive and get defaults from migrate() and
  // cleanSave. The version moves so a build from before it sets a save holding the new stage aside as "newer"
  // (reload to update) instead of refusing an unknown stage as damaged.
  1: (save) => save,
};

// Upgrades `raw` to `target`. Returns { save, from, upgraded } on success, or { error } where error is:
//   'invalid': not an object, or no usable version number;
//   'newer':   saved by a newer build than this one (left alone: better to set it aside than to guess);
//   'failed':  a step is missing or threw.
// The input is never modified.
export function upgradeSave(raw, { steps = STEPS, target = SAVE_VERSION } = {}) {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { error: 'invalid' };
  const from = raw.saveVersion;
  if (!Number.isInteger(from) || from < 1) return { error: 'invalid' };
  if (from > target) return { error: 'newer' };
  if (from === target) return { save: raw, from, upgraded: false };
  let save = structuredClone(raw);
  for (let v = from; v < target; v++) {
    if (typeof steps[v] !== 'function') return { error: 'failed' };
    try {
      save = steps[v](save) ?? save;
    } catch {
      return { error: 'failed' };
    }
    if (typeof save !== 'object' || save === null || Array.isArray(save)) return { error: 'failed' };
    save.saveVersion = v + 1;
  }
  return { save, from, upgraded: true };
}

// True when a stored value was written by a newer build (used to word messages).
export const isNewerSave = (raw) => Number.isInteger(raw?.saveVersion) && raw.saveVersion > SAVE_VERSION;
