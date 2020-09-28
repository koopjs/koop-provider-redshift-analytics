const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      eventTimestampColumn
    } = {}
  }
} = require('config')

module.exports = function buildRawWhere ({ endDate, startDate, where }) {
  const whereFragments = [
    `${eventTimestampColumn} > '${startDate}'`,
    `${eventTimestampColumn} <= '${endDate}'`

  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
}
