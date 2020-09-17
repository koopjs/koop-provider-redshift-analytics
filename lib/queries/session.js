const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      sessionColumn,
      eventTimestampColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS,
    defaultStartDate: DEFAULT_START_DATE
  }
} = require('config')
const knex = require('../knex')
const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildSessionQuery (options = {}) {
  const {
    dimension,
    startDate = DEFAULT_START_DATE,
    endDate = 'CURRENT_DATE',
    where
  } = options

  const rawWhere = buildRawWhere({ endDate, startDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionCountQuery({ dimension, rawWhere })
  }
  
  if (dimension) {
    return buildDimensionedSessionCountQuery({ dimension, rawWhere})
  }

  return buildSessionCountQuery({ rawWhere })
}

function buildRawWhere ({ endDate, startDate, where}) {
  const whereFragments = [
    `${eventTimestampColumn} >= ${endDate} - ${startDate}`
  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
}

function buildTimeDimensionedSessionCountQuery ({ dimension, rawWhere }) {
  return knex.select(knex.raw(`DATE_TRUNC('${dimension}', event_timestamp ) AS timestamp, COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
    .groupByRaw(`DATE_TRUNC('${dimension}', event_timestamp )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', event_timestamp )`)
}

function buildDimensionedSessionCountQuery ({ dimension, rawWhere }) {
  return knex.select(dimension, knex.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
    .groupBy(dimension)
}

function buildSessionCountQuery ({ rawWhere }) {
  return knex
    .select(knex.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
}

module.exports = buildSessionQuery
