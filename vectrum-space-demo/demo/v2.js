/* v2 test version of the home page: what an owner of a transport company needs before buying.
   - "Было → Стало" replaces the "Платформа · Всё работает вместе" band with the AI slider
   - "ИИ-помощник" right after it: chat, background alerts, one link between departments
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
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
    bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    link: '<circle cx="5" cy="12" r="2.5"/><circle cx="19" cy="5" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M7.3 11 16.7 6.1M7.3 13l9.4 4.9"/>',
    spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    support: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
  };
  const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  const T = {
    ru: {
      ba: {
        eyebrow: 'Один рабочий день', title: ['Меньше звонков и таблиц', 'Больше перевозок'],
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
          ['Любой вопрос — к логисту', 'Где груз, какая машина свободна, кто в рейсе — ответ ищут по таблицам и звонкам.',
           'Спросите ИИ-помощника', 'Ответит про груз и машину, назначит рейс и заранее предупредит о проблеме.'],
          ['Счёт уходит через неделю', 'Бухгалтерия ждёт документы, деньги приходят позже.',
           'Счёт в день выгрузки', 'Все данные по рейсу уже в системе, счёт формируется сразу.'],
        ],
        stats: [['<em>1</em> система', 'вместо почты, Excel, мессенджеров и отдельного трекинга'],
                ['<em>0</em> лишних звонков', '«где машина?»: позиция и время прибытия видны всей команде'],
                ['Счёт <em>в день</em> выгрузки', 'документы рейса собираются в заказе, пока машина в пути']],
      },
      ai: {
        eyebrow: 'ИИ-помощник', title: ['ИИ, который связывает', 'всю компанию'],
        lead: 'Помощник видит заказы, машины, водителей, сервис и финансы. Он работает со всеми отделами сразу: отвечает на вопросы, выполняет действия и замечает проблемы раньше вас.',
        items: [
          ['chat', 'Чат с ИИ', 'Спросите про груз или машину, попросите назначить машину на заказ или сделать другое действие. Помощник выполнит его в системе.'],
          ['bell', 'Следит в фоне', 'Предупреждает за несколько дней: у машины заканчивается техосмотр, вес загрузки превышает допустимые нормы и другие риски по рейсам.'],
          ['link', 'Связывает отделы', 'Логист, механик, бухгалтерия и владелец работают с одними данными. ИИ видит всю картину и подсказывает каждому своё.'],
        ],
        chatName: 'Vectrum AI', chatNote: 'Пример диалога',
        chat: [
          ['me', 'Какая машина свободна завтра на загрузку в Кракове?'],
          ['ai', 'Свободны две: <b>WE 4821K</b> (тент, 24 т) и <b>KR 7730P</b> (рефрижератор). Назначить WE 4821K на заказ #2148?'],
          ['me', 'Да, назначь'],
          ['ai', 'Готово. Водитель уже видит заказ в приложении.'],
        ],
        alerts: ['Через 5 дней заканчивается техосмотр у KR 7730P', 'Заказ #2151: 25,4 т — больше допустимого для прицепа (24 т)'],
      },
      launch: {
        eyebrow: 'Внедрение', title: ['Запуск за 7 дней', 'Без остановки перевозок'],
        lead: 'Переход идёт параллельно с текущей работой. Поможем перенести данные и обучить команду.',
        steps: [
          ['День 1', 'Регистрация', 'Создаём вашу компанию в системе, настраиваем доступы и приглашаем сотрудников. Каждый получает права в соответствии со своей ролью: логист, водитель или бухгалтер.'],
          ['Дни 1–2', 'Перенос данных', 'Переносим в систему данные об автомобилях, прицепах, водителях и клиентах из Excel. Никакого ручного ввода — всё подготовим за вас.'],
          ['Дни 2–5', 'Подключение оборудования', 'Подключаем GPS-трекеры и тахографы, настраиваем обмен данными. Водители устанавливают приложение Vectrum Driver и готовятся к работе.'],
          ['До 7-го дня', 'Обучение и запуск', 'Обучаем логистов и водителей работе с системой. Помогаем организовать первые рейсы и сопровождаем вашу команду на старте.'],
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
        note: 'Расчёт ориентировочный: 22 рабочих дня в месяце, цена за машину в месяц по уровню автопарка, без НДС.',
        cta: 'Попробовать бесплатно',
        tiers: 'Цена за машину по размеру автопарка', perVeh: '/ машина', custom: 'Индивидуально',
        customNote: 'Для автопарка больше 200 машин условия считаем индивидуально. Напишите нам — подготовим предложение.', contact: 'Связаться с нами',
      },
      more: 'Посмотреть, как это работает',
      how: {
        doc: 'Как работает Vectrum Space', eyebrow: 'Как это работает', title: ['Vectrum', 'изнутри'],
        lead: 'Настоящие экраны платформы. Так выглядит рабочий день логиста, механика и владельца: от заказа и карты до сервиса и цифр компании.',
        note: 'Экраны сняты на демо-данных: имена, компании и номера машин выдуманы. Интерфейс показан на английском, в платформе доступны и другие языки, в том числе русский.', navTitle: 'Разделы',
        ctaTitle: ['Хотите увидеть', 'на своих данных?'], ctaLead: 'Покажем Vectrum на примере вашего автопарка и поможем перенести машины, водителей и клиентов.',
        start: 'Начать бесплатно', demo: 'Записаться на демо',
        steps: [
          ['tracking', 'Трекинг', ['Вся перевозка', 'на одной карте'], 'Заказы слева, машины и маршрут на карте справа. Выбираете заказ и видите, где машина, сколько осталось ехать и кто за рулём.',
            ['Маршрут и расстояние с учётом грузовых ограничений', 'Статусы заказов: в пути, загрузка, задержка', 'Чат и звонок водителю прямо из карточки заказа']],
          ['orders', 'Заказы TMS', ['Что требует внимания', 'сегодня'], 'Сводка показывает, сколько перевозок в работе, какие задерживаются и какие ждут назначения. Блок «Требуют внимания» подсказывает, с чего начать день.',
            ['Просроченные доставки и устаревшая телеметрия', 'Последние перевозки с клиентом и статусом', 'ИИ-импорт заказа вместо ручного ввода']],
          ['planning', 'Планирование', ['Неделя автопарка', 'в одном календаре'], 'По строкам машины и водители, по столбцам дни. Сразу видно, кто свободен, где конфликт расписания и какие заказы остались без машины.',
            ['Вид на неделю, месяц или списком', 'Очередь заказов без машины или времени', 'Счётчики: требуют назначения, задерживаются, конфликты']],
          ['fleet', 'Флот', ['Карточка', 'каждой машины'], 'Состояние всего флота: статус, текущий рейс, груз и полуприцеп. В карточке машины назначенный водитель, ответственный диспетчер, документы и расчёты.',
            ['Фильтры: активные, в сервисе, неисправные', 'Документы и расчёты по машине', 'Звонок водителю из карточки']],
          ['maintenance', 'Обслуживание', ['Сервис, о котором', 'не нужно помнить'], 'Техосмотр, страховка и плановое обслуживание по каждой машине. Критичные сроки подсвечены красным, а сервисная задача создаётся прямо из предупреждения.',
            ['Очередь сервиса и ближайшие сроки', 'Коды диагностики (DTC)', 'Сервисная задача в один клик']],
          ['analytics', 'Аналитика', ['Цифры компании', 'без Excel'], 'Сколько машин в рейсе, свободно и на сервисе, сколько заказов открыто и закрыто. Финансовый обзор показывает фрахт и маржу по каждой машине за любой период.',
            ['Операционные показатели по всему автопарку', 'Фрахт и маржа по машинам', 'Экспорт в CSV и финансовые отчёты']],
        ],
      },
      trial: ['Бесплатный период', 'Без привязки карты', 'Помесячная оплата, отмена в любой момент'],
      trust: {
        eyebrow: 'Безопасность', title: ['Ваши данные', 'под защитой'],
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
        eyebrow: 'One working day', title: ['Fewer calls and spreadsheets', 'More transport'],
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
          ['Every question goes to dispatch', 'Where the cargo is, which truck is free, who is on a trip: answers are found in sheets and calls.',
           'Ask the AI assistant', 'It answers about cargo and trucks, assigns trips and warns about problems in advance.'],
          ['The invoice goes out a week later', 'Accounting waits for documents, money comes in later.',
           'Invoice on the day of unloading', 'All trip data is already in the system, the invoice is ready at once.'],
        ],
        stats: [['<em>1</em> system', 'instead of e-mail, Excel, messengers and a separate tracker'],
                ['<em>0</em> extra calls', '“where is the truck?”: position and ETA are visible to the whole team'],
                ['Invoice <em>same day</em>', 'trip documents collect in the order while the truck is on the road']],
      },
      ai: {
        eyebrow: 'AI assistant', title: ['AI that connects', 'the whole company'],
        lead: 'The assistant sees orders, trucks, drivers, service and finance. It works with every department at once: answers questions, takes actions and spots problems before you do.',
        items: [
          ['chat', 'Chat with AI', 'Ask about cargo or a truck, ask it to assign a truck to an order or take another action. The assistant does it in the system.'],
          ['bell', 'Watches in the background', 'Warns days ahead: a vehicle inspection is about to expire, a load is over the permitted weight, and other trip risks.'],
          ['link', 'Connects departments', 'Dispatch, mechanics, accounting and the owner work with the same data. The AI sees the whole picture and tells each of them what matters.'],
        ],
        chatName: 'Vectrum AI', chatNote: 'Example conversation',
        chat: [
          ['me', 'Which truck is free tomorrow for loading in Kraków?'],
          ['ai', 'Two are free: <b>WE 4821K</b> (curtainsider, 24 t) and <b>KR 7730P</b> (reefer). Assign WE 4821K to order #2148?'],
          ['me', 'Yes, assign it'],
          ['ai', 'Done. The driver already sees the order in the app.'],
        ],
        alerts: ['Inspection of KR 7730P expires in 5 days', 'Order #2151: 25.4 t is over the trailer limit (24 t)'],
      },
      launch: {
        eyebrow: 'Onboarding', title: ['Live in 7 days', 'Without stopping your trucks'],
        lead: 'The switch runs alongside your current work. We help move your data and train the team.',
        steps: [
          ['Day 1', 'Sign up', 'We create your company in the system, set up access and invite your team. Everyone gets permissions that match their role: dispatcher, driver or accountant.'],
          ['Days 1–2', 'Data import', 'We move your vehicles, trailers, drivers and customers from Excel into the system. No manual typing — we prepare everything for you.'],
          ['Days 2–5', 'Hardware connection', 'We connect GPS trackers and tachographs and set up the data exchange. Drivers install the Vectrum Driver app and get ready to work.'],
          ['By day 7', 'Training and launch', 'We train dispatchers and drivers to work with the system, help organise the first trips and support your team at the start.'],
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
        note: 'Rough estimate: 22 working days a month, monthly price per vehicle by fleet size, VAT excluded.',
        cta: 'Try it free',
        tiers: 'Price per vehicle by fleet size', perVeh: '/ vehicle', custom: 'Custom',
        customNote: 'For fleets over 200 vehicles we set the terms individually. Write to us and we will prepare an offer.', contact: 'Contact us',
      },
      more: 'See how it works',
      how: {
        doc: 'How Vectrum Space works', eyebrow: 'How it works', title: ['Vectrum', 'from the inside'],
        lead: 'Real screens of the platform. This is a working day of a dispatcher, a mechanic and an owner: from the order and the map to service and company numbers.',
        note: 'Screens are taken on demo data: names, companies and plates are made up.', navTitle: 'Sections',
        ctaTitle: ['Want to see it', 'with your data?'], ctaLead: 'We will show Vectrum on your own fleet and help you move vehicles, drivers and customers.',
        start: 'Start for free', demo: 'Book a demo',
        steps: [
          ['tracking', 'Tracking', ['The whole trip', 'on one map'], 'Orders on the left, trucks and the route on the map. Pick an order and see where the truck is, how far it still goes and who is driving.',
            ['Route and distance with truck restrictions', 'Order status: on the road, loading, delayed', 'Chat and call the driver from the order card']],
          ['orders', 'TMS orders', ['What needs attention', 'today'], 'The overview shows how many trips are running, which are late and which wait for a truck. “Needs attention” tells you where to start the day.',
            ['Late deliveries and stale telemetry', 'Latest trips with customer and status', 'AI order import instead of typing']],
          ['planning', 'Planning', ['The fleet’s week', 'in one calendar'], 'Rows are trucks and drivers, columns are days. You see who is free, where the schedule clashes and which orders have no truck yet.',
            ['Week, month or list view', 'Queue of orders without a truck or time', 'Counters: to assign, delayed, conflicts']],
          ['fleet', 'Fleet', ['A card for', 'every vehicle'], 'The state of the whole fleet: status, current trip, cargo and trailer. The vehicle card holds the driver, the dispatcher, documents and costs.',
            ['Filters: active, in service, faulty', 'Documents and costs per vehicle', 'Call the driver from the card']],
          ['maintenance', 'Maintenance', ['Service you', 'don’t have to remember'], 'Inspection, insurance and planned service for every vehicle. Critical dates are red, and a service task is created right from the alert.',
            ['Service queue and upcoming dates', 'Diagnostic trouble codes (DTC)', 'Service task in one click']],
          ['analytics', 'Analytics', ['Company numbers', 'without Excel'], 'How many trucks are on the road, free and in service, how many orders are open and closed. The finance overview shows freight and margin per vehicle.',
            ['Operating figures for the whole fleet', 'Freight and margin per vehicle', 'CSV export and finance reports']],
        ],
      },
      trial: ['Free trial', 'No card required', 'Monthly billing, cancel any time'],
      trust: {
        eyebrow: 'Security', title: ['Your data,', 'protected'],
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
  // volume discount: the whole fleet pays the price of its tier, rounded to whole euros; over 200 is a custom offer
  const TIERS = [[1, 30, 0], [31, 100, .05], [101, 200, .10]], CUSTOM = 201;
  const tierOf = n => TIERS.findIndex(([a, b]) => n >= a && n <= b);
  const tierPrice = (plan, i) => Math.round(PRICES[plan] * (1 - TIERS[i][2]));

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

  // AI assistant: what it does on the left, an example chat with background alerts on the right
  function ai(x) {
    return el(`<section class="vs2" data-vs2="ai" id="ai-assistant">
      ${head(x.eyebrow, x.title, x.lead)}
      <div class="vs2-ai">
        <div class="vs2-ai-list">${x.items.map(([ic, h, p]) => `<article class="vs2-card"><span class="vs2-ico">${svg(ic)}</span>
          <div><h3>${h}</h3><p>${p}</p></div></article>`).join('')}</div>
        <div class="vs2-ai-chat vs2-card">
          <div class="vs2-ai-top"><span class="vs2-ico">${svg('spark')}</span><b>${x.chatName}</b><small>${x.chatNote}</small></div>
          <div class="vs2-ai-msgs">${x.chat.map(([who, m]) => `<p class="vs2-msg ${who}">${m}</p>`).join('')}</div>
          <div class="vs2-ai-alerts">${x.alerts.map(a => `<p>${svg('alert')}<span>${a}</span></p>`).join('')}</div>
        </div>
      </div>
    </section>`);
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
            <input class="vs2-range" id="vs2-fleet" type="range" min="1" max="${CUSTOM}" value="15">
            <div class="vs2-tiers" role="group" aria-label="${x.tiers}">${TIERS.map(([a, b, d], i) => `<button type="button" data-tier="${i}" data-n="${a}">
              <span>${a}–${b}</span><b data-tp="${i}"></b>${d ? `<em>−${d * 100}%</em>` : ''}</button>`).join('')}<button type="button" data-tier="custom" data-n="${CUSTOM}">
              <span>200+</span><b>${x.custom}</b></button></div></div>
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
          <a class="vs2-btn" data-o="cta" href="${REGISTER}">${x.cta}${svg('arrow')}</a>
          <a class="vs2-btn" data-o="contact" href="mailto:sales@vectrumspace.eu?subject=Vectrum%20Space%20200%2B" hidden>${x.contact}${svg('arrow')}</a>
        </div>
      </div>
    </section>`);
    const $ = q => s.querySelector(q), lang = document.documentElement.lang || 'en';
    const money = v => new Intl.NumberFormat(lang, { style: 'currency', currency: 'EUR', maximumFractionDigits: v < 10 ? 2 : 0 }).format(v);
    let plan = 'standard';
    const num = (q, d) => { const v = parseFloat($(q).value); return isFinite(v) && v >= 0 ? v : d; };
    const out = $('.vs2-calc-out');
    function update() {
      const n = +$('#vs2-fleet').value, custom = n >= CUSTOM, ti = custom ? -1 : tierOf(n);
      TIERS.forEach((_, i) => { $(`[data-tp="${i}"]`).textContent = money(tierPrice(plan, i)) + ' ' + x.perVeh; });
      s.querySelectorAll('[data-tier]').forEach(b => b.setAttribute('aria-pressed', b.dataset.tier === (custom ? 'custom' : String(ti))));
      $('#vs2-fleet-out').textContent = custom ? '200+' : n;
      out.classList.toggle('is-custom', custom);
      $('[data-o="cta"]').hidden = custom; $('[data-o="contact"]').hidden = !custom;
      if (custom) { $('[data-o="cost"]').textContent = x.custom; $('[data-o="even"]').textContent = x.customNote; return; }
      const price = tierPrice(plan, ti), min = num('#vs2-min', 10), rate = num('#vs2-rate', 20) || 20;
      const cost = n * price, hours = n * min * 22 / 60;
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
    // a tier button moves the slider to the start of that tier
    s.querySelectorAll('[data-tier]').forEach(b => b.addEventListener('click', () => { $('#vs2-fleet').value = b.dataset.n; update(); }));
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

  // /how-it-works: the About page shell (server.js) with its sections hidden; the screens go under the site's own header
  function howPage(x) {
    const s = el(`<div class="vs2h" data-vs2="how">
      <section class="vs2 vs2h-hero"><span class="vs2-eyebrow">${x.eyebrow}</span><h1>${x.title[0]} <em>${x.title[1]}</em></h1>
        <p class="vs2-lead">${x.lead}</p><p class="vs2h-note">${x.note}</p></section>
      <div class="vs2h-body">
        <nav class="vs2h-nav" aria-label="${x.navTitle}"><span>${x.navTitle}</span>
          ${x.steps.map(([id, tag], i) => `<a href="#${id}"><b>0${i + 1}</b>${tag}</a>`).join('')}</nav>
        <div class="vs2h-steps">${x.steps.map(([id, tag, h, p, li], i) => `
          <section class="vs2h-step" id="${id}">
            <div class="vs2h-copy"><div><span class="vs2-step-num">0${i + 1}</span><span class="vs2-step-day">${tag}</span><h2>${h[0]} <em>${h[1]}</em></h2></div>
              <div><p>${p}</p><ul>${li.map(t => `<li>${svg('check')}<span>${t}</span></li>`).join('')}</ul></div></div>
            <figure class="vs2h-shot" data-src="/__demo/how/${id}.jpg"><div class="vs2h-bar"><i></i><i></i><i></i></div>
              <img src="/__demo/how/${id}.jpg" alt="${tag}" width="1568" height="778" decoding="async"></figure>
          </section>`).join('')}</div>
      </div>
      <section class="vs2 vs2h-cta"><div class="vs2-card">
        <h2>${x.ctaTitle[0]} <em>${x.ctaTitle[1]}</em></h2><p>${x.ctaLead}</p>
        <div><a class="vs2-btn" href="${REGISTER}">${x.start}${svg('arrow')}</a><a class="vs2-btn ghost" href="mailto:sales@vectrumspace.eu?subject=Demo%20Vectrum%20Space">${x.demo}</a></div>
      </div></section>
      <div class="vs2h-zoom" hidden><img alt=""></div>
    </div>`);
    // the section in view is highlighted in the side menu
    const links = [...s.querySelectorAll('.vs2h-nav a')];
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
    }), { rootMargin: '-35% 0px -60% 0px' });
    s.querySelectorAll('.vs2h-step').forEach(st => spy.observe(st));
    links[0].classList.add('on');
    // a screen opens full size on click, Esc or a click closes it
    const zoom = s.querySelector('.vs2h-zoom');
    s.addEventListener('click', e => {
      const f = e.target.closest('.vs2h-shot');
      if (f) { zoom.firstElementChild.src = f.dataset.src; zoom.hidden = false; } else if (e.target.closest('.vs2h-zoom')) zoom.hidden = true;
    });
    addEventListener('keydown', e => { if (e.key === 'Escape') zoom.hidden = true; });
    return s;
  }

  function mountHow() {
    const main = document.querySelector('main'), hero = main && main.querySelector(':scope > [class*="__heroSurface"]');
    if (!hero) return;
    const lang = document.documentElement.lang, x = t().how;
    document.title = x.doc;
    if (main.dataset.vs2 === 'how-' + lang && main.querySelector('[data-vs2="how"]')) return;
    main.querySelectorAll('[data-vs2]').forEach(n => n.remove());
    main.dataset.vs2 = 'how-' + lang;
    hero.after(howPage(x));
    if (location.hash) { const target = document.getElementById(location.hash.slice(1)); if (target) target.scrollIntoView(); }
  }

  function mount() {
    if (location.pathname === '/how-it-works') return mountHow();
    // client-side navigation left /how-it-works: its "hide the About sections" style must not stay
    const hs = document.getElementById('vs2-how-style'); if (hs) hs.remove();
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
    const ba = beforeAfter(x.ba);
    band.after(ba);
    ba.after(ai(x.ai));
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
