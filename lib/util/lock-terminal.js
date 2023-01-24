'use strict'

const { Lock } = require('lock')

const lock = Lock()
const LOCK_KEY = 'TERMINAL'

module.exports = () => {
  return new Promise(resolve => {
    lock(LOCK_KEY, release => {
      resolve(() => release()())
    })
  })
}
