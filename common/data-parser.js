const httpRequest = require('request-promise-native')
const { JSDOM } = require('jsdom')
const { xml2js } = require('xml-js')
const { camelCase: toCamelCase } = require('change-case')
const { envBoolean } = require('./helpers')

const { log } = console


// const UserAgent = process.env.DATA_PARSER_USER_AGENT || 'request'
// const Origin = process.env.DATA_PARSER_ORIGIN || 'https://usa-government-info-backend.herokuapp.com'
const UseAnyOrigin = envBoolean('USE_ANY_ORIGIN')


class DataParser {
  constructor (url, options = { useAnyOrigin: false }) {
    this.sourceUrl = url
    this.rawData = null
    this.useAnyOrigin = !!(UseAnyOrigin && options.useAnyOrigin)
    log(`DataParser for ${this.downloadUrl()}`)
  }

  downloadUrl () {
    return this.useAnyOrigin ? `http://anyorigin.com/get?url=${this.sourceUrl}` : this.sourceUrl
  }

  async download () {
    const result = await httpRequest.get(this.downloadUrl())
    this.rawData = this.useAnyOrigin ? JSON.parse(result).contents : result
  }

  parse (rawData) {
    if (rawData) {
      this.rawData = rawData
    }
  }
}



class DataScraper extends DataParser {
  constructor (...args) {
    super(...args)
    this.document = null
  }

  textContent (element) {
    return element.textContent.trim()
  }

  initDocument () {
    const { document } = (new JSDOM(this.rawData)).window
    this.document = document
    return document
  }

  parse (rawData) {
    super.parse(rawData)
    this.initDocument()
  }
}



class XmlDataParser extends DataParser {
  constructor (...args) {
    super(...args)
    this.xmlDataObject = null
    this.keyConversions = {}
    this.valueTransforms = {}
  }

  parse (rawData) {
    super.parse(rawData)
    this.xmlDataObject = xml2js(this.rawData)
  }

  xmlElementToObject (rootElement, fieldExtractors = {}) {
    const obj = {}
    const { elements } = rootElement
    for (const element of elements) {
      let key = toCamelCase(element.name)
      if (key in this.keyConversions) {
        key = this.keyConversions[key]
      }
      if (key) {
        let field = null
        if (key in fieldExtractors) {
          const fieldExtractor = fieldExtractors[key]
          if (fieldExtractor) {
            field = fieldExtractor(element)
          }
        } else {
          field = this.extractSingleText(key, element)
        }
        if (field !== null) {
          obj[key] = field
        }
      }
    }
    return obj
  }

  extractSingleText (key, rootElement) {
    const { elements } = rootElement
    if (!elements) {
      return null
    }
    const N = elements.length
    if (N !== 1) {
      throw new Error(`expected one element for "${key}" but got ${N}: ${JSON.stringify(elements)}`)
    }
    const [ element ] = elements
    const { type } = element
    if (type !== 'text') {
      throw new Error(`expected field "${key}" to be text type but got ${type}`, element)
    }
    const value = element.text.trim()
    const transform = this.valueTransforms[key]
    return transform ? transform(value) : value
  }
}



module.exports = {
  DataParser,
  DataScraper,
  XmlDataParser,
}
