import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'

import { ensureSession } from './lib/session.js'
import {
  createSimpleScenarioRun,
  evaluateNsScenario,
  getBootstrapPayload,
  getChatHistory,
  getGame,
  getProduct,
  getScenario,
  getScenarioRun,
  listGames,
  listProducts,
  upsertGameRun,
} from './services/content.js'
import { streamChatCompletion } from './services/chat.js'

export async function buildServer() {
  const app = Fastify({
    logger: true,
  })

  await app.register(cookie)
  await app.register(cors, {
    credentials: true,
    origin: true,
  })

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error)

    if (!reply.sent) {
      reply
        .code(error.statusCode && error.statusCode >= 400 ? error.statusCode : 500)
        .send({
          error: error.message || 'Internal server error',
        })
    }
  })

  app.get('/api/health', async () => ({
    ok: true,
  }))

  app.get('/api/bootstrap', async () => getBootstrapPayload())

  app.get('/api/products', async () => listProducts())

  app.get('/api/products/:slug', async (request, reply) => {
    const product = await getProduct(request.params.slug)

    if (!product) {
      return reply.code(404).send({ error: 'Product not found' })
    }

    return product
  })

  app.get('/api/products/:slug/scenarios', async (request, reply) => {
    const product = await getProduct(request.params.slug)

    if (!product) {
      return reply.code(404).send({ error: 'Product not found' })
    }

    return {
      product: {
        slug: product.slug,
        title: product.title,
        description: product.description,
      },
      scenarios: product.scenarios,
    }
  })

  app.get('/api/products/:slug/scenarios/:scenarioSlug', async (request, reply) => {
    const scenario = await getScenario(request.params.slug, request.params.scenarioSlug)

    if (!scenario) {
      return reply.code(404).send({ error: 'Scenario not found' })
    }

    return scenario
  })

  app.post('/api/ns/evaluate', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const { productSlug, scenarioSlug, answers } = request.body || {}

    const run = await evaluateNsScenario({
      sessionId,
      productSlug,
      scenarioSlug,
      answers,
    })

    if (!run) {
      return reply.code(400).send({ error: 'Invalid NS evaluation payload' })
    }

    return run
  })

  app.post('/api/scenario-runs', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const { productSlug, scenarioSlug, stateKey, answers } = request.body || {}

    const run = await createSimpleScenarioRun({
      sessionId,
      productSlug,
      scenarioSlug,
      stateKey,
      answers,
    })

    if (!run) {
      return reply.code(400).send({ error: 'Invalid scenario run payload' })
    }

    return run
  })

  app.get('/api/scenario-runs/:id', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const run = await getScenarioRun(sessionId, request.params.id)

    if (!run) {
      return reply.code(404).send({ error: 'Scenario run not found' })
    }

    return run
  })

  app.get('/api/chat/history', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    return getChatHistory(sessionId)
  })

  app.post('/api/chat/messages', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const { prompt, routeContext } = request.body || {}

    if (!prompt?.trim()) {
      return reply.code(400).send({ error: 'Prompt is required' })
    }

    await streamChatCompletion({
      sessionId,
      prompt: prompt.trim(),
      routeContext,
      reply,
    })
  })

  app.get('/api/games', async () => listGames())

  app.get('/api/games/:slug', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const game = await getGame(sessionId, request.params.slug)

    if (!game) {
      return reply.code(404).send({ error: 'Game not found' })
    }

    return game
  })

  app.post('/api/game-runs', async (request, reply) => {
    const sessionId = await ensureSession(request, reply)
    const { gameSlug, state } = request.body || {}

    const run = await upsertGameRun(sessionId, gameSlug, state)

    if (!run) {
      return reply.code(400).send({ error: 'Invalid game payload' })
    }

    return run
  })

  return app
}
