const buildEventQuery = require('./event')
const buildSessionQuery = require('./session')
const buildSessionDurationQuery = require('./session-duration')
const buildRawWhere = require('./helpers/raw-where')

function buildQuery (params) {
  const { metric } = params
  const where = buildRawWhere(params)
  const queryParams = { ...params, where }
  if (metric === 'pageViews') return buildEventQuery(queryParams)
  if (metric === 'sessions') return buildSessionQuery(queryParams)
  return buildSessionDurationQuery(queryParams)
}

module.exports = buildQuery
