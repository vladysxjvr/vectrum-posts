/* Seamless-loop template renderer (Canvas 2D), ported from vectrum-bg/src/engine.html.
   All motion = f(p), p = frame / frames. Randomness only from a seeded PRNG at setup.
   API: engine.setup(variantId, formatId) ; engine.draw(frameIndex, options) */
window.createEngine = function (cv) {
  const C = window.COMMON, TK = window.TOKENS;
  const TAU = Math.PI * 2, FRAMES = C.fps * C.seconds;
  const ctx = cv.getContext('2d', { alpha: false });
  let W = 1080, H = 1080, G = 1; // G scales glow sizes with the frame; 1 for the square original

  // ---------- helpers ----------
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hex(name) { const h = TK[name]; if (!h) throw new Error('unknown token ' + name); return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function rgba(name, a) { const [r, g, b] = hex(name); return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a)).toFixed(4)})`; }
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const fract = x => x - Math.floor(x);

  // CSS cubic-bezier
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = t => ((ax * t + bx) * t + cx) * t, sy = t => ((ay * t + by) * t + cy) * t;
    const dx = t => (3 * ax * t + 2 * bx) * t + cx;
    return x => { let t = x; for (let i = 0; i < 8; i++) { const e = sx(t) - x; const d = dx(t); if (Math.abs(e) < 1e-6 || !d) break; t -= e / d; } return sy(clamp(t)); };
  }
  const easeSine = bezier(.5, 0, .5, 1);
  const easeInOut = bezier(.42, 0, .58, 1);

  // 2D simplex noise (seeded). Loop noise = sample on a circle: n(ox + R cos 2πp, oy + R sin 2πp)
  function makeNoise(rand) {
    const perm = new Uint8Array(512), p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
    const g = [[1, 1], [-1, 1], [1, -1], [-1, -1], [1, 0], [-1, 0], [0, 1], [0, -1]];
    const F2 = .5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6;
    return (x, y) => {
      const s = (x + y) * F2, i = Math.floor(x + s), j = Math.floor(y + s), t = (i + j) * G2;
      const x0 = x - (i - t), y0 = y - (j - t); const i1 = x0 > y0 ? 1 : 0, j1 = 1 - i1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255; let n = 0;
      const c = (gx, gy, xx, yy) => { let tt = .5 - xx * xx - yy * yy; if (tt < 0) return 0; tt *= tt; const q = g[gx % 8]; return tt * tt * (q[0] * xx + q[1] * yy); };
      n += c(perm[ii + perm[jj]], 0, x0, y0); n += c(perm[ii + i1 + perm[jj + j1]], 0, x1, y1); n += c(perm[ii + 1 + perm[jj + 1]], 0, x2, y2);
      return 70 * n; // ~[-1,1]
    };
  }
  let noise2;
  const loopNoise = (p, ox, oy, R = 0.7) => noise2(ox + R * Math.cos(TAU * p), oy + R * Math.sin(TAU * p));

  // safe-zone mask: calm top ~55% and left side, activity bottom-right
  function mask(x, y) {
    const s = C.safe, xn = x / W, yn = y / H;
    const v = smooth(s.y0, s.y1, yn) * (0.55 + 0.45 * smooth(0.05, 0.8, xn)) + s.xBoost * smooth(0.6, 1.0, xn) * smooth(0.25, 0.6, yn);
    return s.floor + (1 - s.floor) * clamp(v);
  }

  // soft round glow (gaussian-like radial)
  function glow(x, y, r, color, a, comp = 'screen') {
    if (a <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    for (let i = 0; i <= 8; i++) { const t = i / 8; g.addColorStop(t, rgba(color, a * Math.exp(-4.2 * t * t) * (1 - t))); }
    ctx.save(); ctx.globalCompositeOperation = comp; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }

  const kfTrack = (u, keys) => { // piecewise keyframes [[u,v],...] with sine easing
    if (u <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (u <= keys[i][0]) { const [u0, v0] = keys[i - 1], [u1, v1] = keys[i]; return lerp(v0, v1, easeSine((u - u0) / (u1 - u0))); }
    return keys[keys.length - 1][1];
  };

  // ---------- background ----------
  function cssLinear(angleDeg, stops) {
    const a = angleDeg * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a);
    const len = Math.abs(W * dx) + Math.abs(H * dy);
    const g = ctx.createLinearGradient(W / 2 - dx * len / 2, H / 2 - dy * len / 2, W / 2 + dx * len / 2, H / 2 + dy * len / 2);
    stops.forEach(([o, c]) => g.addColorStop(o, TK[c]));
    return g;
  }
  function drawBrandBg() {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = cssLinear(116, [[.0956, T.page[0]], [.8604, T.page[1]]]);
    ctx.fillRect(0, 0, W, H);
  }
  function drawBgGlows(bg, p) {
    for (const gl of bg.glow || []) {
      const b = 1 + gl.breathe * Math.sin(TAU * p);
      glow(gl.x * W, gl.y * H, gl.r * G, gl.color, gl.a * b, T.glowComp);
    }
  }

  // user image / video: cover-fit, then zoom and pan (pan = -1..1 of the overflow)
  function coverSize(w, h, zoom) { const s = Math.max(W / w, H / h) * zoom; return { dw: w * s, dh: h * s }; }
  function drawUserBg(bg, o) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = TK[T.overlay]; ctx.fillRect(0, 0, W, H);
    if (bg.source) {
      const { dw, dh } = coverSize(bg.w, bg.h, o.zoom);
      ctx.drawImage(bg.source, (W - dw) / 2 + o.panX * (dw - W) / 2, (H - dh) / 2 + o.panY * (dh - H) / 2, dw, dh);
    }
    // darkening (lightening in the light theme): strongest on the side with the text, so it stays readable on any picture
    const [x0, x1] = o.textPos === 'bottom' ? [H, 0] : [0, H], ov = T.overlay;
    const g = ctx.createLinearGradient(0, x0, 0, x1);
    g.addColorStop(0, rgba(ov, o.dim)); g.addColorStop(0.65, rgba(ov, o.dim * 0.45)); g.addColorStop(1, rgba(ov, o.dim * 0.2));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // ---------- aurora ----------
  function drawAurora(cfg, p, ox = 11) {
    cfg.blobs.forEach((b, i) => {
      const a = TAU * (b.turns * p + b.phase);
      const x = b.cx * W + b.orbit * G * Math.cos(a), y = b.cy * H + b.orbit * G * 0.8 * Math.sin(a);
      const r = b.r * G * (1 + cfg.wobble * loopNoise(p, ox + i * 7.3, 3.1 + i * 2.2, 0.6));
      glow(x, y, r, b.color, b.a, T.glowComp);
    });
  }

  // ---------- stars: twinkling sky + falling stars ----------
  function pickColor(colors, r) { let acc = 0; for (const [c, w] of colors) { acc += w; if (r < acc) return c; } return colors[0][0]; }
  function setupStarfield(cfg, rand) {
    const count = Math.round(cfg.count * (W * H) / (1080 * 1080)), list = [];
    for (let i = 0; i < count; i++) {
      const big = rand() < cfg.big;
      list.push({
        x: rand() * W, y: rand() * H, big,
        r: big ? 1.6 + rand() * 0.9 : 0.55 + rand() * 0.9,
        color: pickColor(cfg.colors, rand()),
        n: 1 + Math.floor(rand() * 3),   // whole twinkles per loop -> seamless
        ph: rand(),
        sharp: 1.5 + rand() * 2.5,       // higher = longer dark pause, star disappears
        base: rand() < 0.25 ? 0.25 : 0,  // a few never go fully dark
      });
    }
    return list;
  }
  function drawStarfield(cfg, list, p) {
    for (const s of list) {
      const tw = Math.pow(0.5 + 0.5 * Math.sin(TAU * (s.n * p + s.ph)), s.sharp);
      const a = cfg.alpha * (s.base + (1 - s.base) * tw) * lerp(cfg.calm, 1, mask(s.x, s.y));
      if (a < 0.01) continue;
      if (s.big) {
        glow(s.x, s.y, 14 * s.r * G, s.color, a * 0.3, T.glowComp);
        const L = s.r * cfg.flare * (0.6 + 0.4 * tw);  // cross flare grows with brightness
        ctx.lineWidth = 0.8;
        for (const [ux, uy] of [[1, 0], [0, 1]]) {
          const g = ctx.createLinearGradient(s.x - ux * L, s.y - uy * L, s.x + ux * L, s.y + uy * L);
          g.addColorStop(0, rgba(s.color, 0)); g.addColorStop(0.5, rgba(s.color, a * cfg.flareAlpha)); g.addColorStop(1, rgba(s.color, 0));
          ctx.strokeStyle = g; ctx.beginPath(); ctx.moveTo(s.x - ux * L, s.y - uy * L); ctx.lineTo(s.x + ux * L, s.y + uy * L); ctx.stroke();
        }
      }
      ctx.fillStyle = rgba(s.color, a);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    }
  }
  function setupMeteors(cfg, rand) {
    const list = [];
    for (let i = 0; i < cfg.count; i++) list.push({
      start: (i + 0.15 + rand() * 0.7) / cfg.count, // stratified start in loop
      x: lerp(cfg.area.x0, cfg.area.x1, rand()) * W,
      y: lerp(cfg.area.y0, cfg.area.y1, rand()) * H,
      k: 0.85 + rand() * 0.3,
    });
    return list;
  }
  // after vectrum-bg 01-fallen-stars: ease-in-out flight, fade in/out ~9%, tail grows then shrinks
  function drawMeteors(cfg, list, p) {
    const T_ = C.seconds, ang = cfg.angleDeg * Math.PI / 180, dx = Math.cos(ang), dy = Math.sin(ang), S = cfg.scale;
    for (const s of list) {
      const local = fract(p - s.start) * T_; // wraps across the loop seam
      if (local >= cfg.flight) continue;
      const u = local / cfg.flight, d = easeInOut(u) * cfg.travel * G;
      const x = s.x + dx * d, y = s.y + dy * d;
      const op = kfTrack(u, [[0, 0], [0.09, 1], [0.905, 1], [1, 0]]) * cfg.opacity * s.k;
      const tail = kfTrack(u, [[0, 0], [0.27, 40], [0.55, 60], [0.82, 60], [1, 0]]) / 60 * cfg.tailMax * G;
      glow(x, y, 16 * S * s.k, cfg.glow, op * 0.3, T.glowComp);
      if (tail > 1) {
        ctx.save();
        ctx.filter = `blur(${(1.2 * S).toFixed(2)}px)`;
        const tx = x - dx * tail, ty = y - dy * tail, g = ctx.createLinearGradient(x, y, tx, ty);
        g.addColorStop(0, rgba(cfg.tail, op)); g.addColorStop(1, rgba(cfg.tail, 0));
        ctx.strokeStyle = g; ctx.lineWidth = 1.1 * S; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = rgba(cfg.core, op);
      ctx.beginPath(); ctx.arc(x, y, 1.5 * S * s.k, 0, TAU); ctx.fill();
    }
  }

  // ---------- route (prototype): dot map, two cities, a line between them ----------
  function setupRoute(cfg) {
    const P = cfg.place[H > W ? '9x16' : '1x1'], k = cfg.pxPerDeg * 180 / Math.PI, merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    const sq = ([x, y]) => [P.x + x * P.s, P.y + y * P.s]; // 1080 square -> frame
    const proj = ([lon, lat]) => sq([cfg.at[0] + (lon - cfg.center[0]) * cfg.pxPerDeg, cfg.at[1] - (merc(lat) - merc(cfg.center[1])) * k]);
    const cities = cfg.cities.map(c => ({ ...c, p: proj(c.ll) }));
    const [A, B] = cities.map(c => c.p), len = Math.hypot(B[0] - A[0], B[1] - A[1]);
    let nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len; if (ny > 0) { nx = -nx; ny = -ny; } // arc bows upwards
    const ctrl = [(A[0] + B[0]) / 2 + nx * len * cfg.bend, (A[1] + B[1]) / 2 + ny * len * cfg.bend];
    const dots = [];
    let far = 1;
    for (const [x0, y0, coast] of window.EUROPE_DOTS || []) {
      const [x, y] = sq([x0, y0]); if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const d = Math.hypot(x - A[0], y - A[1]); far = Math.max(far, d);
      const edge = smooth(P.y, P.y + 220 * P.s, y); // the dot square ends in a straight line at the top: fade it
      dots.push({ x, y, a: lerp(cfg.dot.alpha, cfg.dot.coastAlpha, coast) * edge, d });
    }
    dots.forEach(o => o.d /= far);
    return { cities, A, B, ctrl, dots, s: P.s };
  }
  const qbez = (A, Cc, B, t) => { const u = 1 - t; return [u * u * A[0] + 2 * u * t * Cc[0] + t * t * B[0], u * u * A[1] + 2 * u * t * Cc[1] + t * t * B[1]]; };
  function drawRoute(cfg, st, p) {
    const out = 1 - smooth(cfg.out[0], cfg.out[1], p), s = st.s;
    if (out <= 0) return;
    // map: dots ripple in from city A
    const [m0, m1] = cfg.mapIn, span = (m1 - m0) * 0.75;
    for (const o of st.dots) {
      const t0 = m0 + o.d * span, a = o.a * smooth(t0, t0 + (m1 - m0) * 0.25, p) * out;
      if (a < 0.01) continue;
      ctx.fillStyle = rgba(cfg.dot.color, a); ctx.beginPath(); ctx.arc(o.x, o.y, cfg.dot.r * s, 0, TAU); ctx.fill();
    }
    // line A -> B, drawn progressively, with a glowing head
    const lu = clamp((p - cfg.line[0]) / (cfg.line[1] - cfg.line[0])), e = easeInOut(lu);
    if (e > 0) {
      ctx.strokeStyle = rgba(cfg.lineColor, cfg.lineAlpha * out); ctx.lineWidth = cfg.lineW * s; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(st.A[0], st.A[1]);
      const N = 80; for (let i = 1; i <= N; i++) { const q = qbez(st.A, st.ctrl, st.B, e * i / N); ctx.lineTo(q[0], q[1]); }
      ctx.stroke();
      if (lu < 1) { const h = qbez(st.A, st.ctrl, st.B, e); glow(h[0], h[1], 22 * s, cfg.lineColor, 0.8 * out, T.glowComp); }
    }
    // a light runs along the finished line once
    const tu = (p - cfg.travel[0]) / (cfg.travel[1] - cfg.travel[0]);
    if (tu > 0 && tu < 1) {
      const h = qbez(st.A, st.ctrl, st.B, easeInOut(tu)), f = kfTrack(tu, [[0, 0], [0.15, 1], [0.85, 1], [1, 0]]) * out;
      glow(h[0], h[1], 26 * s, cfg.lineColor, 0.7 * f, T.glowComp);
      ctx.fillStyle = rgba(cfg.lineColor, f); ctx.beginPath(); ctx.arc(h[0], h[1], 2.6 * s, 0, TAU); ctx.fill();
    }
    // cities: pop in, a ring flies out, a soft breathing halo, label fades in
    for (const c of st.cities) {
      const u = (p - c.at) * C.seconds; if (u < 0) continue; // seconds since the city appeared
      const [x, y] = c.p, pop = kfTrack(clamp(u / 0.35), [[0, 0], [0.6, 1.35], [1, 1]]);
      const ru = clamp(u / 1.2);
      if (ru < 1) { ctx.strokeStyle = rgba(cfg.ring, 0.7 * (1 - ru) * out); ctx.lineWidth = 1.4 * s; ctx.beginPath(); ctx.arc(x, y, (cfg.pointR + ru * cfg.ringMax) * s, 0, TAU); ctx.stroke(); }
      glow(x, y, 34 * s, cfg.point, (0.35 + 0.1 * Math.sin(TAU * u / 2)) * pop * out, T.glowComp);
      ctx.fillStyle = rgba(cfg.point, out); ctx.beginPath(); ctx.arc(x, y, cfg.pointR * s * pop, 0, TAU); ctx.fill();
      ctx.strokeStyle = rgba(T.overlay, 0.9 * out); ctx.lineWidth = 2 * s; ctx.stroke();
      const la = smooth(0.15, 0.6, u) * out;
      if (la > 0) {
        ctx.font = `600 ${Math.round(cfg.labelSize * s)}px Raleway, Arial, sans-serif`; ctx.textBaseline = 'middle';
        ctx.textAlign = c.label === 'left' ? 'right' : 'left'; ctx.fillStyle = rgba(cfg.label, la);
        ctx.fillText(c.name, x + (c.label === 'left' ? -1 : 1) * (cfg.pointR + 12) * s, y);
        ctx.textAlign = 'left';
      }
    }
  }

  // ---------- network ----------
  function setupNetwork(cfg, rand) {
    const area = (W * H) / (1080 * 1080), count = Math.round(cfg.nodes * area), hubs = Math.round(cfg.hubs * area), pulseCount = Math.round(cfg.pulses * area);
    const nodes = [];
    while (nodes.length < count) {
      const x = -0.05 + rand() * 1.1, y = 0.2 + rand() * 0.88;
      const w = Math.pow(clamp(0.15 + 0.55 * y + 0.35 * x), cfg.bias);
      if (rand() < w) nodes.push({ bx: x * W, by: y * H, ox: rand() * 100, oy: rand() * 100, hub: false });
    }
    // hubs: nodes deepest in the bottom-right
    [...nodes].sort((a, b) => (b.bx + b.by) - (a.bx + a.by)).filter((_, i) => i % 3 === 1).slice(0, hubs).forEach(n => n.hub = true);
    // stable edges: shorter than 0.85*linkDist for the whole loop
    const pos = (n, p) => [n.bx + cfg.drift * loopNoise(p, n.ox, n.oy, 0.55), n.by + cfg.drift * loopNoise(p, n.oy + 50, n.ox + 50, 0.55)];
    const adj = nodes.map(() => []);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      let ok = true;
      for (let k = 0; k < 40 && ok; k++) { const a = pos(nodes[i], k / 40), b = pos(nodes[j], k / 40); if (Math.hypot(a[0] - b[0], a[1] - b[1]) > cfg.linkDist * 0.85) ok = false; }
      if (ok) { adj[i].push(j); adj[j].push(i); }
    }
    // pulses: random walks along stable edges starting from hubs, preferring the active zone
    const pulses = [];
    const starts = nodes.map((n, i) => i).filter(i => nodes[i].hub && adj[i].length);
    for (let k = 0; k < pulseCount; k++) {
      let cur = starts[k % starts.length], prev = -1; const path = [cur];
      for (let e = 0; e < cfg.pulseEdges; e++) {
        const opts = adj[cur].filter(j => j !== prev); if (!opts.length) break;
        const nxt = opts[Math.floor(rand() * opts.length)]; prev = cur; cur = nxt; path.push(cur);
      }
      pulses.push({ path, start: k / pulseCount + rand() * 0.1 });
    }
    return { nodes, pos, pulses };
  }
  function drawNetwork(cfg, st, p) {
    const P = st.nodes.map(n => st.pos(n, p));
    ctx.lineWidth = 1;
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) {
      const d = Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1]);
      if (d >= cfg.linkDist) continue;
      const a = cfg.lineAlpha * Math.pow(1 - d / cfg.linkDist, 1.4) * mask((P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2);
      ctx.strokeStyle = rgba(cfg.line, a);
      ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
    }
    // pulses
    const T = C.seconds;
    for (const pu of st.pulses) {
      const local = fract(p - pu.start) * T; if (local >= cfg.pulseSeconds) continue;
      const u = local / cfg.pulseSeconds, E = pu.path.length - 1, f = u * E, e = Math.min(E - 1, Math.floor(f)), t = easeSine(f - e);
      const A = P[pu.path[e]], B = P[pu.path[e + 1]];
      const x = lerp(A[0], B[0], t), y = lerp(A[1], B[1], t);
      const fade = kfTrack(u, [[0, 0], [0.12, 1], [0.88, 1], [1, 0]]) * cfg.pulseAlpha * (0.4 + 0.6 * mask(x, y));
      const g = ctx.createLinearGradient(A[0], A[1], x, y);
      g.addColorStop(0, rgba(cfg.pulseColor, 0)); g.addColorStop(1, rgba(cfg.pulseColor, fade * 0.7));
      ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(x, y); ctx.stroke();
      glow(x, y, 26, cfg.pulseColor, fade * 0.55, T.glowComp);
      ctx.fillStyle = rgba(cfg.pulseColor, fade); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill();
    }
    // nodes (network.png style: small dots, hubs = outlined circle on Spreadsheet fill)
    st.nodes.forEach((n, i) => {
      const [x, y] = P[i], m = mask(x, y);
      if (n.hub) {
        ctx.fillStyle = rgba(cfg.hubFill, cfg.hubAlpha * m * 1.4); ctx.strokeStyle = rgba(cfg.hubStroke, cfg.hubAlpha * m);
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 6.5, 0, TAU); ctx.fill(); ctx.stroke();
      } else {
        ctx.fillStyle = rgba(cfg.line, 0.75 * m); ctx.beginPath(); ctx.arc(x, y, 2.3, 0, TAU); ctx.fill();
      }
    });
  }

  // ---------- grain (seeded per frame index, frame N == frame N+FRAMES) ----------
  function applyGrain(frame, amp) {
    if (!amp) return;
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    const r = mulberry32(0x9E3779B1 ^ ((frame % FRAMES) * 2654435761));
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() + r() - 1) * amp * 1.7;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- main ----------
  // a variant with its `light` overrides applied, one level deep
  function themed(base, themeId) {
    const over = themeId === 'light' && base.light, v = { ...base };
    if (over) for (const k in over) v[k] = { ...base[k], ...over[k] };
    return v;
  }

  const mark = new Image(); mark.src = 'img/vectrum-mark.png';
  let V, F, T, state = {};
  return {
    FRAMES,
    get width() { return W; },
    get height() { return H; },
    mark,
    coverSize,
    setup(id, formatId, themeId = 'dark') {
      F = window.FORMATS[formatId]; T = window.THEMES[themeId];
      if (!window.VARIANTS[id] || !F || !T) throw new Error('no template ' + id + ' / ' + formatId + ' / ' + themeId);
      V = themed(window.VARIANTS[id], themeId);
      W = F.w; H = F.h; G = Math.sqrt(W * H) / 1080;
      cv.width = W; cv.height = H;
      let seed = 0; for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) | 0;
      const rand = mulberry32(seed ^ 0x5EED);
      noise2 = makeNoise(rand);
      state = {};
      if (V.network) state.network = setupNetwork(V.network, rand);
      if (V.starfield) state.starfield = setupStarfield(V.starfield, rand);
      if (V.meteors) state.meteors = setupMeteors(V.meteors, rand);
      if (V.route) state.route = setupRoute(V.route);
    },
    // o: { grain, bg, zoom, panX, panY, dim, anim, textPos, text, logo } ; returns text layout info
    draw(frame, o = {}) {
      const p = frame / FRAMES; // no modulo: p=1.0 must reproduce p=0 by construction
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.setLineDash([]);
      if (o.bg) drawUserBg(o.bg, o); else drawBrandBg();
      if (!o.bg || o.anim) {
        drawBgGlows(V.bg, p);
        if (V.aurora) drawAurora(V.aurora, p);
        if (V.network) drawNetwork(V.network, state.network, p);
        if (V.starfield) drawStarfield(V.starfield, state.starfield, p);
        if (V.meteors) drawMeteors(V.meteors, state.meteors, p);
        if (V.route) drawRoute(V.route, state.route, p);
      }
      ctx.globalCompositeOperation = 'source-over';
      if (o.grain) applyGrain(frame, C.grain);
      const logo = o.logo && window.LOGOS[o.logo] && window.LOGOS[o.logo].word ? window.LOGOS[o.logo] : null;
      if (logo) window.TextLayer.drawLogo(ctx, mark, F.logo, logo.word, TK[T.logoText]);
      if (!o.text) return null;
      let z = F.text;
      if (logo && o.text.pos === 'top') { // keep the headline clear of the logo
        const top = Math.max(z.top, F.logo.y + F.logo.h + F.logo.gap);
        z = { ...z, top, maxH: z.maxH - (top - z.top) };
      }
      return window.TextLayer.draw(ctx, { ...o.text, colors: { h1: TK[T.h1], h2: TK[T.h2] } }, z);
    },
  };
};
