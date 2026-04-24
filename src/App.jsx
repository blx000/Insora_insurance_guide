import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'

import './App.css'
import { apiGet, apiPost, streamChatMessage } from './api'
import {
  CtaBlock,
  FAQSection,
  Mascot,
  ProductCard,
  ScreenHeader,
} from './components/ui'
import { getToneClass } from './components/theme'

function useApiData(path) {
  const [resource, setResource] = useState(() => ({
    path,
    data: null,
    error: '',
  }))

  useEffect(() => {
    if (!path) {
      return undefined
    }

    let cancelled = false

    apiGet(path)
      .then((payload) => {
        if (!cancelled) {
          setResource({
            path,
            data: payload,
            error: '',
          })
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setResource({
            path,
            data: null,
            error: nextError.message,
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [path])

  if (!path) {
    return { data: null, loading: false, error: '' }
  }

  return {
    data: resource.path === path ? resource.data : null,
    loading: resource.path !== path || (!resource.data && !resource.error),
    error: resource.path === path ? resource.error : '',
  }
}

const GAME_PROGRESS_STORAGE_KEY = 'insora-game-progress-v1'

const GAME_THEME_LABELS = {
  situation: 'разбор ситуаций',
  'after-injury': 'порядок действий',
  'payout-path': 'логика выплаты',
}

const GAME_CARD_META = {
  situation: {
    eyebrow: 'Сюжетная игра',
    points: ['3 кейса', '3 вопроса', 'мягкий фидбек'],
  },
  'after-injury': {
    eyebrow: 'Порядок шагов',
    points: ['4 шага', 'быстрый проход', 'без паники'],
  },
  'payout-path': {
    eyebrow: 'База страхования',
    points: ['цепочка из 4 шагов', 'короткий интерактив', 'понятная логика'],
  },
}

function renderRichInline(text, keyPrefix) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${keyPrefix}-strong-${index}`}>{part.slice(2, -2)}</strong>
      }

      return <span key={`${keyPrefix}-text-${index}`}>{part}</span>
    })
}

function FormattedChatText({ text, className = 'chat-text' }) {
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/).filter(Boolean)

  return (
    <div className={`${className} chat-rich-text`}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n')

        return (
          <p className="chat-rich-block" key={`block-${blockIndex}`}>
            {lines.map((line, lineIndex) => (
              <span className="chat-rich-line" key={`line-${blockIndex}-${lineIndex}`}>
                {renderRichInline(line, `block-${blockIndex}-line-${lineIndex}`)}
                {lineIndex < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

const HOME_FLOW_STEPS = [
  {
    title: 'Выбери продукт',
    text: 'Начни с того, что ближе тебе: травма, поездка, спорт или другая ситуация.',
  },
  {
    title: 'Разбери ситуацию',
    text: 'Ответь на пару коротких вопросов и получи понятное объяснение.',
  },
  {
    title: 'Пойми, как это работает',
    text: 'Мы покажем, когда может помочь полис и что здесь важно.',
  },
]

const HOME_AUDIENCE_BADGES = ['Подросткам 11–18', 'Родителям', 'Без сложных слов']

const HOME_VALUE_PILLARS = [
  {
    title: 'Как это работает',
    text: 'Объясняем логику страхования не через термины, а через короткие жизненные сценарии.',
  },
  {
    title: 'Где встречается в жизни',
    text: 'Школа, спорт, поездки, отмена планов и цифровые ситуации собираются в понятные входы.',
  },
  {
    title: 'Какие проблемы решает',
    text: 'Помогаем понять, когда полис может поддержать и что делать дальше в неприятной ситуации.',
  },
]

const SITUATION_GAME_CONTENT = {
  pe: {
    intro:
      'На физкультуре ребёнок неудачно упал и пожаловался на сильную боль в руке. Давай разберёмся, что здесь важно.',
    summary:
      'В такой ситуации сначала смотрят на сам факт травмы, помощь и подтверждение того, что произошло.',
    takeaways: [
      'Сначала важно понять, что именно случилось и есть ли подтверждённая травма.',
      'Помощь и фиксация ситуации важнее споров о деньгах и виноватых.',
      'Дальше в разборе помогают документы, описание события и условия полиса.',
    ],
    questions: [
      {
        prompt: 'Что здесь главное в первую очередь?',
        options: [
          'Понять, что именно случилось, и есть ли травма',
          'Сразу считать возможную выплату',
          'Сразу искать, кто виноват',
        ],
        correctIndex: 0,
        success: 'Хорошая мысль. Сначала важно само событие и состояние ребёнка.',
        hint:
          'Здесь важнее понять факт события и травму. До денег и споров нужно разобраться, что реально произошло.',
      },
      {
        prompt: 'Что лучше сделать сначала, если это уже случилось?',
        options: [
          'Обратиться за помощью и зафиксировать травму',
          'Сразу искать полис в телефоне',
          'Сначала написать длинное сообщение в чат',
        ],
        correctIndex: 0,
        success: 'Хороший ход. Сначала помощь и фиксация ситуации.',
        hint:
          'Почти. До переписки и поиска полиса важнее помощь и подтверждение того, что травма действительно есть.',
      },
      {
        prompt: 'Что сильнее всего влияет на дальнейший разбор?',
        options: [
          'Подтверждение: справка, запись и описание события',
          'Случайный совет знакомого',
          'То, насколько быстро нашли чат',
        ],
        correctIndex: 0,
        success: 'Да. Подтверждение и документы очень помогают дальше.',
        hint:
          'Здесь важнее подтверждение: документы, описание и понятная картина события. Без этого дальше сложнее.',
      },
    ],
  },
  scooter: {
    intro:
      'Подросток упал с самоката на улице, сильно ударился и не сразу понял, насколько серьёзна травма.',
    summary:
      'В истории с самокатом важны сам факт события, травма и то, чем всё можно подтвердить дальше.',
    takeaways: [
      'Нужно оттолкнуться от самого события: где, как и что именно произошло.',
      'Сначала важны помощь и фиксация травмы, а не абстрактные рассуждения.',
      'Дальнейший разбор зависит от документов и условий продукта, а не от случайности.',
    ],
    questions: [
      {
        prompt: 'На чём здесь нужно сфокусироваться в первую очередь?',
        options: [
          'На самом падении и последствиях для здоровья',
          'На том, было ли это неловко',
          'На том, сколько стоил самокат',
        ],
        correctIndex: 0,
        success: 'Хорошая мысль. В центре здесь событие и состояние человека.',
        hint:
          'Здесь важнее сам факт падения и травма. Остальные детали уже идут после этого.',
      },
      {
        prompt: 'Какой первый шаг выглядит самым полезным?',
        options: [
          'Помочь, обратиться за осмотром и зафиксировать травму',
          'Сразу искать размер выплаты',
          'Сначала удалить все сообщения о случившемся',
        ],
        correctIndex: 0,
        success: 'Да, это сильный ход. Сначала помощь и фиксация.',
        hint:
          'Почти. Сначала не выплаты, а помощь и подтверждение того, что травма действительно была.',
      },
      {
        prompt: 'Что потом сильнее всего влияет на понятный разбор?',
        options: [
          'Документы, описание ситуации и условия полиса',
          'То, был ли день удачным',
          'Насколько быстро нашёлся заряд у телефона',
        ],
        correctIndex: 0,
        success: 'Верно. Дальше уже нужны подтверждение и условия.',
        hint:
          'Здесь важнее документы и понятное описание события. Именно они помогают двигаться дальше.',
      },
    ],
  },
  rink: {
    intro:
      'На катке случилось жёсткое падение, после которого стало ясно, что травма может быть серьёзной.',
    summary:
      'В более тяжёлой ситуации особенно хорошо видно: сначала событие и травма, потом подтверждение и условия.',
    takeaways: [
      'Тяжесть случая имеет значение, но её нужно подтверждать, а не угадывать.',
      'Первый шаг всё равно про помощь и фиксацию ситуации.',
      'Выплата не появляется сама по себе: важны документы и условия полиса.',
    ],
    questions: [
      {
        prompt: 'Что здесь важно заметить сразу?',
        options: [
          'Это реальное событие с возможной серьёзной травмой',
          'Катание просто не задалось',
          'Главное, кто первым увидел падение',
        ],
        correctIndex: 0,
        success: 'Хорошая мысль. Здесь важно само событие и возможная серьёзность травмы.',
        hint:
          'Здесь важнее сам факт серьёзной ситуации. Уже потом смотрят на остальные детали.',
      },
      {
        prompt: 'Какой шаг лучше сделать первым?',
        options: [
          'Обратиться за помощью и получить фиксацию травмы',
          'Сразу искать итоговую сумму',
          'Сначала спорить, виноват ли лёд',
        ],
        correctIndex: 0,
        success: 'Да. Сначала помощь и подтверждение травмы.',
        hint:
          'Почти. До суммы и споров важнее помощь и фиксация того, что произошло.',
      },
      {
        prompt: 'От чего дальше зависит разбор по страховке?',
        options: [
          'От подтверждения случая и условий полиса',
          'От того, было ли страшно',
          'Только от возраста человека',
        ],
        correctIndex: 0,
        success: 'Точно. Дальше смотрят на подтверждение и условия.',
        hint:
          'Здесь важнее подтверждение и условия. Именно они связывают событие с дальнейшим разбором.',
      },
    ],
  },
}

const AFTER_INJURY_SEQUENCE = [
  'Обратиться за помощью',
  'Зафиксировать травму и получить документы',
  'Найти данные полиса',
  'Подготовить описание события',
]

const AFTER_INJURY_DISTRACTORS = [
  'Сразу считать сумму выплаты',
  'Сначала ждать, что всё само решится',
  'Отложить документы на потом',
  'Сначала оформить новый полис',
]

const PAYOUT_PATH_SEQUENCE = ['Риск', 'Событие', 'Подтверждение', 'Выплата']

const PAYOUT_PATH_DISTRACTORS = [
  'Паника',
  'Слухи',
  'Случайный совет',
  'Удача',
]

function getDefaultGameState(gameSlug) {
  if (gameSlug === 'situation') {
    return {
      phase: 'intro',
      selectedCase: '',
      currentQuestion: 0,
      answers: [],
      completed: false,
    }
  }

  if (gameSlug === 'after-injury') {
    return {
      phase: 'intro',
      sequence: [],
      feedback: '',
      feedbackTone: 'neutral',
      completed: false,
    }
  }

  return {
    phase: 'intro',
    sequence: [],
    feedback: '',
    feedbackTone: 'neutral',
    completed: false,
  }
}

function readGameProgress() {
  if (typeof window === 'undefined') {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(GAME_PROGRESS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeGameProgress(progress) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(GAME_PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Ignore localStorage write failures in preview mode.
  }
}

function updateGameProgress(gameSlug, patch) {
  const current = readGameProgress()
  const next = {
    ...current,
    [gameSlug]: {
      ...(current[gameSlug] || {}),
      ...patch,
      updatedAt: Date.now(),
    },
  }
  writeGameProgress(next)
  return next
}

function getGameProgressSummary(games) {
  const progressMap = readGameProgress()
  const items = games.map((game) => {
    const progress = progressMap[game.slug] || {}
    const total = progress.total || (game.slug === 'situation' ? 3 : 4)
    const score = progress.score || 0
    return {
      slug: game.slug,
      title: game.title,
      theme: GAME_THEME_LABELS[game.slug] || game.title.toLowerCase(),
      completed: Boolean(progress.completed),
      started: Boolean(progress.started),
      score,
      total,
      ratio: total ? score / total : 0,
    }
  })

  const completed = items.filter((item) => item.completed)
  const best = [...completed].sort((left, right) => right.ratio - left.ratio)[0]
  const remaining = items.filter((item) => !item.completed)

  return {
    items,
    completedCount: completed.length,
    bestTheme: best ? best.theme : 'первые шаги в логике страхования',
    remainingLabel: remaining.length
      ? remaining.map((item) => item.title).join(', ')
      : 'все 3 игры уже открыты',
  }
}

function getGameButtonLabel(progress) {
  if (progress?.completed) {
    return 'Пройти ещё раз'
  }

  if (progress?.started) {
    return 'Продолжить'
  }

  return 'Запустить'
}

function normalizeGameState(gameSlug, rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return getDefaultGameState(gameSlug)
  }

  if (rawState.phase) {
    return rawState
  }

  if (gameSlug === 'after-injury') {
    const sequence = Array.isArray(rawState.checklist) ? rawState.checklist : []
    return {
      phase: sequence.length === AFTER_INJURY_SEQUENCE.length ? 'result' : 'play',
      sequence,
      feedback: '',
      feedbackTone: 'neutral',
      completed: sequence.length === AFTER_INJURY_SEQUENCE.length,
    }
  }

  if (gameSlug === 'payout-path') {
    const sequence = Array.isArray(rawState.payoutPath) ? rawState.payoutPath : []
    return {
      phase: sequence.length === PAYOUT_PATH_SEQUENCE.length ? 'result' : 'play',
      sequence,
      feedback: '',
      feedbackTone: 'neutral',
      completed: sequence.length === PAYOUT_PATH_SEQUENCE.length,
    }
  }

  return getDefaultGameState(gameSlug)
}

function GameResultActions({ onScenario, onChat, onBack }) {
  return (
    <section className="mini-links game-result-actions">
      <button className="mini-link-card" type="button" onClick={onScenario}>
        <span>Дальше в продукт</span>
        <strong>Разобрать мою ситуацию</strong>
      </button>
      <button className="mini-link-card" type="button" onClick={onChat}>
        <span>Инго рядом</span>
        <strong>Спросить Инго</strong>
      </button>
      <button className="mini-link-card" type="button" onClick={onBack}>
        <span>Вернуться</span>
        <strong>К играм</strong>
      </button>
    </section>
  )
}

function LoadingScreen({ title = 'Загружаем Инсору…' }) {
  return (
    <section className="content-card">
      <div className="section-heading">
        <span className="section-kicker">Загрузка</span>
        <h2>{title}</h2>
      </div>
      <p>Данные подтягиваются с сервера.</p>
    </section>
  )
}

function ErrorScreen({ title = 'Не получилось открыть экран', message }) {
  return (
    <section className="content-card">
      <div className="section-heading">
        <span className="section-kicker">Ошибка</span>
        <h2>{title}</h2>
      </div>
      <p>{message}</p>
    </section>
  )
}

function ResultCards({ cards }) {
  const hiddenTitles = new Set(['Как это работает', 'Что важно именно в твоей ситуации'])

  return (
    <section className="result-stack">
      {cards.filter((card) => !hiddenTitles.has(card.title)).map((card) => {
        const className = card.amount ? 'content-card payout-card' : 'content-card'

        return (
          <article className={className} key={card.title}>
            <h2>{card.title}</h2>
            {card.text ? <p>{card.text}</p> : null}
            {card.items ? (
              <ul className="bullet-list">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {card.columns ? (
              <div className="two-column-copy">
                {card.columns.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            ) : null}
            {card.flow ? (
              <div className="flow-grid">
                {card.flow.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            ) : null}
            {card.amount ? <strong>{card.amount}</strong> : null}
            {card.note ? <p>{card.note}</p> : null}
          </article>
        )
      })}
    </section>
  )
}

function NavIcon({ tab }) {
  switch (tab) {
    case 'games':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7.25 7.5h9.5a4.25 4.25 0 0 1 4.25 4.25v3a4.25 4.25 0 0 1-4.25 4.25h-9.5A4.25 4.25 0 0 1 3 14.75v-3A4.25 4.25 0 0 1 7.25 7.5Zm-1.5 6h2.5v2.5h2v-2.5h2.5v-2h-2.5V9h-2v2.5h-2.5v2Zm9.65-1.1a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Zm2.2 3.35a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
            fill="currentColor"
          />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.75 5h10.5A4.75 4.75 0 0 1 22 9.75v3.5A4.75 4.75 0 0 1 17.25 18H12l-4.9 3.06c-.67.42-1.6-.07-1.6-.86V18.9A4.75 4.75 0 0 1 2 14.25v-4.5A4.75 4.75 0 0 1 6.75 5Zm1.1 5.5a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.15 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Zm4.15 0a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"
            fill="currentColor"
          />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 4.1 20 10v9.25A1.75 1.75 0 0 1 18.25 21h-3.5A1.75 1.75 0 0 1 13 19.25V16h-2v3.25A1.75 1.75 0 0 1 9.25 21h-3.5A1.75 1.75 0 0 1 4 19.25V10l8-5.9Z"
            fill="currentColor"
          />
        </svg>
      )
  }
}

function HomeScreen({ products }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const productsSectionRef = useRef(null)
  const deferredSearch = useDeferredValue(searchTerm)
  const normalizedSearch = deferredSearch.trim().toLowerCase()
  const filteredProducts = products.filter((product) => {
    if (!normalizedSearch) {
      return true
    }

    return [product.title, product.homeText, ...product.scenarios.map((scenario) => scenario.title)]
      .join(' ')
      .toLowerCase()
      .includes(normalizedSearch)
  })

  function scrollToProducts() {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section className="hero-card home-hero-card">
        <div className="hero-copy home-hero-intro">
          <span className="hero-tag">Инсора</span>
          <h2>Привет, я Инго!</h2>
          <p>Давай посмотрим, как страхование может реально помочь.</p>
        </div>
        <div className="hero-mascot-shell">
          <Mascot compact variant="home" alt="Инго приветствует на главной" />
        </div>
        <div className="hero-action-row">
          <button
            className="primary-button"
            type="button"
            onClick={() => startTransition(() => navigate('/chat'))}
          >
            Начать общение
          </button>
          <button className="secondary-button hero-secondary-action" type="button" onClick={scrollToProducts}>
            К страховым продуктам
          </button>
        </div>
        <div className="audience-pill-row">
          {HOME_AUDIENCE_BADGES.map((item) => (
            <span className="audience-pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="content-card purpose-card">
        <div className="section-heading">
          <h2>Зачем вообще нужен такой формат</h2>
          <p className="section-support">
            Страхование часто кажется слишком сложным, пока его не показывают на реальных примерах.
          </p>
        </div>
        <div className="purpose-grid">
          {HOME_VALUE_PILLARS.map((item) => (
            <article className="purpose-item" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card story-card home-flow-card">
        <div className="section-heading">
          <h2>Разобраться в страховании можно за пару простых шагов</h2>
          <p className="section-support">
            Без сложных слов, длинных правил и непонятных условий
          </p>
        </div>
        <div className="home-flow-grid">
          {HOME_FLOW_STEPS.map((item, index) => (
            <article className="story-step home-flow-step" key={item.title}>
              <span className="story-index">0{index + 1}</span>
              <div className="story-step-copy">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <label className="search-card" htmlFor="product-search">
        <span>Быстрый поиск</span>
        <div className="search-input-shell">
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M10.5 4.75a5.75 5.75 0 1 1 0 11.5 5.75 5.75 0 0 1 0-11.5Zm0 1.5a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5Zm5.56 9.75 3.19 3.19a.75.75 0 1 1-1.06 1.06L15 17.06a.75.75 0 0 1 1.06-1.06Z"
                fill="currentColor"
              />
            </svg>
          </span>
          <input
            id="product-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Найти страховой продукт…"
          />
        </div>
      </label>

      <section className="section-block home-products-section" ref={productsSectionRef}>
        <div className="section-heading">
          <h2>Наиболее частые сценарии</h2>
        </div>
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              onOpen={() => startTransition(() => navigate(`/products/${product.slug}`))}
            />
          ))}
        </div>
        {!filteredProducts.length ? (
          <div className="empty-state">
            <p>Пока ничего не нашлось. Попробуй название продукта короче.</p>
          </div>
        ) : null}
      </section>

    </>
  )
}

function ChatIntroCard({ intro, quickActions, onQuickAction }) {
  return (
    <article className="chat-bubble intro">
      <div className="chat-intro-layout">
        <div className="chat-intro-head">
          <Mascot compact variant="chat" alt="Инго помогает в чате" />
          <div>
            <span className="section-kicker">Инго на связи</span>
            <h2>{intro.title}</h2>
          </div>
        </div>
        <div className="chat-intro-copy">
          {intro.paragraphs.map((paragraph) => (
            <FormattedChatText key={paragraph} text={paragraph} />
          ))}
          <div className="chat-note-card">
            <strong>{intro.insightTitle}</strong>
            <FormattedChatText text={intro.insightText} />
          </div>
          <div className="chat-list-card">
            <strong>{intro.listTitle}</strong>
            <ul className="bullet-list">
              {intro.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <FormattedChatText text={intro.outro} />
        </div>
      </div>
      <div className="quick-actions">
        {quickActions.map((actionLabel) => (
          <button
            key={actionLabel}
            className="chip-button"
            type="button"
            onClick={() => onQuickAction(actionLabel)}
          >
            {actionLabel}
          </button>
        ))}
      </div>
    </article>
  )
}

function ChatScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const historyState = useApiData('/api/chat/history')
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [chatError, setChatError] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (historyState.data) {
      setMessages(historyState.data.messages)
    }
  }, [historyState.data])

  useEffect(() => {
    if (!historyState.data) {
      return
    }

    const frameId = requestAnimationFrame(() => {
      chatEndRef.current?.scrollIntoView({ block: 'end' })
      inputRef.current?.focus()
    })

    return () => cancelAnimationFrame(frameId)
  }, [historyState.data, messages.length, isStreaming])

  const sendPrompt = async (rawPrompt) => {
    const prompt = rawPrompt.trim()

    if (!prompt || isStreaming) {
      return
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: prompt,
    }
    const pendingAssistantId = `assistant-${Date.now()}`

    setInputValue('')
    setChatError('')
    setIsStreaming(true)
    setMessages((current) => [
      ...current,
      userMessage,
      { id: pendingAssistantId, role: 'assistant', text: '' },
    ])

    try {
      await streamChatMessage(
        {
          prompt,
          routeContext: {
            path: location.pathname,
            ...(location.state?.context || {}),
          },
        },
        {
          onEvent(event) {
            if (event.type === 'delta') {
              setMessages((current) =>
                current.map((message) =>
                  message.id === pendingAssistantId
                    ? { ...message, text: `${message.text}${event.delta}` }
                    : message,
                ),
              )
            }

            if (event.type === 'done') {
              setMessages((current) =>
                current.map((message) =>
                  message.id === pendingAssistantId ? event.message : message,
                ),
              )
            }

            if (event.type === 'error') {
              throw new Error(event.message)
            }
          },
        },
      )
    } catch (error) {
      setMessages((current) => current.filter((message) => message.id !== pendingAssistantId))
      setChatError(error.message)
    } finally {
      setIsStreaming(false)
    }
  }

  const handleQuickAction = (actionLabel) => {
    if (actionLabel === 'Показать страховые продукты') {
      startTransition(() => navigate('/products'))
      return
    }

    if (actionLabel === 'Открыть игры') {
      startTransition(() => navigate('/games'))
      return
    }

    void sendPrompt(actionLabel)
  }

  if (historyState.loading && !historyState.data) {
    return <LoadingScreen title="Открываем чат с Инго…" />
  }

  if (historyState.error) {
    return <ErrorScreen title="Чат пока недоступен" message={historyState.error} />
  }

  return (
    <>
      <ScreenHeader
        title="Чат с Инго"
        onBack={() => navigate('/')}
      />

      <section className="chat-layout">
        <div className="chat-thread">
          <ChatIntroCard
            intro={historyState.data.intro}
            quickActions={historyState.data.quickActions}
            onQuickAction={handleQuickAction}
          />

          {messages.map((message) => (
            <article className={`chat-bubble ${message.role}`} key={message.id}>
              <FormattedChatText text={message.text} />
            </article>
          ))}

          <div aria-hidden="true" ref={chatEndRef} />
        </div>

        <div className="chat-composer">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder="Задай вопрос своими словами"
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void sendPrompt(inputValue)
              }
            }}
          />
          <button
            className="primary-button"
            type="button"
            disabled={isStreaming}
            onClick={() => void sendPrompt(inputValue)}
          >
            Отправить
          </button>
        </div>

        {isStreaming ? <p className="status-note">Инго печатает ответ…</p> : null}
        {chatError ? <p className="status-note">{chatError}</p> : null}
      </section>
    </>
  )
}

function ProductsScreen({ products }) {
  const navigate = useNavigate()

  return (
    <>
      <ScreenHeader
        title="Страховые продукты"
        subtitle="Выбери раздел и провались в страницу продукта или разбор ситуации."
        onBack={() => navigate('/')}
      />

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            onOpen={() => startTransition(() => navigate(`/products/${product.slug}`))}
          />
        ))}
      </section>
    </>
  )
}

function ProductScreen() {
  const navigate = useNavigate()
  const { productSlug } = useParams()
  const productState = useApiData(productSlug ? `/api/products/${productSlug}` : null)

  if (productState.loading && !productState.data) {
    return <LoadingScreen title="Открываем продукт…" />
  }

  if (productState.error) {
    return <ErrorScreen title="Продукт не открылся" message={productState.error} />
  }

  const product = productState.data

  return (
    <>
      <section className={`product-hero content-card ${getToneClass(product.key)}`}>
        <div className="hero-copy narrow">
          <span className="hero-tag">{product.badge}</span>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
        </div>
        <Mascot compact variant="product" alt={`Инго объясняет продукт «${product.title}»`} />
      </section>

      <section className="content-card product-context-card">
        <div className="section-heading">
          <span className="section-kicker">Реальная жизнь</span>
          <h2>Где этот продукт встречается чаще всего</h2>
          <p className="section-support">
            Вход в продукт идёт не через абстрактные термины, а через ситуации, которые реально можно представить.
          </p>
        </div>
        <div className="context-chip-grid">
          {product.scenarios.map((scenario) => (
            <article className="context-chip" key={scenario.slug}>
              <strong>{scenario.title}</strong>
              <span>{scenario.subtitle}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-card">
        <div className="section-heading">
          <span className="section-kicker">Польза</span>
          <h2>{product.helpTitle}</h2>
        </div>
        <p>{product.helpIntro}</p>
        <ul className="bullet-list">
          {product.helpList.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {product.helpOutro ? <p>{product.helpOutro}</p> : null}
      </section>

      <section className="content-card cta-card">
        <div className="section-heading">
          <span className="section-kicker">Сценарии</span>
          <h2>Разобрать мою ситуацию</h2>
        </div>
        <p>
          {product.scenarioIntro ||
            'Начни с жизненного сценария и выбери то, что ближе к твоей ситуации.'}
        </p>
        <button
          className="primary-button"
          type="button"
          onClick={() => startTransition(() => navigate(`/products/${product.slug}/scenarios`))}
        >
          Разобрать мою ситуацию
        </button>
      </section>

      <FAQSection items={product.faq} />
    </>
  )
}

function ScenarioListScreen() {
  const navigate = useNavigate()
  const { productSlug } = useParams()
  const productState = useApiData(productSlug ? `/api/products/${productSlug}` : null)

  if (productState.loading && !productState.data) {
    return <LoadingScreen title="Подбираем сценарии…" />
  }

  if (productState.error) {
    return <ErrorScreen title="Сценарии не открылись" message={productState.error} />
  }

  const product = productState.data
  const toneClass = getToneClass(product.key)

  return (
    <>
      <ScreenHeader
        title={product.title}
        subtitle="Выбери жизненную ситуацию, которая ближе всего к тебе."
        onBack={() => navigate(`/products/${product.slug}`)}
      />

      <section className="scenario-list">
        {product.scenarios.map((scenario) => (
          <article className={`scenario-card ${toneClass}`} key={scenario.slug}>
            <div>
              <span className="scenario-tag">{scenario.subtitle}</span>
              <h2>{scenario.title}</h2>
              <p>
                {scenario.hasQuestionnaire
                  ? 'Пройдём короткий опрос и соберём персональный разбор результата.'
                  : 'Откроем короткий разбор ситуации простыми словами.'}
              </p>
            </div>
            <button
              className="primary-button"
              type="button"
              onClick={() =>
                startTransition(() =>
                  navigate(`/products/${product.slug}/scenarios/${scenario.slug}`),
                )
              }
            >
              Открыть сценарий
            </button>
          </article>
        ))}
      </section>
    </>
  )
}

function ScenarioScreen() {
  const navigate = useNavigate()
  const { productSlug, scenarioSlug } = useParams()
  const scenarioState = useApiData(
    productSlug && scenarioSlug
      ? `/api/products/${productSlug}/scenarios/${scenarioSlug}`
      : null,
  )
  const [answers, setAnswers] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (scenarioState.data?.questions) {
      const nextAnswers = Object.fromEntries(
        scenarioState.data.questions.map((question) => [question.key, '']),
      )
      setAnswers(nextAnswers)
    }
  }, [scenarioState.data])

  if (scenarioState.loading && !scenarioState.data) {
    return <LoadingScreen title="Открываем сценарий…" />
  }

  if (scenarioState.error) {
    return <ErrorScreen title="Сценарий не открылся" message={scenarioState.error} />
  }

  const { scenario } = scenarioState.data

  if (scenarioState.data.questions?.length) {
    const isReady = scenarioState.data.questions.every((question) => Boolean(answers[question.key]))
    const submitQuestionnaire = async () => {
      setSubmitError('')
      setSubmitting(true)

      try {
        const run =
          productSlug === 'accident'
            ? await apiPost('/api/ns/evaluate', {
                productSlug,
                scenarioSlug,
                answers,
              })
            : await apiPost('/api/scenario-runs', {
                productSlug,
                scenarioSlug,
                answers,
              })

        startTransition(() =>
          navigate(`/products/${productSlug}/scenarios/${scenarioSlug}/results/${run.id}`),
        )
      } catch (error) {
        setSubmitError(error.message)
      } finally {
        setSubmitting(false)
      }
    }

    return (
      <>
        <ScreenHeader
          title={scenario.title}
        />

        <section className="content-card scenario-card intro-card">
          <div>
            <span className="scenario-tag">Короткий опросник</span>
            <h2>Разберём ситуацию по шагам</h2>
            <p>Четыре коротких вопроса помогут собрать персональный разбор.</p>
          </div>
          <Mascot compact variant="scenarios" alt="Инго помогает пройти опросник по сценарию" />
        </section>

        <section className="questionnaire">
          {scenarioState.data.questions.map((question) => (
            <article className="content-card" key={question.key}>
              <h2>{question.title}</h2>
              <div className="option-grid">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    className={
                      answers[question.key] === option.value
                        ? 'option-button active'
                        : 'option-button'
                    }
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.key]: option.value,
                      }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </section>

        <button
          className="primary-button wide-button"
          type="button"
          disabled={!isReady || submitting}
          onClick={() => void submitQuestionnaire()}
        >
          Получить разбор
        </button>

        {submitError ? <p className="status-note">{submitError}</p> : null}
      </>
    )
  }

  return <ErrorScreen title="Сценарий не настроен" message="Для этого сценария пока нет опросника." />
}

function ResultScreen() {
  const navigate = useNavigate()
  const { productSlug, scenarioSlug, runId } = useParams()
  const runState = useApiData(runId ? `/api/scenario-runs/${runId}` : null)

  if (runState.loading && !runState.data) {
    return <LoadingScreen title="Собираем результат…" />
  }

  if (runState.error) {
    return <ErrorScreen title="Результат не открылся" message={runState.error} />
  }

  const run = runState.data
  const { result } = run

  return (
    <>
      <ScreenHeader
        title={run.scenario.title}
      />

      <section className="result-hero">
        <div className="result-hero-copy">
          <span className="hero-tag">{result.heroTag}</span>
          <h2>{result.title}</h2>
          <p>{result.subtitle}</p>
        </div>
        <Mascot compact variant="result" alt="Инго помогает понять результат разбора" />
      </section>

      <ResultCards cards={result.sections || result.cards} />

      <CtaBlock
        onNext={() =>
          startTransition(() =>
            navigate(`/products/${productSlug}/scenarios/${scenarioSlug}/results/${runId}/next-steps`),
          )
        }
        onOther={() => startTransition(() => navigate(`/products/${productSlug}/scenarios`))}
        onChat={() =>
          startTransition(() =>
            navigate('/chat', {
              state: {
                context: {
                  productSlug,
                  scenarioSlug,
                  runId,
                },
              },
            }),
          )
        }
      />
    </>
  )
}

function NextStepsScreen() {
  const navigate = useNavigate()
  const { productSlug, scenarioSlug, runId } = useParams()
  const runState = useApiData(runId ? `/api/scenario-runs/${runId}` : null)

  if (runState.loading && !runState.data) {
    return <LoadingScreen title="Открываем следующий шаг…" />
  }

  if (runState.error) {
    return <ErrorScreen title="Экран не открылся" message={runState.error} />
  }

  const { nextSteps } = runState.data

  return (
    <>
      <ScreenHeader
        title={nextSteps.title}
        subtitle={nextSteps.subtitle}
        onBack={() =>
          navigate(`/products/${productSlug}/scenarios/${scenarioSlug}/results/${runId}`)
        }
      />

      <section className="result-stack">
        {nextSteps.cards.map((card) => (
          <article className="content-card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="mini-links">
        <button
          className="mini-link-card"
          type="button"
          onClick={() => startTransition(() => navigate(`/products/${productSlug}/scenarios`))}
        >
          <span>Дальше</span>
          <strong>Разобрать другую ситуацию</strong>
        </button>
        <button
          className="mini-link-card"
          type="button"
          onClick={() =>
            startTransition(() =>
              navigate('/chat', {
                state: {
                  context: {
                    productSlug,
                    scenarioSlug,
                    runId,
                  },
                },
              }),
            )
          }
        >
          <span>Инго рядом</span>
          <strong>Спросить Инго</strong>
        </button>
      </section>
    </>
  )
}

function GamesScreen({ games }) {
  const navigate = useNavigate()
  const progress = getGameProgressSummary(games)

  return (
    <>
      <ScreenHeader title="Игры Инсоры" onBack={() => navigate('/')} />

      <section className="hero-card games-hero-card">
        <div className="hero-copy narrow">
          <span className="hero-tag">Игры Инсоры</span>
          <h2>Короткие игры о страховании</h2>
          <p>
            Здесь можно пройти простые интерактивы и разобраться, как работает
            страхование в реальных ситуациях.
          </p>
        </div>
        <Mascot compact variant="games" alt="Инго приглашает в обучающие игры" />
      </section>

      <section className="content-card games-progress-card">
        <div className="section-heading">
          <span className="section-kicker">Твой прогресс</span>
          <h2>Уже видно, что стало понятнее</h2>
        </div>
        <div className="games-progress-grid">
          <article className="progress-stat-card">
            <strong>
              {progress.completedCount}/{games.length}
            </strong>
            <span>Пройдено игр</span>
          </article>
          <article className="progress-stat-card">
            <strong>{progress.remainingLabel}</strong>
            <span>Можно ещё пройти</span>
          </article>
        </div>
      </section>

      <section className="games-list">
        {games.map((game) => {
          const cardProgress = progress.items.find((item) => item.slug === game.slug)

          return (
            <article className="game-card game-launch-card" key={game.slug}>
              <div className="game-card-topline">
                <span className="product-badge">
                  {GAME_CARD_META[game.slug]?.eyebrow || 'Мини-игра'}
                </span>
                <span className="game-status-pill">
                  {cardProgress?.completed
                    ? 'Пройдено'
                    : cardProgress?.started
                      ? 'В процессе'
                      : 'Готово к старту'}
                </span>
              </div>
              <h2>{game.title}</h2>
              <p>{game.subtitle}</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => startTransition(() => navigate(`/games/${game.slug}`))}
              >
                {getGameButtonLabel(cardProgress)}
              </button>
            </article>
          )
        })}
      </section>
    </>
  )
}

function GameScreen({ products }) {
  const { gameSlug } = useParams()
  const gameState = useApiData(gameSlug ? `/api/games/${gameSlug}` : null)

  if (gameState.loading && !gameState.data) {
    return <LoadingScreen title="Открываем игру…" />
  }

  if (gameState.error) {
    return <ErrorScreen title="Игра не открылась" message={gameState.error} />
  }

  return (
    <LoadedGameScreen
      key={`${gameState.data.slug}-${gameState.data.currentRun?.updatedAt || 'fresh'}`}
      game={gameState.data}
      products={products}
    />
  )
}

function LoadedGameScreen({ game, products }) {
  const navigate = useNavigate()
  const [state, setState] = useState(() =>
    normalizeGameState(game.slug, game.currentRun?.state || getDefaultGameState(game.slug)),
  )
  const [saveError, setSaveError] = useState('')
  const accidentProduct = products.find((product) => product.slug === 'accident')

  const persistState = async (nextState, progressPatch) => {
    setState(nextState)
    setSaveError('')

    if (progressPatch) {
      updateGameProgress(game.slug, {
        title: game.title,
        theme: GAME_THEME_LABELS[game.slug] || game.title.toLowerCase(),
        ...progressPatch,
      })
    }

    try {
      await apiPost('/api/game-runs', {
        gameSlug: game.slug,
        state: nextState,
      })
    } catch (error) {
      setSaveError(error.message)
    }
  }

  if (!state) {
    return <LoadingScreen title="Подготавливаем игру…" />
  }

  const openGamesHub = () => startTransition(() => navigate('/games'))
  const openChatFromGame = (scenarioSlug = 'pe') =>
    startTransition(() =>
      navigate('/chat', {
        state: {
          context: {
            productSlug: 'accident',
            scenarioSlug,
            gameSlug: game.slug,
          },
        },
      }),
    )
  const openAccidentFlow = (scenarioSlug) =>
    startTransition(() =>
      navigate(scenarioSlug ? `/products/accident/scenarios/${scenarioSlug}` : '/products/accident/scenarios'),
    )

  if (game.slug === 'situation') {
    const scenarioOptions = accidentProduct?.scenarios || []
    const selectedCase = scenarioOptions.find((scenario) => scenario.slug === state.selectedCase) || null
    const selectedContent = selectedCase ? SITUATION_GAME_CONTENT[selectedCase.slug] : null
    const currentQuestion = selectedContent?.questions[state.currentQuestion] || null
    const currentAnswer = currentQuestion ? state.answers[state.currentQuestion] : undefined
    const score =
      selectedContent?.questions.reduce(
        (total, question, index) =>
          total + (state.answers[index] === question.correctIndex ? 1 : 0),
        0,
      ) || 0

    if (state.phase === 'intro') {
      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle="Выбери жизненную ситуацию и попробуй быстро понять, что в ней самое важное."
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="content-card game-stage-card">
              <span className="section-kicker">Старт игры</span>
              <h2>Выбери жизненную ситуацию и действуй по шагам</h2>
              <p>
                Сначала выбираешь кейс, потом проходишь 3 коротких вопроса и видишь,
                как работает логика страхования.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  void persistState(
                    {
                      ...getDefaultGameState(game.slug),
                      phase: 'case',
                    },
                    { started: true, completed: false, score: 0, total: 3 },
                  )
                }
              >
                Начать
              </button>
            </article>
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    if (state.phase === 'case') {
      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle="Выбери жизненную ситуацию и попробуй быстро понять, что в ней самое важное."
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="content-card">
              <div className="section-heading">
                <span className="section-kicker">Шаг 1</span>
                <h2>Выбери ситуацию</h2>
              </div>
              <div className="product-grid game-case-grid">
                {scenarioOptions.map((scenario) => (
                  <button
                    key={scenario.slug}
                    className="game-choice-card"
                    type="button"
                    onClick={() =>
                      void persistState(
                        {
                          phase: 'question',
                          selectedCase: scenario.slug,
                          currentQuestion: 0,
                          answers: [],
                          completed: false,
                        },
                        { started: true, completed: false, score: 0, total: 3 },
                      )
                    }
                  >
                    <span className="scenario-tag">{scenario.subtitle}</span>
                    <strong>{scenario.title}</strong>
                    <span>{SITUATION_GAME_CONTENT[scenario.slug]?.intro}</span>
                  </button>
                ))}
              </div>
            </article>
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    if (state.phase === 'question' && selectedCase && selectedContent && currentQuestion) {
      const isCorrect = currentAnswer === currentQuestion.correctIndex

      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle={selectedCase.title}
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="content-card game-stage-card">
              <div className="game-progress-row">
                <span className="section-kicker">
                  Вопрос {state.currentQuestion + 1} из {selectedContent.questions.length}
                </span>
                <span className="game-step-chip">{selectedCase.subtitle}</span>
              </div>
              <h2>{currentQuestion.prompt}</h2>
              <p>{selectedContent.intro}</p>
              <div className="game-option-stack">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={option}
                    className={
                      currentAnswer === index
                        ? `option-button ${isCorrect ? 'game-option-correct active' : 'game-option-wrong active'}`
                        : 'option-button'
                    }
                    type="button"
                    disabled={currentAnswer !== undefined}
                    onClick={() =>
                      void persistState({
                        ...state,
                        answers: [...state.answers, index],
                      })
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>

              {currentAnswer !== undefined ? (
                <div className={`game-feedback ${isCorrect ? 'success' : 'warning'}`}>
                  <strong>{isCorrect ? 'Хорошая мысль' : 'Почти'}</strong>
                  <p>{isCorrect ? currentQuestion.success : currentQuestion.hint}</p>
                </div>
              ) : null}

              {currentAnswer !== undefined ? (
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    const isLastQuestion =
                      state.currentQuestion === selectedContent.questions.length - 1
                    const nextState = isLastQuestion
                      ? {
                          ...state,
                          phase: 'result',
                          completed: true,
                        }
                      : {
                          ...state,
                          currentQuestion: state.currentQuestion + 1,
                        }

                    void persistState(nextState, {
                      started: true,
                      completed: isLastQuestion,
                      score,
                      total: selectedContent.questions.length,
                    })
                  }}
                >
                  {state.currentQuestion === selectedContent.questions.length - 1
                    ? 'Показать итог'
                    : 'Дальше'}
                </button>
              ) : null}
            </article>
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    if (state.phase === 'result' && selectedCase && selectedContent) {
      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle={selectedCase.title}
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="result-hero game-result-hero">
              <span className="hero-tag">Итог игры</span>
              <h2>Ты разобрался в ситуации</h2>
              <div className="result-tags">
                <span>
                  {score}/{selectedContent.questions.length} точных шагов
                </span>
                <span>{selectedCase.title}</span>
              </div>
              <p>{selectedContent.summary}</p>
            </article>

            <article className="content-card">
              <h2>Что ты понял</h2>
              <ul className="bullet-list">
                {selectedContent.takeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <GameResultActions
              onScenario={() => openAccidentFlow(selectedCase.slug)}
              onChat={() => openChatFromGame(selectedCase.slug)}
              onBack={openGamesHub}
            />
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    return (
      <>
        <ScreenHeader title={game.title} subtitle="Подготовим игру заново." onBack={() => navigate('/games')} />
        <section className="result-stack">
          <article className="content-card">
            <h2>Давай начнём заново</h2>
            <p>Старое состояние игры устарело. Обновим экран и откроем выбор ситуации заново.</p>
            <button
              className="primary-button"
              type="button"
              onClick={() => void persistState(getDefaultGameState(game.slug))}
            >
              Обновить игру
            </button>
          </article>
        </section>
      </>
    )
  }

  if (game.slug === 'after-injury') {
    const sequence = state.sequence || []
    const expectedStep = AFTER_INJURY_SEQUENCE[sequence.length]
    const wrongChoice = AFTER_INJURY_DISTRACTORS[Math.min(sequence.length, AFTER_INJURY_DISTRACTORS.length - 1)]
    const remainingCorrect = AFTER_INJURY_SEQUENCE.filter((step) => !sequence.includes(step))
    const choices = [...remainingCorrect, wrongChoice]

    if (state.phase === 'intro') {
      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle="Собери правильный порядок действий и пойми, что важно после травмы."
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="content-card game-stage-card">
              <span className="section-kicker">Старт игры</span>
              <h2>Собери правильную последовательность</h2>
              <p>
                Игра короткая: тапай по следующему правильному шагу. Если промахнёшься,
                Инго мягко подскажет.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  void persistState(
                    {
                      ...getDefaultGameState(game.slug),
                      phase: 'play',
                    },
                    { started: true, completed: false, score: 0, total: AFTER_INJURY_SEQUENCE.length },
                  )
                }
              >
                Начать
              </button>
            </article>
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    if (state.phase === 'play') {
      return (
        <>
          <ScreenHeader
            title={game.title}
            subtitle="Собери правильный порядок действий."
            onBack={() => navigate('/games')}
          />

          <section className="result-stack">
            <article className="content-card game-stage-card">
              <div className="game-progress-row">
                <span className="section-kicker">
                  Шаг {sequence.length + 1} из {AFTER_INJURY_SEQUENCE.length}
                </span>
                <span className="game-step-chip">Порядок действий</span>
              </div>
              <h2>Что должно идти дальше?</h2>
              <p>Сначала самое важное, потом то, что помогает не потеряться в деталях.</p>
              <div className="game-option-stack">
                {choices.map((step) => (
                  <button
                    key={step}
                    className="option-button"
                    type="button"
                    onClick={() => {
                      if (step === expectedStep) {
                        const nextSequence = [...sequence, step]
                        const isComplete = nextSequence.length === AFTER_INJURY_SEQUENCE.length
                        void persistState(
                          {
                            phase: isComplete ? 'result' : 'play',
                            sequence: nextSequence,
                            feedback: isComplete
                              ? 'Теперь порядок стал понятнее.'
                              : 'Хороший ход. Это действительно следующий шаг.',
                            feedbackTone: 'success',
                            completed: isComplete,
                          },
                          {
                            started: true,
                            completed: isComplete,
                            score: nextSequence.length,
                            total: AFTER_INJURY_SEQUENCE.length,
                          },
                        )
                        return
                      }

                      void persistState({
                        ...state,
                        feedback: 'Попробуй ещё раз — сначала важнее другой шаг.',
                        feedbackTone: 'warning',
                      })
                    }}
                  >
                    {step}
                  </button>
                ))}
              </div>

              {state.feedback ? (
                <div className={`game-feedback ${state.feedbackTone === 'success' ? 'success' : 'warning'}`}>
                  <strong>{state.feedbackTone === 'success' ? 'Хороший ход' : 'Почти'}</strong>
                  <p>{state.feedback}</p>
                </div>
              ) : null}
            </article>

            <article className="content-card">
              <h2>Собранная цепочка</h2>
              <ol className="ordered-list">
                {sequence.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {!sequence.length ? <p>Пока пусто. Начни с самого важного шага.</p> : null}
            </article>
          </section>

          {saveError ? <p className="status-note">{saveError}</p> : null}
        </>
      )
    }

    return (
      <>
        <ScreenHeader
          title={game.title}
          subtitle="Теперь порядок действий уже выглядит спокойнее и понятнее."
          onBack={() => navigate('/games')}
        />

        <section className="result-stack">
          <article className="result-hero game-result-hero">
            <span className="hero-tag">Итог игры</span>
            <h2>Теперь порядок стал понятнее</h2>
            <div className="result-tags">
              <span>
                {sequence.length}/{AFTER_INJURY_SEQUENCE.length} шагов
              </span>
              <span>После травмы</span>
            </div>
            <p>
              Когда порядок ясен, легче не паниковать: сначала помощь, потом подтверждение,
              затем полис и описание события.
            </p>
          </article>

          <article className="content-card">
            <h2>Правильная последовательность</h2>
            <ol className="ordered-list">
              {AFTER_INJURY_SEQUENCE.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <ul className="bullet-list">
              <li>Сначала важна помощь, а не спор о деньгах.</li>
              <li>Документы и фиксация травмы помогают разбирать ситуацию дальше.</li>
              <li>Полис и описание события подключаются после первых обязательных шагов.</li>
            </ul>
          </article>

          <GameResultActions
            onScenario={() => openAccidentFlow()}
            onChat={() => openChatFromGame()}
            onBack={openGamesHub}
          />
        </section>

        {saveError ? <p className="status-note">{saveError}</p> : null}
      </>
    )
  }

  const sequence = state.sequence || []
  const expectedStep = PAYOUT_PATH_SEQUENCE[sequence.length]
  const wrongChoice = PAYOUT_PATH_DISTRACTORS[Math.min(sequence.length, PAYOUT_PATH_DISTRACTORS.length - 1)]
  const remainingCorrect = PAYOUT_PATH_SEQUENCE.filter((step) => !sequence.includes(step))
  const choices = [...remainingCorrect, wrongChoice]

  if (state.phase === 'intro') {
    return (
      <>
        <ScreenHeader
          title={game.title}
          subtitle="Собери цепочку и закрепи базовую логику страхования."
          onBack={() => navigate('/games')}
        />

        <section className="result-stack">
          <article className="content-card game-stage-card">
            <span className="section-kicker">Старт игры</span>
            <h2>Собери путь от риска до выплаты</h2>
            <p>
              Здесь всё коротко: нажимай карточки по порядку и смотри, как из ситуации
              складывается понятная логика.
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={() =>
                void persistState(
                  {
                    ...getDefaultGameState(game.slug),
                    phase: 'play',
                  },
                  { started: true, completed: false, score: 0, total: PAYOUT_PATH_SEQUENCE.length },
                )
              }
            >
              Начать
            </button>
          </article>
        </section>

        {saveError ? <p className="status-note">{saveError}</p> : null}
      </>
    )
  }

  if (state.phase === 'play') {
    return (
      <>
        <ScreenHeader
          title={game.title}
          subtitle="Закрепи базовую механику страхования."
          onBack={() => navigate('/games')}
        />

        <section className="result-stack">
          <article className="content-card game-stage-card">
            <div className="game-progress-row">
              <span className="section-kicker">
                Шаг {sequence.length + 1} из {PAYOUT_PATH_SEQUENCE.length}
              </span>
              <span className="game-step-chip">Логика страхования</span>
            </div>
            <h2>Что должно идти следующим?</h2>
            <p>Собери путь, по которому страхование обычно читается и объясняется.</p>
            <div className="game-option-stack">
              {choices.map((step) => (
                <button
                  key={step}
                  className="option-button"
                  type="button"
                  onClick={() => {
                    if (step === expectedStep) {
                      const nextSequence = [...sequence, step]
                      const isComplete = nextSequence.length === PAYOUT_PATH_SEQUENCE.length
                      void persistState(
                        {
                          phase: isComplete ? 'result' : 'play',
                          sequence: nextSequence,
                          feedback: isComplete
                            ? 'Теперь логика стала понятнее.'
                            : 'Хорошо. Цепочка складывается именно так.',
                          feedbackTone: 'success',
                          completed: isComplete,
                        },
                        {
                          started: true,
                          completed: isComplete,
                          score: nextSequence.length,
                          total: PAYOUT_PATH_SEQUENCE.length,
                        },
                      )
                      return
                    }

                    void persistState({
                      ...state,
                      feedback: 'Почти. Здесь сначала нужен другой элемент цепочки.',
                      feedbackTone: 'warning',
                    })
                  }}
                >
                  {step}
                </button>
              ))}
            </div>

            {state.feedback ? (
              <div className={`game-feedback ${state.feedbackTone === 'success' ? 'success' : 'warning'}`}>
                <strong>{state.feedbackTone === 'success' ? 'Хороший ход' : 'Почти'}</strong>
                <p>{state.feedback}</p>
              </div>
            ) : null}
          </article>

          <article className="content-card">
            <h2>Твоя цепочка</h2>
            <div className="flow-grid">
              {sequence.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
            {!sequence.length ? <p>Пока пусто. Начни с первого звена.</p> : null}
          </article>
        </section>

        {saveError ? <p className="status-note">{saveError}</p> : null}
      </>
    )
  }

  return (
    <>
      <ScreenHeader
        title={game.title}
        subtitle="Теперь базовая логика читается уже намного увереннее."
        onBack={() => navigate('/games')}
      />

      <section className="result-stack">
        <article className="result-hero game-result-hero">
          <span className="hero-tag">Итог игры</span>
          <h2>Теперь логика стала понятнее</h2>
          <div className="result-tags">
            <span>
              {sequence.length}/{PAYOUT_PATH_SEQUENCE.length} шагов
            </span>
            <span>Путь выплаты</span>
          </div>
          <p>
            Страхование работает не хаотично. Обычно важно понять, где был риск, что
            случилось, чем это подтверждается и только потом — к чему всё ведёт дальше.
          </p>
        </article>

        <article className="content-card">
          <h2>Правильная цепочка</h2>
          <div className="flow-grid">
            {PAYOUT_PATH_SEQUENCE.map((step) => (
              <span key={step}>{step}</span>
            ))}
          </div>
          <ul className="bullet-list">
            <li>Сначала есть риск, из которого может вырасти реальное событие.</li>
            <li>Потом нужно подтверждение, чтобы ситуация стала понятной, а не размытой.</li>
            <li>И только после этого уже говорят о выплате и дальнейших шагах.</li>
          </ul>
        </article>

        <GameResultActions
          onScenario={() => openAccidentFlow()}
          onChat={() => openChatFromGame()}
          onBack={openGamesHub}
        />
      </section>

      {saveError ? <p className="status-note">{saveError}</p> : null}
    </>
  )
}

function AppFrame() {
  const location = useLocation()
  const navigate = useNavigate()
  const bootstrapState = useApiData('/api/bootstrap')
  const productsState = useApiData('/api/products')

  const activeTab = location.pathname.startsWith('/games')
    ? 'games'
    : location.pathname.startsWith('/chat')
      ? 'chat'
      : 'home'

  const navLabels = bootstrapState.data?.nav || {
    games: 'Игры',
    home: 'Главная',
    chat: 'Инго',
  }
  const navItems = [
    { key: 'games', label: navLabels.games, href: '/games' },
    { key: 'home', label: navLabels.home, href: '/' },
    { key: 'chat', label: navLabels.chat, href: '/chat' },
  ]

  const isAppLoading =
    (bootstrapState.loading && !bootstrapState.data) ||
    (productsState.loading && !productsState.data)

  const appError = bootstrapState.error || productsState.error

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <div className="phone-frame">
        <div className="top-strip">
          <button
            className="brand-link"
            type="button"
            aria-label="Инсора, перейти на главную"
            onClick={() => startTransition(() => navigate('/'))}
          >
            <span className="brand-mark">Инсора</span>
            <span className="brand-caption">страховой гид</span>
          </button>
          <nav className="top-nav" aria-label="Главная навигация">
            {navItems.map((item) => (
              <button
                key={item.key}
                className={activeTab === item.key ? 'nav-button active' : 'nav-button'}
                type="button"
                aria-label={item.label}
                aria-current={activeTab === item.key ? 'page' : undefined}
                onClick={() => startTransition(() => navigate(item.href))}
              >
                <span className="nav-button-icon">
                  <NavIcon tab={item.key} />
                </span>
                <span className="nav-button-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <main className="screen">
          {isAppLoading ? (
            <LoadingScreen />
          ) : appError ? (
            <ErrorScreen title="Приложение не загрузилось" message={appError} />
          ) : (
            <Routes>
              <Route
                index
                element={
                  <HomeScreen
                    products={productsState.data}
                  />
                }
              />
              <Route path="/chat" element={<ChatScreen />} />
              <Route path="/products" element={<ProductsScreen products={productsState.data} />} />
              <Route path="/products/:productSlug" element={<ProductScreen />} />
              <Route path="/products/:productSlug/scenarios" element={<ScenarioListScreen />} />
              <Route
                path="/products/:productSlug/scenarios/:scenarioSlug"
                element={<ScenarioScreen />}
              />
              <Route
                path="/products/:productSlug/scenarios/:scenarioSlug/results/:runId"
                element={<ResultScreen />}
              />
              <Route
                path="/products/:productSlug/scenarios/:scenarioSlug/results/:runId/next-steps"
                element={<NextStepsScreen />}
              />
              <Route path="/games" element={<GamesScreen games={bootstrapState.data.games} />} />
              <Route
                path="/games/:gameSlug"
                element={<GameScreen products={productsState.data} />}
              />
              <Route path="*" element={<Navigate replace to="/" />} />
            </Routes>
          )}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppFrame />
    </BrowserRouter>
  )
}
