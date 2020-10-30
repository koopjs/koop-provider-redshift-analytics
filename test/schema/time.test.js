/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const { coerce: { method: coerceTime } } = require('../../lib/schema/time')
const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

function getDayRange (start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.round((endDate - startDate) / (24 * 60 * 60 * 1000))
}

describe('timeValidation', () => {
  it('should reject invalid range: "null"', () => {
    coerceTime('null', {
      message: (msg) => {
        expect(msg).to.equal('"time" param must be a comma delimited string: "<start>,<end>". Use "null", an ISO Date srting, YYYY-MM-DD string, or a unix timestamp')
      }
    })
  })

  it('should reject invalid range: "2020-01-01"', () => {
    coerceTime('2020-01-01', {
      message: (msg) => {
        expect(msg).to.equal('"time" param must be a comma delimited string: "<start>,<end>". Use "null", an ISO Date srting, YYYY-MM-DD string, or a unix timestamp')
      }
    })
  })

  it('should reject invalid range: "hello,world"', () => {
    coerceTime('hello,world', {
      message: (msg) => {
        expect(msg).to.equal('"time" param must be a comma delimited string: "<start>,<end>". Use "null", an ISO Date srting, YYYY-MM-DD string, or a unix timestamp')
      }
    })
  })

  it('should coerce "null,null" to default ISO8601 time range', () => {
    const { value: result } = coerceTime('null,null')
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })

  it('should coerce "null,1600731000000" to a ISO8601 time range', () => {
    const { value: result } = coerceTime('null,null')
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })

  it('should coerce "null,1600731000000" to default ISO8601 time range', () => {
    const { value: result } = coerceTime('null,1600731000000')
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })

  it('should coerce "<7 days ago>,null" to default ISO8601 time range', () => {
    const start = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const { value: result } = coerceTime(`${start},null`)
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(7)
  })

  it('should coerce "<ISO date>,<ISO date>" to default ISO8601 time range', () => {
    const end = Date.now()
    const start = end - (30 * 24 * 60 * 60 * 1000)
    const { value: result } = coerceTime(`${(new Date(start)).toISOString()},${(new Date(end)).toISOString()}`)
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })

  it('should coerce "null,<ISO date>" to default ISO8601 time range', () => {
    const end = Date.now()
    const { value: result } = coerceTime(`null,${(new Date(end)).toISOString()}`)
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })

  it('should coerce "<YYYY-MM-DD>,<YYYY-MM-DD>" to default ISO8601 time range', () => {
    const { value: result } = coerceTime('2020-04-01,2020-05-01')
    expect(result).to.have.property('startDate')
    expect(iso8601Regex.test(result.startDate)).to.equal(true)
    expect(result).to.have.property('endDate')
    expect(iso8601Regex.test(result.endDate)).to.equal(true)
    expect(getDayRange(result.startDate, result.endDate)).to.equal(30)
  })
})
