const { DataParser } = require('./data-parser')
const { JSDOM } = require('jsdom')
const { camelCase: toCamelCase } = require('change-case')
const { RegionAbbreviations } = require('./usa-regions')



function textContent (element) {
  return element.textContent.trim()
}


function parseNameCell (element) {
  let text = textContent(element)
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

function parsePhoneCell (element) {
  return {
    phoneNumber: textContent(element).replace(/[^\d]/g, ''),
  }
}

function parseCommitteeCell (element) {
  return {
    committees: Array.from(element.querySelectorAll('li')).map(textContent),
  }
}

const CellParsers = {
  name: parseNameCell,
  phone: parsePhoneCell,
  committeeAssignment: parseCommitteeCell,
}

function defaultCellParser (key, element) {
  const obj = {}
  obj[key] = textContent(element)
  return obj
}

function parseCell (key, cell) {
  const cellParser = CellParsers[key]
  return cellParser ? cellParser(cell) : defaultCellParser(key, cell)
}


class HouseScraper extends DataParser {
  constructor (url) {
    super(url)
    this.fieldKeys = null
    this.representatives = null
  }

  scrapeRow (state, row) {
    let rep = { state }
    const cells = row.querySelectorAll('td')
    let i = 0
    for (const key of this.fieldKeys) {
      rep = {
        ...rep,
        ...parseCell(key, cells[i++]),
      }
    }
    return rep
  }

  parse () {
    const { document } = (new JSDOM(this.rawData)).window
    const byState = document.querySelector('#by-state')
    const stateTables = byState.querySelectorAll('table')
    const keyFromHeader = header => toCamelCase(textContent(header))
    this.fieldKeys = Array.from(stateTables[0].querySelectorAll('thead th')).map(keyFromHeader)

    const representatives = []

    for (const table of stateTables) {
      const regionName = textContent(table.querySelector('caption'))
      const abbrev = RegionAbbreviations[regionName]
      const region = abbrev || regionName
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
