// Using environment variables for local environment from issue
// https://github.com/netlify/netlify-lambda/issues/118

const Dotenv = require('dotenv-webpack')

// @see https://github.com/netlify/netlify-lambda#webpack-configuration
module.exports = {
  plugins: [new Dotenv({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
  })]
}
