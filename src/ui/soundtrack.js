// Tells the music player (music.js) what should be playing, from the app's state: the home track,
// its sleep variant, the netrun theme, the mini-game duck, or silence. The DEV panel can force a
// track or a state to audition it (app.devMusic).
import { isAlive, resting } from '../sim.js';
import { musicMode } from '../tracks.js';
import { setMusicMode, setMusicSeed } from '../music.js';
import { resolveWardrobe } from '../cosmetics.js';
import { app } from './app.js';

export function syncMusicMode() {
  const s = app.state;
  if (!s) return;
  // Each netling arranges its track a little differently.
  setMusicSeed(s.quirk.pitch * 7 + s.quirk.palette + (s.generation ?? 1) * 7919);
  setMusicMode(
    musicMode({
      // A waiting tab, or a netling moved to another device, stays quiet.
      alive: isAlive(s) && !app.inactive && !app.lock,
      resting: resting(s),
      runRegion: s.run?.region ?? null,
      inGame: Boolean(app.session) && !s.run,
      track: app.wardrobe && app.unlocked ? resolveWardrobe(app.wardrobe, app.unlocked).music : 'idle',
      force: app.devMusic ?? {},
    }),
  );
}
