// The tutorial run's wording per egg (docs/NETLING_2_NETRUN_DRAFTS.md, section 7): the nudge before the first run, the five tip
// captions, the node hints the tutorial shows, the run log lines it prints, and the party hat gift line. Drafts for the maintainer to
// edit; not wired into any game. Shaped on 1.0's own text: `TUTORIAL_TIPS` and `TYPE_HINT` in src/netrun/view.js, the `note()` lines in
// src/netrun/run.js and `finishOnboarding` / `renderNudge` in src/ui/onboarding.js.
//
// Registers (care drafts): Program is bureaucratic and technical, Iron physical and procedural, Wetware street-level and plain (no CP2020
// jargon in game text). Meter words are the egg's own (care drafts, Meters): Program CHG, INT, HEAT; Iron PWR, INT, HEAT; Wetware FOOD,
// HLTH, TEMP. The controls and the button names the player must find on screen (CONTINUE, JACK OUT, ARCHIVE > STYLE) and the node label
// ICE stay as 1.0 has them, in every egg. Log lines take {item}, {dmg}, {bonus} and {scrip}.
//
// Rules the tests check (checkTutorialText): two tip lines of at most TIP_WIDTH characters, hints of at most HINT_WIDTH, lowercase except
// the fixed labels, no digit, no em dash, and every tip says what it has to teach.
export const TIP_WIDTH = 45; // the longest 1.0 tip line is 45; the tip box holds about that many at size 18
export const HINT_WIDTH = 35; // the longest 1.0 node hint is 35; the hint starts at x 150 on the 400 wide screen
export const TUTORIAL_EGGS = ['program', 'iron', 'wetware'];
export const TIP_KEYS = ['cache', 'ice', 'relay', 'exit', 'relayChoice'];
export const HINT_KEYS = ['cache', 'ice', 'relay', 'exit'];
export const LOG_KEYS = ['cacheCracked', 'cacheEmpty', 'iceWon', 'iceLost', 'relay', 'exit'];
// Words that stay in capitals: labels the player sees on screen.
export const FIXED = ['ICE', 'CONTINUE', 'JACK OUT', 'ARCHIVE', 'STYLE', 'A', '◀', '▶'];
export const CONTROLS = '◀ ▶ picks a node, A moves.';

export const TUTORIAL_TEXT = {
  program: {
    nudge: 'spare cycles logged. permission to go out?',
    tips: {
      cache: [`moves draw charge. ${CONTROLS}`, 'caches may hold items. this one does.'],
      ice: ['ICE enforces access. pass the mini-game,', 'or it takes integrity as a penalty.'],
      relay: ['relays restore charge and shed heat.', 'bank your loot here, or continue.'],
      exit: ['the exit banks everything you found,', 'plus a bonus. end the session.'],
      relayChoice: ['CONTINUE to reach the exit.', 'JACK OUT closes the run safely here.'],
    },
    hints: { cache: 'may hold an item.', ice: 'a mini-game. fail and it bites.', relay: 'recharge, cool down, safe jack-out.', exit: 'bank everything + a bonus.' },
    log: {
      cacheCracked: 'cache opened: {item}.',
      cacheEmpty: 'cache empty.',
      iceWon: 'ICE cleared. recovered {item}.',
      iceLost: 'ICE retaliated. -{dmg} integrity.',
      relay: 'relay reached. charge restored, heat shed.',
      exit: 'exit node. committed: {bonus}, {scrip} scrip.',
    },
    gift: 'issued: party hat. accessories live in ARCHIVE > STYLE.',
  },
  iron: {
    nudge: 'idle. the queue is empty. take me out?',
    tips: {
      cache: [`moves draw power. ${CONTROLS}`, 'a sealed crate may hold items. this one does.'],
      ice: ['ICE is a lockout. clear the mini-game,', 'or it hammers integrity.'],
      relay: ['relays top up power and vent heat.', 'bank your haul here, or press on.'],
      exit: ['the exit banks everything you hauled,', 'plus a bonus. bring it home.'],
      relayChoice: ['CONTINUE to reach the exit.', 'JACK OUT stops the run safely here.'],
    },
    hints: { cache: 'a sealed crate. may hold an item.', ice: 'lockout game. lose and it hits.', relay: 'top up power, vent heat, jack out.', exit: 'bank the haul + a bonus.' },
    log: {
      cacheCracked: 'crate forced: {item}.',
      cacheEmpty: 'crate was empty.',
      iceWon: 'ICE shut down. pulled {item}.',
      iceLost: 'ICE hit back. -{dmg} integrity.',
      relay: 'relay found. power topped up, heat vented.',
      exit: 'exit node. hauled out: {bonus}, {scrip} scrip.',
    },
    gift: 'a gift: party hat. fit it in ARCHIVE > STYLE.',
  },
  wetware: {
    nudge: 'i want to see what is out there. take me?',
    tips: {
      cache: [`moves burn food. ${CONTROLS}`, 'a pouch may hold items. this one does.'],
      ice: ['ICE is a guard. beat the mini-game,', 'or it hurts, and that costs health.'],
      relay: ['relays are a rest. you eat and cool off.', 'bank your loot here, or push on.'],
      exit: ['the exit banks everything you carried,', 'plus a bonus. take it home.'],
      relayChoice: ['CONTINUE to reach the exit.', 'JACK OUT ends the run safely here.'],
    },
    hints: { cache: 'a pouch. might hold an item.', ice: 'a guard game. lose and it hurts.', relay: 'rest, cool off, safe jack-out.', exit: 'bank it all + a bonus.' },
    log: {
      cacheCracked: 'the pouch held {item}.',
      cacheEmpty: 'the pouch was empty.',
      iceWon: 'the guard backed off. you got {item}.',
      iceLost: 'the guard hurt you. -{dmg} health.',
      relay: 'a relay. you rested and cooled off.',
      exit: 'the exit. you brought home {bonus}, {scrip} scrip.',
    },
    gift: 'a gift: party hat. dress up in ARCHIVE > STYLE.',
  },
};

// A log line with its values filled in.
export const tutorialLog = (egg, key, vars = {}) => TUTORIAL_TEXT[egg].log[key].replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));

// What every tip has to teach (the same in every egg; the words around it are the egg's).
const TEACHES = {
  cache: [(l) => l.includes(CONTROLS)],
  ice: [(l) => l.includes('ICE')],
  relay: [(l) => /relay/.test(l), (l) => /bank/.test(l)],
  exit: [(l) => /bank/.test(l), (l) => /bonus/.test(l)],
  relayChoice: [(l) => l.includes('CONTINUE'), (l) => l.includes('JACK OUT')],
};

// -> a list of problems (empty when fine).
export function checkTutorialText(text = TUTORIAL_TEXT) {
  const out = [];
  const plain = (s) => FIXED.reduce((acc, f) => acc.split(f).join(''), s).replace(/\{\w+\}/g, '');
  const checkLine = (where, s, max) => {
    if (typeof s !== 'string' || !s) return out.push(`${where}: empty`);
    if (max && [...s].length > max) out.push(`${where}: ${[...s].length} characters (max ${max})`);
    if (plain(s) !== plain(s).toLowerCase()) out.push(`${where}: capitals outside the fixed labels`);
    if (/\d/.test(s)) out.push(`${where}: a digit`);
    if (/[—–]/.test(s)) out.push(`${where}: a dash`);
    if (/\p{Extended_Pictographic}/u.test(plain(s))) out.push(`${where}: an emoji`);
  };
  for (const egg of TUTORIAL_EGGS) {
    const t = text[egg];
    if (!t) { out.push(`${egg}: missing`); continue; }
    checkLine(`${egg}.nudge`, t.nudge, 50);
    for (const k of TIP_KEYS) {
      const lines = t.tips?.[k];
      if (!Array.isArray(lines) || lines.length !== 2) { out.push(`${egg}.tips.${k}: needs two lines`); continue; }
      lines.forEach((l, i) => checkLine(`${egg}.tips.${k}[${i}]`, l, TIP_WIDTH));
      for (const test of TEACHES[k]) if (!lines.some(test)) out.push(`${egg}.tips.${k}: missing what it teaches (${test})`);
    }
    for (const k of HINT_KEYS) checkLine(`${egg}.hints.${k}`, t.hints?.[k], HINT_WIDTH);
    for (const k of LOG_KEYS) {
      checkLine(`${egg}.log.${k}`, t.log?.[k], 60);
    }
    checkLine(`${egg}.gift`, t.gift, 60);
    if (!t.gift?.includes('ARCHIVE > STYLE')) out.push(`${egg}.gift: must point to ARCHIVE > STYLE`);
    for (const [k, vars] of [['cacheCracked', ['item']], ['iceWon', ['item']], ['iceLost', ['dmg']], ['exit', ['bonus', 'scrip']]]) {
      for (const v of vars) if (!t.log?.[k]?.includes(`{${v}}`)) out.push(`${egg}.log.${k}: missing {${v}}`);
    }
  }
  return out;
}
