const { SenateVotesParser } = require('./senate-votes-parser')
const { readFileSync } = require('fs')
const { log } = console


const TestDirectory = './test-data'
const xml = readFileSync(`${TestDirectory}/vote_menu_115_1.xml`, { encoding: 'utf8' })
const parser = new SenateVotesParser()

const votes = parser.parse(xml)
log(votes)
