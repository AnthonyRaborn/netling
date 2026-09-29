// Lineage records and the form dex. Pure data helpers; main.js handles storage.
import { SPECIES, FORMS, FORM_MODS, TRAITS, ITEMS, KEEPSAKES, traitLabel } from './sim.js';
import { FORM_ABILITIES } from './netrun/run.js';

export const DEX_ORDER = ['bitling', 'kernel', 'stub', 'shell', 'chrome', 'firewall', 'daemon', 'glitch', 'ghost'];

// Shown for undiscovered forms. Vague on purpose.
export const DEX_HINTS = {
  bitling: 'compile a script.',
  kernel: 'raise it well through its first day.',
  stub: 'what grows from a rough first day?',
  shell: 'sides with no one on its first day, and plays every game.',
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
  shell: 'A hollow casing with something looking out from inside. Empty, for now.',
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
    traitLevel: state.traitLevel ?? 1,
    history: state.history ?? null,
    fragmentTrait: f?.trait ?? null,
    fragmentLevel: f?.level ?? 1,
    keepsake: f?.keepsake ?? null,
    rescued: Boolean(state.rootUsed),
    palette: state.quirk?.palette ?? 0,
    bornAt: state.bornAt,
    diedAt: state.diedAt,
  };
}

const inheritedLabel = (trait, level, history) => (trait ? `${traitLabel(trait, level)}${history ? ` · history ${TRAITS[history].name}` : ''}` : null);

// Display rows, newest first. Older records lack some fields; fall back gracefully.
export function lineageRows(lineage, current) {
  const rows = lineage.map((e) => ({
    generation: e.generation,
    version: `v${e.generation}.0`,
    form: e.form,
    formLabel: e.form ? `${SPECIES[e.form].name}${e.realized === false ? ' (echo)' : ''}` : 'unknown',
    status: e.cause ?? 'flatlined',
    ageMin: e.ageMin ?? 0,
    mistakes: e.mistakes,
    trait: inheritedLabel(e.trait, e.traitLevel, e.history),
    fragment: e.fragmentTrait ? traitLabel(e.fragmentTrait, e.fragmentLevel) : null,
    keepsake: e.keepsake ? ITEMS[e.keepsake].name : null,
    rescued: Boolean(e.rescued),
    palette: e.palette ?? 0,
    dead: true,
  }));
  if (current && current.stage !== 'dead') {
    rows.push({
      generation: current.generation,
      version: `v${current.generation}.0`,
      form: current.stage === 'script' ? null : current.form,
      formLabel: current.stage === 'script' ? 'compiling' : SPECIES[current.form].name,
      status: 'running',
      ageMin: current.ageMin,
      mistakes: current.careMistakes,
      trait: inheritedLabel(current.trait, current.traitLevel, current.history),
      fragment: null,
      // The running netling's bars as the HUD labels them, and its scrip.
      stats: current.stage === 'script' ? null : `CHG ${Math.round(current.stats.charge)} · SYNC ${Math.round(current.stats.sync)} · INT ${Math.round(current.stats.integrity)} · HEAT ${Math.round(current.stats.heat)} · scrip ${current.scrip ?? 0}`,
      palette: current.quirk.palette,
      dead: false,
    });
  }
  return rows.reverse();
}

// The family tree: one netling per generation, so a chain, oldest first. Between a parent and its
// child a link shows what passed down (the child's trait, its level and history, and the keepsake).
// A node shows its own inheritance only when no link sits above it, and what it left when none sits below.
export function lineageChain(lineage, current) {
  const rows = lineageRows(lineage, current).reverse();
  const out = [];
  rows.forEach((r, i) => {
    const parent = rows[i - 1];
    const gap = parent && r.generation !== parent.generation + 1;
    if (parent) {
      const text = gap ? 'records missing' : [r.trait ?? parent.fragment ?? 'no trait', parent.keepsake].filter(Boolean).join(' + ');
      out.push({ kind: 'link', gap, text });
    }
    out.push({ kind: 'node', ...r, inherited: parent && !gap ? null : r.trait, left: r.dead && !rows[i + 1] ? r.fragment : null });
  });
  return out;
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
      keepsake: found && KEEPSAKES[id] ? ITEMS[KEEPSAKES[id]].name : null,
      runAbility: found ? FORM_ABILITIES[id] ?? null : null,
    };
  });
}
