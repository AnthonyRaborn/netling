import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fakeCanvas, badArgs } from './helpers/fake-canvas.js';

// render.js makes an offscreen canvas when it loads; give it a fake document before importing it.
const offscreen = [];
globalThis.document = { createElement: () => offscreen[offscreen.push(fakeCanvas(40, 28)) - 1] };
const { renderLCD, GLITCH_STEP_MS, SURGE_MS } = await import('../src/render.js');
const { FLASH_TOGGLE_MS } = await import('../src/games/common.js');
const { createScript, tick, mulberry32, SPECIES, PALETTES, IDLES, CFG, MIN } = await import('../src/sim.js');
const { ACCESSORIES, PROPS } = await import('../src/accessories.js');
const { GameSession, GAMES } = await import('../src/games/session.js');
const { GAME_IDS } = await import('../src/sim.js');
const { RunView } = await import('../src/netrun/view.js');
const { startRun } = await import('../src/netrun/run.js');
const { REGION_ORDER } = await import('../src/netrun/regions.js');

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const PAL = { main: '#05d9e8', accent: '#ff2a6d' };

function netling(form = 'bitling', stage = 'baby') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.stage = stage;
  s.form = form;
  return s;
}

// --- the home screen -----------------------------------------------------------------------------

function render(s, time = 1234, opts = {}) {
  const canvas = fakeCanvas(400, 280);
  renderLCD(canvas, s, time, opts);
  assert.ok(canvas.ctx.calls.length > 0, 'something was drawn');
  const bad = badArgs(canvas.ctx);
  assert.deepEqual(bad, [], `non-finite draw arguments: ${JSON.stringify(bad[0])}`);
  return canvas;
}

test('every form draws in every stage of its life without a broken layout', () => {
  for (const [form, { stage }] of Object.entries(SPECIES)) {
    for (const time of [0, 499, 500, 1750, 4999, 123_456]) render(netling(form, stage), time);
  }
  render(createScript({ now: T0, rng: mulberry32(1) })); // compiling
  const dead = netling('daemon', 'dead');
  dead.deathCause = 'neglect';
  render(dead);
  const echo = netling('kernel', 'dead'); // died before adulthood
  render(echo);
});

test('sleeping, napping, dark, rebooting and visiting all draw', () => {
  const at = (mutate, opts) => {
    const s = netling('chrome', 'adult');
    mutate(s);
    render(s, 2000, opts);
  };
  at((s) => (s.asleep = true));
  at((s) => ((s.asleep = true), (s.lightsOn = false)));
  at((s) => (s.nap = { startedAge: s.ageMin }));
  at((s) => (s.lightsOn = false));
  at((s) => (s.rebootUntilAge = s.ageMin + 15));
  at((s) => (s.visit = { startedAge: s.ageMin, len: 8, form: 'ghost', palette: 2, accessory: 'crown' }));
  for (const idle of IDLES) at((s) => (s.quirk.idle = idle));
  for (let p = 0; p < PALETTES.length; p++) at((s) => (s.quirk.palette = p));
});

test('every alert and every degraded state draws', () => {
  const at = (mutate) => {
    const s = netling('glitch', 'adult');
    mutate(s);
    for (const time of [0, 600, 1300]) render(s, time);
  };
  for (let n = 1; n <= CFG.maxCache; n++) at((s) => (s.cache = n));
  at((s) => (s.virus = true));
  for (const type of ['trace', 'attack', 'overflow']) at((s) => (s.event = { type, startedAge: s.ageMin }));
  at((s) => ((s.virus = true), (s.event = { type: 'trace', startedAge: s.ageMin })));
  at((s) => (s.stats.integrity = 3));
  at((s) => (s.stats.heat = 99));
  at((s) => (s.stats.charge = 0));
});

test('every accessory, prop, reaction and flourish draws on every form', () => {
  for (const form of Object.keys(SPECIES)) {
    const s = netling(form, SPECIES[form].stage);
    for (const acc of ACCESSORIES) render(s, 900, { accessory: acc.id });
    for (const prop of PROPS) render(s, 900, { prop: prop.id, propExtra: prop.id === 'plush' ? { sprite: ['#o', '+#'], colors: { '#': '#fff', o: '#000', '+': '#888' } } : null });
    for (const kind of ['eat', 'patch', 'purge', 'cool', 'item', 'play', 'refuse']) {
      for (const t of [0, 0.3, 0.5, 0.8, 1]) render(s, 900, { anim: { kind, t } });
    }
    render(s, 130, { flash: true, accessory: 'cap' });
    render(s, 60, { surge: true });
    render(s, 60, { calm: true, surge: true, anim: { kind: 'refuse', t: 0.2 } });
  }
});

// --- flash safety: no more than three flashes a second ----------------------------------------------

// Everything one frame draws: [the offscreen LCD buffer's calls, the screen canvas's calls].
function frameAt(s, time, opts = {}) {
  const buf = offscreen[0].ctx.calls;
  const before = buf.length;
  const canvas = fakeCanvas(400, 280);
  renderLCD(canvas, s, time, opts);
  return [JSON.stringify(buf.slice(before)), JSON.stringify(canvas.ctx.calls)];
}

// How often a yes/no look changes over `ms` of 60 fps frames.
function changes(ms, look) {
  let n = 0;
  let prev;
  for (let t = 5000; t < 5000 + ms; t += 1000 / 60) {
    const now = look(t);
    if (prev !== undefined && now !== prev) n++;
    prev = now;
  }
  return n;
}

test('the evolution strobe flashes at most three times a second', () => {
  assert.ok(FLASH_TOGGLE_MS >= 1000 / 6);
  const s = netling('bitling', 'teen');
  const strobing = (t) => frameAt(s, t, { calm: true, flash: true })[0] !== frameAt(s, t, { calm: true })[0];
  assert.ok(changes(3000, strobing) <= 3 * 3 * 2, 'more than three flashes a second');
  assert.ok(changes(3000, strobing) > 0, 'the strobe never showed');
});

test('a power surge is one fading flash, not a flicker', () => {
  const s = netling();
  const alphas = [];
  for (let t = 0; t <= SURGE_MS; t += 1000 / 60) {
    const [, screen] = frameAt(s, 5000 + t, { surge: 1 - t / SURGE_MS });
    const white = JSON.parse(screen).find(([k, [v]]) => k === '=fillStyle' && String(v).startsWith('rgba(255, 255, 255,'));
    alphas.push(white ? parseFloat(white[1][0].split(',').pop()) : 0);
  }
  assert.ok(alphas[0] > 0.3, 'no flash at the start');
  assert.ok(alphas.every((a, i) => i === 0 || a <= alphas[i - 1]), `the overlay brightened again: ${alphas.join(' ')}`);
  assert.equal(frameAt(s, 5000, { surge: 0 })[1].includes('255, 255, 255'), false, 'a finished surge still draws');
});

test('the glitch changes its look at most three times a second', () => {
  assert.ok(GLITCH_STEP_MS >= 1000 / 3);
  const s = netling('glitch', 'adult');
  s.stats.integrity = 5;
  s.virus = true;
  // The screen canvas only copies the buffer, with the glitch's offsets: its calls change with the glitch alone.
  const look = (t) => frameAt(s, t)[1];
  const n = changes(3000, look);
  assert.ok(n <= 9, `the glitch changed ${n} times in 3 seconds`);
  assert.ok(n > 0, 'the glitch never showed');
  assert.equal(changes(3000, (t) => frameAt(s, t, { calm: true })[1]), 0, 'calm mode still glitches');
});

// --- mini-games ------------------------------------------------------------------------------------

test('every mini-game draws through its intro, play and result cards', () => {
  assert.deepEqual(Object.keys(GAMES).sort(), [...GAME_IDS].sort());
  for (const id of GAME_IDS) {
    for (const play of ['idle', 'mash', 'quit']) {
      const rng = mulberry32(5);
      const session = new GameSession(id, { rng, sound: () => {}, onFinish: () => {} });
      const canvas = fakeCanvas();
      session.draw(canvas.ctx, PAL, 0); // intro card
      session.input('a');
      let time = 0;
      for (let i = 0; i < 1200 && session.phase !== 'result'; i++) {
        time += 50;
        if (play === 'mash' && i % 3 === 0) session.input(['left', 'right', 'a'][(i / 3) % 3]);
        if (play === 'quit' && i === 40) session.forfeit();
        session.update(0.05);
        if (i % 4 === 0) session.draw(canvas.ctx, PAL, time);
      }
      assert.equal(session.phase, 'result', `${id}/${play} never finished`);
      session.draw(canvas.ctx, PAL, time); // result card
      assert.ok(canvas.ctx.calls.length > 0);
      assert.deepEqual(badArgs(canvas.ctx), [], `${id}/${play}`);
    }
  }
});

// --- the netrun view -------------------------------------------------------------------------------

// Plays a whole run through the view's own input, forcing ICE fights to a result, drawing at every step.
function playThrough(region, seed, { winIce = true } = {}) {
  const pet = netling('daemon', 'adult');
  pet.stats.charge = 100;
  pet.stats.integrity = 100;
  const rng = mulberry32(seed);
  startRun(pet, region, rng);
  let closed = null;
  const view = new RunView(pet, { rng, sound: () => {}, onClose: (run) => (closed = run) });
  const canvas = fakeCanvas();
  for (let step = 0; step < 200 && pet.run; step++) {
    view.draw(canvas.ctx, PAL, step * 100);
    if (view.game) {
      view.game.input('a'); // past the intro card
      view.game.game.done = true;
      view.game.game.won = winIce;
      view.update(0.05);
      view.update(3); // result card, then the fight reports
    } else if (pet.run.phase === 'choice' && pet.run.pending.options[view.choiceCursor]?.disabled) {
      view.input('right'); // a market it can't afford: move on to what it can pick
    } else {
      view.input('a');
    }
    pet.stats.charge = Math.max(pet.stats.charge, 50); // keep the walk going: this test is about drawing and input
    pet.stats.heat = Math.min(pet.stats.heat, 40);
    if (pet.run?.phase === 'done') {
      view.draw(canvas.ctx, PAL, step * 100 + 50); // the summary card
      view.input('a');
    }
  }
  assert.deepEqual(badArgs(canvas.ctx), [], `${region}/${seed}`);
  return { pet, closed, canvas };
}

test('the run view can be played from entry to the summary card in every region', () => {
  for (const region of REGION_ORDER) {
    for (const seed of [1, 2, 3]) {
      const { pet, closed, canvas } = playThrough(region, seed);
      assert.equal(pet.run, null, `${region}/${seed}: run never closed`);
      assert.ok(closed && closed.result, `${region}/${seed}: no result reported`);
      assert.ok(canvas.ctx.calls.length > 100);
    }
  }
});

test('the run view survives lost ICE fights, forfeiting and resuming mid-fight', () => {
  for (const seed of [4, 5]) playThrough('corp', seed, { winIce: false });

  const pet = netling('teen', 'teen');
  pet.stats.charge = 100;
  const rng = mulberry32(9);
  startRun(pet, 'public', rng);
  const events = [];
  const view = new RunView(pet, { rng, sound: () => {}, onClose: (run) => events.push(run.result) });
  view.forfeit(); // first press only arms the abort
  assert.ok(pet.run && pet.run.phase !== 'done');
  view.forfeit(); // second press bails out
  assert.equal(pet.run.result, 'aborted');
  view.forfeit(); // on the summary card a press just closes it
  assert.equal(pet.run, null);
  assert.deepEqual(events, ['aborted']);

  // A reload during an ICE fight resumes it from the saved run.
  const resumed = netling('teen', 'teen');
  resumed.stats.charge = 100;
  startRun(resumed, 'public', mulberry32(9));
  resumed.run.phase = 'ice';
  resumed.run.pending = { game: 'tune' };
  const again = new RunView(resumed, { rng, sound: () => {} });
  assert.ok(again.game, 'the fight was resumed');
  const canvas = fakeCanvas();
  again.draw(canvas.ctx, PAL, 0);
  assert.deepEqual(badArgs(canvas.ctx), []);
});
