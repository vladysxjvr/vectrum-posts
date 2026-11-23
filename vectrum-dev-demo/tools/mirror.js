// Copies the live dev.vectrumspace.eu into ../site: every page from sitemap.txt plus the files they reference.
// Run: node tools/mirror.js
const fs = require('fs'), path = require('path');
const ORIGIN = 'https://dev.vectrumspace.eu';
const OUT = path.join(__dirname, '..', 'site');
const seen = new Set();

function save(rel, buf) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, buf);
}
// a page /en/ is stored as en/index.html; any other file keeps its path (query dropped)
function local(u) {
  const p = decodeURIComponent(new URL(u).pathname);
  return p.endsWith('/') ? p + 'index.html' : p;
}
async function get(u) {
  const r = await fetch(u);
  if (!r.ok) { console.warn(r.status, u); return null; }
  return Buffer.from(await r.arrayBuffer());
}
// same-origin references in html/css/js: src, href, url(), srcset, and quoted '/dev-assets/...' strings
function refs(text, base) {
  const out = [];
  const re = /(?:src|href|content)=["']([^"']+)["']|url\(\s*["']?([^"')]+)["']?\s*\)|srcset=["']([^"']+)["']|["'](\/(?:dev-assets|api\/public\/dev)\/[^"'\s]+)["']/g;
  let m;
  while ((m = re.exec(text))) {
    const vals = m[3] ? m[3].split(',').map(s => s.trim().split(/\s+/)[0]) : [m[1] || m[2] || m[4]];
    for (const v of vals) {
      // meta content="..." is a URL only when it looks like one (og:image)
      if (m[0].startsWith('content') && !/^(https?:|\/)/.test(v)) continue;
      if (!v || v.startsWith('data:') || v.startsWith('#') || v.startsWith('mailto:') || v.startsWith('tel:')) continue;
      try { const u = new URL(v, base); if (u.origin === ORIGIN) { u.hash = ''; out.push(u.href); } } catch {}
    }
  }
  return out;
}
async function grab(u, isPage) {
  const key = u.split('?')[0];
  if (seen.has(key)) return; seen.add(key);
  const buf = await get(u); if (!buf) return;
  const rel = local(u);
  save(rel, buf);
  const ext = path.extname(rel);
  if (isPage || ['.html', '.css', '.js'].includes(ext)) {
    for (const r of refs(buf.toString('utf8'), u)) {
      const p = new URL(r).pathname;
      // pages are taken only from the sitemap; other same-origin links are files
      if (p.endsWith('/') || p === '') continue;
      await grab(r, false);
    }
  }
}

(async () => {
  const list = (await (await fetch(ORIGIN + '/sitemap.txt')).text()).split(/\s+/).filter(Boolean);
  for (const u of list) await grab(u, true);
  console.log('saved', seen.size, 'files into', OUT);
})();
