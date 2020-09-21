const buildEventQuery = require('./event')
const buildSessionQuery = require('./session')
const buildSessionDurationQuery = require('./session-duration')

function buildQuery (params) {
  const { metric } = params
  if (metric === 'pageViews') return buildEventQuery(params)
  if (metric === 'sessions') return buildSessionQuery(params)
  return buildSessionDurationQuery(params)
}

module.exports = buildQuery
