import {expect} from 'chai'
import {init, formatAmount, formatCurrency, formatDate, formatDateTime} from '../src/formatters'

describe('formatters', () => {
  before(() => {
    init('en')
  })

  it('formatDate', () => {
    expect(formatDate('2021-06-02')).to.eq('02/06/2021')
  })

  it('formatDateTime', () => {
    expect(formatDateTime(undefined)).to.equal('')
    expect(formatDateTime(new Date())).to.contain(new Date().getFullYear().toString())
    expect(formatDateTime(123)).to.contain('1970')
    expect(formatDateTime('2020-01-01T10:23:45.010101')).to.eq('1/01/2020, 10:23:45')
  })

  it('formatAmount', () => {
    expect(formatAmount({amount: 123, currency: 'EUR'})).to.eq('€123.00')
    expect(formatAmount({amount: 456.567}, 'USD')).to.eq('$456.57')
    expect(formatAmount(456.567, 'GBP')).to.eq('£456.57')
    expect(formatAmount(null as any, 'EUR')).to.eq('€0.00')
  })

  it('formatCurrency', () => {
    expect(formatCurrency('EUR')).to.eq('€')
    expect(formatCurrency('USD')).to.eq('$')
  })
})
