// The simulation reads the local hour to decide when the netling sleeps, and these tests start at noon UTC
// so it begins awake. Import this first so they pass in any time zone, not only under `npm test` (TZ=UTC).
process.env.TZ = 'UTC';
