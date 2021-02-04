const { initStelaceSdk } = require('./sdk')

const dotenv = require('dotenv')
const i18nCompile = require('i18n-compile')
const markdownIt = require('markdown-it')
const pMap = require('p-map')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const readDir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)

const script = require('commander')
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
stelace.setTimeout(5000)

const md = markdownIt({
  html: false, // Keep this set to 'false' to disable HTML tags in source and prevent XSS
  breaks: false, // Adds <br> when finding '\n'
  linkify: false, // Auto-convert URL-like text to links
  typographer: false, // language-neutral replacement + quotes beautification
})

script
  .option('-v, --verbose', 'Show API changes for each website entry')
  .parse(process.argv)

const { verbose } = script.opts()

i18nCompile(
  [
    path.join(__dirname, '../src/i18n/source/*.yaml'),
    path.join(__dirname, '../src/i18n/theme/*.yaml')
  ],
  path.join(__dirname, '../src/i18n/build/[lang].json'),
  { langPlace: '[lang]' }
)

const { collection, defaultFilePrefix, emailFilePrefix } = require('./translationEntriesParams')
// We’re not merging Content API entries into these email and defaults files,
// but just in `website` collection files that we use in Vue app
// to avoid waiting for a content API call on app load to show fresh contents
const filesNotToMergePrefixes = [defaultFilePrefix, emailFilePrefix]
i18nCompile(
  [
    path.join(__dirname, '../src/i18n/source/*.yaml'),
    path.join(__dirname, '../src/i18n/theme/*.yaml')
  ],
  path.join(__dirname, `../src/i18n/build/${defaultFilePrefix}[lang].json`),
  { langPlace: '[lang]' }
)
i18nCompile(
  [path.join(__dirname, '../src/i18n/email/*.yaml')],
  path.join(__dirname, `../src/i18n/build/${emailFilePrefix}[lang].json`),
  { langPlace: '[lang]' }
)

/**
 * Make local JSON files compatible with Stelace Content Entry API format:
 * - render every markdown content value of which key should end with "[markdown]",
 *   like `"some_key[markdown]": "# Markdown content header"`, to an object such as
 *   "some_key": {
 *      "editable": "# Markdown content header",
 *      "transform": "markdown",
 *      "transformed": "<h1>Markdown content header</h1>" // rendered HTML
 *     }
 * - flatten nested objects in entry fields to dot-namespaced keys
 *   like `{ "pages": { "home.some_key": "…" } }`
 */
async function run () {
  const translationsPath = path.join(__dirname, '../src/i18n/build/')
  const translationFiles = await readDir(translationsPath)
  const apiEntries = await stelace.entries.list({ collection })
    .catch(err => warn(err, '\nError when fetching apiEntries\n\n')) || []

  log('')
  await pMap(translationFiles, async tr => {
    const filePath = path.join(translationsPath, tr)
    const file = await readFile(filePath, 'utf8')
    const locale = tr.split('.')[0]

    const localEntries = transformAndFlatten(JSON.parse(file, locale))

    if (!filesNotToMergePrefixes.some(p => tr.startsWith(p))) {
      apiEntries.filter(e => e.locale === locale).forEach(e => {
        if (verbose) {
          const changes = listUpdatedFields(e, localEntries[e.name])
          if (changes.length) log(`\n📝 New "${e.name}" entry contents:\n `, changes.join('\n'), '\n')
        }
        localEntries[e.name] = Object.assign({}, localEntries[e.name], e.fields)
      })
    }

    await writeFile(filePath, JSON.stringify(localEntries), 'utf8')
  }, { concurrency: 4 })

  return translationFiles.length
}

run()
  .then(nbFiles => success(`Success: ${nbFiles} translation files built`))
  .catch(warn)

function transformAndFlatten (data) {
  let result = {}
  flattenObj(data)

  function flattenObj (current, prop = '', level = 0) {
    const transformObject = /\[markdown\]$/.test(prop)
    if (transformObject) { // this block must come first
      setResult(prop.replace('[markdown]', ''), {
        editable: current,
        transform: 'markdown',
        // Note that rendered content is wrapped in a block tag <p> if needed.
        // We are not using md.renderInline to avoid this as we want to render block tags such as <h1>
        transformed: md.render(current)
      })
    } else if (Object(current) !== current) { // either string, number, boolean or null in JSON
      if (level === 0) {
        throw new Error(`${prop} translation can’t be at root and must be nested in an entry object`)
      }
      setResult(prop, current)
    } else if (Array.isArray(current)) {
      if (current.length === 0) setResult(prop, [])
      for (let i = 0; i < current.length; i++) flattenObj(current[i], `${prop}.${i}`, level + 1)
    } else {
      let isEmpty = true
      for (const p in current) {
        isEmpty = false
        if (!prop) setResult(p, {})
        flattenObj(current[p], prop ? `${prop}.${p}` : p, level + 1)
      }
      if (isEmpty) setResult(prop, {})
    }

    function setResult (prop, value) {
      const [entry, ...fieldParts] = prop.split('.')
      // preserve entry names as first-level keys
      if (prop && level >= 2) result[entry][fieldParts.join('.')] = value
      else if (prop) result[prop] = value
      else result = value
    }
  }

  return result
}

function listUpdatedFields (apiEntry, localEntry) {
  return _.reduce(apiEntry.fields, (changes, value, field) => {
    const currentField = _.get(localEntry, field)
    const hasFieldChanged = !currentField || (
      _.has(value, 'transformed') && _.has(value, 'transformed') // e.g. markdown source content
        ? currentField.transformed !== value.transformed
        : currentField !== value
    )
    if (hasFieldChanged) {
      changes.push(`\n- ${field}\n  ${_.get(value, 'editable', value)}`)
    }
    return changes
  }, [])
}
