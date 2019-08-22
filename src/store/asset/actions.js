import pMap from 'p-map'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'
import { get, isEmpty, keyBy, values } from 'lodash'

import * as searchApi from 'src/store/search/api'
import { populateAsset } from 'src/utils/asset'
import { roundUpPower10 } from 'src/utils/number'

export async function fetchLastAssets ({ dispatch, rootState, rootGetters }, { nbResults = 3 } = {}) {
  await dispatch('fetchConfig')

  const searchOptions = rootGetters.searchOptions
  const assetTypeId = get(searchOptions, 'modes.default.assetTypesIds', [])

  let filters = {
    active: true,
    validated: true,

    // won't show assets that haven't at least one quantity during the specified period
    // or after now if no dates are specified
    quantity: 1,
  }

  if (assetTypeId.length) filters.assetTypeId = assetTypeId

  const [
    assets
  ] = await Promise.all([
    searchApi.searchAssets({
      page: 1,
      nbResultsPerPage: nbResults,
      filters,
      orderBy: 'createdDate',
      order: 'desc'
    }),
    // dispatch('fetchCategories'), // uncomment if needed to populate AssetCard
    dispatch('fetchAssetTypes'), // needed for time unit
  ])

  const {
    assetTypesById,
    categoriesById,
  } = rootState.common

  return assets.map(asset => {
    return populateAsset({
      asset,
      usersById: {},
      categoriesById,
      assetTypesById
    })
  })
}

export async function initEditAssetPage ({ state, commit, dispatch }, { assetId } = {}) {
  const [
    asset,
    availabilities,
  ] = await Promise.all([
    assetId ? stelace.assets.read(assetId) : null,
    assetId ? stelace.availabilities.list({ assetId }) : [],
    dispatch('fetchCategories'),
    dispatch('fetchAssetsRelatedResources'),
  ])

  commit({
    type: types.SET_ASSET,
    asset
  })
  commit({
    type: types.SET_AVAILABILITIES,
    availabilities
  })

  return { asset }
}

// Show currentUser assets if userId is not specified
export async function fetchUserAssets ({ commit, dispatch, rootState, rootGetters }, { userId, fetchAssetAvailabilities = true } = {}) {
  const {
    categoriesById,
    assetTypesById,
  } = rootState.common

  const ownerId = userId || (rootGetters.currentUser || {})['id']

  if (!ownerId) return []

  const maxNbResultsPerPage = 100 // retrieve all assets at once

  const assets = await stelace.assets.list({ ownerId, nbResultsPerPage: maxNbResultsPerPage })

  commit({
    type: types.SET_USER_ASSETS,
    ownerId,
    assets
  })

  if (fetchAssetAvailabilities) {
    await pMap(assets, async (asset) => {
      await Promise.all([
        dispatch('fetchAvailabilities', { assetId: asset.id }),
        dispatch('fetchAvailabilityGraph', { assetId: asset.id })
      ])
    }, { concurrency: 4 }) // limit to 4 concurrent promises to not put too much load on API
  }

  return assets.map(asset => {
    return populateAsset({
      asset,
      usersById: {},
      categoriesById,
      assetTypesById
    })
  })
}

export async function getHighestPrice ({ rootState, commit }, { setPriceRange = true } = {}) {
  const assetTypeIds = rootState.search.assetTypesIds
  const params = {
    nbResultsPerPage: 1,
    orderBy: 'price',
    order: 'desc'
  }
  if (!isEmpty(assetTypeIds)) params.assetTypeId = assetTypeIds

  const assets = await stelace.assets.list(params)
  const max = get(assets, '[0].price')

  if (Number.isFinite(max) && setPriceRange) {
    commit({
      type: types.SET_PRICE_RANGE,
      min: rootState.search.priceRange.min,
      max: roundUpPower10(max),
      defaults: true
    })
  }
  return max
}

export async function createAsset ({ commit }, { attrs }) {
  const asset = await stelace.assets.create(attrs)

  commit({
    type: types.SET_ASSET,
    asset
  })

  return asset
}

export async function updateAsset ({ commit }, { assetId, attrs }) {
  const asset = await stelace.assets.update(assetId, attrs)

  commit({
    type: types.SET_ASSET,
    asset
  })

  return asset
}

export async function removeAsset ({ commit }, { assetId }) {
  await stelace.assets.remove(assetId)

  commit({
    type: types.SET_ASSET,
    asset: null
  })
}

export async function fetchAvailabilityGraph ({ state, commit }, { assetId }) {
  const availabilityGraph = await stelace.availabilities.getGraph({ assetId })

  commit({
    type: types.SET_AVAILABILITY_GRAPH,
    assetId,
    availabilityGraph
  })
}

export async function fetchAvailabilities ({ state, commit }, { assetId }) {
  const fetchAvailabilitiesRequest = (...args) => stelace.availabilities.list(...args)

  const availabilities = await fetchAllResults(fetchAvailabilitiesRequest, { assetId })

  const availabilitiesById = Object.assign({}, state.availabilitiesById, keyBy(availabilities, 'id'))

  commit({
    type: types.SET_AVAILABILITIES,
    availabilities: values(availabilitiesById)
  })

  return availabilities
}

export async function createAvailability ({ state, commit }, { attrs }) {
  const availability = await stelace.availabilities.create(attrs)

  const availabilitiesById = Object.assign({}, state.availabilitiesById)
  availabilitiesById[availability.id] = availability

  commit({
    type: types.SET_AVAILABILITIES,
    availabilities: values(availabilitiesById)
  })

  return availability
}

export async function updateAvailability ({ state, commit }, { availabilityId, attrs }) {
  const availability = await stelace.availabilities.update(availabilityId, attrs)

  const availabilitiesById = Object.assign({}, state.availabilitiesById)
  availabilitiesById[availability.id] = availability

  commit({
    type: types.SET_AVAILABILITIES,
    availabilities: values(availabilitiesById)
  })

  return availability
}
