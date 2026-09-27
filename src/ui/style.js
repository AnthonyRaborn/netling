// Style: earned items and their announcements, unlock checks, and the wardrobe (Archive > STYLE).
import { PALETTES } from '../sim.js';
import { COSMETICS, SLOTS, LABEL, cosmeticById, unlockedIds, resolveWardrobe, sanitizeLabel } from '../cosmetics.js';
import { ACCESSORIES, PROPS, STYLE_ITEMS, accessoryById, accessoryHint, accessoryColors } from '../accessories.js';
import { formSprite } from '../sprites.js';
import { setLcdTint } from '../render.js';
import { setGameBg } from '../games/common.js';
import { sfx, setSoundPack } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, flashStatus, store } from './app.js';

// Bank accessories a finished run left on the pet into the shared collection.
export function drainAccessoryInbox() {
  const inbox = app.state.accessoryInbox ?? [];
  if (!inbox.length) return;
  const fresh = inbox.filter((id) => !app.ownedAccessories.includes(id));
  app.ownedAccessories.push(...fresh);
  app.state.accessoryInbox = [];
  store.set(KEYS.accessories, app.ownedAccessories);
  if (fresh.length) {
    setTimeout(() => flashStatus(`style: ${fresh.map((id) => accessoryById(id).name.toLowerCase()).join(', ')} added. equip it in the archive.`), 1900);
  }
}

// Earned style items: granted by moments, never sold. Announced once.
export function grantStyle(id, message) {
  if (app.ownedAccessories.includes(id)) return;
  app.ownedAccessories.push(id);
  store.set(KEYS.accessories, app.ownedAccessories);
  if (message) queueNotice(message);
}

// Grant messages play one after another instead of overwriting each other.
const notices = [];
let noticeBusy = false;
function queueNotice(message) {
  notices.push(message);
  if (!noticeBusy) nextNotice();
}
function nextNotice() {
  const msg = notices.shift();
  if (!msg) {
    noticeBusy = false;
    return;
  }
  noticeBusy = true;
  setTimeout(() => {
    flashStatus(msg);
    sfx('win', app.state.quirk.pitch);
    setTimeout(nextNotice, 2000);
  }, 400);
}

// Saves from before these items existed get what they've already earned.
export function backfillEarned() {
  const { lineage } = app;
  if (app.onboarding === 'done' && (app.state.stage !== 'script' || lineage.length)) grantStyle('partyhat', 'a gift: party hat. happy first birthday.');
  if (lineage.length) grantStyle('plush', 'a keepsake: a plush of your last netling.');
  if (app.state.rootUsed) grantStyle('bandage', 'earned: bandage. it came back once.');
}

// The plush looks like the previous netling, in its colors.
export function plushExtra() {
  const { lineage } = app;
  const e = lineage[lineage.length - 1];
  if (!e) return null;
  const form = e.realized ? e.form : e.teenForm ?? 'bitling';
  const pal = PALETTES[e.palette ?? 0] ?? PALETTES[0];
  return { sprite: formSprite(form, 'a'), colors: { '#': pal.main, o: pal.accent, '+': '#f5f5f5' } };
}

// Counts toward every non-streak game unlock, from PLAY and from netrun ICE alike.
export function countGame() {
  app.progress.gamesPlayed = (app.progress.gamesPlayed ?? 0) + 1;
  store.set(KEYS.progress, app.progress);
  checkUnlocks();
}

export function countAct(action) {
  app.progress.acts = { ...app.progress.acts, [action]: (app.progress.acts?.[action] ?? 0) + 1 };
  store.set(KEYS.progress, app.progress);
  checkUnlocks();
}

function unlockContext() {
  return { dex: app.dex, codex: app.codex, lineage: app.lineage, generation: app.state.generation, progress: app.progress };
}

// Announce anything newly earned. First run of a save just records what's already earned.
export function checkUnlocks({ silent = false } = {}) {
  const ctx = unlockContext();
  const earnedNow = [...unlockedIds(ctx), ...(LABEL.check(ctx) ? ['label'] : [])];
  const fresh = earnedNow.filter((id) => !app.unlocked.includes(id));
  if (!fresh.length) return;
  app.unlocked = [...new Set([...app.unlocked, ...earnedNow])];
  store.set(KEYS.unlocked, app.unlocked);
  if (COSMETICS.shell.every((c) => app.unlocked.includes(`shell:${c.id}`))) {
    grantStyle('minidevice', 'secret: a mini device. it has a pet of its own.');
  }
  // Free items (e.g. defaults added in an update) join quietly.
  const earned = fresh.filter((id) => {
    if (id === 'label') return true;
    const [slot, cid] = id.split(':');
    return !cosmeticById(slot, cid).free;
  });
  if (silent || !earned.length) return;
  earned.forEach((id) => app.freshUnlocks.add(id));
  const names = earned.map((id) => {
    if (id === 'label') return 'device label';
    const [slot, cid] = id.split(':');
    return cosmeticById(slot, cid).name.toLowerCase();
  });
  flashStatus(`style unlocked: ${names.join(', ')}.`);
  sfx('win', app.state.quirk.pitch);
}

function setWardrobe(next) {
  app.wardrobe = next;
  store.set(KEYS.wardrobe, app.wardrobe);
}

export function applyWardrobe() {
  const w = resolveWardrobe(app.wardrobe, app.unlocked);
  const device = document.querySelector('.device');
  device.className = `device shell-${w.shell}`;
  const tint = cosmeticById('tint', w.tint);
  setLcdTint(tint.lcd, tint.dark);
  setGameBg(tint.lcd);
  document.querySelector('.screen').className = `screen fx-${w.effect}`;
  const pack = cosmeticById('sound', w.sound);
  setSoundPack(pack.wave, pack.mult);
  const label = app.unlocked.includes('label') ? sanitizeLabel(app.wardrobe.label) : LABEL.fallback;
  document.querySelector('.logo').textContent = label;
}

export function renderWardrobe() {
  const w = resolveWardrobe(app.wardrobe, app.unlocked);
  const total = SLOTS.reduce((n, s) => n + COSMETICS[s].length, 0) + 1 + STYLE_ITEMS.length; // + label + accessories/props
  $('wardrobe-count').textContent = `${app.unlocked.length + app.ownedAccessories.length}/${total}`;
  const labels = { shell: 'SHELL', tint: 'SCREEN TINT', effect: 'SCREEN EFFECT', sound: 'SOUND PACK' };
  $('wardrobe-list').replaceChildren(
    ...SLOTS.flatMap((slot) => {
      const h = document.createElement('h3');
      h.textContent = labels[slot];
      const grid = document.createElement('div');
      grid.className = 'wardrobe-grid';
      for (const c of COSMETICS[slot]) {
        const key = `${slot}:${c.id}`;
        const open = app.unlocked.includes(key);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `cosmetic${open ? '' : ' locked'}${app.freshUnlocks.has(key) ? ' new' : ''}`;
        b.setAttribute('aria-pressed', open && w[slot] === c.id);
        const sw = document.createElement('span');
        sw.className = 'sw';
        sw.style.background = open ? c.swatch ?? 'transparent' : 'transparent';
        if (slot === 'effect') sw.textContent = open ? '~' : '';
        if (slot === 'sound') sw.textContent = open ? '♪' : '';
        const name = document.createElement('span');
        name.textContent = open ? c.name : '???';
        const hint = document.createElement('span');
        hint.className = 'ch';
        hint.textContent = open ? (w[slot] === c.id ? 'equipped' : 'tap to equip') : c.hint;
        b.append(sw, name, hint);
        if (open) {
          b.addEventListener('click', () => {
            setWardrobe({ ...app.wardrobe, ...w, [slot]: c.id });
            app.freshUnlocks.delete(key);
            applyWardrobe();
            sfx(slot === 'sound' ? 'feed' : 'select', app.state.quirk.pitch); // sound packs preview themselves
            renderWardrobe();
          });
        } else {
          b.disabled = true;
        }
        grid.append(b);
      }
      return [h, grid];
    }),
    ...styleItemSection('accessory', 'ACCESSORY', ACCESSORIES),
    ...colorSection(),
    ...styleItemSection('prop', 'PROP', PROPS),
    ...labelSection(),
  );
}

// Color pickers for the equipped accessory, if it's recolorable.
function colorSection() {
  const id = app.wardrobe.accessory;
  const acc = app.ownedAccessories.includes(id) ? accessoryById(id) : null;
  if (!acc?.colors) return [];
  const current = accessoryColors(id, app.wardrobe.colors?.[id]);
  const row = document.createElement('div');
  row.className = 'color-row';
  const label = document.createElement('span');
  label.textContent = `${acc.name.toLowerCase()} colors`;
  row.append(label);
  acc.colors.forEach(([name], i) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = current[i];
    input.setAttribute('aria-label', `${acc.name} ${name} ${i + 1}`);
    input.addEventListener('input', () => {
      current[i] = input.value;
      setWardrobe({ ...app.wardrobe, colors: { ...app.wardrobe.colors, [id]: [...current] } });
    });
    row.append(input);
  });
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'pref';
  reset.textContent = 'RESET';
  reset.addEventListener('click', () => {
    const { [id]: _, ...rest } = app.wardrobe.colors ?? {};
    setWardrobe({ ...app.wardrobe, colors: rest });
    renderWardrobe();
  });
  row.append(reset);
  return [row];
}

// One wardrobe section for owned style items (worn accessories or ground props).
function styleItemSection(key, title, items) {
  const h = document.createElement('h3');
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'wardrobe-grid';
  const current = app.ownedAccessories.includes(app.wardrobe[key]) ? app.wardrobe[key] : 'none';
  for (const x of [{ id: 'none', name: 'None' }, ...items]) {
    const owned = x.id === 'none' || app.ownedAccessories.includes(x.id);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `cosmetic${owned ? '' : ' locked'}`;
    b.setAttribute('aria-pressed', owned && current === x.id);
    const sw = document.createElement('span');
    sw.className = 'sw';
    sw.textContent = owned && x.id !== 'none' ? (key === 'prop' ? '▣' : '✦') : '';
    const name = document.createElement('span');
    name.textContent = owned ? x.name : '???';
    const hint = document.createElement('span');
    hint.className = 'ch';
    hint.textContent = owned ? (current === x.id ? 'equipped' : 'tap to equip') : accessoryHint(x);
    b.append(sw, name, hint);
    if (owned) {
      b.addEventListener('click', () => {
        setWardrobe({ ...app.wardrobe, [key]: x.id });
        sfx('select', app.state.quirk.pitch);
        renderWardrobe();
      });
    } else {
      b.disabled = true;
    }
    grid.append(b);
  }
  return [h, grid];
}

function labelSection() {
  const h = document.createElement('h3');
  h.textContent = 'DEVICE LABEL';
  const row = document.createElement('div');
  row.className = 'label-row';
  if (!app.unlocked.includes('label')) {
    const hint = document.createElement('div');
    hint.className = 'cosmetic locked';
    hint.textContent = `??? ${LABEL.hint}`;
    row.append(hint);
    return [h, row];
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = LABEL.max;
  input.value = sanitizeLabel(app.wardrobe.label);
  input.setAttribute('aria-label', 'Device label');
  input.spellcheck = false;
  const set = document.createElement('button');
  set.type = 'button';
  set.textContent = 'SET';
  const commit = () => {
    setWardrobe({ ...app.wardrobe, label: sanitizeLabel(input.value) });
    input.value = app.wardrobe.label;
    applyWardrobe();
    sfx('select', app.state.quirk.pitch);
  };
  set.addEventListener('click', commit);
  input.addEventListener('keydown', (e) => {
    e.stopPropagation(); // keep game keys out of the text box
    if (e.key === 'Enter') commit();
  });
  row.append(input, set);
  return [h, row];
}
