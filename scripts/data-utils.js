const stelace = require('./admin-sdk')
const { get, keyBy, mapValues, pick, isBoolean, unset, isEqual, isUndefined, omitBy, isNil } = require('lodash')
const pMap = require('p-map')
const pProps = require('p-props')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const { importCategories } = require('./import-categories')

const log = console.log

const objectTypes = [
  'assets',
  'assetTypes',
  'categories',
  'customAttributes',
  'messages',
  'ratings',
  'tasks',
  'transactions',
  'users',
  'workflows',
]

const idTypes = objectTypes.concat([
  'conversations',
  'userMainOrganization',
])

const actions = [
  'create',
  'remove',
  'remove-and-create',
  'sync',
  'none',
]

const initDataScript = 'initDataScript'

class DataManager {
  constructor () {
    // data fetched via Stelace API
    this.existingData = {} // { objectType: [objects] } // except for the objectType 'config'

    // data keyed by alias that was used as reference ID in seed file
    this.referencedData = {} // { objectType: { alias: object } }

    // created or updated data are stored in this object
    this.syncedData = {} // { objectType: { alias: object } }

    // data loaded from seed file
    this.data = {} // { objectType: { alias: payload } }

    this.shouldOnlyRemoveScriptObjects = true
    this.shouldUpdateConfig = true
    this.objectsAction = {
      default: 'remove-and-create'
    }
  }

  /**
   * @param {Object}  [options]
   * @param {Boolean} [options.shouldOnlyRemoveScriptObjects = true] - only remove objects created by this script
   * @param {Boolean} [options.shouldUpdateConfig = true] - update Stelace config
   * @param {Object}  [options.objectsAction] - for each objects collection, specify an action to apply
   * @param {String}  [options.objectsAction[type]]
   *   allowed values: 'create', 'remove', 'remove-and-create', 'none'
   *     - 'create': create objects for this object type according to seed file
   *     - 'remove': remove all objects for this object type if `shouldOnlyRemoveScriptObjects` is false, only script objects if true
   *     - 'remove-and-create': perform creation and removal for this object type
   *     - 'sync': this action is like 'remove-and-create',
   *               the difference is that is will update existing objects instead of removing and re-creating them
   *               each object has a seed file key as alias that will be used to determine map back to seed objects
   *     - 'none': nothing will happen for this object type
   * @param {String}  [options.objectsAction.default = 'remove-and-create'] - default action for all object types,
   *   unless there is a specific type action
   */
  setDeployStrategy ({ shouldOnlyRemoveScriptObjects, shouldUpdateConfig, objectsAction } = {}) {
    if (isBoolean(shouldOnlyRemoveScriptObjects)) this.shouldOnlyRemoveScriptObjects = shouldOnlyRemoveScriptObjects
    if (isBoolean(shouldUpdateConfig)) this.shouldUpdateConfig = shouldUpdateConfig

    const allowedTypes = objectTypes.concat(['default'])
    const allowedSyncObjectTypes = ['workflows']

    if (objectsAction) {
      for (const type of Object.keys(objectsAction)) {
        if (!allowedTypes.includes(type)) throw new Error(`Invalid type: ${type}`)

        const action = objectsAction[type]
        if (!actions.includes(action)) throw new Error(`Invalid objects action: ${action}`)

        if (action === 'sync' && !allowedSyncObjectTypes.includes(type)) {
          throw new Error(`Sync action is allowed only for: ${allowedSyncObjectTypes.join(', ')}`)
        }
      }

      this.objectsAction = Object.assign({ default: 'remove-and-create' }, objectsAction)
    }
  }

  async fetchExistingData () {
    this.existingData = await pProps({
      assets: stelace.assets.list({ nbResultsPerPage: 100 }),
      assetTypes: stelace.assetTypes.list({ nbResultsPerPage: 100 }),
      categories: stelace.categories.list({ nbResultsPerPage: 100 }),
      config: {},
      customAttributes: stelace.customAttributes.list(),
      messages: stelace.messages.list({ nbResultsPerPage: 100 }),
      ratings: stelace.ratings.list({ nbResultsPerPage: 100 }),
      tasks: stelace.tasks.list({ nbResultsPerPage: 100 }),
      transactions: stelace.transactions.list({ nbResultsPerPage: 100 }),
      users: stelace.users.list({ nbResultsPerPage: 100 }),
      workflows: stelace.workflows.list(),
    })
    this.syncedData = mapValues(this.existingData, () => ({}))
    this.referencedData = mapValues(this.existingData, objects => keyBy(objects, getObjectAlias))
  }

  /**
   * Load data from seed file
   * @param {Boolean} createNotFoundFile - if the seed file doesn't exist, create it
   */
  loadSeedData (createNotFoundFile = true) {
    if (!fs.existsSync(path.join(__dirname, 'data.js'))) {
      if (createNotFoundFile) {
        log('Creating data.js file from data.example.js')
        execSync('cp scripts/data.example.js scripts/data.js')
      } else {
        throw new Error('data.js file not found')
      }
    }

    this.data = require('./data')
  }

  async deployData () {
    await this.deployAssetTypes()
    await this.deployCategories()
    await this.deployCustomAttributes()
    await this.deployWorkflows()
    await this.deployTasks()
    await this.deployUsers()
    await this.deployAssets()
    await this.deployTransactions()
    await this.deployMessages()
    await this.deployRatings()

    await this.deployConfig()
  }

  async removeExistingData () {
    // Order matters
    // group objects that can be removed at the same time (parallel processing)
    const orderedObjectTypes = [
      ['transactions'],
      [
        'ratings',
        'messages',
        'assets',
        'workflows',
        'tasks',
      ],
      [
        'users',
        'customAttributes',
      ],
      [
        'categories',
        'assetTypes'
      ],
    ]

    for (const objectTypes of orderedObjectTypes) {
      await pMap(objectTypes, (type) => {
        // cannot remove transactions, so we cancel them instead
        if (type === 'transactions') return this.cancelTransactions()
        else if (type === 'users') return this.removeUsers()
        else return this.removeObjects(type)
      }, { concurrency: 2 })
    }
  }

  _shouldCreateObjects (type) {
    const creationActions = ['create', 'remove-and-create']

    if (this.objectsAction[type]) return creationActions.includes(this.objectsAction[type])
    else if (this.objectsAction.default) return creationActions.includes(this.objectsAction.default)
    else return false
  }

  _shouldRemoveObjects (type) {
    const removalActions = ['remove', 'remove-and-create']

    if (this.objectsAction[type]) return removalActions.includes(this.objectsAction[type])
    else if (this.objectsAction.default) return removalActions.includes(this.objectsAction.default)
    else return false
  }

  _shouldSyncObjects (type) {
    if (this.objectsAction[type]) return this.objectsAction[type] === 'sync'
    else if (this.objectsAction.default) return this.objectsAction.default === 'sync'
    else return false
  }

  /**
   * If the ID value is a seed reference, try to replace it by the real object ID
   * If this ID cannot be found, then the id is returned as is
   * @param {String}   type
   * @param {String}   id
   * @param {Function} [handler(id)] - called only if the real identifier is found
   * @return {String}
   */
  _getRealIdentifier (type, id, handler) {
    const hashType = {
      conversations: {
        prefix: 'conversations::',
        getId: (obj, key) => obj.messages[key] && obj.messages[key].conversationId
      },
      userMainOrganization: {
        prefix: 'users.mainOrganization::',
        getId: (obj, key) => obj.users[key] && Object.keys(obj.users[key].organizations)[0]
      },
    }

    if (!idTypes.includes(type)) throw new Error(`Unknown type: ${type}`)

    const config = hashType[type] || {}

    const prefix = config.prefix || `${type}::`
    const defaultGetId = (obj, key) => obj[type][key] && obj[type][key].id

    let realId
    if (typeof id === 'string' && id.startsWith(prefix)) {
      const key = id.slice(prefix.length)

      const getRealId = typeof config.getId === 'function' ? config.getId : defaultGetId
      realId = getRealId(this.referencedData, key) || getRealId(this.syncedData, key)
    }

    const returnedId = realId || id // if there is no found real identifier, keep the old one

    if (typeof handler === 'function' && realId) handler(realId)
    return returnedId
  }

  _getExistingObject (type, alias) {
    return this.existingData[type].find(o => {
      return isCreatedBySeedScript(o) && getObjectAlias(o) === alias
    })
  }

  // ///////////////////// //
  // DEPLOY DATA FUNCTIONS //
  // ///////////////////// //

  async deployAssetTypes () {
    if (!this._shouldCreateObjects('assetTypes')) return
    if (!this.data.assetTypes) return

    for (const key in this.data.assetTypes) {
      const payload = this.data.assetTypes[key]
      const alias = key

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.assetTypes[key] = await stelace.assetTypes.create(payload)
    }
  }

  async deployConfig () {
    if (!this.shouldUpdateConfig) return
    if (!this.data.config || !this.data.config.default) return

    const payload = this.data.config.default
    const existingConfig = await stelace.config.read(payload)

    await stelace.config.update(payload)

    // Keep Asset Types in Config if when not deleting all objects
    // since some preserved Assets can rely on these Asset Types.
    const existingAssetTypesConfig = get(existingConfig, 'stelace.instant.assetTypes', {})
    const existingAssetTypeIdsToKeep = this.shouldOnlyRemoveScriptObjects
      ? this.existingData.assetTypes
        .map(a => a.id)
      : []

    const assetTypesConfig = get(this.data.config.default, 'stelace.instant.assetTypes')
    if (assetTypesConfig) {
      const assetTypesIds = Object.keys(assetTypesConfig).concat()
      assetTypesIds.forEach(assetTypeId => {
        const assetTypeConfig = assetTypesConfig[assetTypeId]

        this._getRealIdentifier('assetTypes', assetTypeId, realId => {
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
    const searchOptions = get(this.data.config.default, 'stelace.instant.searchOptions')
    if (searchOptions) {
      const newSearchOptions = {
        modes: {}
      }

      const searchModes = Object.keys(searchOptions.modes)
      searchModes.forEach(searchMode => {
        const config = searchOptions.modes[searchMode]

        const newAssetTypesIds = config.assetTypesIds.map(assetTypeId => {
          let id = assetTypeId
          this._getRealIdentifier('assetTypes', assetTypeId, realId => { id = realId })
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

  async deployCategories () {
    if (!this._shouldCreateObjects('categories')) return

    if (this.data.categories) {
      for (const key in this.data.categories) {
        const payload = this.data.categories[key]
        const alias = key

        const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
        payload.metadata = metadata

        this.syncedData.categories[key] = await stelace.categories.create(payload)
      }
    }

    const categoriesToCreate = await importCategories(path.join(__dirname, 'categories.csv'))
    if (categoriesToCreate.length) {
      const categoriesByReference = {}

      for (const cat of categoriesToCreate) {
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
        this.syncedData.categories[cat._label] = newCategory
        categoriesByReference[cat._reference] = newCategory
      }
    }
  }

  async deployCustomAttributes () {
    if (!this._shouldCreateObjects('customAttributes')) return
    if (!this.data.customAttributes) return

    for (const key in this.data.customAttributes) {
      const payload = this.data.customAttributes[key]
      const alias = key

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.customAttributes[key] = await stelace.customAttributes.create(payload)
    }
  }

  async deployWorkflows () {
    if (!this._shouldCreateObjects('workflows') && !this._shouldSyncObjects('workflows')) return
    if (!this.data.workflows) return

    for (const key in this.data.workflows) {
      const payload = this.data.workflows[key]
      const alias = key

      const computed = payload.computed || {}
      for (const k in computed) {
        const value = payload.computed[k]
        if (typeof value === 'string') {
          const valueBetweenQuotes = getValueBetweenQuotes(value)
          if (valueBetweenQuotes) {
            payload.computed[k] = `"${this._getRealIdentifier('assetTypes', valueBetweenQuotes)}"`
            payload.computed[k] = `"${this._getRealIdentifier('categories', valueBetweenQuotes)}"`
            payload.computed[k] = `"${this._getRealIdentifier('customAttributes', valueBetweenQuotes)}"`
          }
        }
      }

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      if (this._shouldSyncObjects('workflows')) {
        const existingWorkflow = this._getExistingObject('workflows', alias)

        const valuesToCompare = [
          'name',
          'description',
          'event',
          'context',
          'computed',
          'run'
        ]

        if (!existingWorkflow) {
          this.syncedData.workflows[key] = await stelace.workflows.create(payload)
        } else if (hasObjectChanged(existingWorkflow, payload, valuesToCompare)) {
          this.syncedData.workflows[key] = await stelace.workflows.update(existingWorkflow.id, payload)
        }
      } else {
        this.syncedData.workflows[key] = await stelace.workflows.create(payload)
      }
    }
  }

  async deployTasks () {
    if (!this._shouldCreateObjects('tasks')) return
    if (!this.data.tasks) return

    for (const key in this.data.tasks) {
      const alias = key
      const payload = this.data.tasks[key]
      if (!payload) return // skip falsy payload

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.tasks[key] = await stelace.tasks.create(payload)
    }
  }

  async deployUsers () {
    if (!this._shouldCreateObjects('users')) return
    if (!this.data.users) return

    const keys = Object.keys(this.data.users)
    for (const key of keys) {
      const payload = this.data.users[key]
      const alias = key

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      const categoryId = get(payload, 'metadata.instant.categoryId')
      if (categoryId) payload.metadata.instant.categoryId = this._getRealIdentifier('categories', categoryId)

      this.syncedData.users[key] = await stelace.users.create(payload)
    }

    // wait for user workflows to complete
    await new Promise(resolve => setTimeout(resolve, 1000))

    const usersIds = keys.map(key => this.syncedData.users[key].id)

    const users = await stelace.users.list({
      id: usersIds,
      nbResultsPerPage: 100
    })

    const usersById = keyBy(users, 'id')
    keys.forEach(key => {
      this.syncedData.users[key] = usersById[this.syncedData.users[key].id]
    })
  }

  async deployAssets () {
    if (!this._shouldCreateObjects('assets')) return
    if (!this.data.assets) return

    for (const key in this.data.assets) {
      const payload = this.data.assets[key]
      const alias = key

      payload.ownerId = this._getRealIdentifier('users', payload.ownerId)
      payload.ownerId = this._getRealIdentifier('userMainOrganization', payload.ownerId)
      payload.categoryId = this._getRealIdentifier('categories', payload.categoryId)
      payload.assetTypeId = this._getRealIdentifier('assetTypes', payload.assetTypeId)

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.assets[key] = await stelace.assets.create(payload)
    }
  }

  async deployTransactions () {
    if (!this._shouldCreateObjects('transactions')) return
    if (!this.data.transactions) return

    for (const key in this.data.transactions) {
      const payload = this.data.transactions[key]
      const alias = key

      payload.assetId = this._getRealIdentifier('assets', payload.assetId)
      payload.takerId = this._getRealIdentifier('users', payload.takerId)

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.transactions[key] = await stelace.transactions.create(payload)
    }
  }

  async deployMessages () {
    if (!this._shouldCreateObjects('messages')) return
    if (!this.data.messages) return

    for (const key in this.data.messages) {
      const payload = this.data.messages[key]
      const alias = key

      payload.topicId = this._getRealIdentifier('assets', payload.topicId)
      payload.topicId = this._getRealIdentifier('transactions', payload.topicId)
      payload.senderId = this._getRealIdentifier('users', payload.senderId)
      payload.receiverId = this._getRealIdentifier('users', payload.receiverId)
      payload.conversationId = this._getRealIdentifier('conversations', payload.conversationId)

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.messages[key] = await stelace.messages.create(payload)
    }
  }

  async deployRatings () {
    if (!this._shouldCreateObjects('ratings')) return
    if (!this.data.ratings) return

    for (const key in this.data.ratings) {
      const payload = this.data.ratings[key]
      const alias = key

      payload.authorId = this._getRealIdentifier('users', payload.authorId)
      payload.targetId = this._getRealIdentifier('users', payload.targetId)
      payload.assetId = this._getRealIdentifier('assets', payload.assetId)
      payload.transactionId = this._getRealIdentifier('transactions', payload.transactionId)

      const metadata = Object.assign({}, payload.metadata, { initDataScript, alias })
      payload.metadata = metadata

      this.syncedData.ratings[key] = await stelace.ratings.create(payload)
    }
  }

  // ///////////////////// //
  // REMOVE DATA FUNCTIONS //
  // ///////////////////// //

  async removeObjects (type, data) {
    if (!this._shouldRemoveObjects(type) && !this._shouldSyncObjects(type)) return

    let objects = Array.isArray(data) ? data : this.existingData[type]

    for (const object of objects) {
      if (!this.shouldOnlyRemoveScriptObjects || isCreatedBySeedScript(object)) {
        if (type === 'categories') {
          const childrenCategories = objects.filter(c => c.parentId === object.id)
          await this.removeObjects(type, childrenCategories)
          // Avoid deleting too many times
          objects = objects.filter(c => c.parentId !== object.id)
        }

        const alias = getObjectAlias(object)
        let shouldRemove = true

        // if sync, remove any object whose alias isn't present in the seed file
        if (this._shouldSyncObjects(type)) {
          const seedAliases = getSeedAliases(this.data[type])
          shouldRemove = !alias || !seedAliases.includes(alias)
        }

        if (shouldRemove) {
          await removeObject(object.id)
          unset(this.referencedData, `${type}.${alias}`)
        }
      }
    }

    async function removeObject (id) {
      await stelace[type].remove(id)
      log(`removed ${id}`)
    }
  }

  async removeUsers () {
    if (!this._shouldRemoveObjects('users')) return

    for (const user of this.existingData.users) {
      if (!this.shouldOnlyRemoveScriptObjects || isCreatedBySeedScript(user)) {
        const organizationsIds = Object.keys(user.organizations)
        const organizations = await stelace.users.list({ id: organizationsIds })
        const organizationsById = keyBy(organizations, 'id')

        for (const organizationId of organizationsIds) {
          await stelace.users.remove(organizationId)

          const organization = organizationsById[organizationId]
          if (organization) {
            const alias = getObjectAlias(organization)
            unset(this.referencedData, `users.${alias}`)
          }
          log(`removed ${organizationId}`)
        }

        await stelace.users.remove(user.id)
        const alias = getObjectAlias(user)
        unset(this.referencedData, `users.${alias}`)
        log(`removed ${user.id}`)
      }
    }
  }

  async cancelTransactions () {
    if (!this._shouldRemoveObjects('transactions')) return

    for (const transaction of this.existingData.transactions) {
      if (!this.shouldOnlyRemoveScriptObjects || isCreatedBySeedScript(transaction)) {
        await stelace.transactions.createTransition(transaction.id, { name: 'cancel', data: { cancellationReason: 'forceCancel' } })

        const alias = getObjectAlias(transaction)
        unset(this.referencedData, `transactions.${alias}`)
        log(`cancelled ${transaction.id}`)
      }
    }
  }
}

function getValueBetweenQuotes (str) {
  if (typeof str !== 'string') return null

  const quotesRegex = /^["'](.+)["']$/
  const matched = str.match(quotesRegex)

  return matched ? matched[1] : null
}

function getObjectAlias (object) {
  return get(object, 'metadata.alias')
}

function isCreatedBySeedScript (object) {
  return !!object.metadata[initDataScript]
}

function hasObjectChanged (existingObject, payload, props) {
  props = props || Object.keys(payload)

  // compare key by key instead filtering whole object by specified props
  // so if seed payload specified less props than the existing object
  // the object won't be updated
  return props.reduce((changed, k) => {
    return changed || (!isEqual(existingObject[k], payload[k]) && !isUndefined(payload[k]))
  }, false)
}

function getSeedAliases (dataObjects) {
  return Object.keys(omitBy(dataObjects, isNil))
}

module.exports = {
  initDataScript,

  DataManager,
}
