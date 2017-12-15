'use strict'

const { HouseScraper } = require('../house-scraper')



module.exports = function (Representative) {
  Representative.keyLastUpdated = 'houseUpdated'
  Representative.Parser = HouseScraper

  const Legislator = () => Representative.app.models.Legislator

  Representative.fetch = () => Legislator().fetch(Representative)
  Representative.fetchUpdates = () => Legislator().fetchUpdates(Representative)
}
