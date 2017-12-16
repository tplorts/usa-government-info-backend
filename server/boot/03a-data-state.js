'use strict'

const moment = require('moment')
const { log } = console

function oneWeekAgo () {
  return moment().subtract(1, 'week').format()
}

module.exports = async function (app, next) {
  log('________________________________')
  log('check data states')

  const { DataState, GovModel } = app.models

  try {
    const promiseToInitiate = Model => DataState.initiate(Model.keyLastUpdated, oneWeekAgo, 'date')
    const states = await Promise.all(GovModel.SourcedModels().map(promiseToInitiate))
    for (const {key, value} of states) {
      log(`${key}: ${moment(value).fromNow()} [${value}]`)
    }
    next()
  } catch (err) {
    next(err)
  }
}
