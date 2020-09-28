const config = require('config')
const Koop = require('koop')
const koop = new Koop(config)

const redshiftAnalytics = require('./')

koop.register(redshiftAnalytics)

const server = koop.server.listen(1338, function () {
  console.log('Koop is up at http://localhost:1338')
})

function shutdown () {
  console.log('Shutdown requested')
  server.close(() => {
    console.log('All connections closed')
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
