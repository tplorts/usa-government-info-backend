'use strict'
const { envBoolean } = require('../../common/helpers')

const { log } = console



module.exports = async function (app, next) {
  log('________________________________')
  log('update legislator data if needed')

  const isUpdateEnabled = envBoolean('UPDATE_LEGISLATORS_ON_BOOT')
  const { GovModel, Senator, Representative, HouseCommittee } = app.models

  try {
    if (isUpdateEnabled) {
      await GovModel.updateIfNeeded(HouseCommittee)
      await GovModel.updateIfNeeded(Senator)
      await GovModel.updateIfNeeded(Representative)
    }
    next()
  } catch (err) {
    next(err)
  }
}
