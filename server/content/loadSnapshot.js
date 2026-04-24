import { readFileSync } from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SNAPSHOT_PATH = path.join(__dirname, 'prototypeSnapshot.jsx')

export function loadPrototypeSnapshot() {
  const source = readFileSync(SNAPSHOT_PATH, 'utf8')
  const start = source.indexOf('const CHAT_INTRO =')
  const end = source.indexOf('function App()')

  if (start === -1 || end === -1) {
    throw new Error('Unable to extract content snapshot from prototypeSnapshot.jsx')
  }

  const script = `
${source.slice(start, end)}
module.exports = {
  CHAT_INTRO,
  QUICK_ACTIONS,
  PRODUCT_ORDER,
  PRODUCTS,
  NS_QUESTIONS,
  NS_PERSONALIZATION,
  NS_RESULTS,
  GAMES,
  HOME_METRICS,
  HOME_FLOW
}
`

  const context = {
    module: { exports: {} },
    exports: {},
  }

  vm.runInNewContext(script, context)

  return context.module.exports
}
