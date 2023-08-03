export type Dict = Record<string, any>
export type Values = {[name: string]: any}

export let jsonPath = '/i18n/'
export let version = ''
export let cookieName = 'LANG'

export let langs = ['en']
export let defaultLang = 'en'
export let lang = defaultLang
export let fallbackToDefault = true

let dict: Dict = {}

export interface Options {
  langs: string[],
  defaultLang?: string,
  lang?: string,
  fallbackToDefault?: boolean
  dicts?: {[lang: string]: Dict}
  selectLang?: () => string|undefined
  jsonPath?: string
  version?: string
  cookieName?: string
}

export async function init(opts: Options) {
  langs = opts.langs
  defaultLang = opts.defaultLang ?? langs[0]
  fallbackToDefault = opts.fallbackToDefault ?? true
  lang = opts.lang ?? detectLang(opts.selectLang)
  if (opts.jsonPath) jsonPath = opts.jsonPath
  if (opts.version) version = opts.version
  if (opts.cookieName) cookieName = opts.cookieName
  if (opts.dicts) {
    dict = opts.dicts[lang]
    if (fallbackToDefault) mergeDicts(dict, opts.dicts[defaultLang])
  } else await loadDict()
}

export function detectLang(selectLang?: () => string|undefined, host = location.host, cookies = document.cookie) {
  const fromCookie = cookies.split('; ').find(s => s.startsWith(cookieName + '='))?.split('=')?.[1]
  const lang = ensureSupportedLang(fromCookie ?? selectLang?.() ?? navigator.language.split('-')[0])
  if (lang != fromCookie) rememberLang(lang)
  document.documentElement.setAttribute('lang', lang)
  return lang
}

export function rememberLang(lang: string) {
  document.cookie = `${cookieName}=${lang};path=/`
}

async function loadDict() {
  if (!langs.includes(lang)) lang = defaultLang
  const promises = [loadJson(lang).then(r => dict = r)]
  let fallback: Dict|undefined
  if (defaultLang != lang && fallbackToDefault)
    promises.push(loadJson(defaultLang).then(r => fallback = r))
  await Promise.all(promises)
  if (fallback) mergeDicts(dict, fallback)
}

function loadJson(lang: string) {
  return fetch(`${jsonPath}${lang}.json${version ? '?' + version : ''}`).then(r => r.json())
}

export function ensureSupportedLang(lang: string) {
  return langs.includes(lang) ? lang : defaultLang
}

export function _(key: string, values?: Values, from: Dict = dict): string {
  const keys = key.split('.')
  let result: any = from

  for (let k of keys) {
    result = result[k]
    if (!result) break
  }

  if (result && values) result = replaceValues(result, values)
  return result ?? key
}

export function __(key: string, values?: Values): string|undefined {
  const result = _(key, values)
  return result != key ? result : undefined
}

export function mergeDicts(dict: Dict, defaultDict: Dict, noTranslate: Set<string> = new Set(), parent = ''): any {
  for (const key in defaultDict) {
    const fullKey = (parent ? parent + '.' : '') + key
    if (typeof dict[key] === 'object' && typeof defaultDict[key] === 'object')
      dict[key] = mergeDicts(dict[key], defaultDict[key], noTranslate, fullKey)
    else if (!dict[key]) {
      dict[key] = defaultDict[key]
      if (!noTranslate.has(fullKey)) console.warn(`  added missing ${fullKey}`)
    }
  }
  return dict
}

function replaceValues(text: string, values: Values) {
  let lastPos = 0, bracePos = 0, result = ''
  while ((bracePos = text.indexOf('{', lastPos)) >= 0) {
    result += text.substring(lastPos, bracePos)
    let closingPos = text.indexOf('}', bracePos)
    const textToReplace = text.substring(bracePos + 1, closingPos)
    result += replacePlaceholder(textToReplace, values)
    lastPos = closingPos + 1
  }
  result += text.substring(lastPos)
  return result
}

function replacePlaceholder(text: string, values: Values) {
  const pluralTokens = text.split('|')
  const field = pluralTokens[0]
  if (pluralTokens.length == 1) return values[field] ?? field

  const key = new Intl.PluralRules(lang).select(values[field])
  const zeroKey = values[field] === 0 ? 'zero' : ''

  for (let i = 1; i < pluralTokens.length; i++) {
    const [candidateKey, candidateText] = pluralTokens[i].split(':', 2)
    if (candidateKey === key || candidateKey == zeroKey) return candidateText.replace('#', values[field])
  }
  return field
}
