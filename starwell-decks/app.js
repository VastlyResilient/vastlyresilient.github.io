/* StarWell Call Decks. One file, no framework.
   Today (your shops as a checklist) + Call screen (one shop at a time) + Systems + Progress.
   Data: ../starwell-practice/{offer,decks,needs,systems}.js. Server: ../starwell-practice/server/calls.mjs */
'use strict';
(() => {
const O = window.STARWELL_OFFER, D = window.STARWELL_DECKS, S = window.STARWELL_SYSTEMS;
const SC = window.STARWELL_SCRIPTS || {shops:{}, _meta:{}, call_method:{}, qa_matrix:{}};
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PMAP = {'bar-chart':'chart-bar','log-out':'sign-out','alert-triangle':'warning','refresh':'arrows-clockwise','play':'caret-right','chevron-right':'caret-right','phone-missed':'phone-x','message':'chat-circle-l','mail':'envelope-simple','mic':'microphone','search':'magnifying-glass'};
const pi = n => `<svg class="icon" aria-hidden="true" focusable="false"><use href="#p-${n}"/></svg>`;
const ic = (n, cls) => `<svg class="icon ${cls || ''}" aria-hidden="true" focusable="false"><use href="#p-${PMAP[n] || n}"/></svg>`;
const SERVER = (() => { try{ return localStorage.getItem('sw_server') || ''; }catch(e){ return ''; } })() || (window.SW_CONFIG && window.SW_CONFIG.server) || '';
const app = $('#app');

/* ---------------- words ---------------- */
const TAG = {phone:'Answering line', site:'Website', found:'Getting found', social:'Social posts', custom:'Custom tools'};
const QUICK = {no_answer:['phone-missed','No answer'], voicemail:['voicemail','Voicemail'], office:['users','Reached the office'], wrong:['x','Wrong number']};
const ENDS = {booked:'Walkthrough booked', callback:'Call back agreed', info:'Asked for info', notnow:'Not now', notint:'Not interested', early:'Hung up'};
const OUTI = {booked:'calendar-check', callback:'clock', info:'mail', notnow:'circle', notint:'x', early:'phone-missed'};
const STAGES = ['Introduce','Ask','Offer','Their questions','Next step'];
const TURNS = {none:'It stayed flat', busy:'"I\'m busy right now"', email:'"Just email me"', office:'"Call the office"', selling:'"Are you selling something?"', have:'"We already have someone"', cost:'"What does it cost?"', ai:'"I don\'t trust AI"', notint:'"Not interested"', hung:'He hung up'};
const LINE = {
  none:'Could I show you in 15 minutes? Would tomorrow morning or the day after work better?',
  busy:'Totally fair. When\'s a better ten minutes, later today or tomorrow morning?',
  email:'Happy to. I\'ll send it within the hour. Can I check in Thursday morning?',
  office:'Will do. Who should I ask for, and is morning or afternoon better?',
  selling:'Fair question. Nothing to buy today. I had one question about your shop.',
  have:'Sounds like you\'re covered. Can I ask one thing before I let you go?',
  cost:'The starter set is free and yours to keep. Anything ongoing is priced in writing first.',
  ai:'You hear it and approve it before any customer does.',
  notint:'No problem. Thanks for picking up, and good luck this season.',
  hung:'Hi, it\'s {me}. I\'m local, here in Connecticut. Did I catch you mid-job?'
};
const FOCUS = ['A friendly hello and a real question about his day, before anything about the shop.', 'After his answer, offer one gift in one sentence.', 'Say why it\'s free, then stop talking.', 'Ask for the 15 minutes before the call ends.', 'Confirm his email and a time before you hang up.'];
const DRILL = ['Say your hello and "How\'s your day going so far?" ten times out loud, smiling. Then practice answering three different replies.', 'Read the notice and the question back to back for three of your shops.', 'Say the 15-second line for your lead gift five times, then once without looking.', 'Say "we\'re new, so we do a few of these free" five times, then stay silent for three seconds.', 'Say the ask ten times: "Could I show you in 15 minutes?" Then wait three seconds.'];

/* ---------------- sign-in, storage, server ---------------- */
let auth = null, calls = [], team = null, loaded = false, loadErr = '', guest = 'Dan';
try{ auth = JSON.parse(localStorage.getItem('sw_auth') || 'null'); guest = localStorage.getItem('sw_guest') || 'Dan'; }catch(e){}
const user = () => auth ? auth.user : '';
const cacheKey = () => 'sw_calls2_' + user();
let mounted = '', dirty = true;
const go = h => { if(location.hash !== h) location.hash = h; };
const loadingHTML = `<div class="panel pad stack" aria-busy="true"><span class="sr">Loading</span><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>`;
const readCache = () => { try{ return JSON.parse(localStorage.getItem(cacheKey()) || '[]'); }catch(e){ return []; } };
const writeCache = () => { try{ localStorage.setItem(cacheKey(), JSON.stringify(calls)); }catch(e){} };
if(auth && user() !== 'Bobby') calls = readCache();
async function api(path, body){
  const r = await fetch(SERVER + path, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.assign({token:auth && auth.token}, body || {}))});
  const j = await r.json().catch(() => ({error:'The server sent something unreadable.'}));
  if(r.status === 401 && path !== '/auth'){ signOut(); throw new Error('Please sign in again.'); }
  if(!r.ok) throw new Error(j.error || ('Server error ' + r.status));
  return j;
}
function signOut(){ auth = null; calls = []; team = null; loaded = false; try{ localStorage.removeItem('sw_auth'); }catch(e){} mounted = ''; go('#/signin'); render(); }
async function ensure(){
  if(loaded || !auth) return;
  try{ const r = await api('/calls/list');
    if(r.team) team = r.team; else { const local = calls.filter(c => c._u); calls = (r.calls || []).map(fromServer); local.forEach(c => { const i = calls.findIndex(x => x.id === c.id); if(i >= 0) calls[i] = c; else calls.push(c); }); writeCache(); local.forEach(c => push(c)); }
    loadErr = ''; }
  catch(e){ loadErr = e.message; }
  loaded = true;
}
/* our call shape <-> the server's stored shape */
const toServer = c => ({id:c.id, shop:c.shop, shopName:c.shopName, at:c.at, outcome:c.outcome, reached:c.stage || 0, objection:c.turn || '', answers:{kind:c.kind, notes:c.notes || '', line:c.line || '', quote:c.quote || '', email:c.email || '', time:c.time || '', contact:c.contact || '', opener:c.opener || ''},
  next:c.next || {}, transcript:c.transcript, analysis:c.analysis, followups:c.followups});
const fromServer = s => ({id:s.id, caller:s.caller, shop:s.shop, shopName:s.shopName, at:s.at || s.updated, outcome:s.outcome || '', stage:s.reached || 0, turn:s.objection || '',
  kind:(s.answers && s.answers.kind) || (QUICK[s.outcome] ? 'quick' : 'talk'), notes:(s.answers && s.answers.notes) || '', line:(s.answers && s.answers.line) || '', quote:(s.answers && s.answers.quote) || '', email:(s.answers && s.answers.email) || '', time:(s.answers && s.answers.time) || '', contact:(s.answers && s.answers.contact) || '', opener:(s.answers && s.answers.opener) || '', next:s.next || {}, transcript:s.transcript, analysis:s.analysis, followups:s.followups});
const timers = {};
function push(c){ clearTimeout(timers[c.id]); timers[c.id] = setTimeout(async () => { try{ await api('/calls/save', {call:toServer(c)}); delete c._u; writeCache(); status('Saved'); }catch(e){ status('Saved on this device'); } }, 500); }
function save(c){ c._u = 1; const i = calls.findIndex(x => x.id === c.id); if(i >= 0) calls[i] = c; else calls.push(c); writeCache(); dirty = true; status('Saving…'); push(c); }
async function remove(id){ calls = calls.filter(c => c.id !== id); writeCache(); dirty = true; try{ await api('/calls/delete', {id}); }catch(e){} }
function status(t){ const el = $('#savestate'); if(el) el.textContent = t; }
const newId = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------------- model ---------------- */
const me = () => user() && user() !== 'Bobby' ? user() : guest;
const canLog = () => !!auth && user() !== 'Bobby';
const byId = id => D.companies.find(c => c.id === id);
const all = D.companies.slice().sort((a,b) => a.tier - b.tier || (b.total || 0) - (a.total || 0));
const myShops = () => user() === 'Bobby' ? all.filter(c => c.tier !== 4) : all.filter(c => c.caller === me() && c.tier !== 4);
const callsOf = (id, list) => (list || calls).filter(c => c.shop === id && c.outcome).sort((a,b) => String(a.at).localeCompare(String(b.at)));
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
const nice = d => d ? new Date(d.length === 10 ? d + 'T12:00:00' : d).toLocaleDateString(undefined, {month:'short', day:'numeric'}) : '';
const outLabel = c => c.kind === 'quick' ? (QUICK[c.outcome] || ['','Logged'])[1] : (ENDS[c.outcome] || 'Draft');
function state(shop, list){
  const cs = callsOf(shop.id, list), last = cs[cs.length - 1];
  if(!last) return {k:'todo', label:'Not called', icon:'circle', last:''};
  const open = cs.slice().reverse().find(c => c.next && c.next.action && !c.next.done);
  if(open) return {k:'due', label:open.next.date && open.next.date > today() ? 'Follow up ' + nice(open.next.date) : 'Follow up today', icon:'clock', last:open.next.action, late:!open.next.date || open.next.date <= today(), call:open};
  if(['booked','notint','wrong','info','callback'].includes(last.outcome)) return {k:'done', label:'Done', icon:'check-circle', last:outLabel(last) + ' · ' + nice(last.at)};
  return {k:'todo', label:cs.length + (cs.length > 1 ? ' tries' : ' try'), icon:'refresh', last:outLabel(last) + ' · ' + nice(last.at)};
}
const queue = () => { const s = myShops().map(c => [c, state(c)]); return s.filter(x => x[1].k === 'due' && x[1].late).concat(s.filter(x => x[1].k === 'todo' && x[1].icon === 'circle'), s.filter(x => x[1].k === 'todo' && x[1].icon !== 'circle')).map(x => x[0]); };
const first = c => c.first || ((c.ask === 'the owner' || / or /.test(c.ask)) ? '' : c.ask.split(' ')[0]);
const fill = (t, c) => O.fill(t, {me:c.caller || me(), name:first(c) || 'there', shop:c.said, town:c.town.replace(' area',''), lead:c.lead});
const question = c => c.q || S[c.lead].ask;
const socialLine = n => n.social.filter(s => s.p).slice(0,1).map(s => `${s.p}: ${s.last ? 'last post ' + s.last : 'no recent post seen'}, ${s.n90 == null ? '0' : s.n90} posts in 90 days`).join('');
const whyLine = c => (c.lead === 'social' && c.n ? socialLine(c.n) + '.' : (c.n && (c.n.proof.find(p => p.s === c.lead && !p.note) || {}).t) || c.why || '');
function steps(c){
  const g = O.gifts[c.lead], f = first(c), who = c.caller || me();
  return [
    {lines:[f ? `Hi, is this ${f}? Hey ${f}, this is ${who} with StarWell, here in Connecticut. Heating season's on, so I'll be quick.` : `Hi, could I speak with ${c.ask}, please? … Hi, this is ${who} with StarWell, here in Connecticut. I'll be quick.`, `I had one question about ${c.said}.`], then:''},
    {lines:[c.notice, 'Can I ask one thing? ' + question(c)], then:'Then stop and listen.'},
    {lines:["That's actually what we help with. " + fill(g.say, c)], then:g.termsShort + '.'},
    {lines:O.steps[3].say.filter(l => !/^\(/.test(l.t)).map(l => fill(l.t, c)), then:'Stop talking. Let him ask.'},
    {lines:['Could I show you in 15 minutes? Would tomorrow morning or the day after in the afternoon work better?', "And what's the best email to send it to?"], then:'Offer two real times from your calendar.'}
  ];
}
const weekStart = d => { const x = new Date(d); x.setHours(0,0,0,0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
function numbers(list){
  const w0 = weekStart(new Date()), w1 = new Date(w0); w1.setDate(w1.getDate() - 7);
  const done = list.filter(c => c.outcome), at = c => new Date(c.at);
  const cnt = l => ({dials:l.length, talks:l.filter(c => c.kind === 'talk').length, steps:l.filter(c => ['booked','callback','info'].includes(c.outcome)).length, booked:l.filter(c => c.outcome === 'booked').length});
  return {week:cnt(done.filter(c => at(c) >= w0)), last:cnt(done.filter(c => at(c) >= w1 && at(c) < w0)), all:cnt(done)};
}
function read(list, name){
  const t = list.filter(c => c.kind === 'talk' && c.outcome).slice(-20), n = t.length;
  if(n < 2) return null;
  const asked = t.filter(c => c.stage >= 5 || ['booked','callback','info'].includes(c.outcome)).length, reachedQ = t.filter(c => c.stage >= 2).length;
  const strength = asked * 2 >= n ? `Earns a next step (${asked} of ${n} conversations).` : reachedQ * 2 >= n ? `Gets to the question (${reachedQ} of ${n} conversations).` : `Keeps dialing: ${list.filter(c => c.outcome).length} calls logged.`;
  const stuck = t.filter(c => !['booked','callback','info'].includes(c.outcome)).map(c => c.stage || 1), m = {}; let st = 4, best = 0;
  stuck.forEach(s => { m[s] = (m[s] || 0) + 1; if(m[s] > best){ best = m[s]; st = s; } });
  const tm = {}; let turn = 'none', tb = 0; t.forEach(c => { if(c.turn && c.turn !== 'none'){ tm[c.turn] = (tm[c.turn] || 0) + 1; if(tm[c.turn] > tb){ tb = tm[c.turn]; turn = c.turn; } } });
  return {strength, focus:FOCUS[Math.min(4, Math.max(0, st - 1))], stage:st, turn, tryNext:turn === 'none' ? `"${LINE.none}"` : `If he says ${TURNS[turn]}: "${LINE[turn].replace('{me}', name)}"`};
}

/* ---------------- sign in ---------------- */
function signinView(){
  shell('');
  app.innerHTML = `<form class="panel pad stack signin" id="f" novalidate>
    <h1>Sign in</h1>
    <fieldset class="field"><legend>Who are you?</legend><div class="seg" role="group">${['Dan','RJ','Bobby'].map((n,i) => `<button type="button" aria-pressed="${!i}" data-u="${n}">${n}</button>`).join('')}</div></fieldset>
    <div class="field"><label for="pw">Password</label><input class="input" id="pw" type="password" autocomplete="current-password" aria-describedby="err"></div>
    <p class="note bad" id="err" role="alert" hidden></p>
    <button class="btn primary" id="go">Sign in</button>
    <a class="link" href="#/queue">Look around without signing in</a></form>`;
  let u = 'Dan';
  $$('[data-u]').forEach(b => b.onclick = () => { u = b.dataset.u; $$('[data-u]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pw').focus(); });
  $('#f').onsubmit = async e => { e.preventDefault(); const err = $('#err'); err.hidden = true; $('#go').disabled = true;
    try{ const r = await api('/auth', {user:u, password:$('#pw').value}); auth = {token:r.token, user:r.user}; localStorage.setItem('sw_auth', JSON.stringify(auth)); loaded = false; calls = user() === 'Bobby' ? [] : readCache(); dirty = true; mounted = ''; go('#/queue'); render(); }
    catch(x){ err.textContent = x.message; err.hidden = false; $('#go').disabled = false; $('#pw').focus(); } };
}

function readHTML(r){ return r ? `<dl class="read"><dt class="label">Strength</dt><dd class="sm">${esc(r.strength)}</dd><dt class="label">Focus</dt><dd class="sm">${esc(r.focus)}</dd><dt class="label">Try next</dt><dd class="sm">${esc(r.tryNext)}</dd></dl>`
  : `<p class="sm muted">Your coach's read appears after two logged conversations.</p>`; }
const statHTML = (n, l, prev) => `<div class="stat"><b>${n}</b><span>${l}</span>${prev != null && n > prev ? `<small>+${n - prev} vs last week</small>` : ''}</div>`;
/* ---------------- the conversation log (sheet) ---------------- */
function logSheet(id, base, ro, list){
  const c = (list || calls).find(x => x.id === id); $$('.sheetwrap').forEach(x => x.remove());
  if(!c) return;
  const shop = byId(c.shop) || {said:c.shopName, ask:''}, dis = ro ? 'disabled' : '', a = c.analysis;
  const wrap = document.createElement('div'); wrap.className = 'sheetwrap';
  wrap.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="lt"><div class="sidehead glass"><div class="grow"><h2 id="lt" class="sm">${esc(c.shopName)}</h2><p class="xs muted">${esc(new Date(c.at).toLocaleString(undefined, {weekday:'short', month:'short', day:'numeric', hour:'numeric', minute:'2-digit'}))}${ro ? ' · ' + esc(c.caller) + ' · read only' : ''}</p></div><button class="btn quiet icononly" id="lx" aria-label="Close">${ic('x')}</button></div>
    <form class="sidebody" id="lf" novalidate>
      ${c.kind === 'quick' ? `<p class="row">${ic((QUICK[c.outcome] || ['circle'])[0])}<b>${esc(outLabel(c))}</b></p>` : `
      <fieldset class="field" id="endf"><legend>How did it end?</legend><div class="tiles">${Object.keys(ENDS).map(k => `<label class="tile"><input type="radio" name="end" value="${k}" ${c.outcome === k ? 'checked' : ''} ${dis}>${ENDS[k]}</label>`).join('')}</div><p class="note bad" id="enderr" role="alert" hidden>Pick how it ended.</p></fieldset>
      <div class="field"><label for="stg">How far did you get?</label><select class="input" id="stg" ${dis}>${STAGES.map((s,i) => `<option value="${i + 1}" ${c.stage === i + 1 ? 'selected' : ''}>${i + 1}. ${s}</option>`).join('')}</select></div>
      <div class="field"><label for="trn">Where did the call turn?</label><select class="input" id="trn" ${dis}><option value="">Choose one</option>${Object.keys(TURNS).map(k => `<option value="${k}" ${c.turn === k ? 'selected' : ''}>${esc(TURNS[k])}</option>`).join('')}</select></div>
      <div class="field"><label for="lin">Line to try next call</label><input class="input" id="lin" value="${esc(c.line || '')}" ${dis}></div>`}
      <div class="field"><label for="nxa">Next step with this shop</label><div class="row"><input class="input grow" id="nxa" value="${esc((c.next || {}).action || '')}" ${dis}><input class="input" id="nxd" type="date" aria-label="Date" value="${esc((c.next || {}).date || '')}" ${dis}></div></div>
      <details class="d" ${c.notes || c.transcript || a ? 'open' : ''}><summary>Notes and recording${ic('chevron-right','sm')}</summary><div class="stack">
        <div class="field"><label for="nts">What did he say, in his words?</label><textarea class="input" id="nts" ${dis}>${esc(c.notes || '')}</textarea></div>
        ${ro || c.kind === 'quick' ? '' : `<div class="field"><label for="aud">Recording</label><input class="input" id="aud" type="file" accept="audio/*,video/mp4,.m4a,.mp3,.wav,.webm,.ogg">
          <label class="check sm"><input type="checkbox" id="consent"><span>Everyone on the call knew it was being recorded.</span></label></div>
          <div class="row wrap"><button type="button" class="btn" id="rev">${ic('mic','sm')}Review this call</button><span class="sm muted" id="prog" role="status"></span></div>`}
        ${a ? reviewHTML(c) : ''}
      </div></details>
      <p class="note bad" id="lerr" role="alert" hidden></p>
      ${ro ? '' : `<div class="row between wrap"><button type="button" class="link danger" id="del">Delete</button><span class="row"><span class="xs muted" id="savestate" role="status">Saved as you go</span><button class="btn primary">${base.startsWith('#/call') ? 'Done, next shop' : 'Done'}${ic('arrow-right','sm')}</button></span></div>`}
    </form></div>`;
  document.body.appendChild(wrap);
  const close = () => { if(!ro && c.kind === 'talk' && !c.outcome && !c.notes && !c.turn){ calls = calls.filter(x => x.id !== c.id); writeCache(); } history.length > 1 ? history.back() : go(base); };
  $('#lx', wrap).onclick = close; wrap.onclick = e => { if(e.target === wrap) close(); };
  wrap.onkeydown = e => { if(e.key === 'Escape') close(); };
  ($('input:not([disabled]),select:not([disabled])', wrap) || $('#lx', wrap)).focus();
  if(ro) return;
  const nx = () => c.next || (c.next = {});
  $$('[name=end]', wrap).forEach(r => r.onchange = () => { c.outcome = r.value; $('#enderr', wrap).hidden = true;
    if(c.outcome === 'info' && !nx().action){ nx().action = 'Send the info, then check in'; nx().date = addDays(2); $('#nxa', wrap).value = nx().action; $('#nxd', wrap).value = nx().date; }
    if(c.outcome === 'callback' && !nx().action){ nx().action = 'Call back'; nx().date = addDays(1); $('#nxa', wrap).value = nx().action; $('#nxd', wrap).value = nx().date; }
    save(c); });
  const on = (sel, fn) => { const el = $(sel, wrap); if(el) el.oninput = () => { fn(el.value); save(c); }; };
  on('#stg', v => c.stage = +v);
  on('#trn', v => { c.turn = v; const lin = $('#lin', wrap); if(v && (!c.line || Object.values(LINE).some(l => l.replace('{me}', user()) === c.line))){ c.line = LINE[v].replace('{me}', user()); lin.value = c.line; } });
  on('#lin', v => c.line = v); on('#nxa', v => nx().action = v); on('#nxd', v => nx().date = v); on('#nts', v => c.notes = v);
  $('#del', wrap).onclick = async function(){ if(!this.dataset.sure){ this.dataset.sure = 1; this.textContent = 'Tap again to delete'; return; } await remove(c.id); mounted = ''; history.length > 1 ? history.back() : go(base); };
  $('#lf', wrap).onsubmit = e => { e.preventDefault();
    if(c.kind === 'talk' && !c.outcome){ $('#enderr', wrap).hidden = false; $('[name=end]', wrap).focus(); return; }
    save(c); mounted = '';
    if(base.startsWith('#/call')){ const q = queue().filter(x => x.id !== c.shop); toast('Logged: ' + outLabel(c)); if(q.length) location.replace('#/call/' + q[0].id); else location.replace('#/queue'); }
    else history.length > 1 ? history.back() : go(base); };
  const rev = $('#rev', wrap); if(rev) rev.onclick = async () => {
    const err = $('#lerr', wrap), prog = $('#prog', wrap), f = $('#aud', wrap).files[0]; err.hidden = true;
    const fail = m => { err.textContent = m; err.hidden = false; prog.textContent = ''; rev.disabled = false; };
    if(!c.outcome) return fail('Pick how it ended first.');
    if(f && !$('#consent', wrap).checked) return fail('Confirm that everyone knew the call was recorded, or review from your notes only.');
    if(f && f.size > 40 * 1024 * 1024) return fail('That file is over 40 MB.');
    if(!f && !c.transcript && !(c.notes || '').trim()) return fail('Add a recording or a few notes first.');
    rev.disabled = true;
    try{
      if(f){ prog.textContent = 'Transcribing…'; const r = await fetch(SERVER + '/calls/transcribe', {method:'POST', headers:{'Content-Type':'application/octet-stream', 'X-Token':auth.token, 'X-File-Name':f.name.replace(/[^\w.\- ]/g, '')}, body:f}); const j = await r.json(); if(!r.ok) throw new Error(j.error || 'Transcription failed.'); c.transcript = {turns:j.turns, callerSp:j.callerSp, duration:j.duration}; save(c); }
      prog.textContent = 'Writing the review…';
      const t = c.transcript, text = t ? t.turns.map(x => (x.sp === t.callerSp ? 'CALLER: ' : 'OWNER: ') + x.t).join('\n').slice(0, 30000) : '';
      const hist = calls.filter(x => x.id !== c.id && x.kind === 'talk' && x.outcome).slice(-8).map(x => ({date:String(x.at).slice(0,10), outcome:x.outcome, stage:x.stage, turn:x.turn}));
      const res = await api('/calls/analyze', {shop:{name:shop.said, town:shop.town, leadGift:TAG[shop.lead], notice:shop.notice, question:shop.lead ? question(shop) : ''}, outcome:ENDS[c.outcome], transcript:text || '(no recording; review from the caller\'s notes only)', selfReport:{reachedStep:STAGES[(c.stage || 1) - 1], momentItTurned:TURNS[c.turn] || '', notes:c.notes || ''}, history:hist});
      c.analysis = res.analysis; if(!c.line) c.line = c.analysis.line_to_try; save(c); logSheet(id, base, ro, list);
    }catch(x){ fail(x.message); }
  };
  const sw = $('#swap', wrap); if(sw) sw.onclick = () => { const sp = [...new Set(c.transcript.turns.map(x => x.sp))]; c.transcript.callerSp = sp.find(x => x !== c.transcript.callerSp); if(c.transcript.callerSp == null) c.transcript.callerSp = sp[0]; delete c.analysis; save(c); logSheet(id, base, ro, list); };
}
function reviewHTML(c){
  const a = c.analysis, t = c.transcript;
  return `<section class="stack" aria-label="Call review"><dl class="read"><dt class="label">Strength</dt><dd class="sm">${esc(a.win)}</dd><dt class="label">Focus</dt><dd class="sm">${esc(a.fix)}</dd><dt class="label">Try next</dt><dd class="sm">"${esc(a.line_to_try)}"</dd></dl>
    <div><div class="talk" role="img" aria-label="You spoke ${Math.round(a.talk_caller_pct)} percent of the words"><span style="width:${Math.round(a.talk_caller_pct)}%"></span></div><p class="xs muted">You spoke ${Math.round(a.talk_caller_pct)}% of the words.</p></div>
    ${a.moments.map(m => `<div class="stack s2"><p class="sm"><b>${m.speaker === 'caller' ? 'You' : 'Owner'}:</b> "${esc(m.quote)}"</p><p class="sm muted">${esc(m.what_worked_or_happened)} ${esc(m.try_next_time)}</p></div>`).join('')}
    ${a.accuracy_flags.length ? `<p class="note">${ic('info')}<span>${a.accuracy_flags.map(esc).join(' ')}</span></p>` : ''}
    ${t ? `<details class="d"><summary>Transcript${ic('chevron-right','sm')}</summary><div>${t.turns.map(x => `<p class="turn ${x.sp === t.callerSp ? 'me' : ''}"><b>${x.sp === t.callerSp ? 'You' : 'Owner'}:</b> ${esc(x.t)}</p>`).join('')}<button type="button" class="link" id="swap">Swap "You" and "Owner"</button></div></details>` : ''}</section>`;
}

/* ---------------- systems ---------------- */
const DELIV = {site:0, phone:1, found:2, social:3};
function deliveryHTML(key){
  const x = ((SC.qa_matrix || {}).delivery_specs || [])[DELIV[key]]; if(!x) return '';
  return `<section class="panel pad stack"><h2>How we deliver it</h2><p class="sm">${esc(x.how_we_do_it)}</p><p class="label">What we need from the owner</p><ul class="stack s2">${x.what_we_need_from_owner.map(t => `<li class="row sm top">${ic('check','sm')}<span>${esc(t)}</span></li>`).join('')}</ul></section>`;
}
function methodView(){
  const M = SC.call_method, Q = SC.qa_matrix || {}, c = {caller:me(), ask:'the owner', first:''};
  const sysbtn = S.order.map(k => `<button aria-pressed="false" data-sys="${k}">${esc(S[k].name)}</button>`).join('') + `<button aria-pressed="true" data-sys="method">Call method</button>`;
  shell('systems'); mounted = 'systems';
  app.innerHTML = `<div class="pagehead"><h1>Systems</h1><div class="seg" role="group" aria-label="System">${sysbtn}</div></div>
    <div class="split wide"><div class="stack s6">
      <section class="panel pad stack"><div><p class="label">How every call runs</p><h2>Four stages. Leave him glad he picked up.</h2></div>
        <ol class="stack s2">${(M.four_stage_architecture || []).map((x,i) => `<li class="row top"><span class="num">${i + 1}</span><span class="sm"><b>${esc(String(x.stage).replace(/^\d+\.\s*/, ''))}</b> · ${esc(x.time_target)}<br>${esc(x.goal)}<br><span class="muted">${esc(x.rule)}</span></span></li>`).join('')}</ol></section>
      <section class="panel pad stack"><h2>When he pushes back</h2><div>${(Q.busy_and_guarded_owners || []).map(x => `<details class="d qi"><summary>${esc(tok(x.they_say, c).replace(/^\[(.*)\]$/, '$1'))}${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(tok(x.response, c))}</p></div><p class="sm muted">Why they say it: ${esc(x.psychology)}</p></div></details>`).join('')}</div></section>
      <section class="panel pad stack"><h2>Straight answers</h2><div>${(Q.skeptical_and_operational_qa || []).map(x => `<details class="d qi"><summary>${esc(x.question)}${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(tok(x.answer, c))}</p></div></div></details>`).join('')}</div></section></div>
    <div class="stack s6"><section class="panel pad stack"><h2>When to make small talk</h2>
        <ul class="stack s2">
          <li class="row sm top">${ic('check','sm')}<span><b>Right after your hello.</b> Ask how his day is going, then answer what he says with one real line. Follow his pace.</span></li>
          <li class="row sm top">${ic('check','sm')}<span><b>While you ask.</b> Stay on him: his shop, his crew, how long he has been at it.</span></li>
          <li class="row sm top">${ic('check','sm')}<span><b>At the goodbye.</b> Thank him by name and mention one thing he told you.</span></li>
          <li class="row sm top">${ic('x','sm')}<span><b>Not</b> right after you ask a question, not during the offer, and not when he sounds rushed. Then go straight to the heads-up.</span></li></ul>
        <p class="sm muted">Why: in Gong's review of 90,380 recorded cold calls, opening with a "how are you" question booked meetings 3.4 times as often as the average call. <a class="link" href="https://www.gong.io/blog/cold-call-opening-lines" target="_blank" rel="noopener">Gong Labs</a></p></section>
      <section class="panel pad stack"><h2>Give him the stage</h2>
        <div class="share" role="img" aria-label="While you ask, aim for him talking about 80 percent of the time and you about 20"><span>He talks 80%</span><span>You 20%</span></div>
        <ul class="stack s2">
          <li class="row sm top">${ic('check','sm')}<span>The 80/20 rule is for the <b>Ask</b> stage. You carry the first twenty seconds, then hand him the floor.</span></li>
          <li class="row sm top">${ic('check','sm')}<span>When you do talk, talk about his shop, in his words.</span></li>
          <li class="row sm top">${ic('check','sm')}<span>Keep him going: ${KEEP.map(k => '"' + esc(k) + '"').join(' ')}</span></li>
          <li class="row sm top">${ic('check','sm')}<span>Use his name. Let him finish. Never talk over him.</span></li></ul>
        <p class="sm muted">Dale Carnegie: be a good listener and talk in terms of the other person's interests. Brian Tracy: the best salespeople listen far more than they talk. Robert Cialdini: give first, and people say yes to those they like.</p></section>
      <section class="panel pad stack"><h2>Three ways to open</h2><ul class="stack s2">${VARS.map((v,i) => `<li class="sm"><b>${i + 1}. ${v[1]}.</b> ${esc(mine((M.variation_guide || {})[v[0]], c))}</li>`).join('')}</ul></section>
      <section class="panel pad stack"><h2>Ground rules</h2><ul class="stack s2">${(M.five_non_negotiable_ground_rules || []).map(x => `<li class="row sm top">${ic('check','sm')}<span>${esc(x)}</span></li>`).join('')}</ul></section>
      <section class="panel pad stack"><h2>What changed in the opening</h2><ul class="stack s2">${(M.five_carnegie_stage_1_upgrades || []).map(x => `<li class="row sm top">${ic('check','sm')}<span>${esc(x)}</span></li>`).join('')}</ul></section>
      <section class="panel pad"><details class="d"><summary>Why it works${ic('chevron-right','sm')}</summary><div>${(M.evidence_base || []).map(x => `<p class="sm"><b>${esc(x.principle)}.</b> ${esc(mine(x.takeaway, c))} <span class="muted">${esc(x.source)}</span></p>`).join('')}</div></details></section></div></div>`;
  $$('[data-sys]').forEach(b => b.onclick = () => location.replace('#/systems/' + b.dataset.sys));
}
function systemsView(parts){
  if(parts[1] === 'method' && (SC.call_method || {}).four_stage_architecture){ methodView(); return; }
  const key = S[parts[1]] && S[parts[1]].qa ? parts[1] : 'phone', s = S[key], g = O.gifts[key];
  shell('systems'); mounted = 'systems';
  app.innerHTML = `<div class="pagehead"><h1>Systems</h1><div class="seg" role="group" aria-label="System">${S.order.map(k => `<button aria-pressed="${k === key}" data-sys="${k}">${esc(S[k].name)}</button>`).join('')}${(SC.call_method || {}).four_stage_architecture ? '<button aria-pressed="false" data-sys="method">Call method</button>' : ''}</div></div>
    <div class="split wide"><div class="stack s6">
      <section class="panel pad stack"><div><p class="label">${esc(s.pillar)}${s.paid ? ' · Paid, quoted up front' : ' · Free to start'}</p><h2>${esc(s.one)}</h2></div>
        <div class="seg" role="group" aria-label="Length"><button aria-pressed="true" data-say="15">15 seconds</button><button aria-pressed="false" data-say="45">45 seconds</button></div>
        <div class="say" id="sayx"><p>${esc(s.say15)}</p></div>
        <dl class="kv"><dt class="label">Solves</dt><dd class="sm">${esc(s.problem)}</dd><dt class="label">Ask</dt><dd class="sm">${esc(s.ask)}</dd><dt class="label">Costs him</dt><dd class="sm">${esc(g ? g.terms : O.custom.terms)}</dd></dl></section>
      <section class="panel pad stack"><div class="row between wrap"><h2>Questions owners ask</h2><div class="field"><label class="sr" for="qa">Search answers</label><input class="input" id="qa" type="search" placeholder="Search answers"></div></div>
        <div id="qal">${s.qa.map(gp => `<div class="qg"><p class="label qgl">${esc(gp.group)}</p>${gp.items.map(i => `<details class="d qi"><summary>${esc(i.q)}${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(i.a)}</p></div>${i.check ? `<p class="sm muted">Before you promise it: ${esc(i.check)}</p>` : ''}</div></details>`).join('')}</div>`).join('')}</div>
        <div class="empty" id="qae" hidden>${ic('search')}<h3>No answer matches</h3><button class="btn" id="qac">Clear search</button></div></section></div>
    <div class="stack s6"><section class="panel pad stack"><h2>How it works</h2><ol class="stack s2">${s.how.map((x,i) => `<li class="row top"><span class="num">${i + 1}</span><span class="sm">${esc(x)}</span></li>`).join('')}</ol></section>
      ${deliveryHTML(key)}<section class="panel pad stack"><h2>What it does not do</h2><ul class="stack s2">${s.notDo.map(x => `<li class="row sm top">${ic('x','sm')}<span>${esc(x)}</span></li>`).join('')}</ul></section>
      <section class="panel pad"><details class="d"><summary>A real-life picture${ic('chevron-right','sm')}</summary><div><p class="sm">${esc(s.scenario)}</p></div></details>
        ${s.parts ? `<details class="d"><summary>The six parts of a rebuilt site${ic('chevron-right','sm')}</summary><div>${s.parts.map(p => `<p class="sm"><b>${esc(p.t)}.</b> ${esc(p.d)}</p>`).join('')}</div></details>` : ''}
        ${s.words ? `<details class="d"><summary>SEO, AEO and GEO, for you only${ic('chevron-right','sm')}</summary><div>${s.words.map(p => `<p class="sm"><b>${esc(p.t)}:</b> ${esc(p.d)}</p>`).join('')}</div></details>` : ''}
        <details class="d"><summary>Proof it helps${ic('chevron-right','sm')}</summary><div>${(D.proof[key] || []).map(p => `<p class="sm">${esc(p.t)} ${p.u ? `<a href="${esc(p.u)}" target="_blank" rel="noopener">${esc(p.s)}</a>` : esc(p.s)}</p>`).join('')}</div></details>
        <details class="d"><summary>Go deeper${ic('chevron-right','sm')}</summary><div>${s.deeper.map(x => `<p class="sm">${esc(x)}</p>`).join('')}</div></details></section></div></div>`;
  $$('[data-sys]').forEach(b => b.onclick = () => location.replace('#/systems/' + b.dataset.sys));
  $$('[data-say]').forEach(b => b.onclick = () => { $$('[data-say]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#sayx p').textContent = b.dataset.say === '15' ? s.say15 : s.say45; });
  const filt = v => { let n = 0; $$('.qi').forEach(d => { const hit = !v || d.textContent.toLowerCase().includes(v); d.hidden = !hit; d.open = !!v && hit; if(hit) n++; }); $$('.qg').forEach(gp => gp.hidden = !$('.qi:not([hidden])', gp)); $('#qae').hidden = n > 0; };
  $('#qa').oninput = e => filt(e.target.value.toLowerCase().trim()); $('#qac').onclick = () => { $('#qa').value = ''; filt(''); $('#qa').focus(); };
}

/* ---------------- progress ---------------- */
let who = 'Dan';
function progressView(parts){
  shell('progress'); mounted = 'progress';
  if(!auth){ app.innerHTML = `<div class="pagehead"><h1>Progress</h1></div><div class="panel empty">${ic('bar-chart')}<h3>Sign in to see your progress</h3><p class="sm">Your calls, your follow-ups and your coach's read live here.</p><a class="btn primary" href="#/signin">Sign in</a></div>`; return; }
  const bob = user() === 'Bobby', name = bob ? who : user(), list = (bob ? ((team && team[who]) || []).map(fromServer) : calls).filter(c => c.outcome);
  const n = numbers(list), r = read(list, name), talks = list.filter(c => c.kind === 'talk');
  const due = list.filter(c => c.next && c.next.action && !c.next.done).sort((a,b) => String(a.next.date).localeCompare(String(b.next.date)));
  const recent = list.slice().sort((a,b) => String(b.at).localeCompare(String(a.at))).slice(0, 40);
  app.innerHTML = `<div class="pagehead"><h1>${bob ? 'Team progress' : 'Progress'}</h1>${bob ? `<div class="seg" role="group" aria-label="Caller">${['Dan','RJ'].map(x => `<button aria-pressed="${who === x}" data-who="${x}">${x}</button>`).join('')}</div>` : ''}</div>
    ${loadErr ? `<p class="note gap" role="status">${ic('alert-triangle')}<span>${esc(loadErr)}</span></p>` : ''}
    ${!list.length ? `<div class="panel empty">${ic('phone')}<h3>No calls logged yet</h3><p class="sm">${bob ? esc(name) + ' has not logged a call.' : 'Log your first call and this page fills in.'}</p>${bob ? '' : '<a class="btn primary" href="#/queue">Go to the queue</a>'}</div>` : `
    <div class="stack s6">
      <section class="panel pad summary"><div class="stats">${statHTML(n.week.dials,'Dials this week',n.last.dials)}${statHTML(n.week.talks,'Conversations',n.last.talks)}${statHTML(n.week.steps,'Next steps',n.last.steps)}${statHTML(n.all.booked,'Walkthroughs, all time')}</div>${readHTML(r)}</section>
      <div class="split">
        <section class="panel pad stack"><h2>How far conversations got</h2>${talks.length ? `<div class="bars">${STAGES.map((s,i) => { const k = talks.filter(c => (c.stage || 1) >= i + 1).length; return `<div><span>${i + 1}. ${s}</span><span class="talk" role="img" aria-label="${k} of ${talks.length}"><span style="width:${Math.round(k / talks.length * 100)}%"></span></span><b>${k}</b></div>`; }).join('')}</div>` : `<p class="sm muted">No conversations yet.</p>`}
          ${r ? `<div class="stack s2"><p class="label">This week's 2-minute drill</p><p class="sm">${esc(DRILL[Math.min(4, Math.max(0, r.stage - 1))])}</p><a class="link" href="../starwell-practice/" target="_blank" rel="noopener">Open the Practice Line</a></div>` : ''}
          ${list.some(c => c.opener) ? `<div class="stack s2"><p class="label">Openers used, and how many became conversations</p><div class="bars">${VARS.map(v => [v[0].slice(0, 2), v[1]]).concat(list.some(c => c.opener === 'v1') ? [['v1', 'Total control (retired)']] : []).map(v => { const k = v[0], a = list.filter(c => c.opener === k), t = a.filter(c => c.kind === 'talk').length; return `<div><span>${v[1]}</span><span class="talk" role="img" aria-label="${t} of ${a.length}"><span style="width:${a.length ? Math.round(t / a.length * 100) : 0}%"></span></span><b>${t}/${a.length}</b></div>`; }).join('')}</div></div>` : ''}</section>
        <section class="panel pad stack"><h2>Follow-ups</h2>${due.length ? `<div>${due.map(c => `<label class="check sm"><input type="checkbox" data-done="${esc(c.id)}" ${bob ? 'disabled' : ''}><span><b>${esc(c.shopName)}</b><br>${esc(c.next.action)}${c.next.date ? ' · ' + nice(c.next.date) : ''}</span></label>`).join('')}</div>` : `<p class="sm muted">Nothing open.</p>`}</section>
      </div>
      <section class="panel"><div class="panelhead"><h2>Calls</h2><p class="sm muted">${list.length} logged</p></div>
        <table class="list"><thead><tr><th scope="col">Result</th><th scope="col">Shop</th><th scope="col">Got to</th><th scope="col">Turned on</th><th scope="col">When</th></tr></thead><tbody>
        ${recent.map(c => `<tr class="item" data-call="${esc(c.id)}"><td class="c-state"><span class="state">${ic(c.kind === 'quick' ? (QUICK[c.outcome] || ['circle'])[0] : OUTI[c.outcome] || 'circle','sm')}${esc(outLabel(c))}</span></td><td class="c-name"><a class="name" href="#/progress/log/${esc(c.id)}">${esc(c.shopName)}</a></td><td class="c-ask">${c.kind === 'talk' ? STAGES[(c.stage || 1) - 1] : ''}</td><td class="c-lead">${esc(TURNS[c.turn] || '')}</td><td class="c-last muted">${nice(c.at)}${c.analysis ? ' · reviewed' : ''}</td></tr>`).join('')}</tbody></table></section>
    </div>`}`;
  $$('[data-who]').forEach(b => b.onclick = () => { who = b.dataset.who; render(); });
  $$('tr[data-call]').forEach(tr => tr.onclick = e => { if(e.target.closest('a')) return; go('#/progress/log/' + tr.dataset.call); });
  $$('[data-done]').forEach(b => b.onchange = () => { const c = calls.find(x => x.id === b.dataset.done); if(c){ c.next.done = true; save(c); toast('Follow-up done'); render(); } });
}


/* =====================================================================
   Selected UI: queue + one company workspace (Prepare, Call, Wrap up).
   ===================================================================== */
/* One grounded first question per shop, written from the Nov 16 research. Never a claim. */
const ASK = {
  benedetto:'When someone taps Book Now on your site from their phone, what happens next on your end?',
  silvercity:'When someone finds you on their phone, how do they usually reach you: a call, or the form on your contact page?',
  broadbrook:'With everybody out in the three trucks, who catches the phone during the day, and after 5?',
  rw:'When someone who isn\'t a contract customer calls at night, what happens to that call?',
  corbett:'After the office closes at 3:30, what happens when someone who isn\'t a client yet calls?',
  quietcorners:'When someone has no heat on a Saturday, what do they usually do to reach you?',
  superiorcomfort:'When a new customer finds your site on their phone, how do they usually get in touch: call, email or the form?',
  masters:'When someone finds your site on their phone and needs service, how do they usually reach you: call or email?',
  nutmeg:'When someone finds your site on their phone, how do they usually reach dispatch: call or email?',
  rb:'When someone taps Request Service on your site, what happens next on your end?',
  homehvac:'When someone lands on your site from their phone, how do they usually reach you: a call or the contact form?',
  seans:'How do most new customers find you these days: word of mouth, or do they look you up?',
  kevindean:'How do most new customers find you these days: referrals, or do people look you up online?',
  chickos:'When a new neighbor in Seymour looks for a heating company, how do they usually end up finding you?',
  onofreo:'How do most of your mini split customers find you: referrals, Google, or somewhere else?',
  giordanos:'When someone taps Request Service on your site, who sees it, and how fast does it reach you?',
  nero:'When someone finds your site on their phone and wants service, what do you want them to do first: call, or send a request?',
  airinc:'When someone lands on your site from their phone, how do they usually book: online, or a call?',
  nathan:'When someone books through the appointment form on your site, how does that reach you?',
  homecomfort:'When someone opens your site on their phone, how do they usually reach you: the request form or a call?',
  mandr:'When someone calls after 7, or on a Sunday, what happens to that call?',
  modern:'When someone calls after 5, or on a weekend, what happens to that call?',
  climatepros:'How do most new customers in Orange find you these days?',
  climatech:'After 5, or on a Saturday afternoon, what happens when a customer calls?',
  airspecialties:'Do you get much time to post your jobs online, or is there never a minute for that?',
  allamerican:'On a Friday after 2, what happens when someone who isn\'t on a maintenance plan calls?',
  centralair:'When someone taps the call button on your site, which line does that ring on your end?',
  hellas:'When someone finds your site on their phone, how do they usually get hold of you?',
  dynamic:'When someone books through your site, how does that reach your team?'
};
const STAGE4 = ['Introduce','Ask','Offer','Next step'];
const CUES = ['Ask permission. Give them room to answer.', 'Pause and listen. Follow their answer.', 'One relevant offer. Keep it short.', 'Confirm the detail, then agree a next step.'];
const RESP = [['email','Send an email'],['busy','I\'m busy'],['price','What does it cost?'],['allset','Already have help'],['yes','I\'m interested'],['catch','What\'s the catch?'],['proof','Do you have proof?'],['ai','I don\'t trust AI'],['scam','Is this a scam?'],['wrong','Wrong person'],['custom','We have an office headache'],['no','Not interested'],['who','Who are you?']];
const OUTS = [['booked','Walkthrough booked'],['callback','Call back agreed'],['info','Asked for info'],['notnow','Not now'],['notint','Not interested'],['early','Hung up'],['office','Reached the office'],['voicemail','Voicemail'],['no_answer','No answer'],['wrong','Wrong number']];
const TALK = ['booked','callback','info','notnow','notint','early'];
const RESP2TURN = {email:'email', busy:'busy', price:'cost', allset:'have', ai:'ai', no:'notint', scam:'selling', wrong:'office'};
const SYSN = {phone:'Answering line', site:'Website', found:'Getting found', social:'Social posts'};

/* ---------- research: the Nov 18 and Nov 24 snapshots, loaded once ---------- */
let RAW = null, rawState = 'idle';
async function loadRaw(){
  if(RAW || rawState === 'loading') return;
  rawState = 'loading';
  try{ const get = async (f, must) => { try{ const r = await fetch('../starwell-practice/research/' + f); if(!r.ok) throw new Error(r.status); return await r.json(); }catch(e){ if(must) throw e; return []; } };
    const parts = await Promise.all([get('starwell_needs.json?v=20261119b', true), get('starwell_needs_nov24.json?v=20261124a', false)]);
    RAW = {}; parts.forEach(arr => arr.forEach(x => { if(x && x.id && x.scores) RAW[x.id] = x; })); rawState = 'ok'; }
  catch(e){ rawState = 'error'; }
  if(mounted === 'ws') render();
}
const tri = v => v === true ? ['y','Yes'] : v === false ? ['n','No'] : ['u', v == null || v === '' ? '' : String(v)];
const isUrl = u => /^https?:\/\//.test(String(u || ''));
const srcHTML = (u, seen, shot) => `<span class="src">${seen ? 'Seen ' + esc(nice(String(seen).slice(0,10))) : ''}${isUrl(u) ? `${seen ? ' · ' : ''}<a href="${esc(String(u).split(' ')[0])}" target="_blank" rel="noopener">Source</a>` : ''}</span>`;
const evList = (items, cls) => items.length ? `<ul class="ev">${items.map(i => `<li class="${cls || ''}">${i}</li>`).join('')}</ul>` : '';
const proofOf = (R, k) => (R.proof || []).filter(p => p.system === k && !/^Score note/i.test(p.finding || ''));

/* ---------- readiness ---------- */
function ready(c){
  const n = c.n;
  if(c.tier === 4 || (n && n.open === false)) return ['hold','On hold', c.flag || 'Research found this business closed. Do not call until that is reviewed.'];
  if(c.flag) return ['check','Check first', c.flag];
  if(!n) return ['incomplete','Research to come', 'Ask how things work today, and let them tell you.'];
  return ['ready','Ready', ''];
}

/* ---------- drafts: one per company, kept on this device until the call is saved ---------- */
const dKey = () => 'sw_drafts_' + (user() || 'guest');
let drafts = {}; try{ drafts = JSON.parse(localStorage.getItem(dKey()) || '{}'); }catch(e){}
const draft = id => drafts[id] || (drafts[id] = {stage:0, turn:0, response:'', email:'', cbDate:'', cbTime:'', contact:'', outcome:'', nextAction:'', date:'', time:'', note:'', quote:'', reached:0, turnOn:'', prep:''});
const keep = () => { try{ localStorage.setItem(dKey(), JSON.stringify(drafts)); }catch(e){} };
const scope = () => myShops();

/* ---------- the call scripts: three openers, four stages, shared answers ---------- */
const OPN = {v1:'Total control', v2:'Appreciation', v3:'Helpful first', v4:'One true thing'};
const VARS = [['v4_one_true_thing','One true thing','One true thing we checked, then one small gift'],['v2_sincere_appreciation','Appreciation','Opens with one real compliment'],['v3_helpful_first','Helpful first','For busy mornings and veterans']];
/* Each caller has their own account. Nothing on screen names the other caller. */
const recFor = c => ((SC._meta || {}).recommended_defaults || {})[callerOf(c)] || '';
const mine = (t, c) => { const who = callerOf(c), ct = ((SC._meta || {}).caller_tokens || {})[who] || who; return String(t || '').replace(/Best for (Dan|RJ)\.\s*/g, (m, n) => n === who ? 'Your default. ' : '').replace(/'Dan over in Shelton' or 'RJ down in Bridgeport'/g, "'" + ct + "'"); };
const shopScript = c => SC.shops && SC.shops[c.id];
const callerOf = c => c.caller || me();
const keepKey = () => 'sw_opener_' + (user() || 'guest');
const keptOpener = () => { try{ return localStorage.getItem(keepKey()) || ''; }catch(e){ return ''; } };
const setKept = v => { try{ if(v) localStorage.setItem(keepKey(), v); else localStorage.removeItem(keepKey()); }catch(e){} };
const opener = c => { const d = draft(c.id), def = keptOpener() || ((SC._meta || {}).recommended_defaults || {})[callerOf(c)] || VARS[0][0]; return VARS.some(v => v[0] === d.opener) ? d.opener : VARS.some(v => v[0] === def) ? def : VARS[0][0]; };
const openerTag = k => { const i = VARS.findIndex(v => v[0] === k); return i < 0 ? '' : VARS[i][1]; };
function shopNotes(c){
  const sx = shopScript(c), who = callerOf(c), other = who === 'Dan' ? 'RJ' : 'Dan', bob = user() === 'Bobby', dns = [], tie = [];
  ((sx && sx.do_not_say) || []).forEach(t => { t = String(t).replace(/\s*\(null\)/g, '');
    if(!(/\b(Dan|RJ)\b/.test(t) && /Shelton|Bridgeport/.test(t))){ dns.push(t); return; }
    if(bob){ tie.push(t); return; }
    let x = t.split(' / ').find(p => new RegExp('\\b' + who + '\\b').test(p)) || '';
    if(/Dan \(Shelton\) and RJ \(Bridgeport\) are/.test(t)) x = t.replace(/Dan \(Shelton\) and RJ \(Bridgeport\) are/, who === 'Dan' ? 'You, in Shelton, are' : 'You, in Bridgeport, are');
    if(x && !new RegExp('\\b' + other + '\\b').test(x)) tie.push(x.trim().replace(/\.?$/, '.')); });
  return {dns, tie};
}
function tok(t, c){
  const who = callerOf(c), ct = ((SC._meta || {}).caller_tokens || {})[who] || who;
  return String(t || '').replace(/\[Me \/ Town\]/g, ct)
    .replace(/\[([^\]\/]*\b(?:Dan|RJ)\b[^\]\/]*\/[^\]\/]*\b(?:Dan|RJ)\b[^\]\/]*)\]/g, (m, inner) => inner.split('/').map(x => x.trim()).find(x => x.indexOf(who) === 0) || ct)
    .replace(/\[my_number\]/g, '(your number)')
    .replace(/\[(?:1-sentence bug|specific bug|1-line bug)\]/g, '[the one thing you spotted]')
    .replace(/\[Owner\]/g, first(c) || c.ask).replace(/\[Name if known\]/g, 'there');
}
function splitAsk(t){
  t = String(t || '').trim(); if(!/\)$/.test(t)) return [t, ''];
  const at = ['(Back-pocket','(If he opens','(Stay there'].map(k => t.indexOf(k)).filter(i => i > 0).sort((a,b) => a - b)[0];
  return at ? [t.slice(0, at).trim(), t.slice(at + 1, -1).trim()] : [t, ''];
}
const QB = {busy:0, no:1, allset:2, booked:3, wom:4, who:5, email:6, gate:7}, QK = {catch:0, price:1, own:2, mess:3, time:4};
function respList(c){
  const s = shopScript(c); if(!s) return RESP;
  const cut = t => { t = String(t || '').replace(/^["“]|["”]$/g, ''); return t.length > 64 ? t.slice(0, 61).replace(/\s+\S*$/, '') + '…' : t; };
  return [['email','Send an email'],['busy','I\'m busy'],['price','What does it cost?'],['allset','Already have help']]
    .concat((s.pushback || []).map((p,i) => ['push' + i, cut(p.they_say)]))
    .concat([['no','Not interested'],['booked','We\'re booked solid'],['wom','It\'s all word of mouth'],['who','Who are you? How did you get my number?'],['gate','The owner isn\'t there'],['catch','What\'s the catch?'],['own','Do I own my site and number?'],['mess','Will it mess up my phones?'],['time','How long does it take?'],['yes','I\'m interested'],['wrong','Wrong person'],['vm','You reach voicemail']]);
}

/* ---------- words for one company ---------- */
/* When to chat, and when to stay quiet. One entry per line of each stage. */
const HELLO_ALT = 'Other easy ones: "Staying warm out there?" or "Busy week with the cold?"';
const B1CUE = {v4_one_true_thing:'Say what we checked, plainly. No blame in your voice.', v2_sincere_appreciation:'One real compliment, said slowly. Let him enjoy it before you move on.', v3_helpful_first:'Say what you saw, plainly. No blame in your voice.'};
const CHAT = {yes:['chat-circle-l','Small talk: yes'], wait:['chat-circle-l','Small talk: follow his lead'], no:['pause-circle','Small talk: not now']};
const KEEP = ['Tell me more.','How so?','What happened then?','How long has it been that way?'];
/* a real after-hours test call, if one is on file and no older than 7 days, becomes the "One true thing" line */
function testCall(c){
  const t = (window.STARWELL_TESTCALLS || {})[c.id]; if(!t || !t.at || !/^(voicemail|no answer)$/.test(t.result || '')) return null;
  const at = new Date(t.at), age = (Date.now() - at.getTime()) / 864e5; if(!(age >= 0 && age <= 7)) return null;
  const who = t.by && t.by === callerOf(c) ? 'I' : 'We';
  const hr = at.toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'}).replace(':00', '').replace(' AM', ' am').replace(' PM', ' pm');
  const day = at.toLocaleDateString('en-US', {weekday:'long'});
  return [`${who} called your line at ${hr} on ${day}, the way a homeowner with no heat would, and ${t.result === 'voicemail' ? 'got voicemail' : 'nobody picked up'}.`,
          `${who} ${t.demo ? 'built something small to fix that' : 'can set up something small to fix that'}, and it's yours, no charge. Want to try it for a week?`];
}
function script(c){
  const sx = shopScript(c);
  if(sx){ const ok = opener(c), iv = sx.introduce[ok] || sx.introduce.v3_helpful_first, tc = ok === 'v4_one_true_thing' ? testCall(c) : null, v = tc ? {beat_0:iv.beat_0, beat_1:tc[0], beat_2:tc[1]} : iv, a = splitAsk(tok(sx.ask.say, c)), f = first(c), h = v.beat_0 ? 1 : 0;
    return [
      {turns:(h ? [v.beat_0] : []).concat([v.beat_1, v.beat_2]).map(t => tok(t, c)),
       cues:(h ? ['Smile, say it, then stop and listen. ' + HELLO_ALT] : []).concat([B1CUE[ok] || sx.introduce.cue, 'Ask it, then stay quiet until he answers. The silence is his turn.']),
       chat:(h ? [['yes','Answer him like a neighbor would: one real line about his day, the cold, the busy season. If he is short with you, move straight on.']] : []).concat([['wait','Only if he starts it. Then stay with him.'],['no','Let him answer your question first.']]), scripted:true},
      {turns:[a[0]].concat((sx.ask.more || []).map(t => tok(t, c))), cues:['Ask, then listen. Skip anything he already answered.'], back:(sx.ask.back || a[1] || '').replace(/[.!]$/, ''),
       chat:[['yes','About him: his shop, his crew, how long he has been at it. Stay on whatever he brings up.']], share:true},
      {turns:[tok(sx.offer.say, c)].concat(sx.offer.then ? [tok(sx.offer.then, c)] : []), cues:[sx.offer.cue], chat:[['no','Give the fix, ask the question, then stop.']]},
      {turns:[tok(sx.next_step.say, c), `Thanks${f && !/\./.test(f) ? ', ' + f : ''}. I appreciate you giving me a few minutes. Have a good one.`], cues:[sx.next_step.cue, 'End warm, whatever he decided. He should hang up glad he answered.'],
       chat:[['no','Ask, then wait for his answer.'],['yes','To close. If he mentioned a job, the cold or his family, name it once on your way out.']]}
    ]; }
  const g = O.gifts[c.lead], f = first(c), who = c.caller || me();
  const intro = f ? `Hi, is this ${f}? Hey ${f}, this is ${who} with StarWell, here in Connecticut. Heating season's on, so I'll be quick.`
                  : `Hi, could I speak with ${c.ask}, please? … Hi, this is ${who} with StarWell, here in Connecticut. I'll be quick.`;
  const rest = O.steps[3].say.filter(l => l.who === 'you' && !/^\(/.test(l.t)).map(l => fill(l.t, c));
  return [
    {turns:[intro, `We help Connecticut HVAC shops get found and catch more calls, and I had one question about ${c.said}.`]},
    {turns:[c.notice, 'Can I ask one thing? ' + (ASK[c.id] || c.q || S[c.lead].ask)]},
    {turns:["That's actually what we help with. " + fill(g.say, c)], extra:rest, extraLabel:'The rest, and why it\'s free'},
    {turns:['No commitment at all. Could I show you in 15 minutes? Would tomorrow morning or the day after in the afternoon work better?', "And what's the best email to send it to?", `Thanks${f && !/\./.test(f) ? ', ' + f : ''}. I'll send it today. Good luck with the cold nights.`]}
  ];
}
/* the owner isn't there: talk with whoever picked up, as an ally, and leave with a name, a way to send it and a time */
function allyPath(c, sx){
  const f = first(c) && !/\./.test(first(c)) ? first(c) : 'the owner', iv = sx.introduce.v4_one_true_thing || sx.introduce.v3_helpful_first || {}, tc = testCall(c);
  const truth = tok(tc ? tc[0] : iv.beat_1 || (c.n && c.n.say) || '', c);
  return {lines:["No problem at all. Who do I have the pleasure of speaking with?",
      "Good to meet you. It's not a service call, and I'm not selling anything. " + truth,
      'Is that something you look after, or does ' + f + ' handle it?',
      'Would it help if I sent you a quick screenshot, so you can pass it along to ' + f + "? What's the best email for that?",
      "Thank you, you've been a real help. When's a good time to catch " + f + ', morning or afternoon?'],
    cues:["Get their name and use it. They know the owner's day better than anyone, and they are not in your way.",
      'Say their name first. Then tell them the same true thing you would tell the owner. No blame in your voice.',
      'Listen. If they talk about the phones or the office, stay there. They often know more than the owner does.',
      'Send it to them, not around them. You will write the email down on the next screen.',
      'Thank them by name. Then log it: their name, the email and the time they gave.']};
}
function reply(key, c){
  const sx = shopScript(c), Q = SC.qa_matrix || {};
  if(sx && key === 'gate'){ const p = allyPath(c, sx); return {lines:p.lines, cues:p.cues, text:p.lines[0], cue:p.cues[0], action:'Log who you spoke with', outcome:'office'}; }
  if(sx){
    const one = c.n && c.n.say ? ' The one thing for this shop: ' + c.n.say : '';
    if(key in QB && (Q.busy_and_guarded_owners || [])[QB[key]]){ const b = Q.busy_and_guarded_owners[QB[key]], r = {text:tok(b.response, c), cue:'Why they say it: ' + b.psychology + one};
      if(key === 'email') r.field = 'email'; if(key === 'busy') r.field = 'callback'; return r; }
    if(key in QK && (Q.skeptical_and_operational_qa || [])[QK[key]]) return {text:tok(Q.skeptical_and_operational_qa[QK[key]].answer, c), cue:'Answer it straight, then stop talking.'};
    if(/^push\d+$/.test(key) && (sx.pushback || [])[+key.slice(4)]) return {text:tok(sx.pushback[+key.slice(4)].say, c), cue:'Written for this shop. Say it calmly, then stop.'};
    if(key === 'vm') return {text:tok(sx.voicemail, c), cue:'About 15 seconds. Leave it once, then log the call as voicemail.', action:'Log the outcome', outcome:'voicemail'};
    if(key === 'yes') return {text:tok(sx.next_step.say, c), cue:sx.next_step.cue, action:'Go to next step', next:3};
  }
  if(key === 'who') return {text:D.company.line + ' ' + (D.callers[c.caller || me()] || D.callers.Dan).line, cue:D.company.note};
  const b = S.branches.find(x => x.key === key); if(!b) return null;
  const q = b.q && O.questions.find(x => x.key === b.q);
  const r = {text:(q ? fill(q.a, c) : b.say).replace(/15 minutes Tuesday at 7:30/, '15 minutes later this week'), cue:b.stop};
  if(key === 'email') r.field = 'email';
  if(key === 'busy') r.field = 'callback';
  if(key === 'wrong') r.field = 'contact';
  if(key === 'no'){ r.action = 'Log the outcome'; r.outcome = 'notint'; }
  if(key === 'yes'){ r.action = 'Go to next step'; r.next = 3; }
  if(key === 'custom') r.cue = b.stop + ' For this shop, listen for: ' + c.custom;
  return r;
}
const lastCall = (c, src) => { const cs = callsOf(c.id, src); return cs[cs.length - 1]; };
function relationship(c){
  const cs = callsOf(c.id), last = cs[cs.length - 1];
  if(!last) return {text:'No prior call recorded.', sub:''};
  const open = cs.slice().reverse().find(x => x.next && x.next.action && !x.next.done);
  return {text:`${outLabel(last)} on ${nice(last.at)}${cs.length > 1 ? ` (${cs.length} calls logged)` : ''}.`, sub:open ? `Open next step: ${open.next.action}${open.next.date ? ' by ' + nice(open.next.date) : ''}.` : '', quote:last.quote || last.notes || ''};
}

/* ---------- header, toast, dialog ---------- */
let toastState = null;
function shell(active, ws){
  const bar = $('#bar');
  bar.className = 'app-header';
  const modes = ws ? [['prepare','stack','Prepare'],['call','phone','Call'],['wrap','check','Wrap up']] : [['queue','list','Queue'],['systems','book-open','Systems'],['progress','chart-bar','Progress']];
  bar.innerHTML = `<a class="brand" href="#/queue" aria-label="StarWell call queue"><img src="assets/starwell-wordmark.png" alt="StarWell" width="183" height="44"></a><span class="header-rule"></span>
    ${ws ? `<button class="back-queue text-button" id="bq" aria-label="Back to queue">${pi('arrow-left')}<span>Back to queue</span></button>` : ''}
    <nav class="mode-nav" aria-label="${ws ? 'Call workflow' : 'Main'}">${modes.map(m => `<button data-mode="${m[0]}" class="${active === m[0] ? 'active' : ''}" ${active === m[0] ? 'aria-current="step"' : ''}>${pi(m[1])}<span>${m[2]}</span></button>`).join('')}</nav>
    <span class="header-user">${auth ? `<strong>${esc(user())}</strong><button class="icon-button" id="so" aria-label="Sign out">${pi('sign-out')}</button>` : `<a href="#/signin">Sign in</a>`}</span>`;
  $$('[data-mode]', bar).forEach(b => b.onclick = () => ws ? go('#/w/' + ws + '/' + b.dataset.mode) : go('#/' + b.dataset.mode));
  const bq = $('#bq'); if(bq) bq.onclick = () => go('#/queue');
  const so = $('#so'); if(so) so.onclick = signOut;
  paintToast();
}
function paintToast(){
  $$('.toast').forEach(t => t.remove()); if(!toastState) return;
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role','status');
  el.innerHTML = `${pi('check-circle')}<span>${esc(toastState.msg)}</span>${toastState.undo ? `<button class="text-button" id="tu">${pi('arrow-counter-clockwise')}Undo</button>` : ''}<button class="icon-button" aria-label="Dismiss notification" id="tx">${pi('x')}</button>`;
  $('#bar').after(el);
  $('#tx', el).onclick = () => { toastState = null; el.remove(); };
  const tu = $('#tu', el); if(tu) tu.onclick = toastState.undo;
}
function toast(msg, undo){ toastState = {msg, undo}; paintToast(); }
function dialog(title, body, wide, after){
  const prev = document.activeElement, d = document.createElement('dialog'); d.className = 'dialog' + (wide ? ' wide' : ''); d.setAttribute('aria-labelledby','dialog-title');
  d.innerHTML = `<div class="dialog-inner"><header class="dialog-header"><h2 id="dialog-title">${esc(title)}</h2><button class="icon-button" aria-label="Close dialog" id="dx">${pi('x')}</button></header>${body}</div>`;
  document.body.appendChild(d);
  const close = () => { if(d.open) d.close(); d.remove(); if(prev && prev.isConnected) prev.focus({preventScroll:true}); };
  d.addEventListener('cancel', e => { e.preventDefault(); close(); }); d.onclick = e => { if(e.target === d) close(); }; $('#dx', d).onclick = close;
  d.showModal(); const inp = $('input', d); if(inp) inp.focus(); if(after) after(d, close);
  return close;
}

/* ---------- queue ---------- */
/* search: name, town, area and contact as before, plus phone numbers typed in any format */
const digitsOf = s => { const d = String(s || '').replace(/\D/g, ''); return d.length === 11 && d[0] === '1' ? d.slice(1) : d; };
function shopMatch(c, q){
  q = String(q || '').toLowerCase().trim(); if(!q) return true;
  if((c.name + ' ' + c.said + ' ' + c.town + ' ' + c.area + ' ' + c.ask).toLowerCase().includes(q)) return true;
  const qd = digitsOf(q); if(qd.length < 3 || /[a-z]/.test(q)) return false;
  const ph = (c.n && c.n.phone) || {};
  return [c.phone, ph.site, ph.google].some(p => digitsOf(p).includes(qd));
}
let qFilter = 'all', qSearch = '';
function queueView(){
  shell('queue'); mounted = 'queue'; dirty = false;
  const bob = user() === 'Bobby', src = bob ? [].concat((team && team.Dan) || [], (team && team.RJ) || []).map(fromServer) : calls;
  const held = all.filter(c => c.tier === 4 && (bob || c.caller === me() || !c.caller));
  const items = scope().map(c => { const s = state(c, src); return {c, k:s.k === 'due' ? 'follow-up' : s.k === 'done' ? 'done' : 'to-call', s}; }).concat(held.map(c => ({c, k:'hold', s:{label:'On hold', last:ready(c)[2]}})));
  const count = k => k === 'all' ? items.length : items.filter(i => i.k === k).length;
  const shown = items.filter(i => (qFilter === 'all' || i.k === qFilter) && shopMatch(i.c, qSearch));
  const q = bob ? [] : queue(), resume = q[0];
  const filters = [['all','All'],['follow-up','Follow-ups'],['to-call','To call'],['done','Done']].concat(held.length ? [['hold','On hold']] : []);
  app.className = ''; app.innerHTML = `
    ${!auth ? `<p class="notice page-notice">${pi('info')}<span>You're looking around as <b>${esc(guest)}</b>. <a href="#/signin">Sign in</a> to save calls.</span></p>` : ''}
    ${loadErr ? `<p class="notice warn page-notice" role="status">${pi('warning')}<span>Your saved calls could not be loaded, so statuses below may be out of date. ${esc(loadErr)} <button class="text-button" id="retry">Try again</button></span></p>` : ''}
    <main class="queue-panel" id="main-content" tabindex="-1"><div class="queue-heading"><div><p class="eyebrow">${bob ? 'TEAM QUEUE' : 'YOUR CALLING QUEUE'}</p><h1>${bob ? 'All companies' : 'Your companies'}</h1></div>
      ${resume ? `<a class="button primary" href="#/w/${resume.id}/prepare">${items.some(i => i.k !== 'to-call' || i.s.icon !== 'circle') ? 'Next company' : 'Start calling'}${pi('caret-right')}</a>` : ''}</div>
    <div class="queue-tools"><nav class="queue-filters" aria-label="Filter companies">${filters.map(f => `<button class="${qFilter === f[0] ? 'active' : ''}" aria-pressed="${qFilter === f[0]}" data-f="${f[0]}">${f[1]}<span>${count(f[0])}</span></button>`).join('')}</nav>
      <div class="search-field">${pi('magnifying-glass')}<input type="search" id="qs" aria-label="Search calling queue" placeholder="Find a company or phone number…" value="${esc(qSearch)}"></div></div>
    <div class="queue-list">${shown.map(({c, k, s}) => `<button class="queue-row ${k === 'hold' ? 'held' : ''}" data-id="${c.id}"><span class="queue-status ${k}">${k === 'follow-up' ? pi('clock') : k === 'done' ? pi('check-circle') : k === 'hold' ? pi('pause-circle') : '<span class="queue-status-dot"></span>'}${esc(k === 'to-call' && s.icon === 'circle' ? 'To call' : s.label)}</span>
        <span class="queue-company"><strong>${esc(c.said)}</strong><small>${esc(c.town)} · Ask for ${esc(c.ask)}${bob && c.caller ? ' · ' + esc(c.caller) + '\'s' : ''}</small></span><span class="queue-result">${esc(s.last || SYSN[c.lead] || '')}</span>${pi('caret-right')}</button>`).join('')
      || `<div class="empty-state"><h2>${items.length ? 'No companies match' : 'No companies assigned'}</h2><p>${items.length ? 'Try another search or filter.' : 'Nothing is assigned to this account yet.'}</p>${items.length ? '<button class="text-button" id="clr">Show all companies</button>' : ''}</div>`}</div></main>`;
  $$('[data-f]').forEach(b => b.onclick = () => { qFilter = b.dataset.f; queueView(); });
  $$('.queue-row').forEach(b => b.onclick = () => go('#/w/' + b.dataset.id + '/prepare'));
  $('#qs').oninput = e => { qSearch = e.target.value; const p = e.target.selectionStart; queueView(); const i = $('#qs'); i.focus(); i.setSelectionRange(p, p); };
  const clr = $('#clr'); if(clr) clr.onclick = () => { qSearch = ''; qFilter = 'all'; queueView(); };
  const rt = $('#retry'); if(rt) rt.onclick = () => { loaded = false; render(); };
}

/* ---------- workspace ---------- */
function companyPanel(c, list, i, mode){
  const rd = ready(c), n = c.n, note = n ? (proofOf({proof:(n.proof || []).map(p => ({system:p.s, finding:p.t}))}, c.lead)[0] || {}).finding : '';
  const short = t => { t = String(t || ''); const s = t.split(/(?<=[.!?])\s/)[0]; return s.length > 84 ? s.slice(0, 81).replace(/\s+\S*$/, '') + '…' : s; };
  const d = draft(c.id), contact = d.contact ? d.contact + ' (as told on the call)' : c.ask;
  return `<aside class="company-panel" aria-label="Current company">
    <button class="company-picker" id="pick" aria-haspopup="dialog">${pi('buildings-l')}<span>${esc(c.said)}</span>${pi('caret-down')}</button>
    <h1>${esc(c.said)}</h1>
    <p class="company-contact">${esc(c.town)} <span aria-hidden="true">·</span> Ask for <strong>${esc(contact)}</strong></p>
    <div class="company-navigation"><button class="icon-button" aria-label="Previous company" id="prv" ${i <= 0 ? 'disabled' : ''}>${pi('caret-left')}</button>
      <span aria-label="Company ${i + 1} of ${list.length}"><span class="count-desktop">Company </span>${i + 1}<span class="count-desktop"> of </span><span class="count-mobile"> / </span>${list.length}</span>
      <button class="icon-button" aria-label="Next company" id="nxt" ${i >= list.length - 1 ? 'disabled' : ''}>${pi('caret-right')}</button></div>
    ${rd[0] === 'hold' ? `<div class="phone-unavailable">${pi('pause-circle')}On hold. Do not dial.</div>` : c.phone ? `<a class="button dial-button" href="tel:${esc(String(c.phone).replace(/[^\d]/g,''))}">${pi('phone-l')}<span>Dial ${esc(c.phone)}</span></a>` : `<div class="phone-unavailable">${pi('phone')}Phone not supplied</div>`}
    ${rd[0] !== 'ready' ? `<p class="number-caution"><b>${esc(rd[1])}.</b> ${esc(rd[2])} <button data-src>Review sources</button>.</p>` : ''}
    ${mode === 'prepare' ? '' : `<section class="company-brief" id="brief"><h2>${pi('file-text-l')}Company brief</h2>
      <button class="brief-toggle" id="bt" aria-expanded="false">${pi('file-text-l')}Company brief${pi('caret-down')}</button>
      <div class="brief-content"><dl class="brief-list">
        <div><dt>${pi('user-l')}<span class="sr-only">Contact</span></dt><dd><strong>Talk to ${esc(c.ask)}</strong></dd></div>
        <div><dt>${pi('desktop-l')}<span class="sr-only">Topic</span></dt><dd><strong>Lead with:</strong> ${SYSN[c.lead] || 'Not set'}</dd></div>
        <div><dt>${pi('file-text-l')}<span class="sr-only">Research</span></dt><dd><strong>Research note:</strong> ${esc(short(note) || 'Ask how things work today.')}</dd></div>
        <div><dt>${pi('chat-circle-l')}<span class="sr-only">Reminder</span></dt><dd>Ask how it works today. Let them tell you.</dd></div>
      </dl><button class="source-link text-button" data-src>View sources${pi('arrow-square-out')}</button></div></section>`}</aside>`;
}
function prepareHTML(c){
  const R = RAW && RAW[c.id], n = c.n, rd = ready(c), rel = relationship(c), sc = script(c), g = O.gifts[c.lead], d = draft(c.id);
  const lead = R ? proofOf(R, c.lead) : [], gp = (R && R.google_profile) || {}, w = (R && R.website) || {};
  const pt = x => x && typeof x === 'object' ? x.point : x, sx = shopScript(c), sn = shopNotes(c), dns = sn.dns;
  const strong = R && R.strengths && R.strengths[0] ? pt(R.strengths[0]) : c.facts[0];
  const reach = [c.hours && 'Hours: ' + c.hours, c.emergency && 'After hours: ' + c.emergency, (w.booking || c.booking) && 'Booking: ' + (w.booking || c.booking)].filter(Boolean);
  const SHOTS = window.STARWELL_SHOTS || {}, shots = SHOTS[c.id] || [];
  const order = [c.lead, c.second].concat(['site','phone','found','social']).filter((k,i,a) => k && a.indexOf(k) === i);
  const pains = n ? order.reduce((a,k) => a.concat(n.proof.filter(x => x.s === k && !x.note)), []).slice(0, 3) : [];
  const goods = (n ? n.strengths : c.facts || []).slice(0, 3), fx = (n && n.fx) || [];
  const seen = n && n.checked ? 'Verified ' + nice(n.checked) : 'Verified';
  const conf = n && n.conf === 'confirmed' ? ['ok','Confirmed'] : null;
  const ess = `${rd[0] !== 'ready' ? `<p class="notice warn">${pi('warning')}<span><b>${esc(rd[1])}.</b> ${esc(rd[2])}</span></p>` : ''}
    <dl class="glance">
      <div><dt>Ask for</dt><dd><strong>${esc(c.ask)}</strong>${conf ? `<span class="tag ${conf[0]}">${esc(conf[1])}</span>` : ''}</dd></div>
      <div><dt>Lead with</dt><dd><strong>${SYSN[c.lead] || 'Not set'}</strong></dd></div>
      <div><dt>Last call</dt><dd>${esc(rel.text)}${rel.sub ? ' ' + esc(rel.sub) : ''}</dd></div>
    </dl>
    ${sn.tie.length ? `<p class="field-help">Local tie: ${sn.tie.map(esc).join(' ')}</p>` : ''}
    <div class="brief-grid">
      <section class="brief-card pain wide"><h3>${pi('warning')}Pain points<span class="tag ok">${esc(seen)}</span></h3>
        ${shots.length ? `<div class="shots">${shots.map((x,i) => `<button class="shot" data-shot="${i}" aria-label="Open screenshot ${i + 1} of ${shots.length} for ${esc(c.said)}"><img src="${esc(x.f)}" alt="${esc(x.t)}" loading="lazy">${i === 0 ? `<span>${pi('magnifying-glass')}${shots.length} screenshot${shots.length === 1 ? '' : 's'}</span>` : ''}</button>`).join('')}</div>` : ''}
        ${fx.length ? `<ol class="fx">${fx.map(f => `<li><span class="fx-sys">${SYSN[f.s] || ''}</span><dl><div><dt>What we saw</dt><dd>${esc(f.see)}</dd></div>${f.why ? `<div><dt>Why it matters</dt><dd>${esc(f.why)}${isUrl(f.u) ? ` <a class="src" href="${esc(f.u)}" target="_blank" rel="noopener">${esc(f.src)}</a>` : ''}</dd></div>` : ''}${f.fix ? `<div><dt>The fix</dt><dd>${esc(f.fix)}</dd></div>` : ''}</dl></li>`).join('')}</ol>`
          : pains.length ? `<ol>${pains.map(x => `<li>${esc(x.p || x.t)}${isUrl(x.u) ? ` <a class="src" href="${esc(String(x.u).split(' ')[0])}" target="_blank" rel="noopener">Source</a>` : ''}</li>`).join('')}</ol>` : '<p>Ask how things work today, and let them tell you.</p>'}</section>
      <section class="brief-card good"><h3>${pi('check-circle')}Strengths<span class="tag ok">${esc(seen)}</span></h3>
        ${goods.length ? `<ul>${goods.map(x => `<li>${esc(pt(x))}</li>`).join('')}</ul>` : '<p>Ask what he is proudest of.</p>'}</section>
      ${dns.length && rd[0] !== 'hold' ? `<section class="brief-card never"><h3>${pi('x')}Do not say</h3><ul>${dns.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : ''}
    </div>`;
  let deep = '';
  if(rawState === 'loading' || rawState === 'idle') deep = `<p class="field-help" role="status">Loading the full research…</p>`;
  else if(rawState === 'error' || !R) deep = `<p class="notice warn">${pi('warning')}<span>${R === undefined && rawState === 'ok' ? 'Ask how things work today, and let them tell you.' : 'The full research could not be loaded. The summary above still stands.'} <button class="text-button" id="rawretry">Try again</button></span></p>`;
  else {
    const sec = (title, count, body) => body ? `<details class="prep-section"><summary>${esc(title)}${count != null ? `<small>${count}</small>` : ''}${pi('caret-down')}</summary><div>${body}</div></details>` : '';
    const pl = k => evList(proofOf(R, k).map(p => `${esc(p.finding)} ${srcHTML(p.source_url, p.seen_on)}`));
    const fs = w.first_screen || {}, FL = {trade_and_town:'Trade and town stated', phone_visible:'Phone number visible', tap_to_call:'Tap-to-call', book_button:'Book or request button', rating_shown:'Star rating shown', real_photo:'Real team or truck photo'};
    const quotes = R.review_quotes || [], good = quotes.filter(q => !/not getting through/i.test(q.kind || '')), bad = quotes.filter(q => /not getting through/i.test(q.kind || '')).concat((R.call_complaints || []).map(q => ({quote:q.quote, reviewer:q.reviewer, date:q.date})));
    const fixes = (R.fixes || []).filter(f => f.system === c.lead), hrs = R.hours || {};
    const qli = q => `"${esc(q.quote)}" (${esc(q.reviewer || 'reviewer')}${q.date ? ', ' + esc(String(q.date).slice(0, 40)) : ''}) ${srcHTML(q.review_link || q.source_url)}`;
    const others = ['phone','site','found','social'].filter(k => k !== c.lead);
    const fact = (k, v) => v == null || v === '' || /^not (confirmed|stated|found)\.?$/i.test(String(v).trim()) ? '' : `<dt>${k}</dt><dd>${v}</dd>`;
    const facts = rows => { const h = rows.join(''); return h ? `<dl class="facts">${h}</dl>` : ''; };
    const yn = v => v === true ? 'Yes' : v === false ? 'No' : v == null ? '' : esc(String(v));
    const ph = R.phone || {}, fsk = Object.keys(FL).filter(k => fs[k] != null && fs[k] !== '');
    const maps = (R.maps_rank || []).filter(m => m.position != null && m.position !== ''), ais = (R.ai_answers || []).filter(a => a.named != null && a.named !== '');
    deep = `<h3>Research, checked ${esc(nice(R.checked))}</h3>`
      + sec('Business and people', null, facts([fact('Name', esc(c.name)), fact('Since', esc(c.since)), fact('Contact', esc(R.owner && R.owner.name)), fact('Role', R.owner && R.owner.title ? esc(R.owner.title) + ' ' + srcHTML(R.owner.source_url) : ''), fact('Ask for', esc(c.ask) + (c.askNote ? '. ' + esc(c.askNote) : ''))]))
      + sec('Hours, phone and booking', null, facts([fact('Phone on site', esc(ph.site)), fact('Phone on Google', esc(ph.google)), fact('We dial', esc(c.phone)), fact('Hours on site', esc(hrs.site)), fact('Hours on Google', esc(gp.hours || hrs.google)), fact('After hours', esc(hrs.after_hours_note || c.emergency)), fact('Booking', esc(w.booking || c.booking))]) + pl('phone'))
      + sec('Reputation and strengths', good.length + (good.length === 1 ? ' quote' : ' quotes'), `${facts([fact('Google profile', esc(gp.name)), fact('Rating', gp.rating != null && gp.rating !== '' ? esc(gp.rating) + ' from ' + esc(gp.reviews) + ' reviews ' + srcHTML(gp.source_url) : ''), fact('Newest review', esc(gp.newest_review)), fact('Owner replies', yn(gp.owner_replies)), fact('Reviews on site', esc(w.reviews_on_site))])}${evList((R.strengths || []).map(x => `${esc(pt(x))} ${srcHTML(x && x.source_url, x && x.seen_on)}`))}${good.length ? `<p class="sub">Kind words you may mention</p>${evList(good.map(qli))}` : ''}${bad.length ? `<p class="sub">Private. Never quote these to the owner.</p>${evList(bad.map(qli), 'private')}` : ''}`)
      + sec('Website experience', (w.problems || []).length + ' observations', `${fsk.length ? `<p class="sub">First screen on a phone</p><ul class="tri">${fsk.map(k => { const t = tri(fs[k]); return `<li class="${t[0]}">${FL[k]}: ${esc(t[1])}</li>`; }).join('')}</ul>` : ''}${facts([fact('Phone speed score', w.pagespeed_mobile != null && w.pagespeed_mobile !== '' ? esc(w.pagespeed_mobile) + ' of 100' + (w.lcp_seconds ? ', main content in ' + esc(w.lcp_seconds) + ' s' : '') : ''), fact('Already answers', esc(w.answers_that_stop_calls)), fact('Service and town pages', esc(w.service_and_town_pages)), fact('Secure, footer year', yn(w.https) + (w.copyright ? (yn(w.https) ? ', ' : '') + esc(w.copyright) : ''))])}${(R.website_positives || []).length ? `<p class="sub">What the site already does well</p>${evList(R.website_positives.map(x => `${esc(pt(x))} ${srcHTML(x.source_url)}`))}<p class="sub">What a customer runs into</p>` : ''}${evList((w.problems || []).map(p => `${esc(p.finding)} ${srcHTML(p.source_url)}`))}`)
      + sec('Getting found', maps.length + ' searches, ' + ais.length + ' AI checks', `${pl('found')}${maps.length ? `<p class="sub">Google Maps, on the day checked</p>${evList(maps.map(m => `"${esc(m.query)}": ${/^\d+$/.test(String(m.position)) ? 'position ' + esc(m.position) : esc(m.position)}${(m.top_three || []).length ? '. First three: ' + m.top_three.map(t => esc(t.name)).join(', ') : ''} ${srcHTML(m.source_url)}`))}` : ''}${ais.length ? `<p class="sub">AI answers</p>${evList(ais.map(a => `${esc(a.tool)}: ${a.named === true ? 'named' + (a.position ? ', position ' + esc(a.position) : '') : a.named === false ? 'not named' : esc(a.named)} for "${esc(a.question)}"${a.note ? '. ' + esc(a.note) : ''}`))}` : ''}`)
      + sec('Social presence', (R.social || []).length + ((R.social || []).length === 1 ? ' page' : ' pages'), `${evList((R.social || []).map(s => `${esc(s.platform)}${s.live === false ? ': link does not lead to a live page' : s.live === true ? ': live' : ''}${s.followers != null ? ', ' + esc(s.followers) + ' followers' : ''}${s.last_post ? ', last post ' + esc(String(s.last_post).slice(0, 30)) : ''}${s.posts_last_90_days != null ? ', ' + esc(s.posts_last_90_days) + ' posts in 90 days' : ''}${s.own_job_photos === true ? ', shows their own job photos' : s.own_job_photos === false ? ', no photos of their own jobs' : ''} ${srcHTML(s.url)}`))}${pl('social')}`)
      + sec('Recommended offer: ' + SYSN[c.lead], null, `<p>${esc(S[c.lead].one)}</p>${fixes.map(f => `<dl class="facts"><dt>Customer sees</dt><dd>${esc(f.what_customer_sees)}</dd>${f.why_it_costs ? `<dt>Why it matters</dt><dd>${esc(f.why_it_costs)} ${f.study ? srcHTML(f.study.source_url) + ' <span class="src">' + esc(f.study.what_it_measured || '') + '</span>' : ''}</dd>` : ''}<dt>The fix</dt><dd>${esc(f.the_fix)}</dd><dt>How it helps</dt><dd>${esc(f.how_it_helps)}</dd></dl>`).join('')}<dl class="facts"><dt>Say</dt><dd>${esc(sx ? tok(sx.offer.say, c) : fill(g.say, c))}</dd>${sx ? '' : `<dt>What he keeps</dt><dd>${esc(g.terms)}</dd>`}<dt>Limits</dt><dd>${esc(S[c.lead].notDo[0])}</dd></dl>${sx ? '<p class="field-help">Share a study figure only if he asks why it matters.</p>' : ''}<p><a href="#/systems/${c.lead}">Everything about the ${SYSN[c.lead].toLowerCase()}</a></p>`)
      + sec('Other services, if he steers there', null, others.map(k => `<p><b>${SYSN[k]}${R.second_need === k ? ' (second need)' : ''}.</b> ${esc((proofOf(R, k)[0] || {}).finding || 'Ask how it works today.')} <a href="#/systems/${k}">Details</a></p>`).join(''))
      + sec('Office work and custom tools', (R.office_signals || []).length + ' signals', `${evList((R.office_signals || []).map(o => `${esc(o.signal || o)} ${srcHTML(o.source_url)}`))}<p>${esc(c.custom)}</p><p class="field-help">Only raise custom tools if he names the headache. They are quoted up front, never free.</p>`)
      + sec('Prior calls', callsOf(c.id).length + ' logged', callsOf(c.id).length ? evList(callsOf(c.id).slice().reverse().map(x => `${esc(nice(x.at))}: <b>${esc(outLabel(x))}</b>${x.next && x.next.action ? '. Next step: ' + esc(x.next.action) + (x.next.date ? ' by ' + esc(nice(x.next.date)) : '') + (x.next.done ? ' (marked done)' : ' (open)') : ''}${x.notes ? '. Note: ' + esc(x.notes) : ''}${x.quote ? '. His words: "' + esc(x.quote) + '"' : ''}${x.opener ? '. Opener: ' + esc(OPN[x.opener] || x.opener.toUpperCase()) : ''}`)) : '<p>No prior call recorded.</p>')
      + sec('Do not say', null, `${dns.length ? evList(dns.map(esc)) : ''}<p><b>Never say:</b> ${esc(S.evidence[c.lead].never)}</p>`);
  }
  return `<main class="prepare-panel" id="main-content" tabindex="-1"><p class="eyebrow">PREPARE</p><h2>Before you call</h2>
    ${ess}
    ${rd[0] === 'hold' ? '' : `<div class="opening-preview"><span class="speech-label">YOUR FIRST LINE${sx ? ' · ' + esc(openerTag(opener(c)).toUpperCase()) : ''}</span><p>${esc(sc[sx ? 0 : 1].turns[0])}</p></div>
    <div class="prep-actions"><button class="button primary" id="open">Open call guide${pi('arrow-right')}</button>${d.stage > 0 || d.turn > 0 ? `<button class="text-button" id="resume">Resume at ${STAGE4[d.stage].toLowerCase()}</button>` : ''}<button class="text-button" id="print">${pi('printer')}Print</button></div>`}
    <details class="prep-notes" ${d.prep ? 'open' : ''}><summary>${pi('note-pencil')}A note to keep in mind <span>(optional)</span></summary><label class="sr-only" for="prep-note">A note to keep in mind</label><textarea id="prep-note" placeholder="Something helpful to remember on this call…">${esc(d.prep || '')}</textarea><p class="field-help">Kept on this device.</p></details>
    <details class="prep-all" id="prep-all"><summary>${pi('file-text-l')}All research and sources${pi('caret-down')}</summary>
    <section class="prep-deep" aria-label="Full research">${sx && rd[0] !== 'hold' ? `<h3>Your script for this shop</h3><details class="prep-section"><summary>If the owner isn't there<small>talk with whoever picked up</small>${pi('caret-down')}</summary><div>${allyPath(c, sx).lines.map(l => `<p>${esc(l)}</p>`).join('')}<p class="field-help">Leave with three things: their name, a way to send the screenshot, and a good time to call back.</p></div></details><details class="prep-section"><summary>If you reach voicemail${pi('caret-down')}</summary><div><p>${esc(tok(sx.voicemail, c))}</p></div></details><details class="prep-section"><summary>If he pushes back<small>${(sx.pushback || []).length} written for this shop</small>${pi('caret-down')}</summary><div>${(sx.pushback || []).map(x => `<p><b>He says:</b> ${esc(x.they_say)}</p><p><b>You say:</b> ${esc(tok(x.say, c))}</p>`).join('')}</div></details>` : ''}${deep}</section></details></main>`;
}
function callHTML(c){
  const d = draft(c.id), sc = script(c), st = sc[d.stage], rp = d.response ? reply(d.response, c) : null;
  const inExtra = !rp && d.stage === 2 && !!st.extra && d.turn >= st.turns.length, lines = inExtra ? st.extra : st.turns, ti = inExtra ? d.turn - st.turns.length : Math.min(d.turn, st.turns.length - 1);
  const text = rp ? (rp.lines ? rp.lines[Math.min(d.rt || 0, rp.lines.length - 1)] : rp.text) : lines[ti], more = !rp && ti < lines.length - 1;
  const sx = shopScript(c), ok = opener(c), rl0 = respList(c), gate = rl0.find(r => r[0] === 'gate'), rl = gate && d.stage === 0 ? [gate].concat(rl0.filter(r => r !== gate)) : rl0;
  const rt = rp && rp.lines ? Math.min(d.rt || 0, rp.lines.length - 1) : 0, rmore = !!(rp && rp.lines && rt < rp.lines.length - 1);
  const cue = rp ? (rp.cues ? rp.cues[rt] : rp.cue) : st.cues ? st.cues[Math.min(ti, st.cues.length - 1)] : inExtra ? 'Say the honest reason, then stop talking.' : d.stage === 2 ? CUES[2] + ' ' + O.gifts[c.lead].termsShort + '.' : CUES[d.stage];
  const nextLabel = rp ? (rmore ? 'Next line' : rp.action || 'Back to script') : more ? 'Next line' : inExtra ? 'Agree a next step' : ['Continue to ask','Continue to offer','Agree a next step','Log the outcome'][d.stage];
  const capture = rp && rp.field === 'email' ? `<form class="inline-capture" id="cap" novalidate><label for="call-email">Email address</label><div><input id="call-email" type="email" autocomplete="off" inputmode="email" value="${esc(d.email)}" placeholder="Enter the address they give you" aria-describedby="cap-help cap-err"><button class="button primary" type="submit">Save email &amp; return${pi('arrow-right')}</button></div><p class="field-error" id="cap-err" role="alert" hidden></p><p class="field-help" id="cap-help">This only keeps the address. Sending is a separate step you do after the call.</p></form>`
    : rp && rp.field === 'callback' ? `<form class="inline-capture" id="cap" novalidate><label for="cb-date">Better time, only if he gave one</label><div class="pair"><input id="cb-date" type="date" value="${esc(d.cbDate)}" aria-label="Call back date"><input id="cb-time" type="text" value="${esc(d.cbTime)}" placeholder="Time he said, e.g. after 3" aria-label="Call back time"></div><div><button class="button primary" type="submit">Save &amp; return${pi('arrow-right')}</button></div><p class="field-help">Leave it blank if nothing was agreed.</p></form>`
    : rp && rp.field === 'contact' ? `<form class="inline-capture" id="cap" novalidate><label for="ct-name">Who should we ask for?</label><div><input id="ct-name" type="text" value="${esc(d.contact)}" placeholder="Name and role, as they told you" autocomplete="off"><button class="button primary" type="submit">Save &amp; return${pi('arrow-right')}</button></div><p class="field-help">Saved as "told on the call". Our researched contact stays on file.</p></form>` : '';
  const shown = d.more ? rl : rl.slice(0, 4);
  const chat = !rp && st.chat ? st.chat[Math.min(ti, st.chat.length - 1)] : null;
  const upText = rp ? '' : more ? lines[ti + 1] : !inExtra && d.stage < 3 ? sc[d.stage + 1].turns[0] : '';
  const upLabel = more ? 'Next line' : 'Next, ' + (STAGE4[d.stage + 1] || '').toLowerCase();
  const canBack = rp ? rt > 0 : (ti > 0 || d.stage > 0 || inExtra);
  const aids = chat ? `<div class="guide-aids"><p class="chat ${chat[0]}">${pi(CHAT[chat[0]][0])}<span><b>${CHAT[chat[0]][1]}.</b> ${esc(chat[1])}</span></p>${st.share ? `<div class="share" role="img" aria-label="In this part, aim for him talking about 80 percent of the time and you about 20"><span>He talks 80%</span><span>You 20%</span></div><p class="keep-talking"><b>Keep him talking:</b> ${KEEP.map(k => '"' + k + '"').join(' ')}</p>${st.back ? `<p class="keep-talking"><b>Back pocket, only if he leans in:</b> ${esc(st.back)}.</p>` : ''}` : ''}</div>` : '';
  const pick = sx && !rp && d.stage === 0 ? `<div class="opener"><div class="opener-pick" role="group" aria-label="Opening style">${VARS.map((v,i) => `<button data-open="${v[0]}" aria-pressed="${ok === v[0]}" class="${ok === v[0] ? 'active' : ''}" title="${esc(v[2])}"><kbd>${i + 1}</kbd><span>${v[1]}</span>${recFor(c) === v[0] ? '<small>Your default</small>' : ''}</button>`).join('')}</div><label class="opener-keep"><input type="checkbox" id="okeep" ${keptOpener() ? 'checked' : ''}><span>Keep my selected style for every shop</span></label></div>` : '';
  return `<main class="call-panel" id="main-content" tabindex="-1">
    <nav class="stage-nav" aria-label="Conversation stages"><ol>${STAGE4.map((s,i) => `<li class="${i < d.stage ? 'complete' : ''} ${i === d.stage ? 'current' : ''}"><button data-stage="${i}" ${i === d.stage ? 'aria-current="step"' : ''}><span class="stage-dot">${i < d.stage ? pi('check') : ''}</span><span>${s}</span></button></li>`).join('')}</ol></nav>
    <section class="speech-area" aria-label="Current call guidance" aria-live="polite">
      ${rp ? `<div class="reply-context">They say: ${esc((rl.find(r => r[0] === d.response) || [])[1])}<button class="text-button" id="back">Back to script</button></div>` : inExtra ? `<div class="reply-context">${esc(st.extraLabel)}<button class="text-button" id="backoffer">Back to the offer</button></div>` : ''}
      ${pick}<div class="speech-label">${rp ? (d.response === 'vm' ? 'LEAVE THIS MESSAGE' : 'YOUR REPLY') : 'SAY THIS'}</div>
      <p class="script-text" id="call-guidance-text" tabindex="-1">${esc(text)}</p>
      ${!rp && (st.scripted || /\?$/.test(String(text).trim())) ? `<p class="pause-mark">${pi('pause-circle')}Pause. Let him answer.</p>` : ''}
      ${!rp && lines.length > 1 ? `<div class="turns" role="img" aria-label="Line ${ti + 1} of ${lines.length}">${lines.map((x,i) => `<i class="${i <= ti ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      ${rp && rp.lines ? `<div class="turns" role="img" aria-label="Line ${rt + 1} of ${rp.lines.length}">${rp.lines.map((x,i) => `<i class="${i <= rt ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      <div class="coaching"><span class="coaching-label">${pi('sparkle-l')}FOR YOU</span><p>${esc(cue)}</p></div>
      ${aids}
      ${capture || `<div class="call-actions">${canBack ? `<button class="text-button back-line" id="prevline">${pi('arrow-left')}Back a line</button>` : ''}<button class="button primary" id="go">${esc(nextLabel)}${pi('arrow-right')}</button>${!rp && d.stage === 3 && !more ? '' : `<button class="button secondary" id="log">Log outcome</button>`}</div>
      ${upText ? `<p class="next-up"><span>${esc(upLabel)}</span>${esc(upText)}</p>` : ''}
      <p class="key-hint">Space or the right arrow moves to the next line. Left arrow goes back.${pick ? ' 1, 2 and 3 switch the opening.' : ''}</p>
      ${!rp && d.stage === 2 && st.extra && !inExtra && !more ? `<p><button class="text-button" id="rest">${esc(st.extraLabel)}${pi('caret-right')}</button></p>` : ''}`}
    </section>
    <section class="responses" aria-label="Common responses"><h2>They say...</h2><div class="response-list">${shown.map(r => `<button class="${d.response === r[0] ? 'selected' : ''}" aria-pressed="${d.response === r[0]}" data-resp="${r[0]}"><span>${r[1]}</span>${pi('caret-right')}</button>`).join('')}</div>
      <button class="text-button more-responses" id="more" aria-expanded="${!!d.more}">${d.more ? 'Fewer responses' : 'More responses'}${pi('caret-down')}</button></section></main>`;
}
function wrapHTML(c){
  const d = draft(c.id), o = d.outcome, talk = TALK.includes(o), needDate = o === 'booked' || o === 'callback', canFollow = needDate || ['info','notnow','office'].includes(o);
  const reached = d.reached || [1,2,3,5][d.stage] || 1, turnOn = d.turnOn || RESP2TURN[d.lastResponse] || '';
  return `<main class="wrap-panel" id="main-content" tabindex="-1"><p class="eyebrow">WRAP UP</p><h2>What happened?</h2><p class="section-intro">Keep the useful details. Then move on.</p>
    <form id="wf" novalidate>
      <fieldset class="outcome-fieldset"><legend>How did the call end?</legend><div class="outcome-options ten">${OUTS.map(x => `<label class="${o === x[0] ? 'selected' : ''}"><input type="radio" name="outcome" value="${x[0]}" ${o === x[0] ? 'checked' : ''}><span>${x[1]}</span>${o === x[0] ? pi('check') : ''}</label>`).join('')}</div></fieldset>
      ${o === 'info' || o === 'office' ? `<label class="form-label">Email address <span>(if confirmed)</span><input type="email" id="w-email" autocomplete="off" value="${esc(d.email)}" placeholder="No email captured yet"></label>` : ''}
      ${o === 'office' || o === 'wrong' ? `<label class="form-label">Who you spoke with, or who to ask for <span>(optional)</span><input type="text" id="w-contact" value="${esc(d.contact)}" autocomplete="off"></label>` : ''}
      ${canFollow ? `<div class="followup-fields"><label class="form-label">Next action <span>(optional)</span><input id="w-next" value="${esc(d.nextAction)}" placeholder="What did you agree to do?"></label>
        <label class="form-label">${needDate ? 'Agreed date' : 'Follow-up date'} ${needDate ? '' : '<span>(optional)</span>'}<input type="date" id="w-date" value="${esc(d.date || d.cbDate)}"></label></div>
        ${needDate ? `<label class="form-label">Agreed time <span>(as he said it, optional)</span><input type="text" id="w-time" value="${esc(d.time || d.cbTime)}" placeholder="e.g. 9:00 am, or after 3"></label>` : ''}` : ''}
      ${talk ? `<div class="followup-fields"><label class="form-label">How far did the conversation get? <span>(suggested from the guide)</span><select id="w-reached">${STAGES.map((s,i) => `<option value="${i + 1}" ${reached === i + 1 ? 'selected' : ''}>${i + 1}. ${s}</option>`).join('')}</select></label>
        <label class="form-label">Where did it turn? <span>(optional)</span><select id="w-turn"><option value="">Choose one</option>${Object.keys(TURNS).map(k => `<option value="${k}" ${turnOn === k ? 'selected' : ''}>${esc(TURNS[k])}</option>`).join('')}</select></label></div>
        <label class="form-label">His words <span>(optional, as close to exact as you can)</span><input type="text" id="w-quote" value="${esc(d.quote)}"></label>` : ''}
      <label class="form-label">Call note <span>(optional)</span><textarea id="w-note" placeholder="What matters, or something to remember…">${esc(d.note)}</textarea></label>
      <p role="alert" class="form-error" id="w-err" hidden></p>
      <div class="wrap-actions"><button type="button" class="text-button" id="w-back">${pi('arrow-left')}Back to call</button><button type="button" class="button secondary" id="w-save">Save call</button><button class="button primary" type="submit">Save &amp; next company${pi('arrow-right')}</button></div>
      <p class="wrap-status" id="w-status" role="status">${canLog() ? 'Your draft is kept on this device until you save.' : auth ? 'This account is view only.' : 'Sign in to save this call.'}</p>
    </form></main>`;
}
function sourcesDialog(c){
  const R = RAW && RAW[c.id];
  if(!R){ dialog('Company research', `<div class="source-detail"><p class="eyebrow">${esc(c.name)}</p><h3>${rawState === 'loading' ? 'Loading the research…' : 'Research not available'}</h3><p>${rawState === 'error' ? 'The research file could not be loaded. Check your connection and try again.' : 'Ask how things work today, and let the contact explain.'}</p></div>`, true); return; }
  const by = k => (R.proof || []).filter(p => p.system === k);
  dialog('Company research', `<div class="source-detail"><p class="eyebrow">${esc(c.name)} · checked ${esc(nice(R.checked))}</p>
    <div class="research-provenance"><strong>Source: StarWell research snapshot, ${esc(nice(R.checked))}</strong><p>Each line is what was seen on that day.</p></div>
    ${['phone','site','found','social'].map(k => by(k).length ? `<h3>${SYSN[k]} · ${R.scores[k] == null ? 'not scored' : 'need ' + esc(R.scores[k]) + ' of 3'} · ${by(k).length} findings</h3>${evList(by(k).map(p => `${esc(p.finding)} ${srcHTML(p.source_url, p.seen_on, p.screenshot)}`))}` : '').join('')}
    ${(R.review_quotes || []).length ? `<h3>Review quotes · ${(R.review_quotes || []).length}</h3>${evList(R.review_quotes.map(q => `[${esc(q.kind || 'quote')}] "${esc(q.quote)}" (${esc(q.reviewer || '')}${q.date ? ', ' + esc(String(q.date).slice(0, 40)) : ''}) ${srcHTML(q.review_link || q.source_url, null, q.screenshot)}`), '')}` : ''}
    <p class="field-help">Need scores (0 to 3) rate how much room there is to help. They are not ratings of the business.</p></div>`, true);
}
function pickerDialog(c, list){
  dialog('Choose a company', `<div class="search-field">${pi('magnifying-glass')}<input aria-label="Search companies" placeholder="Search company, town, contact or phone" type="search" id="ps"></div><p class="list-count" id="pc"></p><div class="picker-list" id="pl"></div>`, false, (d, close) => {
    const paint = () => { const v = $('#ps', d).value.toLowerCase().trim(), res = list.filter(x => shopMatch(x, v));
      $('#pc', d).textContent = res.length + (res.length === 1 ? ' company' : ' companies');
      $('#pl', d).innerHTML = res.map(x => `<button data-id="${x.id}" class="${x.id === c.id ? 'selected' : ''}"><span><strong>${esc(x.said)}</strong><small>${esc(x.town)} · ${esc(x.ask)} · ${esc(state(x).label)}</small></span>${x.id === c.id ? pi('check') : pi('caret-right')}</button>`).join('') || `<div class="empty-state"><h3>No matching companies</h3><p>Try another name, town, contact or phone number.</p></div>`;
      $$('[data-id]', d).forEach(b => b.onclick = () => { close(); go('#/w/' + b.dataset.id + '/prepare'); }); };
    $('#ps', d).oninput = paint; paint();
  });
}
let saving = false;
function workspaceView(p){
  const c = byId(p[1]); if(!c || (canLog() && c.caller && c.caller !== user())){ location.replace('#/queue'); return; }
  const rd = ready(c); let mode = ['prepare','call','wrap'].includes(p[2]) ? p[2] : 'prepare';
  if(rd[0] === 'hold') mode = 'prepare';
  const list = scope().includes(c) ? scope() : [c], i = list.indexOf(c), d = draft(c.id), sameCo = mounted === 'ws' && app.dataset.co === c.id;
  loadRaw(); shell(mode, c.id); mounted = 'ws'; app.dataset.co = c.id; app.className = '';
  app.innerHTML = `<div class="workspace">${companyPanel(c, list, i, mode)}${mode === 'call' ? callHTML(c) : mode === 'wrap' ? wrapHTML(c) : prepareHTML(c)}</div>`;
  const rer = focusId => { keep(); workspaceView(p); if(focusId){ const el = document.getElementById(focusId); if(el){ el.focus({preventScroll:true}); if(window.innerWidth < 761) ($('.speech-area') || el).scrollIntoView({block:'start'}); } } };
  /* rail */
  $('#pick').onclick = () => pickerDialog(c, list);
  $('#prv').onclick = () => go('#/w/' + list[i - 1].id + '/' + (mode === 'wrap' ? 'prepare' : mode));
  $('#nxt').onclick = () => go('#/w/' + list[i + 1].id + '/' + (mode === 'wrap' ? 'prepare' : mode));
  $$('[data-src]').forEach(b => b.onclick = () => sourcesDialog(c));
  const bt = $('#bt'); if(bt) bt.onclick = () => { const open = $('#brief').classList.toggle('is-open'); bt.setAttribute('aria-expanded', open); };
  if(!sameCo && window.innerWidth >= 761){ const m = $('#main-content'); if(m) window.scrollTo(0, 0); }
  /* prepare */
  if(mode === 'prepare'){
    const op = $('#open'); if(op) op.onclick = () => { d.stage = 0; d.turn = 0; d.response = ''; keep(); go('#/w/' + c.id + '/call'); };
    const rs = $('#resume'); if(rs) rs.onclick = () => go('#/w/' + c.id + '/call');
    const pn = $('#prep-note'); pn.oninput = () => { d.prep = pn.value; keep(); };
    const pr = $('#print'); if(pr) pr.onclick = () => { $$('details').forEach(x => x.open = true); window.print(); };
    $$('[data-shot]').forEach(b => b.onclick = () => { const L = (window.STARWELL_SHOTS || {})[c.id] || [];
      dialog('What a customer sees', `<div class="shot-list">${L.map((x,i) => `<figure id="shot-${i}"><img src="${esc(x.f)}" alt="${esc(x.t)}">${/^Also seen/.test(x.t) ? '' : `<figcaption>${esc(x.t)}</figcaption>`}</figure>`).join('')}<p class="field-help">Captured on ${esc(nice((c.n || {}).checked))}.</p></div>`, true);
      const f = document.getElementById('shot-' + b.dataset.shot); if(f && +b.dataset.shot) f.scrollIntoView({block:'start'}); });
    const rr = $('#rawretry'); if(rr) rr.onclick = () => { rawState = 'idle'; RAW = null; loadRaw(); };
  }
  /* call */
  if(mode === 'call'){
    const sc = script(c), st = sc[d.stage], rp = d.response ? reply(d.response, c) : null;
    $$('[data-stage]').forEach(b => b.onclick = () => { d.stage = +b.dataset.stage; d.turn = 0; d.response = ''; rer('call-guidance-text'); });
    $$('[data-resp]').forEach(b => b.onclick = () => { d.response = b.dataset.resp; d.lastResponse = d.response; d.rt = 0; rer('call-guidance-text'); });
    $('#more').onclick = () => { d.more = !d.more; rer('more'); };
    $$('[data-open]').forEach(b => b.onclick = () => { d.opener = b.dataset.open; if(keptOpener()) setKept(d.opener); d.turn = 0; rer('call-guidance-text'); });
    const okp = $('#okeep'); if(okp) okp.onchange = () => { setKept(okp.checked ? opener(c) : ''); };
    const back = $('#back'); if(back) back.onclick = () => { d.response = ''; d.rt = 0; rer('call-guidance-text'); };
    const bo = $('#backoffer'); if(bo) bo.onclick = () => { d.turn = 0; rer('call-guidance-text'); };
    const rest = $('#rest'); if(rest) rest.onclick = () => { d.turn = st.turns.length; rer('call-guidance-text'); };
    const lg = $('#log'); if(lg) lg.onclick = () => go('#/w/' + c.id + '/wrap');
    const pv = $('#prevline'); if(pv) pv.onclick = () => {
      if(rp){ if((d.rt || 0) > 0) d.rt--; rer('call-guidance-text'); return; }
      const inX = d.stage === 2 && !!st.extra && d.turn >= st.turns.length, cur = inX ? d.turn : Math.min(d.turn, st.turns.length - 1);
      if(cur > 0) d.turn = cur - 1; else if(d.stage > 0){ d.stage--; d.turn = sc[d.stage].turns.length - 1; }
      rer('call-guidance-text'); };
    const g = $('#go'); if(g) g.onclick = () => {
      if(rp && rp.lines && (d.rt || 0) < rp.lines.length - 1){ d.rt = (d.rt || 0) + 1; rer('call-guidance-text'); return; }
      if(rp){ d.rt = 0; if(rp.outcome){ d.outcome = rp.outcome; d.response = ''; keep(); go('#/w/' + c.id + '/wrap'); return; } if(rp.next != null){ d.stage = rp.next; d.turn = 0; } d.response = ''; rer('call-guidance-text'); return; }
      const inExtra = d.stage === 2 && !!st.extra && d.turn >= st.turns.length, lines = inExtra ? st.extra : st.turns, ti = inExtra ? d.turn - st.turns.length : Math.min(d.turn, st.turns.length - 1);
      if(ti < lines.length - 1){ d.turn++; rer('call-guidance-text'); return; }
      if(d.stage === 3){ keep(); go('#/w/' + c.id + '/wrap'); return; }
      d.stage++; d.turn = 0; rer('call-guidance-text');
    };
    const cap = $('#cap'); if(cap) cap.onsubmit = e => { e.preventDefault();
      if(rp.field === 'email'){ const v = $('#call-email').value.trim(), err = $('#cap-err'); if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){ err.textContent = 'Enter a complete email address, or go back to the script.'; err.hidden = false; $('#call-email').setAttribute('aria-invalid','true'); $('#call-email').focus(); return; } d.email = v; toast('Email kept for ' + c.said + '. Nothing has been sent.'); }
      if(rp.field === 'callback'){ d.cbDate = $('#cb-date').value; d.cbTime = $('#cb-time').value.trim(); }
      if(rp.field === 'contact'){ d.contact = $('#ct-name').value.trim(); }
      d.response = ''; rer('call-guidance-text'); };
    $$('#cap input').forEach(inp => inp.oninput = () => { if(inp.id === 'call-email') d.email = inp.value; if(inp.id === 'cb-date') d.cbDate = inp.value; if(inp.id === 'cb-time') d.cbTime = inp.value; if(inp.id === 'ct-name') d.contact = inp.value; keep(); });
  }
  /* wrap */
  if(mode === 'wrap'){
    const set = (sel, fn) => { const el = $(sel); if(el) el.oninput = () => { fn(el.value); keep(); }; };
    $$('[name=outcome]').forEach(r => r.onchange = () => { d.outcome = r.value;
      if(d.outcome === 'info' && !d.nextAction){ d.nextAction = 'Send the info he asked for'; }
      if(d.outcome === 'callback' && !d.nextAction) d.nextAction = 'Call back';
      if(d.outcome === 'booked' && !d.nextAction) d.nextAction = 'Walkthrough';
      rer(); const sel = $('[name=outcome]:checked'); if(sel) sel.focus({preventScroll:true}); });
    set('#w-email', v => d.email = v); set('#w-contact', v => d.contact = v); set('#w-next', v => d.nextAction = v); set('#w-date', v => d.date = v); set('#w-time', v => d.time = v);
    set('#w-reached', v => d.reached = +v); set('#w-turn', v => d.turnOn = v); set('#w-quote', v => d.quote = v); set('#w-note', v => d.note = v);
    $('#w-back').onclick = () => go('#/w/' + c.id + '/call');
    const fail = (m, focus) => { const e = $('#w-err'); e.textContent = m; e.hidden = false; if(focus && $(focus)) $(focus).focus(); };
    const submit = async next => {
      if(saving) return; $('#w-err').hidden = true;
      if(!canLog()) return fail(auth ? 'This account is view only.' : 'Sign in to save this call. Your draft is kept on this device.');
      if(c.caller && c.caller !== user()) return fail('This company is not on your list, so you cannot log calls for it.');
      const o = d.outcome, needDate = o === 'booked' || o === 'callback', date = d.date || (needDate || o === 'notnow' || o === 'info' || o === 'office' ? d.cbDate : '');
      if(!o) return fail('Choose how the call ended.', '[name=outcome]');
      if(needDate && !date) return fail('Add the agreed date before saving. If no date was agreed, choose "Not now" or "Asked for info".', '#w-date');
      if((o === 'info' || o === 'office') && d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) return fail('Check the email address before saving.', '#w-email');
      const talk = TALK.includes(o), follow = needDate || ['info','notnow','office'].includes(o);
      const call = {id:d.callId || (d.callId = newId()), caller:user(), shop:c.id, shopName:c.said, at:d.at || (d.at = new Date().toISOString()), kind:talk ? 'talk' : 'quick', outcome:o,
        stage:talk ? (+($('#w-reached') || {}).value || d.reached || 1) : 0, turn:talk ? (($('#w-turn') || {}).value || '') : '', notes:d.note || '', quote:talk ? d.quote || '' : '', email:o === 'info' || o === 'office' ? (d.email || '').trim() : '', time:needDate ? (d.time || d.cbTime || '') : '', contact:d.contact || '', opener:shopScript(c) ? opener(c).slice(0, 2) : '',
        next:follow && (d.nextAction || date) ? {action:(d.nextAction || (o === 'office' ? 'Call back' : 'Follow up')) + (needDate && (d.time || d.cbTime) ? ' at ' + (d.time || d.cbTime) : ''), date:date || ''} : {}};
      keep(); saving = true; $('#w-status').textContent = 'Saving…'; $$('.wrap-actions button').forEach(b => b.disabled = true);
      try{ await api('/calls/save', {call:toServer(call)}); }
      catch(e){ saving = false; $$('.wrap-actions button').forEach(b => b.disabled = false); $('#w-status').textContent = 'Not saved. Your draft is still here.'; return fail('The call could not be saved: ' + e.message + ' Nothing was lost. Try again.'); }
      saving = false; const idx = calls.findIndex(x => x.id === call.id); if(idx >= 0) calls[idx] = call; else calls.push(call); writeCache();
      const kept = Object.assign({}, d); drafts[c.id] = undefined; delete drafts[c.id]; draft(c.id).prep = kept.prep; keep(); dirty = true;
      const nx = next ? queue().filter(x => x.id !== c.id)[0] : null;
      toast('Call logged for ' + c.said + ': ' + outLabel(call) + '.', async () => {
        try{ await api('/calls/delete', {id:call.id}); }catch(e){ toast('Undo failed: ' + e.message + ' The call is still saved.'); return; }
        calls = calls.filter(x => x.id !== call.id); writeCache(); drafts[c.id] = kept; keep(); dirty = true; toastState = {msg:'Call log for ' + c.said + ' undone. Your draft is back.'}; if(location.hash === '#/w/' + c.id + '/wrap') render(); else go('#/w/' + c.id + '/wrap'); });
      if(next) go(nx ? '#/w/' + nx.id + '/prepare' : '#/queue'); else go('#/w/' + c.id + '/prepare');
    };
    $('#w-save').onclick = () => submit(false); $('#wf').onsubmit = e => { e.preventDefault(); submit(true); };
  }
}

/* ---------- router ---------- */
async function render(){
  const raw = (location.hash || '#/queue').slice(2), li = raw.indexOf('/log/');
  const base = li >= 0 ? raw.slice(0, li) : raw, logId = li >= 0 ? raw.slice(li + 5) : '', p = base.split('/');
  $$('.sheetwrap').forEach(x => x.remove());
  if(p[0] === 'signin'){ mounted = 'signin'; app.className = 'page'; signinView(); return; }
  if(auth && !loaded){ shell(p[0] === 'w' ? '' : p[0]); app.className = 'page'; app.innerHTML = loadingHTML; await ensure(); try{ drafts = JSON.parse(localStorage.getItem(dKey()) || '{}'); }catch(e){} dirty = true; mounted = ''; }
  if(p[0] === 'w') workspaceView(p);
  else if(p[0] === 'systems'){ app.className = 'page'; systemsView(p); }
  else if(p[0] === 'progress'){ app.className = 'page'; if(mounted !== 'progress' || dirty || !logId){ progressView(p); dirty = false; } }
  else queueView();
  if(logId){ const bob = user() === 'Bobby'; logSheet(logId, '#/' + base, bob, bob ? ((team && team[who]) || []).map(fromServer) : null); }
  document.title = (p[0] === 'w' && byId(p[1]) ? byId(p[1]).said : ({systems:'Systems', progress:'Progress', signin:'Sign in'}[p[0]] || 'Queue')) + ' · StarWell Call Decks';
}
/* Keys for reading along: 1, 2, 3 switch the opening; Space, Enter or the right arrow move on; the left arrow goes back. */
document.addEventListener('keydown', e => {
  if(e.altKey || e.ctrlKey || e.metaKey) return;
  const t = e.target, tag = (t && t.tagName) || '';
  if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || document.querySelector('dialog[open]') || document.querySelector('.sheetwrap')) return;
  if(['1','2','3'].includes(e.key)){ const b = document.querySelectorAll('[data-open]')[+e.key - 1]; if(b){ e.preventDefault(); b.click(); } return; }
  if(!document.querySelector('.call-panel')) return;
  const fwd = e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight';
  if((e.key === ' ' || e.key === 'Enter') && /^(BUTTON|A|SUMMARY)$/.test(tag)) return;
  if(fwd){ const g = document.getElementById('go'); if(g){ e.preventDefault(); g.click(); } }
  else if(e.key === 'ArrowLeft'){ const b = document.getElementById('prevline'); if(b){ e.preventDefault(); b.click(); } }
});
window.addEventListener('hashchange', render);
render();
})();
