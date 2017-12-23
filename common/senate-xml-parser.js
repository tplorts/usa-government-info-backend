const { XmlDataParser } = require('./data-parser')



class SenateXmlParser extends XmlDataParser {
  constructor (url) {
    super(url, { useAnyOrigin: true })
    this.senators = null
    this.keyConversions = {
      memberFull: null,
      lastName: 'surname',
      firstName: 'givenName',
      email: 'contactUrl',
      website: 'websiteUrl',
      class: 'classNumber',
    }
    this.valueTransforms = {
      phone: s => s.replace(/[^\d]/g, ''),
      classNumber: s => s.replace('Class ', '').length,
      address: s => s.replace(/\s+/g, ' '),
    }
  }

  parse (rawData) {
    super.parse(rawData)
    const [ rootElement ] = this.xmlDataObject.elements
    this.senators = rootElement.elements.map(e => this.xmlElementToObject(e)).filter(o => Object.keys(o).length > 0)
    return this.senators
  }
}

module.exports = {
  SenateXmlParser,
}
