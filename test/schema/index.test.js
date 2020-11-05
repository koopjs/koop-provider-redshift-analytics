/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const proxyquire = require('proxyquire').noCallThru()
const modulePath = '../../lib/schema'

function makeStubSpies () {
  const metricSpy = sinon.spy(function (value) {
    return { value }
  })

  const dimensionsSpy = sinon.spy(function (value) {
    return { value }
  })

  const timeSpy = sinon.spy(function (value) {
    return { value: { retVal: value } }
  })

  const whereSpy = sinon.spy(function (value) {
    return { value }
  })

  const configStub = {
    './metric': {
      type: 'metric',
      coerce: metricSpy
    },
    './dimensions': {
      type: 'dimensions',
      prepare: dimensionsSpy
    },
    './where': {
      type: 'where',
      prepare: whereSpy
    },
    './time': {
      type: 'time',
      coerce: timeSpy
    }
  }

  return {
    configStub,
    metricSpy,
    dimensionsSpy,
    whereSpy,
    timeSpy
  }
}

describe('schema', function () {
  it('should validate metric-only id param', () => {
    const {
      configStub,
      metricSpy,
      timeSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
  })

  it('should validate simple dimensions param', () => {
    const {
      configStub,
      metricSpy,
      dimensionsSpy,
      timeSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views:day' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(dimensionsSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day'])
  })

  it('should validate delimited dimensions param', () => {
    const {
      configStub,
      metricSpy,
      dimensionsSpy,
      timeSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views:day,userType' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(dimensionsSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day', 'userType'])
  })

  it('should validate delimited dimensions param with transposeAndAggregate option', () => {
    const {
      configStub,
      metricSpy,
      dimensionsSpy,
      timeSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views:day,userType~transposeAndAggregate' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(dimensionsSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day', 'userType'])
    expect(value).to.have.property('transposeAndAggregate', true)
  })

  it('should validate where param', () => {
    const {
      configStub,
      metricSpy,
      timeSpy,
      whereSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views', where: 'foo=\'bar\'' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(whereSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
    expect(value).to.have.property('where', 'foo=\'bar\'')
  })

  it('should validate time param', () => {
    const {
      configStub,
      metricSpy,
      timeSpy
    } = makeStubSpies()
    const { paramsSchema } = proxyquire(modulePath, configStub)
    const { error, value } = paramsSchema.validate({ id: 'views', time: 'foo,bar' })
    expect(error).to.be.an('undefined')
    expect(metricSpy).to.have.property('calledOnce', true)
    expect(timeSpy).to.have.property('calledOnce', true)
    expect(value).to.have.property('metric', 'views')
    expect(value).to.have.property('retVal', 'foo,bar')
  })
})
