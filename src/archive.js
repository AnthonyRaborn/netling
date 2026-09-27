// Lineage records and the form dex. Pure data helpers; main.js handles storage.
import { SPECIES, FORMS, FORM_MODS, TRAITS } from './sim.js';

export const DEX_ORDER = ['bitling', 'kernel', 'stub', 'chrome', 'firewall', 'daemon', 'glitch', 'ghost'];

// Shown for undiscovered forms. Vague on purpose.
export const DEX_HINTS = {
  bitling: 'compile a script.',
  kernel: 'raise it well through its first day.',
  stub: 'what grows from a rough first day?',
  chrome: 'loyal to the grid.',
  firewall: 'trusts no one upstream.',
  daemon: 'never misses a cycle.',
  glitch: 'lives too close to the edge.',
  ghost: 'leaves no trace. misses nothing. plays everything.',
};

export const DEX_LORE = {
  bitling: 'A freshly compiled netling. Mostly curiosity and antennae.',
  kernel: 'A well-kept adolescent, neatly pinned and humming.',
  stub: 'An adolescent with missing sectors. Scrappy, not broken.',
  chrome: 'Corp-issue and proud of it. Polished, licensed, a little smug.',
  firewall: 'A personal shield that decided it was a person.',
  daemon: 'A background process with horns. Silent, tireless, exact.',
  glitch: 'Unstable and unbothered. Occasionally in two places at once.',
  ghost: 'No logs. No faults. Nobody is quite sure it is there.',
};

export function discover(dex, form) {
  if (!form || !SPECIES[form] || dex.includes(form)) return false;
  dex.push(form);
  return true;
}

// Forms a save proves you've seen, for backfilling the dex from older saves.
export function formsSeenIn(state, lineage) {
  const seen = new Set();
  if (state.stage !== 'script') seen.add('bitling');
  if (state.form && state.stage !== 'script') seen.add(state.form);
  for (const e of lineage) {
    if (e.ageMin > 0) seen.add('bitling');
    if (e.realized && e.form) seen.add(e.form);
    if (e.teenForm) seen.add(e.teenForm);
  }
  return [...seen];
}

export function deathRecord(state) {
  const f = state.fragment;
  return {
    generation: state.generation,
    form: f?.form ?? null,
    realized: Boolean(FORMS[state.form]),
    teenForm: state.teenForm ?? null,
    cause: state.deathCause,
    ageMin: state.ageMin,
    mistakes: state.careMistakes,
    trait: state.trait,
    fragmentTrait: f?.trait ?? null,
    palette: state.quirk?.palette ?? 0,
    bornAt: state.bornAt,
    diedAt: state.diedAt,
  };
}

// Display rows, newest first. Older records lack some fields; fall back gracefully.
export function lineageRows(lineage, current) {
  const rows = lineage.map((e) => ({
    version: `v${e.generation}.0`,
    form: e.form,
    formLabel: e.form ? `${SPECIES[e.form].name}${e.realized === false ? ' (echo)' : ''}` : 'unknown',
    status: e.cause ?? 'flatlined',
    ageMin: e.ageMin ?? 0,
    mistakes: e.mistakes,
    trait: e.trait ? TRAITS[e.trait].name : null,
    fragment: e.fragmentTrait ? TRAITS[e.fragmentTrait].name : null,
    palette: e.palette ?? 0,
    dead: true,
  }));
  if (current && current.stage !== 'dead') {
    rows.push({
      version: `v${current.generation}.0`,
      form: current.stage === 'script' ? null : current.form,
      formLabel: current.stage === 'script' ? 'compiling' : SPECIES[current.form].name,
      status: 'running',
      ageMin: current.ageMin,
      mistakes: current.careMistakes,
      trait: current.trait ? TRAITS[current.trait].name : null,
      fragment: null,
      palette: current.quirk.palette,
      dead: false,
    });
  }
  return rows.reverse();
}

export function dexEntries(dex) {
  return DEX_ORDER.map((id) => {
    const found = dex.includes(id);
    return {
      id,
      found,
      name: found ? SPECIES[id].name : '???',
      stage: SPECIES[id].stage,
      text: found ? DEX_LORE[id] : `hint: ${DEX_HINTS[id]}`,
      perk: found ? FORM_MODS[id]?.desc ?? null : null,
      trait: found && FORMS[id] ? TRAITS[FORMS[id].trait].name : null,
    };
  });
}
