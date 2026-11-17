/* StarWell caller dashboard API (Node only; used by server.mjs).
   Sign-in per caller, private call logs, recording transcription with speaker labels,
   and a call review returned in one fixed format.

   Environment variables:
     PASS_DAN, PASS_RJ, PASS_BOBBY   each person's password. Set them in Railway, never in the repo.
     DATA_DIR                        folder for the call logs. Mount a Railway volume here (for example /data),
                                     or logs are lost on every redeploy.
     SESSION_SECRET                  optional. Any long random phrase; signs the sign-in tokens.
     XAI_API_KEY                     already used by the voice server; also used here.
     ALLOWED_ORIGIN                  same as the voice server. */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const XAI = process.env.XAI_BASE || 'https://api.x.ai/v1';   // XAI_BASE is for local tests only
const USERS = {dan:'Dan', rj:'RJ', bobby:'Bobby'};
const MAX_AUDIO = 40 * 1024 * 1024;
export const isCallsPath = p => p === '/auth' || p.startsWith('/calls/');

function cors(origin, env){
  const allowed = (env.ALLOWED_ORIGIN || 'https://vastlyresilient.github.io').split(',').map(s => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  return {ok, headers:{'Access-Control-Allow-Origin': ok ? origin : allowed[0], 'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, X-Token, X-File-Name', 'Access-Control-Max-Age':'600', 'Vary':'Origin'}};
}
const norm = s => String(s || '').toLowerCase().replace(/\s+/g, '');
const sha = s => crypto.createHash('sha256').update(s).digest();
const passFor = (env, key) => env['PASS_' + key.toUpperCase()] || '';
const configured = env => Object.keys(USERS).every(k => passFor(env, k));
const secret = env => env.SESSION_SECRET || sha(Object.keys(USERS).map(k => passFor(env, k)).join('|') + '|' + (env.TEAM_CODE || '')).toString('hex');
const b64 = b => Buffer.from(b).toString('base64url');
function sign(env, key){
  const body = b64(JSON.stringify({u:key, exp:Date.now() + 30 * 864e5}));
  return body + '.' + crypto.createHmac('sha256', secret(env)).update(body).digest('base64url');
}
function verify(env, token){
  const [body, mac] = String(token || '').split('.');
  if(!body || !mac) return null;
  const want = crypto.createHmac('sha256', secret(env)).update(body).digest('base64url');
  if(want.length !== mac.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(mac))) return null;
  try{ const p = JSON.parse(Buffer.from(body, 'base64url').toString()); return p.exp > Date.now() && USERS[p.u] ? p.u : null; }catch(e){ return null; }
}

/* ---- sign-in: 8 wrong passwords per 15 minutes per address and name ---- */
const tries = new Map();
const recent = k => (tries.get(k) || []).filter(t => Date.now() - t < 9e5);
const throttled = k => recent(k).length >= 8;
function missed(k){   // only wrong passwords count
  const a = recent(k); a.push(Date.now()); tries.set(k, a);
  if(tries.size > 2000) for(const [x, v] of tries) if(Date.now() - v[v.length - 1] > 9e5) tries.delete(x);
}

/* ---- storage: one JSON file per caller ---- */
const dir = env => env.DATA_DIR || path.join(process.cwd(), 'data');
const file = (env, key) => path.join(dir(env), 'calls-' + key + '.json');
let chain = Promise.resolve();
const locked = fn => { const p = chain.then(fn, fn); chain = p.catch(() => {}); return p; };
async function load(env, key){ try{ return JSON.parse(await fs.readFile(file(env, key), 'utf8')); }catch(e){ return []; } }
async function save(env, key, calls){
  await fs.mkdir(dir(env), {recursive:true});
  const tmp = file(env, key) + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(calls));
  await fs.rename(tmp, file(env, key));
}
const str = (v, n) => String(v == null ? '' : v).slice(0, n);
function cleanCall(c, who){
  const o = {id:str(c.id, 40).replace(/[^\w-]/g, ''), caller:who, shop:str(c.shop, 40), shopName:str(c.shopName, 120), at:str(c.at, 40), updated:new Date().toISOString(),
    outcome:str(c.outcome, 20), reached:Math.max(0, Math.min(5, +c.reached || 0)), objection:str(c.objection, 20), checks:{}, ratings:{}, answers:{}, next:{}};
  for(const k of Object.keys(c.checks || {}).slice(0, 30)) if(c.checks[k]) o.checks[str(k, 20)] = true;
  for(const k of ['calm','clear']) if(c.ratings && c.ratings[k]) o.ratings[k] = Math.max(1, Math.min(5, +c.ratings[k] || 0));
  if(c.ratings && c.ratings.talk) o.ratings.talk = str(c.ratings.talk, 10);
  for(const k of Object.keys(c.answers || {}).slice(0, 12)) o.answers[str(k, 20)] = str(c.answers[k], 2000);
  o.next = {action:str(c.next && c.next.action, 300), date:str(c.next && c.next.date, 20), done:!!(c.next && c.next.done)};
  if(c.transcript && Array.isArray(c.transcript.turns)) o.transcript = {callerSp:+c.transcript.callerSp || 0, duration:+c.transcript.duration || 0,
    turns:c.transcript.turns.slice(0, 400).map(t => ({sp:+t.sp || 0, t:str(t.t, 1500), s:+t.s || 0}))};
  if(c.analysis && checkAnalysis(c.analysis) === '') o.analysis = c.analysis;
  if(c.review) o.review = {win:str(c.review.win, 400), fix:str(c.review.fix, 400), line:str(c.review.line, 400), strength:str(c.review.strength, 20), habit:str(c.review.habit, 20)};
  if(c.followups) o.followups = Object.fromEntries(Object.entries(c.followups).slice(0, 6).map(([k, v]) => [str(k, 300), str(v, 1500)]));
  return o;
}

/* ---- the one fixed format for a call review ---- */
export const SKILLS = ['opener','tone','listening','question','offer','objection','ask','wrapup'];
export const OBJECTIONS = ['none','busy','email','office','selling','have','cost','ai','notint','hung'];
const isS = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= (max || 600);
export function checkAnalysis(a){
  if(!a || typeof a !== 'object' || Array.isArray(a)) return 'not an object';
  const keys = ['summary','talk_caller_pct','steps','moments','objection','accuracy_flags','strength','habit','win','fix','line_to_try','follow_up_questions','drill'];
  for(const k of keys) if(!(k in a)) return 'missing ' + k;
  for(const k of Object.keys(a)) if(!keys.includes(k)) return 'extra key ' + k;
  if(!isS(a.summary, 900)) return 'summary';
  if(typeof a.talk_caller_pct !== 'number' || a.talk_caller_pct < 0 || a.talk_caller_pct > 100) return 'talk_caller_pct';
  const st = a.steps; if(!st || typeof st !== 'object') return 'steps';
  for(const k of ['hello','notice','gift','rest','next']){ const s = st[k]; if(!s || typeof s.reached !== 'boolean' || !isS(s.note, 400)) return 'steps.' + k; }
  if(!Array.isArray(a.moments) || a.moments.length < 1 || a.moments.length > 4) return 'moments';
  for(const m of a.moments) if(!m || !isS(m.quote, 400) || !['caller','owner'].includes(m.speaker) || !isS(m.what_worked_or_happened, 500) || !isS(m.try_next_time, 500)) return 'moment shape';
  if(!a.objection || !OBJECTIONS.includes(a.objection.type) || !['yes','partly','not_yet','none'].includes(a.objection.handled)) return 'objection';
  if(!Array.isArray(a.accuracy_flags) || a.accuracy_flags.length > 5 || a.accuracy_flags.some(x => !isS(x, 300))) return 'accuracy_flags';
  if(!SKILLS.includes(a.strength) || !SKILLS.includes(a.habit)) return 'strength/habit';
  if(!isS(a.win, 400) || !isS(a.fix, 400) || !isS(a.line_to_try, 400)) return 'win/fix/line';
  if(!Array.isArray(a.follow_up_questions) || a.follow_up_questions.length < 2 || a.follow_up_questions.length > 3 || a.follow_up_questions.some(x => !isS(x, 300))) return 'follow_up_questions';
  if(!a.drill || !SKILLS.includes(a.drill.skill) || !isS(a.drill.how, 500)) return 'drill';
  return '';
}
const SYSTEM = `You are a warm, expert phone coach for StarWell, a small Connecticut team that calls HVAC shop owners to offer free help (a website, a search check, social posts, a free trial of an answering line). The goal of each call is a 15-minute walkthrough. The caller follows five steps: hello, notice and ask, the one gift, the rest and why it's free, next step.

How you coach:
- Encourage. Never criticize, grade or scold. The caller should finish reading and want to dial again.
- Be specific. Tie every point to an exact moment or quote. No generic advice.
- "fix" is ONE thing to try next time, written as an invitation ("Next time, try..."), never as a fault.
- "line_to_try" is one natural sentence they can say on the very next call.
- Notice honesty. If the caller made a claim they could not know (a missed call, a ranking, a revenue number), list it kindly in accuracy_flags. If none, use an empty list.
- Do not guess at emotions from the voice. Judge only the words.
- Use the caller's history, when given, to connect this call to their progress.
- Plain words. Short sentences. No jargon.

Return ONLY a JSON object with exactly these keys and no others:
{
 "summary": "2 to 3 sentences on what happened in the call",
 "talk_caller_pct": number 0-100 (share of the words spoken by the caller; estimate if no transcript),
 "steps": {"hello":{"reached":bool,"note":"one sentence"},"notice":{...},"gift":{...},"rest":{...},"next":{...}},
 "moments": [1 to 4 of {"quote":"exact words from the call or the caller's notes","speaker":"caller"|"owner","what_worked_or_happened":"one or two sentences","try_next_time":"one sentence"}],
 "objection": {"type": one of ${JSON.stringify(OBJECTIONS)}, "handled":"yes"|"partly"|"not_yet"|"none"},
 "accuracy_flags": [0 to 5 short strings],
 "strength": one of ${JSON.stringify(SKILLS)},
 "habit": one of ${JSON.stringify(SKILLS)} (the one skill to build next),
 "win": "one real win from this call",
 "fix": "one thing to try next time",
 "line_to_try": "one sentence to say on the next call",
 "follow_up_questions": [2 or 3 reflective questions about THIS call that help the caller learn from it],
 "drill": {"skill": one of ${JSON.stringify(SKILLS)}, "how":"a 2-minute practice drill for that skill"}
}
objection types: busy = too busy now; email = just email me; office = call the office or someone else; selling = are you selling something; have = already have someone; cost = what does it cost; ai = does not trust AI; notint = not interested; hung = call ended early.`;

async function analyze(env, body){
  const user = str(JSON.stringify({shop:body.shop, outcome:body.outcome, caller:body.caller, selfReport:body.selfReport, history:body.history, transcript:body.transcript}), 60000);
  let last = '';
  for(let attempt = 0; attempt < 2; attempt++){
    const messages = [{role:'system', content:SYSTEM}, {role:'user', content:user + (attempt ? '\n\nYour last answer did not match the format (' + last + '). Return the JSON object exactly as specified.' : '')}];
    const r = await fetch(XAI + '/chat/completions', {method:'POST', headers:{'Authorization':'Bearer ' + env.XAI_API_KEY, 'Content-Type':'application/json'},
      body:JSON.stringify({model:env.XAI_TEXT_MODEL || 'grok-4', messages, temperature:0.3, max_tokens:2200, response_format:{type:'json_object'}})});
    if(!r.ok) return {status:502, error:'The review service answered ' + r.status};
    let a = null;
    try{ a = JSON.parse((await r.json()).choices[0].message.content); }catch(e){ last = 'not valid JSON'; continue; }
    last = checkAnalysis(a);
    if(last === '') return {status:200, analysis:a};
  }
  return {status:422, error:'The review did not come back in the right format (' + last + '). Nothing was saved. Try again.'};
}

async function transcribe(env, buf, name){
  const fd = new FormData();
  fd.append('model', 'grok-voice-transcribe-2.0');
  fd.append('language', 'en'); fd.append('format', 'true'); fd.append('diarize', 'true'); fd.append('keyterm', 'StarWell');
  fd.append('file', new Blob([buf]), name || 'call.m4a');   // file goes last
  const r = await fetch(XAI + '/stt', {method:'POST', headers:{'Authorization':'Bearer ' + env.XAI_API_KEY}, body:fd});
  if(!r.ok) return {status:502, error:'Transcription answered ' + r.status, detail:(await r.text()).slice(0, 200)};
  const j = await r.json(), words = Array.isArray(j.words) ? j.words : [];
  const turns = []; let sp = 0;
  for(const w of words){
    if(typeof w.speaker === 'number') sp = w.speaker;
    const lastT = turns[turns.length - 1];
    if(lastT && lastT.sp === sp) lastT.t += ' ' + w.text; else turns.push({sp, t:String(w.text || ''), s:+w.start || 0});
  }
  if(!turns.length) return {status:422, error:'No speech was found in that file.'};
  const speakers = [...new Set(turns.map(t => t.sp))];
  if(speakers.length < 2) return {status:200, turns, duration:j.duration || 0, speakers, callerSp:speakers[0], oneVoice:true};
  const hit = turns.find(t => /star\s*well/i.test(t.t));
  const callerSp = hit ? hit.sp : (turns[1] ? turns[1].sp : turns[0].sp);
  return {status:200, turns, duration:j.duration || 0, speakers, callerSp, sure:!!hit};
}

export async function handleCalls(req, env, raw, ip){
  const url = new URL(req.url), c = cors(req.headers.get('Origin') || '', env);
  const json = (o, s) => new Response(JSON.stringify(o), {status:s || 200, headers:{...c.headers, 'Content-Type':'application/json'}});
  if(req.method === 'OPTIONS') return new Response(null, {status:204, headers:c.headers});
  if(url.pathname === '/calls/health') return json({ok:true, signIn:configured(env), keepsData:!!env.DATA_DIR, xai:!!env.XAI_API_KEY});
  if(req.method !== 'POST') return json({error:'POST only'}, 405);
  if(!c.ok) return json({error:'Origin not allowed'}, 403);
  if(!configured(env)) return json({error:'Sign-in is not set up on the server yet.'}, 503);
  try{
    if(url.pathname === '/calls/transcribe'){
      const who = verify(env, req.headers.get('X-Token'));
      if(!who) return json({error:'Please sign in again.'}, 401);
      if(!env.XAI_API_KEY) return json({error:'XAI_API_KEY not set'}, 500);
      if(!raw.length) return json({error:'No recording received.'}, 400);
      if(raw.length > MAX_AUDIO) return json({error:'That recording is over 40 MB.'}, 413);
      const r = await transcribe(env, raw, str(req.headers.get('X-File-Name'), 80).replace(/[^\w.\- ]/g, ''));
      return json(r, r.status);
    }
    if(raw.length > 400000) return json({error:'Too large'}, 413);
    let body = {}; try{ body = raw.length ? JSON.parse(raw.toString('utf8')) : {}; }catch(e){ return json({error:'Bad JSON'}, 400); }
    if(url.pathname === '/auth'){
      const key = norm(body.user);
      if(!USERS[key]) return json({error:'Pick your name.'}, 400);
      if(throttled(ip + '|' + key)) return json({error:'Too many tries. Wait 15 minutes.'}, 429);
      const ok = crypto.timingSafeEqual(sha(norm(body.password)), sha(norm(passFor(env, key))));
      if(!ok){ missed(ip + '|' + key); return json({error:'That password did not match.'}, 401); }
      return json({token:sign(env, key), user:USERS[key]});
    }
    const who = verify(env, body.token);
    if(!who) return json({error:'Please sign in again.'}, 401);
    if(url.pathname === '/calls/list'){
      if(who === 'bobby') return json({team:{Dan:await load(env, 'dan'), RJ:await load(env, 'rj')}});
      return json({calls:await load(env, who)});
    }
    if(url.pathname === '/calls/save' || url.pathname === '/calls/delete'){
      if(who === 'bobby') return json({error:'Bobby\'s account is view only.'}, 403);
      const out = await locked(async () => {
        let calls = await load(env, who);
        if(url.pathname === '/calls/delete') calls = calls.filter(x => x.id !== str(body.id, 40));
        else { const call = cleanCall(body.call || {}, USERS[who]); if(!call.id || !call.shop) return null;
          const i = calls.findIndex(x => x.id === call.id); if(i >= 0) calls[i] = call; else calls.push(call);
          if(calls.length > 3000) calls = calls.slice(-3000); }
        await save(env, who, calls); return calls;
      });
      return out ? json({ok:true, count:out.length}) : json({error:'That call was missing its id or shop.'}, 400);
    }
    if(url.pathname === '/calls/analyze'){
      if(!env.XAI_API_KEY) return json({error:'XAI_API_KEY not set'}, 500);
      const r = await analyze(env, {...body, caller:USERS[who]});
      return json(r.status === 200 ? {analysis:r.analysis} : {error:r.error}, r.status);
    }
    return json({error:'Not found'}, 404);
  }catch(e){
    return json({error:'Something went wrong on the server.', detail:String(e && e.message || e).slice(0, 200)}, 500);
  }
}
