const httpRequest = require('request-promise-native')

const UserAgent = process.env.DATA_PARSER_USER_AGENT || 'request'
const Origin = process.env.DATA_PARSER_ORIGIN || 'https://usa-government-info-backend.herokuapp.com'


class DataParser {
  constructor (url) {
    this.sourceUrl = url
    this.rawData = null
  }

  async download () {
    this.rawData = await httpRequest({
      url: this.sourceUrl,
      headers: {
        'User-Agent': UserAgent,
        'Origin': Origin,
      },
    })
  }

  parse () {}
}

module.exports = {
  DataParser,
}
