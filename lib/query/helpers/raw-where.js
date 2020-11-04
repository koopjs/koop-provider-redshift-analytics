const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        event: eventSource,
        session: sessionSource
      } = {}
    } = {}
  } = {}
} = require('config')

module.exports = function buildRawWhere ({ metric, endDate, startDate, where }) {
  const timestampColumn = getTimestampColumn(metric)
  const whereFragments = [
    `${timestampColumn} > '${startDate}'`,
    `${timestampColumn} <= '${endDate}'`
  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
}

function getTimestampColumn (metric) {
  if (metric === 'sessions' || metric === 'avgSessionDuration') {
    return _.get(sessionSource, 'timestampColumn', defaultSource.timestampColumn)
  }
  return _.get(eventSource, 'timestampColumn', defaultSource.timestampColumn)
}
