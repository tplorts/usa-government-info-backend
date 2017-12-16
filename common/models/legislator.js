'use strict'


module.exports = function (Legislator) {
  Legislator.toString = s => `${s.givenName} ${s.surname} ${s.party}-${s.state}`
}
