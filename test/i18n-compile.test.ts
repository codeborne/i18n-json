import {mergeDicts} from '../src/i18n-compile.js'
import {expect} from 'chai'

describe('compile translations', () => {
  it('add missing properties to translation', () => {
    expect(mergeDicts({a: {b: 1}}, {a: {c: 2}})).to.be.eql({a: {b: 1, c: 2}})
  })
  it('assign empty translations', () => {
    expect(mergeDicts({a: {b: "", c: {}}}, {a: {b: 2, c: {d: "3"}}})).to.be.eql({a: {b: 2, c: {d: "3"}}})
  })
  it('keep translated unchanged', () => {
    expect(mergeDicts({a: {b: "1"}}, {a: {b: 2}})).to.be.eql({a: {b: "1"}})
  })
})
