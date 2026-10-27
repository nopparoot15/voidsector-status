// Cloudflare Worker: when the origin (the Mac behind the Cloudflare Tunnel) is down, show the maintenance page instead of Cloudflare's
// error page. The page is read from this GitHub repo (index.html on main, cached at the edge for 5 minutes), so changing the page is
// just a push — no re-paste here. A copy is also built into this script (see build.mjs) and used if GitHub can't be reached.
// Route it on voidsector.net/* and www.voidsector.net/* (see README.md). Nothing to configure.

const PAGE_URL = 'https://raw.githubusercontent.com/nopparoot15/voidsector-status/main/index.html';
const FALLBACK_PAGE = __PAGE__;

async function loadPage() {
  try {
    const r = await fetch(PAGE_URL, { cf: { cacheTtl: 300, cacheEverything: true }, signal: AbortSignal.timeout(2500) });
    if (r.ok) {
      const html = await r.text();
      if (html.includes('</html>') && html.length > 500) return html; // sanity check: a real page, not an error body
    }
  } catch { /* GitHub unreachable or slow */ }
  return FALLBACK_PAGE;
}

// statuses that mean "the origin is not there": 502/504 (tunnel up, local service down or hung), 521-524 and 530 (tunnel/origin unreachable)
const DOWN = new Set([502, 503, 504, 521, 522, 523, 524, 530]);
const HEADERS = { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'retry-after': '120', 'x-robots-tag': 'noindex' };

export default {
  async fetch(request) {
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
    return new Response(request.method === 'HEAD' ? null : await loadPage(), { status: 503, headers: HEADERS });
  },
};
