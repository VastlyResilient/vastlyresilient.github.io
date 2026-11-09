// Generates ElevenLabs narration for a Starwell lesson guide.
// Usage: ELEVENLABS_API_KEY=... node tools/elevenlabs-voice.mjs starwell-cold-call [--dry]
// Optional env: COACH_VOICE, OWNER_VOICE (ElevenLabs voice IDs), MODEL_ID, FORCE=true
// Reads NARR/TEAM/TOWN from <guide>/index.html, writes <guide>/audio/<key>.mp3 + manifest.json.
// Keys hash role + exact spoken text, so editing a line only regenerates that line.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const guide = process.argv[2] || 'starwell-cold-call';
const dry = process.argv.includes('--dry');
const html = fs.readFileSync(path.join(guide, 'index.html'), 'utf8');
const narrSrc = html.match(/const NARR = (\[[\s\S]*?\n\]);/);
if (!narrSrc) throw new Error('NARR block not found in ' + guide);
const NARR = vm.runInNewContext(narrSrc[1]);
const TOWN = (html.match(/const TOWN = '([^']*)'/) || [, ''])[1];
const names = [...new Set([...html.matchAll(/\{n:'([^']+)'/g)].map(m => m[1]).concat('teammate'))];

const COACH = process.env.COACH_VOICE || 'nPczCjzI2devNBz1zQrb'; // Brian
const OWNER = process.env.OWNER_VOICE || 'pqHfZKP75CvOlQylNhV4'; // Bill
const MODEL = process.env.MODEL_ID || 'eleven_multilingual_v2';
const KEY = process.env.ELEVENLABS_API_KEY;
// Livelier read than the defaults, still steady enough for teaching.
const SETTINGS = { stability: 0.45, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true };

// Must match keyFor() in the guide page.
function fnv(s) { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); }
const keyFor = (role, t) => fnv(role + '|' + t) + t.length.toString(36);
function parts(text, name) {
  return text.replace(/\{me\}/g, name).replace(/\{town\}/g, TOWN).split('|')
    .map(p => p.trim()).filter(p => p && p !== '~' && !p.startsWith('#'))   // '~' = pause, '#name' = sound effect played by the page
    .map(p => p.startsWith('O>') ? { role: 'owner', t: p.slice(2).trim() } : { role: 'coach', t: p });
}
const jobs = new Map();
NARR.forEach(txt => { if (!txt) return; names.forEach(n => parts(txt, n).forEach(p => jobs.set(keyFor(p.role, p.t), p))); });

const dir = path.join(guide, 'audio');
fs.mkdirSync(dir, { recursive: true });
const manPath = path.join(dir, 'manifest.json');
const old = fs.existsSync(manPath) ? JSON.parse(fs.readFileSync(manPath, 'utf8')) : { voices: {}, files: [] };
const voicesChanged = old.voices.coach !== COACH || old.voices.owner !== OWNER || old.model !== MODEL || JSON.stringify(old.settings || {}) !== JSON.stringify(SETTINGS);
const force = process.env.FORCE === 'true' || voicesChanged;
const todo = [...jobs].filter(([k]) => force || !fs.existsSync(path.join(dir, k + '.mp3')));
const chars = todo.reduce((a, [, p]) => a + p.t.length, 0);
const allChars = [...jobs.values()].reduce((a, p) => a + p.t.length, 0);
console.log(`${jobs.size} clips total (${allChars} chars). To generate now: ${todo.length} clips, ${chars} characters.`);
if (dry) process.exit(0);
if (todo.length && !KEY) throw new Error('Set ELEVENLABS_API_KEY');

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function tts(p) {
  const voice = p.role === 'owner' ? OWNER : COACH;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text: p.t, model_id: MODEL, voice_settings: SETTINGS })
    });
    if (r.ok) return Buffer.from(await r.arrayBuffer());
    const body = await r.text();
    if (r.status === 429 || r.status >= 500) { console.log(`  retry ${attempt} (${r.status})`); await sleep(2000 * attempt); continue; }
    throw new Error(`ElevenLabs ${r.status}: ${body.slice(0, 300)}`);
  }
  throw new Error('ElevenLabs kept failing; try again later.');
}
const staleTimings = new Set();
let n = 0, failure = null;
try {
  for (const [k, p] of todo) {
    fs.writeFileSync(path.join(dir, k + '.mp3'), await tts(p));
    staleTimings.add(k);
    console.log(`${++n}/${todo.length} ${p.role}: ${p.t.slice(0, 60)}`);
  }
} catch (e) {
  failure = e;   // e.g. quota used up: keep every clip finished so far; the page falls back to the phone voice for the rest
  console.log('Stopped early: ' + e.message);
}
// Remove clips no longer used by the guide.
for (const f of fs.readdirSync(dir)) if (f.endsWith('.mp3') && !jobs.has(f.slice(0, -4))) fs.unlinkSync(path.join(dir, f));
const done = [...jobs.keys()].filter(k => fs.existsSync(path.join(dir, k + '.mp3')) && (!force || staleTimings.has(k) || !todo.some(([t]) => t === k))).sort();
fs.writeFileSync(manPath, JSON.stringify({ voices: { coach: COACH, owner: OWNER }, model: MODEL, settings: SETTINGS, ...(failure ? { stopped: String(failure.message).slice(0, 300) } : {}), files: done, texts: Object.fromEntries(done.map(k => [k, jobs.get(k).t])) }, null, 1));
const tPath = path.join(dir, 'timings.json');
if (fs.existsSync(tPath)) {
  const t = JSON.parse(fs.readFileSync(tPath, 'utf8'));
  for (const k of Object.keys(t)) if (staleTimings.has(k) || !jobs.has(k)) delete t[k];
  fs.writeFileSync(tPath, JSON.stringify(t));
}
console.log(`Manifest written: ${done.length}/${jobs.size} clips ready.`);
if (failure) { console.log('Run the workflow again later to finish the rest.'); process.exitCode = 1; }
