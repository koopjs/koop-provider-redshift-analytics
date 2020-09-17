const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      eventTimestampColumn
    } = {}
  }
} = require('config')

module.exports = function buildRawWhere ({ endDate = 'CURRENT_DATE', startDate = 'INTERVAL \'30 DAY\'', where }) {
  const whereFragments = [
    `${eventTimestampColumn} >= ${endDate} - ${startDate}`
  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
}
