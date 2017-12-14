'use strict'

const { HouseScraper } = require('../house-scraper')



module.exports = function (Representative) {
  Representative.keyLastUpdated = 'houseUpdated'

  Representative.fetch = async function () {
    const url = process.env.REPRESENTATIVES_SOURCE_URL || 'https://www.house.gov/representatives'
    const scraper = new HouseScraper(url)
    await scraper.download()
    return scraper.scrape()
  }

  Representative.fetchUpdates = async function () {
    const { Legislator } = Representative.app.models
    return Legislator.fetchUpdates(Representative)
  }
}
