/* Run the StarWell voice server on Node 18+ (Railway, Render, a VPS, or your laptop).
   No dependencies. Set XAI_API_KEY (and optionally ELEVENLABS_API_KEY, TEAM_CODE, ALLOWED_ORIGIN), then: node server.mjs */
import http from 'node:http';
import { handle } from './worker.js';

const PORT = process.env.PORT || 8787;
const hits = new Map();   // simple per-IP limit: 120 requests / 10 minutes

http.createServer(async (req, res) => {
  // the proxy appends the real client address last; earlier entries can be faked
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',').pop().trim();
  if(hits.size > 5000) for(const [k, v] of hits) if(!v.length || Date.now() - v[v.length - 1] > 600000) hits.delete(k);
  const now = Date.now(), h = (hits.get(ip) || []).filter(t => now - t < 600000);
  h.push(now); hits.set(ip, h);
  if(h.length > 120){ res.writeHead(429, {'Content-Type':'application/json'}); res.end('{"error":"Slow down"}'); return; }
  const chunks = []; for await (const ch of req) chunks.push(ch);
  const body = Buffer.concat(chunks);
  const request = new Request('http://local' + req.url, {method:req.method, headers:req.headers, body:['GET','HEAD','OPTIONS'].includes(req.method) ? undefined : body});
  const r = await handle(request, process.env);
  const headers = {}; r.headers.forEach((v, k) => headers[k] = v);
  res.writeHead(r.status, headers);
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(PORT, () => console.log('StarWell voice server on :' + PORT));
