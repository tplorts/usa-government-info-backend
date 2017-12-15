const httpRequest = require('request-promise-native')
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

  parse (rawData) {}
}

module.exports = {
  DataParser,
}
