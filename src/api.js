async function readJson(response) {
  if (response.status === 502 || response.status === 503 || response.status === 504) {
    throw new Error('API Инсоры недоступен. Подними backend и проверь локальную базу данных.')
  }

  if (response.ok) {
    return response.json()
  }

  let message = 'Не получилось загрузить данные.'

  try {
    const payload = await response.json()
    message = payload.error || message
  } catch {
    message = response.statusText || message
  }

  throw new Error(message)
}

export async function apiGet(path) {
  let response

  try {
    response = await fetch(path, {
      credentials: 'include',
    })
  } catch {
    throw new Error('Не получилось подключиться к API Инсоры. Проверь, что backend запущен.')
  }

  return readJson(response)
}

export async function apiPost(path, body) {
  let response

  try {
    response = await fetch(path, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Не получилось подключиться к API Инсоры. Проверь, что backend запущен.')
  }

  return readJson(response)
}

export async function streamChatMessage(body, { onEvent }) {
  let response

  try {
    response = await fetch('/api/chat/messages', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Не получилось подключиться к API Инсоры. Проверь, что backend запущен.')
  }

  if (!response.ok) {
    await readJson(response)
  }

  const reader = response.body?.getReader()

  if (!reader) {
    throw new Error('Ответ чата недоступен.')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.trim()) {
        continue
      }

      onEvent(JSON.parse(line))
    }
  }

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer))
  }
}
