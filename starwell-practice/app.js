/* StarWell Practice Line: app logic */
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function toast(msg, ms){ const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), ms || 3200); }

/* ---------- seeded randomness: every call is different ---------- */
function rng(seed){ let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
const pick = (r, a) => a[Math.floor(r()*a.length)];
function pickW(r, w, not){ const ks = Object.keys(w).filter(k => !(not || []).includes(k)); let tot = 0; for(const k of ks) tot += w[k]; let x = r()*tot; for(const k of ks){ x -= w[k]; if(x <= 0) return k; } return ks[0]; }
function shuffle(r, a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(r()*(i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fill(t, p){ return t.replace(/\{(\w+)\}/g, (m, k) => p.vars[k] ?? m); }

/* ---------- people ---------- */
let me = LS.get('sw_cc_me', '');
const histKey = () => 'sw_pl_hist_' + (me || 'guest');
const hist = () => LS.json(histKey(), []);
function saveHist(h){ LS.set(histKey(), JSON.stringify(h.slice(-40))); }

/* ---------- persona generator ---------- */
const AFTER_LABEL = {voicemail:'voicemail', service:'an answering service that takes messages', cell:"the owner's cell phone", none:'nowhere, it just rings'};
const SITE_ISSUES = ['no way to book online after hours','phone number isn\'t tap-to-call on a phone','footer still says © 2019','no page for heat pumps or Energize CT rebates','slow to load on a phone','no pages for the nearby towns they serve'];
const POSTS = ['March','last June','2023','last spring','August'];
const REVIEW_TPL = [
  '{tech} came out on a Sunday when our boiler quit. Explained everything and didn\'t upsell. Fair price.',
  'Called at 7am with no heat, {tech} was here by 10. Professional and clean.',
  'Third year using them for our oil burner tune-up. Always on time.',
  'They installed a ductless mini-split and walked us through the Energize CT rebate. Great experience.',
  'Hard to reach after hours, but once {tech} got here he fixed it fast.',
  'Honest company. Told us we didn\'t need a new furnace yet.'
];
function makePersona(opt){
  opt = opt || {};
  const seed = opt.seed || (Date.now() ^ Math.floor(Math.random()*1e9)) >>> 0;
  const r = rng(seed);
  const recent = LS.json('sw_pl_recent', []);
  let pool = opt.pool || Object.keys(ARCH);
  const fresh = pool.filter(k => !recent.includes(k));
  const arch = opt.arch || pick(r, fresh.length ? fresh : pool);
  LS.set('sw_pl_recent', JSON.stringify([arch, ...recent].slice(0, 3)));
  const A = ARCH[arch];
  const b = opt.brief || {};
  const town = b.town || pick(r, TOWNS);
  const ownerFirst = (b.owner || pick(r, MEN)).split(' ')[0];
  const last = pick(r, LAST);
  const gk = !!A.gk;
  const gkName = gk ? pick(r, WOMEN) : '';
  const s = {last, town, first:ownerFirst, r3:Math.floor(r()*3)};
  const shop = b.shop || pick(r, SHOP_PATTERNS)(s);
  const afterKeys = Object.keys(A.reveal);
  const after = b.after ? ({'Voicemail':'voicemail','Answering service':'service',"Owner's cell":'cell'}[b.after] || pick(r, afterKeys)) : pick(r, afterKeys);
  const techs = 3 + Math.floor(r()*14);
  const tech = pick(r, TECHS);
  const facts = {
    since: ((b.since || '').match(/(18|19|20)\d\d/) || [])[0] || String(1965 + Math.floor(r()*50)),
    techs, trucks: techs + Math.floor(r()*3),
    services: shuffle(r, SERVICES).slice(0, 3),
    close: pick(r, ['4:30','5:00','5:30']),
    after, afterLabel: AFTER_LABEL[after],
    rating: (4.5 + Math.floor(r()*5)/10).toFixed(1),
    reviews: 40 + Math.floor(r()*380),
    tech,
    siteIssues: shuffle(r, SITE_ISSUES).slice(0, 2),
    lastPost: arch === 'modernizer' ? 'two weeks ago (on Instagram)' : (b.social || pick(r, POSTS)),
    hiring: b.hiring ? !/^\s*(no|none|not|n\/a|-)\b/i.test(String(b.hiring)) && !!String(b.hiring).trim() : r() < 0.4,
    aiCheck: pick(r, [`When you ask ChatGPT for furnace repair in ${town}, two other shops come up first.`, `They show up third on the Google map for "boiler repair ${town}".`, `Google's AI summary for "no heat ${town}" names a competitor.`])
  };
  if((after === 'cell' || after === 'service') && facts.siteIssues.includes(SITE_ISSUES[0])) facts.siteIssues[facts.siteIssues.indexOf(SITE_ISSUES[0])] = SITE_ISSUES.slice(1).find(x => !facts.siteIssues.includes(x));
  const lead = (after === 'voicemail' || after === 'none' || after === 'service') ? 'phone' : facts.siteIssues.includes(SITE_ISSUES[0]) ? 'site' : 'found';
  const objections = [];
  objections.push(pickW(r, A.objections));
  if(r() < 0.6) objections.push(pickW(r, A.objections, objections));
  const day = pick(r, DAYS), time = pick(r, TIMES);
  const am = time.startsWith('7');
  const p = {
    seed, arch, gender:A.gender, gk, shop, town, owner: ownerFirst + ' ' + last, onLine: gk ? gkName : ownerFirst,
    age: A.ages[0] + Math.floor(r()*(A.ages[1] - A.ages[0])),
    situation: gk ? {where:'at the front desk', noise:'(phones ringing in the office)'} : pick(r, SITUATIONS),
    facts, lead, objections, day, time,
    rate: A.rate + (r() - 0.5)*0.08, pitchMul: A.pitch + (r() - 0.5)*0.1,
    painLine: fillRaw(pick(r, A.pain), {owner:ownerFirst}),
    email: (gk ? 'office' : ownerFirst.toLowerCase()) + '@' + (() => { let d = shop.toLowerCase().replace(/&| and |heating|cooling|\bair\b|'s|hvac|brothers|sons/g, ' ').replace(/[^a-z]/g, '').slice(0, 16); if(!d || d === ownerFirst.toLowerCase()) d = last.toLowerCase() + 'hvac'; return d; })() + '.com',
    reviewsList: shuffle(r, REVIEW_TPL).slice(0, 2).map(t => t.replace('{tech}', tech)),
    brief: opt.brief ? true : false,
    trueThing: (b.true || '').trim().replace(/[.!]+$/, ''), compliment: (b.comp || '').trim().replace(/[.!]+$/, '')
  };
  p.voices = Voice.pickVoices(p);
  p.vars = {name:p.onLine, owner:ownerFirst, shop, town, me: me || 'teammate', tech, day, time,
            close: facts.close, rating: facts.rating, reviews: facts.reviews,
            when: am ? 'before the trucks go out' : 'after the trucks come back', gk: gkName};
  p.answer = fill(pick(r, A.answer), p);
  p.r = r;
  return p;
}
function fillRaw(t, v){ return t.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m); }

/* the three "one true thing" lines and other stage options for this persona */
function optionsFor(stage, p, objKey){
  const r = p.r, f = p.facts;
  if(stage === 'opener') return [
    {q:'best', t:fill(pick(r, LINES.opener.best), p)}, {q:'ok', t:fill(LINES.opener.ok[0], p)}, {q:'weak', t:fill(LINES.opener.weak[0], p)}];
  if(stage === 'truth'){
    const facts = {
      phone:`Your site says the office closes at ${f.close}, and I didn't see a way to reach anyone after that. I'm curious how evening no-heat calls get handled.`,
      site:`I noticed your website doesn't have a way to book after hours, and you've got ${f.reviews} great reviews. I'm curious how people book with you at night.`,
      found:`I asked my phone for furnace repair in ${p.town}, and two other shops came up before ${p.shop}, even though your reviews are better. I'm curious how most people find you.`};
    const best = p.trueThing ? `${p.trueThing}. I'm curious how that's been going.` : facts[p.lead];
    return [{q:'best', t:best}, {q:'ok', t:p.compliment ? p.compliment + '. Nice work.' : `Your reviews are great, ${f.rating} stars, and people keep mentioning ${f.tech}. Nice work.`}, {q:'weak', t:LINES.truth.weak[0]}];
  }
  if(stage === 'discover'){
    const best = {phone:pick(r, LINES.discover.best),
      site:'Last week, when people found you online at night, how did they actually reach you?',
      found:'When new customers called last week, how did most of them say they found you?'}[p.lead];
    return [{q:'best', t:best}, {q:'ok', t:LINES.discover.ok[0]}, {q:'weak', t:pick(r, LINES.discover.weak)}];
  }
  if(stage === 'gift') return [{q:'best', t:fill(LINES.gift.best[p.lead], p) + (p.lead === 'site' ? '' : ' It\'s free, and it\'s yours to keep.')}, {q:'ok', t:LINES.gift.ok[0]}, {q:'weak', t:LINES.gift.weak[0]}];
  if(stage === 'handle'){ const o = OBJ[objKey]; return [{q:'best', t:fill(o.best, p)}, {q:'ok', t:fill(o.ok, p)}, {q:'weak', t:fill(o.weak, p)}]; }
  if(stage === 'close') return [{q:'best', t:fill(LINES.close.best[0], p).replace('before the trucks go out', p.vars.when)}, {q:'ok', t:LINES.close.ok[0]}, {q:'weak', t:LINES.close.weak[0]}];
  if(stage === 'wrap'){ const w = LINES.wrap[objKey === 'yes' ? 'yes' : 'no']; return [{q:'best', t:fill(w.best, p)}, {q:'ok', t:fill(w.ok, p)}, {q:'weak', t:fill(w.weak, p)}]; }
  return [];
}

/* ---------- free-talk classifier (used when the AI owner isn't available, and for live scoring) ---------- */
const has = (t, re) => re.test(t);
function classify(stage, text, p, objKey){
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9$' ]/g, ' ') + ' ';
  const pressure = /sign up|sign you up|today only|lock in|deal|discount|you need to|you'd be crazy|guarantee|10x|ten times/;
  const jargon = /\b(ai|geo|aeo|seo|algorithm|leads|optimization|automation)\b/;
  const critic = /outdated|old fashioned|terrible|ugly|bad website|looks old|behind the times|dying/;
  const question = /\b(how|what|when|who|where|do you|did you|are you|is it|have you|does)\b/;
  if(stage === 'opener'){
    if(has(t, /bad time|catch you at|is this the owner/)) return 'weak';
    const sw = has(t, /star ?well/), why = has(t, /reason|noticed|calling because|looking at|saw|cold call/);
    if(sw && why) return 'best';
    return sw || why ? 'ok' : 'weak';
  }
  if(stage === 'truth'){
    if(has(t, critic)) return 'weak';
    const f = p.facts, keys = [f.close.replace(':', ' '), f.close, 'book', 'after hours', 'after you close', 'reviews', f.tech.toLowerCase(), 'facebook', 'instagram', 'website', 'google', 'chatgpt', p.town.toLowerCase(), String(f.reviews), f.rating];
    const n = keys.filter(k => t.includes(k.toLowerCase())).length;
    if(n >= 2 && has(t, /curious|wonder|how|noticed|saw/)) return 'best';
    return n >= 1 ? 'ok' : 'weak';
  }
  if(stage === 'discover'){
    if(has(t, /would you be interested|interested in|want more|losing a ton|probably losing/)) return 'weak';
    if(has(t, question) && has(t, /last week|last night|last time|this week|yesterday|recently|saturday|sunday|cold night|cold snap|first cold/)) return 'best';
    return has(t, question) ? 'ok' : 'weak';
  }
  if(stage === 'gift'){
    if(has(t, pressure) || (t.match(jargon) || []).length >= 1 && has(t, /geo|aeo|algorithm|leads|10x|ten times/)) return 'weak';
    const items = ['website', 'seo', 'social', 'phone', 'search', 'google', 'facebook', 'demo line', 'answering'].filter(k => t.includes(k)).length;
    if(items >= 4) return 'ok';
    return has(t, /free|yours|keep it|separate|test number|show you/) ? 'best' : 'ok';
  }
  if(stage === 'handle'){
    if(has(t, pressure) || has(t, critic) || has(t, /fall behind|everyone's using|everyone is using|we have data|we have a lot of data/)) return 'weak';
    const good = {catch:/new to connecticut|new to|rather show|show you|yours either way|stays yours|it's yours/, price:/300|three hundred|400|four hundred|in writing|free/,
      allset:/after five|after hours|who picks|who answers|covered/, email:/(monday|tuesday|wednesday|thursday|friday|morning|afternoon|7|seven)/,
      busy:/(monday|tuesday|wednesday|thursday|friday|later|morning|email)/, ai:/separate|test number|nothing touches|say yes|your phones/,
      agency:/sorry|frustrating|free first|your own numbers|stays yours/, wordofmouth:/best kind|look you up|neighbor|referral/,
      scam:/website|google listing|look us up|nothing to pay|connecticut company/}[objKey];
    return good && has(t, good) ? 'best' : 'ok';
  }
  if(stage === 'close'){
    if(has(t, pressure) || has(t, /contract|commit/)) return 'weak';
    const email = has(t, /email/), when = has(t, /monday|tuesday|wednesday|thursday|friday|tomorrow|\b\d{1,2}(:\d\d)?\b|morning|evening|afternoon/);
    return email && when ? 'best' : (email || has(t, /send|information|info/)) ? 'ok' : 'weak';
  }
  if(stage === 'wrap'){
    if(has(t, /are you sure|crazy|but it's free|just think/)) return 'weak';
    return has(t, /thank|thanks|appreciate|have a great|take care|stay warm/) ? 'best' : 'ok';
  }
  return 'ok';
}

/* ======================================================================
   CALL STATE
   ====================================================================== */
let C = null;      // the current call
/* every open turn registers a cleanup here; End runs them all */
function onAbort(fn){ if(C) (C.aborts = C.aborts || []).push(fn); }
function offAbort(fn){ if(C && C.aborts) C.aborts = C.aborts.filter(x => x !== fn); }
const STAGE_ORDER = ['opener','truth','discover','gift','handle','close','wrap'];
const OPT_COLORS = [['--o1','#2563eb'],['--o2','#d97706'],['--o3','#7c3aed']];

function newCall(kind, p, extra){
  return Object.assign({kind, p, trust:ARCH[p.arch].base, turns:[], log:[], stageQ:{}, t0:0, ended:false, held:false, muted:false,
    outcome:null, ownerSecs:0, objIdx:0, retries:0, toldFast:false, stage:'opener', id:'c' + Date.now()}, extra || {});
}

/* ---------- capture: per-turn recording + voice metrics ---------- */
const Cap = {
  rec:null, chunks:[], frames:[], iv:null, t0:0, mime:'',
  start(){
    this.frames = []; this.chunks = []; this.t0 = performance.now();
    if(AE.micAn) this.iv = setInterval(() => { const f = AE.frame(); f.t = performance.now() - this.t0; this.frames.push(f); }, 50);
    if(AE.mic && window.MediaRecorder){
      const types = ['audio/webm;codecs=opus','audio/mp4','audio/webm','audio/ogg'];
      this.mime = types.find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) || '';
      try{ this.rec = new MediaRecorder(AE.mic, this.mime ? {mimeType:this.mime} : undefined); this.rec.ondataavailable = e => e.data.size && this.chunks.push(e.data); this.rec.start(); }catch(e){ this.rec = null; }
    }
  },
  async stop(){
    clearInterval(this.iv); this.iv = null;
    const frames = this.frames; let url = '';
    if(this.rec && this.rec.state !== 'inactive'){
      await new Promise(res => { this.rec.onstop = res; try{ this.rec.stop(); }catch(e){ res(); } });
      if(this.chunks.length) url = URL.createObjectURL(new Blob(this.chunks, {type:this.mime || 'audio/webm'}));
    }
    this.rec = null;
    return {frames, url, ms:performance.now() - this.t0};
  },
  cancel(){ clearInterval(this.iv); this.iv = null; try{ this.rec && this.rec.state !== 'inactive' && this.rec.stop(); }catch(e){} this.rec = null; }
};
const Full = {   // whole-call recording (both voices) for playback
  rec:null, chunks:[], url:'',
  start(){ this.url = ''; this.chunks = []; if(!AE.mix || !window.MediaRecorder) return; try{ this.rec = new MediaRecorder(AE.mix.stream); this.rec.ondataavailable = e => e.data.size && this.chunks.push(e.data); this.rec.start(1000); }catch(e){ this.rec = null; } },
  async stop(){ if(!this.rec) return ''; await new Promise(res => { this.rec.onstop = res; try{ this.rec.stop(); }catch(e){ res(); } }); this.rec = null; this.url = this.chunks.length ? URL.createObjectURL(new Blob(this.chunks, {type:this.chunks[0].type || 'audio/webm'})) : ''; return this.url; }
};

function metrics(frames, text, isQuestion){
  const v = frames.filter(f => f.db > -50);
  const out = {voiced:0, wpm:0, st:0, rise:0, trail:0, db:-60, words:(text.match(/[a-z0-9$']+/gi) || []).length};
  if(v.length < 6) return out;
  out.voiced = (v[v.length - 1].t - v[0].t)/1000;
  out.firstVoiceMs = v[0].t;
  if(out.voiced > 1.5 && out.words > 3) out.wpm = Math.round(out.words/(out.voiced/60));
  out.db = v.reduce((a, f) => a + f.db, 0)/v.length;
  const f0 = v.filter(f => f.f0 > 70 && f.f0 < 400).map(f => f.f0);
  if(f0.length > 8){
    const sorted = f0.slice().sort((a, b) => a - b), med = sorted[Math.floor(sorted.length/2)];
    const sts = f0.map(f => 12*Math.log2(f/med)).filter(x => Math.abs(x) < 12);
    const mean = sts.reduce((a, b) => a + b, 0)/sts.length;
    out.st = Math.sqrt(sts.reduce((a, b) => a + (b - mean)**2, 0)/sts.length);
    const tail = f0.slice(-Math.max(3, Math.floor(f0.length*0.15))), body = f0.slice(Math.floor(f0.length*0.3), Math.floor(f0.length*0.7));
    const md = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length/2)]; };
    if(body.length > 2 && !isQuestion) out.rise = 12*Math.log2(md(tail)/md(body));
  }
  const n = v.length, head = v.slice(0, Math.floor(n*0.5)), end = v.slice(Math.floor(n*0.8));
  const avg = a => a.reduce((x, f) => x + f.db, 0)/Math.max(1, a.length);
  out.trail = avg(end) - avg(head);
  return out;
}

/* ---------- speech recognition with word glow ---------- */
const SRC = window.SpeechRecognition || window.webkitSpeechRecognition;
const NUMWORDS = /^(zero|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|forty|fifty|hundred|thousand|\d+[\d:,.]*)$/;
const norm = w => w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9':]/g, '').replace(/'s$/, '').replace(/^'+|'+$/g, '');
function lev(a, b){ const m = a.length, n = b.length; if(!m || !n) return Math.max(m, n); let prev = Array.from({length:n + 1}, (_, j) => j); for(let i = 1; i <= m; i++){ const cur = [i]; for(let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; } return prev[n]; }
function same(t, r){
  if(!t || !r) return false;
  if(t === r) return true;
  if(/\d/.test(t) && NUMWORDS.test(r)) return true;
  if(t.length >= 4 && r.length >= 3 && 1 - lev(t, r)/Math.max(t.length, r.length) >= 0.72) return true;
  return false;
}
function align(targets, heard){
  const lit = new Set(); let j = 0;
  for(let i = 0; i < heard.length && j < targets.length; i++){
    for(let k = j; k < Math.min(targets.length, j + 5); k++){
      if(same(targets[k], heard[i]) || (heard[i + 1] && same(targets[k], heard[i] + heard[i + 1]))){
        if(heard[i + 1] && !same(targets[k], heard[i]) && same(targets[k], heard[i] + heard[i + 1])) i++;
        lit.add(k); j = k + 1; break;
      }
    }
  }
  return lit;
}
const Listen = {
  sr:null, on:false, base:'', fin:'', interim:'', cb:null,
  start(cb){ this.cb = cb; this.base = ''; this.fin = ''; this.interim = ''; this.on = true; return this._go(); },
  _go(){
    if(!SRC) return false;
    const sr = new SRC(); sr.lang = 'en-US'; sr.continuous = true; sr.interimResults = true;
    sr.onresult = e => {
      if(sr !== this.sr) return;
      let fin = '', int = '';
      for(let i = 0; i < e.results.length; i++){ const x = e.results[i]; if(x.isFinal) fin += x[0].transcript + ' '; else int += x[0].transcript + ' '; }
      this.fin = fin; this.interim = int;
      this.cb && this.cb((this.base + ' ' + fin + ' ' + int).replace(/\s+/g, ' ').trim(), !int);
    };
    sr.onerror = e => {
      diag('Speech recognition: ' + e.error);
      if(e.error === 'no-speech' || e.error === 'aborted') return;
      this.errs = (this.errs || 0) + 1;
      if(e.error === 'not-allowed' || e.error === 'service-not-allowed' || this.errs > 3){ this.on = false; this.dead = true; }
    };
    sr.onend = () => {
      if(sr !== this.sr || !this.on) return;
      this.base = (this.base + ' ' + this.fin + ' ' + this.interim).trim(); this.fin = ''; this.interim = '';
      setTimeout(() => { if(this.on && sr === this.sr) this._go(); }, 150 + 400*(this.errs || 0));
    };
    this.sr = sr; try{ sr.start(); }catch(e){}
    return true;
  },
  stop(){ this.on = false; const s = this.sr; this.sr = null; try{ s && s.stop(); }catch(e){} return (this.base + ' ' + this.fin + ' ' + this.interim).replace(/\s+/g, ' ').trim(); }
};

/* ======================================================================
   CALL SCREEN UI
   ====================================================================== */
function showCall(c){
  const p = c.p;
  $('#call').classList.remove('hidden');
  $('#cMode').textContent = c.drill ? 'Drill' : {guided:'Guided', free:'Test call', live:'Live test'}[c.kind];
  $('#cSub').textContent = c.kind === 'live' ? 'Live AI owner' : 'Practice line';
  $('#cShop').textContent = p.shop;
  $('#cOwner').textContent = p.gk ? `${p.onLine}, office manager` : `${p.owner}, owner`;
  $('#cAv').textContent = p.onLine[0];
  $('#cAv').style.background = ['#a3a3a3','#8b9bb4','#b4a08b','#9bb48b','#b48b9b'][p.seed % 5];
  $('#cap').innerHTML = ''; $('#opts').classList.add('hidden'); $('#say').classList.add('hidden');
  $('#hint').classList.add('hidden'); $('#sheet').classList.add('hidden');
  $('.trust').classList.toggle('hidden', c.kind === 'live' || c.kind === 'free');
  $('#cTime').textContent = 'Calling…';
  ['#bMute','#bHold'].forEach(s => $(s).classList.remove('on'));
  setTrust(c);
}
function setTrust(c){ $('#cTrust').style.width = Math.max(4, Math.min(100, c.trust)) + '%'; }
function addLine(who, text, cls, color){
  const d = document.createElement('div');
  d.className = 'ln ' + (cls || (who === 'o' ? 'o' : 'c'));
  const name = who === 'o' ? C.p.onLine : (me || 'You');
  const noise = text.match(/^\(.*?\)\s*/);
  d.innerHTML = (who !== 'sys' ? `<span class="sp">${esc(name)}</span>` : '') + (noise ? `<span class="noise">${esc(noise[0])}</span>` : '') + esc(noise ? text.slice(noise[0].length) : text);
  if(color) d.style.color = color;
  $('#cap').appendChild(d); $('#cap').scrollTop = 1e6;
  return d;
}
let clockIv = null;
function startClock(){ C.t0 = Date.now(); clearInterval(clockIv); clockIv = setInterval(() => { if(!C) return; const s = Math.floor((Date.now() - C.t0)/1000); $('#cTime').textContent = String(Math.floor(s/60)).padStart(2, '0') + ':' + String(s%60).padStart(2, '0'); }, 500); }

async function ring(){
  const c = AE.init(), t = c.currentTime + 0.05;
  [0, 0.5, 2.4, 2.9].forEach(off => {
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + off); g.gain.exponentialRampToValueAtTime(0.06, t + off + 0.02); g.gain.setValueAtTime(0.06, t + off + 0.38); g.gain.exponentialRampToValueAtTime(0.0001, t + off + 0.42);
    [440, 480].forEach(fq => { const o = c.createOscillator(); o.frequency.value = fq; o.connect(g); o.start(t + off); o.stop(t + off + 0.45); });
    g.connect(c.destination);
  });
  await sleep(3500);
}

/* the owner speaks one line */
async function ownerSays(text){
  if(!C || C.ended) return;
  const line = addLine('o', text);
  $('#cAv').classList.add('talk');
  const t0 = performance.now();
  C.log.push({who:'o', text, at:Date.now() - C.t0});
  const c = C;
  for(;;){
    c.sayCut = false;
    await Voice.say(text.replace(/^\(.*?\)\s*/, ''), c.p, prov => { line.dataset.v = prov; });
    if(!c.sayCut || c.ended) break;
    $('#cAv').classList.remove('talk');
    while(c.held && !c.ended) await sleep(250);      // on hold: repeat the line when you come back
    if(c.ended) break;
    $('#cAv').classList.add('talk');
  }
  c.ownerSecs += (performance.now() - t0)/1000;
  $('#cAv').classList.remove('talk');
  while(c.held && !c.ended) await sleep(250);
}

/* ---------- guided turn: pick one of three, then say it ---------- */
function chooseOption(stage, objKey){
  return new Promise(resolve => {
    const opts = shuffle(C.p.r, optionsFor(stage, C.p, objKey));
    const box = $('#opts');
    box.innerHTML = `<div class="lbl">Choose your line, then say it out loud</div>` + opts.map((o, i) =>
      `<button class="opt" data-i="${i}" style="${OPT_COLORS[i][0]}:${OPT_COLORS[i][1]};--oc:${OPT_COLORS[i][1]}"><span class="k">Option ${'ABC'[i]}</span>${esc(o.t)}</button>`).join('');
    box.classList.remove('hidden'); $('#cap').scrollTop = 1e6;
    const abort = () => { box.classList.add('hidden'); box.onclick = null; resolve(null); };
    onAbort(abort);
    box.onclick = e => {
      const b = e.target.closest('.opt'); if(!b || C.held) return;
      const o = opts[+b.dataset.i]; box.classList.add('hidden'); box.onclick = null; offAbort(abort);
      resolve(Object.assign({color:OPT_COLORS[+b.dataset.i][1]}, o));
    };
  });
}
function sayIt(opt){
  return new Promise(resolve => {
    const words = opt.t.split(/\s+/);
    const targets = words.map(norm);
    const box = $('#say');
    box.style.setProperty('--oc', opt.color);
    box.innerHTML = `<div class="sayline">${words.map((w, i) => `<span class="w" data-i="${i}">${esc(w)}</span>`).join(' ')}</div>
      <div class="saybar"><span id="sayState">Listening… say it out loud</span><div class="lvl"><i id="sayLvl"></i></div>
      <button class="btn light" id="sayBack">Pick another</button><button class="btn black" id="sayDone">Done</button></div>`;
    box.classList.remove('hidden');
    const spans = [...box.querySelectorAll('.w')];
    let lit = new Set(), lastChange = performance.now(), heard = '', finished = false;
    const paint = () => spans.forEach((s, i) => { s.classList.toggle('lit', lit.has(i)); s.classList.toggle('nx', !lit.has(i) && i === Math.max(-1, ...lit) + 1); });
    paint();
    const lvlIv = setInterval(() => { const f = AE.frame(); $('#sayLvl') && ($('#sayLvl').style.width = Math.max(0, Math.min(100, (f.db + 60)*1.8)) + '%'); }, 70);
    Cap.start();
    const srOk = !C.noMic && Listen.start((txt) => {
      if(C.muted || C.held) return;
      heard = txt;
      const n = align(targets, txt.split(/\s+/).map(norm).filter(Boolean));
      if(n.size !== lit.size){ lit = n; lastChange = performance.now(); paint(); }
    });
    let est = null;
    if(!srOk){   // no speech recognition: glow at a natural reading pace as a guide
      $('#sayState').textContent = 'Say it out loud, then tap Done';
      let k = 0; est = setInterval(() => { if(C.noMic || AE.frame().db > -48){ lit.add(k++); paint(); } if(k >= spans.length) clearInterval(est); }, 330);
    }
    const auto = setInterval(() => {
      const ratio = lit.size/targets.length, quiet = performance.now() - lastChange;
      if(srOk && !C.muted && ((ratio >= 0.85 && quiet > 900) || (ratio >= 0.7 && quiet > 4000))) done();
    }, 200);
    const abort = () => { if(finished) return; finished = true; cleanup(); Listen.stop(); Cap.cancel(); box.classList.add('hidden'); resolve(null); };
    onAbort(abort);
    const cleanup = () => { clearInterval(lvlIv); clearInterval(auto); clearInterval(est); offAbort(abort); };
    async function done(){
      if(finished) return; finished = true; cleanup();
      const said = Listen.stop() || heard;
      const capd = await Cap.stop();
      box.classList.add('hidden');
      resolve({said, lit:lit.size, total:targets.length, missed:words.filter((w, i) => !lit.has(i)).map(w => w.replace(/[^\w'$:]/g, '')).filter(w => w.length > 2), cap:capd, srOk});
    }
    $('#sayDone').onclick = done;
    $('#sayBack').onclick = () => { if(finished) return; finished = true; cleanup(); Listen.stop(); Cap.cancel(); box.classList.add('hidden'); resolve({back:true}); };
  });
}

/* ---------- free-talk turn (no options) ---------- */
function freeTurn(){
  return new Promise(resolve => {
    const box = $('#say');
    box.style.setProperty('--oc', '#2563eb');
    box.innerHTML = `<div class="saybar"><span id="sayState">Your turn. Talk naturally.</span><div class="lvl"><i id="sayLvl"></i></div><button class="btn black" id="sayDone">Done</button></div>`;
    box.classList.remove('hidden');
    const live = addLine('c', '…'); live.style.opacity = .6;
    let heard = '', spoke = false, lastVoice = 0, finished = false;
    const readyAt = performance.now();
    Cap.start();
    const srOk = Listen.start(txt => { if(C.muted || C.held) return; heard = txt; live.lastChild.textContent = txt || '…'; $('#cap').scrollTop = 1e6; });
    const abort = () => { if(finished) return; finished = true; clearInterval(iv); Listen.stop(); Cap.cancel(); box.classList.add('hidden'); live.remove(); resolve(null); };
    onAbort(abort);
    const iv = setInterval(() => {
      if(C.muted || C.held){ lastVoice = performance.now(); return; }
      const f = AE.frame();
      $('#sayLvl') && ($('#sayLvl').style.width = Math.max(0, Math.min(100, (f.db + 60)*1.8)) + '%');
      if(f.db > -46){ spoke = true; lastVoice = performance.now(); }
      if(spoke && performance.now() - lastVoice > 1500 && (heard.trim() || !srOk)) done();
    }, 80);
    async function done(){
      if(finished) return; finished = true; clearInterval(iv); offAbort(abort);
      const said = (Listen.stop() || heard).trim();
      const capd = await Cap.stop();
      box.classList.add('hidden');
      live.remove();
      resolve({said, cap:capd, readyMs:0, srOk});
    }
    $('#sayDone').onclick = done;
  });
}

/* ---------- one caller turn in guided / free / drill ---------- */
async function callerTurn(stage, objKey){
  C.stage = stage;
  if(C.kind === 'free'){
    const res = await freeTurn();
    if(!res || !C || C.ended) return null;
    const said = res.said || '(not heard)';
    const q = res.said ? classify(stage, said, C.p, objKey) : 'weak';
    const m = metrics(res.cap.frames, said, /\?$/.test(said));
    const turn = {stage, objKey, q, text:said, said, url:res.cap.url, m, latency:m.firstVoiceMs || 0};
    C.turns.push(turn); addLine('c', said); C.log.push({who:'c', text:said, at:Date.now() - C.t0, turn:C.turns.length - 1});
    return turn;
  }
  for(;;){
    const opt = await chooseOption(stage, objKey);
    if(!opt || !C || C.ended) return null;
    const res = await sayIt(opt);
    if(!res || !C || C.ended) return null;
    if(res.back) continue;   // picked another line
    const acc = res.srOk ? res.lit/res.total : 1;
    const m = metrics(res.cap.frames, opt.t, /\?$/.test(opt.t));
    const turn = {stage, objKey, q:opt.q, text:opt.t, said:res.said, acc, missed:res.missed, url:res.cap.url, m, color:opt.color};
    addLine('c', opt.t, null, opt.color);
    C.turns.push(turn); C.log.push({who:'c', text:opt.t, at:Date.now() - C.t0, turn:C.turns.length - 1});
    return turn;
  }
}

/* ---------- owner reacts and the trust meter moves ---------- */
function applyTrust(turn){
  const A = ARCH[C.p.arch];
  let d = {best:12, ok:3, weak:-14*A.harsh}[turn.q];
  if(turn.stage === 'opener' && turn.q === 'ok' && A.likesHowBeen) d = 8;
  if(turn.acc !== undefined && turn.acc < 0.55) d -= 3;
  if(turn.m.wpm > 200) d -= 3;
  C.trust = Math.max(0, Math.min(100, C.trust + d));
  setTrust(C);
}
async function deliveryCheck(turn){
  // realistic phone moments: he didn't catch it, or you're going too fast
  if(C.kind !== 'free' && turn.acc !== undefined && turn.acc < 0.45 && turn.said && C.retries < 1){
    C.retries++; await ownerSays(pick(C.p.r, REACT.confused)); return 'again';
  }
  if(turn.m.wpm > 205 && !C.toldFast){ C.toldFast = true; await ownerSays(/truck|van/.test(C.p.situation.where) ? REACT.tooFast.drive : REACT.tooFast.other); }
  return '';
}

/* ======================================================================
   GUIDED / FREE CALL FLOW
   ====================================================================== */
async function runScripted(){
  const c = C, p = c.p, A = ARCH[p.arch];
  const alive = () => C === c && !c.ended;
  await ring(); if(!alive()) return;
  startClock(); AE.noiseOn(p.situation.noise);
  Full.start();
  await ownerSays((p.situation.noise ? p.situation.noise + ' ' : '') + p.answer);
  const stages = c.stages || STAGE_ORDER;
  let objKey = null, outcome = null;
  const closeLine = o => o === 'booked' ? (p.gk ? `Okay. It's ${p.email}, and I'll put you on ${p.owner.split(' ')[0]}'s calendar ${p.day} at ${p.time}.` : `Sure. It's ${p.email}. ${p.day} at ${p.time} works.`)
    : o === 'email_only' ? `Send it to ${p.email}. I'll take a look when I can. No promises on a time.`
    : pick(p.r, ['I\'m gonna pass for now. Thanks though.','Nah, I\'m all set. Thanks.','Not interested, sorry.']);
  for(const stage of stages){
    if(!alive()) return;
    if(stage === 'handle' && !objKey) continue;
    if(stage === 'close' && c.skipClose) continue;
    if(stage === 'wrap'){ objKey = (outcome === 'booked' || outcome === 'email_only') ? 'yes' : 'no'; }
    let turn = await callerTurn(stage, objKey);
    if(!turn || !alive()) return;
    if(await deliveryCheck(turn) === 'again'){ c.turns.pop(); turn = await callerTurn(stage, objKey); if(!turn || !alive()) return; }
    c.stageQ[stage + (stage === 'handle' ? ':' + objKey : '')] = turn.q;
    applyTrust(turn);
    if(c.trust <= 12 && stage !== 'wrap'){ await ownerSays(pick(p.r, REACT.hangup)); outcome = 'hung_up'; break; }
    if(stage === 'opener'){
      const line = (turn.q === 'ok' && A.likesHowBeen) ? pick(p.r, ['Can\'t complain, busy season. What\'s this about?','Doing alright. Do I know you?']) : pick(p.r, REACT.opener[turn.q]);
      await ownerSays(line);
    } else if(stage === 'truth'){
      await ownerSays(turn.q === 'best' ? fillRaw(A.reveal[p.facts.after], {owner:p.owner.split(' ')[0]}) : fill(pick(p.r, turn.q === 'ok' ? REACT.truthOk : REACT.truthWeak), p));
    } else if(stage === 'discover'){
      await ownerSays(turn.q === 'best' ? p.painLine : pick(p.r, turn.q === 'ok' ? REACT.discoverOk : REACT.discoverWeak));
    } else if(stage === 'gift'){
      objKey = p.objections[0];
      await ownerSays(pick(p.r, turn.q === 'best' ? REACT.giftBest[p.lead] : REACT.gift[turn.q]) + ' ' + pick(p.r, OBJ[objKey].say));
    } else if(stage === 'handle'){
      const second = p.objections[1] && !c.didSecond && c.trust >= 30 && c.trust < 75 && !(objKey === 'email' && turn.q === 'best');
      if(second){
        c.didSecond = true; await ownerSays(pick(p.r, REACT.handle[turn.q]) + ' ' + pick(p.r, OBJ[p.objections[1]].say));
        if(!alive()) return;
        objKey = p.objections[1];
        const t2 = await callerTurn('handle', objKey); if(!t2 || !alive()) return;
        c.stageQ['handle:' + objKey] = t2.q; applyTrust(t2);
        if(c.trust <= 12){ await ownerSays(pick(p.r, REACT.hangup)); outcome = 'hung_up'; break; }
      }
      const lastT = c.turns[c.turns.length - 1];
      if(objKey === 'email' && lastT.q === 'best' && stages.includes('close')){
        // the best "send me an email" answer already asked for the email and a time
        c.skipClose = true; c.stageQ.close = 'best';
        outcome = c.trust >= 62 ? 'booked' : c.trust >= 45 ? 'email_only' : 'not_now';
        await ownerSays(closeLine(outcome));
      } else await ownerSays(pick(p.r, REACT.handle[lastT.q]) + (c.trust >= 40 ? ' So what are you asking for?' : ''));
    } else if(stage === 'close'){
      outcome = (turn.q === 'weak' || c.trust < 45) ? 'not_now' : (turn.q === 'best' && c.trust >= 62) ? 'booked' : 'email_only';
      await ownerSays(closeLine(outcome));
    } else if(stage === 'wrap'){
      await ownerSays(pick(p.r, turn.q === 'weak' ? ['Yeah, I\'m sure. Bye.','Okay. Bye now.'] : ['Alright. Take care.','Yep, you too. Bye.','Thanks. Bye now.']));
    }
  }
  if(alive()){ c.outcome = outcome || c.outcome || 'not_now'; await finishCall(); }
}

/* ======================================================================
   LIVE AI OWNER (xAI Voice Agent)
   ====================================================================== */
/* pair transcripts (from xAI) with recorded clips (from our voice detection), in order */
function pairClips(c){
  for(const t of c.turns){
    if(t.url !== '' || !c.clips.length) continue;
    const clip = c.clips.shift();
    t.url = clip.url; t.latency = clip.latency; t.m = metrics(clip.frames, t.text || '', /\?$/.test(t.text || ''));
  }
}
async function runLive(){
  const c = C, p = c.p;
  const alive = () => C === c && !c.ended;
  c.clips = [];
  addLine('sys', 'Connecting to the live owner…', 'ln sys');
  let ownerLine = null, vad = {on:false, last:0, lat:0}, connected = false;
  const lc = new LiveCall({
    onOwnerText(txt, done){
      if(!alive()) return;
      if(!ownerLine){ ownerLine = addLine('o', txt); ownerLine.classList.add('live'); }
      else ownerLine.lastChild.textContent = txt;
      $('#cap').scrollTop = 1e6;
      if(done){ c.log.push({who:'o', text:txt, at:Date.now() - c.t0}); ownerLine.classList.remove('live'); ownerLine = null; c.lastOwner = txt; }
    },
    onOwnerAudio(sec){ c.ownerSecs += sec; $('#cAv').classList.add('talk'); c.ownerEndAt = 0; },
    onOwnerSilent(){ $('#cAv').classList.remove('talk'); c.ownerEndAt = performance.now(); },
    onCallerText(txt, done){
      if(!done || !alive() || !txt.trim()) return;
      const t = {text:txt.trim(), said:txt.trim(), m:{}, url:''};
      c.turns.push(t); addLine('c', t.text);
      c.log.push({who:'c', text:t.text, at:Date.now() - c.t0, turn:c.turns.length - 1});
      pairClips(c);
    },
    onError(msg){ if(alive()) toast('Live owner: ' + msg); },
    onClosed(){ if(connected && alive()){ toast('The live line dropped. Showing your report.'); finishCall(); } },
    onOwnerHangup(args){ if(!alive()) return; c.outcome = args.outcome; c.ownerTrust = args.trust; c.ownerWhy = args.why; addLine('sys', `${p.onLine} hung up.`, 'ln sys'); finishCall(); }
  });
  c.live = lc;
  try{
    await lc.start(p, ownerPrompt(p), p.answer, async () => { if(alive()){ $('#cap').innerHTML = ''; await ring(); } });
    connected = true;
  }catch(e){
    lc.stop(); c.live = null;
    if(!alive()) return;
    diag('Live start failed: ' + e.message);
    $('#cap').innerHTML = '';
    toast('The live AI owner isn\'t reachable right now. Switching to the practice owner.', 5000);
    c.kind = SRC ? 'free' : 'guided';
    $('#cMode').textContent = c.kind === 'free' ? 'Test call' : 'Guided'; $('#cSub').textContent = 'Practice line';
    $('.trust').classList.toggle('hidden', c.kind === 'free');
    return runScripted();
  }
  if(!alive()){ lc.stop(); return; }
  startClock(); AE.noiseOn(p.situation.noise); Full.start();
  // our own voice detection splits your turns into clips for playback and delivery metrics
  c.vadIv = setInterval(async () => {
    if(!alive()) return;
    const f = AE.frame(), now = performance.now();
    if(f.db > -47 && !lc.muted){
      if(!vad.on && !lc.ownerTalking){ vad.on = true; vad.lat = c.ownerEndAt ? now - c.ownerEndAt : 0; Cap.start(); }
      vad.last = now;
    } else if(vad.on && now - vad.last > 1300){
      vad.on = false;
      const lat = vad.lat, capd = await Cap.stop();
      if(capd.ms < 600) return;
      c.clips.push({url:capd.url, frames:capd.frames, latency:lat}); pairClips(c);
    }
  }, 60);
  c.flushLive = async () => { if(vad.on){ vad.on = false; const capd = await Cap.stop(); c.clips.push({url:capd.url, frames:capd.frames, latency:vad.lat}); } pairClips(c); };
}

/* hint: a nudge, never the full line */
function currentHintStage(){
  if(!C) return 'opener';
  if(C.kind !== 'live') return C.stage;
  const said = C.turns.map(t => (t.text || '').toLowerCase()).join(' ');
  const last = (C.lastOwner || '').toLowerCase();
  if(!/star ?well/.test(said)) return 'opener';
  if(/catch|cost|price|how much|email|ai\b|robot|agency|marketing company|word of mouth|referral|scam|my number|busy|on a job|all set/.test(last)) return 'handle';
  if(!/(reviews|website|site|book|after|facebook|google|closes|\d)/.test(said)) return 'truth';
  if(!/(last week|last night|cold night|recently|this week)/.test(said)) return 'discover';
  if(!/(demo|website|free|yours)/.test(said)) return 'gift';
  if(!/email/.test(said)) return 'close';
  return 'wrap';
}

/* ======================================================================
   START / END
   ====================================================================== */
async function beginCall(kind, persona, extra){
  AE.init();
  try{ if(window.speechSynthesis){ const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } }catch(e){}
  let noMic = false;
  try{ await AE.openMic(); }catch(e){ noMic = true; toast('Microphone blocked. You can still practice the guided call, but recordings and voice coaching need the mic.', 5000); }
  if(kind === 'free' && (!SRC || noMic)){ kind = 'guided'; toast(noMic ? 'The test call needs your microphone. Starting a guided call instead.' : 'Free-talk test calls need speech recognition (Chrome or Safari). Starting a guided call instead.', 5000); }
  if(kind === 'live' && noMic){ kind = 'guided'; }
  C = newCall(kind, persona, extra);
  C.noMic = noMic;
  if(C.drill) C.trust = Math.max(C.trust, 55);
  showCall(C);
  if(kind === 'live') runLive(); else runScripted();
}
async function finishCall(){
  if(!C || C.ended) return;
  if(C.flushLive && !C.flushed){ C.flushed = true; await C.flushLive(); }
  C.ended = true; C.dur = C.t0 ? (Date.now() - C.t0)/1000 : 0;
  clearInterval(clockIv); clearInterval(C.vadIv);
  (C.aborts || []).slice().forEach(fn => { try{ fn(); }catch(e){} }); C.aborts = [];
  Listen.stop(); Cap.cancel(); Player.stop(); AE.noiseOff();
  if(C.live) C.live.stop();
  C.fullUrl = await Full.stop();
  AE.closeMic();
  $('#cAv').classList.remove('talk');
  addLine('sys', 'Call ended', 'ln sys');
  await sleep(700);
  $('#call').classList.add('hidden');
  const rep = buildReport(C);
  C.report = rep;
  if(C.kind === 'guided' && !C.drill && !C.userEnded) LS.set('sw_pl_guided_' + me, String(guidedDone() + 1));
  saveCallToHistory(C, rep);
  showReport(C, rep);
  renderHome();
}
function guidedDone(){ return parseInt(LS.get('sw_pl_guided_' + me, '0'), 10) || 0; }
const _gd = () => parseInt(LS.get('sw_pl_guided_' + me, '0'), 10) || 0;

/* ======================================================================
   REPORT
   ====================================================================== */
const QP = {best:100, ok:60, weak:20, missing:30};
const SKILL_NAMES = {opener:'Opener', truth:'True thing', discover:'His week', gift:'The gift', handle:'His questions', close:'Email + date', wrap:'Ending', delivery:'Delivery'};

function liveStageQ(c){
  // score a free-form transcript stage by stage
  const p = c.p, turns = c.turns.filter(t => t.text);
  const out = {}, idx = {};
  const first = turns[0];
  if(first){ out.opener = classify('opener', first.text, p); idx.opener = 0; }
  const find = (stage, test) => { for(let i = 0; i < turns.length; i++) if(test(turns[i].text.toLowerCase())) return i; return -1; };
  let i = find('truth', t => /(reviews|website|site|book|after hours|after five|facebook|google|closes|chatgpt|instagram)/.test(t));
  if(i >= 0){ out.truth = classify('truth', turns[i].text, p); idx.truth = i; } else out.truth = 'missing';
  i = find('discover', t => /(how|what|when|who)\b/.test(t) && /(last|this week|recently|night|cold)/.test(t));
  if(i < 0) i = find('discover', t => /(would you be interested|interested in)/.test(t));
  if(i >= 0){ out.discover = classify('discover', turns[i].text, p); idx.discover = i; } else out.discover = 'missing';
  i = find('gift', t => /(demo|website|free|built|yours|phone answering|visibility)/.test(t));
  if(i >= 0){ out.gift = classify('gift', turns[i].text, p); idx.gift = i; } else out.gift = 'missing';
  // objection: caller turn right after the owner raised one
  const log = c.log; let objKey = null, hi = -1;
  for(let k = 0; k < log.length; k++){
    if(log[k].who !== 'o') continue;
    const o = log[k].text.toLowerCase();
    const key = /what's the catch|the catch\b(?! your)|catch here/.test(o) && !/catch (your|the) name/.test(o) ? 'catch' : /(cost|price|how much)/.test(o) ? 'price' : /(\bai\b|robot)/.test(o) ? 'ai' : /(agency|marketing company|seo compan|waste of money)/.test(o) ? 'agency' : /(word of mouth|referral)/.test(o) ? 'wordofmouth' : /(scam|my number)/.test(o) ? 'scam' : /(send me an email|send me something)/.test(o) ? 'email' : /(all set|already have)/.test(o) ? 'allset' : /(on a job|can't talk|busy)/.test(o) ? 'busy' : null;
    if(key){ const nx = log.slice(k + 1).find(x => x.who === 'c'); if(nx){ objKey = key; hi = turns.findIndex(t => t.text === nx.text); break; } }
  }
  if(objKey && hi >= 0){ out['handle:' + objKey] = classify('handle', turns[hi].text, p, objKey); idx['handle:' + objKey] = hi; }
  i = find('close', t => /email|send/.test(t));
  if(i >= 0){ out.close = classify('close', turns.slice(i).map(t => t.text).join(' '), p); idx.close = i; } else out.close = 'missing';
  const last = turns[turns.length - 1];
  if(last && turns.length > 2){ out.wrap = classify('wrap', last.text, p); idx.wrap = turns.length - 1; }
  return {q:out, idx, turns};
}

function buildReport(c){
  const p = c.p;
  let stageQ = c.stageQ, turnFor = {};
  const allTurns = c.turns;
  if(c.kind === 'live'){ const lq = liveStageQ(c); stageQ = lq.q; for(const k in lq.idx) turnFor[k] = lq.turns[lq.idx[k]]; }
  else for(const t of allTurns) turnFor[t.stage + (t.stage === 'handle' ? ':' + t.objKey : '')] = t;

  const skills = {};
  for(const k in stageQ){ const s = k.split(':')[0]; (skills[s] = skills[s] || []).push(QP[stageQ[k]]); }
  for(const s in skills) skills[s] = Math.round(skills[s].reduce((a, b) => a + b, 0)/skills[s].length);

  // delivery
  const said = allTurns.filter(t => t.m && t.m.voiced > 0);
  const avg = (a, f) => a.length ? a.reduce((x, t) => x + f(t), 0)/a.length : 0;
  const wpmT = said.filter(t => t.m.wpm > 60 && t.m.wpm < 320);
  const D = {
    wpm: Math.round(avg(wpmT, t => t.m.wpm)), st: +avg(said.filter(t => t.m.st > 0), t => t.m.st).toFixed(1),
    rises: said.filter(t => t.m.rise > 2.5), trails: said.filter(t => t.m.trail < -7),
    acc: c.kind === 'live' || c.kind === 'free' ? null : Math.round(100*avg(allTurns.filter(t => t.acc !== undefined), t => t.acc)),
    missed: [...new Set(allTurns.flatMap(t => t.missed || []))].slice(0, 8),
    voiced: said.reduce((a, t) => a + t.m.voiced, 0)
  };
  const text = allTurns.map(t => ' ' + (c.kind === 'guided' || c.kind === 'drill' ? (t.said || '') : (t.text || '')).toLowerCase() + ' ').join(' ');
  D.fillers = DELIVERY.fillers.filter(f => f !== 'like').reduce((a, f) => a + (text.match(new RegExp('\\b' + f + '\\b', 'g')) || []).length, 0);
  D.hedges = DELIVERY.hedges.filter(h => text.includes(h));
  if(c.kind === 'live' || c.kind === 'free'){
    D.talk = D.voiced + c.ownerSecs > 0 ? Math.round(100*D.voiced/(D.voiced + c.ownerSecs)) : 0;
    D.longest = Math.round(Math.max(0, ...said.map(t => t.m.voiced)));
    const lat = allTurns.filter(t => t.latency > 0).map(t => t.latency/1000);
    D.latency = lat.length ? +(lat.reduce((a, b) => a + b, 0)/lat.length).toFixed(1) : 0;
  }
  let dScore = 100;
  if(D.wpm){ if(D.wpm > DELIVERY.pace.high) dScore -= Math.min(30, (D.wpm - DELIVERY.pace.high)); if(D.wpm < DELIVERY.pace.low) dScore -= Math.min(25, DELIVERY.pace.low - D.wpm); }
  if(D.st && D.st < 1.6) dScore -= 15;
  dScore -= Math.min(15, D.rises.length*5) + Math.min(15, D.trails.length*5) + Math.min(15, D.fillers*3 + D.hedges.length*4);
  if(D.acc !== null) dScore -= Math.max(0, Math.min(25, 85 - D.acc));
  if(D.latency > 3) dScore -= 10;
  skills.delivery = Math.max(20, Math.round(dScore));

  const contentKeys = Object.keys(skills).filter(k => k !== 'delivery');
  const content = contentKeys.length ? contentKeys.reduce((a, k) => a + skills[k], 0)/contentKeys.length : 50;
  let score = Math.round(0.68*content + 0.32*skills.delivery);
  if(c.outcome === 'hung_up') score = Math.min(score, 45);

  // strengths and improvements
  const strengths = [], fixes = [];
  const keys = Object.keys(stageQ).sort((a, b) => STAGE_ORDER.indexOf(a.split(':')[0]) - STAGE_ORDER.indexOf(b.split(':')[0]));
  for(const k of keys){
    const [stage, obj] = k.split(':'); const q = stageQ[k], t = turnFor[k];
    const src = stage === 'handle' ? OBJ[obj] : LINES[stage];
    const why = stage === 'handle' ? src.why : LINES[stage].why;
    const name = stage === 'handle' ? src.skill : SKILL_NAMES[stage];
    const guide = stage === 'handle' ? src.guide : LINES[stage].guide;
    const quote = t ? (c.kind === 'live' || c.kind === 'free' ? t.text : t.text) : '';
    if(q === 'best') strengths.push({name, quote, why:why.best, take:TAKE[stage] ? fill(TAKE[stage].best, p) : '', url:t && t.url});
    else {
      let better = '';
      if(stage === 'handle') better = fill(src.best, p);
      else { const o = optionsFor(stage, p, stage === 'wrap' ? (c.outcome === 'booked' || c.outcome === 'email_only' ? 'yes' : 'no') : null).find(x => x.q === 'best'); better = o ? o.t : ''; }
      fixes.push({stage, name, q, quote, better, why: q === 'missing' ? `You never got to this part. ${why.best}` : why[q === 'missing' ? 'ok' : q], take: TAKE[stage] ? fill(TAKE[stage][q === 'missing' ? 'ok' : q], p) : '', guide, url:t && t.url, sev: q === 'weak' ? 3 : q === 'missing' ? 2 : 1});
    }
  }
  fixes.sort((a, b) => b.sev - a.sev);

  // delivery coaching
  const dfix = [];
  const worst = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a))[0];
  if(D.wpm > DELIVERY.pace.high){ const t = worst(wpmT, x => x.m.wpm); dfix.push({name:`Pace: ${D.wpm} words a minute`, quote:t && t.text, url:t && t.url, better:'Slow down on his shop name, "StarWell", and the day and time. Pause for a beat after the reason you\'re calling.', why:`Fast talking sounds nervous, and nervous sounds like a sales pitch. Aim for ${DELIVERY.pace.target}. ${DELIVERY.pace.src}`, tag:'Gong data'}); }
  else if(D.wpm && D.wpm < DELIVERY.pace.low){ const t = worst(wpmT, x => -x.m.wpm); dfix.push({name:`Pace: ${D.wpm} words a minute`, quote:t && t.text, url:t && t.url, better:'Read the line twice before the call so it flows. Speak like you\'re talking to a neighbor.', why:`Very slow delivery can sound unsure or read from a page. Aim for ${DELIVERY.pace.target}. ${DELIVERY.pace.src}`, tag:'Gong data'}); }
  if(D.st && D.st < 1.6){ const t = worst(said.filter(x => x.m.st > 0), x => -x.m.st); dfix.push({name:'Flat voice', quote:t && t.text, url:t && t.url, better:'Lift your voice on the one word that matters in each line: his shop\'s name, "free", "yours", the day.', why:'A flat, even voice sounds like a script. The moment an owner hears a script, he stops listening and starts looking for the exit.', tag:'Coaching practice'}); }
  if(D.rises.length){ const t = D.rises[0]; dfix.push({name:'Statements that sound like questions', quote:t.text, url:t.url, better:'Let your voice land down at the end of statements, especially "This is a cold call, so I\'ll be quick."', why:'Rising at the end sounds like you\'re asking permission to exist. Owners trust people who sound sure of why they called.', tag:'Coaching practice'}); }
  if(D.trails.length){ const t = D.trails[0]; dfix.push({name:'Trailing off at the end', quote:t.text, url:t.url, better:'Keep your volume up through the last words. The ask is usually at the end.', why:'The end of your sentence is where the important part is, like the day and time. If it fades, he misses it on a noisy job site.', tag:'Coaching practice'}); }
  if(D.fillers + D.hedges.length >= 2) dfix.push({name:`Fillers and soft words (${D.fillers + D.hedges.length})`, quote:D.hedges.length ? `You said: "${D.hedges.join('", "')}"` : '', better:'Replace "I just wanted to…" and "sorry to bother you" with the reason: "The reason I\'m calling is…"', why:'Apologizing for calling tells him you think you\'re a bother. You\'re calling with a free gift. Sound like it.', tag:'Coaching practice'});
  if(D.missed.length >= 3) dfix.push({name:'Words that didn\'t come through clearly', quote:D.missed.join(', '), url:(allTurns.find(t => (t.missed || []).length > 2) || {}).url, better:'Say these slowly three times before your next call. Names and numbers matter most.', why:'He\'s on a cell phone, maybe in a truck. If "StarWell" or the day sounds mushy, he won\'t remember who called or when.', tag:'Coaching practice'});
  if(D.latency > 3) dfix.push({name:`Pauses before answering (${D.latency}s average)`, better:'Learn the four most common questions (catch, price, AI, "send me an email") until the answers come out without thinking.', why:'A long pause after "what\'s the catch?" sounds like there IS a catch. Quick, calm answers sound honest.', tag:'Coaching practice'});
  if(D.talk && (D.talk < 35 || D.talk > 72)) dfix.push({name:`You talked ${D.talk}% of the call`, better: D.talk < 35 ? 'Lead a little more: say why you called, offer the gift clearly, then ask for the email and a time.' : 'After each question, stop and let him answer fully. One follow-up question, then move on.', why:'Successful cold calls in Gong\'s data run about 55% caller, 45% prospect. You lead, but he still gets room to talk.', tag:'Gong data'});
  if(D.longest > 45) dfix.push({name:`Longest stretch talking: ${D.longest}s`, better:'Break long explanations into one sentence, then a question.', why:'In Gong\'s data, the longest talking stretch in successful cold calls averaged about 37 seconds. Past that, owners drift.', tag:'Gong data'});

  const outcomeLabel = {booked:'Walkthrough booked', email_only:'Email only', not_now:'Not now', hung_up:'He hung up', you_ended:'You ended the call'}[c.outcome] || 'Call ended';
  const takeLines = [];
  if(c.ownerWhy) takeLines.push(c.ownerWhy);
  const firstFix = fixes[0], firstWin = strengths[0];
  if(firstWin && firstWin.take) takeLines.push(firstWin.take);
  if(firstFix && firstFix.take) takeLines.push(firstFix.take);
  if(!takeLines.length) takeLines.push(fill(ARCH[p.arch].take, p));
  const drill = firstFix ? `Before your next call, say the better "${firstFix.name}" line out loud three times, then use it in your next guided call.` : dfix[0] ? `Next call, focus on one thing: ${dfix[0].better}` : 'Next call, keep everything that worked and try the live test call.';
  return {score, skills, D, strengths, fixes, dfix, outcomeLabel, take:takeLines.slice(0, 3).join(' '), drill, stageQ};
}

function bar(name, v){ const col = v >= 80 ? '#22c55e' : v >= 55 ? '#f59e0b' : '#ef4444'; return `<div class="bar"><span>${esc(name)}</span><div class="t"><i style="width:${v}%;background:${col}"></i></div><b>${v}</b></div>`; }
const playBtn = (url, label) => url ? `<button class="play" data-play="${url}"><svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z"/></svg>${label || 'Hear yourself'}</button>` : '';
const guideLink = id => id ? `<a class="gl" href="${GUIDE}#${id}" target="_blank" rel="noopener">Open in the guide →</a>` : '';

function showReport(c, rep, fromHist){
  const p = c.p, D = rep.D;
  const tagCol = {booked:'green', email_only:'yellow', not_now:'gray', hung_up:'red', you_ended:'gray'}[c.outcome] || 'gray';
  const meters = [];
  if(D.wpm) meters.push([`${D.wpm}`, 'words a minute', D.wpm >= DELIVERY.pace.low && D.wpm <= DELIVERY.pace.high]);
  if(D.st) meters.push([`${D.st}`, 'pitch range (semitones)', D.st >= 1.6]);
  if(D.acc !== null && D.acc !== undefined) meters.push([`${D.acc}%`, 'words clearly heard', D.acc >= 80]);
  meters.push([`${D.fillers + (D.hedges || []).length}`, 'fillers and soft words', D.fillers + (D.hedges || []).length < 2]);
  if(D.talk) meters.push([`${D.talk}%`, 'you talking (goal ~55%)', D.talk >= 40 && D.talk <= 70]);
  if(D.latency) meters.push([`${D.latency}s`, 'average pause before answering', D.latency <= 3]);
  const nextKind = c.kind === 'guided' && guidedDone() < 2 ? 'guided' : 'live';
  $('#reportIn').innerHTML = `
    <div class="ptop"><h2>Call breakdown</h2><button class="btn light x" data-close="report">Close</button></div>
    <div class="box"><div class="rhead">
      <div><div class="lbl">${esc(c.drill ? 'Drill' : {guided:'Guided call', free:'Test call', live:'Live test call'}[c.kind])} · ${esc(p.onLine)} at ${esc(p.shop)}, ${esc(p.town)}</div>
        <span class="tag ${tagCol}">${esc(rep.outcomeLabel)}</span> <span class="note">${Math.floor((c.dur || 0)/60)}m ${Math.round((c.dur || 0)%60)}s · ${esc(ARCH[p.arch].label)}</span></div>
      <div style="text-align:right"><span class="score">${rep.score}</span><span class="note"> / 100</span></div></div>
      ${c.fullUrl ? `<div style="margin-top:12px">${playBtn(c.fullUrl, 'Play the whole call')}</div>` : ''}
    </div>
    <div class="box"><div class="lbl">${esc(p.onLine)}'s take</div><div class="quote">"${esc(rep.take)}"</div>
      <p class="note">${esc(ARCH[p.arch].label)}: ${esc(ARCH[p.arch].how)}</p></div>
    <div class="box"><h3>Score by skill</h3><div class="bars">${Object.keys(SKILL_NAMES).filter(k => rep.skills[k] !== undefined).map(k => bar(SKILL_NAMES[k], rep.skills[k])).join('')}</div></div>
    <div class="box" id="aiBox"></div>
    <div class="box"><h3>What worked</h3>${rep.strengths.length ? rep.strengths.map(s => `<div class="item"><h4><span class="tag green">${esc(s.name)}</span></h4>${s.quote ? `<div class="ex">"${esc(s.quote)}"</div>` : ''}<p class="why">${esc(s.why)}</p>${s.take ? `<p class="note">${esc(p.onLine)}: "${esc(s.take)}"</p>` : ''}${playBtn(s.url)}</div>`).join('') : '<p class="note">Nothing landed cleanly this time. That\'s what practice is for. Start with the first fix below.</p>'}</div>
    <div class="box"><h3>Work on next</h3>${rep.fixes.length ? rep.fixes.map((f, i) => `<div class="item"><h4>${i + 1}. ${esc(f.name)} <span class="tag ${f.q === 'weak' ? 'red' : 'yellow'}">${f.q === 'weak' ? 'Hurt the call' : f.q === 'missing' ? 'Skipped' : 'Could be stronger'}</span></h4>
      ${f.quote ? `<div class="ex bad">You: "${esc(f.quote)}"</div>` : ''}
      <div class="ex">Try: "${esc(f.better)}"</div>
      <p class="why"><b>Why it matters:</b> ${esc(f.why)}</p>
      ${f.take ? `<p class="note">From ${esc(p.onLine)}'s side: "${esc(f.take)}"</p>` : ''}
      <div class="row">${playBtn(f.url)} ${guideLink(f.guide)}</div></div>`).join('') : '<p class="note">Every step landed. Try a harder owner or the live test call.</p>'}</div>
    <div class="box"><h3>How you sounded</h3><div class="meter">${meters.map(m => `<div><b class="${m[2] ? 'ok' : 'warn'}">${esc(m[0])}</b><small>${esc(m[1])}</small></div>`).join('')}</div>
      ${rep.dfix.map(f => `<div class="item"><h4>${esc(f.name)} <span class="chip">${esc(f.tag)}</span></h4>${f.quote ? `<div class="ex bad">${esc(f.quote)}</div>` : ''}<div class="ex">${esc(f.better)}</div><p class="why"><b>Why it matters:</b> ${esc(f.why)}</p>${playBtn(f.url)}</div>`).join('') || '<p class="note" style="margin-top:10px">Pace, tone and clarity all looked good.</p>'}
      <p class="note" style="margin-top:8px">Voice measures come from your microphone and are estimates. ${guideLink('confidence')}</p></div>
    <div class="box"><h3>Your drill before the next call</h3><p>${esc(rep.drill)}</p></div>
    <div class="box"><h3>Transcript</h3><div class="tr">${c.log.map(l => `<p class="${l.who}"><b>${esc(l.who === 'o' ? p.onLine : (me || 'You'))}:</b> ${esc(l.text)} ${l.turn !== undefined && c.turns[l.turn] ? playBtn(c.turns[l.turn].url, 'Play') : ''}</p>`).join('')}</div>
      ${fromHist ? '<p class="note">Recordings are kept until you close this page.</p>' : ''}</div>
    <div class="row" style="justify-content:center;margin-top:8px">
      ${nextKind === 'guided' ? '<button class="btn black" data-start="guided">Next guided call</button>' : '<button class="btn black" data-start="live">Live test call</button><button class="btn dark" data-start="guided">Another guided call</button>'}
      <button class="btn light" data-close="report">Home</button></div>`;
  openPage('report');
  if(!fromHist) aiReview(c, rep);
  else if(c.ai) renderAI(c.ai, p);
}

async function aiReview(c, rep){
  const box = $('#aiBox');
  if(!Voice.can().xai){ box.innerHTML = `<h3>Coach notes</h3><p class="note">Turn on the AI coach in Settings (team voice server or xAI key) for a line-by-line review of your words, written for this owner.</p>`; return; }
  box.innerHTML = `<h3>Coach notes</h3><p class="note">Your AI coach is reviewing the call…</p>`;
  const p = c.p;
  const payload = {
    owner:{name:p.onLine, role:p.gk ? 'office manager' : 'owner', personality:ARCH[p.arch].label, how:ARCH[p.arch].how, shop:p.shop, town:p.town + ', Connecticut', facts:p.facts},
    mode:c.kind, outcome:c.outcome, owner_reason:c.ownerWhy || '', duration_sec:Math.round(c.dur || 0),
    transcript:c.log.map(l => ({speaker:l.who === 'o' ? 'owner' : 'caller', text:l.text})),
    delivery:{wpm:rep.D.wpm, pitch_range_semitones:rep.D.st, fillers:rep.D.fillers, soft_words:rep.D.hedges, talk_percent:rep.D.talk, avg_pause_sec:rep.D.latency, unclear_words:rep.D.missed},
    rule_scores:rep.skills, caller_name:me
  };
  try{
    const ai = await Voice.review(payload);
    c.ai = ai; renderAI(ai, p);
    const h = hist(); const e = h.find(x => x.id === c.id); if(e){ e.ai = ai; if(ai.scores){ e.aiScore = Math.round(Object.values(ai.scores).reduce((a, b) => a + b, 0)/Object.values(ai.scores).length); } saveHist(h); renderHome(); }
  }catch(e){ diag('AI review failed: ' + e.message); box.innerHTML = `<h3>Coach notes</h3><p class="note">The AI coach couldn't be reached this time (${esc(e.message.slice(0, 80))}). Your breakdown below is complete.</p>`; }
}
function renderAI(ai, p){
  const box = $('#aiBox'); if(!box) return;
  box.innerHTML = `<h3>Coach notes <span class="chip">AI review</span></h3>
    ${ai.summary ? `<p>${esc(ai.summary)}</p>` : ''}
    ${ai.owner_take ? `<div class="quote">${esc(p.onLine)}: "${esc(ai.owner_take)}"</div>` : ''}
    ${(ai.improvements || []).map((f, i) => `<div class="item"><h4>${i + 1}. ${esc(SKILL_NAMES[f.skill] || f.skill || 'Improve')}</h4>${f.quote ? `<div class="ex bad">You: "${esc(f.quote)}"</div>` : ''}${f.better ? `<div class="ex">Try: "${esc(f.better)}"</div>` : ''}<p class="why"><b>Why it matters:</b> ${esc(f.why)}</p>${guideLink(f.guide)}</div>`).join('')}
    ${(ai.strengths || []).length ? `<div class="item"><h4>Keep doing</h4>${ai.strengths.map(s => `<p class="why">"${esc(s.quote)}": ${esc(s.why)}</p>`).join('')}</div>` : ''}
    ${ai.drill ? `<p><b>Drill:</b> ${esc(ai.drill)}</p>` : ''}`;
}

function saveCallToHistory(c, rep){
  const h = hist();
  h.push({id:c.id, ts:Date.now(), kind:c.drill ? 'drill' : c.kind, arch:c.p.arch, shop:c.p.shop, owner:c.p.onLine, town:c.p.town, outcome:c.outcome, score:rep.score, skills:rep.skills,
    dur:Math.round(c.dur || 0), wpm:rep.D.wpm, log:c.log.map(l => ({who:l.who, text:l.text})), fixes:rep.fixes.slice(0, 3).map(f => f.name), drill:rep.drill, take:rep.take});
  saveHist(h);
}

/* ======================================================================
   PREP SLIDES
   ====================================================================== */
let pending = null;   // {kind, p}
function slidesHTML(p){
  const f = p.facts;
  const stars = '★'.repeat(Math.round(f.rating)) + '☆'.repeat(5 - Math.round(f.rating));
  return [
    `<div class="box"><div class="lbl">Slide 1 · At a glance</div><h3 style="font-size:24px">${esc(p.shop)}</h3>
      <div class="kv"><div><small>Owner</small><span>${esc(p.owner)}</span></div><div><small>Town</small><span>${esc(p.town)}, CT</span></div><div><small>In business since</small><span>${esc(f.since)}</span></div>
      <div><small>Team</small><span>${f.techs} techs, ${f.trucks} trucks</span></div><div><small>Office hours</small><span>7:30 AM to ${esc(f.close)} PM</span></div><div><small>Main work</small><span>${esc(f.services.join(', '))}</span></div></div>
      ${p.gk ? `<p class="note" style="margin-top:12px">${esc(p.onLine)} usually answers the main line.</p>` : ''}</div>`,
    `<div class="box"><div class="lbl">Slide 2 · Reviews</div><h3><span class="stars">${stars}</span> ${f.rating} on Google · ${f.reviews} reviews</h3>
      ${p.reviewsList.map(t => `<div class="rev">"${esc(t)}"<br><small>Google review</small></div>`).join('')}
      <p class="note">Customers keep mentioning <b>${esc(f.tech)}</b>. A real compliment you can use.</p></div>`,
    `<div class="box"><div class="lbl">Slide 3 · Website and phones</div>
      <div class="flag gap"><b>!</b><span>After ${esc(f.close)}, calls go to ${esc(f.afterLabel)}.</span></div>
      ${f.siteIssues.map(s => `<div class="flag gap"><b>!</b><span>Website: ${esc(s)}.</span></div>`).join('')}
      <div class="flag good"><b>✓</b><span>Phone number is on the home page and the Google listing.</span></div>
      <p class="note">These are gaps, not insults. Mention one as a fact, never a judgment.</p></div>`,
    `<div class="box"><div class="lbl">Slide 4 · Online presence</div>
      <div class="flag gap"><b>!</b><span>${esc(f.aiCheck)}</span></div>
      <div class="flag"><b>i</b><span>Last social post: ${esc(f.lastPost)}.</span></div>
      <div class="flag"><b>i</b><span>${f.hiring ? 'Careers page: hiring a service tech.' : 'Not hiring right now.'}</span></div>
      <div class="flag good"><b>✓</b><span>Why now: heating season in Connecticut. First cold nights, no-heat calls after dinner.</span></div></div>`,
    `<div class="box"><div class="lbl">Slide 5 · Your game plan</div>
      <div class="kv" style="grid-template-columns:1fr"><div><small>Clue about who answers</small><span>${esc(ARCH[p.arch].clue)}</span></div>
      <div><small>Best gift to lead with</small><span>${esc({phone:'Phones: the demo line that answers after hours', site:'Website: a fresh version that books calls at night', found:'Getting found: one page on how they show up in search and AI'}[p.lead])}</span></div>
      <div><small>Your true thing</small><span>${esc(optionsFor('truth', p)[0].t)}</span></div>
      <div><small>Walkthrough time to offer</small><span>${esc(p.day)} at ${esc(p.time)}</span></div></div>
      <p class="note" style="margin-top:12px">${p.brief ? 'Facts from your saved Prospect Brief. The owner\'s personality is still a surprise.' : 'Practice shop: invented for this call. Every call is a new owner.'}</p></div>`
  ];
}
let slideI = 0;
function openPrep(kind, p){
  pending = {kind, p};
  const s = slidesHTML(p); slideI = 0;
  $('#prepMode').textContent = {guided:'Guided call', live:'Live test call', free:'Test call', drill:'Drill'}[kind];
  $('#slides').innerHTML = s.map((h, i) => `<div class="slide${i ? '' : ' on'}">${h}</div>`).join('');
  $('#sdots').innerHTML = s.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('');
  paintSlide();
  openPage('prep');
}
function paintSlide(){
  const sl = $$('#slides .slide'), dots = $$('#sdots i');
  sl.forEach((s, i) => s.classList.toggle('on', i === slideI)); dots.forEach((d, i) => d.classList.toggle('on', i === slideI));
  $('#sCount').textContent = `${slideI + 1} of ${sl.length}`;
  $('#sPrev').disabled = slideI === 0; $('#sNext').disabled = slideI === sl.length - 1;
}
$('#sPrev').onclick = () => { slideI = Math.max(0, slideI - 1); paintSlide(); };
$('#sNext').onclick = () => { slideI = Math.min($$('#slides .slide').length - 1, slideI + 1); paintSlide(); };
$('#readyBtn').onclick = () => { if(!pending) return; closePage('prep'); const {kind, p, extra} = pending; pending = null; beginCall(kind, p, extra); };

/* ======================================================================
   IN-CALL BUTTONS
   ====================================================================== */
$('#bEnd').onclick = () => { if(!C || C.ended) return; if(!C.outcome){ C.outcome = 'you_ended'; C.userEnded = true; } finishCall(); };
$('#bMute').onclick = () => { if(!C || C.ended) return; C.muted = !C.muted; $('#bMute').classList.toggle('on', C.muted); if(C.live) C.live.muted = C.muted || C.held; toast(C.muted ? 'Muted. He can\'t hear you.' : 'Mic on', 1400); };
$('#bHold').onclick = () => {
  if(!C || C.ended) return; C.held = !C.held; $('#bHold').classList.toggle('on', C.held);
  if(C.live){ C.live.muted = C.held || C.muted; C.live.onHold = C.held; if(C.held) C.live.cutOwner(); }
  else if(C.held){ C.sayCut = true; Player.stop(); }
  toast(C.held ? 'On hold. Tap Hold again to resume.' : 'Back on the call', 1600);
};
$('#bHint').onclick = () => {
  if(!C) return;
  const st = currentHintStage(); const h = $('#hint');
  if(!h.classList.contains('hidden')){ h.classList.add('hidden'); return; }
  h.innerHTML = `<b>Hint · ${esc(SKILL_NAMES[st] || st)}</b>${esc(HINTS[st] || HINTS.opener)}`;
  h.classList.remove('hidden'); clearTimeout(h._t); h._t = setTimeout(() => h.classList.add('hidden'), 9000);
  if(C) C.hints = (C.hints || 0) + 1;
};
$('#hint').onclick = () => $('#hint').classList.add('hidden');
const openShop = () => {
  if(!C) return;
  const sh = $('#sheet');
  sh.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px"><b style="font-size:18px">${esc(C.p.shop)}</b><button class="btn black" id="sheetX">Back to call</button></div>` + slidesHTML(C.p).join('');
  sh.classList.remove('hidden'); $('#sheetX').onclick = () => sh.classList.add('hidden');
};
$('#bShop').onclick = openShop; $('#cInfo').onclick = openShop;
$('#bGuide').onclick = () => {
  const st = currentHintStage(), sh = $('#sheet');
  const sec = [['step1','Step 1 · Opener','opener'],['step2','Step 2 · One true thing','truth'],['step3','Step 3 · His week','discover'],['step4','Step 4 · The gift','gift'],['questions','Owner questions','handle'],['price','Price and the catch','handle'],['step5','Step 5 · Email + date','close'],['followup','Voicemail and follow-up','wrap'],['howtalk','How we talk',''],['confidence','Confidence kit','']];
  sh.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px"><b style="font-size:18px">Cold-call guide</b><button class="btn black" id="sheetX">Back to call</button></div>
    <p class="note">Opens in a new tab. Your call stays on hold here.</p>` +
    sec.map(s => `<a class="fli" style="text-decoration:none;${s[2] === st ? 'font-weight:700' : ''}" href="${GUIDE}#${s[0]}" target="_blank" rel="noopener">${esc(s[1])}${s[2] === st ? ' · you are here' : ''}<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></a>`).join('');
  sh.classList.remove('hidden'); $('#sheetX').onclick = () => sh.classList.add('hidden');
};

/* playback of snippets anywhere */
let snip = null;
document.addEventListener('click', e => {
  const b = e.target.closest('[data-play]'); if(!b) return;
  if(snip){ snip.pause(); snip = null; }
  snip = new Audio(b.dataset.play); snip.play().catch(() => toast('Recording not available'));
});

/* ======================================================================
   PAGES, HOME, PROGRESS, SETTINGS
   ====================================================================== */
function openPage(id){ $('#' + id).classList.remove('hidden'); $('#' + id).scrollTop = 0; }
function closePage(id){ $('#' + id).classList.add('hidden'); }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if(c) closePage(c.dataset.close);
  const n = e.target.closest('[data-nav]'); if(n) nav(n.dataset.nav);
  const s = e.target.closest('[data-start]'); if(s){ closePage('report'); startFlow(s.dataset.start); }
  const d = e.target.closest('[data-drill]'); if(d) startDrill(d.dataset.drill);
  const hr = e.target.closest('[data-hist]'); if(hr) openHist(hr.dataset.hist);
});
function nav(where){
  if(where === 'guide'){ window.open(GUIDE, '_blank', 'noopener'); return; }
  if(where === 'calls'){ renderCalls(); openPage('calls'); }
  if(where === 'progress'){ renderProgress(); openPage('progress'); }
}

let source = {type:'random'};
function personaFromSource(pool){
  if(source.type === 'brief' && source.brief) return makePersona({brief:source.brief, pool});
  if(source.type === 'research' && source.brief) return makePersona({brief:source.brief, pool});
  return makePersona({pool});
}
function startFlow(kind){
  if(!me){ toast('Pick your name first'); return; }
  if(kind === 'live'){
    const p = personaFromSource();
    openPrep(Voice.can().xai ? 'live' : 'free', p);
    return;
  }
  const n = guidedDone();
  const pool = n === 0 ? ['oldtimer','friendly','modernizer','gatekeeper'] : n === 1 ? ['busy','skeptic','numbers'] : null;
  openPrep('guided', personaFromSource(pool));
}
function startDrill(stage){
  if(!me){ toast('Pick your name first'); return; }
  const p = makePersona();
  const stages = stage === 'opener' ? ['opener'] : stage === 'handle' ? ['gift','handle'] : ['close','wrap'];
  pending = null;
  const kind = LS.get('sw_pl_mode', 'guided') === 'live' ? 'free' : 'guided';
  openPrep(kind, p);
  pending.kind = kind; pending.extra = {stages, drill:stage};
  $('#prepMode').textContent = {opener:'Opener drill', handle:'Objection drill', close:'Close drill'}[stage];
  if(stage === 'close') p.answer = p.answer + ' ' + pick(p.r, ['Okay, I\'m listening. What are you asking for?','So what do you need from me?']);
}

function renderHome(){
  $('#hey').textContent = me ? `Hey, ${me}!` : 'Hey there!';
  $('#signin').classList.toggle('hidden', !!me);
  $('#home').classList.toggle('hidden', !me);
  $('#crewStack').innerHTML = TEAM.map((n, i) => `<span style="background:${['#111','#2563eb','#d97706'][i]}" title="${n}">${n.slice(0, 2)}</span>`).join('');
  const h = hist(), last3 = h.slice(-3);
  $('#readiness').textContent = (last3.length ? Math.round(last3.reduce((a, x) => a + (x.aiScore || x.score), 0)/last3.length) : 0) + '%';
  $('#mCalls').textContent = h.length;
  $('#mMin').textContent = Math.round(h.reduce((a, x) => a + (x.dur || 0), 0)/60) + 'm';
  $('#mBooked').textContent = h.filter(x => x.outcome === 'booked').length;
  const g = guidedDone(), liveReady = g >= 2, ai = Voice.can().xai, last = h[h.length - 1];
  const callIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>';
  const dots = n => `<span class="stack">${[0,1,2].map(i => `<span style="width:26px;height:26px;font-size:11px;background:${i < n ? '#22c55e' : '#d1d5db'}">${i + 1}</span>`).join('')}</span>`;
  $('#cards').innerHTML = `
    <div class="tc fu" style="animation-delay:.35s"><div class="r1"><div class="ti">${callIcon}Guided call ${Math.min(g + 1, 3)}</div><span class="tag green">Guided</span></div>
      <div class="r2"><div class="det"><small>Owner</small><span>${g === 0 ? 'Friendly start' : g === 1 ? 'Tougher owner' : 'Any owner'}</span></div><div class="det"><small>You get</small><span>3 lines per turn, captions glow as you speak</span></div><div class="det n"><small>Time</small><span>~4 min</span></div></div>
      <div class="r3"><div class="bl">${dots(g)}<span>${g >= 2 ? 'Path done. Keep sharpening.' : 'Set to begin?'}</span></div><button class="btn dark" data-start="guided">Prep the call</button></div></div>
    <div class="tc rot fu" style="animation-delay:.4s"><div class="r1"><div class="ti">${callIcon}Live test call</div><span class="tag yellow">Live</span></div>
      <div class="r2"><div class="det"><small>Owner</small><span>${ai ? 'Live AI owner, real voice' : 'Practice owner (turn on AI in Settings)'}</span></div><div class="det"><small>Captions</small><span>No lines given. Hint button only.</span></div><div class="det n"><small>Time</small><span>~5 min</span></div></div>
      <div class="r3"><div class="bl">${liveReady ? 'Unlocked. Talk freely.' : `Unlocks after 2 guided calls (${g}/2)`}</div><button class="btn black" data-start="live" ${liveReady ? '' : 'disabled'}><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9z"/></svg>Start live call</button></div></div>
    <div class="tc fu" style="animation-delay:.45s"><div class="r1"><div class="ti"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-6"/></svg>Last call review</div><span class="tag ${last ? (last.outcome === 'booked' ? 'green' : last.outcome === 'hung_up' ? 'red' : 'yellow') : 'gray'}">${last ? esc({booked:'Booked', email_only:'Email only', not_now:'Not now', hung_up:'Hung up', you_ended:'You ended it'}[last.outcome] || 'Ended') : 'None yet'}</span></div>
      <div class="r2"><div class="det"><small>Owner</small><span>${last ? esc(last.owner + ', ' + last.town) : '—'}</span></div><div class="det"><small>Work on</small><span>${last ? esc(last.fixes[0] || 'Keep it up') : '—'}</span></div><div class="det n"><small>Score</small><span>${last ? (last.aiScore || last.score) : '—'}</span></div></div>
      <div class="r3"><div class="bl">${last ? 'Notes, playback and fixes' : 'Your first breakdown shows here'}</div><button class="btn light" ${last ? `data-hist="${last.id}"` : 'disabled'}>Show details</button></div></div>`;
  const briefs = LS.json('sw_cc_briefs', []);
  $('#srcTitle').textContent = source.type === 'random' ? 'Random Connecticut shop' : source.brief.shop;
  $('#srcSub').textContent = source.type === 'random' ? (briefs.length ? `New owner every call · ${briefs.length} saved briefs` : 'New owner every call') : source.type === 'brief' ? 'From your Prospect Brief' : 'From web research';
}

/* ---------- source picker ---------- */
$('#srcPill').onclick = () => {
  const briefs = LS.json('sw_cc_briefs', []);
  $('#callsIn').innerHTML = `<div class="box"><h3>Who do you want to call?</h3>
      <button class="fli" data-src="random"><b>Random Connecticut shop</b>&nbsp;· new owner every time<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></button>
      ${briefs.map((b, i) => `<button class="fli" data-src="brief:${i}"><b>${esc(b.shop || 'Unnamed shop')}</b>&nbsp;· ${esc(b.town || '')} · Prospect Brief<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg></button>`).join('')}
      ${briefs.length ? '' : `<p class="note">Save Prospect Briefs in the <a href="${GUIDE}#brief" target="_blank" rel="noopener">cold-call guide</a> and they show up here, so you can practice the real shop before the real call.</p>`}</div>
    <div class="box"><h3>Research a real shop <span class="chip">beta · AI</span></h3>
      <p class="note">Grok searches the web for reviews, hours, website setup and more, then builds the prep slides.</p>
      <div class="fld"><label>Shop name</label><input type="text" id="rShop" placeholder="Valley Comfort Heating and Cooling"></div>
      <div class="fld"><label>Connecticut town</label><input type="text" id="rTown" placeholder="Wallingford"></div>
      <button class="btn black" id="rGo" ${Voice.can().xai ? '' : 'disabled'}>Research it</button> <span class="note" id="rMsg">${Voice.can().xai ? '' : 'Needs the AI set up in Settings.'}</span></div>`;
  openPage('calls');
  $('#callsIn').onclick = async e => {
    const b = e.target.closest('[data-src]');
    if(b){ const v = b.dataset.src; if(v === 'random') source = {type:'random'}; else source = {type:'brief', brief:briefs[+v.split(':')[1]]}; closePage('calls'); renderHome(); toast('Next call: ' + $('#srcTitle').textContent); return; }
    if(e.target.id === 'rGo'){
      const shop = $('#rShop').value.trim(), town = $('#rTown').value.trim(); if(!shop || !town) return toast('Add the shop and town');
      $('#rMsg').textContent = 'Searching the web…'; e.target.disabled = true;
      try{
        const j = await Voice.research(shop, town);
        source = {type:'research', brief:{shop:j.shop || shop, town:j.town || town, owner:j.owner || '', since:j.since || '', social:j.social || '', hiring:j.hiring || '', true:j.true_thing || '', comp:(j.review_themes || [])[0] ? `People's reviews keep mentioning ${j.review_themes[0]}` : '', research:j}};
        closePage('calls'); renderHome(); toast('Research done. Your prep slides use it.');
      }catch(err){ $('#rMsg').textContent = 'Research failed: ' + err.message.slice(0, 90); e.target.disabled = false; }
    }
  };
};

function renderCalls(){
  const h = hist().slice().reverse();
  $('#callsIn').innerHTML = h.length ? h.map(x => `<button class="tc" data-hist="${x.id}" style="display:block;width:100%;text-align:left;margin-bottom:12px">
    <div class="r1"><div class="ti">${esc(x.owner)} · ${esc(x.shop)}</div><span class="tag ${x.outcome === 'booked' ? 'green' : x.outcome === 'hung_up' ? 'red' : 'yellow'}">${esc({booked:'Booked', email_only:'Email only', not_now:'Not now', hung_up:'Hung up', you_ended:'You ended it'}[x.outcome] || 'Ended')}</span></div>
    <div class="r2" style="border:0;margin:0;padding:0"><div class="det"><small>When</small><span>${new Date(x.ts).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})}</span></div><div class="det"><small>Type</small><span>${esc({guided:'Guided', free:'Test', live:'Live', drill:'Drill'}[x.kind])}</span></div><div class="det n"><small>Score</small><span>${x.aiScore || x.score}</span></div></div></button>`).join('')
    : '<div class="box"><p class="note">No calls yet. Start with Guided call 1.</p></div>';
}
function openHist(id){
  const x = hist().find(e => e.id === id); if(!x) return;
  if(C && C.id === id && C.report){ showReport(C, C.report, true); return; }
  $('#reportIn').innerHTML = `<div class="ptop"><h2>Call breakdown</h2><button class="btn light x" data-close="report">Close</button></div>
    <div class="box"><div class="lbl">${esc(x.owner)} at ${esc(x.shop)}, ${esc(x.town)}</div><span class="score">${x.aiScore || x.score}</span><span class="note"> / 100</span>
    <div class="quote">"${esc(x.take || '')}"</div></div>
    <div class="box"><h3>Score by skill</h3><div class="bars">${Object.keys(SKILL_NAMES).filter(k => x.skills[k] !== undefined).map(k => bar(SKILL_NAMES[k], x.skills[k])).join('')}</div></div>
    <div class="box"><h3>Work on next</h3>${x.fixes.map(f => `<span class="chip">${esc(f)}</span>`).join('') || '<p class="note">Nothing flagged.</p>'}<p style="margin-top:10px">${esc(x.drill)}</p></div>
    ${x.ai ? `<div class="box" id="aiBox"></div>` : ''}
    <div class="box"><h3>Transcript</h3><div class="tr">${x.log.map(l => `<p class="${l.who}"><b>${esc(l.who === 'o' ? x.owner : me)}:</b> ${esc(l.text)}</p>`).join('')}</div><p class="note">Recordings are kept only until the page is closed.</p></div>`;
  openPage('report');
  if(x.ai) renderAI(x.ai, {onLine:x.owner});
}

function renderProgress(){
  const h = hist();
  if(!h.length){ $('#progIn').innerHTML = '<div class="box"><p class="note">Your progress chart appears after your first call.</p></div>'; return; }
  const W = 640, H = 220, pad = 30, n = h.length;
  const xs = i => pad + (n === 1 ? (W - 2*pad)/2 : i*(W - 2*pad)/(n - 1)), ys = v => H - pad - v*(H - 2*pad)/100;
  const pts = h.map((x, i) => `${xs(i)},${ys(x.aiScore || x.score)}`).join(' ');
  const skillAvg = {}; for(const k of Object.keys(SKILL_NAMES)){ const v = h.filter(x => x.skills[k] !== undefined).map(x => x.skills[k]); if(v.length) skillAvg[k] = Math.round(v.reduce((a, b) => a + b, 0)/v.length); }
  const weakest = Object.keys(skillAvg).sort((a, b) => skillAvg[a] - skillAvg[b])[0];
  const wpm = h.filter(x => x.wpm).map(x => x.wpm);
  $('#progIn').innerHTML = `<div class="box"><h3>Score by call</h3>
    <svg class="chart" viewBox="0 0 ${W} ${H}">${[0,25,50,75,100].map(v => `<line x1="${pad}" x2="${W - pad}" y1="${ys(v)}" y2="${ys(v)}" stroke="#eef2f7"/><text x="4" y="${ys(v) + 4}" font-size="11" fill="#9ca3af">${v}</text>`).join('')}
    <polyline points="${pts}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linejoin="round"/>${h.map((x, i) => `<circle cx="${xs(i)}" cy="${ys(x.aiScore || x.score)}" r="5" fill="${x.outcome === 'booked' ? '#22c55e' : x.outcome === 'hung_up' ? '#ef4444' : '#f59e0b'}"><title>${esc(x.owner)}: ${x.aiScore || x.score}</title></circle>`).join('')}</svg>
    <p class="note">Dots: green booked, amber email or not now, red hung up.</p></div>
    <div class="box"><h3>Average by skill</h3><div class="bars">${Object.keys(skillAvg).map(k => bar(SKILL_NAMES[k], skillAvg[k])).join('')}</div>
    ${weakest ? `<p style="margin-top:12px"><b>Focus next:</b> ${esc(SKILL_NAMES[weakest])}. ${guideLink(LINES[weakest] ? LINES[weakest].guide : 'confidence')}</p>` : ''}</div>
    ${wpm.length ? `<div class="box"><h3>Pace over time</h3><p>${wpm.map(w => `<span class="chip">${w} wpm</span>`).join('')}</p><p class="note">${DELIVERY.pace.src} Aim for ${DELIVERY.pace.target}.</p></div>` : ''}`;
}

function renderSettings(){
  const c = Voice.can();
  $('#setIn').innerHTML = `
    <div class="box"><h3>You</h3><div class="signin">${TEAM.map(n => `<button data-me="${n}" style="${n === me ? 'outline:2px solid #111' : ''}">${n}</button>`).join('')}</div></div>
    <div class="box"><h3>AI owner and coach</h3>
      <p class="note">Now using: <b>${esc(Voice.label())}</b>. The live owner and AI coach run on xAI Grok. Owner voices for guided calls use xAI, then ElevenLabs, then this device's voice.</p>
      <div class="fld"><label>Team voice server URL (recommended: keeps keys off phones)</label><input type="text" id="sServer" value="${esc(CFG.server)}" placeholder="https://starwell-voice.example.workers.dev"></div>
      <div class="fld"><label>Team code (if the server asks for one)</label><input type="password" id="sTeam" value="${esc(CFG.team)}"></div>
      <details ${CFG.xaiKey || CFG.elKey ? 'open' : ''}><summary style="cursor:pointer;font-weight:600;margin:8px 0">Or use keys on this device only</summary>
        <p class="note">Keys stay in this browser and are never uploaded to GitHub. Only do this on your own device.</p>
        <div class="fld"><label>xAI API key</label><input type="password" id="sXai" value="${esc(CFG.xaiKey)}" autocomplete="off"></div>
        <div class="fld"><label>ElevenLabs API key (optional)</label><input type="password" id="sEl" value="${esc(CFG.elKey)}" autocomplete="off"></div></details>
      <div class="fld"><label>Owner voice for guided calls</label><select id="sVoice">${[['auto','Auto (xAI, then ElevenLabs)'],['xai','xAI Grok voices'],['elevenlabs','ElevenLabs voices'],['device','This device\'s voice']].map(o => `<option value="${o[0]}" ${CFG.voicePref === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
      <div class="fld"><label>AI coach model</label><input type="text" id="sModel" value="${esc(CFG.textModel)}"></div>
      <div class="row"><button class="btn black" id="sSave">Save</button><button class="btn dark" id="sTest">Test the owner voice</button><button class="btn light" id="sLive">Test live connection</button></div>
      <p class="note" id="sMsg"></p></div>
    <div class="box"><h3>Realism</h3>
      <label class="row"><input type="checkbox" id="sFx" ${CFG.phoneFx ? 'checked' : ''}> Phone-line sound on the owner's voice</label>
      <label class="row" style="margin-top:8px"><input type="checkbox" id="sNoise" ${CFG.noise ? 'checked' : ''}> Background noise (truck, office)</label></div>
    <div class="box"><h3>Diagnostics</h3><pre style="white-space:pre-wrap;font-size:12px;color:#374151;max-height:220px;overflow:auto">${esc(DIAG.join('\n') || 'No events yet.')}</pre>
      <p class="note">Speech recognition: ${SRC ? 'available' : 'not available in this browser (use Chrome or Safari)'} · Recording: ${window.MediaRecorder ? 'available' : 'not available'}</p>
      <button class="btn light" id="sClear">Clear my practice history</button></div>`;
  $('#setIn').onclick = async e => {
    const m = e.target.closest('[data-me]'); if(m){ me = m.dataset.me; LS.set('sw_cc_me', me); renderSettings(); renderHome(); return; }
    if(e.target.id === 'sSave' || e.target.id === 'sTest' || e.target.id === 'sLive'){
      LS.set('sw_pl_server', $('#sServer').value.trim()); LS.set('sw_pl_team', $('#sTeam').value.trim());
      $('#sXai').value.trim() ? LS.set('sw_pl_xai', $('#sXai').value.trim()) : LS.del('sw_pl_xai');
      $('#sEl').value.trim() ? LS.set('sw_pl_el', $('#sEl').value.trim()) : LS.del('sw_pl_el');
      LS.set('sw_pl_voice', $('#sVoice').value); LS.set('sw_pl_model', $('#sModel').value.trim() || 'grok-4');
      LS.set('sw_pl_fx', $('#sFx').checked ? '1' : '0'); LS.set('sw_pl_noise', $('#sNoise').checked ? '1' : '0');
      Voice.failed = {};
      $('#sMsg').textContent = 'Saved.'; renderHome();
    }
    if(e.target.id === 'sTest'){
      AE.init(); const p = makePersona();
      $('#sMsg').textContent = 'Playing…';
      const prov = await Voice.say(`${p.shop}, this is ${p.onLine}. Who's calling?`, p);
      $('#sMsg').textContent = 'Played with: ' + {xai:'xAI Grok', el:'ElevenLabs', device:'this device'}[prov] + (prov === 'device' && CFG.voicePref !== 'device' ? '. The AI voices didn\'t answer; see Diagnostics.' : '.');
    }
    if(e.target.id === 'sLive'){
      $('#sMsg').textContent = 'Getting a session token…';
      try{ const t = await Voice.token(); $('#sMsg').textContent = t ? 'Live owner is reachable. You\'re set.' : 'No token returned.'; }
      catch(err){ $('#sMsg').textContent = 'Live owner not reachable: ' + err.message.slice(0, 140); }
    }
    if(e.target.id === 'sClear'){ if(confirm('Clear all your practice calls on this device?')){ LS.del(histKey()); LS.del('sw_pl_guided_' + me); renderHome(); toast('History cleared'); } }
  };
}
$('#setBtn').onclick = () => { renderSettings(); openPage('settings'); };
$$('#modeToggle button').forEach(b => b.onclick = () => { $$('#modeToggle button').forEach(x => x.classList.toggle('on', x === b)); LS.set('sw_pl_mode', b.dataset.mode); toast(b.dataset.mode === 'live' ? 'Drills: free talk, no lines given' : 'Drills: guided, with lines to choose', 1800); });
(() => { const m = LS.get('sw_pl_mode', 'guided'); $$('#modeToggle button').forEach(x => x.classList.toggle('on', x.dataset.mode === m)); })();

/* sign-in */
$('#signinBtns').innerHTML = TEAM.map(n => `<button data-who="${n}">${n}</button>`).join('');
$('#signinBtns').onclick = e => { const b = e.target.closest('[data-who]'); if(!b) return; me = b.dataset.who; LS.set('sw_cc_me', me); renderHome(); };

/* mic check card */
(() => {
  const H = [8,16,12,28,20,36,42,24,40,16,44,32,48,28,20,36,14,32,22,40,18,30,12,26,16,34,20,38,24,28,16,22,12,20,8];
  $('#wave').innerHTML = H.map(h => `<i style="height:${h*0.8}px"></i>`).join('');
  let on = false, iv = null;
  $('#micBtn').onclick = async () => {
    if(on){ on = false; clearInterval(iv); Listen.stop(); if(!C || C.ended) AE.closeMic(); $$('#wave i').forEach((b, i) => b.style.height = H[i]*0.8 + 'px'); $('#micMsg').textContent = 'Mic check done.'; return; }
    try{ await AE.openMic(); }catch(e){ $('#micMsg').textContent = 'Microphone blocked. Allow it in your browser settings.'; return; }
    on = true; $('#micMsg').textContent = 'Listening… say your opener.';
    iv = setInterval(() => { const f = AE.frame(), lv = Math.max(0, Math.min(1, (f.db + 60)/45)); $$('#wave i').forEach((b, i) => b.style.height = Math.max(3, H[i]*0.8*(0.25 + lv*1.4)) + 'px'); }, 70);
    Listen.start(t => { $('#micMsg').textContent = '"' + t.trim().split(/\s+/).slice(-12).join(' ') + '"'; });
    setTimeout(() => { if(on) $('#micBtn').click(); }, 15000);
  };
})();

renderHome();
