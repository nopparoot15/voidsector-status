// Build: src/page.html (Tailwind classes) + Tailwind CSS -> index.html (CSS inlined, so the page needs no CDN and no extra request)
//        index.html -> worker/worker.js (the Worker with a fallback copy of the page built in).
// The Worker normally reads index.html from GitHub, so changing the page = `npm run build`, commit, push. Re-paste worker/worker.js into
// Cloudflare only when the Worker logic (worker/worker.template.js) changes.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const css = execFileSync('node_modules/.bin/tailwindcss', ['-c', 'tailwind.config.js', '-i', 'src/input.css', '--minify'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
const src = readFileSync(new URL('./src/page.html', import.meta.url), 'utf8');
const page = src.replace('/*__CSS__*/', () => css);
writeFileSync(new URL('./index.html', import.meta.url), page);

const tpl = readFileSync(new URL('./worker/worker.template.js', import.meta.url), 'utf8');
writeFileSync(new URL('./worker/worker.js', import.meta.url), tpl.replace('__PAGE__', () => JSON.stringify(page)));
console.log(`index.html ${page.length} bytes (css ${css.length}), worker/worker.js written`);
