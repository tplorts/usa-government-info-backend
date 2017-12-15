'use strict'

const { SenateXmlParser } = require('../senate-xml-parser')



module.exports = function (Senator) {
  Senator.keyLastUpdated = 'senateUpdated'
  Senator.sourceUrl = process.env.SENATORS_SOURCE_URL || 'https://www.senate.gov/general/contact_information/senators_cfm.xml'
  Senator.Parser = SenateXmlParser

  const Legislator = () => Senator.app.models.Legislator

  Senator.submitRawData = data => Legislator().submitRawData(Senator, data)
  Senator.get = () => Legislator().get(Senator)
  Senator.fetch = () => Legislator().fetch(Senator)
  Senator.fetchUpdates = () => Legislator().fetchUpdates(Senator)
}
