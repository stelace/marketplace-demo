import { populateAsset } from 'src/utils/asset'
import { populateUser } from 'src/utils/user'
import { get } from 'lodash'

// used to map search config label to getters computed value
// 'getters.isPremium' will map to `rootGetters.isPremium`
const gettersPrefix = 'getters.'

export function searchRouteQuery (state) {
  const routeQuery = {}

  const searchFilters = state.searchFilters

  if (state.query) {
    routeQuery.q = state.query
  }
  if (searchFilters.page) {
    routeQuery.page = searchFilters.page
  }
  if (searchFilters.nbResultsPerPage && searchFilters.nbResultsPerPage) {
    routeQuery.nbResultsPerPage = searchFilters.nbResultsPerPage
  }
  if (searchFilters.orderBy) {
    routeQuery.orderBy = searchFilters.orderBy
  }
  if (searchFilters.order) {
    routeQuery.order = searchFilters.order
  }
  if (state.startDate) {
    routeQuery.startDate = state.startDate
  }
  if (state.endDate) {
    routeQuery.endDate = state.endDate
  }
  if (typeof state.priceRange.min === 'number') {
    routeQuery.minPrice = state.priceRange.min
  }
  if (typeof state.priceRange.max === 'number') {
    routeQuery.maxPrice = state.priceRange.max
  }
  if (state.queryLocation &&
    typeof state.latitude === 'number' &&
    typeof state.longitude === 'number'
  ) {
    routeQuery.location = state.queryLocation
    routeQuery.lat = state.latitude
    routeQuery.lon = state.longitude
  }

  return routeQuery
}

export function searchedAssets (state, getters, rootState, rootGetters) {
  const {
    assets,
    usersById
  } = state
  const {
    categoriesById,
    assetTypesById
  } = rootState.common
  const {
    ratingsStatsByTargetId,
    ratingsStatsByAssetId,
  } = rootState.rating
  const {
    currentUser,
    ratingsOptions
  } = rootGetters

  return assets.map(ast => {
    const asset = populateAsset({
      asset: ast,
      usersById,
      categoriesById,
      assetTypesById,
      ratingsStatsByAssetId,
      ratingsOptions,
    })

    if (asset.owner) {
      if (asset.owner) {
        populateUser(asset.owner, {
          ratingsStatsByTargetId,
          ratingsOptions,
          isCurrentUser: currentUser.id === asset.owner.id,
        })
      }
    }

    return asset
  })
}

export function isSearchMapVisible (state) {
  return typeof state.userShowSearchMap === 'boolean'
    ? state.userShowSearchMap
    : state.showSearchMap
}

export function searchModes (state, getters, rootState, rootGetters) {
  const searchOptions = rootGetters.searchOptions
  const currentUserRoles = get(rootGetters.currentUser, 'roles', ['public'])

  const modes = Object.keys(searchOptions.modes)

  return modes.filter(mode => {
    const isActiveFor = get(searchOptions.modes[mode], 'isActiveFor', [])

    return isActiveFor.reduce((memo, value) => {
      if (value.startsWith(gettersPrefix)) {
        const accessLabel = value.slice(gettersPrefix.length)
        return memo || rootGetters[accessLabel]
      } else {
        return memo || currentUserRoles.includes(value)
      }
    }, false)
  })
}

export function defaultSearchMode (state, getters, rootState, rootGetters) {
  const currentUserRoles = get(rootGetters.currentUser, 'roles', ['public'])
  const searchModes = rootGetters.searchModes
  const searchOptions = rootGetters.searchOptions

  let defaultMode

  defaultMode = searchModes.find(mode => {
    const isDefaultFor = get(searchOptions.modes[mode], 'isDefaultFor', [])

    return isDefaultFor.reduce((memo, value) => {
      if (value.startsWith(gettersPrefix)) {
        const accessLabel = value.slice(gettersPrefix.length)
        return memo || rootGetters[accessLabel]
      } else {
        return memo || currentUserRoles.includes(value)
      }
    }, false)
  })
  if (!defaultMode) {
    defaultMode = searchModes.find(mode => mode === 'default')
  }
  if (!defaultMode) {
    defaultMode = searchModes[0]
  }

  return defaultMode
}

export function searchModeConfig (state, getters, rootState, rootGetters) {
  return get(rootGetters.searchOptions, `modes.${rootState.search.searchMode}`)
}

export function searchAfterMapMoveActive () {
  return process.env.VUE_APP_DISABLE_AUTO_SEARCH_ON_MAP_MOVE !== 'true'
}
