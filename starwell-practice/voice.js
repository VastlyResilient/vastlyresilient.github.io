/* StarWell Practice Line: audio engine and voice providers.
   - xAI Grok: live owner (Voice Agent API, realtime), exact-line owner voice (TTS), AI call review.
   - ElevenLabs: second voice provider for exact lines.
   - Device voice: last-resort fallback.
   Keys never live in this repo. They come from the team token server (config.js) or, on Bobby's own device,
   from Settings (stored only in that browser). */
'use strict';

const LS = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v === null ? d : v; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, v); }catch(e){} },
  del(k){ try{ localStorage.removeItem(k); }catch(e){} },
  json(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){ return d; } }
};

const CFG = {
  get server(){ return (LS.get('sw_pl_server', '') || (window.SW_CONFIG && window.SW_CONFIG.server) || '').replace(/\/$/, ''); },
  get team(){ return LS.get('sw_pl_team', ''); },
  get xaiKey(){ return LS.get('sw_pl_xai', ''); },
  get elKey(){ return LS.get('sw_pl_el', ''); },
  get voicePref(){ return LS.get('sw_pl_voice', 'auto'); },   // auto | xai | elevenlabs | device
  get phoneFx(){ return LS.get('sw_pl_fx', '1') === '1'; },
  get noise(){ return LS.get('sw_pl_noise', '1') === '1'; },
  get textModel(){ return LS.get('sw_pl_model', (window.SW_CONFIG && window.SW_CONFIG.textModel) || 'grok-4'); }
};

const XAI_VOICES = { m:['rex','leo','sal'], f:['ara','eve'] };
const EL_VOICES = { m:['pqHfZKP75CvOlQylNhV4','TxGEqnHWrfWFTfGW9XjX','CwhRBWXzGAHq8TqKPgfo','cjVigY5qzO86Huf0OWal','iP95p4xoKVk53GoZ742B'],
                    f:['XrExE9yKIg1WjnnlVkGX','cgSgspJ2msm6clMCkdW9','EXAVITQu4vr4xnSDxMaL'] };

const DIAG = [];   // last events, shown in Settings > Diagnostics
function diag(msg){ DIAG.push(new Date().toLocaleTimeString() + '  ' + msg); if(DIAG.length > 60) DIAG.shift(); }

/* ---------- Audio engine: one context, phone-line sound, mic analysis ---------- */
const AE = {
  ctx:null, out:null, outAn:null, mix:null, mic:null, micSrc:null, micAn:null, noiseSrc:null,
  init(){
    if(this.ctx){ if(this.ctx.state === 'suspended') this.ctx.resume(); return this.ctx; }
    const C = window.AudioContext || window.webkitAudioContext;
    this.ctx = new C();
    const c = this.ctx;
    // Owner audio goes through a phone-line chain so it sounds like a real call.
    this.out = c.createGain();
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 280;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3600;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -24; comp.ratio.value = 4;
    this.fxIn = c.createGain(); this.dryIn = c.createGain();
    this.fxIn.connect(hp); hp.connect(lp); lp.connect(comp); comp.connect(this.out);
    this.dryIn.connect(this.out);
    this.outAn = c.createAnalyser(); this.outAn.fftSize = 512;
    this.out.connect(this.outAn); this.out.connect(c.destination);
    this.mix = c.createMediaStreamDestination ? c.createMediaStreamDestination() : null;
    if(this.mix) this.out.connect(this.mix);
    return c;
  },
  get input(){ return CFG.phoneFx ? this.fxIn : this.dryIn; },
  async openMic(){
    this.init();
    if(this.mic) return this.mic;
    this.mic = await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true, noiseSuppression:true, autoGainControl:true}});
    this.micSrc = this.ctx.createMediaStreamSource(this.mic);
    this.micAn = this.ctx.createAnalyser(); this.micAn.fftSize = 2048;
    this.micSrc.connect(this.micAn);
    if(this.mix) this.micSrc.connect(this.mix);
    return this.mic;
  },
  closeMic(){ if(this.mic){ this.mic.getTracks().forEach(t => t.stop()); this.mic = null; this.micSrc = null; this.micAn = null; } this.noiseOff(); },
  /* returns {db, f0} for the current mic frame */
  frame(){
    if(!this.micAn) return {db:-100, f0:0};
    const n = this.micAn.fftSize, buf = new Float32Array(n);
    this.micAn.getFloatTimeDomainData(buf);
    let s = 0; for(let i = 0; i < n; i++) s += buf[i]*buf[i];
    const rms = Math.sqrt(s/n), db = 20*Math.log10(rms + 1e-9);
    return {db, f0: db > -45 ? pitch(buf, this.ctx.sampleRate) : 0};
  },
  outLevel(){
    if(!this.outAn) return 0;
    const b = new Uint8Array(this.outAn.fftSize); this.outAn.getByteTimeDomainData(b);
    let m = 0; for(const v of b) m = Math.max(m, Math.abs(v - 128)); return m/128;
  },
  noiseOn(kind){
    if(!CFG.noise || this.noiseSrc || !this.ctx) return;
    const c = this.ctx, len = c.sampleRate*4, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    let last = 0; for(let i = 0; i < len; i++){ const w = Math.random()*2 - 1; last = (last + 0.02*w)/1.02; d[i] = last*3.2; }   // brown noise
    const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
    const g = c.createGain(); g.gain.value = kind ? 0.05 : 0.025;
    src.connect(g); g.connect(this.input); src.start();
    this.noiseSrc = src;
  },
  noiseOff(){ try{ this.noiseSrc && this.noiseSrc.stop(); }catch(e){} this.noiseSrc = null; }
};

/* autocorrelation pitch estimate (Hz), 70-400 Hz voice range */
function pitch(buf, sr){
  const n = buf.length, minLag = Math.floor(sr/400), maxLag = Math.floor(sr/70);
  let best = 0, bestLag = 0;
  for(let lag = minLag; lag <= maxLag; lag += 1){
    let s = 0; for(let i = 0; i < n - lag; i += 2) s += buf[i]*buf[i + lag];
    if(s > best){ best = s; bestLag = lag; }
  }
  let e = 0; for(let i = 0; i < n; i += 2) e += buf[i]*buf[i];
  return (bestLag && best/e > 0.3) ? sr/bestLag : 0;
}

/* ---------- Playback ---------- */
const Player = {
  src:null, done:null,
  async playBytes(ab){
    const c = AE.init();
    const buf = await c.decodeAudioData(ab.slice(0));
    return new Promise(res => {
      this.stop();
      const s = c.createBufferSource(); s.buffer = buf; s.connect(AE.input);
      s.onended = () => { if(this.src === s){ this.src = null; } res(); };
      this.src = s; this.done = res; s.start();
    });
  },
  stop(){ if(this.src){ const s = this.src, d = this.done; this.src = null; try{ s.onended = null; s.stop(); }catch(e){} d && d(); } if(window.speechSynthesis) speechSynthesis.cancel(); }
};

/* ---------- HTTP helpers ---------- */
async function srv(path, body, asBytes){
  const r = await fetch(CFG.server + path, {method:'POST', headers:{'Content-Type':'application/json', 'X-Team-Code':CFG.team}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error(path + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return asBytes ? r.arrayBuffer() : r.json();
}
async function xai(path, body, asBytes){
  const r = await fetch('https://api.x.ai/v1' + path, {method:'POST', headers:{'Content-Type':'application/json', 'Authorization':'Bearer ' + CFG.xaiKey}, body:JSON.stringify(body)});
  if(!r.ok) throw new Error('xAI ' + path + ' ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return asBytes ? r.arrayBuffer() : r.json();
}

const Voice = {
  /* what can this device do right now */
  can(){ return { server: !!CFG.server, xai: !!(CFG.server || CFG.xaiKey), el: !!(CFG.server || CFG.elKey) }; },
  label(){
    const c = this.can();
    if(c.server) return 'Team voice server';
    if(CFG.xaiKey) return LS.get('sw_pl_vault', '') ? 'StarWell team key (unlocked by ' + LS.get('sw_pl_vault', '') + ')' : 'xAI key on this device';
    return 'Device voice only';
  },
  pickVoices(p){
    const g = p.gender;
    return { xai: XAI_VOICES[g][p.seed % XAI_VOICES[g].length], el: EL_VOICES[g][p.seed % EL_VOICES[g].length] };
  },
  cache: new Map(),
  /* Say an exact line in the owner's voice. Resolves when finished. */
  async say(text, p, onStart){
    const pref = CFG.voicePref, c = this.can();
    const order = pref === 'device' ? [] : pref === 'elevenlabs' ? ['el','xai'] : ['xai','el'];
    for(const prov of order){
      if(!c[prov]) continue;
      if(this.failed && this.failed[prov] > 1) continue;
      try{
        const key = prov + '|' + p.voices[prov] + '|' + text;
        let ab = this.cache.get(key);
        if(!ab){ ab = await this.tts(prov, text, p); this.cache.set(key, ab); if(this.cache.size > 50) this.cache.delete(this.cache.keys().next().value); }
        onStart && onStart(prov);
        await Player.playBytes(ab);
        return prov;
      }catch(e){ diag('TTS ' + prov + ' failed: ' + e.message); this.failed = this.failed || {}; this.failed[prov] = (this.failed[prov] || 0) + 1; }
    }
    onStart && onStart('device');
    await deviceSay(text, p);
    return 'device';
  },
  async tts(prov, text, p){
    if(prov === 'xai'){
      if(CFG.server) return srv('/tts', {provider:'xai', text, voice:p.voices.xai}, true);
      return xai('/tts', {text, voice_id:p.voices.xai, language:'en'}, true);
    }
    if(CFG.server) return srv('/tts', {provider:'elevenlabs', text, voice:p.voices.el}, true);
    const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + p.voices.el + '?output_format=mp3_44100_128', {
      method:'POST', headers:{'Content-Type':'application/json', 'xi-api-key':CFG.elKey},
      body:JSON.stringify({text, model_id:'eleven_multilingual_v2', voice_settings:{stability:0.4, similarity_boost:0.75, style:0.35, use_speaker_boost:true}})});
    if(!r.ok) throw new Error('ElevenLabs ' + r.status + ' ' + (await r.text()).slice(0, 160));
    return r.arrayBuffer();
  },
  async token(){
    if(CFG.server){ const j = await srv('/session', {}); return j.value || (j.client_secret && j.client_secret.value); }
    if(CFG.xaiKey){
      try{ const j = await xai('/realtime/client_secrets', {expires_after:{seconds:600}}); return j.value || (j.client_secret && j.client_secret.value); }
      catch(e){
        if(!(e instanceof TypeError)) throw e;
        // the browser blocked the token request; the voice socket isn't subject to that, so try the key on the socket
        diag('Token request blocked by the browser (' + e.message + '). Trying the voice line directly.');
        return CFG.xaiKey;
      }
    }
    throw new Error('No voice server or xAI key set up');
  },
  /* AI coach review. Returns parsed JSON or throws. */
  async review(payload){
    const messages = [{role:'system', content:REVIEW_SYSTEM}, {role:'user', content:JSON.stringify(payload)}];
    const body = {model:CFG.textModel, messages, temperature:0.4, response_format:{type:'json_object'}};
    const j = CFG.server ? await srv('/review', body) : await xai('/chat/completions', body);
    const txt = j.choices ? j.choices[0].message.content : (j.content || JSON.stringify(j));
    return JSON.parse(txt.replace(/^```json|```$/g, '').trim());
  },
  /* Web research for a real shop (beta). Returns facts JSON. */
  async research(shop, town){
    const body = {model:CFG.textModel, input:[{role:'system', content:RESEARCH_SYSTEM}, {role:'user', content:`Research this HVAC company: "${shop}" in ${town}, Connecticut.`}], tools:[{type:'web_search'}]};
    const j = CFG.server ? await srv('/research', body) : await xai('/responses', body);
    let txt = j.output_text || '';
    if(!txt && j.output) for(const o of j.output) if(o.content) for(const c of o.content) if(c.text) txt += c.text;
    const m = txt.match(/\{[\s\S]*\}/); if(!m) throw new Error('No research JSON returned');
    return JSON.parse(m[0]);
  }
};

function deviceSay(text, p){
  return new Promise(res => {
    if(!window.speechSynthesis){ setTimeout(res, 300 + text.length*45); return; }
    const u = new SpeechSynthesisUtterance(text.replace(/\(.*?\)/g, ''));
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang));
    const fem = /samantha|zira|aria|jenny|female|victoria|karen|allison|ava|susan|google us english/i;
    const nice = vs.filter(v => /natural|premium|enhanced|neural|online/i.test(v.name));
    const pool = (nice.length ? nice : vs).filter(v => p.gender === 'f' ? fem.test(v.name) : !fem.test(v.name));
    u.voice = pool[p.seed % Math.max(1, pool.length)] || vs[0] || null;
    u.rate = p.rate; u.pitch = p.pitchMul;
    let done = false; const fin = () => { if(!done){ done = true; res(); } };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 2000 + text.length*110);
    speechSynthesis.speak(u);
  });
}

/* ---------- Team key vault ----------
   The xAI key ships encrypted, once per teammate (AES-256-GCM, PBKDF2-SHA256 600k rounds).
   Each person's own code opens it on their phone. Remove someone's entry in config.js to cancel their code. */
const hasVault = () => !!(window.SW_CONFIG && SW_CONFIG.vault && SW_CONFIG.vault.entries && SW_CONFIG.vault.entries.length);
function normCode(code){
  const c = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  return c.length === 16 ? c.match(/.{4}/g).join('-') : String(code || '').trim().toLowerCase();
}
async function unlockVault(code, who){
  if(!hasVault()) throw new Error('No team key in this version');
  if(!window.crypto || !crypto.subtle) throw new Error('This browser can\'t unlock the key (it needs the https page)');
  const v = SW_CONFIG.vault, ub = s => Uint8Array.from(atob(s), ch => ch.charCodeAt(0));
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(normCode(code)), 'PBKDF2', false, ['deriveKey']);
  const list = v.entries.slice().sort((a, b) => (b.who === who) - (a.who === who));   // try this person's entry first
  for(const e of list){
    try{
      const k = await crypto.subtle.deriveKey({name:'PBKDF2', salt:ub(e.salt), iterations:v.iter, hash:'SHA-256'}, base, {name:'AES-GCM', length:256}, false, ['decrypt']);
      const pt = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM', iv:ub(e.iv)}, k, ub(e.ct))));
      if(pt.xai) LS.set('sw_pl_xai', pt.xai);
      if(pt.el) LS.set('sw_pl_el', pt.el);
      LS.set('sw_pl_vault', e.who);
      if(window.Voice) Voice.failed = {};
      return e.who;
    }catch(err){}
  }
  throw new Error('That code didn\'t work. Check it and try again.');
}
/* if a code is cancelled (entry removed), forget the key it unlocked */
(() => { const w = LS.get('sw_pl_vault', ''); if(w && hasVault() && !SW_CONFIG.vault.entries.some(e => e.who === w)){ LS.del('sw_pl_xai'); LS.del('sw_pl_el'); LS.del('sw_pl_vault'); } })();

/* ---------- Live owner over the xAI Voice Agent API ---------- */
class LiveCall {
  constructor(h){ this.h = h; this.ws = null; this.queue = []; this.next = 0; this.sources = []; this.ended = false; this.ownerText = ''; this.endArgs = null; }
  async start(p, instructions, answerLine, beforeGreet){
    const c = AE.init();
    await AE.openMic();
    const token = await Voice.token();
    if(this.ended) throw new Error('cancelled');
    diag('Live: got session token');
    this.ws = new WebSocket((window.SW_CONFIG && SW_CONFIG.realtimeUrl) || 'wss://api.x.ai/v1/realtime?model=grok-voice-latest', ['xai-client-secret.' + token]);
    this.ws.onmessage = e => this.onMsg(e);
    let opened = false;
    await new Promise((res, rej) => {
      const timer = setTimeout(() => rej(new Error('Voice server did not answer')), 12000);
      this.ws.onopen = () => { opened = true; clearTimeout(timer); res(); };
      this.ws.onerror = () => { diag('Live: websocket error'); if(!opened){ clearTimeout(timer); rej(new Error('Could not connect')); } else this.h.onError && this.h.onError('Connection error'); };
      this.ws.onclose = ev => { diag('Live: closed ' + ev.code + ' ' + (ev.reason || '')); if(!opened){ clearTimeout(timer); rej(new Error('Connection closed (' + ev.code + ')')); } else if(!this.ended) this.h.onClosed && this.h.onClosed(ev.code); };
    });
    if(this.ended) throw new Error('cancelled');
    diag('Live: connected');
    this.send({type:'session.update', session:{
      instructions, voice:p.voices.xai,
      turn_detection:{type:'server_vad'},
      reasoning:{effort:'none'},
      audio:{
        input:{format:{type:'audio/pcm', rate:24000}, transcription:{language_hint:'en', keyterms:['StarWell','Connecticut', p.shop, p.owner.split(' ')[0], p.town, 'walkthrough', 'HVAC']}},
        output:{format:{type:'audio/pcm', rate:24000}, speed:Math.min(1.25, Math.max(0.85, p.rate))}
      },
      tools:[END_CALL_TOOL]
    }});
    if(beforeGreet) await beforeGreet();
    if(this.ended) throw new Error('cancelled');
    await this.startMic();
    // the phone rings, the owner picks up
    this.send({type:'response.create', response:{instructions:`The phone just rang and you picked up. Say only this greeting, in character: "${answerLine}"`}});
  }
  send(o){ if(this.ws && this.ws.readyState === 1) this.ws.send(JSON.stringify(o)); }
  async startMic(){
    const c = AE.ctx, sr = c.sampleRate, ratio = sr/24000;
    let pos = 0, prev = 0;   // fractional read position carried across blocks (no seams)
    const pushPCM = f32 => {
      if(this.ended) return;
      const out = [];
      while(pos < f32.length){
        const i = Math.floor(pos), fr = pos - i;
        const x0 = i < f32.length ? f32[i] : f32[f32.length - 1], x1 = i + 1 < f32.length ? f32[i + 1] : x0;
        out.push(x0 + (x1 - x0)*fr);
        pos += ratio;
      }
      pos -= f32.length; prev = f32[f32.length - 1];
      if(this.muted) return;
      const pcm = new Int16Array(out.length);
      for(let i = 0; i < out.length; i++) pcm[i] = Math.max(-1, Math.min(1, out[i]))*0x7fff;
      this.queue.push(pcm);
      let total = 0; for(const q of this.queue) total += q.length;
      if(total >= 2400){   // ~100 ms
        const all = new Int16Array(total); let o = 0; for(const q of this.queue){ all.set(q, o); o += q.length; }
        this.queue = [];
        this.send({type:'input_audio_buffer.append', audio:b64(all.buffer)});
      }
    };
    if(c.audioWorklet){
      const code = `class P extends AudioWorkletProcessor{process(i){const ch=i[0]&&i[0][0];if(ch)this.port.postMessage(ch.slice(0));return true}}registerProcessor('sw-cap',P);`;
      const url = URL.createObjectURL(new Blob([code], {type:'application/javascript'}));
      await c.audioWorklet.addModule(url);
      this.node = new AudioWorkletNode(c, 'sw-cap');
      this.node.port.onmessage = e => pushPCM(e.data);
      AE.micSrc.connect(this.node);
      const z = c.createGain(); z.gain.value = 0; this.node.connect(z); z.connect(c.destination); this.sink = z;
    } else {
      this.node = c.createScriptProcessor(4096, 1, 1);
      this.node.onaudioprocess = e => pushPCM(e.inputBuffer.getChannelData(0));
      AE.micSrc.connect(this.node); this.node.connect(c.destination);
    }
  }
  playPCM(b64s){
    if(this.onHold || this.ended) return;
    const c = AE.ctx, bytes = ub64(b64s), pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.byteLength/2));
    if(!pcm.length) return;
    const buf = c.createBuffer(1, pcm.length, 24000), d = buf.getChannelData(0);
    for(let i = 0; i < pcm.length; i++) d[i] = pcm[i]/0x8000;
    const s = c.createBufferSource(); s.buffer = buf; s.connect(AE.input);
    const t = Math.max(c.currentTime + 0.03, this.next); s.start(t); this.next = t + buf.duration;
    this.sources.push(s); s.onended = () => { this.sources = this.sources.filter(x => x !== s); if(!this.sources.length) this.h.onOwnerSilent && this.h.onOwnerSilent(); };
    this.h.onOwnerAudio && this.h.onOwnerAudio(buf.duration);
  }
  cutOwner(){ const had = this.sources.length; for(const s of this.sources){ try{ s.onended = null; s.stop(); }catch(e){} } this.sources = []; this.next = 0; if(had) this.h.onOwnerSilent && this.h.onOwnerSilent(); }
  get ownerTalking(){ return this.sources.length > 0; }
  onMsg(e){
    let m; try{ m = JSON.parse(e.data); }catch(err){ return; }
    const t = m.type || '';
    if(t === 'response.output_audio.delta' || t === 'response.audio.delta'){ this.playPCM(m.delta); return; }
    if(t === 'response.output_audio_transcript.delta' || t === 'response.audio_transcript.delta'){ this.ownerText += m.delta || ''; this.h.onOwnerText && this.h.onOwnerText(this.ownerText, false); return; }
    if(t === 'response.output_audio_transcript.done' || t === 'response.audio_transcript.done'){ const txt = m.transcript || this.ownerText; this.ownerText = ''; this.h.onOwnerText && this.h.onOwnerText(txt, true); return; }
    if(t === 'input_audio_buffer.speech_started'){ if(this.ownerTalking) this.cutOwner(); this.h.onCallerSpeech && this.h.onCallerSpeech(true); return; }
    if(t === 'input_audio_buffer.speech_stopped'){ this.h.onCallerSpeech && this.h.onCallerSpeech(false); return; }
    if(t === 'conversation.item.input_audio_transcription.completed'){ this.h.onCallerText && this.h.onCallerText(m.transcript || '', true); return; }
    if(t === 'conversation.item.input_audio_transcription.updated'){ this.h.onCallerText && this.h.onCallerText(m.transcript || '', false); return; }
    if(t === 'response.function_call_arguments.done'){
      let args = {}; try{ args = JSON.parse(m.arguments || '{}'); }catch(err){}
      diag('Live: owner called ' + m.name + ' ' + (m.arguments || ''));
      if(m.name === 'end_call'){ this.endArgs = args; this.waitThenEnd(); }
      return;
    }
    if(t === 'error'){ diag('Live error: ' + JSON.stringify(m.error || m).slice(0, 240)); this.h.onError && this.h.onError((m.error && m.error.message) || 'Voice error'); return; }
    if(t === 'session.updated'){ diag('Live: session configured'); return; }
  }
  waitThenEnd(){
    const tick = () => { if(this.ownerTalking) return setTimeout(tick, 300); setTimeout(() => this.h.onOwnerHangup && this.h.onOwnerHangup(this.endArgs), 500); };
    tick();
  }
  stop(){
    this.ended = true; this.cutOwner();
    try{ this.node && this.node.disconnect(); }catch(e){}
    try{ this.ws && this.ws.close(); }catch(e){}
  }
}

function b64(buf){ let s = ''; const b = new Uint8Array(buf); for(let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); }
function ub64(s){ const bin = atob(s), b = new Uint8Array(bin.length); for(let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b; }

/* ---------- Prompts ---------- */

const REVIEW_SYSTEM = `You are a warm, precise phone coach for StarWell, here in Connecticut, a team that offers HVAC shop owners free help (a fresh website, a one-page search check, social media help, and a demo line that answers calls on its own phone number). New callers practice on simulated owners. You get the persona, the transcript, delivery metrics, and our rule-based findings.
Write coaching that is specific, kind, and practical. Quote the caller's actual words. Every example line you write must mention StarWell, and "StarWell, here in Connecticut" when location comes up. StarWell is new to working with HVAC shops, not new to Connecticut. Ongoing help is three to four hundred a month; never say "most shops". The meeting is a 15-minute walkthrough. Never use the words "cold call". Refer to the owner by name or as "the owner" or "they".
Explain each improvement from the owner's point of view in one plain sentence. No citations, studies, author names, company names or statistics.
The call has eight steps, with these keys: greet (Hello), reason (Why you're calling), noticed (What you noticed), follow (Follow-up), offer (The offer), questions (Their questions), next (Next step), thanks (Goodbye). Delivery covers pace, filler words and tone.
Return ONLY JSON with this shape:
{"summary":"2 sentences","owner_take":"2-3 sentences in the owner's first-person voice","scores":{"greet":0-100,"reason":0-100,"noticed":0-100,"follow":0-100,"offer":0-100,"questions":0-100,"next":0-100,"thanks":0-100,"delivery":0-100},
"strengths":[{"quote":"caller's words","why":"why it worked for the owner"}],
"improvements":[{"skill":"greet|reason|noticed|follow|offer|questions|next|thanks|delivery","quote":"caller's words","better":"a better line for StarWell","why":"one plain sentence from the owner's side","guide":"greet|reason|noticed|follow|offer|questions|next|thanks"}],
"drill":"one specific thing to practice before the next call"}
"guide" must be one of the eight step keys: the step the improvement belongs to (for a delivery note, the step where it happened). Give 2-3 strengths and 2-4 improvements, most important first.`;

const RESEARCH_SYSTEM = `You research small HVAC companies in Connecticut so a StarWell caller can make a friendly, well-prepared phone call. Use web search. Only report facts you actually found, each with where you found it. Never guess. Return ONLY JSON:
{"shop":"","owner":"first name or empty","town":"","phone":"","since":"","hours":"","after_hours":"what happens after hours if stated","rating":"","reviews":"","review_themes":["..."],"services":["..."],"website_notes":["observations about booking, mobile, last update"],"social":"last post date if visible","hiring":"","true_thing":"one checkable, non-critical fact that could help them","sources":["urls"]}`;
