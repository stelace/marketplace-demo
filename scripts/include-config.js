/*
 * Config, Asset Types and Custom Attributes are included in app bundle
 * for better performance, since these resources are blocking in several ways,
 * impacting Home and Search pages.
 * Categories are not included in bundle as there can be many of these.
 */

const { initStelaceSdk } = require('./sdk')

const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

const chalk = require('chalk')
const log = console.log
const success = str => log(`\n${chalk.green(str)}\n`)
const warn = (err, msg) => {
  if (msg) log(chalk.yellow(msg))
  if (err) log(err)
}

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
})

const apiBaseURL = process.env.STELACE_API_URL
const apiKey = process.env.STELACE_PUBLISHABLE_API_KEY

const stelace = initStelaceSdk({ apiBaseURL, apiKey })
// Don’t delay build for too long if network fails
stelace.setTimeout(10000)

const commonPath = path.join(__dirname, '../src/store/common')
const configPath = path.join(commonPath, 'config-copy.json')
const assetTypesPath = path.join(commonPath, 'asset-types-copy.json')
const customAttributesPath = path.join(commonPath, 'custom-attributes-copy.json')

run()
  .then(() => success('API Config, Asset Types and Custom Attributes copied for build'))
  .catch(createEmptyFiles)

async function run () {
  const fetchCustomAttributesPage = (...args) => stelace.customAttributes.list(...args)

  const [
    config,
    assetTypes,
    customAttributes
  ] = await Promise.all([
    stelace.config.read(),
    stelace.assetTypes.list(),
    fetchAllResults(fetchCustomAttributesPage),
  ])

  await Promise.all([
    writeFile(configPath, JSON.stringify(config), 'utf8'),
    writeFile(assetTypesPath, JSON.stringify(assetTypes), 'utf8'),
    writeFile(customAttributesPath, JSON.stringify(customAttributes), 'utf8'),
  ])
}

function createEmptyFiles (err) {
  warn(err, '\nError when fetching Config, Asset Types and Custom Attributes for build:\n')
  log('\nBlocking API calls will be required when browsing to the app, increasing loading time.\n\n')
  return Promise.all([
    writeFile(configPath, JSON.stringify({}), 'utf8'),
    writeFile(assetTypesPath, JSON.stringify([]), 'utf8'),
    writeFile(customAttributesPath, JSON.stringify([]), 'utf8')
  ])
}

// TODO: remove this once auto-pagination is implemented in SDK
// We don’t want to install esm to `import` this single function from src/utils
async function fetchAllResults (fetchFn, params = {}) {
  const nbResultsPerPage = 100
  let page = 1
  const allResults = []
  let results

  do {
    const passedParameters = Object.assign({}, params, { page, nbResultsPerPage })
    results = await fetchFn(passedParameters)
    page += 1

    allResults.push(...results)
  } while (results.paginationMeta.nbPages > results.paginationMeta.page)

  return allResults
}
