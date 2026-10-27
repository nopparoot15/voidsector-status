// Cloudflare Worker: when the origin (the Mac behind the Cloudflare Tunnel) is down, show the maintenance page instead of Cloudflare's
// error page. The page is built into this script (see build.mjs) — it is not hosted anywhere else, so nobody can open it while the
// site is up: the only way to see it is to visit voidsector.net while the server is really off.
// Route it on voidsector.net/* and www.voidsector.net/* (see README.md). Nothing to configure.

const PAGE = "<!doctype html>\n<html lang=\"th\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n<meta name=\"robots\" content=\"noindex, nofollow\">\n<meta name=\"theme-color\" content=\"#07070f\">\n<title>VoidSector — ปิดปรับปรุง</title>\n<style>\n  :root{--bg:#07070f;--card:#12121f;--line:rgba(255,255,255,.09);--text:#eceefb;--sub:#9a9fc0;--pri:#7c6cff;--ok:#3ddc97}\n  *{box-sizing:border-box}\n  html,body{margin:0;min-height:100%}\n  body{min-height:100vh;min-height:100dvh;background:radial-gradient(1100px 560px at 50% -12%,#1c1745 0%,var(--bg) 62%);color:var(--text);font:16px/1.7 system-ui,-apple-system,\"Segoe UI\",Roboto,\"Noto Sans Thai\",sans-serif;display:grid;place-items:center;padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom))}\n  main{width:min(480px,100%);text-align:center}\n  .logo{font-weight:800;letter-spacing:.18em;font-size:13px;color:var(--sub);margin-bottom:20px}\n  .card{background:var(--card);border:1px solid var(--line);border-radius:22px;padding:36px 26px 28px}\n  .orb{width:68px;height:68px;margin:0 auto 22px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#c3b9ff,var(--pri) 55%,#2a2370);animation:pulse 2.6s infinite}\n  @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(124,108,255,.45)}70%{box-shadow:0 0 0 28px rgba(124,108,255,0)}100%{box-shadow:0 0 0 0 rgba(124,108,255,0)}}\n  h1{font-size:26px;line-height:1.3;margin:0 0 8px;font-weight:800}\n  p{margin:0;color:var(--sub);font-size:15px}\n  .row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}\n  .btn{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--text);text-decoration:none;font:inherit;font-size:14px;font-weight:600;cursor:pointer}\n  .btn:hover{background:rgba(255,255,255,.08)}\n  .btn.pri{background:var(--pri);border-color:transparent;color:#fff}\n  .btn.pri:hover{filter:brightness(1.08)}\n  .st{margin-top:22px;font-size:13px;color:var(--sub);display:flex;gap:8px;align-items:center;justify-content:center;min-height:20px}\n  .dot{width:8px;height:8px;border-radius:50%;background:#f5b84a;flex:none}\n  .st.ok .dot{background:var(--ok)}\n  footer{margin-top:18px;font-size:12px;color:#6d7295}\n  @media (prefers-reduced-motion:reduce){.orb{animation:none}}\n</style>\n</head>\n<body>\n<main>\n  <div class=\"logo\">VOIDSECTOR</div>\n  <div class=\"card\">\n    <div class=\"orb\" aria-hidden=\"true\"></div>\n    <h1>ปิดปรับปรุง</h1>\n    <p>ตอนนี้เว็บกำลังปิดปรับปรุงชั่วคราว<br>ลองใหม่ภายหลัง แล้วเราจะกลับมาเร็วๆ นี้</p>\n    <div class=\"st\" id=\"stWrap\" role=\"status\" aria-live=\"polite\"><span class=\"dot\" aria-hidden=\"true\"></span><span id=\"st\">กำลังตรวจสอบสถานะ…</span></div>\n    <div class=\"row\">\n      <a class=\"btn pri\" href=\"https://voidsector.net/\" id=\"retry\">ลองเข้าเว็บอีกครั้ง</a>\n      <a class=\"btn\" href=\"https://discord.com/users/salty6ix\" target=\"_blank\" rel=\"noopener\">ติดต่อผู้ดูแล</a>\n    </div>\n  </div>\n  <footer>หน้านี้แสดงเมื่อเซิร์ฟเวอร์ปิดให้บริการเท่านั้น</footer>\n</main>\n<script>\n  // Shown by the Cloudflare Worker (worker/worker.js) in place of voidsector.net while the server is off. The Worker also answers\n  // /__ping on voidsector.net: 200 = the real site is back, 503 = still down. Every 30 s this page asks and reloads into the site.\n  var onSite = /(^|\\.)voidsector\\.net$/.test(location.hostname) && location.hostname !== 'status.voidsector.net';\n  var st = document.getElementById('st'), wrap = document.getElementById('stWrap'), n = 0;\n  if (!onSite) { st.textContent = 'ปิดปรับปรุงอยู่ในขณะนี้'; }\n  else {\n    var tick = function () {\n      n++;\n      fetch('/__ping?' + Date.now(), { cache: 'no-store' }).then(function (r) {\n        if (r.status === 200) { wrap.className = 'st ok'; st.textContent = 'กลับมาแล้ว กำลังพาเข้าเว็บ…'; location.reload(); }\n        else st.textContent = 'ยังปิดปรับปรุงอยู่ · ตรวจสอบครั้งที่ ' + n;\n      }).catch(function () { st.textContent = 'ยังปิดปรับปรุงอยู่ · ตรวจสอบครั้งที่ ' + n; });\n    };\n    setTimeout(tick, 5000); setInterval(tick, 30000);\n  }\n</script>\n</body>\n</html>\n";

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
    return new Response(request.method === 'HEAD' ? null : PAGE, { status: 503, headers: HEADERS });
  },
};
