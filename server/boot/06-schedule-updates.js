'use strict'

const { log } = console


module.exports = function (app) {
  log('________________________________')
  log('schedule data updates')

  const { GovModel } = app.models
  GovModel.scheduleUpdates()
}
