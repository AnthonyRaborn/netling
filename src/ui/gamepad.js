// Controllers (Gamepad API), so a Steam Deck or a desktop controller plays with no key mapping.
// In a mini-game or netrun: d-pad or left stick left/right, A, and B to quit (like Esc).
// Everywhere else: the d-pad moves focus between buttons, A presses the focused one, B backs out.
// Browsers only report a controller after one of its buttons is pressed on the page.
import { $, app } from './app.js';
import { quitSession, sendKey } from './play.js';
import { advanceIntro, introWaiting } from './onboarding.js';

// The "standard" mapping every browser uses for common controllers.
const BUTTONS = { 0: 'a', 1: 'b', 12: 'up', 13: 'down', 14: 'left', 15: 'right' };
const STICK = 0.5;

const held = new Set();
let polling = false;

// Everything held right now, from every connected controller.
function pressed() {
  const now = new Set();
  for (const pad of navigator.getGamepads?.() ?? []) {
    if (!pad) continue;
    for (const [i, name] of Object.entries(BUTTONS)) if (pad.buttons[i]?.pressed) now.add(name);
    const [x = 0, y = 0] = pad.axes;
    if (x < -STICK) now.add('left');
    if (x > STICK) now.add('right');
    if (y < -STICK) now.add('up');
    if (y > STICK) now.add('down');
  }
  return now;
}

function poll() {
  const now = pressed();
  for (const name of now) if (!held.has(name)) onPress(name);
  held.clear();
  now.forEach((name) => held.add(name));
  if (polling) requestAnimationFrame(poll);
}

export function onPress(name) {
  if (document.hidden) return;
  if (introWaiting()) {
    if (name === 'a') advanceIntro();
    return;
  }
  if (app.session && !document.querySelector('dialog[open]')) {
    if (name === 'b') quitSession();
    else if (name !== 'up' && name !== 'down') sendKey(name);
    return;
  }
  if (name === 'a') return pressFocused();
  if (name === 'b') return back();
  moveFocus(name);
}

// --- menus ---

// The part of the page that takes input: an open dialog, a full-device overlay, or the page.
function scope() {
  return document.querySelector('dialog[open]') ?? document.querySelector('.device > .lock:not([hidden])') ?? document;
}

const usable = (el) => {
  if (el.disabled || el.closest('[hidden], [inert]') || !el.getClientRects().length) return false;
  const style = getComputedStyle(el);
  return style.visibility !== 'hidden' && style.pointerEvents !== 'none'; // e.g. dimmed while frozen
};

function targets() {
  return [...scope().querySelectorAll('button, input, select, textarea, a[href]')].filter(usable);
}

function focus(el) {
  el.focus({ focusVisible: true });
  el.scrollIntoView({ block: 'nearest' });
}

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// The nearest target in that direction, favoring ones straight ahead.
function moveFocus(dir) {
  const all = targets();
  if (!all.length) return;
  const cur = document.activeElement;
  if (!all.includes(cur)) return focus(all[0]);
  if (cur.type === 'range' && (dir === 'left' || dir === 'right')) return nudgeRange(cur, dir);
  const from = center(cur);
  let best = null;
  let bestScore = Infinity;
  for (const el of all) {
    if (el === cur) continue;
    const to = center(el);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const ahead = { left: -dx, right: dx, up: -dy, down: dy }[dir];
    const side = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    if (ahead <= 1) continue;
    const score = ahead + side * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  if (best) focus(best);
}

function nudgeRange(el, dir) {
  if (dir === 'left') el.stepDown(5);
  else el.stepUp(5);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function pressFocused() {
  const el = document.activeElement;
  if (el && el !== document.body && targets().includes(el)) return el.click();
  const first = targets()[0];
  if (first) focus(first);
}

// B: close the open dialog, or step back out of a submenu.
function back() {
  const dialog = document.querySelector('dialog[open]');
  if (dialog) return dialog.close();
  for (const id of ['picker-back', 'regions-back', 'inv-cancel']) {
    const el = $(id);
    if (usable(el)) return el.click();
  }
}

export function initGamepad() {
  addEventListener('gamepadconnected', () => {
    if (polling) return;
    polling = true;
    requestAnimationFrame(poll);
  });
  addEventListener('gamepaddisconnected', () => {
    if (!navigator.getGamepads().some(Boolean)) polling = false;
  });
}
