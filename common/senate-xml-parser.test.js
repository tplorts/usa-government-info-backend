const { SenateXmlParser } = require('./senate-xml-parser')
const { readFileSync } = require('fs')
const { log } = console


const TestDirectory = './test-data'
const xml = readFileSync(`${TestDirectory}/senators_cfm.xml`, { encoding: 'utf8' })
const parser = new SenateXmlParser()

const senators = parser.parse(xml)

log(senators)
