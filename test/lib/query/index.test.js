/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const sinon = require('sinon')
const modulePath = '../../../lib/query'

describe('query-builder router', () => {
  it('should build event query', () => {
    const spyStub = sinon.spy({
      './event': () => { return 'event-query' },
      './helpers/raw-where': () => { return 'compiled-where' }
    })
    const buildQuery = proxyquire(modulePath, spyStub)
    const params = { metric: 'pageViews', time: { startDate: 'START', endDate: 'END' }, where: 'query-param-where' }
    const query = buildQuery(params)
    expect(query).to.equal('event-query')
    expect(spyStub['./helpers/raw-where'].calledOnce).to.equal(true)
    expect(spyStub['./helpers/raw-where'].firstCall.args).to.deep.equal([params])
    expect(spyStub['./event'].calledOnce).to.equal(true)
    expect(spyStub['./event'].firstCall.args).to.deep.equal([{ ...params, where: 'compiled-where' }])
  })

  it('should build sessions query', () => {
    const spyStub = sinon.spy({
      './session': () => { return 'session-query' },
      './helpers/raw-where': () => { return 'compiled-where' }
    })
    const buildQuery = proxyquire(modulePath, spyStub)
    const params = { metric: 'sessions', time: { startDate: 'START', endDate: 'END' }, where: 'query-param-where' }
    const query = buildQuery(params)
    expect(query).to.equal('session-query')
    expect(spyStub['./helpers/raw-where'].calledOnce).to.equal(true)
    expect(spyStub['./helpers/raw-where'].firstCall.args).to.deep.equal([params])
    expect(spyStub['./session'].calledOnce).to.equal(true)
    expect(spyStub['./session'].firstCall.args).to.deep.equal([{ ...params, where: 'compiled-where' }])
  })

  it('should build session-duration query', () => {
    const spyStub = sinon.spy({
      './session-duration': () => { return 'session-duration-query' },
      './helpers/raw-where': () => { return 'compiled-where' }
    })
    const buildQuery = proxyquire(modulePath, spyStub)
    const params = { metric: 'avgSessionDuration', time: { startDate: 'START', endDate: 'END' }, where: 'query-param-where' }
    const query = buildQuery(params)
    expect(query).to.equal('session-duration-query')
    expect(spyStub['./helpers/raw-where'].calledOnce).to.equal(true)
    expect(spyStub['./helpers/raw-where'].firstCall.args).to.deep.equal([params])
    expect(spyStub['./session-duration'].calledOnce).to.equal(true)
    expect(spyStub['./session-duration'].firstCall.args).to.deep.equal([{ ...params, where: 'compiled-where' }])
  })
})
