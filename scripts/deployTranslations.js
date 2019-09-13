// Stelace secret API key used will depend on current NODE_ENV
// and your .env.[development|production] files
const stelace = require('./admin-sdk')

const script = require('commander')
const pMap = require('p-map')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)

const chalk = require('chalk')
const log = console.log
const success = str => log(`\n${chalk.green(str)}`)
const warn = (err, msg) => {
  log(`\n${chalk.yellow(msg || 'Translations upload with Content API has failed.')}\n`)
  if (err) log(err)
}

// Context translations can be useful in dashboard and do not count towards API plan count of locales
let locales = ['context', process.env.VUE_APP_DEFAULT_LANGUAGE || 'en']
let allLocales = false
let ignoredLocales = []
const commaSeparatedList = value => value.split(',')
script
  .option('-a, --all', 'Deploy all translations rather than default locale only')
  .option('-l, --locales <list>', 'Deploy this comma-separated list of locales', commaSeparatedList)

script.parse(process.argv)
if (script.all === true) allLocales = true
else if (Array.isArray(script.locales)) locales = _.uniq([...script.locales, 'context'])

const {
  collection: defaultCollection,
  emailCollection,
  defaultFilePrefix,
  emailFilePrefix
} = require('./translationEntriesParams')

const stats = { created: [], updated: [] }

async function run () {
  const translationsPath = path.join(__dirname, '../src/i18n/build/') // JSON files
  const translationFiles = await readDir(translationsPath)

  // TODO: Merge this into one call once API allows array of collections
  const fetchEntriesPage = (...args) => stelace.entries.list(...args)
  const apiEntries = await fetchAllResults(fetchEntriesPage, { collection: defaultCollection })
  const emailEntries = await fetchAllResults(fetchEntriesPage, { collection: emailCollection })
  apiEntries.push(...emailEntries)

  // Sync config to enable Stelace dashboard live content editor and populate email templates
  const config = await stelace.config.read()
  const newInstantConfigAttrs = {}
  const configPlatformUrl = _.get(config, 'stelace.instant.platformUrl')
  const platformUrl = process.env.STELACE_INSTANT_WEBSITE_URL
  if (platformUrl && configPlatformUrl !== platformUrl) {
    newInstantConfigAttrs.platformUrl = platformUrl
  }
  const configServiceName = _.get(config, 'stelace.instant.serviceName')
  const serviceName = process.env.VUE_APP_SERVICE_NAME
  if (serviceName && configServiceName !== serviceName) {
    newInstantConfigAttrs.serviceName = serviceName
  }
  if (!_.isEmpty(newInstantConfigAttrs)) {
    stelace.config.update({
      stelace: { instant: newInstantConfigAttrs }
    })
    log(`Updated ${Object.keys(newInstantConfigAttrs).join(', ')} in config`)
  }

  const filesToUpload = translationFiles
    .filter(f => f.startsWith(defaultFilePrefix) || f.startsWith(emailFilePrefix))

  return pMap(filesToUpload, async (f) => {
    const filePath = path.join(translationsPath, f)
    const translations = JSON.parse(await readFile(filePath, 'utf8'))
    const isEmailFile = f.startsWith(emailFilePrefix)
    const locale = f
      .replace(emailFilePrefix, '')
      .replace(defaultFilePrefix, '')
      .split('.')[0]

    if (!allLocales && !locales.includes(locale)) {
      ignoredLocales = _.uniq([...ignoredLocales, locale])
      return
    }

    const collection = isEmailFile ? emailCollection : defaultCollection
    const entries = Object.keys(translations)

    await pMap(entries, async (n) => {
      const fields = translations[n]
      const existingEntry = apiEntries.find(
        a => a.collection === collection && a.locale === locale && a.name === n
      )
      // Just update defaults in _instant namespace for website default translations
      const updateAttrs = { metadata: { _instant: { defaults: fields } } }
      const currentDefaults = _.get(existingEntry, 'metadata._instant.defaults', {})
      const defaultChanged = !_.isEqual(fields, currentDefaults)
      let shouldUpdate = existingEntry && defaultChanged

      if (isEmailFile) {
        // Only update entry fields that are not in defaults, or still are the same as defaults
        // since we should not override fields updated with Content Entry API / dashboard
        // Note that defaults are always updated if needed
        const fieldsToUpdate = Object.keys(fields).filter(f => {
          const missing = existingEntry && !currentDefaults[f]
          const sameAsChangedDefault = existingEntry &&
            _.isEqual(existingEntry.fields[f], currentDefaults[f]) &&
            !_.isEqual(fields[f], currentDefaults[f])

          return missing || sameAsChangedDefault
        })
        if (fieldsToUpdate.length) {
          updateAttrs.fields = _.pick(fields, fieldsToUpdate)
          shouldUpdate = true
        // create entry if needed
        } else if (!existingEntry) {
          updateAttrs.fields = fields
        }
      }

      if (shouldUpdate) {
        const updated = await stelace.entries.update(existingEntry.id, updateAttrs)
        stats.updated.push(`${collection} ${locale} -> ${updated.name}`)
      } else if (!existingEntry) {
        const createAttrs = Object.assign({}, updateAttrs, { collection, locale, name: n })
        const created = await stelace.entries.create(createAttrs)
        stats.created.push(`${collection} ${locale} -> ${created.name}`)
      }
    }, { concurrency: 4 })
  })
}

run()
  .then(() => {
    success('Success:')
    log(`
${stats.created.length} entr${stats.created.length > 1 ? 'ies' : 'y'} created${
  stats.created.length ? `:\n${stats.created.join('\n')}\n\n` : '\n'
}${stats.updated.length} entr${stats.updated.length > 1 ? 'ies' : 'y'} updated${
  stats.updated.length ? ':\n' + stats.updated.join('\n') : ''
}
${ignoredLocales.length ? `Skipped ${ignoredLocales} contents.` : ''}
    `)
  })
  .catch(warn)

// TODO: remove this once auto-pagination is implemented in SDK
// We don’t want to install esm to `import` this single function from src/utils
async function fetchAllResults (fetchFn, params = {}) {
  const nbResultsPerPage = 100
  let page = 1
  let allResults = []
  let results

  do {
    const passedParameters = Object.assign({}, params, { page, nbResultsPerPage })
    results = await fetchFn(passedParameters)
    page += 1

    allResults.push(...results)
  } while (results.paginationMeta.nbPages > results.paginationMeta.page)

  return allResults
}
