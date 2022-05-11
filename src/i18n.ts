import langs from '../sample/langs.json'

const LANG_COOKIE = 'LANG'

export {langs}
export const defaultLang = langs[0]
export let lang = detectLang()

let dict = {}
let fallback = dict

type Date_ = string|number|Date|undefined
const toDate = (d: Date_) => d instanceof Date ? d : d ? new Date(d) : undefined

const dateFormat = new Intl.DateTimeFormat(lang + '-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})
export const formatDate = (d: Date_) => d ? dateFormat.format(toDate(d)) : ''

let date = new Date()
export const today = date.toLocaleDateString('lt')

date.setDate(date.getDate() - 1)
export const yesterday = date.toLocaleDateString('lt')

const dateTimeFormat = new Intl.DateTimeFormat(lang + '-GB', {day: 'numeric', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'})
export const formatDateTime = (d: Date_) => d ? dateTimeFormat.format(toDate(d)) : ''

export const formatAmount = (o: {amount: number, currency?: string}|string|number, currency = o?.['currency'], options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(lang, currency && {currency, style: 'currency', ...options}).format(o?.['amount'] ?? o)

export const formatCurrency = (currency: string) =>
  new Intl.NumberFormat(lang, {currency, style: 'currency'}).format(0).replace(/[0-9., ]/g, '')

export const formatId = (uuid: string) => uuid.substring(28).toUpperCase()

export function rememberLang(lang: string) {
  document.cookie = `${LANG_COOKIE}=${lang};path=/`
}

export function detectLang(host = location.host, cookies = document.cookie) {
  const fromCookie = cookies.split('; ').find(s => s.startsWith(LANG_COOKIE + '='))?.split('=')?.[1]
  const lang = ensureSupportedLang(fromCookie ?? navigator.language.split('-')[0])
  if (lang != fromCookie) rememberLang(lang)
  document.documentElement.setAttribute('lang', lang)
  return lang
}

export async function loadTranslations() {
  if (!langs.includes(lang)) lang = defaultLang
  const promises = [await loadJson(lang).then(r => Object.assign(dict, r))]
  if (defaultLang != lang) {
    fallback = {}
    promises.push(await loadJson(defaultLang).then(r => Object.assign(fallback, r)))
  }
  return Promise.all(promises)
}

export function setTestTranslations(d) {
  fallback = dict = d
}

function loadJson(lang: string) {
  return fetch(`/i18n/${lang}.json?${window['version']}`).then(r => r.json())
}

export function ensureSupportedLang(lang: string) {
  return langs.includes(lang) ? lang : defaultLang
}

export function _(key: string, options?: {values: object}, from: object = dict): string {
  const keys = key.split('\.')
  let result: any = from

  for (let k of keys) {
    result = result[k]
    if (result == undefined) return from === fallback ? key : _(key, options, fallback)
  }

  if (result && options?.values) result = replaceValues(lang, result, options.values)
  return result ?? key
}

export function __(key: string): string|undefined {
  const result = _(key)
  return result != key ? result : undefined
}

function replaceValues(lang: string, text: string, values: object) {
  let lastPos = 0, bracePos = 0, result = ''
  while ((bracePos = text.indexOf('{', lastPos)) >= 0) {
    result += text.substring(lastPos, bracePos)
    let closingPos = text.indexOf('}', bracePos)
    const textToReplace = text.substring(bracePos + 1, closingPos)
    result += replacePlaceholder(textToReplace, values, lang)
    lastPos = closingPos + 1
  }
  result += text.substring(lastPos)
  return result
}

function replacePlaceholder(text: string, values: object, lang: string) {
  const pluralTokens = text.split('|')
  const field = pluralTokens[0]
  if (pluralTokens.length == 1) return values[field] ?? field

  const pluralRules = new Intl.PluralRules(lang)
  const key = values[field] === 0 ? 'zero' : pluralRules.select(values[field])

  for (let i = 1; i < pluralTokens.length; i++) {
    const [candidateKey, candidateText] = pluralTokens[i].split(':', 2)
    if (candidateKey === key) return candidateText.replace('#', values[field])
  }
  return field
}
