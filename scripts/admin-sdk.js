const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

require('dotenv').config({
  path: `.env.${env}`
})

const { initStelaceSdk } = require('../src/utils/init-sdk')

const apiBaseURL = process.env.STELACE_API_URL

// This secret key should be used to initialize/update data and content in API.
// Please use it only in secure environments.
const apiKey = process.env.STELACE_SECRET_API_KEY

const stelace = initStelaceSdk({ apiBaseURL, apiKey })

module.exports = stelace
