'use strict'

const { log } = console

module.exports = async function (app, next) {
  log('________________________________')
  log('update legislator data if needed')

  const EnvUpdate = process.env.UPDATE_LEGISLATORS_ON_BOOT
  const isUpdateEnabled = !!(EnvUpdate && EnvUpdate === 'true')

  const { Legislator, Senator, Representative } = app.models

  try {
    if (isUpdateEnabled) {
      await Promise.all([ Senator, Representative ].map(Model => Legislator.updateIfNeeded(Model)))
    }
    next()
  } catch (err) {
    next(err)
  }
}
