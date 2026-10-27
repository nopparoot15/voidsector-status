// Builds worker/worker.js: the Worker with a fallback copy of index.html built into it. The Worker normally reads index.html from GitHub, so
// editing only index.html needs just a push. Run `node build.mjs` and re-paste worker/worker.js into Cloudflare only when the Worker logic changes.
import { readFileSync, writeFileSync } from 'node:fs';
const page = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const tpl = readFileSync(new URL('./worker/worker.template.js', import.meta.url), 'utf8');
writeFileSync(new URL('./worker/worker.js', import.meta.url), tpl.replace('__PAGE__', () => JSON.stringify(page)));
console.log('worker/worker.js written (' + page.length + ' bytes of page)');
