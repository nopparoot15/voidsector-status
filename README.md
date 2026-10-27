# voidsector-status

The page people see on **voidsector.net** while the server is off. The site runs on a Mac behind a Cloudflare Tunnel; when the Mac
is down Cloudflare would show its own error page. A small Cloudflare Worker (`worker/worker.js`) notices that and, for page
visits only, returns this page (status 503, `noindex`) instead.

- `index.html` — the page (static, no build). Auto-checks every 30 s and reloads into the site once it is back.
- `vercel.json` — hosting settings for Vercel (import this repo as a static project, no build command).
- `worker/worker.js` — the Cloudflare Worker.

## Set up
1. **Vercel**: Add New → Project → import this repo (framework "Other", no build command, output = root). Note its `*.vercel.app` address.
2. **Cloudflare**: Workers & Pages → Create → Worker → paste `worker/worker.js` → Deploy. Settings → Variables: `FALLBACK_URL` = the Vercel address
   (https://…vercel.app/). Settings → Domains & Routes: add `voidsector.net/*` and `www.voidsector.net/*`.
3. Keep the free plan under 100,000 requests/day: add routes WITHOUT a Worker (choose "None") for the paths that are not pages —
   `voidsector.net/css/*`, `/js/*`, `/img/*`, `/uploads/*`, `/api/*`, `/socket.io/*`, `/gacha-app/*`, `/videos/*` (the more specific route wins) — or use Workers Paid.

## Test without taking the site down
In the Worker's quick editor add `200` to the `DOWN` set, reload voidsector.net in a private window → this page appears with status 503. Remove the change.
Real test: stop `cloudflared` on the Mac for a minute, or turn the Mac off.

Only `voidsector.net` and `www` are covered; add routes the same way for other hostnames.
