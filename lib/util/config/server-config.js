'use strict'

const async = require('async')

const v1 = require('./server-config-v1')
const v2 = require('./server-config-v2')

module.exports = () => {
  const providers = [v2(), v1()]

  let _currentProvider
  const getCurrentProvider = async () => {
    if (_currentProvider) return _currentProvider
    _currentProvider = await async.findSeries(providers, async it => {
      return it.exists()
    })
    return _currentProvider
  }

  const getCurrentVersion = async () => {
    const currentClient = await getCurrentProvider()
    return currentClient.version
  }

  const migrate = async () => {
    const targetVersion = providers[0].version
    const currentVersion = await getCurrentVersion()

    if (currentVersion === targetVersion) return

    if (currentVersion > targetVersion) {
      throw new Error(`Current server config version ${currentVersion} is above target ${targetVersion}`)
    }

    const reverseClients = [...providers].reverse()
    await async.eachOfSeries(reverseClients, async (it, idx) => {
      if (it.version <= currentVersion) return // skip
      console.log(`Migrating client config to v${it.version}`)
      const previousClient = reverseClients[idx - 1]
      const hints = await it.migrateFromPrevious(previousClient)
      await previousClient.markAsMigrated(...hints)
    })
  }

  const get = async () => {
    await migrate()
    const provider = await getCurrentProvider()

    const config = await provider.getConfig()
    // console.log(JSON.stringify(config, null, '  '))

    const getService = name => {
      return config.services.find(it => {
        return it.name === name
      })
    }

    const getEndpoint = (serviceName, endpointName) => {
      const service = getService(serviceName)
      return service.endpoints.find(it => {
        return it.name === endpointName
      })
    }

    const getGeneral = () => ({ ...config.general })

    const getDeviceByClientId = clientId => {
      return config.devices.find(d => d.clientId === clientId) || {}
    }

    return {
      ...config,
      getGeneral,
      getService,
      getEndpoint,
      getDeviceByClientId
    }
  }

  return {
    get
  }
}
