import { get, values, groupBy } from 'lodash'

export function populateAsset ({ asset, usersById, categoriesById, assetTypesById }) {
  const newAsset = Object.assign({}, asset)
  newAsset.owner = usersById[asset.ownerId]
  newAsset.category = categoriesById[asset.categoryId]
  newAsset.assetType = assetTypesById[asset.assetTypeId]

  newAsset.categoryName = get(newAsset, 'category.name')

  newAsset.locationName = get(newAsset, 'locations[0].shortDisplayName')

  newAsset.timeUnit = get(newAsset, 'assetType.timing.timeUnit', '')

  newAsset.ownerLink = { name: 'publicProfile', params: { id: newAsset.ownerId } }

  return newAsset
}

export function isAvailable ({ asset, availabilityGraphByAssetId, availabilitiesById }) {
  if (!asset || !asset.id) return false

  const { totalUsedQuantity } = availabilityGraphByAssetId[asset.id] || {}
  if (!Number.isFinite(totalUsedQuantity)) return false

  const availabilitiesByAssetId = groupBy(values(availabilitiesById), 'assetId')

  const availabilities = availabilitiesByAssetId[asset.id] || []
  const availability = availabilities[0]

  const isAvailability = availability && availability.quantity > 0
  if (isAvailability) {
    return totalUsedQuantity < availability.quantity
  } else {
    return totalUsedQuantity < asset.quantity
  }
}
