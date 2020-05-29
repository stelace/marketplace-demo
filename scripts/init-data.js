const { every, isEmpty } = require('lodash')
const chalk = require('chalk')
const inquirer = require('inquirer')
const fs = require('fs')
const { initDataScript, DataManager } = require('./data-utils')

const log = console.log
const warn = (err, msg) => {
  if (msg) log(chalk.yellow(msg))
  if (err) log(err)
}
const prompt = inquirer.createPromptModule()
let answers

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

// Useful to avoid removing objects not created by this script (use false value with caution)
let shouldOnlyRemoveScriptObjects = true

async function run () {
  const dataManager = new DataManager()
  await dataManager.fetchExistingData()

  const existingData = dataManager.existingData
  const hasExistingData = !every(existingData, isEmpty)

  log('')
  answers = await prompt([
    {
      type: 'list',
      name: 'delete',
      message: 'Existing objects detected',
      choices: [
        {
          name: 'Delete only objects previously created and marked by this script.',
          value: 'marked',
          short: `Delete objects having metadata.${initDataScript} only`
        },
        {
          name: 'Delete all existing objects including those not created by this script.',
          value: 'all',
          short: 'Delete all objects (reset)'
        }
      ],
      when: hasExistingData,
      default: 0
    }
  ])

  if (answers.delete === 'all') {
    shouldOnlyRemoveScriptObjects = false
  }
  // categories and assetTypes created by this script may have been used
  // by objects created elsewhere that are not being removed
  const existingAssets = !isEmpty(existingData.assets)
  const existingCategoriesOrAssetTypes = ['assetTypes', 'categories']
    .some(o => !isEmpty(existingData[o]))
  if (existingCategoriesOrAssetTypes && existingAssets) {
    log('\nYou may want to remove old Categories and Asset Types manually.')
  }

  log(chalk.cyan.bold('\nStarting script…'))

  dataManager.setDeployStrategy({
    shouldOnlyRemoveScriptObjects,
    objectsAction: {
      categories: existingAssets ? 'create' : 'remove-and-create',
      assetTypes: existingAssets ? 'create' : 'remove-and-create',
    }
  })

  dataManager.loadSeedData()

  await dataManager.removeExistingData()
  await dataManager.deployData()
}

if (!fs.existsSync(`.env.${env}`)) {
  return warn(
    null,
    `\nMissing .env file. Please start with "cp .env.example .env.${env}".\n` +
      'More info is available in README.md.\n'
  )
} else if (!process.env.STELACE_SECRET_API_KEY) {
  return log(chalk.cyan.bold(
    '\nMissing STELACE_SECRET_API_KEY env variable.\n' +
      'Please head over to https://stelace.com to ask your free key.\n'
  ))
} else {
  run()
    .then(() => log(chalk.green.bold('\nSuccess\n')))
    .catch(warn)
}
