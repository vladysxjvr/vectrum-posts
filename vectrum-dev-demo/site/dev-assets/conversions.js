/* Basic consent mode: no Google request before an explicit measurement choice. */
(function () {
  'use strict';
  var tag = 'AW-18569283019', destination = tag + '/ErcZCPryn7YdEMuLw5ZF';
  var key = 'vd-ad-measurement-v1', lifetime = 180 * 86400000;
  var granted = false, loaded = false, sent = new Set();
  var copy = {
    en: ['Advertising measurement', 'With your permission, Google Ads uses cookies to connect an ad click with a successfully sent enquiry. Google receives a random enquiry ID, not your name, phone, email or message. Refusing does not affect the contact form. We do not enable personalised advertising.', 'Allow measurement', 'Decline', 'Cookie settings', 'Your choice is saved on this device for up to 180 days. You can change it at any time using Cookie settings. Google processes technical device information and advertising identifiers.', 'Google privacy information', 'Close'],
    pl: ['Pomiar reklam', 'Za Twoją zgodą Google Ads używa plików cookie, aby powiązać kliknięcie reklamy z poprawnie wysłanym zapytaniem. Google otrzymuje losowy identyfikator zapytania, bez imienia, telefonu, adresu e-mail i treści wiadomości. Odmowa nie wpływa na formularz kontaktowy. Nie włączamy reklam spersonalizowanych.', 'Zezwól na pomiar', 'Odmów', 'Ustawienia plików cookie', 'Wybór zapisujemy na tym urządzeniu na maksymalnie 180 dni. Możesz go zmienić w ustawieniach plików cookie. Google przetwarza informacje techniczne urządzenia i identyfikatory reklamowe.', 'Informacje Google o prywatności', 'Zamknij'],
    ru: ['Измерение рекламы', 'С вашего согласия Google Ads использует cookie, чтобы связать переход по рекламе с успешно отправленной заявкой. Google получает случайный идентификатор заявки без имени, телефона, email и текста сообщения. Отказ не влияет на форму связи. Персонализированная реклама отключена.', 'Разрешить измерение', 'Отказать', 'Настройки cookie', 'Выбор сохраняется на этом устройстве до 180 дней. Его можно изменить в настройках cookie. Google обрабатывает техническую информацию устройства и рекламные идентификаторы.', 'Информация Google о конфиденциальности', 'Закрыть'],
    uk: ['Вимірювання реклами', 'За вашою згодою Google Ads використовує cookie, щоб пов’язати перехід із реклами з успішно надісланою заявкою. Google отримує випадковий ідентифікатор заявки без імені, телефону, email і тексту повідомлення. Відмова не впливає на форму зв’язку. Персоналізовану рекламу вимкнено.', 'Дозволити вимірювання', 'Відмовити', 'Налаштування cookie', 'Вибір зберігається на цьому пристрої до 180 днів. Його можна змінити в налаштуваннях cookie. Google обробляє технічну інформацію пристрою та рекламні ідентифікатори.', 'Інформація Google про конфіденційність', 'Закрити']
  }[document.documentElement.lang] || null;
  if (!copy) return;
  function readChoice() {
    try {
      var value = JSON.parse(localStorage.getItem(key));
      if (value && typeof value.allowed === 'boolean' && Number.isFinite(value.at) && value.at <= Date.now() && Date.now() - value.at < lifetime) return value.allowed;
    } catch (_) {}
    return null;
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  function consent(allowed) {
    return { ad_storage: allowed ? 'granted' : 'denied', ad_user_data: allowed ? 'granted' : 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };
  }
  gtag('consent', 'default', consent(false));
  function measurementUrl() {
    var url = new URL(location.origin + location.pathname);
    var original = new URL(location.href);
    ['gclid', 'gclsrc', 'wbraid', 'gbraid'].forEach(function (name) {
      var value = original.searchParams.get(name);
      if (value && /^[A-Za-z0-9_.-]{1,512}$/.test(value)) url.searchParams.set(name, value);
    });
    return url.href;
  }
  function load() {
    if (loaded) return;
    loaded = true;
    gtag('js', new Date());
    gtag('set', 'ads_data_redaction', true);
    var referrer = '';
    try { referrer = new URL(document.referrer).origin; } catch (_) {}
    gtag('config', tag, {
      send_page_view: false, allow_ad_personalization_signals: false, allow_google_signals: false,
      page_location: measurementUrl(), page_referrer: referrer
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + tag;
    document.head.appendChild(script);
  }
  // Only an accepted server submission may call this; a button click is not a lead.
  window.VectrumAds = { recordLead: function (id) {
    if (!granted || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) || sent.has(id)) return;
    sent.add(id);
    gtag('event', 'conversion', { send_to: destination, transaction_id: id });
  }};
  function element(tagName, text, parent) {
    var node = document.createElement(tagName);
    if (text) node.textContent = text;
    if (parent) parent.appendChild(node);
    return node;
  }
  var panel = element('section', '', document.body);
  panel.id = 'vd-consent'; panel.className = 'vd-consent';
  panel.setAttribute('aria-labelledby', 'vd-consent-title');
  var title = element('h2', copy[0], panel); title.id = 'vd-consent-title';
  element('p', copy[1], panel);
  var details = element('details', '', panel);
  element('summary', copy[4], details);
  element('p', copy[5], details);
  var privacy = element('a', copy[6], details);
  privacy.href = 'https://policies.google.com/technologies/partner-sites?hl=' + document.documentElement.lang;
  privacy.target = '_blank'; privacy.rel = 'noopener noreferrer';
  var actions = element('div', '', panel); actions.className = 'vd-consent-actions';
  var allow = element('button', copy[2], actions), decline = element('button', copy[3], actions);
  allow.type = decline.type = 'button';
  var close = element('button', copy[7], actions); close.type = 'button';
  var settings = element('button', copy[4], document.querySelector('footer .wrap') || document.querySelector('footer') || document.body);
  settings.type = 'button'; settings.className = 'vd-consent-settings';
  settings.setAttribute('aria-controls', panel.id); settings.setAttribute('aria-expanded', 'false');
  var choice = readChoice();
  panel.hidden = choice !== null; close.hidden = choice === null;
  function choose(allowed) {
    var revoke = loaded && !allowed;
    granted = allowed;
    try { localStorage.setItem(key, JSON.stringify({ allowed: allowed, at: Date.now() })); } catch (_) {}
    gtag('consent', 'update', consent(allowed));
    if (allowed) load();
    panel.hidden = true; close.hidden = false; settings.setAttribute('aria-expanded', 'false');
    settings.focus();
    // Stop an already loaded Google library after withdrawal, including on other tabs.
    if (revoke) location.reload();
  }
  allow.addEventListener('click', function () { choose(true); });
  decline.addEventListener('click', function () { choose(false); });
  settings.addEventListener('click', function () {
    panel.hidden = false; settings.setAttribute('aria-expanded', 'true'); allow.focus();
  });
  close.addEventListener('click', function () { panel.hidden = true; settings.setAttribute('aria-expanded', 'false'); settings.focus(); });
  window.addEventListener('storage', function (event) {
    if (event.key !== key && event.key !== null) return;
    if (readChoice() !== granted) location.reload();
  });
  if (choice === true) { granted = true; gtag('consent', 'update', consent(true)); load(); }
}());
