type Dict = Record<string, any>

export let langs = ['en']
export let defaultLang = 'en'
export let lang = defaultLang

export let options = {
  jsonPath: '/i18n/',
  cookieName: 'LANG'
}

let dict: Dict = {}
let fallback: Dict = dict

export interface Init {
  langs: string[],
  defaultLang?: string,
  lang?: string,
  dicts: {[lang: string]: Dict}
}

export async function init(i: Init) {
  langs = i.langs
  defaultLang = i.defaultLang ?? langs[0]
  lang = i.lang ?? detectLang()
  if (i.dicts) {
    dict = i.dicts[lang]
    fallback = i.dicts[defaultLang]
  }
  else await load()
}

export function detectLang(host = location.host, cookies = document.cookie) {
  const fromCookie = cookies.split('; ').find(s => s.startsWith(options.cookieName + '='))?.split('=')?.[1]
  const lang = ensureSupportedLang(fromCookie ?? navigator.language.split('-')[0])
  if (lang != fromCookie) rememberLang(lang)
  document.documentElement.setAttribute('lang', lang)
  return lang
}

export function rememberLang(lang: string) {
  document.cookie = `${options.cookieName}=${lang};path=/`
}

async function load() {
  if (!langs.includes(lang)) lang = defaultLang
  const promises = [await loadJson(lang).then(r => Object.assign(dict, r))]
  if (defaultLang != lang) {
    fallback = {}
    promises.push(await loadJson(defaultLang).then(r => Object.assign(fallback, r)))
  }
  return Promise.all(promises)
}

function loadJson(lang: string) {
  return fetch(`${options.jsonPath}${lang}.json?${window['version']}`).then(r => r.json())
}

export function ensureSupportedLang(lang: string) {
  return langs.includes(lang) ? lang : defaultLang
}

export function _(key: string, options?: {values: object}, from: Dict = dict): string {
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
