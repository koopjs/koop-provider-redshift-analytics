const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      eventColumn,
      eventTimestampColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS,
    defaultStartDate: DEFAULT_START_DATE,
    eventLookup
  }
} = require('config')
const knex = require('../knex')

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildEventQuery (params) {
  const {
    metric,
    dimension,
    startDate = DEFAULT_START_DATE,
    endDate = 'CURRENT_DATE',
    where
  } = params

  const rawWhere = buildRawWhere({ endDate, startDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  if (dimension) {
    return buildDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  return buildEventCountQuery({ metric, rawWhere })
}

function buildRawWhere ({ endDate, startDate, where }) {
  const whereFragments = [
    `${eventTimestampColumn} >= ${endDate} - ${startDate}`
  ]

  if (where) whereFragments.push(where)
  return whereFragments.join(' AND ')
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
