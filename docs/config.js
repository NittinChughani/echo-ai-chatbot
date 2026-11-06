/* ECHO provider configuration — no credentials or keys required.
   The free anonymous OVHcloud endpoint is used by default.
   If it is unavailable, the optional Cloudflare Worker can be configured later. */
window.ECHO_CONFIG = Object.freeze({
  PROVIDER: 'ovh',
  API_BASE: '' // Cloudflare fallback only. Example: https://echo.example.workers.dev
});