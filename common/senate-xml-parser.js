const { DataParser } = require('./data-parser')
const { xml2js } = require('xml-js')
const { camelCase: toCamelCase } = require('change-case')



const keyConversions = {
  memberFull: null,
  lastName: 'surname',
  firstName: 'givenName',
  email: 'contactUrl',
  website: 'websiteUrl',
  class: 'classNumber',
}

const valueTransforms = {
  phone: s => s.replace(/[^\d]/g, ''),
  classNumber: s => s.replace('Class ', '').length,
  address: s => s.replace(/\s+/g, ' '),
}

function condenseSenatorField (key, elements) {
  const N = elements.length
  if (N !== 1) {
    throw new Error(`expected one element per senator field; got ${N} for "${key}"`)
  }
  const [ element ] = elements
  const { type } = element
  if (type !== 'text') {
    throw new Error(`expected senator field "${key}" to be text type; got ${type}`)
  }
  const value = element.text.trim()
  const transform = valueTransforms[key]
  return transform ? transform(value) : value
}

function condenseSenator (elements) {
  const senator = {}
  for (const element of elements) {
    let key = toCamelCase(element.name)
    if (key in keyConversions) {
      key = keyConversions[key]
    }
    if (key) {
      senator[key] = condenseSenatorField(key, element.elements)
    }
  }
  return senator
}


class SenateXmlParser extends DataParser {
  constructor (url) {
    super(url, { useAnyOrigin: true })
    this.senators = null
  }

  parse (rawData) {
    super.parse(rawData)
    const senateInfo = xml2js(this.rawData)
    const [ rootElement ] = senateInfo.elements
    this.senators = rootElement.elements.map(e => condenseSenator(e.elements)).filter(o => Object.keys(o).length > 0)
    return this.senators
  }
}

module.exports = {
  SenateXmlParser,
}
