const {
  koopProviderRedshiftAnalytics: {
    timeRangeStart: {
      intervalCount = 30,
      intervalUnit = 'day'
    } = {}
  }
} = require('config')
const moment = require('moment')
const joi = require('joi')
const time = {
  type: 'time',
  base: joi.object(),
  coerce: {
    from: 'string',
    method (value, helpers) {
      if (!value) return

      const timeRange = value.replace(/\s/g, '').split(',')

      if (!isValidTimeRangeArray(timeRange)) {
        return {
          errors: [
            new Error('"time" param must be a comma delimited string: "<start>,<end>". Use "null", an ISO Date srting, YYYY-MM-DD string, or a unix timestamp')
          ]
        }
      }
      return {
        value: translateTimeRangeArray(timeRange)
      }
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

function translateTimeRangeArray ([start, end]) {
  return {
    startDate: translateStart(start, end),
    endDate: translateEnd(end)
  }
}

function translateStart (start, end) {
  if (start === 'null') {
    return createDefaultStartTime(end)
  }

  return translateValidTimeInput(start)
}

function translateEnd (end) {
  if (end === 'null') {
    return moment().toISOString()
  }

  return translateValidTimeInput(end)
}

function translateValidTimeInput (time) {
  if (isYYYYMMDD(time)) return moment(time, 'YYYY-MM-DD').toISOString()

  if (isIso8601(time)) return moment(time).toISOString()

  return moment(Number(time)).toISOString()
}

function createDefaultStartTime (end) {
  let endDate

  if (end === 'null') {
    endDate = moment()
  } else if (isIso8601(end)) {
    endDate = moment(end)
  } else if (isYYYYMMDD(end)) {
    endDate = moment(end, 'YYYY-MM-DD')
  } else {
    endDate = moment(Number(end))
  }

  return endDate.subtract(intervalCount, intervalUnit).toISOString()
}

function isYYYYMMDD (time) {
  return /^\d{4}-\d{2}-\d{2}$/.test(time)
}

function isIso8601 (time) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(time)
}

module.exports = time
