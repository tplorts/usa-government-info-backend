'use strict'
const { envBoolean } = require('../../common/helpers')

const { log } = console


module.exports = async function (app, next) {
  log('________________________________')
  log('database schema check')
  const { postgres } = app.dataSources

  const resetDatabase = envBoolean('LB_RESET_DATABASE')
  log('reset database?', resetDatabase)

  if (resetDatabase) {
    try {
      await postgres.automigrate()
      log('db reset complete')
      next()
    } catch (err) {
      next(err)
    }
  } else {
    try {
      const schemaIsActual = await new Promise((resolve, reject) => {
        postgres.isActual(null, (err, actual) => {
          if (err) {
            reject(err)
          } else {
            resolve(actual)
          }
        })
      })
      log('is schema up to date?', schemaIsActual)

      if (!schemaIsActual) {
        log('schema needs updating')
        await postgres.autoupdate()
        log('autoupdate complete')
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
