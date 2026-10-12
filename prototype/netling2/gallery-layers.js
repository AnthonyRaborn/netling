// The "layers" section of the generated galleries (make-gallery.mjs): the prototype's temper tell, neglect and bugs on every
// form of the egg, drawn by the 2.0 renderer pass (render.js), as the review page is, with the gallery's own
// palette, tint, scale, calm, live, time and wearable controls. The gallery's renderer does not run these layers; this section
// draws them beside it. Everything here is a pure view of the sprites; nothing is stored.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';
import { MAX_BUGS } from './glitch.js';
import { QUIRKS } from './idle.js';
import { drawLCD } from './render.js';

const SETS = { iron: () => forms('B'), program: programForms, wetware: wetwareForms, rogue: rogueForms };
const CROP = { x: 5, y: 0, w: 30, h: 24 }; // the part of the 40x28 screen that holds a pet
const FULL_WIDTH = { x: 0, y: 0, w: 40, h: 24 }; // a visiting pet stands at the right edge, outside CROP
const LEVELS = [[-2, 'strongly unsteady'], [-1, 'unsteady'], [0, 'middle'], [1, 'steady'], [2, 'strongly steady']];
const SEED = 1;
let quirk = 'none'; // the 1.0 idle shown under the temper tell (the section's own control)

// One picture: the form with a layer state, drawn by the 2.0 renderer pass (render.js) and cropped. `tell` false draws the still pose.
function picture(env, f, state) {
  const crop = state.visit ? FULL_WIDTH : CROP;
  const { level = 0, neglect = 0, bugs = 0, time = 0, reduced = true, idle = 'none', tell = false, egg } = state;
  const canvas = env.el('canvas', { width: crop.w, height: crop.h });
  const sc = Math.min(env.scale(), 4);
  canvas.style.width = `${crop.w * sc}px`;
  canvas.style.height = `${crop.h * sc}px`;
  const ctx = canvas.getContext('2d');
  ctx.translate(-crop.x, -crop.y);
  const pet = { form: f, egg, palette: env.palettes()[0], level: tell ? level : 0, seed: SEED, idle, neglect, bugs, visit: Boolean(state.visit), worn: env.worn().map((id) => ({ id })) };
  const tint = env.tint();
  drawLCD(ctx, pet, tell ? time : 0, { reduced: tell ? reduced : true, tint: { lcd: tint.lcd, dark: tint.dark ?? tint.lcd } });
  return canvas;
}

// A grid of forms by columns of layer states. `live` columns are redrawn each frame in live mode.
function table(env, set, egg, columns, live) {
  const g = env.grid(columns.length, columns.map((c) => c.head));
  for (const f of Object.values(set)) {
    g.append(env.el('span', { textContent: f.id }));
    for (const col of columns) {
      let canvas = null;
      const draw = (now) => {
        const next = picture(env, f, { ...col.state, egg, time: live ? (env.P.live === '1' ? now : Number(env.P.t) || 0) : 0, reduced: live ? env.P.calm === '1' && env.P.live !== '1' : true, idle: live ? quirk : 'none', tell: live });
        if (canvas) canvas.replaceWith(next);
        canvas = next;
      };
      draw(0);
      g.append(canvas);
      if (live) env.addCell({ draw });
    }
  }
  return g;
}

export function layersSection(env, egg) {
  const set = SETS[egg]();
  const root = env.section('layers', 'Layers: neglect, bugs and temper (prototype)',
    'Not part of 1.0\'s renderer: the prototype\'s layers drawn on this egg\'s forms with the controls above (palette, tint, scale, wearables, time; calm = reduced motion; live animates). Neglect is the reversible look from unmet needs (level 1 worn, 2 neglected); bugs are persistent tears (0 to 5), shown still; the temper tell is the motion at each level, with the egg\'s own skin. Spoilers as the rest of the gallery.');
  root.append(env.el('h3', { textContent: 'Neglect and bugs (still, A frame)' }));
  const bugColumns = Array.from({ length: MAX_BUGS }, (_, i) => ({ head: `bugs ${i + 1}`, state: { bugs: i + 1 } }));
  root.append(table(env, set, egg, [
    { head: 'clean', state: {} },
    { head: 'neglect 1', state: { neglect: 1 } },
    { head: 'neglect 2', state: { neglect: 2 } },
    ...bugColumns,
    { head: 'neglect 2 + bugs 3', state: { neglect: 2, bugs: 3 } },
    { head: 'neglect 2 + bugs 5', state: { neglect: 2, bugs: 5 } },
  ], false));
  root.append(env.el('h3', { textContent: 'Temper tell (turn live on to see it move; calm = reduced motion)' }));
  const bar = env.el('p', { className: 'note' });
  bar.append('1.0 idle under the tell: ');
  for (const q of ['none', ...QUIRKS]) {
    const b = env.el('button', { textContent: q, className: q === quirk ? 'on' : '' });
    b.onclick = () => { quirk = q; bar.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x.textContent === q)); };
    bar.append(b, ' ');
  }
  bar.append(' a steady Iron holds the idle still around each beat. Level 0 is the 1.0 rhythm. Turn live on to see it move; with it off, the picture is the tell at the time set above (the beat is at 0, 6 s, 12 s; strong at every 3 s).');
  root.append(bar);
  root.append(table(env, set, egg, [
    ...LEVELS.map(([level, name]) => ({ head: `${level > 0 ? '+' : ''}${level} ${name}`, state: { level } })),
    // A visit pauses the motion: asked for strongly unsteady, neglect 2 and 5 bugs, it shows the neglect and the still tears, no tell and no twitch, and plays 1.0's bounce.
    { head: 'on a visit (motion paused)', state: { level: -2, neglect: 2, bugs: 5, visit: true } },
  ], true));
  return root;
}
