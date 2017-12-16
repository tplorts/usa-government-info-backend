const { DataScraper } = require('./data-parser')
const { camelCase: toCamelCase } = require('change-case')
const UsaRegions = require('./usa-regions.json')



const RegionAbbreviations = {}
for (const region of UsaRegions) {
  RegionAbbreviations[region.name] = region.abbreviation
}



class HouseScraper extends DataScraper {
  constructor (url) {
    super(url, { useAnyOrigin: false })
    this.fieldKeys = null
    this.representatives = null

    this.cellParsers = {
      name: e => this.parseNameCell(e),
      phone: e => this.parsePhoneCell(e),
      committeeAssignment: e => this.parseCommitteeCell(e),
    }
  }

  parseNameCell (element) {
    let text = this.textContent(element)
    const anchor = element.querySelector('a')
    const extra = {}
    if (text.endsWith(' - Vacancy')) {
      extra.isVacant = true
      text = text.split('-')[0]
    }
    const names = text.split(',')
    return {
      surname: names[0].trim(),
      givenName: names[1].trim(),
      websiteUrl: anchor.href,
      ...extra,
    }
  }

  parsePhoneCell (element) {
    return {
      phoneNumber: this.textContent(element).replace(/[^\d]/g, ''),
    }
  }

  parseCommitteeCell (element) {
    return {
      committees: Array.from(element.querySelectorAll('li')).map(e => this.textContent(e)),
    }
  }


  defaultCellParser (key, element) {
    const obj = {}
    obj[key] = this.textContent(element)
    return obj
  }

  parseCell (key, cell) {
    const cellParser = this.cellParsers[key]
    return cellParser ? cellParser(cell) : this.defaultCellParser(key, cell)
  }
  scrapeRow (state, row) {
    let rep = { state }
    const cells = row.querySelectorAll('td')
    let i = 0
    for (const key of this.fieldKeys) {
      rep = {
        ...rep,
        ...this.parseCell(key, cells[i++]),
      }
    }
    return rep
  }

  parse (rawData) {
    super.parse(rawData)
    const byState = this.document.querySelector('#by-state')
    const stateTables = byState.querySelectorAll('table')
    const keyFromHeader = header => toCamelCase(this.textContent(header))
    this.fieldKeys = Array.from(stateTables[0].querySelectorAll('thead th')).map(keyFromHeader)

    const representatives = []

    for (const table of stateTables) {
      const regionName = this.textContent(table.querySelector('caption'))
      const region = RegionAbbreviations[regionName] || regionName
      const repRows = Array.from(table.querySelectorAll('tbody tr'))
      const reps = repRows.map(row => this.scrapeRow(region, row))
      representatives.push(...reps)
    }

    this.representatives = representatives
    return this.representatives
  }
}



module.exports = {
  HouseScraper,
}
