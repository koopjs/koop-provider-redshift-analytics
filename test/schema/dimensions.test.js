/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const { prepare: prepareDimensions } = proxyquire('../../lib/schema/dimensions', {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      dimensions: ['day', 'userType', 'action'],
      sessionMetrics: ['sessions'],
      dimensionLookup: {
        userType: 'dimension_1'
      },
      sessionDimensions: ['day', 'userType']
    }
  }
})

describe('dimensions validation', () => {
  it('should reject invalid dimensions', () => {
    const helpers = { state: { ancestors: [{ metric: 'views' }] } }
    const { errors: [error] } = prepareDimensions(['not valid dimension'], helpers)
    expect(error).to.have.property('message', 'Dimensions ["not valid dimension"] are not supported')
  })

  it('should allow valid dimensions', () => {
    const helpers = { state: { ancestors: [{ metric: 'views' }] } }
    const { value } = prepareDimensions(['day', 'action'], helpers)
    expect(value).to.deep.equal(['day', 'action'])
  })

  it('should allow valid dimensions and convert if found in lookup', () => {
    const helpers = { state: { ancestors: [{ metric: 'views' }] } }
    const { value } = prepareDimensions(['userType'], helpers)
    expect(value).to.deep.equal(['dimension_1'])
  })

  it('should reject dimensions not allowed for sessions metrics', () => {
    const helpers = { state: { ancestors: [{ metric: 'sessions' }] } }
    const { errors: [error] } = prepareDimensions(['action'], helpers)
    expect(error).to.have.property('message', 'Dimensions ["action"] are not supported for session metrics')
  })
})
