/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const { validate: validateWhere } = require('../../lib/schema/where')

describe('where validation', () => {
  it('should reject invalid where', () => {
    const { errors: [error] } = validateWhere('not valid where')
    expect(error).to.have.property('message', '"where" parameter is invalid')
  })

  it('should allow a valid where', () => {
    const { value } = validateWhere('test=\'foo\'')
    expect(value).to.equal('test=\'foo\'')
  })
})
