import { populateAsset, isAvailable } from 'src/utils/asset'

export function activeAsset (state, getters, rootState, rootGetters) {
  const {
    activeAsset
  } = state
  const {
    categoriesById,
    assetTypesById
  } = rootState.common
  const {
    selectedUser
  } = rootState.user
  const {
    ratingsStatsByAssetId
  } = rootState.rating
  const {
    ratingsOptions,
  } = rootGetters

  return populateAsset({
    asset: activeAsset,
    usersById: { [selectedUser.id]: selectedUser },
    categoriesById,
    assetTypesById,
    ratingsStatsByAssetId,
    ratingsOptions,
  })
}

export function usersAssets (state, getters, rootState, rootGetters) {
  const {
    usersAssets
  } = state
  const {
    categoriesById,
    assetTypesById
  } = rootState.common
  const {
    ratingsStatsByAssetId
  } = rootState.rating
  const {
    ratingsOptions,
  } = rootGetters

  const usersIds = Object.keys(usersAssets)

  return usersIds.reduce((populatedUsersAssets, userId) => {
    const assets = usersAssets[userId] || []

    populatedUsersAssets[userId] = assets.map(asset => {
      return populateAsset({
        asset,
        usersById: {},
        categoriesById,
        assetTypesById,
        ratingsStatsByAssetId,
        ratingsOptions,
      })
    })
    return populatedUsersAssets
  }, {})
}

export function isActiveAssetAvailable (state) {
  const asset = state.activeAsset
  const availabilityGraphByAssetId = state.availabilityGraphByAssetId

  return isAvailable({ asset, availabilityGraphByAssetId })
}

export function displayAssetDistance () {
  return process.env.VUE_APP_DISPLAY_ASSET_DISTANCE === 'true'
}
