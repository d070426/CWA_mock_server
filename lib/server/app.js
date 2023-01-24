'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const log4js = require('log4js')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid')

const lockTerminal = require('../util/lock-terminal')
//const device = require('./util/device')
//const requestMetadata = require('./util/request-metadata')
const logging = require('./util/logging')
//const testResultStoreFactory = require('./util/in-memory-test-result-store')

module.exports = ({ metrics, activePlaybooks, getConfigFile, serverConfig }) => {
  const app = express()
  require('express-ws')(app)
  // const ws = t.getWss()
  // ws._server.on('connection', conn => {
  //   console.log('CONNECTION event', conn)
  //   conn.destroy()
  // })

  app.use(
    bodyParser.json({ type: 'application/json' }),
    bodyParser.raw({ type: 'application/x-protobuf' }),
    bodyParser.raw({ type: 'application/cbor' })
  )

  app.use((req, res, next) => {
    if (req.url?.startsWith('/~')) {
      // first path element is the device id prefixed with tilde
      const [, deviceIdWithPrefix] = req.url.split('/')
      const deviceId = deviceIdWithPrefix.replace('~', '')
      req.url = req.url.replace(`/${deviceIdWithPrefix}`, '')
      req.headers['cwa-test-device'] = deviceId
      req.headers['cwa-test-device-via-url'] = true
    }
    next()
  })

  // middleware to remote-control the server
  /*
  app.use(
    '/rc',
    require('./router/remote-control')({
      //stdoutDataEmitter,
      activePlaybooks,
    })
  )*/

  // log incoming requests
  /*
  app.use(async (req, res, next) => {
    const release = await lockTerminal()

    const headers = req.headers
    const deviceIdentity = device.identifyFromHeaders(headers)
    const { deviceId, deviceOs, clientId } = deviceIdentity
    const requestId = uuidv4().substr(0, 5)

    const networkLogger = log4js.getLogger('networkTraffic')
    networkLogger.addContext('requestId', requestId)
    //networkLogger.addContext('deviceId', deviceId)
    //networkLogger.addContext('deviceOs', deviceOs)
    networkLogger.addContext('clientId', requestId)
    networkLogger.info({ io: 'in', path: req.path, method: req.method, body: req.body, headers: req.headers })

    //const logger = device.loggerFromIdentity(deviceIdentity)
    //logger.addContext('requestId', requestId)

    logger.info('Incoming %s %s', req.method, req.path)
    logger.info('Request headers: %j', logging.filterHeadersForInfo(headers))
    logger.debug('All request headers: %j', headers)
    logger.debug('Body: %o', Buffer.isBuffer(req.body) ? req.body.toString('base64') : req.body)

    const config = await getConfigFile()
    const _serverConfig = await serverConfig.get()
    const clientConfig = _serverConfig.getDeviceByClientId(clientId)

    // Server time
    const now = clientConfig.timeOffset ? moment().add(clientConfig.timeOffset) : moment()
    req.serverTime = moment(now)
    const dateHeader = moment(now).utc().format('ddd, DD MMM YYYY HH:mm:ss [GMT]')
    const diff = moment.duration(moment(now).diff(moment())).humanize(true)
    logger.info('Server time: ~%s (%s)', diff, dateHeader)
    res.set('Date', dateHeader)

    // attach objects as request metadata
    const meta = requestMetadata(req)
    //meta.deviceId(deviceId)
    //meta.deviceOs(deviceOs)
    meta.clientId(clientId)
    //meta.logger(logger)
    meta.networkLogger(networkLogger)
    meta.config(config)
    //meta.playbooks(activePlaybooks)
    meta.requestId(requestId)
    meta.serverConfig(_serverConfig)

    release()
    next()
  })*/

  // analyze incoming requests
  /*
  app.use((req, res, next) => {
    const metric = (metrics[req.path] = metrics[req.path] || {
      numRequests: 0,
      headerAndPathLengths: [],
      bodyLengths: [],
      realRequests: {
        numRequests: 0,
        headerAndPathLengths: [],
        bodyLengths: [],
      },
      fakeRequests: {
        numRequests: 0,
        headerAndPathLengths: [],
        bodyLengths: [],
      },
    })

    const pathLen = req.path.length
    const headerLen = JSON.stringify(req.headers).length
    const headerAndPathLen = pathLen + headerLen
    const isFakeRequest = req.headers['cwa-fake'] === '1'
    const reqTypeKey = isFakeRequest ? 'fakeRequests' : 'realRequests'
    let bodyLen
    if (Buffer.isBuffer(req.body)) {
      bodyLen = req.body.length
    } else if (req.body instanceof Object && Object.keys(req.body).length > 0) {
      bodyLen = JSON.stringify(req.body).length
    }

    metric.numRequests++
    metric.headerAndPathLengths.push(headerAndPathLen)
    metric[reqTypeKey].numRequests++
    metric[reqTypeKey].headerAndPathLengths.push(headerAndPathLen)
    if (bodyLen) {
      metric.bodyLengths.push(bodyLen)
      metric[reqTypeKey].bodyLengths.push(bodyLen)
    }

    next()
  })*/
  /*
  app.use((req, res, next) => {
    // auto-respond to cwa-fake=1
    if (req.headers['cwa-fake'] === '1') {
      const statusCode = 200
      const logger = requestMetadata(req).logger()
      logger.info(`Auto-responding to fake request with HTTP status ${statusCode}`)
      return res.status(statusCode).send()
    } else next()
  })

  const testResultStore = testResultStoreFactory()
  const ticketingServiceProviderAllowlist = []
  app.use(
    require('./router/verification-server')({
      testResultStore,
    })
  )*/
  /*app.use(require('./router/submission-server')())
  app.use(require('./router/cdn-app-config')())
  app.use(require('./router/cdn-key-packages')())
  app.use(require('./router/cdn-stats')())
  app.use(require('./router/ext-ubirch-dcc-reissue-api-service')())
  app.use(require('./router/ext-ubirch-revocation-list-api-service')())
  app.use(require('./router/ppdd-server')())
  app.use(require('./router/log-upload-server')())
  app.use(require('./router/cdn-trace-packages')())
  app.use(require('./router/cdn-qr-code-poster-template')())
  app.use(
    require('./router/cwa-dgc-server')({
      testResultStore,
    })
  )
  app.use(require('./router/cdn-dgc-value-sets')())
  app.use(
    require('./router/cdn-dgc-validation-rules')({
      ticketingServiceProviderAllowlist,
    })
  )
  app.use(
    require('./router/dcc-validation-service')({
      ticketingServiceProviderAllowlist,
    })
  )
  app.use(
    require('./router/test-result-server')({
      testResultStore,
    })
  )

  app.use((req, res, next) => {
    const meta = requestMetadata(req)
    const logger = meta.logger()
    const networkLogger = meta.networkLogger()

    networkLogger.info({
      io: 'out',
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: res.headers,
    })

    logger.info('Outgoing %s %s: %s %s', req.method, req.path, res.statusCode, res.statusMessage)
    logger.debug('All response headers: %j', res.getHeaders())
    next()
  })*/
  app.use(require('./router/dummy_route')())

  return app
}
