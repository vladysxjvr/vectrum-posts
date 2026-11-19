/* Scroll overlap like dev.vectrumspace.eu ("intro overlap" in its main.js): the hero stays in place,
   the ecosystem band slides over it as a rounded card, and while it does the hero darkens and its
   content recedes. --vs-p goes 0 -> 1 = (viewport height - band top) / viewport height, as on dev.
   dev pins the hero with position: sticky inside a wrapper; here the hero has no wrapper of its own,
   so it is held in place with `top: scrollY` (not a transform: that would break the fixed mobile menu
   in the header). Only CSS variables on <html> are written, nothing on React's nodes. */
(function () {
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let tick = false;

  function update() {
    tick = false;
    // only where the opaque ecosystem band follows the hero (the home page): anything else would let the held hero show through
    const hero = document.querySelector('[class*="__heroSurface"]'), band = hero && hero.nextElementSibling;
    if (!hero || !band || !/__ecosystemBand/.test(band.className) || reduced.matches) { root.style.removeProperty('--vs-hero-y'); root.style.removeProperty('--vs-p'); root.removeAttribute('data-vs-covered'); return; }
    const vh = innerHeight, h = hero.offsetHeight;
    const p = Math.min(1, Math.max(0, (vh - band.getBoundingClientRect().top) / vh));
    // a hero taller than the screen (phones) first scrolls until its bottom meets the screen's bottom, then holds;
    // it holds until the band has fully covered it, after that it waits underneath, hidden
    const hold = Math.max(0, scrollY - Math.max(0, h - vh));
    root.style.setProperty('--vs-hero-y', Math.min(hold, h) + 'px');
    root.style.setProperty('--vs-p', p.toFixed(3));
    if (scrollY >= h) root.setAttribute('data-vs-covered', ''); else root.removeAttribute('data-vs-covered');
  }
  const kick = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);
  reduced.addEventListener('change', kick);
  // client-side navigation swaps the page: recompute when the DOM changes
  new MutationObserver(kick).observe(document.documentElement, { childList: true, subtree: true });
  update();
  window.__vsOverlap = update; // for checking when the page does not animate (hidden tab)
})();
