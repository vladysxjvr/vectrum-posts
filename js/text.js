/* Headline layer: wraps H1 / H2 into the format's text zone and shrinks them until they fit.
   doc: { h1: field, h2: field, line, pos: 'top' | 'bottom' } ; field: { text, styles[] }.
   styles[i] = null or { c: '#hex', b: true | false, i: true, u: true } for character i. */
window.TextLayer = (function () {
  const TK = window.TOKENS;
  const MIN_SCALE = 0.55, MAX_H1_LINES = 4, H1_LEADING = 1.1, H2_LEADING = 1.4, LINE_W = 100, LINE_H = 6;
  const FIELDS = {
    h1: { color: TK.textPrimary, bold: true,  boldW: 900, lightW: 500 },
    h2: { color: TK.textSub,     bold: false, boldW: 800, lightW: 500 },
  };
  let cacheKey = '', cache = null;

  const fontOf = (u, size) => `${u.i ? 'italic ' : ''}${u.w} ${size}px Raleway, Arial, sans-serif`;

  // one display unit per source character; upper-casing may turn a character into two (ß)
  function toUnits(field, def) {
    return [...Array(field.text.length).keys()].map(n => {
      const st = field.styles[n] || {}, ch = field.text[n];
      return { s: st.u ? ch.toUpperCase() : ch, c: st.c || def.color, i: !!st.i, w: (st.b === undefined ? def.bold : st.b) ? def.boldW : def.lightW };
    });
  }
  // calls fn(text, unit) for each run of units with the same font and colour
  function eachRun(units, fn) {
    for (let from = 0, n = 1; n <= units.length; n++) {
      const a = units[from], b = units[n];
      if (b && a.c === b.c && a.i === b.i && a.w === b.w) continue;
      fn(units.slice(from, n).map(u => u.s).join(''), a);
      from = n;
    }
  }
  function setFont(ctx, font, spacing) {
    ctx.font = font;
    if ('letterSpacing' in ctx) ctx.letterSpacing = spacing + 'px';
  }
  function measure(ctx, units, size, spacing) {
    let w = 0;
    eachRun(units, (text, u) => { setFont(ctx, fontOf(u, size), spacing); w += ctx.measureText(text).width; });
    return w;
  }

  // returns lines (arrays of units) and tooWide = a single word did not fit and had to be split
  function wrap(ctx, units, size, spacing, maxW) {
    const lines = []; let tooWide = false, cur = [];
    const blank = u => /^\s$/.test(u.s);
    const push = () => { while (cur.length && blank(cur[cur.length - 1])) cur.pop(); lines.push(cur); cur = []; };
    const fits = list => measure(ctx, list, size, spacing) <= maxW;
    for (let n = 0; n < units.length;) {
      if (units[n].s === '\n') { push(); n++; continue; }
      if (blank(units[n])) { if (cur.length) cur.push(units[n]); n++; continue; }
      let end = n; while (end < units.length && !blank(units[end]) && units[end].s !== '\n') end++;
      const word = units.slice(n, end);
      if (cur.length && !fits(cur.concat(word))) push();
      if (fits(word)) cur = cur.concat(word);
      else {
        tooWide = true;
        for (const u of word) { if (cur.length && !fits(cur.concat(u))) push(); cur.push(u); }
      }
      n = end;
    }
    push();
    while (lines.length && !lines[lines.length - 1].length) lines.pop();
    return { lines, tooWide };
  }

  function layout(ctx, doc, z) {
    const u1 = toUnits(doc.h1, FIELDS.h1), u2 = toUnits(doc.h2, FIELDS.h2);
    let last;
    for (let scale = 1; scale >= MIN_SCALE - 1e-6; scale -= 0.03) {
      const s1 = Math.round(z.h1 * scale), s2 = Math.round(z.h2 * Math.max(scale, 0.75)), sp = -s1 / 76;
      const a = wrap(ctx, u1, s1, sp, z.maxW), b = wrap(ctx, u2, s2, 0, z.maxW);
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

  function drawLine(ctx, units, x, base, size, spacing) {
    eachRun(units, (text, u) => {
      setFont(ctx, fontOf(u, size), spacing);
      ctx.fillStyle = u.c;
      ctx.fillText(text, x, base);
      x += ctx.measureText(text).width;
    });
  }

  function draw(ctx, doc, z) {
    const key = JSON.stringify([doc.h1, doc.h2, doc.line, z]);
    if (key !== cacheKey) { cache = layout(ctx, doc, z); cacheKey = key; }
    const L = cache;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    let y = doc.pos === 'bottom' ? z.bottom - L.height : z.top;

    for (const line of L.h1) { drawLine(ctx, line, z.x, y + L.s1 * 0.9, L.s1, L.sp); y += L.s1 * H1_LEADING; }
    if (L.hasRule) {
      y += L.gap;
      ctx.fillStyle = TK.accentMain; ctx.fillRect(z.x, y, LINE_W, LINE_H);
      y += LINE_H;
    }
    if (L.h2.length) {
      if (L.h1.length) y += L.gap;
      for (const line of L.h2) { drawLine(ctx, line, z.x, y + L.s2, L.s2, 0); y += L.s2 * H2_LEADING; }
    }
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    return { overflow: L.overflow };
  }

  return { draw, FIELDS };
})();
