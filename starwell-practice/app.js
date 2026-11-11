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
function hashStr(s){ let h = 2166136261; for(const ch of String(s)){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
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
  let real = opt.real || null;
  if(!real && !opt.brief && typeof SHOPS !== 'undefined' && SHOPS.length) real = pick(r, SHOPS);
  const b = opt.brief || (real ? {shop:real.name, town:real.town} : {});
  const town = (b.town || pick(r, TOWNS)).replace(/\s*\(.*?\)\s*/g, ' ').trim();
  // a real shop keeps the same practice people every time you call it
  const nr = real ? rng(hashStr(real.name + real.town)) : r;
  const ownerFirst = (b.owner || pick(nr, A.gender === 'f' && !A.gk ? WOMEN : MEN)).split(' ')[0];
  const last = pick(nr, LAST);
  const gk = !!A.gk;
  const gkName = gk ? pick(nr, WOMEN) : '';
  if(real && real.yrs && !b.since) b.since = String(new Date().getFullYear() - real.yrs);
  const s = {last, town, first:ownerFirst, r3:Math.floor(r()*3)};
  const shop = b.shop || pick(r, A.gender === 'f' && !A.gk ? SHOP_PATTERNS.slice(1) : SHOP_PATTERNS)(s);
  // how people say it on the phone: no Inc./LLC/Co.
  const said = shop.replace(/\s*\(.*?\)\s*/g, ' ').trim().replace(/,?\s*(inc\.?|incorporated|l\.?l\.?c\.?|corp\.?|co\.?|company|ltd\.?)\s*$/i, '').replace(/,?\s*(inc\.?|l\.?l\.?c\.?)\s*$/i, '').replace(/\s+/g, ' ').trim();
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
    search: pick(r, ['furnace repair', 'heating repair', 'AC repair'])
  };
  facts.aiCheck = pick(r, [`When you ask ChatGPT for ${facts.search} in ${town}, two other shops come up first.`, `They show up third on the Google map for "${facts.search} ${town}".`]);
  if(A.force && A.force.hiring) facts.hiring = true;
  if(A.force && A.force.techMin){ facts.techs = Math.max(facts.techs, A.force.techMin); facts.trucks = Math.max(facts.trucks, facts.techs); }
  if((after === 'cell' || after === 'service') && facts.siteIssues.includes(SITE_ISSUES[0])) facts.siteIssues[facts.siteIssues.indexOf(SITE_ISSUES[0])] = SITE_ISSUES.slice(1).find(x => !facts.siteIssues.includes(x));
  const lr = r();
  const lead = lr < 0.2 ? 'site' : lr < 0.4 ? 'found' : (after === 'voicemail' || after === 'none' || after === 'service' || after === 'cell') ? 'phone' : facts.siteIssues.includes(SITE_ISSUES[0]) ? 'site' : 'found';
  const objections = [];
  objections.push(pickW(r, A.objections));
  if(r() < 0.6) objections.push(pickW(r, A.objections, objections));
  const day = pick(r, DAYS), time = pick(r, TIMES);
  const am = time.startsWith('7');
  const p = {
    seed, arch, gender:A.gender, gk, shop:shop.replace(/\s*\(.*?\)\s*/g, ' ').trim(), town, owner: ownerFirst + ' ' + last, onLine: gk ? gkName : ownerFirst,
    age: A.ages[0] + Math.floor(r()*(A.ages[1] - A.ages[0])),
    situation: gk ? {where:'at the front desk', noise:'(phones ringing in the office)'} : pick(r, SITUATIONS),
    facts, lead, objections, day, time,
    rate: A.rate + (r() - 0.5)*0.08, pitchMul: A.pitch + (r() - 0.5)*0.1,
    painLine: fillRaw(pick(r, A.pain), {owner:ownerFirst}),
    email: (gk ? 'office' : ownerFirst.toLowerCase()) + '@' + (() => { let d = said.toLowerCase().replace(/&|\band\b|heating|cooling|plumbing|conditioning|\bair\b|'s|hvac|brothers|sons|mechanical|services?|repairs?|llc|inc/g, ' ').replace(/[^a-z]/g, '').slice(0, 18); if(!d || d === ownerFirst.toLowerCase()) d = last.toLowerCase() + 'hvac'; return d; })() + '.com',
    reviewsList: shuffle(r, REVIEW_TPL).slice(0, 2).map(t => t.replace('{tech}', tech)),
    brief: opt.brief ? true : false, real,
    trueThing: (b.true || '').trim().replace(/[.!]+$/, ''), compliment: (b.comp || '').trim().replace(/[.!]+$/, '')
  };
  p.voices = Voice.pickVoices(p);
  p.vars = {name:p.onLine, owner:ownerFirst, shop:said, town, me: me || 'teammate', tech, day, time,
            close: facts.close, rating: facts.rating, reviews: facts.reviews,
            when: am ? 'before the trucks go out' : 'after the trucks come back', gk: gkName,
            email: p.email, day2: DAYS[(DAYS.indexOf(day) + 1) % DAYS.length]};
  p.shopSaid = said;
  p.answer = fill(pick(r, A.answer), p);
  p.r = r;
  return p;
}
function fillRaw(t, v){ return t.replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m); }

/* the three "one true thing" lines and other stage options for this persona */
function optionsFor(stage, p, key){
  const opts = scriptOptions(OLD2NEW[stage] || stage, p, key);
  if(opts.length && !opts.some(o => o.q === 'best')){ const style = bestStyle(p); opts.forEach(o => { if(o.style === style) o.q = 'best'; }); }
  return opts;
}
function bestStyle(p){ return (SCRIPT_LIB.bestFit && SCRIPT_LIB.bestFit[p.arch]) || 'Straight & brief'; }

/* ---------- free-talk classifier (used when the AI owner isn't available, and for live scoring) ---------- */
const has = (t, re) => re.test(t);
function classify(stage, text, p, objKey){
  if(/\bcold[- ]?call/i.test(text)) return 'off';   // our rule: never call it a cold call
  if(stage === 'greet') return /star ?well/i.test(text) ? 'best' : 'ok';
  if(NEW2OLD[stage]) stage = NEW2OLD[stage];
  const t = ' ' + text.toLowerCase().replace(/[^a-z0-9$' ]/g, ' ') + ' ';
  const pressure = /sign up|sign you up|today only|lock in|deal|discount|you need to|you'd be crazy|guarantee|10x|ten times/;
  const jargon = /\b(ai|geo|aeo|seo|algorithm|leads|optimization|automation)\b/;
  const critic = /outdated|old fashioned|terrible|ugly|bad website|looks old|behind the times|dying/;
  const question = /\b(how|what|when|who|where|do you|did you|are you|is it|have you|does)\b/;
  if(stage === 'opener'){
    if(has(t, /bad time|catch you at|is this the owner/)) return 'weak';
    const sw = has(t, /star ?well/), why = has(t, /reason|noticed|calling because|looking at|saw|made|built|gift|free|something for|keep/);
    if(sw && why) return 'best';
    return sw || why ? 'ok' : 'weak';
  }
  if(stage === 'truth'){
    if(has(t, critic)) return 'off';
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
    if(has(t, pressure)) return 'off';
    if((t.match(jargon) || []).length >= 1 && has(t, /geo|aeo|algorithm|leads|10x|ten times/)) return 'weak';
    const items = ['website', 'seo', 'social', 'phone', 'search', 'google', 'facebook', 'demo line', 'answering'].filter(k => t.includes(k)).length;
    if(items >= 4) return 'ok';
    return has(t, /free|yours|keep it|separate|test number|show you/) ? 'best' : 'ok';
  }
  if(stage === 'handle'){
    if(has(t, pressure) || has(t, critic)) return 'off';
    if(has(t, /fall behind|everyone's using|everyone is using|we have data|we have a lot of data/)) return 'weak';
    const good = {catch:/new to connecticut|new to|rather show|show you|yours either way|stays yours|it's yours/, price:/300|three hundred|400|four hundred|in writing|free/,
      allset:/after five|after hours|who picks|who answers|covered/, email:/(monday|tuesday|wednesday|thursday|friday|morning|afternoon|7|seven)/,
      busy:/(monday|tuesday|wednesday|thursday|friday|later|morning|email)/, ai:/separate|test number|nothing touches|say yes|your phones/,
      agency:/sorry|frustrating|free first|your own numbers|stays yours/, wordofmouth:/best kind|look you up|neighbor|referral/,
      scam:/website|google listing|look us up|nothing to pay|connecticut company/}[objKey];
    return good && has(t, good) ? 'best' : 'ok';
  }
  if(stage === 'close'){
    if(has(t, pressure) || has(t, /contract|commit/)) return 'off';
    const email = has(t, /email/), when = has(t, /monday|tuesday|wednesday|thursday|friday|tomorrow|\b\d{1,2}(:\d\d)?\b|morning|evening|afternoon/);
    return email && when ? 'best' : (email || has(t, /send|information|info/)) ? 'ok' : 'weak';
  }
  if(stage === 'wrap'){
    if(has(t, /are you sure|crazy|but it's free|just think/)) return 'off';
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
const STAGE_ORDER = SCRIPT_LIB.stageOrder || ['greet','reason','noticed','follow','offer','questions','next','thanks'];
const OLD2NEW = {opener:'greet', truth:'noticed', discover:'follow', gift:'offer', handle:'questions', close:'next', wrap:'thanks'};
const NEW2OLD = {greet:'opener', reason:'opener', noticed:'truth', follow:'discover', offer:'gift', questions:'handle', next:'close', thanks:'wrap'};
/* one vocabulary for every screen */
const STEP_NAMES = {greet:'Hello', reason:'Why you\'re calling', noticed:'What you noticed', follow:'Follow-up', offer:'The offer', questions:'Their questions', next:'Next step', thanks:'Goodbye'};
STEPS.forEach(x => { if(STEP_NAMES[x[0]]) x[1] = STEP_NAMES[x[0]]; });
if(SCRIPT_LIB.labels) Object.assign(SCRIPT_LIB.labels, STEP_NAMES);
const KIND_NAMES = {guided:'Guided call', free:'Free-talk call', live:'Live call', drill:'Drill'};
const DRILL_NAMES = {opener:'Hello drill', handle:'Questions drill', close:'Next-step drill'};
const OUTCOME = {
  booked:{label:'Walkthrough booked', col:'green', icon:'✓'},
  email_only:{label:'Email only', col:'green', icon:'✉'},
  not_now:{label:'Not this time', col:'gray', icon:'–'},
  hung_up:{label:'Owner hung up', col:'red', icon:'✕'},
  you_ended:{label:'You ended the call', col:'gray', icon:'■'},
  drill:{label:'Drill done', col:'blue', icon:'✓'}
};
const outcomeOf = k => OUTCOME[k] || {label:'Call ended', col:'gray', icon:'■'};
const OPT_COLORS = [['--o1','var(--accent)'],['--o2','var(--accent)'],['--o3','var(--accent)']];
/* small notice inside the phone, clear of the controls */
function callToast(msg, ms){
  const ph = $('.phone'); if(!ph) return toast(msg, ms);
  let t = ph.querySelector('.ctoast'); if(t) t.remove();
  t = document.createElement('div'); t.className = 'ctoast'; t.textContent = msg; ph.appendChild(t);
  setTimeout(() => t.remove(), ms || 1800);
}

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
  $('#cMode').textContent = c.drill ? (DRILL_NAMES[c.drill] || 'Drill') : KIND_NAMES[c.kind];
  $('#cSub').textContent = c.kind === 'live' ? 'Live AI owner' : 'Practice line';
  $('#cShop').textContent = p.shop; $('#cShop').title = p.shop;
  $('#cOwner').textContent = (p.gk ? `${p.onLine}, office manager` : `${p.owner}, owner`) + (p.real ? ' (practice)' : '');
  $('#cAv').textContent = p.onLine[0];
  $('#cAv').style.background = ['#a3a3a3','#8b9bb4','#b4a08b','#9bb48b','#b48b9b'][p.seed % 5];
  $('#cap').innerHTML = ''; $('#opts').classList.add('hidden'); $('#say').classList.add('hidden');
  $('#hint').classList.add('hidden'); $('#sheet').classList.add('hidden');
  $('.trust').classList.toggle('hidden', c.kind === 'live' || c.kind === 'free');
  $('#cTrustLbl').textContent = `How ${p.onLine} feels`;
  c.level = c.level || 3; $('.phone').classList.remove('picking'); paintSteps();
  $('#cTime').textContent = 'Ringing…';
  ['#bMute','#bHold'].forEach(s => $(s).classList.remove('on'));
  $('#bMute .t').textContent = 'Mute'; $('#bHold .t').textContent = 'Hold';
  pauseBg(true);
  setTrust(c);
}
function paintSteps(){
  if(!C) return;
  const cur = C.kind === 'live' ? currentHintStage() : C.stage;
  const list = C.stages ? STEPS.filter(x => C.stages.includes(x[0])) : STEPS;
  const i = list.findIndex(x => x[0] === cur);
  $('#cStepLine').innerHTML = i >= 0 ? `<span>Step ${i + 1} of ${list.length} · <b>${esc(list[i][1])}</b></span>` : '';
  $('#cSteps').innerHTML = list.map((x, k) => `<span class="${k < i ? 'done' : k === i ? 'on' : ''}"></span>`).join('');
}
function setTrust(c){ $('#cTrust').style.width = Math.max(4, Math.min(100, c.trust)) + '%'; }
function addLine(who, text, cls, color){
  const d = document.createElement('div');
  d.className = 'ln ' + (cls || (who === 'o' ? 'o' : 'c'));
  const name = who === 'o' ? C.p.onLine : (me || 'You');
  const noise = text.match(/^\(.*?\)\s*/);
  d.innerHTML = (who !== 'sys' ? `<span class="sp">${esc(name)}</span>` : '') + (noise ? `<span class="noise">${esc(noise[0])}</span>` : '') + esc(noise ? text.slice(noise[0].length) : text);
  $('#cap').appendChild(d); $('#cap').scrollTop = 1e6;
  return d;
}
let clockIv = null;
function callSecs(c){ if(!c || !c.t0) return 0; const held = (c.heldMs || 0) + (c.holdAt ? Date.now() - c.holdAt : 0); return Math.max(0, (Date.now() - c.t0 - held)/1000); }
const mmss = s => String(Math.floor(s/60)).padStart(2, '0') + ':' + String(Math.floor(s%60)).padStart(2, '0');
function startClock(){ C.t0 = Date.now(); C.heldMs = 0; clearInterval(clockIv); $('#cTime').textContent = '00:00'; clockIv = setInterval(() => { if(!C) return; $('#cTime').textContent = mmss(callSecs(C)); }, 500); }
function setHeld(on){
  if(!C) return; if(!!C.held === !!on) return;
  C.held = !!on;
  if(on) C.holdAt = Date.now(); else if(C.holdAt){ C.heldMs = (C.heldMs || 0) + Date.now() - C.holdAt; C.holdAt = 0; }
  $('#bHold').classList.toggle('on', C.held); $('#bHold .t').textContent = C.held ? 'Resume' : 'Hold';
}

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
  while(C && C.held && !C.ended) await sleep(250);
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
    const order = SCRIPT_LIB.styleOrder || [];
    const rank = o => { const i = order.indexOf(o.style); return i < 0 ? 99 : i; };
    const opts = optionsFor(stage, C.p, objKey).slice().sort((x, y) => rank(x) - rank(y));
    C.lastOpts = opts;
    const coach = C.level === 1;
    const box = $('#opts');
    box.classList.toggle('showwhy', coach);
    box.innerHTML = `<div class="lbl">${coach ? `All three work. Pick the one that fits ${esc(C.p.onLine)} best, then say it.` : 'Pick a line, then say it out loud'}</div>` +
      opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="k">${esc(o.style)}</span>${esc(o.t)}<span class="why">${esc(stripCite(o.why))}</span></button>`).join('') +
      (coach ? '' : `<button class="whytap" id="whyTap">Why does each one work?</button>`);
    box.classList.remove('hidden'); $('.phone').classList.add('picking'); $('#cap').scrollTop = 1e6;
    if($('#whyTap')) $('#whyTap').onclick = () => { box.classList.toggle('showwhy'); };
    const abort = () => { box.classList.add('hidden'); $('.phone').classList.remove('picking'); box.onclick = null; resolve(null); };
    onAbort(abort);
    box.onclick = e => {
      const b = e.target.closest('.opt'); if(!b || C.held) return;
      const o = opts[+b.dataset.i]; box.classList.add('hidden'); box.onclick = null; offAbort(abort);
      resolve(Object.assign({color:'var(--accent)'}, o));
    };
  });
}
/* research citations stay in the guide, not in front of a beginner */
function stripCite(t){ return String(t || '').replace(/\s*\((?:[A-Z][\w&.' -]*(?:,|\s)\s*)?(?:19|20)\d\d[a-z]?\)/g, '').replace(/\s*\[[^\]]*\]/g, '').replace(/\s*(?:Source|Research|Data):[^.]*\.?$/i, '').trim(); }
function sayIt(opt){
  return new Promise(resolve => {
    const words = opt.t.split(/\s+/);
    const targets = words.map(norm);
    const box = $('#say');
    box.style.setProperty('--oc', opt.color);
    box.innerHTML = `<div class="sayline">${words.map((w, i) => `<span class="w" data-i="${i}">${esc(w)}</span>`).join(' ')}</div>
      <div class="saybar"><span id="sayState" class="listen">Listening. Say it out loud.</span><div class="lvl"><i id="sayLvl"></i></div>
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
      if(srOk && !C.muted && !C.held && ((ratio >= 0.85 && quiet > 900) || (ratio >= 0.7 && quiet > 4000))) done();
    }, 200);
    const abort = () => { if(finished) return; finished = true; cleanup(); Listen.stop(); Cap.cancel(); box.classList.add('hidden'); resolve(null); };
    onAbort(abort);
    const cleanup = () => { clearInterval(lvlIv); clearInterval(auto); clearInterval(est); offAbort(abort); };
    async function done(){
      if(finished) return; finished = true; cleanup();
      Listen.stop(); const said = heard;
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
    box.style.setProperty('--oc', 'var(--accent)');
    box.innerHTML = `<div class="saybar"><span id="sayState" class="listen">Your turn. Talk naturally.</span><div class="lvl"><i id="sayLvl"></i></div><button class="btn black" id="sayDone">Done</button></div>`;
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
      Listen.stop(); const said = heard.trim();
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
  C.stage = stage; paintSteps();
  if(C.kind === 'free'){
    const res = await freeTurn();
    if(!res || !C || C.ended) return null;
    const said = res.said || '(not heard)';
    const q = res.said ? classify(stage, said, C.p, objKey) : 'ok';
    const m = metrics(res.cap.frames, said, /\?$/.test(said));
    const pool = optionsFor(stage, C.p, objKey);
    const turn = {stage, objKey, q, text:said, said, url:res.cap.url, m, latency:m.firstVoiceMs || 0, best:pool.find(o => o.q === 'best'), opt:pool.find(o => o.q === 'best') || pool[0]};
    C.turns.push(turn); addLine('c', said); C.log.push({who:'c', text:said, at:Date.now() - C.t0, turn:C.turns.length - 1});
    return turn;
  }
  for(;;){
    const opt = await chooseOption(stage, objKey);
    if(!opt || !C || C.ended){ $('.phone').classList.remove('picking'); return null; }
    const res = await sayIt(opt);
    $('.phone').classList.remove('picking');
    if(!res || !C || C.ended) return null;
    if(res.back) continue;   // picked another line
    const acc = res.srOk ? res.lit/res.total : 1;
    const m = metrics(res.cap.frames, opt.t, /\?$/.test(opt.t));
    const best = C.lastOpts.find(o => o.q === 'best');
    const turn = {stage, objKey, opt, q:opt.q, style:opt.style, tags:opt.tags || [], why:opt.why, text:opt.t, said:res.said, acc, missed:res.missed, url:res.cap.url, m, color:opt.color, best};
    addLine('c', opt.t, null, opt.color);
    C.turns.push(turn); C.log.push({who:'c', text:opt.t, at:Date.now() - C.t0, turn:C.turns.length - 1});
    if(C.level <= 2 && !C.drillQuiet) addLine('sys', coachLine(opt, best), opt.q === 'best' ? 'ln sys coachln' : 'ln sys coachln alt');
    return turn;
  }
}

/* one short, specific coaching line after a pick (never the same sentence twice in a call) */
function coachLine(opt, best){
  const p = C.p, A = ARCH[p.arch], n = (C.coachN = (C.coachN || 0) + 1);
  const used = C.coachUsed || (C.coachUsed = new Set());
  const first = s => String(s || '').split(/(?<=\.)\s/)[0];
  let cands;
  if(opt.q === 'best'){
    cands = [`✓ Great fit. ${first(stripCite(opt.why))}`, `✓ That's the style ${p.onLine} warms to.`, `✓ Right style for ${p.onLine}. Keep that tone.`, `✓ Nice. ${opt.style} suits ${p.onLine}.`];
  } else {
    const bs = best ? best.style : 'another style';
    cands = [`Good line. ${first(A.how)} ${bs} fits a little better.`, `Works fine. For ${p.onLine}, ${bs.toLowerCase()} usually lands best.`, `Good. Next turn, try ${bs.toLowerCase()} and see how ${p.onLine} reacts.`, `That works. ${bs} is the closest fit for ${p.onLine}.`];
  }
  const line = cands.find(x => !used.has(x)) || cands[n % cands.length];
  used.add(line); return line;
}

/* ---------- owner reacts and the trust meter moves ---------- */
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
  while(c.held && !c.ended) await sleep(250);
  if(!alive()) return;
  startClock(); AE.noiseOn(p.situation.noise);
  Full.start();
  await ownerSays((p.situation.noise ? p.situation.noise + ' ' : '') + p.answer);
  const stages = c.stages || STAGE_ORDER;
  let objKey = null, outcome = null;
  const reply = (turn, fitOrTone, extra) => ownerReply(turn.opt, fitOrTone, p, extra || {});
  const cheer = (fit, line) => { if(fit === 'warm' && c.streak >= 3 && !c.encouraged){ c.encouraged = true; line += ' ' + pick(p.r, REACT.encourage); } return line; };
  for(const stage of stages){
    if(!alive()) return;
    if(stage === 'questions' && !objKey) objKey = p.objections[0];
    if(stage === 'thanks') objKey = (outcome === 'booked' || outcome === 'email_only') ? 'yes' : 'no';
    let turn = await callerTurn(stage, stage === 'questions' || stage === 'thanks' ? objKey : p.lead);
    if(!turn || !alive()) return;
    if(await deliveryCheck(turn) === 'again'){ c.turns.pop(); turn = await callerTurn(stage, stage === 'questions' || stage === 'thanks' ? objKey : p.lead); if(!turn || !alive()) return; }
    const fit = fitOf(turn.q), f2 = fit === 'off' ? 'cool' : fit;
    c.stageQ[stage + (stage === 'questions' ? ':' + objKey : '')] = turn.q;
    applyTrust(turn);
    if(fit === 'off' && c.trust <= TRUST.hangup && stage !== 'thanks'){ await ownerSays(pick(p.r, REACT.hangup)); outcome = 'hung_up'; break; }
    if(stage === 'offer'){
      objKey = p.objections[0];
      await ownerSays(cheer(fit, reply(turn, f2, {objection:pick(p.r, OBJ[objKey].say)})));
    } else if(stage === 'questions'){
      const second = p.objections[1] && !c.didSecond && c.trust < 75 && stages.includes('next');
      if(second){
        c.didSecond = true;
        await ownerSays(reply(turn, f2) + ' ' + pick(p.r, OBJ[p.objections[1]].say));
        if(!alive()) return;
        objKey = p.objections[1];
        const t2 = await callerTurn('questions', objKey); if(!t2 || !alive()) return;
        const fit2 = fitOf(t2.q);
        c.stageQ['questions:' + objKey] = t2.q; applyTrust(t2);
        if(fit2 === 'off' && c.trust <= TRUST.hangup){ await ownerSays(pick(p.r, REACT.hangup)); outcome = 'hung_up'; break; }
        await ownerSays(cheer(fit2, reply(t2, fit2 === 'off' ? 'cool' : fit2)) + (c.trust >= TRUST.bridge && stages.includes('next') ? ' ' + pick(p.r, REACT.bridge) : ''));
      } else {
        await ownerSays(cheer(fit, reply(turn, f2)) + (c.trust >= TRUST.bridge && stages.includes('next') ? ' ' + pick(p.r, REACT.bridge) : ''));
      }
    } else if(stage === 'next'){
      const res = decideOutcome(fit, c.trust, A); outcome = res.outcome;
      await ownerSays(reply(turn, res.tone));
    } else {
      await ownerSays(cheer(fit, reply(turn, f2)));
    }
  }
  if(alive()){ c.outcome = outcome || c.outcome || (c.drill ? 'drill' : 'not_now'); await finishCall(); }
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
    $('#cMode').textContent = KIND_NAMES[c.kind]; $('#cSub').textContent = 'Practice line';
    $('.trust').classList.toggle('hidden', c.kind === 'free');
    return runScripted();
  }
  if(!alive()){ lc.stop(); return; }
  startClock(); AE.noiseOn(p.situation.noise); Full.start();
  // a calm "your turn" cue with a mic level, like the guided say bar
  $('#say').innerHTML = `<div class="saybar"><span id="sayState" class="listen">Listening. Talk naturally.</span><div class="lvl"><i id="sayLvl"></i></div></div>`;
  $('#say').classList.remove('hidden');
  // our own voice detection splits your turns into clips for playback and delivery metrics
  c.vadIv = setInterval(async () => {
    if(!alive()) return;
    const f = AE.frame(), now = performance.now();
    const lv = $('#sayLvl'); if(lv) lv.style.width = (lc.muted ? 0 : Math.max(0, Math.min(100, (f.db + 60)*1.8))) + '%';
    const ss = $('#sayState'); if(ss){ const msg = lc.muted ? 'Muted' : lc.ownerTalking ? `${p.onLine} is talking` : 'Listening. Your turn.'; if(ss.textContent !== msg) ss.textContent = msg; }
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
  if(!C) return 'greet';
  if(C.kind !== 'live') return C.stage || 'greet';
  const said = C.turns.map(t => (t.text || '').toLowerCase()).join(' ');
  const last = (C.lastOwner || '').toLowerCase();
  if(!/star ?well/.test(said)) return 'greet';
  if(C.turns.length < 2) return 'reason';
  if(/catch|cost|price|how much|send me|\bai\b|robot|agency|marketing company|word of mouth|referral|scam|my number|on a job|all set/.test(last)) return 'questions';
  if(!/(reviews|website|site|book|after|facebook|google|closes|phone)/.test(said)) return 'noticed';
  if(C.turns.length < 4) return 'follow';
  if(!/(free|yours|keep|example|show you)/.test(said)) return 'offer';
  if(!/email|text you|send it/.test(said)) return 'next';
  return 'thanks';
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
  if(C && C !== null) freeRecordings(C);
  C = newCall(kind, persona, extra);
  C.noMic = noMic;
  C.level = kind === 'guided' && !C.drill ? Math.min(3, guidedDone() + 1) : (C.drill ? 2 : 3);
  if(C.drill) C.trust = Math.max(C.trust, 55);
  showCall(C);
  if(kind === 'live') runLive(); else runScripted();
}
async function finishCall(){
  if(!C || C.ended) return;
  if(C.flushLive && !C.flushed){ C.flushed = true; await C.flushLive(); }
  C.dur = callSecs(C); C.ended = true;
  clearInterval(clockIv); clearInterval(C.vadIv);
  (C.aborts || []).slice().forEach(fn => { try{ fn(); }catch(e){} }); C.aborts = [];
  Listen.stop(); Cap.cancel(); Player.stop(); AE.noiseOff();
  if(C.live) C.live.stop();
  C.fullUrl = await Full.stop();
  AE.closeMic();
  $('#cAv').classList.remove('talk');
  addLine('sys', 'Call ended', 'ln sys');
  await sleep(700);
  $('#call').classList.add('hidden'); $('#say').classList.add('hidden'); $('#hint').classList.add('hidden');
  const rep = buildReport(C);
  C.report = rep;
  if(C.kind === 'guided' && !C.drill && !C.userEnded) LS.set('sw_pl_guided_' + me, String(guidedDone() + 1));
  saveCallToHistory(C, rep);
  showReport(C, rep);
  renderHome();
}
function freeRecordings(c){
  try{ (c.turns || []).forEach(t => t.url && URL.revokeObjectURL(t.url)); if(c.fullUrl) URL.revokeObjectURL(c.fullUrl); }catch(e){}
}
function guidedDone(){ return parseInt(LS.get('sw_pl_guided_' + me, '0'), 10) || 0; }
const _gd = () => parseInt(LS.get('sw_pl_guided_' + me, '0'), 10) || 0;

/* ======================================================================
   REPORT
   ====================================================================== */
const SKILL_NAMES_OLD = {opener:'Opener', truth:'True thing', discover:'His week', gift:'The gift', handle:'His questions', close:'Email + date', wrap:'Ending', delivery:'Delivery'};

function liveStageQ(c){
  // score a free-form transcript stage by stage
  const p = c.p, turns = c.turns.filter(t => t.text);
  const out = {}, idx = {};
  const first = turns[0];
  if(first){ out.opener = classify('opener', first.text, p); idx.opener = 0; }
  const used = new Set(first ? [0] : []);
  const find = (stage, test) => { for(let i = 0; i < turns.length; i++) if(!used.has(i) && test(turns[i].text.toLowerCase())){ used.add(i); return i; } return -1; };
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
    if(key){ const nx = log.slice(k + 1).find(x => x.who === 'c'); if(nx){ const ix = turns.findIndex((t, j) => t.text === nx.text && !used.has(j)); if(ix >= 0){ objKey = key; hi = ix; used.add(ix); break; } } }
  }
  if(objKey && hi >= 0){ out['handle:' + objKey] = classify('handle', turns[hi].text, p, objKey); idx['handle:' + objKey] = hi; }
  i = find('close', t => /email|send/.test(t));
  if(i >= 0){ out.close = classify('close', turns.slice(i).map(t => t.text).join(' '), p); idx.close = i; } else out.close = 'missing';
  const last = turns[turns.length - 1];
  if(last && turns.length > 2 && !used.has(turns.length - 1)){ out.wrap = classify('wrap', last.text, p); idx.wrap = turns.length - 1; }
  const q2 = {}, i2 = {};
  for(const k in out){ const [st, ob] = k.split(':'); const nk = (OLD2NEW[st] || st) + (ob ? ':' + ob : ''); q2[nk] = out[k]; if(idx[k] !== undefined) i2[nk] = idx[k]; }
  return {q:q2, idx:i2, turns};
}

const FITP = {warm:100, even:85, cool:50, off:10, missing:30};
function buildReport(c){
  const p = c.p;
  let stageQ = c.stageQ, turnFor = {};
  const allTurns = c.turns;
  if(c.kind === 'live'){ const lq = liveStageQ(c); stageQ = lq.q; for(const k in lq.idx) turnFor[k] = lq.turns[lq.idx[k]]; }
  else for(const t of allTurns) turnFor[t.stage + (t.stage === 'questions' || t.stage === 'handle' ? ':' + t.objKey : '')] = t;
  const fitK = k => stageQ[k] === 'missing' ? 'missing' : fitOf(stageQ[k]);

  const skills = {};
  for(const k in stageQ){ const st = k.split(':')[0]; (skills[st] = skills[st] || []).push(FITP[fitK(k)]); }
  for(const st in skills) skills[st] = Math.round(skills[st].reduce((a, b) => a + b, 0)/skills[st].length);

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
  const text = allTurns.map(t => ' ' + (c.kind === 'guided' ? (t.said || '') : (t.text || '')).toLowerCase() + ' ').join(' ');
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

  const strengths = [], fixes = [], also = [];
  const hasTime = t => /\b(monday|tuesday|wednesday|thursday|friday|saturday|tomorrow|morning|afternoon|evening|\d{1,2}(:\d\d)?\s*(am|pm)?|seven|eight|nine|ten|four|five|six)\b/i.test(t || '');
  const yesNo = (c.outcome === 'booked' || c.outcome === 'email_only') ? 'yes' : 'no';
  const keys = Object.keys(stageQ).sort((a, b) => STAGE_ORDER.indexOf(a.split(':')[0]) - STAGE_ORDER.indexOf(b.split(':')[0]));
  for(const k of keys){
    const [stage, obj] = k.split(':'); const fit = fitK(k), t = turnFor[k];
    const name = stage === 'questions' && OBJ[obj] ? OBJ[obj].skill : SKILL_NAMES[stage];
    const step = CALL_GUIDE.steps[stage] || {};
    const tk = TAKE[stage] || TAKE[NEW2OLD[stage]] || {};
    // the owner's own words about this step, matched to what the caller actually said
    let tkLine = tk[fit === 'missing' ? 'even' : fit === 'off' ? 'cool' : fit] || '';
    if(stage === 'next' && t && hasTime(t.text)) tkLine = fit === 'warm' ? tk.warm || '' : c.outcome === 'booked' ? 'You gave me a real time. That made it easy.' : 'You offered a real time. I just wasn\'t ready to pick one yet.';
    if(fit === 'warm'){ strengths.push({stage, name, quote:t ? t.text : '', why:stripCite((t && t.why) || step.why || ''), take:tkLine, url:t && t.url}); continue; }
    let best = t && t.best;
    if(!best){ const o = optionsFor(stage, p, stage === 'questions' ? obj : stage === 'thanks' ? yesNo : p.lead); best = o.find(x => x.q === 'best') || o[0]; }
    const bwhy = best ? stripCite(best.why) : '';
    if(fit === 'even'){ also.push({stage, name, fit, quote:t ? t.text : '', style:t && t.style, better:best ? best.t : '', betterStyle:best ? best.style : '', why:bwhy, url:t && t.url}); continue; }
    const why = fit === 'missing' ? `You didn't get to this step. ${stripCite(step.why || '')}`
      : fit === 'off' ? `To an owner, that can sound like pressure or criticism. Stay on the owner's side. ${bwhy}`
      : `It didn't quite land for ${p.onLine}. ${bwhy}`;
    fixes.push({stage, name, fit, quote:t ? t.text : '', better:best ? best.t : '', betterStyle:best ? best.style : '', why,
      take:tkLine, url:t && t.url, sev:{off:4, cool:3, missing:2}[fit]});
  }
  fixes.sort((a, b) => b.sev - a.sev);

  const dfix = [];
  const worst = (arr, f) => arr.slice().sort((a, b) => f(b) - f(a))[0];
  if(D.wpm > DELIVERY.pace.high){ const t = worst(wpmT, x => x.m.wpm); dfix.push({name:`A little fast: ${D.wpm} words a minute`, quote:t && t.text, url:t && t.url, better:'Slow down on the shop\'s name, "StarWell", and the day and time. Take one breath after you say why you\'re calling.', why:`Calm sounds helpful. Rushed sounds like a pitch. Aim for ${DELIVERY.pace.target}.`, tag:''}); }
  else if(D.wpm && D.wpm < DELIVERY.pace.low){ const t = worst(wpmT, x => -x.m.wpm); dfix.push({name:`A little slow: ${D.wpm} words a minute`, quote:t && t.text, url:t && t.url, better:'Read the line twice before the call so it flows. Talk like you would to a neighbor.', why:`Very slow can sound unsure or read from a page. Aim for ${DELIVERY.pace.target}.`, tag:''}); }
  if(D.st && D.st < 1.6){ const t = worst(said.filter(x => x.m.st > 0), x => -x.m.st); dfix.push({name:'Your voice stayed flat', quote:t && t.text, url:t && t.url, better:'Lift your voice on the one word that matters: the shop\'s name, "free", "yours", the day.', why:'A flat voice sounds read from a script. A little lift sounds like you mean it.', tag:''}); }
  if(D.rises.length){ const t = D.rises[0]; dfix.push({name:'Statements that sounded like questions', quote:t.text, url:t.url, better:'Let your voice land down at the end of statements, like "I had one quick question about your shop."', why:'Rising at the end sounds like asking permission. Owners trust callers who sound sure of why they\'re calling.', tag:''}); }
  if(D.trails.length){ const t = D.trails[0]; dfix.push({name:'Trailing off at the end', quote:t.text, url:t.url, better:'Keep your volume up through the last words. The ask is usually at the end.', why:'The important part, like the day and time, comes last. If it fades, the owner misses it on a noisy job.', tag:''}); }
  if(D.fillers + D.hedges.length >= 2) dfix.push({name:`Soft words (${D.fillers + D.hedges.length})`, quote:D.hedges.length ? `You said: "${D.hedges.join('", "')}"` : '', better:'Swap "I just wanted to" and "sorry to bother you" for your reason for calling.', why:'Sounding sorry makes the call feel like a bother. You have a real reason to call, so lead with it.', tag:''});
  if(D.missed.length >= 3) dfix.push({name:'Words that didn\'t come through clearly', quote:D.missed.join(', '), url:(allTurns.find(t => (t.missed || []).length > 2) || {}).url, better:'Say these slowly three times before your next call. Names and numbers matter most.', why:'The owner may be on a cell phone in a truck. If "StarWell" or the day sounds mushy, they won\'t remember who called.', tag:''});
  if(D.latency > 3) dfix.push({name:`Pauses before answering (${D.latency}s)`, better:'Learn the four common questions (the catch, the price, AI, "send me an email") until the answers come easily.', why:'A long pause after "what\'s the catch?" can sound like there is one. A calm, quick answer sounds honest.', tag:''});
  if(D.talk && (D.talk < 35 || D.talk > 72)) dfix.push({name:`You talked ${D.talk}% of the call`, better: D.talk < 35 ? 'Lead a little more: say why you\'re calling, offer the gift clearly, then ask for the email and a time.' : 'After each question, stop and let the owner answer fully.', why:'In calls that go well, you talk a little over half the time.', tag:''});
  if(D.longest > 45) dfix.push({name:`Longest stretch talking: ${D.longest}s`, better:'One sentence, then a question.', why:'Long stretches lose people on the phone. Keep each turn under about 40 seconds.', tag:''});

  const outcomeLabel = outcomeOf(c.outcome).label;
  const good = c.outcome === 'booked' || c.outcome === 'email_only';
  const pri = ['follow','noticed','next','offer','questions','reason','greet','thanks'];
  const topWin = strengths.slice().sort((x, y) => pri.indexOf(x.stage) - pri.indexOf(y.stage))[0];
  let take = c.ownerWhy || (good && topWin ? topWin.take : fixes.length ? fixes[0].take : topWin ? topWin.take : fill(ARCH[p.arch].take, p));
  const f0 = fixes[0];
  const a0 = also[0];
  const drill = f0 && f0.better ? `In the ${f0.name} step, try the ${f0.betterStyle} style. Say it out loud three times first: "${f0.better}"`
    : dfix[0] ? `Next call, focus on one thing: ${dfix[0].better}`
    : a0 && a0.better ? `In the ${a0.name} step, try ${a0.betterStyle.toLowerCase()} next time: "${a0.better}"`
    : 'Keep everything that worked. You\'re ready for a tougher owner or a live call.';
  // what happened at the next step, based on what you actually said
  const nextT = turnFor.next;
  const outcomeNote = c.outcome === 'email_only' ? (nextT && hasTime(nextT.text) ? `You offered a specific time. ${p.onLine} wasn't ready to pick one yet. More trust earlier in the call makes that easier.` : 'Next time, also ask for one specific 15-minute time.')
    : c.outcome === 'booked' ? 'Email and a specific time. That\'s the goal.' : c.outcome === 'not_now' ? `A polite no is still a good call. ${p.onLine} will remember StarWell as respectful.` : '';
  return {score, skills, D, strengths, fixes, also, dfix, outcomeLabel, outcomeNote, take, drill, stageQ, good};
}

const SKILL_NAMES = Object.assign({}, STEP_NAMES, {delivery:'Your voice'});
const skillName = k => SKILL_NAMES[k] || SKILL_NAMES[OLD2NEW[k]] || (k ? String(k).charAt(0).toUpperCase() + String(k).slice(1) : 'Next time');
function bar(name, v){ const col = v >= 80 ? 'var(--success)' : v >= 55 ? 'var(--accent)' : 'var(--warning)'; return `<div class="bar"><span>${esc(name)}</span><div class="t"><i style="width:${v}%;background:${col}"></i></div><b>${v}</b></div>`; }
const playBtn = (url, label) => url ? `<button class="play" data-play="${url}"><svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z"/></svg>${label || 'Hear yourself'}</button>` : '';
const guideLink = id => id && CALL_GUIDE.steps[OLD2NEW[id] || id] ? `<button class="gl" data-guidecard="${OLD2NEW[id] || id}">See this step in the call guide →</button>` : '';
const outcomePill = k => { const o = outcomeOf(k); return `<span class="outcome ${o.col}"><span aria-hidden="true">${o.icon}</span>${esc(o.label)}</span>`; };
const fmtDur = s => { s = Math.round(s || 0); return s < 60 ? `${s}s` : `${Math.floor(s/60)}m ${String(s%60).padStart(2, '0')}s`; };

function showReport(c, rep, fromHist){
  const p = c.p, D = rep.D;
  const meters = [];
  if(D.wpm) meters.push([`${D.wpm}`, 'words a minute (goal 150–180)', D.wpm >= DELIVERY.pace.low && D.wpm <= DELIVERY.pace.high]);
  if(D.acc !== null && D.acc !== undefined) meters.push([`${D.acc}%`, 'words clearly heard', D.acc >= 80]);
  meters.push([`${D.fillers + (D.hedges || []).length}`, 'soft words and fillers', D.fillers + (D.hedges || []).length < 2]);
  if(D.talk) meters.push([`${D.talk}%`, 'you talking (goal about 55%)', D.talk >= 40 && D.talk <= 70]);
  if(D.latency) meters.push([`${D.latency}s`, 'pause before answering', D.latency <= 3]);
  const g = guidedDone();
  const nextKind = c.drill ? null : g < 2 ? 'guided' : 'live';
  const you = me || 'You';
  const fixHTML = f => `<div class="item"><h4>${esc(f.name)} <span class="tag ${f.fit === 'missing' ? 'gray' : 'yellow'}">${{off:'Felt like pressure', cool:'Didn\'t land', missing:'Skipped'}[f.fit]}</span></h4>
      ${f.quote ? `<div class="ex bad"><small>You said</small>"${esc(f.quote)}"</div>` : ''}
      ${f.better ? `<div class="ex"><small>Try (${esc(f.betterStyle)})</small>"${esc(f.better)}"</div>` : ''}
      <p class="why">${esc(f.why)}</p>
      <div class="row">${playBtn(f.url)} ${guideLink(f.stage)}</div></div>`;
  const alsoHTML = f => `<div class="item"><h4>${esc(f.name)} <span class="tag gray">Also fits</span></h4>
      ${f.quote ? `<div class="ex mine"><small>You said${f.style ? ` (${esc(f.style)})` : ''}</small>"${esc(f.quote)}"</div>` : ''}
      ${f.better ? `<div class="ex"><small>Closest fit for ${esc(p.onLine)} (${esc(f.betterStyle)})</small>"${esc(f.better)}"</div>` : ''}
      ${f.why ? `<p class="why">${esc(f.why)}</p>` : ''}${playBtn(f.url)}</div>`;
  const dfixHTML = f => `<div class="item"><h4>${esc(f.name)}</h4>${f.quote ? `<div class="ex bad"><small>You said</small>${esc(f.quote)}</div>` : ''}<div class="ex"><small>Try</small>${esc(f.better)}</div><p class="why">${esc(f.why)}</p>${playBtn(f.url)}</div>`;
  // exactly one win and one thing to try, up front
  const pri = ['follow','noticed','next','offer','questions','reason','greet','thanks'];
  const win = rep.strengths.slice().sort((x, y) => pri.indexOf(x.stage) - pri.indexOf(y.stage))[0];
  const stepsDone = new Set(c.turns.map(t => t.stage).filter(Boolean)).size;
  const fix = rep.fixes[0];
  const rest = rep.fixes.slice(1).map(fixHTML).concat(rep.also.map(alsoHTML));
  const winHTML = win ? `<div class="item"><h4>${esc(win.name)} <span class="tag green">Great fit</span></h4>${win.quote ? `<div class="ex"><small>You said</small>"${esc(win.quote)}"</div>` : ''}${win.why ? `<p class="why">${esc(win.why)}</p>` : ''}${playBtn(win.url)}</div>`
    : rep.also.length ? `<div class="item"><p class="why">Every line you picked was a good one for ${esc(p.onLine)}. ${stepsDone ? `You got through ${stepsDone} step${stepsDone > 1 ? 's' : ''} and kept it friendly.` : ''}</p></div>`
    : `<div class="item"><p class="why">${stepsDone ? `You got through ${stepsDone} step${stepsDone > 1 ? 's' : ''} and stayed on the call. That's the hardest part.` : 'You picked up the phone. That\'s the hardest part.'}</p></div>`;
  const tryHTML = fix ? fixHTML(fix) : rep.also[0] ? alsoHTML(rep.also[0]) : rep.dfix[0] ? dfixHTML(rep.dfix[0]) : `<p class="why">Every step fit ${esc(p.onLine)}. Try a tougher owner or a live call next.</p>`;
  const restAll = fix ? rest : rep.also[0] ? rep.fixes.slice(1).map(fixHTML).concat(rep.also.slice(1).map(alsoHTML)) : rest;
  const dUsed = fix || rep.also[0] ? 0 : 1;   // the first voice note may already be "Try this next"
  const dTop = rep.dfix.slice(dUsed, dUsed + 1), dRest = rep.dfix.slice(dUsed + 1);
  const typeLabel = c.drill ? (DRILL_NAMES[c.drill] || 'Drill') : KIND_NAMES[c.kind];
  $('#reportIn').innerHTML = `
    <div class="ptop"><h2>How it went</h2><button class="btn light x" data-close="report">Close</button></div>
    <section class="box"><div class="rhead">
      <div style="min-width:0"><div class="lbl">${esc(typeLabel)} · ${esc(p.onLine)} at ${esc(p.shop)}</div>
        ${outcomePill(c.outcome)}
        ${rep.outcomeNote ? `<p class="note" style="margin:4px 0 0">${esc(rep.outcomeNote)}</p>` : ''}
        <div class="note" style="margin-top:6px">${fmtDur(c.dur)} · ${esc(ARCH[p.arch].label)}</div></div>
      <div style="text-align:right"><span class="score">${rep.score}</span><span class="note"> / 100</span></div></div>
      <div class="quote" style="margin-top:12px">${esc(p.onLine)}: "${esc(rep.take)}"</div>
      ${c.fullUrl ? `<div style="margin-top:8px">${playBtn(c.fullUrl, 'Play the whole call')}</div>` : ''}
    </section>
    <section class="box"><h3>What worked</h3>${winHTML}</section>
    <section class="box"><h3>Try this next</h3>${tryHTML}
      ${restAll.length ? `<details><summary class="gl">${restAll.length} more note${restAll.length > 1 ? 's' : ''}</summary>${restAll.join('')}</details>` : ''}</section>
    <section class="box hidden" id="aiBox"></section>
    <section class="box"><h3>How you sounded</h3><div class="meter">${meters.map(m => `<div><b class="${m[2] ? 'ok' : 'warn'}">${esc(m[0])}</b><small>${esc(m[1])}</small></div>`).join('')}</div>
      ${dTop.map(dfixHTML).join('') || '<p class="note" style="margin-top:10px">Pace and clarity sounded good.</p>'}
      ${dRest.length ? `<details><summary class="gl">More about your voice</summary>${dRest.map(dfixHTML).join('')}</details>` : ''}
      <p class="note" style="margin:8px 0 0">Voice measures come from your microphone and are estimates.</p></section>
    <section class="box">
      ${skillScores(rep)}
      <details><summary style="font-weight:600">Transcript</summary><div class="tr">${c.log.map(l => `<p class="${l.who}"><b>${esc(l.who === 'o' ? p.onLine : you)}:</b> ${esc(l.text)} ${l.turn !== undefined && c.turns[l.turn] ? playBtn(c.turns[l.turn].url, 'Play') : ''}</p>`).join('')}</div></details>
    </section>
    <div class="actions">
      ${nextKind === 'guided' ? `<button class="btn black wide" data-start="guided">Start guided call ${g + 1}</button>` : nextKind === 'live' ? `<button class="btn black wide" data-start="live">Start a live call</button><button class="btn light" data-start="guided">Another guided call</button>` : `<button class="btn black wide" data-drill="${esc(c.drill)}">Run the drill again</button>`}
      <button class="btn light" data-close="report">Back home</button></div>`;
  openPage('report');
  if(!fromHist) aiReview(c, rep);
  else if(c.ai) renderAI(c.ai, p);
}
function skillScores(rep){
  return `<details><summary style="font-weight:600">Score by step</summary><div class="bars" style="margin:4px 0 8px">${Object.keys(SKILL_NAMES).filter(k => rep.skills[k] !== undefined).map(k => bar(SKILL_NAMES[k], rep.skills[k])).join('')}</div>
    <p class="note">Each step: great fit 100, also fits 85, didn't land 50, skipped 30. Your score is 70% steps and 30% voice.</p></details>`;
}

async function aiReview(c, rep){
  const box = $('#aiBox');
  if(!Voice.can().xai){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `<h3>Coach notes</h3><p class="note">Your AI coach is reading the call…</p>`;
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
  }catch(e){ diag('AI review failed: ' + e.message); box.classList.add('hidden'); }
}
function renderAI(ai, p){
  const box = $('#aiBox'); if(!box) return;
  if(!ai || (!ai.summary && !(ai.improvements || []).length)){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  box.innerHTML = `<h3>Coach notes <span class="tag blue">AI coach</span></h3>
    ${ai.summary ? `<p>${esc(ai.summary)}</p>` : ''}
    ${(ai.improvements || []).slice(0, 1).map(f => `<div class="item"><h4>${esc(skillName(f.skill))}</h4>${f.quote ? `<div class="ex bad"><small>You said</small>"${esc(f.quote)}"</div>` : ''}${f.better ? `<div class="ex"><small>Try</small>"${esc(f.better)}"</div>` : ''}<p class="why">${esc(f.why)}</p>${guideLink(f.guide)}</div>`).join('')}
    ${(ai.improvements || []).length > 1 || (ai.strengths || []).length || ai.drill ? `<details><summary class="gl">More from the coach</summary>
      ${(ai.improvements || []).slice(1).map(f => `<div class="item"><h4>${esc(skillName(f.skill))}</h4>${f.quote ? `<div class="ex bad"><small>You said</small>"${esc(f.quote)}"</div>` : ''}${f.better ? `<div class="ex"><small>Try</small>"${esc(f.better)}"</div>` : ''}<p class="why">${esc(f.why)}</p>${guideLink(f.guide)}</div>`).join('')}
      ${(ai.strengths || []).length ? `<div class="item"><h4>Keep doing</h4>${ai.strengths.map(s => `<p class="why">"${esc(s.quote)}": ${esc(s.why)}</p>`).join('')}</div>` : ''}
      ${ai.drill ? `<p class="why"><b>Practice:</b> ${esc(ai.drill)}</p>` : ''}</details>` : ''}`;
}

function saveCallToHistory(c, rep){
  const h = hist();
  h.push({id:c.id, ts:Date.now(), kind:c.drill ? 'drill' : c.kind, arch:c.p.arch, shop:c.p.shop, owner:c.p.onLine, town:c.p.town, outcome:c.outcome, score:rep.score, skills:rep.skills,
    dur:Math.round(c.dur || 0), wpm:rep.D.wpm, log:c.log.map(l => ({who:l.who, text:l.text})), fixes:rep.fixes.slice(0, 3).map(f => f.name).concat(rep.also.slice(0, 2).map(f => f.name)), drill:rep.drill, take:rep.take, note:rep.outcomeNote || ''});
  saveHist(h);
}

/* ======================================================================
   PREP SLIDES
   ====================================================================== */
let pending = null;   // {kind, p}
const GIFT_WORDS = {phone:'the demo line that answers when they can\'t', site:'a fresh website', found:'the one-page search check', social:'a month of posts from their real jobs'};
const OBJ_Q = {catch:/catch/i, price:/cost|price|how much/i, allset:/all set|already have|nephew/i, email:/email/i, busy:/busy|on a job|can't talk/i, ai:/\bAI\b|robot/i, agency:/agency|marketing|burned|SEO compan/i, wordofmouth:/word of mouth|referral/i, scam:/scam|number/i};
function slidesHTML(p, forPrep, stages){
  const f = p.facts, first = p.owner.split(' ')[0], A = ARCH[p.arch];
  const stars = '★'.repeat(Math.round(f.rating)) + '☆'.repeat(5 - Math.round(f.rating));
  const eyes = t => `<div class="eyes"><small>Through ${esc(p.onLine)}'s eyes</small>"${esc(t)}"</div>`;
  const say = (t, gift) => `<div class="sayit"><small>What to say</small>${esc(t)}${gift ? `<span class="gfit">Gift fit: ${esc(GIFT_WORDS[gift])}</span>` : ''}</div>`;
  const out = [], keys = [];
  const push = (k, h) => { keys.push(k); out.push(h); };
  out.keys = keys;
  const freeTalk = forPrep === 'live' || forPrep === 'free';
  const list = stages ? STEPS.filter(x => stages.includes(x[0])) : STEPS;
  if(forPrep) push('intro', `<div class="box"><div class="lbl">${stages ? 'This drill' : 'How this call goes'}</div>
      <h3 style="font-size:20px">${stages ? `Practice ${list.length === 2 ? 'two steps' : 'these steps'}: ${esc(list.map(x => x[1]).join(' and '))}.` : `Your goal: ${esc(p.onLine)} feels noticed and respected, and gladly says yes to something useful.`}</h3>
      ${freeTalk ? '<p class="prepnote">No lines here. Talk naturally. The Hint button is there if you freeze.</p>' : `<p class="note">${stages ? '' : 'Start like a person, not a pitch. The offer comes after you understand how the owner\'s week goes. '}Each turn you'll see three good lines. Pick the one that fits ${esc(p.onLine)}, then say it out loud.</p>`}
      <ol class="flow">${list.map(x => `<li><b>${esc(x[1])}</b> · ${esc(SCRIPT_LIB.arc[x[0]] || '')}</li>`).join('')}</ol></div>`);
  if(p.real){
    const R = p.real;
    push('real', `<div class="box"><div class="lbl">Real shop · from public listings</div><h3 style="font-size:22px">${esc(R.name)}</h3>
      <div class="kv"><div><small>Town</small><span>${esc(R.town)}, ${esc(R.county)} County</span></div>
      ${R.phone ? `<div><small>Listed phone</small><span>${esc(R.phone)}</span></div>` : ''}
      ${R.website ? `<div><small>Website</small><span><a href="${esc(R.website)}" target="_blank" rel="noopener">${esc(R.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a></span></div>` : ''}
      ${R.services ? `<div><small>Listed as</small><span>${esc(R.services)}</span></div>` : ''}</div>
      <p class="note" style="margin-top:10px">The person you'll talk to, the hours, reviews and website details below are a <b>practice scenario</b>, not facts about this shop. Before a real call, check their website and Google listing and use one real detail.${R.source ? ` <a href="${esc(R.source)}" target="_blank" rel="noopener">Where this listing came from</a>` : ''}</p></div>`);
  }
  // 1 · who he is
  const old = +f.since <= 1990, small = f.techs <= 6;
  const scen = p.real ? ' <span class="chip">practice scenario</span>' : '';
  push('who', `<div class="box"><div class="lbl">Who ${p.gk ? 'answers' : 'you\'re calling'}${scen}</div><h3 style="font-size:22px">${esc(p.shop)}</h3>
    <div class="kv"><div><small>${p.gk ? 'Owner' : 'Owner'}</small><span>${esc(p.owner)}</span></div><div><small>Town</small><span>${esc(p.town)}, CT</span></div><div><small>Since</small><span>${esc(f.since)}</span></div>
    <div><small>Team</small><span>${f.techs} techs, ${f.trucks} trucks</span></div><div><small>Office hours</small><span>7:30 AM to ${esc(f.close)} PM</span></div><div><small>Main work</small><span>${esc(f.services.join(', '))}</span></div></div>
    ${p.gk ? `<p class="note" style="margin-top:10px">${esc(p.onLine)} usually answers the main line.</p>` : ''}
    ${eyes(p.gk ? `I keep ${p.shop} running and I protect ${first}'s time. Respect mine and I'll get you to him.` : old ? `I've kept this shop going since ${f.since}. People in ${p.town} know my name.` : small ? `I'm probably on a job myself right now. Show me you noticed something real.` : `${f.techs} guys depend on me. Show me you looked at my shop, not a list.`)}
    ${say(p.gk ? `"You probably know the phones better than anyone at ${p.shop}."` : `"Serving ${p.town} since ${f.since}, that's something." Save it for later in the call, or the goodbye.`)}</div>`);
  // 2 · reviews
  push('reviews', `<div class="box"><div class="lbl">What customers say${scen}</div><h3><span class="stars">${stars}</span> ${f.rating} on Google · ${f.reviews} reviews</h3>
    ${p.real ? `<p class="note">Practice scenario: customers often name ${esc(f.tech)} in reviews. Before a real call, read their actual Google reviews and pick one real detail.</p>` : p.reviewsList.map(t => `<div class="rev">"${esc(t)}"<br><small>Google review</small></div>`).join('')}
    ${eyes('My guys work hard and customers notice. If you saw that, you looked at my shop.')}
    ${say(`"${f.rating} stars from ${f.reviews} reviews, and people keep naming ${f.tech}. That's rare."`, +f.rating >= 4.7 ? 'found' : 'site')}</div>`);
  // 3 · after hours and website
  const eyeAfter = {voicemail:'Most people who hit voicemail don\'t leave a message. They call the next guy.', service:'I pay for an answering service that takes messages and books nothing.', cell:'After a ten-hour day it rings my cell. My family hates it.', none:'After hours it just rings. I know.'}[f.after];
  const sayAfter = f.after === 'cell' ? `"Looks like after-hours calls come straight to you. How does that go when you're on a job?"` : `"Your site says the office closes at ${f.close}, and I didn't see a way to reach anyone after that. How do evening no-heat calls get handled?"`;
  const siteSay = i => /book/.test(i) ? `"I didn't see a way to book at night, and you've got ${f.reviews} great reviews. How do people reach you after dinner?"`
    : /tap-to-call|slow/.test(i) ? `"On my phone the number wasn't tap-to-call. Most people find you on their phone at night."`
    : /heat pump|nearby towns/.test(i) ? `"When people in ${p.town} ask about heat pump rebates, there isn't a page of yours that answers it."` : '';
  const issue = f.siteIssues.find(i => siteSay(i));
  push('after', `<div class="box"><div class="lbl">After hours and the website${scen}</div>
    <div class="flag gap"><b>!</b><span>After ${esc(f.close)}, calls go to ${esc(f.afterLabel)}.</span></div>
    ${f.siteIssues.map(x => `<div class="flag gap"><b>!</b><span>Website: ${esc(x)}.${/2019/.test(x) ? ' <i>(True, but skip it. It sounds like a judgment.)</i>' : ''}</span></div>`).join('')}
    <div class="flag good"><b>✓</b><span>Phone number is on the home page and the Google listing.</span></div>
    ${eyes(eyeAfter)}
    ${say(sayAfter, 'phone')}${issue ? say(siteSay(issue), /heat pump|nearby/.test(issue) ? 'found' : 'site') : ''}</div>`);
  // 4 · how people find him
  const stale = !/week/.test(f.lastPost);
  push('found', `<div class="box"><div class="lbl">How people find the shop${scen}</div>
    <div class="flag gap"><b>!</b><span>${esc(f.aiCheck)}</span></div>
    <div class="flag"><b>i</b><span>Last social post: ${esc(f.lastPost)}.</span></div>
    <div class="flag"><b>i</b><span>${f.hiring ? 'Hiring a service tech right now.' : 'Not hiring right now.'}</span></div>
    <div class="flag good"><b>✓</b><span>Why now: heating season in Connecticut. First cold nights, no-heat calls after dinner.</span></div>
    ${eyes(f.hiring ? 'I need techs. My guys are stretched thin.' : 'Word of mouth has always worked. I don\'t have time to chase Google.')}
    ${say(`"I asked my phone for ${f.search || 'furnace repair'} in ${p.town}, and two other shops came up before ${p.shopSaid || p.shop}, even with your reviews. How do most new customers find you?"`, 'found')}
    ${stale ? say(`"Your last post was ${f.lastPost}. People who hear about you from a neighbor often check there first."`, 'social') : ''}
    ${f.hiring ? say('"You\'re hiring, so the crew\'s stretched. That\'s usually when calls slip."', 'phone') : ''}</div>`);
  // 5 · game plan
  const second = p.lead !== 'site' && f.siteIssues.some(i => /book|tap-to-call|slow/.test(i)) ? 'site' : stale ? 'social' : 'found';
  const reasons = {phone:`Every call after ${f.close} goes to ${f.afterLabel}. The demo line catches them, and ${p.onLine} can try it on its own number first.`, site:'People find the shop at night and can\'t book. A fresh site to look at before deciding.', found:'The reviews are better than the shops showing up first.', social:'Neighbors check the page before calling. Real job photos keep it alive.'};
  const ready = Object.keys(A.objections).sort((a, b) => A.objections[b] - A.objections[a]).slice(0, 2)
    .map(k => CALL_GUIDE.questions.find(q => OBJ_Q[k] && OBJ_Q[k].test(q.q))).filter(Boolean);
  const dq = ((CALL_GUIDE.steps.follow || CALL_GUIDE.steps.discover || {say:['']}).say[0] || '');
  push('plan', `<div class="box"><div class="lbl">Your game plan</div>
    <div class="kv" style="grid-template-columns:1fr">
      <div><small>Clue about who answers</small><span>${esc(A.clue)}</span></div>
      <div><small>What to notice</small><span>${esc(A.notice || A.how)}</span></div>
      <div><small>Main thing to offer</small><span>${esc(GIFT_WORDS[p.lead])}. ${esc(reasons[p.lead])}</span></div>
      <div><small>Mention in one line</small><span>${esc(GIFT_WORDS[second])}</span></div>
      <div><small>What you noticed</small><span>${esc(p.trueThing ? p.trueThing + '.' : sayAfter.replace(/"/g, ''))}</span></div>
      <div><small>Follow-up question</small><span>${esc(gfill(dq, p).replace(/[“”]/g, ''))}</span></div>
      <div><small>15-minute walkthrough time to offer</small><span>${esc(p.day)} at ${esc(p.time)}, ${esc(p.vars.when)}</span></div></div>
    ${ready.length ? `<div class="lbl" style="margin-top:12px">Be ready for</div>${ready.map(q => `<details class="gq"><summary>${esc(gfill(q.q, p))}</summary><p>${esc(gfill(q.a, p))}</p></details>`).join('')}` : ''}
    <p class="note" style="margin-top:12px">${p.brief ? 'Facts from your Prospect Brief or research. The owner\'s personality is still a surprise.' : p.real ? 'Real Connecticut shop, practice scenario. Every call is a new person and situation.' : 'Practice shop: invented for this call.'}</p></div>`);
  return out;
}
let slideI = 0;
function openPrep(kind, p, extra){
  pending = {kind, p, extra};
  const stages = extra && extra.stages;
  let s = slidesHTML(p, kind, stages);
  if(stages){ const keep = ['intro', 'real', 'who', 'plan']; const ks = s.keys; s = s.filter((_, i) => keep.includes(ks[i])); }
  slideI = 0;
  pending.first = kind === 'guided' && !stages && guidedDone() === 0;
  $('#prepMode').textContent = stages ? (DRILL_NAMES[extra.drill] || 'Drill') : KIND_NAMES[kind];
  $('#slides').innerHTML = s.map((h, i) => `<div class="slide${i ? '' : ' on'}">${h}</div>`).join('');
  paintSlide();
  openPage('prep');
}
function paintSlide(){
  const sl = $$('#slides .slide');
  sl.forEach((s, i) => s.classList.toggle('on', i === slideI));
  $('#prep').scrollTop = 0;
  const last = slideI === sl.length - 1;
  $('#sCount').textContent = `${slideI + 1} of ${sl.length}`;
  $('#sPrev').disabled = slideI === 0;
  $('#sNext').classList.toggle('hidden', last);
  $('#readyBtn').classList.toggle('hidden', !last);
  $('#sSkip').classList.toggle('hidden', last || !!(pending && pending.first));
}
$('#sPrev').onclick = () => { slideI = Math.max(0, slideI - 1); paintSlide(); };
$('#sNext').onclick = () => { slideI = Math.min($$('#slides .slide').length - 1, slideI + 1); paintSlide(); };
const goCall = () => { if(!pending) return; closePage('prep'); const {kind, p, extra} = pending; pending = null; beginCall(kind, p, extra); };
$('#readyBtn').onclick = goCall; $('#sSkip').onclick = goCall;

/* ======================================================================
   THE GUIDE, built into the app
   ====================================================================== */
/* outside a call, the guide fills its lines with one consistent example shop */
const SAMPLE_VARS = {name:'Dave', owner:'Dave', shop:'Hillside Heating', town:'Hamden', close:'5', rating:'4.8', reviews:'120', tech:'Mike', day:'Tuesday', time:'7:30', when:'before the trucks go out', email:'dave@hillsideheating.com', day2:'Wednesday', gk:'Linda'};
function gfill(t, p){ const v = Object.assign({}, SAMPLE_VARS, {me: me || 'you'}, p ? p.vars : {}); return String(t).replace(/\{(\w+)\}/g, (m, k) => v[k] ?? m); }
function guideHTML(stage, p, tab){
  const G = CALL_GUIDE; stage = OLD2NEW[stage] || stage; const st = G.steps[stage] ? stage : 'greet';
  tab = tab || 'step';
  const chips = STEPS.map(x => `<button class="gchip ${x[0] === st && tab === 'step' ? 'on' : ''}" data-gstep="${x[0]}">${esc(x[1])}</button>`).join('');
  const tabs = [['step','Steps'],['gifts','Gifts'],['questions','FAQ'],['rules','Rules']].map(t => `<button class="gtab ${t[0] === tab ? 'on' : ''}" data-gtab="${t[0]}">${t[1]}</button>`).join('');
  let body = '';
  if(tab === 'step'){
    const s = G.steps[st];
    body = `<div class="gstep"><h3>${esc(s.title)}</h3>${s.secs ? `<span class="chip">about ${s.secs} seconds</span>` : ''}
      ${p ? '' : `<p class="note" style="margin:8px 0 0">Example shop: ${SAMPLE_VARS.shop} in ${SAMPLE_VARS.town}, owner ${SAMPLE_VARS.name}.</p>`}
      <div class="lbl" style="margin-top:12px">What to say</div><ul class="glist">${s.say.map(x => `<li>${esc(gfill(x, p))}</li>`).join('')}</ul>
      <div class="lbl">Why it works for the owner</div><p class="why">${esc(gfill(stripCite(s.why), p))}</p>
      ${s.avoid && s.avoid.length ? `<div class="lbl">Skip</div><ul class="glist avoid">${s.avoid.map(x => `<li>${esc(gfill(x, p))}</li>`).join('')}</ul>` : ''}
      ${SCRIPT_LIB.arc && SCRIPT_LIB.arc[st] ? `<p class="note"><b>Your tone here:</b> ${esc(SCRIPT_LIB.arc[st])}</p>` : ''}</div>`;
  } else if(tab === 'gifts'){
    body = G.services.map(x => `<div class="item"><h4>${esc(x.name)}</h4><p>${esc(gfill(x.ownerWords, p))}</p><p class="note"><b>Picture it:</b> ${esc(x.analogy)}</p><p class="note"><b>Honest limits:</b> ${esc(x.honestLimits)}</p></div>`).join('');
  } else if(tab === 'questions'){
    body = G.questions.map(x => `<details class="gq"><summary>${esc(gfill(x.q, p))}</summary><p>${esc(gfill(x.a, p))}</p></details>`).join('');
  } else {
    body = `<ul class="glist">${G.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  }
  return `<div class="gtabs">${tabs}</div>${tab === 'step' ? `<div class="gchips">${chips}</div>` : ''}<div class="gbody">${body}</div>`;
}
function mountGuide(el, stage, p){
  let cur = stage, tab = 'step';
  const paint = () => { el.querySelector('.gwrap').innerHTML = guideHTML(cur, p, tab); };
  paint();
  el.onclick = e => {
    const a = e.target.closest('[data-gstep]'), b = e.target.closest('[data-gtab]');
    if(a){ cur = a.dataset.gstep; tab = 'step'; paint(); }
    if(b){ tab = b.dataset.gtab; paint(); }
  };
}
function openGuidePage(stage){
  $('#guideIn').innerHTML = `<div class="ptop"><h2>Call guide</h2><button class="btn light x" data-close="guidePage">Close</button></div><div class="box gwrap"></div>`;
  mountGuide($('#guideIn'), stage || 'greet', C && !C.ended ? C.p : null);
  openPage('guidePage');
}
document.addEventListener('click', e => { const g = e.target.closest('[data-guidecard]'); if(g) openGuidePage(g.dataset.guidecard); });

/* sheets on the call screen pause a practice call while they're open (a live owner keeps talking) */
function openSheet(html, after){
  const sh = $('#sheet');
  const autoHold = C && !C.live && !C.held && !C.ended;
  if(autoHold){ setHeld(true); C.sayCut = true; Player.stop(); }
  sh.innerHTML = `<div class="sheethead">${html.title}<button class="btn light" id="sheetX">Back to call</button></div>
    ${autoHold ? '<p class="note" style="margin:0 0 8px">The call is paused while this is open.</p>' : C && C.live ? '<p class="note" style="margin:0 0 8px">The owner is still on the line.</p>' : ''}${html.body}`;
  sh.classList.remove('hidden'); sh.scrollTop = 0;
  if(after) after(sh);
  $('#sheetX').onclick = () => { sh.classList.add('hidden'); if(autoHold && C && !C.ended) setHeld(false); };
}

/* ======================================================================
   IN-CALL BUTTONS
   ====================================================================== */
$('#bEnd').onclick = () => { if(!C || C.ended) return; if(!C.outcome){ C.outcome = 'you_ended'; C.userEnded = true; } finishCall(); };
$('#bMute').onclick = () => {
  if(!C || C.ended) return; C.muted = !C.muted;
  $('#bMute').classList.toggle('on', C.muted); $('#bMute .t').textContent = C.muted ? 'Unmute' : 'Mute';
  if(C.live) C.live.muted = C.muted || C.held;
  callToast(C.muted ? 'Muted. The owner can\'t hear you.' : 'Mic on', 1400);
};
$('#bHold').onclick = () => {
  if(!C || C.ended) return; setHeld(!C.held);
  if(C.live){ C.live.muted = C.held || C.muted; C.live.onHold = C.held; if(C.held) C.live.cutOwner(); }
  else if(C.held){ C.sayCut = true; Player.stop(); }
  callToast(C.held ? 'On hold. Tap Resume to come back.' : 'Back on the call', 1600);
};
$('#bHint').onclick = () => {
  if(!C) return;
  const st = currentHintStage(); const h = $('#hint');
  if(!h.classList.contains('hidden')){ h.classList.add('hidden'); return; }
  const H = SCRIPT_LIB.hints || {};
  h.innerHTML = `<b>Hint · ${esc(STEP_NAMES[st] || st)}</b>${esc(fill(H[st] || H.greet || H.opener || '', C.p))}`;
  h.classList.remove('hidden'); clearTimeout(h._t); h._t = setTimeout(() => h.classList.add('hidden'), 12000);
  $('#cap').scrollTop = 1e6;
  if(C) C.hints = (C.hints || 0) + 1;
};
$('#hint').onclick = () => $('#hint').classList.add('hidden');
const openShop = () => {
  if(!C) return;
  openSheet({title:`<b>${esc(C.p.shop)}</b>`, body:slidesHTML(C.p).join('')});
};
$('#bShop').onclick = openShop;
$('#bGuide').onclick = () => {
  if(!C) return;
  openSheet({title:'<b>Call guide</b>', body:'<div class="gwrap"></div>'}, sh => mountGuide(sh, currentHintStage(), C.p));
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
function pauseBg(on){ const v = $('#bgv'); if(!v) return; try{ if(on) v.pause(); else if(!matchMedia('(prefers-reduced-motion: reduce)').matches) v.play().catch(() => {}); }catch(e){} }
const anyOpen = () => $$('.page').some(x => !x.classList.contains('hidden')) || !$('#call').classList.contains('hidden');
function openPage(id){ $('#' + id).classList.remove('hidden'); $('#' + id).scrollTop = 0; pauseBg(true); }
function closePage(id){ $('#' + id).classList.add('hidden'); if(!anyOpen()) pauseBg(false); markNav(); }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-close]'); if(c) closePage(c.dataset.close);
  const n = e.target.closest('[data-nav]'); if(n) nav(n.dataset.nav);
  const s = e.target.closest('[data-start]'); if(s){ closePage('report'); startFlow(s.dataset.start); }
  const d = e.target.closest('[data-drill]'); if(d) startDrill(d.dataset.drill);
  const hr = e.target.closest('[data-hist]'); if(hr) openHist(hr.dataset.hist);
});
const NAV_PAGES = {calls:'calls', progress:'progress', guide:'guidePage'};
function nav(where){
  Object.values(NAV_PAGES).concat(['report', 'shopsPage', 'settings']).forEach(id => { if(id !== NAV_PAGES[where]) $('#' + id).classList.add('hidden'); });
  if(where === 'home'){ if(!anyOpen()) pauseBg(false); }
  if(where === 'guide') openGuidePage('greet');
  if(where === 'calls'){ renderCalls(); openPage('calls'); }
  if(where === 'progress'){ renderProgress(); openPage('progress'); }
  markNav();
}
function markNav(){
  const cur = Object.keys(NAV_PAGES).find(k => !$('#' + NAV_PAGES[k]).classList.contains('hidden')) || 'home';
  $$('.nav [data-nav]').forEach(b => { b.classList.toggle('on', b.dataset.nav === cur); b.setAttribute('aria-current', b.dataset.nav === cur ? 'page' : 'false'); });
}

let source = {type:'random'};
function personaFromSource(pool){
  if(source.type === 'brief' && source.brief) return makePersona({brief:source.brief, pool});
  if(source.type === 'research' && source.brief) return makePersona({brief:source.brief, pool});
  if(source.type === 'real' && source.shop) return makePersona({real:source.shop, pool});
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
  const stages = stage === 'opener' ? ['greet','reason'] : stage === 'handle' ? ['offer','questions'] : ['next','thanks'];
  pending = null;
  const kind = LS.get('sw_pl_mode', 'guided') === 'live' ? 'free' : 'guided';
  openPrep(kind, p, {stages, drill:stage});
  if(stage === 'close') p.answer = p.answer + ' ' + pick(p.r, ['Okay, I\'m listening. What are you asking for?','So what do you need from me?']);
}

const PIN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>';
function sourceLine(){
  const s = source;
  const t = s.type === 'random' ? `<b>Any Connecticut shop</b> · ${SHOPS.length} real shops` : s.type === 'real' ? `<b>${esc(s.shop.name.replace(/\s*\(.*?\)\s*/g, ' ').trim())}</b> · ${esc(s.shop.town)}` : `<b>${esc(s.brief.shop)}</b> · from your research`;
  return `<button class="shopline" id="srcPill" aria-label="Choose who to call">${PIN_ICON}<span>Calling: ${t}</span><em>Change</em></button>`;
}
function renderHome(){
  $('#hey').textContent = me ? `Hey, ${me}!` : 'Hey there!';
  $('#signin').classList.toggle('hidden', !!me);
  $('#home').classList.toggle('hidden', !me);
  const h = hist(), last3 = h.slice(-3);
  if(h.length >= 3){
    $('#readiness').className = 'big';
    $('#readiness').innerHTML = Math.round(last3.reduce((a, x) => a + (x.aiScore || x.score), 0)/3) + '<small>/ 100</small>';
    $('#readySub').textContent = 'From your 3 most recent calls.';
  } else {
    $('#readiness').className = 'big empty';
    $('#readiness').textContent = h.length ? 'Not yet' : 'No calls yet';
    $('#readySub').textContent = `Your average shows after 3 calls (${h.length} of 3 done).`;
  }
  $('#mCalls').textContent = h.length;
  $('#mMin').textContent = fmtDur(h.reduce((a, x) => a + (x.dur || 0), 0));
  $('#mBooked').textContent = h.filter(x => x.outcome === 'booked').length;
  const g = guidedDone(), ai = Voice.can().xai, last = h[h.length - 1];
  const steps = [
    ['Guided call 1', 'Learn the 8 steps. A tip on every line.'],
    ['Guided call 2', 'Pick the best fit. Tips after you pick.'],
    ['Live call', ai ? 'Talk freely with the live AI owner. Hint only.' : 'Talk freely with a practice owner. Hint only.'],
    ['Guided call 3+', 'Sharpen it. Coaching in the report.']
  ];
  const curI = g === 0 ? 0 : g === 1 ? 1 : 2;
  const liveDone = h.some(x => x.kind === 'live' || x.kind === 'free');
  const state = i => i < 2 ? (i < g ? 'done' : i === curI ? 'cur' : 'lock') : i === 2 ? (liveDone ? 'done' : g >= 2 ? 'cur' : 'lock') : (g >= 3 ? 'done' : g >= 2 ? '' : 'lock');
  const path = `<ol class="path">${steps.map((s, i) => { const st = state(i); return `<li class="${st}"><span class="dot">${st === 'done' ? '✓' : st === 'lock' ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>' : i + 1}</span><span><b>${s[0]}</b><small>${st === 'lock' && i === 2 ? 'Opens after 2 guided calls.' : s[1]}</small></span></li>`; }).join('')}</ol>`;
  const primary = g < 2 ? `<button class="btn black wide" data-start="guided">Start guided call ${g + 1}</button>`
    : `<button class="btn black wide" data-start="live">Start a live call</button><button class="lnkbtn alt" data-start="guided">Or another guided call</button>`;
  const needUnlock = hasVault() && !CFG.xaiKey && !CFG.server;
  $('#cards').innerHTML = `
    <div class="box next fu" style="animation-delay:.1s">
      <div class="eyebrow">${g === 0 ? 'Start here' : 'Your next call'}</div>
      <h2>${g < 2 ? `Guided call ${g + 1}` : 'Live call'}</h2>
      <p>${g === 0 ? 'You\'ll see three good lines at each step. Pick one, say it out loud, and the owner answers. About 4 minutes.' : g === 1 ? 'Same 8 steps, a new owner. Tips come after you pick. About 4 minutes.' : 'No lines on screen. Talk naturally; tap Hint if you freeze. About 5 minutes.'}</p>
      ${sourceLine()}
      ${primary}
    </div>
    <div class="box fu" style="animation-delay:.15s"><h3 style="margin-bottom:4px">Your path</h3>${path}</div>
    ${needUnlock ? `<div class="box"><h3>Turn on the AI owner</h3><p class="note">Enter your personal StarWell code once on this phone. It turns on real voices, the live AI owner and the AI coach.</p>
      <div class="row"><input type="password" id="unlockCode" placeholder="xxxx-xxxx-xxxx-xxxx" autocomplete="off" style="flex:1;min-width:0"><button class="btn light" id="unlockBtn">Unlock</button></div>
      <p class="note" id="unlockMsg" style="margin:8px 0 0"></p></div>` : ''}
    ${last ? `<button class="box fu" data-hist="${last.id}" style="display:block;width:100%;text-align:left;animation-delay:.2s">
      <div class="lbl">Last call</div>
      <div class="row" style="justify-content:space-between;margin:4px 0"><b style="font-size:var(--fs-md)">${esc(last.owner)} at ${esc(last.shop)}</b><span class="tag ${outcomeOf(last.outcome).col}">${outcomeOf(last.outcome).icon} ${esc(outcomeOf(last.outcome).label)}</span></div>
      <div class="note">${last.fixes && last.fixes[0] ? 'Try next: ' + esc(last.fixes[0]) + ' · ' : ''}Score ${last.aiScore || last.score} · <span style="color:var(--accent);font-weight:600">See how it went →</span></div></button>` : ''}`;
  if(needUnlock){
    const go = async () => {
      const code = $('#unlockCode').value; if(!code.trim()) return;
      $('#unlockMsg').textContent = 'Unlocking…'; $('#unlockBtn').disabled = true;
      try{ await unlockVault(code, me); toast('AI owner is on for this phone.'); renderHome(); checkLive(); }
      catch(e){ $('#unlockMsg').textContent = e.message; $('#unlockBtn').disabled = false; }
    };
    $('#unlockBtn').onclick = go; $('#unlockCode').onkeydown = e => { if(e.key === 'Enter') go(); };
  }
  $('#srcPill').onclick = () => openShops();
  if(!document.body.classList.contains('loaded')) setTimeout(() => document.body.classList.add('loaded'), 900);
}


/* quick check that the xAI line answers from this browser */
async function checkLive(){
  try{ await Voice.token(); diag('Live check: token OK'); }
  catch(e){ diag('Live check failed: ' + e.message); toast('Unlocked, but xAI didn\'t answer from this browser. Settings > Diagnostics has details.', 6000); }
}
/* ======================================================================
   WHO DO YOU WANT TO CALL? Real Connecticut HVAC shops, by town
   ====================================================================== */
const COUNTIES = ['New Haven','Fairfield','Hartford','Middlesex','New London','Litchfield','Tolland','Windham'];
let shopFilter = {q:'', county:''};
const shopId = x => SHOPS.indexOf(x);
function openShops(){
  $('#shopsIn').innerHTML = `<div class="ptop"><h2>Who to call</h2><button class="btn light x" data-close="shopsPage">Close</button></div>
    <p class="note" style="margin:0 0 8px">${SHOPS.length} real Connecticut HVAC shops in ${new Set(SHOPS.map(x => x.town)).size} towns, from public listings. The person who answers is a practice owner. Listings can be out of date, so check the shop's own site before a real call.</p>
    <div class="dirhead"><div class="row"><input type="search" id="shopQ" placeholder="Search a shop or town" aria-label="Search a shop or town" value="${esc(shopFilter.q)}" style="flex:1;min-width:0;min-height:44px;font:inherit;padding:0 13px;border-radius:12px;border:1px solid var(--line-strong)"><button class="btn light" id="shopAny">Any shop</button></div>
      <div class="gchips" style="margin-top:8px" id="shopCounties"></div></div>
    <div class="box dirlist" id="shopList"></div>
    <div class="box"><h3>A shop that isn't listed?</h3>
      <p class="note">Grok searches the web for their reviews, hours and website, then builds your prep slides.</p>
      <div class="fld"><label>Shop name</label><input type="text" id="rShop" placeholder="Shop name"></div>
      <div class="fld"><label>Connecticut town</label><input type="text" id="rTown" placeholder="Town"></div>
      <button class="btn black" id="rGo" ${Voice.can().xai ? '' : 'disabled'}>Research it</button> <span class="note" id="rMsg">${Voice.can().xai ? '' : 'Needs the AI coach turned on. Ask Bobby for your StarWell code.'}</span></div>`;
  paintShops();
  $('#shopQ').oninput = e => { shopFilter.q = e.target.value; paintShops(); };
  $('#shopAny').onclick = () => { source = {type:'random'}; closePage('shopsPage'); renderHome(); toast('Next call: any Connecticut shop'); };
  $('#shopsIn').onclick = async e => {
    const c = e.target.closest('[data-county]'); if(c){ shopFilter.county = c.dataset.county; paintShops(); return; }
    const pk = e.target.closest('[data-pickshop]');
    if(pk){ const x = SHOPS[+pk.dataset.pickshop]; source = {type:'real', shop:x}; closePage('shopsPage'); renderHome(); toast('Next call: ' + x.name.replace(/\s*\(.*?\)\s*/g, ' ').trim() + ', ' + x.town); return; }
    if(e.target.id === 'rGo'){
      const shop = $('#rShop').value.trim(), town = $('#rTown').value.trim(); if(!shop || !town) return toast('Add the shop and town');
      $('#rMsg').textContent = 'Searching the web…'; e.target.disabled = true;
      try{
        const j = await Voice.research(shop, town);
        source = {type:'research', brief:{shop:j.shop || shop, town:j.town || town, owner:j.owner || '', since:j.since || '', social:j.social || '', hiring:j.hiring || '', true:j.true_thing || '', comp:(j.review_themes || [])[0] ? `People's reviews keep mentioning ${j.review_themes[0]}` : '', research:j}};
        closePage('shopsPage'); renderHome(); toast('Research done. Your prep slides use it.');
      }catch(err){ $('#rMsg').textContent = 'Research failed: ' + err.message.slice(0, 90); e.target.disabled = false; }
    }
  };
  openPage('shopsPage');
}
function paintShops(){
  const q = shopFilter.q.trim().toLowerCase(), county = shopFilter.county;
  $('#shopCounties').innerHTML = `<button class="gchip ${!county ? 'on' : ''}" data-county="">All counties</button>` +
    COUNTIES.filter(c => SHOPS.some(x => x.county === c)).map(c => `<button class="gchip ${county === c ? 'on' : ''}" data-county="${c}">${c} · ${SHOPS.filter(x => x.county === c).length}</button>`).join('');
  const list = SHOPS.filter(x => (!county || x.county === county) && (!q || (x.name + ' ' + x.town + ' ' + x.services).toLowerCase().includes(q)));
  const byTown = {}; list.forEach(x => (byTown[x.town] = byTown[x.town] || []).push(x));
  const towns = Object.keys(byTown).sort();
  const open = q || towns.length <= 4;
  const cur = source.type === 'real' ? source.shop : null;
  $('#shopList').innerHTML = towns.length ? towns.map(t => `<details class="town" ${open ? 'open' : ''}><summary><b>${esc(t)}</b>&nbsp;<span class="note">${byTown[t].length} shop${byTown[t].length > 1 ? 's' : ''} · ${esc(byTown[t][0].county)}</span></summary>
      ${byTown[t].map(x => `<div class="shoprow"><div style="min-width:0"><b>${esc(x.name)}</b>
        <div class="note">${esc(x.services || 'HVAC')}${x.yrs ? ` · about ${x.yrs} years in business` : ''}</div>
        <div class="note">${x.phone ? esc(x.phone) : 'No phone listed'}${x.website ? ` · <a href="${esc(x.website)}" target="_blank" rel="noopener">Website</a>` : ''}</div></div>
        ${cur === x ? '<span class="tag green">✓ Chosen</span>' : `<button class="btn light" data-pickshop="${shopId(x)}">Choose</button>`}</div>`).join('')}</details>`).join('')
    : '<p class="note">No shops match. Try the AI research below.</p>';
}

function renderCalls(){
  const h = hist().slice().reverse();
  $('#callsIn').innerHTML = h.length ? `<div class="box dirlist">${h.map(x => { const o = outcomeOf(x.outcome); return `<button class="shoprow" data-hist="${x.id}" style="width:100%;text-align:left">
    <div style="min-width:0"><b>${esc(x.owner)} at ${esc(x.shop)}</b>
      <div class="note">${esc(x.kind === 'drill' ? 'Drill' : KIND_NAMES[x.kind] || 'Call')} · ${new Date(x.ts).toLocaleString([], {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'})} · Score ${x.aiScore || x.score}</div></div>
    <span class="tag ${o.col}">${o.icon} ${esc(o.label)}</span></button>`; }).join('')}</div>`
    : `<div class="box"><p class="note" style="margin:0 0 12px">No calls yet. Your first guided call takes about 4 minutes.</p><button class="btn black" data-start="guided">Start guided call 1</button></div>`;
}
function openHist(id){
  closePage('calls');
  const x = hist().find(e => e.id === id); if(!x) return;
  if(C && C.id === id && C.report){ showReport(C, C.report, true); return; }
  const kind = x.kind === 'drill' ? 'Drill' : KIND_NAMES[x.kind] || 'Call';
  $('#reportIn').innerHTML = `<div class="ptop"><h2>How it went</h2><button class="btn light x" data-close="report">Close</button></div>
    <section class="box"><div class="rhead"><div style="min-width:0"><div class="lbl">${esc(kind)} · ${esc(x.owner)} at ${esc(x.shop)}</div>${outcomePill(x.outcome)}
      ${x.note ? `<p class="note" style="margin:4px 0 0">${esc(x.note)}</p>` : ''}<div class="note" style="margin-top:6px">${fmtDur(x.dur)} · ${new Date(x.ts).toLocaleDateString([], {month:'short', day:'numeric'})}</div></div>
      <div style="text-align:right"><span class="score">${x.aiScore || x.score}</span><span class="note"> / 100</span></div></div>
      ${x.take ? `<div class="quote" style="margin-top:12px">${esc(x.owner)}: "${esc(x.take)}"</div>` : ''}</section>
    <section class="box"><h3>Try this next</h3><p class="why">${esc(x.drill)}</p>${(x.fixes || []).length ? `<p class="note" style="margin:8px 0 0">Steps to look at: ${x.fixes.map(esc).join(', ')}</p>` : ''}</section>
    <section class="box hidden" id="aiBox"></section>
    <section class="box"><details><summary style="font-weight:600">Score by step</summary><div class="bars" style="margin:4px 0 8px">${Object.keys(SKILL_NAMES).filter(k => x.skills[k] !== undefined).map(k => bar(SKILL_NAMES[k], x.skills[k])).join('')}</div></details>
      <details><summary style="font-weight:600">Transcript</summary><div class="tr">${x.log.map(l => `<p class="${l.who}"><b>${esc(l.who === 'o' ? x.owner : me)}:</b> ${esc(l.text)}</p>`).join('')}</div><p class="note">Recordings are kept only until you close or reload the page.</p></details></section>
    <div class="actions"><button class="btn light" data-close="report">Back</button></div>`;
  openPage('report');
  if(x.ai) renderAI(x.ai, {onLine:x.owner});
}

function renderProgress(){
  const h = hist();
  if(!h.length){ $('#progIn').innerHTML = '<div class="box"><p class="note" style="margin:0">Your progress chart appears after your first call.</p></div>'; return; }
  const W = 640, H = 300, padL = 56, padR = 24, padT = 20, padB = 40, n = h.length;
  const xs = i => padL + (n === 1 ? (W - padL - padR)/2 : i*(W - padL - padR)/(n - 1)), ys = v => H - padB - v*(H - padT - padB)/100;
  const pts = h.map((x, i) => `${xs(i)},${ys(x.aiScore || x.score)}`).join(' ');
  const skillAvg = {}; for(const k of Object.keys(SKILL_NAMES)){ const v = h.filter(x => x.skills[k] !== undefined).map(x => x.skills[k]); if(v.length) skillAvg[k] = Math.round(v.reduce((a, b) => a + b, 0)/v.length); }
  const weakest = Object.keys(skillAvg).filter(k => k !== 'delivery').sort((a, b) => skillAvg[a] - skillAvg[b])[0];
  const wpm = h.filter(x => x.wpm).map(x => x.wpm);
  const colOf = k => ({green:'#1f7a4d', red:'#b42318', gray:'#5b6472', blue:'#2f5bd3'})[outcomeOf(k).col];
  const shape = (x, cx, cy) => { const o = outcomeOf(x.outcome), c = colOf(x.outcome), t = `<title>Call ${h.indexOf(x) + 1}: ${esc(x.owner)}, ${x.aiScore || x.score}, ${esc(o.label)}</title>`;
    return o.col === 'red' ? `<g stroke="${c}" stroke-width="4">${t}<path d="M${cx - 8} ${cy - 8}L${cx + 8} ${cy + 8}M${cx + 8} ${cy - 8}L${cx - 8} ${cy + 8}"/></g>` : o.col === 'green' ? `<circle cx="${cx}" cy="${cy}" r="9" fill="${c}">${t}</circle>` : `<circle cx="${cx}" cy="${cy}" r="8" fill="#fff" stroke="${c}" stroke-width="4">${t}</circle>`; };
  const every = Math.max(1, Math.ceil(n/8));
  $('#progIn').innerHTML = `<div class="box"><h3>Score by call</h3>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Score for each call">${[0,50,100].map(v => `<line x1="${padL}" x2="${W - padR}" y1="${ys(v)}" y2="${ys(v)}" stroke="#e3e6eb"/><text x="${padL - 10}" y="${ys(v) + 7}" text-anchor="end" font-size="22" fill="#5b6472">${v}</text>`).join('')}
    ${h.map((x, i) => i % every === 0 || i === n - 1 ? `<text x="${xs(i)}" y="${H - 8}" text-anchor="middle" font-size="20" fill="#5b6472">${i + 1}</text>` : '').join('')}
    <polyline points="${pts}" fill="none" stroke="#2f5bd3" stroke-width="3" stroke-linejoin="round"/>${h.map((x, i) => shape(x, xs(i), ys(x.aiScore || x.score))).join('')}</svg>
    <p class="note" style="margin:6px 0 0">Bottom numbers are your calls in order. ● booked or email · ○ not this time or ended · ✕ owner hung up.</p></div>
    <div class="box"><h3>Average by step</h3><div class="bars">${Object.keys(skillAvg).map(k => bar(SKILL_NAMES[k], skillAvg[k])).join('')}</div>
    ${weakest ? `<p style="margin-top:12px"><b>Focus next:</b> ${esc(SKILL_NAMES[weakest])}. ${guideLink(weakest)}</p>` : ''}</div>
    ${wpm.length ? `<div class="box"><h3>Your pace</h3><p style="margin:0 0 6px">${wpm.slice(-8).map(w => `<span class="chip">${w} words a minute</span>`).join('')}</p><p class="note" style="margin:0">Aim for ${DELIVERY.pace.target}.</p></div>` : ''}`;
}

function renderSettings(){
  const c = Voice.can();
  const status = c.xai ? 'On. Live AI owner, real voices and the AI coach are ready.' : c.el ? 'Real voices are on. The live AI owner and coach are off.' : 'Off. Practice calls use this device\'s voice. Ask Bobby for your StarWell code to turn on the AI.';
  $('#setIn').innerHTML = `
    <section class="box"><h3>You</h3><div class="signin">${TEAM.map(n => `<button data-me="${n}" class="${n === me ? 'on' : ''}" aria-pressed="${n === me}">${n}</button>`).join('')}</div>
      <p class="note" style="margin:12px 0 0"><b>AI owner:</b> ${esc(status)}</p></section>
    <section class="box"><h3>Sound</h3>
      <label class="row"><input type="checkbox" id="sFx" ${CFG.phoneFx ? 'checked' : ''}> Make the owner sound like a phone line</label>
      <label class="row"><input type="checkbox" id="sNoise" ${CFG.noise ? 'checked' : ''}> Background noise (truck, office)</label></section>
    <section class="box"><details ${CFG.xaiKey || CFG.elKey || CFG.server ? '' : ''}><summary style="font-weight:600">Team setup (for Bobby)</summary>
      <p class="note">Now using: <b>${esc(Voice.label())}</b>. The live owner and AI coach run on xAI Grok. Guided-call voices use xAI, then ElevenLabs, then this device.</p>
      ${hasVault() ? `<div class="fld"><label>StarWell code ${LS.get('sw_pl_vault', '') ? '· unlocked by ' + esc(LS.get('sw_pl_vault', '')) : ''}</label><div class="row"><input type="password" id="sCode" placeholder="xxxx-xxxx-xxxx-xxxx" autocomplete="off" style="flex:1;min-width:0"><button class="btn light" id="sUnlock">Unlock</button></div></div>` : ''}
      <div class="fld"><label>Team voice server URL</label><input type="text" id="sServer" value="${esc(CFG.server)}" placeholder="https://starwell-voice.example.workers.dev"></div>
      <div class="fld"><label>Team code (if the server asks for one)</label><input type="password" id="sTeam" value="${esc(CFG.team)}"></div>
      <div class="fld"><label>xAI API key (this device only)</label><input type="password" id="sXai" value="${esc(CFG.xaiKey)}" autocomplete="off"></div>
      <div class="fld"><label>ElevenLabs API key (optional, this device only)</label><input type="password" id="sEl" value="${esc(CFG.elKey)}" autocomplete="off"></div>
      <p class="note">Keys stay in this browser and are never uploaded. Only add them on your own device.</p>
      <div class="fld"><label>Owner voice for guided calls</label><select id="sVoice">${[['auto','Auto (xAI, then ElevenLabs)'],['xai','xAI Grok voices'],['elevenlabs','ElevenLabs voices'],['device','This device\'s voice']].map(o => `<option value="${o[0]}" ${CFG.voicePref === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></div>
      <div class="fld"><label>AI coach model</label><input type="text" id="sModel" value="${esc(CFG.textModel)}"></div>
      <div class="row"><button class="btn black" id="sSave">Save</button><button class="btn light" id="sTest">Test the owner voice</button><button class="btn light" id="sLive">Test live connection</button></div>
      <p class="note" id="sMsg"></p>
      <details><summary class="note">Diagnostics</summary><pre style="white-space:pre-wrap;font-size:12px;color:var(--ink-2);max-height:220px;overflow:auto">${esc(DIAG.join('\n') || 'No events yet.')}</pre>
      <p class="note">Speech recognition: ${SRC ? 'available' : 'not available in this browser (use Chrome or Safari)'} · Recording: ${window.MediaRecorder ? 'available' : 'not available'}</p></details></details></section>
    <section class="box"><h3>Your practice history</h3><p class="note">Calls and scores are saved on this device only.</p><button class="btn light" id="sClear">Clear my practice history</button></section>`;
  $('#sFx').onchange = () => { LS.set('sw_pl_fx', $('#sFx').checked ? '1' : '0'); toast('Saved', 1000); };
  $('#sNoise').onchange = () => { LS.set('sw_pl_noise', $('#sNoise').checked ? '1' : '0'); toast('Saved', 1000); };
  $('#setIn').onclick = async e => {
    const m = e.target.closest('[data-me]'); if(m){ me = m.dataset.me; LS.set('sw_cc_me', me); renderSettings(); renderHome(); return; }
    if(e.target.id === 'sUnlock'){
      $('#sMsg').textContent = 'Unlocking…';
      try{ await unlockVault($('#sCode').value, me); renderSettings(); renderHome(); $('#sMsg').textContent = 'Unlocked. Tap "Test live connection" to check the line.'; }
      catch(err){ $('#sMsg').textContent = err.message; }
      return;
    }
    if(e.target.id === 'sSave' || e.target.id === 'sTest' || e.target.id === 'sLive'){
      LS.set('sw_pl_server', $('#sServer').value.trim()); LS.set('sw_pl_team', $('#sTeam').value.trim());
      $('#sXai').value.trim() ? LS.set('sw_pl_xai', $('#sXai').value.trim()) : LS.del('sw_pl_xai');
      $('#sEl').value.trim() ? LS.set('sw_pl_el', $('#sEl').value.trim()) : LS.del('sw_pl_el');
      LS.set('sw_pl_voice', $('#sVoice').value); LS.set('sw_pl_model', $('#sModel').value.trim() || 'grok-4');
      Voice.failed = {};
      $('#sMsg').textContent = 'Saved.'; renderHome();
    }
    if(e.target.id === 'sTest'){
      AE.init(); const p = makePersona();
      $('#sMsg').textContent = 'Playing…';
      const prov = await Voice.say(`${p.shop}, this is ${p.onLine}. Who's calling?`, p);
      const c2 = Voice.can();
      $('#sMsg').textContent = 'Played with: ' + {xai:'xAI Grok', el:'ElevenLabs', device:'this device'}[prov] + (prov === 'device' && CFG.voicePref !== 'device' ? ((c2.xai || c2.el) ? '. The AI voices didn\'t answer; see Diagnostics.' : '. Turn on the AI above for real voices.') : '.');
    }
    if(e.target.id === 'sLive'){
      $('#sMsg').textContent = 'Getting a session token…';
      try{ const t = await Voice.token(); $('#sMsg').textContent = t ? 'Live owner is reachable. You\'re set.' : 'No token returned.'; }
      catch(err){ $('#sMsg').textContent = 'Live owner not reachable: ' + err.message.slice(0, 140); }
    }
    if(e.target.id === 'sClear'){ if(confirm('Clear all your practice calls on this device?')){ LS.del(histKey()); LS.del('sw_pl_guided_' + me); renderHome(); toast('History cleared'); } }
  };
}
$('#setBtn').onclick = () => { nav('home'); renderSettings(); openPage('settings'); };
$$('#modeToggle button').forEach(b => b.onclick = () => { $$('#modeToggle button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); LS.set('sw_pl_mode', b.dataset.mode); });
(() => { const m = LS.get('sw_pl_mode', 'guided'); $$('#modeToggle button').forEach(x => x.classList.toggle('on', x.dataset.mode === m)); })();

/* sign-in */
$('#signinBtns').innerHTML = TEAM.map(n => `<button data-who="${n}">${n}</button>`).join('');
$('#signinBtns').onclick = e => { const b = e.target.closest('[data-who]'); if(!b) return; me = b.dataset.who; LS.set('sw_cc_me', me); renderHome(); };

/* mic check card: listens up to 10 seconds, then gives a plain verdict */
(() => {
  const H = [8,16,12,28,20,36,42,24,40,16,44,32,48,28,20,36,14,32,22,40,18,30,12,26,16,34,20,38,24,28,16,22,12,20,8];
  $('#wave').innerHTML = H.map(h => `<i style="height:${h*0.8}px"></i>`).join('');
  let on = false, iv = null, autoStop = null, peak = -100, loud = 0, frames = 0, words = 0;
  const stop = () => {
    on = false; clearInterval(iv); clearTimeout(autoStop); Listen.stop(); if(!C || C.ended) AE.closeMic();
    $$('#wave i').forEach((b, i) => b.style.height = H[i]*0.8 + 'px');
    $('#micBtn').setAttribute('aria-label', 'Start mic check');
    const share = frames ? loud/frames : 0;
    $('#micMsg').textContent = peak < -50 ? 'I didn\'t hear anything. Check that the right microphone is on, then try again.'
      : peak < -32 ? `A little quiet${words ? ` (${words} words heard)` : ''}. Move closer or speak up a bit.`
      : peak > -3 ? `Very loud${words ? ` (${words} words heard)` : ''}. Move the phone a little away from your mouth.`
      : `Sounds good${words ? `: ${words} words heard clearly` : ''}. You're ready.${share < .15 && !words ? ' (Speak a full sentence to test words too.)' : ''}`;
  };
  $('#micBtn').onclick = async () => {
    if(on){ stop(); return; }
    try{ await AE.openMic(); }catch(e){ $('#micMsg').textContent = 'The microphone is blocked. Allow it in your browser settings, then try again.'; return; }
    on = true; peak = -100; loud = 0; frames = 0; words = 0;
    $('#micBtn').setAttribute('aria-label', 'Stop mic check');
    $('#micMsg').textContent = 'Listening. Say your hello, then tap the mic again.';
    iv = setInterval(() => { const f = AE.frame(), lv = Math.max(0, Math.min(1, (f.db + 60)/45)); frames++; if(f.db > -45) loud++; peak = Math.max(peak, f.db); $$('#wave i').forEach((b, i) => b.style.height = Math.max(3, H[i]*0.8*(0.25 + lv*1.4)) + 'px'); }, 70);
    Listen.start(t => { words = t.trim().split(/\s+/).filter(Boolean).length; $('#micMsg').textContent = '"' + t.trim().split(/\s+/).slice(-10).join(' ') + '"'; });
    autoStop = setTimeout(() => { if(on) stop(); }, 10000);
  };
})();

(() => { const hd = $('.hdr'); const set = () => document.documentElement.style.setProperty('--hdrH', hd.offsetHeight + 'px'); set(); if(window.ResizeObserver) new ResizeObserver(set).observe(hd); })();
renderHome();
