/* Vectrum Dev — CTA / funnel prototype. Runs right before the site's main.js:
   1) adds the new texts to window.I18N, so main.js's apply() renders them in the page language;
   2) changes the markup (new blocks get data-t keys, main.js fills them and its scroll reveal picks them up);
   3) after main.js: sticky mobile CTA, short form on service and project pages, analytics events.
   Every "[…]" in the texts is a placeholder to fill in before going live (see README). */
(function () {
  'use strict';
  var I18N = window.I18N;
  if (!I18N) return;
  var lang = document.documentElement.lang === 'uk' ? 'ua' : document.documentElement.lang;
  if (!I18N[lang]) lang = 'en';
  var path = lang === 'ua' ? 'uk' : lang;

  var T = {
    en: {
      cta: 'Get a free estimate', order: 'Get a free estimate',
      h1: 'Websites and apps for European businesses,', h1a: 'launched in 4–8 weeks',
      heroSub: 'Company websites, online stores and mobile apps. Fixed price and deadline in the contract, payment in stages.',
      heroNote: 'Reply within 24 hours · Free estimate · No obligation', heroAlt: 'See our work',
      svcLead: 'Choose what you need. We estimate the scope, timeline and price for free.',
      s1d: '5–15 pages, CMS, several languages. From €[…] · 4–6 weeks',
      s2d: 'Catalogue, online payments, delivery, admin panel. From €[…] · 6–10 weeks',
      s3d: 'One page built to collect enquiries. From €[…] · 2–3 weeks',
      s4: 'Mobile app (iOS and Android)', s4d: 'From idea to App Store and Google Play. From €[…] · from 8 weeks',
      code: 'Prototype and design before development starts. From €[…]',
      seo: 'Technical audit, fixes, Search Console and analytics. From €[…]',
      w4: 'Everything is yours', w4d: 'Code, design files and accounts are handed over to you',
      w5: 'Support after launch', w5d: 'We fix bugs found after launch and stay available for updates',
      w6: 'One contact person', w6d: 'A project manager who speaks EN, PL, UA or RU',
      proofTitle: 'Results for our clients',
      p1n: '189', p1t: 'clients use the Normobaria app instead of paper passes',
      p2n: '24/7', p2t: 'online booking on the Aquila Hotel website',
      p3n: '3', p3t: 'languages on the Joy Lab salon website',
      p4n: '4', p4t: 'languages we work in: EN, PL, UA, RU',
      revTitle: 'What clients say', revPh: 'Placeholder: a real client quote goes here (Aquila Hotel, Joy Lab, Normobaria)', revWho: 'Name, position, company',
      howTitle: 'How we work',
      h1t: 'Free 30-minute call', h1d: 'We discuss your goal, audience and budget.',
      h2t: 'Estimate in 2 working days', h2d: 'Scope, timeline and fixed price in writing.',
      h3t: 'Design and development', h3d: 'You see progress every week and pay in stages.',
      h4t: 'Launch and support', h4d: 'We publish, connect analytics and stay on hand.',
      fTitle: 'Get a free estimate', fSub: 'Tell us briefly about your project. We reply within 24 hours on working days. No obligation.',
      fPhone: 'Phone (optional)', fIdea: 'What do you need? A website, store or app: a few words are enough',
      badPhone: 'Check the number: 7–15 digits',
      consent: 'By sending the form you agree that we process your data to reply to your enquiry.', privacy: 'Privacy policy',
      alt: 'Prefer a messenger?', mail: 'Email',
      stickyTxt: 'Free project estimate in 24 h',
      miniTitle: 'Get a free estimate for a similar project', miniSub: 'We reply within 24 hours on working days.',
      miniName: 'Your name', miniIdea: 'What do you need? (optional)', miniOk: 'Thank you! We will reply within 24 hours.', miniErr: 'Enter your name and a valid email'
    },
    pl: {
      cta: 'Bezpłatna wycena', order: 'Bezpłatna wycena',
      h1: 'Strony i aplikacje dla firm w Europie,', h1a: 'gotowe w 4–8 tygodni',
      heroSub: 'Strony firmowe, sklepy internetowe i aplikacje mobilne. Stała cena i termin w umowie, płatność etapami.',
      heroNote: 'Odpowiedź w 24 godziny · Bezpłatna wycena · Bez zobowiązań', heroAlt: 'Zobacz realizacje',
      svcLead: 'Wybierz, czego potrzebujesz. Zakres, termin i cenę wycenimy bezpłatnie.',
      s1d: '5–15 podstron, CMS, kilka języków. Od […] € · 4–6 tygodni',
      s2d: 'Katalog, płatności online, dostawa, panel administracyjny. Od […] € · 6–10 tygodni',
      s3d: 'Jedna strona, która zbiera zapytania. Od […] € · 2–3 tygodnie',
      s4: 'Aplikacja mobilna (iOS i Android)', s4d: 'Od pomysłu do App Store i Google Play. Od […] € · od 8 tygodni',
      code: 'Prototyp i projekt graficzny przed programowaniem. Od […] €',
      seo: 'Audyt techniczny, poprawki, Search Console i analityka. Od […] €',
      w4: 'Wszystko należy do Ciebie', w4d: 'Przekazujemy kod, pliki projektu i dostępy do kont',
      w5: 'Wsparcie po starcie', w5d: 'Naprawiamy błędy wykryte po starcie i pomagamy w aktualizacjach',
      w6: 'Jedna osoba kontaktowa', w6d: 'Kierownik projektu mówi po polsku, angielsku, ukraińsku i rosyjsku',
      proofTitle: 'Wyniki naszych klientów',
      p1n: '189', p1t: 'klientów korzysta z aplikacji Normobaria zamiast papierowych karnetów',
      p2n: '24/7', p2t: 'rezerwacja online na stronie Aquila Hotel',
      p3n: '3', p3t: 'języki na stronie salonów Joy Lab',
      p4n: '4', p4t: 'języki, w których pracujemy: PL, EN, UA, RU',
      revTitle: 'Opinie klientów', revPh: 'Miejsce na prawdziwą opinię klienta (Aquila Hotel, Joy Lab, Normobaria)', revWho: 'Imię, stanowisko, firma',
      howTitle: 'Jak pracujemy',
      h1t: 'Bezpłatna rozmowa 30 minut', h1d: 'Omawiamy cel, odbiorców i budżet.',
      h2t: 'Wycena w 2 dni robocze', h2d: 'Zakres, termin i stała cena na piśmie.',
      h3t: 'Projekt i programowanie', h3d: 'Co tydzień widzisz postęp i płacisz etapami.',
      h4t: 'Start i wsparcie', h4d: 'Publikujemy, podłączamy analitykę i zostajemy w kontakcie.',
      fTitle: 'Bezpłatna wycena', fSub: 'Opisz krótko projekt. Odpowiadamy w 24 godziny w dni robocze. Bez zobowiązań.',
      fPhone: 'Telefon (opcjonalnie)', fIdea: 'Czego potrzebujesz? Strona, sklep, aplikacja: wystarczy kilka słów',
      badPhone: 'Sprawdź numer: 7–15 cyfr',
      consent: 'Wysyłając formularz, zgadzasz się na przetwarzanie danych w celu odpowiedzi na zapytanie.', privacy: 'Polityka prywatności',
      alt: 'Wolisz komunikator?', mail: 'E-mail',
      stickyTxt: 'Bezpłatna wycena w 24 h',
      miniTitle: 'Bezpłatna wycena podobnego projektu', miniSub: 'Odpowiadamy w 24 godziny w dni robocze.',
      miniName: 'Imię', miniIdea: 'Czego potrzebujesz? (opcjonalnie)', miniOk: 'Dziękujemy! Odpowiemy w 24 godziny.', miniErr: 'Podaj imię i poprawny e-mail'
    },
    ru: {
      cta: 'Бесплатная оценка проекта', order: 'Получить оценку',
      h1: 'Сайты и приложения для бизнеса в Европе', h1a: 'за 4–8 недель',
      heroSub: 'Корпоративные сайты, интернет-магазины и мобильные приложения. Фиксированная цена и срок в договоре, оплата по этапам.',
      heroNote: 'Ответ за 24 часа · Оценка бесплатно · Без обязательств', heroAlt: 'Смотреть работы',
      svcLead: 'Выберите, что нужно. Объём, срок и цену оценим бесплатно.',
      s1d: '5–15 страниц, CMS, несколько языков. От […] € · 4–6 недель',
      s2d: 'Каталог, онлайн-оплата, доставка, админ-панель. От […] € · 6–10 недель',
      s3d: 'Одна страница, которая собирает заявки. От […] € · 2–3 недели',
      s4: 'Мобильное приложение (iOS и Android)', s4d: 'От идеи до App Store и Google Play. От […] € · от 8 недель',
      code: 'Прототип и дизайн до начала разработки. От […] €',
      seo: 'Технический аудит, исправления, Search Console и аналитика. От […] €',
      w4: 'Всё остаётся у вас', w4d: 'Передаём код, макеты и доступы ко всем аккаунтам',
      w5: 'Поддержка после запуска', w5d: 'Исправляем ошибки после запуска и помогаем с обновлениями',
      w6: 'Один контактный человек', w6d: 'Менеджер проекта говорит на русском, украинском, польском и английском',
      proofTitle: 'Результаты наших клиентов',
      p1n: '189', p1t: 'клиентов пользуются приложением Normobaria вместо бумажных абонементов',
      p2n: '24/7', p2t: 'онлайн-бронирование на сайте Aquila Hotel',
      p3n: '3', p3t: 'языка на сайте салонов Joy Lab',
      p4n: '4', p4t: 'языка, на которых работаем: RU, UA, PL, EN',
      revTitle: 'Что говорят клиенты', revPh: 'Место для настоящего отзыва клиента (Aquila Hotel, Joy Lab, Normobaria)', revWho: 'Имя, должность, компания',
      howTitle: 'Как мы работаем',
      h1t: 'Бесплатный звонок 30 минут', h1d: 'Обсуждаем цель, аудиторию и бюджет.',
      h2t: 'Оценка за 2 рабочих дня', h2d: 'Объём, срок и фиксированная цена письменно.',
      h3t: 'Дизайн и разработка', h3d: 'Каждую неделю показываем результат, оплата по этапам.',
      h4t: 'Запуск и поддержка', h4d: 'Публикуем, подключаем аналитику и остаёмся на связи.',
      fTitle: 'Бесплатная оценка проекта', fSub: 'Коротко опишите задачу. Ответим за 24 часа в рабочие дни. Без обязательств.',
      fPhone: 'Телефон (необязательно)', fIdea: 'Что нужно сделать? Сайт, магазин, приложение: достаточно пары слов',
      badPhone: 'Проверьте номер: 7–15 цифр',
      consent: 'Отправляя форму, вы соглашаетесь на обработку данных, чтобы мы ответили на заявку.', privacy: 'Политика конфиденциальности',
      alt: 'Удобнее в мессенджере?', mail: 'Почта',
      stickyTxt: 'Оценка проекта бесплатно за 24 ч',
      miniTitle: 'Бесплатная оценка похожего проекта', miniSub: 'Ответим за 24 часа в рабочие дни.',
      miniName: 'Ваше имя', miniIdea: 'Что нужно сделать? (необязательно)', miniOk: 'Спасибо! Ответим в течение 24 часов.', miniErr: 'Введите имя и правильный email'
    },
    ua: {
      cta: 'Безкоштовна оцінка проєкту', order: 'Отримати оцінку',
      h1: 'Сайти та застосунки для бізнесу в Європі', h1a: 'за 4–8 тижнів',
      heroSub: 'Корпоративні сайти, інтернет-магазини та мобільні застосунки. Фіксована ціна і строк у договорі, оплата етапами.',
      heroNote: 'Відповідь за 24 години · Оцінка безкоштовно · Без зобов’язань', heroAlt: 'Дивитися роботи',
      svcLead: 'Оберіть, що потрібно. Обсяг, строк і ціну оцінимо безкоштовно.',
      s1d: '5–15 сторінок, CMS, кілька мов. Від […] € · 4–6 тижнів',
      s2d: 'Каталог, онлайн-оплата, доставка, адмін-панель. Від […] € · 6–10 тижнів',
      s3d: 'Одна сторінка, яка збирає заявки. Від […] € · 2–3 тижні',
      s4: 'Мобільний застосунок (iOS і Android)', s4d: 'Від ідеї до App Store і Google Play. Від […] € · від 8 тижнів',
      code: 'Прототип і дизайн до початку розробки. Від […] €',
      seo: 'Технічний аудит, виправлення, Search Console та аналітика. Від […] €',
      w4: 'Усе залишається у вас', w4d: 'Передаємо код, макети та доступи до всіх акаунтів',
      w5: 'Підтримка після запуску', w5d: 'Виправляємо помилки після запуску й допомагаємо з оновленнями',
      w6: 'Одна контактна особа', w6d: 'Менеджер проєкту говорить українською, польською, англійською та російською',
      proofTitle: 'Результати наших клієнтів',
      p1n: '189', p1t: 'клієнтів користуються застосунком Normobaria замість паперових абонементів',
      p2n: '24/7', p2t: 'онлайн-бронювання на сайті Aquila Hotel',
      p3n: '3', p3t: 'мови на сайті салонів Joy Lab',
      p4n: '4', p4t: 'мови, якими працюємо: UA, PL, EN, RU',
      revTitle: 'Що кажуть клієнти', revPh: 'Місце для справжнього відгуку клієнта (Aquila Hotel, Joy Lab, Normobaria)', revWho: 'Ім’я, посада, компанія',
      howTitle: 'Як ми працюємо',
      h1t: 'Безкоштовний дзвінок 30 хвилин', h1d: 'Обговорюємо мету, аудиторію та бюджет.',
      h2t: 'Оцінка за 2 робочі дні', h2d: 'Обсяг, строк і фіксована ціна письмово.',
      h3t: 'Дизайн і розробка', h3d: 'Щотижня показуємо результат, оплата етапами.',
      h4t: 'Запуск і підтримка', h4d: 'Публікуємо, підключаємо аналітику й залишаємося на зв’язку.',
      fTitle: 'Безкоштовна оцінка проєкту', fSub: 'Коротко опишіть задачу. Відповімо за 24 години в робочі дні. Без зобов’язань.',
      fPhone: 'Телефон (необов’язково)', fIdea: 'Що потрібно зробити? Сайт, магазин, застосунок: достатньо кількох слів',
      badPhone: 'Перевірте номер: 7–15 цифр',
      consent: 'Надсилаючи форму, ви погоджуєтеся на обробку даних, щоб ми відповіли на заявку.', privacy: 'Політика конфіденційності',
      alt: 'Зручніше в месенджері?', mail: 'Пошта',
      stickyTxt: 'Оцінка проєкту безкоштовно за 24 год',
      miniTitle: 'Безкоштовна оцінка схожого проєкту', miniSub: 'Відповімо за 24 години в робочі дні.',
      miniName: 'Ваше ім’я', miniIdea: 'Що потрібно зробити? (необов’язково)', miniOk: 'Дякуємо! Відповімо протягом 24 годин.', miniErr: 'Введіть ім’я та правильний email'
    }
  };
  Object.keys(T).forEach(function (l) { if (I18N[l]) Object.assign(I18N[l], T[l]); });
  function t(k) { return (T[lang] && T[lang][k]) || T.en[k] || ''; }

  function el(tag, cls, key, parent) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (key) { n.setAttribute('data-t', key); n.textContent = t(key); }
    if (parent) parent.appendChild(n);
    return n;
  }
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var WA = 'https://wa.me/48573335979', TG = 'https://t.me/+48573335979', MAIL = 'mailto:sales@vectrumspace.eu';

  /* ---------- home page ---------- */
  var home = $('#homeView');
  if (home) {
    // hero: promise under the button and a second, quieter way into the page
    var heroWrap = $('.hero .wrap');
    var heroBtn = $('.btn', heroWrap);
    var row = el('div', 'v2-hero-actions');
    heroBtn.parentNode.insertBefore(row, heroBtn);
    row.appendChild(heroBtn);
    var see = el('a', 'v2-ghost', 'heroAlt', row); see.href = '#portfolio';
    el('p', 'v2-hero-note', 'heroNote', heroWrap);

    // services: own description for every card, no repeats of "Why us"
    var cards = $$('#services .grid3 .item p');
    ['s1d', 's2d', 's3d', 's4d', 'code', 'seo'].forEach(function (k, i) { if (cards[i]) cards[i].setAttribute('data-t', k); });
    var s4 = $('#services [data-t="s4"]'); // "Progress reporting" becomes the mobile app card
    if (s4) s4.closest('.item').classList.add('v2-svc-app');

    // why us: 004–006 no longer repeat the services
    [['w4', 'w4d'], ['w5', 'w5d'], ['w6', 'w6d']].forEach(function (p, i) {
      var item = $$('#benefits .grid3 .item')[3 + i]; if (!item) return;
      item.querySelector('h3').setAttribute('data-t', p[0]);
      item.querySelector('p').setAttribute('data-t', p[1]);
    });

    // portfolio: finished client work first, "In development" last
    var grid = $('.pgrid');
    if (grid) {
      var by = function (name) { return $$('.pcard', grid).filter(function (c) { return c.querySelector('h3').textContent.trim() === name; })[0]; };
      ['Aquila Hotel', 'Joy Lab', 'Normobaria', 'Vectrum Space'].forEach(function (n) { var c = by(n); if (c) grid.appendChild(c); });
    }

    // proof: real numbers from the projects + review placeholders
    var proof = document.createElement('section');
    proof.className = 'sec v2-proof';
    proof.innerHTML = '<div class="wrap"></div>';
    var pw = proof.firstChild;
    el('h2', 'h2 center', 'proofTitle', pw);
    var facts = el('div', 'v2-facts', null, pw);
    [1, 2, 3, 4].forEach(function (i) {
      var f = el('div', 'v2-fact', null, facts);
      el('b', '', 'p' + i + 'n', f); el('span', '', 'p' + i + 't', f);
    });
    el('h3', 'v2-sub', 'revTitle', pw);
    var revs = el('div', 'v2-reviews', null, pw);
    [1, 2].forEach(function () {
      var r = el('figure', 'v2-review', null, revs);
      el('blockquote', '', 'revPh', r); el('figcaption', '', 'revWho', r);
    });
    $('#portfolio').after(proof);

    // how we work: what happens after the click
    var how = document.createElement('section');
    how.className = 'sec v2-how';
    how.innerHTML = '<div class="wrap"></div>';
    var hw = how.firstChild;
    el('h2', 'h2 center', 'howTitle', hw);
    var steps = el('ol', 'v2-steps', null, hw);
    [1, 2, 3, 4].forEach(function (i) {
      var li = el('li', '', null, steps);
      el('span', 'v2-step-n', null, li).textContent = '0' + i;
      el('h3', '', 'h' + i + 't', li); el('p', '', 'h' + i + 'd', li);
    });
    $('#contacts').before(how);

    // form: consent + other ways to reach us
    var form = $('#form');
    var lbl = $('label[for="email"]'); if (lbl) lbl.textContent = 'Email *';
    form.classList.add('v2-form');
    var after = el('div', 'v2-form-after');
    form.appendChild(after);
    var consent = el('p', 'v2-consent', null, after);
    el('span', '', 'consent', consent); consent.appendChild(document.createTextNode(' '));
    var pl = el('a', '', 'privacy', consent); pl.href = '/__demo/privacy.html'; pl.target = '_blank';
    var alt = el('p', 'v2-alt', null, after);
    el('span', '', 'alt', alt);
    [['WhatsApp', WA], ['Telegram', TG], [null, MAIL]].forEach(function (c) {
      var a = el('a', '', c[0] ? null : 'mail', alt); a.href = c[1];
      if (c[0]) { a.textContent = c[0]; a.target = '_blank'; a.rel = 'noopener'; }
    });
  }

  /* ---------- service and project pages: same CTA text + a short form right there ---------- */
  $$('.dev-service-cta').forEach(function (a) { a.firstChild.textContent = t('cta'); a.setAttribute('data-v2-cta', ''); });
  var spot = $('.dev-service-contact') || $('.proj-cta');
  if (spot) {
    var mini = document.createElement('form');
    mini.className = 'v2-mini'; mini.noValidate = true;
    el('h3', '', 'miniTitle', mini); el('p', 'v2-mini-sub', 'miniSub', mini);
    var fields = el('div', 'v2-mini-row', null, mini);
    [['name', 'text', 'miniName', 'name'], ['email', 'email', null, 'email'], ['idea', 'text', 'miniIdea', 'off']].forEach(function (f) {
      var lab = el('label', 'v2-mini-field', null, fields);
      var s = el('span', '', f[2], lab); if (!f[2]) s.textContent = 'Email';
      var inp = el('input', '', null, lab); inp.name = f[0]; inp.type = f[1]; inp.autocomplete = f[3];
      if (f[0] !== 'idea') inp.required = true;
    });
    var b = el('button', 'btn', 'cta', mini); b.type = 'submit';
    el('p', 'v2-mini-status', null, mini).setAttribute('role', 'status');
    spot.appendChild(mini);
  }

  /* ---------- after main.js ---------- */
  function track(name, data) {
    // events for GA4 / Clarity once a tag is added; in the copy they are only logged
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name, lang: path }, data || {}));
    if (window.clarity) window.clarity('event', name);
    console.info('[v2 event]', name, data || '');
  }
  window.__v2track = track;

  document.addEventListener('DOMContentLoaded', function () {
    // sticky CTA on phones: shown after the hero, hidden while the form is on screen
    var target = home ? '#contacts' : '/' + path + '/#contacts';
    var bar = el('div', 'v2-sticky');
    el('span', '', 'stickyTxt', bar);
    var sb = el('a', 'btn', 'cta', bar); sb.href = target; sb.setAttribute('data-v2-cta', 'sticky');
    document.body.appendChild(bar);
    var hero = $('.hero') || $('.dev-service-hero') || $('.proj-head'), form = $('#contacts') || $('.v2-mini');
    var heroOut = false, formIn = false;
    function sync() { bar.classList.toggle('on', heroOut && !formIn); }
    if ('IntersectionObserver' in window) {
      if (hero) new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; sync(); }).observe(hero); else heroOut = true;
      if (form) new IntersectionObserver(function (e) { formIn = e[0].isIntersecting; sync(); }).observe(form);
    }

    // funnel events: which button was clicked, form started, form sent
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#contacts"], [data-v2-cta]');
      if (a) track('cta_click', { where: a.getAttribute('data-v2-cta') || (a.closest('header') ? 'header' : a.closest('.hero') ? 'hero' : a.closest('.mmenu') ? 'menu' : 'page') });
    });
    $$('#form, .v2-mini').forEach(function (f) {
      f.addEventListener('focusin', function once() { f.removeEventListener('focusin', once); track('form_start', { form: f.id || 'mini' }); });
    });
    var status = $('#form [role="status"]');
    if (status) new MutationObserver(function () {
      if (status.textContent && !/sales@/.test(status.textContent)) track('form_sent', { form: 'main' });
    }).observe(status, { childList: true });

    // short form: same endpoint as the main one (in the copy it stores nothing)
    var m = $('.v2-mini');
    if (m) m.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = $('.v2-mini-status', m), name = m.elements.name.value.trim(), email = m.elements.email.value.trim();
      if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { st.textContent = t('miniErr'); st.className = 'v2-mini-status err'; return; }
      fetch('/api/public/dev/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, email: email, phone: '', message: m.elements.idea.value.trim(), language: lang, attribution: { landingPath: location.pathname } }) })
        .then(function (r) { if (!r.ok) throw 0; m.reset(); st.textContent = t('miniOk'); st.className = 'v2-mini-status ok'; track('form_sent', { form: 'mini' }); })
        .catch(function () { st.textContent = 'sales@vectrumspace.eu'; st.className = 'v2-mini-status err'; });
    });
  });
})();
