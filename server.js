const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT       = process.env.PORT || 8080;
const DATA_DIR   = process.env.DATA_DIR || path.join(__dirname, 'data');
const HIST_FILE  = path.join(DATA_DIR, 'history.json');
const TARGET_URL = 'https://voidsector.net/__health';
const CHECK_MS   = 60_000;
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

// ── Persistence ──────────────────────────────────────────────
function loadData() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(HIST_FILE)) {
      const raw = JSON.parse(fs.readFileSync(HIST_FILE, 'utf8'));
      return {
        checks:    Array.isArray(raw.checks)    ? raw.checks    : [],
        incidents: Array.isArray(raw.incidents) ? raw.incidents : [],
      };
    }
  } catch {}
  return { checks: [], incidents: [] };
}

function saveData() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(HIST_FILE, JSON.stringify(state), 'utf8');
  } catch (e) {
    console.error('saveData error:', e.message);
  }
}

function pruneOld() {
  const cutoff = Date.now() - MAX_AGE_MS;
  state.checks    = state.checks.filter(c => c.ts >= cutoff);
  state.incidents = state.incidents.filter(i => i.end >= cutoff);
}

const state = loadData();
let current = { up: null, ms: null, ts: null };
let _downStart = null;

// restore ongoing incident if last check was down
const last = state.checks[state.checks.length - 1];
if (last && !last.up) _downStart = last.ts;

// ── Ping ─────────────────────────────────────────────────────
function ping() {
  const start = Date.now();
  const req = https.get(TARGET_URL, { timeout: 8000 }, res => {
    const ms = Date.now() - start;
    const up = res.statusCode >= 200 && res.statusCode < 400;
    res.resume();
    record(up, ms);
  });
  req.on('error', () => record(false, null));
  req.on('timeout', () => { req.destroy(); record(false, null); });
}

function record(up, ms) {
  const ts = Date.now();
  current = { up, ms, ts };
  state.checks.push({ ts, up, ms });

  if (!up && _downStart === null) {
    _downStart = ts;
  } else if (up && _downStart !== null) {
    state.incidents.push({ start: _downStart, end: ts });
    _downStart = null;
  }

  pruneOld();
  saveData();
  console.log(`[${new Date().toISOString()}] ${up ? 'UP' : 'DOWN'} ${ms != null ? ms + 'ms' : 'timeout'}`);
}

ping();
setInterval(ping, CHECK_MS);

// ── HTTP server ───────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.ico':  'image/x-icon',
};

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.url === '/api/status') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ current, checks: state.checks, incidents: state.incidents }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/clear') {
    const secret = process.env.CLEAR_SECRET;
    if (!secret || req.headers['x-clear-secret'] !== secret) {
      res.writeHead(403); res.end(JSON.stringify({ ok: false, error: 'forbidden' })); return;
    }
    state.checks    = [];
    state.incidents = [];
    current         = { up: null, ms: null, ts: null };
    _downStart      = null;
    saveData();
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  // static files
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // fallback to index.html
      fs.readFile(path.join(__dirname, 'index.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(d2);
      });
      return;
    }
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, () => console.log(`Status server running on port ${PORT}`));
