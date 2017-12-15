'use strict'

const { HouseScraper } = require('../house-scraper')



module.exports = function (Representative) {
  Representative.keyLastUpdated = 'houseUpdated'
  Representative.sourceUrl = process.env.REPRESENTATIVES_SOURCE_URL || 'https://www.house.gov/representatives'
  Representative.Parser = HouseScraper

  const Legislator = () => Representative.app.models.Legislator

  Representative.submitRawData = data => Legislator().submitRawData(Representative, data)
  Representative.get = () => Legislator().get(Representative)
  Representative.fetch = () => Legislator().fetch(Representative)
  Representative.fetchUpdates = () => Legislator().fetchUpdates(Representative)
}
