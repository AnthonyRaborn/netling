// The daily check-in and the reward box (checkin.js holds the rules). Both are per device and move with a transfer code.
import { claimCheckin, rewardLabel, takeBlockReason, takeFromBox, CHECKIN } from '../checkin.js';
import { accessoryById } from '../accessories.js';
import { ITEMS, log } from '../sim.js';
import { sfx } from '../audio.js';
import { KEYS } from '../storage.js';
import { $, app, flashStatus, now, save, store } from './app.js';
import { pushAlert, updateHUD } from './hud.js';
import { showPanel } from './play.js';
import { checkUnlocks } from './style.js';

const DAY_HINT = ['scrip', 'an item', 'more scrip', 'a better item', 'an accessory', 'a rare item', 'a rare accessory'];

// Called by the clock while the app is open (after the tutorial): claims a due check-in into the box.
export function checkIn() {
  if (app.onboarding !== 'done') return;
  const waiting = app.rewardBox.filter((e) => e.kind === 'accessory').map((e) => e.id);
  const res = claimCheckin(app.checkin, app.rewardBox, app.state, [...app.ownedAccessories, ...waiting], Math.random, now());
  if (!res) return;
  app.checkin = res.checkin;
  app.rewardBox = res.box;
  store.set(KEYS.checkin, app.checkin);
  store.set(KEYS.rewardBox, app.rewardBox);
  // Into the log, not the status line: that one carries notices that matter more (a set-aside save, a crash).
  log(app.state, now(), `> check-in, day ${res.day} of ${CHECKIN.days}: ${rewardLabel(res.reward).toLowerCase()} in the reward box.`);
  save();
  sfx('win', app.state.quirk.pitch);
  pushAlert('Daily check-in', `Day ${res.day} of ${CHECKIN.days}: ${rewardLabel(res.reward)} is waiting in the reward box.`);
  updateHUD();
}

export function openBox() {
  // A mini-game (or a run's ICE fight) keeps its clock running, so it is not hidden behind the box.
  if (app.session?.game) {
    sfx('error', app.state.quirk.pitch);
    return flashStatus('finish the game first.');
  }
  sfx('select', app.state.quirk.pitch);
  renderBox();
  showPanel('box');
}

function renderBox() {
  const next = app.checkin.day; // 0-based: the day the next check-in gives
  $('box-ladder').replaceChildren(
    ...CHECKIN.ladder.map((_, i) => {
      const cell = document.createElement('span');
      cell.className = `box-day${i < next ? ' done' : ''}${i === next ? ' next' : ''}`;
      cell.textContent = `${i + 1}`;
      cell.title = `day ${i + 1}: ${DAY_HINT[i]}`;
      return cell;
    }),
  );
  $('box-note').textContent = `NEXT: DAY ${next + 1} (${DAY_HINT[next].toUpperCase()}), THE FIRST TIME YOU LOOK IN AFTER IT WAKES. A MISSED DAY ONLY PAUSES IT.`;
  const list = app.rewardBox.map((entry, i) => {
    const blocked = takeBlockReason(entry, app.state);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'region';
    b.disabled = Boolean(blocked);
    const name = document.createElement('span');
    name.className = 'rname';
    name.textContent = rewardLabel(entry).toUpperCase();
    const day = document.createElement('span');
    day.className = 'rfrag';
    day.textContent = `day ${entry.day}`;
    const meta = document.createElement('span');
    meta.className = 'rmeta';
    meta.textContent = blocked ?? (entry.kind === 'accessory' ? `${accessoryById(entry.id).name.toLowerCase()}: tap to add it to your style.` : entry.kind === 'item' ? ITEMS[entry.id].desc : 'tap to take it.');
    b.append(name, day, meta);
    b.addEventListener('click', () => take(i));
    return b;
  });
  if (!list.length) {
    const empty = document.createElement('p');
    empty.className = 'inv-scrip';
    empty.textContent = 'THE BOX IS EMPTY.';
    list.push(empty);
  }
  $('box-list').replaceChildren(...list);
}

function take(index) {
  const res = takeFromBox(app.rewardBox, index, app.state);
  flashStatus(res.msg);
  if (!res.box) {
    sfx('error', app.state.quirk.pitch);
    return;
  }
  app.rewardBox = res.box;
  store.set(KEYS.rewardBox, app.rewardBox);
  if (res.accessory && !app.ownedAccessories.includes(res.accessory)) {
    app.ownedAccessories.push(res.accessory);
    store.set(KEYS.accessories, app.ownedAccessories);
    checkUnlocks();
  }
  sfx('feed', app.state.quirk.pitch);
  save();
  updateHUD();
  renderBox();
}

export function initRewards() {
  $('open-box').addEventListener('click', openBox);
  // Back to whatever it came from: the pad while a run is open (its map or summary card needs A), else the controls.
  $('box-back').addEventListener('click', () => showPanel(app.session ? 'pad' : 'controls'));
}
