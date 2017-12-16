'use strict'

const { HouseScraper } = require('../house-scraper')

const { log } = console

const CommitteeInstances = {}


module.exports = function (Representative) {
  Representative.keyLastUpdated = 'houseUpdated'
  Representative.sourceUrl = process.env.REPRESENTATIVES_SOURCE_URL || 'https://www.house.gov/representatives'
  Representative.Parser = HouseScraper

  const GovModel = () => Representative.app.models.GovModel
  const Legislator = () => Representative.app.models.Legislator


  Representative.submitRawData = data => GovModel().submitRawData(Representative, data)
  Representative.get = () => GovModel().get(Representative)
  Representative.fetch = () => GovModel().fetch(Representative)
  Representative.fetchUpdates = () => GovModel().fetchUpdates(Representative)


  Representative.make = async function (record) {
    const representative = await Representative.create(record)
    const { committees } = record
    if (committees) {
      await Promise.all(committees.map(c => representative.addCommitteeByName(c)))
    }
    return representative
  }


  Representative.observe('before delete', async (ctx) => {
    const { where } = ctx
    try {
      const deletees = await Representative.find({ where })
      await Promise.all(deletees.map(rep => rep.removeAllCommittees()))
    } catch (err) {
      log('error removing related committees from representative', where, err)
    }
  })


  Representative.prototype.removeAllCommittees = async function () {
    const committees = await this.committees.find()
    return Promise.all(committees.map(c => this.committees.remove(c)))
  }


  Representative.prototype.addCommitteeByName = async function (committeeName) {
    const { HouseCommittee } = Representative.app.models

    let committee
    if (committeeName in CommitteeInstances) {
      committee = CommitteeInstances[committeeName]
    } else {
      const committeeData = { name: committeeName }
      // const createResult = await HouseCommittee.findOrCreate(committeeData)
      // committee = createResult[0]
      committee = await HouseCommittee.findOne({ where: committeeData })
      CommitteeInstances[committeeName] = committee
    }

    // if (!committee) {
    //   committee = await HouseCommittee.create(committeeData)
    //   log('created committee', committee)
    // }

    return committee ? this.committees.add(committee) : null
  }


  Representative.toString = r => `${Legislator().toString(r)} ${r.district}`
}
