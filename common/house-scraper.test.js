const { HouseScraper } = require('./house-scraper')
const { readFileSync } = require('fs')
const { log } = console


const TestDirectory = './test-data'
const text = readFileSync(`${TestDirectory}/house.gov.html`, { encoding: 'utf8' })
const parser = new HouseScraper()

const reps = parser.parse(text)

log(reps)
