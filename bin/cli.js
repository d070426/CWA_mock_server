const yargs = require('yargs')
const semver = require('semver')
require('global-agent/bootstrap')

//const clientConfigFactory = require('./../lib/util/config/client-config')

if (!semver.gte(semver.coerce(process.version), '16.0.0')) {
  console.error(`${chalk.red('ERR')} cwa-app-cli required Node.js version >=16, got ${process.version}`)
  return process.exit(1)
}

yargs
  .middleware(async argv => {
    /*const activeEnvironment = determineActiveEnvironment(argv)

    const clientConfig = clientConfigFactory()
    argv.clientConfig = await clientConfig.get(activeEnvironment)

    const allEnvironments = require('./../environments.json')
    const validEnvironments = Object.keys(allEnvironments).map(e => e.toLowerCase())
    if (!validEnvironments.includes(activeEnvironment)) {
      // throw new Error(`Environment '${activeEnvironment}' not valid`)
    }
    console.log(`${chalk.cyan('INFO')} Connecting to ${activeEnvironment.toUpperCase()}`)*/
  })
  .command(require('../lib/yargs/commands/server')())
  .option('environment', {
    alias: 'e',
    describe: 'Name of the environment',
    type: 'string'
  })
  .argv
