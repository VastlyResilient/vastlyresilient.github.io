/* StarWell Call Decks. One file, no framework.
   Today (your shops as a checklist) + Call screen (one shop at a time) + Systems + Progress.
   Data: ../starwell-practice/{offer,decks,needs,systems}.js. Server: ../starwell-practice/server/calls.mjs */
'use strict';
(() => {
const O = window.STARWELL_OFFER, D = window.STARWELL_DECKS, S = window.STARWELL_SYSTEMS;
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic = (n, cls) => `<svg class="icon ${cls || ''}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
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
const toServer = c => ({id:c.id, shop:c.shop, shopName:c.shopName, at:c.at, outcome:c.outcome, reached:c.stage || 0, objection:c.turn || '', answers:{kind:c.kind, notes:c.notes || '', line:c.line || ''},
  next:c.next || {}, transcript:c.transcript, analysis:c.analysis, followups:c.followups});
const fromServer = s => ({id:s.id, caller:s.caller, shop:s.shop, shopName:s.shopName, at:s.at || s.updated, outcome:s.outcome || '', stage:s.reached || 0, turn:s.objection || '',
  kind:(s.answers && s.answers.kind) || (QUICK[s.outcome] ? 'quick' : 'talk'), notes:(s.answers && s.answers.notes) || '', line:(s.answers && s.answers.line) || '', next:s.next || {}, transcript:s.transcript, analysis:s.analysis, followups:s.followups});
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

/* ---------------- shell ---------------- */
let mounted = '', dirty = true, lastScroll = 0;
const go = h => { if(location.hash !== h) location.hash = h; };
function shell(active){
  const nav = [['today','Today','list'],['systems','Systems','book-open'],['progress','Progress','bar-chart']];
  $('#bar').innerHTML = `<a class="brand" href="#/today"><img src="../starwell-practice/assets/starwell-logo.png" alt=""><span>StarWell</span></a>
    <nav class="nav" aria-label="Main">${nav.map(n => `<a href="#/${n[0]}" ${active === n[0] ? 'aria-current="page"' : ''}>${ic(n[2],'sm')}<span>${n[1]}</span></a>`).join('')}</nav>
    <span class="grow"></span>
    ${auth ? `<span class="row sm"><b>${esc(user())}</b></span><button class="btn quiet icononly" id="so" aria-label="Sign out">${ic('log-out')}</button>` : `<a class="btn" href="#/signin">Sign in</a>`}`;
  const so = $('#so'); if(so) so.onclick = signOut;
}
const loadingHTML = `<div class="panel pad stack" aria-busy="true"><span class="sr">Loading</span><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>`;
function toast(msg, undo){
  $$('.toast').forEach(t => t.remove());
  const el = document.createElement('div'); el.className = 'toast glass'; el.setAttribute('role','status');
  el.innerHTML = `${ic('check','sm')}<span>${esc(msg)}</span>${undo ? '<button class="btn quiet">Undo</button>' : '<span></span>'}`;
  document.body.appendChild(el); if(undo) $('button', el).onclick = () => { el.remove(); undo(); };
  setTimeout(() => el.remove(), 5000);
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
    <a class="link" href="#/today">Look around without signing in</a></form>`;
  let u = 'Dan';
  $$('[data-u]').forEach(b => b.onclick = () => { u = b.dataset.u; $$('[data-u]').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#pw').focus(); });
  $('#f').onsubmit = async e => { e.preventDefault(); const err = $('#err'); err.hidden = true; $('#go').disabled = true;
    try{ const r = await api('/auth', {user:u, password:$('#pw').value}); auth = {token:r.token, user:r.user}; localStorage.setItem('sw_auth', JSON.stringify(auth)); loaded = false; calls = user() === 'Bobby' ? [] : readCache(); dirty = true; mounted = ''; go('#/today'); render(); }
    catch(x){ err.textContent = x.message; err.hidden = false; $('#go').disabled = false; $('#pw').focus(); } };
}

/* ---------------- today ---------------- */
let filter = 'all';
function readHTML(r){ return r ? `<dl class="read"><dt class="label">Strength</dt><dd class="sm">${esc(r.strength)}</dd><dt class="label">Focus</dt><dd class="sm">${esc(r.focus)}</dd><dt class="label">Try next</dt><dd class="sm">${esc(r.tryNext)}</dd></dl>`
  : `<p class="sm muted">Your coach's read appears after two logged conversations.</p>`; }
const statHTML = (n, l, prev) => `<div class="stat"><b>${n}</b><span>${l}</span>${prev != null && n > prev ? `<small>+${n - prev} vs last week</small>` : ''}</div>`;
function todayView(parts){
  const open = parts[1] ? byId(parts[1]) : null;
  if(mounted !== 'today' || dirty){
    shell('today');
    const shops = myShops(), bob = user() === 'Bobby', src = bob ? [].concat((team && team.Dan) || [], (team && team.RJ) || []).map(fromServer) : calls;
    const rows = shops.map(c => [c, state(c, src)]);
    const groups = [['due','Follow up'],['todo','To call'],['done','Done']];
    const cnt = k => rows.filter(r => r[1].k === k).length, called = rows.filter(r => r[1].k !== 'todo' || r[1].icon !== 'circle').length;
    const nums = numbers(src), q = bob ? [] : queue();
    const body = groups.filter(g => filter === 'all' || filter === g[0]).map(g => { const rs = rows.filter(r => r[1].k === g[0]); return rs.length ? `<tr class="grp"><td colspan="5">${g[1]} · ${rs.length}</td></tr>` + rs.map(([c, s]) =>
      `<tr class="item" data-id="${c.id}"><td class="c-state"><span class="state ${s.k}">${ic(s.icon,'sm')}${esc(s.label)}</span></td><td class="c-name"><a class="name" href="#/today/${c.id}">${esc(c.said)}<small>${esc(c.town)}</small></a></td><td class="c-ask">${esc(bob ? c.caller : c.ask)}</td><td class="c-lead">${TAG[c.lead]}</td><td class="c-last muted">${esc(s.last)}</td></tr>`).join('') : ''; }).join('');
    app.innerHTML = `<div class="pagehead"><h1>Today</h1>${bob ? '' : q.length ? `<a class="btn primary" href="#/call/${q[0].id}">${ic('play','sm')}Start calling</a>` : ''}</div>
      ${!auth ? `<div class="note gap">${ic('info')}<span>You're looking around as <b>${esc(guest)}</b>. <a href="#/signin">Sign in</a> to log calls.</span></div>` : ''}
      ${loadErr ? `<div class="note gap" role="status">${ic('alert-triangle')}<span>Showing this device's saved copy. ${esc(loadErr)}</span></div>` : ''}
      <div class="layout" id="lay"><div class="main stack s6">
        <section class="panel pad summary" aria-label="This week"><div class="stats">${statHTML(nums.week.dials,'Dials this week',nums.last.dials)}${statHTML(nums.week.talks,'Conversations',nums.last.talks)}${statHTML(nums.week.steps,'Next steps',nums.last.steps)}</div>${bob ? `<p class="sm muted">Both callers combined. Open Progress for each person's read.</p>` : readHTML(read(src, me()))}</section>
        <section class="panel" aria-labelledby="sh"><div class="panelhead"><div><h2 id="sh">${bob ? 'All shops' : 'My shops'}</h2><p class="sm muted">${called} of ${shops.length} called</p></div>
          <div class="seg" role="group" aria-label="Show">${[['all','All'],['due','Follow up ' + cnt('due')],['todo','To call ' + cnt('todo')],['done','Done ' + cnt('done')]].map(f => `<button aria-pressed="${filter === f[0]}" data-f="${f[0]}">${f[1]}</button>`).join('')}</div></div>
          ${body ? `<table class="list"><thead><tr><th scope="col">Status</th><th scope="col">Shop</th><th scope="col">${bob ? 'Caller' : 'Ask for'}</th><th scope="col">Lead with</th><th scope="col">Last result</th></tr></thead><tbody>${body}</tbody></table>`
            : `<div class="empty">${ic('check-circle')}<h3>Nothing here</h3><p class="sm">No shops match this filter.</p><button class="btn" data-f="all">Show all</button></div>`}
        </section></div><aside id="side" hidden></aside></div>`;
    $$('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; dirty = true; render(); });
    $$('tr.item').forEach(tr => tr.onclick = e => { if(e.target.closest('a')) return; go('#/today/' + tr.dataset.id); });
    mounted = 'today'; dirty = false;
  }
  const lay = $('#lay'), side = $('#side');
  $$('tr.item').forEach(tr => tr.setAttribute('aria-current', !!open && tr.dataset.id === open.id));
  if(!open){ if(!side.hidden){ side.hidden = true; lay.classList.remove('open'); window.scrollTo(0, lastScroll); } return; }
  if(side.hidden) lastScroll = window.scrollY;
  lay.classList.add('open'); side.hidden = false; side.className = 'panel side';
  const tab = parts[2] || 'script', list = myShops(), i = list.indexOf(open);
  side.innerHTML = `<div class="sidehead"><div class="grow"><h2 class="sm">${esc(open.said)}</h2><p class="xs muted">${i + 1} of ${list.length} · Ask for ${esc(open.ask)}</p></div>
      <a class="btn quiet icononly" aria-label="Previous shop" href="#/today/${list[(i - 1 + list.length) % list.length].id}/${tab}">${ic('arrow-left')}</a><a class="btn quiet icononly" aria-label="Next shop" href="#/today/${list[(i + 1) % list.length].id}/${tab}">${ic('arrow-right')}</a><a class="btn quiet icononly" aria-label="Close" href="#/today">${ic('x')}</a></div>
    <div class="tabs" role="tablist">${[['script','Script'],['says','If he says'],['brief','Brief']].map(t => `<button role="tab" aria-selected="${tab === t[0]}" data-tab="${t[0]}">${t[1]}</button>`).join('')}</div>
    <div class="sidebody" role="tabpanel">${shopFlags(open)}${tab === 'says' ? saysHTML(open) : tab === 'brief' ? briefHTML(open) : scriptHTML(open)}
      <div class="row wrap"><a class="btn primary grow" href="#/call/${open.id}">${ic('phone','sm')}Open call screen</a><a class="btn" href="tel:${esc(String(open.phone).replace(/[^\d]/g,''))}">${esc(open.phone)}</a></div></div>`;
  $$('[data-tab]', side).forEach(b => b.onclick = () => location.replace('#/today/' + open.id + '/' + b.dataset.tab));
  wireSteps(side);
  if(window.innerWidth <= 960) window.scrollTo(0, 0);
}
const shopFlags = c => `${c.caller && auth && user() !== 'Bobby' && c.caller !== user() ? `<p class="note bad">${ic('alert-triangle')}<span>This is ${esc(c.caller)}'s shop. Read only.</span></p>` : ''}${c.flag ? `<p class="note">${ic('alert-triangle')}<span>${esc(c.flag)}</span></p>` : ''}${c.phoneNote ? `<p class="note">${ic('info')}<span>${esc(c.phoneNote)}</span></p>` : ''}`;
function scriptHTML(c, only){
  const st = steps(c);
  return `<ol class="steps">${st.map((s,i) => `<li><button class="stephead" aria-expanded="${only == null ? i === 0 : i === only}" data-step="${i}"><span class="num">${i + 1}</span>${O.steps[i].name}</button>
    <div class="stepbody" ${(only == null ? i === 0 : i === only) ? '' : 'hidden'}>${s.lines.map(l => `<div class="say small"><p>${esc(l)}</p></div>`).join('')}${s.then ? `<p class="sm"><b>${esc(s.then)}</b></p>` : ''}</div></li>`).join('')}</ol>`;
}
function wireSteps(root){ $$('.stephead', root).forEach(b => b.onclick = () => { const openNow = b.getAttribute('aria-expanded') === 'true'; b.setAttribute('aria-expanded', !openNow); b.nextElementSibling.hidden = openNow; }); }
function saysHTML(c){
  return `<div>${S.branches.map(b => { const q = b.q && O.questions.find(x => x.key === b.q); return `<details class="d"><summary>${esc(b.label)}${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(q ? fill(q.a, c) : b.say)}</p></div><p class="sm muted">${esc(b.stop)}</p></div></details>`; }).join('')}
    <details class="d"><summary>"Who are you guys?"${ic('chevron-right','sm')}</summary><div><div class="say small"><p>${esc(D.company.line)}</p></div><div class="say small"><p>${esc((D.callers[c.caller || me()] || D.callers.Dan).line)}</p></div></div></details></div>`;
}
function briefHTML(c){
  const n = c.n, ev = S.evidence[c.lead], proof = n ? n.proof.filter(p => p.s === c.lead && !p.note).slice(0,3) : [];
  return `<dl class="kv"><dt class="label">Respect</dt><dd class="sm">${esc(c.facts[0] || c.since)}</dd>
      <dt class="label">Lead with</dt><dd class="sm"><b>${TAG[c.lead]}.</b> ${esc(whyLine(c))}</dd>
      <dt class="label">Offer</dt><dd class="sm">${esc(O.gifts[c.lead].termsShort)}</dd>
      <dt class="label">Never say</dt><dd class="sm">${esc(ev.never)}</dd>
      <dt class="label">Ask, don't assume</dt><dd class="sm">${esc((c.unknown || [])[0] || 'Who answers the phone after hours.')}</dd></dl>
    ${proof.length ? `<details class="d"><summary>Proof, for your eyes only${ic('chevron-right','sm')}</summary><div>${proof.map(p => `<p class="sm">${esc(p.t)} ${p.u ? `<a href="${esc(p.u)}" target="_blank" rel="noopener">Source</a>` : ''}</p>`).join('')}<p class="sm muted">${esc(ev.not)}</p></div></details>` : ''}
    <details class="d"><summary>About the shop${ic('chevron-right','sm')}</summary><div><p class="sm">${esc(c.since)}. ${esc(c.reviews || '')}</p><p class="sm">Hours: ${esc(c.hours)}</p><p class="sm">After hours: ${esc(c.emergency)}</p><p class="sm"><a href="${esc(c.site)}" target="_blank" rel="noopener">Their website</a> · <a href="#/systems/${c.lead}">About the ${TAG[c.lead].toLowerCase()}</a></p></div></details>`;
}

/* ---------------- call screen (focus) ---------------- */
function callView(parts){
  const c = byId(parts[1]); if(!c || c.tier === 4){ location.replace('#/today'); return; }
  const step = Math.min(4, Math.max(0, (+parts[2] || 1) - 1)), st = steps(c), q = queue(), list = myShops(), pos = list.indexOf(c);
  const done = list.filter(x => state(x).k === 'done').length, s = st[step];
  shell('today'); mounted = 'call';
  app.innerHTML = `<div class="pagehead"><a class="btn quiet" href="#/today">${ic('arrow-left','sm')}Today</a>
      <div class="progress"><span>Shop ${pos + 1} of ${list.length}</span><span class="meter" role="img" aria-label="${done} of ${list.length} done"><span style="width:${Math.round(done / Math.max(1, list.length) * 100)}%"></span></span></div></div>
    <div class="focus"><div class="stack s6">
      <div class="row between wrap"><div><h1>${esc(c.said)}</h1><p class="sm muted">${esc(c.town)} · Ask for <b>${esc(c.ask)}</b></p></div><a class="btn primary" href="tel:${esc(String(c.phone).replace(/[^\d]/g,''))}">${ic('phone','sm')}Call ${esc(c.phone)}</a></div>
      ${shopFlags(c)}
      <section class="panel pad stack" aria-live="polite">
        <div class="row between"><p class="label">Step ${step + 1} of 5</p><div class="dots" aria-hidden="true">${[0,1,2,3,4].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div></div>
        <h2 id="steph" tabindex="-1">${O.steps[step].name}</h2>
        ${s.lines.map(l => `<div class="say"><p>${esc(l)}</p></div>`).join('')}
        ${s.then ? `<p class="sm"><b>${esc(s.then)}</b></p>` : ''}
        <div class="row between">${step ? `<button class="btn" data-go="${step}">${ic('arrow-left','sm')}${O.steps[step - 1].name}</button>` : '<span></span>'}${step < 4 ? `<button class="btn" data-go="${step + 2}">${O.steps[step + 1].name}${ic('arrow-right','sm')}</button>` : '<span></span>'}</div>
      </section>
      <section class="panel pad"><dl class="kv"><dt class="label">Lead with</dt><dd class="sm"><b>${TAG[c.lead]}.</b> ${esc(whyLine(c))}</dd><dt class="label">Never say</dt><dd class="sm">${esc(S.evidence[c.lead].never)}</dd></dl></section>
    </div>
    <aside class="panel pad" aria-labelledby="sy"><h2 id="sy" class="sm">If he says</h2>${saysHTML(c)}</aside></div>
    ${canLog() && c.caller === user() ? `<div class="callbar glass" role="group" aria-label="Log this call">${Object.keys(QUICK).filter(k => k !== 'wrong').map(k => `<button class="btn" data-q="${k}" aria-label="${QUICK[k][1]}">${ic(QUICK[k][0])}<span class="long">${QUICK[k][1]}</span><span class="short">${k === 'office' ? 'Office' : QUICK[k][1]}</span></button>`).join('')}<button class="btn primary" data-talk aria-label="Talked to him">${ic('message')}<span class="long">Talked to him</span><span class="short">Talked</span></button></div>`
      : `<div class="callbar glass one"><a class="btn" href="#/signin">${auth ? 'Read only' : 'Sign in to log this call'}</a></div>`}`;
  $$('[data-go]').forEach(b => b.onclick = () => { location.replace('#/call/' + c.id + '/' + b.dataset.go); });
  const nextShop = () => { const nq = queue().filter(x => x.id !== c.id); const i = q.findIndex(x => x.id === c.id); const nx = nq.length ? (q.slice(i + 1).find(x => nq.includes(x)) || nq[0]) : null; return nx; };
  $$('[data-q]').forEach(b => b.onclick = () => {
    const k = b.dataset.q, call = {id:newId(), caller:user(), shop:c.id, shopName:c.said, at:new Date().toISOString(), kind:'quick', outcome:k, stage:0, turn:'', next:k === 'office' ? {action:'Call back and ask for ' + c.ask, date:addDays(1)} : {}};
    save(call); const nx = nextShop();
    toast(QUICK[k][1] + ' logged for ' + c.said, async () => { await remove(call.id); location.replace('#/call/' + c.id); render(); });
    if(nx) location.replace('#/call/' + nx.id); else go('#/today');
  });
  const tb = $('[data-talk]'); if(tb) tb.onclick = () => { const call = {id:newId(), caller:user(), shop:c.id, shopName:c.said, at:new Date().toISOString(), kind:'talk', outcome:'', stage:step + 1, turn:'', line:'', next:{}}; calls.push(call); writeCache(); go('#/call/' + c.id + '/' + (step + 1) + '/log/' + call.id); };
  if(parts[3] !== 'log'){ const h = $('#steph'); if(h && document.activeElement && document.activeElement.dataset && document.activeElement.dataset.go) h.focus(); }
}

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
    if(base.startsWith('#/call')){ const q = queue().filter(x => x.id !== c.shop); toast('Logged: ' + outLabel(c)); if(q.length) location.replace('#/call/' + q[0].id); else location.replace('#/today'); }
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
    ${!list.length ? `<div class="panel empty">${ic('phone')}<h3>No calls logged yet</h3><p class="sm">${bob ? esc(name) + ' has not logged a call.' : 'Log your first call and this page fills in.'}</p>${bob ? '' : '<a class="btn primary" href="#/today">Go to Today</a>'}</div>` : `
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

/* ---------------- router ---------------- */
async function render(){
  const raw = (location.hash || '#/today').slice(2), li = raw.indexOf('/log/');
  const base = li >= 0 ? raw.slice(0, li) : raw, logId = li >= 0 ? raw.slice(li + 5) : (raw.startsWith('progress/log/') ? '' : '');
  const p = base.split('/');
  $$('.sheetwrap').forEach(x => x.remove());
  if(p[0] === 'signin'){ mounted = 'signin'; signinView(); return; }
  if(auth && !loaded){ shell(p[0]); app.innerHTML = loadingHTML; await ensure(); dirty = true; mounted = ''; }
  if(p[0] === 'call') callView(p);
  else if(p[0] === 'systems') systemsView(p);
  else if(p[0] === 'progress'){ if(mounted !== 'progress' || dirty || !logId){ progressView(p); dirty = false; } }
  else todayView(['today', p[1], p[2]]);
  if(logId){ const bob = user() === 'Bobby'; logSheet(logId, '#/' + base, bob, bob ? ((team && team[who]) || []).map(fromServer) : null); }
  document.title = ({today:'Today', call:'Call', systems:'Systems', progress:'Progress'}[p[0]] || 'Today') + ' · StarWell Call Decks';
}
window.addEventListener('hashchange', render);
render();
})();
