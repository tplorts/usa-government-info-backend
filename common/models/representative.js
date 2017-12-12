'use strict'

const { HouseScraper } = require('../house-scraper')



module.exports = function (Representative) {
  Representative.fetch = async function () {
    const url = process.env.REPRESENTATIVES_SOURCE_URL || 'https://www.house.gov/representatives'
    const scraper = new HouseScraper(url)
    await scraper.download()
    return scraper.scrape()
    // log(scraper.representatives.filter(rep => rep.state === 'RI'))
    // return scraper.representatives
  }

  // const identifyingFields = [
  //   'state',
  //   'district',
  //   'surname',
  //   'givenName',
  //   'websiteUrl',
  //   'party',
  //   'officeRoom',
  //   'phoneNumber',
  //   'isVacant',
  // ]

  Representative.fetchUpdates = async function () {
    const { Legislator } = Representative.app.models
    return Legislator.fetchUpdates(Representative)
  }
}
