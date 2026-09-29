// The Archive dialog (lineage, record, dex, codex), the codex and dex bookkeeping behind it,
// and NL-0's transmission.
import { PALETTES, SPECIES } from '../sim.js';
import { dexEntries, discover, lineageChain } from '../archive.js';
import { REGIONS, REGION_ORDER } from '../netrun/regions.js';
import { allFragmentsFound, codexByRegion, fragmentById, FRAGMENTS } from '../netrun/codex.js';
import { drawSprite, formSprite } from '../sprites.js';
import { sfx } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, rootUnlocked, flashStatus, save, store } from './app.js';
import { checkUnlocks, renderWardrobe } from './style.js';
import { fmtAge } from './hud.js';

// Bank fragments a finished run left on the pet into the shared codex.
export function drainCodexInbox() {
  const inbox = app.state.codexInbox ?? [];
  if (!inbox.length) return;
  const wasEarned = rootUnlocked();
  const fresh = inbox.filter((id) => !app.codex.includes(id));
  app.codex.push(...fresh);
  app.state.codexInbox = [];
  store.set(KEYS.codex, app.codex);
  if (fresh.length) flashStatus(`codex updated: ${fresh.map((id) => `"${fragmentById(id).title}"`).join(', ')}.`);
  checkUnlocks();
  if (!wasEarned && allFragmentsFound(app.codex)) {
    app.progress.rootEarned = true; // earned for good: later fragments can't take it back
    store.set(KEYS.progress, app.progress);
    app.state.rootAccess = true; // the current netling is covered from this moment
    save();
    showTransmission();
  }
}

export function recordForm() {
  if (app.state.stage === 'script' || app.state.stage === 'dead') return;
  if (discover(app.dex, app.state.form)) {
    store.set(KEYS.dex, app.dex);
    if (app.state.form !== 'bitling') flashStatus(`dex updated: ${SPECIES[app.state.form].name}.`);
  }
}

export function showTransmission() {
  sfx('evolve', 220, 'sine');
  if ($('archive').open) $('archive').close();
  $('transmission').showModal();
}

function thumb(form, paletteIdx, { dead = false, locked = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'thumb';
  if (!form) return wrap;
  const sprite = formSprite(form, 'a');
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const pal = PALETTES[paletteIdx] ?? PALETTES[0];
  const colors = locked
    ? { '#': '#1c3a3f', o: '#1c3a3f', '+': '#1c3a3f' }
    : dead
      ? { '#': '#3a4a4d', o: '#1c2a2d', '+': '#3a4a4d' }
      : { '#': pal.main, o: pal.accent, '+': '#f5f5f5' };
  drawSprite(c.getContext('2d'), sprite, Math.floor((16 - sprite[0].length) / 2), 16 - sprite.length, colors);
  wrap.append(c);
  return wrap;
}

function row(thumbEl, title, lines, className = '') {
  const li = document.createElement('li');
  li.className = className;
  const body = document.createElement('div');
  const t = document.createElement('div');
  t.className = 'row-title';
  t.append(...title);
  body.append(t);
  for (const line of lines.filter(Boolean)) {
    const m = document.createElement('div');
    m.className = typeof line === 'string' ? 'row-meta' : `row-meta ${line.cls}`;
    m.textContent = typeof line === 'string' ? line : line.text;
    body.append(m);
  }
  li.append(thumbEl, body);
  return li;
}

function bold(text) {
  const b = document.createElement('b');
  b.textContent = text;
  return b;
}

// Lifetime record across every generation on this device.
function renderRecord(lineage) {
  const { progress, state } = app;
  const full = lineage.filter((e) => e.cause === 'end of life cycle').length;
  let streak = 0;
  let bestStreak = 0;
  for (const e of lineage) {
    streak = e.cause === 'end of life cycle' ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  const acts = progress.acts ?? {};
  const runs = progress.runs ?? {};
  const best = (g) => progress.streaks?.[g]?.best ?? 0;
  const rows = [
    ['LIFE'],
    ['generations', lineage.length + (state.stage === 'dead' ? 0 : 1)],
    ['full lives', full],
    ['longest full-life streak', bestStreak],
    ['CARE'],
    ['meals served', (acts.corp ?? 0) + (acts.scav ?? 0)],
    ['viruses patched', acts.patch ?? 0],
    ['caches purged', acts.purge ?? 0],
    ['traces: hid / complied', `${acts.hide ?? 0} / ${acts.comply ?? 0}`],
    ['GAMES'],
    ['games played', progress.gamesPlayed ?? 0],
    ['best streak: breach / dodge / tune / feast', `${best('breach')} / ${best('dodge')} / ${best('tune')} / ${best('feast')}`],
    ['NETRUN'],
    ['runs: jacked out / disconnected', `${runs.jacked ?? 0} / ${runs.disconnected ?? 0}`],
    ['clean jack-outs', progress.cleanJackouts ?? 0],
    ['exits from the deep', progress.deepExits ?? 0],
  ];
  $('record').replaceChildren(
    ...rows.flatMap(([k, v]) => {
      if (v === undefined) {
        const h = document.createElement('div');
        h.className = 'rh';
        h.textContent = k;
        return [h];
      }
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      return [dt, dd];
    }),
  );
}

function renderArchive() {
  const { lineage } = app;
  renderRecord(lineage);
  const chain = lineageChain(lineage, app.state);
  $('lineage-list').replaceChildren(
    ...chain.map((r) => {
      if (r.kind === 'link') {
        const li = document.createElement('li');
        li.className = r.gap ? 'link gap' : 'link';
        li.textContent = r.text;
        return li;
      }
      return row(
        thumb(r.form, r.palette, { dead: r.dead }),
        [bold(r.version), ` ${r.formLabel}`],
        [
          `${fmtAge(r.ageMin)} · ${r.status}${r.mistakes !== undefined ? ` · faults ${r.mistakes}` : ''}`,
          r.inherited ? `inherited ${r.inherited}` : null,
          r.left ? `left ${r.left}${r.keepsake ? ` + ${r.keepsake}` : ''}` : null,
          r.rescued ? { cls: 'perk', text: 'pulled back once by NL-0' } : null,
        ],
        r.dead ? '' : 'running',
      );
    }),
  );
  if (!chain.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'no generations yet.';
    $('lineage-list').replaceChildren(li);
  }

  renderWardrobe();
  $('codex-gift').hidden = !rootUnlocked();
  const groups = codexByRegion(app.codex, REGION_ORDER);
  $('codex-count').textContent = `${app.codex.length}/${FRAGMENTS.length}`;
  $('codex-list').replaceChildren(
    ...groups.flatMap((g) => {
      const r = REGIONS[g.region];
      const secret = r.requires && !app.codex.includes(r.requires) && g.found === 0;
      const h = document.createElement('h3');
      h.textContent = secret ? '??? ' : `${r.name.toUpperCase()} `;
      const count = document.createElement('span');
      count.textContent = `${g.found}/${g.total}`;
      h.append(count);
      const items = g.entries.map((e) => {
        const d = document.createElement('div');
        if (e.missing) {
          d.className = 'frag missing';
          d.textContent = '[ fragment missing ]';
        } else {
          d.className = 'frag';
          const b = document.createElement('b');
          b.textContent = e.title;
          d.append(b, e.text);
        }
        return d;
      });
      return [h, ...items];
    }),
  );

  const entries = dexEntries(app.dex);
  $('dex-count').textContent = `${entries.filter((e) => e.found).length}/${entries.length}`;
  $('dex-grid').replaceChildren(
    ...entries.map((e) =>
      row(
        thumb(e.id, 0, { locked: !e.found }),
        [bold(e.name), ` · ${e.stage}`],
        [
          e.text,
          e.perk ? { cls: 'perk', text: `perk: ${e.perk}` } : null,
          e.runAbility ? { cls: 'perk', text: `netrun: ${e.runAbility}` } : null,
          e.trait ? `fragment: ${e.trait}${e.keepsake ? ` + ${e.keepsake}` : ''}` : null,
        ],
        e.found ? '' : 'locked',
      ),
    ),
  );
}

function selectTab(name) {
  for (const t of ['lineage', 'dex', 'codex', 'wardrobe']) {
    $(`tab-btn-${t}`).setAttribute('aria-selected', t === name);
    $(`tab-${t}`).hidden = t !== name;
  }
}

export function initArchive() {
  const archive = $('archive');
  $('open-archive').addEventListener('click', () => {
    renderArchive();
    archive.showModal();
  });
  $('close-archive').addEventListener('click', () => archive.close());
  archive.addEventListener('click', (e) => {
    if (e.target === archive) archive.close(); // backdrop click
  });
  for (const t of ['lineage', 'dex', 'codex', 'wardrobe']) $(`tab-btn-${t}`).addEventListener('click', () => selectTab(t));

  $('close-transmission').addEventListener('click', () => $('transmission').close());
  $('replay-transmission').addEventListener('click', showTransmission);
}
