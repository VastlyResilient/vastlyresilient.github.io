// Rebuilds the cold-call guide's narration (the NARR block) from the shared offer card.
// Run after changing starwell-practice/offer.js:  node tools/sync-guide-narration.mjs
// The ElevenLabs workflow then records only the lines that changed.
import fs from 'node:fs';
import vm from 'node:vm';

const GUIDE = 'starwell-cold-call/index.html';
const ctx = {window:{}};
vm.runInNewContext(fs.readFileSync('starwell-practice/offer.js', 'utf8'), ctx);
const O = ctx.window.STARWELL_OFFER;
let html = fs.readFileSync(GUIDE, 'utf8');
const ids = [...html.matchAll(/<section class="card" data-id="([^"]+)"/g)].map(m => m[1]);

// spoken text: example shop, the caller's own name as {me}; no "|" inside a part
const f = t => O.fill(t, {me:'{me}'}).replace(/\|/g, ',').replace(/\s+/g, ' ').trim();
const clean = t => f(t).replace(/["“”]/g, '').replace(/\(([^)]*)\)/g, ', $1,').replace(/\s+,/g, ',').replace(/,\s*,/g, ',').replace(/,\s*\./g, '.');
const lines = arr => arr.filter(x => !/^\s*\(/.test(x.t)).map(x => x.who === 'him' ? 'O>' + clean(x.t) : clean(x.t));
const giftNames = ['phone', 'site', 'found'].map(k => O.gifts[k].name.replace(/^The /, '').toLowerCase());

const step = s => [
  `Step ${s.n}. ${s.name}. About ${s.time}.`, clean(s.goal), 'Say it like this.', ...lines(s.say),
  ...(s.key === 'gift' ? ['Then the line for the one gift that fits.', ...['phone', 'site', 'found'].map(k => clean(O.gifts[k].say))] : []),
  ...(s.key === 'notice' ? ['Match the question to the gift.', ...['phone', 'site', 'found'].map(k => clean(s.questions[k]))] : []),
  'Why it works.', ...s.why.map(clean),
  'In his head.', clean(s.owner),
  ...(s.ifHe || []).flatMap(x => ['If he says:', 'O>' + clean(x.he), clean(x.you)]),
  'Quick check. Which line would you pick? Try it on the screen when you are parked.'
];
const gift = k => { const g = O.gifts[k], SC = O.searchCheck; return [
  `${g.name}. ${g.short}`, 'What it is.', clean(g.what), 'What you say.', clean(g.say),
  'How the owner feels.', clean(g.feels), 'The value to him.', clean(g.value),
  'Keep it true.', ...g.truth.map(clean), 'The terms.', clean(g.terms), ...(g.whyTrial ? [clean(g.whyTrial)] : []),
  ...(k === 'found' ? [SC.name + '.', clean(SC.what), 'What is on the page.', ...SC.includes.map(clean), clean(SC.why)] : [])
]; };
const N = {
  signin: null,
  card: ['The call card. Read this before every call.', clean(O.goal), clean(O.goalWhy), 'Five steps.',
    ...O.steps.flatMap(s => [`${s.n}. ${s.name}.`, ...(s.key === 'gift' ? [clean("That's actually what we help with."), `Then the line for the one gift that fits: ${giftNames.join(', ')}.`] : lines(s.say))]),
    'If he asks what is free:', clean(O.free.line)],
  step1: step(O.steps[0]), step2: step(O.steps[1]), step3: step(O.steps[2]), step4: step(O.steps[3]), step5: step(O.steps[4]),
  prepsheet: ['Your prep sheet. About ten minutes per shop.', 'Fill in the shop, the owner, one true thing you noticed, and the one gift that fits. The page writes your call card for that shop.',
    'Before you dial, check: you know which one gift you are leading with, and why. You can say the free line from memory. You have two walkthrough times ready. The shop is checked against the do-not-call list. And a person always dials. We never use an AI voice to call owners.'],
  free: ['Free, honestly.', clean(O.free.line), clean(O.free.reason), 'Yours to keep.', ...O.free.keep.map(clean), 'A free trial.', ...O.free.trial.map(clean), 'Not free.', ...O.free.notFree.map(clean), clean(O.gifts.phone.whyTrial), ...O.free.rules.map(clean)],
  'g-phone': gift('phone'), 'g-site': gift('site'), 'g-found': gift('found'),
  walk: ['The fifteen minutes.', clean(O.walkthrough.who), 'If he asks what happens, say:', clean(O.walkthrough.sentence), ...O.walkthrough.agenda.map(a => clean(a.t + '. ' + a.d)), 'Custom tools.', clean(O.custom.when), clean(O.custom.line), clean(O.custom.terms)],
  questions: ['What owners ask. His question is a good sign. Agree it is fair, answer straight, then stop talking.', ...O.questions.flatMap(q => ['O>' + clean(q.q), clean(q.a), clean(q.why)])],
  team: ['Team questions. So we never tell two owners two different things.', ...O.team.flatMap(q => [clean(q.q), clean(q.a)])],
  hisside: ['Hear it through his ears. He is on a roof unit, two trucks are out, and a no-heat call is waiting.', ...O.steps.flatMap(s => [`${s.n}. ${s.name}.`, clean(s.owner)]),
    'Homework, the respectful way. Keep it about the shop, never his home or family. Say where you found each fact. And only say what you checked today.'],
  words: ['Words we use.', ...O.words.map(w => clean(`Say ${w.say}. Not ${w.not}.`)), 'Our rules.', ...O.rules.map(clean)],
  followup: ['Voicemail and the same-day email.', 'No answer? One short voicemail.', clean('Hi {name}, this is {me} with StarWell, here in Connecticut. I had one quick question about {shop}. I\'ll try you again Thursday morning, or you can call me back.'),
    'Then send the email the same day, with the terms in plain words, and the time you booked.', 'If he named a time, call exactly then. If the email gets no reply, one friendly check-in about a week later, then stop. If he asks to come off the list, do it the same day.'],
  confidence: ['Nerves are normal.', 'Strangers like you more than you think. After a first conversation, people consistently underestimate how much the other person liked them.', 'Asking follow-up questions makes you more likable. Step two is built on that.', 'For your first two weeks, chase learning, not results.', 'And a no is not a failure. A warm goodbye means he would take your call again.'],
  sources: null
};
const narr = ids.map(id => N[id] === undefined ? null : N[id] && N[id].join(' | '));
const block = 'const NARR = [\n' + ids.map((id, i) => `/* ${id} */ ${narr[i] === null ? 'null' : '`' + narr[i].replace(/`/g, "'").replace(/\$\{/g, '$ {') + '`'},`).join('\n') + '\n];';
html = html.replace(/const NARR = \[[\s\S]*?\n\];/, block);
fs.writeFileSync(GUIDE, html);
console.log(`Narration rebuilt for ${ids.length} cards.`);
