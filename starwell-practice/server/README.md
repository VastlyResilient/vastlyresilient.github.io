# StarWell voice server

The Practice Line is a public GitHub page, so it can't hold API keys. This small server holds them and hands the page short-lived access. It powers:

- **Live owner**: a 10-minute xAI Voice Agent token for each live test call.
- **Owner voice in guided calls**: xAI Grok text-to-speech, or ElevenLabs.
- **AI coach**: Grok reviews each call.
- **Shop research (beta)**: Grok runs a web search for a real shop.

## Deploy on Railway (about 3 minutes)

1. In Railway, click **New Project → Deploy from GitHub repo** and pick `VastlyResilient/vastlyresilient.github.io`.
2. In the service settings, set **Root Directory** to `starwell-practice/server`. Railway runs `npm start`.
3. Add these variables:
   - `XAI_API_KEY`: your xAI key.
   - `ELEVENLABS_API_KEY` (optional): your ElevenLabs key.
   - `TEAM_CODE` (required): any phrase. Each teammate enters it once in the app's Settings. Without it, nobody else can use your keys.
4. Click **Generate Domain** and copy the URL.
5. Put the URL into `starwell-practice/config.js` as `server: 'https://…'`, then commit. Alternatively, paste it into Settings on each device.

## Or Cloudflare Workers

Run `npx wrangler deploy worker.js --name starwell-voice`. Then add the secrets with `npx wrangler secret put XAI_API_KEY`, and the same for `TEAM_CODE` (required) and `ELEVENLABS_API_KEY`.

## Check it

Open `https://YOUR-SERVER/health`. You should see `{"ok":true,"xai":true,...}`.

The server only answers requests that carry your team code and come from `https://vastlyresilient.github.io` or localhost. It also limits text-to-speech to the listed voices and to short lines, pins the AI model, and caps the length of every request.
