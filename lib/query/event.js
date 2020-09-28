const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      eventColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS,
    eventLookup
  }
} = require('config')
const knex = require('../knex')
const buildRawWhere = require('./helpers/raw-where')

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildEventQuery (params) {
  const {
    metric,
    dimension,
    startDate,
    endDate,
    where
  } = params

  const rawWhere = buildRawWhere({ startDate, endDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  if (dimension) {
    return buildDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  return buildEventCountQuery({ metric, rawWhere })
}

function buildTimeDimensionedEventCountQuery ({ metric, dimension, rawWhere }) {
  return knex.select(knex.raw(`DATE_TRUNC('${dimension}', event_timestamp ) AS timestamp`))
    .count(`${eventColumn} AS ${metric}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .groupByRaw(`DATE_TRUNC('${dimension}', event_timestamp )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', event_timestamp )`)
}

function buildDimensionedEventCountQuery ({ metric, dimension, rawWhere }) {
  return knex.select(dimension)
    .count(`${eventColumn} AS ${metric}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .groupBy(dimension)
}

function buildEventCountQuery ({ metric, rawWhere }) {
  return knex
    .count(`${eventColumn} AS ${metric}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
}

module.exports = buildEventQuery
