type Date_ = string|number|Date|undefined
const toDate = (d: Date_) => d instanceof Date ? d : d ? new Date(d) : undefined

let lang: string
let dateFormat: Intl.DateTimeFormat
let dateTimeFormat: Intl.DateTimeFormat

export function init(l: string) {
  lang = l
  dateFormat = new Intl.DateTimeFormat(lang, {day: '2-digit', month: '2-digit', year: 'numeric'})
  dateTimeFormat = new Intl.DateTimeFormat(lang, {day: 'numeric', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'})
}

export function formatDate(d: Date_) {
  return d ? dateFormat.format(toDate(d)) : ''
}

export function formatDateTime(d: Date_) {
  return d ? dateTimeFormat.format(toDate(d)) : ''
}

export function formatAmount(o: {amount: number, currency?: string}|string|number, currency = o?.['currency'], options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(lang, currency && {currency, style: 'currency', ...options}).format(o?.['amount'] ?? o)
}

export function formatCurrency(currency: string) {
  return new Intl.NumberFormat(lang, {currency, style: 'currency'}).format(0).replace(/[0-9., ]/g, '')
}

export function formatUuid(uuid: string) {
  return uuid.substring(28).toUpperCase()
}
