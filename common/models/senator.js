'use strict'

const { SenateXmlParser } = require('../senate-xml-parser')



module.exports = function (Senator) {
  Senator.keyLastUpdated = 'senateUpdated'

  Senator.fetch = async function () {
    const url = process.env.SENATORS_SOURCE_URL || 'https://www.senate.gov/general/contact_information/senators_cfm.xml'
    const parser = new SenateXmlParser(url)
    await parser.download()
    return parser.parse()
  }

  Senator.fetchUpdates = async function () {
    const { Legislator } = Senator.app.models
    return Legislator.fetchUpdates(Senator)
  }
}
