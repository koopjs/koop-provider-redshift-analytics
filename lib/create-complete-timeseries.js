const _ = require('lodash')
const Moment = require('moment')
const MomentRange = require('moment-range')
const moment = MomentRange.extendMoment(Moment)
// const defaultTimestampFormat = 'YYYY-MM-DDTHH:mm:ss.SSSSZ'

function createCompleteTimeseries (params) {
  const { data } = params
  const missingTimestamps = getMissingTimestamps(params)
  return _.chain(data)
    .cloneDeep()
    .concat(missingTimestamps)
    .orderBy('timestamp')
    .value()
}

function getMissingTimestamps ({ data, startDate, endDate, interval }) {
  const timeseries = createTimeseries({ startDate, endDate, interval })
  return _.chain(timeseries)
    .map(date => {
      return {
        timestamp: date.toDate()
      }
    })
    .differenceWith(data, (timestep, record) => {
      return timestep.timestamp.toISOString() === record.timestamp.toISOString()
    })
    .value()
}

function createTimeseries ({ startDate, endDate, interval }) {
  const range = moment.range(startDate, endDate)
  return Array.from(range.by(interval))
}

module.exports = createCompleteTimeseries
