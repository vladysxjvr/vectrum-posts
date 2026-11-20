// Serves the mirror of www.vectrumspace.eu from ./site (made by tools/mirror.js). No dependencies.
// What a plain static host can't do, done here:
//   /_next/image?url=X           -> the original file X (no resizing)
//   /api/public/landing?language -> the saved texts for that language
//   page with "RSC: 1" header    -> the saved RSC payload, so client-side navigation works
// Anything that would write (forms, other API calls) answers 503: this is a demo copy.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'site'), DEMO = path.join(__dirname, 'demo');
const M = JSON.parse(fs.readFileSync(path.join(ROOT, '__manifest.json'), 'utf8'));
const PORT = +process.env.PORT || 10000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.gif': 'image/gif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain; charset=utf-8',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
};
// demo additions (e.g. the new hero background) are injected into every page from ./demo/inject.html
// comments and whitespace between tags are dropped: stray text nodes in <head> break React hydration
const inject = () => { try { return fs.readFileSync(path.join(DEMO, 'inject.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim(); } catch { return ''; } };

// a copy of the live site on another address must stay out of search engines
function send(res, code, body, type, cache = 'no-cache') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': cache, 'X-Robots-Tag': 'noindex, nofollow' }); res.end(body);
}
function file(res, base, rel) {
  const f = path.join(base, rel);
  if (!f.startsWith(base)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(f, (err, buf) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    const immutable = rel.startsWith('/_next/static/') || rel.startsWith('_next/static/');
    // demo files change while we work on them: never cached
    const cache = base === DEMO ? 'no-cache' : immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300';
    send(res, 200, buf, TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', cache);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 503, JSON.stringify({ error: 'demo copy: sending is disabled' }), 'application/json');
  if (p === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /\n', TYPES['.txt']);
  if (p.startsWith('/__demo/')) return file(res, DEMO, p.slice(8));
  if (p === '/_next/image') return file(res, ROOT, url.searchParams.get('url') || '');
  if (p === '/api/public/landing') {
    const lang = url.searchParams.get('language'), rel = M.api[lang] || M.api.en;
    // demo/texts.json: text fixes per language laid over the saved texts; "plans": feature lists per plan id
    const key = M.api[lang] ? lang : 'en';
    let fix = {}, plans = {}; try { const all = JSON.parse(fs.readFileSync(path.join(DEMO, 'texts.json'), 'utf8')); fix = all[key] || {}; plans = (all.plans || {})[key] || (all.plans || {}).en || {}; } catch {}
    if (!Object.keys(fix).length && !Object.keys(plans).length) return file(res, ROOT, rel);
    return fs.readFile(path.join(ROOT, rel), 'utf8', (e, t) => {
      if (e) return send(res, 404, 'not found', 'text/plain');
      const j = JSON.parse(t); Object.assign(j.texts, fix);
      for (const p of j.plans || []) if (plans[p.id]) p.text.features = plans[p.id];
      send(res, 200, JSON.stringify(j), TYPES['.json'], 'no-cache');
    });
  }
  if (p.startsWith('/api/')) return send(res, 503, JSON.stringify({ error: 'demo copy' }), 'application/json');
  const page = M.pages[p.replace(/\/$/, '') || '/'];
  if (page) {
    if (req.headers.rsc === '1' || url.searchParams.has('_rsc')) {
      return fs.readFile(path.join(ROOT, page.rsc), (e, b) => e ? send(res, 404, '', 'text/plain') : send(res, 200, b, page.rscType || 'text/x-component', 'no-cache'));
    }
    return fs.readFile(path.join(ROOT, page.html), 'utf8', (e, html) => {
      if (e) return send(res, 500, 'missing page', 'text/plain');
      // into <head>: extra nodes in <body> break React hydration (error #418)
      send(res, 200, html.replace('</head>', inject() + '</head>'), TYPES['.html']);
    });
  }
  file(res, ROOT, p);
}).listen(PORT, () => console.log('vectrum-space-demo on :' + PORT));
