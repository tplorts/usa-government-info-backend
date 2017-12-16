'use strict'

const { uniq } = require('lodash')
const { HouseCommitteesScraper } = require('../house-committees-scraper')


module.exports = function (HouseCommittee) {
  HouseCommittee.keyLastUpdated = 'houseCommitteesUpdated'
  HouseCommittee.sourceUrl = process.env.HOUSE_COMMITTEES_SOURCE_URL || 'https://www.house.gov/committees'
  HouseCommittee.Parser = HouseCommitteesScraper

  HouseCommittee.unique = async function () {
    const allCommittees = await HouseCommittee.find()
    return uniq(allCommittees.map(c => c.name))
  }

  const GovModel = () => HouseCommittee.app.models.GovModel

  HouseCommittee.submitRawData = data => GovModel().submitRawData(HouseCommittee, data)
  HouseCommittee.get = () => GovModel().get(HouseCommittee)
  HouseCommittee.fetch = () => GovModel().fetch(HouseCommittee)
  HouseCommittee.fetchUpdates = () => GovModel().fetchUpdates(HouseCommittee)

  HouseCommittee.make = async function (record) {
    // TODO: if there's been an update to a committee, then the relations between it and
    //       its memebers needs to be restored after deleting the old and making the new
    return HouseCommittee.create(record)
  }
}
