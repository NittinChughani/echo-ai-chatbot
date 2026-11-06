/* ECHO AI — paste into a Cloudflare Worker via your web browser (no Node.js).
   After deployment, add a Workers AI binding named AI in Worker settings.
   The site files live on GitHub Pages at https://nittinchughani.github.io/ECHO-AI/
   There are NO API tokens in this script and visitors do not sign in.
*/
const SITE_ORIGIN = 'https://nittinchughani.github.io';
const MODELS = Object.freeze({
  quick: '@cf/meta/llama-3.1-8b-instruct-fast',
  balanced: '@cf/google/gemma-4-26b-a4b-it'
});
const SYSTEM = `You are ECHO, a reliable and clear AI chatbot on a free website.
Be helpful, honest about uncertainty, and concise by default. Use Markdown where useful.
You do not have live web browsing, file access, or external tools. Do not claim otherwise.
Follow appropriate safety practices.`;

function cors(origin) {
  return {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
    'vary': 'Origin',
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store'
  };
}
function json(value, status, origin) {
  return new Response(JSON.stringify(value), {
    status, headers: { ...cors(origin), 'content-type': 'application/json; charset=utf-8' }
  });
}
function err(message, status, origin) {
  return json({ error: message }, status, origin);
}
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 14) return null;
  let total = 0;
  const result = [];
  for (const m of messages) {
    if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string') return null;
    const content = m.content.trim();
    if (!content || content.length > 6500) return null;
    total += content.length;
    if (total > 25000) return null;
    result.push({ role: m.role, content });
  }
  return result.at(-1)?.role === 'user' ? result : null;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin') || '';
    const pathname = new URL(request.url).pathname;
    // A visitor who opens the worker's URL directly can see a simple health response.
    if (request.method === 'GET' && pathname === '/') {
      return json({ service: 'ECHO AI backend', message: 'Website: https://nittinchughani.github.io/ECHO-AI/' }, 200, SITE_ORIGIN);
    }
    // Only the GitHub Pages browser origin is allowed to use the API.
    if (origin !== SITE_ORIGIN) {
      return err('This AI endpoint is for the ECHO website.', 403, SITE_ORIGIN);
    }
    if (request.method === 'OPTIONS') {
      if (pathname !== '/api/chat' && pathname !== '/api/health') return err('Not found.', 404, origin);
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (pathname === '/api/health' && request.method === 'GET') {
      return json({ service:'ECHO', ready:!!env.AI, visitorsNeedLogin:false }, 200, origin);
    }
    if (pathname !== '/api/chat') return err('Not found.', 404, origin);
    if (request.method !== 'POST') return err('Only POST is supported.', 405, origin);
    if (!request.headers.get('content-type')?.toLowerCase().includes('application/json')) {
      return err('Expected JSON.', 415, origin);
    }
    if (Number(request.headers.get('content-length') || 0) > 50000) {
      return err('Your request is too long.', 413, origin);
    }
    let data;
    try {
      const body = await request.text();
      if (body.length > 50000) return err('Your request is too long.', 413, origin);
      data = JSON.parse(body);
    } catch {
      return err('Invalid chat request.', 400, origin);
    }
    const messages = validateMessages(data?.messages);
    if (!messages) return err('Please enter a valid message.', 400, origin);
    const mode = Object.hasOwn(MODELS, data?.mode) ? data.mode : 'quick';
    const preference = typeof data?.instructions === 'string' ? data.instructions.trim().slice(0, 1200) : '';
    if (!env.AI || typeof env.AI.run !== 'function') {
      return err('ECHO AI is not configured yet.', 503, origin);
    }
    // Optional Cloudflare Rate Limiting binding (named CHAT_LIMITER) if installed.
    if (env.CHAT_LIMITER) {
      try {
        const ip = request.headers.get('CF-Connecting-IP') || 'anonymous';
        const limit = await env.CHAT_LIMITER.limit({ key: ip });
        if (!limit.success) return err('Too many messages. Please try again shortly.', 429, origin);
      } catch {
        return err('The service is busy. Please retry.', 503, origin);
      }
    }
    try {
      const output = await env.AI.run(MODELS[mode], {
        messages: [
          { role: 'system', content: SYSTEM + (preference ? '\nStyle preference: ' + preference : '') },
          ...messages
        ],
        stream: true,
        max_tokens: mode === 'quick' ? 750 : 1050
      });
      if (output instanceof ReadableStream) {
        return new Response(output, {
          headers: {
            ...cors(origin),
            'content-type': 'text/event-stream; charset=utf-8',
            'cache-control': 'no-cache, no-transform',
            'x-accel-buffering': 'no'
          }
        });
      }
      const answer = typeof output?.response === 'string' ? output.response : output?.choices?.[0]?.message?.content || '';
      return json({ response: answer }, 200, origin);
    } catch (e) {
      const details = String(e?.message || e || '');
      if (/quota|exceed|neurons|capacity|limit|insufficient|billing/i.test(details)) {
        return err('ECHO has reached its free AI usage allowance. Please return after the daily reset.', 429, origin);
      }
      return err('The AI service is temporarily unavailable. Please try again.', 502, origin);
    }
  }
};