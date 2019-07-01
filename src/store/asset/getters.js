import { populateAsset, isAvailable } from 'src/utils/asset'

export function activeAsset (state, getters, rootState) {
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

  return populateAsset({
    asset: activeAsset,
    usersById: { [selectedUser.id]: selectedUser },
    categoriesById,
    assetTypesById
  })
}

export function usersAssets (state, getters, rootState) {
  const {
    usersAssets
  } = state
  const {
    categoriesById,
    assetTypesById
  } = rootState.common

  const usersIds = Object.keys(usersAssets)

  return usersIds.reduce((populatedUsersAssets, userId) => {
    const assets = usersAssets[userId] || []

    populatedUsersAssets[userId] = assets.map(asset => {
      return populateAsset({
        asset,
        usersById: {},
        categoriesById,
        assetTypesById
      })
    })
    return populatedUsersAssets
  }, {})
}

export function isActiveAssetAvailable (state) {
  const asset = state.activeAsset
  const availabilityGraphByAssetId = state.availabilityGraphByAssetId
  const availabilitiesById = state.availabilitiesById

  return isAvailable({ asset, availabilityGraphByAssetId, availabilitiesById })
}
