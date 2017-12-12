'use strict'

const { isNil } = require('lodash')

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
    log(`finished saving updated ${modelName}s`)
  }
}
