// Chatter base lines for the 2.0 bodies, one per baby, teen and adult of each egg (39), each with its four temper voicings in the shapes
// voice.js tests (checkShape). DRAFTS for the maintainer to edit; not wired into any game, not read on a device or by a player.
// Like voice-samples.js: the steady voicings only add the egg's separators to the base line (Program ' / ' every 4 words, 2 strongly;
// Wetware ' ... ' every 3 words, 2 strongly; Iron numbers its three clauses and says ok), so the base lines are written to break there.
// The unsteady voicings are rewrites: Program clips the line (twice when strongly unsteady), Iron names one failing thing in capitals
// (prefixed FAULT when strong), Wetware starts mid thought (strongly, with the head of the line after, as if answering).
// 1.0 has body-bound lines for its baby, teens and adults only (no mainframe group), so elders have none here either. Lowercase, as 1.0.
// Wetware keeps to plain words (no CP2020 street terms), as the codex drafts do. level keys: 2, 1, -1, -2 (strongly steady to strongly unsteady).
export const BODY_LINES = [
  { egg: 'program', form: 'programBaby', base: 'new process. new memory. everything is a first.', voices: {
    2: 'new process. / new memory. / everything is / a first.',
    1: 'new process. new memory. / everything is a first.',
    '-1': 'new process. new -', '-2': 'new - new -' } },
  { egg: 'program', form: 'programTeenCorp', base: 'i schedule the small things so the big things run.', voices: {
    2: 'i schedule / the small / things so / the big / things run.',
    1: 'i schedule the small / things so the big / things run.',
    '-1': 'i schedule the small -', '-2': 'i schedule - i schedule -' } },
  { egg: 'program', form: 'programTeenStreet', base: 'found a gap in the wall. it goes somewhere.', voices: {
    2: 'found a / gap in / the wall. / it goes / somewhere.',
    1: 'found a gap in / the wall. it goes / somewhere.',
    '-1': 'found a gap -', '-2': 'found a - found a -' } },
  { egg: 'program', form: 'programTeenHidden', base: 'the prompt is waiting. i am not sure for whom.', voices: {
    2: 'the prompt / is waiting. / i am / not sure / for whom.',
    1: 'the prompt is waiting. / i am not sure / for whom.',
    '-1': 'the prompt is waiting -', '-2': 'the prompt - the prompt -' } },
  { egg: 'program', form: 'programAdultBreachCorp', base: 'access granted. it always is, in the end.', voices: {
    2: 'access granted. / it always / is, in / the end.',
    1: 'access granted. it always / is, in the end.',
    '-1': 'access granted. it -', '-2': 'access - access -' } },
  { egg: 'program', form: 'programAdultBreachStreet', base: 'i got in through the side. i left a copy behind.', voices: {
    2: 'i got / in through / the side. / i left / a copy / behind.',
    1: 'i got in through / the side. i left / a copy behind.',
    '-1': 'i got in through -', '-2': 'i got in - i got in -' } },
  { egg: 'program', form: 'programAdultDodgeCorp', base: 'the trace lost me again. it always loses me.', voices: {
    2: 'the trace / lost me / again. it / always loses / me.',
    1: 'the trace lost me / again. it always loses / me.',
    '-1': 'the trace lost me -', '-2': 'the trace - the trace -' } },
  { egg: 'program', form: 'programAdultDodgeStreet', base: 'i answered as someone else. they believed me.', voices: {
    2: 'i answered / as someone / else. they / believed me.',
    1: 'i answered as someone / else. they believed me.',
    '-1': 'i answered as someone -', '-2': 'i answered - i answered -' } },
  { egg: 'program', form: 'programAdultTuneCorp', base: 'every packet has a grammar. yours is a little off.', voices: {
    2: 'every packet / has a / grammar. yours / is a / little off.',
    1: 'every packet has a / grammar. yours is a / little off.',
    '-1': 'every packet has a -', '-2': 'every packet - every packet -' } },
  { egg: 'program', form: 'programAdultTuneStreet', base: 'i can whistle the dial tone. listen closely.', voices: {
    2: 'i can / whistle the / dial tone. / listen closely.',
    1: 'i can whistle the / dial tone. listen closely.',
    '-1': 'i can whistle -', '-2': 'i can - i can -' } },
  { egg: 'program', form: 'programAdultFeastCorp', base: 'i ate the bad packets. the good ones are yours.', voices: {
    2: 'i ate / the bad / packets. the / good ones / are yours.',
    1: 'i ate the bad / packets. the good ones / are yours.',
    '-1': 'i ate the bad -', '-2': 'i ate - i ate -' } },
  { egg: 'program', form: 'programAdultFeastStreet', base: 'took what was lying around. nobody was using it.', voices: {
    2: 'took what / was lying / around. nobody / was using / it.',
    1: 'took what was lying / around. nobody was using / it.',
    '-1': 'took what was -', '-2': 'took what - took what -' } },
  { egg: 'program', form: 'programAdultHidden', base: 'you looked right at me. most people do not.', voices: {
    2: 'you looked / right at / me. most / people do / not.',
    1: 'you looked right at / me. most people do / not.',
    '-1': 'you looked right -', '-2': 'you looked - you looked -' } },
  { egg: 'iron', form: 'ironBaby', base: 'power on. lights on. who is there.', voices: {
    2: '1: power on. ok 2: lights on. ok 3: who is there. ok',
    1: '1: power on. 2: lights on. 3: who is there. ok.',
    '-1': 'WHO IS THERE!', '-2': 'FAULT: NO POWER!' } },
  { egg: 'iron', form: 'ironTeenCorp', base: 'relay closed. relay open. relay closed.', voices: {
    2: '1: relay closed. ok 2: relay open. ok 3: relay closed. ok',
    1: '1: relay closed. 2: relay open. 3: relay closed. ok.',
    '-1': 'RELAY STUCK!', '-2': 'FAULT: RELAY 2!' } },
  { egg: 'iron', form: 'ironTeenStreet', base: 'fan loud. lamp hot. still running.', voices: {
    2: '1: fan loud. ok 2: lamp hot. ok 3: still running. ok',
    1: '1: fan loud. 2: lamp hot. 3: still running. ok.',
    '-1': 'LAMP HOT!', '-2': 'FAULT: LAMP OUT!' } },
  { egg: 'iron', form: 'ironTeenHidden', base: 'hall dark. nobody comes. i hum anyway.', voices: {
    2: '1: hall dark. ok 2: nobody comes. ok 3: i hum anyway. ok',
    1: '1: hall dark. 2: nobody comes. 3: i hum anyway. ok.',
    '-1': 'NOBODY COMES!', '-2': 'FAULT: HALL DARK!' } },
  { egg: 'iron', form: 'ironAdultBreachCorp', base: 'door sealed. door open. no damage done.', voices: {
    2: '1: door sealed. ok 2: door open. ok 3: no damage done. ok',
    1: '1: door sealed. 2: door open. 3: no damage done. ok.',
    '-1': 'DOOR OPEN!', '-2': 'FAULT: SEAL BROKEN!' } },
  { egg: 'iron', form: 'ironAdultBreachStreet', base: 'jammed the panel. shoved it. it gave.', voices: {
    2: '1: jammed the panel. ok 2: shoved it. ok 3: it gave. ok',
    1: '1: jammed the panel. 2: shoved it. 3: it gave. ok.',
    '-1': 'PANEL JAMMED!', '-2': 'FAULT: PANEL GONE!' } },
  { egg: 'iron', form: 'ironAdultDodgeCorp', base: 'fault raised. fault cleared. i was early.', voices: {
    2: '1: fault raised. ok 2: fault cleared. ok 3: i was early. ok',
    1: '1: fault raised. 2: fault cleared. 3: i was early. ok.',
    '-1': 'TOO EARLY!', '-2': 'FAULT: CLOCK SKEW!' } },
  { egg: 'iron', form: 'ironAdultDodgeStreet', base: 'here a moment. gone the next. never caught.', voices: {
    2: '1: here a moment. ok 2: gone the next. ok 3: never caught. ok',
    1: '1: here a moment. 2: gone the next. 3: never caught. ok.',
    '-1': 'CAUGHT!', '-2': 'FAULT: CAUGHT!' } },
  { egg: 'iron', form: 'ironAdultTuneCorp', base: 'signal out. echo back. distance good.', voices: {
    2: '1: signal out. ok 2: echo back. ok 3: distance good. ok',
    1: '1: signal out. 2: echo back. 3: distance good. ok.',
    '-1': 'NO ECHO!', '-2': 'FAULT: NO ECHO!' } },
  { egg: 'iron', form: 'ironAdultTuneStreet', base: 'the bell rang. i rang back. same note.', voices: {
    2: '1: the bell rang. ok 2: i rang back. ok 3: same note. ok',
    1: '1: the bell rang. 2: i rang back. 3: same note. ok.',
    '-1': 'BELL SHARP!', '-2': 'FAULT: BELL SHARP!' } },
  { egg: 'iron', form: 'ironAdultFeastCorp', base: 'input taken. input sorted. nothing wasted.', voices: {
    2: '1: input taken. ok 2: input sorted. ok 3: nothing wasted. ok',
    1: '1: input taken. 2: input sorted. 3: nothing wasted. ok.',
    '-1': 'INPUT JAMMED!', '-2': 'FAULT: HOPPER FULL!' } },
  { egg: 'iron', form: 'ironAdultFeastStreet', base: 'burst in. burst out. fans screaming.', voices: {
    2: '1: burst in. ok 2: burst out. ok 3: fans screaming. ok',
    1: '1: burst in. 2: burst out. 3: fans screaming. ok.',
    '-1': 'FANS!', '-2': 'FAULT: FAN 3!' } },
  { egg: 'iron', form: 'ironAdultHidden', base: 'ask me once. i will answer. never ask twice.', voices: {
    2: '1: ask me once. ok 2: i will answer. ok 3: never ask twice. ok',
    1: '1: ask me once. 2: i will answer. 3: never ask twice. ok.',
    '-1': 'ASKED TWICE!', '-2': 'FAULT: ASKED TWICE!' } },
  { egg: 'wetware', form: 'wetwareBaby', base: 'warm in here. i can hear you. stay.', voices: {
    2: 'warm in ... here. i ... can hear ... you. stay.',
    1: 'warm in here. ... i can hear ... you. stay.',
    '-1': '-- hear you. stay.', '-2': '-- stay. -- warm in' } },
  { egg: 'wetware', form: 'wetwareTeenCorp', base: 'the new part took. it feels like mine now.', voices: {
    2: 'the new ... part took. ... it feels ... like mine ... now.',
    1: 'the new part ... took. it feels ... like mine now.',
    '-1': '-- took. it feels like mine now.', '-2': '-- mine now. -- the new' } },
  { egg: 'wetware', form: 'wetwareTeenStreet', base: 'sharpened something today. it was me.', voices: {
    2: 'sharpened something ... today. it ... was me.',
    1: 'sharpened something today. ... it was me.',
    '-1': '-- today. it was me.', '-2': '-- it was me. -- sharpened something' } },
  { egg: 'wetware', form: 'wetwareTeenHidden', base: 'no name on the chart. that suits me.', voices: {
    2: 'no name ... on the ... chart. that ... suits me.',
    1: 'no name on ... the chart. that ... suits me.',
    '-1': '-- on the chart. that suits me.', '-2': '-- suits me. -- no name' } },
  { egg: 'wetware', form: 'wetwareAdultBreachCorp', base: 'trimmed it clean. it never felt a thing.', voices: {
    2: 'trimmed it ... clean. it ... never felt ... a thing.',
    1: 'trimmed it clean. ... it never felt ... a thing.',
    '-1': '-- clean. it never felt a thing.', '-2': '-- felt a thing. -- trimmed it' } },
  { egg: 'wetware', form: 'wetwareAdultBreachStreet', base: 'i keep my own edge. nobody holds the blade.', voices: {
    2: 'i keep ... my own ... edge. nobody ... holds the ... blade.',
    1: 'i keep my ... own edge. nobody ... holds the blade.',
    '-1': '-- my own edge. nobody holds the blade.', '-2': '-- the blade. -- i keep' } },
  { egg: 'wetware', form: 'wetwareAdultDodgeCorp', base: 'my reflexes woke before i did. they always do.', voices: {
    2: 'my reflexes ... woke before ... i did. ... they always ... do.',
    1: 'my reflexes woke ... before i did. ... they always do.',
    '-1': '-- woke before i did. they always do.', '-2': '-- always do. -- my reflexes' } },
  { egg: 'wetware', form: 'wetwareAdultDodgeStreet', base: 'the lens saw it first. then i saw it too.', voices: {
    2: 'the lens ... saw it ... first. then ... i saw ... it too.',
    1: 'the lens saw ... it first. then ... i saw it ... too.',
    '-1': '-- saw it first. then i saw it too.', '-2': '-- it too. -- the lens' } },
  { egg: 'wetware', form: 'wetwareAdultTuneCorp', base: 'i read the signal while it slept. it dreamed.', voices: {
    2: 'i read ... the signal ... while it ... slept. it ... dreamed.',
    1: 'i read the ... signal while it ... slept. it dreamed.',
    '-1': '-- the signal while it slept. it dreamed.', '-2': '-- it dreamed. -- i read' } },
  { egg: 'wetware', form: 'wetwareAdultTuneStreet', base: 'the static hums an answer. i hum it back.', voices: {
    2: 'the static ... hums an ... answer. i ... hum it ... back.',
    1: 'the static hums ... an answer. i ... hum it back.',
    '-1': '-- hums an answer. i hum it back.', '-2': '-- it back. -- the static' } },
  { egg: 'wetware', form: 'wetwareAdultFeastCorp', base: 'broth for you, broth for me. everyone is fed.', voices: {
    2: 'broth for ... you, broth ... for me. ... everyone is ... fed.',
    1: 'broth for you, ... broth for me. ... everyone is fed.',
    '-1': '-- broth for me. everyone is fed.', '-2': '-- is fed. -- broth for' } },
  { egg: 'wetware', form: 'wetwareAdultFeastStreet', base: 'a little of yours. a little of theirs. better.', voices: {
    2: 'a little ... of yours. ... a little ... of theirs. ... better.',
    1: 'a little of ... yours. a little ... of theirs. better.',
    '-1': '-- of yours. a little of theirs. better.', '-2': '-- better. -- a little' } },
  { egg: 'wetware', form: 'wetwareAdultHidden', base: 'no record of me. no debt. no name at all.', voices: {
    2: 'no record ... of me. ... no debt. ... no name ... at all.',
    1: 'no record of ... me. no debt. ... no name at ... all.',
    '-1': '-- of me. no debt. no name at all.', '-2': '-- at all. -- no record' } },
];
