'use strict'

const { log } = console


module.exports = function (app) {
  log('________________________________')
  log('schedule data updates')

  const { Legislator } = app.models
  Legislator.scheduleUpdates()
}
