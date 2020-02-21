const fs = require('fs')
const path = require('path')

// https://docs.netlify.com/configure-builds/environment-variables
const exposedEnvVars = [
  'CONTEXT',
  'URL',
  'DEPLOY_URL',
  'DEPLOY_PRIME_URL',
  'DEPLOY_ID',
  'NETLIFY_IMAGES_CDN_DOMAIN'
]

const envVars = {}

exposedEnvVars.forEach(v => {
  if (typeof v !== 'undefined') {
    envVars[v] = process.env[v]
  }
})

const filePath = path.join(__dirname, '..', 'stored-env.js')

const data = `
// Please do note edit this file as it will be refreshed at each build.
// Edit the file scripts/save-env.js for any changes.

export const netlifyEnvVars = ${JSON.stringify(envVars, null, 2)}
`

fs.writeFileSync(filePath, data)
