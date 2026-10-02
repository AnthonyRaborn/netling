// Challenge runs (docs/NETRUN.md#challenges): a rule chosen before jacking into the Deep or the Source, open once the
// player has reached the Deep's exit. Reaching the exit with the rule kept earns the challenge's reward. Breaking Glass or
// Bare metal cancels the challenge and the run goes on; Unplugged and Blackout can only be lost the usual way. Ids are
// permanent. Pure, and it imports nothing, so the sim, the sanitizer and the cosmetics can all use it.

export const CHALLENGES = [
  { id: 'glass', name: 'Glass', rule: 'lose one ICE fight and the challenge is off.' },
  { id: 'unplugged', name: 'Unplugged', rule: 'relays are dark: no charge, no venting, no patching.' },
  { id: 'blackout', name: 'Blackout', rule: 'you only see one step ahead.' },
  { id: 'baremetal', name: 'Bare metal', rule: 'buy or use no items. accessories are fine.' },
];
export const CHALLENGE_IDS = CHALLENGES.map((c) => c.id);
export const CHALLENGE_REGIONS = ['deep', 'source'];
export const challengeById = (id) => CHALLENGES.find((c) => c.id === id) ?? null;

// Open to the player once any of their netlings has reached the Deep's exit (progress.deepExits).
export const challengesOpen = (progress) => (progress?.deepExits ?? 0) > 0;

// The run's challenge, while it still holds.
export const challengeOn = (run, id) => Boolean(run?.challenge) && run.challenge === id && !run.challengeVoid;

// Breaks the challenge, with a line in the run's log: the run goes on without it. True if it was still on.
export function voidChallenge(run, why) {
  if (!run?.challenge || run.challengeVoid) return false;
  run.challengeVoid = true;
  run.messages.push(`challenge off: ${challengeById(run.challenge).name.toUpperCase()} broken, ${why}`);
  return true;
}
