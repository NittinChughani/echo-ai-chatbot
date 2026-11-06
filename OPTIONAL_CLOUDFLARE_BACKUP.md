OPTIONAL: CLOUDFLARE BACKUP IF DIRECT ANONYMOUS AI STOPS WORKING
================================================================
This is NOT needed to publish ECHO on GitHub Pages or try the default AI.

1. Open https://dash.cloudflare.com/ in your web browser. Use free Workers.
2. Complete one-time onboarding to register a workers.dev subdomain.
3. Workers & Pages > Create Worker > Deploy.
4. Open its Edit Code page; replace sample code with all of
   cloudflare/worker.js and Deploy.
5. In the Worker's Settings > Bindings, add Workers AI, binding name AI.
   Deploy or save the binding (the exact menu labels may differ).
6. Copy the exact public Worker URL (starts with https:// and ends workers.dev).
7. Edit the GitHub file docs/config.js so it reads:
   window.ECHO_CONFIG = Object.freeze({
     PROVIDER:'cloudflare',
     API_BASE:'https://YOUR-EXACT-WORKER-URL.workers.dev'
   });
8. Commit the edit on GitHub, hard-refresh your website, and test Hello ECHO.

The free AI allowance is capped and shared by all site visitors.
This optional setup needs no Node.js, no payment subscription, and no
visitor sign-in. Owner still needs a free Cloudflare account.