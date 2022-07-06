import type {Options} from './i18n'
import {init as i18n, lang} from './i18n.js'
import {init as formatters} from './formatters.js'

export * from './i18n.js'
export * from './formatters.js'

export async function init(i: Options) {
  await i18n(i)
  formatters(lang + '-GB')
}
