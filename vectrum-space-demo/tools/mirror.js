#!/usr/bin/env node
// Mirrors the live www.vectrumspace.eu into ../site so server.js can serve it as is.
// Pages, their RSC payloads (client-side navigation), every asset referenced from HTML/CSS/JS,
// and the landing texts API in every language. Run: node tools/mirror.js
const fs = require('fs'), path = require('path');
const ORIGIN = 'https://www.vectrumspace.eu';
const OUT = path.resolve(__dirname, '..', 'site');
const PAGES = ['/', '/about', '/pricing', '/contact'];
const LANGS = ['ru', 'en', 'pl', 'de', 'uk'];

const seen = new Set(), queue = [];
const add = u => {
  if (!u || u.startsWith('data:')) return;
  let url; try { url = new URL(u, ORIGIN); } catch { return; }
  if (url.origin !== new URL(ORIGIN).origin && url.host !== 'vectrumspace.eu') return;
  if (url.pathname.startsWith('/_next/image')) { add(url.searchParams.get('url')); return; } // served from the original by server.js
  if (url.pathname.startsWith('/api/')) return;
  const key = url.pathname; if (seen.has(key) || PAGES.includes(key)) return;
  seen.add(key); queue.push(key);
};
const save = (rel, buf) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, buf); };
const scan = (text, base) => {
  for (const m of text.matchAll(/(?:src|href|content)="([^"]+)"/g)) add(new URL(m[1].replace(/&amp;/g, '&'), base).href);
  for (const m of text.matchAll(/srcSet="([^"]+)"/gi)) for (const part of m[1].split(',')) add(new URL(part.trim().split(' ')[0].replace(/&amp;/g, '&'), base).href);
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(new URL(m[1], base).href);
  for (const m of text.matchAll(/["'`(](\/?(?:_next\/static|assets|brand|fonts|images|img|icons)\/[A-Za-z0-9_\-./%]+\.[a-z0-9]{2,5})/g)) add(new URL(m[1].startsWith('/') ? m[1] : (m[1].startsWith('_next') ? '/' + m[1] : m[1]), base).href);
  for (const m of text.matchAll(/["'`](static\/(?:chunks|media|css)\/[A-Za-z0-9_\-./%~]+\.[a-z0-9]{2,5})/g)) add(ORIGIN + '/_next/' + m[1]);
};

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const manifest = { pages: {}, api: {}, fetchedAt: new Date().toISOString(), origin: ORIGIN };
  for (const p of PAGES) {
    const name = p === '/' ? 'index' : p.slice(1);
    const html = await (await fetch(ORIGIN + p)).text();
    save(`__pages/${name}.html`, html); scan(html, ORIGIN + p);
    const rsc = await fetch(ORIGIN + p, { headers: { RSC: '1' } });
    const rtext = await rsc.text(); save(`__pages/${name}.rsc`, rtext); scan(rtext, ORIGIN + p);
    manifest.pages[p] = { html: `__pages/${name}.html`, rsc: `__pages/${name}.rsc`, rscType: rsc.headers.get('content-type') };
    console.log('page', p, html.length, 'rsc', rtext.length);
  }
  for (const l of LANGS) {
    const r = await fetch(`${ORIGIN}/api/public/landing?language=${l}`);
    if (!r.ok) { console.log('api', l, r.status); continue; }
    const t = await r.text(); save(`__api/landing-${l}.json`, t); scan(t, ORIGIN); manifest.api[l] = `__api/landing-${l}.json`;
    console.log('api', l, t.length);
  }
  let n = 0, bytes = 0, missing = [];
  while (queue.length) {
    const key = queue.shift(), r = await fetch(ORIGIN + key);
    if (!r.ok) { missing.push(`${r.status} ${key}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer()); save(key, buf); n++; bytes += buf.length;
    if (/\.(css|js|json|webmanifest|svg|txt)$/.test(key)) scan(buf.toString('utf8'), ORIGIN + key);
  }
  manifest.missing = missing;
  save('__manifest.json', JSON.stringify(manifest, null, 2));
  console.log('assets', n, (bytes / 1e6).toFixed(2) + ' MB', 'missing', missing.length);
  missing.forEach(m => console.log('  ', m));
})();
