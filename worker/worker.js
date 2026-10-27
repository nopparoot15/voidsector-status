// Cloudflare Worker: when the origin (the Mac behind the Cloudflare Tunnel) is down, show the maintenance page hosted on Vercel
// instead of Cloudflare's error page. Route it on voidsector.net/* and www.voidsector.net/* (see README.md).
//
// Set the variable FALLBACK_URL (Worker → Settings → Variables) to the Vercel address of ops/maintenance-landing, e.g.
// https://voidsector-maintenance.vercel.app/ . Nothing else to configure.

// statuses that mean "the origin is not there": 502/504 (tunnel up, local service down or hung), 521-524 and 530 (tunnel/origin unreachable)
const DOWN = new Set([502, 503, 504, 521, 522, 523, 524, 530]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // the maintenance page asks this to learn whether the real site is back: 200 = back, 503 = still down
    if (url.pathname === '/__ping') {
      try {
        const r = await fetch(new Request(new URL('/__health', url.origin), { method: 'GET', headers: { 'cache-control': 'no-store' } }));
        return new Response(null, { status: r.status === 200 ? 200 : 503, headers: { 'cache-control': 'no-store' } });
      } catch { return new Response(null, { status: 503, headers: { 'cache-control': 'no-store' } }); }
    }

    let res = null;
    try { res = await fetch(request); } catch { /* origin unreachable */ }
    if (res && !DOWN.has(res.status)) return res;

    // only people looking at a page get the maintenance page; scripts, images, API calls and websockets just see the error
    const wantsHtml = (request.method === 'GET' || request.method === 'HEAD') && (request.headers.get('accept') || '').includes('text/html');
    if (!wantsHtml) return res || new Response('ปิดปรับปรุง', { status: 503, headers: { 'retry-after': '120', 'content-type': 'text/plain; charset=utf-8' } });

    try {
      const page = await fetch(env.FALLBACK_URL, { headers: { accept: 'text/html' }, cf: { cacheTtl: 60, cacheEverything: true } });
      const h = new Headers({ 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '120', 'x-robots-tag': 'noindex' });
      return new Response(request.method === 'HEAD' ? null : page.body, { status: 503, headers: h });
    } catch {
      return res || new Response('ปิดปรับปรุง ลองใหม่ภายหลัง', { status: 503, headers: { 'retry-after': '120', 'content-type': 'text/plain; charset=utf-8' } });
    }
  },
};
