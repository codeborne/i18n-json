import {_, detectLang, ensureSupportedLang, init, rememberLang} from './i18n'
import {expect} from 'chai'
import {describe} from 'mocha'
import langs from '../sample/langs.json'
import en from '../sample/en.json'

describe('i18n', () => {
  before(async () => {
    global.location = {host: 'hostname'} as Location
    global.document = {cookie: '', documentElement: {setAttribute: (name, value) => {}}} as Document
    global.navigator = {language: 'en-GB'} as Navigator
    await init({langs, dicts: {en}})
  })

  it('translate', () => {
    expect(_('contacts.email')).to.equal('E-mail')
  })

  it('translate with fallback', () => {
    expect(_('contacts.email', undefined, {contacts: {}})).to.equal('E-mail')
  })

  it('if translation fails it should return translation key', () => {
    const nonExistingKey = 'some.key.that.does.not.exist'
    expect(_(nonExistingKey)).to.equal(nonExistingKey)
  })

  it('ensureSupportedLang', () => {
    expect(ensureSupportedLang('en')).to.equal('en')
    expect(ensureSupportedLang('et')).to.equal('et')
    expect(ensureSupportedLang('??')).to.equal('en')
  })

  it('translate strings with plurals', () => {
    const dict = {
      key: 'Testing {count|zero:nothing|one:a single translation|other:# translations!}',
      key2: 'Testing {count|zero:nothing|one:a single translation|other:# translations but don\'t \#change this!}'
    }
    expect(_('key', {values: {count: 0}}, dict)).to.equal("Testing nothing")
    expect(_('key', {values: {count: 1}}, dict)).to.equal("Testing a single translation")
    expect(_('key', {values: {count: 5}}, dict)).to.equal("Testing 5 translations!")
    expect(_('key2', {values: {count: 12}}, dict)).to.equal("Testing 12 translations but don't #change this!")
  })

  it('translate template with plurals and regular substitution', () => {
    const dict = {key: 'Tere {username}! You have {n|one:# message|other:# messages} since {date}'}
    expect(_('key', {values: {n: 5, date: 'yesterday', username: 'Piret'}}, dict))
      .to.equal('Tere Piret! You have 5 messages since yesterday')
  })

  it('empty token', () => {
    const dict = {key: '{n|zero:|one:one|other:# messages}'}
    expect(_('key', {values: {n: 0}}, dict)).to.equal('')
  })

  it('first selected language is according to the domain', () => {
    expect(detectLang('', 'LANG=et')).to.eq('et')

    expect(detectLang('', '')).to.eq('en')
    expect(document.cookie).to.contain('LANG=en')

    expect(detectLang('tenor.ee', '')).to.eq('et')
    expect(document.cookie).to.contain('LANG=et')

    expect(detectLang('tenor.lv', '')).to.eq('en') // lv is unsupported for now
  })

  it('language is saved to cookie and url is replaced', () => {
    rememberLang('et')
    expect(document.cookie).to.contain('LANG=et')
    expect(detectLang()).to.eq('et')
    rememberLang('en')
    expect(document.cookie).to.contain('LANG=en')
    expect(detectLang()).to.eq('en')
  })
})
