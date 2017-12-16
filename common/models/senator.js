'use strict'

const { SenateXmlParser } = require('../senate-xml-parser')



module.exports = function (Senator) {
  Senator.keyLastUpdated = 'senateUpdated'
  Senator.sourceUrl = process.env.SENATORS_SOURCE_URL || 'https://www.senate.gov/general/contact_information/senators_cfm.xml'
  Senator.Parser = SenateXmlParser

  const GovModel = () => Senator.app.models.GovModel

  Senator.submitRawData = data => GovModel().submitRawData(Senator, data)
  Senator.get = () => GovModel().get(Senator)
  Senator.fetch = () => GovModel().fetch(Senator)
  Senator.fetchUpdates = () => GovModel().fetchUpdates(Senator)

  Senator.make = async function (record) {
    return Senator.create(record)
  }
}
