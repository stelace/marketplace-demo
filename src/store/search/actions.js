import { compact, uniqBy, pick } from 'lodash'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'
import * as api from './api'
import { date } from 'quasar'
import { populateAsset } from 'src/utils/asset'
import { populateUser } from 'src/utils/user'

export async function fetchAssetsRelatedResources ({ dispatch, state }) {
  await Promise.all([
    // dispatch('fetchCategories'), // uncomment if needed to populate AssetCards
    dispatch('fetchAssetTypes'),
    dispatch('fetchCustomAttributes'),
  ])
}

export function selectSearchMode ({ commit, rootGetters }, { searchMode }) {
  if (!searchMode) return

  const searchOptions = rootGetters.searchOptions
  const mode = searchOptions.modes[searchMode]

  if (mode) {
    commit({
      type: types.SET_SEARCH_MODE,
      searchMode,
      customAttributes: mode.customAttributes
    })
    commit({
      type: types.SEARCH__SET_ASSET_TYPES,
      assetTypesIds: mode.assetTypesIds
    })
  }
}

export async function searchAssets ({ state, rootState, rootGetters, commit, dispatch }, { resetPagination = true } = {}) {
  const {
    categoriesById,
    assetTypesById,
  } = rootState.common
  const {
    currentUser,
    ratingsOptions,
    ratingsActive,
  } = rootGetters

  if (resetPagination) {
    commit({
      type: types.SEARCH__SET_SEARCH_FILTERS,
      page: 1
    })
  }

  const searchFilters = state.searchFilters

  const assets = await api.searchAssets({
    page: searchFilters.page,
    nbResultsPerPage: searchFilters.nbResultsPerPage,
    orderBy: searchFilters.orderBy,
    order: searchFilters.order,

    maxDistance: state.useMapCenter ? state.maxDistance : state.defaultMaxDistance,
    query: state.query,
    location: !state.useMapCenter ? {
      latitude: state.latitude,
      longitude: state.longitude
    } : {
      latitude: state.mapCenterLatitude,
      longitude: state.mapCenterLongitude
    },
    filters: Object.assign({}, searchFilters.filters, {
      active: true,
      validated: true,

      // won't show assets that haven't at least one quantity during the specified period
      // or after now if no dates are specified
      quantity: 1,

      startDate: state.startDate,
      endDate: state.endDate,
      assetTypeId: state.assetTypesIds && state.assetTypesIds.length ? state.assetTypesIds : null,

      price: {
        gte: state.priceRange.min,
        lte: state.priceRange.max,
      }
    }),
    customAttributesFilters: pick(searchFilters.customAttributesFilters, state.displayCustomAttributes)
  })

  commit({
    type: types.SEARCH__SET_ASSETS,
    assets
  })
  commit({
    type: types.SEARCH__SET_PAGINATION_META,
    nbResults: assets.paginationMeta.nbResults,
    nbPages: assets.paginationMeta.nbPages
  })

  // retrieve all owners associated to assets
  const usersIds = compact(uniqBy(assets.map(asset => asset.ownerId)))

  let users = []

  if (usersIds.length) {
    const fetchUserRequest = (...args) => stelace.users.list(...args)
    users = await fetchAllResults(fetchUserRequest, { id: usersIds })

    commit({
      type: types.SEARCH__SET_USERS,
      users
    })
  }

  if (ratingsActive) {
    const assetIds = assets.map(asset => asset.id)
    await dispatch('fetchRatingsStats', { assetId: assetIds, groupBy: 'assetId' })
  }

  const {
    ratingsStatsByTargetId,
    ratingsStatsByAssetId,
  } = rootState.rating

  const populatedAssets = assets.map(ast => {
    const asset = populateAsset({
      asset: ast,
      usersById: state.usersById,
      categoriesById,
      assetTypesById,
      ratingsStatsByAssetId,
      ratingsOptions,
    })

    if (asset.owner) {
      populateUser(asset.owner, {
        ratingsStatsByTargetId,
        ratingsOptions,
        isCurrentUser: currentUser.id === asset.owner.id,
      })
    }

    return asset
  })

  return {
    assets: populatedAssets,
    users
  }
}

// Used to search on arbitrary parameters as opposed to search filters currently saved in store
export async function fetchAssets ({ state }, { query, filters, nbResults = 3 } = {}) {
  const assets = await api.searchAssets({
    query,
    filters,
    page: 1,
    nbResultsPerPage: nbResults,
    orderBy: 'createdDate',
    order: 'desc'
  })

  return assets
}

export async function fetchActiveAsset ({ state, commit, dispatch, rootGetters }, { assetId }) {
  const {
    ratingsActive,
  } = rootGetters

  const [
    categories,
    assetTypes,
    asset,
    availabilityGraph, // eslint-disable-line
    availabilities, // eslint-disable-line
    customAttributes // eslint-disable-line
  ] = await Promise.all([
    stelace.categories.list(),
    stelace.assetTypes.list(),
    stelace.assets.read(assetId),
    dispatch('fetchAvailabilityGraph', { assetId }),
    dispatch('fetchAvailabilities', { assetId }),
    dispatch('fetchCustomAttributes')
  ])

  commit({
    type: types.SET_ASSET_TYPES,
    assetTypes
  })
  commit({
    type: types.SET_CATEGORIES,
    categories
  })
  commit({
    type: types.SET_ACTIVE_ASSET,
    asset
  })

  const user = await stelace.users.read(asset.ownerId)
  commit({
    type: types.SET_SELECTED_USER,
    user
  })

  if (ratingsActive) {
    await dispatch('fetchRatingsStats', { targetId: [asset.id], groupBy: 'assetId' })
  }

  return {
    asset,
    user
  }
}

export async function updateActiveAsset ({ commit }, { assetId, attrs }) {
  const asset = await stelace.assets.update(assetId, attrs)

  commit({
    type: types.SET_ACTIVE_ASSET,
    asset
  })
}

export function setSearchParamsFromUrl ({ state, commit }, { route }) {
  const { query: routeQuery } = route

  const {
    page,
    nbResultsPerPage,
    orderBy,
    order,
    q: query,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    location: queryLocation,
    lat: latitude,
    lon: longitude
  } = routeQuery

  const searchFilters = {}

  if (page && !isNaN(page)) {
    searchFilters.page = parseInt(page, 10)
  }
  if (nbResultsPerPage && !isNaN(nbResultsPerPage)) {
    searchFilters.nbResultsPerPage = parseInt(nbResultsPerPage, 10)
  }
  if (orderBy) {
    searchFilters.orderBy = orderBy
  }
  if (order) {
    searchFilters.order = order
  }

  commit(Object.assign({}, searchFilters, {
    type: types.SEARCH__SET_SEARCH_FILTERS
  }))

  if (query) {
    commit({
      type: types.SET_SEARCH_QUERY,
      query
    })
  }

  const searchDates = { reset: true }

  if (startDate && date.isValid(startDate)) {
    searchDates.startDate = startDate
  }
  if (endDate && date.isValid(endDate)) {
    searchDates.endDate = endDate
  }

  commit(Object.assign({}, searchDates, {
    type: types.SET_SEARCH_DATES
  }))

  const priceRange = {}
  if (minPrice && !isNaN(minPrice)) {
    priceRange.min = parseInt(minPrice, 10)
  } else {
    priceRange.min = state.priceDefault.min
  }

  if (maxPrice && !isNaN(maxPrice)) {
    priceRange.max = parseInt(maxPrice, 10)
  } else {
    priceRange.max = state.priceDefault.max
  }

  commit(Object.assign({}, priceRange, {
    type: types.SET_PRICE_RANGE
  }))

  if (queryLocation &&
    latitude && !isNaN(latitude) &&
    longitude && !isNaN(longitude)
  ) {
    commit({
      type: types.SET_SEARCH_LOCATION,
      queryLocation,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    })
  }
}
