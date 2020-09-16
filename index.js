
const packageInfo = require('./package.json')
const Model = require('./lib/model')
const provider = {
  type: 'provider',
  name: 'koop-provider-redshift-analytics',
  version: packageInfo.version,
  hosts: false,
  disableIdParam: false,
  Model
}

module.exports = provider
