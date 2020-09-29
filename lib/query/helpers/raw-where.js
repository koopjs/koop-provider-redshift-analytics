
module.exports = function buildRawWhere ({ endDate, startDate, where, timestampColumn }) {
  const whereFragments = [
    `${timestampColumn} > '${startDate}'`,
    `${timestampColumn} <= '${endDate}'`

  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
}
