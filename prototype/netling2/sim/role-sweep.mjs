// How committed to one game must a player be for the role to be certain? Sweeps the share of plays given to one game (the rest
// rotate through all four, so a share of 0 is the plain rotation of the 1.0 bots) and reports, over `lives` lives of an attentive
// player with no Standing lean, how often the top game leads the second by 5 or more wins at adulthood (the role is then certain),
// and how often the adult is a role of that game.
// Usage: node prototype/netling2/sim/role-sweep.mjs [lives=300] [shares=0,0.1,0.2,0.3,0.5,0.8]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 300);
const shares = (process.argv[3] ?? '0,0.1,0.2,0.3,0.5,0.8').split(',').map(Number);
const base = { ...ARCHETYPES['steer-breach-corp'], diet: 0.5, trace: 'mix', anomaly: undefined, focus: 'breach' };
for (const focusShare of shares) {
  const rs = Array.from({ length: lives }, (_, i) => simulate({ ...base, focusShare }, i + 1));
  const ad = rs.filter((r) => r.atAdult).map((r) => r.atAdult);
  const mine = rs.filter((r) => r.adultForm?.startsWith('breach')).length;
  const hidden = rs.filter((r) => r.adultForm === 'hidden').length;
  console.log(JSON.stringify({ focusShare, roleCertain: +(ad.filter((x) => x.roleGap >= 5).length / ad.length).toFixed(2), adultInTheRole: +(mine / rs.length).toFixed(2), hidden: +(hidden / rs.length).toFixed(2) }));
}
