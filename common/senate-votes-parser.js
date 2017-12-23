const { XmlDataParser } = require('./data-parser')
const { toNumber } = require('lodash')
const moment = require('moment-timezone')



const Eastern = 'America/New_York'



class SenateVotesParser extends XmlDataParser {
  constructor (url) {
    super(url, { useAnyOrigin: true })
    this.votes = null
    this.congressYear = null
    this.voteFieldExtractors = {
      voteTally: e => this.xmlElementToObject(e),
      question: null, // TODO: will we need this?
    }
    this.rootFieldExtractors = {
      votes: null,
    }
    this.valueTransforms = {
      congress: toNumber,
      session: toNumber,
      voteNumber: toNumber,
      yeas: toNumber,
      nays: toNumber,
      voteDate: str => moment.tz(`${str} ${this.congressYear}`, 'D-MMM YYYY', Eastern).format(),
    }
  }

  parse (rawData) {
    super.parse(rawData)
    const [ rootElement ] = this.xmlDataObject.elements
    const voteElements = rootElement.elements.find(e => e.name === 'votes').elements
    const rootObject = this.xmlElementToObject(rootElement, this.rootFieldExtractors)
    const congressInfo = {
      congressNumber: rootObject.congress,
      sessionNumber: rootObject.session,
    }
    this.congressYear = rootObject.congressYear
    const extractVote = element => ({
      ...congressInfo,
      ...this.xmlElementToObject(element, this.voteFieldExtractors),
    })
    const votes = voteElements.map(extractVote)
    return votes
  }
}

module.exports = {
  SenateVotesParser,
}
