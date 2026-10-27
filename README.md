# voidsector-status

The page people see on **voidsector.net** while the server is off — and only then. The site runs on a Mac behind a Cloudflare Tunnel; when the
Mac is down Cloudflare would show its own error page. A Cloudflare Worker notices that and, for page visits only, answers with this page
(status 503, `noindex`). The page is built into the Worker script, so it is not hosted anywhere else: there is no address where it can be
opened while the site is up.

- `index.html` — the page (static). Checks every 30 s and reloads into the site once it is back.
- `worker/worker.template.js` — the Worker source; `build.mjs` inlines `index.html` into it and writes `worker/worker.js` (what you deploy).

## Set up
1. Cloudflare → Workers & Pages → your Worker → Edit code → paste `worker/worker.js` → Deploy. (No variables needed.)
2. Settings → Domains & Routes → add routes `voidsector.net/*` and `www.voidsector.net/*`.
3. Keep the free plan under 100,000 requests/day: add routes WITHOUT a Worker (choose "None") for the paths that are not pages —
   `voidsector.net/css/*`, `/js/*`, `/img/*`, `/uploads/*`, `/api/*`, `/socket.io/*`, `/gacha-app/*`, `/videos/*` — or use Workers Paid.

## Change the page
Edit `index.html`, run `node build.mjs`, paste the new `worker/worker.js` into the Worker and Deploy.

## Test without taking the site down
In the Worker's editor add `200` to the `DOWN` set, Deploy, reload voidsector.net in a private window → this page appears (status 503). Remove the change.
Real test: stop `cloudflared` on the Mac for a minute, or turn the Mac off.

Only `voidsector.net` and `www` are covered; add routes the same way for other hostnames.
