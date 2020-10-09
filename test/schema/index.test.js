/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const modulePath = '../../lib/schema'
const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/
const configStub = {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      metrics: ['pageViews'],
      dimensions: ['day', 'userType'],
      timeDimensions: ['day']
    }
  }
}
const { paramsSchema } = proxyquire(modulePath, configStub)

describe('schema', function () {
  it('should reject invalid metric param', () => {
    const { error } = paramsSchema.validate({ id: 'unsupported' })
    expect(typeof error).to.equal('object')
  })

  it('should validate metric-only id param', () => {
    const { error, value } = paramsSchema.validate({ id: 'pageViews' })
    expect(error).to.be.an('undefined')
    expect(value).to.have.property('metric', 'pageViews')
    expect(value).to.have.property('where', undefined)
    expect(value).to.have.property('startDate')
    expect(iso8601Regex.test(value.startDate)).to.equal(true)
    expect(value).to.have.property('endDate')
    expect(iso8601Regex.test(value.endDate)).to.equal(true)
  })

  it('should reject invalid dimensions param', () => {
    const { error } = paramsSchema.validate({ id: 'pageViews:unsupported' })
    expect(typeof error).to.equal('object')
  })

  it('should validate simple dimensions param', () => {
    const { error, value } = paramsSchema.validate({ id: 'pageViews:day' })
    expect(error).to.be.an('undefined')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day'])
    expect(value).to.have.property('metric', 'pageViews')
  })

  it('should validate delimited dimensions param', () => {
    const { error, value } = paramsSchema.validate({ id: 'pageViews:day,userType' })
    expect(error).to.be.an('undefined')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day', 'userType'])
    expect(value.timeDimension).to.equal('day')
    expect(value.nonTimeDimensions).to.deep.equal(['userType'])
    expect(value).to.have.property('metric', 'pageViews')
  })

  it('should validate delimited dimensions param with transposeAndAggregate option', () => {
    const { error, value } = paramsSchema.validate({ id: 'pageViews:day,userType~transposeAndAggregate' })
    expect(error).to.be.an('undefined')
    expect(value).to.have.property('dimensions')
    expect(value.dimensions).to.deep.equal(['day', 'userType'])
    expect(value.timeDimension).to.equal('day')
    expect(value.nonTimeDimensions).to.deep.equal(['userType'])
    expect(value.transposeAndAggregate).to.equal(true)
    expect(value).to.have.property('metric', 'pageViews')
  })

  it('should reject single dimensions param with transposeAndAggregate option', () => {
    const { error } = paramsSchema.validate({ id: 'pageViews:day~transposeAndAggregate' })
    expect(error).to.have.property('message', 'Must have exactly two dimensions to transpose and aggregate')
  })
})
