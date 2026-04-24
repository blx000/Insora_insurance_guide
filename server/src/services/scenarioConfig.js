import { loadPrototypeSnapshot } from '../../content/loadSnapshot.js'

const { PRODUCT_ORDER, PRODUCTS, NS_RESULTS } = loadPrototypeSnapshot()

const NS_FLOW = ['Риск', 'Событие', 'Подтверждение', 'Выплата']

const option = (value, label, meta = {}) => ({
  value,
  label,
  ...meta,
})

const question = (key, title, options) => ({
  key,
  title,
  options,
})

const HERO_TONES = {
  light: {
    happened: 'Похоже, это более мягкий сценарий, но разобрать его всё равно полезно.',
    checking: 'Это спокойный пример, чтобы заранее понять базовую логику продукта.',
  },
  medium: {
    happened: 'Это уже более заметная ситуация — здесь важны подтверждение и порядок действий.',
    checking: 'Это наглядный средний сценарий: на нём хорошо видно, зачем продукт нужен заранее.',
  },
  strong: {
    happened: 'Это уже серьёзный сценарий — тут особенно важны помощь, документы и следующий шаг.',
    checking: 'Это сильный пример, где польза продукта считывается особенно ясно ещё заранее.',
  },
}

const SPORT_INJURY_OPTIONS = [
  option('bruise', 'Ушиб', {
    level: 'light',
    amount: '18 000–28 000 ₽',
    note: 'Более лёгкий спортивный сценарий обычно даёт меньший диапазон выплаты.',
    focus: 'более лёгкую, но всё равно подтверждённую спортивную травму',
    support:
      'обычно требует спокойной фиксации события, документов и понимания, что именно написано в условиях',
  }),
  option('sprain', 'Растяжение', {
    level: 'medium',
    amount: '28 000–45 000 ₽',
    note: 'Средний по тяжести сценарий уже лучше показывает практическую пользу полиса.',
    focus: 'среднюю по тяжести травму, где особенно важны осмотр и описание ситуации',
    support:
      'сильнее зависит от того, как подтверждена травма и насколько понятна сама спортивная ситуация',
  }),
  option('dislocation', 'Вывих', {
    level: 'strong',
    amount: '45 000–65 000 ₽',
    note: 'Более серьёзная травма обычно выглядит как более сильный и наглядный страховой сценарий.',
    focus: 'уже заметную и серьёзную травму, где продукт выглядит особенно понятным',
    support:
      'обычно сильнее завязан на тяжесть травмы, документы и чёткую фиксацию того, что произошло',
  }),
]

const SPORT_INTENSITY_OPTIONS = [
  option('light', 'Лёгкая травма', {
    level: 'light',
    amount: '20 000–30 000 ₽',
    note: 'Лёгкий соревновательный сценарий обычно выглядит как более мягкий пример по сумме.',
    focus: 'более мягкий соревновательный сценарий',
    support:
      'больше зависит от того, как быстро и понятно описали саму ситуацию и есть ли подтверждение',
  }),
  option('medium', 'Заметная травма', {
    level: 'medium',
    amount: '30 000–50 000 ₽',
    note: 'Заметная травма на соревнованиях уже хорошо показывает практическую ценность полиса.',
    focus: 'сценарий со средней тяжестью, где важны и документы, и обстоятельства события',
    support:
      'сильнее зависит от подтверждения травмы, контекста соревнований и условий продукта',
  }),
  option('severe', 'Серьёзная травма', {
    level: 'strong',
    amount: '50 000–75 000 ₽',
    note: 'Серьёзная травма на соревнованиях — один из самых наглядных спортивных сценариев.',
    focus: 'более серьёзный соревновательный сценарий',
    support:
      'особенно зависит от тяжести травмы, медицинских документов и понятной картины случившегося',
  }),
]

const SPORT_TRIP_OPTIONS = [
  option('light', 'Ушиб или лёгкая травма', {
    level: 'light',
    amount: '20 000–32 000 ₽',
    note: 'Это более лёгкий выездной сценарий, поэтому пример поддержки обычно ниже.',
    focus: 'лёгкую травму в дороге или на базе',
    support:
      'зависит от того, как быстро зафиксировали ситуацию и где именно она произошла',
  }),
  option('medium', 'Растяжение / сильная боль', {
    level: 'medium',
    amount: '32 000–52 000 ₽',
    note: 'Средний выездной сценарий особенно хорошо показывает роль подтверждений и организации поездки.',
    focus: 'средний по тяжести сценарий на выезде',
    support:
      'зависит и от документов по травме, и от того, как описан формат поездки или сборов',
  }),
  option('severe', 'Вывих / серьёзная травма', {
    level: 'strong',
    amount: '52 000–78 000 ₽',
    note: 'Более серьёзный сценарий на выезде обычно выглядит как самый наглядный пример пользы продукта.',
    focus: 'серьёзную травму вне привычной среды',
    support:
      'особенно зависит от тяжести ситуации, подтверждений и того, как быстро собрана картина события',
  }),
]

const QUESTIONNAIRES = {
  pe: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая травма?', [
      option('dislocation', 'Вывих'),
      option('sprain', 'Растяжение'),
      option('bruise', 'Ушиб'),
    ]),
    question('cause', 'Кто стал причиной?', [
      option('self', 'Я сам'),
      option('otherPerson', 'Другой человек'),
      option('poorOrganisation', 'Плохая организация'),
    ]),
    question('place', 'Где это случилось?', [
      option('home', 'Дом'),
      option('street', 'Улица'),
      option('school', 'Школа'),
      option('club', 'Секция'),
      option('other', 'Другое'),
    ]),
  ],
  scooter: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая травма?', [
      option('dislocation', 'Вывих'),
      option('sprain', 'Растяжение'),
      option('bruise', 'Ушиб'),
    ]),
    question('cause', 'Что стало главной причиной?', [
      option('self', 'Не справился сам'),
      option('otherPerson', 'Другой человек'),
      option('road', 'Дорога или покрытие'),
    ]),
    question('place', 'Где это случилось?', [
      option('street', 'Улица'),
      option('park', 'Парк'),
      option('yard', 'Двор'),
      option('nearSchool', 'У школы'),
      option('other', 'Другое'),
    ]),
  ],
  rink: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая травма?', [
      option('dislocation', 'Вывих'),
      option('sprain', 'Растяжение'),
      option('bruise', 'Ушиб'),
    ]),
    question('cause', 'Что стало главной причиной?', [
      option('self', 'Я сам'),
      option('otherPerson', 'Другой человек'),
      option('ice', 'Лёд или организация'),
    ]),
    question('place', 'Где именно это было?', [
      option('openRink', 'Открытый каток'),
      option('indoorRink', 'Крытый каток'),
      option('club', 'Секция'),
      option('friends', 'Отдых с друзьями'),
      option('other', 'Другое'),
    ]),
  ],
  'sick-trip': [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что случилось?', [
      option('fever', 'Температура или простуда', {
        level: 'light',
        detail: 'Это более частый и сравнительно мягкий сценарий поездки, но он всё равно может быстро стать неудобным вдали от дома.',
        support:
          'Полис особенно полезен тем, что помогает не растеряться и понять, куда обращаться даже в более обычной медицинской ситуации.',
        check: 'есть ли уже понятная фиксация симптомов и нужен ли врач прямо сейчас',
      }),
      option('stomach', 'Отравление или живот', {
        level: 'medium',
        detail: 'Такой сценарий часто требует быстрее сориентироваться, потому что самочувствие может меняться резко.',
        support:
          'Полис особенно полезен тем, что помогает быстрее выстроить маршрут к помощи и не теряться в незнакомой среде.',
        check: 'нужна ли медицинская помощь срочно и есть ли подтверждение состояния',
      }),
      option('serious', 'Резко стало серьёзно плохо', {
        level: 'strong',
        detail: 'Это уже сильный сценарий поездки, где цена времени и понятного плана заметно выше.',
        support:
          'Полис особенно важен как опора для быстрого поиска помощи и спокойного понимания дальнейших шагов.',
        check: 'кто может быстро помочь на месте и как подтвердить серьёзность ситуации',
      }),
    ]),
    question('tripPlace', 'Где поездка?', [
      option('russia', 'По России'),
      option('abroad', 'За границей'),
      option('camp', 'Лагерь или выезд'),
    ]),
    question('mainWorry', 'Что тебя волнует больше всего?', [
      option('findHelp', 'Как быстро найти помощь'),
      option('understandCoverage', 'Что вообще покрывает полис'),
      option('actNow', 'Что делать прямо сейчас'),
    ]),
  ],
  'injury-trip': [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Какая ситуация ближе всего?', [
      option('light', 'Ушиб или лёгкая травма', {
        level: 'light',
        detail: 'Это более мягкий сценарий отдыха, но он всё равно показывает, как быстро обычная прогулка или активность может выйти из плана.',
        support:
          'Полис полезен тем, что помогает не остаться один на один даже с более лёгкой травмой в поездке.',
        check: 'насколько травма уже подтверждена и что именно произошло',
      }),
      option('medium', 'Растяжение или сильная боль', {
        level: 'medium',
        detail: 'Такой вариант уже сильнее влияет на планы и обычно требует более понятного порядка действий.',
        support:
          'Полис помогает быстрее перейти от паники к понятному алгоритму: помощь, документы, следующий шаг.',
        check: 'нужен ли осмотр врача и есть ли описание самой ситуации',
      }),
      option('severe', 'Серьёзная травма, нужен врач', {
        level: 'strong',
        detail: 'Это уже серьёзный сценарий отдыха, где особенно заметна ценность быстрого и спокойного разбора.',
        support:
          'Полис может особенно помочь там, где нужна врачебная помощь и ясный порядок дальнейших действий.',
        check: 'кто может помочь на месте и какие документы стоит собрать сразу',
      }),
    ]),
    question('restType', 'Что это был за отдых?', [
      option('walk', 'Прогулка'),
      option('water', 'Бассейн / вода / пляж'),
      option('activity', 'Экскурсия / активность / аттракцион'),
    ]),
    question('tripPlace', 'Где поездка?', [
      option('russia', 'По России'),
      option('abroad', 'За границей'),
      option('camp', 'Лагерь / организованный отдых'),
    ]),
  ],
  baggage: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что именно произошло?', [
      option('delay', 'Задержка транспорта', {
        level: 'light',
        detail: 'Это более мягкий дорожный сценарий, но он всё равно может быстро сбить весь план поездки.',
        support:
          'Полис полезен тем, что помогает спокойнее смотреть на срыв времени и понимать, какие подтверждения пригодятся.',
        check: 'есть ли подтверждение задержки и как это влияет на остальной маршрут',
      }),
      option('baggage', 'Потеря или проблема с багажом', {
        level: 'medium',
        detail: 'Проблема с багажом часто бьёт сразу по комфорту и по деньгам, поэтому разбор здесь особенно практический.',
        support:
          'Полис полезен тем, что помогает не потеряться в дороге и быстрее собрать нужные подтверждения по вещам.',
        check: 'есть ли отметка от перевозчика и что именно пропало или задержалось',
      }),
      option('route', 'Срыв маршрута / пересадка / отмена части поездки', {
        level: 'strong',
        detail: 'Это уже сильный дорожный сценарий, где ломается не одна деталь, а весь маршрут целиком.',
        support:
          'Полис может особенно пригодиться там, где важно быстро понять, как собрать картину сорвавшейся поездки.',
        check: 'как подтверждается сбой маршрута и какие части поездки уже пострадали',
      }),
    ]),
    question('tripPlace', 'Где поездка?', [
      option('russia', 'По России'),
      option('abroad', 'За границей'),
      option('transfer', 'С пересадками'),
    ]),
    question('mainGoal', 'Что сейчас самое важное?', [
      option('onTime', 'Добраться вовремя'),
      option('getBack', 'Вернуть вещи'),
      option('understandNext', 'Понять, что делать дальше'),
    ]),
  ],
  training: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая травма?', SPORT_INJURY_OPTIONS),
    question('place', 'Где это произошло?', [
      option('section', 'Секция'),
      option('schoolTeam', 'Школьная команда'),
      option('gym', 'Зал или клуб'),
    ]),
    question('cause', 'Что стало причиной?', [
      option('self', 'Я сам'),
      option('otherPerson', 'Другой человек'),
      option('equipment', 'Покрытие или инвентарь'),
    ]),
  ],
  competition: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая ситуация ближе всего?', SPORT_INTENSITY_OPTIONS),
    question('format', 'Что это было?', [
      option('match', 'Матч'),
      option('performance', 'Выступление'),
      option('tournament', 'Турнир'),
    ]),
    question('cause', 'Что стало причиной?', [
      option('contact', 'Контакт с другим человеком'),
      option('overload', 'Перегрузка'),
      option('fall', 'Падение или покрытие'),
    ]),
  ],
  camp: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('injury', 'Какая ситуация ближе всего?', SPORT_TRIP_OPTIONS),
    question('format', 'Что это был за формат?', [
      option('camp', 'Сборы'),
      option('tournament', 'Выездной турнир'),
      option('trip', 'Спортивная поездка'),
    ]),
    question('place', 'Где это было?', [
      option('russia', 'По России'),
      option('abroad', 'За границей'),
      option('base', 'Лагерь / база / другой город'),
    ]),
  ],
  'sick-before': [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что ближе всего к ситуации?', [
      option('fever', 'Температура или простуда', {
        level: 'light',
        detail: 'Это самый частый и более мягкий сценарий отмены, но даже он может сломать уже собранный план.',
        support:
          'Полис помогает спокойнее смотреть на сорвавшуюся поездку, когда причина не надуманная, а реально мешает ехать.',
        check: 'когда именно стало плохо и есть ли подтверждение самочувствия',
      }),
      option('serious', 'Серьёзное ухудшение самочувствия', {
        level: 'medium',
        detail: 'Такой сценарий уже сильнее влияет на возможность ехать и делает разбор заметно практичнее.',
        support:
          'Полис особенно полезен там, где поездка срывается по объективной и подтверждаемой причине.',
        check: 'насколько серьёзной выглядит ситуация и есть ли медицинская фиксация',
      }),
      option('doctor', 'Врач сказал не ехать', {
        level: 'strong',
        detail: 'Это сильный сценарий отмены, где акцент ещё сильнее смещается на подтверждение причины.',
        support:
          'Полис особенно понятен там, где есть прямой запрет или рекомендация не ехать и её можно подтвердить.',
        check: 'есть ли документ или понятная фиксация рекомендации врача',
      }),
    ]),
    question('planType', 'Что было запланировано?', [
      option('trip', 'Поездка'),
      option('camp', 'Лагерь'),
      option('event', 'Мероприятие'),
    ]),
    question('timing', 'Насколько всё было близко?', [
      option('soon', 'Уже вот-вот'),
      option('days', 'Через несколько дней'),
      option('planned', 'Было запланировано заранее'),
    ]),
  ],
  'event-cancelled': [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что именно отменилось?', [
      option('trip', 'Поездка', {
        level: 'light',
        detail: 'Такой сценарий хорошо показывает, что проблема может быть не в человеке, а в том, что само событие не состоялось.',
        support:
          'Полис полезен тем, что помогает собрать понятный разбор отмены и не потеряться в деталях.',
        check: 'кто подтвердил отмену поездки и как это зафиксировано',
      }),
      option('show', 'Концерт / матч / событие', {
        level: 'medium',
        detail: 'Это уже более заметный сценарий отмены, потому что речь идёт о конкретном заранее запланированном событии.',
        support:
          'Полис помогает спокойнее смотреть на возвраты и подтверждения, когда сорвалось важное событие.',
        check: 'есть ли уведомление об отмене и что было оплачено заранее',
      }),
      option('camp', 'Лагерь / смена / организованный выезд', {
        level: 'strong',
        detail: 'Это сильный сценарий отмены, потому что в нём обычно больше организационных и денежных деталей.',
        support:
          'Полис особенно полезен, когда отмена затрагивает целый организованный формат и нужно быстро понять следующий шаг.',
        check: 'кто отменил выезд и какие подтверждения уже есть на руках',
      }),
    ]),
    question('whoCancelled', 'Кто отменил?', [
      option('organizer', 'Организатор'),
      option('carrier', 'Перевозчик'),
      option('venue', 'Площадка / принимающая сторона'),
    ]),
    question('mainGoal', 'Что для тебя сейчас важнее?', [
      option('money', 'Вернуть деньги'),
      option('options', 'Понять свои возможности'),
      option('next', 'Быстро разобраться, что делать'),
    ]),
  ],
  'cant-go': [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Какая причина ближе всего?', [
      option('illness', 'Болезнь', {
        level: 'light',
        detail: 'Это более частый и понятный сценарий, который показывает, как болезнь может сорвать даже хорошо собранный план.',
        support:
          'Полис полезен тем, что помогает отделить объективную причину от простого отказа ехать.',
        check: 'как подтверждается болезнь и когда стало ясно, что поездка срывается',
      }),
      option('family', 'Семейные обстоятельства', {
        level: 'medium',
        detail: 'Такой сценарий сложнее эмоционально и организационно, поэтому особенно важен спокойный разбор.',
        support:
          'Полис помогает понять, насколько жизненная причина совпадает с логикой продукта и что стоит проверить дальше.',
        check: 'что именно изменилось и как это можно подтвердить',
      }),
      option('docs', 'Документы / дорога / организационная проблема', {
        level: 'strong',
        detail: 'Это уже сильный организационный сценарий, где планы ломаются не из-за желания, а из-за реального препятствия.',
        support:
          'Полис особенно полезен, когда важно быстро разобраться в сорвавшемся выезде и не потеряться в деталях.',
        check: 'какое именно препятствие возникло и чем оно подтверждается',
      }),
    ]),
    question('planType', 'Что было запланировано?', [
      option('trip', 'Поездка'),
      option('camp', 'Лагерь'),
      option('event', 'Мероприятие'),
    ]),
    question('mainGoal', 'Что хочется понять больше всего?', [
      option('fits', 'Подходит ли случай под полис'),
      option('money', 'Как не потерять деньги'),
      option('next', 'Что делать дальше'),
    ]),
  ],
  account: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что ближе всего к ситуации?', [
      option('password', 'Не подходит пароль', {
        level: 'light',
        detail: 'Это более мягкий цифровой сценарий, но он всё равно неприятный, потому что доступ уже под вопросом.',
        support:
          'Самое полезное здесь — быстро проверить восстановление доступа и не делать лишних резких шагов.',
        check: 'есть ли понятный путь восстановления и сохраняется ли доступ к привязанным данным',
      }),
      option('mail', 'Потерян доступ к почте', {
        level: 'medium',
        detail: 'Это уже заметно более сложный сценарий, потому что почта часто управляет всем восстановлением.',
        support:
          'Здесь особенно важно выстроить порядок действий и понять, через какой канал можно вернуть контроль.',
        check: 'какой канал восстановления ещё доступен и что можно подтвердить уже сейчас',
      }),
      option('hacked', 'Аккаунт выглядит взломанным', {
        level: 'strong',
        detail: 'Это сильный цифровой сценарий, где особенно важны скорость, фиксация и спокойный порядок действий.',
        support:
          'Здесь важно не паниковать, а быстро остановить возможный ущерб и собрать понятную картину изменений.',
        check: 'что именно изменилось в аккаунте и какие доступы ещё остались у тебя',
      }),
    ]),
    question('linked', 'Что у тебя привязано?', [
      option('mail', 'Почта'),
      option('phone', 'Телефон'),
      option('unknown', 'Не уверен'),
    ]),
    question('mainGoal', 'Что сейчас важнее всего?', [
      option('return', 'Вернуть доступ'),
      option('understand', 'Понять, что делать'),
      option('protect', 'Защитить аккаунт заранее'),
    ]),
  ],
  fraud: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Какая ситуация ближе всего?', [
      option('link', 'Подозрительная ссылка', {
        level: 'light',
        detail: 'Это более ранний цифровой сигнал: пока ещё есть шанс остановиться до серьёзных последствий.',
        support:
          'Главное здесь — не делать лишних шагов и спокойно проверить, насколько безопасной была ссылка.',
        check: 'переходил ли ты по ссылке и можно ли её проверить без повторного риска',
      }),
      option('data', 'Просьба передать данные', {
        level: 'medium',
        detail: 'Это уже заметно более тревожный сценарий, потому что речь идёт о прямой передаче доступа или личной информации.',
        support:
          'Здесь особенно важно понять, какие данные нельзя отдавать и что делать, если часть информации уже ушла.',
        check: 'какие именно данные просили и успел ли ты что-то передать',
      }),
      option('deal', 'Обмен / продажа / “выгодное предложение”', {
        level: 'strong',
        detail: 'Это сильный сценарий, потому что мошенничество часто прячется именно за “удобными” и очень выгодными предложениями.',
        support:
          'Важно быстро проверить риски, не продолжать сомнительный диалог и сохранить всё, что уже известно о ситуации.',
        check: 'что уже было обещано, отправлено или согласовано в этой схеме',
      }),
    ]),
    question('already', 'Что уже произошло?', [
      option('nothing', 'Ничего не отправил'),
      option('clicked', 'Перешёл по ссылке'),
      option('sent', 'Отправил данные'),
    ]),
    question('mainGoal', 'Что для тебя сейчас важнее?', [
      option('safe', 'Проверить безопасность'),
      option('return', 'Вернуть доступ'),
      option('danger', 'Понять, насколько это опасно'),
    ]),
  ],
  payments: [
    question('status', 'Ситуация уже произошла?', [
      option('happened', 'Да, уже случилась'),
      option('checking', 'Нет, проверяю заранее'),
    ]),
    question('issue', 'Что ближе всего к ситуации?', [
      option('accidental', 'Случайная покупка', {
        level: 'light',
        detail: 'Это более мягкий цифровой сценарий, где часто важнее всего быстро понять, что именно было нажато.',
        support:
          'Спокойный разбор помогает увидеть источник покупки и не делать ещё больше случайных действий.',
        check: 'где именно прошла покупка и можно ли найти историю операции',
      }),
      option('subscription', 'Подписка', {
        level: 'medium',
        detail: 'Подписки часто не видны сразу, поэтому такой сценарий уже требует чуть более внимательного разбора.',
        support:
          'Здесь полезно понять, как именно была оформлена подписка и где её можно отключить.',
        check: 'когда подписка началась и через какой сервис или игру она идёт',
      }),
      option('charge', 'Непонятное списание', {
        level: 'strong',
        detail: 'Это сильный цифровой сценарий, потому что непонятное списание почти всегда вызывает больше тревоги и вопросов.',
        support:
          'Главное — спокойно отследить источник оплаты и быстро понять, не нужно ли дополнительно защищать аккаунт или карту.',
        check: 'откуда пришло списание и есть ли связь с конкретным аккаунтом или сервисом',
      }),
    ]),
    question('paymentSource', 'Чья карта или оплата использовалась?', [
      option('mine', 'Моя'),
      option('parents', 'Родителей'),
      option('unknown', 'Не уверен'),
    ]),
    question('mainGoal', 'Что сейчас важнее всего?', [
      option('source', 'Понять, откуда списание'),
      option('disable', 'Отключить покупки'),
      option('next', 'Спокойно разобраться, что делать дальше'),
    ]),
  ],
}

const PRODUCT_MAP = Object.fromEntries(
  PRODUCT_ORDER.map((productSlug) => {
    const product = PRODUCTS[productSlug]

    return [
      productSlug,
      {
        ...product,
        slug: productSlug,
        scenarios: product.scenarios.map((scenario) => ({
          ...scenario,
          slug: scenario.key,
          scenarioType: productSlug === 'accident' ? 'NS' : 'SIMPLE',
          hasQuestionnaire: true,
          questions: QUESTIONNAIRES[scenario.key] || [],
        })),
      },
    ]
  }),
)

const PRODUCT_LIST = PRODUCT_ORDER.map((productSlug) => PRODUCT_MAP[productSlug])

function getProductFamily(productSlug) {
  if (productSlug === 'accident') {
    return 'accident'
  }

  if (productSlug === 'sport') {
    return 'sport'
  }

  if (productSlug === 'travel' || productSlug === 'event') {
    return 'support'
  }

  return 'digital'
}

function getProductConfig(slug) {
  return PRODUCT_MAP[slug] || null
}

function getScenarioConfig(productSlug, scenarioSlug) {
  const product = getProductConfig(productSlug)

  if (!product) {
    return null
  }

  const scenario = product.scenarios.find((item) => item.slug === scenarioSlug) || null

  if (!scenario) {
    return null
  }

  return {
    product,
    scenario,
    questions: scenario.questions,
  }
}

function getOptionLabel(question, value) {
  return question.options.find((optionItem) => optionItem.value === value)?.label || value
}

function getSelectedOption(question, answers) {
  return question.options.find((optionItem) => optionItem.value === answers[question.key]) || null
}

function buildGenericContextColumns(questions, answers) {
  return questions.slice(2).flatMap((currentQuestion) => {
    const currentLabel = getOptionLabel(currentQuestion, answers[currentQuestion.key])

    if (!currentLabel) {
      return []
    }

    return [
      `По ответу «${currentLabel}» на вопрос «${currentQuestion.title}» видно, какой именно контекст у этой ситуации. Это помогает понять, что проверить в первую очередь и на чём сделать акцент в разборе.`,
    ]
  })
}

function buildAccidentContextColumns(questions, answers) {
  return questions.slice(2).flatMap((currentQuestion) => {
    const currentLabel = getOptionLabel(currentQuestion, answers[currentQuestion.key])

    if (!currentLabel) {
      return []
    }

    if (currentQuestion.key === 'cause') {
      return [
        `Ты выбрал вариант «${currentLabel}». В таких историях важно не спорить о виноватых раньше времени, а собрать понятную картину события, подтвердить травму и спокойно перейти к документам.`,
      ]
    }

    return [
      `Ты выбрал вариант «${currentLabel}». Место помогает лучше представить ситуацию и понять, какие детали, подтверждения и условия продукта будут особенно важны именно в твоём случае.`,
    ]
  })
}

function buildAccidentResult({ scenario, questions, answers }) {
  const result = NS_RESULTS[scenario.slug]?.[answers.status]?.[answers.injury]

  if (!result) {
    return null
  }

  return {
    stateKey: answers.status,
    result: {
      kind: 'ns',
      heroTag: scenario.subtitle,
      title: result.title,
      subtitle: result.summary,
      sections: [
        {
          title: 'Что здесь считается риском',
          text: result.risk,
        },
        {
          title: 'Что может считаться страховым случаем',
          text: result.case,
        },
        {
          title: 'От чего зависит выплата',
          text: result.payout,
        },
        {
          title: 'Что важно именно в твоей ситуации',
          columns: buildAccidentContextColumns(questions, answers),
        },
        {
          title: 'Как это работает',
          flow: NS_FLOW,
        },
        {
          title: 'Пример выплаты',
          amount: result.example,
          note: result.note,
        },
      ],
    },
  }
}

function buildSportResult({ scenario, questions, answers }) {
  const status = answers.status
  const base = scenario.results?.[status]
  const injuryQuestion = questions[1]
  const selectedInjury = getSelectedOption(injuryQuestion, answers)

  if (!base || !selectedInjury) {
    return null
  }

  return {
    stateKey: status,
    result: {
      kind: 'sport',
      heroTag: scenario.subtitle,
      title: HERO_TONES[selectedInjury.level]?.[status] || base.summary,
      subtitle: `${base.summary} Сейчас твой ответ ближе к варианту «${selectedInjury.label.toLowerCase()}».`,
      sections: [
        {
          title: 'Что здесь считается риском',
          text: `${base.cardOneText} В твоём ответе акцент сместился на ${selectedInjury.focus}.`,
        },
        {
          title: 'Что может считаться страховым случаем',
          text: `Если такая ситуация действительно произошла в сценарии «${scenario.title.toLowerCase()}» и её можно подтвердить, её обычно разбирают как спортивный страховой случай по условиям продукта.`,
        },
        {
          title: 'От чего зависит выплата / поддержка',
          text: `${base.cardTwoText} Для варианта «${selectedInjury.label.toLowerCase()}» итог ${selectedInjury.support}.`,
        },
        {
          title: 'Что важно именно в твоей ситуации',
          columns: buildGenericContextColumns(questions, answers),
        },
        {
          title: 'Как это работает',
          flow: NS_FLOW,
        },
        {
          title: 'Пример поддержки / выплаты',
          amount: selectedInjury.amount,
          note: selectedInjury.note,
        },
      ],
    },
  }
}

function buildSupportResult({ scenario, questions, answers }) {
  const status = answers.status
  const base = scenario.results?.[status]
  const issueQuestion = questions[1]
  const selectedIssue = getSelectedOption(issueQuestion, answers)

  if (!base || !selectedIssue) {
    return null
  }

  return {
    stateKey: status,
    result: {
      kind: 'support',
      heroTag: scenario.subtitle,
      title: HERO_TONES[selectedIssue.level]?.[status] || base.summary,
      subtitle: `${base.summary} Сейчас твой ответ ближе к варианту «${selectedIssue.label.toLowerCase()}».`,
      sections: [
        {
          title: base.cardOneTitle,
          text: `${base.cardOneText} ${selectedIssue.detail}`,
        },
        {
          title: base.cardTwoTitle,
          text: `${base.cardTwoText} ${selectedIssue.support}`,
        },
        {
          title: 'Что важно проверить',
          items: [...base.checks, selectedIssue.check].slice(0, 4),
        },
        {
          title: 'Что важно именно в твоей ситуации',
          columns: buildGenericContextColumns(questions, answers),
        },
      ],
    },
  }
}

function buildDigitalResult({ scenario, questions, answers }) {
  const status = answers.status
  const base = scenario.results?.[status]
  const issueQuestion = questions[1]
  const selectedIssue = getSelectedOption(issueQuestion, answers)

  if (!base || !selectedIssue) {
    return null
  }

  return {
    stateKey: status,
    result: {
      kind: 'digital',
      heroTag: scenario.subtitle,
      title: HERO_TONES[selectedIssue.level]?.[status] || base.summary,
      subtitle: `${base.summary} Сейчас твой ответ ближе к варианту «${selectedIssue.label.toLowerCase()}».`,
      sections: [
        {
          title: base.cardOneTitle,
          text: `${base.cardOneText} ${selectedIssue.detail}`,
        },
        {
          title: base.cardTwoTitle,
          text: `${base.cardTwoText} ${selectedIssue.support}`,
        },
        {
          title: 'Что важно проверить',
          items: [...base.checks, selectedIssue.check].slice(0, 4),
        },
        {
          title: 'Что важно именно в твоей ситуации',
          columns: buildGenericContextColumns(questions, answers),
        },
      ],
    },
  }
}

export function listConfiguredProducts() {
  return PRODUCT_LIST
}

export function getConfiguredProduct(slug) {
  return getProductConfig(slug)
}

export function getConfiguredScenario(productSlug, scenarioSlug) {
  return getScenarioConfig(productSlug, scenarioSlug)
}

export function buildConfiguredScenarioResult({ productSlug, scenarioSlug, answers }) {
  const payload = getScenarioConfig(productSlug, scenarioSlug)

  if (!payload) {
    return null
  }

  const { scenario, questions } = payload
  const family = getProductFamily(productSlug)

  if (family === 'accident') {
    return buildAccidentResult({ scenario, questions, answers })
  }

  if (family === 'sport') {
    return buildSportResult({ scenario, questions, answers })
  }

  if (family === 'support') {
    return buildSupportResult({ scenario, questions, answers })
  }

  return buildDigitalResult({ scenario, questions, answers })
}
