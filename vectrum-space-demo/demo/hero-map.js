/* Vectrum Space hero background: dot map of Europe, cities light up one after another,
   thin arcs join them and lights run along the routes. Endless, no dependencies.
   Mounts a <canvas class="vs-hero-map"> into the hero backdrop and keeps it there across
   React re-renders. Dots: window.EUROPE_DOTS (Natural Earth, Mercator, Kraków at AT in a 1080 square). */
(function () {
  const AT = [690, 700], CENTER = [19.94, 50.06], PX_PER_DEG = 19.6;
  const COLOR = { dot: [100, 124, 200], accent: [77, 118, 247], light: [96, 165, 250], label: [180, 188, 207] };
  const CITIES = {
    Kraków: [19.94, 50.06], Warszawa: [21.01, 52.23], Berlin: [13.40, 52.52], Praha: [14.42, 50.08], Wien: [16.37, 48.21],
    Budapest: [19.04, 47.50], München: [11.58, 48.14], Hamburg: [9.99, 53.55], Amsterdam: [4.90, 52.37], Paris: [2.35, 48.86],
    London: [-0.13, 51.51], Milano: [9.19, 45.46], København: [12.57, 55.68], Vilnius: [25.28, 54.69], Gdańsk: [18.65, 54.35],
    Wrocław: [17.04, 51.11], Bruxelles: [4.35, 50.85], Lyon: [4.84, 45.76], Zürich: [8.54, 47.37], Bucureşti: [26.10, 44.43],
    Riga: [24.11, 56.95], Frankfurt: [8.68, 50.11], Lviv: [24.03, 49.84], Beograd: [20.46, 44.79], Stockholm: [18.07, 59.33],
  };
  // the order routes appear in; only pairs fully on screen are used
  const ROUTES = [
    ['Kraków', 'Berlin'], ['Berlin', 'Amsterdam'], ['Kraków', 'Wien'], ['Wien', 'Milano'], ['Warszawa', 'Vilnius'],
    ['Amsterdam', 'London'], ['Kraków', 'Budapest'], ['Berlin', 'København'], ['Paris', 'Lyon'], ['Warszawa', 'Gdańsk'],
    ['München', 'Zürich'], ['Budapest', 'Bucureşti'], ['Frankfurt', 'Paris'], ['Praha', 'München'], ['Vilnius', 'Riga'],
    ['Kraków', 'Lviv'], ['Hamburg', 'Frankfurt'], ['Wrocław', 'Praha'], ['Bruxelles', 'Paris'], ['Budapest', 'Beograd'],
    ['København', 'Stockholm'], ['Kraków', 'Warszawa'], ['Lyon', 'Milano'], ['Berlin', 'Wrocław'],
  ];
  const T = { mapIn: 1.8, every: 2.4, popB: 0.45, draw: [0.8, 2.3], keep: 6, fade: 1.6, lightEvery: [3.5, 6], lightDur: 2.2 };
  const MAX_DPR = 2;

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a).toFixed(3)})`;
  const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  let cv, ctx, W = 0, H = 0, dpr = 1, S = 1, OX = 0, OY = 0, dotLayer, dots = [], pts = {}, pairs = [];
  let t0 = performance.now(), visible = true, raf = 0, retry = 0, lights = new Map(), zone;
  // 0 in the middle of the text block, 1 outside it (soft edge)
  const calmAt = (x, y) => smooth(0.75, 1.1, Math.hypot((x - zone.cx) / zone.rx, (y - zone.cy) / zone.ry));

  function layout() {
    const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
    dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1); W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    // cover the box: Kraków at ~58% / 56%, the square wide enough on desktop, tall enough on phones
    const cx = W * 0.58, cy = H * 0.56;
    S = Math.max(1.12 * W / 1080, 0.5 * H / 380 * 1.1, 0.9);
    OX = cx - AT[0] * S; OY = cy - AT[1] * S;
    const k = PX_PER_DEG * 180 / Math.PI;
    const proj = ([lon, lat]) => [OX + (AT[0] + (lon - CENTER[0]) * PX_PER_DEG) * S, OY + (AT[1] - (merc(lat) - merc(CENTER[1])) * k) * S];
    pts = {}; for (const c in CITIES) pts[c] = proj(CITIES[c]);
    // a city counts only if it is on screen and not under the opaque platform card
    const box0 = cv.getBoundingClientRect(), card = document.querySelector('section[class*="__hero"] > [class*="__network"]')?.getBoundingClientRect();
    const covered = ([x, y]) => card && card.width && x > card.left - box0.left - 14 && x < card.right - box0.left + 14 && y > card.top - box0.top - 14 && y < card.bottom - box0.top + 14;
    const inside = p => p[0] > W * 0.04 && p[0] < W * 0.96 && p[1] > H * 0.1 && p[1] < H * 0.95 && !covered(p);
    const list = ROUTES.filter(([a, b]) => inside(pts[a]) && inside(pts[b]));
    // too few on this screen: join every visible city with its two nearest visible neighbours
    if (list.length < 8) {
      const vis = Object.keys(pts).filter(c => inside(pts[c])), key = (a, b) => [a, b].sort().join('|'), have = new Set(list.map(([a, b]) => key(a, b)));
      for (const a of vis) vis.filter(b => b !== a).sort((b, c) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]) - Math.hypot(pts[a][0] - pts[c][0], pts[a][1] - pts[c][1]))
        .slice(0, 2).forEach(b => { if (!have.has(key(a, b))) { have.add(key(a, b)); list.push([a, b]); } });
    }
    pairs = list.map(([a, b]) => {
      const A = pts[a], B = pts[b], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
      let nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len; if (ny > 0) { nx = -nx; ny = -ny; } // bow upwards
      return { a, b, A, B, C: [(A[0] + B[0]) / 2 + nx * len * 0.16, (A[1] + B[1]) / 2 + ny * len * 0.16] };
    });
    // calm zone: the headline, lead and buttons (measured), everything behind them is dimmed
    const box = cv.getBoundingClientRect(), text = [...document.querySelectorAll('section[class*="__hero"] > h1, section[class*="__hero"] > [class*="__heroLead"]')]
      .map(e => e.getBoundingClientRect()).filter(r => r.width && r.height);
    if (text.length) {
      const x0 = Math.min(...text.map(r => r.left)) - box.left, x1 = Math.max(...text.map(r => r.right)) - box.left;
      const y0 = Math.min(...text.map(r => r.top)) - box.top, y1 = Math.max(...text.map(r => r.bottom)) - box.top;
      zone = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, rx: (x1 - x0) / 2 + 20, ry: (y1 - y0) / 2 + 30 };
    } else zone = { cx: W / 2, cy: H * 0.36, rx: W * 0.32, ry: H * 0.26 };
    const R = Math.max(1, 1.15 * Math.min(S, 1.6));
    dots = [];
    for (const [x0, y0, coast] of window.EUROPE_DOTS || []) {
      const x = OX + x0 * S, y = OY + y0 * S; if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue;
      const calm = 0.55 + 0.45 * calmAt(x, y);
      dots.push({ x, y, r: R, a: (0.27 + 0.18 * coast) * calm, d: Math.hypot(x - pts['Kraków'][0], y - pts['Kraków'][1]) });
    }
    const far = Math.max(1, ...dots.map(o => o.d)); dots.forEach(o => o.d /= far);
    dotLayer = document.createElement('canvas'); dotLayer.width = cv.width; dotLayer.height = cv.height;
    const g = dotLayer.getContext('2d'); g.scale(dpr, dpr);
    for (const o of dots) { g.fillStyle = rgba(COLOR.dot, o.a); g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.2832); g.fill(); }
    return true;
  }

  const qb = (r, t) => { const u = 1 - t; return [u * u * r.A[0] + 2 * u * t * r.C[0] + t * t * r.B[0], u * u * r.A[1] + 2 * u * t * r.C[1] + t * t * r.B[1]]; };
  function glow(x, y, rad, c, a) {
    if (a <= 0.005) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, rgba(c, a)); g.addColorStop(0.45, rgba(c, a * 0.35)); g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g; ctx.fillRect(x - rad, y - rad, 2 * rad, 2 * rad);
  }
  function city(name, since, alpha, label) {
    const [x, y] = pts[name], calm = calmAt(x, y); alpha *= 0.5 + 0.5 * calm; label = label && calm > 0.8;
    const pop = since < 0 ? 0 : since < 0.35 ? smooth(0, 0.22, since) * (1 + 0.35 * Math.sin(Math.PI * since / 0.35)) : 1;
    if (pop <= 0 || alpha <= 0) return;
    if (since < 1.3) { const u = since / 1.3; ctx.strokeStyle = rgba(COLOR.accent, 0.6 * (1 - u) * alpha); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x, y, 5 + u * 34, 0, 6.2832); ctx.stroke(); }
    glow(x, y, 22, COLOR.accent, 0.4 * pop * alpha);
    ctx.fillStyle = rgba(COLOR.accent, alpha); ctx.beginPath(); ctx.arc(x, y, 4.2 * pop, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = rgba([12, 7, 23], 0.9 * alpha); ctx.lineWidth = 1.6; ctx.stroke();
    if (label) {
      const la = smooth(0.15, 0.7, since) * alpha * 0.6;
      ctx.font = '500 12px Inter, system-ui, sans-serif'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba(COLOR.label, la);
      ctx.fillText(name, x + 10, y - 9);
    }
  }

  function frame(now) {
    raf = 0; if (!cv.isConnected) return;
    // ResizeObserver can lag (hidden tab, emulated viewport): the size is also checked here
    if ((Math.abs(cv.clientWidth - W) > 1 || Math.abs(cv.clientHeight - H) > 1) && !layout() || !dotLayer) { raf = requestAnimationFrame(frame); return; }
    const t = reduced.matches ? T.mapIn + T.every * 4 : (now - t0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    // map: ripples in from Kraków, then a cached layer
    if (t >= T.mapIn) ctx.drawImage(dotLayer, 0, 0);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (t < T.mapIn) for (const o of dots) {
      const a = o.a * smooth(o.d * T.mapIn * 0.7, o.d * T.mapIn * 0.7 + T.mapIn * 0.3, t);
      if (a > 0.01) { ctx.fillStyle = rgba(COLOR.dot, a); ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, 6.2832); ctx.fill(); }
    }
    if (pairs.length) {
      // route i starts at T.mapIn + i * every; the last `keep` stay, older ones fade out
      const n = Math.floor((t - T.mapIn) / T.every); // index of the newest started route
      const live = [], shown = new Map();
      for (let i = Math.max(0, n - T.keep); i <= n; i++) {
        const start = T.mapIn + i * T.every, age = t - start; if (age < 0) continue;
        const r = pairs[i % pairs.length], fadeAt = T.every * T.keep;
        const alpha = 1 - smooth(fadeAt, fadeAt + T.fade, age);
        if (alpha <= 0) continue;
        live.push({ r, i, age, alpha });
        // a city shared by several routes pops once (the oldest route wins) and stays as bright as its brightest route
        for (const [c, s] of [[r.a, age], [r.b, age - T.popB]]) {
          const prev = shown.get(c);
          shown.set(c, prev ? { since: Math.max(prev.since, s), alpha: Math.max(prev.alpha, alpha) } : { since: s, alpha });
        }
      }
      for (const { r, i, age, alpha: a0 } of live) {
        const alpha = a0 * (0.55 + 0.45 * Math.min(calmAt(r.C[0], r.C[1]), calmAt((r.A[0] + r.B[0]) / 2, (r.A[1] + r.B[1]) / 2)));
        const u = clamp((age - T.draw[0]) / (T.draw[1] - T.draw[0])), e = ease(u);
        if (e <= 0) continue;
        ctx.strokeStyle = rgba(COLOR.accent, 0.75 * alpha); ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(r.A[0], r.A[1]); for (let k = 1; k <= 60; k++) { const q = qb(r, e * k / 60); ctx.lineTo(q[0], q[1]); } ctx.stroke();
        if (u < 1) { const h = qb(r, e); glow(h[0], h[1], 16, COLOR.light, 0.8 * alpha); continue; }
        // a light runs along the finished route now and then, back and forth
        let L = lights.get(i); if (!L) { L = { next: age + 0.6, dir: 1 }; lights.set(i, L); }
        if (age >= L.next + T.lightDur) { L.next = age + T.lightEvery[0] + Math.random() * (T.lightEvery[1] - T.lightEvery[0]); L.dir *= -1; }
        const lu = (age - L.next) / T.lightDur;
        if (lu > 0 && lu < 1) {
          const q = qb(r, L.dir > 0 ? ease(lu) : 1 - ease(lu)), f = Math.sin(Math.PI * lu) * alpha;
          glow(q[0], q[1], 14, COLOR.light, 0.75 * f);
          ctx.fillStyle = rgba(COLOR.light, f); ctx.beginPath(); ctx.arc(q[0], q[1], 2, 0, 6.2832); ctx.fill();
        }
      }
      for (const [c, s] of shown) city(c, s.since, s.alpha, W > 600);
      for (const k of lights.keys()) if (k < n - T.keep - 1) lights.delete(k);
    }
    if (!reduced.matches && visible) raf = requestAnimationFrame(frame);
  }
  // for checking frames when the page does not animate (hidden tab): render the state at `sec` seconds
  window.__vsHeroAt = sec => { t0 = performance.now() - sec * 1000; layout(); frame(performance.now()); };
  const kick = () => { if (!raf && cv && cv.isConnected) raf = requestAnimationFrame(frame); };

  function mount() {
    const box = document.querySelector('[class*="__heroBackdrop"]');
    // wait until React has hydrated the backdrop: an extra child before that is a hydration error (#418)
    if (!box || !Object.keys(box).some(k => k.startsWith('__reactFiber'))) {
      if (box && !retry) retry = setTimeout(() => { retry = 0; mount(); }, 100);
      return;
    }
    if (!cv) {
      cv = document.createElement('canvas'); cv.className = 'vs-hero-map'; cv.setAttribute('aria-hidden', 'true'); ctx = cv.getContext('2d');
      new ResizeObserver(() => { if (layout()) kick(); }).observe(cv);
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(cv);
      reduced.addEventListener('change', kick);
    }
    if (cv.parentElement !== box) { box.appendChild(cv); t0 = performance.now(); lights.clear(); if (layout()) kick(); }
  }
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true });
  mount();
})();
