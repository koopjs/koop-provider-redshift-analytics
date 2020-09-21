const {
  koopProviderRedshiftAnalytics: {
    timeRangeStart: {
      intervalCount = 30,
      intervalUnit = 'day'
    } = {}
  }
} = require('config')
const moment = require('moment')

function validateTime (joi) {
  return {
    type: 'time',
    base: joi.object(),
    coerce (value, state, options) {
      if (!value) return

      // Remove any whitespace and split by comma
      const timeRange = value.replace(/\s/g, '').split(',')

      // Validate a two element array with either null, a timestamp, or a YYYY-MM-DD string
      if (isValidTimeRangeArray(timeRange)) {
        return this.createError('"time" param must be a comma delimited string: "<start>,<end>". Use "null", a YYYY-MM-DD string, or a unix timestamp', { v: value }, state, options)
      }

      const [startDate, endDate] = translateTimeRangeArray(timeRange)
      return { startDate, endDate }
    }
  }
}

function isValidTimeRangeArray (timeRange) {
  if (timeRange.length !== 2) return

  return !timeRange.some(time => {
    return time !== 'null' && !isValidUnixTimestamp(time) && !isValidTimeString(time)
  })
}

function isValidUnixTimestamp (time) {
  return moment(Number(time)).isValid()
}

function isValidTimeString (time) {
  return moment(time, 'YYYY-MM-DD').isValid()
}

function translateTimeRangeArray (timeRangeArray) {
  return timeRangeArray.map((time, index) => {
    if (isNullStartTime(time, index)) return moment().subtract(intervalCount, intervalUnit).toISOString()

    if (isNullEndTime(time, index)) return moment().toISOString()

    if (isYYYYMMDD(time)) return moment(time, 'YYYY-MM-DD').toISOString()

    return moment(Number(time)).toISOString()
  })
}

function isNullStartTime (time, arrayIndex) {
  return arrayIndex === 0 && time === 'null'
}

function isNullEndTime (time, arrayIndex) {
  return arrayIndex === 1 && time === 'null'
}

function isYYYYMMDD (time) {
  return /\d{4}-\d{2}-\d{2}/.test(time)
}

module.exports = validateTime
