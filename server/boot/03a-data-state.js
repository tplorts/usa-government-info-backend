'use strict'

const moment = require('moment')
const { log } = console

function oneWeekAgo () {
  return moment().subtract(1, 'week')
}

module.exports = async function (app, next) {
  log('________________________________')
  log('initiate missing data states')

  const { DataState, Senator, Representative } = app.models

  try {
    const promiseToInitiate = Model => DataState.initiate(Model.keyLastUpdated, oneWeekAgo, 'date')
    const states = await Promise.all([ Senator, Representative ].map(promiseToInitiate))
    //   await DataState.initiate('senateUpdated', oneWeekAgo, 'date'),
    //   await DataState.initiate('houseUpdated', oneWeekAgo, 'date'),
    // ]
    for (const {key, value} of states) {
      log(`${key}: ${value}`)
    }
    next()
  } catch (err) {
    next(err)
  }
}
