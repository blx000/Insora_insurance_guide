import { prisma } from '../lib/prisma.js'
import {
  buildConfiguredScenarioResult,
  getConfiguredProduct,
  getConfiguredScenario,
  listConfiguredProducts,
} from './scenarioConfig.js'

const APP_CONFIG_ID = 'singleton'

function formatProductSummary(product) {
  return {
    key: product.key,
    slug: product.slug,
    title: product.title,
    badge: product.badge,
    homeText: product.homeText,
    description: product.description,
    scenarioCount: product.scenarios.length,
    faqCount: product.faq.length,
    scenarios: product.scenarios.map((scenario) => ({
      slug: scenario.slug,
      title: scenario.title,
      subtitle: scenario.subtitle,
      scenarioType: scenario.scenarioType,
      hasQuestionnaire: scenario.hasQuestionnaire,
    })),
  }
}

function formatProductDetail(product) {
  return {
    key: product.key,
    slug: product.slug,
    title: product.title,
    badge: product.badge,
    homeText: product.homeText,
    description: product.description,
    helpTitle: product.helpTitle,
    helpIntro: product.helpIntro,
    helpList: product.helpList,
    helpOutro: product.helpOutro,
    scenarioIntro: product.scenarioIntro,
    faq: product.faq,
    scenarios: product.scenarios.map((scenario) => ({
      slug: scenario.slug,
      title: scenario.title,
      subtitle: scenario.subtitle,
      scenarioType: scenario.scenarioType,
      hasQuestionnaire: scenario.hasQuestionnaire,
    })),
  }
}

function buildNextSteps({ product, scenario, stateKey }) {
  const subtitle = scenario?.title || product.title

  if (product.slug === 'accident') {
    if (stateKey === 'happened') {
      return {
        title: 'Что делать дальше',
        subtitle,
        cards: [
          {
            title: '1. Обратиться за помощью',
            text: 'Сначала важно заняться самой травмой и не откладывать помощь.',
          },
          {
            title: '2. Зафиксировать травму',
            text: 'Нужны документы и подтверждение того, что ситуация действительно произошла.',
          },
          {
            title: '3. Найти данные полиса',
            text: 'Хорошо, если сразу понятно, где лежит полис и какие там условия.',
          },
          {
            title: '4. Подготовить описание события',
            text: 'Коротко собери, что случилось, где это было и что подтверждает травму.',
          },
        ],
      }
    }

    return {
      title: 'Что делать дальше',
      subtitle,
      cards: [
        {
          title: 'Пойми свой самый частый риск',
          text: 'Школа, улица, каток или активный отдых — начни с той ситуации, которая встречается чаще всего.',
        },
        {
          title: 'Проверь, как читается сам сценарий',
          text: 'Смысл полиса легче понять не по терминам, а по реальным жизненным примерам.',
        },
        {
          title: 'Сохрани план заранее',
          text: 'Полезно заранее знать, где лежат документы и как быстро найти данные полиса.',
        },
      ],
    }
  }

  if (stateKey === 'happened') {
    return {
      title: 'Что делать дальше',
      subtitle,
      cards: [
        {
          title: 'Сначала зафиксируй саму ситуацию',
          text: 'Важно собрать понятную картину: что случилось, где и когда это произошло.',
        },
        {
          title: 'Собери подтверждение',
          text: 'Документы, переписка, чеки или медицинские записи помогают не потеряться в деталях.',
        },
        {
          title: 'Проверь условия продукта',
          text: 'После этого проще понять, что относится к продукту, а что нет.',
        },
      ],
    }
  }

  return {
    title: 'Что делать дальше',
    subtitle,
    cards: [
      {
        title: 'Пойми свой вероятный риск',
        text: 'Выбери ту ситуацию, которая у тебя реально может случиться, а не абстрактный сценарий.',
      },
      {
        title: 'Проверь формат активности',
        text: 'Поездка, спорт, событие или цифровая среда требуют немного разного подхода.',
      },
      {
        title: 'Сохрани спокойный план',
        text: 'Лучше заранее понимать, какие подтверждения и шаги будут важны, если что-то пойдёт не по плану.',
      },
    ],
  }
}

async function getAppConfig() {
  return prisma.appConfig.findUnique({
    where: { id: APP_CONFIG_ID },
  })
}

export async function getBootstrapPayload() {
  const [config, games] = await Promise.all([
    getAppConfig(),
    prisma.game.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        key: true,
        slug: true,
        title: true,
        subtitle: true,
      },
    }),
  ])

  return {
    quickActions: config.quickActions,
    homeMetrics: config.homeMetrics,
    homeFlow: config.homeFlow,
    chatIntro: config.chatIntro,
    games,
    nav: {
      games: 'Игры',
      home: 'Главная',
      chat: 'Инго',
    },
  }
}

export async function listProducts() {
  return listConfiguredProducts().map(formatProductSummary)
}

export async function getProduct(slug) {
  const product = getConfiguredProduct(slug)

  if (!product) {
    return null
  }

  return formatProductDetail(product)
}

export async function getScenario(productSlug, scenarioSlug) {
  const configuredScenario = getConfiguredScenario(productSlug, scenarioSlug)

  if (!configuredScenario) {
    return null
  }

  const { product, scenario, questions } = configuredScenario
  const payload = {
    product: {
      slug: product.slug,
      title: product.title,
      description: product.description,
    },
    scenario: {
      slug: scenario.slug,
      title: scenario.title,
      subtitle: scenario.subtitle,
      scenarioType: scenario.scenarioType,
    },
    questions,
  }

  return payload
}

export async function evaluateNsScenario({
  sessionId,
  productSlug,
  scenarioSlug,
  answers,
}) {
  const configuredScenario = getConfiguredScenario(productSlug, scenarioSlug)

  if (!configuredScenario || configuredScenario.product.slug !== 'accident') {
    return null
  }

  const evaluation = buildConfiguredScenarioResult({
    productSlug,
    scenarioSlug,
    answers,
  })

  if (!evaluation) {
    return null
  }

  const { product, scenario } = configuredScenario
  const resultPayload = evaluation.result
  const nextSteps = buildNextSteps({
    product,
    scenario,
    stateKey: evaluation.stateKey,
  })

  const run = await prisma.scenarioRun.create({
    data: {
      sessionId,
      productSlug,
      scenarioSlug,
      stateKey: evaluation.stateKey,
      answers,
      result: resultPayload,
      nextSteps,
    },
  })

  return {
    id: run.id,
    productSlug,
    scenarioSlug,
    stateKey: run.stateKey,
    answers,
    result: resultPayload,
    nextSteps,
  }
}

export async function createSimpleScenarioRun({
  sessionId,
  productSlug,
  scenarioSlug,
  stateKey,
  answers,
}) {
  const configuredScenario = getConfiguredScenario(productSlug, scenarioSlug)

  if (!configuredScenario || configuredScenario.product.slug === 'accident') {
    return null
  }

  const evaluation =
    answers && Object.keys(answers).length
      ? buildConfiguredScenarioResult({
          productSlug,
          scenarioSlug,
          answers,
        })
      : null

  if (!evaluation && !stateKey) {
    return null
  }

  const { product, scenario } = configuredScenario
  const resolvedStateKey = evaluation?.stateKey || stateKey
  const resultPayload = evaluation?.result

  if (!resultPayload) {
    return null
  }

  const nextSteps = buildNextSteps({
    product,
    scenario,
    stateKey: resolvedStateKey,
  })

  const run = await prisma.scenarioRun.create({
    data: {
      sessionId,
      productSlug,
      scenarioSlug,
      stateKey: resolvedStateKey,
      answers,
      result: resultPayload,
      nextSteps,
    },
  })

  return {
    id: run.id,
    productSlug,
    scenarioSlug,
    stateKey: run.stateKey,
    answers,
    result: resultPayload,
    nextSteps,
  }
}

export async function getScenarioRun(sessionId, runId) {
  const run = await prisma.scenarioRun.findFirst({
    where: {
      id: runId,
      sessionId,
    },
  })

  if (!run) {
    return null
  }

  const configuredScenario = getConfiguredScenario(run.productSlug, run.scenarioSlug)

  if (!configuredScenario) {
    return null
  }

  const { product, scenario } = configuredScenario

  return {
    id: run.id,
    productSlug: run.productSlug,
    scenarioSlug: run.scenarioSlug,
    stateKey: run.stateKey,
    answers: run.answers,
    result: run.result,
    nextSteps: run.nextSteps,
    scenario: {
      title: scenario.title,
      subtitle: scenario.subtitle,
      scenarioType: scenario.scenarioType,
    },
    product: {
      title: product.title,
      slug: product.slug,
    },
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  }
}

export async function listGames() {
  const games = await prisma.game.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      key: true,
      slug: true,
      title: true,
      subtitle: true,
    },
  })

  return games
}

export async function getGame(sessionId, slug) {
  const game = await prisma.game.findUnique({
    where: { slug },
    include: {
      steps: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!game) {
    return null
  }

  const run = await prisma.gameRun.findUnique({
    where: {
      sessionId_gameSlug: {
        sessionId,
        gameSlug: slug,
      },
    },
  })

  return {
    key: game.key,
    slug: game.slug,
    title: game.title,
    subtitle: game.subtitle,
    steps: game.steps.map((step) => ({
      label: step.label,
      body: step.body,
      sortOrder: step.sortOrder,
      meta: step.meta,
    })),
    currentRun: run
      ? {
          id: run.id,
          state: run.state,
          updatedAt: run.updatedAt,
        }
      : null,
  }
}

export async function upsertGameRun(sessionId, gameSlug, state) {
  const game = await prisma.game.findUnique({
    where: { slug: gameSlug },
  })

  if (!game) {
    return null
  }

  const run = await prisma.gameRun.upsert({
    where: {
      sessionId_gameSlug: {
        sessionId,
        gameSlug,
      },
    },
    create: {
      sessionId,
      gameSlug,
      state,
    },
    update: {
      state,
    },
  })

  return {
    id: run.id,
    gameSlug: run.gameSlug,
    state: run.state,
    updatedAt: run.updatedAt,
  }
}

export async function getChatHistory(sessionId) {
  const [config, messages] = await Promise.all([
    getAppConfig(),
    prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        text: true,
        createdAt: true,
      },
    }),
  ])

  return {
    intro: config.chatIntro,
    quickActions: config.quickActions,
    messages: messages.map((message) => ({
      id: message.id,
      role: message.role === 'ASSISTANT' ? 'assistant' : 'user',
      text: message.text,
      createdAt: message.createdAt,
    })),
  }
}

export async function buildChatKnowledgeBundle(sessionId, routeContext = {}) {
  const [products, latestRun, config] = await Promise.all([
    prisma.product.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        scenarios: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    }),
    prisma.scenarioRun.findFirst({
      where: { sessionId },
      orderBy: { updatedAt: 'desc' },
    }),
    getAppConfig(),
  ])

  return {
    quickActions: config.quickActions,
    routeContext,
    latestScenarioRun: latestRun
      ? {
          productSlug: latestRun.productSlug,
          scenarioSlug: latestRun.scenarioSlug,
          stateKey: latestRun.stateKey,
          result: latestRun.result,
        }
      : null,
    products: products.map((product) => ({
      slug: product.slug,
      title: product.title,
      description: product.description,
      helpIntro: product.helpIntro,
      scenarios: product.scenarios.map((scenario) => ({
        slug: scenario.slug,
        title: scenario.title,
        subtitle: scenario.subtitle,
      })),
      faq: product.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })),
    })),
  }
}
