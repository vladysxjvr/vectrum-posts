/* Hero content (badge -> platform card) centred in the free height between the header and the
   bottom of the screen; the header itself stays where it is. The block's height depends on the
   width and the language, so it is measured; inject.html has a CSS estimate for the first paint.
   Writes one CSS variable on <html>, nothing on React's nodes. Phones: the hero is taller than the
   screen anyway, the minimum (the site's own 20px) stays. */
(function () {
  const root = document.documentElement, MIN = 20;
  let tick = false;
  function update() {
    tick = false;
    const surface = document.querySelector('[class*="__heroSurface"]'), header = surface && surface.querySelector(':scope > header');
    const hero = surface && surface.querySelector(':scope > section[class*="__hero"]');
    if (!hero || !header || !hero.firstElementChild) return;
    const first = hero.firstElementChild.getBoundingClientRect(), last = hero.lastElementChild.getBoundingClientRect();
    const block = last.bottom - first.top, free = innerHeight - header.offsetHeight;
    const pad = Math.max(MIN, Math.round((free - block) / 2));
    root.style.setProperty('--vs-hero-pad', pad + 'px');
  }
  const kick = () => { if (!tick) { tick = true; setTimeout(update, 0); } };
  addEventListener('resize', kick);
  // text changes with the language, fonts load late, client-side navigation swaps the page
  new MutationObserver(kick).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.fonts) document.fonts.ready.then(kick);
  update();
  window.__vsHeroCenter = update; // for checks
})();
