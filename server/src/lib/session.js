import { randomUUID } from 'node:crypto'

import { prisma } from './prisma.js'

const SESSION_COOKIE = 'insora_sid'

export async function ensureSession(request, reply) {
  let sessionId = request.cookies[SESSION_COOKIE]

  if (sessionId) {
    const existing = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (existing) {
      return existing.id
    }
  }

  sessionId = randomUUID()

  const session = await prisma.session.create({
    data: { id: sessionId },
  })

  reply.setCookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  return session.id
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}
