'use strict'

const chalk = require('chalk')
const randomColor = require('randomcolor')

const appleColor = '#A3AAAE'
const googleColor = '#4285F4'

const headersToIgnore = [
  'accept-encoding',
  'connection',
  'content-type',
  'cwa-test-device',
  'cwa-test-device-model',
  'cwa-test-device-os',
  'cwa-test-device-sdk',
  'host',
  'user-agent',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-port',
  'x-forwarded-proto',
  'x-nginx-proxy',
  'x-real-ip'
]

module.exports = {
  configureLog4js: ({ log4js, logFile, logFileJson, writeToLogFile, logLevel }) => {
    log4js.addLayout('json', function (config) {
      return function (logEvent) { return JSON.stringify(logEvent) + config.separator }
    })
    log4js.configure({
      appenders: {
        networkTrafficAsJson: {
          type: 'file',
          filename: logFileJson,
          layout: {
            type: 'json',
            separator: ','
          }
        },
        everything: {
          type: 'file',
          filename: logFile,
          layout: {
            type: 'pattern',
            pattern: '[%d] %x{truncatedLevel} %x{customCategory} - %m',
            tokens: {
              truncatedLevel: logEvent => {
                return `[${logEvent.level.toString().substr(0, 1)}]`
              },
              customCategory: logEvent => {
                const { categoryName } = logEvent
                const { deviceOs, deviceId, requestId } = logEvent.context
                if (deviceOs && deviceId) {
                  if (requestId) {
                    return `${deviceOs}-${deviceId}-${requestId}`
                  } else {
                    return `${deviceOs}-${deviceId}`
                  }
                }
                return categoryName
              }
            }
          }
        },
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern',
            pattern: '%[[%d] %x{truncatedLevel} %x{customCategory}%] %[-%] %m',
            tokens: {
              truncatedLevel: logEvent => {
                return `[${logEvent.level.toString().substr(0, 1)}]`
              },
              customCategory: logEvent => {
                const { categoryName } = logEvent
                const { deviceOs, deviceId, requestId } = logEvent.context
                if (deviceOs && deviceId) {
                  const isAndroid = deviceOs === 'G'
                  const isIOS = deviceOs === 'A'
                  const osColor = isAndroid ? googleColor : (isIOS ? appleColor : null)
                  const coloredOs = osColor ? chalk.hex(osColor)(deviceOs) : deviceOs

                  const deviceIdColor = randomColor({ luminosity: 'dark', seed: deviceId })
                  const coloredDeviceId = chalk.hex(deviceIdColor)(deviceId)

                  if (requestId) {
                    const requestIdColor = randomColor({ luminosity: 'dark', seed: requestId })
                    const coloredRequestId = chalk.hex(requestIdColor)(requestId)
                    return `${coloredOs}-${coloredDeviceId}-${coloredRequestId}`
                  } else {
                    return `${coloredOs}-${coloredDeviceId}`
                  }
                }
                return categoryName
              }
            }
          }
        },
        specifiedLogLevelOnly: { type: 'logLevelFilter', appender: 'out', level: logLevel }
      },
      categories: {
        default: {
          appenders: writeToLogFile
            ? ['specifiedLogLevelOnly', 'everything']
            : ['specifiedLogLevelOnly'],
          level: 'debug'
        },
        networkTraffic: {
          appenders: writeToLogFile ? ['networkTrafficAsJson'] : [],
          level: 'info'
        }
      }
    })
  },
  filterHeadersForInfo: headers => {
    const map = Object.entries(headers)
      .filter(([header]) => !headersToIgnore.includes(header))
      .reduce((headers, [header, value]) => headers.set(header, value), new Map())
    return Object.fromEntries(map)
  }
}
