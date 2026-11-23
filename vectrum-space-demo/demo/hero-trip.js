/* Hero card "live trip" instead of the static platform picture (dots, CO2 plate, two numbers).
   The card shows the route the hero map (demo/hero-map.js) is drawing right now as one order going through
   its life: accepted → loading → on the road (truck moves on the map and on the card) → unloading + CMR → invoice.
   A trip lasts at least 4 map routes (4 × 2.4 s) and only uses routes the headline does not cover.
   Roll back: drop the script tag in inject.html; the React card under it is only hidden, never removed. */
(function () {
  const EVERY = 4;
  // seconds from the start of the map route: the map draws the line 0.8–2.3 s, then the truck goes
  const AT = { loading: 0.5, road: 2.3, unload: 7.4, invoice: 8.4 };
  const PLATES = ['WE 4821K', 'KR 7730P', 'PO 5512R', 'WR 1904T', 'GD 3367M', 'DW 8045S'];
  const T = {
    ru: { live: 'Рейс онлайн', note: 'Пример рейса · демо-данные', order: 'Заказ', left: 'Осталось', eta: 'Прибытие', km: 'км',
      cargo: ['Тент · 24 т', 'Рефрижератор · 18 т', 'Тент · 22 т', 'Контейнер · 20 т', 'Тент · 12 т', 'Рефрижератор · 21 т'],
      steps: ['Заказ принят', 'Загрузка', 'В пути', 'Выгрузка и CMR', 'Счёт выставлен'] },
    uk: { live: 'Рейс онлайн', note: 'Приклад рейсу · демо-дані', order: 'Замовлення', left: 'Залишилось', eta: 'Прибуття', km: 'км',
      cargo: ['Тент · 24 т', 'Рефрижератор · 18 т', 'Тент · 22 т', 'Контейнер · 20 т', 'Тент · 12 т', 'Рефрижератор · 21 т'],
      steps: ['Замовлення прийнято', 'Завантаження', 'У дорозі', 'Розвантаження і CMR', 'Рахунок виставлено'] },
    pl: { live: 'Trasa na żywo', note: 'Przykładowa trasa · dane demo', order: 'Zlecenie', left: 'Pozostało', eta: 'Przyjazd', km: 'km',
      cargo: ['Plandeka · 24 t', 'Chłodnia · 18 t', 'Plandeka · 22 t', 'Kontener · 20 t', 'Plandeka · 12 t', 'Chłodnia · 21 t'],
      steps: ['Zlecenie przyjęte', 'Załadunek', 'W trasie', 'Rozładunek i CMR', 'Faktura wystawiona'] },
    de: { live: 'Tour live', note: 'Beispieltour · Demodaten', order: 'Auftrag', left: 'Noch', eta: 'Ankunft', km: 'km',
      cargo: ['Planenauflieger · 24 t', 'Kühlauflieger · 18 t', 'Planenauflieger · 22 t', 'Container · 20 t', 'Planenauflieger · 12 t', 'Kühlauflieger · 21 t'],
      steps: ['Auftrag angenommen', 'Beladung', 'Unterwegs', 'Entladung und CMR', 'Rechnung gestellt'] },
    en: { live: 'Live trip', note: 'Example trip · demo data', order: 'Order', left: 'Left', eta: 'Arrival', km: 'km',
      cargo: ['Curtainsider · 24 t', 'Reefer · 18 t', 'Curtainsider · 22 t', 'Container · 20 t', 'Curtainsider · 12 t', 'Reefer · 21 t'],
      steps: ['Order accepted', 'Loading', 'On the road', 'Unloading and CMR', 'Invoice sent'] },
  };
  const truck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>';
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // road distance ≈ 1.25 × great circle, rounded to 10 km
  const km = (A, B) => {
    const r = Math.PI / 180, d = Math.acos(clamp(Math.sin(A[1] * r) * Math.sin(B[1] * r) + Math.cos(A[1] * r) * Math.cos(B[1] * r) * Math.cos((B[0] - A[0]) * r), -1, 1));
    return Math.round(6371 * d * 1.25 / 10) * 10;
  };
  const hhmm = m => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.round(m % 60)).padStart(2, '0')}`;

  let card, box, x, shown = -1, trip, raf = 0, visible = true, lang;

  function build() {
    box = document.createElement('div'); box.className = 'vs-trip'; box.setAttribute('aria-hidden', 'true');
    box.innerHTML = `<div class="vs-trip-top"><span class="vs-trip-live"><i></i>${x.live}</span><span>${x.note}</span></div>
      <div class="vs-trip-main">
        <div class="vs-trip-id" data-swap><small>${x.order} <b data-k="no"></b></small><strong><span data-k="a"></span>${arrow}<span data-k="b"></span></strong>
          <span class="vs-trip-truck">${truck}<span data-k="plate"></span> · <span data-k="cargo"></span></span></div>
        <div class="vs-trip-road">
          <div class="vs-trip-ends" data-swap><span data-k="a"></span><span data-k="b"></span></div>
          <div class="vs-trip-track"><i class="vs-trip-fill"></i><b class="vs-trip-car">${truck}</b></div>
          <div class="vs-trip-nums"><span>${x.left} <b data-k="left"></b></span><span>${x.eta} <b data-k="eta"></b></span></div>
        </div>
        <ol class="vs-trip-steps">${x.steps.map(s => `<li><i></i><span>${s}</span></li>`).join('')}</ol>
        <div class="vs-trip-now" data-k="now"></div>
      </div>`;
    card.appendChild(box);
    card.classList.add('vs-trip-on');
    shown = -1;
  }
  // which map routes become trips: at least EVERY routes apart, and only routes clear of the headline and
  // buttons (behind them the map is dimmed and the truck would be hard to see). Rebuilt when the map re-lays out.
  let plan = [], planFor = -1;
  const start = (H, i) => H.T.mapIn + i * H.T.every;
  // the first clear route from `from`, preferably not the same cities as the trip before
  const clear = (H, from, prev) => {
    const key = i => { const r = H.route(i); return r.a + '|' + r.b; }, ok = [];
    for (let i = from; i < from + 16; i++) if (H.route(i).calm > 0.6) ok.push(i);
    return ok.find(i => prev === undefined || key(i) !== key(prev)) ?? ok[0] ?? from;
  };
  function tripAt(H, t) {
    if (planFor !== H.layouts()) { plan = [clear(H, 0)]; planFor = H.layouts(); shown = -1; }
    let k = 0;
    for (;;) {
      if (plan[k + 1] === undefined) plan[k + 1] = clear(H, plan[k] + EVERY, plan[k]);
      if (t < start(H, plan[k + 1])) return k;
      k++;
    }
  }
  const set = (k, v) => box.querySelectorAll(`[data-k="${k}"]`).forEach(n => { if (n.textContent !== v) n.textContent = v; });

  function frame() {
    raf = 0; const H = window.__vsHero; if (!box || !box.isConnected || !H) return;
    if (!H.route(0)) { raf = requestAnimationFrame(frame); return; }
    const k = tripAt(H, H.reduced() ? 0 : H.t()), i = plan[k];
    const age = H.reduced() ? 5 : H.t() - start(H, i);
    if (k !== shown) {
      const r = H.route(i);
      shown = k; const dist = km(r.A, r.B), dep = 7 * 60 + (k * 37) % 300;
      trip = { i, dist, eta: hhmm(dep + 60 + dist / 65 * 60) };
      set('no', '#' + (2148 + k * 3)); set('a', r.a); set('b', r.b);
      set('plate', PLATES[k % PLATES.length]); set('cargo', x.cargo[k % x.cargo.length]); set('eta', trip.eta);
      // the new trip slides in
      box.querySelectorAll('[data-swap]').forEach(n => { n.classList.remove('in'); void n.offsetWidth; n.classList.add('in'); });
    }
    const p = ease(clamp((age - AT.road) / (AT.unload - AT.road)));
    window.__vsTrip = { i: trip.i, p };
    const step = age < AT.loading ? 0 : age < AT.road ? 1 : age < AT.unload ? 2 : age < AT.invoice ? 3 : 4;
    box.querySelectorAll('.vs-trip-steps li').forEach((li, n) => { li.className = n < step ? 'done' : n === step ? 'now' : ''; });
    set('now', x.steps[step]);
    set('left', Math.round(trip.dist * (1 - p) / 10) * 10 + ' ' + x.km);
    box.style.setProperty('--p', p.toFixed(4));
    if (!H.reduced() && visible) raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  function mount() {
    const c = document.querySelector('section[class*="__hero"] > [class*="__network"]');
    // wait for React to hydrate the card: an extra child before that is a hydration error (#418)
    if (!c || !window.__vsHero || !Object.keys(c).some(k => k.startsWith('__reactFiber'))) return;
    const l = document.documentElement.lang;
    if (c === card && box && box.isConnected && l === lang) return;
    if (box) box.remove();
    card = c; lang = l; x = T[l] || T.en;
    build();
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(card);
    kick();
  }
  new MutationObserver(mount).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
  const wait = () => { mount(); if (!box) setTimeout(wait, 150); };
  wait();
})();
