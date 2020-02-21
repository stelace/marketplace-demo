/* eslint-disable no-console */
const path = require('path')
const { spawn } = require('child_process')
const { flow } = require('lodash')

const dotEnvFilePath = path.join(__dirname, '../../', '.env.development')

require('dotenv').config({ path: dotEnvFilePath })

const { VUE_APP_STRIPE_PUBLISHABLE_KEY } = process.env

const startNetlifyLambda = !!VUE_APP_STRIPE_PUBLISHABLE_KEY

const bufferToString = data => Buffer.from(data).toString()

// save resources consumption by starting Netlify Lambda only when needed
if (startNetlifyLambda) {
  const serve = spawn('netlify-lambda', ['serve', '--config', './netlify/webpack.functions.js', 'netlify/functions'])
  serve.stdout.on('data', flow(bufferToString, console.log))
  serve.stderr.on('data', flow(bufferToString, console.error))
} else {
  // use a dummy process if Netlify Lambda isn't started
  // otherwise, interrupting via Ctrl+C will keep running processes from package.json script `yarn dev`
  for (;;) { // infinite loop
    spawn('sleep', ['60'])
  }
}
