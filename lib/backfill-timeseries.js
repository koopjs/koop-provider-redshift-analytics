const _ = require('lodash')
const Moment = require('moment')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)

function backfillTimeseries ({ startDate, endDate, interval, timeSeries }) {
  const range = createTimestampRange({ startDate, endDate, interval })
  const missingTimestamps = _.differenceWith(range, timeSeries, (backfill, record) => {
    return backfill.timestamp === records.timestamp
  })
  return _.chain(timeSeries).cloneDeep().concat(missingTimestamps).orderBy('properties.timestamp').value()
}

function createTimestampRange ({ startDate, endDate, interval }) {
  const range = moment.range(startDate, endDate)
  return Array.from(range.by(interval)).map(date => {
    return {
      timestamp: date.format('YYYY-MM-DDTHH:mm:ss.SSSZZ')
    }
  })
}

module.exports = backfillTimeseries
