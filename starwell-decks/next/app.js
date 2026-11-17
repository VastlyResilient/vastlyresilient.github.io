/* StarWell Call Decks. One file, no framework.
   Today (your shops as a checklist) + Call screen (one shop at a time) + Systems + Progress.
   Data: ../starwell-practice/{offer,decks,needs,systems}.js. Server: ../starwell-practice/server/calls.mjs */
'use strict';
(() => {
const O = window.STARWELL_OFFER, D = window.STARWELL_DECKS, S = window.STARWELL_SYSTEMS;
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
const STAGES = ['Hello','Notice and ask','The one gift','Why it\'s free','Next step'];
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
const FOCUS = ['Name, one true detail, then the question, inside ten seconds.', 'After his answer, offer one gift in one sentence.', 'Say why it\'s free, then stop talking.', 'Ask for the 15 minutes before the call ends.', 'Confirm his email and a time before you hang up.'];
const DRILL = ['Say your first two lines ten times on the Practice Line. Under ten seconds each.', 'Read the notice and the question back to back for three of your shops.', 'Say the 15-second line for your lead gift five times, then once without looking.', 'Say "we\'re new, so we do a few of these free" five times, then stay silent for three seconds.', 'Say the ask ten times: "Could I show you in 15 minutes?" Then wait three seconds.'];

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
const toServer = c => ({id:c.id, shop:c.shop, shopName:c.shopName, at:c.at, outcome:c.outcome, reached:c.stage || 0, objection:c.turn || '', answers:{kind:c.kind, notes:c.notes || '', line:c.line || '', quote:c.quote || '', email:c.email || '', time:c.time || '', contact:c.contact || ''},
  next:c.next || {}, transcript:c.transcript, analysis:c.analysis, followups:c.followups});
const fromServer = s => ({id:s.id, caller:s.caller, shop:s.shop, shopName:s.shopName, at:s.at || s.updated, outcome:s.outcome || '', stage:s.reached || 0, turn:s.objection || '',
  kind:(s.answers && s.answers.kind) || (QUICK[s.outcome] ? 'quick' : 'talk'), notes:(s.answers && s.answers.notes) || '', line:(s.answers && s.answers.line) || '', quote:(s.answers && s.answers.quote) || '', email:(s.answers && s.answers.email) || '', time:(s.answers && s.answers.time) || '', contact:(s.answers && s.answers.contact) || '', next:s.next || {}, transcript:s.transcript, analysis:s.analysis, followups:s.followups});
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
function systemsView(parts){
  const key = S[parts[1]] && S[parts[1]].qa ? parts[1] : 'phone', s = S[key], g = O.gifts[key];
  shell('systems'); mounted = 'systems';
  app.innerHTML = `<div class="pagehead"><h1>Systems</h1><div class="seg" role="group" aria-label="System">${S.order.map(k => `<button aria-pressed="${k === key}" data-sys="${k}">${esc(S[k].name)}</button>`).join('')}</div></div>
    <div class="split wide"><div class="stack s6">
      <section class="panel pad stack"><div><p class="label">${esc(s.pillar)}${s.paid ? ' · Paid, quoted up front' : ' · Free to start'}</p><h2>${esc(s.one)}</h2></div>
        <div class="seg" role="group" aria-label="Length"><button aria-pressed="true" data-say="15">15 seconds</button><button aria-pressed="false" data-say="45">45 seconds</button></div>
        <div class="say" id="sayx"><p>${esc(s.say15)}</p></div>
        <dl class="kv"><dt class="label">Solves</dt><dd class="sm">${esc(s.problem)}</dd><dt class="label">Ask</dt><dd class="sm">${esc(s.ask)}</dd><dt class="label">Costs him</dt><dd class="sm">${esc(g ? g.terms : O.custom.terms)}</dd></dl></section>
      <section class="panel pad stack"><div class="row between wrap"><h2>Questions owners ask</h2><div class="field"><label class="sr" for="qa">Search answers</label><input class="input" id="qa" type="search" placeholder="Search answers"></div></div>
        <div id="qal">${s.qa.map(gp => `<div class="qg"><p class="label qgl">${esc(gp.group)}</p>${gp.items.map(i => `<details class="d qi"><summary>${esc(i.q)}${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(i.a)}</p></div>${i.check ? `<p class="sm muted">Before you promise it: ${esc(i.check)}</p>` : ''}</div></details>`).join('')}</div>`).join('')}</div>
        <div class="empty" id="qae" hidden>${ic('search')}<h3>No answer matches</h3><button class="btn" id="qac">Clear search</button></div></section></div>
    <div class="stack s6"><section class="panel pad stack"><h2>How it works</h2><ol class="stack s2">${s.how.map((x,i) => `<li class="row top"><span class="num">${i + 1}</span><span class="sm">${esc(x)}</span></li>`).join('')}</ol></section>
      <section class="panel pad stack"><h2>What it does not do</h2><ul class="stack s2">${s.notDo.map(x => `<li class="row sm top">${ic('x','sm')}<span>${esc(x)}</span></li>`).join('')}</ul></section>
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
          ${r ? `<div class="stack s2"><p class="label">This week's 2-minute drill</p><p class="sm">${esc(DRILL[Math.min(4, Math.max(0, r.stage - 1))])}</p><a class="link" href="../starwell-practice/" target="_blank" rel="noopener">Open the Practice Line</a></div>` : ''}</section>
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

/* ---------- research: the full Nov 16 snapshot, loaded once ---------- */
let RAW = null, rawState = 'idle';
async function loadRaw(){
  if(RAW || rawState === 'loading') return;
  rawState = 'loading';
  try{ const r = await fetch('../../starwell-practice/research/starwell_needs.json'); if(!r.ok) throw new Error(r.status);
    const arr = await r.json(); RAW = {}; arr.forEach(x => { if(x && x.id && x.scores) RAW[x.id] = x; }); rawState = 'ok'; }
  catch(e){ rawState = 'error'; }
  if(mounted === 'ws') render();
}
const tri = v => v === true ? ['y','Yes'] : v === false ? ['n','No'] : ['u', v == null || v === '' ? 'Not confirmed' : String(v)];
const isUrl = u => /^https?:\/\//.test(String(u || ''));
const srcHTML = (u, seen, shot) => `<span class="src">${seen ? 'Seen ' + esc(nice(String(seen).slice(0,10))) : ''}${isUrl(u) ? `${seen ? ' · ' : ''}<a href="${esc(String(u).split(' ')[0])}" target="_blank" rel="noopener">Source</a>` : ''}${shot ? ` · Capture "${esc(shot)}" is not stored in this app` : ''}</span>`;
const evList = (items, cls) => items.length ? `<ul class="ev">${items.map(i => `<li class="${cls || ''}">${i}</li>`).join('')}</ul>` : '';
const proofOf = (R, k) => (R.proof || []).filter(p => p.system === k && !/^Score note/i.test(p.finding || ''));

/* ---------- readiness ---------- */
function ready(c){
  const n = c.n;
  if(c.tier === 4 || (n && n.open === false)) return ['hold','On hold', c.flag || 'Research found this business closed. Do not call until that is reviewed.'];
  if(c.flag) return ['check','Check first', c.flag];
  if(c.phoneNote || (n && n.phone && n.phone.match !== true)) return ['conflict','Source conflict', c.phoneNote || 'The site and Google show different phone numbers. Check before dialing.'];
  if(!n) return ['incomplete','Research incomplete', 'No research record is attached to this company. Ask neutral questions.'];
  return ['ready','Ready', ''];
}

/* ---------- drafts: one per company, kept on this device until the call is saved ---------- */
const dKey = () => 'sw_drafts_' + (user() || 'guest');
let drafts = {}; try{ drafts = JSON.parse(localStorage.getItem(dKey()) || '{}'); }catch(e){}
const draft = id => drafts[id] || (drafts[id] = {stage:0, turn:0, response:'', email:'', cbDate:'', cbTime:'', contact:'', outcome:'', nextAction:'', date:'', time:'', note:'', quote:'', reached:0, turnOn:'', prep:''});
const keep = () => { try{ localStorage.setItem(dKey(), JSON.stringify(drafts)); }catch(e){} };
const scope = () => myShops();

/* ---------- words for one company ---------- */
function script(c){
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
function reply(key, c){
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
  return {text:`${outLabel(last)} on ${nice(last.at)}${cs.length > 1 ? ` (${cs.length} calls logged)` : ''}.`, sub:open ? `Open next step: ${open.next.action}${open.next.date ? ' by ' + nice(open.next.date) : ''}. This is a plan, not proof it was done.` : '', quote:last.quote || last.notes || ''};
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
let qFilter = 'all', qSearch = '';
function queueView(){
  shell('queue'); mounted = 'queue'; dirty = false;
  const bob = user() === 'Bobby', src = bob ? [].concat((team && team.Dan) || [], (team && team.RJ) || []).map(fromServer) : calls;
  const held = all.filter(c => c.tier === 4 && (bob || c.caller === me() || !c.caller));
  const items = scope().map(c => { const s = state(c, src); return {c, k:s.k === 'due' ? 'follow-up' : s.k === 'done' ? 'done' : 'to-call', s}; }).concat(held.map(c => ({c, k:'hold', s:{label:'On hold', last:ready(c)[2]}})));
  const count = k => k === 'all' ? items.length : items.filter(i => i.k === k).length;
  const shown = items.filter(i => (qFilter === 'all' || i.k === qFilter) && (i.c.name + ' ' + i.c.said + ' ' + i.c.town + ' ' + i.c.area + ' ' + i.c.ask).toLowerCase().includes(qSearch));
  const q = bob ? [] : queue(), resume = q[0];
  const filters = [['all','All'],['follow-up','Follow-ups'],['to-call','To call'],['done','Done']].concat(held.length ? [['hold','On hold']] : []);
  app.className = ''; app.innerHTML = `
    ${!auth ? `<p class="notice page-notice">${pi('info')}<span>You're looking around as <b>${esc(guest)}</b>. <a href="#/signin">Sign in</a> to save calls.</span></p>` : ''}
    ${loadErr ? `<p class="notice warn page-notice" role="status">${pi('warning')}<span>Your saved calls could not be loaded, so statuses below may be out of date. ${esc(loadErr)} <button class="text-button" id="retry">Try again</button></span></p>` : ''}
    <main class="queue-panel" id="main-content" tabindex="-1"><div class="queue-heading"><div><p class="eyebrow">${bob ? 'TEAM QUEUE' : 'YOUR CALLING QUEUE'}</p><h1>${bob ? 'All companies' : 'Your companies'}</h1></div>
      ${resume ? `<a class="button primary" href="#/w/${resume.id}/prepare">${items.some(i => i.k !== 'to-call' || i.s.icon !== 'circle') ? 'Next company' : 'Start calling'}${pi('caret-right')}</a>` : ''}</div>
    <div class="queue-tools"><nav class="queue-filters" aria-label="Filter companies">${filters.map(f => `<button class="${qFilter === f[0] ? 'active' : ''}" aria-pressed="${qFilter === f[0]}" data-f="${f[0]}">${f[1]}<span>${count(f[0])}</span></button>`).join('')}</nav>
      <div class="search-field">${pi('magnifying-glass')}<input type="search" id="qs" aria-label="Search calling queue" placeholder="Find a company…" value="${esc(qSearch)}"></div></div>
    <div class="queue-list">${shown.map(({c, k, s}) => `<button class="queue-row ${k === 'hold' ? 'held' : ''}" data-id="${c.id}"><span class="queue-status ${k}">${k === 'follow-up' ? pi('clock') : k === 'done' ? pi('check-circle') : k === 'hold' ? pi('pause-circle') : '<span class="queue-status-dot"></span>'}${esc(k === 'to-call' && s.icon === 'circle' ? 'To call' : s.label)}</span>
        <span class="queue-company"><strong>${esc(c.said)}</strong><small>${esc(c.town)} · Ask for ${esc(c.ask)}${bob && c.caller ? ' · ' + esc(c.caller) + '\'s' : ''}</small></span><span class="queue-result">${esc(s.last || SYSN[c.lead] || '')}</span>${pi('caret-right')}</button>`).join('')
      || `<div class="empty-state"><h2>${items.length ? 'No companies match' : 'No companies assigned'}</h2><p>${items.length ? 'Try another search or filter.' : 'Nothing is assigned to this account yet.'}</p>${items.length ? '<button class="text-button" id="clr">Show all companies</button>' : ''}</div>`}</div></main>`;
  $$('[data-f]').forEach(b => b.onclick = () => { qFilter = b.dataset.f; queueView(); });
  $$('.queue-row').forEach(b => b.onclick = () => go('#/w/' + b.dataset.id + '/prepare'));
  $('#qs').oninput = e => { qSearch = e.target.value.toLowerCase().trim(); const p = e.target.selectionStart; queueView(); const i = $('#qs'); i.focus(); i.setSelectionRange(p, p); };
  const clr = $('#clr'); if(clr) clr.onclick = () => { qSearch = ''; qFilter = 'all'; queueView(); };
  const rt = $('#retry'); if(rt) rt.onclick = () => { loaded = false; render(); };
}

/* ---------- workspace ---------- */
function companyPanel(c, list, i){
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
    <section class="company-brief" id="brief"><h2>${pi('file-text-l')}Company brief</h2>
      <button class="brief-toggle" id="bt" aria-expanded="false">${pi('file-text-l')}Company brief${pi('caret-down')}</button>
      <div class="brief-content"><dl class="brief-list">
        <div><dt>${pi('user-l')}<span class="sr-only">Contact</span></dt><dd><strong>Talk to ${esc(c.ask)}</strong></dd></div>
        <div><dt>${pi('desktop-l')}<span class="sr-only">Topic</span></dt><dd><strong>Lead with:</strong> ${SYSN[c.lead] || 'Not set'}</dd></div>
        <div><dt>${pi('file-text-l')}<span class="sr-only">Research</span></dt><dd><strong>Research note:</strong> ${esc(short(note) || 'Company-specific research has not been supplied.')}</dd></div>
        <div><dt>${pi('chat-circle-l')}<span class="sr-only">Reminder</span></dt><dd>${esc(short((c.unknown || [])[0] ? 'Not confirmed: ' + c.unknown[0] : 'Ask how it works today. Let them tell you.'))}</dd></div>
      </dl><button class="source-link text-button" data-src>View sources${pi('arrow-square-out')}</button></div></section></aside>`;
}
function prepareHTML(c){
  const R = RAW && RAW[c.id], n = c.n, rd = ready(c), rel = relationship(c), sc = script(c), g = O.gifts[c.lead], d = draft(c.id);
  const lead = R ? proofOf(R, c.lead) : [], gp = (R && R.google_profile) || {}, w = (R && R.website) || {};
  const strong = R && R.strengths && R.strengths[0] ? R.strengths[0] : c.facts[0];
  const reach = [c.hours && 'Hours: ' + c.hours, c.emergency && 'After hours: ' + c.emergency, (w.booking || c.booking) && 'Booking: ' + (w.booking || c.booking)].filter(Boolean);
  const unknown = (R && R.not_confirmed) || c.unknown || [];
  const ess = `<div class="prep-essentials">
      <div><span>Who and where</span><strong>${esc(c.ask)}</strong><p>${esc(c.name)}, ${esc(c.town)}. ${esc(c.askNote || '')}</p><p class="src"><a href="${esc(c.site)}" target="_blank" rel="noopener">${esc(c.site.replace(/^https?:\/\//,''))}</a> · ${esc(c.phone)}</p></div>
      <div><span>What deserves respect</span><p>${esc(strong || c.since)}</p></div>
      <div><span>How customers reach them now</span>${reach.map(x => `<p>${esc(x)}</p>`).join('') || '<p>Not confirmed. Ask.</p>'}</div>
      <div><span>Lead with, and why</span><strong>${SYSN[c.lead]}</strong>${(lead.length ? lead.slice(0,2).map(p => `<p>${esc(p.finding)} ${srcHTML(p.source_url, p.seen_on)}</p>`).join('') : `<p>${esc(whyLine(c))}</p>`)}<p class="src">Offer: ${esc(g.termsShort)}.</p></div>
      <div><span>Where things stand</span><p>${esc(rel.text)}</p>${rel.sub ? `<p>${esc(rel.sub)}</p>` : ''}${rel.quote ? `<p class="src">Your note: "${esc(rel.quote)}"</p>` : ''}<p class="src">Goal of this call: a 15-minute walkthrough, if he wants one.</p></div>
      ${rd[0] !== 'ready' ? `<div class="prep-check">${pi('warning')}<p><b>${esc(rd[1])}.</b> ${esc(rd[2])}</p></div>` : unknown[0] ? `<div class="prep-check">${pi('info')}<p><b>Don't assume:</b> ${esc(unknown[0])}</p></div>` : ''}
    </div>`;
  let deep = '';
  if(rawState === 'loading' || rawState === 'idle') deep = `<p class="field-help" role="status">Loading the full research…</p>`;
  else if(rawState === 'error' || !R) deep = `<p class="notice warn">${pi('warning')}<span>${R === undefined && rawState === 'ok' ? 'No research record exists for this company.' : 'The full research could not be loaded. The summary above still stands.'} <button class="text-button" id="rawretry">Try again</button></span></p>`;
  else {
    const sec = (title, count, body) => body ? `<details class="prep-section"><summary>${esc(title)}${count != null ? `<small>${count}</small>` : ''}${pi('caret-down')}</summary><div>${body}</div></details>` : '';
    const pl = k => evList(proofOf(R, k).map(p => `${esc(p.finding)} ${srcHTML(p.source_url, p.seen_on, p.screenshot)}`));
    const fs = w.first_screen || {}, FL = {trade_and_town:'Trade and town stated', phone_visible:'Phone number visible', tap_to_call:'Tap-to-call', book_button:'Book or request button', rating_shown:'Star rating shown', real_photo:'Real team or truck photo'};
    const quotes = R.review_quotes || [], good = quotes.filter(q => !/not getting through/i.test(q.kind || '')), bad = quotes.filter(q => /not getting through/i.test(q.kind || ''));
    const qli = q => `"${esc(q.quote)}" (${esc(q.reviewer || 'reviewer')}${q.date ? ', ' + esc(String(q.date).slice(0, 40)) : ''}) ${srcHTML(q.review_link || q.source_url)}`;
    const others = ['phone','site','found','social'].filter(k => k !== c.lead);
    deep = `<h3>Research, checked ${esc(nice(R.checked))}</h3>`
      + sec('Business and people', null, `<dl class="facts"><dt>Name</dt><dd>${esc(c.name)}</dd><dt>Since</dt><dd>${esc(c.since)}</dd><dt>Contact</dt><dd>${esc((R.owner && R.owner.name) || 'Not confirmed')}</dd><dt>Role, as sourced</dt><dd>${esc((R.owner && R.owner.title) || 'Not confirmed')} ${srcHTML(R.owner && R.owner.source_url)}</dd><dt>Ask for</dt><dd>${esc(c.ask)}. ${esc(c.askNote || '')}</dd></dl>`)
      + sec('Hours, phone and booking', null, `<dl class="facts"><dt>Phone on site</dt><dd>${esc((R.phone && R.phone.site) || 'Not confirmed')}</dd><dt>Phone on Google</dt><dd>${esc((R.phone && R.phone.google) || 'Not confirmed')}</dd><dt>Do they match?</dt><dd>${tri(R.phone && R.phone.match)[1]}</dd><dt>We dial</dt><dd>${esc(c.phone)}${c.phoneNote ? '. ' + esc(c.phoneNote) : ''}</dd><dt>Hours on Google</dt><dd>${esc(gp.hours || 'Not confirmed')}</dd><dt>Hours, our record</dt><dd>${esc(c.hours)}</dd><dt>After hours</dt><dd>${esc(c.emergency)}</dd><dt>Booking</dt><dd>${esc(w.booking || c.booking || 'Not confirmed')}</dd></dl>${pl('phone')}`)
      + sec('Reputation and strengths', good.length + (good.length === 1 ? ' quote' : ' quotes'), `<dl class="facts"><dt>Google profile</dt><dd>${esc(gp.name || 'Not found')}</dd><dt>Rating</dt><dd>${gp.rating != null && gp.rating !== '' ? esc(gp.rating) + ' from ' + esc(gp.reviews) + ' reviews' : 'Not confirmed'} ${srcHTML(gp.source_url)}</dd><dt>Newest review</dt><dd>${esc(gp.newest_review || 'Not confirmed')}</dd><dt>Owner replies</dt><dd>${tri(gp.owner_replies)[1]}</dd><dt>Reviews on site</dt><dd>${esc(w.reviews_on_site || 'Not confirmed')}</dd></dl>${evList((R.strengths || []).map(esc))}${good.length ? `<p class="sub">Kind words you may mention</p>${evList(good.map(qli))}` : ''}${bad.length ? `<p class="sub">Private. Never quote these to the owner.</p>${evList(bad.map(qli), 'private')}` : ''}`)
      + sec('Website experience', (w.problems || []).length + ' observations', `<p class="sub">First screen on a phone</p><ul class="tri">${Object.keys(FL).map(k => { const t = tri(fs[k]); return `<li class="${t[0]}">${FL[k]}: ${esc(t[1])}</li>`; }).join('')}</ul><dl class="facts"><dt>Phone speed score</dt><dd>${w.pagespeed_mobile != null && w.pagespeed_mobile !== '' ? esc(w.pagespeed_mobile) + ' of 100' : 'Not confirmed'}${w.lcp_seconds ? ', main content in ' + esc(w.lcp_seconds) + ' s' : ''}</dd><dt>Already answers</dt><dd>${esc(w.answers_that_stop_calls || 'Not confirmed')}</dd><dt>Service and town pages</dt><dd>${esc(w.service_and_town_pages || 'Not confirmed')}</dd><dt>Secure, footer year</dt><dd>${tri(w.https)[1]}${w.copyright ? ', ' + esc(w.copyright) : ''}</dd></dl>${evList((w.problems || []).map(p => `${esc(p.finding)} ${srcHTML(p.source_url, null, p.screenshot)}`))}<p class="field-help">A speed number is a test result on one day. It is not proof that customers leave.</p>`)
      + sec('Getting found', (R.maps_rank || []).length + ' searches, ' + (R.ai_answers || []).length + ' AI checks', `${pl('found')}<p class="sub">Google Maps, on the day checked</p>${evList((R.maps_rank || []).map(m => `"${esc(m.query)}": ${/^\d+$/.test(String(m.position)) ? 'position ' + esc(m.position) : esc(m.position == null ? 'not confirmed' : m.position)}${(m.top_three || []).length ? '. First three: ' + m.top_three.map(t => esc(t.name)).join(', ') : ''} ${srcHTML(m.source_url, null, m.screenshot)}`))}<p class="sub">AI answers</p>${evList((R.ai_answers || []).map(a => `${esc(a.tool)}: ${a.named === true ? 'named' + (a.position ? ', position ' + esc(a.position) : '') : a.named === false ? 'not named' : esc(a.named == null ? 'not confirmed' : a.named)} for "${esc(a.question)}"${a.note ? '. ' + esc(a.note) : ''}`))}<p class="field-help">Results change by day and by where the searcher is. Never say "you don't show up".</p>`)
      + sec('Social presence', (R.social || []).length + ((R.social || []).length === 1 ? ' page' : ' pages'), `${evList((R.social || []).map(s => `${esc(s.platform)}: ${s.live === false ? 'link does not lead to a live page' : s.live === true ? 'live' : 'not confirmed'}${s.followers != null ? ', ' + esc(s.followers) + ' followers' : ''}${s.last_post ? ', last post ' + esc(String(s.last_post).slice(0, 30)) : ''}${s.posts_last_90_days != null ? ', ' + esc(s.posts_last_90_days) + ' posts in 90 days' : ''}, own job photos: ${esc(tri(s.own_job_photos)[1].toLowerCase())} ${srcHTML(s.url, null, s.screenshot)}`))}${pl('social')}`)
      + sec('Recommended offer: ' + SYSN[c.lead], null, `<p>${esc(S[c.lead].one)}</p><dl class="facts"><dt>Say</dt><dd>${esc(fill(g.say, c))}</dd><dt>What he keeps</dt><dd>${esc(g.terms)}</dd><dt>Limits</dt><dd>${esc(S[c.lead].notDo[0])}</dd></dl><p><a href="#/systems/${c.lead}">Everything about the ${SYSN[c.lead].toLowerCase()}</a></p>`)
      + sec('Other services, if he steers there', null, others.map(k => `<p><b>${SYSN[k]}${R.second_need === k ? ' (second need)' : ''}.</b> ${esc((proofOf(R, k)[0] || {}).finding || 'No specific finding.')} <a href="#/systems/${k}">Details</a></p>`).join(''))
      + sec('Office work and custom tools', (R.office_signals || []).length + ' signals', `${evList((R.office_signals || []).map(o => `${esc(o.signal || o)} ${srcHTML(o.source_url)}`))}<p>${esc(c.custom)}</p><p class="field-help">A signal is not a problem. Only raise custom tools if he names the headache. They are quoted up front, never free.</p>`)
      + sec('Prior calls', callsOf(c.id).length + ' logged', callsOf(c.id).length ? evList(callsOf(c.id).slice().reverse().map(x => `${esc(nice(x.at))}: <b>${esc(outLabel(x))}</b>${x.next && x.next.action ? '. Next step: ' + esc(x.next.action) + (x.next.date ? ' by ' + esc(nice(x.next.date)) : '') + (x.next.done ? ' (marked done)' : ' (open)') : ''}${x.notes ? '. Note: ' + esc(x.notes) : ''}${x.quote ? '. His words: "' + esc(x.quote) + '"' : ''}`)) : '<p>No prior call recorded.</p>')
      + sec('Unknowns and cautions', unknown.length, `${evList(unknown.map(esc))}<p><b>Never say:</b> ${esc(S.evidence[c.lead].never)}</p><p class="field-help">${esc(S.evidence[c.lead].not)}</p>${(R.changes_from_record || []).length ? `<p class="sub">Corrections since our first record</p>${evList(R.changes_from_record.map(esc))}` : ''}`);
  }
  return `<main class="prepare-panel" id="main-content" tabindex="-1"><p class="eyebrow">PREPARE FOR THIS COMPANY</p><h2>Before you call</h2>
    ${ess}
    ${rd[0] === 'hold' ? '' : `<div class="opening-preview"><span class="speech-label">YOUR OPENING</span><p>${esc(sc[1].turns[0])}</p><p>${esc(sc[1].turns[1])}</p></div>
    <div class="prep-actions"><button class="button primary" id="open">Open call guide${pi('arrow-right')}</button><button class="text-button" data-src>All evidence</button><button class="text-button" id="print">${pi('printer')}Print</button></div>`}
    <details class="prep-notes" ${d.prep ? 'open' : ''}><summary>${pi('note-pencil')}A note to keep in mind <span>(optional)</span></summary><label class="sr-only" for="prep-note">A note to keep in mind</label><textarea id="prep-note" placeholder="Something helpful to remember on this call…">${esc(d.prep || '')}</textarea><p class="field-help">Kept on this device.</p></details>
    <section class="prep-deep" aria-label="Full research">${deep}</section></main>`;
}
function callHTML(c){
  const d = draft(c.id), sc = script(c), st = sc[d.stage], rp = d.response ? reply(d.response, c) : null;
  const inExtra = !rp && d.stage === 2 && d.turn >= st.turns.length, lines = inExtra ? st.extra : st.turns, ti = inExtra ? d.turn - st.turns.length : Math.min(d.turn, st.turns.length - 1);
  const text = rp ? rp.text : lines[ti], more = !rp && ti < lines.length - 1;
  const cue = rp ? rp.cue : inExtra ? 'Say the honest reason, then stop talking.' : d.stage === 2 ? CUES[2] + ' ' + O.gifts[c.lead].termsShort + '.' : CUES[d.stage];
  const nextLabel = rp ? (rp.action || 'Back to script') : more ? 'Next line' : inExtra ? 'Agree a next step' : ['Continue to ask','Continue to offer','Agree a next step','Log the outcome'][d.stage];
  const capture = rp && rp.field === 'email' ? `<form class="inline-capture" id="cap" novalidate><label for="call-email">Email address</label><div><input id="call-email" type="email" autocomplete="off" inputmode="email" value="${esc(d.email)}" placeholder="Enter the address they give you" aria-describedby="cap-help cap-err"><button class="button primary" type="submit">Save email &amp; return${pi('arrow-right')}</button></div><p class="field-error" id="cap-err" role="alert" hidden></p><p class="field-help" id="cap-help">This only keeps the address. Sending is a separate step you do after the call.</p></form>`
    : rp && rp.field === 'callback' ? `<form class="inline-capture" id="cap" novalidate><label for="cb-date">Better time, only if he gave one</label><div class="pair"><input id="cb-date" type="date" value="${esc(d.cbDate)}" aria-label="Call back date"><input id="cb-time" type="text" value="${esc(d.cbTime)}" placeholder="Time he said, e.g. after 3" aria-label="Call back time"></div><div><button class="button primary" type="submit">Save &amp; return${pi('arrow-right')}</button></div><p class="field-help">Leave it blank if nothing was agreed.</p></form>`
    : rp && rp.field === 'contact' ? `<form class="inline-capture" id="cap" novalidate><label for="ct-name">Who should we ask for?</label><div><input id="ct-name" type="text" value="${esc(d.contact)}" placeholder="Name and role, as they told you" autocomplete="off"><button class="button primary" type="submit">Save &amp; return${pi('arrow-right')}</button></div><p class="field-help">Saved as "told on the call". Our researched contact stays on file.</p></form>` : '';
  const shown = d.more ? RESP : RESP.slice(0, 4);
  return `<main class="call-panel" id="main-content" tabindex="-1">
    <nav class="stage-nav" aria-label="Conversation stages"><ol>${STAGE4.map((s,i) => `<li class="${i < d.stage ? 'complete' : ''} ${i === d.stage ? 'current' : ''}"><button data-stage="${i}" ${i === d.stage ? 'aria-current="step"' : ''}><span class="stage-dot">${i < d.stage ? pi('check') : ''}</span><span>${s}</span></button></li>`).join('')}</ol></nav>
    <section class="speech-area" aria-label="Current call guidance" aria-live="polite">
      ${rp ? `<div class="reply-context">They say: ${esc((RESP.find(r => r[0] === d.response) || [])[1])}<button class="text-button" id="back">Back to script</button></div>` : inExtra ? `<div class="reply-context">${esc(st.extraLabel)}<button class="text-button" id="backoffer">Back to the offer</button></div>` : ''}
      <div class="speech-label">${rp ? 'YOUR REPLY' : 'SAY THIS'}</div>
      <p class="script-text" id="call-guidance-text" tabindex="-1">${esc(text)}</p>
      ${!rp && lines.length > 1 ? `<div class="turns" role="img" aria-label="Line ${ti + 1} of ${lines.length}">${lines.map((x,i) => `<i class="${i <= ti ? 'on' : ''}"></i>`).join('')}</div>` : ''}
      <div class="coaching"><span class="coaching-label">${pi('sparkle-l')}FOR YOU</span><p>${esc(cue)}</p></div>
      ${capture || `<div class="call-actions"><button class="button primary" id="go">${esc(nextLabel)}${pi('arrow-right')}</button>${!rp && d.stage === 3 && !more ? '' : `<button class="button secondary" id="log">Log outcome</button>`}</div>
      ${!rp && d.stage === 2 && !inExtra && !more ? `<p><button class="text-button" id="rest">${esc(st.extraLabel)}${pi('caret-right')}</button></p>` : ''}`}
    </section>
    <section class="responses" aria-label="Common responses"><h2>They say...</h2><div class="response-list">${shown.map(r => `<button class="${d.response === r[0] ? 'selected' : ''}" aria-pressed="${d.response === r[0]}" data-resp="${r[0]}"><span>${r[1]}</span>${pi('caret-right')}</button>`).join('')}</div>
      <button class="text-button more-responses" id="more" aria-expanded="${!!d.more}">${d.more ? 'Fewer responses' : 'More responses'}${pi('caret-down')}</button></section></main>`;
}
function wrapHTML(c){
  const d = draft(c.id), o = d.outcome, talk = TALK.includes(o), needDate = o === 'booked' || o === 'callback', canFollow = needDate || ['info','notnow','office'].includes(o);
  const reached = d.reached || [1,2,(d.turn >= 1 && d.stage === 2 ? 4 : 3),5][d.stage] || 1, turnOn = d.turnOn || RESP2TURN[d.lastResponse] || '';
  return `<main class="wrap-panel" id="main-content" tabindex="-1"><p class="eyebrow">WRAP UP</p><h2>What happened?</h2><p class="section-intro">Keep the useful details. Then move on.</p>
    <form id="wf" novalidate>
      <fieldset class="outcome-fieldset"><legend>How did the call end?</legend><div class="outcome-options ten">${OUTS.map(x => `<label class="${o === x[0] ? 'selected' : ''}"><input type="radio" name="outcome" value="${x[0]}" ${o === x[0] ? 'checked' : ''}><span>${x[1]}</span>${o === x[0] ? pi('check') : ''}</label>`).join('')}</div></fieldset>
      ${o === 'info' ? `<label class="form-label">Email address <span>(if confirmed)</span><input type="email" id="w-email" autocomplete="off" value="${esc(d.email)}" placeholder="No email captured yet"></label>` : ''}
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
  if(!R){ dialog('Company research', `<div class="source-detail"><p class="eyebrow">${esc(c.name)}</p><h3>${rawState === 'loading' ? 'Loading the research…' : 'Research not available'}</h3><p>${rawState === 'error' ? 'The research file could not be loaded. Check your connection and try again.' : 'No research record is attached to this company. Ask neutral questions and let the contact explain.'}</p></div>`, true); return; }
  const by = k => (R.proof || []).filter(p => p.system === k);
  dialog('Company research', `<div class="source-detail"><p class="eyebrow">${esc(c.name)} · checked ${esc(nice(R.checked))}</p>
    <div class="research-provenance"><strong>Source: StarWell research snapshot, ${esc(nice(R.checked))}</strong><p>Each line is what was seen that day. Recheck before speaking as if it is still true. Captures named here were not included with the research file.</p></div>
    ${['phone','site','found','social'].map(k => by(k).length ? `<h3>${SYSN[k]} · need ${esc(R.scores[k])} of 3 · ${by(k).length} findings</h3>${evList(by(k).map(p => `${esc(p.finding)} ${srcHTML(p.source_url, p.seen_on, p.screenshot)}`))}` : '').join('')}
    ${(R.review_quotes || []).length ? `<h3>Review quotes · ${(R.review_quotes || []).length}</h3>${evList(R.review_quotes.map(q => `[${esc(q.kind || 'quote')}] "${esc(q.quote)}" (${esc(q.reviewer || '')}${q.date ? ', ' + esc(String(q.date).slice(0, 40)) : ''}) ${srcHTML(q.review_link || q.source_url, null, q.screenshot)}`), '')}` : ''}
    <p class="field-help">Need scores (0 to 3) rate how much room there is to help. They are not ratings of the business.</p></div>`, true);
}
function pickerDialog(c, list){
  dialog('Choose a company', `<div class="search-field">${pi('magnifying-glass')}<input aria-label="Search companies" placeholder="Search company, town or contact" type="search" id="ps"></div><p class="list-count" id="pc"></p><div class="picker-list" id="pl"></div>`, false, (d, close) => {
    const paint = () => { const v = $('#ps', d).value.toLowerCase().trim(), res = list.filter(x => (x.name + ' ' + x.said + ' ' + x.town + ' ' + x.ask + ' ' + x.area).toLowerCase().includes(v));
      $('#pc', d).textContent = res.length + (res.length === 1 ? ' company' : ' companies');
      $('#pl', d).innerHTML = res.map(x => `<button data-id="${x.id}" class="${x.id === c.id ? 'selected' : ''}"><span><strong>${esc(x.said)}</strong><small>${esc(x.town)} · ${esc(x.ask)} · ${esc(state(x).label)}</small></span>${x.id === c.id ? pi('check') : pi('caret-right')}</button>`).join('') || `<div class="empty-state"><h3>No matching companies</h3><p>Try another name, town or contact.</p></div>`;
      $$('[data-id]', d).forEach(b => b.onclick = () => { close(); go('#/w/' + b.dataset.id + '/prepare'); }); };
    $('#ps', d).oninput = paint; paint();
  });
}
let saving = false;
function workspaceView(p){
  const c = byId(p[1]); if(!c){ location.replace('#/queue'); return; }
  const rd = ready(c); let mode = ['prepare','call','wrap'].includes(p[2]) ? p[2] : 'prepare';
  if(rd[0] === 'hold') mode = 'prepare';
  const list = scope().includes(c) ? scope() : [c], i = list.indexOf(c), d = draft(c.id), sameCo = mounted === 'ws' && app.dataset.co === c.id;
  loadRaw(); shell(mode, c.id); mounted = 'ws'; app.dataset.co = c.id; app.className = '';
  app.innerHTML = `<div class="workspace">${companyPanel(c, list, i)}${mode === 'call' ? callHTML(c) : mode === 'wrap' ? wrapHTML(c) : prepareHTML(c)}</div>`;
  const rer = focusId => { keep(); workspaceView(p); if(focusId){ const el = document.getElementById(focusId); if(el){ el.focus({preventScroll:true}); if(window.innerWidth < 761) ($('.speech-area') || el).scrollIntoView({block:'start'}); } } };
  /* rail */
  $('#pick').onclick = () => pickerDialog(c, list);
  $('#prv').onclick = () => go('#/w/' + list[i - 1].id + '/' + (mode === 'wrap' ? 'prepare' : mode));
  $('#nxt').onclick = () => go('#/w/' + list[i + 1].id + '/' + (mode === 'wrap' ? 'prepare' : mode));
  $$('[data-src]').forEach(b => b.onclick = () => sourcesDialog(c));
  const bt = $('#bt'); bt.onclick = () => { const open = $('#brief').classList.toggle('is-open'); bt.setAttribute('aria-expanded', open); };
  if(!sameCo && window.innerWidth >= 761){ const m = $('#main-content'); if(m) window.scrollTo(0, 0); }
  /* prepare */
  if(mode === 'prepare'){
    const op = $('#open'); if(op) op.onclick = () => go('#/w/' + c.id + '/call');
    const pn = $('#prep-note'); pn.oninput = () => { d.prep = pn.value; keep(); };
    const pr = $('#print'); if(pr) pr.onclick = () => { $$('details').forEach(x => x.open = true); window.print(); };
    const rr = $('#rawretry'); if(rr) rr.onclick = () => { rawState = 'idle'; RAW = null; loadRaw(); };
  }
  /* call */
  if(mode === 'call'){
    const sc = script(c), st = sc[d.stage], rp = d.response ? reply(d.response, c) : null;
    $$('[data-stage]').forEach(b => b.onclick = () => { d.stage = +b.dataset.stage; d.turn = 0; d.response = ''; rer('call-guidance-text'); });
    $$('[data-resp]').forEach(b => b.onclick = () => { d.response = b.dataset.resp; d.lastResponse = d.response; rer('call-guidance-text'); });
    $('#more').onclick = () => { d.more = !d.more; rer('more'); };
    const back = $('#back'); if(back) back.onclick = () => { d.response = ''; rer('call-guidance-text'); };
    const bo = $('#backoffer'); if(bo) bo.onclick = () => { d.turn = 0; rer('call-guidance-text'); };
    const rest = $('#rest'); if(rest) rest.onclick = () => { d.turn = st.turns.length; rer('call-guidance-text'); };
    const lg = $('#log'); if(lg) lg.onclick = () => go('#/w/' + c.id + '/wrap');
    const g = $('#go'); if(g) g.onclick = () => {
      if(rp){ if(rp.outcome){ d.outcome = rp.outcome; d.response = ''; keep(); go('#/w/' + c.id + '/wrap'); return; } if(rp.next != null){ d.stage = rp.next; d.turn = 0; } d.response = ''; rer('call-guidance-text'); return; }
      const inExtra = d.stage === 2 && d.turn >= st.turns.length, lines = inExtra ? st.extra : st.turns, ti = inExtra ? d.turn - st.turns.length : d.turn;
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
      if(c.caller && c.caller !== user()) return fail('This company is assigned to ' + c.caller + '. Only ' + c.caller + ' can log calls for it.');
      const o = d.outcome, needDate = o === 'booked' || o === 'callback', date = d.date || (needDate || o === 'notnow' || o === 'info' || o === 'office' ? d.cbDate : '');
      if(!o) return fail('Choose how the call ended.', '[name=outcome]');
      if(needDate && !date) return fail('Add the agreed date before saving. If no date was agreed, choose "Not now" or "Asked for info".', '#w-date');
      if(o === 'info' && d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) return fail('Check the email address before saving.', '#w-email');
      const talk = TALK.includes(o), follow = needDate || ['info','notnow','office'].includes(o);
      const call = {id:d.callId || (d.callId = newId()), caller:user(), shop:c.id, shopName:c.said, at:d.at || (d.at = new Date().toISOString()), kind:talk ? 'talk' : 'quick', outcome:o,
        stage:talk ? (+($('#w-reached') || {}).value || d.reached || 1) : 0, turn:talk ? (($('#w-turn') || {}).value || '') : '', notes:d.note || '', quote:talk ? d.quote || '' : '', email:o === 'info' ? (d.email || '').trim() : '', time:needDate ? (d.time || d.cbTime || '') : '', contact:d.contact || '',
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
window.addEventListener('hashchange', render);
render();
})();
