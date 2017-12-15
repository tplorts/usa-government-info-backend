'use strict'

const { HouseScraper } = require('../house-scraper')



module.exports = function (Representative) {
  Representative.keyLastUpdated = 'houseUpdated'
  Representative.Parser = HouseScraper

  Representative.sourceUrl = function () {
    return process.env.REPRESENTATIVES_SOURCE_URL || 'https://www.house.gov/representatives'
  }

  Representative.fetchUpdates = async function () {
    const { Legislator } = Representative.app.models
    return Legislator.fetchUpdates(Representative)
  }
}
