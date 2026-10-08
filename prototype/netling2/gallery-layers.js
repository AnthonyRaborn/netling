// The "layers" section of the generated galleries (make-gallery.mjs): the prototype's temper tell, neglect and bugs on every
// form of the egg, drawn by the same code the review page uses (tell.js, neglect.js, glitch.js, idle.js), with the gallery's own
// palette, tint, scale, calm, live, time and wearable controls. The gallery's renderer does not run these layers; this section
// draws them beside it. Everything here is a pure view of the sprites; nothing is stored.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { neglected } from './neglect.js';
import { glitched, MAX_BUGS } from './glitch.js';
import { temperTell, tellPose, idleClock } from './tell.js';
import { idleOffset, QUIRKS } from './idle.js';
import { drawSprite, paletteColors } from '../../src/sprites.js';
import { PALETTES } from '../../src/sim.js';
import { drawWorn } from '../../src/accessories.js';

const SETS = { iron: () => forms('B'), program: programForms, wetware: wetwareForms };
const CROP = { x: 5, y: 0, w: 30, h: 24 }; // the part of the 40x28 screen that holds a pet
const LEVELS = [[-2, 'strongly unsteady'], [-1, 'unsteady'], [0, 'middle'], [1, 'steady'], [2, 'strongly steady']];
const SEED = 1;
let quirk = 'none'; // the 1.0 idle shown under the temper tell (the section's own control)

// One picture: the form with a layer state, on the LCD background. `tell` null draws the still pose.
function picture(env, f, { level = 0, neglect = 0, bugs = 0, time = 0, reduced = true, idle = 'none', tell = false, egg }) {
  const t = tell ? temperTell({ egg, level, time, reduced, seed: SEED }) : { frame: 0, blink: false, dx: 0, dy: 0, shade: 1 };
  const { draw: key, wear } = tellPose(t, 'awake');
  const base = f[key];
  const anchors = f.anchors[key];
  const rusty = neglect ? neglected(base, anchors, neglect, SEED) : base;
  const look = bugs ? glitched(rusty, anchors, bugs, { time, reduced, seed: SEED }) : rusty;
  const shown = f.motion && key !== 'sleep' ? f.motion(look, anchors, { time, reduced }) : look;
  const wander = idle !== 'none' ? idleOffset(idle, base.length, idleClock({ egg, level, time })) : { x: 0, y: 0 };
  const x = Math.floor((40 - base[0].length) / 2) + t.dx + wander.x - CROP.x;
  const xShown = Math.floor((40 - shown[0].length) / 2) + t.dx + wander.x - CROP.x;
  const y = 20 - base.length + t.dy + wander.y;
  const pal = PALETTES[env.palettes()[0]];
  const canvas = env.el('canvas', { width: CROP.w, height: CROP.h });
  const sc = Math.min(env.scale(), 4);
  canvas.style.width = `${CROP.w * sc}px`;
  canvas.style.height = `${CROP.h * sc}px`;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = env.tint().lcd;
  ctx.fillRect(0, 0, CROP.w, CROP.h);
  ctx.globalAlpha = t.shade;
  drawSprite(ctx, shown, xShown, y, paletteColors(pal));
  ctx.globalAlpha = 1;
  const worn = env.worn();
  if (worn.length) drawWorn(ctx, worn.map((id) => ({ id })), f[wear], x, y, t.frame, false, time, pal);
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
  root.append(table(env, set, egg, LEVELS.map(([level, name]) => ({ head: `${level > 0 ? '+' : ''}${level} ${name}`, state: { level } })), true));
  return root;
}
