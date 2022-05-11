type Date_ = string|number|Date|undefined
const toDate = (d: Date_) => d instanceof Date ? d : d ? new Date(d) : undefined

export class Formatters {
  private _lang!: string
  private dateFormat!: Intl.DateTimeFormat
  private dateTimeFormat!: Intl.DateTimeFormat

  get lang() { return this._lang }
  set lang(lang: string) {
    this.dateFormat = new Intl.DateTimeFormat(lang + '-GB', {day: '2-digit', month: '2-digit', year: 'numeric'})
    this.dateTimeFormat = new Intl.DateTimeFormat(lang + '-GB', {day: 'numeric', month: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit'})
  }

  formatDate(d: Date_) {
    return d ? this.dateFormat.format(toDate(d)) : ''
  }

  formatDateTime(d: Date_) {
    return d ? this.dateTimeFormat.format(toDate(d)) : ''
  }

  formatAmount(o: {amount: number, currency?: string}|string|number, currency = o?.['currency'], options?: Intl.NumberFormatOptions) {
    return new Intl.NumberFormat(this.lang, currency && {currency, style: 'currency', ...options}).format(o?.['amount'] ?? o)
  }

  formatCurrency(currency: string) {
    return new Intl.NumberFormat(this.lang, {currency, style: 'currency'}).format(0).replace(/[0-9., ]/g, '')
  }

  formatUuid(uuid: string) {
    return uuid.substring(28).toUpperCase()
  }
}
