const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      sessionColumn,
      eventTimestampColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS
  }
} = require('config')
const knex = require('../knex')
const buildRawWhere = require('./helpers/raw-where')

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildSessionQuery (params = {}) {
  const {
    dimension,
    time: {
      startDate,
      endDate
    },
    where
  } = params

  const rawWhere = buildRawWhere({ startDate, endDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionCountQuery({ dimension, rawWhere })
  }

  if (dimension) {
    return buildDimensionedSessionCountQuery({ dimension, rawWhere })
  }

  return buildSessionCountQuery({ rawWhere })
}

function buildTimeDimensionedSessionCountQuery ({ dimension, rawWhere }) {
  return knex.select(knex.raw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} ) AS timestamp, COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
    .groupByRaw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} )`)
    .queryContext({
      timeseries: true,
      startDate,
      endDate,
      interval: dimension
    })
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
