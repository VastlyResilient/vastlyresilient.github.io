/* =====================================================================
   STARWELL CALL DECKS: "My calls" dashboard.
   Private per caller. Sign-in, call log, reflection, recording review,
   skill profile and weekly summary. Talks to the StarWell server
   (starwell-practice/server/calls.mjs). Loaded after the main script,
   so it can use its helpers ($, $$, esc, D, S, O, order, byId, me ...).
   ===================================================================== */
'use strict';
const SWC = (() => {
  const SERVER = (() => { try{ return localStorage.getItem('sw_server') || ''; }catch(e){ return ''; } })() || (window.SW_CONFIG && window.SW_CONFIG.server) || '';
  let auth = null, calls = [], team = null, loaded = false, health = null, busy = '';
  try{ auth = JSON.parse(localStorage.getItem('sw_auth') || 'null'); }catch(e){}
  const cacheKey = () => 'sw_calls_' + (auth ? auth.user : '');
  const readCache = () => { try{ return JSON.parse(localStorage.getItem(cacheKey()) || '[]'); }catch(e){ return []; } };
  const writeCache = () => { try{ localStorage.setItem(cacheKey(), JSON.stringify(calls)); }catch(e){} };
  if(auth && auth.user !== 'Bobby') calls = readCache();

  async function api(path, body){
    const r = await fetch(SERVER + path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.assign({token:auth && auth.token}, body || {}))});
    const j = await r.json().catch(() => ({error:'The server sent something unreadable.'}));
    if(r.status === 401 && path !== '/auth'){ signOut(true); throw new Error('Please sign in again.'); }
    if(!r.ok) throw new Error(j.error || ('Server error ' + r.status));
    return j;
  }
  function signOut(quiet){ auth = null; calls = []; team = null; loaded = false; try{ localStorage.removeItem('sw_auth'); }catch(e){} paintUser(); if(!quiet){ if(location.hash === '#/calls') route(); else location.hash = '#/calls'; } }
  function paintUser(){
    const el = $('#who'); if(!el) return;
    el.innerHTML = auth ? `<b>${esc(auth.user)}</b> <button class="linkb" id="so">Sign out</button>` : `<a class="linkb" href="#/calls">Sign in</a>`;
    const so = $('#so'); if(so) so.onclick = () => signOut();
    const pick = $('label.me'); if(pick) pick.classList.toggle('hidden', !!auth);
    if(auth && window.setMe) window.setMe(auth.user);
  }

  /* ---------- words, icons, lists ---------- */
  const OUT = {
    no_answer:{i:'📵', t:'No answer', talk:false},
    voicemail:{i:'📼', t:'Left a voicemail', talk:false},
    office:{i:'🧑‍💼', t:'Talked to the office', talk:true, step:true},
    booked:{i:'📅', t:'Walkthrough booked', talk:true, step:true, win:true},
    info:{i:'✉️', t:'Asked me to send info', talk:true, step:true},
    callback:{i:'⏰', t:'Call back at a set time', talk:true, step:true},
    notnow:{i:'🤝', t:'Not for him right now', talk:true},
    early:{i:'⚡', t:'Call ended early', talk:true},
    wrong:{i:'🚫', t:'Wrong number or closed', talk:false}
  };
  const OBJ = {none:'Nothing stopped it', busy:'"I\'m busy right now"', email:'"Just email me"', office:'"Call the office"', selling:'"Are you selling something?"', have:'"We already have someone"', cost:'"What does it cost?"', ai:'"I don\'t trust AI"', notint:'"Not interested"', hung:'He hung up early'};
  const SK = {opener:'Opening the call', tone:'Tone and pace', listening:'Listening', question:'Asking the question', offer:'Explaining the gift', objection:'Staying steady when he pushes back', ask:'Asking for the next step', wrapup:'Following through'};
  const SKI = {opener:'👋', tone:'🎚️', listening:'👂', question:'❓', offer:'🎁', objection:'🧭', ask:'🎯', wrapup:'📬'};
  const STEPN = ['Didn\'t connect','Hello','Notice and ask','The one gift','The rest, and why it\'s free','Next step'];
  const CHECKS = [
    {g:'Before I dialed', i:'🧠', items:[['brief','Read the 20-second brief'],['aloud','Said my first two lines out loud'],['times','Had two real times ready']]},
    {g:'On the call', i:'📞', items:[['name','Used his name'],['notice','Said the one thing I noticed'],['q','Asked the question'],['quiet','Let him finish before I spoke'],['gift','Offered one gift, in one sentence'],['why','Said why it\'s free'],['ask15','Asked for the 15 minutes'],['email','Got his email']]},
    {g:'After', i:'📬', items:[['sent','Sent the email the same day'],['logged','Wrote down the next step and date']]}
  ];
  const DRILL = {
    opener:'Open the Practice Line and say only your first two lines, ten times in a row. Stop as soon as the practice owner answers. Aim for under ten seconds each time.',
    tone:'Stand up. Read your first line three times: once fast, once normal, once slow with your voice dropping at the end. Use the slow one on your next call.',
    listening:'On the Practice Line, ask your question and then count "one, two" in your head after the owner stops before you speak. Do it for five answers.',
    question:'Pick three of your shops. For each, read the "Notice" line and the "Ask" line out loud back to back, until they sound like one thought.',
    offer:'Open Systems and read the 15-second line for your lead gift five times. Then say it once without looking.',
    objection:'On the Practice Line, pick the owner who pushes back. Let him object, take one breath, then give one calm answer and stop talking.',
    ask:'Say this out loud ten times: "Could I show you in 15 minutes? Would tomorrow morning or the day after in the afternoon work better?" Then stay silent for three seconds.',
    wrapup:'Take two minutes right now: send the one email you owe, and write the date of your next try on each open call.'
  };
  const LINE = {
    busy:'Totally fair. When\'s a better ten minutes, later today or tomorrow morning?',
    email:'Happy to. I\'ll send it within the hour. Is it all right if I check in Thursday morning to hear what you thought?',
    office:'Will do. Who should I ask for, and is morning or afternoon better?',
    selling:'Fair question. Nothing to buy today. We make a few things for local shops for free, and I had one question about yours.',
    have:'That\'s great, sounds like you\'re covered. Can I ask one thing before I let you go?',
    cost:'The starter set is free and yours to keep. Anything ongoing is optional and priced in writing first.',
    ai:'Fair. You hear it and approve it before any customer does, and it always says it\'s an assistant.',
    notint:'No problem at all. Thanks for picking up, and good luck this season.',
    hung:'Hi, it\'s {me}. I\'m local, here in Connecticut. Did I catch you in the middle of a job?',
    none:'Could I show you in 15 minutes? Would tomorrow morning or the day after in the afternoon work better?'
  };
  const WIN = {
    ask:'You asked clearly for the next step. That is the moment most callers skip.',
    listening:'You got him talking and you let him finish. That is what earns trust.',
    question:'You connected what you noticed to a real question. That is the heart of the call.',
    tone:'You stayed steady. Calm is what makes an owner stay on the line.',
    opener:'You used his name and made a real start.',
    offer:'You explained the gift in one clear sentence.',
    objection:'He pushed back and you kept your footing.',
    wrapup:'You followed through the same day. That is how people learn they can count on you.'
  };
  const FIX = {
    opener:'Next time, try getting to his name and one true detail in the first ten seconds, then ask if you caught him mid-job.',
    tone:'Next time, try slowing down by ten percent and letting your voice drop at the end of each sentence.',
    listening:'Next time, try a two-second pause after your question. Let the silence do the work.',
    question:'Next time, try saying the notice line and going straight into the question, with nothing in between.',
    offer:'Next time, try offering just one gift, in one sentence, and then stopping.',
    objection:'Next time he pushes back, try one breath and one calm sentence. You already have the line below.',
    ask:'Next time, try asking for one small, specific next step before the call ends.',
    wrapup:'Next time, try leaving the short voicemail and sending the email the same day, so the dial still counts.'
  };
  const lineFor = (k, c) => LINE[k].replace('{me}', c.caller || (auth && auth.user) || 'me');

  /* ---------- the built-in review (works with no recording) ---------- */
  function review(c){
    const o = OUT[c.outcome] || {}, ch = c.checks || {}, r = c.ratings || {};
    let strength = 'opener', habit = 'ask';
    if(!o.talk){ return {strength:'opener', habit:'wrapup', win:'You made the dial. Every one of these makes the next one easier.', fix:FIX.wrapup,
      line:'Hi, it\'s ' + (c.caller || 'me') + ' with StarWell, here in Connecticut. I had one quick question about your shop. Nothing to sell. I\'ll try you again tomorrow.'}; }
    if(o.win || ch.ask15) strength = 'ask';
    else if(r.talk === 'him' && ch.q) strength = 'listening';
    else if(ch.notice && ch.q) strength = 'question';
    else if(r.calm >= 4) strength = 'tone';
    else if(ch.gift) strength = 'offer';
    if(c.outcome === 'early' || c.objection === 'hung' || (c.reached || 0) <= 1) habit = 'opener';
    else if(['email','office','busy'].includes(c.objection) && !o.win) habit = 'ask';
    else if(c.objection && c.objection !== 'none' && !o.win) habit = 'objection';
    else if(!ch.ask15) habit = 'ask';
    else if(r.talk === 'me') habit = 'listening';
    else if(r.calm && r.calm <= 2) habit = 'tone';
    else if(!ch.sent) habit = 'wrapup';
    else habit = 'listening';
    if(habit === strength) habit = habit === 'ask' ? 'listening' : 'ask';
    const objKey = c.objection && LINE[c.objection] ? c.objection : (habit === 'opener' ? 'hung' : 'none');
    return {strength, habit, win:o.win ? 'You earned a walkthrough. That is the whole goal, and you did it.' : WIN[strength], fix:FIX[habit], line:lineFor(objKey, c)};
  }
  const strengthOf = c => (c.analysis && c.analysis.strength) || (c.review && c.review.strength) || '';
  const habitOf = c => (c.analysis && c.analysis.habit) || (c.review && c.review.habit) || '';
  const objOf = c => (c.analysis && c.analysis.objection && c.analysis.objection.type) || c.objection || 'none';

  /* ---------- profile and weekly summary ---------- */
  const day = d => { const x = new Date(d); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0'); };
  const weekStart = d => { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
  const mode = a => { const m = {}; let best = '', n = 0; a.filter(Boolean).forEach(k => { m[k] = (m[k] || 0) + 1; if(m[k] > n){ n = m[k]; best = k; } }); return {k:best, n}; };
  function stats(list){
    const s = {dials:list.length, talks:0, steps:0, booked:0, calm:[], clear:[]};
    list.forEach(c => { const o = OUT[c.outcome] || {}; if(o.talk) s.talks++; if(o.step) s.steps++; if(o.win) s.booked++; if(c.ratings && c.ratings.calm) s.calm.push(c.ratings.calm); if(c.ratings && c.ratings.clear) s.clear.push(c.ratings.clear); });
    const avg = a => a.length ? Math.round(a.reduce((x,y) => x + y, 0) / a.length * 10) / 10 : null;
    s.calmAvg = avg(s.calm); s.clearAvg = avg(s.clear); return s;
  }
  function profile(list){
    const now = new Date(), w0 = weekStart(now), w1 = new Date(w0); w1.setDate(w1.getDate() - 7);
    const at = c => new Date(c.at || c.updated || 0);
    const thisW = list.filter(c => at(c) >= w0), lastW = list.filter(c => at(c) >= w1 && at(c) < w0);
    const talks = list.filter(c => (OUT[c.outcome] || {}).talk).slice(-20);
    const days = new Set(list.map(c => day(at(c)))); let streak = 0; const d = new Date(now);
    for(let i = 0; i < 60; i++){ const wd = d.getDay(); if(wd !== 0 && wd !== 6){ if(days.has(day(d))) streak++; else if(i > 0) break; } d.setDate(d.getDate() - 1); }
    const ms = [];
    if(list.length) ms.push(['🚀','First call logged']);
    if(list.length >= 10) ms.push(['🔟','10 dials']);
    if(list.length >= 50) ms.push(['🏔️','50 dials']);
    if(list.some(c => (OUT[c.outcome] || {}).talk)) ms.push(['💬','First real conversation']);
    if(list.some(c => (OUT[c.outcome] || {}).step)) ms.push(['➡️','First next step earned']);
    if(list.some(c => c.outcome === 'booked')) ms.push(['📅','First walkthrough booked']);
    if(streak >= 3) ms.push(['🔥', streak + ' calling days in a row']);
    if(list.some(c => c.transcript)) ms.push(['🎙️','First recording reviewed']);
    return {week:stats(thisW), last:stats(lastW), all:stats(list), streak, strength:mode(talks.map(strengthOf)), habit:mode(talks.map(habitOf)),
      moment:mode(talks.filter(c => c.outcome !== 'booked').map(objOf).filter(k => k !== 'none')), ms, n:list.length};
  }
  function weekLine(p, name){
    const w = p.week, bits = [];
    if(!w.dials) return p.n ? `No calls logged yet this week. Your next dial starts the week, ${name}.` : `Your dashboard fills in as you log calls. The first one is the hardest, and it only takes one.`;
    bits.push(`${w.dials} dial${w.dials > 1 ? 's' : ''}, ${w.talks} conversation${w.talks === 1 ? '' : 's'}, ${w.steps} next step${w.steps === 1 ? '' : 's'} earned`);
    if(w.booked) bits.push(`${w.booked} walkthrough${w.booked > 1 ? 's' : ''} booked`);
    let s = 'This week: ' + bits.join(', ') + '.';
    if(p.last.dials && w.dials > p.last.dials) s += ` That's ${w.dials - p.last.dials} more dial${w.dials - p.last.dials > 1 ? 's' : ''} than last week.`;
    if(w.calmAvg && p.last.calmAvg && w.calmAvg > p.last.calmAvg) s += ` You're feeling steadier: ${p.last.calmAvg} to ${w.calmAvg} out of 5.`;
    if(w.clearAvg && p.last.clearAvg && w.clearAvg > p.last.clearAvg) s += ` Your ask is getting clearer: ${p.last.clearAvg} to ${w.clearAvg}.`;
    return s;
  }

  /* ---------- views ---------- */
  const tile = (n, t, sub) => `<div class="tile"><b>${n}</b><span>${t}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const up = (a, b) => b && a > b ? '+' + (a - b) + ' vs last week' : '';
  function readCard(p, name, mineView){
    const you = mineView ? 'You' : name, your = mineView ? 'your' : name + '\'s';
    if(!p.strength.k) return `<div class="card"><h3>🧭 Coach's read</h3><p>${mineView ? 'Log a couple of conversations and this fills in: your top strength, the skill to build next, and the moment to master.' : 'Not enough conversations logged yet.'}</p></div>`;
    return `<div class="card"><h3>🧭 Coach's read</h3>
      <div class="read"><span>${SKI[p.strength.k]}</span><div><small>Top strength</small><b>${SK[p.strength.k]}</b><p>${WIN[p.strength.k]}${p.strength.n > 1 ? ` It has shown up in ${p.strength.n} of ${your} calls.` : ''}</p></div></div>
      ${p.habit.k ? `<div class="read"><span>${SKI[p.habit.k]}</span><div><small>Skill to build next</small><b>${SK[p.habit.k]}</b><p>${FIX[p.habit.k]}</p></div></div>` : ''}
      ${p.moment.k ? `<div class="read"><span>🧗</span><div><small>The moment to master</small><b>${OBJ[p.moment.k]}</b><p>This has come up ${p.moment.n} time${p.moment.n > 1 ? 's' : ''}. It's the next door to open. A line to try: <i>"${esc(LINE[p.moment.k].replace('{me}', name))}"</i></p></div></div>` : ''}
    </div>`;
  }
  function drillCard(p){
    const k = p.habit.k || 'opener';
    return `<div class="card"><h3>🏋️ This week's 2-minute drill</h3><p><b>${SK[k]}</b></p><p class="hint" style="margin-top:4px">${DRILL[k]}</p><p style="margin-top:10px"><a class="btn ghost" href="../starwell-practice/" target="_blank" rel="noopener">Open the Practice Line ↗</a></p></div>`;
  }
  const callRow = (c, ro) => { const o = OUT[c.outcome] || {i:'•', t:'Draft'}; const rv = c.analysis || c.review || {};
    return `<a class="crow" href="#/calls/${ro ? 'v/' + esc(c.caller) + '/' : ''}${esc(c.id)}"><span class="ci">${o.i}</span><span class="b"><strong>${esc(c.shopName || c.shop)}</strong><span class="s">${esc(o.t)} · ${esc(new Date(c.at || c.updated).toLocaleDateString(undefined, {month:'short', day:'numeric'}))}${c.transcript ? ' · 🎙️' : ''}</span>${rv.win ? `<span class="s w">✨ ${esc(rv.win)}</span>` : ''}</span></a>`; };

  function signInView(msg){
    $('#app').innerHTML = `<div class="signin card"><h1 style="font-size:22px;margin-bottom:4px">My calls</h1><p class="hint" style="margin:0 0 14px">Your private dashboard. Sign in to log calls, reflect and see your progress.</p>
      ${health && !health.signIn ? `<div class="note">Sign-in isn't switched on yet. The three passwords still need to be added on the server. The Call queue, Systems and Playbook work without it.</div>` : ''}
      <div class="seg" style="display:flex;margin-bottom:12px">${['Dan','RJ','Bobby'].map((n,i) => `<button style="flex:1" class="${i ? '' : 'on'}" data-u="${n}">${n}</button>`).join('')}</div>
      <input class="search" id="pw" type="password" placeholder="Password" autocomplete="current-password">
      <p class="err" id="err">${esc(msg || '')}</p>
      <button class="btn" id="go" style="width:100%;justify-content:center;margin-top:6px">Sign in</button>
      <p class="hint">Spaces and capital letters don't matter.</p></div>`;
    let u = 'Dan';
    $$('[data-u]').forEach(b => b.onclick = () => { u = b.dataset.u; $$('[data-u]').forEach(x => x.classList.toggle('on', x === b)); $('#pw').focus(); });
    const go = async () => { $('#go').disabled = true; $('#err').textContent = '';
      try{ const r = await api('/auth', {user:u, password:$('#pw').value}); auth = {token:r.token, user:r.user}; localStorage.setItem('sw_auth', JSON.stringify(auth)); loaded = false; calls = auth.user === 'Bobby' ? [] : readCache(); paintUser(); route(); }
      catch(e){ $('#err').textContent = e.message; $('#go').disabled = false; } };
    $('#go').onclick = go; $('#pw').onkeydown = e => { if(e.key === 'Enter') go(); };
  }
  async function ensure(){
    if(loaded) return;
    try{ const r = await api('/calls/list'); if(r.team) team = r.team; else { const local = calls.filter(c => c._unsynced); calls = r.calls || []; for(const c of local){ if(!calls.find(x => x.id === c.id)) calls.push(c); } writeCache(); } loaded = true; }
    catch(e){ if(!auth) throw e; loaded = true; busy = 'Working from this device\'s saved copy. ' + e.message; }
  }
  function dash(){
    const name = auth.user, p = profile(calls), w = p.week;
    const due = calls.filter(c => c.next && c.next.action && !c.next.done).sort((a,b) => String(a.next.date).localeCompare(String(b.next.date)));
    const myShops = order.filter(c => c.caller === name && c.status !== 'hold');
    const called = new Set(calls.map(c => c.shop));
    $('#app').innerHTML = `<div class="head"><h1>${esc(name)}'s dashboard</h1><span class="sp"></span><button class="btn" id="newc">＋ Log a call</button><div class="meta">${esc(weekLine(p, name))}</div></div>
      ${busy ? `<div class="note">${esc(busy)}</div>` : ''}
      <div class="tiles">${tile(w.dials, '📞 Dials this week', up(w.dials, p.last.dials))}${tile(w.talks, '💬 Conversations', up(w.talks, p.last.talks))}${tile(w.steps, '➡️ Next steps earned', up(w.steps, p.last.steps))}${tile(w.booked, '📅 Walkthroughs', '')}${tile(p.streak, '🔥 Calling days in a row', called.size + ' of ' + myShops.length + ' shops tried')}</div>
      <div class="two" style="margin-bottom:14px">${readCard(p, name, true)}<div style="display:grid;gap:14px;align-content:start">${drillCard(p)}
        <div class="card"><h3>🏅 Milestones</h3>${p.ms.length ? `<div class="chips" style="margin:0">${p.ms.map(m => `<span class="badge">${m[0]} ${m[1]}</span>`).join('')}</div>` : '<p class="hint" style="margin:0">Your first one arrives with your first logged call.</p>'}</div></div></div>
      <div class="two">
        <div class="card"><h3>📬 Follow-ups I owe</h3>${due.length ? due.map(c => `<label class="chk"><input type="checkbox" data-done="${esc(c.id)}"><span><b>${esc(c.shopName)}</b>: ${esc(c.next.action)}${c.next.date ? ` <span class="s">by ${esc(c.next.date)}</span>` : ''}</span></label>`).join('') : '<p class="hint" style="margin:0">Nothing open. Every loop is closed.</p>'}</div>
        <div class="card"><h3>🗂️ My calls</h3>${calls.length ? calls.slice().sort((a,b) => String(b.at).localeCompare(String(a.at))).slice(0, 40).map(c => callRow(c)).join('') : '<p class="hint" style="margin:0">No calls yet. Tap "Log a call" right after your next dial, while it\'s fresh.</p>'}</div>
      </div>
      <div id="pick" class="hidden"></div>`;
    $('#newc').onclick = () => { const el = $('#pick'); el.classList.remove('hidden'); el.innerHTML = `<div class="card" style="margin-top:14px"><h3>Which shop did you call?</h3><div class="chips" style="margin:0">${myShops.map(c => `<a class="chip" style="text-decoration:none" href="#/calls/new/${c.id}">${called.has(c.id) ? '↻ ' : ''}${esc(c.said)}</a>`).join('')}</div></div>`; el.scrollIntoView({block:'center'}); };
    $$('[data-done]').forEach(b => b.onchange = async () => { const c = calls.find(x => x.id === b.dataset.done); c.next.done = true; await persist(c); dash(); });
  }
  function teamView(){
    const col = n => { const list = (team && team[n]) || [], p = profile(list), w = p.week;
      return `<div><div class="head" style="margin-bottom:8px"><h1 style="font-size:19px">${n}</h1><div class="meta">${esc(weekLine(p, n))}</div></div>
        <div class="tiles t2">${tile(w.dials, '📞 Dials this week', up(w.dials, p.last.dials))}${tile(w.talks, '💬 Conversations', '')}${tile(w.steps, '➡️ Next steps', '')}${tile(p.all.dials, '🗂️ All-time dials', p.all.booked + ' walkthroughs')}</div>
        ${readCard(p, n, false)}
        <div class="card" style="margin-top:14px"><h3>💌 Something true you could tell ${n}</h3><p>${p.strength.k ? esc(n + ', ' + WIN[p.strength.k].charAt(0).toLowerCase() + WIN[p.strength.k].slice(1)) : 'Thank ' + n + ' for making the dials. The first week is the hardest one.'}</p></div>
        <div class="card" style="margin-top:14px"><h3>🗂️ Recent calls</h3>${list.length ? list.slice().sort((a,b) => String(b.at).localeCompare(String(a.at))).slice(0, 15).map(c => callRow(c, true)).join('') : '<p class="hint" style="margin:0">No calls logged yet.</p>'}</div></div>`; };
    $('#app').innerHTML = `<div class="head"><h1>Team dashboard</h1><div class="meta">View only. Use it to encourage and to spot what to practice together, not to grade.</div></div><div class="two">${col('Dan')}${col('RJ')}</div>`;
  }

  /* ---------- one call ---------- */
  const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  async function persist(c){
    c.review = review(c); c._unsynced = true;
    const i = calls.findIndex(x => x.id === c.id); if(i >= 0) calls[i] = c; else calls.push(c); writeCache();
    try{ const copy = Object.assign({}, c); delete copy._unsynced; await api('/calls/save', {call:copy}); delete c._unsynced; writeCache(); return ''; }
    catch(e){ return 'Saved on this device. It will sync when the server is reachable. (' + e.message + ')'; }
  }
  const scale = (key, val, lo, hi) => `<div class="scale" data-r="${key}">${[1,2,3,4,5].map(n => `<button class="${val === n ? 'on' : ''}" data-v="${n}">${n}</button>`).join('')}</div><div class="scl"><span>${lo}</span><span>${hi}</span></div>`;
  function transcriptHTML(c){
    const t = c.transcript; if(!t) return '';
    return `<div class="trs">${t.turns.map(x => `<p class="${x.sp === t.callerSp ? 'me' : 'him'}"><small>${x.sp === t.callerSp ? 'You' : 'Owner'} · ${Math.floor(x.s / 60)}:${String(Math.floor(x.s % 60)).padStart(2,'0')}</small>${esc(x.t)}</p>`).join('')}</div>`;
  }
  function reviewHTML(c, ro){
    const a = c.analysis, r = c.review || review(c), k = (a && a.drill && a.drill.skill) || r.habit;
    let h = `<div class="wfl"><div class="box ok"><small>✨ One win</small>${esc(a ? a.win : r.win)}</div><div class="box"><small>🔧 One thing to try</small>${esc(a ? a.fix : r.fix)}</div><div class="box"><small>🗣️ A line for the next call</small>"${esc(a ? a.line_to_try : r.line)}"</div></div>`;
    if(a){
      const st = a.steps, keys = ['hello','notice','gift','rest','next'];
      h += `<p style="margin:12px 0 6px">${esc(a.summary)}</p>
        <div class="talkbar"><i style="width:${Math.round(a.talk_caller_pct)}%"></i></div><p class="hint" style="margin-top:4px">You spoke about ${Math.round(a.talk_caller_pct)}% of the words. Around half or less usually means he felt heard.</p>
        <p class="grp" style="margin-left:0">How far the call went</p>${keys.map((x,i) => `<div class="stp ${st[x].reached ? 'y' : ''}"><b>${st[x].reached ? '✓' : '·'} ${STEPN[i + 1]}</b><span>${esc(st[x].note)}</span></div>`).join('')}
        <p class="grp" style="margin-left:0">Moments worth a second look</p>${a.moments.map(m => `<div class="mom"><p class="mq">${m.speaker === 'caller' ? 'You' : 'Owner'}: "${esc(m.quote)}"</p><p>${esc(m.what_worked_or_happened)}</p><p class="hint" style="margin-top:2px">🔁 ${esc(m.try_next_time)}</p></div>`).join('')}
        ${a.accuracy_flags.length ? `<p class="grp" style="margin-left:0">Keeping it honest</p>${a.accuracy_flags.map(f => `<p class="hint" style="margin-top:2px">• ${esc(f)}</p>`).join('')}` : ''}
        <p class="grp" style="margin-left:0">Questions to think about</p>${a.follow_up_questions.map((q,i) => `<label class="fq">${esc(q)}<textarea data-fq="${i}" ${ro ? 'readonly' : ''} placeholder="Your thoughts">${esc((c.followups || {})[q] || '')}</textarea></label>`).join('')}
        <div class="box" style="margin-top:10px"><small>🏋️ 2-minute drill · ${SK[a.drill.skill]}</small>${esc(a.drill.how)} <a href="../starwell-practice/" target="_blank" rel="noopener">Practice Line ↗</a></div>`;
    } else h += `<div class="box" style="margin-top:10px"><small>🏋️ 2-minute drill · ${SK[k]}</small>${DRILL[k]} <a href="../starwell-practice/" target="_blank" rel="noopener">Practice Line ↗</a></div>`;
    return h;
  }
  function callView(c, ro){
    const shop = byId(c.shop) || {said:c.shopName};
    const ch = c.checks || (c.checks = {}), r = c.ratings || (c.ratings = {}), an = c.answers || (c.answers = {}), nx = c.next || (c.next = {});
    const dis = ro ? 'disabled' : '';
    $('#app').innerHTML = `<a class="back2" href="#/calls">← ${ro ? 'Team dashboard' : 'My dashboard'}</a>
      <div class="head"><h1>${esc(c.shopName || shop.said)}</h1>${ro ? `<span class="pill" style="background:#eef0f3">${esc(c.caller)}'s call · view only</span>` : ''}<span class="sp"></span>${ro ? '' : `<a class="btn ghost" href="#/c/${esc(c.shop)}">Open the deck</a>`}<div class="meta">${esc(new Date(c.at).toLocaleString(undefined, {weekday:'long', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}))}</div></div>
      <p class="note" id="msg" style="display:none"></p>
      <div class="call2">
       <div style="display:grid;gap:14px;align-content:start">
        <div class="card"><h3>1 · How did it go?</h3><div class="outs">${Object.keys(OUT).map(k => `<button ${dis} class="out ${c.outcome === k ? 'on' : ''}" data-out="${k}"><span>${OUT[k].i}</span>${OUT[k].t}</button>`).join('')}</div>
          <div id="talkq" class="${(OUT[c.outcome] || {}).talk ? '' : 'hidden'}"><p class="ql">How far did the call get?</p><div class="chips" style="margin:0">${STEPN.slice(1).map((s,i) => `<button ${dis} class="chip ${c.reached === i + 1 ? 'on' : ''}" data-reach="${i + 1}">${i + 1}. ${s}</button>`).join('')}</div>
          <p class="ql">What was the moment the call turned?</p><div class="chips" style="margin:0">${Object.keys(OBJ).map(k => `<button ${dis} class="chip ${c.objection === k ? 'on' : ''}" data-obj="${k}">${OBJ[k]}</button>`).join('')}</div></div></div>
        <div class="card"><h3>2 · Check off what you did</h3>${CHECKS.map(g => `<p class="ql">${g.i} ${g.g}</p>${g.items.map(it => `<label class="chk"><input type="checkbox" ${dis} data-ck="${it[0]}" ${ch[it[0]] ? 'checked' : ''}><span>${it[1]}</span></label>`).join('')}`).join('')}<p class="hint">No score here. It's a mirror, so you can see your own habits.</p></div>
        <div class="card"><h3>3 · A quick read on yourself</h3>
          <p class="ql">🎚️ How steady did you feel?</p>${scale('calm', r.calm, 'Shaky', 'Rock steady')}
          <p class="ql">🎯 How clear was your ask?</p>${scale('clear', r.clear, 'I circled it', 'One clean sentence')}
          <p class="ql">👂 Who did most of the talking?</p><div class="chips" style="margin:0" data-talk>${[['me','Mostly me'],['even','About even'],['him','Mostly him']].map(t => `<button ${dis} class="chip ${r.talk === t[0] ? 'on' : ''}" data-v="${t[0]}">${t[1]}</button>`).join('')}</div></div>
        <div class="card"><h3>4 · Reflect while it's fresh</h3>
          ${[['said','💬 What did he say, in his own words?','The exact words matter more than your summary.'],['proud','✨ What is one moment you handled well?','Even a small one. Name it.'],['redo','🔁 If you could replay ten seconds, which ten, and what would you say?','Write the new line out.'],['learned','🔎 What did you learn about this shop that isn\'t in the deck?','Owner\'s name, who answers, best time to call, how they handle after hours.']].map(q => `<label class="fq">${q[1]}<textarea ${ro ? 'readonly' : ''} data-an="${q[0]}" placeholder="${q[2]}">${esc(an[q[0]] || '')}</textarea></label>`).join('')}
          <p class="ql">📬 What is your next step with this shop?</p><div style="display:grid;grid-template-columns:1fr 150px;gap:8px"><input class="search" ${dis} id="nxa" placeholder="e.g. Call the office and ask for Ethan" value="${esc(nx.action || '')}"><input class="search" ${dis} id="nxd" type="date" value="${esc(nx.date || '')}"></div></div>
       </div>
       <div style="display:grid;gap:14px;align-content:start">
        ${ro ? '' : `<div class="card"><h3>🎙️ Add the recording (optional)</h3>
          <p class="hint" style="margin:0 0 8px">Upload the call and get a line-by-line review. The recording is sent to be transcribed and is not kept. Only the transcript is saved to your log.</p>
          <label class="chk"><input type="checkbox" id="consent"><span>Everyone on this call knew it was being recorded.</span></label>
          <p class="hint" style="margin-top:2px">Connecticut generally requires that. If the owner wasn't told, don't upload it. Use your notes instead.</p>
          <input type="file" id="aud" accept="audio/*,video/mp4,.m4a,.mp3,.wav,.webm,.ogg" style="margin-top:8px;max-width:100%">
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><button class="btn" id="up">Transcribe and review</button><button class="btn ghost" id="notes">Review from my notes</button></div>
          <p class="hint" id="prog"></p></div>`}
        <div class="card" id="rev"><h3>📋 Your call review</h3>${c.outcome ? reviewHTML(c, ro) : '<p class="hint" style="margin:0">Pick how the call went and your review appears here: one win, one thing to try, and one line for the next call.</p>'}</div>
        ${c.transcript ? `<div class="card"><h3>📝 Transcript</h3>${ro ? '' : `<button class="linkb" id="swap">Labels look backwards? Swap "You" and "Owner"</button>`}${transcriptHTML(c)}</div>` : ''}
        ${ro ? '' : `<div class="lift">${esc(S.lifts[(c.id.length + c.id.charCodeAt(2)) % S.lifts.length])}</div>`}
       </div>
      </div>
      ${ro ? '' : `<div class="savebar"><button class="linkb" id="del" style="color:var(--bad)">Delete this call</button><span class="sp"></span><span class="hint" id="saved" style="margin:0"></span><button class="btn" id="save">Save</button></div>`}`;
    if(ro) return;
    const say = (t, bad) => { const m = $('#msg'); m.style.display = t ? 'block' : 'none'; m.textContent = t; m.className = bad ? 'stop' : 'note'; };
    const redraw = () => { if(c.outcome) $('#rev').innerHTML = '<h3>📋 Your call review</h3>' + reviewHTML(Object.assign({}, c, {review:review(c)}), false); wireFQ(); };
    const dirty = () => { $('#saved').textContent = 'Not saved yet'; };
    const wireFQ = () => $$('[data-fq]').forEach(t => t.oninput = () => { c.followups = c.followups || {}; c.followups[c.analysis.follow_up_questions[+t.dataset.fq]] = t.value; dirty(); });
    wireFQ();
    $$('[data-out]').forEach(b => b.onclick = () => { c.outcome = b.dataset.out; $$('[data-out]').forEach(x => x.classList.toggle('on', x === b)); $('#talkq').classList.toggle('hidden', !OUT[c.outcome].talk); if(!OUT[c.outcome].talk){ c.reached = 0; c.objection = ''; } redraw(); dirty(); });
    $$('[data-reach]').forEach(b => b.onclick = () => { c.reached = +b.dataset.reach; $$('[data-reach]').forEach(x => x.classList.toggle('on', x === b)); redraw(); dirty(); });
    $$('[data-obj]').forEach(b => b.onclick = () => { c.objection = b.dataset.obj; $$('[data-obj]').forEach(x => x.classList.toggle('on', x === b)); redraw(); dirty(); });
    $$('[data-ck]').forEach(b => b.onchange = () => { if(b.checked) ch[b.dataset.ck] = true; else delete ch[b.dataset.ck]; redraw(); dirty(); });
    $$('[data-r]').forEach(g => g.querySelectorAll('button').forEach(b => b.onclick = () => { r[g.dataset.r] = +b.dataset.v; g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); redraw(); dirty(); }));
    $$('[data-talk] button').forEach(b => b.onclick = () => { r.talk = b.dataset.v; $$('[data-talk] button').forEach(x => x.classList.toggle('on', x === b)); redraw(); dirty(); });
    $$('[data-an]').forEach(t => t.oninput = () => { an[t.dataset.an] = t.value; dirty(); });
    $('#nxa').oninput = e => { nx.action = e.target.value; dirty(); }; $('#nxd').oninput = e => { nx.date = e.target.value; dirty(); };
    const doSave = async () => { if(!c.outcome){ say('Pick how the call went first.', true); window.scrollTo({top:0}); return false; } $('#save').disabled = true; const m = await persist(c); $('#save').disabled = false; $('#saved').textContent = m ? '' : 'Saved ✓'; say(m); return true; };
    $('#save').onclick = doSave;
    $('#del').onclick = async () => { if(!$('#del').dataset.sure){ $('#del').dataset.sure = 1; $('#del').textContent = 'Tap again to delete for good'; return; } calls = calls.filter(x => x.id !== c.id); writeCache(); try{ await api('/calls/delete', {id:c.id}); }catch(e){} location.hash = '#/calls'; };
    const history = () => calls.filter(x => x.id !== c.id && (OUT[x.outcome] || {}).talk).slice(-8).map(x => ({date:String(x.at).slice(0,10), outcome:x.outcome, strength:strengthOf(x), habit:habitOf(x), moment:objOf(x)}));
    const analyze = async () => {
      $('#prog').textContent = 'Writing your review…';
      const t = c.transcript, text = t ? t.turns.map(x => (x.sp === t.callerSp ? 'CALLER: ' : 'OWNER: ') + x.t).join('\n').slice(0, 30000) : '';
      const lead = shop.lead ? {name:shop.said, town:shop.town, leadGift:TAG[shop.lead], notice:shop.notice, question:(shop.q || (S[shop.lead] || {}).ask)} : {name:c.shopName};
      const res = await api('/calls/analyze', {shop:lead, outcome:(OUT[c.outcome] || {}).t, transcript:text || '(no recording; review from the caller\'s own notes only)',
        selfReport:{reachedStep:STEPN[c.reached || 0], momentItTurned:OBJ[c.objection] || '', did:Object.keys(ch), steady:r.calm, clearAsk:r.clear, whoTalked:r.talk, notes:an}, history:history()});
      c.analysis = res.analysis; if(c.analysis.objection.type !== 'none' && (!c.objection || c.objection === 'none')) c.objection = c.analysis.objection.type;
      await persist(c); route();
    };
    $('#notes').onclick = async () => { if(!(await doSave())) return; try{ await analyze(); }catch(e){ $('#prog').textContent = ''; say(e.message, true); } };
    $('#up').onclick = async () => {
      const f = $('#aud').files[0];
      if(!f){ say('Choose the recording file first.', true); return; }
      if(!$('#consent').checked){ say('Please confirm everyone on the call knew it was recorded. If not, use "Review from my notes".', true); return; }
      if(f.size > 40 * 1024 * 1024){ say('That file is over 40 MB. Trim it or export it as a smaller audio file.', true); return; }
      if(!(await doSave())) return;
      try{
        $('#up').disabled = true; $('#prog').textContent = 'Uploading and transcribing. This can take a minute…';
        const rr = await fetch(SERVER + '/calls/transcribe', {method:'POST', headers:{'Content-Type':'application/octet-stream', 'X-Token':auth.token, 'X-File-Name':f.name.replace(/[^\w.\- ]/g, '')}, body:f});
        const j = await rr.json(); if(!rr.ok) throw new Error(j.error || 'Transcription failed');
        c.transcript = {turns:j.turns, callerSp:j.callerSp, duration:j.duration};
        if(j.oneVoice) say('Only one voice was picked up, so the review will lean on your notes too.');
        await analyze();
      }catch(e){ $('#up').disabled = false; $('#prog').textContent = ''; say(e.message, true); if(c.transcript){ await persist(c); route(); } }
    };
    const sw = $('#swap'); if(sw) sw.onclick = async () => { const sp = [...new Set(c.transcript.turns.map(x => x.sp))]; c.transcript.callerSp = sp.find(x => x !== c.transcript.callerSp); if(c.transcript.callerSp == null) c.transcript.callerSp = sp[0]; delete c.analysis; await persist(c); route(); };
  }

  /* ---------- routing ---------- */
  async function show(p){
    document.body.classList.add('detail'); side('');
    if(!SERVER){ $('#app').innerHTML = '<div class="card"><p>The dashboard server isn\'t connected yet.</p></div>'; return; }
    if(!auth){ if(!health){ try{ health = await (await fetch(SERVER + '/calls/health')).json(); }catch(e){ health = {signIn:true}; } } signInView(); return; }
    $('#app').innerHTML = '<p class="hint">Loading your dashboard…</p>';
    try{ await ensure(); }catch(e){ signInView(e.message); return; }
    if(auth.user === 'Bobby'){
      if(p[1] === 'v'){ const c = ((team && team[p[2]]) || []).find(x => x.id === p[3]); if(c){ callView(c, true); return; } }
      teamView(); return;
    }
    if(p[1] === 'new'){ const s = byId(p[2]); if(!s){ location.hash = '#/calls'; return; }
      const c = {id:newId(), caller:auth.user, shop:s.id, shopName:s.said, at:new Date().toISOString(), outcome:'', reached:0, objection:'', checks:{}, ratings:{}, answers:{}, next:{}};
      calls.push(c); writeCache(); location.replace('#/calls/' + c.id); return; }
    if(p[1]){ const c = calls.find(x => x.id === p[1]); if(c){ callView(c, false); return; } }
    calls = calls.filter(c => c.outcome); writeCache();
    dash();
  }
  const lastFor = id => { if(!auth || auth.user === 'Bobby') return null; const l = calls.filter(c => c.shop === id && c.outcome); return l.length ? OUT[l[l.length - 1].outcome] : null; };
  return {show, paintUser, lastFor, signedIn:() => !!auth, user:() => auth && auth.user, _review:review, _profile:profile};
})();
SWC.paintUser();
route();
