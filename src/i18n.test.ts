import {_, detectLang, ensureSupportedLang, formatAmount, formatCurrency, formatDate, formatDateTime, rememberLang} from './i18n'
import {expect} from 'chai'

test('translate', () => {
  expect(_('contacts.email')).to.equal('E-mail')
})

test('translate with fallback', () => {
  expect(_('contacts.email', undefined, {contacts: {}})).to.equal('E-mail')
})

test('if translation fails it should return translation key', () => {
  const nonExistingKey = 'some.key.that.does.not.exist'
  expect(_(nonExistingKey)).to.equal(nonExistingKey)
})

test('ensureSupportedLang', () => {
  expect(ensureSupportedLang('en')).to.equal('en')
  expect(ensureSupportedLang('et')).to.equal('et')
  expect(ensureSupportedLang('??')).to.equal('en')
})

test('translate strings with plurals', () => {
  const dict = {
    key: 'Testing {count|zero:nothing|one:a single translation|other:# translations!}',
    key2: 'Testing {count|zero:nothing|one:a single translation|other:# translations but don\'t \#change this!}'
  }
  expect(_('key', {values: {count: 0}}, dict)).to.equal("Testing nothing")
  expect(_('key', {values: {count: 1}}, dict)).to.equal("Testing a single translation")
  expect(_('key', {values: {count: 5}}, dict)).to.equal("Testing 5 translations!")
  expect(_('key2', {values: {count: 12}}, dict)).to.equal("Testing 12 translations but don't #change this!")
})

test('translate template with plurals and regular substitution', () => {
  const dict = {key: 'Tere {username}! You have {n|one:# message|other:# messages} since {date}'}
  expect(_('key', {values: {n: 5, date: 'yesterday', username: 'Piret'}}, dict))
    .to.equal('Tere Piret! You have 5 messages since yesterday')
})

test('empty token', () => {
  const dict = {key: '{n|zero:|one:one|other:# messages}'}
  expect(_('key', {values: {n: 0}}, dict)).to.equal('')
})

test('first selected language is according to the domain', () => {
  expect(detectLang('', 'LANG=et')).to.eq('et')

  expect(detectLang('', '')).to.eq('en')
  expect(document.cookie).to.contain('LANG=en')

  expect(detectLang('tenor.ee', '')).to.eq('et')
  expect(document.cookie).to.contain('LANG=et')

  expect(detectLang('tenor.lv', '')).to.eq('en') // lv is unsupported for now
})

test('language is saved to cookie and url is replaced', () => {
  rememberLang('et')
  expect(document.cookie).to.contain('LANG=et')
  expect(detectLang()).to.eq('et')
  rememberLang('en')
  expect(document.cookie).to.contain('LANG=en')
  expect(detectLang()).to.eq('en')
})

test('formatDate', () => {
  expect(formatDate('2021-06-02')).to.eq('02/06/2021')
})

test('formatDateTime', () => {
  expect(formatDateTime(undefined)).to.equal('')
  expect(formatDateTime(new Date())).to.contain(new Date().getFullYear().toString())
  expect(formatDateTime(123)).to.contain('1970')
  expect(formatDateTime('2020-01-01T10:23:45.010101')).to.eq('1/01/2020, 10:23:45')
})

test('formatAmount', () => {
  expect(formatAmount({amount: 123, currency: 'EUR'})).to.eq('€123.00')
  expect(formatAmount({amount: 456.567}, 'USD')).to.eq('$456.57')
  expect(formatAmount(456.567, 'GBP')).to.eq('£456.57')
  expect(formatAmount(null as any, 'EUR')).to.eq('€0.00')
})

test('formatCurrency', () => {
  expect(formatCurrency('EUR')).to.eq('€')
  expect(formatCurrency('USD')).to.eq('$')
})
