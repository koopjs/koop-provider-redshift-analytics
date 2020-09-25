const buildEventQuery = require('./event')

function buildQuery (params) {
  return buildEventQuery(params)
  // TODO: other metric specific queries in follow up PRs
}

module.exports = buildQuery
