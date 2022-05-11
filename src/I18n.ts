type Dict = Record<string, any>

export class I18n {
  langs!: string[]
  defaultLang!: string
  lang!: string

  dict: Dict = {}
  fallback: Dict = this.dict

  constructor(
    public readonly jsonPath = '/i18n/',
    public readonly cookie = 'LANG'
  ) {}

  detectLang(host = location.host, cookies = document.cookie) {
    const fromCookie = cookies.split('; ').find(s => s.startsWith(this.cookie + '='))?.split('=')?.[1]
    const lang = this.ensureSupportedLang(fromCookie ?? navigator.language.split('-')[0])
    if (lang != fromCookie) this.rememberLang(lang)
    document.documentElement.setAttribute('lang', lang)
    return lang
  }

  rememberLang(lang: string) {
    document.cookie = `${this.cookie}=${lang};path=/`
  }

  async load() {
    if (!this.langs.includes(this.lang)) this.lang = this.defaultLang
    const promises = [await this.loadJson(this.lang).then(r => Object.assign(this.dict, r))]
    if (this.defaultLang != this.lang) {
      this.fallback = {}
      promises.push(await this.loadJson(this.defaultLang).then(r => Object.assign(this.fallback, r)))
    }
    return Promise.all(promises)
  }

  private loadJson(lang: string) {
    return fetch(`${this.jsonPath}${lang}.json?${window['version']}`).then(r => r.json())
  }

  ensureSupportedLang(lang: string) {
    return this.langs.includes(lang) ? lang : this.defaultLang
  }

  translate(key: string, options?: {values: object}, from: object = this.dict): string {
    const keys = key.split('\.')
    let result: any = from

    for (let k of keys) {
      result = result[k]
      if (result == undefined) return from === this.fallback ? key : this.translate(key, options, this.fallback)
    }

    if (result && options?.values) result = this.replaceValues(this.lang, result, options.values)
    return result ?? key
  }

  translateRaw(key: string): string|undefined {
    const result = this.translate(key)
    return result != key ? result : undefined
  }

  private replaceValues(lang: string, text: string, values: object) {
    let lastPos = 0, bracePos = 0, result = ''
    while ((bracePos = text.indexOf('{', lastPos)) >= 0) {
      result += text.substring(lastPos, bracePos)
      let closingPos = text.indexOf('}', bracePos)
      const textToReplace = text.substring(bracePos + 1, closingPos)
      result += this.replacePlaceholder(textToReplace, values, lang)
      lastPos = closingPos + 1
    }
    result += text.substring(lastPos)
    return result
  }

  private replacePlaceholder(text: string, values: object, lang: string) {
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
}
