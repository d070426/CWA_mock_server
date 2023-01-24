'use strict'

const EventEmitter = require('events')
const fse = require('fs-extra')
const log4js = require('log4js')
const moment = require('moment')
const path = require('path')

const configFile = require('./../../server/util/config-file')
const logging = require('./../../server/util/logging')
//const serverConfigFactory = require('./../../util/config/server-config')

module.exports = () => {
  return {
    command: ['server', 'serve'],
    desc: 'start fake server',
    
    /*builder: yargs => {
      yargs
        .commandDir('server', {
          visit: commandObject => commandObject()
        })
        .option('port', {
          alias: 'p',
          describe: 'Port of the server',
          default: 3001,
          number: true
        })
        .option('log-level', {
          describe: 'Log level of the server',
          default: 'info'
        })
        .option('log-file', {
          describe: 'True to write logs to a file, false otherwise',
          default: true,
          boolean: true
        })
    },*/
    handler: async argv => {
    /*
      const stdoutDataEmitter = new EventEmitter()
      process.stdout._orig_write = process.stdout.write
      process.stdout.write = (data) => {
        stdoutDataEmitter.emit('data', data)
        process.stdout._orig_write(data)
      }*/
      /*
      const writeToLogFile = argv.logFile === false
      const logsDir = path.resolve(__dirname, './../../../server-data/logs')
      const logFileStartDate = moment().format('YYYY-MM-DD-HH-mm-ss')
      const logFile = path.resolve(logsDir, `./server-${logFileStartDate}.log`)
      const logFileJson = path.resolve(logsDir, `./server-${logFileStartDate}-network.json`)
      const summaryFile = path.resolve(logsDir, `./server-${logFileStartDate}-request-summary.json`)

      logging.configureLog4js({ log4js, logFile, logFileJson, writeToLogFile, logLevel: argv.logLevel })
      const logger = log4js.getLogger('server')

      writeToLogFile && logger.info('Writing logs to: %s', path.relative(process.cwd(), logFile))
      writeToLogFile && logger.info('Writing network as JSON to: %s', path.relative(process.cwd(), logFileJson))
      */
      //const serverConfig = serverConfigFactory()
      const metrics = {}
      const activePlaybooks = []
      const app = require('./../../server/app')({
        metrics,
        //stdoutDataEmitter,
        activePlaybooks,
        getConfigFile: configFile().get,
        //serverConfig
      })

      const port = 3001;

      const server = app.listen(port, () => {
        //logger.info(`Listening to port ${port}`)
        console.log(`Listening to port ${port}`);
      })
      /*
      process.on('SIGINT', function () {
        server.close()
        logger.info('Server stopped.')
        logger.info('%o', activePlaybooks)
        if (writeToLogFile) {
          fse.writeJsonSync(summaryFile, metrics, { spaces: 2 })
          logger.info('Logs written to: %s', path.relative(process.cwd(), logFile))
          logger.info('Summary written to: %s', path.relative(process.cwd(), summaryFile))
        }
        process.exit(1)
      })*/
    }
  }
}
