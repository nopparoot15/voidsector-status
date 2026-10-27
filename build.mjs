// Builds worker/worker.js: the Worker with index.html built into it. Run `node build.mjs` after editing index.html or worker/worker.template.js,
// then paste worker/worker.js into the Cloudflare Worker (Edit code) and Deploy.
import { readFileSync, writeFileSync } from 'node:fs';
const page = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const tpl = readFileSync(new URL('./worker/worker.template.js', import.meta.url), 'utf8');
writeFileSync(new URL('./worker/worker.js', import.meta.url), tpl.replace('__PAGE__', () => JSON.stringify(page)));
console.log('worker/worker.js written (' + page.length + ' bytes of page)');
