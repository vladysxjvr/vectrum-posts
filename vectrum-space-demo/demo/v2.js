/* v2 test version of the home page: what an owner of a transport company needs before buying.
   - "Было → Стало" replaces the "Платформа · Всё работает вместе" band with the AI slider
   - "Запуск за 7 дней" + what it connects to, after the features
   - cost calculator before the plans, trial terms under the plans
   - "Данные под защитой" and extra questions in the FAQ
   Same rules as reveal.js: nothing is touched before React hydrated the page, our nodes only sit next to
   React's ones, and they are put back if client-side navigation re-renders the home page.
   Texts: ru, everything else falls back to en. */
(function () {
  const REGISTER = 'https://dashboard.vectrumspace.eu/register';
  const I = {
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    gauge: '<path d="M12 14l3-3"/><path d="M3.5 18a9 9 0 1 1 17 0z"/>',
    sheet: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 15h16M10 3v18"/>',
    euro: '<path d="M17 6.5A7 7 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    eu: '<circle cx="12" cy="12" r="9"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.8 7 9 4-1.2 7-4.6 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  };
  const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  const T = {
    ru: {
      ba: {
        eyebrow: 'Один рабочий день', title: ['Меньше звонков и таблиц.', 'Больше перевозок.'],
        lead: 'Узнаёте свой день? Вот как он выглядит в Vectrum.',
        before: 'Сейчас', after: 'С Vectrum',
        rows: [
          ['Заказ приходит на почту', 'Логист вручную переносит его в Excel, потом пересылает водителю в мессенджер.',
           'Заказ вносится один раз', 'И сразу виден логисту, водителю и бухгалтерии, без копирования.'],
          ['«Где машина?»', 'Клиент звонит логисту, логист звонит водителю, водитель за рулём.',
           'Позиция и ETA на карте', 'Ответ клиенту за секунды, водителя никто не отвлекает.'],
          ['CMR и фото теряются в чатах', 'Документы собирают по WhatsApp, часть приходит через неделю.',
           'CMR и фото в заказе', 'Водитель прикрепляет их из приложения прямо на выгрузке.'],
          ['Сервис вспоминают в последний момент', 'Техосмотр, страховка и тахограф живут в календаре у одного человека.',
           'Напоминания заранее', 'Карточка машины сама предупредит о сроках и плановом сервисе.'],
          ['Счёт уходит через неделю', 'Бухгалтерия ждёт документы, деньги приходят позже.',
           'Счёт в день выгрузки', 'Все данные по рейсу уже в системе, счёт формируется сразу.'],
        ],
        stats: [['<em>1</em> система', 'вместо почты, Excel, мессенджеров и отдельного трекинга'],
                ['<em>0</em> звонков', '«где машина?»: позиция и время прибытия видны всей команде'],
                ['Счёт <em>в день</em> выгрузки', 'документы рейса собираются в заказе, пока машина в пути']],
      },
      launch: {
        eyebrow: 'Внедрение', title: ['Запуск за 7 дней.', 'Без остановки перевозок.'],
        lead: 'Переход идёт параллельно с текущей работой. Поможем перенести данные и обучить команду.',
        steps: [
          ['День 1', 'Регистрация', 'Создаёте компанию, приглашаете логистов, водителей и бухгалтерию с нужными правами.'],
          ['Дни 1–2', 'Перенос данных', 'Машины, прицепы, водителей и клиентов загружаем из Excel. Вручную ничего вводить не нужно.'],
          ['Дни 2–5', 'Подключение', 'Подключаем GPS-трекеры и тахограф. Водители ставят приложение Vectrum Driver.'],
          ['До 7 дня', 'Обучение', 'Короткое обучение логистов и водителей. Первые рейсы проводим вместе с вами.'],
        ],
        integrTitle: 'Работает с тем, что у вас уже есть:',
        chips: [['pin', 'GPS-трекеры'], ['gauge', 'Тахограф (DDD)'], ['sheet', 'Excel / CSV'], ['euro', 'Бухгалтерия'], ['swap', 'Биржи грузов'], ['mail', 'Заказы из почты и PDF']],
      },
      calc: {
        eyebrow: 'Калькулятор', title: ['Сколько это стоит', 'для вашего автопарка?'],
        lead: 'Двигайте ползунок. Время и стоимость часа логиста можно поменять под вашу компанию.',
        fleet: 'Машин в автопарке', plan: 'Тариф', minutes: 'Экономия времени логиста', minUnit: 'мин в день на машину',
        rate: 'Стоимость часа логиста', rateUnit: '€ / час',
        cost: 'Vectrum в месяц', perDay: 'В день на одну машину', saved: 'Время логистов в месяц', value: 'Это время стоит',
        hours: 'ч', breakEven: (m) => `Подписка окупается, если логист экономит <b>больше ${m} мин в день</b> на каждую машину.`,
        note: 'Расчёт ориентировочный: 22 рабочих дня в месяце, цены тарифов за месяц, без НДС.',
        cta: 'Попробовать бесплатно',
      },
      more: 'Посмотреть, как это работает',
      trial: ['Бесплатный период', 'Без привязки карты', 'Помесячная оплата, отмена в любой момент'],
      trust: {
        eyebrow: 'Безопасность', title: ['Ваши данные', 'под защитой.'],
        lead: 'Заказы, клиенты и цены — это ваш бизнес. Поэтому доступ к ним строго ограничен.',
        cards: [
          ['eu', 'Создано в ЕС', 'Продукт из ЕС для автомобильных перевозок. Работаем по европейским правилам и документам.'],
          ['shield', 'GDPR / RODO', 'Персональные данные водителей и клиентов обрабатываются по требованиям GDPR.'],
          ['users', 'Доступ по ролям', 'Владелец решает, кто что видит: логисты, водители, механики и бухгалтерия — только своё.'],
          ['download', 'Данные ваши', 'Выгрузка заказов, машин и отчётов в любой момент. Уйти от нас можно со всеми данными.'],
        ],
      },
      faq: [
        ['Нужно ли покупать новые GPS-трекеры?', 'Нет. Если трекеры уже стоят, подключаем их. Позицию машины также передаёт приложение водителя Vectrum Driver.'],
        ['Как перенести данные из Excel?', 'Пришлите таблицы с машинами, водителями и клиентами — загрузим их сами. Обычно это занимает один-два дня.'],
        ['Есть ли долгий контракт?', 'Нет. Оплата помесячно за каждую машину, тариф можно сменить или отменить в любой момент.'],
        ['Сколько стоит приложение водителя?', 'Vectrum Driver и Vectrum Logist входят в тариф. Отдельно за пользователей платить не нужно.'],
      ],
    },
    en: {
      ba: {
        eyebrow: 'One working day', title: ['Fewer calls and spreadsheets.', 'More transport.'],
        lead: 'Recognise your day? This is how it looks in Vectrum.',
        before: 'Today', after: 'With Vectrum',
        rows: [
          ['An order arrives by e-mail', 'The dispatcher retypes it into Excel, then forwards it to the driver in a messenger.',
           'The order is entered once', 'Dispatch, driver and accounting see it at once, no copying.'],
          ['“Where is the truck?”', 'The customer calls dispatch, dispatch calls the driver, the driver is at the wheel.',
           'Position and ETA on the map', 'Answer the customer in seconds, nobody distracts the driver.'],
          ['CMRs and photos get lost in chats', 'Documents are collected over WhatsApp, some arrive a week later.',
           'CMR and photos in the order', 'The driver attaches them in the app right at unloading.'],
          ['Service is remembered at the last minute', 'Inspections, insurance and tachograph live in one person’s calendar.',
           'Reminders in advance', 'The vehicle card warns about deadlines and planned service.'],
          ['The invoice goes out a week later', 'Accounting waits for documents, money comes in later.',
           'Invoice on the day of unloading', 'All trip data is already in the system, the invoice is ready at once.'],
        ],
        stats: [['<em>1</em> system', 'instead of e-mail, Excel, messengers and a separate tracker'],
                ['<em>0</em> calls', '“where is the truck?”: position and ETA are visible to the whole team'],
                ['Invoice <em>same day</em>', 'trip documents collect in the order while the truck is on the road']],
      },
      launch: {
        eyebrow: 'Onboarding', title: ['Live in 7 days.', 'Without stopping your trucks.'],
        lead: 'The switch runs alongside your current work. We help move your data and train the team.',
        steps: [
          ['Day 1', 'Sign up', 'Create your company, invite dispatchers, drivers and accounting with the right permissions.'],
          ['Days 1–2', 'Data import', 'Vehicles, trailers, drivers and customers are loaded from Excel. No manual typing.'],
          ['Days 2–5', 'Connections', 'We connect GPS trackers and the tachograph. Drivers install the Vectrum Driver app.'],
          ['By day 7', 'Training', 'Short training for dispatchers and drivers. We run the first trips together with you.'],
        ],
        integrTitle: 'Works with what you already have:',
        chips: [['pin', 'GPS trackers'], ['gauge', 'Tachograph (DDD)'], ['sheet', 'Excel / CSV'], ['euro', 'Accounting'], ['swap', 'Freight exchanges'], ['mail', 'Orders from e-mail and PDF']],
      },
      calc: {
        eyebrow: 'Calculator', title: ['What does it cost', 'for your fleet?'],
        lead: 'Move the slider. Adjust the dispatcher time and hourly cost to your company.',
        fleet: 'Vehicles in the fleet', plan: 'Plan', minutes: 'Dispatcher time saved', minUnit: 'min a day per vehicle',
        rate: 'Dispatcher hourly cost', rateUnit: '€ / hour',
        cost: 'Vectrum per month', perDay: 'Per vehicle per day', saved: 'Dispatcher time per month', value: 'That time is worth',
        hours: 'h', breakEven: (m) => `The subscription pays off if a dispatcher saves <b>more than ${m} min a day</b> per vehicle.`,
        note: 'Rough estimate: 22 working days a month, monthly plan prices, VAT excluded.',
        cta: 'Try it free',
      },
      more: 'See how it works',
      trial: ['Free trial', 'No card required', 'Monthly billing, cancel any time'],
      trust: {
        eyebrow: 'Security', title: ['Your data,', 'protected.'],
        lead: 'Orders, customers and rates are your business. Access to them is strictly limited.',
        cards: [
          ['eu', 'Made in the EU', 'An EU product for road transport. We follow European rules and documents.'],
          ['shield', 'GDPR', 'Personal data of drivers and customers is processed under GDPR.'],
          ['users', 'Role-based access', 'The owner decides who sees what: dispatchers, drivers, mechanics and accounting only see their part.'],
          ['download', 'Your data is yours', 'Export orders, vehicles and reports at any time. You can leave with all your data.'],
        ],
      },
      faq: [
        ['Do I need to buy new GPS trackers?', 'No. If trackers are already installed, we connect them. The Vectrum Driver app also reports the truck position.'],
        ['How do I move my data from Excel?', 'Send us your vehicle, driver and customer sheets and we load them. It usually takes a day or two.'],
        ['Is there a long contract?', 'No. You pay monthly per vehicle and can change or cancel the plan at any time.'],
        ['How much is the driver app?', 'Vectrum Driver and Vectrum Logist are included in the plan. No extra per-user fees.'],
      ],
    },
  };
  const PRICES = { standard: 25, premium: 49 };

  const t = () => T[document.documentElement.lang] || T.en;
  const head = (eyebrow, [a, b], lead, center) => `<div class="${center ? 'vs2-center' : ''}"><span class="vs2-eyebrow">${eyebrow}</span>
    <h2>${a}<br><em>${b}</em></h2>${lead ? `<p class="vs2-lead">${lead}</p>` : ''}</div>`;
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  function beforeAfter(x) {
    const cells = x.rows.map(([bt, bp, at, ap]) => `
      <div class="vs2-ba-cell before">${svg('x')}<div><b>${bt}</b>${bp}</div></div>
      <div class="vs2-ba-arrow">${svg('arrow')}</div>
      <div class="vs2-ba-cell after vs2-card">${svg('check')}<div><b>${at}</b>${ap}</div></div>`).join('');
    // the grid is one block for reveal.js: rows come in together, so "before" never shows without its "after"
    return el(`<div class="vs2-band" data-vs2="ba"><section class="vs2" id="before-after">
      ${head(x.eyebrow, x.title, x.lead)}
      <div><div class="vs2-ba">
        <div class="vs2-ba-head before"><i></i>${x.before}</div><div></div><div class="vs2-ba-head after"><i></i>${x.after}</div>
        ${cells}
      </div></div>
      <div class="vs2-stats">${x.stats.map(([s, p]) => `<div class="vs2-stat vs2-card"><strong>${s}</strong><span>${p}</span></div>`).join('')}</div>
    </section></div>`);
  }

  function launch(x) {
    return el(`<section class="vs2" data-vs2="launch" id="onboarding">
      ${head(x.eyebrow, x.title, x.lead)}
      <div class="vs2-steps">${x.steps.map(([day, h, p], i) => `<article class="vs2-step vs2-card">
        <div class="vs2-step-top"><span class="vs2-step-num">0${i + 1}</span><span class="vs2-step-day">${day}</span></div>
        <h3>${h}</h3><p>${p}</p></article>`).join('')}</div>
      <div class="vs2-integr vs2-card"><span>${x.integrTitle}</span>
        <div class="vs2-chips">${x.chips.map(([ic, n]) => `<span class="vs2-chip">${svg(ic)}${n}</span>`).join('')}</div></div>
    </section>`);
  }

  function calc(x) {
    const s = el(`<section class="vs2" data-vs2="calc" id="calculator">
      ${head(x.eyebrow, x.title, x.lead, true)}
      <div class="vs2-calc">
        <div class="vs2-calc-in vs2-card">
          <div class="vs2-field"><label for="vs2-fleet">${x.fleet}<output id="vs2-fleet-out">15</output></label>
            <input class="vs2-range" id="vs2-fleet" type="range" min="1" max="150" value="15"></div>
          <div class="vs2-field"><span class="vs2-lbl">${x.plan}</span>
            <div class="vs2-seg" role="group"><button type="button" data-plan="standard" aria-pressed="true">Standard · 25€</button><button type="button" data-plan="premium" aria-pressed="false">Premium · 49€</button></div></div>
          <div class="vs2-assume">
            <div class="vs2-field"><label for="vs2-min">${x.minutes}</label><div class="vs2-num"><input id="vs2-min" type="number" min="0" max="120" value="10" inputmode="numeric"><span>${x.minUnit}</span></div></div>
            <div class="vs2-field"><label for="vs2-rate">${x.rate}</label><div class="vs2-num"><input id="vs2-rate" type="number" min="1" max="200" value="20" inputmode="numeric"><span>${x.rateUnit}</span></div></div>
          </div>
          <p class="vs2-small">${x.note}</p>
        </div>
        <div class="vs2-calc-out vs2-card" aria-live="polite">
          <div class="vs2-out-row vs2-out-big"><span>${x.cost}</span><strong data-o="cost"></strong></div>
          <div class="vs2-out-row"><span>${x.perDay}</span><strong data-o="day"></strong></div>
          <div class="vs2-out-row"><span>${x.saved}</span><strong data-o="hours"></strong></div>
          <div class="vs2-out-row"><span>${x.value}</span><strong data-o="value"></strong></div>
          <p class="vs2-out-note" data-o="even"></p>
          <a class="vs2-btn" href="${REGISTER}">${x.cta}${svg('arrow')}</a>
        </div>
      </div>
    </section>`);
    const $ = q => s.querySelector(q), lang = document.documentElement.lang || 'en';
    const money = v => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR', maximumFractionDigits: v < 10 ? 2 : 0 }).format(v);
    let plan = 'standard';
    const num = (q, d) => { const v = parseFloat($(q).value); return isFinite(v) && v >= 0 ? v : d; };
    function update() {
      const n = +$('#vs2-fleet').value, price = PRICES[plan], min = num('#vs2-min', 10), rate = num('#vs2-rate', 20) || 20;
      const cost = n * price, hours = n * min * 22 / 60;
      $('#vs2-fleet-out').textContent = n;
      $('[data-o="cost"]').textContent = money(cost);
      $('[data-o="day"]').textContent = money(price / 22);
      $('[data-o="hours"]').textContent = Math.round(hours) + ' ' + x.hours;
      $('[data-o="value"]').textContent = money(hours * rate);
      $('[data-o="even"]').innerHTML = x.breakEven(Math.max(1, Math.ceil(price * 60 / (22 * rate))));
    }
    s.addEventListener('input', update);
    s.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => {
      plan = b.dataset.plan; s.querySelectorAll('[data-plan]').forEach(o => o.setAttribute('aria-pressed', o === b)); update();
    }));
    update();
    return s;
  }

  function trust(x) {
    return el(`<section class="vs2" data-vs2="trust" id="security">
      ${head(x.eyebrow, x.title, x.lead)}
      <div class="vs2-trust">${x.cards.map(([ic, h, p]) => `<article class="vs2-card"><span class="vs2-ico">${svg(ic)}</span><h3>${h}</h3><p>${p}</p></article>`).join('')}</div>
    </section>`);
  }

  const trial = list => el(`<div class="vs2-trial" data-vs2="trial">${list.map(s => `<span>${svg('check')}${s}</span>`).join('')}</div>`);
  // the FAQ cards are styled by inject.html through `section[class*="__faq"] details`, ours get the same look
  const faqItems = list => list.map(([q, a]) => el(`<details data-vs2="faq"><summary>${q}</summary><p>${a}</p></details>`));

  function mount() {
    if (location.pathname !== '/') return;
    const main = document.querySelector('main');
    const band = main && main.querySelector(':scope > [class*="__ecosystemBand"]');
    const caps = main && main.querySelector(':scope > section[class*="__capabilities"]');
    const pricing = main && main.querySelector(':scope > section[class*="__pricing"]');
    const faq = main && main.querySelector(':scope > section[class*="__faq"]');
    if (!band || !caps || !pricing || !faq) return;
    const lang = document.documentElement.lang;
    if (main.dataset.vs2 === lang && main.querySelector('[data-vs2="ba"]')) return;
    main.querySelectorAll('[data-vs2]').forEach(n => n.remove());
    main.dataset.vs2 = lang;
    const x = t();
    band.after(beforeAfter(x.ba));
    // "how it works" page with the platform screens, under the feature cards
    caps.appendChild(el(`<div class="vs2-more" data-vs2="more"><a class="vs2-btn" href="/how-it-works">${x.more}${svg('arrow')}</a></div>`));
    caps.after(launch(x.launch));
    pricing.before(calc(x.calc));
    pricing.before(trust(x.trust));
    const carousel = pricing.querySelector('[class*="__planCarousel"]');
    if (carousel) carousel.after(trial(x.trial));
    const qs = faq.querySelector('[class*="__questions"]');
    if (qs) faqItems(x.faq).forEach(d => qs.appendChild(d));
    // links that pointed at the hidden band (footer "Vectrum Driver / Logist", hero "Как это работает") now land on before / after
    main.ownerDocument.querySelectorAll('a[href="/#ecosystem"], a[href="#ecosystem"]').forEach(a => a.setAttribute('href', '/#before-after'));
  }

  const hydrated = n => Object.keys(n).some(k => k.startsWith('__reactFiber'));
  function start() {
    const main = document.querySelector('main');
    if (!main || !hydrated(main)) return setTimeout(start, 100);
    mount();
    let tm = 0;
    new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(mount, 40); }).observe(document.body, { childList: true, subtree: true });
    new MutationObserver(mount).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  }
  start();
})();
