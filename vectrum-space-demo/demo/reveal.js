/* Soft scroll reveal, same feel as dev.vectrumspace.eu (main.js "scroll reveal"):
   fade + 18px rise, 1.1s cubic-bezier(.22,1,.36,1), triggered when the top enters the lower 92%
   of the screen; children of card grids come in as a wave, 90ms per column of the row.
   Safe with React: only a data attribute and a CSS variable are touched, only after hydration,
   only on blocks that are below the screen at that moment (nothing visible ever blinks),
   and the attribute is removed when the animation is over. */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const A = 'data-vs-reveal', DUR = 1100, STEP = 90, LIMIT = 0.92;
  let pending = [], ticking = false, scan = 0;

  const hydrated = el => Object.keys(el).some(k => k.startsWith('__reactFiber'));
  // a grid of cards: 3+ children of the same tag (features, plans, questions, footer columns)
  // stacked children (a carousel's slides) are not a grid: they share one place on screen
  const overlap = (a, b) => { const r = a.getBoundingClientRect(), s = b.getBoundingClientRect(); return Math.abs(r.left - s.left) < 4 && Math.abs(r.top - s.top) < 4; };
  const isGroup = el => el.children.length >= 3 && [...el.children].every(c => c.tagName === el.children[0].tagName)
    && /^(ARTICLE|DETAILS|DIV|LI|A|FIGURE)$/.test(el.children[0].tagName) && !overlap(el.children[0], el.children[1]);

  function blocks() {
    const singles = [], groups = [];
    const roots = [...document.querySelectorAll('main section, footer')].filter(s => !s.closest('[class*="__heroSurface"]'));
    for (const sec of roots) {
      if (roots.some(o => o !== sec && o.contains(sec))) continue; // nested section: handled by its parent
      for (const ch of sec.children) {
        if (isGroup(ch)) groups.push(ch);
        else if (ch.firstElementChild && ch.firstElementChild.children.length >= 3 && overlap(ch.firstElementChild.children[0], ch.firstElementChild.children[1])) singles.push(ch); // carousel: one block
        else if (ch.firstElementChild && isGroup(ch.firstElementChild)) { groups.push(ch.firstElementChild); [...ch.children].slice(1).forEach(c => singles.push(c)); }
        else if (ch.tagName === 'DIV' && !ch.className && ch.children.length > 1) [...ch.children].forEach(c => (isGroup(c) ? groups : singles).push(c));
        else singles.push(ch);
      }
    }
    return { singles, groups };
  }

  function prepare() {
    scan = 0;
    const limit = innerHeight * LIMIT, { singles, groups } = blocks(), add = [];
    const hide = el => {
      if (el.hasAttribute(A) || el.dataset.vsSeen) return false;
      el.dataset.vsSeen = '1';
      if (!el.offsetParent || el.getBoundingClientRect().top < limit) return false; // on screen or above: leave it alone
      el.setAttribute(A, 'wait'); add.push(el); return true;
    };
    singles.forEach(hide);
    for (const g of groups) {
      const rows = {};
      for (const c of g.children) {
        if (!hide(c)) continue;
        // one row = tops within ~60px (a raised "featured" card still belongs to its row)
        const top = Math.round((c.getBoundingClientRect().top + scrollY) / 60), col = rows[top] = rows[top] === undefined ? 0 : rows[top] + 1;
        c.style.setProperty('--vs-reveal-delay', col * STEP + 'ms');
      }
    }
    pending.push(...add);
    if (add.length) onScroll();
  }

  function check() {
    ticking = false;
    let limit = innerHeight * LIMIT;
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) limit = Infinity; // page bottom: show the rest
    pending = pending.filter(el => {
      if (!el.isConnected) return false;
      if (el.getBoundingClientRect().top >= limit) return true;
      el.setAttribute(A, 'in');
      const delay = parseFloat(el.style.getPropertyValue('--vs-reveal-delay')) || 0;
      setTimeout(() => { el.removeAttribute(A); el.style.removeProperty('--vs-reveal-delay'); }, DUR + delay + 100);
      return false;
    });
  }
  // a timer, not requestAnimationFrame: rAF stops in background tabs and some embedded views
  function onScroll() { if (!ticking) { ticking = true; setTimeout(check, 16); } }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  // first scan after React hydrated the page; later scans when client-side navigation renders a new page
  function start() {
    const main = document.querySelector('main');
    if (!main || !hydrated(main)) return setTimeout(start, 100);
    prepare();
    new MutationObserver(() => { if (!scan) scan = setTimeout(prepare, 30); }).observe(document.body, { childList: true, subtree: true });
  }
  start();
})();
