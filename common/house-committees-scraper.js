const { DataScraper } = require('./data-parser')



class HouseCommitteesScraper extends DataScraper {
  constructor (url) {
    super(url, { useAnyOrigin: false })
    this.committees = null
  }

  parse (rawData) {
    super.parse(rawData)
    const items = this.document.querySelectorAll('#main-content-section article section ul li')
    this.committees = Array.from(items).map(e => this.extractCommittee(e))
    return this.committees
  }

  extractCommittee (element) {
    const anchor = element.querySelector('a')
    return {
      name: this.textContent(anchor),
      websiteUrl: anchor.href,
    }
  }
}



module.exports = {
  HouseCommitteesScraper,
}
