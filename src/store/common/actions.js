import { debounce, values } from 'lodash'
import stelace from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'
import { date } from 'quasar'

const maxNetworkResourceDelay = 5000 // calls debounced up to this value
const expirationDuration = {
  minutes: -30
}

export async function initApp ({ dispatch, rootGetters }) {
  await Promise.all([
    dispatch('fetchConfig'),
  ])

  await dispatch('selectSearchMode', { searchMode: rootGetters.defaultSearchMode })
}

export async function fetchCategories ({ state, commit }, { forceRefresh = false } = {}) {
  const shouldFetchResults = forceRefresh || isPastExpirationDate(state.categoriesLastFetchedDate)

  if (!shouldFetchResults) return values(state.categoriesById)

  commit({ type: types.SET_FETCHING_CATEGORIES })

  const categories = await stelace.categories.list()

  commit({
    type: types.SET_CATEGORIES,
    categories
  })
  commit({
    type: types.SET_FETCHING_CATEGORIES,
    fetching: false
  })

  return categories
}

export async function fetchAssetTypes ({ state, commit }, { forceRefresh = false } = {}) {
  const shouldFetchResults = forceRefresh || isPastExpirationDate(state.assetTypesLastFetchedDate)

  if (!shouldFetchResults) return values(state.assetTypesById)

  const assetTypes = await stelace.assetTypes.list()

  commit({
    type: types.SET_ASSET_TYPES,
    assetTypes
  })

  return assetTypes
}

export async function fetchCustomAttributes ({ state, commit }, { forceRefresh = false } = {}) {
  const shouldFetchResults = forceRefresh || isPastExpirationDate(state.customAttributesLastFetchedDate)

  if (!shouldFetchResults) return values(state.customAttributesById)

  const customAttributes = await stelace.customAttributes.list()

  commit({
    type: types.SET_CUSTOM_ATTRIBUTES,
    customAttributes
  })

  return customAttributes
}

export async function fetchRoles ({ state, commit }, { forceRefresh = false } = {}) {
  const shouldFetchResults = forceRefresh || isPastExpirationDate(state.rolesLastFetchedDate)

  if (!shouldFetchResults) return values(state.rolesById)

  const roles = await stelace.roles.list()

  commit({
    type: types.SET_ROLES,
    roles
  })

  return roles
}

export const fetchConfig = debounce(async function ({ state, commit }, { forceRefresh = false } = {}) {
  const shouldFetchResults = forceRefresh || isPastExpirationDate(state.configLastFetchedDate)

  if (!shouldFetchResults) return state.config

  const config = await stelace.config.read()

  commit({
    type: types.SET_CONFIG,
    config
  })

  return config
}, maxNetworkResourceDelay, { leading: true, trailing: false })

// Please refer to quasar date docs for timeObject details
function isPastExpirationDate (iso, timeObject = expirationDuration) {
  return !iso || iso < date.addToDate(new Date(), timeObject).toISOString()
}

export async function sendCustomEvent ({ commit }, { type, objectId, metadata }) {
  await stelace.events.create({
    type,
    objectId,
    metadata
  })
}
