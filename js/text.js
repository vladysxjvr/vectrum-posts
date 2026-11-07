/* Headline layer: wraps H1 / H2 into the format's text zone and shrinks them until they fit.
   doc: { h1: { text, marks[] }, h2, line, pos: 'top' | 'bottom' } ; marks[i] = character i is accent blue. */
window.TextLayer = (function () {
  const TK = window.TOKENS;
  const MIN_SCALE = 0.55, MAX_H1_LINES = 4, H1_LEADING = 1.1, H2_LEADING = 1.4, LINE_W = 100, LINE_H = 6;
  let cacheKey = '', cache = null;

  function setFont(ctx, weight, size, spacing) {
    ctx.font = `${weight} ${size}px Raleway, Arial, sans-serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  }

  // returns lines [{ s, m[] }] and tooWide = a single word did not fit and had to be split
  function wrap(ctx, text, marks, maxW) {
    const lines = []; let tooWide = false, i = 0;
    for (const para of text.split('\n')) {
      let cur = '', curM = [];
      const push = () => { const s = cur.replace(/\s+$/, ''); lines.push({ s, m: curM.slice(0, s.length) }); cur = ''; curM = []; };
      for (const tok of para.match(/\s+|\S+/g) || []) {
        const m = marks ? marks.slice(i, i + tok.length) : [];
        i += tok.length;
        if (/^\s/.test(tok)) { if (cur) { cur += tok; curM.push(...m); } continue; }
        if (cur && ctx.measureText(cur + tok).width > maxW) push();
        if (ctx.measureText(tok).width <= maxW) { cur += tok; curM.push(...m); continue; }
        tooWide = true;
        for (let c = 0; c < tok.length; c++) {
          if (cur && ctx.measureText(cur + tok[c]).width > maxW) push();
          cur += tok[c]; curM.push(m[c]);
        }
      }
      push();
      i += 1; // the '\n'
    }
    while (lines.length && !lines[lines.length - 1].s) lines.pop();
    return { lines, tooWide };
  }

  function layout(ctx, doc, z) {
    let last;
    for (let scale = 1; scale >= MIN_SCALE - 1e-6; scale -= 0.03) {
      const s1 = Math.round(z.h1 * scale), s2 = Math.round(z.h2 * Math.max(scale, 0.75)), sp = -s1 / 76;
      setFont(ctx, 900, s1, sp);
      const a = wrap(ctx, doc.h1.text, doc.h1.marks, z.maxW);
      setFont(ctx, 500, s2, 0);
      const b = wrap(ctx, doc.h2, null, z.maxW);
      const hasRule = doc.line && a.lines.length > 0;
      const gap = Math.round(s1 * 0.32);
      let height = a.lines.length * s1 * H1_LEADING;
      if (hasRule) height += gap + LINE_H;
      if (b.lines.length) height += (a.lines.length ? gap : 0) + b.lines.length * s2 * H2_LEADING;
      last = { s1, s2, sp, gap, h1: a.lines, h2: b.lines, hasRule, height };
      last.overflow = a.tooWide || b.tooWide || a.lines.length > MAX_H1_LINES || height > z.maxH;
      if (!last.overflow) break;
    }
    return last;
  }

  function draw(ctx, doc, z) {
    const key = JSON.stringify([doc.h1, doc.h2, doc.line, z]);
    if (key !== cacheKey) { cache = layout(ctx, doc, z); cacheKey = key; }
    const L = cache;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    let y = doc.pos === 'bottom' ? z.bottom - L.height : z.top;

    setFont(ctx, 900, L.s1, L.sp);
    for (const line of L.h1) {
      const base = y + L.s1 * 0.9;
      let x = z.x, from = 0;
      for (let i = 1; i <= line.s.length; i++) { // one fillText per run of the same colour
        if (i < line.s.length && !!line.m[i] === !!line.m[from]) continue;
        const run = line.s.slice(from, i);
        ctx.fillStyle = line.m[from] ? TK.accentMain : TK.textPrimary;
        ctx.fillText(run, x, base);
        x += ctx.measureText(run).width;
        from = i;
      }
      y += L.s1 * H1_LEADING;
    }
    if (L.hasRule) {
      y += L.gap;
      ctx.fillStyle = TK.accentMain; ctx.fillRect(z.x, y, LINE_W, LINE_H);
      y += LINE_H;
    }
    if (L.h2.length) {
      if (L.h1.length) y += L.gap;
      setFont(ctx, 500, L.s2, 0);
      ctx.fillStyle = TK.textSub;
      for (const line of L.h2) { ctx.fillText(line.s, z.x, y + L.s2); y += L.s2 * H2_LEADING; }
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    return { overflow: L.overflow };
  }

  return { draw };
})();
