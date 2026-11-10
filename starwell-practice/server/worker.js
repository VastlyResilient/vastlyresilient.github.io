/* StarWell voice server: keeps the xAI and ElevenLabs keys off the public site.
   Runs as a Cloudflare Worker (this file) or on Railway / any Node 18+ host (server.mjs imports this).
   Environment variables:
     XAI_API_KEY          required for the live owner, Grok voices and the AI coach
     ELEVENLABS_API_KEY   optional, second voice provider
     ALLOWED_ORIGIN       default https://vastlyresilient.github.io (comma-separate to add more)
     TEAM_CODE            required: teammates enter it once in Settings > Team code
     XAI_TEXT_MODEL       optional: model for the AI coach and research (default grok-4) */

const XAI = 'https://api.x.ai/v1';
const XAI_VOICES = new Set(['ara','eve','leo','rex','sal']);
const EL_VOICES = new Set(['pqHfZKP75CvOlQylNhV4','TxGEqnHWrfWFTfGW9XjX','CwhRBWXzGAHq8TqKPgfo','cjVigY5qzO86Huf0OWal','iP95p4xoKVk53GoZ742B','XrExE9yKIg1WjnnlVkGX','cgSgspJ2msm6clMCkdW9','EXAVITQu4vr4xnSDxMaL']);

function cors(origin, env){
  const allowed = (env.ALLOWED_ORIGIN || 'https://vastlyresilient.github.io').split(',').map(s => s.trim());
  const ok = allowed.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  return { ok, headers:{
    'Access-Control-Allow-Origin': ok ? origin : allowed[0],
    'Access-Control-Allow-Methods':'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers':'Content-Type, X-Team-Code',
    'Vary':'Origin' } };
}
const json = (obj, status, h) => new Response(JSON.stringify(obj), {status:status || 200, headers:{...h, 'Content-Type':'application/json'}});

export async function handle(req, env){
  const url = new URL(req.url);
  const origin = req.headers.get('Origin') || '';
  const c = cors(origin, env);
  if(req.method === 'OPTIONS') return new Response(null, {status:204, headers:c.headers});
  if(url.pathname === '/health') return json({ok:true, xai:!!env.XAI_API_KEY, elevenlabs:!!env.ELEVENLABS_API_KEY}, 200, c.headers);
  if(req.method !== 'POST') return json({error:'POST only'}, 405, c.headers);
  if(!c.ok) return json({error:'Origin not allowed'}, 403, c.headers);
  if(!env.TEAM_CODE) return json({error:'Server not set up: add a TEAM_CODE variable'}, 500, c.headers);
  if(req.headers.get('X-Team-Code') !== env.TEAM_CODE) return json({error:'Team code required'}, 401, c.headers);
  let body = {};
  try{ const t = await req.text(); if(t.length > 120000) return json({error:'Too large'}, 413, c.headers); body = t ? JSON.parse(t) : {}; }catch(e){ return json({error:'Bad JSON'}, 400, c.headers); }
  const xh = {'Authorization':'Bearer ' + env.XAI_API_KEY, 'Content-Type':'application/json'};

  try{
    if(url.pathname === '/session'){
      if(!env.XAI_API_KEY) return json({error:'XAI_API_KEY not set'}, 500, c.headers);
      const r = await fetch(XAI + '/realtime/client_secrets', {method:'POST', headers:xh, body:JSON.stringify({expires_after:{seconds:600}})});
      return new Response(await r.text(), {status:r.status, headers:{...c.headers, 'Content-Type':'application/json'}});
    }
    if(url.pathname === '/tts'){
      const text = String(body.text || '').slice(0, 700);
      if(!text) return json({error:'No text'}, 400, c.headers);
      let r;
      if(body.provider === 'elevenlabs'){
        if(!env.ELEVENLABS_API_KEY) return json({error:'ELEVENLABS_API_KEY not set'}, 500, c.headers);
        if(!EL_VOICES.has(body.voice)) return json({error:'Voice not allowed'}, 400, c.headers);
        r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${body.voice}?output_format=mp3_44100_128`, {method:'POST',
          headers:{'xi-api-key':env.ELEVENLABS_API_KEY, 'Content-Type':'application/json'},
          body:JSON.stringify({text, model_id:'eleven_multilingual_v2', voice_settings:{stability:0.4, similarity_boost:0.75, style:0.35, use_speaker_boost:true}})});
      } else {
        if(!env.XAI_API_KEY) return json({error:'XAI_API_KEY not set'}, 500, c.headers);
        if(!XAI_VOICES.has(body.voice)) return json({error:'Voice not allowed'}, 400, c.headers);
        r = await fetch(XAI + '/tts', {method:'POST', headers:xh, body:JSON.stringify({text, voice_id:body.voice, language:'en'})});
      }
      if(!r.ok) return json({error:'TTS ' + r.status, detail:(await r.text()).slice(0, 300)}, r.status, c.headers);
      return new Response(r.body, {status:200, headers:{...c.headers, 'Content-Type':r.headers.get('Content-Type') || 'audio/mpeg'}});
    }
    if(url.pathname === '/review'){
      const msgs = Array.isArray(body.messages) ? body.messages.slice(0, 2).map(m => ({role:m.role === 'system' ? 'system' : 'user', content:String(m.content || '').slice(0, 40000)})) : [];
      if(!msgs.length) return json({error:'No messages'}, 400, c.headers);
      const req2 = {model:env.XAI_TEXT_MODEL || 'grok-4', messages:msgs, temperature:0.4, max_tokens:1800, response_format:{type:'json_object'}};
      const r = await fetch(XAI + '/chat/completions', {method:'POST', headers:xh, body:JSON.stringify(req2)});
      return new Response(await r.text(), {status:r.status, headers:{...c.headers, 'Content-Type':'application/json'}});
    }
    if(url.pathname === '/research'){
      const input = Array.isArray(body.input) ? body.input.slice(0, 2).map(m => ({role:m.role === 'system' ? 'system' : 'user', content:String(m.content || '').slice(0, 4000)})) : [];
      const req2 = {model:env.XAI_TEXT_MODEL || 'grok-4', input, tools:[{type:'web_search'}], max_output_tokens:2000};
      const r = await fetch(XAI + '/responses', {method:'POST', headers:xh, body:JSON.stringify(req2)});
      return new Response(await r.text(), {status:r.status, headers:{...c.headers, 'Content-Type':'application/json'}});
    }
    return json({error:'Not found'}, 404, c.headers);
  }catch(e){
    return json({error:'Upstream error', detail:String(e && e.message || e).slice(0, 200)}, 502, c.headers);
  }
}

export default { fetch: (req, env) => handle(req, env) };
