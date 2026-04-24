import 'dotenv/config'
import process from 'node:process'

import { prisma } from '../server/src/lib/prisma.js'
import { loadPrototypeSnapshot } from '../server/content/loadSnapshot.js'

const GAME_CONFIG = {
  situation: [
    {
      label: 'Что здесь важно',
      body: 'Сначала важно понять само событие.',
      sortOrder: 1,
    },
    {
      label: 'Что сделать сначала',
      body: 'Не паниковать и зафиксировать, что произошло.',
      sortOrder: 2,
    },
    {
      label: 'Что влияет на итог',
      body: 'Подтверждение и документы.',
      sortOrder: 3,
    },
  ],
  'after-injury': [
    { label: 'обратиться за помощью', sortOrder: 1 },
    { label: 'зафиксировать травму', sortOrder: 2 },
    { label: 'найти данные полиса', sortOrder: 3 },
    { label: 'подготовить описание события', sortOrder: 4 },
  ],
  'payout-path': [
    { label: 'Риск', sortOrder: 1 },
    { label: 'Событие', sortOrder: 2 },
    { label: 'Подтверждение', sortOrder: 3 },
    { label: 'Выплата', sortOrder: 4 },
  ],
}

const {
  CHAT_INTRO,
  QUICK_ACTIONS,
  PRODUCT_ORDER,
  PRODUCTS,
  NS_QUESTIONS,
  NS_PERSONALIZATION,
  NS_RESULTS,
  GAMES,
  HOME_METRICS,
  HOME_FLOW,
} = loadPrototypeSnapshot()

async function resetDatabase() {
  await prisma.gameRun.deleteMany()
  await prisma.scenarioRun.deleteMany()
  await prisma.chatMessage.deleteMany()
  await prisma.session.deleteMany()
  await prisma.gameStep.deleteMany()
  await prisma.game.deleteMany()
  await prisma.nsResult.deleteMany()
  await prisma.nsPersonalization.deleteMany()
  await prisma.nsQuestion.deleteMany()
  await prisma.scenario.deleteMany()
  await prisma.productFaq.deleteMany()
  await prisma.product.deleteMany()
  await prisma.appConfig.deleteMany()
}

async function seedAppConfig() {
  await prisma.appConfig.create({
    data: {
      id: 'singleton',
      quickActions: QUICK_ACTIONS,
      homeMetrics: HOME_METRICS,
      homeFlow: HOME_FLOW,
      chatIntro: CHAT_INTRO,
    },
  })
}

async function seedProducts() {
  for (const [productIndex, productKey] of PRODUCT_ORDER.entries()) {
    const product = PRODUCTS[productKey]

    const createdProduct = await prisma.product.create({
      data: {
        sortOrder: productIndex,
        key: product.key,
        slug: product.key,
        title: product.title,
        badge: product.badge,
        homeText: product.homeText,
        description: product.description,
        helpTitle: product.helpTitle,
        helpIntro: product.helpIntro,
        helpList: product.helpList,
        helpOutro: product.helpOutro,
        scenarioIntro: product.scenarioIntro,
        faqs: {
          create: product.faq.map((faq, faqIndex) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: faqIndex,
          })),
        },
      },
    })

    for (const [scenarioIndex, scenario] of product.scenarios.entries()) {
      const createdScenario = await prisma.scenario.create({
        data: {
          productId: createdProduct.id,
          sortOrder: scenarioIndex,
          key: scenario.key,
          slug: scenario.key,
          title: scenario.title,
          subtitle: scenario.subtitle,
          scenarioType: productKey === 'accident' ? 'NS' : 'SIMPLE',
          simpleStates:
            productKey === 'accident'
              ? undefined
              : {
                  happened: scenario.results.happened,
                  checking: scenario.results.checking,
                },
        },
      })

      if (productKey === 'accident') {
        const resultGroups = NS_RESULTS[scenario.key]

        for (const [status, injuries] of Object.entries(resultGroups)) {
          for (const [injury, result] of Object.entries(injuries)) {
            await prisma.nsResult.create({
              data: {
                scenarioId: createdScenario.id,
                status,
                injury,
                title: result.title,
                summary: result.summary,
                risk: result.risk,
                caseText: result.case,
                payout: result.payout,
                example: result.example,
                note: result.note,
              },
            })
          }
        }
      }
    }
  }
}

async function seedNsMeta() {
  for (const [index, question] of NS_QUESTIONS.entries()) {
    await prisma.nsQuestion.create({
      data: {
        key: question.key,
        title: question.title,
        options: question.options,
        sortOrder: index,
      },
    })
  }

  for (const [groupKey, values] of Object.entries(NS_PERSONALIZATION)) {
    for (const [key, text] of Object.entries(values)) {
      await prisma.nsPersonalization.create({
        data: {
          groupKey,
          key,
          text,
        },
      })
    }
  }
}

async function seedGames() {
  for (const [gameIndex, game] of GAMES.entries()) {
    await prisma.game.create({
      data: {
        sortOrder: gameIndex,
        key: game.key,
        slug: game.key,
        title: game.title,
        subtitle: game.subtitle,
        steps: {
          create: (GAME_CONFIG[game.key] || []).map((step) => ({
            label: step.label,
            body: step.body,
            sortOrder: step.sortOrder,
            meta: step.meta,
          })),
        },
      },
    })
  }
}

async function main() {
  await resetDatabase()
  await seedAppConfig()
  await seedProducts()
  await seedNsMeta()
  await seedGames()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
