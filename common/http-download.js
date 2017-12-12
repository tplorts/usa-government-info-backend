const http = require('http')
const https = require('https')
const { URL } = require('url')



async function httpDownload (url, expectContentType) {
  const _url = new URL(url)
  const SupportedProtocols = {
    'http:': http,
    'https:': https,
  }
  const { protocol } = _url
  if (!(protocol in SupportedProtocols)) {
    throw new Error(`Unsupported transfer protocol: ${protocol}`)
  }
  const httpModule = SupportedProtocols[protocol]

  return new Promise((resolve, reject) => {
    httpModule.get(url, (res) => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      let error
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`)
      } else if (!new RegExp(`^${expectContentType}`).test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected ${expectContentType} but received ${contentType}`)
      }
      if (error) {
        console.error(error.message)
        // consume response data to free up memory
        res.resume()
        return reject(error)
      }

      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        try {
          // const parsedData = JSON.parse(rawData);
          // console.log(parsedData);
          resolve(rawData)
        } catch (e) {
          console.error(e.message)
          reject(e)
        }
      })
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`)
      reject(e)
    })
  })
}


module.exports = {
  httpDownload,
}
