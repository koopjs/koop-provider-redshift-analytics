/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const modulePath = '../../../lib/db/post-process-response'

function setup () {
  const camelCaseSpy = sinon.spy(function (data) {
    return data
  })

  const transformSpy = sinon.spy(function (data) {
    return data
  })

  const timeSeriesSpy = sinon.spy(function ({ data }) {
    return data
  })

  const transposeSpy = sinon.spy(function ({ data }) {
    return data
  })

  return {
    data: [{ pageView: 100, a_hostname: 'world' }],
    camelCaseSpy,
    transformSpy,
    timeSeriesSpy,
    transposeSpy,
    stub: {
      'config': { // eslint-disable-line
        koopProviderRedshiftAnalytics: {
          metricLookup: {
            views: 'pageView'
          },
          dimensionLookup: {
            hostname: 'a_hostname'
          }
        }
      },
      './camel-case': camelCaseSpy,
      './metric-dimension-transform': transformSpy,
      './create-complete-timeseries': timeSeriesSpy,
      './transpose-and-aggregate-by-dimensions': transposeSpy
    }
  }
}

describe('postProcessResponse', () => {
  it('should do default post processing', () => {
    const { data, camelCaseSpy, transformSpy, timeSeriesSpy, transposeSpy, stub } = setup()
    const postProcessResponse = proxyquire(modulePath, stub)
    const result = postProcessResponse(data)
    expect(camelCaseSpy).to.have.property('notCalled', true)
    expect(transformSpy).to.have.property('calledOnce', true)
    expect(timeSeriesSpy).to.have.property('notCalled', true)
    expect(transposeSpy).to.have.property('notCalled', true)
    expect(result).to.be.deep.equal([{ a_hostname: 'world', pageView: 100 }])
  })

  it('should do snake-case adjustment and default post processing', () => {
    const { data, camelCaseSpy, transformSpy, timeSeriesSpy, transposeSpy, stub } = setup()
    const postProcessResponse = proxyquire(modulePath, stub)
    const result = postProcessResponse(data, { snakeCases: ['hello_world'] })
    expect(camelCaseSpy).to.have.property('calledOnce', true)
    expect(transformSpy).to.have.property('calledOnce', true)
    expect(timeSeriesSpy).to.have.property('notCalled', true)
    expect(transposeSpy).to.have.property('notCalled', true)
    expect(camelCaseSpy.firstCall.args).to.deep.equal([[{ a_hostname: 'world', pageView: 100 }], ['hello_world']])
    expect(result).to.be.deep.equal([{ a_hostname: 'world', pageView: 100 }])
  })

  it('should do snake-case adjustment, default post processing, time-series', () => {
    const { data, camelCaseSpy, transformSpy, timeSeriesSpy, transposeSpy, stub } = setup()
    const postProcessResponse = proxyquire(modulePath, stub)
    const result = postProcessResponse(data, { snakeCases: ['hello_world'], timeseries: true, metric: 'pageView' })
    expect(camelCaseSpy).to.have.property('calledOnce', true)
    expect(transformSpy).to.have.property('calledOnce', true)
    expect(timeSeriesSpy).to.have.property('calledOnce', true)
    expect(transposeSpy).to.have.property('notCalled', true)
    expect(timeSeriesSpy.firstCall.args).to.deep.equal([{ data: [{ a_hostname: 'world', pageView: 100 }], metric: 'views' }])
    expect(result).to.be.deep.equal([{ a_hostname: 'world', pageView: 100 }])
  })

  it('should do snake-case adjustment, default post processing, time-series, and transpose', () => {
    const { data, camelCaseSpy, transformSpy, timeSeriesSpy, transposeSpy, stub } = setup()
    const postProcessResponse = proxyquire(modulePath, stub)
    const result = postProcessResponse(data, {
      snakeCases: ['hello_world'],
      timeseries: true,
      transposeAndAggregate: true,
      dimensions: ['a_hostname', 'day'],
      timeDimension: 'day',
      metric: 'pageView'
    })
    expect(camelCaseSpy).to.have.property('calledOnce', true)
    expect(transformSpy).to.have.property('calledOnce', true)
    expect(timeSeriesSpy).to.have.property('calledOnce', true)
    expect(transposeSpy).to.have.property('calledOnce', true)
    expect(transposeSpy.firstCall.args).to.deep.equal([{
      data: [{ a_hostname: 'world', pageView: 100 }],
      dimensions: ['hostname', 'day'],
      metric: 'views',
      timeDimension: 'day'
    }])
    expect(result).to.be.deep.equal([{ a_hostname: 'world', pageView: 100 }])
  })
})
