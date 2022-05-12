import type {Init} from './i18n'
import {init as i18n, lang} from './i18n'
import {init as formatters} from './formatters'

export * from './i18n'
export * from './formatters'

export async function init(i: Init) {
  await i18n(i)
  formatters(lang + '-GB')
}
