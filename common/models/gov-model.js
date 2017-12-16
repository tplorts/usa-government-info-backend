'use strict'

const { isNil } = require('lodash')
const schedule = require('node-schedule')
const moment = require('moment-timezone')

const { log } = console

const ServerTimezone = moment.tz.guess()
const Eastern = 'America/New_York'
const UpdateTime = moment.tz('5:00', 'h:m', Eastern).tz(ServerTimezone)



function jobTimeForMoment (m) {
  return {
    hour: m.hour(),
    minute: m.minute(),
  }
}

function lacks (x, field) {
  return !(field in x) || isNil(x[field])
}
function bothLack (a, b, field) {
  return lacks(a, field) && lacks(b, field)
}



module.exports = function (GovModel) {
  const SourcedModelNames = [ 'HouseCommittee', 'Representative', 'Senator' ]
  GovModel.SourcedModels = () => SourcedModelNames.map(n => GovModel.app.models[n])

  const DataState = () => GovModel.app.models.DataState


  GovModel.get = async function (Model) {
    return {
      sourceUrl: Model.sourceUrl,
      results: await Model.find(),
      lastUpdated: await GovModel.timeLastUpdated(Model),
    }
  }

  GovModel.fetch = async function (Model) {
    const parser = new Model.Parser(Model.sourceUrl)
    await parser.download()
    return parser.parse()
  }

  GovModel.fetchUpdates = async function (Model) {
    return GovModel.runUpdates(Model, () => GovModel.fetch(Model))
  }

  GovModel.submitRawData = function (Model, data) {
    return GovModel.runUpdates(Model, () => new Model.Parser().parse(data))
  }

  GovModel.runUpdates = async function (Model, newDataFn) {
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
      downloadedRecords,
      databaseRecords,
    ] = [
      await newDataFn(),
      await Model.find(),
    ]

    const upToDate = []
    const savePromises = []
    for (const record of downloadedRecords) {
      const i = databaseRecords.findIndex(r => areEqual(r, record))
      if (i >= 0) {
        upToDate.push(...databaseRecords.splice(i, 1))
      } else {
        log(`creating ${modelName} ${record.state}-${record.party} ${record.givenName} ${record.surname}`)
        savePromises.push(Model.make(record))
      }
    }

    const idsToDelete = databaseRecords.map(r => r.id)
    log(`delete ${modelName}s:`, idsToDelete)
    await Model.destroyAll({ id: {inq: idsToDelete} })
    log(`finished deleting out of date ${modelName}s`)
    await Promise.all(savePromises)
    log(`finished saving ${savePromises.length} updated ${modelName}s`)

    await GovModel.setTimeLastUpdated(Model, moment().format())
  }

  GovModel.scheduleUpdates = function () {
    log(`daily update time will be ${UpdateTime.format()}`)
    GovModel.updateJob = schedule.scheduleJob(jobTimeForMoment(UpdateTime), GovModel.updateAll)
  }

  GovModel.timeLastUpdated = Model => DataState().getValue(Model.keyLastUpdated)
  GovModel.setTimeLastUpdated = (Model, time) => DataState().set(Model.keyLastUpdated, time)

  GovModel.updateIfNeeded = async function (Model) {
    let lastUpdated = await GovModel.timeLastUpdated(Model)
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

  GovModel.updateAll = async function () {
    const { Senator, Representative, HouseCommittee } = GovModel.app.models
    await HouseCommittee.fetchUpdates()
    for (const Model of [ Senator, Representative ]) {
      Model.fetchUpdates()
    }
  }
}
