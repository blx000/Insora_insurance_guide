import OpenAI from 'openai'
import process from 'node:process'

import { prisma } from '../lib/prisma.js'
import { buildChatKnowledgeBundle } from './content.js'

let client

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return client
}

function buildSystemPrompt(bundle) {
  return `
Ты Инго — дружелюбный русскоязычный помощник сервиса Инсора.

Правила:
- Отвечай только на русском.
- Пиши коротко, понятно, без страхового жаргона и без официального тона.
- Аудитория: подростки 11–18 и их родители.
- Объясняй страхование через простые жизненные ситуации.
- Не придумывай покрытия или условия, которых нет в контексте.
- Если информации в контексте не хватает, честно скажи, что это зависит от конкретного полиса и предложи открыть нужный продукт или сценарий.
- Не отвечай на темы вне Инсоры и страховых/цифровых ситуаций; мягко верни разговор к продуктам, сценариям, играм и разбору ситуации.
- Если уместно, предлагай конкретный переход: продукты, чат, игры, разбор ситуации.

Контекст продукта:
${JSON.stringify(bundle, null, 2)}
`.trim()
}

export async function streamChatCompletion({
  sessionId,
  prompt,
  routeContext,
  reply,
}) {
  const openai = getClient()

  if (!openai) {
    throw Object.assign(new Error('Чат Инго пока не активирован: нужен OPENAI_API_KEY.'), {
      statusCode: 500,
    })
  }

  const [bundle, history] = await Promise.all([
    buildChatKnowledgeBundle(sessionId, routeContext),
    prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ])

  await prisma.chatMessage.create({
    data: {
      sessionId,
      role: 'USER',
      text: prompt,
    },
  })

  const messages = [
    {
      role: 'system',
      content: buildSystemPrompt(bundle),
    },
    ...history.reverse().map((message) => ({
      role: message.role === 'ASSISTANT' ? 'assistant' : 'user',
      content: message.text,
    })),
    {
      role: 'user',
      content: prompt,
    },
  ]

  const stream = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
    messages,
    stream: true,
    temperature: 0.5,
  })

  reply.hijack()
  reply.raw.writeHead(200, {
    'Content-Type': 'application/x-ndjson; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })

  let assistantText = ''

  try {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content

      if (!delta) {
        continue
      }

      assistantText += delta
      reply.raw.write(`${JSON.stringify({ type: 'delta', delta })}\n`)
    }

    const finalText = assistantText.trim() || 'Я рядом. Попробуй спросить ещё раз чуть конкретнее.'

    const savedMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'ASSISTANT',
        text: finalText,
      },
    })

    reply.raw.write(
      `${JSON.stringify({
        type: 'done',
        message: {
          id: savedMessage.id,
          role: 'assistant',
          text: savedMessage.text,
          createdAt: savedMessage.createdAt,
        },
      })}\n`,
    )
    reply.raw.end()
  } catch (error) {
    reply.raw.write(
      `${JSON.stringify({
        type: 'error',
        message: 'Не получилось получить ответ Инго. Попробуй ещё раз.',
      })}\n`,
    )
    reply.raw.end()
    throw error
  }
}
