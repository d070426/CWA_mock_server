'use strict'

const fse = require('fs-extra')
const log4js = require('log4js')
const path = require('path')

module.exports = () => {
  const defaultConfigFilePath = path.resolve(__dirname, './../../../server-data/server-default.conf.json')
  const customConfigFilePath = path.resolve(__dirname, './../../../server-data/server.conf.json')
  const get = async () => {
    const logger = log4js.getLogger('config-file')
    try {
      const config = await fse.readJSON(customConfigFilePath)
      // config.__filepath__ = customConfigFilePath
      logger.debug('Using config from %s', customConfigFilePath)
      return config
    } catch (e) {
      const config = await fse.readJSON(defaultConfigFilePath)
      // config.__filepath__ = defaultConfigFilePath
      logger.debug('Using config from %s', defaultConfigFilePath)
      return config
    }
  }

  return {
    get
  }
}
