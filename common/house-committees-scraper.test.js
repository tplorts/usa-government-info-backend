const { HouseCommitteesScraper } = require('./house-committees-scraper')
const { readFileSync } = require('fs')
const { log } = console


const TestDirectory = './test-data'
const text = readFileSync(`${TestDirectory}/Committees_House.gov.html`, { encoding: 'utf8' })
const parser = new HouseCommitteesScraper()

const items = parser.parse(text)

log(items)
