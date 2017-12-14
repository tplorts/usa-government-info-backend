'use strict'

const { log } = console

module.exports = async function (app, next) {
  log('________________________________')
  log('update legislator data if needed')

  const { Legislator, Senator, Representative } = app.models

  try {
    await Promise.all([ Senator, Representative ].map(Model => Legislator.updateIfNeeded(Model)))
    next()
  } catch (err) {
    next(err)
  }
}
