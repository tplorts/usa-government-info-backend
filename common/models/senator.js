'use strict'

const { SenateXmlParser } = require('../senate-xml-parser')



module.exports = function (Senator) {
  Senator.keyLastUpdated = 'senateUpdated'
  Senator.Parser = SenateXmlParser

  Senator.sourceUrl = function () {
    return process.env.SENATORS_SOURCE_URL || 'https://www.senate.gov/general/contact_information/senators_cfm.xml'
  }

  Senator.fetchUpdates = async function () {
    const { Legislator } = Senator.app.models
    return Legislator.fetchUpdates(Senator)
  }
}
