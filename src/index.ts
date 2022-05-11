import {I18n} from './I18n'
import {Formatters} from './Formatters'

export let i18n = new I18n()
export let formatters = new Formatters()

export function init(availableLangs: string[]) {
  i18n.langs = availableLangs
  i18n.defaultLang = availableLangs[0]
  i18n.lang = i18n.detectLang()
  formatters.lang = i18n.lang
}

export const _ = i18n.translate
export const __ = i18n.translateRaw
export const ensureSupportedLang = i18n.ensureSupportedLang
export const rememberLang = i18n.rememberLang
export const detectLang = i18n.detectLang
export const formatDate = formatters.formatDate
export const formatDateTime = formatters.formatDateTime
export const formatAmount = formatters.formatAmount
export const formatCurrency = formatters.formatCurrency
