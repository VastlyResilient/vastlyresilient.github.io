/* Team settings for the Practice Line. Safe to publish: no keys here.
   server: URL of the StarWell voice server (see server/README.md). It holds the xAI and ElevenLabs keys.
   Leave empty until it's deployed; Bobby can still use a key saved on his own device in Settings. */
window.SW_CONFIG = {
  server: 'https://starwell-voice-production.up.railway.app',   // StarWell voice server on Railway (no trailing slash)
  team: 'starwell-ct-7429',    // TEAM_CODE on the server, so teammates never type it
  textModel: 'grok-4'
};
