// Serves the mirror of dev.vectrumspace.eu from ./site (made by tools/mirror.js) with the CTA/funnel prototype on top. No dependencies.
// The prototype lives in ./demo: v2.js runs right before the site's main.js (so the site's own i18n renders the new texts),
// v2.css is added to every page. Small fixes to the site's own scripts are applied here, see PATCHES.
// The form never reaches the real API: POST /api/public/dev/leads answers 200 and stores nothing.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, 'site'), DEMO = path.join(__dirname, 'demo');
const PORT = +process.env.PORT || 10000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
};
// fixes the developer should carry over to the live site; each one is a plain text replacement
const PATCHES = {
  // old iOS Safari (< 15.4) has no crypto.randomUUID: main.js stopped there and the form never worked
  '/dev-assets/main.js': [
    ['requestId.value = crypto.randomUUID();', 'function uuid(){ if(window.crypto && crypto.randomUUID) return crypto.randomUUID(); return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function(c){ return (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> c / 4).toString(16); }); }\nrequestId.value = uuid();'],
    ['requestId.value=crypto.randomUUID();', 'requestId.value=uuid();'],
    // phone is optional: name + email are enough to reply
    ["ok = setErr('f-phone', ph.length >= 7 && ph.length <= 15 ? null : 'req') && ok;", "ok = setErr('f-phone', !ph || (ph.length >= 7 && ph.length <= 15) ? null : 'badPhone') && ok;"],
  ],
  // a copy on another address must not load Google Ads; the consent panel itself stays (restyled in v2.css)
  '/dev-assets/conversions.js': [['document.head.appendChild(script);', '/* demo copy: Google Ads is not loaded */']],
};

function send(res, code, body, type, cache = 'no-cache') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': cache, 'X-Robots-Tag': 'noindex, nofollow' }); res.end(body);
}
function file(res, base, rel) {
  const f = path.join(base, rel);
  if (!f.startsWith(base)) return send(res, 403, 'forbidden', 'text/plain');
  fs.readFile(f, (err, buf) => {
    if (err) return send(res, 404, 'not found', 'text/plain');
    const type = TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream';
    if (base === ROOT && PATCHES[rel]) {
      let t = buf.toString('utf8');
      for (const [a, b] of PATCHES[rel]) t = t.split(a).join(b);
      return send(res, 200, t, type);
    }
    // the prototype changes while we work on it: never cached; site files for 5 minutes
    send(res, 200, buf, type, base === DEMO ? 'no-cache' : 'public, max-age=300');
  });
}
function page(res, rel) {
  fs.readFile(path.join(ROOT, rel), 'utf8', (e, html) => {
    if (e) return send(res, 404, 'not found', 'text/plain');
    html = html
      .replace('<meta name="robots" content="index,follow,max-image-preview:large">', '<meta name="robots" content="noindex,nofollow">')
      .replace('</head>', '<link rel="stylesheet" href="/__demo/v2.css"></head>')
      .replace(/<script src="\/dev-assets\/main\.js/, '<script src="/__demo/v2.js"></script><script src="/dev-assets/main.js');
    send(res, 200, html, TYPES['.html']);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x'), p = decodeURIComponent(url.pathname);
  if (req.method === 'POST' && p === '/api/public/dev/leads') {
    req.resume();
    return req.on('end', () => send(res, 200, JSON.stringify({ ok: true, demo: 'nothing was sent' }), TYPES['.json']));
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'demo copy', 'text/plain');
  if (p === '/robots.txt') return send(res, 200, 'User-agent: *\nDisallow: /\n', TYPES['.txt']);
  if (p === '/' || p === '') { res.writeHead(302, { Location: '/en/' }); return res.end(); }
  if (p.startsWith('/__demo/')) return file(res, DEMO, p.slice(8));
  if (p.endsWith('/')) return page(res, p + 'index.html');
  if (!path.extname(p) && fs.existsSync(path.join(ROOT, p, 'index.html'))) { res.writeHead(301, { Location: p + '/' }); return res.end(); }
  file(res, ROOT, p);
}).listen(PORT, () => console.log('vectrum-dev-demo on :' + PORT));
