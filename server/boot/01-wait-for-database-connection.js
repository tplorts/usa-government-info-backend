'use strict'

const { log } = console


module.exports = function (app, next) {
  log('________________________________')
  log('waiting for database connection')
  app.dataSources.postgres.on('connected', err => next(err))
}
