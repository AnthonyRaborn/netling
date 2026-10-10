// Form ids for the eggs: egg + stage + role + lean, e.g. ironBaby (no role or lean), ironTeenCorp (no role), ironAdultBreachStreet,
// ironElderBreachStreet, and for the hidden line ironTeenHidden, ironAdultHidden, ironElderHidden. The ids say what a form is, not what it
// is called, so a name can change without touching an id. Display names live in FORM_NAMES and ROGUE_NAMES (below) and nowhere else.
// The art tables (art.js, program-art.js, wetware-art.js) and the models' internal tables still use the old authoring keys ('gronk',
// 'tigerElder'); each models file maps them at its boundary with idMaps and exports the new ids.
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// table: the models file's old form table ({ oldId: { stage, role?, lean?, from? } }; an elder's `from` is the old id of its adult).
export function idMaps(egg, table) {
  const toNew = {};
  for (const [old, f] of Object.entries(table)) {
    const src = f.stage === 'elder' ? table[f.from] : f;
    // Rogue's forms have no lean (one teen, one adult per role), so its ids are rogueTeen and rogueAdultBreach.
    const lean = src.lean ? cap(src.lean) : '';
    const tail = f.stage === 'baby' ? '' : f.stage === 'teen' ? lean : src.role === 'hidden' ? 'Hidden' : `${cap(src.role)}${lean}`;
    toNew[old] = `${egg}${cap(f.stage)}${tail}`;
  }
  const toOld = Object.fromEntries(Object.entries(toNew).map(([o, n]) => [n, o]));
  if (Object.keys(toOld).length !== Object.keys(toNew).length) throw new Error(`${egg}: two forms map to one id`);
  return { toNew, toOld };
}

// Display names, decided (sketch, Teen, baby and elder names; elder names are not final until the elder art is) and free to change.
export const FORM_NAMES = {
  ironBaby: 'Boot', ironTeenCorp: 'Thunk', ironTeenStreet: 'Buzz', ironTeenHidden: 'Gweep',
  ironAdultBreachCorp: 'Splat', ironAdultBreachStreet: 'Gronk', ironAdultDodgeCorp: 'Jiff', ironAdultDodgeStreet: 'Bamf',
  ironAdultTuneCorp: 'Ping', ironAdultTuneStreet: 'Feep', ironAdultFeastCorp: 'Munch', ironAdultFeastStreet: 'Thrash', ironAdultHidden: 'Guru',
  ironElderBreachCorp: 'Brick', ironElderBreachStreet: 'Ram', ironElderDodgeCorp: 'Tick', ironElderDodgeStreet: 'Hop',
  ironElderTuneCorp: 'Peek', ironElderTuneStreet: 'Ding', ironElderFeastCorp: 'Crunch', ironElderFeastStreet: 'Swap', ironElderHidden: 'Init',
  programBaby: 'Bitling', programTeenCorp: 'Kernel', programTeenStreet: 'Rat', programTeenHidden: 'Shell',
  programAdultBreachCorp: 'Tiger', programAdultBreachStreet: 'Worm', programAdultDodgeCorp: 'Mouse', programAdultDodgeStreet: 'Spoof',
  programAdultTuneCorp: 'Parse', programAdultTuneStreet: 'Phreak', programAdultFeastCorp: 'Gobble', programAdultFeastStreet: 'Snarf', programAdultHidden: 'Ghost',
  programElderBreachCorp: 'Lynx', programElderBreachStreet: 'Fork', programElderDodgeCorp: 'Daemon', programElderDodgeStreet: 'Mask',
  programElderTuneCorp: 'Tree', programElderTuneStreet: 'Tone', programElderFeastCorp: 'Leak', programElderFeastStreet: 'Dump', programElderHidden: 'Whisper',
  wetwareBaby: 'Pod', wetwareTeenCorp: 'Graft', wetwareTeenStreet: 'Edge', wetwareTeenHidden: 'Zero',
  wetwareAdultBreachCorp: 'Razor', wetwareAdultBreachStreet: 'Solo', wetwareAdultDodgeCorp: 'Wired', wetwareAdultDodgeStreet: 'Chipped',
  wetwareAdultTuneCorp: 'Mentat', wetwareAdultTuneStreet: 'Gibson', wetwareAdultFeastCorp: 'Nutri', wetwareAdultFeastStreet: 'Leech', wetwareAdultHidden: 'Blank',
  wetwareElderBreachCorp: 'Lancet', wetwareElderBreachStreet: 'Frag', wetwareElderDodgeCorp: 'Plat', wetwareElderDodgeStreet: 'Surge',
  wetwareElderTuneCorp: 'Savant', wetwareElderTuneStreet: 'Observer', wetwareElderFeastCorp: 'Broth', wetwareElderFeastStreet: 'Helminth', wetwareElderHidden: 'Cipher',
};
// The hidden Rogue egg's names (decided, maintainer; docs/NETLING_2_ROGUE_DRAFTS.md, section 8). Kept apart from FORM_NAMES, which
// holds the three launch eggs' 66 forms (its tests count them and give each body chatter lines; Rogue has neither yet).
export const ROGUE_NAMES = {
  rogueBaby: 'Foundling', rogueTeen: 'Alias',
  rogueAdultBreach: 'Mole', rogueAdultDodge: 'Skip', rogueAdultTune: 'Spook', rogueAdultFeast: 'Drop',
  rogueElderBreach: 'Sleeper', rogueElderDodge: 'Exile', rogueElderTune: 'Handler', rogueElderFeast: 'Stash',
};
export const nameOf = (id) => FORM_NAMES[id] ?? ROGUE_NAMES[id] ?? id;
