import {_, detectLang, ensureSupportedLang, init, rememberLang} from '../src/i18n.js'
import {expect} from 'chai'
import {describe} from 'mocha'
import langs from '../sample/langs.json' assert {type: 'json'}
import en from '../sample/en.json' assert {type: 'json'}

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
      key2: 'Testing {count|zero:nothing|one:a single translation|other:# translations but don\'t \#change this!}',
      keyNoZero: 'Testing {count|one:# translation|other:# translations}'
    }
    expect(_('key', {count: 0}, dict)).to.equal("Testing nothing")
    expect(_('key', {count: 1}, dict)).to.equal("Testing a single translation")
    expect(_('key', {count: 5}, dict)).to.equal("Testing 5 translations!")
    expect(_('key2', {count: 12}, dict)).to.equal("Testing 12 translations but don't #change this!")
    expect(_('keyNoZero', {count: 0}, dict)).to.equal("Testing 0 translations")
  })

  it('translate template with plurals and regular substitution', () => {
    const dict = {key: 'Tere {username}! You have {n|one:# message|other:# messages} since {date}'}
    expect(_('key', {n: 5, date: 'yesterday', username: 'Piret'}, dict))
      .to.equal('Tere Piret! You have 5 messages since yesterday')
  })

  it('empty token', () => {
    const dict = {key: '{n|zero:|one:one|other:# messages}'}
    expect(_('key', {n: 0}, dict)).to.equal('')
  })

  it('language is saved to cookie and url is replaced', () => {
    rememberLang('et')
    expect(document.cookie).to.contain('LANG=et')
    document.cookie = 'LANG=et'
    expect(detectLang()).to.eq('et')

    rememberLang('en')
    expect(document.cookie).to.contain('LANG=en')
    document.cookie = 'LANG=en'
    expect(detectLang()).to.eq('en')
  })
})
