const { createInstance } = require('stelace')
const URL = require('url-parse')

const apiVersion = '2019-05-20'

function initStelaceSdk ({ apiBaseURL, apiKey }) {
  const stelace = createInstance({ apiKey, apiVersion })

  if (apiBaseURL) {
    const parsedUrl = new URL(apiBaseURL)

    const host = parsedUrl.hostname
    const port = parsedUrl.port
    const protocol = parsedUrl.protocol.slice(0, -1)

    stelace.setHost(host, port, protocol)
  }

  return stelace
}

module.exports = {
  initStelaceSdk
}
