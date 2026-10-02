// The daily trace's UI (netrun/daily.js): the day's attempt is used the moment it starts, and when it ends its share
// line is kept in progress and shown in a dialog with COPY and SHARE. Ten exits unlock the Uptime crest (cosmetics.js).
import { SPECIES, isMainframeForm, lineOf } from '../sim.js';
import { DAILY, dayKey, shareText } from '../netrun/daily.js';
import { nodeById } from '../netrun/map.js';
import { KEYS } from '../storage.js';
import { $, app, now, store } from './app.js';

export const todayKey = () => dayKey(now());
export const playedToday = () => app.progress.daily?.day === todayKey();

// Who ran it, for the share line. A Mainframe form goes by its line's name, so the line spoils nothing for a friend.
export function whoRan(state) {
  const form = state?.form;
  if (!form) return 'Bitling';
  return SPECIES[isMainframeForm(form) ? lineOf(form) : form]?.name ?? 'Netling';
}

export function markDailyStart(day) {
  app.progress.daily = { day, exit: false };
  store.set(KEYS.progress, app.progress);
}

// After the run's summary: keep its share line, count an exit, and show it.
export function recordDaily(run) {
  const at = nodeById(run.map, run.pos);
  const exit = run.result === 'jacked' && at?.type === 'exit';
  const share = shareText({
    key: run.day,
    trail: run.trail,
    exit,
    result: run.result,
    layers: run.map.layerCount - 1,
    reached: at?.layer ?? 0,
    who: whoRan(app.state),
    tally: run.tally,
  });
  app.progress.daily = { day: run.day, share, exit };
  if (exit) app.progress.dailyWins = (app.progress.dailyWins ?? 0) + 1;
  store.set(KEYS.progress, app.progress);
  showDaily();
}

export function showDaily() {
  const d = app.progress.daily;
  if (!d?.share) return;
  const wins = app.progress.dailyWins ?? 0;
  $('daily-text').textContent = d.share;
  $('daily-note').textContent =
    wins >= DAILY.winsForReward ? `${wins} exits so far. a new trace at midnight.` : `exits ${wins}/${DAILY.winsForReward} for a crest. a new trace at midnight.`;
  $('daily-share').hidden = !navigator.share;
  $('daily-copy').textContent = 'COPY';
  $('daily').showModal();
}

export function initDaily() {
  $('daily-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('daily-text').textContent);
      $('daily-copy').textContent = 'COPIED';
    } catch {
      getSelection()?.selectAllChildren($('daily-text'));
      $('daily-copy').textContent = 'SELECTED: COPY IT';
    }
  });
  $('daily-share').addEventListener('click', () => {
    navigator.share?.({ title: 'Netling daily trace', text: $('daily-text').textContent }).catch(() => {});
  });
  $('daily-close').addEventListener('click', () => $('daily').close());
}
