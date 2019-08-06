const stelace = require('./admin-sdk')
const { every, get, isEmpty, keyBy, mapValues, pick } = require('lodash')
const pMap = require('p-map')
const pProps = require('p-props')
const chalk = require('chalk')
const inquirer = require('inquirer')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const { importCategories } = require('./import-categories')

const log = console.log
const warn = (err, msg) => {
  if (msg) log(chalk.yellow(msg))
  if (err) log(err)
}
const prompt = inquirer.createPromptModule()
let answers

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

const initDataScript = 'initDataScript'
// Useful to avoid removing objects not created by this script (use false value with caution)
let shouldOnlyRemoveScriptObjects = true

let existingData
let createdData

async function run () {
  existingData = await pProps({
    assets: stelace.assets.list({ nbResultsPerPage: 100 }),
    assetTypes: stelace.assetTypes.list({ nbResultsPerPage: 100 }),
    categories: stelace.categories.list({ nbResultsPerPage: 100 }),
    config: {}, // will be updated any way
    customAttributes: stelace.customAttributes.list(),
    messages: stelace.messages.list({ nbResultsPerPage: 100 }),
    ratings: stelace.ratings.list({ nbResultsPerPage: 100 }),
    transactions: stelace.transactions.list({ nbResultsPerPage: 100 }),
    users: stelace.users.list({ nbResultsPerPage: 100 }),
    workflows: stelace.workflows.list(),
  })
  createdData = mapValues(existingData, () => ({}))
  const hasExistingData = !every(existingData, isEmpty)

  log('')
  answers = await prompt([
    {
      type: 'list',
      name: 'delete',
      message: 'Existing objects detected',
      choices: [
        {
          name: `Delete only objects previously created and marked by this script.`,
          value: 'marked',
          short: `Delete ${initDataScript} objects only`
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

  const removeCategoriesAndAssetTypes = shouldOnlyRemoveScriptObjects ? isEmpty(hasExistingData.assets) : true
  if (answers.delete === 'all') {
    shouldOnlyRemoveScriptObjects = false
  } else if (!removeCategoriesAndAssetTypes) {
    log('\nYou may want to remove old Categories and Asset Types manually.')
  }

  log(chalk.cyan.bold('\nStarting script…'))

  if (!fs.existsSync(path.join(__dirname, 'data.js'))) {
    log('Creating data.js file from data.example.js')
    execSync('cp scripts/data.example.js scripts/data.js')
  }
  const data = require('./data')

  // Order matters
  await cancelTransactions() // cannot remove transactions, so we cancel them instead
  await pMap([
    'ratings',
    'messages',
    'assets',
    'workflows'
  ], removeObjects, { concurrency: 2 })
  await pMap([
    removeUsers(),
    removeObjects('customAttributes')
  ], _ => _, { concurrency: 2 })
  if (removeCategoriesAndAssetTypes) {
    // categories and assetTypes created by this script may have been used
    // by objects created elsewhere that are not being removed
    await pMap([
      'categories',
      'assetTypes'
    ], removeObjects, { concurrency: 2 })
  }

  if (data.assetTypes) {
    const keys = Object.keys(data.assetTypes)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.assetTypes[key]

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.assetTypes[key] = await stelace.assetTypes.create(payload)
    }
  }
  if (data.config && data.config.default) {
    const payload = data.config.default
    const existingConfig = await stelace.config.read(payload)

    await stelace.config.update(payload)

    // Keep Asset Types in Config if when not deleting all objects
    // since some preserved Assets can rely on these Asset Types.
    const existingAssetTypesConfig = get(existingConfig, 'stelace.instant.assetTypes', {})
    const existingAssetTypeIdsToKeep = shouldOnlyRemoveScriptObjects
      ? existingData.assetTypes
        .map(a => a.id)
      : []

    const assetTypesConfig = get(data.config.default, 'stelace.instant.assetTypes')
    if (assetTypesConfig) {
      const assetTypesIds = Object.keys(assetTypesConfig).concat()
      assetTypesIds.forEach(assetTypeId => {
        const assetTypeConfig = assetTypesConfig[assetTypeId]

        getRealIdentifier('assetType', assetTypeId, realId => {
          assetTypesConfig[realId] = assetTypeConfig
          delete assetTypesConfig[assetTypeId]
        })
      })

      Object.assign(assetTypesConfig, pick(existingAssetTypesConfig, existingAssetTypeIdsToKeep))

      // clean existing config, we have to clean because of API object merging strategy
      await stelace.config.update({
        stelace: {
          instant: {
            assetTypes: null
          }
        }
      })
      await stelace.config.update({
        stelace: {
          instant: {
            assetTypes: assetTypesConfig
          }
        }
      })
    }

    const existingSearchOptions = get(existingConfig, 'stelace.instant.searchOptions', {})
    const searchOptions = get(data.config.default, 'stelace.instant.searchOptions')
    if (searchOptions) {
      const newSearchOptions = {
        modes: {}
      }

      const searchModes = Object.keys(searchOptions.modes)
      searchModes.forEach(searchMode => {
        const config = searchOptions.modes[searchMode]

        const newAssetTypesIds = config.assetTypesIds.map(assetTypeId => {
          let id = assetTypeId
          getRealIdentifier('assetType', assetTypeId, realId => { id = realId })
          return id
        })

        newSearchOptions.modes[searchMode] = Object.assign({}, config, {
          assetTypesIds: newAssetTypesIds
        })

        if (Array.isArray(get(existingSearchOptions, `modes.${searchMode}.assetTypesIds`))) {
          newSearchOptions.modes[searchMode].assetTypesIds.push(
            ...existingSearchOptions.modes[searchMode].assetTypesIds
              .filter(id => existingAssetTypeIdsToKeep.includes(id))
          )
        }
      })

      // clean existing config, we have to clean because of API object merging strategy
      await stelace.config.update({
        stelace: {
          instant: {
            searchOptions: null
          }
        }
      })
      await stelace.config.update({
        stelace: {
          instant: {
            searchOptions: newSearchOptions
          }
        }
      })
    }
  }
  if (data.categories) {
    const keys = Object.keys(data.categories)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.categories[key]

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.categories[key] = await stelace.categories.create(payload)
    }
  }
  const categoriesToCreate = await importCategories(path.join(__dirname, 'categories.csv'))
  if (categoriesToCreate.length) {
    const categoriesByReference = {}

    for (let cat of categoriesToCreate) {
      const payload = {
        name: cat.name,
      }

      if (cat._parentId) {
        const parentCategory = categoriesByReference[cat._parentId]
        payload.parentId = parentCategory.id
      }

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      const newCategory = await stelace.categories.create(payload)
      createdData.categories[cat._label] = newCategory
      categoriesByReference[cat._reference] = newCategory
    }
  }
  if (data.customAttributes) {
    const keys = Object.keys(data.customAttributes)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.customAttributes[key]

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.customAttributes[key] = await stelace.customAttributes.create(payload)
    }
  }
  if (data.workflows) {
    const keys = Object.keys(data.workflows)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.workflows[key]

      Object.keys(payload.computed || {}).forEach(key => {
        const value = payload.computed[key]
        if (typeof value === 'string') {
          const valueBetweenQuotes = getValueBetweenQuotes(value)
          if (valueBetweenQuotes) {
            getRealIdentifier('assetType', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
            getRealIdentifier('category', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
            getRealIdentifier('customAttribute', valueBetweenQuotes, realId => {
              payload.computed[key] = `"${realId}"`
            })
          }
        }
      })

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.workflows[key] = await stelace.workflows.create(payload)
    }
  }
  if (data.users) {
    const keys = Object.keys(data.users)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.users[key]

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      if (get(payload, 'metadata.instant.categoryId')) {
        getRealIdentifier('category', get(payload, 'metadata.instant.categoryId'), realId => {
          payload.metadata.instant.categoryId = realId
        })
      }

      createdData.users[key] = await stelace.users.create(payload)
    }

    // wait for user workflows to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    const usersIds = keys.map(key => createdData.users[key].id)

    const users = await stelace.users.list({
      id: usersIds,
      nbResultsPerPage: 100
    })

    const usersById = keyBy(users, 'id')
    keys.forEach(key => {
      createdData.users[key] = usersById[createdData.users[key].id]
    })
  }
  if (data.assets) {
    const keys = Object.keys(data.assets)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.assets[key]

      getRealIdentifier('user', payload.ownerId, realId => {
        payload.ownerId = realId
      })
      getRealIdentifier('userMainOrganization', payload.ownerId, realId => {
        payload.ownerId = realId
      })
      getRealIdentifier('category', payload.categoryId, realId => {
        payload.categoryId = realId
      })
      getRealIdentifier('assetType', payload.assetTypeId, realId => {
        payload.assetTypeId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.assets[key] = await stelace.assets.create(payload)
    }
  }
  if (data.transactions) {
    const keys = Object.keys(data.transactions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.transactions[key]

      getRealIdentifier('asset', payload.assetId, realId => {
        payload.assetId = realId
      })
      getRealIdentifier('user', payload.takerId, realId => {
        payload.takerId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.transactions[key] = await stelace.transactions.create(payload)
    }
  }
  if (data.messages) {
    const keys = Object.keys(data.messages)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const payload = data.messages[key]

      getRealIdentifier('asset', payload.topicId, realId => {
        payload.topicId = realId
      })
      getRealIdentifier('transaction', payload.topicId, realId => {
        payload.topicId = realId
      })
      getRealIdentifier('user', payload.senderId, realId => {
        payload.senderId = realId
      })
      getRealIdentifier('user', payload.receiverId, realId => {
        payload.receiverId = realId
      })
      getRealIdentifier('conversation', payload.conversationId, realId => {
        payload.conversationId = realId
      })

      const metadata = Object.assign({}, payload.metadata, { initDataScript })
      payload.metadata = metadata

      createdData.messages[key] = await stelace.messages.create(payload)
    }
    if (data.ratings) {
      const keys = Object.keys(data.ratings)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const payload = data.ratings[key]

        getRealIdentifier('user', payload.authorId, realId => {
          payload.authorId = realId
        })
        getRealIdentifier('user', payload.targetId, realId => {
          payload.targetId = realId
        })
        getRealIdentifier('asset', payload.assetId, realId => {
          payload.assetId = realId
        })
        getRealIdentifier('transaction', payload.transactionId, realId => {
          payload.transactionId = realId
        })

        const metadata = Object.assign({}, payload.metadata, { initDataScript })
        payload.metadata = metadata

        createdData.ratings[key] = await stelace.ratings.create(payload)
      }
    }
  }
}

async function removeUsers () {
  for (let i = 0; i < existingData.users.length; i++) {
    const user = existingData.users[i]
    if (!shouldOnlyRemoveScriptObjects || user.metadata[initDataScript]) {
      const organizationsIds = Object.keys(user.organizations)

      for (let j = 0; j < organizationsIds.length; j++) {
        const organizationId = organizationsIds[j]
        await stelace.users.remove(organizationId)
        log(`removed ${organizationId}`)
      }

      await stelace.users.remove(user.id)
      log(`removed ${user.id}`)
    }
  }
}

async function cancelTransactions () {
  for (let i = 0; i < existingData.transactions.length; i++) {
    const transaction = existingData.transactions[i]
    if (!shouldOnlyRemoveScriptObjects || transaction.metadata[initDataScript]) {
      await stelace.transactions.createTransition(transaction.id, { name: 'cancel', data: { cancellationReason: 'forceCancel' } })
      log(`cancelled ${transaction.id}`)
    }
  }
}

async function removeObjects (type, data = null) {
  let objects = data || existingData[type]

  for (let i = 0; i < objects.length; i++) {
    const object = objects[i]
    if (!shouldOnlyRemoveScriptObjects || object.metadata[initDataScript]) {
      if (type === 'categories') {
        const childrenCategories = objects.filter(c => c.parentId === object.id)
        await removeObjects(type, childrenCategories)
        // Avoid deleting too many times
        objects = objects.filter(c => c.parentId !== object.id)
      }
      await removeObject(object.id)
    }
  }
  async function removeObject (id) {
    await stelace[type].remove(id)
    log(`removed ${id}`)
  }
}

function getValueBetweenQuotes (str) {
  if (typeof str !== 'string') return null

  const quotesRegex = /^["'](.+)["']$/
  const matched = str.match(quotesRegex)

  return matched ? matched[1] : null
}

function getRealIdentifier (type, id, handler) {
  let prefix
  let resourceNamespace
  let resourceHandler

  if (type === 'assetType') {
    prefix = 'assetTypes::'
    resourceNamespace = 'assetTypes'
  } else if (type === 'category') {
    prefix = 'categories::'
    resourceNamespace = 'categories'
  } else if (type === 'customAttribute') {
    prefix = 'customAttributes::'
    resourceNamespace = 'customAttributes'
  } else if (type === 'user') {
    prefix = 'users::'
    resourceNamespace = 'users'
  } else if (type === 'userMainOrganization') {
    prefix = 'users.mainOrganization::'
    resourceHandler = (resourceNamespace, key) => {
      return createdData.users[key] && Object.keys(createdData.users[key].organizations)[0]
    }
  } else if (type === 'asset') {
    prefix = 'assets::'
    resourceNamespace = 'assets'
  } else if (type === 'transaction') {
    prefix = 'transactions::'
    resourceNamespace = 'transactions'
  } else if (type === 'conversation') {
    prefix = 'conversations::'
    resourceHandler = (resourceNamespace, key) => {
      return createdData.messages[key] && createdData.messages[key].conversationId
    }
  } else {
    throw new Error(`Unknown type: ${type}`)
  }

  if (typeof id === 'string' && id.startsWith(prefix)) {
    const key = id.slice(prefix.length)
    let realId

    if (typeof resourceHandler === 'function') {
      realId = resourceHandler(resourceNamespace, key)
    } else {
      realId = createdData[resourceNamespace][key] && createdData[resourceNamespace][key].id
    }

    if (realId) {
      handler(realId)
    }
  }
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
