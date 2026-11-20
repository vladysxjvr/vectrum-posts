/* Stars behind "capabilities" -> "banner" on the home page, replacing the LandingParticles layer:
   a twinkling sky of small blue stars (each fades in and out on its own rhythm) and, now and then,
   a falling star with a blue tail flying up-right like the old particles (-10°).
   One viewport-sized canvas, sticky inside a wrapper that spans the sections, so memory stays small
   on a 5000px page; stars are in page coordinates and only the visible ones are drawn.
   Mounted into the existing particles layer after React hydration; its own particles are hidden by CSS. */
(function () {
  const COLORS = [[96, 165, 250], [111, 127, 255], [77, 118, 247]]; // statusBlueText, markerTone, accentMain
  const DENSITY = 230 / (1080 * 1080), BIG = 0.1, ALPHA = 0.75, EDGE = 220;
  const METEOR = { every: [3.5, 7], flight: 1.4, travel: 520, tail: 130, angle: -10.08, alpha: 0.7 };
  const MAX_DPR = 2, TAU = Math.PI * 2;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
  // seeded random: the sky is the same on every visit and every resize
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  let wrap, cv, ctx, layer, W = 0, VH = 0, regionTop = 0, regionH = 0, dpr = 1, stars = [], meteors = [], nextMeteor = 2;
  let visible = false, raf = 0, retry = 0, last = 0, t0 = performance.now();

  function region() {
    // home page only (QA #1): /pricing has the same pricing -> banner sections but should look like About and Contact
    // v2: the sky starts at the before / after section (demo/v2.js) when it is there, and covers the /how-it-works page
    const main = layer.parentElement, how = main.querySelector('[data-vs2="how"]');
    const first = how || main.querySelector('[data-vs2="ba"]') || main.querySelector('section[class*="__capabilities"]');
    const lastSec = how || main.querySelector('section[class*="__banner"]') || main.querySelector('section[class*="__faq"]');
    if (!first || !lastSec) return null;
    const m = main.getBoundingClientRect(), a = first.getBoundingClientRect(), b = lastSec.getBoundingClientRect();
    return { top: a.top - m.top, h: b.bottom - a.top };
  }
  function layout() {
    // other pages share the same particles layer after client-side navigation: no sky there
    const r = region(); wrap.style.display = r ? '' : 'none'; if (!r) return false;
    regionTop = r.top; regionH = r.h;
    wrap.style.top = regionTop + 'px'; wrap.style.height = regionH + 'px';
    dpr = Math.min(MAX_DPR, devicePixelRatio || 1); W = wrap.clientWidth; VH = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(VH * dpr); cv.style.height = VH + 'px';
    const phone = W < 800, rand = rng(0x5EED + Math.round(W / 50));
    const n = Math.round(W * regionH * DENSITY * (phone ? 0.6 : 1));
    stars = [];
    for (let i = 0; i < n; i++) {
      const big = rand() < BIG;
      stars.push({
        x: rand() * W, y: rand() * regionH, big, r: big ? 1.5 + rand() * 0.8 : 0.6 + rand() * 0.9,
        c: COLORS[Math.floor(rand() * COLORS.length)], period: 3 + rand() * 6, ph: rand(),
        sharp: 1.5 + rand() * 2.5, base: rand() < 0.25 ? 0.25 : 0,
      });
    }
    stars.sort((a, b) => a.y - b.y); // so the visible slice is found by binary search
    return true;
  }
  const lowerBound = y => { let lo = 0, hi = stars.length; while (lo < hi) { const m = (lo + hi) >> 1; if (stars[m].y < y) lo = m + 1; else hi = m; } return lo; };

  function glow(x, y, rad, c, a) {
    if (a <= 0.005) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(0.45, rgba(c, a * 0.35)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }

  function frame(now) {
    raf = 0; if (!cv.isConnected) return;
    if (Math.abs(wrap.clientWidth - W) > 1 || Math.abs(innerHeight - VH) > 1) layout();
    const t = reduced.matches ? 4 : (now - t0) / 1000, dt = Math.min(0.1, t - last); last = t;
    // where the sticky canvas is: its top in region coordinates
    const off = clamp(-wrap.getBoundingClientRect().top, 0, Math.max(0, regionH - VH));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, VH);
    // soft fade at the top and bottom of the region, so the sky starts and ends without a line
    const edgeA = y => smooth(0, EDGE, y) * smooth(0, EDGE, regionH - y);
    for (let i = lowerBound(off - 10); i < stars.length && stars[i].y < off + VH + 10; i++) {
      const s = stars[i], tw = Math.pow(0.5 + 0.5 * Math.sin(TAU * (t / s.period + s.ph)), s.sharp);
      const a = ALPHA * (s.base + (1 - s.base) * tw) * edgeA(s.y); if (a < 0.01) continue;
      const x = s.x, y = s.y - off;
      if (s.big) {
        glow(x, y, 10 * s.r, s.c, a * 0.3);
        const L = s.r * 3 * (0.6 + 0.4 * tw); ctx.lineWidth = 0.8;
        for (const [ux, uy] of [[1, 0], [0, 1]]) {
          const g = ctx.createLinearGradient(x - ux * L, y - uy * L, x + ux * L, y + uy * L);
          g.addColorStop(0, rgba(s.c, 0)); g.addColorStop(0.5, rgba(s.c, a * 0.45)); g.addColorStop(1, rgba(s.c, 0));
          ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(x - ux * L, y - uy * L); ctx.lineTo(x + ux * L, y + uy * L); ctx.stroke();
        }
      }
      ctx.fillStyle = rgba(s.c, a); ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
    }
    // falling stars: one every few seconds somewhere in the visible part, flying up-right
    if (!reduced.matches) {
      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        nextMeteor = METEOR.every[0] + Math.random() * (METEOR.every[1] - METEOR.every[0]);
        meteors.push({ x: W * (0.05 + Math.random() * 0.6), y: off + VH * (0.3 + Math.random() * 0.6), born: t, k: 0.85 + Math.random() * 0.3 });
      }
      const ang = METEOR.angle * Math.PI / 180, dx = Math.cos(ang), dy = Math.sin(ang);
      meteors = meteors.filter(m => t - m.born < METEOR.flight);
      for (const m of meteors) {
        const u = (t - m.born) / METEOR.flight, d = ease(u) * METEOR.travel;
        const x = m.x + dx * d, y = m.y + dy * d - off;
        const op = smooth(0, 0.09, u) * (1 - smooth(0.9, 1, u)) * METEOR.alpha * m.k * edgeA(m.y);
        const tail = METEOR.tail * Math.sin(Math.PI * Math.min(1, u * 1.15)) ;
        glow(x, y, 14, COLORS[2], op * 0.35);
        if (tail > 1) {
          const g = ctx.createLinearGradient(x, y, x - dx * tail, y - dy * tail);
          g.addColorStop(0, rgba(COLORS[2], op)); g.addColorStop(1, rgba(COLORS[2], 0));
          ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx * tail, y - dy * tail); ctx.stroke();
        }
        ctx.fillStyle = rgba(COLORS[0], op); ctx.beginPath(); ctx.arc(x, y, 2.2 * m.k, 0, TAU); ctx.fill();
      }
    }
    if (!reduced.matches && visible) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf && cv && cv.isConnected) raf = requestAnimationFrame(frame); };
  // for checking frames when the page does not animate (hidden tab)
  window.__vsStarsAt = sec => { t0 = performance.now() - sec * 1000; last = sec; layout(); frame(performance.now()); };

  function mount() {
    const l = document.querySelector('main > [class*="LandingParticles-module"][class*="__layer"]');
    if (!l || !Object.keys(l).some(k => k.startsWith('__reactFiber'))) { // wait for hydration (#418 otherwise)
      if (l && !retry) retry = setTimeout(() => { retry = 0; mount(); }, 100);
      return;
    }
    layer = l;
    if (!wrap) {
      wrap = document.createElement('div'); wrap.className = 'vs-stars'; wrap.setAttribute('aria-hidden', 'true');
      cv = document.createElement('canvas'); ctx = cv.getContext('2d'); wrap.appendChild(cv);
      new ResizeObserver(() => { if (wrap.isConnected && layout()) kick(); }).observe(document.body);
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(wrap);
      addEventListener('scroll', kick, { passive: true });
      reduced.addEventListener('change', kick);
    }
    if (wrap.parentElement !== layer) { layer.appendChild(wrap); if (layout()) kick(); return; }
    // same layer, maybe another page (client-side navigation): re-measure when the sections moved or vanished
    const r = region();
    if (!r || Math.abs(r.top - regionTop) > 1 || Math.abs(r.h - regionH) > 1) { if (layout()) kick(); }
  }
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  mount();
})();
