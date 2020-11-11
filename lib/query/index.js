const buildEventQuery = require('./event')
const buildSessionQuery = require('./session')
const buildSessionDurationQuery = require('./session-duration')
const buildRawWhere = require('./helpers/raw-where')

function buildQuery (params) {
  const { metric } = params
  const where = buildRawWhere(params)
  const queryParams = { ...params, where }
  if (metric === 'avgSessionDuration') return buildSessionDurationQuery(queryParams)
  if (metric === 'sessions') return buildSessionQuery(queryParams)
  return buildEventQuery(queryParams)
}

module.exports = buildQuery
