'use strict'

const { SenateXmlParser } = require('../senate-xml-parser')



module.exports = function (Senator) {
  Senator.keyLastUpdated = 'senateUpdated'
  Senator.Parser = SenateXmlParser

  const Legislator = () => Senator.app.models.Legislator

  Senator.fetch = () => Legislator().fetch(Senator)
  Senator.fetchUpdates = () => Legislator().fetchUpdates(Senator)
}
