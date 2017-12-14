'use strict'

const { isNil } = require('lodash')
const schedule = require('node-schedule')
const moment = require('moment-timezone')

const { log } = console



module.exports = function (Legislator) {
  function lacks (x, field) {
    return !(field in x) || isNil(x[field])
  }
  function bothLack (a, b, field) {
    return lacks(a, field) && lacks(b, field)
  }

  Legislator.fetchUpdates = async function (Model) {
    const { modelName } = Model

    const fields = []
    Model.forEachProperty(p => {
      if (p !== 'id') {
        fields.push(p)
      }
    })

    function areEqual (a, b) {
      return fields.every(field => a[field] === b[field] || bothLack(a, b, field))
    }

    const [
      downloadedRepresentatives,
      dbRepresentatives,
    ] = [
      await Model.fetch(),
      await Model.find(),
    ]

    const upToDate = []
    const savePromises = []
    for (const rep of downloadedRepresentatives) {
      const i = dbRepresentatives.findIndex(r => areEqual(r, rep))
      if (i >= 0) {
        upToDate.push(...dbRepresentatives.splice(i, 1))
      } else {
        log(`creating ${modelName} ${rep.state}-${rep.party} ${rep.givenName} ${rep.surname}`)
        savePromises.push(Model.create(rep))
      }
    }

    const idsToDelete = dbRepresentatives.map(r => r.id)
    log(`delete ${modelName}s:`, idsToDelete)
    await Model.destroyAll({ id: {inq: idsToDelete} })
    log(`finished deleting out of date ${modelName}s`)
    await Promise.all(savePromises)
    log(`finished saving ${savePromises.length} updated ${modelName}s`)

    await Legislator.setTimeLastUpdated(Model, moment())
  }


  const ServerTimezone = moment.tz.guess()
  const Eastern = 'America/New_York'
  const UpdateTime = moment.tz('5:00', 'h:m', Eastern).tz(ServerTimezone)

  function jobTimeForMoment (m) {
    return {
      hour: m.hour(),
      minute: m.minute(),
    }
  }

  Legislator.scheduleUpdates = function () {
    log(`daily update time will be ${UpdateTime.format()}`)
    Legislator.updateJob = schedule.scheduleJob(jobTimeForMoment(UpdateTime), Legislator.updateAll)
  }

  Legislator.timeLastUpdated = async function (Model) {
    const { DataState } = Legislator.app.models
    const stateKey = Model.keyLastUpdated
    return DataState.getValue(stateKey)
  }

  Legislator.setTimeLastUpdated = async function (Model, time) {
    const { DataState } = Legislator.app.models
    const stateKey = Model.keyLastUpdated
    return DataState.set(stateKey, time)
  }

  Legislator.updateIfNeeded = async function (Model) {
    let lastUpdated = await Legislator.timeLastUpdated(Model)
    if (!lastUpdated) {
      log(`No info for ${Model.keyLastUpdated}`)
      return null
    }
    log(`${Model.keyLastUpdated}: ${lastUpdated.fromNow()}`)
    const yesterday = moment().subtract(1, 'days')
    if (lastUpdated.isBefore(yesterday)) {
      log('Too stale.  Needs update.')
      return Model.fetchUpdates()
    } else {
      log('No need to update.')
      return lastUpdated
    }
  }

  Legislator.updateAll = function () {
    const { Senator, Representative } = Legislator.app.models
    for (const Model of [ Senator, Representative ]) {
      Model.fetchUpdates()
    }
  }
}
