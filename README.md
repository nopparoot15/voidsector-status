# voidsector-status

The page people see on **voidsector.net** while the server is off — and only then. The site runs on a Mac behind a Cloudflare Tunnel; when the
Mac is down Cloudflare would show its own error page. A Cloudflare Worker notices that and, for page visits only, answers with this page
(status 503, `noindex`). The page is built into the Worker script, so it is not hosted anywhere else: there is no address where it can be
opened while the site is up.

- `src/page.html` — the page source (Tailwind); `index.html` — the built page (CSS inlined). Checks every 30 s and reloads into the site once it is back.
- `worker/worker.template.js` — the Worker source; `build.mjs` inlines `index.html` into it and writes `worker/worker.js` (what you deploy).

## Set up
1. Cloudflare → Workers & Pages → Create → connect this repo (Workers Builds, see "Deploy" below). No variables needed.
2. Settings → Domains & Routes → add routes `voidsector.net/*` and `www.voidsector.net/*`.
3. Keep the free plan under 100,000 requests/day: add routes WITHOUT a Worker (choose "None") for the paths that are not pages —
   `voidsector.net/css/*`, `/js/*`, `/img/*`, `/uploads/*`, `/api/*`, `/socket.io/*`, `/gacha-app/*`, `/videos/*` — or use Workers Paid.

## Change the page
Edit `src/page.html`, run `npm run build`, commit and push: Cloudflare redeploys the Worker with the new page.

## Test without taking the site down
Real test: stop `cloudflared` on the Mac for a minute, or turn the Mac off.

Only `voidsector.net` and `www` are covered; add routes the same way for other hostnames.

## Building (Tailwind)

The page is written with Tailwind classes in `src/page.html`. `npm install` once, then `npm run build` compiles the CSS and inlines it into
`index.html` (no CDN needed at runtime) and rebuilds `worker/worker.js`. Edit `src/page.html`, build, commit **both** `src/page.html` and the
generated `index.html`, push.

## Deploy (Cloudflare Workers Builds)

The Worker `voidsector-status` is connected to this repo: every push to `main` runs the build (`npm ci && npm run build`) and
`npx wrangler deploy` (config: `wrangler.jsonc`). Routes are not in the config; they are set on the Worker in the dashboard
(Settings → Domains & Routes): `voidsector.net/*` and `www.voidsector.net/*`, failure mode **Fail open**.
